/**
 * v2 事实底座（原型阶段）
 *
 * 为什么需要这一层：
 *   这里是**实例期**的事实：一张单开出来以后，这一单上的人是谁、他在哪个门店、
 *   他有哪些系统账号、他欠不欠钱、假勤还剩多少 —— 由实例随单带进来。
 *   定义期（对话生成编排）不查人，只查组织与目录，见 prompt.js 的 designFactsText。
 *
 * 数据来源：v1 的 employees / roleOwners / 假勤台账 / 系统检查项；
 *   本文件补上 v1 没有的三样 —— 逐人系统权限、逐人欠款、岗位应有的权限配置。
 *
 * 只读，不参与定义。定义与实例都不引用这里的 id，只引用事实的快照文本。
 */

/* ---------------- 系统权限目录（端 + 系统） ---------------- */

export const permCatalog = [
  { key: 'pos', name: '门店收银系统', side: '门店端', desc: '开单、收款、退款' },
  { key: 'schedule', name: '门店排班系统', side: '门店端', desc: '排班、调班、请假代提' },
  { key: 'stock', name: '门店库存系统', side: '门店端', desc: '耗材领用与盘点' },
  { key: 'wecom', name: '企业微信', side: '移动端', desc: '内部沟通与审批' },
  { key: 'web.shift', name: 'Web 后台 · 排班管理', side: 'PC 端', desc: '跨门店排班维护' },
  { key: 'web.report', name: 'Web 后台 · 门店报表', side: 'PC 端', desc: '营业额与人力报表' },
  { key: 'web.crm', name: 'Web 后台 · 客户档案', side: 'PC 端', desc: '客户资料与回访记录' },
  { key: 'web.hr', name: 'Web 后台 · 员工档案', side: 'PC 端', desc: '入离调转与合同' },
  { key: 'web.fin', name: 'Web 后台 · 财务', side: 'PC 端', desc: '付款与报销审核' },
  { key: 'meituan', name: '美团商家端', side: '第三方', desc: '平台订单与评价回复' }
]

export const permName = (k) => (permCatalog.find((p) => p.key === k) || {}).name || k
export const permSide = (k) => (permCatalog.find((p) => p.key === k) || {}).side || ''

/** 岗位应有的权限配置：离职时「应有尽除」的基线 */
export const jobPerms = {
  推拿师: ['pos', 'schedule', 'wecom'],
  客户经理: ['pos', 'schedule', 'wecom', 'web.crm'],
  前台: ['pos', 'schedule', 'wecom'],
  店长: ['pos', 'schedule', 'stock', 'wecom', 'web.report'],
  城市总: ['wecom', 'web.report'],
  总部职能: ['wecom', 'web.hr']
}

/* ---------------- 员工事实（13 人，来自 v1，补齐权限 / 欠款 / 假勤） ---------------- */

export const staff = [
  {
    id: 'T00676', name: '张三', job: '推拿师', city: '上海', store: '上海徐汇店',
    employType: '全职', onboardAt: '2023-04-12', contractEntity: '上海推拿之家健康管理有限公司',
    perms: ['pos', 'schedule', 'wecom', 'web.shift'],
    assets: ['工服 2 套', '工牌', '对讲机', 'AACB'],
    debt: { loan: 320, advance: 0, reimburse: 0 },
    leave: { annual: 2.5, comp: 1, sick: 0 }
  },
  {
    id: 'T00680', name: '王五', job: '推拿师', city: '上海', store: '上海徐汇店',
    employType: '全职', onboardAt: '2022-09-01', contractEntity: '上海推拿之家健康管理有限公司',
    perms: ['pos', 'schedule', 'wecom'],
    debt: { loan: 0, advance: 0, reimburse: 0 },
    leave: { annual: 0, comp: 0, sick: 2 }
  },
  {
    id: 'T00681', name: '陈晨', job: '推拿师', city: '上海', store: '上海浦东店',
    employType: '全职', onboardAt: '2024-01-08', contractEntity: '上海推拿之家健康管理有限公司',
    perms: ['pos', 'schedule', 'wecom', 'meituan'],
    debt: { loan: 0, advance: 0, reimburse: 0 },
    leave: { annual: 4, comp: 0, sick: 1 }
  },
  {
    id: 'T00682', name: '刘洋', job: '推拿师', city: '上海', store: '上海徐汇店',
    employType: '全职', onboardAt: '2023-11-20', contractEntity: '上海推拿之家健康管理有限公司',
    perms: ['pos', 'schedule', 'wecom', 'web.report'],
    debt: { loan: 0, advance: 0, reimburse: 0 },
    leave: { annual: 1, comp: 0, sick: 0 }
  },
  {
    id: 'T00683', name: '孙悦', job: '推拿师', city: '杭州', store: '杭州西湖店',
    employType: '全职', onboardAt: '2022-06-15', contractEntity: '杭州推拿之家健康管理有限公司',
    perms: ['pos', 'schedule', 'wecom', 'web.report'],
    debt: { loan: 80, advance: 0, reimburse: 0 },
    leave: { annual: 6.5, comp: 2, sick: 0 }
  },
  {
    id: 'T00685', name: '周凯', job: '推拿师', city: '上海', store: '上海静安店',
    employType: '全职', onboardAt: '2025-02-10', contractEntity: '上海推拿之家健康管理有限公司',
    perms: ['pos', 'schedule', 'wecom'],
    debt: { loan: 0, advance: 0, reimburse: 0 },
    leave: { annual: 0, comp: 0, sick: 0 }
  },
  {
    id: 'T00701', name: '赵敏', job: '推拿师', city: '成都', store: '成都春熙路店',
    employType: '全职', onboardAt: '2021-03-22', contractEntity: '成都推拿之家健康管理有限公司',
    perms: ['pos', 'schedule', 'wecom', 'meituan'],
    debt: { loan: 1500, advance: 0, reimburse: 0 },
    leave: { annual: 3, comp: 0, sick: 1 }
  },
  {
    id: 'P00684', name: '李四', job: '推拿师', city: '上海', store: '上海徐汇店',
    employType: '兼职', onboardAt: '2025-05-06', contractEntity: '上海推拿之家健康管理有限公司',
    perms: ['pos', 'wecom'],
    debt: { loan: 0, advance: 0, reimburse: 0 },
    leave: { annual: 0, comp: 0, sick: 0 }
  },
  {
    id: 'J00692', name: '钱七', job: '推拿师', city: '上海', store: '上海徐汇店',
    employType: '兼职', onboardAt: '2025-07-01', contractEntity: '上海推拿之家健康管理有限公司',
    perms: ['pos'],
    debt: { loan: 200, advance: 0, reimburse: 0 },
    leave: { annual: 0, comp: 0, sick: 0 }
  },
  {
    id: 'M00688', name: '周琳', job: '客户经理', city: '成都', store: '成都春熙路店',
    employType: '全职', onboardAt: '2022-08-18', contractEntity: '成都推拿之家健康管理有限公司',
    perms: ['pos', 'schedule', 'wecom', 'web.crm'],
    debt: { loan: 0, advance: 0, reimburse: 0 },
    leave: { annual: 5, comp: 3, sick: 0 }
  },
  {
    id: 'M00690', name: '吴芳', job: '客户经理', city: '上海', store: '上海徐汇店',
    employType: '全职', onboardAt: '2023-02-14', contractEntity: '上海推拿之家健康管理有限公司',
    perms: ['pos', 'schedule', 'wecom', 'web.crm', 'meituan'],
    severance: true,
    debt: { loan: 0, advance: 0, reimburse: 0 },
    leave: { annual: 2, comp: 0, sick: 0 }
  },
  {
    id: 'H00710', name: '郑伟', job: '总部职能', city: '上海', store: '总部',
    employType: '全职', onboardAt: '2020-05-11', contractEntity: '上海推拿之家健康管理有限公司',
    perms: ['wecom', 'web.hr', 'web.fin'],
    debt: { loan: 0, advance: 0, reimburse: 0 },
    leave: { annual: 8, comp: 4, sick: 0 }
  },
  {
    id: 'R00720', name: '吴老', job: '推拿师', city: '杭州', store: '杭州西湖店',
    employType: '返聘', onboardAt: '2024-03-04', contractEntity: '杭州推拿之家健康管理有限公司',
    perms: ['wecom'],
    debt: { loan: 0, advance: 0, reimburse: 0 },
    leave: { annual: 0, comp: 0, sick: 0 }
  }
]

/* ---------------- 常乐豆 / 补偿台账（按工号记账） ----------------
 *
 * 这两本是别的系统的账，我们只在发起时按工号取一次、随单带进来：
 *   · 常乐豆：员工的虚拟积分资产，余额可提现、结算中要等到账 —— 离职要一起结算
 *   · 补偿金：涉及协商解除的才有，金额由人事核定，协议在系统里存的是链接
 * 缺省即「没有这本账」（余额 0 / 不涉补偿），不做猜测。
 */

const beanLedger = {
  T00676: { balance: 1280, pending: 320 },
  T00680: { balance: 460, pending: 0 },
  T00681: { balance: 240, pending: 0 },
  T00682: { balance: 860, pending: 150 },
  T00683: { balance: 1980, pending: 0 },
  T00685: { balance: 120, pending: 0 },
  T00701: { balance: 640, pending: 200 },
  P00684: { balance: 90, pending: 0 },
  J00692: { balance: 0, pending: 60 },
  M00688: { balance: 2350, pending: 0 },
  M00690: { balance: 1560, pending: 0 },
  H00710: { balance: 3200, pending: 0 },
  R00720: { balance: 2100, pending: 0 }
}

const bankLedger = {
  T00676: { holder: '张三', cardNo: '6222 0210 3345 1287', bankName: '中国工商银行' },
  T00680: { holder: '王五', cardNo: '6214 8302 5566 0934', bankName: '招商银行' },
  T00681: { holder: '陈晨', cardNo: '6217 0038 4412 7789', bankName: '中国建设银行' },
  T00682: { holder: '刘洋', cardNo: '6228 4801 2233 4456', bankName: '中国农业银行' },
  T00683: { holder: '孙悦', cardNo: '6222 0210 8899 0012', bankName: '中国工商银行' },
  T00685: { holder: '周凯', cardNo: '6229 0843 6677 8899', bankName: '兴业银行' },
  T00701: { holder: '赵敏', cardNo: '6217 0038 1122 3344', bankName: '中国建设银行' },
  P00684: { holder: '李四', cardNo: '6214 8302 9900 1122', bankName: '招商银行' },
  J00692: { holder: '钱七', cardNo: '6222 0210 5566 7788', bankName: '中国工商银行' },
  M00688: { holder: '周琳', cardNo: '6228 4801 6677 8899', bankName: '中国农业银行' },
  M00690: { holder: '吴芳', cardNo: '6217 0038 2233 4455', bankName: '中国建设银行' },
  H00710: { holder: '郑伟', cardNo: '6214 8302 3344 5566', bankName: '招商银行' },
  R00720: { holder: '吴老', cardNo: '6228 4801 7788 9900', bankName: '中国农业银行' }
}

const compLedger = {
  M00690: {
    amount: 12800,
    agreementNo: 'CP-2026-0087',
    agreementUrl: 'https://hr.tuina-home.com/severance/CP-2026-0087'
  }
}

/** 按人取这几本账；没记过的人给空账，页面据此显示「—」而不是编一个数 */
export const ledgerOf = (p = {}) => {
  const bk = bankLedger[p.id] || null
  return {
    bean: beanLedger[p.id] || { balance: 0, pending: 0 },
    comp: compLedger[p.id] || { amount: 0, agreementNo: '', agreementUrl: '' },
    bank: bk ? { ...bk, line: `${bk.bankName} ${bk.cardNo}` } : { holder: p.name || '', cardNo: '', bankName: '', line: '' }
  }
}

/**
 * 一个员工的逐人事实（由触发前取数 intake 调用，不对外当配置）。
 *
 * 原型里只有 perms 与 debt 是真的，其余（客户数 / 在办事项 / 团队 / 资产 / 现金 / 工单）
 * 是该员工在 HR 系统里的模拟值 —— 真实系统里由客户、工单、资产、财务各系统在触发时提供。
 * 它们决定这一单长哪几条：没有团队就不长团队交接。
 */
export function factsOfPerson (p = {}) {
  const d = p.debt || {}
  const total = (d.loan || 0) + (d.advance || 0) + (d.reimburse || 0)
  const perms = p.perms || []
  const isManager = p.job === '店长'
  const assets = p.assets ?? (perms.includes('pos') ? ['工服 2 套', '工牌', '对讲机'] : ['工牌'])
  return {
    clients: p.clients ?? (p.job === '客户经理' ? 8 : p.job === '推拿师' ? 4 : 0),
    tasks: p.tasks ?? 2,
    team: p.team ?? (isManager ? 6 : 0),
    assets,
    // 专用设备不用单独配：台账里有这一项，事实就成立
    aacb: p.aacb ?? assets.some((a) => /AACB/i.test(String(a))),
    cash: p.cash ?? (isManager ? 2000 : 0),
    debt: total,
    accounts: perms,
    complaint: p.complaint ?? (p.job === '推拿师' || p.job === '客户经理' ? 1 : 0),
    severance: p.severance ?? false
  }
}

export const staffByName = (name) => staff.find((s) => s.name === name) || null
export const staffById = (id) => staff.find((s) => s.id === id) || null
export const staffOfJob = (job) => staff.filter((s) => s.job === job)

/* ---------------- 组织：区域 / 城市 / 门店 / 角色 ---------------- */

export const org = {
  regions: [
    { key: 'east', name: '华东大区', cities: ['上海', '杭州', '南京'] },
    { key: 'west', name: '西南大区', cities: ['成都'] }
  ],
  cities: [
    { name: '上海', region: '华东大区', cityHead: '冯海霞', hr: '邓黎英', stores: ['上海静安店', '上海徐汇店', '上海浦东店'] },
    { name: '杭州', region: '华东大区', cityHead: '罗嘉铭', hr: '李文静', stores: ['杭州西湖店', '杭州滨江店'] },
    { name: '南京', region: '华东大区', cityHead: '罗嘉铭', hr: '王慧', stores: ['南京新街口店'] },
    { name: '成都', region: '西南大区', cityHead: '冯海霞', hr: '刘倩', stores: ['成都春熙路店'] }
  ],
  /** 门店 → 店长 / 直属上级 */
  stores: [
    { name: '上海静安店', city: '上海', manager: '马晓东', supervisor: '朱艳秋' },
    { name: '上海徐汇店', city: '上海', manager: '刘丹', supervisor: '朱艳秋' },
    { name: '上海浦东店', city: '上海', manager: '刘丹', supervisor: '朱艳秋' },
    { name: '杭州西湖店', city: '杭州', manager: '徐立', supervisor: '钱伟' },
    { name: '杭州滨江店', city: '杭州', manager: '徐立', supervisor: '钱伟' },
    { name: '南京新街口店', city: '南京', manager: '马晓东', supervisor: '朱艳秋' },
    { name: '成都春熙路店', city: '成都', manager: '陈立群', supervisor: '钱伟' }
  ],
  /** 总部的固定责任人 */
  hq: { it: '邢斌', finance: '周芸', regionHead: '杨春燕', gm: '贺志明' }
}

export const storeInfo = (name) => org.stores.find((s) => s.name === name) || null
export const cityInfo = (name) => org.cities.find((c) => c.name === name) || null

/**
 * 角色解析：给定人/城市/门店，返回「这个角色在这是谁」。
 * Agent 生成编排时必须落到具体人，否则用户没法判断对不对。
 */
export function ownerOf (role, { person, city, store } = {}) {
  const p = person ? (typeof person === 'string' ? staffByName(person) : person) : null
  const c = city || (p && p.city) || cityInfo(storeInfo(store)?.city || '')?.name
  const st = store || (p && p.store)

  if (role === 'employee') return p?.name || ''
  if (role === 'store-manager') return storeInfo(st)?.manager || org.stores[0].manager
  if (role === 'supervisor') return storeInfo(st)?.supervisor || org.stores[0].supervisor
  if (role === 'hr') return cityInfo(c)?.hr || '邓黎英'
  if (role === 'city-head') return cityInfo(c)?.cityHead || '冯海霞'
  if (role === 'it') return org.hq.it
  if (role === 'finance') return org.hq.finance
  if (role === 'region-head') return org.hq.regionHead
  if (role === 'gm') return org.hq.gm
  return ''
}

/* ---------------- 事实装配：给 Agent 的那一份 ---------------- */

const debtTotal = (d = {}) => (d.loan || 0) + (d.advance || 0) + (d.reimburse || 0)

/**
 * 装配一份事实包。两种用法：
 *   factsFor({ person: '张三' })            → 单个人
 *   factsFor({ job: '推拿师', store: '上海徐汇店' }) → 一群人的共同事实 + 样本
 */
export function factsFor (q = {}) {
  const { person, job, store, city } = q
  const one = person ? (typeof person === 'string' ? staffByName(person) : person) : null

  if (one) {
    const shouldRemove = jobPerms[one.job] || []
    const extra = one.perms.filter((k) => !shouldRemove.includes(k))
    return {
      kind: 'person',
      person: {
        id: one.id, name: one.name, job: one.job, city: one.city, store: one.store,
        employType: one.employType, onboardAt: one.onboardAt, contractEntity: one.contractEntity
      },
      perms: one.perms.map((k) => ({ key: k, name: permName(k), side: permSide(k) })),
      jobPermStandard: shouldRemove.map((k) => ({ key: k, name: permName(k), side: permSide(k) })),
      /** 岗位标准配置之外、但这个人实际还开着的 —— Agent 该提示的漏项 */
      beyondStandard: extra.map((k) => ({ key: k, name: permName(k), side: permSide(k) })),
      debt: { ...one.debt, total: debtTotal(one.debt) },
      leave: { ...one.leave },
      roles: {
        employee: one.name,
        storeManager: ownerOf('store-manager', { store: one.store }),
        supervisor: ownerOf('supervisor', { store: one.store }),
        hr: ownerOf('hr', { city: one.city }),
        cityHead: ownerOf('city-head', { city: one.city }),
        it: ownerOf('it'),
        finance: ownerOf('finance')
      }
    }
  }

  const group = staff.filter((s) => (!job || s.job === job) && (!store || s.store === store) && (!city || s.city === city))
  return {
    kind: 'group',
    condition: { job, store, city },
    count: group.length,
    samples: group.slice(0, 5).map((s) => ({
      id: s.id, name: s.name, job: s.job, city: s.city, store: s.store, employType: s.employType,
      debtTotal: debtTotal(s.debt), annualLeft: s.leave.annual,
      extraPerms: s.perms.filter((k) => !(jobPerms[s.job] || []).includes(k)).map(permName)
    })),
    /** 这群人的共性：有几人有欠款、有几人挂着超岗位权限 */
    withDebt: group.filter((s) => debtTotal(s.debt) > 0).length,
    withExtraPerms: group.filter((s) => s.perms.some((k) => !(jobPerms[s.job] || []).includes(k))).length,
    roleCoverage: {
      hr: [...new Set(group.map((s) => ownerOf('hr', { city: s.city })))],
      storeManager: [...new Set(group.map((s) => ownerOf('store-manager', { store: s.store })))]
    }
  }
}

/** 事实 → 人读摘要（放进提示词，也放进页面给用户看「Agent 查到了什么」） */
export function factsText (facts) {
  if (!facts) return '（未指定具体人员，按岗位共性描述）'
  if (facts.kind === 'person') {
    const f = facts.person
    const lines = [
      `员工：${f.name}（${f.id}）· ${f.job} · ${f.city} / ${f.store} · ${f.employType} · 入职 ${f.onboardAt}`,
      `系统权限：${facts.perms.map((p) => `${p.name}（${p.side}）`).join('、') || '无'}`,
      `岗位应移除：${facts.jobPermStandard.map((p) => p.name).join('、') || '无'}`,
      `超出岗位标准的权限：${facts.beyondStandard.map((p) => `${p.name}（${p.side}）`).join('、') || '无'}`,
      `欠款：合计 ¥${facts.debt.total}（借款 ${facts.debt.loan}、备用金 ${facts.debt.advance}、报销 ${facts.debt.reimburse}）`,
      `假勤余额：年假 ${facts.leave.annual} 天、调休 ${facts.leave.comp} 天、病假 ${facts.leave.sick} 天`,
      `角色解析：店长 ${facts.roles.storeManager}、直属上级 ${facts.roles.supervisor}、人事经理 ${facts.roles.hr}、城市总 ${facts.roles.cityHead}`
    ]
    return lines.join('\n')
  }
  return [
    `范围：${[facts.condition.job, facts.condition.store, facts.condition.city].filter(Boolean).join(' / ') || '全体'}，共 ${facts.count} 人`,
    `其中有欠款 ${facts.withDebt} 人、挂超岗位权限 ${facts.withExtraPerms} 人`,
    `人事经理：${facts.roleCoverage.hr.join('、')}；店长：${facts.roleCoverage.storeManager.join('、')}`
  ].join('\n')
}
