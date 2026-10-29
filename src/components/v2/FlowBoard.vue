<!--
  流程画布（横向分步 · 卡片泳道 · 曲线连线）

  同一个组件用在两个地方，因为它们本来就是同一件事的两种时态：
    预览：这套提示词，这个人会长出什么样的树（还没发生）
    编排：这一单的树，可以就地增删改（已经发生）

  列 = 第几步（层），列内可同时办；卡片只放「谁办 / 什么结论 / 关键一行」，
  详细内容交给调用方在右侧展开 —— 画布负责看清结构与先后，细节在详情里读。
-->
<template>
  <div class="fb-scroll">
    <div ref="canvasRef" class="fb-canvas" :style="{ width: canvasW + 'px', height: canvasH + 'px' }">
      <svg class="fb-edges" :width="canvasW" :height="canvasH">
        <defs>
          <marker :id="arrowId" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#c3bddc" />
          </marker>
          <marker :id="arrowHotId" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#6b5bd2" />
          </marker>
        </defs>

        <!-- 热区：可编辑时点连线 = 断开这个前置 -->
        <path
          v-for="(e, i) in edges" :key="'hit' + i"
          :d="e.d" fill="none" stroke="transparent" stroke-width="14"
          :style="{ pointerEvents: editable ? 'stroke' : 'none', cursor: 'pointer' }"
          @click.stop="unlink(e)"
        />
        <path
          v-for="(e, i) in edges" :key="i"
          :d="e.d" fill="none" :class="['edge', edgeCls(e)]"
          :marker-end="edgeCls(e) === 'hot' ? `url(#${arrowHotId})` : `url(#${arrowId})`"
        />
      </svg>

      <!-- 起点与列头：纵向滚动时贴在顶部，始终知道现在看到的是第几步 -->
      <div class="fb-heads">
        <div v-if="startLabel" class="fb-pill start">{{ startLabel }}</div>
        <div
          v-for="(col, ci) in cols" :key="'c' + ci"
          class="fb-col"
          :style="{ left: colX(ci) + 'px', width: cardW + 'px' }"
        >
          <span class="fb-dot" />
          <span class="fb-step">第 {{ ci + 1 }} 步</span>
          <span class="fb-cond">{{ ci === 0 ? '发起后即可开始' : '前置全部办结后开始' }}</span>
        </div>
      </div>

      <!-- 卡片 -->
      <div
        v-for="n in nodes" :key="n.id"
        v-show="placed[n.id]"
        :ref="(el) => setCardRef(n.id, el)"
        :class="['fb-card', n.state || '', {
          sel: n.id === selected,
          dim: hoverId && !relatedTo(hoverId, n.id),
          sys: n.kind === 'system',
          locked: n.locked
        }]"
        :style="{ left: placed[n.id]?.x + 'px', top: placed[n.id]?.y + 'px', width: cardW + 'px' }"
        @mouseenter="hoverId = n.id"
        @mouseleave="hoverId = ''"
        @click="$emit('pick', n.id)"
      >
        <div class="fc-top">
          <span class="fc-title" :title="n.title">{{ n.title }}</span>
          <span :class="['fc-gate', n.gate]">{{ n.gate === 'optional' ? '可选' : '必过' }}</span>
        </div>
        <div v-if="n.who" class="fc-who">{{ n.who }}</div>
        <div v-if="n.foot" :class="['fc-foot', n.footTone || 'mute']">{{ n.foot }}</div>
        <div v-if="n.stateLabel" class="fc-state">
          <span class="fc-lock" v-if="n.locked">·</span>{{ n.stateLabel }}
        </div>
        <span v-if="n.added" class="fc-added">调整加</span>
      </div>

      <!-- 终点 -->
      <div v-if="endLabel" class="fb-pill end" :style="{ top: canvasH - 34 + 'px' }">{{ endLabel }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { layersOf, flatDeps } from '../../v2/model.js'

const props = defineProps({
  /** [{ id, title, gate, who, foot, footTone, kind, deps, state, stateLabel, locked, added }] */
  nodes: { type: Array, default: () => [] },
  startLabel: { type: String, default: '' },
  endLabel: { type: String, default: '' },
  selected: { type: String, default: '' },
  /** 可点连线断开前置（只在实例编排里开） */
  editable: { type: Boolean, default: false },
  /** 紧凑模式：卡片窄一点，预览用 */
  dense: { type: Boolean, default: false },
  /** 覆盖卡宽与列间距（全屏预览用） */
  cardWidth: { type: Number, default: 0 },
  gapX: { type: Number, default: 0 }
})
const emit = defineEmits(['pick', 'unlink'])

const uid = Math.random().toString(36).slice(2, 7)
const arrowId = `fb-arrow-${uid}`
const arrowHotId = `fb-arrow-hot-${uid}`

const cardW = computed(() => props.cardWidth || (props.dense ? 186 : 236))
const GAP_X = computed(() => props.gapX || (props.dense ? 44 : 58))
const GAP_Y = 14
const HEAD_H = 58
const PAD = 8
const startW = computed(() => (props.startLabel ? 126 : 0))

const canvasRef = ref(null)
const hoverId = ref('')
const heights = reactive({})
const cardEls = new Map()
function setCardRef (id, el) {
  if (el) cardEls.set(id, el)
  else cardEls.delete(id)
}

/** 列 = 层。同层可同时办，所以竖着摆在一条列里 */
const cols = computed(() => {
  const lv = layersOf(props.nodes)
  const out = []
  props.nodes.forEach((n) => {
    const l = lv[n.id] ?? 0
    if (!out[l]) out[l] = []
    out[l].push(n)
  })
  return Array.from(out, (x) => x || [])
})

const colX = (ci) => PAD + startW.value + ci * (cardW.value + GAP_X.value)

const placed = computed(() => {
  const m = {}
  cols.value.forEach((col, ci) => {
    let y = HEAD_H
    col.forEach((n) => {
      const h = heights[n.id] || (props.dense ? 64 : 74)
      m[n.id] = { x: colX(ci), y, h, col: ci }
      y += h + GAP_Y
    })
  })
  return m
})

const canvasW = computed(() => {
  const n = Math.max(cols.value.length, 1)
  return PAD * 2 + startW.value + n * (cardW.value + GAP_X.value) - GAP_X.value + 24
})
const canvasH = computed(() => {
  const ys = Object.values(placed.value).map((p) => p.y + p.h)
  const bottom = ys.length ? Math.max(...ys) : HEAD_H
  return Math.max(bottom + 24 + (props.endLabel ? 26 : 0), 200)
})

const edges = computed(() => {
  const out = []
  const w = cardW.value
  props.nodes.forEach((n) => {
    flatDeps(n.deps || []).forEach((dep) => {
      const a = placed.value[dep]
      const b = placed.value[n.id]
      if (!a || !b) return
      if (a.col >= b.col) return
      const p1 = { x: a.x + w, y: a.y + a.h / 2 }
      // 终点略退到卡片外侧，箭头才看得见又不被卡片压住一半
      const p2 = { x: b.x - 4, y: b.y + b.h / 2 }
      const dx = Math.max(24, (p2.x - p1.x) * 0.42)
      out.push({
        from: dep,
        to: n.id,
        d: `M ${p1.x} ${p1.y} C ${p1.x + dx} ${p1.y}, ${p2.x - dx} ${p2.y}, ${p2.x} ${p2.y}`
      })
    })
  })
  return out
})

function edgeCls (e) {
  if (!hoverId.value) return ''
  if (e.from === hoverId.value || e.to === hoverId.value) return 'hot'
  return 'dim'
}

/** 只留本卡、它的直接前置与直接下游，其余淡出 */
function relatedTo (id, other) {
  if (id === other) return true
  const a = props.nodes.find((x) => x.id === id)
  const b = props.nodes.find((x) => x.id === other)
  if (!a || !b) return true
  return flatDeps(a.deps || []).includes(other) || flatDeps(b.deps || []).includes(id)
}

function unlink (e) {
  if (!props.editable) return
  emit('unlink', { from: e.from, to: e.to })
}

function measure () {
  cardEls.forEach((el, id) => {
    const h = el?.offsetHeight || 0
    if (h && Math.abs((heights[id] || 0) - h) > 0.5) heights[id] = h
  })
}

/** 选中的那一张要在视野里 —— 否则点完找不到高亮在哪 */
function ensureVisible (id) {
  const el = cardEls.get(id)
  const wrap = el?.closest('.fb-scroll')
  if (!el || !wrap) return
  const r = el.getBoundingClientRect()
  const w = wrap.getBoundingClientRect()
  if (r.top < w.top) wrap.scrollTop -= w.top - r.top + 8
  else if (r.bottom > w.bottom) wrap.scrollTop += r.bottom - w.bottom + 8
  if (r.left < w.left) wrap.scrollLeft -= w.left - r.left + 8
  else if (r.right > w.right) wrap.scrollLeft += r.right - w.right + 8
}

watch(() => props.selected, (id) => {
  if (id) nextTick(() => ensureVisible(id))
})

onMounted(() => {
  nextTick(measure)
  setTimeout(measure, 80)
  setTimeout(measure, 320)
  window.addEventListener('resize', measure)
})
onBeforeUnmount(() => window.removeEventListener('resize', measure))
watch(() => props.nodes, () => { nextTick(measure); setTimeout(measure, 60) }, { deep: true })
watch(() => [props.nodes.length, props.dense], () => { nextTick(measure); setTimeout(measure, 60) })
</script>

<style scoped>
.fb-scroll { width: 100%; height: 100%; overflow: auto; background: #fff; }
.fb-canvas { position: relative; min-width: 100%; }

.fb-edges { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.edge { stroke: #c9c3e4; stroke-width: 1.5; transition: opacity .15s, stroke .15s; }
.edge.hot { stroke: #6b5bd2; stroke-width: 2.1; }
.edge.dim { opacity: .18; }

.fb-pill { position: absolute; z-index: 2; font-size: 12px; font-weight: 600; border-radius: 999px; padding: 6px 16px; white-space: nowrap; }
.fb-pill.start { left: 8px; top: 12px; color: #534ab7; background: #eeedfe; }
.fb-pill.end { left: 50%; transform: translateX(-50%); color: #0f6e56; background: #e1f5ee; }

/* 列头行：纵向滚动时贴顶，横向随内容走 */
.fb-heads { position: sticky; top: 0; left: 0; height: 58px; z-index: 3; background: #fff; box-shadow: 0 1px 0 #f4f2f8; }

/* 列头 */
.fb-col { position: absolute; top: 6px; display: flex; flex-direction: column; align-items: center; gap: 1px; }
.fb-dot { width: 7px; height: 7px; border-radius: 50%; border: 1.6px solid #b7b0d6; background: #fff; margin-bottom: 2px; }
.fb-step { font-size: 12px; font-weight: 600; color: #3c3a47; }
.fb-cond { font-size: 10px; color: #b0aebe; white-space: nowrap; }

/* 卡片 */
.fb-card {
  position: absolute; z-index: 1; box-sizing: border-box;
  background: #fff; border: 1px solid #e9e7ef; border-radius: 10px;
  padding: 9px 11px 9px 12px; cursor: pointer;
  transition: box-shadow .15s, border-color .15s, opacity .15s;
}
.fb-card:hover { border-color: #b9b2d4; box-shadow: 0 4px 14px rgb(83 74 183 / .12); }
.fb-card.sel { border-color: #a40035; box-shadow: 0 0 0 3px rgb(164 0 53 / .09); }
.fb-card.dim { opacity: .42; }
.fb-card.sys { background: #fbfdff; border-style: dashed; }
.fb-card.done { border-left: 3px solid #1d9e75; }
.fb-card.running { border-left: 3px solid #6b5bd2; }
.fb-card.checking { border-left: 3px solid #d89b2a; }
.fb-card.rejected { border-left: 3px solid #b23b3b; }

.fc-top { display: flex; align-items: flex-start; gap: 6px; }
.fc-title {
  flex: 1; min-width: 0; font-size: 12.5px; font-weight: 600; color: #2c2a33; line-height: 1.4;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.fc-gate { flex: none; font-size: 9.5px; line-height: 1.6; padding: 0 5px; border-radius: 4px; white-space: nowrap; }
.fc-gate.must { color: #993556; background: #fbeaf0; }
.fc-gate.optional { color: #888780; background: #f1efe8; }
.fc-who { margin-top: 4px; font-size: 11px; color: #6b6879; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fc-foot { margin-top: 3px; font-size: 10px; line-height: 1.5; }
.fc-foot.ok { color: #1d8a63; }
.fc-foot.info { color: #6b5bd2; }
.fc-foot.mute { color: #a3a0a1; }
.fc-state { margin-top: 4px; font-size: 9.5px; color: #b0aebe; display: flex; align-items: center; gap: 3px; }
.fb-card.locked .fc-state { color: #9a6b00; }
.fc-added { position: absolute; top: -7px; right: 8px; font-size: 9px; color: #2f6fa8; background: #e8f1fa; border-radius: 4px; padding: 0 5px; }
</style>
