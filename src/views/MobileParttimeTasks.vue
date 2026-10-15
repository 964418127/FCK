<template>
  <div class="mobile-parttime-tasks">
    <div class="page-header">
      <el-icon @click="goBack" class="back-icon"><ArrowLeft /></el-icon>
      <h1>非全任务列表</h1>
    </div>

    <div class="content-container">
      <div class="task-view-tabs">
        <button :class="{ active: taskView === 'mine' }" @click="taskView = 'mine'">我的任务</button>
        <button :class="{ active: taskView === 'available' }" @click="taskView = 'available'">可选任务</button>
      </div>
      <section v-if="taskView === 'available'" class="available-section">
        <div class="release-banner">
          <el-icon><Clock /></el-icon>
          <div><strong>每周四上午 10:00 发布</strong><p>下周六至下下周五 · 名额有限，先到先得</p></div>
        </div>
        <div class="available-filters">
          <el-select v-model="selectedRelease" placeholder="选择任务周期" style="width: 100%"><el-option v-for="batch in availableBatches" :key="batch.releaseDate" :label="`${batch.start} 至 ${batch.end}`" :value="batch.releaseDate" /></el-select>
          <el-select v-model="selectedStoreFilter" clearable placeholder="全部门店" style="width: 100%"><el-option v-for="store in stores" :key="store.id" :label="store.name" :value="store.id" /></el-select>
        </div>
        <div class="available-date-tabs" role="tablist" aria-label="任务日期">
          <button v-for="day in availableDates" :key="day.date" type="button" role="tab" :aria-selected="selectedTaskDate === day.date" :disabled="day.date < dateKey(currentTime)" :class="{ active: selectedTaskDate === day.date }" @click="selectedTaskDate = day.date">
            <span>{{ day.weekday }}</span><strong>{{ day.date.slice(5).replace('-', '/') }}</strong><small>{{ day.slotCount }}时段</small>
          </button>
        </div>
        <div class="available-count">{{ availableSlots.length }} 个任务时段</div>
        <div v-for="slot in availableSlots" :key="slot.id" :class="['task-card', 'available-card', { 'is-selected': isSlotSelected(slot) }]">
          <div class="task-header"><span class="available-date">{{ slot.date }} {{ weekdayLabel(slot.date) }}</span><span v-if="isSlotSelected(slot)" class="selected-slot-label"><el-icon><Check /></el-icon>我已选择</span></div>
          <div class="task-store"><el-icon><Location /></el-icon><span>{{ slot.storeName }}</span></div>
          <div class="task-time"><el-icon><Clock /></el-icon><span>{{ slot.startTime }} - {{ slot.endTime }} · {{ durationLabel(slot) }}</span></div>
          <div class="available-action"><span :class="{ full: slotRemaining(slot) === 0 }">{{ slotRemaining(slot) ? `剩余 ${slotRemaining(slot)} / ${slot.quota} 个名额` : '名额已满' }}</span><el-button :class="{ 'selected-slot-button': isSlotSelected(slot) }" type="primary" :disabled="isSlotSelected(slot) || !!slotBlockReason(slot)" @click="chooseSlot(slot)">{{ isSlotSelected(slot) ? '已选择' : slotBlockReason(slot) ? '不可选择' : '选择任务' }}</el-button></div>
          <p v-if="slotBlockReason(slot)" class="slot-reason">{{ slotBlockReason(slot) }}</p>
        </div>
        <el-empty v-if="!availableSlots.length" description="暂无可选任务" :image-size="70" />
      </section>
      <template v-else>
      <!-- 概览：今日任务进度 -->
      <div class="overview-card">
        <div class="overview-row">
          <div class="overview-item">
            <div class="overview-label">今日任务</div>
            <div class="overview-value">{{ todayTotal }} 个</div>
          </div>
          <div class="overview-item">
            <div class="overview-label">待到店</div>
            <div class="overview-value pending">{{ todayPending }}</div>
          </div>
          <div class="overview-item">
            <div class="overview-label">已完成</div>
            <div class="overview-value done">{{ todayDone }}</div>
          </div>
        </div>
      </div>

      <!-- 月历 -->
      <div class="calendar-section">
        <div class="month-selector">
          <el-icon @click="prevMonth"><ArrowLeft /></el-icon>
          <span class="month-text">{{ currentYear }}年{{ currentMonth }}月</span>
          <el-icon @click="nextMonth"><ArrowRight /></el-icon>
        </div>

        <div class="calendar-grid">
          <div class="calendar-header">
            <div v-for="day in weekDays" :key="day" class="calendar-day-header">{{ day }}</div>
          </div>
          <div class="calendar-body">
            <div
              v-for="(date, index) in calendarDates"
              :key="index"
              :class="['calendar-day', {
                'today': isToday(date),
                'has-task': date.taskCount > 0
              }]"
              @click="onCalendarDayClick(date)"
            >
              <div class="day-number">{{ date.day }}</div>
              <div v-if="date.taskCount > 0" class="task-dot-row">
                <span
                  v-for="i in Math.min(date.taskCount, 3)"
                  :key="i"
                  class="task-dot"
                ></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 筛选 pills -->
      <div class="filter-bar">
        <div
          v-for="f in filters"
          :key="f.id"
          :class="['filter-pill', { active: activeFilter === f.id }]"
          @click="activeFilter = f.id"
        >
          {{ f.name }}
        </div>
      </div>

      <!-- 任务记录列表 -->
      <div class="task-section">
        <div class="section-title-row">
          <span class="red-bar"></span>
          <span class="section-title">任务记录</span>
        </div>

        <div v-if="filteredTasks.length === 0" class="empty-state">
          <el-icon class="empty-icon"><DocumentRemove /></el-icon>
          <p>暂无任务记录</p>
        </div>

        <div
          v-for="task in filteredTasks"
          :key="task.id"
          :class="['task-card', { 'is-cancelled': task.status === '已取消' || task.status === '已转发' }]"
        >
          <!-- 顶部：日期 + 状态 -->
          <div class="task-header">
            <div class="task-date">
              <div class="task-weekday">{{ weekdayLabel(task.date) }}</div>
              <div class="task-day">{{ task.date }}</div>
            </div>
            <div :class="['status-badge', `status-${badgeKey(task.status)}`]">
              {{ task.status }}
            </div>
          </div>

          <!-- 中部：门店 + 时段 + 档位 -->
          <div class="task-body">
            <div class="task-store">
              <el-icon><Location /></el-icon>
              <span>{{ task.storeName }}</span>
            </div>
            <div class="task-time-row">
              <div class="task-time">
                <el-icon><Clock /></el-icon>
                <span>{{ task.startTime }} - {{ task.endTime }}</span>
              </div>
              <div class="task-duration">
                <span class="duration-tag">{{ durationLabel(task) }}</span>
              </div>
            </div>
          </div>

          <!-- 已取消 / 已转发 / 等待接单 的备注 -->
          <div v-if="task.status === '已取消' && task.cancelReason" class="task-remark">
            取消原因：{{ task.cancelReason }}
          </div>
          <div v-if="task.status === '已转发' && task.forwardTo" class="task-remark">
            已转发至：{{ task.forwardTo }}
          </div>
          <div v-if="task.status === '等待接单' && task.forwardTo" class="task-remark">
            {{ task.forwardTo }}
          </div>

          <!-- 操作区：仅 待到店 状态可见 -->
          <div v-if="task.status === '待到店'" class="task-actions">
            <button class="action-btn secondary" @click="onCancel(task)">取消任务</button>
            <button class="action-btn primary" @click="onForward(task)">转发任务</button>
          </div>

          <!-- 已到店/已离店不提供打卡入口，仅展示 -->
        </div>
      </div>
      </template>
    </div>

    <!-- 取消任务弹窗 -->
    <el-dialog v-model="cancelDialogVisible" title="取消任务" width="90%">
      <div class="cancel-warning-box">
        <el-icon class="warn-icon"><WarningFilled /></el-icon>
        <div class="warn-content">
          <div class="warn-title">确认取消该任务？</div>
          <ul>
            <li>该任务<strong>不予结算</strong></li>
            <li>取消后，您无需再到店执行该任务</li>
          </ul>
        </div>
      </div>
      <div class="cancel-reason">
        <div class="reason-label">取消原因（必填）：</div>
        <el-select v-model="cancelReason" placeholder="请选择" style="width: 100%;">
          <el-option label="临时有事" value="临时有事" />
          <el-option label="通勤冲突" value="通勤冲突" />
          <el-option label="身体不适" value="身体不适" />
          <el-option label="其他" value="其他" />
        </el-select>
      </div>
      <template #footer>
        <el-button @click="cancelDialogVisible = false">放弃</el-button>
        <el-button type="danger" :disabled="!cancelReason" @click="confirmCancel">确认取消</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="dispatchDialogVisible" title="任务通知" width="90%">
      <template v-if="recipientDispatch">
        <p class="dialog-tip">{{ recipientDispatch.assigneeName }}，您有一项新的任务安排。</p>
        <div class="task-store">
          <el-icon><Location /></el-icon>
          <span>{{ recipientDispatch.storeName }}</span>
        </div>
        <p class="dialog-tip">{{ recipientDispatch.date }} · {{ recipientDispatch.startTime }} - {{ recipientDispatch.endTime }}</p>
        <span class="status-badge status-pending">待到店</span>
      </template>
      <template #footer>
        <el-button type="primary" @click="dispatchDialogVisible = false">知道了</el-button>
      </template>
    </el-dialog>

    <!-- 转发任务弹窗 -->
    <el-dialog v-model="forwardDialogVisible" title="转发任务" width="90%">
      <p class="dialog-tip">
        选择接替人员，或转发到任务池供同商圈非全客户经理抢单。
      </p>

      <!-- 2 小时门禁 -->
      <div v-if="isWithin2Hours(forwardTarget)" class="forward-blocked">
        <el-icon class="block-icon"><WarningFilled /></el-icon>
        <div class="block-content">
          <div class="block-title">距任务开始不足 2 小时，不允许转发</div>
          <div class="block-desc">
            转发任务需要任务开始前 2 小时以上，否则无法保证同商圈有足够时间找到接单人。
            如无法按时到店，请取消任务并填写原因。
          </div>
          <el-button
            type="danger"
            size="small"
            @click="forwardDialogVisible = false; onCancel(forwardTarget)"
          >
            改走取消流程
          </el-button>
        </div>
      </div>

      <template v-else>
      <el-radio-group v-model="forwardMode" class="forward-mode">
        <el-radio-button label="指定人员">指定人员</el-radio-button>
        <el-radio-button label="任务池抢单">任务池抢单</el-radio-button>
      </el-radio-group>

      <div v-if="forwardMode === '指定人员'" class="candidate-list">
        <div
          v-for="emp in candidatesWithAvailability(forwardTarget)"
          :key="emp.id"
          :class="['candidate-item', {
            selected: forwardSelected === emp.id,
            disabled: !emp.available
          }]"
          @click="emp.available && (forwardSelected = emp.id)"
        >
          <div class="candidate-avatar">{{ emp.name.charAt(0) }}</div>
          <div class="candidate-info">
            <div class="candidate-name">{{ emp.name }}</div>
            <div class="candidate-meta">{{ emp.businessArea }} · {{ emp.intent }}</div>
          </div>
          <div :class="['availability-badge', emp.available ? 'free' : 'busy']">
            <el-icon><component :is="emp.available ? Check : Close" /></el-icon>
            <span>{{ emp.available ? '可接替' : '不可接替' }}</span>
          </div>
          <el-icon v-if="forwardSelected === emp.id" class="check-icon"><Check /></el-icon>
        </div>
      </div>

      <div v-else class="pool-tip">
        <el-icon><InfoFilled /></el-icon>
        <span>任务将进入同商圈任务池，<strong>30 分钟内</strong>未有人接单则自动回到原派单人。</span>
      </div>
      </template>

      <template #footer>
        <el-button @click="forwardDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :disabled="isWithin2Hours(forwardTarget) || (forwardMode === '指定人员' && !forwardSelected)"
          @click="confirmForward"
        >
          提交转发
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Location,
  Check,
  Close,
  WarningFilled,
  InfoFilled,
  DocumentRemove
} from '@element-plus/icons-vue'
import { parttimeStore, stores, employees, currentEmployeeId, employeeTasks, dateKey, addDays, durationLabel, slotRemaining, eligibilityError, claimSlot, cancelAssignment, dispatchNeed, syncScheduledPublication, createTaskId } from '../stores/parttimeTasks'

const router = useRouter()
const route = useRoute()
const currentTime = ref(new Date())
const taskView = ref(route.query.view === 'available' ? 'available' : 'mine')
const availableBatches = computed(() => [...parttimeStore.publications].filter(batch => batch.end >= dateKey(new Date())).sort((a, b) => b.releaseDate.localeCompare(a.releaseDate)))
const selectedRelease = ref(availableBatches.value[0]?.releaseDate || '')
const selectedStoreFilter = ref('')
watch(availableBatches, batches => {
  if (!batches.some(batch => batch.releaseDate === selectedRelease.value)) selectedRelease.value = batches[0]?.releaseDate || ''
})
watch(() => route.query.view, view => { taskView.value = view === 'available' ? 'available' : 'mine' })
const weekdayLabel = date => `周${'日一二三四五六'[new Date(`${date}T12:00:00`).getDay()]}`
const selectedTaskDate = ref('')
const availableDates = computed(() => {
  const batch = availableBatches.value.find(item => item.releaseDate === selectedRelease.value)
  if (!batch) return []
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(batch.start, index)
    return { date, weekday: weekdayLabel(date).replace('周', '星期'), slotCount: parttimeStore.slots.filter(slot => slot.releaseDate === selectedRelease.value && slot.date === date && (!selectedStoreFilter.value || slot.storeId === selectedStoreFilter.value)).length }
  })
})
watch([availableDates, () => dateKey(currentTime.value)], ([dates, today]) => {
  if (!dates.some(day => day.date === selectedTaskDate.value && day.date >= today)) selectedTaskDate.value = dates.find(day => day.date >= today)?.date || ''
}, { immediate: true })
const availableSlots = computed(() => parttimeStore.slots.filter(slot => slot.releaseDate === selectedRelease.value && slot.date === selectedTaskDate.value && slot.date >= dateKey(currentTime.value) && (!selectedStoreFilter.value || slot.storeId === selectedStoreFilter.value)).sort((a, b) => a.startTime.localeCompare(b.startTime)))
const selectedSlotIds = computed(() => new Set(employeeTasks(currentEmployeeId).filter(task => task.slotId && !['已取消', '已转发'].includes(task.status)).map(task => task.slotId)))
const isSlotSelected = slot => selectedSlotIds.value.has(slot.id)
const slotBlockReason = slot => {
  if (isSlotSelected(slot)) return ''
  if (!slotRemaining(slot)) return '该时段名额已满'
  if (new Date(`${slot.date}T${slot.startTime}:00`) <= currentTime.value) return '该时段已开始'
  return eligibilityError(currentEmployeeId, slot)
}
const chooseSlot = async slot => {
  if (isSlotSelected(slot)) return
  try { await ElMessageBox.confirm(`${slot.storeName}，${slot.date} ${slot.startTime} - ${slot.endTime}`, '确认选择任务', { confirmButtonText: '确认选择', cancelButtonText: '返回' }) } catch { return }
  const error = claimSlot(slot.id)
  if (error) return ElMessage.warning(error)
  ElMessage.success('已选择任务，可在我的任务中查看')
  generateCalendar()
}

const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)
const weekDays = ['日', '一', '二', '三', '四', '五', '六']
const calendarDates = ref([])

// 筛选
const filters = [
  { id: 'all', name: '全部' },
  { id: 'pending', name: '待到店' },
  { id: 'done', name: '已完成' },
  { id: 'cancelled', name: '已取消/转发' }
]
const activeFilter = ref('all')

const taskList = computed(() => employeeTasks(currentEmployeeId))

// 候选人（同商圈非全）
const candidates = computed(() => employees.filter(person => person.id !== currentEmployeeId).map(person => ({ ...person, businessArea: person.areas.join('、') })))

// 计算属性
const todayTotal = computed(() => taskList.value.filter(t => t.date === dateKey(currentTime.value)).length)
const todayPending = computed(() => taskList.value.filter(t => t.date === dateKey(currentTime.value) && t.status === '待到店').length)
const todayDone = computed(() => taskList.value.filter(t => t.date === dateKey(currentTime.value) && (t.status === '已到店' || t.status === '已离店')).length)

const filteredTasks = computed(() => {
  let list = [...taskList.value]
  if (activeFilter.value === 'pending') {
    list = list.filter(t => t.status === '待到店')
  } else if (activeFilter.value === 'done') {
    list = list.filter(t => t.status === '已到店' || t.status === '已离店')
  } else if (activeFilter.value === 'cancelled') {
    list = list.filter(t =>
      t.status === '已取消' ||
      t.status === '已转发' ||
      t.status === '等待接单'
    )
  }
  // 待到店按日期升序在前；同一天内按 startTime 升序（最早的在最前）
  return list.sort((a, b) => {
    if (a.status === '待到店' && b.status !== '待到店') return -1
    if (a.status !== '待到店' && b.status === '待到店') return 1
    if (a.date !== b.date) return a.date.localeCompare(b.date)
    return a.startTime.localeCompare(b.startTime)
  })
})

// 弹窗状态
const cancelDialogVisible = ref(false)
const cancelReason = ref('')
const cancelTarget = ref(null)
const dispatchDialogVisible = ref(false)
const recipientDispatch = ref(null)
const dispatchTimers = new Set()

const forwardDialogVisible = ref(false)
const forwardMode = ref('指定人员')
const forwardSelected = ref(null)
const forwardTarget = ref(null)

// ============ 日历生成 ============
const generateCalendar = () => {
  const year = currentYear.value
  const month = currentMonth.value - 1
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const dates = []
  for (let i = 0; i < firstDay; i++) {
    dates.push({ day: '', taskCount: 0 })
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const mm = String(month + 1).padStart(2, '0')
    const dd = String(i).padStart(2, '0')
    const dateStr = `${year}-${mm}-${dd}`
    const taskCount = taskList.value.filter(t => t.date === dateStr).length
    dates.push({ day: i, taskCount, date: dateStr })
  }
  calendarDates.value = dates
}

const isToday = (date) => {
  if (!date.day) return false
  const today = new Date()
  return date.day === today.getDate() &&
    currentMonth.value === today.getMonth() + 1 &&
    currentYear.value === today.getFullYear()
}

const prevMonth = () => {
  if (currentMonth.value === 1) {
    currentYear.value--
    currentMonth.value = 12
  } else {
    currentMonth.value--
  }
  generateCalendar()
}

const nextMonth = () => {
  if (currentMonth.value === 12) {
    currentYear.value++
    currentMonth.value = 1
  } else {
    currentMonth.value++
  }
  generateCalendar()
}

const onCalendarDayClick = (date) => {
  if (!date.day) return
  // 简化：点击日期不做跳转，仅展示反馈
  ElMessage.info(`${date.date} 共 ${date.taskCount} 个任务`)
}

const badgeKey = (status) => {
  return {
    '待到店': 'pending',
    '已到店': 'arrived',
    '已离店': 'done',
    '已取消': 'cancelled',
    '已转发': 'forwarded',
    '等待接单': 'pooling'
  }[status] || 'pending'
}

// ============ 时间门禁：转发需 ≥2 小时 ============
let clockTimer = null

const minutesUntilStart = (task) => {
  if (!task) return Infinity
  const taskStart = new Date(`${task.date}T${task.startTime}:00`)
  return Math.floor((taskStart - currentTime.value) / 60000)
}

const isWithin2Hours = (task) => {
  if (!task) return false
  return minutesUntilStart(task) < 120 && minutesUntilStart(task) >= 0
}

// 候选列表：根据当前任务判断每个人空闲状态，空闲排前
const isCandidateAvailable = (candidateId, task) => {
  if (!task) return true
  return !eligibilityError(candidateId, task)
}

const candidatesWithAvailability = (task) => {
  const list = candidates.value.map(emp => ({
    ...emp,
    available: isCandidateAvailable(emp.id, task),
    unavailableReason: task ? eligibilityError(emp.id, task) : ''
  }))
  return list.sort((a, b) => {
    if (a.available && !b.available) return -1
    if (!a.available && b.available) return 1
    return 0
  })
}

// ============ 操作处理 ============
const onCancel = (task) => {
  cancelTarget.value = task
  cancelReason.value = ''
  cancelDialogVisible.value = true
}

const confirmCancel = () => {
  const need = cancelAssignment(cancelTarget.value?.id, cancelReason.value)
  if (!need) return
  ElMessage.success('任务已取消')
  cancelDialogVisible.value = false

  // 原型展示接替人员的通知，派发记录不进入当前角色的非全任务列表。
  const timer = setTimeout(() => {
    dispatchTimers.delete(timer)
    const assignedTask = dispatchNeed(need.id)
    if (!assignedTask) return
    recipientDispatch.value = assignedTask
    dispatchDialogVisible.value = true
  }, 1000)
  dispatchTimers.add(timer)
}

const onForward = (task) => {
  forwardTarget.value = task
  forwardMode.value = '指定人员'
  forwardSelected.value = null
  forwardDialogVisible.value = true
}

const confirmForward = () => {
  const task = taskList.value.find(t => t.id === forwardTarget.value.id)
  if (!task || task.status !== '待到店') return
  if (isWithin2Hours(task)) return ElMessage.warning('距任务开始不足 2 小时，无法转发')

  if (forwardMode.value === '指定人员') {
    const target = candidates.value.find(c => c.id === forwardSelected.value)
    if (!target || !isCandidateAvailable(target.id, task)) return ElMessage.warning('该人员当前无法接替任务')
    task.status = '已转发'
    task.forwardTo = `${target.name}（同商圈）`
    parttimeStore.assignments.push({ ...task, id: createTaskId('forward'), sourceTaskId: task.id, source: '已生成任务被转移', status: '待到店', assigneeId: target.id, forwardTo: undefined, assignedAt: new Date().toISOString() })
    ElMessage.success(`已转发至 ${target.name}`)
  } else {
    task.status = '等待接单'
    task.forwardTo = '同商圈任务池抢单中（30 分钟内未接单自动回退）'
    ElMessage.success('已转发至任务池')
  }
  forwardDialogVisible.value = false
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  generateCalendar()
  clockTimer = setInterval(() => { currentTime.value = new Date(); syncScheduledPublication() }, 60000)
})

watch(taskList, generateCalendar, { deep: true })

onUnmounted(() => {
  clearInterval(clockTimer)
  dispatchTimers.forEach(clearTimeout)
  dispatchTimers.clear()
})
</script>

<style scoped>
.task-view-tabs { display: flex; border-bottom: 1px solid #e5e7eb; margin-bottom: 16px; }
.task-view-tabs button { flex: 1; padding: 14px 0; border: 0; border-bottom: 2px solid transparent; background: transparent; font-size: 15px; color: #666; cursor: pointer; }
.task-view-tabs button.active { color: #a40035; border-bottom-color: #a40035; font-weight: 600; }
.release-banner { display: flex; gap: 10px; padding: 14px 0 18px; align-items: flex-start; }
.release-banner .el-icon { color: #a40035; font-size: 22px; }
.release-banner strong { font-size: 14px; } .release-banner p { margin: 6px 0 0; font-size: 12px; line-height: 1.6; color: #666; }
.available-filters { display: grid; grid-template-columns: minmax(0, 1fr); gap: 10px; }
.available-date-tabs { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; margin-top: 16px; }
.available-date-tabs button { min-width: 0; height: 78px; padding: 8px 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; border: 1px solid #e5e7eb; border-radius: 6px; background: #fff; color: #666; cursor: pointer; }
.available-date-tabs span, .available-date-tabs small { font-size: 10px; line-height: 14px; white-space: nowrap; }
.available-date-tabs strong { font-size: 11px; line-height: 16px; white-space: nowrap; }
.available-date-tabs small { color: #888; }
.available-date-tabs button.active { color: #a40035; background: #fceef3; border-color: #a40035; }
.available-date-tabs button.active small { color: #a40035; }
.available-date-tabs button:disabled { color: #aaa; background: #f4f4f4; cursor: default; }
.available-count { font-size: 12px; color: #777; margin: 18px 0 12px; }
.available-date { font-size: 13px; font-weight: 600; }
.available-card.is-selected { border-color: #93cbb0; background: #f5fbf7; }
.selected-slot-label { display: inline-flex; align-items: center; gap: 4px; color: #247354; font-size: 12px; white-space: nowrap; }
.available-action .el-button { min-width: 88px; }
.available-action .selected-slot-button.is-disabled { color: #247354; background: #e5f3eb; border-color: #93cbb0; }
.available-action { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 16px; font-size: 13px; color: #a40035; }
.available-action .full { color: #999; } .slot-reason { font-size: 12px; color: #888; margin: 8px 0 0; line-height: 1.5; }
.mobile-parttime-tasks {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

/* ========== 页头 ========== */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  background: white;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.back-icon,
.header-icon {
  font-size: 22px;
  color: #333;
  cursor: pointer;
}

.page-header h1 {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  padding-right: 22px;
}

.content-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 12px 15px 30px;
}

/* ========== 概览卡 ========== */
.overview-card {
  background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
  border: 1px solid #fee2e2;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 12px;
}

.overview-row {
  display: flex;
  gap: 12px;
}

.overview-item {
  flex: 1;
  text-align: center;
}

.overview-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
}

.overview-value {
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.overview-value.pending {
  color: #f59e0b;
}

.overview-value.done {
  color: #10b981;
}

/* ========== 月历 ========== */
.calendar-section {
  background: white;
  border-radius: 12px;
  padding: 14px 12px;
  margin-bottom: 12px;
}

.month-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px 12px;
  border-bottom: 1px solid #eee;
  margin-bottom: 10px;
}

.month-selector .el-icon {
  font-size: 18px;
  color: #666;
  cursor: pointer;
  padding: 4px 8px;
}

.month-text {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.calendar-grid {
  display: flex;
  flex-direction: column;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 6px;
}

.calendar-day-header {
  text-align: center;
  font-size: 11px;
  color: #999;
  padding: 4px 0;
}

.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  min-height: 44px;
  padding: 4px;
  border: 1px solid transparent;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: background 0.2s;
}

.calendar-day.has-task {
  background: #fef2f2;
}

.calendar-day.today {
  background: #fee2e2;
  border-color: #a40035;
}

.calendar-day.today .day-number {
  color: #a40035;
}

.day-number {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.task-dot-row {
  display: flex;
  gap: 2px;
}

.task-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #a40035;
}

/* ========== 筛选 pills ========== */
.filter-bar {
  display: flex;
  gap: 8px;
  padding: 4px 0 12px;
  overflow-x: auto;
}

.filter-pill {
  padding: 6px 14px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-pill.active {
  background: #a40035;
  border-color: #a40035;
  color: white;
}

/* ========== 任务卡 ========== */
.task-section {
  background: white;
  border-radius: 12px;
  padding: 14px 14px 4px;
}

.section-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

.red-bar {
  display: inline-block;
  width: 3px;
  height: 14px;
  background: #a40035;
  border-radius: 2px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.task-card {
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 10px;
  background: #fff;
}

.task-card.is-cancelled {
  background: #fafafa;
  opacity: 0.85;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.task-weekday {
  font-size: 12px;
  color: #666;
}

.task-day {
  font-size: 14px;
  font-weight: 700;
  color: #333;
}

.status-badge {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 600;
}

.status-badge.status-pending {
  background: #fef3c7;
  color: #b45309;
}

.status-badge.status-arrived {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-badge.status-done {
  background: #d1fae5;
  color: #047857;
}

.status-badge.status-cancelled,
.status-badge.status-forwarded {
  background: #e5e7eb;
  color: #4b5563;
}

.status-badge.status-pooling {
  background: #ede9fe;
  color: #6d28d9;
}

@keyframes pulse-badge {
}

.task-body {
  padding-bottom: 8px;
  border-bottom: 1px dashed #eee;
}

.task-store {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.task-store .el-icon {
  color: #a40035;
  font-size: 16px;
}

.task-time-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

.task-time .el-icon {
  font-size: 13px;
}

.duration-tag {
  display: inline-block;
  padding: 2px 8px;
  background: #fef2f2;
  color: #a40035;
  border: 1px solid #fecaca;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.task-remark {
  margin-top: 8px;
  padding: 6px 10px;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 12px;
  color: #666;
}

/* 操作区 */
.task-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #f3f4f6;
}

.action-btn {
  flex: 1;
  padding: 8px 0;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.full {
  flex: 1;
}

.action-btn.secondary {
  background: white;
  color: #a40035;
  border: 1px solid #a40035;
}

.action-btn.secondary:active {
  background: #fef2f2;
}

.action-btn.primary {
  background: #a40035;
  color: white;
}

.action-btn.primary:active {
  background: #8b002d;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-disabled;
}

/* ========== 空状态 ========== */
.empty-state {
  text-align: center;
  padding: 40px 0 20px;
  color: #9ca3af;
}

.empty-state .empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-state p {
  font-size: 13px;
  margin: 0;
}

/* ========== 弹窗 ========== */
.dialog-tip {
  font-size: 13px;
  color: #4b5563;
  line-height: 1.6;
  margin: 0 0 12px;
}

.candidate-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 280px;
  overflow-y: auto;
}

.candidate-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.candidate-item.selected {
  border-color: #a40035;
  background: #fef2f2;
}

.candidate-item.disabled {
  background: #f9fafb;
  cursor: not-allowed;
}

.candidate-item.disabled .candidate-name,
.candidate-item.disabled .candidate-meta {
  color: #9ca3af;
}

.availability-badge {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.availability-badge .el-icon {
  font-size: 12px;
  margin: 0;
}

.availability-badge.free {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.availability-badge.busy {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.candidate-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #a40035;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.candidate-info {
  flex: 1;
  min-width: 0;
}

.candidate-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.candidate-meta {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.check-icon {
  color: #a40035;
  font-size: 18px;
}

.cancel-warning-box {
  display: flex;
  gap: 10px;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  margin-bottom: 14px;
}

.warn-icon {
  color: #dc2626;
  font-size: 22px;
  flex-shrink: 0;
}

.warn-title {
  font-size: 14px;
  font-weight: 600;
  color: #991b1b;
  margin-bottom: 6px;
}

.warn-content ul {
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  color: #7f1d1d;
  line-height: 1.7;
}

.cancel-reason {
  margin-top: 6px;
}

.reason-label {
  font-size: 13px;
  color: #4b5563;
  margin-bottom: 6px;
}

.forward-mode {
  display: flex;
  margin-bottom: 12px;
  width: 100%;
}

.forward-mode .el-radio-button {
  flex: 1;
}

.pool-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 16px 12px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  font-size: 13px;
  color: #1e40af;
  line-height: 1.6;
}

.pool-tip .el-icon {
  font-size: 18px;
  flex-shrink: 0;
}

/* ========== 转发 2 小时门禁 ========== */
.forward-blocked {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  margin-bottom: 14px;
}

.forward-blocked .block-icon {
  color: #dc2626;
  font-size: 22px;
  flex-shrink: 0;
}

.forward-blocked .block-content {
  flex: 1;
}

.forward-blocked .block-title {
  font-size: 14px;
  font-weight: 600;
  color: #991b1b;
  margin-bottom: 6px;
}

.forward-blocked .block-desc {
  font-size: 13px;
  color: #7f1d1d;
  line-height: 1.7;
  margin-bottom: 10px;
}
</style>
