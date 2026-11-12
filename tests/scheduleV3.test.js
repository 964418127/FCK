// 排班策略 v3 —— 设计基线口径测试（确定性：固定 now）
import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  V3_SLOTS, V3_RULES, V3_SLOT_TPL, V3_PEOPLE, V3_SHIFT_TPL, RULE_OF_SLOT,
  runBatch3, anchorTime3, roundState3, weekParity3, netHours3, findShift3,
  findRule3, scoreOf3, PASS_LINE3
} from '../src/mock/scheduleV3.js'

const NOW = new Date('2026-11-12T10:19:00')
const batch = runBatch3(NOW)
const res = (date, slotId) => batch.results.filter(r => r.date === date && r.slotId === slotId)
const ofSlot = slotId => batch.results.filter(r => r.slotId === slotId)

test('时段只描述时间形态：不含人群 / 轮 / 裁决这类获取字段', () => {
  for (const s of V3_SLOTS) {
    assert.ok(!s.crowds && !s.rounds && !s.tiers && !s.rule, `${s.id} 把获取规则混进了时段`)
    assert.ok(s.containerId && s.shiftId && Array.isArray(s.days) && s.capacity > 0)
    assert.ok(s.generation && s.generation.cadence)
  }
})

test('时段模板只有时间形态：不含人群与轮', () => {
  for (const t of V3_SLOT_TPL) {
    assert.ok(!t.crowds && !t.rounds)
    assert.ok(t.shiftTemplateId && V3_SHIFT_TPL.some(s => s.id === t.shiftTemplateId))
  }
})

test('获取规则是独立对象：三种模式齐全，一条规则可挂多条时段', () => {
  const modes = new Set(V3_RULES.map(r => r.mode))
  assert.deepEqual([...modes].sort(), ['direct', 'grab', 'review'])
  const mounted = V3_SLOTS.filter(s => RULE_OF_SLOT[s.id])
  assert.ok(mounted.length >= 5)
  for (const r of V3_RULES) {
    for (const rd of r.rounds) {
      assert.ok(rd.crowds.length > 0, `${r.id} 有轮没人群`)
      assert.ok(rd.open && rd.open.kind)
    }
  }
})

test('审核两轮：第一轮取前 6（按综合分），蓝田林深两轮都落选', () => {
  const es = res('2026-11-12', 'SL-V301')
  assert.equal(es.length, 6)
  assert.ok(es.every(r => r.way === '审核通过'))
  const names = es.map(r => r.personName)
  assert.ok(!names.includes('蓝田') && !names.includes('林深'))
  const apps = batch.applications.filter(a => a.date === '2026-11-12' && a.slotId === 'SL-V301')
  assert.equal(apps.filter(a => a.status === 'lost').length, 4) // 两人 × 两轮
  assert.equal(apps.filter(a => a.status === 'won').length, 6)
})

test('综合分与过审线：低于 60 分的人在排序里始终垫底', () => {
  const low = V3_PEOPLE.filter(p => p.scores && scoreOf3(p) < PASS_LINE3).map(p => p.name)
  assert.deepEqual(low.sort(), ['林深', '蓝田'].sort())
})

test('余额兜底：先吃晚班余量，晚班满了才兜通班', () => {
  const night = res('2026-11-12', 'SL-V302')
  const full = res('2026-11-12', 'SL-V303')
  assert.equal(night.length, 3)
  assert.equal(full.length, 1)
  assert.equal(night.find(r => r.fallback)?.personName, '蓝田')
  assert.equal(full.find(r => r.fallback)?.personName, '林深')
  assert.equal(full[0].way, '兜底·通班')
})

test('兜底只吃目标时段当天剩余名额，且不超物理容量', () => {
  for (const d of ['2026-11-10', '2026-11-11', '2026-11-12']) {
    const night = res(d, 'SL-V302')
    assert.ok(night.length <= 3, `${d} 晚班超容量`)
    const tong = res(d, 'SL-V303')
    assert.ok(tong.length <= 2, `${d} 通班超容量`)
  }
})

test('轮的状态：今天 11-12 已结算、11-14 申领中、11-16 申领中', () => {
  const inst = (date, slotId) => batch.instances.find(i => i.date === date && i.slot.id === slotId)
  assert.equal(inst('2026-11-12', 'SL-V301').state, 'settled')
  assert.equal(inst('2026-11-14', 'SL-V301').state, 'open')
  assert.equal(inst('2026-11-16', 'SL-V301').state, 'open')
})

test('申领截止：排班日 1 天前 22:00（11-16 的班 → 11-15 22:00 截止）', () => {
  const close = anchorTime3({ kind: 'd', before: 1, time: '22:00' }, '2026-11-16')
  assert.equal(close.getFullYear(), 2026)
  assert.equal(close.getMonth(), 10)
  assert.equal(close.getDate(), 15)
  assert.equal(close.getHours(), 22)
  const r1 = findRule3('AC-01').rounds[0]
  assert.equal(roundState3(r1, '2026-11-16', NOW), 'open')
  assert.equal(roundState3(r1, '2026-11-12', NOW), 'settled')
})

test('公布即抢：即时生效，无截止；抢完不补（余额不管）', () => {
  const r = findRule3('AC-02')
  assert.equal(r.mode, 'grab')
  assert.equal(r.rounds[0].close, null)
  assert.equal(r.balance, 'none')
  assert.ok(ofSlot('SL-V302').filter(x => x.way === '先到先得自领').length > 0)
})

test('系统直派：办公区行政班每天 2 人，不需要申领', () => {
  const d = res('2026-12-01', 'SL-V308')
  assert.equal(d.length, 2)
  assert.ok(d.every(r => r.way === '系统直派'))
  assert.equal(batch.applications.filter(a => a.slotId === 'SL-V308').length, 0)
})

test('轮转：同一天只有一个人持有，且同一周内不换人', () => {
  const week = batch.results.filter(r => r.slotId === 'SL-V305' && r.date >= '2026-11-09' && r.date <= '2026-11-15')
  const holders = new Set(week.map(r => r.personName))
  assert.equal(holders.size, 1)
  assert.ok(week.every(r => r.way === '轮转排定'))
  const expected = ['裴照', '祁连'][weekParity3('2026-11-09') % 2]
  assert.equal([...holders][0], expected)
})

test('按月铺整月：麓山非全晚峰 4 人自领 + 推拿师兜底到通班', () => {
  const d = res('2026-12-01', 'SL-V304')
  assert.equal(d.length, 4)
  assert.ok(d.every(r => r.way === '先到先得自领'))
  const t = res('2026-12-01', 'SL-V306')
  assert.equal(t.length, 2)
  assert.ok(t.every(r => r.way === '兜底·通班'))
})

test('结果表是唯一记录口：每条结果的「怎么排上的」都在值域内', () => {
  const ok = new Set(['审核通过', '先到先得自领', '轮转排定', '系统直派', '兜底·晚班', '兜底·通班'])
  for (const r of batch.results) assert.ok(ok.has(r.way), `未知来源 ${r.way}`)
})

test('模拟确定性：同一时刻跑两遍完全一致', () => {
  const again = runBatch3(NOW)
  assert.equal(JSON.stringify(again.results), JSON.stringify(batch.results))
})

test('净工时按班次算：早班 7h、通班 10h、非全晚峰 2h', () => {
  assert.equal(netHours3(findShift3('CS-101')), 7)
  assert.equal(netHours3(findShift3('CS-103')), 10)
  assert.equal(netHours3(findShift3('CS-203')), 2)
})
