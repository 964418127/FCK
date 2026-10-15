/**
 * 移动端 · 请假模块 预设计（v2）mock
 * ------------------------------------------------------------------
 * ⚠️ 性质：预研探路稿，不是正式结论。用于看形态、对齐口径。
 *
 * 覆盖范围：只覆盖「全日制」—— 推拿师、客户经理、总部各岗位。
 *   非全日制（推拿师 / 客户经理）走「兼职任务」那条线（取消 / 重派 / 接班任务），
 *   不进入本请假模块，本文件不描述它。
 *
 * 两条正交的下游（本模块的边界）：
 *   额度后果 → 交付薪酬：本模块只交付「休假时长 + 假种」，扣不扣款由薪酬侧决定。
 *   人力后果 → 交付人力调度：请假通过后产出「缺岗信号」
 *     （日期 / 门店 / 岗位 / 班次段 / 缺人数），本模块不实现补人。
 *   缺岗信号是系统产出的事实，不是申请人手填的表单字段 —— 所以表单里没有「门店」「人数」输入项。
 *
 * 余额口径：额度取该岗位（jobWorkModes）引用的「假期方案」；已用从休假记录自动汇总，不手填。
 */

import { quotaSchemes, jobWorkModes, scheduleSchemes } from './leaveWorkMode.js'
import { leaveRecords as ledgerRecords } from './leaveLedger.js'

/* ---------------- 员工（全日制） ---------------- */
export const pdEmployees = [
  {
    id: 'pd01',
    staffNo: 'TL1001',
    name: '陈伟',
    job: '推拿师',
    org: '门店',
    store: '深圳南山店',
    joinedAt: '2023-04-12',
    quotaAdjust: { 'qs-temp-16h': { amount: 12, note: '按 9 月业绩折算' } }
  },
  {
    id: 'pd02',
    staffNo: 'TL1005',
    name: '张敏',
    job: '客户经理',
    org: '门店',
    store: '深圳南山店',
    joinedAt: '2022-06-20'
  }
]

export function employeeMode(emp) {
  return jobWorkModes.find(m => m.job === emp.job) || null
}

/** 该员工按岗位引用的假期方案（余额的行就是这些） */
export function schemesOf(emp) {
  const mode = employeeMode(emp)
  const ids = (mode && mode.quotaSchemeIds) || []
  return ids.map(id => quotaSchemes.find(q => q.id === id)).filter(Boolean)
}

/** 方案名义额度（含系统折算后的实际值） */
export function schemeAmount(emp, scheme) {
  const adj = (emp.quotaAdjust || {})[scheme.id]
  return adj ? { amount: adj.amount, note: adj.note } : { amount: scheme.amount, note: '' }
}

/* ---------------- 班次 ---------------- */
export const pdShifts = [
  { id: 'morning', name: '早班', range: '09:00 - 18:00' },
  { id: 'evening', name: '晚班', range: '13:00 - 22:00' },
  { id: 'full', name: '通班', range: '12:00 - 22:00' }
]

/* ---------------- 休假类型（渠道 + 假种） ----------------
   「班次假 / 临时假 / 特殊情况请假」是线上已有的三个扣减渠道，形态沿用；
   「年假 / 婚假 / 丧假」是本次按 web 端重构补齐的长期假种，没有的话就不展示（按岗位引用出）。 */
export const pdLeaveTypes = [
  { id: 'shift-am', name: '早半天休', channel: '班次假', schemeId: 'qs-shift-4d', mode: 'segment', days: 0.5, timeText: '上午时段', desc: '上午时段休息，折 0.5 天' },
  { id: 'shift-pm', name: '晚半天休', channel: '班次假', schemeId: 'qs-shift-4d', mode: 'segment', days: 0.5, timeText: '下午时段', desc: '下午时段休息，折 0.5 天' },
  { id: 'shift-full', name: '全天休', channel: '班次假', schemeId: 'qs-shift-4d', mode: 'segment', days: 1, timeText: '一个班次', desc: '整天休息，扣 1 天' },
  { id: 'temp', name: '临时休假', channel: '临时假', schemeId: 'qs-temp-16h', mode: 'hour', desc: '按小时申请，扣临时假余额' },
  { id: 'special', name: '特殊情况请假', channel: '特殊情况请假', schemeId: null, mode: 'chain', desc: '依次扣班次假、临时假，扣完记录超出时长' },
  { id: 'annual', name: '年假', channel: '长期假种', schemeId: 'qs-annual-5d', mode: 'range', longTerm: true, desc: '年度额度，可整天或半天' },
  { id: 'marriage', name: '婚假', channel: '长期假种', schemeId: 'qs-marriage-3d', mode: 'event', event: true, validWithin: '领证后 12 个月内', proof: true, desc: '每次 3 天' },
  { id: 'funeral', name: '丧假', channel: '长期假种', schemeId: 'qs-funeral-3d', mode: 'event', event: true, validWithin: '亲属去世后 1 个月内', proof: true, desc: '每次 3 天' }
]

export function leaveTypeOf(id) {
  return pdLeaveTypes.find(t => t.id === id) || null
}

/** 该员工能看到的休假类型：长期假种按岗位引用的假期方案过滤 */
export function typesOf(emp) {
  const ids = schemesOf(emp).map(s => s.id)
  return pdLeaveTypes.filter(t => {
    if (!t.schemeId) return true
    return ids.includes(t.schemeId)
  })
}

/** 按渠道分组，用于申请页的类型选择 */
export function typeGroupsOf(emp) {
  const order = ['班次假', '临时假', '特殊情况请假', '长期假种']
  const list = typesOf(emp)
  return order
    .map(ch => ({ channel: ch, items: list.filter(t => t.channel === ch) }))
    .filter(g => g.items.length)
}

/* ---------------- 休假记录 ----------------
   deduction：这一单实际扣了哪些额度段。schemeId 为 null 表示「超出」段。
   已经通过的记录自动汇总进余额的「已用」，两边不手填。 */
export const pdLeaveRecords = [
  {
    id: 'r01', empId: 'pd01', typeId: 'shift-full', typeName: '全天休', channel: '班次假',
    date: '2026-10-07', days: 1, hours: 0, submittedAt: '2026-10-05 20:11', status: 'approved',
    deduction: [{ schemeId: 'qs-shift-4d', schemeName: '班次假 · 每自然月 4 天', amount: 1, unit: '天' }]
  },
  {
    id: 'r02', empId: 'pd01', typeId: 'shift-am', typeName: '早半天休', channel: '班次假',
    date: '2026-10-12', days: 0.5, hours: 0, submittedAt: '2026-10-10 09:30', status: 'approved',
    deduction: [{ schemeId: 'qs-shift-4d', schemeName: '班次假 · 每自然月 4 天', amount: 0.5, unit: '天' }]
  },
  {
    id: 'r03', empId: 'pd01', typeId: 'shift-pm', typeName: '晚半天休', channel: '班次假',
    date: '2026-10-13', days: 0.5, hours: 0, submittedAt: '2026-10-11 18:02', status: 'approved',
    deduction: [{ schemeId: 'qs-shift-4d', schemeName: '班次假 · 每自然月 4 天', amount: 0.5, unit: '天' }]
  },
  {
    id: 'r04', empId: 'pd01', typeId: 'temp', typeName: '临时休假', channel: '临时假',
    date: '2026-10-09', days: 0, hours: 3, submittedAt: '2026-10-08 21:40', status: 'approved',
    deduction: [{ schemeId: 'qs-temp-16h', schemeName: '临时假 · 每自然月 16 小时', amount: 3, unit: '小时' }]
  },
  {
    id: 'r05', empId: 'pd01', typeId: 'special', typeName: '特殊情况请假', channel: '特殊情况请假',
    date: '2026-08-20', dateEnd: '2026-08-25', days: 6, hours: 0, submittedAt: '2026-08-18 10:05', status: 'approved',
    deduction: [
      { schemeId: 'qs-shift-4d', schemeName: '班次假 · 每自然月 4 天', amount: 4, unit: '天' },
      { schemeId: 'qs-temp-16h', schemeName: '临时假 · 每自然月 16 小时', amount: 16, unit: '小时' },
      { schemeId: null, schemeName: '超出', amount: 1, unit: '天', note: '不扣薪，仅记录' }
    ]
  },
  {
    id: 'r06', empId: 'pd01', typeId: 'annual', typeName: '年假', channel: '长期假种',
    date: '2026-10-26', dateEnd: '2026-10-27', days: 2, hours: 0, submittedAt: '2026-10-14 08:22', status: 'pending',
    deduction: [{ schemeId: 'qs-annual-5d', schemeName: '年假 · 每自然年 5 天', amount: 2, unit: '天' }]
  },
  {
    id: 'r07', empId: 'pd02', typeId: 'shift-full', typeName: '全天休', channel: '班次假',
    date: '2026-10-07', days: 1, hours: 0, submittedAt: '2026-10-05 21:02', status: 'approved',
    deduction: [{ schemeId: 'qs-shift-4d', schemeName: '班次假 · 每自然月 4 天', amount: 1, unit: '天' }]
  },
  {
    id: 'r08', empId: 'pd02', typeId: 'shift-pm', typeName: '晚半天休', channel: '班次假',
    date: '2026-10-11', days: 0.5, hours: 0, submittedAt: '2026-10-09 19:15', status: 'approved',
    deduction: [{ schemeId: 'qs-shift-4d', schemeName: '班次假 · 每自然月 4 天', amount: 0.5, unit: '天' }]
  },
  {
    id: 'r09', empId: 'pd02', typeId: 'special', typeName: '特殊情况请假', channel: '特殊情况请假',
    date: '2026-09-22', days: 1, hours: 0, submittedAt: '2026-09-21 14:48', status: 'approved',
    deduction: [
      { schemeId: 'qs-shift-4d', schemeName: '班次假 · 每自然月 4 天', amount: 0.5, unit: '天' },
      { schemeId: null, schemeName: '超出', amount: 0.5, unit: '天', note: '按薪资扣减' }
    ]
  },
  {
    id: 'r10', empId: 'pd02', typeId: 'annual', typeName: '年假', channel: '长期假种',
    date: '2026-10-20', dateEnd: '2026-10-21', days: 2, hours: 0, submittedAt: '2026-10-13 09:10', status: 'rejected',
    rejectReason: '本月门店当值紧张，建议改期',
    deduction: [{ schemeId: 'qs-annual-5d', schemeName: '年假 · 每自然年 5 天', amount: 2, unit: '天' }]
  }
]

export const recordStatusOptions = [
  { value: 'all', label: '全部' },
  { value: 'approved', label: '已通过' },
  { value: 'pending', label: '待审核' },
  { value: 'rejected', label: '已拒绝' },
  { value: 'withdrawn', label: '已撤假' }
]

export function statusLabel(v) {
  const hit = recordStatusOptions.find(s => s.value === v)
  if (hit) return hit.label
  return v
}

export function recordsOf(empId, status = 'all') {
  return pdLeaveRecords
    .filter(r => r.empId === empId)
    .filter(r => status === 'all' || r.status === status)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

/* ---------------- 余额：额度取方案，已用从记录汇总 ----------------
   已用必须按「方案的周期」圈定范围：自然月口径只算本月的记录，
   自然年口径算全年，事件型按全部事件累计。跨周期的历史记录不进本月余额。 */
export const REF_PERIOD = { year: 2026, month: 10 }

function inPeriod(dateStr, cycle) {
  if (!dateStr) return false
  const [y, m] = dateStr.split('-').map(Number)
  if (cycle === '自然年' || cycle === '入职周年') return y === REF_PERIOD.year
  return y === REF_PERIOD.year && m === REF_PERIOD.month
}

export function usedOf(empId, schemeId) {
  const scheme = quotaSchemes.find(q => q.id === schemeId)
  const cycle = scheme ? scheme.cycle : '自然月'
  let total = 0
  pdLeaveRecords
    .filter(r => r.empId === empId && r.status === 'approved')
    .forEach(r => {
      if (scheme && (scheme.measure === 'cycle') && !inPeriod(r.date, cycle)) return
      ;(r.deduction || []).forEach(d => {
        if (d.schemeId === schemeId) total += d.amount
      })
    })
  return +total.toFixed(2)
}

export function balancesOf(emp) {
  return schemesOf(emp).map(s => {
    const { amount, note } = schemeAmount(emp, s)
    const used = usedOf(emp.id, s.id)
    const remain = +(amount - used).toFixed(2)
    return {
      schemeId: s.id,
      leaveType: s.leaveType,
      name: s.name,
      measure: s.measure,
      cycle: s.cycle,
      amount,
      unit: s.unit,
      used,
      remain,
      validWithin: s.validWithin || '',
      derivedFrom: s.derivedFrom || '',
      adjustNote: note
    }
  })
}

export function balanceOf(emp, schemeId) {
  return balancesOf(emp).find(b => b.schemeId === schemeId) || null
}

/** 周期型按所选周期换算（自然月 → 自然季 / 自然年 的倍数） */
export const periodOptions = [
  { value: 'month', label: '自然月', factor: 1 },
  { value: 'quarter', label: '自然季', factor: 3 },
  { value: 'year', label: '自然年', factor: 12 }
]

/* ---------------- 扣减试算 ----------------
   班次假 / 临时假 / 长期假种：单段扣减；
   特殊情况请假：依次扣 班次假 → 临时假 → 超出（不扣薪，仅记录）。 */
export function estimate(type, { days = 0, hours = 0, emp }) {
  const lines = []
  if (!type) return { lines, excess: false }

  if (type.mode === 'chain') {
    const totalHours = days * 8 + hours
    const shift = balanceOf(emp, 'qs-shift-4d')
    const temp = balanceOf(emp, 'qs-temp-16h')
    let rest = totalHours

    const shiftLeft = shift ? Math.max(shift.remain, 0) * 8 : 0
    const useShiftH = Math.min(rest, shiftLeft)
    if (useShiftH > 0) {
      lines.push({ schemeId: 'qs-shift-4d', schemeName: shift.name, amount: +(useShiftH / 8).toFixed(2), unit: '天' })
      rest -= useShiftH
    }
    const tempLeft = temp ? Math.max(temp.remain, 0) : 0
    const useTemp = Math.min(rest, tempLeft)
    if (useTemp > 0) {
      lines.push({ schemeId: 'qs-temp-16h', schemeName: temp.name, amount: useTemp, unit: '小时' })
      rest -= useTemp
    }
    if (rest > 0) {
      const cut = emp.job === '推拿师' ? '不扣薪，仅记录' : '按薪资扣减'
      lines.push({ schemeId: null, schemeName: '超出', amount: +(rest / 8).toFixed(2), unit: '天', note: cut })
    }
    return { lines, excess: rest > 0 }
  }

  const scheme = type.schemeId ? quotaSchemes.find(q => q.id === type.schemeId) : null
  if (!scheme) return { lines, excess: false }
  const amount = type.mode === 'hour' ? hours : days
  const bal = balanceOf(emp, type.schemeId)
  const remain = bal ? bal.remain : 0
  const over = amount > remain
  lines.push({
    schemeId: type.schemeId,
    schemeName: bal ? bal.name : scheme.name,
    amount,
    unit: scheme.unit
  })
  return { lines, excess: over, overBy: over ? +(amount - remain).toFixed(2) : 0 }
}

/* ---------------- 缺岗信号（系统产出 · 交付人力调度） ----------------
   申请人不需要填、移动端也不作为输入项；
   这里给页面做「提交后系统会产出什么」的只读预览。 */
export function gapSignalPreview(emp, type, date, shiftName) {
  const mode = employeeMode(emp)
  if (!mode || mode.backfill === 'none') return null
  return {
    date,
    store: emp.store,
    job: emp.job,
    shift: shiftName || type.timeText || '—',
    headcount: 1,
    to: '排班调度',
    backfill: mode.backfill,
    backfillNote: mode.backfillNote || ''
  }
}

/* ---------------- 排班（首页日历用） ----------------
   沿用旧原型的呈现方式：日历上标出已有班次与可休标记。 */
export function shiftPlanOf(empId) {
  if (empId === 'pd02') {
    return {
      1: '通班', 2: '通班', 3: '早班', 4: '早班', 5: '晚班', 6: '晚班',
      7: '休', 8: '通班', 9: '早班', 10: '早班', 11: '晚班',
      12: '通班', 13: '早班', 14: '早班', 15: '晚班', 16: '晚班',
      17: '通班', 18: '早班', 19: '早班', 20: '晚班', 21: '晚班',
      22: '通班', 23: '早班', 24: '早班', 25: '晚班', 26: '晚班', 27: '休', 28: '通班',
      29: '早班', 30: '早班', 31: '晚班'
    }
  }
  return {
    1: '早班', 2: '晚班', 3: '通班', 4: '早班', 5: '晚班', 6: '早班',
    7: '休', 8: '通班', 9: '早班', 10: '早班',
    11: '晚班', 12: '早班', 13: '晚班', 14: '早班', 15: '晚班', 16: '早班',
    17: '晚班', 18: '早班', 19: '晚班', 20: '早班', 21: '晚班',
    22: '早班', 23: '晚班', 24: '早班', 25: '晚班', 26: '通班', 27: '通班', 28: '早班',
    29: '晚班', 30: '早班', 31: '晚班'
  }
}

/** 排班按周的班次名额（沿用旧原型形态） */
export const weekShiftQuota = [
  { id: 'morning', name: '早班', total: 10, applied: 6 },
  { id: 'evening', name: '晚班', total: 8, applied: 5 },
  { id: 'full', name: '通班', total: 5, applied: 3 }
]

/* ---------------- 门店当天可休名额 ----------------
   沿用旧原型「总名额 / 已排 / 可排」的形态：日历点某一天，看当天各假种还能休几个人。 */
export const storeHours = { '深圳南山店': '09:00 - 22:00' }

const DAY_LEAVE_TYPES = ['早半天休', '晚半天休', '全天休']

export function dayLeaveQuota(day) {
  const seed = (day * 7) % 5
  return DAY_LEAVE_TYPES.map((name, i) => {
    const total = i === 2 ? 1 : 2
    const used = i === 2 ? (seed % 3 === 0 ? 1 : 0) : (seed + i) % 2
    return { name, total, used, available: total - used }
  })
}

/** 某天排的是什么班：返回班次对象（含时段），休息日返回 null */
export function shiftOn(empId, day) {
  const name = shiftPlanOf(empId)[day]
  if (!name || name === '休') return null
  const hit = pdShifts.find(s => s.name === name)
  return hit || { id: 'other', name, range: '' }
}

export const pdMonth = 10
export const pdYear = 2026

export const pdToday = { year: 2026, month: 10, day: 14 }

/** 供首页复用：从 web 端盘点 mock 里取同一批概念，保证两端口径一致 */
export const ledgerRef = ledgerRecords
export const schemeRef = scheduleSchemes

/* ---------------- 当前预览身份 ----------------
   预设计里提供一个身份切换，用来证明「表单字段由岗位驱动」：
   同样是请假，推拿师与客户经理看到的类型与校验档位不同。 */
const EMP_KEY = 'pdEmpId'
export function currentEmpId() {
  try {
    return sessionStorage.getItem(EMP_KEY) || pdEmployees[0].id
  } catch (e) {
    return pdEmployees[0].id
  }
}
export function setCurrentEmpId(id) {
  try {
    sessionStorage.setItem(EMP_KEY, id)
  } catch (e) {
    /* ignore */
  }
}
export function currentEmployee() {
  return pdEmployees.find(e => e.id === currentEmpId()) || pdEmployees[0]
}
