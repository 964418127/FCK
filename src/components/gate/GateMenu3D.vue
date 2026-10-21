/**
 * 菜单 3D 视图 —— 「菜单街区」。
 *
 * 空间编码：
 *   X 轴 = 组内顺序（左→右）      Z 轴 = 分组顺序（前→后）      Y 轴/材质 = 可见性
 *   可见 = 立着的白色卡牌；隐藏 = 只剩轮廓线的空壳
 *
 * 交互：
 *   单击卡牌 → 切换显隐          拖卡牌 → 组内 / 跨组排序
 *   单击分组牌 → 整组显隐        拖分组牌 → 分组排序
 *   空白处拖 → 旋转视角          滚轮 → 缩放
 *
 * 这里只负责「画」和「手势」，不持有配置：所有改动通过 emit 交回 GateConfig，
 * 由它调 useGateConfig 的 setManyVisible / moveNode 落库，再回流成本组件的 nodes。
 *
 * 渲染是**增量**的：节点增删改才动场景，只换位置时走缓动，
 * 相机的朝向与缩放始终保留 —— 否则每拖一次都像整页刷新了一次。
 */
<template>
  <div class="gate3d" ref="wrap">
    <div ref="host" class="canvas-host"></div>

    <div class="hud">
      <div class="hud-count">
        <span class="dot dot-on"></span>可见 {{ visibleCount }}
        <span class="dot dot-off"></span>隐藏 {{ hiddenCount }}
        <span v-if="hiddenGroupCount" class="group-note">· {{ hiddenGroupCount }} 组整体隐藏</span>
      </div>

      <div class="hud-views">
        <button
          v-for="v in VIEWS"
          :key="v.key"
          class="view-btn"
          :class="{ active: viewName === v.key }"
          @click="setView(v.key)"
        >{{ v.label }}</button>
      </div>

      <div class="hud-hint">{{ hoverText || DEFAULT_HINT }}</div>
    </div>

    <div v-if="unsupported" class="fallback">
      当前环境不支持 WebGL，已自动切回列表视图。
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { gateState, isMenuVisible } from '../../composables/useGateConfig.js'

const props = defineProps({
  /** 已按配置排好序的整棵树（含被隐藏的项，隐藏项要画成空壳） */
  nodes: { type: Array, default: () => [] },
  tab: { type: String, default: 'web' }
})
const emit = defineEmits(['toggle', 'move', 'unsupported'])

const DEFAULT_HINT = '单击卡牌切换显隐 · 单击分组牌整组显隐 · 拖动调整顺序'

// 尺寸（世界单位）：一眼能读的卡牌比例
const SLOT = 1.18 // 槽位间距
const TW = 1.0 // 卡牌宽
const TH = 0.46 // 卡牌高
const TD = 0.12 // 卡牌厚
const LANE_GAP = 1.95 // 轨道纵深间距
const LANE_D = 0.85 // 轨道宽（Z 方向）
const GROUP_X = -1.15 // 分组牌中心 X
const GROUP_W = 1.86 // 分组牌宽

const VIEWS = [
  { key: 'iso', label: '等距' },
  { key: 'top', label: '俯视' },
  { key: 'front', label: '正视' }
]
const VIEW_DIRS = {
  iso: [0.95, 1.05, 1],
  // 俯视保留一点倾角：纯垂直朝下会与 up 向量退化（画面滚转），也看不到卡牌正面的文字
  top: [0.12, 1.05, 0.42],
  front: [0, 0.22, 1]
}
/** 取景系数：包围球留 30% 空边就够，再大场景会显得空 */
const FIT = 0.72
/** 每帧缓动系数：越大越「弹」，0.22 大约 0.2 秒到位 */
const EASE = 0.22

const wrap = ref(null)
const host = ref(null)
const unsupported = ref(false)
const hoverText = ref('')
const viewName = ref('iso')

const visibleCount = computed(
  () => gateModel.value.reduce((n, g) => n + g.children.filter((c) => !c.hidden).length, 0)
)
const hiddenCount = computed(
  () => gateModel.value.reduce((n, g) => n + g.children.filter((c) => c.hidden).length, 0)
)
const hiddenGroupCount = computed(() => gateModel.value.filter((g) => g.hidden).length)

/**
 * 场景模型：只保留渲染要用的信息。
 * 顺带把 hidden / order 读一遍，让显隐与排序的改动能触发同步。
 */
const gateModel = computed(() => {
  gateState.hidden.size
  gateState.order[props.tab]
  return (props.nodes || []).map((g, gi) => ({
    id: g.index,
    label: g.label,
    lane: gi,
    // 分组自身的显隐：关掉后整组从侧边栏消失
    hidden: !isMenuVisible(g.index),
    children: (g.children || []).map((c, ci) => ({
      id: c.index,
      label: c.label,
      slot: ci,
      hidden: !isMenuVisible(c.index),
      // 三级分组（模块薪酬 / 员工福利保障 的第二层）在 3D 里也是一张卡，
      // 但它的显隐要连带子项，跟列表里勾选一个分组是同一套语义
      hasChildren: !!(c.children && c.children.length)
    }))
  }))
})

const signature = computed(() =>
  gateModel.value
    .map((g) => `${g.id}${g.hidden ? '~' : ''}:${g.children.map((c) => `${c.id}${c.hidden ? '~' : ''}`).join(',')}`)
    .join('|')
)

// ---------- three 运行时（非响应式，避免把 three 对象塞进 reactive） ----------
let scene = null
let camera = null
let renderer = null
let controls = null
let raycaster = null
let root = null
let ghost = null
let frameId = 0
let observer = null

/** id → { id, mesh, label, hidden, accent, groupId, hasChildren } */
const tileMap = new Map()
/** id → { id, mesh, label, hidden, lane, group } */
const groupMap = new Map()

let tiles = [] // 供射线拾取，按模型顺序
let groupTiles = []
let lanes = [] // { mesh, parts, id, lane, z, startX, children }

let lastTab = ''

const bounds = { center: new THREE.Vector3(), radius: 6 }

const pointer = new THREE.Vector2()
const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.28)
let candidate = null // 按下但还没决定是点击还是拖拽
let dragging = null // { kind: 'tile' | 'group', ... }
let hoveredId = ''

// 视图在「3D ↔ 列表」来回切时保留，别每次都回到默认角度
let savedView = null

// ---------- 贴图 ----------
const labelCache = new Map()

function labelTexture (text, muted = false, aspect = TW / TH, accent = false) {
  const key = `${text}|${muted ? 1 : 0}|${accent ? 1 : 0}|${aspect.toFixed(2)}`
  if (labelCache.has(key)) return labelCache.get(key)

  const H = 118
  const W = Math.round(H * aspect)
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = muted ? '#F7F4F2' : accent ? '#FDF1F4' : '#FFFFFF'
  ctx.fillRect(0, 0, W, H)
  // 左侧一道竖条，代替真实光照下的明暗差
  ctx.fillStyle = muted ? '#D8D2CC' : accent ? '#EFC9D2' : '#EDE7E2'
  ctx.fillRect(0, 0, 5, H)

  let size = 34
  const font = (s) => `500 ${s}px "PingFang SC", "Microsoft YaHei", system-ui, sans-serif`
  ctx.font = font(size)
  while (ctx.measureText(text).width > W - 26 && size > 15) {
    size -= 2
    ctx.font = font(size)
  }
  ctx.fillStyle = muted ? '#A79F9A' : accent ? '#A40035' : '#2B2724'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, W / 2 + 2, H / 2)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  labelCache.set(key, tex)
  return tex
}

function tileMaterials (text, hidden, width = TW, accent = false) {
  const base = new THREE.MeshLambertMaterial({
    color: hidden ? 0xf3efec : accent ? 0xfdf1f4 : 0xffffff,
    transparent: hidden,
    opacity: hidden ? 0.22 : 1
  })
  const face = new THREE.MeshLambertMaterial({
    map: labelTexture(text, hidden, width / TH, accent),
    transparent: hidden,
    opacity: hidden ? 0.3 : 1
  })
  // BoxGeometry 的材质顺序：[+x, -x, +y, -y, +z, -z]，正面是 +z
  return [base, base, base, base, face, base]
}

function makeTile (text, { hidden = false, width = TW, accent = false } = {}) {
  const geo = new THREE.BoxGeometry(width, TH, TD)
  const mesh = new THREE.Mesh(geo, tileMaterials(text, hidden, width, accent))
  mesh.userData.width = width

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geo),
    new THREE.LineBasicMaterial({
      color: hidden ? 0xc4bdb8 : accent ? 0xe7b9c4 : 0xded8d3,
      transparent: true,
      opacity: hidden ? 0.9 : 0.85
    })
  )
  mesh.add(edges)
  return mesh
}

/** 只换外观（文字 / 显隐），几何体与位置不动，避免重建带来的跳变 */
function refreshMesh (rec, text, { width = TW, accent = false, hidden = false } = {}) {
  const next = tileMaterials(text, hidden, width, accent)
  const prev = Array.isArray(rec.mesh.material) ? rec.mesh.material : [rec.mesh.material]
  rec.mesh.material = next
  new Set(prev).forEach((m) => m && m.dispose())

  const edges = rec.mesh.children[0]
  if (edges && edges.material) {
    edges.material.color.set(hidden ? 0xc4bdb8 : accent ? 0xe7b9c4 : 0xded8d3)
    edges.material.opacity = hidden ? 0.9 : 0.85
  }
  rec.label = text
  rec.hidden = hidden
  rec.accent = accent
}

// ---------- 场景搭建 ----------
function disposeObject (obj) {
  obj.traverse((o) => {
    if (o.geometry) o.geometry.dispose()
    if (o.material) {
      const list = Array.isArray(o.material) ? o.material : [o.material]
      list.forEach((m) => m.dispose())
    }
  })
}

function setMeshTarget (mesh, x, y, z, immediate = false) {
  if (!mesh.userData.target) mesh.userData.target = new THREE.Vector3()
  mesh.userData.target.set(x, y, z)
  if (immediate) mesh.position.copy(mesh.userData.target)
}

function clearLanes () {
  lanes.forEach((lane) => {
    lane.parts.forEach((part) => {
      root.remove(part)
      disposeObject(part)
    })
  })
  lanes = []
}

/**
 * 增量同步：新增补、删除清、改了外观就换材质、只挪位置就走缓动。
 * 相机完全不碰 —— 这是「拖完像刷新」的根因，之前每次重建都会 applyView 复位。
 */
function syncScene () {
  if (!scene || !root) return

  const model = gateModel.value
  const liveTiles = new Set()
  const liveGroups = new Set()
  let structural = false

  // 轨道数量少，且宽度随卡牌数变化，整体重建最省事
  clearLanes()

  const nextGroupTiles = []
  const nextTiles = []

  model.forEach((group, gi) => {
    const z = gi * LANE_GAP
    const laneW = Math.max(group.children.length, 1) * SLOT + 0.5

    const laneGeo = new THREE.PlaneGeometry(laneW, LANE_D)
    const laneMesh = new THREE.Mesh(
      laneGeo,
      new THREE.MeshBasicMaterial({
        color: 0xf4f1ee,
        transparent: true,
        opacity: group.hidden ? 0.45 : 0.95,
        side: THREE.DoubleSide
      })
    )
    laneMesh.rotation.x = -Math.PI / 2
    laneMesh.position.set(laneW / 2, 0, z)

    const laneEdge = new THREE.LineSegments(
      new THREE.EdgesGeometry(laneGeo),
      new THREE.LineBasicMaterial({ color: 0xe4dfda, transparent: true, opacity: 0.9 })
    )
    laneEdge.rotation.x = -Math.PI / 2
    laneEdge.position.copy(laneMesh.position)

    root.add(laneMesh)
    root.add(laneEdge)
    lanes.push({
      mesh: laneMesh,
      parts: [laneMesh, laneEdge],
      id: group.id,
      lane: gi,
      z,
      startX: 0,
      children: group.children,
      hidden: group.hidden
    })

    // 分组牌（拖它 = 调整分组顺序，单击它 = 整组显隐）
    let grec = groupMap.get(group.id)
    if (!grec) {
      const mesh = makeTile(group.label, { width: GROUP_W, accent: true, hidden: group.hidden })
      root.add(mesh)
      grec = { id: group.id, mesh, label: group.label, hidden: group.hidden, accent: true }
      groupMap.set(group.id, grec)
      setMeshTarget(mesh, GROUP_X, TH / 2, z, true)
      structural = true
    } else {
      if (grec.label !== group.label || grec.hidden !== group.hidden) {
        refreshMesh(grec, group.label, { width: GROUP_W, accent: true, hidden: group.hidden })
      }
      setMeshTarget(grec.mesh, GROUP_X, TH / 2, z)
    }
    grec.lane = gi
    grec.group = group
    liveGroups.add(group.id)
    nextGroupTiles.push(grec)

    // 菜单卡牌
    group.children.forEach((child) => {
      const x = child.slot * SLOT + TW / 2 + 0.2
      let trec = tileMap.get(child.id)
      if (!trec) {
        const mesh = makeTile(child.label, { hidden: child.hidden })
        root.add(mesh)
        trec = {
          id: child.id,
          mesh,
          label: child.label,
          hidden: child.hidden,
          accent: false,
          groupId: group.id,
          hasChildren: child.hasChildren
        }
        tileMap.set(child.id, trec)
        setMeshTarget(mesh, x, TH / 2, z, true)
        structural = true
      } else {
        if (trec.label !== child.label || trec.hidden !== child.hidden) {
          refreshMesh(trec, child.label, { hidden: child.hidden })
        }
        setMeshTarget(trec.mesh, x, TH / 2, z)
      }
      trec.groupId = group.id
      trec.hasChildren = child.hasChildren
      liveTiles.add(child.id)
      nextTiles.push(trec)
    })
  })

  // 走掉的节点：从场景里摘掉并释放
  groupMap.forEach((rec, id) => {
    if (liveGroups.has(id)) return
    root.remove(rec.mesh)
    disposeObject(rec.mesh)
    groupMap.delete(id)
    structural = true
  })
  tileMap.forEach((rec, id) => {
    if (liveTiles.has(id)) return
    root.remove(rec.mesh)
    disposeObject(rec.mesh)
    tileMap.delete(id)
    structural = true
  })

  tiles = nextTiles
  groupTiles = nextGroupTiles

  computeBounds(model)

  if (lastTab !== props.tab) {
    lastTab = props.tab
    applyView(viewName.value, false)
  } else if (structural) {
    // 只调取景范围，不改朝向与缩放 —— 新增一组菜单不该把视角甩走
    fitFrustum()
  }
}

function computeBounds (model) {
  if (!model.length) {
    bounds.center.set(0, 0, 0)
    bounds.radius = 6
    return
  }
  const maxX = Math.max(...model.map((g) => Math.max(g.children.length, 1) * SLOT + 0.5))
  const depth = (model.length - 1) * LANE_GAP
  const minX = GROUP_X - GROUP_W / 2 - 0.1
  bounds.center.set((minX + maxX) / 2, TH / 2, depth / 2)
  bounds.radius = Math.max(1.6, 0.5 * Math.hypot(maxX - minX, depth + LANE_D, TH + 0.6))
}

// ---------- 相机 ----------
function fitFrustum () {
  if (!camera || !host.value) return
  const w = host.value.clientWidth || 1
  const h = host.value.clientHeight || 1
  const aspect = w / h
  let halfH = bounds.radius * FIT
  if (aspect < 1) halfH = (bounds.radius * FIT) / aspect
  const halfW = halfH * aspect
  camera.left = -halfW
  camera.right = halfW
  camera.top = halfH
  camera.bottom = -halfH
  camera.updateProjectionMatrix()
}

function applyView (name, animate = true) {
  if (!camera || !controls) return
  const dir = new THREE.Vector3(...(VIEW_DIRS[name] || VIEW_DIRS.iso)).normalize()
  const dist = Math.max(bounds.radius * 3.2, 8)
  const target = bounds.center.clone()
  camera.position.copy(target).add(dir.multiplyScalar(dist))
  camera.up.set(0, 1, 0)
  camera.lookAt(target)
  controls.target.copy(target)
  camera.zoom = name === 'front' ? 1 : 1.18
  fitFrustum()
  camera.updateProjectionMatrix()
  controls.update()
  viewName.value = name
  if (animate) pulse = 1
}

let pulse = 0

function setView (name) {
  applyView(name)
}

// ---------- 动效 ----------
function stepAnimations () {
  const skip = dragging && dragging.rec ? dragging.rec.mesh : null
  const step = (rec) => {
    const mesh = rec.mesh
    const target = mesh.userData.target
    if (!target || mesh === skip) return
    mesh.position.lerp(target, EASE)
    if (mesh.position.distanceToSquared(target) < 1e-5) mesh.position.copy(target)
  }
  tileMap.forEach(step)
  groupMap.forEach(step)
}

// ---------- 交互 ----------
function updatePointer (event) {
  const rect = host.value.getBoundingClientRect()
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
}

function pickTile () {
  raycaster.setFromCamera(pointer, camera)
  const hit = raycaster.intersectObjects(tiles.map((t) => t.mesh), false)[0]
  return hit ? tiles.find((t) => t.mesh === hit.object) : null
}

function pickGroup () {
  raycaster.setFromCamera(pointer, camera)
  const hit = raycaster.intersectObjects(groupTiles.map((t) => t.mesh), false)[0]
  return hit ? groupTiles.find((t) => t.mesh === hit.object) : null
}

function laneOfPoint (point) {
  let best = null
  lanes.forEach((lane) => {
    const d = Math.abs(point.z - lane.z)
    if (!best || d < best.d) best = { lane, d }
  })
  return best ? best.lane : null
}

function dropTargetOf (point) {
  const lane = laneOfPoint(point)
  if (!lane) return null
  const kids = lane.children
  if (!kids.length) return { targetId: lane.id, place: 'inside', x: lane.startX + 0.6, z: lane.z }

  const raw = (point.x - lane.startX - TW / 2 - 0.2) / SLOT
  const idx = Math.max(0, Math.min(kids.length - 1, Math.round(raw)))
  const child = kids[idx]
  const centerX = lane.startX + child.slot * SLOT + TW / 2 + 0.2
  const place = point.x < centerX ? 'before' : 'after'
  return {
    targetId: child.id,
    place,
    x: centerX + (place === 'before' ? -SLOT / 2 : SLOT / 2),
    z: lane.z
  }
}

function moveGhostTo (target) {
  if (!ghost) return
  if (!target) {
    ghost.visible = false
    return
  }
  ghost.visible = true
  ghost.position.set(target.x, 0, target.z)
}

function onPointerDown (event) {
  if (event.button !== 0) return
  updatePointer(event)

  // 分组牌：点击 = 整组显隐，所以拖拽阈值放宽一点，减少误触
  const group = pickGroup()
  if (group) {
    candidate = { kind: 'group', rec: group, x: event.clientX, y: event.clientY, moved: false, threshold: 8 }
    controls.enabled = false
    capturePointer(event)
    return
  }

  const tile = pickTile()
  if (!tile) return
  candidate = { kind: 'tile', rec: tile, x: event.clientX, y: event.clientY, moved: false, threshold: 6 }
  controls.enabled = false
  capturePointer(event)
}

/** 指针捕获必须设在监听元素（canvas）上；设到外层容器会让后续事件再也到不了 canvas */
function capturePointer (event) {
  try {
    renderer.domElement.setPointerCapture?.(event.pointerId)
  } catch (e) {
    /* 指针已失效等场景忽略 */
  }
}

function releasePointer (event) {
  try {
    renderer.domElement.releasePointerCapture?.(event.pointerId)
  } catch (e) {
    /* ignore */
  }
}

function onPointerMove (event) {
  updatePointer(event)

  if (candidate) {
    const dx = event.clientX - candidate.x
    const dy = event.clientY - candidate.y
    if (!candidate.moved && Math.hypot(dx, dy) < (candidate.threshold || 6)) return

    if (!candidate.moved) {
      candidate.moved = true
      dragging = { ...candidate }
      const mesh = dragging.rec.mesh
      mesh.scale.setScalar(1.03)
    }

    // 把指针投影到卡牌高度的平面上，卡牌跟着走
    raycaster.setFromCamera(pointer, camera)
    const planePoint = new THREE.Vector3()
    if (raycaster.ray.intersectPlane(dragPlane, planePoint)) {
      const mesh = dragging.rec.mesh
      mesh.position.x = planePoint.x
      mesh.position.z = planePoint.z
      mesh.position.y = TH / 2 + 0.16

      if (dragging.kind === 'tile') {
        moveGhostTo(dropTargetOf(planePoint))
      } else {
        // 分组拖拽：按 Z 找最近的分组槽
        const lane = laneOfPoint(planePoint)
        moveGhostTo(lane ? { x: GROUP_X, z: lane.z } : null)
      }
    }
    return
  }

  // 悬停
  const tile = pickTile()
  if (tile) {
    if (hoveredId !== tile.id) {
      hoveredId = tile.id
      const model = gateModel.value.find((g) => g.id === tile.groupId)
      const child = model && model.children.find((c) => c.id === tile.id)
      hoverText.value = child
        ? `${model.label} › ${child.label}${child.hasChildren ? '（整组）' : ''}`
        : tile.id
    }
    host.value.style.cursor = 'grab'
    return
  }

  hoveredId = ''
  const group = pickGroup()
  if (group) {
    const model = gateModel.value.find((g) => g.id === group.id)
    hoverText.value = model ? `${model.label}（整组）· 单击${model.hidden ? '显示' : '隐藏'}` : ''
    host.value.style.cursor = 'grab'
    return
  }
  hoverText.value = ''
  host.value.style.cursor = 'default'
}

function onPointerUp (event) {
  releasePointer(event)

  if (!candidate) {
    controls.enabled = true
    return
  }

  const { kind, rec, moved } = candidate

  if (!moved) {
    // 点击：分组牌 = 整组显隐；卡牌 = 自己显隐（三级分组也按整组走）
    emit('toggle', { id: rec.id, group: kind === 'group' || !!rec.hasChildren })
  } else {
    updatePointer(event)
    raycaster.setFromCamera(pointer, camera)
    const point = new THREE.Vector3()
    let landed = false
    if (raycaster.ray.intersectPlane(dragPlane, point)) {
      if (kind === 'tile') {
        const target = dropTargetOf(point)
        if (target && target.targetId !== rec.id) {
          emit('move', { dragId: rec.id, targetId: target.targetId, place: target.place })
          landed = true
        }
      } else {
        const lane = laneOfPoint(point)
        if (lane && lane.id !== rec.id) {
          const from = modelIndex(rec.id)
          const to = modelIndex(lane.id)
          emit('move', {
            dragId: rec.id,
            targetId: lane.id,
            place: to > from ? 'after' : 'before',
            group: true
          })
          landed = true
        }
      }
    }

    rec.mesh.scale.setScalar(1)
    if (landed) {
      // 先停在落点，等数据回流后再缓动到精确槽位，避免先弹回原位再滑过去
      const t = rec.mesh.userData.target
      if (t) t.copy(rec.mesh.position)
    }
    // 没落位：target 仍是模型位置，缓动会自己归位
  }

  if (ghost) ghost.visible = false
  candidate = null
  dragging = null
  controls.enabled = true
}

function modelIndex (id) {
  return gateModel.value.findIndex((g) => g.id === id)
}

function onPointerLeave () {
  hoveredId = ''
  hoverText.value = ''
}

// ---------- 生命周期 ----------
function init () {
  const el = host.value
  if (!el) return

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(el.clientWidth || 1, el.clientHeight || 1)
  el.appendChild(renderer.domElement)
  renderer.domElement.style.touchAction = 'none'

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xfbfaf9)

  camera = new THREE.OrthographicCamera(-6, 6, 4, -4, 0.1, 200)
  camera.position.set(8, 8, 8)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.minPolarAngle = 0.08
  controls.maxPolarAngle = 1.45
  controls.minZoom = 0.4
  controls.maxZoom = 3.2
  controls.rotateSpeed = 0.7

  raycaster = new THREE.Raycaster()

  scene.add(new THREE.HemisphereLight(0xffffff, 0xd9d3cd, 1.15))
  const dir = new THREE.DirectionalLight(0xffffff, 1.1)
  dir.position.set(6, 10, 7)
  scene.add(dir)
  const dir2 = new THREE.DirectionalLight(0xffffff, 0.35)
  dir2.position.set(-8, 6, -6)
  scene.add(dir2)

  root = new THREE.Group()
  scene.add(root)

  // 落位指示框（拖拽时出现）
  const g = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-TW / 2, 0, 0),
    new THREE.Vector3(TW / 2, 0, 0),
    new THREE.Vector3(TW / 2, TH, 0),
    new THREE.Vector3(-TW / 2, TH, 0),
    new THREE.Vector3(-TW / 2, 0, 0)
  ])
  ghost = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xa40035, transparent: true, opacity: 0.9 }))
  ghost.visible = false
  scene.add(ghost)

  syncScene()

  // 从列表视图切回来时，沿用上次的视角
  if (savedView) {
    camera.position.copy(savedView.position)
    camera.zoom = savedView.zoom
    controls.target.copy(savedView.target)
    viewName.value = savedView.name
    fitFrustum()
    camera.updateProjectionMatrix()
    controls.update()
  }
  lastTab = props.tab

  renderer.domElement.addEventListener('pointerdown', onPointerDown)
  renderer.domElement.addEventListener('pointermove', onPointerMove)
  renderer.domElement.addEventListener('pointerup', onPointerUp)
  renderer.domElement.addEventListener('pointerleave', onPointerLeave)

  observer = new ResizeObserver(() => {
    if (!renderer || !host.value) return
    const w = host.value.clientWidth || 1
    const h = host.value.clientHeight || 1
    renderer.setSize(w, h)
    fitFrustum()
  })
  observer.observe(el)

  const loop = () => {
    frameId = requestAnimationFrame(loop)
    controls.update()
    stepAnimations()
    if (pulse > 0 && root) {
      pulse = Math.max(0, pulse - 0.06)
      const s = 1 + Math.sin(pulse * Math.PI) * 0.015
      root.scale.setScalar(s)
    }
    renderer.render(scene, camera)
  }
  loop()
}

onMounted(() => {
  try {
    init()
  } catch (e) {
    // 没有 WebGL / 被策略禁用：明确告诉用户，由父组件负责切回列表视图
    unsupported.value = true
    emit('unsupported', e)
  }
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frameId)
  if (observer) observer.disconnect()
  if (camera && controls) {
    savedView = {
      position: camera.position.clone(),
      target: controls.target.clone(),
      zoom: camera.zoom,
      name: viewName.value
    }
  }
  if (renderer) {
    renderer.domElement.removeEventListener('pointerdown', onPointerDown)
    renderer.domElement.removeEventListener('pointermove', onPointerMove)
    renderer.domElement.removeEventListener('pointerup', onPointerUp)
    renderer.domElement.removeEventListener('pointerleave', onPointerLeave)
    if (root) disposeObject(root)
    if (ghost) disposeObject(ghost)
    labelCache.forEach((tex) => tex.dispose())
    labelCache.clear()
    renderer.dispose()
    if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement)
  }
  tileMap.clear()
  groupMap.clear()
  tiles = []
  groupTiles = []
  lanes = []
  renderer = null
  scene = null
  camera = null
  controls = null
  root = null
  ghost = null
  lastTab = ''
})

watch(signature, () => syncScene(), { flush: 'post' })

/** 把某张卡牌的世界坐标投到屏幕坐标（测试 / 辅助定位用） */
function screenPosOf (id) {
  const rec = tileMap.get(id) || groupMap.get(id)
  if (!rec || !camera || !host.value) return null
  const v = rec.mesh.position.clone().project(camera)
  const rect = host.value.getBoundingClientRect()
  return {
    x: rect.left + ((v.x + 1) / 2) * rect.width,
    y: rect.top + ((1 - v.y) / 2) * rect.height
  }
}

/** 某个屏幕坐标下射线命中的对象（测试用） */
function pickAt (clientX, clientY) {
  if (!camera || !host.value) return null
  const rect = host.value.getBoundingClientRect()
  pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1
  const tile = pickTile()
  const group = pickGroup()
  return {
    tile: tile ? tile.id : null,
    group: group ? group.id : null
  }
}

defineExpose({ setView, screenPosOf, pickAt })
</script>

<style scoped>
.gate3d {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 420px;
  border-radius: 10px;
  overflow: hidden;
  background: #fbfaf9;
}

.canvas-host {
  position: absolute;
  inset: 0;
}

.hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
}

.hud-count {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--background) / 0.82);
  border: 1px solid hsl(var(--border));
  border-radius: 999px;
  padding: 3px 10px;
  width: fit-content;
}

.group-note {
  margin-left: 2px;
  color: hsl(var(--primary));
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 2px;
}

.dot-on {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
}

.dot-off {
  border: 1px dashed hsl(var(--muted-foreground) / 0.7);
}

.hud-views {
  position: absolute;
  top: 12px;
  right: 14px;
  display: flex;
  pointer-events: auto;
  border: 1px solid hsl(var(--border));
  border-radius: 7px;
  overflow: hidden;
  background: hsl(var(--background) / 0.9);
}

.view-btn {
  appearance: none;
  border: none;
  background: transparent;
  padding: 4px 11px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
}

.view-btn + .view-btn {
  border-left: 1px solid hsl(var(--border));
}

.view-btn.active {
  color: hsl(var(--primary));
  font-weight: 500;
  background: hsl(var(--primary) / 0.06);
}

.hud-hint {
  margin-top: auto;
  font-size: 11.5px;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--background) / 0.8);
  border-radius: 6px;
  padding: 4px 9px;
  width: fit-content;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--background));
}
</style>
