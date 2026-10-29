/**
 * 校验：定义能不能发布，只认这几种错。
 * 一条原则——**拦住结构性谎言**（无起点、无收尾、环、悬空依赖），
 * 其余是提醒（覆盖越界、必过项被跳未留痕、字段没名字）。
 */
import {
  depGroups, flatDeps, endsOf, startsOf, subMapOf, WAY_TYPES,
  roles, normOwner, OWNER_NAME_OPTIONS, receiptFieldsOf, FIELD_TYPES
} from './model.js'

const E = (code, text, target) => ({ level: 'error', code, text, target })
const ROLE_KEYS = new Set(roles.map((r) => r.key))
/** 负责人只有两种写法：角色（取目录 key）或指定的人（取事实里的责任人） */
function ownerIssue (o) {
  const x = normOwner(o)
  if (x.kind === 'person') {
    if (!x.name) return 'error'
    return OWNER_NAME_OPTIONS.includes(x.name) ? '' : 'warning'
  }
  if (!x.role) return 'error'
  return ROLE_KEYS.has(x.role) ? '' : 'warning'
}
const W = (code, text, target) => ({ level: 'warning', code, text, target })

/** 找环，返回环上的 id 序列 */
function findCycle (subs) {
  const map = subMapOf(subs)
  const color = {}
  const stack = []
  let cycle = null
  const dfs = (id) => {
    if (cycle) return
    if (!map[id]) return
    color[id] = 1
    stack.push(id)
    for (const g of depGroups(map[id].deps || [])) {
      for (const dep of g.ids) {
        if (!map[dep]) continue
        if (color[dep] === 1) {
          const i = stack.indexOf(dep)
          cycle = stack.slice(i).concat(dep)
          return
        }
        if (!color[dep]) dfs(dep)
      }
    }
    stack.pop()
    color[id] = 2
  }
  subs.forEach((s) => { if (!color[s.id]) dfs(s.id) })
  return cycle
}

/**
 * @param {Array} tree 子事件树
 * @param {Object} opt { checks, event }
 */
export function validateTree (tree = [], { checks = [], actions = [], event } = {}) {
  const out = []
  if (!tree.length) {
    out.push(E('EMPTY_TREE', '还没有任何子事件，这个事件排布不出来', event?.key))
    return out
  }

  const map = subMapOf(tree)
  const checkKeys = new Set(checks.map((c) => c.key))
  const actionKeys = new Set(actions.map((a) => a.key))

  /* 结构 */
  if (!startsOf(tree).length) out.push(E('NO_START', '没有起点子事件（每个子事件都在等别人）', 'tree'))
  if (!endsOf(tree).length) out.push(E('NO_END', '没有收尾子事件（每个子事件都还有人依赖）', 'tree'))
  const cycle = findCycle(tree)
  if (cycle) out.push(E('CYCLE', `存在循环依赖：${cycle.join(' → ')}`, cycle[0]))

  tree.forEach((s) => {
    const ref = s.id
    if (!s.goal || s.goal.includes('（待填写')) out.push(E('SUB_NO_GOAL', `子事件「${s.id}」还没写结论目标`, ref))
    if (!(s.ways || []).length) out.push(E('SUB_NO_WAY', `「${s.goal}」没有任何达成路径`, ref))

    depGroups(s.deps || []).forEach((g) => {
      g.ids.forEach((d) => {
        if (d === s.id) out.push(E('CYCLE', `「${s.goal}」依赖了自己`, ref))
        else if (!map[d]) out.push(E('DEP_MISSING', `「${s.goal}」的前置 ${d} 不存在`, ref))
      })
    })

    ;(s.ways || []).forEach((w) => {
      if (!WAY_TYPES.some((t) => t.key === w.type)) {
        out.push(E('WAY_UNKNOWN', `「${s.goal}」有一条路径类型 ${w.type} 不在契约里`, ref))
      } else if (w.type === 'human') {
        const issue = ownerIssue(w.owner)
        if (issue === 'error') out.push(E('OWNER_MISSING', `「${s.goal}」没写负责人：这一步谁核对、谁填结果`, ref))
        else if (issue === 'warning') out.push(W('OWNER_UNKNOWN', `「${s.goal}」的负责人不在角色目录 / 责任人清单里`, ref))
        if (!(w.items || []).length) out.push(E('HUMAN_NO_ITEM', `「${s.goal}」的人做路径没有事项`, ref))
        ;(w.items || []).forEach((it) => {
          if (!it.require?.trim()) out.push(E('ITEM_NO_REQUIRE', `事项「${it.title}」没写判定口径`, `${ref}/${it.id}`))
          ;(it.fields || []).forEach((f) => {
            if (!f.label?.trim() || f.label.includes('（字段名')) out.push(E('FIELD_NO_LABEL', `事项「${it.title}」有字段没写名字`, `${ref}/${it.id}/${f.key}`))
            if (!FIELD_TYPES.some((t) => t.key === f.type)) out.push(W('FIELD_TYPE_UNKNOWN', `字段「${f.label}」的类型 ${f.type} 不在契约里`, `${ref}/${it.id}/${f.key}`))
            if (f.type === 'select' && !f.rule?.trim()) out.push(W('SELECT_NO_OPTIONS', `字段「${f.label}」是单选但没写选项`, `${ref}/${it.id}/${f.key}`))
            if (f.type === 'multiselect' && !f.rule?.trim()) out.push(W('MULTI_NO_OPTIONS', `字段「${f.label}」是多选但没写可选值`, `${ref}/${it.id}/${f.key}`))
            if (f.type === 'file') {
              if (!String(f.formats || '').trim()) out.push(E('FILE_NO_FORMAT', `附件「${f.label}」没写允许格式：交上来打不开等于没交`, `${ref}/${it.id}/${f.key}`))
              if (!f.required) out.push(W('FILE_OPTIONAL', `附件「${f.label}」是选填：写清什么情况下必须有，否则等于没有`, `${ref}/${it.id}/${f.key}`))
            }
          })
          if (!(it.fields || []).length) out.push(W('ITEM_NO_FIELD', `事项「${it.title}」没有任何字段，只能勾通过/不通过`, `${ref}/${it.id}`))
        })
        /* 审核不是一种类型，只能按结论名认：写着「已××审核通过」的结论，事项里该有「意见」这一格留痕 */
        if (/(审核通过|审批通过)/.test(s.goal || '')) {
          const hasNote = (w.items || []).some((it) => (it.fields || []).some((f) => /意见/.test(f.label || '')))
          if (!hasNote) out.push(W('REVIEW_NO_OPINION', `「${s.goal}」是审核，却没有「意见」字段：审核人给结论时没地方留话`, ref))
        }
      } else if (w.type === 'system') {
        if (!w.sysKey) out.push(E('SYSTEM_NO_KEY', `「${s.goal}」引用了空系统项`, ref))
        else if (!checkKeys.has(w.sysKey)) out.push(E('SYSTEM_UNKNOWN', `「${s.goal}」引用的系统项 ${w.sysKey} 不在目录里`, ref))
        if (!w.fetch?.fetchFreq) out.push(E('FETCH_NO_FREQ', `「${s.goal}」没配取数频率`, ref))
        if (!(w.fetch?.maxRuns > 0)) out.push(W('FETCH_NO_CAP', `「${s.goal}」没配批次上限，到顶也不会终止`, ref))
      } else if (w.type === 'action') {
        if (!w.actionKey) out.push(E('ACTION_NO_KEY', `「${s.goal}」引用了空动作`, ref))
        else if (actionKeys.size && !actionKeys.has(w.actionKey)) out.push(E('ACTION_UNKNOWN', `「${s.goal}」引用的动作 ${w.actionKey} 不在目录里`, ref))
        if (w.retry && w.retry.onExhaust === 'human' && !w.retry.times) out.push(W('ACTION_NO_RETRY', `「${s.goal}」失败转人工，但没写重试次数`, ref))
      } else if (w.type === 'external') {
        if (!w.party) out.push(E('EXTERNAL_NO_PARTY', `「${s.goal}」的外部回执没写回执方`, ref))
        /* 回执必须是字段清单：只有一句话等于没约定，下游引用不到、也判不出达成。
           必过项没有回执字段 → 错（这一条永远判不出“完成”）；可选 → 提醒 */
        const fields = receiptFieldsOf(w)
        if (!fields.length) {
          const text = `「${s.goal}」的回执没有字段（只有一句话），下游引用不到，也判不出达成`
          out.push(s.gate === 'optional' ? W('EXTERNAL_NO_RECEIPT', text, ref) : E('EXTERNAL_NO_RECEIPT', text, ref))
        } else {
          if (!w.writeBack) out.push(W('EXTERNAL_NO_WRITE_BACK', `「${s.goal}」没说回执写回哪个结果字段（如 signState），下游不知道引哪个`, ref))
          if (!w.via) out.push(W('EXTERNAL_NO_VIA', `「${s.goal}」没说回执由哪个动作招来：查不到这一步在等谁、等的是哪次推送`, ref))
        }
      }
    })
  })

  return out
}

/**
 * 骨架（定义期）校验：发布之前就要拦，不能等触发时才发现。
 *
 * 与生成自检（blueprint.checkGenerated）同一条判据，只是作用在骨架而不是这一单的树上：
 *   · 结论必须可判定（「离职需求审核」这种动作词 → 错）
 *   · 等回执的必过结论必须有回执字段（只有一句话 → 错）
 *   · 审核要有核对字段；人办要有事项；前置不能悬空
 */
export function validateSkeleton (event = {}) {
  const out = []
  const sk = event.skeleton || []
  if (!sk.length) {
    out.push(E('SKELETON_EMPTY', '清单为空：没定义这件事必须办成什么', 'skeleton'))
    return out
  }
  const keys = new Set(sk.map((s) => s.key))
  sk.forEach((s) => {
    const ref = s.key || s.goal
    if (!String(s.goal || '').trim()) out.push(E('SUB_NO_GOAL', '有一条没写要办成什么', ref))
    else if (/(审核|审批|办理|处理)$/.test(s.goal) && !/已|完毕|完成|通过|无/.test(s.goal)) {
      out.push(E('GOAL_IS_ACTION', `「${s.goal}」是动作不是结论 —— 改成带达成状态的写法（如「离职需求已审核通过」）`, ref))
    }
    if (!(s.paths || []).length) out.push(E('SUB_NO_WAY', `「${s.goal}」没有任何达成路径`, ref))
    ;(s.after || []).forEach((k) => {
      if (!keys.has(k)) out.push(W('AFTER_UNKNOWN', `「${s.goal}」等的前置 ${k} 不在清单里 —— 触发时会被跳过`, ref))
    })
    ;(s.paths || []).forEach((w) => {
      if (w.type === 'external') {
        const fields = receiptFieldsOf(w)
        if (!fields.length) {
          const text = `「${s.goal}」的回执没有字段（只有一句话），下游引用不到，也判不出达成`
          out.push(s.gate === 'optional' ? W('EXTERNAL_NO_RECEIPT', text, ref) : E('EXTERNAL_NO_RECEIPT', text, ref))
        } else {
          if (!w.writeBack) out.push(W('EXTERNAL_NO_WRITE_BACK', `「${s.goal}」没说回执写回哪个结果字段（如 signState），下游不知道引哪个`, ref))
          if (!w.via) out.push(W('EXTERNAL_NO_VIA', `「${s.goal}」没说回执由哪个动作招来：查不到这一步在等谁`, ref))
        }
      }
      if (w.type === 'human') {
        const items = w.items || []
        if (items.length > 1) out.push(E('ITEM_MANY', `一个子事件只能挂一个事项，「${s.goal}」挂了 ${items.length} 个 —— 拆成几条结论`, ref))
        if (!items.length) out.push(E('ITEM_NONE', `「${s.goal}」有人的路径却没写事项：办事的人不知道要交什么`, ref))
        items.forEach((it) => {
          ;(it.fields || []).forEach((f) => {
            if (!FIELD_TYPES.some((t) => t.key === f.type)) out.push(W('FIELD_TYPE_UNKNOWN', `字段「${f.label}」的类型 ${f.type} 不在契约里`, `${ref}/${f.key}`))
            if (f.type === 'file' && !String(f.formats || '').trim()) out.push(E('FILE_NO_FORMAT', `附件「${f.label}」没写允许格式：交上来打不开等于没交`, `${ref}/${f.key}`))
          })
        })
        /* 审核按命名认：写成「已××通过」的结论，事项里要有意见字段 */
        if (/(审核通过|审批通过)/.test(s.goal || '') && !items.some((it) => (it.fields || []).some((f) => /意见/.test(f.label || '')))) {
          out.push(W('REVIEW_NO_OPINION', `「${s.goal}」是审核，却没有「意见」字段：审核人给结论时没地方留话`, ref))
        }
      }
      if (w.type === 'system' && !w.fetch?.fetchFreq) out.push(E('FETCH_NO_FREQ', `「${s.goal}」没配取数频率`, ref))
    })
  })
  return out
}

/** 事件级：人群与触点 —— 这两样缺了，事件就不成立（不只是一棵树的问题） */export function validateEvent (event) {
  const out = []
  const s = event.scope || {}
  const empty = !(s.jobs?.length || s.cities?.length || s.stores?.length || s.employTypes?.length)
  if (empty) out.push(E('SCOPE_EMPTY', '人群为空，这个事件对谁都不生效', 'scope'))

  const t = event.trigger || {}
  if (!t.type) out.push(E('NO_TRIGGER', '没有触点，这个事件开不了单', 'trigger'))
  else if (!String(t.entry || '').trim()) out.push(W('TRIGGER_NO_ENTRY', '触点没写入口（在哪个端、哪个位置发起），办的人找不到地方', 'trigger'))
  if (t.type === 'business' && !t.eventPoint) out.push(E('TRIGGER_NO_POINT', '业务事件触发没选事件点，系统不知道接哪张单', 'trigger'))
  if (t.type === 'manual' && !(t.who?.roles || []).length) out.push(E('TRIGGER_NO_WHO', '人工发起没限定可发起角色，等于谁都能触发', 'trigger'))
  if (t.type === 'schedule' && !t.cron) out.push(E('TRIGGER_NO_CRON', '定时触发没写周期，跑不起来', 'trigger'))
  return out
}
