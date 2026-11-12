import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
const storage = new Map()
globalThis.localStorage = { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) }
const d = await import('../src/stores/parttimeGuarantee.js')
beforeEach(() => Object.assign(d.guaranteeStore, { generalAmount: 25, cityRules: [], storeRules: [] }))
test('demo seed covers several cities and stores, preserves edits and does not re-add deleted rules', () => {
  const seeded = d.seedDemoGuarantees({ generalAmount: 26, cityRules: [{ city: '成都', amount: 28 }], storeRules: [{ storeId: 'xl', amount: 2 }] })
  assert.equal(seeded.generalAmount, 26)
  assert.equal(seeded.cityRules.find(rule => rule.city === '成都').amount, 28)
  assert.equal(seeded.storeRules.find(rule => rule.storeId === 'xl').amount, 2)
  assert.equal(seeded.cityRules.length, 3)
  assert.equal(seeded.storeRules.length, 4)
  seeded.cityRules = []; seeded.storeRules = []
  assert.equal(d.seedDemoGuarantees(seeded).cityRules.length, 0)
  for (const city of ['杭州', '北京', '南京', '重庆', '宁波']) {
    assert(d.guaranteeCities.includes(city))
    assert(d.guaranteeStores.some(store => store.city === city))
  }
})
test('unconfigured cities use general hourly rate and a city value overrides it', () => {
  assert.equal(d.matchStoreGuarantee('xl').combinedAmount, 25)
  assert.equal(d.saveCityGuarantee({ city: '成都', amount: 28 }), '')
  assert.equal(d.matchStoreGuarantee('xl').combinedAmount, 28)
  assert.equal(d.saveGeneralGuarantee(26), '')
  assert.equal(d.matchStoreGuarantee('xl').combinedAmount, 28)
  d.deleteCityGuarantee('成都')
  assert.equal(d.matchStoreGuarantee('xl').combinedAmount, 26)
  assert.equal(d.matchStoreGuarantee('xl').source, 'general')
})
test('store amount adds to city rate; voiding retains history and allows replacement', () => {
  d.saveCityGuarantee({ city: '成都', amount: 25 })
  assert.equal(d.saveStoreGuarantee({ storeId: 'xl', amount: 2.15 }), '')
  assert.equal(d.matchStoreGuarantee('xl').combinedAmount, 27.15)
  d.saveStoreGuarantee({ storeId: 'xl', amount: 3 })
  assert.equal(d.guaranteeStore.storeRules.length, 1)
  assert.equal(d.matchStoreGuarantee('xl').combinedAmount, 28)
  d.deleteStoreGuarantee('xl')
  assert.equal(d.guaranteeStore.storeRules.length, 1)
  assert.ok(d.guaranteeStore.storeRules[0].voidedAt)
  assert.equal(d.matchStoreGuarantee('xl').combinedAmount, 25)
  d.saveStoreGuarantee({ storeId: 'xl', amount: 4 })
  assert.equal(d.guaranteeStore.storeRules.length, 2)
  assert.equal(d.matchStoreGuarantee('xl').combinedAmount, 29)
})
test('zero is configured explicitly and invalid amounts cannot overwrite state', () => {
  assert.equal(d.saveCityGuarantee({ city: '成都', amount: 0 }), '')
  assert.equal(d.matchStoreGuarantee('xl').combinedAmount, 0)
  for (const amount of [-1, NaN, Infinity, null]) assert.match(d.saveGeneralGuarantee(amount), /非负/)
  assert.match(d.saveCityGuarantee({ city: '', amount: 25 }), /城市/)
  assert.match(d.saveStoreGuarantee({ storeId: 'unknown', amount: 5 }), /门店/)
  assert.equal(d.guaranteeStore.generalAmount, 25)
})
test('voiding a city voids its child configurations and uses general rate', () => {
  d.saveCityGuarantee({ city: '成都', amount: 28 })
  d.saveStoreGuarantee({ storeId: 'xl', amount: 2 })
  d.deleteCityGuarantee('成都')
  assert.equal(d.guaranteeStore.storeRules.length, 1)
  assert.ok(d.guaranteeStore.storeRules[0].voidedAt)
  assert.equal(d.matchStoreGuarantee('xl').combinedAmount, 25)
  d.saveCityGuarantee({ city: '成都', amount: 29 })
  assert.equal(d.matchStoreGuarantee('xl').combinedAmount, 29)
})
test('legacy current monthly values migrate to hourly while disabled rules remain absent', () => {
  const legacy = {
    generalRules: [{ effectiveMonth: '2026-09', baseMonthly: 2000 }],
    cityRules: [{ city: '成都', effectiveMonth: '2026-09', baseMonthly: 2500 }],
    storeRules: [{ storeId: 'xl', effectiveMonth: '2026-09', income: { '2026-06': 4000, '2026-07': 4500, '2026-08': 5000 }, tiers: [{ lower: 0, upper: null, monthlyAdd: 500 }] }]
  }
  const migrated = d.migrateLegacyGuarantee(legacy, '2026-09')
  assert.deepEqual(migrated, { generalAmount: 25, cityRules: [{ city: '成都', amount: 31.25 }], storeRules: [{ storeId: 'xl', amount: 6.25 }] })
  legacy.cityRules.push({ city: '成都', effectiveMonth: '2026-09', enabled: false })
  legacy.cityRules[0].effectiveMonth = '2026-08'
  assert.deepEqual(d.migrateLegacyGuarantee(legacy, '2026-09').cityRules, [])
  assert.equal(storage.has('fck_parttime_guarantee_v2'), true)
})
test('v1 monthly demo seed converts to hourly amounts in place', () => {
  const converted = d.seedDemoGuarantees({ demoSeedVersion: 1, generalAmount: 2000, cityRules: [{ city: '成都', amount: 2400 }], storeRules: [{ storeId: 'xl', amount: 500 }] })
  assert.equal(converted.demoSeedVersion, 3)
  assert.equal(converted.generalAmount, 25)
  assert.equal(converted.cityRules[0].amount, 30)
  assert.equal(converted.storeRules[0].amount, 6.25)
  // 已是 v3 的数据不再动
  assert.equal(d.seedDemoGuarantees({ demoSeedVersion: 3, generalAmount: 999, cityRules: [], storeRules: [] }).generalAmount, 999)
})
test('v2 weekly demo seed converts to hourly amounts in place', () => {
  const converted = d.seedDemoGuarantees({ demoSeedVersion: 2, generalAmount: 500, cityRules: [{ city: '成都', amount: 600 }], storeRules: [{ storeId: 'xl', amount: 125 }] })
  assert.equal(converted.demoSeedVersion, 3)
  assert.equal(converted.generalAmount, 25)
  assert.equal(converted.cityRules[0].amount, 30)
  assert.equal(converted.storeRules[0].amount, 6.25)
})
test('guarantee amount equals clocked effective hours times hourly rate', () => {
  // 兴隆湖：成都 28 + 差异额 2 = 30 元/小时；21.5 小时 → 645
  d.saveCityGuarantee({ city: '成都', amount: 28 })
  d.saveStoreGuarantee({ storeId: 'xl', amount: 2 })
  assert.deepEqual(d.guaranteeAmountOf(21.5, 'xl'), { error: '', hours: 21.5, hourlyRate: 30, amount: 645 })
  // 未配差异额的门店用城市时薪
  assert.equal(d.guaranteeAmountOf(20, 'ls').hourlyRate, 28)
  // 工时非法 / 门店不存在
  assert.match(d.guaranteeAmountOf(-1, 'xl').error, /非负/)
  assert.match(d.guaranteeAmountOf(20, 'unknown').error, /门店/)
  // 收入合计不足保底才补差
  const base = d.guaranteeAmountOf(21.5, 'xl').amount
  const others = 240 + 14 + 216 + 153
  assert.equal(Math.max(0, base - others), 22)
  assert.equal(Math.max(0, d.guaranteeAmountOf(22, 'xl').amount - 617), 43)
})
