/**
 * 假勤重构 · 领域 mock 数据
 * 原则「mock 即文档」：所有数值自洽、可解释，不留测试文本
 *
 * ⚠️ 性质：预研探路稿，不是正式结论。以下前提是本次推演的内部假设，用于看形态、对齐口径，
 *    不作需求基线；推演收敛并经评审后再升格。
 *
 * 设计前提（完整说明见 docs/假勤系统重构-原型模块与文档目录.md）
 * 1. 底座：员工时间线（人事组）—— 以人为中心，按「事件是否排他」管理时间
 * 2. 三层事实：计划（排班）/ 实际（打卡）/ 豁免（假）；计划 ≠ 实际即异常
 * 3. 名额 ≠ 额度：名额 = 组织容量（周期生成、共享、会被抢）；额度 = 个人可休量（私有、只减不增）
 * 4. 交付形态：定义（只出契约，不建页面）/ 配置（我们建页，业务填值）/ 新建（完整设计）
 * 5. 可配置度阶梯：领域模型写死 → 算法只开参数 → 业务规则可配 → 展示随用户
 * 6. 产出边界（关键）：假勤最终只交付「休假时长」；带薪与否是**假种属性**（年假、婚假都带薪），
 *    不是岗位开关 —— 岗位级只声明班次假 / 临时假额度，扣款由模块化薪酬取走时长后自行配置
 */

/* ---------- 移动端请假：现状口径（2026-10-13 业务口述，重构待承接） ----------
 * 现状：推拿师有班次假 + 临时假；客户经理只有班次假，且没有管理「超出班次假如何审核」的逻辑
 * —— 这正是重构要增加长期类假（年假等）的背景。
 * ============================================================ */
export const mobileLeaveChannels = [
  {
    id: 'shift',
    name: '班次假',
    deductText: '扣除班次假固定额度',
    note: '每月固定 4 天（推拿师按 32 小时计）'
  },
  {
    id: 'temp',
    name: '临时假',
    deductText: '扣除临时假时长（上月业绩折算的余额）',
    note: '仅推拿师有：按产值 / 回头率 / 流失率超目标比例获得，上限 ≤ 16 小时 / 月'
  },
  {
    id: 'special',
    name: '特殊情况请假',
    deductText: '依次扣：班次假 → 临时假时长 → 扣完后记录超出时长',
    note: '兜底通道；超出时长的处理按岗位分流'
  }
]

export const excessLeaveHandling = [
  {
    jobs: ['推拿师'],
    text: '超出部分不扣薪资',
    note: '订单提成模式：少请假时间即少接单，收入自然下降，不额外扣款'
  },
  {
    jobs: ['客户经理'],
    text: '超出部分扣薪资',
    note: '现状已有扣款逻辑，但「超出班次假如何审核」无管理入口 —— 重构需补'
  }
]

/* ============================================================
   一、设计总览：七个模型假设（预研提出，非定论）
   ============================================================ */
export const reformModels = [
  {
    id: 'M1',
    name: '时间线占位与排他',
    brief: '以人为中心，事件按「是否排他」写在同一根时间轴上；排班与排假在同一段互斥',
    owner: '人事组（底座）'
  },
  {
    id: 'M2',
    name: '三层事实',
    brief: '计划（排班）/ 实际（打卡）/ 豁免（假）；计划 ≠ 实际即异常，由岗位决定启用几层',
    owner: '假勤 · 打卡组'
  },
  {
    id: 'M3',
    name: '名额 ≠ 额度',
    brief: '名额 = 组织容量（周期生成、共享、会被抢）；额度 = 个人可休量（私有、只减不增）',
    owner: '假勤'
  },
  {
    id: 'M4',
    name: '配置双通道',
    brief: '人工配置（假种标准值 / 固定休息额度 / 审核规则）＋ 系统计算（临时假 ← 上月业绩、名额 ← 业务周期）',
    owner: '假勤 · 现有模块'
  },
  {
    id: 'M5',
    name: '分层继承与局部覆盖',
    brief: '通用 → 城市 → 门店；按假种决定下沉深度；局部只能逐层收紧，不可放宽',
    owner: '假勤'
  },
  {
    id: 'M6',
    name: '薪酬结构决定后果',
    brief: '订单驱动岗 → 只记时长、无扣款；固定＋绩效岗 → 按缺勤扣固定部分',
    owner: '薪酬（假勤只出事实）'
  },
  {
    id: 'M7',
    name: '事实流与判定结论',
    brief: '事实（时长 / 假种 / 起止）→ 时间线、薪酬、排班；结论（长假判定）→ 员工福利',
    owner: '假勤'
  }
]

/* ============================================================
   二、设计总览：三种交付形态（决定我们建不建页面）
   ============================================================ */
export const deliveryForms = [
  {
    id: 'definition',
    name: '① 定义层',
    subtitle: '只出契约 · 不建页面',
    owner: '现有系统 / 别组',
    items: ['名额生成与消耗', '临时假小时折算', '打卡与出勤事实', '时间线占位与冲突'],
    note: '我们交付语义定义、字段契约、边界说明；实现归现有排班排假系统、现有额度模块、打卡组、人事组'
  },
  {
    id: 'config',
    name: '② 配置层',
    subtitle: '我们建页 · 业务填值',
    owner: '我们（值由业务填）',
    items: ['假种字典', '固定休息额度', '审核规则与覆盖', '后果策略', '假勤模式'],
    note: '页面只是「壳」，真正的内容由业务在页面里配置；配得越深，解释成本越高'
  },
  {
    id: 'new',
    name: '③ 新建层',
    subtitle: '完整流程由我们设计',
    owner: '我们（完整设计）',
    items: ['请假单据闭环', '额度账户', '审批工作台', '长假台账与社保结论'],
    note: '19 项模块中真正需要完整新建的约 8 项，其余是配置、定义、薄层或嵌入'
  }
]

/* 能力登记表：后续所有接口讨论的索引 */
export const capabilityRegistry = [
  {
    id: 'C1',
    name: '名额生成与消耗',
    owner: '现有排班排假系统',
    deliverable: '名额语义（组织容量 / 周期 / 共享）＋ 交互点 ＋ 对外字段',
    depends: '当前名额、已用、剩余',
    modifiable: 'pending',
    needConfirm: '能否返回「已用 / 剩余」而非仅「名额」'
  },
  {
    id: 'C2',
    name: '临时假小时折算',
    owner: '现有额度模块',
    deliverable: '输出契约（字段 / 冻结时点 / 口径）＋ 额度来源可解释结构',
    depends: '上月业绩指标、折算结果小时数',
    modifiable: 'pending',
    needConfirm: '输出字段与冻结时点'
  },
  {
    id: 'C3',
    name: '打卡记录',
    owner: '打卡组',
    deliverable: '所需字段与口径清单',
    depends: '上下班打卡原始时刻、有效性判定',
    modifiable: 'pending',
    needConfirm: '给原始时刻（我们自算迟到早退）还是仅给有效 / 无效'
  },
  {
    id: 'C4',
    name: '时间线占位与冲突',
    owner: '人事组',
    deliverable: '写入事件结构、读取冲突返回格式',
    depends: '某时段的排他占位、冲突返回',
    modifiable: 'pending',
    needConfirm: '粒度、排他判定方、冲突返回格式'
  },
  {
    id: 'C5',
    name: '日标准工资基数',
    owner: '薪酬',
    deliverable: '事实字段清单（缺勤天数 + 假种），不下发金额',
    depends: '只读',
    modifiable: 'readonly',
    needConfirm: '扣款公式归属（沿用 vs 重定义）'
  },
  {
    id: 'C6',
    name: '社保公积金个人部分处理',
    owner: '员工福利',
    deliverable: '长假结论字段（状态 / 起止 / 建议处理方式）',
    depends: '结论状态回传、欠款余额',
    modifiable: 'pending',
    needConfirm: '结论字段与状态回传方式'
  }
]

/* 待决事项 */
export const openIssues = [
  { id: '8.1', title: '时间线粒度', desc: '天 / 半天 / 时刻区间 —— 决定「通班 + 早半天假」能否表达', owner: '人事组' },
  { id: '8.2', title: '审批中间态是否上时间线', desc: '乐观占位（提交即占）vs 悲观占位（批准才占）', owner: '人事组 + 假勤' },
  { id: '8.3', title: '排他性判定方', desc: '时间线侧的事件类型字典 vs 我们写入时声明 exclusive', owner: '人事组' },
  { id: '8.4', title: '冲突解决权归属', desc: '只返回冲突 vs 可触发顶班 / 调班', owner: '人事组 + 排班' },
  { id: '8.5', title: '业绩折算公式归属', desc: '沿用现有模块 vs 本次重定义', owner: '业务 + 额度模块' },
  { id: '8.6', title: '业务周期粒度', desc: '周 / 月 / 自定义 —— 决定名额生成器设计', owner: '业务' },
  { id: '8.7', title: '配置改动是否追溯', desc: '当月生效 / 次月生效 / 人工指定生效期', owner: '业务 + 假勤' },
  { id: '8.8', title: '「固定假」判定粒度', desc: '挂在额度来源（配置型额度）vs 挂在假种字典', owner: '假勤' },
  { id: '8.9', title: '请长假阈值', desc: '多少天以上认定为长假并触发福利侧结论', owner: '业务 + 员工福利' },
  { id: '8.10', title: '覆盖方向是否单向收紧', desc: '建议锁定为只能收紧，防止规则矩阵碎片化', owner: '业务' },
  { id: '8.11', title: '各外部能力的可改性', desc: '可要求加字段 / 接口 vs 只能读其现有输出', owner: '待与各方确认' },
  { id: '8.12', title: '外部能力输出的冻结时机与快照口径', desc: '额度、名额的历史值如何冻结', owner: '额度模块 + 排班系统' },
  { id: '8.13', title: '可配参数的配置入口归属', desc: '哪些参数在对方系统里配，我们是否需在文档中指引', owner: '假勤 + 各方' }
]

/* ============================================================
   三、模块与优先级
   优先级依据：P0 是所有页面的数据源 → P1 影响金额与额度但不阻塞流程
             → P2 业务流程 → P3 依赖外部接口就绪
   ============================================================ */
export const modulePriorities = [
  {
    level: 'P0',
    name: '配置底座',
    desc: '所有页面的数据源，不定则后续必返工',
    // 注：「设计总览」属文档中心内容，不计入原型模块清单，故此处不列
    items: [
      { name: '岗位台账', form: '定义 ＋ 只读', route: 'leave-job-roster', built: true },
      { name: '工作日历', form: '配置', route: 'leave-work-calendar', built: true },
      { name: '假勤模式', form: '配置', route: 'leave-job-mode', built: true },
      { name: '假种字典', form: '配置', route: 'leave-type-dictionary', built: true },
      { name: '审核规则与覆盖', form: '配置', route: 'leave-approval-rules', built: true }
    ]
  },
  {
    level: 'P1',
    name: '配置补齐',
    desc: '影响金额与额度，但不阻塞流程页面',
    items: [
      { name: '额度规则', form: '配置 ＋ 定义', route: null },
      { name: '名额规则', form: '定义 ＋ 薄配置', route: null },
      { name: '后果策略', form: '配置 ＋ 定义', route: null },
      { name: '配置变更记录', form: '新建（薄）', route: null }
    ]
  },
  {
    level: 'P2',
    name: '业务流程',
    desc: '请假闭环，依赖 P0 / P1 配置能跑通',
    items: [
      { name: '请假申请', form: '新建', route: null },
      { name: '我的假期账户', form: '新建', route: null },
      { name: '请假审批工作台', form: '新建', route: null },
      { name: '我的时间线', form: '嵌入', route: null },
      { name: '考勤查询与申诉', form: '定义 ＋ 嵌入', route: null }
    ]
  },
  {
    level: 'P3',
    name: '跨域与移动端',
    desc: '依赖时间线 / 打卡组接口就绪，属最外层表现',
    items: [
      { name: '长假台账与社保处理', form: '新建', route: null },
      { name: '排班调整与支援调度', form: '定义 ＋ 协作', route: null },
      { name: '名额 / 容量工作台', form: '定义 ＋ 薄层', route: null },
      { name: '考勤异常处理', form: '定义 ＋ 嵌入', route: null },
      { name: '假期统计报表', form: '新建', route: null },
      { name: '移动端假勤', form: '新建', route: null }
    ]
  }
]

/* ============================================================
   四、假勤模式（配置第一分类轴）
   岗位不是枚举，而是可配置项；决定「勤」有几层、班次假 / 临时假额度多少

   注：薪酬结构（订单驱动 / 固定＋绩效）是**薪酬侧的属性**，假勤不再拥有它；
   「带薪与否」是**假种的属性**（年假、婚假都带薪），也不是岗位开关 ——
   岗位级只声明班次假 / 临时假额度，扣款规则由模块化薪酬自行配置。
   payStructures 仅作为「后果策略」的话题索引保留，假勤模式页不再展示。
   ============================================================ */
export const payStructures = [
  { value: 'order', label: '订单驱动', desc: '收入取决于是否接到订单，无固定薪酬；请假后只记时长、无扣款' },
  { value: 'fixed', label: '固定 + 绩效', desc: '有固定薪酬基数；请假后按缺勤扣减固定部分' }
]

export const quotaSources = [
  { value: 'fixed', label: '固定配置', desc: '由配置决定固定休息额度，如每月 4 天' },
  { value: 'performance', label: '业绩折算', desc: '由上月业绩指标折算（现有额度模块计算），有上限' },
  { value: 'none', label: '不适用', desc: '该岗位不走额度账户' }
]

export const seatSources = [
  { value: 'cycle', label: '业务周期生成', desc: '名额随业务周期动态生成（现有排班排假系统实现）' },
  { value: 'config', label: '固定配置', desc: '名额由配置固定给定' },
  { value: 'none', label: '不适用', desc: '该岗位不参与排班，无名额概念' }
]

export const substitutabilityLevels = [
  { value: 'high', label: '高 · 不传染', desc: '店内同岗人员充足，抽掉一人不影响他人排班' },
  { value: 'medium', label: '中 · 需微调', desc: '可能触发班次调整，但通常可在店内消化' },
  { value: 'low', label: '低 · 会连带', desc: '编制少或技能特殊，缺一人需改班或外调支援' }
]

/* ---------- 岗位主数据：来源在组织架构，假勤侧只读引用 ---------- */

/** 岗位主数据来源说明。假勤不在本模块新增 / 删除岗位。 */
export const jobRosterSource = {
  system: '组织架构（人事侧）',
  desc: '岗位的名称、编制人数、所属组织由组织架构维护，假勤侧只读引用。',
  syncedAt: '2026-10-13 06:00',
  readonlyFields: ['岗位名称', '编制人数', '所属组织'],
  writableFields: ['排班', '打卡', '薪酬结构', '额度来源', '名额来源', '请假连带', '配置下沉']
}

/** 组织维度：岗位主数据挂在组织下 */
export const organizations = [
  {
    id: 'hq',
    name: '总部',
    desc: '办公室职能岗 + 区域管理',
    jobs: ['产品经理', '后端开发', '前端开发', '运营专员', '职能支持', '区域经理']
  },
  {
    id: 'store',
    name: '门店',
    desc: '一线经营岗 + 驻店后台',
    jobs: ['推拿师', '客户经理', '门店店长', '前台客服']
  }
]

export function orgOf(jobName) {
  return organizations.find(o => o.jobs.includes(jobName)) || null
}

/** 岗位主数据 + 假勤特征。前三个字段属于主数据（只读引用），其余为假勤侧配置。 */
export const jobs = [
  {
    id: 'therapist',
    name: '推拿师',
    headcount: 486,
    schedule: true,
    attendance: false,
    quotaSource: 'performance',
    seatSource: 'cycle',
    shiftQuota: '4 天 / 月（32 小时）',
    tempQuota: '≤ 16 小时 / 月（上月业绩折算）',
    substitutable: 'high',
    configDepth: 'store',
    note: '订单驱动岗：班次假 4 天/月 + 临时假（业绩折算）；请假只记时长，超出部分不扣薪资'
  },
  {
    id: 'manager',
    name: '客户经理',
    headcount: 124,
    schedule: true,
    attendance: true,
    quotaSource: 'fixed',
    seatSource: 'cycle',
    shiftQuota: '4 天 / 月',
    tempQuota: '无',
    substitutable: 'low',
    configDepth: 'store',
    note: '编制少且技能特殊，缺一人需把原早班者改通班或外调顶替；现状只有班次假（4 天/月），超出部分扣薪资，但「超出如何审核」无管理入口 —— 重构需补'
  },
  {
    id: 'store-manager',
    name: '门店店长',
    headcount: 62,
    schedule: false,
    attendance: true,
    quotaSource: 'fixed',
    seatSource: 'none',
    shiftQuota: '无',
    tempQuota: '无',
    substitutable: 'low',
    configDepth: 'store',
    note: '不参与一线排班，但需考勤打卡证明在岗；请假需上级代管门店'
  },
  {
    id: 'front-desk',
    name: '前台客服',
    headcount: 98,
    schedule: true,
    attendance: true,
    quotaSource: 'fixed',
    seatSource: 'cycle',
    shiftQuota: '无',
    tempQuota: '无',
    substitutable: 'medium',
    configDepth: 'store',
    note: '现状无班次假；班次固定，缺一人通常可在店内微调'
  },
  {
    id: 'hq-product',
    name: '产品经理',
    headcount: 12,
    schedule: false,
    attendance: true,
    quotaSource: 'fixed',
    seatSource: 'none',
    shiftQuota: '无',
    tempQuota: '无',
    substitutable: 'high',
    configDepth: 'city',
    note: '总部岗，标准工时制、周末双休；只考勤不排班，请假不影响他人排班'
  },
  {
    id: 'hq-backend',
    name: '后端开发',
    headcount: 18,
    schedule: false,
    attendance: true,
    quotaSource: 'fixed',
    seatSource: 'none',
    shiftQuota: '无',
    tempQuota: '无',
    substitutable: 'high',
    configDepth: 'city',
    note: '总部岗，标准工时制、周末双休；只考勤不排班'
  },
  {
    id: 'hq-frontend',
    name: '前端开发',
    headcount: 10,
    schedule: false,
    attendance: true,
    quotaSource: 'fixed',
    seatSource: 'none',
    shiftQuota: '无',
    tempQuota: '无',
    substitutable: 'high',
    configDepth: 'city',
    note: '总部岗，标准工时制、周末双休；只考勤不排班'
  },
  {
    id: 'hq-operation',
    name: '运营专员',
    headcount: 16,
    schedule: false,
    attendance: true,
    quotaSource: 'fixed',
    seatSource: 'none',
    shiftQuota: '无',
    tempQuota: '无',
    substitutable: 'high',
    configDepth: 'city',
    note: '总部岗，标准工时制、周末双休；大促期可能有临时值班'
  },
  {
    id: 'hq-support',
    name: '职能支持',
    headcount: 20,
    schedule: false,
    attendance: true,
    quotaSource: 'fixed',
    seatSource: 'none',
    shiftQuota: '无',
    tempQuota: '无',
    substitutable: 'high',
    configDepth: 'city',
    note: 'HR / 财务 / 行政，总部岗，标准工时制、周末双休'
  },
  {
    id: 'regional-manager',
    name: '区域经理',
    headcount: 18,
    schedule: false,
    attendance: false,
    quotaSource: 'fixed',
    seatSource: 'none',
    shiftQuota: '无',
    tempQuota: '无',
    substitutable: 'high',
    configDepth: 'general',
    note: '外勤岗，不排班不打卡；请假只记时长'
  }
]

/* ---------- 请假后果策略（P1 定义层）----------
   薪酬结构决定请假后果。策略按岗位定义，但钱不在假勤算 ——
   假勤只输出「缺勤天数 + 假种」，由薪酬侧自行套日标准工资基数。 */
export const consequencePolicies = [
  {
    id: 'order-driven',
    jobs: ['推拿师'],
    payStructure: 'order',
    payImpactText: '不扣款，只记录缺勤时长',
    thresholdText: '无阈值（不涉及扣款）',
    scheduleText: '一般不触发连带：门店同岗池子大',
    orderText: '触发已预约订单处置',
    status: 'confirmed',
    note: '订单驱动岗：请假使可接单时间减少，收入自然下降，不额外扣款'
  },
  {
    id: 'fixed-threshold',
    jobs: ['客户经理'],
    payStructure: 'fixed',
    payImpactText: '超出月标准假后，按缺勤天数扣固定薪酬部分',
    thresholdText: '阈值 = 固定休息额度（此岗为每月 4 天）',
    scheduleText: '会连带：原早班者改通班，或外调支援顶替',
    orderText: '触发已预约订单处置',
    status: 'confirmed',
    note: '固定 + 绩效岗。阈值挂在固定休息额度上 —— 老原型的「第 N 天起扣 X% 日标准工资」即此岗专属配置'
  },
  {
    id: 'fixed-threshold-pending',
    jobs: ['门店店长', '前台客服', '产品经理', '后端开发', '前端开发', '运营专员', '职能支持', '区域经理'],
    payStructure: 'fixed',
    payImpactText: '待业务确认',
    thresholdText: '待确认',
    scheduleText: '待确认',
    orderText: '待确认',
    status: 'pending',
    note: '同为固定薪酬岗，但「是否同样按超月标准假扣款」业务未表态，预研稿按未定处理'
  }
]

export function consequenceOf(jobName) {
  return consequencePolicies.find(p => p.jobs.includes(jobName)) || null
}

/* ============================================================
   五、假种字典（假勤侧核心字典）
   「婚假、丧假等标准值参考通用和城市即可，不必全部下沉到门店」
   ============================================================ */
export const leaveCategories = [
  { value: 'statutory', label: '法定假' },
  { value: 'company', label: '公司自定' }
]

export const paidTypes = [
  { value: 'paid', label: '带薪' },
  { value: 'partial', label: '部分带薪' },
  { value: 'unpaid', label: '无薪' }
]

export const unitTypes = [
  { value: 'day', label: '天' },
  { value: 'halfday', label: '半天' },
  { value: 'hour', label: '小时' }
]

export const configDepths = [
  { value: 'general', label: '通用' },
  { value: 'city', label: '通用 → 城市' },
  { value: 'store', label: '通用 → 城市 → 门店' }
]

export const leaveTypes = [
  {
    id: 'personal',
    name: '事假',
    category: 'company',
    paid: 'unpaid',
    paidRatio: 0,
    unit: 'hour',
    needProof: false,
    proofText: '无需凭证',
    advanceDays: 1,
    exclusive: true,
    countQuota: false,
    quotaSource: 'none',
    standard: '不设标准值，按需申请',
    configDepth: 'store',
    enabled: true,
    note: '无薪不计额度；需提前 1 天申请，计入考勤异常判定'
  },
  {
    id: 'sick',
    name: '病假',
    category: 'statutory',
    paid: 'partial',
    paidRatio: 60,
    unit: 'day',
    needProof: true,
    proofText: '病假条 / 就诊记录',
    advanceDays: 0,
    exclusive: true,
    countQuota: false,
    quotaSource: 'none',
    standard: '按工龄享 3–24 个月医疗期（法定）',
    configDepth: 'city',
    enabled: true,
    note: '部分带薪 60%；可事后补凭证；不计入固定休息额度'
  },
  {
    id: 'annual',
    name: '年假',
    category: 'statutory',
    paid: 'paid',
    paidRatio: 100,
    unit: 'halfday',
    needProof: false,
    proofText: '无需凭证',
    advanceDays: 3,
    exclusive: true,
    countQuota: true,
    quotaSource: 'fixed',
    standard: '按工龄 5 / 10 / 15 天（法定），城市可上浮',
    configDepth: 'store',
    enabled: true,
    note: '计额度；额度按工龄在年度初一次性发放，支持跨年结转'
  },
  {
    id: 'compensatory',
    name: '调休',
    category: 'company',
    paid: 'paid',
    paidRatio: 100,
    unit: 'halfday',
    needProof: false,
    proofText: '无需凭证',
    advanceDays: 1,
    exclusive: true,
    countQuota: true,
    quotaSource: 'overtime',
    standard: '按加班时长累积，1 小时加班折 1 小时调休',
    configDepth: 'store',
    enabled: true,
    note: '额度来自加班累积而非固定发放；建议放行自动审核'
  },
  {
    id: 'rest',
    name: '补休',
    category: 'company',
    paid: 'paid',
    paidRatio: 100,
    unit: 'halfday',
    needProof: false,
    proofText: '无需凭证',
    advanceDays: 1,
    exclusive: true,
    countQuota: true,
    quotaSource: 'fixed',
    standard: '由门店在业务周期内统一派发',
    configDepth: 'store',
    enabled: true,
    note: '计额度；额度随业务周期派发，未休部分到期清零'
  },
  {
    id: 'marriage',
    name: '婚假',
    category: 'statutory',
    paid: 'paid',
    paidRatio: 100,
    unit: 'day',
    needProof: true,
    proofText: '结婚证',
    advanceDays: 7,
    exclusive: true,
    countQuota: false,
    quotaSource: 'none',
    standard: '法定 3 天；深圳市含地方奖励假共 10 天',
    configDepth: 'city',
    enabled: true,
    note: '法定假，标准值只需配到城市层；需人工核验结婚证'
  },
  {
    id: 'funeral',
    name: '丧假',
    category: 'statutory',
    paid: 'paid',
    paidRatio: 100,
    unit: 'day',
    needProof: true,
    proofText: '亲属关系证明 / 死亡证明',
    advanceDays: 0,
    exclusive: true,
    countQuota: false,
    quotaSource: 'none',
    standard: '1–3 天，按亲属关系区分（各地口径略有差异）',
    configDepth: 'city',
    enabled: true,
    note: '可事后补凭证；标准值配到城市层，需人工核验'
  },
  {
    id: 'maternity',
    name: '产假',
    category: 'statutory',
    paid: 'paid',
    paidRatio: 100,
    unit: 'day',
    needProof: true,
    proofText: '生育证明 / 出生医学证明',
    advanceDays: 30,
    exclusive: true,
    countQuota: false,
    quotaSource: 'none',
    standard: '法定 98 天；深圳市含奖励假共 178 天',
    configDepth: 'city',
    enabled: true,
    note: '必为长假，批准后触发员工福利侧社保公积金结论'
  },
  {
    id: 'paternity',
    name: '陪产假',
    category: 'statutory',
    paid: 'paid',
    paidRatio: 100,
    unit: 'day',
    needProof: true,
    proofText: '生育证明 / 出生医学证明',
    advanceDays: 7,
    exclusive: true,
    countQuota: false,
    quotaSource: 'none',
    standard: '深圳市 15 天',
    configDepth: 'city',
    enabled: true,
    note: '仅男性员工可选；标准值配到城市层'
  },
  {
    id: 'long-personal',
    name: '长事假',
    category: 'company',
    paid: 'unpaid',
    paidRatio: 0,
    unit: 'day',
    needProof: false,
    proofText: '无需凭证',
    advanceDays: 7,
    exclusive: true,
    countQuota: false,
    quotaSource: 'none',
    standard: '连续 ≥ 7 天，无上限但需逐级审批',
    configDepth: 'store',
    enabled: true,
    note: '无薪长假；批准后触发员工福利侧社保公积金结论，需追踪欠款余额'
  }
]

/* ============================================================
   六、审核规则（含层级继承与局部覆盖）
   覆盖语义：继承优先、局部只能逐层收紧、不可放宽
   数据只存「本层覆盖」，未出现即表示继承上层
   ============================================================ */
export const ruleCities = ['深圳市', '成都市', '北京市', '上海市']
export const ruleStores = {
  深圳市: ['深圳南山店', '深圳福田店', '深圳宝安店', '深圳龙华店'],
  成都市: ['成都春熙路店', '成都天府店', '成都武侯店'],
  北京市: ['北京国贸店', '北京三里屯店', '北京望京店'],
  上海市: ['上海陆家嘴店', '上海南京路店']
}

export const approvalRules = [
  {
    leaveTypeId: 'annual',
    general: { autoApprove: true },
    city: { 深圳市: { autoApprove: false } },
    store: {}
  },
  {
    leaveTypeId: 'compensatory',
    general: { autoApprove: true },
    city: {},
    store: {}
  },
  {
    leaveTypeId: 'personal',
    general: { autoApprove: true },
    city: { 深圳市: { autoApprove: false } },
    store: { 深圳南山店: { autoApprove: false } }
  },
  {
    leaveTypeId: 'sick',
    general: { autoApprove: false },
    city: {},
    store: {}
  },
  {
    leaveTypeId: 'rest',
    general: { autoApprove: true },
    city: {},
    store: { 成都天府店: { autoApprove: false } }
  }
]

/* 自动通过条件集：全部满足才自动通过，任一不满足即转人工 */
export const autoApproveConditions = [
  { id: 'quota', label: '额度内', desc: '申请时长 ≤ 该假种当前剩余额度', enabled: true },
  { id: 'timeline', label: '时间线无冲突', desc: '申请时段在员工时间线上无其他排他占位', enabled: true },
  { id: 'advance', label: '提前期达标', desc: '距请假开始日 ≥ 该假种要求的提前申请期', enabled: true },
  { id: 'special', label: '非特殊假种', desc: '婚 / 丧 / 产 / 陪产需人工核验凭证，不走自动', enabled: true },
  { id: 'long', label: '非长假', desc: '连续时长 < 长假阈值（当前 7 天）', enabled: true },
  { id: 'order', label: '时段内无预约订单', desc: '申请时段内无未完成的客户预约订单', enabled: false }
]

/* 触发原因字典：单据必须能解释「为何走人工」 */
export const approvalTriggers = [
  { id: 'scope', label: '配置原因 · 该层级已关闭自动审核', tone: 'info' },
  { id: 'quota', label: '业务原因 · 超出可用额度', tone: 'warning' },
  { id: 'timeline', label: '业务原因 · 时间线存在排他占位', tone: 'warning' },
  { id: 'advance', label: '业务原因 · 未满足提前申请期', tone: 'warning' },
  { id: 'special', label: '业务原因 · 特殊假种需核验凭证', tone: 'warning' },
  { id: 'long', label: '业务原因 · 达到长假阈值', tone: 'danger' }
]

export const ruleChangeLogs = [
  {
    id: 1,
    time: '2026-09-28 14:22',
    operator: '李文静 · 人事经理',
    scope: '门店 · 深圳南山店',
    target: '事假',
    from: '自动审核',
    to: '人工审核',
    reason: '该店近期客诉集中，事假需店长确认排班影响'
  },
  {
    id: 2,
    time: '2026-09-12 09:40',
    operator: '李文静 · 人事经理',
    scope: '城市 · 深圳市',
    target: '年假',
    from: '自动审核',
    to: '人工审核',
    reason: '九月旺季缺编，年假申请集中，改由人工排期'
  },
  {
    id: 3,
    time: '2026-08-30 16:05',
    operator: '陈立 · 系统管理员',
    scope: '通用',
    target: '调休',
    from: '人工审核',
    to: '自动审核',
    reason: '调休为员工加班累积所得，规则内放行自动通过'
  },
  {
    id: 4,
    time: '2026-08-30 15:58',
    operator: '陈立 · 系统管理员',
    scope: '门店 · 成都天府店',
    target: '补休',
    from: '自动审核',
    to: '人工审核',
    reason: '该店人力紧张，补休需店长统一排期'
  }
]

/* 假种字典速查：给审核规则页做联动展示 */
export function findLeaveType(id) {
  return leaveTypes.find(t => t.id === id) || null
}

export function findJob(id) {
  return jobs.find(j => j.id === id) || null
}

/* ============================================================
   六、工作日历（排班计划的前置）
   ------------------------------------------------------------
   「休息」有三个来源，别混：
     1) 工作日历 —— 默认就不上班（本页配置，总部岗的周末）
     2) 可休额度 —— 要申请的（一线岗的标准假）
     3) 假种     —— 法定 / 公司给的
   日历的叠加顺序（低 → 高）：
     周基础模式 → 法定节假日 → 法定调班日 → 门店特殊日
   后一层覆盖前一层，且被覆盖的层保留痕迹，用于解释「这天为什么是工作日」。
   ============================================================ */

/** 国家法定节假日日历（只读，按年维护）
 *  数据来源：国务院办公厅《关于 2026 年部分节假日安排的通知》（2025-11-04） */
export const statutoryCalendar = {
  year: 2026,
  source: '国务院办公厅《关于2026年部分节假日安排的通知》',
  holidays: [
    { name: '元旦', start: '2026-01-01', end: '2026-01-03', days: 3 },
    { name: '春节', start: '2026-02-15', end: '2026-02-23', days: 9 },
    { name: '清明节', start: '2026-04-04', end: '2026-04-06', days: 3 },
    { name: '劳动节', start: '2026-05-01', end: '2026-05-05', days: 5 },
    { name: '端午节', start: '2026-06-19', end: '2026-06-21', days: 3 },
    { name: '中秋节', start: '2026-09-25', end: '2026-09-27', days: 3 },
    { name: '国庆节', start: '2026-10-01', end: '2026-10-07', days: 7 }
  ],
  makeupWorkdays: [
    { date: '2026-01-04', note: '元旦调休补班' },
    { date: '2026-02-14', note: '春节调休补班' },
    { date: '2026-02-28', note: '春节调休补班' },
    { date: '2026-05-09', note: '劳动节调休补班' },
    { date: '2026-09-20', note: '国庆调休补班' },
    { date: '2026-10-10', note: '国庆调休补班' }
  ]
}

/** 法定节假日口径：同一份国家日历，两侧解读不同 */
export const holidayPolicies = [
  { value: 'rest', label: '放假休息', desc: '法定节假日不上班；遇国家调班日需补班。适用于总部职能等办公室岗位。' },
  { value: 'business', label: '照常营业', desc: '门店全年营业，法定节假日是「特殊营业日」，涉及加班与提成，但不算休息。' }
]

/** 周基础模式预设 */
export const weekPatternPresets = [
  { id: 'double', label: '周末双休', pattern: [1, 1, 1, 1, 1, 0, 0] },
  { id: 'single', label: '每周单休', pattern: [1, 1, 1, 1, 1, 1, 0] },
  { id: 'all', label: '全月排班', pattern: [1, 1, 1, 1, 1, 1, 1] }
]

/** 特殊日类型 */
export const specialDayTypes = [
  { value: 'work', label: '临时上班', desc: '把默认休息日改成本岗位上的一天' },
  { value: 'rest', label: '临时休息', desc: '把默认工作日改成休息（团建、盘点歇业等）' }
]

/** 工作日历按「岗位」配置。
 *  工作日历完全相同的岗位并成一组 —— 分组的唯一含义是「这些岗位一样」：
 *  改一次全组生效；把岗位移到别的组，等于换了一份日历。
 *  jobs 里的岗位名对应岗位主数据（见上方 jobs）。 */
export const calendarJobGroups = [
  {
    id: 'grp-full-month',
    name: '全月排班组',
    basis: '门店全年营业，没有默认休息日；要休哪天须走「标准假」额度申请。',
    jobs: ['推拿师', '客户经理'],
    weekPattern: [1, 1, 1, 1, 1, 1, 1],
    holidayPolicy: 'business',
    specialDays: [
      { date: '2026-10-20', type: 'rest', reason: '门店年度盘点，歇业一天' }
    ]
  },
  {
    id: 'grp-weekend-off',
    name: '周末双休组',
    basis: '办公室岗位，周末固定休息。休息来自日历，不占「标准假」额度。',
    jobs: ['产品经理', '后端开发', '前端开发', '运营专员', '职能支持'],
    weekPattern: [1, 1, 1, 1, 1, 0, 0],
    holidayPolicy: 'rest',
    specialDays: [
      { date: '2026-10-17', type: 'work', reason: '大促活动，周末值班一天' }
    ]
  },
  {
    id: 'grp-store-back',
    name: '门店驻店组',
    basis: '原型假设（待与业务确认）：门店需有人值守，按周轮休一天；法定节假日照常营业。',
    jobs: ['门店店长', '前台客服'],
    weekPattern: [1, 1, 1, 1, 1, 1, 0],
    holidayPolicy: 'business',
    specialDays: [
      { date: '2026-10-11', type: 'work', reason: '值班轮换，本周日照常营业' }
    ]
  }
]

/* ============================================================
   七、引用反查（只读 · 系统算）
   给定岗位名，列出它在假勤侧被哪些配置引用、以及哪些配置其实不按岗位分层。
   意义：改任何一处配置前，先在这里看影响面。
   ============================================================ */

const labelOf = (arr, v) => (arr.find(x => x.value === v) || {}).label || v

export function jobReferenceIndex(jobName) {
  const job = jobs.find(j => j.name === jobName)
  if (!job) return []

  const group = calendarJobGroups.find(g => g.jobs.includes(jobName))
  const policy = consequenceOf(jobName)

  return [
    {
      module: '工作日历',
      byJob: true,
      route: 'leave-work-calendar',
      detail: group
        ? `归在「${group.name}」· ${group.jobs.length} 个岗位共用同一份日历`
        : '尚未归组 —— 未归组就无法判断哪天该上班',
      warn: !group
    },
    {
      module: '假勤模式',
      byJob: true,
      route: 'leave-job-mode',
      detail: `${job.schedule ? '排班' : '不排班'} · ${job.attendance ? '打卡' : '不打卡'} · 班次假 ${job.shiftQuota} · 临时假 ${job.tempQuota}`
    },
    {
      module: '额度规则',
      byJob: true,
      route: null,
      detail: `${labelOf(quotaSources, job.quotaSource)} · 班次假 ${job.shiftQuota}${job.tempQuota !== '无' ? ` · 临时假 ${job.tempQuota}` : ''}`
    },
    {
      module: '名额规则',
      byJob: true,
      route: null,
      detail: job.seatSource === 'none'
        ? '不参与排班，无名额概念'
        : labelOf(seatSources, job.seatSource)
    },
    {
      module: '后果策略',
      byJob: true,
      route: null,
      detail: policy ? policy.payImpactText : '未配置',
      warn: !!policy && policy.status === 'pending'
    },
    {
      module: '审核规则',
      byJob: false,
      route: 'leave-approval-rules',
      detail: '按 城市 / 门店 分层，不按岗位区分'
    },
    {
      module: '假种字典',
      byJob: false,
      route: 'leave-type-dictionary',
      detail: '按 假种 × 下沉深度，不按岗位区分'
    }
  ]
}

/** 该岗位被多少处「按岗位」的配置引用 —— 只看这部分，不按岗位的分层配置与它无关 */
export function jobReferenceCount(jobName) {
  return jobReferenceIndex(jobName).filter(r => r.byJob).length
}
