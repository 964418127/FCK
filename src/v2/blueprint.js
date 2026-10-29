/**
 * 生成层：拿「这套提示词 + 这一单的人 + 这一单的事实」长出这一单的树。
 *
 * 在这里「人群」不再是命中的维度 —— 触发时已经知道是谁了。
 * 差异只有一种来源：事实。事实满足 needs 才有这一条，不满足就不长出来。
 *
 * 生成是确定性的（规则生成）：同样的骨架 + 同样的事实 → 同样的树。
 * 这既是离线可用 / 可回归的那条路，也是模型生成不合格时的降级实现。
 */

import { clone } from './model.js'
import { skeletonOf, needOk, unknownNeedsOf } from './skeleton.js'

/** 骨架 → 树 */
export function generateTree ({ prompt, emp = {}, facts = null } = {}) {
  const sk = skeletonOf(prompt)
  const fs = facts || emp.facts || {}
  const kept = []
  const dropped = []
  sk.forEach((item) => {
    if (needOk(item.needs, fs)) kept.push(item)
    else dropped.push({ key: item.key, goal: item.goal, needs: item.needs })
  })
  const keys = new Set(kept.map((i) => i.key))
  const tree = kept.map((item) => toSub(item, keys, emp))
  return { tree, dropped, keptKeys: [...keys], facts: fs }
}

/** 一次生成 + 自检，页面与实例都走这一个口 */
export function composeFor ({ prompt, emp = {}, facts = null } = {}) {
  const factsOf = facts || emp.facts || {}
  const gen = generateTree({ prompt, emp, facts: factsOf })
  const check = checkGenerated({ tree: gen.tree, prompt, facts: factsOf })
  return { ...gen, check }
}

function toSub (item, keys, emp) {
  return {
    id: `se.${item.key}`,
    skeletonKey: item.key,
    goal: item.goal,
    gate: item.gate === 'optional' ? 'optional' : 'must',
    deps: depsOf(item, keys),
    biz: item.note || '',
    ways: (item.paths || []).map((p) => toWay(p, item, emp))
  }
}

/**
 * 依赖：after 是「且」，afterAny 是「或」。
 * 被裁掉的前置自动跳过 —— 不能因为这个人没有资产，就让下游节点悬空。
 */
function depsOf (item, keys) {
  const and = (item.after || []).filter((k) => keys.has(k)).map((k) => `se.${k}`)
  const any = (item.afterAny || []).filter((k) => keys.has(k)).map((k) => `se.${k}`)
  const out = [...and]
  if (any.length === 1) out.push(any[0])
  else if (any.length > 1) out.push(any)
  return out
}

function toWay (p, item, emp) {
  if (p.type === 'human') {
    const note = (item.jobNote || {})[emp.job] || (item.jobNote || {}).default
    const extra = (item.jobFields || {})[emp.job] || []
    const src = p.items || []
    const items = src.map((x, xi) => ({
      id: x.id,
      title: x.title,
      require: xi === 0 && note ? note : x.require,
      fields: clone([...(x.fields || []), ...(xi === src.length - 1 ? extra : [])])
    }))
    return {
      type: 'human',
      owner: clone(p.owner || { kind: 'role', role: p.role || 'hr' }),
      items
    }
  }
  if (p.type === 'system') {
    return { type: 'system', sysKey: p.sysKey, fetch: clone(p.fetch || { fetchFreq: '1d', maxRuns: 5 }) }
  }
  if (p.type === 'action') {
    return { type: 'action', actionKey: p.actionKey, targets: p.targets || '', ...(p.retry ? { retry: clone(p.retry) } : {}) }
  }
  return {
    type: 'external',
    party: p.party || '',
    receipt: clone(p.receipt || []),
    ...(p.via ? { via: p.via } : {}),
    ...(p.writeBack ? { writeBack: p.writeBack } : {}),
    ...(p.timeout ? { timeout: p.timeout } : {})
  }
}

/**
 * 生成自检：骨架是下限。
 * 缺一条必办 → 错误（重试；仍不行就降级）；多出一条不适用 → 提醒（允许补差异步骤）。
 */
export function checkGenerated ({ tree = [], prompt, facts = {} } = {}) {
  const sk = skeletonOf(prompt)
  const got = new Map(tree.filter((s) => s.skeletonKey).map((s) => [s.skeletonKey, s]))
  const errors = []
  const warnings = []

  // 用了本事件没声明的事实 → 触发生成时永远取不到，那一条会静默消失。定义期必须拦住
  unknownNeedsOf(sk, prompt).forEach((k) => {
    errors.push({
      code: 'NEEDS_UNKNOWN',
      key: k,
      text: `骨架用了本事件没有声明的事实「${k}」——要么挪进基础表，要么写进这套提示词的 facts`
    })
  })

  sk.forEach((item) => {
    const should = needOk(item.needs, facts)
    if (should && !got.get(item.key)) {
      errors.push({ code: 'SKELETON_MISSING', key: item.key, text: `必备结论缺项：${item.goal}` })
    }
    if (!should && got.get(item.key)) {
      warnings.push({ code: 'SKELETON_EXTRA', key: item.key, text: `这一条不适用却生成了：${item.goal}` })
    }
  })
  tree.forEach((s) => {
    if (!s.skeletonKey) warnings.push({ code: 'SKELETON_UNKNOWN', key: s.id, text: `生成出一条骨架之外的结论：${s.goal}` })

    /* 「审核 / 审批 / 处理」是动作，不是可判定的结论：留着它，永远说不清这一环算不算过 */
    if (/(审核|审批|办理|处理)$/.test(s.goal || '') && !/已|完毕|完成|通过|无/.test(s.goal || '')) {
      errors.push({ code: 'GOAL_IS_ACTION', key: s.id, text: `「${s.goal}」是动作不是结论 —— 改成带达成状态的写法（如「离职需求已审核通过」）` })
    }

    /* 结构约束与提示词模板同源：模板写了「一个子事件 = 一条结论 = 一个事项」，这里就按它查。
       多挂一个事项，等于把两件事塞进一条结论 —— 只要其中一件没办，整条结论卡住，判不清到底办完没有。 */
    ;(s.ways || []).forEach((w) => {
      if (!['human', 'system', 'action', 'external'].includes(w.type)) {
        /* 审核也是人给结论：多立一个类型，同一步就会出现两种说法（form 还是 items？几级算审完？） */
        errors.push({ code: 'WAY_TYPE_UNKNOWN', key: s.id, text: `「${s.goal}」用了契约里没有的路径类型 ${w.type} —— 审核写成「已××通过」+ 人给结论即可` })
        return
      }
      if (w.type === 'external') {
        /* 等回执的结论：没有回执字段就没法判定达成 —— 这是必过项时直接是错，不是提醒 */
        const fields = Array.isArray(w.receipt) ? w.receipt : []
        if (!fields.length) {
          const text = `「${s.goal}」等对方回话，但回执没有字段（只有一句话）：下游引用不到，也判不出达成`
          if (s.gate !== 'optional') errors.push({ code: 'RECEIPT_NO_FIELD', key: s.id, text })
          else warnings.push({ code: 'RECEIPT_NO_FIELD', key: s.id, text })
        } else if (!w.writeBack) {
          warnings.push({ code: 'RECEIPT_NO_WRITE_BACK', key: s.id, text: `「${s.goal}」的回执写了字段，但没说写回哪个结果字段：下游不知道引哪个` })
        }
        return
      }
      if (w.type !== 'human') return
      const items = w.items || []
      if (items.length > 1) {
        errors.push({ code: 'ITEM_MANY', key: s.id, text: `一个子事件只能挂一个事项，「${s.goal}」挂了 ${items.length} 个 —— 拆成几条结论` })
      }
      if (!items.length) {
        errors.push({ code: 'ITEM_NONE', key: s.id, text: `「${s.goal}」有人的路径却没写事项：办事的人不知道要交什么` })
      }
      items.forEach((it) => {
        if (!(it.fields || []).length) {
          warnings.push({ code: 'ITEM_NO_FIELD', key: s.id, text: `事项「${it.title || s.goal}」没有字段：办完时没有可核对的东西` })
        }
      })
    })
  })

  return { ok: errors.length === 0, errors, warnings }
}

/** 降级生成：只留必办且人人都有那几条，保证单子能往前走 */
export function degradedTree ({ prompt, emp = {}, facts = null } = {}) {
  const fs = facts || emp.facts || {}
  const sk = skeletonOf(prompt).filter((i) => i.gate !== 'optional' && needOk(i.needs, fs))
  return generateTree({ prompt: { ...prompt, skeleton: sk }, emp, facts: fs })
}

/** 一句话描述这次生成（列表 / 详情 / 预览共用） */
export function genSummary (gen) {
  if (!gen) return ''
  const kept = gen.kept ?? gen.tree?.length ?? 0
  const dropped = gen.dropped?.length || 0
  return `该办 ${kept} 条${dropped ? ` · 这单不需要 ${dropped} 条` : ''}`
}
