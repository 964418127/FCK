import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'

const storage = new Map()
globalThis.localStorage = { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) }
const domain = await import('../src/stores/parttimeTasks.js')
const notifications = await import('../src/stores/notifications.js')
const baseline = JSON.parse(JSON.stringify(domain.parttimeStore))
beforeEach(() => Object.assign(domain.parttimeStore, JSON.parse(JSON.stringify(baseline))))
// 接单只发生在排班日当天：测试里把「现在」钉在那条时段当天早上，避免依赖跑测时间
const claimAt = slot => new Date(`${slot.date}T08:00:00`)
// 演示任务最远铺到「今天 +6 天」；挑 7 天外的时段接单，避开同日累计校验与演示任务撞车
const beyondDemo = slot => slot.date > domain.addDays(domain.dateKey(new Date()), 7)

test('Thursday release uses next natural week Saturday through following Friday', () => {
  assert.equal(domain.latestPublicationDate(new Date('2026-10-01T05:59:00')), '2026-09-24')
  assert.equal(domain.latestPublicationDate(new Date('2026-10-01T06:00:00')), '2026-10-01')
  assert.deepEqual(domain.publicationWindow('2026-10-01'), { start: '2026-10-10', end: '2026-10-16' })
})

test('publication creates seven days, respects short-term dates and is idempotent', () => {
  const release = domain.latestPublicationDate()
  const next = domain.addDays(release, 7)
  const window = domain.publicationWindow(next)
  domain.parttimeStore.requirements = [{ id: 'test', storeId: 'xl', remark: '活动期间接待', startDate: window.start, endDate: domain.addDays(window.start, 1), enabled: true, days: Object.fromEntries(domain.weekdayOptions.map(day => [day.value, [{ startTime: '10:00', endTime: '12:00', quota: 1 }]])) }]
  assert.equal(domain.previewPublication(next).length, 2)
  assert.equal(domain.publishTasks(next), '')
  const count = domain.parttimeStore.slots.length
  assert.match(domain.publishTasks(next), /已发布/)
  assert.equal(domain.parttimeStore.slots.length, count)
  assert.equal(notifications.notificationStore.list.filter(item => item.type === 'task_publication').length, 1)
})

test('manual publish filters stores and overwrites an already released batch', () => {
  const release = domain.latestPublicationDate()
  const next = domain.addDays(release, 7)
  const window = domain.publicationWindow(next)
  domain.parttimeStore.requirements = [
    { id: 'manual-test', storeId: 'xl', remark: '活动期间接待', startDate: window.start, endDate: domain.addDays(window.start, 1), enabled: true, days: Object.fromEntries(domain.weekdayOptions.map(day => [day.value, [{ startTime: '10:00', endTime: '12:00', quota: 1 }]])) },
    { id: 'manual-test-ls', storeId: 'ls', remark: '晚间补位', startDate: window.start, endDate: domain.addDays(window.start, 1), enabled: true, days: Object.fromEntries(domain.weekdayOptions.map(day => [day.value, [{ startTime: '18:00', endTime: '20:00', quota: 1 }]])) }
  ]
  assert.equal(domain.publishTasks(next, '定时发布'), '')
  const allCount = domain.parttimeStore.slots.filter(slot => slot.releaseDate === next).length
  // 手动发布同一批（覆盖）：只发麓山店 → 兴隆湖的旧时段被替换掉
  assert.equal(domain.publishTasks(next, '手动发布（覆盖）', { storeIds: ['ls'], overwrite: true }), '')
  const batch = domain.parttimeStore.slots.filter(slot => slot.releaseDate === next)
  assert.equal(batch.some(slot => slot.storeId === 'xl'), false)
  const record = domain.parttimeStore.publications.find(item => item.releaseDate === next)
  assert.equal(record.mode, '手动发布（覆盖）')
  assert.equal(record.slotCount, batch.length)
  assert.equal(record.slotCount < allCount, true)
  // 被承接的任务不回收：先领一个，再改成别的时段覆盖，已承接的保持原安排
  const slot = batch[0]
  assert.equal(domain.claimSlot(slot.id, 104, new Date(`${slot.date}T08:00:00`)), '')
  domain.parttimeStore.requirements[1].days = Object.fromEntries(domain.weekdayOptions.map(day => [day.value, [{ startTime: '15:00', endTime: '17:00', quota: 1 }]]))
  assert.equal(domain.publishTasks(next, '手动发布（覆盖）', { overwrite: true }), '')
  const kept = domain.parttimeStore.assignments.find(task => task.slotId === slot.id)
  assert.equal(kept && kept.status === '待到店', true)
  assert.equal(domain.parttimeStore.slots.some(item => item.releaseDate === next && item.startTime === '15:00'), true)
})

test('last quota cannot be claimed twice and occupied tasks reject conflicts', () => {
  const slot = domain.parttimeStore.slots.find(item => item.storeId === 'xl' && item.quota === 1 && beyondDemo(item))
  assert.equal(domain.claimSlot(slot.id, 100, claimAt(slot)), '')
  assert.equal(domain.slotRemaining(slot), 0)
  assert.match(domain.claimSlot(slot.id, 101), /名额已满/)
  assert.match(domain.eligibilityError(100, slot), /冲突/)
})

test('checks daily cumulative hours, commuting gap and signed store range', () => {
  const date = domain.addDays(domain.dateKey(new Date()), 20)
  domain.parttimeStore.assignments.push({ id: 'day-task', assigneeId: 100, storeId: 'xl', date, startTime: '10:00', endTime: '13:00', status: '待到店' })
  assert.match(domain.eligibilityError(100, { storeId: 'xl', date, startTime: '15:00', endTime: '17:00' }), /累计/)
  assert.match(domain.eligibilityError(100, { storeId: 'ls', date, startTime: '13:00', endTime: '14:00' }), /通勤/)
  assert.match(domain.eligibilityError(101, { storeId: 'ls', date, startTime: '10:00', endTime: '12:00' }), /门店/)
  assert.equal(domain.eligibilityError(100, { storeId: 'ls', date, startTime: '13:30', endTime: '14:30' }), '')
})

test('cancellation reserves its slot for replacement, assigns another employee and retains original details', () => {
  const slot = domain.parttimeStore.slots.find(item => item.storeId === 'xl' && item.quota === 1 && beyondDemo(item))
  assert.equal(domain.claimSlot(slot.id, 100, claimAt(slot)), '')
  const task = domain.employeeTasks(100).find(item => item.slotId === slot.id)
  const need = domain.cancelAssignment(task.id, '身体不适')
  assert.equal(task.status, '已取消')
  assert.equal(domain.slotRemaining(slot), 0)
  assert.equal(domain.cancelAssignment(task.id, '临时有事'), null)
  const replacement = domain.dispatchNeed(need.id)
  assert.notEqual(replacement.assigneeId, 100)
  assert.equal(need.status, '已补齐')
  for (const field of ['storeId', 'date', 'startTime', 'endTime']) assert.equal(replacement[field], task[field])
  assert.equal(domain.dispatchNeed(need.id), null)
  assert.equal(domain.slotRemaining(slot), 0)
})

test('fulltime leave splits into up to four-hour segments and rejects duplicate gaps', () => {
  const payload = { storeId: 'xl', sourceName: '全职客户经理', date: domain.addDays(domain.dateKey(new Date()), 1), startTime: '10:00', endTime: '22:00' }
  assert.equal(domain.createLeaveNeeds(payload), '')
  const needs = domain.parttimeStore.temporaryNeeds
  assert.equal(needs.length, 3)
  assert.deepEqual(needs.map(need => [need.startTime, need.endTime]), [['10:00', '14:00'], ['14:00', '18:00'], ['18:00', '22:00']])
  assert.match(domain.createLeaveNeeds(payload), /已生成/)
  const replacements = needs.flatMap(need => domain.needAssignments(need))
  assert.equal(new Set(replacements.map(task => task.assigneeId)).size, 3)
  assert(needs.every(need => need.status === '已补齐'))
  assert(needs.every(need => domain.dispatchNeed(need.id) === null))
})

test('manual temporary publication assigns requested people without a fulltime employee or shift', () => {
  const payload = { storeId: 'xl', date: domain.addDays(domain.dateKey(new Date()), 5), startTime: '10:00', endTime: '12:00', quota: 2, remark: '线下活动接待' }
  const slotsBefore = domain.parttimeStore.slots.length
  const result = domain.publishTemporaryTask(payload)
  assert.equal(result.error, '')
  assert.equal(result.need.source, '临时时段')
  assert.equal(result.need.quota, 2)
  assert.equal(result.tasks.length, 2)
  assert.equal(result.need.status, '已补齐')
  assert.equal(new Set(result.tasks.map(task => task.assigneeId)).size, 2)
  assert.equal(domain.parttimeStore.slots.length, slotsBefore)
  assert.equal(domain.needAssignments(result.need).length, 2)
  for (const task of result.tasks) {
    assert.equal(task.date, payload.date)
    assert.equal(task.startTime, payload.startTime)
    assert.equal(task.status, '待到店')
    assert.equal(task.remark, payload.remark)
  }
  assert.match(domain.publishTemporaryTask(payload).error, /已发布/)
})

test('manual temporary publication preserves unfilled demand and cannot overassign on retry', () => {
  const payload = { storeId: 'ls', date: domain.addDays(domain.dateKey(new Date()), 5), startTime: '10:00', endTime: '12:00', quota: 3 }
  const result = domain.publishTemporaryTask(payload)
  assert.equal(result.error, '')
  assert.equal(result.tasks.length, 2)
  assert.equal(result.need.status, '待补人')
  assert.equal(domain.dispatchPendingNeed(result.need.id).length, 0)
  assert.equal(domain.needAssignments(result.need).length, 2)
})

test('manual temporary publication validates headcount and the four-hour maximum', () => {
  const payload = { storeId: 'xl', date: domain.addDays(domain.dateKey(new Date()), 5), startTime: '10:00', endTime: '12:00', quota: 0 }
  assert.match(domain.publishTemporaryTask(payload).error, /需求人数/)
  payload.quota = 1
  payload.endTime = '16:00'
  assert.match(domain.publishTemporaryTask(payload).error, /最多 4 小时/)
  assert.equal(domain.parttimeStore.temporaryNeeds.length, 0)
})

test('temporary publication supports designated people and signs-earliest-first auto dispatch', () => {
  const date = domain.addDays(domain.dateKey(new Date()), 6)
  // 指定人员：只派点名的人，需求人数随名单带出；名单里混入非本店签约的人直接被拦
  const picked = domain.publishTemporaryTask({ storeId: 'xl', date, startTime: '13:00', endTime: '15:00', quota: 9, employeeIds: [101, 102] })
  assert.equal(picked.error, '')
  assert.equal(picked.need.quota, 2)
  assert.deepEqual(picked.tasks.map(task => task.assigneeId).sort(), [101, 102])
  assert.match(domain.publishTemporaryTask({ storeId: 'xl', date, startTime: '13:00', endTime: '15:00', quota: 1, employeeIds: [104] }).error, /指定人员/)
  // 自动模式：先按资格筛出可被派的人，再按签约时间先后（最早签约优先）取第一位 —— xl 最早签约的非全是杨小雪（2025-03-12）
  const auto = domain.publishTemporaryTask({ storeId: 'xl', date, startTime: '16:00', endTime: '18:00', quota: 1 })
  assert.equal(auto.error, '')
  assert.equal(auto.tasks.length, 1)
  assert.equal(auto.tasks[0].assigneeId, 100)
  // 点名的人已被占用时不擅自换人：时段交叉留待派发
  const blocked = domain.publishTemporaryTask({ storeId: 'xl', date, startTime: '17:00', endTime: '18:00', quota: 1, employeeIds: [100] })
  assert.equal(blocked.error, '')
  assert.equal(blocked.tasks.length, 0)
  assert.equal(blocked.need.status, '待补人')
})

test('requirements reject overlapping slots and more than four hours, while end date is optional', () => {
  const requirement = JSON.parse(JSON.stringify(domain.parttimeStore.requirements[0]))
  requirement.days[6] = [{ startTime: '10:00', endTime: '15:00', quota: 1 }]
  assert.match(domain.validateRequirement(requirement), /最多 4 小时/)
  requirement.days[6] = [{ startTime: '10:00', endTime: '12:00', quota: 1 }, { startTime: '11:00', endTime: '13:00', quota: 1 }]
  assert.match(domain.validateRequirement(requirement), /重叠/)
  requirement.days[6] = [{ startTime: '10:00', endTime: '12:00', quota: 1 }]
  requirement.endDate = ''
  assert.equal(domain.validateRequirement(requirement), '')
})

test('claiming tasks works when crypto.randomUUID is unavailable', () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto')
  Object.defineProperty(globalThis, 'crypto', { value: {}, configurable: true })
  try {
    const slot = domain.parttimeStore.slots.find(item => item.storeId === 'xl' && item.quota === 1 && beyondDemo(item))
    assert.equal(domain.claimSlot(slot.id, 100, claimAt(slot)), '')
    const ids = Array.from({ length: 100 }, () => domain.createTaskId('forward'))
    assert.equal(new Set(ids).size, 100)
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'crypto', descriptor)
    else delete globalThis.crypto
  }
})

test('voiding a weekday slot preserves history and published assignments while excluding future publications', () => {
  const requirement = domain.parttimeStore.requirements[0]
  const release = domain.latestPublicationDate()
  const slot = domain.parttimeStore.slots.find(item => item.requirementId === requirement.id && new Date(`${item.date}T12:00:00`).getDay() === 6)
  assert.ok(slot, '找不到可用的周六时段')
  // 清掉员工 100 在该日的演示任务，避免同日累计校验干扰（演示任务日期随「今天」滚动）
  domain.parttimeStore.assignments = domain.parttimeStore.assignments.filter(t => !(t.assigneeId === 100 && t.date === slot.date))
  assert.equal(domain.claimSlot(slot.id, 100, claimAt(slot)), '')
  const taskId = domain.employeeTasks(100).find(task => task.slotId === slot.id).id
  assert.equal(domain.deleteRequirementSlot(requirement.id, 6, 0), true)
  assert.ok(requirement.days[6][0].voidedAt)
  assert.equal(domain.deleteRequirementSlot(requirement.id, 6, 0), false)
  assert(!domain.previewPublication(domain.addDays(release, 7)).some(item => item.requirementId === requirement.id && new Date(`${item.date}T12:00:00`).getDay() === 6))
  assert(domain.parttimeStore.slots.some(item => item.id === slot.id))
  assert.equal(domain.employeeTasks(100).find(task => task.id === taskId).status, '待到店')
})

test('legacy classifications migrate to notes without losing dates or published tasks', () => {
  const state = JSON.parse(JSON.stringify(baseline))
  const requirement = state.requirements[0]
  delete requirement.remark
  requirement.type = '长期'
  state.slots[0].type = '短期'
  const beforeDate = requirement.startDate
  domain.normalizeTaskState(state)
  assert.equal(requirement.remark, '长期需求')
  assert.equal(requirement.startDate, beforeDate)
  assert.equal(requirement.type, undefined)
  assert.equal(state.slots[0].type, undefined)
  assert.equal(state.assignments.length, baseline.assignments.length)
})

test('legacy temporary source labels collapse into one name', () => {
  const state = JSON.parse(JSON.stringify(baseline))
  state.temporaryNeeds.push({ id: 'legacy-need', source: '手动发布', sourceLabel: '临时手动发布' })
  state.assignments.push({ id: 'legacy-task', source: '手动发布', sourceLabel: '临时手动发布' })
  domain.normalizeTaskState(state)
  assert.equal(state.temporaryNeeds.at(-1).source, '临时时段')
  assert.equal(state.temporaryNeeds.at(-1).sourceLabel, '临时时段')
  assert.equal(state.assignments.at(-1).source, '临时时段')
  assert.equal(state.assignments.at(-1).sourceLabel, '临时时段')
})

test('tracking derives actual attendance duration and anomalies from recorded seconds', () => {
  const task = { date: '2026-10-10', startTime: '10:00', endTime: '12:00', arriveTime: '2026-10-10 10:03:12', leaveTime: '2026-10-10 11:59:45' }
  const result = domain.summarizeAttendance(task)
  assert.equal(result.arrivalStatus, '迟到到店')
  assert.equal(result.leaveStatus, '提前离店')
  assert.equal(result.actualMinutes, 116)
  assert.equal(result.abnormal, true)
  task.arriveTime = '2026-10-10 09:59:00'
  task.leaveTime = '2026-10-10 12:01:00'
  assert.equal(domain.summarizeAttendance(task).abnormal, false)
  assert.equal(domain.summarizeAttendance(task).actualMinutes, 122)
})

test('tracking does not fabricate missing attendance times or negative durations', () => {
  const task = { date: '2026-10-10', startTime: '10:00', endTime: '12:00', status: '已离店' }
  const result = domain.summarizeAttendance(task)
  assert.equal(result.arrivalStatus, '未记录')
  assert.equal(result.leaveStatus, '未记录')
  assert.equal(result.actualMinutes, null)
  task.arriveTime = '2026-10-10 11:00:00'
  task.leaveTime = '2026-10-10 10:00:00'
  assert.equal(domain.summarizeAttendance(task).actualMinutes, null)
})

test('edits apply to future publications while published tasks keep their original quota', () => {
  const requirement = JSON.parse(JSON.stringify(domain.parttimeStore.requirements[0]))
  const originalQuota = domain.parttimeStore.slots.find(slot => slot.requirementId === requirement.id).quota
  for (const rows of Object.values(requirement.days)) rows[0].quota = 3
  assert.equal(domain.saveRequirement(requirement), '')
  assert.equal(domain.parttimeStore.slots.find(slot => slot.requirementId === requirement.id).quota, originalQuota)
  assert.equal(domain.previewPublication(domain.addDays(domain.latestPublicationDate(), 7)).find(slot => slot.requirementId === requirement.id).quota, 3)
})

/* ===== 分配策略 ===== */
const policies = await import('../src/stores/parttimePolicies.js')
const policyLadder = () => policies.initialPolicies().find(item => item.id === 'policy-ladder')
const slotAt = (overrides = {}) => ({ id: 'slot-x', storeId: 'xl', date: '2026-11-14', startTime: '15:00', endTime: '17:00', quota: 1, releaseDate: '2026-11-05', policyId: 'policy-ladder', ...overrides })
const publicationAt = '2026-11-05T10:00:00'
const people = key => domain.employees.find(person => person.name === key)

test('默认策略发布即可见：只有本店签约非全客户经理看得到', () => {
  const policy = policies.initialPolicies().find(item => item.id === policies.DEFAULT_POLICY_ID)
  const slot = slotAt({ policyId: policies.DEFAULT_POLICY_ID })
  assert.equal(policies.visibilityOf(slot, people('王芳'), policy, { publishedAt: publicationAt }, new Date('2026-11-06T09:00:00')).visible, true)
  assert.equal(policies.visibilityOf(slot, people('周敏'), policy, { publishedAt: publicationAt }, new Date('2026-11-06T09:00:00')).visible, false)
  // 门店不在签约范围：同为非全客户经理也看不到
  assert.equal(policies.visibilityOf(slot, people('陈静'), policy, { publishedAt: publicationAt }, new Date('2026-11-06T09:00:00')).visible, false)
})

test('档位累计开放：发布给第一档，排班日 09:00 加上第二档，11:00 三档都在', () => {
  const policy = policyLadder()
  const slot = slotAt()
  const pub = { publishedAt: publicationAt }
  const at = time => new Date(time)
  assert.equal(policies.visibilityOf(slot, people('王芳'), policy, pub, at('2026-11-06T09:00:00')).visible, true)
  assert.equal(policies.visibilityOf(slot, people('周敏'), policy, pub, at('2026-11-06T09:00:00')).visible, false)
  // 排班日 09:00 起非全推拿师也可见；先开的档不关，非全客户经理仍然可见
  assert.equal(policies.visibilityOf(slot, people('周敏'), policy, pub, at('2026-11-14T09:30:00')).visible, true)
  assert.equal(policies.visibilityOf(slot, people('王芳'), policy, pub, at('2026-11-14T09:30:00')).visible, true)
  assert.equal(policies.openStageCountOn(policy, slot, pub, at('2026-11-14T09:30:00')), 2)
  // 11:00 起全职推拿师也可见，前两档照旧
  assert.equal(policies.visibilityOf(slot, people('刘洋'), policy, pub, at('2026-11-14T11:30:00')).visible, true)
  assert.equal(policies.visibilityOf(slot, people('周敏'), policy, pub, at('2026-11-14T11:30:00')).visible, true)
  assert.equal(policies.visibilityOf(slot, people('王芳'), policy, pub, at('2026-11-14T11:30:00')).visible, true)
  assert.equal(policies.openStageCountOn(policy, slot, pub, at('2026-11-14T11:30:00')), 3)
  // 时段开始即全部关闭
  assert.equal(policies.visibilityOf(slot, people('刘洋'), policy, pub, at('2026-11-14T15:10:00')).visible, false)
  assert.equal(policies.openStageCountOn(policy, slot, pub, at('2026-11-14T15:10:00')), 0)
})

test('策略自洽校验：发布模式只能第一档、定时档必须越放越晚、人群不重复', () => {
  const publishLater = { name: 'x', stages: [{ audience: 'am-parttime', mode: 'day', at: '08:00' }, { audience: 'th-full', mode: 'publish', at: '10:00' }] }
  assert.match(policies.validatePolicy(publishLater), /第一档/)
  const backwards = { name: 'x', stages: [{ audience: 'am-parttime', mode: 'day', at: '11:00' }, { audience: 'th-full', mode: 'day', at: '09:00' }] }
  assert.match(policies.validatePolicy(backwards), /一档比一档晚/)
  const repeated = { name: 'x', stages: [{ audience: 'am-parttime', mode: 'day', at: '08:00' }, { audience: 'am-parttime', mode: 'day', at: '09:00' }] }
  assert.match(policies.validatePolicy(repeated), /重复/)
  assert.equal(policies.validatePolicy({ name: '正常', stages: [{ audience: 'am-parttime', mode: 'publish', at: '10:00' }] }), '')
})

test('定时档晚于时段开始会被拦：那一档永远接不到', () => {
  const policy = policyLadder()
  assert.equal(policies.validatePolicyForSlot(policy, { startTime: '15:00' }), '')
  assert.match(policies.validatePolicyForSlot(policy, { startTime: '10:00' }), /接不到/)
  // 存需求时同一套校验生效
  const requirement = { storeId: 'xl', remark: '', startDate: '2026-11-10', endDate: '', enabled: true, days: Object.fromEntries(domain.weekdayOptions.map(day => [day.value, []])) }
  requirement.days[6] = [{ startTime: '10:00', endTime: '12:00', quota: 1, policyId: 'policy-ladder' }]
  assert.match(domain.saveRequirement(requirement), /接不到/)
})

test('接单卡两道：先看排班日，再看策略档位', () => {
  const slot = slotAt({ id: 'slot-claim-test', policyId: policies.DEFAULT_POLICY_ID })
  domain.parttimeStore.slots.push(slot)
  try {
    // 排班日前一天：看得到也接不了
    assert.match(domain.claimSlot(slot.id, 101, new Date('2026-11-13T20:00:00')), /排班日当天/)
    // 排班日当天，推拿师不是这条策略的人群
    assert.match(domain.claimSlot(slot.id, 106, new Date('2026-11-14T09:00:00')), /未向您开放|没有开放/)
  } finally {
    domain.parttimeStore.slots.splice(domain.parttimeStore.slots.indexOf(slot), 1)
  }
})

test('提前下线补人：扣掉通勤后不足 2 小时不补，正好够才派', () => {
  const make = (leaveClock, endTime = '18:00') => ({
    id: `offline-${leaveClock}`, storeId: 'xl', storeName: '兴隆湖店', date: '2027-03-15',
    startTime: '14:00', endTime, status: '已离店', assigneeId: 101, assigneeName: '王芳',
    leaveTime: `2027-03-15 ${leaveClock}:00`, policyId: policies.DEFAULT_POLICY_ID
  })
  // 剩 2:29，扣 30 分钟通勤 = 1:59，不足 2 小时 → 不补人
  const short = make('15:31')
  assert.equal(domain.earlyOfflineBackfill(short).outcome, 'skipped')
  assert.equal(short.backfill.outcome, 'skipped')
  assert.equal(domain.parttimeStore.temporaryNeeds.filter(need => need.originTaskId === short.id).length, 0)
  // 剩 2:30，扣 30 分钟 = 正好 2:00 → 生成第 5 类来源的需求并派单
  const ok = make('15:30')
  const result = domain.earlyOfflineBackfill(ok)
  assert.equal(result.outcome, 'assigned')
  assert.notEqual(result.assigneeId, 101)
  assert.equal(result.fallbackUsed, false)
  const need = domain.parttimeStore.temporaryNeeds.find(item => item.originTaskId === ok.id)
  assert.equal(need.source, '提前下线补人')
  assert.equal(need.startTime, '15:30')
  assert.equal(need.endTime, '18:00')
  assert.equal(need.status, '已补齐')
  // 正常到点离店不产生补人记录
  assert.equal(domain.earlyOfflineBackfill(make('18:00')), null)
})

test('提前下线补人：本店没有可派的非全客户经理时，落最晚签约的全职推拿师', () => {
  const backup = domain.employees.map(person => ({ id: person.id, signedStoreIds: [...person.signedStoreIds] }))
  try {
    domain.employees.filter(person => person.position === 'am' && person.signedStoreIds.includes('xl'))
      .forEach(person => { person.signedStoreIds = person.signedStoreIds.filter(id => id !== 'xl') })
    const task = {
      id: 'offline-fallback', storeId: 'xl', storeName: '兴隆湖店', date: '2027-03-16',
      startTime: '14:00', endTime: '19:00', status: '已离店', assigneeId: 101, assigneeName: '王芳',
      leaveTime: '2027-03-16 15:00:00', policyId: policies.DEFAULT_POLICY_ID
    }
    const result = domain.earlyOfflineBackfill(task)
    assert.equal(result.outcome, 'assigned')
    assert.equal(result.fallbackUsed, true)
    // 兴隆湖店全职推拿师：刘洋 2023-05-10、何佳 2026-02-11 → 取最晚签约的何佳
    assert.equal(result.assigneeName, '何佳')
  } finally {
    backup.forEach(item => { domain.employees.find(person => person.id === item.id).signedStoreIds = item.signedStoreIds })
  }
})

test('同一天只有一条时间轴：跨店交叉不可选，首尾相接可以', () => {
  const base = domain.parttimeStore.assignments.length
  domain.parttimeStore.assignments.push({
    id: 'cross-day', storeId: 'xl', storeName: '兴隆湖店', date: '2027-03-20',
    startTime: '15:00', endTime: '17:00', status: '待到店', assigneeId: 100, source: '排班生成'
  })
  try {
    // 换一家店，时间交叉 → 一样不可选
    assert.equal(
      domain.eligibilityError(100, { storeId: 'ls', date: '2027-03-20', startTime: '16:00', endTime: '18:00' }),
      '该时段与已有任务冲突'
    )
    // 同店重叠同样不可选
    assert.equal(
      domain.eligibilityError(100, { storeId: 'xl', date: '2027-03-20', startTime: '16:30', endTime: '18:30' }),
      '该时段与已有任务冲突'
    )
    // 不重叠但跨店只隔 15 分钟 → 通勤不够
    assert.equal(
      domain.eligibilityError(100, { storeId: 'ls', date: '2027-03-20', startTime: '17:15', endTime: '19:15' }),
      '跨门店任务需预留 30 分钟通勤时间'
    )
    // 不重叠 + 间隔 1 小时 → 可选
    assert.equal(
      domain.eligibilityError(100, { storeId: 'ls', date: '2027-03-20', startTime: '18:00', endTime: '20:00' }),
      ''
    )
    // 同店首尾相接（15–17 接 17–19）不算交叉，也不用留通勤
    assert.equal(
      domain.eligibilityError(100, { storeId: 'xl', date: '2027-03-20', startTime: '17:00', endTime: '19:00' }),
      ''
    )
  } finally {
    domain.parttimeStore.assignments.length = base
  }
})
