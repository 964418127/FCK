/**
 * 生成层：一句话 → 追问 → 编排树。只有一条路 —— 真实模型。
 *
 * 契约在这里的身份是提示词：系统提示词放规格与纪律，用户提示词放
 * 用户原话 + 这次查到的事实 + 可引用目录 + 上一轮回答。
 *
 * 没有中转、没有配 key、模型返回不合规 —— 一律如实报错，不拿假数据兜底。
 */

import { buildAskMessages, designFactsText } from './prompt.js'
import { checks as checkList, actionList } from './store.js'
import { normalizeWay } from './wayDefaults.js'
import { normalizeTrigger, normalizeCoverage, normalizeGapKind } from './shape.js'
import { llmState, probeLlm, generateStream } from '../composables/useLlmConfig.js'

/** 生成前的可用性检查，失败直接抛给人看 */
export async function ensureReady () {
  await probeLlm()
  if (!llmState.available) throw new Error('当前环境没有模型中转（静态包或离线打开），无法生成')
  if (!llmState.config.hasKey) throw new Error('还没配置模型，去「菜单配置」里的模型卡片填 key 后再来')
  return llmState.config
}

/** 第一步：缺口识别。不产树。 */
export async function runAsk ({ utterance }) {
  await ensureReady()
  const text = await generateStream({
    messages: buildAskMessages({ utterance, factsText: designFactsText(), checkList, actionList }),
    jsonMode: true,
    temperature: 0.15
  })
  const data = parse(text)
  if (!data || data.step !== 'ask' || !Array.isArray(data.gaps)) {
    throw new Error('模型返回的不是缺口清单，重试一次或在提示词里补一句场景')
  }
  return {
    understood: data.understood || '',
    gaps: data.gaps.map((g, i) => ({
      id: g.id || `q${i + 1}`,
      level: g.level === 'soft' ? 'soft' : 'hard',
      kind: normalizeGapKind(g.kind),
      about: g.about || '',
      question: g.question || '',
      why: g.why || '',
      options: Array.isArray(g.options) ? g.options : [],
      default: g.default || (Array.isArray(g.options) ? g.options[0] : '')
    }))
  }
}

/**
 * 第二步：起草这套提示词与骨架（不再生成树）。
 * 树在触发时才生成 —— 定义期能确定的只有「这张单怎么开」与「这单要交付什么」。
 */
export async function runCompose ({ utterance, answers = [] }) {
  await ensureReady()
  const text = await generateStream({
    messages: buildAskMessages({ utterance, factsText: designFactsText(), answers, checkList, actionList }),
    jsonMode: true,
    temperature: 0.2
  })
  const data = parse(text)
  const sk = Array.isArray(data?.skeleton) ? data.skeleton : null
  if (!data || data.step !== 'compose' || !sk?.length) {
    throw new Error('模型没有给出骨架清单，重试一次')
  }
  return {
    name: data.name || '新事件',
    summary: data.summary || '',
    // 适用范围与触点是「这张单怎么开」的全部；缺了就是没起草完，这里只归一不补默认值
    trigger: normalizeTrigger(data.trigger || {}),
    coverage: normalizeCoverage(data.coverage || data.scope || {}),
    body: String(data.body || '').trim(),
    // 本事件自己声明的事实：骨架里用到的基础表之外的键，都要在这里给肯定/否定两种说法
    facts: (Array.isArray(data.facts) ? data.facts : [])
      .filter((x) => x && x.key)
      .map((x) => ({
        key: String(x.key).trim(),
        label: x.label || x.key,
        absent: x.absent || '这一单不适用',
        hint: x.hint || ''
      })),
    skeleton: sk.map((x, i) => ({
      key: String(x.key || `sk.${i + 1}`).trim() || `sk.${i + 1}`,
      goal: x.goal || '（缺结论）',
      needs: Array.isArray(x.needs) ? x.needs : (x.needs || 'always'),
      gate: x.gate === 'optional' ? 'optional' : 'must',
      after: Array.isArray(x.after) ? x.after : [],
      afterAny: Array.isArray(x.afterAny) ? x.afterAny : [],
      paths: (Array.isArray(x.paths) ? x.paths : []).map((p) => normalizeWay(p, checkList)),
      note: x.note || ''
    })),
    recap: Array.isArray(data.recap) ? data.recap : []
  }
}

/** 流式增量（页面要边生成边显示时用） */
export async function runAskStream ({ utterance, onDelta }) {
  await ensureReady()
  const text = await generateStream({
    messages: buildAskMessages({ utterance, factsText: designFactsText(), checkList, actionList }),
    jsonMode: true,
    temperature: 0.15,
    onDelta
  })
  return { text }
}

function parse (text = '') {
  let s = String(text).trim()
  s = s.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  const i = s.indexOf('{')
  const j = s.lastIndexOf('}')
  if (i < 0 || j <= i) return null
  try {
    return JSON.parse(s.slice(i, j + 1))
  } catch (e) {
    return null
  }
}
