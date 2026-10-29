/**
 * 树解析 + 树 diff（发布与实例快照共用一套差异口径）
 *
 * 解析只做一件事：取某版本的快照。差异不再靠叠加覆盖 —— 一群人与另一群人的不同，
 * 落在「谁办这一步」与「这一步存不存在」上，编排时就已定好，不在基线上打补丁。
 * 解析结果一律是**新对象**，调用方拿到后即快照（实例只认快照，不认引用）。
 */
import { clone, depGroups, subMapOf } from './model.js'

/** 删掉指向不存在节点的依赖（跳子事件后必然出现），空或组一并清掉 */
export function pruneDeps (subs) {
  const ids = new Set(subs.map((s) => s.id))
  subs.forEach((s) => {
    if (!s.deps?.length) return
    const next = []
    depGroups(s.deps).forEach((g) => {
      const kept = g.ids.filter((id) => ids.has(id))
      if (!kept.length) return
      next.push(kept.length > 1 ? kept : kept[0])
    })
    s.deps = next
  })
  return subs
}

/** 某版本的树（已发布版本取快照，草稿取 draft） */
export function treeOfVersion (event, v) {
  if (v == null) return clone(event.draft?.tree || [])
  const ver = (event.versions || []).find((x) => x.v === v)
  return clone(ver?.tree || [])
}

/* ---------------- 树 diff（粒度到字段） ---------------- */

const D = (kind, scope, target, title, detail) => ({ kind, scope, target, title, detail })

function diffItems (oldSub, newSub, out, subTitle) {
  const oldItems = Object.fromEntries(((oldSub.ways || []).find((w) => w.type === 'human')?.items || []).map((i) => [i.id, i]))
  const newItems = Object.fromEntries(((newSub.ways || []).find((w) => w.type === 'human')?.items || []).map((i) => [i.id, i]))
  Object.keys(oldItems).forEach((id) => {
    if (!newItems[id]) out.push(D('del', 'item', id, subTitle, `删除事项「${oldItems[id].title}」`))
  })
  Object.entries(newItems).forEach(([id, item]) => {
    const old = oldItems[id]
    if (!old) {
      out.push(D('add', 'item', id, subTitle, `新增事项「${item.title}」（${(item.fields || []).length} 个字段）`))
      return
    }
    if (old.title !== item.title) out.push(D('mod', 'item', id, subTitle, `事项名：${old.title} → ${item.title}`))
    if (old.require !== item.require) out.push(D('mod', 'item', id, subTitle, '判定口径调整'))
    const oldF = Object.fromEntries((old.fields || []).map((f) => [f.key, f]))
    const newF = Object.fromEntries((item.fields || []).map((f) => [f.key, f]))
    Object.keys(oldF).forEach((k) => {
      if (!newF[k]) out.push(D('del', 'field', `${id}/${k}`, subTitle, `删除字段「${oldF[k].label}」`))
    })
    Object.entries(newF).forEach(([k, f]) => {
      const o = oldF[k]
      if (!o) {
        out.push(D('add', 'field', `${id}/${k}`, subTitle, `新增字段「${f.label}」（${f.type}${f.required ? '，必填' : ''}）`))
        return
      }
      if (o.label !== f.label) out.push(D('mod', 'field', `${id}/${k}`, subTitle, `字段名：${o.label} → ${f.label}`))
      if (o.type !== f.type) out.push(D('mod', 'field', `${id}/${k}`, subTitle, `类型：${o.type} → ${f.type}`))
      if (!!o.required !== !!f.required) out.push(D('mod', 'field', `${id}/${k}`, subTitle, `「${f.label}」${f.required ? '改为必填' : '改为非必填'}`))
      if ((o.rule || '') !== (f.rule || '')) out.push(D('mod', 'field', `${id}/${k}`, subTitle, `「${f.label}」校验规则调整`))
    })
  })
}

function diffWays (oldSub, newSub, out) {
  const sig = (s) =>
    (s.ways || [])
      .map((w) =>
        w.type === 'system'
          ? `system:${w.sysKey}:${w.fetch?.fetchFreq}:${w.fetch?.maxRuns}`
          : w.type === 'action'
            ? `action:${w.actionKey}:${w.targets || ''}`
            : w.type === 'human'
              ? `human:${w.owner?.kind || 'role'}:${w.owner?.role || w.owner?.name || w.role || ''}:${(w.items || []).length}`
              : `external:${w.party}`
      )
      .join('|')
  if (sig(oldSub) !== sig(newSub)) out.push(D('mod', 'sub', oldSub.id, oldSub.goal, '达成路径（ways）调整'))
}

export function diffTrees (base = [], next = []) {
  const out = []
  const bm = subMapOf(base)
  const nm = subMapOf(next)

  base.forEach((s) => {
    if (!nm[s.id]) out.push(D('del', 'sub', s.id, s.goal, `删除子事件「${s.goal}」`))
  })

  next.forEach((s) => {
    const old = bm[s.id]
    if (!old) {
      out.push(D('add', 'sub', s.id, s.goal, '新增子事件'))
      return
    }
    if (old.goal !== s.goal) out.push(D('mod', 'sub', s.id, s.goal, `结论目标：${old.goal} → ${s.goal}`))
    if (old.gate !== s.gate) out.push(D('mod', 'sub', s.id, s.goal, `门禁：${old.gate === 'must' ? '必过' : '可选'} → ${s.gate === 'must' ? '必过' : '可选'}`))
    if (JSON.stringify(old.deps || []) !== JSON.stringify(s.deps || [])) {
      out.push(D('mod', 'sub', s.id, s.goal, '前置依赖调整'))
    }
    diffWays(old, s, out)
    diffItems(old, s, out, s.goal)
  })

  const order = { add: 0, del: 1, mod: 2 }
  return out.sort((a, b) => order[a.kind] - order[b.kind])
}
