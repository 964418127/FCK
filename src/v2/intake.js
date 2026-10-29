/**
 * 触发前置取数（intake）
 *
 * 这件事不属于定义期，也不属于「这一单的树」——
 * 它是引擎对**所有根事件**天然执行的一步：拿到「谁触发了」之后，先把这个人查清楚，
 * 再拿这个人去生成树。
 *
 * 三条边界，写死在这里：
 * 1. 不进骨架：骨架是「这件事必须交付哪些结论」，取数是生成结论清单的输入，不是结论
 * 2. 不在树上：树上每条都要有人给结论；取数没有承担者、不给结论，把它摆上树会让它看起来能被排到交接之后
 * 3. 不可调整：没人能删掉它、跳过它、改它的执行时机 —— 所以不给开关，也没有配置项
 *
 * 为什么必须有：树是按「这个人有客户 / 带团队 / 有资产」长出来的。
 * 这些事实还没取回来就生成，等于树已经长完了才去查长树要用的数据。
 */

import { factsOfPerson, staffById } from './base.js'

/** 固定两步：先确认人是谁，再取这个人的逐人事实 */
export const INTAKE_STEPS = [
  {
    key: 'staff',
    label: '员工档案',
    from: 'HR 员工主数据',
    by: '工号',
    what: '姓名 / 岗位 / 城市 / 门店 / 用工类型 / 入职日 / 合同主体'
  },
  {
    key: 'facts',
    label: '逐人事实',
    from: '客户 / 工单 / 资产 / 财务 / 权限台账',
    by: '工号',
    what: '在跟客户 / 在办事项 / 团队 / 资产 / 备用金 / 欠款 / 账号 / 客诉 / 补偿'
  }
]

const clock = (d = new Date()) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

/** 档案是否齐：齐了就不用查表，直接用随单带进来的那份 */
const hasProfile = (p = {}) => !!(p.name && p.job && p.store)

/** 事实取回了几项（0 与 false 也算「取到了，只是没有」，用来解释为什么某条不长） */
const factCount = (f = {}) => Object.keys(f).length

/** 事实里「有东西」的有几项，给人看一句话 */
const factHas = (f = {}) => {
  const yes = []
  if (f.clients) yes.push(`在跟客户 ${f.clients}`)
  if (f.team) yes.push(`团队 ${f.team} 人`)
  if ((f.assets || []).length) yes.push(`资产 ${f.assets.length} 项`)
  if (f.cash) yes.push(`备用金 ${f.cash}`)
  if (f.debt) yes.push(`欠款 ${f.debt}`)
  if ((f.accounts || []).length) yes.push(`账号 ${f.accounts.length} 个`)
  if (f.complaint) yes.push(`客诉 ${f.complaint}`)
  if (f.severance) yes.push('涉补偿')
  return yes
}

/**
 * 跑一遍取数。返回补全后的 emp、事实、每一步的留痕。
 * 失败时不抛错，交给调用方决定（currently：拒绝触发，因为没档案就不知道树该长什么）。
 */
export function runIntake ({ emp = {}, at = '' } = {}) {
  const time = at || clock()
  const empNo = emp.empNo || emp.id || ''
  const steps = []

  // ① 员工档案：优先认随单带进来的，其次按工号回查主数据
  const found = empNo ? staffById(empNo) : null
  const merged = { ...(found || {}), ...emp }
  const profileOk = hasProfile(merged)
  steps.push({
    key: 'staff',
    label: '员工档案',
    query: empNo ? `工号 ${empNo}` : '无工号',
    result: profileOk
      ? `${merged.name} · ${merged.job} · ${merged.store} · ${merged.employType || '用工类型未记'}`
      : '查不到在职档案',
    ok: profileOk,
    at: time
  })

  if (!profileOk) {
    return {
      ok: false,
      at: time,
      empNo,
      emp: merged,
      facts: {},
      steps,
      reason: empNo ? `按工号 ${empNo} 查不到在职员工档案` : '没有工号，无法取员工档案'
    }
  }

  // ② 逐人事实：由各台账提供，取不到即视为「没有」，不做猜测
  const facts = emp.facts && Object.keys(emp.facts).length ? emp.facts : factsOfPerson(merged)
  steps.push({
    key: 'facts',
    label: '逐人事实',
    query: `工号 ${empNo || merged.id || '—'}`,
    result: factCount(facts) ? `${factCount(facts)} 项（${factHas(facts).join(' · ') || '均为空'}）` : '未取到',
    ok: true,
    at: time
  })

  return {
    ok: true,
    at: time,
    empNo,
    emp: { ...merged, facts },
    facts,
    steps
  }
}

/** 一句话说清「这棵树是拿什么长出来的」 */
export function intakeSummary (intake) {
  if (!intake) return ''
  const staff = intake.steps?.find((s) => s.key === 'staff')
  const facts = intake.steps?.find((s) => s.key === 'facts')
  if (!intake.ok) return `取数失败：${intake.reason}`
  return `员工档案 · ${staff?.result || '—'}；逐人事实 · ${facts?.result || '—'}`
}

/** 触发前置取数在界面上统一这么说（避免各处措辞不一） */
export const INTAKE_NOTE = '引擎内置：所有事件触发时自动执行，不在链路上、不进骨架、不可调整'
