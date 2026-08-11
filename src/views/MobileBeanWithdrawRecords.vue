<template>
  <div class="mobile-bean-withdraw-records">
    <!-- 顶部导航 -->
    <header class="top-nav">
      <button class="icon-btn" @click="goBack" aria-label="返回">
        <el-icon :size="20"><ArrowLeft /></el-icon>
      </button>
      <div class="nav-title">提现记录</div>
      <div class="nav-actions">
        <button class="icon-btn" aria-label="更多">
          <el-icon :size="20"><MoreFilled /></el-icon>
        </button>
        <button class="icon-btn" @click="goBack" aria-label="关闭">
          <el-icon :size="20"><Close /></el-icon>
        </button>
      </div>
    </header>

    <!-- 按月分组 -->
    <div class="month-group" v-for="(m, mi) in monthGroups" :key="mi">
      <div class="month-head">
        <div class="month-label">{{ m.label }}</div>
        <div class="month-total">
          <span class="month-total-label">本月提现</span>
          <span class="month-total-amount">{{ m.total.toLocaleString() }} 颗</span>
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
              <div class="record-amount">{{ r.amount.toLocaleString() }} 颗</div>
            </div>
            <span class="status-pill" :class="`status-${r.statusType}`">{{ r.statusLabel }}</span>
          </div>
          <dl class="record-meta">
            <div class="meta-item">
              <dt>提现发起时间</dt>
              <dd>{{ r.startAt }}</dd>
            </div>
            <div class="meta-item">
              <dt>提现单号</dt>
              <dd class="mono">{{ r.slipNo }}</dd>
            </div>
            <div v-if="r.completedAt" class="meta-item">
              <dt>到账时间</dt>
              <dd>{{ r.completedAt }}</dd>
            </div>
            <div class="meta-item">
              <dt>提现方式</dt>
              <dd>{{ r.method }}</dd>
            </div>
            <div class="meta-item">
              <dt>到账金额</dt>
              <dd>{{ r.cashAmount }} 元</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>

    <div v-if="!monthGroups.length" class="empty">
      <el-icon class="empty-icon" :size="40"><Document /></el-icon>
      <div class="empty-text">暂无提现记录</div>
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
    total: 3000,
    records: [
      {
        title: '提现兑换',
        amount: 2000,
        statusLabel: '已到账',
        statusType: 'success',
        startAt: '2025-11-20 09:15:30',
        slipNo: 'WD20251120091501',
        completedAt: '2025-11-20 09:15:35',
        method: '支付宝',
        cashAmount: '20.00'
      },
      {
        title: '提现兑换',
        amount: 1000,
        statusLabel: '处理中',
        statusType: 'frozen',
        startAt: '2025-11-28 16:42:10',
        slipNo: 'WD20251128164208',
        completedAt: null,
        method: '银行卡',
        cashAmount: '10.00'
      }
    ]
  },
  {
    label: '2025-10',
    total: 5000,
    records: [
      {
        title: '提现兑换',
        amount: 3000,
        statusLabel: '已到账',
        statusType: 'success',
        startAt: '2025-10-15 11:20:00',
        slipNo: 'WD20251015112003',
        completedAt: '2025-10-15 11:20:08',
        method: '支付宝',
        cashAmount: '30.00'
      },
      {
        title: '提现兑换',
        amount: 2000,
        statusLabel: '已到账',
        statusType: 'success',
        startAt: '2025-10-08 14:05:22',
        slipNo: 'WD20251008140519',
        completedAt: '2025-10-09 10:30:00',
        method: '银行卡',
        cashAmount: '20.00'
      }
    ]
  },
  {
    label: '2025-09',
    total: 1500,
    records: [
      {
        title: '提现兑换',
        amount: 1500,
        statusLabel: '已到账',
        statusType: 'success',
        startAt: '2025-09-12 10:30:15',
        slipNo: 'WD20250912103012',
        completedAt: '2025-09-12 10:30:20',
        method: '支付宝',
        cashAmount: '15.00'
      }
    ]
  }
])
</script>

<style scoped>
.mobile-bean-withdraw-records {
  background: #f7f7f8;
  min-height: 100vh;
  padding-bottom: 40px;
  color: #1a1a1a;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

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
.nav-actions { display: flex; gap: 2px; }
.icon-btn {
  width: 40px; height: 40px;
  border: none; background: transparent;
  display: inline-flex; align-items: center; justify-content: center;
  color: #1a1a1a; cursor: pointer;
}
.icon-btn:active { opacity: 0.6; }

.month-group { margin: 16px; }
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
.month-total { display: flex; align-items: baseline; gap: 6px; font-size: 12px; }
.month-total-label { color: #8a8a92; }
.month-total-amount { color: #1a1a1a; font-weight: 600; font-variant-numeric: tabular-nums; }

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
.record-main { flex: 1; min-width: 0; }
.record-title { font-size: 15px; font-weight: 600; color: #1a1a1a; margin-bottom: 2px; }
.record-amount { font-size: 16px; font-weight: 700; color: #a40035; font-variant-numeric: tabular-nums; }

.status-pill {
  flex-shrink: 0;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.4;
}
.status-frozen { color: #b88200; background: #fff7e0; }
.status-success { color: #a40035; background: #fdf2f5; }

.record-meta {
  margin: 0;
  padding: 10px 0 0;
  border-top: 1px solid #f2f2f5;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;
}
.meta-item { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.meta-item dt { font-size: 11px; color: #9b9ba3; font-weight: normal; }
.meta-item dd { font-size: 12px; color: #1a1a1a; margin: 0; font-variant-numeric: tabular-nums; word-break: break-all; }
.mono { font-family: 'SF Mono', Menlo, Consolas, monospace; }

.empty { padding: 80px 0; text-align: center; }
.empty-icon { color: #d2d2d7; }
.empty-text { margin-top: 8px; font-size: 13px; color: #9b9ba3; }
</style>
