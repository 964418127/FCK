/**
 * 假勤重构（工作模式方向）mock 数据
 * ------------------------------------------------------------------
 * 本文件是原型演示数据。它承载的是「把工作日历与假勤模式融合、把日历与考勤组
 *    抽象成可被岗位引用的实体」这一模型下的样例数据，用于看形态、对齐口径。
 *
 * 与 v1（leaveAttendance.js）的关系：只读引用其中的岗位主数据 / 组织 / 国家日历等既有事实，
 * 不修改 v1 的任何数据与页面 —— 两版并存，便于对比。
 *
 * 本轮模型（四层）：
 *   引用层（只读 · 别人的资产）：岗位（组织架构）、考勤组（打卡组）、法定节假日（国家）
 *   配置层（我们建页 · 业务填值）：出勤方案（一份日历口径）+ 假期额度方案（一个假种的额度口径）
 *   声明层（挂在岗位上）：引用哪个出勤方案 / 哪些假期额度方案 / 哪个考勤组、
 *                        本岗位私有的「岗位额度」、要不要打卡、请假连带
 *
 * 两条正交的取数轴：
 *   横向 —— 同一个假种只有一份「全公司」方案时，所有岗位共用这一份值；
 *   纵向 —— 同一假种可以再出「城市」「门店」两档方案，取值按 门店 > 城市 > 全公司
 *           取**最近的一份**生效（不合并、不继承、不折算）。个人维度暂不支持。
 *   两条轴都只改「值」，不改「这个假种存不存在」。
 */

import {
  jobs as baseJobs,
  organizations,
  leaveTypes,
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
   一、出勤方案（配置层 · 可被岗位引用的实体）
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
    memberCount: 76,
    enabled: true,
    source: '打卡组 · 只读',
    updatedAt: '2026-09-25',
    note: '标准工时制；周末与法定节假日是否上班，由岗位引用的「出勤方案」决定'
  },
  {
    id: 'att-field-mobile',
    name: '外勤 · 移动打卡组',
    method: '移动端定位打卡',
    scope: '外勤 / 巡店',
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
   一·五、城市 / 门店（引用层 · 组织架构的资产 · 只读）
   地域只是「差异化维度」里的两项，不是唯一的差异化方式。
   ============================================================ */
export const cityStores = [
  { city: '深圳市', stores: ['深圳南山店', '深圳福田店', '深圳宝安店'], company: '常乐健康（深圳）有限公司' },
  { city: '成都市', stores: ['成都春熙店', '成都高新店'], company: '常乐健康（成都）有限公司' },
  { city: '北京市', stores: ['北京朝阳店'], company: '常乐健康（北京）有限公司' },
  { city: '上海市', stores: ['上海静安店'], company: '常乐健康（上海）有限公司' }
]

export const cityOptions = cityStores.map(c => c.city)

export function storesOfCity(city) {
  const hit = cityStores.find(c => c.city === city)
  return hit ? hit.stores : []
}

export function allStores() {
  return cityStores.flatMap(c => c.stores)
}

/** 门店 → 所属城市（找不到返回空串，调用方按「无城市」处理） */
export function cityOfStore(store) {
  const hit = cityStores.find(c => c.stores.includes(store))
  return hit ? hit.city : ''
}

/** 门店 → 所属合同主体 */
export function companyOfStore(store) {
  const hit = cityStores.find(c => c.stores.includes(store))
  return hit ? hit.company : ''
}

/* ---------- 差异化维度 ----------
   一张可枚举的清单：一份额度方案可以声明「按哪个维度、哪些取值」与全公司不同。
   维度取值都来自别人的资产（员工档案 / 组织架构 / 岗位主数据），假勤不维护。
   rank 越大越具体，多个维度同时命中时**取 rank 最大的那一份**（见 resolveQuotaScheme）。
   顺序的业务解释：先看「在哪儿干」（门店 / 城市），再看「干什么」（岗位），
   最后看「人本身」（用工形式 / 职级 / 司龄 / 合同主体）。 */
export const diffDimensions = [
  { value: 'all', label: '标准额度', rank: 0, desc: '方案本体，全公司打底值', values: [] },
  { value: 'city', label: '城市', rank: 80, desc: '按员工在职城市', values: cityOptions },
  { value: 'store', label: '门店', rank: 100, desc: '按员工在职门店，最细的组织单元', values: [] }
]

export function dimOf(value) {
  return diffDimensions.find(d => d.value === value) || diffDimensions[0]
}

export const dimLabel = (value) => dimOf(value).label
export const dimRank = (value) => dimOf(value).rank

/** 某维度的候选取值（岗位 / 门店在岗位数据定义后填充） */
export function dimValues(value) {
  if (value === 'job') return jobWorkModes.map(m => m.job)
  if (value === 'store') return allStores()
  return dimOf(value).values || []
}

/** 司龄段（按入职日期算到 at） */
export function seniorityOf(joinedAt, at = '2026-10-21') {
  if (!joinedAt) return ''
  const years = (new Date(at) - new Date(joinedAt)) / (365.25 * 24 * 3600 * 1000)
  if (years < 1) return '不满 1 年'
  if (years < 3) return '1–3 年'
  if (years < 5) return '3–5 年'
  return '5 年以上'
}

/**
 * 从员工档案拼出画像（解析额度时喂进去的「这个人是谁」）。
 * 职级 / 用工形式 / 合同主体属于员工档案字段，本轮 mock 只给演示所需的人显式赋值，
 * 其余按默认兜底（P3 / 全日制 / 按门店所属公司），避免把档案数据再抄一遍。
 */
export function profileOf(emp) {
  if (!emp) return {}
  const store = emp.store || ''
  return {
    store,
    city: emp.city || cityOfStore(store),
    job: emp.job || '',
    grade: emp.grade || 'P3',
    employment: emp.employment || '劳动合同-全日制',
    company: emp.company || companyOfStore(store),
    seniority: emp.seniority || seniorityOf(emp.joinedAt)
  }
}

/* ============================================================
   二、假期额度方案（配置层 · 可被岗位引用的实体）
   一份方案 = 一个假种（引用假种字典主键）+ 一种计量口径：
     · 周期型 cycle：某周期内可用固定额度（年假 5 天/自然年）
     · 事件型 event：每次事件可用固定额度（婚假 3 天/次、丧假 3 天/次）
   假种全部来自假种字典，本页只给「值」，不新建假种、也不复制假种属性。
   实际发放、结转、与排班的抵扣顺序仍在现有额度模块。

   方案有三块，彼此独立：
     · 适用岗位 jobs —— 这份方案给哪些岗位用（岗位不参与差异化，只决定「有没有」）
     · 标准额度 amount —— 全公司打底值，规则（周期 / 计量 / 结转）也只有一份
     · 差异化 overrides —— 只改「数值」这一个数，维度**仅城市 / 门店**
   如「事假标准 4 天，成都市 6 天」。取值时命中的差异化覆盖 amount，
   多条同时命中按维度 rank 取最具体的一条，**不合并、不继承、不折算**；
   个人 / 岗位 / 职级等其它维度不支持差异化（按人差异化走「系统折算」）。

   差异化对**有数值**的三档都适用，改的是该档位的那个数：
     · 周期发放 → 改「标准额度」；周期上限 → 改「获取上限」；按次上限 → 改「每次上限」
   按需档没有数值，不参与差异化（无值可覆盖）。
   临时假 / 特殊情况请假都是「周期上限」，同样支持按城市 / 门店给不同的上限。

   结转 carryOver —— 值是**比例**（0 = 不结转，100 = 全额结转）：
   周期结束时按「剩余额度 × 比例」带入下一周期，作为下期额度的来源之一；其余作废。
   与本期发放 / 折算合计后，**受「获取上限」封顶**：上限档（cap）的上限就是方案里的那个数，
   周期发放档另有可选的 acquireCap（留空不限）；按次 / 按需档不结转。

   计量方式三种（值全部只在「假期额度方案」一层配置，没有岗位额度层）：
     · 周期发放 cycle —— 每周期预发固定额度给员工（年假 / 事假 / 班次假）
     · 周期上限 cap  —— 不预发，按实际获取计量、周期内封顶（临时假，系统折算）
     · 按次上限 event —— 不预发、不占周期余额，每次申请封顶（婚假 / 丧假）
   ============================================================ */
export const leaveTypeOptions = leaveTypes.map(t => ({ value: t.id, label: t.name }))

export const cycleOptions = ['自然月', '自然季', '自然年', '入职周年']

export const quotaMeasureOptions = [
  { value: 'cycle', label: '周期发放', desc: '每周期预发固定额度给员工，周期内可用，如「每自然月 4 天」' },
  { value: 'cap', label: '周期上限', desc: '不预发，按实际获取计量、周期内封顶，如临时假「每自然月 ≤ 16 小时」' },
  { value: 'event', label: '按次上限', desc: '不预发、不占周期余额，每次申请封顶，如「婚假一次 ≤ 3 天」' },
  { value: 'ondemand', label: '按需', desc: '不设额度值，按需申请；天数按法定 / 医疗口径核定，如病假按医疗期。方案只声明「岗位有这个假种」' }
]

export const quotaSchemes = [
  {
    id: 'qs-personal-4d',
    name: '事假',
    leaveTypeId: 'personal',
    jobs: ['推拿师', '客户经理', '门店店长', '前台客服', '产品经理', '后端开发', '前端开发', '运营专员', '职能支持'],
    measure: 'cycle',
    cycle: '自然月',
    amount: 4,
    unit: '天',
    carryOver: 50,
    /* 本期获取上限：发放 + 结转 的合计不得超过；留空不限 */
    acquireCap: 8,
    overrides: [
      { id: 'ov-personal-cd', dimension: 'city', values: ['成都市'], amount: 6, note: '成都门店排班弹性大，事假额度上浮到 6 天' }
    ],
    note: '',
    builtin: true,
    updatedAt: '2026-10-21'
  },
  {
    id: 'qs-sick-ondemand',
    name: '病假',
    leaveTypeId: 'sick',
    jobs: ['推拿师', '客户经理', '门店店长', '前台客服', '产品经理', '后端开发', '前端开发', '运营专员', '职能支持', '区域经理'],
    measure: 'ondemand',
    cycle: '',
    amount: null,
    unit: '天',
    carryOver: 0,
    overrides: [],
    note: '按需申请，不设额度值；天数按法定医疗期核定（随工龄），人工审核',
    builtin: true,
    updatedAt: '2026-10-22'
  },
  {
    id: 'qs-annual-5d',
    name: '年假',
    leaveTypeId: 'annual',
    jobs: ['推拿师', '客户经理', '门店店长', '前台客服', '产品经理', '后端开发', '前端开发', '运营专员', '职能支持', '区域经理'],
    measure: 'cycle',
    cycle: '自然年',
    amount: 5,
    unit: '天',
    /* 结转比例：期末剩余额度 × 50% 带入下一周期（0 = 不结转） */
    carryOver: 50,
    overrides: [
      { id: 'ov-annual-sz', dimension: 'city', values: ['深圳市'], amount: 8, note: '深圳口径高于公司基准' },
      { id: 'ov-annual-nanshan', dimension: 'store', values: ['深圳南山店'], amount: 10, note: '南山店招聘承诺 10 天' }
    ],
    note: '',
    builtin: true,
    updatedAt: '2026-09-18'
  },
  {
    id: 'qs-marriage-3d',
    name: '婚假',
    leaveTypeId: 'marriage',
    jobs: ['推拿师', '客户经理', '门店店长', '前台客服', '产品经理', '后端开发', '前端开发', '运营专员', '职能支持', '区域经理'],
    measure: 'event',
    validWithin: '领证后 12 个月内',
    amount: 3,
    unit: '天',
    carryOver: 0,
    overrides: [
      { id: 'ov-marriage-sz', dimension: 'city', values: ['深圳市'], amount: 5, note: '广东婚假口径 5 天，深圳各店按此执行' }
    ],
    note: '',
    builtin: true,
    updatedAt: '2026-09-18'
  },
  {
    id: 'qs-funeral-3d',
    name: '丧假',
    leaveTypeId: 'funeral',
    jobs: ['推拿师', '客户经理', '门店店长', '前台客服', '产品经理', '后端开发', '前端开发', '运营专员', '职能支持'],
    measure: 'event',
    validWithin: '亲属去世后 3 天内',
    amount: 3,
    unit: '天',
    carryOver: 0,
    overrides: [],
    note: '',
    builtin: true,
    updatedAt: '2026-09-18'
  },
  {
    id: 'qs-long-personal-30d',
    name: '长事假',
    leaveTypeId: 'long-personal',
    jobs: ['推拿师', '客户经理', '门店店长', '前台客服', '产品经理', '后端开发', '前端开发', '运营专员', '职能支持', '区域经理'],
    measure: 'event',
    validWithin: '',
    amount: 30,
    unit: '天',
    carryOver: 0,
    overrides: [],
    note: '连续多日的事假（连续 ≥ 7 天走长事假），每次申请上限 30 天',
    builtin: true,
    updatedAt: '2026-09-18'
  },
  {
    id: 'qs-shift-4d',
    name: '班次假',
    leaveTypeId: 'shift',
    jobs: ['推拿师', '客户经理'],
    measure: 'cycle',
    cycle: '自然月',
    amount: 4,
    unit: '天',
    carryOver: 0,
    overrides: [],
    note: '排班岗的月度休息额度，缺勤即扣',
    builtin: true,
    updatedAt: '2026-10-21'
  },
  {
    id: 'qs-temp-cap',
    name: '临时假',
    leaveTypeId: 'temp',
    measure: 'cap',
    jobs: ['推拿师'],
    cycle: '自然月',
    amount: 16,
    unit: '小时',
    /* 上限档也可结转：上期剩余 × 50%，与本期折算合计后仍受 16 小时/月 封顶 */
    carryOver: 50,
    overrides: [
      { id: 'ov-temp-cd', dimension: 'city', values: ['成都市'], amount: 24, note: '成都门店营业时段长（10:00–22:00），临时假获取上限上浮到 24 小时/月' },
      { id: 'ov-temp-nanshan', dimension: 'store', values: ['深圳南山店'], amount: 20, note: '南山店夜班占比高，上限 20 小时/月' }
    ],
    derivedFrom: '按上月业绩折算；折算值超过上限按上限计',
    note: '系统折算假种只设获取上限；历史已折算的存量不在本系统处理',
    builtin: true,
    updatedAt: '2026-10-20'
  },
  {
    id: 'qs-special-cap',
    name: '特殊情况请假',
    leaveTypeId: 'special',
    jobs: ['推拿师', '客户经理'],
    measure: 'cap',
    cycle: '自然月',
    amount: 40,
    unit: '小时',
    carryOver: 0,
    overrides: [
      { id: 'ov-special-cd', dimension: 'city', values: ['成都市'], amount: 48, note: '成都门店兜底口径高于基准，本通道上限 48 小时/月' },
      { id: 'ov-special-cm', dimension: 'store', values: ['深圳南山店'], amount: 44, note: '南山店客户经理占比高，兜底通道上限 44 小时/月' }
    ],
    derivedFrom: '历史兜底通道：依次扣班次假 → 临时假时长，剩余记为本通道',
    note: '历史大包假种示例：现状无上限，此处 40 小时/月仅为示意；重构后由事假 / 病假承接，超出部分按岗位分流（推拿师不扣薪 / 客户经理扣薪）',
    builtin: true,
    updatedAt: '2026-10-21'
  }
]

export function findQuotaScheme(id) {
  return quotaSchemes.find(q => q.id === id) || null
}

/** 同一假种的方案（新模型下一个假种只有一份，返回数组仅为兼容旧签名） */
export function schemesOfType(leaveTypeId) {
  return quotaSchemes.filter(q => q.leaveTypeId === leaveTypeId)
}

/** 方案的全部「档位」：标准额度（方案本体）+ 每条差异化，用于取值链展示 */
export function tierOfScheme(scheme) {
  if (!scheme) return []
  return [
    { id: scheme.id, scope: { dimension: 'all', values: [] }, amount: scheme.amount, unit: scheme.unit,
      measure: scheme.measure, cycle: scheme.cycle, base: true },
    ...(scheme.overrides || []).map(o => ({
      id: o.id, scope: { dimension: o.dimension, values: o.values }, amount: o.amount, unit: scheme.unit,
      measure: scheme.measure, cycle: scheme.cycle, note: o.note, base: false
    }))
  ]
}

/** 差异化维度的文字表达：全公司 / 门店 · 深圳南山店 / 职级 · P4、P5 */
export function scopeText(scope) {
  if (!scope || scope.dimension === 'all') return '全公司'
  const label = dimLabel(scope.dimension)
  const list = scope.values || []
  return list.length ? `${label} · ${list.join('、')}` : `${label} · 未指定`
}

/**
 * 按员工画像解析某假种最终生效的额度。
 * 标准额度打底；命中的差异化只覆盖 amount（规则不变）。
 * 多条差异化同时命中：按维度 rank 取最具体的一份（rule='best' 时取额度最大、等值再取最具体）。
 * 命中即停 —— **不合并、不继承、不折算**。
 * 不给画像时返回标准额度，作为岗位页 / 方案库的基准展示。
 */
export function resolveQuotaScheme(leaveTypeId, profile = null, rule = 'specific') {
  const scheme = quotaSchemes.find(q => q.leaveTypeId === leaveTypeId)
  if (!scheme) return { scheme: null, dimension: 'none', rank: -1, alsoMatched: [] }

  const tiers = tierOfScheme(scheme)
  let matched = []
  if (profile) {
    matched = tiers
      .filter(t => !t.base)
      .filter(t => (t.scope.values || []).includes(profile[t.scope.dimension]))
      .sort((a, b) => dimRank(b.scope.dimension) - dimRank(a.scope.dimension))
    if (matched.length > 1 && rule === 'best') {
      const top = [...matched].sort((a, b) =>
        (b.amount - a.amount) || (dimRank(b.scope.dimension) - dimRank(a.scope.dimension)))[0]
      matched = [top, ...matched.filter(t => t.id !== top.id)]
    }
  }

  const hit = matched[0] || tiers.find(t => t.base)
  return {
    /* scheme 拷贝带上解析后的额度，消费方直接读 amount */
    scheme: { ...scheme, amount: hit.amount, unit: hit.unit, resolvedTierId: hit.id },
    tier: hit,
    dimension: hit.scope.dimension,
    rank: dimRank(hit.scope.dimension),
    alsoMatched: matched.slice(1)
  }
}

/** 一个假种的全部档位（标准档在前，差异化按声明顺序），用于「为什么是这个数」的展示 */
export function quotaChainOf(leaveTypeId) {
  const scheme = quotaSchemes.find(q => q.leaveTypeId === leaveTypeId)
  return tierOfScheme(scheme)
}

/** 某个员工画像下全部假种的最终生效值（字典里有、但没有方案的假种不出现） */
export function resolvedQuotasAt(profile = null, rule = 'specific') {
  return leaveTypes
    .map(t => {
      const r = resolveQuotaScheme(t.id, profile, rule)
      if (!r.scheme) return null
      /* 适用岗位不含这个岗位 → 该员工没有这个假种额度 */
      if (profile && profile.job && !(r.scheme.jobs || []).includes(profile.job)) return null
      return { ...r.scheme, leaveTypeName: t.name, resolvedDimension: r.dimension, alsoMatched: r.alsoMatched }
    })
    .filter(Boolean)
}

/** 额度条目对外的假种名：方案走字典主键，岗位额度直接带名称 */
export function quotaTypeName(entry) {
  if (!entry) return ''
  if (entry.leaveTypeId) {
    const hit = leaveTypes.find(t => t.id === entry.leaveTypeId)
    return hit ? hit.name : entry.leaveTypeId
  }
  return entry.name || ''
}

/** 某岗位适用的额度方案（由方案的「适用岗位」声明，岗位侧不再单独维护假种清单） */
export function schemesOfJob(job) {
  return quotaSchemes.filter(s => (s.jobs || []).includes(job))
}

/**
 * 岗位的完整额度清单 = 系统折算假种的合成条目（读方案库里的「周期上限」方案）
 * + 适用该岗位的其余额度方案（按假种）。
 * 「有哪些假种」由字典适用性与方案适用岗位决定；「给多少」按员工画像（城市 / 门店）解析 ——
 * 传 profile 得这个人的值，不传得标准额度。上限方案同样按画像解档。
 */
export function quotaEntriesOf(mode, profile = null) {
  if (!mode) return []
  const derived = leaveTypes
    .filter(t => t.quotaSource === 'derived' && (t.appJobs || []).includes(mode.job))
    .map(t => derivedEntryOf(t, profile))
    .filter(Boolean)
  const refs = schemesOfJob(mode.job)
    .filter(s => s.measure !== 'cap') // 上限方案不预发，已由 derived 合成条目表达
    .map(s => {
      const r = resolveQuotaScheme(s.leaveTypeId, profile)
      return r.scheme ? { ...r.scheme, resolvedDimension: r.dimension, alsoMatched: r.alsoMatched } : null
    })
    .filter(Boolean)
  return [...derived, ...refs]
}

/** 系统折算假种的「获取上限」：读方案库里的「周期上限」方案（measure: 'cap'），上限归假期额度方案管 */
export function quotaCapOf(leaveTypeId) {
  return quotaSchemes.find(q => q.leaveTypeId === leaveTypeId && q.measure === 'cap') || null
}

/**
 * 系统折算假种的合成条目（余额列表里那一行）。
 * 上限方案同样带差异化：给 profile 就按城市 / 门店解档，不给就是标准上限。
 */
function derivedEntryOf(type, profile = null) {
  const cap = quotaCapOf(type.id)
  if (!cap) return null
  const r = resolveQuotaScheme(type.id, profile)
  const hit = r.scheme || cap
  return {
    id: 'qt-' + type.id,
    leaveTypeId: type.id,
    name: type.name,
    measure: 'cycle',
    cycle: cap.cycle,
    amount: hit.amount,
    capAmount: cap.amount,
    unit: cap.unit,
    /* 上限档也带结转配置：结转后与本期折算合计仍按 capAmount 封顶 */
    carryOver: cap.carryOver || 0,
    acquireCap: cap.acquireCap ?? null,
    derived: true,
    resolvedDimension: r.dimension,
    alsoMatched: r.alsoMatched,
    derivedFrom: cap.derivedFrom || '按上月业绩折算；历史已折算的存量不在本系统处理',
    builtin: true
  }
}

/** 按 id 找额度条目（方案库 → 字典「系统折算」假种的合成条目）；给了 profile 就按画像解档 */
export function findQuotaEntry(id, profile = null) {
  const inLibrary = quotaSchemes.find(q => q.id === id)
  if (inLibrary) {
    const r = resolveQuotaScheme(inLibrary.leaveTypeId, profile)
    return r.scheme ? { ...r.scheme, resolvedDimension: r.dimension, alsoMatched: r.alsoMatched } : inLibrary
  }
  const derived = leaveTypes.find(t => t.quotaSource === 'derived' && 'qt-' + t.id === id)
  return derived ? derivedEntryOf(derived, profile) : null
}

/** 这个假种的额度方案适用于哪些岗位（读方案自身的适用岗位声明） */
export function jobsUsingQuotaType(leaveTypeId) {
  const s = quotaSchemes.find(q => q.leaveTypeId === leaveTypeId)
  return s ? [...(s.jobs || [])] : []
}

/** 「假期额度方案」可选的假种：全部假种（每个假种一份方案，值都在这一层） */
export const schemeLeaveTypeOptions = leaveTypeOptions.map(o => {
  const t = leaveTypes.find(x => x.id === o.value)
  return t
    ? { value: t.id, label: t.name, quotaSource: t.quotaSource, appJobs: [...(t.appJobs || [])] }
    : null
}).filter(Boolean)

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
   三、岗位假勤方案（声明层）
   每个岗位：引用一份出勤方案（可空）、引用一个考勤组（可空），并声明自己的额度与连带。
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
    jobQuotas: [
      {
        id: 'qs-shift-4d',
        leaveTypeId: 'shift',
        name: '班次假',
        measure: 'cycle',
        cycle: '自然月',
        amount: 4,
        unit: '天',
        carryOver: 0,
        note: '排班岗的月度休息额度，缺勤即扣',
        builtin: true
      }
    ],
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
    jobQuotas: [
      {
        id: 'qs-shift-4d',
        leaveTypeId: 'shift',
        name: '班次假',
        measure: 'cycle',
        cycle: '自然月',
        amount: 4,
        unit: '天',
        carryOver: 0,
        note: '只有班次假，无临时假',
        builtin: true
      }
    ],
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
   四、假期审核规则（声明层 · 挂在岗位上）
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
   六、差异化维度的优先级（用于说明「为什么是这个数」）
   从宽到窄：全公司 → 合同主体 → 司龄段 → 职级 → 用工形式 → 岗位 → 城市 → 门店。
   一个人可能同时命中多档（如南山店的 P4 推拿师：门店档、职级档都命中），
   只取 rank 最大的那一份，其余档位仅作为「被覆盖」的提示展示。
   ============================================================ */
export const inheritDemo = [
  { layer: '全公司', scope: '全公司', rule: '年假 5 天 / 自然年', tone: 'base' },
  { layer: '职级', scope: 'P4 及以上', rule: '年假 12 天', tone: 'tighten' },
  { layer: '城市', scope: '深圳市', rule: '年假 8 天', tone: 'tighten' },
  { layer: '门店', scope: '深圳南山店', rule: '年假 10 天（同时命中职级档，只取本档）', tone: 'tighten' }
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
    detail: '已采纳：额度抽成「假期额度方案」—— 周期型（某周期内几天，如年假 5 天/自然年）+ 事件型（每次事件几天，如婚假 3 天/次），假种引用字典主键、可被岗位复用。岗位私有的月度工时额度（班次假 / 临时假）不做方案，直接声明在岗位上。'
  },
  {
    id: 'Q2',
    title: '「要不要打卡」归属：声明在岗位还是考勤组',
    detail: '定稿：只放在岗位声明（同一门店，推拿师不打卡、客户经理打卡），考勤组只做定义（名称 / 打卡方式 / 有效范围），不自持成员口径 —— 被哪些岗位引用是结果，只在考勤组页只读展示。'
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
