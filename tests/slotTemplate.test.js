// 时段通用模板：新增时段 = 选模板 → 按容器实例化 → 逐项修改（不锁死任何字段）
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  SLOT_TEMPLATES, findSlotTemplate, findTemplate, SHIFT_TEMPLATES,
  netHours, shiftOf
} from '../src/mock/slotModel.js'
import { createSlot, validateSlot, shiftsOf, slotList } from '../src/mock/slotModelStore.js'

test('时段通用模板：≥4 条且结构完整（班次引用 + 名额 + 生成 + 窗口×层）', () => {
  assert.ok(SLOT_TEMPLATES.length >= 4, '模板至少 4 条（含空白）')
  for (const t of SLOT_TEMPLATES) {
    assert.ok(t.name?.trim(), `模板 ${t.id} 缺名称（fromSeed 参数丢失会让下拉只剩 id）`)
    assert.ok(t.desc?.trim(), `模板 ${t.id} 缺描述`)
    assert.ok(findTemplate(t.shiftTemplateId), `模板 ${t.id} 的班次引用必须存在`)
    const b = t.body
    assert.ok((b.days || []).length, `模板 ${t.id} 缺生效星期`)
    assert.ok(b.capacity?.value > 0, `模板 ${t.id} 缺名额`)
    assert.ok(b.generation, `模板 ${t.id} 缺生成规则`)
    assert.ok(b.claim, `模板 ${t.id} 缺领取约束`)
    assert.ok(b.leftover, `模板 ${t.id} 缺兜底`)
    assert.ok((b.windows || []).length, `模板 ${t.id} 缺分配窗口`)
    for (const w of b.windows) {
      for (const tier of w.tiers) {
        assert.ok(['crowds', 'key', 'quota', 'obligation', 'openAt', 'openModel'].every(k => k in tier), `模板 ${t.id} 存在不完整的层`)
      }
    }
  }
})

test('模板覆盖关键场景：按月生成、双窗口重跑、错峰都在模板里', () => {
  assert.ok(SLOT_TEMPLATES.some(t => t.body.generation.cadence === 'monthly' && t.body.generation.horizon === 'month'), '缺按月生成模板')
  assert.ok(SLOT_TEMPLATES.some(t => t.body.windows.length >= 2), '缺双窗口重跑模板')
  assert.ok(SLOT_TEMPLATES.some(t => t.body.windows.flatMap(w => w.tiers).some(x => x.openModel === 'parallel' && x.openAt.offsetH > 0)), '缺错峰模板')
})

test('实例化：按模板克隆出可校验的时段，班次落到本容器班次库，id 不撞', () => {
  const before = slotList.length
  const s = createSlot('P-01', 'ST-02')
  assert.equal(slotList.length, before + 1)
  // 班次按容器解析（非全晚峰 → 本容器已有引用 PS-102）
  const sh = shiftOf(s)
  assert.ok(sh && shiftsOf('P-01').some(x => x.id === sh.id), '实例班次必须在本容器班次库')
  // 结构与模板同形但不是同一个引用（改实例不动模板）
  const tpl = findSlotTemplate('ST-02')
  assert.notEqual(s.windows, tpl.body.windows)
  s.windows[0].tiers[0].quota = { mode: 'count', value: 9 }
  assert.equal(tpl.body.windows[0].tiers[0].quota.mode, 'ratio', '改实例不能影响模板')
  // 窗口/层 id 全部重生成，不与模板种子撞 key
  const tplIds = new Set(SLOT_TEMPLATES.flatMap(t => t.body.windows.flatMap(w => w.tiers.map(x => x.id))))
  for (const w of s.windows) {
    assert.ok(!tplIds.has(w.id))
    for (const t of w.tiers) assert.ok(!tplIds.has(t.id))
  }
  // 实例可直接通过校验（模板不是半成品）
  assert.equal(validateSlot(s), '')
})

test('空白模板：实例化后人群为空（编辑中状态），补齐人群即可过校验', () => {
  const s = createSlot('P-02', 'ST-05')
  assert.deepEqual(s.windows[0].tiers[0].crowds, [])
  s.windows[0].tiers[0].crowds = ['全日制客户经理']
  assert.equal(validateSlot(s), '')
})

test('模板实例化不写死容器：同一模板可在不同容器各实例化一份', () => {
  const a = createSlot('P-01', 'ST-03')
  const b = createSlot('P-04', 'ST-03')
  assert.equal(a.containerId, 'P-01')
  assert.equal(b.containerId, 'P-04')
  assert.notEqual(a.shiftId, b.shiftId, '两个容器应各挂各的班次')
  assert.equal(shiftOf(a).templateId, shiftOf(b).templateId, '但引用同一个通用班次模板（身份锚点）')
})

test('临时时段走模板实例化时自动去生成规则、清星期', () => {
  const s = createSlot('P-01', 'ST-02', 'temp')
  assert.equal(s.kind, 'temp', 'kind 参数不能被模板 body 覆盖')
  assert.equal(s.generation, null)
  assert.deepEqual(s.days, [])
})

test('净工时来自班次：模板实例的净工时可解析', () => {
  const s = createSlot('P-01', 'ST-03')
  assert.ok(netHours(s) > 0)
  // SHIFT_TEMPLATES 的引用仍健康
  assert.ok(SHIFT_TEMPLATES.length >= 7)
})
