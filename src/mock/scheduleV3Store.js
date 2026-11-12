// 排班策略 v3 的运行期数据源：配置页与移动端共用同一份，避免两边各读各的。
import { reactive, computed } from 'vue'
import {
  V3_SLOTS, V3_RULES, V3_CONTAINER_SHIFTS, V3_PEOPLE, RULE_OF_SLOT, V3_SLOT_TPL,
  runBatch3, findShift3, findSlotTpl3, findShiftTpl3, netHours3, anchorTime3, roundState3,
  modeOf3, balanceOf3, scoreOf3, appsOf3
} from './scheduleV3.js'

export const v3 = reactive({
  slots: V3_SLOTS,
  rules: V3_RULES,
  shifts: V3_CONTAINER_SHIFTS,
  ruleOf: { ...RULE_OF_SLOT },
  /** 演示身份：蓝田——早班两轮被挤出、最后兜底到晚班，能把三种状态都看到 */
  meId: 'E-107',
  me: V3_PEOPLE.find(p => p.id === 'E-107'),
  /** 演示：用户在移动端手动申领的单（真实系统走接口，这里落内存） */
  manualApps: [],
  now: new Date('2026-11-12T10:19:00')
})

export const setMe3 = person => { v3.me = person; v3.meId = person.id }
export const me3 = () => v3.me || V3_PEOPLE[0]
export const person3 = id => V3_PEOPLE.find(p => p.id === id) || null

/** 当前批次：随配置变化重算（改规则/改时段后页面立刻不同） */
export const batch3 = computed(() => runBatch3(v3.now, {
  slots: v3.slots, rules: v3.rules, people: V3_PEOPLE,
  ruleOf: id => v3.ruleOf[id]
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

/* ---- 新建时段：模板落地到容器 + 可选挂规则 ---- */
const nextId = (list, prefix) => {
  const max = list.reduce((acc, x) => {
    const n = Number(String(x.id || '').replace(/\D/g, ''))
    return Number.isFinite(n) && n > acc ? n : acc
  }, 0)
  return `${prefix}${max + 1}`
}

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
  const tpl = findSlotTpl3(slotTplId) || V3_SLOT_TPL[0]
  const sh = ensureShift3(containerId, tpl.shiftTemplateId)
  const slot = {
    id: nextId(v3.slots, 'SL-V'), containerId, shiftId: sh?.id || '',
    name: `${sh?.name || '时段'}时段`, days: [...tpl.days], capacity: tpl.capacity,
    source: 'template', templateId: tpl.id, generation: { ...tpl.generation },
    note: '按模板新建，可逐项修改'
  }
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
