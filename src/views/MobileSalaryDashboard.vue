<template>
  <div class="mobile-salary-dashboard">
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
      <div class="date-selector" @click="showDatePicker = true">
        {{ currentDateLabel }}
        <el-icon class="date-arrow"><ArrowDown /></el-icon>
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
          </div>
        </div>
      </div>

      <!-- 分类子 Tab + 列表 -->
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
              <span class="record-store">{{ item.store || item.title }}</span>
              <span class="record-amount">预计收入：{{ item.amount }}</span>
            </div>
            <div class="record-row2">
              <span class="record-service">{{ item.service || item.desc }}</span>
              <el-icon v-if="item.expandable" class="record-arrow"><ArrowRight /></el-icon>
            </div>
            <div v-if="item.bean" class="record-bean">常乐豆：{{ item.bean }}</div>
            <div class="record-time">{{ item.time }}</div>
          </div>
          <div v-if="filteredSummaryItems.length === 0" class="empty-tip">
            暂无符合条件的记录
          </div>
        </div>
      </div>

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

    <!-- ==================== 月统计 ==================== -->
    <div v-show="activeTab === 'month'" class="tab-content">
      <!-- 实际产值卡 -->
      <div class="output-card">
        <div class="output-title">本月实际产值{{ monthData.output.actual }}</div>
        <el-progress
          :percentage="(monthData.output.actual / monthData.output.target) * 100"
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
            <div class="label-value">{{ monthData.output.target }}</div>
            <div class="label-text">
              月目标
              <el-icon class="info-icon"><InfoFilled /></el-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- 汇总 -->
      <div class="month-section-card">
        <div class="section-title">{{ monthData.summary.title }}</div>
        <div class="month-category-grid">
          <div
            v-for="cat in monthData.summary.categories"
            :key="cat.key"
            class="month-cat-item"
          >
            <div class="month-cat-value">
              {{ cat.value }}<span class="month-cat-unit">({{ cat.unit }})</span>
            </div>
            <div class="month-cat-label">
              {{ cat.label }}
              <el-icon class="cat-chevron"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- 支出 -->
      <div class="month-section-card">
        <div class="section-title">{{ monthData.expense.title }}</div>
        <div class="month-category-grid">
          <div
            v-for="cat in monthData.expense.categories"
            :key="cat.key"
            class="month-cat-item"
            :class="{ 'negative': cat.value < 0 }"
          >
            <div class="month-cat-value">
              {{ cat.value }}<span class="month-cat-unit">({{ cat.unit }})</span>
            </div>
            <div class="month-cat-label">
              {{ cat.label }}
              <el-icon class="cat-chevron"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
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
        <div class="note-line">※ 上期负数 = 上月未结清负数</div>
        <div class="note-line">※ 应发金额 = 合计金额 - 上期负数 - 扣缴</div>
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
              <!-- 顶部把手 -->
              <div class="order-modal-handle"></div>

              <!-- 头部 -->
              <div class="order-modal-header">
                <span class="modal-title">订单收入</span>
                <el-button type="text" @click="handleCloseDetail" class="modal-close">
                  <el-icon :size="20"><Close /></el-icon>
                </el-button>
              </div>

              <!-- 内容 -->
              <div v-if="currentOrderDetail" class="order-modal-body">
                <!-- 订单汇总卡 -->
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
                  <div class="summary-service">{{ currentOrderDetail.service }}</div>
                  <div class="summary-orderno">
                    <span class="orderno-text">订单编号：{{ currentOrderDetail.orderNo }}</span>
                    <el-button type="text" size="small" @click.stop="copyOrderNo" class="copy-btn">
                      <el-icon :size="14"><CopyDocument /></el-icon>
                    </el-button>
                  </div>
                  <div class="summary-payment">
                    <span class="payment-label">实付款：</span>
                    <span class="payment-actual">¥{{ currentOrderDetail.actualPayment }}</span>
                    <s class="payment-original">¥{{ currentOrderDetail.originalPrice }}</s>
                  </div>
                </div>

                <!-- 订单提成 -->
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

                <!-- 其他收入（预估） -->
                <div class="detail-section-card">
                  <div class="section-title-line">
                    <span class="title-bar"></span>
                    <span class="title-text">其他收入(预估)</span>
                  </div>
                  <div class="section-content">
                    <div class="content-line">
                      <span class="content-label">促销补贴</span>
                      <span class="content-value">{{ currentOrderDetail.subsidy }}<span class="value-unit"> 元</span></span>
                    </div>
                  </div>
                </div>

                <!-- 常乐豆（预估） -->
                <div class="detail-section-card">
                  <div class="section-title-line">
                    <span class="title-bar"></span>
                    <span class="title-text">常乐豆(预估)</span>
                  </div>
                  <div class="section-content">
                    <div class="content-line bean-line">
                      <span class="content-label">离店未打扫卫生扣豆</span>
                      <span class="content-value bean-deduct">{{ currentOrderDetail.deductBean }}</span>
                      <el-button v-if="currentOrderDetail.deductBean !== 0" type="primary" plain size="small" round @click.stop="handleAppeal">申诉</el-button>
                    </div>
                    <div class="content-line">
                      <span class="content-label">调理师客户回头赠送常乐豆</span>
                      <span class="content-value bean-gift">+{{ currentOrderDetail.giftBean }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 底部 -->
              <div class="order-modal-footer" @click="handleAppeal">
                <el-icon class="footer-icon"><QuestionFilled /></el-icon>
                <span>对该笔收入有疑惑</span>
              </div>
            </div>
          </transition>
        </div>
      </transition>
    </teleport>
  </div>

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
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Close, MoreFilled, ArrowDown, ArrowRight, InfoFilled, CopyDocument, QuestionFilled, Shop, Check } from '@element-plus/icons-vue'

const router = useRouter()

// Tab 状态
const activeTab = ref('day')
const tabs = [
  { key: 'day', label: '日统计' },
  { key: 'month', label: '月统计' },
  { key: 'arrival', label: '到账情况' }
]

// 门店切换
// 排序规则：按本月预告收入倒序，相同时按今日预估倒序；默认选中排序后第一项（收入最高）
const storeList = ref([
  { key: 'danzishi', label: '弹子石老街店', monthlyForecast: 8420, dailyForecast: 197.8 },
  { key: 'chengdu', label: '成都印象城店', monthlyForecast: 6230, dailyForecast: 156.4 },
  { key: 'beicheng', label: '北城天街店', monthlyForecast: 4890, dailyForecast: 89.2 },
  { key: 'jiefangbei', label: '解放碑店', monthlyForecast: 3210, dailyForecast: 45.6 }
])
// 排序
storeList.value.sort((a, b) => {
  if (b.monthlyForecast !== a.monthlyForecast) {
    return b.monthlyForecast - a.monthlyForecast
  }
  return b.dailyForecast - a.dailyForecast
})
const selectedStore = ref(storeList.value[0].key)
const showStoreSheet = ref(false)
const currentStoreLabel = computed(() => {
  return storeList.value.find(s => s.key === selectedStore.value)?.label || ''
})
const handleStoreSelect = (key) => {
  selectedStore.value = key
  showStoreSheet.value = false
  ElMessage.success(`已切换到：${storeList.value.find(s => s.key === key)?.label}`)
}

// 日期选择（mock）
const showDatePicker = ref(false)
const selectedDay = ref('2025-08-01')
const selectedMonth = ref('2025-08')
const currentDateLabel = computed(() => {
  return activeTab.value === 'day' ? selectedDay.value : selectedMonth.value
})

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
      { key: 'subsidy', label: '补贴', value: 0.0, unit: '元' },
      { key: 'bean', label: '常乐豆', value: 10, unit: '豆' }
    ],
    items: [
      {
        id: 1,
        type: 'piecework',
        storeKey: 'danzishi',
        store: '弹子石老街店',
        service: '整脊踩背40分钟',
        time: '2025-08-01 21:20:00',
        amount: 29.7,
        bean: 0,
        expandable: true,
        detail: {
          storeName: '弹子石老街店',
          service: '整脊踩背40分钟',
          customerPhone: '138****0295',
          customerInfo: '002536(女)',
          status: '已完成',
          startTime: '08月01日21:20',
          endTime: '08月01日22:00',
          orderNo: '6102162202508012120000000123',
          originalPrice: 79,
          actualPayment: 59,
          pieceworkCommission: 29.7,
          subsidy: 0,
          deductBean: 0,
          giftBean: 0
        }
      },
      {
        id: 2,
        type: 'subsidy',
        title: '优秀员工节日津贴',
        desc: '中秋节优秀员工津贴',
        time: '2025-08-01',
        amount: 44.7,
        bean: 0,
        expandable: false
      },
      {
        id: 3,
        type: 'bean',
        storeKey: 'danzishi',
        store: '弹子石老街店',
        service: '睡眠调理60分钟',
        time: '2025-08-01 20:20:00',
        amount: 44.7,
        bean: 17,
        expandable: true,
        detail: {
          storeName: '弹子石老街店',
          service: '睡眠调理60分钟',
          customerPhone: '139****8821',
          customerInfo: '008912(男)',
          status: '已完成',
          startTime: '08月01日19:20',
          endTime: '08月01日20:20',
          orderNo: '6102162202508012020000000456',
          originalPrice: 179,
          actualPayment: 161,
          pieceworkCommission: 44.7,
          subsidy: 0,
          deductBean: 0,
          giftBean: 17
        }
      },
      {
        id: 4,
        type: 'bean',
        storeKey: 'danzishi',
        store: '弹子石老街店',
        service: '睡眠调理60分钟',
        time: '2025-08-01 16:50:00',
        amount: 44.7,
        bean: 17,
        expandable: true,
        detail: {
          storeName: '弹子石老街店',
          service: '睡眠调理60分钟',
          customerPhone: '186****1102',
          customerInfo: '003045(女)',
          status: '已完成',
          startTime: '08月01日15:50',
          endTime: '08月01日16:50',
          orderNo: '6102162202508011650000000789',
          originalPrice: 179,
          actualPayment: 161,
          pieceworkCommission: 44.7,
          subsidy: 0,
          deductBean: 0,
          giftBean: 17
        }
      },
      {
        id: 5,
        type: 'bean',
        storeKey: 'chengdu',
        store: '成都印象城店',
        title: '常乐豆收入',
        time: '2025-08-01 00:00:00',
        amount: 34,
        bean: 0,
        expandable: false
      },
      {
        id: 6,
        type: 'piecework',
        storeKey: 'chengdu',
        store: '成都印象城店',
        service: '头颈肩痛60分钟',
        time: '2025-08-01 12:10:00',
        amount: 48.3,
        bean: 0,
        expandable: true,
        detail: {
          storeName: '成都印象城店',
          service: '头颈肩痛60分钟',
          customerPhone: '138****0295',
          customerInfo: '002536(女)',
          status: '已完成',
          startTime: '08月01日11:10',
          endTime: '08月01日12:10',
          orderNo: '6102162202509625658390227783680',
          originalPrice: 179,
          actualPayment: 161,
          pieceworkCommission: 48.3,
          subsidy: 5.4,
          deductBean: -2,
          giftBean: 15
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
      { key: 'tax', label: '代扣个税', value: 0.0, unit: '元' },
      { key: 'expiredBean', label: '失效常乐豆', value: 0.0, unit: '豆' }
    ],
    items: [
      {
        id: 1,
        type: 'complaint',
        title: '投诉扣款',
        time: '2025-08-01 00:00:00',
        amount: -15,
        expandable: true
      }
    ]
  }
})

// ==================== 月统计 mock ====================
const monthData = reactive({
  output: {
    actual: 13311,
    target: 18000
  },
  summary: {
    title: '8月汇总',
    categories: [
      { key: 'piecework', label: '计件提成', value: 95.4, unit: '元' },
      { key: 'overtime', label: '加班工资', value: 15.4, unit: '元' },
      { key: 'subsidy', label: '补贴', value: 0.0, unit: '元' },
      { key: 'bean', label: '常乐豆', value: 10, unit: '豆' }
    ]
  },
  expense: {
    title: '8月支出',
    categories: [
      { key: 'complaint', label: '投诉扣款', value: 95.4, unit: '元' },
      { key: 'serviceTime', label: '服务时间不足扣提成', value: 95.4, unit: '元' },
      { key: 'social', label: '代扣社保', value: 0.0, unit: '元' },
      { key: 'tax', label: '代扣个税', value: 0.0, unit: '元' },
      { key: 'expiredBean', label: '失效常乐豆', value: -95.4, unit: '豆' }
    ]
  }
})

// ==================== 到账情况 mock ====================
const arrivalData = reactive({
  sections: [
    {
      title: '计件提成',
      unit: '元',
      items: [
        { label: '合计金额', value: 1195.4, isFinal: true },
        { label: '上期负数', value: -10.0, isFinal: false },
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
        { label: '上期负数余数', value: -10.0, isFinal: false },
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
        { label: '上期负数余数', value: -10.0, isFinal: false },
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

// 列表过滤（先按门店过滤，再按类型过滤）
const filteredSummaryItems = computed(() => {
  let items = dayData.summary.items
  items = items.filter(item => item.storeKey === selectedStore.value || !item.storeKey)
  if (summaryFilter.value === 'all') return items
  return items.filter(item => item.type === summaryFilter.value)
})

const filteredExpenseItems = computed(() => {
  let items = dayData.expense.items
  items = items.filter(item => item.storeKey === selectedStore.value || !item.storeKey)
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
.mobile-salary-dashboard {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
}

/* ========== 顶部导航 ========== */
.top-nav {
  background: linear-gradient(135deg, #a40035 0%, #7a0026 100%);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
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
}

/* ========== 门店切换（单行下拉选择器） ========== */
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
  transition: transform 0.2s;
}

.store-selector:active .store-arrow {
  transform: translateY(1px);
}

/* ========== 门店选择 Sheet ========== */
.store-sheet .order-modal-header {
  padding-bottom: 8px;
}

.store-sheet-body {
  padding: 4px 12px 16px;
}

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

.store-sheet-item:last-child {
  border-bottom: none;
}

.store-sheet-item:active {
  background: #fafafa;
}

.store-sheet-item.active {
  background: #fff5f8;
}

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

.store-sheet-item:nth-child(1) .store-sheet-rank {
  background: #a40035;
  color: white;
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
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin-bottom: 2px;
}

.store-sheet-item.active .store-sheet-label {
  color: #a40035;
  font-weight: 600;
}

.store-sheet-daily {
  font-size: 11px;
  color: #999;
}

.store-sheet-amount {
  text-align: right;
  flex-shrink: 0;
}

.amount-label {
  font-size: 10px;
  color: #999;
  margin-bottom: 2px;
}

.amount-value {
  font-size: 15px;
  font-weight: 700;
  color: #a40035;
}

.store-sheet-check {
  color: #a40035;
  font-size: 18px;
  flex-shrink: 0;
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
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
}

.date-arrow {
  font-size: 12px;
}

/* ========== 通用 Tab 内容 ========== */
.tab-content {
  padding: 12px;
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
  flex-wrap: wrap;
  gap: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 12px;
  margin-bottom: 12px;
}

.category-tab {
  font-size: 13px;
  color: #999;
  cursor: pointer;
  position: relative;
  padding-bottom: 4px;
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
}

.record-arrow {
  font-size: 12px;
  color: #ccc;
}

.record-bean {
  font-size: 13px;
  color: #a40035;
  margin-top: 4px;
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

.arrival-item.is-final {
  /* 应发/实发/已发加粗 */
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

/* 动画：背景淡入 + 弹层上滑 */
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

/* 订单汇总卡 */
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
  font-size: 12px;
  color: #ccc;
}

/* 分项卡 */
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

.content-line.bean-line {
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

.bean-deduct {
  color: #a40035;
}

.bean-gift {
  color: #a40035;
}
</style>
