// 时段与名额 v2 —— 排班结果模拟测试（确定性：固定 today）
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { slotSeeds, shiftOf } from '../src/mock/slotModel.js'
import {
  simulate, SIM_PEOPLE, compositeScore, PASS_LINE,
  nextBatchRange, nextMonthDays, weekParity
} from '../src/mock/slotSim.js'

const TODAY = new Date('2026-11-12T08:00:00')

const { entries, unfilled } = simulate(TODAY)
const batch = nextBatchRange(TODAY)
const month = nextMonthDays(TODAY)

const ofCrowd = c => entries.filter(e => e.crowd === c)
const ofSlot = id => entries.filter(e => e.slotId === id)
const ofDate = d => entries.filter(e => e.date === d)
const names = es => es.map(e => e.personName)

test('下一批 = 下周一 ~ 周日（今天周四 2026-11-12 → 11-16 ~ 11-22）', () => {
  assert.equal(batch[0], '2026-11-16')
  assert.equal(batch[6], '2026-11-22')
})

test('四类岗位在下一批都有排班结果', () => {
  for (const c of ['全日制推拿师', '非全推拿师', '全日制客户经理', '非全客户经理']) {
    const inBatch = ofCrowd(c).filter(e => e.date >= batch[0] && e.date <= batch[6])
    assert.ok(inBatch.length > 0, `${c} 下一批没有排班`)
  }
})

test('SL-001 竞标班：每天 6 条全满，业绩竞标 4 人 = 过审线的前 4 名，落选 2 人先到先得自领', () => {
  for (const d of batch) {
    const es = ofSlot('SL-001').filter(e => e.date === d)
    assert.equal(es.length, 6, `${d} 竞标班不满额`)
    const bid = es.filter(e => e.way === '业绩竞标')
    assert.deepEqual(names(bid).sort(), ['阿岳', '宫羽', '杜衡', '陈力'].sort())
    const self = es.filter(e => e.way === '先到先得自领')
    assert.deepEqual(names(self).sort(), ['祁安', '韩霜'].sort())
  }
  // 过审线：综合分 ≥ 60 的恰好 4 人
  const pass = SIM_PEOPLE.filter(p => p.scores && compositeScore(p) >= PASS_LINE)
  assert.equal(pass.length, 4)
})

test('SL-002 错峰晚峰：每天 3 条全部先到先得，按自抢顺序；周三两人休班 → 名额流入客户经理层', () => {
  for (const d of batch) {
    const es = ofSlot('SL-002').filter(e => e.date === d)
    assert.equal(es.length, 3)
    assert.ok(es.every(e => e.way === '先到先得自领'))
    if (d === batch[0]) assert.deepEqual(names(es).sort(), ['温宁', '夏至', '云杉'].sort())
  }
  // 周三（11-18）：夏至、云杉休班，晚峰名额流给非全客户经理
  const wed = ofSlot('SL-002').filter(e => e.date === '2026-11-18')
  assert.deepEqual(names(wed).sort(), ['江离', '温宁', '白露'].sort())
  const cm = wed.find(e => e.personName === '江离')
  assert.equal(cm.crowd, '非全客户经理')
})

test('个人单日上限（4h）不被突破', () => {
  const sum = {}
  for (const e of entries) sum[`${e.personId}|${e.date}`] = (sum[`${e.personId}|${e.date}`] || 0) + e.hours
  for (const e of entries) {
    if (e.slotId === 'SL-002' || e.slotId === 'SL-007') {
      assert.ok(sum[`${e.personId}|${e.date}`] <= 4, `${e.personName} ${e.date} 超 4h`)
    }
  }
})

test('SL-004 轮转班：本周只由一人持有，按周奇偶决定且另一人本批零排班', () => {
  const es = ofSlot('SL-004')
  assert.equal(es.length, 7)
  const holders = [...new Set(names(es))]
  assert.equal(holders.length, 1)
  const expected = ['岑川', '段云'][weekParity(batch[0]) % 2]
  assert.equal(holders[0], expected)
})

test('SL-005 保洁早段：每天 4 人先挑自领', () => {
  for (const d of batch) {
    const es = ofSlot('SL-005').filter(e => e.date === d)
    assert.equal(es.length, 4)
    assert.ok(es.every(e => e.way === '先到先得自领'))
  }
})

test('SL-006 临时时段：一次性指派给签约最早的候选（江离）', () => {
  const es = ofSlot('SL-006')
  assert.equal(es.length, 1)
  assert.equal(es[0].date, '2026-11-14')
  assert.equal(es[0].personName, '江离')
  assert.equal(es[0].way, '系统指派 · 签约早优先')
})

test('SL-007 按月晚峰：12 月每天 4 条——2 客户经理自领 + 1 推拿师自领 + 1 签约早直派', () => {
  for (const d of month) {
    const es = ofSlot('SL-007').filter(e => e.date === d)
    assert.equal(es.length, 4, `${d} 月度晚峰不满额`)
    const ways = es.map(e => e.way)
    assert.equal(ways.filter(w => w === '系统指派 · 签约早优先').length, 1)
    assert.equal(ways.filter(w => w === '先到先得自领').length, 3)
    if (d === month[0]) {
      const assignee = es.find(e => e.way === '系统指派 · 签约早优先')
      assert.equal(assignee.personName, '栖迟') // 剩余候选里签约最早的是非全推拿师栖迟（06-30）
    }
  }
})

test('SL-003 行政班按月：工作日 2 人系统安排，周末不铺', () => {
  const d1 = ofSlot('SL-003').filter(e => e.date === month[0])
  assert.equal(d1.length, 2)
  assert.ok(d1.every(e => e.way === '系统安排'))
  assert.equal(ofSlot('SL-003').filter(e => ['2026-12-05', '2026-12-06'].includes(e.date)).length, 0)
})

test('本批与整月名额全部消化，无落空', () => {
  assert.deepEqual(unfilled, [])
})

test('模拟是确定性的：同一时刻跑两遍结果一致', () => {
  const again = simulate(TODAY)
  assert.equal(JSON.stringify(again), JSON.stringify({ entries, unfilled }))
})

test('展示语言干净：怎么排上的不带配置术语', () => {
  const banned = ['裁决', '配额', '锚点', '开放模型', '义务', '层']
  for (const e of entries) {
    for (const w of banned) assert.ok(!e.way.includes(w), `${e.way} 泄漏术语「${w}」`)
  }
})

test('SL-007 结构合规：必选时段兜底不是留空、必选层不用先到先得', () => {
  const s = slotSeeds.find(x => x.id === 'SL-007')
  assert.ok(s, '缺少 SL-007 种子')
  assert.notEqual(s.leftover, '留空')
  assert.equal(shiftOf(s).name, '非全晚峰')
  const tiers = s.windows.flatMap(w => w.tiers)
  const duty = tiers.filter(t => t.obligation === 'duty')
  assert.ok(duty.length > 0)
  assert.ok(duty.every(t => !(t.key.type === 'time' && t.key.mode === 'first')))
  assert.equal(s.generation.horizon, 'month')
})
