// 排班策略 v3 —— 配置层口径测试：性质、名额服务、模板归属、规则编辑、生成快照
// 本文件会改 store（独立模块实例，不影响其他测试文件）
import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  V3_SLOTS, V3_RULES, V3_SLOT_TPL, QUOTA_WINDOW_MIN,
  quotaCalc3, natureOf3, blankRule3, validateRule3, ruleNamePattern3
} from '../src/mock/scheduleV3.js'
import {
  v3, batch3, pendingChanges3, generate3,
  globalTpls3, ownTpls3, adoptTemplate3, updateTemplate3, removeTemplate3, tplUsage3,
  upsertRule3, removeRule3
} from '../src/mock/scheduleV3Store.js'

test('班次性质挂在时段上：必选 / 可选，规则里不出现性质', () => {
  for (const s of V3_SLOTS) assert.ok(['required', 'optional'].includes(s.nature), `${s.id} 缺性质`)
  for (const r of V3_RULES) assert.ok(!r.nature, `${r.id} 的规则不该有性质字段`)
  assert.equal(natureOf3('required').label, '必选')
  assert.equal(natureOf3('optional').label, '可选')
  assert.equal(natureOf3('unknown').label, '必选') // 缺省按必选
})

test('名额服务算值：人头法 / 工时法 / 签约比法 / 固定值', () => {
  const mk = (service, params) => quotaCalc3({ capacity: 9, quota: { service, params, windowMin: 10 } })
  assert.equal(mk('headcount', { headcount: 8, factor: 0.75 }).computed, 6)
  assert.equal(mk('headcount', { headcount: 8, factor: 0.75 }).formula.includes('在册 8 人'), true)
  assert.equal(mk('volume', { volumeHours: 24, shiftHours: 8 }).computed, 3)
  assert.equal(mk('signRatio', { signed: 8, divisor: 2 }).computed, 4)
  assert.equal(mk('signRatio', { signed: 7, divisor: 2 }).computed, 4) // 向上取整
  assert.equal(mk('fixed', { value: 2 }).computed, 2)
})

test('名额改动期：最少 5 分钟，低于按 5 算；调整过就记 adjusted 生效', () => {
  assert.ok(QUOTA_WINDOW_MIN === 5)
  const q = quotaCalc3({ capacity: 6, quota: { service: 'fixed', params: { value: 6 }, windowMin: 2 } })
  assert.equal(q.windowMin, 5)
  const adj = quotaCalc3({ capacity: 6, quota: { service: 'headcount', params: { headcount: 8, factor: 0.75 }, windowMin: 10, adjusted: 4 } })
  assert.equal(adj.computed, 6)
  assert.equal(adj.effective, 4) // 改动期里人事调成 4
})

test('时段模板归属：全局库只读，门店引入后自有、可改可删', () => {
  assert.ok(globalTpls3().length >= 6)
  assert.ok(ownTpls3('C-01').length >= 1)
  const copy = adoptTemplate3('ST-V2', 'C-01')
  assert.equal(copy.owner, 'C-01')
  assert.equal(copy.derivedFrom, 'ST-V2')
  assert.ok(copy.id !== 'ST-V2')
  // 全局模板不能改不能删
  assert.equal(updateTemplate3('ST-V2', { capacity: 99 }), null)
  assert.equal(removeTemplate3('ST-V2').ok, false)
  // 自有模板可改可删（没被引用时）
  updateTemplate3(copy.id, { quota: { service: 'fixed', params: { value: 9 }, windowMin: 10 } })
  assert.equal(v3.templates.find(t => t.id === copy.id).capacity, 9)
  assert.equal(removeTemplate3(copy.id).ok, true)
})

test('被时段引用的模板不能删', () => {
  const used = V3_SLOTS.find(s => s.templateId)?.templateId
  const r = removeTemplate3(used)
  assert.equal(r.ok, false)
  assert.ok(tplUsage3(used) > 0)
})

test('规则校验：空稿过不了，合法稿能过；按配法命名不带岗位名', () => {
  const blank = blankRule3('review')
  assert.ok(validateRule3(blank).length > 0) // 没名字、没人群
  blank.name = '两轮审核+兜底晚班再通班'
  blank.rounds[0].crowds = ['全日制推拿师']
  assert.deepEqual(validateRule3(blank), [])
  // 配法命名
  const draft = { mode: 'review', rounds: [{}, {}], balance: 'sequence', fallbackSlotIds: ['SL-V302', 'SL-V303'] }
  assert.equal(ruleNamePattern3(draft, id => ({ 'SL-V302': '晚班时段', 'SL-V303': '通班时段' }[id])), '两轮审核+兜底晚班再通班')
  const grab = { mode: 'grab', rounds: [{}], balance: 'none', fallbackSlotIds: [] }
  assert.equal(ruleNamePattern3(grab), '公布即抢+余额不管')
  // 审核模式的轮必须有截止与审核口径
  const bad = { ...blank, name: 'x', rounds: [{ crowds: ['保洁'], open: { kind: 'd', before: 1, time: '06:00' }, close: null, audit: null }] }
  assert.ok(validateRule3(bad).some(e => e.includes('截止')))
  assert.ok(validateRule3(bad).some(e => e.includes('审核')))
})

test('规则增删：新增落库、挂着时段的删不掉', () => {
  const before = v3.rules.length
  const saved = upsertRule3({ ...blankRule3('grab'), name: '测试规则 · 公布即抢' })
  assert.equal(v3.rules.length, before + 1)
  assert.ok(saved.id.startsWith('AC-'))
  assert.equal(saved.rounds[0].id, `${saved.id}-R1`)
  const blocked = removeRule3('AC-01')
  assert.equal(blocked.ok, false)
  assert.ok(removeRule3(saved.id).ok)
})

test('生成快照：改配置不动已生成批次，「立即生成」后才生效', () => {
  const earlyResults = () => batch3.value.results.filter(r => r.slotId === 'SL-V301' && r.date === '2026-11-12').length
  assert.equal(earlyResults(), 6) // 第 3 批：6 个名额
  // 改名额服务：在册 8 → 4，算 3 个
  const slot = v3.slots.find(s => s.id === 'SL-V301')
  slot.quota = { service: 'headcount', params: { headcount: 4, factor: 0.75 }, windowMin: 10, adjusted: null }
  assert.ok(pendingChanges3.value.total > 0, '改动应该被标记为待生效')
  assert.equal(earlyResults(), 6, '已生成的批次不回溯，仍是 6')
  generate3() // 立即生成一批
  assert.equal(pendingChanges3.value.total, 0, '生成后配置与快照一致')
  assert.equal(earlyResults(), 3, '新批次按名额服务生效值铺 3 个')
})
