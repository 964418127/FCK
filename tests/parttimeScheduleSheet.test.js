import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SHEET_HEADERS, templateRows, exportRows, parseScheduleRows } from '../src/stores/parttimeScheduleSheet.js'
import { initialPolicies } from '../src/stores/parttimePolicies.js'

const weekdays = [
  { value: 6, label: '周六' }, { value: 0, label: '周日' }, { value: 1, label: '周一' },
  { value: 2, label: '周二' }, { value: 3, label: '周三' }, { value: 4, label: '周四' }, { value: 5, label: '周五' }
]
const stores = [
  { id: 'xl', code: '102188', name: '兴隆湖店', open: '10:00', close: '22:00' },
  { id: 'ls', code: '102333', name: '麓山店', open: '10:00', close: '22:00' }
]
const row = (code, weekday, start, end, quota, startDate = '2026-11-10', endDate = '', remark = '') =>
  [code, '', weekday, start, end, quota, startDate, endDate, remark]

test('template has headers plus one placeholder row per weekday', () => {
  const rows = templateRows({ store: stores[0], weekdays, startDate: '2026-11-10' })
  assert.deepEqual(rows[0], SHEET_HEADERS)
  assert.equal(rows.length, 8)
  assert.deepEqual(rows[1], ['102188', '兴隆湖店', '周六', '', '', '', '2026-11-10', '', '', ''])
  assert.equal(rows[7][2], '周五')
})

test('placeholder rows with empty time and quota are ignored', () => {
  const rows = templateRows({ store: stores[0], weekdays, startDate: '2026-11-10' })
  const result = parseScheduleRows(rows, { stores, weekdays })
  assert.deepEqual(result.errors, [])
  assert.equal(result.drafts.length, 0)
})

test('rows of one store and one period merge into a single requirement', () => {
  const result = parseScheduleRows([
    SHEET_HEADERS,
    row('102188', '周六', '10:00', '12:00', 1, '2026-11-10', '', '周末接待'),
    row('102188', '周日', '10:00', '12:00', 2, '2026-11-10', '', '周末接待'),
    row('102188', '周六', '14:00', '16:00', 1, '2026-11-10', '', '周末接待')
  ], { stores, weekdays })

  assert.deepEqual(result.errors, [])
  assert.equal(result.drafts.length, 1)
  const draft = result.drafts[0]
  assert.equal(draft.storeId, 'xl')
  assert.equal(draft.remark, '周末接待')
  assert.equal(draft.enabled, true)
  assert.deepEqual(draft.days[6], [
    { startTime: '10:00', endTime: '12:00', quota: 1 },
    { startTime: '14:00', endTime: '16:00', quota: 1 }
  ])
  assert.deepEqual(draft.days[0], [{ startTime: '10:00', endTime: '12:00', quota: 2 }])
  assert.deepEqual(draft.days[1], [])
  assert.deepEqual(result.stats, { requirements: 1, slots: 3, storeNames: ['兴隆湖店'] })
})

test('different periods stay separate requirements', () => {
  const result = parseScheduleRows([
    SHEET_HEADERS,
    row('102188', '周六', '10:00', '12:00', 1, '2026-11-10', '2026-11-20'),
    row('102188', '周六', '14:00', '16:00', 1, '2026-11-21')
  ], { stores, weekdays })
  assert.equal(result.drafts.length, 2)
  assert.equal(result.drafts[0].endDate, '2026-11-20')
  assert.equal(result.drafts[1].endDate, '')
})

test('unknown store code is reported with its Excel row number', () => {
  const result = parseScheduleRows([SHEET_HEADERS, row('999999', '周六', '10:00', '12:00', 1)], { stores, weekdays })
  assert.equal(result.drafts.length, 0)
  assert.deepEqual(result.errors, [{ line: 2, message: '门店编码「999999」不存在' }])
})

test('quota, duration and business hours are validated', () => {
  const result = parseScheduleRows([
    SHEET_HEADERS,
    row('102188', '周六', '10:00', '12:00', 0),
    row('102188', '周六', '10:00', '15:00', 1),
    row('102188', '周六', '09:00', '11:00', 1),
    row('102188', '周六', '12:00', '10:00', 1)
  ], { stores, weekdays })
  assert.deepEqual(result.errors.map(item => item.line), [2, 3, 4, 5])
  assert.match(result.errors[0].message, /名额/)
  assert.match(result.errors[1].message, /4 小时/)
  assert.match(result.errors[2].message, /营业时间/)
  assert.match(result.errors[3].message, /结束时间/)
})

test('overlapping slots on the same weekday are rejected', () => {
  const result = parseScheduleRows([
    SHEET_HEADERS,
    row('102188', '周六', '10:00', '12:00', 1),
    row('102188', '周六', '11:00', '13:00', 1)
  ], { stores, weekdays })
  assert.equal(result.errors.length, 1)
  assert.equal(result.errors[0].line, 3)
  assert.match(result.errors[0].message, /重叠/)
})

test('remark belongs to the whole requirement and must match', () => {
  const result = parseScheduleRows([
    SHEET_HEADERS,
    row('102188', '周六', '10:00', '12:00', 1, '2026-11-10', '', '早班'),
    row('102188', '周日', '10:00', '12:00', 1, '2026-11-10', '', '晚班')
  ], { stores, weekdays })
  assert.equal(result.errors.length, 1)
  assert.equal(result.errors[0].line, 3)
  assert.match(result.errors[0].message, /备注/)
})

test('Excel date serial and time fraction are converted', () => {
  const result = parseScheduleRows([
    SHEET_HEADERS,
    ['102188', '', '周六', 0.4166666666666667, 0.5, 1, 46331, '', '']
  ], { stores, weekdays })
  assert.deepEqual(result.errors, [])
  assert.equal(result.drafts[0].startDate, '2026-11-05')
  assert.deepEqual(result.drafts[0].days[6], [{ startTime: '10:00', endTime: '12:00', quota: 1 }])
})

test('a broken header is rejected before any row is read', () => {
  const result = parseScheduleRows([['门店', '星期'], ['102188', '周六']], { stores, weekdays })
  assert.equal(result.drafts.length, 0)
  assert.match(result.errors[0].message, /门店编码/)
})

test('exported rows can be imported back unchanged', () => {
  const requirements = [
    { id: 'r1', storeId: 'xl', remark: '早间接待', startDate: '2026-11-01', endDate: '', enabled: true, days: { 6: [{ startTime: '10:00', endTime: '12:00', quota: 1 }], 0: [{ startTime: '10:00', endTime: '12:00', quota: 1 }] } },
    { id: 'r2', storeId: 'ls', remark: '', startDate: '2026-11-10', endDate: '2026-11-20', enabled: true, days: { 6: [{ startTime: '18:00', endTime: '20:00', quota: 2, voidedAt: '2026-11-02T00:00:00.000Z' }, { startTime: '20:00', endTime: '22:00', quota: 1 }] } }
  ]
  const rows = exportRows(requirements, stores, weekdays)
  assert.equal(rows.length, 1 + 3)
  const result = parseScheduleRows(rows, { stores, weekdays })
  assert.deepEqual(result.errors, [])
  assert.equal(result.drafts.length, 2)
  assert.deepEqual(result.drafts[0].days[6], [{ startTime: '10:00', endTime: '12:00', quota: 1 }])
  assert.deepEqual(result.drafts[1].days[6], [{ startTime: '20:00', endTime: '22:00', quota: 1 }], '作废的时段不导出')
})

test('策略列按名称映射，写错名字直接报错，留空不写 policyId 由存储落默认', () => {
  const policies = initialPolicies()
  const withPolicy = policy => ['102188', '', '周六', '18:00', '20:00', 1, '2026-11-10', '', '', policy]

  const mapped = parseScheduleRows([SHEET_HEADERS, withPolicy('非全优先 · 推拿师兜底')], { stores, weekdays, policies })
  assert.deepEqual(mapped.errors, [])
  assert.equal(mapped.drafts[0].days[6][0].policyId, 'policy-ladder')

  const blank = parseScheduleRows([SHEET_HEADERS, withPolicy('')], { stores, weekdays, policies })
  assert.deepEqual(blank.errors, [])
  assert.equal(blank.drafts[0].days[6][0].policyId, undefined)

  const unknown = parseScheduleRows([SHEET_HEADERS, withPolicy('拍脑袋策略')], { stores, weekdays, policies })
  assert.equal(unknown.drafts.length, 0)
  assert.match(unknown.errors[0].message, /不存在/)
})

test('导出把时段策略名写进最后一列，能原样导回', () => {
  const policies = initialPolicies()
  const requirements = [{ id: 'r1', storeId: 'xl', remark: '', startDate: '2026-11-01', endDate: '', enabled: true, days: { 6: [{ startTime: '18:00', endTime: '20:00', quota: 1, policyId: 'policy-ladder' }] } }]
  const rows = exportRows(requirements, stores, weekdays, policies)
  assert.equal(rows[1][9], '非全优先 · 推拿师兜底')
  const back = parseScheduleRows(rows, { stores, weekdays, policies })
  assert.equal(back.drafts[0].days[6][0].policyId, 'policy-ladder')
})
