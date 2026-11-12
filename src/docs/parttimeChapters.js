/**
 * 「非全客户经理」文档模块的章节元数据（单一数据源）。
 *
 * 同时供：文档中心左侧菜单（menu.js）+ 路由（routes.js）+ 索引页章节卡片（ParttimeAccountManagerGuide.vue）。
 * 改一处，三处自动同步。
 *
 * 章节按公司 PRD 模板编号：一、版本信息 / 二、变更日志 / 三、文档说明 / 四、需求背景 / 五、需求范围 /
 * 六、功能详细说明（6.1–6.8 见 parttimeFeatureChapters）/ 七、附录。
 *
 * 排序规则：**配置在前、单据流程在后** —— 6.1 排班排假不配好，后面没有一条任务可生成。
 *
 * 字段：id / order / title / nav / subtitle / routeName / path / file
 *   title - 页面标题，可带定语（如「6.3 临时时段（取消 / 请假 / 手动 / 转移）」）
 *   nav   - 侧边栏菜单名，只要名词，不放状态与括号说明
 */
export const parttimeChapters = [
  {
    id: 'version',
    order: '一',
    title: '版本信息',
    nav: '版本信息',
    subtitle: '文档身份、负责人与适用范围',
    routeName: 'doc-parttime-version',
    path: '/docs/parttime-account-manager/version',
    file: 'sections/PT01Version.vue'
  },
  {
    id: 'changelog',
    order: '二',
    title: '变更日志',
    nav: '变更日志',
    subtitle: '本轮重写只留一条日志，之后同轮修订就地更新',
    routeName: 'doc-parttime-changelog',
    path: '/docs/parttime-account-manager/changelog',
    file: 'sections/PT02Changelog.vue'
  },
  {
    id: 'notes',
    order: '三',
    title: '文档说明',
    nav: '文档说明',
    subtitle: '跨章节共用名词 24 条 + 跨页面统一字段口径 9 条',
    routeName: 'doc-parttime-notes',
    path: '/docs/parttime-account-manager/notes',
    file: 'sections/PT03Notes.vue'
  },
  {
    id: 'background',
    order: '四',
    title: '需求背景',
    nav: '需求背景',
    subtitle: '门店按时段买供给、缺口靠人工补位；缺的是「需求 → 任务 → 履约」这一层',
    routeName: 'doc-parttime-background',
    path: '/docs/parttime-account-manager/background',
    file: 'sections/PT04Background.vue'
  },
  {
    id: 'scope',
    order: '五',
    title: '需求范围',
    nav: '需求范围',
    subtitle: '做什么 / 不做什么 + 三层业务对象 + 六类任务来源 + 分支图与端到端全流程（到收薪）+ 四类角色',
    routeName: 'doc-parttime-scope',
    path: '/docs/parttime-account-manager/scope',
    file: 'sections/PT05Scope.vue'
  },
  {
    id: 'features',
    order: '六',
    title: '功能详细说明',
    nav: '功能详细说明',
    subtitle: '6.1 配置 + 6.2–6.4 Web 任务链路 + 6.5–6.6 移动端 + 6.7 薪酬计算与看板 + 6.8 权限与契约',
    routeName: 'doc-parttime-features',
    path: '/docs/parttime-account-manager/features',
    file: 'ParttimeFeatures.vue'
  },
  {
    id: 'appendix',
    order: '七',
    title: '附录：待决事项',
    nav: '附录',
    subtitle: '不在本场景拍板但必须挂起的条目：归属方 + 卡在哪',
    routeName: 'doc-parttime-appendix',
    path: '/docs/parttime-account-manager/appendix',
    file: 'sections/PT07Appendix.vue'
  }
]

/**
 * 第六章「功能详细说明」下的功能章节（6.1–6.8）。
 *
 * 6.1 配置 → 6.2 定时生成 → 6.3 临时时段 → 6.4 Web 跟踪
 * → 6.5 移动端承接 → 6.6 移动端履约 → 6.7 收入读取 → 6.8 权限与数据契约。
 * 编号 6.x 只在第六章内部使用，页面标题即「6.1 排班排假（配置）」。
 */
export const parttimeFeatureChapters = [
  {
    id: '6-1',
    no: '6.1',
    title: '排班排假（配置）',
    nav: '排班排假',
    subtitle: '一条需求 = 门店 × 星期 × 时段 × 名额；时段上挂一条分配策略回答「先给谁」；排班日当天才可接单',
    routeName: 'doc-parttime-6-1',
    path: '/docs/parttime-account-manager/6-1',
    file: 'sections/PT61Schedule.vue'
  },
  {
    id: '6-2',
    no: '6.2',
    title: '任务发布（定时 + 手动）',
    nav: '任务发布',
    subtitle: '每周四 06:00 生成下一批（n+1）7 天，上线首周补当周一批；也可手动发布，批次限未来两周，已发布即覆盖',
    routeName: 'doc-parttime-6-2',
    path: '/docs/parttime-account-manager/6-2',
    file: 'sections/PT62Publish.vue'
  },
  {
    id: '6-3',
    no: '6.3',
    title: '临时时段（取消 / 请假 / 手动 / 转移）',
    nav: '临时时段',
    subtitle: '周期发布之外的五类时段：派单即生效、没有接受环节；派不满留运营侧重试，不覆盖原任务',
    routeName: 'doc-parttime-6-3',
    path: '/docs/parttime-account-manager/6-3',
    file: 'sections/PT63Backfill.vue'
  },
  {
    id: '6-4',
    no: '6.4',
    title: '任务跟踪（Web）',
    nav: '任务跟踪',
    subtitle: '运营看最终承接人，也看这条任务怎么变成现在的样子：来源、打卡、异常、完整日志',
    routeName: 'doc-parttime-6-4',
    path: '/docs/parttime-account-manager/6-4',
    file: 'sections/PT64Tracking.vue'
  },
  {
    id: '6-5',
    no: '6.5',
    title: '任务承接（移动端）',
    nav: '任务承接',
    subtitle: '可选任务与我的任务两个视角；先分可见、再论可接；选择成功即「待到店」，没有「待接受」',
    routeName: 'doc-parttime-6-5',
    path: '/docs/parttime-account-manager/6-5',
    file: 'sections/PT65MobileTasks.vue'
  },
  {
    id: '6-6',
    no: '6.6',
    title: '到店打卡（移动端）',
    nav: '到店打卡',
    subtitle: '入口选门店、顶部可切换、1 小时门禁、到店后才能离店；界面不出现具体打卡时间',
    routeName: 'doc-parttime-6-6',
    path: '/docs/parttime-account-manager/6-6',
    file: 'sections/PT66Attendance.vue'
  },
  {
    id: '6-7',
    no: '6.7',
    title: '薪酬计算与看板',
    nav: '薪酬计算与看板',
    subtitle: '单价按「人数档 × 客次量档」分格、格内四级继承；保底按时薪配置，保底金额 = 打卡有效工时 × 保底时薪；看板三页签与工资确认单见 6.7.5、6.7.6',
    routeName: 'doc-parttime-6-7',
    path: '/docs/parttime-account-manager/6-7',
    file: 'sections/PT67Income.vue'
  },
  {
    id: '6-8',
    no: '6.8',
    title: '权限与数据契约',
    nav: '权限与契约',
    subtitle: '非全与全职（培训期 / 转正后）的权限对照、旧排班兜底逻辑的停用、四类角色矩阵；十一个对象的必备字段与三条硬约束',
    routeName: 'doc-parttime-6-8',
    path: '/docs/parttime-account-manager/6-8',
    file: 'sections/PT68Governance.vue'
  }
]
