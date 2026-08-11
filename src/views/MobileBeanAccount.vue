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
        <button class="withdraw-btn" @click="openWithdrawDialog">
          自助提现
          <el-icon :size="14"><ArrowRight /></el-icon>
        </button>
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
      <div class="entry" @click="onWithdrawRecords">
        <div class="entry-main">
          <div class="entry-title">提现记录</div>
          <div class="entry-sub">查看常乐豆提现申请与到账流水</div>
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

    <!-- 自助提现 弹窗（步骤1） -->
    <teleport to="body">
      <transition name="withdraw-sheet">
        <div v-if="withdrawDialogVisible" class="withdraw-overlay" @click.self="withdrawDialogVisible = false">
          <div class="withdraw-sheet">
            <div class="withdraw-card">
        <header class="withdraw-head">
          <div class="withdraw-title">自助提现</div>
          <button class="withdraw-close" @click="withdrawDialogVisible = false" aria-label="关闭">
            <span class="close-circle">
              <el-icon :size="14"><Close /></el-icon>
            </span>
          </button>
        </header>

        <div class="withdraw-balance">
          <el-icon :size="14" class="info-icon"><InfoFilled /></el-icon>
          <span class="balance-text">
            剩余可提现常乐豆：<span class="num">{{ account.balance.toLocaleString() }}</span><span class="unit">(颗)</span>
          </span>
        </div>

        <div class="withdraw-input-row">
          <input
            v-model="withdrawForm.amount"
            type="number"
            class="withdraw-input"
            :placeholder="'0'"
            inputmode="decimal"
            :min="0"
            :max="account.balance"
          />
          <button class="withdraw-all" @click="withdrawForm.amount = account.balance">全额提现</button>
        </div>

        <div class="withdraw-actions">
          <button class="btn-secondary" @click="withdrawDialogVisible = false">取消</button>
          <button
            class="btn-primary"
            :class="{ 'is-disabled': !canConfirmWithdraw }"
            :disabled="!canConfirmWithdraw"
            @click="onConfirmWithdraw"
          >确认提现</button>
        </div>

        <div class="withdraw-tips">
          <div class="tips-title">
            <el-icon :size="14" class="tips-icon"><WarningFilled /></el-icon>
            <span>特别提醒</span>
          </div>
          <ul class="tips-list">
            <li>常乐豆提现产生的个税，将配置至本月【代扣个税】</li>
            <li>提交申请后，最早本月9号到账</li>
          </ul>
        </div>
          </div>
        </div>
      </div>
    </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft, Close, MoreFilled, ArrowRight,
  InfoFilled, WarningFilled
} from '@element-plus/icons-vue'

const router = useRouter()
const goBack = () => router.back()

const account = { balance: 5666 }

const onExchange = () => ElMessage.info('福利兑换（mock）')
const onExchangeRecords = () => router.push('/mobile-bean-consumption-detail')
const onWithdrawRecords = () => router.push('/mobile-bean-withdraw-records')
const onSettlement = () => router.push('/mobile-bean-settlement')

// ===== 步骤1：自助提现弹窗 =====
const withdrawDialogVisible = ref(false)
const withdrawForm = reactive({ amount: '' })

const canConfirmWithdraw = computed(() => {
  const amt = Number(withdrawForm.amount)
  if (!amt || amt <= 0) return false
  if (amt > account.balance) return false
  return true
})

const openWithdrawDialog = () => {
  withdrawForm.amount = ''
  withdrawDialogVisible.value = true
}

const onDialogClosed = () => {
  withdrawForm.amount = ''
}

const onConfirmWithdraw = () => {
  if (!canConfirmWithdraw.value) return
  const amount = Number(withdrawForm.amount)
  withdrawDialogVisible.value = false
  router.push({ path: '/mobile-bean-withdraw', query: { amount } })
}
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
  align-items: center;
  justify-content: space-between;
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
.withdraw-btn {
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: transparent;
  color: #fff;
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
.withdraw-btn:active { opacity: 0.78; }
.exchange-btn { margin-left: 12px; }

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
.entry-main { flex: 1; min-width: 0; }
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

/* ============ 自助提现 底部弹层 ============ */
.withdraw-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 2000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.withdraw-sheet {
  width: 100%;
  max-width: 480px;
  background: #fff;
  border-radius: 16px 16px 0 0;
  box-sizing: border-box;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
.withdraw-card { padding: 20px 20px 24px; }

.withdraw-head {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: 0 0 20px;
}
.withdraw-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}
.withdraw-close {
  position: absolute;
  top: 0;
  right: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.close-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f2f2f5;
  color: #8a8a92;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.withdraw-balance {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 0 16px;
  font-size: 13px;
  color: #1a1a1a;
}
.info-icon { color: #b8b8c0; }
.balance-text .num {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.balance-text .unit {
  color: #8a8a92;
  font-size: 12px;
  margin-left: 1px;
}

.withdraw-input-row {
  display: flex;
  align-items: center;
  border: 1px solid #e0e0e5;
  border-radius: 10px;
  padding: 4px 14px;
  margin-bottom: 18px;
  background: #fafafa;
}
.withdraw-input-row:focus-within { border-color: #a40035; background: #fff; }
.withdraw-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 20px;
  color: #1a1a1a;
  font-variant-numeric: tabular-nums;
  padding: 10px 0;
  min-width: 0;
  font-weight: 500;
}
.withdraw-input::-webkit-outer-spin-button,
.withdraw-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.withdraw-input::placeholder { color: #ccc; font-weight: 400; }
.withdraw-all {
  border: none;
  background: transparent;
  color: #a40035;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 0 4px 12px;
  white-space: nowrap;
}
.withdraw-all:active { opacity: 0.7; }

.withdraw-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 18px;
}
.btn-secondary,
.btn-primary {
  flex: 1;
  height: 44px;
  border-radius: 22px;
  border: 1px solid #e0e0e5;
  background: #fff;
  color: #1a1a1a;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s ease;
}
.btn-primary {
  background: #a40035;
  color: #fff;
  border-color: transparent;
}
.btn-primary:active { opacity: 0.85; }
.btn-secondary:active { opacity: 0.7; }
.btn-primary.is-disabled {
  background: #f3c5d0;
  cursor: not-allowed;
}

.withdraw-tips {
  background: #fafafa;
  border-radius: 10px;
  padding: 14px 16px;
}
.tips-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #a40035;
  margin-bottom: 8px;
}
.tips-icon { color: #a40035; }
.tips-list {
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  color: #5a5a64;
  line-height: 1.8;
}
.tips-list li { list-style: disc; }

/* 底部弹层过渡动画 */
.withdraw-sheet-enter-active,
.withdraw-sheet-leave-active {
  transition: opacity 0.25s ease;
}
.withdraw-sheet-enter-active .withdraw-sheet,
.withdraw-sheet-leave-active .withdraw-sheet {
  transition: transform 0.25s ease;
}
.withdraw-sheet-enter-from,
.withdraw-sheet-leave-to {
  opacity: 0;
}
.withdraw-sheet-enter-from .withdraw-sheet,
.withdraw-sheet-leave-to .withdraw-sheet {
  transform: translateY(100%);
}
</style>
