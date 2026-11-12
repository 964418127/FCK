import { test } from 'node:test'
import assert from 'node:assert/strict'

const storage = new Map()
globalThis.localStorage = { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) }
const d = await import('../src/stores/parttimeTasks.js')

const NOW = new Date('2026-11-05T09:00:00')
const fresh = () => ({ assignments: [], requirements: [], publications: [], slots: [], temporaryNeeds: [] })
const planOf = (state, employeeId) => state.assignments.filter(task => task.id.startsWith(`plan-${employeeId}-`))

test('未来两周每天最多一班，休息日不排，且都在门店营业时间内', () => {
  const state = d.seedUpcomingAssignments(fresh(), NOW)
  const mine = planOf(state, 100)
  assert.equal(mine.length, 12, '14 天里留 2 天休息')
  assert.equal(new Set(mine.map(task => task.date)).size, mine.length, '同一天不重复排班')
  const rest = [d.addDays('2026-11-05', 5), d.addDays('2026-11-05', 12)]
  assert(rest.every(date => !mine.some(task => task.date === date)))
  for (const task of state.assignments) {
    assert(task.date > '2026-11-05' && task.date <= d.addDays('2026-11-05', 14), '只排未来 14 天')
    assert.equal(task.status, '待到店')
    assert(task.startTime < task.endTime)
    assert(d.timeMinutes(task.endTime) - d.timeMinutes(task.startTime) <= 240, '单班不超过 4 小时')
  }
})

test('其余客户经理也有未来任务，跟踪页不是一个人的排班', () => {
  const state = d.seedUpcomingAssignments(fresh(), NOW)
  for (const employeeId of [101, 102, 103, 104]) {
    assert(planOf(state, employeeId).length >= 2, `${employeeId} 至少两条`)
  }
})

test('重复加载不会再生成一遍', () => {
  const state = d.seedUpcomingAssignments(fresh(), NOW)
  const count = state.assignments.length
  d.seedUpcomingAssignments(state, NOW)
  assert.equal(state.assignments.length, count)
})

test('已经排了别的任务的那天不补演示班，避免同人同日撞时段', () => {
  const state = fresh()
  const date = d.addDays('2026-11-05', 2)
  state.assignments.push({ id: 'existing', assigneeId: 100, storeId: 'ls', date, startTime: '15:00', endTime: '18:00', status: '待到店' })
  const seeded = d.seedUpcomingAssignments(state, NOW)
  assert.equal(planOf(seeded, 100).filter(task => task.date === date).length, 0)
})

test('过期的演示班补成正常打卡，历史里不挂一排待到店', () => {
  const state = fresh()
  state.assignments.push({ id: 'plan-100-2026-11-03', assigneeId: 100, storeId: 'xl', date: '2026-11-03', startTime: '10:00', endTime: '12:00', status: '待到店' })
  d.seedUpcomingAssignments(state, NOW)
  const past = state.assignments.find(task => task.id === 'plan-100-2026-11-03')
  assert.equal(past.status, '已离店')
  assert.equal(past.arriveTime, '2026-11-03 10:02:00')
  assert.equal(past.leaveTime, '2026-11-03 12:01:00')
})
