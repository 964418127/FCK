// 排班策略中心的运行期数据源：列表页与策略配置页共用同一份对象。
// 种子与选项目录在 mock/scheduleStrategies.js（纯数据，node 测试可 import）。
import { reactive } from 'vue'
import { scheduleStrategies, blankStrategy } from './scheduleStrategies.js'

export const strategyList = reactive(scheduleStrategies)

export const findStrategy = (id) => strategyList.find(s => s.id === id) || null

export const nowText = () => new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')

/** 下一个可用编号（SS-xxx，删过中间的也不会撞号） */
export function nextStrategyId () {
  const max = strategyList.reduce((acc, s) => {
    const n = Number(String(s.id ?? '').replace(/\D/g, ''))
    return Number.isFinite(n) && n > acc ? n : acc
  }, 0)
  return `SS-${String(max + 1).padStart(3, '0')}`
}

/** 新建一条策略并返回（未保存前也占号，原型从简） */
export function createStrategy () {
  const s = { ...blankStrategy(), id: nextStrategyId(), updatedAt: nowText() }
  strategyList.push(s)
  return s
}

/** 复制一条：副本默认停用 */
export function copyStrategy (id) {
  const src = findStrategy(id)
  if (!src) return null
  const copy = JSON.parse(JSON.stringify(src))
  copy.id = nextStrategyId()
  copy.name = `${src.name}副本`
  copy.enabled = false
  copy.updatedAt = nowText()
  strategyList.push(copy)
  return copy
}
