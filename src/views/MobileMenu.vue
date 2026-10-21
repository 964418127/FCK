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
      <!-- 菜单项来自 src/config/mobileMenu.js；是否显示由 /gate 的菜单配置决定 -->
      <div v-for="group in visibleGroups" :key="group.id" class="menu-group">
        <div class="group-title">{{ group.label }}</div>
        <div class="grid-menu">
          <div
            v-for="item in group.items"
            :key="item.id"
            class="grid-item"
            @click="go(item)"
          >
            <div class="grid-icon">
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <div class="grid-title">{{ item.label }}</div>
            <span v-if="item.badge && unreadNoticeCount > 0" class="grid-badge">{{ unreadNoticeCount }}</span>
          </div>
        </div>
      </div>

      <div v-if="!visibleGroups.length" class="menu-empty">
        当前账号的菜单项都未开放
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
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, SwitchButton } from '@element-plus/icons-vue'
import { mobileMenuGroups } from '../config/mobileMenu.js'
import { isMenuVisible } from '../composables/useGateConfig.js'

const router = useRouter()

const unreadNoticeCount = ref(19)

// 分组被隐藏 → 整组不出现；组内各项再按自己的开关过滤；组内全被隐藏时整组也不出现
const visibleGroups = computed(() =>
  mobileMenuGroups
    .filter((g) => isMenuVisible(g.id))
    .map((g) => ({ ...g, items: g.items.filter((i) => isMenuVisible(i.id)) }))
    .filter((g) => g.items.length > 0)
)

const go = (item) => {
  if (item.to) router.push(item.to)
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
  height: 100vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
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
  position: relative;
}

.grid-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 18px;
  height: 18px;
  background: #ff4d4f;
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  line-height: 1;
  border: 2px solid white;
  box-sizing: content-box;
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

.menu-empty {
  padding: 60px 0;
  text-align: center;
  font-size: 14px;
  color: #999;
}

.menu-footer {
  padding: 20px;
  text-align: center;
}
</style>
