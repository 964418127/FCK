/**
 * 「薪酬咨询助手」原型 · 响应式 store（模块级单例，移动端三页与 PC 工单列表共享）。
 *
 * 三类职责：
 * 1. 工单数据：种子工单 + 对话演示成单（扣额度）+ 人事处理（接单/答复结案）
 * 2. 对话推进器：按 DIALOG_SCRIPTS 节点图推进，选项 meta 累积成取证包（ctx）
 * 3. 身份：员工侧「我的工单」按 meId 过滤；对话页固定演示蓝田（客次提成脚本不跨岗位）
 */
import { reactive, ref, computed } from 'vue'
import {
  buildSeedTickets,
  buildTicketFromCtx,
  buildSeedSessions,
  buildNewSession,
  nextSessionId,
  sessionEndInfo,
  addHours,
  DIALOG_SCRIPTS,
  matchScript,
  MONTHLY_QUOTA,
  MONTH_NOW,
  monthlyUsedOf,
  monthlyLeftOf,
  nextTicketId
} from './salaryAgentTickets.js'

const DEMO_NOW_INIT = '2026-11-27 16:00'

const state = reactive({
  tickets: buildSeedTickets(),
  sessions: buildSeedSessions(), // 咨询会话列表（会话级生命周期）
  currentSessionId: null, // null = 欢迎态（新对话）
  demoNow: DEMO_NOW_INIT, // 演示「当前时间」，可推进以展示 24h 自动结束
  meId: 'E-107'
})

/** 当前打开的会话对象（兼容原 dialog 的字段访问） */
function currentSession () {
  return state.sessions.find(s => s.id === state.currentSessionId) || null
}

/* ---------------- 身份与额度 ---------------- */

export const me = computed(() => state.tickets && state.meId)
export const meId = computed(() => state.meId)

export function setMe (id) { state.meId = id }

export const meName = computed(() => {
  const t = state.tickets.find(t => t.employeeId === state.meId)
  return t ? t.employeeName : state.meId
})

export const mePosition = computed(() => {
  const t = state.tickets.find(t => t.employeeId === state.meId)
  return t ? t.position : ''
})

/** 我的工单（按当前身份过滤，倒序） */
export const myTickets = computed(() =>
  state.tickets
    .filter(t => t.employeeId === state.meId)
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
)

/** 我的本月额度（工单成立才扣） */
export const monthlyUsed = computed(() => monthlyUsedOf(state.tickets, state.meId, MONTH_NOW))
export const monthlyLeft = computed(() => monthlyLeftOf(state.tickets, state.meId, MONTH_NOW, MONTHLY_QUOTA))

export const allTickets = computed(() =>
  state.tickets.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
)

/* ---------------- 对话推进器 ---------------- */

const DEMO_EMPLOYEE = { id: 'E-107', name: '蓝田', position: '全职推拿师' }

/** 演示当前时间（可推进，用于展示 24h 自动结束） */
export const demoNow = computed(() => state.demoNow)
export function advanceDemoHours (n) { state.demoNow = addHours(state.demoNow, n) }
export function resetDemoTime () { state.demoNow = DEMO_NOW_INIT }

export const dialog = computed(() => currentSession())
export const dialogPendingConfirm = computed(() => {
  const d = currentSession()
  return !!(d && d.pendingConfirm)
})
export const dialogTicketCreated = computed(() => {
  const d = currentSession()
  return d ? d.createdTicketId : null
})

/** 历史咨询 = 全部已结束会话（进行中的就是当前对话，不进历史） */
export const historySessions = computed(() =>
  state.sessions
    .filter(s => sessionEndInfo(s, state.tickets, state.demoNow).ended)
    .slice()
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .map(s => ({ ...s, endInfo: sessionEndInfo(s, state.tickets, state.demoNow) }))
)
/** 当前会话的自动结束判定 */
export const currentEndInfo = computed(() => sessionEndInfo(currentSession(), state.tickets, state.demoNow))
/** 当前会话是否是「已结束、正在查看历史记录」的状态 */
export const isViewingHistory = computed(() => {
  const d = currentSession()
  return !!d && currentEndInfo.value.ended
})

/** 进入助手页：恢复到最近一条「进行中」会话；没有则新对话（欢迎态） */
export function resumeLastSession () {
  const alive = state.sessions
    .filter(s => s.messages.length && !sessionEndInfo(s, state.tickets, state.demoNow).ended)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
  state.currentSessionId = alive.length ? alive[0].id : null
}

/** 新建对话：当前会话置空，回欢迎态（原会话保留在历史里） */
export function newDialog () { state.currentSessionId = null }
export const resetDialog = newDialog // 兼容旧调用

/** 从历史对话加载：查看历史记录（只读，除非再点「继续对话」） */
export function loadSession (id) {
  if (state.sessions.some(s => s.id === id)) state.currentSessionId = id
}

/**
 * 继续对话：把一条已结束会话重新激活为当前对话。
 * 规则：从「继续的时刻」起重新保留 24h（resumedAt 覆盖原基准），状态回到进行中。
 */
export function continueSession (id) {
  const s = state.sessions.find(s => s.id === id)
  if (!s) return
  s.resumedAt = state.demoNow
  s.updatedAt = state.demoNow
  s.status = 'active'
  s.endReason = null
  s.endedAt = null
  if (s.ended) s.ended = false // 脚本走到终点的，重新给一次推进机会
  state.currentSessionId = id
}

/** 手动收口会话（原型演示用） */
export function endSession (id) {
  const s = state.sessions.find(s => s.id === id)
  if (s && s.status === 'active') {
    s.status = 'ended'
    s.endReason = 'manual'
    s.endedAt = state.demoNow
  }
}

function touch (d) { if (d) d.updatedAt = state.demoNow }

/** 发起新咨询：新建一条会话并推进到脚本首个助手节点；firstText 可覆盖首句用户气泡（自由输入用） */
export function openScript (scriptId, firstText) {
  const script = DIALOG_SCRIPTS[scriptId]
  if (!script) return
  const session = buildNewSession(nextSessionId(state.sessions), state.demoNow)
  const first = script.nodes[script.entry]
  const messages = []
  if (first.from === 'user') {
    messages.push({ from: 'user', text: (firstText && firstText.trim()) || first.text })
    const next = script.nodes[first.next]
    pushAgentNode(messages, next)
    Object.assign(session, { scriptId, nodeId: first.next, messages, ended: !!next.end })
  } else {
    pushAgentNode(messages, first)
    Object.assign(session, { scriptId, nodeId: script.entry, messages, ended: !!first.end })
  }
  state.sessions.push(session)
  state.currentSessionId = session.id
}

/** 输入框自由发送：引导话术（员工语言，不含内部机制词） */
const GUIDE_TEXT = '这个问题我暂时帮不上。我主要帮你查本人最近 3 个月已发放薪酬的求证，以及本月算薪前的预估。换个问法试试，比如：客次提成、常乐豆、这个月提成有多少。'

/**
 * 输入框发送统一入口：
 * - 对话进行中：追加用户气泡 + 助手自然回应，不打断当前脚本（选项仍可点）
 * - 欢迎态 / 已结束态：关键词命中脚本则发起新咨询；未命中则建一条引导会话
 */
export function sendText (text) {
  const t = String(text || '').trim()
  if (!t) return
  const d = currentSession()
  if (d && !d.ended && !d.pendingConfirm && !currentEndInfo.value.ended && d.messages.length) {
    d.messages.push({ from: 'user', text: t })
    d.messages.push({ from: 'agent', text: GUIDE_TEXT, card: null, options: null, ticketLink: false })
    touch(d)
    return
  }
  const scriptId = matchScript(t)
  if (scriptId) { openScript(scriptId, t); return }
  const session = buildNewSession(nextSessionId(state.sessions), state.demoNow)
  session.title = t.length > 14 ? t.slice(0, 14) + '…' : t
  session.messages.push({ from: 'user', text: t })
  session.messages.push({ from: 'agent', text: GUIDE_TEXT, card: null, options: null, ticketLink: false })
  session.ended = true
  state.sessions.push(session)
  state.currentSessionId = session.id
}

function pushAgentNode (messages, node) {
  if (!node) return
  messages.push({
    from: 'agent',
    text: node.text,
    card: node.card || null,
    options: node.options || null,
    ticketLink: !!node.ticketLink
  })
}

/** 点击选项：追加用户气泡（含截图条目），合并 meta，推进下一节点 */
export function pickOption (optionIndex) {
  const d = currentSession()
  if (!d || d.ended || d.pendingConfirm || currentEndInfo.value.ended) return
  const script = DIALOG_SCRIPTS[d.scriptId]
  const node = script.nodes[d.nodeId]
  const opt = node && node.options && node.options[optionIndex]
  if (!opt) return

  d.messages.push({
    from: 'user',
    text: opt.label,
    shots: (opt.meta && opt.meta.shots) || null
  })
  if (opt.meta) Object.assign(d.ctx, opt.meta)

  if (opt.action === 'confirm-ticket') {
    d.pendingConfirm = true
    return
  }
  advanceTo(script, opt.next)
}

/** 成单确认弹层点「确认提交」：扣额度、生成工单、关联会话、推进到 done 节点 */
export function confirmCreateTicket () {
  const d = currentSession()
  if (!d || !d.pendingConfirm) return
  const script = DIALOG_SCRIPTS[d.scriptId]
  const ticket = buildTicketFromCtx(d.ctx, state.tickets)
  state.tickets.push(ticket)
  d.pendingConfirm = false
  d.createdTicketId = ticket.id
  d.ticketId = ticket.id
  advanceTo(script, 'done')
}

/** 成单确认弹层点「再想想」：回到选项状态 */
export function cancelCreateTicket () {
  const d = currentSession()
  if (d) d.pendingConfirm = false
}

function advanceTo (script, nodeId) {
  const d = currentSession()
  const next = script.nodes[nodeId]
  d.nodeId = nodeId
  touch(d)
  if (!next) { d.ended = true; return }
  pushAgentNode(d.messages, next)
  if (next.end) d.ended = true
}

/** 当前演示身份（对话页页头展示） */
export const demoEmployee = DEMO_EMPLOYEE

/* ---------------- 人事侧处理 ---------------- */

/** 接单：pending → processing */
export function hrTake (ticketId) {
  const t = state.tickets.find(t => t.id === ticketId)
  if (t && t.status === 'pending') t.status = 'processing'
}

/** 答复结案：processing → closed（一次答复即结案） */
export function hrReply (ticketId, text) {
  const t = state.tickets.find(t => t.id === ticketId)
  if (!t || t.status !== 'processing' || !text) return
  t.status = 'closed'
  t.reply = { by: '顾清岚', at: '2026-11-27 16:20', text }
}
