/**
 * 生成结果归一：把模型说的话变成系统里真能用的值。
 *
 * 为什么单独一层：
 *   模型会说「全体员工」「业务触发」「推拿师和调理师」；
 *   系统要的是目录里的 key、端内入口、以及按编制算出来的人数。
 *   归一不是宽容 —— 说了但没说清的地方留空，交给 validate 报出来，
 *   绝不替它编一个「看起来合理」的触点或人群。
 *
 * 只处理事件级两件东西：触点（trigger）与人群（coverage）。
 * 子事件的归一在 wayDefaults.js（取数频率）与 validate.js（结构）。
 */
import { jobs, cities, stores, employTypes, roles, headcountOf, clone } from './model.js'
import { eventPoints } from './points.js'
import { normalizePayloadMap } from './payload.js'

const uniq = (a) => [...new Set(a)]
const filterIn = (list, allowed) => (Array.isArray(list) ? uniq(list.filter((v) => allowed.includes(v))) : [])

export const SCOPE_KEYS = ['jobs', 'cities', 'stores', 'employTypes']

/** 只留四维，把 estimate 这类派生物挡在存储之外 */
export function cleanScope (c = {}) {
  return {
    jobs: [...(c.jobs || [])],
    cities: [...(c.cities || [])],
    stores: [...(c.stores || [])],
    employTypes: [...(c.employTypes || [])]
  }
}

/** 事件点：模型可能给 key、给 label、或把 label 混在句子里 */
function resolvePoint (v) {
  const s = String(v || '').trim()
  if (!s) return null
  return (
    eventPoints.find((p) => p.key === s) ||
    eventPoints.find((p) => p.label === s) ||
    eventPoints.find((p) => s.includes(p.label)) ||
    null
  )
}

export function normalizeTrigger (raw = {}) {
  const type = ['business', 'manual', 'schedule'].includes(raw.type) ? raw.type : 'business'
  const out = { type, entry: String(raw.entry || '').trim() }

  if (type === 'business') {
    const p = resolvePoint(raw.eventPoint)
    out.eventPoint = p?.key || ''
    // 入口优先用模型给的，给不出来就用登记值 —— 登记值是事实，不是编的
    out.entry = out.entry || p?.entry || ''
    /**
     * 载荷只留登记过的键。模型可能写中文名、也可能自己造一个 key；
     * 造出来的一律剔掉（对岸不会发，留着只会在触发时取不到）。
     * 一个都没给时，按登记把字段全带上 —— 那是事件点承诺会发的。
     */
    const mapped = normalizePayloadMap(raw.payload, out.eventPoint)
    out.payload = mapped.length
      ? mapped
      : p
        ? normalizePayloadMap(p.payload.map((f) => ({ field: f.key })), out.eventPoint)
        : []
  }

  if (type === 'manual') {
    const rs = filterIn(raw.who?.roles, roles.map((r) => r.key))
    out.who = { roles: rs, resolveBy: raw.who?.resolveBy === 'city' ? 'city' : 'store' }
  }

  if (type === 'schedule') out.cron = String(raw.cron || '').trim()

  return out
}

export function normalizeCoverage (raw = {}) {
  const cov = {
    jobs: filterIn(raw.jobs, jobs.map((j) => j.key)),
    cities: filterIn(raw.cities, cities.map((c) => c.key)),
    stores: filterIn(raw.stores, stores),
    employTypes: filterIn(raw.employTypes, employTypes.map((e) => e.key))
  }
  // 人数永远由编制算，不信模型给的 estimate
  return { ...cov, estimate: headcountOf(cov) }
}

/** 追问缺口的四类：触点 / 人群 / 契约 / 数据 */
export const GAP_KINDS = ['touch', 'crowd', 'contract', 'data']
export const normalizeGapKind = (k) => (GAP_KINDS.includes(k) ? k : 'contract')

/** 触点的一句话说明（提示词回述与页面摘要共用） */
export function triggerSummary (trigger = {}) {
  if (trigger.type === 'business') {
    const p = eventPoints.find((x) => x.key === trigger.eventPoint)
    return `${p ? p.label : '未登记事件点'} → ${trigger.entry || '未写入口'}`
  }
  if (trigger.type === 'manual') return `人工发起 → ${trigger.entry || '未写入口'}`
  return `定时 → ${trigger.cron || '未设周期'}`
}

export const cloneShape = (x) => clone(x)
