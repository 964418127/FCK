import { test } from 'node:test'
import assert from 'node:assert/strict'
import { reactive } from 'vue'
import { buildV5State, roundOf, snapN5, activeCount5, grab5, applyFor5, addFact5, resolveApplications5, openOffers5, matchWho5, whoLabel5, windowOpen5, openAt5, windowLabel5, WEEK_DATES, recalcRound, slotById, JOBS5, cycleStartOf, cycleEndOf, dayCopyPlan5, applyDayCopy5, runDueDirect5, canTake5, slotsOn5, datesOfRound5, claimCheck5, claimRulesOf5, claimSet5, weekRange5, monthRange5, runDueRounds5, addCategory5, renameCategory5, removeCategory5, categoryUsage5, dutyPersonId5, claimedSlots5, personBusy5, undoSwap5, roundListOf, roundStatusOf } from '../src/mock/scheduleV5.js'
import { checkSlotForm } from '../src/mock/scheduleV5Store.js'

const mk = () => reactive(buildV5State())

test('定义段：周期时段铺星期，临时班次只落指定日期', () => {
  const s = mk()
  assert.ok(s.slots.some(x => x.id === 'SL-01'))
  assert.equal(WEEK_DATES.length, 7)
  assert.equal(s.temps.filter(t => t.date === '2026-11-21').length, 1)
})

test('「谁」三条件匹配：范围（本店/附近 km）+ 合作性质 + 岗位', () => {
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
  // 第 3 档：附近 5km · 推拿师（滨江店距蓝田店约 4.6km，命中）
  assert.equal(matchWho5(s, person('E-133'), sl01, sl01.list[2].who), true)
  assert.equal(matchWho5(s, person('E-141'), sl01, sl01.list[2].who), true)
  assert.equal(matchWho5(s, person('E-113'), sl01, sl01.list[2].who), false, '客户经理不在岗位条件内')
  // 范围收窄到 3km：滨江店就出圈了
  const near = { scope: 'radius', km: 3, kind: 'all', pos: 'all' }
  assert.equal(matchWho5(s, person('E-107'), sl01, near), true, '本店也在半径圈内')
  assert.equal(matchWho5(s, person('E-133'), sl01, near), false)
})

test('岗位字典：通用系统不写死岗位，弹窗选项从字典出', () => {
  assert.ok(JOBS5.includes('推拿师') && JOBS5.includes('客户经理'))
  assert.ok(JOBS5.length >= 4, '岗位字典至少覆盖门店常见岗位')
})

test('岗位字典：通用系统不写死岗位，弹窗选项从字典出', () => {
  assert.ok(JOBS5.includes('推拿师') && JOBS5.includes('客户经理'))
  assert.ok(JOBS5.length >= 4, '岗位字典至少覆盖门店常见岗位')
})

test('whoLabel5：条件组合成人话，全不限=全员', () => {
  assert.equal(whoLabel5({ scope: 'store', kind: 'all', pos: 'all' }), '本店全员')
  assert.equal(whoLabel5({ scope: 'store', kind: 'fulltime', pos: 'all' }), '本店 · 全职')
  assert.equal(whoLabel5({ scope: 'radius', km: 5, kind: 'all', pos: '推拿师' }), '附近 5km · 推拿师')
})

test('窗口：发布即开、周五 06:00 已开、开班前一天 20:00 未开', () => {
  const s = mk()
  const sl01 = s.slots.find(x => x.id === 'SL-01')
  assert.equal(windowOpen5(sl01.list[0], '2026-11-16'), true)
  assert.equal(windowOpen5(sl01.list[1], '2026-11-16'), true)
  assert.equal(windowOpen5(sl01.list[2], '2026-11-16'), false)
})

test('开放窗口抽象：锚点+偏移落成具体日期时间，旧字符串写法兼容', () => {
  const s = mk()
  const sl01 = s.slots.find(x => x.id === 'SL-01')
  /* 发布即开：发布时刻就是开放时刻 */
  assert.equal(openAt5(sl01.list[0], s.round), '2026-11-12 06:00')
  assert.ok(windowLabel5(sl01.list[0]).includes('发布即开'), '发布即开要带具体时刻')
  /* 发布后的周五 06:00（发布 11-12 周四 → 11-13 周五） */
  assert.equal(openAt5(sl01.list[1], s.round), '2026-11-13 06:00')
  assert.ok(windowLabel5(sl01.list[1], sl01).includes('11-13 06:00 开（发布后的周五）'), '窗口展示要落成用户可读的日期时间')
  /* 开班日相对：开班前一天 20:00 */
  assert.equal(openAt5(sl01.list[2], s.round, '2026-11-16'), '2026-11-15 20:00')
  assert.ok(windowLabel5(sl01.list[2], null, '2026-11-16').includes('11-15 20:00 开（开班前 1 天）'))
  /* 发布后推 N 天 */
  const off = { win: { base: 'publish', d: 2, t: '09:00' } }
  assert.equal(openAt5(off, s.round), '2026-11-14 09:00')
  assert.ok(windowLabel5(off).includes('发布后 2 天'))
  /* 旧字符串写法照常工作（normWin5 兼容） */
  assert.equal(openAt5({ win: 'fri0600' }, s.round), '2026-11-13 06:00')
  assert.equal(openAt5({ win: 'day1' }, s.round, '2026-11-16'), '2026-11-15 20:00')
  assert.equal(openAt5({ win: 'publish' }, s.round), '2026-11-12 06:00')
  /* 没给日期的开班日相对窗口：算不出具体时刻 */
  assert.equal(openAt5({ win: { base: 'date', d: -1, t: '20:00' } }, s.round, null), null)
})

test('发布后推 0 天：开窗不早于发布时刻', () => {
  const s = mk()
  /* t 晚于发布 06:00 → 取配置时刻，等于发布后推一小段 */
  assert.equal(openAt5({ win: { base: 'puboff', d: 0, t: '09:00' } }, s.round), '2026-11-12 09:00')
  /* t 早于发布 → 收敛到发布时刻 */
  assert.equal(openAt5({ win: { base: 'puboff', d: 0, t: '05:00' } }, s.round), '2026-11-12 06:00')
  assert.ok(windowLabel5({ win: { base: 'puboff', d: 0, t: '05:00' } }).includes('不早于发布'))
  /* 推 1 天正常落成次日时刻 */
  assert.equal(openAt5({ win: { base: 'puboff', d: 1, t: '09:00' } }, s.round), '2026-11-13 09:00')
})

test('档位自检：上限不能超过名额', () => {
  const s = mk()
  const form = { name: '凌晨班', start: '03:00', end: '05:00', days: [1], quota: { source: 'manual', value: 3 },
    list: [{ who: { scope: 'store', kind: 'all', pos: 'all' }, way: 'grab', win: { base: 'publish', d: 0, t: '06:00' }, cap: 5 }] }
  const errs = checkSlotForm(s.spaces[0].id, form)
  assert.ok(errs.some(e => e.includes('上限 5 超过了名额 3')), '超名额的上限要报错')
  form.list[0].cap = null
  assert.ok(!checkSlotForm(s.spaces[0].id, form).some(e => e.includes('名额')), '不封顶不报错')
})

test('通班=收尾班次：直派到点执行，收落空的人，已排到班的跳过', () => {
  const s = mk()
  const mon = s.placements.filter(p => p.slotId === 'SL-06' && p.date === '2026-11-16' && p.status === 'active')
  assert.ok(mon.length >= 1, '通班窗口（11-14 09:00）已到，直派应已分人')
  assert.equal(mon[0].at, '2026-11-14 09:00', '分人时刻 = 窗口开放时刻，不是发布时刻')
  assert.ok(mon.every(p => p.personId === 'E-137'), '已排到早/晚班的全职被冲突检查挡外，只有落空的石全进来')
  assert.equal(mon.length, 1, '名额 2，只有 1 个落空的人，剩的位待人事安排')
  /* 11-19 沈书（E-113）没排到班：通班把他收进去，位满 2/2 */
  const thu = s.placements.filter(p => p.slotId === 'SL-06' && p.date === '2026-11-19' && p.status === 'active')
  assert.deepEqual(thu.map(p => p.personId).sort(), ['E-113', 'E-137'], '落空的沈书和石全都被收进通班')
  /* 还没到点：不执行 */
  const s2 = mk()
  s2.placements = s2.placements.filter(p => p.slotId !== 'SL-06')
  s2.directDone.delete('SL-06|2026-11-16|1')
  runDueDirect5(s2, '2026-11-13 10:00')
  assert.equal(s2.placements.filter(p => p.slotId === 'SL-06' && p.date === '2026-11-16').length, 0, '窗口没开不分人')
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
  assert.equal(r.reason, '还没开：11-15 20:00 开（开班前 1 天）')
})

test('申领：提交只登记；截止按综合分排序截断（工时不由排班判断）', () => {
  const s = mk()
  assert.equal(applyFor5(s, 'SL-03', '2026-11-22', 'E-121').ok, true)
  // 预置 3 条申领（11-21），N=2：综合分 E-107(86) E-126(81) E-121(78)
  // 工时不在排班判断——排班只记这个班几点到几点，接不接得起由获取端背后的服务算
  const res = resolveApplications5(s, '2026-11-21', 'SL-03')
  assert.deepEqual(res.picked, ['E-107', 'E-126'])
  assert.deepEqual(res.rejected, ['E-121'])
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

test('请假：无人可顶时段留空，发通知给人事处理；人事顶上后待办自动销掉', () => {
  const s = mk()
  s.people.forEach(p => {
    if (p.id !== 'E-107') s.placements.push({ id: `PB-${p.id}`, slotId: 'SL-01', date: '2026-11-18', personId: p.id, way: '直派', status: 'active', history: [] })
  })
  const fact = { id: 'F-Y', type: '请假', at: '2026-11-14 11:00', by: 'E-107', slotId: 'SL-01', date: '2026-11-18', placementId: 'P-09', result: '' }
  addFact5(s, fact)
  assert.ok(fact.result.includes('通知人事'))
  const hn = s.notices.find(n => n.kind === 'hr')
  assert.ok(hn, '没人顶要发一条给人事的待处理通知')
  assert.equal(hn.to, 'HR')
  assert.equal(hn.slotId, 'SL-01')
  assert.equal(hn.date, '2026-11-18')
  assert.equal(hn.acked, false)
  /* 人事写顶班事实后，这条待处理自动销掉 */
  addFact5(s, { id: 'F-Y2', type: '顶班', at: '2026-11-14 12:00', by: 'HR', slotId: 'SL-01', date: '2026-11-18', personId: 'E-133', result: '' })
  assert.equal(s.notices.find(n => n.kind === 'hr').acked, true)
})

test('请假只占一部分时间：班次不动、不找补，结果说明只占一段', () => {
  const s = mk()
  const target = s.placements.find(p => p.id === 'P-10')
  const fact = { id: 'F-P', type: '请假', at: '2026-11-14 11:00', by: 'E-107', slotId: 'SL-01', date: '2026-11-19', placementId: 'P-10', start: '10:00', end: '11:00', result: '' }
  addFact5(s, fact)
  assert.equal(target.status, 'active', '只请 1 小时，班次还在这人身上，不整班释放')
  assert.ok(fact.result.includes('10:00–11:00'))
  assert.ok(fact.result.includes('待业务拍板'))
  assert.ok(!s.notices.some(n => n.kind === 'hr'), '部分请假不触发找人顶班')
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

test('换班：不搬占位行——两条互相指向的事件把履约换过去，人名和痕迹留在原行', () => {
  const s = mk()
  const a = s.placements.find(p => p.id === 'P-01')
  const b = s.placements.find(p => p.id === 'P-14')
  const pa = a.personId
  const pb = b.personId
  const fact = { id: 'F-S', type: '换班', at: '2026-11-14 12:00', by: 'E-107', slotId: 'SL-02', date: '2026-11-16', placementId: 'P-14', partnerPlacementId: 'P-01', result: '' }
  addFact5(s, fact)
  assert.equal(a.personId, pa, '原计划人不动')
  assert.equal(b.personId, pb, '原计划人不动')
  assert.equal(a.swap.personId, pb)
  assert.equal(b.swap.personId, pa)
  assert.ok(a.history[0].note.includes('换班'))
  assert.ok(fact.result.includes('改由'), fact.result)
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

test('节奏：自然周，提前 4 天 06:00 发，铺一周', () => {
  const s = mk()
  assert.equal(s.round.nextAt, '2026-11-19 06:00')
  assert.equal(s.round.nextSpan[0], '2026-11-23')
  assert.equal(s.round.nextSpan[1], '2026-11-29')
})

test('节奏：改发布偏移（提前 5 天）→ 预告跟着重算', () => {
  const s = mk()
  s.round.config.publishOffsetDays = -5
  recalcRound(s)
  assert.equal(s.round.nextAt, '2026-11-18 06:00')
  assert.equal(s.round.nextSpan[0], '2026-11-23')
})

test('节奏：自然月，周期=整月，提前 5 天发铺下月', () => {
  const s = mk()
  s.round.config.cycle = { anchor: 'monthStart', unit: 'month', n: 1, start: '' }
  s.round.config.publishOffsetDays = -5
  s.round.config.publishHour = 9
  recalcRound(s)
  /* now=11-14，12 月周期起点 12-01，提前 5 天 = 11-26 09:00 发布，铺 12-01~12-31 */
  assert.equal(s.round.nextAt, '2026-11-26 09:00')
  assert.deepEqual(s.round.nextSpan, ['2026-12-01', '2026-12-31'])
})

test('节奏：业务自定义周期（每月 26 日–次月 25 日）', () => {
  const s = mk()
  s.round.config.cycle = { anchor: 'custom', unit: 'month', n: 1, start: '2026-10-26' }
  s.round.config.publishOffsetDays = -6
  s.round.config.publishHour = 8
  recalcRound(s)
  /* now=11-14 落在 10-26~11-25 期；发布 10-20 已过 → 下一期 11-26~12-25，提前 6 天 = 11-20 08:00 */
  assert.equal(s.round.nextAt, '2026-11-20 08:00')
  assert.deepEqual(s.round.nextSpan, ['2026-11-26', '2026-12-25'])
})

test('节奏：双周周期 + 隔一期发（每 4 周发一次铺 2 周）', () => {
  const s = mk()
  s.round.config.cycle = { anchor: 'monday', unit: 'week', n: 2, start: '' }
  s.round.config.every = 2
  s.round.config.publishOffsetDays = -4
  recalcRound(s)
  const span = (new Date(s.round.nextSpan[1]) - new Date(s.round.nextSpan[0])) / 86400000 + 1
  assert.equal(span, 14, '一轮铺两周')
  const gap = (new Date(s.round.nextSpan[0]) - new Date('2026-11-14')) / 86400000
  assert.ok(gap >= 0 && gap <= 28, '隔期发的下一轮在四周之内')
  assert.equal(s.round.nextSpan[0] > '2026-11-14', true)
})

test('节奏：改周期长度立即体现在预告区间', () => {
  const s = mk()
  s.round.config.cycle = { anchor: 'monday', unit: 'week', n: 3, start: '' }
  recalcRound(s)
  const span = (new Date(s.round.nextSpan[1]) - new Date(s.round.nextSpan[0])) / 86400000 + 1
  assert.equal(span, 21, '铺三周')
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

/* 天级复制/覆盖：先配好一天，复制/覆盖到其他天 */
test('天级复制：源天班次覆盖到目标天（加缺的、移多余的），按星期几生效', () => {
  const slots = [
    { name: '早班', start: '10:00', end: '14:00', days: [1, 2] },
    { name: '晚班', start: '14:00', end: '22:00', days: [1] },
    { name: '通班', start: '10:00', end: '22:00', days: [6, 0] }
  ]
  /* 把周一(1)复制到周二(2)：周二补上晚班；早班两周都有不动 */
  const plan = dayCopyPlan5(slots, 1, [2])
  assert.deepEqual(plan.adds, [{ name: '晚班 14:00–22:00', dow: 2 }])
  assert.deepEqual(plan.removes, [])
  applyDayCopy5(slots, 1, [2])
  assert.deepEqual(slots[0].days, [1, 2])
  assert.deepEqual(slots[1].days, [1, 2])
  assert.deepEqual(slots[2].days, [6, 0], '周末班不动')

  /* 反向覆盖：周二只有早班（晚班回退为仅周一），把周二复制到周一——周一的晚班会被移出 */
  slots[1].days = [1]
  const plan2 = dayCopyPlan5(slots, 2, [1])
  assert.equal(plan2.adds.length, 0)
  assert.deepEqual(plan2.removes, [{ name: '晚班 14:00–22:00', dow: 1 }])
  applyDayCopy5(slots, 2, [1])
  assert.deepEqual(slots[0].days, [1, 2])
  assert.deepEqual(slots[1].days, [], '周一的晚班被覆盖移出')

  /* 同名不同起止不算同一个班次 */
  const slots2 = [
    { name: '早班', start: '08:00', end: '12:00', days: [1] },
    { name: '早班', start: '10:00', end: '14:00', days: [2] }
  ]
  const plan3 = dayCopyPlan5(slots2, 1, [2])
  assert.deepEqual(plan3.adds, [{ name: '早班 08:00–12:00', dow: 2 }])
  assert.deepEqual(plan3.removes, [{ name: '早班 10:00–14:00', dow: 2 }])
})

/* ============================================================
 * 兴隆湖店：业务现行四套策略原样落进 v5（客经人数组合 / 推拿业务量
 * / 非全客经三档错峰 / 非全推拿签约÷2），用来自查「通用设计是否满足业务」
 * ============================================================ */

test('兴隆湖店：人员属性标签（在职 / 试用 / 储备）能圈人', () => {
  const s = mk()
  const sl = s.slots.find(x => x.id === 'SL-11')
  const xl = s.people.filter(p => p.spaceId === 'S-205')
  assert.equal(xl.filter(p => p.tag === 'reserve').length, 1, '1 名储备')
  assert.equal(xl.filter(p => p.tag === 'probation').length, 1, '1 名试用')
  const row = sl.list[0]
  const picked = xl.filter(p => matchWho5(s, p, sl, row.who)).map(p => p.name)
  assert.ok(picked.includes('白露'), '试用期照常上班，要能排')
  assert.ok(!picked.includes('岑岭'), '储备不进常规直派这一档')
  assert.deepEqual(picked.sort(), ['何川', '徐青', '白露'].sort())
  /* 储备这一档只圈储备 */
  const only = xl.filter(p => matchWho5(s, p, sl, { scope: 'store', kind: 'all', tag: 'reserve', pos: 'all' })).map(p => p.name)
  assert.deepEqual(only, ['岑岭'])
  assert.equal(whoLabel5({ scope: 'store', kind: 'fulltime', tag: 'regular', pos: '客户经理' }), '本店 · 全职 · 在职 · 客户经理')
})

test('兴隆湖店：全职客户经理按人数组合出早/晚/中各 1 人，直派在到点执行', () => {
  const s = mk()
  const slots = s.slots.filter(x => x.spaceId === 'S-205')
  const early = slots.find(x => x.id === 'SL-11')
  const mid = slots.find(x => x.id === 'SL-12')
  const late = slots.find(x => x.id === 'SL-13')
  /* 3 人店形态：早 2（客经 1 + 推拿 1）、中 1（只有客经）、晚 2（客经 1 + 推拿 1） */
  assert.equal(early.snapN, 2)
  assert.equal(mid.snapN, 1)
  assert.equal(late.snapN, 2)
  const on = (slotId, date) => s.placements.filter(p => p.slotId === slotId && p.date === date && p.status === 'active')
  assert.equal(on('SL-11', '2026-11-16').length, 2, '早班客经 + 推拿各 1')
  assert.equal(on('SL-12', '2026-11-16').length, 1)
  assert.equal(on('SL-13', '2026-11-16').length, 2)
  /* 直派的分人时刻 = 窗口开放时刻（发布即开 = 发布那一刻），不是交付时临时编的 */
  const direct = on('SL-11', '2026-11-16').find(p => p.way.startsWith('直派'))
  assert.equal(direct.at, s.round.publishedAt)
})

test('兴隆湖店：直派轮转——相邻两天同一班次换成不同的人', () => {
  const s = mk()
  const who = (slotId, date) => s.placements
    .filter(p => p.slotId === slotId && p.date === date && p.status === 'active' && p.way.startsWith('直派'))
    .map(p => p.personId)
  const d1 = who('SL-11', '2026-11-16')
  const d2 = who('SL-11', '2026-11-17')
  assert.equal(d1.length, 1)
  assert.equal(d2.length, 1)
  assert.notEqual(d1[0], d2[0], '周一和周二排早班的不该是同一个人')
})

test('兴隆湖店：通班是最后开放的收尾班次，落空的人被它收进去', () => {
  const s = mk()
  const tong = s.slots.find(x => x.id === 'SL-14')
  const row = tong.list[0]
  /* 通班的窗口晚于早/中/晚三班（发布后推 2 天 09:00 > 发布即开） */
  assert.ok(openAt5(row, s.round) > s.round.publishedAt)
  assert.ok(openAt5(row, s.round) > openAt5(s.slots.find(x => x.id === 'SL-11').list[0], s.round))
  const got = s.placements.filter(p => p.slotId === 'SL-14' && p.date === '2026-11-16' && p.status === 'active')
  /* 档位统一写「在职」挡储备：储备只在有缺时补，不参与获取段——通班兜底也收不到储备，只有落空的全职推拿 */
  assert.equal(got.length, 1, '在职落空 1 人（储备岑岭被挡，名额装不满留给人事）')
  const names = got.map(p => s.people.find(x => x.id === p.personId).name).sort()
  assert.deepEqual(names, ['安然'], '没排上早/晚的在职推拿')
})

test('兴隆湖店：非全推拿名额 = 签约 4 人 ÷ 2 向上 = 2，仅本店非全先到先得', () => {
  const s = mk()
  const must = s.slots.find(x => x.id === 'SL-17')
  assert.equal(must.quota.source, 'service')
  assert.equal(must.quota.serviceId, 'AS-02')
  assert.equal(must.snapN, 2)
  assert.equal(must.list.length, 1)
  assert.equal(must.list[0].way, 'grab')
  assert.deepEqual(must.list[0].who, { tag: 'regular', scope: 'store', kind: 'parttime', pos: '推拿师' })
  const got = s.placements.filter(p => p.slotId === 'SL-17' && p.date === '2026-11-16')
  assert.equal(got.length, 2)
})

test('兴隆湖店：非全客经三档错峰——非全客经 → 非全推拿 → 全职推拿，开放时刻递增', () => {
  const s = mk()
  const cyc = s.slots.find(x => x.id === 'SL-15')
  assert.equal(cyc.list.length, 3)
  assert.equal(whoLabel5(cyc.list[0].who), '本店 · 非全 · 在职 · 客户经理')
  assert.equal(whoLabel5(cyc.list[1].who), '本店 · 非全 · 在职 · 推拿师')
  assert.equal(whoLabel5(cyc.list[2].who), '本店 · 全职 · 在职 · 推拿师')
  const t = cyc.list.map(r => openAt5(r, s.round, '2026-11-16'))
  assert.ok(t[0] < t[1], '非全客经先开')
  assert.ok(t[1] < t[2], '非全推拿次之，全职推拿最后')
})

test('工时不由排班判断：排班只记班次起止，全天排满也放行', () => {
  const s = mk()
  /* 非全推拿 桃夭 同一天连拿必选·早 + 常规（10–14 + 14–18，共 8 小时），排班不再拦 */
  const extra = grab5(s, 'SL-19', '2026-11-16', 'E-211')
  assert.equal(extra.ok, true)
  assert.equal(s.placements.filter(p => p.personId === 'E-211' && p.date === '2026-11-16').length, 2)
})

/* ===== 总部办公区：按月排、按岗位人数 1:1 定名额、排完直接分 ===== */
test('办公区：轮按月，门店轮仍按周——节奏跟着空间走', () => {
  const s = mk()
  const off = roundOf(s, 'S-206')
  assert.equal(off.span[0], '2026-11-01')
  assert.equal(off.span[1], '2026-11-30', '这一期铺整月')
  assert.equal(off.nextAt, '2026-11-27 06:00', '提前 4 天发下个月')
  assert.deepEqual(off.nextSpan, ['2026-12-01', '2026-12-31'])
  const shop = roundOf(s, 'S-201')
  assert.equal(shop.id, 'R-1112')
  assert.deepEqual(shop.span, ['2026-11-16', '2026-11-22'], '门店还是按周')
})

test('办公区：白班 3 晚班 2，只有直派一档，人群是本店全职在职产品经理', () => {
  const s = mk()
  const bai = s.slots.find(x => x.id === 'SL-20')
  const wan = s.slots.find(x => x.id === 'SL-21')
  assert.equal(bai.name, '白班')
  assert.equal(bai.start, '09:30')
  assert.equal(bai.end, '18:30')
  assert.equal(snapN5(s, 'SL-20', '2026-11-16'), 3, '名额按岗位人数 1:1：白班 3')
  assert.equal(snapN5(s, 'SL-21', '2026-11-16'), 2, '晚班 2')
  assert.equal(bai.list.length, 1)
  assert.equal(bai.list[0].way, 'direct', '排完直接分，没有抢单入口')
  assert.equal(whoLabel5(bai.list[0].who), '本店 · 全职 · 在职 · 产品经理')
})

test('办公区：一天 3 白 2 晚正好放下 5 个人，同一个人不会同天上两个班', () => {
  const s = mk()
  WEEK_DATES.forEach(date => {
    const rows = s.placements.filter(p => p.date === date && p.status === 'active' && ['SL-20', 'SL-21'].includes(p.slotId))
    assert.equal(activeCount5(s, 'SL-20', date), 3, `${date} 白班 3 人`)
    assert.equal(activeCount5(s, 'SL-21', date), 2, `${date} 晚班 2 人`)
    assert.equal(new Set(rows.map(p => p.personId)).size, 5, `${date} 5 个人各占一个班`)
  })
})

test('办公区：直派按轮换次序走，相邻两天的白晚班换人', () => {
  const s = mk()
  const of = date => ({
    bai: s.placements.filter(p => p.date === date && p.slotId === 'SL-20').map(p => p.personId),
    wan: s.placements.filter(p => p.date === date && p.slotId === 'SL-21').map(p => p.personId)
  })
  const d1 = of('2026-11-16')
  const d2 = of('2026-11-17')
  assert.notDeepEqual(d1.bai, d2.bai, '第二天白班换人')
  assert.ok(d2.wan.includes(d1.bai[0]), '昨天上白班的人今天轮到晚班')
})

test('白班晚班时间重叠但都是直派，不算「两个入口」——保存不该被挡', () => {
  const s = mk()
  const bai = s.slots.find(x => x.id === 'SL-20')
  const form = {
    name: bai.name, start: bai.start, end: bai.end, days: [...bai.days],
    quota: { ...bai.quota }, list: JSON.parse(JSON.stringify(bai.list))
  }
  const errs = checkSlotForm('S-206', form, 'SL-20')
  assert.equal(errs.length, 0, errs.join('；'))
})

/* 通知不再是排班页的一段：请求本身要能在「我的排班」里被读到并答复 */
test('换班请求：躺着一条待答复的，收件人能看到、答复后状态收口', () => {
  const s = mk()
  const req = s.swapRequests.find(r => r.to === 'E-206' && r.status === 'pending')
  assert.ok(req, '谷雨名下有一条待答复的换班请求')
  assert.equal(req.from, 'E-205', '发起人是罗盘')
  assert.equal(s.people.find(p => p.id === req.to).position, s.people.find(p => p.id === req.from).position, '同岗位才能换')
  req.status = 'declined'
  assert.equal(s.swapRequests.filter(r => r.status === 'pending').length, 0, '答复后不再挂在待处理')
})

/* 办公区唯一的获取段入口：周末晚班留给非全的人自己领，整月范围里挑 */
test('办公区非全：周末晚班整月开放，非全领得到、全职不在这档', () => {
  const s = mk()
  const slot = s.slots.find(x => x.id === 'SL-22')
  assert.ok(slot, '有这条班')
  assert.deepEqual(slot.days, [0, 6], '只排周六日')
  assert.equal(snapN5(s, 'SL-22', '2026-11-14'), 1, '名额 1')
  assert.equal(datesOfRound5(roundOf(s, 'S-206')).length, 30, '这一期是整月，挑班范围就是 30 天')
  assert.ok(slotsOn5(s, '2026-11-14').some(x => x.id === 'SL-22'), '周六有')
  assert.ok(!slotsOn5(s, '2026-11-17').some(x => x.id === 'SL-22'), '周二没有')
  assert.equal(canTake5(s, 'SL-22', '2026-11-14', 'E-306', 'grab', s.now).ok, true, '非全产品经理能领')
  const full = canTake5(s, 'SL-22', '2026-11-14', 'E-301', 'grab', s.now)
  assert.equal(full.ok, false, '全职走直派，不在这档')
  assert.equal(full.reason, '这一档不是你的档')
})

/* ===== 排班时段选择规则：类（或语义）+ 集合校验 + 周/月额度 ===== */
test('类别：兴隆湖有 A/B 两类，非全推拿早/晚挂 A、常规挂 B', () => {
  const s = mk()
  const xl = s.spaces.find(x => x.id === 'S-205')
  assert.deepEqual(xl.categories.map(c => c.id), ['A', 'B'])
  assert.equal(s.slots.find(x => x.id === 'SL-17').category, 'A')
  assert.equal(s.slots.find(x => x.id === 'SL-18').category, 'A')
  assert.equal(s.slots.find(x => x.id === 'SL-19').category, 'B')
  assert.equal(s.slots.find(x => x.id === 'SL-01').category, undefined, '没分类的空间不乱标')
})

test('规则按人群命中：非全推拿 2 条，别人 0 条（空规则放行）', () => {
  const s = mk()
  const p = id => s.people.find(x => x.id === id)
  assert.equal(claimRulesOf5(s, 'S-205', p('E-211')).length, 2)
  assert.equal(claimRulesOf5(s, 'S-205', p('E-208')).length, 0, '非全客经没配规则')
  assert.equal(claimRulesOf5(s, 'S-205', p('E-205')).length, 0, '全职推拿没配规则')
  const empty = claimCheck5(s, 'S-201', 'E-121', '2026-11-16')
  assert.equal(empty.hasRule, false)
  assert.equal(empty.ok, true, '没配规则直接放行')
  assert.equal(empty.limits.length, 0, '蓝田店没配额度')
})

test('A 类是「或」：只占晚班不占早班，A 类照样满足', () => {
  const s = mk()
  const r = claimCheck5(s, 'S-205', 'E-213', '2026-11-16')   // 只有 SL-18 晚班（A 类 18–22）
  assert.equal(r.hasRule, true)
  const a = r.items.find(i => i.id === 'CR-01')
  assert.equal(a.ok, true, '类下任一条都算数')
  assert.equal(a.actual, '1 条')
})

test('A 类一条都没占到 → 差 1 条', () => {
  const s = mk()
  s.placements = s.placements.filter(p => !(p.personId === 'E-213' && p.date === '2026-11-16'))
  const r = claimCheck5(s, 'S-205', 'E-213', '2026-11-16')
  const a = r.items.find(i => i.id === 'CR-01')
  assert.equal(a.ok, false)
  assert.equal(a.actual, '0 条')
})

test('每日时长线 360–540 分钟：4 小时不够，加常规班凑到 8 小时满足', () => {
  const s = mk()
  const before = claimCheck5(s, 'S-205', 'E-211', '2026-11-16')
  const m1 = before.items.find(i => i.id === 'CR-02')
  assert.equal(m1.ok, false, '只有早班 240 分钟，少于 360')
  assert.equal(m1.actual, '240 分钟')
  assert.equal(grab5(s, 'SL-19', '2026-11-16', 'E-211').ok, true)
  const after = claimCheck5(s, 'S-205', 'E-211', '2026-11-16')
  const m2 = after.items.find(i => i.id === 'CR-02')
  assert.equal(m2.actual, '480 分钟')
  assert.equal(m2.ok, true)
  assert.equal(after.ok, true, 'A 类 1 条 + 480 分钟，全部满足')
})

test('集合提交只看「类型 + 数量」：一条没选不许交，A 类没勾够不许交', () => {
  const s = mk()
  s.placements = s.placements.filter(p => p.personId !== 'E-213')   // 这周还什么都没占
  const empty = claimSet5(s, 'S-205', 'E-213', '2026-11-16', [])
  assert.equal(empty.empty, true)
  assert.equal(empty.ok, false, '空组不是合规的提交')
  /* 只勾 B 类常规：A 类还是一条没有 */
  const onlyB = claimSet5(s, 'S-205', 'E-213', '2026-11-16', ['SL-19'])
  assert.equal(onlyB.ok, false)
  assert.deepEqual(onlyB.reasons, ['A 类还差 1 条'])
  /* 勾上 A 类早班：类的要求够了就能交；当天时长只有 4 小时——那是整天合计，不卡提交 */
  const onlyA = claimSet5(s, 'S-205', 'E-213', '2026-11-16', ['SL-17'])
  assert.equal(onlyA.ok, true, '时长下限不在提交门槛上')
  assert.equal(onlyA.items.find(i => i.id === 'CR-02').ok, false, '但进度条上仍标着时长没够')
  /* 两条一起勾：8 小时，全部满足 */
  const okSet = claimSet5(s, 'S-205', 'E-213', '2026-11-16', ['SL-17', 'SL-19'])
  assert.equal(okSet.ok, true)
  assert.equal(okSet.dayUsed, 480)
  assert.equal(okSet.items.every(i => i.ok), true)
})

test('集合提交：这组会把周额度撑破时，提交前就说清楚', () => {
  const s = mk()
  /* E-213 本周已 20 小时（5 天 × 4 小时）：再勾 8 小时 = 28 小时 > 24 */
  const r = claimSet5(s, 'S-205', 'E-213', '2026-11-16', ['SL-17', 'SL-19'])
  assert.equal(r.ok, false)
  assert.ok(r.reasons.some(x => x.includes('本周额度不够')), r.reasons.join('|'))
})

test('自然周从周一起、自然月按日历', () => {
  assert.deepEqual(weekRange5('2026-11-16'), ['2026-11-16', '2026-11-22'])
  assert.deepEqual(weekRange5('2026-11-22'), ['2026-11-16', '2026-11-22'], '周日仍属本周')
  assert.deepEqual(monthRange5('2026-11-16'), ['2026-11-01', '2026-11-30'])
  assert.deepEqual(monthRange5('2026-02-10'), ['2026-02-01', '2026-02-28'])
})

test('周/月额度按门店算：本周 20 小时合规；凑到 28 小时超周上限', () => {
  const s = mk()
  const r1 = claimCheck5(s, 'S-205', 'E-211', '2026-11-16')
  const w1 = r1.limits.find(l => l.name === '本周额度')
  assert.equal(w1.used, 20)
  assert.equal(w1.cap, 24)
  assert.equal(w1.ok, true, '5 天 × 4 小时 = 20 小时，没超')
  /* 再多占一天晚班（4 小时）→ 24 小时，正好压线仍合规 */
  s.placements.push({ id: 'P-T1', slotId: 'SL-18', date: '2026-11-21', personId: 'E-211', status: 'active', way: '抢 · 第1档' })
  const w2 = claimCheck5(s, 'S-205', 'E-211', '2026-11-16').limits.find(l => l.name === '本周额度')
  assert.equal(w2.used, 24)
  assert.equal(w2.ok, true, '正好 24 小时不超')
  s.placements.push({ id: 'P-T2', slotId: 'SL-19', date: '2026-11-21', personId: 'E-211', status: 'active', way: '抢 · 第1档' })
  const w3 = claimCheck5(s, 'S-205', 'E-211', '2026-11-16').limits.find(l => l.name === '本周额度')
  assert.equal(w3.used, 28)
  assert.equal(w3.ok, false, '28 小时超了周 24')
})

test('额度按店各算一套：同一个人另一家店没有额度配置就不受管', () => {
  const s = mk()
  s.placements.push({ id: 'P-T3', slotId: 'SL-18', date: '2026-11-21', personId: 'E-211', status: 'active', way: '抢 · 第1档' })
  const other = claimCheck5(s, 'S-201', 'E-211', '2026-11-16')
  assert.equal(other.limits.length, 0)
  assert.equal(other.ok, true)
})

/* ===== 申领规则闭环：单条预判门 + 轮快照生效 ===== */
test('超上限当场拦：接了这条今天合计超 9 小时，点了不成并说原因', () => {
  const s = mk()
  s.slots.find(x => x.id === 'SL-18').snapN = 4   /* 只测规则门，把「位已占满」让开 */
  /* 何川 11-17 已占早班 4h，再抢常规（首尾相接 14–18）+ 晚班（18–22），合计 12h 超 540 分钟上限 */
  const g0 = grab5(s, 'SL-19', '2026-11-17', 'E-211')
  assert.equal(g0.ok, true, '首尾相接的常规班能抢')
  const g = grab5(s, 'SL-18', '2026-11-17', 'E-211')
  assert.equal(g.ok, false)
  assert.ok(g.reason.includes('超过每天 9 小时上限'), g.reason)
})

test('超周/月额度当场拦：本周已 20h，再抢 5h 不成；下限不拦单条', () => {
  const s = mk()
  s.placements.push({ id: 'P-G3', slotId: 'SL-19', date: '2026-11-21', personId: 'E-211', status: 'active', way: '抢 · 第1档' })
  const g = grab5(s, 'SL-18', '2026-11-22', 'E-211')   /* 再 +4h = 28h > 24h */
  assert.equal(g.ok, false)
  assert.ok(g.reason.includes('本周非全工时上限 24 小时已满'), g.reason)
  const s2 = mk()
  const g2 = grab5(s2, 'SL-19', '2026-11-22', 'E-213') /* A 类一条没占也放行（下限不拦单条） */
  assert.equal(g2.ok, true)
})

test('规则快照按空间各存一份；没配的空间不受影响', () => {
  const s = mk()
  assert.equal(s.ruleSnapshots['S-205'].rules.length, 2)
  assert.equal(s.ruleSnapshots['S-205'].hourLimits.length, 1)
  assert.equal((s.ruleSnapshots['S-201'] || {}).rules?.length || 0, 0)
  const s2 = mk()
  assert.equal(grab5(s2, 'SL-01', '2026-11-23', 'E-121').ok, true, '没规则空间照常抢')
})

test('改配置不进当前轮快照；发布下一轮（演示翻轮）后才生效', () => {
  const s = mk()
  /* 配置层加一条：A 类至多 1 */
  s.claimRules.push({ id: 'CR-T', spaceId: 'S-205', name: 'A 类至多 1', who: s.claimRules[0].who, scope: { type: 'category', id: 'A' }, unit: 'count', min: 0, max: 1 })
  assert.equal(s.ruleSnapshots['S-205'].rules.length, 2, '当前轮快照没变')
  /* 试算按配置层立即能看到新规则 */
  const trial = claimCheck5(s, 'S-205', 'E-213', '2026-11-16', { config: true })
  assert.equal(trial.items.length, 3)
  /* 推进到 nextAt 翻轮：新快照带上新规则 */
  runDueRounds5(s, s.round.nextAt)
  assert.equal(s.ruleSnapshots['S-205'].rules.length, 3, '新一轮快照已刷新')
  assert.equal(s.round.span[0], '2026-11-23')
})

test('非全签约多店：兼签店的名额看得到、matchWho 按签约集合判', () => {
  const s = mk()
  const tao = s.people.find(p => p.id === 'E-211')
  assert.deepEqual(tao.spaceIds, ['S-205', 'S-201'])
  /* 桃夭兼签蓝田：蓝田非全推拿班（本店档位）对她开放 */
  const lantian = s.slots.find(x => x.id === 'SL-01')   /* 蓝田早班，含本店非全推拿抢档 */
  const hit = lantian.list.some(r => matchWho5(s, tao, lantian, r.who))
  assert.equal(hit, true, '兼签店的本店档位命中')
  /* 没签的店照旧挡住 */
  const guanlan = { spaceId: 'S-203' }
  assert.equal(matchWho5(s, tao, guanlan, { scope: 'store', kind: 'parttime', pos: '推拿师' }), false)
})

/* ===== 类别维护（增 / 改名 / 删，带占用保护） ===== */
test('类别：加 C 类只加一行数据，改名同步生效，删除挡住被占用', () => {
  const s = mk()
  const add = addCategory5(s, 'S-205', 'C 类')
  assert.equal(add.ok, true)
  assert.equal(s.spaces.find(x => x.id === 'S-205').categories.length, 3)
  assert.deepEqual(add.id, 'C', '下一个未占用的字母')
  assert.equal(addCategory5(s, 'S-205', 'C 类').ok, false, '不许重名')
  assert.equal(addCategory5(s, 'S-205', '   ').ok, false, '名字不能空')

  assert.equal(renameCategory5(s, 'S-205', 'A', '早高峰').ok, true)
  assert.equal(s.spaces.find(x => x.id === 'S-205').categories.find(c => c.id === 'A').name, '早高峰')

  /* A 类下有两个班次、一条规则 → 删不掉 */
  const del = removeCategory5(s, 'S-205', 'A')
  assert.equal(del.ok, false)
  assert.ok(del.reason.includes('2 条班次'), del.reason)
  /* 刚加的 C 类没人用 → 能删 */
  assert.equal(removeCategory5(s, 'S-205', 'C').ok, true)
})

test('类别占用统计：班次与规则分别计数', () => {
  const s = mk()
  assert.deepEqual(categoryUsage5(s, 'S-205', 'A'), { slots: 2, rules: 1 })
  assert.deepEqual(categoryUsage5(s, 'S-205', 'B'), { slots: 1, rules: 0 })
  assert.deepEqual(categoryUsage5(s, 'S-201', 'A'), { slots: 0, rules: 0 })
})

test('规则进度项带 scope/unit，移动端才能按类给进度', () => {
  const s = mk()
  const r = claimCheck5(s, 'S-205', 'E-211', '2026-11-16')
  const count = r.items.find(i => i.unit === 'count')
  const mins = r.items.find(i => i.unit === 'minute')
  assert.deepEqual(count.scope, { type: 'category', id: 'A' })
  assert.deepEqual(mins.scope, { type: 'all' })
})

/* ===== 换班 = 两条互相指向的事件占住时段，不搬占位行 ===== */
function swapSet(s) {
  const a = s.placements.find(p => p.personId === 'E-211' && p.slotId === 'SL-17' && p.date === '2026-11-16')
  const b = s.placements.find(p => p.personId === 'E-213' && p.slotId === 'SL-18' && p.date === '2026-11-16')
  const fact = addFact5(s, {
    id: 'F-SWAP', type: '换班', at: '2026-11-15 21:00', by: 'E-211',
    slotId: 'SL-17', date: '', placementId: a.id, partnerPlacementId: b.id
  })
  return { a, b, fact }
}

test('换班：占位行不搬人，两条互相指向的换班事件把履约换过去', () => {
  const s = mk()
  const { a, b, fact } = swapSet(s)
  assert.equal(a.personId, 'E-211', '原计划人不动')
  assert.equal(b.personId, 'E-213', '原计划人不动')
  assert.equal(a.swap.personId, 'E-213')
  assert.equal(b.swap.personId, 'E-211')
  assert.equal(a.swap.factId, fact.id)
  assert.equal(b.swap.factId, fact.id, '两条指向同一条事件')
  assert.equal(dutyPersonId5(a), 'E-213')
  assert.equal(dutyPersonId5(b), 'E-211')
  assert.ok(a.history.some(h => h.note.includes('换班')) && b.history.some(h => h.note.includes('换班')), '痕迹留在原行')
})

test('换班后判定按履约人：换出的那段我不忙、对方忙；工时算履约的', () => {
  const s = mk()
  const { a, b } = swapSet(s)
  assert.equal(personBusy5(s, 'E-211', '2026-11-16', '10:00', '14:00'), false, '换出去后我不再占这段时间')
  assert.equal(personBusy5(s, 'E-213', '2026-11-16', '10:00', '14:00'), true, '对方要去上这一段')
  assert.equal(personBusy5(s, 'E-211', '2026-11-16', '18:00', '22:00'), true, '我要去上对方那条')
  const tao = claimedSlots5(s, 'E-211', 'S-205', '2026-11-16').map(x => x.id)
  const mu = claimedSlots5(s, 'E-213', 'S-205', '2026-11-16').map(x => x.id)
  assert.deepEqual(tao, ['SL-18'], '我换出的早班不算我的，换入的晚班算我的')
  assert.deepEqual(mu, ['SL-17'], '她的晚班换出去给别人了，接了我的早班')
  /* 名额不回池：两条占位还在，容量口径不变 */
  assert.equal(activeCount5(s, 'SL-17', '2026-11-16'), 2)
  assert.equal(activeCount5(s, 'SL-18', '2026-11-16'), 2)
})

test('撤销换班：两条事件同时失效，各自回到原样', () => {
  const s = mk()
  const { a, b, fact } = swapSet(s)
  const r = undoSwap5(s, fact.id, '2026-11-16 09:00')
  assert.equal(r.ok, true)
  assert.equal(r.count, 2)
  assert.equal(a.swap, undefined)
  assert.equal(b.swap, undefined)
  assert.equal(dutyPersonId5(a), 'E-211')
  assert.equal(dutyPersonId5(b), 'E-213')
  assert.equal(s.facts.find(f => f.id === fact.id).revokedAt, '2026-11-16 09:00')
  assert.equal(personBusy5(s, 'E-213', '2026-11-16', '10:00', '14:00'), false, '撤销后对方不再忙这段')
})


/* ===== 轮次：系统里同时有进行中 + 已排定两轮 ===== */
test('轮次表：已发布待开始的这一轮 + 已生成的下一轮并存', () => {
  const s = mk()
  const list = roundListOf(s, 'S-205')
  assert.equal(list.length, 2, '至少两轮并存')
  const [cur, next] = list
  assert.equal(cur.id.startsWith('R-'), true)
  assert.equal(next.status, 'planned')
  assert.ok(next.span[0] > cur.span[1], '下一轮接在当前轮之后，日期不重叠')
  /* 时间来到覆盖区间内，这一轮就是进行中 */
  s.now = '2026-11-17 10:00'
  assert.equal(roundListOf(s, 'S-205')[0].status, 'running')
})

test('翻轮后历史留痕：已结束轮留在列表里可回查', () => {
  const s = mk()
  const before = roundListOf(s, 'S-205')[0]
  s.now = '2026-11-25 10:00'
  runDueRounds5(s, '2026-11-25 10:00')
  const list = roundListOf(s, 'S-205')
  assert.ok(list.length >= 3, '历史 + 这一轮 + 下一轮')
  const ended = list.filter(r => r.status === 'ended')
  assert.ok(ended.some(r => r.span[0] === before.span[0]), '历史轮保留原来的覆盖区间')
})

test('轮的状态按今天跟覆盖区间比', () => {
  assert.equal(roundStatusOf({ span: ['2026-11-10', '2026-11-16'] }, '2026-11-16'), 'running')
  assert.equal(roundStatusOf({ span: ['2026-11-10', '2026-11-15'] }, '2026-11-16'), 'ended')
  assert.equal(roundStatusOf({ span: ['2026-11-17', '2026-11-23'] }, '2026-11-16'), 'planned')
})
