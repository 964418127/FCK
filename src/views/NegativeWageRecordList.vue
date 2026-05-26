<template>
  <div class="negative-wage-record-list">
    <div class="page-header">
      <h1>负工资流水查询</h1>
      <p class="tip">💡 查询所有员工的负工资流水记录</p>
    </div>

    <div class="content-section">
      <!-- 筛选 -->
      <div class="search-section">
        <el-form :inline="true" class="demo-form-inline">
          <el-form-item label="姓名/工号">
            <el-input v-model="searchForm.keyword" placeholder="请输入姓名或工号" clearable style="width: 140px;" />
          </el-form-item>
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
            <el-select v-model="searchForm.type" placeholder="选择" clearable style="width: 120px;">
              <el-option label="全部" value="" />
              <el-option label="来源" value="source" />
              <el-option label="抵扣" value="deduct" />
            </el-select>
          </el-form-item>
          <el-form-item label="来源类型">
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

      <!-- 流水表格 -->
      <el-table :data="filteredData" stripe style="width: 100%; margin-top: 16px;">
        <el-table-column prop="createTime" label="时间" width="160" />
        <el-table-column prop="employeeId" label="工号" width="100" />
        <el-table-column prop="employeeName" label="姓名" width="100" />
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column prop="type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.type === 'source' ? 'danger' : 'success'" size="small">
              {{ row.type === 'source' ? '来源' : '抵扣' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sourceType" label="来源/抵扣" width="100">
          <template #default="{ row }">
            {{ getSourceTypeText(row.sourceType) }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="说明" min-width="180" />
        <el-table-column prop="amount" label="金额" width="100" align="right">
          <template #default="{ row }">
            <span :class="row.amount < 0 ? 'amount-negative' : 'amount-positive'">
              {{ row.amount < 0 ? '-' : '+' }}{{ formatAmount(Math.abs(row.amount)) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="balanceAfter" label="余额" width="100" align="right">
          <template #default="{ row }">
            <span :class="row.balanceAfter < 0 ? 'balance-negative' : 'balance-zero'">
              {{ formatBalance(row.balanceAfter) }}
            </span>
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

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          background
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  keyword: '',
  dateRange: [],
  type: '',
  sourceType: ''
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 流水记录数据（模拟数据）
const recordData = ref([
  {
    id: 1,
    employeeId: 'E001',
    employeeName: '张三',
    department: '按摩部',
    type: 'source',
    sourceType: 'wage_negative',
    amount: -600,
    balanceAfter: -600,
    remark: '工资条#202601 应发-600',
    createTime: '2026-01-31 10:00:00',
    createType: 'auto'
  },
  {
    id: 2,
    employeeId: 'E001',
    employeeName: '张三',
    department: '按摩部',
    type: 'source',
    sourceType: 'advance',
    amount: -1000,
    balanceAfter: -1600,
    remark: '员工预支生活费',
    createTime: '2026-02-05 14:30:00',
    createType: 'manual'
  },
  {
    id: 3,
    employeeId: 'E001',
    employeeName: '张三',
    department: '按摩部',
    type: 'deduct',
    sourceType: 'wage_deduct',
    amount: 500,
    balanceAfter: -1100,
    remark: '工资条#202602 抵扣500',
    createTime: '2026-02-28 18:00:00',
    createType: 'auto'
  },
  {
    id: 4,
    employeeId: 'E001',
    employeeName: '张三',
    department: '按摩部',
    type: 'source',
    sourceType: 'penalty',
    amount: -400,
    balanceAfter: -1500,
    remark: '客户投诉罚款',
    createTime: '2026-03-10 09:00:00',
    createType: 'manual'
  },
  {
    id: 5,
    employeeId: 'E002',
    employeeName: '李四',
    department: '按摩部',
    type: 'source',
    sourceType: 'wage_negative',
    amount: -800,
    balanceAfter: -800,
    remark: '工资条#202601 应发-800',
    createTime: '2026-01-31 10:00:00',
    createType: 'auto'
  },
  {
    id: 6,
    employeeId: 'E002',
    employeeName: '李四',
    department: '按摩部',
    type: 'deduct',
    sourceType: 'wage_deduct',
    amount: 800,
    balanceAfter: 0,
    remark: '工资条#202602 抵扣800，负工资已清零',
    createTime: '2026-02-28 18:00:00',
    createType: 'auto'
  }
])

// 过滤后的数据
const filteredData = computed(() => {
  let data = [...recordData.value]

  // 关键词过滤
  if (searchForm.keyword) {
    data = data.filter(d =>
      d.employeeId.includes(searchForm.keyword) ||
      d.employeeName.includes(searchForm.keyword)
    )
  }

  // 类型过滤
  if (searchForm.type) {
    data = data.filter(d => d.type === searchForm.type)
  }

  // 来源类型过滤
  if (searchForm.sourceType) {
    data = data.filter(d => d.sourceType === searchForm.sourceType)
  }

  // 时间过滤
  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    const [start, end] = searchForm.dateRange
    data = data.filter(d => d.createTime >= start && d.createTime <= end + ' 23:59:59')
  }

  pagination.total = data.length
  return data
})

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
  searchForm.keyword = ''
  searchForm.dateRange = []
  searchForm.type = ''
  searchForm.sourceType = ''
}
</script>

<style scoped>
.negative-wage-record-list {
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

.amount-negative {
  color: hsl(var(--destructive));
  font-weight: 600;
}

.amount-positive {
  color: hsl(var(--primary));
  font-weight: 600;
}

.balance-negative {
  color: hsl(var(--destructive));
  font-weight: 600;
}

.balance-zero {
  color: hsl(var(--muted-foreground));
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
