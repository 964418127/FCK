<template>
  <div class="work-calendar">
    <div class="page-header">
      <div class="page-head-row">
        <div class="head-left">
          <div class="header-main">
            <h1>工作日历</h1>
            <el-tag type="warning" effect="plain" size="small">预研稿 · 非结论</el-tag>
            <el-tag type="success" effect="plain" size="small">配置层 · P0</el-tag>
          </div>
          <p class="tip">
            日历按<strong>岗位</strong>配置：这个岗位的人，哪天该上班。左侧<strong>点岗位</strong>查阅日历；
            <strong>悬停岗位</strong>出现「配置」图标，点它就直接进入该岗位所在组的编辑态。
          </p>
        </div>
        <el-button type="primary" @click="openConfig">配置分组</el-button>
      </div>
    </div>

    <!-- 叠加顺序 -->
    <div class="layer-strip">
      <span class="strip-label">叠加顺序</span>
      <div class="layer-item"><span class="layer-chip">周基础模式</span></div>
      <span class="strip-arrow">→</span>
      <div class="layer-item"><span class="layer-chip">法定节假日</span></div>
      <span class="strip-arrow">→</span>
      <div class="layer-item"><span class="layer-chip">法定调班日</span></div>
      <span class="strip-arrow">→</span>
      <div class="layer-item"><span class="layer-chip on">组内特殊日</span></div>
      <div class="layer-note">
        后一层覆盖前一层；被覆盖的层仍保留痕迹，用来解释「这天为什么是工作日」。
      </div>
    </div>

    <el-row :gutter="16">
      <!-- ============ 左栏：按岗位查看（只读入口） ============ -->
      <el-col :span="6">
        <div class="section-card">
          <div class="card-header">
            <span class="card-title">按岗位查看</span>
            <span class="card-sub">共 {{ allJobNames.length }} 个岗位</span>
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
                @click="pickJob(n)"
              >
                <span class="job-line-name">{{ n }}</span>
                <span class="job-line-right">
                  <span class="job-line-group" :class="{ warn: !groupOfJob(n) }">
                    {{ groupOfJob(n) ? groupOfJob(n).name : '未分组' }}
                  </span>
                  <el-tooltip
                    :content="groupOfJob(n)
                      ? `配置「${groupOfJob(n).name}」的日历规则`
                      : '还没有日历 —— 选一个分组放进去'"
                    placement="left"
                    :show-after="200"
                  >
                    <el-icon class="job-edit" @click.stop="editJobGroup(n)">
                      <Edit v-if="groupOfJob(n)" />
                      <FolderAdd v-else />
                    </el-icon>
                  </el-tooltip>
                </span>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <!-- ============ 右栏：整屏日历（只读） ============ -->
      <el-col :span="18">
        <template v-if="currentGroup">
          <div class="section-card">
            <div class="card-header">
              <span class="card-title">
                {{ selectedJob || currentGroup.name }}
                <em class="card-title-sub">· 日历来自「{{ currentGroup.name }}」</em>
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
              <span class="sum-item plain">本组 {{ currentGroup.jobs.length }} 个岗位共用这份日历</span>
            </div>

            <div class="cal-grid">
              <div v-for="w in weekDays" :key="'h' + w" class="cal-head">周{{ w }}</div>
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

            <div v-if="selected" class="why-card">
              <div class="why-head">
                <span class="why-date">{{ selected.dateKey }} · 周{{ weekDays[selected.dow - 1] }}</span>
                <el-tag size="small" :type="selected.tagType" effect="plain">{{ selected.statusText }}</el-tag>
                <span class="why-for">{{ selectedJob }}（{{ currentGroup.name }}）</span>
              </div>
              <div class="why-chain">
                <div
                  v-for="(step, i) in selected.chain"
                  :key="i"
                  class="why-step"
                  :class="{ overridden: step.overridden }"
                >
                  <span class="step-idx">{{ i + 1 }}</span>
                  <span class="step-layer">{{ step.layer }}</span>
                  <span class="step-detail">{{ step.detail }}</span>
                  <span class="step-result">
                    {{ step.resultText }}
                    <em v-if="step.overridden">← 已被上层覆盖</em>
                  </span>
                </div>
              </div>
              <div class="why-foot">
                {{ selected.isWork
                  ? '这天是工作日：可以排班、也要履行打卡义务（若该岗位需打卡）；请假会扣掉一天额度。'
                  : '这天本来就不上班：不需要请假、不扣额度。请假若落在这一天，应在前端被拦下。' }}
              </div>
            </div>
            <div v-else class="empty-hint">
              点击日历上的任意一天，查看它是工作日还是休息日、以及为什么。
            </div>
          </div>
        </template>

        <!-- 未归组岗位的空态 -->
        <div v-else class="section-card">
          <div class="card-header">
            <span class="card-title">这个岗位还没有日历</span>
          </div>
          <div class="no-group">
            <div class="no-group-title">「{{ selectedJob }}」尚未归入任何分组</div>
            <div class="no-group-desc">
              工作日历是排班的前提 —— 不定哪天该上班，后面的排班与请假校验都无从谈起。
              把它归到一个已有的组（沿用该组日历），或者新建一个组。
            </div>
            <div class="no-group-actions">
              <el-button size="small" type="primary" @click="openConfig">去配置分组</el-button>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- ============ 配置态：抽屉 ============ -->
    <el-drawer
      v-model="configVisible"
      title="配置分组"
      size="620px"
      :modal="false"
    >
      <div class="drawer-body">
        <div class="drawer-intro">
          日历按岗位配置，工作日模式相同的岗位并成一组 —— <strong>分组的唯一含义是「这些岗位一样」</strong>。
          改一组，组内岗位同时生效，右侧日历会实时跟着变。点下面的分组名即可切换配置对象。
        </div>

        <div v-if="pendingJob" class="cmt-tip">
          「{{ pendingJob }}」还没有日历 —— 从下面选一个分组放进去（沿用该组规则），或者新建一个组。
        </div>

        <div class="grp-picker">
          <div
            v-for="g in groups"
            :key="g.id"
            class="grp-chip"
            :class="{ on: currentGroup && currentGroup.id === g.id }"
            @click="focusGroup(g)"
          >
            <span class="grp-chip-name">{{ g.name }}</span>
            <span class="grp-chip-num">{{ g.jobs.length }}</span>
          </div>
          <el-button size="small" @click="openGroupDialog">+ 新建分组</el-button>
        </div>

        <template v-if="currentGroup">
          <div class="cfg-banner">
            <span class="cfg-banner-label">正在配置</span>
            <span class="cfg-banner-name">{{ currentGroup.name }}</span>
            <span class="cfg-banner-sub">
              {{ currentGroup.jobs.length ? currentGroup.jobs.join('、') : '（空组）' }}
            </span>
          </div>

          <div class="cfg-block">
            <div class="cfg-label"><span>分组名称</span></div>
            <el-input v-model="currentGroup.name" size="small" style="max-width: 260px" />
            <div class="field-desc">只影响识别，不改变行为。</div>
          </div>

          <div class="cfg-block">
            <div class="cfg-label">
              <span>组内岗位</span>
              <span class="cfg-note">{{ currentGroup.jobs.length }} 个</span>
              <el-button size="small" @click="openAddDialog">+ 添加岗位</el-button>
            </div>
            <div class="job-chips editable">
              <span v-for="j in currentGroup.jobs" :key="j" class="job-chip removable">
                {{ j }}
                <i class="chip-x" title="移出该组" @click="removeJob(j)">×</i>
              </span>
              <span v-if="!currentGroup.jobs.length" class="job-empty">
                空组 —— 点右上「+ 添加岗位」把人放进来
              </span>
            </div>
            <div class="field-desc">
              移出后岗位回到「未分组」；添加一个已在别组的岗位，等于把它从原组挪过来 —— 岗位同时只能属于一个组。
            </div>
          </div>

          <div class="cfg-block">
            <div class="cfg-label">
              <span>工作日模式</span>
              <span class="cfg-note">叠加链的第 1 层</span>
            </div>
            <div class="preset-row">
              <el-button
                v-for="p in presets"
                :key="p.id"
                size="small"
                :type="samePattern(currentGroup.weekPattern, p.pattern) ? 'primary' : 'default'"
                @click="applyPreset(p)"
              >{{ p.label }}</el-button>
            </div>
            <div class="week-row">
              <div
                v-for="(w, i) in weekDays"
                :key="i"
                class="week-cell"
                :class="{ rest: !currentGroup.weekPattern[i] }"
                @click="toggleWeek(i)"
              >
                <span class="week-name">周{{ w }}</span>
                <span class="week-state">{{ currentGroup.weekPattern[i] ? '上班' : '休息' }}</span>
              </div>
            </div>
            <div class="field-desc">点击任一天可切换「上班 / 休息」，或直接套预置。</div>
          </div>

          <div class="cfg-block">
            <div class="cfg-label">
              <span>法定节假日口径</span>
              <span class="cfg-note">叠加链的第 2 层</span>
            </div>
            <el-radio-group v-model="currentGroup.holidayPolicy" class="policy-group">
              <el-radio v-for="p in policies" :key="p.value" :value="p.value">
                {{ p.label }}
              </el-radio>
            </el-radio-group>
            <div class="policy-desc">{{ policyDesc }}</div>

            <div class="holiday-mini">
              <div class="mini-title">本月法定节假日（国家级，只读）</div>
              <div class="mini-list">
                <span v-for="h in monthHolidays" :key="h.name" class="mini-item">
                  {{ h.name }} · {{ h.days }} 天
                </span>
                <span v-if="!monthHolidays.length" class="mini-empty">本月没有法定节假日</span>
              </div>
              <div class="mini-source">{{ statutoryCalendar.source }}</div>
            </div>
          </div>

          <div class="cfg-block last">
            <div class="cfg-label">
              <span>组内特殊日</span>
              <span class="cfg-note">叠加链的第 4 层 · 只作用于本组</span>
              <el-button size="small" type="primary" @click="openSpecialDialog">+ 新增特殊日</el-button>
            </div>

            <el-table v-if="currentGroup.specialDays.length" :data="currentGroup.specialDays" size="small">
              <el-table-column label="日期" width="160">
                <template #default="{ row }">
                  <span class="plain-text">{{ row.date }} {{ dowText(row.date) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="类型" width="110">
                <template #default="{ row }">
                  <el-tag size="small" effect="plain" :type="row.type === 'work' ? 'primary' : 'info'">
                    {{ typeLabel(row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="原因" min-width="150" prop="reason" />
              <el-table-column label="操作" width="80">
                <template #default="{ $index }">
                  <el-button size="small" link type="danger" @click="removeSpecial($index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <div v-else class="empty-hint">
              暂无特殊日。法定节假日之外的单日调整（团建、盘点、值班）放在这里，只影响本组岗位。
            </div>
          </div>

          <div class="drawer-foot">
            <el-popconfirm
              title="删除该分组？组内岗位会回到「未分组」。"
              confirm-button-text="删除"
              cancel-button-text="取消"
              @confirm="removeGroup"
            >
              <template #reference>
                <el-button size="small" link type="danger">删除分组</el-button>
              </template>
            </el-popconfirm>
          </div>
        </template>

        <div v-else class="empty-hint">请选择一个分组开始配置。</div>
      </div>
    </el-drawer>

    <!-- ============ 新建分组 ============ -->
    <el-dialog v-model="groupDialog" title="新建分组" width="620px">
      <div class="dlg-body">
        <div class="dlg-row">
          <div class="dlg-label">分组名称</div>
          <el-input v-model="groupForm.name" placeholder="如：门店夜班岗" style="max-width: 300px" />
        </div>

        <div class="dlg-row">
          <div class="dlg-label">
            工作日模式
            <em>建组时就定好，省得建完再回头改</em>
          </div>
          <div class="preset-row">
            <el-button
              v-for="p in presets"
              :key="p.id"
              size="small"
              :type="samePattern(groupForm.weekPattern, p.pattern) ? 'primary' : 'default'"
              @click="groupForm.weekPattern = [...p.pattern]"
            >{{ p.label }}</el-button>
          </div>
          <div class="week-row">
            <div
              v-for="(w, i) in weekDays"
              :key="i"
              class="week-cell"
              :class="{ rest: !groupForm.weekPattern[i] }"
              @click="toggleDialogWeek(i)"
            >
              <span class="week-name">周{{ w }}</span>
              <span class="week-state">{{ groupForm.weekPattern[i] ? '上班' : '休息' }}</span>
            </div>
          </div>
        </div>

        <div class="dlg-row">
          <div class="dlg-label">法定节假日口径</div>
          <el-radio-group v-model="groupForm.holidayPolicy">
            <el-radio v-for="p in policies" :key="p.value" :value="p.value">{{ p.label }}</el-radio>
          </el-radio-group>
        </div>

        <div class="dlg-row">
          <div class="dlg-label">
            把哪些岗位放进来
            <em>勾选即归入本组；已在别组的会从原组移出</em>
          </div>
          <div class="pick-list">
            <div
              v-for="j in jobPickList"
              :key="j.name"
              class="pick-item"
              :class="{ on: groupForm.picked.includes(j.name) }"
              @click="togglePick(j.name)"
            >
              <span class="pick-box">{{ groupForm.picked.includes(j.name) ? '✓' : '' }}</span>
              <span class="pick-name">{{ j.name }}</span>
              <span class="pick-from" :class="{ warn: j.grouped }">{{ j.from }}</span>
            </div>
          </div>
          <div class="field-desc">已勾选 {{ groupForm.picked.length }} 个岗位。</div>
        </div>
      </div>
      <template #footer>
        <el-button @click="groupDialog = false">取消</el-button>
        <el-button type="primary" @click="createGroup">创建</el-button>
      </template>
    </el-dialog>

    <!-- ============ 添加岗位到当前组 ============ -->
    <el-dialog v-model="addDialog" title="添加岗位" width="520px">
      <div class="dlg-body">
        <div class="dlg-row">
          <div class="dlg-label">
            加入「{{ currentGroup ? currentGroup.name : '' }}」
            <em>勾选后立即并入本组</em>
          </div>
          <div v-if="addPickList.length" class="pick-list">
            <div
              v-for="j in addPickList"
              :key="j.name"
              class="pick-item"
              :class="{ on: addPicked.includes(j.name) }"
              @click="toggleAdd(j.name)"
            >
              <span class="pick-box">{{ addPicked.includes(j.name) ? '✓' : '' }}</span>
              <span class="pick-name">{{ j.name }}</span>
              <span class="pick-from" :class="{ warn: j.grouped }">{{ j.from }}</span>
            </div>
          </div>
          <div v-else class="empty-hint">所有岗位都已经在这个组里了。</div>
        </div>
      </div>
      <template #footer>
        <el-button @click="addDialog = false">取消</el-button>
        <el-button type="primary" :disabled="!addPicked.length" @click="confirmAdd">加入</el-button>
      </template>
    </el-dialog>

    <!-- ============ 新增特殊日 ============ -->
    <el-dialog v-model="specialDialog" title="新增特殊日" width="520px">
      <el-form :model="specialForm" label-width="88px">
        <el-form-item label="日期">
          <el-date-picker
            v-model="specialForm.date"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="specialForm.type" style="width: 100%;">
            <el-option v-for="t in specialDayTypes" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
          <div class="field-desc">{{ typeDesc }}</div>
        </el-form-item>
        <el-form-item label="原因">
          <el-input v-model="specialForm.reason" placeholder="如：门店年度盘点，歇业一天" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="specialDialog = false">取消</el-button>
        <el-button type="primary" @click="saveSpecial">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit, FolderAdd } from '@element-plus/icons-vue'
import {
  statutoryCalendar,
  calendarJobGroups,
  holidayPolicies,
  weekPatternPresets,
  specialDayTypes,
  organizations,
  jobs as allJobsMeta
} from '../../mock/leaveAttendance.js'

const weekDays = ['一', '二', '三', '四', '五', '六', '日']
const presets = weekPatternPresets
const policies = holidayPolicies

/* 页面内可编辑副本 —— 原型不落库，刷新即还原 */
const groups = reactive(
  calendarJobGroups.map(g => ({
    ...g,
    jobs: [...g.jobs],
    weekPattern: [...g.weekPattern],
    specialDays: g.specialDays.map(d => ({ ...d }))
  }))
)

/* 预览对象 = 岗位（人按岗位想事）；配置对象 = 该岗位所在的组 */
const selectedJob = ref(groups[0] && groups[0].jobs[0] ? groups[0].jobs[0] : '')
const selectedGroupId = ref(groups[0] ? groups[0].id : '')
const currentGroup = computed(() => groups.find(g => g.id === selectedGroupId.value) || null)

const allJobNames = allJobsMeta.map(j => j.name)
const groupOfJob = (name) => groups.find(g => g.jobs.includes(name)) || null

const viewYear = ref(2026)
const viewMonth = ref(10)
const selectedKey = ref('')

const pad = n => String(n).padStart(2, '0')
const dateKeyOf = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`
const dowOf = (y, m, d) => {
  const g = new Date(y, m - 1, d).getDay()
  return g === 0 ? 7 : g
}

const samePattern = (a, b) => a.length === b.length && a.every((v, i) => v === b[i])
const policyLabel = (v) => (policies.find(p => p.value === v) || {}).label || v
const policyDesc = computed(() => {
  if (!currentGroup.value) return ''
  return (policies.find(p => p.value === currentGroup.value.holidayPolicy) || {}).desc || ''
})
const typeLabel = (v) => (specialDayTypes.find(t => t.value === v) || {}).label || v
const typeDesc = computed(() => (specialDayTypes.find(t => t.value === specialForm.type) || {}).desc || '')
const dowText = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return '周' + weekDays[dowOf(y, m, d) - 1]
}

/** 周模式 → 人话 */
const patternText = (pattern) => {
  const rest = pattern.map((v, i) => (v === 0 ? i : -1)).filter(i => i >= 0)
  if (!rest.length) return '全月排班（无固定休息日）'
  if (rest.length === 7) return '全周休息'
  if (rest.length === 2 && rest[0] === 5 && rest[1] === 6) return '周末双休'
  if (rest.length === 1) return `每周单休（周${weekDays[rest[0]]}）`
  return '休 ' + rest.map(i => '周' + weekDays[i]).join('、')
}

const findHoliday = key => statutoryCalendar.holidays.find(h => key >= h.start && key <= h.end)
const findMakeup = key => statutoryCalendar.makeupWorkdays.find(m => m.date === key)

/** 单日判定：四层依次叠加，逐层记录是否被上层覆盖 */
const resolveDay = (y, m, d) => {
  const g = currentGroup.value
  const key = dateKeyOf(y, m, d)
  const dow = dowOf(y, m, d)
  const chain = []

  let isWork = g.weekPattern[dow - 1] === 1
  let cls = isWork ? 'work' : 'rest'
  let statusText = isWork ? '工作日' : '休息日'
  let tagType = isWork ? 'primary' : 'info'
  let label = ''

  chain.push({
    layer: '周基础模式',
    detail: patternText(g.weekPattern),
    resultText: isWork ? '工作日' : '休息日',
    workState: isWork
  })

  const holiday = findHoliday(key)
  if (holiday) {
    label = holiday.name
    if (g.holidayPolicy === 'rest') {
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
    if (g.holidayPolicy === 'rest') {
      isWork = true
      label = '调班上班'
      cls = 'makeup'
      statusText = '法定调班日 · 上班'
      tagType = 'warning'
      chain.push({
        layer: '法定调班日',
        detail: makeup.note,
        resultText: '工作日',
        workState: true
      })
    } else {
      chain.push({
        layer: '法定调班日',
        detail: `${makeup.note}（门店本就营业，无影响）`,
        resultText: '不适用',
        workState: null
      })
    }
  }

  const special = (g.specialDays || []).find(s => s.date === key)
  if (special) {
    isWork = special.type === 'work'
    label = '特殊日'
    cls = isWork ? 'special-work' : 'special-rest'
    statusText = isWork ? '特殊日 · 临时上班' : '特殊日 · 临时休息'
    tagType = 'warning'
    chain.push({
      layer: '组内特殊日',
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
  if (!currentGroup.value) return []
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
  if (!selectedKey.value || !currentGroup.value) return null
  const [y, m, d] = selectedKey.value.split('-').map(Number)
  return resolveDay(y, m, d)
})

const stats = computed(() => {
  const cells = calendarCells.value.filter(Boolean)
  return {
    work: cells.filter(c => c.isWork).length,
    rest: cells.filter(c => !c.isWork).length,
    holiday: cells.filter(c => c.cls === 'holiday' || c.cls === 'holiday-biz').length,
    makeup: cells.filter(c => c.cls === 'makeup').length
  }
})

const monthHolidays = computed(() => {
  const prefix = `${viewYear.value}-${pad(viewMonth.value)}`
  const start = `${prefix}-01`
  const end = `${prefix}-31`
  return statutoryCalendar.holidays.filter(h => h.start <= end && h.end >= start)
})

const legends = [
  { cls: 'work', text: '工作日' },
  { cls: 'rest', text: '休息日' },
  { cls: 'holiday', text: '法定节假日 · 休息' },
  { cls: 'holiday-biz', text: '法定节假日 · 营业' },
  { cls: 'makeup', text: '调班上班' },
  { cls: 'special-work', text: '特殊日 · 上班' },
  { cls: 'special-rest', text: '特殊日 · 休息' }
]

const shiftMonth = (delta) => {
  let m = viewMonth.value + delta
  let y = viewYear.value
  if (m < 1) { m = 12; y -= 1 }
  if (m > 12) { m = 1; y += 1 }
  viewYear.value = y
  viewMonth.value = m
  selectedKey.value = ''
}

/* ---------- 预览态：按岗位选（组由岗位派生） ---------- */
const pickJob = (name) => {
  const g = groupOfJob(name)
  selectedGroupId.value = g ? g.id : ''
  selectedJob.value = name
  selectedKey.value = ''
  pendingJob.value = ''
}

/* ---------- 配置态：抽屉 ---------- */
const configVisible = ref(false)
const pendingJob = ref('')      // 被点进来、但还没归组的岗位

const focusGroup = (g) => {
  selectedGroupId.value = g.id
  if (pendingJob.value) {
    // 从未分组岗位点进来：此刻选组 = 要把这个岗位放进去
    const name = pendingJob.value
    groups.forEach(x => { x.jobs = x.jobs.filter(j => j !== name) })
    if (!g.jobs.includes(name)) g.jobs.push(name)
    selectedJob.value = name
    pendingJob.value = ''
    ElMessage.success(`「${name}」已归入「${g.name}」，沿用该组日历`)
  } else if (!g.jobs.includes(selectedJob.value)) {
    selectedJob.value = g.jobs[0] || ''
  }
  selectedKey.value = ''
}

const openConfig = () => {
  if (!currentGroup.value && groups.length) {
    pendingJob.value = ''      // 通用入口：不代表某个待归组岗位
    focusGroup(groups[0])
  }
  configVisible.value = true
}

/** 左侧岗位行悬停出的配置入口：进该岗位所在组的编辑态 */
const editJobGroup = (name) => {
  const g = groupOfJob(name)
  selectedJob.value = name
  selectedKey.value = ''
  if (g) {
    selectedGroupId.value = g.id
    pendingJob.value = ''
  } else {
    selectedGroupId.value = ''
    pendingJob.value = name
  }
  configVisible.value = true
}

/* ---------- 组内配置 ---------- */
const applyPreset = (p) => {
  currentGroup.value.weekPattern = [...p.pattern]
  ElMessage.success(`「${currentGroup.value.name}」已应用「${p.label}」`)
}

const toggleWeek = (i) => {
  const next = [...currentGroup.value.weekPattern]
  next[i] = next[i] ? 0 : 1
  currentGroup.value.weekPattern = next
}

const removeJob = (name) => {
  const g = currentGroup.value
  g.jobs = g.jobs.filter(j => j !== name)
  if (selectedJob.value === name) selectedJob.value = g.jobs[0] || ''
  ElMessage.success(`「${name}」已移出，回到「未分组」`)
}

/* ---------- 添加岗位 ---------- */
const addDialog = ref(false)
const addPicked = ref([])

const addPickList = computed(() => {
  if (!currentGroup.value) return []
  return allJobNames
    .filter(n => !currentGroup.value.jobs.includes(n))
    .map(n => {
      const g = groupOfJob(n)
      return { name: n, from: g ? `从「${g.name}」移入` : '未分组', grouped: !!g }
    })
})

const openAddDialog = () => {
  addPicked.value = []
  addDialog.value = true
}
const toggleAdd = (name) => {
  addPicked.value = addPicked.value.includes(name)
    ? addPicked.value.filter(n => n !== name)
    : [...addPicked.value, name]
}
const confirmAdd = () => {
  const g = currentGroup.value
  addPicked.value.forEach(name => {
    groups.forEach(x => { x.jobs = x.jobs.filter(j => j !== name) })
    g.jobs.push(name)
  })
  ElMessage.success(`已把 ${addPicked.value.length} 个岗位并入「${g.name}」`)
  if (!selectedJob.value) selectedJob.value = g.jobs[0] || ''
  addDialog.value = false
}

/* ---------- 新建分组 ---------- */
const groupDialog = ref(false)
const groupForm = reactive({
  name: '',
  weekPattern: [1, 1, 1, 1, 1, 0, 0],
  holidayPolicy: 'rest',
  picked: []
})

const jobPickList = computed(() => allJobNames.map(n => {
  const g = groupOfJob(n)
  return { name: n, from: g ? `已在「${g.name}」，将移入本组` : '未分组', grouped: !!g }
}))

const openGroupDialog = () => {
  Object.assign(groupForm, {
    name: '',
    weekPattern: currentGroup.value ? [...currentGroup.value.weekPattern] : [1, 1, 1, 1, 1, 0, 0],
    holidayPolicy: currentGroup.value ? currentGroup.value.holidayPolicy : 'rest',
    picked: selectedJob.value && !groupOfJob(selectedJob.value) ? [selectedJob.value] : []
  })
  groupDialog.value = true
}

const toggleDialogWeek = (i) => {
  const next = [...groupForm.weekPattern]
  next[i] = next[i] ? 0 : 1
  groupForm.weekPattern = next
}

const togglePick = (name) => {
  groupForm.picked = groupForm.picked.includes(name)
    ? groupForm.picked.filter(n => n !== name)
    : [...groupForm.picked, name]
}

const createGroup = () => {
  if (!groupForm.name.trim()) {
    ElMessage.warning('请填写分组名称')
    return
  }
  const g = {
    id: 'grp-' + Date.now(),
    name: groupForm.name.trim(),
    basis: groupForm.picked.length
      ? `自定义分组（原型内新建）：${patternText(groupForm.weekPattern)}，法定节假日${policyLabel(groupForm.holidayPolicy)}。`
      : '自定义分组（原型内新建），尚未加入岗位。',
    jobs: [],
    weekPattern: [...groupForm.weekPattern],
    holidayPolicy: groupForm.holidayPolicy,
    specialDays: []
  }
  groupForm.picked.forEach(name => {
    groups.forEach(x => { x.jobs = x.jobs.filter(j => j !== name) })
    g.jobs.push(name)
  })
  groups.push(g)
  selectedGroupId.value = g.id
  selectedJob.value = g.jobs[0] || ''
  selectedKey.value = ''
  pendingJob.value = ''
  groupDialog.value = false
  ElMessage.success(
    g.jobs.length
      ? `已新建「${g.name}」，${g.jobs.length} 个岗位已归入`
      : `已新建「${g.name}」（空组），可继续添加岗位`
  )
}

const removeGroup = () => {
  const idx = groups.findIndex(g => g.id === selectedGroupId.value)
  if (idx < 0) return
  const [removed] = groups.splice(idx, 1)
  const next = groups[idx] || groups[idx - 1] || groups[0] || null
  selectedGroupId.value = next ? next.id : ''
  selectedJob.value = next && next.jobs[0] ? next.jobs[0] : ''
  selectedKey.value = ''
  ElMessage.success(`已删除「${removed.name}」，组内岗位回到「未分组」`)
}

/* ---------- 特殊日 ---------- */
const specialDialog = ref(false)
const specialForm = reactive({ date: '', type: 'work', reason: '' })

const openSpecialDialog = () => {
  Object.assign(specialForm, {
    date: `${viewYear.value}-${pad(viewMonth.value)}-05`,
    type: 'work',
    reason: ''
  })
  specialDialog.value = true
}

const saveSpecial = () => {
  if (!specialForm.date) {
    ElMessage.warning('请选择日期')
    return
  }
  if (!specialForm.reason.trim()) {
    ElMessage.warning('请填写原因，日历上要能解释清楚')
    return
  }
  if (currentGroup.value.specialDays.some(s => s.date === specialForm.date)) {
    ElMessage.warning('该日期已存在特殊日配置')
    return
  }
  currentGroup.value.specialDays.push({ ...specialForm })
  specialDialog.value = false
  ElMessage.success('已新增特殊日，日历同步更新')
}

const removeSpecial = (idx) => {
  currentGroup.value.specialDays.splice(idx, 1)
  ElMessage.success('已删除')
}
</script>

<style scoped>
.work-calendar {
  padding: 0;
}

.page-header {
  margin-bottom: 20px;
}

/* 页头：左说明 + 右「配置分组」入口 */
.page-head-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.head-left {
  min-width: 0;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: hsl(var(--foreground));
}

.page-header .tip {
  color: hsl(var(--muted-foreground));
  font-size: 14px;
  margin: 0;
  line-height: 1.7;
  max-width: 880px;
}

.page-header .tip strong {
  color: hsl(var(--foreground));
  font-weight: 600;
}

/* 左栏：按岗位查看 */
.job-pane {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-height: 640px;
  overflow-y: auto;
  padding-right: 4px;
}

.org-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.org-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px 2px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.org-title em {
  font-style: normal;
}

.job-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 7px 10px;
  border: 1px solid transparent;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.job-line:hover {
  background: hsl(var(--muted) / 0.5);
}

.job-line.active {
  background: hsl(var(--primary) / 0.1);
  border-color: hsl(var(--primary) / 0.4);
}

.job-line-name {
  font-size: 13px;
  color: hsl(var(--foreground));
}

.job-line.active .job-line-name {
  font-weight: 500;
  color: hsl(var(--primary));
}

.job-line-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: none;
}

.job-line-group {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  white-space: nowrap;
}

.job-line-group.warn {
  color: hsl(var(--destructive));
}

/* 悬停才出现的配置入口：固定占位，避免出现时行内抖动 */
.job-edit {
  width: 18px;
  height: 18px;
  font-size: 13px;
  border-radius: 4px;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  visibility: hidden;
  transition: color 0.15s ease, background 0.15s ease;
}

.job-line:hover .job-edit,
.job-line.active .job-edit {
  visibility: visible;
}

.job-edit:hover {
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.12);
}

/* 叠加顺序条 */
.layer-strip {
  display: flex;
  align-items: center;
  gap: 12px;
  background: hsl(var(--primary) / 0.04);
  border: 1px solid hsl(var(--primary) / 0.18);
  border-radius: 8px;
  padding: 14px 18px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.strip-label {
  font-size: 12px;
  font-weight: 600;
  color: hsl(var(--primary));
}

.layer-item {
  display: flex;
  align-items: center;
}

.layer-chip {
  font-size: 12px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 10px;
  border: 1px dashed hsl(var(--primary) / 0.35);
  color: hsl(var(--primary));
  background: hsl(var(--background));
}

.layer-chip.on {
  border-style: solid;
  background: hsl(var(--primary) / 0.08);
}

.strip-arrow {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.layer-note {
  flex: 1;
  min-width: 220px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  border-left: 1px dashed hsl(var(--primary) / 0.3);
  padding-left: 16px;
  line-height: 1.6;
}

/* 卡片 */
.section-card {
  background: hsl(var(--background));
  border-radius: 8px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid hsl(var(--border));
  flex-wrap: wrap;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--foreground));
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-no {
  font-style: normal;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground, 0 0% 100%));
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
}

.card-title-sub {
  font-style: normal;
  font-size: 12px;
  font-weight: 400;
  color: hsl(var(--muted-foreground));
  margin-left: 6px;
}

.card-sub {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.card-intro {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  line-height: 1.6;
  margin: -6px 0 12px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 岗位与分组 */
.group-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.job-group {
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  padding: 12px 14px;
  transition: all 0.18s ease;
  cursor: pointer;
}

.job-group:hover {
  border-color: hsl(var(--primary) / 0.55);
}

.job-group.active {
  border-color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.04);
  box-shadow: 0 0 0 1px hsl(var(--primary) / 0.28);
}

.job-group.ungrouped {
  border-style: dashed;
  background: hsl(var(--muted) / 0.3);
  cursor: default;
}

.group-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.group-name {
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.group-badge {
  font-size: 11px;
  font-weight: 500;
  padding: 1px 7px;
  border-radius: 9px;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground, 0 0% 100%));
}

.group-count {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  margin-left: auto;
}

.group-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  margin-top: 5px;
}

.meta-dot {
  opacity: 0.5;
}

.group-basis {
  margin-top: 9px;
  padding-top: 8px;
  border-top: 1px dashed hsl(var(--border));
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.job-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.job-chip {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 12px;
  border: 1px solid hsl(var(--primary) / 0.3);
  color: hsl(var(--primary));
  background: hsl(var(--background));
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.job-chip:hover {
  border-color: hsl(var(--primary));
}

.job-chip.picked {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground, 0 0% 100%));
  font-weight: 500;
}

.job-chip.plain {
  border-color: hsl(var(--border));
  color: hsl(var(--muted-foreground));
}

.job-chip.plain.picked {
  background: hsl(var(--muted-foreground));
  border-color: hsl(var(--muted-foreground));
  color: hsl(var(--background));
}

.job-chip.removable {
  padding-right: 6px;
  cursor: default;
}

.chip-x {
  font-style: normal;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  line-height: 1;
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.12);
  cursor: pointer;
  transition: all 0.15s ease;
}

.chip-x:hover {
  background: hsl(0 84% 60%);
  color: #fff;
}

.job-empty {
  font-size: 12px;
  color: hsl(var(--muted-foreground) / 0.85);
}

/* 正在配置横幅 */
.cfg-banner {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
  padding: 10px 14px;
  border-radius: 6px;
  background: hsl(var(--primary) / 0.07);
  border: 1px solid hsl(var(--primary) / 0.2);
  margin-bottom: 18px;
}

.cfg-banner-label {
  font-size: 11px;
  color: hsl(var(--primary));
  border: 1px solid hsl(var(--primary) / 0.4);
  border-radius: 9px;
  padding: 1px 7px;
}

.cfg-banner-name {
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.cfg-banner-sub {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

/* 配置块 */
.cfg-block {
  padding-bottom: 18px;
  margin-bottom: 18px;
  border-bottom: 1px dashed hsl(var(--border));
}

.cfg-block.last {
  padding-bottom: 0;
  margin-bottom: 0;
  border-bottom: none;
}

.cfg-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin-bottom: 10px;
}

.cfg-note {
  font-size: 11px;
  font-weight: 400;
  color: hsl(var(--muted-foreground));
}

.cfg-label .el-button {
  margin-left: auto;
}

.preset-row {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.job-chips.editable {
  margin-top: 0;
}

/* 周模式 */
.week-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.week-cell {
  border: 1px solid hsl(var(--primary) / 0.35);
  background: hsl(var(--primary) / 0.06);
  border-radius: 6px;
  padding: 8px 0;
  text-align: center;
  cursor: pointer;
  transition: all 0.18s ease;
}

.week-cell:hover {
  border-color: hsl(var(--primary));
}

.week-cell.rest {
  border-color: hsl(var(--border));
  border-style: dashed;
  background: hsl(var(--muted) / 0.4);
}

.week-name {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.week-state {
  display: block;
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  margin-top: 2px;
}

/* 节假日口径 */
.policy-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.policy-desc {
  margin-top: 6px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  line-height: 1.6;
  padding: 8px 10px;
  background: hsl(var(--muted) / 0.35);
  border-radius: 6px;
}

.holiday-mini {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed hsl(var(--border));
}

.mini-title {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  margin-bottom: 8px;
}

.mini-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.mini-item {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background: hsl(var(--primary) / 0.08);
  color: hsl(var(--primary));
}

.mini-empty {
  font-size: 12px;
  color: hsl(var(--muted-foreground) / 0.8);
}

.mini-source {
  margin-top: 8px;
  font-size: 11px;
  color: hsl(var(--muted-foreground) / 0.8);
}

/* 日历 */
.month-label {
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--foreground));
  min-width: 118px;
  text-align: center;
}

.summary-row {
  display: flex;
  gap: 22px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.sum-item {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.sum-item b {
  font-size: 16px;
  color: hsl(var(--foreground));
  margin-right: 2px;
}

.sum-item.plain {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  opacity: 0.9;
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.cal-head {
  text-align: center;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  padding-bottom: 6px;
}

.cal-cell {
  min-height: 88px;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  padding: 9px 11px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: hsl(var(--background));
}

.cal-cell:hover {
  border-color: hsl(var(--primary) / 0.6);
}

.cal-cell.blank {
  border: none;
  cursor: default;
  background: transparent;
}

.cal-cell.picked {
  box-shadow: 0 0 0 2px hsl(var(--primary) / 0.5);
}

.cal-day {
  font-size: 17px;
  font-weight: 600;
  color: hsl(var(--foreground));
  line-height: 1.2;
}

.cal-tag {
  font-size: 11px;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cal-cell.rest {
  border-style: dashed;
  background: hsl(var(--muted) / 0.35);
}

.cal-cell.rest .cal-day {
  color: hsl(var(--muted-foreground));
}

.cal-cell.holiday {
  background: hsl(0 84% 60% / 0.1);
  border-color: hsl(0 84% 60% / 0.35);
  border-style: solid;
}

.cal-cell.holiday .cal-day,
.cal-cell.holiday .cal-tag {
  color: hsl(0 65% 42%);
}

.cal-cell.holiday-biz {
  background: hsl(32 95% 52% / 0.1);
  border-color: hsl(32 95% 52% / 0.35);
}

.cal-cell.holiday-biz .cal-day,
.cal-cell.holiday-biz .cal-tag {
  color: hsl(26 78% 38%);
}

.cal-cell.makeup {
  background: hsl(var(--primary) / 0.1);
  border-color: hsl(var(--primary) / 0.4);
  border-style: solid;
}

.cal-cell.makeup .cal-day,
.cal-cell.makeup .cal-tag {
  color: hsl(var(--primary));
}

.cal-cell.special-work,
.cal-cell.special-rest {
  background: hsl(262 83% 58% / 0.1);
  border-color: hsl(262 83% 58% / 0.38);
  border-style: solid;
}

.cal-cell.special-work .cal-day,
.cal-cell.special-work .cal-tag,
.cal-cell.special-rest .cal-day,
.cal-cell.special-rest .cal-tag {
  color: hsl(262 60% 44%);
}

/* 图例 */
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed hsl(var(--border));
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  border: 1px solid hsl(var(--border));
  background: hsl(var(--background));
  display: inline-block;
}

.legend-dot.rest {
  border-style: dashed;
  background: hsl(var(--muted) / 0.6);
}

.legend-dot.holiday {
  background: hsl(0 84% 60% / 0.18);
  border-color: hsl(0 84% 60% / 0.5);
}

.legend-dot.holiday-biz {
  background: hsl(32 95% 52% / 0.18);
  border-color: hsl(32 95% 52% / 0.5);
}

.legend-dot.makeup {
  background: hsl(var(--primary) / 0.18);
  border-color: hsl(var(--primary) / 0.5);
}

.legend-dot.special-work,
.legend-dot.special-rest {
  background: hsl(262 83% 58% / 0.18);
  border-color: hsl(262 83% 58% / 0.5);
}

/* 归因卡 */
.why-card {
  margin-top: 18px;
  border: 1px solid hsl(var(--primary) / 0.22);
  background: hsl(var(--primary) / 0.035);
  border-radius: 8px;
  padding: 16px 18px;
}

.why-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.why-date {
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.why-for {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.why-chain {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.why-step {
  display: grid;
  grid-template-columns: 22px 96px 1fr auto;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  padding: 8px 10px;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.why-step.overridden {
  opacity: 0.62;
}

.why-step.overridden .step-result {
  text-decoration: line-through;
  text-decoration-color: hsl(var(--muted-foreground) / 0.6);
}

.step-idx {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: hsl(var(--primary) / 0.12);
  color: hsl(var(--primary));
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-layer {
  font-weight: 500;
  color: hsl(var(--foreground));
}

.step-detail {
  color: hsl(var(--muted-foreground));
  font-size: 12px;
}

.step-result {
  font-size: 12px;
  color: hsl(var(--foreground));
  white-space: nowrap;
}

.step-result em {
  font-style: normal;
  color: hsl(var(--muted-foreground));
  margin-left: 6px;
}

.why-foot {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed hsl(var(--primary) / 0.25);
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  line-height: 1.7;
}

/* 空态 */
.no-group {
  padding: 4px;
}

.no-group-title {
  font-size: 15px;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin-bottom: 8px;
}

.no-group-desc {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  line-height: 1.7;
  max-width: 620px;
  margin-bottom: 16px;
}

.no-group-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* 弹窗内布局 */
.dlg-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dlg-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dlg-label {
  font-size: 13px;
  font-weight: 600;
  color: hsl(var(--foreground));
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.dlg-label em {
  font-style: normal;
  font-size: 12px;
  font-weight: 400;
  color: hsl(var(--muted-foreground));
}

.pick-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.pick-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pick-item:hover {
  border-color: hsl(var(--primary) / 0.6);
}

.pick-item.on {
  border-color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.06);
}

.pick-box {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid hsl(var(--border));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #fff;
  flex: none;
}

.pick-item.on .pick-box {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
}

.pick-name {
  font-size: 13px;
  color: hsl(var(--foreground));
}

.pick-from {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  margin-left: auto;
  white-space: nowrap;
}

.pick-from.warn {
  color: hsl(32 78% 42%);
}

/* 其他 */
.empty-hint {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  padding: 14px 0 4px;
}

.plain-text {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.field-desc {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  line-height: 1.6;
  margin-top: 4px;
}

/* ===== 配置态：抽屉 ===== */
.drawer-body {
  display: flex;
  flex-direction: column;
  padding: 0 2px 24px;
}

.drawer-intro {
  margin-bottom: 16px;
  padding: 10px 12px;
  font-size: 12.5px;
  line-height: 1.7;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--muted) / 0.45);
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.drawer-intro strong {
  color: hsl(var(--foreground));
}

/* 从未分组岗位点进来的提示 */
.cmt-tip {
  margin: -8px 0 14px;
  padding: 9px 12px;
  font-size: 12.5px;
  line-height: 1.7;
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.07);
  border: 1px solid hsl(var(--primary) / 0.25);
  border-radius: 8px;
}

.grp-picker {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.grp-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  font-size: 13px;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.grp-chip:hover {
  border-color: hsl(var(--primary) / 0.6);
}

.grp-chip.on {
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.1);
  border-color: hsl(var(--primary) / 0.5);
}

.grp-chip-num {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
}

.grp-chip.on .grp-chip-num {
  color: hsl(var(--primary));
}

.drawer-foot {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid hsl(var(--border));
}
</style>
