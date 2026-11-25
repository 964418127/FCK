<template>
  <div class="login-page">
    <!-- 左侧：品牌区 -->
    <div class="brand-panel">
      <div class="brand-blob blob-1"></div>
      <div class="brand-blob blob-2"></div>
      <div class="brand-blob blob-3"></div>

      <div class="brand-content">
        <div class="brand-logo">
          <svg width="64" height="64" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
            <rect width="96" height="96" rx="22" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/>
            <g fill="none" stroke="white" stroke-width="6" stroke-linecap="round">
              <path d="M28 28 L40 68 M40 28 L28 68" />
              <path d="M48 28 L68 28 L68 68 L56 68" />
            </g>
            <circle cx="34" cy="48" r="4" fill="white" />
            <circle cx="62" cy="48" r="4" fill="white" />
          </svg>
        </div>
        <h1 class="brand-title">XV 平台</h1>
        <p class="brand-subtitle">数字化平台</p>

        <div class="brand-points">
          <div class="brand-point">
            <span class="point-dot"></span>
            <span>人事 · 薪酬 · 排班一体化</span>
          </div>
          <div class="brand-point">
            <span class="point-dot"></span>
            <span>移动端与 PC 端协同办公</span>
          </div>
          <div class="brand-point">
            <span class="point-dot"></span>
            <span>数据驱动门店运营决策</span>
          </div>
        </div>
      </div>

      <p class="brand-footer">© XV 平台 · 数字化运营</p>
    </div>

    <!-- 右侧：表单区 -->
    <div class="form-panel">
      <div class="form-box">
        <h2 class="form-title">欢迎回来</h2>
        <p class="form-desc">请使用平台账号登录</p>

        <el-form :model="loginForm" :rules="loginRules" class="login-form">
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" placeholder="用户名" prefix-icon="User" size="large" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" type="password" placeholder="密码" prefix-icon="Lock" size="large" show-password />
          </el-form-item>
          <el-form-item prop="captcha">
            <div class="captcha-row">
              <el-input v-model="loginForm.captcha" placeholder="验证码" prefix-icon="Key" size="large" />
              <div class="captcha-box" @click="refreshCaptcha">
                <el-icon><Key /></el-icon>
                <span>点击刷新</span>
              </div>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" class="login-button" @click="handleLogin" :loading="loading">
              登 录
            </el-button>
          </el-form-item>
          <el-form-item>
            <div class="device-switch">
              <div class="device-option active">
                <el-icon><Monitor /></el-icon>
                <span>PC 端</span>
              </div>
              <div class="device-option" @click="goToMobileLogin">
                <el-icon><Iphone /></el-icon>
                <span>移动端</span>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const loginForm = reactive({
  username: '',
  password: '',
  captcha: ''
})

const router = useRouter()

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
}

const loading = ref(false)

const handleLogin = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('登录成功')
    // 登录成功后跳转到欢迎页面
    router.push('/welcome')
  }, 1500)
}

const refreshCaptcha = () => {
  // 这里可以添加刷新验证码的逻辑
}

const goToMobileLogin = () => {
  router.push('/mobile-login')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
}

/* ── 左侧品牌区 ── */
.brand-panel {
  position: relative;
  flex: 1;
  max-width: 46%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px 64px;
  background: linear-gradient(150deg, #c31450 0%, #a40035 55%, #7a0026 100%);
  overflow: hidden;
}

.brand-blob {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.07);
  pointer-events: none;
}

.blob-1 {
  width: 420px;
  height: 420px;
  top: -160px;
  right: -140px;
}

.blob-2 {
  width: 300px;
  height: 300px;
  bottom: -120px;
  left: -100px;
}

.blob-3 {
  width: 120px;
  height: 120px;
  top: 20%;
  left: 18%;
  background: rgba(255, 255, 255, 0.05);
}

.brand-content {
  position: relative;
}

.brand-logo {
  margin-bottom: 28px;
}

.brand-title {
  color: #fff;
  font-size: 40px;
  font-weight: 700;
  letter-spacing: 3px;
  margin-bottom: 10px;
}

.brand-subtitle {
  color: rgba(255, 255, 255, 0.75);
  font-size: 16px;
  letter-spacing: 8px;
  margin-bottom: 48px;
}

.brand-points {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.brand-point {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.88);
  font-size: 15px;
}

.point-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.12);
  flex-shrink: 0;
}

.brand-footer {
  position: absolute;
  bottom: 28px;
  left: 64px;
  color: rgba(255, 255, 255, 0.45);
  font-size: 12px;
}

/* ── 右侧表单区 ── */
.form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fbf8f9;
  padding: 40px;
}

.form-box {
  width: 100%;
  max-width: 400px;
}

.form-title {
  font-size: 28px;
  font-weight: 700;
  color: #2b1a20;
  margin-bottom: 8px;
}

.form-desc {
  font-size: 14px;
  color: #9a8a90;
  margin-bottom: 36px;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 12px;
  background: #f7f2f4;
  box-shadow: 0 0 0 1px #efe4e8 inset;
  padding: 4px 14px;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1.5px #a40035 inset;
  background: #fff;
}

.captcha-row {
  display: flex;
  gap: 12px;
  width: 100%;
}

.captcha-box {
  width: 118px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  background: #f7f2f4;
  border-radius: 12px;
  box-shadow: 0 0 0 1px #efe4e8 inset;
  color: #b39aa4;
  font-size: 12px;
  cursor: pointer;
  transition: color 0.2s ease;
  user-select: none;
}

.captcha-box:hover {
  color: #a40035;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 8px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #c31450 0%, #a40035 100%);
  box-shadow: 0 8px 20px rgba(164, 0, 53, 0.32);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.login-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(164, 0, 53, 0.4);
}

/* ── 端切换胶囊 ── */
.device-switch {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  background: #f7f2f4;
  border-radius: 999px;
  margin: 0 auto;
}

.device-option {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 22px;
  border-radius: 999px;
  font-size: 14px;
  color: #9a8a90;
  cursor: pointer;
  transition: all 0.25s ease;
  user-select: none;
}

.device-option:hover {
  color: #a40035;
}

.device-option.active {
  background: linear-gradient(135deg, #c31450 0%, #a40035 100%);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(164, 0, 53, 0.3);
  cursor: default;
}

.device-option .el-icon {
  font-size: 16px;
}

/* 窄屏回退：品牌区隐藏，表单铺满 */
@media (max-width: 768px) {
  .brand-panel {
    display: none;
  }
}
</style>
