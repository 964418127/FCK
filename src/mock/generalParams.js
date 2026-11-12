// 通用参数配置 mock 数据（模块化薪酬 · 配置规则管理 → 通用参数配置）
//
// 没有「参数形态」，只有「值类型」：
//   text / number / date / time / text-array / date-array / time-array / kv-array —— 简单值，公式里直接写值。
//   table —— 数据表：一张纯粹的二维表（columns 列定义 + rows 行数据）。
//            条件列和值列都是业务建表时自己定的，系统不认任何列名；
//            「层级感」来自数据的行形态（哪些行存在、哪些格留空）与引用处的配置，不是系统概念。
//
// 取值契约（引用处声明，引擎只有一个算法）：
//   表名.列名（条件1, 条件2, …）—— 公式里写「表名.列名」，多列相加写「表名.列1+列2」。
//   · 一条条件 = 「条件列 符号 传入值」，按这个顺序读：行里这一列的值 与 传入值 比较；
//     符号有六种：等于 / 不等于 / 大于 / 大于等于 / 小于 / 小于等于（区间就是「下限 ≤ 值」「上限 > 值」两条）；
//   · 取 1 列（单值）：候选值列按配置顺序，第一个沿行序列取到非 null 的列生效；
//   · 取多列（相加）：每个值列各自沿行序列穿透取第一个非 null，再相加；取不到的列按缺省值（默认 0）。
//
// 引擎算法：
//   ① 行匹配：行里「有值的格」所在列必须配了条件、且传入了值并命中——
//      即一行的身份必须被查询完整覆盖，否则该行不参与（只传城市时，门店行不会错拿）；
//      行里留空的格 = 不约束，任何查询都可命中（层级行兜底的来源）。
//   ② 行序列：命中行按特异度（有值且命中的格数）降序，同特异度按行序——特异的行在前。
//   ③ 列解析：值列沿行序列找第一个非 null 格；显式 0 是值、命中即止；留空 = null、继续穿。

export const VALUE_TYPES = [
  { value: 'text', label: '文本' },
  { value: 'number', label: '数值' },
  { value: 'date', label: '日期' },
  { value: 'time', label: '时间' },
  { value: 'text-array', label: 'Array<文本>' },
  { value: 'date-array', label: 'Array<日期>' },
  { value: 'time-array', label: 'Array<时间>' },
  { value: 'kv-array', label: 'Array<键值>' },
  { value: 'table', label: '数据表' }
]

export const VALUE_TYPE_LABELS = VALUE_TYPES.reduce((map, item) => (map[item.value] = item.label, map), {})

/** 新增一行时的空值：数组类默认给两行空白，标量给空串 */
export const emptyValueOf = (type) => {
  if (type === 'kv-array') return [{ key: '', value: '' }, { key: '', value: '' }]
  if (type === 'text-array' || type === 'date-array' || type === 'time-array') return ['', '']
  return ''
}

/** 数据表的列类型 */
export const DIM_TYPES = [
  { value: 'text', label: '文本' },
  { value: 'number', label: '数值' },
  { value: 'date', label: '日期' }
]

// ===== 种子数据 =====
// 保底时薪示例（表法 A · 覆盖链）：一张表三级——通用行（身份全空）→ 城市行 → 门店行，
// 门店行直接存最终值；取值函数 = 取 1 列「时薪」，条件 [城市, 门店]，特异度排序天然形成覆盖。
// 单价示例（表法 A · 层级行 + 格子维度）：客次 / 新客 / 评价 各一张同构表，
//   条件列 = 身份（城市 / 门店 / 工号，留空 = 该层不约束）+ 格子（人数档 精确；客次档 = 客次下限 / 客次上限 两列，区间条件）；
//   取值函数 = 取 1 列「单价」，条件 [城市, 门店, 工号, 人数档] + 区间条件 [客次下限, 客次上限) ← 当月客次。
// 其余数据表由业务自己建（独立配置页录入或导入），这里只留简单值作为基础演示。

export const generalParams = [
  {
    id: 'GP-001',
    name: '测试',
    kind: 'simple',
    valueType: 'kv-array',
    value: [{ key: '1', value: '2' }],
    enabled: true,
    updateTime: '2026-10-28 15:20'
  },
  {
    // 非全 6.7.3 收入保底：一行 = 一个层级的覆盖记录，条件格留空 = 继承上层；
    // 显式值 = 覆盖。城市调价时门店行要人工核对同步（表法 A 的已知代价）。
    id: 'GP-002',
    name: '非全保底时薪',
    kind: 'table',
    columns: [
      { name: '城市', type: 'text' },
      { name: '门店', type: 'text' },
      { name: '时薪', type: 'number' }
    ],
    rows: [
      { cells: { '城市': '', '门店': '', '时薪': '25' } },
      { cells: { '城市': '成都', '门店': '', '时薪': '28' } },
      { cells: { '城市': '杭州', '门店': '', '时薪': '30' } },
      { cells: { '城市': '北京', '门店': '', '时薪': '32' } },
      { cells: { '城市': '成都', '门店': '兴隆湖店', '时薪': '30' } },
      { cells: { '城市': '成都', '门店': '麓山店', '时薪': '29' } },
      { cells: { '城市': '杭州', '门店': '西湖店', '时薪': '33' } }
    ],
    enabled: true,
    updateTime: '2026-11-10 18:12'
  },
  {
    // 6.7.1 计件单价（客次）：通用格 = 人数档 × 客次档兜底。
    // 客次档用「客次下限 / 客次上限」两列表达：下限闭、上限开，上限留空 = 无上限。
    // 城市 / 门店 / 个人只在有差异时加行；E009 显式 0 = 覆盖。
    id: 'GP-003',
    name: '非全客次单价',
    kind: 'table',
    columns: [
      { name: '城市', type: 'text' },
      { name: '门店', type: 'text' },
      { name: '工号', type: 'text' },
      { name: '人数档', type: 'number' },
      { name: '客次下限', type: 'number' },
      { name: '客次上限', type: 'number' },
      { name: '单价', type: 'number' }
    ],
    rows: [
      { cells: { '人数档': '1', '客次下限': '0', '客次上限': '30', '单价': '4' } },
      { cells: { '人数档': '1', '客次下限': '30', '客次上限': '40', '单价': '4.5' } },
      { cells: { '人数档': '1', '客次下限': '40', '客次上限': '', '单价': '5' } },
      { cells: { '人数档': '2', '客次下限': '0', '客次上限': '30', '单价': '5' } },
      { cells: { '人数档': '2', '客次下限': '30', '客次上限': '40', '单价': '5.5' } },
      { cells: { '人数档': '2', '客次下限': '40', '客次上限': '', '单价': '6' } },
      { cells: { '人数档': '3', '客次下限': '0', '客次上限': '30', '单价': '5.5' } },
      { cells: { '人数档': '3', '客次下限': '30', '客次上限': '40', '单价': '6' } },
      { cells: { '人数档': '3', '客次下限': '40', '客次上限': '', '单价': '6.5' } },
      { cells: { '城市': '成都', '人数档': '2', '客次下限': '0', '客次上限': '30', '单价': '5.5' } },
      { cells: { '城市': '成都', '门店': '兴隆湖店', '人数档': '2', '客次下限': '0', '客次上限': '30', '单价': '6' } },
      { cells: { '城市': '成都', '门店': '兴隆湖店', '工号': 'E100', '人数档': '2', '客次下限': '0', '客次上限': '30', '单价': '7' } },
      { cells: { '城市': '成都', '门店': '兴隆湖店', '工号': 'E009', '人数档': '2', '客次下限': '0', '客次上限': '30', '单价': '0' } },
    ],
    enabled: true,
    updateTime: '2026-11-10 19:00'
  },
  {
    // 6.7.1 计件单价（新客）：同构独立表，配置互不影响。
    id: 'GP-004',
    name: '非全新客单价',
    kind: 'table',
    columns: [
      { name: '城市', type: 'text' },
      { name: '门店', type: 'text' },
      { name: '工号', type: 'text' },
      { name: '人数档', type: 'number' },
      { name: '客次下限', type: 'number' },
      { name: '客次上限', type: 'number' },
      { name: '单价', type: 'number' }
    ],
    rows: [
      { cells: { '人数档': '1', '客次下限': '0', '客次上限': '30', '单价': '3' } },
      { cells: { '人数档': '1', '客次下限': '30', '客次上限': '40', '单价': '3.5' } },
      { cells: { '人数档': '1', '客次下限': '40', '客次上限': '', '单价': '4' } },
      { cells: { '人数档': '2', '客次下限': '0', '客次上限': '30', '单价': '4' } },
      { cells: { '人数档': '2', '客次下限': '30', '客次上限': '40', '单价': '4.5' } },
      { cells: { '人数档': '2', '客次下限': '40', '客次上限': '', '单价': '5' } },
      { cells: { '人数档': '3', '客次下限': '0', '客次上限': '30', '单价': '4.5' } },
      { cells: { '人数档': '3', '客次下限': '30', '客次上限': '40', '单价': '5' } },
      { cells: { '人数档': '3', '客次下限': '40', '客次上限': '', '单价': '5.5' } },
      { cells: { '城市': '成都', '门店': '兴隆湖店', '人数档': '2', '客次下限': '0', '客次上限': '30', '单价': '5' } },
    ],
    enabled: true,
    updateTime: '2026-11-10 19:00'
  },
  {
    // 6.7.1 计件单价（评价）：同构独立表。
    id: 'GP-005',
    name: '非全评价单价',
    kind: 'table',
    columns: [
      { name: '城市', type: 'text' },
      { name: '门店', type: 'text' },
      { name: '工号', type: 'text' },
      { name: '人数档', type: 'number' },
      { name: '客次下限', type: 'number' },
      { name: '客次上限', type: 'number' },
      { name: '单价', type: 'number' }
    ],
    rows: [
      { cells: { '人数档': '1', '客次下限': '0', '客次上限': '30', '单价': '2' } },
      { cells: { '人数档': '1', '客次下限': '30', '客次上限': '40', '单价': '2' } },
      { cells: { '人数档': '1', '客次下限': '40', '客次上限': '', '单价': '2.5' } },
      { cells: { '人数档': '2', '客次下限': '0', '客次上限': '30', '单价': '2' } },
      { cells: { '人数档': '2', '客次下限': '30', '客次上限': '40', '单价': '2.5' } },
      { cells: { '人数档': '2', '客次下限': '40', '客次上限': '', '单价': '3' } },
      { cells: { '人数档': '3', '客次下限': '0', '客次上限': '30', '单价': '2.5' } },
      { cells: { '人数档': '3', '客次下限': '30', '客次上限': '40', '单价': '3' } },
      { cells: { '人数档': '3', '客次下限': '40', '客次上限': '', '单价': '3.5' } },
      { cells: { '城市': '成都', '人数档': '2', '客次下限': '0', '客次上限': '30', '单价': '3' } },
    ],
    enabled: true,
    updateTime: '2026-11-10 19:00'
  },
  { id: 'GP-009', name: '面试通过单价', kind: 'simple', valueType: 'number', value: '200', enabled: true, updateTime: '2026-09-30 16:45' },
  { id: 'GP-010', name: '知识萃取单价', kind: 'simple', valueType: 'number', value: '80', enabled: true, updateTime: '2026-09-28 10:18' },
  { id: 'GP-011', name: '服务接待扣减次', kind: 'simple', valueType: 'number', value: '10', enabled: true, updateTime: '2026-09-25 15:02' },
  { id: 'GP-012', name: '房间卫生未打扫/次', kind: 'simple', valueType: 'number', value: '20', enabled: true, updateTime: '2026-09-22 09:36' },
  { id: 'GP-013', name: '离店扣款标准/次', kind: 'simple', valueType: 'number', value: '30', enabled: true, updateTime: '2026-09-20 17:24' }
]

/**
 * 比较符号。查询条件按「条件列 符号 传入值」读；符号在引用处声明，格子里只放数据，
 * 表里不写表达式——区间用两列（下限 / 上限）+ 两个符号表达，不再有单独的「区间」条件类型。
 */
export const COMPARE_OPS = [
  { value: 'eq', label: '等于', symbol: '=' },
  { value: 'neq', label: '不等于', symbol: '≠' },
  { value: 'gt', label: '大于', symbol: '>' },
  { value: 'gte', label: '大于等于', symbol: '≥' },
  { value: 'lt', label: '小于', symbol: '<' },
  { value: 'lte', label: '小于等于', symbol: '≤' }
]

export const COMPARE_OP_SYMBOLS = COMPARE_OPS.reduce((map, o) => (map[o.value] = o.symbol, map), {})

/** 哪种列能配哪些符号：数值 / 日期可以比大小，纯文本只能等于、不等于 */
export function opsForType (type) {
  if (type === 'number' || type === 'date') return COMPARE_OPS
  return COMPARE_OPS.filter(o => o.value === 'eq' || o.value === 'neq')
}

const isEmptyInput = v => v === undefined || v === null || String(v).trim() === ''
const isFilledCell = v => String(v ?? '').trim() !== ''

/**
 * 格比对：行里这一列的值 与 传入值，按符号比较。
 *   · 格留空 = 这条条件不约束（层级行兜底的来源）；
 *   · 条件配了却没传值 = 这一行的身份没被覆盖，不参与（不猜、不按行序凑）；
 *   · 数值列按数字比，日期列按字符串比（YYYY-MM-DD），文本列只能 = / ≠。
 */
function compareCell (cell, input, type, op) {
  const a = String(cell ?? '').trim()
  const b = String(input ?? '').trim()
  if (!a) return true
  if (!b) return false
  if (type !== 'number') {
    if (op === 'eq') return a === b
    if (op === 'neq') return a !== b
    return op === 'gt' ? a > b : op === 'gte' ? a >= b : op === 'lt' ? a < b : a <= b
  }
  const na = Number(a)
  const nb = Number(b)
  if (!Number.isFinite(na) || !Number.isFinite(nb)) return false
  switch (op) {
    case 'neq': return na !== nb
    case 'gt': return na > nb
    case 'gte': return na >= nb
    case 'lt': return na < nb
    case 'lte': return na <= nb
    default: return na === nb
  }
}

/**
 * 行匹配：返回按特异度降序、行序升序的命中行序列 [{ row, index, specificity }]。
 *
 * conds = [{ col, op, fact }]：一条条件 = 「条件列 col 符号 op 传入值 inputs[fact]」，
 * 比较的是行里 col 这一格的值与 inputs[fact]；op 见 COMPARE_OPS，默认等于。
 *   · 行里 col 留空 = 这条不约束，也不计特异度；
 *   · 行里 col 有值、但没配它的条件 / 配了没传值 / 比不过 → 该行不参与；
 *   · 同一列配多条条件也可以（例如「下限 ≤ 值」与「下限 > 值」两个口径）。
 * valueCols 是取值列，不参与身份检查（它们的格是数据不是标识）。
 */
export function matchRows (param, inputs = {}, valueCols = [], conds = []) {
  const cols = param.columns || []
  const colNames = new Set(cols.map(c => c.name))
  const valueSet = new Set(valueCols)

  const byCol = new Map()
  ;(conds || []).forEach(c => {
    const col = String(c.col ?? '').trim()
    const fact = String(c.fact ?? '').trim()
    if (!col || !colNames.has(col) || valueSet.has(col) || !fact) return
    if (!byCol.has(col)) byCol.set(col, [])
    byCol.get(col).push({ op: c.op || 'eq', fact })
  })

  const matched = []
  ;(param.rows || []).forEach((row, index) => {
    let specificity = 0
    let covered = true
    for (const col of cols) {
      if (valueSet.has(col.name)) continue
      const cell = String(row.cells?.[col.name] ?? '').trim()
      if (!isFilledCell(cell)) continue
      const specs = byCol.get(col.name)
      if (!specs) { covered = false; break }
      for (const spec of specs) {
        if (!compareCell(cell, inputs[spec.fact], col.type, spec.op)) { covered = false; break }
        specificity++
      }
      if (!covered) break
    }
    if (covered) matched.push({ row, index, specificity })
  })
  return matched.sort((a, b) => b.specificity - a.specificity || a.index - b.index)
}

/**
 * 通用参数寻值。简单值直接返回；数据表按取值契约 fn 寻值：
 *   fn.valueCols = 取值列（有序）；fn.mode = 'single'（默认，列序第一个取到值的列生效）
 *                 | 'sum'（各列各自穿透后相加，取不到的列按 fn.defaults?.[col] ?? 0）；
 *   fn.conds     = 查询条件 [{ col, op, fact }]（条件列 / 符号 / 传入值），规则见 matchRows。
 * 返回 { ok, value, hits: [{ col, row, value }] } 或 { ok: false, error }。
 */
export function resolveParam (param, inputs = {}, fn = {}) {
  if (!param) return { ok: false, error: '参数不存在' }
  if (!param.enabled) return { ok: false, error: `参数「${param.name}」已停用，取不到值` }
  if (param.kind !== 'table') return { ok: true, value: param.value, hits: [] }
  const colNames = (param.columns || []).map(c => c.name)
  const valueCols = (fn.valueCols || []).map(n => String(n).trim()).filter(n => colNames.includes(n))
  if (!valueCols.length) return { ok: false, error: `「${param.name}」的取值函数没有可用的取值列` }
  const rows = matchRows(param, inputs, valueCols, fn.conds || [])
  const hits = []
  if (fn.mode === 'sum') {
    let total = 0
    for (const col of valueCols) {
      const found = rows.find(m => !isEmptyInput(m.row.cells?.[col]))
      if (found) {
        const n = Number(found.row.cells[col])
        if (!Number.isFinite(n)) return { ok: false, error: `「${param.name}」的「${col}」列值「${found.row.cells[col]}」不是数值，无法相加` }
        total += n
        hits.push({ col, row: found.row, value: found.row.cells[col] })
      } else {
        const fallback = fn.defaults?.[col] ?? 0
        total += Number(fallback) || 0
        hits.push({ col, row: null, value: fallback })
      }
    }
    return { ok: true, value: total, hits }
  }
  for (const col of valueCols) {
    const found = rows.find(m => !isEmptyInput(m.row.cells?.[col]))
    if (found) {
      hits.push({ col, row: found.row, value: found.row.cells[col] })
      return { ok: true, value: found.row.cells[col], hits }
    }
  }
  const condText = (fn.conds || [])
    .filter(c => String(c.col ?? '').trim() && String(c.fact ?? '').trim())
    .map(c => `${String(c.col).trim()} ${COMPARE_OP_SYMBOLS[c.op] || '='} ${String(c.fact).trim()}`)
    .join('、') || '未配查询条件'
  return { ok: false, error: `「${param.name}」按条件（${condText}）取不到「${valueCols.join('」「')}」的值` }
}
