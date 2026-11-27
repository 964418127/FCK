/**
 * 「薪酬咨询助手」原型 · mock 数据层（纯数据 + 纯函数，可被 node:test 直接测）。
 *
 * 对应文档《薪酬查询 Agent》的争议升级链路设计（原型先行，文档 6.6 待补）：
 *   咨询 → 答复 → 不服归因（三型）→ 取证引导三问 → 复核 ≥2 轮
 *   → Agent 判定成单 → 员工确认扣次 → Agent 预核查 → 优先级评定 → 人事处理 → 一次答复结案
 *
 * 核心口径（本轮拍板）：
 * - 员工不持有工单入口，工单由 Agent 判定成立、员工确认后创建
 * - 工单额度默认每月 2 次，按员工 × 自然月计，工单成立才扣
 * - 预核查只复核不判定：发现偏差/维持原结论都照常流转给人事
 * - 一次答复即结案，再不服走次月新工单
 * - IM 侧员工不可主动直聊人事（由 IM 平台侧控制，不在本 mock 范围）
 */

export const TODAY = '2026-11-27'
export const MONTH_NOW = '2026-11'
/** 工单额度：默认每月 2 次，按员工 × 自然月 */
export const MONTHLY_QUOTA = 2

/** 演示人员（工号与排班 v5 的 E-107 蓝田保持一致） */
export const SA_PEOPLE = [
  { id: 'E-107', name: '蓝田', position: '全职推拿师', storeId: 'S-201' },
  { id: 'E-204', name: '林小满', position: '非全日制推拿师', storeId: 'S-201' },
  { id: 'E-301', name: '陈一舟', position: '全职客户经理', storeId: 'S-104' },
  { id: 'HR-01', name: '顾清岚', position: '人事专员' }
]

export function personById (id) {
  return SA_PEOPLE.find(p => p.id === id) || null
}

/* ------------------------------------------------------------------ */
/* 工单状态机与额度                                                     */
/* ------------------------------------------------------------------ */

export const TICKET_STATUS = [
  { key: 'pending', label: '待人事处理' },
  { key: 'processing', label: '处理中' },
  { key: 'closed', label: '已结案' }
]

export const PRIORITIES = [
  { key: 'P1', label: 'P1 优先处理', tone: 'red' },
  { key: 'P2', label: 'P2 常规核实', tone: 'amber' },
  { key: 'P3', label: 'P3 低优先', tone: 'gray' }
]

export function statusLabel (key) {
  const s = TICKET_STATUS.find(s => s.key === key)
  return s ? s.label : key
}

export function priorityTone (key) {
  const p = PRIORITIES.find(p => p.key === key)
  return p ? p.tone : 'gray'
}

/**
 * 优先级评定（预核查报告之后、到达人事之前）：
 * - 预核查发现真实偏差 → P1（该修的钱，越快越好）
 * - 预核查维持原结论 + 金额影响大（≥500）或重复争议同一事项 → P2
 * - 其余 → P3
 */
export function evaluatePriority ({ deviate = 0, amount = 0, repeat = false } = {}) {
  if (deviate > 0) {
    return { level: 'P1', reason: '预核查发现真实偏差，存在少算，需尽快修正' }
  }
  if (amount >= 500 || repeat) {
    return {
      level: 'P2',
      reason: repeat ? '重复争议同一事项，预核查维持原结论' : '预核查维持原结论，金额影响较大，需人工核实'
    }
  }
  return { level: 'P3', reason: '预核查维持原结论，金额影响较小' }
}

/** 本月已用额度：按员工 × 自然月计（工单成立才计入） */
export function monthlyUsedOf (tickets, employeeId, month) {
  return tickets.filter(t =>
    t.employeeId === employeeId &&
    typeof t.createdAt === 'string' && t.createdAt.startsWith(month)
  ).length
}

export function monthlyLeftOf (tickets, employeeId, month, quota = MONTHLY_QUOTA) {
  return Math.max(0, quota - monthlyUsedOf(tickets, employeeId, month))
}

export function nextTicketId (tickets, month = MONTH_NOW) {
  const prefix = `SA-${month.replace('-', '')}`
  const n = tickets.filter(t => t.id.startsWith(prefix)).length + 1
  return `${prefix}-${String(n).padStart(2, '0')}`
}

/* ------------------------------------------------------------------ */
/* 种子工单（对话演示新成的单由 store 运行时追加）                         */
/* ------------------------------------------------------------------ */

const BLUE_RECHECK_CLOSED = {
  conclusion: '维持原结论',
  deviate: 0,
  steps: [
    '业务事实重取：10 月名下投诉记录 1 条，处理结果属实',
    '规则命中：投诉扣款 50 元/次（投诉处理结果生效即扣）',
    '计算还原：1 × 50 = 50 元',
    '结论判定：原答复无误，员工主张不成立'
  ]
}

export function buildSeedTickets () {
  return [
    {
      id: 'SA-202611-01',
      employeeId: 'E-204',
      employeeName: '林小满',
      position: '非全日制推拿师',
      salaryItem: '保底补差',
      period: '2026-11-01 ~ 2026-11-15',
      createdAt: '2026-11-26 10:18',
      status: 'pending',
      priority: 'P2',
      priorityReason: '预核查维持原结论，金额影响中等，需人工核实',
      dispute: {
        type: '数据疑问型',
        expected: 429,
        actual: 0,
        reason: '认为 11 月上半月有一周打卡有效工时 19.5 小时，应触发保底补差'
      },
      evidence: [
        { kind: 'desc', text: '认为其中一周打卡有效工时 19.5 小时，保底应为 19.5 × 22 = 429 元，高于当周收入，应补差' },
        { kind: 'shot', label: '11 月上半月打卡记录.png' }
      ],
      recheck: {
        conclusion: '维持原结论',
        deviate: 0,
        steps: [
          '业务事实重取：该周打卡有效工时 17.5 小时（19.5 含 2 小时无效时段）',
          '规则命中：保底 = 打卡有效工时 × 城市时薪 22 元/h',
          '计算还原：保底 385 元，当周收入 402 元，收入高于保底，不触发补差',
          '结论判定：原答复无误，员工主张不成立'
        ]
      },
      reply: null
    },
    {
      id: 'SA-202611-02',
      employeeId: 'E-301',
      employeeName: '陈一舟',
      position: '全职客户经理',
      salaryItem: '客次提成单价',
      period: '2026-11 月度',
      createdAt: '2026-11-25 15:02',
      status: 'processing',
      priority: 'P3',
      priorityReason: '重复争议同一事项，预核查维持原结论',
      dispute: {
        type: '规则不认型',
        expected: '30 元/客次',
        actual: '25 元/客次',
        reason: '认为「新客回流订单」应按新客单价 30 元计，现行按普通客次 25 元计'
      },
      evidence: [
        { kind: 'desc', text: '主张：新客回流订单应沿用新客单价 30 元/客次；期望计算方式与现行规则不一致' }
      ],
      recheck: {
        conclusion: '维持原结论',
        deviate: 0,
        steps: [
          '业务事实重取：11 月新客回流订单 6 笔',
          '规则命中：新客单价仅适用于首单，回流订单按普通客次 25 元/客次计',
          '计算还原：与工资条一致',
          '结论判定：规则适用无误；员工属规则认可类分歧，转人工说明'
        ]
      },
      reply: null
    },
    {
      id: 'SA-202610-03',
      employeeId: 'E-107',
      employeeName: '蓝田',
      position: '全职推拿师',
      salaryItem: '投诉扣款',
      period: '2026-10 月度',
      createdAt: '2026-10-22 09:40',
      status: 'closed',
      priority: 'P2',
      priorityReason: '预核查维持原结论，金额影响中等，需人工核实',
      dispute: {
        type: '数据疑问型',
        expected: 0,
        actual: 50,
        reason: '认为 10 月名下没有投诉，不应出现 50 元投诉扣款'
      },
      evidence: [
        { kind: 'desc', text: '本人 10 月没有收到任何投诉通知，认为 50 元投诉扣款不成立' }
      ],
      recheck: BLUE_RECHECK_CLOSED,
      reply: {
        by: '顾清岚',
        at: '2026-10-24 16:40',
        text: '经核：10-17 名下确有 1 条投诉记录，处理结果已生效，按规则扣款 50 元/次。扣款依据充分，维持原扣款。本答复即工单最终结论。'
      }
    },
    {
      id: 'SA-202610-01',
      employeeId: 'E-301',
      employeeName: '陈一舟',
      position: '全职客户经理',
      salaryItem: '新客奖励',
      period: '2026-10 月度',
      createdAt: '2026-10-20 11:12',
      status: 'closed',
      priority: 'P3',
      priorityReason: '预核查维持原结论，金额影响较小',
      dispute: {
        type: '数据疑问型',
        expected: 5,
        actual: 4,
        reason: '认为 10 月开发了 5 位新客，新客奖励只发了 4 份'
      },
      evidence: [
        { kind: 'desc', text: '回忆 10 月累计开发新客 5 位，与工资条新客奖励 4 份不符' }
      ],
      recheck: {
        conclusion: '维持原结论',
        deviate: 0,
        steps: [
          '业务事实重取：10 月新客登记 5 位，其中 1 位首单未成',
          '规则命中：新客奖励以首单成交为发放条件',
          '计算还原：4 × 奖励单价，与工资条一致',
          '结论判定：原答复无误，员工主张不成立'
        ]
      },
      reply: {
        by: '顾清岚',
        at: '2026-10-21 17:05',
        text: '经核：10 月新客登记 5 位，其中 1 位未完成首单，按规则不发放奖励。维持原结论，本答复即工单最终结论。'
      }
    }
  ]
}

/* ------------------------------------------------------------------ */
/* 对话演示脚本                                                         */
/* ------------------------------------------------------------------ */

/**
 * 脚本节点图：from = user | agent；options 为用户可点回复（label 即气泡文本），
 * meta 随选项累积进对话上下文（取证包），action='confirm-ticket' 触发成单确认弹层。
 * card: verify = 求证链四步卡；account = 常乐豆账户级三数卡。
 */
export const DIALOG_SCRIPTS = {
  'piecework': {
    id: 'piecework',
    entry: 'q1',
    nodes: {
      q1: { from: 'user', text: '查一下我 11 月上半月的客次提成', next: 'a1' },
      a1: {
        from: 'agent',
        text: '已为你完成本次求证，还原过程如下：',
        card: {
          type: 'verify',
          steps: [
            { no: '01', label: '业务事实', text: '11-01 ~ 11-15 到店服务客次 23 次（订单系统）' },
            { no: '02', label: '规则命中', text: '客次提成单价 25 元/客次（现行政策命中值）' },
            { no: '03', label: '计算还原', text: '23 × 25 = 575 元' },
            { no: '04', label: '结论判定', text: '11 月上半月工资条「客次提成」575 元，与还原结果一致' }
          ]
        },
        options: [
          { label: '客次提成不对，我不认可', next: 'a2' },
          { label: '明白了，没问题', next: 'bye' }
        ]
      },
      bye: {
        from: 'agent',
        text: '好的，本次求证已结束。工资条还有疑问的话，随时来问我。',
        end: true
      },
      a2: {
        from: 'agent',
        text: '收到。先帮你对齐分歧点：你指的是这笔钱算错了，还是规则本身你不认可？',
        options: [
          { label: '金额算错了', next: 'a3', meta: { disputeType: '数据疑问型' } },
          { label: '规则不合理', next: 'a3', meta: { disputeType: '规则不认型' } }
        ]
      },
      a3: {
        from: 'agent',
        text: '好。我们把质疑落成可核查的证据包，一共三个问题，逐个来。\n第一问：你质疑的是哪一项、哪个时间段？',
        options: [
          { label: '客次提成，11 月 1 日到 11 月 15 日', next: 'a4', meta: { item: '客次提成', period: '2026-11-01 ~ 2026-11-15' } }
        ]
      },
      a4: {
        from: 'agent',
        text: '第二问：系统按 23 客次 × 25 元算出 575 元，你实际认为应该是多少？',
        options: [
          { label: '应该是 28 客次，700 元', next: 'a5', meta: { expected: 700 } }
        ]
      },
      a5: {
        from: 'agent',
        text: '第三问：为什么认为是 28 客次？说说你的依据，有记录的话传个截图。',
        options: [
          {
            label: '11-12 我接待了 5 单，系统只记了 3 单',
            next: 'a6',
            meta: {
              reason: '11-12 当天接待 5 单，系统只计 3 单',
              shots: ['11-12 排班表截图.png', '11-12 订单明细截图.png']
            }
          }
        ]
      },
      a6: {
        from: 'agent',
        text: '已核对你上传的记录与系统订单：11-12 当日系统订单 3 笔，另有 2 笔已取消。规则是「顾客主动取消的订单不计客次提成」。这 2 笔取消属于哪种情况？',
        options: [
          { label: '有 1 单是到店后取消的，顾客已经做了', next: 'a7' }
        ]
      },
      a7: {
        from: 'agent',
        text: '再次核对：该订单状态为「服务开始后取消」，按现行规则此类订单计客次、单价减半（12.5 元）。\n复核发现偏差：客次提成应为 587.5 元，较原答复少算 12.5 元。',
        meta: { actual: 587.5, deviate: 12.5, recheckConclusion: '发现偏差' },
        options: [
          { label: '那这 12.5 元怎么办', next: 'a8' }
        ]
      },
      a8: {
        from: 'agent',
        text: '这 12.5 元需要薪酬侧复核发放，我无法自动修正。建议为你生成薪酬工单：你的主张、证据和我的预核查报告会一并提交给人事。\n本月你的工单额度剩 2 次，工单成立将占用 1 次。',
        options: [
          { label: '确认，提交工单', next: 'done', action: 'confirm-ticket' },
          { label: '暂不提交', next: 'hold' }
        ]
      },
      hold: {
        from: 'agent',
        text: '好的，先不提交。你可以继续在助手内求证，额度不受影响。',
        end: true
      },
      done: {
        from: 'agent',
        text: '工单已提交。预核查结论「发现偏差 12.5 元」，优先级 P1，人事将在移动端工单入口收到这条工单。处理进展可在「我的工单」查看。',
        end: true,
        ticketLink: true
      }
    }
  },
  'bean': {
    id: 'bean',
    entry: 'b1',
    nodes: {
      b1: { from: 'user', text: '常乐豆本月结算了多少', next: 'b2' },
      b2: {
        from: 'agent',
        text: '你本月的常乐豆账户情况：',
        card: {
          type: 'account',
          rows: [
            { label: '本月结算', value: '260 豆' },
            { label: '可用余额', value: '480 豆' },
            { label: '提现冻结', value: '0 豆' }
          ]
        },
        options: [
          { label: '好的', next: 'b3' }
        ]
      },
      b3: { from: 'agent', text: '好的，还有其他薪酬问题随时问我。', end: true }
    }
  },
  'forecast': {
    id: 'forecast',
    entry: 'f1',
    nodes: {
      f1: { from: 'user', text: '帮我算算下个月能拿多少', next: 'f2' },
      f2: {
        from: 'agent',
        text: '试算类问题不在解答范围：助手只回答已发放工资条的求证，不做未来收入的预估。已发放月份的工资条有疑问，随时来查。',
        end: true
      }
    }
  }
}

/* ------------------------------------------------------------------ */
/* 成单：从对话上下文组装工单                                            */
/* ------------------------------------------------------------------ */

/**
 * ctx 由对话脚本选项的 meta 累积而来：
 * { disputeType, item, period, expected, actual, reason, shots, deviate, recheckConclusion }
 */
export function buildTicketFromCtx (ctx, tickets, now = TODAY) {
  const priority = evaluatePriority({
    deviate: ctx.deviate || 0,
    amount: typeof ctx.expected === 'number' ? ctx.expected : 0
  })
  const evidence = []
  if (ctx.reason) evidence.push({ kind: 'desc', text: ctx.reason })
  for (const s of ctx.shots || []) evidence.push({ kind: 'shot', label: s })
  const steps = [
    '业务事实重取：11-01 ~ 11-15 到店客次 23 次，另有 1 笔服务开始后取消订单',
    '规则命中：客次提成 25 元/客次；服务开始后取消计客次、单价减半',
    '计算还原：23 × 25 + 1 × 12.5 = 587.5 元',
    `结论判定：员工主张 ${ctx.expected} 元，与原答复 575 元偏差 ${ctx.deviate} 元`
  ]
  return {
    id: nextTicketId(tickets),
    employeeId: 'E-107',
    employeeName: '蓝田',
    position: '全职推拿师',
    salaryItem: ctx.item || '客次提成',
    period: ctx.period || '2026-11-01 ~ 2026-11-15',
    createdAt: `${now} 14:32`,
    status: 'pending',
    priority: priority.level,
    priorityReason: priority.reason,
    dispute: {
      type: ctx.disputeType || '数据疑问型',
      expected: ctx.expected,
      actual: ctx.actual,
      reason: ctx.reason || ''
    },
    evidence,
    recheck: {
      conclusion: ctx.recheckConclusion || '维持原结论',
      deviate: ctx.deviate || 0,
      steps
    },
    reply: null
  }
}
