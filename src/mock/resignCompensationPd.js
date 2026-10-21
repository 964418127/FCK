/**
 * Web 端 · 离职补偿金明细 mock
 * ------------------------------------------------------------------
 * ⚠️ 本文件是原型演示数据，用于看形态、对齐口径。
 *
 * 【本模块的边界 —— 只读、只记录，不计算、不新增】
 *   本模块是**只读明细**：录入发生在离职流程内（移动端离职审批里人工填），
 *   明细只负责展示与留痕，本身**不提供新增录入**。
 *   只回答四个问题：
 *     1. 谁输入的（operator / inputAt）
 *     2. 预估多少（estimate：签署发起时的快照，含构成）
 *     3. 算出来多少（settle：次月 5 日冻结余额后跑批，含税前 / 个税 / 实发；6 日报税后定稿）
 *     4. 实际发了多少（payout：次月 9 日到账）
 *
 * 【薪酬侧的真实时间节点 —— 取数口径以这里为准】
 *   3 日    薪酬 + 常乐豆一起计算（离职员工同批算入）
 *   4 日晚  按月结算后充值：当月负工资、公积金等抵扣完，**抵扣后的余额充值进常乐豆账户**
 *           —— 钱进账户时，余额就已经是准确的
 *   5 日    在职员工自己提交提现；离职员工由离职通道**按流程冻结**这笔余额
 *           （冻结是唯一动作，不用再等余额「可读」），冻结值才是补偿金的取数依据
 *   6 日    报税（按科目：工资薪金 / 解除劳动合同一次性补偿金）
 *           → **报税之后，工资单与补偿金单回写税后个税、数据才完善**
 *           → 数据完善之后才出**付款单**
 *   9 日    发放薪资 / 补偿金（打款到账）
 *   ⚠️ 余额在 4 日晚进账户时就已准确；**5 日只做冻结**（把数锁住，不改金额）。
 *     冻结之后余额不再变动，补偿金按冻结值跑批。
 *   ⚠️ 5 日跑批产出的只是**申报前的计算值**；个税以 6 日报税结果为准，不是 5 日报税。
 *
 *   承载范围：只承载「**不在薪酬与福利资产自动核算范围内**」的其他**协商类**金额；
 *     默认 0，**不允许输入负数**；上限 = **过去 12 个月平均收入 × (N+1)**（唯一上限，不叠单笔封顶）。
 *     福利假额等自动核算项不出现在这里。
 *     填了金额（> 0）**必须上传协商协议附件**，本明细可查（agreement）。
 *   更名为「离职补偿金明细」（原「明细」）：仍是只读视图，录入不在本页。
 *
 *   不做的事：
 *     · 不折算金额（金额由人事线下计算后手工录入）
 *     · 不计算税负（出口通道的定性 / 计税归薪酬 / 财税）
 *     · 不判定离职状态（跟随离职合同签署状态机，本模块只**映射**，不驱动）
 *
 * 【金额的三个时点 —— 明细必须三段都留】
 *   签署发起（预估）→ 次月 5 日（冻结余额 + 跑批计算，6 日报税后定稿）→ 次月 9 日（发放到账）
 *   为什么一定会差：
 *     · 发起时到实际离职日之间员工**可能继续上班** → 常乐豆余额变动
 *     · 当月工资的负数会在 3 日结算时**用常乐豆抵扣**（4 日晚进账户的余额即抵扣后），
 *       所以冻结值比「签署时的账面」少，**5 日跑批不再二次扣**
 *     · 预估是「发起时点快照 + 约数」，计算才是结算后的真实数
 *   所以明细不是一个金额，而是「预估 / 计算 / 发放」三段 + 差异原因。
 *
 * 【状态口径 —— 参考离职合同签署状态机】
 *   签署回答的是「**这笔补偿金成不成立**」，不是「某个金额生不生效」：
 *     draft（待发起签署）→ sent（待员工签署）→ employee_signed（员工已签）→ completed（签署完成）
 *     签署完成 → 协议「已成立」，具备进入次月 5 日跑批的资格
 *     走到任一步之前 → 「待成立」；拒签 / 作废 → 「已作废」（不进入计算，也不产生这笔钱）
 *
 *   ⚠️ 顺序要拧清：**协议先走，金额后置**。
 *     签署那一刻明细上只有「预估」（现金 + 常乐豆约数），并没有最终金额可「生效」；
 *     真实金额是协议成立之后、次月 5 日冻结余额后跑批才算出来的 —— 取数用的是
 *     **5 日冻结后的余额**（余额 4 日晚进账户即准确，5 日冻结只是把数锁住）。
 *     算出来的值按规则产生，6 日报税后定稿 —— 不需要再签一次，
 *     也不存在「签署让它生效」这个动作。
 *   ⚠️ 状态机为**模拟**，实际状态与流转待与离职业务确认。
 */

/* ---------------- 离职合同签署状态机（模拟） ---------------- */
/* 每个节点带 `establish`：这笔补偿金的协议是否成立（决定要不要往下算），
   不是「金额生效与否」—— 签署时点金额还只有预估，见文件头注释。 */
export const contractFlowMeta = {
  draft: {
    label: '待发起签署',
    tag: 'info',
    establish: 'pending',
    desc: '离职审批已通过，离职协议尚未发送'
  },
  sent: {
    label: '待员工签署',
    tag: 'warning',
    establish: 'pending',
    desc: '离职协议已发送，等待员工签署'
  },
  employee_signed: {
    label: '员工已签',
    tag: 'primary',
    establish: 'pending',
    desc: '员工已签署，待电子签平台出证（企业方自动落章）'
  },
  completed: {
    label: '签署完成',
    tag: 'success',
    establish: 'established',
    desc: '电子签完成（企业方自动落章），协议成立 —— 这笔补偿金确定要发，等次月 5 日冻结余额、跑批算出实际金额'
  },
  rejected: {
    label: '已拒签',
    tag: 'danger',
    establish: 'void',
    desc: '员工拒绝签署，协议不成立，不进入计算'
  },
  revoked: {
    label: '已作废',
    tag: 'info',
    establish: 'void',
    desc: '离职流程撤销 / 协议作废，协议不成立，不进入计算'
  }
}

/** 正向主链路（用于状态机图示） */
export const contractFlowSteps = ['draft', 'sent', 'employee_signed', 'completed']

/** 协议成立态（由 contractState 映射而来）—— 回答「这笔钱做不做」，不回答「金额是多少」 */
export const establishMeta = {
  pending: { label: '待成立', tag: 'warning', desc: '签署未完成，这笔补偿金还定不下来，暂不进入计算' },
  established: { label: '已成立', tag: 'success', desc: '协议已签，已进入次月 5 日的计算队列（金额届时才产生）' },
  void: { label: '已作废', tag: 'info', desc: '已拒签 / 作废，不进入计算，也不产生这笔钱' }
}

/** 金额的三个时点（明细列与时间线共用） */
export const amountStages = [
  {
    key: 'estimate',
    label: '预估',
    when: '签署发起时',
    desc: '人事在离职流程内录入的协商现金 + 常乐豆出口余额（预估，标「约」）；这是签协议时双方看到的数 —— 此刻还没有最终金额'
  },
  {
    key: 'settle',
    label: '计算',
    when: '次月 5 日跑批 · 6 日报税后定稿',
    desc: '协议成立后，5 日先冻结余额（余额 4 日晚已进账户并已准确，冻结只是锁住数），再跑批：**现金 + 冻结值 = 税前**（冻结值已含当月负工资等抵扣，不再二次扣），算【补偿金个税】，得到申报前的计算值；6 日报税、税局返回后回写，个税与实发在此定稿'
  },
  {
    key: 'payout',
    label: '发放',
    when: '次月 9 日',
    desc: '6 日报税、工资单与补偿金单数据完善之后才出付款单；9 日打款，到账金额与时间回写明细，与预估的差在此闭环'
  }
]

/* ---------------- 补偿金录入明细 ---------------- */
export const compensationEntries = [
  {
    id: 'CE202610150001',
    staffNo: 'TL2201',
    employee: '王小宁',
    job: '调理师',
    store: '五棵松万达店',
    operator: '陈静',
    operatorRole: 'HR',
    operatorId: 'hr_chenjing',
    inputAt: '2026-10-15 10:02:14',
    agreement: { name: '协商解除协议_王小宁_20261015.pdf', size: '1.24 MB', at: '2026-10-15 10:02:14', uploader: '陈静' },
    note: '协商解除：一次性现金 1,000 + 常乐豆出口（预估约 300）',
    resignCaseId: 'rs01',
    resignCaseTitle: '主动离职 · 王小宁',
    leaveDate: '2026-10-31',
    contractState: 'sent',
    // 签署发起时的预估快照
    estimate: { at: '2026-10-15 10:02:14', cash: 1000, bean: 300 },
    settle: null,
    payout: null
  },
  {
    id: 'CE202610150006',
    staffNo: '134382',
    employee: '张清闲',
    job: '调理师',
    store: '杭州城北万象城',
    operator: '李梦',
    operatorRole: '薪酬专员',
    operatorId: 'hr_limeng',
    inputAt: '2026-10-15 11:15:39',
    agreement: { name: '协商一致解除协议_张清闲_20261015.pdf', size: '860 KB', at: '2026-10-15 11:15:39', uploader: '李梦' },
    note: '协商一致：一次性现金 2,000 + 常乐豆出口（预估约 400）',
    resignCaseId: 'rs02',
    resignCaseTitle: '主动离职 · 张清闲',
    leaveDate: '2026-10-31',
    contractState: 'draft',
    estimate: { at: '2026-10-15 11:15:39', cash: 2000, bean: 400 },
    settle: null,
    payout: null
  },
  {
    id: 'CE202610150002',
    staffNo: 'TL2203',
    employee: '欧跃',
    job: '客户经理',
    store: '凤凰汇',
    operator: '陈静',
    operatorRole: 'HR',
    operatorId: 'hr_chenjing',
    inputAt: '2026-10-15 16:52:07',
    agreement: { name: '协商离职协议_欧跃_20261015.pdf', size: '1.08 MB', at: '2026-10-15 16:52:07', uploader: '陈静' },
    note: '协商离职：一次性现金 1,000 + 常乐豆出口（预估约 300）',
    resignCaseId: 'rs03',
    resignCaseTitle: '主动离职 · 欧跃',
    leaveDate: '2026-10-31',
    contractState: 'completed',
    estimate: { at: '2026-10-15 16:52:07', cash: 1000, bean: 300 },
    settle: {
      at: '2026-11-05 09:12:40',
      cash: 1000,
      bean: 320,
      beanBefore: 370,
      settledDeduct: 50,
      tax: 27,
      reason: '继续出勤至 10-31，常乐豆 300 → 370；11/3 结算时其中 50 抵了当月负工资，11/4 晚进账户 320（5 日冻结）；跑批不再二次抵扣；补偿金个税 27'
    },
    payout: { at: '2026-11-09 11:03:22', amount: 1293, status: 'paid' }
  },
  {
    id: 'CE202610140003',
    staffNo: 'TL2204',
    employee: '余晏慧',
    job: '客户经理',
    store: '君超广场',
    operator: '李梦',
    operatorRole: '薪酬专员',
    operatorId: 'hr_limeng',
    inputAt: '2026-10-14 15:20:51',
    agreement: { name: '协商一致解除协议_余晏慧_20261014.pdf', size: '2.10 MB', at: '2026-10-14 15:20:51', uploader: '李梦' },
    note: '协商一致：一次性现金 900 + 常乐豆出口（预估约 80）',
    resignCaseId: 'rs04',
    resignCaseTitle: '主动离职 · 余晏慧',
    leaveDate: '2026-10-31',
    contractState: 'completed',
    estimate: { at: '2026-10-14 15:20:51', cash: 900, bean: 80 },
    settle: {
      at: '2026-11-05 09:12:40',
      cash: 900,
      bean: 110,
      tax: 0,
      reason: '继续出勤至 10-31，常乐豆 80 → 110；无当月负工资抵扣，未达补偿金计税下限'
    },
    payout: null
  },
  {
    id: 'CE202610130004',
    staffNo: 'TL2205',
    employee: '祝金林',
    job: '客户经理',
    store: '深圳市南山区海岸城',
    operator: '陈静',
    operatorRole: 'HR',
    operatorId: 'hr_chenjing',
    inputAt: '2026-10-13 18:05:22',
    agreement: { name: '协商补偿协议_祝金林_20261013.pdf', size: '640 KB', at: '2026-10-13 18:05:22', uploader: '陈静' },
    note: '协商补偿：一次性现金 420，无常乐豆出口',
    resignCaseId: 'rs05',
    resignCaseTitle: '主动离职 · 祝金林',
    leaveDate: '2026-10-25',
    contractState: 'completed',
    estimate: { at: '2026-10-13 18:05:22', cash: 420, bean: 0 },
    settle: {
      at: '2026-11-05 09:12:40',
      cash: 420,
      bean: 0,
      tax: 0,
      reason: '无常乐豆出口、无当月负工资抵扣，与预估一致'
    },
    payout: { at: '2026-11-09 11:03:22', amount: 420, status: 'paid' }
  },
  {
    id: 'CE202610120005',
    staffNo: 'TL2210',
    employee: '赵磊',
    job: '调理师',
    store: '成都万象城店',
    operator: '陈静',
    operatorRole: 'HR',
    operatorId: 'hr_chenjing',
    inputAt: '2026-10-12 09:40:18',
    agreement: { name: '协商补偿协议_赵磊_20261012.pdf', size: '1.32 MB', at: '2026-10-12 09:40:18', uploader: '陈静' },
    note: '协商补偿款，合计约 1,200',
    resignCaseId: 'rs09',
    resignCaseTitle: '主动离职 · 赵磊（已撤销）',
    leaveDate: '—',
    contractState: 'revoked',
    estimate: { at: '2026-10-12 09:40:18', cash: 1200, bean: 0 },
    settle: null,
    payout: null
  },
  {
    id: 'CE202610110006',
    staffNo: 'TL2211',
    employee: '孙倩',
    job: '调理师',
    store: '深圳湾万象城店',
    operator: '李梦',
    operatorRole: '薪酬专员',
    operatorId: 'hr_limeng',
    inputAt: '2026-10-11 14:47:03',
    agreement: { name: '协商补偿协议_孙倩_20261011.pdf', size: '780 KB', at: '2026-10-11 14:47:03', uploader: '李梦' },
    note: '协商补偿款，合计约 760',
    resignCaseId: 'rs10',
    resignCaseTitle: '主动离职 · 孙倩（已拒签）',
    leaveDate: '2026-10-24',
    contractState: 'rejected',
    estimate: { at: '2026-10-11 14:47:03', cash: 760, bean: 0 },
    settle: null,
    payout: null
  }
]

/* ---------------- 派生 ---------------- */
export function entryOf(id) {
  return compensationEntries.find(e => e.id === id) || null
}

/** 协议成立态：由合同签署状态映射（决定这笔钱做不做，不决定金额是多少） */
export function establishOf(entry) {
  return contractFlowMeta[entry.contractState]?.establish || 'pending'
}

/** 预估合计 = 协商现金 + 常乐豆（约） */
export function estimateTotal(e) {
  return e.estimate ? e.estimate.cash + e.estimate.bean : 0
}

/** 计算税前 = 现金 + 常乐豆冻结值（冻结值已含当月负工资等抵扣，不再二次扣） */
export function settleGross(e) {
  return e.settle ? e.settle.cash + e.settle.bean : null
}

/** 计算实发 = 税前 − 补偿金个税 */
export function settleNet(e) {
  return e.settle ? settleGross(e) - (e.settle.tax || 0) : null
}

/** 发放到账 */
export function payoutAmount(e) {
  return e.payout ? e.payout.amount : null
}

/** 差异 = 实发 − 预估 */
export function deltaOf(e) {
  return e.settle ? settleNet(e) - estimateTotal(e) : null
}

/** 阶段：预估中 / 已计算待发 / 已发放 / 已作废 */
export function stageOf(e) {
  if (establishOf(e) === 'void') return { key: 'void', label: '已作废' }
  if (e.payout) return { key: 'paid', label: '已发放' }
  if (e.settle) return { key: 'settled', label: '已计算待发' }
  return { key: 'estimate', label: '预估中' }
}

export function statsOf(list = compensationEntries) {
  const sum = (arr, fn) => arr.reduce((s, e) => s + (fn(e) || 0), 0)
  const by = (k) => list.filter(e => stageOf(e).key === k)
  return [
    { key: 'estimate', label: '预估中（待签署/待计算）', count: by('estimate').length, amount: sum(by('estimate'), estimateTotal) },
    { key: 'settled', label: '已计算 · 待发放', count: by('settled').length, amount: sum(by('settled'), settleNet) },
    { key: 'paid', label: '已发放', count: by('paid').length, amount: sum(by('paid'), payoutAmount) },
    { key: 'void', label: '已作废', count: by('void').length, amount: sum(by('void'), estimateTotal) }
  ]
}
