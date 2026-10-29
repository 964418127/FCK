/**
 * 系统项原型存储：目录条目 + 草稿 + 发布记录。
 *
 * 与 catalog.js 的关系：
 *   catalog.js 是种子（已上线条目的初始快照）；
 *   本文件在它之上叠一层「可编辑 + 可发布」的薄壳，只服务原型演示。
 * 上线后这一层会被真实的服务端目录替换，形状保持不变：
 *   item.mirror（版本 / 配置人 / 上线时间）+ item.batches（批次与逐单 verdict）。
 *
 * 口径：
 *   - 草稿只是一个待审的候选版本，不参与流程侧引用
 *   - 发布才写入条目、版本 +1；老批次挂在条目上，保留可追溯
 *   - 新建项的 key 由 Agent 给语义短名，前后端统一加前缀（判定项无前缀，执行项 act.）
 */
import { reactive } from 'vue'
import { systemChecks, actions } from './catalog.js'

const STORAGE_KEY = 'fck:v2:sys:v1'
const OPERATOR = 'Lacus7'

/**
 * 种子数据修订号：catalog.js 里的批次样例、取数字段样例一改就 +1。
 *
 * 为什么需要它：本地存的是上一轮的整份快照，加载时若整份沿用，
 * 页面结构升级了、数据还是老形状 —— 表现就是「表格在，但员工列是空的」。
 * 批次属于检查方产出、原型里只读，不是人能编辑的东西，所以换一批种子时
 * 直接跟目录对齐；人发布过的条件/版本（mirror / pass / soft）与 Agent 新建的条目都保留。
 */
const SEED_REV = 2

const clone = (x) => JSON.parse(JSON.stringify(x))

/* ---------------- 取数字段：key 给程序，label 给人 ----------------
   契约（sysIo.check.fetch.fields）要求成对给：key = 来源系统原字段，label = 业务中文名。
   条件条目与界面只用 label；key 只用于对接取数，不许露在人眼前。
   老数据里 fields 还是字符串，这里统一收口成 { key, label }。 */

export const normalizeFields = (fields = []) =>
  (Array.isArray(fields) ? fields : [])
    .filter((f) => f && (typeof f === 'string' ? f.trim() : f.key || f.label))
    .map((f) => {
      if (typeof f === 'string') return { key: f.trim(), label: f.trim() }
      const key = String(f.key || f.label || '').trim()
      return { key, label: String(f.label || f.key || '').trim() }
    })

/** 条件里的英文 key 换成中文名：「exitInterview.recordNo != 空」→「面谈记录编号 != 空」 */
export const condLabel = (text, fields = []) => {
  let out = String(text || '')
  normalizeFields(fields).forEach((f) => {
    const tail = String(f.key.split('.').pop() || '').trim()
    if (tail.length < 3 || !f.label || f.label === f.key) return
    const esc = tail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    out = out.replace(new RegExp(`(?:[A-Za-z_][A-Za-z0-9_]*\\.)?${esc}\\b`, 'g'), f.label)
  })
  return out
}

/** 判定项统一收口：取数字段成对、条件文本走映射（幂等，重复调用不改结果） */
export function normalizeCheckItem (x) {
  if (!x || !x.fetch) return x
  const fields = normalizeFields(x.fetch.fields)
  const map = (b) => (b ? { ...b, items: (b.items || []).map((c) => condLabel(c, fields)) } : b)
  // 流程侧默认取数频率：老条目没有就补 1d / 5（与目录兜底一致）
  const df = x.defaultFetch || {}
  const defaultFetch = {
    freq: /^(none|\d+[mhd])$/.test(String(df.freq || '')) ? df.freq : '1d',
    maxRuns: Number(df.maxRuns) > 0 ? Number(df.maxRuns) : 5
  }
  return { ...x, fetch: { ...x.fetch, fields }, defaultFetch, pass: map(x.pass), soft: map(x.soft) }
}

/** 执行项在 catalog 里没有版本信息：初始化时补一份，和判定项同构（版本 / 配置人 / 上线时间） */
const withMirror = (x, fallbackAt) => {
  const base = normalizeCheckItem(x)
  return {
    ...base,
    mirror: base.mirror || { version: 'v1', configuredBy: OPERATOR, condAt: fallbackAt },
    batches: base.batches || []
  }
}

const seed = () => ({
  checks: clone(systemChecks).map((x) => withMirror(x, '2026-10-20 10:00')),
  actions: clone(actions).map((x) => withMirror(x, '2026-10-18 10:00')),
  drafts: {},
  logs: [],
  seedRev: SEED_REV
})

/**
 * 把「检查方产出的只读数据」对齐到当前目录：批次（含逐单 verdict 与当批条件快照）。
 * 只覆盖 batches —— 条件、版本、配置人是人能改的，不能被种子回滚。
 * 目录里没有的 key（Agent 新建、还没跑出批次的）原样保留。
 */
function refreshSeedBatches (lists) {
  const byKey = new Map([...systemChecks, ...actions].map((x) => [x.key, x]))
  let n = 0
  lists.flat().forEach((it) => {
    const src = byKey.get(it.key)
    if (!src) return
    it.batches = clone(src.batches || [])
    n++
  })
  return n
}

/** 目录里新增的条目（老快照里没有）补进来：演示数据要跟着目录一起长 */
function mergeSeedItems (list, src, fallbackAt) {
  const have = new Set(list.map((x) => x.key))
  src.forEach((x) => {
    if (have.has(x.key)) return
    list.push(withMirror(clone(x), fallbackAt))
  })
}

/**
 * 把本地快照升级到当前种子：纯函数，便于回归测试。
 * 判定是否要升级只看 seedRev；人改过的东西（mirror / pass / soft / 草稿 / 发布日志）一律保留。
 */
export function upgradeStored (d) {
  const s = seed()
  const checks = (d.checks || []).map((x) => withMirror(x, '2026-10-20 10:00'))
  const actionList = (d.actions || s.actions).map((x) => withMirror(x, '2026-10-18 10:00'))
  const stale = d.seedRev !== SEED_REV
  if (stale) {
    mergeSeedItems(checks, systemChecks, '2026-10-20 10:00')
    mergeSeedItems(actionList, actions, '2026-10-18 10:00')
    refreshSeedBatches([checks, actionList])
  }
  return {
    checks,
    actions: actionList,
    drafts: d.drafts || {},
    logs: d.logs || [],
    seedRev: SEED_REV,
    _stale: stale
  }
}

function load () {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seed()
    const d = JSON.parse(raw)
    if (!Array.isArray(d.checks) || !d.checks.length) return seed()
    const state = upgradeStored(d)
    // 老快照已就地升级，写回一次，避免每次加载都重算
    if (state._stale) {
      const { _stale, ...toSave } = state
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)) } catch (e) { /* 忽略 */ }
    }
    delete state._stale
    return state
  } catch (e) {
    return seed()
  }
}

export const sysState = reactive(load())

export const sysListOf = (kind) => (kind === 'action' ? sysState.actions : sysState.checks)
export const sysItemOf = (kind, key) => sysListOf(kind).find((x) => x.key === key) || null

const draftId = (kind, key) => `${kind}:${key}`
export const sysDraftOf = (kind, key) => sysState.drafts[draftId(kind, key)] || null

export function persist () {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      checks: sysState.checks,
      actions: sysState.actions,
      drafts: sysState.drafts,
      logs: sysState.logs,
      seedRev: SEED_REV
    }))
  } catch (e) { /* 存不下不影响演示 */ }
}

export function setSysDraft (kind, key, item, meta = {}) {
  sysState.drafts[draftId(kind, key)] = { ...clone(item), _meta: meta }
  persist()
}

export function dropSysDraft (kind, key) {
  delete sysState.drafts[draftId(kind, key)]
  persist()
}

/** v3 → v4；没有版本视为 v0 */
function nextVersion (v) {
  const n = parseInt(String(v || 'v0').replace(/[^\d]/g, ''), 10)
  return `v${Number.isFinite(n) ? n + 1 : 1}`
}

function now () {
  const d = new Date()
  const p = (x) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

/** 发布：草稿覆盖条目、版本 +1、写一条发布记录 */
export function publishSysDraft (kind, key) {
  const d = sysState.drafts[draftId(kind, key)]
  if (!d) return null
  const list = sysListOf(kind)
  const i = list.findIndex((x) => x.key === key)
  const prev = i >= 0 ? list[i] : null
  const version = nextVersion(prev?.mirror?.version)

  const item = clone(d)
  delete item._meta
  item.key = key
  item.mirror = { version, configuredBy: OPERATOR, condAt: now() }
  item.batches = prev?.batches || []

  if (i >= 0) list[i] = item
  else list.push(item)

  sysState.logs.unshift({
    kind,
    key,
    name: item.name,
    version,
    by: OPERATOR,
    at: now(),
    action: i >= 0 ? 'update' : 'create',
    note: (d._meta && d._meta.note) || ''
  })

  dropSysDraft(kind, key)
  persist()
  return item
}

/** 新建时避免 key 撞车 */
export function uniqueKey (kind, raw) {
  const base = String(raw || '').trim().replace(/^act\./, '').replace(/[^a-zA-Z0-9-]/g, '') || 'item'
  const prefix = kind === 'action' ? 'act.' : ''
  const exists = (k) => sysListOf(kind).some((x) => x.key === k)
  let k = prefix + base
  let n = 2
  while (exists(k)) k = `${prefix}${base}-${n++}`
  return k
}

export function resetSysItems () {
  const s = seed()
  sysState.checks = s.checks
  sysState.actions = s.actions
  sysState.drafts = {}
  sysState.logs = []
  persist()
}
