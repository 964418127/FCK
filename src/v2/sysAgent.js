/**
 * 系统项 Agent：对话 → 判定条件 / 执行参数 → 待审草案。
 *
 * 与 gen.js 的分工：
 *   gen.js 生成「一件事怎么走」（子事件树）；
 *   本文件生成「系统怎么判、怎么执行」（目录条目）。
 * 两者共用契约与模型通道，但提示词只暴露各自那一段，不许越界：
 *   编排侧只能挑 key、配频率；条件与执行参数只在这里生成。
 *
 * 只有真实模型一条路：没中转 / 没 key / 返回不合规，一律如实报错。
 */
import { generateStream } from '../composables/useLlmConfig.js'
import { ensureReady } from './gen.js'
import { CONTRACT, renderSystemItemPrompt } from './contract.js'
import { sysListOf, uniqueKey, normalizeFields, condLabel } from './sysStore.js'

const MODES = ['execute', 'notify', 'deliver']

export const SYS_PROMPT = renderSystemItemPrompt(CONTRACT)

/** 让模型复用的来源系统清单：从已登记条目里取，避免它编一个不存在的系统 */
function sourcesOf () {
  const set = new Set()
  sysListOf('check').forEach((x) => x.source && set.add(x.source))
  sysListOf('action').forEach((x) => x.source && set.add(x.source))
  return [...set]
}

function buildMessages ({ kind, current, utterance }) {
  const task = current
    ? `这是已上线的${kind === 'action' ? '执行项' : '判定项'}，按用户的话改它，没提到的字段保持不变。`
    : `新建一个${kind === 'action' ? '执行项' : '判定项'}。key 由你给语义短名，不要带前缀。`

  const sameKind = sysListOf(kind).map((x) => `${x.key}｜${x.name}`)

  const user = [
    `## 任务`,
    task,
    '',
    `## 已有来源系统（source 只能从这里选，或说明为什么需要新增）`,
    ...sourcesOf().map((s) => `- ${s}`),
    '',
    `## 已登记的同类项（key 不许重复）`,
    ...(sameKind.length ? sameKind.map((s) => `- ${s}`) : ['（暂无）']),
    '',
    current ? `## 当前配置\n${JSON.stringify(stripInternal(current), null, 2)}\n` : '',
    `## 用户的话`,
    utterance,
    '',
    `现在只输出一个 JSON 对象，不要解释。`
  ].filter(Boolean).join('\n')

  return [
    { role: 'system', content: SYS_PROMPT },
    { role: 'user', content: user }
  ]
}

const stripInternal = (x) => {
  const o = { ...x }
  delete o.batches
  delete o.mirror
  delete o._meta
  return o
}

export async function runSysCompose ({ kind = 'check', current = null, utterance = '' }) {
  await ensureReady()
  const text = await generateStream({
    messages: buildMessages({ kind, current, utterance }),
    jsonMode: true,
    temperature: 0.2
  })
  const data = parse(text)
  if (!data) throw new Error('模型没有返回可解析的 JSON，重试一次')

  const item = kind === 'action' ? normalizeAction(data, current) : normalizeCheck(data, current)
  if (!item.name || !item.source) throw new Error('返回缺少名称或来源系统，重试一次')

  // 新建时统一加前缀并避开已有 key；改已有项时 key 不动
  item.key = current ? current.key : uniqueKey(kind, item.key)
  return item
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

const arr = (x) => (Array.isArray(x) ? x.filter((v) => String(v || '').trim()) : [])
const logic = (x) => (x === 'or' ? 'or' : 'and')

function normalizeCheck (d, current) {
  const fields = normalizeFields(Array.isArray(d.fetch?.fields) ? d.fetch.fields : [])
  // 条件文本一律走字段映射：模型若写了 exitInterview.recordNo，这里换成「面谈记录编号」
  const conds = (list) => arr(list).map((s) => condLabel(String(s), fields))

  const pass = {
    logic: logic(d.pass?.logic),
    items: conds(d.pass?.items)
  }
  const softItems = conds(d.soft?.items)
  const soft = softItems.length ? { logic: logic(d.soft?.logic), items: softItems } : null

  // 流程侧默认取数频率：没提就跟着当前值走，新建给 1d / 5
  const df = d.defaultFetch || {}
  const prevDf = current?.defaultFetch || {}
  const freq = /^(none|\d+[mhd])$/.test(String(df.freq || '')) ? df.freq : (prevDf.freq || '1d')
  const maxRuns = Number(df.maxRuns) > 0 ? Number(df.maxRuns) : (Number(prevDf.maxRuns) > 0 ? Number(prevDf.maxRuns) : 5)

  return {
    key: String(d.key || '').trim(),
    name: String(d.name || '').trim(),
    source: String(d.source || '').trim(),
    desc: String(d.desc || '').trim(),
    pass,
    soft,
    fetch: {
      fields,
      cadenceHint: String(d.fetch?.cadenceHint || '').trim()
    },
    defaultFetch: { freq, maxRuns },
    recap: arr(d.recap).map(String),
    // 改已有项时保留没被模型提到的原字段（比如手动补的 note）
    ...(current?.note ? { note: current.note } : {})
  }
}

function normalizeAction (d, current) {
  const args = (Array.isArray(d.args) ? d.args : []).filter((a) => a && (a.key || a.label)).map((a) => ({
    key: String(a.key || '').trim(),
    label: String(a.label || '').trim(),
    from: ['facts', 'payload', 'verdict', 'receipt', 'input'].includes(a.from) ? a.from : 'facts'
  }))
  const receipt = (Array.isArray(d.receipt) ? d.receipt : []).filter((r) => r && (r.key || r.label)).map((r) => ({
    key: String(r.key || '').trim(),
    label: String(r.label || '').trim()
  }))

  return {
    key: String(d.key || '').trim(),
    name: String(d.name || '').trim(),
    source: String(d.source || '').trim(),
    mode: MODES.includes(d.mode) ? d.mode : 'execute',
    target: String(d.target || '').trim(),
    targetFrom: String(d.targetFrom || '').trim(),
    args,
    receipt,
    idempotent: String(d.idempotent || '').trim(),
    fallback: String(d.fallback || '').trim(),
    note: String(d.note || current?.note || '').trim(),
    recap: arr(d.recap).map(String)
  }
}
