<template>
  <div class="leave-type-dict">
    <div class="page-header">
      <div class="header-main">
        <h1>假期类型</h1>
      </div>
      <p class="tip">
        只维护假期类型本身：类别、是否排他、适用性。额度值与获取上限在「假期额度方案」，岗位额度在「岗位假勤方案」。
      </p>
    </div>

    <!-- 统计条 -->
    <div class="stat-strip">
      <div class="stat-item">
        <span class="stat-value">{{ statutoryCount }}</span>
        <span class="stat-label">法定假</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ companyCount }}</span>
        <span class="stat-label">公司自定</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ enabledCount }}</span>
        <span class="stat-label">已启用</span>
      </div>
    </div>

    <div class="section-card">
      <div class="card-header">
        <span class="card-title">假期类型清单</span>
        <div class="header-actions">
          <el-select v-model="filterCategory" size="small" style="width: 130px;">
            <el-option label="全部类别" value="" />
            <el-option label="法定假" value="statutory" />
            <el-option label="公司自定" value="company" />
          </el-select>
          <el-button type="primary" size="small" @click="openDialog()">+ 新增假期类型</el-button>
        </div>
      </div>

      <el-table :data="pagedRows" size="small" class="type-table">
        <el-table-column label="类型" min-width="168" fixed="left">
          <template #default="{ row }">
            <div class="type-cell">
              <span class="type-name">
                {{ row.name }}
                <el-tag v-if="row.legacy" size="small" effect="plain" type="danger" class="legacy-tag">历史遗留</el-tag>
              </span>
              <span class="type-note">{{ row.note }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="类别" width="96">
          <template #default="{ row }">
            <el-tag
              size="small"
              effect="plain"
              :type="row.category === 'statutory' ? 'primary' : 'info'"
            >{{ labelOf(leaveCategories, row.category) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="适用性" width="118">
          <template #default="{ row }">
            <el-tag v-if="row.applicability === 'all'" size="small" effect="plain" type="info">岗位通用</el-tag>
            <el-tooltip v-else :content="`仅 ${(row.appJobs || []).join('、')} 有此假种`" placement="top">
              <el-tag size="small" effect="plain" type="warning">指定岗位 · {{ (row.appJobs || []).length }}</el-tag>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column label="排他" width="92">
          <template #default="{ row }">
            <el-tag size="small" effect="plain" :type="row.exclusive ? 'warning' : 'info'">
              {{ row.exclusive ? '排他占位' : '非排他' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="启用" width="76" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.enabled" size="small" @change="toggleEnabled(row)" />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" link type="danger" @click="removeType(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <TablePagination v-model:page="page" v-model:page-size="pageSize" :total="total" />

      <p class="foot-note">
        班次假 / 临时假这类<strong>岗位专属类型</strong>同样在此维护适用性。值不在本页：班次假在「岗位假勤方案」的岗位额度里按岗位配；
        临时假由系统按业绩折算发放，<strong>获取上限</strong>在「假期额度方案」以「上限方案」设置（历史已折算的存量不在本系统处理）。
        <strong>特殊情况请假</strong>为历史大包假种（现状把事假、病假等全部混在一个兜底通道），重构后由事假 / 病假等标准类型承接，此处仅作现状对照保留。
      </p>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? `编辑假期类型 · ${form.name}` : '新增假期类型'"
      width="760px"
    >
      <el-form :model="form" label-width="120px">
        <el-divider content-position="left">基本信息</el-divider>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="类型名称">
              <el-input v-model="form.name" placeholder="如：婚假" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类别">
              <el-select v-model="form.category" style="width: 100%;">
                <el-option v-for="c in leaveCategories" :key="c.value" :label="c.label" :value="c.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">适用性</el-divider>
        <el-form-item label="适用性">
          <el-radio-group v-model="form.applicability" @change="onApplicabilityChange">
            <el-radio v-for="a in applicabilityOptions" :key="a.value" :value="a.value">{{ a.label }}</el-radio>
          </el-radio-group>
          <div class="field-desc">{{ applicabilityDesc }}</div>
        </el-form-item>
        <el-form-item v-if="form.applicability === 'jobs'" label="适用岗位">
          <el-select v-model="form.appJobs" multiple filterable style="width: 100%;" placeholder="选择可用此类型的岗位">
            <el-option v-for="j in jobNames" :key="j" :label="j" :value="j" />
          </el-select>
          <div class="field-desc">
            岗位通用类型的值在「假期额度方案」配；指定岗位类型的值在「岗位假勤方案」的岗位额度配，
            系统折算类型（如临时假）的获取上限在「假期额度方案」以「上限方案」设置。
          </div>
        </el-form-item>

        <el-divider content-position="left">时间线占位（由时间线组校验）</el-divider>
        <el-form-item label="占位性质">
          <el-radio-group v-model="form.exclusive">
            <el-radio :value="true">排他占位</el-radio>
            <el-radio :value="false">非排他标记</el-radio>
          </el-radio-group>
          <div class="field-desc">
            排他 → 不可与排班 / 其他假落在同一时段；非排他 → 仅作标记，可叠加
          </div>
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="form.note" type="textarea" :rows="2" placeholder="说明该假种的特殊处理规则" />
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
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  leaveTypes as rawTypes,
  leaveCategories,
  applicabilityOptions,
  jobs as allJobs
} from '../../mock/leaveAttendance.js'

import { usePager } from '../../composables/usePager.js'
import TablePagination from '../../components/TablePagination.vue'
const typeList = ref(rawTypes.map(t => ({ ...t, appJobs: [...(t.appJobs || [])] })))
const filterCategory = ref('')

const filteredTypes = computed(() =>
  filterCategory.value
    ? typeList.value.filter(t => t.category === filterCategory.value)
    : typeList.value
)

const statutoryCount = computed(() => typeList.value.filter(t => t.category === 'statutory').length)
const companyCount = computed(() => typeList.value.filter(t => t.category === 'company').length)
const enabledCount = computed(() => typeList.value.filter(t => t.enabled).length)

const labelOf = (list, value) => {
  const hit = list.find(i => i.value === value)
  return hit ? hit.label : value
}

const dialogVisible = ref(false)
const isEdit = ref(false)

const emptyForm = () => ({
  id: '',
  name: '',
  category: 'company',
  exclusive: true,
  enabled: true,
  applicability: 'all',
  appJobs: [],
  note: ''
})

const form = reactive(emptyForm())

const jobNames = allJobs.map(j => j.name)
const applicabilityDesc = computed(() => (applicabilityOptions.find(a => a.value === form.applicability) || {}).desc || '')

const onApplicabilityChange = (v) => {
  if (v === 'all') form.appJobs = []
}

const openDialog = (row = null) => {
  if (row) {
    Object.assign(form, {
      ...row,
      appJobs: [...(row.appJobs || [])]
    })
  } else {
    Object.assign(form, emptyForm())
  }
  isEdit.value = !!row
  dialogVisible.value = true
}

const save = () => {
  if (!form.name.trim()) {
    ElMessage.warning('请填写类型名称')
    return
  }
  if (isEdit.value) {
    const idx = typeList.value.findIndex(t => t.id === form.id)
    if (idx !== -1) typeList.value[idx] = { ...form }
    ElMessage.success(`假期类型「${form.name}」已更新`)
  } else {
    typeList.value.push({ ...form, id: 'leave-' + Date.now() })
    ElMessage.success(`假期类型「${form.name}」已新增`)
  }
  dialogVisible.value = false
}

const toggleEnabled = (row) => {
  ElMessage.success(`假期类型「${row.name}」已${row.enabled ? '启用' : '停用'}`)
}

const removeType = (row) => {
  ElMessageBox.confirm(
    `确定删除假期类型「${row.name}」吗？删除后员工将无法再提交该类型的申请。`,
    '删除确认',
    { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    typeList.value = typeList.value.filter(t => t.id !== row.id)
    ElMessage.success('已删除')
  }).catch(() => {})
}

/* 分页：数据已筛选 / 排序，这里只切片 */
const { page: page, pageSize: pageSize, total: total, rows: pagedRows } = usePager(filteredTypes)
</script>

<style scoped>
.leave-type-dict {
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

.stat-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.stat-item {
  background: hsl(var(--background));
  border-radius: 8px;
  padding: 14px 16px;
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.stat-value {
  font-size: 26px;
  font-weight: 600;
  color: hsl(var(--primary));
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  line-height: 1.4;
  color: hsl(var(--muted-foreground));
}

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
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid hsl(var(--border));
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.type-table {
  width: 100%;
}

.type-cell {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.type-name {
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--foreground));
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.legacy-tag {
  flex-shrink: 0;
}

.type-note {
  font-size: 12px;
  line-height: 1.5;
  color: hsl(var(--muted-foreground));
}

.proof-yes {
  font-size: 13px;
  color: #b8860b;
}

.plain-text {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.foot-note {
  margin: 12px 0 0;
  padding-top: 10px;
  border-top: 1px dashed hsl(var(--border));
  font-size: 12px;
  line-height: 1.7;
  color: hsl(var(--muted-foreground));
}
.foot-note strong { color: hsl(var(--foreground)); font-weight: 600; }

.field-desc {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  line-height: 1.6;
  margin-top: 4px;
}

.opt-desc {
  float: right;
  margin-left: 16px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

:deep(.el-divider__text) {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--background));
}

@media (max-width: 1280px) {
  .stat-strip {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
