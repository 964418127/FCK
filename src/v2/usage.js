/**
 * 系统项被谁引用：目录页与工作台共用一份口径。
 *
 * 判定项与执行项在树里分别挂在 way.type = system / action 上，
 * 只有一条引用就够判定归属，所以按 way 类型分桶、按 key 归并事件名。
 * 统计口径含草稿：编排 Agent 刚生成、还没发布的那棵树也算「会用到」。
 */
import { v2state } from './store.js'

const bucketOf = (w) => (w.type === 'system' ? 'check' : w.type === 'action' ? 'action' : null)
const keyOf = (w) => (w.type === 'system' ? w.sysKey : w.actionKey)

/** { check: { [key]: string[] }, action: { [key]: string[] } } */
export function sysUsageMap () {
  const map = { check: {}, action: {} }
  v2state.events.forEach((ev) => {
    const trees = [...(ev.versions || []).map((v) => v.tree), ev.draft?.tree || []]
    trees.forEach((tree) => {
      ;(tree || []).forEach((s) => {
        ;(s.ways || []).forEach((w) => {
          const bucket = bucketOf(w)
          const key = keyOf(w)
          if (!bucket || !key) return
          map[bucket][key] = map[bucket][key] || new Set()
          map[bucket][key].add(ev.name)
        })
      })
    })
  })
  Object.keys(map).forEach((b) => {
    Object.keys(map[b]).forEach((k) => { map[b][k] = [...map[b][k]] })
  })
  return map
}

export const sysUsageOf = (kind, key) => sysUsageMap()[kind === 'action' ? 'action' : 'check'][key] || []
