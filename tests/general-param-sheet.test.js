// 二维数据的表格互转（导出 / 导入模板 / 上传解析 / 列名去重）
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  duplicateColNames,
  headerOf,
  paramSheetAoa,
  templateAoa,
  templateGuideAoa,
  parseSheetAoa
} from '../src/mock/generalParamSheet.js'

const columns = [
  { name: '城市', type: 'text' },
  { name: '客次', type: 'number' },
  { name: '单价', type: 'number' }
]

const param = {
  columns,
  rows: [
    { cells: { 城市: '成都', 客次: '1-2', 单价: '4' } },
    { cells: { 城市: '杭州', 客次: '≥3', 单价: '' } }
  ]
}

test('列名重复：没有重复返回空，重复的只报一次，空列名不算重复', () => {
  assert.deepEqual(duplicateColNames(columns), [])
  assert.deepEqual(duplicateColNames([{ name: '城市' }, { name: ' 城市 ' }, { name: '' }, { name: '' }]), ['城市'])
})

test('导出：按列顺序出表头与数据，缺的格子补空', () => {
  assert.deepEqual(headerOf(columns), ['城市', '客次', '单价'])
  assert.deepEqual(paramSheetAoa(param), [
    ['城市', '客次', '单价'],
    ['成都', '1-2', '4'],
    ['杭州', '≥3', '']
  ])
  // 行里多出来的键（旧列名残留）不导出
  assert.deepEqual(
    paramSheetAoa({ columns, rows: [{ cells: { 城市: '成都', 客次: '1', 单价: '2', 旧列: 'x' } }] })[1],
    ['成都', '1', '2']
  )
})

test('导入模板：表头跟着当前列，正文是空白行、不带已有数据', () => {
  const aoa = templateAoa(param, 2)
  assert.equal(aoa.length, 3)
  assert.deepEqual(aoa[0], ['城市', '客次', '单价'])
  assert.deepEqual(aoa[1], ['', '', ''])
  // 列改了模板就跟着变
  assert.deepEqual(templateAoa({ columns: [{ name: '工号', type: 'text' }] })[0], ['工号'])
})

test('导入模板的填写说明：列出每一列与写法', () => {
  const guide = templateGuideAoa(param)
  const flat = guide.map(row => row.join('|'))
  assert.ok(flat.some(line => line.includes('城市|文本')))
  assert.ok(flat.some(line => line.includes('客次|数值') && line.includes('空表示不约束')))
})

test('导入解析：按表头对齐列名，顺序无关；未识别的表头忽略；整行为空的行跳过', () => {
  const aoa = [
    ['单价', '城市', '备注', '客次'],
    ['4', '成都', '无关列', '12'],
    ['', '', '', ''],
    ['6', '重庆', '', '3']
  ]
  const { rows, errors, matched, unknown } = parseSheetAoa(columns, aoa)
  assert.equal(errors.length, 0)
  assert.deepEqual(matched, ['城市', '客次', '单价'])
  assert.deepEqual(unknown, ['备注'])
  assert.equal(rows.length, 2)
  assert.deepEqual(rows[0].cells, { 城市: '成都', 客次: '12', 单价: '4' })
  assert.deepEqual(rows[1].cells, { 城市: '重庆', 客次: '3', 单价: '6' })
})

test('导入解析：数值列只收纯数值，区间 / 比较式写法报错（区间该用两列）', () => {
  const aoa = [['城市', '客次', '单价'], ['成都', '3-5', '30'], ['成都', '', ''], ['成都', '≤5', '4.5']]
  const { rows, errors } = parseSheetAoa(columns, aoa)
  assert.equal(errors.length, 2)
  assert.deepEqual(errors.map(e => e.line), [2, 4])
})

test('导入解析：数值列写了非数值就报行号，不静默吞掉', () => {
  const aoa = [['城市', '客次', '单价'], ['成都', '多次', '4'], ['成都', '1-2', '四块']]
  const { errors } = parseSheetAoa(columns, aoa)
  assert.equal(errors.length, 3)
  assert.deepEqual(errors.map(e => e.line), [2, 3, 3])
  assert.ok(errors[0].message.includes('客次'))
  assert.ok(errors[2].message.includes('单价'))
})

test('导入解析：表头一个都对不上就直接拦下，提示当前列名', () => {
  const { rows, errors, matched } = parseSheetAoa(columns, [['城市名', '次数'], ['成都', '1']])
  assert.equal(rows.length, 0)
  assert.equal(matched.length, 0)
  assert.equal(errors.length, 1)
  assert.ok(errors[0].message.includes('城市、客次、单价'))
})

test('导入解析：空文件与全是空行都给出提示', () => {
  assert.equal(parseSheetAoa(columns, []).errors.length, 1)
  const blank = parseSheetAoa(columns, [['城市', '客次', '单价'], ['', '', '']])
  assert.equal(blank.rows.length, 0)
  assert.ok(blank.errors.length >= 1)
})
