<template>
  <div class="wm-page">
    <!-- ============ 头部 ============ -->
    <div class="page-header">
      <div class="head-row">
        <div class="head-left">
          <div class="header-main">
            <h1>岗位假勤方案</h1>
          </div>
        </div>
        <div class="head-actions">
          <el-button size="small" @click="go('leave-wm-scheme')">出勤方案</el-button>
          <el-button size="small" @click="go('leave-wm-attendance')">考勤组</el-button>
        </div>
      </div>
    </div>

    <el-tabs v-model="view" class="wm-tabs">
      <el-tab-pane label="按岗位" name="jobs">
        <el-row :gutter="16">
          <!-- ============ 左栏：按岗位查看 ============ -->
          <el-col :span="7">
            <div class="section-card">
              <div class="card-header">
                <span class="card-title">按岗位查看</span>
                <span class="card-sub">共 {{ jobList.length }} 个岗位</span>
              </div>

              <div class="job-pane">
                <div v-for="o in organizations" :key="o.id" class="org-block">
                  <div class="org-title">
                    <span>{{ o.name }}</span>
                    <em>{{ o.jobs.length }}</em>
                  </div>
                  <div
                    v-for="n in o.jobs"
                    :key="n"
                    class="job-line"
                    :class="{ active: n === selectedJob }"
                    @click="selectJob(n)"
                  >
                    <div class="jl-top">
                      <span class="jl-name">{{ n }}</span>
                      <el-tooltip content="配置该岗位的假勤方案" placement="left" :show-after="200">
                        <el-icon class="jl-edit" @click.stop="openConfig(n)"><Setting /></el-icon>
                      </el-tooltip>
                    </div>
                    <div class="jl-refs">
                      <span class="ref-chip" :class="{ warn: !modeOf(n).schemeId }">
                        <i class="ref-dot"></i>
                        {{ modeOf(n).schemeId ? schemeName(modeOf(n).schemeId) : '未引用方案' }}
                      </span>
                      <span v-if="modeOf(n).attendance" class="ref-chip att">
                        {{ modeOf(n).attendanceGroupId ? attName(modeOf(n).attendanceGroupId) : '未引考勤组' }}
                      </span>
                      <span v-else class="ref-chip none">不打卡</span>
                      <span v-if="quotaCount(modeOf(n))" class="ref-chip quota">
                        {{ quotaCount(modeOf(n)) }} 项假种额度
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-col>

          <!-- ============ 右栏：整屏日历 ============ -->
          <el-col :span="17">
            <template v-if="currentScheme">
              <div class="section-card">
                <div class="card-header">
                  <span class="card-title">
                    {{ selectedJob }}
                    <em class="card-title-sub">
                      · 引用方案「{{ currentScheme.name }}」
                      <template v-if="currentMode.attendanceGroupId">
                        · 考勤组「{{ attName(currentMode.attendanceGroupId) }}」
                      </template>
                    </em>
                  </span>
                  <div class="header-actions">
                    <el-button size="small" @click="shiftMonth(-1)">‹ 上月</el-button>
                    <span class="month-label">{{ viewYear }} 年 {{ viewMonth }} 月</span>
                    <el-button size="small" @click="shiftMonth(1)">下月 ›</el-button>
                  </div>
                </div>

                <div class="summary-row">
                  <span class="sum-item"><b>{{ stats.work }}</b> 个工作日</span>
                  <span class="sum-item"><b>{{ stats.rest }}</b> 个休息日</span>
                  <span class="sum-item"><b>{{ stats.holiday }}</b> 天法定节假日</span>
                  <span class="sum-item"><b>{{ stats.makeup }}</b> 天调班上班</span>
                  <span class="sum-item plain">
                    {{ jobsUsingScheme(currentScheme.id).length }} 个岗位共用这份方案
                  </span>
                </div>

                <div class="cal-grid">
                  <div v-for="w in weekDayNames" :key="'h' + w" class="cal-head">周{{ w }}</div>
                  <div
                    v-for="(c, i) in calendarCells"
                    :key="'c' + i"
                    class="cal-cell"
                    :class="c ? [c.cls, { picked: c.dateKey === selectedKey }] : 'blank'"
                    @click="c && (selectedKey = c.dateKey)"
                  >
                    <template v-if="c">
                      <span class="cal-day">{{ c.day }}</span>
                      <span v-if="c.label" class="cal-tag">{{ c.label }}</span>
                    </template>
                  </div>
                </div>

                <div class="legend">
                  <span v-for="l in legends" :key="l.cls" class="legend-item">
                    <i class="legend-dot" :class="l.cls"></i>{{ l.text }}
                  </span>
                </div>

                <div v-if="selected" class="day-bar">
                  <span class="db-date">{{ selected.dateKey }} · 周{{ weekDayNames[selected.dow - 1] }}</span>
                  <el-tag size="small" :type="selected.tagType" effect="plain">{{ selected.statusText }}</el-tag>
                  <span class="db-basis">依据：{{ basisOf(selected) }}</span>
                </div>
                <div v-else class="empty-hint">
                  点击日历上任意一天，查看当天是工作日还是休息日。
                </div>
              </div>
            </template>

            <!-- 未引用方案的岗位 -->
            <div v-else class="section-card">
              <div class="card-header">
                <span class="card-title">这个岗位还没有出勤方案</span>
              </div>
              <div class="no-group">
                <div class="no-group-title">「{{ selectedJob }}」尚未引用任何方案</div>
                <div class="no-group-desc">
                  从已有方案里挑一份引用，或去方案库新建一份。
                  <span v-if="currentMode && currentMode.pending" class="pending-note">{{ currentMode.pending }}</span>
                </div>
                <div class="no-group-actions">
                  <el-button size="small" type="primary" @click="openConfig(selectedJob)">去配置</el-button>
                  <el-button size="small" @click="go('leave-wm-scheme')">方案库</el-button>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-tab-pane>

      <el-tab-pane label="矩阵" name="matrix">
        <ReferenceOverview embedded :modes="modes" @pick="pickJob" />
      </el-tab-pane>
    </el-tabs>

    <!-- ============ 配置抽屉（引用 + 声明） ============ -->
    <el-drawer v-model="drawerVisible" :title="`配置假勤方案 · ${form.job}`" size="620px" :modal="false">
      <div class="drawer-body">
        <div class="src-banner">
          <span class="src-badge">岗位 · 只读</span>
          <span class="src-text">
            {{ form.job }} · {{ form.headcount }} 人 · 所属组织「{{ form.org }}」
            —— 来自组织架构，本页不改
          </span>
        </div>

        <!-- 引用层 -->
        <el-divider content-position="left">引用</el-divider>

        <div class="cfg-block">
          <div class="cfg-label">
            <span>出勤方案</span>
            <span class="cfg-note">可被多个岗位复用</span>
          </div>
          <div class="ref-row">
            <el-select v-model="form.schemeId" placeholder="选择一份出勤方案" clearable style="flex: 1">
              <el-option
                v-for="s in schemes"
                :key="s.id"
                :label="s.name"
                :value="s.id"
              >
                <span class="opt-name">{{ s.name }}</span>
                <span class="opt-meta">{{ patternText(s.weekPattern) }}</span>
              </el-option>
            </el-select>
            <el-button
              size="small"
              :disabled="!form.schemeId"
              @click="go('leave-wm-scheme')"
            >编辑方案</el-button>
          </div>
          <div v-if="formScheme" class="ref-detail">
            <span class="rd-item">周模式：<b>{{ patternText(formScheme.weekPattern) }}</b></span>
            <span class="rd-item">法定节假日：<b>{{ policyLabel(formScheme.holidayPolicy) }}</b></span>
            <span class="rd-item">特殊日：<b>{{ formScheme.specialDays.length }} 天</b></span>
            <span class="rd-item">引用者：<b>{{ jobsUsingScheme(form.schemeId).length }} 个岗位</b></span>
          </div>
          <div v-else class="field-desc warn-text">
            未引用方案，无法判断哪天上班。
          </div>
        </div>

        <div class="cfg-block">
          <div class="cfg-label">
            <span>考勤组</span>
            <span class="cfg-note">来自打卡组</span>
          </div>
          <div class="ref-row">
            <el-select
              v-model="form.attendanceGroupId"
              placeholder="选择考勤组（不打卡可不选）"
              clearable
              style="flex: 1"
            >
              <el-option
                v-for="a in attGroups"
                :key="a.id"
                :label="a.name"
                :value="a.id"
                :disabled="!a.enabled"
              >
                <span class="opt-name">{{ a.name }}</span>
                <span class="opt-meta">{{ a.method }}</span>
              </el-option>
            </el-select>
            <el-button size="small" @click="go('leave-wm-attendance')">查看考勤组</el-button>
          </div>
          <div v-if="formAtt" class="ref-detail">
            <span class="rd-item">打卡方式：<b>{{ formAtt.method }}</b></span>
            <span class="rd-item">范围：<b>{{ formAtt.scope }}</b></span>
            <span class="rd-item">该考勤组被 <b>{{ jobsUsingAttendance(form.attendanceGroupId).length }}</b> 个岗位引用</span>
          </div>
        </div>

        <!-- 校验 -->
        <div v-if="form.attendance && !form.attendanceGroupId" class="check-banner warn">
          声明了「需要打卡」，却没引用考勤组 → 打卡有效性无从判定。
        </div>
        <div v-if="!form.attendance && form.attendanceGroupId" class="check-banner warn">
          引用了考勤组，却声明「不打卡」→ 该引用不会生效，建议清空。
        </div>
        <!-- 声明层 -->
        <el-divider content-position="left">声明</el-divider>

        <el-row :gutter="16">
          <el-col :span="12">
            <div class="cfg-inline">
              <span>参与排班</span>
              <el-switch v-model="form.schedule" />
            </div>
          </el-col>
          <el-col :span="12">
            <div class="cfg-inline">
              <span>需要打卡</span>
              <el-switch v-model="form.attendance" />
            </div>
          </el-col>
        </el-row>

        <div class="cfg-block">
          <div class="cfg-label">
            <span>假期额度</span>
            <span class="cfg-note">由「假期额度方案」勾选本岗位为适用岗位 · 本页只读</span>
          </div>
          <div v-if="formQuotaTypes.length" class="quota-mini">
            <div v-for="t in formQuotaTypes" :key="t.id" class="qm-row">
              <span class="qm-name">{{ t.name }}</span>
              <span class="qm-value">{{ quotaSummary(t.id) }}</span>
            </div>
          </div>
          <div v-else class="field-desc">该岗位未被任何额度方案勾选为适用岗位，暂时没有假期额度。</div>
        </div>

        <div class="cfg-block">
          <div class="cfg-label"><span>补缺方式</span><span class="cfg-note">同岗位补，不跨岗位</span></div>
          <el-select v-model="form.backfill" style="width: 100%">
            <el-option v-for="s in backfillOptions" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
          <div class="field-desc">{{ subDesc }}</div>
          <div v-if="form.backfill !== 'none'" class="readonly-row">
            <span class="rd-key">缺岗信号</span>
            <span class="rd-item">日期 · 门店 · 岗位 · 班次段 · 缺人数</span>
          </div>
          <div v-if="form.backfillNote" class="field-desc">{{ form.backfillNote }}</div>
        </div>

        <div class="cfg-block last">
          <div class="cfg-label"><span>备注</span></div>
          <el-input v-model="form.note" type="textarea" :rows="2" placeholder="说明该岗位的假勤方案特点" />
        </div>
      </div>

      <template #footer>
        <el-button @click="drawerVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Setting } from '@element-plus/icons-vue'
import ReferenceOverview from './ReferenceOverview.vue'
import {
  scheduleSchemes,
  attendanceGroups,
  jobWorkModes,
  jobsUsingScheme,
  jobsUsingAttendance,
  leaveTypeOptions,
  quotaChainOf,
  schemesOfJob,
  cycleOptions,
  backfillOptions,
  patternText,
  weekDayNames,
  statutoryCalendar,
  organizations,
  holidayPolicies
} from '../../mock/leaveWorkMode.js'

const router = useRouter()
const route = useRoute()
const go = (name) => router.push({ name })

/* 视图切换：按岗位（默认） / 矩阵（原「引用总览」，已并入本页） */
const view = ref(route.query.view === 'matrix' ? 'matrix' : 'jobs')
watch(
  () => route.query.view,
  (v) => {
    const next = v === 'matrix' ? 'matrix' : 'jobs'
    if (next !== view.value) view.value = next
  }
)
watch(view, (v) => {
  const nextQuery = { ...route.query }
  if (v === 'matrix') nextQuery.view = 'matrix'
  else delete nextQuery.view
  router.replace({ query: nextQuery })
})

const schemes = scheduleSchemes
const attGroups = attendanceGroups
const leaveTypes = leaveTypeOptions
const cycles = cycleOptions
const modes = ref(jobWorkModes.map(m => ({ ...m })))
const jobList = computed(() => modes.value)

const modeOf = (name) => modes.value.find(m => m.job === name) || { job: name, attendance: false }
const schemeName = (id) => (scheduleSchemes.find(s => s.id === id) || {}).name || '—'
const quotaCount = (m) => (m ? schemesOfJob(m.job).length : 0)
/** 额度摘要：按计量方式表达（周期发放 / 周期上限 / 按次上限）+ 另有几条差异化 */
const quotaSummary = (leaveTypeId) => {
  const tiers = quotaChainOf(leaveTypeId)
  if (!tiers.length) return '—'
  const base = tiers.find(q => q.base) || tiers[0]
  let what
  if (base.measure === 'cap') what = `≤ ${base.amount} ${base.unit} / ${base.cycle}（上限）`
  else if (base.measure === 'event') what = `每次 ≤ ${base.amount} ${base.unit}`
  else what = `${base.amount} ${base.unit} / ${base.cycle}`
  return tiers.length > 1 ? `${what}（另 ${tiers.length - 1} 条差异化）` : what
}
const attName = (id) => (attendanceGroups.find(a => a.id === id) || {}).name || '—'
const policyLabel = (v) => (holidayPolicies.find(p => p.value === v) || {}).label || v
const subDesc = computed(() => {
  const hit = backfillOptions.find(s => s.value === form.backfill)
  return hit ? hit.desc : ''
})

/* ---------- 选中岗位 ---------- */
const selectedJob = ref('推拿师')
const currentMode = computed(() => modeOf(selectedJob.value))
const currentScheme = computed(() => {
  const id = currentMode.value.schemeId
  return id ? scheduleSchemes.find(s => s.id === id) || null : null
})

const selectJob = (name) => {
  selectedJob.value = name
  selectedKey.value = ''
}

/** 矩阵里点岗位 → 回到「按岗位」并选中它 */
const pickJob = (name) => {
  selectJob(name)
  view.value = 'jobs'
}

/* ---------- 日历 ---------- */
const viewYear = ref(2026)
const viewMonth = ref(10)
const selectedKey = ref('')

const pad = n => String(n).padStart(2, '0')
const dateKeyOf = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`
const dowOf = (y, m, d) => {
  const w = new Date(y, m - 1, d).getDay()
  return w === 0 ? 7 : w
}
const findHoliday = key => statutoryCalendar.holidays.find(h => key >= h.start && key <= h.end)
const findMakeup = key => statutoryCalendar.makeupWorkdays.find(m => m.date === key)

const resolveDay = (y, m, d) => {
  const sc = currentScheme.value
  if (!sc) return null
  const key = dateKeyOf(y, m, d)
  const dow = dowOf(y, m, d)
  const chain = []

  let isWork = sc.weekPattern[dow - 1] === 1
  let cls = isWork ? 'work' : 'rest'
  let statusText = isWork ? '工作日' : '休息日'
  let tagType = isWork ? 'primary' : 'info'
  let label = ''

  chain.push({
    layer: '周基础模式',
    detail: patternText(sc.weekPattern),
    resultText: isWork ? '工作日' : '休息日',
    workState: isWork
  })

  const holiday = findHoliday(key)
  if (holiday) {
    label = holiday.name
    if (sc.holidayPolicy === 'rest') {
      isWork = false
      cls = 'holiday'
      statusText = '法定节假日 · 休息'
      tagType = 'danger'
      chain.push({
        layer: '法定节假日',
        detail: `${holiday.name}（${holiday.start} ~ ${holiday.end}，共 ${holiday.days} 天）`,
        resultText: '休息日',
        workState: false
      })
    } else {
      cls = 'holiday-biz'
      statusText = '法定节假日 · 照常营业'
      tagType = 'warning'
      chain.push({
        layer: '法定节假日',
        detail: `${holiday.name}（门店照常营业，涉及加班与提成）`,
        resultText: '特殊营业日（不改变工作状态）',
        workState: null
      })
    }
  }

  const makeup = findMakeup(key)
  if (makeup) {
    if (sc.holidayPolicy === 'rest') {
      isWork = true
      label = '调班上班'
      cls = 'makeup'
      statusText = '法定调班日 · 上班'
      tagType = 'warning'
      chain.push({ layer: '法定调班日', detail: makeup.note, resultText: '工作日', workState: true })
    } else {
      chain.push({
        layer: '法定调班日',
        detail: `${makeup.note}（门店本就营业，无影响）`,
        resultText: '不适用',
        workState: null
      })
    }
  }

  const special = (sc.specialDays || []).find(s => s.date === key)
  if (special) {
    isWork = special.type === 'work'
    label = '特殊日'
    cls = isWork ? 'special-work' : 'special-rest'
    statusText = isWork ? '特殊日 · 临时上班' : '特殊日 · 临时休息'
    tagType = 'warning'
    chain.push({
      layer: '方案内特殊日',
      detail: special.reason,
      resultText: isWork ? '工作日' : '休息日',
      workState: isWork
    })
  }

  const finalState = isWork
  chain.forEach((c, i) => {
    c.overridden = i < chain.length - 1 && c.workState !== null && c.workState !== finalState
  })

  return { day: d, dateKey: key, dow, isWork, cls, label, statusText, tagType, chain }
}

const calendarCells = computed(() => {
  if (!currentScheme.value) return []
  const y = viewYear.value
  const m = viewMonth.value
  const offset = (new Date(y, m - 1, 1).getDay() + 6) % 7
  const total = new Date(y, m, 0).getDate()
  const cells = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= total; d++) cells.push(resolveDay(y, m, d))
  return cells
})

const selected = computed(() => {
  if (!selectedKey.value || !currentScheme.value) return null
  const [y, m, d] = selectedKey.value.split('-').map(Number)
  return resolveDay(y, m, d)
})

/** 当天状态取自哪一层（只给最终生效的那一层，覆盖链路属文档内容） */
const basisOf = (c) => {
  const chain = c.chain || []
  const last = chain[chain.length - 1]
  if (!last) return '方案周基础模式'
  return last.detail ? `${last.layer} · ${last.detail}` : last.layer
}

const stats = computed(() => {
  const cells = calendarCells.value.filter(Boolean)
  return {
    work: cells.filter(c => c.isWork).length,
    rest: cells.filter(c => !c.isWork).length,
    holiday: cells.filter(c => c.cls === 'holiday' || c.cls === 'holiday-biz').length,
    makeup: cells.filter(c => c.cls === 'makeup').length
  }
})

const legends = [
  { cls: 'work', text: '工作日' },
  { cls: 'rest', text: '休息日' },
  { cls: 'holiday', text: '法定节假日（休息）' },
  { cls: 'holiday-biz', text: '法定节假日（营业）' },
  { cls: 'makeup', text: '调班上班' },
  { cls: 'special-work', text: '特殊日 · 上班' },
  { cls: 'special-rest', text: '特殊日 · 休息' }
]

const shiftMonth = (delta) => {
  let m = viewMonth.value + delta
  let y = viewYear.value
  if (m < 1) { m = 12; y-- }
  if (m > 12) { m = 1; y++ }
  viewMonth.value = m
  viewYear.value = y
  selectedKey.value = ''
}

/* ---------- 配置抽屉 ---------- */
const drawerVisible = ref(false)
const emptyForm = () => ({
  job: '', org: '', headcount: 0, schedule: true, attendance: true,
  schemeId: null, attendanceGroupId: null,
  backfill: 'none', note: '', pending: ''
})
const form = reactive(emptyForm())

const formScheme = computed(() => (form.schemeId ? scheduleSchemes.find(s => s.id === form.schemeId) : null))
const formAtt = computed(() => (form.attendanceGroupId ? attendanceGroups.find(a => a.id === form.attendanceGroupId) : null))
const formQuotaTypes = computed(() => schemesOfJob(form.job)
  .map(s => ({ id: s.leaveTypeId, name: (leaveTypes.find(t => t.value === s.leaveTypeId) || {}).label || s.leaveTypeId })))

const openConfig = (name) => {
  const m = modeOf(name)
  Object.assign(form, emptyForm(), JSON.parse(JSON.stringify(m)))
  drawerVisible.value = true
}

const save = () => {
  const idx = modes.value.findIndex(m => m.job === form.job)
  if (idx !== -1) modes.value[idx] = { ...modes.value[idx], ...JSON.parse(JSON.stringify(form)) }
  drawerVisible.value = false
  ElMessage.success(`「${form.job}」的假勤方案已更新，将于次月生效`)
}
</script>

<style scoped>
.wm-page { padding: 0; }

.wm-tabs :deep(.el-tabs__header) { margin-bottom: 14px; }
.wm-tabs :deep(.el-tabs__item) { font-size: 14px; }

.page-header { margin-bottom: 14px; }
.head-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.head-actions { display: flex; gap: 8px; flex-shrink: 0; }
.header-main { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.header-main h1 { font-size: 22px; font-weight: 600; margin: 0; color: hsl(var(--foreground)); }
.tip { margin: 0; font-size: 13px; line-height: 1.7; color: hsl(var(--muted-foreground)); max-width: 900px; }
.tip strong { color: hsl(var(--foreground)); font-weight: 600; }

/* 卡片 */
.section-card {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  padding: 16px 18px;
}
.card-header {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  flex-wrap: wrap; margin-bottom: 14px; padding-bottom: 12px;
  border-bottom: 1px solid hsl(var(--border));
}
.card-title { font-size: 15px; font-weight: 600; color: hsl(var(--foreground)); }
.card-title-sub { font-style: normal; font-size: 12px; font-weight: 400; color: hsl(var(--muted-foreground)); }
.card-sub { font-size: 12px; color: hsl(var(--muted-foreground)); }
.header-actions { display: flex; align-items: center; gap: 8px; }

/* 岗位列表 */
.job-pane { display: flex; flex-direction: column; gap: 14px; }
.org-title {
  display: flex; align-items: center; gap: 8px; margin-bottom: 6px;
  font-size: 12px; font-weight: 600; color: hsl(var(--muted-foreground));
}
.org-title em { font-style: normal; font-weight: 400; opacity: 0.7; }
.job-line {
  padding: 7px 9px; border-radius: 7px; cursor: pointer;
  border: 1px solid transparent; transition: all 0.15s;
}
.job-line:hover { background: hsl(var(--muted) / 0.4); }
.job-line.active { background: hsl(var(--primary) / 0.08); border-color: hsl(var(--primary) / 0.35); }
.jl-top { display: flex; align-items: center; justify-content: space-between; }
.jl-name { font-size: 13.5px; font-weight: 500; color: hsl(var(--foreground)); }
.jl-edit { font-size: 13px; color: hsl(var(--muted-foreground)); opacity: 0; transition: opacity 0.15s; }
.job-line:hover .jl-edit { opacity: 1; }
.jl-edit:hover { color: hsl(var(--primary)); }
.jl-refs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 5px; }
.ref-chip {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; padding: 1px 7px; border-radius: 9px;
  background: hsl(var(--muted) / 0.5); color: hsl(var(--muted-foreground));
  border: 1px solid hsl(var(--border));
}
.ref-chip.att { color: hsl(var(--primary) / 0.9); }
.ref-chip.none { opacity: 0.6; }
.ref-chip.warn { color: hsl(38 92% 42%); border-color: hsl(38 92% 50% / 0.5); background: hsl(38 92% 50% / 0.1); }

.ref-chip.quota { color: hsl(150 45% 34%); border-color: hsl(150 45% 40% / 0.4); background: hsl(150 45% 40% / 0.1); }
.ref-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; opacity: 0.7; }
.pane-foot {
  margin-top: 14px; padding-top: 12px; border-top: 1px dashed hsl(var(--border));
  font-size: 12px; color: hsl(var(--muted-foreground)); line-height: 1.7;
}
.pane-foot b { color: hsl(var(--foreground)); font-weight: 600; }

/* 日历 */
.month-label { font-size: 13px; font-weight: 500; color: hsl(var(--foreground)); min-width: 108px; text-align: center; }
.summary-row { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 12px; font-size: 12.5px; color: hsl(var(--muted-foreground)); }
.sum-item b { color: hsl(var(--foreground)); font-weight: 600; margin-right: 2px; }
.sum-item.plain { margin-left: auto; opacity: 0.85; }
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; }
.cal-head { text-align: center; font-size: 12px; color: hsl(var(--muted-foreground)); padding: 4px 0; }
.cal-cell {
  position: relative; min-height: 62px; border-radius: 6px; padding: 6px 7px;
  border: 1px solid hsl(var(--border)); cursor: pointer; transition: all 0.12s;
  background: hsl(var(--background));
}
.cal-cell.blank { border: none; background: transparent; cursor: default; }
.cal-cell:hover { border-color: hsl(var(--primary) / 0.5); }
.cal-cell.picked { box-shadow: 0 0 0 2px hsl(var(--primary) / 0.5); }
.cal-cell.work { background: hsl(var(--primary) / 0.07); }
.cal-cell.rest { background: hsl(var(--muted) / 0.45); }
.cal-cell.holiday { background: hsl(0 84% 60% / 0.1); border-color: hsl(0 84% 60% / 0.3); }
.cal-cell.holiday-biz { background: hsl(38 92% 50% / 0.12); border-color: hsl(38 92% 50% / 0.35); }
.cal-cell.makeup { background: hsl(280 60% 55% / 0.12); border-color: hsl(280 60% 55% / 0.3); }
.cal-cell.special-work { background: hsl(150 60% 42% / 0.12); border-color: hsl(150 60% 42% / 0.35); }
.cal-cell.special-rest { background: hsl(200 70% 50% / 0.12); border-color: hsl(200 70% 50% / 0.35); }
.cal-day { font-size: 13px; font-weight: 500; color: hsl(var(--foreground)); }
.cal-tag { position: absolute; left: 6px; bottom: 5px; font-size: 10px; color: hsl(var(--muted-foreground)); }
.legend { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 12px; }
.legend-item { display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; color: hsl(var(--muted-foreground)); }
.legend-dot { width: 9px; height: 9px; border-radius: 2px; border: 1px solid hsl(var(--border)); }
.legend-dot.work { background: hsl(var(--primary) / 0.35); }
.legend-dot.rest { background: hsl(var(--muted)); }
.legend-dot.holiday { background: hsl(0 84% 60% / 0.4); }
.legend-dot.holiday-biz { background: hsl(38 92% 50% / 0.45); }
.legend-dot.makeup { background: hsl(280 60% 55% / 0.45); }
.legend-dot.special-work { background: hsl(150 60% 42% / 0.45); }
.legend-dot.special-rest { background: hsl(200 70% 50% / 0.45); }

.day-bar {
  margin-top: 14px; padding: 10px 14px; border-radius: 8px;
  background: hsl(var(--muted) / 0.35); border: 1px solid hsl(var(--border));
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
}
.db-date { font-size: 13px; font-weight: 600; color: hsl(var(--foreground)); }
.db-basis { font-size: 12px; color: hsl(var(--muted-foreground)); margin-left: auto; }
.empty-hint { font-size: 12.5px; color: hsl(var(--muted-foreground)); padding: 6px 0; }

.no-group { padding: 8px 0; }
.no-group-title { font-size: 14px; font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 8px; }
.no-group-desc { font-size: 13px; color: hsl(var(--muted-foreground)); line-height: 1.7; margin-bottom: 14px; }
.pending-note { display: block; margin-top: 6px; color: hsl(38 92% 42%); }
.no-group-actions { display: flex; gap: 8px; }

/* 抽屉 */
.drawer-body { padding-bottom: 8px; }
.src-banner {
  display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 6px;
  background: hsl(var(--muted) / 0.45); border: 1px solid hsl(var(--border)); flex-wrap: wrap;
}
.src-badge { font-size: 11px; padding: 1px 7px; border-radius: 9px; border: 1px solid hsl(var(--border)); color: hsl(var(--muted-foreground)); background: hsl(var(--background)); }
.src-text { font-size: 12px; color: hsl(var(--muted-foreground)); }
.cfg-block { margin-bottom: 14px; }
.cfg-label { display: flex; align-items: center; gap: 8px; margin-bottom: 7px; font-size: 13px; font-weight: 500; color: hsl(var(--foreground)); }
.label-action { margin-left: auto; }

.cfg-note { font-size: 11px; font-weight: 400; color: hsl(var(--muted-foreground)); }
.ref-row { display: flex; gap: 8px; align-items: center; }
.ref-detail { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 8px; font-size: 12px; color: hsl(var(--muted-foreground)); }
.quota-mini { margin-top: 4px; border: 1px solid hsl(var(--border)); border-radius: 8px; overflow: hidden; }
.quota-mini .qm-row { display: flex; align-items: center; padding: 7px 12px; font-size: 12.5px; }
.quota-mini .qm-row + .qm-row { border-top: 1px solid hsl(var(--border) / 0.6); }
.quota-mini .qm-row:nth-child(odd) { background: hsl(var(--muted) / 0.25); }
.quota-mini .qm-name { width: 96px; flex-shrink: 0; color: hsl(var(--muted-foreground)); }
.quota-mini .qm-value { color: hsl(var(--foreground)); font-weight: 500; }
.ref-detail b { color: hsl(var(--foreground)); font-weight: 500; }
.opt-name { margin-right: 10px; }
.opt-meta { float: right; font-size: 12px; color: hsl(var(--muted-foreground)); }
.field-desc { font-size: 12px; color: hsl(var(--muted-foreground)); line-height: 1.65; margin-top: 6px; }
.field-desc b { color: hsl(var(--foreground)); font-weight: 500; }
.readonly-row { display: flex; align-items: center; gap: 8px; margin-top: 8px; font-size: 12px; }
.rd-key { color: hsl(var(--muted-foreground)); flex-shrink: 0; }
.rd-item { color: hsl(var(--foreground)); }
.warn-text { color: hsl(38 92% 42%); }
.cfg-inline { display: flex; align-items: center; gap: 10px; font-size: 13px; color: hsl(var(--foreground)); margin-bottom: 6px; }
.cfg-inline.col { flex-direction: column; align-items: flex-start; gap: 6px; }
.cfg-inline.col :deep(.el-input) { width: 100%; }
.holiday-mini { padding: 10px 12px; border-radius: 6px; background: hsl(var(--muted) / 0.4); border: 1px solid hsl(var(--border)); }
.mini-list { display: flex; flex-wrap: wrap; gap: 8px; }
.mini-item { font-size: 12px; color: hsl(var(--foreground)); background: hsl(var(--background)); padding: 2px 8px; border-radius: 10px; border: 1px solid hsl(var(--border)); }
.mini-source { margin-top: 8px; font-size: 11px; color: hsl(var(--muted-foreground)); }
.check-banner { font-size: 12px; padding: 8px 12px; border-radius: 6px; margin-bottom: 12px; line-height: 1.6; }
.check-banner.warn { background: hsl(38 92% 50% / 0.1); border: 1px solid hsl(38 92% 50% / 0.45); color: hsl(38 92% 35%); }
.check-banner.ok { background: hsl(150 60% 42% / 0.1); border: 1px solid hsl(150 60% 42% / 0.4); color: hsl(150 55% 30%); }
:deep(.el-drawer__body) { padding-top: 8px; }
:deep(.el-divider__text) { font-size: 13px; color: hsl(var(--muted-foreground)); background: hsl(var(--background)); }
</style>
