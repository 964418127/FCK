<template>
  <div class="personnel-position-salary-planning">
    <div class="page-header">
      <h1>人员岗位薪酬规划</h1>
      <p class="tip">每个人可对应多条历史任职记录，每条记录包含岗位薪酬模板与计算有效期。HR 异动结果由【人员异动处理】自动写入。</p>
    </div>

    <div class="content-section">
      <el-tabs v-model="activeTab" class="planning-tabs">
        <!-- 人员薪酬规划：最终记录视图（一个人可对应多条历史任职） -->
        <el-tab-pane label="人员薪酬规划" name="planning">
          <div class="tab-pane-inner">
            <!-- 顶部统计条 -->
            <div class="stat-bar">
              <div class="stat-item">
                <span class="stat-label">人员数</span>
                <span class="stat-value">{{ uniqueTalentCount }}</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-label">记录数</span>
                <span class="stat-value">{{ planningList.length }}</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-label">当前在任职记录</span>
                <span class="stat-value">{{ activeRecordCount }}</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-label">异动来源</span>
                <span class="stat-value stat-link" @click="goToChangeProcessing">人员异动处理 →</span>
              </div>
            </div>

            <!-- 筛选区 -->
            <div class="search-section">
              <el-form :inline="true" class="demo-form-inline">
                <el-form-item>
                  <el-input v-model="search.keyword" placeholder="搜索姓名/人才ID/门店/岗位" clearable style="width: 220px;" />
                </el-form-item>
                <el-form-item>
                  <el-select v-model="search.positionCategory" placeholder="岗位归属" clearable style="width: 120px;">
                    <el-option label="业务" value="业务" />
                    <el-option label="职能" value="职能" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-select v-model="search.city" placeholder="城市" clearable style="width: 120px;">
                    <el-option label="上海市" value="上海市" />
                    <el-option label="深圳市" value="深圳市" />
                    <el-option label="北京市" value="北京市" />
                    <el-option label="广州市" value="广州市" />
                    <el-option label="成都市" value="成都市" />
                    <el-option label="重庆市" value="重庆市" />
                    <el-option label="杭州市" value="杭州市" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-select v-model="search.store" placeholder="在职门店" clearable style="width: 140px;">
                    <el-option v-for="s in storeOptions" :key="s" :label="s" :value="s" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-select v-model="search.company" placeholder="公司主体" clearable style="width: 200px;">
                    <el-option label="常乐健康（上海）有限公司" value="常乐健康（上海）有限公司" />
                    <el-option label="常乐健康（深圳）有限公司" value="常乐健康（深圳）有限公司" />
                    <el-option label="常乐健康（成都）有限公司" value="常乐健康（成都）有限公司" />
                    <el-option label="常乐健康（北京）有限公司" value="常乐健康（北京）有限公司" />
                    <el-option label="常乐健康（广州）有限公司" value="常乐健康（广州）有限公司" />
                    <el-option label="常乐健康管理集团" value="常乐健康管理集团" />
                    <el-option label="合作主体" value="合作主体" />
                    <el-option label="-" value="-" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-select v-model="search.coopMode" placeholder="合作模式" clearable style="width: 160px;">
                    <el-option label="劳动合同-全日制" value="劳动合同-全日制" />
                    <el-option label="劳动合同-非全日制" value="劳动合同-非全日制" />
                    <el-option label="劳务合作-返聘" value="劳务合作-返聘" />
                    <el-option label="劳务合作-兼职" value="劳务合作-兼职" />
                    <el-option label="正常" value="正常" />
                    <el-option label="非全日制" value="非全日制" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-select v-model="search.templateName" placeholder="岗位模板" clearable style="width: 200px;">
                    <el-option v-for="t in templateOptions" :key="t.name" :label="t.name" :value="t.name" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="applySearch">搜索</el-button>
                  <el-button @click="handleReset">重置</el-button>
                </el-form-item>
              </el-form>
            </div>

            <!-- 操作按钮 -->
            <div class="toolbar">
              <div class="toolbar-left">
                <el-button type="primary" @click="handleCreate">+ 新增人员薪酬规划</el-button>
              </div>
              <div class="toolbar-right">
                <span class="toolbar-tip">💡 同一人多条记录按"计算生效时间"降序排列，最近的在最上面</span>
              </div>
            </div>

            <!-- 列表 -->
            <el-table :data="filteredList" stripe style="width: 100%; margin-top: 12px;" row-class-name="planning-row">
              <el-table-column prop="name" label="姓名" width="80" fixed />
              <el-table-column prop="position" label="岗位名称" width="100" />
              <el-table-column prop="positionId" label="岗位编号" width="170" />
              <el-table-column prop="positionCategory" label="岗位归属" width="90">
                <template #default="{ row }">
                  <el-tag size="small">{{ row.positionCategory }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="coopMode" label="合作模式" width="140">
                <template #default="{ row }">
                  <el-tag :type="getCoopModeTag(row.coopMode)" size="small">{{ row.coopMode }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="city" label="城市" width="90" />
              <el-table-column prop="company" label="公司主体" min-width="180" />
              <el-table-column prop="store" label="所属门店/部门" min-width="150" />
              <el-table-column prop="templateName" label="岗位薪酬模板" min-width="180" />
              <el-table-column prop="effectiveStart" label="计算生效时间" width="160" />
              <el-table-column prop="effectiveEnd" label="计算失效时间" width="160">
                <template #default="{ row }">
                  <span :class="{ 'eff-ongoing': row.effectiveEnd === '2099-12-31 00:00:00' }">{{ row.effectiveEnd === '2099-12-31 00:00:00' ? '至今' : row.effectiveEnd }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" size="small" link @click="handleEdit(row)">详情</el-button>
                  <el-button type="primary" size="small" link @click="handleEdit(row)">编辑</el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination-wrapper">
              <el-pagination
                v-model:current-page="pagination.currentPage"
                v-model:page-size="pagination.pageSize"
                :total="pagination.total"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                background
              />
            </div>
          </div>
        </el-tab-pane>

        <!-- 岗位模板列表 -->
        <el-tab-pane label="岗位模板列表" name="template">
          <div class="tab-pane-inner">
            <div class="search-section">
              <el-form :inline="true" class="demo-form-inline">
                <el-form-item label="搜索">
                  <el-input v-model="templateSearch.keyword" placeholder="岗位名称/模板名称" clearable style="width: 160px;" />
                </el-form-item>
                <el-form-item label="模板类型">
                  <el-select v-model="templateSearch.templateType" placeholder="选择" clearable style="width: 120px;">
                    <el-option label="标准" value="标准" />
                    <el-option label="自定义" value="自定义" />
                  </el-select>
                </el-form-item>
                <el-form-item label="关联岗位">
                  <el-select v-model="templateSearch.position" placeholder="选择" clearable style="width: 140px;">
                    <el-option label="推拿师" value="推拿师" />
                    <el-option label="客户经理" value="客户经理" />
                    <el-option label="调理师" value="调理师" />
                    <el-option label="理疗师" value="理疗师" />
                  </el-select>
                </el-form-item>
                <el-form-item label="岗位归属">
                  <el-select v-model="templateSearch.belongTo" placeholder="选择" clearable style="width: 120px;">
                    <el-option label="业务" value="业务" />
                    <el-option label="职能" value="职能" />
                  </el-select>
                </el-form-item>
                <el-form-item label="合作模式">
                  <el-select v-model="templateSearch.coopMode" placeholder="选择" clearable style="width: 180px;">
                    <el-option label="劳动合同-全日制" value="劳动合同-全日制" />
                    <el-option label="劳动合同-非全日制" value="劳动合同-非全日制" />
                    <el-option label="劳务合作-返聘" value="劳务合作-返聘" />
                    <el-option label="劳务合作-兼职" value="劳务合作-兼职" />
                    <el-option label="正常" value="正常" />
                    <el-option label="非全日制" value="非全日制" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleTemplateSearch">搜索</el-button>
                  <el-button @click="handleTemplateReset">重置</el-button>
                </el-form-item>
              </el-form>
            </div>

            <div class="toolbar">
              <div class="toolbar-left">
                <el-button type="primary" @click="handleCreateTemplate">+ 新增岗位模板</el-button>
              </div>
            </div>

            <el-table :data="templateList" stripe style="width: 100%; margin-top: 12px;">
              <el-table-column prop="id" label="编号" width="180" />
              <el-table-column prop="name" label="岗位模板名称" min-width="180" />
              <el-table-column prop="templateType" label="模板类型" width="90">
                <template #default="{ row }">
                  <el-tag :type="row.templateType === '标准' ? 'success' : 'warning'" size="small">
                    {{ row.templateType }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="position" label="关联岗位" width="100" />
              <el-table-column prop="belongTo" label="岗位归属" width="90">
                <template #default="{ row }">
                  <el-tag size="small">{{ row.belongTo }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="coopMode" label="合作模式" width="140" />
              <el-table-column prop="personCount" label="匹配人员" width="90" align="center">
                <template #default="{ row }">
                  <span class="person-count">{{ row.personCount }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="updateTime" label="更新时间" width="160" />
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" size="small" link @click="handleTemplateDetail(row)">详情</el-button>
                  <el-button type="primary" size="small" link @click="handleTemplateEdit(row)">编辑</el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination-wrapper">
              <el-pagination
                v-model:current-page="templatePagination.currentPage"
                v-model:page-size="templatePagination.pageSize"
                :total="templatePagination.total"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next"
                background
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 新增/编辑 人员薪酬规划 弹窗 -->
    <el-dialog v-model="recordDialogVisible" :title="recordDialogMode === 'edit' ? '编辑人员薪酬规划' : '新增人员薪酬规划'" width="800px" destroy-on-close>
      <el-form :model="recordForm" label-width="110px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="人才ID">
              <el-input v-model="recordForm.talentId" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名">
              <el-input v-model="recordForm.name" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="岗位名称">
              <el-input v-model="recordForm.position" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位编号">
              <el-input v-model="recordForm.positionId" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="岗位归属">
              <el-select v-model="recordForm.positionCategory" placeholder="选择" style="width: 100%;">
                <el-option label="业务" value="业务" />
                <el-option label="职能" value="职能" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合作模式">
              <el-select v-model="recordForm.coopMode" placeholder="选择" style="width: 100%;">
                <el-option label="劳动合同-全日制" value="劳动合同-全日制" />
                <el-option label="劳动合同-非全日制" value="劳动合同-非全日制" />
                <el-option label="劳务合作-返聘" value="劳务合作-返聘" />
                <el-option label="劳务合作-兼职" value="劳务合作-兼职" />
                <el-option label="正常" value="正常" />
                <el-option label="非全日制" value="非全日制" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="城市">
              <el-input v-model="recordForm.city" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公司主体">
              <el-input v-model="recordForm.company" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属门店/部门">
              <el-input v-model="recordForm.store" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位薪酬模板">
              <el-select v-model="recordForm.templateName" placeholder="选择" filterable allow-create style="width: 100%;">
                <el-option v-for="t in templateOptions" :key="t.name" :label="t.name" :value="t.name" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计算生效时间" required>
              <el-date-picker v-model="recordForm.effectiveStart" type="datetime" placeholder="选择" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计算失效时间">
              <el-date-picker v-model="recordForm.effectiveEnd" type="datetime" placeholder="默认至今" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="recordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRecordSave">保存</el-button>
      </template>
    </el-dialog>

    <!-- 岗位模板新增/编辑弹窗 -->
    <el-dialog v-model="templateDialogVisible" :title="templateDialogMode === 'edit' ? '编辑岗位模板' : '新增岗位模板'" width="900px" destroy-on-close>
      <el-form :model="templateForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="模板名称">
              <el-input v-model="templateForm.name" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板类型">
              <el-select v-model="templateForm.templateType" placeholder="选择" style="width: 100%;">
                <el-option label="标准" value="标准" />
                <el-option label="自定义" value="自定义" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="关联岗位">
              <el-select v-model="templateForm.position" placeholder="选择" style="width: 100%;">
                <el-option label="推拿师" value="推拿师" />
                <el-option label="客户经理" value="客户经理" />
                <el-option label="调理师" value="调理师" />
                <el-option label="理疗师" value="理疗师" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位归属">
              <el-select v-model="templateForm.belongTo" placeholder="选择" style="width: 100%;">
                <el-option label="业务" value="业务" />
                <el-option label="职能" value="职能" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="合作模式">
              <el-select v-model="templateForm.coopMode" placeholder="选择" style="width: 100%;">
                <el-option label="劳动合同-全日制" value="劳动合同-全日制" />
                <el-option label="劳动合同-非全日制" value="劳动合同-非全日制" />
                <el-option label="劳务合作-返聘" value="劳务合作-返聘" />
                <el-option label="劳务合作-兼职" value="劳务合作-兼职" />
                <el-option label="正常" value="正常" />
                <el-option label="非全日制" value="非全日制" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="templateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleTemplateSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { usePlanningRecords, templateOptions } from '../composables/usePlanningRecords.js'

const router = useRouter()
const { planningList, addPlanningRecord } = usePlanningRecords()

const activeTab = ref('planning')

// ===== 人员薪酬规划 =====
const search = reactive({
  keyword: '', positionCategory: '', city: '', store: '',
  company: '', coopMode: '', templateName: ''
})

const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })

const storeOptions = computed(() => {
  const set = new Set(planningList.value.map(r => r.store).filter(Boolean))
  return Array.from(set)
})

const filteredList = computed(() => {
  const kw = search.keyword.trim()
  const rows = [...planningList.value].sort((a, b) => {
    if (a.talentId !== b.talentId) return a.talentId.localeCompare(b.talentId)
    return b.effectiveStart.localeCompare(a.effectiveStart)
  })
  return rows.filter(r => {
    if (kw && !(r.name.includes(kw) || r.talentId.includes(kw) || (r.store && r.store.includes(kw)) || (r.position && r.position.includes(kw)))) return false
    if (search.positionCategory && r.positionCategory !== search.positionCategory) return false
    if (search.city && r.city !== search.city) return false
    if (search.store && r.store !== search.store) return false
    if (search.company && r.company !== search.company) return false
    if (search.coopMode && r.coopMode !== search.coopMode) return false
    if (search.templateName && r.templateName !== search.templateName) return false
    return true
  })
})

const uniqueTalentCount = computed(() => new Set(planningList.value.map(r => r.talentId)).size)
const activeRecordCount = computed(() => planningList.value.filter(r => r.effectiveEnd === '2099-12-31 00:00:00').length)

const getCoopModeTag = (mode) => ({
  '劳动合同-全日制': 'primary',
  '劳动合同-非全日制': 'warning',
  '劳务合作-返聘': 'info',
  '劳务合作-兼职': 'success',
  '正常': '',
  '非全日制': 'warning'
}[mode] ?? '')

const applySearch = () => { /* computed auto */ }
const handleReset = () => {
  Object.keys(search).forEach(k => search[k] = '')
}
const goToChangeProcessing = () => router.push({ name: 'personnel-change-processing' })

// 新增 / 编辑 记录
const recordDialogVisible = ref(false)
const recordDialogMode = ref('create')
const recordForm = reactive({
  talentId: '', name: '', position: '', positionId: '',
  positionCategory: '业务', coopMode: '', city: '', company: '',
  store: '', templateName: '',
  effectiveStart: '', effectiveEnd: ''
})

const handleCreate = () => {
  recordDialogMode.value = 'create'
  Object.keys(recordForm).forEach(k => recordForm[k] = '')
  recordForm.positionCategory = '业务'
  recordDialogVisible.value = true
}

const handleEdit = (row) => {
  recordDialogMode.value = 'edit'
  Object.assign(recordForm, row)
  recordDialogVisible.value = true
}

const handleRecordSave = () => {
  if (!recordForm.talentId || !recordForm.name || !recordForm.templateName || !recordForm.effectiveStart) {
    ElMessage.warning('请填写人才ID / 姓名 / 岗位模板 / 计算生效时间')
    return
  }
  addPlanningRecord({
    ...recordForm,
    effectiveEnd: recordForm.effectiveEnd || '2099-12-31 00:00:00'
  })
  ElMessage.success('已保存')
  recordDialogVisible.value = false
}

// ===== 岗位模板列表 =====
const templateSearch = reactive({
  keyword: '', templateType: '', position: '', belongTo: '', coopMode: ''
})

const templatePagination = reactive({ currentPage: 1, pageSize: 10, total: 12 })

const templateList = ref([
  { id: '1140286973852839936', name: '客户经理收入', templateType: '标准', position: '客户经理', belongTo: '业务', coopMode: '正常', personCount: 0, updateTime: '2026-08-13 14:13:20' },
  { id: '1130154293132914688', name: '非全日制推拿师收入44', templateType: '标准', position: '调理师', belongTo: '业务', coopMode: '非全日制', personCount: 0, updateTime: '2026-07-16 15:09:41' },
  { id: '1130154248518103040', name: '非日制推拿师收入42', templateType: '标准', position: '调理师', belongTo: '业务', coopMode: '非日制', personCount: 0, updateTime: '2026-07-16 15:09:30' },
  { id: '1130154170256584704', name: '非日制推拿师收入40', templateType: '标准', position: '调理师', belongTo: '业务', coopMode: '非日制', personCount: 0, updateTime: '2026-07-16 15:09:11' },
  { id: '1130154117089587200', name: '非全日制推拿师收入50', templateType: '标准', position: '调理师', belongTo: '业务', coopMode: '非全日制', personCount: 0, updateTime: '2026-07-16 15:08:59' },
  { id: '1129684006991400960', name: '全日制推拿师基础提成20模板', templateType: '标准', position: '调理师', belongTo: '业务', coopMode: '正常', personCount: 0, updateTime: '2026-07-15 08:00:56' },
  { id: '1129683970026999808', name: '全日制推拿师基础提成24模板', templateType: '标准', position: '调理师', belongTo: '业务', coopMode: '正常', personCount: 0, updateTime: '2026-07-15 08:00:47' },
  { id: '1129483190892335104', name: '7月全日制推拿师超产值获豆', templateType: '标准', position: '调理师', belongTo: '业务', coopMode: '正常', personCount: 0, updateTime: '2026-07-14 18:42:57' },
  { id: '1128657470782537728', name: '7月全日制推拿师超产值补贴', templateType: '标准', position: '调理师', belongTo: '业务', coopMode: '正常', personCount: 0, updateTime: '2026-07-12 12:01:50' },
  { id: '1129491319435526144', name: '全职推拿师模板', templateType: '标准', position: '推拿师', belongTo: '业务', coopMode: '劳动合同-全日制', personCount: 12, updateTime: '2026-05-20 14:42:24' }
])

const templateDialogVisible = ref(false)
const templateDialogMode = ref('create')
const templateForm = reactive({
  id: '', name: '', templateType: '', position: '', belongTo: '', coopMode: ''
})

const handleTemplateSearch = () => {}
const handleTemplateReset = () => {
  Object.keys(templateSearch).forEach(k => templateSearch[k] = '')
}
const handleTemplateDetail = (row) => {
  router.push({ name: 'job-compensation-template-detail', params: { id: row.id } })
}
const handleTemplateEdit = (row) => {
  router.push({ name: 'job-compensation-template-detail', params: { id: row.id }, query: { mode: 'edit' } })
}
const handleCreateTemplate = () => {
  templateDialogMode.value = 'create'
  Object.keys(templateForm).forEach(k => templateForm[k] = '')
  templateDialogVisible.value = true
}
const handleTemplateSave = () => {
  templateDialogVisible.value = false
}

pagination.total = filteredList.value.length
</script>

<style scoped>
.personnel-position-salary-planning { padding: 0; }

.page-header { margin-bottom: 20px; }
.page-header h1 { font-size: 24px; font-weight: 600; margin: 0 0 8px 0; color: hsl(var(--foreground)); }
.page-header .tip { color: hsl(var(--muted-foreground)); font-size: 14px; margin: 0; }

.content-section {
  background: hsl(var(--background));
  border-radius: 8px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.planning-tabs :deep(.el-tabs__nav-wrap::after) { height: 1px; }
.planning-tabs :deep(.el-tabs__item) { font-size: 14px; font-weight: 500; }

.tab-pane-inner { padding-top: 4px; }

/* 统计条 */
.stat-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  margin-bottom: 16px;
  background: hsl(var(--muted) / 0.5);
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}
.stat-item { display: flex; align-items: center; gap: 6px; }
.stat-label { color: hsl(var(--muted-foreground)); font-size: 12px; }
.stat-value { font-size: 13px; font-weight: 500; color: hsl(var(--foreground)); }
.stat-link { color: hsl(var(--primary)); cursor: pointer; }
.stat-link:hover { text-decoration: underline; }
.stat-divider { width: 1px; height: 16px; background: hsl(var(--border)); }

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  flex-wrap: wrap;
  gap: 8px;
}
.toolbar-left { display: flex; gap: 8px; flex-wrap: wrap; }
.toolbar-tip { font-size: 12px; color: hsl(var(--muted-foreground)); }

.eff-ongoing { color: hsl(var(--muted-foreground)); }

.person-count { font-weight: 600; color: hsl(var(--primary)); }

.pagination-wrapper { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
