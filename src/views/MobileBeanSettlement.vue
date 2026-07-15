<template>
  <div class="mobile-bean-settlement">
    <!-- 顶部导航 -->
    <header class="top-nav">
      <button class="icon-btn" @click="goBack" aria-label="返回">
        <el-icon :size="20"><ArrowLeft /></el-icon>
      </button>
      <div class="nav-title">结算记录</div>
      <div class="nav-actions">
        <button class="icon-btn" aria-label="更多">
          <el-icon :size="20"><MoreFilled /></el-icon>
        </button>
        <button class="icon-btn" @click="goBack" aria-label="关闭">
          <el-icon :size="20"><Close /></el-icon>
        </button>
      </div>
    </header>

    <!-- 月份分组 -->
    <div class="month-group" v-for="(m, mi) in monthGroups" :key="mi">
      <div class="month-head">
        <div class="month-label">{{ m.label }}</div>
        <div class="month-total">
          <span class="month-total-label">本月入账</span>
          <span class="month-total-amount">+{{ m.total.toLocaleString() }} 颗</span>
        </div>
      </div>

      <div class="record-list">
        <div
          v-for="(r, ri) in m.records"
          :key="ri"
          class="record-row"
        >
          <div class="record-line">
            <div class="record-main">
              <div class="record-title">{{ r.title }}</div>
              <div class="record-amount">+{{ r.amount.toLocaleString() }} 颗</div>
            </div>
            <span class="status-pill status-success">{{ r.statusLabel }}</span>
          </div>
          <dl class="record-meta">
            <div class="meta-item">
              <dt>业务发起时间</dt>
              <dd>{{ r.startAt }}</dd>
            </div>
            <div class="meta-item">
              <dt>来源单号</dt>
              <dd class="mono">{{ r.slipNo }}</dd>
            </div>
            <div class="meta-item">
              <dt>业务完成时间</dt>
              <dd>{{ r.completedAt }}</dd>
            </div>
            <div class="meta-item">
              <dt>业务场景</dt>
              <dd>{{ r.scenario }}</dd>
            </div>
            <div class="meta-item meta-item-wide">
              <dt>结算入账账户</dt>
              <dd>{{ r.settleAccount }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>

    <div v-if="!monthGroups.length" class="empty">
      <el-icon class="empty-icon" :size="40"><Document /></el-icon>
      <div class="empty-text">暂无结算记录</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Close, MoreFilled, Document } from '@element-plus/icons-vue'

const router = useRouter()
const goBack = () => router.back()

const monthGroups = ref([
  {
    label: '2025-11',
    total: 1860,
    records: [
      {
        title: '结算入账',
        amount: 1860,
        statusLabel: '结算成功',
        startAt: '2025-11-05 09:00:00',
        slipNo: 'STL-2025-11-T00676-01',
        completedAt: '2025-11-06 10:30:12',
        scenario: '常乐豆结算',
        settleAccount: '余额账户'
      }
    ]
  },
  {
    label: '2025-10',
    total: 1200,
    records: [
      {
        title: '结算入账',
        amount: 1200,
        statusLabel: '结算成功',
        startAt: '2025-10-05 19:12:10',
        slipNo: 'STL-2025-10-T00676-01',
        completedAt: '2025-10-06 16:12:10',
        scenario: '常乐豆结算',
        settleAccount: '余额账户'
      }
    ]
  },
  {
    label: '2025-09',
    total: 2480,
    records: [
      {
        title: '结算入账',
        amount: 2480,
        statusLabel: '结算成功',
        startAt: '2025-09-05 09:00:00',
        slipNo: 'STL-2025-09-T00676-01',
        completedAt: '2025-09-06 10:15:30',
        scenario: '常乐豆结算',
        settleAccount: '余额账户'
      }
    ]
  }
])
</script>

<style scoped>
.mobile-bean-settlement {
  background: #f7f7f8;
  min-height: 100vh;
  padding-bottom: 40px;
  color: #1a1a1a;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

/* ============ 顶部导航 ============ */
.top-nav {
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 4px;
  background: #fff;
  border-bottom: 1px solid #ececef;
}
.nav-title {
  flex: 1;
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.nav-actions {
  display: flex;
  gap: 2px;
}
.icon-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #1a1a1a;
  cursor: pointer;
}
.icon-btn:active { opacity: 0.6; }

/* ============ 月份分组 ============ */
.month-group {
  margin: 16px;
}
.month-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
  padding: 0 4px;
}
.month-label {
  font-size: 12px;
  color: #8a8a92;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
}
.month-total {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 12px;
}
.month-total-label {
  color: #8a8a92;
}
.month-total-amount {
  color: #a40035;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* ============ 记录列表 ============ */
.record-list {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #ececef;
  overflow: hidden;
}
.record-row {
  padding: 14px 16px;
  border-bottom: 1px solid #f2f2f5;
}
.record-row:last-child { border-bottom: none; }

.record-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.record-main {
  flex: 1;
  min-width: 0;
}
.record-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 2px;
}
.record-amount {
  font-size: 16px;
  font-weight: 700;
  color: #a40035;
  font-variant-numeric: tabular-nums;
}

.status-pill {
  flex-shrink: 0;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.4;
}
.status-success {
  color: #a40035;
  background: #fdf2f5;
}

/* ============ 元信息（2 列网格） ============ */
.record-meta {
  margin: 0;
  padding: 10px 0 0;
  border-top: 1px solid #f2f2f5;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;
}
.meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.meta-item-wide { grid-column: 1 / -1; }
.meta-item dt {
  font-size: 11px;
  color: #9b9ba3;
  font-weight: normal;
}
.meta-item dd {
  font-size: 12px;
  color: #1a1a1a;
  margin: 0;
  font-variant-numeric: tabular-nums;
  word-break: break-all;
}
.mono {
  font-family: 'SF Mono', Menlo, Consolas, monospace;
}

/* ============ 空态 ============ */
.empty {
  padding: 80px 0;
  text-align: center;
}
.empty-icon { color: #d2d2d7; }
.empty-text {
  margin-top: 8px;
  font-size: 13px;
  color: #9b9ba3;
}
</style>