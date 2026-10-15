<template>
  <div class="mobile-attendance">
    <div class="page-header">
      <h1>{{ mode === 'parttime' ? '打卡' : '考勤打卡' }}</h1>
      <div class="header-actions">
        <span class="action-btn" @click="onMore">···</span>
        <span class="action-btn" @click="goBack">✕</span>
      </div>
    </div>

    <div class="content">
      <!-- 任务门店切换（非全） -->
      <div v-if="mode === 'parttime'" class="store-switcher">
        <button
          v-for="task in todayTasks"
          :key="task.id"
          :class="['switcher-tab', { active: task.id === selectedTaskId }]"
          @click="pickTask(task.id)"
        >
          <span class="switcher-name">{{ task.storeName }}</span>
          <span class="switcher-time">{{ task.startTime }}-{{ task.endTime }}</span>
          <span v-if="task.id === recommendedTaskId" class="switcher-badge">推荐</span>
        </button>
        <button v-if="!selectedTaskId" class="switcher-trigger" @click="openPicker">
          选择今日任务
        </button>
      </div>

      <!-- 员工信息 -->
      <div class="card info-card">
        <div class="module-title">
          <span class="red-bar"></span>
          员工信息*
        </div>
        <div class="form-row">
          <label>工号/姓名</label>
          <div class="form-value">{{ employee.name }}</div>
        </div>
        <div class="form-row">
          <label>考勤日期</label>
          <el-date-picker
            v-model="attendanceDate"
            type="date"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            class="form-picker"
            :clearable="false"
            :disabled="mode === 'parttime'"
          />
        </div>
        <div class="form-row">
          <label>考勤地点</label>
          <div class="form-value">{{ employeeLocation }}</div>
        </div>
        <div class="form-row">
          <label>{{ mode === 'parttime' ? '任务时段' : '考勤班次' }}</label>
          <div class="form-value">{{ shiftLabel }}</div>
        </div>
      </div>

      <!-- 今日任务：弹窗选择 -->
      <el-dialog
        v-model="taskPickerVisible"
        :show-close="false"
        :modal="true"
        align-center
        width="92%"
        class="task-picker-dialog"
      >
        <div class="picker-content">
          <div class="picker-handle"></div>
          <h3 class="picker-title">选择今日打卡门店</h3>
          <p class="picker-tip">请选择您今天要打卡的门店</p>
          <div class="picker-list">
            <div
              v-for="task in todayTasks"
              :key="task.id"
              class="picker-item"
              @click="pickTask(task.id)"
            >
              <div class="picker-radio">
                <span class="picker-radio-dot"></span>
              </div>
              <div class="picker-main">
                <div class="picker-name">{{ task.storeName }}</div>
                <div class="picker-time">{{ task.startTime }}-{{ task.endTime }}</div>
              </div>
              <span v-if="task.id === recommendedTaskId" class="picker-badge">推荐</span>
            </div>
          </div>
        </div>
      </el-dialog>

      <!-- 考勤打卡 / 打卡 -->
      <div class="card checkin-card">
        <div class="card-head">
          <div class="module-title">
            <span class="red-bar"></span>
            {{ mode === 'parttime' ? '打卡*' : '考勤打卡*' }}
          </div>
          <button
            class="record-btn"
            :class="{ active: showRecord }"
            @click="toggleRecord"
          >
            {{ showRecord ? '返回打卡' : '打卡记录' }}
          </button>
        </div>

        <!-- 主操作界面 -->
        <div v-show="!showRecord">

          <!-- 全职模式：双块同时展示 -->
          <template v-if="mode === 'fulltime'">
            <!-- 上班打卡 -->
            <div class="shift-block">
              <div class="time-row">
                <span class="time-label">上班打卡时间：</span>
                <span class="time-value">{{ shift.clockIn }}</span>
              </div>
              <div class="image-row">
                <div class="image-card">
                  <div class="image-placeholder example"></div>
                  <div class="image-label">
                    <el-icon class="bell-icon"><Bell /></el-icon>
                    上班打卡示例
                  </div>
                </div>
                <div class="image-card">
                  <div class="image-placeholder mine"></div>
                  <div class="image-label">
                    <el-icon class="bell-icon"><Bell /></el-icon>
                    我的打卡
                  </div>
                </div>
              </div>
              <div class="meta-row">
                <el-icon class="meta-icon"><Location /></el-icon>
                <span class="meta-key">打卡距离：</span>
                <span class="meta-value">{{ checkIn.distance }}</span>
              </div>
              <div class="meta-row">
                <el-icon class="meta-icon"><Clock /></el-icon>
                <span class="meta-key">打卡时间：</span>
                <span class="meta-value">{{ checkIn.time }}</span>
              </div>
              <div class="meta-row meta-row--flex">
                <div class="meta-left">
                  <el-icon class="meta-icon"><Grid /></el-icon>
                  <span class="meta-key">打卡类型：</span>
                  <span class="meta-value">{{ checkIn.type }}</span>
                </div>
                <button class="update-btn" @click="onUpdateCheckIn">更新打卡</button>
              </div>
            </div>

            <!-- 下班打卡 -->
            <div class="shift-block">
              <div class="time-row">
                <span class="time-label">下班打卡时间：</span>
                <span class="time-value">{{ shift.clockOut }}</span>
              </div>
              <div class="image-row">
                <div class="image-card">
                  <div class="image-placeholder example"></div>
                  <div class="image-label">
                    <el-icon class="bell-icon"><Bell /></el-icon>
                    下班打卡示例
                  </div>
                </div>
                <div class="image-card image-card--action">
                  <button class="circle-checkin-btn" @click="onClockOut">
                    <span class="circle-time">{{ liveTime }}</span>
                    <span class="circle-text">下班打卡</span>
                  </button>
                  <div class="image-label image-label--warn">
                    <el-icon class="warn-icon"><CircleClose /></el-icon>
                    未进入考勤范围
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- 非全模式：双块展示，靠按钮状态推进 -->
          <template v-else>
            <!-- 到店打卡块 -->
            <div class="shift-block">
              <div v-if="step === 'arrive' && !checkInGate.canCheckIn" class="waiting-card">
                <el-icon class="waiting-icon"><Clock /></el-icon>
                <div class="waiting-title">暂不能打卡</div>
                <div class="waiting-detail">{{ checkInGate.message }}</div>
              </div>
              <div v-else class="image-row">
                <div class="image-card">
                  <div class="image-placeholder example"></div>
                  <div class="image-label">
                    <el-icon class="bell-icon"><Bell /></el-icon>
                    到店打卡示例
                  </div>
                </div>
                <div class="image-card image-card--action">
                  <button
                    v-if="step === 'arrive'"
                    class="circle-checkin-btn"
                    @click="onArrive"
                  >
                    <span class="circle-text-lg">到店打卡</span>
                  </button>
                  <div v-else class="circle-state circle-state--done">
                    <el-icon class="state-icon"><CircleCheckFilled /></el-icon>
                    <span class="state-label">已到店</span>
                  </div>
                </div>
              </div>
              <div class="meta-row">
                <el-icon class="meta-icon"><Location /></el-icon>
                <span class="meta-key">打卡距离：</span>
                <span class="meta-value">{{ checkIn.distance }}</span>
              </div>
              <div class="meta-row meta-row--flex">
                <div class="meta-left">
                  <el-icon class="meta-icon"><Grid /></el-icon>
                  <span class="meta-key">打卡状态：</span>
                  <span
                    class="meta-value"
                    :class="{ 'meta-value--warn': step !== 'arrive' && arriveStatus === '迟到到店' }"
                  >
                    {{ arriveStatus }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 离店打卡块 -->
            <div class="shift-block">
              <div class="image-row">
                <div class="image-card">
                  <div class="image-placeholder example"></div>
                  <div class="image-label">
                    <el-icon class="bell-icon"><Bell /></el-icon>
                    离店打卡示例
                  </div>
                </div>
                <div class="image-card image-card--action">
                  <button
                    v-if="step === 'leave'"
                    class="circle-checkin-btn"
                    @click="onLeave"
                  >
                    <span class="circle-text-lg">离店打卡</span>
                  </button>
                  <div v-else-if="step === 'done'" class="circle-state circle-state--done">
                    <el-icon class="state-icon"><CircleCheckFilled /></el-icon>
                    <span class="state-label">已离店</span>
                  </div>
                  <div v-else class="circle-state circle-state--locked">
                    <el-icon class="state-icon"><Lock /></el-icon>
                    <span class="state-label">待到店打卡</span>
                  </div>
                  <div class="image-label image-label--warn">
                    <el-icon class="warn-icon"><CircleClose /></el-icon>
                    未进入考勤范围
                  </div>
                </div>
              </div>
              <div class="meta-row">
                <el-icon class="meta-icon"><Location /></el-icon>
                <span class="meta-key">打卡距离：</span>
                <span class="meta-value">{{ checkIn.distance }}</span>
              </div>
              <div class="meta-row meta-row--flex">
                <div class="meta-left">
                  <el-icon class="meta-icon"><Grid /></el-icon>
                  <span class="meta-key">打卡状态：</span>
                  <span
                    class="meta-value"
                    :class="{ 'meta-value--warn': step === 'done' && leaveStatus === '提前离店' }"
                  >
                    {{ leaveStatus }}
                  </span>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- 月历视图 -->
        <div v-show="showRecord" class="record-view">
          <div class="month-nav">
            <span class="month-arrow" @click="prevMonth">«</span>
            <span class="month-text">{{ calendarYear }}年{{ calendarMonth }}月</span>
            <el-date-picker
              v-model="monthPicker"
              type="month"
              value-format="YYYY-MM"
              format="YYYY年MM月"
              class="month-picker"
              @change="onMonthPickerChange"
            />
            <span class="month-arrow" @click="nextMonth">»</span>
          </div>

          <div class="weekdays">
            <span v-for="(d, i) in weekHeaders" :key="i" class="weekday">{{ d }}</span>
          </div>

          <div class="days-grid">
            <div
              v-for="(cell, idx) in calendarCells"
              :key="idx"
              :class="['day-cell', { 'day-empty': !cell.day, 'isToday': cell.isToday }]"
            >
              <template v-if="cell.day">
                <div class="day-num">{{ cell.day }}</div>
                <span
                  v-if="cell.status"
                  class="status-dot"
                  :class="`dot-${cell.status}`"
                ></span>
              </template>
            </div>
          </div>

          <div class="legend">
            <span class="legend-item">
              <span class="legend-dot dot-miss"></span>未打卡
            </span>
            <span class="legend-item">
              <span class="legend-dot dot-ok"></span>正常打卡
            </span>
            <span class="legend-item">
              <span class="legend-dot dot-warn"></span>异常打卡
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Bell, Location, Clock, Grid, CircleClose, CircleCheckFilled, Lock } from '@element-plus/icons-vue'
import { currentEmployeeId, employeeTasks, dateKey, durationLabel, summarizeAttendance } from '../stores/parttimeTasks'

const router = useRouter()
const route = useRoute()

const mode = computed(() => route.query.mode === 'parttime' ? 'parttime' : 'fulltime')

const employee = {
  name: '杨小雪'
}

const shiftLabel = computed(() =>
  mode.value === 'parttime' ? (selectedTask.value ? `${selectedTask.value.startTime}-${selectedTask.value.endTime}（${durationLabel(selectedTask.value)}）` : '暂无任务') : '通班'
)

const attendanceDate = ref(mode.value === 'parttime' ? dateKey(new Date()) : '2026-09-28')

const shift = {
  clockIn: '10:00:00',
  clockOut: '22:00:00'
}

const checkIn = {
  distance: '569.6m',
  time: '2026-09-28 09:59:12',
  type: '正常打卡'
}

const liveTime = ref('10:01:22')
const now = ref(new Date())
let timer = null
function tickClock() {
  const d = new Date()
  now.value = d
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  liveTime.value = `${hh}:${mm}:${ss}`
}
onMounted(() => {
  tickClock()
  timer = setInterval(tickClock, 1000)
  if (todayTasks.value.length === 1) {
    selectedTaskId.value = todayTasks.value[0].id
  } else if (todayTasks.value.length >= 2) {
    taskPickerVisible.value = true
  }
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

const showRecord = ref(false)
const toggleRecord = () => {
  showRecord.value = !showRecord.value
}

// 非全顺序流程：arrive → leave → done
const step = computed(() => selectedTask.value?.status === '已离店' ? 'done' : selectedTask.value?.status === '已到店' ? 'leave' : 'arrive')
const arriveTime = computed(() => selectedTask.value?.arriveTime || '')
const leaveTime = computed(() => selectedTask.value?.leaveTime || '')

// 今日任务（后端注入；按 startTime 升序；任务时段需考虑跨店通勤时间）
const todayTasks = computed(() => employeeTasks(currentEmployeeId).filter(task => task.date === dateKey(now.value) && ['待到店', '已到店', '已离店'].includes(task.status)).sort((a, b) => a.startTime.localeCompare(b.startTime)))

const recommendedTaskId = computed(() =>
  todayTasks.value.length > 0 ? todayTasks.value[0].id : null
)

const selectedTaskId = ref(null)
const taskPickerVisible = ref(false)

function pickTask(id) {
  selectedTaskId.value = id
  taskPickerVisible.value = false
}

function openPicker() {
  taskPickerVisible.value = true
}

const selectedTask = computed(() =>
  todayTasks.value.find(t => t.id === selectedTaskId.value) || null
)
watch(todayTasks, tasks => {
  if (!tasks.some(task => task.id === selectedTaskId.value)) selectedTaskId.value = tasks[0]?.id || null
})

function parseHHMM(s) {
  const [h, m] = s.split(':').map(Number)
  return h * 60 + m
}

const nowMinutes = computed(() =>
  now.value.getHours() * 60 + now.value.getMinutes()
)

const checkInGate = computed(() => {
  const task = selectedTask.value
  if (!task) return { canCheckIn: false, message: '请先选择今日任务' }
  const startMin = parseHHMM(task.startTime)
  const diff = startMin - nowMinutes.value
  if (diff > 30) return { canCheckIn: false, message: '请在任务开始前 30 分钟内再试' }
  return { canCheckIn: true, message: null }
})

const employeeLocation = computed(() => {
  if (mode.value === 'fulltime') return '兴隆湖店'
  return selectedTask.value ? selectedTask.value.storeName : '请先选择今日任务'
})

function snapshotTime() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`
}

function onArrive() {
  if (!selectedTask.value || !checkInGate.value.canCheckIn || selectedTask.value.status !== '待到店') return
  selectedTask.value.arriveTime = snapshotTime()
  selectedTask.value.status = '已到店'
}
function onLeave() {
  if (!selectedTask.value || selectedTask.value.status !== '已到店') return
  selectedTask.value.leaveTime = snapshotTime()
  selectedTask.value.status = '已离店'
}

const arriveStatus = computed(() => {
  if (!arriveTime.value) return '未到店'
  return summarizeAttendance(selectedTask.value).arrivalStatus
})

const leaveStatus = computed(() => {
  if (step.value === 'arrive') return '待到店打卡'
  if (!leaveTime.value) return '未离店'
  return summarizeAttendance(selectedTask.value).leaveStatus
})

const onUpdateCheckIn = () => {
  // TODO: 更新打卡
}
const onClockOut = () => {
  // TODO: 下班打卡
}
const onMore = () => {
  // TODO: 更多菜单
}
const goBack = () => router.push('/mobile-menu')

// ====== 月历 ======
// 周末头从「六」开始：六 日 一 二 三 四 五
const weekHeaders = ['六', '日', '一', '二', '三', '四', '五']

function parseYMD(s) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const calendarYear = ref(2026)
const calendarMonth = ref(10)
const monthPicker = ref('2026-10')

function setMonth(year, month) {
  calendarYear.value = year
  calendarMonth.value = month
  monthPicker.value = `${year}-${String(month).padStart(2, '0')}`
}

function prevMonth() {
  let m = calendarMonth.value - 1
  let y = calendarYear.value
  if (m < 1) { m = 12; y -= 1 }
  setMonth(y, m)
}
function nextMonth() {
  let m = calendarMonth.value + 1
  let y = calendarYear.value
  if (m > 12) { m = 1; y += 1 }
  setMonth(y, m)
}
function onMonthPickerChange(v) {
  if (!v) return
  const [y, m] = v.split('-').map(Number)
  setMonth(y, m)
}

// 计算某月第一天的星期偏移（按 weekHeaders 顺序：六=0）
function firstDayOffset(year, month) {
  const first = new Date(year, month - 1, 1)
  // JS getDay(): 0=Sun,1=Mon,...,6=Sat
  // 映射：Sat(6)→0, Sun(0)→1, Mon(1)→2, Tue(2)→3, Wed(3)→4, Thu(4)→5, Fri(5)→6
  const map = { 6: 0, 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6 }
  return map[first.getDay()]
}

const calendarCells = computed(() => {
  const y = calendarYear.value
  const m = calendarMonth.value
  const offset = firstDayOffset(y, m)
  const totalDays = new Date(y, m, 0).getDate()
  const todayStr = attendanceDate.value
  const cells = []
  for (let i = 0; i < offset; i++) {
    cells.push({ day: null, status: null, isToday: false })
  }
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const isToday = dateStr === todayStr
    // 模拟数据：当前已查看的截图整月都是「未打卡」
    cells.push({
      day: d,
      status: 'miss',
      isToday
    })
  }
  return cells
})
</script>

<style scoped>
.mobile-attendance {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.page-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}
.page-header h1 {
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}
.header-actions {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #666;
  cursor: pointer;
  user-select: none;
}

.content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 16px;
}

/* 卡片公共 */
.card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.module-title {
  font-size: 16px;
  font-weight: 600;
  color: #a40035;
  display: flex;
  align-items: center;
  margin-bottom: 14px;
}
.red-bar {
  display: inline-block;
  width: 3px;
  height: 16px;
  background: #a40035;
  border-radius: 2px;
  margin-right: 8px;
}

/* 员工信息表单 */
.form-row {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}
.form-row:last-child { border-bottom: none; }
.form-row label {
  width: 92px;
  color: #333;
  font-size: 14px;
  flex-shrink: 0;
}
.form-value {
  flex: 1;
  color: #1a1a1a;
  font-size: 14px;
  background: #fafafa;
  border: 1px solid #ececec;
  border-radius: 6px;
  padding: 8px 12px;
  line-height: 1.4;
}
.form-picker {
  flex: 1;
}
:deep(.form-picker .el-input__wrapper) {
  background: #fafafa;
  border-radius: 6px;
}

/* 卡片头部 */
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.card-head .module-title { margin-bottom: 0; }

.record-btn {
  background: #fce4ec;
  color: #a40035;
  border: none;
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}
.record-btn.active {
  background: #a40035;
  color: #fff;
}

/* 班次块 */
.shift-block + .shift-block {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px dashed #eee;
}

.time-row {
  font-size: 15px;
  margin-bottom: 10px;
}
.time-label { color: #333; }
.time-value { color: #1a1a1a; font-weight: 600; }

.image-row {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
}
.image-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.image-placeholder {
  width: 100%;
  aspect-ratio: 1 / 1;
  border: 1px solid #ececec;
  border-radius: 8px;
  background: #fafafa;
}
.image-placeholder.example {
  background:
    linear-gradient(135deg, #f5f5f5 25%, transparent 25%) -10px 0,
    linear-gradient(225deg, #f5f5f5 25%, transparent 25%) -10px 0,
    #fafafa;
}
.image-placeholder.mine {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
}
.image-card--action .image-placeholder.mine {
  background: linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%);
}
.image-label {
  margin-top: 8px;
  font-size: 13px;
  color: #a40035;
  display: flex;
  align-items: center;
  gap: 4px;
}
.bell-icon {
  color: #a40035;
  font-size: 14px;
}
.image-label--warn { color: #a40035; }
.warn-icon { color: #a40035; font-size: 14px; }

.meta-row {
  display: flex;
  align-items: center;
  font-size: 14px;
  padding: 6px 0;
  color: #a40035;
}
.meta-row--flex {
  justify-content: space-between;
}
.meta-left {
  display: flex;
  align-items: center;
}
.meta-icon {
  color: #a40035;
  margin-right: 6px;
  font-size: 15px;
}
.meta-key { color: #333; margin-right: 2px; }
.meta-value { color: #a40035; font-weight: 500; }
.meta-value--warn { color: #e65100; }

.update-btn {
  background: #fff;
  color: #a40035;
  border: 1px solid #a40035;
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 13px;
  cursor: pointer;
}
.update-btn:active { background: #fce4ec; }

/* 圆形下班打卡按钮 */
.circle-checkin-btn {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  border: none;
  background: #a40035;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(164, 0, 53, 0.3);
  transition: transform 0.15s;
}
.circle-checkin-btn:active { transform: scale(0.96); }
.circle-time { font-size: 18px; font-weight: 600; }
.circle-text { font-size: 13px; margin-top: 2px; }
.circle-text-lg { font-size: 20px; font-weight: 600; }

/* ====== 等待卡片（门禁未开） ====== */
.waiting-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 16px;
  background: #fff8e1;
  border: 1px solid #ffe0b2;
  border-radius: 10px;
  margin-bottom: 10px;
  text-align: center;
}
.waiting-icon {
  font-size: 36px;
  color: #f57c00;
  margin-bottom: 8px;
}
.waiting-title {
  font-size: 16px;
  font-weight: 600;
  color: #e65100;
  margin-bottom: 4px;
}
.waiting-detail {
  font-size: 13px;
  color: #5d4037;
  margin-bottom: 6px;
}
.waiting-tip {
  font-size: 12px;
  color: #999;
}

/* ====== 顶部 store-switcher ====== */
.store-switcher {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 16px 12px;
  margin: 0 -16px 8px;
  scrollbar-width: none;
}
.store-switcher::-webkit-scrollbar { display: none; }
.switcher-tab {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 10px 14px;
  background: #fff;
  border: 1px solid #ececec;
  border-radius: 10px;
  cursor: pointer;
  position: relative;
  transition: border-color 0.15s, background 0.15s;
}
.switcher-tab.active {
  border-color: #a40035;
  background: #fce4ec;
}
.switcher-name {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
}
.switcher-tab.active .switcher-name {
  color: #a40035;
  font-weight: 600;
}
.switcher-time {
  font-size: 12px;
  color: #888;
  margin-top: 2px;
}
.switcher-badge {
  position: absolute;
  top: -6px;
  right: -4px;
  font-size: 10px;
  padding: 2px 6px;
  background: #a40035;
  color: #fff;
  border-radius: 999px;
}
.switcher-trigger {
  flex-shrink: 0;
  padding: 10px 14px;
  background: #fce4ec;
  color: #a40035;
  border: 1px dashed #a40035;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
}

/* ====== 任务选择弹窗 ====== */
.task-picker-dialog :deep(.el-dialog) {
  margin: 0 auto;
  border-radius: 16px 16px 0 0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 100%;
  width: 100% !important;
  transform: none;
}
.task-picker-dialog :deep(.el-dialog__header) { padding: 0; display: none; }
.task-picker-dialog :deep(.el-dialog__body) { padding: 0; }

.picker-content {
  padding: 8px 16px 24px;
}
.picker-handle {
  width: 36px;
  height: 4px;
  background: #ddd;
  border-radius: 2px;
  margin: 8px auto 16px;
}
.picker-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px;
}
.picker-tip {
  font-size: 13px;
  color: #888;
  margin: 0 0 14px;
}
.picker-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.picker-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid #ececec;
  border-radius: 10px;
  cursor: pointer;
}
.picker-item:active {
  background: #fce4ec;
}
.picker-radio {
  width: 18px;
  height: 18px;
  border: 1.5px solid #ccc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.picker-radio-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.picker-main { flex: 1; }
.picker-name {
  font-size: 15px;
  font-weight: 500;
  color: #1a1a1a;
}
.picker-time {
  font-size: 12px;
  color: #888;
  margin-top: 2px;
}
.picker-badge {
  font-size: 11px;
  padding: 2px 8px;
  background: #fce4ec;
  color: #a40035;
  border-radius: 999px;
  flex-shrink: 0;
}

/* ====== 非全打卡状态展示 ====== */
.circle-state {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.circle-state--done {
  background: #f1f8f3;
  color: #2e7d32;
}
.circle-state--locked {
  background: #f5f5f5;
  color: #bdbdbd;
}
.state-icon {
  font-size: 32px;
  margin-bottom: 6px;
}
.state-time {
  font-size: 16px;
  font-weight: 600;
}
.state-label {
  font-size: 14px;
  margin-top: 2px;
}

/* ====== 月历 ====== */
.record-view { padding: 8px 0; }

.month-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 8px 0 16px;
}
.month-arrow {
  font-size: 22px;
  color: #333;
  cursor: pointer;
  padding: 4px 10px;
  user-select: none;
}
.month-text {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}
.month-picker {
  width: 36px;
}
:deep(.month-picker .el-input__wrapper) {
  background: transparent;
  box-shadow: none;
  padding: 0;
}
:deep(.month-picker .el-input__inner) {
  display: none;
}
:deep(.month-picker .el-input__suffix) {
  right: 4px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 13px;
  color: #666;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 4px 0;
}
.day-cell {
  height: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}
.day-num {
  font-size: 14px;
  color: #1a1a1a;
  line-height: 1.4;
}
.isToday .day-num {
  color: #a40035;
  font-weight: 700;
}
.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  margin-top: 4px;
}
.dot-miss { background: #a40035; }
.dot-ok   { background: #4caf50; }
.dot-warn { background: #fbc02d; }

.legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 14px 0 4px;
  font-size: 13px;
  color: #555;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  display: inline-block;
}
.legend-dot.dot-miss { background: #a40035; }
.legend-dot.dot-ok   { background: #4caf50; }
.legend-dot.dot-warn { background: #fbc02d; }
</style>
