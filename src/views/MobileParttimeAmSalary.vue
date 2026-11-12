<template>
  <div class="pt-am-salary">
    <!-- 顶部导航 -->
    <div class="top-nav">
      <el-button type="text" @click="goBack" style="color: white;">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <div class="nav-title">我的薪酬</div>
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
              {{ formatAmount(todayIncome) }}
              <el-icon class="income-arrow"><ArrowDown /></el-icon>
            </div>
            <div class="stats-label">今日收入</div>
          </div>
          <div class="stats-cell right">
            <div class="stats-amount expense-amount">{{ formatAmount(0) }}</div>
            <div class="stats-label">今日支出</div>
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
            <span class="cat-value">
              <span class="cat-num">{{ cat.value.toFixed(2) }}</span>
              <span class="cat-unit">({{ cat.unit }})</span>
            </span>
          </div>
        </div>
      </div>

      <!-- 接待记录列表 -->
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
              <span class="repeat-tag inline">{{ item.isNew ? '新客' : '回头客' }}</span>
              <span v-if="item.hasReview" class="repeat-tag inline">已评价</span>
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
        <div v-if="filteredOrders.length === 0" class="empty-tip">暂无接待记录</div>
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

      <!-- 预估支出 = 当前选中周工资单的扣缴项（非全不缴社保、公积金） -->
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

    <!-- ==================== 到账情况（按周） ==================== -->
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
            <div class="arrival-label">{{ item.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 接待详情弹层 ==================== -->
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
                <span class="modal-title">接待收入</span>
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
                  <div class="summary-time">{{ currentOrderDetail.time }}</div>
                  <div class="summary-service-row">
                    <span class="summary-service">{{ currentOrderDetail.service }}</span>
                    <span class="repeat-tag inline">{{ currentOrderDetail.isNew ? '新客' : '回头客' }}</span>
                  </div>
                  <div class="summary-orderno">
                    <span class="orderno-text">接待编号：{{ currentOrderDetail.orderNo }}</span>
                    <el-button type="text" size="small" @click.stop="copyOrderNo" class="copy-btn">
                      <el-icon :size="14"><CopyDocument /></el-icon>
                    </el-button>
                  </div>
                </div>

                <div class="detail-section-card">
                  <div class="section-title-line">
                    <span class="title-bar"></span>
                    <span class="title-text">接待提成</span>
                  </div>
                  <div class="section-content">
                    <div class="content-line">
                      <span class="content-label">客次提成（5.00 元/次）</span>
                      <span class="content-value">5.00<span class="value-unit"> 元</span></span>
                    </div>
                    <div v-if="currentOrderDetail.isNew" class="content-line">
                      <span class="content-label">新客提成（2.00 元/人）</span>
                      <span class="content-value">2.00<span class="value-unit"> 元</span></span>
                    </div>
                    <div v-if="currentOrderDetail.hasReview" class="content-line">
                      <span class="content-label">评价提成（6.00 元/条）</span>
                      <span class="content-value repeat-value">6.00<span class="value-unit"> 元</span></span>
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
                    共 {{ (weekBillsMap[selectedStore][ym] || []).length }} 张工资单
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
                  v-for="(storeItem, idx) in storeSheetList"
                  :key="storeItem.key"
                  class="store-sheet-item"
                  :class="{ active: selectedStore === storeItem.key }"
                  @click="handleStoreSelect(storeItem.key)"
                >
                  <div class="store-sheet-rank">{{ idx + 1 }}</div>
                  <div class="store-sheet-info">
                    <div class="store-sheet-label">{{ storeItem.label }}</div>
                    <div class="store-sheet-daily">本期进行中：{{ storeItem.weekLabel }}</div>
                  </div>
                  <div class="store-sheet-amount">
                    <div class="amount-label">本期预估收入</div>
                    <div class="amount-value">¥{{ formatAmount(storeItem.total) }}</div>
                  </div>
                  <el-icon v-if="selectedStore === storeItem.key" class="store-sheet-check"><Check /></el-icon>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </transition>
    </teleport>

    <!-- ==================== 收入明细弹层（按周 + 按薪酬项筛选） ==================== -->
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
                <template v-if="currentIncomeType === 'base'">
                  <p class="base-note">保底金额 = 打卡有效工时 × 保底时薪（时薪按「通用 → 城市 → 门店差异额」解析）；当周收入合计不足保底时按差额补足，足额时补差为 0。</p>
                </template>
                <template v-else-if="currentIncomeType === 'incentive'">
                  <p class="base-note">接待激励按本期接待次数计（示例 1 元/次，待业务确认）；不计入保底比较，不挂接待明细。</p>
                </template>
                <template v-else-if="currentIncomeType === 'allowance'">
                  <p class="base-note">津贴按结算周固定计发，不与工时、单量挂钩；不计入保底比较。</p>
                </template>
                <template v-else-if="currentIncomeType === 'room' || currentIncomeType === 'toilet' || currentIncomeType === 'leaveClean'">
                  <p class="base-note">卫生打扫费按当班打扫次数计，不挂接待记录。</p>
                </template>
                <template v-else>
                  <div v-if="incomeItemOrders.length > 0" class="income-item-subtotal">
                    合计 {{ incomeItemOrders.length }} 笔，共
                    <span class="subtotal-value">{{ formatAmount(incomeItemSubtotal) }} 元</span>
                  </div>
                  <div v-if="incomeItemOrders.length > 0" class="order-list income-orders-list">
                    <div v-for="item in incomeItemOrders" :key="item.id" class="order-item" @click="handleOpenOrderFromIncome(item)">
                      <div class="order-row1">
                        <div class="order-title-group">
                          <span class="order-store">{{ item.store }}</span>
                          <span class="repeat-tag inline">{{ item.isNew ? '新客' : '回头客' }}</span>
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
                  <div v-else class="empty-tip">该周暂无该类记录</div>
                </template>
              </div>
            </div>
          </transition>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
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

/** 客户经理薪酬项单价（客次 / 新客 / 评价与 6.7 单价配置同口径；卫生三项按门店固定标准）。 */
const PRICES = { visit: 5, newCustomer: 2, review: 6, room: 8, toilet: 5, leaveClean: 6 }
/** 接待激励：按接待次数计（示例 1 元 / 次，待业务确认）；不计入保底比较。 */
const INCENTIVE_PER_VISIT = 1
/** 津贴：按结算周固定计发，不与工时、单量挂钩；不计入保底比较。 */
const WEEKLY_ALLOWANCE = 50
/** 保底时薪（元 / 小时，与 6.7.3 保底配置同口径：通用 25 → 成都 28 → 门店差异额）。 */
const GUARANTEE_HOURLY = { xinglonghu: 30, lushan: 29 }

// ==================== 门店 + 按月分组的周工资单 ====================
const weekBillsMap = {
  xinglonghu: {
    '2026-11': [
      {
        id: 'WK-2026-11-W1', name: '11月第1周', period: '11月1日 - 11月7日', status: '进行中', payAt: '11月16日', calcAt: '11月9日',
        counts: { visit: 45, newCustomer: 6, review: 40, room: 10, toilet: 6, leaveClean: 5 },
        hours: 22, tax: 0, allowance: 50
      }
    ],
    '2026-10': [
      {
        id: 'WK-2026-10-W1', name: '10月第1周', period: '10月1日 - 10月7日', status: '已发放', payAt: '10月16日',
        counts: { visit: 48, newCustomer: 7, review: 36, room: 9, toilet: 9, leaveClean: 6 },
        hours: 21.5, tax: 8.4, allowance: 50
      },
      {
        id: 'WK-2026-10-W2', name: '10月第2周', period: '10月8日 - 10月14日', status: '已发放', payAt: '10月23日',
        counts: { visit: 52, newCustomer: 9, review: 44, room: 12, toilet: 8, leaveClean: 6 },
        hours: 20, tax: 9.6, allowance: 50, complaintDeduct: 50
      },
      {
        id: 'WK-2026-10-W3', name: '10月第3周', period: '10月15日 - 10月21日', status: '已发放', payAt: '11月2日',
        counts: { visit: 40, newCustomer: 5, review: 32, room: 9, toilet: 5, leaveClean: 4 },
        hours: 21.5, tax: 6.2, allowance: 50, cleanDeduct: 20
      },
      {
        id: 'WK-2026-10-W4', name: '10月第4周', period: '10月22日 - 10月31日', status: '待发放', payAt: '11月9日',
        counts: { visit: 58, newCustomer: 10, review: 48, room: 13, toilet: 9, leaveClean: 7 },
        hours: 20, tax: 11.8, allowance: 50
      }
    ]
  },
  lushan: {
    '2026-11': [
      {
        id: 'WK-2026-11-L1', name: '11月第1周', period: '11月1日 - 11月7日', status: '进行中', payAt: '11月16日', calcAt: '11月9日',
        counts: { visit: 14, newCustomer: 2, review: 12, room: 4, toilet: 2, leaveClean: 2 },
        hours: 8, tax: 0, allowance: 50
      }
    ],
    '2026-10': [
      {
        id: 'WK-2026-10-L3', name: '10月第3周', period: '10月15日 - 10月21日', status: '已发放', payAt: '11月2日',
        counts: { visit: 19, newCustomer: 3, review: 16, room: 5, toilet: 3, leaveClean: 2 },
        hours: 8, tax: 2.4, allowance: 50
      },
      {
        id: 'WK-2026-10-L4', name: '10月第4周', period: '10月22日 - 10月31日', status: '待发放', payAt: '11月9日',
        counts: { visit: 22, newCustomer: 4, review: 18, room: 6, toilet: 3, leaveClean: 3 },
        hours: 11, tax: 3.1, allowance: 50
      }
    ]
  }
}

const STORE_LABELS = { xinglonghu: '兴隆湖店', lushan: '麓山店' }
const selectedStore = ref('xinglonghu')
const currentStoreLabel = computed(() => STORE_LABELS[selectedStore.value])

/** 某周薪酬项金额：六项提成（卫生三项分列）+ 接待激励 + 津贴 + 保底补差，项序与工资单一致。
 * 保底金额 = 打卡有效工时 × 保底时薪；保底只与六项提成合计比较（接待激励、津贴不参与），不足时补差额，足额时补差为 0。 */
const incomeItemsOf = (bill, rate) => {
  const base = bill.hours * rate
  const commission = bill.counts.visit * PRICES.visit + bill.counts.newCustomer * PRICES.newCustomer + bill.counts.review * PRICES.review
    + bill.counts.room * PRICES.room + bill.counts.toilet * PRICES.toilet + bill.counts.leaveClean * PRICES.leaveClean
  return [
  { type: 'visit', label: '客次提成', value: bill.counts.visit * PRICES.visit },
  { type: 'newCustomer', label: '新客提成', value: bill.counts.newCustomer * PRICES.newCustomer },
  { type: 'review', label: '评价提成', value: bill.counts.review * PRICES.review },
  { type: 'incentive', label: '接待激励', value: bill.counts.visit * INCENTIVE_PER_VISIT },
  { type: 'room', label: '房间卫生打扫费', value: bill.counts.room * PRICES.room },
  { type: 'toilet', label: '厕所卫生费', value: bill.counts.toilet * PRICES.toilet },
  { type: 'leaveClean', label: '离店卫生打扫', value: bill.counts.leaveClean * PRICES.leaveClean },
  { type: 'allowance', label: '津贴', value: bill.allowance || 0 },
  { type: 'base', label: '保底补差', value: Math.max(0, Math.round((base - commission) * 100) / 100) }
  ]
}
/** 周单在自然月里的第几周（从名称取，如「10月第4周」→ 4）。 */
const weekOrdinalOf = (bill) => Number((bill.name.match(/第(\d+)周/) || [])[1] || 1)
/**
 * 非全扣缴只有个税，没有社保、公积金；扣款另列投诉与卫生打扫扣款。
 * 自然月前 3 周是「预扣个税」，第 4 周（22 日–月末）才是真正的「代扣个税」。
 */
const deductionItemsOf = (bill) => {
  const items = []
  if (bill.complaintDeduct) items.push({ type: 'complaint', label: '投诉扣款', value: -bill.complaintDeduct })
  if (bill.cleanDeduct) items.push({ type: 'cleanDeduct', label: '卫生打扫扣款', value: -bill.cleanDeduct })
  if (bill.tax > 0) items.push({ type: 'tax', label: weekOrdinalOf(bill) >= 4 ? '代扣个税' : '预扣个税', value: -bill.tax })
  return items
}
const totalOf = (bill, rate) => incomeItemsOf(bill, rate).reduce((s, item) => s + item.value, 0)

// ==================== 预估收入：按周工资单 ====================
const selectedMonth = ref('2026-11')
/** 周单带出薪酬项与扣缴项，模板直接读。 */
const weekBills = computed(() => (weekBillsMap[selectedStore.value][selectedMonth.value] || [])
  .map(bill => ({ ...bill, incomeItems: incomeItemsOf(bill, GUARANTEE_HOURLY[selectedStore.value]), deductionItems: deductionItemsOf(bill) })))
const selectedBillIndex = ref(0)
const selectedBill = computed(() => weekBills.value[selectedBillIndex.value] || null)
const unitOf = () => '元'

watch([selectedStore, selectedMonth], () => { selectedBillIndex.value = 0 })

// ==================== 日统计：接待记录（mock，挂在周工资单上） ====================
const amountFor = (order) => PRICES.visit + (order.isNew ? PRICES.newCustomer : 0) + (order.hasReview ? PRICES.review : 0)
const allOrders = ref([
  // 兴隆湖店 · 11月第1周
  { id: 1, weekKey: 'WK-2026-11-W1', store: '兴隆湖店', service: '产品体验接待', time: '2026-11-05 14:20', isNew: true, hasReview: true },
  { id: 2, weekKey: 'WK-2026-11-W1', store: '兴隆湖店', service: '到店咨询接待', time: '2026-11-05 11:04', isNew: false, hasReview: true },
  { id: 3, weekKey: 'WK-2026-11-W1', store: '兴隆湖店', service: '产品体验接待', time: '2026-11-05 10:15', isNew: true, hasReview: false },
  { id: 4, weekKey: 'WK-2026-11-W1', store: '兴隆湖店', service: '会员办理接待', time: '2026-11-04 17:50', isNew: false, hasReview: false },
  { id: 5, weekKey: 'WK-2026-11-W1', store: '兴隆湖店', service: '到店咨询接待', time: '2026-11-04 13:20', isNew: false, hasReview: true },
  { id: 6, weekKey: 'WK-2026-11-W1', store: '兴隆湖店', service: '产品体验接待', time: '2026-11-03 15:40', isNew: true, hasReview: true },
  { id: 7, weekKey: 'WK-2026-11-W1', store: '兴隆湖店', service: '会员办理接待', time: '2026-11-03 12:09', isNew: false, hasReview: false },
  // 麓山店 · 11月第1周
  { id: 8, weekKey: 'WK-2026-11-L1', store: '麓山店', service: '到店咨询接待', time: '2026-11-04 14:30', isNew: true, hasReview: false },
  { id: 9, weekKey: 'WK-2026-11-L1', store: '麓山店', service: '产品体验接待', time: '2026-11-03 16:25', isNew: false, hasReview: true },
  // 10月样本
  { id: 10, weekKey: 'WK-2026-10-W4', store: '兴隆湖店', service: '产品体验接待', time: '2026-10-28 19:30', isNew: false, hasReview: true },
  { id: 11, weekKey: 'WK-2026-10-W4', store: '兴隆湖店', service: '到店咨询接待', time: '2026-10-26 11:00', isNew: true, hasReview: false },
  { id: 12, weekKey: 'WK-2026-10-L4', store: '麓山店', service: '会员办理接待', time: '2026-10-25 15:00', isNew: false, hasReview: true }
])
allOrders.value.forEach(order => { order.amount = amountFor(order) })

const storeOrders = computed(() => allOrders.value.filter(order => order.store === currentStoreLabel.value))

const todayIncome = computed(() => {
  const today = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const todayKey = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
  return storeOrders.value.filter(order => order.time.startsWith(todayKey)).reduce((s, order) => s + order.amount, 0)
})

/** 本周卫生类合计（日统计分类页签的值；卫生不挂单）。 */
const currentWeekClean = computed(() => {
  const current = weekBillsMap[selectedStore.value]['2026-11'][0]
  return current.counts.room * PRICES.room + current.counts.toilet * PRICES.toilet + current.counts.leaveClean * PRICES.leaveClean
})

const categoryFilter = ref('all')
const categoryTabs = computed(() => [
  { key: 'all', label: '全部', value: todayIncome.value, unit: '元' },
  { key: 'visit', label: '客次', value: storeOrders.value.length * PRICES.visit, unit: '元' },
  { key: 'newCustomer', label: '新客', value: storeOrders.value.filter(order => order.isNew).length * PRICES.newCustomer, unit: '元' },
  { key: 'review', label: '评价', value: storeOrders.value.filter(order => order.hasReview).length * PRICES.review, unit: '元' },
  { key: 'clean', label: '卫生', value: currentWeekClean.value, unit: '元' }
])

const filteredOrders = computed(() => {
  if (categoryFilter.value === 'all') return storeOrders.value
  if (categoryFilter.value === 'clean') return []
  if (categoryFilter.value === 'visit') return storeOrders.value
  if (categoryFilter.value === 'newCustomer') return storeOrders.value.filter(order => order.isNew)
  return storeOrders.value.filter(order => order.hasReview)
})

const formatAmount = (val) => (typeof val === 'number' ? val.toFixed(2) : val)

// ==================== 接待详情弹层 ====================
const orderDetailVisible = ref(false)
const currentOrderDetail = ref(null)
const handleOpenOrder = (item) => {
  currentOrderDetail.value = {
    storeName: item.store,
    service: item.service,
    customerPhone: '138****8888',
    customerInfo: '女 / 28岁',
    status: item.isNew ? '新客接待' : '回头客接待',
    time: item.time,
    orderNo: 'JD2026110' + String(item.id).padStart(3, '0'),
    isNew: item.isNew,
    hasReview: item.hasReview
  }
  orderDetailVisible.value = true
}
const handleCloseDetail = () => { orderDetailVisible.value = false }
const handleAppeal = () => { ElMessage.success('已提交疑问，HR 将尽快处理'); handleCloseDetail() }
const copyOrderNo = () => {
  if (!currentOrderDetail.value) return
  navigator.clipboard?.writeText(currentOrderDetail.value.orderNo).then(() => ElMessage.success('接待编号已复制'))
}
const handleIncomeExplain = () => ElMessage.info('收入说明：保底补差 = max(0, 打卡有效工时 × 保底时薪 − 六项提成合计)，接待激励与津贴不计入保底比较；预估收入 = 客次 / 新客 / 评价提成 + 接待激励 + 三项卫生 + 津贴 + 保底补差，投诉 / 卫生打扫扣款与个税在支出侧，按结算周以实发为准')

// ==================== 收入明细弹层（按周 + 按薪酬项筛选） ====================
const incomeItemSheetVisible = ref(false)
const currentIncomeLabel = ref('')
const currentIncomeType = ref('')

const incomeItemOrders = computed(() => {
  if (!selectedBill.value || !currentIncomeType.value) return []
  const weekOrders = storeOrders.value.filter(order => order.weekKey === selectedBill.value.id)
  if (currentIncomeType.value === 'visit') return weekOrders
  if (currentIncomeType.value === 'newCustomer') return weekOrders.filter(order => order.isNew)
  if (currentIncomeType.value === 'review') return weekOrders.filter(order => order.hasReview)
  return []
})

const handleIncomeItemClick = (item) => {
  currentIncomeLabel.value = item.label
  currentIncomeType.value = item.type
  incomeItemSheetVisible.value = true
}
const handleCloseIncomeItemSheet = () => { incomeItemSheetVisible.value = false }
const handleOpenOrderFromIncome = (item) => {
  incomeItemSheetVisible.value = false
  handleOpenOrder(item)
}
const incomeItemSubtotal = computed(() => incomeItemOrders.value.reduce((s, order) => s + order.amount, 0))

// ==================== 到账情况（按周：合计 / 负工资抵扣 / 扣款 / 个税 / 应发 / 实发） ====================
const arrivalWeeks = computed(() => weekBills.value.map((bill) => {
  const total = totalOf(bill, GUARANTEE_HOURLY[selectedStore.value])
  const deduct = (bill.complaintDeduct || 0) + (bill.cleanDeduct || 0)
  const net = total - deduct - bill.tax
  const paid = bill.status === '已发放'
  return {
    title: `${bill.name}（${bill.period}）`,
    unit: '元',
    items: [
      { label: '合计金额', value: total, isFinal: true },
      { label: '负工资抵扣', value: 0, isFinal: false },
      { label: '扣款（投诉 · 卫生打扫）', value: deduct, isFinal: false },
      { label: '个税（预扣 / 代扣）', value: bill.tax, isFinal: false },
      { label: '应发金额', value: net, isFinal: true },
      { label: '实发金额', value: paid ? net : 0, isFinal: true }
    ]
  }
}))

// ==================== 门店切换 Sheet ====================
const showStoreSheet = ref(false)
const storeSheetList = computed(() => Object.keys(weekBillsMap).map((key) => {
  const current = weekBillsMap[key]['2026-11'][0]
  return {
    key,
    label: STORE_LABELS[key],
    weekLabel: current.name,
    total: totalOf(current, GUARANTEE_HOURLY[key])
  }
}))
const handleStoreSelect = (key) => {
  selectedStore.value = key
  showStoreSheet.value = false
  ElMessage.success(`已切换到：${STORE_LABELS[key]}`)
}

// ==================== 日期选择（月切换 sheet） ====================
const showMonthSheet = ref(false)
const availableMonths = computed(() => Object.keys(weekBillsMap[selectedStore.value]).sort())
const formatMonthLabel = (ym) => {
  const [y, m] = ym.split('-')
  return `${y.slice(2)}年${m}月`
}

const currentDateLabel = computed(() => {
  if (activeTab.value === 'day') return '26年11月05日'
  return formatMonthLabel(selectedMonth.value)
})

const handleDatePicker = () => {
  if (activeTab.value === 'day') return
  showMonthSheet.value = true
}

const handleMonthSelect = (ym) => {
  selectedMonth.value = ym
  selectedBillIndex.value = 0
  showMonthSheet.value = false
  ElMessage.success(`已切换到：${formatMonthLabel(ym)}`)
}

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
.pt-am-salary {
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

.store-icon { color: #a40035; font-size: 16px; flex-shrink: 0; }
.store-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.store-arrow { color: #999; font-size: 14px; flex-shrink: 0; }

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

.tab-item.active { color: #a40035; font-weight: 600; }

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

/* ========== 日统计 ========== */
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
.stats-label { font-size: 13px; color: #999; display: flex; align-items: center; justify-content: center; gap: 2px; }

.category-tabs {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  border-bottom: 1px solid #f0f0f0;
}

.category-tab {
  padding: 8px 0 10px;
  font-size: 12.5px;
  color: #666;
  position: relative;
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
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
.cat-unit { color: #999; font-weight: normal; font-size: 11px; }

/* ========== 接待记录列表 ========== */
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
.order-title-group { display: flex; align-items: center; gap: 6px; min-width: 0; flex: 1; overflow: hidden; }
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
  grid-template-columns: repeat(3, 1fr);
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
  margin: 0 0 12px;
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

.arrival-item { text-align: left; }
.arrival-amount { font-size: 18px; font-weight: 700; color: #333; margin-bottom: 4px; }
.arrival-item.is-final .arrival-amount { font-weight: 800; }
.arrival-item.is-negative .arrival-amount { color: #a40035; }
.arrival-label { font-size: 12px; color: #999; }

/* ========== 弹层通用 ========== */
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
.summary-service { font-size: 14px; color: #333; font-weight: 500; }

.summary-orderno {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #999;
  gap: 4px;
}

.orderno-text { flex: 1; word-break: break-all; line-height: 1.4; }
.copy-btn { color: #a40035; padding: 0 4px; flex-shrink: 0; }

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
.income-item-sheet { max-height: 85vh; }

.income-item-sheet-body { padding: 0 12px 12px; }

.base-note {
  margin: 12px 4px;
  font-size: 13px;
  color: #666;
  line-height: 1.8;
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

.income-orders-list { padding: 0; }
.income-orders-list .order-item { margin-bottom: 8px; }

/* ========== 月选择 Sheet ========== */
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
