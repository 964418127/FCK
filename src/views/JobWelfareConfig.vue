<template>
  <div class="job-welfare-config">
    <div class="page-header">
      <h1>岗位与福利保障配置</h1>
      <p class="tip">💡 按 <strong>(岗位 × 用工类型 × 城市)</strong> 维度维护员工入职时继承的福利标准：<strong>社保 / 公积金 / 商业险</strong>。员工入职后从该配置继承，HR 可在【员工福利保障明细】中个体微调。</p>
    </div>

    <div class="content-section">
      <!-- 筛选区 -->
      <div class="search-section">
        <el-form :inline="true" class="demo-form-inline">
          <el-form-item label="岗位">
            <el-select v-model="searchForm.position" placeholder="选择" clearable style="width: 120px;">
              <el-option label="推拿师" value="推拿师" />
              <el-option label="客户经理" value="客户经理" />
              <el-option label="理疗师" value="理疗师" />
              <el-option label="总部岗位" value="总部岗位" />
            </el-select>
          </el-form-item>
          <el-form-item label="用工类型">
            <el-select v-model="searchForm.workerType" placeholder="选择" clearable style="width: 120px;">
              <el-option label="全职" value="全职" />
              <el-option label="非全日制" value="非全日制" />
              <el-option label="兼职" value="兼职" />
            </el-select>
          </el-form-item>
          <el-form-item label="城市">
            <el-select v-model="searchForm.city" placeholder="选择" clearable style="width: 120px;">
              <el-option label="北京" value="北京" />
              <el-option label="上海" value="上海" />
              <el-option label="深圳" value="深圳" />
              <el-option label="杭州" value="杭州" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 操作按钮 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button type="primary" @click="handleCreate">+ 新增配置</el-button>
          <el-button @click="handleCopy">复制已有配置</el-button>
        </div>
        <div class="toolbar-right">
          <el-tag type="info" size="small">
            <span>配置总数：</span>
            <span class="count">{{ totalCount }}</span>
          </el-tag>
          <el-tag type="success" size="small">
            <span>覆盖员工：</span>
            <span class="count">{{ totalPersonCount }}</span>
          </el-tag>
        </div>
      </div>

      <!-- 配置列表 -->
      <el-table :data="filteredList" stripe style="width: 100%; margin-top: 12px;">
        <el-table-column prop="id" label="编号" width="180" />
        <el-table-column prop="position" label="岗位" width="100" />
        <el-table-column prop="workerType" label="用工类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getWorkerTypeTag(row.workerType)" size="small">{{ row.workerType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="适用城市" width="200">
          <template #default="{ row }">
            <el-tag v-for="c in row.cities" :key="c" size="small" effect="plain" style="margin-right: 4px;">{{ c }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="社保标准" width="140" align="center">
          <template #default="{ row }">
            <el-tag :type="getSSTagType(row.socialSecurityLevel)" size="small">{{ row.socialSecurityLevel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="公积金" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.housingFundEnabled ? 'success' : 'info'" size="small">
              {{ row.housingFundEnabled ? '启用' : '不启用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="商业险（0+）" min-width="220">
          <template #default="{ row }">
            <span v-if="row.commercialInsurances.length === 0" class="text-muted">—</span>
            <div v-else class="ci-list">
              <el-tag v-for="ci in row.commercialInsurances" :key="ci" size="small" effect="plain" style="margin-right: 4px; margin-bottom: 2px;">
                {{ ci }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="personCount" label="匹配人员" width="90" align="center">
          <template #default="{ row }">
            <span class="person-count">{{ row.personCount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="160" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          background
        />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="760px" destroy-on-close>
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="岗位" prop="position">
              <el-select v-model="form.position" placeholder="选择岗位" style="width: 100%;">
                <el-option label="推拿师" value="推拿师" />
                <el-option label="客户经理" value="客户经理" />
                <el-option label="理疗师" value="理疗师" />
                <el-option label="总部岗位" value="总部岗位" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用工类型" prop="workerType">
              <el-select v-model="form.workerType" placeholder="选择用工类型" style="width: 100%;">
                <el-option label="全职" value="全职" />
                <el-option label="非全日制" value="非全日制" />
                <el-option label="兼职" value="兼职" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="适用城市" prop="cities">
          <el-select v-model="form.cities" multiple placeholder="可多选（员工入职城市在范围内即继承本配置）" style="width: 100%;">
            <el-option label="北京" value="北京" />
            <el-option label="上海" value="上海" />
            <el-option label="深圳" value="深圳" />
            <el-option label="杭州" value="杭州" />
            <el-option label="广州" value="广州" />
            <el-option label="成都" value="成都" />
          </el-select>
        </el-form-item>

        <el-divider content-position="left">福利标准</el-divider>

        <el-form-item label="社保标准" prop="socialSecurityLevel">
          <el-radio-group v-model="form.socialSecurityLevel">
            <el-radio label="社保（全）">社保（全）</el-radio>
            <el-radio label="社保（仅工伤）">社保（仅工伤）</el-radio>
            <el-radio label="无">无</el-radio>
          </el-radio-group>
          <div class="field-tip">非全日制一般选「社保（仅工伤）」；兼职一般选「无」</div>
        </el-form-item>

        <el-form-item label="公积金">
          <el-switch v-model="form.housingFundEnabled" active-text="启用" inactive-text="不启用" inline-prompt />
          <div class="field-tip">非全日制和兼职一般不启用公积金</div>
        </el-form-item>

        <el-form-item label="商业险" prop="commercialInsurances">
          <el-select
            v-model="form.commercialInsurances"
            multiple
            filterable
            placeholder="从商业险库选择 0+ 项（可选）"
            style="width: 100%;"
          >
            <el-option
              v-for="ci in commercialInsuranceLibrary"
              :key="ci.id"
              :label="ci.name"
              :value="ci.name"
            >
              <span style="float: left;">{{ ci.name }}</span>
              <span style="float: right; color: hsl(var(--muted-foreground)); font-size: 12px;">
                {{ ci.cities === '全国' ? '全国通用' : ci.cities.join('/') }} · ¥{{ ci.premium }} / {{ ci.costUnit }}
              </span>
            </el-option>
          </el-select>
          <div class="field-tip">商业险在【商业险管理】维护；此处从商业险库中选 0+ 项。员工入职时按城市筛选项必选 1+，可在【员工福利保障明细】中微调</div>
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const searchForm = reactive({
  position: '',
  workerType: '',
  city: ''
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 5
})

// 商业险库（从【商业险管理】同步过来）
const commercialInsuranceLibrary = ref([
  { id: 1, name: '雇主责任险-基础版', cities: ['北京', '上海'], premium: 1200, costUnit: '年' },
  { id: 2, name: '雇主责任险-基础版（深圳）', cities: ['深圳'], premium: 1500, costUnit: '年' },
  { id: 3, name: '雇主责任险-基础版（杭州）', cities: ['杭州'], premium: 1000, costUnit: '年' },
  { id: 4, name: '雇主责任险-高保额版', cities: ['北京'], premium: 2400, costUnit: '年' },
  { id: 5, name: '意外险-通勤版', cities: '全国', premium: 50, costUnit: '月' },
  { id: 6, name: '意外险-工作版', cities: '全国', premium: 100, costUnit: '月' },
  { id: 7, name: '医疗补充险-高端版', cities: '全国', premium: 200, costUnit: '月' }
])

// 岗位与福利保障配置数据
const configList = ref([
  {
    id: 'JWC001', position: '推拿师', workerType: '全职', cities: ['北京', '上海'],
    socialSecurityLevel: '社保（全）', housingFundEnabled: true,
    commercialInsurances: ['雇主责任险-基础版'],
    personCount: 18, remark: '标准配置',
    updateTime: '2026-05-20 14:42:24'
  },
  {
    id: 'JWC002', position: '推拿师', workerType: '全职', cities: ['深圳'],
    socialSecurityLevel: '社保（全）', housingFundEnabled: true,
    commercialInsurances: ['雇主责任险-基础版（深圳）'],
    personCount: 6, remark: '深圳地区雇主险保费不同',
    updateTime: '2026-05-19 10:20:15'
  },
  {
    id: 'JWC003', position: '推拿师', workerType: '非全日制', cities: ['北京'],
    socialSecurityLevel: '社保（仅工伤）', housingFundEnabled: false,
    commercialInsurances: ['意外险-通勤版'],
    personCount: 4, remark: '非全日制加保意外险',
    updateTime: '2026-05-18 16:30:00'
  },
  {
    id: 'JWC004', position: '客户经理', workerType: '兼职', cities: ['北京', '深圳'],
    socialSecurityLevel: '无', housingFundEnabled: false,
    commercialInsurances: ['雇主责任险-基础版'],
    personCount: 13, remark: '兼职仅商业险',
    updateTime: '2026-05-19 11:00:00'
  },
  {
    id: 'JWC005', position: '总部岗位', workerType: '全职', cities: ['北京'],
    socialSecurityLevel: '社保（全）', housingFundEnabled: true,
    commercialInsurances: ['意外险-通勤版', '医疗补充险-高端版'],
    personCount: 10, remark: '总部高保障配置',
    updateTime: '2026-05-17 11:00:00'
  }
])

const totalCount = computed(() => configList.value.length)
const totalPersonCount = computed(() => configList.value.reduce((sum, c) => sum + c.personCount, 0))

// 过滤
const filteredList = computed(() => {
  let result = configList.value
  if (searchForm.position) {
    result = result.filter(item => item.position === searchForm.position)
  }
  if (searchForm.workerType) {
    result = result.filter(item => item.workerType === searchForm.workerType)
  }
  if (searchForm.city) {
    result = result.filter(item => item.cities.includes(searchForm.city))
  }
  return result
})

const getWorkerTypeTag = (type) => {
  const map = { '全职': 'success', '非全日制': 'warning', '兼职': 'info' }
  return map[type] || 'default'
}

const getSSTagType = (level) => {
  const map = { '社保（全）': 'primary', '社保（仅工伤）': 'warning', '无': 'info' }
  return map[level] || 'default'
}

const dialogVisible = ref(false)
const dialogTitle = ref('新增配置')
const isEdit = ref(false)
const formRef = ref(null)

const form = reactive({
  id: '',
  position: '',
  workerType: '',
  cities: [],
  socialSecurityLevel: '社保（全）',
  housingFundEnabled: true,
  commercialInsurances: [],
  remark: ''
})

const formRules = {
  position: [{ required: true, message: '请选择岗位', trigger: 'change' }],
  workerType: [{ required: true, message: '请选择用工类型', trigger: 'change' }],
  cities: [{ required: true, message: '请至少选择一个适用城市', trigger: 'change' }],
  socialSecurityLevel: [{ required: true, message: '请选择社保标准', trigger: 'change' }]
}

const handleSearch = () => {
  ElMessage.success(`已筛选，共 ${filteredList.value.length} 条`)
}

const handleReset = () => {
  searchForm.position = ''
  searchForm.workerType = ''
  searchForm.city = ''
}

const handleCreate = () => {
  isEdit.value = false
  dialogTitle.value = '新增配置'
  Object.assign(form, {
    id: '',
    position: '',
    workerType: '',
    cities: [],
    socialSecurityLevel: '社保（全）',
    housingFundEnabled: true,
    commercialInsurances: [],
    remark: ''
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑配置'
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

const handleCopy = () => {
  ElMessage.info('请先在列表中选择一行作为复制源（开发中）')
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除「${row.position}-${row.workerType}（${row.cities.join('/')}）」配置？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const idx = configList.value.findIndex(i => i.id === row.id)
    if (idx > -1) {
      configList.value.splice(idx, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        const idx = configList.value.findIndex(i => i.id === form.id)
        if (idx > -1) {
          configList.value[idx] = { ...form, updateTime: new Date().toLocaleString('zh-CN') }
        }
        ElMessage.success('保存成功')
      } else {
        configList.value.push({
          ...form,
          id: 'JWC' + Date.now().toString().slice(-6),
          updateTime: new Date().toLocaleString('zh-CN')
        })
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
    }
  })
}
</script>

<style scoped>
.job-welfare-config {
  padding: 0;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: hsl(var(--foreground));
}

.page-header .tip {
  color: hsl(var(--muted-foreground));
  font-size: 14px;
  margin: 0;
  line-height: 1.6;
}

.content-section {
  background: hsl(var(--background));
  border-radius: 8px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.search-section {
  padding-bottom: 16px;
  border-bottom: 1px solid hsl(var(--border));
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 0;
}

.toolbar-left {
  display: flex;
  gap: 8px;
}

.toolbar-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.count {
  font-weight: 600;
  margin-left: 4px;
}

.ci-list {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

.text-muted {
  color: hsl(var(--muted-foreground) / 0.6);
  font-size: 12px;
}

.person-count {
  color: hsl(var(--primary));
  font-weight: 600;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.field-tip {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  margin-top: 4px;
  line-height: 1.5;
}
</style>
