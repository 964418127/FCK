<template>
  <div class="mobile-notification">
    <!-- ==================== 列表视图 ==================== -->
    <div v-if="!currentDetail" class="list-view">
      <div class="top-nav">
        <el-button type="text" @click="goBack" style="color: white;">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <div class="nav-title">系统通知</div>
        <el-button type="text" @click="goBack" style="color: white;">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>

      <!-- 搜索框 -->
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="请输入搜索关键词"
          prefix-icon="Search"
          clearable
        />
      </div>

      <!-- Tab 栏 -->
      <div class="filter-tabs">
        <div
          v-for="tab in tabs"
          :key="tab.key"
          class="filter-tab"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
        </div>
      </div>

      <!-- 通知列表 -->
      <div class="notification-list">
        <div
          v-for="item in filteredNotifications"
          :key="item.id"
          class="notification-item"
          :class="{ read: item.read }"
          @click="openDetail(item)"
        >
          <div class="item-icon">
            <el-icon><BellFilled /></el-icon>
          </div>
          <div class="item-card">
            <div class="item-header">
              <span class="item-title">{{ item.title }}</span>
            </div>
            <div class="item-body">
              <div v-if="item.entity" class="item-line">
                <span class="line-label">主 体：</span>
                <span class="line-value">{{ item.entity }}</span>
              </div>
              <div class="item-line">
                <span class="line-label">描 述：</span>
                <span class="line-value">{{ item.desc }}</span>
              </div>
              <div class="item-line">
                <span class="line-label">{{ ['system_dispatch', 'task_publication'].includes(item.type) ? '通知时间：' : '申请时间：' }}</span>
                <span class="line-value">{{ item.applyTime }}</span>
              </div>
              <div v-if="item.type !== 'system_dispatch' && item.status" class="item-line">
                <span class="line-label">状 态：</span>
                <span class="line-value status-pending">{{ item.status }}</span>
              </div>
            </div>
            <div class="item-footer">
              <span class="view-link">点击前往查看</span>
              <el-icon class="view-arrow"><ArrowRight /></el-icon>
            </div>
          </div>
          <div class="item-right">
            <span v-if="item.read" class="read-label">已读</span>
          </div>
        </div>
        <div v-if="filteredNotifications.length === 0" class="empty-tip">
          暂无通知
        </div>
      </div>
    </div>

    <!-- ==================== 详情视图（月度汇算） ==================== -->
    <div v-else class="detail-view">
      <div class="top-nav">
        <el-button type="text" @click="closeDetail" style="color: white;">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <div class="nav-title">{{ currentDetail.detail.pageTitle }}</div>
        <div class="nav-actions">
          <el-button type="text" style="color: white;">
            <el-icon><MoreFilled /></el-icon>
          </el-button>
          <el-button type="text" @click="goBack" style="color: white;">
            <el-icon><VideoCameraFilled /></el-icon>
          </el-button>
        </div>
      </div>

      <div class="detail-content">
        <!-- 月度标题 -->
        <div class="period-header">{{ currentDetail.detail.period }}</div>

        <!-- 收入段 -->
        <div v-if="currentDetail.detail.income" class="section-card">
          <div class="section-title">
            <span class="title-bar"></span>
            <span class="title-text">{{ currentDetail.detail.income.title }}</span>
          </div>
          <div class="section-body">
            <div
              v-for="(item, idx) in currentDetail.detail.income.items"
              :key="idx"
              class="detail-row"
              :class="{ 'is-deduct': item.isDeduct }"
            >
              <span class="row-label">{{ item.label }}</span>
              <span class="row-value">
                {{ item.value }}
                <span v-if="item.unit" class="value-unit">{{ item.unit }}</span>
              </span>
            </div>
            <div v-if="currentDetail.detail.income.subtotal !== undefined" class="detail-row subtotal-row">
              <span class="row-label">小计</span>
              <span class="row-value">
                {{ currentDetail.detail.income.subtotal }}
              </span>
            </div>
          </div>
        </div>

        <!-- 扣缴段 -->
        <div v-if="currentDetail.detail.deduction" class="section-card">
          <div class="section-title">
            <span class="title-bar"></span>
            <span class="title-text">{{ currentDetail.detail.deduction.title }}</span>
          </div>
          <div class="section-body">
            <div
              v-for="(item, idx) in currentDetail.detail.deduction.items"
              :key="idx"
              class="detail-row"
              :class="{ 'is-deduct': item.isDeduct !== false }"
            >
              <span class="row-label">{{ item.label }}</span>
              <span class="row-value">
                {{ item.value }}
              </span>
            </div>
            <div v-if="currentDetail.detail.deduction.subtotal !== undefined" class="detail-row subtotal-row">
              <span class="row-label">小计</span>
              <span class="row-value">
                {{ currentDetail.detail.deduction.subtotal }}
              </span>
            </div>
          </div>
        </div>

        <!-- 汇总段 -->
        <div v-if="currentDetail.detail.summary" class="section-card">
          <div class="section-title">
            <span class="title-bar"></span>
            <span class="title-text">{{ currentDetail.detail.summary.title }}</span>
          </div>
          <div class="section-body">
            <div
              v-for="(item, idx) in currentDetail.detail.summary.items"
              :key="idx"
              class="detail-row"
              :class="{ 'is-bold': item.isBold, 'has-divider': item.isBold && idx > 0 }"
            >
              <span class="row-label">{{ item.label }}</span>
              <span class="row-value">
                {{ item.value }}
                <span v-if="item.unit" class="value-unit">{{ item.unit }}</span>
              </span>
            </div>
          </div>
        </div>

        <!-- 常乐豆兑换特殊段 -->
        <div v-if="currentDetail.detail.exchange" class="section-card">
          <div class="section-title">
            <span class="title-bar"></span>
            <span class="title-text">{{ currentDetail.detail.exchange.title }}</span>
          </div>
          <div class="section-body">
            <div
              v-for="(item, idx) in currentDetail.detail.exchange.items"
              :key="idx"
              class="detail-row"
            >
              <span class="row-label">{{ item.label }}</span>
              <span class="row-value">{{ item.value }}</span>
            </div>
          </div>
        </div>

        <!-- 确认选项 -->
        <div v-if="currentDetail.detail.confirms" class="confirm-block">
          <div
            v-for="(text, idx) in currentDetail.detail.confirms"
            :key="idx"
            class="confirm-item"
            @click="toggleConfirm(idx)"
          >
            <span class="confirm-radio" :class="{ checked: confirmChecked[idx] }"></span>
            <span class="confirm-text">{{ text }}</span>
          </div>

          <!-- 签字区 -->
          <div class="signature-box" @click="handleSignature">
            <span v-if="!signature" class="signature-placeholder">签字</span>
            <span v-else class="signature-text">{{ signature }}</span>
          </div>

          <!-- 提交按钮 -->
          <button
            class="submit-btn"
            :disabled="!allConfirmed || !signature"
            @click="handleSubmit"
          >
            确认提交
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Close, BellFilled, ArrowRight, Document, MoreFilled, VideoCameraFilled } from '@element-plus/icons-vue'
import { notificationStore } from '../stores/notifications'
import { syncScheduledPublication } from '../stores/parttimeTasks'

syncScheduledPublication()

const router = useRouter()

// ==================== Tab & 搜索 ====================
const activeTab = ref('all')
const tabs = [
  { key: 'all', label: '全部' },
  { key: 'unread', label: '未读' },
  { key: 'done', label: '已完成' },
  { key: 'processed', label: '已处理' },
  { key: 'pending', label: '未处理', badge: 19 }
]
const searchKeyword = ref('')

// ==================== 通知数据 ====================
// 来源：共享通知 store。
const notifications = notificationStore.list

// 过滤
const filteredNotifications = computed(() => {
  let result = notifications
  // Tab 过滤
  if (activeTab.value === 'unread') {
    result = result.filter(n => !n.read)
  } else if (activeTab.value === 'done') {
    result = result.filter(n => n.done)
  } else if (activeTab.value === 'processed') {
    result = result.filter(n => n.processed)
  } else if (activeTab.value === 'pending') {
    result = result.filter(n => !n.processed && !n.done)
  }
  // 搜索
  const kw = searchKeyword.value.trim()
  if (kw) {
    result = result.filter(n =>
      n.title.includes(kw) || n.desc.includes(kw) || n.applyTime.includes(kw)
    )
  }
  return result
})

// 详情
const currentDetail = ref(null)
const confirmChecked = ref([])
const signature = ref('')
const openDetail = (item) => {
  item.read = true
  // 任务通知直接打开非全任务列表。
  if (item.type === 'system_dispatch') {
    router.push('/mobile-parttime-tasks')
    return
  }
  if (item.type === 'task_publication') {
    router.push({ path: '/mobile-parttime-tasks', query: { view: 'available' } })
    return
  }
  currentDetail.value = item
  // 重置确认状态
  confirmChecked.value = (item.detail.confirms || []).map(() => false)
  signature.value = ''
}
const closeDetail = () => {
  currentDetail.value = null
  confirmChecked.value = []
  signature.value = ''
}

const toggleConfirm = (idx) => {
  confirmChecked.value[idx] = !confirmChecked.value[idx]
}
const allConfirmed = computed(() => {
  if (!confirmChecked.value.length) return false
  return confirmChecked.value.every(v => v)
})
const handleSignature = () => {
  ElMessageBox.prompt({
    title: '电子签字',
    inputLabel: '请输入您的姓名作为电子签字',
    inputPlaceholder: '请输入姓名',
    inputValidator: (val) => {
      if (!val || !val.trim()) return '签字不能为空'
      if (val.trim().length < 2) return '请输入完整姓名'
      return true
    }
  }).then(({ value }) => {
    signature.value = value
    ElMessage.success('签字成功')
  }).catch(() => {})
}
const handleSubmit = () => {
  if (!allConfirmed.value) {
    ElMessage.warning('请先勾选全部确认项')
    return
  }
  if (!signature.value) {
    ElMessage.warning('请先完成签字')
    return
  }
  // 标记为已处理
  const item = currentDetail.value
  item.processed = true
  item.status = '已处理'
  ElMessage.success('确认提交成功')
  setTimeout(() => {
    closeDetail()
  }, 800)
}

const goBack = () => {
  if (currentDetail.value) {
    closeDetail()
  } else if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/mobile-menu')
  }
}
</script>

<style scoped>
.mobile-notification {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.list-view,
.detail-view {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.list-view .notification-list,
.detail-view .detail-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
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

/* ========== 搜索栏 ========== */
.search-bar {
  padding: 12px 16px;
  background: white;
}

.search-bar :deep(.el-input__wrapper) {
  background: #f5f5f5;
  border-radius: 20px;
  box-shadow: none;
  padding: 4px 12px;
}

.search-bar :deep(.el-input__inner) {
  height: 32px;
  font-size: 13px;
}

/* ========== Tab 栏 ========== */
.filter-tabs {
  display: flex;
  align-items: center;
  background: white;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.filter-tabs::-webkit-scrollbar {
  display: none;
}

.filter-tab {
  padding: 12px 14px;
  font-size: 14px;
  color: #666;
  position: relative;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 2px;
}

.filter-tab.active {
  color: #a40035;
  font-weight: 600;
}

.filter-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background: #a40035;
  border-radius: 1px;
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  background: #a40035;
  color: white;
  font-size: 10px;
  font-weight: 600;
  border-radius: 8px;
  padding: 0 4px;
  line-height: 1;
  margin-left: 2px;
}

/* ========== 通知列表 ========== */
.notification-list {
  padding: 12px;
}

.notification-item {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  cursor: pointer;
}

.item-icon {
  width: 44px;
  height: 44px;
  background: #a40035;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 22px;
  flex-shrink: 0;
}

.item-card {
  flex: 1;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  min-width: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.item-header {
  background: #fde8ee;
  padding: 10px 14px;
}

.notification-item.read .item-header {
  background: #f5f5f5;
}

.item-title {
  font-size: 15px;
  font-weight: 600;
  color: #a40035;
}

.notification-item.read .item-title {
  color: #999;
}

.item-body {
  padding: 10px 14px;
  border-bottom: 1px solid #f5f5f5;
}

.item-line {
  display: flex;
  font-size: 13px;
  color: #333;
  line-height: 1.8;
}

.line-label {
  color: #999;
  flex-shrink: 0;
  min-width: 70px;
}

.line-value {
  color: #333;
  word-break: break-all;
}

.status-pending {
  color: #a40035;
  font-weight: 500;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #fafafa;
}

.view-link {
  font-size: 13px;
  color: #a40035;
  font-weight: 500;
}

.view-arrow {
  color: #a40035;
  font-size: 14px;
}

.item-right {
  width: 32px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 14px;
  flex-shrink: 0;
}

.read-label {
  font-size: 12px;
  color: #ccc;
}

/* ========== 空状态 ========== */
.empty-tip {
  text-align: center;
  padding: 40px 0;
  color: #ccc;
  font-size: 13px;
}

/* ========== 详情视图（月度汇算） ========== */
.detail-content {
  padding: 12px;
}

.period-header {
  text-align: center;
  font-size: 17px;
  font-weight: 700;
  color: #333;
  padding: 16px 0 20px;
}

.section-card {
  background: white;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 10px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.section-title .title-bar {
  display: inline-block;
  width: 3px;
  height: 14px;
  background: #a40035;
  border-radius: 2px;
  flex-shrink: 0;
}

.section-title .title-text {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.section-body {
  display: flex;
  flex-direction: column;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  font-size: 14px;
  color: #333;
}

.detail-row.has-divider {
  border-top: 1px solid #f0f0f0;
  margin-top: 4px;
  padding-top: 14px;
}

.detail-row.is-deduct {
  color: #999;
}

.detail-row.is-deduct .row-value {
  color: #a40035;
}

.detail-row.is-bold {
  font-weight: 600;
  color: #333;
}

.detail-row.subtotal-row {
  border-top: 1px solid #f0f0f0;
  margin-top: 4px;
  padding-top: 12px;
  font-weight: 500;
  color: #333;
}

.row-label {
  color: inherit;
}

.row-value {
  font-weight: 500;
  color: inherit;
}

.value-unit {
  font-size: 12px;
  color: #999;
  font-weight: normal;
  margin-left: 1px;
}

/* ========== 确认选项 ========== */
.confirm-block {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  margin-top: 12px;
}

.confirm-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 14px;
  cursor: pointer;
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

.confirm-item:last-of-type {
  margin-bottom: 16px;
}

.confirm-radio {
  width: 16px;
  height: 16px;
  border: 1px solid #ccc;
  border-radius: 50%;
  background: white;
  flex-shrink: 0;
  margin-top: 2px;
  position: relative;
  transition: all 0.15s;
}

.confirm-radio.checked {
  border-color: #a40035;
  background: #a40035;
}

.confirm-radio.checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
}

.confirm-text {
  flex: 1;
}

/* ========== 签字 ========== */
.signature-box {
  height: 120px;
  border: 1px dashed #d0d0d0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  cursor: pointer;
  background: #fafafa;
  transition: border-color 0.15s;
}

.signature-box:hover {
  border-color: #a40035;
}

.signature-placeholder {
  color: #ccc;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 8px;
}

.signature-text {
  color: #333;
  font-size: 20px;
  font-weight: 600;
  font-family: cursive;
}

/* ========== 提交按钮 ========== */
.submit-btn {
  width: 100%;
  height: 44px;
  background: #a40035;
  color: white;
  border: none;
  border-radius: 22px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.submit-btn:not(:disabled):active {
  background: #7a0026;
}
</style>
