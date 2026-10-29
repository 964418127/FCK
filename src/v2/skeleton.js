/**
 * 骨架清单：一套提示词「不许漏的结论」。
 *
 * 它不是模板 ——
 *   · 模板有树：节点、依赖、承担者、表单全预置，实例只是套用
 *   · 骨架只有一条：这件事必须交付哪些结论、什么情况下才存在这一条
 * 依赖、表单、承担者都在生成时按这一单的人算，不落在这里。
 *
 * 每条骨架写四样：
 *   needs  这一条成立需要什么事实（取不到就不存在，不是模型裁量）
 *   gate   必过 / 可选
 *   after  必须等哪些结论（「或」用 afterAny；被裁掉的前置自动跳过）
 *   paths  兑现路径：人给结论 / 系统判定 / 系统执行 / 外部回执
 *
 * 生成器（blueprint.js）与提示词渲染（prompt.js）共用这一份数据 ——
 * 分两份必然漂移，和 fieldTypes 只能有一处定义是同一个道理。
 */

/**
 * 基础事实表：与「是哪件事」无关，跨事件通用。
 * 一个事实能不能当 needs，判据是它在任何一件事里都查得到同样口径 —— 不是它在离职里用过。
 */
export const BASE_NEEDS = [
  { key: 'always', label: '人人都有', absent: '', hint: '不需要任何事实，这类步骤对每一个人都存在' },
  { key: 'clients', label: '在跟客户', absent: '不带客户', hint: '名下还有在跟客户 / 在服务客户' },
  { key: 'tasks', label: '在办事项', absent: '无在办事项', hint: '还有在办工作在途事项' },
  { key: 'team', label: '带团队', absent: '不带团队', hint: '有直属下属或在管门店' },
  { key: 'assets', label: '有资产', absent: '无在册资产', hint: '名下有在册资产（设备 / 工服 / 工具）' },
  { key: 'cash', label: '备用金', absent: '不保管备用金', hint: '门店备用金、收银现金由本人保管' },
  { key: 'debt', label: '有欠款', absent: '无欠款', hint: '有借款、备用金未还或报销未结' },
  { key: 'accounts', label: '有账号', absent: '无账号权限', hint: '有收银 / 排班 / 企业微信等账号或门禁权限' }
]

/**
 * 事件扩展事实：不属于基础表，由每套提示词在自己的 `facts[]` 里声明。
 * 换一件事（调店调岗、调薪…）时另写一批，不往基础表里塞 —— 基础表一旦被某件事的口径污染，
 * 另一件事就会拿到不适用的事实。
 */
export const RESIGN_FACTS = [
  { key: 'aacb', label: '持有 AACB', absent: '无 AACB', hint: '名下领用过 AACB（专用设备），才有这一项专项交还验收' },
  { key: 'complaint', label: '有客诉', absent: '无客诉', hint: '服务过客户，才需要核对是否有未完结工单' },
  { key: 'severance', label: '需补偿', absent: '不涉补偿', hint: '被动离职或协商解除，才谈补偿金' }
]

/** 全站已知事实（基础 + 内置扩展）：只用于查标签与兜底显示，不用来判断「某件事能用哪些」 */
export const NEEDS = [...BASE_NEEDS, ...RESIGN_FACTS]

export const NEED_LABEL = Object.fromEntries(NEEDS.map((n) => [n.key, n.label]))
/** 这一条不长出来时缺的是什么事实，用来解释「这一单为什么没有」 */
export const NEED_ABSENT = Object.fromEntries(NEEDS.map((n) => [n.key, n.absent || '这一单不适用']))

/** 某套提示词可用的事实：基础表 + 它自己声明的扩展（同键以扩展为准） */
export function needsOf (prompt) {
  const extra = prompt?.facts || []
  const map = new Map(BASE_NEEDS.map((n) => [n.key, n]))
  extra.forEach((n) => n?.key && map.set(n.key, { absent: '这一单不适用', ...n }))
  return [...map.values()]
}

export const needMapOf = (prompt) => Object.fromEntries(needsOf(prompt).map((n) => [n.key, n]))
export const needLabelOf = (key, prompt) => needMapOf(prompt)[key]?.label || NEED_LABEL[key] || key
export const needAbsentOf = (key, prompt) => needMapOf(prompt)[key]?.absent || NEED_ABSENT[key] || '这一单不适用'

/** 骨架里用了本事件没有声明的事实 —— 定义期就该拦住，不能等到触发时才发现取不到数 */
export function unknownNeedsOf (skeleton, prompt) {
  const ok = new Set(needsOf(prompt).map((n) => n.key))
  const bad = []
  ;(skeleton || []).forEach((item) => {
    const list = Array.isArray(item.needs) ? item.needs : [item.needs]
    list.forEach((k) => {
      if (k && !ok.has(k) && !bad.includes(k)) bad.push(k)
    })
  })
  return bad
}

const f = (key, label, type, required = false, rule = '', formats = '', from = '') => ({
  key, label, type, required, rule, ...(formats ? { formats } : {}), ...(from ? { from } : {})
})
const it = (id, title, require, fields) => ({ id, title, require, fields })
const human = (role, items, owner = null) => ({ type: 'human', role, items, ...(owner ? { owner } : {}) })
const system = (sysKey, fetchFreq = '1d', maxRuns = 5) => ({ type: 'system', sysKey, fetch: { fetchFreq, maxRuns } })
const action = (actionKey, targets, retry) => ({ type: 'action', actionKey, targets, retry })

/**
 * 离职骨架（21 条）。
 * 顺序即「事后一眼看下来」的顺序，不参与执行 —— 执行先后由 after 决定。
 */
export const resignSkeleton = [
  {
    key: 'review.city',
    goal: '城市总已审核通过',
    needs: 'always',
    gate: 'must',
    after: [],
    paths: [human('city-head', [
      it('it.review.city', '离职需求审核 · 城市总', '核对申请与交接范围，与员工谈定实际离职日期，写清审核意见', [
        /* 前两格默认取员工提交时带进来的值 —— 审核人核对或改，不重填 */
        f('expectDate', '期望离职日期', 'date', true, '不早于今日', '', 'payload.expectDate'),
        /* 与登记一致：离职原因登记就是多选，审核只核对不重填 */
        f('reason', '离职原因', 'multiselect', true, '工资太低 / 离家太远 / 结婚生子 / 自主创业 / 照顾家庭', '', 'payload.reason'),
        f('actualDate', '实际离职日期', 'date', true, '不早于今日', '', 'payload.expectDate'),
        f('reviewNote', '审核意见', 'textarea')
      ])
    ])],
    note: '第一关：城市负责人确认可以走、定下实际离职日期；两条审核里的前一条'
  },
  {
    key: 'review',
    goal: '人事已审核通过',
    needs: 'always',
    gate: 'must',
    after: ['review.city'],
    paths: [human('hr', [
      it('it.review', '离职需求审核 · 人事', '复核城市总结论与交接范围，定下这一笔常乐豆走哪条通道，写清审核意见', [
        /* 审核这一环才产生的值：下游执行项按字段名取，不重复让人填 */
        { key: 'payout', label: '款项出口', type: 'select', required: true, rule: '一次性补偿金/并入薪金', prefill: '并入薪金' },
        f('reviewNote', '审核意见', 'textarea')
      ])
    ])],
    note: '第二关：人事复核并定款项出口；两条审核是两条结论，先后由「需等」表达'
  },
  {
    key: 'bean.intent',
    goal: '常乐豆处理意向已写入业务系统',
    needs: 'always',
    gate: 'must',
    after: ['review'],
    paths: [action('act.beanPayoutIntent', '常乐豆账户系统 · 薪酬系统', { times: 3, interval: '30m', onExhaust: 'human' })],
    note: '读审核定下的款项出口，把「这条余额走哪条通道」写回业务系统；结算与计税不在这里做'
  },
  {
    key: 'handover.client',
    goal: '在跟客户已交接完毕',
    needs: 'clients',
    gate: 'must',
    after: ['review'],
    paths: [human('store-manager', [
      it('it.client', '客户资料移交', '员工本人把在跟客户逐个交接，店长登记接收人并核对移交清单', [
        f('clientName', '客户姓名', 'text', true),
        f('receiver', '接收人', 'person', true),
        f('handoverDate', '移交日期', 'date'),
        f('clientProof', '移交清单', 'file', true, '', 'PDF / JPG / PNG')
      ])
    ])],
    jobNote: {
      推拿师: '员工本人在跟客人逐个登记接收人，附客史与疗程进度；店长核对后签收',
      客户经理: '员工本人把在跟企业客户逐个移交合同与对账口径，附客户清单',
      城市总: '员工本人把在管客户与渠道关系移交大区，附对接人清单',
      default: '员工本人把在跟客户逐个交接，店长登记接收人并核对移交清单'
    }
  },
  {
    key: 'handover.work',
    goal: '在办工作事项已交接完毕',
    needs: 'tasks',
    gate: 'must',
    after: ['review'],
    paths: [human('supervisor', [
      it('it.plan', '工作事项交接清单', '含在途事项、服务进度与接手人', [
        f('scope', '交接范围', 'text', true),
        f('nextOwner', '接手人', 'person', true),
        f('planProof', '交接清单', 'file', true, '', 'PDF / JPG / PNG')
      ])
    ])]
  },
  {
    key: 'handover.team',
    goal: '团队与在管门店已交接',
    needs: 'team',
    gate: 'must',
    after: ['review'],
    paths: [human('city-head', [
      it('it.team', '团队 / 门店交接', '逐个门店指定接任者，交接排班、业绩与人事务实', [
        f('storeCount', '在管门店数', 'number', true, '≥ 1'),
        f('nextHead', '接任者', 'person', true),
        f('teamProof', '交接确认单', 'file', true, '', 'PDF')
      ])
    ])],
    note: '只有带团队的人才长出来 —— 这是「按人生成」最直接的例子'
  },
  {
    key: 'goods',
    goal: '门店物品已归还销账',
    needs: 'always',
    gate: 'must',
    after: ['review'],
    paths: [human('store-manager', [
      it('it.goods', '门店物品归还', '员工本人交还工服 / 工具 / 钥匙，店长逐项核对后销账', [
        f('goodsNote', '归还明细', 'text', true),
        f('goodsProof', '归还凭证', 'file', false, '', 'PDF / JPG')
      ])
    ])],
    jobNote: {
      推拿师: '员工本人交还按摩床工位、工服、工牌，店长逐项核对后销账',
      店长: '员工本人交还门店钥匙、印章、工牌、对讲机，直属上级逐项核对后销账',
      城市总: '员工本人交还门店钥匙、印章、办公设备，大区逐项核对后销账',
      default: '员工本人交还工服 / 工具 / 钥匙，店长逐项核对后销账'
    },
    jobFields: {
      店长: [f('stampNo', '印章编号', 'text', true)]
    }
  },
  {
    key: 'handover.aacb',
    goal: 'AACB 已交还并验收',
    needs: 'aacb',
    gate: 'must',
    after: ['review'],
    paths: [human('store-manager', [
      it('it.aacb', 'AACB 交还', '员工本人交还 AACB，店长核对编号与外观后验收', [
        f('aacbNo', '设备编号', 'text', true),
        f('aacbState', '外观状态', 'select', true, '完好 / 轻微磨损 / 损坏'),
        f('aacbPhoto', '验收照片', 'file', true, '', 'JPG / PNG')
      ])
    ])],
    note: '只有名下领用过 AACB 的人才长出来：张三有，其他推拿师没有'
  },
  {
    key: 'cash',
    goal: '备用金与收银现金已结清',
    needs: 'cash',
    gate: 'must',
    after: ['review'],
    paths: [human('finance', [
      it('it.cash', '备用金结清', '点清备用金与收银现金，差额说明并附缴款凭证', [
        f('cashAmount', '结清金额', 'number', true, '≥ 0'),
        f('cashProof', '缴款凭证', 'file', true, '', 'PDF / JPG')
      ])
    ])]
  },
  {
    key: 'asset.check',
    goal: '应归还资产已全部销账',
    needs: 'assets',
    gate: 'must',
    after: ['review', 'goods', 'handover.aacb'],
    paths: [system('asset', '1d', 5)],
    note: '物品归还核对完、该交还的专用设备也收回来了，系统才去台账核销（没有那一项时前置自动跳过）'
  },
  {
    key: 'debt.settle',
    goal: '欠款与借款已结清',
    needs: 'debt',
    gate: 'must',
    after: ['review'],
    paths: [human('finance', [
      it('it.debt', '借款 / 欠款核对', '有欠款须附结清凭证或还款计划', [
        f('amount', '欠款金额', 'number', true, '≥ 0，精确到分'),
        f('repayPlan', '还款计划日期', 'date'),
        f('debtProof', '结清凭证', 'file', true, '', 'PDF / JPG / PNG')
      ])
    ])]
  },
  {
    key: 'debt.check',
    goal: '财务台账侧无未结清负债',
    needs: 'debt',
    gate: 'must',
    after: ['review'],
    paths: [system('debt', '1d', 5)],
    note: '人核的是那一笔欠款单（附结清凭证），系统核的是财务台账里是否还挂着报销未结、罚款未缴'
  },
  {
    key: 'account.recover',
    goal: '系统账号与门禁权限已回收',
    needs: 'accounts',
    gate: 'must',
    after: ['review', 'handover.work', 'asset.check'],
    /* 只留系统执行：工牌 / 钥匙 / 电脑这些实物在「门店物品已归还销账」与「应归还资产已全部销账」里，
       在这一条再并一条人办路径，等于两处都在收同一批东西，而且任一处办结就算这条达成。 */
    paths: [
      action('act.revokePerm', '该员工名下全部系统账号（含岗位标准之外的）', { times: 3, interval: '30m', onExhaust: 'human' })
    ]
  },
  {
    key: 'complaint.check',
    goal: '无未完结客诉与纠纷',
    needs: 'complaint',
    gate: 'optional',
    after: ['review', 'handover.client'],
    paths: [system('complaint', '2h', 5)]
  },
  {
    key: 'compensation',
    goal: '补偿金金额与协议已确认',
    needs: 'severance',
    gate: 'optional',
    after: ['review'],
    paths: [human('finance', [
      it('it.comp', '补偿金录入', '默认 0；大于 0 必须上传协议，上限 = 月均 ×（N+1）', [
        f('monthlyAvg', '月均工资', 'number', true, '取近 12 个月'),
        f('compAmount', '补偿金金额', 'number', true, '≤ 月均 ×（N+1）'),
        f('compProof', '补偿协议', 'file', false, '', 'PDF')
      ])
    ], { kind: 'person', name: '周芸' })],
    note: '总部财务固定责任人，不按门店 / 城市解析'
  },
  {
    key: 'interview',
    goal: '离职面谈已完成并留痕',
    needs: 'always',
    gate: 'must',
    after: ['review', 'debt.settle', 'debt.check', 'account.recover', 'complaint.check', 'handover.work'],
    paths: [human('hr', [
      it('it.talk', '离职面谈记录', '面谈结论与员工反馈，对照前置结论逐项确认无未结事项', [
        f('talkDate', '面谈日期', 'date', true),
        f('conclusion', '面谈结论', 'select', true, '顺利 / 有异议 / 需跟进'),
        f('talkProof', '面谈记录', 'file', false, '', 'PDF / DOCX')
      ])
    ])]
  },
  {
    key: 'attendance.check',
    goal: '无未处理考勤异常',
    needs: 'always',
    gate: 'must',
    after: ['interview'],
    paths: [system('attendance', '12h', 5)]
  },
  {
    key: 'contract.push',
    goal: '离职合同已送达员工签署',
    needs: 'always',
    gate: 'must',
    after: ['interview', 'attendance.check', 'compensation'],
    paths: [action('act.pushContract', '员工本人', { times: 2, interval: '1h', onExhaust: 'human' })]
  },
  {
    key: 'sign',
    goal: '离职合同已完成签署',
    needs: 'always',
    gate: 'must',
    after: ['contract.push'],
    /* 回执必须是字段清单：只写一句「员工签署状态」等于没约定，下游引用不到、也判不出签没签 */
    paths: [{
      type: 'external',
      party: '电子签平台',
      via: 'act.pushContract',
      receipt: [
        { key: 'signState', label: '员工签署状态', type: 'enum', values: ['已签署', '已拒签', '待签署'] },
        { key: 'signedAt', label: '签署时间', type: 'date' },
        { key: 'docNo', label: '外部单号', type: 'text' }
      ],
      writeBack: 'signState',
      timeout: '7d'
    }],
    note: '对方的人要动手，我方只能等回执；回的必须是签署状态，不是送达结果'
  },
  {
    key: 'broadcast',
    goal: '薪酬 / 社保 / 假勤已收到离职结果',
    needs: 'always',
    gate: 'must',
    after: ['sign'],
    paths: [action('act.broadcast', '订阅离职结果的系统', { times: 3, interval: '1h', onExhaust: 'human' })]
  },
  {
    key: 'archive',
    goal: '人事档案已归档',
    needs: 'always',
    gate: 'optional',
    after: ['sign'],
    paths: [action('act.archive', '员工本人', { times: 2, interval: '1d', onExhaust: 'stop' })]
  }
]

/** 这套提示词的骨架：优先级 —— 提示词自带 > 事件默认 */
export const skeletonOf = (prompt) => (prompt?.skeleton?.length ? prompt.skeleton : resignSkeleton)

/** 事实是否满足 needs（needs 可为单个键或数组，数组按「都要满足」） */
export function needOk (needs, facts = {}) {
  const list = Array.isArray(needs) ? needs : [needs]
  return list.every((k) => {
    if (!k || k === 'always') return true
    const v = facts?.[k]
    if (Array.isArray(v)) return v.length > 0
    if (typeof v === 'number') return v > 0
    if (typeof v === 'boolean') return v
    return !!v
  })
}

/** 骨架项的达成口径（给列表 / 预览显示一句话）。传 prompt 才能解析本事件自己声明的事实 */
export const needTextOf = (needs, prompt = null) => {
  const list = Array.isArray(needs) ? needs : [needs]
  if (list.includes('always')) return '人人都有'
  return list.map((k) => needLabelOf(k, prompt)).join(' 且 ')
}

/** 一条骨架的路径类型标签 */
export const pathSummary = (item) => {
  const ps = item?.paths || []
  const has = (t) => ps.some((p) => p.type === t)
  const out = []
  if (has('human')) out.push('人给结论')
  if (has('system')) out.push('系统判定')
  if (has('action')) out.push('系统执行')
  if (has('external')) out.push('外部回执')
  return out.join(' + ') || '—'
}
