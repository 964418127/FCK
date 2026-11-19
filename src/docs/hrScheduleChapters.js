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
    subtitle: '现行四岗位现状 + 三个结构性空洞 + 架构对比 + v3 重构框架 + v5 求值框架（5.10–5.17）',
    routeName: 'doc-hr-schedule-scope',
    path: '/docs/hr-schedule/scope',
    file: 'sections/HS05Scope.vue'
  },
  {
    id: 'features',
    order: '六',
    title: '功能详细说明',
    nav: '功能详细说明',
    subtitle: '6.1 时段与清单 + 6.2 轮与获取 + 6.3 排班结果 + 6.4 变化与求值 + 6.5 移动端 + 6.6 通知',
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
 * 第六章「功能详细说明」下的功能章节（6.1–6.9）。
 *
 * 6.1 时段与清单 → 6.2 轮与获取 → 6.3 排班结果 → 6.4 变化与求值 → 6.5 移动端 → 6.6 通知 → 6.7 打卡 → 6.8 薪酬 → 6.9 权限契约。
 * 章序就是数据流：先配出时段与清单，再切成轮让人领，领完写进结果表，之后的变化才有的改。
 * 6.7–6.9 是人事中心并入的「支持非全合作」能力（首个落地业务：非全客户经理），挂在结果之后——打卡出工时，薪酬用工时，权限契约管边界。
 * 编号 6.x 只在第六章内部使用。
 */
export const hrScheduleFeatureChapters = [
  {
    id: '6-1',
    no: '6.1',
    title: '时段与清单',
    nav: '时段与清单',
    subtitle: '一个空间里的钟点怎么配出来：时段说时间与几个位，清单说谁能来、怎么来',
    routeName: 'doc-hr-schedule-6-1',
    path: '/docs/hr-schedule/6-1',
    file: 'sections/HS61Slot.vue'
  },
  {
    id: '6-2',
    no: '6.2',
    title: '轮与获取',
    nav: '轮与获取',
    subtitle: '轮把清单切成一段窗口：等系统派、自己点、提交申领，只有这三种动作',
    routeName: 'doc-hr-schedule-6-2',
    path: '/docs/hr-schedule/6-2',
    file: 'sections/HS62Round.vue'
  },
  {
    id: '6-3',
    no: '6.3',
    title: '排班结果',
    nav: '排班结果',
    subtitle: '谁哪天上了哪个班，只从这一张表读；附带占用矩阵、逐日名额与缺口入口',
    routeName: 'doc-hr-schedule-6-3',
    path: '/docs/hr-schedule/6-3',
    file: 'sections/HS63Result.vue'
  },
  {
    id: '6-4',
    no: '6.4',
    title: '变化与求值',
    nav: '变化与求值',
    subtitle: '关闸之后的偏差写一条事实、重算一次、事实表留痕，不回头改历史',
    routeName: 'doc-hr-schedule-6-4',
    path: '/docs/hr-schedule/6-4',
    file: 'sections/HS64Facts.vue'
  },
  {
    id: '6-5',
    no: '6.5',
    title: '移动端',
    nav: '移动端',
    subtitle: '员工在自己手机上只看两件事：我的排班、能领的班',
    routeName: 'doc-hr-schedule-6-5',
    path: '/docs/hr-schedule/6-5',
    file: 'sections/HS65Mobile.vue'
  },
  {
    id: '6-6',
    no: '6.6',
    title: '通知',
    nav: '通知',
    subtitle: '排班会发出哪些系统通知：发给员工的（已上线）、发给人事经理的（缺口通知）',
    routeName: 'doc-hr-schedule-6-6',
    path: '/docs/hr-schedule/6-6',
    file: 'sections/HS66Notice.vue'
  },
  {
    id: '6-7',
    no: '6.7',
    title: '打卡（支持非全合作）',
    nav: '打卡',
    subtitle: '人事中心提供打卡通用能力，非全客户经理第一个落地：取任务门店与时段，两次打卡成对出有效工时',
    routeName: 'doc-hr-schedule-6-7',
    path: '/docs/hr-schedule/6-7',
    file: 'sections/HS67Checkin.vue'
  },
  {
    id: '6-8',
    no: '6.8',
    title: '薪酬计算与看板（支持非全合作）',
    nav: '薪酬计算与看板',
    subtitle: '单价四级继承、保底按小时配置，保底金额 = 打卡有效工时 × 保底时薪；看板与工资确认见 6.8.5、6.8.6',
    routeName: 'doc-hr-schedule-6-8',
    path: '/docs/hr-schedule/6-8',
    file: 'sections/HS68Salary.vue'
  },
  {
    id: '6-9',
    no: '6.9',
    title: '权限与数据契约（支持非全合作）',
    nav: '权限与契约',
    subtitle: '非全与全职的权限对照、旧排班兜底逻辑的停用边界、四类角色矩阵；十一个对象的必备字段与三条硬约束',
    routeName: 'doc-hr-schedule-6-9',
    path: '/docs/hr-schedule/6-9',
    file: 'sections/HS69Governance.vue'
  },
  {
    id: '6-10',
    no: '6.10',
    title: '移除门店权限（支持非全合作）',
    nav: '门店范围',
    subtitle: '客户经理不使用门店权限：可见与可操作的门店一律取挂店范围，合作关系跟着挂店走',
    routeName: 'doc-hr-schedule-6-10',
    path: '/docs/hr-schedule/6-10',
    file: 'sections/HS610StoreScope.vue'
  }
]
