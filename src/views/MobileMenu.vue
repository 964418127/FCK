<template>
  <div class="mobile-menu">
    <div class="menu-header">
      <div class="user-info">
        <div class="avatar">
          <el-icon><User /></el-icon>
        </div>
        <div class="user-details">
          <p class="username">管理员</p>
          <p class="role">系统管理员</p>
        </div>
      </div>
    </div>
    
    <div class="menu-list">
      <div class="menu-item" @click="goToStoreHanging">
        <div class="menu-icon">
          <el-icon><ShoppingBag /></el-icon>
        </div>
        <div class="menu-content">
          <p class="menu-title">挂店申请审核</p>
          <p class="menu-desc">审核推拿师挂店申请</p>
        </div>
        <div class="menu-arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
      
      <div class="menu-item">
        <div class="menu-icon">
          <el-icon><Setting /></el-icon>
        </div>
        <div class="menu-content">
          <p class="menu-title">系统设置</p>
          <p class="menu-desc">账号与安全设置</p>
        </div>
        <div class="menu-arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
      
      <div class="menu-item">
        <div class="menu-icon">
          <el-icon><Help /></el-icon>
        </div>
        <div class="menu-content">
          <p class="menu-title">帮助中心</p>
          <p class="menu-desc">使用帮助与常见问题</p>
        </div>
        <div class="menu-arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
    </div>
    
    <div class="menu-footer">
      <el-button type="text" @click="handleLogout">
        <el-icon><SwitchButton /></el-icon>
        退出登录
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const goToStoreHanging = () => {
  router.push('/mobile-store-hanging')
}

const handleLogout = () => {
  sessionStorage.removeItem('isLoggedIn')
  sessionStorage.removeItem('username')
  ElMessage.success('已退出登录')
  router.push('/mobile-login')
}
</script>

<style scoped>
.mobile-menu {
  min-height: 100vh;
  background: #f5f5f5;
}

.menu-header {
  background: linear-gradient(135deg, #a40035 0%, #7a0026 100%);
  padding: 30px 20px;
  color: white;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 24px;
}

.user-details {
  flex: 1;
}

.username {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
}

.role {
  font-size: 14px;
  opacity: 0.8;
}

.menu-list {
  padding: 20px;
}

.menu-item {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.menu-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.menu-icon {
  width: 48px;
  height: 48px;
  background: rgba(164, 0, 53, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #a40035;
  margin-right: 20px;
}

.menu-content {
  flex: 1;
}

.menu-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
}

.menu-desc {
  font-size: 12px;
  color: #999;
}

.menu-arrow {
  color: #999;
  font-size: 16px;
}

.menu-footer {
  padding: 20px;
  text-align: center;
}
</style>