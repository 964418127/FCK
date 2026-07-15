<template>
  <div class="mobile-pt-dashboard-2">
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

    <!-- 数据延迟提示（非到账 Tab 显示） -->
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

    <!-- ==================== 日统计 ==================== -->
    <div v-show="activeTab === 'day'" class="tab-content">
      <!-- 双数字卡（收入 + 支出） -->
      <div class="stats-card">
        <div class="stats-link" @click="handleIncomeExplain">
          <span>收入说明</span>
        </div>
        <div class="stats-numbers">
          <div class="stats-cell left">
            <div class="stats-amount income-amount">
              {{ formatAmount(currentStats.income) }}
              <el-icon class="income-arrow"><ArrowDown /></el-icon>
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

        <!-- 分类筛选 tab -->
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

    <!-- ==================== 预估收入（按周切分） ==================== -->
    <div v-show="activeTab === 'estimate'" class="tab-content month-content">
      <!-- 收入分类 Tab 横向切换（按周） -->
      <div class="bills-switcher">
        <div class="bills-switcher-header">
          <span class="bills-switcher-title">收入分类</span>
          <span class="bills-switcher-count">共 {{ weekBills.length }} 张</span>
        </div>
        <div class="bill-tabs">
          <div
            v-for="(bill, idx) in weekBills"
            :key="bill.id"
            class="bill-tab"
            :class="{ active: selectedBillIndex === idx }"
            @click="selectedBillIndex = idx"
          >
            <div class="bill-tab-name">{{ bill.name }}</div>
            <div class="bill-tab-period">{{ bill.period }}</div>
          </div>
        </div>
      </div>

      <!-- 预估收入 = 当前选中周工资单的薪酬项 -->
      <div class="month-section-card">
        <div class="section-title">预估收入</div>
        <div v-if="selectedBill && selectedBill.incomeItems.length > 0" class="month-category-grid">
          <div
            v-for="(item, idx) in selectedBill.incomeItems"
            :key="`income-${idx}`"
            class="month-cat-item"
            @click="handleIncomeItemClick(item)"
          >
            <div class="month-cat-value">
              {{ formatAmount(item.value) }}<span class="month-cat-unit">({{ unitOf(item) }})</span>
            </div>
            <div class="month-cat-label">
              {{ item.label }}
              <el-icon class="cat-chevron"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
        <div v-else class="empty-tip">该周工资单暂无收入项</div>
      </div>

      <!-- 预估支出 = 当前选中周工资单的扣缴项 -->
      <div class="month-section-card">
        <div class="section-title">预估支出</div>
        <div v-if="selectedBill && selectedBill.deductionItems.length > 0" class="month-category-grid">
          <div
            v-for="(item, idx) in selectedBill.deductionItems"
            :key="`deduction-${idx}`"
            class="month-cat-item"
            :class="{ 'negative': item.value < 0 }"
          >
            <div class="month-cat-value">
              {{ formatAmount(item.value) }}<span class="month-cat-unit">({{ unitOf(item) }})</span>
            </div>
            <div class="month-cat-label">
              {{ item.label }}
              <el-icon class="cat-chevron"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
        <div v-else class="empty-tip">该周工资单暂无扣缴项</div>
      </div>
    </div>

    <!-- ==================== 到账情况（按周 4 个 card） ==================== -->
    <div v-show="activeTab === 'arrival'" class="tab-content">
      <div
        v-for="(section, sIdx) in arrivalWeeks"
        :key="sIdx"
        class="arrival-week-card"
      >
        <div class="arrival-title">
          {{ section.title }}<span class="arrival-unit">({{ section.unit }})</span>
        </div>
        <div class="arrival-grid">
          <div
            v-for="(item, idx) in section.items"
            :key="idx"
            class="arrival-item"
            :class="{ 'is-final': item.isFinal, 'is-negative': item.value < 0 }"
          >
            <div class="arrival-amount">{{ formatAmount(item.value) }}</div>
            <div class="arrival-label">
              {{ item.label }}
              <el-icon class="cat-chevron"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 订单详情弹层 ==================== -->
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

    <!-- ==================== 月份选择 Sheet ==================== -->
    <teleport to="body">
      <transition name="order-modal-fade">
        <div
          v-if="showMonthSheet"
          class="order-modal-overlay"
          @click.self="showMonthSheet = false"
        >
          <transition name="order-modal-slide" appear>
            <div v-if="showMonthSheet" class="order-modal month-sheet">
              <div class="order-modal-handle"></div>
              <div class="order-modal-header">
                <span class="modal-title">选择月份</span>
                <el-button type="text" @click="showMonthSheet = false" class="modal-close">
                  <el-icon :size="20"><Close /></el-icon>
                </el-button>
              </div>
              <div class="order-modal-body month-sheet-body">
                <div
                  v-for="ym in availableMonths"
                  :key="ym"
                  class="month-sheet-item"
                  :class="{ active: selectedMonth === ym }"
                  @click="handleMonthSelect(ym)"
                >
                  <div class="month-sheet-label">{{ formatMonthLabel(ym) }}</div>
                  <div class="month-sheet-count">
                    共 {{ (weekBillsMap[ym] || []).length }} 张工资单
                  </div>
                  <el-icon v-if="selectedMonth === ym" class="month-sheet-check"><Check /></el-icon>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </transition>
    </teleport>

    <!-- ==================== 门店选择 Sheet ==================== -->
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

    <!-- ==================== 收入明细弹层（按周+按类筛选的订单列表） ==================== -->
    <teleport to="body">
      <transition name="order-modal-fade">
        <div
          v-if="incomeItemSheetVisible"
          class="order-modal-overlay"
          @click.self="handleCloseIncomeItemSheet"
        >
          <transition name="order-modal-slide" appear>
            <div v-if="incomeItemSheetVisible" class="order-modal income-item-sheet">
              <div class="order-modal-handle"></div>
              <div class="order-modal-header">
                <span class="modal-title">{{ currentIncomeLabel }} - {{ selectedBill ? selectedBill.period : '' }}</span>
                <el-button type="text" @click="handleCloseIncomeItemSheet" class="modal-close">
                  <el-icon :size="20"><Close /></el-icon>
                </el-button>
              </div>

              <div class="order-modal-body income-item-sheet-body">
                <div v-if="incomeItemOrders.length > 0" class="income-item-subtotal">
                  合计 {{ incomeItemOrders.length }} 笔，共
                  <span class="subtotal-value">{{ formatAmount(incomeItemSubtotal) }} 元</span>
                </div>

                <div v-if="incomeItemOrders.length > 0" class="order-list income-orders-list">
                  <div v-for="item in incomeItemOrders" :key="item.id" class="order-item" @click="handleOpenOrderFromIncome(item)">
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
                </div>

                <div v-else class="empty-tip">该周暂无该类订单</div>
              </div>
            </div>
          </transition>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ArrowDown, ArrowRight, Close, MoreFilled, CopyDocument, QuestionFilled, Check, WarningFilled, Shop } from '@element-plus/icons-vue'

const router = useRouter()

// ==================== Tabs ====================
const activeTab = ref('day')
const tabs = [
  { key: 'day', label: '日统计' },
  { key: 'estimate', label: '预估收入' },
  { key: 'arrival', label: '到账情况' }
]

// ==================== 门店（多门店：按本月预告收入倒序） ====================
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

// ==================== 日统计（原非全日制逻辑） ====================
const categoryFilter = ref('all')
const allOrders = ref([
  // WK-2026-W1 (6月1日-6月7日)
  { id: 1, weekKey: 'WK-2026-06-W1', store: 'in99银泰中心店', service: '脊柱调整60分钟', time: '2026-06-05 12:20:00', amount: 220.34, originalPrice: 498, actualPayment: 440.68, type: 'piecework', isRepeatCustomer: false },
  { id: 2, weekKey: 'WK-2026-06-W1', store: 'in99银泰中心店', service: '骨盆·调整60分钟', time: '2026-06-05 11:04:00', amount: 220.34, originalPrice: 498, actualPayment: 396, type: 'piecework', isRepeatCustomer: true, repeatCount: 2 },
  { id: 3, weekKey: 'WK-2026-06-W1', store: 'in99银泰中心店', service: '骨盆·调整60分钟', time: '2026-06-04 17:50:00', amount: 220.34, originalPrice: 498, actualPayment: 440.68, type: 'piecework', isRepeatCustomer: false },
  { id: 4, weekKey: 'WK-2026-06-W1', store: 'in99银泰中心店', service: '骨盆·调整60分钟', time: '2026-06-04 14:30:00', amount: 143.7, originalPrice: 498, actualPayment: 287.4, type: 'piecework', isRepeatCustomer: true, repeatCount: 3 },
  { id: 5, weekKey: 'WK-2026-06-W1', store: 'in99银泰中心店', service: '骨盆·调整60分钟', time: '2026-06-04 13:20:00', amount: 220.34, originalPrice: 498, actualPayment: 440.68, type: 'piecework', isRepeatCustomer: false },
  { id: 6, weekKey: 'WK-2026-06-W1', store: 'in99银泰中心店', service: '运动拉伸60分钟', time: '2026-06-04 12:09:00', amount: 182.02, originalPrice: 398, actualPayment: 364.04, type: 'piecework', isRepeatCustomer: true, repeatCount: 1 },
  { id: 7, weekKey: 'WK-2026-06-W1', store: 'in99银泰中心店', service: '足疗40分钟', time: '2026-06-04 10:30:00', amount: 156.0, originalPrice: 328, actualPayment: 298, type: 'piecework', isRepeatCustomer: false },
  { id: 8, weekKey: 'WK-2026-06-W1', store: 'in99银泰中心店', service: '头疗30分钟', time: '2026-06-04 09:15:00', amount: 98.5, originalPrice: 198, actualPayment: 188, type: 'piecework', isRepeatCustomer: true, repeatCount: 1 },

  // WK-2026-06-W2 (6月8日-6月14日)
  { id: 9, weekKey: 'WK-2026-06-W2', store: 'in99银泰中心店', service: '整脊踩背40分钟', time: '2026-06-12 15:00:00', amount: 178.2, originalPrice: 398, actualPayment: 360, type: 'piecework', isRepeatCustomer: false },
  { id: 10, weekKey: 'WK-2026-06-W2', store: 'in99银泰中心店', service: '足疗40分钟', time: '2026-06-10 19:00:00', amount: 156.0, originalPrice: 328, actualPayment: 298, type: 'piecework', isRepeatCustomer: false },
  { id: 11, weekKey: 'WK-2026-06-W2', store: 'in99银泰中心店', service: '中式推拿60分钟', time: '2026-06-09 14:30:00', amount: 198.0, originalPrice: 398, actualPayment: 376, type: 'piecework', isRepeatCustomer: true, repeatCount: 1 },
  { id: 12, weekKey: 'WK-2026-06-W2', store: 'in99银泰中心店', service: '肩颈调理30分钟', time: '2026-06-08 11:00:00', amount: 124.0, originalPrice: 268, actualPayment: 248, type: 'piecework', isRepeatCustomer: false },

  // WK-2026-06-W3 (6月15日-6月21日)
  { id: 13, weekKey: 'WK-2026-06-W3', store: 'in99银泰中心店', service: '脊柱调整60分钟', time: '2026-06-20 16:00:00', amount: 220.0, originalPrice: 498, actualPayment: 440, type: 'piecework', isRepeatCustomer: false },
  { id: 14, weekKey: 'WK-2026-06-W3', store: 'in99银泰中心店', service: '骨盆·调整60分钟', time: '2026-06-19 18:00:00', amount: 198.0, originalPrice: 498, actualPayment: 396, type: 'piecework', isRepeatCustomer: true, repeatCount: 4 },
  { id: 15, weekKey: 'WK-2026-06-W3', store: 'in99银泰中心店', service: '运动拉伸60分钟', time: '2026-06-18 10:00:00', amount: 89.4, originalPrice: 398, actualPayment: 360, type: 'repeat', isRepeatCustomer: true, repeatCount: 2 },
  { id: 16, weekKey: 'WK-2026-06-W3', store: 'in99银泰中心店', service: '头疗30分钟', time: '2026-06-16 14:00:00', amount: 60.0, originalPrice: 198, actualPayment: 198, type: 'referral', isRepeatCustomer: false },

  // WK-2026-06-W4 (6月22日-6月30日)
  { id: 17, weekKey: 'WK-2026-06-W4', store: 'in99银泰中心店', service: '中式推拿60分钟', time: '2026-06-28 19:30:00', amount: 198.0, originalPrice: 398, actualPayment: 376, type: 'piecework', isRepeatCustomer: false },
  { id: 18, weekKey: 'WK-2026-06-W4', store: 'in99银泰中心店', service: '整脊踩背40分钟', time: '2026-06-25 15:00:00', amount: 156.0, originalPrice: 398, actualPayment: 320, type: 'piecework', isRepeatCustomer: true, repeatCount: 1 },
  { id: 19, weekKey: 'WK-2026-06-W4', store: 'in99银泰中心店', service: '足疗40分钟', time: '2026-06-23 11:00:00', amount: 156.0, originalPrice: 328, actualPayment: 298, type: 'piecework', isRepeatCustomer: false },

  // WK-2026-05 (5月) - mock 订单
  { id: 20, weekKey: 'WK-2026-05-W1', store: 'in99银泰中心店', service: '中式推拿60分钟', time: '2026-05-06 14:00:00', amount: 198.0, originalPrice: 398, actualPayment: 376, type: 'piecework', isRepeatCustomer: false },
  { id: 21, weekKey: 'WK-2026-05-W1', store: 'in99银泰中心店', service: '整脊踩背40分钟', time: '2026-05-05 11:00:00', amount: 156.0, originalPrice: 398, actualPayment: 320, type: 'piecework', isRepeatCustomer: true, repeatCount: 1 },
  { id: 22, weekKey: 'WK-2026-05-W1', store: 'in99银泰中心店', service: '足疗40分钟', time: '2026-05-04 16:00:00', amount: 156.0, originalPrice: 328, actualPayment: 298, type: 'piecework', isRepeatCustomer: false },
  { id: 23, weekKey: 'WK-2026-05-W1', store: 'in99银泰中心店', service: '头疗30分钟', time: '2026-05-03 10:00:00', amount: 88.0, originalPrice: 198, actualPayment: 188, type: 'repeat', isRepeatCustomer: true, repeatCount: 1 },

  // WK-2026-07 (7月) - mock 订单
  { id: 24, weekKey: 'WK-2026-07-W1', store: 'in99银泰中心店', service: '脊柱调整60分钟', time: '2026-07-05 19:00:00', amount: 220.0, originalPrice: 498, actualPayment: 440, type: 'piecework', isRepeatCustomer: false },
  { id: 25, weekKey: 'WK-2026-07-W1', store: 'in99银泰中心店', service: '骨盆·调整60分钟', time: '2026-07-04 15:00:00', amount: 198.0, originalPrice: 498, actualPayment: 396, type: 'piecework', isRepeatCustomer: true, repeatCount: 3 },
  { id: 26, weekKey: 'WK-2026-07-W1', store: 'in99银泰中心店', service: '运动拉伸60分钟', time: '2026-07-03 11:00:00', amount: 110.0, originalPrice: 398, actualPayment: 360, type: 'repeat', isRepeatCustomer: true, repeatCount: 2 },
  { id: 27, weekKey: 'WK-2026-07-W2', store: 'in99银泰中心店', service: '足疗40分钟', time: '2026-07-12 14:00:00', amount: 156.0, originalPrice: 328, actualPayment: 298, type: 'piecework', isRepeatCustomer: false }
])

const sumBy = (arr, type) => arr.filter(o => o.type === type).reduce((s, o) => s + o.amount, 0)
const totalIncome = computed(() => allOrders.value.reduce((s, o) => s + o.amount, 0))
const totalExpense = ref(0)

const categoryTabs = computed(() => [
  { key: 'all', label: '全部', value: totalIncome.value, unit: '元' },
  { key: 'piecework', label: '基础提成', value: sumBy(allOrders.value, 'piecework'), unit: '元' },
  { key: 'referral', label: '内部介绍', value: 0, unit: '元', showEmpty: true },
  { key: 'repeat', label: '回头客奖励', value: sumBy(allOrders.value, 'repeat'), unit: '元' }
])

const filteredOrders = computed(() => {
  if (categoryFilter.value === 'all') return allOrders.value
  return allOrders.value.filter(o => o.type === categoryFilter.value)
})

const currentStats = computed(() => ({
  income: totalIncome.value,
  expense: totalExpense.value,
  incomeLabel: '今日收入',
  expenseLabel: '今日支出'
}))

const formatAmount = (val) => (typeof val === 'number' ? val.toFixed(2) : val)

const orderDetailVisible = ref(false)
const currentOrderDetail = ref(null)
const handleOpenOrder = (item) => {
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
const handleCloseDetail = () => { orderDetailVisible.value = false }
const handleAppeal = () => { ElMessage.success('已提交疑问，HR 将尽快处理'); handleCloseDetail() }
const copyOrderNo = () => {
  if (!currentOrderDetail.value) return
  navigator.clipboard?.writeText(currentOrderDetail.value.orderNo).then(() => ElMessage.success('订单编号已复制'))
}
const handleIncomeExplain = () => ElMessage.info('收入说明：本月预估收入基于已完成订单的计件提成、回头客奖励等汇总')
const handleExpenseClick = () => ElMessage.info('支出明细 - 跳转页面待实现')

// ==================== 预估收入：按周工资单 mock ====================
const strategy = {
  id: '1109493788878143491',
  name: '非全日制推拿师发放策略（没有常乐豆）',
  templateName: '非全日制推拿师模板'
}

// 工资单按月分组，每月 4 张周工资单
const weekBillsMap = {
  '2026-05': [
    {
      id: 'WK-2026-05-W1', name: '5月第1周', period: '5月1日 - 5月7日', status: '已发放',
      incomeItems: [
        { type: 'piecework', label: '基础提成', value: 1050.0 },
        { type: 'repeat', label: '回头客奖励', value: 88.0 }
      ],
      deductionItems: [
        { type: 'social', label: '代扣社保', value: -64.0 },
        { type: 'tax', label: '代扣个税', value: -28.0 }
      ]
    },
    {
      id: 'WK-2026-05-W2', name: '5月第2周', period: '5月8日 - 5月14日', status: '已发放',
      incomeItems: [
        { type: 'piecework', label: '基础提成', value: 880.0 }
      ],
      deductionItems: [
        { type: 'tax', label: '代扣个税', value: -22.0 }
      ]
    },
    {
      id: 'WK-2026-05-W3', name: '5月第3周', period: '5月15日 - 5月21日', status: '已发放',
      incomeItems: [
        { type: 'piecework', label: '基础提成', value: 920.0 },
        { type: 'repeat', label: '回头客奖励', value: 60.0 }
      ],
      deductionItems: [
        { type: 'social', label: '代扣社保', value: -46.0 }
      ]
    },
    {
      id: 'WK-2026-05-W4', name: '5月第4周', period: '5月22日 - 5月31日', status: '已发放',
      incomeItems: [
        { type: 'piecework', label: '基础提成', value: 760.0 }
      ],
      deductionItems: [
        { type: 'social', label: '代扣社保', value: -38.0 }
      ]
    }
  ],
  '2026-06': [
    {
      id: 'WK-2026-06-W1', name: '6月第1周', period: '6月1日 - 6月7日', status: '已发放',
      incomeItems: [
        { type: 'piecework', label: '基础提成', value: 1280.5 },
        { type: 'repeat', label: '回头客奖励', value: 156.0 }
      ],
      deductionItems: [
        { type: 'social', label: '代扣社保', value: -86.0 },
        { type: 'tax', label: '代扣个税', value: -42.3 }
      ]
    },
    {
      id: 'WK-2026-06-W2', name: '6月第2周', period: '6月8日 - 6月14日', status: '已发放',
      incomeItems: [
        { type: 'piecework', label: '基础提成', value: 956.2 }
      ],
      deductionItems: [
        { type: 'tax', label: '代扣个税', value: -28.5 }
      ]
    },
    {
      id: 'WK-2026-06-W3', name: '6月第3周', period: '6月15日 - 6月21日', status: '已发放',
      incomeItems: [
        { type: 'piecework', label: '基础提成', value: 1126.0 },
        { type: 'repeat', label: '回头客奖励', value: 89.4 },
        { type: 'referral', label: '内部介绍', value: 60.0 }
      ],
      deductionItems: [
        { type: 'complaint', label: '投诉扣款', value: -50.0 },
        { type: 'social', label: '代扣社保', value: -65.0 }
      ]
    },
    {
      id: 'WK-2026-06-W4', name: '6月第4周', period: '6月22日 - 6月30日', status: '待发放',
      incomeItems: [
        { type: 'piecework', label: '基础提成', value: 820.0 }
      ],
      deductionItems: [
        { type: 'social', label: '代扣社保', value: -41.0 }
      ]
    }
  ],
  '2026-07': [
    {
      id: 'WK-2026-07-W1', name: '7月第1周', period: '7月1日 - 7月7日', status: '已发放',
      incomeItems: [
        { type: 'piecework', label: '基础提成', value: 1180.0 },
        { type: 'repeat', label: '回头客奖励', value: 110.0 }
      ],
      deductionItems: [
        { type: 'social', label: '代扣社保', value: -75.0 },
        { type: 'tax', label: '代扣个税', value: -36.0 }
      ]
    },
    {
      id: 'WK-2026-07-W2', name: '7月第2周', period: '7月8日 - 7月14日', status: '已发放',
      incomeItems: [
        { type: 'piecework', label: '基础提成', value: 1020.0 }
      ],
      deductionItems: [
        { type: 'tax', label: '代扣个税', value: -30.0 }
      ]
    },
    {
      id: 'WK-2026-07-W3', name: '7月第3周', period: '7月15日 - 7月21日', status: '已发放',
      incomeItems: [
        { type: 'piecework', label: '基础提成', value: 1080.0 },
        { type: 'repeat', label: '回头客奖励', value: 78.0 }
      ],
      deductionItems: [
        { type: 'social', label: '代扣社保', value: -54.0 }
      ]
    },
    {
      id: 'WK-2026-07-W4', name: '7月第4周', period: '7月22日 - 7月31日', status: '待发放',
      incomeItems: [
        { type: 'piecework', label: '基础提成', value: 890.0 }
      ],
      deductionItems: [
        { type: 'social', label: '代扣社保', value: -44.0 }
      ]
    }
  ]
}

const selectedMonth = ref('2026-06')
const weekBills = computed(() => weekBillsMap[selectedMonth.value] || [])

const selectedBillIndex = ref(0)
const selectedBill = computed(() => weekBills.value[selectedBillIndex.value] || null)

const unitOf = () => '元'

// ==================== 收入明细弹层（按周+按薪酬类筛选） ====================
const incomeItemSheetVisible = ref(false)
const currentIncomeLabel = ref('')
const currentIncomeType = ref('')
const currentIncomeTypeName = ref('')

const incomeItemOrders = computed(() => {
  if (!selectedBill.value || !currentIncomeType.value) return []
  return allOrders.value.filter(o =>
    o.weekKey === selectedBill.value.id && o.type === currentIncomeType.value
  )
})

const handleIncomeItemClick = (item) => {
  currentIncomeLabel.value = item.label
  currentIncomeType.value = item.type
  currentIncomeTypeName.value = currentIncomeLabel.value
  incomeItemSheetVisible.value = true
}

const handleCloseIncomeItemSheet = () => {
  incomeItemSheetVisible.value = false
}

const handleOpenOrderFromIncome = (item) => {
  incomeItemSheetVisible.value = false
  handleOpenOrder(item)
}

const incomeItemSubtotal = computed(() => {
  return incomeItemOrders.value.reduce((s, o) => s + o.amount, 0)
})

// ==================== 到账情况（4 周） ====================
const arrivalWeeks = reactive([
  {
    title: '第一周(1号-7号)',
    unit: '元',
    items: [
      { label: '合计金额', value: 1436.5, isFinal: true },
      { label: '负工资抵扣', value: 0, isFinal: false },
      { label: '扣缴', value: 128.3, isFinal: false },
      { label: '应发金额', value: 1308.2, isFinal: true },
      { label: '实发金额', value: 1308.2, isFinal: true }
    ]
  },
  {
    title: '第二周(8号-14号)',
    unit: '元',
    items: [
      { label: '合计金额', value: 956.2, isFinal: true },
      { label: '负工资抵扣', value: 0, isFinal: false },
      { label: '扣缴', value: 28.5, isFinal: false },
      { label: '应发金额', value: 927.7, isFinal: true },
      { label: '实发金额', value: 927.7, isFinal: true }
    ]
  },
  {
    title: '第三周(15号-21号)',
    unit: '元',
    items: [
      { label: '合计金额', value: 1275.4, isFinal: true },
      { label: '负工资抵扣', value: 0, isFinal: false },
      { label: '扣缴', value: 115.0, isFinal: false },
      { label: '应发金额', value: 1160.4, isFinal: true },
      { label: '实发金额', value: 0, isFinal: true }
    ]
  },
  {
    title: '第四周(22号-月底)',
    unit: '元',
    items: [
      { label: '合计金额', value: 820.0, isFinal: true },
      { label: '负工资抵扣', value: 0, isFinal: false },
      { label: '扣缴', value: 41.0, isFinal: false },
      { label: '应发金额', value: 779.0, isFinal: true },
      { label: '实发金额', value: 0, isFinal: true }
    ]
  }
])

// ==================== 日期选择（月切换 sheet） ====================
const showMonthSheet = ref(false)
const availableMonths = computed(() => Object.keys(weekBillsMap).sort())
const formatMonthLabel = (ym) => {
  const [y, m] = ym.split('-')
  return `${y.slice(2)}年${m}月`
}

const currentDateLabel = computed(() => {
  if (activeTab.value === 'day') return '26年06月05日'
  if (activeTab.value === 'estimate') return formatMonthLabel(selectedMonth.value)
  if (activeTab.value === 'arrival') return '26年06月'
  return ''
})

const handleDatePicker = () => {
  if (activeTab.value === 'estimate') {
    showMonthSheet.value = true
  } else {
    ElMessage.info('日期选择器 - 当前为 mock 数据')
  }
}

const handleMonthSelect = (ym) => {
  selectedMonth.value = ym
  selectedBillIndex.value = 0
  showMonthSheet.value = false
  ElMessage.success(`已切换到：${formatMonthLabel(ym)}`)
}

// 切换月份时重置选中周
watch(selectedMonth, () => {
  selectedBillIndex.value = 0
})

// ==================== 数据截止与下次刷新时间 ====================
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
  if (window.history.length > 1) router.back()
  else router.push('/mobile-menu')
}
</script>

<style scoped>
.mobile-pt-dashboard-2 {
  min-height: 100vh;
  background: #f5f5f5;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.tab-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 12px;
}

/* ========== 顶部导航 ========== */
.top-nav {
  background: linear-gradient(135deg, #a40035 0%, #7a0026 100%);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  position: relative;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  flex: 1;
  text-align: center;
}

.nav-actions {
  display: flex;
  align-items: center;
  position: absolute;
  right: 8px;
  top: 8px;
  gap: 4px;
}

.nav-actions :deep(.el-button) {
  margin-left: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 4px 8px;
  min-height: 28px;
}

/* ========== 门店切换 ========== */
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
  display: flex;
  align-items: center;
  background: white;
  padding: 0 16px;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tab-item {
  padding: 14px 0;
  margin-right: 28px;
  font-size: 15px;
  color: #333;
  position: relative;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.tab-item.active {
  color: #a40035;
  font-weight: 600;
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
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 14px 0;
}

.date-arrow { font-size: 12px; }

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

.tip-icon { font-size: 14px; color: #faad14; flex-shrink: 0; }
.tip-content { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.tip-row { line-height: 1.4; }
.tip-row-main { font-size: 12px; font-weight: 500; }
.tip-time { font-weight: 600; font-variant-numeric: tabular-nums; color: #a40035; margin: 0 2px; }
.tip-divider { color: #d4b75e; margin: 0 6px; }
.tip-row-sub { font-size: 11px; opacity: 0.85; }

/* ========== 日统计（原非全日制风格） ========== */
.stats-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
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

.stats-cell { flex: 1; text-align: center; }
.stats-cell.left { border-right: 1px solid #f0f0f0; }

.stats-amount {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 6px;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}

.income-amount { color: #a40035; }
.expense-amount { color: #333; }
.income-arrow { font-size: 16px; color: #a40035; }
.expense-arrow { font-size: 14px; color: #999; margin-left: 2px; }
.stats-label { font-size: 13px; color: #999; display: flex; align-items: center; justify-content: center; gap: 2px; }

.category-tabs {
  display: flex;
  gap: 16px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.category-tabs::-webkit-scrollbar { display: none; }

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

.category-tab.active { color: #a40035; font-weight: 600; }

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

.cat-value { font-weight: 500; }
.cat-num { color: inherit; font-weight: 600; }
.cat-unit { color: #999; font-weight: normal; font-size: 12px; }
.cat-value-empty { color: #999; font-size: 12px; }

/* ========== 订单列表 ========== */
.order-list { padding: 0 12px 20px; }

.order-item {
  background: white;
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  cursor: pointer;
}

.order-row1 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.order-store { font-size: 15px; font-weight: 600; color: #333; }
.order-title-group { display: flex; align-items: center; min-width: 0; flex: 1; overflow: hidden; }
.order-amount { font-size: 14px; color: #a40035; font-weight: 600; }
.order-row2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.order-service { font-size: 13px; color: #999; }
.order-chevron { color: #ccc; font-size: 14px; }
.order-row3 { display: flex; justify-content: space-between; align-items: center; }
.order-time { font-size: 12px; color: #ccc; }
.empty-tip { text-align: center; padding: 40px 0; color: #ccc; font-size: 13px; }

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

/* ========== 预估收入（按周） ========== */
.month-content { padding: 12px; }

/* 收入分类切换器 */
.bills-switcher { margin-bottom: 12px; }

.bills-switcher-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 0 4px 8px;
}

.bills-switcher-title { font-size: 14px; font-weight: 600; color: #333; }
.bills-switcher-count { font-size: 12px; color: #999; }

.bill-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 0 0 4px;
}

.bill-tabs::-webkit-scrollbar { display: none; }

.bill-tab {
  flex-shrink: 0;
  padding: 8px 14px;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;
}

.bill-tab.active { background: #fff5f8; border-color: #a40035; }
.bill-tab-name { font-size: 13px; font-weight: 600; color: #333; white-space: nowrap; }
.bill-tab.active .bill-tab-name { color: #a40035; }
.bill-tab-period { font-size: 11px; color: #999; white-space: nowrap; margin-top: 1px; }
.bill-tab.active .bill-tab-period { color: #a40035; }

/* 汇总/支出卡（与全职2 一致） */
.month-section-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.month-category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px 8px;
}

.month-cat-item {
  text-align: left;
  cursor: pointer;
  padding: 8px 4px;
}

.month-cat-value {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.month-cat-item.negative .month-cat-value { color: #a40035; }

.month-cat-unit {
  font-size: 11px;
  color: #999;
  font-weight: normal;
  margin-left: 2px;
}

.month-cat-label {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 2px;
}

.cat-chevron { font-size: 10px; color: #ccc; }

/* ========== 到账情况（按周） ========== */
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

.arrival-unit { font-size: 12px; color: #999; font-weight: normal; margin-left: 4px; }

.arrival-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px 8px;
}

.arrival-item { text-align: left; cursor: pointer; }
.arrival-amount { font-size: 18px; font-weight: 700; color: #333; margin-bottom: 4px; }
.arrival-item.is-final .arrival-amount { font-weight: 800; }
.arrival-item.is-negative .arrival-amount { color: #a40035; }
.arrival-label { font-size: 12px; color: #999; display: flex; align-items: center; gap: 2px; }

/* ========== 订单详情弹层 ========== */
.order-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
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
  padding-bottom: env(safe-area-inset-bottom);
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
  padding: 4px 12px 12px;
  flex-shrink: 0;
}

.modal-title { font-size: 16px; font-weight: 600; color: #333; flex: 1; text-align: center; }
.modal-close { color: #999; padding: 4px; }

.order-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px 12px;
  -webkit-overflow-scrolling: touch;
}

.order-modal-fade-enter-active, .order-modal-fade-leave-active { transition: opacity 0.25s ease; }
.order-modal-fade-enter-from, .order-modal-fade-leave-to { opacity: 0; }

.order-modal-slide-enter-active, .order-modal-slide-leave-active { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.order-modal-slide-enter-from, .order-modal-slide-leave-to { transform: translateY(100%); }

.detail-summary-card {
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
}

.summary-row1 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  gap: 8px;
}

.summary-store {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-size: 13px;
  color: #333;
}

.store-name { font-weight: 600; flex-shrink: 0; }

.customer-phone, .customer-info {
  color: #999;
  font-weight: normal;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.summary-divider { color: #ddd; margin: 0 6px; font-weight: normal; flex-shrink: 0; }
.summary-time { font-size: 12px; color: #999; margin-bottom: 4px; }

.summary-service-row { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
.summary-service { font-size: 14px; color: #333; font-weight: 500; margin-bottom: 0; }

.summary-orderno {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
  gap: 4px;
}

.orderno-text { flex: 1; word-break: break-all; line-height: 1.4; }
.copy-btn { color: #a40035; padding: 0 4px; flex-shrink: 0; }

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

.formula-op { color: #999; font-weight: 500; }
.formula-discount { color: #999; font-weight: 500; }

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

.payment-label { font-size: 12px; color: #999; }
.payment-actual { font-size: 20px; font-weight: 700; color: #a40035; }
.payment-original { font-size: 14px; color: #999; font-weight: 500; }

.detail-section-card {
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
}

.section-title-line {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.title-bar {
  display: inline-block;
  width: 3px;
  height: 12px;
  background: #a40035;
  border-radius: 2px;
}

.section-content { display: flex; flex-direction: column; gap: 4px; }

.content-line {
  font-size: 13px;
  color: #666;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.content-label { color: #666; flex: 1; }
.content-value { font-weight: 600; color: #333; font-size: 14px; white-space: nowrap; }
.repeat-value { color: #a40035; font-weight: 700; }
.value-unit { font-size: 12px; color: #999; font-weight: normal; margin-left: 1px; }

.order-modal-footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  color: #999;
  cursor: pointer;
  padding: 12px 16px;
  background: white;
  border-top: 1px solid #f0f0f0;
}

.order-modal-footer:hover { color: #a40035; }
.footer-icon { font-size: 14px; }

/* ========== 门店选择 Sheet ========== */
.store-sheet { max-height: 70vh; }
.store-sheet-body { padding: 4px 12px 16px; }

.store-sheet-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 8px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background 0.15s;
  border-radius: 6px;
  position: relative;
}

.store-sheet-item:last-child { border-bottom: none; }
.store-sheet-item:active { background: #fafafa; }
.store-sheet-item.active { background: #fff5f8; }

.store-sheet-rank {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #f0f0f0;
  color: #999;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.store-sheet-item.active .store-sheet-rank { background: #a40035; color: white; }

.store-sheet-info { flex: 1; min-width: 0; }

.store-sheet-label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin-bottom: 2px;
}

.store-sheet-item.active .store-sheet-label { color: #a40035; font-weight: 600; }
.store-sheet-daily { font-size: 11px; color: #999; }

.store-sheet-amount { text-align: right; flex-shrink: 0; }
.store-sheet-amount .amount-label { font-size: 10px; color: #999; margin-bottom: 2px; }
.store-sheet-amount .amount-value { font-size: 15px; font-weight: 700; color: #a40035; }

.store-sheet-check {
  color: #a40035;
  font-size: 18px;
  flex-shrink: 0;
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
}

/* ========== 收入明细弹层 ========== */
.income-item-sheet {
  max-height: 85vh;
}

.income-item-sheet-body {
  padding: 0 12px 12px;
}

.income-item-subtotal {
  font-size: 13px;
  color: #666;
  padding: 8px 4px 12px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 4px;
}

.income-item-subtotal .subtotal-value {
  color: #a40035;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  margin-left: 2px;
}

.income-orders-list {
  padding: 0;
}

.income-orders-list .order-item {
  margin-bottom: 8px;
}

/* ========== 周选择 Sheet ========== */
.month-sheet { max-height: 70vh; }

.month-sheet-body { padding: 0 0 12px; }

.month-sheet-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  position: relative;
}

.month-sheet-item:last-child { border-bottom: none; }
.month-sheet-item:active { background: #fafafa; }
.month-sheet-item.active { background: #fff5f8; }

.month-sheet-label {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.month-sheet-item.active .month-sheet-label { color: #a40035; }

.month-sheet-count {
  font-size: 12px;
  color: #999;
  margin-right: 24px;
}

.month-sheet-check {
  color: #a40035;
  font-size: 18px;
  flex-shrink: 0;
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
}
</style>