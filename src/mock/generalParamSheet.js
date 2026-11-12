// 数据表的表格互转：导出 / 导入模板 / 上传解析 / 列名校验。
//
// 约定：
//   · 表头就是列名，顺序无关——导入时按列名对齐，未识别的表头忽略；
//   · 一行一条数据，整行为空的行忽略；
//   · 数值列只写数值（区间不写进格子：用「下限列 / 上限列」两列表达成区间条件）；
//   · 列名不可重复（重复会让同一格对应两个列，导入与取值都会歧义）。
// 纯函数模块，node 测试可直接 import（不依赖 vue）。

/** 数值列只收纯数值：区间/比较式不写进格子 */
const NUMBER_CELL = /^-?\d+(?:\.\d+)?$/

export const isEmptyCell = (v) => v === undefined || v === null || String(v).trim() === ''

/** 列名（去空白）。表头、导出、导入对齐都用它 */
export const headerOf = (columns) => (columns || []).map(c => String(c.name ?? '').trim())

/** 重复的列名（去重后返回），空列名不算重复 */
export function duplicateColNames (columns) {
  const seen = new Set()
  const dup = new Set()
  ;(columns || []).forEach((c) => {
    const name = String(c.name ?? '').trim()
    if (!name) return
    if (seen.has(name)) dup.add(name)
    seen.add(name)
  })
  return [...dup]
}

/** 单元格填写说明（模板的「填写说明」页与导入弹窗共用一套说明） */
export function cellHint (type) {
  if (type === 'number') return '数值；空表示不约束'
  if (type === 'date') return '日期，如 2026-11-10，或留空'
  return '文本，或留空'
}

/** 参数 → 整张表的二维数组（第一行表头，其后一行一条数据），导出与导入模板共用 */
export function paramSheetAoa (param) {
  const columns = param?.columns || []
  const header = headerOf(columns)
  const body = (param?.rows || []).map(row => header.map(name => String(row.cells?.[name] ?? '')))
  return [header, ...body]
}

/** 导入模板：表头 + 若干空白行，交给业务自己填 */
export function templateAoa (param, blankRows = 3) {
  const header = headerOf(param?.columns || [])
  const blank = Array.from({ length: Math.max(1, blankRows) }, () => header.map(() => ''))
  return [header, ...blank]
}

/** 导入模板的「填写说明」页：列清单 + 每类列的写法 */
export function templateGuideAoa (param) {
  const columns = param?.columns || []
  const rows = [
    ['导入模板由当前配置的列生成，表头请勿修改；一行填写一条数据，整行为空的行会被忽略。'],
    [''],
    ['列名', '类型', '填写说明']
  ]
  columns.forEach(c => rows.push([
    String(c.name ?? '').trim(),
    c.type === 'number' ? '数值' : c.type === 'date' ? '日期' : '文本',
    cellHint(c.type)
  ]))
  return rows
}

/**
 * 工作表 → { rows, errors, matched, unknown }。
 *   rows    —— 可直接写入参数的 { cells } 行（已按列名对齐、跳过空行）
 *   errors  —— [{ line, message }]，line 为文件里的行号（表头是第 1 行）
 *   matched —— 表头里认出当前列的对象
 *   unknown —— 表头里有、但当前列里没有的列名（忽略，仅作提示）
 */
export function parseSheetAoa (columns, aoa) {
  const cols = columns || []
  const names = headerOf(cols)
  const errors = []
  const empty = { rows: [], errors, matched: [], unknown: [] }
  if (!aoa || !aoa.length) {
    errors.push({ line: 0, message: '文件里没有内容' })
    return empty
  }
  const header = (aoa[0] || []).map(v => String(v ?? '').trim())
  const indexOf = {}
  header.forEach((name, index) => {
    if (name && names.includes(name) && indexOf[name] === undefined) indexOf[name] = index
  })
  const matched = names.filter(name => indexOf[name] !== undefined)
  if (!matched.length) {
    errors.push({ line: 1, message: `表头与当前列名不一致（当前列：${names.join('、') || '无'}）` })
    return empty
  }
  const unknown = header.filter(name => name && !names.includes(name))

  const rows = []
  for (let r = 1; r < aoa.length; r++) {
    const line = r + 1
    const cells = {}
    let filled = false
    cols.forEach((c) => {
      const name = String(c.name ?? '').trim()
      const index = indexOf[name]
      const raw = index === undefined ? '' : String(aoa[r]?.[index] ?? '').trim()
      cells[name] = raw
      if (raw) filled = true
    })
    if (!filled) continue
    cols.forEach((c) => {
      const name = String(c.name ?? '').trim()
      const value = cells[name]
      if (c.type !== 'number' || !value || value === '*') return
      if (!NUMBER_CELL.test(value)) errors.push({ line, message: `「${name}」不是数值写法：${value}` })
    })
    rows.push({ cells })
  }
  if (!rows.length && !errors.length) errors.push({ line: 0, message: '没有读到有效的数据行' })
  return { rows, errors, matched, unknown }
}
