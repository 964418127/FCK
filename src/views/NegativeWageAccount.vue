<template>
  <div class="negative-wage-account">
    <div class="page-header">
      <h1>员工负工资账户</h1>
      <p class="tip">💡 查看员工负工资实时余额，支持手动新增来源记录</p>
    </div>

    <div class="content-section">
      <!-- 搜索筛选 -->
      <div class="search-section">
        <el-form :inline="true" class="demo-form-inline">
          <el-form-item label="姓名/工号">
            <el-input v-model="searchForm.keyword" placeholder="请输入姓名或工号" clearable style="width: 140px;" />
          </el-form-item>
          <el-form-item label="部门">
            <el-input v-model="searchForm.department" placeholder="请输入部门" clearable style="width: 120px;" />
          </el-form-item>
          <el-form-item label="余额范围">
            <el-input-number v-model="searchForm.balanceMin" :max="0" :step="100" placeholder="最小（≤0）" controls-position="right" style="width: 130px;" />
            <span style="margin: 0 6px; color: hsl(var(--muted-foreground));">至</span>
            <el-input-number v-model="searchForm.balanceMax" :max="0" :step="100" placeholder="最大（≤0）" controls-position="right" style="width: 130px;" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button type="primary" @click="openBatchAddDialog">批量新增来源</el-button>
        </div>
      </div>

      <!-- 数据表格 -->
      <el-table :data="filteredData" stripe style="width: 100%; margin-top: 12px;">
        <el-table-column prop="employeeId" label="工号" width="100" />
        <el-table-column prop="employeeName" label="姓名" width="100" />
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column prop="position" label="岗位" width="100" />
        <el-table-column prop="cooperationType" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.cooperationType === '全职' ? 'primary' : 'warning'" size="small">
              {{ row.cooperationType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="currentBalance" label="当前负工资余额" width="140">
          <template #default="{ row }">
            <span :class="row.currentBalance < 0 ? 'balance-negative' : 'balance-zero'">
              {{ formatBalance(row.currentBalance) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="totalSource" label="历史累计来源" width="130">
          <template #default="{ row }">
            <span class="amount-negative">{{ formatAmount(row.totalSource) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalDeducted" label="历史累计抵扣" width="130">
          <template #default="{ row }">
            <span class="amount-positive">{{ formatAmount(row.totalDeducted) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="viewRecords(row)">查看流水</el-button>
            <el-button type="primary" size="small" link @click="openAddSourceDialog(row)">新增来源</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增来源弹窗 -->
    <el-dialog v-model="addSourceDialogVisible" title="新增负工资来源" width="600px">
      <el-tabs v-model="addSourceTab" class="add-source-tabs">
        <el-tab-pane label="单个新增" name="single">
          <el-form :model="addSourceForm" label-width="90px" style="margin-top: 16px;">
            <el-form-item label="员工">
              <el-select v-model="addSourceForm.employeeId" placeholder="请选择员工" style="width: 100%;" @change="handleEmployeeChange">
                <el-option v-for="emp in employeeList" :key="emp.id" :label="`${emp.name} (${emp.id})`" :value="emp.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="来源类型">
              <el-select v-model="addSourceForm.sourceType" placeholder="请选择类型" style="width: 100%;">
                <el-option label="预支" value="advance" />
                <el-option label="罚款" value="penalty" />
                <el-option label="扣款" value="deduction" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
            <el-form-item label="金额">
              <el-input-number v-model="addSourceForm.amount" :min="1" :step="100" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="addSourceForm.remark" type="textarea" :rows="2" placeholder="请输入备注" />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="addSourceDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleAddSource">确认</el-button>
          </template>
        </el-tab-pane>
        <el-tab-pane label="批量导入" name="batch">
          <div class="batch-upload" style="margin: 16px 0;">
            <el-upload
              ref="uploadRef"
              class="upload-demo"
              drag
              :auto-upload="false"
              :limit="1"
              accept=".xlsx,.xls"
              :on-change="handleFileChange"
              :file-list="fileList"
            >
              <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
              <div class="el-upload__text">将Excel文件拖到此处，或<em>点击上传</em></div>
              <template #tip>
                <div class="el-upload__tip">只能上传xlsx/xls文件</div>
              </template>
            </el-upload>
            <div class="upload-actions" style="margin-top: 16px;">
              <el-button type="primary" @click="handleDownloadTemplate">下载模板</el-button>
              <el-button @click="handleUpload">开始导入</el-button>
            </div>
          </div>
          <el-table :data="batchPreviewData" stripe style="width: 100%; margin-top: 16px;" max-height="300" v-if="batchPreviewData.length > 0">
            <el-table-column prop="employeeId" label="工号" width="100" />
            <el-table-column prop="employeeName" label="姓名" width="100" />
            <el-table-column prop="sourceType" label="来源类型" width="100">
              <template #default="{ row }">
                {{ getSourceTypeText(row.sourceType) }}
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="金额" width="100" />
            <el-table-column prop="remark" label="备注" />
          </el-table>
          <template #footer v-if="batchPreviewData.length > 0">
            <el-button @click="addSourceDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleBatchConfirm">确认导入 {{ batchPreviewData.length }} 条</el-button>
          </template>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  keyword: '',
  department: '',
  balanceMin: null,
  balanceMax: null
})

// 员工列表（模拟数据）
const employeeList = ref([
  { id: 'E001', name: '张三', department: '按摩部', position: '推拿师', cooperationType: '全职' },
  { id: 'E002', name: '李四', department: '按摩部', position: '推拿师', cooperationType: '全职' },
  { id: 'E003', name: '王五', department: '客服部', position: '客户经理', cooperationType: '兼职' },
  { id: 'E004', name: '赵六', department: '按摩部', position: '推拿师', cooperationType: '全职' },
  { id: 'E005', name: '钱七', department: '销售部', position: '销售', cooperationType: '兼职' }
])

// 新增来源弹窗
const addSourceDialogVisible = ref(false)
const addSourceTab = ref('single')
const addSourceForm = reactive({
  employeeId: '',
  employeeName: '',
  sourceType: '',
  amount: 0,
  remark: ''
})
const uploadRef = ref()
const fileList = ref([])
const batchPreviewData = ref([])

// 负工资账户数据（模拟数据）
const accountData = ref([
  {
    id: 1,
    employeeId: 'E001',
    employeeName: '张三',
    department: '按摩部',
    position: '推拿师',
    cooperationType: '全职',
    currentBalance: -1500,
    totalSource: -2000,
    totalDeducted: 500
  },
  {
    id: 2,
    employeeId: 'E002',
    employeeName: '李四',
    department: '按摩部',
    position: '推拿师',
    cooperationType: '全职',
    currentBalance: -3200,
    totalSource: -5000,
    totalDeducted: 1800
  },
  {
    id: 3,
    employeeId: 'E003',
    employeeName: '王五',
    department: '客服部',
    position: '客户经理',
    cooperationType: '兼职',
    currentBalance: 0,
    totalSource: -800,
    totalDeducted: 800
  },
  {
    id: 4,
    employeeId: 'E004',
    employeeName: '赵六',
    department: '按摩部',
    position: '推拿师',
    cooperationType: '全职',
    currentBalance: -500,
    totalSource: -500,
    totalDeducted: 0
  }
])

// 过滤后的数据
const filteredData = computed(() => {
  return accountData.value.filter(item => {
    const matchKeyword = !searchForm.keyword ||
      item.employeeId.includes(searchForm.keyword) ||
      item.employeeName.includes(searchForm.keyword)
    const matchDepartment = !searchForm.department || item.department.includes(searchForm.department)
    const matchBalance = (
      (searchForm.balanceMin === null || item.currentBalance >= searchForm.balanceMin) &&
      (searchForm.balanceMax === null || item.currentBalance <= searchForm.balanceMax)
    )
    return matchKeyword && matchDepartment && matchBalance
  })
})

// 格式化余额显示
const formatBalance = (val) => {
  if (val < 0) return val.toLocaleString()
  return '0'
}

// 格式化金额显示
const formatAmount = (val) => {
  return Math.abs(val).toLocaleString()
}

// 搜索
const handleSearch = () => {
  // 模拟搜索
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.department = ''
  searchForm.balanceMin = null
  searchForm.balanceMax = null
}

// 查看流水
const viewRecords = (row) => {
  router.push({
    name: 'negative-wage-record',
    query: {
      employeeId: row.employeeId,
      employeeName: row.employeeName
    }
  })
}

// 打开新增来源弹窗
const openAddSourceDialog = (row) => {
  addSourceTab.value = 'single'
  addSourceForm.employeeId = row.employeeId
  addSourceForm.employeeName = row.employeeName
  addSourceForm.sourceType = ''
  addSourceForm.amount = 0
  addSourceForm.remark = ''
  batchPreviewData.value = []
  fileList.value = []
  addSourceDialogVisible.value = true
}

// 打开批量新增弹窗
const openBatchAddDialog = () => {
  addSourceTab.value = 'batch'
  addSourceForm.employeeId = ''
  addSourceForm.employeeName = ''
  addSourceForm.sourceType = ''
  addSourceForm.amount = 0
  addSourceForm.remark = ''
  batchPreviewData.value = []
  fileList.value = []
  addSourceDialogVisible.value = true
}

// 选择员工
const handleEmployeeChange = (empId) => {
  const emp = employeeList.value.find(e => e.id === empId)
  if (emp) {
    addSourceForm.employeeName = emp.name
  }
}

// 新增来源
const handleAddSource = () => {
  if (!addSourceForm.employeeId) {
    ElMessage.warning('请选择员工')
    return
  }
  if (!addSourceForm.sourceType) {
    ElMessage.warning('请选择来源类型')
    return
  }
  if (!addSourceForm.amount || addSourceForm.amount <= 0) {
    ElMessage.warning('请输入正确金额')
    return
  }

  // 更新账户数据
  const account = accountData.value.find(a => a.employeeId === addSourceForm.employeeId)
  if (account) {
    account.currentBalance -= addSourceForm.amount
    account.totalSource -= addSourceForm.amount
    ElMessage.success('新增成功')
  }

  addSourceDialogVisible.value = false
}

// 获取来源类型文本
const getSourceTypeText = (sourceType) => {
  const map = {
    advance: '预支',
    penalty: '罚款',
    deduction: '扣款',
    other: '其他'
  }
  return map[sourceType] || sourceType
}

// 文件选择
const handleFileChange = (file) => {
  // 模拟解析Excel，实际应该用 xlsx 库解析
  // 这里模拟几条数据
  setTimeout(() => {
    batchPreviewData.value = [
      { employeeId: 'E001', employeeName: '张三', sourceType: 'advance', amount: 500, remark: '预支生活费' },
      { employeeId: 'E002', employeeName: '李四', sourceType: 'penalty', amount: 200, remark: '迟到罚款' },
      { employeeId: 'E003', employeeName: '王五', sourceType: 'deduction', amount: 300, remark: '损坏设备扣款' }
    ]
  }, 500)
}

// 下载模板
const handleDownloadTemplate = () => {
  // 模拟下载，实际应该生成Excel模板
  ElMessage.info('下载模板功能（待实现）')
}

// 上传
const handleUpload = () => {
  if (batchPreviewData.value.length === 0) {
    ElMessage.warning('请先上传文件')
    return
  }
  ElMessage.success('解析成功，请确认数据')
}

// 确认导入
const handleBatchConfirm = () => {
  if (batchPreviewData.value.length === 0) {
    ElMessage.warning('没有可导入的数据')
    return
  }

  // 模拟批量更新
  batchPreviewData.value.forEach(item => {
    const account = accountData.value.find(a => a.employeeId === item.employeeId)
    if (account) {
      account.currentBalance -= item.amount
      account.totalSource -= item.amount
    }
  })

  ElMessage.success(`成功导入 ${batchPreviewData.value.length} 条数据`)
  batchPreviewData.value = []
  fileList.value = []
  addSourceDialogVisible.value = false
}
</script>

<style scoped>
.negative-wage-account {
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

.balance-negative {
  color: hsl(var(--destructive));
  font-weight: 600;
}

.balance-zero {
  color: hsl(var(--muted-foreground));
}

.amount-negative {
  color: hsl(var(--destructive));
}

.amount-positive {
  color: hsl(var(--primary));
}
</style>
