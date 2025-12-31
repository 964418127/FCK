<template>
  <div class="main-layout">
    <!-- 侧边导航栏 -->
    <aside :class="['sidebar', { collapsed: isSidebarCollapsed }]">
      <div class="sidebar-header">
        <h2 v-show="!isSidebarCollapsed">TLZJ 平台</h2>
        <el-icon class="collapse-icon" @click="toggleSidebar">
          <Fold v-if="!isSidebarCollapsed" />
          <Expand v-else />
        </el-icon>
      </div>
      <nav class="sidebar-nav">
        <el-menu
          :default-active="activeMenu"
          :collapse="isSidebarCollapsed"
          class="el-menu-vertical-demo"
          background-color="hsl(var(--sidebar-background))"
          text-color="hsl(var(--sidebar-foreground))"
          active-text-color="hsl(var(--primary-foreground))"
          @select="handleMenuSelect"
        >
          <!-- 主要功能菜单 -->
          <el-menu-item index="welcome">
            <el-icon><HomeFilled /></el-icon>
            <span>欢迎页</span>
          </el-menu-item>

          <!-- 数据校验分组 -->
          <el-sub-menu index="data-validation">
            <template #title>
              <el-icon><Calendar /></el-icon>
              <span>数据校验</span>
            </template>
            <el-menu-item index="monthly-diff-confirm">
              <el-icon><Calendar /></el-icon>
              <span>月差异确认</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 推拿师分组 -->
          <el-sub-menu index="massage-therapist">
            <template #title>
              <el-icon><User /></el-icon>
              <span>推拿师</span>
            </template>
            <el-menu-item index="store-interval">
              <el-icon><Location /></el-icon>
              <span>门店间隔时间库</span>
            </el-menu-item>
            <el-menu-item index="custom-time-strategy">
              <el-icon><Clock /></el-icon>
              <span>自定义时间策略</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 主要功能菜单 - 已屏蔽 -->
          <!-- <el-menu-item index="user-center">
            <el-icon><UserFilled /></el-icon>
            <span>用户中心</span>
          </el-menu-item>
          <el-menu-item index="brand">
            <el-icon><Shop /></el-icon>
            <span>品牌管理</span>
          </el-menu-item>

          <el-sub-menu index="budget-management">
            <template #title>
              <el-icon><Briefcase /></el-icon>
              <span>预算管理</span>
            </template>
            <el-menu-item index="budget-personnel">
              <el-icon><Briefcase /></el-icon>
              <span>人员编制</span>
            </el-menu-item>
          </el-sub-menu>

          <el-menu-item index="user">
            <el-icon><User /></el-icon>
            <span>员工管理</span>
          </el-menu-item>
          <el-menu-item index="organization">
            <el-icon><OfficeBuilding /></el-icon>
            <span>组织架构</span>
          </el-menu-item> -->
          
          <!-- 身份管理分组 - 已屏蔽 -->
          <!-- <el-sub-menu index="identity-management">
            <template #title>
              <el-icon><UserFilled /></el-icon>
              <span>身份&角色</span>
            </template>
            <el-menu-item index="new-role">
              <el-icon><Key /></el-icon>
              <span>平台超管</span>
            </el-menu-item>
            <el-menu-item index="certified-user">
              <el-icon><User /></el-icon>
              <span>认证用户</span>
            </el-menu-item>
            <el-menu-item index="visitor-user">
              <el-icon><UserFilled /></el-icon>
              <span>访客用户</span>
            </el-menu-item>
            <el-menu-item index="brand-role">
              <el-icon><Key /></el-icon>
              <span>品牌角色</span>
            </el-menu-item>
          </el-sub-menu> -->
          
          <!-- 其他菜单项 - 已屏蔽 -->
          <!-- <el-menu-item index="permission">
            <el-icon><Setting /></el-icon>
            <span>权限注册</span>
          </el-menu-item>
          <el-menu-item index="business">
            <el-icon><Folder /></el-icon>
            <span>业务管理</span>
          </el-menu-item>
          <el-menu-item index="process">
            <el-icon><DataLine /></el-icon>
            <span>业务流程</span>
          </el-menu-item>
          <el-menu-item index="data-rule">
            <el-icon><Document /></el-icon>
            <span>数据策略</span>
          </el-menu-item>
          <el-menu-item index="business-container">
            <el-icon><Location /></el-icon>
            <span>业务容器</span>
          </el-menu-item> -->
          
          <!-- 分享推荐分组 - 已屏蔽 -->
          <!-- <el-sub-menu index="share-recommend">
            <template #title>
              <el-icon><Promotion /></el-icon>
              <span>分享推荐</span>
            </template>
            <el-menu-item index="share-recommend-list">
              <el-icon><List /></el-icon>
              <span>分享推荐列表</span>
            </el-menu-item>
            <el-menu-item index="share-rule-management">
              <el-icon><Setting /></el-icon>
              <span>分享活动</span>
            </el-menu-item>
          </el-sub-menu> -->
          
          <!-- 消息中心分组 - 已屏蔽 -->
          <!-- <el-sub-menu index="message-center">
            <template #title>
              <el-icon><Message /></el-icon>
              <span>消息中心</span>
            </template>
            <el-menu-item index="message-history">
              <el-icon><Document /></el-icon>
              <span>历史消息管理</span>
            </el-menu-item>
            <el-menu-item index="message-scheduled">
              <el-icon><Clock /></el-icon>
              <span>定时消息管理</span>
            </el-menu-item>
            <el-menu-item index="message-plan">
              <el-icon><Calendar /></el-icon>
              <span>消息发送计划</span>
            </el-menu-item>
            <el-menu-item index="message-template">
              <el-icon><Edit /></el-icon>
              <span>模板配置</span>
            </el-menu-item>
            <el-menu-item index="message-channel">
              <el-icon><Connection /></el-icon>
              <span>消息通道配置</span>
            </el-menu-item>
            <el-menu-item index="message-rule">
              <el-icon><Setting /></el-icon>
              <span>规则配置</span>
            </el-menu-item>
            <el-menu-item index="message-type">
              <el-icon><Collection /></el-icon>
              <span>消息类型配置</span>
            </el-menu-item>
          </el-sub-menu> -->
          
          <!-- 可视化开发分组 - 已屏蔽 -->
          <!-- <el-sub-menu index="visual-dev">
            <template #title>
              <el-icon><Monitor /></el-icon>
              <span>可视化编排 v1</span>
            </template>
            <el-menu-item index="process-designer">
              <el-icon><DataLine /></el-icon>
              <span>可视化流程设计 v1</span>
            </el-menu-item>
            <el-menu-item index="rule-configurator">
              <el-icon><Setting /></el-icon>
              <span>可视化规则配置 v1</span>
            </el-menu-item>
            <el-menu-item index="event-configurator">
              <el-icon><Connection /></el-icon>
              <span>可视化事件配置 v1</span>
            </el-menu-item>
          </el-sub-menu> -->
          
          <!-- 自动化引擎分组 - 已屏蔽 -->
          <!-- <el-sub-menu index="auto-engine">
            <template #title>
              <el-icon><Cpu /></el-icon>
              <span>自动化引擎 v1</span>
            </template>
            <el-menu-item index="engine-business">
              <el-icon><Briefcase /></el-icon>
              <span>引擎业务</span>
            </el-menu-item>
            <el-menu-item index="engine-process">
              <el-icon><Operation /></el-icon>
              <span>引擎流程设计</span>
            </el-menu-item>
            <el-menu-item index="engine-event">
              <el-icon><Connection /></el-icon>
              <span>引擎事件管理</span>
            </el-menu-item>
            <el-menu-item index="engine-work-permission">
              <el-icon><Key /></el-icon>
              <span>工作权限</span>
            </el-menu-item>
          </el-sub-menu> -->
          
          <!-- 回收箱分组 - 已屏蔽 -->
          <!-- <el-sub-menu index="recycle-bin">
            <template #title>
              <el-icon><Delete /></el-icon>
              <span>回收站</span>
            </template>
            <el-menu-item index="role">
              <el-icon><Key /></el-icon>
              <span>角色管理（旧）</span>
            </el-menu-item>
            <el-menu-item index="business-entity">
              <el-icon><OfficeBuilding /></el-icon>
              <span>业务主体（回收）</span>
            </el-menu-item>
            <el-menu-item index="data-sync">
              <el-icon><Connection /></el-icon>
              <span>数据同步（回收）</span>
            </el-menu-item>
          </el-sub-menu> -->
        </el-menu>
      </nav>
    </aside>
    
    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 顶部导航栏 -->
      <header class="top-header">
        <div class="header-left">
          <div class="brand-mark">
            <span class="brand-icon">TL</span>
            <div class="brand-text">
              <div class="brand-name">TLZJ 平台</div>
              <div class="brand-sub">推拿之家 · 数字化平台</div>
            </div>
          </div>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <span class="username">{{ currentUser?.name || '管理员' }}</span>
              <el-icon class="arrow-down"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-icon><Setting /></el-icon>
                  系统设置
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>
      
      <!-- 内容区域 -->
      <div class="content-wrapper">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { users as mockUsers } from '../mock/data.js'
import {
  Fold,
  Expand,
  House,
  HomeFilled,
  UserFilled,
  User,
  OfficeBuilding,
  Key,
  Setting,
  Folder,
  DataLine,
  Document,
  Location,
  Delete,
  ArrowDown,
  SwitchButton,
  Shop,
  Promotion,
  List,
  Message,
  Clock,
  Calendar,
  Edit,
  Connection,
  Collection,
  Monitor,
  Cpu,
  Briefcase,
  Operation
} from '@element-plus/icons-vue'



// 响应式数据
const activeMenu = ref('welcome')
const isSidebarCollapsed = ref(false)
const currentUser = ref(null)

// 获取路由和路由实例
const route = useRoute()
const router = useRouter()

// 生命周期钩子
onMounted(() => {
  // 初始化当前用户（实际项目中应该从登录状态获取）
  currentUser.value = mockUsers[0] // 使用第一个模拟用户
  
  // 根据当前路由设置激活菜单
  activeMenu.value = route.name || 'welcome'
})

// 处理菜单选择
const handleMenuSelect = (index) => {
  activeMenu.value = index
  // 跳转到对应路由
  router.push({ name: index })
}

// 切换侧边栏折叠状态
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

// 退出登录，回到登录页并清理会话
const handleLogout = () => {
  sessionStorage.removeItem('isLoggedIn')
  sessionStorage.removeItem('username')
  sessionStorage.removeItem('currentSystem')
  router.push('/login')
}
</script>

<style scoped>
/* 确保整个布局占满屏幕 */
.main-layout {
  display: flex;
  height: 100vh;
  width: 100vw; /* 占满整个屏幕宽度 */
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  margin: 0;
  padding: 0;
}

/* 侧边导航栏 */
.sidebar {
  width: 240px;
  height: 100%; /* 确保侧边栏占满高度 */
  background-color: hsl(var(--sidebar-background));
  color: hsl(var(--sidebar-foreground));
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
  flex-shrink: 0;
  margin: 0;
  padding: 0;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid hsl(var(--sidebar-accent));
  margin: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 60px;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: hsl(var(--sidebar-foreground));
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.collapse-icon {
  font-size: 20px;
  cursor: pointer;
  color: hsl(var(--sidebar-foreground));
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  margin-left: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
}

.collapse-icon:hover {
  color: hsl(var(--primary));
  background-color: hsl(var(--sidebar-accent));
}

.sidebar.collapsed .sidebar-header {
  justify-content: center;
  padding: 20px 10px;
}

.sidebar.collapsed .collapse-icon {
  margin-left: 0;
}

.sidebar-nav {
  padding: 10px 0;
  margin: 0;
}

/* 调整菜单层级对齐 */
.sidebar-nav :deep(.el-menu) {
  border-right: none;
}

/* 一级菜单项 */
.sidebar-nav :deep(.el-menu-item) {
  padding-left: 20px !important;
  height: 48px;
  line-height: 48px;
}

/* 分组菜单标题 */
.sidebar-nav :deep(.el-sub-menu__title) {
  padding-left: 20px !important;
  height: 48px;
  line-height: 48px;
}

/* 二级菜单项（分组内的菜单项） */
.sidebar-nav :deep(.el-sub-menu .el-menu-item) {
  padding-left: 50px !important;
  height: 44px;
  line-height: 44px;
}

/* 三级菜单项（如果有） */
.sidebar-nav :deep(.el-sub-menu .el-sub-menu .el-menu-item) {
  padding-left: 80px !important;
}

/* 折叠状态下的菜单项 */
.sidebar.collapsed .sidebar-nav :deep(.el-menu-item),
.sidebar.collapsed .sidebar-nav :deep(.el-sub-menu__title) {
  padding-left: 20px !important;
  text-align: center;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: calc(100% - 240px); /* 占满剩余宽度 */
  height: 100%; /* 确保占满高度 */
  margin: 0;
  padding: 0;
  transition: width 0.3s;
}

/* 侧边栏折叠时调整主内容区域宽度 */
.sidebar.collapsed + .main-content {
  width: calc(100% - 64px); /* 占满剩余宽度 */
}

/* 顶部导航栏 */
.top-header {
  height: 60px;
  background-color: hsl(var(--background));
  border-bottom: 1px solid hsl(var(--border));
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
  margin: 0;
}

.header-left {
  display: flex;
  align-items: center;
  margin: 0;
}

.brand-mark {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-hover)) 100%);
  color: hsl(var(--primary-foreground));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  letter-spacing: 0.5px;
  box-shadow: 0 6px 16px hsl(var(--primary) / 0.3);
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.brand-name {
  font-weight: 700;
  color: hsl(var(--foreground));
  font-size: 14px;
}

.brand-sub {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.menu-toggle {
  font-size: 20px;
  cursor: pointer;
  margin-right: 20px;
  color: hsl(var(--muted-foreground));
  transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-toggle:hover {
  color: hsl(var(--foreground));
}

.header-right {
  display: flex;
  align-items: center;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
  margin: 0;
}

.user-info:hover {
  background-color: hsl(var(--accent));
}

.user-info .username {
  margin: 0 8px;
  font-weight: 500;
  color: hsl(var(--foreground));
}

.arrow-down {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

/* 内容区域 */
.content-wrapper {
  flex: 1;
  padding: 20px;
  background-color: hsl(var(--muted));
  overflow-y: auto;
  width: 100%; /* 占满整个宽度 */
  height: 100%; /* 占满整个高度 */
  max-width: none; /* 移除最大宽度限制 */
  margin: 0;
  box-sizing: border-box; /* 确保padding不影响宽度计算 */
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1000;
  }
  
  .sidebar.collapsed {
    transform: translateX(-100%);
  }
  
  .main-content {
    width: 100%; /* 移动端占满宽度 */
  }
}
</style>