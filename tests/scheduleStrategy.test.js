import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  scheduleStrategies, blankStrategy, cronOf, cronSummary, triggerSummary,
  scopeSummary, assignSummary, ORG_STORES, ORG_PEOPLE, CROWD_OPTIONS,
  TAKEOVER_METHODS, METHOD_RULES, OPEN_FROMS, NO_TAKER_ACTIONS, SCOPE_LEVELS, ORG_CITIES,
  TIME_SOURCES, slotNetHours, simulateRelease, WORK_HOUR_DIMS, EXCEED_ACTIONS, WORK_HOUR_BASIS
} from '../src/mock/scheduleStrategies.js'

test('cron 构造：每周四 06:00 / 每月 25 日 10:00 / 每天 / 每年', () => {
  assert.equal(cronOf({ type: 'cron', freq: 'weekly', weekdays: [4], time: '06:00' }), '0 6 * * 4')
  assert.equal(cronOf({ type: 'cron', freq: 'monthly', monthDay: 25, time: '10:00' }), '0 10 25 * *')
  assert.equal(cronOf({ type: 'cron', freq: 'monthly', monthDay: 'last', time: '10:00' }), '0 10 L * *')
  assert.equal(cronOf({ type: 'cron', freq: 'daily', time: '09:30' }), '30 9 * * *')
  assert.equal(cronOf({ type: 'cron', freq: 'yearly', month: 1, monthDayYear: 1, time: '08:00' }), '0 8 1 1 *')
  assert.equal(cronOf({ type: 'manual' }), '')
  assert.equal(cronSummary({ type: 'cron', freq: 'weekly', weekdays: [4], time: '06:00' }), '每周四 06:00')
  assert.equal(cronSummary({ type: 'cron', freq: 'monthly', monthDay: 'last', time: '10:00' }), '每月最后一天 10:00')
})

test('全部种子都能通过表单保存校验（证明表单配得出这些策略）', () => {
  for (const s of scheduleStrategies) {
    assert.ok(s.name.trim(), `${s.id} 名称必填`)
    // ② 范围：非通用必须落具体对象，且对象必须真实存在
    assert.ok(SCOPE_LEVELS.some(l => l.value === s.scopeLevel), `${s.id} 范围层级非法`)
    const t = s.scopeTargets || {}
    if (s.scopeLevel === 'city') assert.ok(t.cities.length && t.cities.every(c => ORG_CITIES.includes(c)), `${s.id} 城市对象无效`)
    if (s.scopeLevel === 'store') assert.ok(t.stores.length && t.stores.every(id => ORG_STORES.some(x => x.id === id)), `${s.id} 门店对象无效`)
    if (s.scopeLevel === 'person') assert.ok(t.people.length && t.people.every(id => ORG_PEOPLE.some(x => x.id === id)), `${s.id} 人员对象无效`)
    // ③ 触发
    if (s.trigger.type === 'cron') {
      assert.ok(s.trigger.time && cronOf(s.trigger), `${s.id} cron 参数不全`)
      if (s.trigger.freq === 'weekly') assert.ok(s.trigger.weekdays.length, `${s.id} 每周触发需勾选星期`)
    }
    if (s.trigger.type === 'event') assert.ok(s.trigger.events && s.trigger.events.length, `${s.id} 事件触发需选事件`)
    // ④ 时段：来源合法、名称非空且唯一、固定时刻必须算得出净工时
    assert.ok(TIME_SOURCES.some(x => x.value === s.shiftStructure.timeSource), `${s.id} 时段来源非法`)
    const slots = s.shiftStructure.slots || []
    assert.ok(slots.length, `${s.id} 没有任何时段（不存在无时段的班次）`)
    const slotNames = slots.map(x => (x.name || '').trim())
    assert.ok(slotNames.every(Boolean), `${s.id} 时段名称不能为空`)
    assert.equal(new Set(slotNames).size, slotNames.length, `${s.id} 时段名称须唯一`)
    if (s.shiftStructure.timeSource === 'fixed') {
      for (const x of slots) {
        const net = slotNetHours(x)
        assert.ok(net !== null && net > 0, `${s.id} 固定时刻时段「${x.name}」必须算得出净工时`)
      }
    }
    // ⑤ 形态组合必须引用 ④ 存在的时段；钳制上下限合法
    if (s.quota.algo === 'headcount-form') {
      for (const f of s.quota.forms) assert.ok(f.combo.length && f.combo.every(c => slotNames.includes(c)), `${s.id} 时段组合引用了不存在的时段`)
    }
    if (s.quota.clamp) assert.ok(Number(s.quota.clamp.min) <= Number(s.quota.clamp.max), `${s.id} 名额钳制上下限反了`)
    // ⑥ 顺位：人群/方式/细分规则/开放起点合法；适用时段只能是已存在的时段，空 = 全部
    for (const tier of s.tiers) {
      assert.ok(CROWD_OPTIONS.includes(tier.crowd), `${s.id} 顺位人群非法：${tier.crowd}`)
      assert.ok(TAKEOVER_METHODS.some(m => m.value === tier.method), `${s.id} 承接方式非法`)
      assert.ok((METHOD_RULES[tier.method] || []).includes(tier.rule), `${s.id} 细分规则与承接方式不匹配`)
      assert.ok(OPEN_FROMS.includes(tier.openFrom), `${s.id} 开放起点非法`)
      assert.ok((tier.slots || []).every(n => slotNames.includes(n)), `${s.id} 顺位引用了不存在的时段`)
    }
    if (s.tiers.length) assert.ok(slotNames.length, `${s.id} 有顺位却没有时段`)
    assert.ok(NO_TAKER_ACTIONS.includes(s.noTaker), `${s.id} 无承接人兜底非法`)
    // ⑦ 综合分权重合计 100
    if (s.priority.enabled) {
      for (const r of s.priority.rules) {
        if (r.kind === 'composite') assert.equal(r.parts.reduce((a, p) => a + p.weight, 0), 100, `${s.id} 综合分权重应为 100%`)
      }
    }
    // ⑧ 动作参数齐全
    for (const g of s.gapRules) {
      if (g.action === 'substitute') assert.ok(g.crowd && g.order, `${s.id} 人群补位需要人群与顺位`)
      if (g.action === 'reshape') assert.ok(g.reshapeResult, `${s.id} 班次变形需要变形结果`)
    }
    // ⑩ 工时约束：维度/口径/处置合法，上限 > 0
    for (const w of s.workHours || []) {
      assert.ok(WORK_HOUR_DIMS.some(d => d.value === w.dim), `${s.id} 工时维度非法`)
      assert.ok(WORK_HOUR_BASIS.some(b => b.value === w.basis), `${s.id} 计入口径非法`)
      assert.ok(EXCEED_ACTIONS.some(a => a.value === w.onExceed), `${s.id} 超限处置非法`)
      assert.ok(Number(w.limit) > 0, `${s.id} 工时上限要大于 0`)
    }
  }
})

test('没有「无时段」的班次：行政班 09:00–18:00 休息 60 分 = 净工时 8h', () => {
  const dev = scheduleStrategies.find(s => s.id === 'SS-005')
  const slot = dev.shiftStructure.slots[0]
  assert.equal(slot.name, '行政班')
  assert.equal(slot.start, '09:00')
  assert.equal(slot.end, '18:00')
  assert.equal(slotNetHours(slot), 8)
  // 非全推拿师的三个时段都是 4 小时
  const pt = scheduleStrategies.find(s => s.id === 'SS-004')
  assert.deepEqual(pt.shiftStructure.slots.map(slotNetHours), [4, 4, 4])
})

test('工时约束抽象成参数：非全 单店 4h / 周 24h 硬拦，办公岗 8h 超出计加班', () => {
  for (const id of ['SS-003', 'SS-004']) {
    const s = scheduleStrategies.find(x => x.id === id)
    const storeDay = s.workHours.find(w => w.dim === 'store-day')
    const week = s.workHours.find(w => w.dim === 'week')
    assert.equal(storeDay.limit, 4)
    assert.equal(storeDay.onExceed, 'block')
    assert.equal(week.limit, 24)
    assert.equal(week.onExceed, 'block')
    // 单店 4h 是「每店」而不是「每天合计」——不应存在跨店单日合计约束
    assert.ok(!s.workHours.some(w => w.dim === 'all-day'))
  }
  for (const id of ['SS-005', 'SS-007']) {
    const s = scheduleStrategies.find(x => x.id === id)
    assert.equal(s.workHours.find(w => w.dim === 'store-day').limit, 8)
    assert.equal(s.workHours.find(w => w.dim === 'store-day').onExceed, 'overtime')
  }
})

test('名额试算：档位命中、原始值、钳制都算得出来', () => {
  const pt = scheduleStrategies.find(s => s.id === 'SS-002')
  // 低于 420 释放 1；钳制 min 1
  assert.deepEqual(simulateRelease(pt.quota, 300), { raw: 1, released: 1, clamped: false, basis: '命中「低于 420 释放 1」' })
  // 低于 600 释放 2
  assert.equal(simulateRelease(pt.quota, 500).released, 2)
  // 高于全部阈值 → 释放到钳制上限 3
  const high = simulateRelease(pt.quota, 900)
  assert.equal(high.released, 3)
  // 比例型：签约 6 人 ÷ 2 向上取整 = 3，钳制上限 4 不生效
  const nonFull = scheduleStrategies.find(s => s.id === 'SS-004')
  assert.equal(simulateRelease(nonFull.quota, 6).released, 3)
  assert.equal(simulateRelease(nonFull.quota, 3).released, 2)
  // 钳制生效：签约 20 人 ÷ 2 = 10，被钳到 4
  const clamped = simulateRelease(nonFull.quota, 20)
  assert.equal(clamped.raw, 10)
  assert.equal(clamped.released, 4)
  assert.equal(clamped.clamped, true)
  // 手填/形态型不试算
  assert.equal(simulateRelease({ algo: 'slot-fixed' }, 5), null)
})

test('改对的核心：时段是原子，谁来承接挂在时段上（1 人店 12:00–22:00）', () => {
  const cm = scheduleStrategies.find(s => s.id === 'SS-001')
  const fullDay = cm.shiftStructure.slots.find(x => x.name === '全天班')
  assert.equal(fullDay.start, '12:00')
  assert.equal(fullDay.end, '22:00')
  assert.equal(fullDay.seats, 1)
  // 第一顺位 = 本店全职客户经理（指派），第二顺位 = 本店储备（缺口补位），第三顺位 = 本店非全（自抢）
  assert.deepEqual(cm.tiers.map(t => t.crowd), ['本店全职客户经理', '本店储备客户经理', '本店非全客户经理', '同城市同岗位'])
  assert.equal(cm.tiers[0].method, 'assign')
  assert.ok(cm.tiers[0].slots.includes('全天班'), '第一顺位应覆盖全天班')
  assert.equal(cm.tiers[2].method, 'self-grab')
  assert.equal(cm.noTaker, '转临时时段')
  // 新增一个 10:00–12:00 的时段，只要它进了某档「适用时段」就有人兜——模型上配得出来
  const withNewSlot = JSON.parse(JSON.stringify(cm))
  withNewSlot.shiftStructure.slots.push({ name: '早段加长', start: '10:00', end: '12:00', breakMin: 0, seats: 1, required: false })
  withNewSlot.tiers[0].slots.push('早段加长')
  assert.ok(withNewSlot.tiers[0].slots.includes('早段加长'))
})

test('摘要：范围落到具体对象、顺位给出档数', () => {
  const cm = scheduleStrategies.find(s => s.id === 'SS-001')
  assert.equal(scopeSummary(cm), '门店：兴隆湖店、麓山店')
  assert.equal(assignSummary(cm), '系统指派 等 4 档')
  const city = scheduleStrategies.find(s => s.id === 'SS-006')
  assert.equal(scopeSummary(city), '城市：长沙')
  const dev = scheduleStrategies.find(s => s.id === 'SS-005')
  assert.equal(assignSummary(dev), '系统指派')
  assert.match(triggerSummary(cm), /每周四 06:00 · 生成往后 1 个周/)
})

test('空白起点不再有预置模板概念', () => {
  const b = blankStrategy()
  assert.ok(!('builtin' in b), '不再有预置模板概念')
  assert.equal(b.priority.rules.length, 0)
  assert.deepEqual(b.scopeTargets, { cities: [], stores: [], people: [] })
  // 空白起点也有一个带时间的时段（行政班），不是「无时段」
  assert.equal(b.shiftStructure.slots.length, 1)
  assert.equal(slotNetHours(b.shiftStructure.slots[0]), 8)
  assert.ok(b.workHours.length >= 1)
})
