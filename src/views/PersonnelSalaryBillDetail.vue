<template>
  <div class="personnel-salary-bill-detail">
    <div class="page-header">
      <div>
        <h1>工资单详情</h1>
        <p class="tip">查看单张工资单的完整组成（基础信息 + 薪酬项 + 扣缴项）</p>
      </div>
      <el-button @click="handleBack">
        <el-icon><ArrowLeft /></el-icon>
        返回列表
      </el-button>
    </div>

    <!-- 基础信息 -->
    <el-card class="section-card basic-info-card" shadow="never">
      <div class="info-grid">
        <div class="info-item">
          <span class="label">编号：</span>
          <span class="value mono">{{ billData.billNo }}</span>
        </div>
        <div class="info-item">
          <span class="label">收入合计：</span>
          <span class="value amount">¥ {{ billData.incomeTotal.toFixed(2) }}</span>
        </div>
        <div class="info-item">
          <span class="label">扣缴小计：</span>
          <span class="value amount">{{ formatAmount(billData.deductionTotal) }}</span>
        </div>
        <div class="info-item">
          <span class="label">应发合计：</span>
          <span class="value amount strong">¥ {{ billData.payableTotal.toFixed(2) }}</span>
        </div>
        <div class="info-item">
          <span class="label">通知时间：</span>
          <span class="value">{{ billData.notifyTime || '/' }}</span>
        </div>
        <div class="info-item">
          <span class="label">计划发放时间：</span>
          <span class="value">{{ billData.plannedPayTime || '/' }}</span>
        </div>
        <div class="info-item">
          <span class="label">状态：</span>
          <span class="value">
            <el-tag :type="statusTagType(billData.status)" size="small">{{ billData.status }}</el-tag>
          </span>
        </div>
        <div class="info-item">
          <span class="label">发放时间：</span>
          <span class="value">{{ billData.payTime || '/' }}</span>
        </div>
        <div class="info-item">
          <span class="label">发放状态：</span>
          <span class="value">
            <el-tag v-if="billData.payStatus" :type="payStatusTagType(billData.payStatus)" size="small">{{ billData.payStatus }}</el-tag>
            <span v-else>/</span>
          </span>
        </div>
        <div class="info-item">
          <span class="label">实发金额：</span>
          <span class="value amount strong">{{ formatAmount(billData.actualAmount) }}</span>
        </div>
        <div class="info-item">
          <span class="label">失败原因：</span>
          <span class="value fail-reason">{{ billData.failReason || '/' }}</span>
        </div>
      </div>
    </el-card>

    <!-- 薪酬项 -->
    <div class="section">
      <div class="section-title">
        <span class="red-bar"></span>
        <span class="title-text">薪酬项</span>
      </div>
      <div v-for="(group, gi) in billData.incomeGroups" :key="`income-${gi}`" class="subgroup">
        <div class="subgroup-header">{{ group.category }}</div>
        <el-table :data="group.items" stripe border class="bill-table">
          <el-table-column prop="no" label="编号" min-width="180" />
          <el-table-column prop="mapName" label="映射展示名称" min-width="120" />
          <el-table-column prop="deductionType" label="扣缴项类型" min-width="160" />
          <el-table-column prop="itemName" label="薪酬项名称" min-width="180" />
          <el-table-column prop="payType" label="支付形式" min-width="80" align="center" />
          <el-table-column label="收入" min-width="100" align="right">
            <template #default="{ row }">
              <span :class="row.amount < 0 ? 'amount negative' : 'amount'">¥ {{ row.amount.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="source" label="来源" min-width="80" align="center" />
          <el-table-column label="操作" min-width="100" align="center" fixed="right">
            <template #default>
              <a class="op-link" @click="handleIncomeDetail">收入明细</a>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 扣缴项 -->
    <div class="section">
      <div class="section-title">
        <span class="red-bar"></span>
        <span class="title-text">扣缴项</span>
      </div>
      <div v-for="(group, gi) in billData.deductionGroups" :key="`deduction-${gi}`" class="subgroup">
        <div class="subgroup-header">{{ group.category }}</div>
        <el-table :data="group.items" stripe border class="bill-table">
          <el-table-column prop="no" label="编号" min-width="180" />
          <el-table-column prop="mapName" label="映射展示名称" min-width="120" />
          <el-table-column prop="deductionType" label="扣缴项类型" min-width="160" />
          <el-table-column prop="itemName" label="薪酬项名称" min-width="180" />
          <el-table-column prop="payType" label="支付形式" min-width="80" align="center" />
          <el-table-column label="收入" min-width="100" align="right">
            <template #default="{ row }">
              <span class="amount negative">- ¥ {{ Math.abs(row.amount).toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="source" label="来源" min-width="80" align="center" />
          <el-table-column label="操作" min-width="100" align="center" fixed="right">
            <template #default>
              <a class="op-link" @click="handleIncomeDetail">收入明细</a>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// TODO: 替换为按 billNo 真实拉取。当前原型用图中的示例数据固定展示
const billData = ref({
  billNo: '1116914240949403726',
  incomeTotal: 29.9,
  deductionTotal: null,
  payableTotal: 29.9,
  notifyTime: '2026-06-10T02:18:26',
  plannedPayTime: '2026-06-17T02:18:26',
  status: '待确认',
  payTime: null,
  payStatus: '未发放',
  actualAmount: null,
  failReason: null,
  incomeGroups: [
    {
      category: '推拿师补贴',
      items: [
        {
          no: '11000855613087006 76',
          mapName: '打赏',
          deductionType: '全职推拿师提成13',
          itemName: '全职推拿师打赏13',
          payType: '现金',
          amount: 0,
          source: '自动'
        },
        {
          no: '11000855613087006 73',
          mapName: '退单',
          deductionType: '全职推拿师提成13',
          itemName: '全职推拿师退单补贴13',
          payType: '现金',
          amount: 29.9,
          source: '自动'
        }
      ]
    }
  ],
  deductionGroups: [
    {
      category: '投诉',
      items: [
        {
          no: '11000855613087006 75',
          mapName: '投诉',
          deductionType: '全职推拿师提成13',
          itemName: '全职投诉扣款13',
          payType: '现金',
          amount: 0,
          source: '自动'
        },
        {
          no: '11000855613087006 74',
          mapName: '扣款手动',
          deductionType: '全职推拿师提成13',
          itemName: '全职推拿师扣款13',
          payType: '现金',
          amount: 0,
          source: '自动'
        }
      ]
    }
  ]
})

const formatAmount = (val) => {
  if (val === null || val === undefined) return '/'
  return `¥ ${val.toFixed(2)}`
}

const statusTagType = (status) => {
  const map = {
    '待确认': 'warning',
    '已确认': 'primary',
    '已发放': 'success',
    '已取消': 'info'
  }
  return map[status] || 'info'
}

const payStatusTagType = (payStatus) => {
  const map = {
    '未发放': 'info',
    '处理中': 'warning',
    '成功': 'success',
    '部分成功': 'warning',
    '失败': 'danger'
  }
  return map[payStatus] || 'info'
}

const handleBack = () => {
  router.push({ name: 'personnel-salary-detail' })
}

const handleIncomeDetail = () => {
  // TODO: 后续接入"收入明细"下一级页面
  ElMessage.info('收入明细页面待接入')
}
</script>

<style scoped>
.personnel-salary-bill-detail {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}
.page-header h1 {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 6px 0;
  color: hsl(var(--foreground));
}
.page-header .tip {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  margin: 0;
}

.section-card {
  margin-bottom: 20px;
  border-radius: 6px;
}
.section-card :deep(.el-card__body) {
  padding: 20px 24px;
}

.basic-info-card {
  background: #fff;
}
.basic-info-card :deep(.el-card__body) {
  padding: 24px 28px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px 32px;
}
.info-item {
  display: flex;
  align-items: center;
  font-size: 13px;
  line-height: 1.6;
}
.info-item .label {
  color: hsl(var(--muted-foreground));
  flex-shrink: 0;
  width: 96px;
  text-align: right;
  margin-right: 8px;
}
.info-item .value {
  color: hsl(var(--foreground));
}
.info-item .value.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12.5px;
}
.info-item .value.amount {
  font-variant-numeric: tabular-nums;
}
.info-item .value.amount.strong {
  font-weight: 600;
  color: hsl(var(--primary));
}

.section {
  margin-bottom: 24px;
}
.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 600;
  color: hsl(var(--foreground));
}
.section-title .red-bar {
  display: inline-block;
  width: 4px;
  height: 16px;
  background: hsl(var(--destructive));
  border-radius: 2px;
  margin-right: 8px;
}
.section-title .title-text {
  letter-spacing: 0.5px;
}

.subgroup {
  margin-bottom: 16px;
}
.subgroup-header {
  background: hsl(var(--muted) / 0.5);
  border: 1px solid hsl(var(--border));
  border-bottom: none;
  border-radius: 4px 4px 0 0;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--foreground));
}
.subgroup .bill-table :deep(.el-table) {
  border-radius: 0 0 4px 4px;
}

.amount {
  font-variant-numeric: tabular-nums;
}
.amount.negative {
  color: hsl(var(--destructive));
}

.op-link {
  color: hsl(var(--destructive));
  font-size: 13px;
  cursor: pointer;
  text-decoration: none;
}
.op-link:hover {
  text-decoration: underline;
}

.fail-reason {
  color: hsl(var(--destructive));
  font-size: 12.5px;
}
</style>
