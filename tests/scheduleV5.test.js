import { test } from 'node:test'
import assert from 'node:assert/strict'
import { reactive } from 'vue'
import { buildV5State, grab5, applyFor5, addFact5, resolveApplications5, openOffers5, matchWho5, whoLabel5, windowOpen5, WEEK_DATES, recalcRound, slotById } from '../src/mock/scheduleV5.js'

const mk = () => reactive(buildV5State())

test('定义段：周期时段铺星期，临时班次只落指定日期', () => {
  const s = mk()
  assert.ok(s.slots.some(x => x.id === 'SL-01'))
  assert.equal(WEEK_DATES.length, 7)
  assert.equal(s.temps.filter(t => t.date === '2026-11-21').length, 1)
})

test('「谁」三条件匹配：范围（本店/周边 km）+ 合作性质 + 岗位', () => {
  const s = mk()
  const sl01 = s.slots.find(x => x.id === 'SL-01')
  const person = id => s.people.find(p => p.id === id)
  // 第 1 档：本店 · 全职
  assert.equal(matchWho5(s, person('E-107'), sl01, sl01.list[0].who), true)
  assert.equal(matchWho5(s, person('E-121'), sl01, sl01.list[0].who), false, '非全进不了全职档')
  assert.equal(matchWho5(s, person('E-133'), sl01, sl01.list[0].who), false, '滨江店不在本店范围')
  // 第 2 档：本店 · 非全
  assert.equal(matchWho5(s, person('E-126'), sl01, sl01.list[1].who), true)
  assert.equal(matchWho5(s, person('E-133'), sl01, sl01.list[1].who), false)
  // 第 3 档：周边 5km · 推拿师（滨江店距蓝田店约 4.6km，命中）
  assert.equal(matchWho5(s, person('E-133'), sl01, sl01.list[2].who), true)
  assert.equal(matchWho5(s, person('E-141'), sl01, sl01.list[2].who), true)
  assert.equal(matchWho5(s, person('E-113'), sl01, sl01.list[2].who), false, '客户经理不在岗位条件内')
  // 范围收窄到 3km：滨江店就出圈了
  const near = { scope: 'radius', km: 3, kind: 'all', pos: 'all' }
  assert.equal(matchWho5(s, person('E-107'), sl01, near), true, '本店也在半径圈内')
  assert.equal(matchWho5(s, person('E-133'), sl01, near), false)
})

test('whoLabel5：条件组合成人话，全不限=全员', () => {
  assert.equal(whoLabel5({ scope: 'store', kind: 'all', pos: 'all' }), '本店全员')
  assert.equal(whoLabel5({ scope: 'store', kind: 'fulltime', pos: 'all' }), '本店 · 全职')
  assert.equal(whoLabel5({ scope: 'radius', km: 5, kind: 'all', pos: '推拿师' }), '周边 5km · 推拿师')
})

test('窗口：发布即开、周五 06:00 已开、开班前一天 20:00 未开', () => {
  const s = mk()
  const sl01 = s.slots.find(x => x.id === 'SL-01')
  assert.equal(windowOpen5(sl01.list[0], '2026-11-16'), true)
  assert.equal(windowOpen5(sl01.list[1], '2026-11-16'), true)
  assert.equal(windowOpen5(sl01.list[2], '2026-11-16'), false)
})

test('抢：占位成功；位满当场说原因', () => {
  const s = mk()
  assert.equal(grab5(s, 'TL-01', '2026-11-21', 'E-107').ok, true)
  assert.equal(grab5(s, 'TL-01', '2026-11-21', 'E-121').ok, true)
  const r3 = grab5(s, 'TL-01', '2026-11-21', 'E-126')
  assert.equal(r3.ok, false)
  assert.equal(r3.reason, '位已占满')
})

test('抢：与已有班次重叠不行（首尾相接可以）', () => {
  const s = mk()
  s.temps.push(
    { id: 'TL-03', spaceId: 'S-201', pos: '推拿师', date: '2026-11-17', name: '下午短班', start: '14:00', end: '18:00', quota: { source: 'manual', value: 1 }, snapN: 1, list: [{ k: 1, who: { scope: 'store', kind: 'parttime', pos: 'all' }, way: 'grab', win: 'publish' }] },
    { id: 'TL-04', spaceId: 'S-201', pos: '推拿师', date: '2026-11-17', name: '重叠试探班', start: '13:00', end: '15:00', quota: { source: 'manual', value: 1 }, snapN: 1, list: [{ k: 1, who: { scope: 'store', kind: 'parttime', pos: 'all' }, way: 'grab', win: 'publish' }] }
  )
  // E-126 11-17 有早班 10:00-14:00（P-07），抢 14:00-18:00 首尾相接可以（当日合计 8 小时内）
  assert.equal(grab5(s, 'TL-03', '2026-11-17', 'E-126').ok, true)
  // 再抢 13:00-15:00 与早班重叠，当场说原因
  const r = grab5(s, 'TL-04', '2026-11-17', 'E-126')
  assert.equal(r.ok, false)
  assert.equal(r.reason, '和已有班次时间撞了')
})

test('抢：未开窗当场说开窗时刻', () => {
  const s = mk()
  s.slots.push({
    id: 'SL-X', spaceId: 'S-201', pos: '推拿师', name: '试探班', start: '09:00', end: '10:00', days: [1, 2, 3, 4, 5, 6, 0],
    quota: { source: 'manual', value: 1 }, snapN: 1,
    list: [{ k: 1, who: { scope: 'store', kind: 'all', pos: 'all' }, way: 'grab', win: 'day1' }]
  })
  const r = grab5(s, 'SL-X', '2026-11-16', 'E-107')
  assert.equal(r.ok, false)
  assert.equal(r.reason, '还没开：开班前一天 20:00 开')
})

test('申领：提交只登记；截止按综合分排序截断，非全工时超限排不了', () => {
  const s = mk()
  assert.equal(applyFor5(s, 'SL-03', '2026-11-22', 'E-121').ok, true)
  // 预置 3 条申领（11-21），N=2：综合分 E-107(86) E-126(81) E-121(78)
  // 周末全天 12 小时：E-107 全职可以（超限记加班），E-126 / E-121 非全 8 小时上限排不了
  const res = resolveApplications5(s, '2026-11-21', 'SL-03')
  assert.deepEqual(res.picked, ['E-107'])
  assert.deepEqual(res.rejected, ['E-126', 'E-121'])
  const ways = s.placements.filter(p => p.slotId === 'SL-03').map(p => p.way)
  assert.ok(ways.some(w => w.includes('综合分86')))
})

test('请假：班次释放 + 找有空没冲突的人顶，解版本 +1', () => {
  const s = mk()
  const target = s.placements.find(p => p.id === 'P-09')
  const before = s.versions[s.versions.length - 1].v
  const fact = { id: 'F-X', type: '请假', at: '2026-11-14 11:00', by: 'E-107', slotId: 'SL-01', date: '2026-11-18', placementId: 'P-09', result: '' }
  addFact5(s, fact)
  assert.equal(target.status, 'covered')
  assert.ok(target.history[0].note.includes('请假'))
  const np = s.placements.find(p => p.fromFact === 'F-X')
  assert.ok(np)
  assert.equal(np.way, '顶班 · 补位')
  assert.ok(fact.result.includes('顶上'))
  assert.equal(s.versions[s.versions.length - 1].v, before + 1)
  assert.ok(s.versions[s.versions.length - 1].facts.includes('F-X'))
})

test('请假：无人可顶时段留空，待人事处理', () => {
  const s = mk()
  s.people.forEach(p => {
    if (p.id !== 'E-107') s.placements.push({ id: `PB-${p.id}`, slotId: 'SL-01', date: '2026-11-18', personId: p.id, way: '直派', status: 'active', history: [] })
  })
  const fact = { id: 'F-Y', type: '请假', at: '2026-11-14 11:00', by: 'E-107', slotId: 'SL-01', date: '2026-11-18', placementId: 'P-09', result: '' }
  addFact5(s, fact)
  assert.ok(fact.result.includes('没人能顶'))
})

test('顶班：人事安排，通知即可，不需同意', () => {
  const s = mk()
  const fact = { id: 'F-Z', type: '顶班', at: '2026-11-14 12:00', by: 'HR', slotId: 'SL-01', date: '2026-11-18', personId: 'E-133', result: '' }
  addFact5(s, fact)
  const np = s.placements.find(p => p.fromFact === 'F-Z')
  assert.equal(np.personId, 'E-133')
  assert.equal(np.way, '顶班')
  const notice = s.notices.find(n => n.to === 'E-133')
  assert.ok(notice)
  assert.equal(notice.kind, 'appoint')
})

test('换班：两条班次对调，双方历史各自留痕', () => {
  const s = mk()
  const a = s.placements.find(p => p.id === 'P-01')
  const b = s.placements.find(p => p.id === 'P-14')
  const fact = { id: 'F-S', type: '换班', at: '2026-11-14 12:00', by: 'E-107', slotId: 'SL-02', date: '2026-11-16', placementId: 'P-14', partnerPlacementId: 'P-01', result: '' }
  addFact5(s, fact)
  assert.equal(a.personId, 'E-107')
  assert.equal(b.personId, 'E-113')
  assert.ok(a.history[0].note.includes('换班'))
  assert.ok(fact.result.includes('对调'))
})

test('离职：人直接出结果，不找人顶', () => {
  const s = mk()
  const fact = { id: 'F-Q', type: '离职', at: '2026-11-14 12:00', by: 'E-107', subtype: '离职', date: '2026-11-16', result: '' }
  addFact5(s, fact)
  const mine = s.placements.filter(p => p.personId === 'E-107' && p.date >= '2026-11-16')
  assert.ok(mine.every(p => p.status === 'covered'))
  assert.equal(s.placements.filter(p => p.fromFact === 'F-Q').length, 0)
})

test('可获取清单：按身份过滤、窗口已开、不重复出现已申领', () => {
  const s = mk()
  const offers = openOffers5(s, 'E-107')
  assert.ok(offers.some(o => o.slotId === 'TL-01'))
  assert.ok(offers.some(o => o.slotId === 'SL-03' && o.date === '2026-11-22'))
  assert.equal(offers.some(o => o.slotId === 'SL-03' && o.date === '2026-11-21'), false)
})

test('行上限：这一档给几个就几个，多出来的留给下一档', () => {
  const s = mk()
  const sl = slotById(s, 'SL-02')
  sl.list[1].cap = 1
  /* 11-16 晚班第 2 档（本店非全）已经有阿禾 1 个，再来一个小满就超了 */
  const r = grab5(s, 'SL-02', '2026-11-16', 'E-126')
  assert.equal(r.ok, false)
  assert.equal(r.reason, '这一档只留 1 个，已经满了')
})

test('节奏改发布时点：下一轮预告跟着重算', () => {
  const s = mk()
  s.round.config.publishDow = 3      // 改成周三
  s.round.config.spanWeeks = 2       // 铺两周
  recalcRound(s)
  assert.equal(s.round.nextAt, '2026-11-18 06:00')
  assert.equal(s.round.nextSpan[0], '2026-11-23')
  assert.equal(s.round.nextSpan[1], '2026-12-06')
})

test('时段不带岗位：岗位写在清单人群里，两个岗位可共用同一段时间', () => {
  const s = mk()
  const sl01 = slotById(s, 'SL-01')
  assert.equal(sl01.pos, undefined)
  /* 同一个时段，两档分别面向推拿师和客户经理 */
  sl01.list.push({ k: 9, who: { scope: 'store', kind: 'all', pos: '客户经理' }, way: 'grab', win: 'publish' })
  assert.equal(matchWho5(s, s.people.find(p => p.id === 'E-113'), sl01, '本店客户经理'), true)
  assert.equal(matchWho5(s, s.people.find(p => p.id === 'E-107'), sl01, '本店客户经理'), false)
})
