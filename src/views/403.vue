<template>
  <div class="error-page">
    <div class="error-container">
      <div class="error-code">403</div>
      <div class="error-title">无权限访问</div>
      <div class="error-description">很抱歉，您没有权限访问该页面</div>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
.error-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.error-container {
  text-align: center;
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  color: #f56c6c;
  margin-bottom: 20px;
}

.error-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}

.error-description {
  font-size: 14px;
  color: #606266;
  margin-bottom: 30px;
}
</style>