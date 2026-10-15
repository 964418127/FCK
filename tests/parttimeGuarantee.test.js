import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
const storage = new Map()
globalThis.localStorage = { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) }
const d = await import('../src/stores/parttimeGuarantee.js')
beforeEach(() => Object.assign(d.guaranteeStore, { generalAmount: 2000, cityRules: [], storeRules: [] }))
test('demo seed covers several cities and stores, preserves edits and does not re-add deleted rules', () => {
  const seeded = d.seedDemoGuarantees({ generalAmount: 2100, cityRules: [{ city: '成都', amount: 2500 }], storeRules: [{ storeId: 'xl', amount: 750 }] })
  assert.equal(seeded.generalAmount, 2100)
  assert.equal(seeded.cityRules.find(rule => rule.city === '成都').amount, 2500)
  assert.equal(seeded.storeRules.find(rule => rule.storeId === 'xl').amount, 750)
  assert.equal(seeded.cityRules.length, 3)
  assert.equal(seeded.storeRules.length, 4)
  seeded.cityRules = []; seeded.storeRules = []
  assert.equal(d.seedDemoGuarantees(seeded).cityRules.length, 0)
  for (const city of ['杭州', '北京', '南京', '重庆', '宁波']) {
    assert(d.guaranteeCities.includes(city))
    assert(d.guaranteeStores.some(store => store.city === city))
  }
})
test('unconfigured cities use general amount and a city value overrides it', () => {
  assert.equal(d.matchStoreGuarantee('xl').combinedAmount, 2000)
  assert.equal(d.saveCityGuarantee({ city: '成都', amount: 2400 }), '')
  assert.equal(d.matchStoreGuarantee('xl').combinedAmount, 2400)
  assert.equal(d.saveGeneralGuarantee(2200), '')
  assert.equal(d.matchStoreGuarantee('xl').combinedAmount, 2400)
  d.deleteCityGuarantee('成都')
  assert.equal(d.matchStoreGuarantee('xl').combinedAmount, 2200)
  assert.equal(d.matchStoreGuarantee('xl').source, 'general')
})
test('store amount adds to city value; voiding retains history and allows replacement', () => {
  d.saveCityGuarantee({ city: '成都', amount: 2000 })
  assert.equal(d.saveStoreGuarantee({ storeId: 'xl', amount: 500.15 }), '')
  assert.equal(d.matchStoreGuarantee('xl').combinedAmount, 2500.15)
  d.saveStoreGuarantee({ storeId: 'xl', amount: 600 })
  assert.equal(d.guaranteeStore.storeRules.length, 1)
  assert.equal(d.matchStoreGuarantee('xl').combinedAmount, 2600)
  d.deleteStoreGuarantee('xl')
  assert.equal(d.guaranteeStore.storeRules.length, 1)
  assert.ok(d.guaranteeStore.storeRules[0].voidedAt)
  assert.equal(d.matchStoreGuarantee('xl').combinedAmount, 2000)
  d.saveStoreGuarantee({ storeId: 'xl', amount: 700 })
  assert.equal(d.guaranteeStore.storeRules.length, 2)
  assert.equal(d.matchStoreGuarantee('xl').combinedAmount, 2700)
})
test('zero is configured explicitly and invalid amounts cannot overwrite state', () => {
  assert.equal(d.saveCityGuarantee({ city: '成都', amount: 0 }), '')
  assert.equal(d.matchStoreGuarantee('xl').combinedAmount, 0)
  for (const amount of [-1, NaN, Infinity, null]) assert.match(d.saveGeneralGuarantee(amount), /非负/)
  assert.match(d.saveCityGuarantee({ city: '', amount: 2000 }), /城市/)
  assert.match(d.saveStoreGuarantee({ storeId: 'unknown', amount: 500 }), /门店/)
  assert.equal(d.guaranteeStore.generalAmount, 2000)
})
test('voiding a city voids its child configurations and uses general amount', () => {
  d.saveCityGuarantee({ city: '成都', amount: 2400 })
  d.saveStoreGuarantee({ storeId: 'xl', amount: 500 })
  d.deleteCityGuarantee('成都')
  assert.equal(d.guaranteeStore.storeRules.length, 1)
  assert.ok(d.guaranteeStore.storeRules[0].voidedAt)
  assert.equal(d.matchStoreGuarantee('xl').combinedAmount, 2000)
  d.saveCityGuarantee({ city: '成都', amount: 2600 })
  assert.equal(d.matchStoreGuarantee('xl').combinedAmount, 2600)
})
test('legacy current monthly values migrate while disabled rules remain absent', () => {
  const legacy = {
    generalRules: [{ effectiveMonth: '2026-09', baseMonthly: 2000 }],
    cityRules: [{ city: '成都', effectiveMonth: '2026-09', baseMonthly: 2500 }],
    storeRules: [{ storeId: 'xl', effectiveMonth: '2026-09', income: { '2026-06': 4000, '2026-07': 4500, '2026-08': 5000 }, tiers: [{ lower: 0, upper: null, monthlyAdd: 500 }] }]
  }
  const migrated = d.migrateLegacyGuarantee(legacy, '2026-09')
  assert.deepEqual(migrated, { generalAmount: 2000, cityRules: [{ city: '成都', amount: 2500 }], storeRules: [{ storeId: 'xl', amount: 500 }] })
  legacy.cityRules.push({ city: '成都', effectiveMonth: '2026-09', enabled: false })
  legacy.cityRules[0].effectiveMonth = '2026-08'
  assert.deepEqual(d.migrateLegacyGuarantee(legacy, '2026-09').cityRules, [])
  assert.equal(storage.has('fck_parttime_guarantee_v2'), true)
})
