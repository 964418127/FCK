// 排班策略 v3 的运行期数据源：配置页与移动端共用同一份，避免两边各读各的。
// 两层状态：配置层（随时可改）＋ 生成快照（生成那一刻冻结，已铺出去的班次不受后续改动影响）。
import { reactive, computed } from 'vue'
import {
  V3_SLOTS, V3_RULES, V3_CONTAINER_SHIFTS, V3_PEOPLE, RULE_OF_SLOT, V3_SLOT_TPL,
  runBatch3, findShift3, findShiftTpl3, netHours3, anchorTime3, roundState3,
  modeOf3, balanceOf3, scoreOf3, appsOf3, quotaCalc3, quotaOf3, containerName3
} from './scheduleV3.js'

const clone = x => JSON.parse(JSON.stringify(x))
const nextId = (list, prefix, pad = 0) => {
  const max = list.reduce((acc, x) => {
    const n = Number(String(x.id || '').replace(/\D/g, ''))
    return Number.isFinite(n) && n > acc ? n : acc
  }, 0)
  return `${prefix}${String(max + 1).padStart(pad, '0')}`
}
const hhmm = d => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
const dateText = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** 名额生效：把名额服务的生效值写进时段的物理容量（只在生成时做一次） */
export const syncCapacity3 = slots => {
  for (const s of slots) s.capacity = quotaCalc3(s).effective
  return slots
}

const snapshotOf = state => clone({
  slots: state.slots, rules: state.rules, ruleOf: state.ruleOf,
  seq: state.gen.seq, at: state.gen.at
})

export const v3 = reactive({
  /** 配置层：改这里不影响已生成的批次 */
  slots: V3_SLOTS,
  rules: V3_RULES,
  templates: clone(V3_SLOT_TPL),
  shifts: V3_CONTAINER_SHIFTS,
  ruleOf: { ...RULE_OF_SLOT },
  /** 生成批次：当前演示落在第 3 批（本周四 06:00 生成） */
  gen: { seq: 3, at: '2026-11-12 06:00' },
  /** 刚生成出来的快照（排班实例、名额、结果都按它算） */
  snapshot: null,
  /** 演示身份：蓝田——早班两轮被挤出、最后兜底到晚班，能把三种状态都看到 */
  meId: 'E-107',
  me: V3_PEOPLE.find(p => p.id === 'E-107'),
  /** 演示：用户在移动端手动申领的单（真实系统走接口，这里落内存） */
  manualApps: [],
  now: new Date('2026-11-12T10:19:00')
})
v3.snapshot = snapshotOf(v3)

export const setMe3 = person => { v3.me = person; v3.meId = person.id }
export const me3 = () => v3.me || V3_PEOPLE[0]
export const person3 = id => V3_PEOPLE.find(p => p.id === id) || null

/* ---- 生成批次：配置改动等下一轮或手动生成才生效 ---- */
/** 手动生成一次：冻结当前配置 → 新批次（等效于周四 06:00 的定时生成） */
export const generate3 = () => {
  syncCapacity3(v3.slots)
  v3.gen.seq += 1
  v3.gen.at = `${dateText(v3.now)} ${hhmm(v3.now)}`
  v3.snapshot = snapshotOf(v3)
  return v3.snapshot
}
/** 待生效改动：配置层与快照的差异条数（时段 / 规则 / 挂载各算一条） */
export const pendingChanges3 = computed(() => {
  const snap = v3.snapshot
  if (!snap) return { total: 0, slots: 0, rules: 0, mounts: 0 }
  const diff = (cur, old) => {
    const changed = cur.filter(x => {
      const o = old.find(y => y.id === x.id)
      return !o || JSON.stringify(o) !== JSON.stringify(x)
    }).length
    const removed = old.filter(o => !cur.some(x => x.id === o.id)).length
    return changed + removed
  }
  const slots = diff(v3.slots, snap.slots)
  const rules = diff(v3.rules, snap.rules)
  const mounts = [...new Set([...Object.keys(v3.ruleOf), ...Object.keys(snap.ruleOf)])]
    .filter(k => (v3.ruleOf[k] || '') !== (snap.ruleOf[k] || '')).length
  return { total: slots + rules + mounts, slots, rules, mounts }
})
/** 批次里实际用的规则（快照口径，不是配置层） */
export const ruleInBatch3 = slotId => (v3.snapshot?.rules || []).find(r => r.id === v3.snapshot?.ruleOf?.[slotId]) || null

/** 当前批次：按生成快照重算；配置层改动不会让它变 */
export const batch3 = computed(() => runBatch3(v3.now, {
  slots: v3.snapshot.slots,
  rules: v3.snapshot.rules,
  people: V3_PEOPLE,
  ruleOf: id => v3.snapshot.ruleOf[id]
}))

/** 该人全部申领单：模拟批次 + 手动申领 */
export const appsOfPerson3 = personId => {
  const sim = appsOf3(batch3.value, personId)
  const manual = v3.manualApps
    .filter(a => a.personId === personId)
    .filter(a => !sim.some(s => s.slotId === a.slotId && s.date === a.date))
  return [...sim, ...manual]
}

export const resultOfPerson3 = personId => batch3.value.results.filter(r => r.personId === personId)

/** 手动申领：写入待审单 */
export const apply3 = (personId, slotId, date, roundId) => {
  const exist = v3.manualApps.find(a => a.personId === personId && a.slotId === slotId && a.date === date)
  if (exist) return exist
  const app = { id: `M-${v3.manualApps.length + 1}`, slotId, date, personId, roundId, status: 'pending', manual: true }
  v3.manualApps.push(app)
  return app
}
export const cancelApply3 = (personId, slotId, date) => {
  const i = v3.manualApps.findIndex(a => a.personId === personId && a.slotId === slotId && a.date === date)
  if (i !== -1) v3.manualApps.splice(i, 1)
}

/** 该人此刻能申的时段实例：轮已开放、资格命中、还没有她的申领单 */
export const openForPerson3 = personId => {
  const person = person3(personId)
  if (!person) return []
  const out = []
  for (const inst of batch3.value.instances) {
    const rule = inst.rule
    if (!rule || rule.mode === 'direct') continue
    if (inst.slot.containerId !== person.containerId) continue
    const round = rule.rounds.find(r => (r.crowds || []).includes(person.crowd))
    if (!round) continue
    if (roundState3(round, inst.date, v3.now) !== 'open') continue
    const held = batch3.value.results.some(r => r.personId === personId && r.date === inst.date && r.slotId === inst.slot.id)
    if (held) continue
    const filledN = batch3.value.results.filter(r => r.date === inst.date && r.slotId === inst.slot.id).length
    if (filledN >= inst.slot.capacity) continue
    const app = appsOfPerson3(personId).find(a => a.slotId === inst.slot.id && a.date === inst.date)
    const pendingN = batch3.value.applications.filter(
      a => a.slotId === inst.slot.id && a.date === inst.date && a.status === 'pending').length
    out.push({
      ...inst, round, filled: filledN, app, pending: pendingN,
      remaining: Math.max(0, inst.slot.capacity - filledN - pendingN),
      closeAt: round.close ? anchorTime3(round.close, inst.date) : null,
      hours: netHours3(inst.shift)
    })
  }
  return out.sort((a, b) => a.date < b.date ? -1 : 1)
}

/** 结果里「怎么来的」人话 */
export const wayLabel3 = r => r.way

/** 通知：被挤出、兜底、系统直派、待审 */
export const noticesOf3 = personId => {
  const list = []
  for (const app of appsOfPerson3(personId)) {
    const inst = batch3.value.instances.find(i => i.slot.id === app.slotId && i.date === app.date)
    if (!inst) continue
    if (app.status === 'lost') {
      list.push({
        id: `N-${app.id}`, kind: 'lost', date: app.date,
        title: `${inst.shift.name} ${inst.shift.start}-${inst.shift.end} 没排上`,
        desc: '两轮申领都没进名额，已按兜底顺序安排到其他班次；没有兜底位时留空'
      })
    }
    if (app.status === 'pending') {
      list.push({
        id: `N-${app.id}-p`, kind: 'pending', date: app.date,
        title: `${inst.shift.name} 已申领，等截止审核`,
        desc: inst.rule?.rounds?.[0]?.close ? '截止后在申领人里按业绩排序出结果' : '按先到先得即时生效'
      })
    }
  }
  for (const r of resultOfPerson3(personId)) {
    if (r.fallback) {
      list.push({
        id: `N-${r.id}`, kind: 'fallback', date: r.date,
        title: `兜底安排：${r.date} ${r.shiftName} ${r.start}-${r.end}`,
        desc: '前面两轮没排上，按兜底顺序排到这一班，只通知不接受拒绝'
      })
    } else if (r.way === '系统直派' || r.way === '轮转排定') {
      list.push({
        id: `N-${r.id}`, kind: 'assigned', date: r.date,
        title: `已安排：${r.date} ${r.shiftName} ${r.start}-${r.end}`,
        desc: '系统直接安排，不需要申领'
      })
    }
  }
  return list.sort((a, b) => a.date < b.date ? 1 : -1)
}

/* ---- 时段模板：全局只读，门店可「引入后保存」成自有 ---- */
export const globalTpls3 = () => v3.templates.filter(t => t.owner === 'global')
export const ownTpls3 = containerId => v3.templates.filter(t => t.owner === containerId)
export const tplsFor3 = containerId => v3.templates.filter(t => t.owner === 'global' || t.owner === containerId)
export const tplUsage3 = tplId => v3.slots.filter(s => s.templateId === tplId).length
/** 引入到门店：复制一份，从此归门店所有（改它不影响全局模板，也不影响已建的时段） */
export const adoptTemplate3 = (tplId, containerId) => {
  const t = v3.templates.find(x => x.id === tplId)
  if (!t || t.owner !== 'global') return null
  const short = String(t.name).split(' · ').slice(1).join(' · ') || t.name
  const copy = {
    ...clone(t),
    id: nextId(v3.templates, 'ST-C', 2),
    name: `${containerName3(containerId)} · ${short}`,
    scope: '门店', owner: containerId, derivedFrom: t.id
  }
  v3.templates.push(copy)
  return copy
}
export const createTemplate3 = (containerId, draft) => {
  const t = {
    id: nextId(v3.templates, 'ST-C', 2),
    name: draft.name || '未命名模板', scope: '门店', owner: containerId, derivedFrom: null,
    shiftTemplateId: draft.shiftTemplateId, days: [...(draft.days || [1, 2, 3, 4, 5, 6, 0])],
    capacity: draft.capacity || 1, nature: draft.nature || 'required',
    quota: clone(draft.quota || { service: 'fixed', params: { value: draft.capacity || 1 }, windowMin: 10, adjusted: null }),
    generation: clone(draft.generation || { cadence: 'weekly', weekday: 4, time: '06:00', horizon: 'n1', idempotent: true })
  }
  v3.templates.push(t)
  return t
}
export const updateTemplate3 = (tplId, patch) => {
  const t = v3.templates.find(x => x.id === tplId)
  if (!t || t.owner === 'global') return null // 全局模板只读，要改先引入
  Object.assign(t, clone(patch))
  if (patch.quota) t.capacity = quotaCalc3(t).effective
  return t
}
export const removeTemplate3 = tplId => {
  const i = v3.templates.findIndex(x => x.id === tplId)
  if (i === -1) return { ok: false, reason: '模板不存在' }
  if (v3.templates[i].owner === 'global') return { ok: false, reason: '全局模板不能删，只能引入到门店' }
  if (tplUsage3(tplId)) return { ok: false, reason: `还有 ${tplUsage3(tplId)} 条时段引用它` }
  v3.templates.splice(i, 1)
  return { ok: true }
}

/* ---- 获取规则：新增 / 编辑 / 删除 ---- */
export const ruleUsage3 = ruleId => v3.slots.filter(s => v3.ruleOf[s.id] === ruleId).length
export const upsertRule3 = draft => {
  const payload = clone(draft)
  delete payload.__new
  if (payload.id) {
    const i = v3.rules.findIndex(r => r.id === payload.id)
    if (i === -1) { v3.rules.push(payload); return payload }
    v3.rules.splice(i, 1, payload)
    return payload
  }
  payload.id = nextId(v3.rules, 'AC-', 2)
  payload.rounds.forEach((rd, i) => { rd.id = `${payload.id}-R${i + 1}` })
  v3.rules.push(payload)
  return payload
}
export const removeRule3 = ruleId => {
  if (ruleUsage3(ruleId)) return { ok: false, reason: `还有 ${ruleUsage3(ruleId)} 条时段挂着它，先换规则` }
  const i = v3.rules.findIndex(r => r.id === ruleId)
  if (i === -1) return { ok: false, reason: '规则不存在' }
  v3.rules.splice(i, 1)
  return { ok: true }
}

/* ---- 新建时段：模板落地到容器 + 可选挂规则 ---- */
/** 把通用班次模板落到本容器（已有引用则复用） */
export const ensureShift3 = (containerId, shiftTemplateId) => {
  const exist = v3.shifts.find(s => s.containerId === containerId && s.templateId === shiftTemplateId)
  if (exist) return exist
  const t = findShiftTpl3(shiftTemplateId)
  if (!t) return null
  const sh = { id: nextId(v3.shifts, 'CS-'), containerId, templateId: t.id, name: t.name, start: t.start, end: t.end, breakMin: t.breakMin }
  v3.shifts.push(sh)
  return sh
}

export const createSlot3 = (containerId, slotTplId, ruleId = null) => {
  const tpl = v3.templates.find(t => t.id === slotTplId) || globalTpls3()[0]
  const sh = ensureShift3(containerId, tpl.shiftTemplateId)
  const slot = {
    id: nextId(v3.slots, 'SL-V'), containerId, shiftId: sh?.id || '',
    name: `${sh?.name || '时段'}时段`, nature: tpl.nature || 'required',
    days: [...tpl.days], capacity: tpl.capacity,
    source: 'template', templateId: tpl.id,
    quota: clone(tpl.quota || quotaOf3(tpl)),
    generation: clone(tpl.generation),
    note: '按模板新建，可逐项修改；改动下一轮生成生效'
  }
  slot.capacity = quotaCalc3(slot).effective
  v3.slots.push(slot)
  if (ruleId) v3.ruleOf[slot.id] = ruleId
  return slot
}

export const removeSlot3 = id => {
  const i = v3.slots.findIndex(s => s.id === id)
  if (i !== -1) v3.slots.splice(i, 1)
  delete v3.ruleOf[id]
}

/** 规则摘要（列表/卡片用） */
export const ruleSummary3 = rule => {
  if (!rule) return '未挂规则'
  const m = modeOf3(rule.mode)
  if (m.value === 'direct') return `${m.label} · 无申领`
  if (m.value === 'grab') return `${m.label} · ${rule.rounds.length} 轮 · 即时生效`
  const closed = rule.rounds.every(r => r.close)
  return `${m.label} · ${rule.rounds.length} 轮${closed ? ' · 截止结算' : ''}`
}
export const balanceSummary3 = rule => (rule ? balanceOf3(rule.balance).label : '')
export const shiftOf3Row = slot => findShift3(slot?.shiftId) || { name: '未挂班次', start: '--:--', end: '--:--', breakMin: 0 }
export { scoreOf3 }
