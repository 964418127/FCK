<template>
  <div class="mobile-login">
    <div class="login-container">
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
      <h2 class="title">XV 平台</h2>
      <p class="subtitle">专业的推拿之家数字化平台</p>
      
      <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="用户名" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="密码" prefix-icon="Lock" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-button" @click="handleLogin" :loading="loading">
            登录
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="text" class="pc-login-link" @click="goToPCLogin">
            PC端登录
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
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #a40035 0%, #7a0026 100%);
  padding: 20px;
}

.login-container {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 50px 30px;
  width: 100%;
  max-width: 450px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
}

.logo {
  margin-bottom: 20px;
}

.title {
  color: white;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin-bottom: 30px;
}

.login-form {
  margin-top: 20px;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
}
</style>