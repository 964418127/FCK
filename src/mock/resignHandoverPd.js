/**
 * 离职交接 · mock + 状态机
 * ------------------------------------------------------------------
 * ⚠️ 原型演示数据。四类页面（模板列表 / 模板编辑 / 交接进度 / 节点确认）
 *    以及现有四页的改造全部从这里的**函数**读结论，不各自判断。
 *
 * 【口径（2026-10-23 定稿 · 五次修订：纯节点模型）】
 *   · 链路：发起 → 交接（按岗位套模板）→ 审批（资产处理/发协议）→ 签署 → 金额
 *   · 编排 = **平铺节点 + 前置节点**，没有阶段：
 *       - 一个模板就是一张节点清单，没有分组、没有层级
 *       - 每个节点自带 `deps`（前置节点 id 数组）：
 *           空 = 发起后即可开始办理；非空 = 这些前置**全部**办结后才能开始办理
 *       - 并行不是配出来的，是**没配前置**的自然结果；先后只看 deps，
 *         跟节点在列表里的上下位置无关（列表顺序只用于展示）
 *       - 一个节点可以有多个前置（汇合）、可以被多个节点同时等待（分叉）
 *       - 保存时做环校验：成环的节点列表直接拦下
 *   · 节点终态：done（完成）/ rejected（不通过）/ skipped（跳过）
 *       closed = 因终止关闭（派生，不可再确认）
 *   · 门禁：must（必过）/ optional（可选，软性只需结果）
 *       - must   不通过 → 实时终止全部流程，终止后作废、需重新发起
 *       - optional 不通过 → 只记录，仍放行；must 不可跳过，跳过仅人事可操作
 *   · 系统检查节点：公共枚举（systemCheckDict），添加节点时选「系统检查」类型；
 *     判定条件由检查 Agent 管理并按批次反馈（节点只配 门禁 / 前置 / 次数上限，
 *     复查节奏归 Agent 自身配置）；什么时候开始查完全由前置决定
 *     （无前置 = 发起后即查；有前置 = 前置办结后开始），之后按 Agent 节奏自动落结论，无需人工确认
 *   · 未处理只催办、超时只升级提醒人事，都不自动终止
 *   · 模板变更不追溯在途单（发起时快照模板版本）
 *   · 我们只留痕不判断事情做没做；交接动作本身在系统外完成
 */

/* ---------------- 角色与人员解析 ----------------
   负责人按角色自动定位（正式开发按组织架构解析），
   原型用固定人名表达示例；模板节点上允许「指定到人覆盖」。 */
export const handoverRoles = [
  { key: 'store-manager', label: '门店店长' },
  { key: 'supervisor', label: '直属上级' },
  { key: 'finance', label: '财务专员' },
  { key: 'it', label: 'IT 专员' },
  { key: 'hr', label: '人事经理' },
  { key: 'region-head', label: '大区总' },
  { key: 'gm', label: '总经理' }
]

/* ---------------- 系统可执行节点（公共枚举字典） ----------------
   模板里通过「添加节点 → 系统检查」引用一条，节点上只配 门禁 / 前置 / 次数上限。
   判定条件（pass / soft）的**主权归检查 Agent**：由相关人员对话式配置、测试验证后上线，
   Agent 自定运行节奏并按批次反馈——本字典里的 pass / soft 是**最新一次批次反馈的镜像**，
   历史批次条件走 checkAgentBatches（批次条件日志）回查。 */
export const systemCheckDict = [
  {
    key: 'debt', name: '负债检查', source: '财务模块', desc: '是否存在未结清借款、欠款或备用金缺口',
    pass: { logic: 'and', items: ['未结清借款 = 0', '欠款 = 0', '备用金缺口 = 0'] },
    soft: { logic: 'and', items: ['-100 ≤ 欠款合计', '欠款合计 < 0'] }
  },
  {
    key: 'complaint', name: '客诉纠纷检查', source: '客诉工单', desc: '是否有未完结的客诉与纠纷工单',
    pass: { logic: 'and', items: ['近 30 天待处理工单 = 0'] },
    soft: { logic: 'or', items: ['待处理 ≤ 2 件', '均已达成和解意向并进入处理流程'] }
  },
  {
    key: 'asset', name: '资产归还检查', source: '资产台账', desc: '工服、工具、设备等是否全部归还销账',
    pass: { logic: 'and', items: ['应归还资产未销账 = 0 件'] },
    soft: { logic: 'and', items: ['未销账 ≤ 1 件', '剩余物品已约定归还日期'] }
  },
  {
    key: 'schedule', name: '在途排班检查', source: '排班系统', desc: '期望离职日期之后是否仍有已排班次',
    pass: { logic: 'and', items: ['期望离职日期后在途班次 = 0'] },
    soft: { logic: 'and', items: ['在途班次 ≤ 1', '剩余班次均可调休替'] }
  },
  {
    key: 'bean', name: '常乐豆余额检查', source: '常乐豆', desc: '是否存在未结算账期或负余额',
    pass: { logic: 'and', items: ['账面余额已冻结且待结 = 0'] },
    soft: null
  },
  {
    key: 'attendance', name: '考勤异常检查', source: '假勤模块', desc: '是否有未处理的考勤异常与漏卡补登',
    pass: { logic: 'and', items: ['未处理异常 = 0 条'] },
    soft: { logic: 'or', items: ['排班差异 < 10%', '打卡差异 < 5%'] }
  }
]

export const checkLabelOf = (key) => (systemCheckDict.find(x => x.key === key) || {}).name || key

/** 检查项定义：通过（期望结果）/ 软性（差异区间）/ 未通过（两者都不命中），系统侧维护、业务只读 */
export const checkDefOf = (key) => systemCheckDict.find(x => x.key === key) || {}

/** 结果域文本化：条件按逻辑关系连接（用于 tooltip / 抽屉等窄空间展示） */
export const defJoin = (def) => (!def || !def.items?.length)
  ? ''
  : def.items.join(def.logic === 'or' ? ' 或 ' : ' 且 ')

/** 结果域逻辑标签：or = 任一命中即算，and = 全部命中才算 */
export const defLogicLabel = (def) => (def?.logic === 'or' ? '任一命中' : '全部命中')

/* ---------------- 检查 Agent · 执行日志（批次条件日志，mock） ----------------
   批次 = 检查项 × 一轮盘查：条件是批次级的（本批所有在途单同一套），结果逐单。
   每批记录：批次号 / 执行时间（ranAt）/ 条件版本（version，含上线时间与配置人）/
   当批条件快照（pass / soft）/ 逐单判定（verdicts：单据 + 判定 + 指标原值）/ 汇总与取数异常。
   取数异常 ≠ 未通过：单独标记、Agent 重试、不占次数。
   **最新一批的条件 == systemCheckDict 里的镜像**；流程节点某次判断 → 明细批次号 → 这里对上。 */
const dictOf = (k) => systemCheckDict.find(x => x.key === k)

export const checkAgentBatches = {
  debt: [
    { batchNo: 'B-20261024-01', ranAt: '2026-10-24 08:30', version: 'v3', condAt: '2026-10-24 08:00', configuredBy: '邓黎英',
      pass: dictOf('debt').pass, soft: dictOf('debt').soft,
      scanned: 4, passN: 2, softN: 0, failN: 2, errN: 0, note: '软性区间从 500 收窄到 100',
      verdicts: [
        { case: 'rs09', result: '通过', metrics: '无未结清负债（三项条件全部命中）' },
        { case: 'rs10', result: '通过', metrics: '无未结清负债' },
        { case: 'rs08', result: '未通过', metrics: '欠款合计 ¥80，未命中任何区间' },
        { case: 'rs14', result: '未通过', metrics: '备用金缺口 ¥1,200，未命中任何区间' }
      ] },
    { batchNo: 'B-20261023-01', ranAt: '2026-10-23 08:30', version: 'v2', condAt: '2026-10-12 09:00', configuredBy: '李文静',
      pass: dictOf('debt').pass, soft: { logic: 'and', items: ['-500 ≤ 欠款合计', '欠款合计 < 0'] },
      scanned: 3, passN: 2, softN: 0, failN: 1, errN: 0, note: '',
      verdicts: [
        { case: 'rs09', result: '通过', metrics: '无未结清负债' },
        { case: 'rs10', result: '通过', metrics: '无未结清负债' },
        { case: 'rs08', result: '未通过', metrics: '欠款合计 ¥120，未命中任何区间' }
      ] },
    { batchNo: 'B-20261012-01', ranAt: '2026-10-12 09:10', version: 'v2', condAt: '2026-10-12 09:00', configuredBy: '李文静',
      pass: dictOf('debt').pass, soft: { logic: 'and', items: ['-500 ≤ 欠款合计', '欠款合计 < 0'] },
      scanned: 9, passN: 7, softN: 0, failN: 2, errN: 0, note: 'v2 首批：软性上线' },
    { batchNo: 'B-20260928-01', ranAt: '2026-09-28 10:20', version: 'v1', condAt: '2026-09-28 10:00', configuredBy: '李文静',
      pass: dictOf('debt').pass, soft: null,
      scanned: 6, passN: 5, softN: 0, failN: 1, errN: 0, note: '初版：仅通过段，无软性区间' }
  ],
  complaint: [
    { batchNo: 'B-20261020-01', ranAt: '2026-10-20 09:10', version: 'v2', condAt: '2026-10-20 09:00', configuredBy: '邓黎英',
      pass: dictOf('complaint').pass, soft: dictOf('complaint').soft,
      scanned: 3, passN: 1, softN: 1, failN: 1, errN: 0, note: '软性增加「已达成和解意向」通道',
      verdicts: [
        { case: 'rs10', result: '通过', metrics: '近 30 天待处理工单 0 件' },
        { case: 'rs09', result: '软性命中', metrics: '待处理 1 件（≤ 2），其余已达成和解意向' },
        { case: 'rs01', result: '未通过', metrics: '近 30 天待处理工单 2 件，未命中任何区间' }
      ] },
    { batchNo: 'B-20261017-03', ranAt: '2026-10-17 15:00', version: 'v1', condAt: '2026-09-15 09:00', configuredBy: '王慧',
      pass: dictOf('complaint').pass, soft: { logic: 'or', items: ['待处理 ≤ 1 件'] },
      scanned: 3, passN: 1, softN: 1, failN: 1, errN: 0, note: '',
      verdicts: [
        { case: 'rs10', result: '通过', metrics: '近 30 天待处理工单 0 件' },
        { case: 'rs09', result: '软性命中', metrics: '待处理 1 件（≤ 1）' },
        { case: 'rs01', result: '未通过', metrics: '近 30 天待处理工单 2 件，未命中任何区间' }
      ] },
    { batchNo: 'B-20261017-02', ranAt: '2026-10-17 13:00', version: 'v1', condAt: '2026-09-15 09:00', configuredBy: '王慧',
      pass: dictOf('complaint').pass, soft: { logic: 'or', items: ['待处理 ≤ 1 件'] },
      scanned: 2, passN: 0, softN: 1, failN: 1, errN: 0, note: '',
      verdicts: [
        { case: 'rs09', result: '软性命中', metrics: '待处理 1 件（≤ 1）' },
        { case: 'rs01', result: '未通过', metrics: '近 30 天待处理工单 2 件，未命中任何区间' }
      ] },
    { batchNo: 'B-20261017-01', ranAt: '2026-10-17 11:00', version: 'v1', condAt: '2026-09-15 09:00', configuredBy: '王慧',
      pass: dictOf('complaint').pass, soft: { logic: 'or', items: ['待处理 ≤ 1 件'] },
      scanned: 2, passN: 0, softN: 0, failN: 2, errN: 0, note: '',
      verdicts: [
        { case: 'rs10', result: '未通过', metrics: '近 30 天待处理工单 1 件，未达成和解意向，未命中软性' },
        { case: 'rs01', result: '未通过', metrics: '近 30 天待处理工单 3 件，未命中任何区间' }
      ] },
    { batchNo: 'B-20260921-02', ranAt: '2026-09-21 17:00', version: 'v1', condAt: '2026-09-15 09:00', configuredBy: '王慧',
      pass: dictOf('complaint').pass, soft: { logic: 'or', items: ['待处理 ≤ 1 件'] },
      scanned: 1, passN: 1, softN: 0, failN: 0, errN: 0, note: '',
      verdicts: [{ case: 'rs02', result: '通过', metrics: '近 30 天待处理工单 0 件' }] },
    { batchNo: 'B-20260921-01', ranAt: '2026-09-21 09:00', version: 'v1', condAt: '2026-09-15 09:00', configuredBy: '王慧',
      pass: dictOf('complaint').pass, soft: { logic: 'or', items: ['待处理 ≤ 1 件'] },
      scanned: 1, passN: 0, softN: 0, failN: 1, errN: 0, note: '',
      verdicts: [{ case: 'rs02', result: '未通过', metrics: '近 30 天待处理工单 2 件，未命中任何区间' }] },
    { batchNo: 'B-20260915-01', ranAt: '2026-09-15 09:20', version: 'v1', condAt: '2026-09-15 09:00', configuredBy: '王慧',
      pass: dictOf('complaint').pass, soft: { logic: 'or', items: ['待处理 ≤ 1 件'] },
      scanned: 7, passN: 5, softN: 0, failN: 2, errN: 0, note: '初版' }
  ],
  asset: [
    { batchNo: 'B-20261017-01', ranAt: '2026-10-17 09:00', version: 'v3', condAt: '2026-10-12 08:00', configuredBy: '邓黎英',
      pass: dictOf('asset').pass, soft: dictOf('asset').soft,
      scanned: 2, passN: 0, softN: 0, failN: 2, errN: 0, note: '',
      verdicts: [
        { case: 'rs01', result: '未通过', metrics: '应归还资产未销账 1 件（工服 1），差 1 件归零' },
        { case: 'rs12', result: '未通过', metrics: '手持终端 1 台状态异常（台账未回写）' }
      ] },
    { batchNo: 'B-20261016-01', ranAt: '2026-10-16 09:00', version: 'v3', condAt: '2026-10-12 08:00', configuredBy: '邓黎英',
      pass: dictOf('asset').pass, soft: dictOf('asset').soft,
      scanned: 3, passN: 0, softN: 0, failN: 2, errN: 1, note: 'rs08 台账取数超时（取数异常，已转重试、不占次数）',
      verdicts: [
        { case: 'rs01', result: '未通过', metrics: '应归还资产未销账 2 件（工服 2），差 2 件归零' },
        { case: 'rs12', result: '未通过', metrics: '手持终端 1 台状态异常（台账未回写）' },
        { case: 'rs08', result: '取数异常', metrics: '资产台账接口超时，本单未取得结论' }
      ] },
    { batchNo: 'B-20261015-02', ranAt: '2026-10-15 09:00', version: 'v3', condAt: '2026-10-12 08:00', configuredBy: '邓黎英',
      pass: dictOf('asset').pass, soft: dictOf('asset').soft,
      scanned: 1, passN: 0, softN: 0, failN: 1, errN: 0, note: '',
      verdicts: [{ case: 'rs12', result: '未通过', metrics: '手持终端 1 台状态异常（台账未回写）' }] },
    { batchNo: 'B-20261014-01', ranAt: '2026-10-14 09:00', version: 'v3', condAt: '2026-10-12 08:00', configuredBy: '邓黎英',
      pass: dictOf('asset').pass, soft: dictOf('asset').soft,
      scanned: 1, passN: 0, softN: 0, failN: 1, errN: 0, note: '',
      verdicts: [{ case: 'rs12', result: '未通过', metrics: '手持终端 1 台状态异常（台账未回写）' }] },
    { batchNo: 'B-20261013-01', ranAt: '2026-10-13 09:00', version: 'v3', condAt: '2026-10-12 08:00', configuredBy: '邓黎英',
      pass: dictOf('asset').pass, soft: dictOf('asset').soft,
      scanned: 1, passN: 0, softN: 0, failN: 1, errN: 0, note: 'v3 首批：软性增加「约定归还日期」通道',
      verdicts: [{ case: 'rs12', result: '未通过', metrics: '手持终端 1 台状态异常（台账未回写）' }] },
    { batchNo: 'B-20260925-01', ranAt: '2026-09-25 09:10', version: 'v2', condAt: '2026-09-25 09:00', configuredBy: '邓黎英',
      pass: dictOf('asset').pass, soft: null,
      scanned: 5, passN: 4, softN: 0, failN: 1, errN: 0, note: '初版：仅通过段' }
  ],
  schedule: [
    { batchNo: 'B-20261018-01', ranAt: '2026-10-18 09:10', version: 'v1', condAt: '2026-10-18 09:00', configuredBy: '王慧',
      pass: dictOf('schedule').pass, soft: dictOf('schedule').soft,
      scanned: 1, passN: 1, softN: 0, failN: 0, errN: 0, note: '初版',
      verdicts: [{ case: 'rs09', result: '通过', metrics: '期望离职日期后在途班次 0' }] }
  ],
  bean: [
    { batchNo: 'B-20261015-01', ranAt: '2026-10-15 09:10', version: 'v1', condAt: '2026-10-15 09:00', configuredBy: '王慧',
      pass: dictOf('bean').pass, soft: null,
      scanned: 1, passN: 1, softN: 0, failN: 0, errN: 0, note: '初版：无软性区间',
      verdicts: [{ case: 'rs02', result: '通过', metrics: '账面余额已冻结且待结 0' }] }
  ],
  attendance: [
    { batchNo: 'B-20261022-01', ranAt: '2026-10-22 09:10', version: 'v2', condAt: '2026-10-22 09:00', configuredBy: '邓黎英',
      pass: dictOf('attendance').pass, soft: dictOf('attendance').soft,
      scanned: 1, passN: 0, softN: 0, failN: 0, errN: 1, note: 'rs14 排班接口超时（取数异常，已转重试、不占次数）',
      verdicts: [{ case: 'rs14', result: '取数异常', metrics: '考勤系统接口超时，本单未取得结论' }] },
    { batchNo: 'B-20261005-01', ranAt: '2026-10-05 09:10', version: 'v1', condAt: '2026-10-05 09:00', configuredBy: '李文静',
      pass: dictOf('attendance').pass, soft: { logic: 'or', items: ['排班差异 < 10%'] },
      scanned: 6, passN: 5, softN: 0, failN: 1, errN: 0, note: '初版' }
  ]
}

/** 某检查项的批次日志（新批次在前） */
export const batchesOf = (key) => checkAgentBatches[key] || []

/** 最新一次批次反馈（枚举页镜像的来源） */
export const latestBatchOf = (key) => batchesOf(key)[0] || null

/* 执行明细涉及的员工（原型演示；正式开发从离职单据带出：姓名 / 工号 / 岗位） */
export const runEmployees = {
  rs01: { name: '王小宁', empNo: 'TL2201', job: '调理师' },
  rs02: { name: '徐海峰', empNo: 'TL1876', job: '客户经理' },
  rs06: { name: '陈志远', empNo: 'TL3010', job: 'IT 工程师' },
  rs08: { name: '张启明', empNo: 'TL2310', job: '客户经理' },
  rs09: { name: '孙晓梅', empNo: 'TL2455', job: '前台' },
  rs10: { name: '何丽娟', empNo: 'TL1990', job: '调理师' },
  rs11: { name: '赵文博', empNo: 'TL2015', job: '前台' },
  rs12: { name: '李国栋', empNo: 'TL2102', job: '调理师' },
  rs13: { name: '冯凯', empNo: 'TL1780', job: '客户经理' },
  rs14: { name: '郑一鸣', empNo: 'TL1834', job: '客户经理' }
}

/** 逐单记录的员工信息（case = 在途离职单号） */
export const empOf = (caseId) => runEmployees[caseId] || { name: caseId, empNo: '—', job: '—' }

/* ---------------- 系统检查的两层频率（2026-10-26 复评定稿） ----------------
   ① **Agent 运行节奏**：Agent 自己决定多久盘查一轮、什么时候出新批次 —— Agent 侧配置，流程侧不可配、也不感知。
   ② **流程取数频率**：离职流程多久去取一次结果值（多久看一眼 Agent 的最新批次结果）—— **模板节点配置**，归流程侧。

   节点上配四样：门禁（must / optional）、前置节点、**取数频率**、**次数上限**。
   什么时候开始取由前置决定（前置办结才开始取）。

   **次数上限计「消费到的不同未通过批次」，不���取数动作次数**：
     - 流程按 1 小时取一次、Agent 6 小时出一批 → 取 5 次可能只消费到 1 个新批次，
       同一批次结果反复取到不重复计数（否则会在实际只过了几小时时误判超时、误终止流程）。
     - 查到「通过」立即办结、停止取数且不占次数；到上限仍无「通过」：
       必过 → 终止全部流程（避免假卡死），软性 → 按「未取得结论」放行留痕。
   取数频率 ≠ 结果产生频率：配置的是「多久看一眼」，结果什么时候变由 Agent 决定。
   运行中状态 = checking（检查中），不算终态。 */

/* 取数频率：'none' = 只取一次；其余为「<数字><单位>」，单位 m=分钟 / h=小时 / d=天 */
const FF_UNIT = { m: '分钟', h: '小时', d: '天' }
const FF_SHORT = { m: 'min', h: 'h', d: 'd' }

/** 解析取数频率 → { num, unit }；'none'/空 返回 null */
export function parseFetchFreq(f) {
  const m = /^(\d+)(m|h|d)$/.exec(f || '')
  return m ? { num: +m[1], unit: m[2] } : null
}

export function fetchFreqLabelOf(f) {
  if (!f || f === 'none') return '只取一次'
  const p = parseFetchFreq(f)
  if (!p) return f
  if (p.unit === 'd' && p.num === 1) return '每天'
  return `每 ${p.num} ${FF_UNIT[p.unit]}`
}

/** 系统节点运行摘要（开始时机由前置决定；取数频率归流程侧，产出节奏归 Agent） */
export function cycleTextOf(n, hasPrev = false) {
  if (!n) return ''
  const when = hasPrev ? '前置节点办结后开始取数' : '发起后开始取数'
  const tail = n.maxRuns ? `最多 ${n.maxRuns} 个未通过批次` : '批次不设上限'
  return `${when} · ${fetchFreqLabelOf(n.fetchFreq)}取一次 · ${tail}`
}

/** 短文案（列表 / 结构预览里的角标） */
export function cycleShortOf(n, hasPrev = false) {
  if (!n) return ''
  const when = hasPrev ? '前置后' : '发起后'
  const p = parseFetchFreq(n.fetchFreq)
  const ff = n.fetchFreq === 'none' ? '取1次' : p ? `${p.num}${FF_SHORT[p.unit]}取1次` : '取1次'
  const tail = n.maxRuns ? `≤${n.maxRuns}批` : '不限批'
  return `${when}·${ff}·${tail}`
}

/** 系统节点判定：节点对象上 kind === 'system' */
export const isSystemNode = (n) => n?.kind === 'system'

export const roleLabelOf = (key) => (handoverRoles.find(r => r.key === key) || {}).label || key

/** 角色 → 默认解析到的人（原型固定，正式开发走组织架构） */
export const roleOwners = {
  'store-manager': '马晓东',
  supervisor: '朱艳秋',
  finance: '周芸',
  it: '邢斌',
  hr: '邓黎英',
  'region-head': '杨春燕',
  gm: '贺志明'
}

/** 节点实际负责人：优先「指定到人覆盖」，否则按角色解析 */
export function ownerOf(node, overrideMap = {}) {
  return overrideMap[node.id] || roleOwners[node.role] || roleLabelOf(node.role)
}

/* 审核人候选池（按角色，原型演示数据；真实实现走组织架构选人） */
export const admissionStaff = {
  '部门上级': ['（按组织关系解析）'],
  '人事专员': ['郑晓兰', '唐启明'],
  '人事经理': ['邓黎英', '王慧', '刘倩', '周敏', '李文静'],
  '城市总': ['冯海霞', '罗嘉铭'],
  '总经理': ['吕中行']
}

/* ---------------- 离职流程模板（配置层 · 平铺节点 + 前置） ----------------
   一个模板 = 一张节点清单 tpl.nodes[]，没有阶段、没有分组。
   每个节点的 deps 是**前置节点 id 数组**：空 = 发起即可开始办理；非空 = 前置全部办结后才能开始办理。
   scope 适配条件：jobs 必选；cities / stores / employTypes 可选、多重约束。
   admission 离职需求审核（模板内一条审核链）：**一条链**（levels：1~n 级，每级 = 角色 + 人员多选 names +
   mode（any=任一人通过即可 / all=全部通过，仅 names≥2 时有意义），names 留空 = 按组织关系自动解析）。
   确认人跟模板走——**一个管理维度（岗位+城市/门店组合）配一条流程**：同一岗位不同城市要不同的
   确认链（如成都推拿师要先人事再城市总），就另配一条更具体的模板，靠「越具体越优先」命中。
   匹配规则：越具体越优先（岗位+门店+用工 > 岗位+城市 > 仅岗位）；
   未命中任何模板不拦截发起：人事确认后自动推送离职合同（不经交接），并提醒人事补配模板。 */
export const resignFlowTemplates = [
  {
    id: 'rft-01',
    name: '普通员工通用离职',
    status: 'active',
    version: 5,
    updatedBy: 'Lacus7',
    updatedAt: '2026-10-23 17:20',
    scope: { jobs: ['调理师', '客户经理', '前台'], cities: [], stores: [], employTypes: ['全职', '兼职'] },
    /* 离职需求审核：通用模板 1 级人事经理，具体人员按员工所在城市自动解析 */
    admission: {
      levels: [{ role: '人事经理', names: [], mode: 'any' }]
    },
    nodes: [
      /* 四个无前置节点：发起后同时开始办理，谁也不等谁 */
      {
        id: 'n1', kind: 'manual', name: '客户与物品交接', role: 'store-manager', gate: 'must', override: null, deps: [],
        tasks: [
          { id: 't1', name: '客户资料移交', require: '在跟客户逐个登记接收人', proof: 'optional', proofMax: 3 },
          { id: 't2', name: '门店物品归还', require: '工服 / 工具 / 钥匙逐项核对', proof: 'must', proofMax: 3, formats: 'PDF / JPG / PNG' }
        ]
      },
      {
        id: 'n2', kind: 'manual', name: '工作交接', role: 'supervisor', gate: 'must', override: null, deps: [],
        tasks: [
          { id: 't1', name: '工作事项交接清单', require: '含在途事项与去向', proof: 'must', proofMax: 3, formats: 'PDF / JPG / PNG' },
          { id: 't2', name: '未完结客户标注', require: '标注服务进度与接手人', proof: 'optional', proofMax: 3 }
        ]
      },
      {
        id: 'n3', kind: 'manual', name: '欠款与借款结清', role: 'finance', gate: 'must', override: null, deps: [],
        tasks: [
          { id: 't1', name: '借款 / 欠款核对', require: '有欠款须附结清凭证或还款计划', proof: 'must', proofMax: 3, formats: 'PDF / JPG / PNG' }
        ]
      },
      {
        id: 'sys-debt', kind: 'system', sysKey: 'debt', name: '负债检查', gate: 'must', deps: [], fetchFreq: '1d',
        maxRuns: 5, tasks: []
      },
      /* 前置：物品交接办结后，流程才开始去取资产检查结果（每天取一次；上限 5 个未通过批次，到顶仍不满足 → 终止） */
      {
        id: 'sys-asset', kind: 'system', sysKey: 'asset', name: '资产归还检查', gate: 'must', deps: ['n1'], fetchFreq: '1d',
        maxRuns: 5, tasks: []
      },
      /* 两个前置：工作交接 + 资产销账都完成，才收账号（汇合示例） */
      {
        id: 'n4', kind: 'manual', name: '账号与权限回收', role: 'it', gate: 'optional', override: null, deps: ['n2', 'sys-asset'],
        tasks: [
          { id: 't1', name: '系统账号停用', require: '营业 / 排班 / 客资系统', proof: 'optional', proofMax: 3 },
          { id: 't2', name: '门禁与设备回收', require: '工牌、电脑、对讲机', proof: 'optional', proofMax: 3 }
        ]
      },
      /* 软性 + 批次上限：前置（物品交接）办结后开始取数，每 2 小时取一次；上限 5 个未通过批次，到顶仍无「通过」按「未取得结论」放行留痕 */
      {
        id: 'sys-complaint', kind: 'system', sysKey: 'complaint', name: '客诉纠纷检查', gate: 'optional', deps: ['n1'], fetchFreq: '2h',
        maxRuns: 5, tasks: []
      },
      /* 收口节点：等前面五件事都有结果 */
      {
        id: 'n5', kind: 'manual', name: '离职面谈确认', role: 'hr', gate: 'must', override: null,
        deps: ['n3', 'n4', 'sys-complaint', 'sys-debt'],
        tasks: [
          { id: 't1', name: '离职面谈记录', require: '面谈结论与员工反馈', proof: 'optional', proofMax: 3 },
          { id: 't2', name: '无未结事项确认', require: '对照前置节点结论逐项确认', proof: 'must', proofMax: 1, formats: 'PDF / JPG / PNG' }
        ]
      },
      {
        id: 'sys-attendance', kind: 'system', sysKey: 'attendance', name: '考勤异常检查', gate: 'must', deps: ['n5'], fetchFreq: '12h',
        maxRuns: 5, tasks: []
      }
    ]
  },
  {
    id: 'rft-02',
    name: '城市总离职流程',
    status: 'active',
    version: 3,
    updatedBy: 'Lacus7',
    updatedAt: '2026-10-23 17:20',
    scope: { jobs: ['城市总'], cities: [], stores: [], employTypes: ['全职'] },
    /* 离职需求审核：管理岗 1 级人事经理 */
    admission: {
      levels: [{ role: '人事经理', names: ['李文静'], mode: 'any' }]
    },
    nodes: [
      {
        id: 'm1', kind: 'manual', name: '团队与门店交接', role: 'region-head', gate: 'must', override: null, deps: [],
        tasks: [
          { id: 't1', name: '所辖门店交接清单', require: '店长对接人逐店标注', proof: 'must', proofMax: 3, formats: 'PDF / JPG / PNG' }
        ]
      },
      {
        id: 'm2', kind: 'manual', name: '门店账务与备用金', role: 'finance', gate: 'must', override: null, deps: [],
        tasks: [
          { id: 't1', name: '备用金盘点', require: '与出纳双人盘点签字', proof: 'must', proofMax: 3, formats: 'PDF / JPG / PNG' },
          { id: 't2', name: '在途账务核销', require: '未核销单据逐笔说明', proof: 'optional', proofMax: 3 }
        ]
      },
      {
        id: 'sys-complaint2', kind: 'system', sysKey: 'complaint', name: '客诉纠纷检查', gate: 'optional', deps: [], fetchFreq: 'none',
        maxRuns: 5, tasks: []
      },
      {
        id: 'sys-asset', kind: 'system', sysKey: 'asset', name: '资产归还检查', gate: 'must', deps: ['m1'], fetchFreq: '1d',
        maxRuns: 5, tasks: []
      },
      /* 账务核对 + 资产销账都完成，才收管理端权限（不同负责人，靠 deps 表达先后） */
      {
        id: 'm4', kind: 'manual', name: '系统权限回收', role: 'it', gate: 'must', override: null, deps: ['m2', 'sys-asset'],
        tasks: [
          { id: 't1', name: '管理端权限停用', require: '账务核对与资产销账完成后执行', proof: 'optional', proofMax: 3 }
        ]
      },
      {
        id: 'm3', kind: 'manual', name: '团队档案与人事事项', role: 'hr', gate: 'must', override: null, deps: ['m1'],
        tasks: [
          { id: 't1', name: '团队档案移交', require: '在职档案、异动在途事项', proof: 'must', proofMax: 3, formats: 'PDF / JPG / PNG' }
        ]
      },
      {
        id: 'm5', kind: 'manual', name: '总经理面谈确认', role: 'gm', gate: 'must', override: null,
        deps: ['m3', 'm4', 'sys-complaint2'],
        tasks: [
          { id: 't1', name: '面谈纪要', require: '交接整体结论', proof: 'must', proofMax: 1, formats: 'PDF / JPG / PNG' }
        ]
      }
    ]
  },
  {
    id: 'rft-03',
    name: '总部岗位离职',
    status: 'disabled',
    version: 4,
    updatedBy: 'Lacus7',
    updatedAt: '2026-10-23 17:20',
    scope: { jobs: ['IT 工程师', '人事专员', '财务专员'], cities: [], stores: [], employTypes: ['全职'] },
    /* 离职需求审核：总部岗位两级，第一级按组织关系自动解析 */
    admission: {
      levels: [
        { role: '部门上级', names: [], mode: 'any' },
        { role: '人事经理', names: ['李文静'], mode: 'any' }
      ]
    },
    nodes: [
      {
        id: 'h1', kind: 'manual', name: '部门工作交接', role: 'supervisor', gate: 'must', override: null, deps: [],
        tasks: [{ id: 't1', name: '工作交接清单', require: '含系统 / 文档权限清单', proof: 'must', proofMax: 3, formats: 'PDF / JPG / PNG' }]
      },
      {
        id: 'h2', kind: 'manual', name: '账号权限与设备', role: 'it', gate: 'must', override: null, deps: ['h1'],
        tasks: [{ id: 't1', name: '账号停用与设备归还', require: '设备须附归还照片', proof: 'must', proofMax: 3, formats: 'JPG / PNG' }]
      },
      {
        id: 'h3', kind: 'manual', name: '离职面谈', role: 'hr', gate: 'must', override: null, deps: ['h1', 'h2'],
        tasks: [{ id: 't1', name: '面谈记录', require: '', proof: 'optional', proofMax: 3 }]
      }
    ]
  },
  {
    /* 同岗位不同城市的示例：调理师通用模板之外，成都单独配一条更具体的流程，
       离职需求审核也升级为两级（先人事经理、再城市总），命中时越具体越优先。 */
    id: 'rft-05',
    name: '调理师 · 成都离职流程',
    status: 'active',
    version: 1,
    updatedBy: 'Lacus7',
    updatedAt: '2026-10-24 00:40',
    scope: { jobs: ['调理师'], cities: ['成都'], stores: [], employTypes: [] },
    /* 离职需求审核：先人事经理、再城市总，两级都办结后才进入交接 */
    admission: {
      levels: [
        { role: '人事经理', names: ['刘倩', '周敏'], mode: 'any' },
        { role: '城市总', names: ['冯海霞'], mode: 'any' }
      ]
    },
    nodes: [
      {
        id: 'c1', kind: 'manual', name: '客户与物品交接', role: 'store-manager', gate: 'must', override: null, deps: [],
        tasks: [
          { id: 't1', name: '客户资料移交', require: '在跟客户逐个登记接收人', proof: 'optional', proofMax: 3 },
          { id: 't2', name: '门店物品归还', require: '工服 / 工具 / 钥匙逐项核对', proof: 'must', proofMax: 3, formats: 'PDF / JPG / PNG' }
        ]
      },
      {
        id: 'c2', kind: 'manual', name: '工作交接', role: 'supervisor', gate: 'must', override: null, deps: [],
        tasks: [{ id: 't1', name: '工作事项交接清单', require: '含在途事项与去向', proof: 'must', proofMax: 3, formats: 'PDF / JPG / PNG' }]
      },
      {
        id: 'c3', kind: 'manual', name: '离职面谈确认', role: 'hr', gate: 'must', override: null, deps: ['c1', 'c2'],
        tasks: [{ id: 't1', name: '面谈记录', require: '', proof: 'optional', proofMax: 3 }]
      }
    ]
  }
]

export function templateOf(id) {
  return resignFlowTemplates.find(t => t.id === id)
}

/** 新建空白交接流程：列表「新建流程」→ 时间线编排页从 0 开始搭节点 */
export function createTemplate() {
  const t = {
    id: 'rft-' + Math.random().toString(36).slice(2, 6),
    name: '未命名交接流程',
    status: 'active',
    version: 1,
    updatedBy: 'Lacus7',
    updatedAt: '2026-10-23 20:00',
    scope: { jobs: [], cities: [], stores: [], employTypes: [] },
    admission: { levels: [{ role: '人事经理', names: [], mode: 'any' }] },
    nodes: []
  }
  resignFlowTemplates.unshift(t)
  return t
}

/* ---------------- 节点清单的读法：索引 / 前置 / 层级 / 环 ---------------- */

/** 模板全部节点（平铺，配置顺序）——保留旧名字，页面大量引用 */
export function flattenNodes(tpl) {
  return tpl?.nodes || []
}

/** 按 id 取节点 */
export function nodeOf(tpl, nodeId) {
  return (tpl?.nodes || []).find(n => n.id === nodeId) || null
}

/** 前置节点对象数组（按 deps 顺序；找不到的 id 忽略） */
export function depsOf(tpl, node) {
  if (!node) return []
  return (node.deps || []).map(id => nodeOf(tpl, id)).filter(Boolean)
}

/** 有多少节点在等它（删除前的提示用） */
export function dependentsOf(tpl, nodeId) {
  return (tpl?.nodes || []).filter(n => (n.deps || []).includes(nodeId))
}

/** 节点层级：0 = 没有前置（发起即可办理）；用于列表缩进与结构预览，**不是配置概念** */
export function levelOfNode(tpl, nodeId, seen = new Set()) {
  if (seen.has(nodeId)) return 0
  const n = nodeOf(tpl, nodeId)
  if (!n || !n.deps?.length) return 0
  seen.add(nodeId)
  return 1 + Math.max(...n.deps.map(d => levelOfNode(tpl, d, new Set(seen))))
}

/** 展示顺序：按层级再按配置顺序（拓扑顺序，父总在子之前）；与办理时序逻辑无关 */
export function orderedNodes(tpl) {
  const list = tpl?.nodes || []
  return list
    .map((n, i) => ({ n, i, lv: levelOfNode(tpl, n.id) }))
    .sort((a, b) => a.lv - b.lv || a.i - b.i)
    .map(x => x.n)
}

/** 按层级分组的行（结构预览用）：[{ level, nodes }] */
export function levelGroupsOf(tpl) {
  const map = new Map()
  for (const n of orderedNodes(tpl)) {
    const lv = levelOfNode(tpl, n.id)
    if (!map.has(lv)) map.set(lv, [])
    map.get(lv).push(n)
  }
  return [...map.entries()].map(([level, nodes]) => ({ level, nodes })).sort((a, b) => a.level - b.level)
}

/** 开始时机文案：'发起后即可开始办理' / '等「A」「B」全部办结后才能开始办理' */
export function dispatchTextOf(tpl, node) {
  const ds = depsOf(tpl, node)
  if (!ds.length) return '发起后即可开始办理'
  return '等' + ds.map(d => `「${d.name}」`).join('') + '全部办结后才能开始办理'
}

/** 成环的节点 id（空数组 = 结构合法）。保存前拦一道，页面实时提示 */
export function cycleNodeIds(tpl) {
  const nodes = tpl?.nodes || []
  const color = {}           // 0 未访问 1 在栈上 2 完成
  const bad = new Set()
  const stack = []
  const walk = (id) => {
    const st = color[id] || 0
    if (st === 2) return
    if (st === 1) {
      const at = stack.indexOf(id)
      stack.slice(at >= 0 ? at : 0).forEach(x => bad.add(x))
      return
    }
    color[id] = 1
    stack.push(id)
    const n = nodeOf(tpl, id)
    for (const d of n?.deps || []) if (nodeOf(tpl, d)) walk(d)
    stack.pop()
    color[id] = 2
  }
  for (const n of nodes) walk(n.id)
  return [...bad]
}

/* ---------------- 终态判定 ---------------- */

/** 终态：done / rejected / skipped / closed 都算「已办结」 */
export const SETTLED_STATES = ['done', 'rejected', 'skipped', 'closed']
export const isSettled = (s) => SETTLED_STATES.includes(s)

/* ---------------- 实例层：某笔离职单的交接清单 ----------------
   发起时按岗位匹配模板并**快照版本**；节点实例状态存 state：
     pending  未开始（还有前置节点没办结）
     running  当前可办（前置已全部办结，等负责人处理）
     checking 检查中（仅系统节点，流程已开始在取数、还没落结论）
     done / rejected / skipped   三种人工终态
     closed   因全流程终止而关闭（不可再确认）
   系统节点实例另存两组计数（两层频率分离后的关键）：
     polls       取数次数（流程去看了几眼）
     failBatches 消费到的**不同未通过批次**数（次数上限按这个计）
     两者不等 = 白等：取了多次但 Agent 没出新批次。
   主动作只有负责人能做；人事可催办、可跳过 optional、被动离职可强制解除。 */
export const handoverInstances = {
  /* 交接进行中：n1 已完成、它的后续（资产检查）在跑；n2 / n3 可办；n4 等 n2 + 资产检查 */
  rs01: {
    id: 'ho-rs01', caseId: 'rs01', templateId: 'rft-01', templateVersion: 5,
    status: 'running', startedAt: '2026-10-15 09:20',
    nodes: {
      n1: { state: 'done', by: '马晓东', at: '2026-10-15 16:02', records: { t1: { ok: true, note: '3 名在跟客户移交张清闲', files: 2 }, t2: { ok: true, note: '工具两套、钥匙一把已归还', files: 2 } } },
      'sys-asset': {
        state: 'checking', by: '系统', at: null, runs: 2, polls: 3, failBatches: 2,
        firstAt: '2026-10-16 09:00', lastAt: '2026-10-17 09:00', nextAt: '2026-10-18 09:00',
        result: '资产台账核销中：工服 1 件待销账（已取 3 次，命中 2 个未通过批次）',
        detail: [
          { at: '2026-10-16 09:00', batch: 'B-20261016-01', metrics: '应归还资产未销账 2 件（工服 2）', result: '未通过' },
          { at: '2026-10-16 21:00', batch: 'B-20261016-01', metrics: '应归还资产未销账 2 件（工服 2）', result: '未通过', repeat: true },
          { at: '2026-10-17 09:00', batch: 'B-20261017-01', metrics: '应归还资产未销账 1 件（工服 1）', result: '未通过' }
        ],
        records: {}
      },
      n2: { state: 'running', by: null, at: null, records: {} },
      n3: { state: 'running', by: null, at: null, records: {} },
      n4: { state: 'pending', by: null, at: null, records: {} },
      n5: { state: 'pending', by: null, at: null, records: {} },
      'sys-debt': { state: 'done', by: '系统', at: '2026-10-15 09:20', result: '无未结清负债', records: {} },
      'sys-complaint': {
        state: 'checking', by: '系统', at: null, runs: 3, polls: 3, failBatches: 3,
        firstAt: '2026-10-16 09:00', lastAt: '2026-10-17 15:00', nextAt: '2026-10-17 17:00',
        result: '近 30 天工单 2 件处理中，继续跟踪（已取 3 次，命中 3 个未通过批次）',
        detail: [
          { at: '2026-10-17 11:00', batch: 'B-20261017-01', metrics: '近 30 天待处理工单 3 件', result: '未通过' },
          { at: '2026-10-17 13:00', batch: 'B-20261017-02', metrics: '近 30 天待处理工单 2 件', result: '未通过' },
          { at: '2026-10-17 15:00', batch: 'B-20261017-03', metrics: '近 30 天待处理工单 2 件', result: '未通过' }
        ],
        records: {}
      },
      'sys-attendance': { state: 'pending', by: null, at: null, records: {} }
    }
  },
  /* 交接全部完成 → 放行审批（走查 ResignDetail 的主样例） */
  rs02: {
    id: 'ho-rs02', caseId: 'rs02', templateId: 'rft-01', templateVersion: 5,
    status: 'done', startedAt: '2026-09-20 10:05', finishedAt: '2026-09-22 18:40',
    nodes: {
      n1: { state: 'done', by: '徐海峰', at: '2026-09-20 15:11', records: { t1: { ok: true, note: '', files: 1 }, t2: { ok: true, note: '', files: 1 } } },
      'sys-asset': { state: 'done', by: '系统', at: '2026-09-21 09:00', result: '工服、工具、设备已全部销账', records: {} },
      n2: { state: 'done', by: '朱艳秋', at: '2026-09-21 11:26', records: { t1: { ok: true, note: '', files: 2 }, t2: { ok: true, note: '', files: 0 } } },
      n3: { state: 'done', by: '周芸', at: '2026-09-21 16:48', records: { t1: { ok: true, note: '无欠款', files: 1 } } },
      n4: { state: 'skipped', by: '邓黎英', at: '2026-09-22 09:30', skipReason: '员工未使用客资系统，无账号需回收', records: {} },
      n5: { state: 'done', by: '邓黎英', at: '2026-09-22 18:40', records: { t1: { ok: true, note: '', files: 0 }, t2: { ok: true, note: '', files: 1 } } },
      'sys-debt': { state: 'done', by: '系统', at: '2026-09-20 10:05', result: '无未结清负债', records: {} },
      'sys-complaint': {
        state: 'done', by: '系统', at: '2026-09-21 17:00',
        result: '第 2 次检查通过：待处理工单归零',
        detail: [
          { at: '2026-09-21 09:00', batch: 'B-20260921-01', metrics: '近 30 天待处理工单 2 件', result: '未通过' },
          { at: '2026-09-21 17:00', batch: 'B-20260921-02', metrics: '近 30 天待处理工单 0 件', result: '通过' }
        ],
        records: {}
      },
      'sys-attendance': { state: 'done', by: '系统', at: '2026-09-22 20:00', result: '无未处理考勤异常', records: {} }
    }
  },
  /* 已办结的历史单：交接早已完成 */
  rs03: { id: 'ho-rs03', caseId: 'rs03', templateId: 'rft-01', templateVersion: 3, status: 'done', startedAt: '2026-10-15 17:00', finishedAt: '2026-10-15 17:00', nodes: null },
  rs04: { id: 'ho-rs04', caseId: 'rs04', templateId: 'rft-01', templateVersion: 3, status: 'done', startedAt: '2026-10-14 11:30', finishedAt: '2026-10-14 11:30', nodes: null },
  rs05: { id: 'ho-rs05', caseId: 'rs05', templateId: 'rft-01', templateVersion: 3, status: 'done', startedAt: '2026-10-14 19:00', finishedAt: '2026-10-14 19:00', nodes: null },
  /* 总部岗位：另一套模板，进行中（h1 已完成，等它的 h2 办结才能办理；h3 还要等 h2） */
  rs06: {
    id: 'ho-rs06', caseId: 'rs06', templateId: 'rft-03', templateVersion: 4,
    status: 'running', startedAt: '2026-10-17 10:20',
    nodes: {
      h1: { state: 'done', by: '邢斌', at: '2026-10-17 16:30', records: { t1: { ok: true, note: '', files: 1 } } },
      h2: { state: 'running', by: null, at: null, records: {} },
      h3: { state: 'pending', by: null, at: null, records: {} }
    }
  },
  /* 异常监控（被动离职）：走同一套模板，但人事可强制解除 */
  rs11: {
    id: 'ho-rs11', caseId: 'rs11', templateId: 'rft-01', templateVersion: 5,
    status: 'running', startedAt: '2026-10-11 09:00', passive: true,
    nodes: {
      n1: { state: 'running', by: null, at: null, records: {} },
      n2: { state: 'pending', by: null, at: null, records: {} },
      n3: { state: 'pending', by: null, at: null, records: {} },
      n4: { state: 'pending', by: null, at: null, records: {} },
      n5: { state: 'pending', by: null, at: null, records: {} },
      'sys-debt': { state: 'done', by: '系统', at: '2026-10-11 09:00', result: '无未结清负债', records: {} },
      'sys-complaint': { state: 'pending', by: null, at: null, records: {} },
      'sys-asset': { state: 'pending', by: null, at: null, records: {} },
      'sys-attendance': { state: 'pending', by: null, at: null, records: {} }
    }
  },
  rs12: {
    id: 'ho-rs12', caseId: 'rs12', templateId: 'rft-01', templateVersion: 5,
    status: 'running', startedAt: '2026-10-12 09:00', passive: true,
    nodes: {
      n1: { state: 'done', by: '李文秀', at: '2026-10-12 15:44', records: { t1: { ok: true, note: '', files: 1 }, t2: { ok: true, note: '', files: 1 } } },
      /* 前置（物品交接）办结后才开始查；必过 + 次数上限 5（节奏归检查 Agent）：
         到上限仍无「通过」→ 终止全部流程（避免假卡死）；本单第 4 次未通过判定 */
      'sys-asset': {
        state: 'checking', by: '系统', at: null, runs: 4, polls: 5, failBatches: 4,
        firstAt: '2026-10-13 09:00', lastAt: '2026-10-16 09:00', nextAt: '2026-10-17 09:00',
        result: '资产台账未回写：手持终端 1 台状态异常（已取 5 次，命中 4 个未通过批次）',
        detail: [
          { at: '2026-10-13 09:00', batch: 'B-20261013-01', metrics: '手持终端 1 台状态异常（台账未回写）', result: '未通过' },
          { at: '2026-10-13 21:00', batch: 'B-20261013-01', metrics: '手持终端 1 台状态异常（台账未回写）', result: '未通过', repeat: true },
          { at: '2026-10-14 09:00', batch: 'B-20261014-01', metrics: '手持终端 1 台状态异常（台账未回写）', result: '未通过' },
          { at: '2026-10-15 09:00', batch: 'B-20261015-02', metrics: '手持终端 1 台状态异常（台账未回写）', result: '未通过' },
          { at: '2026-10-16 09:00', batch: 'B-20261016-01', metrics: '手持终端 1 台状态异常（台账未回写）', result: '未通过' }
        ],
        records: {}
      },
      n2: { state: 'running', by: null, at: null, records: {} },
      n3: { state: 'running', by: null, at: null, records: {} },
      n4: { state: 'pending', by: null, at: null, records: {} },
      n5: { state: 'pending', by: null, at: null, records: {} },
      'sys-debt': { state: 'done', by: '系统', at: '2026-10-12 09:00', result: '无未结清负债', records: {} },
      'sys-complaint': { state: 'pending', by: null, at: null, records: {} },
      'sys-attendance': { state: 'pending', by: null, at: null, records: {} }
    }
  },
  /* 终止样例：财务（必过）判不通过 → 实时终止全部流程，在途一并关闭 */
  rs13: {
    id: 'ho-rs13', caseId: 'rs13', templateId: 'rft-01', templateVersion: 5,
    status: 'terminated', startedAt: '2026-10-18 09:40', terminatedAt: '2026-10-21 11:05',
    terminateReason: '必过节点「欠款与借款结清」不通过：备用金 ¥1,200 未结清，员工无法当场归还',
    nodes: {
      n1: { state: 'done', by: '冯凯', at: '2026-10-18 14:22', records: { t1: { ok: true, note: '', files: 1 }, t2: { ok: true, note: '', files: 2 } } },
      'sys-asset': { state: 'done', by: '系统', at: '2026-10-19 09:00', result: '工服、工具已全部销账', records: {} },
      n2: { state: 'done', by: '潘小娅', at: '2026-10-19 10:15', records: { t1: { ok: true, note: '', files: 2 }, t2: { ok: true, note: '', files: 0 } } },
      n3: { state: 'rejected', by: '周芸', at: '2026-10-21 11:05', rejectReason: '备用金 ¥1,200 未结清，员工无法当场归还', records: { t1: { ok: false, note: '待还款计划另行协商', files: 1 } } },
      n4: { state: 'closed', by: null, at: null, records: {} },
      n5: { state: 'closed', by: null, at: null, records: {} },
      'sys-debt': { state: 'done', by: '系统', at: '2026-10-18 09:40', result: '无未结清负债', records: {} },
      'sys-complaint': { state: 'closed', by: null, at: null, records: {} },
      'sys-attendance': { state: 'closed', by: null, at: null, records: {} }
    }
  }
}

export function handoverOf(caseId) {
  return handoverInstances[caseId] || null
}

/* ---------------- 状态机：全部从函数读，页面不自行判断 ---------------- */

const stateMeta = {
  pending: { label: '未开始', tone: 'muted' },
  running: { label: '当前可办', tone: 'warn' },
  checking: { label: '检查中', tone: 'warn' },
  done: { label: '已完成', tone: 'ok' },
  rejected: { label: '不通过', tone: 'bad' },
  skipped: { label: '已跳过', tone: 'muted' },
  closed: { label: '因终止关闭', tone: 'muted' }
}
export const stateLabelOf = (s) => (stateMeta[s] || {}).label || s
export const stateToneOf = (s) => (stateMeta[s] || {}).tone || 'muted'

/**
 * 派生节点实时状态（纯节点模型）：
 *   实例里存的是「事实」（done/rejected/skipped + 终止时的 closed），
 *   pending / running / checking 由**前置节点**实时推导：
 *   前置全部到终态 → 可开始办理（人工 = running、系统 = checking）；否则 pending。
 *   没有阶段，也就没有「前序阶段没到」这种第二种 pending。
 */
export function nodeStateOf(inst, nodeId) {
  if (!inst) return 'pending'
  const saved = inst.nodes?.[nodeId]?.state || 'pending'
  if (saved !== 'pending') return saved
  if (inst.status === 'terminated') return 'closed'
  const tpl = templateOf(inst.templateId)
  const node = nodeOf(tpl, nodeId)
  if (!tpl || !node) return 'pending'
  const deps = node.deps || []
  if (deps.some(d => !isSettled(nodeStateOf(inst, d)))) return 'pending'
  return isSystemNode(node) ? 'checking' : 'running'
}

/** 还卡着本节点的前置（用于「等谁」的文案） */
export function blockingDepsOf(inst, node) {
  const tpl = inst ? templateOf(inst.templateId) : null
  if (!tpl || !node) return []
  return depsOf(tpl, node).filter(d => !isSettled(nodeStateOf(inst, d.id)))
}

/** 兼容旧调用：无前置时返回 null；有前置没办完结返回 'prev' */
export function pendingReasonOf(inst, node) {
  if (!inst || !node) return null
  if (nodeStateOf(inst, node.id) !== 'pending') return null
  return blockingDepsOf(inst, node).length ? 'prev' : null
}

/** 当前可办 / 正在查的节点（前置已满足、还没出结论） */
export function frontierOf(inst) {
  const tpl = inst ? templateOf(inst.templateId) : null
  if (!tpl || inst.status === 'terminated') return []
  return orderedNodes(tpl).filter(n => ['running', 'checking'].includes(nodeStateOf(inst, n.id)))
}

/** 进度：done / skipped 计入已办结。
 *  参数兼容两种形态：传 caseId（字符串）或实例对象都行，返回 { done, total, text }。 */
export function progressOf(arg) {
  const inst = typeof arg === 'string' ? handoverOf(arg) : arg
  const tpl = inst ? templateOf(inst.templateId) : null
  if (!tpl) return { done: 0, total: 0, text: '—' }
  const all = flattenNodes(tpl)
  const done = all.filter(n => ['done', 'skipped'].includes(nodeStateOf(inst, n.id))).length
  return { done, total: all.length, text: `${done}/${all.length} 节点办结` }
}

/** 系统检查运行摘要（进度页用）。派生态优先于实例保存态：
 *  前置刚满足、运行记录还没落库时也按「已开始」展示，不误报「等待前置」。
 *  两层频率的可见口径：**已取 N 次**（流程看了几眼）/ **命中 M 个未通过批次**（上限按这个计）。
 *  两者不等即「白等」——取多次但 Agent 没出新批次。 */
export function sysRunTextOf(inst, node) {
  const s = inst?.nodes?.[node?.id]
  const derived = nodeStateOf(inst, node?.id)
  const hasPrev = (node?.deps || []).length > 0
  if (derived === 'pending' || derived === 'closed') {
    return hasPrev ? '等待前置节点办结' : '等待开始取数'
  }
  if (derived === 'checking' && (!s || s.state === 'pending' || !s.polls)) {
    return '前置已办结，正在首次取数'
  }
  if (derived === 'checking') {
    const polls = s.polls || s.runs || 0
    const batches = s.failBatches ?? s.runs ?? 0
    const cap = node.maxRuns ? `${batches}/${node.maxRuns} 个未通过批次` : `${batches} 个未通过批次`
    const parts = [`已取 ${polls} 次 · ${cap}`]
    if (polls > batches) parts.push(`（${polls - batches} 次取到同一批次）`)
    if (s.nextAt) parts.push('下次 ' + s.nextAt)
    if (s.result) parts.push(s.result)
    return parts.join(' · ')
  }
  /* 已落结论：显示结论与结论时间 */
  return [s?.result, s?.at].filter(Boolean).join(' · ') || '已有结论'
}

/** 必过项长期无结论：命中 5 个未通过批次仍未落结果 → 提示人工介入（不自动终止） */
export const SYS_STUCK_RUNS = 5
export function isSysStuck(inst, node) {
  const s = inst?.nodes?.[node?.id]
  const batches = s?.failBatches ?? s?.runs ?? 0
  return !!s && s.state === 'checking' && node.gate === 'must' && batches >= SYS_STUCK_RUNS
}

/** 全流程是否已终止：任一 must 节点 rejected（实时；系统检查节点同样适用） */
export function isTerminated(inst) {
  if (!inst) return false
  if (inst.status === 'terminated') return true
  const tpl = templateOf(inst.templateId)
  if (!tpl) return false
  return flattenNodes(tpl).some(n => n.gate === 'must' && nodeStateOf(inst, n.id) === 'rejected')
}

/** 审批是否放行：所有节点都到终态，且没有被终止 */
export function canApprove(caseId) {
  const inst = handoverOf(caseId)
  if (!inst || isTerminated(inst)) return false
  const tpl = templateOf(inst.templateId)
  if (!tpl) return true
  return flattenNodes(tpl).every(n => isSettled(nodeStateOf(inst, n.id)))
}

/** 阻塞文案：给列表卡片用（卡在谁那） */
export function blockerTextOf(inst) {
  if (!inst) return ''
  if (isTerminated(inst)) return '交接未通过 · 已作废'
  if (canApprove(inst.caseId)) return '交接完成 · 待人事审批'
  const fr = frontierOf(inst).filter(n => !isSystemNode(n))
  if (!fr.length) return '交接进行中'
  const who = [...new Set(fr.map(n => ownerOf(n)))]
  return '交接中 · 待 ' + who.join('、') + ' 确认'
}

/** 负责人的待办（节点确认页入口）：某角色当前可办的节点 */
export function todoOfRole(roleKey) {
  const out = []
  for (const inst of Object.values(handoverInstances)) {
    if (isTerminated(inst)) continue
    const tpl = templateOf(inst.templateId)
    if (!tpl) continue
    for (const n of flattenNodes(tpl)) {
      if (n.role === roleKey && nodeStateOf(inst, n.id) === 'running') {
        out.push({ inst, node: n })
      }
    }
  }
  return out
}

/* ---------------- 兼容层：现有四页（Apply / Home / Detail / Release）引用的短接口 ----------------
   与上面的状态机函数同源，只是换个顺手的名字与参数形态。 */

export const gateLabels = { must: '必过', optional: '可选' }
export const roleLabel = roleLabelOf

/**
 * 模板匹配：{ job, store?, employType?, city? } → 模板 | null
 * 越具体越优先：门店 +2、城市 +1、用工 +1，同分取数组靠前（视为最近修改）。
 */
export function matchTemplate({ job, store, city, employType } = {}) {
  let best = null
  let bestScore = -1
  for (const t of resignFlowTemplates) {
    if (t.status !== 'active') continue
    if (!t.scope.jobs.includes(job)) continue
    if (t.scope.employTypes?.length && employType && !t.scope.employTypes.includes(employType)) continue
    let score = 1
    if (t.scope.stores?.length) {
      if (store && t.scope.stores.includes(store)) score += 2
      else continue
    }
    if (t.scope.cities?.length) {
      if (city && t.scope.cities.includes(city)) score += 1
      else continue
    }
    if (t.scope.employTypes?.length && employType && t.scope.employTypes.includes(employType)) score += 1
    if (score > bestScore) { best = t; bestScore = score }
  }
  return best
}

/** 交接门禁状态（给审批页 / 列表用）：passed | running | terminated | not-started */
export function gateStatusOf(caseId) {
  const inst = handoverOf(caseId)
  if (!inst) return 'not-started'
  if (isTerminated(inst)) return 'terminated'
  return canApprove(caseId) ? 'passed' : 'running'
}

/** 阻塞点：当前可办的**人工**节点 { owner, roleLabel, nodeName }（系统检查自动跑，不算阻塞），无阻塞返回 null */
export function blockerOf(caseId) {
  const inst = handoverOf(caseId)
  if (!inst || isTerminated(inst)) return null
  const fr = frontierOf(inst).filter(n => !isSystemNode(n))
  if (!fr.length) return null
  const n = fr[0]
  return { owner: ownerOf(n), roleLabel: roleLabelOf(n.role), nodeName: n.name }
}

/** 解除用工页的只读摘要：{ templateName, progress }，无实例返回 null */
export function handoverViewOf(caseId) {
  const inst = handoverOf(caseId)
  if (!inst) return null
  const tpl = templateOf(inst.templateId)
  return { templateName: tpl ? `${tpl.name}（v${inst.templateVersion}）` : '—', progress: progressOf(inst) }
}
