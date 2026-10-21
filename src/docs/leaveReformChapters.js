/**
 * 「假勤重构」文档模块的章节元数据。
 *
 * 与模块化薪酬的 chapters.js 同一机制 —— 单一数据源：
 * 同时供文档中心左侧菜单（menu.js）与文档中心路由（routes.js）使用，
 * 改一处，菜单与路由自动同步，不会分叉。
 *
 * 字段：
 *   id        - 短标识（用于 url 段）
 *   order     - 序号（一/二/...）
 *   title     - 章节标题（用于菜单和页面 Hero）
 *   subtitle  - 副标题（章节描述）
 *   routeName - vue-router 路由 name（用于菜单 index）
 *   path      - 路由 path
 *   file      - 子页 SFC 文件名（views/leave-reform-guide/ 下）
 */
export const leaveReformChapters = [
  {
    id: 'overview',
    order: '一',
    title: '产品需求说明',
    subtitle: '版本信息 + 变更日志 + 文档说明 + 需求背景 + 需求范围（全链路）+ 功能详细说明（含跨系统交付关系）+ 待决事项',
    routeName: 'doc-leave-reform-overview',
    path: '/docs/leave-reform/overview',
    file: 'LeaveReformOverview.vue'
  }
]
