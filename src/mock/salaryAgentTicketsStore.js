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
  DIALOG_SCRIPTS,
  MONTHLY_QUOTA,
  MONTH_NOW,
  monthlyUsedOf,
  monthlyLeftOf,
  nextTicketId
} from './salaryAgentTickets.js'

const state = reactive({
  tickets: buildSeedTickets(),
  dialog: null, // { scriptId, nodeId, messages: [], ctx: {}, ended, pendingConfirm }
  meId: 'E-107'
})

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

export const dialog = computed(() => state.dialog)
export const dialogPendingConfirm = computed(() => !!(state.dialog && state.dialog.pendingConfirm))
export const dialogTicketCreated = computed(() => state.dialog ? state.dialog.createdTicketId : null)

export function openScript (scriptId) {
  const script = DIALOG_SCRIPTS[scriptId]
  if (!script) return
  const first = script.nodes[script.entry]
  const messages = []
  if (first.from === 'user') {
    messages.push({ from: 'user', text: first.text })
    const next = script.nodes[first.next]
    pushAgentNode(messages, next)
    state.dialog = { scriptId, nodeId: first.next, messages, ctx: {}, ended: !!next.end, pendingConfirm: false, createdTicketId: null }
  } else {
    pushAgentNode(messages, first)
    state.dialog = { scriptId, nodeId: script.entry, messages, ctx: {}, ended: !!first.end, pendingConfirm: false, createdTicketId: null }
  }
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
  const d = state.dialog
  if (!d || d.ended || d.pendingConfirm) return
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

/** 成单确认弹层点「确认提交」：扣额度、生成工单、推进到 done 节点 */
export function confirmCreateTicket () {
  const d = state.dialog
  if (!d || !d.pendingConfirm) return
  const script = DIALOG_SCRIPTS[d.scriptId]
  const ticket = buildTicketFromCtx(d.ctx, state.tickets)
  state.tickets.push(ticket)
  d.pendingConfirm = false
  d.createdTicketId = ticket.id
  advanceTo(script, 'done')
}

/** 成单确认弹层点「再想想」：回到选项状态 */
export function cancelCreateTicket () {
  const d = state.dialog
  if (d) d.pendingConfirm = false
}

function advanceTo (script, nodeId) {
  const d = state.dialog
  const next = script.nodes[nodeId]
  d.nodeId = nodeId
  if (!next) { d.ended = true; return }
  pushAgentNode(d.messages, next)
  if (next.end) d.ended = true
}

export function resetDialog () { state.dialog = null }

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
