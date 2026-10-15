/**
 * 「假勤重构」文档模块的章节元数据。
 *
 * ⚠️ 该模块整体为**预研探路稿**（非正式结论）：内容来自「先做一点看看」的推演，
 *    用于内部讨论与对外口径对齐，不作需求基线。推演收敛并经评审后再升格。
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
    title: '设计总览',
    subtitle: '【预研稿·非结论】定位与边界 + 七个模型假设 + 文档结构规划 + 交付形态 + 模块优先级 + 能力登记表 + 待决事项',
    routeName: 'doc-leave-reform-overview',
    path: '/docs/leave-reform/overview',
    file: 'LeaveReformOverview.vue'
  }
]
