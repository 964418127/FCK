import { reactive, watch } from 'vue'
import { stores } from './parttimeTasks.js'

const STORAGE_KEY = 'fck_parttime_guarantee_v2'
export const guaranteeCities = ['成都', '杭州', '北京', '南京', '重庆', '宁波', '西安']
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
]
const validAmount = value => typeof value === 'number' && Number.isFinite(value) && value >= 0
const initialState = () => ({ generalAmount: 2000, cityRules: [], storeRules: [] })
export function seedDemoGuarantees(state) {
  if (state.demoSeedVersion === 1) return state
  const cityRules = [{ city: '成都', amount: 2400 }, { city: '杭州', amount: 2600 }, { city: '北京', amount: 2800 }]
  const storeRules = [{ storeId: 'xl', amount: 500 }, { storeId: 'ls', amount: 300 }, { storeId: 'guarantee-hz-binjiang', amount: 600 }, { storeId: 'guarantee-bj-wangjing', amount: 800 }]
  return {
    ...state, demoSeedVersion: 1,
    cityRules: [...state.cityRules, ...cityRules.filter(rule => !state.cityRules.some(item => item.city === rule.city))],
    storeRules: [...state.storeRules, ...storeRules.filter(rule => !state.storeRules.some(item => item.storeId === rule.storeId))]
  }
}
const validState = state => state && validAmount(state.generalAmount) && Array.isArray(state.cityRules) && Array.isArray(state.storeRules) && state.cityRules.every(rule => typeof rule.city === 'string' && validAmount(rule.amount)) && state.storeRules.every(rule => guaranteeStores.some(store => store.id === rule.storeId) && validAmount(rule.amount))

// 将旧版档位配置转换为当前月的单一月保底金额，保留旧存储以便追溯。
export function migrateLegacyGuarantee(legacy, month) {
  const latest = rules => [...(rules || [])].filter(rule => rule.effectiveMonth <= month).sort((a, b) => b.effectiveMonth.localeCompare(a.effectiveMonth))[0]
  const general = latest(legacy.generalRules)
  const state = { generalAmount: general?.baseMonthly ?? 2000, cityRules: [], storeRules: [] }
  for (const city of new Set((legacy.cityRules || []).map(rule => rule.city))) {
    const rule = latest(legacy.cityRules.filter(rule => rule.city === city))
    if (rule && rule.enabled !== false) state.cityRules.push({ city, amount: rule.baseMonthly })
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
    if (tier && validAmount(tier.monthlyAdd)) state.storeRules.push({ storeId: store.id, amount: tier.monthlyAdd })
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
