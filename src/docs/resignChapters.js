/**
 * 「离职流程」文档模块的章节元数据。
 *
 * 单一数据源：同时供文档中心左侧菜单（menu.js）与文档中心路由（routes.js）使用，
 * 改一处，菜单与路由自动同步。
 *
 * 字段：
 *   id        - 短标识（用于 url 段）
 *   order     - 序号（一/二/...）
 *   title     - 章节标题
 *   subtitle  - 副标题
 *   routeName - vue-router 路由 name
 *   path      - 路由 path
 *   file      - 子页 SFC 文件名（views/resign-flow-guide/ 下）
 */
export const resignChapters = [
  {
    id: 'requirement',
    order: '一',
    title: '产品需求说明',
    subtitle: '按公司 PRD 模板：版本信息 / 变更日志 / 文档说明（名词解释 + 字段字典）/ 需求背景 / 需求范围 / 功能详细说明 6.1–6.9（含员工侧「离职需求」发起、处理侧「离职处理」统一处理、一次性补偿金通过模块化薪酬实现的计算与发放、方案 A/B 对比与 B 的简化形态评估）/ 附录·待决事项',
    routeName: 'doc-resign-flow-requirement',
    path: '/docs/resign-flow/requirement',
    file: 'ResignFlowRequirement.vue'
  },
  {
    id: 'mobile-guide',
    order: '二',
    title: '移动端功能说明',
    subtitle: '员工侧「离职需求」发起 + 人事侧「离职处理」的逐页说明：页面清单 / 页面结构 / 字段与控件 / 操作流程 / 校验与提示 / 边界与状态',
    routeName: 'doc-resign-flow-mobile',
    path: '/docs/resign-flow/mobile-guide',
    file: 'ResignMobileGuide.vue'
  },
  {
    id: 'pc-guide',
    order: '三',
    title: 'Web 端功能说明',
    subtitle: 'Web 侧的两块功能：离职补偿金明细（三段金额、协商协议附件、签署状态、能做什么与不能做什么）+ 模块化薪酬侧的配置（单据类型、补偿金个税系统项、发放策略「补偿金」映射、匹配人群离职维度、余额冻结后触发、人员薪酬明细展示），按配置顺序与校验口径逐项写',
    routeName: 'doc-resign-flow-pc',
    path: '/docs/resign-flow/pc-guide',
    file: 'ResignPcGuide.vue'
  }
]
