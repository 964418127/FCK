import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
const storage = new Map()
globalThis.localStorage = { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) }
const d = await import('../src/stores/parttimeUnitPrices.js')
const baseline = JSON.parse(JSON.stringify(d.unitPriceStore))
beforeEach(() => {
  for (const key of Object.keys(d.unitPriceStore)) delete d.unitPriceStore[key]
  Object.assign(d.unitPriceStore, JSON.parse(JSON.stringify(baseline)))
})

test('人数与客次量共同决定落哪一格', () => {
  assert.equal(d.headcountKeyOf(1), 'hc1')
  assert.equal(d.headcountKeyOf(2), 'hc2')
  assert.equal(d.headcountKeyOf(3), 'hc3')
  assert.equal(d.headcountKeyOf(4), 'hc3', '4 人及以上取最高人数档')
  assert.equal(d.headcountKeyOf(undefined), 'hc1', '人数取不到按 1 人档并带标记')
  assert.equal(d.volumeTierKeyOf(0), 't1', '0 次是有效事实')
  assert.equal(d.volumeTierKeyOf(29.9), 't1')
  assert.equal(d.volumeTierKeyOf(30), 't2', '区间左闭右开，30 归第二档')
  assert.equal(d.volumeTierKeyOf(40), 't3')
  assert.equal(d.volumeTierKeyOf(undefined), null)
})

test('同一格内按个人 → 门店 → 城市 → 通用逐项取值', () => {
  // 兴隆湖店：2 名全职、天均 26 次 → hc2.t1
  const personal = d.resolveUnitPrices(100, 'xl')
  assert.equal(personal.headcountKey, 'hc2')
  assert.equal(personal.volumeTierKey, 't1')
  assert.deepEqual(personal.prices, { newCustomer: 28, review: 4, visit: 15 })
  assert.deepEqual(personal.sources, { newCustomer: '个人', review: '通用', visit: '个人' })

  const branch = d.resolveUnitPrices(101, 'xl')
  assert.deepEqual(branch.prices, { newCustomer: 22, review: 4, visit: 14 })
  assert.deepEqual(branch.sources, { newCustomer: '门店', review: '通用', visit: '门店' })
})

test('4 人门店取最高人数档，且不垮格继承城市', () => {
  const result = d.resolveUnitPrices(null, 'guarantee-xa-gaoxin')
  assert.equal(result.headcountKey, 'hc3')
  assert.equal(result.volumeTierKey, 't3')
  assert.deepEqual(result.prices, { newCustomer: 5, review: 2, visit: 6 })
  assert.deepEqual(result.sources, { newCustomer: '通用', review: '通用', visit: '通用' })
})

test('0 是有效覆盖，留空才是继承', () => {
  assert.equal(d.savePersonStorePrices({ employeeId: 101, storeId: 'xl', headcountKey: 'hc2', rows: { t1: { review: 0 } } }), '')
  assert.equal(d.resolveUnitPrices(101, 'xl').prices.review, 0)
  assert.equal(d.resolveUnitPrices(101, 'xl').sources.review, '个人')
  assert.equal(d.savePersonStorePrices({ employeeId: 101, storeId: 'xl', headcountKey: 'hc2', rows: { t1: { review: null } } }), '请至少填写一项单价')
  assert.equal(d.resolveUnitPrices(101, 'xl').prices.review, 0, '未改动时不覆盖已配置的 0')
  assert.equal(d.savePersonStorePrices({ employeeId: 101, storeId: 'xl', headcountKey: 'hc2', rows: { t1: { review: null, visit: 9 } } }), '')
  assert.equal(d.resolveUnitPrices(101, 'xl').sources.review, '通用', '清空单项即回到继承')
})

test('城市各自可配，且只在同一格里覆盖', () => {
  assert.equal(d.saveCityPrices({ city: '成都', headcountKey: 'hc1', rows: { t2: { newCustomer: 16 } } }), '')
  assert.equal(d.resolveAt({ city: '成都', headcountKey: 'hc1', tierKey: 't2' }).prices.newCustomer, 16)
  assert.equal(d.resolveAt({ city: '成都', headcountKey: 'hc1', tierKey: 't2' }).sources.newCustomer, '城市')
  assert.equal(d.resolveAt({ city: '成都', headcountKey: 'hc2', tierKey: 't2' }).sources.newCustomer, '通用', '同一格才继承')
  assert.equal(d.resolveAt({ city: '北京', headcountKey: 'hc1', tierKey: 't2' }).prices.newCustomer, 14)
})

test('保存只覆盖指定人数档，其他人数档原样保留', () => {
  assert.equal(d.saveCityPrices({ city: '成都', headcountKey: 'hc2', rows: { t1: { newCustomer: 13 } } }), '')
  assert.equal(d.resolveAt({ city: '成都', headcountKey: 'hc1', tierKey: 't1' }).prices.newCustomer, 20)
  assert.equal(d.resolveAt({ city: '成都', headcountKey: 'hc2', tierKey: 't1' }).prices.newCustomer, 13)
  assert.equal(d.resolveAt({ city: '成都', headcountKey: 'hc1', tierKey: 't2' }).prices.newCustomer, 16)
})

test('作废只失效本级，读取自然回落到上一级并可重新配置', () => {
  d.deleteCityPrices('成都')
  assert.ok(d.unitPriceStore.cityRules.find(rule => rule.city === '成都').voidedAt)
  assert.equal(d.cityPriceFor('成都'), null)
  assert.equal(d.resolveUnitPrices(101, 'xl').prices.newCustomer, 22)
  d.deleteStorePrices('xl')
  assert.equal(d.resolveUnitPrices(101, 'xl').prices.newCustomer, 15)
  assert.equal(d.saveCityPrices({ city: '成都', headcountKey: 'hc2', rows: { t1: { visit: 30 } } }), '')
  assert.equal(d.unitPriceStore.cityRules.filter(rule => rule.city === '成都').length, 2)
  assert.equal(d.resolveUnitPrices(101, 'xl').prices.visit, 30)
})

test('非法输入被拒绝', () => {
  assert.match(d.saveCityPrices({ city: '广州', headcountKey: 'hc1', rows: { t1: { visit: 1 } } }), /城市/)
  assert.match(d.saveCityPrices({ city: '成都', headcountKey: 'hc4', rows: { t1: { visit: 1 } } }), /人数档/)
  assert.match(d.saveCityPrices({ city: '成都', headcountKey: 'hc1', rows: {} }), /至少/)
  assert.match(d.saveCityPrices({ city: '成都', headcountKey: 'hc1', rows: { t1: { visit: -1 } } }), /非负/)
  assert.match(d.saveStorePrices({ storeId: 'missing', headcountKey: 'hc1', rows: { t1: { visit: 1 } } }), /门店/)
  assert.match(d.savePersonStorePrices({ employeeId: 999, storeId: 'xl', headcountKey: 'hc1', rows: { t1: { visit: 1 } } }), /客户经理/)
  assert.equal(d.resolveUnitPrices(100, 'missing').error, '门店不存在')
})

test('旧版单一金额迁移成全部人数档与客次档同价', () => {
  const legacy = {
    generalPrices: { newCustomer: 18, review: 4, visit: 10 },
    cityRules: [{ city: '成都', prices: { newCustomer: 20 } }, { city: '北京', prices: { review: 7 }, voidedAt: '2026-01-01T00:00:00.000Z' }],
    storeRules: [{ storeId: 'xl', prices: { newCustomer: 24 } }],
    personStoreRules: [{ employeeId: 100, storeId: 'ls', prices: { review: 9 } }]
  }
  const migrated = d.migrateLegacyState(legacy)
  assert.equal(Object.keys(migrated.generalCells).length, 9)
  assert.deepEqual(migrated.generalCells['hc3.t3'], { newCustomer: 18, review: 4, visit: 10 })
  assert.deepEqual(migrated.cityRules[0].cells['hc2.t2'], { newCustomer: 20 })
  assert.equal(migrated.cityRules[0].cells['hc2.t2'].review, undefined)
  assert.ok(migrated.cityRules[1].voidedAt)
  assert.equal(migrated.storeRules[0].cells['hc1.t1'].newCustomer, 24)
  assert.equal(migrated.personStoreRules[0].cells['hc3.t1'].review, 9)
})

test('人数档可新增：新增前 4 人店按最高档，新增后自己成一档且起步价复制自最高档', () => {
  assert.equal(d.headcountKeyOf(4), 'hc3', '没有 4 人档时仍按最高档')
  assert.equal(d.addHeadcountTier(4), '')
  assert.deepEqual(d.headcountTiersOf().map(tier => tier.count), [1, 2, 3, 4])
  assert.equal(d.headcountKeyOf(4), 'hc4', '新增后 4 人店命中自己的档')
  assert.equal(d.headcountKeyOf(5), 'hc4', '超出最高档仍按最高档')
  const before = d.resolveUnitPrices(null, 'guarantee-xa-gaoxin')
  assert.equal(before.headcountKey, 'hc4')
  assert.deepEqual(before.prices, { newCustomer: 5, review: 2, visit: 6 }, '起步价与 3 人档同格同价')
  assert.equal(d.saveGeneralCells('hc4', { t3: { newCustomer: 4 } }), '')
  const after = d.resolveUnitPrices(null, 'guarantee-xa-gaoxin')
  assert.equal(after.prices.newCustomer, 4)
  assert.equal(after.prices.review, null, '通用是最底层，留空即无价可继承（不是保留旧值）')
})

test('新增人数档拦重复与非整数', () => {
  assert.equal(d.addHeadcountTier(4), '')
  assert.match(d.addHeadcountTier(4), /已存在/)
  assert.match(d.addHeadcountTier(0), /大于 0/)
  assert.match(d.addHeadcountTier(2.5), /整数/)
  assert.equal(d.addHeadcountTier(5), '')
  assert.deepEqual(d.headcountTiersOf().map(tier => tier.count), [1, 2, 3, 4, 5], '按人数升序排列')
})
