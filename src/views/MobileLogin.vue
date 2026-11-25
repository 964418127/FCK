<template>
  <div class="mobile-login">
    <!-- 上半：品牌区 -->
    <div class="hero">
      <div class="hero-blob blob-1"></div>
      <div class="hero-blob blob-2"></div>
      <div class="hero-blob blob-3"></div>
      <div class="logo">
        <svg width="72" height="72" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
          <rect width="96" height="96" rx="22" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/>
          <g fill="none" stroke="white" stroke-width="6" stroke-linecap="round">
            <path d="M28 28 L40 68 M40 28 L28 68" />
            <path d="M48 28 L68 28 L68 68 L56 68" />
          </g>
          <circle cx="34" cy="48" r="4" fill="white" />
          <circle cx="62" cy="48" r="4" fill="white" />
        </svg>
      </div>
      <h2 class="title">XV 平台</h2>
      <p class="subtitle">数字化平台</p>
    </div>

    <!-- 下半：白色面板 -->
    <div class="sheet">
      <div class="sheet-handle"></div>
      <h3 class="sheet-title">欢迎回来</h3>
      <p class="sheet-desc">登录后开始今天的工作</p>

      <el-form :model="loginForm" :rules="loginRules" class="login-form">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="用户名" prefix-icon="User" size="large" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="密码" prefix-icon="Lock" size="large" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-button" @click="handleLogin" :loading="loading">
            登 录
          </el-button>
        </el-form-item>
        <el-form-item>
          <div class="device-switch">
            <div class="device-option" @click="goToPCLogin">
              <el-icon><Monitor /></el-icon>
              <span>PC 端</span>
            </div>
            <div class="device-option active">
              <el-icon><Iphone /></el-icon>
              <span>移动端</span>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const loginForm = reactive({
  username: '',
  password: ''
})

const router = useRouter()

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const loading = ref(false)

const handleLogin = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('登录成功')
    router.push('/mobile-menu')
  }, 1500)
}

const goToPCLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.mobile-login {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fbf8f9;
}

/* ── 品牌区 ── */
.hero {
  position: relative;
  padding: 72px 24px 64px;
  background: linear-gradient(150deg, #c31450 0%, #a40035 55%, #7a0026 100%);
  text-align: center;
  overflow: hidden;
}

.hero-blob {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  pointer-events: none;
}

.blob-1 {
  width: 260px;
  height: 260px;
  top: -110px;
  right: -80px;
}

.blob-2 {
  width: 180px;
  height: 180px;
  bottom: -70px;
  left: -60px;
}

.blob-3 {
  width: 90px;
  height: 90px;
  top: 44px;
  left: 36px;
  background: rgba(255, 255, 255, 0.06);
}

.logo {
  position: relative;
  margin-bottom: 18px;
}

.title {
  position: relative;
  color: white;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.subtitle {
  position: relative;
  color: rgba(255, 255, 255, 0.75);
  font-size: 14px;
  letter-spacing: 6px;
}

/* ── 白色面板 ── */
.sheet {
  position: relative;
  flex: 1;
  margin-top: -28px;
  background: #ffffff;
  border-radius: 28px 28px 0 0;
  padding: 14px 28px 32px;
  box-shadow: 0 -12px 40px rgba(122, 0, 38, 0.18);
}

.sheet-handle {
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: #e8dde1;
  margin: 0 auto 20px;
}

.sheet-title {
  font-size: 20px;
  font-weight: 700;
  color: #2b1a20;
  margin-bottom: 6px;
}

.sheet-desc {
  font-size: 13px;
  color: #9a8a90;
  margin-bottom: 24px;
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
</style>
