<template>
  <div class="mobile-salary-dashboard-2">
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

    <!-- Tab 栏 -->
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

    <!-- 数据延迟提示（仅日/月统计显示，到账情况不显示） -->
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
      <!-- 实际产值卡 -->
      <div class="output-card">
        <div class="output-title">今日实际产值{{ dayData.output.actual }}</div>
        <el-progress
          :percentage="(dayData.output.actual / dayData.output.target) * 100"
          :stroke-width="6"
          :show-text="false"
          color="#a40035"
        />
        <div class="output-labels">
          <div class="label-left">
            <div class="label-value">0</div>
            <div class="label-text">产值</div>
          </div>
          <div class="label-right">
            <div class="label-value">{{ dayData.output.target }}</div>
            <div class="label-text">
              日目标
              <el-icon class="info-icon"><InfoFilled /></el-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- 汇总/支出切换卡 -->
      <div class="toggle-card">
        <div
          class="toggle-item"
          :class="{ active: viewMode === 'summary' }"
          @click="viewMode = 'summary'"
        >
          <div class="toggle-amount">{{ dayData.summary.total }}</div>
          <div class="toggle-label">
            今日汇总
            <el-icon v-if="viewMode === 'summary'" class="toggle-arrow"><ArrowDown /></el-icon>
            <el-icon v-else class="toggle-arrow"><ArrowRight /></el-icon>
          </div>
        </div>
        <div
          class="toggle-item"
          :class="{ active: viewMode === 'expense' }"
          @click="viewMode = 'expense'"
        >
          <div class="toggle-amount">{{ dayData.expense.total }}</div>
          <div class="toggle-label">
            今日支出
            <el-icon v-if="viewMode === 'expense'" class="toggle-arrow"><ArrowDown /></el-icon>
            <el-icon v-else class="toggle-arrow"><ArrowRight /></el-icon>
          </div>
        </div>
      </div>

      <!-- 分类子 Tab + 列表（汇总） -->
      <div v-show="viewMode === 'summary'" class="category-block">
        <div class="category-tabs">
          <div
            class="category-tab"
            :class="{ active: summaryFilter === 'all' }"
            @click="summaryFilter = 'all'"
          >
            全部
          </div>
          <div
            v-for="cat in dayData.summary.categories"
            :key="cat.key"
            class="category-tab"
            :class="{ active: summaryFilter === cat.key }"
            @click="summaryFilter = cat.key"
          >
            {{ cat.label }} <span class="cat-value">{{ cat.value }}<span class="cat-unit">({{ cat.unit }})</span></span>
          </div>
        </div>
        <div class="record-list">
          <div
            v-for="item in filteredSummaryItems"
            :key="item.id"
            class="record-item"
            :class="{ 'is-clickable': item.detail }"
            @click="handleItemClick(item)"
          >
            <div class="record-row1">
              <div class="record-title-group">
                <span class="record-store">{{ item.store || item.title }}</span>
                <span v-if="item.isRepeatCustomer" class="repeat-tag">回头客</span>
              </div>
              <span class="record-amount">预计收入：{{ item.amount }}</span>
            </div>
            <div class="record-row2">
              <span class="record-service">{{ item.service || item.desc }}</span>
              <el-icon v-if="item.expandable" class="record-arrow"><ArrowRight /></el-icon>
            </div>
            <div class="record-time">{{ item.time }}</div>
          </div>
          <div v-if="filteredSummaryItems.length === 0" class="empty-tip">
            暂无符合条件的记录
          </div>
        </div>
      </div>

      <!-- 分类子 Tab + 列表（支出） -->
      <div v-show="viewMode === 'expense'" class="category-block">
        <div class="category-tabs">
          <div
            class="category-tab"
            :class="{ active: expenseFilter === 'all' }"
            @click="expenseFilter = 'all'"
          >
            全部
          </div>
          <div
            v-for="cat in dayData.expense.categories"
            :key="cat.key"
            class="category-tab"
            :class="{ active: expenseFilter === cat.key }"
            @click="expenseFilter = cat.key"
          >
            {{ cat.label }} <span class="cat-value">{{ cat.value }}<span class="cat-unit">({{ cat.unit }})</span></span>
          </div>
        </div>
        <div class="record-list">
          <div
            v-for="item in filteredExpenseItems"
            :key="item.id"
            class="record-item expense-item"
          >
            <div class="record-row1">
              <span class="record-store">{{ item.title }}</span>
              <span class="record-amount expense-amount">{{ item.amount }}</span>
            </div>
            <div class="record-row2">
              <span class="record-service"></span>
              <el-icon v-if="item.expandable" class="record-arrow"><ArrowRight /></el-icon>
            </div>
            <div class="record-time">{{ item.time }}</div>
          </div>
          <div v-if="filteredExpenseItems.length === 0" class="empty-tip">
            当日暂无支出记录
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 月统计（按工资单拆分） ==================== -->
    <div v-show="activeTab === 'month'" class="tab-content month-content">
      <!-- 实际产值卡 -->
      <div class="output-card">
        <div class="output-title">本月实际产值{{ monthOutput.actual }}</div>
        <el-progress
          :percentage="(monthOutput.actual / monthOutput.target) * 100"
          :stroke-width="6"
          :show-text="false"
          color="#a40035"
        />
        <div class="output-labels">
          <div class="label-left">
            <div class="label-value">0</div>
            <div class="label-text">产值</div>
          </div>
          <div class="label-right">
            <div class="label-value">{{ monthOutput.target }}</div>
            <div class="label-text">
              月目标
              <el-icon class="info-icon"><InfoFilled /></el-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- 收入分类 Tab 横向切换（轻量切换器，不套白卡） -->
      <div class="bills-switcher">
        <div class="bills-switcher-header">
          <span class="bills-switcher-title">收入分类</span>
          <span class="bills-switcher-count">共 {{ monthBills.length }} 张</span>
        </div>
        <div class="bill-tabs">
          <div
            v-for="(bill, idx) in monthBills"
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

        <!-- 预估收入 = 当前选中工资单的薪酬项 -->
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
          <div v-else class="empty-tip">该工资单暂无薪酬项</div>
        </div>

        <!-- 预估支出 = 当前选中工资单的扣缴项 -->
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
          <div v-else class="empty-tip">该工资单暂无扣缴项</div>
        </div>
    </div>

    <!-- ==================== 到账情况 ==================== -->
    <div v-show="activeTab === 'arrival'" class="tab-content">
      <div
        v-for="(section, sIdx) in arrivalData.sections"
        :key="sIdx"
        class="arrival-card"
      >
        <div class="arrival-title">
          {{ section.title }}<span class="arrival-unit">({{ section.unit }})</span>
        </div>
        <div class="arrival-grid">
          <div
            v-for="(item, idx) in section.items"
            :key="idx"
            class="arrival-item"
            :class="{
              'is-final': item.isFinal,
              'is-negative': item.value < 0
            }"
          >
            <div class="arrival-amount">{{ item.value }}</div>
            <div class="arrival-label">
              {{ item.label }}
              <el-icon class="cat-chevron"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </div>
      <div class="arrival-note">
        <div class="note-line">※ 负工资抵扣 = 上月未结清负数</div>
        <div class="note-line">※ 应发金额 = 合计金额 - 负工资抵扣 - 扣缴</div>
        <div class="note-line">※ 实发/已发金额 = 已打到员工账户的金额</div>
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
                    <span v-if="currentOrderDetail.isRepeatCustomer" class="repeat-tag inline">回头客</span>
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

    <!-- ==================== 门店选择 Sheet（单门店，预留） ==================== -->
    <!-- ==================== 月份选择 Sheet（月统计 Tab） ==================== -->
    <teleport to="body">
      <transition name="order-modal-fade">
        <div
          v-if="showDatePicker"
          class="order-modal-overlay"
          @click.self="showDatePicker = false"
        >
          <transition name="order-modal-slide" appear>
            <div v-if="showDatePicker" class="order-modal month-sheet">
              <div class="order-modal-handle"></div>
              <div class="order-modal-header">
                <span class="modal-title">选择月份</span>
                <el-button type="text" @click="showDatePicker = false" class="modal-close">
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
                    共 {{ (monthBillsMap[ym] || []).length }} 张工资单
                  </div>
                  <el-icon v-if="selectedMonth === ym" class="month-sheet-check"><Check /></el-icon>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </transition>
    </teleport>

    <!-- ==================== 收入明细弹层（按工资单+按薪酬类筛选） ==================== -->
    <teleport to="body">
      <div
        v-if="incomeItemSheetVisible"
        class="order-modal-overlay"
        @click.self="handleCloseIncomeItemSheet"
      >
        <div class="order-modal income-item-sheet">
          <div class="order-modal-handle"></div>
          <div class="order-modal-header">
            <span class="modal-title">{{ currentIncomeLabel }} - {{ selectedBill ? selectedBill.name : '' }}</span>
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

            <div v-else class="empty-tip">该工资单暂无该类明细</div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Close, MoreFilled, ArrowDown, ArrowRight, InfoFilled, CopyDocument, QuestionFilled, WarningFilled, DocumentRemove } from '@element-plus/icons-vue'

const router = useRouter()

// Tab 状态
const activeTab = ref('day')
const tabs = [
  { key: 'day', label: '日统计' },
  { key: 'month', label: '预估收入' },
  { key: 'arrival', label: '到账情况' }
]

// 日期选择（mock）
const showDatePicker = ref(false)
const selectedDay = ref('2026-07-08')
const selectedMonth = ref('2026-07')

// 月份可选项（与 monthBillsMap 的 key 对齐）
const availableMonths = computed(() => Object.keys(monthBillsMap).sort())

// 'YYYY-MM' → '26年07月'
const formatMonthLabel = (ym) => {
  const [y, m] = ym.split('-')
  return `${y.slice(2)}年${m}月`
}

const currentDateLabel = computed(() => {
  if (activeTab.value === 'day') return selectedDay.value
  if (activeTab.value === 'month') return formatMonthLabel(selectedMonth.value)
  return ''
})

const handleDatePicker = () => {
  if (activeTab.value === 'month') {
    showDatePicker.value = true
  } else {
    ElMessage.info('日期选择器 - 当前为 mock 数据')
  }
}

const handleMonthSelect = (ym) => {
  selectedMonth.value = ym
  showDatePicker.value = false
  ElMessage.success(`已切换到：${formatMonthLabel(ym)}`)
}

// ==================== 日统计 mock ====================
const dayData = reactive({
  output: {
    actual: 546,
    target: 666.67
  },
  summary: {
    total: 197.8,
    categories: [
      { key: 'piecework', label: '计件提成', value: 95.4, unit: '元' },
      { key: 'overtime', label: '加班工资', value: 15.4, unit: '元' },
      { key: 'subsidy', label: '补贴', value: 0.0, unit: '元' }
    ],
    items: [
      {
        id: 1,
        type: 'piecework',
        storeKey: 'danzishi',
        store: '弹子石老街店',
        service: '整脊踩背40分钟',
        time: '2026-07-08 21:20:00',
        amount: 29.7,
        isRepeatCustomer: false,
        expandable: true,
        detail: {
          storeName: '弹子石老街店',
          service: '整脊踩背40分钟',
          customerPhone: '138****0295',
          customerInfo: '002536(女)',
          status: '已完成',
          startTime: '07月08日21:20',
          endTime: '07月08日22:00',
          orderNo: '6102162202607082120000000123',
          originalPrice: 79,
          actualPayment: 59,
          pieceworkCommission: 29.7,
          isRepeatCustomer: false
        }
      },
      {
        id: 2,
        type: 'subsidy',
        title: '优秀员工节日津贴',
        desc: '中秋节优秀员工津贴',
        time: '2026-07-08',
        amount: 44.7,
        expandable: false
      },
      {
        id: 3,
        type: 'piecework',
        storeKey: 'danzishi',
        store: '弹子石老街店',
        service: '睡眠调理60分钟',
        time: '2026-07-08 20:20:00',
        amount: 44.7,
        isRepeatCustomer: true,
        expandable: true,
        detail: {
          storeName: '弹子石老街店',
          service: '睡眠调理60分钟',
          customerPhone: '139****8821',
          customerInfo: '008912(男)',
          status: '已完成',
          startTime: '07月08日19:20',
          endTime: '07月08日20:20',
          orderNo: '6102162202607082020000000456',
          originalPrice: 179,
          actualPayment: 161,
          pieceworkCommission: 44.7,
          isRepeatCustomer: true
        }
      },
      {
        id: 4,
        type: 'piecework',
        storeKey: 'danzishi',
        store: '弹子石老街店',
        service: '睡眠调理60分钟',
        time: '2026-07-08 16:50:00',
        amount: 44.7,
        isRepeatCustomer: true,
        expandable: true,
        detail: {
          storeName: '弹子石老街店',
          service: '睡眠调理60分钟',
          customerPhone: '186****1102',
          customerInfo: '003045(女)',
          status: '已完成',
          startTime: '07月08日15:50',
          endTime: '07月08日16:50',
          orderNo: '6102162202607081650000000789',
          originalPrice: 179,
          actualPayment: 161,
          pieceworkCommission: 44.7,
          isRepeatCustomer: true
        }
      },
      {
        id: 6,
        type: 'piecework',
        storeKey: 'chengdu',
        store: '成都印象城店',
        service: '头颈肩痛60分钟',
        time: '2026-07-08 12:10:00',
        amount: 48.3,
        isRepeatCustomer: true,
        expandable: true,
        detail: {
          storeName: '成都印象城店',
          service: '头颈肩痛60分钟',
          customerPhone: '138****0295',
          customerInfo: '002536(女)',
          status: '已完成',
          startTime: '07月08日11:10',
          endTime: '07月08日12:10',
          orderNo: '6102162202607081210000000789',
          originalPrice: 179,
          actualPayment: 161,
          pieceworkCommission: 48.3,
          isRepeatCustomer: true
        }
      }
    ]
  },
  expense: {
    total: 0,
    categories: [
      { key: 'complaint', label: '投诉扣款', value: 95.4, unit: '元' },
      { key: 'refund', label: '退单扣款', value: 95.4, unit: '元' },
      { key: 'social', label: '代扣社保', value: 0.0, unit: '元' },
      { key: 'tax', label: '代扣个税', value: 0.0, unit: '元' }
    ],
    items: [
      {
        id: 1,
        type: 'complaint',
        title: '投诉扣款',
        time: '2026-07-08 00:00:00',
        amount: -15,
        expandable: true
      }
    ]
  }
})

// ==================== 月统计：发放策略 + 按月份工资单 mock ====================
const strategy = {
  id: '1109493788878143500',
  name: '全职推拿师发放策略（v3没有营销折扣获豆和回头客补贴）',
  templateName: '全职推拿师模板',
  position: '推拿师',
  coopMode: '劳动合同-全职'
}

// 本月实际产值（按月份区分）
const monthOutputMap = {
  '2026-07': { actual: 13311, target: 18000 },
  '2026-06': { actual: 14820, target: 18000 },
  '2026-05': { actual: 12050, target: 18000 }
}
const monthOutput = computed(() => monthOutputMap[selectedMonth.value] || { actual: 0, target: 18000 })

// 键 = 'YYYY-MM'。每月 3 张工资单：计件提成 / 加班工资 / 补贴
const monthBillsMap = {
  '2026-07': [
    {
      id: 'BILL-2026-07-PIECE',
      billNo: 'GZD-202607-001',
      name: '计件提成',
      period: '7月1日 - 7月31日',
      status: '已发放',
      payTime: '2026-07-31 18:00',
      incomeItems: [
        { type: 'piecework', label: '计件提成', value: 1180.0 }
      ],
      deductionItems: [
        { type: 'complaint', label: '投诉扣款', value: -50 },
        { type: 'social', label: '代扣社保', value: -120 },
        { type: 'tax', label: '代扣个税', value: -45.5 }
      ]
    },
    {
      id: 'BILL-2026-07-OVERTIME',
      billNo: 'GZD-202607-002',
      name: '加班补偿',
      period: '7月1日 - 7月31日',
      status: '已发放',
      payTime: '2026-07-31 18:00',
      incomeItems: [
        { type: 'overtime', label: '加班工资', value: 195.4 }
      ],
      deductionItems: [
        { type: 'social', label: '代扣社保', value: -20 },
        { type: 'tax', label: '代扣个税', value: -12.3 }
      ]
    },
    {
      id: 'BILL-2026-07-SUBSIDY',
      billNo: 'GZD-202607-003',
      name: '节日福利',
      period: '7月1日 - 7月31日',
      status: '待发放',
      payTime: '2026-08-05 18:00',
      incomeItems: [
        { type: 'subsidy', label: '高温补贴', value: 200 },
        { type: 'subsidy', label: '餐补', value: 150 }
      ],
      deductionItems: [
        { type: 'social', label: '代扣社保', value: -35 },
        { type: 'tax', label: '代扣个税', value: -10 }
      ]
    }
  ],
  '2026-06': [
    {
      id: 'BILL-2026-06-PIECE',
      billNo: 'GZD-202606-001',
      name: '业绩激励',
      period: '6月1日 - 6月30日',
      status: '已发放',
      payTime: '2026-06-30 18:00',
      incomeItems: [
        { type: 'piecework', label: '计件提成', value: 980.0 }
      ],
      deductionItems: [
        { type: 'social', label: '代扣社保', value: -98 },
        { type: 'tax', label: '代扣个税', value: -32 }
      ]
    },
    {
      id: 'BILL-2026-06-OVERTIME',
      billNo: 'GZD-202606-002',
      name: '延时工时',
      period: '6月1日 - 6月30日',
      status: '已发放',
      payTime: '2026-06-30 18:00',
      incomeItems: [
        { type: 'overtime', label: '加班工资', value: 88.0 }
      ],
      deductionItems: [
        { type: 'tax', label: '代扣个税', value: -3 }
      ]
    },
    {
      id: 'BILL-2026-06-SUBSIDY',
      billNo: 'GZD-202606-003',
      name: '全勤奖',
      period: '6月1日 - 6月30日',
      status: '已发放',
      payTime: '2026-06-30 18:00',
      incomeItems: [
        { type: 'subsidy', label: '全勤奖', value: 300 }
      ],
      deductionItems: []
    }
  ],
  '2026-05': [
    {
      id: 'BILL-2026-05-PIECE',
      billNo: 'GZD-202605-001',
      name: '基础计件',
      period: '5月1日 - 5月31日',
      status: '已发放',
      payTime: '2026-05-31 18:00',
      incomeItems: [
        { type: 'piecework', label: '计件提成', value: 860.0 }
      ],
      deductionItems: [
        { type: 'complaint', label: '投诉扣款', value: -30 },
        { type: 'social', label: '代扣社保', value: -83 },
        { type: 'tax', label: '代扣个税', value: -22 }
      ]
    }
  ]
}

// 当前月份工资单
const monthBills = computed(() => monthBillsMap[selectedMonth.value] || [])

// ==================== 收入明细订单 mock（按 billKey+type 关联） ====================
const billOrders = ref([
  // 7月计件提成工资单
  { id: 1, billKey: 'BILL-2026-07-PIECE', store: '弹子石老街店', service: '整脊踩背40分钟', time: '2026-07-08 21:20:00', amount: 29.7, type: 'piecework', isRepeatCustomer: false },
  { id: 2, billKey: 'BILL-2026-07-PIECE', store: '弹子石老街店', service: '睡眠调理60分钟', time: '2026-07-08 20:20:00', amount: 44.7, type: 'piecework', isRepeatCustomer: true, repeatCount: 2 },
  { id: 3, billKey: 'BILL-2026-07-PIECE', store: '弹子石老街店', service: '睡眠调理60分钟', time: '2026-07-08 16:50:00', amount: 44.7, type: 'piecework', isRepeatCustomer: true, repeatCount: 3 },
  { id: 4, billKey: 'BILL-2026-07-PIECE', store: '成都印象城店', service: '头颈肩痛60分钟', time: '2026-07-08 12:10:00', amount: 48.3, type: 'piecework', isRepeatCustomer: true, repeatCount: 2 },
  { id: 5, billKey: 'BILL-2026-07-PIECE', store: 'in99银泰中心店', service: '脊柱调整60分钟', time: '2026-07-07 15:00:00', amount: 56.4, type: 'piecework', isRepeatCustomer: false },
  { id: 6, billKey: 'BILL-2026-07-PIECE', store: '弹子石老街店', service: '足疗40分钟', time: '2026-07-06 18:00:00', amount: 38.0, type: 'piecework', isRepeatCustomer: false },

  // 7月加班补贴工资单
  { id: 7, billKey: 'BILL-2026-07-OVERTIME', store: '弹子石老街店', service: '延时加班（4小时）', time: '2026-07-08 23:00:00', amount: 65.2, type: 'overtime', isRepeatCustomer: false },
  { id: 8, billKey: 'BILL-2026-07-OVERTIME', store: '弹子石老街店', service: '延时加班（3小时）', time: '2026-07-05 22:30:00', amount: 48.9, type: 'overtime', isRepeatCustomer: false },
  { id: 9, billKey: 'BILL-2026-07-OVERTIME', store: '成都印象城店', service: '延时加班（2.5小时）', time: '2026-07-03 22:00:00', amount: 40.7, type: 'overtime', isRepeatCustomer: false },

  // 7月奖励福利工资单
  { id: 10, billKey: 'BILL-2026-07-SUBSIDY', store: '总部', service: '高温补贴', time: '2026-07-15 09:00:00', amount: 200.0, type: 'subsidy', isRepeatCustomer: false },
  { id: 11, billKey: 'BILL-2026-07-SUBSIDY', store: '总部', service: '餐补', time: '2026-07-15 09:00:00', amount: 150.0, type: 'subsidy', isRepeatCustomer: false },

  // 6月计件提成工资单
  { id: 12, billKey: 'BILL-2026-06-PIECE', store: '弹子石老街店', service: '整脊踩背40分钟', time: '2026-06-30 20:00:00', amount: 32.5, type: 'piecework', isRepeatCustomer: false },
  { id: 13, billKey: 'BILL-2026-06-PIECE', store: '弹子石老街店', service: '睡眠调理60分钟', time: '2026-06-28 19:30:00', amount: 46.2, type: 'piecework', isRepeatCustomer: true, repeatCount: 1 },
  { id: 14, billKey: 'BILL-2026-06-PIECE', store: '弹子石老街店', service: '足疗40分钟', time: '2026-06-25 18:00:00', amount: 38.0, type: 'piecework', isRepeatCustomer: false },
  { id: 15, billKey: 'BILL-2026-06-PIECE', store: '成都印象城店', service: '头疗30分钟', time: '2026-06-22 14:00:00', amount: 28.5, type: 'piecework', isRepeatCustomer: false },

  // 6月加班补贴工资单
  { id: 16, billKey: 'BILL-2026-06-OVERTIME', store: '弹子石老街店', service: '延时加班（2小时）', time: '2026-06-20 22:00:00', amount: 32.6, type: 'overtime', isRepeatCustomer: false },
  { id: 17, billKey: 'BILL-2026-06-OVERTIME', store: '弹子石老街店', service: '延时加班（1.5小时）', time: '2026-06-15 22:30:00', amount: 24.4, type: 'overtime', isRepeatCustomer: false },

  // 6月奖励福利工资单
  { id: 18, billKey: 'BILL-2026-06-SUBSIDY', store: '总部', service: '全勤奖', time: '2026-06-30 09:00:00', amount: 300.0, type: 'subsidy', isRepeatCustomer: false },

  // 5月计件提成工资单
  { id: 19, billKey: 'BILL-2026-05-PIECE', store: '弹子石老街店', service: '整脊踩背40分钟', time: '2026-05-30 20:00:00', amount: 30.0, type: 'piecework', isRepeatCustomer: false },
  { id: 20, billKey: 'BILL-2026-05-PIECE', store: '弹子石老街店', service: '睡眠调理60分钟', time: '2026-05-28 19:00:00', amount: 42.0, type: 'piecework', isRepeatCustomer: true, repeatCount: 1 },
  { id: 21, billKey: 'BILL-2026-05-PIECE', store: '弹子石老街店', service: '足疗40分钟', time: '2026-05-25 18:00:00', amount: 36.0, type: 'piecework', isRepeatCustomer: false },
  { id: 22, billKey: 'BILL-2026-05-PIECE', store: '成都印象城店', service: '中式推拿60分钟', time: '2026-05-20 15:00:00', amount: 45.0, type: 'piecework', isRepeatCustomer: false }
])

// 选中工资单索引（切换月份时重置为 0）
const selectedBillIndex = ref(0)
const selectedBill = computed(() => monthBills.value[selectedBillIndex.value] || null)

// 切月份时重置选中工资单为第一张
watch(selectedMonth, () => {
  selectedBillIndex.value = 0
})

// 金额格式化
const formatAmount = (val) => {
  if (typeof val !== 'number') return val
  return val.toFixed(2)
}

// 项单位（薪酬/扣缴统一"元"）
const unitOf = (_item) => '元'

// ==================== 收入明细弹层（按工资单+按薪酬类筛选） ====================
const incomeItemSheetVisible = ref(false)
const currentIncomeLabel = ref('')
const currentIncomeType = ref('')

const incomeItemOrders = computed(() => {
  if (!selectedBill.value || !currentIncomeType.value) return []
  return billOrders.value.filter(o =>
    o.billKey === selectedBill.value.id && o.type === currentIncomeType.value
  )
})

const incomeItemSubtotal = computed(() => {
  return incomeItemOrders.value.reduce((s, o) => s + o.amount, 0)
})

const handleIncomeItemClick = (item) => {
  currentIncomeLabel.value = item.label
  currentIncomeType.value = item.type
  incomeItemSheetVisible.value = true
}

const handleCloseIncomeItemSheet = () => {
  incomeItemSheetVisible.value = false
}

const handleOpenOrderFromIncome = (item) => {
  incomeItemSheetVisible.value = false
  // 构造订单详情（与日统计订单详情弹层结构一致）
  currentOrderDetail.value = {
    storeName: item.store,
    service: item.service,
    customerPhone: '138****8888',
    customerInfo: '男 / 30岁',
    status: '已完成',
    startTime: item.time,
    endTime: item.time.replace(/\d{2}$/, '00'),
    orderNo: 'GZD' + (item.id + 1000000),
    originalPrice: Math.round(item.amount * 4),
    actualPayment: Math.round(item.amount * 3.6),
    pieceworkCommission: item.amount.toFixed(2),
    isRepeatCustomer: !!item.isRepeatCustomer
  }
  orderDetailVisible.value = true
}

// ==================== 到账情况 mock ====================
const arrivalData = reactive({
  sections: [
    {
      title: '计件提成',
      unit: '元',
      items: [
        { label: '合计金额', value: 1195.4, isFinal: true },
        { label: '负工资抵扣', value: -10.0, isFinal: false },
        { label: '扣缴', value: -10.0, isFinal: false },
        { label: '应发金额', value: 1185.4, isFinal: true },
        { label: '实发金额', value: 1185.4, isFinal: true }
      ]
    },
    {
      title: '加班工资',
      unit: '元',
      items: [
        { label: '合计金额', value: 195.4, isFinal: true },
        { label: '负工资抵扣', value: -10.0, isFinal: false },
        { label: '扣缴', value: -15.0, isFinal: false },
        { label: '应发金额', value: 180.4, isFinal: true },
        { label: '已发金额', value: 180.4, isFinal: true }
      ]
    },
    {
      title: '补贴',
      unit: '元',
      items: [
        { label: '合计金额', value: 1195.4, isFinal: true },
        { label: '负工资抵扣', value: -10.0, isFinal: false },
        { label: '扣缴', value: -15.0, isFinal: false },
        { label: '应发金额', value: 1180.4, isFinal: true },
        { label: '已发金额', value: 1180.4, isFinal: true }
      ]
    }
  ]
})

// 视图模式
const viewMode = ref('summary')
const summaryFilter = ref('all')
const expenseFilter = ref('all')

// 列表过滤（全职单门店：直接按类型过滤）
const filteredSummaryItems = computed(() => {
  let items = dayData.summary.items
  if (summaryFilter.value === 'all') return items
  return items.filter(item => item.type === summaryFilter.value)
})

const filteredExpenseItems = computed(() => {
  let items = dayData.expense.items
  if (expenseFilter.value === 'all') return items
  return items.filter(item => item.type === expenseFilter.value)
})

// 订单详情弹层
const orderDetailVisible = ref(false)
const currentOrderDetail = ref(null)
const handleItemClick = (item) => {
  if (!item.detail) return
  currentOrderDetail.value = item.detail
  orderDetailVisible.value = true
}
const handleCloseDetail = () => {
  orderDetailVisible.value = false
  currentOrderDetail.value = null
}
const copyOrderNo = () => {
  if (!currentOrderDetail.value) return
  const text = currentOrderDetail.value.orderNo
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      ElMessage.success('订单编号已复制')
    })
  } else {
    ElMessage.info(text)
  }
}
const handleAppeal = () => {
  ElMessage.success('申诉已提交，门店经理将在 24h 内处理')
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

// 返回
const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/mobile-menu')
  }
}
</script>

<style scoped>
.mobile-salary-dashboard-2 {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
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
  padding: 14px 0;
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 2px;
  cursor: pointer;
}

.date-arrow {
  font-size: 12px;
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
  margin-bottom: 12px;
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

/* ========== 实际产值卡 ========== */
.output-card {
  background: white;
  border-radius: 8px;
  padding: 20px 16px 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.output-title {
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.output-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

.label-left,
.label-right {
  text-align: center;
}

.label-value {
  color: #666;
  margin-bottom: 2px;
}

.label-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.info-icon {
  color: #a40035;
  font-size: 12px;
}

/* ========== 汇总/支出切换卡 ========== */
.toggle-card {
  background: white;
  border-radius: 8px;
  padding: 24px 16px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-around;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.toggle-item {
  flex: 1;
  text-align: center;
  cursor: pointer;
  position: relative;
}

.toggle-item:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 40px;
  background: #f0f0f0;
}

.toggle-amount {
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.toggle-item.active .toggle-amount {
  color: #a40035;
}

.toggle-label {
  font-size: 13px;
  color: #999;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.toggle-item.active .toggle-label {
  color: #a40035;
  font-weight: 500;
}

.toggle-arrow {
  font-size: 12px;
}

/* ========== 分类子 Tab ========== */
.category-block {
  background: white;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.category-tabs {
  display: flex;
  flex-wrap: nowrap;
  gap: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 12px;
  margin-bottom: 12px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.category-tabs::-webkit-scrollbar {
  display: none;
}

.category-tab {
  font-size: 13px;
  color: #999;
  cursor: pointer;
  position: relative;
  padding-bottom: 4px;
  white-space: nowrap;
  flex-shrink: 0;
}

.category-tab.active {
  color: #a40035;
  font-weight: 600;
  border-bottom: 2px solid #a40035;
}

.cat-value {
  color: #333;
  font-weight: 600;
  margin-left: 2px;
}

.category-tab.active .cat-value {
  color: #a40035;
}

.cat-unit {
  font-size: 11px;
  color: #999;
  margin-left: 1px;
  font-weight: normal;
}

/* ========== 记录列表 ========== */
.record-list {
  display: flex;
  flex-direction: column;
}

.record-item {
  padding: 14px 0;
  border-bottom: 1px solid #f5f5f5;
  position: relative;
}

.record-item.is-clickable {
  cursor: pointer;
  transition: background 0.15s;
  margin: 0 -16px;
  padding: 14px 16px;
}

.record-item.is-clickable:hover {
  background: #fafafa;
}

.record-item.is-clickable:active {
  background: #f5f5f5;
}

.record-item:last-child {
  border-bottom: none;
}

.record-row1 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.record-store {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.record-title-group {
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
  overflow: hidden;
}

.record-amount {
  font-size: 13px;
  color: #666;
}

.expense-amount {
  color: #a40035;
  font-weight: 600;
}

.record-row2 {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.record-service {
  font-size: 13px;
  color: #999;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-arrow {
  font-size: 12px;
  color: #ccc;
  flex-shrink: 0;
  margin-left: 4px;
}

.repeat-tag {
  display: inline-block;
  padding: 1px 6px;
  font-size: 11px;
  color: #a40035;
  background: #fff5f8;
  border: 1px solid #ffd6e2;
  border-radius: 3px;
  flex-shrink: 0;
  margin-left: 6px;
  line-height: 1.4;
}

.record-time {
  font-size: 12px;
  color: #bbb;
  margin-top: 6px;
}

.empty-tip {
  text-align: center;
  padding: 32px 0;
  color: #ccc;
  font-size: 13px;
}

/* ========== 月统计 ========== */
.month-content {
  padding: 12px;
}

/* 工资单 Tab 轻量切换器（不套白卡） */
.bills-switcher {
  margin-bottom: 12px;
}

.bills-switcher-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 0 4px 8px;
}

.bills-switcher-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.bills-switcher-count {
  font-size: 12px;
  color: #999;
}

.bill-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 0 0 4px;
}

.bill-tabs::-webkit-scrollbar {
  display: none;
}

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

.bill-tab.active {
  background: #fff5f8;
  border-color: #a40035;
}

.bill-tab-name {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
}

.bill-tab.active .bill-tab-name {
  color: #a40035;
}

.bill-tab-period {
  font-size: 11px;
  color: #999;
  white-space: nowrap;
  margin-top: 1px;
}

.bill-tab.active .bill-tab-period {
  color: #a40035;
}

/* 汇总/支出卡（与原版 month-section-card 1:1 一致） */
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

/* 原版 4 列网格（汇总/支出共用） */
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

.month-cat-item.negative .month-cat-value {
  color: #a40035;
}

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

.cat-chevron {
  font-size: 10px;
  color: #ccc;
}

.bill-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.bill-tabs::-webkit-scrollbar {
  display: none;
}

.bill-tab {
  flex-shrink: 0;
  min-width: 110px;
  padding: 8px 12px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.bill-tab.active {
  background: #fff5f8;
  border-color: #a40035;
}

.bill-tab-name {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bill-tab.active .bill-tab-name {
  color: #a40035;
}

.bill-tab-period {
  font-size: 11px;
  color: #999;
  white-space: nowrap;
}

.bill-subsection {
  margin-bottom: 14px;
}

.bill-subsection:last-child {
  margin-bottom: 0;
}

.bill-subsection-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.red-bar {
  display: inline-block;
  width: 3px;
  height: 13px;
  background: #a40035;
  border-radius: 2px;
}

.bill-line-list {
  display: flex;
  flex-direction: column;
}

.bill-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.bill-line:last-child {
  border-bottom: none;
}

.bill-line-label {
  color: #666;
}

.bill-line-value {
  font-weight: 600;
  color: #333;
  font-variant-numeric: tabular-nums;
}

.income-value {
  color: #a40035;
}

.deduction-value {
  color: #666;
}

.value-unit {
  font-size: 11px;
  color: #999;
  font-weight: normal;
  margin-left: 1px;
}

.bill-subsection {
  margin-bottom: 14px;
}

.bill-subsection:last-child {
  margin-bottom: 0;
}

.bill-subsection-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.red-bar {
  display: inline-block;
  width: 3px;
  height: 13px;
  background: #a40035;
  border-radius: 2px;
}

.bill-line-list {
  display: flex;
  flex-direction: column;
}

.bill-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.bill-line:last-child {
  border-bottom: none;
}

.bill-line-label {
  color: #666;
}

.bill-line-value {
  font-weight: 600;
  color: #333;
  font-variant-numeric: tabular-nums;
}

.income-value {
  color: #a40035;
}

.deduction-value {
  color: #666;
}

.value-unit {
  font-size: 11px;
  color: #999;
  font-weight: normal;
  margin-left: 1px;
}

/* ========== 月统计占位 ========== */
.empty-state-large {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 0;
  color: #ccc;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.empty-state-large .el-icon {
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state-large .empty-text {
  font-size: 14px;
  color: #ccc;
}

/* ========== 到账情况 ========== */
.arrival-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
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
  margin-left: 2px;
}

.arrival-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px 12px;
}

.arrival-item {
  text-align: left;
  cursor: pointer;
}

.arrival-amount {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.arrival-item.is-final .arrival-amount {
  font-weight: 800;
}

.arrival-item.is-negative .arrival-amount {
  color: #a40035;
}

.arrival-label {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 2px;
}

.arrival-note {
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 6px;
  padding: 12px;
  margin-top: 4px;
  font-size: 12px;
  color: #876800;
  line-height: 1.8;
}

.note-line {
  margin-bottom: 2px;
}

.note-line:last-child {
  margin-bottom: 0;
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
  background: white;
  border-radius: 8px;
  padding: 14px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  cursor: pointer;
}

.income-orders-list .order-store {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.income-orders-list .order-amount {
  font-size: 14px;
  color: #a40035;
  font-weight: 600;
}

.income-orders-list .order-service {
  font-size: 13px;
  color: #999;
}

.income-orders-list .order-chevron {
  color: #ccc;
  font-size: 14px;
}

.income-orders-list .order-time {
  font-size: 12px;
  color: #ccc;
}

.income-orders-list .order-title-group {
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
  overflow: hidden;
}

.income-orders-list .order-row1 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.income-orders-list .order-row2 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.income-orders-list .order-row3 {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* ========== 订单详情弹层（底部上滑） ========== */
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
  max-height: 88vh;
  border-radius: 16px 16px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
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
  position: relative;
  flex-shrink: 0;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  flex: 1;
  text-align: center;
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

.order-modal-footer:hover {
  color: #a40035;
}

.footer-icon {
  font-size: 14px;
}

.order-modal-fade-enter-active,
.order-modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.order-modal-fade-enter-from,
.order-modal-fade-leave-to {
  opacity: 0;
}

.order-modal-slide-enter-active,
.order-modal-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.order-modal-slide-enter-from,
.order-modal-slide-leave-to {
  transform: translateY(100%);
}

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

.store-name {
  font-weight: 600;
  flex-shrink: 0;
}

.customer-phone,
.customer-info {
  color: #999;
  font-weight: normal;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.summary-divider {
  color: #ddd;
  margin: 0 6px;
  font-weight: normal;
  flex-shrink: 0;
}

.summary-time {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.summary-service {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin-bottom: 8px;
}

.summary-service-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.summary-service-row .summary-service {
  margin-bottom: 0;
}

.repeat-tag.inline {
  margin-left: 0;
  line-height: 1.4;
}

.summary-orderno {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
  gap: 4px;
}

.orderno-text {
  flex: 1;
  word-break: break-all;
  line-height: 1.4;
}

.copy-btn {
  color: #a40035;
  padding: 0 4px;
  flex-shrink: 0;
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

.section-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.content-line {
  font-size: 13px;
  color: #666;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.content-label {
  color: #666;
  flex: 1;
}

.content-value {
  font-weight: 600;
  color: #333;
  font-size: 14px;
  white-space: nowrap;
}

.value-unit {
  font-size: 12px;
  color: #999;
  font-weight: normal;
  margin-left: 1px;
}

/* ========== 月份选择 Sheet ========== */
.month-sheet {
  max-height: 70vh;
}

.month-sheet-body {
  padding: 0 0 12px;
}

.month-sheet-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  position: relative;
}

.month-sheet-item:last-child {
  border-bottom: none;
}

.month-sheet-item:active {
  background: #fafafa;
}

.month-sheet-item.active {
  background: #fff5f8;
}

.month-sheet-label {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.month-sheet-item.active .month-sheet-label {
  color: #a40035;
}

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

/* ========== 门店选择 Sheet（已移除：全职单门店，无需切换） ========== */
</style>