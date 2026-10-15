/* ============================================================
   假期盘点（数据层 · 本轮盘点用，非结论）
   视角：结果侧 —— 按周期看「每个员工还剩多少假、这些假怎么用掉的」
   口径：
     · 额度来自「岗位引用的假期方案」（leaveWorkMode.js）
     · 已用来自假勤申请记录（本文件 leaveRecords），按申请里的扣减分段累计
     · 1 天 = 8 小时（一线岗排班日）
   注意：真实发放 / 结转 / 与排班的抵扣顺序仍在现有额度模块，
        本页只做盘点，不产生业务动作。
   ============================================================ */
import { jobWorkModes, findQuotaScheme } from './leaveWorkMode.js'

const _jobMode = (job) => jobWorkModes.find(m => m.job === job) || null

/* ---------------- 周期 ---------------- */
export const ledgerModes = [
  { value: 'month', label: '自然月' },
  { value: 'quarter', label: '自然季' },
  { value: 'year', label: '自然年' }
]

export const ledgerPeriods = {
  month: [
    { value: '2026-10', label: '2026 年 10 月' },
    { value: '2026-09', label: '2026 年 9 月' },
    { value: '2026-08', label: '2026 年 8 月' }
  ],
  quarter: [
    { value: '2026-Q4', label: '2026 年 Q4' },
    { value: '2026-Q3', label: '2026 年 Q3' }
  ],
  year: [{ value: '2026', label: '2026 年度' }]
}

export const ledgerJobOptions = ['全部', ...jobWorkModes.map(m => m.job)]

/* ---------------- 员工 ---------------- */
/* quotaAdjust：系统折算后与方案名义额度不同的情况（如临时假按上月业绩折算） */
export const ledgerEmployees = [
  { id: 'e01', staffNo: 'TL1001', name: '陈伟', job: '推拿师', org: '门店', store: '深圳南山店', joinedAt: '2023-04-12',
    quotaAdjust: { 'qs-temp-16h': { amount: 12, note: '按 9 月业绩折算' } } },
  { id: 'e02', staffNo: 'TL1002', name: '刘婷', job: '推拿师', org: '门店', store: '深圳福田店', joinedAt: '2023-08-01' },
  { id: 'e03', staffNo: 'TL1003', name: '王强', job: '推拿师', org: '门店', store: '成都春熙店', joinedAt: '2022-11-09' },
  { id: 'e04', staffNo: 'TL1004', name: '李娜', job: '推拿师', org: '门店', store: '成都春熙店', joinedAt: '2024-03-15' },
  { id: 'e05', staffNo: 'TL1005', name: '张敏', job: '客户经理', org: '门店', store: '深圳南山店', joinedAt: '2022-06-20' },
  { id: 'e06', staffNo: 'TL1006', name: '周昊', job: '客户经理', org: '门店', store: '深圳福田店', joinedAt: '2023-02-14' },
  { id: 'e07', staffNo: 'TL1007', name: '赵蕾', job: '客户经理', org: '门店', store: '成都春熙店', joinedAt: '2023-09-05' },
  { id: 'e08', staffNo: 'TL1008', name: '孙志远', job: '门店店长', org: '门店', store: '深圳南山店', joinedAt: '2021-05-10' },
  { id: 'e09', staffNo: 'TL1009', name: '吴倩', job: '前台客服', org: '门店', store: '深圳南山店', joinedAt: '2024-01-08' },
  { id: 'e10', staffNo: 'TL1010', name: '郑凯', job: '前台客服', org: '门店', store: '成都春熙店', joinedAt: '2023-07-17' },
  { id: 'e11', staffNo: 'TL1011', name: '何洁', job: '产品经理', org: '总部', store: '总部', joinedAt: '2022-03-01' },
  { id: 'e12', staffNo: 'TL1012', name: '马东', job: '后端开发', org: '总部', store: '总部', joinedAt: '2021-09-13' },
  { id: 'e13', staffNo: 'TL1013', name: '冯雪', job: '前端开发', org: '总部', store: '总部', joinedAt: '2023-05-22' },
  { id: 'e14', staffNo: 'TL1014', name: '邓超', job: '运营专员', org: '总部', store: '总部', joinedAt: '2022-12-05' },
  { id: 'e15', staffNo: 'TL1015', name: '秦岚', job: '职能支持', org: '总部', store: '总部', joinedAt: '2020-11-02' },
  { id: 'e16', staffNo: 'TL1016', name: '蒋涛', job: '区域经理', org: '总部', store: '外勤 / 巡店', joinedAt: '2019-04-15' }
]

/** 门店 / 办公点候选：按名称（不是「门店 / 总部」这类分类），且支持输入片段模糊匹配 */
export const ledgerStoreOptions = ['全部', ...Array.from(new Set(ledgerEmployees.map(e => e.store)))]

/* ---------------- 申请记录 ---------------- */
/* deduction：本条申请实际扣了哪些额度；schemeId 为 null 表示「超出」部分 */
export const leaveRecords = [
  /* 2026-10 */
  { id: 'lr-1001', date: '2026-10-06', empId: 'e01', leaveType: '班次假', amount: 2, unit: '天', status: '已通过',
    deduction: [{ schemeId: 'qs-shift-4d', label: '班次假', value: 2, unit: '天' }] },
  { id: 'lr-1002', date: '2026-10-13', empId: 'e01', leaveType: '临时假', amount: 6, unit: '小时', status: '已通过',
    deduction: [{ schemeId: 'qs-temp-16h', label: '临时假', value: 6, unit: '小时' }] },
  { id: 'lr-1003', date: '2026-10-09', empId: 'e02', leaveType: '班次假', amount: 1, unit: '天', status: '已通过',
    deduction: [{ schemeId: 'qs-shift-4d', label: '班次假', value: 1, unit: '天' }] },
  { id: 'lr-1004', date: '2026-10-12', empId: 'e03', leaveType: '特殊情况请假', amount: 6, unit: '天', status: '已通过',
    deduction: [
      { schemeId: 'qs-shift-4d', label: '班次假', value: 4, unit: '天' },
      { schemeId: 'qs-temp-16h', label: '临时假', value: 16, unit: '小时' },
      { schemeId: null, label: '超出', value: 1, unit: '天' }
    ], note: '超出部分不扣薪资，只记录时长' },
  { id: 'lr-1005', date: '2026-10-10', empId: 'e04', leaveType: '临时假', amount: 8, unit: '小时', status: '已通过',
    deduction: [{ schemeId: 'qs-temp-16h', label: '临时假', value: 8, unit: '小时' }] },
  { id: 'lr-1006', date: '2026-10-09', empId: 'e05', leaveType: '特殊情况请假', amount: 5, unit: '天', status: '已通过',
    deduction: [
      { schemeId: 'qs-shift-4d', label: '班次假', value: 4, unit: '天' },
      { schemeId: null, label: '超出', value: 1, unit: '天' }
    ], note: '超出 1 天按薪资扣减' },
  { id: 'lr-1007', date: '2026-10-14', empId: 'e06', leaveType: '班次假', amount: 2, unit: '天', status: '待审批',
    deduction: [{ schemeId: 'qs-shift-4d', label: '班次假', value: 2, unit: '天' }] },
  { id: 'lr-1008', date: '2026-10-11', empId: 'e07', leaveType: '班次假', amount: 1, unit: '天', status: '已通过',
    deduction: [{ schemeId: 'qs-shift-4d', label: '班次假', value: 1, unit: '天' }] },
  { id: 'lr-1009', date: '2026-10-08', empId: 'e08', leaveType: '年假', amount: 1, unit: '天', status: '已通过',
    deduction: [{ schemeId: 'qs-annual-5d', label: '年假', value: 1, unit: '天' }] },
  { id: 'lr-1010', date: '2026-10-11', empId: 'e09', leaveType: '丧假', amount: 3, unit: '天', status: '待审批',
    deduction: [{ schemeId: 'qs-funeral-3d', label: '丧假', value: 3, unit: '天' }] },
  { id: 'lr-1011', date: '2026-10-14', empId: 'e10', leaveType: '年假', amount: 2, unit: '天', status: '已通过',
    deduction: [{ schemeId: 'qs-annual-5d', label: '年假', value: 2, unit: '天' }] },
  { id: 'lr-1012', date: '2026-10-05', empId: 'e12', leaveType: '婚假', amount: 3, unit: '天', status: '已通过',
    deduction: [{ schemeId: 'qs-marriage-3d', label: '婚假', value: 3, unit: '天' }] },
  { id: 'lr-1013', date: '2026-10-13', empId: 'e13', leaveType: '年假', amount: 2, unit: '天', status: '已通过',
    deduction: [{ schemeId: 'qs-annual-5d', label: '年假', value: 2, unit: '天' }] },
  { id: 'lr-1014', date: '2026-10-07', empId: 'e14', leaveType: '丧假', amount: 3, unit: '天', status: '已通过',
    deduction: [{ schemeId: 'qs-funeral-3d', label: '丧假', value: 3, unit: '天' }] },
  { id: 'lr-1015', date: '2026-10-15', empId: 'e15', leaveType: '年假', amount: 1, unit: '天', status: '待审批',
    deduction: [{ schemeId: 'qs-annual-5d', label: '年假', value: 1, unit: '天' }] },
  { id: 'lr-1016', date: '2026-10-14', empId: 'e16', leaveType: '年假', amount: 1, unit: '天', status: '已通过',
    deduction: [{ schemeId: 'qs-annual-5d', label: '年假', value: 1, unit: '天' }] },
  { id: 'lr-1017', date: '2026-10-09', empId: 'e11', leaveType: '年假', amount: 1, unit: '天', status: '已通过',
    deduction: [{ schemeId: 'qs-annual-5d', label: '年假', value: 1, unit: '天' }] },

  /* 2026-09 */
  { id: 'lr-0901', date: '2026-09-15', empId: 'e01', leaveType: '班次假', amount: 3, unit: '天', status: '已通过',
    deduction: [{ schemeId: 'qs-shift-4d', label: '班次假', value: 3, unit: '天' }] },
  { id: 'lr-0902', date: '2026-09-18', empId: 'e03', leaveType: '临时假', amount: 10, unit: '小时', status: '已通过',
    deduction: [{ schemeId: 'qs-temp-16h', label: '临时假', value: 10, unit: '小时' }] },
  { id: 'lr-0903', date: '2026-09-20', empId: 'e05', leaveType: '班次假', amount: 4, unit: '天', status: '已通过',
    deduction: [{ schemeId: 'qs-shift-4d', label: '班次假', value: 4, unit: '天' }] },
  { id: 'lr-0904', date: '2026-09-22', empId: 'e12', leaveType: '年假', amount: 2, unit: '天', status: '已通过',
    deduction: [{ schemeId: 'qs-annual-5d', label: '年假', value: 2, unit: '天' }] },
  { id: 'lr-0905', date: '2026-09-25', empId: 'e02', leaveType: '班次假', amount: 2, unit: '天', status: '已通过',
    deduction: [{ schemeId: 'qs-shift-4d', label: '班次假', value: 2, unit: '天' }] },

  /* 2026-08 */
  { id: 'lr-0801', date: '2026-08-12', empId: 'e01', leaveType: '临时假', amount: 12, unit: '小时', status: '已通过',
    deduction: [{ schemeId: 'qs-temp-16h', label: '临时假', value: 12, unit: '小时' }] },
  { id: 'lr-0802', date: '2026-08-20', empId: 'e08', leaveType: '年假', amount: 2, unit: '天', status: '已通过',
    deduction: [{ schemeId: 'qs-annual-5d', label: '年假', value: 2, unit: '天' }] }
]

/* ---------------- 计算 ---------------- */

const inPeriod = (date, mode, period) => {
  if (mode === 'year') return date.slice(0, 4) === period
  if (mode === 'month') return date.slice(0, 7) === period
  const year = period.slice(0, 4)
  const q = Number(period.slice(-1))
  return date.slice(0, 4) === year && Math.ceil(Number(date.slice(5, 7)) / 3) === q
}

/** 周期型方案在所选周期内的可用额度（月 → 季 / 年 按倍数放大；年口径不缩放） */
function schemeAmount(scheme, mode) {
  if (scheme.cycle === '自然月') {
    return scheme.amount * (mode === 'month' ? 1 : mode === 'quarter' ? 3 : 12)
  }
  return scheme.amount
}

/** 某员工在所选周期内的各假种余额 */
export function balancesOf(emp, mode, period) {
  const jm = _jobMode(emp.job)
  const schemes = ((jm && jm.quotaSchemeIds) || []).map(findQuotaScheme).filter(Boolean)
  const recs = leaveRecords.filter(r => r.empId === emp.id)

  return schemes.map(s => {
    const adjust = (emp.quotaAdjust || {})[s.id]

    if (s.measure === 'event') {
      const times = recs.filter(r => r.leaveType === s.leaveType && inPeriod(r.date, mode, period)).length
      return {
        schemeId: s.id, leaveType: s.leaveType, kind: 'event',
        unit: s.unit, perTime: s.amount, usedTimes: times
      }
    }

    /* 年口径的方案（如年假）不随所选周期缩放：额度与已用都按自然年算 */
    const yearScoped = s.cycle === '自然年'
    const scopeMode = yearScoped ? 'year' : mode
    const scopePeriod = yearScoped ? period.slice(0, 4) : period

    const quota = adjust ? adjust.amount : schemeAmount(s, mode)
    let used = 0
    recs.forEach(r => {
      if (!inPeriod(r.date, scopeMode, scopePeriod)) return
      ;(r.deduction || []).forEach(d => {
        if (d.schemeId === s.id) used += d.value
      })
    })
    const remaining = Math.round((quota - used) * 10) / 10

    return {
      schemeId: s.id, leaveType: s.leaveType, kind: 'cycle',
      unit: s.unit, quota, used, remaining, over: remaining < 0,
      adjusted: !!adjust, adjustNote: adjust ? adjust.note : '',
      scopeText: yearScoped ? '年' : mode === 'month' ? '月' : mode === 'quarter' ? '季' : '年'
    }
  })
}

/** 某员工在所选周期内的申请记录 */
export function recordsOf(empId, mode, period) {
  return leaveRecords
    .filter(r => r.empId === empId && inPeriod(r.date, mode, period))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

/** 全部记录中，某员工参与的任何一条是否带「超出」段 */
export function hasExcess(row) {
  return (row.deduction || []).some(d => !d.schemeId)
}

/** 扣减渠道文字：班次假 → 临时假 → 超出 */
export function deductionText(row) {
  return (row.deduction || []).map(d => d.label).join(' → ')
}

/** 超出时长文字 */
export function excessText(row) {
  const d = (row.deduction || []).find(x => !x.schemeId)
  return d ? `${d.value} ${d.unit}` : ''
}

/** 顶部汇总（受筛选影响） */
export function ledgerSummary(emps, mode, period) {
  const ids = emps.map(e => e.id)
  const recs = leaveRecords.filter(r => ids.includes(r.empId) && inPeriod(r.date, mode, period))
  const jobTypes = new Set()
  emps.forEach(e => balancesOf(e, mode, period).forEach(b => jobTypes.add(b.leaveType)))
  return {
    employees: emps.length,
    records: recs.length,
    leaveTypes: jobTypes.size,
    excess: recs.filter(hasExcess).length,
    pending: recs.filter(r => r.status === '待审批').length
  }
}
