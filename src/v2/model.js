/**
 * v2 编排模型 · 契约约定的唯一落点（评审稿）
 *
 * 九个对象（与文档一一对应）：
 *   根事件 event / 触点 trigger / 人群 scope / 子事件 sub / 事项 item / 字段 field
 *   取数策略 fetch / 系统项 sys（只读引用）/ 终点动作 action（只读引用）
 *   实例 instance
 *
 * 三条不写进字段的约定（写在这里防止实现时跑偏）：
 *   1) 子事件不设 kind —— 人做还是系统做，写在 ways[] 里
 *   2) 字段不记来源、不标记判定 —— 系统算出来的一律进批次结果
 *   3) 位次不落库 —— 起点 = deps 为空，收尾 = 无人依赖，中间即过程
 *
 * 差异不设覆盖：一群人与另一群人的不同，落在「谁办这一步」（role / 指定人）
 * 与「这一步存不存在」上，由编排时直接决定，不在基线上打补丁。
 */

/* ---------------- 枚举与标签 ---------------- */

export const VERDICTS = ['通过', '软性', '未通过']

export const FIELD_TYPES = [
  { key: 'text', label: '文本' },
  { key: 'textarea', label: '多行文本' },
  { key: 'number', label: '数值' },
  { key: 'date', label: '日期' },
  { key: 'select', label: '单选' },
  { key: 'multiselect', label: '多选' },
  { key: 'person', label: '人员' },
  { key: 'file', label: '附件' }
]
export const fieldTypeLabel = (t) => (FIELD_TYPES.find((x) => x.key === t) || {}).label || t

/**
 * 字段类型 → 表单控件。人对「组件」的理解是控件，不是字段类型名：
 * 说「日期选择」比说「date」清楚，说「附件上传」比说「file」清楚。
 */
export const CONTROLS = {
  text: { label: '单行文本', hint: '一句话或一串编号' },
  textarea: { label: '多行文本', hint: '一段说明 / 审核意见' },
  number: { label: '数字', hint: '金额 / 数量 / 天数' },
  date: { label: '日期选择', hint: '一个日期' },
  select: { label: '单选', hint: '从固定选项里选一个' },
  multiselect: { label: '多选', hint: '从固定选项里选若干个' },
  person: { label: '人员选择', hint: '从花名册里选人' },
  file: { label: '附件上传', hint: '凭证 / 清单 / 照片' }
}
export const controlOf = (t) => (CONTROLS[t] || {}).label || t
/** 一个事项要收的组件清单（带必填标记），用于确认页与工作台显示 */
export function controlsOf (item) {
  return (item?.fields || []).map((f) => ({ key: f.key, name: f.label, control: controlOf(f.type), required: !!f.required, rule: f.rule }))
}

export const WAY_TYPES = [
  { key: 'human', label: '人办理', tone: 'human', hint: '某个角色去办并交东西；审核也是这一种，结论写成「已审核通过」' },
  { key: 'system', label: '系统判定', tone: 'system', hint: '调用已登记的系统检查项，只出结论、不改数据' },
  { key: 'action', label: '系统执行', tone: 'action', hint: '调用已登记的动作，真的改数据或发出东西，拿回执' },
  { key: 'external', label: '外部回执', tone: 'external', hint: '对方的人要动手，我方只能等它回话' }
]
export const wayTypeLabel = (t) => (WAY_TYPES.find((x) => x.key === t) || {}).label || t

/**
 * 结果值给人看：多选是数组，直接插值会渲染成 ["工资太低","离家太远"]；
 * 布尔是「是 / 否」；空值留空，不写 "undefined" 也不写 0。
 */
export const valueText = (v) => {
  if (v === null || v === undefined) return ''
  if (Array.isArray(v)) return v.map((x) => valueText(x)).filter(Boolean).join('、')
  if (typeof v === 'boolean') return v ? '是' : '否'
  if (typeof v === 'object') return Object.values(v).map((x) => valueText(x)).filter(Boolean).join('、')
  return String(v)
}

/**
 * 回执字段：数组 = 已经约定好的字段清单（key / 中文名 / 可能取值）；
 * 字符串 = 旧写法，只有一句话，下游引用不到、也判不出达成。
 * 统一从这两个口读，界面与执行不各自猜形状。
 */
export const receiptFieldsOf = (w) => (Array.isArray(w?.receipt) ? w.receipt : [])
export const receiptTextOf = (w) => {
  const list = receiptFieldsOf(w)
  if (list.length) return list.map((r) => r.label).join('、')
  return typeof w?.receipt === 'string' ? w.receipt.trim() : ''
}
/** 回执写回哪个结果字段（没写就取第一个字段，仍取不到就返回空） */
export const receiptBackOf = (w) => w?.writeBack || receiptFieldsOf(w)[0]?.key || ''

export const GATES = [
  { key: 'must', label: '必过', hint: '未通过 → 终止全部流程' },
  { key: 'optional', label: '可选', hint: '未通过 → 按未取得结论放行留痕' }
]

export const TRIGGER_TYPES = [
  { key: 'business', label: '业务事件', short: '单据触发', hint: '某张单据提交后系统接住，自动触发' },
  { key: 'manual', label: '人工发起', short: '人发起', hint: '人在指定入口点了「发起」才触发' },
  { key: 'schedule', label: '定时', short: '定时', hint: '按周期巡检触发，只做提醒型' }
]
export const triggerTypeOf = (k) => TRIGGER_TYPES.find((t) => t.key === k) || null
export const triggerLabel = (t) => triggerTypeOf(t?.type)?.label || '未设触点'

export const SUB_STATES = [
  { key: 'pending', label: '未开始' },
  { key: 'running', label: '可办理' },
  { key: 'checking', label: '检查中' },
  { key: 'done', label: '办结' },
  { key: 'rejected', label: '未通过' },
  { key: 'skipped', label: '已跳过' },
  { key: 'closed', label: '随流程关闭' }
]
export const stateLabel = (k) => (SUB_STATES.find((x) => x.key === k) || {}).label || k

/* ---------------- 组织与角色（mock） ---------------- */

export const jobs = [
  { key: '调理师', headcount: 186 },
  { key: '推拿师', headcount: 244 },
  { key: '前台', headcount: 58 },
  { key: '客户经理', headcount: 37 },
  { key: '店长', headcount: 21 },
  { key: '城市总', headcount: 6 }
]
export const cities = [
  { key: '上海', stores: ['上海静安店', '上海徐汇店', '上海浦东店'], headcount: 268 },
  { key: '杭州', stores: ['杭州西湖店', '杭州滨江店'], headcount: 174 },
  { key: '南京', stores: ['南京新街口店'], headcount: 110 },
  { key: '成都', stores: ['成都春熙路店'], headcount: 96 }
]
export const stores = cities.flatMap((c) => c.stores)
export const employTypes = [
  { key: '全职', headcount: 402 },
  { key: '试用', headcount: 86 },
  { key: '兼职', headcount: 64 },
  { key: '返聘', headcount: 18 }
]

/** 人群的四个维度（确认页与工作台共用一份） */
export const COVERAGE_DIMS = [
  { key: 'jobs', label: '岗位', options: jobs.map((j) => j.key), hint: '决定谁有这件事' },
  { key: 'cities', label: '城市', options: cities.map((c) => c.key), hint: '空 = 不限城市' },
  { key: 'stores', label: '门店', options: stores, hint: '空 = 不限门店' },
  { key: 'employTypes', label: '用工', options: employTypes.map((e) => e.key), hint: '空 = 不限用工类型' }
]

/**
 * 预估人数：编制 × 城市占比 × 用工占比。
 * 人群不是让模型编一个数字，而是按组织编制算出来的；改一个维度数字立刻跟着变。
 */
export function headcountOf (scope = {}) {
  const jobSel = scope.jobs?.length ? jobs.filter((j) => scope.jobs.includes(j.key)) : jobs
  const jobTotal = jobSel.reduce((a, b) => a + b.headcount, 0)
  const allEmp = employTypes.reduce((a, b) => a + b.headcount, 0)
  const empSel = scope.employTypes?.length
    ? employTypes.filter((e) => scope.employTypes.includes(e.key)).reduce((a, b) => a + b.headcount, 0)
    : allEmp
  const allCity = cities.reduce((a, b) => a + b.headcount, 0)
  const citySel = scope.cities?.length
    ? cities.filter((c) => scope.cities.includes(c.key)).reduce((a, b) => a + b.headcount, 0)
    : allCity
  return Math.round(jobTotal * (citySel / allCity) * (empSel / allEmp))
}

export const roles = [
  { key: 'employee', label: '员工本人' },
  { key: 'store-manager', label: '门店店长' },
  { key: 'supervisor', label: '直属上级' },
  { key: 'city-head', label: '城市总' },
  { key: 'finance', label: '财务专员' },
  { key: 'it', label: 'IT 专员' },
  { key: 'hr', label: '人事经理' },
  { key: 'region-head', label: '大区总' },
  { key: 'gm', label: '总经理' }
]
export const roleLabel = (k) => (roles.find((r) => r.key === k) || {}).label || k

/** 角色 → 人（按门店优先、城市其次解析；原型固定人名） */
export const roleOwners = {
  'store-manager': { '上海静安店': '马晓东', '上海徐汇店': '刘丹', '杭州西湖店': '徐立', default: '马晓东' },
  supervisor: { '上海静安店': '朱艳秋', '上海徐汇店': '朱艳秋', '杭州西湖店': '钱伟', default: '朱艳秋' },
  finance: { default: '周芸' },
  it: { default: '邢斌' },
  hr: { '上海': '邓黎英', '杭州': '李文静', '南京': '王慧', default: '邓黎英' },
  'city-head': { '上海': '冯海霞', '杭州': '罗嘉铭', '南京': '罗嘉铭', '成都': '冯海霞', default: '冯海霞' },
  'region-head': { default: '杨春燕' },
  gm: { default: '贺志明' }
}
/**
 * 负责人：这一条结论由谁负责 —— 负责核对并填写结果的人，不是动手的人。
 *
 * 交接这一步里动手的是离职员工本人（业务事实，写在事项的完成口径里），
 * 负责人是店长：他核对、签收、把结果填进来。把「谁动手」写成负责人，
 * 会让整棵树读起来像店长在交工服。
 *
 * 两种写法：
 *   { kind: 'role',   role: 'store-manager' }  该角色的人都能看见、都能办
 *   { kind: 'person', name: '周芸' }           只有这个人能看见、能办
 */
export function normOwner (o) {
  if (!o) return { kind: 'role', role: '', name: '' }
  if (typeof o === 'string') return { kind: 'role', role: o, name: '' }
  if (o.kind === 'person') return { kind: 'person', role: '', name: String(o.name || '').trim() }
  return { kind: 'role', role: String(o.role || '').trim(), name: '' }
}
export const isSameOwner = (a, b) => {
  const x = normOwner(a)
  const y = normOwner(b)
  return x.kind === y.kind && x.role === y.role && x.name === y.name
}
/** 这一条路径的负责人（审核也一样：负责人就是审核人） */
export const ownerOfWay = (w) => normOwner(w?.owner)
export function ownerLabel (o) {
  const x = normOwner(o)
  return x.kind === 'person' ? `指定 · ${x.name || '未填人'}` : roleLabel(x.role)
}
/** 负责人解析到人：角色按门店 / 城市解析；指定的人就是他本人 */
export function resolveOwner (owner, { store, city } = {}) {
  const o = normOwner(owner)
  if (o.kind === 'person') return o.name || ''
  const map = roleOwners[o.role] || {}
  return map[store] || map[city] || map.default || roleLabel(o.role)
}

/**
 * 一个负责人在「这批人」里由谁承担 —— 审核人不是一个人，是覆盖范围内每个城市各一位。
 * 确认页要能把「审核人群」说清楚，就得落到人；只说「人事经理」等于没说。
 */
export function ownersOf (owner, coverage = {}) {
  const o = normOwner(owner)
  if (o.kind === 'person') return o.name ? [o.name] : []
  if (o.role === 'employee') return ['员工本人']
  const map = roleOwners[o.role] || {}
  if (o.role === 'store-manager' || o.role === 'supervisor') {
    const ss = coverage.stores?.length ? coverage.stores : stores
    const out = [...new Set(ss.map((s) => map[s]).filter(Boolean))]
    return out.length ? out : [map.default || roleLabel(o.role)]
  }
  const cs = coverage.cities?.length ? coverage.cities : cities.map((c) => c.key)
  const out = [...new Set(cs.map((c) => map[c]).filter(Boolean))]
  return out.length ? out : [map.default || roleLabel(o.role)]
}

/** 能当「指定的人」的候选：定义期事实里出现过的责任人，不是花名册 */
export const OWNER_NAME_OPTIONS = [
  ...new Set(Object.values(roleOwners).flatMap((m) => Object.values(m)).filter(Boolean))
]

/** 触点的一句话说法（列表页 / 摘要用） */
export function triggerText (trigger = {}, pointLabel = (k) => k) {
  if (trigger.type === 'business') return pointLabel(trigger.eventPoint) || '未选业务事件点'
  if (trigger.type === 'manual') {
    const who = (trigger.who?.roles || []).map(roleLabel).join('、')
    return who ? `${who}发起` : '未限定可发起角色'
  }
  if (trigger.type === 'schedule') return trigger.cron || '未设周期'
  return '未设触点'
}

/* ---------------- 通用工具 ---------------- */

export const clone = (x) => JSON.parse(JSON.stringify(x))

/** deps 归一：字符串 或 字符串数组（或组） */
export function depGroups (deps = []) {
  return deps.map((d) => (Array.isArray(d) ? { any: true, ids: [...d] } : { any: false, ids: [d] }))
}
export function flatDeps (deps = []) {
  return deps.flatMap((d) => (Array.isArray(d) ? d : [d]))
}
/** 或组里任一办结即可满足 */
export function depsText (deps = []) {
  return depGroups(deps)
    .map((g) => (g.any ? `（${g.ids.join(' 或 ')}）` : g.ids[0]))
    .join(' + ')
}

export const subMapOf = (subs = []) => Object.fromEntries(subs.map((s) => [s.id, s]))

export const startsOf = (subs = []) => subs.filter((s) => !(s.deps || []).length)

export function endsOf (subs = []) {
  const used = new Set(flatDeps(subs.flatMap((s) => s.deps || [])))
  return subs.filter((s) => !used.has(s.id))
}

/**
 * 第几层：0 = 没有前置，可直接办；同层 = 可同时办。
 *
 * 两条规则不能混：
 *   组内是「或」（["se.a","se.b"] 里任一个办结即可）→ 取最小层
 *   组间是「且」（每个前置组都必须办结）        → 取最大层
 * 早先这里两层都取了 min，导致「等 4 个」的节点被算成和它的某个前置同层，
 * 排到了更前面 —— 顺序看着像「谁先」，其实算错了。
 */
function levelMap (subs = []) {
  const map = subMapOf(subs)
  const level = {}
  const visit = (id, stack = new Set()) => {
    if (level[id] != null) return level[id]
    if (stack.has(id)) return 0
    stack.add(id)
    const sub = map[id]
    if (!sub) return 0
    const groups = depGroups(sub.deps || [])
    let lv = 0
    if (groups.length) {
      // 每组取「最早能办」的那一条，组与组之间等最晚的那一组
      const perGroup = groups.map((g) => Math.min(...g.ids.map((x) => visit(x, stack) + 1)))
      lv = Math.max(...perGroup)
    }
    stack.delete(id)
    level[id] = lv
    return lv
  }
  subs.forEach((s) => visit(s.id))
  return level
}

/** 拓扑排序：按层升序，同层保持原有顺序 */
export function topoSort (subs = []) {
  const level = levelMap(subs)
  return [...subs].sort((a, b) => (level[a.id] ?? 0) - (level[b.id] ?? 0))
}

/** 层号表：{ [id]: 0-based 层 }，0 → 显示为第 1 层 */
export const layersOf = (subs = []) => levelMap(subs)
/** 事项的证据要求 = 字段里 type=file 的聚合视图 */
export function proofOf (item) {
  const files = (item?.fields || []).filter((f) => f.type === 'file')
  if (!files.length) return { required: false, count: 0, formats: '' }
  return {
    required: files.some((f) => f.required),
    count: files.length,
    formats: [...new Set(files.map((f) => f.formats).filter(Boolean))].join(' / ')
  }
}
export function itemStats (item) {
  const fields = item?.fields || []
  return {
    total: fields.length,
    required: fields.filter((f) => f.required).length,
    judge: 0
  }
}

/** 子事件用到的所有系统项 key */
export const sysKeysOf = (sub) => (sub.ways || []).filter((w) => w.type === 'system').map((w) => w.sysKey)

/* ---------------- 工厂 ---------------- */

export const uid = (p) => `${p}.${Math.random().toString(36).slice(2, 7)}`

export function makeSub (patch = {}) {
  return {
    id: uid('se'),
    goal: '（待填写的结论目标）',
    gate: 'must',
    deps: [],
    ways: [{ type: 'human', owner: { kind: 'role', role: 'hr' }, items: [makeItem()] }],
    ...patch
  }
}
export function makeItem (patch = {}) {
  return {
    id: uid('it'),
    title: '（事项名）',
    require: '',
    fields: [makeField()],
    ...patch
  }
}
export function makeField (patch = {}) {
  return { key: uid('f'), label: '（字段名）', type: 'text', required: false, rule: '', ...patch }
}
export function makeWay (type = 'human') {
  if (type === 'system') return { type, sysKey: '', fetch: { fetchFreq: '1d', maxRuns: 5 } }
  if (type === 'action') return { type, actionKey: '', targets: '', retry: { times: 3, interval: '30m', onExhaust: 'human' } }
  if (type === 'external') return { type, party: '', receipt: '', timeout: '7d' }
  return { type, owner: { kind: 'role', role: 'hr' }, items: [makeItem()] }
}

/** 事件适用范围四维描述 */
export function scopeChips (scope = {}) {
  const out = []
  if (scope.jobs?.length) out.push({ k: '岗位', v: scope.jobs.join('、') })
  if (scope.cities?.length) out.push({ k: '城市', v: scope.cities.join('、') })
  if (scope.stores?.length) out.push({ k: '门店', v: scope.stores.join('、') })
  if (scope.employTypes?.length) out.push({ k: '用工', v: scope.employTypes.join('、') })
  return out
}

/** 事件适用范围是否命中某个人群（四维都要满足；空维度 = 不限） */
export function scopeHit (scope = {}, person = {}) {
  const hit = (list, val) => !list?.length || (val != null && list.includes(val))
  return hit(scope.jobs, person.job) && hit(scope.cities, person.city) && hit(scope.stores, person.store) && hit(scope.employTypes, person.employType)
}

export const fmtDate = (s) => (s || '').slice(0, 16)
