<template>
  <div class="floating-toc" :class="{ collapsed: !tocExpanded }">
    <button class="toc-toggle-btn" :title="tocExpanded ? '收起目录' : '展开目录'" @click="tocExpanded = !tocExpanded">
      <el-icon :size="18">
        <component :is="tocExpanded ? Fold : Expand" />
      </el-icon>
      <span v-show="tocExpanded" class="toc-toggle-label">目录</span>
    </button>
    <transition name="toc-slide">
      <div v-show="tocExpanded" class="toc-panel">
        <ul class="toc-list">
          <li
            v-for="item in items"
            :key="item.id"
            :class="{ active: activeId === item.id }"
          >
            <a :href="'#' + item.id" @click.prevent="scrollToSection(item.id)">
              {{ item.label }}
            </a>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Fold, Expand } from '@element-plus/icons-vue'

const props = defineProps({
  items: {
    type: Array,
    required: true
  }
})

const tocExpanded = ref(false)
const activeId = ref(props.items[0]?.id || '')

let observer = null
onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .map(e => ({ id: e.target.id, top: e.boundingClientRect.top }))
      .sort((a, b) => a.top - b.top)
    if (visible.length > 0) {
      activeId.value = visible[0].id
    }
  }, {
    rootMargin: '-10% 0px -70% 0px',
    threshold: 0
  })
  props.items.forEach(item => {
    const el = document.getElementById(item.id)
    if (el) observer.observe(el)
  })
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})

const scrollToSection = (id) => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeId.value = id
  }
}
</script>

<style scoped>
.floating-toc {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  transition: width 0.25s ease, height 0.25s ease, border-radius 0.25s ease, background 0.25s ease, border-color 0.25s ease;
  overflow: hidden;
}

.floating-toc.collapsed {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
}

.floating-toc:not(.collapsed) {
  width: 240px;
  max-width: calc(100vw - 40px);
}

.toc-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 44px;
  padding: 0 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--foreground));
  transition: all 0.2s;
}

.floating-toc.collapsed .toc-toggle-btn {
  color: hsl(var(--primary-foreground));
  padding: 0;
}

.floating-toc:not(.collapsed) .toc-toggle-btn {
  color: hsl(var(--foreground));
  border-bottom: 1px solid hsl(var(--border));
}

.toc-toggle-label {
  white-space: nowrap;
}

.toc-panel {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  padding: 8px 0;
}

.toc-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.toc-list li {
  margin: 0;
  padding: 0;
}

.toc-list a {
  display: block;
  padding: 8px 16px;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  text-decoration: none;
  border-left: 2px solid transparent;
  transition: all 0.15s;
  line-height: 1.5;
}

.toc-list a:hover {
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.05);
}

.toc-list li.active a {
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.08);
  border-left-color: hsl(var(--primary));
  font-weight: 600;
}

.toc-slide-enter-active, .toc-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.toc-slide-enter-from, .toc-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 768px) {
  .floating-toc {
    right: 12px;
    top: auto;
    bottom: 12px;
    transform: none;
  }
  .floating-toc:not(.collapsed) {
    width: 200px;
  }
}
</style>
