<template>
  <div class="login-page">
    <div class="hero-side">
      <div class="brand-top">
        <div class="logo-circle">
          <span class="logo-text">TL</span>
        </div>
        <div class="brand-text">
          <div class="brand-name">TLZJ 推拿之家</div>
          <div class="brand-sub">数字化平台</div>
        </div>
      </div>
      <div class="hero-copy">
        <p class="eyebrow">数字化 · 品牌 · 平台</p>
        <h1>连接品牌、组织与自动化能力</h1>
        <p class="desc">以统一的数字化基座为组织、流程、权限与数据策略赋能，打造沉浸式体验。</p>
      </div>
      <div class="hero-visual">
        <div class="glass-card">
          <div class="stat">
            <div class="stat-title">流程时效</div>
            <div class="stat-value">+38%</div>
          </div>
          <div class="stat">
            <div class="stat-title">权限一致性</div>
            <div class="stat-value">99.9%</div>
          </div>
          <div class="stat">
            <div class="stat-title">容器覆盖</div>
            <div class="stat-value">120+</div>
          </div>
        </div>
      </div>
    </div>

    <div class="form-side">
      <div class="login-card">
        <div class="login-header">
          <h2>欢迎登录</h2>
          <p>进入 TLZJ 平台，开启智能协同</p>
        </div>

        <el-tabs v-model="activeTab" class="login-tabs">
          <el-tab-pane label="账号密码登录" name="account">
            <el-form :model="loginForm" :rules="rules" ref="formRef" label-width="0" class="login-form">
              <el-form-item prop="username">
                <el-input v-model="loginForm.username" size="large" placeholder="请输入用户名">
                  <template #prefix>
                    <el-icon><User /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item prop="password">
                <el-input v-model="loginForm.password" size="large" type="password" placeholder="请输入密码" show-password>
                  <template #prefix>
                    <el-icon><Lock /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" size="large" @click="handleLogin" class="full-btn">
                  <el-icon-loading v-if="loading" />
                  <span v-else>登录</span>
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="扫码登录" name="qrcode">
            <div class="qr-wrapper">
              <div class="qr-box">
                <div class="qr-placeholder">
                  <div class="qr-dots"></div>
                  <div class="qr-dots second"></div>
                  <div class="qr-dots third"></div>
                  <span class="qr-text">QR</span>
                </div>
              </div>
              <p class="qr-tip">请使用移动端「TLZJ App」扫一扫登录</p>
              <el-button text type="primary">刷新二维码</el-button>
            </div>
          </el-tab-pane>
        </el-tabs>

        <div class="login-footer">
          <span>© TLZJ 平台</span>
          <span class="dot">•</span>
          <span>数字化平台</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const activeTab = ref('account')

const loginForm = ref({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      loading.value = true
      // 模拟登录请求
      setTimeout(() => {
        // 简单的登录验证 - 任何用户名和密码都可以登录（模拟）
        ElMessage.success('登录成功')
        // 保存登录信息到 sessionStorage
        sessionStorage.setItem('isLoggedIn', 'true')
        sessionStorage.setItem('username', loginForm.value.username)
        // 跳转到系统选择页面
        router.push('/system-select')
        loading.value = false
      }, 1000)
    }
  })
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  background:
    linear-gradient(115deg, rgba(19, 17, 26, 0.9), rgba(12, 12, 18, 0.88)),
    url('https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1800&q=80') center/cover no-repeat;
  color: #e7ecf3;
  align-items: center;
  padding: 64px 82px;
  gap: 40px;
  position: relative;
}

.login-page::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 20%, hsl(var(--primary) / 0.12), transparent 32%),
    radial-gradient(circle at 80% 0%, hsl(var(--primary-hover) / 0.14), transparent 26%);
  pointer-events: none;
}

.hero-side {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 32px 24px;
  color: #e7ecf3;
}

.brand-top {
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo-circle {
  width: 76px;
  height: 76px;
  border-radius: 16px;
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-hover)) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 30px hsl(var(--primary) / 0.35);
}

.logo-text {
  font-size: 28px;
  font-weight: 800;
  color: #e8f6ff;
  letter-spacing: 0.6px;
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.brand-name {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: hsl(var(--primary) / 0.92);
}

.brand-sub {
  margin: 0;
  font-size: 16px;
  color: #b8c4d6;
}

.hero-copy {
  max-width: 520px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.eyebrow {
  color: hsl(var(--primary));
  letter-spacing: 0.24em;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
  margin: 0;
}

.hero-copy h1 {
  margin: 0;
  font-size: 36px;
  font-weight: 800;
  letter-spacing: 0.4px;
  color: #f2f5f9;
  text-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
}

.desc {
  margin: 0;
  font-size: 16px;
  line-height: 1.7;
  color: #cdd6e3;
}

.hero-visual {
  margin-top: 10px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 18px 20px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  backdrop-filter: blur(12px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.26);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-title {
  font-size: 13px;
  color: #bfc8d6;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: hsl(var(--primary));
}

.form-side {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: flex-end;
}

.login-card {
  background: #0f1724;
  border-radius: 20px;
  padding: 38px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.32);
  max-width: 460px;
  width: 100%;
  border: 1px solid rgba(232, 246, 255, 0.08);
}

.login-header {
  text-align: left;
  margin-bottom: 20px;
}

.login-header h2 {
  margin: 0;
  color: #f2f5f9;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 0.2px;
}

.login-header p {
  margin: 8px 0 0 0;
  color: #c5d0de;
  font-size: 14px;
}

.login-tabs :deep(.el-tabs__header) {
  border-bottom: 1px solid rgba(232, 246, 255, 0.08);
}

.login-tabs :deep(.el-tabs__item) {
  color: #c5d0de;
}

.login-tabs :deep(.el-tabs__item.is-active) {
  color: hsl(var(--primary));
}

.login-form {
  margin-top: 18px;
}

.full-btn {
  width: 100%;
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-hover)) 100%);
  border: none;
  box-shadow: 0 18px 38px hsl(var(--primary) / 0.35);
}

.qr-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 10px 0 6px;
}

.qr-box {
  background: rgba(255, 255, 255, 0.03);
  border: 1px dashed rgba(232, 246, 255, 0.25);
  border-radius: 14px;
  padding: 12px;
}

.qr-placeholder {
  width: 180px;
  height: 180px;
  border-radius: 10px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.02)),
    repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05) 6px, transparent 6px, transparent 12px);
  border: 1px solid rgba(232, 246, 255, 0.16);
  display: grid;
  place-items: center;
  position: relative;
  overflow: hidden;
}

.qr-dots {
  position: absolute;
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.06));
  top: 18px;
  left: 18px;
}

.qr-dots.second {
  top: 18px;
  right: 18px;
  left: auto;
}

.qr-dots.third {
  bottom: 18px;
  left: 18px;
  top: auto;
}

.qr-text {
  font-size: 42px;
  font-weight: 800;
  color: hsl(var(--primary));
  text-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
  letter-spacing: 0.3px;
}

.qr-tip {
  margin: 0;
  color: #c5d0de;
  font-size: 13px;
}

.login-footer {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #9aa8bc;
  font-size: 12px;
  justify-content: center;
}

.dot {
  color: #c0c4cc;
}

@media (max-width: 960px) {
  .login-page {
    grid-template-columns: 1fr;
    padding: 40px 20px;
  }
  .form-side {
    justify-content: center;
  }
  .login-card {
    justify-self: center;
  }
  .hero-side {
    align-items: center;
    text-align: center;
  }
  .glass-card {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>