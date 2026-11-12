/**
 * 「通用参数（升级）」文档模块的章节元数据（单一数据源）。
 *
 * 挂在【模块化薪酬】分组下，是一份升级说明，不单独占一个一级分组。
 * 同时供：文档中心左侧菜单（menu.js）+ 路由（routes.js）+ 索引页章节卡片（GeneralParamGuide.vue）。
 *
 * 章节按公司 PRD 模板编号：一、版本信息 / 二、变更日志 / 三、文档说明 / 四、需求背景 /
 * 五、需求范围 / 六、功能详细说明（6.1 配置 / 6.2 在薪酬项里用 / 6.3 示例）/ 七、附录。
 *
 * 功能章节只三节：界面上的配置、界面上怎么用、一个示例。规则写在这三节里，不再另立「命中与兜底」
 * 「权限与契约」等独立章节 —— 一份升级文档要能一次读完。
 */
export const generalParamChapters = [
  {
    id: 'version',
    order: '一',
    title: '版本信息',
    nav: '版本信息',
    subtitle: '文档身份、负责人与适用范围',
    routeName: 'doc-gp-version',
    path: '/docs/general-param/version',
    file: 'sections/GP01Version.vue'
  },
  {
    id: 'changelog',
    order: '二',
    title: '变更日志',
    nav: '变更日志',
    subtitle: '本轮成文只留一条日志，之后同轮修订就地更新',
    routeName: 'doc-gp-changelog',
    path: '/docs/general-param/changelog',
    file: 'sections/GP02Changelog.vue'
  },
  {
    id: 'notes',
    order: '三',
    title: '文档说明',
    nav: '文档说明',
    subtitle: '跨章节共用的名词与字段口径，先在这里定死',
    routeName: 'doc-gp-notes',
    path: '/docs/general-param/notes',
    file: 'sections/GP03Notes.vue'
  },
  {
    id: 'background',
    order: '四',
    title: '需求背景',
    nav: '需求背景',
    subtitle: '会变的数字写在公式里：改一次价要动多处薪酬项，地区与门店差异只能人工核',
    routeName: 'doc-gp-background',
    path: '/docs/general-param/background',
    file: 'sections/GP04Background.vue'
  },
  {
    id: 'scope',
    order: '五',
    title: '需求范围',
    nav: '需求范围',
    subtitle: '做什么 / 不做什么，以及参数、数据表、取值函数三个对象的分工',
    routeName: 'doc-gp-scope',
    path: '/docs/general-param/scope',
    file: 'sections/GP05Scope.vue'
  },
  {
    id: 'features',
    order: '六',
    title: '功能详细说明',
    nav: '功能详细说明',
    subtitle: '6.1 配置参数与数据表 → 6.2 在薪酬项里怎么用 → 6.3 示例',
    routeName: 'doc-gp-features',
    path: '/docs/general-param/features',
    file: 'GeneralParamFeatures.vue'
  },
  {
    id: 'appendix',
    order: '七',
    title: '附录：待决事项',
    nav: '附录',
    subtitle: '不在本轮拍板但必须挂起的条目：归属方 + 卡在哪',
    routeName: 'doc-gp-appendix',
    path: '/docs/general-param/appendix',
    file: 'sections/GP07Appendix.vue'
  }
]

/**
 * 第六章「功能详细说明」下的三个功能章节。
 * 编号 6.x 只在第六章内部使用，页面标题即「6.1 配置参数与数据表」。
 */
export const generalParamFeatureChapters = [
  {
    id: '6-1',
    no: '6.1',
    title: '配置参数与数据表',
    nav: '配置',
    subtitle: '参数列表只管名字与启停；值类型是数据表时另开一页配列与数据，配完就地试算',
    routeName: 'doc-gp-6-1',
    path: '/docs/general-param/6-1',
    file: 'sections/GP61Config.vue'
  },
  {
    id: '6-2',
    no: '6.2',
    title: '在薪酬项里使用',
    nav: '薪酬项里使用',
    subtitle: '插入参数时配两件事：取哪一列、用哪些条件查；条件按「条件列 → 符号 → 传入的值」读',
    routeName: 'doc-gp-6-2',
    path: '/docs/general-param/6-2',
    file: 'sections/GP62Usage.vue'
  },
  {
    id: '6-3',
    no: '6.3',
    title: '示例说明',
    nav: '示例',
    subtitle: '保底时薪一张覆盖表；客次 / 新客 / 评价单价各一张同构表',
    routeName: 'doc-gp-6-3',
    path: '/docs/general-param/6-3',
    file: 'sections/GP63Example.vue'
  }
]
