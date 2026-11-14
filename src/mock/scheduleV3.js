/* ============================================================
 * 排班策略 v3 —— 设计基线（独立命名空间，不引用 v1 / v2 的任何数据）
 *
 * 四层结构：
 *   ① 上班容器（门店 / 办公地点 / 城市 / 人）：打卡考勤挂这里，本期不做
 *   ② 时段：**只描述时间形态**（班次 + 星期 + 名额 + 生成节奏），不说「谁先领」
 *   ③ 名额获取：独立对象，挂在时段上。三种模式 + 轮（申领期 → 截止 → 结算）+ 余额去向
 *   ④ 排班结果：既有记录表，审核通过 / 兜底安排都写它，本期不改
 *
 * 三种模式：
 *   direct 系统直派：无轮，系统或点名直接出结果
 *   grab   公布即抢：一轮、即时结算，符合时间不交叉立刻得
 *   review 申领审核：1..N 轮，每轮「申领期 → 截止 → 结算」，在已申领的人里按业绩截断
 *
 * 余额（一轮结算后没消化掉的名额）三选一：
 *   reRound  再开一轮（自己再申，轮次可配）
 *   sequence 兜底序列（本容器内时段有序，逐档吃当天剩余名额，逐档过时间不交叉）
 *   none     不管（留空）
 * ============================================================ */

/* ---- ① 容器 ---- */
export const V3_CONTAINER_TYPES = [
  { value: 'store', label: '门店' },
  { value: 'office', label: '办公地点' },
  { value: 'city', label: '城市' },
  { value: 'person', label: '人（个人模式例外）' }
]
export const V3_CONTAINERS = [
  { id: 'C-01', type: 'store', name: '兴隆湖店', city: '长沙', open: '10:00', close: '24:00' },
  { id: 'C-02', type: 'store', name: '麓山店', city: '长沙', open: '10:00', close: '22:00' },
  { id: 'C-03', type: 'office', name: '城市办公区', city: '长沙', open: '09:00', close: '18:00' },
  { id: 'C-04', type: 'city', name: '长沙（全域）', city: '长沙', open: '08:00', close: '22:00' }
]
export const findContainer3 = id => V3_CONTAINERS.find(c => c.id === id) || null
export const containerName3 = id => (findContainer3(id) || {}).name || id
export const containerType3 = v => V3_CONTAINER_TYPES.find(t => t.value === v) || V3_CONTAINER_TYPES[0]

/* ---- 通用班次模板（全平台身份锚点） ---- */
export const V3_SHIFT_TPL = [
  { id: 'SH-01', name: '早班', start: '10:00', end: '18:00', breakMin: 60 },
  { id: 'SH-02', name: '晚班', start: '14:00', end: '22:00', breakMin: 60 },
  { id: 'SH-03', name: '通班', start: '10:00', end: '22:00', breakMin: 120 },
  { id: 'SH-04', name: '行政班', start: '09:00', end: '18:00', breakMin: 60 },
  { id: 'SH-05', name: '非全晚峰', start: '19:00', end: '21:00', breakMin: 0 },
  { id: 'SH-06', name: '保洁早段', start: '08:00', end: '12:00', breakMin: 0 }
]
export const findShiftTpl3 = id => V3_SHIFT_TPL.find(s => s.id === id) || null

/* ---- 本容器班次库：引用模板（可改名调时间）或门店自建 ---- */
export const V3_CONTAINER_SHIFTS = [
  { id: 'CS-101', containerId: 'C-01', templateId: 'SH-01', name: '早班', start: '10:00', end: '18:00', breakMin: 60 },
  { id: 'CS-102', containerId: 'C-01', templateId: 'SH-02', name: '晚班', start: '14:00', end: '22:00', breakMin: 60 },
  { id: 'CS-103', containerId: 'C-01', templateId: 'SH-03', name: '通班', start: '10:00', end: '22:00', breakMin: 120 },
  { id: 'CS-104', containerId: 'C-01', templateId: 'SH-05', name: '非全晚峰', start: '19:00', end: '21:00', breakMin: 0 },
  { id: 'CS-201', containerId: 'C-02', templateId: 'SH-01', name: '黄金早班', start: '11:00', end: '19:00', breakMin: 60 },
  { id: 'CS-202', containerId: 'C-02', templateId: 'SH-03', name: '通班', start: '10:00', end: '22:00', breakMin: 120 },
  { id: 'CS-203', containerId: 'C-02', templateId: 'SH-05', name: '非全晚峰', start: '19:00', end: '21:00', breakMin: 0 },
  { id: 'CS-301', containerId: 'C-03', templateId: 'SH-04', name: '行政班', start: '09:00', end: '18:00', breakMin: 60 },
  { id: 'CS-401', containerId: 'C-04', templateId: 'SH-06', name: '保洁早段', start: '08:00', end: '12:00', breakMin: 0 }
]
export const findShift3 = id => V3_CONTAINER_SHIFTS.find(s => s.id === id) || null
export const shiftsOf3 = containerId => V3_CONTAINER_SHIFTS.filter(s => s.containerId === containerId)
export const shiftOfSlot3 = slot => findShift3(slot?.shiftId)
export const shiftTplOf3 = sh => (sh?.templateId && findShiftTpl3(sh.templateId)) || null
export const shiftFlags3 = sh => {
  if (!sh) return []
  const f = []
  const t = shiftTplOf3(sh)
  if (!sh.templateId) f.push('门店自建')
  else {
    if (sh.name !== t.name) f.push('已改名')
    if (sh.start !== t.start || sh.end !== t.end || (sh.breakMin || 0) !== t.breakMin) f.push('已调时间')
  }
  return f
}

/* ---- 班次性质：可选 / 必选，挂在时段上（不在获取规则里） ---- */
export const V3_NATURES = [
  { value: 'required', label: '必选', hint: '不申也得排：没人申时按兜底补人，结果表一定有人' },
  { value: 'optional', label: '可选', hint: '申了才有：没人申就留空，不强制补人' }
]
export const natureOf3 = v => V3_NATURES.find(n => n.value === v) || V3_NATURES[0]

/* ---- 名额来源：由「名额服务」供数，不在时段上写死 ----
 * 时间轴：服务给系统计算值 → 改动期（人事/店长可调，最少 5 分钟）→ 名额生效 → 铺实例
 * 生效值随生成快照固化；改动期里调过就记 adjusted，没调就用系统值
 */
export const QUOTA_WINDOW_MIN = 5
export const V3_QUOTA_SERVICES = [
  { value: 'headcount', label: '人头法', formula: '在册人数 × 出勤系数' },
  { value: 'volume', label: '工时法', formula: '当日需求工时 ÷ 单班净工时' },
  { value: 'signRatio', label: '签约比法', formula: '签约非全人数 ÷ 2，向上取整' },
  { value: 'fixed', label: '固定值', formula: '不随数据变化' }
]
export const quotaServiceOf3 = v => V3_QUOTA_SERVICES.find(s => s.value === v) || V3_QUOTA_SERVICES[3]
export const quotaOf3 = slot => slot?.quota || { service: 'fixed', params: { value: slot?.capacity || 1 }, windowMin: QUOTA_WINDOW_MIN }
/** 名额服务算值：纯函数，同一份输入永远同一个数 */
export const quotaCalc3 = slot => {
  const q = quotaOf3(slot)
  const p = q.params || {}
  let value = p.value ?? slot?.capacity ?? 1
  let formula = '固定值，不随数据变化'
  if (q.service === 'headcount') {
    value = Math.max(1, Math.round((p.headcount || 0) * (p.factor ?? 1)))
    formula = `在册 ${p.headcount} 人 × 出勤系数 ${p.factor ?? 1}`
  } else if (q.service === 'volume') {
    value = Math.max(1, Math.round((p.volumeHours || 0) / (p.shiftHours || 1)))
    formula = `当日需求 ${p.volumeHours}h ÷ 单班净 ${p.shiftHours}h`
  } else if (q.service === 'signRatio') {
    value = Math.max(1, Math.ceil((p.signed || 0) / (p.divisor || 2)))
    formula = `签约 ${p.signed} 人 ÷ ${p.divisor || 2}，向上取整`
  }
  const svc = quotaServiceOf3(q.service)
  const adjusted = q.adjusted ?? null
  return {
    service: q.service, serviceLabel: svc.label, formula,
    computed: value, windowMin: Math.max(QUOTA_WINDOW_MIN, q.windowMin ?? QUOTA_WINDOW_MIN),
    adjusted, effective: adjusted ?? value
  }
}

/* ---- ② 时段：只描述时间形态 ---- */
export const V3_SLOTS = [
  {
    id: 'SL-V301', containerId: 'C-01', shiftId: 'CS-101', name: '早班时段', nature: 'required',
    days: [1, 2, 3, 4, 5, 6, 0], capacity: 6, source: 'template', templateId: 'ST-V1',
    quota: { service: 'headcount', params: { headcount: 8, factor: 0.75 }, windowMin: 10, adjusted: null },
    generation: { cadence: 'weekly', weekday: 4, time: '06:00', horizon: 'n1', idempotent: true },
    note: '每周四 06:00 铺下一周，名额服务按人头算 6 个'
  },
  {
    id: 'SL-V302', containerId: 'C-01', shiftId: 'CS-102', name: '晚班时段', nature: 'optional',
    days: [1, 2, 3, 4, 5, 6, 0], capacity: 3, source: 'template', templateId: 'ST-V2',
    quota: { service: 'volume', params: { volumeHours: 24, shiftHours: 8 }, windowMin: 15, adjusted: null },
    generation: { cadence: 'weekly', weekday: 4, time: '06:00', horizon: 'n1', idempotent: true },
    note: '晚班单独发布；也是早班的兜底目标'
  },
  {
    id: 'SL-V303', containerId: 'C-01', shiftId: 'CS-103', name: '通班时段', nature: 'required',
    days: [1, 2, 3, 4, 5, 6, 0], capacity: 2, source: 'custom', templateId: null,
    quota: { service: 'fixed', params: { value: 2 }, windowMin: 10, adjusted: null },
    generation: { cadence: 'weekly', weekday: 4, time: '06:00', horizon: 'n1', idempotent: true },
    note: '兜底承接时段：不单独发布规则，只接早班漏下来的'
  },
  {
    id: 'SL-V304', containerId: 'C-02', shiftId: 'CS-203', name: '非全晚峰时段', nature: 'optional',
    days: [1, 2, 3, 4, 5, 6, 0], capacity: 4, source: 'template', templateId: 'ST-V4',
    quota: { service: 'signRatio', params: { signed: 8, divisor: 2 }, windowMin: 10, adjusted: null },
    generation: { cadence: 'monthly', day: 25, time: '09:00', horizon: 'month', idempotent: true },
    note: '每月 25 日铺下月整月，错峰自领'
  },
  {
    id: 'SL-V305', containerId: 'C-02', shiftId: 'CS-201', name: '黄金早班时段', nature: 'required',
    days: [1, 2, 3, 4, 5, 6, 0], capacity: 1, source: 'template', templateId: 'ST-V1',
    quota: { service: 'fixed', params: { value: 1 }, windowMin: 10, adjusted: null },
    generation: { cadence: 'weekly', weekday: 4, time: '06:00', horizon: 'n1', idempotent: true },
    note: '1 人店，系统按上周记录轮转'
  },
  {
    id: 'SL-V306', containerId: 'C-02', shiftId: 'CS-202', name: '通班时段', nature: 'required',
    days: [1, 2, 3, 4, 5, 6, 0], capacity: 2, source: 'custom', templateId: null,
    quota: { service: 'fixed', params: { value: 2 }, windowMin: 10, adjusted: null },
    generation: { cadence: 'monthly', day: 25, time: '09:00', horizon: 'month', idempotent: true },
    note: '兜底承接时段：随月度晚峰一起铺，不单独发布规则'
  },
  {
    id: 'SL-V308', containerId: 'C-03', shiftId: 'CS-301', name: '行政班时段', nature: 'required',
    days: [1, 2, 3, 4, 5], capacity: 2, source: 'template', templateId: 'ST-V5',
    quota: { service: 'fixed', params: { value: 2 }, windowMin: 10, adjusted: null },
    generation: { cadence: 'monthly', day: 25, time: '09:00', horizon: 'month', idempotent: true },
    note: '按月铺整月，系统直派'
  },
  {
    id: 'SL-V309', containerId: 'C-04', shiftId: 'CS-401', name: '保洁早段', nature: 'required',
    days: [1, 2, 3, 4, 5, 6, 0], capacity: 4, source: 'template', templateId: 'ST-V6',
    quota: { service: 'headcount', params: { headcount: 4, factor: 1 }, windowMin: 10, adjusted: null },
    generation: { cadence: 'weekly', weekday: 1, time: '08:00', horizon: 'n1', idempotent: true },
    note: '周一铺下周，系统直派到人'
  }
]
export const findSlot3 = id => V3_SLOTS.find(s => s.id === id) || null
export const slotsOf3 = containerId => V3_SLOTS.filter(s => s.containerId === containerId)

/* ---- 时段模板：纯时间形态，不含任何「谁能领」 ----
 * owner: 'global' 平台全局库（只读，门店只能引入）
 *        '<容器 id>' 门店引入了全局模板（或自己新建）→ 门店自有，可改可删
 * derivedFrom: 从哪条全局模板引入来的
 */
export const V3_SLOT_TPL = [
  {
    id: 'ST-V1', name: '每天 · 早班 · 6 个名额', scope: '通用', owner: 'global', derivedFrom: null,
    shiftTemplateId: 'SH-01', days: [1, 2, 3, 4, 5, 6, 0], capacity: 6, nature: 'required',
    quota: { service: 'headcount', params: { headcount: 8, factor: 0.75 }, windowMin: 10, adjusted: null },
    generation: { cadence: 'weekly', weekday: 4, time: '06:00', horizon: 'n1', idempotent: true }
  },
  {
    id: 'ST-V2', name: '每天 · 晚班 · 3 个名额', scope: '通用', owner: 'global', derivedFrom: null,
    shiftTemplateId: 'SH-02', days: [1, 2, 3, 4, 5, 6, 0], capacity: 3, nature: 'optional',
    quota: { service: 'volume', params: { volumeHours: 24, shiftHours: 8 }, windowMin: 15, adjusted: null },
    generation: { cadence: 'weekly', weekday: 4, time: '06:00', horizon: 'n1', idempotent: true }
  },
  {
    id: 'ST-V3', name: '每天 · 非全晚峰 · 3 个名额', scope: '通用', owner: 'global', derivedFrom: null,
    shiftTemplateId: 'SH-05', days: [1, 2, 3, 4, 5, 6, 0], capacity: 3, nature: 'optional',
    quota: { service: 'fixed', params: { value: 3 }, windowMin: 10, adjusted: null },
    generation: { cadence: 'weekly', weekday: 4, time: '06:00', horizon: 'n1', idempotent: true }
  },
  {
    id: 'ST-V4', name: '每月 · 非全晚峰 · 4 个名额', scope: '通用', owner: 'global', derivedFrom: null,
    shiftTemplateId: 'SH-05', days: [1, 2, 3, 4, 5, 6, 0], capacity: 4, nature: 'optional',
    quota: { service: 'signRatio', params: { signed: 8, divisor: 2 }, windowMin: 10, adjusted: null },
    generation: { cadence: 'monthly', day: 25, time: '09:00', horizon: 'month', idempotent: true }
  },
  {
    id: 'ST-V5', name: '每月 · 行政班 · 2 个名额', scope: '办公地点', owner: 'global', derivedFrom: null,
    shiftTemplateId: 'SH-04', days: [1, 2, 3, 4, 5], capacity: 2, nature: 'required',
    quota: { service: 'fixed', params: { value: 2 }, windowMin: 10, adjusted: null },
    generation: { cadence: 'monthly', day: 25, time: '09:00', horizon: 'month', idempotent: true }
  },
  {
    id: 'ST-V6', name: '每天 · 保洁早段 · 4 个名额', scope: '城市', owner: 'global', derivedFrom: null,
    shiftTemplateId: 'SH-06', days: [1, 2, 3, 4, 5, 6, 0], capacity: 4, nature: 'required',
    quota: { service: 'headcount', params: { headcount: 4, factor: 1 }, windowMin: 10, adjusted: null },
    generation: { cadence: 'weekly', weekday: 1, time: '08:00', horizon: 'n1', idempotent: true }
  },
  /* 门店引入后改了名额的自有模板（示例：兴隆湖把早班名额提到 8） */
  {
    id: 'ST-C011', name: '兴隆湖 · 早班 · 8 个名额', scope: '门店', owner: 'C-01', derivedFrom: 'ST-V1',
    shiftTemplateId: 'SH-01', days: [1, 2, 3, 4, 5, 6, 0], capacity: 8, nature: 'required',
    quota: { service: 'fixed', params: { value: 8 }, windowMin: 10, adjusted: null },
    generation: { cadence: 'weekly', weekday: 4, time: '06:00', horizon: 'n1', idempotent: true }
  }
]
export const findSlotTpl3 = id => V3_SLOT_TPL.find(t => t.id === id) || null

/* ---- ③ 名额获取：独立对象 ---- */
export const V3_MODES = [
  { value: 'direct', label: '系统直派', hint: '没有申领动作：系统按名单/轮转直接出结果，只发通知' },
  { value: 'grab', label: '公布即抢', hint: '公布即可申领，先到先得、当场生效，没有审核' },
  { value: 'review', label: '申领审核', hint: '先申领，到截止时刻在申领人里按业绩排序截断' }
]
export const modeOf3 = v => V3_MODES.find(m => m.value === v) || V3_MODES[0]
export const BALANCE_MODES = [
  { value: 'reRound', label: '再开一轮申领', hint: '余额留到下一轮，还没结果的人自己再申' },
  { value: 'sequence', label: '兜底序列', hint: '按顺序吃本容器其他时段的剩余名额' },
  { value: 'none', label: '余额不管', hint: '剩下的名额留空，不补人' }
]
export const balanceOf3 = v => BALANCE_MODES.find(b => b.value === v) || BALANCE_MODES[2]

/** 轮：开放 → 截止 → 结算。anchor 三种：d（排班日 N 天前）/ generated（生成即开放）/ month（每月 X 日） */
export const V3_RULES = [
  {
    id: 'AC-01', name: '推拿师早班 · 业绩审核两轮', mode: 'review',
    balance: 'sequence', fallbackSlotIds: ['SL-V302', 'SL-V303'],
    balanceNote: '两轮后仍没班的人，先吃晚班余量，晚班满了再兜通班；都满则留空',
    rounds: [
      {
        id: 'AC-01-R1', name: '第一轮申领', crowds: ['全日制推拿师'],
        open: { kind: 'd', before: 4, time: '06:00' },
        close: { kind: 'd', before: 1, time: '22:00' },
        settle: 'onClose',
        audit: { metrics: [{ name: '产值', weight: 40 }, { name: '回头率', weight: 30 }, { name: '预约率', weight: 30 }], tiebreak: '回头率', period: '上一周期已发布排班' }
      },
      {
        id: 'AC-01-R2', name: '第二轮再申领', crowds: ['全日制推拿师'],
        open: { kind: 'd', before: 1, time: '22:00' },
        close: { kind: 'd', before: 0, time: '06:00' },
        settle: 'onClose',
        audit: { metrics: [{ name: '产值', weight: 40 }, { name: '回头率', weight: 30 }, { name: '预约率', weight: 30 }], tiebreak: '回头率', period: '上一周期已发布排班' }
      }
    ]
  },
  {
    id: 'AC-02', name: '晚班 · 公布即抢', mode: 'grab',
    balance: 'none', fallbackSlotIds: [], balanceNote: '抢完为止，剩下的不补',
    rounds: [
      { id: 'AC-02-R1', name: '公布窗口', crowds: ['非全推拿师'], open: { kind: 'd', before: 4, time: '06:00' }, close: null, settle: 'instant', audit: null }
    ]
  },
  {
    id: 'AC-03', name: '办公区行政班 · 系统直派', mode: 'direct',
    balance: 'none', fallbackSlotIds: [], balanceNote: '编制固定，不设申领',
    rounds: [
      { id: 'AC-03-R1', name: '生成即安排', crowds: ['全栈工程师'], open: { kind: 'generated' }, close: null, settle: 'instant', audit: null }
    ]
  },
  {
    id: 'AC-04', name: '麓山非全晚峰 · 错峰自领', mode: 'grab',
    balance: 'sequence', fallbackSlotIds: ['SL-V306'], balanceNote: '没领到的兜底到通班，通班也满则留空',    rounds: [
      { id: 'AC-04-R1', name: '客户经理先领', crowds: ['非全客户经理'], open: { kind: 'generated' }, close: null, settle: 'instant', audit: null },
      { id: 'AC-04-R2', name: '推拿师晚 6 小时', crowds: ['非全推拿师'], open: { kind: 'generated', offsetH: 6 }, close: null, settle: 'instant', audit: null }
    ],
    claimLimit: { perDay: 4 }
  },
  {
    id: 'AC-05', name: '麓山黄金早班 · 轮转直派', mode: 'direct',
    balance: 'none', fallbackSlotIds: [], balanceNote: '1 人店，按上周记录轮',
    rounds: [
      { id: 'AC-05-R1', name: '按上周记录', crowds: ['全日制客户经理'], open: { kind: 'generated' }, close: null, settle: 'instant', audit: null }
    ],
    rotate: true
  },
  {
    id: 'AC-06', name: '保洁 · 直派到人', mode: 'direct',
    balance: 'none', fallbackSlotIds: [], balanceNote: '点位固定，人事直接排',
    rounds: [
      { id: 'AC-06-R1', name: '生成即安排', crowds: ['保洁'], open: { kind: 'generated' }, close: null, settle: 'instant', audit: null }
    ]
  }
]
export const findRule3 = id => V3_RULES.find(r => r.id === id) || null

/** 时段 → 挂的规则（v3 一个时段只挂一套规则） */
export const RULE_OF_SLOT = {
  'SL-V301': 'AC-01', 'SL-V302': 'AC-02',
  'SL-V304': 'AC-04', 'SL-V305': 'AC-05', 'SL-V308': 'AC-03', 'SL-V309': 'AC-06'
}
export const ruleOfSlot3 = slotId => findRule3(RULE_OF_SLOT[slotId])
export const slotsOnRule3 = ruleId => V3_SLOTS.filter(s => RULE_OF_SLOT[s.id] === ruleId)

/* ---- 规则编辑：人群枚举 / 空稿 / 校验 / 按配法命名 ---- */
export const V3_CROWDS = [
  '全日制推拿师', '非全推拿师', '全日制客户经理', '非全客户经理', '储备客户经理', '全栈工程师', '保洁'
]
export const blankRule3 = (mode = 'grab') => ({
  id: '', name: '', mode, balance: 'none', fallbackSlotIds: [], balanceNote: '',
  rounds: [{
    id: 'r1', name: '第一轮', crowds: [],
    open: mode === 'direct' ? { kind: 'generated' } : { kind: 'd', before: 4, time: '06:00' },
    close: mode === 'review' ? { kind: 'd', before: 1, time: '22:00' } : null,
    settle: mode === 'review' ? 'onClose' : 'instant',
    audit: mode === 'review'
      ? { metrics: [{ name: '产值', weight: 40 }, { name: '回头率', weight: 30 }, { name: '预约率', weight: 30 }], tiebreak: '回头率', period: '上一周期已发布排班' }
      : null
  }]
})
/** 校验：返回人话错误清单，空数组＝可保存 */
export const validateRule3 = draft => {
  const errs = []
  if (!String(draft?.name || '').trim()) errs.push('规则名称不能为空（建议按配法命名，如「两轮审核+兜底晚班再通班」）')
  if (!draft?.rounds?.length) errs.push('至少要有一轮')
  for (const [i, rd] of (draft?.rounds || []).entries()) {
    if (!rd.crowds?.length) errs.push(`第 ${i + 1} 轮没选人群`)
    if (!rd.open || !rd.open.kind) errs.push(`第 ${i + 1} 轮没设开放时点`)
    if (draft.mode === 'review' && !rd.close) errs.push(`第 ${i + 1} 轮是审核模式，必须设申领截止`)
    if (draft.mode === 'review' && !rd.audit) errs.push(`第 ${i + 1} 轮缺审核口径`)
  }
  if (draft?.balance === 'sequence' && !draft.fallbackSlotIds?.length) errs.push('余额选了兜底序列，但没排兜底时段')
  return errs
}
/** 按配法命名：把「几轮审核 + 余额去向」拼成名字，不带岗位名 */
export const ruleNamePattern3 = (draft, shiftNameOf = id => id) => {
  const parts = []
  const cn = { 1: '一', 2: '两', 3: '三', 4: '四', 5: '五' }
  if (draft.mode === 'review') parts.push(`${cn[draft.rounds?.length] || draft.rounds?.length || 1}轮审核`)
  else if (draft.mode === 'grab') parts.push('公布即抢')
  else parts.push('系统直派')
  if (draft.balance === 'sequence' && draft.fallbackSlotIds?.length) {
    parts.push('兜底' + draft.fallbackSlotIds.map(id => String(shiftNameOf(id)).replace(/时段$/, '')).join('再'))
  } else if (draft.balance === 'reRound') parts.push('余额再开一轮')
  else parts.push('余额不管')
  return parts.join('+')
}

/* ---- 人员（v3 新花名册，与 v1/v2 不共用） ---- */
export const V3_PEOPLE = [
  { id: 'E-101', name: '程野', crowd: '全日制推拿师', containerId: 'C-01', scores: { 产值: 90, 回头率: 86, 预约率: 82 }, applySeq: 1 },
  { id: 'E-102', name: '傅平', crowd: '全日制推拿师', containerId: 'C-01', scores: { 产值: 86, 回头率: 80, 预约率: 84 }, applySeq: 2 },
  { id: 'E-103', name: '葛覃', crowd: '全日制推拿师', containerId: 'C-01', scores: { 产值: 80, 回头率: 77, 预约率: 72 }, applySeq: 3 },
  { id: 'E-104', name: '何弦', crowd: '全日制推拿师', containerId: 'C-01', scores: { 产值: 74, 回头率: 73, 预约率: 70 }, applySeq: 4 },
  { id: 'E-105', name: '简宁', crowd: '全日制推拿师', containerId: 'C-01', scores: { 产值: 68, 回头率: 66, 预约率: 64 }, applySeq: 5 },
  { id: 'E-106', name: '康乐', crowd: '全日制推拿师', containerId: 'C-01', scores: { 产值: 62, 回头率: 61, 预约率: 60 }, applySeq: 6 },
  { id: 'E-107', name: '蓝田', crowd: '全日制推拿师', containerId: 'C-01', scores: { 产值: 56, 回头率: 58, 预约率: 55 }, applySeq: 7 },
  { id: 'E-108', name: '林深', crowd: '全日制推拿师', containerId: 'C-01', scores: { 产值: 50, 回头率: 52, 预约率: 50 }, applySeq: 8 },
  { id: 'E-201', name: '麦青', crowd: '非全推拿师', containerId: 'C-01', signDate: '2026-03-08', applySeq: 1 },
  { id: 'E-202', name: '南星', crowd: '非全推拿师', containerId: 'C-01', signDate: '2026-05-19', applySeq: 2 },
  { id: 'E-301', name: '裴照', crowd: '全日制客户经理', containerId: 'C-02', applySeq: 1 },
  { id: 'E-302', name: '祁连', crowd: '全日制客户经理', containerId: 'C-02', applySeq: 2 },
  { id: 'E-303', name: '任白', crowd: '储备客户经理', containerId: 'C-02', applySeq: 1 },
  { id: 'E-401', name: '沈砚', crowd: '非全客户经理', containerId: 'C-02', signDate: '2026-02-20', applySeq: 1 },
  { id: 'E-402', name: '谈笑', crowd: '非全客户经理', containerId: 'C-02', signDate: '2026-04-16', applySeq: 2 },
  { id: 'E-403', name: '万舟', crowd: '非全客户经理', containerId: 'C-02', signDate: '2026-06-25', applySeq: 3 },
  { id: 'E-404', name: '夏木', crowd: '非全客户经理', containerId: 'C-02', signDate: '2026-08-30', applySeq: 4 },
  { id: 'E-405', name: '应期', crowd: '非全推拿师', containerId: 'C-02', signDate: '2026-07-11', applySeq: 5 },
  { id: 'E-406', name: '钟离', crowd: '非全推拿师', containerId: 'C-02', signDate: '2026-09-02', applySeq: 6 },
  { id: 'E-501', name: '白榆', crowd: '全栈工程师', containerId: 'C-03', applySeq: 1 },
  { id: 'E-502', name: '仓庚', crowd: '全栈工程师', containerId: 'C-03', applySeq: 2 },
  { id: 'E-601', name: '程净', crowd: '保洁', containerId: 'C-04', applySeq: 1 },
  { id: 'E-602', name: '杜洁', crowd: '保洁', containerId: 'C-04', applySeq: 2 },
  { id: 'E-603', name: '范清', crowd: '保洁', containerId: 'C-04', applySeq: 3 },
  { id: 'E-604', name: '洪亮', crowd: '保洁', containerId: 'C-04', applySeq: 4 }
]
export const findPerson3 = id => V3_PEOPLE.find(p => p.id === id) || null
export const peopleOf3 = (crowd, containerId) =>
  V3_PEOPLE.filter(p => p.crowd === crowd && p.containerId === containerId)

/* ---- 时间工具 ---- */
const pad2 = n => String(n).padStart(2, '0')
export const fmtDate = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
export const parseDate = s => new Date(`${s}T00:00:00`)
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
export const minutesOf3 = hhmm => {
  if (!hhmm || !hhmm.includes(':')) return 0
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + (m || 0)
}
export const netHours3 = sh => (!sh ? 0 : Math.max(0, (minutesOf3(sh.end) - minutesOf3(sh.start) - (sh.breakMin || 0)) / 60))
export const weekdayOf = dateStr => parseDate(dateStr).getDay()
export const nextMonday3 = (now = new Date()) => {
  const d = new Date(now)
  return addDays(d, (8 - d.getDay()) % 7 || 7)
}
export const weekOf = monday => Array.from({ length: 7 }, (_, i) => fmtDate(addDays(monday, i)))
export const batchOf3 = (now = new Date()) => weekOf(nextMonday3(now))
export const currentWeekOf3 = (now = new Date()) => weekOf(addDays(nextMonday3(now), -7))
export const monthDaysOf3 = (now = new Date()) => {
  const y = now.getFullYear(); const m = now.getMonth()
  const total = new Date(y, m + 2, 0).getDate()
  return Array.from({ length: total }, (_, i) => fmtDate(new Date(y, m + 1, i + 1)))
}
export const monthLabel3 = (now = new Date()) => {
  const y = now.getFullYear(); const m = now.getMonth() + 2
  return `${m > 12 ? y + 1 : y} 年 ${m > 12 ? m - 12 : m} 月`
}
export const weekParity3 = dateStr => {
  const d = parseDate(dateStr)
  const utcDays = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000
  return Math.floor((utcDays + 3) / 7) % 2
}
export const weekdayLabel3 = dateStr => `周${'日一二三四五六'[weekdayOf(dateStr)]}`

/** 轮的锚点 → 具体时刻（排班日往前推；跨日写法 25:00 = 次日 01:00） */
export const anchorTime3 = (anchor, dateStr) => {
  if (!anchor) return null
  const base = parseDate(dateStr)
  if (anchor.kind === 'generated') return new Date(base.getFullYear(), base.getMonth(), base.getDate() - 60, 0, 0)
  if (anchor.kind === 'month') {
    const d = new Date(base.getFullYear(), base.getMonth(), anchor.day)
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0)
  }
  const before = anchor.before || 0
  const [h, m] = (anchor.time || '00:00').split(':').map(Number)
  const dayOffset = Math.floor(h / 24)
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() - before + dayOffset, h % 24, m || 0)
}
export const timeNote = a => {
  if (!a) return '—'
  if (a.kind === 'generated') return '生成即开放'
  if (a.kind === 'month') return `每月 ${a.day} 日 ${a.time}`
  if (a.before === 0) return `排班日当天 ${a.time}`
  return `排班日 ${a.before} 天前 ${a.time}`
}
/** 轮状态：pending 未开始 / open 申领中 / settled 已结算 */
export const roundState3 = (round, dateStr, now = new Date()) => {
  const open = anchorTime3(round.open, dateStr)
  if (open && now < open) return 'pending'
  const close = round.close ? anchorTime3(round.close, dateStr) : null
  if (close && now >= close) return 'settled'
  return round.settle === 'instant' ? 'settled' : 'open'
}

/* ---- 名额获取的引擎（确定性模拟，页面与测试共用） ---- */
export const PASS_LINE3 = 60
export const scoreOf3 = p => p.scores
  ? Math.round((p.scores.产值 * 0.4 + p.scores.回头率 * 0.3 + p.scores.预约率 * 0.3) * 10) / 10
  : 0
const overlap = (a, b) => a.start < b.end && b.start < a.end

/**
 * 跑一批：现在时刻 → 结果表 + 申领单（待审）+ 实例状态
 * 顺序：各时段自己结算 → 全部结算完再做兜底（兜底吃的是「已结算时段的余量」）
 */
export function runBatch3 (now = new Date(), opts = {}) {
  const slots = opts.slots || V3_SLOTS
  const rules = opts.rules || V3_RULES
  const people = opts.people || V3_PEOPLE
  const ruleOf = slotId => rules.find(r => r.id === (opts.ruleOf ? opts.ruleOf(slotId) : RULE_OF_SLOT[slotId])) || null

  const ranges = {
    current: currentWeekOf3(now),
    next: batchOf3(now),
    month: monthDaysOf3(now)
  }
  const instances = []
  for (const slot of slots) {
    const g = slot.generation
    if (!g || g.cadence === 'manual') continue
    const days = g.horizon === 'month' ? ranges.month : g.horizon === 'days14'
      ? Array.from({ length: 14 }, (_, i) => fmtDate(addDays(now, i)))
      : [...ranges.current, ...ranges.next]
    for (const date of days) {
      if (!(slot.days || []).includes(weekdayOf(date))) continue
      const rule = ruleOf(slot.id)
      instances.push({ slot, date, rule, shift: findShift3(slot.shiftId) })
    }
  }

  const results = []
  const applications = []
  const assigned = new Set() // personId|date|slotId
  const personDay = (pid, date) => results.filter(r => r.personId === pid && r.date === date)
  const hasResult = (pid, slotId, date) => assigned.has(`${pid}|${date}|${slotId}`)
  const pushResult = (inst, person, way, extra = {}) => {
    const { slot, date, shift } = inst
    assigned.add(`${person.id}|${date}|${slot.id}`)
    results.push({
      id: `R-${results.length + 1}`, date, slotId: slot.id, containerId: slot.containerId,
      shiftName: shift.name, start: shift.start, end: shift.end, hours: netHours3(shift),
      personId: person.id, personName: person.name, crowd: person.crowd,
      way, ruleId: inst.rule?.id || '', ...extra
    })
  }
  const fitsTime = (person, date, shift, containerId) => personDay(person.id, date).every(r => {
    const a = { start: minutesOf3(shift.start), end: minutesOf3(shift.end) }
    if (r.containerId !== containerId) { a.start -= 30; a.end += 30 } // 跨店留 30 分钟通勤
    return !overlap(a, { start: minutesOf3(r.start), end: minutesOf3(r.end) })
  })

  const filled = inst => results.filter(r => r.slotId === inst.slot.id && r.date === inst.date).length
  const eligible = (inst, crowds) => crowds.flatMap(c => people.filter(p => p.crowd === c && p.containerId === inst.slot.containerId))

  for (const inst of instances) {
    const { slot, date, rule } = inst
    inst.capacity = slot.capacity
    if (!rule) { inst.state = 'no-rule'; continue }
    inst.state = 'pending'
    if (rule.mode === 'direct') {
      const crowds = rule.rounds[0].crowds
      const pool = eligible(inst, crowds).filter(p => !hasResult(p.id, slot.id, date))
      inst.state = 'settled'
      // 轮转：按周奇偶取一人；其余直派按名单顺序
      if (rule.rotate && pool.length > 1) {
        const start = weekParity3(date) % pool.length
        pushResult(inst, pool[start], '轮转排定')
        inst.state = 'settled'
        continue
      }
      for (const p of pool.slice(0, slot.capacity)) {
        if (!fitsTime(p, date, inst.shift, slot.containerId)) continue
        pushResult(inst, p, '系统直派')
      }
      continue
    }
    if (rule.mode === 'grab') {
      let got = 0
      for (const round of rule.rounds) {
        const st = roundState3(round, date, now)
        if (st === 'pending') { inst.state = inst.state === 'settled' ? 'settled' : 'pending'; break }
        const pool = eligible(inst, round.crowds)
          .filter(p => !hasResult(p.id, slot.id, date))
          .filter(p => fitsTime(p, date, inst.shift, slot.containerId))
          .filter(p => {
            const cap = rule.claimLimit?.perDay || 0
            if (!cap) return true
            const used = personDay(p.id, date).reduce((s, r) => s + r.hours, 0)
            return used + netHours3(inst.shift) <= cap
          })
          .sort((a, b) => (a.applySeq || 99) - (b.applySeq || 99))
        for (const p of pool) {
          if (filled(inst) >= slot.capacity) break
          pushResult(inst, p, '先到先得自领', { roundId: round.id })
          got++
          applications.push({ id: `A-${applications.length + 1}`, slotId: slot.id, date, personId: p.id, personName: p.name, crowd: p.crowd, roundId: round.id, status: 'won' })
        }
        if (filled(inst) >= slot.capacity) break
      }
      inst.state = got >= slot.capacity ? 'settled' : (rule.rounds.some(r => roundState3(r, date, now) === 'open') ? 'open' : 'settled')
      continue
    }
    // review：逐轮 申领 → 截止结算
    for (const round of rule.rounds) {
      const st = roundState3(round, date, now)
      if (st === 'pending') { break }
      const pool = eligible(inst, round.crowds)
        .filter(p => !hasResult(p.id, slot.id, date))
        .filter(p => fitsTime(p, date, inst.shift, slot.containerId))
        .sort((a, b) => (a.applySeq || 99) - (b.applySeq || 99))
      if (!pool.length) continue
      // 申领（确定性的）：已结算的轮全员申领；申领中的轮留出分数最低的两人还没申，
      // 便于演示「申领 → 待审」的完整动作
      // 申领中的轮：按申领先后只模拟「前一半人已申」，窗口本来就还没关
      const applicants = st === 'open' ? pool.slice(0, Math.ceil(pool.length / 2)) : pool
      for (const p of applicants) {
        applications.push({
          id: `A-${applications.length + 1}`, slotId: slot.id, date,
          personId: p.id, personName: p.name, crowd: p.crowd, roundId: round.id,
          status: st === 'open' ? 'pending' : 'lost'
        })
      }
      if (st === 'open') { inst.state = 'open'; break }
      // 截止结算：按审核口径排序，取剩余名额
      const room = slot.capacity - filled(inst)
      const ranked = [...pool].sort((a, b) =>
        scoreOf3(b) - scoreOf3(a) || (b.scores?.回头率 || 0) - (a.scores?.回头率 || 0))
      const winners = ranked.slice(0, Math.max(0, room))
      for (const p of winners) {
        pushResult(inst, p, '审核通过', { roundId: round.id, score: scoreOf3(p) })
        const app = applications.find(a => a.slotId === slot.id && a.date === date && a.personId === p.id && a.roundId === round.id)
        if (app) app.status = 'won'
      }
      inst.state = 'settled'
    }
    inst.filled = filled(inst)
  }

  // 兜底：对每条 review / grab 规则，把「所有轮结束后仍零结果」的人按序列逐档排
  for (const inst of instances) {
    const rule = inst.rule
    if (!rule || !rule.fallbackSlotIds?.length) continue
    if (inst.state !== 'settled') continue
    const crowds = [...new Set(rule.rounds.flatMap(r => r.crowds))]
    const pool = eligible(inst, crowds).filter(p => !hasResult(p.id, inst.slot.id, inst.date))
    for (const person of pool) {
      for (const targetId of rule.fallbackSlotIds) {
        const target = instances.find(i => i.slot.id === targetId && i.date === inst.date)
        if (!target) continue
        if (filled(target) >= target.slot.capacity) continue
        if (!fitsTime(person, inst.date, target.shift, target.slot.containerId)) continue
        pushResult({ ...target, rule }, person, `兜底·${target.shift.name}`, { fromSlotId: inst.slot.id, fallback: true })
        break
      }
    }
  }

  // 落空名额（没人接、也没兜到）
  const unfilled = []
  for (const inst of instances) {
    if (inst.state !== 'settled' || !inst.rule) continue
    const rest = inst.slot.capacity - filled(inst)
    if (rest > 0) {
      unfilled.push({
        date: inst.date, slotId: inst.slot.id, shiftName: inst.shift.name,
        rest, action: balanceOf3(inst.rule.balance).label
      })
    }
  }

  results.sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1
    : a.start < b.start ? -1 : a.start > b.start ? 1 : a.personName < b.personName ? -1 : 1)
  return { results, applications, instances, unfilled }
}

/** 申领单（移动端）：某人某时段的待审/已得/被挤出 */
export const appsOf3 = (batch, personId) =>
  batch.applications.filter(a => a.personId === personId)
