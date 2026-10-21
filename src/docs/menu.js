/**
 * 文档中心左侧菜单数据源。
 * 被 DocCenterLayout.vue 运行时 import 使用；
 * 未来生成静态 HTML 时也可 import 此文件序列化输出导航。
 *
 * 数据形态：树形数组。
 *   index   - 节点唯一标识（vue-router name 或分组 key）
 *   label   - 显示文本
 *   icon    - Element Plus 图标组件（运行时用）
 *   children - 子节点（数组）
 *
 * 渲染规则（见 MultiLevelMenu.vue）：
 *   - 一级有 children → 一级分组（可折叠）
 *   - 二级有 children → 二级分组（可折叠）
 *   - 二级无 children → 二级页面（叶子）
 *   - 三级永远是叶子页面，点击 router.push({ name: index })
 */
import { Document, InfoFilled, Reading, UserFilled, Clock, SwitchButton } from '@element-plus/icons-vue'
import { v2phase1Chapters } from './chapters.js'
import { leaveReformChapters } from './leaveReformChapters.js'
import { resignChapters } from './resignChapters.js'

// 把 chapters 转换成菜单叶子节点
const v2phase1MenuChildren = v2phase1Chapters.map(ch => ({
  index: ch.routeName,
  label: `${ch.order}、${ch.title}`
}))

// 假勤重构模块：同样由章节元数据生成，与路由保持单一数据源
const leaveReformMenuChildren = leaveReformChapters.map(ch => ({
  index: ch.routeName,
  label: `${ch.order}、${ch.title}`
}))

// 离职流程模块：同样由章节元数据生成
const resignMenuChildren = resignChapters.map(ch => ({
  index: ch.routeName,
  label: `${ch.order}、${ch.title}`
}))

export const docMenu = [
  {
    index: 'doc-product',
    label: '模块化薪酬',
    icon: Document,
    children: [
      {
        index: 'doc-product-v2-phase1',
        label: '产品需求v2（阶段1）',
        icon: Reading,
        to: '/docs/product-v2-phase1',
        children: v2phase1MenuChildren
      },
      {
        index: 'doc-product-v2',
        label: '产品需求v2',
        icon: Reading,
        to: '/docs/product-v2',
        children: [
          { index: 'doc-product-v2-financial-voucher', label: '十一、财务计提凭证' }
        ]
      },
      {
        index: 'doc-product-v1',
        label: '产品需求v1',
        icon: Reading
      }
    ]
  },
  {
    index: 'doc-personnel-welfare',
    label: '人事福利',
    icon: Document,
    children: [
      {
        index: 'doc-personnel-change-flow',
        label: '人员异动流程',
        icon: Reading,
        to: '/docs/personnel-change-flow',
        children: [
          { index: 'doc-personnel-change-flow-function', label: '一、功能流程说明' },
          { index: 'doc-personnel-change-flow-requirement', label: '二、产品需求说明' }
        ]
      },
      {
        index: 'doc-welfare-guide',
        label: '福利保障说明',
        icon: InfoFilled,
        to: '/docs/welfare-guide'
      }
    ]
  },
  {
    index: 'doc-parttime-account-manager',
    label: '非全客户经理',
    icon: UserFilled,
    to: '/docs/parttime-account-manager',
    children: [
      {
        index: 'doc-parttime-am-attendance',
        label: '考勤打卡',
        icon: Reading
      },
      {
        index: 'doc-parttime-am-functions',
        label: '功能模块',
        icon: Reading
      }
    ]
  },
  {
    index: 'doc-leave-reform',
    label: '假勤管理',
    icon: Clock,
    children: leaveReformMenuChildren
  },
  {
    index: 'doc-resign-flow',
    label: '离职流程',
    icon: SwitchButton,
    children: resignMenuChildren
  }
]

/** 纯数据形态（剥掉图标组件与 to），供 /gate「菜单配置」页的「文档中心」页签使用 */
const plainDocMenu = (nodes) => nodes.map((n) => ({
  index: n.index,
  label: n.label,
  ...(n.children ? { children: plainDocMenu(n.children) } : {})
}))

export const docMenuCatalog = plainDocMenu(docMenu)
