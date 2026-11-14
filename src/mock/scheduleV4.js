/**
 * 排班策略 v4 —— 数据与能力引擎
 *
 * 设计基线（2026-11-13 用户陈述）：
 *  1. 空间是排班的承接单位，但现实对照要贴企业可识别标签（门店 / 办公区…），并支持企业级搜索
 *  2. 标准时间只是「尺子」——不约束时段，只用来量超出多少（超出即加班）
 *  3. 名额来源两条：人工固定 / 算法能力（Agent 基于企业原子能力创建，出初始值）
 *  4. 名额可跨岗位按有序档位使用（A 优先 → B → C 兜底），档位层数动态
 *  5. 资格 → 申领 → 分配 → 名额到人才写排班结果表
 *  6. 逆向（请假 / 取消 / 转移 / 补位）不在这里，归事件系统编排（见 scheduleV4Events.js）
 */

export const pad2 = n => String(n).padStart(2, '0')
export const timeMin = t => {
  const [h, m] = String(t || '00:00').split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}
export const minTime = n => `${pad2(Math.floor(n / 60))}:${pad2(n % 60)}`
export const dateOf = s => new Date(`${s}T00:00:00`)
export const fmtDate = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
export const addDays4 = (s, n) => {
  const d = dateOf(s)
  d.setDate(d.getDate() + n)
  return fmtDate(d)
}
export const weekday4 = s => dateOf(s).getDay()
export const weekdayLabel4 = s => ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][weekday4(s)]

/* ---- ① 空间：抽象实体 + 企业标签 + 可检索 ---- */
export const V4_SPACE_TAGS = ['门店', '办公区', '仓库', '前置仓']
export const V4_SPACES = [
  {
    id: 'SP-01', name: '兴隆湖店', tag: '门店', city: '成都',
    address: '成都市天府新区兴隆湖 3 号', bizStart: '09:00', bizEnd: '22:00', seats: 4,
    avgMin: [320, 280], note: '两日均服务分钟数用于名额算法'
  },
  {
    id: 'SP-02', name: '麓山店', tag: '门店', city: '成都',
    address: '成都市双流区麓山大道 88 号', bizStart: '10:00', bizEnd: '21:00', seats: 3,
    avgMin: [240, 260], note: '1~2 人店，客户经理按倒班走'
  },
  {
    id: 'SP-03', name: '总部办公区', tag: '办公区', city: '成都',
    address: '成都市高新区天府三街 199 号 12F', bizStart: '08:30', bizEnd: '19:00', seats: 0,
    avgMin: [420, 400], note: '一个空间里多类人，各有自己的标准时间'
  },
  {
    id: 'SP-04', name: '重庆解放碑店', tag: '门店', city: '重庆',
    address: '重庆市渝中区民权路 28 号', bizStart: '10:00', bizEnd: '22:00', seats: 3,
    avgMin: [200, 220], note: '跨城：搜索按城市可命中'
  }
]

/* ---- ② 岗位 ---- */
export const V4_POSITIONS = [
  { id: 'PS-01', name: '推拿师', family: '技术' },
  { id: 'PS-02', name: '客户经理', family: '运营' },
  { id: 'PS-03', name: '保洁', family: '后勤' },
  { id: 'PS-04', name: '客服专员', family: '运营' }
]

/* ---- ③ 标准时间：尺子，不约束时段 ---- */
export const V4_RULERS = [
  { id: 'RU-01', spaceId: 'SP-01', positionId: 'PS-01', segs: [{ start: '10:00', end: '22:00', label: '门店营业' }], note: '营业时段即标准在岗' },
  { id: 'RU-02', spaceId: 'SP-01', positionId: 'PS-02', segs: [{ start: '10:00', end: '22:00', label: '门店营业' }], note: '跟营业时间' },
  { id: 'RU-03', spaceId: 'SP-02', positionId: 'PS-01', segs: [{ start: '10:00', end: '21:00', label: '门店营业' }], note: '跟营业时间' },
  { id: 'RU-04', spaceId: 'SP-02', positionId: 'PS-02', segs: [{ start: '10:00', end: '21:00', label: '门店营业' }], note: '跟营业时间' },
  { id: 'RU-05', spaceId: 'SP-03', positionId: 'PS-04', segs: [{ start: '09:00', end: '18:00', label: '行政标准班' }], note: '客服白天按行政班；夜班是超出尺子的部分' },
  { id: 'RU-06', spaceId: 'SP-03', positionId: 'PS-03', segs: [{ start: '08:30', end: '12:00', label: '上午保洁' }], note: '保洁按上午半段' },
  { id: 'RU-07', spaceId: 'SP-03', positionId: 'PS-01', segs: [{ start: '09:00', end: '18:00', label: '驻场技师' }], note: '办公室驻场技师跟行政班' },
  { id: 'RU-08', spaceId: 'SP-04', positionId: 'PS-01', segs: [{ start: '10:00', end: '22:00', label: '门店营业' }], note: '跟营业时间' }
]

/* ---- ④ 名额算法能力：Agent 基于企业原子能力创建，必须能解释自己怎么算的 ---- */
export const V4_ALGOS = [
  {
    id: 'AG-01', name: '天均分钟数阈值法', kind: '空间指标',
    basedOn: ['上周四门店天均服务分钟数', '上上周四门店天均服务分钟数'],
    note: '两日均值 ÷ 单班分钟数 × 坐席数，向上取整；不足 1 个按 1 个',
    calc: ctx => {
      const sp = ctx.space
      const avg = Math.round((sp.avgMin[0] + sp.avgMin[1]) / 2)
      const per = Math.max(60, timeMin(ctx.form.end) - timeMin(ctx.form.start))
      const raw = (avg / per) * (sp.seats || 1)
      return { value: Math.max(1, Math.ceil(raw)), expr: `(${sp.avgMin[0]}+${sp.avgMin[1]})÷2 = ${avg} 分 ÷ 单班 ${per} 分 × ${sp.seats || 1} 座 = ${raw.toFixed(2)} → 向上取整 ${Math.max(1, Math.ceil(raw))}` }
    }
  },
  {
    id: 'AG-02', name: '签约人数平分法', kind: '人员数量',
    basedOn: ['该空间该岗位签约非全人数'],
    note: '签约数 ÷ 2，向上取整，没有其他规则',
    calc: ctx => {
      const n = ctx.people.filter(p => p.spaceId === ctx.spaceId && p.positionId === ctx.positionId && p.employ === 'parttime' && p.active !== false).length
      const v = Math.max(1, Math.ceil(n / 2))
      return { value: v, expr: `签约非全 ${n} 人 ÷ 2 = ${(n / 2).toFixed(1)} → 向上取整 ${v}` }
    }
  },
  {
    id: 'AG-03', name: '营业覆盖法', kind: '空间指标',
    basedOn: ['空间营业时长', '单班时长'],
    note: '营业时长 ÷ 单班时长，向上取整；保证营业时间不断人',
    calc: ctx => {
      const sp = ctx.space
      const biz = timeMin(sp.bizEnd) - timeMin(sp.bizStart)
      const per = Math.max(60, timeMin(ctx.form.end) - timeMin(ctx.form.start))
      const raw = biz / per
      return { value: Math.max(1, Math.ceil(raw)), expr: `营业 ${biz} 分 ÷ 单班 ${per} 分 = ${raw.toFixed(2)} → 向上取整 ${Math.max(1, Math.ceil(raw))}` }
    }
  },
  {
    id: 'AG-04', name: '固定值', kind: '人工',
    basedOn: ['人工给定'],
    note: '不走算法，直接给数；人数固定的岗位用它',
    calc: ctx => {
      const v = Math.max(1, Number(ctx.plan?.quota?.value ?? 1))
      return { value: v, expr: `人工固定 ${v} 个` }
    }
  },
  {
    id: 'AG-05', name: '按剩余覆盖切分法', kind: '补位专用',
    basedOn: ['被覆盖区间时长', '单人班次上限'],
    note: '补位专用：洞有多长、单人能接多久，决定切几段；每段 1 个名额。不是算店的常驻规模',
    calc: ctx => {
      const cov = ctx.cover || {}
      const total = cov.start != null && cov.end != null
        ? cov.end - cov.start
        : Math.max(60, timeMin(ctx.form?.end) - timeMin(ctx.form?.start))
      const maxMin = Math.max(60, Number(cov.maxHours || 4) * 60)
      const segs = Math.max(1, Math.ceil(total / maxMin))
      const s = minTime(cov.start ?? 0)
      const e = minTime(cov.end ?? 0)
      return { value: 1, expr: `覆盖 ${s}–${e} 共 ${total} 分 ÷ 单人上限 ${maxMin} 分 = ${segs} 段 → 每段 1 名额` }
    }
  }
]

/* ---- ⑤ 人员 ---- */
const person = (id, name, spaceId, positionId, employ, signDate, kpi, active = true) => {
  const [out, back, book] = kpi
  return {
    id, name, spaceId, positionId, employ, signDate, active,
    kpi: { 产值: out, 回头率: back, 预约率: book },
    comp: Math.round(out * 0.4 + back * 0.35 + book * 0.25)
  }
}
export const V4_PEOPLE = [
  person('E-401', '张岚', 'SP-01', 'PS-01', 'fulltime', '2023-03-01', [95, 88, 90]),
  person('E-402', '李默', 'SP-01', 'PS-01', 'fulltime', '2023-06-12', [90, 85, 86]),
  person('E-403', '王澈', 'SP-01', 'PS-01', 'fulltime', '2024-01-08', [84, 82, 80]),
  person('E-404', '赵岚', 'SP-01', 'PS-01', 'fulltime', '2024-09-02', [76, 74, 78]),
  person('E-405', '陈夕', 'SP-01', 'PS-01', 'parttime', '2025-02-10', [70, 72, 66]),
  person('E-406', '林小满', 'SP-01', 'PS-01', 'parttime', '2025-03-18', [66, 70, 62]),
  person('E-407', '周可', 'SP-01', 'PS-01', 'parttime', '2025-06-01', [62, 64, 60]),
  person('E-408', '吴迪', 'SP-01', 'PS-01', 'parttime', '2025-08-20', [58, 60, 55]),
  person('E-409', '郑南', 'SP-01', 'PS-01', 'parttime', '2026-01-15', [54, 52, 58]),
  person('E-410', '陆远', 'SP-01', 'PS-02', 'fulltime', '2023-05-06', [88, 84, 82]),
  person('E-411', '沈青', 'SP-01', 'PS-02', 'fulltime', '2024-04-11', [80, 86, 78]),
  person('E-412', '何清', 'SP-01', 'PS-02', 'parttime', '2025-09-01', [72, 68, 70]),
  person('E-413', '苏禾', 'SP-01', 'PS-02', 'parttime', '2026-02-14', [64, 66, 62]),
  person('E-414', '单婉', 'SP-01', 'PS-02', 'parttime', '2026-04-08', [58, 60, 56]),
  person('E-420', '白露', 'SP-02', 'PS-01', 'fulltime', '2023-08-01', [86, 80, 84]),
  person('E-421', '顾南', 'SP-02', 'PS-01', 'fulltime', '2024-07-19', [78, 76, 74]),
  person('E-422', '江迟', 'SP-02', 'PS-01', 'parttime', '2025-04-02', [68, 66, 64]),
  person('E-423', '温言', 'SP-02', 'PS-01', 'parttime', '2025-11-05', [60, 62, 58]),
  person('E-424', '叶知', 'SP-02', 'PS-01', 'parttime', '2026-03-01', [56, 58, 54]),
  person('E-425', '韩野', 'SP-02', 'PS-02', 'fulltime', '2023-11-20', [90, 82, 88]),
  person('E-426', '严青', 'SP-02', 'PS-02', 'fulltime', '2025-01-06', [74, 78, 72]),
  person('E-427', '谷雨', 'SP-02', 'PS-02', 'parttime', '2026-03-15', [62, 64, 60]),
  person('E-430', '方宁', 'SP-03', 'PS-04', 'fulltime', '2023-02-14', [82, 86, 84]),
  person('E-431', '时雨', 'SP-03', 'PS-04', 'fulltime', '2024-05-20', [78, 80, 76]),
  person('E-432', '洛川', 'SP-03', 'PS-04', 'fulltime', '2024-10-09', [74, 72, 78]),
  person('E-433', '王姨', 'SP-03', 'PS-03', 'parttime', '2024-03-01', [70, 74, 68]),
  person('E-434', '李姨', 'SP-03', 'PS-03', 'parttime', '2025-05-15', [66, 70, 64]),
  person('E-435', '陈默', 'SP-03', 'PS-01', 'fulltime', '2024-06-01', [80, 78, 82]),
  person('E-440', '罗一', 'SP-04', 'PS-01', 'parttime', '2025-07-01', [64, 62, 66]),
  person('E-441', '曹二', 'SP-04', 'PS-01', 'parttime', '2025-12-01', [60, 58, 62])
]

/** 演示用的请假记录：事件「请假成功」会往这里追加 */
export const V4_LEAVES = [
  { id: 'LV-1', personId: 'E-402', date: '2026-11-17', reason: '事假（演示种子）' },
  { id: 'LV-2', personId: 'E-432', date: '2026-11-19', reason: '病假（演示种子：夜班无人可排 → 必选留空）' },
  { id: 'LV-3', personId: 'E-426', date: '2026-11-18', reason: '事假（演示种子：让韩野成为当天最后一名全职）' }
]

/* ---- ⑥ 周期计划：空间 + 岗位 + 时段形态 + 名额 + 优先序列 + 资格 + 后续处理规则 ---- */

/**
 * 班次后续处理规则（2026-11-13 定案，同日微调）：**每个时段独立配置**（form.aftercare），
 * 没单独配的继承计划默认（plan.aftercare），再兜底 DEFAULT_AFTERCARE；生成时快照到时段实例。
 *  取消：allow 是否允许自行取消 · value+unit 开班前 N 小时/分钟截止（小时≥1，分钟≥10）· mode 名额去向（release 回池再分配 / void 作废不回池）
 *  转移：allow 是否允许转给同事 · value+unit 对方接受等待期（超时自动失效，班次留原人）· samePositionOnly 是否限同岗位
 *  换班：allow 是否允许与人对调 · value+unit 对方同意等待期（超时自动失效，两边都不动）· samePositionOnly 是否要求同岗位对等
 *       换班是**双向对价**：我给出一条班次 ←→ 对方给出一条班次，两条占位原子对调，**不碰名额池**。
 * 取消与「接受转移 / 同意换班」都是事件：取消 → EV-02（ED-02）；转移成立 → EV-03（ED-03）；换班成立 → EV-06（ED-06）。
 * 注意：规则能力对必选/可选班次同样开放，必选与可选的差异只在释放后的承接路径。
 */
export const DEFAULT_AFTERCARE = {
  cancel: { allow: true, value: 12, unit: 'h', mode: 'release' },
  transfer: { allow: true, value: 2, unit: 'h', samePositionOnly: true },
  swap: { allow: true, value: 4, unit: 'h', samePositionOnly: true }
}

/** 补齐老配置缺的能力位：换班是后加的能力，老种子只配了取消/转移 */
export const normalizeAftercare4 = ac => ({
  ...DEFAULT_AFTERCARE, ...(ac || {}),
  cancel: { ...DEFAULT_AFTERCARE.cancel, ...(ac?.cancel || {}) },
  transfer: { ...DEFAULT_AFTERCARE.transfer, ...(ac?.transfer || {}) },
  swap: { ...DEFAULT_AFTERCARE.swap, ...(ac?.swap || {}) }
})

/** 后续处理时长字段换算成分钟（unit: 'h' 小时 / 'min' 分钟） */
export const acMinutes4 = x => Math.max(0, Number(x?.value || 0)) * (x?.unit === 'min' ? 1 : 60)
/** 分钟数 → 人话时长：整小时显示「N 小时」，否则「N 分钟」 */
export const fmtDur4 = min => (min >= 60 && min % 60 === 0 ? `${min / 60} 小时` : `${Math.round(min)} 分钟`)

export const V4_PLANS = [
  {
    id: 'PL-01', spaceId: 'SP-01', name: '兴隆湖 · 推拿师 · 周计划',
    positions: ['PS-01'], mode: 'review', nature: 'required', enabled: true,
    cadence: { type: 'weekly', weekday: 4, time: '07:00', horizon: 'n3', note: '周四 07:00 生成第三周（周对周）' },
    days: [1, 2, 3, 4, 5, 6, 0],
    forms: [
      { id: 'SH-A', name: '早班', start: '10:00', end: '18:00', aftercare: { cancel: { allow: true, value: 12, unit: 'h', mode: 'release' }, transfer: { allow: true, value: 4, unit: 'h', samePositionOnly: true }, swap: { allow: true, value: 4, unit: 'h', samePositionOnly: true } } },
      { id: 'SH-B', name: '晚班', start: '15:00', end: '22:00', aftercare: { cancel: { allow: true, value: 6, unit: 'h', mode: 'release' }, transfer: { allow: true, value: 4, unit: 'h', samePositionOnly: true }, swap: { allow: true, value: 4, unit: 'h', samePositionOnly: true } } },
      // 兜底承接时段：退出只能走请假，不允许自行取消、转移和换班
      { id: 'SH-F', name: '通班', start: '10:00', end: '22:00', fallback: true, aftercare: { cancel: { allow: false, value: 0, unit: 'h', mode: 'release' }, transfer: { allow: false, value: 2, unit: 'h', samePositionOnly: true }, swap: { allow: false, value: 4, unit: 'h', samePositionOnly: true } } }
    ],
    quota: { source: 'algo', algoId: 'AG-01', windowMin: 10, adjusted: null },
    priority: [
      { id: 'T1', positionId: 'PS-01', employ: 'fulltime', cap: null, label: '全职推拿师' },
      { id: 'T2', positionId: 'PS-01', employ: 'parttime', cap: null, label: '非全推拿师' },
      { id: 'T3', fallback: true, formId: 'SH-F', label: '通班兜底' }
    ],
    qualify: { note: '本空间在册、非请假、当天无冲突班次' },
    aftercare: {
      cancel: { allow: true, value: 12, unit: 'h', mode: 'release' },
      transfer: { allow: true, value: 4, unit: 'h', samePositionOnly: true },
      swap: { allow: true, value: 4, unit: 'h', samePositionOnly: true }
    },
    note: '综合分排名截断；落选的按兜底顺序进通班'
  },
  {
    id: 'PL-02', spaceId: 'SP-01', name: '兴隆湖 · 非全客户经理 · 周计划',
    positions: ['PS-02'], mode: 'grab', nature: 'optional', enabled: true,
    cadence: { type: 'weekly', weekday: 4, time: '07:00', horizon: 'n1', note: '周四 07:00 铺下一周' },
    days: [1, 2, 3, 4, 5, 6, 0],
    forms: [
      // 时段可声明自己的出勤日：早段只在工作日，晚段全周——周一和周二排的不一样就是在这里配
      { id: 'SH-C', name: '早段', start: '12:00', end: '16:00', days: [1, 2, 3, 4, 5], aftercare: { cancel: { allow: true, value: 4, unit: 'h', mode: 'release' }, transfer: { allow: true, value: 6, unit: 'h', samePositionOnly: true }, swap: { allow: true, value: 6, unit: 'h', samePositionOnly: true } } },
      { id: 'SH-D', name: '晚段', start: '16:00', end: '22:00', aftercare: { cancel: { allow: true, value: 90, unit: 'min', mode: 'release' }, transfer: { allow: true, value: 6, unit: 'h', samePositionOnly: true }, swap: { allow: true, value: 6, unit: 'h', samePositionOnly: true } } }
    ],
    quota: { source: 'algo', algoId: 'AG-02', windowMin: 5, adjusted: null },
    priority: [{ id: 'T1', positionId: 'PS-02', employ: 'parttime', cap: null, label: '非全客户经理', open: { delayHours: 0 } }],
    qualify: { note: '本空间签约非全、当天无冲突' },
    aftercare: {
      cancel: { allow: true, value: 4, unit: 'h', mode: 'release' },
      transfer: { allow: true, value: 6, unit: 'h', samePositionOnly: true },
      swap: { allow: true, value: 6, unit: 'h', samePositionOnly: true }
    },
    note: '可选班次：领完即止，剩余不带兜底'
  },
  {
    id: 'PL-03', spaceId: 'SP-02', name: '麓山 · 客户经理 · 周计划',
    positions: ['PS-02'], mode: 'direct', nature: 'required', enabled: true,
    cadence: { type: 'weekly', weekday: 4, time: '07:00', horizon: 'n1', note: '周四自动生成，按上周班次倒班' },
    days: [1, 2, 3, 4, 5, 6, 0],
    forms: [
      { id: 'SH-E', name: '早班', start: '10:00', end: '18:00', quota: { value: 1 } },
      { id: 'SH-G', name: '晚班', start: '14:00', end: '21:00', quota: { value: 1 } }
    ],
    // 人工固定：每个时段单独设数量（form.quota.value），计划级 value 只是没单独配时的默认
    quota: { source: 'manual', value: 1, windowMin: 10, adjusted: null },
    priority: [
      { id: 'T1', positionId: 'PS-02', employ: 'fulltime', cap: null, label: '全职客户经理' },
      { id: 'T2', positionId: 'PS-02', employ: 'parttime', cap: null, label: '非全客户经理' }
    ],
    qualify: { note: '本空间全职、按上周班次反向轮转' },
    aftercare: {
      cancel: { allow: true, value: 6, unit: 'h', mode: 'release' },
      transfer: { allow: true, value: 2, unit: 'h', samePositionOnly: true },
      // 全职直派班次：换班是全职调班的主通道，等待期给到 8 小时（同岗位对等）
      swap: { allow: true, value: 8, unit: 'h', samePositionOnly: true }
    },
    note: '轮转直派；必选班次同样开放取消/转移/换班，释放后的缺口由优先序列兜底档承接'
  },
  {
    id: 'PL-04', spaceId: 'SP-03', name: '总部 · 客服专员 · 月计划',
    positions: ['PS-04'], mode: 'direct', nature: 'required', enabled: true,
    cadence: { type: 'monthly', day: 25, time: '09:00', horizon: 'month', note: '每月 25 日铺下月整月' },
    days: [1, 2, 3, 4, 5],
    forms: [
      { id: 'SH-H', name: '标准班', start: '09:00', end: '18:00' },
      { id: 'SH-I', name: '夜班', start: '12:00', end: '22:30' }
    ],
    quota: { source: 'algo', algoId: 'AG-03', windowMin: 10, adjusted: null },
    priority: [{ id: 'T1', positionId: 'PS-04', employ: 'fulltime', cap: null, label: '全职客服' }],
    qualify: { note: '本空间全职、夜班按排定顺序轮' },
    aftercare: DEFAULT_AFTERCARE,
    note: '夜班 12:00-22:30 超出标准尺子，超出部分计加班；取消/转移/换班同样开放，释放后按排定轮值顺序补位'
  }
]

/* ---- ⑦ 查询与派生 ---- */
export const findSpace4 = id => V4_SPACES.find(s => s.id === id) || null
export const findPosition4 = id => V4_POSITIONS.find(p => p.id === id) || null
export const posName4 = id => findPosition4(id)?.name || id
export const findPlan4 = (plans, id) => (plans || V4_PLANS).find(p => p.id === id) || null
export const findAlgo4 = id => V4_ALGOS.find(a => a.id === id) || null
export const spaceTags4 = () => [...new Set(V4_SPACES.map(s => s.tag))]
export const cities4 = () => [...new Set(V4_SPACES.map(s => s.city))]

/** 搜索：按名称 / 城市 / 标签 / 地址命中——企业级搜索的最小形态 */
export const searchSpaces4 = (kw = '') => {
  const k = String(kw).trim()
  if (!k) return V4_SPACES
  return V4_SPACES.filter(s => [s.name, s.city, s.tag, s.address].join(' ').includes(k))
}

/** 尺子：某空间某岗位的标准时间（可能多段）；没有专属配置就退回空间营业时间 */
export const rulerOf4 = (spaceId, positionId) => {
  const r = V4_RULERS.find(x => x.spaceId === spaceId && x.positionId === positionId)
  if (r) return r.segs
  const s = findSpace4(spaceId)
  return s ? [{ start: s.bizStart, end: s.bizEnd, label: '空间营业时间' }] : []
}

/** 超出尺子的分钟数 = 加班；尺子只量、不拦 */
export const overtimeMin4 = (spaceId, positionId, start, end) => {
  const segs = rulerOf4(spaceId, positionId)
  const s = timeMin(start)
  const e = timeMin(end)
  if (!segs.length) return 0
  let cover = 0
  for (const g of segs) {
    cover += Math.max(0, Math.min(e, timeMin(g.end)) - Math.max(s, timeMin(g.start)))
  }
  return Math.max(0, e - s - cover)
}

/** 计划实际要跑的形态：时段形态 + 兜底承接形态 */
export const formsOf4 = plan => {
  const list = [...plan.forms]
  for (const t of plan.priority || []) {
    if (t.fallback && t.formId && !list.some(f => f.id === t.formId)) {
      const src = plan.forms.find(f => f.id === t.formId)
      if (src) list.push(src)
    }
  }
  return list
}

/** 这个时段在这天出不出：form.days 声明它出现在哪几天（空/缺省 = 计划 days 全部），支持周一/周二排的不一样 */
export const formOnDay4 = (form, plan, date) => {
  const wd = weekday4(date)
  if (!(plan.days || [0, 1, 2, 3, 4, 5, 6]).includes(wd)) return false
  const days = form.days?.length ? form.days : (plan.days || [0, 1, 2, 3, 4, 5, 6])
  return days.includes(wd)
}

/** 名额：来源两条 + 人工调整（留痕）→ 生效值 */
export const quotaOf4 = (plan, ctx = {}) => {
  const q = plan.quota || {}
  const space = ctx.space || findSpace4(plan.spaceId)
  const form = ctx.form || plan.forms[0]
  const positionId = ctx.positionId || (plan.priority[0] || {}).positionId || (plan.positions || [])[0]
  let initial = 1
  let expr = ''
  let algoName = '手动固定'
  if (q.source === 'manual') {
    // 人工固定支持按时段单独设数：form.quota.value 覆盖计划默认值
    initial = Math.max(1, Number(ctx.form?.quota?.value ?? q.value ?? 1))
    const perForm = ctx.form?.quota?.value != null
    expr = perForm ? `${form.name} 人工固定 ${initial} 个` : `人工固定 ${initial} 个`
  } else {
    const algo = findAlgo4(q.algoId)
    if (algo) {
      const r = algo.calc({ ...ctx, plan, space, form, spaceId: plan.spaceId, positionId, people: ctx.people || V4_PEOPLE })
      initial = r.value
      expr = r.expr
      algoName = algo.name
    }
  }
  const adjusted = q.adjusted || null
  return {
    initial, adjusted: adjusted ? adjusted.value : null,
    effective: adjusted ? adjusted.value : initial,
    expr, algoName, algoId: q.source === 'manual' ? null : q.algoId,
    windowMin: Math.max(5, q.windowMin ?? 10)
  }
}

/** 资格：在册 + 当天没请假 */
export const qualify4 = (p, date, leaves = []) => p.active !== false && !leaves.some(l => l.personId === p.id && l.date === date)

const orderByMode4 = (list, mode) => {
  const arr = [...list]
  if (mode === 'review') return arr.sort((a, b) => b.comp - a.comp || b.kpi.回头率 - a.kpi.回头率)
  if (mode === 'grab') return arr.sort((a, b) => (a.signDate < b.signDate ? -1 : a.signDate > b.signDate ? 1 : a.id < b.id ? -1 : 1))
  return arr.sort((a, b) => (a.id < b.id ? -1 : 1))
}
const wayOf4 = (mode, fallback) => {
  if (fallback) return '兜底补位'
  if (mode === 'review') return '审核通过'
  if (mode === 'grab') return '先到先得'
  return '轮转直派'
}

const datesOf4 = (plan, range) => {
  const out = []
  let d = range.from
  while (d <= range.to) {
    if ((plan.days || [0, 1, 2, 3, 4, 5, 6]).includes(weekday4(d))) out.push(d)
    d = addDays4(d, 1)
  }
  return out
}

const makeResult4 = (inst, p, plan, way) => ({
  id: `R-${inst.id}-${p.id}`, instanceId: inst.id, planId: plan.id, spaceId: inst.spaceId,
  date: inst.date, personId: p.id, personName: p.name,
  positionId: p.positionId, positionName: posName4(p.positionId), employ: p.employ,
  formName: inst.form.name, start: inst.start, end: inst.end, way,
  score: p.comp, hours: (timeMin(inst.end) - timeMin(inst.start)) / 60,
  overtimeMin: overtimeMin4(inst.spaceId, p.positionId, inst.start, inst.end),
  fallback: way === '兜底补位'
})

/**
 * 跑一批：按计划铺时段实例 → 按优先序列逐档分配 → 兜底承接 → 出结果
 * 纯函数：同一份输入永远同一份结果
 */
export const runBatch4 = (state) => {
  const plans = (state.plans || V4_PLANS).filter(p => p.enabled !== false)
  const people = state.people || V4_PEOPLE
  const leaves = state.leaves || []
  const range = state.range
  const instances = []

  for (const plan of plans) {
    const forms = formsOf4(plan)
    for (const date of datesOf4(plan, range)) {
      // 每个时段声明自己的出勤日（form.days），周一和周二可以排的不一样
      for (const form of forms.filter(f => formOnDay4(f, plan, date))) {
        const q = quotaOf4(plan, { space: findSpace4(plan.spaceId), date, form, people })
        instances.push({
          id: `IN-${plan.id}-${date}-${form.id}`, planId: plan.id, spaceId: plan.spaceId,
          date, formId: form.id, form, start: form.start, end: form.end,
          fallbackForm: !!form.fallback, quota: q, filled: 0, left: q.effective, results: [],
          // 后续处理规则跟时段走（form.aftercare），没单独配的继承计划默认；生成时快照，改配置只影响下一批
          aftercare: JSON.parse(JSON.stringify(normalizeAftercare4(form.aftercare || plan.aftercare || DEFAULT_AFTERCARE)))
        })
      }
    }
  }

  const results = []
  const taken = new Set()
  const key = (d, p) => `${d}|${p}`

  for (const inst of instances) {
    if (inst.fallbackForm) continue
    const plan = findPlan4(state.plans || V4_PLANS, inst.planId)
    let remaining = inst.quota.effective
    for (const tier of (plan.priority || []).filter(t => !t.fallback)) {
      if (remaining <= 0) break
      const pool = people.filter(p =>
        p.spaceId === inst.spaceId && p.positionId === tier.positionId &&
        (tier.employ === 'any' || tier.employ === p.employ) &&
        qualify4(p, inst.date, leaves) && !taken.has(key(inst.date, p.id))
      )
      const ordered = orderByMode4(pool, plan.mode)
      const cap = tier.cap ? Math.min(tier.cap, remaining) : remaining
      const take = Math.min(cap, ordered.length)
      for (let i = 0; i < take; i++) {
        const r = makeResult4(inst, ordered[i], plan, wayOf4(plan.mode, false))
        results.push(r)
        inst.results.push(r)
        taken.add(key(inst.date, ordered[i].id))
      }
      remaining -= take
      inst.filled += take
    }
    inst.left = Math.max(0, remaining)
  }

  // 兜底：当天在所有普通时段都没排上的人，按兜底档进承接时段
  for (const plan of plans) {
    const fb = (plan.priority || []).find(t => t.fallback)
    if (!fb) continue
    const dates = [...new Set(instances.filter(i => i.planId === plan.id).map(i => i.date))]
    for (const date of dates) {
      const inst = instances.find(i => i.planId === plan.id && i.date === date && i.formId === fb.formId)
      if (!inst) continue
      let remaining = inst.quota.effective - inst.filled
      if (remaining <= 0) continue
      const tiers = (plan.priority || []).filter(t => !t.fallback)
      const pool = people.filter(p =>
        p.spaceId === plan.spaceId && qualify4(p, date, leaves) && !taken.has(key(date, p.id)) &&
        tiers.some(t => t.positionId === p.positionId && (t.employ === 'any' || t.employ === p.employ))
      )
      const ordered = orderByMode4(pool, plan.mode)
      const take = Math.min(remaining, ordered.length)
      for (let i = 0; i < take; i++) {
        const r = makeResult4(inst, ordered[i], plan, '兜底补位')
        results.push(r)
        inst.results.push(r)
        taken.add(key(date, ordered[i].id))
      }
      inst.filled += take
      inst.left = Math.max(0, remaining - take)
    }
  }

  return { instances, results, applications: appsOf4(instances, plans, people, leaves) }
}

/** 申领单：直派无申领；其余等于「有资格的人申了」 */
const appsOf4 = (instances, plans, people, leaves) => {
  const out = []
  for (const inst of instances) {
    if (inst.fallbackForm) continue
    const plan = plans.find(p => p.id === inst.planId)
    if (!plan || plan.mode === 'direct') continue
    const tiers = (plan.priority || []).filter(t => !t.fallback)
    const pool = people.filter(p =>
      p.spaceId === inst.spaceId && qualify4(p, inst.date, leaves) &&
      tiers.some(t => t.positionId === p.positionId && (t.employ === 'any' || t.employ === p.employ))
    )
    for (const p of pool) {
      const won = inst.results.some(r => r.personId === p.id)
      const status = won ? 'won' : (inst.filled >= inst.quota.effective ? 'lost' : 'pending')
      out.push({
        id: `AP-${inst.id}-${p.id}`, instanceId: inst.id, date: inst.date,
        slot: inst.form.name, personId: p.id, personName: p.name, positionName: posName4(p.positionId),
        status, score: p.comp
      })
    }
  }
  return out
}

/** 计划摘要（列表卡片用） */
export const planSummary4 = plan => {
  const sp = findSpace4(plan.spaceId)
  const modes = { direct: '轮转直派', grab: '先到先得', review: '审核截断' }
  return {
    space: sp?.name || plan.spaceId,
    tag: sp?.tag || '',
    city: sp?.city || '',
    mode: modes[plan.mode] || plan.mode,
    nature: plan.nature === 'required' ? '必选' : '可选',
    positions: (plan.positions || []).map(posName4).join('、'),
    forms: formsOf4(plan).map(f => `${f.name} ${f.start}-${f.end}`).join(' / '),
    tiers: (plan.priority || []).filter(t => !t.fallback).map(t => t.label),
    fallback: (plan.priority || []).find(t => t.fallback)?.label || '',
    quotaSource: plan.quota?.source === 'manual' ? '人工固定' : (findAlgo4(plan.quota?.algoId)?.name || '未配置')
  }
}
