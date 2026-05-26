<template>
  <div class="employee-welfare-detail">
    <div class="page-header">
      <h1>员工福利保障明细</h1>
      <p class="tip">💡 员工入职后自动继承岗位薪酬模板中的福利标准，支持个体微调Override</p>
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
          <el-form-item label="缴纳类型">
            <el-select v-model="searchForm.type" placeholder="选择" clearable style="width: 100px;">
              <el-option label="社保" value="security" />
              <el-option label="公积金" value="fund" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary">搜索</el-button>
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
      <el-table :data="welfareList" stripe style="width: 100%; margin-top: 12px;">
        <el-table-column prop="employeeId" label="员工编号" width="120" />
        <el-table-column prop="employeeName" label="姓名" width="100" />
        <el-table-column prop="position" label="岗位" width="100" />
        <el-table-column prop="city" label="城市" width="80" />
        <el-table-column prop="salaryBase" label="薪资基数" width="100">
          <template #default="{ row }">
            ¥{{ row.salaryBase.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="社保" width="200">
          <template #default="{ row }">
            <div class="welfare-cell">
              <span class="base">基数: ¥{{ row.securityBase.toLocaleString() }}</span>
              <span class="ratio">比例: {{ (row.securityRatio * 100).toFixed(1) }}%</span>
              <el-tag v-if="row.securityIsOverride" type="warning" size="small" class="override-tag">已调整</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="公积金" width="200">
          <template #default="{ row }">
            <div class="welfare-cell">
              <span class="base">基数: ¥{{ row.fundBase.toLocaleString() }}</span>
              <span class="ratio">比例: {{ (row.fundRatio * 100).toFixed(1) }}%</span>
              <el-tag v-if="row.fundIsOverride" type="warning" size="small" class="override-tag">已调整</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="standardSource" label="标准来源" width="140">
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
    <el-dialog v-model="dialogVisible" title="调整福利配置" width="600px" destroy-on-close>
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

        <el-divider content-position="left">社保调整</el-divider>
        <el-form-item label="社保基数">
          <el-input-number v-model="form.securityBase" :min="0" :step="100" style="width: 100%;" />
          <div class="field-tip">原标准值：¥{{ form.originalSecurityBase }}</div>
        </el-form-item>
        <el-form-item label="社保比例">
          <el-input-number v-model="form.securityRatio" :min="0" :max="1" :step="0.001" style="width: 100%;" />
          <div class="field-tip">原标准值：{{ (form.originalSecurityRatio * 100).toFixed(1) }}%</div>
        </el-form-item>
        <el-form-item label="调整原因">
          <el-select v-model="form.securityReason" placeholder="选择原因" style="width: 100%;">
            <el-option label="员工申请" value="employee_request" />
            <el-option label="公司政策" value="company_policy" />
            <el-option label="薪资调整" value="salary_change" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-divider content-position="left">公积金调整</el-divider>
        <el-form-item label="公积金基数">
          <el-input-number v-model="form.fundBase" :min="0" :step="100" style="width: 100%;" />
          <div class="field-tip">原标准值：¥{{ form.originalFundBase }}</div>
        </el-form-item>
        <el-form-item label="公积金比例">
          <el-input-number v-model="form.fundRatio" :min="0" :max="1" :step="0.001" style="width: 100%;" />
          <div class="field-tip">原标准值：{{ (form.originalFundRatio * 100).toFixed(1) }}%</div>
        </el-form-item>
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
  type: ''
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 25
})

const standardCount = ref(20)
const overriddenCount = ref(5)

const welfareList = ref([
  { id: 1, employeeId: 'E001', employeeName: '张三', position: '推拿师', city: '北京', salaryBase: 8000, securityBase: 8000, securityRatio: 0.085, fundBase: 8000, fundRatio: 0.12, securityIsOverride: false, fundIsOverride: false, standardSource: '推拿师-北京-薪资8000档', updateTime: '2026-05-20 10:00:00' },
  { id: 2, employeeId: 'E002', employeeName: '李四', position: '推拿师', city: '北京', salaryBase: 5000, securityBase: 5000, securityRatio: 0.085, fundBase: 6000, fundRatio: 0.12, securityIsOverride: false, fundIsOverride: true, standardSource: '推拿师-北京-薪资5000档', updateTime: '2026-05-18 14:30:00' },
  { id: 3, employeeId: 'E003', employeeName: '王五', position: '客户经理', city: '上海', salaryBase: 12000, securityBase: 12000, securityRatio: 0.105, fundBase: 12000, fundRatio: 0.07, securityIsOverride: true, fundIsOverride: false, standardSource: '客户经理-上海-薪资12000档', updateTime: '2026-05-15 09:20:00' },
  { id: 4, employeeId: 'E004', employeeName: '赵六', position: '理疗师', city: '深圳', salaryBase: 10000, securityBase: 10000, securityRatio: 0.085, fundBase: 10000, fundRatio: 0.05, securityIsOverride: false, fundIsOverride: false, standardSource: '理疗师-深圳-薪资10000档', updateTime: '2026-05-20 10:00:00' },
  { id: 5, employeeId: 'E005', employeeName: '钱七', position: '推拿师', city: '上海', salaryBase: 8000, securityBase: 8000, securityRatio: 0.105, fundBase: 8000, fundRatio: 0.07, securityIsOverride: false, fundIsOverride: false, standardSource: '推拿师-上海-薪资8000档', updateTime: '2026-05-20 10:00:00' }
])

const dialogVisible = ref(false)
const logDialogVisible = ref(false)
const form = reactive({
  id: null,
  employeeName: '',
  positionCity: '',
  salaryBase: 0,
  securityBase: 0,
  securityRatio: 0,
  securityReason: '',
  fundBase: 0,
  fundRatio: 0,
  fundReason: '',
  originalSecurityBase: 0,
  originalSecurityRatio: 0,
  originalFundBase: 0,
  originalFundRatio: 0
})

const logList = ref([
  { time: '2026-05-18 14:30:00', operator: '系统管理员', field: '公积金基数', beforeValue: '5000', afterValue: '6000', reason: '员工申请提高缴纳' },
  { time: '2026-05-15 09:20:00', operator: '系统管理员', field: '社保比例', beforeValue: '8.5%', afterValue: '10.5%', reason: '政策调整' }
])

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.position = ''
  searchForm.city = ''
  searchForm.type = ''
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
    positionCity: `${row.position} / ${row.city}`,
    salaryBase: `¥${row.salaryBase.toLocaleString()}`,
    securityBase: row.securityBase,
    securityRatio: row.securityRatio,
    securityReason: '',
    fundBase: row.fundBase,
    fundRatio: row.fundRatio,
    fundReason: '',
    originalSecurityBase: row.securityBase,
    originalSecurityRatio: row.securityRatio,
    originalFundBase: row.fundBase,
    originalFundRatio: row.fundRatio
  })
  dialogVisible.value = true
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
  gap: 2px;
  font-size: 12px;
}

.welfare-cell .base {
  color: hsl(var(--foreground));
}

.welfare-cell .ratio {
  color: hsl(var(--muted-foreground));
}

.override-tag {
  margin-top: 2px;
  width: fit-content;
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
</style>