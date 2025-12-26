<template>
  <div class="system-select-page">
    <div class="select-container">
      <div class="brand-row">
        <div class="logo-circle">
          <span class="logo-text">TL</span>
        </div>
        <div class="brand-info">
          <h2>TLZJ 推拿之家</h2>
          <p>数字化平台</p>
        </div>
      </div>
      
      <div class="system-cards">
        <el-card 
          class="system-card" 
          shadow="hover"
          @click="handleSelectSystem('platform')"
        >
          <div class="card-content">
            <div class="card-icon platform-icon">
              <span class="icon-text">P</span>
            </div>
            <h3>平台超管系统</h3>
            <p>进入平台超级管理员系统，管理平台级权限、组织架构、角色配置等</p>
            <el-tag type="warning" size="large" style="margin-top: 10px">平台级</el-tag>
          </div>
        </el-card>
        
        <el-card 
          class="system-card" 
          shadow="hover"
          @click="handleSelectSystem('brand')"
        >
          <div class="card-content">
            <div class="card-icon brand-icon">
              <span class="icon-text">B</span>
            </div>
            <h3>品牌系统</h3>
            <p>进入品牌业务系统，管理品牌相关业务、流程、权限等</p>
            <el-tag type="success" size="large" style="margin-top: 10px">品牌级</el-tag>
          </div>
        </el-card>
      </div>
      
      <div class="logout-section">
        <el-button type="text" @click="handleLogout">退出登录</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
const router = useRouter()

onMounted(() => {
  // 检查是否已登录
  const isLoggedIn = sessionStorage.getItem('isLoggedIn')
  if (!isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
  }
})

const handleSelectSystem = (systemType) => {
  // 保存选择的系统类型
  sessionStorage.setItem('currentSystem', systemType)
  
  if (systemType === 'platform') {
    ElMessage.success('已进入平台超管系统')
    router.push('/user-center')
  } else if (systemType === 'brand') {
    ElMessage.success('已进入品牌系统')
    router.push('/user-center')
  }
}

const handleLogout = () => {
  sessionStorage.removeItem('isLoggedIn')
  sessionStorage.removeItem('username')
  sessionStorage.removeItem('currentSystem')
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.system-select-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: radial-gradient(circle at 20% 20%, hsl(var(--primary) / 0.12), transparent 32%),
              radial-gradient(circle at 80% 0%, hsl(var(--primary-hover) / 0.14), transparent 26%),
              linear-gradient(135deg, hsl(var(--primary-active)) 0%, #2d0a15 40%, #1b070f 100%);
  padding: 28px;
  color: #e7ecf3;
}

.select-container {
  width: 100%;
  max-width: 900px;
  background-color: #0f1724;
  border-radius: 18px;
  padding: 32px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.24);
  border: 1px solid rgba(232, 246, 255, 0.08);
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
}

.logo-circle {
  width: 64px;
  height: 64px;
  border-radius: 14px;
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-hover)) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 30px hsl(var(--primary) / 0.35);
}

.logo-text {
  font-size: 24px;
  font-weight: 800;
  color: #e8f6ff;
  letter-spacing: 0.6px;
}

.brand-info h2 {
  margin: 0;
  color: #e8f6ff;
  font-size: 22px;
  font-weight: 700;
}

.brand-info p {
  margin: 4px 0 0 0;
  color: #b8c4d6;
  font-size: 14px;
}

.system-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 30px;
}

.system-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(232, 246, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
}

.system-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
  border-color: rgba(31, 155, 182, 0.6);
}

.card-content {
  text-align: center;
  padding: 20px;
  color: #e8f6ff;
}

.card-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  transition: all 0.3s ease;
}

.platform-icon {
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-hover)) 100%);
  color: #fff;
}

.brand-icon {
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-active)) 100%);
  color: #fff;
}

.icon-text {
  font-weight: 800;
  font-size: 26px;
  letter-spacing: 0.4px;
}

.system-card:hover .card-icon {
  transform: scale(1.1);
}

.card-content h3 {
  margin: 0 0 10px 0;
  color: #e8f6ff;
  font-size: 20px;
  font-weight: 700;
}

.card-content p {
  margin: 0 0 15px 0;
  color: #c9d6e5;
  font-size: 14px;
  line-height: 1.6;
}

.logout-section {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(232, 246, 255, 0.08);
}
</style>
