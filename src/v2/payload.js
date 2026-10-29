/**
 * 载荷（触点带进来的参数）
 *
 * 三份东西必须分清，混在一起就会变成「谁都能编」：
 *
 * 1. **登记**（业务系统侧，只读）：这个事件点承诺发哪些字段、什么类型、哪些必传。
 *    由业务开发在我们的开放平台上注册，我方只读 —— 我们编不出来对岸不发的字段。
 * 2. **映射**（这套事件自己）：从登记字段里挑哪些用，每个拿来干什么（`use`）。
 *    选择事件点时自动带出全部候选，默认只勾引擎要用的工号；其余由人按需要勾。
 * 3. **值**（这一单）：触发时业务系统发过来、我们校验后存进 `inst.payload`。
 *
 * 一条边界要守住：载荷只参与**值**，不参与**结构**。
 * 它决定「审核表里那格默认填什么」，不决定「这棵树该长几条」——
 * 树形只由事实决定（difference-by-fact）。否则同一件事会因为一单的参数长出不同的树，
 * 就退回按单定制了。
 */

import { eventPointFields, pointFieldOf, empNoFieldOf, eventPointOf } from './points.js'
import { staffById, ledgerOf } from './base.js'

/** 用途三选一。不是「字段重要性」，是「这个值要走到哪里去」 */
export const PAYLOAD_USE = [
  { key: 'intake', label: '取数入参', hint: '引擎拿它去查员工档案（工号），不进表单' },
  { key: 'show', label: '实例回看', hint: '在实例顶部能看到，不参与流程' },
  { key: 'bind', label: '预填子事件', hint: '子事件的事项字段以它为默认值，人来确认或改' }
]

export const PAYLOAD_USE_LABEL = Object.fromEntries(PAYLOAD_USE.map((u) => [u.key, u.label]))

const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v || '').trim())

/** 登记里给的默认值写法：today+Nd / today */
function parseDefault (spec) {
  const s = String(spec || '').trim()
  if (!s) return ''
  const m = /^today(?:\+(\d+)d)?$/.exec(s)
  if (!m) return s
  const d = new Date(Date.now() + Number(m[1] || 0) * 86400000)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const pathOf = (o, path) => String(path || '').split('.').reduce((a, k) => (a === null || a === undefined ? undefined : a[k]), o)

/**
 * 台账带出的值（登记里写 fromStaff 的那几格，如常乐豆余额、补偿金、协议链接）：
 * 账记在员工档案上，按工号取；没这本账就是空，不编数。
 */
function staffValueOf (f = {}, me = {}) {
  const rec = staffById(me.empNo || me.id)
  // 主数据里没有这个人 = 台账里也没有他，给空而不是给 0（0 是「有账、余额为零」）
  if (!rec) return ''
  const v = pathOf({ ...rec, ...ledgerOf(rec) }, f.fromStaff)
  return v === undefined || v === null ? '' : v
}

const defaultUseOf = (f = {}) => (f.role === 'empNo' ? 'intake' : 'show')

/**
 * 这套事件的载荷计划：按**登记顺序**列出它用了哪些字段，
 * 每个带登记元数据（label / type / required / options）+ 用途。
 * 映射里对不上登记的，一律不进计划 —— 对岸不会发的东西，用不了。
 */
export function payloadPlanOf (trigger = {}) {
  const point = trigger.eventPoint
  const picked = new Map()
  ;(trigger.payload || []).forEach((p) => {
    const f = pointFieldOf(point, p?.field)
    if (f && !picked.has(f.key)) picked.set(f.key, { ...f, use: p.use || defaultUseOf(f) })
  })
  // 统一带上 field（= 登记的 key）：表单绑定与载荷映射用同一个名字，避免两套叫法
  return eventPointFields(point)
    .filter((f) => picked.has(f.key))
    .map((f) => ({ ...picked.get(f.key), field: f.key }))
}

/** 映射里写了、但登记表里没有的键：定义期就该点出来，不能等触发时取不到 */
export function unknownPayloadOf (trigger = {}) {
  const bad = []
  ;(trigger.payload || []).forEach((p) => {
    const k = String(p?.field || '').trim()
    if (!k) return
    if (!pointFieldOf(trigger.eventPoint, k) && !bad.includes(k)) bad.push(k)
  })
  return bad
}

/** 归一：模型或人可能给中文名、也可能给 key；只留登记过的，补齐用途 */
export function normalizePayloadMap (raw = [], point = '') {
  const list = Array.isArray(raw) ? raw : []
  const out = []
  list.forEach((p) => {
    if (!p) return
    const f = pointFieldOf(point, p.field ?? p.key ?? p.label)
    if (!f) return
    if (out.some((x) => x.field === f.key)) return
    out.push({ field: f.key, use: PAYLOAD_USE.some((u) => u.key === p.use) ? p.use : defaultUseOf(f) })
  })
  return out
}

/** 选择事件点时自动带出的全部候选：只读清单，默认勾工号，其余留给人勾 */
export function payloadCandidatesOf (point = '') {
  return eventPointFields(point).map((f) => ({ ...f, use: defaultUseOf(f), picked: f.role === 'empNo' }))
}

/** 触发前把人能预填的都填好：工号取登录身份，日期按登记默认值，台账数按工号取 */
export function payloadDefaultsOf (trigger = {}, me = {}) {
  const out = {}
  payloadPlanOf(trigger).forEach((f) => {
    if (f.role === 'empNo') out[f.key] = me.empNo || me.id || ''
    else if (f.fromStaff) {
      const v = staffValueOf(f, me)
      if (v !== '') out[f.key] = v
    } else if (f.default) out[f.key] = parseDefault(f.default)
  })
  return out
}

/** 触发时校验：必传要齐、类型要对、不许出现登记表没有的键 */
export function checkPayload (trigger = {}, values = {}) {
  const plan = payloadPlanOf(trigger)
  const known = new Set(plan.map((f) => f.key))
  const missing = []
  const badType = []
  const unknown = []
  plan.forEach((f) => {
    const v = values[f.key]
    const empty = v === undefined || v === null || String(v).trim() === ''
    if (empty) {
      if (f.required) missing.push(f.label)
      return
    }
    if (f.type === 'date' && !isDate(v)) badType.push(`${f.label}（要 YYYY-MM-DD）`)
    if (f.type === 'enum' && (f.options || []).length && !f.options.includes(v)) badType.push(`${f.label}（不在登记的可选值内）`)
    if (f.type === 'multi') {
      // 多选值允许数组（发起页）或「、」相连的串（种子 / 对岸回放），都拆开逐个对登记
      const arr = Array.isArray(v) ? v : String(v).split('、').map((s) => s.trim()).filter(Boolean)
      if ((f.options || []).length && arr.some((x) => !f.options.includes(x))) badType.push(`${f.label}（不在登记的可选值内）`)
    }
  })
  Object.keys(values || {}).forEach((k) => {
    if (k && !known.has(k)) unknown.push(k)
  })
  const why = missing.length
    ? `缺必传字段：${missing.join('、')}`
    : badType.length
      ? `字段取值不对：${badType.join('、')}`
      : ''
  return { ok: !why, missing, badType, unknown, why }
}

/**
 * 一处给人看的载荷值：数带单位（金额用 ¥），链接只说「查看」，空的按登记给的零值说法。
 * 发起页的「带进来的数据」和事件数据顶部的「带入」都用它，避免两处各写一套格式。
 */
export function payloadTextOf (f = {}, v) {
  if (v === undefined || v === null || String(v).trim() === '') return ''
  if (f.type === 'link') return '查看协议'
  if (f.type === 'multi') return Array.isArray(v) ? v.join('、') : String(v)
  if (f.type === 'number') {
    const n = Number(v)
    if (!n && f.zeroLabel) return f.zeroLabel
    const num = n.toLocaleString()
    if (f.unit === '元') return `¥${num}`
    return f.unit ? `${num} ${f.unit}` : num
  }
  return String(v)
}

/** 引擎要的那个字段的值（工号）：取不到就没法查档案 */
export function empNoOfPayload (trigger = {}, values = {}) {
  const f = empNoFieldOf(trigger.eventPoint)
  return f ? String(values[f.key] || '').trim() : ''
}

/** 只留登记且映射过的键：对岸多发的一律不落库，免得下游误用 */
export function keepKnownPayload (trigger = {}, values = {}) {
  const out = {}
  payloadPlanOf(trigger).forEach((f) => {
    if (values[f.key] !== undefined && values[f.key] !== null) out[f.key] = values[f.key]
  })
  return out
}

/**
 * 把载荷值预填到树上：事项字段写了 `from: 'payload.expectDate'` 的，
 * 就把这一单的值放进 `prefill`（人能看到、能改，不是替他拍板）。
 * 只填空着的字段，不覆盖已经带出来的值。
 */
export function prefillTree (tree = [], values = {}) {
  const asList = (x) => (Array.isArray(x)
    ? [...x]
    : String(x).split(/[、,，]/).map((s) => s.trim()).filter(Boolean))
  const fill = (fields = []) => {
    fields.forEach((fld) => {
      const src = String(fld.from || '')
      if (!src.startsWith('payload.')) return
      const v = values[src.slice(8)]
      if (v === undefined || v === null || String(v).trim() === '') return
      if (fld.prefill !== undefined && fld.prefill !== '') return
      /* 多选留数组，其余转文本：值按字段类型归一，消费端就不用各自再猜 */
      fld.prefill = fld.type === 'multiselect' ? asList(v) : (Array.isArray(v) ? v.join('、') : String(v))
    })
  }
  tree.forEach((s) => {
    ;(s.ways || []).forEach((w) => {
      ;(w.items || []).forEach((item) => fill(item.fields))
      /* 审核要看、要核对的字段同样能预填 —— 审核人核对或改，不重填一遍 */
      fill(w.form)
    })
  })
  return tree
}

/** 这个字段的预填来自哪一张单据的哪个字段（给人看一句话） */
export function prefillNoteOf (trigger = {}, fieldKey = '') {
  const f = payloadPlanOf(trigger).find((x) => x.key === fieldKey)
  if (!f) return ''
  const p = eventPointOf(trigger.eventPoint)
  return p ? `${p.label} · ${f.label}` : f.label
}
