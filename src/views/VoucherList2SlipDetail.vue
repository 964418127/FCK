<template>
  <div class="slip-detail-page">
    <div class="page-header">
      <el-button size="small" @click="goBack">← 返回列表</el-button>
      <h1 class="page-title">工资单详情 · {{ slip?.slipNo || '' }}</h1>
    </div>

    <div v-if="!slip" class="empty-state">
      <div class="empty-title">未找到该工资单</div>
      <div class="empty-desc">slipNo: {{ slipNo }}</div>
    </div>

    <template v-else>
      <!-- 基础信息 -->
      <div class="detail-card">
        <div class="detail-card-title">基础信息</div>
        <div class="detail-table">
          <div class="detail-table-cell">
            <div class="detail-table-label">工资单编号</div>
            <div class="detail-table-value">{{ slip.slipNo }}</div>
          </div>
          <div class="detail-table-cell">
            <div class="detail-table-label">员工</div>
            <div class="detail-table-value">{{ employee?.name }}（{{ employee?.no }}）</div>
          </div>
          <div class="detail-table-cell">
            <div class="detail-table-label">岗位 / 策略</div>
            <div class="detail-table-value">{{ employee?.position }} · {{ strategy?.name }}</div>
          </div>
          <div class="detail-table-cell">
            <div class="detail-table-label">计薪周期</div>
            <div class="detail-table-value highlight">{{ slip.periodStart }} ~ {{ slip.periodEnd }}</div>
          </div>
          <div class="detail-table-cell">
            <div class="detail-table-label">状态</div>
            <div class="detail-table-value">
              <el-tag :type="getStatusTagType(slip.status)" size="small">
                {{ getStatusLabel(slip.status) }}
              </el-tag>
            </div>
          </div>
          <div class="detail-table-cell">
            <div class="detail-table-label">确认时间</div>
            <div class="detail-table-value highlight">{{ slip.confirmDate || '—' }}</div>
          </div>
        </div>
      </div>

      <!-- 薪酬项明细 -->
      <div class="detail-card">
        <div class="detail-card-title">薪酬项明细</div>
        <!-- 收入：按组展开 -->
        <div
          v-for="(g, gi) in slip.incomeGroups || []"
          :key="`inc-g-${gi}`"
          class="item-group"
        >
          <div class="item-group-title">{{ g.groupLabel }}</div>
          <div
            v-for="(item, idx) in g.items"
            :key="`i-${gi}-${idx}`"
            class="item-row item-leaf"
          >
            <span class="item-label">{{ item.name }}</span>
            <span class="item-value income-amount">{{ formatAmount(item.amount) }}</span>
          </div>
        </div>
        <div class="item-row item-subtotal">
          <span class="item-label">收入小计</span>
          <span class="item-value">{{ formatAmount(getIncomeTotal(slip)) }}</span>
        </div>
        <!-- 扣缴：按组展开 -->
        <div
          v-for="(g, gi) in slip.deductionGroups || []"
          :key="`ded-g-${gi}`"
          class="item-group"
        >
          <div class="item-group-title">{{ g.groupLabel }}</div>
          <div
            v-for="(item, idx) in g.items"
            :key="`d-${gi}-${idx}`"
            class="item-row item-leaf"
          >
            <span class="item-label">{{ item.name }}</span>
            <span class="item-value deduction-amount">- {{ formatAmount(item.amount) }}</span>
          </div>
        </div>
        <div class="item-row item-subtotal">
          <span class="item-label">扣缴小计</span>
          <span class="item-value">- {{ formatAmount(getBusinessDeductionTotal(slip) + getWithholdingTotal(slip)) }}</span>
        </div>
        <div class="item-grand-total">
          <span class="item-label">应发合计</span>
          <span class="item-value primary-amount">¥ {{ formatAmount(getPayable(slip)) }}</span>
        </div>
        <div class="formula-hint">
          应发 = 收入小计 − 扣缴小计
        </div>
      </div>

      <!-- 社保 / 公积金 -->
      <div v-if="hasSocialOrFund(slip)" class="detail-card">
        <div class="detail-card-title">社保 / 公积金</div>
        <div class="detail-table">
          <div class="detail-table-cell">
            <div class="detail-table-label">社保购买单位</div>
            <div class="detail-table-value">{{ slip.socialPurchasingEntity || '—' }}</div>
          </div>
          <div class="detail-table-cell">
            <div class="detail-table-label">社保单位部分</div>
            <div class="detail-table-value highlight">
              {{ getSocialEmployerPart(slip) ? `¥ ${formatAmount(getSocialEmployerPart(slip))}` : '—' }}
            </div>
          </div>
          <div class="detail-table-cell">
            <div class="detail-table-label">社保个人部分</div>
            <div class="detail-table-value highlight">
              {{ getSocialPersonalPart(slip) ? `¥ ${formatAmount(getSocialPersonalPart(slip))}` : '—' }}
            </div>
          </div>
          <div class="detail-table-cell">
            <div class="detail-table-label">公积金购买单位</div>
            <div class="detail-table-value">{{ slip.fundPurchasingEntity || '—' }}</div>
          </div>
          <div class="detail-table-cell">
            <div class="detail-table-label">公积金单位部分</div>
            <div class="detail-table-value highlight">
              {{ slip.fundEmployerPart != null ? `¥ ${formatAmount(slip.fundEmployerPart)}` : '—' }}
            </div>
          </div>
          <div class="detail-table-cell">
            <div class="detail-table-label">公积金个人部分</div>
            <div class="detail-table-value highlight">
              {{ getFundPersonalPart(slip) ? `¥ ${formatAmount(getFundPersonalPart(slip))}` : '—' }}
            </div>
          </div>
        </div>
      </div>

      <!-- 收款人信息 -->
      <div class="detail-card">
        <div class="detail-card-title">收款人信息</div>
        <div class="detail-table">
          <div class="detail-table-cell">
            <div class="detail-table-label">收款人</div>
            <div class="detail-table-value">{{ getPayee(slip).name || '—' }}</div>
          </div>
          <div class="detail-table-cell">
            <div class="detail-table-label">收款开户行</div>
            <div class="detail-table-value">{{ getPayee(slip).bank || '—' }}</div>
          </div>
          <div class="detail-table-cell">
            <div class="detail-table-label">收款账号</div>
            <div class="detail-table-value mono">{{ getPayee(slip).account || '—' }}</div>
          </div>
          <div class="detail-table-cell">
            <div class="detail-table-label">付款单位</div>
            <div class="detail-table-value">{{ getPayment(slip)?.payerEntity || '—' }}</div>
          </div>
          <div class="detail-table-cell">
            <div class="detail-table-label">付款时间</div>
            <div class="detail-table-value">{{ getPayment(slip)?.payerTime || '—' }}</div>
          </div>
          <div class="detail-table-cell">
            <div class="detail-table-label">付款开户行</div>
            <div class="detail-table-value">{{ getPayment(slip)?.payerBank || '—' }}</div>
          </div>
          <div class="detail-table-cell">
            <div class="detail-table-label">付款账号</div>
            <div class="detail-table-value mono">{{ getPayment(slip)?.payerAccount || '—' }}</div>
          </div>
          <div class="detail-table-cell">
            <div class="detail-table-label">付款金额</div>
            <div class="detail-table-value primary-amount">
              {{ getPayment(slip) ? `¥ ${formatAmount(getPayment(slip).paymentAmount)}` : '—' }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { wageSlips } from '../mock/wageSlips.js'
import { employees } from '../mock/employees.js'
import { strategies } from '../mock/strategies.js'

const route = useRoute()
const router = useRouter()

const slipNo = computed(() => route.params.slipNo)
const slip = computed(() => wageSlips.find(s => s.slipNo === slipNo.value))
const employee = computed(() => employees.find(e => e.id === slip.value?.employeeId))
const strategy = computed(() => strategies.find(s => s.id === employee.value?.strategyId))

const goBack = () => router.push({ name: 'voucher-list-2' })

// ==================== 工具函数 ====================
const sumItems = (items) => (items || []).reduce((s, i) => s + (i.amount || 0), 0)
const sumGroup = (group) => sumItems(group?.items)

const getIncomeTotal = (s) => {
  if (!s) return 0
  return (s.incomeGroups || []).reduce((sum, g) => sum + sumGroup(g), 0)
}

const getBusinessDeductionTotal = (s) => {
  if (!s) return 0
  return (s.deductionGroups || []).filter(g => g.groupKey === 'biz').reduce((sum, g) => sum + sumGroup(g), 0)
}

const getWithholdingTotal = (s) => {
  if (!s) return 0
  return (s.deductionGroups || []).filter(g => g.groupKey === 'stat').reduce((sum, g) => sum + sumGroup(g), 0)
}

const getPayable = (s) => {
  if (!s) return 0
  return getIncomeTotal(s) - getBusinessDeductionTotal(s) - getWithholdingTotal(s)
}

const getPayment = (s) => s?.payments?.[0] || null

const getPayee = (s) => {
  if (!s) return { name: '', bank: '', account: '' }
  // 优先用工资单自带，否则从员工档案补
  const emp = employee.value
  return {
    name: s.payeeName || emp?.name || '',
    bank: s.payeeBank || emp?.payeeBank || '',
    account: s.payeeAccount || emp?.payeeAccount || ''
  }
}

const hasSocialOrFund = (s) => {
  if (!s) return false
  const hasSocial = s.socialPurchasingEntity && s.socialPurchasingEntity !== '/'
  const hasFund = s.fundPurchasingEntity && s.fundPurchasingEntity !== '/'
  return Boolean(hasSocial || hasFund)
}

const getSocialEmployerPart = (s) => s?.socialEmployerPart ?? s?.socialPurchasingAmount ?? 0
const getSocialPersonalPart = (s) => {
  if (!s) return 0
  if (s.socialPersonalPart != null) return s.socialPersonalPart
  for (const g of s.deductionGroups || []) {
    const item = (g.items || []).find(i => i.name === '社保')
    if (item) return item.amount || 0
  }
  return 0
}
const getFundPersonalPart = (s) => {
  if (!s) return 0
  if (s.fundPersonalPart != null) return s.fundPersonalPart
  for (const g of s.deductionGroups || []) {
    const item = (g.items || []).find(i => i.name === '公积金')
    if (item) return item.amount || 0
  }
  return 0
}

const formatAmount = (val) => {
  if (val === null || val === undefined) return '—'
  return Number(val).toFixed(2)
}

const getStatusTagType = (status) => {
  const map = { pending: 'warning', issued: 'primary', confirmed: 'success', paid: 'success' }
  return map[status] || 'info'
}

const getStatusLabel = (status) => {
  const map = { pending: '待发放', issued: '已发放', confirmed: '员工已确认', paid: '已打款' }
  return map[status] || status
}
</script>

<style scoped>
.slip-detail-page {
  padding: 0;
  max-width: 880px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 16px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 10px 0 0;
}

.empty-state {
  padding: 80px 24px;
  text-align: center;
  background: #fafafa;
  border-radius: 8px;
  border: 1px dashed #dcdfe6;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}

.empty-desc {
  font-size: 13px;
  color: #909399;
}

.detail-card {
  background: white;
  border-radius: 8px;
  padding: 14px 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  margin-bottom: 14px;
}

.detail-card-title {
  font-size: 15px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.detail-table {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px 16px;
}

.detail-table-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.detail-table-label {
  font-size: 12px;
  color: #909399;
}

.detail-table-value {
  font-size: 13px;
  color: #303133;
  word-break: break-all;
}

.detail-table-value.highlight {
  color: #a40035;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.detail-table-value.primary-amount {
  color: #a40035;
  font-weight: 700;
  font-size: 16px;
}

.item-group {
  margin-bottom: 12px;
}

.item-group-title {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 6px;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  font-size: 13px;
}

.item-row.item-leaf {
  padding-left: 20px;
  color: #606266;
}

.item-row.item-subtotal {
  background: #f5f5f5;
  font-weight: 600;
  border-radius: 4px;
  margin-top: 2px;
}

.item-grand-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #fff5f8;
  border-radius: 4px;
  border: 1px solid #ffd6e2;
  font-size: 14px;
  font-weight: 700;
  margin-top: 6px;
}

.item-label {
  color: #303133;
}

.item-value {
  color: #303133;
  font-variant-numeric: tabular-nums;
}

.income-amount {
  color: #a40035;
}

.deduction-amount {
  color: #666;
}

.formula-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.mono {
  font-family: 'SF Mono', Menlo, Consolas, monospace;
  font-size: 12px;
  color: #606266;
}
</style>