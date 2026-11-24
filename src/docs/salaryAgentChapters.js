/**
 * 「薪酬查询 Agent」文档模块的章节元数据（单一数据源）。
 *
 * 挂在【模块化薪酬】分组下。同时供：文档中心左侧菜单（menu.js）+ 路由（routes.js）
 * + 索引页章节卡片（SalaryAgentGuide.vue）。
 *
 * 章节按公司 PRD 模板编号：一、版本信息 / 二、变更日志 / 三、文档说明 / 四、需求背景 /
 * 五、需求范围 / 六、功能详细说明（6.1 查询范围 / 6.2 围墙 / 6.3 回答口径 / 6.4 产品入口）/
 * 七、附录（7.1 待决事项 / 7.2 薪酬项清单·客户经理 / 7.3 薪酬项清单·推拿师 / 7.4 薪酬项清单·非全推拿师）。
 */
export const salaryAgentChapters = [
  {
    id: 'version',
    order: '一',
    title: '版本信息',
    nav: '版本信息',
    subtitle: '文档身份、负责人与适用范围',
    routeName: 'doc-salary-agent-version',
    path: '/docs/salary-agent/version',
    file: 'sections/SA01Version.vue'
  },
  {
    id: 'changelog',
    order: '二',
    title: '变更日志',
    nav: '变更日志',
    subtitle: '本轮成文只留一条日志，之后同轮修订就地更新',
    routeName: 'doc-salary-agent-changelog',
    path: '/docs/salary-agent/changelog',
    file: 'sections/SA02Changelog.vue'
  },
  {
    id: 'notes',
    order: '三',
    title: '文档说明',
    nav: '文档说明',
    subtitle: '跨章节共用的名词口径，先在这里定死',
    routeName: 'doc-salary-agent-notes',
    path: '/docs/salary-agent/notes',
    file: 'sections/SA03Notes.vue'
  },
  {
    id: 'background',
    order: '四',
    title: '需求背景',
    nav: '需求背景',
    subtitle: '核对期的人肉排查消耗：员工先自查自证，剩余升级人工',
    routeName: 'doc-salary-agent-background',
    path: '/docs/salary-agent/background',
    file: 'sections/SA04Background.vue'
  },
  {
    id: 'scope',
    order: '五',
    title: '需求范围',
    nav: '需求范围',
    subtitle: '一张图看范围：提问链路 → 做的四件事 → 不做在围墙外 → 岗位覆盖 2×2',
    routeName: 'doc-salary-agent-scope',
    path: '/docs/salary-agent/scope',
    file: 'sections/SA05Scope.vue'
  },
  {
    id: 'features',
    order: '六',
    title: '功能详细说明',
    nav: '功能详细说明',
    subtitle: '6.1 查询范围与两类信息 → 6.2 围墙与字段裁剪 → 6.3 回答口径与人工出口',
    routeName: 'doc-salary-agent-features',
    path: '/docs/salary-agent/features',
    file: 'SalaryAgentFeatures.vue'
  },
  {
    id: 'appendix',
    order: '七',
    title: '附录',
    nav: '附录',
    subtitle: '7.1 待决事项 · 7.2/7.3 各岗位现行薪酬项清单（现金/常乐豆底账）',
    routeName: 'doc-salary-agent-appendix',
    path: '/docs/salary-agent/appendix',
    file: 'SalaryAgentAppendix.vue'
  }
]

/**
 * 第七章「附录」下的三个附录章节。
 * 编号 7.x 只在第七章内部使用，页面标题即「7.1 待决事项」。
 * 7.2 / 7.3 / 7.4 是各岗位现行生效的薪酬项清单（含现金/常乐豆形式归属），
 * 供围墙设计针对性裁剪的底账，清单本身是研发/薪酬侧维护的数据，会随策略演进更新。
 */
export const salaryAgentAppendixChapters = [
  {
    id: '7-1',
    no: '7.1',
    title: '待决事项',
    nav: '待决事项',
    subtitle: '不在本轮拍板但必须挂起的条目：归属方 + 卡在哪',
    routeName: 'doc-salary-agent-7-1',
    path: '/docs/salary-agent/7-1',
    file: 'sections/SA71Pending.vue'
  },
  {
    id: '7-2',
    no: '7.2',
    title: '薪酬项清单：全日制客户经理',
    nav: '清单·客户经理',
    subtitle: '客户经理收入 V69 现行薪酬项：显示名 / 内部名 / 分组 / 现金或常乐豆',
    routeName: 'doc-salary-agent-7-2',
    path: '/docs/salary-agent/7-2',
    file: 'sections/SA72ItemsCM.vue'
  },
  {
    id: '7-3',
    no: '7.3',
    title: '薪酬项清单：全职推拿师',
    nav: '清单·推拿师',
    subtitle: '三个模板合并的现行薪酬项：显示名 / 内部名 / 模板 / 现金或常乐豆',
    routeName: 'doc-salary-agent-7-3',
    path: '/docs/salary-agent/7-3',
    file: 'sections/SA73ItemsMasseur.vue'
  },
  {
    id: '7-4',
    no: '7.4',
    title: '薪酬项清单：非全日制推拿师',
    nav: '清单·非全推拿师',
    subtitle: '策略「9月及以后非全收入」现行薪酬项：显示名 / 内部名 / 全部现金、无常乐豆',
    routeName: 'doc-salary-agent-7-4',
    path: '/docs/salary-agent/7-4',
    file: 'sections/SA74ItemsParttime.vue'
  }
]

/**
 * 第六章「功能详细说明」下的三个功能章节。
 * 编号 6.x 只在第六章内部使用，页面标题即「6.1 查询范围与两类信息」。
 */
export const salaryAgentFeatureChapters = [
  {
    id: '6-1',
    no: '6.1',
    title: '查询范围与两类信息',
    nav: '查询范围',
    subtitle: '政策类答适用本人的命中值+依据；明细类答工资条原样',
    routeName: 'doc-salary-agent-6-1',
    path: '/docs/salary-agent/6-1',
    file: 'sections/SA61QueryScope.vue'
  },
  {
    id: '6-2',
    no: '6.2',
    title: '围墙与字段裁剪',
    nav: '围墙',
    subtitle: '三道关：只能查自己、敏感信息不在场、只读；裁剪在喂给 Agent 之前做',
    routeName: 'doc-salary-agent-6-2',
    path: '/docs/salary-agent/6-2',
    file: 'sections/SA62Walls.vue'
  },
  {
    id: '6-3',
    no: '6.3',
    title: '回答口径与人工出口',
    nav: '回答口径',
    subtitle: '代扣三类只答结论；非全不缴社保公积金、个税按周预扣多退少补；人工出口',
    routeName: 'doc-salary-agent-6-3',
    path: '/docs/salary-agent/6-3',
    file: 'sections/SA63Answers.vue'
  },
  {
    id: '6-4',
    no: '6.4',
    title: '产品入口与使用链路',
    nav: '产品入口',
    subtitle: '单独入口【薪酬咨询助手】（暂定名）；进入即锁定本人，一条链路到人工出口',
    routeName: 'doc-salary-agent-6-4',
    path: '/docs/salary-agent/6-4',
    file: 'sections/SA64Entry.vue'
  }
]
