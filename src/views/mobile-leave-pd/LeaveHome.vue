<template>
  <div class="pd-home">
    <div class="page-header">
      <el-icon class="back-icon" @click="goBack"><ArrowLeft /></el-icon>
      <h1>请假</h1>
      <span class="pd-tag">预设计</span>
    </div>

    <div class="content">
      <!-- 预览身份 -->
      <div class="identity-bar">
        <span class="id-label">预览身份</span>
        <div class="id-chips">
          <span
            v-for="e in employees"
            :key="e.id"
            :class="['id-chip', { on: e.id === emp.id }]"
            @click="switchEmp(e.id)"
          >
            {{ e.job }} · {{ e.name }}
          </span>
        </div>
      </div>

      <!-- 日历：可点，选日期看当天班次与可休名额 -->
      <div class="card">
        <div class="month-row">
          <el-icon @click="prevMonth"><ArrowLeft /></el-icon>
          <span class="month-text">{{ year }}年{{ month }}月</span>
          <el-icon @click="nextMonth"><ArrowRight /></el-icon>
        </div>
        <div class="cal-grid">
          <div v-for="w in weekDays" :key="w" class="cal-head">{{ w }}</div>
          <div
            v-for="(d, i) in calendarCells"
            :key="i"
            :class="[
              'cal-cell',
              { empty: !d.day, today: isToday(d), rest: d.shift === '休', picked: d.day && d.day === pickedDay }
            ]"
            @click="pickDay(d)"
          >
            <span v-if="d.day" class="cal-day">{{ d.day }}</span>
            <span v-if="d.shift" :class="['cal-shift', { rest: d.shift === '休' }]">{{ d.shift }}</span>
          </div>
        </div>

        <div v-if="pickedDay" class="picked-box">
          <div class="picked-head">
            <span class="picked-date">{{ month }}月{{ pickedDay }}日</span>
            <span v-if="pickedShift" class="picked-shift">{{ pickedShift.name }} · {{ pickedShift.range }}</span>
            <span v-else class="picked-shift rest">休息日</span>
          </div>
          <template v-if="pickedShift">
            <div class="quota-grid">
              <div v-for="q in pickedQuota" :key="q.name" class="quota-item">
                <span class="q-name">{{ q.name }}</span>
                <span class="q-num" :class="{ zero: q.available <= 0 }">{{ q.available }}</span>
                <span class="q-den">/ {{ q.total }}</span>
              </div>
            </div>
            <el-button type="primary" class="pd-btn full" @click="goApply()">这天休假</el-button>
          </template>
          <div v-else class="rest-tip">这天本来就不上班，不需要请假。</div>
        </div>
        <div v-else class="picked-hint">点一个日期，看当天班次与还能休几个人</div>
      </div>

      <!-- 我的假期 -->
      <div class="card">
        <div class="sec-head">
          <span class="sec-title">我的假期</span>
          <span class="sec-sub">自然月</span>
        </div>
        <div class="bal-list">
          <div v-for="b in balances" :key="b.schemeId" class="bal-row">
            <div class="bal-left">
              <span class="bal-type">{{ b.leaveType }}</span>
              <span class="bal-meta">{{ balMeta(b) }}</span>
            </div>
            <div class="bal-right">
              <span :class="['bal-remain', { over: b.remain < 0 }]">{{ b.remain }}</span>
              <span class="bal-unit">{{ b.unit }}</span>
              <span class="bal-used">已用 {{ b.used }}</span>
            </div>
          </div>
        </div>
        <el-button type="primary" class="pd-btn full" @click="goApply()">我要休假</el-button>
      </div>

      <!-- 需要留意：只放待审核与被拒，其余收进记录页 -->
      <div class="card">
        <div class="sec-head">
          <span class="sec-title">需要留意</span>
          <span class="sec-link" @click="goRecords()">全部记录 ›</span>
        </div>
        <div v-if="attention.length" class="rec-list">
          <div v-for="r in attention" :key="r.id" class="rec-item" @click="goRecords(r.id)">
            <div class="rec-main">
              <span class="rec-type">{{ r.typeName }}</span>
              <span class="rec-date">{{ r.date }}{{ r.dateEnd ? ' ~ ' + r.dateEnd : '' }}</span>
            </div>
            <span :class="['st', r.status]">{{ statusLabel(r.status) }}</span>
          </div>
        </div>
        <div v-else class="empty-text">暂无待处理的申请</div>
      </div>

      <!-- 本周排班：旧形态，收起不占首屏 -->
      <div class="card">
        <div class="sec-head toggle-head" @click="showWeek = !showWeek">
          <span class="sec-title">本周排班</span>
          <span class="sec-sub">{{ showWeek ? '收起' : '展开申请' }}</span>
        </div>
        <template v-if="showWeek">
          <div class="date-list">
            <div v-for="d in weekDates" :key="d.date" class="date-item">
              <div class="date-left">
                <div class="date-week">{{ d.week }}</div>
                <div class="date-day">{{ d.day }}日</div>
              </div>
              <div class="shift-options">
                <div
                  v-for="s in weekShiftQuota"
                  :key="s.id"
                  :class="['shift-opt', { selected: d.shift === s.id, disabled: s.total - s.applied <= 0 }]"
                  @click="pickShift(d, s)"
                >
                  <div class="shift-name">{{ s.name }}</div>
                  <div class="shift-quota">{{ s.total - s.applied }}/{{ s.total }}</div>
                </div>
              </div>
              <div class="date-status">
                <span v-if="d.status === 'pending'" class="st pending">审核中</span>
                <span v-else-if="d.status === 'success'" class="st success">排班成功</span>
              </div>
            </div>
          </div>
          <el-button type="primary" class="pd-btn full" @click="applyWeek">一键申请</el-button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  pdEmployees,
  currentEmpId,
  setCurrentEmpId,
  currentEmployee,
  shiftPlanOf,
  shiftOn,
  dayLeaveQuota,
  weekShiftQuota,
  balancesOf,
  recordsOf,
  statusLabel,
  pdYear,
  pdMonth,
  pdToday
} from '../../mock/mobileLeavePd.js'

const router = useRouter()
const employees = pdEmployees
const emp = ref(currentEmployee())
const empId = ref(currentEmpId())

const weekDays = ['日', '一', '二', '三', '四', '五', '六']
const year = ref(pdYear)
const month = ref(pdMonth)

const plan = computed(() => shiftPlanOf(empId.value))

const calendarCells = computed(() => {
  const first = new Date(year.value, month.value - 1, 1).getDay()
  const days = new Date(year.value, month.value + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < first; i++) cells.push({ day: '' })
  for (let d = 1; d <= days; d++) {
    cells.push({ day: d, shift: month.value === pdMonth ? plan.value[d] || '' : '' })
  }
  return cells
})

const isToday = (d) =>
  d.day === pdToday.day && month.value === pdToday.month && year.value === pdToday.year

/* ---------- 选日期 ---------- */
const pickedDay = ref(0)
const pickDay = (d) => {
  if (!d.day) return
  pickedDay.value = d.day
}

const pickedShift = computed(() => (pickedDay.value ? shiftOn(empId.value, pickedDay.value) : null))
const pickedQuota = computed(() => (pickedDay.value ? dayLeaveQuota(pickedDay.value) : []))

/* ---------- 本周排班（旧形态） ---------- */
const showWeek = ref(false)
const weekDates = ref([
  { date: '2026-10-15', week: '周三', day: 15, shift: null, status: null },
  { date: '2026-10-16', week: '周四', day: 16, shift: null, status: null },
  { date: '2026-10-17', week: '周五', day: 17, shift: null, status: null },
  { date: '2026-10-18', week: '周六', day: 18, shift: null, status: null },
  { date: '2026-10-19', week: '周日', day: 19, shift: null, status: null }
])

const pickShift = (d, s) => {
  if (s.total - s.applied <= 0) return
  if (d.status === 'pending' || d.status === 'success') return
  d.shift = s.id
}

const applyWeek = () => {
  const chosen = weekDates.value.filter(d => d.shift)
  if (!chosen.length) {
    ElMessage.warning('请先选择班次')
    return
  }
  chosen.forEach(d => { d.status = 'pending' })
  ElMessage.success('已提交，等待审核')
  setTimeout(() => {
    chosen.forEach((d, i) => { d.status = i % 2 === 0 ? 'success' : 'pending' })
  }, 2500)
}

/* ---------- 余额与记录 ---------- */
const balances = computed(() => balancesOf(emp.value))
const records = computed(() => recordsOf(empId.value, 'all'))
const attention = computed(() =>
  records.value.filter(r => ['pending', 'rejected'].includes(r.status)).slice(0, 2)
)

const balMeta = (b) => {
  const bits = []
  if (b.measure === 'cycle') {
    bits.push(`${b.cycle} ${b.amount} ${b.unit}`)
  } else {
    bits.push(`每次 ${b.amount} ${b.unit}`)
    if (b.validWithin) bits.push(b.validWithin)
  }
  if (b.derivedFrom && !b.adjustNote) bits.push(b.derivedFrom)
  if (b.adjustNote) bits.push(b.adjustNote)
  return bits.join(' · ')
}

const switchEmp = (id) => {
  empId.value = id
  emp.value = pdEmployees.find(e => e.id === id)
  setCurrentEmpId(id)
  pickedDay.value = 0
}

const dateOf = (day) =>
  `${year.value}-${String(month.value).padStart(2, '0')}-${String(day).padStart(2, '0')}`

const goApply = () => {
  const q = {}
  if (pickedDay.value) {
    q.date = dateOf(pickedDay.value)
    if (pickedShift.value) q.shift = pickedShift.value.id
  }
  router.push({ name: 'mobile-leave-pd-apply', query: q })
}
const goRecords = (id) => router.push({ name: 'mobile-leave-pd-records', query: id ? { id } : {} })
const goBack = () => router.push('/mobile-menu')

const prevMonth = () => {
  if (month.value === 1) { month.value = 12; year.value-- } else { month.value-- }
}
const nextMonth = () => {
  if (month.value === 12) { month.value = 1; year.value++ } else { month.value++ }
}
</script>

<style scoped>
.pd-home { min-height: 100vh; height: 100vh; overflow-y: auto; background: #f5f5f5; -webkit-overflow-scrolling: touch; }
.page-header { display: flex; align-items: center; gap: 10px; padding: 14px 16px; background: #fff; position: sticky; top: 0; z-index: 20; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
.back-icon { font-size: 22px; color: #333; }
.page-header h1 { flex: 1; text-align: center; font-size: 17px; font-weight: 600; margin: 0; }
.pd-tag { font-size: 11px; color: #a40035; border: 1px solid #a40035; border-radius: 10px; padding: 1px 7px; }
.content { padding: 12px 12px 28px; }

.identity-bar { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #fff; border-radius: 10px; margin-bottom: 12px; }
.id-label { font-size: 12px; color: #999; flex-shrink: 0; }
.id-chips { display: flex; gap: 8px; flex-wrap: wrap; }
.id-chip { font-size: 12px; padding: 3px 10px; border-radius: 12px; border: 1px solid #e5e7eb; color: #666; background: #fafafa; }
.id-chip.on { color: #a40035; border-color: #a40035; background: #fff5f7; font-weight: 600; }

.card { background: #fff; border-radius: 12px; padding: 14px; margin-bottom: 12px; }
.month-row { display: flex; align-items: center; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0; margin-bottom: 10px; color: #666; }
.month-text { font-size: 15px; font-weight: 600; color: #333; }
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.cal-head { text-align: center; font-size: 11px; color: #999; padding: 4px 0; }
.cal-cell { min-height: 46px; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; background: #fafafa; }
.cal-cell.empty { background: transparent; }
.cal-cell.rest { background: #f3f6ff; }
.cal-cell.today { box-shadow: inset 0 0 0 1px #a40035; }
.cal-cell.picked { background: #fff0f4; box-shadow: inset 0 0 0 2px #a40035; }
.cal-day { font-size: 13px; font-weight: 600; color: #333; }
.cal-shift { font-size: 10px; color: #a40035; }
.cal-shift.rest { color: #3b82f6; }

.picked-box { margin-top: 12px; padding: 12px; background: #fafafa; border-radius: 10px; }
.picked-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 10px; }
.picked-date { font-size: 15px; font-weight: 600; color: #333; }
.picked-shift { font-size: 12px; color: #a40035; }
.picked-shift.rest { color: #3b82f6; }
.quota-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.quota-item { background: #fff; border: 1px solid #f0f0f0; border-radius: 8px; padding: 8px 6px; text-align: center; }
.q-name { display: block; font-size: 11px; color: #666; margin-bottom: 4px; }
.q-num { font-size: 16px; font-weight: 700; color: #a40035; }
.q-num.zero { color: #bbb; }
.q-den { font-size: 11px; color: #999; }
.rest-tip { font-size: 13px; color: #3b82f6; }
.picked-hint { margin-top: 10px; font-size: 12px; color: #999; text-align: center; }

.sec-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.toggle-head { cursor: pointer; }
.sec-title { font-size: 15px; font-weight: 600; color: #333; }
.sec-sub { font-size: 12px; color: #999; }
.sec-link { font-size: 12px; color: #a40035; }
.empty-text { font-size: 13px; color: #999; padding: 8px 0; }

.pd-btn { background: #a40035; border-color: #a40035; }
.pd-btn.full { width: 100%; margin-top: 12px; }

.date-list { display: flex; flex-direction: column; gap: 10px; }
.date-item { display: flex; align-items: center; gap: 10px; border: 1px solid #f0f0f0; border-radius: 8px; padding: 10px; }
.date-left { width: 46px; text-align: center; flex-shrink: 0; }
.date-week { font-size: 12px; color: #666; }
.date-day { font-size: 14px; font-weight: 600; color: #a40035; }
.shift-options { display: flex; gap: 6px; flex: 1; }
.shift-opt { flex: 1; text-align: center; border: 1px solid #eee; border-radius: 6px; padding: 6px 4px; }
.shift-opt.selected { border-color: #a40035; background: #fff0f4; }
.shift-opt.disabled { opacity: .45; }
.shift-name { font-size: 12px; color: #333; font-weight: 600; }
.shift-quota { font-size: 11px; color: #999; margin-top: 2px; }
.date-status { width: 56px; text-align: center; flex-shrink: 0; }

.st { font-size: 11px; padding: 2px 8px; border-radius: 10px; white-space: nowrap; }
.st.pending { color: #b45309; background: #fef3c7; }
.st.success, .st.approved { color: #15803d; background: #dcfce7; }
.st.rejected { color: #b91c1c; background: #fee2e2; }
.st.withdrawn { color: #6b7280; background: #f3f4f6; }

.bal-list { display: flex; flex-direction: column; }
.bal-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f5f5f5; }
.bal-row:last-child { border-bottom: none; }
.bal-left { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.bal-type { font-size: 14px; font-weight: 600; color: #333; }
.bal-meta { font-size: 11px; color: #999; line-height: 1.5; }
.bal-right { display: flex; align-items: baseline; gap: 4px; flex-shrink: 0; }
.bal-remain { font-size: 18px; font-weight: 700; color: #a40035; }
.bal-remain.over { color: #b91c1c; }
.bal-unit { font-size: 12px; color: #666; }
.bal-used { font-size: 11px; color: #999; margin-left: 6px; }

.rec-list { display: flex; flex-direction: column; }
.rec-item { display: flex; align-items: center; justify-content: space-between; padding: 11px 0; border-bottom: 1px solid #f5f5f5; }
.rec-item:last-child { border-bottom: none; }
.rec-main { display: flex; flex-direction: column; gap: 3px; }
.rec-type { font-size: 14px; color: #333; font-weight: 500; }
.rec-date { font-size: 12px; color: #999; }
</style>
