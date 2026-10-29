/**
 * 实例侧运行逻辑（只读判断 + 纯函数，不碰 store）
 *
 * 定义期回答「这件事怎么走」，实例期回答三件事：
 *   1) 现在轮到谁 —— 前置都办结、自己还没进终态的那些节点
 *   2) 这一环要人交什么 —— 人办的 items 摊平成表单字段（审核也是人办，意见是一个普通字段）
 *   3) 办完这一步会怎样 —— 终态判定、必过未通过是否终止
 *
 * 这里只做判断，状态写回在 store.js（避免 store ↔ instance 互相 import）。
 */
import { depGroups, flatDeps, subMapOf, topoSort, stateLabel, roleLabel, resolveOwner, ownerOfWay } from './model.js'

/** 已经走完的节点状态：不再占用位次，也不再出现在待办里 */
export const TERMINAL = ['done', 'rejected', 'skipped', 'closed']

export const subStateOf = (inst, id) => inst?.subs?.[id]?.state || 'pending'
export const isTerminal = (inst, id) => TERMINAL.includes(subStateOf(inst, id))

/** 前置是否满足：或组里任一办结即可，与组必须全部办结 */
export function depsMet (sub, inst) {
  return depGroups(sub.deps || []).every((g) => g.ids.some((id) => isTerminal(inst, id)))
}

/** 还没走完、且前置已满足 —— 这些节点当前「开着」 */
export function openSubs (inst, tree) {
  return (tree || []).filter((s) => !isTerminal(inst, s.id) && depsMet(s, inst))
}

/** 主路径类型：人办 > 系统判定 > 执行 > 外部回执 */
const ORDER = ['human', 'system', 'action', 'external']
export function primaryType (sub) {
  const types = (sub?.ways || []).map((w) => w.type)
  return ORDER.find((t) => types.includes(t)) || 'human'
}

/** 要人动手的节点；系统与外部回执不在人的待办里 */
export const humanOf = (sub) => (sub?.ways || []).find((w) => w.type === 'human') || null

export function needsHuman (sub) {
  return !!humanOf(sub)
}

/** 当前待我办：有人的一环，且已轮到 */
export function todoOf (inst, tree) {
  return openSubs(inst, tree).filter(needsHuman)
}

/** 当前在等机器（系统判定 / 执行 / 外部回执） */
export function waitingOf (inst, tree) {
  return openSubs(inst, tree).filter((s) => !needsHuman(s))
}

/**
 * 表单字段摊平：按事项分组。
 * 审核没有单独的表单 —— 它就在事项里，核对字段与「审核意见」都是普通字段。
 * 返回 [{ itemId, itemTitle, require, fields: [...] }]
 */
export function formOf (sub) {
  return (humanOf(sub)?.items || []).map((it) => ({
    itemId: it.id,
    itemTitle: it.title,
    require: it.require,
    fields: it.fields || []
  }))
}

/**
 * 这一环由谁负责：负责人本身，不是动手的人。
 * 角色按实例员工的门店 / 城市解析到人；指定的人就是他本人。
 */
export function ownerOfSub (sub, inst) {
  const w = humanOf(sub)
  const o = ownerOfWay(w)
  if (!o.role && !o.name) return { kind: 'role', role: '', roleName: '', name: '', label: '' }
  const name = o.kind === 'person'
    ? o.name
    : o.role === 'employee'
      ? (inst?.emp?.name || '')
      : resolveOwner(o, { store: inst?.emp?.store, city: inst?.emp?.city })
  return {
    kind: o.kind,
    role: o.role,
    roleName: o.kind === 'person' ? '指定人' : roleLabel(o.role),
    name,
    label: o.kind === 'person' ? `指定 · ${name || '未填人'}` : roleLabel(o.role)
  }
}

/**
 * 这一环当前登录的人能不能办 —— 角色写的，同角色的人都能看见能办；
 * 指定的人写的，只有他本人能看见能办。
 *
 * 不做「兜底给谁」：解析不到人就是不成立，而不是找一个替代者。
 */
export function canHandle (sub, inst, me) {
  const w = humanOf(sub)
  if (!w) return false
  const o = ownerOfWay(w)
  if (o.kind === 'person') return !!me && me.name === o.name
  if (!o.role) return false
  if (!me) return true
  if (o.role === 'employee') {
    return me.name === inst?.emp?.name || (!!me.empNo && me.empNo === inst?.emp?.empNo)
  }
  // 按「这一单」的门店 / 城市解析：角色是相对于这张单说的，不是相对于我自己的门店
  return resolveOwner(o, { store: inst?.emp?.store, city: inst?.emp?.city }) === me.name
}

/** 当前待我办：人能办的那些里，责任落在当前登录人身上的 */
export const myTodoOf = (inst, tree, me) => todoOf(inst, tree).filter((s) => canHandle(s, inst, me))

/**
 * 这一批单子上「可能轮到的人」—— 用来切换登录身份做走查。
 * 来源只有三处：单上的人、角色解析到的人、被指定的人；不列花名册。
 */
export function identitiesOf (insts = [], treeOf = () => []) {
  const out = new Map()
  const put = (p) => {
    if (!p?.name) return
    const cur = out.get(p.name)
    // 同一个人可能既被角色解析到、又被指定：保留有岗位的那条，别把「财务专员」盖成「指定人」
    if (cur && p.job === '指定人') return
    out.set(p.name, p)
  }
  insts.forEach((inst) => {
    const emp = inst.emp || {}
    put({ name: emp.name, empNo: emp.empNo || '', job: emp.job || '', store: emp.store || '', city: emp.city || '', from: '单上的人' })
    ;(treeOf(inst) || []).forEach((s) => {
      const w = humanOf(s)
      if (!w) return
      const o = ownerOfWay(w)
      if (o.kind === 'person') {
        put({ name: o.name, empNo: '', job: '指定人', store: '', city: '', from: '指定的人' })
        return
      }
      if (!o.role || o.role === 'employee') return
      const name = resolveOwner(o, { store: emp.store, city: emp.city })
      if (name) put({ name, empNo: '', job: roleLabel(o.role), store: emp.store, city: emp.city, from: roleLabel(o.role) })
    })
  })
  return [...out.values()]
}

export function progressOf (inst, tree) {
  const total = (tree || []).length
  const done = (tree || []).filter((s) => isTerminal(inst, s.id)).length
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 }
}

/** 状态一句话：列表卡右侧那行「现在到哪了」；给了 me 就先说轮到我的那一环 */
export function nowTextOf (inst, tree, me = null) {
  if (inst?.state === 'generating') return { tone: 'info', text: '正在按这一单生成交接事项' }
  const mine = me ? myTodoOf(inst, tree, me) : []
  const todo = mine.length ? mine : todoOf(inst, tree)
  if (inst?.state === 'terminated') return { tone: 'danger', text: '必过节点未通过，流程已终止' }
  if (inst?.state === 'done' || progressOf(inst, tree).done === tree.length) return { tone: 'ok', text: '已办结' }
  if (todo.length) {
    const s = todo[0]
    const o = ownerOfSub(s, inst)
    return { tone: 'warn', text: `${o.roleName} ${o.name} · ${s.goal}` }
  }
  const wait = waitingOf(inst, tree)
  if (wait.length) {
    const s = wait[0]
    const sys = (s.ways || []).find((w) => w.type === 'system')
    const st = subStateOf(inst, s.id)
    if (sys) return { tone: 'info', text: st === 'checking' ? `系统核验中 · ${s.goal}` : `待取数 · ${s.goal}` }
    return { tone: 'info', text: `等回执 · ${s.goal}` }
  }
  return { tone: 'muted', text: '等待前置' }
}

export const instStateLabel = (k) => ({
  generating: '生成中',
  running: '流转中',
  done: '已办结',
  terminated: '已终止',
  draft: '草稿'
}[k] || k)

/** 时间线：按拓扑顺序，带每一步的状态与经办 */
export function timelineOf (inst, tree) {
  return topoSort(tree || []).map((s) => {
    const st = inst?.subs?.[s.id] || { state: 'pending', records: {} }
    return {
      ...s,
      state: st.state || 'pending',
      stateText: stateLabel(st.state || 'pending'),
      by: st.by || '',
      at: st.at || '',
      verdict: st.verdict || '',
      result: st.result || '',
      note: st.note || '',
      records: st.records || {},
      // 系统项自己那几笔：取了几次、消费了几个未通过批次、下次什么时候取、逐目标回执
      polls: st.polls || 0,
      failBatches: st.failBatches || 0,
      nextAt: st.nextAt || '',
      exec: st.exec || [],
      used: st.used || [],
      detail: st.detail || []
    }
  })
}

/** 事项记录里的字段名（把 key 翻成中文，给已办留痕用） */
export function fieldLabelsOf (tree) {
  const map = {}
  ;(tree || []).forEach((s) => {
    ;(humanOf(s)?.items || []).forEach((it) => {
      ;(it.fields || []).forEach((f) => { map[`${s.id}|${it.id}|${f.key}`] = f.label })
    })
  })
  return map
}

export const subMap = (tree) => subMapOf(tree || [])
export const allDeps = (tree) => flatDeps((tree || []).flatMap((s) => s.deps || []))
