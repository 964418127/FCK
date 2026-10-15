import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
const storage = new Map()
globalThis.localStorage = { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) }
const d = await import('../src/stores/parttimeUnitPrices.js')
const baseline = JSON.parse(JSON.stringify(d.unitPriceStore))
beforeEach(() => Object.assign(d.unitPriceStore, JSON.parse(JSON.stringify(baseline))))

test('each item resolves through person at store, store, then city', () => {
  assert.deepEqual(d.resolveUnitPrices(100, 'xl'), {
    error: '', prices: { newCustomer: 28, review: 5, visit: 14 },
    sources: { newCustomer: '个人', review: '城市', visit: '个人' }
  })
  assert.deepEqual(d.resolveUnitPrices(100, 'ls'), {
    error: '', prices: { newCustomer: 20, review: 7, visit: 12 },
    sources: { newCustomer: '城市', review: '个人', visit: '城市' }
  })
  assert.equal(d.resolveUnitPrices(101, 'xl').prices.newCustomer, 24)
  assert.equal(d.resolveUnitPrices(101, 'xl').sources.newCustomer, '门店')
})

test('personal configuration is keyed by employee and store independently', () => {
  assert.equal(d.savePersonStorePrices({ employeeId: 100, storeId: 'ls', prices: { newCustomer: 35 } }), '')
  assert.equal(d.resolveUnitPrices(100, 'ls').prices.newCustomer, 35)
  assert.equal(d.resolveUnitPrices(100, 'xl').prices.newCustomer, 28)
  assert.equal(d.unitPriceStore.personStoreRules.filter(rule => rule.employeeId === 100).length, 2)
  d.deletePersonStorePrices(100, 'ls')
  assert.equal(d.resolveUnitPrices(100, 'ls').prices.newCustomer, 20)
  assert.equal(d.resolveUnitPrices(100, 'xl').prices.newCustomer, 28)
})

test('zero is an explicit override and deleting levels restores per-item inheritance', () => {
  assert.equal(d.savePersonStorePrices({ employeeId: 101, storeId: 'xl', prices: { review: 0 } }), '')
  assert.equal(d.resolveUnitPrices(101, 'xl').prices.review, 0)
  assert.equal(d.resolveUnitPrices(101, 'xl').sources.review, '个人')
  d.deleteStorePrices('xl')
  assert.equal(d.resolveUnitPrices(101, 'xl').prices.newCustomer, 20)
  d.deleteCityPrices('成都')
  assert.equal(d.resolveUnitPrices(101, 'xl').prices.newCustomer, 18)
  assert.equal(d.resolveUnitPrices(101, 'xl').prices.review, 0)
  assert.equal(d.resolveUnitPrices(101, 'xl').sources.newCustomer, '通用')
})

test('invalid prices and identities are rejected', () => {
  assert.match(d.saveGeneralPrices({ newCustomer: 10 }), /三项/)
  assert.match(d.saveCityPrices({ city: '成都', prices: {} }), /至少/)
  assert.match(d.saveStorePrices({ storeId: 'xl', prices: {} }), /至少/)
  assert.match(d.saveStorePrices({ storeId: 'xl', prices: { visit: -1 } }), /至少/)
  assert.match(d.savePersonStorePrices({ employeeId: 999, storeId: 'xl', prices: { visit: 1 } }), /客户经理/)
  assert.match(d.savePersonStorePrices({ employeeId: 100, storeId: 'missing', prices: { visit: 1 } }), /门店/)
  assert.equal(d.resolveUnitPrices(100, 'missing').error, '门店不存在')
})

test('city prices inherit each missing item from general, including after edits', () => {
  assert.equal(d.saveCityPrices({ city: '成都', prices: { review: 0 } }), '')
  assert.deepEqual(d.resolveCityPrices('成都'), {
    prices: { newCustomer: 18, review: 0, visit: 10 },
    sources: { newCustomer: '通用', review: '城市', visit: '通用' }
  })
  assert.equal(d.saveGeneralPrices({ newCustomer: 22, review: 6, visit: 11 }), '')
  assert.equal(d.resolveUnitPrices(101, 'xl').prices.newCustomer, 24)
  assert.equal(d.resolveUnitPrices(101, 'xl').prices.review, 0)
  assert.equal(d.resolveUnitPrices(101, 'xl').prices.visit, 11)
  d.deleteCityPrices('成都')
  assert.equal(d.resolveUnitPrices(101, 'xl').prices.review, 6)
})

test('voided rules remain in history and can be configured again', () => {
  d.deleteCityPrices('成都')
  assert.ok(d.unitPriceStore.cityRules[0].voidedAt)
  assert.equal(d.cityPriceFor('成都'), null)
  assert.equal(d.saveCityPrices({ city: '成都', prices: { visit: 30 } }), '')
  assert.equal(d.unitPriceStore.cityRules.filter(rule => rule.city === '成都').length, 2)
  assert.equal(d.resolveCityPrices('成都').prices.visit, 30)
  d.deletePersonStorePrices(100, 'xl')
  assert.equal(d.savePersonStorePrices({ employeeId: 100, storeId: 'xl', prices: { review: 12 } }), '')
  assert.equal(d.resolveUnitPrices(100, 'xl').prices.review, 12)
})

test('existing stored rules gain the general defaults without losing overrides', () => {
  const old = JSON.parse(JSON.stringify(baseline))
  delete old.generalPrices
  assert.equal(old.cityRules[0].prices.newCustomer, 20)
  assert.equal(d.saveGeneralPrices({ newCustomer: 18, review: 4, visit: 10 }), '')
  assert.equal(d.resolveUnitPrices(100, 'xl').prices.newCustomer, 28)
  assert.equal(d.resolveUnitPrices(100, 'ls').prices.review, 7)
})
