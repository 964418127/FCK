/**
 * 时段分配策略：一个班次时段「先给谁看、什么时候放开给下一档」。
 *
 * 三条边界写在这里，页面与文档都照它说话：
 * 1. 策略挂在时段上，任务生成时快照继承；改策略只影响还没生成的周期。
 * 2. 档位顺序、每档人群、每档开放起点全部由业务配置，系统不写死「先推拿师、几小时后给客户经理」。
 *    档位是<strong>累计开放</strong>：某档起点一到它就长期开着，后面的档到点只会「加上去」，
 *    不会把前面已开放的档关掉 —— 任意时刻，所有起点已到的档的人群都可见可接（最大范围）。
 * 3. 人群候选只有三档 —— 本店签约非全客户经理 / 本店非全推拿师 / 本店全职推拿师。
 *    跨店非全客户经理不进候选：那要另签承接协议，本版不做。
 *
 * 纯函数，不碰存储，便于单测。
 */
export const DEFAULT_POLICY_ID = 'policy-default'

export const AUDIENCES = [
  { key: 'am-parttime', label: '本店签约非全客户经理', short: '非全客户经理', position: 'am', employment: 'parttime' },
  { key: 'th-parttime', label: '本店非全推拿师', short: '非全推拿师', position: 'therapist', employment: 'parttime' },
  { key: 'th-full', label: '本店全职推拿师', short: '全职推拿师', position: 'therapist', employment: 'full' }
]

export const STAGE_MODES = [
  { key: 'publish', label: '发布即可见' },
  { key: 'day', label: '排班日起定时' }
]

/** 异常补人的兜底人群：先看本店签约非全客户经理，都不行才落到这里。 */
export const FALLBACKS = [
  { key: 'th-full-latest', label: '本店全职推拿师（最晚签约优先）' },
  { key: 'th-parttime', label: '本店非全推拿师' },
  { key: 'none', label: '不补人，留空档' }
]

/**
 * 异常补人：提前下线后，剩下的那段还值不值得再派一个人。
 * 门槛不是「剩余多久」，而是「扣掉通勤之后还能干多久」—— 到店要时间，那段时间没人付钱。
 * 通勤不做配置项：固定 30 分钟（2026-11-10 与业务核对），exceptionOf 里强制回写。
 */
export const FIXED_COMMUTE_MINUTES = 30
export const DEFAULT_EXCEPTION = { enabled: true, minWorkMinutes: 120, commuteMinutes: FIXED_COMMUTE_MINUTES, fallback: 'th-full-latest' }

export const exceptionOf = policy => ({ ...DEFAULT_EXCEPTION, ...(policy?.exception || {}), commuteMinutes: FIXED_COMMUTE_MINUTES })
export const fallbackLabel = key => FALLBACKS.find(item => item.key === key)?.label || FALLBACKS[0].label
const minutesText = minutes => `${Math.floor(minutes / 60)} 小时${minutes % 60 ? ` ${minutes % 60} 分` : ''}`
export const exceptionThreshold = policy => {
  const rule = exceptionOf(policy)
  return rule.minWorkMinutes + rule.commuteMinutes
}

export const describeException = policy => {
  const rule = exceptionOf(policy)
  if (!rule.enabled) return '未开启：提前下线后不自动补人'
  if (rule.fallback === 'none') return `可用工时 ≥ ${minutesText(rule.minWorkMinutes)}才补；不补人时留空档`
  return `可用工时 ≥ ${minutesText(rule.minWorkMinutes)}才补（通勤固定 30 分钟）· 兜底${fallbackLabel(rule.fallback)}`
}

export const audienceOf = key => AUDIENCES.find(item => item.key === key) || null
export const modeLabel = key => STAGE_MODES.find(item => item.key === key)?.label || '发布即可见'
export const stageModeText = stage => stage.mode === 'publish' ? '发布即可见' : `排班日 ${stage.at} 起`
export const stageText = stage => `${audienceOf(stage.audience)?.short || '未选人群'} · ${stageModeText(stage)}`

/** 内置默认策略：发布即对本店签约非全客户经理开放，先到先得。新建时段默认套这一条。 */
export const initialPolicies = () => [
  {
    id: DEFAULT_POLICY_ID,
    name: '本店非全客户经理',
    builtin: true,
    remark: '发布即对与本店签约的非全客户经理开放，先到先得',
    stages: [{ id: 'st-1', audience: 'am-parttime', mode: 'publish', at: '10:00' }],
    exception: { ...DEFAULT_EXCEPTION }
  },
  {
    id: 'policy-ladder',
    name: '非全优先 · 推拿师兜底',
    builtin: false,
    remark: '发布起本店非全客户经理可见；排班日 09:00 起非全推拿师也可见；11:00 起全职推拿师也可见（累计开放，先开的档不关）',
    stages: [
      { id: 'st-1', audience: 'am-parttime', mode: 'publish', at: '10:00' },
      { id: 'st-2', audience: 'th-parttime', mode: 'day', at: '09:00' },
      { id: 'st-3', audience: 'th-full', mode: 'day', at: '11:00' }
    ],
    exception: { ...DEFAULT_EXCEPTION }
  }
]

const minutesOf = time => {
  const [hours, minutes] = String(time || '00:00').split(':').map(Number)
  return (hours || 0) * 60 + (minutes || 0)
}

/** 发布时刻：优先用批次实际发布时间，退回发布日 06:00（定时发布就是这个点）。 */
export const publicationTimeOf = (slot, publication) => {
  if (publication?.publishedAt) return new Date(publication.publishedAt)
  if (slot?.releaseDate) return new Date(`${slot.releaseDate}T06:00:00`)
  return null
}

export const slotStartOf = slot => new Date(`${slot.date}T${slot.startTime}:00`)

/** 某一档的开放时刻：发布模式取发布时刻，定时模式取排班日当天。 */
export const stageOpenAt = (stage, slot, publication) => {
  if (stage.mode === 'publish') return publicationTimeOf(slot, publication)
  return new Date(`${slot.date}T${stage.at || '00:00'}:00`)
}

/**
 * 档位时间线：每档的开放时刻与关闭时刻（所有档都在时段开始那一刻一起关闭）。
 * 档位累计开放：某档的 closeAt 不是下一档的起点，而是时段开始 —— 后面的档到点只加不放。
 * 页面用它画「谁在什么时候能看到」，文档用它举例。
 */
export const stageTimeline = (policy, slot, publication) => {
  const start = slotStartOf(slot)
  const stages = policy?.stages || []
  return stages.map((stage, index) => {
    const openAt = stageOpenAt(stage, slot, publication) || new Date(0)
    return { index, stage, audience: audienceOf(stage.audience), openAt, closeAt: start, effective: openAt < start }
  })
}

/** 此刻已开放几档：起点已到的档全部算数（累计开放）。 */
export const openStageCountOn = (policy, slot, publication, now = new Date()) => {
  if (slotStartOf(slot) <= now) return 0
  const stages = policy?.stages || []
  let count = 0
  for (const stage of stages) {
    const openAt = stageOpenAt(stage, slot, publication) || new Date(0)
    if (openAt <= now) count += 1
  }
  return count
}

/** 某人是否属于某档人群：岗位、任职形态、且任务门店在其签约门店内。 */
export const audienceMatches = (audienceKey, employee, storeId) => {
  const audience = audienceOf(audienceKey)
  if (!audience || !employee) return false
  if ((employee.position || 'am') !== audience.position) return false
  if ((employee.employment || 'parttime') !== audience.employment) return false
  return (employee.signedStoreIds || []).includes(storeId)
}

/**
 * 可见判定：只回答「这条任务现在该不该出现在这个人面前」。
 * 档位累计开放：只要有一档已到起点且人群命中，就可见 —— 先开放的档不会被后面的档关掉。
 * 能不能接是另一层（签约门店、时长、冲突、通勤、累计、门店数），不在这里混着算。
 */
export const visibilityOf = (slot, employee, policy, publication, now = new Date()) => {
  if (slotStartOf(slot) <= now) return { visible: false, reason: '该时段已开始', stageIndex: -1 }
  const stages = policy?.stages || []
  let opened = 0
  for (let i = 0; i < stages.length; i++) {
    const openAt = stageOpenAt(stages[i], slot, publication) || new Date(0)
    if (openAt > now) continue
    opened += 1
    if (audienceMatches(stages[i].audience, employee, slot.storeId)) {
      return { visible: true, reason: '', stageIndex: i, stage: stages[i] }
    }
  }
  if (!opened) return { visible: false, reason: '任务尚未开放', stageIndex: -1 }
  return { visible: false, reason: '当前未向您开放', stageIndex: opened - 1 }
}

/** 这个人在这条任务上属于第几档（用于说明「还没轮到你」而不是「你不能接」）。 */
export const stageIndexOfPerson = (policy, employee, storeId) => {
  const stages = policy?.stages || []
  for (let i = 0; i < stages.length; i++) {
    if (audienceMatches(stages[i].audience, employee, storeId)) return i
  }
  return -1
}

export const describePolicy = policy => (policy?.stages || []).map(stageText).join(' → ') || '未配置档位'

/** 策略本身的自洽校验：人群不重复、发布模式只能第一档、定时档位必须越放越晚。 */
export const validatePolicy = policy => {
  if (!policy) return '策略不存在'
  if (!String(policy.name || '').trim()) return '请填写策略名称'
  const stages = policy.stages || []
  if (!stages.length) return '至少要有一个档位'
  const seen = new Set()
  let lastDayMinutes = -1
  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i]
    const audience = audienceOf(stage.audience)
    if (!audience) return `第 ${i + 1} 档还没选人群`
    if (seen.has(stage.audience)) return `${audience.short} 重复出现，同一人群只排一档`
    seen.add(stage.audience)
    if (stage.mode !== 'publish' && stage.mode !== 'day') return `第 ${i + 1} 档的开放方式不对`
    if (stage.mode === 'publish' && i > 0) return '「发布即可见」只能放在第一档 —— 发布那一刻还不给看，后面就没有更早的时机了'
    if (stage.mode === 'day') {
      const minutes = minutesOf(stage.at)
      if (!/^\d{2}:\d{2}$/.test(String(stage.at || ''))) return `第 ${i + 1} 档要填开放时间`
      if (minutes <= lastDayMinutes) return '定时开放的档位必须一档比一档晚'
      lastDayMinutes = minutes
    }
  }
  const rule = exceptionOf(policy)
  if (rule.enabled) {
    if (!Number.isFinite(Number(rule.minWorkMinutes)) || Number(rule.minWorkMinutes) < 30 || Number(rule.minWorkMinutes) > 240) return '补人门槛要在 30 分钟到 4 小时之间'
    if (!FALLBACKS.some(item => item.key === rule.fallback)) return '兜底人群没选对'
    if (Number(rule.minWorkMinutes) + FIXED_COMMUTE_MINUTES > 240) return '门槛 + 固定通勤 30 分钟超过 4 小时，单段最长也只有 4 小时，永远补不到人'
  }
  return ''
}

/** 策略套到具体时段上是否成立：定时档不能晚于时段开始，否则那一档永远接不到。 */
export const validatePolicyForSlot = (policy, slot) => {
  const stages = policy?.stages || []
  const start = minutesOf(slot.startTime)
  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i]
    if (stage.mode === 'publish') continue
    if (minutesOf(stage.at) >= start) return `第 ${i + 1} 档「${stageModeText(stage)}」不早于时段开始 ${slot.startTime}，这一档接不到`
  }
  return ''
}
