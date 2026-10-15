<template>
  <div class="job-leave-mode">
    <div class="page-header">
      <div class="header-main">
        <h1>假勤模式</h1>
        <el-tag type="warning" effect="plain" size="small">预研稿 · 非结论</el-tag>
        <el-tag type="success" effect="plain" size="small">配置层 · P0</el-tag>
      </div>
      <p class="tip">
        假勤最终只交付<strong>休假时长</strong>；带薪与否是<strong>假种的属性</strong>（年假、婚假都带薪），不在这页配。
        扣不扣款由模块化薪酬取走时长后自行决定。本页按岗位只声明四件事：
        要不要排班、要不要打卡、<strong>班次假</strong>额度、<strong>临时假</strong>额度。
      </p>
    </div>

    <div class="section-card">
      <div class="card-header">
        <span class="card-title">按岗位声明</span>
        <span class="card-sub">
          岗位来自「岗位台账」（组织架构维护，只读）—— 本页不新增、不删除岗位
        </span>
        <div class="header-actions">
          <el-button size="small" @click="go('leave-job-roster')">岗位台账</el-button>
          <el-input
            v-model="keyword"
            placeholder="搜索岗位"
            clearable
            size="small"
            style="width: 180px;"
          />
        </div>
      </div>

      <el-table :data="filteredJobs" size="small" class="job-table">
        <el-table-column label="岗位" min-width="168">
          <template #default="{ row }">
            <div class="job-cell">
              <span class="job-name" title="主数据 · 只读引用"><i class="lock">◾</i>{{ row.name }}</span>
              <span class="job-count">{{ row.headcount }} 人</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="考勤方式" min-width="150">
          <template #default="{ row }">
            <span class="mode-text">{{ attendanceMode(row) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="班次假" min-width="150">
          <template #default="{ row }">
            <span class="quota-text" :class="{ none: row.shiftQuota === '无' }">{{ row.shiftQuota }}</span>
          </template>
        </el-table-column>

        <el-table-column label="临时假" min-width="170">
          <template #default="{ row }">
            <span class="quota-text" :class="{ none: row.tempQuota === '无' }">{{ row.tempQuota }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="84" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="openDialog(row)">配置</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-foot">
        额度是本页的<b>声明值</b>，实际发放与计算在现有额度模块；移动端请假扣减顺序（班次假 → 临时假 → 超出记录）
        属「移动端假勤」模块，不在此配置。改「这个岗位哪天算上班」去
        <el-button size="small" link type="primary" @click="go('leave-work-calendar')">工作日历</el-button>
        ，改「某种假本身放几天」去
        <el-button size="small" link type="primary" @click="go('leave-type-dictionary')">假种字典</el-button>
        。
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="`配置假勤模式 · ${form.name}`"
      width="700px"
    >
      <div class="src-banner">
        <span class="src-badge">主数据 · 只读</span>
        <span class="src-text">
          {{ form.name }} · {{ form.headcount }} 人 · 所属组织「{{ orgName }}」
          —— 来自组织架构，本页不可修改
        </span>
      </div>

      <el-form :model="form" label-width="112px" class="job-form">
        <el-divider content-position="left">「勤」怎么记</el-divider>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="参与排班">
              <el-switch v-model="form.schedule" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="需要打卡">
              <el-switch v-model="form.attendance" />
            </el-form-item>
          </el-col>
        </el-row>
        <div class="field-desc">
          排班产出「计划」、打卡产出「实际」，两者对不上就是考勤异常。不排班 ≠ 没有工作日历 ——
          日历仍然用于请假校验与长假口径。
        </div>

        <el-divider content-position="left">休假额度</el-divider>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="班次假">
              <el-input v-model="form.shiftQuota" placeholder="如：4 天 / 月（32 小时）；无则填「无」" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="临时假">
              <el-input v-model="form.tempQuota" placeholder="如：≤ 16 小时 / 月；无则填「无」" />
            </el-form-item>
          </el-col>
        </el-row>
        <div class="field-desc">
          班次假 = 每月固定给的休假额度；临时假 = 按上月业绩折算的额度，有上限、仅部分岗位有。
          假勤只登记这两个值，实际发放与计算由现有额度模块负责（来源：{{ labelOf(quotaSources, form.quotaSource) }}）。
          移动端请假时依次扣：班次假 → 临时假 → 超出记时长；超出部分扣不扣薪资由薪酬按岗位配置，不在此配。
        </div>

        <el-divider content-position="left">生效与影响</el-divider>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="配置下沉">
              <el-select v-model="form.configDepth" style="width: 100%;">
                <el-option
                  v-for="c in configDepths"
                  :key="c.value"
                  :label="c.label"
                  :value="c.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="请假连带性">
              <el-select v-model="form.substitutable" style="width: 100%;">
                <el-option
                  v-for="s in substitutabilityLevels"
                  :key="s.value"
                  :label="s.label"
                  :value="s.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <div class="field-desc">{{ labelOf(substitutabilityLevels, form.substitutable, 'desc') }}</div>

        <el-form-item label="备注">
          <el-input v-model="form.note" type="textarea" :rows="2" placeholder="说明该岗位的假勤特点" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  jobs as rawJobs,
  orgOf,
  quotaSources,
  substitutabilityLevels,
  configDepths
} from '../../mock/leaveAttendance.js'

const router = useRouter()
const go = (name) => router.push({ name })
const jobList = ref(rawJobs.map(j => ({ ...j })))
const keyword = ref('')

const filteredJobs = computed(() => {
  const k = keyword.value.trim()
  if (!k) return jobList.value
  return jobList.value.filter(j => j.name.includes(k))
})

const labelOf = (list, value, field = 'label') => {
  const hit = list.find(i => i.value === value)
  return hit ? hit[field] : value
}

/** 考勤方式：排班与打卡两个开关的组合，直接说人话 */
const attendanceMode = (row) => {
  if (row.schedule && row.attendance) return '排班 + 打卡'
  if (row.schedule) return '仅排班（不打卡）'
  if (row.attendance) return '仅打卡（不排班）'
  return '不排班不打卡'
}

const dialogVisible = ref(false)

const emptyForm = () => ({
  id: '',
  name: '',
  headcount: 0,
  schedule: true,
  attendance: true,
  quotaSource: 'fixed',
  shiftQuota: '无',
  tempQuota: '无',
  substitutable: 'medium',
  configDepth: 'store',
  note: ''
})

const form = reactive(emptyForm())

const orgName = computed(() => (orgOf(form.name) || {}).name || '—')

/** 只接受已有岗位 —— 岗位主数据不可在此新建 */
const openDialog = (row) => {
  if (!row) return
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

const save = () => {
  const idx = jobList.value.findIndex(j => j.id === form.id)
  if (idx !== -1) jobList.value[idx] = { ...form }
  dialogVisible.value = false
  ElMessage.success(`「${form.name}」的假勤模式已更新，将于次月生效`)
}
</script>

<style scoped>
.job-leave-mode {
  padding: 0;
}

.page-header {
  margin-bottom: 20px;
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
  max-width: 940px;
}

.page-header .tip strong {
  color: hsl(var(--foreground));
  font-weight: 600;
}

/* 卡片 */
.section-card {
  background: hsl(var(--background));
  border-radius: 8px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid hsl(var(--border));
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.card-sub {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.job-table {
  width: 100%;
}

.job-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.job-name {
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--foreground));
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.lock {
  font-style: normal;
  font-size: 9px;
  line-height: 1;
  color: hsl(var(--muted-foreground) / 0.7);
}

.job-count {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.mode-text {
  font-size: 13px;
  color: hsl(var(--foreground));
}

.quota-text {
  font-size: 13px;
  color: hsl(var(--foreground));
}

.quota-text.none {
  color: hsl(var(--muted-foreground) / 0.7);
}

.table-foot {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed hsl(var(--border));
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  line-height: 1.7;
  display: flex;
  align-items: center;
  gap: 2px;
  flex-wrap: wrap;
}

.table-foot b {
  color: hsl(var(--foreground));
  font-weight: 500;
}

.src-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 6px;
  background: hsl(var(--muted) / 0.45);
  border: 1px solid hsl(var(--border));
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.src-badge {
  font-size: 11px;
  padding: 1px 7px;
  border-radius: 9px;
  border: 1px solid hsl(var(--border));
  color: hsl(var(--muted-foreground));
  background: hsl(var(--background));
}

.src-text {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

/* 弹窗内 */
.job-form :deep(.el-divider__text) {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--background));
}

.field-hint {
  margin-left: 10px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.field-desc {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  line-height: 1.6;
  margin-top: 4px;
}
</style>
