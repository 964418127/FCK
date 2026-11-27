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
  DIALOG_SCRIPTS
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

test('对话脚本：常乐豆短脚本封顶在账户级，试算短脚本直接拒绝', () => {
  const bean = DIALOG_SCRIPTS.bean
  const texts = Object.values(bean.nodes).map(n => n.text || '').join('\n')
  assert.match(texts, /本月结算/)
  assert.match(texts, /不在解答范围/)
  const fc = DIALOG_SCRIPTS.forecast
  const ftexts = Object.values(fc.nodes).map(n => n.text || '').join('\n')
  assert.match(ftexts, /不在解答范围/)
  assert.match(ftexts, /已发放工资条/)
})
