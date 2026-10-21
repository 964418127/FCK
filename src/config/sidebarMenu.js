/**
 * 侧边栏菜单的**唯一数据源**。
 *
 * 为什么要有这个文件：
 * 之前 MainLayout.vue 的侧边栏是手写模板（48 个 el-menu-item 各自带 v-if），
 * menuCatalog.js 反而是「从模板反向生成」的。模板里没有 v-for，顺序写死在 HTML 里，
 * 于是「菜单排序」这个需求任何配置都落不了地。
 * 现在反过来：数据在这里，MainLayout 用 v-for 渲染，menuCatalog 由这里派生。
 *
 * 节点结构：
 *   { index, label, icon, to?, kind?, children? }
 *   - index  与路由 name 一致；组节点的 index 只是一个分组标识
 *   - icon   直接存组件引用（渲染时 <component :is="node.icon" />）
 *   - to     可选的跳转目标（MultiLevelMenu 的第三级用它，而不是路由 name）
 *   - kind   'multi' = 交给 MultiLevelMenu 渲染的 3 级分组；缺省为普通菜单项 / 分组
 *   - children 有就是分组（el-sub-menu），没有就是可点页面（el-menu-item）
 */
import {
  HomeFilled,
  Document,
  Calendar,
  User,
  Location,
  Clock,
  Setting,
  Shop,
  TrendCharts,
  Promotion,
  List,
  Coin,
  Check,
  Grid,
  LocationInformation,
  OfficeBuilding,
  UserFilled,
  Operation,
  Money,
  Tickets
} from '@element-plus/icons-vue'

import { employeeWelfareMenu, moduleSalaryMenu } from './menuData.js'

const [welfareGroup] = employeeWelfareMenu
const [salaryGroup] = moduleSalaryMenu

export const sidebarMenu = [
  { index: 'welcome', label: '欢迎页', icon: HomeFilled },

  // 文档中心是独立布局的入口，index 即路由 name
  { index: 'docs', label: '文档中心', icon: Document },

  // 菜单配置（/gate）刻意不出现在这里：侧边栏本身就是被配置的对象，
  // 配置项自己占一行会串味。需要手动输入地址访问。

  {
    index: 'data-validation',
    label: '数据校验',
    icon: Calendar,
    children: [{ index: 'monthly-diff-confirm', label: '月差异确认', icon: Calendar }]
  },
  {
    index: 'massage-therapist',
    label: '推拿师',
    icon: User,
    children: [
      { index: 'store-interval', label: '门店间隔时间库', icon: Location },
      { index: 'store-interval2', label: '标准时间库', icon: Location },
      { index: 'store-interval3', label: '标库3', icon: Location },
      { index: 'custom-time-strategy', label: '自定义时间策略', icon: Clock },
      { index: 'therapist-offline-config', label: '自主下线配置', icon: Setting },
      { index: 'therapist-offline-detail', label: '自主下线明细', icon: Document }
    ]
  },
  {
    index: 'store-hanging',
    label: '挂店',
    icon: Shop,
    children: [
      { index: 'store-hanging-application', label: '挂店申请管理', icon: Document },
      { index: 'store-recommendation-record', label: '挂店推荐记录', icon: TrendCharts }
    ]
  },
  {
    index: 'parttime-manager',
    label: '非全客户经理',
    icon: Calendar,
    children: [
      { index: 'parttime-task-management', label: '排班排假', icon: Calendar },
      { index: 'parttime-task-publication', label: '任务发布', icon: Promotion },
      { index: 'parttime-task-tracking', label: '任务跟踪', icon: List },
      { index: 'parttime-income-guarantee', label: '收入保底配置', icon: Coin },
      { index: 'parttime-unit-prices', label: '收入单价配置', icon: Coin }
    ]
  },
  {
    index: 'leave-management',
    label: '排排排假',
    icon: Calendar,
    children: [
      { index: 'temporary-leave-rules', label: '临时假获取规则', icon: Document },
      { index: 'schedule-leave-approval', label: '排班排假审核', icon: Check }
    ]
  },
  {
    // 原「假勤重构」「工作模式」两组已合并。
    // 排布原则：基础配置往后、越基础越靠后 ——
    // 业务结果（假期盘点）→ 规则（假期审核规则）→ 引用归属（岗位假勤方案）
    // → 配置层（出勤方案 / 假期额度方案 / 考勤组）→ 类型定义（假期类型）→ 只读基础数据（岗位列表）
    index: 'leave-mgmt',
    label: '假勤管理',
    icon: Clock,
    children: [
      { index: 'leave-wm-ledger', label: '假期盘点', icon: Tickets },
      { index: 'leave-audit-consequence', label: '审核规则', icon: Check },
      { index: 'leave-wm-work-mode', label: '岗位方案', icon: Grid },
      { index: 'leave-wm-scheme', label: '出勤方案', icon: Calendar },
      { index: 'leave-wm-quota', label: '额度方案', icon: Coin },
      { index: 'leave-wm-attendance', label: '考勤组', icon: LocationInformation },
      { index: 'leave-type-dictionary', label: '假期类型', icon: List },
      { index: 'leave-job-roster', label: '岗位列表', icon: OfficeBuilding }
    ]
  },
  {
    index: 'resign-pd',
    label: '离职',
    icon: Money,
    children: [{ index: 'resign-compensation-ledger', label: '离职补偿金明细', icon: Tickets }]
  },
  {
    index: 'bean-account',
    label: '常乐豆账户',
    icon: Coin,
    children: [
      { index: 'bean-account-list', label: '账户列表', icon: List },
      { index: 'bean-account-monthly', label: '月度信息', icon: Calendar },
      { index: 'bean-usage-detail', label: '使用明细', icon: Operation },
      { index: 'bean-therapist-detail', label: '推拿师获豆明细', icon: User },
      { index: 'bean-account-manager-detail', label: '客户经理获豆明细', icon: UserFilled },
      { index: 'bean-headquarter-detail', label: '总部岗位获豆明细', icon: OfficeBuilding }
    ]
  },
  {
    index: 'customer-manager',
    label: '客户经理',
    icon: UserFilled,
    children: [
      { index: 'shift-subsidy-config', label: '顶班补贴配置', icon: Money },
      { index: 'leave-deduction-config', label: '请假扣款配置', icon: Money }
    ]
  },

  // 这两组是 3 级菜单，由 MultiLevelMenu 渲染，数据仍在 menuData.js 里
  { ...salaryGroup, kind: 'multi' },
  { ...welfareGroup, kind: 'multi' },

  {
    index: 'finance-accrual',
    label: '财务计提',
    icon: Money,
    children: [
      { index: 'voucher-list', label: '凭证列表', icon: Document },
      { index: 'voucher-list-2', label: '发薪核对', icon: Tickets }
    ]
  }
]

/** 把一棵菜单树压成 [{index, label, children}]（给 gate 页做勾选/排序用，剥掉图标等渲染细节） */
export function toCatalog (nodes) {
  return (nodes || []).map((n) => ({
    index: n.index,
    label: n.label,
    ...(n.children ? { children: toCatalog(n.children) } : {})
  }))
}
