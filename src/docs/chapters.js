/**
 * v2-1 产品需求文档的章节元数据。
 * 左侧菜单第三级 + 首页章节导航网格 共用此源。
 *
 * 字段：
 *   id          - 短标识（用于 url 段）
 *   order       - 序号（一/二/...）
 *   title       - 章节标题（用于菜单和卡片）
 *   subtitle    - 副标题（用于首页卡片描述）
 *   routeName   - vue-router 路由 name（用于菜单 index）
 *   path        - 路由 path（用于首页 router-link）
 *   file        - 子页 SFC 文件名（views/v2phase1/ 下）
 */
export const v2phase1Chapters = [
  {
    id: 'summary',
    order: '一',
    title: '整体概述',
    subtitle: '核心流程（端到端全链路）+ 计算周期 / 计算层级 / 负工资抵扣',
    routeName: 'doc-product-v2-phase1-summary',
    path: '/docs/product-v2-phase1/summary',
    file: 'Summary.vue'
  },
  {
    id: 'welfare-data-source',
    order: '二',
    title: '福利数据来源',
    subtitle: '社保/公积金/商业险的数据获取方式',
    routeName: 'doc-product-v2-phase1-welfare-data-source',
    path: '/docs/product-v2-phase1/welfare-data-source',
    file: 'WelfareDataSource.vue'
  },
  {
    id: 'bean',
    order: '三',
    title: '常乐豆',
    subtitle: '适用范围 + 使用规则 + 与应税收入的关系',
    routeName: 'doc-product-v2-phase1-bean',
    path: '/docs/product-v2-phase1/bean',
    file: 'Bean.vue'
  },
  {
    id: 'template',
    order: '四',
    title: '岗位薪酬模板 + 动态项',
    subtitle: '4 种用工类型模板 + 业务流转产生的动态项',
    routeName: 'doc-product-v2-phase1-template',
    path: '/docs/product-v2-phase1/template',
    file: 'Template.vue'
  },
  {
    id: 'items',
    order: '五',
    title: '薪酬项范围',
    subtitle: '按用工类型拆分的薪酬项清单',
    routeName: 'doc-product-v2-phase1-items',
    path: '/docs/product-v2-phase1/items',
    file: 'Items.vue'
  },
  {
    id: 'calculation',
    order: '六',
    title: '计算节点与时机',
    subtitle: '每个薪酬项的计算时机与数据流',
    routeName: 'doc-product-v2-phase1-calculation',
    path: '/docs/product-v2-phase1/calculation',
    file: 'Calculation.vue'
  },
  {
    id: 'examples',
    order: '七',
    title: '计算示例',
    subtitle: '全职/非全日制/兼职/返聘典型场景',
    routeName: 'doc-product-v2-phase1-examples',
    path: '/docs/product-v2-phase1/examples',
    file: 'Examples.vue'
  },
  {
    id: 'payroll',
    order: '八',
    title: '工资条组装',
    subtitle: '按主体分组的工资条结构与示例',
    routeName: 'doc-product-v2-phase1-payroll',
    path: '/docs/product-v2-phase1/payroll',
    file: 'Payroll.vue'
  },
  {
    id: 'scenarios',
    order: '九',
    title: '典型业务场景决策树',
    subtitle: '用工类型选择 / 多主体兼职 / 推拿师特殊处理',
    routeName: 'doc-product-v2-phase1-scenarios',
    path: '/docs/product-v2-phase1/scenarios',
    file: 'Scenarios.vue'
  },
  {
    id: 'money-flow',
    order: '十',
    title: '金额流转泳道图',
    subtitle: '月度结算全链路金额流转',
    routeName: 'doc-product-v2-phase1-money-flow',
    path: '/docs/product-v2-phase1/money-flow',
    file: 'MoneyFlow.vue'
  }
]
