<template>
  <div class="mobile-bean-consumption">
    <!-- 顶部导航 -->
    <header class="top-nav">
      <button class="icon-btn" @click="goBack" aria-label="返回">
        <el-icon :size="20"><ArrowLeft /></el-icon>
      </button>
      <div class="nav-title">消费记录</div>
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
          <span class="month-total-label">本月消费</span>
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
              <dt>业务发起时间</dt>
              <dd>{{ r.startAt }}</dd>
            </div>
            <div class="meta-item">
              <dt>来源单号</dt>
              <dd class="mono">{{ r.slipNo }}</dd>
            </div>
            <div v-if="r.completedAt" class="meta-item">
              <dt>业务完成时间</dt>
              <dd>{{ r.completedAt }}</dd>
            </div>
            <div class="meta-item">
              <dt>业务场景</dt>
              <dd>{{ r.scenario }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>

    <div v-if="!monthGroups.length" class="empty">
      <el-icon class="empty-icon" :size="40"><Document /></el-icon>
      <div class="empty-text">暂无消费记录</div>
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
    total: 4280,
    records: [
      {
        title: '购物消费',
        amount: 1500,
        statusLabel: '冻结',
        statusType: 'frozen',
        startAt: '2025-11-28 21:08:42',
        slipNo: '12910291128109245',
        completedAt: null,
        scenario: '常乐豆福利兑换（京东）'
      },
      {
        title: '购物消费',
        amount: 880,
        statusLabel: '消费成功',
        statusType: 'success',
        startAt: '2025-11-18 10:32:15',
        slipNo: '12910291118103421',
        completedAt: '2025-11-19 09:11:02',
        scenario: '常乐豆福利兑换（天猫超市）'
      },
      {
        title: '购物消费',
        amount: 1900,
        statusLabel: '消费成功',
        statusType: 'success',
        startAt: '2025-11-05 19:12:10',
        slipNo: '12910291105191204',
        completedAt: '2025-11-06 16:12:10',
        scenario: '常乐豆福利兑换（京东）'
      }
    ]
  },
  {
    label: '2025-10',
    total: 3560,
    records: [
      {
        title: '购物消费',
        amount: 1200,
        statusLabel: '消费成功',
        statusType: 'success',
        startAt: '2025-10-25 14:48:33',
        slipNo: '12910291025144811',
        completedAt: '2025-10-26 10:02:18',
        scenario: '常乐豆福利兑换（美团）'
      },
      {
        title: '购物消费',
        amount: 2360,
        statusLabel: '消费成功',
        statusType: 'success',
        startAt: '2025-10-05 19:12:10',
        slipNo: '12910291005191204',
        completedAt: '2025-10-06 16:12:10',
        scenario: '常乐豆福利兑换（京东）'
      }
    ]
  },
  {
    label: '2025-09',
    total: 1840,
    records: [
      {
        title: '购物消费',
        amount: 1840,
        statusLabel: '消费成功',
        statusType: 'success',
        startAt: '2025-09-22 11:25:08',
        slipNo: '12910290922112501',
        completedAt: '2025-09-23 09:30:55',
        scenario: '常乐豆福利兑换（山姆会员店）'
      }
    ]
  }
])
</script>

<style scoped>
.mobile-bean-consumption {
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
  color: #1a1a1a;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* ============ 记录列表（白底连续列表，不是独立卡片） ============ */
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

/* 状态 pill：色块 + 文字（不能单靠颜色） */
.status-pill {
  flex-shrink: 0;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.4;
}
.status-frozen {
  color: #b88200;
  background: #fff7e0;
}
.status-success {
  color: #a40035;
  background: #fdf2f5;
}

/* ============ 元信息 ============ */
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