/**
 * 「事件编排」文档模块的章节元数据（单一数据源）。
 *
 * 同时供：文档中心左侧菜单（menu.js）+ 路由（routes.js）+ 索引页章节卡片（OrchestrationDocIndex.vue）。
 * 改一处，三处自动同步。
 *
 * 章节按公司 PRD 模板编号：一、版本信息 / 二、变更日志 / 三、文档说明 / 四、需求背景 / 五、需求范围 /
 * 六、功能详细说明（6.1–6.6 见 featureChapters）/ 七、附录。
 *
 * 字段：id / order / title / subtitle / routeName / path / file
 */
export const orchChapters = [
  {
    id: 'version',
    order: '一',
    title: '版本信息',
    subtitle: '文档身份、负责人与适用范围',
    routeName: 'doc-orch-version',
    path: '/docs/orchestration/version',
    file: 'sections/S01Version.vue'
  },
  {
    id: 'changelog',
    order: '二',
    title: '变更日志',
    subtitle: '同一轮预研只保留一条日志，改动就地更新',
    routeName: 'doc-orch-changelog',
    path: '/docs/orchestration/changelog',
    file: 'sections/S02Changelog.vue'
  },
  {
    id: 'notes',
    order: '三',
    title: '文档说明',
    subtitle: '跨章节共用的名词 16 条 + 跨页面统一的字段口径 10 条',
    routeName: 'doc-orch-notes',
    path: '/docs/orchestration/notes',
    file: 'sections/S03Notes.vue'
  },
  {
    id: 'background',
    order: '四',
    title: '需求背景',
    subtitle: '每来一类事就重画一遍流程；差异靠人记、靠分支硬塞进图里',
    routeName: 'doc-orch-background',
    path: '/docs/orchestration/background',
    file: 'sections/S04Background.vue'
  },
  {
    id: 'scope',
    order: '五',
    title: '需求范围',
    subtitle: '做什么 / 不做什么 + 定义期与实例期两段 + 一单的完整链路',
    routeName: 'doc-orch-scope',
    path: '/docs/orchestration/scope',
    file: 'sections/S05Scope.vue'
  },
  {
    id: 'features',
    order: '六',
    title: '功能详细说明',
    subtitle: '6.1 事件定义 + 6.2–6.6 一单从发起到交付',
    routeName: 'doc-orch-features',
    path: '/docs/orchestration/features',
    file: 'OrchestrationFeatures.vue'
  },
  {
    id: 'appendix',
    order: '七',
    title: '附录：待决事项',
    subtitle: '已拍板的不再挂；仍挂起的写明归属方 + 卡在哪',
    routeName: 'doc-orch-appendix',
    path: '/docs/orchestration/appendix',
    file: 'sections/S07Appendix.vue'
  }
]

/**
 * 第六章「功能详细说明」下的功能章节（6.1–6.6）。
 *
 * 排序规则与离职流程一致：**定义在前、单据在后**。
 * 6.1 是定义一件事（提示词 + 子事件清单 + 适用范围 + 触点），没有它就没有任何一单；
 * 6.2–6.6 才是一单的时间线：发起 → 生成 → 办理 → 系统项 → 进度与交付。
 */
export const orchFeatureChapters = [
  {
    id: '6-1',
    no: '6.1',
    title: '事件定义（配置）',
    subtitle: '管谁 / 提示词 / 子事件清单 / 怎么触发：一次定义，之后每一单按事实生成',
    routeName: 'doc-orch-6-1',
    path: '/docs/orchestration/6-1',
    file: 'sections/O61Define.vue'
  },
  {
    id: '6-2',
    no: '6.2',
    title: '发起与触发取数',
    subtitle: '员工两步发起 + 引擎固定两步取数（员工档案 / 逐人事实）',
    routeName: 'doc-orch-6-2',
    path: '/docs/orchestration/6-2',
    file: 'sections/O62Apply.vue'
  },
  {
    id: '6-3',
    no: '6.3',
    title: '子事件生成',
    subtitle: '清单 × 事实 = 这一单要办的事；差异只来自事实，缺一条就不算办完',
    routeName: 'doc-orch-6-3',
    path: '/docs/orchestration/6-3',
    file: 'sections/O63Generate.vue'
  },
  {
    id: '6-4',
    no: '6.4',
    title: '办理',
    subtitle: '移动端事项办理：轮到谁、这一环交什么、结论怎么给；审核就是其中一条结论',
    routeName: 'doc-orch-6-4',
    path: '/docs/orchestration/6-4',
    file: 'sections/O64Handle.vue'
  },
  {
    id: '6-5',
    no: '6.5',
    title: '系统判定与系统执行',
    subtitle: '判定看批次、执行看回执；取数频率归节点，结果可被下游按字段引用',
    routeName: 'doc-orch-6-5',
    path: '/docs/orchestration/6-5',
    file: 'sections/O65System.vue'
  },
  {
    id: '6-6',
    no: '6.6',
    title: '进度、调整与交付',
    subtitle: '一单走到哪、哪些还能改、改了什么要回到定义层；交付只交事实',
    routeName: 'doc-orch-6-6',
    path: '/docs/orchestration/6-6',
    file: 'sections/O66Progress.vue'
  }
]
