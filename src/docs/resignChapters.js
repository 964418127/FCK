/**
 * 「离职流程」文档模块的章节元数据（单一数据源）。
 *
 * 同时供：文档中心左侧菜单（menu.js）+ 路由（routes.js）+ 索引页章节卡片（ResignFlowDocIndex.vue）。
 * 改一处，三处自动同步。
 *
 * 章节按公司 PRD 模板编号：一、版本信息 / 二、变更日志 / 三、文档说明 / 四、需求背景 / 五、需求范围 /
 * 六、功能详细说明（6.1–6.6 见 featureChapters）/ 七、附录。
 *
 * 字段：id / order / title / subtitle / routeName / path / file
 */
export const resignChapters = [
  {
    id: 'version',
    order: '一',
    title: '版本信息',
    subtitle: '文档身份、负责人与适用范围',
    routeName: 'doc-resign-flow-version',
    path: '/docs/resign-flow/version',
    file: 'sections/S01Version.vue'
  },
  {
    id: 'changelog',
    order: '二',
    title: '变更日志',
    subtitle: '同一轮预研只保留一条日志，改动就地更新',
    routeName: 'doc-resign-flow-changelog',
    path: '/docs/resign-flow/changelog',
    file: 'sections/S02Changelog.vue'
  },
  {
    id: 'notes',
    order: '三',
    title: '文档说明',
    subtitle: '跨章节共用的名词 12 条 + 跨页面统一的字段口径 7 条',
    routeName: 'doc-resign-flow-notes',
    path: '/docs/resign-flow/notes',
    file: 'sections/S03Notes.vue'
  },
  {
    id: 'background',
    order: '四',
    title: '需求背景',
    subtitle: '解除用工只是状态写入，下游各自被动反应；缺的是资产处置这一层',
    routeName: 'doc-resign-flow-background',
    path: '/docs/resign-flow/background',
    file: 'sections/S04Background.vue'
  },
  {
    id: 'scope',
    order: '五',
    title: '需求范围',
    subtitle: '做什么 / 不做什么 + 单向方向 + 全链路总览 + 资产流向与税务归集 + 检查 Agent 运行结构',
    routeName: 'doc-resign-flow-scope',
    path: '/docs/resign-flow/scope',
    file: 'sections/S05Scope.vue'
  },
  {
    id: 'features',
    order: '六',
    title: '功能详细说明',
    subtitle: '6.1 前置配置 + 6.2–6.6 一条离职单的逐环节规则与页面',
    routeName: 'doc-resign-flow-features',
    path: '/docs/resign-flow/features',
    file: 'ResignFlowFeatures.vue'
  },
  {
    id: 'appendix',
    order: '七',
    title: '附录：待决事项',
    subtitle: '不在本场景拍板但必须挂起的条目：归属方 + 卡在哪',
    routeName: 'doc-resign-flow-appendix',
    path: '/docs/resign-flow/appendix',
    file: 'sections/S07Appendix.vue'
  }
]

/**
 * 第六章「功能详细说明」下的功能章节（6.1–6.6）。
 *
 * 排序规则：**配置在前、单据流程在后**。
 * 6.1 是上线前的一次性配置（离职流程模板 / 系统检查项），没有它就没有后续任何一条单据；
 * 6.2–6.6 才是一条离职单的时间线：发起 → 审核 → 签署 → 发放 → 交付。
 * 编号 6.x 只在第六章内部使用，页面标题即「6.1 离职交接（配置 + 执行）」。
 */
export const featureChapters = [
  {
    id: '6-1',
    no: '6.1',
    title: '离职交接（配置 + 执行）',
    subtitle: '先配模板与系统检查（谁审、谁交接、卡什么），再走每笔单的交接清单与办结推送',
    routeName: 'doc-resign-flow-6-1',
    path: '/docs/resign-flow/6-1',
    file: 'sections/S61Handover.vue'
  },
  {
    id: '6-2',
    no: '6.2',
    title: '离职需求发起',
    subtitle: '员工填报（两步 + 签字）、提交后系统做什么、三类人员的差异与校验',
    routeName: 'doc-resign-flow-6-2',
    path: '/docs/resign-flow/6-2',
    file: 'sections/S62Apply.vue'
  },
  {
    id: '6-3',
    no: '6.3',
    title: '离职处理与审核',
    subtitle: '两个 Tab、审核一次定稿（两个效果）、剩余资产与出口、补偿金录入、解除用工',
    routeName: 'doc-resign-flow-6-3',
    path: '/docs/resign-flow/6-3',
    file: 'sections/S63Process.vue'
  },
  {
    id: '6-4',
    no: '6.4',
    title: '签署与补偿金明细',
    subtitle: '协议先走、金额后置：电子签状态机 + 一条补偿金的时间顺序与三段金额 + 明细要回答的五件事',
    routeName: 'doc-resign-flow-6-4',
    path: '/docs/resign-flow/6-4',
    file: 'sections/S64Contract.vue'
  },
  {
    id: '6-5',
    no: '6.5',
    title: '一次性补偿金的计算与发放',
    subtitle: '作为发放策略第三类单据：配置段 + 运行段 11 步、两个数据对象、补偿金个税系统项',
    routeName: 'doc-resign-flow-6-5',
    path: '/docs/resign-flow/6-5',
    file: 'sections/S65Payroll.vue'
  },
  {
    id: '6-6',
    no: '6.6',
    title: '下游交付',
    subtitle: '只交付「离职事实 + 实际离职日期」，七个消费方各处理自己那一环',
    routeName: 'doc-resign-flow-6-6',
    path: '/docs/resign-flow/6-6',
    file: 'sections/S66Delivery.vue'
  }
]
