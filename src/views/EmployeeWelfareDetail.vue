<template>
  <div class="employee-welfare-detail">
    <div class="page-header">
      <h1>员工福利保障明细</h1>
      <p class="tip">💡 员工入职后自动继承岗位薪酬模板中的福利标准，支持个体微调Override。福利按三大类聚合：<strong>社保 / 公积金 / 商业险</strong>，社保和商业险支持查看明细。</p>
    </div>

    <div class="content-section">
      <!-- 筛选区 -->
      <div class="search-section">
        <el-form :inline="true" class="demo-form-inline">
          <el-form-item label="员工姓名/编号">
            <el-input v-model="searchForm.keyword" placeholder="搜索" clearable style="width: 160px;" />
          </el-form-item>
          <el-form-item label="岗位">
            <el-select v-model="searchForm.position" placeholder="选择" clearable style="width: 120px;">
              <el-option label="推拿师" value="therapist" />
              <el-option label="客户经理" value="manager" />
              <el-option label="理疗师" value="physiotherapist" />
            </el-select>
          </el-form-item>
          <el-form-item label="城市">
            <el-select v-model="searchForm.city" placeholder="选择" clearable style="width: 120px;">
              <el-option label="北京" value="beijing" />
              <el-option label="上海" value="shanghai" />
              <el-option label="深圳" value="shenzhen" />
            </el-select>
          </el-form-item>
          <el-form-item label="用工类型">
            <el-select v-model="searchForm.workerType" placeholder="选择" clearable style="width: 110px;">
              <el-option label="全职" value="fulltime" />
              <el-option label="非全日制" value="contingent" />
              <el-option label="兼职" value="parttime" />
            </el-select>
          </el-form-item>
          <el-form-item label="福利类别">
            <el-select v-model="searchForm.category" placeholder="选择" clearable style="width: 120px;">
              <el-option label="社保" value="socialSecurity" />
              <el-option label="公积金" value="housingFund" />
              <el-option label="商业险" value="commercial" />
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
          <el-button type="primary" @click="handleBatchOverride">批量调整</el-button>
          <el-button @click="handleImport">导入</el-button>
          <el-button @click="handleExport">导出</el-button>
        </div>
        <div class="toolbar-right">
          <el-tag type="info" size="small">
            <span>标准继承员工数：</span>
            <span class="count">{{ standardCount }}</span>
          </el-tag>
          <el-tag type="warning" size="small">
            <span>已微调员工数：</span>
            <span class="count">{{ overriddenCount }}</span>
          </el-tag>
        </div>
      </div>

      <!-- 员工福利列表 -->
      <el-table :data="filteredList" stripe style="width: 100%; margin-top: 12px;">
        <el-table-column prop="employeeId" label="员工编号" width="110" />
        <el-table-column prop="employeeName" label="姓名" width="90" />
        <el-table-column prop="position" label="岗位" width="100" />
        <el-table-column prop="city" label="城市" width="80" />
        <el-table-column prop="workerType" label="用工类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getWorkerTypeTag(row.workerType)" size="small">
              {{ getWorkerTypeLabel(row.workerType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="salaryBase" label="薪资基数" width="100">
          <template #default="{ row }">
            ¥{{ row.salaryBase.toLocaleString() }}
          </template>
        </el-table-column>

        <!-- 社保 -->
        <el-table-column label="社保（元/月）" width="220" align="center">
          <template #default="{ row }">
            <div class="welfare-cell">
              <div class="cell-line">
                <span class="label">公司：</span>
                <span class="value">¥{{ getSocialSecurityTotal(row).company.toLocaleString() }}</span>
              </div>
              <div class="cell-line">
                <span class="label">个人：</span>
                <span class="value">¥{{ getSocialSecurityTotal(row).employee.toLocaleString() }}</span>
              </div>
              <el-popover v-if="row.socialSecurity.length > 0" placement="left" :width="300" trigger="click">
                <template #reference>
                  <el-button type="primary" link size="small" class="detail-link">查看明细 ▾</el-button>
                </template>
                <div class="detail-popover">
                  <div class="detail-title">社保明细（共 {{ row.socialSecurity.length }} 项）</div>
                  <div v-for="item in row.socialSecurity" :key="item.type" class="detail-row">
                    <span class="detail-type">{{ item.type }}</span>
                    <span class="detail-amount">公司 ¥{{ item.company }} / 个人 ¥{{ item.employee }}</span>
                  </div>
                </div>
              </el-popover>
              <span v-else class="empty-text">—</span>
            </div>
          </template>
        </el-table-column>

        <!-- 公积金 -->
        <el-table-column label="公积金（元/月）" width="180" align="center">
          <template #default="{ row }">
            <div class="welfare-cell">
              <div class="cell-line">
                <span class="label">公司：</span>
                <span class="value">¥{{ row.housingFund.company.toLocaleString() }}</span>
              </div>
              <div class="cell-line">
                <span class="label">个人：</span>
                <span class="value">¥{{ row.housingFund.employee.toLocaleString() }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 商业险 -->
        <el-table-column label="商业险（元/月）" width="220" align="center">
          <template #default="{ row }">
            <div class="welfare-cell">
              <div class="cell-line">
                <span class="label">公司：</span>
                <span class="value">¥{{ getCommercialTotal(row).company.toLocaleString() }}</span>
              </div>
              <div class="cell-line">
                <span class="label">个人：</span>
                <span class="value">¥0</span>
              </div>
              <el-popover v-if="row.commercialInsurances.length > 0" placement="left" :width="320" trigger="click">
                <template #reference>
                  <el-button type="primary" link size="small" class="detail-link">查看明细 ▾</el-button>
                </template>
                <div class="detail-popover">
                  <div class="detail-title">商业险明细（共 {{ row.commercialInsurances.length }} 项）</div>
                  <div v-for="item in row.commercialInsurances" :key="item.name" class="detail-row">
                    <span class="detail-type">{{ item.name }}</span>
                    <span class="detail-amount">公司 ¥{{ item.company }} / 月</span>
                  </div>
                </div>
              </el-popover>
              <span v-else class="empty-text">—</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="standardSource" label="标准来源" width="180">
          <template #default="{ row }">
            <el-tooltip :content="row.standardSource" placement="top">
              <span class="source-text">{{ row.standardSource }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="160" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleEdit(row)">调整</el-button>
            <el-button type="info" size="small" link @click="handleViewLog(row)">日志</el-button>
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

    <!-- 调整弹窗 -->
    <el-dialog v-model="dialogVisible" title="调整福利配置" width="780px" destroy-on-close>
      <el-form :model="form" label-width="100px">
        <el-form-item label="员工">
          <el-input v-model="form.employeeName" disabled style="width: 100%;" />
        </el-form-item>
        <el-form-item label="岗位/城市">
          <el-input v-model="form.positionCity" disabled style="width: 100%;" />
        </el-form-item>
        <el-form-item label="当前薪资基数">
          <el-input v-model="form.salaryBase" disabled style="width: 100%;" />
        </el-form-item>

        <!-- 社保明细编辑 -->
        <el-divider content-position="left">社保调整（元/月）</el-divider>
        <el-form-item label="明细">
          <div v-if="form.socialSecurity.length === 0" class="empty-tip">该员工无社保</div>
          <div v-else class="form-item-list">
            <div v-for="item in form.socialSecurity" :key="item.type" class="form-item-row">
              <span class="form-item-label">{{ item.type }}</span>
              <el-input-number v-model="item.company" :min="0" :step="50" size="small" controls-position="right" style="width: 130px;" />
              <span class="slash">/</span>
              <el-input-number v-model="item.employee" :min="0" :step="50" size="small" controls-position="right" style="width: 130px;" />
              <span class="form-item-hint">公司 / 个人</span>
            </div>
            <div class="form-item-row total-row">
              <span class="form-item-label"><strong>合计</strong></span>
              <span class="form-item-total">公司 ¥{{ socialSecurityFormTotal.company }} / 个人 ¥{{ socialSecurityFormTotal.employee }}</span>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="调整原因">
          <el-select v-model="form.securityReason" placeholder="选择原因" style="width: 100%;">
            <el-option label="员工申请" value="employee_request" />
            <el-option label="公司政策" value="company_policy" />
            <el-option label="薪资调整" value="salary_change" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <!-- 商业险明细编辑 -->
        <el-divider content-position="left">商业险调整（元/月，公司全额）</el-divider>
        <el-form-item label="明细">
          <div v-if="form.commercialInsurances.length === 0" class="empty-tip">该员工无商业险</div>
          <div v-else class="form-item-list">
            <div v-for="(item, idx) in form.commercialInsurances" :key="idx" class="form-item-row">
              <span class="form-item-label">{{ item.name }}</span>
              <el-input-number v-model="item.company" :min="0" :step="50" size="small" controls-position="right" style="width: 130px;" />
              <span class="form-item-hint">公司</span>
              <el-button type="danger" size="small" link @click="removeCommercialInsurance(idx)">删除</el-button>
            </div>
            <div class="form-item-row total-row">
              <span class="form-item-label"><strong>合计</strong></span>
              <span class="form-item-total">公司 ¥{{ commercialFormTotal.company }} / 月</span>
            </div>
          </div>
        </el-form-item>

        <!-- 公积金 -->
        <el-divider content-position="left">公积金调整（元/月）</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="公司部分">
              <el-input-number v-model="form.housingFund.company" :min="0" :step="100" style="width: 100%;" />
              <div class="field-tip">原标准值：¥{{ form.originalHousingFundCompany }}</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="个人部分">
              <el-input-number v-model="form.housingFund.employee" :min="0" :step="100" style="width: 100%;" />
              <div class="field-tip">原标准值：¥{{ form.originalHousingFundEmployee }}</div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="调整原因">
          <el-select v-model="form.fundReason" placeholder="选择原因" style="width: 100%;">
            <el-option label="员工申请" value="employee_request" />
            <el-option label="公司政策" value="company_policy" />
            <el-option label="薪资调整" value="salary_change" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <!-- 日志弹窗 -->
    <el-dialog v-model="logDialogVisible" title="调整日志" width="700px">
      <el-table :data="logList" stripe>
        <el-table-column prop="time" label="时间" width="160" />
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="field" label="调整字段" width="120" />
        <el-table-column prop="beforeValue" label="原值" width="120" />
        <el-table-column prop="afterValue" label="新值" width="120" />
        <el-table-column prop="reason" label="原因" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'

const searchForm = reactive({
  keyword: '',
  position: '',
  city: '',
  workerType: '',
  category: ''
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 7
})

const standardCount = ref(6)
const overriddenCount = ref(1)

// 福利数据 - 按三类聚合
const welfareList = ref([
  // 全职：社保全（5 项）+ 公积金 + 商业险
  {
    id: 1, employeeId: 'E001', employeeName: '张三', position: '推拿师', city: '北京', workerType: 'fulltime', salaryBase: 8000,
    socialSecurity: [
      { type: '养老', company: 320, employee: 80 },
      { type: '医疗', company: 200, employee: 50 },
      { type: '失业', company: 80, employee: 20 },
      { type: '工伤', company: 40, employee: 0 },
      { type: '生育', company: 40, employee: 20 }
    ],
    housingFund: { company: 480, employee: 480 },
    commercialInsurances: [
      { name: '雇主责任险-基础版', company: 100, employee: 0 }
    ],
    standardSource: '推拿师-北京（社保全+公积金+商业险:雇主责任险）',
    updateTime: '2026-05-20 10:00:00'
  },
  {
    id: 3, employeeId: 'E003', employeeName: '王五', position: '客户经理', city: '上海', workerType: 'fulltime', salaryBase: 12000,
    socialSecurity: [
      { type: '养老', company: 480, employee: 120 },
      { type: '医疗', company: 300, employee: 75 },
      { type: '失业', company: 120, employee: 30 },
      { type: '工伤', company: 60, employee: 0 },
      { type: '生育', company: 300, employee: 90 }
    ],
    housingFund: { company: 840, employee: 840 },
    commercialInsurances: [
      { name: '雇主责任险-基础版', company: 100, employee: 0 }
    ],
    standardSource: '客户经理-上海（社保全+公积金+商业险:雇主责任险）',
    updateTime: '2026-05-15 09:20:00'
  },
  {
    id: 4, employeeId: 'E004', employeeName: '赵六', position: '理疗师', city: '深圳', workerType: 'fulltime', salaryBase: 10000,
    socialSecurity: [
      { type: '养老', company: 340, employee: 85 },
      { type: '医疗', company: 200, employee: 50 },
      { type: '失业', company: 80, employee: 20 },
      { type: '工伤', company: 30, employee: 0 },
      { type: '生育', company: 200, employee: 57.5 }
    ],
    housingFund: { company: 500, employee: 500 },
    commercialInsurances: [
      { name: '雇主责任险-基础版', company: 125, employee: 0 }
    ],
    standardSource: '理疗师-深圳（社保全+公积金+商业险:雇主责任险）',
    updateTime: '2026-05-20 10:00:00'
  },
  {
    id: 5, employeeId: 'E005', employeeName: '钱七', position: '推拿师', city: '上海', workerType: 'fulltime', salaryBase: 8000,
    socialSecurity: [
      { type: '养老', company: 320, employee: 80 },
      { type: '医疗', company: 200, employee: 50 },
      { type: '失业', company: 80, employee: 20 },
      { type: '工伤', company: 40, employee: 0 },
      { type: '生育', company: 200, employee: 60 }
    ],
    housingFund: { company: 560, employee: 560 },
    commercialInsurances: [
      { name: '雇主责任险-基础版', company: 100, employee: 0 }
    ],
    standardSource: '推拿师-上海（社保全+公积金+商业险:雇主责任险）',
    updateTime: '2026-05-20 10:00:00'
  },
  // 非全日制：仅社保（仅工伤保险） → 合并入社保明细（1 项）
  {
    id: 6, employeeId: 'E006', employeeName: '孙八', position: '推拿师', city: '北京', workerType: 'contingent', salaryBase: 6000,
    socialSecurity: [
      { type: '工伤', company: 30, employee: 0 }
    ],
    housingFund: { company: 0, employee: 0 },
    commercialInsurances: [],
    standardSource: '非全日制-北京-社保（仅工伤）',
    updateTime: '2026-05-20 10:00:00'
  },
  // 兼职：仅商业险
  {
    id: 2, employeeId: 'E002', employeeName: '李四', position: '推拿师', city: '北京', workerType: 'parttime', salaryBase: 5000,
    socialSecurity: [],
    housingFund: { company: 0, employee: 0 },
    commercialInsurances: [
      { name: '雇主责任险-基础版', company: 120, employee: 0 }
    ],
    standardSource: '兼职-北京-商业险（雇主责任险）',
    updateTime: '2026-05-18 14:30:00'
  },
  {
    id: 7, employeeId: 'E007', employeeName: '周九', position: '客户经理', city: '深圳', workerType: 'parttime', salaryBase: 8000,
    socialSecurity: [],
    housingFund: { company: 0, employee: 0 },
    commercialInsurances: [
      { name: '雇主责任险-基础版', company: 150, employee: 0 }
    ],
    standardSource: '兼职-深圳-商业险（雇主责任险）',
    updateTime: '2026-05-19 11:00:00'
  }
])

// 计算社保合计
const getSocialSecurityTotal = (row) => {
  return {
    company: row.socialSecurity.reduce((sum, item) => sum + (item.company || 0), 0),
    employee: row.socialSecurity.reduce((sum, item) => sum + (item.employee || 0), 0)
  }
}

// 计算商业险合计
const getCommercialTotal = (row) => {
  return {
    company: row.commercialInsurances.reduce((sum, item) => sum + (item.company || 0), 0),
    employee: 0
  }
}

// 过滤
const filteredList = computed(() => {
  let result = welfareList.value
  if (searchForm.keyword) {
    result = result.filter(item =>
      item.employeeName.includes(searchForm.keyword) || item.employeeId.includes(searchForm.keyword)
    )
  }
  if (searchForm.position) {
    result = result.filter(item => item.position === searchForm.position)
  }
  if (searchForm.city) {
    result = result.filter(item => item.city === searchForm.city)
  }
  if (searchForm.workerType) {
    result = result.filter(item => item.workerType === searchForm.workerType)
  }
  if (searchForm.category) {
    if (searchForm.category === 'socialSecurity') {
      result = result.filter(item => item.socialSecurity.length > 0)
    } else if (searchForm.category === 'housingFund') {
      result = result.filter(item => item.housingFund.company > 0 || item.housingFund.employee > 0)
    } else if (searchForm.category === 'commercial') {
      result = result.filter(item => item.commercialInsurances.length > 0)
    }
  }
  return result
})

const getWorkerTypeLabel = (type) => {
  const map = { fulltime: '全职', contingent: '非全日制', parttime: '兼职' }
  return map[type] || type
}

const getWorkerTypeTag = (type) => {
  const map = { fulltime: 'success', contingent: 'warning', parttime: 'info' }
  return map[type] || 'default'
}

const dialogVisible = ref(false)
const logDialogVisible = ref(false)
const form = reactive({
  id: null,
  employeeName: '',
  positionCity: '',
  salaryBase: '',
  socialSecurity: [],
  housingFund: { company: 0, employee: 0 },
  commercialInsurances: [],
  securityReason: '',
  fundReason: '',
  originalHousingFundCompany: 0,
  originalHousingFundEmployee: 0
})

// 表单中社保合计
const socialSecurityFormTotal = computed(() => {
  return {
    company: form.socialSecurity.reduce((sum, item) => sum + (item.company || 0), 0),
    employee: form.socialSecurity.reduce((sum, item) => sum + (item.employee || 0), 0)
  }
})

// 表单中商业险合计
const commercialFormTotal = computed(() => {
  return {
    company: form.commercialInsurances.reduce((sum, item) => sum + (item.company || 0), 0)
  }
})

const logList = ref([
  { time: '2026-05-18 14:30:00', operator: '系统管理员', field: '公积金基数', beforeValue: '5000', afterValue: '6000', reason: '员工申请提高缴纳' },
  { time: '2026-05-15 09:20:00', operator: '系统管理员', field: '社保比例', beforeValue: '8.5%', afterValue: '10.5%', reason: '政策调整' }
])

const handleSearch = () => {
  ElMessage.success(`已筛选，共 ${filteredList.value.length} 条`)
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.position = ''
  searchForm.city = ''
  searchForm.workerType = ''
  searchForm.category = ''
}

const handleBatchOverride = () => {
  ElMessage.info('批量调整功能开发中')
}

const handleImport = () => {
  ElMessage.info('导入功能开发中')
}

const handleExport = () => {
  ElMessage.info('导出功能开发中')
}

const handleEdit = (row) => {
  Object.assign(form, {
    id: row.id,
    employeeName: row.employeeName,
    positionCity: `${row.position} / ${row.city} / ${getWorkerTypeLabel(row.workerType)}`,
    salaryBase: `¥${row.salaryBase.toLocaleString()}`,
    socialSecurity: JSON.parse(JSON.stringify(row.socialSecurity)),
    housingFund: { ...row.housingFund },
    commercialInsurances: JSON.parse(JSON.stringify(row.commercialInsurances)),
    securityReason: '',
    fundReason: '',
    originalHousingFundCompany: row.housingFund.company,
    originalHousingFundEmployee: row.housingFund.employee
  })
  dialogVisible.value = true
}

const removeCommercialInsurance = (idx) => {
  form.commercialInsurances.splice(idx, 1)
}

const handleViewLog = (row) => {
  logDialogVisible.value = true
}

const handleSave = () => {
  dialogVisible.value = false
  ElMessage.success('调整保存成功')
}
</script>

<style scoped>
.employee-welfare-detail {
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
  margin-bottom: 12px;
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

.welfare-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 12px;
}

.cell-line {
  display: flex;
  gap: 4px;
  white-space: nowrap;
}

.welfare-cell .label {
  color: hsl(var(--muted-foreground));
}

.welfare-cell .value {
  color: hsl(var(--foreground));
  font-weight: 500;
  min-width: 50px;
}

.detail-link {
  font-size: 12px;
  padding: 0;
  margin-top: 2px;
}

.empty-text {
  color: hsl(var(--muted-foreground) / 0.5);
  font-size: 12px;
}

.detail-popover {
  font-size: 13px;
}

.detail-title {
  font-weight: 600;
  margin-bottom: 8px;
  color: hsl(var(--foreground));
  padding-bottom: 6px;
  border-bottom: 1px solid hsl(var(--border));
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px dashed hsl(var(--border));
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-type {
  color: hsl(var(--muted-foreground));
  font-weight: 500;
}

.detail-amount {
  color: hsl(var(--foreground));
  font-weight: 500;
}

.source-text {
  color: hsl(var(--muted-foreground));
  cursor: pointer;
}

.source-text:hover {
  color: hsl(var(--primary));
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
}

.form-item-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: hsl(var(--muted) / 0.2);
  border-radius: 6px;
}

.form-item-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-item-row.total-row {
  padding-top: 8px;
  border-top: 1px dashed hsl(var(--border));
  justify-content: space-between;
}

.form-item-label {
  width: 80px;
  font-size: 13px;
  color: hsl(var(--foreground));
}

.slash {
  color: hsl(var(--muted-foreground));
  font-size: 13px;
}

.form-item-hint {
  color: hsl(var(--muted-foreground));
  font-size: 12px;
}

.form-item-total {
  color: hsl(var(--primary));
  font-weight: 500;
  font-size: 13px;
}

.empty-tip {
  color: hsl(var(--muted-foreground));
  font-size: 13px;
  padding: 8px 0;
}
</style>
