/**
 * 评审稿的运行时状态（单例 + localStorage 持久化）
 *
 * 范式：定义期只有「一套提示词 + 一份骨架」，不再保存预生成好的树。
 * 树只在实例期存在 —— 触发时按这一单的人与事实生成，之后跟着这张单走。
 */
import { reactive, watch } from 'vue'
import { clone, makeItem, makeField, makeWay, makeSub } from './model.js'
import { seedEvents, seedInstances, systemChecks, actions } from './seed.js'
import { cleanScope } from './shape.js'
import { composeFor, degradedTree } from './blueprint.js'
import { runIntake } from './intake.js'
import { checkPayload, empNoOfPayload, keepKnownPayload, prefillTree } from './payload.js'
import { TERMINAL, openSubs, needsHuman, primaryType } from './instance.js'
import { autoSettle, runCheck, runAction, runReceipt } from './sysRun.js'
import { snapshotOfSkeleton } from './template.js'

/** v9：事件多带一条「首次生成」快照（哪几条是提示词给的、哪条被人改过）→ 旧数据重播 */
const KEY = 'fck:v2:review:v12'

const fresh = () => ({
  events: clone(seedEvents),
  instances: clone(seedInstances)
})

function load () {
  if (typeof window === 'undefined') return fresh()
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return fresh()
    const parsed = JSON.parse(raw)
    if (!parsed?.events?.length) return fresh()
    return parsed
  } catch (e) {
    return fresh()
  }
}

export const v2state = reactive(load())

/**
 * 当前登录身份（实例期）：决定「轮到我」里出现哪些环节。
 * 定义期不查人，但办的时候必须知道是谁 —— 角色写的环节同角色的人都能看见能办，
 * 指定人的环节只有他本人能看见能办。
 */
if (!v2state.me) v2state.me = null
/** 身份要立刻落盘：整页刷新（直接开链接）后不能退回默认人，否则「发起人」和「轮到我」都错 */
export const setMe = (person) => {
  v2state.me = person ? clone(person) : null
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(v2state))
  } catch (e) { /* 存储满：忽略 */ }
}

if (typeof window !== 'undefined') {
  watch(
    () => v2state,
    (val) => {
      try {
        window.localStorage.setItem(KEY, JSON.stringify(val))
      } catch (e) { /* 存储满：忽略，不阻断操作 */ }
    },
    { deep: true }
  )
}

export const checks = systemChecks
export const actionList = actions

export const getEvent = (key) => v2state.events.find((e) => e.key === key) || null
export const getInstance = (id) => v2state.instances.find((i) => i.id === id) || null

/* ---------------- 提示词（原「根事件」） ----------------
 * 定义期只维护两样：适用条件 / 触点（这件事怎么触发）+ 提示词与骨架（这单怎么办）。
 * 树不在这里 —— 它属于每一张单。
 * 一个事件只有一个编辑面：savePrompt。不要再开第二个「改一改就写回」的入口，
 * 否则同一份 scope 会有两条写入路径、一条记版本一条不记，走查时对不上账。
 */

export function toggleEventStatus (key) {
  const ev = getEvent(key)
  if (!ev) return
  ev.status = ev.status === 'disabled' ? 'active' : 'disabled'
  ev.updatedAt = nowText()
}

export function removeEvent (key) {
  const i = v2state.events.findIndex((e) => e.key === key)
  if (i >= 0) v2state.events.splice(i, 1)
}

/** 键序稳定的序列化：只用来判断「这次保存有没有动配置本身」 */
function stableOf (x) {
  if (Array.isArray(x)) return `[${x.map(stableOf).join(',')}]`
  if (x && typeof x === 'object') {
    return `{${Object.keys(x).sort().map((k) => `${JSON.stringify(k)}:${stableOf(x[k])}`).join(',')}}`
  }
  return JSON.stringify(x === undefined ? null : x)
}

/**
 * 保存提示词：正文 / 骨架 / 适用条件 / 触点 / 名称一次存下。
 * 名称只是标识，改了不升版本；配置真变了才记一版 —— 版本历史要能对上「哪一版长什么样」。
 * 生效范围只对之后开的单 —— 在途单的树是生成时那一份，不回改（这是「每单一棵树」的必然）。
 */
export function savePrompt (key, { name, body, skeleton, scope, trigger, facts, note = '' } = {}) {
  const ev = getEvent(key)
  if (!ev) return null
  const before = stableOf([ev.body, ev.skeleton, ev.facts, ev.scope, ev.trigger])
  if (typeof name === 'string' && name.trim()) ev.name = name.trim()
  if (typeof body === 'string') ev.body = body
  if (Array.isArray(skeleton)) ev.skeleton = clone(skeleton)
  if (Array.isArray(facts)) ev.facts = clone(facts)
  if (scope) ev.scope = cleanScope(scope)
  if (trigger) ev.trigger = clone(trigger)
  /* 第一次保存时记下「首次生成」的样子：之后再改，界面才能分出哪几条是人加的、哪条改了口径 */
  if (!ev.firstGen) {
    ev.firstGen = {
      at: ev.updatedAt || nowText(),
      by: '起草 Agent',
      version: ev.currentVersion || 1,
      items: snapshotOfSkeleton(ev.skeleton || [])
    }
  }
  const after = stableOf([ev.body, ev.skeleton, ev.facts, ev.scope, ev.trigger])
  ev.updatedAt = nowText()
  ev.updatedBy = 'Lacus7'
  if (before === after) return { v: ev.currentVersion || 1, changed: false }
  const v = (ev.currentVersion || 0) + 1
  ev.currentVersion = v
  ev.versions = ev.versions || []
  ev.versions.push({
    v,
    savedAt: nowText(),
    savedBy: 'Lacus7',
    note: note || '调整提示词与骨架',
    keys: (ev.skeleton || []).map((s) => s.key)
  })
  return { v, changed: true }
}

/** 新增一套提示词（对话起草的落点）：不预生成树，只落 prompt + skeleton */
export function adoptPrompt ({ name, summary = '', trigger = null, coverage = null, skeleton = [], facts = [], body = '' }) {
  const key = `ev-${Date.now().toString(36)}`
  const trig = clone(trigger || { type: 'business', entry: '', eventPoint: '', payload: [] })
  const scope = cleanScope(coverage || {})
  const sk = clone(skeleton || [])
  const ev = {
    key,
    name,
    desc: summary,
    scope,
    trigger: trig,
    skeleton: sk,
    facts: clone(facts || []),
    body,
    status: 'active',
    currentVersion: 1,
    versions: [{ v: 1, savedAt: nowText(), savedBy: 'Lacus7', note: '由对话起草', keys: sk.map((s) => s.key) }],
    origin: 'generated',
    updatedAt: nowText(),
    updatedBy: 'Lacus7'
  }
  v2state.events.unshift(ev)
  return ev
}

/* ---------------- 实例侧：触发即生成 ----------------
 * 三个动作：触发（生成这一单的树）、办一步、推进位次。
 * 生成是同步的规则生成 —— 同一份骨架 + 同一份事实，永远长出同一棵树，
 * 这样可回归、可解释；模型生成是可选路径，不合格时降级到这里。
 */

export function createInstance ({ eventKey, emp, payload = {} }) {
  const ev = getEvent(eventKey)
  if (!ev) return null

  /* ① 载荷先校验：缺必传、取值不对、出现登记表没有的键，都不许触发。
   *    这一层在任何取数之前 —— 单据本身不完整，后面做什么都没意义。 */
  const pv = checkPayload(ev.trigger, payload)
  if (!pv.ok) return { refused: true, why: pv.why, payloadCheck: pv }

  /* ② 引擎内置的触发前置：按工号把这个人是查清楚，再拿这个人去生成树
   *    它不是链路上的一步，所以没有开关、没有承担者、也不接受调整 */
  const empNo = empNoOfPayload(ev.trigger, payload) || emp?.empNo || emp?.id || ''
  const intake = runIntake({ emp: { ...emp, empNo } })
  if (!intake.ok) return { refused: true, why: intake.reason, intake }

  const data = keepKnownPayload(ev.trigger, payload)
  const fullEmp = { ...clone(intake.emp), payload: clone(data) }
  const r = composeFor({ prompt: ev, emp: fullEmp })
  /* ③ 载荷预填：事项字段写了 from: 'payload.xxx' 的，把这一单的值放进去让人确认 */
  prefillTree(r.tree, data)
  const subs = {}
  r.tree.forEach((s) => { subs[s.id] = { state: 'pending', records: {} } })
  const inst = {
    id: `rs${Date.now().toString(36)}`,
    code: nextCode(),
    eventKey,
    version: ev.currentVersion,
    emp: fullEmp,
    payload: clone(data),
    intake,
    tree: r.tree,
    gen: {
      at: nowText(),
      by: '规则生成',
      promptVersion: ev.currentVersion,
      mode: 'rule',
      ok: r.check.ok,
      degraded: false,
      attempts: 1,
      kept: r.tree.length,
      dropped: r.dropped,
      factsFrom: 'intake'
    },
    state: 'running',
    startedAt: nowText(),
    subs
  }
  advanceInstance(inst, r.tree)
  v2state.instances.unshift(inst)
  return inst
}

/**
 * 重生成：只在「还没人办过」时允许 —— 已经办出的记录不能被一棵新树抹掉。
 * 真实系统里这是「生成失败降级重跑 / 提示词修正后回填」，原型里给人手动触发看效果。
 */
export function regenerateInstance (id) {
  const inst = getInstance(id)
  if (!inst) return null
  const ev = getEvent(inst.eventKey)
  if (!ev) return null
  const touched = Object.values(inst.subs || {}).some((s) => s.by || s.verdict || (s.records && Object.keys(s.records).length))
  if (touched) return { refused: true }
  const r = composeFor({ prompt: ev, emp: inst.emp })
  inst.tree = r.tree
  inst.subs = {}
  r.tree.forEach((s) => { inst.subs[s.id] = { state: 'pending', records: {} } })
  inst.gen = {
    at: nowText(),
    by: '规则生成',
    promptVersion: ev.currentVersion,
    mode: 'rule',
    ok: r.check.ok,
    degraded: false,
    attempts: 1,
    kept: r.tree.length,
    dropped: r.dropped
  }
  inst.state = 'running'
  advanceInstance(inst, inst.tree)
  return { inst }
}

/** 生成不合格时的降级：只留必办项，把标记挂在这张单上 */
export function degradeInstance (id, prompt) {
  const inst = getInstance(id)
  if (!inst) return null
  const r = degradedTree({ prompt, emp: inst.emp })
  inst.tree = r.tree
  inst.subs = {}
  r.tree.forEach((s) => { inst.subs[s.id] = { state: 'pending', records: {} } })
  inst.gen = { ...(inst.gen || {}), degraded: true, ok: false, kept: r.tree.length, at: nowText() }
  advanceInstance(inst, inst.tree)
  return inst
}

/** 这一单的树：就是触发时生成的那一份，不随定义变 */
export function resolveForInstance (inst) {
  return { tree: inst?.tree || [] }
}

/** 「某个人会跑到什么树」—— 定义期的预览与回归都走这里（真跑一遍生成，不是查表） */
export function resolveForEvent (event, person = {}, opts = {}) {
  const r = composeFor({ prompt: event, emp: person })
  return { tree: opts.tree || r.tree, dropped: r.dropped, check: r.check }
}

/**
 * 办一步：写回记录 → 推进位次。
 * records 由页面按「事项」组装（{ itemId: { verdict, values, files, note } }）；
 * 不给就按第一条事项记一笔。
 */
export function submitInstanceSub (instId, subId, { verdict = '通过', records = null, by = '', note = '' } = {}) {
  const inst = getInstance(instId)
  if (!inst) return null
  const tree = resolveForInstance(inst).tree
  const sub = tree.find((s) => s.id === subId)
  if (!sub) return null
  const st = inst.subs[subId] || (inst.subs[subId] = { state: 'running', records: {} })
  const firstItem = (sub.ways || []).find((w) => w.type === 'human')?.items?.[0]
  const fallbackKey = firstItem?.id || `${subId}.item`
  st.state = verdict === '通过' ? 'done' : 'rejected'
  st.verdict = verdict
  st.by = by || '当前用户'
  st.at = nowText()
  st.records = records || { [fallbackKey]: { verdict, values: {}, files: 0, note } }
  if (note) st.note = note
  advanceInstance(inst, tree)
  return inst
}

/**
 * 系统项的推进动作（原型里由人代点一下，真实系统由跑批自己做）：
 *   判定 —— 再取一批结论；未通过则继续等（批次上限内），用完转未通过
 *   执行 —— 重发一次执行拿回执
 *   外部 —— 代对方把回执送回来
 */
export function runSystemSub (instId, subId) {
  const inst = getInstance(instId)
  if (!inst) return null
  const tree = resolveForInstance(inst).tree
  const sub = tree.find((s) => s.id === subId)
  if (!sub) return null
  const st = inst.subs[subId] || (inst.subs[subId] = { state: 'running', records: {} })
  if (TERMINAL.includes(st.state)) return { refused: true, why: '这一环已经办结，不需要再跑' }

  const kind = primaryType(sub)
  const res = kind === 'system' ? runCheck(inst, sub, st)
    : kind === 'action' ? runAction(inst, sub, st)
      : kind === 'external' ? runReceipt(inst, sub, st)
        : { ok: false, why: '这一环要人办' }
  advanceInstance(inst, tree)
  return { ...res, inst, state: st.state }
}

/** 位次推进：前置满足的节点进入可办；必过未通过 → 终止全部流程
 *
 * 每推进一轮，系统侧自己往下跑一段（判定取首批、执行拿回执）；
 * 外部回执不代劳 —— 对方不动就是没有，只能等。这是「无人工也能往前走」的那一段。
 */
function openStates (inst, tree) {
  const subs = inst.subs || (inst.subs = {})
  openSubs(inst, tree).forEach((s) => {
    if (!subs[s.id]) subs[s.id] = { state: 'pending', records: {} }
    if (subs[s.id].state !== 'pending') return
    // 只由机器走的节点：系统判定进「核验中」，执行 / 回执进「等回执」
    subs[s.id].state = needsHuman(s) ? 'running' : (primaryType(s) === 'system' ? 'checking' : 'running')
  })
}

export function advanceInstance (inst, tree) {
  // 人办完一步 → 开下游 → 系统侧接着跑 → 又开下游 …… 直到没有机器能推进的
  let guard = 0
  let moved = true
  while (moved && guard++ < 12) {
    openStates(inst, tree)
    moved = autoSettle(inst, tree)
  }

  const subs = inst.subs || (inst.subs = {})
  const mustFail = tree.some((s) => s.gate === 'must' && subs[s.id]?.state === 'rejected')
  if (mustFail) {
    inst.state = 'terminated'
    tree.forEach((s) => {
      const st = subs[s.id]
      if (st && !TERMINAL.includes(st.state)) st.state = 'closed'
    })
    inst.finishedAt = nowText()
    return
  }

  const all = tree.length > 0 && tree.every((s) => TERMINAL.includes(subs[s.id]?.state))
  inst.state = all ? 'done' : 'running'
  if (all) inst.finishedAt = nowText()
}

/* ---------------- 中期调整：这一单的树可以改，已办结的锁住 ----------------
 * 树是这一单的，所以改它不动别人、也不动定义。
 * 但已经办出的环节是事实（有记录、有附件、有结论），不能删、不能改结构；
 * 未办结的可以加、可以改、可以调前置，层级按新树重算（位次本来就不落库）。
 * 每次调整留一笔痕：只做记录与提示，不拦截流程。
 */

/** 这一环节是不是已经办结（事实已成，结构锁住） */
export const subLocked = (inst, subId) => TERMINAL.includes(inst?.subs?.[subId]?.state)

function logAdjust (inst, text, by = 'Lacus7') {
  inst.adjusts = inst.adjusts || []
  inst.adjusts.unshift({ at: nowText(), by, text })
  return inst.adjusts[0]
}

/** 摘掉指向已删节点的依赖，不留悬空 */
function dropDep (deps = [], gone) {
  return deps
    .map((d) => (Array.isArray(d) ? d.filter((x) => x !== gone) : d))
    .filter((d) => (Array.isArray(d) ? d.length > 0 : d !== gone))
    .map((d) => (Array.isArray(d) && d.length === 1 ? d[0] : d))
}

/** 加一条：只影响这一单，不回写提示词。默认没有前置，加完即可办 */
export function addInstanceSub (instId, { goal = '', gate = 'must', deps = [], ways = null } = {}) {
  const inst = getInstance(instId)
  if (!inst) return null
  const sub = makeSub({
    id: `se.adj-${Date.now().toString(36)}`,
    goal: String(goal || '').trim() || '（待补结论）',
    gate: gate === 'optional' ? 'optional' : 'must',
    deps: clone(deps || []),
    biz: '中期调整加上的一条',
    addedAt: nowText(),
    ...(ways ? { ways: clone(ways) } : {})
  })
  inst.tree = [...(inst.tree || []), sub]
  inst.subs[sub.id] = { state: 'pending', records: {} }
  advanceInstance(inst, inst.tree)
  logAdjust(inst, `加一条「${sub.goal}」`)
  return sub
}

/** 删一条：已办结的不许删（它是事实），其余删掉时把指向它的前置一起摘掉 */
export function removeInstanceSub (instId, subId) {
  const inst = getInstance(instId)
  if (!inst) return null
  const sub = (inst.tree || []).find((s) => s.id === subId)
  if (!sub) return null
  if (subLocked(inst, subId)) return { refused: true, why: '这一环已经办结，是事实，不能删' }
  inst.tree = inst.tree.filter((s) => s.id !== subId)
  inst.tree.forEach((s) => { s.deps = dropDep(s.deps || [], subId) })
  delete inst.subs[subId]
  advanceInstance(inst, inst.tree)
  logAdjust(inst, `删掉「${sub.goal}」`)
  return inst
}

/**
 * 改一条：patch 里给整份节点（goal / gate / deps / biz / ways）。
 * 已办结的只允许改说明 —— 结论、门禁、前置、事项与字段都锁住。
 */
export function updateInstanceSub (instId, subId, patch = {}) {
  const inst = getInstance(instId)
  if (!inst) return null
  const sub = (inst.tree || []).find((s) => s.id === subId)
  if (!sub) return null
  const locked = subLocked(inst, subId)
  const structural = ['goal', 'gate', 'deps', 'ways'].some((k) => k in patch)
  if (locked && structural) return { refused: true, why: '这一环已经办结，只能改说明' }
  const before = sub.goal
  if ('goal' in patch && String(patch.goal).trim()) sub.goal = String(patch.goal).trim()
  if ('gate' in patch) sub.gate = patch.gate === 'optional' ? 'optional' : 'must'
  if ('deps' in patch) sub.deps = dropDep(clone(patch.deps || []), subId)
  if ('biz' in patch) sub.biz = patch.biz || ''
  if ('ways' in patch && Array.isArray(patch.ways)) sub.ways = clone(patch.ways)
  advanceInstance(inst, inst.tree)
  const renamed = before !== sub.goal ? `（原为「${before}」）` : ''
  logAdjust(inst, locked ? `改了「${sub.goal}」的说明` : `改了「${sub.goal}」${renamed}`)
  return sub
}

/** 路径 / 事项 / 字段这类改动直接作用在节点上，改完喊一声记痕 */
export function noteAdjust (instId, text, by = 'Lacus7') {
  const inst = getInstance(instId)
  if (!inst) return null
  return logAdjust(inst, text, by)
}

/* ---------------- 树内微调（只作用于某一单，不回写提示词） ---------------- */

export const addWay = (sub, type) => {
  if ((sub.ways || []).some((w) => w.type === type)) return
  sub.ways = sub.ways || []
  sub.ways.push(makeWay(type))
}
export const removeWay = (sub, type) => {
  sub.ways = (sub.ways || []).filter((w) => w.type !== type)
}
export const setWayType = (sub, fromType, toType) => {
  const i = (sub.ways || []).findIndex((w) => w.type === fromType)
  if (i < 0) return
  sub.ways.splice(i, 1, makeWay(toType))
}
export const addItem = (sub) => {
  const human = (sub.ways || []).find((w) => w.type === 'human')
  if (!human) return null
  human.items = human.items || []
  const it = makeItem({ fields: [] })
  human.items.push(it)
  return it
}
export const removeItem = (sub, itemId) => {
  const human = (sub.ways || []).find((w) => w.type === 'human')
  if (human) human.items = (human.items || []).filter((i) => i.id !== itemId)
}
export const addField = (item) => {
  item.fields = item.fields || []
  const f = makeField({ label: '' })
  item.fields.push(f)
  return f
}
export const removeField = (item, key) => {
  item.fields = (item.fields || []).filter((f) => f.key !== key)
}

/* ---------------- 演示数据 ---------------- */

export function resetDemo () {
  const f = fresh()
  v2state.events = f.events
  v2state.instances = f.instances
}

function nextCode () {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  const day = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`
  const seq = String(v2state.instances.filter((i) => (i.startedAt || '').slice(0, 10) === nowText().slice(0, 10)).length + 1).padStart(3, '0')
  return `LZ-${day}-${seq}`
}

export function nowText () {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}
