<template>
  <div class="mobile-bean-view">
    <!-- 身份输入页：未携带 empId/phone 时显示 -->
    <template v-if="!hasIdentity">
      <header class="top-nav">
        <button class="icon-btn" @click="goBack" aria-label="返回">
          <el-icon :size="20"><ArrowLeft /></el-icon>
        </button>
        <div class="nav-title">自助明细查询</div>
        <div class="nav-actions">
          <button class="icon-btn" @click="goBack" aria-label="关闭">
            <el-icon :size="20"><Close /></el-icon>
          </button>
        </div>
      </header>

      <section class="identity-entry">
        <div class="identity-card">
          <div class="identity-title">请输入身份信息</div>
          <div class="identity-sub">输入手机号或工号进入自助明细查询</div>
          <input
            v-model="identityForm.value"
            class="identity-input"
            placeholder="手机号 / 工号"
            inputmode="numeric"
            @keyup.enter="submitIdentity"
          />
          <button
            class="identity-btn"
            :disabled="!identityForm.value.trim()"
            @click="submitIdentity"
          >
            进入
          </button>
        </div>
      </section>
    </template>

    <!-- 明细页：已携带 empId/phone 时显示 -->
    <template v-else>
      <!-- 顶部导航 -->
      <header class="top-nav">
        <button class="icon-btn" @click="goBack" aria-label="返回">
          <el-icon :size="20"><ArrowLeft /></el-icon>
        </button>
        <div class="nav-title">自助明细查询</div>
        <div class="nav-actions">
          <button class="icon-btn" @click="goBack" aria-label="关闭">
            <el-icon :size="20"><Close /></el-icon>
          </button>
        </div>
      </header>

      <!-- 员工信息条 -->
      <section class="emp-bar">
        <div class="emp-name">{{ empInfo.name }}</div>
        <div class="emp-meta">
          <span>工号 {{ empInfo.empId }}</span>
        </div>
      </section>

      <!-- 月份选择 + 本月合计 -->
      <section class="month-bar">
        <div class="month-picker" @click="monthSheetVisible = true">
          <span class="month-text">{{ displayMonth }}</span>
          <el-icon :size="14"><ArrowDown /></el-icon>
        </div>
        <div class="month-summary">
          <span class="summary-label">本月合计</span>
          <span class="summary-amount" :class="{ negative: monthTotal < 0 }">
            {{ monthTotal >= 0 ? '+' : '' }}{{ monthTotal.toLocaleString() }}
          </span>
          <span class="summary-unit">颗</span>
        </div>
      </section>

      <!-- 豆项 Tab -->
      <section class="tabs-section">
        <div class="tabs-scroll">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="tab-item"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
            <span class="tab-count" :class="{ neg: tab.total < 0 }">
              {{ tab.total >= 0 ? '+' : '' }}{{ tab.total.toLocaleString() }}
            </span>
          </button>
        </div>
      </section>

      <!-- 当前 Tab 明细 -->
      <section class="detail-section">
        <div class="tab-total-row">
          <span class="tab-total-label">{{ activeTabObj.label }} 合计</span>
          <span class="tab-total-value" :class="{ neg: activeTabObj.total < 0 }">
            {{ activeTabObj.total >= 0 ? '+' : '-' }}{{ Math.abs(activeTabObj.total).toLocaleString() }} 颗
          </span>
        </div>

        <div class="record-list">
          <div
            v-for="(r, ri) in activeRecords"
            :key="ri"
            class="record-card"
          >
            <div class="record-top">
              <span class="record-amount" :class="{ neg: r.amount < 0 }">
                {{ r.amount >= 0 ? '+' : '-' }}{{ Math.abs(r.amount).toLocaleString() }} 颗
              </span>
              <div class="record-date">
                <span class="date-label">业务日期</span>
                <span class="date-value">{{ r.date }}</span>
              </div>
            </div>
            <dl class="record-meta">
              <div class="meta-item">
                <dt>业务编号</dt>
                <dd>{{ r.refNo }}</dd>
              </div>
              <div class="meta-item">
                <dt>员工姓名</dt>
                <dd>{{ empInfo.name }}</dd>
              </div>
              <div class="meta-item">
                <dt>工号</dt>
                <dd>{{ empInfo.empId }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div v-if="!activeRecords.length" class="empty">
          <el-icon :size="36"><Document /></el-icon>
          <div class="empty-text">本月暂无{{ activeTabObj.label }}记录</div>
        </div>
      </section>

      <!-- 月份选择底部弹层 -->
      <teleport to="body">
        <transition name="sheet-fade">
          <div v-if="monthSheetVisible" class="month-overlay" @click.self="monthSheetVisible = false">
            <div class="month-sheet">
              <div class="sheet-handle"></div>
              <div class="sheet-title">选择月份</div>
              <div class="month-options">
                <button
                  v-for="m in availableMonths"
                  :key="m.value"
                  class="month-option"
                  :class="{ active: selectedMonth === m.value }"
                  @click="selectMonth(m.value)"
                >
                  {{ m.label }}
                </button>
              </div>
            </div>
          </div>
        </transition>
      </teleport>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Close, ArrowDown, Document } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const goBack = () => router.back()

// 身份识别：通过 query 参数（empId 或 phone）免登录进入；未携带时显示输入页
const identityQuery = computed(() => String(route.query.empId || route.query.phone || '').trim())
const hasIdentity = computed(() => Boolean(identityQuery.value))

const identityForm = reactive({ value: '' })

const submitIdentity = () => {
  const v = identityForm.value.trim()
  if (!v) return
  // 11 位手机号走 phone；其余视作工号走 empId
  const query = /^1\d{10}$/.test(v) ? { phone: v } : { empId: v }
  router.push({ path: '/mobile-bean-view', query })
}

// 员工信息（占位：实际项目按身份查询员工档案）
const empInfo = reactive({
  name: '张三',
  empId: identityQuery.value || '100235',
  position: '推拿师',
  store: 'in99银泰中心店'
})

// 当前年月（YYYY-MM），作为默认选中月
const now = new Date()
const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

// 月份选择：默认当前月；下方数据按月组织
const monthSheetVisible = ref(false)
const availableMonths = [
  { label: `${now.getFullYear()}年${now.getMonth() + 1}月`, value: currentYM },
  { label: `${now.getFullYear()}年${now.getMonth()}月`, value: monthOffset(-1) },
  { label: `${now.getFullYear()}年${now.getMonth() - 1}月`, value: monthOffset(-2) }
]
function monthOffset(delta) {
  const d = new Date(now)
  d.setMonth(d.getMonth() + delta)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
const selectedMonth = ref(currentYM)
const displayMonth = computed(() => {
  const m = availableMonths.find(m => m.value === selectedMonth.value)
  return m ? m.label : selectedMonth.value
})
const selectMonth = (val) => {
  selectedMonth.value = val
  monthSheetVisible.value = false
}

// 按月组织的豆项数据
// 每条 record 只保留通用字段：amount(数量) / date(业务日期) / refNo(业务编号)
// 收入项为正数，扣除项（失效常乐豆）为负数
const dataByMonth = {
  '2026-07': {
    tabs: [
      { key: 'returnCustomer', label: '回头客获豆', total: 850,
        records: [
          { amount: 500, date: '2026-07-15', refNo: 'SET2026070003' },
          { amount: 350, date: '2026-07-08', refNo: 'SET2026070001' }
        ] },
      { key: 'internalReferral', label: '内部介绍获豆', total: 200,
        records: [
          { amount: 200, date: '2026-07-12', refNo: 'SET2026070005' }
        ] },
      { key: 'training', label: '培训获豆', total: 100,
        records: [
          { amount: 100, date: '2026-07-05', refNo: 'SET2026070002' }
        ] },
      { key: 'shift', label: '顶班获豆', total: 60,
        records: [
          { amount: 60, date: '2026-07-12', refNo: 'SET2026070004' }
        ] },
      { key: 'accommodation', label: '住宿获豆', total: 30,
        records: [
          { amount: 30, date: '2026-07-10', refNo: 'SET2026070006' }
        ] },
      { key: 'marketing', label: '营销获豆', total: 150,
        records: [
          { amount: 150, date: '2026-07-20', refNo: 'SET2026070007' }
        ] },
      { key: 'partner', label: '三级合伙人获豆', total: 250,
        records: [
          { amount: 250, date: '2026-07-18', refNo: 'SET2026070008' }
        ] },
      { key: 'guarantee', label: '保底获豆', total: 400,
        records: [
          { amount: 400, date: '2026-07-01', refNo: 'SET2026070090' }
        ] },
      { key: 'expired', label: '失效常乐豆', total: -50,
        records: [
          { amount: -50, date: '2026-07-25', refNo: 'EXP2026070001' }
        ] }
    ]
  },
  '2026-06': {
    tabs: [
      { key: 'returnCustomer', label: '回头客获豆', total: 620,
        records: [
          { amount: 400, date: '2026-06-14', refNo: 'SET2026060002' },
          { amount: 220, date: '2026-06-03', refNo: 'SET2026060001' }
        ] },
      { key: 'internalReferral', label: '内部介绍获豆', total: 150,
        records: [
          { amount: 150, date: '2026-06-20', refNo: 'SET2026060004' }
        ] },
      { key: 'training', label: '培训获豆', total: 80,
        records: [
          { amount: 80, date: '2026-06-10', refNo: 'SET2026060005' }
        ] },
      { key: 'shift', label: '顶班获豆', total: 30,
        records: [
          { amount: 30, date: '2026-06-18', refNo: 'SET2026060006' }
        ] },
      { key: 'accommodation', label: '住宿获豆', total: 0, records: [] },
      { key: 'marketing', label: '营销获豆', total: 100,
        records: [
          { amount: 100, date: '2026-06-25', refNo: 'SET2026060007' }
        ] },
      { key: 'partner', label: '三级合伙人获豆', total: 180,
        records: [
          { amount: 180, date: '2026-06-22', refNo: 'SET2026060008' }
        ] },
      { key: 'guarantee', label: '保底获豆', total: 400,
        records: [
          { amount: 400, date: '2026-06-01', refNo: 'SET2026060090' }
        ] },
      { key: 'expired', label: '失效常乐豆', total: 0, records: [] }
    ]
  },
  '2026-05': {
    tabs: [
      { key: 'returnCustomer', label: '回头客获豆', total: 450,
        records: [
          { amount: 300, date: '2026-05-20', refNo: 'SET2026050002' },
          { amount: 150, date: '2026-05-08', refNo: 'SET2026050001' }
        ] },
      { key: 'internalReferral', label: '内部介绍获豆', total: 0, records: [] },
      { key: 'training', label: '培训获豆', total: 0, records: [] },
      { key: 'shift', label: '顶班获豆', total: 0, records: [] },
      { key: 'accommodation', label: '住宿获豆', total: 20,
        records: [
          { amount: 20, date: '2026-05-15', refNo: 'SET2026050003' }
        ] },
      { key: 'marketing', label: '营销获豆', total: 0, records: [] },
      { key: 'partner', label: '三级合伙人获豆', total: 0, records: [] },
      { key: 'guarantee', label: '保底获豆', total: 400,
        records: [
          { amount: 400, date: '2026-05-01', refNo: 'SET2026050090' }
        ] },
      { key: 'expired', label: '失效常乐豆', total: 0, records: [] }
    ]
  }
}

const currentData = computed(() => dataByMonth[selectedMonth.value] || { tabs: [] })
const tabs = computed(() => currentData.value.tabs)
const activeTab = ref('returnCustomer')

const activeTabObj = computed(() => {
  return tabs.value.find(t => t.key === activeTab.value) || { label: '', total: 0, records: [] }
})

const activeRecords = computed(() => activeTabObj.value.records || [])

const monthTotal = computed(() => {
  return tabs.value.reduce((sum, t) => sum + t.total, 0)
})
</script>

<style scoped>
.mobile-bean-view {
  background: #f7f7f8;
  min-height: 100vh;
  padding-bottom: 40px;
  color: #1a1a1a;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

/* 顶部导航 */
.top-nav {
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 4px;
  background: #fff;
  border-bottom: 1px solid #ececef;
  position: sticky;
  top: 0;
  z-index: 10;
}
.nav-title { flex: 1; text-align: center; font-size: 15px; font-weight: 600; }
.nav-actions { display: flex; gap: 2px; }
.icon-btn {
  width: 40px; height: 40px; border: none; background: transparent;
  display: inline-flex; align-items: center; justify-content: center;
  color: #1a1a1a; cursor: pointer;
}
.icon-btn:active { opacity: 0.6; }

/* 身份输入页 */
.identity-entry {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 60px 20px;
}
.identity-card {
  width: 100%;
  max-width: 360px;
  background: #fff;
  border-radius: 12px;
  padding: 24px 20px;
  border: 1px solid #ececef;
}
.identity-title {
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 6px;
}
.identity-sub {
  font-size: 12px;
  color: #8a8a92;
  text-align: center;
  margin-bottom: 18px;
}
.identity-input {
  width: 100%;
  height: 44px;
  border: 1px solid #e0e0e5;
  border-radius: 8px;
  background: #fafafb;
  font-size: 15px;
  text-align: center;
  letter-spacing: 0.5px;
  outline: none;
  padding: 0 12px;
  box-sizing: border-box;
  margin-bottom: 12px;
}
.identity-input:focus { border-color: #a40035; background: #fff; }
.identity-btn {
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 8px;
  background: #a40035;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
.identity-btn:disabled { background: #d8d8de; cursor: not-allowed; }
.identity-btn:active:not(:disabled) { opacity: 0.85; }

/* 员工信息 */
.emp-bar {
  background: #fff;
  padding: 12px 16px;
  border-bottom: 1px solid #f2f2f5;
}
.emp-name { font-size: 16px; font-weight: 600; margin-bottom: 4px; }
.emp-meta { font-size: 12px; color: #8a8a92; display: flex; align-items: center; gap: 4px; }
.emp-meta .dot { color: #d0d0d5; }

/* 月份 + 合计 */
.month-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #f2f2f5;
}
.month-picker {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  color: #1a1a1a;
}
.month-picker:active { opacity: 0.6; }
.month-summary { display: flex; align-items: baseline; gap: 4px; }
.summary-label { font-size: 12px; color: #8a8a92; }
.summary-amount { font-size: 18px; font-weight: 700; color: #a40035; font-variant-numeric: tabular-nums; }
.summary-amount.negative { color: #8a8a92; }
.summary-unit { font-size: 12px; color: #8a8a92; }

/* Tab */
.tabs-section {
  background: #fff;
  border-bottom: 1px solid #f2f2f5;
  position: sticky;
  top: 44px;
  z-index: 9;
}
.tabs-scroll {
  display: flex;
  gap: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 0 4px;
}
.tabs-scroll::-webkit-scrollbar { display: none; }
.tab-item {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 14px;
  border: none;
  background: transparent;
  font-size: 13px;
  color: #8a8a92;
  cursor: pointer;
  position: relative;
  white-space: nowrap;
}
.tab-item.active { color: #a40035; font-weight: 600; }
.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 2px;
  background: #a40035;
  border-radius: 1px;
}
.tab-count {
  font-size: 11px;
  font-weight: 500;
  color: #a40035;
  font-variant-numeric: tabular-nums;
}
.tab-count.neg { color: #8a8a92; }

/* 明细 */
.detail-section { padding: 16px; }
.tab-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 4px;
}
.tab-total-label { font-size: 13px; color: #8a8a92; }
.tab-total-value { font-size: 18px; font-weight: 700; color: #a40035; font-variant-numeric: tabular-nums; }
.tab-total-value.neg { color: #8a8a92; }

.record-list { display: flex; flex-direction: column; gap: 10px; }
.record-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #ececef;
  padding: 14px 16px;
}
.record-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}
.record-amount {
  font-size: 18px;
  font-weight: 700;
  color: #a40035;
  font-variant-numeric: tabular-nums;
}
.record-amount.neg { color: #8a8a92; }
.record-date {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  font-variant-numeric: tabular-nums;
}
.record-date .date-label { font-size: 11px; color: #b0b0b8; }
.record-date .date-value { font-size: 12px; color: #9b9ba3; }

/* 通用元数据（业务编号 / 员工姓名 / 工号） */
.record-meta {
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 12px;
}
.meta-item { display: flex; flex-direction: column; gap: 2px; }
.meta-item dt { font-size: 11px; color: #b0b0b8; }
.meta-item dd { font-size: 12px; color: #1a1a1a; margin: 0; font-family: 'SF Mono', Menlo, Consolas, monospace; }

/* 空态 */
.empty { padding: 60px 0; text-align: center; }
.empty .empty-text { margin-top: 8px; font-size: 13px; color: #9b9ba3; }

/* 月份选择弹层 */
.month-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 2000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.month-sheet {
  width: 100%;
  max-width: 480px;
  background: #fff;
  border-radius: 16px 16px 0 0;
  padding: 8px 0 24px;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
}
.sheet-handle {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: #e0e0e5;
  margin: 0 auto 16px;
}
.sheet-title { font-size: 15px; font-weight: 600; text-align: center; margin-bottom: 16px; }
.month-options { display: flex; flex-direction: column; gap: 4px; padding: 0 16px; }
.month-option {
  padding: 14px 16px;
  border: none;
  background: #f7f7f8;
  border-radius: 10px;
  font-size: 15px;
  color: #1a1a1a;
  cursor: pointer;
  text-align: center;
}
.month-option.active { background: #fdf2f5; color: #a40035; font-weight: 600; }
.month-option:active { opacity: 0.7; }

/* 弹层过渡 */
.sheet-fade-enter-active, .sheet-fade-leave-active { transition: opacity 0.2s ease; }
.sheet-fade-enter-active .month-sheet, .sheet-fade-leave-active .month-sheet { transition: transform 0.25s ease; }
.sheet-fade-enter-from, .sheet-fade-leave-to { opacity: 0; }
.sheet-fade-enter-from .month-sheet, .sheet-fade-leave-to .month-sheet { transform: translateY(100%); }
</style>