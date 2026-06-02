<template>
  <div class="security-monthly-summary">
    <div class="page-header">
      <h1>社保月度汇总</h1>
      <p class="tip">💡 查看员工社保每月缴纳汇总，含正常、补缴、退缴的合计金额</p>
    </div>

    <div class="content-section">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input v-model="searchForm.keyword" placeholder="搜索员工" clearable style="width: 140px;" />
          <el-select v-model="searchForm.month" placeholder="月份" clearable style="width: 110px;">
            <el-option v-for="m in monthOptions" :key="m" :label="m" :value="m" />
          </el-select>
          <el-button @click="handleReset">重置</el-button>
        </div>
        <div class="toolbar-right">
          <el-button @click="handleExport">导出</el-button>
          <el-button type="primary" @click="goToDetail">查看流水明细</el-button>
        </div>
      </div>

      <!-- 汇总统计 -->
      <div class="summary-stats">
        <div class="stat-item">
          <span class="stat-label">本月缴纳合计</span>
          <span class="stat-value">¥{{ totalAmount.toLocaleString() }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">正常缴纳</span>
          <span class="stat-value normal">¥{{ normalAmount.toLocaleString() }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">补缴</span>
          <span class="stat-value supplement">¥{{ supplementAmount.toLocaleString() }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">退缴</span>
          <span class="stat-value refund">-¥{{ refundAmount.toLocaleString() }}</span>
        </div>
      </div>

      <el-table :data="summaryData" stripe style="width: 100%; margin-top: 12px;">
        <el-table-column prop="employeeId" label="员工编号" width="100" />
        <el-table-column prop="employeeName" label="姓名" width="100" />
        <el-table-column prop="declarationEntity" label="申报主体" width="160">
          <template #default="{ row }">
            <el-tag size="small" type="primary">{{ row.declarationEntity }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="store" label="门店" width="100" />
        <el-table-column prop="position" label="岗位" width="100" />
        <el-table-column prop="city" label="城市" width="80" />
        <el-table-column prop="baseAmount" label="缴纳基数" width="100">
          <template #default="{ row }">
            ¥{{ row.baseAmount.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="normalAmount" label="正常缴纳" width="100">
          <template #default="{ row }">
            <span class="amount normal">¥{{ row.normalAmount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="supplementAmount" label="补缴" width="100">
          <template #default="{ row }">
            <span v-if="row.supplementAmount > 0" class="amount supplement">+¥{{ row.supplementAmount.toLocaleString() }}</span>
            <span v-else class="amount">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="refundAmount" label="退缴" width="100">
          <template #default="{ row }">
            <span v-if="row.refundAmount > 0" class="amount refund">-¥{{ row.refundAmount.toLocaleString() }}</span>
            <span v-else class="amount">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="本月合计" width="120">
          <template #default="{ row }">
            <span class="amount total">¥{{ row.totalAmount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="month" label="月份" width="100" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="goToDetailRow(row)">明细</el-button>
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
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const searchForm = reactive({ keyword: '', month: '' })
const monthOptions = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06']

const summaryData = ref([
  // 社保汇总（全职单主体，1 员工 1 合同主体 = 1 申报主体；非全日制/兼职无社保）
  { employeeId: 'E001', employeeName: '张三', declarationEntity: '北京推拿公司', store: '北京旗舰店', position: '推拿师', city: '北京', baseAmount: 8000, normalAmount: 800, supplementAmount: 20, refundAmount: 0, totalAmount: 820, month: '2026-02' },
  { employeeId: 'E001', employeeName: '张三', declarationEntity: '北京推拿公司', store: '北京旗舰店', position: '推拿师', city: '北京', baseAmount: 8000, normalAmount: 800, supplementAmount: 0, refundAmount: 0, totalAmount: 800, month: '2026-01' },
  { employeeId: 'E003', employeeName: '王五', declarationEntity: '深圳推拿公司', store: '深圳总店', position: '客户经理', city: '深圳', baseAmount: 10000, normalAmount: 1000, supplementAmount: 0, refundAmount: 0, totalAmount: 1000, month: '2026-01' }
])

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 3
})

const totalAmount = computed(() => summaryData.value.reduce((sum, item) => sum + item.totalAmount, 0))
const normalAmount = computed(() => summaryData.value.reduce((sum, item) => sum + item.normalAmount, 0))
const supplementAmount = computed(() => summaryData.value.reduce((sum, item) => sum + item.supplementAmount, 0))
const refundAmount = computed(() => summaryData.value.reduce((sum, item) => sum + item.refundAmount, 0))

const handleReset = () => { searchForm.keyword = ''; searchForm.month = '' }
const handleExport = () => { }

const goToDetail = () => {
  router.push({ name: 'security-monthly-record' })
}

const goToDetailRow = (row) => {
  router.push({ name: 'security-monthly-record', query: { employeeId: row.employeeId, month: row.month } })
}
</script>

<style scoped>
.security-monthly-summary { padding: 0; }
.page-header { margin-bottom: 20px; }
.page-header h1 { font-size: 24px; font-weight: 600; margin: 0 0 8px 0; color: hsl(var(--foreground)); }
.page-header .tip { color: hsl(var(--muted-foreground)); font-size: 14px; margin: 0; }
.content-section { background: hsl(var(--background)); border-radius: 8px; padding: 20px; box-shadow: var(--shadow-sm); }
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.toolbar-left, .toolbar-right { display: flex; gap: 8px; align-items: center; }

.summary-stats {
  display: flex;
  gap: 24px;
  padding: 16px;
  background: hsl(var(--muted) / 0.3);
  border-radius: 8px;
  margin-bottom: 12px;
}
.stat-item { display: flex; flex-direction: column; gap: 4px; }
.stat-label { font-size: 12px; color: hsl(var(--muted-foreground)); }
.stat-value { font-size: 20px; font-weight: 600; color: hsl(var(--foreground)); }
.stat-value.normal { color: hsl(var(--primary)); }
.stat-value.supplement { color: hsl(var(--warning)); }
.stat-value.refund { color: hsl(var(--destructive)); }

.amount { font-weight: 500; }
.amount.normal { color: hsl(var(--foreground)); }
.amount.supplement { color: hsl(var(--warning)); }
.amount.refund { color: hsl(var(--destructive)); }
.amount.total { color: hsl(var(--primary)); font-weight: 600; }

.pagination-wrapper { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>