// 时段与名额 v2 —— 五岗位拟合验证（只验证，不改模型）
// 只 import 纯数据模块；用现有词表装配各岗位的排班配置，
// 能表达的断言成立，表达不了的把空洞记录成断言（模型欠账清单）。
import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  KEY_TYPES, OPEN_ANCHORS, WINDOW_ANCHORS, OBLIGATIONS, OPEN_MODELS, QUOTA_MODES, CROWDS,
  GEN_CADENCES, GEN_HORIZONS, CLAIM_GRANULARITY, LEFTOVERS,
  keyModeOf, parseOpenTime, netHours,
  tierSentence, slotFlow, blankSlot
} from '../src/mock/slotModel.js'

/* ---- 本地纯校验（镜像 store 规则，测试不依赖 vue）----
 * 拟合夹具直接带 name/start/end（等价于一条班次），不经过容器班次库解析。 */
const validatePure = slot => {
  if (!slot.name?.trim()) return '未挂班次（无名称）'
  if (netHours(slot) <= 0) return '净工时非法'
  if (!(slot.capacity?.value > 0)) return '名额非法'
  if (slot.kind === 'temp' && !slot.date) return '临时缺日期'
  if (slot.kind === 'cycle' && !(slot.days || []).length) return '周期缺星期'
  if (slot.kind === 'cycle') {
    const g = slot.generation || {}
    if (!GEN_CADENCES.some(c => c.value === g.cadence) || g.cadence === 'manual') return '生成节奏非法'
    if (g.cadence === 'weekly' && !(g.weekday >= 0 && g.weekday <= 6 && parseOpenTime(g.time))) return '每周生成缺星期/时刻'
    if (g.cadence === 'monthly' && !(g.day >= 1 && g.day <= 28 && parseOpenTime(g.time))) return '每月生成缺日期/时刻'
    if (!GEN_HORIZONS.some(h => h.value === g.horizon)) return '生成视野越界'
  }
  if (!CLAIM_GRANULARITY.some(x => x.value === slot.claim?.granularity)) return '领取粒度越界'
  if (slot.claim?.granularity === 'split' && !(slot.claim.minHours > 0)) return '可拆分缺最少小时数'
  if (slot.required && slot.leftover === '留空') return '必选时段兜底不能留空'
  if (!LEFTOVERS.includes(slot.leftover)) return '兜底动作越界'
  for (const w of slot.windows || []) {
    const wa = WINDOW_ANCHORS.find(a => a.value === w.openAt?.anchor)
    if (!wa) return `窗口 ${w.id} 锚点越界`
    if ((wa.value === 'weekly' || wa.value === 'monthly') && !parseOpenTime(w.openAt.time)) return `窗口 ${w.id} 时刻非法`
    if (!(w.tiers || []).length) return `窗口 ${w.label} 无层`
    for (const t of w.tiers) {
      if (!(t.crowds || []).length) return '层缺人群'
      if (!keyModeOf(t.key)) return `层 ${t.id} 键不完整`
      if (!(t.quota && QUOTA_MODES.some(q => q.value === t.quota.mode))) return `层 ${t.id} 配额模式越界`
      if (!OBLIGATIONS.some(o => o.value === t.obligation)) return `层 ${t.id} 义务性越界`
      if (!OPEN_MODELS.some(m => m.value === t.openModel)) return `层 ${t.id} 开放模型越界`
      const oa = OPEN_ANCHORS.find(a => a.value === t.openAt?.anchor)
      if (!oa) return `层 ${t.id} 开放锚点越界`
      if (!oa.fixed && !parseOpenTime(t.openAt.time)) return `层 ${t.id} 时刻非法`
      if (t.obligation === 'duty' && t.key.type === 'time' && t.key.mode === 'first') return '义务层禁先到先得'
    }
  }
  return ''
}

const tier = (id, crowds, key, quota, obligation, openAt, openModel, note = '') =>
  ({ id, crowds, key, quota, obligation, openAt, openModel, note })

const WIN = (id, label, anchor, extra, rerunNote = '', tiers = []) =>
  ({ id, label, openAt: { anchor, ...extra }, rerunNote, tiers })

/* ============================================================
 * ① 全职客户经理：早↔晚轮转（义务）+ 储备缺口补位（义务）
 * ============================================================ */
const ftAM = {
  id: 'FIT-AM', containerId: 'P-02', kind: 'cycle', date: '', days: [1, 2, 3, 4, 5, 6, 0],
  templateId: 'TPL-01', name: '早班', start: '10:00', end: '18:00', breakMin: 60,
  required: true,
  capacity: { note: '配置人数（1 人店）', value: 1 },
  generation: { cadence: 'weekly', weekday: 4, time: '06:00', horizon: 'n1', idempotent: true },
  claim: { granularity: 'whole', minHours: 0, perDay: 0 },
  leftover: '留待派发', leftoverNote: '缺岗由储备兜底；兜不住时留待派发（名额保留不回收）',
  windows: [
    WIN('W-A1', '主窗口', 'weekly', { weekday: 4, time: '06:00' }, '', [
      tier('FT-AM-1', ['全日制客户经理'],
        { type: 'state', mode: 'rotate', params: { order: ['早班', '晚班'], anchor: '上一周期已发布排班' } },
        { mode: 'count', value: 1 }, 'duty',
        { anchor: 'window', time: '', offsetH: 0 }, 'serial',
        '本周上什么班由上周决定'),
      tier('FT-AM-2', ['储备客户经理'],
        { type: 'relation', mode: 'sign', params: {} },
        { mode: 'count', value: 1 }, 'duty',
        { anchor: 'window', time: '', offsetH: 0 }, 'serial',
        '有效在岗数 < 配置数才触发；无缺口时储备自转')
    ])
  ]
}

/* ============================================================
 * ② 全职推拿师：周四竞标（绩效键 + 名额按业绩算）→ 周五重跑先到先得 → 系统派通班
 * ============================================================ */
const ftMasseur = {
  id: 'FIT-MA', containerId: 'P-01', kind: 'cycle', date: '', days: [1, 2, 3, 4, 5, 6, 0],
  templateId: 'TPL-01', name: '早班', start: '10:00', end: '18:00', breakMin: 60,
  required: true,
  capacity: { note: '传位数', value: 6 },
  generation: { cadence: 'weekly', weekday: 4, time: '06:00', horizon: 'n1', idempotent: true },
  claim: { granularity: 'whole', minHours: 0, perDay: 0 },
  leftover: '生成通班', leftoverNote: '周四没操作 / 周五被挤出 / 抢不到 → 通班',
  windows: [
    WIN('W-M1', '竞标窗口', 'weekly', { weekday: 4, time: '06:00' }, '', [
      tier('FT-MA-1', ['全日制推拿师'],
        { type: 'perf', mode: 'composite',
          params: { metrics: [{ name: '产值', weight: 40 }, { name: '回头率', weight: 30 }, { name: '预约率', weight: 30 }], tiebreak: '回头率' } },
        { mode: 'algo' }, 'right',
        { anchor: 'window', time: '', offsetH: 0 }, 'serial',
        '按以往周期业绩自动审核，超额才排序，末位挤出')
    ]),
    WIN('W-M2', '重跑窗口', 'weekly', { weekday: 5, time: '00:00' }, '上一窗口落选者自动进入', [
      tier('FT-MA-2', ['全日制推拿师'], { type: 'time', mode: 'first', params: {} }, { mode: 'all' }, 'right',
        { anchor: 'window', time: '', offsetH: 0 }, 'serial', '周五再抢有名额的班次'),
      tier('FT-MA-3', ['全日制推拿师'], { type: 'none', mode: 'direct', params: {} }, { mode: 'all' }, 'duty',
        { anchor: 'd1', time: '06:00', offsetH: 0 }, 'serial', '抢不到的由系统收尾')
    ])
  ]
}

/* ============================================================
 * ③ 非全推拿师：档位累计开放（0h / +3h）+ 配额签约人数÷2 + 系统派兜底
 * ============================================================ */
const ptMasseur = {
  id: 'FIT-PM', containerId: 'P-01', kind: 'cycle', date: '', days: [1, 2, 3, 4, 5, 6, 0],
  templateId: 'TPL-06', name: '非全晚峰', start: '19:00', end: '21:00', breakMin: 0,
  required: true,
  capacity: { note: '传位数', value: 3 },
  generation: { cadence: 'weekly', weekday: 4, time: '06:00', horizon: 'n1', idempotent: true },
  claim: { granularity: 'whole', minHours: 0, perDay: 4 },
  leftover: '转临时时段', leftoverNote: '消化不完转临时时段补人',
  windows: [
    WIN('W-P1', '主窗口（错峰开放）', 'weekly', { weekday: 4, time: '06:00' }, '', [
      tier('PT-PM-1', ['非全推拿师'], { type: 'time', mode: 'first', params: {} },
        { mode: 'ratio', base: '门店签约非全人数', divisor: 2 }, 'right',
        { anchor: 'window', time: '', offsetH: 0 }, 'parallel', '必选时段名额 = 签约人数 ÷ 2'),
      tier('PT-PM-2', ['非全推拿师'], { type: 'time', mode: 'first', params: {} },
        { mode: 'all' }, 'right',
        { anchor: 'window', time: '', offsetH: 3 }, 'parallel', '错峰 +3h，窗口开了不关'),
      tier('PT-PM-3', ['非全推拿师', '非全客户经理'], { type: 'relation', mode: 'sign', params: {} },
        { mode: 'all' }, 'duty',
        { anchor: 'd1', time: '06:00', offsetH: 0 }, 'serial', '系统指派，只发通知、直接待到店')
    ])
  ]
}

/* ============================================================
 * ④ 非全客户经理：自己档位先领 + 合并竞争（+6h 进入推拿师晚峰）+ 点名派
 * ============================================================ */
const ptAM = {
  id: 'FIT-PAM', containerId: 'P-01', kind: 'cycle', date: '', days: [1, 2, 3, 4, 5, 6, 0],
  templateId: 'TPL-06', name: '非全晚峰', start: '19:00', end: '21:00', breakMin: 0,
  required: true,
  capacity: { note: '传位数', value: 3 },
  generation: { cadence: 'weekly', weekday: 4, time: '06:00', horizon: 'n1', idempotent: true },
  claim: { granularity: 'whole', minHours: 0, perDay: 4 },
  leftover: '转临时时段', leftoverNote: '消化不完转临时时段补人',
  windows: [
    WIN('W-PA1', '客户经理档位', 'weekly', { weekday: 4, time: '06:00' }, '', [
      tier('PT-AM-1', ['非全客户经理'], { type: 'time', mode: 'first', params: {} },
        { mode: 'ratio', base: '门店签约非全人数', divisor: 2 }, 'right',
        { anchor: 'window', time: '', offsetH: 6 }, 'parallel', '错峰 +6h 后与本店推拿师合并竞争剩余名额'),
      tier('PT-AM-2', ['非全推拿师', '非全客户经理'], { type: 'manual', mode: 'assign', params: {} },
        { mode: 'count', value: 1 }, 'duty',
        { anchor: 'window', time: '', offsetH: 0 }, 'serial', '运营点名，只派名单，人数 = 选中人数')
    ])
  ]
}

/* ============================================================
 * ⑤ 产品经理（模拟岗位）：行政班，编制 2，无竞争系统直接安排，缺编走招聘
 * ============================================================ */
const pm = {
  id: 'FIT-PROD', containerId: 'P-03', kind: 'cycle', date: '', days: [1, 2, 3, 4, 5],
  templateId: 'TPL-05', name: '行政班', start: '09:00', end: '18:00', breakMin: 60,
  required: false,
  capacity: { note: '编制数', value: 2 },
  generation: { cadence: 'monthly', day: 25, time: '09:00', horizon: 'month', idempotent: true },
  claim: { granularity: 'whole', minHours: 0, perDay: 0 },
  leftover: '触发招聘', leftoverNote: '职能岗缺编走招聘不走排班',
  windows: [
    WIN('W-PR1', '生成窗口', 'monthly', { day: 25, time: '09:00' }, '', [
      tier('PM-1', ['产品经理'], { type: 'none', mode: 'direct', params: {} },
        { mode: 'all' }, 'duty',
        { anchor: 'publish', time: '', offsetH: 0 }, 'serial', '默认在岗，无竞争')
    ])
  ]
}

const FITS = { 全职客户经理: ftAM, 全职推拿师: ftMasseur, 非全推拿师: ptMasseur, 非全客户经理: ptAM, 产品经理: pm }

/* ============================================================
 * 验证 1：五岗位全部用现有词表装配成功（零新增机制）
 * ============================================================ */
test('五岗位拟合：全部通过纯校验，键/锚点/配额/义务/开放模型均落在现有目录内', () => {
  for (const [name, slot] of Object.entries(FITS)) {
    const err = validatePure(slot)
    assert.equal(err, '', `${name} 装配失败：${err}`)
    for (const t of slot.windows.flatMap(w => w.tiers)) {
      assert.ok(KEY_TYPES.some(k => k.value === t.key.type), `${name} 键类型越界`)
    }
  }
})

/* ============================================================
 * 验证 2：逐岗位的业务关键点必须能被字段表达
 * ============================================================ */
test('全职客户经理：轮转是状态键 + 义务；储备补位是关系键 + 义务', () => {
  const [rotate, reserve] = ftAM.windows[0].tiers
  assert.equal(rotate.key.type, 'state')
  assert.deepEqual(rotate.key.params.order, ['早班', '晚班'])
  assert.equal(rotate.key.params.anchor, '上一周期已发布排班')
  assert.equal(rotate.obligation, 'duty', '轮转班必须上，是义务')
  assert.equal(reserve.key.type, 'relation')
  assert.equal(reserve.obligation, 'duty')
  assert.ok(tierSentence(rotate).includes('轮转'), '业务句子能说清轮转')
})

test('全职推拿师：双窗口（竞标 → 落选重跑 → 系统收尾）', () => {
  assert.equal(ftMasseur.windows.length, 2)
  const [bid, rerun] = ftMasseur.windows
  assert.equal(bid.tiers[0].key.mode, 'composite')
  assert.equal(bid.tiers[0].quota.mode, 'algo', '名额按业绩算')
  assert.equal(rerun.openAt.anchor, 'weekly')
  assert.equal(rerun.openAt.weekday, 5, '周五重跑')
  assert.ok(rerun.rerunNote.includes('落选'))
  assert.equal(rerun.tiers[1].obligation, 'duty', '抢不到的收尾是义务')
  assert.ok(slotFlow(ftMasseur).includes('漏完生成通班'))
})

test('非全推拿师：错峰 0/+3 并行累计开放，配额 = 签约人数÷2', () => {
  const [t1, t2, fallback] = ptMasseur.windows[0].tiers
  assert.deepEqual([t1.openAt.offsetH, t2.openAt.offsetH], [0, 3])
  assert.equal(t1.openModel, 'parallel')
  assert.equal(t2.openModel, 'parallel', '窗口开了不关，先开层继续可领')
  assert.equal(t1.quota.mode, 'ratio')
  assert.equal(fallback.obligation, 'duty', '系统指派兜底是义务')
})

test('非全客户经理：+6h 错峰合并竞争 + 点名派（人工键）', () => {
  const [merge, manual] = ptAM.windows[0].tiers
  assert.equal(merge.openAt.offsetH, 6)
  assert.equal(merge.key.mode, 'first')
  assert.equal(manual.key.type, 'manual')
  assert.equal(manual.quota.mode, 'count')
  assert.equal(manual.obligation, 'duty', '点名派直接待到店')
})

test('产品经理：无竞争义务层 + 编制容量 + 缺编走招聘；人群是开放枚举，加词即用', () => {
  assert.ok(!CROWDS.includes('产品经理'), '人群字典没有产品经理 —— 证明它是开放枚举')
  const t = pm.windows[0].tiers[0]
  assert.equal(t.key.type, 'none')
  assert.equal(t.obligation, 'duty')
  assert.equal(pm.capacity.note, '编制数')
  assert.equal(pm.leftover, '触发招聘')
  assert.ok(tierSentence(t).includes('系统直接安排'))
  assert.equal(pm.generation.cadence, 'monthly', '职能岗按月生成')
  assert.equal(pm.generation.horizon, 'month', '职能岗一次铺整月')
})

test('生成的是名额实例：五个岗位都有结构化生成规则；结果记录直写（范围限定）不入模型', () => {
  for (const slot of Object.values(FITS)) {
    const g = slot.generation
    assert.ok(GEN_CADENCES.some(c => c.value === g.cadence), `${slot.id} 生成节奏越界`)
    assert.ok(GEN_HORIZONS.some(h => h.value === g.horizon), `${slot.id} 生成视野越界`)
    // 重构范围限定：排班结果记录的写入链路不变（直接接受写入），
    // 所以模型里没有「结果记录」实体 —— 名额消化完成即直写，这是有意的缺席而非遗漏。
    assert.ok(!('resultRecord' in slot) && !('writeBack' in slot), `${slot.id} 不应携带结果记录字段`)
  }
})

/* ============================================================
 * 验证 3：暴露的空洞（只记录，不修改）—— 模型欠账清单
 * ============================================================ */
test('空洞①：层没有「触发条件」字段——储备只在有效在岗数 < 编制时才进入', () => {
  const reserve = ftAM.windows[0].tiers[1]
  assert.ok(!('when' in reserve) && !('trigger' in reserve) && !('condition' in reserve),
    '确认：模型没有触发条件字段')
  assert.ok(reserve.note.includes('有效在岗数'), '这个业务规则目前只能住在 note 文案里')
})

test('空洞②：配额 ratio 的基数是自由文本，没有结构化数据来源', () => {
  const q = ptMasseur.windows[0].tiers[0].quota
  assert.equal(q.mode, 'ratio')
  assert.equal(typeof q.base, 'string', '基数是字符串（门店签约非全人数）')
  assert.ok(!('baseRef' in q) && !('source' in q), '确认：没有指向数据源的字段')
})

test('空洞③：quota algo 无参数——「业绩审核达标线」无处安放', () => {
  const q = ftMasseur.windows[0].tiers[0].quota
  assert.equal(q.mode, 'algo')
  assert.ok(!q.params && !q.metric && !q.threshold, '确认：algo 模式没有任何参数位')
})

test('空洞④：承接资格（六项资格）不在层定义里——人群只有岗位标签', () => {
  const t = ptMasseur.windows[0].tiers[0]
  assert.deepEqual(t.crowds, ['非全推拿师'])
  assert.ok(!('requirement' in t) && !('qualify' in t), '确认：层上没有资格条件字段')
})

test('空白起点可以直接承载四类岗位中的任意一类（班次 + 类型 + 天数可调）', () => {
  const b = blankSlot('P-01', 'PS-101', 'cycle')
  assert.equal(b.shiftId, 'PS-101')
  b.kind = 'cycle'
  b.capacity = { note: '', value: 2 }
  b.days = [1, 2, 3, 4, 5, 6, 0]
  b.windows[0].tiers[0].crowds = ['非全推拿师']
  assert.equal(validatePure({ ...b, name: '早班', start: '10:00', end: '18:00', breakMin: 60 }), '', '空白起点补齐班次字段后可直接装配')
})
