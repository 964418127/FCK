<template>
  <div class="ftf-page">
    <div class="page-header">
      <div class="header-main">
        <el-button link :icon="ArrowLeft" @click="router.push({ name: 'resign-flow-template' })">返回列表</el-button>
        <h1>{{ tpl.name }}</h1>
        <span class="chip">v{{ tpl.version }}</span>
        <span :class="['chip', tpl.status]">{{ tpl.status === 'active' ? '启用' : '停用' }}</span>
        <span class="chip scope">适用：{{ tpl.scope.jobs.join('、') }}</span>
      </div>
      <div class="header-right">
        <div class="header-stats">
          <span>{{ tpl.nodes.length }} 个节点</span>
          <span>必过 {{ mustCount }}</span>
          <span>系统检查 {{ sysCount }}</span>
          <span>链路 {{ levelCount }} 层</span>
        </div>
        <template v-if="editing">
          <el-button size="small" @click="autoLayout"><el-icon><MagicStick /></el-icon>&nbsp;一键整理</el-button>
          <el-button size="small" @click="addNode('manual')">+ 人工节点</el-button>
          <el-button size="small" @click="addNode('system')">+ 系统检查</el-button>
          <el-button size="small" type="primary" @click="editing = false">完成编排</el-button>
        </template>
        <el-button v-else size="small" type="primary" @click="enterEdit">进入编排</el-button>
      </div>
    </div>

    <div class="flow-wrap" :class="{ editing }">
      <div ref="canvasRef" class="flow-canvas" :style="{ width: canvasW + 'px', height: canvasH + 'px' }">
        <!-- 连线层 -->
        <svg ref="svgRef" class="edges" :width="canvasW" :height="canvasH">
          <defs>
            <marker id="ftf-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#a49bd8" />
            </marker>
            <marker id="ftf-arrow-hot" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#534ab7" />
            </marker>
            <marker id="ftf-arrow-link" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#1d9e75" />
            </marker>
          </defs>
          <path
            v-for="(e, i) in edges" :key="'h' + i"
            :d="e.d" fill="none" stroke="transparent" stroke-width="14"
            :style="{ pointerEvents: editing ? 'stroke' : 'none', cursor: 'pointer' }"
            @click.stop="removeDep(e)"
          />
          <path
            v-for="(e, i) in edges" :key="i"
            :d="e.d" fill="none"
            :class="['edge', edgeClass(e)]"
            :marker-end="edgeClass(e) === 'hot' ? 'url(#ftf-arrow-hot)' : 'url(#ftf-arrow)'"
          />
          <!-- 拖线预览 -->
          <path v-if="link" :d="linkPath" fill="none" stroke="#1d9e75" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#ftf-arrow-link)" />
        </svg>

        <!-- 起点 -->
        <div class="pill start" :style="pillStyle(startPos)">员工发起离职</div>

        <!-- 节点卡片 -->
        <div
          v-for="n in tpl.nodes"
          :key="n.id"
          :ref="el => setCardRef(n.id, el)"
          :data-id="n.id"
          :class="['fnode', n.gate, { sys: isSystemNode(n), dim: activeId && !isRelated(n), active: activeId === n.id, dragging: dragId === n.id, invalid: link && link.hoverId === n.id && !link.valid, targetable: link && link.hoverId === n.id && link.valid }]"
          :style="{ left: pos[n.id]?.x + 'px', top: pos[n.id]?.y + 'px' }"
          @mousedown="onCardMouseDown($event, n)"
          @click="onCardClick(n)"
        >
          <div class="fn-head">
            <span class="fn-name">{{ n.name || '（未命名节点）' }}</span>
            <span :class="['fn-gate', n.gate]">{{ n.gate === 'must' ? '必过' : (isSystemNode(n) ? '软性' : '可选') }}</span>
          </div>
          <div class="fn-owner">
            <template v-if="isSystemNode(n)">系统自动 · {{ checkSourceOf(n) }}</template>
            <template v-else>{{ roleLabelOf(n.role) }}<em v-if="n.override"> · 指定 {{ n.override }}</em></template>
          </div>
          <div class="fn-sub">
            <span v-if="isSystemNode(n)" class="fn-cycle">{{ cycleShortOf(n, !!n.deps.length) }}</span>
            <span v-else>{{ n.tasks.length ? n.tasks.length + ' 件待办事项' : '未配置事项' }}</span>
          </div>
          <!-- 编排模式：连接锚点 + 就地操作 -->
          <template v-if="editing">
            <span
              class="fn-anchor" title="拖到目标节点 = 让它等本节点办结"
              @mousedown.stop="startLink($event, n)"
            >⇣</span>
            <div class="fn-ops" @mousedown.stop>
              <span class="op" title="编辑节点内容" @click.stop="openEdit(n)">编辑</span>
              <span class="op danger" title="删除节点" @click.stop="removeNode(n)">删除</span>
            </div>
          </template>
        </div>

        <!-- 终点 -->
        <div class="pill end" :style="pillStyle(endPos)">全部节点办结 → 放行人事审批</div>

        <!-- 编排模式提示条 -->
        <div v-if="editing" class="edit-tip">
          拖卡片调整位置 · 拖卡片底部 <b>⇣</b> 到目标 = 让它等本节点办结 · 点连线删除前置 · 拖到会成环的节点会被拦截
        </div>
      </div>
    </div>

    <div class="flow-legend">
      <span class="lg must">必过</span>
      <span class="lg optional">可选 / 软性</span>
      <span class="lg sys">系统检查</span>
      <em v-if="!editing">箭头从节点指向「等它办结」的下游节点；悬停节点高亮它的前置与下游。</em>
      <em v-else>编排改动即时生效（原型存内存，不落库）。</em>
    </div>

    <!-- 详情抽屉（走查模式） -->
    <el-drawer v-model="detailDrawer" :title="current ? current.name : '节点详情'" size="440px" destroy-on-close>
      <div v-if="current" class="drawer-body">
        <div class="d-row"><span class="d-key">类型</span><span>{{ isSystemNode(current) ? '系统检查节点（' + checkLabelOf(current.sysKey) + '）' : '人工确认节点' }}</span></div>
        <div class="d-row"><span class="d-key">门禁</span><span>{{ current.gate === 'must' ? '必过（不通过将终止全部流程）' : (isSystemNode(current) ? '软性（只需结果，不阻塞放行）' : '可选（不通过只记录结果，可由人事跳过）') }}</span></div>
        <div class="d-row"><span class="d-key">负责人</span><span v-if="isSystemNode(current)">系统自动判定，无需人工确认</span><span v-else>{{ roleLabelOf(current.role) }}{{ current.override ? '（指定 ' + current.override + '）' : '（按角色解析到人）' }}</span></div>
        <div class="d-row"><span class="d-key">开始时机</span><span>{{ dispatchTextOf(tpl, current) }}</span></div>
        <div v-if="isSystemNode(current)" class="d-row"><span class="d-key">取数频率</span><span>{{ cycleTextOf(current, !!current.deps.length) }}</span></div>
        <template v-if="current.tasks.length">
          <div class="d-sec">待办事项（{{ current.tasks.length }}）</div>
          <div v-for="t in current.tasks" :key="t.id" class="d-task">
            <div class="dt-name">{{ t.name }}<span :class="['dt-proof', t.proof]">{{ proofTextOf(t) }}</span></div>
            <div v-if="t.require" class="dt-require">{{ t.require }}</div>
          </div>
        </template>
        <div class="d-sec">上下游</div>
        <div class="d-row"><span class="d-key">前置节点</span><span>{{ depsOf(tpl, current).map(d => d.name).join('、') || '无（发起后即可开始办理）' }}</span></div>
        <div class="d-row"><span class="d-key">下游节点</span><span>{{ dependentsOf(tpl, current.id).map(x => x.name).join('、') || '无（清单里最后一环）' }}</span></div>
        <div class="d-btns"><el-button size="small" @click="openEdit(current)">编辑此节点</el-button></div>
      </div>
    </el-drawer>

    <!-- 编辑抽屉（编排模式） -->
    <el-drawer v-model="editDrawer" :title="draft ? (isNew ? '添加节点' : '编辑节点') : ''" size="500px" destroy-on-close>
      <div v-if="draft" class="drawer-body">
        <div v-if="!isSystemNode(draft)" class="f-row">
          <label>节点名称</label>
          <el-input v-model="draft.name" placeholder="如：工作交接" maxlength="20" />
        </div>
        <div class="f-row">
          <label>门禁</label>
          <el-radio-group v-model="draft.gate">
            <el-radio value="must">必过</el-radio>
            <el-radio value="optional">{{ isSystemNode(draft) ? '软性' : '可选' }}</el-radio>
          </el-radio-group>
        </div>
        <template v-if="!isSystemNode(draft)">
          <div class="f-row">
            <label>负责人角色</label>
            <el-select v-model="draft.role" style="width: 100%">
              <el-option v-for="r in handoverRoles" :key="r.key" :label="r.label" :value="r.key" />
            </el-select>
          </div>
          <div class="f-row">
            <label>指定到人<span class="tip">（留空 = 按角色自动解析）</span></label>
            <el-input v-model="draft.override" placeholder="如：周芸" maxlength="12" clearable />
          </div>
        </template>
        <template v-else>
          <div class="f-row">
            <label>检查项<span class="tip">（公共枚举，同模板内不可重复）</span></label>
            <el-select v-model="draft.sysKey" style="width: 100%" @change="draft.name = checkLabelOf(draft.sysKey)">
              <el-option
                v-for="c in availableChecks" :key="c.key"
                :label="c.name + '（' + c.source + '）'" :value="c.key"
              />
            </el-select>
            <div v-if="draftDesc" class="f-desc">{{ draftDesc }}</div>
            <div class="f-def">
              <div class="fd-row pass">通过（最新镜像 · {{ defLogicLabel(checkDefOf(draft.sysKey).pass) }}）：{{ defJoin(checkDefOf(draft.sysKey).pass) || '—' }}</div>
              <div v-if="checkDefOf(draft.sysKey).soft" class="fd-row soft">软性（{{ defLogicLabel(checkDefOf(draft.sysKey).soft) }}）：{{ defJoin(checkDefOf(draft.sysKey).soft) }}</div>
              <div v-else class="fd-row soft">无软性区间：只会查到通过或未通过</div>
              <div class="fd-row fail">两者都不命中 → 未通过，由检查 Agent 在下一批次继续盘查</div>
            </div>
          </div>
          <div class="f-row">
            <label>取数频率<span class="tip">（流程多久去取一次 Agent 的最新结果；结果何时出新批次由 Agent 决定）</span></label>
            <div v-if="draft.fetchFreq === 'none'" class="iv-none">
              <span class="iv-hint">只取一次（不再取后续批次）</span>
              <el-button link type="primary" size="small" @click="draft.fetchFreq = '1h'">改为定期取数</el-button>
            </div>
            <div v-else class="iv-row">
              <span class="iv-k">每</span>
              <el-input-number v-model="ffNum" :min="1" :max="999" controls-position="right" style="width: 96px" />
              <el-select v-model="ffUnit" style="width: 88px">
                <el-option label="分钟" value="m" />
                <el-option label="小时" value="h" />
                <el-option label="天" value="d" />
              </el-select>
              <el-button link size="small" @click="draft.fetchFreq = 'none'">只取一次</el-button>
            </div>
          </div>
          <div class="f-row">
            <label>批次上限<span class="tip">（只计消费到的不同未通过批次；同一批次反复取到不重复计数）</span></label>
            <el-input-number v-model="draft.maxRuns" :min="1" :max="50" style="width: 100%" />
            <div class="f-desc">取到「通过」即办结、不再消耗；到上限仍无「通过」：必过 → 终止全部流程（单据作废重发）；软性 → 按「未取得结论」放行留痕。</div>
          </div>
        </template>

        <template v-if="!isSystemNode(draft)">
          <div class="f-sec">
            待办事项（{{ draft.tasks.length }}）
            <el-button link type="primary" size="small" @click="addTask">+ 加事项</el-button>
          </div>
          <div v-for="(t, ti) in draft.tasks" :key="t.id" class="task-edit">
            <div class="te-line">
              <el-input v-model="t.name" placeholder="事项名称" maxlength="16" style="flex: 1" />
              <el-button link size="small" type="danger" @click="draft.tasks.splice(ti, 1)">删</el-button>
            </div>
            <el-input v-model="t.require" placeholder="办理要求（可选）" maxlength="40" size="small" style="margin-top: 6px" />
            <div class="te-line" style="margin-top: 6px">
              <el-select v-model="t.proof" size="small" style="width: 110px">
                <el-option label="无需附件" value="none" />
                <el-option label="可选附件" value="optional" />
                <el-option label="必传附件" value="must" />
              </el-select>
              <el-input-number v-if="t.proof !== 'none'" v-model="t.proofMax" :min="1" :max="5" size="small" style="width: 90px" />
            </div>
          </div>
        </template>

        <div class="d-btns">
          <el-button type="primary" @click="saveDraft">保存</el-button>
          <el-button @click="editDrawer = false">取消</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, MagicStick } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  templateOf, nodeOf, depsOf, dependentsOf, levelGroupsOf,
  dispatchTextOf, isSystemNode, cycleTextOf, cycleShortOf, parseFetchFreq, checkDefOf, defJoin, defLogicLabel,
  roleLabelOf, checkLabelOf, handoverRoles, systemCheckDict
} from '../../mock/resignHandoverPd.js'

const route = useRoute()
const router = useRouter()

/* reactive() 对同一原始对象返回同一代理 → 画布上的编排改动直接写进 mock 数据 */
const tpl = computed(() => reactive(templateOf(route.query.id) || templateOf('rft-01')))
const mustCount = computed(() => tpl.value.nodes.filter(n => n.gate === 'must').length)
const sysCount = computed(() => tpl.value.nodes.filter(isSystemNode).length)
const levelCount = computed(() => levelGroupsOf(tpl.value).length)

/* ---------------- 画布布局：自由拖 + 一键整理 ---------------- */
const CARD_W = 252, ROW_H = 122, TOP = 76, GX = 44
const pos = reactive({})
const canvasW = ref(900)
const canvasH = ref(560)
const editing = ref(false)
const canvasRef = ref(null)
const cardEls = new Map()
const heights = reactive({})
const setCardRef = (id, el) => { if (el) cardEls.set(id, el); else cardEls.delete(id) }

const maxY = () => Math.max(TOP, ...Object.values(pos).map(p => p.y))
const startPos = computed(() => ({ x: canvasW.value / 2 - 60, y: 14 }))
const endPos = computed(() => ({ x: canvasW.value / 2 - 110, y: maxY() + 108 }))
const pillStyle = (p) => ({ left: p.x + 'px', top: p.y + 'px' })

function autoLayout() {
  const gs = levelGroupsOf(tpl.value)
  canvasW.value = Math.max(860, ...gs.map(g => g.nodes.length * (CARD_W + GX) - GX + 80))
  gs.forEach((g, gi) => {
    const totalW = g.nodes.length * CARD_W + (g.nodes.length - 1) * GX
    g.nodes.forEach((n, ni) => {
      pos[n.id] = { x: (canvasW.value - totalW) / 2 + ni * (CARD_W + GX), y: TOP + gi * ROW_H }
    })
  })
  canvasH.value = maxY() + 176
  nextTick(scheduleEdges)
}

/* ---------------- 连线 ---------------- */
const edges = ref([])
const activeId = ref(null)
const dragId = ref(null)
const link = ref(null)          // { from, cur:{x,y}, hoverId, valid }
let edgeRaf = 0

const scheduleEdges = () => {
  cancelAnimationFrame(edgeRaf)
  edgeRaf = requestAnimationFrame(computeEdges)
}

function computeEdges() {
  for (const [id, el] of cardEls) heights[id] = el?.offsetHeight || 84
  const bottom = (id) => ({ x: pos[id].x + CARD_W / 2, y: pos[id].y + (heights[id] || 84) })
  const top = (id) => ({ x: pos[id].x + CARD_W / 2, y: pos[id].y })
  const curve = (a, b) => {
    const dy = Math.max(26, Math.abs(b.y - a.y) / 2)
    return `M ${a.x} ${a.y} C ${a.x} ${a.y + dy}, ${b.x} ${b.y - dy}, ${b.x} ${b.y}`
  }
  const segs = []
  const sp = { x: canvasW.value / 2, y: startPos.value.y + 30 }
  for (const n of tpl.value.nodes.filter(x => !(x.deps || []).length)) segs.push({ from: 'start', to: n.id, d: curve(sp, top(n.id)) })
  for (const n of tpl.value.nodes) {
    for (const d of depsOf(tpl.value, n)) segs.push({ from: d.id, to: n.id, d: curve(bottom(d.id), top(n.id)) })
  }
  const ep = { x: canvasW.value / 2, y: endPos.value.y }
  for (const n of tpl.value.nodes.filter(x => !dependentsOf(tpl.value, x.id).length)) segs.push({ from: n.id, to: 'end', d: curve(bottom(n.id), ep) })
  edges.value = segs
}

const edgeClass = (e) => {
  if (!activeId.value) return ''
  if (e.from === activeId.value || e.to === activeId.value) return 'hot'
  return 'dim'
}
const isRelated = (n) => {
  if (!activeId.value) return true
  const cur = nodeOf(tpl.value, activeId.value)
  if (!cur) return true
  return n.id === activeId.value || (cur.deps || []).includes(n.id) || (n.deps || []).includes(activeId.value)
}

const linkPath = computed(() => {
  if (!link.value) return ''
  const a = { x: pos[link.value.from].x + CARD_W / 2, y: pos[link.value.from].y + (heights[link.value.from] || 84) }
  const b = link.value.cur
  const dy = Math.max(26, Math.abs(b.y - a.y) / 2)
  return `M ${a.x} ${a.y} C ${a.x} ${a.y + dy}, ${b.x} ${b.y - dy}, ${b.x} ${b.y}`
})

/** target 是否是 from 的祖先（= 连过去会成环） */
function isAncestor(target, fromId) {
  const seen = new Set()
  const walk = (id) => {
    if (seen.has(id)) return false
    seen.add(id)
    if (id === target) return true
    return (nodeOf(tpl.value, id)?.deps || []).some(walk)
  }
  return walk(fromId)
}

/* ---------------- 交互：拖卡片 / 拖连线 / 点击 ---------------- */
const grab = { dx: 0, dy: 0, moved: false }

function onCardMouseDown(e, n) {
  if (!editing.value) return
  const r = canvasRef.value.getBoundingClientRect()
  grab.dx = e.clientX - r.left - pos[n.id].x
  grab.dy = e.clientY - r.top - pos[n.id].y
  grab.moved = false
  dragId.value = n.id
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

function startLink(e, n) {
  const r = canvasRef.value.getBoundingClientRect()
  link.value = { from: n.id, cur: { x: e.clientX - r.left, y: e.clientY - r.top }, hoverId: null, valid: false }
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(e) {
  const r = canvasRef.value.getBoundingClientRect()
  if (dragId.value) {
    grab.moved = true
    const p = pos[dragId.value]
    p.x = Math.max(4, e.clientX - r.left - grab.dx)
    p.y = Math.max(52, e.clientY - r.top - grab.dy)
    canvasH.value = Math.max(canvasH.value, p.y + 176)
    scheduleEdges()
  } else if (link.value) {
    link.value.cur = { x: e.clientX - r.left, y: e.clientY - r.top }
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest?.('.fnode')
    const hoverId = el?.dataset?.id || null
    link.value.hoverId = hoverId
    link.value.valid = !!hoverId && hoverId !== link.value.from && !isAncestor(hoverId, link.value.from) &&
      !nodeOf(tpl.value, hoverId).deps.includes(link.value.from)
    scheduleEdges()
  }
}

function onMouseUp() {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
  if (link.value) {
    const { from, hoverId, valid } = link.value
    if (valid) {
      nodeOf(tpl.value, hoverId).deps.push(from)
      const a = nodeOf(tpl.value, from), b = nodeOf(tpl.value, hoverId)
      ElMessage.success(`已连上：「${b.name || '未命名'}」将等「${a.name || '未命名'}」办结后才能开始办理`)
      canvasH.value = Math.max(canvasH.value, maxY() + 176)
      scheduleEdges()
    } else if (hoverId && hoverId !== from) {
      const b = nodeOf(tpl.value, hoverId)
      if (b.deps.includes(from)) ElMessage.info('这个前置已经连过了')
      else ElMessage.error('不能连：会形成循环依赖')
    }
    link.value = null
    scheduleEdges()
  }
  setTimeout(() => { dragId.value = null }, 0)
}

function onCardClick(n) {
  if (editing.value) {
    if (grab.moved) return
    openEdit(n)
  } else {
    current.value = n
    detailDrawer.value = true
  }
}

/* ---------------- 结构编排：连线删除 / 加删节点 ---------------- */
function removeDep(e) {
  if (!editing.value || e.from === 'start' || e.to === 'end') return
  const b = nodeOf(tpl.value, e.to), a = nodeOf(tpl.value, e.from)
  if (!b || !a) return
  b.deps = b.deps.filter(x => x !== e.from)
  ElMessage.success(`已断开：「${b.name || '未命名'}」不再等「${a.name || '未命名'}」`)
  scheduleEdges()
}

function addNode(kind) {
  const nid = 'k' + Math.random().toString(36).slice(2, 6)
  const node = kind === 'system'
    ? { id: nid, kind: 'system', sysKey: availableChecks.value[0]?.key || 'debt', name: availableChecks.value[0]?.name || '新检查项', gate: 'must', deps: [], fetchFreq: '1d', maxRuns: 5, tasks: [] }
    : { id: nid, kind: 'manual', name: '', role: 'store-manager', gate: 'must', override: null, deps: [], tasks: [] }
  tpl.value.nodes.push(node)
  pos[nid] = { x: canvasW.value / 2 - CARD_W / 2 + (Math.random() * 80 - 40), y: maxY() + ROW_H - 40 }
  canvasH.value = Math.max(canvasH.value, pos[nid].y + 176)
  nextTick(() => { openEdit(node); scheduleEdges() })
}

function removeNode(n) {
  ElMessageBox.confirm(
    `删除「${n.name || '未命名节点'}」？等它的节点会自动去掉这个前置。`,
    '删除节点',
    { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
  ).then(() => {
    tpl.value.nodes = tpl.value.nodes.filter(x => x.id !== n.id)
    for (const x of tpl.value.nodes) x.deps = (x.deps || []).filter(d => d !== n.id)
    delete pos[n.id]
    ElMessage.success('已删除')
    nextTick(scheduleEdges)
  }).catch(() => {})
}

/* ---------------- 内容编辑抽屉 ---------------- */
const editDrawer = ref(false)
const detailDrawer = ref(false)
const current = ref(null)
const draft = ref(null)
const isNew = ref(false)

const availableChecks = computed(() => {
  const used = new Set(tpl.value.nodes.filter(isSystemNode).map(n => n.sysKey))
  if (draft.value && isSystemNode(draft.value)) used.delete(draft.value.sysKey)
  return systemCheckDict.filter(c => !used.has(c.key))
})
const draftDesc = computed(() => systemCheckDict.find(c => c.key === draft.value?.sysKey)?.desc || '')

/* 取数频率 = 数字 + 单位（分钟/小时/天），mock 里存 `<n><单位>` 字符串 */
const ffNum = computed({
  get: () => parseFetchFreq(draft.value?.fetchFreq)?.num ?? 1,
  set: (v) => { if (v) draft.value.fetchFreq = `${v}${ffUnit.value}` }
})
const ffUnit = computed({
  get: () => parseFetchFreq(draft.value?.fetchFreq)?.unit ?? 'h',
  set: (u) => { draft.value.fetchFreq = `${ffNum.value}${u}` }
})

function openEdit(n) {
  isNew.value = false
  draft.value = JSON.parse(JSON.stringify(n))
  if (isSystemNode(draft.value)) {
    if (draft.value.fetchFreq == null) draft.value.fetchFreq = '1d'
    if (draft.value.maxRuns == null) draft.value.maxRuns = 5
  }
  editDrawer.value = true
}
function addTask() {
  draft.value.tasks.push({ id: 't' + (draft.value.tasks.length + 1) + Math.random().toString(36).slice(2, 4), name: '', require: '', proof: 'none', proofMax: 1 })
}
function saveDraft() {
  /* 系统节点名称跟随公共枚举，不可自填 */
  if (isSystemNode(draft.value)) draft.value.name = checkLabelOf(draft.value.sysKey)
  if (!draft.value.name?.trim()) { ElMessage.warning('请填写节点名称'); return }
  const target = nodeOf(tpl.value, draft.value.id)
  const clean = JSON.parse(JSON.stringify(draft.value))
  if (isSystemNode(clean)) { clean.tasks = []; if (clean.gate === 'must') clean.maxRuns = null }
  Object.assign(target, clean)
  editDrawer.value = false
  ElMessage.success('已保存')
  nextTick(scheduleEdges)
}

/* ---------------- 走查详情 ---------------- */
const proofTextOf = (t) => t.proof === 'must' ? `必传 ≤${t.proofMax || 1}` : t.proof === 'optional' ? `可选 ≤${t.proofMax || 1}` : '无需附件'
const checkSourceOf = (n) => (systemCheckDict.find(c => c.key === n.sysKey) || {}).source || '系统'

/* ---------------- 生命周期 ---------------- */
function enterEdit() {
  editing.value = true
  ElMessage.info('编排模式：拖卡片 / 拖锚点连线 / 点连线删除')
}
onMounted(() => {
  autoLayout()
  setTimeout(scheduleEdges, 350)
  window.addEventListener('resize', scheduleEdges)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', scheduleEdges)
  cancelAnimationFrame(edgeRaf)
})
watch(() => route.query.id, () => nextTick(() => { autoLayout(); setTimeout(scheduleEdges, 60) }))
</script>

<style scoped>
.ftf-page { max-width: 1280px; margin: 0 auto; }

.page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 14px; flex-wrap: wrap; }
.header-main { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.header-main h1 { font-size: 19px; font-weight: 600; color: #2f2b3a; margin: 0; }
.chip { font-size: 11.5px; border-radius: 8px; padding: 2px 9px; background: #f1efe8; color: #888780; }
.chip.active { background: #e1f5ee; color: #0f6e56; }
.chip.disabled { background: #fbeaf0; color: #993556; }
.chip.scope { background: #eeedfe; color: #534ab7; }
.header-right { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.header-stats { display: flex; gap: 8px; font-size: 12.5px; color: #6b6880; }
.header-stats span { background: #fff; border: 1px solid #ececf0; border-radius: 8px; padding: 3px 10px; }

/* ---------- 画布 ---------- */
.flow-wrap { background: #fff; border: 1px solid #ececf0; border-radius: 12px; padding: 14px; overflow: auto; }
.flow-canvas { position: relative; min-width: 860px; }
.flow-wrap.editing .flow-canvas { background-image: radial-gradient(#e7e5ef 1px, transparent 1px); background-size: 22px 22px; }
.edges { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.edge { stroke: #c9c3e4; stroke-width: 1.6; transition: opacity .15s, stroke .15s; }
.edge.hot { stroke: #534ab7; stroke-width: 2.2; }
.edge.dim { opacity: .12; }

.pill { position: absolute; z-index: 1; font-size: 12.5px; font-weight: 600; border-radius: 999px; padding: 7px 22px; white-space: nowrap; }
.pill.start { color: #534ab7; background: #eeedfe; }
.pill.end { color: #0f6e56; background: #e1f5ee; }

.fnode { position: absolute; z-index: 1; width: 252px; background: #fff; border: 1px solid #e4e2ea; border-radius: 10px; padding: 11px 13px; transition: box-shadow .15s, border-color .15s, opacity .15s, left .28s, top .28s; }
.flow-wrap.editing .fnode { cursor: grab; transition: box-shadow .15s, border-color .15s, opacity .15s; }
.fnode.dragging { cursor: grabbing; z-index: 5; box-shadow: 0 8px 22px rgb(83 74 183 / .18); }
.fnode:hover, .fnode.active { border-color: #534ab7; box-shadow: 0 4px 14px rgb(83 74 183 / .14); }
.fnode.dim { opacity: .38; }
.fnode.sys { border-style: dashed; background: #fbfdff; }
.fnode.targetable { border-color: #1d9e75; box-shadow: 0 0 0 3px rgb(29 158 117 / .16); }
.fnode.invalid { border-color: #a32d2d; box-shadow: 0 0 0 3px rgb(163 45 45 / .14); cursor: not-allowed; }
.fn-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.fn-name { font-size: 13px; font-weight: 600; color: #333; }
.fn-gate { font-size: 10.5px; border-radius: 8px; padding: 0 7px; flex-shrink: 0; }
.fn-gate.must { color: #993556; background: #fbeaf0; }
.fn-gate.optional { color: #888780; background: #f1efe8; }
.fn-owner { font-size: 11.5px; color: #6b6880; margin-top: 4px; }
.fn-owner em { font-style: normal; color: #993556; }
.fn-sub { font-size: 11px; color: #a3a0a1; margin-top: 3px; }
.fn-cycle { color: #0b5e8a; }

.fn-anchor { position: absolute; left: 50%; bottom: -13px; transform: translateX(-50%); width: 26px; height: 26px; border-radius: 50%; background: #534ab7; color: #fff; font-size: 14px; line-height: 26px; text-align: center; cursor: crosshair; z-index: 6; box-shadow: 0 0 0 3px #fff; }
.fn-anchor:hover { background: #3c3489; }
.fn-ops { position: absolute; top: -12px; right: 8px; display: none; gap: 4px; }
.fnode:hover .fn-ops { display: flex; }
.fn-ops .op { font-size: 11px; background: #fff; border: 1px solid #d9d6ea; border-radius: 8px; padding: 2px 9px; color: #534ab7; cursor: pointer; }
.fn-ops .op.danger { color: #a32d2d; border-color: #ecc9c9; }
.fn-ops .op:hover { background: #f4f3fb; }

.edit-tip { position: absolute; left: 8px; top: 8px; z-index: 2; font-size: 11.5px; color: #6b6880; background: #f4f3fb; border: 1px solid #e4e2ea; border-radius: 8px; padding: 6px 12px; }
.edit-tip b { color: #534ab7; }

.flow-legend { display: flex; align-items: center; gap: 10px; margin-top: 12px; font-size: 11.5px; color: #a3a0a1; }
.flow-legend em { font-style: normal; }
.lg { border-radius: 8px; padding: 1px 9px; }
.lg.must { color: #993556; background: #fbeaf0; }
.lg.optional { color: #888780; background: #f1efe8; }
.lg.sys { color: #0b5e8a; background: #e3f1fa; }

/* ---------- 抽屉 ---------- */
.drawer-body { font-size: 13px; color: #444; }
.d-row { display: flex; gap: 10px; padding: 5px 0; line-height: 1.6; }
.d-key { width: 64px; flex-shrink: 0; color: #8a8794; }
.d-sec { font-size: 12px; font-weight: 600; color: #6b6880; margin: 14px 0 6px; padding-top: 10px; border-top: 1px dashed #ececf0; }
.d-task { background: #f9f9fb; border-radius: 8px; padding: 8px 10px; margin-bottom: 6px; }
.dt-name { font-weight: 600; font-size: 12.5px; display: flex; align-items: center; gap: 8px; }
.dt-proof { font-size: 10.5px; font-weight: 400; border-radius: 8px; padding: 0 7px; }
.dt-proof.must { color: #993556; background: #fbeaf0; }
.dt-proof.optional { color: #888780; background: #f1efe8; }
.dt-proof.none { color: #a3a0a1; background: #f1f0f3; }
.dt-require { font-size: 11.5px; color: #8a8794; margin-top: 3px; }
.d-btns { margin-top: 16px; display: flex; gap: 8px; }

.f-row { margin-bottom: 13px; }
.f-def { margin-top: 7px; border: 1px dashed #e2dfec; border-radius: 8px; padding: 7px 9px; }
.fd-row { font-size: 11px; line-height: 1.7; }
.fd-row.pass { color: #0f6e56; }
.fd-row.soft { color: #8a6d1f; }
.fd-row.fail { color: #b03030; }
.iv-row { display: flex; align-items: center; gap: 6px; }
.iv-none { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.iv-hint { font-size: 12px; color: #888; }
.f-row label { display: block; font-size: 12.5px; color: #555; margin-bottom: 5px; }
.f-row .tip { color: #a3a0a1; font-size: 11.5px; }
.f-desc { font-size: 11.5px; color: #8a8794; margin-top: 5px; }
.f-sec { display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: 600; color: #6b6880; margin: 16px 0 8px; padding-top: 10px; border-top: 1px dashed #ececf0; }
.task-edit { background: #f9f9fb; border-radius: 8px; padding: 9px 10px; margin-bottom: 8px; }
.te-line { display: flex; align-items: center; gap: 8px; }
</style>
