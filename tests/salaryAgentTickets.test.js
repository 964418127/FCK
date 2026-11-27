import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildSeedTickets,
  monthlyUsedOf,
  monthlyLeftOf,
  nextTicketId,
  evaluatePriority,
  buildTicketFromCtx,
  statusLabel,
  DIALOG_SCRIPTS,
  matchScript,
  addHours,
  sessionEndInfo,
  buildSeedSessions
} from '../src/mock/salaryAgentTickets.js'

test('种子工单：2026-11 蓝田无工单，额度满额可用', () => {
  const tickets = buildSeedTickets()
  assert.equal(monthlyUsedOf(tickets, 'E-107', '2026-11'), 0)
  assert.equal(monthlyLeftOf(tickets, 'E-107', '2026-11'), 2)
})

test('种子工单：2026-11 林小满已用 1 次，剩 1 次', () => {
  const tickets = buildSeedTickets()
  assert.equal(monthlyUsedOf(tickets, 'E-204', '2026-11'), 1)
  assert.equal(monthlyLeftOf(tickets, 'E-204', '2026-11'), 1)
})

test('额度扣减与越界钳制：已用 1 剩 1，超出额度钳为 0', () => {
  const tickets = buildSeedTickets()
  assert.equal(monthlyLeftOf(tickets, 'E-301', '2026-10'), 1, '陈一舟 10 月已用 1 次，应剩 1')
  const over = [...tickets, ...buildSeedTickets(), ...buildSeedTickets()] // 伪造超量
  assert.equal(monthlyLeftOf(over, 'E-301', '2026-10'), 0, '超出额度时钳为 0，不为负')
})

test('工单号按当月自增且补零', () => {
  const tickets = buildSeedTickets()
  assert.equal(nextTicketId(tickets), 'SA-202611-03')
})

test('优先级评定：预核查发现偏差 → P1', () => {
  const r = evaluatePriority({ deviate: 12.5, amount: 700 })
  assert.equal(r.level, 'P1')
  assert.match(r.reason, /偏差/)
})

test('优先级评定：维持原结论 + 大额 → P2；小额 → P3', () => {
  assert.equal(evaluatePriority({ deviate: 0, amount: 800 }).level, 'P2')
  assert.equal(evaluatePriority({ deviate: 0, amount: 30 }).level, 'P3')
})

test('优先级评定：维持原结论 + 重复争议 → P2', () => {
  assert.equal(evaluatePriority({ deviate: 0, amount: 30, repeat: true }).level, 'P2')
})

test('成单：上下文组装出完整工单（取证包 + 预核查 + P1）', () => {
  const tickets = buildSeedTickets()
  const ctx = {
    disputeType: '数据疑问型',
    item: '客次提成',
    period: '2026-11-01 ~ 2026-11-15',
    expected: 700,
    actual: 587.5,
    reason: '11-12 当天接待 5 单，系统只计 3 单',
    shots: ['11-12 排班表截图.png', '11-12 订单明细截图.png'],
    deviate: 12.5,
    recheckConclusion: '发现偏差'
  }
  const t = buildTicketFromCtx(ctx, tickets)
  assert.equal(t.id, 'SA-202611-03')
  assert.equal(t.status, 'pending')
  assert.equal(t.priority, 'P1')
  assert.equal(t.dispute.expected, 700)
  assert.equal(t.dispute.actual, 587.5)
  assert.equal(t.evidence.length, 3, '1 条描述 + 2 条截图')
  assert.equal(t.evidence[0].kind, 'desc')
  assert.equal(t.evidence[1].kind, 'shot')
  assert.equal(t.recheck.conclusion, '发现偏差')
  assert.equal(t.recheck.steps.length, 4, '预核查四步')
  assert.equal(t.reply, null)
  // 成单后额度扣减
  assert.equal(monthlyUsedOf([...tickets, t], 'E-107', '2026-11'), 1)
})

test('自由输入匹配脚本：专名 > 本月预估 > 客次提成；不命中返回 null', () => {
  assert.equal(matchScript('常乐豆本月结算了多少'), 'bean')
  assert.equal(matchScript('我这个月提成有多少了'), 'estimate')
  assert.equal(matchScript('预估一下本月收入'), 'estimate')
  assert.equal(matchScript('查一下我的客次提成'), 'piecework')
  assert.equal(matchScript('提成怎么算的'), 'piecework')
  assert.equal(matchScript('今天天气怎么样'), null)
})

test('状态标签齐全', () => {
  assert.equal(statusLabel('pending'), '待人事处理')
  assert.equal(statusLabel('processing'), '处理中')
  assert.equal(statusLabel('closed'), '已结案')
})

test('对话脚本：主脚本节点引用完整、成单链路可达', () => {
  const script = DIALOG_SCRIPTS.piecework
  const ids = Object.keys(script.nodes)
  for (const id of ids) {
    const n = script.nodes[id]
    if (n.next) assert.ok(script.nodes[n.next], `节点 ${id} 的 next ${n.next} 不存在`)
    for (const o of n.options || []) assert.ok(script.nodes[o.next], `节点 ${id} 选项指向 ${o.next} 不存在`)
  }
  // 从入口可达 done（成单终点）
  const visited = new Set()
  const walk = (id) => {
    if (visited.has(id)) return
    visited.add(id)
    const n = script.nodes[id]
    if (!n) return
    if (n.next) walk(n.next)
    for (const o of n.options || []) walk(o.next)
  }
  walk(script.entry)
  assert.ok(visited.has('done'), '从入口应可达成单节点 done')
  assert.ok(visited.has('hold'), '从入口应可达「暂不提交」节点')
})

test('对话脚本：算薪前走业务预估露出（非结论性、以工资结算为准）', () => {
  const est = DIALOG_SCRIPTS.estimate
  assert.ok(est, 'estimate 脚本存在（forecast 已替换）')
  const texts = Object.values(est.nodes).map(n => n.text || '').join('\n')
  assert.match(texts, /算薪/)
  assert.match(texts, /工资发放后/)
  const card = est.nodes.f2.card
  assert.equal(card.type, 'estimate')
  assert.match(card.note, /非结论性预估/)
  assert.match(card.note, /工资结算为准/)
  assert.equal(card.rows.length, 3)
  // 预估与求证链衔接：从入口可达收尾节点
  const visited = new Set()
  const walk = (id) => {
    if (visited.has(id) || !est.nodes[id]) return
    visited.add(id)
    const n = est.nodes[id]
    if (n.next) walk(n.next)
    for (const o of n.options || []) walk(o.next)
  }
  walk(est.entry)
  assert.ok(visited.has('f4'), '预估脚本可正常收尾')
})

test('对话脚本：常乐豆查完即结论，无解释入口、无围墙词汇泄到员工侧', () => {
  const bean = DIALOG_SCRIPTS.bean
  const texts = Object.values(bean.nodes).map(n => n.text || '').join('\n')
  assert.match(texts, /本月结算/)
  // 围墙词汇不得出现在员工侧：说「有明细但不给」等于告诉员工明细存在
  assert.doesNotMatch(texts, /明细|不在解答范围|构成|规则/)
  // 不得提供追问解释的入口：除「好的」外不允许其他选项
  const b2 = bean.nodes.b2
  assert.equal(b2.options.length, 1)
  assert.equal(b2.options[0].label, '好的')
  const account = b2.card
  assert.equal(account.rows.length, 3, '账户级三数：本月结算 / 可用余额 / 提现冻结')
  assert.equal(account.note, undefined, '卡内不得带围墙注释')
})

test('会话生命周期：无工单按末次咨询起 24h 自动结束', () => {
  const s = { status: 'active', updatedAt: '2026-11-27 15:20', ticketId: null }
  assert.equal(sessionEndInfo(s, [], '2026-11-28 15:19').ended, false)
  const hit = sessionEndInfo(s, [], '2026-11-28 15:20')
  assert.equal(hit.ended, true)
  assert.equal(hit.basis, 'chat')
  assert.equal(hit.deadline, '2026-11-28 15:20')
})

test('会话生命周期：有工单未结案，超 24h 也不自动结束', () => {
  const s = { status: 'active', updatedAt: '2026-11-20 10:00', ticketId: 'T-1' }
  const tickets = [{ id: 'T-1', status: 'processing' }]
  const info = sessionEndInfo(s, tickets, '2026-11-30 10:00')
  assert.equal(info.ended, false)
  assert.equal(info.basis, 'ticket-open')
})

test('会话生命周期：有工单按结案时刻起 24h 结束，不按咨询时刻', () => {
  const s = { status: 'active', updatedAt: '2026-11-20 10:00', ticketId: 'T-1' }
  const tickets = [{ id: 'T-1', status: 'closed', reply: { at: '2026-11-27 09:00' } }]
  assert.equal(sessionEndInfo(s, tickets, '2026-11-28 08:59').ended, false)
  const hit = sessionEndInfo(s, tickets, '2026-11-28 09:00')
  assert.equal(hit.ended, true)
  assert.equal(hit.basis, 'ticket')
  assert.equal(hit.deadline, '2026-11-28 09:00')
})

test('会话生命周期：继续对话后从继续时刻重新保留 24h', () => {
  // 已结束的会话（2 天前末次咨询），继续对话后不应再判为已结束
  const s = { status: 'active', updatedAt: '2026-11-25 10:12', resumedAt: '2026-11-27 16:00', ticketId: null }
  assert.equal(sessionEndInfo(s, [], '2026-11-27 16:00').ended, false)
  assert.equal(sessionEndInfo(s, [], '2026-11-28 15:59').ended, false)
  const hit = sessionEndInfo(s, [], '2026-11-28 16:00')
  assert.equal(hit.ended, true)
  assert.equal(hit.basis, 'resume')
})

test('会话生命周期：已标记 ended 的会话始终返回已结束', () => {
  const s = { status: 'ended', endReason: 'timeout-no-ticket', endedAt: '2026-11-26 10:12' }
  assert.equal(sessionEndInfo(s, [], '2026-11-27 10:00').ended, true)
})

test('种子会话：一条进行中、一条已结束；加 24h 后主会话结束', () => {
  const sessions = buildSeedSessions()
  assert.equal(sessions.length, 2)
  assert.equal(sessionEndInfo(sessions[0], [], '2026-11-27 16:00').ended, false)
  assert.equal(sessionEndInfo(sessions[1], [], '2026-11-27 16:00').ended, true)
  assert.equal(sessionEndInfo(sessions[0], [], '2026-11-28 15:20').ended, true)
  assert.equal(addHours('2026-11-27 15:20', 24), '2026-11-28 15:20')
})

test('员工侧防泄漏：对话脚本不得出现内部机制词汇', () => {
  // 文档/内部规则用语不得原封给到员工侧：
  // 预核查（内部工件名）、优先级/P1-P3（人事侧排队机制）、归因分类（Agent 内部判定）、
  // 结案规则（内部 SLA，直译给员工像「只理你一次」）、闸门判定权表述
  const BANNED = [
    /预核查/,
    /优先级/,
    /P[123]/,
    /数据疑问型/,
    /规则不认型/,
    /一次答复即结案/,
    /答复一次即结案/,
    /判定成立/,
    /额度剩/
  ]
  for (const [id, script] of Object.entries(DIALOG_SCRIPTS)) {
    const texts = Object.values(script.nodes).map(n => n.text || '').join('\n')
    const labels = Object.values(script.nodes)
      .flatMap(n => (n.options || []).map(o => o.label))
      .join('\n')
    for (const re of BANNED) {
      assert.doesNotMatch(texts, re, `脚本 ${id} 气泡文本出现内部词汇 ${re}`)
      assert.doesNotMatch(labels, re, `脚本 ${id} 选项出现内部词汇 ${re}`)
    }
  }
})
