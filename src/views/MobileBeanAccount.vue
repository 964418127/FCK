<template>
  <div class="mobile-bean-account">
    <!-- 顶部导航 -->
    <header class="top-nav">
      <button class="icon-btn" @click="goBack" aria-label="返回">
        <el-icon :size="20"><ArrowLeft /></el-icon>
      </button>
      <div class="nav-title">常乐豆</div>
      <div class="nav-actions">
        <button class="icon-btn" aria-label="更多">
          <el-icon :size="20"><MoreFilled /></el-icon>
        </button>
        <button class="icon-btn" @click="goBack" aria-label="关闭">
          <el-icon :size="20"><Close /></el-icon>
        </button>
      </div>
    </header>

    <!-- 余额区：品牌色背景 -->
    <section class="balance-card">
      <div class="balance-head">
        <span class="balance-label">账户余额</span>
        <span class="balance-unit">颗</span>
      </div>
      <div class="balance-amount-row">
        <span class="balance-amount">{{ account.balance.toLocaleString() }}</span>
      </div>
      <div class="balance-divider"></div>
      <div class="balance-actions">
        <button class="exchange-btn" @click="onExchange">
          福利兑换
          <el-icon :size="14"><ArrowRight /></el-icon>
        </button>
      </div>
    </section>

    <!-- 入口区：列表项而非图标磁贴 -->
    <section class="entries">
      <div class="entry" @click="onExchangeRecords">
        <div class="entry-main">
          <div class="entry-title">兑换记录</div>
          <div class="entry-sub">查看福利兑换与商城消费流水</div>
        </div>
        <el-icon class="entry-arrow" :size="16"><ArrowRight /></el-icon>
      </div>
      <div class="entry-sep"></div>
      <div class="entry" @click="onSettlement">
        <div class="entry-main">
          <div class="entry-title">结算记录</div>
          <div class="entry-sub">公积金抵扣后入账，仅限商城消费</div>
        </div>
        <el-icon class="entry-arrow" :size="16"><ArrowRight /></el-icon>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft, Close, MoreFilled, ArrowRight
} from '@element-plus/icons-vue'

const router = useRouter()
const goBack = () => router.back()

const account = { balance: 5666 }

const onExchange = () => ElMessage.info('福利兑换（mock）')
const onExchangeRecords = () => router.push('/mobile-bean-consumption-detail')
const onSettlement = () => router.push('/mobile-bean-settlement')
</script>

<style scoped>
.mobile-bean-account {
  background: #f7f7f8;
  min-height: 100vh;
  padding-bottom: 32px;
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

/* ============ 余额卡（品牌色） ============ */
.balance-card {
  margin: 16px 16px 0;
  padding: 24px 20px 20px;
  background: #a40035;
  border-radius: 14px;
  color: #fff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
.balance-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 10px;
}
.balance-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.78);
  letter-spacing: 0.04em;
}
.balance-unit {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}
.balance-amount-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.balance-amount {
  font-size: 36px;
  font-weight: 700;
  color: #fff;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  line-height: 1.1;
}
.balance-divider {
  margin: 16px -20px 14px;
  height: 1px;
  background: rgba(255, 255, 255, 0.14);
}
.balance-actions {
  display: flex;
  justify-content: flex-start;
}
.exchange-btn {
  border: none;
  background: #fff;
  color: #a40035;
  padding: 8px 18px;
  border-radius: 18px;
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: opacity 0.15s ease;
}
.exchange-btn:active { opacity: 0.78; }

/* ============ 入口区 ============ */
.entries {
  margin: 16px;
  background: #fff;
  border-radius: 14px;
  border: 1px solid #ececef;
  overflow: hidden;
}
.entry {
  display: flex;
  align-items: center;
  padding: 16px 16px;
  cursor: pointer;
  transition: background 0.15s ease;
}
.entry:active { background: #f5f5f7; }
.entry-main {
  flex: 1;
  min-width: 0;
}
.entry-title {
  font-size: 15px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 2px;
}
.entry-sub {
  font-size: 12px;
  color: #8a8a92;
  line-height: 1.5;
}
.entry-arrow {
  color: #b8b8c0;
  flex-shrink: 0;
}
.entry-sep {
  height: 1px;
  background: #f2f2f5;
  margin: 0 16px;
}

@media (prefers-reduced-motion: reduce) {
  .entry { transition: none; }
}
</style>