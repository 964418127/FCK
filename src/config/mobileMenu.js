/**
 * 移动端菜单数据 —— MobileMenu.vue 与 /gate「菜单配置」共用同一份，避免两处各写一份。
 *
 * id 规则：`m-` 前缀，与 Web 侧菜单 id 隔开。
 * 因为 Web 与移动端是两套入口，同一个页面在两边出现时，隐藏其中一侧不该连带另一侧。
 */
import {
  ShoppingBag,
  Setting,
  Help,
  Shop,
  CircleClose,
  Connection,
  Calendar,
  DataLine,
  Coin,
  Document,
  Bell,
  List,
  Position,
  Wallet,
  EditPen,
  Check,
  UserFilled
} from '@element-plus/icons-vue'

export const mobileMenuGroups = [
  {
    id: 'm-g-duty',
    label: '职能岗位',
    items: [
      { id: 'm-store-hanging', label: '挂店申请审核', icon: ShoppingBag, to: '/mobile-store-hanging' },
      { id: 'm-settings', label: '系统设置', icon: Setting },
      { id: 'm-help', label: '帮助中心', icon: Help }
    ]
  },
  {
    id: 'm-g-therapist',
    label: '推拿师',
    items: [
      { id: 'm-store-management', label: '挂店管理', icon: Shop, to: '/mobile-store-management' },
      { id: 'm-store-self-offline', label: '自主下线', icon: CircleClose, to: '/mobile-store-self-offline' },
      { id: 'm-store-hanging-new', label: '新挂店管理', icon: Connection, to: '/mobile-store-hanging-new' },
      { id: 'm-schedule-leave', label: '排班排假', icon: Calendar, to: '/mobile-schedule-leave' },
      { id: 'm-salary-dashboard', label: '全职薪酬看板', icon: DataLine, to: '/mobile-salary-dashboard' },
      { id: 'm-salary-dashboard-2', label: '全职薪酬看板2', icon: DataLine, to: '/mobile-salary-dashboard-2' },
      { id: 'm-pt-salary-dashboard', label: '非全日制薪酬看板', icon: DataLine, to: '/mobile-part-time-salary-dashboard' },
      { id: 'm-pt-salary-dashboard-2', label: '非全日制薪酬看板2', icon: DataLine, to: '/mobile-part-time-salary-dashboard-2' },
      { id: 'm-bean-account', label: '常乐豆账户', icon: Coin, to: '/mobile-bean-account' },
      { id: 'm-bean-view', label: '示例自助查询', icon: Document, to: '/mobile-bean-view' },
      { id: 'm-notification', label: '通知', icon: Bell, to: '/mobile-notification', badge: true }
    ]
  },
  {
    id: 'm-g-account-manager',
    label: '客户经理',
    items: [
      { id: 'm-am-salary-dashboard', label: '客户经理薪酬看板', icon: DataLine, to: '/mobile-account-manager-salary-dashboard' },
      { id: 'm-am-attendance', label: '客户经理考勤', icon: Calendar, to: '/mobile-account-manager-attendance' },
      { id: 'm-parttime-tasks', label: '非全任务列表', icon: List, to: '/mobile-parttime-tasks' },
      { id: 'm-pt-am-attendance', label: '非全客户经理打卡', icon: Position, to: '/mobile-account-manager-attendance?mode=parttime' }
    ]
  },
  {
    id: 'm-g-headquarters',
    label: '总部岗位',
    items: [
      { id: 'm-reimbursement', label: '个人报销', icon: Wallet, to: '/mobile-reimbursement-list' }
    ]
  },
  {
    id: 'm-g-leave',
    label: '请假模块',
    items: [
      { id: 'm-leave-pd', label: '请假', icon: Calendar, to: { name: 'mobile-leave-pd' } },
      { id: 'm-leave-approval', label: '假期审批', icon: Check, to: { name: 'mobile-leave-pd-approval' } }
    ]
  },
  {
    id: 'm-g-resign',
    label: '离职模块',
    items: [
      { id: 'm-resign-apply', label: '离职需求', icon: EditPen, to: { name: 'mobile-resign-apply' } },
      { id: 'm-resign-pd', label: '离职处理', icon: UserFilled, to: { name: 'mobile-resign-pd' } }
    ]
  }
]

/** 给 /gate 用的纯数据形态（不带图标组件） */
export const mobileMenuCatalog = {
  index: 'mobile-root',
  label: '移动端菜单',
  children: mobileMenuGroups.map((g) => ({
    index: g.id,
    label: g.label,
    children: g.items.map((i) => ({ index: i.id, label: i.label }))
  }))
}
