<template>
  <div class="mobile-bean-withdraw-confirm">
    <!-- 顶部导航 -->
    <header class="top-nav">
      <button class="icon-btn" @click="goBack" aria-label="返回">
        <el-icon :size="20"><ArrowLeft /></el-icon>
      </button>
      <div class="nav-title">常乐豆提现兑换</div>
      <div class="nav-actions">
        <button class="icon-btn" aria-label="关闭">
          <el-icon :size="20"><Close /></el-icon>
        </button>
      </div>
    </header>

    <!-- 协议正文 -->
    <main class="agreement">
      <p class="intro">
        您正在申请将常乐豆兑换为现金，请仔细阅读并确认以下内容，点击"确认兑换"即视为您已完全理解并同意所有条款：
      </p>

      <ol class="clauses">
        <li class="clause">
          本次申请兑换常乐豆数量：
          <span class="amount-num">{{ displayAmount }}</span>
          颗，对应现金金额：人民币
          <span class="amount-num">{{ displayCash }}</span>
          元（大写：<span class="amount-cap">{{ chineseCash }}</span>）
        </li>
        <li class="clause">
          您明确知晓：本次兑换的现金属于额外福利性支出，不构成工资组成部分
        </li>
        <li class="clause">
          您承诺：不以任何理由主张该现金为工资，或要求公司将其计入工资总额补发、补偿；若因您主张引发争议导致公司损失，您将承担全部赔偿责任。
        </li>
        <li class="clause">
          兑换不可撤销：提交申请并审核通过后，除公司原因（如系统故障、支付失败）外，不可撤销兑换或要求退还常乐豆。
        </li>
        <li class="clause">
          若因您登记的银行账户信息错误、变更未通知导致支付失败，责任由您自行承担，公司仅协助重新支付，不额外补偿
        </li>
      </ol>

      <div class="radio-group">
        <label class="radio-item" :class="{ active: agreement === 'agree' }">
          <input
            type="radio"
            name="agreement"
            value="agree"
            v-model="agreement"
            class="radio-native"
          />
          <span class="radio-mark"></span>
          <span class="radio-text">我已仔细阅读并同意上述所有确认内容</span>
        </label>
        <label class="radio-item" :class="{ active: agreement === 'disagree' }">
          <input
            type="radio"
            name="agreement"
            value="disagree"
            v-model="agreement"
            class="radio-native"
          />
          <span class="radio-mark"></span>
          <span class="radio-text">我不同意上述条款<span class="radio-hint">（选择此项将无法提交兑换申请）</span></span>
        </label>
      </div>
    </main>

    <!-- 底部按钮 -->
    <footer class="bottom-bar">
      <button class="btn-secondary" @click="goBack">取消</button>
      <button
        class="btn-primary"
        :class="{ 'is-disabled': !canSubmit }"
        :disabled="!canSubmit"
        @click="onSubmit"
      >确认兑换</button>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Close } from '@element-plus/icons-vue'
import { numberToChineseMoneyDot } from '../utils/format.js'

const route = useRoute()
const router = useRouter()

// 1 颗 = 1 元
const EXCHANGE_RATE = 1

const amount = computed(() => {
  const q = Number(route.query.amount)
  if (!q || q <= 0) return 0
  return q
})

const displayAmount = computed(() => {
  const n = amount.value
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '')
})

const displayCash = computed(() => amount.value.toFixed(2))

const chineseCash = computed(() => numberToChineseMoneyDot(amount.value))

const agreement = ref('')

const canSubmit = computed(() => agreement.value === 'agree' && amount.value > 0)

const goBack = () => router.back()

const onSubmit = () => {
  if (!canSubmit.value) {
    if (agreement.value !== 'agree') {
      ElMessage.warning('请先同意兑换条款')
    }
    return
  }
  ElMessage.success(`提现申请已提交：${displayAmount.value} 颗，预计到账 ${displayCash.value} 元`)
  setTimeout(() => router.replace('/mobile-bean-withdraw-records'), 1200)
}
</script>

<style scoped>
.mobile-bean-withdraw-confirm {
  background: #f7f7f8;
  min-height: 100vh;
  padding-bottom: calc(96px + env(safe-area-inset-bottom, 0px));
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
.nav-title {
  flex: 1;
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.nav-actions { display: flex; gap: 2px; }
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

/* 协议正文 */
.agreement {
  margin: 16px 16px 0;
  background: #fff;
  border-radius: 12px;
  padding: 18px 16px 20px;
  border: 1px solid #ececef;
}

.intro {
  margin: 0 0 14px;
  font-size: 13px;
  line-height: 1.85;
  color: #1a1a1a;
  text-indent: 2em;
}

.clauses {
  margin: 0 0 22px;
  padding: 0;
  list-style: none;
  counter-reset: clause;
}
.clause {
  counter-increment: clause;
  position: relative;
  padding-left: 22px;
  margin-bottom: 14px;
  font-size: 13px;
  line-height: 1.85;
  color: #1a1a1a;
  text-align: justify;
}
.clause:last-child { margin-bottom: 0; }
.clause::before {
  content: counter(clause) ".";
  position: absolute;
  left: 0;
  top: 0;
  font-weight: 500;
  color: #1a1a1a;
}

.amount-num {
  color: #a40035;
  font-weight: 600;
  text-decoration: underline;
  text-decoration-color: #a40035;
  text-underline-offset: 3px;
  font-variant-numeric: tabular-nums;
}
.amount-cap {
  color: #a40035;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* 单选 */
.radio-group {
  border-top: 1px solid #f2f2f5;
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.radio-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  font-size: 13px;
  color: #1a1a1a;
  line-height: 1.6;
}
.radio-native {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.radio-mark {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid #c8c8d0;
  background: #fff;
  position: relative;
  margin-top: 1px;
  transition: border-color 0.15s ease;
}
.radio-item.active .radio-mark { border-color: #a40035; }
.radio-item.active .radio-mark::after {
  content: '';
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #a40035;
}
.radio-text { flex: 1; }
.radio-hint {
  color: #8a8a92;
  margin-left: 4px;
}

/* 底部按钮 */
.bottom-bar {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: #fff;
  border-top: 1px solid #ececef;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  display: flex;
  gap: 12px;
  z-index: 20;
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
  background: #f6b8c5;
  color: #fff;
  border-color: transparent;
}
.btn-primary:active { opacity: 0.85; }
.btn-secondary:active { opacity: 0.7; }
.btn-primary.is-disabled {
  background: #f3c5d0;
  cursor: not-allowed;
}
</style>