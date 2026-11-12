// 时段与名额 v2 —— 模型口径测试
// 只 import 纯数据模块（mock/slotModel.js），不碰依赖 vue 的 store。
import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  slotSeeds, blankSlot, CONTAINERS, CONTAINER_TYPES, KEY_TYPES, SHIFT_TEMPLATES, SLOT_KINDS, CONTAINER_SHIFTS,
  netHours, slotSummary, tierOneLine, quotaLabel, openAtLabel, windowOpenLabel,
  parseOpenTime, WINDOW_ANCHORS, OPEN_ANCHORS,
  keyTypeOf, keyModeOf, keyDetail, obligationOf, openModelOf,
  kindOf, findTemplate, findContainerShift, findContainer, shiftOf, shiftAdjusted, shiftRenamed, shiftFlags,
  tierSentence, tierShort, slotFlow,
  GEN_CADENCES, GEN_HORIZONS, genShort, CLAIM_GRANULARITY, claimShort, LEFTOVERS
} from '../src/mock/slotModel.js'

const tiersOf = slot => slot.windows.flatMap(w => w.tiers)
const allTiers = slotSeeds.flatMap(tiersOf)
const byName = n => slotSeeds.find(s => shiftOf(s)?.name === n)
const cont = cid => slotSeeds.filter(s => s.containerId === cid)

test('净工时 = 止 − 起 − 休息：行政班 8h、非全晚峰 2h、保洁 4h', () => {
  assert.equal(netHours(byName('行政班')), 8)
  assert.equal(netHours(byName('非全晚峰')), 2)
  assert.equal(netHours(byName('保洁早段')), 4)
})

test('时段挂本容器班次：引用班次身份 = 模板 id，名称/时间在容器级班次上，不在时段上', () => {
  for (const s of slotSeeds) {
    const sh = shiftOf(s)
    assert.ok(sh, `时段 ${s.id} 没挂班次`)
    assert.equal(sh.containerId, s.containerId, `时段 ${s.id} 挂了别家的班次`)
    assert.ok(findContainer(s.containerId), `时段 ${s.id} 的容器不存在`)
  }
  // 时段上不再存名称与时间 —— 单一来源在班次上
  for (const s of slotSeeds) {
    assert.equal(s.name, undefined, `时段 ${s.id} 仍残留 name`)
    assert.equal(s.start, undefined, `时段 ${s.id} 仍残留 start`)
    assert.equal(s.templateId, undefined, `时段 ${s.id} 仍残留 templateId`)
  }
  // 跨店比对靠模板 id：兴隆湖早班与麓山「黄金早班」引用同一个模板
  const xl = findContainerShift('PS-101')
  const ls = findContainerShift('PS-201')
  assert.equal(xl.templateId, ls.templateId, '两店早班应引用同一通用模板（身份锚点）')
  assert.notEqual(xl.name, ls.name, '门店改名后名称可以不同')
  // 门店自建班次：无模板身份，标「门店自定义」
  const custom = findContainerShift('PS-104')
  assert.equal(custom.templateId, null)
  assert.deepEqual(shiftFlags(custom), ['门店自定义'])
})

test('店级班次可改名可调时间：麓山「黄金早班」= 引用早班 + 改名 + 调时间；兴隆湖未动', () => {
  const ls = findContainerShift('PS-201')
  const tpl = findTemplate(ls.templateId)
  assert.equal(ls.name, '黄金早班')
  assert.notEqual(shiftRenamed(ls), false, '麓山早班应标已改名')
  assert.equal(shiftAdjusted(ls), true, '麓山早班应标已按门店调整')
  assert.notEqual(`${ls.start}-${ls.end}`, `${tpl.start}-${tpl.end}`)
  const xl = findContainerShift('PS-101')
  assert.equal(shiftAdjusted(xl), false)
  assert.equal(shiftRenamed(xl), false)
  assert.deepEqual(shiftFlags(xl), [], '与模板一致的引用班次无徽标')
})

test('临时时段是独立类型：有日期、一次性、不进周期时间轴语义', () => {
  assert.deepEqual(SLOT_KINDS.map(k => k.value), ['cycle', 'temp'])
  const temp = slotSeeds.filter(s => s.kind === 'temp')
  assert.equal(temp.length, 1, '应有一个临时时段种子')
  const t = temp[0]
  assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(t.date), '临时时段必须带日期')
  assert.equal(t.windows.length, 1, '临时时段单窗口')
  assert.equal(t.windows[0].tiers.length, 1, '临时时段不分档，单层')
  assert.equal(kindOf('temp').label, '临时时段')
  assert.equal(kindOf('cycle').label, '周期时段')
})

test('裁决键是封闭集合且参数化：每个层的键有 mode，落在目录内', () => {
  const values = KEY_TYPES.map(k => k.value)
  for (const t of allTiers) {
    assert.ok(values.includes(t.key.type), `层 ${t.id} 用了目录外的键 ${t.key.type}`)
    assert.ok(keyModeOf(t.key), `层 ${t.id} 的键 ${t.key.type} 缺 mode`)
    assert.ok((keyTypeOf(t.key.type).modes || []).some(m => m.value === t.key.mode), `层 ${t.id} 的 mode 越界`)
  }
  // 六类键在种子里全部出现 —— 表达力证明
  for (const v of values) assert.ok(allTiers.some(t => t.key.type === v), `没有任何层使用键 ${v}`)
})

test('键的文字摘要由参数自动生成（不是自由文本）：六类键都能产出可读摘要', () => {
  for (const t of allTiers) {
    const text = keyDetail(t.key)
    assert.ok(text && text !== '未配置完整', `层 ${t.id} 的键摘要生成失败`)
  }
  const perf = allTiers.find(t => t.key.type === 'perf' && t.key.mode === 'composite')
  assert.ok(keyDetail(perf.key).includes('40') && keyDetail(perf.key).includes('破平'), '综合分摘要应包含权重与破平键')
  const rot = allTiers.find(t => t.key.type === 'state')
  assert.ok(keyDetail(rot.key).includes('早班') && keyDetail(rot.key).includes('上一周期'), '轮转摘要应包含顺序与锚点')
})

test('综合分权重合计必须 = 100；轮转顺序非空', () => {
  for (const t of allTiers.filter(t => t.key.type === 'perf' && t.key.mode === 'composite')) {
    const sum = t.key.params.metrics.reduce((a, m) => a + m.weight, 0)
    assert.equal(sum, 100, `层 ${t.id} 权重合计 ${sum}`)
  }
  for (const t of allTiers.filter(t => t.key.type === 'state')) {
    assert.ok(t.key.params.order.length >= 2, `层 ${t.id} 轮转顺序至少两班`)
  }
})

test('层结构完整：有人群、必选层不用可选键裁决', () => {
  for (const t of allTiers) {
    assert.ok((t.crowds || []).length, `层 ${t.id} 没有候选人群`)
    assert.ok(['right', 'duty'].includes(t.obligation))
    if (t.obligation === 'duty') {
      const firstCome = t.key.type === 'time' && t.key.mode === 'first'
      assert.ok(!firstCome, '必选层不能用先到先得裁决（按资历指派的入职/签约早晚可以）')
    }
  }
})

test('时刻全部结构化，没有自由文本：窗口是锚点对象，层是锚点+时刻对象', () => {
  for (const s of slotSeeds) {
    for (const w of s.windows) {
      assert.equal(typeof w.openAt, 'object', `窗口 ${w.id} 的开放时刻还是文本`)
      assert.ok(WINDOW_ANCHORS.some(a => a.value === w.openAt.anchor), `窗口 ${w.id} 锚点越界`)
      if (w.openAt.anchor === 'weekly') {
        assert.ok(w.openAt.weekday >= 0 && w.openAt.weekday <= 6, `窗口 ${w.id} 缺星期`)
        assert.ok(parseOpenTime(w.openAt.time), `窗口 ${w.id} 时刻非法`)
      }
      if (w.openAt.anchor === 'monthly') {
        assert.ok(w.openAt.day >= 1 && w.openAt.day <= 28, `窗口 ${w.id} 缺日期`)
        assert.ok(parseOpenTime(w.openAt.time), `窗口 ${w.id} 时刻非法`)
      }
    }
  }
  for (const t of allTiers) {
    assert.equal(t.openAt.point, undefined, `层 ${t.id} 仍残留 point 字段`)
    assert.ok(OPEN_ANCHORS.some(a => a.value === t.openAt.anchor), `层 ${t.id} 锚点越界`)
    const a = OPEN_ANCHORS.find(x => x.value === t.openAt.anchor)
    if (!a.fixed) assert.ok(parseOpenTime(t.openAt.time), `层 ${t.id} 时刻缺填或非法`)
  }
  assert.equal(windowOpenLabel({ anchor: 'weekly', weekday: 4, time: '06:00' }), '每周四 06:00')
  assert.equal(windowOpenLabel({ anchor: 'monthly', day: 25, time: '09:00' }), '每月 25 日 09:00')
  assert.equal(windowOpenLabel({ anchor: 'publish' }), '发布即开放')
})

test('跨日时刻可用且自动归一：3 天前 25:00 = 2 天前 01:00；48:00 拒收', () => {
  assert.deepEqual(parseOpenTime('25:00'), { h: 25, m: 0 })
  assert.equal(parseOpenTime('48:00'), null, 'HH 上限 47')
  assert.equal(parseOpenTime('7:5'), null)
  assert.equal(
    openAtLabel({ anchor: 'd3', time: '25:00' }),
    '排班日 3 天前 25:00（= 排班日 2 天前 01:00）'
  )
  assert.equal(openAtLabel({ anchor: 'd1', time: '06:00' }), '排班日 1 天前 06:00')
  assert.equal(openAtLabel({ anchor: 'window', offsetH: 3 }), '窗口开放即 +3h')
  assert.equal(openAtLabel({ anchor: 'publish' }), '发布即开放')
})

test('种子覆盖双开放模型（串行漏斗 + 并行错峰）与可选/必选班次性质，窗口重跑存在', () => {
  assert.ok(allTiers.some(t => t.openModel === 'parallel'), '缺并行（错峰）层')
  assert.ok(allTiers.some(t => t.openModel === 'serial'), '缺串行层')
  assert.ok(allTiers.some(t => t.obligation === 'duty'), '缺必选层')
  assert.ok(allTiers.some(t => t.obligation === 'right'), '缺可选层')
  const evening = byName('非全晚峰')
  const offsets = tiersOf(evening).filter(t => t.openModel === 'parallel').map(t => t.openAt.offsetH)
  assert.deepEqual(offsets, [0, 3, 6], '错峰阶梯 0/3/6')
  const rerun = slotSeeds.flatMap(s => s.windows).filter(w => w.rerunNote?.trim())
  assert.ok(rerun.some(w => w.rerunNote.includes('落选')), '没有任何重跑窗口')
})

test('物理容量与岗位配额分两层：晚峰名额=3（数字+口径说明），层配额=签约人数÷2', () => {
  const evening = byName('非全晚峰')
  assert.equal(evening.capacity.value, 3)
  assert.ok(evening.capacity.note, '名额带口径说明（为什么是这个数）')
  assert.equal(evening.capacity.source, undefined, '名额来源下拉已删除——不参与计算的字段不冒充规则')
  const ratio = tiersOf(evening).find(t => t.quota.mode === 'ratio')
  assert.equal(ratio.quota.base, '门店签约非全人数')
  assert.equal(ratio.quota.divisor, 2)
  assert.equal(quotaLabel(ratio.quota), '门店签约非全人数÷2')
})

test('周期时段带星期维度，临时时段不带', () => {
  for (const s of slotSeeds.filter(s => s.kind === 'cycle')) {
    assert.ok((s.days || []).length, `周期时段 ${s.id} 没有生效星期`)
    assert.ok(s.days.every(d => d >= 0 && d <= 6), `周期时段 ${s.id} 星期越界`)
  }
  for (const s of slotSeeds.filter(s => s.kind === 'temp')) {
    assert.equal((s.days || []).length, 0, `临时时段 ${s.id} 不应有星期维度（只看日期）`)
  }
})

test('业务句子由结构生成：每层一句话，整条链以「漏完怎么办」收尾', () => {
  for (const t of allTiers) {
    const s = tierSentence(t)
    assert.ok(s.includes((t.crowds || [])[0] || ''), `层 ${t.id} 句子缺人群：${s}`)
    assert.ok(!/裁决键|配额|锚点|开放模型/.test(s), `层 ${t.id} 句子泄漏了配置术语：${s}`)
  }
  const evening = byName('非全晚峰')
  assert.ok(tierSentence(tiersOf(evening)[0]).includes('先到先得'))
  assert.ok(tierSentence(tiersOf(evening)[0]).includes('签约非全人数÷2'))
  const bidding = cont('P-01').find(s => s.windows.length === 2)
  assert.ok(tierSentence(bidding.windows[0].tiers[0]).includes('综合分竞标'))
  const flow = slotFlow(bidding)
  assert.ok(flow.includes('→') && flow.includes('漏完'), `整条链应带箭头和漏完：${flow}`)
  assert.ok(tierShort(tiersOf(evening)[4]).includes('最早签约'))
})

test('时段摘要与一行摘要、枚举回显', () => {
  const evening = byName('非全晚峰')
  assert.equal(slotSummary(evening), '1 窗口 · 5 层 · 2 必选')
  const bidding = cont('P-01').find(s => s.windows.length === 2)
  assert.equal(slotSummary(bidding), '2 窗口 · 3 层 · 1 必选')
  const t = allTiers.find(t => t.key.type === 'state')
  assert.ok(tierOneLine(t).includes('全日制客户经理'))
  assert.ok(tierOneLine(t).includes('状态键'))
  assert.equal(keyTypeOf('perf').label, '绩效键')
  assert.equal(obligationOf('duty').label, '必选')
  assert.equal(obligationOf('duty').hint, '被安排即必须拥有该时段，只发通知、不接受拒绝')
  assert.equal(openModelOf('parallel').label, '并行')
  assert.ok(OPEN_ANCHORS.some(a => a.value === 'window'))
})

test('空白起点：挂本容器班次，可带类型；净工时从班次解析；生成/领取有默认值', () => {
  const b = blankSlot('P-03', 'PS-301', 'temp')
  assert.equal(b.shiftId, 'PS-301')
  assert.equal(shiftOf(b).name, '行政班')
  assert.equal(shiftOf(b).start, '09:00')
  assert.equal(b.kind, 'temp')
  assert.equal(b.date, '')
  assert.equal(b.generation, null, '临时时段无生成规则（发布即铺名额）')
  assert.equal(netHours(b), 8)
  const tier = b.windows[0].tiers[0]
  assert.deepEqual(tier.crowds, [])
  assert.ok(keyModeOf(tier.key), '空白层的键应默认完整')
  assert.ok(CONTAINERS.length >= 4)
  assert.ok(CONTAINER_SHIFTS.some(sh => sh.templateId === null), '班次库里有门店自建班次')
  const bc = blankSlot('P-01', 'PS-101', 'cycle')
  assert.equal(genShort(bc.generation), '每周四 06:00', '周期空白起点默认每周四 06:00 生成')
})

test('容器：类型是封闭集合（门店/办公地点/城市/人），时段挂已有容器', () => {
  assert.deepEqual(CONTAINER_TYPES.map(t => t.value), ['store', 'office', 'city', 'person'])
  for (const s of slotSeeds) {
    const c = findContainer(s.containerId)
    assert.ok(c, `时段 ${s.id} 挂的容器不存在`)
    assert.ok(CONTAINER_TYPES.some(t => t.value === c.type), `容器 ${c.id} 类型越界`)
  }
  // 同类型多容器：两个门店容器，归属标签 = 类型 + id
  const stores = CONTAINERS.filter(c => c.type === 'store')
  assert.ok(stores.length >= 2, '门店只是容器类型之一，应存在多个门店容器')
})

test('生成规则结构化：铺出的是名额实例，不是排班结果；周期有、临时无', () => {
  for (const s of slotSeeds.filter(s => s.kind === 'cycle')) {
    const g = s.generation
    assert.ok(GEN_CADENCES.some(c => c.value === g.cadence) && g.cadence !== 'manual', `时段 ${s.id} 生成节奏非法`)
    if (g.cadence === 'weekly') {
      assert.ok(g.weekday >= 0 && g.weekday <= 6 && parseOpenTime(g.time), `时段 ${s.id} 每周生成缺星期或时刻`)
    } else {
      assert.ok(g.day >= 1 && g.day <= 28 && parseOpenTime(g.time), `时段 ${s.id} 每月生成缺日期或时刻`)
    }
    assert.ok(GEN_HORIZONS.some(h => h.value === g.horizon), `时段 ${s.id} 生成视野越界`)
    assert.equal(g.idempotent, true, `时段 ${s.id} 应幂等（重复跑结果一致）`)
  }
  for (const s of slotSeeds.filter(s => s.kind === 'temp')) {
    assert.equal(s.generation, null, `临时时段 ${s.id} 不应有生成规则`)
  }
  // 业务出处：行政班按自然月整月铺；非全晚峰每周四只出下一批
  const admin = byName('行政班')
  assert.equal(admin.generation.cadence, 'monthly')
  assert.equal(admin.generation.horizon, 'month')
  const evening = byName('非全晚峰')
  assert.equal(evening.generation.cadence, 'weekly')
  assert.equal(evening.generation.horizon, 'n1')
  assert.equal(genShort(evening.generation), '每周四 06:00')
  assert.equal(genShort(admin.generation), '每月 25 日 09:00')
})

test('必选与兜底一致：required ⇒ 兜底 ≠ 留空；第六种兜底「留待派发」承接兜不住的场景', () => {
  for (const s of slotSeeds) {
    if (s.required) assert.notEqual(s.leftover, '留空', `必选时段 ${s.id} 的兜底不能是留空`)
    assert.ok(LEFTOVERS.includes(s.leftover), `时段 ${s.id} 兜底动作越界`)
  }
  // SL-006 临时时段：没人接留待派发、不回收（真实业务口径）
  const temp = slotSeeds.find(s => s.kind === 'temp')
  assert.equal(temp.leftover, '留待派发')
  // SL-004 储备兜不住 → 留待派发
  const lushan = slotSeeds.find(s => s.shiftId === 'PS-201')
  assert.equal(lushan.leftover, '留待派发')
})

test('领取约束：粒度 + 个人单日上限有模型位置（非全 4h 硬拦的落点）', () => {
  assert.deepEqual(CLAIM_GRANULARITY.map(g => g.value), ['whole', 'split'])
  for (const s of slotSeeds) {
    assert.ok(CLAIM_GRANULARITY.some(g => g.value === s.claim?.granularity), `时段 ${s.id} 领取粒度越界`)
    if (s.claim.granularity === 'split') assert.ok(s.claim.minHours > 0, `时段 ${s.id} 可拆分缺最少小时数`)
  }
  const evening = byName('非全晚峰')
  assert.equal(evening.claim.perDay, 4, '非全晚峰单日累计 4 小时硬拦')
  assert.equal(claimShort(evening.claim), '整段领取 · 单日 ≤ 4h')
  assert.equal(claimShort({ granularity: 'whole' }), '整段领取')
})
