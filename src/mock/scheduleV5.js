/*
  排班策略 v5 · 数据与纯逻辑层
  设计依据：文档中心 → 人事中心 / 排班策略 → 五、需求范围（v3.7 三阶段：定义 / 获取 / 变化）
  四类事实：来不了 / 指定顶班 / 对换 / 资格没了；名额是容量不是库存（N 不变，无回池）；
  求值 = 在已冻结的解上写事实 + 截短事实，每次重算留痕（解版本）。
*/

export const NOW = '2026-11-14 10:00'
export const TODAY = '2026-11-14'
export const WEEK_DATES = [
  '2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21', '2026-11-22'
]

export const SPACES5 = [
  { id: 'S-201', name: '蓝田店', city: '杭州', tag: '旗舰店', bizStart: '10:00', bizEnd: '22:00' },
  { id: 'S-202', name: '滨江店', city: '杭州', tag: '社区店', bizStart: '10:00', bizEnd: '22:00' }
]

export const PEOPLE5 = [
  { id: 'E-107', name: '蓝田', spaceId: 'S-201', kind: 'fulltime', position: '推拿师', score: 86 },
  { id: 'E-113', name: '沈书', spaceId: 'S-201', kind: 'fulltime', position: '客户经理', score: 90 },
  { id: 'E-121', name: '阿禾', spaceId: 'S-201', kind: 'parttime', position: '推拿师', score: 78 },
  { id: 'E-126', name: '小满', spaceId: 'S-201', kind: 'parttime', position: '客户经理', score: 81 },
  { id: 'E-133', name: '陈晚', spaceId: 'S-202', kind: 'fulltime', position: '推拿师', score: 84 },
  { id: 'E-141', name: '周野', spaceId: 'S-202', kind: 'parttime', position: '推拿师', score: 75 }
]

/* 算法服务：只登记不实现。登记四门槛：输入可声明 / 算式可解释 / 可单独调用幂等 / 有版本号 */
export const SERVICES5 = [
  { id: 'AS-01', name: '按在岗人数', input: '人事在册状态', calc: '全员到岗基数 2 人，缺勤 1 人减 1', version: 'v1.3' },
  { id: 'AS-02', name: '按签约人数', input: '合作类型与签约数', calc: '签约非全 ÷ 2 向上取整', version: 'v1.0' },
  { id: 'AS-03', name: '按业务量', input: '业务系统预约量', calc: '每 6 单 1 人，最少 1', version: 'v2.1' }
]

/* 定义段：周期时段（归空间，不归岗位）。清单行 = 谁 · 方式 · 窗口 · 上限 */
export const SLOTS5 = [
  {
    id: 'SL-01', spaceId: 'S-201', name: '早班', start: '10:00', end: '14:00', days: [1, 2, 3, 4, 5],
    quota: { source: 'service', serviceId: 'AS-01' }, clamp: [1, 6], snapN: 3,
    list: [
      { k: 1, who: '本店全职', way: 'direct', win: 'publish' },
      { k: 2, who: '本店非全', way: 'grab', win: 'fri0600' },
      { k: 3, who: '同城推拿师', way: 'grab', win: 'day1' }
    ]
  },
  {
    id: 'SL-02', spaceId: 'S-201', name: '晚班', start: '14:00', end: '22:00', days: [1, 2, 3, 4, 5],
    quota: { source: 'manual', value: 2 }, clamp: [1, 6], snapN: 2,
    list: [
      { k: 1, who: '本店全职', way: 'direct', win: 'publish' },
      { k: 2, who: '本店非全', way: 'grab', win: 'fri0600' }
    ]
  },
  {
    id: 'SL-03', spaceId: 'S-201', name: '周末全天', start: '10:00', end: '22:00', days: [6, 0],
    quota: { source: 'manual', value: 2 }, clamp: [1, 6], snapN: 2,
    list: [
      { k: 1, who: '本店全员', way: 'apply', win: 'publish' }
    ]
  }
]

/* 临时班次 = 特殊情况下新增名额，不进周期安排，改的是那一天的容量 */
export const TEMPS5 = [
  {
    id: 'TL-01', spaceId: 'S-201', date: '2026-11-21', name: '周六晚加场', start: '18:00', end: '22:00',
    quota: { source: 'manual', value: 2 }, snapN: 2,
    list: [{ k: 1, who: '本店全员', way: 'grab', win: 'publish' }]
  }
]

/* 轮：清单切到第 k 档的一段窗口 */
export const ROUND5 = {
  id: 'R-1112', publishedAt: '2026-11-12 06:00', span: ['2026-11-16', '2026-11-22'], k: 2,
  applyDeadline: '2026-11-15 20:00',
  /* 下一轮：配置改动到这时才生效（周四 06:00 生成，铺下周一到周日） */
  nextAt: '2026-11-19 06:00', nextSpan: ['2026-11-23', '2026-11-29'],
  /* 排班节奏：这四个参数以前写死在代码里，页面上没地方配 */
  config: {
    cadence: 'weekly',      // 周期粒度：weekly / monthly
    publishDow: 4,          // 发布时点：周几发布（4=周四）
    publishHour: 6,         // 发布时点：几点
    spanWeeks: 1,           // 覆盖跨度：铺几周
    applyAheadDays: 3,      // 申领截止：发布后第几天
    applyHour: 20           // 申领截止：几点
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

/* 按节奏配置重算「下一轮什么时候生成、铺哪一段」——改了发布时点，预告立刻跟着变 */
export function recalcRound(state) {
  const c = state.round.config || ROUND5.config
  const at = nextDow(state.now.slice(0, 10), c.publishDow)
  state.round.nextAt = `${at} ${String(c.publishHour).padStart(2, '0')}:00`
  /* 覆盖跨度从发布日之后的那个周一开始铺 */
  const mon = nextDow(at, 1)
  state.round.nextSpan = [mon, addDays(mon, c.spanWeeks * 7 - 1)]
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
    history: [{ note: '2026-11-13 09:12 蓝田提交来不了，11-17 早班由陈晚顶上' }]
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
  { id: 'F-01', type: '来不了', at: '2026-11-13 09:12', by: 'E-107', slotId: 'SL-01', date: '2026-11-17',
    result: '班次由陈晚顶上（补位）', placements: ['P-05', 'P-06'] }
]

export const VERSIONS5 = [
  { v: 1, at: '2026-11-12 06:00', note: '第 R-1112 轮发布，生成基线解', facts: [] },
  { v: 2, at: '2026-11-13 09:12', note: '事实 F-01（来不了）重算：11-17 早班由陈晚顶上', facts: ['F-01'] }
]

export const NOTICES5 = [
  { id: 'N-01', to: 'E-133', kind: 'makeup', acked: false, date: '2026-11-17', at: '2026-11-13 09:12',
    text: '补位通知：11-17 早班 10:00-14:00（蓝田店）需要你顶上',
    detail: '蓝田 11-13 09:12 提交来不了；你是同城推拿师档里当时有空、没冲突的人' }
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
  清单行的人群：雇佣类型和岗位都写在人群里，不写在时段上。
  这是「一个时段 A 岗位先挑、B 岗位隔一会儿加入」能成立的前提——时段只有空间，没有岗位。
*/
const KIND_WHO = { 本店全职: 'fulltime', 本店非全: 'parttime' }
export function matchWho5(state, person, slot, whoClass) {
  if (!person || !slot) return false
  const space = spaceById(state, slot.spaceId)
  const home = person.spaceId === slot.spaceId
  const sameCity = !!space && spaceById(state, person.spaceId)?.city === space.city
  if (whoClass === '本店全员') return home
  if (KIND_WHO[whoClass]) return home && person.kind === KIND_WHO[whoClass]
  if (whoClass.startsWith('本店')) return home && person.position === whoClass.slice(2)
  if (whoClass.startsWith('同城')) {
    const pos = whoClass.slice(2)
    return sameCity && !home && (pos === '同岗位' || person.position === pos)
  }
  return false
}

/* 窗口开放时刻：全部按当前轮推算，不再写死某一天 */
export function openAt5(row, round) {
  const R = round || ROUND5
  if (row.win === 'publish') return R.publishedAt
  /* 「周五 06:00 开」= 本轮发布之后的那个周五 06:00 */
  if (row.win === 'fri0600') return `${nextDow(R.publishedAt.slice(0, 10), 5)} 06:00`
  return null // day1 按开班日期算
}
export function windowOpen5(row, date, now = NOW, round = null) {
  let at = openAt5(row, round)
  if (row.win === 'day1') {
    const d = new Date(`${date}T00:00:00`)
    d.setDate(d.getDate() - 1)
    at = `${fmtDate(d)} 20:00`
  }
  return now >= at
}
export function windowLabel5(row) {
  return row.win === 'publish' ? '发布即开' : row.win === 'fri0600' ? '周五 06:00 开' : '开班前一天 20:00 开'
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
  if (!windowOpen5(row, date, now, state.round)) return { ok: false, reason: `还没开：${windowLabel5(row)}` }
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
  if (fact.type === '来不了') {
    const target = state.placements.find(p => p.id === fact.placementId && p.status === 'active')
    if (target) {
      target.status = 'covered'
      target.history.push({ note: `${fact.at} ${personById(state, fact.by)?.name || ''} 提交来不了，班次释放` })
      const rep = pickReplacement5(state, target.slotId, target.date, fact.by)
      if (rep) {
        const np = P(`P-${state.seq++}`, target.slotId, target.date, rep.person.id, '顶班 · 补位', { fromFact: fact.id })
        state.placements.push(np)
        touched.push(target, np)
        fact.result = `班次由 ${rep.person.name} 顶上（补位）`
        state.notices.unshift({
          id: `N-${state.seq++}`, to: rep.person.id, kind: 'makeup', acked: false, date: target.date,
          text: `补位通知：${target.date} ${slotById(state, target.slotId).name} ${slotById(state, target.slotId).start}-${slotById(state, target.slotId).end} 需要你顶上`,
          detail: `${personById(state, fact.by).name} ${fact.at.slice(11)} 提交来不了；你是清单里当时有空、没冲突的人`
        })
      } else {
        fact.result = '暂时没人能顶，时段留空，待人事处理'
      }
    }
  } else if (fact.type === '指定顶班') {
    const np = P(`P-${state.seq++}`, fact.slotId, fact.date, fact.personId, '指定顶班', { fromFact: fact.id })
    state.placements.push(np)
    touched.push(np)
    fact.result = `${personById(state, fact.personId).name} 已被安排顶班（经营性安排，通知即可）`
    state.notices.unshift({
      id: `N-${state.seq++}`, to: fact.personId, kind: 'appoint', acked: false, date: fact.date,
      text: `排班安排：${fact.date} ${slotById(state, fact.slotId).name} ${slotById(state, fact.slotId).start}-${slotById(state, fact.slotId).end}`,
      detail: '人事的经营性安排，不需你同意；如有实际困难联系门店人事'
    })
  } else if (fact.type === '对换') {
    const a = state.placements.find(p => p.id === fact.placementId)
    const b = state.placements.find(p => p.id === fact.partnerPlacementId)
    if (a && b) {
      const pa = a.personId
      const pb = b.personId
      a.personId = pb
      b.personId = pa
      a.history.push({ note: `${fact.at} 与 ${personById(state, pb).name} 对换班次` })
      b.history.push({ note: `${fact.at} 与 ${personById(state, pa).name} 对换班次` })
      fact.result = '两条班次已对调，同时生效'
      touched.push(a, b)
    }
  } else if (fact.type === '资格没了') {
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
