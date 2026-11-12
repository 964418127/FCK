// 通用参数解析器测试（值类型：简单值 / 数据表 + 取值契约）
// 契约：条件查询 —— 一条条件 = 「条件列 符号 传入值」，行里这一列有值就必须传入并命中（行身份被完整覆盖才参与），
// 留空不约束；命中行按特异度降序、行序升序；取 1 列 = 列序第一个取到非 null 的列生效；
// 取多列 = 各列各自穿透后相加，取不到按缺省 0。显式 0 是值、命中即止；留空 = null、穿透。
// 数据表不预置种子：所有表夹具都在本文件内构造，引擎不依赖任何示例数据。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { generalParams, resolveParam, matchRows, opsForType } from '../src/mock/generalParams.js'

const single = (valueCols, conds = []) => ({ mode: 'single', valueCols, conds })
const sum = (valueCols, conds = []) => ({ mode: 'sum', valueCols, conds })
const byName = name => generalParams.find(p => p.name === name)

/** 一条条件 = 条件列 + 符号 + 传入值；等于是最常用的一条 */
const eq = (col, fact = col) => ({ col, op: 'eq', fact })
const cond = (col, op, fact) => ({ col, op, fact })

const table = (name, columns, rows) => ({
  name, enabled: true, kind: 'table',
  columns: columns.map(([n, t]) => ({ name: n, type: t })),
  rows: rows.map(cells => ({ cells }))
})

// ===== 夹具：保底时薪（城市基准 + 门店差异额两张表） =====

const cityBase = table('城市基准',
  [['城市', 'text'], ['时薪', 'number']],
  [
    { '城市': '成都', '时薪': '28' },
    { '城市': '杭州', '时薪': '30' },
    { '城市': '北京', '时薪': '32' },
    { '城市': '', '时薪': '25' }
  ])
const hourly = single(['时薪'], [eq('城市')])

const storeDiff = table('门店差异额',
  [['城市', 'text'], ['门店', 'text'], ['差异额', 'number']],
  [
    { '城市': '成都', '门店': '兴隆湖店', '差异额': '2' },
    { '城市': '成都', '门店': '麓山店', '差异额': '1' },
    { '城市': '杭州', '门店': '西湖店', '差异额': '3' }
  ])
const diffSum = sum(['差异额'], [eq('城市'), eq('门店')])

test('城市基准：已配城市取城市时薪', () => {
  const r = resolveParam(cityBase, { 城市: '成都' }, hourly)
  assert.equal(r.ok, true)
  assert.equal(r.value, '28')
})

test('城市基准：没配的城市落到通用行（城市格留空 = 不约束）', () => {
  const r = resolveParam(cityBase, { 城市: '广州' }, hourly)
  assert.equal(r.ok, true)
  assert.equal(r.value, '25')
})

test('城市基准：不传条件也能取到通用值', () => {
  const r = resolveParam(cityBase, {}, hourly)
  assert.equal(r.ok, true)
  assert.equal(r.value, '25')
})

test('门店差异额：配了的店取到差值', () => {
  const r = resolveParam(storeDiff, { 城市: '成都', 门店: '兴隆湖店' }, diffSum)
  assert.equal(r.ok, true)
  assert.equal(r.value, 2)
})

test('门店差异额：没配的店取不到 → 相加模式按缺省 0', () => {
  const r = resolveParam(storeDiff, { 城市: '成都', 门店: '高新店' }, diffSum)
  assert.equal(r.ok, true)
  assert.equal(r.value, 0)
})

test('保底端到端：城市基准 + 门店差异额 = 最终时薪', () => {
  const cases = [
    [{ 城市: '成都', 门店: '兴隆湖店' }, 30],
    [{ 城市: '成都', 门店: '麓山店' }, 29],
    [{ 城市: '成都', 门店: '高新店' }, 28],
    [{ 城市: '杭州', 门店: '西湖店' }, 33],
    [{ 城市: '广州', 门店: '任何店' }, 25]
  ]
  for (const [input, expected] of cases) {
    const base = resolveParam(cityBase, { 城市: input.城市 }, hourly)
    const diff = resolveParam(storeDiff, input, diffSum)
    assert.equal(base.ok && diff.ok, true, JSON.stringify(input))
    assert.equal(Number(base.value) + diff.value, expected, JSON.stringify(input))
  }
})

// ===== 夹具：计件单价（层级行 + 特异度排序） =====

const kezi = table('客次单价',
  [['城市', 'text'], ['门店', 'text'], ['工号', 'text'], ['人数档', 'number'], ['客次下限', 'number'], ['客次上限', 'number'], ['单价', 'number']],
  [
    { '门店': '兴隆湖店', '工号': 'E100', '人数档': '2', '客次下限': '0', '客次上限': '30', '单价': '7' },
    { '门店': '兴隆湖店', '工号': 'E009', '人数档': '2', '客次下限': '0', '客次上限': '30', '单价': '0' },
    { '城市': '成都', '门店': '兴隆湖店', '人数档': '2', '客次下限': '0', '客次上限': '30', '单价': '6' },
    { '城市': '成都', '人数档': '2', '客次下限': '0', '客次上限': '30', '单价': '5.5' },
    { '人数档': '1', '客次下限': '0', '客次上限': '30', '单价': '4' },
    { '人数档': '1', '客次下限': '30', '客次上限': '40', '单价': '4.5' },
    { '人数档': '1', '客次下限': '40', '客次上限': '', '单价': '5' },
    { '人数档': '2', '客次下限': '0', '客次上限': '30', '单价': '5' },
    { '人数档': '2', '客次下限': '30', '客次上限': '40', '单价': '5.5' },
    { '人数档': '2', '客次下限': '40', '客次上限': '', '单价': '6' }
  ])
/** 客次档 = 两条条件：下限 ≤ 当月客次、上限 > 当月客次（合起来就是 [下限, 上限) 的区间） */
const KEZI_CONDS = [
  eq('城市'), eq('门店'), eq('工号'), eq('人数档'),
  cond('客次下限', 'lte', '当月客次'),
  cond('客次上限', 'gt', '当月客次')
]
const priceFn = single(['单价'], KEZI_CONDS)
const grid = { 人数档: '2', 当月客次: '26' }

test('客次单价：个人行特异度最高，个人配置先生效', () => {
  const r = resolveParam(kezi, { 城市: '成都', 门店: '兴隆湖店', 工号: 'E100', ...grid }, priceFn)
  assert.equal(r.value, '7')
  assert.equal(r.hits[0].col, '单价')
})

test('客次单价：显式 0 是有效覆盖值，不被穿透', () => {
  const r = resolveParam(kezi, { 城市: '成都', 门店: '兴隆湖店', 工号: 'E009', ...grid }, priceFn)
  assert.equal(r.ok, true)
  assert.equal(r.value, '0')
})

test('客次单价：无个人配置回门店行', () => {
  const r = resolveParam(kezi, { 城市: '成都', 门店: '兴隆湖店', 工号: 'E002', ...grid }, priceFn)
  assert.equal(r.value, '6')
})

test('客次单价：无门店配置回城市行', () => {
  const r = resolveParam(kezi, { 城市: '成都', 门店: '高新店', 工号: 'E002', ...grid }, priceFn)
  assert.equal(r.value, '5.5')
})

test('客次单价：城市也没配回通用层格子', () => {
  const r = resolveParam(kezi, { 城市: '广州', 门店: '某店', 工号: 'E002', ...grid }, priceFn)
  assert.equal(r.value, '5')
})

test('客次单价：人数档不同走不同格子', () => {
  const r = resolveParam(kezi, { 城市: '广州', 门店: '某店', 工号: 'E002', 人数档: '1', 当月客次: '26' }, priceFn)
  assert.equal(r.value, '4')
})

test('客次单价：客次档按上下限区间匹配（≥40 落末档）', () => {
  const r = resolveParam(kezi, { 城市: '广州', 门店: '某店', 工号: 'E002', 人数档: '2', 当月客次: '45' }, priceFn)
  assert.equal(r.value, '6')
})

test('只传城市级条件时，门店行 / 个人行不参与（行身份未被覆盖）', () => {
  const r = resolveParam(kezi, { 城市: '成都', 人数档: '2', 当月客次: '26' }, priceFn)
  assert.equal(r.ok, true)
  assert.equal(r.value, '5.5')
})

// ===== 符号 =====

test('符号：不等于排除那一行，落更粗的层', () => {
  const p = table('不等于',
    [['城市', 'text'], ['单价', 'number']],
    [
      { '城市': '成都', '单价': '120' },
      { '城市': '', '单价': '100' }
    ])
  const fn = single(['单价'], [cond('城市', 'neq', '城市')])
  assert.equal(resolveParam(p, { 城市: '成都' }, fn).value, '100')
  assert.equal(resolveParam(p, { 城市: '重庆' }, fn).value, '120')
})

test('符号：大于 / 大于等于 / 小于 / 小于等于按数值比较', () => {
  const p = table('阈值',
    [['门槛', 'number'], ['取值', 'number']],
    [
      { '门槛': '100', '取值': '1' },
      { '门槛': '', '取值': '0' }
    ])
  const withOp = (op, v) => resolveParam(p, { 事实: v }, single(['取值'], [cond('门槛', op, '事实')])).value
  // 比较方向：行里这一列的值 符号 传入值——门槛 100 对 120 是「不大于」
  assert.equal(withOp('gt', 80), '1')
  assert.equal(withOp('gt', 120), '0')
  assert.equal(withOp('gte', 100), '1')
  assert.equal(withOp('lt', 120), '1')
  assert.equal(withOp('lt', 100), '0')
  assert.equal(withOp('lte', 100), '1')
})

test('符号：同一列也能配两条（下限 ≤ 值 与 下限 > 值 两个口径）', () => {
  const p = table('双条件',
    [['下限', 'number'], ['取值', 'number']],
    [{ '下限': '10', '取值': '1' }])
  const both = single(['取值'], [cond('下限', 'lte', '值'), cond('下限', 'gt', '别的值')])
  assert.equal(resolveParam(p, { 值: 12, 别的值: 9 }, both).value, '1')
  assert.equal(resolveParam(p, { 值: 12, 别的值: 11 }, both).ok, false)
})

test('符号：文本列只能等于 / 不等于，数值与日期列六种都给', () => {
  assert.deepEqual(opsForType('text').map(o => o.value), ['eq', 'neq'])
  assert.equal(opsForType('number').length, 6)
  assert.equal(opsForType('date').length, 6)
})

// ===== 其他条件查询形态 =====

test('顶班单价：精确行优先于兜底行（特异度排序，不靠行序）', () => {
  const p = table('顶班单价',
    [['城市', 'text'], ['日期类型', 'text'], ['单价', 'number']],
    [
      { '城市': '成都', '日期类型': '法定节假日', '单价': '350' },
      { '城市': '成都', '日期类型': '周末', '单价': '300' },
      { '城市': '成都', '日期类型': '工作日', '单价': '280' },
      { '城市': '重庆', '日期类型': '', '单价': '260' },
      { '城市': '西安', '日期类型': '', '单价': '240' }
    ])
  const fn = single(['单价'], [eq('城市'), eq('日期类型')])
  assert.equal(resolveParam(p, { 城市: '成都', 日期类型: '周末' }, fn).value, '300')
  assert.equal(resolveParam(p, { 城市: '重庆', 日期类型: '周末' }, fn).value, '260')
})

test('回头客比例：客次用上下限两条条件，0 次落到不限档的兜底行', () => {
  const p = table('回头客比例',
    [['次数下限', 'number'], ['次数上限', 'number'], ['激励比例', 'text']],
    [
      { '次数下限': '3', '次数上限': '', '激励比例': '12%' },
      { '次数下限': '1', '次数上限': '3', '激励比例': '8%' },
      { '次数下限': '', '次数上限': '', '激励比例': '0%' }
    ])
  const fn = single(['激励比例'], [cond('次数下限', 'lte', '回头客次数'), cond('次数上限', 'gt', '回头客次数')])
  assert.equal(resolveParam(p, { 回头客次数: '5' }, fn).value, '12%')
  assert.equal(resolveParam(p, { 回头客次数: '2' }, fn).value, '8%')
  assert.equal(resolveParam(p, { 回头客次数: '0' }, fn).value, '0%')
})

test('星号不是通配：文本列里它就是普通字符，只按字面命中', () => {
  const p = table('星号当字符',
    [['城市', 'text'], ['单价', 'number']],
    [
      { '城市': '*', '单价': '100' },
      { '城市': '成都', '单价': '120' }
    ])
  const fn = single(['单价'], [eq('城市')])
  assert.equal(resolveParam(p, { 城市: '*' }, fn).value, '100')
  assert.equal(resolveParam(p, { 城市: '重庆' }, fn).ok, false)
  assert.equal(resolveParam(p, { 城市: '成都' }, fn).value, '120')
})

// ===== 行匹配规则 =====

test('matchRows：行身份没被覆盖的行不参与匹配', () => {
  const rows = matchRows(kezi, { 城市: '成都', 人数档: '2', 当月客次: '26' }, ['单价'], KEZI_CONDS)
  assert.ok(rows.every(m => String(m.row.cells['门店'] ?? '').trim() === '' && String(m.row.cells['工号'] ?? '').trim() === ''))
})

test('matchRows：特异度降序、同特异度按行序', () => {
  const rows = matchRows(kezi, { 城市: '成都', 门店: '兴隆湖店', 工号: 'E100', ...grid }, ['单价'], KEZI_CONDS)
  assert.equal(rows[0].row.cells['单价'], '7')
  assert.ok(rows[0].specificity >= rows[1].specificity)
})

test('matchRows：表里有值但没配条件的列，该行不参与', () => {
  const rows = matchRows(kezi, { 人数档: '2', 当月客次: '26' }, ['单价'], [eq('人数档')])
  assert.equal(rows.length, 0)
})

// ===== 取 1 列的列序生效 =====

test('取 1 列：候选列按序，第一个取到非 null 的列生效', () => {
  const layered = table('分层值列',
    [['城市', 'text'], ['门店', 'text'], ['工号', 'text'], ['个人值', 'number'], ['通用值', 'number']],
    [
      { '工号': 'E001', '个人值': '35' },
      { '城市': '成都', '通用值': '25' }
    ])
  const fn = single(['个人值', '通用值'], [eq('城市'), eq('门店'), eq('工号')])
  const person = resolveParam(layered, { 城市: '成都', 门店: '某店', 工号: 'E001' }, fn)
  assert.equal(person.value, '35')
  const other = resolveParam(layered, { 城市: '成都', 门店: '某店', 工号: 'E002' }, fn)
  assert.equal(other.value, '25')
})

// ===== 取多列相加 =====

test('取多列相加：各列各自穿透后求和', () => {
  const layered = table('叠加表',
    [['城市', 'text'], ['门店', 'text'], ['城市值', 'number'], ['门店值', 'number']],
    [
      { '城市': '成都', '门店': '兴隆湖店', '门店值': '5' },
      { '城市': '成都', '城市值': '20' }
    ])
  const r = resolveParam(layered, { 城市: '成都', 门店: '兴隆湖店' }, sum(['城市值', '门店值'], [eq('城市'), eq('门店')]))
  assert.equal(r.ok, true)
  assert.equal(r.value, 25)
  assert.equal(r.hits.length, 2)
})

test('取多列相加：某列整条链取不到按缺省 0，不影响其他列', () => {
  const layered = table('叠加表·缺列',
    [['城市', 'text'], ['门店', 'text'], ['城市值', 'number'], ['门店值', 'number']],
    [
      { '城市': '成都', '城市值': '20' }
    ])
  const r = resolveParam(layered, { 城市: '成都', 门店: '某店' }, sum(['城市值', '门店值'], [eq('城市'), eq('门店')]))
  assert.equal(r.value, 20)
})

// ===== 边界 =====

test('停用的参数取不到值', () => {
  const stopped = { ...cityBase, enabled: false }
  const r = resolveParam(stopped, { 城市: '成都' }, hourly)
  assert.equal(r.ok, false)
})

test('没配取值列时报错而不是静默取错', () => {
  const r = resolveParam(cityBase, { 城市: '成都' }, {})
  assert.equal(r.ok, false)
})

test('简单值直接返回，不需要取值函数', () => {
  const r = resolveParam({ name: '津贴', enabled: true, kind: 'simple', value: '50' }, {}, {})
  assert.equal(r.ok, true)
  assert.equal(r.value, '50')
})

test('同一参数在不同取值函数下得到不同结果', () => {
  const layered = table('同表两用',
    [['城市', 'text'], ['门店', 'text'], ['城市值', 'number'], ['门店值', 'number']],
    [
      { '城市': '成都', '门店': '兴隆湖店', '门店值': '5' },
      { '城市': '成都', '城市值': '20' }
    ])
  const conds = [eq('城市'), eq('门店')]
  const asOverride = resolveParam(layered, { 城市: '成都', 门店: '兴隆湖店' }, single(['门店值', '城市值'], conds))
  assert.equal(asOverride.value, '5')
  const asSum = resolveParam(layered, { 城市: '成都', 门店: '兴隆湖店' }, sum(['城市值', '门店值'], conds))
  assert.equal(asSum.value, 25)
})

test('种子数据只包含保底时薪 + 三个单价共 4 张示例表', () => {
  const tables = generalParams.filter(p => p.kind === 'table')
  assert.deepEqual(tables.map(p => p.name), ['非全保底时薪', '非全客次单价', '非全新客单价', '非全评价单价'])
})

// ===== 种子示例：单价（层级行 + 格子维度） =====

const keziSeed = byName('非全客次单价')
const seedGrid = { 人数档: '2', 当月客次: '26' }

test('客次示例：个人行特异度最高，个人配置先生效', () => {
  const r = resolveParam(keziSeed, { 城市: '成都', 门店: '兴隆湖店', 工号: 'E100', ...seedGrid }, priceFn)
  assert.equal(r.value, '7')
})

test('客次示例：显式 0 是有效覆盖值，不被穿透', () => {
  const r = resolveParam(keziSeed, { 城市: '成都', 门店: '兴隆湖店', 工号: 'E009', ...seedGrid }, priceFn)
  assert.equal(r.value, '0')
})

test('客次示例：无个人配置回门店行，再往回城市行、通用格', () => {
  const resolve = (input) => resolveParam(keziSeed, input, priceFn)
  assert.equal(resolve({ 城市: '成都', 门店: '兴隆湖店', 工号: 'E002', ...seedGrid }).value, '6')
  assert.equal(resolve({ 城市: '成都', 门店: '高新店', 工号: 'E002', ...seedGrid }).value, '5.5')
  assert.equal(resolve({ 城市: '广州', 门店: '某店', 工号: 'E002', ...seedGrid }).value, '5')
})

test('客次示例：客次档按上下限区间匹配，3 人档有独立格', () => {
  const r = resolveParam(keziSeed, { 城市: '广州', 门店: '某店', 工号: 'E002', 人数档: '2', 当月客次: '45' }, priceFn)
  assert.equal(r.value, '6')
  const r3 = resolveParam(keziSeed, { 城市: '广州', 门店: '某店', 工号: 'E002', 人数档: '3', 当月客次: '26' }, priceFn)
  assert.equal(r3.value, '5.5')
})

test('客次示例：人数档没传就取不到（不跨格兜底）', () => {
  const r = resolveParam(keziSeed, { 城市: '成都', 门店: '兴隆湖店', 工号: 'E100' }, priceFn)
  assert.equal(r.ok, false)
})

test('客次档：小数落在区间里也不漏（29.9 / 38.12 / 39.99 / 40）', () => {
  const at = v => resolveParam(keziSeed, { 人数档: '2', 当月客次: String(v) }, priceFn)
  assert.equal(at(29.9).value, '5')
  assert.equal(at(29.9999).value, '5')
  assert.equal(at(30).value, '5.5')
  assert.equal(at(38.12).value, '5.5')
  assert.equal(at(39.99).value, '5.5')
  assert.equal(at(40).value, '6')
  assert.equal(at(55).value, '6')
})

test('客次档：末档上限留空 = 无上限', () => {
  const p = table('无上限档',
    [['人数档', 'number'], ['下限', 'number'], ['上限', 'number'], ['单价', 'number']],
    [
      { '人数档': '1', '下限': '0', '上限': '30', '单价': '4' },
      { '人数档': '1', '下限': '30', '上限': '', '单价': '5' }
    ])
  const fn = single(['单价'], [eq('人数档'), cond('下限', 'lte', '客次'), cond('上限', 'gt', '客次')])
  assert.equal(resolveParam(p, { 人数档: '1', 客次: '999' }, fn).value, '5')
})

test('条件配了却没传值：不猜档位，直接取不到', () => {
  const r = resolveParam(keziSeed, { 人数档: '2' }, priceFn)
  assert.equal(r.ok, false)
  assert.match(r.error, /客次下限 ≤ 当月客次/)
})

test('上下限都留空的行 = 不限档兜底行', () => {
  const p = table('不限档兜底',
    [['人数档', 'number'], ['下限', 'number'], ['上限', 'number'], ['单价', 'number']],
    [
      { '人数档': '2', '下限': '30', '上限': '40', '单价': '6' },
      { '人数档': '2', '下限': '', '上限': '', '单价': '9' }
    ])
  const fn = single(['单价'], [eq('人数档'), cond('下限', 'lte', '客次'), cond('上限', 'gt', '客次')])
  assert.equal(resolveParam(p, { 人数档: '2', 客次: '35' }, fn).value, '6')
  assert.equal(resolveParam(p, { 人数档: '2', 客次: '99' }, fn).value, '9')
})

test('新客 / 评价与客次互不影响，各配各的', () => {
  const input = { 城市: '成都', 门店: '兴隆湖店', 工号: 'E002', ...seedGrid }
  assert.equal(resolveParam(byName('非全新客单价'), input, priceFn).value, '5')
  assert.equal(resolveParam(byName('非全评价单价'), input, priceFn).value, '3')
})

test('评价示例：城市层覆盖，其他城市落通用格', () => {
  const mk = city => resolveParam(byName('非全评价单价'), { 城市: city, 门店: '某店', 工号: 'E002', ...seedGrid }, priceFn)
  assert.equal(mk('成都').value, '3')
  assert.equal(mk('广州').value, '2')
})

// ===== 种子示例：保底时薪（表法 A · 覆盖链） =====

const seedBao = byName('非全保底时薪')
const seedHourly = single(['时薪'], [eq('城市'), eq('门店')])

test('保底示例：配了的门店取门店行最终值', () => {
  const r = resolveParam(seedBao, { 城市: '成都', 门店: '兴隆湖店' }, seedHourly)
  assert.equal(r.value, '30')
})

test('保底示例：没配的门店落到城市行', () => {
  const r = resolveParam(seedBao, { 城市: '成都', 门店: '高新店' }, seedHourly)
  assert.equal(r.value, '28')
})

test('保底示例：没配的城市落到通用行', () => {
  const r = resolveParam(seedBao, { 城市: '广州', 门店: '某店' }, seedHourly)
  assert.equal(r.value, '25')
})

test('保底示例：不传条件也能取到通用值', () => {
  const r = resolveParam(seedBao, {}, seedHourly)
  assert.equal(r.value, '25')
})

test('保底示例：只传城市时门店行不参与（行身份未被覆盖）', () => {
  const r = resolveParam(seedBao, { 城市: '成都' }, seedHourly)
  assert.equal(r.value, '28')
})
