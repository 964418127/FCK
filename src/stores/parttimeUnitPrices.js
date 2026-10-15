import { reactive, watch } from 'vue'
import { employees } from './parttimeTasks.js'
import { guaranteeCities, guaranteeStores } from './parttimeGuarantee.js'

const STORAGE_KEY = 'fck_parttime_unit_prices_v1'
export const priceItems = [
  { key: 'newCustomer', label: '新客' },
  { key: 'review', label: '评价' },
  { key: 'visit', label: '客次' }
]
const initialState = () => ({
  generalPrices: { newCustomer: 18, review: 4, visit: 10 },
  cityRules: [
    { city: '成都', prices: { newCustomer: 20, review: 5, visit: 12 } },
    { city: '杭州', prices: { newCustomer: 25, review: 6, visit: 15 } },
    { city: '北京', prices: { newCustomer: 30, review: 8, visit: 18 } }
  ],
  storeRules: [{ storeId: 'xl', prices: { newCustomer: 24 } }, { storeId: 'guarantee-hz-binjiang', prices: { visit: 17 } }],
  personStoreRules: [
    { employeeId: 100, storeId: 'xl', prices: { newCustomer: 28, visit: 14 } },
    { employeeId: 100, storeId: 'ls', prices: { review: 7 } }
  ]
})
const validPrices = (prices, complete = false) => prices && typeof prices === 'object' && priceItems.every(item => {
  const value = prices[item.key]
  return value === undefined ? !complete : typeof value === 'number' && Number.isFinite(value) && value >= 0
}) && Object.keys(prices).every(key => priceItems.some(item => item.key === key))
const validState = state => state && Array.isArray(state.cityRules) && Array.isArray(state.storeRules) && Array.isArray(state.personStoreRules)
  && (state.generalPrices === undefined || validPrices(state.generalPrices, true))
  && state.cityRules.every(rule => guaranteeCities.includes(rule.city) && validPrices(rule.prices))
  && state.storeRules.every(rule => guaranteeStores.some(store => store.id === rule.storeId) && validPrices(rule.prices))
  && state.personStoreRules.every(rule => employees.some(employee => employee.id === rule.employeeId) && guaranteeStores.some(store => store.id === rule.storeId) && validPrices(rule.prices))
function load() {
  try { const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY)); if (validState(parsed)) return { ...parsed, generalPrices: parsed.generalPrices || initialState().generalPrices } } catch { /* 首次访问使用演示数据。 */ }
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
    const parsed = JSON.parse(event.newValue)
    if (!validState(parsed)) return
    externalUpdate = true
    Object.assign(unitPriceStore, { ...parsed, generalPrices: parsed.generalPrices || initialState().generalPrices })
  } catch { /* 忽略无效存储数据。 */ }
  finally { externalUpdate = false }
})
const upsert = (list, rule, sameOwner) => {
  const index = list.findIndex(rule => !rule.voidedAt && sameOwner(rule))
  if (index === -1) list.push(rule)
  else list.splice(index, 1, rule)
}
export const cityPriceFor = city => unitPriceStore.cityRules.find(rule => rule.city === city && !rule.voidedAt) || null
export const storePriceFor = storeId => unitPriceStore.storeRules.find(rule => rule.storeId === storeId && !rule.voidedAt) || null
export const personStorePriceFor = (employeeId, storeId) => unitPriceStore.personStoreRules.find(rule => rule.employeeId === employeeId && rule.storeId === storeId && !rule.voidedAt) || null
export function saveGeneralPrices(prices) {
  if (!validPrices(prices, true)) return '请填写三项非负单价'
  unitPriceStore.generalPrices = { ...prices }
  return ''
}
export function saveCityPrices({ city, prices }) {
  if (!guaranteeCities.includes(city)) return '请选择城市'
  if (!validPrices(prices) || !Object.keys(prices).length) return '请至少配置一项非负单价'
  upsert(unitPriceStore.cityRules, { city, prices: { ...prices } }, rule => rule.city === city)
  return ''
}
export function saveStorePrices({ storeId, prices }) {
  if (!guaranteeStores.some(store => store.id === storeId)) return '请选择门店'
  if (!validPrices(prices) || !Object.keys(prices).length) return '请至少配置一项非负单价'
  upsert(unitPriceStore.storeRules, { storeId, prices: { ...prices } }, rule => rule.storeId === storeId)
  return ''
}
export function savePersonStorePrices({ employeeId, storeId, prices }) {
  if (!employees.some(employee => employee.id === employeeId)) return '请选择客户经理'
  if (!guaranteeStores.some(store => store.id === storeId)) return '请选择门店'
  if (!validPrices(prices) || !Object.keys(prices).length) return '请至少配置一项非负单价'
  upsert(unitPriceStore.personStoreRules, { employeeId, storeId, prices: { ...prices } }, rule => rule.employeeId === employeeId && rule.storeId === storeId)
  return ''
}
export function deleteCityPrices(city) { const rule = cityPriceFor(city); if (rule) rule.voidedAt = new Date().toISOString() }
export function deleteStorePrices(storeId) { const rule = storePriceFor(storeId); if (rule) rule.voidedAt = new Date().toISOString() }
export function deletePersonStorePrices(employeeId, storeId) { const rule = personStorePriceFor(employeeId, storeId); if (rule) rule.voidedAt = new Date().toISOString() }
export function resolveCityPrices(city) {
  const configured = cityPriceFor(city)?.prices || {}
  return {
    prices: Object.fromEntries(priceItems.map(item => [item.key, configured[item.key] ?? unitPriceStore.generalPrices[item.key]])),
    sources: Object.fromEntries(priceItems.map(item => [item.key, configured[item.key] !== undefined ? '城市' : '通用']))
  }
}
export function resolveUnitPrices(employeeId, storeId) {
  const store = guaranteeStores.find(item => item.id === storeId)
  if (!store) return { error: '门店不存在' }
  const city = resolveCityPrices(store.city)
  const branch = storePriceFor(storeId)?.prices || {}
  const personal = employeeId == null ? {} : personStorePriceFor(employeeId, storeId)?.prices || {}
  return { error: '', prices: Object.fromEntries(priceItems.map(item => {
    const key = item.key
    return [key, personal[key] ?? branch[key] ?? city.prices[key]]
  })), sources: Object.fromEntries(priceItems.map(item => {
    const key = item.key
    return [key, personal[key] !== undefined ? '个人' : branch[key] !== undefined ? '门店' : city.sources[key]]
  })) }
}
