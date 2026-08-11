<template>
  <div class="mobile-reimburse-list">
    <!-- 顶部导航 -->
    <div class="top-nav">
      <el-button type="text" @click="goBack" style="color: white;">
        <el-icon :size="18"><ArrowLeft /></el-icon>
      </el-button>
      <div class="nav-title">我的报销</div>
      <div class="nav-spacer"></div>
    </div>

    <!-- 状态筛选 -->
    <div class="tabs">
      <div
        v-for="tab in tabs"
        :key="tab.value"
        class="tab"
        :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
        <span v-if="tab.count" class="tab-count">{{ tab.count }}</span>
      </div>
    </div>

    <!-- 列表 -->
    <div class="list">
      <div
        v-for="item in filteredList"
        :key="item.id"
        class="card"
        @click="goDetail(item.id)"
      >
        <div class="card-head">
          <span class="card-type">{{ item.type }}</span>
          <span class="status" :class="statusClass(item.status)">{{ item.status }}</span>
        </div>

        <div class="card-amount">¥{{ item.amount.toFixed(2) }}</div>

        <div class="card-rows">
          <div class="card-row">
            <span class="row-label">单号</span>
            <span class="row-value">{{ item.no }}</span>
          </div>
          <div class="card-row">
            <span class="row-label">费用所属主体</span>
            <span class="row-value">{{ item.subject }}</span>
          </div>
          <div class="card-row">
            <span class="row-label">提交时间</span>
            <span class="row-value">{{ item.submitAt }}</span>
          </div>
        </div>

        <div v-if="item.status === '待审核' || item.status === '已撤回'" class="card-actions" @click.stop>
          <button v-if="item.status === '待审核'" class="card-btn" @click="onWithdraw(item)">撤回</button>
          <button v-if="item.status === '已撤回'" class="card-btn primary" @click="onReedit(item)">编辑提交</button>
        </div>
      </div>

      <div v-if="!filteredList.length" class="empty">暂无报销记录</div>
    </div>

    <!-- 悬浮新增 -->
    <button class="fab" @click="goSubmit">
      <el-icon :size="18"><Plus /></el-icon>
      申请报销
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Plus } from '@element-plus/icons-vue'
import { reimbursements } from '../mock/reimbursements.js'

const router = useRouter()
const goBack = () => router.back()
const goSubmit = () => router.push('/mobile-reimbursement-submit')
const goDetail = (id) => router.push(`/mobile-reimbursement-detail/${id}`)

const activeTab = ref('all')

const list = ref(reimbursements)

const tabs = computed(() => [
  { label: '全部', value: 'all', count: list.value.length },
  { label: '已撤回', value: '已撤回', count: list.value.filter(i => i.status === '已撤回').length },
  { label: '待审核', value: '待审核', count: list.value.filter(i => i.status === '待审核').length },
  { label: '待付款', value: '待付款', count: list.value.filter(i => i.status === '待付款').length },
  { label: '已付款', value: '已付款', count: list.value.filter(i => i.status === '已付款').length }
])

const filteredList = computed(() =>
  activeTab.value === 'all'
    ? list.value
    : list.value.filter(i => i.status === activeTab.value)
)

const statusClass = (status) =>
  status === '未通过' || status === '已撤回' ? 'is-muted' : 'is-brand'

// 当前时间，格式 YYYY-MM-DD HH:mm
const nowStr = () => {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

// 待审核：撤回，退回至已撤回，可重新编辑提交
const onWithdraw = (item) => {
  ElMessageBox.confirm(
    '撤回后该报销将退回至已撤回状态，您可重新编辑后再提交。是否继续？',
    '撤回报销',
    { confirmButtonText: '确认撤回', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    item.status = '已撤回'
    item.timeline = [...item.timeline, { label: '已撤回', time: nowStr(), done: true }]
    ElMessage.success('已撤回，可重新编辑提交')
  }).catch(() => {})
}

// 已撤回：重新编辑提交
const onReedit = (item) =>
  router.push(`/mobile-reimbursement-submit?from=${item.id}`)
</script>

<style scoped>
.mobile-reimburse-list {
  height: 100vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: #f5f5f7;
  padding-bottom: 88px;
  color: #1a1a1a;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

/* 顶部导航 */
.top-nav {
  background: linear-gradient(135deg, #a40035 0%, #7a0026 100%);
  padding: 12px 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  position: sticky;
  top: 0;
  z-index: 10;
}
.nav-title {
  font-size: 17px;
  font-weight: 600;
  flex: 1;
  text-align: center;
}
.nav-spacer {
  width: 40px;
}

/* Tabs */
.tabs {
  display: flex;
  background: white;
  position: sticky;
  top: 56px;
  z-index: 9;
  border-bottom: 1px solid #f0f0f0;
}
.tab {
  flex: 1;
  text-align: center;
  padding: 13px 0;
  font-size: 14px;
  color: #666;
  position: relative;
  cursor: pointer;
}
.tab.active {
  color: #a40035;
  font-weight: 600;
}
.tab.active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 24px;
  height: 3px;
  background: #a40035;
  border-radius: 2px;
}
.tab-count {
  font-size: 11px;
  color: #b8b8c0;
}

/* 列表 */
.list {
  padding: 12px;
}
.card {
  background: white;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.card-type {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}
.status {
  font-size: 13px;
  font-weight: 600;
}
.status.is-brand {
  color: #a40035;
}
.status.is-muted {
  color: #999;
}
.card-amount {
  font-size: 22px;
  font-weight: 700;
  color: #a40035;
  font-variant-numeric: tabular-nums;
  margin-bottom: 12px;
}
.card-rows {
  border-top: 1px solid #f5f5f7;
  padding-top: 10px;
}
.card-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 3px 0;
}
.row-label {
  color: #999;
}
.row-value {
  color: #333;
}
.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
  border-top: 1px solid #f5f5f7;
  padding-top: 12px;
}
.card-btn {
  background: white;
  color: #a40035;
  border: 1px solid #a40035;
  border-radius: 16px;
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}
.card-btn:active {
  opacity: 0.8;
}
.card-btn.primary {
  background: #a40035;
  color: white;
}
.empty {
  text-align: center;
  color: #b8b8c0;
  font-size: 14px;
  padding: 60px 0;
}

/* 悬浮按钮 */
.fab {
  position: fixed;
  right: 16px;
  bottom: calc(20px + env(safe-area-inset-bottom));
  background: #a40035;
  color: white;
  border: none;
  border-radius: 24px;
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 12px rgba(164, 0, 53, 0.35);
  cursor: pointer;
}
.fab:active {
  opacity: 0.85;
}
</style>
