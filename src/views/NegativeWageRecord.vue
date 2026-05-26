<template>
  <div class="negative-wage-record">
    <div class="page-header">
      <div class="header-back" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回</span>
      </div>
      <h1>负工资流水明细</h1>
      <p class="tip">员工：{{ employeeName }} ({{ employeeId }})</p>
    </div>

    <div class="content-section">
      <!-- Tab切换 -->
      <el-tabs v-model="activeTab" class="record-tabs">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="来源记录" name="source" />
        <el-tab-pane label="抵扣记录" name="deduct" />
      </el-tabs>

      <!-- 筛选 -->
      <div class="search-section">
        <el-form :inline="true" class="demo-form-inline">
          <el-form-item label="时间范围">
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
          <el-form-item label="类型">
            <el-select v-model="searchForm.sourceType" placeholder="选择" clearable style="width: 120px;">
              <el-option label="全部" value="" />
              <el-option label="预支" value="advance" />
              <el-option label="罚款" value="penalty" />
              <el-option label="扣款" value="deduction" />
              <el-option label="其他" value="other" />
              <el-option label="工资条负数" value="wage_negative" />
              <el-option label="工资条抵扣" value="wage_deduct" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 余额汇总 -->
      <div class="balance-summary">
        <div class="summary-item">
          <span class="label">当前余额：</span>
          <span class="value negative">{{ formatBalance(currentBalance) }}</span>
        </div>
        <div class="summary-item">
          <span class="label">累计来源：</span>
          <span class="value negative">{{ formatAmount(totalSource) }}</span>
        </div>
        <div class="summary-item">
          <span class="label">累计抵扣：</span>
          <span class="value positive">{{ formatAmount(totalDeducted) }}</span>
        </div>
      </div>

      <!-- 流水表格 -->
      <el-table :data="filteredData" stripe style="width: 100%; margin-top: 16px;">
        <el-table-column prop="createTime" label="时间" width="160" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="small">
              {{ getTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sourceType" label="来源/抵扣" width="100">
          <template #default="{ row }">
            {{ getSourceTypeText(row.sourceType) }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="说明" min-width="200" />
        <el-table-column prop="amount" label="金额" width="120" align="right">
          <template #default="{ row }">
            <span :class="row.amount < 0 ? 'amount-negative' : 'amount-positive'">
              {{ row.amount < 0 ? '-' : '+' }}{{ formatAmount(Math.abs(row.amount)) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="balanceBefore" label="操作前余额" width="120" align="right">
          <template #default="{ row }">
            <span class="balance-text">{{ formatBalance(row.balanceBefore) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="balanceAfter" label="操作后余额" width="120" align="right">
          <template #default="{ row }">
            <span class="balance-text">{{ formatBalance(row.balanceAfter) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createType" label="方式" width="80">
          <template #default="{ row }">
            <el-tag :type="row.createType === 'auto' ? 'info' : 'default'" size="small">
              {{ row.createType === 'auto' ? '自动' : '手动' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 当前员工信息
const employeeId = ref(route.query.employeeId || '')
const employeeName = ref(route.query.employeeName || '')

// Tab
const activeTab = ref('all')

// 搜索表单
const searchForm = reactive({
  dateRange: [],
  sourceType: ''
})

// 汇总数据
const currentBalance = ref(-1500)
const totalSource = ref(-2000)
const totalDeducted = ref(500)

// 流水记录数据（模拟数据）
const recordData = ref([
  {
    id: 1,
    employeeId: 'E001',
    type: 'source',
    sourceType: 'wage_negative',
    amount: -600,
    balanceBefore: 0,
    balanceAfter: -600,
    remark: '工资条#202601 应发-600',
    createTime: '2026-01-31 10:00:00',
    createType: 'auto'
  },
  {
    id: 2,
    employeeId: 'E001',
    type: 'source',
    sourceType: 'advance',
    amount: -1000,
    balanceBefore: -600,
    balanceAfter: -1600,
    remark: '员工预支生活费',
    createTime: '2026-02-05 14:30:00',
    createType: 'manual'
  },
  {
    id: 3,
    employeeId: 'E001',
    type: 'deduct',
    sourceType: 'wage_deduct',
    amount: 500,
    balanceBefore: -1600,
    balanceAfter: -1100,
    remark: '工资条#202602 抵扣500',
    createTime: '2026-02-28 18:00:00',
    createType: 'auto'
  },
  {
    id: 4,
    employeeId: 'E001',
    type: 'source',
    sourceType: 'penalty',
    amount: -400,
    balanceBefore: -1100,
    balanceAfter: -1500,
    remark: '客户投诉罚款',
    createTime: '2026-03-10 09:00:00',
    createType: 'manual'
  }
])

// 过滤后的数据
const filteredData = computed(() => {
  let data = [...recordData.value]

  // Tab过滤
  if (activeTab.value === 'source') {
    data = data.filter(d => d.type === 'source')
  } else if (activeTab.value === 'deduct') {
    data = data.filter(d => d.type === 'deduct')
  }

  // 类型过滤
  if (searchForm.sourceType) {
    data = data.filter(d => d.sourceType === searchForm.sourceType)
  }

  // 时间过滤
  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    const [start, end] = searchForm.dateRange
    data = data.filter(d => d.createTime >= start && d.createTime <= end + ' 23:59:59')
  }

  return data
})

// 获取类型标签颜色
const getTypeTagType = (type) => {
  return type === 'source' ? 'danger' : 'success'
}

// 获取类型文本
const getTypeText = (type) => {
  return type === 'source' ? '来源' : '抵扣'
}

// 获取来源类型文本
const getSourceTypeText = (sourceType) => {
  const map = {
    advance: '预支',
    penalty: '罚款',
    deduction: '扣款',
    other: '其他',
    wage_negative: '工资条负数',
    wage_deduct: '工资条抵扣'
  }
  return map[sourceType] || sourceType
}

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
  searchForm.dateRange = []
  searchForm.sourceType = ''
}

// 返回
const goBack = () => {
  router.push('/negative-wage-account')
}

// 初始化
onMounted(() => {
  if (!employeeId.value) {
    router.push('/negative-wage-account')
  }
})
</script>

<style scoped>
.negative-wage-record {
  padding: 0;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.header-back {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  cursor: pointer;
  font-size: 14px;
}

.header-back:hover {
  color: hsl(var(--primary));
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
}

.content-section {
  background: hsl(var(--background));
  border-radius: 8px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.record-tabs {
  margin-bottom: 16px;
}

.search-section {
  padding-bottom: 16px;
  border-bottom: 1px solid hsl(var(--border));
}

.balance-summary {
  display: flex;
  gap: 32px;
  padding: 16px;
  background: hsl(var(--muted) / 0.3);
  border-radius: 8px;
  margin-bottom: 8px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-item .label {
  font-size: 14px;
  color: hsl(var(--muted-foreground));
}

.summary-item .value {
  font-size: 16px;
  font-weight: 600;
}

.value.negative {
  color: hsl(var(--destructive));
}

.value.positive {
  color: hsl(var(--primary));
}

.amount-negative {
  color: hsl(var(--destructive));
  font-weight: 600;
}

.amount-positive {
  color: hsl(var(--primary));
  font-weight: 600;
}

.balance-text {
  color: hsl(var(--muted-foreground));
}
</style>
