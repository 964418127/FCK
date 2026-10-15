import { reactive, watch } from 'vue'
import { pushTaskPublication, pushSystemDispatch } from './notifications.js'

const STORAGE_KEY = 'fck_parttime_tasks_v1'
let idSequence = 0
export const createTaskId = prefix => {
  if (typeof globalThis.crypto?.randomUUID === 'function') return `${prefix}-${globalThis.crypto.randomUUID()}`
  return `${prefix}-${Date.now().toString(36)}-${(++idSequence).toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
export const currentEmployeeId = 100
export const stores = [
  { id: 'xl', code: '102188', name: '兴隆湖店', businessArea: '兴隆湖商圈', open: '10:00', close: '22:00' },
  { id: 'ls', code: '102333', name: '麓山店', businessArea: '麓山商圈', open: '10:00', close: '22:00' }
]
export const employees = [
  { id: 100, employeeNo: '100001', name: '杨小雪', areas: ['兴隆湖商圈', '麓山商圈'], intent: '长期合作' },
  { id: 101, employeeNo: '100002', name: '王芳', areas: ['兴隆湖商圈'], intent: '长期合作' },
  { id: 102, employeeNo: '100003', name: '李梅', areas: ['兴隆湖商圈'], intent: '时段工作' },
  { id: 103, employeeNo: '100004', name: '张军', areas: ['兴隆湖商圈'], intent: '短期合作' },
  { id: 104, employeeNo: '100005', name: '陈静', areas: ['麓山商圈'], intent: '长期合作' }
]
export const weekdayOptions = [
  { value: 6, label: '周六' }, { value: 0, label: '周日' }, { value: 1, label: '周一' },
  { value: 2, label: '周二' }, { value: 3, label: '周三' }, { value: 4, label: '周四' }, { value: 5, label: '周五' }
]
export const dateKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
export const addDays = (date, days) => {
  const result = new Date(`${date}T12:00:00`)
  result.setDate(result.getDate() + days)
  return dateKey(result)
}
export const timeMinutes = time => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}
export const durationLabel = task => `${(timeMinutes(task.endTime) - timeMinutes(task.startTime)) / 60}小时`
export const summarizeAttendance = task => {
  const parseTime = value => value ? new Date(value.replace(' ', 'T')).getTime() : NaN
  const arrival = parseTime(task.arriveTime)
  const departure = parseTime(task.leaveTime)
  const plannedStart = parseTime(`${task.date} ${task.startTime}:00`)
  const plannedEnd = parseTime(`${task.date} ${task.endTime}:00`)
  const arrivalStatus = Number.isFinite(arrival) ? (arrival > plannedStart ? '迟到到店' : '正常到店') : '未记录'
  const leaveStatus = Number.isFinite(departure) ? (departure < plannedEnd ? '提前离店' : '正常离店') : '未记录'
  const actualMinutes = Number.isFinite(arrival) && Number.isFinite(departure) && departure >= arrival ? Math.floor((departure - arrival) / 60000) : null
  return { arrivalStatus, leaveStatus, actualMinutes, abnormal: arrivalStatus === '迟到到店' || leaveStatus === '提前离店' }
}
export const latestPublicationDate = (now = new Date()) => {
  const date = new Date(now)
  date.setDate(date.getDate() - ((date.getDay() - 4 + 7) % 7))
  date.setHours(10, 0, 0, 0)
  if (date > now) date.setDate(date.getDate() - 7)
  return dateKey(date)
}
// 周四所在自然周的下一周周六，至再下一周周五。
export const publicationWindow = releaseDate => ({ start: addDays(releaseDate, 9), end: addDays(releaseDate, 15) })
const today = dateKey(new Date())
const latestRelease = latestPublicationDate()
const initialWindow = publicationWindow(latestRelease)
const makeDays = (startTime, endTime, quota) => Object.fromEntries(weekdayOptions.map(day => [day.value, [{ startTime, endTime, quota }]]))
const initialState = () => ({
  requirements: [
    { id: 'req-xl-long', storeId: 'xl', remark: '早间门店接待', startDate: addDays(today, -30), endDate: '', enabled: true, days: makeDays('10:00', '12:00', 1) },
    { id: 'req-ls-long', storeId: 'ls', remark: '晚间客流补位', startDate: addDays(today, -30), endDate: '', enabled: true, days: makeDays('18:00', '20:00', 1) },
    { id: 'req-xl-short', storeId: 'xl', remark: '活动期间增加接待人员', startDate: initialWindow.start, endDate: addDays(initialWindow.end, 7), enabled: true, days: makeDays('15:00', '17:00', 2) }
  ],
  publications: [], slots: [], temporaryNeeds: [],
  assignments: [
    { id: 'sample-1', storeId: 'xl', storeName: '兴隆湖店', date: today, startTime: '19:00', endTime: '21:00', status: '待到店', assigneeId: 100, source: '排班生成' },
    { id: 'sample-2', storeId: 'ls', storeName: '麓山店', date: addDays(today, 2), startTime: '15:00', endTime: '18:00', status: '待到店', assigneeId: 100, source: '排班生成' },
    { id: 'sample-3', storeId: 'xl', storeName: '兴隆湖店', date: addDays(today, -1), startTime: '10:00', endTime: '12:00', status: '已离店', assigneeId: 100, source: '排班生成', arriveTime: `${addDays(today, -1)} 10:03:00`, leaveTime: `${addDays(today, -1)} 12:01:00` },
    { id: 'sample-transfer-original', storeId: 'xl', storeName: '兴隆湖店', date: addDays(today, 3), startTime: '14:00', endTime: '18:00', status: '已转发', assigneeId: 100, source: '排班生成', forwardTo: '李梅（同商圈）' },
    { id: 'sample-transfer-target', sourceTaskId: 'sample-transfer-original', storeId: 'xl', storeName: '兴隆湖店', date: addDays(today, 3), startTime: '14:00', endTime: '18:00', status: '待到店', assigneeId: 102, source: '已生成任务被转移' },
    { id: 'sample-cancel-original', storeId: 'ls', storeName: '麓山店', date: addDays(today, 4), startTime: '18:00', endTime: '22:00', status: '已取消', cancelReason: '临时有事', assigneeId: 100, source: '排班生成' },
    { id: 'sample-cancel-replacement', taskId: 'sample-cancel-original', needId: 'sample-cancel-need', storeId: 'ls', storeName: '麓山店', date: addDays(today, 4), startTime: '18:00', endTime: '22:00', status: '待到店', assigneeId: 104, source: '取消后重派', sourceLabel: '取消后重派' },
    { id: 'sample-leave-1', taskId: 'sample-leave-need-1', storeId: 'xl', storeName: '兴隆湖店', date: addDays(today, -2), startTime: '10:00', endTime: '14:00', status: '已离店', assigneeId: 101, assigneeName: '王芳', source: '请假接班生成', sourceLabel: '请假接班生成', sourceName: '全职客户经理', arriveTime: `${addDays(today, -2)} 10:00:00`, leaveTime: `${addDays(today, -2)} 13:55:00` },
    { id: 'sample-leave-2', taskId: 'sample-leave-need-2', storeId: 'xl', storeName: '兴隆湖店', date: addDays(today, -2), startTime: '14:00', endTime: '18:00', status: '已到店', assigneeId: 102, assigneeName: '李梅', source: '请假接班生成', sourceLabel: '请假接班生成', sourceName: '全职客户经理', arriveTime: `${addDays(today, -2)} 14:08:00` },
    { id: 'sample-manual', storeId: 'ls', storeName: '麓山店', date: addDays(today, 6), startTime: '10:00', endTime: '12:00', status: '待到店', assigneeId: 104, source: '临时手动发布', sourceLabel: '临时手动发布', remark: '线下临时补人' },
    { id: 'sample-4', storeId: 'ls', storeName: '麓山店', date: addDays(today, -3), startTime: '15:00', endTime: '18:00', status: '已取消', cancelReason: '临时有事', assigneeId: 100, source: '排班生成' }
  ]
})
export const seedTrackingScenarios = state => {
  const sourceMap = { '周期固定生成': '排班生成', '取消后重新生成': '取消后重派', '全职请假自动生成': '请假接班生成' }
  for (const task of [...state.assignments, ...state.slots]) {
    if (sourceMap[task.source]) task.source = sourceMap[task.source]
    if (sourceMap[task.sourceLabel]) task.sourceLabel = sourceMap[task.sourceLabel]
  }
  if (state.demoTrackingSeedVersion === 1 || state.assignments.some(task => task.id === 'sample-transfer-target')) return state
  const seeded = initialState().assignments.filter(task => task.id.startsWith('sample-'))
  const existingIds = new Set(state.assignments.map(task => task.id))
  state.assignments.push(...seeded.filter(task => !existingIds.has(task.id)))
  state.demoTrackingSeedVersion = 1
  return state
}
export const normalizeTaskState = state => {
  for (const key of ['requirements', 'slots', 'assignments']) {
    for (const item of state[key]) {
      if (key === 'requirements' && item.remark === undefined) item.remark = item.type ? `${item.type}需求` : ''
      delete item.type
    }
  }
  return state
}
const load = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (parsed && ['requirements', 'publications', 'slots', 'temporaryNeeds', 'assignments'].every(key => Array.isArray(parsed[key]))) return seedTrackingScenarios(normalizeTaskState(parsed))
  } catch { /* 首次访问使用演示数据。 */ }
  return seedTrackingScenarios(initialState())
}
export const parttimeStore = reactive(load())
let applyingExternalState = false
watch(parttimeStore, state => {
  if (applyingExternalState) return
  try {
    const serialized = JSON.stringify(state)
    if (localStorage.getItem(STORAGE_KEY) !== serialized) localStorage.setItem(STORAGE_KEY, serialized)
  } catch { /* 浏览器存储不可用时保留本次会话数据。 */ }
}, { deep: true, flush: 'sync', immediate: true })
if (typeof window !== 'undefined') window.addEventListener('storage', event => {
  if (event.key !== STORAGE_KEY || !event.newValue) return
  try {
    const parsed = JSON.parse(event.newValue)
    if (['requirements', 'publications', 'slots', 'temporaryNeeds', 'assignments'].every(key => Array.isArray(parsed[key]))) {
      applyingExternalState = true
      Object.assign(parttimeStore, normalizeTaskState(parsed))
      applyingExternalState = false
    }
  } catch { /* 忽略无效的外部存储数据。 */ }
})
const activeAssignment = task => !['已取消', '已转发'].includes(task.status)
export const employeeTasks = employeeId => parttimeStore.assignments.filter(task => task.assigneeId === employeeId)
export const slotRemaining = slot => Math.max(0, slot.quota - parttimeStore.assignments.filter(task => task.slotId === slot.id && activeAssignment(task)).length - parttimeStore.temporaryNeeds.filter(need => need.slotId === slot.id && need.status === '待补人').length)
export const eligibilityError = (employeeId, task, excludeId) => {
  const employee = employees.find(person => person.id === employeeId)
  const store = stores.find(item => item.id === task.storeId)
  if (!employee || !store || !employee.areas.includes(store.businessArea)) return '该门店不在您的签约商圈内'
  const duration = timeMinutes(task.endTime) - timeMinutes(task.startTime)
  if (duration <= 0 || duration > 240) return '每项任务须在 4 小时以内'
  const existing = employeeTasks(employeeId).filter(item => item.id !== excludeId && activeAssignment(item))
  const sameDay = existing.filter(item => item.date === task.date)
  if (sameDay.some(item => !(item.endTime <= task.startTime || item.startTime >= task.endTime))) return '该时段与已有任务冲突'
  if (sameDay.some(item => item.storeId !== task.storeId && Math.max(timeMinutes(task.startTime) - timeMinutes(item.endTime), timeMinutes(item.startTime) - timeMinutes(task.endTime)) < 30)) return '跨门店任务需预留 30 分钟通勤时间'
  if (sameDay.reduce((sum, item) => sum + timeMinutes(item.endTime) - timeMinutes(item.startTime), duration) > 240) return '当日累计任务时长不能超过 4 小时'
  if (new Set([...existing.map(item => item.storeId), task.storeId]).size > 6) return '服务门店数量已达上限'
  return ''
}
export const validateRequirement = requirement => {
  const store = stores.find(item => item.id === requirement.storeId)
  if (!store || !requirement.startDate) return '请填写门店和生效日期'
  if (requirement.endDate && requirement.endDate < requirement.startDate) return '结束日期不能早于生效日期'
  if (!Object.values(requirement.days).some(rows => rows.length)) return '请至少设置一个任务时段'
  for (const rows of Object.values(requirement.days)) {
    const sorted = rows.filter(row => !row.voidedAt).sort((a, b) => a.startTime.localeCompare(b.startTime))
    for (let i = 0; i < sorted.length; i++) {
      const row = sorted[i]
      if (!row.startTime || !row.endTime || row.startTime < store.open || row.endTime > store.close || timeMinutes(row.endTime) <= timeMinutes(row.startTime)) return '任务时段须在门店营业时间内，结束时间晚于开始时间'
      if (timeMinutes(row.endTime) - timeMinutes(row.startTime) > 240) return '每个任务时段最多 4 小时'
      if (!Number.isInteger(row.quota) || row.quota < 1) return '名额须为大于 0 的整数'
      if (i && sorted[i - 1].endTime > row.startTime) return '同一天的配置时段不能重叠'
    }
  }
  for (const other of parttimeStore.requirements) {
    if (other.id === requirement.id || other.storeId !== requirement.storeId || !other.enabled || !requirement.enabled) continue
    if ((requirement.endDate && requirement.endDate < other.startDate) || (other.endDate && other.endDate < requirement.startDate)) continue
    for (const day of weekdayOptions) {
      if ((requirement.days[day.value] || []).some(row => !row.voidedAt && (other.days[day.value] || []).some(old => !old.voidedAt && row.startTime < old.endTime && row.endTime > old.startTime))) return '该门店已有相同日期范围内的重叠时段需求'
    }
  }
  return ''
}
export const saveRequirement = requirement => {
  const error = validateRequirement(requirement)
  if (error) return error
  const saved = JSON.parse(JSON.stringify(requirement))
  delete saved.type
  saved.id ||= createTaskId('req')
  const index = parttimeStore.requirements.findIndex(item => item.id === saved.id)
  if (index === -1) parttimeStore.requirements.push(saved)
  else parttimeStore.requirements.splice(index, 1, saved)
  return ''
}
export const deleteRequirementSlot = (requirementId, weekday, slotIndex) => {
  const index = parttimeStore.requirements.findIndex(item => item.id === requirementId)
  if (index === -1) return false
  const requirement = parttimeStore.requirements[index]
  const rows = requirement.days[weekday]
  if (!rows || !rows[slotIndex]) return false
  if (rows[slotIndex].voidedAt) return false
  rows[slotIndex].voidedAt = new Date().toISOString()
  return true
}
export const previewPublication = releaseDate => {
  const window = publicationWindow(releaseDate)
  const slots = []
  for (let offset = 0; offset < 7; offset++) {
    const date = addDays(window.start, offset)
    const weekday = new Date(`${date}T12:00:00`).getDay()
    for (const requirement of parttimeStore.requirements) {
      if (!requirement.enabled || date < requirement.startDate || (requirement.endDate && date > requirement.endDate)) continue
      const store = stores.find(item => item.id === requirement.storeId)
      for (const row of requirement.days[weekday] || []) {
        if (row.voidedAt) continue
        slots.push({
        ...row, id: `${requirement.id}-${date}-${row.startTime}`, requirementId: requirement.id,
        storeId: store.id, storeName: store.name, date, remark: requirement.remark || '', releaseDate, source: '排班生成'
        })
      }
    }
  }
  return slots
}
export const publishTasks = (releaseDate, mode = '手动发布') => {
  if (!releaseDate || new Date(`${releaseDate}T12:00:00`).getDay() !== 4) return '请选择周四作为发布日'
  if (parttimeStore.publications.some(item => item.releaseDate === releaseDate)) return '该周期已发布，不能重复发布'
  const slots = previewPublication(releaseDate)
  if (!slots.length) return '该周期没有生效的任务需求'
  parttimeStore.slots.push(...slots)
  const window = publicationWindow(releaseDate)
  parttimeStore.publications.push({ releaseDate, ...window, mode, slotCount: slots.length, quota: slots.reduce((sum, slot) => sum + slot.quota, 0), publishedAt: new Date().toISOString() })
  pushTaskPublication(window)
  return ''
}
export const syncScheduledPublication = (now = new Date()) => {
  const releaseDate = latestPublicationDate(now)
  if (!parttimeStore.publications.some(item => item.releaseDate === releaseDate)) publishTasks(releaseDate, '定时发布')
}
export const claimSlot = (slotId, employeeId = currentEmployeeId) => {
  const slot = parttimeStore.slots.find(item => item.id === slotId)
  if (!slot || slotRemaining(slot) === 0) return '该时段名额已满，请选择其他时段'
  if (slot.date < dateKey(new Date()) || new Date(`${slot.date}T${slot.startTime}:00`) <= new Date()) return '该时段已开始，无法选择'
  const error = eligibilityError(employeeId, slot)
  if (error) return error
  parttimeStore.assignments.push({ ...slot, id: createTaskId('task'), slotId, assigneeId: employeeId, status: '待到店', assignedAt: new Date().toISOString() })
  return ''
}
export const cancelAssignment = (taskId, reason) => {
  const task = parttimeStore.assignments.find(item => item.id === taskId)
  if (!task || task.status !== '待到店' || !reason) return null
  task.status = '已取消'
  task.cancelReason = reason
  task.cancelledAt = new Date().toISOString()
  const need = { id: `replacement-${task.id}`, taskId: task.id, slotId: task.slotId, storeId: task.storeId, storeName: task.storeName, date: task.date, startTime: task.startTime, endTime: task.endTime, source: '非全无法履约', sourceLabel: '取消后重派', sourceName: employees.find(person => person.id === task.assigneeId)?.name, excludedEmployeeId: task.assigneeId, status: '待补人' }
  parttimeStore.temporaryNeeds.push(need)
  return need
}
export const dispatchNeed = needId => {
  const need = parttimeStore.temporaryNeeds.find(item => item.id === needId)
  if (!need || need.status !== '待补人') return null
  const employee = employees.find(person => person.id !== need.excludedEmployeeId && !eligibilityError(person.id, need))
  if (!employee) return null
  const task = { ...need, id: createTaskId('assigned'), needId: need.id, source: need.sourceLabel || need.source, assigneeId: employee.id, assigneeName: employee.name, status: '待到店', assignedAt: new Date().toISOString() }
  parttimeStore.assignments.push(task)
  const assignments = needAssignments(need)
  need.status = assignments.length >= (need.quota || 1) ? '已补齐' : '待补人'
  need.assigneeId = employee.id
  need.assigneeName = assignments.map(task => task.assigneeName || employees.find(person => person.id === task.assigneeId)?.name).join('、')
  if (employee.id === currentEmployeeId) pushSystemDispatch({ storeName: task.storeName, taskId: task.id, source: need.sourceName })
  return task
}
export const needAssignments = need => parttimeStore.assignments.filter(task => task.needId === need.id || task.id === `assigned-${need.id}`)
export const dispatchPendingNeed = needId => {
  const tasks = []
  let task
  while ((task = dispatchNeed(needId))) tasks.push(task)
  return tasks
}
export const publishTemporaryTask = payload => {
  const store = stores.find(item => item.id === payload.storeId)
  if (!store || !payload.date || payload.date < dateKey(new Date()) || !payload.startTime || !payload.endTime || payload.startTime < store.open || payload.endTime > store.close || payload.endTime <= payload.startTime) return { error: '请填写门店、日期及营业时间内的任务时段' }
  if (timeMinutes(payload.endTime) - timeMinutes(payload.startTime) > 240) return { error: '每项临时任务最多 4 小时' }
  if (new Date(`${payload.date}T${payload.endTime}:00`) <= new Date()) return { error: '该时段已结束，无法发布任务' }
  if (!Number.isInteger(payload.quota) || payload.quota < 1) return { error: '需求人数须为大于 0 的整数' }
  if (parttimeStore.temporaryNeeds.some(need => need.source === '手动发布' && need.storeId === store.id && need.date === payload.date && need.startTime === payload.startTime && need.endTime === payload.endTime)) return { error: '该时段已发布临时任务，请核对已有发布记录' }
  const need = { id: createTaskId('temporary'), storeId: store.id, storeName: store.name, date: payload.date, startTime: payload.startTime, endTime: payload.endTime, quota: payload.quota, remark: payload.remark?.trim() || '', source: '手动发布', sourceLabel: '临时手动发布', publishedAt: new Date().toLocaleString('zh-CN', { hour12: false }), status: '待补人' }
  parttimeStore.temporaryNeeds.push(need)
  const tasks = dispatchPendingNeed(need.id)
  return { need, tasks, error: '' }
}
export const createLeaveNeeds = payload => {
  const store = stores.find(item => item.id === payload.storeId)
  if (!store || !payload.sourceName?.trim() || !payload.date || payload.date < dateKey(new Date()) || !payload.startTime || !payload.endTime || payload.startTime < store.open || payload.endTime > store.close || payload.endTime <= payload.startTime) return '请填写员工和日期，并设置营业时间内的缺岗时段'
  if (parttimeStore.temporaryNeeds.some(need => need.source === '全职请假' && need.sourceName === payload.sourceName.trim() && need.storeId === store.id && need.date === payload.date && need.startTime < payload.endTime && need.endTime > payload.startTime)) return '该员工的缺岗时段已生成补人需求'
  const formatMinutes = minutes => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
  for (let start = timeMinutes(payload.startTime); start < timeMinutes(payload.endTime); start += 240) {
    const need = { ...payload, sourceName: payload.sourceName.trim(), id: createTaskId('leave'), storeName: store.name, startTime: formatMinutes(start), endTime: formatMinutes(Math.min(start + 240, timeMinutes(payload.endTime))), source: '全职请假', sourceLabel: '请假接班生成', status: '待补人' }
    parttimeStore.temporaryNeeds.push(need)
    dispatchPendingNeed(need.id)
  }
  return ''
}
syncScheduledPublication()
