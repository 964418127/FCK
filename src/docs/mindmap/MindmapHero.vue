<template>
  <div class="mindmap-hero">
    <div class="mindmap-header">
      <div class="mindmap-title">
        <el-icon :size="20" :style="{ color: 'hsl(var(--primary))' }"><Histogram /></el-icon>
        <span>{{ tree.title }}</span>
        <el-tag size="small" type="info" effect="plain">{{ hintText }}</el-tag>
      </div>
      <div v-if="tree.legend && tree.legend.length" class="mindmap-legend">
        <span v-for="item in tree.legend" :key="item.label" class="legend-item">
          <span class="legend-dot" :style="{ background: item.color }"></span>{{ item.label }}
        </span>
      </div>
    </div>
    <div ref="containerRef" class="mindmap-container">
      <svg ref="svgRef" class="markmap-svg"></svg>
    </div>
    <div class="mindmap-footer">
      <el-button size="small" link @click="scrollToContent">
        进入正文 ↓
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, shallowRef, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Histogram } from '@element-plus/icons-vue'

const props = defineProps({
  tree: { type: Object, required: true },
  contentTopAnchor: { type: String, default: 'version' }
})

const containerRef = ref(null)
const svgRef = ref(null)
const markmapInstance = shallowRef(null)
const router = useRouter()
let resizeObserver = null

const hintText = computed(() => {
  const hasRoute = props.tree.groups?.some(g =>
    g.children?.some(c => c.type === 'route' || c.children?.some(cc => cc.type === 'route'))
  )
  return hasRoute ? '平台节点跳章节 · App 节点跳路由' : '点击节点跳转章节'
})

// 递归把业务树转成 markmap IPureNode 结构
// 每个节点带 payload 用于 click 处理：anchor / route / type
function buildMarkmapData(tree) {
  return {
    content: `${tree.rootIcon || '🗺️'} ${tree.title}`.trim(),
    payload: { type: 'root' },
    children: (tree.groups || []).map(g => buildNode(g))
  }
}

function buildNode(n) {
  const payload = { type: n.type, id: n.id, color: n.color }
  if (n.anchor) payload.anchor = n.anchor
  if (n.route) payload.route = n.route
  return {
    content: `${n.icon || ''} ${n.label}`.trim(),
    payload,
    children: (n.children || []).map(buildNode)
  }
}

function colorFn(node) {
  const c = node?.payload?.color
  if (c) return c
  return '#94a3b8'
}

async function initMarkmap() {
  if (!svgRef.value) return
  await nextTick()
  const { Markmap } = await import('markmap-view')

  const data = buildMarkmapData(props.tree)
  const mm = Markmap.create(svgRef.value, {
    autoFit: true,
    duration: 300,
    initialExpandLevel: -1,
    maxInitialScale: 1.2,
    pan: true,
    zoom: true,
    color: colorFn,
    lineWidth: (node) => (node?.payload?.type === 'group' ? 3 : 1.5),
    nodeMinHeight: 24,
    paddingX: 16,
    spacingHorizontal: 80,
    spacingVertical: 8
  })
  await mm.setData(data)
  markmapInstance.value = mm

  // click 分流：anchor / route / group toggle
  mm.svg.selectAll('g.markmap-node').on('click', (event, d) => {
    const payload = d?.payload || {}
    if (payload.anchor) {
      event.stopPropagation()
      const el = document.getElementById(payload.anchor)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        el.classList.add('anchor-flash')
        setTimeout(() => el.classList.remove('anchor-flash'), 1500)
      }
    } else if (payload.route) {
      event.stopPropagation()
      router.push(payload.route)
    } else {
      mm.handleClick(event, d)
    }
  })

  resizeObserver = new ResizeObserver(() => {
    mm.fit()
  })
  resizeObserver.observe(containerRef.value)
}

function scrollToContent() {
  const el = document.getElementById(props.contentTopAnchor)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(() => {
  initMarkmap()
})

onBeforeUnmount(() => {
  if (resizeObserver) resizeObserver.disconnect()
  if (markmapInstance.value?.destroy) markmapInstance.value.destroy()
})
</script>

<style scoped>
.mindmap-hero {
  /* 跟 doc-hero / content-section 一致：撑满父宽，无水平 margin */
  margin: 0 0 24px;
  background: linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%);
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px hsl(var(--foreground) / 0.05);
}

.mindmap-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid hsl(var(--border));
  background: hsl(var(--card));
  flex-wrap: wrap;
  gap: 12px;
}

.mindmap-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.mindmap-legend {
  display: flex;
  gap: 14px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  flex-wrap: wrap;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.mindmap-container {
  width: 100%;
  height: 70vh;
  min-height: 480px;
  background: hsl(var(--background));
  position: relative;
}

.markmap-svg {
  display: block;
  width: 100%;
  height: 100%;
}

.mindmap-footer {
  display: flex;
  justify-content: center;
  padding: 10px;
  border-top: 1px solid hsl(var(--border));
  background: hsl(var(--card));
}

:deep(svg.markmap) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

:deep(svg.markmap text) {
  fill: hsl(var(--foreground)) !important;
  font-size: 13px;
}

:deep(svg.markmap g.markmap-node circle) {
  cursor: pointer;
}

:deep(svg.markmap g.markmap-node) {
  cursor: pointer;
}
</style>

<style>
.anchor-flash {
  animation: anchor-flash-anim 1.5s ease-out;
}

@keyframes anchor-flash-anim {
  0% { background-color: hsl(38, 92%, 50% / 0.25); }
  100% { background-color: transparent; }
}
</style>
