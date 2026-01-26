<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="decoration-shape shape-1"></div>
      <div class="decoration-shape shape-2"></div>
      <div class="decoration-shape shape-3"></div>
      <div class="decoration-shape shape-4"></div>
    </div>
    
    <!-- 登录卡片 -->
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <svg width="80" height="80" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#a40035"/>
                <stop offset="100%" stop-color="#7a0026"/>
              </linearGradient>
            </defs>
            <rect width="96" height="96" rx="20" fill="url(#g)"/>
            <g fill="white">
              <path d="M28 28 L40 68 M40 28 L28 68" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" />
              <path d="M48 28 L68 28 L68 68 L56 68" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" />
              <circle cx="34" cy="48" r="4" fill="white" />
              <circle cx="62" cy="48" r="4" fill="white" />
            </g>
          </svg>
        </div>
        <h2 class="login-title">XV 平台</h2>
        <p class="login-subtitle">专业的推拿之家数字化平台</p>
      </div>
      <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="用户名" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="密码" prefix-icon="Lock" />
        </el-form-item>
        <el-form-item prop="captcha">
          <div class="captcha-container">
            <el-input v-model="loginForm.captcha" placeholder="验证码" prefix-icon="Key" />
            <div class="captcha-image">
              <div class="captcha-placeholder" @click="refreshCaptcha">
                <el-icon class="captcha-icon"><Key /></el-icon>
                <span>点击刷新</span>
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-button" @click="handleLogin" :loading="loading">
            登录
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="text" class="mobile-login-link" @click="goToMobileLogin">
            移动端登录
          </el-button>
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
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #a40035 0%, #7a0026 100%);
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.decoration-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: float 20s ease-in-out infinite;
}

.shape-1 {
  width: 400px;
  height: 400px;
  top: -200px;
  right: -200px;
  animation-delay: 0s;
}

.shape-2 {
  width: 300px;
  height: 300px;
  bottom: -150px;
  left: -150px;
  animation-delay: 5s;
}

.shape-3 {
  width: 200px;
  height: 200px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 10s;
}

.shape-4 {
  width: 150px;
  height: 150px;
  top: 80%;
  right: 20%;
  animation-delay: 15s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-50px) rotate(90deg);
  }
  50% {
    transform: translateY(0) rotate(180deg);
  }
  75% {
    transform: translateY(50px) rotate(270deg);
  }
}

/* 登录卡片 */
.login-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 50px;
  width: 100%;
  max-width: 450px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-title {
  font-size: 32px;
  font-weight: bold;
  color: white;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.login-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
}

.login-form {
  margin-top: 20px;
}

.login-form .el-input__wrapper {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
}

.login-form .el-input__inner {
  color: white;
}

.login-form .el-input__inner::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.login-form .el-form-item__label {
  color: white;
}

.captcha-container {
  display: flex;
  gap: 10px;
}

.captcha-image {
  width: 120px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.captcha-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: white;
  font-size: 12px;
}

.captcha-icon {
  margin-bottom: 4px;
  font-size: 16px;
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: bold;
}
</style>