import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'

const storage = new Map()
globalThis.localStorage = { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) }
const domain = await import('../src/stores/parttimeTasks.js')
const reminders = await import('../src/stores/checkinReminders.js')
const notifications = await import('../src/stores/notifications.js')
const baseline = JSON.parse(JSON.stringify(domain.parttimeStore))
beforeEach(() => {
  Object.assign(domain.parttimeStore, JSON.parse(JSON.stringify(baseline)))
  domain.setSessionEmployee(100)
  // 只留本用例自己造的任务，演示数据不参与断言
  domain.parttimeStore.assignments = []
  domain.parttimeStore.checkinReminders = []
  notifications.notificationStore.list = []
})

// 30 天后的一班，避开演示数据里的所有档期
const farDate = () => domain.addDays(domain.dateKey(new Date()), 30)
const seedTask = (overrides = {}) => {
  const task = {
    id: 'fwd-task', storeId: 'xl', storeName: '兴隆湖店', date: farDate(),
    startTime: '12:00', endTime: '14:00', status: '待到店', assigneeId: 100,
    source: '排班生成', slotId: 'fwd-slot', ...overrides
  }
  domain.parttimeStore.assignments.push(task)
  return task
}
const at = time => new Date(`${farDate()}T${time}:00`)
// 通知是 unshift 进列表的，最新一条在 0 位
const latestOf = type => notifications.notificationStore.list.find(item => item.type === type)

test('转发只是发起请求：任务仍在自己名下，对方接受前不产生新任务', () => {
  const task = seedTask()
  const before = domain.parttimeStore.assignments.length
  const result = domain.forwardTask(task.id, 102, 100, at('08:00'))
  assert.equal(result.error, '')
  assert.equal(task.status, '待到店')
  assert.equal(task.forwardRequest.status, '待接受')
  assert.equal(task.forwardRequest.toId, 102)
  assert.equal(domain.parttimeStore.assignments.length, before)
  // 30 分钟响应时限，到点自动退回
  assert.equal(domain.forwardRequestDeadline(task.forwardRequest, at('08:10')), 20)
  const request = latestOf('forward_request')
  assert.equal(request.employeeId, 102)
  assert.match(request.desc, /30 分钟内/)
})

test('接受转发：原任务转出，新任务落到接替人名下并进入待到店', () => {
  const task = seedTask()
  domain.forwardTask(task.id, 102, 100, at('08:00'))
  assert.equal(domain.acceptForward(task.id, 102, at('08:05')), '')
  assert.equal(task.status, '已转发')
  assert.match(task.forwardTo, /李梅/)
  const accepted = domain.parttimeStore.assignments.find(item => item.sourceTaskId === task.id)
  assert.equal(accepted.assigneeId, 102)
  assert.equal(accepted.status, '待到店')
  assert.equal(accepted.forwardRequest, undefined)
  assert.equal(accepted.forwardRejected, undefined)
  // 结果通知发给发起人，不是接替人
  const result = latestOf('forward_result')
  assert.equal(result.employeeId, 100)
  assert.match(result.title, /接受/)
})

test('拒绝转发：任务留在原承接人，且不再向同一个人重复发起', () => {
  const task = seedTask()
  domain.forwardTask(task.id, 102, 100, at('08:00'))
  assert.equal(domain.rejectForward(task.id, 102, at('08:03')), '')
  assert.equal(task.status, '待到店')
  assert.equal(task.forwardRequest.status, '已拒绝')
  assert.deepEqual(task.forwardRejected, [102])
  assert.match(latestOf('forward_result').title, /拒绝/)
  // 同一个人不能再转一次，换人可以
  assert.match(domain.forwardTask(task.id, 102, 100, at('08:04')).error, /已拒绝/)
  assert.equal(domain.forwardTask(task.id, 103, 100, at('08:04')).error, '')
})

test('超时未接受视为拒绝：转发自动撤回，任务仍是本人的待到店', () => {
  const task = seedTask()
  domain.forwardTask(task.id, 102, 100, at('08:00'))
  assert.equal(domain.expireForwardRequests(at('08:29')).length, 0)
  const expired = domain.expireForwardRequests(at('08:31'))
  assert.equal(expired.length, 1)
  assert.equal(task.status, '待到店')
  assert.equal(task.forwardRequest.status, '超时未接受')
  assert.deepEqual(task.forwardRejected, [102])
  assert.match(latestOf('forward_result').title, /超时/)
  // 过期后再点接受无效
  assert.match(domain.acceptForward(task.id, 102, at('08:32')), /失效/)
})

test('只有发起人能撤回；取消任务时把待接受的转发一并收回', () => {
  const task = seedTask()
  domain.forwardTask(task.id, 102, 100, at('08:00'))
  assert.match(domain.withdrawForwardRequest(task.id, 102), /不存在/)
  assert.equal(domain.withdrawForwardRequest(task.id, 100), '')
  assert.equal(task.forwardRequest.status, '已撤回')
  assert.equal(task.status, '待到店')
  // 撤回后可以再发起
  assert.equal(domain.forwardTask(task.id, 102, 100, at('08:02')).error, '')
  domain.cancelAssignment(task.id, '临时有事')
  assert.equal(task.forwardRequest.status, '已撤回')
})

test('转发门禁：不足 2 小时、已开始、非待到店都不允许', () => {
  const task = seedTask()
  assert.match(domain.forwardGateError(task, at('10:30')), /不足 2 小时/)
  assert.match(domain.forwardGateError(task, at('12:10')), /已开始/)
  assert.equal(domain.forwardGateError(task, at('09:00')), '')
  task.status = '已到店'
  assert.match(domain.forwardGateError(task, at('09:00')), /不可转发/)
  assert.match(domain.forwardTask(task.id, 102, 100, at('09:00')).error, /不可转发/)
})

test('打卡提醒固定三个节点：开始前 1 小时 / 30 分钟 / 5 分钟', () => {
  const task = seedTask()
  const plan = reminders.reminderPlan(task)
  assert.deepEqual(plan.map(item => item.offset), [60, 30, 5])
  assert.deepEqual(plan.map(item => item.clock), ['11:00', '11:30', '11:55'])
  // 卡片上只说相对时间，不写具体时:分
  assert.equal(reminders.reminderText(task), '1 小时 · 30 分钟 · 5 分钟')
})

test('打卡提醒到点才推、同一任务只补最近一次、推过不重复、已到店不再提醒', () => {
  const task = seedTask()
  // 11:10：第一条（11:00）该发了，后两条还没到
  let fired = reminders.syncCheckinReminders(at('11:10'))
  assert.deepEqual(fired.map(item => item.offset), [60])
  assert.equal(notifications.notificationStore.list.filter(item => item.type === 'checkin_reminder').length, 1)
  // 重复调用不重复推
  assert.equal(reminders.syncCheckinReminders(at('11:10')).length, 0)
  // 11:56：两条都过期，只补最近一条（5 分钟）
  fired = reminders.syncCheckinReminders(at('11:56'))
  assert.deepEqual(fired.map(item => item.offset), [5])
  // 已到店的任务不再提醒（同一条 5 分钟节点没发过，也不补）
  const arrived = seedTask({ id: 'fwd-task-2', arriveTime: `${farDate()} 11:30:00` })
  assert.equal(reminders.pendingCheckinReminders(at('11:56')).some(item => item.task.id === arrived.id), false)
  // 任务已开始就不再补发
  const started = seedTask({ id: 'fwd-task-3', startTime: '08:00', endTime: '09:00' })
  assert.equal(reminders.pendingCheckinReminders(at('11:56')).some(item => item.task.id === started.id), true)
  assert.equal(reminders.syncCheckinReminders(at('11:56')).some(item => item.task.id === started.id), false)
})

test('打卡提醒通知发给任务承接人本人', () => {
  const task = seedTask({ assigneeId: 101 })
  reminders.syncCheckinReminders(at('11:30'))
  const pushed = notifications.notificationStore.list.find(item => item.type === 'checkin_reminder' && item.taskId === task.id)
  assert.equal(pushed.employeeId, 101)
  assert.match(pushed.desc, /兴隆湖店/)
})
