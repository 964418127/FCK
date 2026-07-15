<template>
  <div class="mobile-am-dashboard">
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

    <!-- 数据延迟提示（仅日/月统计显示） -->
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

    <!-- ==================== 日统计（图 1 一级 + 弹层） ==================== -->
    <div v-show="activeTab === 'day'" class="tab-content">
      <!-- 切换卡：今日汇总 / 今日支出 -->
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

      <!-- 今日汇总：横向 8 个子分类 chip + 订单列表 -->
      <template v-if="viewMode === 'summary'">
        <div class="subcat-tabs">
          <div
            v-for="sub in subCategoryOrdersMap"
            :key="sub.key"
            class="subcat-tab"
            :class="{ active: selectedSubKey === sub.key }"
            @click="selectedSubKey = sub.key"
          >
            {{ sub.label }}
          </div>
        </div>

        <div v-if="currentSub" class="subcat-content">
          <div v-if="currentSub.orders.length === 0" class="subcat-empty">暂无信息</div>

          <div v-else>
            <div
              v-for="order in currentSub.orders"
              :key="order.id"
              class="subcat-order"
              @click="handleOrderClick(order)"
            >
              <div class="order-row-top">
                <span class="order-staff">{{ order.staff }}</span>
                <span class="order-amt">预计收入：+{{ getOrderSubAmount(order, currentSub.key).amount.toFixed(2) }}</span>
              </div>
              <div class="order-row-mid">
                <span class="order-service">{{ order.service }}</span>
                <el-icon class="order-chevron"><ArrowRight /></el-icon>
              </div>
              <div class="order-row-bot">
                <span class="order-time">{{ order.time }}</span>
                <span class="order-source">{{ getOrderSubAmount(order, currentSub.key).source }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-tip">请选择子分类</div>
      </template>

      <!-- 今日支出：父级分类子 Tab + 摘要项列表（参考图风格） -->
      <template v-else>
        <div class="expense-category-tabs">
          <div
            class="expense-category-tab"
            :class="{ active: selectedExpenseKey === 'all' }"
            @click="selectedExpenseKey = 'all'"
          >
            全部
          </div>
          <div
            v-for="cat in dayData.expense.categories"
            :key="cat.key"
            class="expense-category-tab"
            :class="{ active: selectedExpenseKey === cat.key }"
            @click="selectedExpenseKey = cat.key"
          >
            {{ cat.label }} <span class="cat-value" :class="{ negative: cat.value < 0 }">{{ formatAmount(cat.value) }}<span class="cat-unit">({{ cat.unit }})</span></span>
          </div>
        </div>

        <div class="expense-summary-list">
          <div
            v-for="item in visibleExpenseItems"
            :key="item.id"
            class="expense-summary-item"
          >
            <div class="expense-summary-top">
              <span class="expense-summary-title">{{ item.title }}</span>
              <span class="expense-summary-amount" :class="{ negative: item.amount < 0 }">
                {{ formatAmount(item.amount) }}
              </span>
            </div>
            <div class="expense-summary-subtitle">{{ item.subtitle }}</div>
            <div class="expense-summary-time">{{ item.time }}</div>
          </div>

          <div v-if="visibleExpenseItems.length === 0" class="empty-tip">暂无支出记录</div>
        </div>
      </template>
    </div>

    <!-- ==================== 预估收入（按工资单拆分，不含产值卡） ==================== -->
    <div v-show="activeTab === 'month'" class="tab-content month-content">
      <!-- 收入分类 Tab 横向切换 -->
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
        <div class="arrival-grid arrival-grid-3">
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
              <el-icon v-if="item.hasChevron" class="cat-chevron"><ArrowRight /></el-icon>
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
  </div>

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

  <!-- ==================== 订单详情弹层 ==================== -->
  <teleport to="body">
    <div
      v-if="orderDetailVisible"
      class="order-modal-overlay"
      @click.self="handleCloseDetail"
    >
      <div class="order-modal">
        <div class="order-modal-handle"></div>
        <div class="order-modal-header">
          <span class="modal-title">订单详情</span>
          <el-button type="text" @click="handleCloseDetail" class="modal-close">
            <el-icon :size="20"><Close /></el-icon>
          </el-button>
        </div>

        <div v-if="currentOrderDetail" class="order-modal-body">
          <!-- 订单信息卡 -->
          <div class="order-info-card">
            <div class="order-info-row1">
              <span class="info-staff">{{ currentOrderDetail.staff }}</span>
              <span class="info-divider">|</span>
              <span class="info-phone">{{ currentOrderDetail.staffPhone }}</span>
              <el-icon class="info-eye"><View /></el-icon>
              <span class="info-divider">|</span>
              <span class="info-customer">{{ currentOrderDetail.customerInfo }}</span>
              <el-tag type="success" size="small" effect="light" class="info-status">{{ currentOrderDetail.status }}</el-tag>
            </div>
            <div class="order-info-row">
              <span class="info-time">
                {{ currentOrderDetail.dateLabel }} {{ currentOrderDetail.startTime }}开始
                <span class="info-divider">|</span>
                {{ currentOrderDetail.dateLabel }} {{ currentOrderDetail.endTime }}下钟
              </span>
            </div>
            <div class="order-info-service">{{ currentOrderDetail.service }}</div>
            <div class="order-info-store-row">
              <span class="info-store-name">{{ currentOrderDetail.storeName }}</span>
              <span class="info-cross-day">是否跨天订单：{{ currentOrderDetail.isCrossDay }}</span>
            </div>
            <div class="order-info-orderno">
              <span class="orderno-text">订单号：{{ currentOrderDetail.orderNo }}</span>
              <el-button type="text" size="small" @click.stop="copyOrderNo" class="copy-btn">
                <el-icon :size="14"><CopyDocument /></el-icon>
              </el-button>
            </div>
            <div class="order-info-payment">
              <span class="payment-label">实付款：</span>
              <span class="payment-original">¥{{ currentOrderDetail.originalPrice }}</span>
              <span class="info-divider">|</span>
              <span class="payment-actual">¥{{ currentOrderDetail.actualPayment }}</span>
            </div>
          </div>

          <!-- 班次收入 -->
          <div v-if="currentOrderDetail.shiftIncomes.length > 0" class="order-income-card">
            <div class="order-income-title">
              <span class="red-bar"></span>
              <span>班次收入</span>
            </div>
            <div
              v-for="(item, idx) in currentOrderDetail.shiftIncomes"
              :key="idx"
              class="order-income-row"
            >
              <span class="order-income-label">{{ item.label }}：</span>
              <span class="order-income-value">{{ item.amount.toFixed(2) }}<span class="value-unit"> 元</span></span>
            </div>
          </div>

          <!-- 激励补贴 -->
          <div v-if="currentOrderDetail.subsidyItems.length > 0" class="order-income-card">
            <div class="order-income-title">
              <span class="red-bar"></span>
              <span>激励补贴</span>
            </div>
            <div
              v-for="(item, idx) in currentOrderDetail.subsidyItems"
              :key="idx"
              class="order-income-row"
            >
              <span class="order-income-label">{{ item.label }}</span>
              <span class="order-income-value income-positive">+{{ item.amount.toFixed(2) }}<span class="value-unit"> 元</span></span>
            </div>
          </div>
        </div>

        <div class="order-modal-footer" @click="handleAppeal">
          <el-icon class="footer-icon"><QuestionFilled /></el-icon>
          <span>对该笔收入有疑惑</span>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Close, MoreFilled, ArrowDown, ArrowRight, InfoFilled, WarningFilled, DocumentRemove, Check, CopyDocument, QuestionFilled, View } from '@element-plus/icons-vue'

const router = useRouter()

// ==================== Tab 状态 ====================
const activeTab = ref('day')
const tabs = [
  { key: 'day', label: '日统计' },
  { key: 'month', label: '预估收入' },
  { key: 'arrival', label: '到账情况' }
]

// 日期选择（mock）
const showDatePicker = ref(false)
const selectedDay = ref('26年07月07日')
const currentDateLabel = computed(() => {
  if (activeTab.value === 'day') return selectedDay.value
  if (activeTab.value === 'month' || activeTab.value === 'arrival') return formatMonthLabel(selectedMonth.value)
  return ''
})
// ==================== 视图模式 ====================
const viewMode = ref('summary')
const selectedSubKey = ref('all')
const selectedExpenseKey = ref('all')

// 当前选中的子分类（不分组，订单从 allOrdersPool 取）
const currentSub = computed(() => {
  const sub = Object.values(subCategoryOrdersMap).find(s => s.key === selectedSubKey.value)
  if (!sub) return null
  return {
    ...sub,
    orders: sub.orderKeys.map(k => allOrdersPool[k]).filter(Boolean)
  }
})

// 今日支出：扣缴项摘要（按 type 过滤）
const visibleExpenseItems = computed(() => {
  if (selectedExpenseKey.value === 'all') {
    return dayData.expense.items
  }
  return dayData.expense.items.filter(i => i.type === selectedExpenseKey.value)
})

// 订单在当前子分类下的金额与 source（用于订单行展示）
// 根据 subKey 决定显示班次收入还是激励补贴
const getOrderSubAmount = (order, subKey) => {
  // 激励类子分类：取 subsidyItems
  if (subKey && subKey.startsWith('subsidy')) {
    if (order.subsidyItems && order.subsidyItems.length > 0) {
      return {
        amount: order.subsidyItems.reduce((s, i) => s + i.amount, 0),
        source: order.subsidyItems[0].label
      }
    }
    return { amount: 0, source: '' }
  }
  // 班次收入类子分类：取 shiftIncomes
  if (order.shiftIncomes && order.shiftIncomes.length > 0) {
    return {
      amount: order.shiftIncomes.reduce((s, i) => s + i.amount, 0),
      source: order.shiftIncomes[0].label
    }
  }
  return { amount: 0, source: '' }
}

const handleDatePicker = () => {
  if (activeTab.value === 'month' || activeTab.value === 'arrival') {
    showDatePicker.value = true
  } else {
    ElMessage.info('日期选择器 - 当前为 mock 数据')
  }
}

// ==================== 日统计 mock（按子分类 + 门店聚合） ====================
const dayData = reactive({
  summary: {
    total: 147,
    categories: [
      { key: 'piecework_overtime', label: '客次提成&加班工资', value: 118, unit: '元' },
      { key: 'subsidy', label: '激励补贴', value: 29, unit: '元' }
    ]
  },
  expense: {
    total: 0,
    categories: [
      { key: 'complaint', label: '投诉扣款', value: -50, unit: '元' },
      { key: 'social', label: '代扣社保', value: -120, unit: '元' },
      { key: 'tax', label: '代扣个税', value: -32, unit: '元' },
      { key: 'quality', label: '品质扣款', value: -0.5, unit: '元' },
      { key: 'preDeduct', label: '负工资抵扣', value: 0, unit: '元' }
    ],
    items: [
      { id: 100, type: 'complaint', title: '投诉扣款', subtitle: '投诉扣款', amount: -0, time: '2026-07-07' },
      { id: 101, type: 'social', title: '代扣社保', subtitle: '代扣社保', amount: -467.42, time: '2026-07-07' },
      { id: 102, type: 'tax', title: '代扣个税', subtitle: '代扣个税', amount: -59.96, time: '2026-07-07' },
      { id: 103, type: 'quality', title: '品质扣款', subtitle: '品质扣款', amount: 0, time: '2026-07-07' },
      { id: 104, type: 'preDeduct', title: '负工资抵扣', subtitle: '负工资抵扣', amount: 0, time: '2026-07-07' }
    ]
  }
})

// 订单对象池（同一订单可在多个子分类下出现，对象引用共享）
// shiftIncomes: 班次收入项（客次提成 / 加班客次提成 / 加班补贴）
// subsidyItems: 激励补贴项（新客激励 / 卫生维护 等）
const allOrdersPool = {
  o1: { id: 1, staff: '熊叶', service: '头颈肩痛/60分钟', time: '2026-07-07 12:20:00', store: '龙湖高新天街店', shiftIncomes: [{ label: '客次提成(独立当班)', amount: 4 }], subsidyItems: [] },
  o2: { id: 2, staff: '向玲玲', service: '头颈肩痛/60分钟', time: '2026-07-07 12:30:00', store: '龙湖高新天街店', shiftIncomes: [{ label: '客次提成(独立当班)', amount: 4 }], subsidyItems: [] },
  o3: { id: 3, staff: '张勇', service: '腰酸背痛/60分钟', time: '2026-07-07 13:00:00', store: '龙湖高新天街店', shiftIncomes: [{ label: '客次提成(独立当班)', amount: 4 }], subsidyItems: [] },
  // 关键订单：同时有客次提成 + 新客激励
  o4: { id: 4, staff: '罗芹', service: '腰酸背痛60分钟', time: '2026-07-07 15:46:00', store: '龙湖高新天街店', shiftIncomes: [{ label: '客次提成(独立当班)', amount: 4 }], subsidyItems: [{ label: '新客激励', amount: 12 }] },
  o5: { id: 5, staff: '向玲玲', service: '睡眠调理/60分钟', time: '2026-07-07 15:10:00', store: '龙湖高新天街店', shiftIncomes: [{ label: '客次提成(独立当班)', amount: 4 }], subsidyItems: [] },
  o6: { id: 6, staff: '熊叶', service: '腰酸背痛/60分钟', time: '2026-07-07 15:40:00', store: '龙湖高新天街店', shiftIncomes: [{ label: '客次提成(独立当班)', amount: 8 }], subsidyItems: [] },
  o7: { id: 7, staff: '罗芹', service: '运动排酸/40分钟', time: '2026-07-07 16:20:00', store: '龙湖高新天街店', shiftIncomes: [{ label: '客次提成(独立当班)', amount: 8 }], subsidyItems: [] },
  o8: { id: 8, staff: '向玲玲', service: '头颈肩痛/60分钟', time: '2026-07-07 17:00:00', store: '龙湖高新天街店', shiftIncomes: [{ label: '客次提成(独立当班)', amount: 4 }], subsidyItems: [] },
  o9: { id: 9, staff: '向玲玲', service: '足疗+采耳/70分钟', time: '2026-07-07 18:30:00', store: '龙湖高新天街店', shiftIncomes: [{ label: '客次提成(独立当班)', amount: 20 }], subsidyItems: [] },
  o10: { id: 10, staff: '谭琴', service: '头颈肩痛/60分钟', time: '2026-07-07 19:30:00', store: '龙湖高新天街店', shiftIncomes: [{ label: '客次提成(独立当班)', amount: 4 }], subsidyItems: [] },
  o11: { id: 11, staff: '熊叶', service: '头颈肩痛/60分钟', time: '2026-07-07 19:30:00', store: '龙湖高新天街店', shiftIncomes: [{ label: '客次提成(独立当班)', amount: 4 }], subsidyItems: [] },
  o12: { id: 12, staff: '罗芹', service: '局部推拿/40分钟', time: '2026-07-07 20:30:00', store: '龙湖高新天街店', shiftIncomes: [{ label: '加班补贴(独立当班)', amount: 4 }], subsidyItems: [] },
  o13: { id: 13, staff: '胡淑琼', service: '足疗+采耳/70分钟', time: '2026-07-07 20:30:00', store: '龙湖高新天街店', shiftIncomes: [{ label: '加班补贴(独立当班)', amount: 4 }], subsidyItems: [] },
  o14: { id: 14, staff: '熊叶', service: '睡眠调理/60分钟', time: '2026-07-07 21:30:00', store: '龙湖高新天街店', shiftIncomes: [{ label: '加班补贴(独立当班)', amount: 4 }], subsidyItems: [] },
  // 卫生维护订单
  o20: { id: 20, staff: '全部', service: '卫生维护', time: '2026-07-07', store: '龙湖高新天街店', shiftIncomes: [{ label: '卫生维护', amount: 5 }], subsidyItems: [] },

  // ===== 多个多薪酬项订单（客次提成 + 激励补贴 / 加班 + 加班补贴 等）=====
  o101: { id: 101, staff: '向玲玲', service: '头颈肩痛/60分钟', time: '2026-07-07 11:00:00', store: '龙湖高新天街店', shiftIncomes: [{ label: '客次提成(独立当班)', amount: 4 }], subsidyItems: [{ label: '新客激励', amount: 12 }] },
  o102: { id: 102, staff: '罗芹', service: '腰酸背痛/60分钟', time: '2026-07-07 11:30:00', store: '龙湖高新天街店', shiftIncomes: [{ label: '客次提成(独立当班)', amount: 4 }], subsidyItems: [{ label: '新客激励', amount: 8 }] },
  o103: { id: 103, staff: '熊叶', service: '足疗+采耳/70分钟', time: '2026-07-07 14:00:00', store: '龙湖高新天街店', shiftIncomes: [{ label: '客次提成(独立当班)', amount: 8 }], subsidyItems: [{ label: '新客激励', amount: 12 }] },
  o104: { id: 104, staff: '谭琴', service: '睡眠调理/60分钟', time: '2026-07-07 14:30:00', store: '龙湖高新天街店', shiftIncomes: [{ label: '客次提成(独立当班)', amount: 4 }], subsidyItems: [{ label: '新客激励', amount: 8 }] },
  o105: { id: 105, staff: '胡淑琼', service: '头疗30分钟', time: '2026-07-07 16:00:00', store: '龙湖高新天街店', shiftIncomes: [{ label: '客次提成(独立当班)', amount: 4 }], subsidyItems: [{ label: '新客激励', amount: 12 }] },
  o106: { id: 106, staff: '向玲玲', service: '运动拉伸60分钟', time: '2026-07-07 20:00:00', store: '龙湖高新天街店', shiftIncomes: [{ label: '客次提成(独立当班)', amount: 4 }], subsidyItems: [{ label: '新客激励', amount: 8 }] },
  // 加班时段订单（加班客次 + 加班补贴）
  o107: { id: 107, staff: '罗芹', service: '局部推拿/40分钟', time: '2026-07-07 20:30:00', store: '龙湖高新天街店', shiftIncomes: [{ label: '加班客次提成', amount: 4 }], subsidyItems: [{ label: '加班补贴', amount: 4 }] },
  o108: { id: 108, staff: '熊叶', service: '腰酸背痛/60分钟', time: '2026-07-07 21:00:00', store: '龙湖高新天街店', shiftIncomes: [{ label: '加班客次提成', amount: 8 }], subsidyItems: [{ label: '加班补贴', amount: 4 }] },
  o109: { id: 109, staff: '胡淑琼', service: '足疗+采耳/70分钟', time: '2026-07-07 21:30:00', store: '龙湖高新天街店', shiftIncomes: [{ label: '加班客次提成', amount: 4 }], subsidyItems: [{ label: '加班补贴', amount: 4 }] },
  o110: { id: 110, staff: '谭琴', service: '中式推拿60分钟', time: '2026-07-07 22:00:00', store: '龙湖高新天街店', shiftIncomes: [{ label: '加班客次提成', amount: 8 }], subsidyItems: [{ label: '加班补贴', amount: 4 }] }
}

// 子分类 → 订单引用列表（同一订单可在多个子分类下出现）
// 多薪酬项订单（双薪酬）排在前面，方便用户点前几条就能看到完整弹层
const subCategoryOrdersMap = {
  '全部': {
    key: 'all',
    label: '全部',
    orderKeys: [
      // 多薪酬项订单优先
      'o101', 'o102', 'o103', 'o104', 'o105', 'o106', 'o107', 'o108', 'o109', 'o110', 'o4',
      // 普通订单
      'o1', 'o2', 'o3', 'o5', 'o6', 'o7', 'o8', 'o9', 'o10', 'o11', 'o12', 'o13', 'o14', 'o20'
    ]
  },
  '客次提成': {
    key: 'piecework',
    label: '客次提成',
    // 前 7 条全部是「客次提成 + 新客激励」双薪酬订单
    orderKeys: ['o101', 'o102', 'o103', 'o104', 'o105', 'o106', 'o4', 'o1', 'o2', 'o3', 'o5', 'o6', 'o7', 'o8', 'o9']
  },
  '加班客次提成': {
    key: 'overtime_piecework',
    label: '加班客次提成',
    // 前 4 条是「加班客次提成 + 加班补贴」双薪酬订单
    orderKeys: ['o107', 'o108', 'o109', 'o110', 'o10', 'o11']
  },
  '加班补贴': {
    key: 'overtime_bonus',
    label: '加班补贴',
    // 前 4 条是「加班客次提成 + 加班补贴」双薪酬订单
    orderKeys: ['o107', 'o108', 'o109', 'o110', 'o12', 'o13', 'o14']
  },
  '顶班保底补贴': {
    key: 'shift_cover',
    label: '顶班保底补贴',
    orderKeys: []
  },
  '卫生间卫生打扫': {
    key: 'subsidy_toilet',
    label: '卫生间卫生打扫',
    orderKeys: []
  },
  '房间打扫': {
    key: 'subsidy_room',
    label: '房间打扫',
    orderKeys: []
  },
  '新客激励': {
    key: 'subsidy_new_customer',
    label: '新客激励',
    // 前 7 条全部是「客次提成 + 新客激励」双薪酬订单
    orderKeys: ['o101', 'o102', 'o103', 'o104', 'o105', 'o106', 'o4']
  }
}

// 把订单按门店分组
const groupOrdersByStore = (orders) => {
  const map = new Map()
  for (const o of orders) {
    if (!map.has(o.store)) map.set(o.store, [])
    map.get(o.store).push(o)
  }
  return Array.from(map.entries()).map(([store, list]) => ({
    store,
    total: list.reduce((s, o) => s + o.amount, 0),
    orders: list
  }))
}

// 子分类 Tab key 顺序
const subCategoryOrder = ['all', 'piecework', 'overtime_piecework', 'overtime_bonus', 'shift_cover', 'subsidy_all', 'subsidy_toilet', 'subsidy_room', 'subsidy_new_customer']

const subCategoryLabels = {
  all: '全部',
  piecework: '客次提成',
  overtime_piecework: '加班客次提成',
  overtime_bonus: '加班补贴',
  shift_cover: '顶班保底补贴',
  subsidy_all: '全部（激励）',
  subsidy_toilet: '卫生间卫生打扫',
  subsidy_room: '房间打扫',
  subsidy_new_customer: '新客激励'
}

// 弹层内点击订单 → 弹订单详情
const handleOrderClick = (order) => {
  // 班次收入：默认是 source + amount（特殊订单可能为空）
  const shiftIncomes = order.shiftIncomes || [
    { label: order.source, amount: order.amount }
  ]
  // 激励补贴子项（默认空，部分订单有）
  const subsidyItems = order.subsidyItems || []
  // 订单总价 = 班次收入 + 激励补贴
  const shiftTotal = shiftIncomes.reduce((s, i) => s + i.amount, 0)
  const subsidyTotal = subsidyItems.reduce((s, i) => s + i.amount, 0)
  const totalAmount = shiftTotal + subsidyTotal
  // 提取 startTime / endTime（time 是 '2026-07-07 12:20:00' 格式）
  const timeMatch = (order.time || '').match(/(\d{2}:\d{2})/g) || []
  currentOrderDetail.value = {
    staff: order.staff,
    staffPhone: '136****' + String(1000 + order.id).padStart(4, '0'),
    storeName: order.store,
    service: order.service,
    customerInfo: '10女',
    status: '已完成',
    startTime: timeMatch[0] || '15:46',
    endTime: timeMatch[1] || timeMatch[0] || '16:46',
    dateLabel: '07月07日',
    isCrossDay: '否',
    orderNo: '610229220260772972357744101785' + String(order.id).padStart(2, '0'),
    originalPrice: Math.round(totalAmount * 4),
    actualPayment: Math.round(totalAmount * 3.6),
    shiftIncomes,
    subsidyItems,
    shiftTotal,
    subsidyTotal,
    totalAmount
  }
  orderDetailVisible.value = true
}

// ==================== 月统计 mock：发放策略 + 月份工资单 ====================
const strategy = {
  id: '1109493788878143490',
  name: '全职客户经理发放策略',
  templateName: '全职客户经理模板',
  position: '客户经理',
  coopMode: '劳动合同-全职'
}

// 月份实际产值
const monthOutputMap = {
  '2026-07': { actual: 13311, target: 18000 },
  '2026-06': { actual: 14820, target: 18000 },
  '2026-05': { actual: 12050, target: 18000 }
}
const monthOutput = computed(() => monthOutputMap[selectedMonth.value] || { actual: 0, target: 18000 })

// 工资单按月分组（命名风格差异）
const monthBillsMap = {
  '2026-05': [
    {
      id: 'BILL-AM-2026-05-PIECE', name: '5月客次结算', period: '5月1日 - 5月31日', status: '已发放',
      incomeItems: [
        { type: 'piecework', label: '客次提成', value: 680.0 },
        { type: 'overtime', label: '加班工资', value: 232.0 }
      ],
      deductionItems: [
        { type: 'complaint', label: '投诉扣款', value: -30 },
        { type: 'social', label: '代扣社保', value: -82 },
        { type: 'tax', label: '代扣个税', value: -22 }
      ]
    },
    {
      id: 'BILL-AM-2026-05-SUBSIDY', name: '5月补贴', period: '5月1日 - 5月31日', status: '已发放',
      incomeItems: [
        { type: 'subsidy', label: '激励补贴', value: 320.0 }
      ],
      deductionItems: [
        { type: 'social', label: '代扣社保', value: -16 },
        { type: 'tax', label: '代扣个税', value: -8 }
      ]
    }
  ],
  '2026-06': [
    {
      id: 'BILL-AM-2026-06-PIECE', name: '6月业绩报酬', period: '6月1日 - 6月30日', status: '已发放',
      incomeItems: [
        { type: 'piecework', label: '客次提成', value: 712.0 },
        { type: 'overtime', label: '加班工资', value: 200.0 }
      ],
      deductionItems: [
        { type: 'social', label: '代扣社保', value: -88 },
        { type: 'tax', label: '代扣个税', value: -25 }
      ]
    },
    {
      id: 'BILL-AM-2026-06-SUBSIDY', name: '6月星级奖励', period: '6月1日 - 6月30日', status: '已发放',
      incomeItems: [
        { type: 'subsidy', label: '激励补贴', value: 462.0 }
      ],
      deductionItems: [
        { type: 'social', label: '代扣社保', value: -22 },
        { type: 'tax', label: '代扣个税', value: -14 }
      ]
    }
  ],
  '2026-07': [
    {
      id: 'BILL-AM-2026-07-PIECE', name: '7月客次提成', period: '7月1日 - 7月31日', status: '已发放',
      incomeItems: [
        { type: 'piecework', label: '客次提成', value: 832.0 },
        { type: 'overtime', label: '加班工资', value: 195.4 }
      ],
      deductionItems: [
        { type: 'quality', label: '品质扣款', value: -0.5 },
        { type: 'social', label: '代扣社保', value: -95 },
        { type: 'tax', label: '代扣个税', value: -32 }
      ]
    },
    {
      id: 'BILL-AM-2026-07-SUBSIDY', name: '7月激励包', period: '7月1日 - 7月31日', status: '待发放',
      incomeItems: [
        { type: 'subsidy', label: '激励补贴', value: 350.0 }
      ],
      deductionItems: [
        { type: 'social', label: '代扣社保', value: -18 },
        { type: 'tax', label: '代扣个税', value: -10 }
      ]
    }
  ]
}

const selectedMonth = ref('2026-07')
const monthBills = computed(() => monthBillsMap[selectedMonth.value] || [])
const selectedBillIndex = ref(0)
const selectedBill = computed(() => monthBills.value[selectedBillIndex.value] || null)

const availableMonths = computed(() => Object.keys(monthBillsMap).sort())
const formatMonthLabel = (ym) => {
  const [y, m] = ym.split('-')
  return `${y.slice(2)}年${m}月`
}

const handleMonthSelect = (ym) => {
  selectedMonth.value = ym
  selectedBillIndex.value = 0
  showDatePicker.value = false
  ElMessage.success(`已切换到：${formatMonthLabel(ym)}`)
}

watch(selectedMonth, () => {
  selectedBillIndex.value = 0
})

const formatAmount = (val) => {
  if (typeof val !== 'number') return val
  return val.toFixed(2)
}

const unitOf = () => '元'

// ==================== 到账情况 mock（按月分组） ====================
const arrivalDataMap = {
  '2026-05': [
    {
      title: '客次提成&加班工资',
      unit: '元',
      items: [
        { label: '合计金额', value: 680, isFinal: true, hasChevron: true },
        { label: '负工资抵扣', value: 0, isFinal: false, hasChevron: true },
        { label: '扣缴', value: 88, isFinal: false, hasChevron: true },
        { label: '应发金额', value: 592, isFinal: true, hasChevron: true },
        { label: '实发金额', value: 592, isFinal: true, hasChevron: true }
      ]
    }
  ],
  '2026-06': [
    {
      title: '客次提成&加班工资',
      unit: '元',
      items: [
        { label: '合计金额', value: 912, isFinal: true, hasChevron: true },
        { label: '负工资抵扣', value: 0, isFinal: false, hasChevron: true },
        { label: '扣缴', value: 113, isFinal: false, hasChevron: true },
        { label: '应发金额', value: 799, isFinal: true, hasChevron: true },
        { label: '实发金额', value: 799, isFinal: true, hasChevron: true }
      ]
    }
  ],
  '2026-07': [
    {
      title: '客次提成&加班工资',
      unit: '元',
      items: [
        { label: '合计金额', value: 1027.4, isFinal: true, hasChevron: true },
        { label: '负工资抵扣', value: 0, isFinal: false, hasChevron: true },
        { label: '扣缴', value: 127.3, isFinal: false, hasChevron: true },
        { label: '应发金额', value: 900.1, isFinal: true, hasChevron: true },
        { label: '实发金额', value: 900.1, isFinal: true, hasChevron: true }
      ]
    }
  ]
}

const arrivalData = computed(() => ({
  sections: arrivalDataMap[selectedMonth.value] || []
}))

// 订单详情弹层
const orderDetailVisible = ref(false)
const currentOrderDetail = ref(null)
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
.mobile-am-dashboard {
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
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  padding: 14px 0;
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
  margin-bottom: 8px;
}

.record-title {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-amount {
  font-size: 13px;
  color: #666;
  flex-shrink: 0;
  margin-left: 8px;
}

.record-row2 {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 14px;
  margin-bottom: 6px;
  font-size: 13px;
  color: #999;
}

.record-field {
  white-space: nowrap;
}

.field-label {
  color: #999;
}

.field-value {
  color: #333;
  font-weight: 500;
}

.record-arrow {
  font-size: 12px;
  color: #ccc;
  flex-shrink: 0;
  margin-left: auto;
}

.record-time {
  font-size: 12px;
  color: #bbb;
  margin-top: 4px;
}

.empty-tip {
  text-align: center;
  padding: 32px 0;
  color: #ccc;
  font-size: 13px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: #ccc;
}

.empty-icon {
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-text {
  font-size: 13px;
  color: #ccc;
}

/* ========== 月统计 ========== */
.month-content { padding: 12px; }

/* 实际产值卡 */
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

.label-left, .label-right { text-align: center; }
.label-value { color: #666; margin-bottom: 2px; }
.label-text { display: flex; align-items: center; justify-content: center; gap: 2px; }
.info-icon { color: #a40035; font-size: 12px; }

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

/* 汇总/支出卡 */
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

.cat-chevron {
  font-size: 10px;
  color: #ccc;
}

.empty-tip {
  text-align: center;
  padding: 32px 0;
  color: #ccc;
  font-size: 13px;
}

/* ========== 摘要项弹层（按图 2/3 风格） ========== */
.subcat-sheet {
  max-height: 88vh;
}

.modal-back {
  position: absolute;
  left: 8px;
  color: #999;
}

.subcat-sheet-body {
  padding: 0 0 12px;
}

.subcat-sheet-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 4px 12px 12px;
  border-bottom: 1px solid #f0f0f0;
}

.subcat-sheet-tabs::-webkit-scrollbar { display: none; }

.subcat-sheet-tab {
  flex-shrink: 0;
  padding: 6px 14px;
  font-size: 13px;
  color: #666;
  background: #f5f5f5;
  border-radius: 16px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}

.subcat-sheet-tab.active {
  background: #fff5f8;
  color: #a40035;
  font-weight: 600;
}

.subcat-sheet-content {
  padding: 8px 12px 0;
}

.subcat-empty {
  padding: 40px 0;
  text-align: center;
  color: #ccc;
  font-size: 13px;
}

.subcat-store-block {
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.subcat-store-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0 8px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
}

.subcat-store-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  border-left: 3px solid #a40035;
  padding-left: 8px;
}

.subcat-store-amount {
  font-size: 14px;
  color: #a40035;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.subcat-order-row {
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
}

.subcat-order-row:last-child { border-bottom: none; }
.subcat-order-row:active { background: #fafafa; }

.subcat-order-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.subcat-order-staff {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.subcat-order-amt {
  font-size: 14px;
  color: #a40035;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.subcat-order-mid {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.subcat-order-service {
  font-size: 13px;
  color: #999;
}

.subcat-order-chevron {
  font-size: 14px;
  color: #ccc;
}

.subcat-order-bot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #ccc;
}

.subcat-order-source {
  color: #999;
}

/* ========== 摘要项卡片列表（恢复图 1 风格） ========== */
.summary-item-list {
  display: flex;
  flex-direction: column;
}

.summary-item-card {
  padding: 14px 0;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
}

.summary-item-card:last-child {
  border-bottom: none;
}

.summary-item-card:active {
  background: #fafafa;
}

.summary-item-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.summary-item-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.summary-item-amount {
  font-size: 15px;
  color: #999;
  font-variant-numeric: tabular-nums;
}

.summary-item-fields {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 14px;
  font-size: 13px;
  color: #999;
}

.summary-item-field {
  white-space: nowrap;
}

.summary-field-label {
  color: #999;
}

.summary-field-value {
  color: #333;
  font-weight: 500;
}

.summary-item-arrow {
  font-size: 14px;
  color: #ccc;
  margin-left: auto;
}

.summary-item-time {
  font-size: 12px;
  color: #bbb;
  margin-top: 6px;
}

/* ========== 顶部单卡：今日汇总 ========== */
.summary-card-simple {
  background: white;
  border-radius: 8px;
  padding: 20px 16px;
  margin-bottom: 12px;
  text-align: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.summary-card-amount {
  font-size: 32px;
  font-weight: 700;
  color: #a40035;
  margin-bottom: 4px;
}

.summary-card-label {
  font-size: 13px;
  color: #999;
}

/* ========== 今日支出列表（参考图风格） ========== */
.expense-category-tabs {
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

.expense-category-tabs::-webkit-scrollbar { display: none; }

.expense-category-tab {
  font-size: 13px;
  color: #999;
  cursor: pointer;
  position: relative;
  padding-bottom: 4px;
  white-space: nowrap;
  flex-shrink: 0;
}

.expense-category-tab.active {
  color: #a40035;
  font-weight: 600;
  border-bottom: 2px solid #a40035;
}

.expense-category-tab .cat-value {
  color: #333;
  font-weight: 600;
  margin-left: 2px;
}

.expense-category-tab.active .cat-value {
  color: #a40035;
}

.expense-category-tab .cat-value.negative {
  color: #a40035;
}

.expense-category-tab .cat-unit {
  font-size: 11px;
  color: #999;
  margin-left: 1px;
  font-weight: normal;
}

.expense-summary-list {
  background: white;
  border-radius: 8px;
  padding: 4px 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.expense-summary-item {
  padding: 14px 0;
  border-bottom: 1px solid #f5f5f5;
}

.expense-summary-item:last-child {
  border-bottom: none;
}

.expense-summary-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.expense-summary-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.expense-summary-amount {
  font-size: 14px;
  color: #999;
  font-variant-numeric: tabular-nums;
}

.expense-summary-amount.negative {
  color: #a40035;
}

.expense-summary-subtitle {
  font-size: 13px;
  color: #999;
  margin-bottom: 4px;
}

.expense-summary-time {
  font-size: 12px;
  color: #bbb;
}

/* ========== 横向子分类 Tab ========== */
.subcat-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 0 0 12px;
  background: white;
  border-radius: 8px;
  margin-bottom: 12px;
  padding: 8px 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.subcat-tabs::-webkit-scrollbar { display: none; }

.subcat-tab {
  flex-shrink: 0;
  padding: 6px 14px;
  font-size: 13px;
  color: #666;
  background: #f5f5f5;
  border-radius: 16px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}

.subcat-tab.active {
  background: #a40035;
  color: white;
  font-weight: 600;
}

/* ========== 子分类卡片（一级展平） ========== */
.subcat-card {
  background: white;
  border-radius: 8px;
  padding: 12px 12px 8px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.subcat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0 12px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
}

.subcat-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.subcat-amount {
  font-size: 13px;
  color: #a40035;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.subcat-empty {
  padding: 20px 0;
  text-align: center;
  color: #ccc;
  font-size: 13px;
}

.store-block {
  margin-bottom: 8px;
}

.store-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0 4px;
  border-left: 3px solid #a40035;
  padding-left: 8px;
  margin: 4px 0 6px;
}

.store-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.store-amount {
  font-size: 13px;
  color: #a40035;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.subcat-order {
  background: #fafafa;
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: background 0.15s;
}

.subcat-order:active {
  background: #f0f0f0;
}

.order-row-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.order-staff {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.order-amt {
  font-size: 13px;
  color: #a40035;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.order-row-mid {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.order-service {
  font-size: 13px;
  color: #999;
}

.order-chevron {
  color: #ccc;
  font-size: 14px;
}

.order-row-bot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #ccc;
}

.order-source {
  color: #999;
}

/* 月份选择 Sheet */
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

/* 弹层动画与基础结构（复用全职2 风格） */
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

/* ========== 订单详情弹层 - 底部申诉入口 ========== */
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

.order-modal-footer:active {
  background: #fafafa;
}

.footer-icon {
  font-size: 14px;
}

/* ========== 订单详情弹层（按图 2 风格） ========== */
.order-info-card {
  background: white;
  border-radius: 8px;
  padding: 14px 12px;
  margin-top: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.order-info-row1 {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
  font-size: 13px;
}

.info-staff {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.info-divider {
  color: #ddd;
  margin: 0 2px;
}

.info-phone {
  color: #666;
}

.info-eye {
  color: #999;
  font-size: 14px;
}

.info-customer {
  color: #666;
}

.info-status {
  margin-left: auto;
}

.order-info-row {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.info-time {
  color: #999;
}

.order-info-service {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.order-info-store-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
  margin-bottom: 6px;
}

.info-store-name {
  color: #333;
}

.info-cross-day {
  color: #999;
}

.order-info-orderno {
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

.order-info-payment {
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
  gap: 8px;
  font-size: 13px;
  padding-top: 8px;
  border-top: 1px dashed #f0f0f0;
  flex-wrap: wrap;
}

.payment-label {
  color: #999;
}

.payment-original {
  color: #999;
  text-decoration: line-through;
  font-size: 12px;
}

.payment-actual {
  color: #333;
  font-weight: 700;
  font-size: 16px;
  font-variant-numeric: tabular-nums;
}

.order-income-card {
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-top: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.order-income-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.order-income-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #666;
  padding: 4px 0;
}

.order-income-label {
  color: #666;
}

.order-income-value {
  color: #333;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.order-income-value.income-positive {
  color: #a40035;
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

.arrival-grid-3 {
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
</style>