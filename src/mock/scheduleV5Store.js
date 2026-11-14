/*
  排班策略 v5 · 响应式 store（Web 配置台与移动端共用）
  动作全部收敛到事实与获取两个语义：抢 / 申领是获取；请假 / 顶班 / 换班是这里的事实；
  离职事实由离职流程模块写入（这里不提供登记入口），排班只承接结果。
  求值 = 写事实 + 截短事实，每次重算推一个解版本。
*/
import { reactive, ref, computed } from 'vue'
import {
  buildV5State, grab5, applyFor5, addFact5, resolveApplications5, openOffers5, canTake5,
  slotById, personById, spaceById, activeCount5, snapN5, slotsOn5, matchWho5, whoLabel5,
  personBusy5, windowOpen5, overlap5, recalcRound, WEEK_DATES, NOW, dayCopyPlan5, applyDayCopy5,
  openAt5, slotFirstDate5
} from './scheduleV5.js'

const state = reactive(buildV5State())
const meId = ref('E-107')
const seq = () => `X-${state.seq++}`

/* ===== 身份（演示切换） ===== */
export const me = computed(() => personById(state, meId.value))
export function setMe(id) { meId.value = id }

/* ===== 获取段动作 ===== */
export function grabV5(slotId, date) {
  const r = grab5(state, slotId, date, meId.value, state.now)
  return r.ok ? { ok: true, text: '抢到了，已进你的排班' } : r
}
export function applyV5(slotId, date) {
  const r = applyFor5(state, slotId, date, meId.value, state.now)
  return r.ok ? { ok: true, text: '已登记，截止后按综合分排序截断' } : r
}

/* ===== 变化段动作（员工） ===== */
export function submitLeave(placementId) {
  const p = state.placements.find(x => x.id === placementId)
  if (!p) return { ok: false, reason: '班次不存在' }
  const fact = {
    id: seq(), type: '请假', at: state.now, by: meId.value,
    slotId: p.slotId, date: p.date, placementId, result: ''
  }
  addFact5(state, fact)
  return { ok: true, text: fact.result }
}

export function proposeSwap(placementId, partnerPlacementId) {
  const mine = state.placements.find(x => x.id === placementId)
  const theirs = state.placements.find(x => x.id === partnerPlacementId)
  if (!mine || !theirs) return { ok: false, reason: '班次不存在' }
  const req = {
    id: seq(), from: meId.value, to: theirs.personId,
    placementId, partnerPlacementId, at: state.now, status: 'pending'
  }
  state.swapRequests = state.swapRequests || []
  state.swapRequests.push(req)
  const s = slotById(state, mine.slotId)
  state.notices.unshift({
    id: seq(), to: theirs.personId, kind: 'swap', acked: false, date: mine.date,
    text: `换班请求：用你的 ${theirs.date} ${slotById(state, theirs.slotId).name} 换 ${mine.date} ${s.name}`,
    detail: '双方同意才生效；等待期超时两边都不动'
  })
  return { ok: true, text: '换班请求已发出，等对方同意' }
}

export function answerSwap(reqId, accept) {
  const req = (state.swapRequests || []).find(r => r.id === reqId)
  if (!req || req.status !== 'pending') return { ok: false, reason: '请求已处理' }
  req.status = accept ? 'done' : 'declined'
  if (accept) {
    const fact = {
      id: seq(), type: '换班', at: state.now, by: req.from,
      slotId: slotById(state, state.placements.find(p => p.id === req.placementId).slotId).id,
      date: '', placementId: req.placementId, partnerPlacementId: req.partnerPlacementId, result: ''
    }
    addFact5(state, fact)
    state.notices.unshift({
      id: seq(), to: req.from, kind: 'swapDone', acked: false, date: state.now.slice(0, 10),
      text: '换班已生效：两条班次完成对调，历史各自留痕', detail: fact.result
    })
    return { ok: true, text: '已同意，班次对调完成' }
  }
  state.notices.unshift({
    id: seq(), to: req.from, kind: 'swapDone', acked: false, date: state.now.slice(0, 10),
    text: '换班请求被拒绝', detail: '两条班次保持原样'
  })
  return { ok: true, text: '已拒绝' }
}

export function ackNotice(id) {
  const n = state.notices.find(x => x.id === id)
  if (n) n.acked = true
}

/* ===== 变化段动作（人事，Web 配置台） ===== */
export function appointV5(slotId, date, personId) {
  if (activeCount5(state, slotId, date) >= snapN5(state, slotId, date)) return { ok: false, reason: '这个时段没有空位' }
  if (personBusy5(state, personId, date, slotById(state, slotId).start, slotById(state, slotId).end)) return { ok: false, reason: '此人和已有班次时间撞了' }
  const fact = {
    id: seq(), type: '顶班', at: state.now, by: 'HR',
    slotId, date, personId, result: ''
  }
  addFact5(state, fact)
  return { ok: true, text: fact.result }
}

/* ===== 定义段动作（Web 配置台）：改动只影响下一轮 ===== */
const normList = form => form.list.map((r, i) => ({ ...r, k: i + 1 }))

export function saveSlotEdit(slotId, form) {
  const slot = slotById(state, slotId)
  if (!slot) return { ok: false, reason: '时段不存在' }
  Object.assign(slot, {
    name: form.name, start: form.start, end: form.end, days: [...form.days],
    quota: { ...form.quota }, list: normList(form)
  })
  /* 人工给定的名额即时体现在模板上；服务供数要等下一轮快照 */
  if (slot.quota.source === 'manual') slot.snapN = slot.quota.value
  state.configDirty = true
  return { ok: true }
}

/* 新增时段：从零配一个班次（之前只能改种子里那三个） */
export function addSlot(spaceId, form) {
  const id = `SL-${String(state.seq++).padStart(2, '0')}`
  const quota = { ...form.quota }
  state.slots.push({
    id, spaceId, name: form.name || '新班次',
    start: form.start, end: form.end, days: [...form.days],
    quota, clamp: [1, 6],
    snapN: quota.source === 'manual' ? quota.value : 2,
    list: normList(form)
  })
  state.configDirty = true
  return { ok: true, id }
}

/* 复制时段：配置班次最常用的动作——照抄一份再改时间和人 */
/* 天级复制/覆盖：把一天的班次配置照搬到其他天（按星期几生效） */
export function copyDay5(srcDow, targetDows) {
  const plan = dayCopyPlan5(state.slots, srcDow, targetDows)
  applyDayCopy5(state.slots, srcDow, targetDows)
  state.configDirty = true
  return plan
}

export function copySlot(slotId) {
  const src = slotById(state, slotId)
  if (!src) return { ok: false, reason: '时段不存在' }
  const id = `SL-${String(state.seq++).padStart(2, '0')}`
  state.slots.push({
    ...JSON.parse(JSON.stringify(src)),
    id, name: `${src.name}（副本）`
  })
  state.configDirty = true
  return { ok: true, id }
}

export function removeSlot(slotId) {
  const slot = slotById(state, slotId)
  if (!slot) return { ok: false, reason: '时段不存在' }
  const n = state.placements.filter(p => p.slotId === slotId && p.status === 'active').length
  state.slots = state.slots.filter(s => s.id !== slotId)
  state.placements = state.placements.filter(p => p.slotId !== slotId)
  state.applications = state.applications.filter(a => a.slotId !== slotId)
  state.configDirty = true
  return { ok: true, dropped: n }
}

/* 排班节奏：周期粒度 / 发布时点 / 覆盖跨度 / 申领截止——改了立刻重算下一轮预告 */
export function setRoundConfig(patch) {
  Object.assign(state.round.config, patch)
  recalcRound(state)
  state.configDirty = true
  return state.round
}

/* 单日调整：只改这一天的名额，不动模板，也不进下一轮快照 */
export function setDayQuota(slotId, date, n) {
  const slot = slotById(state, slotId)
  if (!slot) return { ok: false, reason: '时段不存在' }
  const used = activeCount5(state, slotId, date)
  if (!(n >= 1)) return { ok: false, reason: '名额至少要 1 个' }
  if (n < used) return { ok: false, reason: `这天已经有 ${used} 个人在上面，不能减到 ${n}；要减人，先让对应的人走事实（请假 / 离职）` }
  state.dayQuota = state.dayQuota || {}
  state.dayQuota[`${slotId}|${date}`] = n
  return { ok: true, text: n > used ? `这天加到 ${n} 个名额，现在就能拿` : `这天减到 ${n} 个名额` }
}
export function dayCap(slotId, date) { return snapN5(state, slotId, date) }

/* 算法服务登记：可枚举清单，只登记不实现 */
export function addService(svc) {
  const id = `AS-${String(state.services.length + 1).padStart(2, '0')}`
  state.services.push({ id, ...svc })
  return { ok: true, id }
}

/*
  保存前自检：这些错以前都能存成功，等员工端抢了才炸。
  返回问题清单，空数组=能存。
*/
export function checkSlotForm(spaceId, form, exceptId = '') {
  const errs = []
  const hhmm = /^([01]\d|2[0-3]):[0-5]\d$/
  if (!form.name?.trim()) errs.push('班次名称没填')
  if (!hhmm.test(form.start || '')) errs.push('开始时间要写成 09:00 这样')
  if (!hhmm.test(form.end || '')) errs.push('结束时间要写成 18:00 这样')
  if (form.start && form.end && form.start >= form.end) errs.push('结束时间要晚于开始时间')
  if (!form.days?.length) errs.push('一个星期都没选，这个班次不会排出来')
  if (!form.list?.length) errs.push('清单一行都没有，没人能拿到名额')
  if (form.quota?.source === 'manual' && !(form.quota.value > 0)) errs.push('名额要大于 0')
  if (form.quota?.source === 'service' && !form.quota.serviceId) errs.push('选了挂算法服务，但没指定是哪个')

  /* 档位上限挂在名额上：超过名额的上限存了也吃不满 */
  const quotaN = form.quota?.source === 'manual' ? (form.quota.value || 0)
    : exceptId ? (state.slots.find(s => s.id === exceptId)?.snapN || 0) : 0
  form.list.forEach((r, i) => {
    if (quotaN && r.cap && r.cap > quotaN) errs.push(`第 ${i + 1} 档上限 ${r.cap} 超过了名额 ${quotaN}，最多也就占满 ${quotaN} 个名额`)
  })

  /* 窗口顺序：后面的档不该比前面的档先开（都按这一轮第一天落成具体开放时刻比较） */
  const first = slotFirstDate5({ days: form.days?.length ? form.days : [0, 1, 2, 3, 4, 5, 6] })
  const wins = form.list.map(r => openAt5(r, state.round, first))
  wins.forEach((w, i) => { if (i > 0 && w && wins[i - 1] && w < wins[i - 1]) errs.push(`第 ${i + 1} 档比第 ${i} 档开得还早，员工会先看到后面那档`) })

  /* 同空间、时间重叠、人群又写重了：同一个人两边都能拿 */
  const clash = state.slots
    .filter(s => s.spaceId === spaceId && s.id !== exceptId)
    .filter(s => overlap5(form.start, form.end, s.start, s.end))
    .filter(s => s.days.some(d => form.days.includes(d)))
    .filter(s => s.list.some(a => form.list.some(b => whoLabel5(a.who) === whoLabel5(b.who))))
  if (clash.length) errs.push(`和「${clash.map(s => s.name).join('、')}」时间撞了，人群也写重了——同一个人两个入口都能拿`)

  return errs
}
export function revertConfig() {
  const seed = buildV5State()
  state.slots = seed.slots
  state.configDirty = false
}
export function addTemp(temp) {
  state.temps.push({
    id: `TL-${state.seq++}`, snapN: temp.quota.value, list: [{ k: 1, who: { scope: 'store', kind: 'all', pos: 'all' }, way: 'grab', win: { base: 'publish', d: 0, t: '06:00' } }], ...temp
  })
}
export function removeTemp(id) {
  state.temps = state.temps.filter(t => t.id !== id)
  state.placements = state.placements.filter(p => p.slotId !== id)
}

/* ===== 演示推进（仅 ?dev=1 可见）：申领截止，按综合分排序截断 ===== */
export function resolveApplyDemo(slotId, date) {
  const r = resolveApplications5(state, date, slotId)
  return r
}

/* ===== 视图数据 ===== */
export function myPlacements(pid = meId.value) {
  return state.placements
    .filter(p => p.personId === pid)
    .sort((a, b) => (a.date + a.id).localeCompare(b.date + b.id))
}
export function myOffers(pid = meId.value) {
  return openOffers5(state, pid, state.now)
}
/*
  可获取看板：窗口已开、跟这个人有关的都列出来——能拿的排前面，拿不了的写清原因（可见 ≠ 可拿）。
  同一时段同一天只会出一张卡：能拿的那条行优先，否则用第一条说明为什么拿不了。
*/
export function myOfferBoard(pid = meId.value) {
  const person = personById(state, pid)
  const map = new Map()
  const all = [...state.slots, ...state.temps]
  all.forEach(slot => {
    const dates = slot.date ? [slot.date] : WEEK_DATES.filter(d => slotsOn5(state, d).some(s => s.id === slot.id))
    dates.forEach(date => {
      slot.list
        .filter(r => r.way !== 'direct' && matchWho5(state, person, slot, r.who))
        .forEach(row => {
          if (!windowOpen5(row, date, state.now, state.round)) return
          const key = `${slot.id}|${date}`
          const gate = canTake5(state, slot.id, date, pid, row.way, state.now)
          const prev = map.get(key)
          if (!prev || (!prev.gate.ok && gate.ok)) map.set(key, { slotId: slot.id, date, row, slot, gate })
        })
    })
  })
  return [...map.values()].sort((a, b) => (b.gate.ok - a.gate.ok) || a.date.localeCompare(b.date))
}
/* 申领：截止后按综合分排序，现在排第几 */
export function applyRankOf(slotId, date, pid = meId.value) {
  const apps = state.applications.filter(a => a.slotId === slotId && a.date === date)
  const sorted = apps.slice().sort((a, b) => personById(state, b.personId).score - personById(state, a.personId).score)
  const idx = sorted.findIndex(a => a.personId === pid)
  return { total: apps.length, rank: idx + 1, score: personById(state, pid)?.score }
}
export function myNotices(pid = meId.value) {
  return state.notices.filter(n => n.to === pid)
}
export function swapPendingFor(pid = meId.value) {
  return (state.swapRequests || []).filter(r => r.status === 'pending' && r.to === pid)
}
export function gaps5(spaceId) {
  const out = []
  WEEK_DATES.forEach(date => {
    slotsOn5(state, date).forEach(s => {
      if (s.spaceId !== spaceId) return
      const occ = activeCount5(state, s.id, date)
      if (occ < snapN5(state, s.id, date)) out.push({ slotId: s.id, date, slot: s, occ, n: snapN5(state, s.id, date) })
    })
  })
  return out
}
export function resultRows5(spaceId) {
  return state.placements
    .filter(p => slotById(state, p.slotId)?.spaceId === spaceId)
    .sort((a, b) => (a.date + a.id).localeCompare(b.date + b.id))
    .map(p => {
      const s = slotById(state, p.slotId)
      /* 这条班次跟哪条事实有关：补位来的（fromFact）或被事实覆盖掉的 */
      const fact = state.facts.find(f => f.id === p.fromFact || (f.placements || []).includes(p.id))
      return {
        ...p, slotName: s.name, start: s.start, end: s.end,
        space: spaceById(state, s.spaceId)?.name, person: personById(state, p.personId)?.name,
        factId: fact?.id || '', factType: fact?.type || ''
      }
    })
}
/* 申领登记：按综合分排序，标出截止后会排上的前 N 名（人事只看不审批） */
export function applicationRows5(spaceId) {
  const out = []
  const groups = new Map()
  state.applications.forEach(a => {
    const s = slotById(state, a.slotId)
    if (!s || s.spaceId !== spaceId) return
    const key = `${a.slotId}|${a.date}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(a)
  })
  groups.forEach((apps, key) => {
    const [slotId, date] = key.split('|')
    const s = slotById(state, slotId)
    const n = snapN5(state, slotId, date)
    apps
      .sort((a, b) => personById(state, b.personId).score - personById(state, a.personId).score)
      .forEach((a, i) => {
        const p = personById(state, a.personId)
        out.push({
          ...a, slotId, date, slotName: s.name, start: s.start, end: s.end, sn: n,
          person: p?.name, score: p?.score, order: i + 1, wouldPick: i < n
        })
      })
  })
  return out.sort((a, b) => (a.date + a.slotName + a.order).localeCompare(b.date + b.slotName + b.order))
}
export function factRows5() {
  return [...state.facts].reverse().map(f => {
    const s = f.slotId ? slotById(state, f.slotId) : null
    return {
      ...f,
      person: personById(state, f.by)?.name || (f.by === 'HR' ? '人事' : ''),
      slotName: s?.name || '',
      slotTime: s ? `${s.start}–${s.end}` : ''
    }
  })
}
export { state as v5, WEEK_DATES, NOW }
