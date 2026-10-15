import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'

const storage = new Map()
globalThis.localStorage = { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) }
const domain = await import('../src/stores/parttimeTasks.js')
const notifications = await import('../src/stores/notifications.js')
const baseline = JSON.parse(JSON.stringify(domain.parttimeStore))
beforeEach(() => Object.assign(domain.parttimeStore, JSON.parse(JSON.stringify(baseline))))

test('Thursday release uses next natural week Saturday through following Friday', () => {
  assert.equal(domain.latestPublicationDate(new Date('2026-10-01T09:59:00')), '2026-09-24')
  assert.equal(domain.latestPublicationDate(new Date('2026-10-01T10:00:00')), '2026-10-01')
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

test('last quota cannot be claimed twice and occupied tasks reject conflicts', () => {
  const slot = domain.parttimeStore.slots.find(item => item.storeId === 'xl' && item.quota === 1)
  assert.equal(domain.claimSlot(slot.id), '')
  assert.equal(domain.slotRemaining(slot), 0)
  assert.match(domain.claimSlot(slot.id, 101), /名额已满/)
  assert.match(domain.eligibilityError(100, slot), /冲突/)
})

test('checks daily cumulative hours, commuting gap and signed business area', () => {
  const date = domain.addDays(domain.dateKey(new Date()), 20)
  domain.parttimeStore.assignments.push({ id: 'day-task', assigneeId: 100, storeId: 'xl', date, startTime: '10:00', endTime: '13:00', status: '待到店' })
  assert.match(domain.eligibilityError(100, { storeId: 'xl', date, startTime: '15:00', endTime: '17:00' }), /累计/)
  assert.match(domain.eligibilityError(100, { storeId: 'ls', date, startTime: '13:00', endTime: '14:00' }), /通勤/)
  assert.match(domain.eligibilityError(101, { storeId: 'ls', date, startTime: '10:00', endTime: '12:00' }), /商圈/)
  assert.equal(domain.eligibilityError(100, { storeId: 'ls', date, startTime: '13:30', endTime: '14:30' }), '')
})

test('cancellation reserves its slot for replacement, assigns another employee and retains original details', () => {
  const slot = domain.parttimeStore.slots.find(item => item.storeId === 'xl' && item.quota === 1)
  assert.equal(domain.claimSlot(slot.id), '')
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
  assert.equal(result.need.source, '手动发布')
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
    const slot = domain.parttimeStore.slots.find(item => item.storeId === 'xl' && item.quota === 1)
    assert.equal(domain.claimSlot(slot.id), '')
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
  assert.equal(domain.claimSlot(slot.id), '')
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
