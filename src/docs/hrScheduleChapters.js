/**
 * 「人事中心 · 排班策略」文档模块的章节元数据（单一数据源）。
 *
 * 同时供：文档中心左侧菜单（menu.js）+ 路由（routes.js）+ 索引页章节卡片（HrScheduleGuide.vue）。
 * 改一处，三处自动同步。
 *
 * 章节按公司 PRD 模板编号：一、版本信息 / 二、变更日志 / 三、文档说明 / 四、需求背景 / 五、需求范围 /
 * 六、功能详细说明（6.1–6.5 见 hrScheduleFeatureChapters）/ 七、附录。
 *
 * 排序规则：**配置在前、结果在后** —— 6.1 时段不配出来，后面没有一条名额可铺。
 *
 * 字段：id / order / title / nav / subtitle / routeName / path / file
 *   title - 页面标题，可带定语
 *   nav   - 侧边栏菜单名，只要名词，不放状态与括号说明
 */
export const hrScheduleChapters = [
  {
    id: 'version',
    order: '一',
    title: '版本信息',
    nav: '版本信息',
    subtitle: '文档身份、负责人与适用范围',
    routeName: 'doc-hr-schedule-version',
    path: '/docs/hr-schedule/version',
    file: 'sections/HS01Version.vue'
  },
  {
    id: 'changelog',
    order: '二',
    title: '变更日志',
    nav: '变更日志',
    subtitle: '本版为重构基线首版，之后同一轮修订就地更新',
    routeName: 'doc-hr-schedule-changelog',
    path: '/docs/hr-schedule/changelog',
    file: 'sections/HS02Changelog.vue'
  },
  {
    id: 'notes',
    order: '三',
    title: '文档说明',
    nav: '文档说明',
    subtitle: '跨章节共用名词 26 条 + 字段口径 9 条',
    routeName: 'doc-hr-schedule-notes',
    path: '/docs/hr-schedule/notes',
    file: 'sections/HS03Notes.vue'
  },
  {
    id: 'background',
    order: '四',
    title: '需求背景',
    nav: '需求背景',
    subtitle: '四个岗位四套排法；缺的不是功能，是「时段」与「谁有资格占」这两件事没分开',
    routeName: 'doc-hr-schedule-background',
    path: '/docs/hr-schedule/background',
    file: 'sections/HS04Background.vue'
  },
  {
    id: 'scope',
    order: '五',
    title: '需求范围',
    nav: '需求范围',
    subtitle: '现行四岗位排班现状 + 三个结构性空洞 + 架构对比（一条策略 vs 四层）+ 重构框架 + 端到端与时序',
    routeName: 'doc-hr-schedule-scope',
    path: '/docs/hr-schedule/scope',
    file: 'sections/HS05Scope.vue'
  },
  {
    id: 'features',
    order: '六',
    title: '功能详细说明',
    nav: '功能详细说明',
    subtitle: '6.1 容器与时段 + 6.2 时段模板与班次库 + 6.3 获取规则（模式 / 轮 / 余额）+ 6.4 排班结果 + 6.5 移动端选班',
    routeName: 'doc-hr-schedule-features',
    path: '/docs/hr-schedule/features',
    file: 'HrScheduleFeatures.vue'
  },
  {
    id: 'appendix',
    order: '七',
    title: '附录：已拍板与待决',
    nav: '附录',
    subtitle: '六条已拍板口径 + 六条挂起事项：归属方 + 卡在哪',
    routeName: 'doc-hr-schedule-appendix',
    path: '/docs/hr-schedule/appendix',
    file: 'sections/HS07Appendix.vue'
  }
]

/**
 * 第六章「功能详细说明」下的功能章节（6.1–6.5）。
 *
 * 6.1 容器与时段 → 6.2 时段模板与班次库 → 6.3 获取规则
 * → 6.4 排班结果 → 6.5 移动端选班。编号 6.x 只在第六章内部使用。
 */
export const hrScheduleFeatureChapters = [
  {
    id: '6-1',
    no: '6.1',
    title: '容器与时段',
    nav: '容器与时段',
    subtitle: '时段只描述时间形态（班次 / 星期 / 名额 / 生成节奏），不说「谁能领」；来源三态：引用模板 / 门店自建 / 引用后改',
    routeName: 'doc-hr-schedule-6-1',
    path: '/docs/hr-schedule/6-1',
    file: 'sections/HS61Slot.vue'
  },
  {
    id: '6-2',
    no: '6.2',
    title: '时段模板与班次库',
    nav: '模板与班次',
    subtitle: '两个模板语义不同：班次模板引用即继承（跨店可比对），时段模板快照实例化（改模板不动存量）',
    routeName: 'doc-hr-schedule-6-2',
    path: '/docs/hr-schedule/6-2',
    file: 'sections/HS62Template.vue'
  },
  {
    id: '6-3',
    no: '6.3',
    title: '获取规则（模式 / 轮 / 余额）',
    nav: '获取规则',
    subtitle: '三种模式 + 轮的三个时刻（开放 → 截止 → 结算）+ 余额三条去向（再开一轮 / 兜底序列 / 不管）',
    routeName: 'doc-hr-schedule-6-3',
    path: '/docs/hr-schedule/6-3',
    file: 'sections/HS63Rule.vue'
  },
  {
    id: '6-4',
    no: '6.4',
    title: '排班结果',
    nav: '排班结果',
    subtitle: '唯一记录口：审核通过一条、兜底安排一条，都写既有结果表；带「怎么排上的」与落空余量',
    routeName: 'doc-hr-schedule-6-4',
    path: '/docs/hr-schedule/6-4',
    file: 'sections/HS64Result.vue'
  },
  {
    id: '6-5',
    no: '6.5',
    title: '移动端选班',
    nav: '移动端选班',
    subtitle: '一套壳按资格过滤：可选班次 / 我的排班 / 通知；待审与被挤出必须各有下一步，否则链路断在人身上',
    routeName: 'doc-hr-schedule-6-5',
    path: '/docs/hr-schedule/6-5',
    file: 'sections/HS65Mobile.vue'
  }
]
