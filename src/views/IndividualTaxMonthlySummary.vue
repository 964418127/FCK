<template>
  <div class="individual-tax-monthly-summary">
    <div class="page-header">
      <h1>个税月度汇总</h1>
      <p class="tip">💡 1 个员工在 N 个门店 = N 个申报主体（1 门店 = 1 主体），按主体拆分展示。多主体员工标识 ⭐</p>
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
          <span class="stat-label">本月预扣合计</span>
          <span class="stat-value">¥{{ totalAmount.toLocaleString() }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">正常预扣</span>
          <span class="stat-value normal">¥{{ normalAmount.toLocaleString() }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">补税</span>
          <span class="stat-value supplement">¥{{ supplementAmount.toLocaleString() }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">退税</span>
          <span class="stat-value refund">-¥{{ refundAmount.toLocaleString() }}</span>
        </div>
      </div>

      <el-table :data="summaryData" stripe style="width: 100%; margin-top: 12px;">
        <el-table-column prop="employeeId" label="员工编号" width="100" />
        <el-table-column label="姓名" width="120">
          <template #default="{ row }">
            <span>{{ row.employeeName }}</span>
            <el-tag v-if="row.isMultiEntity" size="small" type="warning" style="margin-left: 4px;">⭐ 多主体</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="idCard" label="身份证号" width="180" />
        <el-table-column prop="position" label="岗位" width="100" />
        <el-table-column prop="declarationEntity" label="申报主体" width="160">
          <template #default="{ row }">
            <el-tag size="small" type="primary">{{ row.declarationEntity }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="store" label="门店" width="100" />
        <el-table-column prop="salaryBeforeTax" label="税前工资" width="100">
          <template #default="{ row }">
            ¥{{ row.salaryBeforeTax.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="preDeduct" label="本主体预扣" width="110">
          <template #default="{ row }">
            <span class="amount">¥{{ row.preDeduct.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="normalAmount" label="正常预扣" width="100">
          <template #default="{ row }">
            <span class="amount normal">¥{{ row.normalAmount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="supplementAmount" label="补税" width="100">
          <template #default="{ row }">
            <span v-if="row.supplementAmount > 0" class="amount supplement">+¥{{ row.supplementAmount.toLocaleString() }}</span>
            <span v-else class="amount">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="refundAmount" label="退税" width="100">
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
  // 张三（全职）单主体：1 个员工 1 个合同主体，反映"累计预扣预缴"真实业务
  // 1月：累计收入15000, 累计应纳税所得额10000, 累计税额=10000×3%=290, 当月预扣=290
  // 2月：累计收入30000, 累计应纳税所得额20000, 累计税额=20000×3%=600, 当月预扣=600-290=310
  // 3月：累计收入45000, 累计应纳税所得额35000, 累计税额=35000×3%=1050, 当月预扣=1050-600=450
  { employeeId: 'E001', employeeName: '张三', idCard: '110101199001011234', position: '推拿师', declarationEntity: '北京推拿公司', store: '北京旗舰店', isMultiEntity: false, salaryBeforeTax: 15000, preDeduct: 290, normalAmount: 290, supplementAmount: 0, refundAmount: 0, totalAmount: 290, month: '2026-01' },
  { employeeId: 'E001', employeeName: '张三', idCard: '110101199001011234', position: '推拿师', declarationEntity: '北京推拿公司', store: '北京旗舰店', isMultiEntity: false, salaryBeforeTax: 15000, preDeduct: 310, normalAmount: 310, supplementAmount: 0, refundAmount: 0, totalAmount: 310, month: '2026-02' },
  { employeeId: 'E001', employeeName: '张三', idCard: '110101199001011234', position: '推拿师', declarationEntity: '北京推拿公司', store: '北京旗舰店', isMultiEntity: false, salaryBeforeTax: 15000, preDeduct: 450, normalAmount: 450, supplementAmount: 0, refundAmount: 0, totalAmount: 450, month: '2026-03' },
  // 李四（兼职）多主体：1 个员工 2 个门店 = 2 个申报主体，按倒序申报
  { employeeId: 'E002', employeeName: '李四', idCard: '310101199002022345', position: '兼职推拿师', declarationEntity: '上海推拿公司A店', store: '上海A店', isMultiEntity: true, salaryBeforeTax: 22400, preDeduct: 672, normalAmount: 672, supplementAmount: 1128, refundAmount: 0, totalAmount: 1800, month: '2026-01' },
  { employeeId: 'E002', employeeName: '李四', idCard: '310101199002022345', position: '兼职推拿师', declarationEntity: '上海推拿公司B店', store: '上海B店', isMultiEntity: true, salaryBeforeTax: 12600, preDeduct: 378, normalAmount: 378, supplementAmount: 822, refundAmount: 0, totalAmount: 1200, month: '2026-01' },
  { employeeId: 'E002', employeeName: '李四', idCard: '310101199002022345', position: '兼职推拿师', declarationEntity: '上海推拿公司B店', store: '上海B店', isMultiEntity: true, salaryBeforeTax: 8000, preDeduct: 0, normalAmount: 0, supplementAmount: 0, refundAmount: 30, totalAmount: -30, month: '2026-03' },
  // 王五（全职）单主体：含汇算清缴
  { employeeId: 'E003', employeeName: '王五', idCard: '440101199003033456', position: '客户经理', declarationEntity: '深圳推拿公司', store: '深圳总店', isMultiEntity: false, salaryBeforeTax: 20000, preDeduct: 790, normalAmount: 790, supplementAmount: 200, refundAmount: 0, totalAmount: 990, month: '2026-01' }
])

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 5
})

const totalAmount = computed(() => summaryData.value.reduce((sum, item) => sum + item.totalAmount, 0))
const normalAmount = computed(() => summaryData.value.reduce((sum, item) => sum + item.normalAmount, 0))
const supplementAmount = computed(() => summaryData.value.reduce((sum, item) => sum + item.supplementAmount, 0))
const refundAmount = computed(() => summaryData.value.reduce((sum, item) => sum + item.refundAmount, 0))

const handleReset = () => { searchForm.keyword = ''; searchForm.month = '' }
const handleExport = () => { }

const goToDetail = () => {
  router.push({ name: 'individual-tax-monthly-record' })
}

const goToDetailRow = (row) => {
  router.push({ name: 'individual-tax-monthly-record', query: { employeeId: row.employeeId, month: row.month } })
}
</script>

<style scoped>
.individual-tax-monthly-summary { padding: 0; }
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