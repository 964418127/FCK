<template>
  <div class="leave-type-dict">
    <div class="page-header">
      <div class="header-main">
        <h1>假种字典</h1>
        <el-tag type="warning" effect="plain" size="small">预研稿 · 非结论</el-tag>
        <el-tag type="success" effect="plain" size="small">配置层 · P0</el-tag>
      </div>
      <p class="tip">
        假勤侧的核心字典。每个假种声明自己的带薪性、最小单位、凭证要求、是否排他占位、是否计额度，
        以及<strong>配置下沉到哪一层为止</strong> —— 特殊假（婚 / 丧 / 产 / 陪产）标准值只配到城市，不必逐店填写。
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
        <span class="stat-value">{{ proofCount }}</span>
        <span class="stat-label">需凭证核验<br />（默认转人工）</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ quotaCount }}</span>
        <span class="stat-label">计额度<br />（消耗个人可休量）</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ cityOnlyCount }}</span>
        <span class="stat-label">只细到城市层<br />（不下沉门店）</span>
      </div>
    </div>

    <!-- 分层说明 -->
    <div class="inherit-note">
      <span class="note-badge">继承规则</span>
      <span>
        配置项 × 层级的稀疏表：<strong>留空即向上继承</strong>。
        某假种若只声明到「通用 → 城市」，则门店层无配置项、不产生覆盖，也就不会出现"每家门店填一遍婚假天数"的浪费。
      </span>
    </div>

    <div class="section-card">
      <div class="card-header">
        <span class="card-title">假种清单</span>
        <div class="header-actions">
          <el-select v-model="filterCategory" size="small" style="width: 130px;">
            <el-option label="全部类别" value="" />
            <el-option label="法定假" value="statutory" />
            <el-option label="公司自定" value="company" />
          </el-select>
          <el-button type="primary" size="small" @click="openDialog()">+ 新增假种</el-button>
        </div>
      </div>

      <el-table :data="filteredTypes" size="small" class="type-table">
        <el-table-column label="假种" min-width="168" fixed="left">
          <template #default="{ row }">
            <div class="type-cell">
              <span class="type-name">{{ row.name }}</span>
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

        <el-table-column label="带薪性" width="112">
          <template #default="{ row }">
            <span class="paid-text" :class="'paid-' + row.paid">{{ paidText(row) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="最小单位" width="86" align="center">
          <template #default="{ row }">{{ labelOf(unitTypes, row.unit) }}</template>
        </el-table-column>

        <el-table-column label="凭证要求" width="150">
          <template #default="{ row }">
            <span :class="row.needProof ? 'proof-yes' : 'plain-text'">{{ row.proofText }}</span>
          </template>
        </el-table-column>

        <el-table-column label="提前申请期" width="98" align="center">
          <template #default="{ row }">
            {{ row.advanceDays === 0 ? '可事后补' : row.advanceDays + ' 天' }}
          </template>
        </el-table-column>

        <el-table-column label="时间线" width="92">
          <template #default="{ row }">
            <el-tag size="small" effect="plain" :type="row.exclusive ? 'warning' : 'info'">
              {{ row.exclusive ? '排他占位' : '非排他' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="额度" width="112">
          <template #default="{ row }">
            <span class="plain-text">{{ row.countQuota ? '计入额度' : '不计额度' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="标准值" min-width="230" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="plain-text">{{ row.standard }}</span>
          </template>
        </el-table-column>

        <el-table-column label="配置下沉" width="156">
          <template #default="{ row }">
            <el-tag size="small" effect="plain" :type="depthTagType(row.configDepth)">
              {{ labelOf(configDepths, row.configDepth) }}
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
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? `编辑假种 · ${form.name}` : '新增假种'"
      width="760px"
    >
      <el-form :model="form" label-width="120px">
        <el-divider content-position="left">基本信息</el-divider>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="假种名称">
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

        <el-divider content-position="left">额度与薪酬</el-divider>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="带薪性">
              <el-select v-model="form.paid" style="width: 100%;">
                <el-option v-for="p in paidTypes" :key="p.value" :label="p.label" :value="p.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.paid === 'partial'" label="带薪比例">
              <el-input-number
                v-model="form.paidRatio"
                :min="0"
                :max="100"
                :step="10"
                controls-position="right"
                style="width: 120px;"
              />
              <span class="field-hint">百分比</span>
            </el-form-item>
            <el-form-item v-else label="最小单位">
              <el-select v-model="form.unit" style="width: 100%;">
                <el-option v-for="u in unitTypes" :key="u.value" :label="u.label" :value="u.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="最小单位">
              <el-select v-model="form.unit" style="width: 100%;">
                <el-option v-for="u in unitTypes" :key="u.value" :label="u.label" :value="u.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计入额度">
              <el-switch v-model="form.countQuota" />
              <span class="field-hint">消耗个人可休量</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="额度来源">
          <el-select v-model="form.quotaSource" style="width: 100%;" :disabled="!form.countQuota">
            <el-option label="固定配置（按周期发放）" value="fixed" />
            <el-option label="加班累积（按加班时长折算）" value="overtime" />
            <el-option label="业绩折算（由现有额度模块计算）" value="performance" />
            <el-option label="不适用" value="none" />
          </el-select>
        </el-form-item>

        <el-divider content-position="left">申请与审核</el-divider>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="提前申请期">
              <el-input-number v-model="form.advanceDays" :min="0" controls-position="right" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="需凭证核验">
              <el-switch v-model="form.needProof" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item v-if="form.needProof" label="凭证类型">
          <el-input v-model="form.proofText" placeholder="如：结婚证" />
        </el-form-item>

        <el-divider content-position="left">配置分层</el-divider>
        <el-form-item label="配置下沉深度">
          <el-select v-model="form.configDepth" style="width: 100%;">
            <el-option v-for="c in configDepths" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
          <div class="field-desc">
            法定假通常只到城市层（各地口径不同）；公司自定假可按门店细化
          </div>
        </el-form-item>
        <el-form-item label="标准值">
          <el-input v-model="form.standard" type="textarea" :rows="2" placeholder="如：法定 3 天；深圳市含地方奖励假共 10 天" />
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
  paidTypes,
  unitTypes,
  configDepths
} from '../../mock/leaveAttendance.js'

const typeList = ref(rawTypes.map(t => ({ ...t })))
const filterCategory = ref('')

const filteredTypes = computed(() =>
  filterCategory.value
    ? typeList.value.filter(t => t.category === filterCategory.value)
    : typeList.value
)

const statutoryCount = computed(() => typeList.value.filter(t => t.category === 'statutory').length)
const companyCount = computed(() => typeList.value.filter(t => t.category === 'company').length)
const proofCount = computed(() => typeList.value.filter(t => t.needProof).length)
const quotaCount = computed(() => typeList.value.filter(t => t.countQuota).length)
const cityOnlyCount = computed(() => typeList.value.filter(t => t.configDepth === 'city').length)

const labelOf = (list, value) => {
  const hit = list.find(i => i.value === value)
  return hit ? hit.label : value
}

const paidText = (row) => {
  if (row.paid === 'paid') return '带薪'
  if (row.paid === 'unpaid') return '无薪'
  return `部分带薪 ${row.paidRatio}%`
}

const depthTagType = (depth) => {
  if (depth === 'general') return 'success'
  if (depth === 'city') return 'warning'
  return 'info'
}

const dialogVisible = ref(false)
const isEdit = ref(false)

const emptyForm = () => ({
  id: '',
  name: '',
  category: 'company',
  paid: 'unpaid',
  paidRatio: 0,
  unit: 'day',
  needProof: false,
  proofText: '无需凭证',
  advanceDays: 1,
  exclusive: true,
  countQuota: false,
  quotaSource: 'none',
  standard: '',
  configDepth: 'store',
  enabled: true,
  note: ''
})

const form = reactive(emptyForm())

const openDialog = (row = null) => {
  Object.assign(form, row ? { ...row } : emptyForm())
  isEdit.value = !!row
  dialogVisible.value = true
}

const save = () => {
  if (!form.name.trim()) {
    ElMessage.warning('请填写假种名称')
    return
  }
  if (isEdit.value) {
    const idx = typeList.value.findIndex(t => t.id === form.id)
    if (idx !== -1) typeList.value[idx] = { ...form }
    ElMessage.success(`假种「${form.name}」已更新`)
  } else {
    typeList.value.push({ ...form, id: 'leave-' + Date.now() })
    ElMessage.success(`假种「${form.name}」已新增`)
  }
  dialogVisible.value = false
}

const toggleEnabled = (row) => {
  ElMessage.success(`假种「${row.name}」已${row.enabled ? '启用' : '停用'}`)
}

const removeType = (row) => {
  ElMessageBox.confirm(
    `确定删除假种「${row.name}」吗？删除后员工将无法再提交该假种的申请。`,
    '删除确认',
    { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    typeList.value = typeList.value.filter(t => t.id !== row.id)
    ElMessage.success('已删除')
  }).catch(() => {})
}
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
  grid-template-columns: repeat(5, 1fr);
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

.inherit-note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: hsl(var(--muted) / 0.6);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  font-size: 13px;
  line-height: 1.7;
  color: hsl(var(--muted-foreground));
}

.note-badge {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  color: hsl(var(--background));
  background: hsl(var(--muted-foreground));
  border-radius: 4px;
  padding: 2px 8px;
  margin-top: 1px;
}

.inherit-note strong {
  color: hsl(var(--foreground));
  font-weight: 600;
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
}

.type-note {
  font-size: 12px;
  line-height: 1.5;
  color: hsl(var(--muted-foreground));
}

.paid-text {
  font-size: 13px;
}

.paid-paid {
  color: hsl(var(--primary));
}

.paid-partial {
  color: #b8860b;
}

.paid-unpaid {
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
