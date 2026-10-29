/**
 * 移动端 · 离职处理 mock
 * ------------------------------------------------------------------
 * ⚠️ 本文件是原型演示数据，用于看形态、对齐口径。
 *
 * 【本场景的边界 —— 只处理离职，不代下游计算】
 *   我们（离职场景）只做三件事：
 *     1. 承接发起（员工主动申请 / 异常监控触发）→ 审批 → 定实际离职日期 → 状态落地
 *     2. 把「剩余资产」按他方给的数据**只读呈现**给人事（预估，不冻结、不结算）
 *     3. 提供**常乐豆余额**的「款出口」选择 + 人工录入离职补偿金（金额由人算，我们只留痕）
 *
 *   不做的事（都是下游）：
 *     - 假勤：自己出结果（额度结存、是否超休）—— 我们不算额度
 *     - 薪酬：按规则清算（抵扣 / 清零 / 扣缴）—— 我们不算金额
 *     - 常乐豆：账面与待结由常乐豆系统给
 *     - 社保 / 员工福利：各自处理
 *
 * 【关键口径】
 *   · 常乐豆在离职处理阶段是**预估金额**（随常乐豆结算与负工资计算实时变动），
 *     界面上一律按「预估」表达，不给精确结果数的观感；最终以薪酬实际结算为准。
 *   · 常乐豆出口的提取基数 = **负工资计算处理完成后**打入常乐豆账户的余额（净额），
 *     不是原始账面余额 —— 所以面板上账面余额与可提取余额必须分开显示。
 *   · 剩余福利假额**不走款出口**，本流程只呈现、不计算（余额由假勤系统出）。
 *   · 离职补偿金只承载「**不在薪酬与福利资产自动核算范围内**」的其他**协商类**金额：
 *     由人事与员工协商后人工录入，**默认 0**，**不允许输入负数**；上限 = **过去 12 个月平均收入 × (N+1)**，
 *     N+1 即为唯一上限（不再叠单笔封顶）；系统不折算。
 *   · 只要填了补偿金（> 0），**必须上传协商协议附件**才允许提交 —— 金额的依据要留档。
 *   · 出口选择有时序依赖：负工资计算未完成前，可提取额未确定。
 */

/* ---------------- 时点 ---------------- */
export const pdYear = 2026
export const pdMonth = 10
export const pdToday = { year: 2026, month: 10, day: 15 }

/* ---------------- 离职案例 ----------------
   source = 'apply'   ：主动离职（有申请、有审批、有期望离职日期）
   source = 'monitor' ：异常监控（未出勤触发，无申请无审批，「最后工作日」语义模糊）
   status = 'pending' | 'released' | 'void'
     void = 交接未通过、终止全部流程作废（员工仍在职，需重新发起）
   admission = 'pending' | 'approved' | 'rejected'
     发起后的第一道关口：**离职需求审核**——审核人判断是否进入交接流程；
     不通过 → 作废并通知员工。确认人复用现有发起确认链的配置（门店侧分区、总部为部门设置的上级）。
     缺省视为 approved（历史单已过准入）。
   交接进度不在这里存，见 mock/resignHandoverPd.js（按 caseId 关联）
*/
export const resignCases = [
  {
    id: 'rs01',
    source: 'apply',
    status: 'pending',
    staffNo: 'TL2201',
    name: '王小宁',
    gender: '女',
    age: 41,
    job: '调理师',
    level: '2.0',
    technique: '经络',
    store: '五棵松万达店',
    tenureYears: 15,          // 工龄（年）
    postYears: 15,            // 岗龄（年）
    phone: '13800001201',
    appliedAt: '2026-10-15 09:12:30',
    expectLeaveDate: '2026-10-20',
    reason: '照顾家庭',
    hasSocialInsurance: true,
    admission: 'approved',
    hireDate: '2011-03-08',
    employType: '全职',
    lastMonth: { output: 19353, revisitRate: '39%', bookingRate: '52%', score: 4.6, techScore: 0 }
  },
  {
    id: 'rs02',
    source: 'apply',
    status: 'pending',
    staffNo: '134382',
    name: '张清闲',
    gender: '女',
    age: 42,
    job: '调理师',
    level: '2.0',
    technique: '经络',
    store: '杭州城北万象城',
    tenureYears: 17,
    postYears: 17,
    phone: '13158032869',
    appliedAt: '2026-09-23 12:34:28',
    expectLeaveDate: '2026-09-23',
    reason: '照顾家庭',
    hasSocialInsurance: false,
    admission: 'approved',
    hireDate: '2009-06-15',
    employType: '全职',
    lastMonth: { output: 19353, revisitRate: '39%', bookingRate: '52%', score: 4.6, techScore: 0 }
  },
  {
    id: 'rs03',
    source: 'apply',
    status: 'released',
    staffNo: 'TL2203',
    name: '欧跃',
    gender: '男',
    age: 27,
    job: '客户经理',
    level: '1.5',
    technique: '—',
    store: '凤凰汇',
    tenureYears: 3,
    postYears: 3,
    phone: '13800001203',
    appliedAt: '2026-10-15 16:40:02',
    expectLeaveDate: '2026-10-15',
    reason: '自主创业',
    hasSocialInsurance: true,
    admission: 'approved',
    hireDate: '2023-04-12',
    employType: '全职',
    lastMonth: { output: 8800, revisitRate: '31%', bookingRate: '44%', score: 4.3, techScore: 0 }
  },
  {
    id: 'rs04',
    source: 'apply',
    status: 'released',
    staffNo: 'TL2204',
    name: '余晏慧',
    gender: '女',
    age: 34,
    job: '客户经理',
    level: '2.0',
    technique: '—',
    store: '君超广场',
    tenureYears: 4,
    postYears: 4,
    phone: '13800001204',
    appliedAt: '2026-10-14 11:05:18',
    expectLeaveDate: '2026-10-14',
    reason: '离家太远',
    hasSocialInsurance: true,
    admission: 'approved',
    hireDate: '2022-08-01',
    employType: '全职',
    lastMonth: { output: 9200, revisitRate: '35%', bookingRate: '47%', score: 4.5, techScore: 0 }
  },
  {
    id: 'rs05',
    source: 'apply',
    status: 'released',
    staffNo: 'TL2205',
    name: '祝金林',
    gender: '男',
    age: 46,
    job: '客户经理',
    level: '2.5',
    technique: '—',
    store: '深圳市南山区海岸城',
    tenureYears: 6,
    postYears: 6,
    phone: '13800001205',
    appliedAt: '2026-10-14 18:22:41',
    expectLeaveDate: '2026-10-14',
    reason: '工资太低',
    hasSocialInsurance: true,
    admission: 'approved',
    hireDate: '2020-11-23',
    employType: '全职',
    lastMonth: { output: 10400, revisitRate: '42%', bookingRate: '55%', score: 4.7, techScore: 0 }
  },
  /* 总部员工：不排班、不接单、无技法无门店，只有部门 */
  {
    id: 'rs06',
    source: 'apply',
    status: 'pending',
    staffNo: 'HQ0712',
    name: '徐立',
    gender: '男',
    age: 34,
    job: 'IT 工程师',
    level: 'P5',
    technique: '—',
    store: '—',
    dept: 'IT部',
    tenureYears: 1,
    postYears: 1,
    phone: '13800001206',
    appliedAt: '2026-10-17 10:05:18',
    expectLeaveDate: '2026-10-31',
    reason: '工资太低',
    hasSocialInsurance: true,
    admission: 'approved',
    hireDate: '2025-07-28',
    employType: '全职',
    lastMonth: null
  },
  /* 待审核：发起后第一道关口，确认人（现有发起确认链配置）判断是否进入交接流程 */
  {
    id: 'rs14',
    source: 'apply',
    status: 'pending',
    admission: 'pending',
    staffNo: 'TL2212',
    name: '李诗琪',
    gender: '女',
    age: 26,
    job: '客户经理',
    level: '1.5',
    technique: '—',
    store: '凤凰汇',
    tenureYears: 2,
    postYears: 2,
    phone: '13800001212',
    appliedAt: '2026-10-23 09:41:07',
    expectLeaveDate: '2026-11-05',
    reason: '回老家发展',
    hasSocialInsurance: true,
    hireDate: '2024-09-02',
    employType: '全职',
    lastMonth: { output: 7600, revisitRate: '28%', bookingRate: '41%', score: 4.2, techScore: 0 }
  },
  /* 交接未通过 → 终止全部流程作废：员工仍在职，需人事处理后重新发起 */
  {
    id: 'rs13',
    source: 'apply',
    status: 'void',
    staffNo: 'TL2207',
    name: '周敏',
    gender: '女',
    age: 29,
    job: '调理师',
    level: '1.5',
    technique: '精油',
    store: '五棵松万达店',
    tenureYears: 2,
    postYears: 2,
    phone: '13800001207',
    appliedAt: '2026-10-13 09:05:12',
    expectLeaveDate: '2026-10-24',
    reason: '离家太远',
    hasSocialInsurance: true,
    admission: 'approved',
    hireDate: '2024-05-20',
    employType: '全职',
    lastMonth: { output: 11800, revisitRate: '33%', bookingRate: '46%', score: 4.4, techScore: 0 }
  },
  /* 异常监控：无申请、无审批，未出勤触发的待处理项 */
  {
    id: 'rs11',
    source: 'monitor',
    status: 'untreated',
    staffNo: '107589',
    name: '李明亮',
    gender: '男',
    age: 39,
    job: '调理师',
    level: '正常',
    technique: '经络',
    store: '成都万象城店',
    tenureYears: 36,
    postYears: 36,
    phone: '19130852812',
    workState: '正常用工',
    absentDays: 1,
    score: 4.5,
    monitorSince: '2026-10-11'
  },
  {
    id: 'rs12',
    source: 'monitor',
    status: 'untreated',
    staffNo: '107779',
    name: '丁雪梅',
    gender: '女',
    age: 40,
    job: '调理师',
    level: '正常',
    technique: '经络',
    store: '杭州来福士店',
    tenureYears: 36,
    postYears: 36,
    phone: '18702807583',
    workState: '正常用工',
    absentDays: 1,
    score: 4.9,
    monitorSince: '2026-10-12'
  }
]

export const applyCases = resignCases.filter(c => c.source === 'apply')
export const monitorCases = resignCases.filter(c => c.source === 'monitor')

export function caseOf(id) {
  return resignCases.find(c => c.id === id) || resignCases[0]
}

/* ---------------- 岗位视角 ----------------
   原型阶段用标签区分「不同岗位的人」，方便对照各自展示的信息与审批链。
   推拿师 / 客户经理 → 门店侧；总部 → 总部侧。
*/
const personaMap = {
  rs01: 'therapist', rs02: 'therapist', rs13: 'therapist',
  rs03: 'manager', rs04: 'manager', rs05: 'manager', rs14: 'manager',
  rs06: 'hq',
  rs11: 'therapist', rs12: 'therapist', rs13: 'therapist'
}
export const personaLabels = { therapist: '推拿师', manager: '客户经理', hq: '总部' }
export function personaOf(c) { return personaMap[c.id] || 'therapist' }
export function personaLabelOf(c) { return personaLabels[personaOf(c)] }

/** 总部侧：不排班、不接单 */
export function isStoreSide(c) { return personaOf(c) !== 'hq' }

/** 列表 / 详情里「在哪」的统一表达：门店侧=合同门店，总部侧=所在部门 */
export function orgTextOf(c) {
  return personaOf(c) === 'hq' ? (c.dept || '—') : c.store
}

/** 处理侧员工信息明细行：随岗位变，总部不展示技法 / 门店 / 等级 */
export function empRowsOf(c) {
  const p = personaOf(c)
  if (p === 'hq') return [{ k: '所在部门', v: c.dept || '—' }]
  if (p === 'manager') return [{ k: '合同门店', v: c.store }]
  return [
    { k: '合同门店', v: c.store },
    { k: '等级', v: c.level },
    { k: '技法', v: c.technique }
  ]
}

/* ---------------- 审批通过后的排班影响 ----------------
   口径：审批通过后，**实际离职日期之后的排班全部取消**。
   这里只放「待取消的排班条数」，用于审批页给人事看一眼影响面。
*/
const scheduleAfterLeave = { rs01: 3, rs02: 0, rs03: 2, rs04: 1, rs05: 4, rs06: 0, rs11: 5, rs12: 2, rs13: 4, rs14: 6 }
export function scheduleCountOf(c) { return scheduleAfterLeave[c.id] || 0 }

/* ---------------- 离职需求审核（发起后的第一道关口） ----------------
   员工发起后，先由**确认人**判断是否进入交接流程，通过后才生成交接清单。
   确认人复用现有发起确认链的配置（personaPresets.reviewers）：
     门店侧按分区配置（推拿师 / 客户经理各自的确认人），总部为部门设置的上级。
   不通过 → 单据作废并通知员工。 */
export function admissionOf(c) {
  return c?.source === 'apply' ? (c.admission || 'approved') : 'none'
}

export function admissionLabelOf(c) {
  return { pending: '待审核', approved: '已进入交接', rejected: '已作废', none: '—' }[admissionOf(c)] || '—'
}

/** 准入确认人：与发起确认链同一份配置 */
export function admissionReviewersOf(c) {
  return personaPresets[personaOf(c)]?.reviewers || []
}

/* ---------------- 离职合同信息（发起时即采集，最后一步只确认发出） ----------------
   发起提交后即生成合同草稿：员工填报的（期望离职日期 / 原因 / 补充说明）+ 档案带出的
   （姓名 / 岗位 / 用工类型 / 入职日期）。实际离职日期与补偿金由人事在发出前确认/录入。 */
export function contractRowsOf(c) {
  if (!c || c.source !== 'apply') return []
  const stopMonth = (() => {
    const m = /^(\d{4})-(\d{2})/.exec(c.expectLeaveDate || '')
    if (!m) return '—'
    const y = +m[1] + (m[2] === '12' ? 1 : 0)
    const mm = m[2] === '12' ? '01' : String(+m[2] + 1).padStart(2, '0')
    return `${y}-${mm}`
  })()
  return [
    { k: '离职类型', v: '主动辞职', src: '发起带出' },
    { k: '员工姓名', v: `${c.name}（${c.staffNo}）`, src: '档案带出' },
    { k: '岗位 / 用工类型', v: `${c.job} · ${c.employType || '全职'}`, src: '档案带出' },
    { k: '入职日期', v: c.hireDate || '—', src: '档案带出' },
    { k: '最后工作日', v: c.expectLeaveDate, src: '员工填报 · 人事确认后锁定' },
    { k: '离职原因', v: c.reason, src: '员工填报' },
    { k: '社保公积金停缴', v: `${stopMonth} 起`, src: '按最后工作日自动算' },
    { k: '一次性补偿金', v: '如有，人事协商后录入（协议附件留档）', src: '人事后补' }
  ]
}

/* ---------------- 一次性补偿金的金额口径 ----------------
   上限 = 过去 12 个月平均收入 × (N + 1)   —— N+1 是唯一上限，不叠单笔封顶
     · 基数：员工**过去 12 个月的平均收入**，取数自薪酬
         推拿师 / 客户经理 → 模块化薪酬「人员薪酬明细」的**每月收入小计**（工资单口径）
         总部            → 总部薪酬的**每月实发工资**
     · N  ：在本单位工作的年限（本原型按整年计）
     · +1 ：代通知金一个月
   注意：这里只给**上限**，金额仍由人事按协商结果人工录入。
*/
const avgIncome12m = {
  rs01: 8200, rs02: 7900, rs03: 9600,
  rs04: 8800, rs05: 10400, rs06: 15500, rs13: 9100, rs14: 8600
}

export function avgIncomeOf(c) {
  return avgIncome12m[c.id] ?? null
}

/** 补偿金上限：{ avg, n, months, cap }（cap = avg × months） */
export function compLimitOf(c) {
  const avg = avgIncomeOf(c)
  if (!avg) return null
  const n = Math.max(0, Math.floor(c.tenureYears || 0))
  const months = n + 1
  const cap = avg * months
  return { avg, n, months, cap }
}

/** 卡片角标：单据状态（主动离职：待准入 / 待审核 / 已办结 / 已作废；异常监控：未处理 / 已解除） */
export function badgeOf(c) {
  if (c.source === 'monitor') return c.status === 'untreated' ? '未处理' : '已解除'
  if (c.status === 'void') return '已作废'
  if (c.status === 'pending' && admissionOf(c) === 'pending') return '待审核'
  return c.status === 'pending' ? '待审核' : '已办结'
}

/** 状态字：员工状态（在职 / 已离职）；作废单员工仍在职 */
export function statusLabel(c) {
  if (c.source === 'monitor') return '未处理'
  if (c.status === 'void') return '在职'
  return c.status === 'pending' ? '在职' : '已离职'
}

/* ---------------- 收款账户（银行卡） ----------------
   ⚠️ 来源 = **新员工关系**，本场景只做只读呈现：
     · 员工侧通用发起单里核对（只读，不现填）
     · 处理侧（人事审批页）默认显示 —— 批钱之前先看到钱往哪打
   用途：最后工资 + 一次性补偿金的收款账户。
   本场景**不提供修改入口**；卡信息以新员工关系为准（是否允许发起时改卡，见附录待决）。
*/
const bankAccounts = {
  rs01: { holder: '王小宁', cardNo: '6229 0843 3251 7097', bankName: '兴业银行' },
  rs02: { holder: '张清闲', cardNo: '6214 8302 4471 2216', bankName: '招商银行' },
  rs03: { holder: '欧跃', cardNo: '6228 4801 9932 5570', bankName: '中国农业银行' },
  rs04: { holder: '余晏慧', cardNo: '6217 0038 1102 8843', bankName: '中国建设银行' },
  rs05: { holder: '祝金林', cardNo: '6222 0210 0088 3391', bankName: '中国工商银行' },
  rs06: { holder: '徐立', cardNo: '6217 0038 6620 4471', bankName: '中国建设银行' },
  rs11: { holder: '李明亮', cardNo: '6225 8801 5527 0134', bankName: '兴业银行' },
  rs12: { holder: '丁雪梅', cardNo: '6214 8302 7730 5581', bankName: '招商银行' },
  rs13: { holder: '周敏', cardNo: '6217 0038 1102 6690', bankName: '中国建设银行' }
}

export function bankAccountOf(c) {
  return bankAccounts[c.id] || { holder: c.name, cardNo: '—', bankName: '—' }
}

/* ---------------- 员工侧「离职需求」发起：三种岗位视角 ----------------
   员工本人视图：基础信息与收款账户都从**新员工关系**带出（只读）；
   审批链按**岗位 / 用工类型**配置带出（审核人 + 抄送人）。
   员工在这里只填两样：期望离职日期、离职原因（枚举多选 + 补充说明）。

   ⚠️ 原型阶段用「岗位差异」标出**随岗位变化的信息**（不带分组标题，正式开发按档案自动判断）：
     推拿师 → 技法 / 等级 / 合同门店；客户经理 → 合同门店；总部 → 所在部门。
   审批链也随之不同：门店侧走到人事经理或城市总，总部侧走单一审批人。
*/
export const personaPresets = {
  therapist: {
    key: 'therapist',
    label: '推拿师',
    orgLabel: '合同门店',
    applicant: {
      name: '王小宁', staffNo: 'TL2201', job: '调理师', level: '2.0',
      employType: '全职', org: '五棵松万达店', hireDate: '2011-03-08'
    },
    diffRows: [
      { k: '技法', v: '经络' },
      { k: '等级', v: '2.0' },
      { k: '合同门店', v: '五棵松万达店' }
    ],
    bank: { holder: '王小宁', cardNo: '6229 0843 3251 7097', bankName: '兴业银行' },
    reviewers: [{ name: '邓黎英', role: '人事经理' }],
    cc: [
      { name: '龙春燕', role: '招生老师' },
      { name: '潘小娅', role: '技术副总' },
      { name: '杨春燕', role: '城市总' },
      { name: '聂玉梅', role: '法务专员' }
    ]
  },
  manager: {
    key: 'manager',
    label: '客户经理',
    orgLabel: '合同门店',
    applicant: {
      name: '欧跃', staffNo: 'TL2203', job: '客户经理', level: '1.5',
      employType: '全职', org: '凤凰汇', hireDate: '2023-04-12'
    },
    diffRows: [
      { k: '合同门店', v: '凤凰汇' }
    ],
    bank: { holder: '欧跃', cardNo: '6228 4801 9932 5570', bankName: '中国农业银行' },
    reviewers: [{ name: '冯海霞', role: '城市总' }],
    cc: [
      { name: '代霞', role: '招生老师' },
      { name: '聂玉梅', role: '法务专员' }
    ]
  },
  hq: {
    key: 'hq',
    label: '总部',
    orgLabel: '所在部门',
    applicant: {
      name: '徐立', staffNo: 'HQ0712', job: 'IT 工程师', level: 'P5',
      employType: '全职', org: 'IT部', hireDate: '2025-07-28'
    },
    diffRows: [
      { k: '所在部门', v: 'IT部' }
    ],
    bank: { holder: '徐立', cardNo: '6217 0038 6620 4471', bankName: '中国建设银行' },
    reviewers: [{ name: '邢斌', role: '审批人' }],
    cc: [{ name: '聂玉梅', role: '法务专员' }]
  }
}

/* ---------------- 剩余资产快照 ----------------
   ⚠️ 全部为**他方计算的只读数据**，本模块只呈现、不计算：
     · bean.onBook     常乐豆当前账面余额      ← 常乐豆系统
     · bean.pending    待结数量（已发生未结算） ← 常乐豆系统
     · bean.withdrawable 可提取余额（当月抵扣后充值进账户、5 日由离职通道冻结的余额）← 薪酬结算结果
     · bean.settled    余额是否已冻结（余额 4 日晚进账户即准确，5 日按流程冻结；决定出口选择能否提交）
     · negative.account 负工资账户余额          ← 薪酬（**只展示余额**，抵扣 / 清零不在此计算）
     · quota.*         剩余福利假额（假勤出结果）
   这些是**预估值**：随常乐豆结算与负工资计算实时变动，本模块不冻结、不结算。
*/
const assetSnapshots = {
  rs01: {
    bean: { onBook: 820, pending: 260, withdrawable: 640, settled: true },
    negative: { account: -310 },
    quota: { rows: [{ name: '年假', remain: 3, unit: '天' }], estimated: null },
    consult: null
  },
  rs02: {
    bean: { onBook: 1250, pending: 0, withdrawable: 1250, settled: true },
    negative: { account: 0 },
    quota: { rows: [{ name: '年假', remain: 5, unit: '天' }], estimated: null },
    consult: null
  },
  rs03: {
    bean: { onBook: 0, pending: 0, withdrawable: 0, settled: true },
    negative: { account: -420 },
    quota: { rows: [{ name: '年假', remain: 0, unit: '天' }], estimated: null },
    consult: null
  },
  rs04: {
    bean: { onBook: 430, pending: 150, withdrawable: 430, settled: false },
    negative: { account: -150 },
    quota: { rows: [{ name: '年假', remain: 2, unit: '天' }], estimated: null },
    consult: null
  },
  rs05: {
    bean: { onBook: 60, pending: 0, withdrawable: 60, settled: true },
    negative: { account: -2600 },
    quota: { rows: [{ name: '年假', remain: 1, unit: '天' }], estimated: null },
    /* 在途协商扣缴：大型投诉赔偿走协商协议，人事定每月扣款额 —— 离职时会中断，剩余部分待定 */
    consult: { total: 2600, perMonth: 500, paid: 0, remain: 2600, inFlight: true }
  },
  rs06: {
    bean: { onBook: 340, pending: 0, withdrawable: 340, settled: true },
    negative: { account: 0 },
    quota: { rows: [{ name: '年假', remain: 6, unit: '天' }], estimated: null },
    consult: null
  },
  rs14: {
    bean: { onBook: 520, pending: 180, withdrawable: 520, settled: true },
    negative: { account: 0 },
    quota: { rows: [{ name: '年假', remain: 3, unit: '天' }], estimated: null },
    consult: null
  },
  rs11: {
    bean: { onBook: 1580, pending: 320, withdrawable: 1580, settled: false },
    negative: { account: -80 },
    quota: { rows: [{ name: '年假', remain: 4, unit: '天' }], estimated: null },
    consult: null
  },
  rs12: {
    bean: { onBook: 240, pending: 90, withdrawable: 240, settled: false },
    negative: { account: 0 },
    quota: { rows: [{ name: '年假', remain: 2.5, unit: '天' }], estimated: null },
    consult: null
  },
  /* 作废单：交接未通过，未进入资产处理，资产只留发起时的快照 */
  rs13: {
    bean: { onBook: 180, pending: 0, withdrawable: 180, settled: false },
    negative: { account: -3200 },
    quota: { rows: [{ name: '年假', remain: 1.5, unit: '天' }], estimated: null },
    consult: null
  }
}

export function assetSnapshotOf(c) {
  const s = assetSnapshots[c.id]
  if (!s) return null
  return JSON.parse(JSON.stringify(s))
}

/* ---------------- 款出口 ----------------
   出口本身是我们的设计：**常乐豆余额**（负工资处理后）从哪条通道出去。
   ⚠️ 出口**不含福利假**：剩余福利假额不走出口，由「离职补偿金」人工折算后补录。
   两条通道的**计税规则不在这里定义**（属薪酬/财税），我们只提供选项与留痕。
*/
export const payoutChannels = [
  {
    value: 'compensation',
    label: '一次性补偿金',
    desc: '离职时一次性发放，金额人工录入并备注款项组成',
    tax: '按补偿金口径由薪酬侧处理'
  },
  {
    value: 'salary',
    label: '并入薪金',
    desc: '随当月工资发放',
    tax: '与工资合并计税'
  }
]

/** 需要选择出口的款项条目 —— 仅常乐豆（预估金额） */
export function payoutItemsOf(c) {
  const s = assetSnapshotOf(c)
  if (!s) return []
  return [
    {
      id: 'bean',
      name: '常乐豆余额（负工资处理后）',
      amount: s.bean.withdrawable,
      unitText: '元',
      channel: 'salary',
      estimate: true,   // 预估金额：随常乐豆结算与负工资计算实时变动
      auto: true,
      note: '现状默认并入薪金；常乐豆余额需员工拿回。金额为预估，最终以薪酬结算为准'
    }
  ]
}

/* ---------------- 离职原因（多选，沿用现有） ---------------- */
export const resignReasons = ['工资太低', '离家太远', '结婚生子', '自主创业', '照顾家庭']

/* ---------------- 离职类型 ----------------
   被动离职**不可选**：它由员工的异常行为触发（异常监控 → 解除用工），
   不是在发起 / 审批表单里选出来的；所以这里默认且只默认「主动离职」。
*/
export const resignTypes = [
  { value: 'voluntary', label: '主动离职' },
  { value: 'passive', label: '被动离职', disabled: true },
  { value: 'negotiated', label: '协商一致解除劳动合同' }
]
export const defaultResignType = 'voluntary'

/* ---------------- 审批确认条款 ---------------- */
export const approveClauses = [
  '一旦审批离职，实际离职日期将被锁定，无法更改。',
  '审批通过后，实际离职日期之后的排班将全部取消（推拿师 / 客户经理均适用），不再排给本人。',
  '实际离职日期之后失去接单权限。',
  '此操作不可撤销。'
]

/** 总部岗位：不排班、不接单，条款里不出现这两项 */
export const approveClausesHq = [
  '一旦审批离职，实际离职日期将被锁定，无法更改。',
  '总部岗位不排班、不接单，本笔离职不涉及排班取消与接单权限截断。',
  '此操作不可撤销。'
]
