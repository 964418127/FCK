// 通用参数的运行期数据源：列表页、数据表配置页、薪酬项引用共用同一份对象。
// mock/generalParams.js 只放种子数据与纯函数（node 测试直接 import，不引入 vue）。
import { reactive } from 'vue'
import { generalParams } from './generalParams.js'

export const paramList = reactive(generalParams)

export const findParam = (id) => paramList.find(p => p.id === id) || null

export const isTableParam = (param) => param?.kind === 'table'

/** 下一个可用编号（按已有编号的最大值 +1，删过中间行也不会撞号） */
export function nextParamId () {
  const max = paramList.reduce((acc, p) => {
    const n = Number(String(p.id ?? '').replace(/\D/g, ''))
    return Number.isFinite(n) && n > acc ? n : acc
  }, 0)
  return `GP-${String(max + 1).padStart(3, '0')}`
}

export const nowText = () => new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
