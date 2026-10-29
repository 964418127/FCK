/**
 * 菜单门控（gate）：控制左侧 / 移动端菜单显示哪些项，配置存在**服务端**，全局一致。
 *
 * 为什么不用 localStorage 当唯一存储：它按「协议 + 域名 + 端口」隔离。
 * 同机两个页签开在不同端口、或换一台电脑（局域网访问 192.168.x.x），彼此都读不到。
 * 所以真实来源是服务端 `.gate-state.json`（见 scripts/gate-store.js）：
 *
 *   启动   bootstrapGate()  先用本机缓存铺一层（首帧不闪全套菜单）
 *          connectGate()    GET /api/gate 校正 → 打开 SSE，之后任何人的改动都会实时推过来
 *   改动   setItemVisible()  本地立即生效 → 防抖 POST /api/gate（带 Bearer token）→ 服务端广播给所有人
 *   登录   /gate 页需密钥；token 存 localStorage（跨页签共享，过期由 /api/gate/session 校验清理）
 *   降级   接口不存在（静态托管）或请求失败 → mode='local'，退回 localStorage + BroadcastChannel
 *
 * 链接 `?gate=<base64url(隐藏 id 数组)>` 仍然保留，作为「没有服务端接口」时的兜底。
 */
import { reactive } from 'vue'

const STORAGE_KEY = 'fck.menu-gate'
const TOKEN_KEY = 'fck.gate-token'
const API_BASE = '/api/gate'
const CHANNEL_NAME = 'fck.menu-gate'

/**
 * 本地文件（file://）打开时没有可用的 HTTP 接口：fetch 到 `file:///api/gate` 会被 CORS 拦，
 * 控制台一片红但其实只是降级。这里直接短路成「仅本机」，不发请求、不开 SSE。
 * 离线静态包双击打开就走这条。
 */
const isFileProtocol = () => typeof location !== 'undefined' && location.protocol === 'file:'

const readToken = () => {
  try {
    // localStorage 优先（跨页签共享：在 /gate 登录过，工作台等其他页签直接可用）；
    // sessionStorage 是老版本的存法，迁移期兜底读一次
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || ''
  } catch (e) {
    return ''
  }
}

export const gateState = reactive({
  hidden: new Set(),
  /** 每个端一份扁平顺序表（菜单 id 数组）。渲染时按 indexOf 定位置，取不到就落到组末 */
  order: { web: [], mobile: [], doc: [] },
  ready: false,
  /** 'server' = 服务端共享（真正的全局）；'local' = 仅本机（接口不可用时的降级） */
  mode: 'local',
  /** 是否连上服务端：null = 还没判定完，true / false = 已判定 */
  connected: null,
  updatedAt: null,
  lastError: '',
  /** 启动时是否从链接参数套用过配置（MainLayout 据此把 ?gate= 从地址栏抹掉） */
  consumedFromLink: false,
  /** 登录态（/gate 页专用） */
  token: readToken(),
  keyIsDefault: null,
  /** 撤销栈深度（响应式：给「撤销」按钮的 disabled 用） */
  undoDepth: 0
})

const encode = (ids) => {
  const bytes = new TextEncoder().encode(JSON.stringify(ids))
  let bin = ''
  bytes.forEach((b) => { bin += String.fromCharCode(b) })
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const decode = (raw) => {
  try {
    const b64 = String(raw).replace(/-/g, '+').replace(/_/g, '/')
    const bin = atob(b64)
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch (e) {
    return null
  }
}

const TABS = ['web', 'mobile', 'doc']

/** 把各种来源（老链接 = 纯数组 / 新结构 = {hidden, order}）统一成 {hidden, order} */
const normalizeState = (data) => {
  if (Array.isArray(data)) {
    return { hidden: data.filter((x) => typeof x === 'string'), order: null }
  }
  if (data && typeof data === 'object') {
    const hidden = Array.isArray(data.hidden) ? data.hidden.filter((x) => typeof x === 'string') : []
    const order = {}
    TABS.forEach((tab) => {
      const list = data.order && data.order[tab]
      order[tab] = Array.isArray(list) ? list.filter((x) => typeof x === 'string') : null
    })
    return { hidden, order }
  }
  return null
}

const applyHidden = (ids) => {
  gateState.hidden = new Set(Array.isArray(ids) ? ids : [])
}

/**
 * 套用一份配置。order 为 null 表示「这份来源没带顺序」——
 * 比如老版本的 ?gate= 链接、或者是别人只改了显隐的推送，此时保留现有顺序不动。
 * 两条 hidden / order 字段都没有的消息（脏消息、心跳体）直接忽略，不清空现有配置。
 */
const applyState = (data) => {
  const next = normalizeState(data)
  if (!next) return false
  if (data && typeof data === 'object' && !Array.isArray(data) &&
      data.hidden === undefined && data.order === undefined) {
    return false
  }
  applyHidden(next.hidden)
  if (next.order) {
    TABS.forEach((tab) => {
      if (next.order[tab]) gateState.order[tab] = next.order[tab]
    })
  }
  return true
}

const snapshot = () => ({
  hidden: [...gateState.hidden],
  order: { web: [...gateState.order.web], mobile: [...gateState.order.mobile], doc: [...gateState.order.doc] }
})

const persistLocal = () => {
  try {
    localStorage.setItem(STORAGE_KEY, encode(snapshot()))
  } catch (e) {
    /* 隐身模式等场景写不进去，忽略即可 */
  }
}

const saveToken = (token) => {
  gateState.token = token || ''
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
    // 老版本写在 sessionStorage，清掉避免两处不一致
    sessionStorage.removeItem(TOKEN_KEY)
  } catch (e) {
    /* ignore */
  }
}

const authHeaders = () => (gateState.token ? { Authorization: `Bearer ${gateState.token}` } : {})

// ---------- 同浏览器其它页签（local 模式兜底；server 模式下 SSE 已覆盖，这里只是双保险）----------
let channel = null

const openChannel = () => {
  if (channel) return
  if (typeof BroadcastChannel !== 'undefined') {
    channel = new BroadcastChannel(CHANNEL_NAME)
    channel.onmessage = (ev) => {
      if (ev.data) {
        applyState(ev.data)
        persistLocal()
      }
    }
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (ev) => {
      if (ev.key !== STORAGE_KEY || !ev.newValue) return
      const data = decode(ev.newValue)
      if (data) applyState(data)
    })
  }
}

const broadcastLocal = () => {
  if (channel) {
    try {
      channel.postMessage(snapshot())
    } catch (e) {
      /* ignore */
    }
  }
}

// ---------- 服务端 ----------
let stream = null
let pushTimer = null
let pendingLinkPush = false

const openStream = () => {
  if (stream || typeof EventSource === 'undefined') return
  stream = new EventSource(`${API_BASE}/events`)
  stream.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data)
      applyState(data)
      gateState.updatedAt = data.updatedAt || null
      if (typeof data.keyIsDefault === 'boolean') gateState.keyIsDefault = data.keyIsDefault
      gateState.mode = 'server'
      persistLocal()
    } catch (e) {
      /* 忽略脏消息 */
    }
  }
  // 断线由浏览器自动重连；真正的「服务不可用」由 connectGate 的首次 GET 判定
  stream.onerror = () => {}
}

const pushRemote = (immediate = false) => {
  if (gateState.mode !== 'server') return
  // 没登录就别发（读页面本来就不需要写），避免每次刷新报一堆 401
  if (!gateState.token) return
  if (pushTimer) clearTimeout(pushTimer)
  const send = async () => {
    pushTimer = null
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(snapshot())
      })
      if (res.status === 401) {
        saveToken('')
        gateState.lastError = '登录已失效，请重新登录'
        return
      }
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const data = await res.json()
      gateState.updatedAt = data.updatedAt || null
      gateState.lastError = ''
    } catch (e) {
      gateState.mode = 'local'
      gateState.lastError = '写回服务端失败，已退回本机模式'
    }
  }
  if (immediate) send()
  else pushTimer = setTimeout(send, 150)
}

/** 任何一次本地改动都走这里：本机缓存 → 同浏览器广播 → 服务端 */
const commit = ({ fromRemote = false } = {}) => {
  persistLocal()
  if (fromRemote) return
  broadcastLocal()
  pushRemote()
}

// ---------- 父子关系（显隐联动） ----------
/**
 * 只存「隐藏了谁」会漏掉一种状态：父分组隐藏、子项却还是可见 ——
 * 侧边栏里子项跟着分组一起消失，配置页却显示它是开着的，两边对不上。
 * 所以记两份索引，把联动补在写入处：
 *   显示某项 → 连带把它的祖先分组都显示（否则子项无处可挂）
 *   隐藏某项 → 连带把它的后代都隐藏（分组关掉就该整块消失）
 */
let ancestorIndex = new Map() // id -> 祖先 id 数组（近 → 远）
let descendantIndex = new Map() // id -> 全部后代 id 数组

const collectDescendants = (node, out = []) => {
  (node.children || []).forEach((child) => {
    if (!child || !child.index) return
    out.push(child.index)
    collectDescendants(child, out)
  })
  return out
}

/** 注册菜单树，建立父子索引。页面有几种树（Web / 移动端 / 文档中心）就传几份 */
export function registerMenuTrees (...trees) {
  const walk = (list, chain) => {
    (list || []).forEach((node) => {
      if (!node || !node.index) return
      ancestorIndex.set(node.index, chain)
      descendantIndex.set(node.index, collectDescendants(node))
      walk(node.children, [node.index, ...chain])
    })
  }
  trees.forEach((tree) => walk(tree, []))
}

/** 把一次显隐改动扩展成「应该一起改」的完整 id 集合 */
const expandForVisibility = (ids, visible) => {
  const out = new Set()
  ;(ids || []).forEach((id) => {
    if (!id) return
    out.add(id)
    const related = visible ? ancestorIndex.get(id) : descendantIndex.get(id)
    ;(related || []).forEach((x) => out.add(x))
  })
  return [...out]
}

// ---------- 对外 API ----------
export function isMenuVisible (id) {
  if (!id) return true
  return !gateState.hidden.has(id)
}

export function setItemVisible (id, visible) {
  if (!id) return
  setManyVisible([id], visible)
}

export function setManyVisible (ids, visible) {
  const all = expandForVisibility(ids, visible)
  const changed = all.filter((id) => isMenuVisible(id) !== visible)
  if (!changed.length) return
  pushUndo()
  changed.forEach((id) => {
    if (visible) gateState.hidden.delete(id)
    else gateState.hidden.add(id)
  })
  commit()
}

/**
 * 收敛历史配置里的孤儿状态（父分组隐藏、子项可见）。
 * 老数据、别人的分享链接都可能带这种组合，进来先修一次；
 * 只做「取消隐藏」，方向单调，所以不会来回震荡。
 * @returns {boolean} 是否真的修了
 */
export function normalizeVisibility () {
  const toShow = new Set()
  ancestorIndex.forEach((chain, id) => {
    if (gateState.hidden.has(id)) return
    chain.forEach((a) => {
      if (gateState.hidden.has(a)) toShow.add(a)
    })
  })
  if (!toShow.size) return false
  toShow.forEach((id) => gateState.hidden.delete(id))
  commit()
  return true
}

// ---------- 撤销 ----------
const undoStack = []
const UNDO_LIMIT = 20

/** 每次本地改动**之前**调用：把当前状态压栈 */
function pushUndo () {
  undoStack.push(snapshot())
  if (undoStack.length > UNDO_LIMIT) undoStack.shift()
  gateState.undoDepth = undoStack.length
}

/** 是否还有可撤销的操作（读 gateState.undoDepth，模板里要保持响应式） */
export function canUndo () {
  return gateState.undoDepth > 0
}

export function undo () {
  const prev = undoStack.pop()
  gateState.undoDepth = undoStack.length
  if (!prev) return false
  applyState(prev)
  commit()
  return true
}

// ---------- 顺序 ----------
export function orderIndexOf (tab, id) {
  const list = gateState.order[tab] || []
  const i = list.indexOf(id)
  return i === -1 ? Infinity : i
}

/** 只排序、不过滤：位置的基准要包含被隐藏的项，否则「隐藏再显示」会跳到末尾 */
function sortTree (tab, nodes) {
  const sortLevel = (list) =>
    list
      .map((node, i) => ({ node, pos: orderIndexOf(tab, node.index), i }))
      .sort((a, b) => a.pos - b.pos || a.i - b.i || 0)
      .map((x) => x.node)
  return sortLevel(nodes || []).map((node) =>
    node.children ? { ...node, children: sortTree(tab, node.children) } : node
  )
}

/**
 * 分组自身被隐藏、但组里还有可见项时，这个分组仍然要画出来 ——
 * 否则「子项开着、分组没了」就会出现半截菜单。写入侧已经会连带显示父分组，
 * 这里是渲染侧的兜底（比如别人推来的老配置）。
 */
const hasVisibleDescendant = (node) =>
  (node.children || []).some((c) => isMenuVisible(c.index) || hasVisibleDescendant(c))

/**
 * 渲染用：按配置排序 + 剔除隐藏项。
 * 没进过 order 的新菜单 pos 为 Infinity，自动落到该组末尾（不会插到别人前面）。
 */
export function orderedNodes (tab, nodes) {
  const walk = (list) => {
    const out = []
    list.forEach((node) => {
      if (!isMenuVisible(node.index) && !hasVisibleDescendant(node)) return
      if (node.children && node.children.length) {
        const kids = walk(node.children)
        if (kids.length) {
          out.push({ ...node, children: kids })
          return
        }
        // 可点节点例外：子节点全隐藏时仍保留入口（与 filterMenuTree 一致）
        if (node.to) {
          const { children, ...rest } = node
          out.push(rest)
        }
        return
      }
      out.push(node)
    })
    return out
  }
  return walk(sortTree(tab, nodes))
}

/** 只排序、不过滤的版本：给 3D 视图用（被隐藏的项也要画出来，只是画成空壳） */
export function sortedNodes (tab, nodes) {
  return sortTree(tab, nodes)
}

/** 扁平 id 列表（含隐藏项），拖拽插入位置的计算基准 */
export function flatOrderIds (tab, nodes) {
  const out = []
  const walk = (list) =>
    list.forEach((n) => {
      out.push(n.index)
      if (n.children) walk(n.children)
    })
  walk(sortTree(tab, nodes))
  return out
}

function removeNode (nodes, id) {
  return (nodes || [])
    .filter((n) => n.index !== id)
    .map((n) => (n.children ? { ...n, children: removeNode(n.children, id) } : n))
}

/** 每棵子树在扁平列表里的 [起, 止) 区间，用来算「插到分组后面 / 分组内部末尾」 */
function subtreeRanges (nodes) {
  const ranges = new Map()
  let cursor = 0
  const walk = (list) =>
    list.forEach((n) => {
      const start = cursor
      cursor += 1
      if (n.children) walk(n.children)
      ranges.set(n.index, [start, cursor])
    })
  walk(nodes)
  return ranges
}

/**
 * 移动一个节点。
 * @param {'before'|'after'|'inside'} place before/after = 与目标同级的前后；inside = 放进目标分组末尾
 * @returns {boolean} 是否真的发生了移动
 */
export function moveNode (tab, tree, dragId, targetId, place = 'before') {
  if (!TABS.includes(tab) || !dragId || !targetId || dragId === targetId) return false
  const sorted = sortTree(tab, tree)
  // 先把自己摘掉，再算目标位置 —— 否则「向后拖」会因为自己是已存在的元素而错位一格
  const without = removeNode(sorted, dragId)
  const ids = []
  const flat = (list) =>
    list.forEach((n) => {
      ids.push(n.index)
      if (n.children) flat(n.children)
    })
  flat(without)
  if (!ids.includes(targetId)) return false

  const ranges = subtreeRanges(without)
  const range = ranges.get(targetId)
  if (!range) return false
  const at = place === 'before' ? range[0] : range[1]
  ids.splice(at, 0, dragId)

  pushUndo()
  gateState.order[tab] = ids
  commit()
  return true
}

/** 把顺序恢复成默认（清空当前端的 order） */
export function resetOrder (tab) {
  if (!TABS.includes(tab)) return
  pushUndo()
  gateState.order[tab] = []
  commit()
}

export function resetGate () {
  pushUndo()
  gateState.hidden.clear()
  commit()
}

export function hiddenCount () {
  return gateState.hidden.size
}

/** 生成分享链接：当前域名 + 欢迎页 + 配置参数 */
export function buildShareLink () {
  const base = (import.meta.env && import.meta.env.BASE_URL) || '/'
  const origin = typeof window === 'undefined' ? '' : window.location.origin
  return `${origin}${base}welcome?gate=${encode(snapshot())}`
}

/**
 * 启动第一步（同步）：先铺本机缓存，再让链接参数覆盖。
 * @returns {boolean} 是否消费掉了链接里的 gate 参数
 */
export function bootstrapGate (query) {
  openChannel()

  let cached = null
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    cached = saved ? decode(saved) : null
  } catch (e) {
    /* ignore */
  }
  if (cached) applyState(cached)

  const fromLink = query && query.gate ? decode(query.gate) : null
  if (fromLink) {
    applyState(fromLink)
    persistLocal()
    broadcastLocal()
    pendingLinkPush = true
    gateState.consumedFromLink = true
    gateState.ready = true
    return true
  }
  gateState.consumedFromLink = false
  gateState.ready = true
  return false
}

/**
 * 启动第二步（异步）：从服务端取真实状态并订阅变更。
 * 链接带配置时以链接为准；已登录则顺手推给服务端，让所有人跟着变。
 */
export async function connectGate () {
  if (isFileProtocol()) {
    gateState.mode = 'local'
    gateState.connected = false
    gateState.lastError = '本地文件打开，菜单配置只在本机生效'
    return false
  }

  let data = null
  try {
    const res = await fetch(API_BASE, { headers: { 'Cache-Control': 'no-cache' } })
    if (!res.ok) throw new Error('HTTP ' + res.status)
    data = await res.json()
  } catch (e) {
    gateState.mode = 'local'
    gateState.connected = false
    gateState.lastError = '未连上服务端，配置只在本机生效'
    return false
  }

  gateState.mode = 'server'
  gateState.connected = true
  gateState.updatedAt = data.updatedAt || null
  if (typeof data.keyIsDefault === 'boolean') gateState.keyIsDefault = data.keyIsDefault
  gateState.lastError = ''

  if (pendingLinkPush) {
    pendingLinkPush = false
    pushRemote(true)
  } else {
    applyState(data)
    persistLocal()
  }

  openStream()
  return true
}

// ---------- 登录相关 ----------
export const isLoggedIn = () => Boolean(gateState.token)

/** 用密钥换取 token */
export async function login (key) {
  try {
    const res = await fetch(`${API_BASE}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key })
    })
    if (res.status === 401) return { ok: false, message: '密钥不对' }
    if (!res.ok) return { ok: false, message: '服务端异常（' + res.status + '）' }
    const data = await res.json()
    saveToken(data.token)
    gateState.keyIsDefault = data.keyIsDefault !== false
    gateState.mode = 'server'
    gateState.lastError = ''
    return { ok: true }
  } catch (e) {
    return { ok: false, message: '未连上服务端，无法登录' }
  }
}

/** 页面加载时校验 sessionStorage 里的 token 是否还有效 */
export async function checkSession () {
  if (!gateState.token) return false
  try {
    const res = await fetch(`${API_BASE}/session`, { headers: authHeaders() })
    if (!res.ok) {
      saveToken('')
      return false
    }
    const data = await res.json()
    if (typeof data.keyIsDefault === 'boolean') gateState.keyIsDefault = data.keyIsDefault
    return true
  } catch (e) {
    return false
  }
}

/** 改密钥：校验旧密钥，成功后服务端重签 token（其它设备上的登录会被踢掉） */
export async function changeKey (oldKey, newKey) {
  if (!gateState.token) return { ok: false, message: '请先登录' }
  try {
    const res = await fetch(`${API_BASE}/key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ oldKey, newKey })
    })
    const data = await res.json().catch(() => ({}))
    if (res.status === 401) return { ok: false, message: data.message || '当前密钥不对' }
    if (!res.ok) return { ok: false, message: data.message || '修改失败' }
    saveToken(data.token)
    gateState.keyIsDefault = false
    return { ok: true }
  } catch (e) {
    return { ok: false, message: '未连上服务端，修改失败' }
  }
}

export async function logout () {
  if (gateState.token) {
    try {
      await fetch(`${API_BASE}/logout`, { method: 'POST', headers: authHeaders() })
    } catch (e) {
      /* 服务不在也照样清本地 */
    }
  }
  saveToken('')
}

/** 递归裁剪多级菜单数据：去掉被隐藏的节点，以及因此变空的分组 */
export function filterMenuTree (nodes) {
  const out = []
  ;(nodes || []).forEach((node) => {
    if (!isMenuVisible(node.index) && !hasVisibleDescendant(node)) return
    if (node.children && node.children.length) {
      const kids = filterMenuTree(node.children)
      if (kids.length) {
        out.push({ ...node, children: kids })
        return
      }
      // 自身是可点页面（如文档中心的「产品需求v2」）：子章节全隐藏时仍保留入口，
      // 否则会连这一页一起消失，跟「只想收起章节」的意图不符
      if (node.to) {
        const { children, ...rest } = node
        out.push(rest)
      }
      return
    }
    out.push(node)
  })
  return out
}
