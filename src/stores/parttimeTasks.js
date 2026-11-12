import { reactive, watch } from 'vue'
import { pushTaskPublication, pushSystemDispatch, pushForwardRequest, pushForwardResult, pushForwardWithdrawn } from './notifications.js'
import { DEFAULT_POLICY_ID, exceptionOf, exceptionThreshold, fallbackLabel, initialPolicies, validatePolicy, validatePolicyForSlot, visibilityOf } from './parttimePolicies.js'

const STORAGE_KEY = 'fck_parttime_tasks_v2'
let idSequence = 0
export const createTaskId = prefix => {
  if (typeof globalThis.crypto?.randomUUID === 'function') return `${prefix}-${globalThis.crypto.randomUUID()}`
  return `${prefix}-${Date.now().toString(36)}-${(++idSequence).toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
// 演示用当前操作人：转发是两个人的事，原型里要能换到对方视角看「接受 / 拒绝」
export const session = reactive({ employeeId: 100 })
export const setSessionEmployee = id => { session.employeeId = id }
export const currentEmployeeId = 100
export const employeeName = id => employees.find(person => person.id === id)?.name || ''
export const stores = [
  { id: 'xl', code: '102188', name: '兴隆湖店', businessArea: '兴隆湖商圈', open: '10:00', close: '22:00' },
  { id: 'ls', code: '102333', name: '麓山店', businessArea: '麓山商圈', open: '10:00', close: '22:00' }
]
// 人员与门店签约（非全日制合同签的是门店，不是商圈）；门店所属商圈是门店的业务归组属性
// position / employment 只用于判定「这条任务该不该出现在他面前」，不改变承接资格口径
// signedAt：与本店签约的日期。提前下线补人找不到非全客户经理时，兜底取「本店最晚签约的全职推拿师」
export const employees = [
  { id: 100, employeeNo: '100001', name: '杨小雪', signedStoreIds: ['xl', 'ls'], position: 'am', employment: 'parttime', intent: '长期合作', signedAt: '2025-03-12' },
  { id: 101, employeeNo: '100002', name: '王芳', signedStoreIds: ['xl'], position: 'am', employment: 'parttime', intent: '长期合作', signedAt: '2025-06-08' },
  { id: 102, employeeNo: '100003', name: '李梅', signedStoreIds: ['xl'], position: 'am', employment: 'parttime', intent: '时段工作', signedAt: '2026-01-20' },
  { id: 103, employeeNo: '100004', name: '张军', signedStoreIds: ['xl'], position: 'am', employment: 'parttime', intent: '短期合作', signedAt: '2026-09-15' },
  { id: 104, employeeNo: '100005', name: '陈静', signedStoreIds: ['ls'], position: 'am', employment: 'parttime', intent: '长期合作', signedAt: '2025-11-02' },
  // 门店技术岗：策略可以把某档时段放给他们，本模块不设计他们的承接端与考核口径
  { id: 105, employeeNo: '200001', name: '周敏', signedStoreIds: ['xl'], position: 'therapist', employment: 'parttime', intent: '时段工作', signedAt: '2024-08-01' },
  { id: 106, employeeNo: '200002', name: '刘洋', signedStoreIds: ['xl'], position: 'therapist', employment: 'full', intent: '门店技术岗', signedAt: '2023-05-10' },
  { id: 107, employeeNo: '200003', name: '邓佳', signedStoreIds: ['ls'], position: 'therapist', employment: 'parttime', intent: '时段工作', signedAt: '2025-02-18' },
  { id: 108, employeeNo: '200004', name: '孙磊', signedStoreIds: ['ls'], position: 'therapist', employment: 'full', intent: '门店技术岗', signedAt: '2022-09-06' },
  { id: 109, employeeNo: '200005', name: '何佳', signedStoreIds: ['xl'], position: 'therapist', employment: 'full', intent: '门店技术岗', signedAt: '2026-02-11' }
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
  date.setHours(6, 0, 0, 0)
  if (date > now) date.setDate(date.getDate() - 7)
  return dateKey(date)
}
// 周四所在自然周的下一周周六，至再下一周周五。
export const publicationWindow = releaseDate => ({ start: addDays(releaseDate, 9), end: addDays(releaseDate, 15) })
const today = dateKey(new Date())
const latestRelease = latestPublicationDate()
const initialWindow = publicationWindow(latestRelease)
const makeDays = (startTime, endTime, quota, policyId = DEFAULT_POLICY_ID) => Object.fromEntries(weekdayOptions.map(day => [day.value, [{ startTime, endTime, quota, policyId }]]))
const initialState = () => ({
  policies: initialPolicies(),
  requirements: [
    { id: 'req-xl-long', storeId: 'xl', remark: '早间门店接待', startDate: addDays(today, -30), endDate: '', enabled: true, days: makeDays('10:00', '12:00', 1) },
    { id: 'req-ls-long', storeId: 'ls', remark: '晚间客流补位', startDate: addDays(today, -30), endDate: '', enabled: true, days: makeDays('18:00', '20:00', 1, 'policy-ladder') },
    { id: 'req-xl-short', storeId: 'xl', remark: '活动期间增加接待人员', startDate: initialWindow.start, endDate: addDays(initialWindow.end, 7), enabled: true, days: makeDays('15:00', '17:00', 2, 'policy-ladder') }
  ],
  publications: [], slots: [], temporaryNeeds: [], checkinReminders: [],
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
    { id: 'sample-manual', storeId: 'ls', storeName: '麓山店', date: addDays(today, 6), startTime: '10:00', endTime: '12:00', status: '待到店', assigneeId: 104, source: '临时时段', sourceLabel: '临时时段', remark: '线下临时时段' },
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
const SOURCE_ALIASES = { 手动发布: '临时时段', 临时手动发布: '临时时段' }
export const normalizeTaskState = state => {
  // 老数据没有策略表：补内置策略，时段缺策略就落默认档，不让页面读空
  if (!Array.isArray(state.policies) || !state.policies.length) state.policies = initialPolicies()
  if (!Array.isArray(state.checkinReminders)) state.checkinReminders = []
  for (const key of ['requirements', 'slots', 'assignments']) {
    for (const item of state[key]) {
      if (key === 'requirements' && item.remark === undefined) item.remark = item.type ? `${item.type}需求` : ''
      delete item.type
    }
  }
  for (const requirement of state.requirements) {
    for (const rows of Object.values(requirement.days || {})) {
      for (const row of rows) row.policyId ||= DEFAULT_POLICY_ID
    }
  }
  for (const slot of state.slots) slot.policyId ||= DEFAULT_POLICY_ID
  // 「临时补人」时期的存量数据：来源统一收口到「临时时段」，避免跟踪页出现两种叫法。
  for (const item of [...state.temporaryNeeds, ...state.assignments]) {
    if (SOURCE_ALIASES[item.source]) item.source = SOURCE_ALIASES[item.source]
    if (SOURCE_ALIASES[item.sourceLabel]) item.sourceLabel = SOURCE_ALIASES[item.sourceLabel]
  }
  return state
}
// 演示数据里「今天这一班」是写死日期的，跨天后就变成昨天的任务，打卡页会落到「今日无任务」。
// 加载时把这条仍是待到店状态的演示任务顶到今天，保证演示里始终有今天的班可打。
const rollDemoShiftToToday = state => {
  const demo = state.assignments.find(task => task.id === 'sample-1')
  if (demo && demo.status === '待到店' && demo.date !== today) demo.date = today
  return state
}
// ====== 演示排班：未来两周 ======
// 固定写死的日期过一天就少一天，所以按「今天」滚动生成：今天之后 14 天，缺哪天补哪天。
// 已经存在的任务（含 sample-* 与其他演示任务）占着的那天不再补，避免同人同日撞时段。
const PLAN_DAYS = 14
const PLAN_ROSTER = [
  {
    employeeId: 100,
    cycle: true, // 逐日排，休息日跳过
    rest: [5, 12],
    shifts: [
      { storeId: 'xl', startTime: '15:00', endTime: '17:00' },
      { storeId: 'xl', startTime: '10:00', endTime: '12:00' },
      { storeId: 'ls', startTime: '19:00', endTime: '21:00' }
    ]
  },
  { employeeId: 101, offsets: [1, 4, 9], shifts: [{ storeId: 'xl', startTime: '13:00', endTime: '15:00' }] },
  { employeeId: 102, offsets: [2, 7, 12], shifts: [{ storeId: 'xl', startTime: '19:00', endTime: '21:00' }] },
  { employeeId: 103, offsets: [3, 9], shifts: [{ storeId: 'xl', startTime: '10:00', endTime: '12:00' }] },
  { employeeId: 104, offsets: [2, 6, 11], shifts: [{ storeId: 'ls', startTime: '10:00', endTime: '12:00' }] }
]
const clockAfter = (time, minutes) => {
  const total = timeMinutes(time) + minutes
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}:00`
}
const isPlanTask = task => typeof task.id === 'string' && task.id.startsWith('plan-')
export const seedUpcomingAssignments = (state, now = new Date()) => {
  const base = dateKey(now)
  const activeOn = (employeeId, date) => state.assignments.some(task =>
    task.assigneeId === employeeId && task.date === date && !isPlanTask(task) && !['已取消', '已转发'].includes(task.status)
  )
  // 过期的演示排班补成正常打卡，历史里不会挂着一排「待到店」
  for (const task of state.assignments) {
    if (!isPlanTask(task) || task.status !== '待到店' || task.date >= base) continue
    task.status = '已离店'
    task.arriveTime = `${task.date} ${clockAfter(task.startTime, 2)}`
    task.leaveTime = `${task.date} ${clockAfter(task.endTime, 1)}`
  }
  const ids = new Set(state.assignments.map(task => task.id))
  for (const person of PLAN_ROSTER) {
    const employee = employees.find(item => item.id === person.employeeId)
    if (!employee) continue
    const offsets = person.cycle
      ? Array.from({ length: PLAN_DAYS }, (_, index) => index + 1).filter(offset => !(person.rest || []).includes(offset))
      : person.offsets
    offsets.forEach((offset, index) => {
      const date = addDays(base, offset)
      const id = `plan-${person.employeeId}-${date}`
      if (ids.has(id) || activeOn(person.employeeId, date)) return
      const shift = person.shifts[(person.cycle ? offset : index) % person.shifts.length]
      const store = stores.find(item => item.id === shift.storeId)
      if (!store) return
      state.assignments.push({
        id,
        storeId: store.id,
        storeName: store.name,
        date,
        startTime: shift.startTime,
        endTime: shift.endTime,
        status: '待到店',
        assigneeId: employee.id,
        assigneeName: employee.name,
        source: '排班生成',
        sourceLabel: '排班生成',
        remark: '周期排班'
      })
      ids.add(id)
    })
  }
  return state
}
const load = () => {
  // 未来两周的演示排班只在浏览器里生成：Node 下单测要的是干净的种子状态，不能被演示任务占掉档期。
  const seed = state => {
    const seeded = rollDemoShiftToToday(seedTrackingScenarios(state))
    return typeof window === 'undefined' ? seeded : seedUpcomingAssignments(seeded)
  }
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (parsed && ['requirements', 'publications', 'slots', 'temporaryNeeds', 'assignments'].every(key => Array.isArray(parsed[key]))) return seed(normalizeTaskState(parsed))
  } catch { /* 首次访问使用演示数据。 */ }
  return seed(initialState())
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

/* ===== 分配策略 ===== */
export const policyById = id => parttimeStore.policies.find(item => item.id === id)
  || parttimeStore.policies.find(item => item.id === DEFAULT_POLICY_ID)
  || null
export const policyNameOf = id => policyById(id)?.name || '本店非全客户经理'
// 被多少个未作废时段引用：策略不能想删就删，否则时段会指向一条不存在的规则
export const policyUsage = id => parttimeStore.requirements.reduce((total, requirement) =>
  total + Object.values(requirement.days || {}).reduce((sum, rows) =>
    sum + rows.filter(row => !row.voidedAt && (row.policyId || DEFAULT_POLICY_ID) === id).length, 0), 0)
export const savePolicy = policy => {
  const error = validatePolicy(policy)
  if (error) return error
  const saved = JSON.parse(JSON.stringify(policy))
  saved.id ||= createTaskId('policy')
  saved.exception = exceptionOf(saved)
  // 已经在用这条策略的时段要重新校一遍：改完档位却让某一档晚于时段开始，等于白配
  for (const requirement of parttimeStore.requirements) {
    for (const [weekday, rows] of Object.entries(requirement.days || {})) {
      for (const row of rows) {
        if (row.voidedAt || (row.policyId || DEFAULT_POLICY_ID) !== saved.id) continue
        const slotError = validatePolicyForSlot(saved, row)
        if (!slotError) continue
        const store = stores.find(item => item.id === requirement.storeId)
        const day = weekdayOptions.find(item => String(item.value) === String(weekday))
        return `${store?.name || '门店'} ${day?.label || ''} ${row.startTime}-${row.endTime}：${slotError}`
      }
    }
  }
  const index = parttimeStore.policies.findIndex(item => item.id === saved.id)
  if (index === -1) parttimeStore.policies.push(saved)
  else parttimeStore.policies.splice(index, 1, { ...saved, builtin: parttimeStore.policies[index].builtin })
  return ''
}
export const deletePolicy = id => {
  const policy = parttimeStore.policies.find(item => item.id === id)
  if (!policy) return '策略不存在'
  if (policy.builtin) return '内置策略不能删除'
  const usage = policyUsage(id)
  if (usage) return `还有 ${usage} 个时段在用这条策略，先把它们改成别的策略`
  parttimeStore.policies.splice(parttimeStore.policies.indexOf(policy), 1)
  return ''
}
// 一条任务此刻对某个人是否可见：可见 = 出现在可选任务；能不能接是另一层（eligibilityError）
export const slotVisibility = (slot, employeeId, now = new Date()) => {
  const employee = employees.find(person => person.id === employeeId)
  const publication = parttimeStore.publications.find(item => item.releaseDate === slot.releaseDate) || null
  return visibilityOf(slot, employee, policyById(slot.policyId), publication, now)
}

export const eligibilityError = (employeeId, task, excludeId) => {
  const employee = employees.find(person => person.id === employeeId)
  const store = stores.find(item => item.id === task.storeId)
  if (!employee || !store || !employee.signedStoreIds.includes(task.storeId)) return '该门店不在您签约的门店范围内'
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
export const validateRequirement = requirement => {  const store = stores.find(item => item.id === requirement.storeId)
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
      const policy = policyById(row.policyId)
      if (!policy) return '任务时段的分配策略不存在'
      const policyError = validatePolicyForSlot(policy, row)
      if (policyError) return policyError
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
        policyId: row.policyId || DEFAULT_POLICY_ID, policyName: policyNameOf(row.policyId),
        storeId: store.id, storeName: store.name, date, remark: requirement.remark || '', releaseDate, source: '排班生成'
        })
      }
    }
  }
  return slots
}
/**
 * 发布一批任务。
 * - 定时发布：周四 06:00 全量执行，同一周期不重复生成。
 * - 手动发布（options.storeIds 选门店、options.overwrite 允许覆盖）：批次只能选未来两周内的周四，
 *   可只发全部门店中选中的几家；该批已发布时按当前时段需求<strong>覆盖</strong>——
 *   已被承接的任务保持原安排（承接人按已看到的任务做决定，不回收，与 6.1.5 同边界），
 *   未被承接的名额按新配置重新生成。
 */
export const publishTasks = (releaseDate, mode = '定时发布', options = {}) => {
  if (!releaseDate || new Date(`${releaseDate}T12:00:00`).getDay() !== 4) return '请选择周四作为发布日'
  let slots = previewPublication(releaseDate)
  if (options.storeIds?.length) slots = slots.filter(slot => options.storeIds.includes(slot.storeId))
  if (!slots.length) return '该周期没有生效的时段需求'
  const window = publicationWindow(releaseDate)
  const existing = parttimeStore.publications.find(item => item.releaseDate === releaseDate)
  if (existing && !options.overwrite) return '该周期已发布，不能重复发布'
  if (existing) {
    const keep = new Set(slots.map(slot => slot.id))
    const claimed = new Set(parttimeStore.assignments.filter(task => task.slotId && activeAssignment(task)).map(task => task.slotId))
    parttimeStore.slots = parttimeStore.slots.filter(slot => slot.releaseDate !== releaseDate || keep.has(slot.id) || claimed.has(slot.id))
    const present = new Set(parttimeStore.slots.filter(slot => slot.releaseDate === releaseDate).map(slot => slot.id))
    const added = slots.filter(slot => !present.has(slot.id))
    parttimeStore.slots.push(...added)
    const batch = parttimeStore.slots.filter(slot => slot.releaseDate === releaseDate)
    existing.mode = mode
    existing.slotCount = batch.length
    existing.quota = batch.reduce((sum, slot) => sum + slot.quota, 0)
    existing.publishedAt = new Date().toISOString()
    existing.overwrittenAt = existing.overwrittenAt || new Date().toISOString()
    pushTaskPublication(window)
    return ''
  }
  parttimeStore.slots.push(...slots)
  parttimeStore.publications.push({ releaseDate, ...window, mode, slotCount: slots.length, quota: slots.reduce((sum, slot) => sum + slot.quota, 0), publishedAt: new Date().toISOString() })
  pushTaskPublication(window)
  return ''
}
export const syncScheduledPublication = (now = new Date()) => {
  const releaseDate = latestPublicationDate(now)
  if (!parttimeStore.publications.some(item => item.releaseDate === releaseDate)) publishTasks(releaseDate, '定时发布')
}
// 接单只发生在排班日当天：提前只给看（排班表先公布），当天 00:00 起才开放接单，时段一开始就关闭
export const claimSlot = (slotId, employeeId = session.employeeId, now = new Date()) => {
  const slot = parttimeStore.slots.find(item => item.id === slotId)
  if (!slot || slotRemaining(slot) === 0) return '该时段名额已满，请选择其他时段'
  const today = dateKey(now)
  if (slot.date < today || new Date(`${slot.date}T${slot.startTime}:00`) <= now) return '该时段已开始，无法选择'
  if (slot.date > today) return '排班日当天 00:00 起才能接单'
  const visibility = slotVisibility(slot, employeeId, now)
  if (!visibility.visible) return visibility.reason
  const error = eligibilityError(employeeId, slot)
  if (error) return error
  parttimeStore.assignments.push({ ...slot, id: createTaskId('task'), slotId, assigneeId: employeeId, status: '待到店', assignedAt: new Date().toISOString() })
  return ''
}
export const cancelAssignment = (taskId, reason) => {
  const task = parttimeStore.assignments.find(item => item.id === taskId)
  if (!task || task.status !== '待到店' || !reason) return null
  // 转出中撤单：先把还没被接受的转发收回来，再关任务，避免对方还挂着一张已失效的卡片
  if (task.forwardRequest?.status === '待接受') withdrawForward(task, task.forwardRequest)
  task.status = '已取消'
  task.cancelReason = reason
  task.cancelledAt = new Date().toISOString()
  const need = { id: `replacement-${task.id}`, taskId: task.id, slotId: task.slotId, storeId: task.storeId, storeName: task.storeName, date: task.date, startTime: task.startTime, endTime: task.endTime, source: '非全无法履约', sourceLabel: '取消后重派', sourceName: employees.find(person => person.id === task.assigneeId)?.name, excludedEmployeeId: task.assigneeId, status: '待补人' }
  parttimeStore.temporaryNeeds.push(need)
  return need
}

/* ===== 转发：发起 → 待接受 → 接受 / 拒绝 / 超时 ===== */
// 接受时限：转发本身要求距开始 ≥ 2 小时，30 分钟足够对方决定，也给发起人留出另找人的余地
export const FORWARD_ACCEPT_MINUTES = 30
const minutesLeft = (deadline, now) => Math.max(0, Math.ceil((new Date(deadline) - now) / 60000))
// 只有「待到店」且距开始 ≥ 2 小时才允许转出；进 2 小时内只能取消，不再转手
export const forwardGateError = (task, now = new Date()) => {
  if (!task) return '任务不存在'
  if (task.status !== '待到店') return '该任务当前不可转发'
  const start = new Date(`${task.date}T${task.startTime}:00`)
  if (start <= now) return '该任务已开始，无法转发'
  if ((start - now) / 60000 < 120) return '距任务开始不足 2 小时，不允许转发'
  return ''
}
export const forwardRequestDeadline = (request, now = new Date()) => minutesLeft(request.deadline, now)

/** 发起转发：只写请求，不转移任务；对方接受后才落到他名下 */
export const forwardTask = (taskId, targetId, fromId = session.employeeId, now = new Date()) => {
  const task = parttimeStore.assignments.find(item => item.id === taskId)
  if (!task || task.assigneeId !== fromId) return { error: '任务不存在' }
  const gate = forwardGateError(task, now)
  if (gate) return { error: gate }
  const target = employees.find(person => person.id === targetId)
  if (!target) return { error: '请选择接替人员' }
  if (targetId === fromId) return { error: '不能转发给自己' }
  if ((task.forwardRejected || []).includes(targetId)) return { error: `${target.name}已拒绝过该任务，请换一位` }
  if (task.forwardRequest?.status === '待接受') return { error: `已向${task.forwardRequest.toName}发起转发，等待对方接受` }
  const ineligible = eligibilityError(targetId, task)
  if (ineligible) return { error: ineligible }
  const request = {
    toId: targetId, toName: target.name, fromId, fromName: employeeName(fromId),
    at: now.toISOString(),
    deadline: new Date(now.getTime() + FORWARD_ACCEPT_MINUTES * 60000).toISOString(),
    minutes: FORWARD_ACCEPT_MINUTES, status: '待接受'
  }
  task.forwardRequest = request
  pushForwardRequest({ task, request })
  return { error: '', task, request }
}

const withdrawForward = (task, request, note = '') => {
  request.status = note || '已撤回'
  request.closedAt = new Date().toISOString()
  pushForwardWithdrawn({ task, request })
}

/** 发起人撤回：任务照旧由本人执行，对方不再需要处理 */
export const withdrawForwardRequest = (taskId, byId = session.employeeId) => {
  const task = parttimeStore.assignments.find(item => item.id === taskId)
  if (!task || task.assigneeId !== byId) return '任务不存在'
  if (task.forwardRequest?.status !== '待接受') return '该任务没有待接受的转发'
  withdrawForward(task, task.forwardRequest)
  return ''
}

/** 被转发方接受：原任务转出，新任务落在他名下并进入待到店 */
export const acceptForward = (taskId, byId = session.employeeId, now = new Date()) => {
  const task = parttimeStore.assignments.find(item => item.id === taskId)
  const request = task?.forwardRequest
  if (!task || !request || request.status !== '待接受') return '该转发已失效'
  if (request.toId !== byId) return '这条转发不是给您的'
  if (task.status !== '待到店') return '原任务已变更，转发失效'
  if (new Date(request.deadline) < now) return expireForward(task, now)
  request.status = '已接受'
  request.closedAt = now.toISOString()
  task.status = '已转发'
  task.forwardTo = `${request.toName}（同商圈）`
  const accepted = {
    ...task,
    id: createTaskId('forward'), sourceTaskId: task.id, source: '已生成任务被转移', sourceLabel: '已生成任务被转移',
    status: '待到店', assigneeId: request.toId, assigneeName: request.toName,
    forwardTo: undefined, forwardRequest: undefined, forwardRejected: undefined,
    assignedAt: now.toISOString()
  }
  parttimeStore.assignments.push(accepted)
  pushForwardResult({ task, request, accepted: true })
  return ''
}

/** 被转发方拒绝：任务留在原发起人名下，且不再向同一个人重复发起 */
export const rejectForward = (taskId, byId = session.employeeId, now = new Date()) => {
  const task = parttimeStore.assignments.find(item => item.id === taskId)
  const request = task?.forwardRequest
  if (!task || !request || request.status !== '待接受') return '该转发已失效'
  if (request.toId !== byId) return '这条转发不是给您的'
  request.status = '已拒绝'
  request.closedAt = now.toISOString()
  task.forwardRejected = [...new Set([...(task.forwardRejected || []), byId])]
  pushForwardResult({ task, request, accepted: false })
  return ''
}

/** 超时未接受 = 自动拒绝：任务回到发起人名下，他还有时间另找人或者取消 */
const expireForward = (task, now = new Date()) => {
  const request = task.forwardRequest
  request.status = '超时未接受'
  request.closedAt = now.toISOString()
  task.forwardRejected = [...new Set([...(task.forwardRejected || []), request.toId])]
  pushForwardResult({ task, request, accepted: false, timeout: true })
  return '对方未在规定时间内接受，转发已撤回'
}
export const expireForwardRequests = (now = new Date()) => {
  const expired = []
  for (const task of parttimeStore.assignments) {
    const request = task.forwardRequest
    if (!request || request.status !== '待接受') continue
    if (task.status !== '待到店') { request.status = '已失效'; continue }
    if (new Date(request.deadline) >= now) continue
    expireForward(task, now)
    expired.push(task)
  }
  return expired
}
export const dispatchNeed = needId => {
  const need = parttimeStore.temporaryNeeds.find(item => item.id === needId)
  if (!need || need.status !== '待补人') return null
  // 派单只落在非全客户经理：推拿师没有承接端，策略只决定「看不看得到」，系统不替他接
  // 底层都是「可被派」（签约本店 + 时段不冲突 + 累计不超）；自动模式在其上按签约时间正序（最早签约优先）取第一位，点名了就只在名单里派
  const pickable = person => person.id !== need.excludedEmployeeId && !eligibilityError(person.id, need)
  const pool = need.employeeIds?.length
    ? need.employeeIds.map(id => employees.find(person => person.id === id)).filter(Boolean).filter(pickable)
    : employees.filter(person => person.position === 'am').filter(pickable)
      .sort((a, b) => String(a.signedAt || '').localeCompare(String(b.signedAt || '')))
  const employee = pool[0]
  if (!employee) return null
  const task = { ...need, id: createTaskId('assigned'), needId: need.id, source: need.sourceLabel || need.source, assigneeId: employee.id, assigneeName: employee.name, status: '待到店', assignedAt: new Date().toISOString() }
  parttimeStore.assignments.push(task)
  const assignments = needAssignments(need)
  need.status = assignments.length >= (need.quota || 1) ? '已补齐' : '待补人'
  need.assigneeId = employee.id
  need.assigneeName = assignments.map(task => task.assigneeName || employees.find(person => person.id === task.assigneeId)?.name).join('、')
  if (employee.id === session.employeeId) pushSystemDispatch({ storeName: task.storeName, taskId: task.id, source: need.sourceName })
  return task
}
export const needAssignments = need => parttimeStore.assignments.filter(task => task.needId === need.id || task.id === `assigned-${need.id}`)
export const dispatchPendingNeed = needId => {
  const tasks = []
  let task
  while ((task = dispatchNeed(needId))) tasks.push(task)
  return tasks
}

/* ===== 提前下线补人：离店早于计划结束，剩下那段再派一个人 ===== */
const spanText = minutes => {
  const value = Math.max(0, Math.round(minutes))
  if (value < 60) return `${value} 分钟`
  return `${Math.floor(value / 60)} 小时${value % 60 ? ` ${value % 60} 分` : ''}`
}
const leaveClockOf = task => {
  const stamp = String(task.leaveTime || '')
  return (stamp.includes(' ') ? stamp.split(' ')[1] : stamp).slice(0, 5)
}
const pickFallback = (key, task, slot) => {
  if (key === 'none') return null
  const employment = key === 'th-parttime' ? 'parttime' : 'full'
  return employees
    .filter(person => person.position === 'therapist' && person.employment === employment)
    .filter(person => person.id !== task.assigneeId && person.signedStoreIds.includes(task.storeId) && !eligibilityError(person.id, slot))
    .sort((a, b) => String(b.signedAt || '').localeCompare(String(a.signedAt || '')))[0] || null
}
/**
 * 判定口径写在策略里（6.1.3）：剩余时长扣掉通勤还剩多少「可用工时」，
 * 够门槛才补人，不够就留空档。补人顺位：本店签约非全客户经理 → 策略配的兜底人群。
 */
export const earlyOfflineBackfill = (task, now = new Date()) => {
  if (!task || task.status !== '已离店' || !task.leaveTime) return null
  if (task.backfill) return task.backfill
  const leaveClock = leaveClockOf(task)
  const remaining = timeMinutes(task.endTime) - timeMinutes(leaveClock)
  if (remaining <= 0) return null
  const policy = policyById(task.policyId)
  const rule = exceptionOf(policy)
  const workMinutes = Math.max(0, remaining - Number(rule.commuteMinutes || 0))
  const record = patch => {
    task.backfill = {
      at: now.toISOString(), leaveClock, remainingMinutes: remaining, workMinutes,
      thresholdMinutes: exceptionThreshold(policy), ...patch
    }
    return task.backfill
  }
  if (!rule.enabled) return record({ outcome: 'disabled', note: '该策略未开启异常补人，剩余时段留空档' })
  if (workMinutes < Number(rule.minWorkMinutes || 0)) {
    return record({ outcome: 'skipped', note: `扣掉 ${rule.commuteMinutes} 分钟通勤后可用 ${spanText(workMinutes)}，不足 ${spanText(rule.minWorkMinutes)}，不补人` })
  }
  const slot = { storeId: task.storeId, storeName: task.storeName, date: task.date, startTime: leaveClock, endTime: task.endTime }
  const need = {
    id: createTaskId('offline'), originTaskId: task.id, slotId: task.slotId,
    storeId: task.storeId, storeName: task.storeName, date: task.date,
    startTime: leaveClock, endTime: task.endTime, quota: 1,
    source: '提前下线补人', sourceLabel: '提前下线补人',
    sourceName: employees.find(person => person.id === task.assigneeId)?.name || '',
    excludedEmployeeId: task.assigneeId, status: '待补人',
    originRange: `${task.startTime}-${task.endTime}`
  }
  parttimeStore.temporaryNeeds.push(need)
  const first = employees.filter(person => person.position === 'am' && person.id !== task.assigneeId
    && person.signedStoreIds.includes(task.storeId) && !eligibilityError(person.id, slot))
    .sort((a, b) => String(a.signedAt || '').localeCompare(String(b.signedAt || '')))[0] || null
  const employee = first || pickFallback(rule.fallback, task, slot)
  if (!employee) return record({ outcome: 'pending', needId: need.id, note: '没有符合条件的承接人，已留在待补人' })
  const assignment = {
    ...need, id: createTaskId('assigned'), needId: need.id, taskId: need.id,
    assigneeId: employee.id, assigneeName: employee.name, status: '待到店',
    policyId: task.policyId, assignedAt: now.toISOString()
  }
  parttimeStore.assignments.push(assignment)
  need.status = '已补齐'
  need.assigneeId = employee.id
  need.assigneeName = employee.name
  if (employee.id === session.employeeId) pushSystemDispatch({ storeName: assignment.storeName, taskId: assignment.id, source: need.sourceName })
  const who = first ? `${employee.name}（本店非全客户经理）` : `${employee.name}（${fallbackLabel(rule.fallback)}）`
  return record({ outcome: 'assigned', needId: need.id, assigneeId: employee.id, assigneeName: employee.name, fallbackUsed: !first, note: `剩余 ${spanText(remaining)}，扣通勤后可用 ${spanText(workMinutes)}，已派给 ${who}` })
}
export const publishTemporaryTask = payload => {
  const store = stores.find(item => item.id === payload.storeId)
  if (!store || !payload.date || payload.date < dateKey(new Date()) || !payload.startTime || !payload.endTime || payload.startTime < store.open || payload.endTime > store.close || payload.endTime <= payload.startTime) return { error: '请填写门店、日期及营业时间内的任务时段' }
  if (timeMinutes(payload.endTime) - timeMinutes(payload.startTime) > 240) return { error: '每项临时时段最多 4 小时' }
  if (new Date(`${payload.date}T${payload.endTime}:00`) <= new Date()) return { error: '该时段已结束，无法发布任务' }
  if (!Number.isInteger(payload.quota) || payload.quota < 1) return { error: '需求人数须为大于 0 的整数' }
  // 派单范围：不点名 = 本店签约非全客户经理由系统按顺序派；点了名就只派给这几个人
  const employeeIds = [...new Set((payload.employeeIds || []).filter(id => id !== null && id !== undefined && id !== ''))]
  if (employeeIds.length) {
    const outsider = employeeIds.find(id => {
      const person = employees.find(item => item.id === id)
      return !person || person.position !== 'am' || !person.signedStoreIds.includes(store.id)
    })
    if (outsider !== undefined) return { error: '指定人员只能是与该门店签约的非全客户经理' }
  }
  const quota = employeeIds.length || payload.quota
  if (parttimeStore.temporaryNeeds.some(need => need.source === '临时时段' && need.storeId === store.id && need.date === payload.date && need.startTime === payload.startTime && need.endTime === payload.endTime)) return { error: '该时段已发布临时时段，请核对已有记录' }
  const need = { id: createTaskId('temporary'), storeId: store.id, storeName: store.name, date: payload.date, startTime: payload.startTime, endTime: payload.endTime, quota, employeeIds, remark: payload.remark?.trim() || '', source: '临时时段', sourceLabel: '临时时段', publishedAt: new Date().toLocaleString('zh-CN', { hour12: false }), status: '待补人' }
  parttimeStore.temporaryNeeds.push(need)
  const tasks = dispatchPendingNeed(need.id)
  return { need, tasks, error: '' }
}
export const createLeaveNeeds = payload => {
  const store = stores.find(item => item.id === payload.storeId)
  if (!store || !payload.sourceName?.trim() || !payload.date || payload.date < dateKey(new Date()) || !payload.startTime || !payload.endTime || payload.startTime < store.open || payload.endTime > store.close || payload.endTime <= payload.startTime) return '请填写员工和日期，并设置营业时间内的缺岗时段'
  if (parttimeStore.temporaryNeeds.some(need => need.source === '全职请假' && need.sourceName === payload.sourceName.trim() && need.storeId === store.id && need.date === payload.date && need.startTime < payload.endTime && need.endTime > payload.startTime)) return '该员工的缺岗时段已生成接班时段'
  const formatMinutes = minutes => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
  for (let start = timeMinutes(payload.startTime); start < timeMinutes(payload.endTime); start += 240) {
    const need = { ...payload, sourceName: payload.sourceName.trim(), id: createTaskId('leave'), storeName: store.name, startTime: formatMinutes(start), endTime: formatMinutes(Math.min(start + 240, timeMinutes(payload.endTime))), source: '全职请假', sourceLabel: '请假接班生成', status: '待补人' }
    parttimeStore.temporaryNeeds.push(need)
    dispatchPendingNeed(need.id)
  }
  return ''
}
syncScheduledPublication()
// 演示数据：本周这一批是上周四发布的，还在生效期内 —— 没有它，「排班日当天才能接单」演示不出可接的班次。
// 只补浏览器侧，Node 单测要的是干净的种子状态。
const seedRunningPublication = () => {
  if (typeof window === 'undefined') return
  const todayKey = dateKey(new Date())
  for (let weeksBack = 1; weeksBack <= 3; weeksBack++) {
    const releaseDate = addDays(latestPublicationDate(), -7 * weeksBack)
    if (parttimeStore.publications.some(item => item.releaseDate === releaseDate)) return
    const window = publicationWindow(releaseDate)
    if (todayKey < window.start || todayKey > window.end) continue
    const slots = previewPublication(releaseDate).filter(slot => slot.date >= todayKey)
    if (!slots.length) return
    parttimeStore.slots.push(...slots)
    parttimeStore.publications.push({ releaseDate, ...window, mode: '定时发布', slotCount: slots.length, quota: slots.reduce((sum, slot) => sum + slot.quota, 0), publishedAt: `${releaseDate}T06:00:00` })
    return
  }
}
const seedTodayClaimable = () => {
  if (typeof window === 'undefined') return
  const now = new Date()
  const todayKey = dateKey(now)
  const batch = parttimeStore.publications.find(item => item.start <= todayKey && item.end >= todayKey)
  if (!batch) return
  const minutes = now.getHours() * 60 + now.getMinutes()
  const alreadyClaimable = parttimeStore.slots.some(slot => slot.date === todayKey && slot.storeId === 'xl' && timeMinutes(slot.startTime) > minutes)
  if (!alreadyClaimable) {
    parttimeStore.slots.push({ id: `demo-today-${todayKey}`, requirementId: 'demo-today', storeId: 'xl', storeName: '兴隆湖店', date: todayKey, startTime: '15:00', endTime: '17:00', quota: 2, remark: '当日下午补位', releaseDate: batch.releaseDate, source: '排班生成', policyId: DEFAULT_POLICY_ID })
  }
  // 同日另一家店的相邻时段：先选了兴隆湖 15–17，这条 16–18 就交叉了 —— 用来演示「同一天只有一条时间轴」
  if (parttimeStore.slots.some(slot => slot.id === `demo-today-cross-${todayKey}`)) return
  parttimeStore.slots.push({ id: `demo-today-cross-${todayKey}`, requirementId: 'demo-today-cross', storeId: 'ls', storeName: '麓山店', date: todayKey, startTime: '16:00', endTime: '18:00', quota: 1, remark: '跨店相邻时段', releaseDate: batch.releaseDate, source: '排班生成', policyId: DEFAULT_POLICY_ID })
}
// 未来几周也先公布：排班表提前给出，「选择任务周期」里能翻到后面几周，而不是只有本周一批。
const seedUpcomingPublications = () => {
  if (typeof window === 'undefined') return
  const base = latestPublicationDate()
  // 上一批（本周正在生效）、本周这批、往后三批：下拉里一共五周，既有刚公布的，也有下周才到排班日的
  for (const weeksAhead of [-1, 0, 1, 2, 3]) {
    const releaseDate = addDays(base, 7 * weeksAhead)
    if (parttimeStore.publications.some(item => item.releaseDate === releaseDate)) continue
    const slots = previewPublication(releaseDate)
    if (!slots.length) continue
    const window = publicationWindow(releaseDate)
    parttimeStore.slots.push(...slots)
    parttimeStore.publications.push({ releaseDate, ...window, mode: '定时发布', slotCount: slots.length, quota: slots.reduce((sum, slot) => sum + slot.quota, 0), publishedAt: `${releaseDate}T06:00:00` })
  }
}
seedRunningPublication()
seedTodayClaimable()
seedUpcomingPublications()
