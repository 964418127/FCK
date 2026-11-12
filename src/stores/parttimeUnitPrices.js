import { reactive, watch } from 'vue'
import { employees } from './parttimeTasks.js'
import { guaranteeCities, guaranteeStores } from './parttimeGuarantee.js'

const STORAGE_KEY = 'fck_parttime_unit_prices_v2'
const LEGACY_KEY = 'fck_parttime_unit_prices_v1'

// 新客 / 评价 / 客次三项各自独立计价，配置粒度是「层级 × 人数档 × 客次量档」的一个格子（cell）。
export const priceItems = [
  { key: 'newCustomer', label: '新客' },
  { key: 'review', label: '评价' },
  { key: 'visit', label: '客次' }
]
// 配置人数 = 门店配置的全职客户经理人数。默认 1 / 2 / 3 人三档，业务可按需新增（如 4 人店单独一档）。
// 新增的档存在 store 里随配置一起持久化；没有对应档时，超出最高档的人数按最高档取值。
export const defaultHeadcountTiers = [
  { key: 'hc1', count: 1, label: '1 人' },
  { key: 'hc2', count: 2, label: '2 人' },
  { key: 'hc3', count: 3, label: '3 人' }
]
export const headcountTiersOf = () => unitPriceStore.headcountTiers?.length ? unitPriceStore.headcountTiers : defaultHeadcountTiers
export const headcountTierLabel = count => `${count} 人`
// 门店天均客次量分档。区间左闭右开（30 次归入 30 ~ 40 档），末档不设上限。
// 档位边界可配置（弹窗里两个数字框），随配置持久化；key 保持稳定，已存的价格格子不受影响。
export const defaultVolumeTiers = [
  { key: 't1', from: 0, to: 30 },
  { key: 't2', from: 30, to: 40 },
  { key: 't3', from: 40, to: null }
]
export const volumeTierLabel = tier => tier.to == null ? `${tier.from} 次以上` : `${tier.from} ~ ${tier.to} 次`
export const volumeTiersOf = () => unitPriceStore.volumeTiers?.length ? unitPriceStore.volumeTiers : defaultVolumeTiers
export const cellKeyOf = (headcountKey, tierKey) => `${headcountKey}.${tierKey}`
export const ownSourceLabel = scope => ({ general: '通用', city: '城市', store: '门店', person: '个人' })[scope] || '通用'

/** 门店人数 → 人数档：命中「不小于该人数」的第一档，超出最高档时取最高档；0 名全职客户经理按 1 人档。 */
export function headcountKeyOf(count) {
  const tiers = headcountTiersOf()
  const value = Number(count)
  if (!Number.isFinite(value) || value < 1) return tiers[0].key
  const tier = tiers.find(item => item.count >= value)
  return (tier || tiers[tiers.length - 1]).key
}
/** 天均客次量 → 客次量档；0 是有效事实，落第一档。 */
export function volumeTierKeyOf(volume) {
  const value = Number(volume)
  if (!Number.isFinite(value) || value < 0) return null
  const tiers = volumeTiersOf()
  const tier = tiers.find(item => item.to === null || value < item.to)
  return (tier || tiers[tiers.length - 1]).key
}
/** 门店主数据里的两个事实：全职客户经理人数、天均客次量。两项都是门店主数据的必填项，正常数据一定有值。 */
export function storeFacts(store, override = {}) {
  const fullTimeCount = Number(override.fullTimeCount ?? store?.fullTimeCount)
  const avgDailyVisits = Number(override.avgDailyVisits ?? store?.avgDailyVisits)
  return {
    fullTimeCount,
    avgDailyVisits,
    headcountKey: headcountKeyOf(fullTimeCount),
    volumeTierKey: volumeTierKeyOf(avgDailyVisits)
  }
}
const demoCells = grid => {
  const cells = {}
  for (const headcount of defaultHeadcountTiers) for (const tier of defaultVolumeTiers) {
    const prices = grid?.[headcount.key]?.[tier.key]
    if (prices) cells[cellKeyOf(headcount.key, tier.key)] = { ...prices }
  }
  return cells
}
const initialState = () => ({
  headcountTiers: defaultHeadcountTiers.map(tier => ({ ...tier })),
  volumeTiers: defaultVolumeTiers.map(tier => ({ ...tier, label: volumeTierLabel(tier) })),
  generalCells: demoCells({
    hc1: { t1: { newCustomer: 18, review: 5, visit: 12 }, t2: { newCustomer: 14, review: 4, visit: 10 }, t3: { newCustomer: 11, review: 3, visit: 8 } },
    hc2: { t1: { newCustomer: 15, review: 4, visit: 10 }, t2: { newCustomer: 12, review: 3, visit: 8 }, t3: { newCustomer: 9, review: 3, visit: 7 } },
    hc3: { t1: { newCustomer: 12, review: 4, visit: 9 }, t2: { newCustomer: 8, review: 3, visit: 7 }, t3: { newCustomer: 5, review: 2, visit: 6 } }
  }),
  cityRules: [
    { city: '成都', cells: demoCells({ hc1: { t1: { newCustomer: 20, visit: 13 }, t2: { newCustomer: 16 } } }) },
    { city: '杭州', cells: demoCells({ hc1: { t1: { newCustomer: 25, review: 6, visit: 15 } }, hc2: { t1: { newCustomer: 21 } } }) },
    { city: '北京', cells: demoCells({ hc1: { t1: { newCustomer: 30, review: 8, visit: 18 } } }) }
  ],
  storeRules: [
    { storeId: 'xl', cells: demoCells({ hc1: { t1: { newCustomer: 24 } }, hc2: { t1: { newCustomer: 22, visit: 14 } } }) },
    { storeId: 'guarantee-hz-binjiang', cells: demoCells({ hc3: { t1: { visit: 20 }, t3: { visit: 17 } } }) }
  ],
  personStoreRules: [
    { employeeId: 100, storeId: 'xl', cells: demoCells({ hc2: { t1: { newCustomer: 28, visit: 15 } } }) },
    { employeeId: 100, storeId: 'ls', cells: demoCells({ hc1: { t2: { review: 9 } } }) }
  ]
})
const isPrice = value => typeof value === 'number' && Number.isFinite(value) && value >= 0
const validCell = cell => cell && typeof cell === 'object'
  && Object.keys(cell).every(key => priceItems.some(item => item.key === key) && isPrice(cell[key]))
const validTiers = tiers => Array.isArray(tiers) && tiers.length > 0
  && tiers.every(tier => tier && Number.isInteger(tier.count) && tier.count >= 1 && tier.key === `hc${tier.count}` && tier.label === `${tier.count} 人`)
  && new Set(tiers.map(tier => tier.key)).size === tiers.length
const validVolumeTiers = tiers => Array.isArray(tiers) && tiers.length > 0
  && tiers.every((tier, index) => {
    if (!tier || typeof tier.key !== 'string') return false
    if (!Number.isInteger(tier.from) || tier.from < 0) return false
    if (index === 0 && tier.from !== 0) return false
    const isLast = index === tiers.length - 1
    if (isLast) return tier.to === null
    return Number.isInteger(tier.to) && tier.to > tier.from && tiers[index + 1].from === tier.to
  })
  && new Set(tiers.map(tier => tier.key)).size === tiers.length
const validCells = (cells, headcountTiers = headcountTiersOf(), volumeTiers = volumeTiersOf()) => cells && typeof cells === 'object'
  && Object.entries(cells).every(([key, cell]) => {
    const [headcountKey, tierKey] = key.split('.')
    return headcountTiers.some(item => item.key === headcountKey) && volumeTiers.some(item => item.key === tierKey) && validCell(cell)
  })
const validState = state => state && validTiers(state.headcountTiers) && validVolumeTiers(state.volumeTiers)
  && validCells(state.generalCells, state.headcountTiers, state.volumeTiers)
  && Array.isArray(state.cityRules) && Array.isArray(state.storeRules) && Array.isArray(state.personStoreRules)
  && state.cityRules.every(rule => guaranteeCities.includes(rule.city) && validCells(rule.cells, state.headcountTiers, state.volumeTiers))
  && state.storeRules.every(rule => guaranteeStores.some(store => store.id === rule.storeId) && validCells(rule.cells, state.headcountTiers, state.volumeTiers))
  && state.personStoreRules.every(rule => employees.some(employee => employee.id === rule.employeeId) && guaranteeStores.some(store => store.id === rule.storeId) && validCells(rule.cells, state.headcountTiers, state.volumeTiers))

// v1 只有单一金额：迁移时展开成「全部人数档 × 全部客次量档 同价」，语义是「不区分人数与客流」。
const expandLegacy = prices => prices && Object.fromEntries([...defaultHeadcountTiers.flatMap(headcount => defaultVolumeTiers.map(tier => [cellKeyOf(headcount.key, tier.key), { ...prices }]))])
const migrateLegacy = legacy => legacy && {
  headcountTiers: defaultHeadcountTiers.map(tier => ({ ...tier })),
  volumeTiers: defaultVolumeTiers.map(tier => ({ ...tier, label: volumeTierLabel(tier) })),
  generalCells: expandLegacy(legacy.generalPrices) || initialState().generalCells,
  cityRules: (legacy.cityRules || []).map(rule => ({ city: rule.city, cells: expandLegacy(rule.prices) || {}, ...(rule.voidedAt ? { voidedAt: rule.voidedAt } : {}) })),
  storeRules: (legacy.storeRules || []).map(rule => ({ storeId: rule.storeId, cells: expandLegacy(rule.prices) || {}, ...(rule.voidedAt ? { voidedAt: rule.voidedAt } : {}) })),
  personStoreRules: (legacy.personStoreRules || []).map(rule => ({ employeeId: rule.employeeId, storeId: rule.storeId, cells: expandLegacy(rule.prices) || {}, ...(rule.voidedAt ? { voidedAt: rule.voidedAt } : {}) }))
}
export const migrateLegacyState = migrateLegacy
function load() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    // 早先的 v2 存档没有人数档 / 客次量档列表：补默认档，价格数据原样保留。
    const patched = state => state && (!state.headcountTiers || !state.volumeTiers)
      ? { ...state, headcountTiers: state.headcountTiers || defaultHeadcountTiers.map(tier => ({ ...tier })), volumeTiers: state.volumeTiers || defaultVolumeTiers.map(tier => ({ ...tier, label: volumeTierLabel(tier) })) }
      : state
    const state = patched(stored)
    if (validState(state)) return state
    const migrated = patched(migrateLegacy(JSON.parse(localStorage.getItem(LEGACY_KEY))))
    if (validState(migrated)) return migrated
  } catch { /* 存储不可用时使用演示数据。 */ }
  return initialState()
}
export const unitPriceStore = reactive(load())
let externalUpdate = false
watch(unitPriceStore, state => {
  if (externalUpdate) return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* 保留会话内配置。 */ }
}, { deep: true, flush: 'sync', immediate: true })
if (typeof window !== 'undefined') window.addEventListener('storage', event => {
  if (event.key !== STORAGE_KEY || !event.newValue) return
  try {
    const state = JSON.parse(event.newValue)
    if (!validState(state)) return
    externalUpdate = true
    Object.assign(unitPriceStore, state)
  } catch { /* 忽略无效存储数据。 */ }
  finally { externalUpdate = false }
})

/**
 * 新增人数档。新档从当前最高档「同格同价」起步 —— 否则刚加一档，4 人门店就整片变成「未配置」。
 * 起步价只是初值，之后各层级照旧按本级配置覆盖。
 */
export function addHeadcountTier(count) {
  const value = Number(count)
  if (!Number.isInteger(value) || value < 1) return '人数须为大于 0 的整数'
  const tiers = unitPriceStore.headcountTiers
  if (tiers.some(tier => tier.count === value)) return `「${value} 人」档已存在`
  const highest = [...tiers].sort((a, b) => b.count - a.count)[0]
  const key = `hc${value}`
  const copyFromHighest = cells => {
    if (!cells) return
    for (const tier of volumeTiersOf()) {
      const source = cells[cellKeyOf(highest.key, tier.key)]
      if (source) cells[cellKeyOf(key, tier.key)] = { ...source }
    }
  }
  copyFromHighest(unitPriceStore.generalCells)
  for (const rule of [...unitPriceStore.cityRules, ...unitPriceStore.storeRules, ...unitPriceStore.personStoreRules]) copyFromHighest(rule.cells)
  tiers.push({ key, count: value, label: `${value} 人` })
  tiers.sort((a, b) => a.count - b.count)
  return ''
}

export const cityPriceFor = city => unitPriceStore.cityRules.find(rule => rule.city === city && !rule.voidedAt) || null
export const storePriceFor = storeId => unitPriceStore.storeRules.find(rule => rule.storeId === storeId && !rule.voidedAt) || null
export const personStorePriceFor = (employeeId, storeId) => unitPriceStore.personStoreRules.find(rule => rule.employeeId === employeeId && rule.storeId === storeId && !rule.voidedAt) || null

/**
 * 在某一格（人数档 × 客次量档）上按「个人 → 门店 → 城市 → 通用」逐项取值。
 * 继承只发生在同一格内：城市在 hc1.t1 的价，不会拿来兜底 hc3.t2。
 */
export function resolveAt({ city, storeId, employeeId, headcountKey = 'hc1', tierKey = 't1', skip = [] } = {}) {
  const cell = cellKeyOf(headcountKey, tierKey)
  const levels = [
    { scope: 'person', source: '个人', cells: personStorePriceFor(employeeId, storeId)?.cells },
    { scope: 'store', source: '门店', cells: storePriceFor(storeId)?.cells },
    { scope: 'city', source: '城市', cells: cityPriceFor(city)?.cells },
    { scope: 'general', source: '通用', cells: unitPriceStore.generalCells }
  ].filter(level => !skip.includes(level.scope))
  const prices = {}, sources = {}
  for (const item of priceItems) {
    const hit = levels.find(level => level.cells?.[cell]?.[item.key] !== undefined)
    prices[item.key] = hit ? hit.cells[cell][item.key] : null
    sources[item.key] = hit ? hit.source : '未配置'
  }
  return { cell, headcountKey, tierKey, prices, sources }
}

/** 门店实际取价：门店人数与天均客次量决定落在哪一格，再逐级解析。 */
export function resolveUnitPrices(employeeId, storeId, override = {}) {
  const store = guaranteeStores.find(item => item.id === storeId)
  if (!store) return { error: '门店不存在' }
  const facts = storeFacts(store, override)
  const result = resolveAt({ city: store.city, storeId, employeeId, headcountKey: facts.headcountKey, tierKey: facts.volumeTierKey })
  return { error: '', ...facts, ...result }
}
/** 城市层级的取价（不考虑具体门店的人与事），客次量档按传入值决定。 */
export function resolveCityPrices(city, headcountKey = 'hc1', tierKey = 't1') {
  return resolveAt({ city, headcountKey, tierKey })
}

const mergeCells = (target = {}, headcountKey, rows) => {
  const cells = { ...target }
  for (const [tierKey, prices] of Object.entries(rows || {})) {
    const cell = cellKeyOf(headcountKey, tierKey)
    const merged = { ...(cells[cell] || {}) }
    for (const item of priceItems) {
      const value = prices?.[item.key]
      if (value === undefined || value === null || value === '') delete merged[item.key]
      else merged[item.key] = value
    }
    if (Object.keys(merged).length) cells[cell] = merged
    else delete cells[cell]
  }
  return cells
}
const validateRows = rows => {
  const entries = Object.entries(rows || {})
  if (!entries.length) return '请至少填写一项单价'
  for (const [tierKey, prices] of entries) {
    if (!volumeTiersOf().some(item => item.key === tierKey)) return '客次量档不存在'
    for (const item of priceItems) {
      const value = prices?.[item.key]
      if (value === undefined || value === null || value === '') continue
      if (!isPrice(value)) return `${item.label}单价须为非负数`
    }
  }
  return ''
}
const upsert = (list, owner, headcountKey, rows, sameOwner) => {
  const index = list.findIndex(current => !current.voidedAt && sameOwner(current))
  const cells = mergeCells(index === -1 ? {} : list[index].cells, headcountKey, rows)
  if (!Object.keys(cells).length) return '请至少填写一项单价'
  if (index === -1) list.push({ ...owner, cells })
  else list.splice(index, 1, { ...list[index], ...owner, cells })
  return ''
}
export function saveGeneralCells(headcountKey, rows) {
  if (!headcountTiersOf().some(item => item.key === headcountKey)) return '人数档不存在'
  const error = validateRows(rows)
  if (error) return error
  const cells = mergeCells(unitPriceStore.generalCells, headcountKey, rows)
  if (!Object.keys(cells).length) return '通用标准不能整片清空'
  unitPriceStore.generalCells = cells
  return ''
}
export function saveCityPrices({ city, headcountKey, rows }) {
  if (!guaranteeCities.includes(city)) return '请选择城市'
  if (!headcountTiersOf().some(item => item.key === headcountKey)) return '人数档不存在'
  const error = validateRows(rows)
  if (error) return error
  return upsert(unitPriceStore.cityRules, { city }, headcountKey, rows, rule => rule.city === city)
}
export function saveStorePrices({ storeId, headcountKey, rows }) {
  if (!guaranteeStores.some(store => store.id === storeId)) return '请选择门店'
  if (!headcountTiersOf().some(item => item.key === headcountKey)) return '人数档不存在'
  const error = validateRows(rows)
  if (error) return error
  return upsert(unitPriceStore.storeRules, { storeId }, headcountKey, rows, rule => rule.storeId === storeId)
}
export function savePersonStorePrices({ employeeId, storeId, headcountKey, rows }) {
  if (!employees.some(employee => employee.id === employeeId)) return '请选择客户经理'
  if (!guaranteeStores.some(store => store.id === storeId)) return '请选择门店'
  if (!headcountTiersOf().some(item => item.key === headcountKey)) return '人数档不存在'
  const error = validateRows(rows)
  if (error) return error
  return upsert(unitPriceStore.personStoreRules, { employeeId, storeId }, headcountKey, rows, rule => rule.employeeId === employeeId && rule.storeId === storeId)
}
// 作废沿用旧口径：只失效该对象本级（全部人数档与客次量档），读取时自然回落到上一级。
export function deleteCityPrices(city) { const rule = cityPriceFor(city); if (rule) rule.voidedAt = new Date().toISOString() }
export function deleteStorePrices(storeId) { const rule = storePriceFor(storeId); if (rule) rule.voidedAt = new Date().toISOString() }
export function deletePersonStorePrices(employeeId, storeId) { const rule = personStorePriceFor(employeeId, storeId); if (rule) rule.voidedAt = new Date().toISOString() }

/** 校验客次量档边界：须从 0 开始、左闭右开且首尾相接，末档不设上限。 */
export function validateVolumeTiers(rows) {
  const current = volumeTiersOf()
  if (!Array.isArray(rows) || rows.length !== current.length) return '客次量档数量不可调整'
  if (rows.some((row, index) => row?.key !== current[index].key)) return '客次量档顺序不可调整'
  let prevTo = null
  for (let index = 0; index < rows.length; index++) {
    const { from, to } = rows[index]
    const isLast = index === rows.length - 1
    if (!Number.isInteger(from) || from < 0) return '区间下限须为不小于 0 的整数'
    if (index === 0 && from !== 0) return '第一档下限须从 0 开始'
    if (prevTo !== null && from !== prevTo) return '档位区间须首尾相接：下一档下限等于上一档上限'
    if (isLast) {
      if (to !== null) return '末档不设上限'
    } else if (!Number.isInteger(to) || to <= from) return '区间上限须为大于下限的整数'
    prevTo = isLast ? prevTo : to
  }
  return ''
}

/**
 * 保存客次量档边界（弹窗里每档两个数字框：下限 / 上限）。
 * 档位是全局定义：key 与数量不变，只调区间。
 */
export function saveVolumeTiers(rows) {
  const error = validateVolumeTiers(rows)
  if (error) return error
  const current = volumeTiersOf()
  unitPriceStore.volumeTiers = rows.map((row, index) => {
    const tier = { ...current[index], from: row.from, to: row.to }
    return { ...tier, label: volumeTierLabel(tier) }
  })
  return ''
}
