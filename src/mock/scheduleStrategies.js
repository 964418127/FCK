/**
 * 排班策略中心的选项目录与已配置策略（纯数据，node 可直接 import，不引 vue）。
 *
 * 抽象口径：岗位不是分支，是参数取值 —— 一条「排班策略」= 10 个槽位的一组取值：
 *   ① 适用人群 ② 生效范围（通用/城市/门店/个人 + 具体对象） ③ 生成计划（cron / 业务事件 / 手动）
 *   ④ 班次时段（时段是原子：名称 + 起止 + 休息 + 净工时 + 名额 + 必选；没有「无时段」的班次）
 *   ⑤ 名额规则（算法 + 指标口径 + 钳制 + 试算 + 生成后可改）
 *   ⑥ 承接顺位（有序档位：人群 + 承接方式 + 细分规则 + 适用时段 + 开放起点 + 名额）
 *   ⑦ 优先级（有序规则，作用于自选/审核档位） ⑧ 缺口响应 ⑨ 兜底动作
 *   ⑩ 工时约束（维度 × 上限 × 计入口径 × 超限处置：硬拦 / 审批 / 计加班 / 提示）
 * 没有预置模板 —— 列表里每条策略都是用这套槽位配置出来的。
 */

export const POSITIONS = ['客户经理', '推拿师', '全栈工程师', '保洁', '城市总', '产品经理']
export const COOPERATIONS = ['全日制', '非全', '储备']

/* ========== ② 生效范围：层级 + 具体对象 ========== */
export const SCOPE_LEVELS = [
  { value: 'global', label: '通用（全公司）' },
  { value: 'city', label: '城市' },
  { value: 'store', label: '门店' },
  { value: 'person', label: '个人' }
]
// 演示用组织目录（真实系统取主数据）
export const ORG_CITIES = ['长沙', '成都', '杭州', '北京']
export const ORG_STORES = [
  { id: 'xl', name: '兴隆湖店', city: '长沙' },
  { id: 'ls', name: '麓山店', city: '长沙' },
  { id: 'tf', name: '天府店', city: '成都' },
  { id: 'xh', name: '西湖店', city: '杭州' },
  { id: 'wj', name: '望京店', city: '北京' }
]
export const ORG_PEOPLE = [
  { id: 100, name: '杨小雪', position: '非全客户经理', store: '兴隆湖店' },
  { id: 101, name: '王芳', position: '非全客户经理', store: '兴隆湖店' },
  { id: 104, name: '陈静', position: '非全客户经理', store: '麓山店' },
  { id: 105, name: '周敏', position: '非全推拿师', store: '兴隆湖店' },
  { id: 106, name: '刘洋', position: '全职推拿师', store: '兴隆湖店' },
  { id: 108, name: '孙磊', position: '全职推拿师', store: '麓山店' }
]

/* ========== ③ 生成计划：触发方式 ========== */
// 定时也是一类事件：到 cron 指定时刻触发；与「业务事件」区分开
export const TRIGGER_TYPES = [
  { value: 'cron', label: '定时（cron）' },
  { value: 'event', label: '业务事件' },
  { value: 'manual', label: '手动' }
]
export const CRON_FREQS = [
  { value: 'daily', label: '每天' },
  { value: 'weekly', label: '每周' },
  { value: 'monthly', label: '每月' },
  { value: 'yearly', label: '每年' }
]
export const WEEKDAYS = [
  { value: 1, label: '周一' }, { value: 2, label: '周二' }, { value: 3, label: '周三' },
  { value: 4, label: '周四' }, { value: 5, label: '周五' }, { value: 6, label: '周六' }, { value: 0, label: '周日' }
]
export const EVENT_OPTIONS = ['签约生效', '休假审批通过', '离职办结', '编制缺口出现', '临时时段创建', '入职审批通过']
export const AHEAD_UNITS = ['天', '周', '月']
export const SPANS = ['周', '月', '自定义']

/** cron 表达式：分 时 日 月 周 */
export const cronOf = (t) => {
  if (!t || t.type !== 'cron') return ''
  const [h, m] = String(t.time || '00:00').split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return ''
  if (t.freq === 'daily') return `${m} ${h} * * *`
  if (t.freq === 'weekly') return `${m} ${h} * * ${(t.weekdays || []).slice().sort().join(',')}`
  if (t.freq === 'monthly') return `${m} ${h} ${t.monthDay === 'last' ? 'L' : t.monthDay} * *`
  if (t.freq === 'yearly') return `${m} ${h} ${t.monthDayYear} ${t.month} *`
  return ''
}

/** 定时规则的人话摘要 */
export const cronSummary = (t) => {
  if (!t || t.type !== 'cron') return ''
  const wd = ['日', '一', '二', '三', '四', '五', '六']
  const time = t.time || ''
  if (t.freq === 'daily') return `每天 ${time}`
  if (t.freq === 'weekly') return `每${(t.weekdays || []).slice().sort().map(d => '周' + wd[d]).join('、')} ${time}`
  if (t.freq === 'monthly') return `每月${t.monthDay === 'last' ? '最后一天' : ` ${t.monthDay} 日`} ${time}`
  if (t.freq === 'yearly') return `每年 ${t.month} 月 ${t.monthDayYear} 日 ${time}`
  return ''
}

/** 生成计划在列表页的一句摘要 */
export const triggerSummary = (s) => {
  const t = s.trigger || {}
  let when
  if (t.type === 'cron') when = cronSummary(t)
  else if (t.type === 'event') when = `业务事件：${(t.events || []).join('、') || '未选择'}`
  else when = '手动'
  const ahead = t.ahead ? `生成往后 ${t.ahead.count} 个${t.ahead.unit}` : ''
  return [when, ahead].filter(Boolean).join(' · ')
}

/* ========== ④ 班次时段 ========== */
/**
 * 时段来源：所有班次都有时间，区别只在「起止从哪来」——
 * 营业时段随门店营业时间走、固定时刻写死在策略里（行政班 09:00–18:00）、
 * 时段需求由门店的需求单展开（非全）。没有「无时段」这种班次。
 */
export const TIME_SOURCES = [
  { value: 'store', label: '营业时段（按门店营业时间逐店展开）' },
  { value: 'fixed', label: '固定时刻（本策略写死，如行政班 09:00–18:00）' },
  { value: 'demand', label: '门店时段需求（由需求单展开，非全）' }
]

/** "HH:mm" → 分钟数 */
export const minutesOf = (hhmm) => {
  if (!hhmm) return null
  const [h, m] = String(hhmm).split(':').map(Number)
  return Number.isNaN(h) || Number.isNaN(m) ? null : h * 60 + m
}

/** 净工时（小时）= 止 − 起 − 休息；起止不全时返回 null（按门店展开后才算得出） */
export const slotNetHours = (slot) => {
  const s = minutesOf(slot?.start)
  const e = minutesOf(slot?.end)
  if (s == null || e == null || e <= s) return null
  const net = e - s - (Number(slot.breakMin) || 0)
  return net <= 0 ? 0 : Math.round((net / 60) * 10) / 10
}

/** 时段表摘要（列表页/卡片头用） */
export const structureSummary = (s) => {
  const st = s.shiftStructure || {}
  const slots = st.slots || []
  if (!slots.length) return '未配置时段'
  const parts = slots.map(x => {
    const net = slotNetHours(x)
    return net == null ? x.name : `${x.name} ${net}h`
  })
  return `${labelOf(TIME_SOURCES, st.timeSource)} · ${parts.join(' / ')}`
}

/* ========== ⑤ 名额规则 ========== */
export const QUOTA_ALGOS = [
  { value: 'slot-fixed', label: '按班次时段手填' },
  { value: 'establishment', label: '编制型' },
  { value: 'workload', label: '业务量阈值型' },
  { value: 'ratio', label: '比例型' },
  { value: 'headcount-form', label: '形态规则型' }
]
export const EST_SOURCES = ['门店配置', '城市配置', '部门编制']
export const WORKLOAD_METRICS = ['门店天均分钟数', '门店营业面积（㎡）', '传位数', '客流量']
export const WORKLOAD_WINDOWS = ['上周四与上上周四平均', '上一周平均', '上一月平均', '当天实时']
export const RATIO_BASES = ['门店签约非全人数', '门店营业面积（㎡）']
export const ROUNDINGS = ['向上取整', '向下取整', '四舍五入']

/**
 * 名额试算：拿一个门店的指标值跑一遍算法，看会释放几个名额。
 * 算法只产出原始值，最终名额一律过钳制（保底 / 封顶）——这是合理性的第一道闸。
 */
export const simulateRelease = (quota, sample) => {
  if (!quota || sample === null || sample === undefined || sample === '') return null
  const clamp = quota.clamp || {}
  const min = Number(clamp.min) || 0
  const max = clamp.max === null || clamp.max === undefined || clamp.max === '' ? 99 : Number(clamp.max)
  const value = Number(sample)
  if (Number.isNaN(value)) return null
  let raw = null
  let basis = ''
  if (quota.algo === 'workload') {
    const list = [...(quota.thresholds || [])].sort((a, b) => a.value - b.value)
    const hit = list.find(t => value < t.value)
    raw = hit ? hit.release : max
    basis = hit ? `命中「低于 ${hit.value} 释放 ${hit.release}」` : '高于全部阈值，释放到上限'
  } else if (quota.algo === 'ratio') {
    const divisor = Number(quota.divisor) || 1
    const v = value / divisor
    raw = quota.rounding === '向下取整' ? Math.floor(v) : quota.rounding === '四舍五入' ? Math.round(v) : Math.ceil(v)
    basis = `${value} ÷ ${divisor} → ${quota.rounding}`
  } else if (quota.algo === 'establishment') {
    raw = value
    basis = '按编制缺口数释放'
  } else {
    return null
  }
  const released = Math.min(Math.max(raw, min), max)
  return { raw, released, clamped: released !== raw, basis }
}

/* ========== ⑥ 承接顺位：有序档位（同非全分配策略的结构） ========== */
export const CROWD_OPTIONS = [
  '本店全职客户经理',
  '本店储备客户经理',
  '本店非全客户经理',
  '本店全职推拿师',
  '本店非全推拿师',
  '同城市同岗位',
  '指定人员'
]
export const TAKEOVER_METHODS = [
  { value: 'assign', label: '系统指派' },
  { value: 'self-audit', label: '自选 + 审核' },
  { value: 'self-grab', label: '自选（先到先得）' }
]
export const METHOD_RULES = {
  assign: ['按上周倒班轮转', '缺口补位', '固定驻场', '默认在岗', '按签约顺序指定'],
  'self-audit': ['自选 + 审核排序', '自选 + 逐单审批'],
  'self-grab': ['先到先得', '先到先得 + 资格校验']
}
export const OPEN_FROMS = ['立即', '发布即可见', '排班日 3 天前 06:00', '排班日 1 天前 06:00', '排班日当天 00:00']
export const NO_TAKER_ACTIONS = ['留空', '转临时时段', '并入相邻时段', '生成通班', '触发招聘', '不做处理', '待定']

/* ========== ⑦ 优先级：有序规则档位 ========== */
export const PRIORITY_KINDS = [
  { value: 'composite', label: '综合分（多指标加权）' },
  { value: 'metric', label: '单指标' },
  { value: 'first-come', label: '先到先得' }
]
export const PRIORITY_METRICS = ['产值', '回头率', '预约率', '综合评分', '入店时间', '工号']
export const PRIORITY_DIRS = [
  { value: 'desc', label: '降序（高者优先）' },
  { value: 'asc', label: '升序（低者优先）' }
]
export const TAIL_ACTIONS = [
  { value: 'none', label: '无' },
  { value: 'squeeze', label: '末位挤出' },
  { value: 'waitlist', label: '进入候补' }
]

/* ========== ⑧ 缺口响应 ========== */
export const GAP_TYPES = ['临时休假', '永久离职', '审核落选', '名额无人接']
export const GAP_ACTIONS = [
  { value: 'none', label: '不处理' },
  { value: 'reshape', label: '班次变形' },
  { value: 'substitute', label: '人群补位' },
  { value: 'recruit', label: '触发招聘' },
  { value: 'temp-slot', label: '转临时时段' },
  { value: 'reopen', label: '重开自选窗口' }
]
export const SUBSTITUTE_CROWDS = ['本店储备客户经理', '本店同岗位', '同城市同岗位', '本店非全', '城市非全']
export const SUBSTITUTE_ORDERS = ['最早入店优先', '最早签约优先', '工号优先', '就近优先', '指定人员']
export const NOGAP_ACTIONS = ['自转（不占名额）', '不处理', '按正式倒班轮转']
export const RESHAPE_RESULTS = ['长班（长早/长晚）', '通班', '按配置人数派生（长班/通班）']

/* ========== ⑨ 兜底 ========== */
export const FALLBACKS = ['生成通班', '留空', '留在待派发', '无', '待定']

/* ========== ⑩ 工时约束：人一天/一周能干多久 ========== */
export const WORK_HOUR_DIMS = [
  { value: 'store-day', label: '单店单日' },
  { value: 'all-day', label: '跨店单日合计' },
  { value: 'week', label: '单周' },
  { value: 'month', label: '单月' }
]
export const WORK_HOUR_BASIS = [
  { value: 'net', label: '净工时' },
  { value: 'span', label: '含休息（跨度）' }
]
/** 超限处置：非全是硬规则，办公岗超 8 小时就是加班——都是同一张表的取值 */
export const EXCEED_ACTIONS = [
  { value: 'block', label: '硬拦（不可承接）' },
  { value: 'approve', label: '需审批后承接' },
  { value: 'overtime', label: '允许，计为加班' },
  { value: 'warn', label: '仅提示，不拦' }
]

export const labelOf = (list, value) => {
  const hit = (list || []).find(item => (item.value || item) === value)
  return hit ? (hit.label || hit) : value
}

/** 生效范围摘要：层级 + 具体对象 */
export const scopeSummary = (s) => {
  const t = s.scopeTargets || {}
  const level = s.scopeLevel
  if (level === 'global') return '通用（全公司）'
  const names = level === 'city'
    ? (t.cities || [])
    : level === 'store'
      ? (t.stores || []).map(id => (ORG_STORES.find(x => x.id === id) || {}).name || id)
      : (t.people || []).map(id => (ORG_PEOPLE.find(x => x.id === id) || {}).name || id)
  return `${labelOf(SCOPE_LEVELS, level)}：${names.join('、') || '未选择'}`
}

/** 承接顺位摘要 */
export const assignSummary = (s) => {
  const tiers = s.tiers || []
  if (!tiers.length) return '未配置顺位'
  const first = labelOf(TAKEOVER_METHODS, tiers[0].method)
  return tiers.length === 1 ? first : `${first} 等 ${tiers.length} 档`
}

/** 工时约束摘要 */
export const workHourSummary = (s) => {
  const list = s.workHours || []
  if (!list.length) return '未设约束'
  return list
    .map(c => `${labelOf(WORK_HOUR_DIMS, c.dim)} ${c.limit}h ${labelOf(EXCEED_ACTIONS, c.onExceed)}`)
    .join('；')
}

/* ==========================================================================
 * 已配置策略 —— 每一条都是 10 槽位的一组完整取值
 * ========================================================================== */
const seed = [
  {
    id: 'SS-001',
    name: '全日制客户经理',
    enabled: true,
    position: '客户经理',
    cooperation: '全日制',
    scopeLevel: 'store',
    scopeTargets: { cities: [], stores: ['xl', 'ls'], people: [] },
    scopeDesc: '每店按本店营业时间展开',
    trigger: { type: 'cron', freq: 'weekly', weekdays: [4], time: '06:00', manualAllowed: false, span: '周', ahead: { count: 1, unit: '周' } },
    shiftStructure: {
      timeSource: 'store',
      slots: [
        { name: '早班', start: '', end: '', breakMin: 0, seats: null, required: false },
        { name: '晚班', start: '', end: '', breakMin: 0, seats: null, required: false },
        { name: '中班', start: '', end: '', breakMin: 0, seats: null, required: false },
        { name: '全天班', start: '12:00', end: '22:00', breakMin: 0, seats: 1, required: false }
      ]
    },
    quota: {
      algo: 'headcount-form', editable: true,
      clamp: { min: 0, max: 1 },
      adjustRange: 0,
      forms: [
        { headcount: 1, combo: ['全天班'] },
        { headcount: 2, combo: ['早班', '晚班'] },
        { headcount: 3, combo: ['早班', '晚班', '中班'] }
      ]
    },
    tiers: [
      { crowd: '本店全职客户经理', method: 'assign', rule: '按上周倒班轮转', slots: ['早班', '晚班', '中班', '全天班'], openFrom: '立即', seats: null },
      { crowd: '本店储备客户经理', method: 'assign', rule: '缺口补位', slots: ['早班', '晚班', '中班', '全天班'], openFrom: '立即', seats: null },
      { crowd: '本店非全客户经理', method: 'self-grab', rule: '先到先得 + 资格校验', slots: ['早班', '晚班', '中班', '全天班'], openFrom: '发布即可见', seats: null },
      { crowd: '同城市同岗位', method: 'self-grab', rule: '先到先得', slots: ['早班', '晚班'], openFrom: '排班日 1 天前 06:00', seats: null }
    ],
    noTaker: '转临时时段',
    priority: { enabled: false, rules: [] },
    gapRules: [
      { gapType: '临时休假', action: 'reshape', reshapeResult: '按配置人数派生（长班/通班）', note: '' },
      { gapType: '临时休假', action: 'substitute', crowd: '本店储备客户经理', order: '最早入店优先', noGap: '自转（不占名额）', note: '配置数有缺才补；无缺由储备自转' }
    ],
    fallback: '生成通班',
    workHours: [
      { dim: 'store-day', limit: 10, basis: 'net', onExceed: 'overtime' },
      { dim: 'week', limit: 44, basis: 'net', onExceed: 'overtime' }
    ],
    updatedAt: '2026-11-11 18:45'
  },
  {
    id: 'SS-002',
    name: '全日制推拿师',
    enabled: true,
    position: '推拿师',
    cooperation: '全日制',
    scopeLevel: 'store',
    scopeTargets: { cities: [], stores: ['xl', 'ls'], people: [] },
    scopeDesc: '名额按门店业务量算',
    trigger: { type: 'cron', freq: 'weekly', weekdays: [4], time: '06:00', manualAllowed: false, span: '周', ahead: { count: 1, unit: '周' } },
    shiftStructure: {
      timeSource: 'store',
      slots: [
        { name: '早班', start: '', end: '', breakMin: 0, seats: null, required: false },
        { name: '晚班', start: '', end: '', breakMin: 0, seats: null, required: false }
      ]
    },
    quota: {
      algo: 'workload', editable: true,
      metric: '门店天均分钟数', window: '上周四与上上周四平均',
      clamp: { min: 1, max: 3 },
      adjustRange: 1,
      thresholds: [{ value: 420, release: 1 }, { value: 600, release: 2 }]
    },
    tiers: [
      { crowd: '本店全职推拿师', method: 'self-audit', rule: '自选 + 审核排序', slots: ['早班', '晚班'], openFrom: '发布即可见', seats: null },
      { crowd: '同城市同岗位', method: 'self-grab', rule: '先到先得', slots: ['早班', '晚班'], openFrom: '排班日 1 天前 06:00', seats: null }
    ],
    noTaker: '生成通班',
    priority: {
      enabled: true,
      rules: [
        { kind: 'composite', parts: [{ metric: '产值', weight: 40 }, { metric: '回头率', weight: 30 }, { metric: '预约率', weight: 30 }], dir: 'desc', tail: 'none' },
        { kind: 'metric', metric: '回头率', dir: 'desc', tail: 'squeeze' }
      ]
    },
    gapRules: [
      { gapType: '审核落选', action: 'reopen', note: '周五可再抢有名额的班次' }
    ],
    fallback: '生成通班',
    workHours: [
      { dim: 'store-day', limit: 10, basis: 'net', onExceed: 'overtime' },
      { dim: 'week', limit: 44, basis: 'net', onExceed: 'overtime' }
    ],
    updatedAt: '2026-11-11 18:45'
  },
  {
    id: 'SS-003',
    name: '非全客户经理',
    enabled: true,
    position: '客户经理',
    cooperation: '非全',
    scopeLevel: 'store',
    scopeTargets: { cities: [], stores: ['xl', 'ls'], people: [] },
    scopeDesc: '签约门店的时段需求',
    trigger: { type: 'cron', freq: 'weekly', weekdays: [4], time: '06:00', manualAllowed: true, span: '周', ahead: { count: 1, unit: '周' } },
    shiftStructure: {
      timeSource: 'demand',
      slots: [
        { name: '周期时段', start: '', end: '', breakMin: 0, seats: 3, required: false },
        { name: '临时时段', start: '', end: '', breakMin: 0, seats: null, required: false }
      ]
    },
    quota: { algo: 'slot-fixed', editable: true, personalMode: true, clamp: { min: 0, max: 6 } },
    tiers: [
      { crowd: '本店非全客户经理', method: 'self-grab', rule: '先到先得 + 资格校验', slots: ['周期时段'], openFrom: '发布即可见', seats: null },
      { crowd: '本店非全推拿师', method: 'self-grab', rule: '先到先得', slots: ['周期时段'], openFrom: '排班日 3 天前 06:00', seats: null },
      { crowd: '本店全职推拿师', method: 'self-grab', rule: '先到先得', slots: ['周期时段'], openFrom: '排班日 1 天前 06:00', seats: null }
    ],
    noTaker: '转临时时段',
    priority: { enabled: false, rules: [] },
    gapRules: [
      { gapType: '名额无人接', action: 'temp-slot', crowd: '本店非全客户经理', order: '最早签约优先', note: '自动派；也可指定人员' }
    ],
    fallback: '留在待派发',
    workHours: [
      { dim: 'store-day', limit: 4, basis: 'net', onExceed: 'block' },
      { dim: 'week', limit: 24, basis: 'net', onExceed: 'block' }
    ],
    updatedAt: '2026-11-11 18:45'
  },
  {
    id: 'SS-004',
    name: '非全推拿师',
    enabled: true,
    position: '推拿师',
    cooperation: '非全',
    scopeLevel: 'store',
    scopeTargets: { cities: [], stores: ['xl', 'ls'], people: [] },
    scopeDesc: '按签约情况生成',
    trigger: { type: 'manual', manualAllowed: true, span: '周', ahead: { count: 1, unit: '周' } },
    shiftStructure: {
      timeSource: 'fixed',
      slots: [
        { name: '必选·早', start: '10:00', end: '14:00', breakMin: 0, seats: null, required: true },
        { name: '必选·晚', start: '18:00', end: '22:00', breakMin: 0, seats: null, required: true },
        { name: '常规', start: '14:00', end: '18:00', breakMin: 0, seats: null, required: false }
      ]
    },
    quota: {
      algo: 'ratio', editable: true, personalMode: true,
      base: '门店签约非全人数', divisor: 2, rounding: '向上取整',
      clamp: { min: 0, max: 4 },
      secondary: { base: '传位数', per: 1 }
    },
    tiers: [
      { crowd: '本店非全推拿师', method: 'self-grab', rule: '先到先得', slots: ['必选·早', '必选·晚', '常规'], openFrom: '发布即可见', seats: null }
    ],
    noTaker: '待定',
    priority: { enabled: false, rules: [] },
    gapRules: [],
    fallback: '待定',
    workHours: [
      { dim: 'store-day', limit: 4, basis: 'net', onExceed: 'block' },
      { dim: 'week', limit: 24, basis: 'net', onExceed: 'block' }
    ],
    updatedAt: '2026-11-11 18:45'
  },
  {
    id: 'SS-005',
    name: '全栈工程师',
    enabled: true,
    position: '全栈工程师',
    cooperation: '全日制',
    scopeLevel: 'global',
    scopeTargets: { cities: [], stores: [], people: [] },
    scopeDesc: '研发不区分城市门店',
    trigger: { type: 'cron', freq: 'monthly', monthDay: 25, time: '10:00', manualAllowed: false, span: '月', ahead: { count: 1, unit: '月' } },
    shiftStructure: {
      timeSource: 'fixed',
      slots: [
        { name: '行政班', start: '09:00', end: '18:00', breakMin: 60, seats: 1, required: true }
      ]
    },
    quota: { algo: 'establishment', editable: false, estSource: '部门编制', releaseWhenVacant: false, clamp: { min: 0, max: 1 } },
    tiers: [
      { crowd: '指定人员', method: 'assign', rule: '默认在岗', slots: ['行政班'], openFrom: '立即', seats: null }
    ],
    noTaker: '不做处理',
    priority: { enabled: false, rules: [] },
    gapRules: [
      { gapType: '临时休假', action: 'none', note: '项目自组织，不补人' },
      { gapType: '永久离职', action: 'recruit', note: '走招聘流程补编' }
    ],
    fallback: '无',
    workHours: [
      { dim: 'store-day', limit: 8, basis: 'net', onExceed: 'overtime' },
      { dim: 'week', limit: 40, basis: 'net', onExceed: 'overtime' }
    ],
    updatedAt: '2026-11-11 18:45'
  },
  {
    id: 'SS-006',
    name: '保洁',
    enabled: true,
    position: '保洁',
    cooperation: '全日制',
    scopeLevel: 'city',
    scopeTargets: { cities: ['长沙'], stores: [], people: [] },
    scopeDesc: '城市内跨店机动',
    trigger: { type: 'cron', freq: 'weekly', weekdays: [4], time: '06:00', manualAllowed: false, span: '周', ahead: { count: 1, unit: '周' } },
    shiftStructure: {
      timeSource: 'store',
      slots: [
        { name: '早班', start: '', end: '', breakMin: 0, seats: null, required: false },
        { name: '晚班', start: '', end: '', breakMin: 0, seats: null, required: false }
      ]
    },
    quota: {
      algo: 'ratio', editable: true,
      base: '门店营业面积（㎡）', divisor: 120, rounding: '向下取整',
      clamp: { min: 1, max: 3 }
    },
    tiers: [
      { crowd: '同城市同岗位', method: 'assign', rule: '固定驻场', slots: ['早班', '晚班'], openFrom: '立即', seats: null }
    ],
    noTaker: '留空',
    priority: { enabled: false, rules: [] },
    gapRules: [
      { gapType: '临时休假', action: 'substitute', crowd: '同城市同岗位', order: '就近优先', note: '同城其他门店保洁顶班' },
      { gapType: '永久离职', action: 'recruit', note: '走招聘流程补编' }
    ],
    fallback: '留空',
    workHours: [
      { dim: 'store-day', limit: 8, basis: 'net', onExceed: 'overtime' },
      { dim: 'week', limit: 44, basis: 'net', onExceed: 'overtime' }
    ],
    updatedAt: '2026-11-11 18:45'
  },
  {
    id: 'SS-007',
    name: '城市总',
    enabled: true,
    position: '城市总',
    cooperation: '全日制',
    scopeLevel: 'city',
    scopeTargets: { cities: ['长沙', '成都'], stores: [], people: [] },
    scopeDesc: '一城一条',
    trigger: { type: 'cron', freq: 'monthly', monthDay: 25, time: '10:00', manualAllowed: false, span: '月', ahead: { count: 1, unit: '月' } },
    shiftStructure: {
      timeSource: 'fixed',
      slots: [
        { name: '行政班', start: '09:00', end: '18:00', breakMin: 60, seats: 1, required: true }
      ]
    },
    quota: { algo: 'establishment', editable: false, estSource: '城市配置', releaseWhenVacant: false, clamp: { min: 1, max: 1 } },
    tiers: [
      { crowd: '指定人员', method: 'assign', rule: '默认在岗', slots: ['行政班'], openFrom: '立即', seats: null }
    ],
    noTaker: '不做处理',
    priority: { enabled: false, rules: [] },
    gapRules: [
      { gapType: '临时休假', action: 'none', note: '职责可由总部代管，不补人' },
      { gapType: '永久离职', action: 'recruit', note: '走招聘流程补编' }
    ],
    fallback: '无',
    workHours: [
      { dim: 'store-day', limit: 8, basis: 'net', onExceed: 'overtime' }
    ],
    updatedAt: '2026-11-11 18:45'
  }
]

export const scheduleStrategies = seed

/** 新建策略的空白起点（所有槽位给中性默认值，逐项配置） */
export const blankStrategy = () => ({
  id: '',
  name: '',
  enabled: false,
  position: '产品经理',
  cooperation: '全日制',
  scopeLevel: 'global',
  scopeTargets: { cities: [], stores: [], people: [] },
  scopeDesc: '',
  trigger: { type: 'cron', freq: 'weekly', weekdays: [], time: '09:00', manualAllowed: false, span: '月', ahead: { count: 1, unit: '月' } },
  shiftStructure: {
    timeSource: 'fixed',
    slots: [{ name: '行政班', start: '09:00', end: '18:00', breakMin: 60, seats: 1, required: true }]
  },
  quota: { algo: 'establishment', editable: false, estSource: '部门编制', releaseWhenVacant: false, personalMode: false, clamp: { min: 0, max: 3 } },
  tiers: [{ crowd: '指定人员', method: 'assign', rule: '默认在岗', slots: ['行政班'], openFrom: '立即', seats: null }],
  noTaker: '不做处理',
  priority: { enabled: false, rules: [] },
  gapRules: [],
  fallback: '无',
  workHours: [{ dim: 'store-day', limit: 8, basis: 'net', onExceed: 'overtime' }],
  updatedAt: ''
})
