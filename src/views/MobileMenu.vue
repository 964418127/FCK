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
    
    <div class="menu-content">
      <!-- 职能岗位分组 -->
      <div class="menu-group">
        <div class="group-title">职能岗位</div>
        <div class="grid-menu">
          <div class="grid-item" @click="goToStoreHanging">
            <div class="grid-icon">
              <el-icon><ShoppingBag /></el-icon>
            </div>
            <div class="grid-title">挂店申请审核</div>
          </div>
          
          <div class="grid-item">
            <div class="grid-icon">
              <el-icon><Setting /></el-icon>
            </div>
            <div class="grid-title">系统设置</div>
          </div>
          
          <div class="grid-item">
            <div class="grid-icon">
              <el-icon><Help /></el-icon>
            </div>
            <div class="grid-title">帮助中心</div>
          </div>
        </div>
      </div>
      
      <!-- 推拿师分组 -->
      <div class="menu-group">
        <div class="group-title">推拿师</div>
        <div class="grid-menu">
          <div class="grid-item" @click="goToStoreManagement">
            <div class="grid-icon">
              <el-icon><Shop /></el-icon>
            </div>
            <div class="grid-title">挂店管理</div>
          </div>
          
          <div class="grid-item" @click="goToScheduleLeave">
            <div class="grid-icon">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="grid-title">排班排假</div>
          </div>
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
import { User, ShoppingBag, Setting, Help, ArrowRight, Shop, Calendar } from '@element-plus/icons-vue'

const router = useRouter()

const goToStoreHanging = () => {
  router.push('/mobile-store-hanging')
}

const goToStoreManagement = () => {
  router.push('/mobile-store-management')
}

const goToScheduleLeave = () => {
  router.push('/mobile-schedule-leave')
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

.menu-content {
  padding: 20px;
}

.menu-group {
  margin-bottom: 30px;
}

.group-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.grid-menu {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.grid-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #a40035;
  color: white;
  border-radius: 8px;
  margin-bottom: 8px;
}

.grid-title {
  font-size: 12px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.menu-footer {
  padding: 20px;
  text-align: center;
}
</style>