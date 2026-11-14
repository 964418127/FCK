/*
  排班策略 v5 · 数据与纯逻辑层
  设计依据：文档中心 → 人事中心 / 排班策略 → 五、需求范围（v3.7 三阶段：定义 / 获取 / 变化）
  四类事实：请假 / 顶班 / 换班 / 离职；名额是容量不是库存（N 不变，无回池）；
  求值 = 在已冻结的解上写事实 + 截短事实，每次重算留痕（解版本）。
*/

export const NOW = '2026-11-14 10:00'
export const TODAY = '2026-11-14'
export const WEEK_DATES = [
  '2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21', '2026-11-22'
]

export const SPACES5 = [
  { id: 'S-201', name: '蓝田店', city: '杭州', tag: '旗舰店', bizStart: '10:00', bizEnd: '22:00', xy: [0, 0] },
  { id: 'S-202', name: '滨江店', city: '杭州', tag: '社区店', bizStart: '10:00', bizEnd: '22:00', xy: [4.2, 1.8] },
  { id: 'S-203', name: '观澜店', city: '成都', tag: '标准店', bizStart: '11:00', bizEnd: '21:00', xy: [0, 0] },
  { id: 'S-204', name: '金牛店', city: '成都', tag: '社区店', bizStart: '11:00', bizEnd: '21:00', xy: [3.5, 2.2] }
]

/* 岗位字典：通用排班系统不写死某几个岗位，弹窗里从这里出 */
export const JOBS5 = ['推拿师', '客户经理', '店长', '前台', '保洁']

export const PEOPLE5 = [
  { id: 'E-107', name: '蓝田', spaceId: 'S-201', kind: 'fulltime', position: '推拿师', score: 86 },
  { id: 'E-113', name: '沈书', spaceId: 'S-201', kind: 'fulltime', position: '客户经理', score: 90 },
  { id: 'E-121', name: '阿禾', spaceId: 'S-201', kind: 'parttime', position: '推拿师', score: 78 },
  { id: 'E-126', name: '小满', spaceId: 'S-201', kind: 'parttime', position: '客户经理', score: 81 },
  { id: 'E-133', name: '陈晚', spaceId: 'S-202', kind: 'fulltime', position: '推拿师', score: 84 },
  { id: 'E-141', name: '周野', spaceId: 'S-202', kind: 'parttime', position: '推拿师', score: 75 },
  { id: 'E-150', name: '小唐', spaceId: 'S-203', kind: 'fulltime', position: '推拿师', score: 88 },
  { id: 'E-151', name: '阿橙', spaceId: 'S-203', kind: 'parttime', position: '客户经理', score: 79 }
]

/* 算法服务：只登记不实现。登记四门槛：输入可声明 / 算式可解释 / 可单独调用幂等 / 有版本号 */
export const SERVICES5 = [
  { id: 'AS-01', name: '按在岗人数', input: '人事在册状态', calc: '全员到岗基数 2 人，缺勤 1 人减 1', version: 'v1.3' },
  { id: 'AS-02', name: '按签约人数', input: '合作类型与签约数', calc: '签约非全 ÷ 2 向上取整', version: 'v1.0' },
  { id: 'AS-03', name: '按业务量', input: '业务系统预约量', calc: '每 6 单 1 人，最少 1', version: 'v2.1' }
]

/* 定义段：周期时段（归空间，不归岗位）。清单行 = 谁（范围+合作性质+岗位三个条件） · 方式 · 窗口 · 上限
   「谁」是圈人的搜索条件：{ scope: 'store'|'radius', km, kind: 'all'|'fulltime'|'parttime', pos: 'all'|'推拿师'|'客户经理' }
   范围默认本店；往外放用「附近 N 公里」（半径圈，含本店），不用「同城」这种粗旷说法 */
export const SLOTS5 = [
  {
    id: 'SL-01', spaceId: 'S-201', name: '早班', start: '10:00', end: '14:00', days: [1, 2, 3, 4, 5],
    quota: { source: 'service', serviceId: 'AS-01' }, clamp: [1, 6], snapN: 3,
    list: [
      { k: 1, who: { scope: 'store', kind: 'fulltime', pos: 'all' }, way: 'direct', win: { base: 'publish', d: 0, t: '06:00' } },
      { k: 2, who: { scope: 'store', kind: 'parttime', pos: 'all' }, way: 'grab', win: { base: 'week', dow: 5, t: '06:00' } },
      { k: 3, who: { scope: 'radius', km: 5, kind: 'all', pos: '推拿师' }, way: 'grab', win: { base: 'date', d: -1, t: '20:00' } }
    ]
  },
  {
    id: 'SL-02', spaceId: 'S-201', name: '晚班', start: '14:00', end: '22:00', days: [1, 2, 3, 4, 5],
    quota: { source: 'manual', value: 2 }, clamp: [1, 6], snapN: 2,
    list: [
      { k: 1, who: { scope: 'store', kind: 'fulltime', pos: 'all' }, way: 'direct', win: { base: 'publish', d: 0, t: '06:00' } },
      { k: 2, who: { scope: 'store', kind: 'parttime', pos: 'all' }, way: 'grab', win: { base: 'week', dow: 5, t: '06:00' } }
    ]
  },
  {
    id: 'SL-03', spaceId: 'S-201', name: '周末全天', start: '10:00', end: '22:00', days: [6, 0],
    quota: { source: 'manual', value: 2 }, clamp: [1, 6], snapN: 2,
    list: [
      { k: 1, who: { scope: 'store', kind: 'all', pos: 'all' }, way: 'apply', win: { base: 'publish', d: 0, t: '06:00' } }
    ]
  },
  {
    id: 'SL-04', spaceId: 'S-203', name: '晚市班', start: '17:00', end: '21:00', days: [1, 2, 3, 4, 5],
    quota: { source: 'service', serviceId: 'AS-03' }, clamp: [1, 4], snapN: 2,
    list: [
      { k: 1, who: { scope: 'store', kind: 'all', pos: '推拿师' }, way: 'apply', win: { base: 'publish', d: 0, t: '06:00' } },
      { k: 2, who: { scope: 'store', kind: 'parttime', pos: 'all' }, way: 'grab', win: { base: 'week', dow: 5, t: '06:00' } }
    ]
  },
  {
    id: 'SL-05', spaceId: 'S-203', name: '周末午市', start: '11:00', end: '15:00', days: [6, 0],
    quota: { source: 'manual', value: 3 }, clamp: [1, 4], snapN: 3,
    list: [
      { k: 1, who: { scope: 'store', kind: 'all', pos: 'all' }, way: 'grab', win: { base: 'publish', d: 0, t: '06:00' } }
    ]
  }
]

/* 临时班次 = 特殊情况下新增名额，不进周期安排，改的是那一天的容量 */
export const TEMPS5 = [
  {
    id: 'TL-01', spaceId: 'S-201', date: '2026-11-21', name: '周六晚加场', start: '18:00', end: '22:00',
    quota: { source: 'manual', value: 2 }, snapN: 2,
    list: [{ k: 1, who: { scope: 'store', kind: 'all', pos: 'all' }, way: 'grab', win: { base: 'publish', d: 0, t: '06:00' } }]
  }
]

/* 轮：清单切到第 k 档的一段窗口 */
export const ROUND5 = {
  id: 'R-1112', publishedAt: '2026-11-12 06:00', span: ['2026-11-16', '2026-11-22'], k: 2,
  applyDeadline: '2026-11-15 20:00',
  /* 下一轮：配置改动到这时才生效 */
  nextAt: '2026-11-19 06:00', nextSpan: ['2026-11-23', '2026-11-29'],
  /*
    排班节奏：通用抽象，四个参数，不写死周/月枚举
    cycle  = 循环周期：锚点（自然周一起 / 自然月 1 号 / 业务自定义起点）+ 长度（n 天 / n 周 / n 月）
    every  = 多久发一次（每期 = 1，隔一期 = 2）
    偏移   = 都相对「周期起点」：负数=提前，发布与申领截止各一条
    现行口径：自然周 + 提前 4 天 06:00 发（周四）+ 提前 1 天 20:00 申领截止（周日）
  */
  config: {
    cycle: { anchor: 'monday', unit: 'week', n: 1, start: '' },
    every: 1,
    publishOffsetDays: -4,
    publishHour: 6,
    applyOffsetDays: -1,
    applyHour: 20
  }
}

/* 往后的第 N 个星期几（含当天） */
export function nextDow(fromDate, dow) {
  const d = new Date(`${fromDate}T00:00:00`)
  const add = (dow - d.getDay() + 7) % 7
  d.setDate(d.getDate() + add)
  return fmtDate(d)
}
export function addDays(date, n) {
  const d = new Date(`${date}T00:00:00`)
  d.setDate(d.getDate() + n)
  return fmtDate(d)
}

/* ===== 节奏计算：周期起点 / 终点 / 期号 / 下一轮预告 ===== */
const DAY_MS = 86400000
const at0 = s => new Date(`${s}T00:00:00`)
function blockDays(cycle) {
  return (cycle.unit === 'week' ? 7 : 1) * (cycle.n || 1)
}
/* 期号从哪一天起算：自然周从 2026-01-05（周一）、自然月从 2026-01、自定义从起点 */
function cycleBase(cycle) {
  if (cycle.anchor === 'monday') return '2026-01-05'
  if (cycle.anchor === 'monthStart') return '2026-01-01'
  return cycle.start
}
export function cycleStartOf(cycle, dateStr) {
  const dt = at0(dateStr)
  const base = at0(cycleBase(cycle))
  const n = cycle.n || 1
  if (cycle.unit === 'month') {
    /* 按月切块，但保留起点那天（自定义 26 日 – 次月 25 日这种） */
    const months = (dt.getFullYear() - base.getFullYear()) * 12 + (dt.getMonth() - base.getMonth())
    let k = Math.floor(months / n) * n
    let cand = monthAnchor(base, k)
    if (cand > dt) { k -= n; cand = monthAnchor(base, k) }
    return fmtDate(cand)
  }
  if (cycle.anchor === 'monday') {
    const dow = (dt.getDay() + 6) % 7 // 周一=0
    const mon = new Date(dt)
    mon.setDate(mon.getDate() - dow)
    if (n === 1) return fmtDate(mon)
    const len = blockDays(cycle)
    const k = Math.floor((mon - base) / (DAY_MS * len))
    return fmtDate(new Date(base.getTime() + k * DAY_MS * len))
  }
  const len = blockDays(cycle)
  const k = Math.floor((dt - base) / (DAY_MS * len))
  return fmtDate(new Date(base.getTime() + k * DAY_MS * len))
}
/* 第 k 个月的锚点日（31 日这种不存在的日子落到当月最后一天） */
function monthAnchor(base, k) {
  const y = base.getFullYear()
  const m = base.getMonth() + k
  const last = new Date(y, m + 1, 0).getDate()
  return new Date(y, m, Math.min(base.getDate(), last))
}
export function cycleEndOf(cycle, startStr) {
  const s = at0(startStr)
  if (cycle.unit === 'month') {
    const next = monthAnchor(s, cycle.n || 1)
    next.setDate(next.getDate() - 1)
    return fmtDate(next)
  }
  return fmtDate(new Date(s.getTime() + (blockDays(cycle) - 1) * DAY_MS))
}
export function cycleIndex(cycle, startStr) {
  const base = at0(cycleBase(cycle))
  if (cycle.unit === 'month') {
    const s = at0(startStr)
    return (s.getFullYear() - base.getFullYear()) * 12 + (s.getMonth() - base.getMonth())
  }
  return Math.round((at0(startStr) - base) / (DAY_MS * blockDays(cycle)))
}
function shiftCycle(cycle, startStr, k = 1) {
  const s = at0(startStr)
  if (cycle.unit === 'month') return fmtDate(monthAnchor(s, (cycle.n || 1) * k))
  return fmtDate(new Date(s.getTime() + blockDays(cycle) * k * DAY_MS))
}
/* 发布时刻相对周期起点算 */
export function publishAtOf(config, cycleStart) {
  const d = at0(cycleStart)
  d.setDate(d.getDate() + (config.publishOffsetDays || 0))
  return `${fmtDate(d)} ${String(config.publishHour ?? 6).padStart(2, '0')}:00`
}
export function applyDeadlineOf(config, cycleStart) {
  const d = at0(cycleStart)
  d.setDate(d.getDate() + (config.applyOffsetDays || 0))
  return `${fmtDate(d)} ${String(config.applyHour ?? 20).padStart(2, '0')}:00`
}
/* 下一个「会真正发布」的期：隔期发的期号跳过 */
export function nextRoundPlan(config, now = NOW) {
  let start = cycleStartOf(config.cycle, now.slice(0, 10))
  const every = config.every || 1
  for (let i = 0; i < 400; i++) {
    const pub = publishAtOf(config, start)
    if (pub >= now && cycleIndex(config.cycle, start) % every === 0) {
      return { nextAt: pub, nextSpan: [start, cycleEndOf(config.cycle, start)], cycleStart: start }
    }
    start = shiftCycle(config.cycle, start, 1)
  }
  return null
}

/* 按节奏配置重算「下一轮什么时候生成、铺哪一段」——改了节奏，预告立刻跟着变 */
export function recalcRound(state) {
  const plan = nextRoundPlan(state.round.config || ROUND5.config, state.now)
  if (plan) {
    state.round.nextAt = plan.nextAt
    state.round.nextSpan = plan.nextSpan
  }
  return state.round
}

const P = (id, slotId, date, personId, way, extra = {}) => ({
  id, slotId, date, personId, way, status: 'active', history: [], ...extra
})

/* 获取段结果（解的基线，v1 于发布时生成） */
export const PLACEMENTS5 = [
  P('P-01', 'SL-01', '2026-11-16', 'E-113', '直派 · 第1档'),
  P('P-03', 'SL-01', '2026-11-16', 'E-133', '抢 · 第3档'),
  P('P-04', 'SL-01', '2026-11-17', 'E-113', '直派 · 第1档'),
  P('P-05', 'SL-01', '2026-11-17', 'E-107', '直派 · 第1档', {
    status: 'covered', coveredAt: '2026-11-13 09:12',
    history: [{ note: '2026-11-13 09:12 蓝田提交请假，11-17 早班由陈晚顶上' }]
  }),
  P('P-06', 'SL-01', '2026-11-17', 'E-133', '顶班 · 补位', { fromFact: 'F-01' }),
  P('P-07', 'SL-01', '2026-11-17', 'E-126', '抢 · 第2档'),
  P('P-08', 'SL-01', '2026-11-18', 'E-113', '直派 · 第1档'),
  P('P-09', 'SL-01', '2026-11-18', 'E-107', '直派 · 第1档'),
  P('P-10', 'SL-01', '2026-11-19', 'E-107', '直派 · 第1档'),
  P('P-11', 'SL-01', '2026-11-19', 'E-126', '抢 · 第2档'),
  P('P-12', 'SL-01', '2026-11-20', 'E-113', '直派 · 第1档'),
  P('P-13', 'SL-01', '2026-11-20', 'E-107', '直派 · 第1档'),
  P('P-14', 'SL-02', '2026-11-16', 'E-107', '直派 · 第1档'),
  P('P-15', 'SL-02', '2026-11-16', 'E-121', '抢 · 第2档'),
  P('P-16', 'SL-02', '2026-11-17', 'E-107', '直派 · 第1档'),
  P('P-17', 'SL-02', '2026-11-17', 'E-121', '抢 · 第2档'),
  P('P-18', 'SL-02', '2026-11-18', 'E-107', '直派 · 第1档'),
  P('P-19', 'SL-02', '2026-11-18', 'E-121', '抢 · 第2档'),
  P('P-20', 'SL-02', '2026-11-19', 'E-107', '直派 · 第1档'),
  P('P-21', 'SL-02', '2026-11-19', 'E-121', '抢 · 第2档'),
  P('P-22', 'SL-02', '2026-11-20', 'E-107', '直派 · 第1档'),
  P('P-23', 'SL-02', '2026-11-20', 'E-121', '抢 · 第2档')
]

/* 申领登记：提交只登记，截止后按综合分排序截断 */
export const APPLICATIONS5 = [
  { id: 'A-01', slotId: 'SL-03', date: '2026-11-21', personId: 'E-107', at: '2026-11-12 08:10' },
  { id: 'A-02', slotId: 'SL-03', date: '2026-11-21', personId: 'E-121', at: '2026-11-12 09:02' },
  { id: 'A-03', slotId: 'SL-03', date: '2026-11-21', personId: 'E-126', at: '2026-11-12 11:40' }
]

/* 变化段：事实清单 */
export const FACTS5 = [
  { id: 'F-01', type: '请假', at: '2026-11-13 09:12', by: 'E-107', slotId: 'SL-01', date: '2026-11-17',
    result: '班次由陈晚顶上（补位）', placements: ['P-05', 'P-06'] }
]

export const VERSIONS5 = [
  { v: 1, at: '2026-11-12 06:00', note: '第 R-1112 轮发布，生成基线解', facts: [] },
  { v: 2, at: '2026-11-13 09:12', note: '事实 F-01（请假）重算：11-17 早班由陈晚顶上', facts: ['F-01'] }
]

export const NOTICES5 = [
  { id: 'N-01', to: 'E-133', kind: 'makeup', acked: false, date: '2026-11-17', at: '2026-11-13 09:12',
    text: '补位通知：11-17 早班 10:00-14:00（蓝田店）需要你顶上',
    detail: '蓝田 11-13 09:12 提交请假；你是附近 5km 推拿师档里当时有空、没冲突的人' }
]

/* ===== 纯逻辑 ===== */

export function slotById(state, id) {
  return state.slots.find(s => s.id === id) || state.temps.find(s => s.id === id)
}
export function personById(state, id) {
  return state.people.find(p => p.id === id)
}
export function spaceById(state, id) {
  return state.spaces.find(s => s.id === id)
}
/*
  名额快照：默认取时段模板上的 N；
  某一天被单独调过（人事在这一天加减人），就取这一天的数——只影响那一天，不动模板。
*/
export function snapN5(state, slotId, date = '') {
  const s = slotById(state, slotId)
  if (!s) return 0
  const k = `${slotId}|${date}`
  if (date && state.dayQuota && state.dayQuota[k] != null) return state.dayQuota[k]
  return s.snapN
}
export function activeCount5(state, slotId, date) {
  return state.placements.filter(p => p.slotId === slotId && p.date === date && p.status === 'active').length
}
export function slotsOn5(state, date) {
  const dow = new Date(`${date}T00:00:00`).getDay()
  return [...state.slots.filter(s => s.days.includes(dow)), ...state.temps.filter(t => t.date === date)]
}

/*
  天级复制/覆盖：把一天配好的班次照搬（覆盖）到其他天。
  同名同起止才算同一个班次；源天有、目标天没有 → 目标天加上；源天没有、目标天有 → 从目标天移出。
  模板按星期几定义，所以复制按星期几生效——影响每周的同一天，不只是那一格日期。
*/
function sameSlotDef(a, b) { return a.name === b.name && a.start === b.start && a.end === b.end }
export function dayCopyPlan5(slots, srcDow, targetDows) {
  const srcDefs = slots.filter(s => s.days.includes(srcDow))
  const adds = [], removes = []
  for (const t of targetDows) {
    for (const s of slots) {
      const inSrc = srcDefs.some(x => sameSlotDef(x, s))
      const inTgt = s.days.includes(t)
      const label = `${s.name} ${s.start}–${s.end}`
      if (inSrc && !inTgt) adds.push({ name: label, dow: t })
      if (!inSrc && inTgt) removes.push({ name: label, dow: t })
    }
  }
  return { adds, removes }
}
export function applyDayCopy5(slots, srcDow, targetDows) {
  const srcDefs = slots.filter(s => s.days.includes(srcDow))
  for (const t of targetDows) {
    for (const s of slots) {
      const inSrc = srcDefs.some(x => sameSlotDef(x, s))
      const has = s.days.includes(t)
      if (inSrc && !has) s.days = [...s.days, t].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7))
      if (!inSrc && has) s.days = s.days.filter(d => d !== t)
    }
  }
}

/*
  清单行的「谁」：范围（本店/附近 N 公里）+ 合作性质（不限/全职/非全）+ 岗位（不限/具体岗位）
  三个条件组合圈人，不写在时段上——「一个时段 A 岗位先挑、B 岗位隔一会儿加入」能成立的前提。
  范围半径按门店坐标算（含本店）。
*/
export function whoLabel5(who) {
  if (!who) return ''
  if (typeof who === 'string') return who // 兼容旧字符串口径
  const scope = who.scope === 'radius' ? `附近 ${who.km}km` : '本店'
  const kind = who.kind === 'fulltime' ? '全职' : who.kind === 'parttime' ? '非全' : ''
  const pos = who.pos && who.pos !== 'all' ? who.pos : ''
  if (!kind && !pos) return scope === '本店' ? '本店全员' : `${scope}全员`
  return `${scope} · ${kind}${pos}`.replace(/\s+$/, '')
}
export function matchWho5(state, person, slot, who) {
  if (!person || !slot) return false
  if (typeof who === 'string') who = { scope: who.startsWith('同城') ? 'radius' : 'store', km: 999, kind: 'all', pos: who.includes('推拿师') ? '推拿师' : who.includes('客户经理') ? '客户经理' : who.includes('全职') ? 'fulltime' : who.includes('非全') ? 'parttime' : 'all' }
  const space = spaceById(state, slot.spaceId)
  const personSpace = spaceById(state, person.spaceId)
  if (who.scope === 'store') {
    if (person.spaceId !== slot.spaceId) return false
  } else {
    const dist = Math.hypot(space.xy[0] - personSpace.xy[0], space.xy[1] - personSpace.xy[1])
    if (dist > (who.km || 0)) return false
  }
  if (who.kind !== 'all' && person.kind !== who.kind) return false
  if (who.pos && who.pos !== 'all' && person.position !== who.pos) return false
  return true
}

/* 开放窗口 = 锚点 + 偏移。锚点：publish=发布时刻 / week=发布后的某个星期几 / date=开班日；
   配置里只存锚点和偏移，展示一律落成具体日期时间（windowLabel5） */
export function normWin5(w) {
  if (typeof w === 'string') {
    if (w === 'fri0600') return { base: 'week', dow: 5, t: '06:00' }
    if (w === 'day1') return { base: 'date', d: -1, t: '20:00' }
    return { base: 'publish', d: 0, t: '06:00' }
  }
  return { d: 0, dow: 1, t: '06:00', ...w }
}
/* 档位挂的时段在这一轮的第一天（开班日相对的窗口用它落具体日期） */
export function slotFirstDate5(slot) {
  if (slot?.date) return slot.date
  return WEEK_DATES.find(d => slot?.days?.includes(new Date(`${d}T00:00:00`).getDay())) || WEEK_DATES[0]
}
/* 窗口开放时刻：按当前轮推算成具体时间 */
export function openAt5(row, round, date = null) {
  const R = round || ROUND5
  const w = normWin5(row.win)
  const pub = R.publishedAt
  if (w.base === 'publish') {
    if (!w.d) return pub
    const d0 = new Date(`${pub.slice(0, 10)}T00:00:00`)
    d0.setDate(d0.getDate() + w.d)
    return `${fmtDate(d0)} ${w.t}`
  }
  if (w.base === 'week') return `${nextDow(pub.slice(0, 10), w.dow)} ${w.t}`
  if (!date) return null
  const d0 = new Date(`${date}T00:00:00`)
  d0.setDate(d0.getDate() + (w.d || 0))
  return `${fmtDate(d0)} ${w.t}`
}
export function windowOpen5(row, date, now = NOW, round = null) {
  const at = openAt5(row, round, date)
  return at ? now >= at : false
}
/* 展示成用户可读的具体日期时间：给 date 按那天算，给 slot 取这一轮第一天 */
export function windowLabel5(row, slot = null, date = null, round = null) {
  const R = round || ROUND5
  const w = normWin5(row.win)
  const at = openAt5(row, R, date || (slot ? slotFirstDate5(slot) : null))
  const short = at ? at.slice(5, 16) : ''
  if (w.base === 'publish' && !w.d) return `发布即开（${short}）`
  if (w.base === 'publish') return `${short} 开（发布后 ${w.d} 天）`
  if (w.base === 'week') return `${short} 开（发布后的周${'日一二三四五六'[w.dow]}）`
  const rel = w.d === 0 ? '开班当天' : w.d < 0 ? `开班前 ${-w.d} 天` : `开班后 ${w.d} 天`
  return `${short} 开（${rel}）`
}

export function gateLabel5(row, slot) {
  if (row.way === 'direct') return '发布即定，不用抢'
  if (row.way === 'apply') return `截止 ${ROUND5.applyDeadline} · 按综合分排序截断`
  return `开班（${slot.start}）即关闸`
}

/* 时段重叠冲突（首尾相接可以） */
export function overlap5(aS, aE, bS, bE) {
  return aS < bE && bS < aE
}
export function hours5(start, end) {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return (eh * 60 + em - (sh * 60 + sm)) / 60
}
export function personBusy5(state, personId, date, start, end, exceptId = null) {
  return state.placements.some(p => p.personId === personId && p.date === date && p.status === 'active'
    && p.id !== exceptId && overlap5(start, end, slotById(state, p.slotId).start, slotById(state, p.slotId).end))
}
/* 工时按各岗位规则：全职超限记加班（放行），非全超限排不了 */
export function worktimeOk5(state, person, date, start, end, exceptId = null) {
  if (person.kind === 'fulltime') return { ok: true, overtime: false }
  let mins = (hours5(start, end) * 60)
  state.placements.forEach(p => {
    if (p.personId === person.id && p.date === date && p.status === 'active' && p.id !== exceptId) {
      mins += hours5(slotById(state, p.slotId).start, slotById(state, p.slotId).end) * 60
    }
  })
  return { ok: mins <= 480, overtime: false }
}

/* 可获取清单：窗口已开、关闸未到、人群匹配、还有空位 */
export function openOffers5(state, personId, now = NOW) {
  const person = personById(state, personId)
  const out = []
  const all = [...state.slots, ...state.temps]
  all.forEach(slot => {
    WEEK_DATES.filter(d => slotsOn5(state, d).some(s => s.id === slot.id) || slot.date === d)
      .forEach(date => {
        slot.list.forEach(row => {
          if (!matchWho5(state, person, slot, row.who)) return
          if (row.way === 'direct') return
          if (!windowOpen5(row, date, now, state.round)) return
          if (row.way === 'grab' && now >= `${date}T${slot.start}:00`.replace('T', ' ')) return
          if (state.placements.some(p => p.slotId === slot.id && p.date === date && p.personId === personId && p.status === 'active')) return
          const occ = activeCount5(state, slot.id, date)
          if (row.way === 'grab' && occ >= snapN5(state, slot.id, date)) return
          if (row.way === 'apply' && state.applications.some(a => a.slotId === slot.id && a.date === date && a.personId === personId)) return
          out.push({ slotId: slot.id, date, row, slot })
        })
      })
  })
  return out
}

/* 这一档已经占到几个（按人群算，不是按档号猜） */
export function rowUsed5(state, slotId, date, slot, row) {
  return state.placements.filter(p =>
    p.slotId === slotId && p.date === date && p.status === 'active' &&
    matchWho5(state, personById(state, p.personId), slot, row.who)
  ).length
}

/* 能不能拿：可见 ≠ 可拿，可拿层要给具体原因（员工侧同一套判定，抢单时不会再变） */
export function canTake5(state, slotId, date, personId, way = 'grab', now = NOW) {
  const slot = slotById(state, slotId)
  const person = personById(state, personId)
  if (!slot || !person) return { ok: false, reason: '这个时段不存在' }
  const rows = slot.list.filter(r => r.way === way)
  if (!rows.length) return { ok: false, reason: way === 'apply' ? '这个时段不走申领' : '这个时段不靠抢' }
  const row = rows.find(r => matchWho5(state, person, slot, r.who))
  if (!row) return { ok: false, reason: '这一档不是你的档' }
  if (!windowOpen5(row, date, now, state.round)) return { ok: false, reason: `还没开：${windowLabel5(row, null, date, state.round)}` }
  /* 行上限：这一档给几个就几个，多的留给下一档 */
  if (row.cap && rowUsed5(state, slotId, date, slot, row) >= row.cap) {
    return { ok: false, reason: `这一档只留 ${row.cap} 个，已经满了` }
  }
  if (way === 'grab') {
    if (now >= `${date}T${slot.start}:00`.replace('T', ' ')) return { ok: false, reason: '已开班，闸关了' }
    if (activeCount5(state, slotId, date) >= snapN5(state, slotId, date)) return { ok: false, reason: '位已占满' }
    if (personBusy5(state, personId, date, slot.start, slot.end)) return { ok: false, reason: '和已有班次时间撞了' }
    const wt = worktimeOk5(state, person, date, slot.start, slot.end)
    if (!wt.ok) return { ok: false, reason: '非全当日工时已满 8 小时，排不了' }
  } else {
    if (now >= ROUND5.applyDeadline) return { ok: false, reason: '申领已截止' }
    if (state.applications.some(a => a.slotId === slotId && a.date === date && a.personId === personId)) return { ok: false, reason: '已登记过' }
  }
  return { ok: true, row }
}

/* 抢：点了就成，成不了当场说原因 */
export function grab5(state, slotId, date, personId, now = NOW) {
  const chk = canTake5(state, slotId, date, personId, 'grab', now)
  if (!chk.ok) return chk
  state.placements.push(P(`P-${state.seq++}`, slotId, date, personId, `抢 · 第${chk.row.k}档`))
  return { ok: true }
}

/* 申领：提交只登记，截止后按综合分排序截断 */
export function applyFor5(state, slotId, date, personId, now = NOW) {
  const chk = canTake5(state, slotId, date, personId, 'apply', now)
  if (!chk.ok) return chk
  state.applications.push({ id: `A-${state.seq++}`, slotId, date, personId, at: now })
  return { ok: true }
}

/* 截止：按综合分排序截断，落选仍可等下一轮（k 不动） */
export function resolveApplications5(state, date, slotId) {
  const slot = slotById(state, slotId)
  const row = slot.list.find(r => r.way === 'apply')
  const apps = state.applications
    .filter(a => a.slotId === slotId && a.date === date)
    .sort((a, b) => personById(state, b.personId).score - personById(state, a.personId).score)
  const picked = []
  apps.forEach(a => {
    if (picked.length >= snapN5(state, slotId, date)) return
    const p = personById(state, a.personId)
    const wt = worktimeOk5(state, p, date, slot.start, slot.end)
    if (personBusy5(state, a.personId, date, slot.start, slot.end) || !wt.ok) return
    picked.push(a)
  })
  picked.forEach(a => {
    state.placements.push(P(`P-${state.seq++}`, slotId, date, a.personId, `申领 · 排上（综合分${personById(state, a.personId).score}）`))
  })
  state.applications = state.applications.filter(a => !apps.some(x => x.id === a.id && x.date === date && x.slotId === slotId))
  return { picked: picked.map(a => a.personId), rejected: apps.filter(a => !picked.includes(a)).map(a => a.personId) }
}

function fmtDate(d) {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/* 找有空、没冲突的人顶（按清单顺位找匹配人群） */
export function pickReplacement5(state, slotId, date, exceptPersonId = null) {
  const slot = slotById(state, slotId)
  for (const row of slot.list) {
    const cands = state.people.filter(p =>
      matchWho5(state, p, slot, row.who)
      && p.id !== exceptPersonId
      && !personBusy5(state, p.id, date, slot.start, slot.end)
      && worktimeOk5(state, p, date, slot.start, slot.end).ok)
    if (cands.length) return { person: cands[0], row }
  }
  return null
}

function bumpVersion5(state, note, factId) {
  const v = state.versions[state.versions.length - 1].v + 1
  state.versions.push({ v, at: NOW, note, facts: factId ? [factId] : [] })
  return v
}

/* 求值：写事实 + 截短事实。一个事实 = 一次重算 = 一个解版本 */
export function addFact5(state, fact) {
  state.facts.push(fact)
  const touched = []
  if (fact.type === '请假') {
    const target = state.placements.find(p => p.id === fact.placementId && p.status === 'active')
    if (target) {
      target.status = 'covered'
      target.history.push({ note: `${fact.at} ${personById(state, fact.by)?.name || ''} 提交请假，这段时间被请假占用` })
      const rep = pickReplacement5(state, target.slotId, target.date, fact.by)
      if (rep) {
        const np = P(`P-${state.seq++}`, target.slotId, target.date, rep.person.id, '顶班 · 补位', { fromFact: fact.id })
        state.placements.push(np)
        touched.push(target, np)
        fact.result = `班次由 ${rep.person.name} 顶上（补位）`
        state.notices.unshift({
          id: `N-${state.seq++}`, to: rep.person.id, kind: 'makeup', acked: false, date: target.date,
          text: `补位通知：${target.date} ${slotById(state, target.slotId).name} ${slotById(state, target.slotId).start}-${slotById(state, target.slotId).end} 需要你顶上`,
          detail: `${personById(state, fact.by).name} ${fact.at.slice(11)} 提交请假；你是清单里当时有空、没冲突的人`
        })
      } else {
        fact.result = '时段留空，已通知人事处理'
        state.notices.unshift({
          id: `N-${state.seq++}`, to: 'HR', kind: 'hr', acked: false, date: target.date, slotId: target.slotId,
          text: `待处理：${target.date} ${slotById(state, target.slotId).name} 没人能顶`,
          detail: `${personById(state, fact.by).name} ${fact.at.slice(11)} 提交请假；顺位里没有有空、没冲突的人，时段留空，请人事找人顶班`
        })
      }
    }
  } else if (fact.type === '顶班') {
    const np = P(`P-${state.seq++}`, fact.slotId, fact.date, fact.personId, '顶班', { fromFact: fact.id })
    state.placements.push(np)
    touched.push(np)
    fact.result = `${personById(state, fact.personId).name} 已被安排顶班（经营性安排，通知即可）`
    state.notices.unshift({
      id: `N-${state.seq++}`, to: fact.personId, kind: 'appoint', acked: false, date: fact.date,
      text: `排班安排：${fact.date} ${slotById(state, fact.slotId).name} ${slotById(state, fact.slotId).start}-${slotById(state, fact.slotId).end}`,
      detail: '人事的经营性安排，不需你同意；如有实际困难联系门店人事'
    })
    /* 顶上之后，这个时段的「待人事处理」自动销掉 */
    state.notices.forEach(n => {
      if (n.kind === 'hr' && !n.acked && n.slotId === fact.slotId && n.date === fact.date) n.acked = true
    })
  } else if (fact.type === '换班') {
    const a = state.placements.find(p => p.id === fact.placementId)
    const b = state.placements.find(p => p.id === fact.partnerPlacementId)
    if (a && b) {
      const pa = a.personId
      const pb = b.personId
      a.personId = pb
      b.personId = pa
      a.history.push({ note: `${fact.at} 与 ${personById(state, pb).name} 换班` })
      b.history.push({ note: `${fact.at} 与 ${personById(state, pa).name} 换班` })
      fact.result = '两条班次已对调，同时生效'
      touched.push(a, b)
    }
  } else if (fact.type === '离职') {
    state.placements.forEach(p => {
      if (p.personId === fact.by && p.date >= fact.date && p.status === 'active') {
        p.status = 'covered'
        p.history.push({ note: `${fact.at} ${fact.subtype}：人直接出结果，不找人顶` })
        touched.push(p)
      }
    })
    fact.result = `${personById(state, fact.by).name} 从 ${fact.date} 起的结果里直接消失；复职 = 新的资格事实`
  }
  bumpVersion5(state, `事实 ${fact.id}（${fact.type}）重算`, fact.id)
  fact.placements = touched.map(t => t.id)
  return fact
}

export function buildV5State() {
  return {
    seq: 100,
    now: NOW,
    today: TODAY,
    spaces: JSON.parse(JSON.stringify(SPACES5)),
    people: JSON.parse(JSON.stringify(PEOPLE5)),
    services: JSON.parse(JSON.stringify(SERVICES5)),
    slots: JSON.parse(JSON.stringify(SLOTS5)),
    temps: JSON.parse(JSON.stringify(TEMPS5)),
    round: { ...ROUND5 },
    placements: JSON.parse(JSON.stringify(PLACEMENTS5)),
    applications: JSON.parse(JSON.stringify(APPLICATIONS5)),
    facts: JSON.parse(JSON.stringify(FACTS5)),
    versions: JSON.parse(JSON.stringify(VERSIONS5)),
    notices: JSON.parse(JSON.stringify(NOTICES5)),
    swapRequests: [],
    dayQuota: {},
    configDirty: false
  }
}
