/**
 * 生成层：一句话 → 追问 → 编排树。只有一条路 —— 真实模型。
 *
 * 契约在这里的身份是提示词：系统提示词放规格与纪律，用户提示词放
 * 用户原话 + 这次查到的事实 + 可引用目录 + 上一轮回答。
 *
 * 没有中转、没有配 key、模型返回不合规 —— 一律如实报错，不拿假数据兜底。
 */

import { buildAskMessages, designFactsText, buildGenerateMessages } from './prompt.js'
import { checks as checkList, actionList } from './store.js'
import { checkGenerated } from './blueprint.js'
import { needOk } from './skeleton.js'
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

/* ---------------- 实例期：这一单的树（真跑模型） ---------------- */

/**
 * 拿「这套提示词 + 这一单的人与事实」让模型现长一棵树。
 *
 * 与规则生成（blueprint.composeFor）同一份输入、同一个产物形状；
 * 区别只在「这条该不该长」由谁判断：这里是模型，那里是 needs 判定。
 * 不合格不降级、不造假 —— 把 check 一起返回，由调用方决定这张单能不能开。
 */
export async function runGenerate ({ prompt, emp = {}, factsText = '' } = {}) {
  await ensureReady()
  const text = await generateStream({
    messages: buildGenerateMessages({ prompt, emp, factsText }),
    jsonMode: true,
    temperature: 0.2
  })
  const data = parse(text)
  if (!data || !Array.isArray(data.subs) || !data.subs.length) {
    throw new Error('模型没给出子事件清单（subs 为空）：提示词里可能没写清必须交付哪些结论')
  }
  const facts = emp.facts || {}
  const raw = toTree(data.subs, prompt)
  /*
   * 「事实不成立就不长这一条」对模型生成同样成立。
   * 模型偶尔会按想象补一条（实测：张三没有备用金，调岗树上却长了「保管的备用金已结清」），
   * 自检只把它记成提醒，树照样落库 —— 那就等于「差异来自模型的想象力」。
   * 这里按 needs 裁掉，并把它记进 dropped，与规则生成同一个口径。
   */
  const sk = new Map((prompt.skeleton || []).map((s) => [s.key, s]))
  const cut = []
  const tree = raw.filter((s) => {
    const base = sk.get(s.skeletonKey)
    if (base && !needOk(base.needs, facts)) {
      cut.push({ key: base.key, goal: base.goal, needs: base.needs, by: 'model' })
      return false
    }
    return true
  })
  /* 被裁掉的那条如果还挂在别人的前置里，下游会永远等不到它 —— 摘干净 */
  const ids = new Set(tree.map((s) => s.id))
  tree.forEach((s) => {
    const out = []
    ;(s.deps || []).forEach((d) => {
      const keep = Array.isArray(d) ? d.filter((x) => ids.has(x)) : (ids.has(d) ? [d] : [])
      if (!keep.length) return
      out.push(keep.length === 1 ? keep[0] : keep)
    })
    s.deps = out
  })
  const droppedOwn = Array.isArray(data.dropped) ? data.dropped : []
  return {
    tree,
    dropped: [...droppedOwn, ...cut],
    cut,
    check: checkGenerated({ tree, prompt, facts }),
    raw: text
  }
}

/**
 * 字段可增不可改：同 key 的字段，元数据（名字 / 类型 / 必填 / 可选值 / 附件格式）以骨架为准。
 *
 * 模型最容易漏的是 options —— 它把可选值写进说明文字，界面按 options 出下拉，结果下拉里
 * 只有半句话（实测出现过「默认并入当期薪金」这种选项）。这一层不是替模型补内容，
 * 是把「骨架已经定过的形状」按回去，同一条原则在定义期已经写过：字段可增不可改。
 */
function alignFields (items = [], basePaths = []) {
  const base = new Map()
  ;(basePaths || []).forEach((w) => (w.items || []).forEach((it) => (it.fields || []).forEach((f) => {
    if (f?.key) base.set(f.key, f)
  })))
  return items.map((it) => ({
    ...it,
    fields: (it.fields || []).map((f) => {
      const b = base.get(f.key)
      if (!b) return f
      return {
        ...f,
        label: b.label || f.label,
        type: b.type || f.type,
        required: b.required === undefined ? f.required : b.required,
        ...(b.options && !(Array.isArray(f.options) && f.options.length) ? { options: b.options } : {}),
        ...(b.formats && !f.formats ? { formats: b.formats } : {}),
        ...(b.prefill !== undefined && f.prefill === undefined ? { prefill: b.prefill } : {})
      }
    })
  }))
}

/** 模型给的子事件 → 与规则生成形状一致的树（id 一律 se.<骨架 key>，否则依赖对不上） */
function toTree (subs = [], prompt = {}) {
  const sk = new Map((prompt.skeleton || []).map((s) => [s.key, s]))
  const seen = new Set()
  return subs
    .map((x) => {
      const key = String(x?.skeletonKey || x?.key || '').trim()
      if (!key || seen.has(key)) return null
      seen.add(key)
      const base = sk.get(key) || {}
      const after = Array.isArray(x.deps) && x.deps.length ? x.deps : (base.after || []).map((k) => `se.${k}`)
      return {
        id: `se.${key}`,
        skeletonKey: key,
        goal: String(x.goal || base.goal || '（缺结论）').trim(),
        gate: (x.gate || base.gate) === 'optional' ? 'optional' : 'must',
        deps: after.filter(Boolean).map((d) => String(d).startsWith('se.') ? String(d) : `se.${d}`),
        biz: x.biz || base.note || '',
        ways: (Array.isArray(x.ways) ? x.ways : (base.paths || []).map((p) => p)).map((w) => oneWay(w, base.paths))
      }
    })
    .filter(Boolean)
}

/** 单条路径归一：人的负责人允许写成 role，系统项补默认取数频率 */
function oneWay (w = {}, basePaths = []) {
  if (!w || !w.type) return { type: 'human', owner: { kind: 'role', role: 'hr' }, items: [] }
  if (w.type === 'human') {
    return {
      type: 'human',
      owner: w.owner || (w.role ? { kind: 'role', role: w.role } : { kind: 'role', role: 'hr' }),
      items: Array.isArray(w.items) ? alignFields(w.items, basePaths) : []
    }
  }
  return normalizeWay(w, checkList)
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
