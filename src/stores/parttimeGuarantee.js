import { reactive, watch } from 'vue'
import { stores } from './parttimeTasks.js'

const STORAGE_KEY = 'fck_parttime_guarantee_v2'
export const guaranteeCities = ['成都', '杭州', '北京', '南京', '重庆', '宁波', '西安']
// 门店事实：配置的全职客户经理人数、天均客次量。单价配置按这两项决定落在哪一格，页面只读。
const storeFactsById = {
  xl: { fullTimeCount: 2, avgDailyVisits: 26 },
  ls: { fullTimeCount: 1, avgDailyVisits: 32 },
  'guarantee-hz-binjiang': { fullTimeCount: 3, avgDailyVisits: 45 },
  'guarantee-hz-wulin': { fullTimeCount: 1, avgDailyVisits: 12 },
  'guarantee-bj-wangjing': { fullTimeCount: 2, avgDailyVisits: 38 },
  'guarantee-bj-guomao': { fullTimeCount: 3, avgDailyVisits: 55 },
  'guarantee-nj-xinjiekou': { fullTimeCount: 1, avgDailyVisits: 8 },
  'guarantee-cq-guanyinqiao': { fullTimeCount: 2, avgDailyVisits: 22 },
  'guarantee-nb-yinzhou': { fullTimeCount: 1, avgDailyVisits: 18 },
  'guarantee-xa-gaoxin': { fullTimeCount: 4, avgDailyVisits: 62 }
}
export const guaranteeStores = [
  ...stores.map(store => ({ ...store, city: '成都' })),
  { id: 'guarantee-hz-binjiang', code: 'HZ001', name: '滨江店', city: '杭州' },
  { id: 'guarantee-hz-wulin', code: 'HZ002', name: '武林店', city: '杭州' },
  { id: 'guarantee-bj-wangjing', code: 'BJ001', name: '望京店', city: '北京' },
  { id: 'guarantee-bj-guomao', code: 'BJ002', name: '国贸店', city: '北京' },
  { id: 'guarantee-nj-xinjiekou', code: 'NJ001', name: '新街口店', city: '南京' },
  { id: 'guarantee-cq-guanyinqiao', code: 'CQ001', name: '观音桥店', city: '重庆' },
  { id: 'guarantee-nb-yinzhou', code: 'NB001', name: '鄞州店', city: '宁波' },
  { id: 'guarantee-xa-gaoxin', code: 'XA001', name: '高新店', city: '西安' }
].map(store => ({ ...store, ...(storeFactsById[store.id] || {}) }))
const validAmount = value => typeof value === 'number' && Number.isFinite(value) && value >= 0
// 保底按时薪配置（2026-11-10 与业务核对后由周改小时）：保底金额不按周给整数，而是 = 打卡有效工时 × 保底时薪
const initialState = () => ({ generalAmount: 25, cityRules: [], storeRules: [] })
const HOURLY_CITY_RULES = [{ city: '成都', amount: 28 }, { city: '杭州', amount: 30 }, { city: '北京', amount: 32 }]
const HOURLY_STORE_RULES = [{ storeId: 'xl', amount: 2 }, { storeId: 'ls', amount: 1 }, { storeId: 'guarantee-hz-binjiang', amount: 3 }, { storeId: 'guarantee-bj-wangjing', amount: 4 }]
export function seedDemoGuarantees(state) {
  if (state.demoSeedVersion === 3) return state
  if (state.demoSeedVersion === 2) {
    // v2 演示数据按周配置：就地按「每周 20 个保底工时」折算成时薪，避免出现 500 元/小时 这类怪数
    const toHourly = value => Math.round(value / 20 * 100) / 100
    state.generalAmount = toHourly(state.generalAmount)
    for (const rule of state.cityRules) if (!rule.voidedAt) rule.amount = toHourly(rule.amount)
    for (const rule of state.storeRules) if (!rule.voidedAt) rule.amount = toHourly(rule.amount)
    state.demoSeedVersion = 3
    return state
  }
  if (state.demoSeedVersion === 1) {
    // v1 演示数据按月配置：月 ÷ 4 周 ÷ 20 工时 = 月 ÷ 80 折算成时薪
    const toHourly = value => Math.round(value / 80 * 100) / 100
    state.generalAmount = toHourly(state.generalAmount)
    for (const rule of state.cityRules) if (!rule.voidedAt) rule.amount = toHourly(rule.amount)
    for (const rule of state.storeRules) if (!rule.voidedAt) rule.amount = toHourly(rule.amount)
    state.demoSeedVersion = 3
    return state
  }
  const cityRules = [...state.cityRules, ...HOURLY_CITY_RULES.filter(rule => !state.cityRules.some(item => item.city === rule.city))]
  const storeRules = [...state.storeRules, ...HOURLY_STORE_RULES.filter(rule => !state.storeRules.some(item => item.storeId === rule.storeId))]
  return { ...state, demoSeedVersion: 3, cityRules, storeRules }
}
const validState = state => state && validAmount(state.generalAmount) && Array.isArray(state.cityRules) && Array.isArray(state.storeRules) && state.cityRules.every(rule => typeof rule.city === 'string' && validAmount(rule.amount)) && state.storeRules.every(rule => guaranteeStores.some(store => store.id === rule.storeId) && validAmount(rule.amount))

// 将旧版档位配置转换为当前的单一保底时薪（月额按 一个月 4 周 × 每周 20 保底工时 = 80 折算），保留旧存储以便追溯。
export function migrateLegacyGuarantee(legacy, month) {
  const toHourly = value => Math.round(value / 80 * 100) / 100
  const latest = rules => [...(rules || [])].filter(rule => rule.effectiveMonth <= month).sort((a, b) => b.effectiveMonth.localeCompare(a.effectiveMonth))[0]
  const general = latest(legacy.generalRules)
  const state = { generalAmount: general ? toHourly(general.baseMonthly ?? 2000) : 25, cityRules: [], storeRules: [] }
  for (const city of new Set((legacy.cityRules || []).map(rule => rule.city))) {
    const rule = latest(legacy.cityRules.filter(rule => rule.city === city))
    if (rule && rule.enabled !== false) state.cityRules.push({ city, amount: toHourly(rule.baseMonthly) })
  }
  const [year, number] = month.split('-').map(Number)
  const months = [-3, -2, -1].map(offset => {
    const date = new Date(year, number - 1 + offset, 1)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  })
  for (const store of guaranteeStores) {
    const rule = latest((legacy.storeRules || []).filter(rule => rule.storeId === store.id))
    if (!rule || rule.enabled === false || months.some(key => !validAmount(rule.income?.[key]))) continue
    const average = months.reduce((sum, key) => sum + rule.income[key], 0) / 3
    const tier = rule.tiers?.find(item => average >= item.lower && (item.upper === null || average < item.upper))
    if (tier && validAmount(tier.monthlyAdd)) state.storeRules.push({ storeId: store.id, amount: toHourly(tier.monthlyAdd) })
  }
  return validState(state) ? state : initialState()
}
function load() {
  try {
    const state = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (validState(state)) return seedDemoGuarantees(state)
    const legacy = JSON.parse(localStorage.getItem('fck_parttime_guarantee_v1'))
    if (legacy) {
      const now = new Date()
      return seedDemoGuarantees(migrateLegacyGuarantee(legacy, `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`))
    }
  } catch { /* 存储不可用时使用会话内默认值。 */ }
  return seedDemoGuarantees(initialState())
}
export const guaranteeStore = reactive(load())
let externalUpdate = false
watch(guaranteeStore, state => {
  if (externalUpdate) return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* 保留会话内配置。 */ }
}, { deep: true, flush: 'sync', immediate: true })
if (typeof window !== 'undefined') window.addEventListener('storage', event => {
  if (event.key !== STORAGE_KEY || !event.newValue) return
  try {
    const state = JSON.parse(event.newValue)
    if (!validState(state)) return
    externalUpdate = true
    Object.assign(guaranteeStore, state)
  } catch { /* 忽略无效存储数据。 */ }
  finally { externalUpdate = false }
})
const upsert = (rules, rule, key) => {
  const index = rules.findIndex(item => item[key] === rule[key] && !item.voidedAt)
  if (index === -1) rules.push(rule)
  else rules.splice(index, 1, rule)
}
export const cityRuleFor = city => guaranteeStore.cityRules.find(rule => rule.city === city && !rule.voidedAt) || null
export const storeRuleFor = storeId => guaranteeStore.storeRules.find(rule => rule.storeId === storeId && !rule.voidedAt) || null
export function saveGeneralGuarantee(amount) {
  if (!validAmount(amount)) return '请填写非负保底金额'
  guaranteeStore.generalAmount = amount
  return ''
}
export function saveCityGuarantee({ city, amount }) {
  if (!guaranteeCities.includes(city)) return '请选择城市'
  if (!validAmount(amount)) return '请填写非负保底金额'
  upsert(guaranteeStore.cityRules, { city, amount }, 'city')
  return ''
}
export function saveStoreGuarantee({ storeId, amount }) {
  if (!guaranteeStores.some(store => store.id === storeId)) return '请选择门店'
  if (!validAmount(amount)) return '请填写非负门店差异额'
  upsert(guaranteeStore.storeRules, { storeId, amount }, 'storeId')
  return ''
}
export function deleteCityGuarantee(city) {
  const voidedAt = new Date().toISOString()
  for (const rule of guaranteeStore.cityRules) if (rule.city === city && !rule.voidedAt) rule.voidedAt = voidedAt
  const storeIds = new Set(guaranteeStores.filter(store => store.city === city).map(store => store.id))
  for (const rule of guaranteeStore.storeRules) if (storeIds.has(rule.storeId) && !rule.voidedAt) rule.voidedAt = voidedAt
}
export function deleteStoreGuarantee(storeId) {
  const rule = storeRuleFor(storeId)
  if (rule) rule.voidedAt = new Date().toISOString()
}
export function matchStoreGuarantee(storeId) {
  const store = guaranteeStores.find(store => store.id === storeId)
  if (!store) return { error: '门店不存在' }
  const city = cityRuleFor(store.city)
  const rule = storeRuleFor(storeId)
  const cityAmount = city?.amount ?? guaranteeStore.generalAmount
  const storeAmount = rule?.amount ?? 0
  return { error: '', source: city ? 'city' : 'general', cityAmount, storeAmount, combinedAmount: Math.round((cityAmount + storeAmount) * 100) / 100 }
}
/**
 * 保底金额 = 打卡有效工时 × 保底时薪（2026-11-10 口径）。
 * hours 由打卡侧提供：每个已履约任务按「打卡离店 − 打卡到店」计，缺卡不计；
 * 时薪按 通用 → 城市覆盖 → 门店差异额 解析（matchStoreGuarantee）。
 */
export function guaranteeAmountOf(hours, storeId) {
  const match = matchStoreGuarantee(storeId)
  if (match.error) return match
  if (!Number.isFinite(hours) || hours < 0) return { error: '有效工时须为非负数' }
  return { error: '', hours, hourlyRate: match.combinedAmount, amount: Math.round(match.combinedAmount * hours * 100) / 100 }
}
