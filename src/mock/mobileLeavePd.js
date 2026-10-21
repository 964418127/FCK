/**
 * 移动端 · 请假模块 mock
 * ------------------------------------------------------------------
 * 本文件是原型演示数据，用于看形态、对齐口径。
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
 * 余额口径：额度取该岗位（jobWorkModes）引用的「假期额度方案」；已用从休假记录自动汇总，不手填。
 */

import { jobWorkModes, scheduleSchemes, quotaEntriesOf, findQuotaEntry, quotaTypeName, profileOf } from './leaveWorkMode.js'
import { leaveRecords as ledgerRecords } from './leaveLedger.js'
import { resolveApprovalRule, proofTextOf, leaveTypes as dictLeaveTypes } from './leaveAttendance.js'

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
    quotaAdjust: { 'qt-temp': { amount: 12, note: '按 9 月业绩折算' } }
  },
  {
    id: 'pd02',
    staffNo: 'TL1005',
    name: '张敏',
    job: '客户经理',
    org: '门店',
    store: '深圳南山店',
    joinedAt: '2022-06-20'
  },
  {
    id: 'pd03',
    staffNo: 'HQ2016',
    name: '王强',
    job: '产品经理',
    org: '总部',
    dept: '产品部',
    store: '',
    joinedAt: '2021-11-01'
  }
]

export function employeeMode(emp) {
  return jobWorkModes.find(m => m.job === emp.job) || null
}

/** 员工画像（用于额度方案的差异化解档：按维度 rank 取最具体的一档） */
export function profileFor(emp) {
  return profileOf(emp)
}

/** 该员工的完整额度清单 = 岗位私有额度 + 按其画像解析出的假种额度 */
export function schemesOf(emp) {
  return quotaEntriesOf(employeeMode(emp), profileOf(emp))
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
  { id: 'temp', name: '临时休假', channel: '临时假', schemeId: 'qt-temp', mode: 'hour', desc: '按小时申请，扣临时假余额' },
  { id: 'special', name: '特殊情况请假', channel: '特殊情况请假', schemeId: null, mode: 'chain', desc: '依次扣班次假、临时假，扣完记录超出时长' },
  { id: 'annual', name: '年假', channel: '', leaveTypeId: 'annual', mode: 'range', longTerm: true, desc: '年度额度，按员工画像命中的档位取值，可整天或半天' },
  { id: 'marriage', name: '婚假', channel: '', leaveTypeId: 'marriage', mode: 'event', event: true, validWithin: '领证后 12 个月内', proof: true, desc: '每次额度按命中的档位取值' },
  { id: 'funeral', name: '丧假', channel: '', leaveTypeId: 'funeral', mode: 'event', event: true, validWithin: '亲属去世后 3 天内', proof: true, desc: '每次额度按命中的档位取值' },
  { id: 'sick', name: '病假', channel: '', leaveTypeId: 'sick', mode: 'range', longTerm: true, proof: true, quotaless: true, desc: '无固定额度 · 按医疗期核定，需医疗证明' }
]

export function leaveTypeOf(id) {
  return pdLeaveTypes.find(t => t.id === id) || null
}

/** 渠道项对应的假种字典条目（用于适用性过滤）：长期假种直接带 leaveTypeId，渠道型按 channel 映射 */
function dictTypeOf(t) {
  const id = t.leaveTypeId || ({ '班次假': 'shift', '临时假': 'temp', '特殊情况请假': 'special' }[t.channel])
  return dictLeaveTypes.find(d => d.id === id) || null
}

/** 该员工能看到的休假类型：假种字典适用性 + 岗位引用的额度方案，双重过滤
 *  · 假种适用性（all / 指定岗位）先筛一遍 —— 总部岗看不到班次假 / 临时假 / 特殊情况请假
 *  · 长期假种：岗位引用了该假种的额度方案才显示；病假这类无固定额度的（quotaless）只按适用性 */
export function typesOf(emp) {
  const entries = schemesOf(emp)
  const ids = entries.map(s => s.id)
  return pdLeaveTypes.filter(t => {
    const dict = dictTypeOf(t)
    if (dict && dict.applicability === 'jobs' && !(dict.appJobs || []).includes(emp.job)) return false
    if (t.leaveTypeId) {
      if (t.quotaless) return true
      return entries.some(s => s.leaveTypeId === t.leaveTypeId)
    }
    if (!t.schemeId) return true
    return ids.includes(t.schemeId)
  })
}

/** 类型 chip 上的额度徽标：有方案的亮剩余，无固定额度的标注口径，兜底型不标 */
export function chipBadgeOf(emp, t) {
  if (t.quotaless) return '按医疗期'
  if (t.mode === 'chain') return ''
  const bal = t.leaveTypeId ? balanceOfType(emp, t.leaveTypeId) : (t.schemeId ? balanceOf(emp, t.schemeId) : null)
  if (!bal) return ''
  return `余 ${bal.remain}${bal.unit === '小时' ? '时' : '天'}`
}

/** 按渠道分组，用于申请页的类型选择；无渠道（年假 / 婚假等标准假种）不挂分组标签 */
export function typeGroupsOf(emp) {
  const order = ['班次假', '临时假', '特殊情况请假', '']
  const list = typesOf(emp)
  return order
    .map(ch => ({ channel: ch, items: list.filter(t => (t.channel || '') === ch) }))
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
    deduction: [{ schemeId: 'qt-temp', schemeName: '临时假 · 每自然月 16 小时', amount: 3, unit: '小时' }]
  },
  {
    id: 'r05', empId: 'pd01', typeId: 'special', typeName: '特殊情况请假', channel: '特殊情况请假',
    date: '2026-08-20', dateEnd: '2026-08-25', days: 6, hours: 0, submittedAt: '2026-08-18 10:05', status: 'approved',
    deduction: [
      { schemeId: 'qs-shift-4d', schemeName: '班次假 · 每自然月 4 天', amount: 4, unit: '天' },
      { schemeId: 'qt-temp', schemeName: '临时假 · 每自然月 16 小时', amount: 16, unit: '小时' },
      { schemeId: null, schemeName: '超出', amount: 1, unit: '天', note: '不扣薪，仅记录' }
    ]
  },
  {
    id: 'r06', empId: 'pd01', typeId: 'annual', typeName: '年假', channel: '',
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
    id: 'r10', empId: 'pd02', typeId: 'annual', typeName: '年假', channel: '',
    date: '2026-10-20', dateEnd: '2026-10-21', days: 2, hours: 0, submittedAt: '2026-10-13 09:10', status: 'rejected',
    rejectReason: '本月门店当值紧张，建议改期',
    deduction: [{ schemeId: 'qs-annual-5d', schemeName: '年假 · 每自然年 5 天', amount: 2, unit: '天' }]
  },
  {
    id: 'r11', empId: 'pd03', typeId: 'sick', typeName: '病假', channel: '',
    date: '2026-10-23', days: 1, hours: 0, submittedAt: '2026-10-15 10:03', status: 'pending',
    proofAttached: false,
    deduction: [{ schemeId: 'qs-sick-med', schemeName: '病假 · 医疗期内', amount: 1, unit: '天' }]
  },
  {
    id: 'r12', empId: 'pd02', typeId: 'marriage', typeName: '婚假', channel: '',
    date: '2026-11-09', dateEnd: '2026-11-11', days: 3, hours: 0, submittedAt: '2026-10-16 14:47', status: 'pending',
    proofAttached: true, proofFile: '/mock/proof-marriage.svg', proofType: '结婚证',
    deduction: [{ schemeId: 'qs-marriage-3d', schemeName: '婚假 · 每次 3 天', amount: 3, unit: '天' }]
  },
  {
    id: 'r13', empId: 'pd01', typeId: 'funeral', typeName: '丧假', channel: '',
    date: '2026-10-24', dateEnd: '2026-10-26', days: 3, hours: 0, submittedAt: '2026-10-17 09:21', status: 'pending',
    deduction: [{ schemeId: 'qs-funeral-3d', schemeName: '丧假 · 每次 3 天', amount: 3, unit: '天' }]
  },
  {
    id: 'r14', empId: 'pd03', typeId: 'long-personal', typeName: '长事假', channel: '',
    date: '2026-11-02', dateEnd: '2026-11-06', days: 5, hours: 0, submittedAt: '2026-10-18 16:40', status: 'pending',
    deduction: [{ schemeId: 'qs-long-personal-30d', schemeName: '长事假 · 每次上限 30 天', amount: 5, unit: '天' }]
  },
  {
    id: 'r15', empId: 'pd02', typeId: 'sick', typeName: '病假', channel: '',
    date: '2026-10-09', days: 1, hours: 0, submittedAt: '2026-10-08 11:15', status: 'approved',
    proofAttached: true, proofFile: '/mock/proof-sick.svg', proofType: '医疗诊断证明',
    deduction: [{ schemeId: 'qs-sick-med', schemeName: '病假 · 医疗期内', amount: 1, unit: '天' }]
  },
  {
    id: 'r16', empId: 'pd01', typeId: 'sick', typeName: '病假', channel: '',
    date: '2026-10-28', days: 1, hours: 0, submittedAt: '2026-10-19 09:32', status: 'pending',
    proofAttached: true, proofFile: '/mock/proof-sick.svg', proofType: '医疗诊断证明',
    deduction: [{ schemeId: 'qs-sick-med', schemeName: '病假 · 医疗期内', amount: 1, unit: '天' }]
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

export function usedOf(empId, schemeId, typeName) {
  const scheme = findQuotaEntry(schemeId)
  /* 按需假种没有额度值，不存在「已用」 */
  if (scheme && scheme.measure === 'ondemand') return 0
  const cycle = scheme ? scheme.cycle : '自然月'
  let total = 0
  pdLeaveRecords
    .filter(r => r.empId === empId && r.status === 'approved')
    .forEach(r => {
      if (scheme && (scheme.measure === 'cycle') && !inPeriod(r.date, cycle)) return
      ;(r.deduction || []).forEach(d => {
        /* 按假种对账：同一假种可能有全公司 / 城市 / 门店多份方案，
           历史记录里存的是当时的方案 id，只比 id 会漏掉跨档的部分 */
        const sameType = typeName && d.schemeName && d.schemeName.split(' · ')[0] === typeName
        if (d.schemeId === schemeId || sameType) total += d.amount
      })
    })
  return +total.toFixed(2)
}

export function balancesOf(emp) {
  return schemesOf(emp).map(s => {
    /* 按需档：只声明「岗位有这个假种」，不带任何数字 */
    if (s.measure === 'ondemand') {
      return {
        schemeId: s.id,
        leaveTypeId: s.leaveTypeId || null,
        leaveType: quotaTypeName(s),
        name: s.name,
        measure: s.measure,
        cycle: '',
        amount: null,
        unit: '',
        used: 0,
        remain: null,
        validWithin: '',
        derivedFrom: '',
        adjustNote: '',
        ondemand: true,
        ondemandNote: '按需申请 · 天数按医疗期核定'
      }
    }
    const { amount, note } = schemeAmount(emp, s)
    const leaveType = quotaTypeName(s)
    const used = usedOf(emp.id, s.id, leaveType)
    const remain = +(amount - used).toFixed(2)
    return {
      schemeId: s.id,
      leaveTypeId: s.leaveTypeId || null,
      leaveType,
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

/** 按假种取余额：该员工命中的那份方案（可能来自全公司 / 城市 / 门店任意一档） */
export function balanceOfType(emp, leaveTypeId) {
  return balancesOf(emp).find(b => b.leaveTypeId === leaveTypeId) || null
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
    const temp = balanceOf(emp, 'qt-temp')
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
      lines.push({ schemeId: 'qt-temp', schemeName: temp.name, amount: useTemp, unit: '小时' })
      rest -= useTemp
    }
    if (rest > 0) {
      const cut = emp.job === '推拿师' ? '不扣薪，仅记录' : '按薪资扣减'
      lines.push({ schemeId: null, schemeName: '超出', amount: +(rest / 8).toFixed(2), unit: '天', note: cut })
    }
    return { lines, excess: rest > 0 }
  }

  /* 长期假种：按假种取该员工命中的那份方案（全公司 / 城市 / 门店），不写死方案 id */
  const bal = type.leaveTypeId ? balanceOfType(emp, type.leaveTypeId) : balanceOf(emp, type.schemeId)
  const entry = bal || (type.schemeId ? findQuotaEntry(type.schemeId) : null)
  if (!entry) return { lines, excess: false }
  const amount = type.mode === 'hour' ? hours : days
  const remain = bal ? bal.remain : 0
  const over = amount > remain
  lines.push({
    schemeId: bal ? bal.schemeId : type.schemeId,
    schemeName: bal ? bal.name : entry.name,
    amount,
    unit: entry.unit
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
   原型提供一个身份切换，用来证明「表单字段由岗位驱动」：
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

/* ---------------- 假期审批（处理端）· 审批人模型 ----------------
   审批人不只有一个「人事经理」身份，而是按管理结构分流：
   · 门店岗按【岗位类型】分流：推拿师、客户经理各自有对应的人事经理审批，互不交叉；
   · 总部员工的审批人由【部门设置】指定（每个部门配自己的审批人），不是人事统一审。
   原型用视角切换对照三种审批人看到的单据；正式开发按申请人的岗位 / 部门归属自动路由，不需要人切。
   自动审核的假种不需要人，不进审批列表；审批动作只有 通过 / 驳回（驳回必填原因）。 */
export const approvers = [
  {
    id: 'ap-therapist',
    name: '李文静',
    role: '人事经理',
    scopeKind: 'job',
    scope: '推拿师',
    scopeLabel: '推拿师岗',
    note: '推拿师岗人事经理 · 只审推拿师单据'
  },
  {
    id: 'ap-am',
    name: '周琳',
    role: '人事经理',
    scopeKind: 'job',
    scope: '客户经理',
    scopeLabel: '客户经理岗',
    note: '客户经理岗人事经理 · 只审客户经理单据'
  },
  {
    id: 'ap-hq-prod',
    name: '陈慧',
    role: '产品部审批人',
    scopeKind: 'dept',
    scope: '产品部',
    scopeLabel: '产品部',
    note: '部门设置指定 · 审本部门总部单据'
  }
]

const AP_KEY = 'pdApproverId'
export function currentApproverId() {
  try {
    return sessionStorage.getItem(AP_KEY) || approvers[0].id
  } catch (e) {
    return approvers[0].id
  }
}
export function setCurrentApproverId(id) {
  try {
    sessionStorage.setItem(AP_KEY, id)
  } catch (e) {
    /* ignore */
  }
}
export function currentApprover() {
  return approvers.find(a => a.id === currentApproverId()) || approvers[0]
}
export function cycleApprover() {
  const idx = approvers.findIndex(a => a.id === currentApproverId())
  const next = approvers[(idx + 1) % approvers.length]
  setCurrentApproverId(next.id)
  return next
}

/** 该单据按管理结构应该由谁审（正式开发据此路由，原型用于详情展示）
 *  门店岗：按岗位类型分流到对应的人事经理；总部岗：按部门设置指定的审批人 */
export function empOf(id) {
  return pdEmployees.find(e => e.id === id) || null
}

export function approverOfRecord(record) {
  const emp = empOf(record.empId)
  if (!emp) return null
  if (emp.org === '总部') {
    return approvers.find(a => a.scopeKind === 'dept' && a.scope === emp.dept) || null
  }
  return approvers.find(a => a.scopeKind === 'job' && a.scope === emp.job) || null
}

/** 该审批人视角下的单据：岗位人事经理只看本岗位门店单，部门审批人只看本部门总部单 */
export function approvalListOf(status = 'pending', approverId = currentApproverId()) {
  const approver = approvers.find(a => a.id === approverId) || approvers[0]
  return pdLeaveRecords
    .filter(r => {
      const emp = empOf(r.empId)
      if (!emp) return false
      if (approver.scopeKind === 'dept') return emp.org === '总部' && emp.dept === approver.scope
      return emp.org === '门店' && emp.job === approver.scope
    })
    .filter(r => status === 'all' || r.status === status)
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1))
}

export function pendingCount(approverId = currentApproverId()) {
  return approvalListOf('pending', approverId).length
}

/** 提交日 → 请假开始日的自然日差（判断提前申请期是否达标用） */
export function advanceDiffOf(record) {
  const submitted = record.submittedAt.split(' ')[0]
  return Math.round((new Date(record.date) - new Date(submitted)) / 86400000)
}

/** 审批详情：申请信息 + 命中审核规则 + 余额快照，一次取齐 */
export function approvalDetailOf(record) {
  const emp = empOf(record.empId)
  const type = leaveTypeOf(record.typeId)
  const profile = profileOf(emp)
  const leaveTypeId = type ? type.leaveTypeId : null
  const hit = leaveTypeId
    ? resolveApprovalRule(leaveTypeId, profile)
    : { rule: null, values: null, dimension: 'none', alsoMatched: [] }
  return {
    record,
    emp,
    type,
    profile,
    rule: hit.rule,
    values: hit.values,
    ruleDimension: hit.dimension,
    advanceDiff: advanceDiffOf(record),
    balances: balancesOf(emp),
    proofText: hit.values ? proofTextOf(hit.values.proofTypes) : ''
  }
}

export function approveRecord(id) {
  const hit = pdLeaveRecords.find(r => r.id === id)
  if (hit) hit.status = 'approved'
  return hit
}

export function rejectRecord(id, reason) {
  const hit = pdLeaveRecords.find(r => r.id === id)
  if (hit) {
    hit.status = 'rejected'
    hit.rejectReason = reason
  }
  return hit
}

/* ---------------- 员工侧 · 审批流转（记录详情可见） ----------------
   审批链按岗位归属生成，两种形态：
   · 门店岗（推拿师 / 客户经理）：1 级节点，直接到岗位对应的人事经理；
   · 总部：按岗位 / 部门配置，允许多级 —— 原型示范「部门审批 → 人事复核」两级，
     且节点 1 配多人（主审批人 + 备岗，任一人处理即可流转）。
   正式开发的节点链与节点成员由审批配置决定，本函数只按记录状态推导各节点进展。 */
export function approvalFlowOf(record) {
  const emp = empOf(record.empId)
  if (!emp) return []
  const nodes = []
  if (emp.org === '总部') {
    nodes.push({
      title: '部门审批',
      people: ['陈慧 · 产品部审批人', '刘洋 · 备岗审批人'],
      mode: 'any'
    })
    nodes.push({ title: '人事复核', people: ['孙倩 · 人事经理'], mode: 'single' })
  } else {
    const a = approverOfRecord(record)
    nodes.push({
      title: '人事审批',
      people: a ? [`${a.name} · ${a.role}`] : ['未配置审批人'],
      mode: 'single'
    })
  }

  if (record.status === 'approved') {
    return nodes.map(n => ({ ...n, status: 'done' }))
  }
  if (record.status === 'rejected') {
    return nodes.map((n, i) => ({ ...n, status: i === 0 ? 'rejected' : 'waiting' }))
  }
  if (record.status === 'withdrawn') {
    return nodes.map(n => ({ ...n, status: 'waiting' }))
  }
  /* 待审核：停在第一节点 */
  return nodes.map((n, i) => ({ ...n, status: i === 0 ? 'current' : 'waiting' }))
}
