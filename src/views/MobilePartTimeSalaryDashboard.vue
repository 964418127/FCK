<template>
  <div class="mobile-parttime-dashboard">
    <!-- 顶部导航 -->
    <div class="top-nav">
      <el-button type="text" @click="goBack" style="color: white;">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <div class="nav-title">我的账户</div>
      <div class="nav-actions">
        <el-button type="text" style="color: white;">
          <el-icon><MoreFilled /></el-icon>
        </el-button>
        <el-button type="text" @click="goBack" style="color: white;">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 门店切换 -->
    <div class="store-selector" @click="showStoreSheet = true">
      <el-icon class="store-icon"><Shop /></el-icon>
      <span class="store-label">{{ currentStoreLabel }}</span>
      <el-icon class="store-arrow"><ArrowDown /></el-icon>
    </div>

    <!-- Tab 栏 + 日期选择器 -->
    <div class="tab-bar">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </div>
      <div class="date-selector" @click="handleDatePicker">
        {{ currentDateLabel }}
        <el-icon class="date-arrow"><ArrowDown /></el-icon>
      </div>
    </div>

    <!-- 数据延迟提示（仅日/周/月统计显示） -->
    <div v-if="activeTab !== 'arrival'" class="delay-tip">
      <el-icon class="tip-icon"><WarningFilled /></el-icon>
      <div class="tip-content">
        <div class="tip-row tip-row-main">
          数据截至 <span class="tip-time">{{ cutoffTime }}</span>
          <span class="tip-divider">·</span>
          下次更新 <span class="tip-time">{{ nextRefreshTime }}</span>
        </div>
        <div class="tip-row tip-row-sub">
          预估数据仅作参考，以最终实发为准
        </div>
      </div>
    </div>

    <!-- ==================== 日/周/月统计（共用结构） ==================== -->
    <div v-show="activeTab !== 'arrival'" class="tab-content">
      <!-- 双数字卡（收入 + 支出） -->
      <div class="stats-card">
        <div class="stats-link" @click="handleIncomeExplain">
          <span>收入说明</span>
        </div>
        <div class="stats-numbers">
          <div class="stats-cell left">
            <div class="stats-amount income-amount">
              {{ formatAmount(currentStats.income) }}
              <el-icon v-if="activeTab !== 'month'" class="income-arrow"><ArrowDown /></el-icon>
            </div>
            <div class="stats-label">{{ currentStats.incomeLabel }}</div>
          </div>
          <div class="stats-cell right" @click="handleExpenseClick">
            <div class="stats-amount expense-amount">{{ formatAmount(currentStats.expense) }}</div>
            <div class="stats-label">
              {{ currentStats.expenseLabel }}
              <el-icon class="expense-arrow"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>

        <!-- 分类筛选 tab（带值） -->
        <div class="category-tabs">
          <div
            v-for="cat in categoryTabs"
            :key="cat.key"
            class="category-tab"
            :class="{ active: categoryFilter === cat.key }"
            @click="categoryFilter = cat.key"
          >
            <span class="cat-label">{{ cat.label }}</span>
            <span v-if="cat.value > 0" class="cat-value">
              <span class="cat-num">{{ cat.value.toFixed(2) }}</span>
              <span class="cat-unit">({{ cat.unit }})</span>
            </span>
            <span v-else-if="cat.showEmpty" class="cat-value-empty">({{ cat.unit }})</span>
          </div>
        </div>
      </div>

      <!-- 订单列表 -->
      <div class="order-list">
        <div
          v-for="item in filteredOrders"
          :key="item.id"
          class="order-item"
          @click="handleOpenOrder(item)"
        >
          <div class="order-row1">
            <div class="order-title-group">
              <span class="order-store">{{ item.store }}</span>
              <span v-if="item.isRepeatCustomer" class="repeat-tag inline">回头客</span>
            </div>
            <span class="order-amount">预计收入:{{ item.amount.toFixed(2) }}</span>
          </div>
          <div class="order-row2">
            <span class="order-service">{{ item.service }}</span>
            <el-icon class="order-chevron"><ArrowRight /></el-icon>
          </div>
          <div class="order-row3">
            <span class="order-time">{{ item.time }}</span>
          </div>
        </div>
        <div v-if="filteredOrders.length === 0" class="empty-tip">
          暂无订单
        </div>
      </div>
    </div>

    <!-- ==================== 到账情况 ==================== -->
    <div v-show="activeTab === 'arrival'" class="tab-content">
      <div
        v-for="(week, idx) in arrivalWeeks"
        :key="idx"
        class="arrival-week-card"
      >
        <div class="arrival-title">
          {{ week.title }}<span class="arrival-unit">({{ week.unit }})</span>
        </div>
        <div class="arrival-grid">
          <div
            v-for="(item, i) in week.items"
            :key="i"
            class="arrival-cell"
          >
            <div class="arrival-amount">{{ formatAmount(item.value) }}</div>
            <div class="arrival-label">
              {{ item.label }}
              <el-icon class="arrival-chevron"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 订单详情弹层（底部上滑） ==================== -->
    <teleport to="body">
      <transition name="order-modal-fade">
        <div
          v-if="orderDetailVisible"
          class="order-modal-overlay"
          @click.self="handleCloseDetail"
        >
          <transition name="order-modal-slide" appear>
            <div v-if="orderDetailVisible" class="order-modal">
              <div class="order-modal-handle"></div>
              <div class="order-modal-header">
                <span class="modal-title">订单收入</span>
                <el-button type="text" @click="handleCloseDetail" class="modal-close">
                  <el-icon :size="20"><Close /></el-icon>
                </el-button>
              </div>

              <div v-if="currentOrderDetail" class="order-modal-body">
                <div class="detail-summary-card">
                  <div class="summary-row1">
                    <div class="summary-store">
                      <span class="store-name">{{ currentOrderDetail.storeName }}</span>
                      <span class="summary-divider">|</span>
                      <span class="customer-phone">{{ currentOrderDetail.customerPhone }}</span>
                      <span class="summary-divider">|</span>
                      <span class="customer-info">{{ currentOrderDetail.customerInfo }}</span>
                    </div>
                    <el-tag type="success" size="small" effect="light">{{ currentOrderDetail.status }}</el-tag>
                  </div>
                  <div class="summary-time">
                    {{ currentOrderDetail.startTime }} | {{ currentOrderDetail.endTime }}
                  </div>
                  <div class="summary-service-row">
                    <span class="summary-service">{{ currentOrderDetail.service }}</span>
                    <span v-if="currentOrderDetail.isRepeatCustomer" class="repeat-tag inline">第 {{ currentOrderDetail.repeatCount }} 次回头</span>
                  </div>
                  <div class="summary-orderno">
                    <span class="orderno-text">订单编号：{{ currentOrderDetail.orderNo }}</span>
                    <el-button type="text" size="small" @click.stop="copyOrderNo" class="copy-btn">
                      <el-icon :size="14"><CopyDocument /></el-icon>
                    </el-button>
                  </div>
                  <div class="summary-payment">
                    <span class="payment-label">实付款：</span>
                    <span class="payment-formula">
                      <span class="payment-original">¥{{ currentOrderDetail.originalPrice }}</span>
                      <span class="formula-op">−</span>
                      <span class="formula-discount">
                        ¥{{ formatAmount(currentOrderDetail.originalPrice - currentOrderDetail.actualPayment) }}
                        <span class="discount-tag">优惠</span>
                      </span>
                      <span class="formula-op">=</span>
                      <span class="payment-actual">¥{{ currentOrderDetail.actualPayment }}</span>
                    </span>
                  </div>
                </div>

                <div class="detail-section-card">
                  <div class="section-title-line">
                    <span class="title-bar"></span>
                    <span class="title-text">订单提成</span>
                  </div>
                  <div class="section-content">
                    <div class="content-line">
                      <span class="content-label">项目提成</span>
                      <span class="content-value">{{ currentOrderDetail.pieceworkCommission }}<span class="value-unit"> 元</span></span>
                    </div>
                  </div>
                </div>

                <div v-if="currentOrderDetail.isRepeatCustomer" class="detail-section-card">
                  <div class="section-title-line">
                    <span class="title-bar"></span>
                    <span class="title-text">回头客激励</span>
                  </div>
                  <div class="section-content">
                    <div class="content-line">
                      <span class="content-label">第 {{ currentOrderDetail.repeatCount }} 次回头奖励</span>
                      <span class="content-value repeat-value">¥{{ currentOrderDetail.repeatBonus }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="order-modal-footer" @click="handleAppeal">
                <el-icon class="footer-icon"><QuestionFilled /></el-icon>
                <span>对该笔收入有疑惑</span>
              </div>
            </div>
          </transition>
        </div>
      </transition>
    </teleport>

    <!-- ==================== 门店选择下拉（底部上滑） ==================== -->
    <teleport to="body">
      <transition name="order-modal-fade">
        <div
          v-if="showStoreSheet"
          class="order-modal-overlay"
          @click.self="showStoreSheet = false"
        >
          <transition name="order-modal-slide" appear>
            <div v-if="showStoreSheet" class="order-modal store-sheet">
              <div class="order-modal-handle"></div>
              <div class="order-modal-header">
                <span class="modal-title">选择门店</span>
                <el-button type="text" @click="showStoreSheet = false" class="modal-close">
                  <el-icon :size="20"><Close /></el-icon>
                </el-button>
              </div>
              <div class="order-modal-body store-sheet-body">
                <div
                  v-for="(store, idx) in storeList"
                  :key="store.key"
                  class="store-sheet-item"
                  :class="{ active: selectedStore === store.key }"
                  @click="handleStoreSelect(store.key)"
                >
                  <div class="store-sheet-rank">{{ idx + 1 }}</div>
                  <div class="store-sheet-info">
                    <div class="store-sheet-label">{{ store.label }}</div>
                    <div class="store-sheet-daily">今日预估 ¥{{ store.dailyForecast.toLocaleString() }}</div>
                  </div>
                  <div class="store-sheet-amount">
                    <div class="amount-label">本月预告收入</div>
                    <div class="amount-value">¥{{ store.monthlyForecast.toLocaleString() }}</div>
                  </div>
                  <el-icon v-if="selectedStore === store.key" class="store-sheet-check"><Check /></el-icon>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ArrowDown, ArrowRight, Close, MoreFilled, CopyDocument, QuestionFilled, Shop, Check, WarningFilled } from '@element-plus/icons-vue'

const router = useRouter()

// ==================== Tabs ====================
const activeTab = ref('day')
const tabs = [
  { key: 'day', label: '日统计' },
  { key: 'week', label: '周统计' },
  { key: 'month', label: '月统计' },
  { key: 'arrival', label: '到账情况' }
]

// 日期选择器（mock）
const dateLabelMap = {
  day: '26年06月05日',
  week: '26年06月第一周',
  month: '26年06月',
  arrival: '26年06月'
}
const currentDateLabel = computed(() => dateLabelMap[activeTab.value] || '')

const handleDatePicker = () => {
  ElMessage.info('日期选择器 - 当前为 mock 数据')
}

// ==================== 分类筛选 tab ====================
const categoryFilter = ref('all')
const categoryTabs = computed(() => {
  const orders = periodOrders.value
  return [
    { key: 'all', label: '全部', value: totalIncome.value, unit: '元' },
    { key: 'piecework', label: '基础提成', value: sumBy(orders, 'piecework'), unit: '元' },
    { key: 'referral', label: '内部介绍', value: 0, unit: '元', showEmpty: true },
    { key: 'repeat', label: '回头客奖励', value: sumBy(orders, 'repeat'), unit: '元' }
  ]
})

// ==================== 门店切换（多门店：按本月预告收入倒序） ====================
const storeList = ref([
  { key: 'yintai', label: 'in99银泰中心店', monthlyForecast: 8420, dailyForecast: 197.8 },
  { key: 'danzishi', label: '弹子石老街店', monthlyForecast: 6230, dailyForecast: 156.4 },
  { key: 'chengdu', label: '成都印象城店', monthlyForecast: 4890, dailyForecast: 89.2 },
  { key: 'beicheng', label: '北城天街店', monthlyForecast: 3210, dailyForecast: 45.6 }
])
storeList.value.sort((a, b) => {
  if (b.monthlyForecast !== a.monthlyForecast) return b.monthlyForecast - a.monthlyForecast
  return b.dailyForecast - a.dailyForecast
})
const selectedStore = ref(storeList.value[0].key)
const showStoreSheet = ref(false)
const currentStoreLabel = computed(() => storeList.value.find(s => s.key === selectedStore.value)?.label || '')
const handleStoreSelect = (key) => {
  selectedStore.value = key
  showStoreSheet.value = false
  ElMessage.success(`已切换到：${storeList.value.find(s => s.key === key)?.label}`)
}

// ==================== Mock 订单数据 ====================
const allOrders = ref([
  { id: 1, storeKey: 'yintai', store: 'in99银泰中心店', service: '脊柱调整60分钟', time: '2026-06-05 12:20:00', amount: 220.34, originalPrice: 498, actualPayment: 440.68, type: 'piecework', isRepeatCustomer: false },
  { id: 2, storeKey: 'yintai', store: 'in99银泰中心店', service: '骨盆·调整60分钟', time: '2026-06-05 11:04:00', amount: 220.34, originalPrice: 498, actualPayment: 396, type: 'piecework', isRepeatCustomer: true, repeatCount: 2 },
  { id: 3, storeKey: 'yintai', store: 'in99银泰中心店', service: '骨盆·调整60分钟', time: '2026-06-04 17:50:00', amount: 220.34, originalPrice: 498, actualPayment: 440.68, type: 'piecework', isRepeatCustomer: false },
  { id: 4, storeKey: 'yintai', store: 'in99银泰中心店', service: '骨盆·调整60分钟', time: '2026-06-04 14:30:00', amount: 143.7, originalPrice: 498, actualPayment: 287.4, type: 'piecework', isRepeatCustomer: true, repeatCount: 3 },
  { id: 5, storeKey: 'yintai', store: 'in99银泰中心店', service: '骨盆·调整60分钟', time: '2026-06-04 13:20:00', amount: 220.34, originalPrice: 498, actualPayment: 440.68, type: 'piecework', isRepeatCustomer: false },
  { id: 6, storeKey: 'yintai', store: 'in99银泰中心店', service: '运动拉伸60分钟', time: '2026-06-04 12:09:00', amount: 182.02, originalPrice: 398, actualPayment: 364.04, type: 'piecework', isRepeatCustomer: true, repeatCount: 1 },
  { id: 7, storeKey: 'yintai', store: 'in99银泰中心店', service: '足疗40分钟', time: '2026-06-04 10:30:00', amount: 156.0, originalPrice: 328, actualPayment: 298, type: 'piecework', isRepeatCustomer: false },
  { id: 8, storeKey: 'yintai', store: 'in99银泰中心店', service: '头疗30分钟', time: '2026-06-04 09:15:00', amount: 98.5, originalPrice: 198, actualPayment: 188, type: 'piecework', isRepeatCustomer: true, repeatCount: 1 },
  // 弹子石老街店
  { id: 9, storeKey: 'danzishi', store: '弹子石老街店', service: '足疗40分钟', time: '2026-06-05 09:30:00', amount: 168.0, originalPrice: 358, actualPayment: 336, type: 'piecework', isRepeatCustomer: false },
  { id: 10, storeKey: 'danzishi', store: '弹子石老街店', service: '肩颈调理30分钟', time: '2026-06-04 16:20:00', amount: 138.0, originalPrice: 288, actualPayment: 248, type: 'piecework', isRepeatCustomer: true, repeatCount: 2 },
  // 成都印象城店
  { id: 11, storeKey: 'chengdu', store: '成都印象城店', service: '中式推拿60分钟', time: '2026-06-04 19:00:00', amount: 198.0, originalPrice: 398, actualPayment: 376, type: 'piecework', isRepeatCustomer: false },
  // 北城天街店
  { id: 12, storeKey: 'beicheng', store: '北城天街店', service: '精油开背60分钟', time: '2026-06-05 10:00:00', amount: 188.0, originalPrice: 398, actualPayment: 338, type: 'piecework', isRepeatCustomer: true, repeatCount: 1 }
])

// 按门店过滤的订单
const storeOrders = computed(() => allOrders.value.filter(o => o.storeKey === selectedStore.value))

// ==================== 工具 ====================
const sumBy = (arr, type) => arr.filter(o => o.type === type).reduce((s, o) => s + o.amount, 0)
const formatAmount = (val) => (typeof val === 'number' ? val.toFixed(2) : val)

// ==================== 当前周期内的订单 ====================
const periodOrders = computed(() => {
  const list = storeOrders.value
  if (activeTab.value === 'day') {
    return list.filter(o => o.time.startsWith('2026-06-05'))
  }
  // 周/月 都返回 6/1 起的数据（mock）
  return list
})

// 按分类筛选后的订单
const filteredOrders = computed(() => {
  if (categoryFilter.value === 'all') return periodOrders.value
  return periodOrders.value.filter(o => o.type === categoryFilter.value)
})

// 顶部数字
const totalIncome = computed(() => periodOrders.value.reduce((s, o) => s + o.amount, 0))
const totalExpense = computed(() => {
  // 支出 = 实际付款 - 预计收入 的差值，这里按 87.66 占位
  return 0
})

// 当前 tab 的数字
const currentStats = computed(() => {
  const map = {
    day: { income: totalIncome.value, expense: totalExpense.value, incomeLabel: '今日收入', expenseLabel: '今日支出' },
    week: { income: 3362.58, expense: 87.66, incomeLabel: '本周收入', expenseLabel: '本周支出' },
    month: { income: 3362.58, expense: 87.66, incomeLabel: '本月收入', expenseLabel: '本月支出' }
  }
  return map[activeTab.value] || map.day
})

// ==================== 到账情况（4 周） ====================
const arrivalWeeks = reactive([
  {
    title: '第一周(1号-7号)',
    unit: '元',
    items: [
      { label: '合计金额', value: 2921.9 },
      { label: '负工资抵扣', value: 0 },
      { label: '扣缴', value: 87.66 },
      { label: '应发金额', value: 2834.24 },
      { label: '实发金额', value: 0 }
    ]
  },
  {
    title: '第二周(8号-14号)',
    unit: '元',
    items: [
      { label: '合计金额', value: 0 },
      { label: '负工资抵扣', value: 0 },
      { label: '扣缴', value: 0 },
      { label: '应发金额', value: 0 },
      { label: '实发金额', value: 0 }
    ]
  },
  {
    title: '第三周(15号-21号)',
    unit: '元',
    items: [
      { label: '合计金额', value: 0 },
      { label: '负工资抵扣', value: 0 },
      { label: '扣缴', value: 0 },
      { label: '应发金额', value: 0 },
      { label: '实发金额', value: 0 }
    ]
  },
  {
    title: '第四周(22号-月底)',
    unit: '元',
    items: [
      { label: '合计金额', value: 0 },
      { label: '负工资抵扣', value: 0 },
      { label: '扣缴', value: 0 },
      { label: '应发金额', value: 0 },
      { label: '实发金额', value: 0 }
    ]
  }
])

// ==================== 订单详情 ====================
const orderDetailVisible = ref(false)
const currentOrderDetail = ref(null)
const handleOpenOrder = (item) => {
  // 构造详情（mock）
  const isRepeat = !!item.isRepeatCustomer
  currentOrderDetail.value = {
    storeName: item.store,
    service: item.service,
    customerPhone: '138****8888',
    customerInfo: '男 / 32岁',
    status: '已完成',
    startTime: item.time,
    endTime: item.time.replace(/\d{2}$/, '00'),
    orderNo: 'DD2026060' + String(item.id).padStart(4, '0'),
    originalPrice: item.originalPrice,
    actualPayment: item.actualPayment,
    isRepeatCustomer: isRepeat,
    repeatCount: item.repeatCount || 1,
    pieceworkCommission: item.amount.toFixed(2),
    repeatBonus: isRepeat ? (item.amount * 0.1).toFixed(2) : 0
  }
  orderDetailVisible.value = true
}
const handleCloseDetail = () => {
  orderDetailVisible.value = false
}
const handleAppeal = () => {
  ElMessage.success('已提交疑问，HR 将尽快处理')
  handleCloseDetail()
}
const copyOrderNo = () => {
  if (!currentOrderDetail.value) return
  const text = currentOrderDetail.value.orderNo
  navigator.clipboard?.writeText(text).then(() => {
    ElMessage.success('订单编号已复制')
  })
}

// ==================== 顶部链接 ====================
const handleIncomeExplain = () => {
  ElMessage.info('收入说明：本月预估收入基于已完成订单的计件提成、回头客奖励等汇总')
}
const handleExpenseClick = () => {
  ElMessage.info('支出明细 - 跳转页面待实现')
}

// ==================== 数据截止与下次刷新时间（按整点规则） ====================
const now = ref(new Date())
let refreshTimer = null
onMounted(() => {
  refreshTimer = setInterval(() => { now.value = new Date() }, 60_000)
})
onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
const formatDateHour = (d) => {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:00`
}
const cutoffTime = computed(() => formatDateHour(now.value))
const nextRefreshTime = computed(() => {
  const d = new Date(now.value)
  d.setHours(d.getHours() + 1)
  return formatDateHour(d)
})

// ==================== 返回 ====================
const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/mobile-menu')
  }
}
</script>

<style scoped>
.mobile-parttime-dashboard {
  min-height: 100vh;
  height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

/* ========== 顶部导航 ========== */
.top-nav {
  background: linear-gradient(135deg, #a40035 0%, #7a0026 100%);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  flex-shrink: 0;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  flex: 1;
  text-align: center;
}

.nav-actions {
  display: flex;
  gap: 4px;
}

.nav-actions :deep(.el-button) {
  margin-left: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 4px 8px;
  font-size: 12px;
  min-height: 28px;
}

/* ========== 门店选择器 ========== */
.store-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  font-size: 15px;
  color: #333;
  font-weight: 500;
  flex-shrink: 0;
}

.store-icon {
  color: #a40035;
  font-size: 16px;
  flex-shrink: 0;
}

.store-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.store-arrow {
  color: #999;
  font-size: 14px;
  flex-shrink: 0;
}

/* ========== Tab 栏 ========== */
.tab-bar {
  background: white;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tab-item {
  padding: 14px 12px;
  font-size: 15px;
  color: #666;
  position: relative;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  font-weight: 500;
}

.tab-item.active {
  color: #a40035;
  font-weight: 700;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 3px;
  background: #a40035;
  border-radius: 2px;
}

.date-selector {
  margin-left: auto;
  padding: 14px 16px;
  font-size: 13px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.date-arrow {
  font-size: 12px;
}

/* ========== Tab Content ========== */
.tab-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* ========== 数据延迟提示 ========== */
.delay-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 6px;
  margin: 12px 12px 0;
  font-size: 12px;
  color: #876800;
  line-height: 1.4;
}

.tip-icon {
  font-size: 14px;
  color: #faad14;
  flex-shrink: 0;
}

.tip-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tip-row {
  line-height: 1.4;
}

.tip-row-main {
  font-size: 12px;
  font-weight: 500;
}

.tip-time {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: #a40035;
  margin: 0 2px;
}

.tip-divider {
  color: #d4b75e;
  margin: 0 6px;
}

.tip-row-sub {
  font-size: 11px;
  opacity: 0.85;
}

/* ========== 统计卡 ========== */
.stats-card {
  background: white;
  margin: 12px;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  position: relative;
}

.stats-link {
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 12px;
  color: #a40035;
  cursor: pointer;
}

.stats-numbers {
  display: flex;
  margin-bottom: 20px;
  padding-top: 8px;
}

.stats-cell {
  flex: 1;
  text-align: center;
}

.stats-cell.left {
  border-right: 1px solid #f0f0f0;
}

.stats-amount {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 6px;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}

.income-amount {
  color: #a40035;
}

.expense-amount {
  color: #333;
}

.income-arrow {
  font-size: 16px;
  color: #a40035;
}

.expense-arrow {
  font-size: 14px;
  color: #999;
  margin-left: 2px;
}

.stats-label {
  font-size: 13px;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

/* ========== 分类 tab ========== */
.category-tabs {
  display: flex;
  gap: 16px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.category-tabs::-webkit-scrollbar {
  display: none;
}

.category-tab {
  padding: 8px 0 10px;
  font-size: 13px;
  color: #666;
  position: relative;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.category-tab.active {
  color: #a40035;
  font-weight: 600;
}

.category-tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #a40035;
  border-radius: 1px;
}

.cat-value {
  font-weight: 500;
}

.cat-num {
  color: inherit;
  font-weight: 600;
}

.cat-unit {
  color: #999;
  font-weight: normal;
  font-size: 12px;
}

.cat-value-empty {
  color: #999;
  font-size: 12px;
}

/* ========== 订单列表 ========== */
.order-list {
  padding: 0 12px 20px;
}

.order-item {
  background: white;
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  cursor: pointer;
}

.order-row1 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.order-store {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.order-title-group {
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
  overflow: hidden;
}

.order-amount {
  font-size: 14px;
  color: #a40035;
  font-weight: 600;
}

.order-row2 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.order-service {
  font-size: 13px;
  color: #999;
}

.order-chevron {
  color: #ccc;
  font-size: 14px;
}

.order-row3 {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-time {
  font-size: 12px;
  color: #ccc;
}

.empty-tip {
  text-align: center;
  padding: 40px 0;
  color: #ccc;
  font-size: 13px;
}

/* ========== 到账情况 ========== */
.arrival-week-card {
  background: white;
  margin: 12px;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.arrival-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.arrival-unit {
  font-size: 12px;
  color: #999;
  font-weight: normal;
  margin-left: 4px;
}

.arrival-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px 8px;
}

.arrival-cell {
  text-align: left;
  cursor: pointer;
}

.arrival-amount {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.arrival-label {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 2px;
}

.arrival-chevron {
  color: #ccc;
  font-size: 12px;
}

/* ========== 订单详情弹层（复用全职模式） ========== */
.order-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.order-modal {
  background: #f5f5f5;
  width: 100%;
  max-width: 480px;
  border-radius: 16px 16px 0 0;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.order-modal-handle {
  width: 36px;
  height: 4px;
  background: #ddd;
  border-radius: 2px;
  margin: 8px auto 4px;
  flex-shrink: 0;
}

.order-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px 12px;
  flex-shrink: 0;
}

.modal-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

.modal-close {
  color: #999;
  padding: 4px;
}

.order-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px 12px;
  -webkit-overflow-scrolling: touch;
}

.detail-summary-card {
  background: white;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 10px;
}

.summary-row1 {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.summary-store {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 14px;
  flex: 1;
  min-width: 0;
}

.store-name {
  font-weight: 600;
  color: #333;
}

.summary-divider {
  color: #ddd;
}

.customer-phone,
.customer-info {
  color: #666;
  font-size: 12px;
}

.summary-time {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.summary-service-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.summary-service {
  font-size: 14px;
  color: #333;
}

.repeat-tag.inline {
  display: inline-block;
  font-size: 11px;
  padding: 1px 6px;
  background: #fff5f7;
  color: #a40035;
  border: 1px solid #f5c2d0;
  border-radius: 4px;
  font-weight: 500;
}

.summary-orderno {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 10px;
  padding: 6px 8px;
  background: #fafafa;
  border-radius: 4px;
}

.orderno-text {
  font-size: 12px;
  color: #666;
  flex: 1;
}

.copy-btn {
  padding: 0;
  color: #999;
}

.summary-payment {
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px dashed #f0f0f0;
  flex-wrap: wrap;
}

.payment-formula {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  font-size: 14px;
  color: #999;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.formula-op {
  color: #999;
  font-weight: 500;
}

.formula-discount {
  color: #999;
  font-weight: 500;
}

.discount-tag {
  display: inline-block;
  margin-left: 2px;
  padding: 0 4px;
  font-size: 10px;
  color: #fff;
  background: #f0a8be;
  border-radius: 3px;
  font-weight: 500;
  vertical-align: 1px;
}

.payment-label {
  font-size: 12px;
  color: #999;
}

.payment-actual {
  font-size: 20px;
  font-weight: 700;
  color: #a40035;
}

.payment-original {
  font-size: 14px;
  color: #999;
  font-weight: 500;
}

.detail-section-card {
  background: white;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 10px;
}

.section-title-line {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.section-title-line .title-bar {
  width: 3px;
  height: 13px;
  background: #a40035;
  border-radius: 2px;
}

.section-title-line .title-text {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.section-content {
  display: flex;
  flex-direction: column;
}

.content-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  padding: 6px 0;
  color: #333;
}

.content-label {
  color: #666;
}

.content-value {
  font-weight: 600;
  color: #333;
}

.discount-value {
  color: #a40035;
}

.repeat-value {
  color: #a40035;
  font-weight: 700;
}

.content-empty .content-label {
  color: #999;
  font-style: italic;
}

.value-unit {
  font-size: 11px;
  color: #999;
  font-weight: normal;
  margin-left: 1px;
}

.order-modal-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 48px;
  background: white;
  border-top: 1px solid #f0f0f0;
  color: #a40035;
  font-size: 14px;
  cursor: pointer;
  flex-shrink: 0;
}

.footer-icon {
  font-size: 16px;
}

/* ========== 门店选择 sheet ========== */
.store-sheet {
  max-height: 70vh;
}

.store-sheet-body {
  padding: 0 0 12px;
}

.store-sheet-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  position: relative;
}

.store-sheet-item.active {
  background: #fdf2f5;
}

.store-sheet-rank {
  width: 24px;
  height: 24px;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #999;
  flex-shrink: 0;
}

.store-sheet-item.active .store-sheet-rank {
  background: #a40035;
  color: white;
}

.store-sheet-info {
  flex: 1;
  min-width: 0;
}

.store-sheet-label {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.store-sheet-daily {
  font-size: 12px;
  color: #999;
}

.store-sheet-amount {
  text-align: right;
  flex-shrink: 0;
}

.store-sheet-amount .amount-label {
  font-size: 11px;
  color: #999;
  margin-bottom: 2px;
}

.store-sheet-amount .amount-value {
  font-size: 15px;
  font-weight: 700;
  color: #a40035;
}

.store-sheet-check {
  color: #a40035;
  font-size: 18px;
  flex-shrink: 0;
  margin-left: 4px;
}

/* ========== 弹层动画 ========== */
.order-modal-fade-enter-active,
.order-modal-fade-leave-active {
  transition: opacity 0.25s;
}
.order-modal-fade-enter-from,
.order-modal-fade-leave-to {
  opacity: 0;
}

.order-modal-slide-enter-active,
.order-modal-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.order-modal-slide-enter-from,
.order-modal-slide-leave-to {
  transform: translateY(100%);
}
</style>
