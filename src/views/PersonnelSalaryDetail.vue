<template>
  <div class="personnel-salary-detail">
    <div class="page-header">
      <h1>人员薪酬明细</h1>
      <p class="tip">查看各城市/门店/人员当月工资单与常乐豆结算单明细，支持按维度筛选并发起重算或测算</p>
    </div>

    <div class="content-section">
      <!-- 筛选区 -->
      <div class="search-section">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="人员工号">
            <el-input v-model="searchForm.employeeNo" placeholder="人员工号搜索" clearable style="width: 150px;" />
          </el-form-item>
          <el-form-item label="姓名">
            <el-input v-model="searchForm.name" placeholder="姓名搜索" clearable style="width: 150px;" />
          </el-form-item>
          <el-form-item label="岗位">
            <el-select v-model="searchForm.position" placeholder="岗位" clearable style="width: 130px;">
              <el-option label="调理师" value="调理师" />
              <el-option label="推拿师" value="推拿师" />
              <el-option label="理疗师" value="理疗师" />
              <el-option label="客户经理" value="客户经理" />
            </el-select>
          </el-form-item>
          <el-form-item label="城市">
            <el-input v-model="searchForm.city" placeholder="城市搜索" clearable style="width: 140px;" />
          </el-form-item>
          <el-form-item label="门店">
            <el-input v-model="searchForm.store" placeholder="门店搜索" clearable style="width: 140px;" />
          </el-form-item>
          <el-form-item label="合作主体">
            <el-input v-model="searchForm.cooperateEntity" placeholder="合作主体搜索" clearable style="width: 180px;" />
          </el-form-item>
          <el-form-item label="日期">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              style="width: 240px;"
            />
          </el-form-item>
          <el-form-item label="计算日期">
            <el-date-picker
              v-model="searchForm.calcDate"
              type="date"
              placeholder="计算日期"
              value-format="YYYY-MM-DD"
              style="width: 140px;"
            />
          </el-form-item>
        </el-form>

        <div class="search-actions">
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" @click="handleExport">导出</el-button>
        </div>
      </div>

      <!-- 表格 -->
      <el-table :data="filteredList" stripe style="width: 100%; margin-top: 12px;">
        <el-table-column prop="talentId" label="人才ID" min-width="170" />
        <el-table-column prop="cityCode" label="城市编码" width="90" align="center" />
        <el-table-column prop="cityName" label="城市名称" width="100" />
        <el-table-column prop="storeCode" label="门店编码" width="110" align="center" />
        <el-table-column prop="storeName" label="门店名称" min-width="150" />
        <el-table-column prop="cooperateEntity" label="合作主体" min-width="180" />
        <el-table-column prop="employeeNo" label="工号" width="100" align="center" />
        <el-table-column prop="name" label="姓名" width="90" />
        <el-table-column prop="position" label="岗位" width="90" />
        <el-table-column prop="cooperateType" label="合作类型" width="90" />
        <el-table-column label="工资单" min-width="200">
          <template #default="{ row }">
            <span v-if="row.weekIncome === 0" class="text-muted">/</span>
            <a v-else class="cell-link" @click="handleViewPayroll(row)">
              第四周收入：{{ row.weekIncome }}
            </a>
          </template>
        </el-table-column>
        <el-table-column label="收入小计" width="110" align="right">
          <template #default="{ row }">
            <span v-if="row.incomeSubtotal === 0" class="text-muted">/</span>
            <span v-else>¥ {{ row.incomeSubtotal.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="常乐豆结算单" width="130">
          <template #default="{ row }">
            <span v-if="!row.beanBillNo" class="text-muted">/</span>
            <a v-else class="cell-link" @click="handleViewBeanBill(row)">
              {{ row.beanBillNo }}
            </a>
          </template>
        </el-table-column>
        <el-table-column label="常乐豆小计" width="110" align="right">
          <template #default="{ row }">
            <span v-if="row.beanSubtotal === 0" class="text-muted">/</span>
            <span v-else>¥ {{ row.beanSubtotal.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="合计" width="110" align="right">
          <template #default="{ row }">
            <span v-if="row.total === 0" class="text-muted">/</span>
            <span v-else class="cell-total">¥ {{ row.total.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="薪酬周期" width="200" align="center">
          <template #default="{ row }">
            <span>{{ row.salaryPeriod }}</span>
          </template>
        </el-table-column>
        <el-table-column label="计算时间" width="130" align="center">
          <template #default="{ row }">
            <span>{{ row.calcTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleRecalculate(row)">重算</el-button>
            <el-button type="primary" size="small" link @click="handleEstimate(row)">测算</el-button>
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
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// ==================== 搜索表单 ====================
const searchForm = reactive({
  employeeNo: '',
  name: '',
  position: '',
  city: '',
  store: '',
  cooperateEntity: '',
  dateRange: [],
  calcDate: ''
})

// ==================== 表格数据 ====================
const tableData = ref([
  {
    talentId: '1061406619331489792',
    cityCode: '028',
    cityName: '成都市',
    storeCode: '102095',
    storeName: '悠方店',
    cooperateEntity: '成都悠方健康管理有限公司',
    employeeNo: '135161',
    name: '王苏茂',
    position: '调理师',
    cooperateType: '兼职',
    weekIncome: 0,
    incomeSubtotal: 0,
    beanBillNo: '',
    beanSubtotal: 0,
    total: 0,
    salaryPeriod: '2026-05-22 至 2026-05-31',
    calcTime: '2026-06-01'
  },
  {
    talentId: '1212838329036805',
    cityCode: '028',
    cityName: '成都市',
    storeCode: '102046',
    storeName: '大悦城店',
    cooperateEntity: '成都大悦城健康管理有限公司',
    employeeNo: '134922',
    name: '喻亮',
    position: '调理师',
    cooperateType: '兼职',
    weekIncome: 3393.34,
    incomeSubtotal: 3393.34,
    beanBillNo: '',
    beanSubtotal: 0,
    total: 3393.34,
    salaryPeriod: '2026-05-22 至 2026-05-31',
    calcTime: '2026-06-01'
  },
  {
    talentId: '1064155839708086272',
    cityCode: '028',
    cityName: '成都市',
    storeCode: '102044',
    storeName: '成都来福士店',
    cooperateEntity: '成都来福士健康管理有限公司',
    employeeNo: '135158',
    name: '邓佳伟',
    position: '调理师',
    cooperateType: '兼职',
    weekIncome: 0,
    incomeSubtotal: 0,
    beanBillNo: '',
    beanSubtotal: 0,
    total: 0,
    salaryPeriod: '2026-05-22 至 2026-05-31',
    calcTime: '2026-06-01'
  },
  {
    talentId: '1070735400655233024',
    cityCode: '023',
    cityName: '重庆市',
    storeCode: '102118',
    storeName: '龙湖源著天街店',
    cooperateEntity: '重庆龙湖源著健康管理有限公司',
    employeeNo: '135212',
    name: '彭仕伟',
    position: '调理师',
    cooperateType: '兼职',
    weekIncome: 224.66,
    incomeSubtotal: 224.66,
    beanBillNo: '',
    beanSubtotal: 0,
    total: 224.66,
    salaryPeriod: '2026-05-22 至 2026-05-31',
    calcTime: '2026-06-01'
  },
  {
    talentId: '1028039552263589888',
    cityCode: '010',
    cityName: '北京市',
    storeCode: '102349',
    storeName: '正大中心',
    cooperateEntity: '北京正大中心健康管理有限公司',
    employeeNo: '134870',
    name: '徐志佳',
    position: '调理师',
    cooperateType: '兼职',
    weekIncome: 3980.37,
    incomeSubtotal: 3980.37,
    beanBillNo: '',
    beanSubtotal: 0,
    total: 3980.37,
    salaryPeriod: '2026-05-22 至 2026-05-31',
    calcTime: '2026-06-01'
  },
  {
    talentId: '1061973675184828416',
    cityCode: '028',
    cityName: '成都市',
    storeCode: '102101',
    storeName: '汇锦街店',
    cooperateEntity: '成都汇锦街健康管理有限公司',
    employeeNo: '135171',
    name: '彭怀翼',
    position: '调理师',
    cooperateType: '兼职',
    weekIncome: 0,
    incomeSubtotal: 0,
    beanBillNo: '',
    beanSubtotal: 0,
    total: 0,
    salaryPeriod: '2026-05-22 至 2026-05-31',
    calcTime: '2026-06-01'
  },
  {
    talentId: '1064962767329767424',
    cityCode: '0755',
    cityName: '深圳市',
    storeCode: '102113',
    storeName: '深圳来福士店',
    cooperateEntity: '深圳来福士健康管理有限公司',
    employeeNo: '135186',
    name: '龙攀峰',
    position: '调理师',
    cooperateType: '兼职',
    weekIncome: 89.7,
    incomeSubtotal: 89.7,
    beanBillNo: '',
    beanSubtotal: 0,
    total: 89.7,
    salaryPeriod: '2026-05-22 至 2026-05-31',
    calcTime: '2026-06-01'
  },
  {
    talentId: '1069198314722365440',
    cityCode: '023',
    cityName: '重庆市',
    storeCode: '102108',
    storeName: '嘉州SKLP店（原新光天地店）',
    cooperateEntity: '重庆嘉州新光天地健康管理有限公司',
    employeeNo: '135164',
    name: '岳伦松',
    position: '调理师',
    cooperateType: '兼职',
    weekIncome: 0,
    incomeSubtotal: 0,
    beanBillNo: '',
    beanSubtotal: 0,
    total: 0,
    salaryPeriod: '2026-05-22 至 2026-05-31',
    calcTime: '2026-06-01'
  },
  {
    talentId: '1083705288733966336',
    cityCode: '028',
    cityName: '成都市',
    storeCode: '102128',
    storeName: '成都龙湖滨江天街店',
    cooperateEntity: '成都龙湖滨江健康管理有限公司',
    employeeNo: '135301',
    name: '郭海龙',
    position: '调理师',
    cooperateType: '兼职',
    weekIncome: 0,
    incomeSubtotal: 0,
    beanBillNo: '',
    beanSubtotal: 0,
    total: 0,
    salaryPeriod: '2026-05-22 至 2026-05-31',
    calcTime: '2026-06-01'
  },
  {
    talentId: '1070273568123195393',
    cityCode: '028',
    cityName: '成都市',
    storeCode: '102106',
    storeName: '成都环球中心店',
    cooperateEntity: '成都环球中心健康管理有限公司',
    employeeNo: '135219',
    name: '候窬珊',
    position: '调理师',
    cooperateType: '兼职',
    weekIncome: 0,
    incomeSubtotal: 0,
    beanBillNo: '',
    beanSubtotal: 0,
    total: 0,
    salaryPeriod: '2026-05-22 至 2026-05-31',
    calcTime: '2026-06-01'
  }
])

// ==================== 过滤 ====================
const filteredList = computed(() => {
  const kw = searchForm
  return tableData.value.filter(row => {
    if (kw.employeeNo && !row.employeeNo.includes(kw.employeeNo)) return false
    if (kw.name && !row.name.includes(kw.name)) return false
    if (kw.position && row.position !== kw.position) return false
    if (kw.city && !row.cityName.includes(kw.city) && !row.cityCode.includes(kw.city)) return false
    if (kw.store && !row.storeName.includes(kw.store) && !row.storeCode.includes(kw.store)) return false
    if (kw.cooperateEntity && !row.cooperateEntity.includes(kw.cooperateEntity)) return false
    return true
  })
})

// ==================== 分页 ====================
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})
pagination.total = tableData.value.length

// ==================== 操作 ====================
const handleSearch = () => {
  pagination.total = filteredList.value.length
  pagination.currentPage = 1
  ElMessage.success(`已搜索到 ${filteredList.value.length} 条记录`)
}

const handleReset = () => {
  searchForm.employeeNo = ''
  searchForm.name = ''
  searchForm.position = ''
  searchForm.city = ''
  searchForm.store = ''
  searchForm.cooperateEntity = ''
  searchForm.dateRange = []
  searchForm.calcDate = ''
  pagination.total = tableData.value.length
  pagination.currentPage = 1
}

const handleExport = () => {
  ElMessageBox.confirm(
    `确定导出当前 ${filteredList.value.length} 条人员薪酬明细记录？`,
    '导出确认',
    { confirmButtonText: '确定导出', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    ElMessage.success('导出任务已提交，请稍后在下载中心查看')
  }).catch(() => {})
}

const handleViewPayroll = (row) => {
  ElMessage.info(`查看 ${row.name} 工资单：第四周收入 ${row.weekIncome}`)
}

const handleViewBeanBill = (row) => {
  ElMessage.info(`查看 ${row.name} 常乐豆结算单`)
}

const handleRecalculate = (row) => {
  ElMessageBox.confirm(
    `确定对 ${row.name}（${row.storeName}）发起工资重算？`,
    '发起重算',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    ElMessage.success('重算任务已发起')
  }).catch(() => {})
}

const handleEstimate = (row) => {
  ElMessage.info(`正在打开 ${row.name} 的测算面板`)
}
</script>

<style scoped>
.personnel-salary-detail {
  padding: 20px 0;
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
  margin-top: 16px;
}

.search-section {
  padding-bottom: 16px;
  border-bottom: 1px solid hsl(var(--border));
}

.search-actions {
  margin-top: 4px;
  display: flex;
  gap: 8px;
}

.text-muted {
  color: #c0c4cc;
}

.cell-link {
  color: #a40035;
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;
}

.cell-link:hover {
  text-decoration: underline;
}

.cell-total {
  color: #a40035;
  font-weight: 600;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
