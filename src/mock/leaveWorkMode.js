/**
 * 假勤重构 · 预设计 v2「工作模式」方向 mock 数据
 * ------------------------------------------------------------------
 * ⚠️ 性质：预研探路稿，不是正式结论。本文件是「把工作日历与假勤模式融合、把日历与考勤组
 *    抽象成可被岗位引用的实体」这一轮推演的假设数据，用于看形态、对齐口径，不作需求基线。
 *
 * 与 v1（leaveAttendance.js）的关系：只读引用其中的岗位主数据 / 组织 / 国家日历等既有事实，
 * 不修改 v1 的任何数据与页面 —— 两版并存，便于对比。
 *
 * 本轮模型（四层）：
 *   引用层（只读 · 别人的资产）：岗位（组织架构）、考勤组（打卡组）、法定节假日（国家）
 *   配置层（我们建页 · 业务填值）：工作日方案（一份日历口径）+ 假期方案（一个假种的额度口径）
 *   声明层（挂在岗位上）：引用哪个工作日方案 / 哪些假期方案 / 哪个考勤组、要不要打卡、请假连带
 *
 * 两个正交的轴：
 *   横向复用 —— 岗位「引用」同一份方案（方案给值）
 *   纵向覆盖 —— 通用 → 城市 → 门店 逐层收紧（继承给覆盖）
 */

import {
  jobs as baseJobs,
  organizations,
  statutoryCalendar,
  weekPatternPresets,
  holidayPolicies,
  specialDayTypes
} from './leaveAttendance.js'

// 既有事实：直接转出，页面只 import 本文件即可
export {
  organizations,
  statutoryCalendar,
  weekPatternPresets,
  holidayPolicies,
  specialDayTypes
}

/* ============================================================
   一、工作日方案（配置层 · 可被岗位引用的实体）
   一份方案 = 周基础模式 + 法定节假日口径 + 方案内特殊日
   方案不知道谁在用它；岗位通过 schemeId 引用它。
   ============================================================ */
export const scheduleSchemes = [
  {
    id: 'sch-store-year-round',
    name: '门店 · 全年营业',
    domain: '门店一线',
    basis: '门店全年营业，没有默认休息日；要休哪天须走「标准假」额度申请。',
    weekPattern: [1, 1, 1, 1, 1, 1, 1],
    holidayPolicy: 'business',
    specialDays: [
      { date: '2026-10-20', type: 'rest', reason: '门店年度盘点，歇业一天' }
    ],
    builtin: true,
    updatedAt: '2026-09-30'
  },
  {
    id: 'sch-office-weekend',
    name: '办公室 · 周末双休',
    domain: '总部职能',
    basis: '办公室岗位，周末固定休息。休息来自日历，不占「标准假」额度。',
    weekPattern: [1, 1, 1, 1, 1, 0, 0],
    holidayPolicy: 'rest',
    specialDays: [
      { date: '2026-10-17', type: 'work', reason: '大促活动，周末值班一天' }
    ],
    builtin: true,
    updatedAt: '2026-09-18'
  },
  {
    id: 'sch-store-duty',
    name: '门店 · 驻店轮休',
    domain: '门店后台',
    basis: '原型假设（待与业务确认）：门店需有人值守，按周轮休一天；法定节假日照常营业。',
    weekPattern: [1, 1, 1, 1, 1, 1, 0],
    holidayPolicy: 'business',
    specialDays: [
      { date: '2026-10-11', type: 'work', reason: '值班轮换，本周日照常营业' }
    ],
    builtin: false,
    updatedAt: '2026-10-08'
  }
]

export function findScheme(id) {
  return scheduleSchemes.find(s => s.id === id) || null
}

/* ============================================================
   二、考勤组（引用层 · 打卡组的资产 · 只读）
   考勤组提供「怎么打卡、在哪儿打卡、管哪些人」；假勤只引用，不实现。
   「要不要打卡」写在岗位的声明里 —— 同一个门店，推拿师不打卡、客户经理打卡。
   ============================================================ */
export const attendanceGroups = [
  {
    id: 'att-store-geo',
    name: '门店 · 定位打卡组',
    method: 'GPS 定位 + 门店 WiFi 双重校验',
    scope: '深圳 / 成都 / 北京 / 上海 全部门店',
    coverJobs: ['客户经理', '门店店长', '前台客服'],
    memberCount: 284,
    enabled: true,
    source: '打卡组 · 只读',
    updatedAt: '2026-09-25',
    note: '一线经营与驻店岗到店打卡；迟到早退口径由打卡组给出，假勤只取结论'
  },
  {
    id: 'att-hq-net',
    name: '总部 · 办公网打卡组',
    method: '办公网 / 定点设备打卡',
    scope: '总部办公区',
    coverJobs: ['产品经理', '后端开发', '前端开发', '运营专员', '职能支持'],
    memberCount: 76,
    enabled: true,
    source: '打卡组 · 只读',
    updatedAt: '2026-09-25',
    note: '标准工时制；周末与法定节假日是否上班，由岗位引用的「工作日方案」决定'
  },
  {
    id: 'att-field-mobile',
    name: '外勤 · 移动打卡组',
    method: '移动端定位打卡',
    scope: '外勤 / 巡店',
    coverJobs: [],
    memberCount: 0,
    enabled: false,
    source: '打卡组 · 只读',
    updatedAt: '—',
    note: '当前无岗位引用：区域经理为纯外勤、不打卡。若将来需外勤打卡，岗位改引本组即可，不必新建页面'
  }
]

export function findAttendanceGroup(id) {
  return attendanceGroups.find(a => a.id === id) || null
}

/* 打卡方式 / 有效范围 的候选值（仅作编辑态下拉候选，已有值不做强约束，可自行输入） */
export const punchMethodOptions = [
  'GPS 定位 + 门店 WiFi 双重校验',
  'GPS 定位',
  '门店 WiFi',
  '办公网 / 定点设备打卡',
  '移动端定位打卡',
  '人脸闸机'
]

export const punchScopeOptions = [
  '深圳 / 成都 / 北京 / 上海 全部门店',
  '总部办公区',
  '外勤 / 巡店',
  '指定门店'
]

/* ============================================================
   二·二、假期方案（配置层 · 可被岗位引用的实体）
   一份假期方案 = 一个假种 + 一种计量口径：
     · 周期型 cycle：某周期内可用固定额度（班次假 4 天/自然月、年假 5 天/自然年）
     · 事件型 event：每次事件可用固定额度（婚假 3 天/次、丧假 3 天/次）
   假期方案只给「值」；实际发放、结转、与排班的抵扣顺序仍在现有额度模块。
   「带薪与否」是假种属性，不进假期方案。
   ============================================================ */
export const leaveTypeOptions = [
  '班次假', '临时假', '年假', '婚假', '丧假', '产假', '陪产假', '事假', '病假'
]

export const cycleOptions = ['自然月', '自然季', '自然年', '入职周年']

export const quotaMeasureOptions = [
  { value: 'cycle', label: '周期型', desc: '每个周期内可用固定额度，如「每自然月 4 天」' },
  { value: 'event', label: '事件型', desc: '每次事件发生时可用固定额度，如「婚假一次 3 天」' }
]

export const quotaSchemes = [
  {
    id: 'qs-shift-4d',
    name: '班次假 · 每自然月 4 天',
    leaveType: '班次假',
    measure: 'cycle',
    cycle: '自然月',
    amount: 4,
    unit: '天',
    carryOver: false,
    note: '',
    builtin: true,
    updatedAt: '2026-09-30'
  },
  {
    id: 'qs-temp-16h',
    name: '临时假 · 每自然月 16 小时',
    leaveType: '临时假',
    measure: 'cycle',
    cycle: '自然月',
    amount: 16,
    unit: '小时',
    carryOver: false,
    derivedFrom: '按上月业绩折算，折算值即本额度上限',
    note: '',
    builtin: true,
    updatedAt: '2026-09-30'
  },
  {
    id: 'qs-annual-5d',
    name: '年假 · 每自然年 5 天',
    leaveType: '年假',
    measure: 'cycle',
    cycle: '自然年',
    amount: 5,
    unit: '天',
    carryOver: true,
    note: '',
    builtin: true,
    updatedAt: '2026-09-18'
  },
  {
    id: 'qs-marriage-3d',
    name: '婚假 · 每次 3 天',
    leaveType: '婚假',
    measure: 'event',
    validWithin: '领证后 12 个月内',
    amount: 3,
    unit: '天',
    carryOver: false,
    note: '',
    builtin: true,
    updatedAt: '2026-09-18'
  },
  {
    id: 'qs-funeral-3d',
    name: '丧假 · 每次 3 天',
    leaveType: '丧假',
    measure: 'event',
    validWithin: '亲属去世后 1 个月内',
    amount: 3,
    unit: '天',
    carryOver: false,
    note: '',
    builtin: true,
    updatedAt: '2026-09-18'
  }
]

export function findQuotaScheme(id) {
  return quotaSchemes.find(q => q.id === id) || null
}

/** 哪些岗位引用了这份假期方案 */
export function jobsUsingQuota(quotaId) {
  return jobWorkModes.filter(m => (m.quotaSchemeIds || []).includes(quotaId)).map(m => m.job)
}

/* ---------- 补缺方式（请假通过后的「人力后果」在岗位上的声明）----------
   两条正交的下游：额度后果 → 交付薪酬；人力后果 → 交付人力调度。
   假勤本身不实现补人，只产出「缺岗信号」（日期 / 门店 / 岗位 / 班次段 / 缺几个人）。
   补缺一律「同岗位」：推拿师缺人补推拿师，客户经理缺人补客户经理，不跨岗位。
   本字段只声明「这个岗位的缺岗走哪条补缺路径」，是值不是逻辑。 */
export const backfillOptions = [
  {
    value: 'same-job-task',
    label: '同岗位接班任务',
    desc: '缺岗时段拆成接班任务，由同岗位人员（含非全日制）承接'
  },
  {
    value: 'same-job-shift',
    label: '同岗位改班次',
    desc: '由同门店同岗位的剩余人员改班次消化，如早班改通班'
  },
  {
    value: 'none',
    label: '无缺岗',
    desc: '不排班岗位，请假不产生接班任务'
  }
]

/* ============================================================
   三、岗位工作模式（声明层）
   每个岗位：引用一份工作日方案（可空）、引用一个考勤组（可空），并声明自己的额度与连带。
   注意：推拿师与客户经理引用同一份方案，但额度不同 —— 证明「日历相同 ≠ 额度相同」，
        日历与额度是两个独立的轴，不能靠分组一并表达。
   ============================================================ */
export const jobWorkModes = [
  {
    job: '推拿师',
    org: '门店',
    headcount: 486,
    schedule: true,
    attendance: false,
    schemeId: 'sch-store-year-round',
    attendanceGroupId: null,
    quotaSchemeIds: ['qs-shift-4d', 'qs-temp-16h', 'qs-annual-5d', 'qs-marriage-3d', 'qs-funeral-3d'],
    backfill: 'same-job-task',
    backfillNote: '门店同岗位人员充足，缺岗按班次段拆成接班任务即可补齐',
    note: '订单驱动岗：只排班不打卡；临时假按上月业绩折算，仅此岗有'
  },
  {
    job: '客户经理',
    org: '门店',
    headcount: 124,
    schedule: true,
    attendance: true,
    schemeId: 'sch-store-year-round',
    attendanceGroupId: 'att-store-geo',
    quotaSchemeIds: ['qs-shift-4d', 'qs-annual-5d', 'qs-marriage-3d', 'qs-funeral-3d'],
    backfill: 'same-job-task',
    backfillNote: '两种手段并存：按班次段生成接班任务派给同岗位人员，或把同门店剩余客户经理的早班改通班',
    note: '编制少、技能特殊，缺一人即影响门店当值；只有班次假，超出扣薪但现状无审核入口'
  },
  {
    job: '门店店长',
    org: '门店',
    headcount: 62,
    schedule: false,
    attendance: true,
    schemeId: 'sch-store-duty',
    attendanceGroupId: 'att-store-geo',
    quotaSchemeIds: ['qs-annual-5d', 'qs-marriage-3d', 'qs-funeral-3d'],
    backfill: 'none',
    note: '不参与一线排班，但需打卡证明在岗；请假由上级代管门店'
  },
  {
    job: '前台客服',
    org: '门店',
    headcount: 98,
    schedule: true,
    attendance: true,
    schemeId: 'sch-store-duty',
    attendanceGroupId: 'att-store-geo',
    quotaSchemeIds: ['qs-annual-5d', 'qs-marriage-3d', 'qs-funeral-3d'],
    backfill: 'same-job-shift',
    backfillNote: '班次固定，缺一人通常由同门店同岗位改班次消化',
    note: '现状无班次假'
  },
  {
    job: '产品经理',
    org: '总部',
    headcount: 12,
    schedule: false,
    attendance: true,
    schemeId: 'sch-office-weekend',
    attendanceGroupId: 'att-hq-net',
    quotaSchemeIds: ['qs-annual-5d', 'qs-marriage-3d', 'qs-funeral-3d'],
    backfill: 'none',
    note: '标准工时制、周末双休；只考勤不排班，请假不影响他人排班'
  },
  {
    job: '后端开发',
    org: '总部',
    headcount: 18,
    schedule: false,
    attendance: true,
    schemeId: 'sch-office-weekend',
    attendanceGroupId: 'att-hq-net',
    quotaSchemeIds: ['qs-annual-5d', 'qs-marriage-3d', 'qs-funeral-3d'],
    backfill: 'none',
    note: '标准工时制、周末双休；只考勤不排班'
  },
  {
    job: '前端开发',
    org: '总部',
    headcount: 10,
    schedule: false,
    attendance: true,
    schemeId: 'sch-office-weekend',
    attendanceGroupId: 'att-hq-net',
    quotaSchemeIds: ['qs-annual-5d', 'qs-marriage-3d', 'qs-funeral-3d'],
    backfill: 'none',
    note: '标准工时制、周末双休；只考勤不排班'
  },
  {
    job: '运营专员',
    org: '总部',
    headcount: 16,
    schedule: false,
    attendance: true,
    schemeId: 'sch-office-weekend',
    attendanceGroupId: 'att-hq-net',
    quotaSchemeIds: ['qs-annual-5d', 'qs-marriage-3d', 'qs-funeral-3d'],
    backfill: 'none',
    note: '标准工时制、周末双休；大促期可能有临时值班（记在方案的特殊日里）'
  },
  {
    job: '职能支持',
    org: '总部',
    headcount: 20,
    schedule: false,
    attendance: true,
    schemeId: 'sch-office-weekend',
    attendanceGroupId: 'att-hq-net',
    quotaSchemeIds: ['qs-annual-5d', 'qs-marriage-3d', 'qs-funeral-3d'],
    backfill: 'none',
    note: 'HR / 财务 / 行政；标准工时制、周末双休'
  },
  {
    job: '区域经理',
    org: '总部',
    headcount: 18,
    schedule: false,
    attendance: false,
    schemeId: null,
    attendanceGroupId: null,
    quotaSchemeIds: ['qs-annual-5d', 'qs-marriage-3d', 'qs-funeral-3d'],
    backfill: 'none',
    pending: '外勤岗的日历口径未定 —— 待业务确认前先不引用任何方案',
    note: '外勤岗，不排班不打卡；请假只记时长'
  }
]

export function jobModeOf(jobName) {
  return jobWorkModes.find(m => m.job === jobName) || null
}

/** 哪些岗位引用了这份方案（横向复用的直接体现） */
export function jobsUsingScheme(schemeId) {
  return jobWorkModes.filter(m => m.schemeId === schemeId).map(m => m.job)
}

/** 哪些岗位引用了这个考勤组 */
export function jobsUsingAttendance(attId) {
  return jobWorkModes.filter(m => m.attendanceGroupId === attId).map(m => m.job)
}

/* ============================================================
   四、请假审核与后果（声明层 · 挂在岗位上）
   审批通过后产生两条正交的下游：
     额度后果 → 交付薪酬（假勤只给「休假时长 + 假种」，怎么扣钱是薪酬侧的事）
     人力后果 → 交付人力调度（假勤只产出「缺岗信号」，本身不实现补人）
   经营人数校验：门店人多（推拿师）→ 退到审核环节做软性校验；
               门店人少（客户经理）→ 人数不足直接拦下。
   ============================================================ */
export const headcountCheckOptions = [
  { value: 'none', label: '不校验', desc: '该岗位的缺岗不影响门店当值人数' },
  { value: 'soft', label: '软性', desc: '人数不足仍可提交，系统登记并在审核时提示' },
  { value: 'hard', label: '硬性', desc: '当日剩余人数不满足经营需求时，提交即被拦下' }
]

export const approveOptions = [
  { value: 'auto', label: '自动通过' },
  { value: 'manual', label: '人工审批' },
  { value: 'mixed', label: '按假种区分' }
]

export const reviewPolicies = [
  {
    job: '推拿师',
    approve: 'mixed',
    approveText: '班次假 / 临时假自动通过；特殊情况请假需人工',
    headcountCheck: 'soft',
    payConsequence: '不扣款，只记录缺勤时长',
    signal: true,
    backfill: 'same-job-task',
    note: '门店同岗位人员多，人数校验放审核环节做软性提示；通过后按班次段生成同岗位接班需求'
  },
  {
    job: '客户经理',
    approve: 'manual',
    approveText: '人工审批',
    headcountCheck: 'hard',
    payConsequence: '超出月标准假后，按缺勤天数扣固定薪酬部分',
    signal: true,
    backfill: 'same-job-task',
    note: '门店编制少，人数不足直接拦下；缺岗由同岗位接班任务或同门店改班次消化'
  },
  {
    job: '门店店长',
    approve: 'manual',
    approveText: '人工审批',
    headcountCheck: 'none',
    payConsequence: '待业务确认',
    signal: false,
    backfill: 'none',
    note: '不排班，请假由上级代管门店，不产生接班任务'
  },
  {
    job: '前台客服',
    approve: 'manual',
    approveText: '人工审批',
    headcountCheck: 'none',
    payConsequence: '待业务确认',
    signal: true,
    backfill: 'same-job-shift',
    note: '班次固定，缺岗由同门店同岗位改班次消化'
  },
  {
    job: '产品经理',
    approve: 'auto',
    approveText: '自动通过',
    headcountCheck: 'none',
    payConsequence: '待业务确认',
    signal: false,
    backfill: 'none',
    note: '标准工时制，请假不影响他人排班'
  },
  {
    job: '后端开发',
    approve: 'auto',
    approveText: '自动通过',
    headcountCheck: 'none',
    payConsequence: '待业务确认',
    signal: false,
    backfill: 'none',
    note: '标准工时制，请假不影响他人排班'
  },
  {
    job: '前端开发',
    approve: 'auto',
    approveText: '自动通过',
    headcountCheck: 'none',
    payConsequence: '待业务确认',
    signal: false,
    backfill: 'none',
    note: '标准工时制，请假不影响他人排班'
  },
  {
    job: '运营专员',
    approve: 'auto',
    approveText: '自动通过',
    headcountCheck: 'none',
    payConsequence: '待业务确认',
    signal: false,
    backfill: 'none',
    note: '标准工时制，请假不影响他人排班'
  },
  {
    job: '职能支持',
    approve: 'auto',
    approveText: '自动通过',
    headcountCheck: 'none',
    payConsequence: '待业务确认',
    signal: false,
    backfill: 'none',
    note: '标准工时制，请假不影响他人排班'
  },
  {
    job: '区域经理',
    approve: 'auto',
    approveText: '自动通过',
    headcountCheck: 'none',
    payConsequence: '待业务确认',
    signal: false,
    backfill: 'none',
    note: '外勤岗，只记时长'
  }
]

export function reviewPolicyOf(jobName) {
  return reviewPolicies.find(p => p.job === jobName) || null
}

/** 缺岗信号的字段口径（假勤产出、交付人力调度） */
export const gapSignalFields = [
  { key: 'date', label: '日期' },
  { key: 'store', label: '门店' },
  { key: 'job', label: '岗位' },
  { key: 'shift', label: '班次段' },
  { key: 'headcount', label: '缺人数' }
]

/* ============================================================
   五、辅助：周模式文字化（与 v1 同口径）
   ============================================================ */
const CN_WEEK = ['一', '二', '三', '四', '五', '六', '日']

export function patternText(pattern) {
  const rest = pattern.map((v, i) => (v === 0 ? i : -1)).filter(i => i >= 0)
  if (!rest.length) return '全月排班（无固定休息日）'
  if (rest.length === 7) return '全周休息'
  if (rest.length === 2 && rest[0] === 5 && rest[1] === 6) return '周末双休'
  if (rest.length === 1) return `每周单休（周${CN_WEEK[rest[0]]}）`
  return '休 ' + rest.map(i => '周' + CN_WEEK[i]).join('、')
}

export const weekDayNames = CN_WEEK

/* ============================================================
   六、纵向覆盖（分层继承）的示意数据
   与「横向复用」正交：方案提供值，继承提供覆盖；局部只能逐层收紧，不可放宽。
   这里只放展示用的示意条目，真正的规则在「审核规则」页（v1）。
   ============================================================ */
export const inheritDemo = [
  { layer: '通用', scope: '全公司', rule: '年假自动通过', tone: 'base' },
  { layer: '城市', scope: '深圳市', rule: '年假转人工（旺季缺编）', tone: 'tighten' },
  { layer: '门店', scope: '深圳南山店', rule: '事假转人工（客诉集中）', tone: 'tighten' }
]

/* ============================================================
   七、待决（本轮 explore 出来、留给讨论的问题）
   注：本轮起不再在原型页展示这些条目 —— 原型只留界面，讨论结论归文档。
   ============================================================ */
export const pendingQuestions = [
  {
    id: 'Q1',
    title: '额度要不要也抽象成「可引用方案」',
    decided: true,
    detail: '已采纳（2026-10-13）：额度抽成「假期方案」—— 周期型（某周期内几天，如班次假 4 天/自然月）+ 事件型（每次事件几天，如婚假 3 天/次）。岗位引用若干假期方案，于是额度成为与日历并列的第二个可复用轴。'
  },
  {
    id: 'Q2',
    title: '「要不要打卡」归属：声明在岗位还是考勤组',
    detail: '本轮放在岗位声明（同一门店，推拿师不打卡、客户经理打卡）。若放在考勤组，则需为不打卡的人单独建组，反而更碎。注意：考勤组若自持「覆盖岗位」，会与岗位声明重复 —— 两者需留一个。'
  },
  {
    id: 'Q3',
    title: '方案能不能被单个岗位「覆盖一天」',
    detail: '方案内的特殊日作用于所有引用者。若某岗位只想自己改一天，是新建方案，还是允许岗位级覆盖？'
  },
  {
    id: 'Q4',
    title: '考勤组在假勤侧：只读引用，还是可建可改',
    detail: '考勤组当前归属「打卡组」。假勤侧若只引用，则考勤组页的编辑态应整块摘除、只留「引用自洽性检查」；若改为假勤侧可维护，则需与打卡组约定字段边界（打卡方式 / 有效范围谁说了算，成员是同步还是本地维护）。本轮先把编辑态做出来，供对照评审。'
  }
]

// 岗位主数据（只读引用，供页面做人数 / 组织校验）
export const rosterJobs = baseJobs
