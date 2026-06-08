<template>
  <div class="doc-center-layout">
    <!-- 左侧文档菜单 -->
    <aside :class="['sidebar', { collapsed: isCollapsed }]">
      <div class="sidebar-header">
        <div v-show="!isCollapsed" class="header-content">
          <h2>文档中心</h2>
          <el-button class="back-btn" size="small" link @click="goBack">
            <el-icon><Back /></el-icon>
            <span>返回主页</span>
          </el-button>
        </div>
        <el-icon class="collapse-icon" @click="toggleSidebar">
          <Fold v-if="!isCollapsed" />
          <Expand v-else />
        </el-icon>
      </div>
      <nav class="sidebar-nav">
        <MultiLevelMenu :menu-data="docMenu" :is-collapsed="isCollapsed" />
      </nav>
    </aside>

    <!-- 文档内容区域 -->
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import MultiLevelMenu from './MultiLevelMenu.vue'
import { Fold, Expand, Back, Document, InfoFilled, Reading } from '@element-plus/icons-vue'

const router = useRouter()
const isCollapsed = ref(false)

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

// 返回主应用
const goBack = () => {
  router.push('/welcome')
}

// 文档菜单（多级结构）
const docMenu = [
  {
    index: 'doc-product',
    label: '模块化薪酬',
    icon: Document,
    children: [
      { index: 'doc-product-v2-phase1', label: '产品需求v2（阶段1）', icon: Reading },
      { index: 'doc-product-v2', label: '产品需求v2', icon: Reading },
      { index: 'doc-product-v1', label: '产品需求v1', icon: Reading }
    ]
  },
  {
    index: 'doc-welfare',
    label: '福利保障',
    icon: Document,
    children: [
      { index: 'doc-welfare-guide', label: '福利保障说明', icon: InfoFilled }
    ]
  }
]
</script>

<style scoped>
.doc-center-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  margin: 0;
  padding: 0;
}

.sidebar {
  width: 260px;
  height: 100%;
  background-color: hsl(var(--sidebar-background));
  color: hsl(var(--sidebar-foreground));
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid hsl(var(--sidebar-accent));
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 72px;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.header-content h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: hsl(var(--sidebar-foreground));
  white-space: nowrap;
}

.back-btn {
  padding: 2px 0 !important;
  font-size: 12px !important;
  color: hsl(var(--muted-foreground)) !important;
  justify-content: flex-start !important;
}

.back-btn:hover {
  color: hsl(var(--primary)) !important;
}

.collapse-icon {
  font-size: 20px;
  cursor: pointer;
  color: hsl(var(--sidebar-foreground));
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
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
  margin: 0 auto;
}

.sidebar-nav {
  padding: 10px 0;
  flex: 1;
  overflow-y: auto;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: hsl(var(--background));
  min-width: 0;
}

/* 复用 MultiLevelMenu 的样式覆盖 */
.sidebar-nav :deep(.el-menu) {
  border-right: none;
}

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
    width: 100%;
  }
}
</style>
