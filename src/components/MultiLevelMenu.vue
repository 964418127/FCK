<template>
  <nav class="multi-level-menu" :class="{ collapsed: isCollapsed }">
    <template v-for="item in menuData" :key="item.index">
      <!-- 1级是分组 -->
      <div v-if="item.children" class="menu-group level-1-group">
        <div
          v-if="!isCollapsed"
          class="menu-group-header"
          :class="{ expanded: expandedGroups.has(item.index) }"
          @click="toggleGroup(item.index)"
        >
          <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
          <span class="menu-label">{{ item.label }}</span>
          <el-icon class="arrow" :class="{ expanded: expandedGroups.has(item.index) }">
            <ArrowRight />
          </el-icon>
        </div>
        <!-- 折叠状态：一级分组显示悬浮菜单 -->
        <div
          v-else
          class="menu-group-header collapsed"
          @mouseenter="showFloatMenu(item, $event)"
          @mouseleave="hideFloatMenu"
        >
          <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
        </div>
        <div v-show="!isCollapsed && expandedGroups.has(item.index)" class="menu-group-children">
          <template v-for="child in item.children" :key="child.index">
            <!-- 2级是分组 -->
            <div v-if="child.children" class="menu-group level-2-group">
              <div
                v-if="!isCollapsed"
                class="menu-group-header"
                :class="{ expanded: expandedGroups.has(child.index) }"
                @click="toggleGroup(child.index)"
              >
                <el-icon v-if="child.icon"><component :is="child.icon" /></el-icon>
                <span class="menu-label">{{ child.label }}</span>
                <el-icon class="arrow" :class="{ expanded: expandedGroups.has(child.index) }">
                  <ArrowRight />
                </el-icon>
              </div>
              <!-- 折叠状态：二级分组显示悬浮菜单 -->
              <div
                v-else
                class="menu-group-header collapsed"
                @mouseenter="showFloatMenu(child, $event)"
                @mouseleave="hideFloatMenu"
              >
                <el-icon v-if="child.icon"><component :is="child.icon" /></el-icon>
              </div>
              <div v-show="expandedGroups.has(child.index)" class="menu-group-children">
                <template v-for="grandchild in child.children" :key="grandchild.index">
                  <!-- 3级是页面 -->
                  <div
                    class="menu-item level-3-item"
                    :class="{ active: activeMenu === grandchild.index }"
                    @click="handleSelect(grandchild.index)"
                  >
                    <template v-if="!isCollapsed">
                      <el-icon v-if="grandchild.icon"><component :is="grandchild.icon" /></el-icon>
                      <span class="menu-label">{{ grandchild.label }}</span>
                    </template>
                    <template v-else>
                      <div class="menu-item-inline" @mouseenter="showFloatMenu(grandchild, $event)" @mouseleave="hideFloatMenu">
                        <el-icon v-if="grandchild.icon"><component :is="grandchild.icon" /></el-icon>
                      </div>
                    </template>
                  </div>
                </template>
              </div>
            </div>
            <!-- 2级是页面 -->
            <div
              v-else
              class="menu-item level-2-item"
              :class="{ active: activeMenu === child.index }"
              @click="handleSelect(child.index)"
            >
              <template v-if="!isCollapsed">
                <el-icon v-if="child.icon"><component :is="child.icon" /></el-icon>
                <span class="menu-label">{{ child.label }}</span>
              </template>
              <template v-else>
                <div class="menu-item-inline" @mouseenter="showFloatMenu(child, $event)" @mouseleave="hideFloatMenu">
                  <el-icon v-if="child.icon"><component :is="child.icon" /></el-icon>
                </div>
              </template>
            </div>
          </template>
        </div>
      </div>
      <!-- 1级是页面（无children） -->
      <div
        v-else
        class="menu-item level-1-item"
        :class="{ active: activeMenu === item.index }"
        @click="handleSelect(item.index)"
      >
        <el-tooltip v-if="isCollapsed" :content="item.label" placement="right" :show-after="200">
          <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
        </el-tooltip>
        <template v-else>
          <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
          <span class="menu-label">{{ item.label }}</span>
        </template>
      </div>
    </template>

    <!-- 悬浮菜单 -->
    <teleport to="body">
      <div
        v-if="floatMenuVisible"
        class="float-menu"
        :style="{ top: floatMenuTop + 'px', left: floatMenuLeft + 'px' }"
        @mouseenter="keepFloatMenu"
        @mouseleave="hideFloatMenu"
      >
        <div class="float-menu-title">{{ floatMenuTitle }}</div>
        <div class="float-menu-items">
          <template v-for="child in floatMenuChildren" :key="child.index">
            <div
              class="float-menu-item"
              :class="{ active: activeMenu === child.index, 'is-page': !child.children }"
              @click.stop="handleSelect(child.index)"
            >
              <el-icon v-if="child.icon"><component :is="child.icon" /></el-icon>
              <span>{{ child.label }}</span>
            </div>
          </template>
        </div>
      </div>
    </teleport>
  </nav>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  menuData: {
    type: Array,
    required: true
  },
  isCollapsed: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select'])

const route = useRoute()
const router = useRouter()

const activeMenu = ref('')
const expandedGroups = ref(new Set())

// 悬浮菜单状态
const floatMenuVisible = ref(false)
const floatMenuTop = ref(0)
const floatMenuLeft = ref(0)
const floatMenuTitle = ref('')
const floatMenuChildren = ref([])
let floatMenuTimeout = null

// 初始化：根据当前路由设置激活菜单和展开的分组
const initActiveMenu = () => {
  activeMenu.value = route.name || 'welcome'
  // 默认展开当前激活菜单的父级分组
  props.menuData.forEach(item => {
    if (item.children) {
      item.children.forEach(child => {
        if (child.children) {
          const hasActiveChild = child.children.some(g => g.index === activeMenu.value)
          if (hasActiveChild) {
            expandedGroups.value.add(item.index)
            expandedGroups.value.add(child.index)
          }
        } else if (child.index === activeMenu.value) {
          expandedGroups.value.add(item.index)
        }
      })
    }
  })
}

initActiveMenu()

watch(() => route.name, (newName) => {
  activeMenu.value = newName || 'welcome'
})

// 切换分组的展开/收起状态
const toggleGroup = (index) => {
  if (expandedGroups.value.has(index)) {
    expandedGroups.value.delete(index)
  } else {
    expandedGroups.value.add(index)
  }
}

// 显示悬浮菜单
const showFloatMenu = (item, event) => {
  if (!props.isCollapsed) return

  // 如果是页面（没有children），不需要悬浮菜单
  if (!item.children || item.children.length === 0) return

  clearTimeout(floatMenuTimeout)

  const rect = event.target.closest('.menu-group-header, .menu-item-inline').getBoundingClientRect()
  floatMenuTop.value = rect.top
  floatMenuLeft.value = rect.right + 8 // 出现在图标右侧

  floatMenuTitle.value = item.label

  // 如果是2级分组，显示3级页面
  if (item.children && item.children.some(c => c.children)) {
    floatMenuChildren.value = item.children.flatMap(c => c.children || [c])
  } else {
    floatMenuChildren.value = item.children || []
  }

  floatMenuVisible.value = true
}

// 保持悬浮菜单显示
const keepFloatMenu = () => {
  clearTimeout(floatMenuTimeout)
}

// 隐藏悬浮菜单
const hideFloatMenu = () => {
  floatMenuTimeout = setTimeout(() => {
    floatMenuVisible.value = false
  }, 150)
}

// 判断分组是否应该高亮（只有当直接子页面被选中时才高亮）
const isGroupActive = (item) => {
  return item.children?.some(child => child.index === activeMenu.value)
}

const isChildGroupActive = (child) => {
  return child.children?.some(g => g.index === activeMenu.value)
}

// 处理菜单选择
const handleSelect = (index) => {
  activeMenu.value = index
  floatMenuVisible.value = false
  router.push({ name: index })
  emit('select', index)
}
</script>

<style scoped>
.multi-level-menu {
  padding: 0;
  position: relative;
}

.multi-level-menu.collapsed .menu-group-header,
.multi-level-menu.collapsed .menu-item {
  padding-left: 20px !important;
  padding-right: 20px !important;
}

.multi-level-menu.collapsed .menu-group-header .el-icon,
.multi-level-menu.collapsed .menu-item .el-icon {
  margin: 0 auto;
}

.multi-level-menu.collapsed .menu-group-header .menu-label,
.multi-level-menu.collapsed .menu-item .menu-label {
  display: none;
}

.multi-level-menu.collapsed .menu-group-header .arrow {
  display: none;
}

.multi-level-menu.collapsed .menu-group-header {
  cursor: pointer;
}

.multi-level-menu.collapsed .menu-group-children {
  display: none !important;
}

.menu-group {
  margin-bottom: 0;
}

.menu-group-header {
  display: flex;
  align-items: center;
  padding: 0 20px;
  margin-left: 0;
  height: 48px;
  line-height: 48px;
  cursor: pointer;
  color: hsl(var(--sidebar-foreground));
  transition: background-color 0.2s;
  user-select: none;
}

.menu-group-header:hover {
  background-color: hsl(var(--sidebar-accent) / 0.5);
}

.menu-group-header.active {
  background-color: hsl(var(--primary)) !important;
  color: hsl(var(--primary-foreground)) !important;
  font-weight: 500;
}

.menu-group-header .arrow {
  margin-left: auto;
  font-size: 12px;
  transition: transform 0.2s;
}

.menu-group-header .arrow.expanded {
  transform: rotate(90deg);
}

.menu-group-header.collapsed {
  padding: 0;
  justify-content: center;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 0 20px;
  margin-left: 0;
  cursor: pointer;
  color: hsl(var(--sidebar-foreground));
  transition: background-color 0.2s, color 0.2s;
}

.menu-item:hover {
  background-color: hsl(var(--sidebar-accent));
  color: hsl(var(--sidebar-accent-foreground));
}

.menu-item.active {
  background-color: hsl(var(--primary)) !important;
  color: hsl(var(--primary-foreground)) !important;
  font-weight: 500;
}

.menu-item-inline {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

/* 1级分组标题 */
.level-1-group > .menu-group-header {
  height: 48px;
  line-height: 48px;
  font-size: 14px;
}

/* 1级页面 */
.level-1-item {
  height: 48px;
  line-height: 48px;
  font-size: 14px;
}

/* 2级分组标题 */
.level-2-group > .menu-group-header {
  height: 44px;
  line-height: 44px;
  padding-left: 36px;
  font-size: 14px;
}

/* 2级页面 */
.level-2-item {
  height: 44px;
  line-height: 44px;
  padding-left: 36px;
  font-size: 14px;
}

/* 3级页面 */
.level-3-item {
  height: 40px;
  line-height: 40px;
  padding-left: 56px;
  font-size: 14px;
}

.menu-label {
  flex: 1;
}

.el-icon {
  margin-right: 8px;
  font-size: 18px !important;
  flex-shrink: 0;
}

/* 箭头图标特殊处理 */
.menu-group-header .arrow {
  margin-left: auto;
  margin-right: 0;
  font-size: 12px !important;
}

/* 悬浮菜单样式 */
.float-menu {
  position: fixed;
  background: hsl(var(--sidebar-background));
  border: 1px solid hsl(var(--sidebar-accent));
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  max-width: 240px;
  z-index: 9999;
  padding: 8px 0;
}

.float-menu-title {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--sidebar-foreground));
  border-bottom: 1px solid hsl(var(--sidebar-accent));
}

.float-menu-items {
  padding: 4px 0;
}

.float-menu-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  font-size: 13px;
  color: hsl(var(--sidebar-foreground));
  cursor: pointer;
  transition: background-color 0.2s;
}

.float-menu-item:hover {
  background-color: hsl(var(--sidebar-accent));
}

.float-menu-item.active {
  background-color: hsl(var(--primary)) !important;
  color: hsl(var(--primary-foreground)) !important;
}

.float-menu-item .el-icon {
  margin-right: 10px;
  font-size: 16px !important;
}
</style>