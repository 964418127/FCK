/* ============================================================
 * 排班结果模拟 —— 时段与名额 v2 的消化演示层（纯函数，node 可测）
 *
 * 口径：生成时钟铺出「名额实例」→ 各窗口 × 各层消化 → 排班结果记录直写。
 * 这里模拟的是消化完成后的直写结果：谁、哪天、哪个时段、怎么排上的。
 *
 * 模拟假设（原型演示用，不进配置）：
 *   - 人员花名册 SIM_PEOPLE：每类人群 × 每个容器给少量演示人员，
 *     带签约日期 / 自抢顺序 / 业绩三项（产值·回头率·预约率）。
 *   - 综合分 = 产值×0.4 + 回头率×0.3 + 预约率×0.3，审核线 60 分；
 *     「名额按业绩算」（quota algo）= 过审人数为该层可消化名额，超额按分数排序。
 *   - 比例名额（quota ratio）= 该层候选人数 ÷ 除数（向下取整，至少 1）。
 *   - 轮转（state rotate）= 按日期所在周的奇偶交替，模拟「上一周期记录」。
 *   - 个人单日上限（claim.perDay）只拦「可选层」的自领；系统指派不受拦。
 *   - 「重跑窗口」（窗口带 rerunNote）只对上一窗口的落选者开放。
 * ============================================================ */
import { slotSeeds, shiftOf, netHours, keyShortOf, WEEKDAY_NAMES } from './slotModel.js'

/* ---- 演示花名册：五类岗位全覆盖（四类目标岗位 + 储备 / 全栈 / 保洁） ---- */
export const SIM_PEOPLE = [
  // 兴隆湖店 · 全日制推拿师（业绩竞标）
  { id: 'PE-01', name: '阿岳', crowd: '全日制推拿师', storeId: 'P-01', scores: { 产值: 90, 回头率: 85, 预约率: 80 } },
  { id: 'PE-02', name: '陈力', crowd: '全日制推拿师', storeId: 'P-01', scores: { 产值: 85, 回头率: 80, 预约率: 82 } },
  { id: 'PE-03', name: '杜衡', crowd: '全日制推拿师', storeId: 'P-01', scores: { 产值: 80, 回头率: 75, 预约率: 70 } },
  { id: 'PE-04', name: '宫羽', crowd: '全日制推拿师', storeId: 'P-01', scores: { 产值: 62, 回头率: 70, 预约率: 68 } },
  { id: 'PE-05', name: '韩霜', crowd: '全日制推拿师', storeId: 'P-01', scores: { 产值: 55, 回头率: 60, 预约率: 58 } },
  { id: 'PE-06', name: '祁安', crowd: '全日制推拿师', storeId: 'P-01', scores: { 产值: 52, 回头率: 55, 预约率: 58 } },
  // 兴隆湖店 · 非全推拿师（错峰自领；夏至、云杉周三休班 → 名额流入客户经理层）
  { id: 'PE-11', name: '温宁', crowd: '非全推拿师', storeId: 'P-01', signDate: '2026-03-15', claimSeq: 1 },
  { id: 'PE-12', name: '夏至', crowd: '非全推拿师', storeId: 'P-01', signDate: '2026-04-02', claimSeq: 2, restDays: [3] },
  { id: 'PE-13', name: '云杉', crowd: '非全推拿师', storeId: 'P-01', signDate: '2026-05-20', claimSeq: 3, restDays: [3] },
  { id: 'PE-14', name: '白露', crowd: '非全推拿师', storeId: 'P-01', signDate: '2026-06-11', claimSeq: 4 },
  // 兴隆湖店 · 非全客户经理（错峰自领 + 临时指派）
  { id: 'PE-21', name: '江离', crowd: '非全客户经理', storeId: 'P-01', signDate: '2026-02-10', claimSeq: 1 },
  { id: 'PE-22', name: '南乔', crowd: '非全客户经理', storeId: 'P-01', signDate: '2026-06-18', claimSeq: 2 },
  { id: 'PE-23', name: '竹意', crowd: '非全客户经理', storeId: 'P-01', signDate: '2026-07-05', claimSeq: 3 },
  // 麓山店 · 全日制客户经理（轮转）+ 储备
  { id: 'PE-31', name: '岑川', crowd: '全日制客户经理', storeId: 'P-02', claimSeq: 1 },
  { id: 'PE-32', name: '段云', crowd: '全日制客户经理', storeId: 'P-02', claimSeq: 2 },
  { id: 'PE-33', name: '阿澄', crowd: '储备客户经理', storeId: 'P-02', claimSeq: 1 },
  // 麓山店 · 非全客户经理（按月错峰自领）
  { id: 'PE-41', name: '池鱼', crowd: '非全客户经理', storeId: 'P-02', signDate: '2026-03-01', claimSeq: 1 },
  { id: 'PE-42', name: '芦洲', crowd: '非全客户经理', storeId: 'P-02', signDate: '2026-04-11', claimSeq: 2 },
  { id: 'PE-43', name: '松萝', crowd: '非全客户经理', storeId: 'P-02', signDate: '2026-08-02', claimSeq: 3 },
  { id: 'PE-44', name: '苇杭', crowd: '非全客户经理', storeId: 'P-02', signDate: '2026-09-15', claimSeq: 4 },
  // 麓山店 · 非全推拿师（按月错峰自领）
  { id: 'PE-45', name: '沐橙', crowd: '非全推拿师', storeId: 'P-02', signDate: '2026-05-06', claimSeq: 1 },
  { id: 'PE-46', name: '栖迟', crowd: '非全推拿师', storeId: 'P-02', signDate: '2026-06-30', claimSeq: 2 },
  // 城市办公区 · 全栈工程师（按月、系统安排）
  { id: 'PE-51', name: '阿树', crowd: '全栈工程师', storeId: 'P-03', claimSeq: 1 },
  { id: 'PE-52', name: '柏舟', crowd: '全栈工程师', storeId: 'P-03', claimSeq: 2 },
  // 长沙全域 · 保洁（先挑 + 就近顶班兜底）
  { id: 'PE-61', name: '陶净', crowd: '保洁', storeId: 'P-04', claimSeq: 1 },
  { id: 'PE-62', name: '于勤', crowd: '保洁', storeId: 'P-04', claimSeq: 2 },
  { id: 'PE-63', name: '艾尘', crowd: '保洁', storeId: 'P-04', claimSeq: 3 },
  { id: 'PE-64', name: '拂晓', crowd: '保洁', storeId: 'P-04', claimSeq: 4 }
]

/* ---- 时间工具 ---- */
const pad2 = n => String(n).padStart(2, '0')
export const fmtDate = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
export const parseDate = s => new Date(`${s}T00:00:00`)
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
/** 下一个周一（今天在本周 → 下周一；今天周日 → 明天） */
export const nextMonday = (today = new Date()) => {
  const d = new Date(today)
  const diff = (8 - d.getDay()) % 7 || 7
  return addDays(d, diff)
}
/** 下一批（每周生成铺出的下一周）：周一 ~ 周日 */
export const nextBatchRange = (today = new Date()) => {
  const mon = nextMonday(today)
  return Array.from({ length: 7 }, (_, i) => fmtDate(addDays(mon, i)))
}
/** 下一自然月的全部日期（按月生成铺出的整月） */
export const nextMonthDays = (today = new Date()) => {
  const y = today.getFullYear(); const m = today.getMonth()
  const total = new Date(y, m + 2, 0).getDate()
  return Array.from({ length: total }, (_, i) => fmtDate(new Date(y, m + 1, i + 1)))
}
export const nextMonthLabel = (today = new Date()) => {
  const y = today.getFullYear(); const m = today.getMonth() + 2
  return `${m > 12 ? y + 1 : y} 年 ${m > 12 ? m - 12 : m} 月`
}
/** 周奇偶（模拟轮转的「上一周期记录」）：按 UTC 日序 + 周一锚定，同一自然周内恒定 */
export const weekParity = dateStr => {
  const d = parseDate(dateStr)
  const utcDays = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000
  return Math.floor((utcDays + 3) / 7) % 2
}
export const weekdayLabel = dateStr => `周${WEEKDAY_NAMES[parseDate(dateStr).getDay()]}`
export const batchLabel = (today = new Date()) => {
  const days = nextBatchRange(today)
  return `${days[0].slice(5)} ~ ${days[6].slice(5)}`
}

/* ---- 评分与名额口径 ---- */
export const PASS_LINE = 60
export const compositeScore = p =>
  Math.round((p.scores.产值 * 0.4 + p.scores.回头率 * 0.3 + p.scores.预约率 * 0.3) * 10) / 10

/** 该层可消化名额数（模拟口径见文件头）。ratio 的基数 = 门店签约人数（不随当天休班变化） */
function quotaCount (tier, pool, remaining, signed) {
  const q = tier.quota || { mode: 'all' }
  if (q.mode === 'all') return remaining
  if (q.mode === 'count') return Math.min(q.value || 0, remaining)
  if (q.mode === 'ratio') return Math.min(Math.max(1, Math.floor(signed / (q.divisor || 1))), remaining, pool.length)
  if (q.mode === 'algo') return Math.min(pool.filter(p => compositeScore(p) >= PASS_LINE).length, remaining)
  return remaining
}

/** 候选排序：由裁决键决定（参数化口径的模拟落地） */
function pickOrder (key, pool, date) {
  const bySeq = [...pool].sort((a, b) => (a.claimSeq || 99) - (b.claimSeq || 99))
  if (key?.type === 'perf') {
    return [...pool].sort((a, b) =>
      compositeScore(b) - compositeScore(a) || (b.scores.回头率 || 0) - (a.scores.回头率 || 0))
  }
  if (key?.mode === 'sign') {
    return [...pool].sort((a, b) => (a.signDate || '9999') < (b.signDate || '9999') ? -1 : 1)
  }
  if (key?.mode === 'hire') {
    return [...pool].sort((a, b) => (a.id || '') < (b.id || '') ? -1 : 1)
  }
  if (key?.type === 'state') {
    const start = weekParity(date) % bySeq.length
    return bySeq.map((_, i) => bySeq[(start + i) % bySeq.length])
  }
  return bySeq // time-first / manual / none：按自抢顺序（none 是无竞争直达）
}

/* ---- 「怎么排上的」人话标签（展示层，不含配置术语） ---- */
const WAY_OF = {
  'perf|composite': '业绩竞标',
  'time|first': '先到先得自领',
  'time|sign': '签约早优先',
  'relation|sign': '签约早优先',
  'relation|near': '同城就近顶班',
  'state|rotate': '轮转排定',
  'manual|assign': '点名指派',
  'none|direct': '系统安排'
}
const ASSIGN_MODES = ['sign', 'hire', 'entry']
export const wayFor = tier => {
  const base = WAY_OF[`${tier.key?.type}|${tier.key?.mode}`] || keyShortOf(tier.key)
  const assigned = tier.obligation === 'duty' &&
    (tier.key?.type === 'relation' || ASSIGN_MODES.includes(tier.key?.mode))
  return assigned ? `系统指派 · ${base}` : base
}

/* ---- 名额实例：按生成节奏铺日期 ---- */
function buildInstances (today, slots) {
  const weekDays = nextBatchRange(today)
  const monthDays = nextMonthDays(today)
  const midDays = Array.from({ length: 14 }, (_, i) => fmtDate(addDays(today, i + 1)))
  const out = []
  for (const slot of slots) {
    if (!shiftOf(slot)) continue
    if (slot.kind === 'temp') {
      if (slot.date) out.push({ slot, date: slot.date, scope: 'temp' })
      continue
    }
    const g = slot.generation
    if (!g || g.cadence === 'manual') continue
    const days = g.horizon === 'month' ? monthDays : g.horizon === 'days14' ? midDays : weekDays
    for (const d of days) {
      if ((slot.days || []).includes(parseDate(d).getDay())) {
        out.push({ slot, date: d, scope: g.horizon === 'month' ? 'month' : 'week' })
      }
    }
  }
  return out
}

/* ---- 消化：一条时段实例走完 窗口 × 层，产出排班结果 ---- */
export function simulate (today = new Date(), slots = slotSeeds, roster = SIM_PEOPLE) {
  const held = {} // personId|date → 已排工时（单日上限用）
  const entries = []
  const unfilled = []
  for (const { slot, date, scope } of buildInstances(today, slots)) {
    const sh = shiftOf(slot)
    const hours = netHours(slot)
    const perDay = slot.claim?.perDay || 0
    const cap = slot.capacity?.value || 0
    const assigned = new Set()
    const losers = new Set() // 上一窗口落选者（重跑窗口只对她们开放）
    const hrs = p => held[`${p.id}|${date}`] || 0
    const crowdPool = c => roster.filter(p => p.crowd === c && p.storeId === slot.containerId)
    const push = (p, tier) => {
      assigned.add(p.id)
      held[`${p.id}|${date}`] = hrs(p) + hours
      entries.push({
        scope, date,
        containerId: slot.containerId,
        slotId: slot.id,
        shiftName: sh.name,
        time: `${sh.start} - ${sh.end}`,
        hours,
        personId: p.id,
        personName: p.name,
        crowd: p.crowd,
        way: wayFor(tier),
        note: tier.note || ''
      })
    }
    for (const w of slot.windows || []) {
      for (const tier of w.tiers || []) {
        const remaining = cap - assigned.size
        if (remaining <= 0) break
        // 比例名额的基数 = 该层人群在本容器的签约人数（不随当天休班变化）
        const signed = (tier.crowds || []).reduce(
          (s, c) => s + roster.filter(p => p.crowd === c && p.storeId === slot.containerId).length, 0)
        let pool = (tier.crowds || []).flatMap(crowdPool).filter(p => !assigned.has(p.id))
        if (w.rerunNote) pool = pool.filter(p => losers.has(p.id))
        if (!pool.length) continue
        // 可选层的自领受「当天休班」与「个人单日上限」约束；必选层是系统安排，不受拦
        if (tier.obligation !== 'duty') {
          pool = pool.filter(p => !(p.restDays || []).includes(parseDate(date).getDay()))
          if (perDay > 0) pool = pool.filter(p => hrs(p) + hours <= perDay)
          if (!pool.length) continue
        }
        const n = quotaCount(tier, pool, remaining, signed)
        if (n <= 0) {
          pool.forEach(p => losers.add(p.id))
          continue
        }
        pickOrder(tier.key, pool, date).slice(0, n).forEach(p => push(p, tier))
        pool.forEach(p => { if (!assigned.has(p.id)) losers.add(p.id) })
      }
      if (cap - assigned.size <= 0) break
    }
    const rest = cap - assigned.size
    if (rest > 0) {
      unfilled.push({
        date, scope, slotId: slot.id, containerId: slot.containerId,
        shiftName: sh.name, rest, leftover: slot.leftover || '留待派发'
      })
    }
  }
  entries.sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1
      : a.time < b.time ? -1 : a.time > b.time ? 1
        : a.personName < b.personName ? -1 : 1)
  return { entries, unfilled }
}
