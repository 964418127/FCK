// 排班策略 v4：引擎与能力/事件的契约测试
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  V4_SPACES, V4_PEOPLE, V4_LEAVES, V4_PLANS,
  runBatch4, searchSpaces4, rulerOf4, overtimeMin4, quotaOf4, formsOf4, findSpace4
} from '../src/mock/scheduleV4.js'
import { V4_CAPS, V4_EVENTS, V4_EVENT_DEFS, executeEvent4, capOf4 } from '../src/mock/scheduleV4Events.js'

const fresh = () => ({
  plans: JSON.parse(JSON.stringify(V4_PLANS)),
  people: JSON.parse(JSON.stringify(V4_PEOPLE)),
  leaves: JSON.parse(JSON.stringify(V4_LEAVES)),
  range: { from: '2026-11-01', to: '2026-11-30' }
})

test('空间搜索：名称 / 城市 / 标签都能命中', () => {
  assert.ok(searchSpaces4('兴隆湖').some(s => s.id === 'SP-01'))
  assert.ok(searchSpaces4('重庆').every(s => s.city === '重庆'))
  assert.equal(searchSpaces4('门店').length, V4_SPACES.filter(s => s.tag === '门店').length)
  assert.equal(searchSpaces4('不存在的关键词').length, 0)
})

test('标准时间是尺子：不约束时段，只量出加班', () => {
  const segs = rulerOf4('SP-03', 'PS-04')
  assert.equal(segs[0].start, '09:00')
  assert.equal(segs[0].end, '18:00')
  // 夜班 12:00-22:30 超出 4.5 小时
  assert.equal(overtimeMin4('SP-03', 'PS-04', '12:00', '22:30'), 270)
  // 标准班正好落在尺子里，没有加班
  assert.equal(overtimeMin4('SP-03', 'PS-04', '09:00', '18:00'), 0)
})

/* ---- 2026-11-13 傍晚：结构微调（按时段差异化 + 档位开放时间） ---- */

test('时段可声明出勤日：PL-02 早段只在工作日，周日只有晚段', () => {
  const b = runBatch4(fresh())
  // 2026-11-15 是周日
  const sunday = b.instances.filter(i => i.planId === 'PL-02' && i.date === '2026-11-15')
  assert.deepEqual(sunday.map(i => i.formId), ['SH-D'], '周日只有晚段')
  // 2026-11-16 是周一，早晚段都出
  const monday = b.instances.filter(i => i.planId === 'PL-02' && i.date === '2026-11-16')
  assert.deepEqual(monday.map(i => i.formId).sort(), ['SH-C', 'SH-D'])
})

test('后续处理每个时段独立：PL-01 早班 12h / 晚班 6h / 通班不可取消转移', () => {
  const b = runBatch4(fresh())
  const ac = fid => {
    const inst = b.instances.find(i => i.planId === 'PL-01' && i.formId === fid && i.date === '2026-11-16')
    return inst.aftercare
  }
  assert.equal(ac('SH-A').cancel.value, 12)
  assert.equal(ac('SH-A').cancel.unit, 'h')
  assert.equal(ac('SH-B').cancel.value, 6)
  assert.equal(ac('SH-F').cancel.allow, false, '兜底承接时段不允许自行取消')
  assert.equal(ac('SH-F').transfer.allow, false)
  // PL-03 没单独配的时段继承计划默认
  const p3 = b.instances.find(i => i.planId === 'PL-03' && i.formId === 'SH-E')
  assert.equal(p3.aftercare.cancel.value, 6)
})

test('人工固定名额按时段设数：PL-03 早班/晚班各 1 个，来源=人工固定', () => {
  const b = runBatch4(fresh())
  const early = b.instances.find(i => i.planId === 'PL-03' && i.formId === 'SH-E' && i.date === '2026-11-16')
  assert.equal(early.quota.initial, 1)
  assert.equal(early.quota.algoName, '手动固定')
  assert.ok(early.quota.expr.includes('早班'))
})

test('档位开放时间：发布后 N 小时该档才可见可领', async () => {
  const store = await import('../src/mock/scheduleV4Store.js')
  const { generate4, claimableOf4, claim4, v4 } = store
  generate4()
  const before = claimableOf4('E-412').length
  assert.ok(before > 0, '何清默认有可领名额（发布即开放）')
  // 把 PL-02 的档位改成发布 48h 后开放：发布于 11-13 07:00 → 11-15 07:00 才开放，演示时刻 11-13 15:00 未到
  const tier = v4.plans.find(p => p.id === 'PL-02').priority[0]
  tier.open.delayHours = 48
  assert.equal(claimableOf4('E-412').length, 0, '未开放的档位在可领列表不可见')
  const target = v4.batch.instances.find(i => i.planId === 'PL-02' && i.date === '2026-11-17' && i.formId === 'SH-D')
  const res = claim4('E-412', target.id)
  assert.equal(res.ok, false)
  assert.match(res.why, /尚未开放/)
  assert.match(res.why, /2026-11-15 07:00/)
  tier.open.delayHours = 0
})

test('名额算法能力：出初始值时必须带算式（可解释）', () => {
  const plan = V4_PLANS.find(p => p.id === 'PL-01')
  const q = quotaOf4(plan, { space: findSpace4('SP-01'), form: plan.forms[0], people: V4_PEOPLE })
  assert.equal(q.algoName, '天均分钟数阈值法')
  assert.equal(q.initial, 3)
  assert.ok(q.expr.includes('300') && q.expr.includes('2.50'))
  // 签约平分法
  const p2 = V4_PLANS.find(p => p.id === 'PL-02')
  const q2 = quotaOf4(p2, { space: findSpace4('SP-01'), form: p2.forms[0], people: V4_PEOPLE })
  assert.equal(q2.initial, 2) // 3 个非全 ÷ 2 → 2
  assert.ok(q2.expr.includes('签约非全 3 人'))
})

test('优先序列跨岗位吃名额，兜底承接排最后', () => {
  const b = runBatch4(fresh())
  const early = b.instances.filter(i => i.planId === 'PL-01' && i.formId === 'SH-A' && i.date === '2026-11-16')
  assert.equal(early.length, 1)
  // 早班 3 个名额全被综合分最高的全职推拿师拿走
  const ways = early[0].results.map(r => r.way)
  assert.ok(ways.every(w => w === '审核通过'))
  assert.deepEqual(early[0].results.map(r => r.personName), ['张岚', '李默', '王澈'])
  // 当天没排上的人进通班兜底
  const fb = b.results.filter(r => r.date === '2026-11-16' && r.fallback)
  assert.ok(fb.length > 0)
  assert.ok(fb.every(r => r.formName === '通班'))
})

test('可选时段剩余是合法终态，必选剩余必须被点名', () => {
  const b = runBatch4(fresh())
  const optionalLeft = b.instances.filter(i => {
    const p = V4_PLANS.find(x => x.id === i.planId)
    return i.left > 0 && p?.nature === 'optional'
  })
  assert.ok(optionalLeft.length > 0, '非全客户经理晚段应有剩余')
  const requiredLeft = b.instances.filter(i => {
    const p = V4_PLANS.find(x => x.id === i.planId)
    return i.left > 0 && p?.nature === 'required'
  })
  assert.ok(requiredLeft.some(i => i.planId === 'PL-04' && i.formId === 'SH-I' && i.date === '2026-11-19'), '客服夜班 11-19 无人可排 → 必选留空')
})

test('夜班记录带加班分钟数，兜底记录带兜底标记', () => {
  const b = runBatch4(fresh())
  const night = b.results.filter(r => r.formName === '夜班')
  assert.ok(night.length > 0)
  assert.ok(night.every(r => r.overtimeMin === 270))
  const fb = b.results.filter(r => r.fallback)
  assert.ok(fb.length > 0 && fb.every(r => r.way === '兜底补位'))
})

test('能力清单：14 条，执行与判断分开，判断只读', () => {
  assert.equal(V4_CAPS.length, 14)
  const judges = V4_CAPS.filter(c => c.kind === 'judge')
  const execs = V4_CAPS.filter(c => c.kind === 'exec')
  assert.equal(judges.length, 4)
  assert.equal(execs.length, 10)
  for (const j of judges) assert.ok(/只读|不写库/.test(j.desc), `${j.name} 应声明只读`)
  for (const c of V4_CAPS) assert.ok(capOf4(c.key), '注册表可反查')
})

test('枚举事件与定义一一对应，补班链为 1 判断 + 6 执行', () => {
  assert.equal(V4_EVENTS.length, 5)
  for (const e of V4_EVENTS) assert.ok(V4_EVENT_DEFS.some(d => d.eventId === e.id), `${e.name} 缺定义`)
  const ed1 = V4_EVENT_DEFS.find(d => d.id === 'ED-01')
  assert.equal(ed1.steps.filter(s => capOf4(s.cap)?.kind === 'judge').length, 1)
  assert.equal(ed1.steps.filter(s => capOf4(s.cap)?.kind === 'exec').length, 6)
})

test('边界：人工入口不进事件清单（临时加人只调名额，不是业务事实）', () => {
  assert.equal(V4_EVENTS.find(e => e.name === '临时加人'), undefined)
  assert.equal(V4_EVENT_DEFS.find(d => d.eventId === 'EV-04'), undefined)
  // 能力仍在：人事可以直接调名额，只是不挂事件
  assert.ok(capOf4('adjustQuota'), '人工调整名额仍是原子能力')
  assert.equal(V4_CAPS.length, 14)
  // 编号留空不复用
  assert.deepEqual(V4_EVENTS.map(e => e.id), ['EV-01', 'EV-02', 'EV-03', 'EV-05', 'EV-06'])
})

test('事件试跑：还有全职在岗时判资格拦住，不生成补班', () => {
  const st = fresh()
  const batch = runBatch4(st)
  const res = executeEvent4(V4_EVENT_DEFS.find(d => d.id === 'ED-01'), { personId: 'E-401', date: '2026-11-17' }, { batch, plans: st.plans, people: st.people, leaves: st.leaves, events: V4_EVENTS })
  assert.equal(res.stopped, true)
  assert.ok(res.log[0].detail.includes('还有'))
  assert.equal(batch.instances.filter(i => i.makeup).length, 0)
})

test('事件试跑：最后一名全职请假 → 切分补班 → 非全补位 → 写结果表', () => {
  const st = fresh()
  const batch = runBatch4(st)
  const before = batch.results.length
  const res = executeEvent4(V4_EVENT_DEFS.find(d => d.id === 'ED-01'), { personId: 'E-425', date: '2026-11-18' }, { batch, plans: st.plans, people: st.people, leaves: st.leaves, events: V4_EVENTS })
  assert.equal(res.stopped, false)
  // 韩野的早班被释放
  assert.ok(!batch.results.some(r => r.personId === 'E-425' && r.date === '2026-11-18'))
  // 补班切 2 段（单人 ≤ 4h）
  const mk = batch.instances.filter(i => i.makeup && i.date === '2026-11-18')
  assert.equal(mk.length, 2)
  assert.deepEqual(mk.map(i => i.form.start), ['10:00', '14:00'])
  // 谷雨补进上午段；下午段与他已顶的晚班冲突 → 留空
  const gu = batch.results.filter(r => r.personId === 'E-427' && r.date === '2026-11-18' && r.fromEvent)
  assert.equal(gu.length, 1)
  assert.equal(gu[0].formName, '补班')
  assert.equal(mk.find(i => i.form.start === '14:00').left, 1)
  // 释放韩野早班 -1，事件补位 +1，净变化为 0
  assert.equal(batch.results.length, before)
})

test('补班时段幂等：同一事件重复跑不重复铺', () => {
  const st = fresh()
  const batch = runBatch4(st)
  const ctx = { batch, plans: st.plans, people: st.people, leaves: st.leaves, events: V4_EVENTS }
  executeEvent4(V4_EVENT_DEFS.find(d => d.id === 'ED-01'), { personId: 'E-425', date: '2026-11-18' }, ctx)
  const n1 = batch.instances.filter(i => i.makeup).length
  executeEvent4(V4_EVENT_DEFS.find(d => d.id === 'ED-01'), { personId: 'E-425', date: '2026-11-18' }, ctx)
  assert.equal(batch.instances.filter(i => i.makeup).length, n1)
})

test('请假的人不参与当天分配（资格口径）', () => {
  const b = runBatch4(fresh())
  // E-402 李默 11-17 请假：当天早班 3 人里没有他
  const early17 = b.instances.find(i => i.planId === 'PL-01' && i.formId === 'SH-A' && i.date === '2026-11-17')
  assert.ok(!early17.results.some(r => r.personId === 'E-402'))
  // E-432 洛川 11-19 请假：夜班没人可排
  const night19 = b.instances.find(i => i.planId === 'PL-04' && i.formId === 'SH-I' && i.date === '2026-11-19')
  assert.equal(night19.filled, 0)
})

/* ---- 2026-11-13 拍板：名额模型三层关系 + 补位名额来源 = Agent 能力 ---- */

test('AG-05 按剩余覆盖切分法：补位专用，每段 1 个名额', () => {
  const b = runBatch4(fresh())
  const res = executeEvent4(V4_EVENT_DEFS.find(d => d.id === 'ED-01'), { personId: 'E-425', date: '2026-11-18' }, { batch: b, plans: fresh().plans, people: fresh().people, leaves: fresh().leaves, events: V4_EVENTS })
  const mk = b.instances.filter(i => i.makeup && i.date === '2026-11-18')
  assert.equal(mk.length, 2)
  // 名额来源是 AG-05，不是沿用计划的签约平分（AG-02 是算店常驻规模的，不能拿来算洞）
  assert.ok(mk.every(i => i.quota.algoName === '按剩余覆盖切分法'))
  assert.ok(mk.every(i => i.quota.effective === 1))
  assert.ok(mk.every(i => i.quota.expr.includes('2 段') && i.quota.expr.includes('480 分')), `算式应解释切分：${mk[0].quota.expr}`)
  // ED-01 的编排里引用的就是 AG-05
  const ed1 = V4_EVENT_DEFS.find(d => d.id === 'ED-01')
  assert.equal(ed1.steps.find(s => s.cap === 'quotaInit').params.algoId, 'AG-05')
  void res
})

test('补班路径：原名额「可不用」不回池，时段空壳化，补班段声明弥补关系', () => {
  const st = fresh()
  const batch = runBatch4(st)
  const orig = batch.instances.find(i => i.planId === 'PL-03' && i.formId === 'SH-E' && i.date === '2026-11-18')
  assert.equal(orig.quota.effective, 1)
  assert.equal(orig.filled, 1) // 韩野原本在这
  executeEvent4(V4_EVENT_DEFS.find(d => d.id === 'ED-01'), { personId: 'E-425', date: '2026-11-18' }, { batch, plans: st.plans, people: st.people, leaves: st.leaves, events: V4_EVENTS })
  // 名额不回池：left 不因释放而增加；唯一名额失效 → 时段收敛为空壳
  assert.equal(orig.left, 0)
  assert.equal(orig.voidedQuota, 1)
  assert.equal(orig.voided, true)
  // 补班段声明「弥补哪个洞」
  const mk = batch.instances.filter(i => i.makeup && i.date === '2026-11-18')
  assert.ok(mk.every(i => i.compensates?.formName === '早班' && i.compensates?.start === '10:00'))
  // 历史保留：韩野的原班次进 history，不在 results 里
  assert.equal(batch.results.filter(r => r.personId === 'E-425' && r.date === '2026-11-18').length, 0)
  const h = (batch.history || []).filter(r => r.personId === 'E-425' && r.date === '2026-11-18')
  assert.equal(h.length, 1)
  assert.equal(h[0].formName, '早班')
  assert.ok(h[0].released && /弥补/.test(h[0].releasedWhy))
})

test('再分配路径（ED-02）释放名额要回池，不标可不用', () => {
  const st = fresh()
  const batch = runBatch4(st)
  // 谷雨 11-17 有没有班？PL-03 直派：11-17 早班是谁都行，取一条谷雨的记录来取消
  const row = batch.results.find(r => r.personId === 'E-427')
  assert.ok(row, '谷雨应有排班记录')
  const inst = batch.instances.find(i => i.id === row.instanceId)
  const leftBefore = inst.left
  executeEvent4(V4_EVENT_DEFS.find(d => d.id === 'ED-02'), { personId: 'E-427', instanceId: inst.id }, { batch, plans: st.plans, people: st.people, leaves: st.leaves, events: V4_EVENTS })
  assert.equal(inst.voidedQuota, undefined, '再分配路径不标可不用')
  assert.equal(inst.left, leftBefore + 1, '名额放回池子')
})

test('移动端 store：可领、申领、冲突拦截', async () => {
  const { claimableOf4, claim4, me4, setMe4 } = await import('../src/mock/scheduleV4Store.js')
  // 兴隆湖非全客户经理（何清）能领 PL-02 的先到先得名额；排定的早段之外，晚段有余量可领
  setMe4({ id: 'E-412' })
  const list = claimableOf4('E-412')
  assert.ok(list.length > 0, '何清应能看到 PL-02 可领名额')
  assert.ok(list.every(i => i.planId === 'PL-02' && i.form.name === '晚段'))
  const target = list[0]
  const r1 = claim4('E-412', target.id)
  assert.equal(r1.ok, true)
  assert.ok(r1.row.fromClaim && r1.row.way === '先到先得')
  // 领过的时段从可领列表消失，重复领同一个被拦
  assert.ok(!claimableOf4('E-412').some(i => i.id === target.id))
  assert.equal(claim4('E-412', target.id).ok, false)
  // 麓山计划是轮转直派 → 谷雨没有可领名额
  assert.equal(claimableOf4('E-427').length, 0)
  assert.equal(claim4('E-427', target.id).ok, false)
  void me4
})

test('移动端 store：人的时间线与补位通知', async () => {
  const { runEvent4, timelineOf4, noticesOf4, ackNotice4, setMe4 } = await import('../src/mock/scheduleV4Store.js')
  setMe4({ id: 'E-425' })
  const res = runEvent4('ED-01', { personId: 'E-425', date: '2026-11-18' })
  assert.equal(res.stopped, false)
  // 韩野的时间线：11-18 原早班是「已覆盖」，历史不丢
  const han = timelineOf4('E-425')
  const covered = han.filter(r => r.state === 'covered' && r.date === '2026-11-18')
  assert.equal(covered.length, 1)
  assert.equal(covered[0].formName, '早班')
  assert.ok(han.some(r => r.state === 'active'), '其他日期的班次仍在')
  // 谷雨：补位通知待确认 → 确认后 acked
  setMe4({ id: 'E-427' })
  const n = noticesOf4('E-427').find(x => x.kind === 'makeup' && !x.acked)
  assert.ok(n, '谷雨应有未确认的补位通知')
  ackNotice4(n.rowId)
  assert.ok(noticesOf4('E-427').find(x => x.id === n.id).acked)
})

/* ---- 2026-11-13 下午：班次后续处理规则（取消 / 转移等待期 / 手动加班次） ---- */

test('后续处理规则：挂在计划上，生成时快照到时段实例', () => {
  const b = runBatch4(fresh())
  const p2 = b.instances.find(i => i.planId === 'PL-02' && i.date === '2026-11-17')
  assert.equal(p2.aftercare.cancel.allow, true)
  assert.equal(p2.aftercare.cancel.value, 4)
  assert.equal(p2.aftercare.cancel.unit, 'h')
  assert.equal(p2.aftercare.cancel.mode, 'release')
  assert.equal(p2.aftercare.transfer.allow, true)
  assert.equal(p2.aftercare.transfer.value, 6)
  assert.equal(p2.aftercare.transfer.unit, 'h')
  assert.equal(p2.aftercare.transfer.samePositionOnly, true)
  const p4 = b.instances.find(i => i.planId === 'PL-04')
  // 设计口径（2026-11-13）：规则能力对必选班次同样开放，差异只在释放后的承接路径
  assert.equal(p4.aftercare.cancel.allow, true, '夜班轮值同样允许取消')
  assert.equal(p4.aftercare.transfer.allow, true)
  const p3 = b.instances.find(i => i.planId === 'PL-03')
  assert.equal(p3.aftercare.cancel.allow, true, '必选直派同样允许取消')
  assert.equal(p3.aftercare.transfer.allow, true)
})

test('取消班次：规则允许且未过截止 → 释放回池；规则不允许被拦', async () => {
  const store = await import('../src/mock/scheduleV4Store.js')
  const { generate4, cancelShift4, claim4, claimableOf4, v4 } = store
  generate4()
  // 何清（兴隆湖非全客户经理）先领一个晚段再取消：PL-02 允许取消、开班前 4h 截止
  // 选未来日期的班次（今天的班次此时已过开班前 4h 截止，会被拦——那是另一条用例）
  const target = claimableOf4('E-412').find(i => i.date > v4.now)
  assert.ok(target, '何清应有可领晚段')
  assert.equal(claim4('E-412', target.id).ok, true)
  const res = cancelShift4('E-412', target.id)
  assert.equal(res.ok, true, res.why)
  // 名额回池，不标「可不用」（再分配路径）
  assert.equal(target.voidedQuota, undefined)
  // 历史保留：取消记录进 history，原因写明本人取消
  const h = (v4.batch.history || []).find(r => r.personId === 'E-412' && r.instanceId === target.id)
  assert.ok(h, '取消的班次进历史')
  assert.match(h.releasedWhy, /本人取消/)
  // 规则关闭的计划：取消应被拦。规则快照在实例上（改计划只影响下一批），所以直接关实例快照
  const row = v4.batch.results.find(r => r.personId === 'E-427')
  assert.ok(row, '谷雨应有排班记录')
  const inst = v4.batch.instances.find(i => i.id === row.instanceId)
  inst.aftercare.cancel.allow = false
  const res2 = cancelShift4('E-427', row.instanceId)
  assert.equal(res2.ok, false)
  assert.match(res2.why, /不允许/)
})

test('取消截止：当天班次过了开班前 N 小时就拦住', async () => {
  const { generate4, cancelShift4, v4 } = await import('../src/mock/scheduleV4Store.js')
  generate4()
  // PL-01 允许取消（截止 12h）；11-13 早班 10:00 开班，演示时刻 15:00 已过截止
  const inst = v4.batch.instances.find(i => i.planId === 'PL-01' && i.date === '2026-11-13' && i.formId === 'SH-A')
  assert.ok(inst && inst.results.length, '11-13 早班应有人')
  const res = cancelShift4(inst.results[0].personId, inst.id)
  assert.equal(res.ok, false)
  assert.match(res.why, /截止/)
})

test('转移班次：发起进等待期 → 接受成立换人（判冲突按重叠口径）', async () => {
  const { generate4, proposeTransfer4, acceptTransfer4, pendingTransfersFor4, claim4, claimableOf4, v4 } = await import('../src/mock/scheduleV4Store.js')
  generate4()
  const target = claimableOf4('E-412')[0]
  claim4('E-412', target.id)
  // 转给苏禾（同空间同岗位非全）：等待期 6 小时
  const p = proposeTransfer4('E-412', target.id, 'E-413')
  assert.equal(p.ok, true, p.why)
  assert.equal(p.transfer.status, 'pending')
  assert.match(p.transfer.deadline, /2026-11-13/)
  assert.ok(pendingTransfersFor4('E-413').some(t => t.id === p.transfer.id), '苏禾侧能看到邀请')
  // 苏禾当天已有早段 12-16，与晚段 16-22 首尾相接 → 重叠口径判不冲突，可接
  const acc = acceptTransfer4(p.transfer.id)
  assert.equal(acc.ok, true, acc.why)
  assert.equal(p.transfer.status, 'accepted')
  // 班次换人：苏禾名下出现「转移承接」
  const got = v4.batch.results.find(r => r.instanceId === target.id && r.personId === 'E-413')
  assert.ok(got, '苏禾接手成功')
  assert.equal(got.way, '转移承接')
  // 何清的记录进历史，原因写明转给谁
  const h = (v4.batch.history || []).find(r => r.personId === 'E-412' && r.instanceId === target.id)
  assert.ok(h)
  assert.match(h.releasedWhy, /转移给/)
  // 转移中的班次不再出现在原人可领列表，原人名下也没有这条 active 记录了
  assert.ok(!v4.batch.results.some(r => r.instanceId === target.id && r.personId === 'E-412'))
})

test('转移拦截：接手人时段重叠 → 接受失败班次留原人', async () => {
  const { generate4, proposeTransfer4, acceptTransfer4, claim4, claimableOf4, v4 } = await import('../src/mock/scheduleV4Store.js')
  generate4()
  const target = claimableOf4('E-412')[0]
  claim4('E-412', target.id)
  // 单婉当天已被直派同一天的晚段（重叠）→ 接受时判冲突拦住
  const p = proposeTransfer4('E-412', target.id, 'E-414')
  assert.equal(p.ok, true)
  const acc = acceptTransfer4(p.transfer.id)
  assert.equal(acc.ok, false)
  assert.equal(p.transfer.status, 'failed')
  assert.match(acc.why, /重叠|冲突/)
  // 班次还在何清名下，转移标记已清
  const row = v4.batch.results.find(r => r.instanceId === target.id && r.personId === 'E-412')
  assert.ok(row, '失败后班次留原人')
  assert.equal(row.transferPending, false)
})

test('转移等待期：超时自动失效，班次留原人', async () => {
  const { generate4, proposeTransfer4, expireTransfers4, claim4, claimableOf4, v4 } = await import('../src/mock/scheduleV4Store.js')
  generate4()
  const target = claimableOf4('E-412')[0]
  claim4('E-412', target.id)
  const p = proposeTransfer4('E-412', target.id, 'E-413')
  assert.equal(p.ok, true)
  const expired = expireTransfers4(true) // 演示强制触发；线上按 deadline 自动判
  assert.ok(expired.some(t => t.id === p.transfer.id))
  assert.equal(p.transfer.status, 'expired')
  assert.ok(v4.batch.results.some(r => r.instanceId === target.id && r.personId === 'E-412'), '超时后班次留原人')
})

test('人事手动补充班次：批外时段即时发布，等同可领，默认允许取消', async () => {
  const { generate4, manualShift4, claimableOf4, claim4, v4 } = await import('../src/mock/scheduleV4Store.js')
  generate4()
  const r = manualShift4({ planId: 'PL-02', date: '2026-11-20', name: '临时晚段', start: '18:00', end: '22:00', quota: 1 })
  assert.equal(r.ok, true, r.why)
  assert.ok(v4.batch.instances.includes(r.inst))
  assert.equal(r.inst.quota.expr, '人工补 1 个')
  assert.equal(r.inst.published, true)
  assert.equal(r.inst.aftercare.cancel.allow, true, '手动班次默认允许取消')
  // 手动班次不受「先到先得计划」限制，出现在可申领里并可领
  const hit = claimableOf4('E-412').find(i => i.id === r.inst.id)
  assert.ok(hit, '手动班次应出现在可申领里')
  const c = claim4('E-412', r.inst.id)
  assert.equal(c.ok, true, c.why)
})

/* ---- 换班（2026-11-13 傍晚追加）：双向对价，不碰名额池 ---- */

test('换班规则：每个时段独立配置，兜底时段不允许换班', () => {
  const b = runBatch4(fresh())
  const p3 = b.instances.find(i => i.planId === 'PL-03')
  assert.equal(p3.aftercare.swap.allow, true, '全职直派班次可换班（全职调班主通道）')
  assert.equal(p3.aftercare.swap.value, 8)
  assert.equal(p3.aftercare.swap.samePositionOnly, true)
  const fb = b.instances.find(i => i.planId === 'PL-01' && i.formId === 'SH-F')
  assert.equal(fb.aftercare.swap.allow, false, '通班兜底不允许换班')
  const c = b.instances.find(i => i.planId === 'PL-01' && i.formId === 'SH-A')
  assert.equal(c.aftercare.swap.value, 4)
})

test('换班成立：两条占位原子对调，名额池不动，两边都留痕', async () => {
  const {
    generate4, swapCandidates4, proposeSwap4, acceptSwap4, noticesOf4, v4
  } = await import('../src/mock/scheduleV4Store.js')
  generate4()
  v4.transfers.length = 0
  const e16 = 'IN-PL-03-2026-11-16-SH-E'
  const g16 = 'IN-PL-03-2026-11-16-SH-G'
  // 候选只列真能换成的：严青 11-16 晚班
  const cands = swapCandidates4('E-425', e16)
  assert.ok(cands.some(c => c.person.id === 'E-426' && c.shifts.some(s => s.instanceId === g16)), '严青 11-16 晚班应可换')
  const before = v4.batch.instances.filter(i => [e16, g16].includes(i.id)).map(i => [i.filled, i.left])
  const p = proposeSwap4('E-425', e16, 'E-426', g16)
  assert.equal(p.ok, true, p.why)
  assert.equal(p.swap.kind, 'swap')
  assert.equal(p.swap.waitMin, 480, '等待期按发起方时段的规则（8 小时）')
  // 两边都进「待同意」，班次还在各自名下
  const rows = v4.batch.results.filter(r => [e16, g16].includes(r.instanceId))
  assert.equal(rows.filter(r => r.swapPending).length, 2)
  // 对方通知页收到换班邀请
  assert.ok(noticesOf4('E-426').some(n => n.kind === 'swap' && n.swapId === p.swap.id))
  const a = acceptSwap4(p.swap.id)
  assert.equal(a.ok, true, a.why)
  assert.equal(p.swap.status, 'accepted')
  // 对调结果：韩野拿晚班、严青拿早班，都标换班对调
  const han = v4.batch.results.find(r => r.personId === 'E-425' && r.instanceId === g16)
  const yan = v4.batch.results.find(r => r.personId === 'E-426' && r.instanceId === e16)
  assert.ok(han && yan, '两边都拿到了对方的班次')
  assert.equal(han.way, '换班对调')
  assert.equal(han.fromSwap, true)
  assert.equal(han.overtimeMin, 0)
  // 名额池不动：两个实例的 filled / left 与换班前一致
  const after = v4.batch.instances.filter(i => [e16, g16].includes(i.id)).map(i => [i.filled, i.left])
  assert.deepEqual(after, before)
  // 两条原记录进历史，写清换给谁
  const hist = v4.batch.history.filter(r => r.personId === 'E-425' && r.instanceId === e16)
  assert.equal(hist.length, 1)
  assert.match(hist[0].releasedWhy, /换班对调/)
  assert.ok(!v4.batch.results.some(r => r.personId === 'E-425' && r.instanceId === e16))
  // 换班不走补位：结果里没有多出来的人（总行数不变）
  assert.equal(v4.batch.results.filter(r => r.date === '2026-11-16' && r.spaceId === 'SP-02').length, 2)
})

test('换班拦截：换过来与自身其余班次重叠 → 两边都不动', async () => {
  const { generate4, proposeSwap4, acceptSwap4, v4 } = await import('../src/mock/scheduleV4Store.js')
  generate4()
  v4.transfers.length = 0
  // 韩野 11-16 早班 10-18 ↔ 严青 11-17 晚班 14-21：
  // 韩野 11-17 已有早班（重叠）、严青 11-16 已有晚班（重叠）→ 两个方向都过不去
  const e16 = 'IN-PL-03-2026-11-16-SH-E'
  const g17 = 'IN-PL-03-2026-11-17-SH-G'
  const p = proposeSwap4('E-425', e16, 'E-426', g17)
  assert.equal(p.ok, true, p.why)
  const a = acceptSwap4(p.swap.id)
  assert.equal(a.ok, false)
  assert.match(a.why, /重叠|冲突/)
  assert.equal(p.swap.status, 'failed')
  // 班次都留在原人名下，标记清掉
  assert.ok(v4.batch.results.some(r => r.personId === 'E-425' && r.instanceId === e16))
  assert.ok(v4.batch.results.some(r => r.personId === 'E-426' && r.instanceId === g17))
  assert.equal(v4.batch.results.filter(r => r.swapPending).length, 0)
})

test('换班等待期：超时两边都不动', async () => {
  const { generate4, proposeSwap4, expireTransfers4, v4 } = await import('../src/mock/scheduleV4Store.js')
  generate4()
  v4.transfers.length = 0
  const e16 = 'IN-PL-03-2026-11-16-SH-E'
  const g16 = 'IN-PL-03-2026-11-16-SH-G'
  const p = proposeSwap4('E-425', e16, 'E-426', g16)
  assert.equal(p.ok, true, p.why)
  const expired = expireTransfers4(true)
  assert.ok(expired.some(t => t.id === p.swap.id))
  assert.match(p.swap.why, /两边都不动/)
  assert.ok(v4.batch.results.some(r => r.personId === 'E-425' && r.instanceId === e16), '超时后原班次不动')
  assert.ok(v4.batch.results.some(r => r.personId === 'E-426' && r.instanceId === g16))
})
