/* ============================================================
 * 时段与名额 v2 —— 排班抽象模型的原型数据层（独立于排班策略 v1）
 *
 * 模型主语是「时段」，与岗位无关：
 *   班次模板(通用,只读) → 本店班次(店级,可改名/调时间) → 时段(slot) → 名额 → 分配窗口(window) × 层(tier)
 *
 * 班次分两层：通用模板是总部级的封闭集合（跨店比对的身份锚点）；
 * 门店引用模板生成「本店班次」（名称可改、起止可调，比对仍按模板 id），
 * 也可以自建模板外的班次（标「门店自定义」）。时段只挂本店班次。
 * —— 解决「都叫早班，但不同地区时段设置有差异」+「有的店有模板外的班次」。
 *
 * 一个层 = 哪些人群 × 按什么键裁决（参数化，不是文字）× 最多消化几个名额
 *        × 班次性质（可选 / 必选）× 何时开放 × 串行还是并行
 *   必选 = 被安排的人必须拥有该时段；可选 = 可不领，名额流给下一层。
 * 裁决键是封闭集合（五类 + 无竞争），键选定后带出结构化参数，
 * 文字摘要由参数自动生成（keyDetail）—— 系统读参数，不读文字。
 *
 * 生成规则（generation）回答「定义什么时候铺成名额」：
 *   生成时钟铺出的不是排班结果，而是一批「名额实例」（时段定义 × 具体日期 × 名额数）。
 *   名额实例再按窗口 × 层消化：自动分配 = 无竞争/义务直派；
 *   有条件申请后审核分配 = 权利层 + 裁决键（先到先得 / 绩效竞标 / 轮转…）；
 *   兜底 = 最后一层义务直派 + 兜底动作。
 *   排班结果记录的写入链路不变（消化完成后直接接受写入）—— 重构范围限定。
 *
 * 容器（container）：时段绑定的不是「门店列表项」，而是「容器类型 + 具体容器」的归属标签
 *   （门店 / 办公地点 / 城市 / 人）。门店只是容器类型之一，因为相对固定才直接罗列成列表。
 *   该容器的打卡考勤将来关联在容器上，不在时段上。
 * ============================================================ */

/* ---- 通用班次模板：名称的唯一来源 ---- */
export const SHIFT_TEMPLATES = [
  { id: 'TPL-01', name: '早班', start: '10:00', end: '18:00', breakMin: 60 },
  { id: 'TPL-02', name: '中班', start: '12:00', end: '20:00', breakMin: 60 },
  { id: 'TPL-03', name: '晚班', start: '14:00', end: '22:00', breakMin: 60 },
  { id: 'TPL-04', name: '通班', start: '10:00', end: '22:00', breakMin: 120 },
  { id: 'TPL-05', name: '行政班', start: '09:00', end: '18:00', breakMin: 60 },
  { id: 'TPL-06', name: '非全晚峰', start: '19:00', end: '21:00', breakMin: 0 },
  { id: 'TPL-07', name: '保洁早段', start: '08:00', end: '12:00', breakMin: 0 }
]
export const findTemplate = id => SHIFT_TEMPLATES.find(t => t.id === id) || null
export const templateName = id => (findTemplate(id) || {}).name || ''

/* ---- 本容器班次库（店级）：引用通用模板（身份 = 模板 id，名称/时间可改）或门店自建 ----
 * 名称是展示层，templateId 才是跨店比对的身份 —— 名字随便改，比对不乱。 */
export const CONTAINER_SHIFTS = [
  { id: 'PS-101', containerId: 'P-01', templateId: 'TPL-01', name: '早班', start: '10:00', end: '18:00', breakMin: 60 },
  { id: 'PS-102', containerId: 'P-01', templateId: 'TPL-06', name: '非全晚峰', start: '19:00', end: '21:00', breakMin: 0 },
  { id: 'PS-103', containerId: 'P-01', templateId: 'TPL-05', name: '行政班', start: '09:00', end: '18:00', breakMin: 60 },
  { id: 'PS-104', containerId: 'P-01', templateId: null, name: '长早班', start: '09:30', end: '20:00', breakMin: 90 },
  { id: 'PS-201', containerId: 'P-02', templateId: 'TPL-01', name: '黄金早班', start: '11:00', end: '19:00', breakMin: 60 },
  { id: 'PS-202', containerId: 'P-02', templateId: 'TPL-06', name: '非全晚峰', start: '19:00', end: '21:00', breakMin: 0 },
  { id: 'PS-301', containerId: 'P-03', templateId: 'TPL-05', name: '行政班', start: '09:00', end: '18:00', breakMin: 60 },
  { id: 'PS-401', containerId: 'P-04', templateId: 'TPL-07', name: '保洁早段', start: '08:00', end: '12:00', breakMin: 0 }
]
export const findContainerShift = id => CONTAINER_SHIFTS.find(p => p.id === id) || null
export const containerShiftsOf = containerId => CONTAINER_SHIFTS.filter(p => p.containerId === containerId)
export const shiftOf = slot => findContainerShift(slot?.shiftId)
export const shiftTemplateOf = sh => (sh?.templateId && findTemplate(sh.templateId)) || null
/** 引用班次相对模板改了时间 */
export const shiftAdjusted = sh => {
  const t = shiftTemplateOf(sh)
  return !!t && (sh.start !== t.start || sh.end !== t.end || (sh.breakMin || 0) !== t.breakMin)
}
/** 引用班次相对模板改了名 */
export const shiftRenamed = sh => {
  const t = shiftTemplateOf(sh)
  return !!t && sh.name !== t.name
}
/** 徽标：门店自定义 / 已改名 / 已按门店调整 */
export const shiftFlags = sh => {
  const f = []
  if (!sh) return f
  if (!sh.templateId) f.push('门店自定义')
  if (shiftRenamed(sh)) f.push('已改名')
  if (shiftAdjusted(sh)) f.push('已按门店调整')
  return f
}

export const SLOT_KINDS = [
  { value: 'cycle', label: '周期时段', hint: '按周期反复出现（如每周），由批次生成' },
  { value: 'temp', label: '临时时段', hint: '指定日期一次性，独立发布，不分档' }
]
export const kindOf = v => SLOT_KINDS.find(k => k.value === v) || SLOT_KINDS[0]

/* ---- 生成规则：定义什么时候铺成名额实例（铺的是名额，不是排班结果） ---- */
export const GEN_CADENCES = [
  { value: 'weekly', label: '每周', hint: '按周重复铺出下一批名额' },
  { value: 'monthly', label: '每月', hint: '按自然月铺出整月名额' },
  { value: 'manual', label: '手动发布', hint: '不自动生成，人点了才铺' }
]
export const GEN_HORIZONS = [
  { value: 'n1', label: '下一批', hint: '每次只出下一批（如下周）；上一批由上一次生成' },
  { value: 'days14', label: '未来两周', hint: '一次铺满未来 14 天' },
  { value: 'month', label: '整月', hint: '一次铺满整个自然月' }
]
export const genCadenceOf = v => GEN_CADENCES.find(c => c.value === v) || GEN_CADENCES[2]
export const genHorizonOf = v => GEN_HORIZONS.find(h => h.value === v) || GEN_HORIZONS[0]
/** 生成规则 → 一行摘要（列表列用） */
export const genShort = g => {
  if (!g?.cadence || g.cadence === 'manual') return '手动发布'
  if (g.cadence === 'weekly') return `每周${WEEKDAY_NAMES[g.weekday] || '?'} ${g.time || '--:--'}`
  return `每月 ${g.day || '?'} 日 ${g.time || '--:--'}`
}
/** 生成视野 → 概览说明（整月 vs 下一批） */
export const genHorizonNote = g => {
  const h = genHorizonOf(g?.horizon)
  if (h.value === 'month') return `${genShort(g)} 铺出下月整月名额`
  if (h.value === 'days14') return `${genShort(g)} 一次铺满未来 14 天`
  return `${genShort(g)} 铺出下一批（一周）名额`
}

/* ---- 领取约束：名额被领走时的规则（粒度 / 个人上限） ----
 * 个人上限是领取资格的前置：超了领不了（非全「单日累计 4 小时」的模型落点）。 */
export const CLAIM_GRANULARITY = [
  { value: 'whole', label: '整段领取', hint: '名额必须整段拿走' },
  { value: 'split', label: '可拆分', hint: '可只领一段，最少 N 小时起领' }
]
export const claimGranularityOf = v => CLAIM_GRANULARITY.find(g => g.value === v) || CLAIM_GRANULARITY[0]
export const claimShort = c => {
  const g = claimGranularityOf(c?.granularity).label
  const caps = []
  if (c?.minHours) caps.push(`最少 ${c.minHours}h 起领`)
  if (c?.perDay) caps.push(`单日 ≤ ${c.perDay}h`)
  return caps.length ? `${g} · ${caps.join(' · ')}` : g
}

/* ---- 容器：时段的宿主，归属标签 = 容器类型 + 具体容器 ----
 * 打卡考勤将来关联在容器上（不是时段上）；门店相对固定才直接罗列成列表。 */
export const CONTAINER_TYPES = [
  { value: 'store', label: '门店' },
  { value: 'office', label: '办公地点' },
  { value: 'city', label: '城市' },
  { value: 'person', label: '人（个人模式例外）' }
]
export const CONTAINERS = [
  { id: 'P-01', type: 'store', name: '兴隆湖店', city: '长沙', openTime: '10:00', closeTime: '24:00' },
  { id: 'P-02', type: 'store', name: '麓山店', city: '长沙', openTime: '10:00', closeTime: '22:00' },
  { id: 'P-03', type: 'office', name: '城市办公区', city: '长沙', openTime: '09:00', closeTime: '18:00' },
  { id: 'P-04', type: 'city', name: '长沙（全域）', city: '长沙', openTime: '08:00', closeTime: '22:00' }
]
export const findContainer = id => CONTAINERS.find(p => p.id === id) || null
export const containerTypeOf = v => CONTAINER_TYPES.find(t => t.value === v) || CONTAINER_TYPES[0]
export const containerLabel = id => (findContainer(id) || {}).name || id

/* ---- 裁决键目录（封闭集合）：每类键带结构化参数，系统读参数不读文字 ---- */
export const KEY_TYPES = [
  {
    value: 'time', label: '时间键', hint: '按时间先后裁决',
    modes: [
      { value: 'first', label: '先到先得', hint: '谁先申请谁先得，无需参数' },
      { value: 'hire', label: '入职早晚', hint: '入职早（工号小）优先' },
      { value: 'sign', label: '签约早晚', hint: '签约早优先' },
      { value: 'entry', label: '入店早晚', hint: '入店早优先' }
    ]
  },
  {
    value: 'perf', label: '绩效键', hint: '按业绩表现裁决',
    modes: [
      { value: 'composite', label: '综合分加权', hint: '多指标加权求和后排序' },
      { value: 'single', label: '单指标', hint: '按一个指标排序' }
    ]
  },
  {
    value: 'relation', label: '关系键', hint: '按地理 / 组织关系裁决',
    modes: [
      { value: 'near', label: '同城就近优先' },
      { value: 'sameStore', label: '同店优先' },
      { value: 'sign', label: '最早签约优先' }
    ]
  },
  {
    value: 'manual', label: '人工键', hint: '人来定，系统只执行',
    modes: [{ value: 'assign', label: '指定人员', hint: '发布时点选名单，人数 = 选中人数' }]
  },
  {
    value: 'state', label: '状态键', hint: '按上一周期的占用结果裁决',
    modes: [{ value: 'rotate', label: '轮转', hint: '按轮转顺序 + 上一周期记录推算本轮归谁' }]
  },
  {
    value: 'none', label: '无竞争', hint: '没有竞争，系统直接命中',
    modes: [{ value: 'direct', label: '系统直接命中' }]
  }
]
export const keyTypeOf = v => KEY_TYPES.find(k => k.value === v) || KEY_TYPES[5]
export const keyLabelOf = v => keyTypeOf(v).label
export const keyModeOf = k => {
  const kt = keyTypeOf(k?.type)
  return (kt.modes || []).find(m => m.value === k?.mode) || null
}
/** 键的文字摘要：由参数自动生成（展示用，引擎只读 params） */
export const keyDetail = k => {
  const mode = keyModeOf(k)
  if (!mode) return '未配置完整'
  if (k.type === 'perf') {
    if (k.mode === 'composite') {
      const ws = (k.params?.metrics || []).map(m => `${m.name}${m.weight}`).join('+')
      return `综合分 = ${ws} → ${(k.params?.tiebreak || '—')}破平`
    }
    return `${k.params?.metric || '—'}${k.params?.dir === 'asc' ? '升序' : '降序'}优先`
  }
  if (k.type === 'state') {
    return `轮转 ${(k.params?.order || []).join('→') || '—'} · 锚点：${k.params?.anchor || '上一周期'}`
  }
  return mode.label + (k.type === 'time' && k.mode === 'first' ? '（申请时刻）' : '')
}
export const PERF_METRICS = ['产值', '回头率', '预约率', '客次']
export const ROTATE_ANCHORS = ['上一周期已发布排班', '工号（新店首次）']

export const CROWDS = [
  '全日制客户经理', '储备客户经理', '非全客户经理',
  '全日制推拿师', '非全推拿师',
  '全栈工程师', '保洁', '城市总'
]

export const QUOTA_MODES = [
  { value: 'all', label: '全部剩余' },
  { value: 'count', label: '固定数量' },
  { value: 'ratio', label: '比例（基数÷除数）' },
  { value: 'algo', label: '算法生成（业绩指标）' }
]

export const OBLIGATIONS = [
  { value: 'right', label: '可选', hint: '可不领，名额流给下一层' },
  { value: 'duty', label: '必选', hint: '被安排即必须拥有该时段，只发通知、不接受拒绝' }
]
export const obligationOf = v => OBLIGATIONS.find(o => o.value === v) || OBLIGATIONS[0]

export const OPEN_MODELS = [
  { value: 'serial', label: '串行', hint: '上层关窗下层才开，名额被上层锁定' },
  { value: 'parallel', label: '并行', hint: '各层到点即开、窗口开了不关，共享名额池' }
]
export const openModelOf = v => OPEN_MODELS.find(o => o.value === v) || OPEN_MODELS[0]

/** 窗口开放时刻（结构化，不是文案）：周期锚点 + 星期/日期 + 时刻 */
export const WINDOW_ANCHORS = [
  { value: 'weekly', label: '每周' },
  { value: 'monthly', label: '每月' },
  { value: 'publish', label: '发布即开放', fixed: true }
]
export const WEEKDAY_NAMES = ['日', '一', '二', '三', '四', '五', '六']
export const windowOpenLabel = o => {
  if (!o?.anchor) return '未配置'
  if (o.anchor === 'publish') return '发布即开放'
  if (o.anchor === 'weekly') return `每周${WEEKDAY_NAMES[o.weekday] || '?'} ${o.time || '--:--'}`
  return `每月 ${o.day || '?'} 日 ${o.time || '--:--'}`
}

/** 时刻解析：HH:MM，HH 可 0–47（跨日写法：25:00 = 次日 01:00，24:00 = 次日 00:00） */
export const parseOpenTime = t => {
  if (!/^\d{1,2}:[0-5]\d$/.test(t || '')) return null
  const [h, m] = t.split(':').map(Number)
  return h > 47 ? null : { h, m }
}

/** 层开放时刻 = 锚点（几天前 / 窗口 / 发布）+ 时刻（可跨日）+ 错峰偏移（仅窗口锚点） */
export const OPEN_ANCHORS = [
  { value: 'window', label: '窗口开放即', fixed: true, hint: '错峰用偏移小时' },
  { value: 'd3', label: '排班日 3 天前' },
  { value: 'd1', label: '排班日 1 天前' },
  { value: 'day', label: '排班日当天' },
  { value: 'publish', label: '发布即开放', fixed: true }
]
export const openAnchorOf = v => OPEN_ANCHORS.find(a => a.value === v) || OPEN_ANCHORS[0]

const DAYS_BEFORE = { d3: 3, d1: 1, day: 0 }
const pad2 = n => String(n).padStart(2, '0')
/** 层开放时刻 → 可读摘要：跨日写法自动归一（3 天前 25:00 = 2 天前 01:00） */
export const openAtLabel = v => {
  if (!v?.anchor) return ''
  const a = openAnchorOf(v.anchor)
  if (a.fixed) return v.offsetH ? `${a.label} +${v.offsetH}h` : a.label
  const p = parseOpenTime(v.time)
  if (!p) return `${a.label} --:--`
  if (p.h < 24) return `${a.label} ${v.time}`
  const effBefore = DAYS_BEFORE[v.anchor] - Math.floor(p.h / 24)
  const effDay = effBefore > 0 ? `排班日 ${effBefore} 天前`
    : effBefore === 0 ? '排班日当天' : `排班日 ${-effBefore} 天后`
  return `${a.label} ${v.time}（= ${effDay} ${pad2(p.h % 24)}:${pad2(p.m)}）`
}

/* ---- 业务句子：结构生成人话，页面默认给人话、点开才是参数 ---- */
const KEY_SHORT = {
  'time|first': '先到先得',
  'time|hire': '入职早的优先',
  'time|sign': '签约早的优先',
  'time|entry': '入店早的优先',
  'perf|composite': '按综合分竞标',
  'perf|single': '按指标排名',
  'relation|near': '同城就近顶上',
  'relation|sameStore': '本店的优先',
  'relation|sign': '最早签约的优先',
  'manual|assign': '运营点名指定',
  'state|rotate': '按上周的班轮转',
  'none|direct': '系统直接安排'
}
export const keyShortOf = k => KEY_SHORT[`${k?.type}|${k?.mode}`] || '规则未配'

const QUOTA_SHORT = q => {
  if (!q) return ''
  if (q.mode === 'all') return '名额全给'
  if (q.mode === 'count') return `最多 ${q.value} 人`
  if (q.mode === 'ratio') return `最多 ${q.base || '基数'}÷${q.divisor} 人`
  return '名额按业绩算'
}

/** 一层 = 一句业务话：谁 + 按什么拿 + 拿几个 + 什么时候 + 拿了怎么样 */
export const tierSentence = t => {
  const crowds = (t.crowds || []).join('、') || '人群未设'
  const bits = [`${crowds}${keyShortOf(t.key)}`, QUOTA_SHORT(t.quota)]
  if (t.openAt.anchor === 'window') {
    bits.push(t.openAt.offsetH ? `窗口开放 ${t.openAt.offsetH} 小时后加入` : '窗口一开就能领')
  } else {
    bits.push(openAtLabel(t.openAt))
  }
  bits.push(t.obligation === 'duty' ? '必选：被安排必须拥有、只发通知' : '可选：可不领，剩下流给下一层')
  return bits.join(' · ')
}

/** 一层 = 短语（列在「名额怎么分」列里，用箭头串起整条链） */
export const tierShort = t => {
  const c = (t.crowds || [])[0] || '未设人群'
  const many = (t.crowds || []).length > 1 ? `等${t.crowds.length}类` : ''
  return `${c}${many}${keyShortOf(t.key)}`
}

/** 一条链 = 一句话：层 → 层 → … → 漏完怎么办 */
export const slotFlow = slot => {
  const tiers = (slot.windows || []).flatMap(w => w.tiers || [])
  const chain = tiers.map(tierShort).join(' → ')
  return slot.leftover && slot.leftover !== '留空' ? `${chain} → 漏完${slot.leftover}` : chain
}

/* 名额就是一个数字：人事确认/微调后发布，「为什么是这个数」写在口径说明里。
 * 名额自动化（按业务指标动态算名额）本期不做，挂待决 —— 业务波动大时门店直接重新调整。 */

export const LEFTOVERS = ['留空', '留待派发', '转临时时段', '生成通班', '触发招聘', '并入相邻时段']
/* 「留待派发」：没人接/兜不住时名额保留待后续派发，不回收（临时时段指定人员的真实口径）。
 * 一致性规则：必选时段（required）的兜底不能是「留空」—— 必须分完是承诺，留空不是动作。 */

/* ---- 时间工具 ---- */
export const minutesOf = hhmm => {
  if (!hhmm || !hhmm.includes(':')) return 0
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + (m || 0)
}
/** 净工时 = 止 − 起 − 休息（小时，一位小数）。入参可为时段（解析 shiftId）或班次/裸对象（直接取 start/end） */
export const netHours = x => {
  const sh = x && x.shiftId ? shiftOf(x) : x
  if (!sh) return 0
  return Math.max(0, (minutesOf(sh.end) - minutesOf(sh.start) - (sh.breakMin || 0)) / 60)
}

/* ---- 摘要 ---- */
export const quotaLabel = q => {
  if (!q) return ''
  if (q.mode === 'all') return '全部剩余'
  if (q.mode === 'count') return `固定 ${q.value} 个`
  if (q.mode === 'ratio') return `${q.base || '基数'}÷${q.divisor || 2}`
  return '算法生成（业绩指标）'
}
export const tierOneLine = t =>
  `${(t.crowds || []).join(' → ') || '未设人群'} · ${keyLabelOf(t.key?.type)} · ${quotaLabel(t.quota)} · ${obligationOf(t.obligation).label}`

/** 时段摘要：N 窗口 · M 层 · K 必选 */
export const slotSummary = slot => {
  const tiers = (slot.windows || []).flatMap(w => w.tiers || [])
  const duty = tiers.filter(t => t.obligation === 'duty').length
  return `${(slot.windows || []).length} 窗口 · ${tiers.length} 层${duty ? ` · ${duty} 必选` : ''}`
}

/* ---- 种子：覆盖六类裁决键 / 双开放模型 / 权利与义务 / 窗口重跑 / 门店调整 / 临时时段 ---- */
export const slotSeeds = [
  {
    id: 'SL-001',
    containerId: 'P-01',
    kind: 'cycle', date: '',
    days: [1, 2, 3, 4, 5, 6, 0],
    shiftId: 'PS-101',
    required: true,
    capacity: { note: '传位数即物理容量', value: 6 },
    generation: { cadence: 'weekly', weekday: 4, time: '06:00', horizon: 'n1', idempotent: true },
    claim: { granularity: 'whole', minHours: 0, perDay: 0 },
    leftover: '生成通班',
    leftoverNote: '周四没操作 / 周五被挤出 / 抢不到名额 → 通班',
    windows: [
      {
        id: 'W-001-1', label: '主窗口', openAt: { anchor: 'weekly', weekday: 4, time: '06:00' }, rerunNote: '',
        tiers: [
          {
            id: 'T-001', order: 1,
            crowds: ['全日制推拿师'],
            key: {
              type: 'perf', mode: 'composite',
              params: {
                metrics: [{ name: '产值', weight: 40 }, { name: '回头率', weight: 30 }, { name: '预约率', weight: 30 }],
                tiebreak: '回头率'
              }
            },
            quota: { mode: 'algo' },
            obligation: 'right',
            openAt: { anchor: 'window', time: '', offsetH: 0 },
            openModel: 'serial', note: '按以往周期业绩自动审核，超额才排序，末位挤出'
          }
        ]
      },
      {
        id: 'W-001-2', label: '重跑窗口', openAt: { anchor: 'weekly', weekday: 5, time: '00:00' },
        rerunNote: '上一窗口落选者自动进入；周五再抢有名额的班次',
        tiers: [
          {
            id: 'T-002', order: 1,
            crowds: ['全日制推拿师'],
            key: { type: 'time', mode: 'first', params: {} },
            quota: { mode: 'all' },
            obligation: 'right',
            openAt: { anchor: 'window', time: '', offsetH: 0 },
            openModel: 'serial', note: '只对上轮没占到的人开放'
          },
          {
            id: 'T-003', order: 2,
            crowds: ['全日制推拿师'],
            key: { type: 'none', mode: 'direct', params: {} },
            quota: { mode: 'all' },
            obligation: 'duty',
            openAt: { anchor: 'd1', time: '06:00', offsetH: 0 },
            openModel: 'serial', note: '抢不到名额的人由系统收尾'
          }
        ]
      }
    ]
  },
  {
    id: 'SL-002',
    containerId: 'P-01',
    kind: 'cycle', date: '',
    days: [1, 2, 3, 4, 5, 6, 0],
    shiftId: 'PS-102',
    required: true,
    capacity: { note: '传位数是物理约束；岗位配额在层上', value: 3 },
    generation: { cadence: 'weekly', weekday: 4, time: '06:00', horizon: 'n1', idempotent: true },
    claim: { granularity: 'whole', minHours: 0, perDay: 4 },
    leftover: '转临时时段',
    leftoverNote: '全部层都消化不完 → 转临时时段补人',
    windows: [
      {
        id: 'W-002-1', label: '主窗口（错峰开放）', openAt: { anchor: 'weekly', weekday: 4, time: '06:00' }, rerunNote: '',
        tiers: [
          {
            id: 'T-004', order: 1,
            crowds: ['非全推拿师'],
            key: { type: 'time', mode: 'first', params: {} },
            quota: { mode: 'ratio', base: '门店签约非全人数', divisor: 2 },
            obligation: 'right',
            openAt: { anchor: 'window', time: '', offsetH: 0 },
            openModel: 'parallel', note: '必选时段名额 = 签约人数 ÷ 2'
          },
          {
            id: 'T-005', order: 2,
            crowds: ['非全推拿师'],
            key: { type: 'time', mode: 'first', params: {} },
            quota: { mode: 'all' },
            obligation: 'right',
            openAt: { anchor: 'window', time: '', offsetH: 3 },
            openModel: 'parallel', note: '错峰 +3h；窗口开了不关，先开的层继续可领'
          },
          {
            id: 'T-006', order: 3,
            crowds: ['非全客户经理'],
            key: { type: 'time', mode: 'first', params: {} },
            quota: { mode: 'all' },
            obligation: 'right',
            openAt: { anchor: 'window', time: '', offsetH: 6 },
            openModel: 'parallel', note: '错峰 +6h，与本店推拿师合并竞争剩余名额'
          },
          {
            id: 'T-013', order: 4,
            crowds: ['非全推拿师', '非全客户经理'],
            key: { type: 'manual', mode: 'assign', params: {} },
            quota: { mode: 'count', value: 1 },
            obligation: 'duty',
            openAt: { anchor: 'window', time: '', offsetH: 0 },
            openModel: 'serial', note: '临时派单的点名模式：只派名单，人数 = 选中人数'
          },
          {
            id: 'T-007', order: 5,
            crowds: ['非全推拿师', '非全客户经理'],
            key: { type: 'relation', mode: 'sign', params: {} },
            quota: { mode: 'all' },
            obligation: 'duty',
            openAt: { anchor: 'd1', time: '06:00', offsetH: 0 },
            openModel: 'serial', note: '系统指派，只发通知、直接待到店，不接受拒绝'
          }
        ]
      }
    ]
  },
  {
    id: 'SL-003',
    containerId: 'P-03',
    kind: 'cycle', date: '',
    days: [1, 2, 3, 4, 5],
    shiftId: 'PS-301',
    required: false,
    capacity: { note: '编制数', value: 2 },
    generation: { cadence: 'monthly', day: 25, time: '09:00', horizon: 'month', idempotent: true },
    claim: { granularity: 'whole', minHours: 0, perDay: 0 },
    leftover: '留空',
    leftoverNote: '职能岗无竞争，缺编走招聘不走排班',
    windows: [
      {
        id: 'W-003-1', label: '生成窗口', openAt: { anchor: 'monthly', day: 25, time: '09:00' }, rerunNote: '',
        tiers: [
          {
            id: 'T-008', order: 1,
            crowds: ['全栈工程师'],
            key: { type: 'none', mode: 'direct', params: {} },
            quota: { mode: 'all' },
            obligation: 'duty',
            openAt: { anchor: 'publish', time: '', offsetH: 0 },
            openModel: 'serial', note: '09:00–18:00 休 60 分 = 净工时 8h；超出计为加班'
          }
        ]
      }
    ]
  },
  {
    id: 'SL-004',
    containerId: 'P-02',
    kind: 'cycle', date: '',
    days: [1, 2, 3, 4, 5, 6, 0],
    shiftId: 'PS-201',
    required: true,
    capacity: { note: '配置人数（1 人店）', value: 1 },
    generation: { cadence: 'weekly', weekday: 4, time: '06:00', horizon: 'n1', idempotent: true },
    claim: { granularity: 'whole', minHours: 0, perDay: 0 },
    leftover: '留待派发',
    leftoverNote: '缺岗由储备兜底；兜不住时留待派发（名额保留不回收）',
    windows: [
      {
        id: 'W-004-1', label: '主窗口', openAt: { anchor: 'weekly', weekday: 4, time: '06:00' }, rerunNote: '',
        tiers: [
          {
            id: 'T-009', order: 1,
            crowds: ['全日制客户经理'],
            key: {
              type: 'state', mode: 'rotate',
              params: { order: ['早班', '晚班'], anchor: '上一周期已发布排班' }
            },
            quota: { mode: 'count', value: 1 },
            obligation: 'duty',
            openAt: { anchor: 'window', time: '', offsetH: 0 },
            openModel: 'serial', note: '状态键：本周结果取决于上周占用记录'
          },
          {
            id: 'T-010', order: 2,
            crowds: ['储备客户经理'],
            key: { type: 'relation', mode: 'sign', params: {} },
            quota: { mode: 'count', value: 1 },
            obligation: 'duty',
            openAt: { anchor: 'window', time: '', offsetH: 0 },
            openModel: 'serial', note: '有效在岗数 < 配置数才触发；无缺口时储备自转'
          }
        ]
      }
    ]
  },
  {
    id: 'SL-005',
    containerId: 'P-04',
    kind: 'cycle', date: '',
    days: [1, 2, 3, 4, 5, 6, 0],
    shiftId: 'PS-401',
    required: true,
    capacity: { note: '营业面积 ÷ 120 = 点位数', value: 4 },
    generation: { cadence: 'weekly', weekday: 1, time: '08:00', horizon: 'n1', idempotent: true },
    claim: { granularity: 'whole', minHours: 0, perDay: 0 },
    leftover: '转临时时段',
    leftoverNote: '同城就近顶班是义务兜底',
    windows: [
      {
        id: 'W-005-1', label: '主窗口', openAt: { anchor: 'weekly', weekday: 1, time: '08:00' }, rerunNote: '',
        tiers: [
          {
            id: 'T-011', order: 1,
            crowds: ['保洁'],
            key: { type: 'time', mode: 'first', params: {} },
            quota: { mode: 'all' },
            obligation: 'right',
            openAt: { anchor: 'd3', time: '06:00', offsetH: 0 },
            openModel: 'parallel', note: '驻点保洁先挑'
          },
          {
            id: 'T-012', order: 2,
            crowds: ['保洁'],
            key: { type: 'relation', mode: 'near', params: {} },
            quota: { mode: 'all' },
            obligation: 'duty',
            openAt: { anchor: 'd1', time: '06:00', offsetH: 0 },
            openModel: 'serial', note: '没人挑时同城保洁就近顶班（跨店义务）'
          }
        ]
      }
    ]
  },
  {
    id: 'SL-007',
    containerId: 'P-02',
    kind: 'cycle', date: '',
    days: [1, 2, 3, 4, 5, 6, 0],
    shiftId: 'PS-202',
    required: true,
    capacity: { note: '晚峰工位数（物理容量）', value: 4 },
    generation: { cadence: 'monthly', day: 25, time: '09:00', horizon: 'month', idempotent: true },
    claim: { granularity: 'whole', minHours: 0, perDay: 4 },
    leftover: '留待派发',
    leftoverNote: '整月名额消化不完时留待派发，不回收',
    windows: [
      {
        id: 'W-007-1', label: '月度开放窗口（错峰）', openAt: { anchor: 'monthly', day: 25, time: '09:00' }, rerunNote: '',
        tiers: [
          {
            id: 'T-015', order: 1,
            crowds: ['非全客户经理'],
            key: { type: 'time', mode: 'first', params: {} },
            quota: { mode: 'ratio', base: '麓山签约非全客户经理人数', divisor: 2 },
            obligation: 'right',
            openAt: { anchor: 'window', time: '', offsetH: 0 },
            openModel: 'parallel', note: '每月 25 日开窗第一波，先到先得自领'
          },
          {
            id: 'T-016', order: 2,
            crowds: ['非全推拿师'],
            key: { type: 'time', mode: 'first', params: {} },
            quota: { mode: 'count', value: 1 },
            obligation: 'right',
            openAt: { anchor: 'window', time: '', offsetH: 6 },
            openModel: 'parallel', note: '错峰 +6h，推拿师限领 1 个'
          },
          {
            id: 'T-017', order: 3,
            crowds: ['非全客户经理', '非全推拿师'],
            key: { type: 'relation', mode: 'sign', params: {} },
            quota: { mode: 'all' },
            obligation: 'duty',
            openAt: { anchor: 'window', time: '', offsetH: 48 },
            openModel: 'serial', note: '开窗 48h 后仍有剩余 → 签约早的系统指派，只发通知'
          }
        ]
      }
    ]
  },
  {
    id: 'SL-006',
    containerId: 'P-01',
    kind: 'temp', date: '2026-11-14',
    shiftId: 'PS-102',
    required: true,
    capacity: { note: '当天缺口 1 人', value: 1 },
    generation: null,
    claim: { granularity: 'whole', minHours: 0, perDay: 4 },
    leftover: '留待派发',
    leftoverNote: '临时时段一次性，没人接留待派发，不回收',
    windows: [
      {
        id: 'W-006-1', label: '发布窗口', openAt: { anchor: 'publish' }, rerunNote: '',
        tiers: [
          {
            id: 'T-014', order: 1,
            crowds: ['非全推拿师', '非全客户经理'],
            key: { type: 'time', mode: 'sign', params: {} },
            quota: { mode: 'all' },
            obligation: 'duty',
            openAt: { anchor: 'publish', time: '', offsetH: 0 },
            openModel: 'serial', note: '临时时段不分档：资格筛后最早签约直接派，只发通知、直接待到店'
          }
        ]
      }
    ]
  }
]

/* ---- 空白起点：挂本容器班次（时段不再存名称与时间，全部在班次上） ---- */
export const blankSlot = (containerId, shiftId, kind = 'cycle') => {
  const sh = findContainerShift(shiftId) || containerShiftsOf(containerId)[0] || CONTAINER_SHIFTS[0]
  return {
    id: '',
    containerId,
    kind, date: '',
    days: kind === 'cycle' ? [1, 2, 3, 4, 5, 6, 0] : [],
    shiftId: sh.id,
    required: false,
    capacity: { note: '', value: 1 },
    generation: kind === 'cycle'
      ? { cadence: 'weekly', weekday: 4, time: '06:00', horizon: 'n1', idempotent: true }
      : null,
    claim: { granularity: 'whole', minHours: 0, perDay: 0 },
    leftover: '留待派发',
    leftoverNote: '',
    windows: [
      {
        id: '', label: '主窗口', openAt: { anchor: 'weekly', weekday: 4, time: '06:00' }, rerunNote: '',
        tiers: [
          {
            id: '', order: 1,
            crowds: [],
            key: { type: 'time', mode: 'first', params: {} },
            quota: { mode: 'all' },
            obligation: 'right',
            openAt: { anchor: 'window', time: '', offsetH: 0 },
            openModel: 'serial', note: ''
          }
        ]
      }
    ]
  }
}

/* ---- 时段通用模板：新增时段的起点（选模板 → 按容器实例化 → 逐项修改） ----
 * 模板 = 一条时段的完整骨架：班次引用（shiftTemplateId）+ 名额 + 生成 + 领取 + 分配窗口×层。
 * 总部级集合；实例化时按容器解析班次（引用进本容器班次库，可改名调时间），
 * 实例之后的一切字段都可改 —— 模板只解决「从零配 100 项」的问题，不锁死任何东西。 */
const fromSeed = (seedId, id, name, desc) => {
  const s = slotSeeds.find(x => x.id === seedId)
  const tplShift = findContainerShift(s.shiftId)
  const { id: _sid, containerId, shiftId, kind: _k, date: _d, ...body } = structuredClone(s)
  return { id, name, desc, shiftTemplateId: tplShift.templateId, body }
}

export const SLOT_TEMPLATES = [
  fromSeed('SL-001', 'ST-01',
    '竞标班（业绩审核 → 重跑 → 收尾）',
    '推拿师式：周四竞标、周五落选重抢、抢不到系统收尾，双窗口重跑'),
  fromSeed('SL-002', 'ST-02',
    '错峰自抢班（多人群错峰开放）',
    '非全式：多人群错峰累计开放 + 点名派单 + 系统兜底，单日 4 小时上限'),
  fromSeed('SL-003', 'ST-03',
    '职能行政班（按月生成整月）',
    '行政班式：每月 25 日铺出下月整月名额，无竞争系统直接安排'),
  fromSeed('SL-004', 'ST-04',
    '倒班轮转班（上周定本周）',
    '客户经理式：按上一周期占用记录轮转 + 储备缺口补位'),
  {
    id: 'ST-05',
    name: '空白时段',
    desc: '只搭骨架（一个窗口一层），人群和规则全部自己配',
    shiftTemplateId: 'TPL-01',
    body: {
      days: [1, 2, 3, 4, 5, 6, 0],
      required: false,
      capacity: { note: '', value: 1 },
      generation: { cadence: 'weekly', weekday: 4, time: '06:00', horizon: 'n1', idempotent: true },
      claim: { granularity: 'whole', minHours: 0, perDay: 0 },
      leftover: '留待派发', leftoverNote: '',
      windows: [
        {
          label: '主窗口', openAt: { anchor: 'weekly', weekday: 4, time: '06:00' }, rerunNote: '',
          tiers: [
            {
              order: 1, crowds: [],
              key: { type: 'time', mode: 'first', params: {} },
              quota: { mode: 'all' }, obligation: 'right',
              openAt: { anchor: 'window', time: '', offsetH: 0 },
              openModel: 'serial', note: ''
            }
          ]
        }
      ]
    }
  }
]
export const findSlotTemplate = id => SLOT_TEMPLATES.find(t => t.id === id) || null
/** 星期数组 → 人话（每天 / 工作日 / 周一、周三…） */
export const daysLabel = days => {
  const d = [...new Set(days || [])].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7))
  if (d.length === 7) return '每天'
  if (d.join(',') === '1,2,3,4,5') return '工作日'
  return d.map(x => `周${WEEKDAY_NAMES[x]}`).join('、')
}
