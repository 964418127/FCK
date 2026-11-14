import { test } from 'node:test'
import assert from 'node:assert/strict'
import { reactive } from 'vue'
import { buildV5State, grab5, applyFor5, addFact5, resolveApplications5, openOffers5, matchWho5, whoLabel5, windowOpen5, openAt5, windowLabel5, WEEK_DATES, recalcRound, slotById, JOBS5, cycleStartOf, cycleEndOf, dayCopyPlan5, applyDayCopy5, runDueDirect5 } from '../src/mock/scheduleV5.js'
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
    { name: '周末全天', start: '10:00', end: '22:00', days: [6, 0] }
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
