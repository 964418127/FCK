/**
 * 系统项跑一次：把目录里的判定 / 执行 / 回执，落成这一单某一步的结论。
 *
 * 为什么需要这一层：走查发现节点进入「核验中 / 等回执」之后，再没有人把结论写回来，
 * 一单永远走不到办结。真实系统里这是「到点跑批、把结论写回来」；
 * 原型里给它一个显式动作，语义与真实一致：
 *
 *   判定 system  —— 取最近一批里该工号的结论；未通过就等下一批（受批次上限约束）
 *   执行 action  —— 提交即执行，逐目标拿回执
 *   外部 external —— 对方不动就没有回执，只能等（界面给「收到回执」代对方动作）
 *
 * 判定条件的主权在检查方（catalog.js），这里只**取用**结论，不改条件、不改数据。
 */
import { checkByKey, actionByKey, latestBatchOf } from './catalog.js'
import { TERMINAL, depsMet, needsHuman, primaryType } from './instance.js'
import { receiptFieldsOf, receiptBackOf, receiptTextOf } from './model.js'

/** 判定项的「通过」口径：命中硬条件，或落在软性区间 */
const PASS = ['通过', '软性命中']

const pad = (n) => String(n).padStart(2, '0')
const stamp = (d = new Date()) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
const dayCode = (d = new Date()) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`

const wayOf = (sub, type) => (sub.ways || []).find((w) => w.type === type)

/** 批次留痕：一行一批，repeat = 同一批又被取到一次，不计新的未通过批次 */
function addDetail (st, row) {
  const list = Array.isArray(st.detail) ? st.detail : []
  const last = list[list.length - 1]
  const repeat = !!last && !!row.batchNo && last.batchNo === row.batchNo
  list.push({ at: '', batchNo: '', metrics: '', result: '通过', repeat: false, ...row, repeat })
  st.detail = list
}

/**
 * 判定：取一批结论写回。
 * round 1 用目录里真实跑过的那一批（能照出「这个人确实不合格」）；
 * 之后每取一次，视作检查方按最新台账重跑了一批 —— 原型里不再造数据，只把「新批次」这条事实写清。
 */
export function runCheck (inst, sub, st = {}) {
  const w = wayOf(sub, 'system')
  const c = checkByKey(w?.sysKey)
  if (!c) return { ok: false, why: `目录里没有判定项 ${w?.sysKey || ''}` }

  const empNo = inst.emp?.empNo || inst.emp?.id || ''
  const round = (st.polls || 0) + 1
  const at = stamp()

  let batchNo = ''
  let metrics = ''
  let result = '通过'

  if (round === 1) {
    const b = latestBatchOf(c.key)
    const v = (b?.verdicts || []).find((x) => x.empNo === empNo)
    batchNo = b?.batchNo || `B-${dayCode()}-01`
    if (v) {
      metrics = v.metrics || ''
      result = v.result || '通过'
    } else {
      // 这一批没扫到他（不是不合格）：按台账直接核验
      metrics = `本批未扫到该工号，按台账直接核验：${(c.pass?.items || []).join('、')}`
      result = '通过'
    }
  } else {
    batchNo = `B-${dayCode()}-${pad(round)}`
    metrics = `第 ${round} 批重算：${(c.pass?.items || []).join('、')} 全部命中`
    result = '通过'
  }

  const pass = PASS.includes(result)
  st.polls = round
  st.result = pass
    ? (result === '软性命中' ? `软性命中（${metrics}）` : metrics || '条件全部命中')
    : `第 ${round} 批未通过：${metrics}`
  st.by = '系统'
  st.at = pass ? at : null
  addDetail(st, { at, batchNo, metrics, result })

  if (pass) {
    st.state = 'done'
    st.failBatches = st.failBatches || 0
    delete st.nextAt
    return { ok: true, pass: true, result, batchNo }
  }

  // 未通过：不是失败，是等下一批。批次用完仍未通过 → 这一环按未通过处理（必过则终止整单）
  const maxRuns = Number(w?.fetch?.maxRuns) || 5
  // 只计「不同批次」，同一批被重复取到不算新的未通过批次
  const used = (st.detail || []).filter((d) => !d.repeat && !PASS.includes(d.result)).length
  st.failBatches = used
  if (used >= maxRuns) {
    st.state = 'rejected'
    st.verdict = '未通过'
    st.result = `已取 ${used} 个未通过批次，未取得通过结论：${metrics}`
    return { ok: true, pass: false, exhausted: true, result: st.result, batchNo }
  }
  st.state = 'checking'
  st.nextAt = nextAtOf(w?.fetch?.fetchFreq)
  return { ok: true, pass: false, result: st.result, batchNo }
}

/** 下一次什么时候取：按流程侧配的频率（只用于展示） */
function nextAtOf (freq = '1d') {
  const d = new Date()
  if (String(freq).endsWith('h')) d.setHours(d.getHours() + (Number(String(freq).slice(0, -1)) || 12))
  else d.setDate(d.getDate() + (Number(String(freq).slice(0, -1)) || 1))
  return stamp(d)
}

/** 执行动作的逐目标清单：账号按这个人名下仍有效的，通知类按订阅方 */
function targetsOf (inst, w, a) {
  const target = a?.target || ''
  if (target === '账号') return (inst.emp?.perms || []).length ? inst.emp.perms.map(permLabel) : ['（名下无有效账号）']
  if (target === '系统') return ['薪酬系统', '社保系统', '假勤系统']
  if (target === '班次') return [`${inst.emp?.name || '员工'} 离职生效日后的未开始班次`]
  return [w?.targets || a?.targetFrom || a?.name || '目标']
}

const PERM_LABEL = {
  pos: 'POS 收银', schedule: '排班', wecom: '企业微信', 'web.shift': '排班后台',
  'web.report': '报表后台', 'web.crm': '客户档案', meituan: '美团商家',
  'store.admin': '门店后台', 'city.admin': '城市后台'
}
export const permLabel = (k) => PERM_LABEL[k] || k

/**
 * 上游环节已经填下的结果值：参数声明了「来自结果」的，就去已办结的记录里按字段名取。
 * 取不到就是取不到 —— 执行项照常跑，但不假装自己知道该按什么值执行。
 */
function resultValueOf (inst, key) {
  const subs = inst?.subs || {}
  for (const st of Object.values(subs)) {
    for (const rec of Object.values(st?.records || {})) {
      const v = rec?.values?.[key]
      if (v !== undefined && v !== null && String(v).trim() !== '') return v
    }
  }
  return ''
}

/** 这次执行实际用到的上游值（逐参数），给界面看「按什么执行的」 */
function usedArgsOf (inst, a) {
  return (a?.args || [])
    .filter((arg) => String(arg.from || '').startsWith('结果：'))
    .map((arg) => ({ key: arg.key, label: arg.label, value: resultValueOf(inst, arg.key) }))
    .filter((x) => x.value !== '')
}

/** 执行：提交即执行，逐目标回执。部分成功按软性记，不拦流程 */
export function runAction (inst, sub, st = {}) {
  if (st.exec?.length) return { ok: true, same: true }
  const w = wayOf(sub, 'action')
  const a = actionByKey(w?.actionKey)
  const targets = targetsOf(inst, w, a)
  const used = usedArgsOf(inst, a)
  st.exec = targets.map((t) => ({ target: t, result: '成功' }))
  st.state = 'done'
  st.by = '系统'
  st.at = stamp()
  if (used.length) st.used = used
  const usedText = used.length ? `（按${used.map((u) => `${u.label} = ${u.value}`).join('、')}）` : '（上游还没给值，按空值执行）'
  st.result = `已执行 ${a?.name || '动作'}：${targets.length} 个目标全部成功${usedText}`
  return { ok: true, targets: targets.length, used }
}

/** 外部回执：对方动手、我方等。原型里「收到回执」= 代对方把回执送回来 */
export function runReceipt (inst, sub, st = {}) {
  const w = wayOf(sub, 'external')
  const fields = receiptFieldsOf(w)
  const back = receiptBackOf(w)
  const f = fields.find((x) => x.key === back) || null
  st.state = 'done'
  st.by = w?.party || '外部'
  st.at = stamp()
  if (!back) {
    /* 没有回执字段 = 没有约定：只能记「收到一句话」，不能当达成凭证，更不能写一个假值下去 */
    st.result = `已收到回执：${receiptTextOf(w) || '外部回执'}（${w?.party || '外部系统'}）· 没写回执字段，下游引用不到`
    return { ok: true }
  }
  /* 回执落成值写进 records：下游按「结果：<这条结论> · <字段>」取，取的是这个值 */
  const v = (f?.values || [])[0] || '已确认'
  st.records = {
    ...(st.records || {}),
    [`receipt.${back}`]: { verdict: '通过', values: { [back]: v }, files: 0, note: '外部回执' }
  }
  st.result = `已收到回执：${receiptTextOf(w)}（${w?.party || '外部系统'}）· 写回 ${f?.label || back}（${back}）= ${v}`
  return { ok: true, [back]: v }
}

/** 这一步现在能不能自己往下跑（人办的不代劳） */
export const autoKindOf = (sub) => (needsHuman(sub) ? '' : primaryType(sub))

/**
 * 系统侧自动推进一轮：
 * 判定取首批、执行拿回执；外部回执不代劳（对方不动就是没有）。
 * 判定已经取过仍未通过的，不再自动取 —— 那是「等下一批」，由人决定继续等还是催。
 */
export function autoSettle (inst, tree = []) {
  let changed = false
  for (const s of tree) {
    const st = inst.subs?.[s.id]
    if (!st || TERMINAL.includes(st.state)) continue
    if (!depsMet(s, inst)) continue
    if (needsHuman(s)) continue
    const kind = primaryType(s)
    if (kind === 'system') {
      if (st.state !== 'checking' || st.polls) continue
      if (runCheck(inst, s, st).ok) changed = true
    } else if (kind === 'action') {
      if (st.state !== 'running') continue
      if (runAction(inst, s, st).ok) changed = true
    }
    // external：等对方，不自动
  }
  return changed
}

/** 界面文案：这一步在等什么、还能做什么 */
export function waitingHint (sub, st = {}) {
  const kind = primaryType(sub)
  if (kind === 'system') {
    const bits = [`已取 ${st.polls || 0} 次`]
    if (st.failBatches) bits.push(`消费 ${st.failBatches} 个未通过批次`)
    if (st.nextAt) bits.push(`下次 ${st.nextAt}`)
    return { text: bits.join(' · '), can: 'again' }
  }
  if (kind === 'action') return { text: '执行中，等回执', can: 'run' }
  if (kind === 'external') return { text: `等「${wayOf(sub, 'external')?.party || '对方'}」回执`, can: 'receipt' }
  return { text: '', can: '' }
}
