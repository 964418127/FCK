// 排班策略 v4 运行期数据源：配置层（空间/计划/事件定义）+ 生成批次（快照）
// 与 v3 的区别：这里是「空间 + 岗位」，名额可跨岗位，逆向由事件系统驱动。
import { reactive, computed } from 'vue'
import {
  V4_SPACES, V4_POSITIONS, V4_RULERS, V4_PEOPLE, V4_LEAVES, V4_PLANS,
  runBatch4, quotaOf4, findSpace4, findPlan4, findPosition4, posName4,
  addDays4, weekday4, weekdayLabel4, formsOf4, overtimeMin4, qualify4, timeMin, minTime,
  DEFAULT_AFTERCARE, acMinutes4, fmtDur4, normalizeAftercare4
} from './scheduleV4.js'
import {
  V4_EVENTS, V4_EVENT_DEFS, executeEvent4, capOf4
} from './scheduleV4Events.js'

const clone = x => JSON.parse(JSON.stringify(x))
const nextPlanId = () => {
  const max = v4.plans.reduce((a, p) => Math.max(a, Number(String(p.id).replace(/\D/g, '')) || 0), 0)
  return `PL-${String(max + 1).padStart(2, '0')}`
}

const rangeOf = (from, days) => ({ from, to: addDays4(from, days - 1) })

export const v4 = reactive({
  spaces: V4_SPACES,
  positions: V4_POSITIONS,
  rulers: V4_RULERS,
  people: V4_PEOPLE,
  leaves: clone(V4_LEAVES),
  plans: clone(V4_PLANS),
  events: V4_EVENTS,
  eventDefs: clone(V4_EVENT_DEFS),
  /** 演示批次：铺满 2026 年 11 月（周视野固定看 11-16 那一周，月视野看整月） */
  range: { from: '2026-11-01', to: '2026-11-30' },
  gen: { seq: 1, at: '2026-11-13 07:00' },
  batch: null,
  snapshot: null,
  lastRun: null,
  now: '2026-11-13',
  /** 演示时刻（配合 now 用：取消截止、转移等待期都按这个时刻判） */
  nowClock: '15:00',
  /** 转移邀请：发起 → 等待期 → 接受/拒绝/超时 */
  transfers: [],
  /** 当前演示身份：默认谷雨（麓山非全客户经理，补位故事的主角） */
  me: null
})

/** 跑一批（配置改动只影响下一次生成） */
export const generate4 = () => {
  v4.range = { from: '2026-11-01', to: '2026-11-30' }
  v4.batch = runBatch4({ plans: v4.plans, people: v4.people, leaves: v4.leaves, range: v4.range })
  v4.batch.range = v4.range
  v4.gen.seq += 1
  v4.gen.at = '2026-11-13 07:00'
  v4.snapshot = clone({ plans: v4.plans, leaves: v4.leaves, people: v4.people })
}
generate4()
v4.me = V4_PEOPLE.find(p => p.id === 'E-427') || V4_PEOPLE[0]

/* ---- 演示身份 ---- */
export const me4 = () => v4.me || V4_PEOPLE[0]
export const setMe4 = p => { v4.me = p }

/** 待生效改动：配置层和这一批快照比，差几处 */
export const pendingChanges4 = computed(() => {
  if (!v4.snapshot) return { total: 0, plans: 0, leaves: 0 }
  const diff = (cur, old) => {
    const changed = cur.filter(x => {
      const o = old.find(y => y.id === x.id)
      return !o || JSON.stringify(o) !== JSON.stringify(x)
    }).length
    const removed = old.filter(o => !cur.some(x => x.id === o.id)).length
    return changed + removed
  }
  const plans = diff(v4.plans, v4.snapshot.plans)
  const leaves = diff(v4.leaves, v4.snapshot.leaves)
  return { total: plans + leaves, plans, leaves }
})

/** 撤销改动：回到这一批的快照 */
export const revertChanges4 = () => {
  if (!v4.snapshot) return
  v4.plans = clone(v4.snapshot.plans)
  v4.leaves = clone(v4.snapshot.leaves)
}

/* ---- 计划维护 ---- */
export const upsertPlan4 = draft => {
  const payload = clone(draft)
  delete payload.__new
  if (payload.id) {
    const i = v4.plans.findIndex(p => p.id === payload.id)
    if (i !== -1) v4.plans.splice(i, 1, payload)
    else v4.plans.push(payload)
    return payload
  }
  payload.id = nextPlanId()
  v4.plans.push(payload)
  return payload
}
export const removePlan4 = id => {
  const i = v4.plans.findIndex(p => p.id === id)
  if (i !== -1) v4.plans.splice(i, 1)
}
export const togglePlan4 = id => {
  const p = v4.plans.find(x => x.id === id)
  if (p) p.enabled = p.enabled === false
}

/** 人工调名额：只改生效值，留痕，不动算法初始值 */
export const adjustPlanQuota4 = (planId, value, by = '人事') => {
  const p = v4.plans.find(x => x.id === planId)
  if (!p) return null
  p.quota.adjusted = { value: Math.max(0, Number(value)), by, at: '演示时刻' }
  return p
}
export const clearPlanAdjust4 = planId => {
  const p = v4.plans.find(x => x.id === planId)
  if (p) p.quota.adjusted = null
}

/* ---- 派生查询 ---- */
export const resultsOfDate4 = date => (v4.batch?.results || []).filter(r => r.date === date)
export const instancesOfDate4 = date => (v4.batch?.instances || []).filter(i => i.date === date)
export const planOf4 = id => findPlan4(v4.plans, id)
export const spaceOf4 = id => findSpace4(id)

/** 空间概况：这个空间里有几类人、多少人在册、几个计划 */
export const spaceStats4 = spaceId => {
  const people = v4.people.filter(p => p.spaceId === spaceId && p.active !== false)
  const byPos = {}
  for (const p of people) {
    const k = p.positionId
    byPos[k] = byPos[k] || { positionId: k, name: posName4(k), fulltime: 0, parttime: 0, total: 0 }
    byPos[k][p.employ] += 1
    byPos[k].total += 1
  }
  return {
    positions: Object.values(byPos).sort((a, b) => b.total - a.total),
    people: people.length,
    plans: v4.plans.filter(p => p.spaceId === spaceId).length,
    rulers: v4.rulers.filter(r => r.spaceId === spaceId).length
  }
}

/** 周视野：固定看 11-16 那一周（周一为起始，便于对照营业日） */
export const weekDays4 = () => {
  const out = []
  let d = '2026-11-16'
  for (let i = 0; i < 7; i++) { out.push(d); d = addDays4(d, 1) }
  return out
}
/** 月视野：当月全部日期（用于看按月铺的计划） */
export const monthDays4 = () => {
  const base = v4.range.from.slice(0, 7)
  const first = `${base}-01`
  const days = []
  let d = first
  while (d.slice(0, 7) === base) { days.push(d); d = addDays4(d, 1) }
  return days
}
export const monthLabel4 = () => `${v4.range.from.slice(0, 4)} 年 ${Number(v4.range.from.slice(5, 7))} 月`

/** 批次体检：必选时段空名额、兜底人次、加班人次 */
export const batchStats4 = computed(() => {
  const b = v4.batch
  if (!b) return { rows: 0, fallback: 0, overtime: 0, gaps: 0, gapList: [] }
  const gaps = []
  for (const inst of b.instances) {
    const plan = v4.plans.find(p => p.id === inst.planId)
    if (inst.left > 0 && plan?.nature === 'required') {
      gaps.push({
        date: inst.date, plan: plan?.name, space: findSpace4(inst.spaceId)?.name,
        form: inst.form.name, left: inst.left
      })
    }
  }
  return {
    rows: b.results.length,
    fallback: b.results.filter(r => r.fallback).length,
    overtime: b.results.filter(r => r.overtimeMin > 0).length,
    gaps: gaps.length,
    gapList: gaps
  }
})

/* ---- 事件试跑 ---- */
export const runEvent4 = (defId, payload) => {
  const def = v4.eventDefs.find(d => d.id === defId)
  if (!def || !v4.batch) return null
  const res = executeEvent4(def, payload, {
    batch: v4.batch, plans: v4.plans, people: v4.people, leaves: v4.leaves, events: v4.events
  })
  v4.lastRun = { defId, payload, ...res }
  return v4.lastRun
}
export const capName4 = key => capOf4(key)?.name || key

/** 可试跑的人（按事件给默认值用） */
export const peopleOfSpace4 = spaceId => v4.people.filter(p => p.spaceId === spaceId && p.active !== false)

/* ---- 移动端 · 申领（先到先得的计划才允许当场领） ---- */
/* ---- 档位开放时间（定时生成-可见规则）：档位在名额发布 N 小时后才开放申领 ---- */

const absMin4 = (date, clock) => Math.floor(Date.parse(`${date}T${clock || '00:00'}:00+08:00`) / 60000)

/** 这个档位现在开放了吗：openAt = 名额发布时刻（批次 gen.at）+ delayHours */
export const tierOpenAt4 = tier => {
  const delay = Number(tier?.open?.delayHours || 0)
  if (!delay) return { open: true, at: null }
  const [gd, gc] = String(v4.gen?.at || '2026-11-13 07:00').split(' ')
  const atMin = absMin4(gd, gc) + delay * 60
  const at = new Date(atMin * 60000 + 8 * 3600 * 1000)
    .toISOString().slice(0, 16).replace('T', ' ')
  const now = absMin4(v4.now, v4.nowClock)
  return { open: now >= atMin, at }
}

export const claim4 = (personId, instanceId) => {
  const inst = (v4.batch?.instances || []).find(i => i.id === instanceId)
  const person = v4.people.find(p => p.id === personId)
  if (!inst || !person) return { ok: false, why: '时段或人不存在' }
  if (inst.left <= 0) return { ok: false, why: '名额已经分完' }
  if (!qualify4(person, inst.date, v4.leaves)) return { ok: false, why: '当天请假或不在册' }
  const plan = planOf4(inst.planId)
  const tier = (plan?.priority || []).find(t =>
    !t.fallback && t.positionId === person.positionId && (t.employ === 'any' || t.employ === person.employ))
  if (!tier) return { ok: false, why: '这个名额不在你能领的档位里' }
  // 可见≠可接：档位还没到开放时间，名额看得见也领不了
  if (!inst.manual) {
    const open = tierOpenAt4(tier)
    if (!open.open) return { ok: false, why: `你的档位「${tier.label}」尚未开放（${open.at} 开放，名额发布后 ${tier.open.delayHours} 小时）` }
  }
  if (plan.mode !== 'grab' && !inst.manual) return { ok: false, why: '这个计划不是先到先得，不能直接领' }
  const clash = (v4.batch.results || []).some(r =>
    r.personId === personId && r.date === inst.date &&
    timeMin(r.start) < timeMin(inst.end) && timeMin(inst.start) < timeMin(r.end))
  if (clash) return { ok: false, why: '与已有班次时间冲突（首尾相接可以）' }
  const r = {
    id: `R-${inst.id}-${person.id}`, instanceId: inst.id, planId: inst.planId, spaceId: inst.spaceId,
    date: inst.date, personId: person.id, personName: person.name,
    positionId: person.positionId, positionName: posName4(person.positionId), employ: person.employ,
    formName: inst.form.name, start: inst.start, end: inst.end, way: '先到先得',
    score: person.comp, hours: (timeMin(inst.end) - timeMin(inst.start)) / 60,
    overtimeMin: overtimeMin4(inst.spaceId, person.positionId, inst.start, inst.end),
    fallback: false, fromClaim: true
  }
  v4.batch.results.push(r)
  inst.results.push(r)
  inst.filled += 1
  inst.left -= 1
  return { ok: true, row: r }
}

/** 我能当场申领的时段（名额视野的移动端读法） */
export const claimableOf4 = personId => {
  const person = v4.people.find(p => p.id === personId)
  if (!person || !v4.batch) return []
  return v4.batch.instances.filter(inst => {
    if (inst.fallbackForm || inst.voided || inst.left <= 0) return false
    if (inst.date < v4.now) return false // 过去的时段不能再领
    const plan = planOf4(inst.planId)
    // 手动班次人事即时发布，等同可领；先到先得计划照常
    if (!plan || (plan.mode !== 'grab' && !inst.manual)) return false
    if (inst.spaceId !== person.spaceId) return false
    const tier = (plan.priority || []).find(t => !t.fallback && t.positionId === person.positionId && (t.employ === 'any' || t.employ === person.employ))
    if (!tier) return false
    // 档位开放时间（定时生成-可见规则）：未开放的档位在可领列表里不可见
    if (!inst.manual && !tierOpenAt4(tier).open) return false
    if ((inst.results || []).some(r => r.personId === personId)) return false
    const clash = (v4.batch.results || []).some(r =>
      r.personId === personId && r.date === inst.date &&
      timeMin(r.start) < timeMin(inst.end) && timeMin(inst.start) < timeMin(r.end))
    return !clash
  })
}

/* ---- 班次后续处理（2026-11-13 定案）：规则挂在计划上，生成时快照到实例 ---- */

/** 读一个时段实例生效的后续处理规则 */
export const aftercareOf4 = inst => normalizeAftercare4(inst?.aftercare || planOf4(inst?.planId)?.aftercare || DEFAULT_AFTERCARE)

const findInst4 = instanceId => (v4.batch?.instances || []).find(i => i.id === instanceId) || null

/**
 * 取消班次：规则允许 + 未过截止才能发起；取消本身是事件（EV-02 → ED-02 编排）。
 * 名额去向由规则决定：release 回池再分配 / void 作废不回池。
 */
export const cancelShift4 = (personId, instanceId) => {
  const inst = findInst4(instanceId)
  const row = (v4.batch?.results || []).find(r => r.instanceId === instanceId && r.personId === personId)
  if (!inst || !row) return { ok: false, why: '没有这条班次的排班记录' }
  const ac = aftercareOf4(inst)
  if (!ac.cancel?.allow) return { ok: false, why: '这类班次不允许自行取消（计划规则），需要调整请走请假或联系人事' }
  if (inst.date < v4.now) return { ok: false, why: '班次已经开始或已过去，不能取消' }
  if (inst.date === v4.now) {
    const deadlineMin = acMinutes4(ac.cancel)
    const deadline = timeMin(inst.start) - deadlineMin
    if (timeMin(v4.nowClock) > deadline) {
      return { ok: false, why: `已过取消截止（开班前 ${fmtDur4(deadlineMin)}），联系人事处理` }
    }
  }
  const voidMode = ac.cancel.mode === 'void'
  const res = runEvent4('ED-02', {
    personId, instanceId, voidMode,
    releaseWhy: `本人取消，名额${voidMode ? '作废不回池' : '回池再分配'}`
  })
  return { ok: true, res }
}

/** 转移班次 · 第一步：发起（进入等待期，超时自动失效、班次留原人） */
export const proposeTransfer4 = (fromId, instanceId, toId) => {
  const inst = findInst4(instanceId)
  const row = (v4.batch?.results || []).find(r => r.instanceId === instanceId && r.personId === fromId)
  const to = v4.people.find(p => p.id === toId)
  if (!inst || !row) return { ok: false, why: '没有这条班次的排班记录' }
  if (!to || to.active === false) return { ok: false, why: '接收人不在册' }
  const ac = aftercareOf4(inst)
  if (!ac.transfer?.allow) return { ok: false, why: '这类班次不允许转移（计划规则）' }
  if (ac.transfer.samePositionOnly && to.positionId !== row.positionId) {
    return { ok: false, why: '这个计划限同岗位转移' }
  }
  if (to.id === fromId) return { ok: false, why: '不能转给自己' }
  if (!qualify4(to, inst.date, v4.leaves)) return { ok: false, why: `${to.name} 当天请假或不在册` }
  if ((v4.transfers || []).some(t => t.instanceId === instanceId && t.status === 'pending')) {
    return { ok: false, why: '这条班次已有转移在等待接受' }
  }
  const waitMin = Math.max(acMinutes4(ac.transfer) || 120, 10)
  const deadline = minTime(timeMin(v4.nowClock) + waitMin)
  const t = {
    id: `TR-${(v4.transfers.length || 0) + 1}-${Date.now().toString().slice(-4)}`,
    kind: 'transfer',
    instanceId, fromId, toId, status: 'pending',
    at: `${v4.now} ${v4.nowClock}`, deadline: `${v4.now} ${deadline}`,
    waitMin
  }
  v4.transfers.push(t)
  row.transferPending = true
  return { ok: true, transfer: t }
}

/** 转移班次 · 第二步：对方在等待期内接受 → 触发 ED-03 编排（判冲突→释放→分配→写结果） */
export const acceptTransfer4 = transferId => {
  const t = (v4.transfers || []).find(x => x.id === transferId && x.status === 'pending')
  if (!t) return { ok: false, why: '转移邀请不存在或已失效' }
  const inst = findInst4(t.instanceId)
  if (!inst) return { ok: false, why: '对应班次不存在' }
  const toName = v4.people.find(p => p.id === t.toId)?.name || t.toId
  const res = runEvent4('ED-03', {
    personId: t.fromId, toPersonId: t.toId, instanceId: t.instanceId, transfer: true,
    releaseWhy: `转移给 ${toName} 后释放`
  })
  if (res.stopped) {
    t.status = 'failed'
    t.why = res.log[res.log.length - 1]?.detail || '对方当天时段冲突，接不了'
    clearPending4(t)
    return { ok: false, why: t.why, res }
  }
  t.status = 'accepted'
  clearPending4(t)
  return { ok: true, res }
}

/** 拒绝转移：班次留原人 */
export const declineTransfer4 = transferId => {
  const t = (v4.transfers || []).find(x => x.id === transferId && x.status === 'pending')
  if (!t) return { ok: false, why: '邀请不存在或已失效' }
  t.status = 'declined'
  clearPending4(t)
  return { ok: true }
}

/* ---- 换班：双向对价，不碰名额池 ---- */

/**
 * 我能和谁换：候选只列**真能换成的**班次——
 *  同空间 · 同岗位对等（规则要求时）· 两边时段都允许换班 · 那天他没请假 ·
 *  我接他这条不与我其余排班重叠 · 他接我这条不与他其余排班重叠（口径：时段重叠才算冲突，首尾相接可接）
 */
export const swapCandidates4 = (personId, instanceId) => {
  const inst = findInst4(instanceId)
  const row = findRowOf4(personId, instanceId)
  if (!inst || !row) return []
  const ac = aftercareOf4(inst)
  if (!ac.swap?.allow) return []
  const samePosOnly = ac.swap.samePositionOnly !== false
  const hit = (a, b) => a.date === b.date &&
    timeMin(a.start) < timeMin(b.end) && timeMin(b.start) < timeMin(a.end)
  const results = v4.batch?.results || []
  const myOthers = results.filter(r => r.personId === personId && r.instanceId !== instanceId)
  const out = []
  for (const p of v4.people) {
    if (p.id === personId || p.active === false || p.spaceId !== row.spaceId) continue
    if (samePosOnly && p.positionId !== row.positionId) continue
    const theirs = results
      .filter(r => r.personId === p.id && r.date >= v4.now)
      .filter(r => aftercareOf4(findInst4(r.instanceId)).swap?.allow)
      .filter(r => !(v4.leaves || []).some(l => l.personId === p.id && l.date === r.date))
      .filter(r => !myOthers.some(mr => hit(mr, r)))
      .filter(r => !results.some(or => or.personId === p.id && or.instanceId !== r.instanceId &&
        hit(or, { date: inst.date, start: inst.start, end: inst.end })))
      .map(r => ({ ...r, canSwap: true }))
    if (theirs.length) out.push({ person: p, shifts: theirs })
  }
  return out
}

/**
 * 发起换班：我的一条班次 ←→ 对方的一条班次，进入等待期。
 * 等待期按我这边时段的规则算；超时两边都不动。
 */
export const proposeSwap4 = (fromId, instanceId, toId, toInstanceId) => {
  const aInst = findInst4(instanceId)
  const bInst = findInst4(toInstanceId)
  const aRow = findRowOf4(fromId, instanceId)
  const bRow = findRowOf4(toId, toInstanceId)
  const to = v4.people.find(p => p.id === toId)
  if (!aInst || !bInst || !aRow || !bRow) return { ok: false, why: '两边的班次记录不完整，换不了' }
  if (toId === fromId) return { ok: false, why: '不能和自己换班' }
  if (!to || to.active === false) return { ok: false, why: '对方不在册' }
  const acA = aftercareOf4(aInst)
  const acB = aftercareOf4(bInst)
  if (!acA.swap?.allow) return { ok: false, why: '你这条班次所在时段不允许换班（时段规则）' }
  if (!acB.swap?.allow) return { ok: false, why: `${to.name} 那条班次所在时段不允许换班` }
  if (acA.swap.samePositionOnly !== false && aRow.positionId !== bRow.positionId) {
    return { ok: false, why: '换班要求同岗位对等' }
  }
  if (aInst.date < v4.now || bInst.date < v4.now) return { ok: false, why: '已开始或已过去的班次不能换' }
  const busy = (v4.transfers || []).some(t => t.status === 'pending' &&
    ([instanceId, toInstanceId].includes(t.instanceId) || [instanceId, toInstanceId].includes(t.toInstanceId)))
  if (busy) return { ok: false, why: '相关班次已有邀请在等待答复' }
  const waitMin = Math.max(acMinutes4(acA.swap) || 240, 10)
  const deadline = minTime(timeMin(v4.nowClock) + waitMin)
  const t = {
    id: `SW-${(v4.transfers.length || 0) + 1}-${Date.now().toString().slice(-4)}`,
    kind: 'swap', status: 'pending',
    instanceId, toInstanceId, fromId, toId,
    at: `${v4.now} ${v4.nowClock}`, deadline: `${v4.now} ${deadline}`, waitMin
  }
  v4.transfers.push(t)
  aRow.swapPending = true
  bRow.swapPending = true
  return { ok: true, swap: t }
}

/** 对方同意换班 → 触发 ED-06（判双方冲突 → 对调占位 → 写结果），不释放名额 */
export const acceptSwap4 = swapId => {
  const t = (v4.transfers || []).find(x => x.id === swapId && x.status === 'pending' && x.kind === 'swap')
  if (!t) return { ok: false, why: '换班邀请不存在或已失效' }
  const res = runEvent4('ED-06', {
    personId: t.fromId, toPersonId: t.toId, instanceId: t.instanceId, toInstanceId: t.toInstanceId
  })
  clearPending4(t)
  if (res.stopped) {
    t.status = 'failed'
    t.why = res.log[res.log.length - 1]?.detail || '双方有一方时段冲突，换不了'
    return { ok: false, why: t.why, res }
  }
  t.status = 'accepted'
  return { ok: true, res }
}

/** 清掉一条邀请在两条记录上的待答复标记（转移只有一条，换班有两条） */
const clearPending4 = t => {
  const clear = r => {
    if (t.kind === 'swap') {
      if ((r.personId === t.fromId && r.instanceId === t.instanceId) || (r.personId === t.toId && r.instanceId === t.toInstanceId)) r.swapPending = false
    } else if (r.instanceId === t.instanceId) r.transferPending = false
  }
  for (const r of (v4.batch?.results || [])) clear(r)
  for (const r of (v4.batch?.history || [])) clear(r)
}

/** 等待期处理：超时的转移自动失效，班次留原人（演示可强制触发） */
export const expireTransfers4 = force => {
  const out = []
  for (const t of (v4.transfers || []).filter(x => x.status === 'pending')) {
    const past = force || t.deadline < `${v4.now} ${v4.nowClock}`
    if (!past) continue
    t.status = 'expired'
    t.why = t.kind === 'swap'
      ? `等待期 ${fmtDur4(t.waitMin)}内未答复，换班自动失效（两边都不动）`
      : `等待期 ${fmtDur4(t.waitMin)}内未被接受，自动失效`
    clearPending4(t)
    out.push(t)
  }
  return out
}

const findRowOf4 = (personId, instanceId) =>
  (v4.batch?.results || []).find(r => r.personId === personId && r.instanceId === instanceId) || null

/** 待我答复的转移邀请 */
export const pendingTransfersFor4 = personId =>
  (v4.transfers || []).filter(t => t.status === 'pending' && t.toId === personId)

/**
 * 人事手动补充班次：凭空创建一个批外时段实例（临时性归人工的最小入口）。
 * 挂在某个计划下（继承资格与档位），名额人工给定，立即发布；默认允许取消和转移。
 */
export const manualShift4 = ({ planId, date, name, start, end, quota }) => {
  const plan = planOf4(planId)
  if (!plan || !v4.batch) return { ok: false, why: '计划不存在' }
  if (!date || !start || !end) return { ok: false, why: '日期与起止时间必填' }
  const n = Math.max(1, Number(quota || 1))
  const inst = {
    id: `IN-MANUAL-${v4.batch.instances.length + 1}-${Date.now().toString().slice(-4)}`,
    planId: plan.id, spaceId: plan.spaceId, date,
    formId: 'MANUAL', form: { id: 'MANUAL', name: name || '手动班次', start, end, manual: true },
    start, end, fallbackForm: false, manual: true, published: true,
    quota: { initial: n, adjusted: null, effective: n, expr: `人工补 ${n} 个`, algoName: '人工固定', windowMin: 5 },
    filled: 0, left: n, results: [],
    aftercare: {
      cancel: { allow: true, value: 4, unit: 'h', mode: 'release' },
      transfer: { allow: true, value: 4, unit: 'h', samePositionOnly: true },
      swap: { allow: true, value: 4, unit: 'h', samePositionOnly: true }
    }
  }
  v4.batch.instances.push(inst)
  return { ok: true, inst }
}

/* ---- 移动端 · 人的时间线（原计划 → 事件覆盖 → 补位，历史全保留） ---- */
export const timelineOf4 = personId => {
  const b = v4.batch
  if (!b) return []
  const active = (b.results || []).filter(r => r.personId === personId).map(r => {
    const inst = (b.instances || []).find(i => i.id === r.instanceId)
    return {
      ...r, state: 'active',
      aftercare: inst?.aftercare || null, manual: !!inst?.manual,
      note: r.swapPending
        ? '换班等待对方同意，超时两边都不动'
        : r.transferPending
          ? '转移等待对方接受，等待期内超时自动失效'
          : r.fromSwap
            ? '换班对调来的班次，你换出的那条在历史里'
            : r.way === '转移承接'
              ? '转移成立后接手的班次，不是申领来的'
              : r.fromEvent ? '补位：系统分配的补班时段'
                : r.fromClaim ? '自己申领的班次' : ''
    }
  })
  const covered = (b.history || []).filter(r => r.personId === personId)
    .map(r => ({ ...r, state: 'covered', note: r.releasedWhy || '已被事件覆盖释放' }))
  return [...active, ...covered].sort((a, b2) => (a.date + a.start).localeCompare(b2.date + b2.start))
}

/* ---- 移动端 · 通知 ---- */
export const noticesOf4 = personId => {
  const b = v4.batch
  if (!b) return []
  const out = []
  // 转移邀请：别人转给我的，等待期内必须给答复（接受 / 拒绝 / 超时自动失效）
  for (const t of (v4.transfers || []).filter(t => t.status === 'pending' && t.toId === personId && t.kind !== 'swap')) {
    const inst = b.instances.find(i => i.id === t.instanceId)
    const from = v4.people.find(p => p.id === t.fromId)
    if (!inst) continue
    out.push({
      id: `NT-T-${t.id}`, kind: 'transfer', transferId: t.id, acked: false, date: inst.date,
      text: `${from?.name || t.fromId} 想把 ${inst.date} ${inst.form.name} ${inst.start}–${inst.end} 转给你`,
      detail: `等待期至 ${t.deadline}（${fmtDur4(t.waitMin)}），超时自动失效；接受后系统会先判时段冲突，成立即写入你的时间线`
    })
  }
  // 换班邀请：别人拿他的班次换我的班次，两边都要同意（超时两边都不动）
  for (const t of (v4.transfers || []).filter(t => t.status === 'pending' && t.toId === personId && t.kind === 'swap')) {
    const mine = b.instances.find(i => i.id === t.toInstanceId)
    const theirs = b.instances.find(i => i.id === t.instanceId)
    const from = v4.people.find(p => p.id === t.fromId)
    if (!mine || !theirs) continue
    out.push({
      id: `NT-S-${t.id}`, kind: 'swap', swapId: t.id, acked: false, date: mine.date,
      text: `${from?.name || t.fromId} 想用 ${theirs.date} ${theirs.form.name} ${theirs.start}–${theirs.end} 换你的 ${mine.date} ${mine.form.name} ${mine.start}–${mine.end}`,
      detail: `等待期至 ${t.deadline}（${fmtDur4(t.waitMin)}），超时两边都不动；同意后系统先判双方时段冲突，成立才真正对调（名额池不动）`
    })
  }
  // 补位分配 / 转移承接 / 换班对调：系统把你排进了时段
  for (const r of (b.results || []).filter(r => r.personId === personId && (r.fromEvent || r.way === '转移承接' || r.fromSwap))) {
    if (r.fromSwap) {
      out.push({
        id: `NT-SI-${r.id}`, kind: 'swapIn', rowId: r.id, acked: true, date: r.date,
        text: `换班已成立：${r.formName} ${r.start}–${r.end} 已换到你名下`,
        detail: '你换出的那条班次也进了对方名下，两边原班次都保留在历史里，名额池没动'
      })
    } else if (r.way === '转移承接') {
      out.push({
        id: `NT-TI-${r.id}`, kind: 'transferIn', rowId: r.id, acked: true, date: r.date,
        text: `转移已生效：${r.formName} ${r.start}–${r.end} 已到你的名下`,
        detail: '发起人的原班次已释放，双方的时间线都保留这条记录'
      })
    } else {
      out.push({
        id: `NT-${r.id}`, kind: 'makeup', rowId: r.id, acked: !!r.acked, date: r.date,
        text: `系统已将你排入补班：${r.formName} ${r.start}–${r.end}（代替请假空出的时段）`,
        detail: '这是系统按事件规则分配的，不是申领来的；确认后按班次正常打卡'
      })
    }
  }
  // 我的班次被事件覆盖释放（取消 / 转移 / 请假的回执）
  for (const r of (b.history || []).filter(r => r.personId === personId)) {
    out.push({
      id: `NT-C-${r.id}`, kind: 'covered', date: r.date, acked: true,
      text: `你的原班次 ${r.formName} ${r.start}–${r.end} 已释放`,
      detail: r.releasedWhy || '历史记录保留，可在「我的排班」里查看'
    })
  }
  return out.sort((a, b2) => (a.date + (a.acked ? 1 : 0)).toString().localeCompare((b2.date + (b2.acked ? 1 : 0)).toString()))
}

/** 确认补位分配（只改确认标记，不动结果） */
export const ackNotice4 = rowId => {
  const r = (v4.batch?.results || []).find(x => x.id === rowId)
  if (r) r.acked = true
}

export {
  findSpace4, findPlan4, findPosition4, posName4, weekday4, weekdayLabel4, formsOf4,
  overtimeMin4, quotaOf4, executeEvent4
}
