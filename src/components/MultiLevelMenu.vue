<template>
  <nav class="multi-level-menu" :class="{ collapsed: isCollapsed }">
    <template v-for="item in menuData" :key="item.index">
      <!-- 1级是分组 -->
      <div v-if="item.children" class="menu-group level-1-group">
        <div
          v-if="!isCollapsed"
          class="menu-group-header"
          :class="{ expanded: expandedGroups.has(item.index) }"
          @click="handleGroupHeaderClick(item)"
        >
          <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
          <span class="menu-label">{{ item.label }}</span>
          <el-icon class="arrow" :class="{ expanded: expandedGroups.has(item.index) }">
            <ArrowDown />
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
                @click="handleGroupHeaderClick(child)"
              >
                <el-icon v-if="child.icon"><component :is="child.icon" /></el-icon>
                <span class="menu-label">{{ child.label }}</span>
                <el-icon class="arrow" :class="{ expanded: expandedGroups.has(child.index) }">
                  <ArrowDown />
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
                  <!-- 3级是页面（indent：挂在上一章之下的 6.x 子章节） -->
                  <div
                    class="menu-item level-3-item"
                    :class="{ active: activeMenu === grandchild.index, 'is-indent': grandchild.indent }"
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
              @click="handleSelect(child.index, child.to)"
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
        @click="handleSelect(item.index, item.to)"
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
              @click.stop="handleSelect(child.index, child.to)"
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
import { ArrowDown } from '@element-plus/icons-vue'

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

// 根据当前 activeMenu 展开对应的父级分组
const expandGroupsForActive = () => {
  props.menuData.forEach(item => {
    if (item.children) {
      item.children.forEach(child => {
        if (child.children) {
          // 2级分组项：active 是分组本身（路由到该分组页）或是其子孙
          if (child.index === activeMenu.value ||
              child.children.some(g => g.index === activeMenu.value)) {
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

// 初始化：根据当前路由设置激活菜单和展开的分组
const initActiveMenu = () => {
  activeMenu.value = route.name || 'welcome'
  expandGroupsForActive()
}

initActiveMenu()

watch(() => route.name, (newName) => {
  activeMenu.value = newName || 'welcome'
  expandGroupsForActive()
})

// 切换分组的展开/收起状态
const toggleGroup = (index) => {
  if (expandedGroups.value.has(index)) {
    expandedGroups.value.delete(index)
  } else {
    expandedGroups.value.add(index)
  }
}

// 2 级分组项点击：跳转（如果 to 存在）+ 切换展开
const handleGroupHeaderClick = (item) => {
  if (item.to) {
    router.push(item.to)
  }
  toggleGroup(item.index)
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

// 处理菜单选择：带 to 的节点直接按 to 跳（文档中心的分组页有 to，但它的 index 不是路由 name）
const handleSelect = (index, to) => {
  activeMenu.value = index
  floatMenuVisible.value = false
  if (to) router.push(to)
  else router.push({ name: index })
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
  font-size: 18px;
  transition: transform 0.2s;
}

.menu-group-header .arrow.expanded {
  transform: rotate(180deg);
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

/* 分组/页面图标：与 el-menu 原生图标同为 24px 定宽盒；字形左对齐（theme.css 同步改过），
   不同图标墨迹宽度不同，居中会让左边缘参差 */
.menu-group-header > .el-icon:not(.arrow),
.menu-item > .el-icon {
  width: 24px;
  text-align: left;
}

/* 1级页面 */
.level-1-item {
  height: 48px;
  line-height: 48px;
  font-size: 14px;
}

/* 2级分组标题（54px = el-menu-item 的 padding 50 + theme.css 的 margin 4，图形与 EP 二级项对齐） */
.level-2-group > .menu-group-header {
  height: 44px;
  line-height: 44px;
  padding-left: 54px;
  font-size: 14px;
}

/* 2级页面 */
.level-2-item {
  height: 44px;
  line-height: 44px;
  padding-left: 54px;
  font-size: 14px;
}

/* 3级页面：字号更小、不显示 icon（缩进与 2 级保持 30px 步进） */
.level-3-item {
  height: 36px;
  line-height: 36px;
  padding-left: 84px;
  font-size: 13px;
}

.level-3-item .el-icon {
  display: none;
}

/* 3级之下的子章节（如 6.x）：再缩进一档 + 字号降半级，作为上一章的从属 */
.level-3-item.is-indent {
  padding-left: 100px;
  height: 32px;
  line-height: 32px;
  font-size: 12.5px;
}
.level-3-item.is-indent .menu-label {
  color: hsl(var(--sidebar-foreground) / 0.85);
}
.level-3-item.is-indent.active .menu-label {
  color: hsl(var(--primary-foreground));
}

.menu-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.el-icon {
  margin-right: 8px;
  font-size: 18px !important;
  flex-shrink: 0;
}

/* 箭头图标特殊处理：与 el-sub-menu 原生箭头（18px）保持一致，右缘对齐其 absolute right:20px + margin 的位置 */
.menu-group-header .arrow {
  margin-left: auto;
  margin-right: 8px;
  font-size: 18px !important;
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
