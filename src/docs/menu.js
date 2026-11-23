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
import { Document, InfoFilled, Reading, UserFilled, Clock, SwitchButton, HomeFilled, Connection, OfficeBuilding } from '@element-plus/icons-vue'
import { v2phase1Chapters } from './chapters.js'
import { leaveReformChapters } from './leaveReformChapters.js'
import { resignChapters, featureChapters } from './resignChapters.js'
import { orchChapters, orchFeatureChapters } from './orchestrationChapters.js'
import { parttimeChapters, parttimeFeatureChapters } from './parttimeChapters.js'
import { generalParamChapters, generalParamFeatureChapters } from './generalParamChapters.js'
import { salaryAgentChapters, salaryAgentFeatureChapters, salaryAgentAppendixChapters } from './salaryAgentChapters.js'
import { hrScheduleChapters, hrScheduleFeatureChapters } from './hrScheduleChapters.js'

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

// 离职流程模块：一份文档（索引页）+ 章节叶子。
// 侧边栏最多三级，「六、功能详细说明」的 6.x 不再往下嵌，改用一级缩进（indent）表示归属。
const resignChapterMenu = resignChapters.flatMap(ch => {
  const node = { index: ch.routeName, label: `${ch.order}、${ch.nav || ch.title}` }
  if (ch.id !== 'features') return [node]
  return [
    node,
    ...featureChapters.map(f => ({ index: f.routeName, label: `${f.no} ${f.nav || f.title}`, indent: true }))
  ]
})

// 事件编排模块：同样由章节元数据展开（6.x 用一级缩进表示归属，与离职流程同一套写法）
const orchChapterMenu = orchChapters.flatMap(ch => {
  const node = { index: ch.routeName, label: `${ch.order}、${ch.nav || ch.title}` }
  if (ch.id !== 'features') return [node]
  return [
    node,
    ...orchFeatureChapters.map(f => ({ index: f.routeName, label: `${f.no} ${f.nav || f.title}`, indent: true }))
  ]
})

// 非全客户经理模块：同离职流程写法，6.x 用一级缩进表示归属。
// 菜单名取 nav（纯名词），不取 title —— title 带定语与括号说明，塞进侧栏太长。
const parttimeChapterMenu = parttimeChapters.flatMap(ch => {
  const node = { index: ch.routeName, label: `${ch.order}、${ch.nav || ch.title}` }
  if (ch.id !== 'features') return [node]
  return [
    node,
    ...parttimeFeatureChapters.map(f => ({ index: f.routeName, label: `${f.no} ${f.nav || f.title}`, indent: true }))
  ]
})

// 人事中心 · 排班策略模块：同离职流程写法，6.x 用一级缩进表示归属。
const hrScheduleChapterMenu = hrScheduleChapters.flatMap(ch => {
  const node = { index: ch.routeName, label: `${ch.order}、${ch.nav || ch.title}` }
  if (ch.id !== 'features') return [node]
  return [
    node,
    ...hrScheduleFeatureChapters.map(f => ({ index: f.routeName, label: `${f.no} ${f.nav || f.title}`, indent: true }))
  ]
})

// 通用参数（升级）模块：与非全同一套写法，6.x 用一级缩进表示归属。
const generalParamChapterMenu = generalParamChapters.flatMap(ch => {
  const node = { index: ch.routeName, label: `${ch.order}、${ch.nav || ch.title}` }
  if (ch.id !== 'features') return [node]
  return [
    node,
    ...generalParamFeatureChapters.map(f => ({ index: f.routeName, label: `${f.no} ${f.nav || f.title}`, indent: true }))
  ]
})

// 薪酬查询 Agent 模块：与通用参数同一套写法，6.x 用一级缩进表示归属。
const salaryAgentChapterMenu = salaryAgentChapters.flatMap(ch => {
  const node = { index: ch.routeName, label: `${ch.order}、${ch.nav || ch.title}` }
  if (ch.id === 'features') {
    return [
      node,
      ...salaryAgentFeatureChapters.map(f => ({ index: f.routeName, label: `${f.no} ${f.nav || f.title}`, indent: true }))
    ]
  }
  if (ch.id === 'appendix') {
    return [
      node,
      ...salaryAgentAppendixChapters.map(f => ({ index: f.routeName, label: `${f.no} ${f.nav || f.title}`, indent: true }))
    ]
  }
  return [node]
})

export const docMenu = [
  {
    // 目录页（/docs 默认落地页）：一级叶子，常驻最顶，方便从任何文档回到全局目录
    index: 'doc-home',
    label: '文档目录',
    icon: HomeFilled,
    to: '/docs'
  },
  {
    index: 'doc-hr-center',
    label: '人事中心',
    icon: OfficeBuilding,
    children: [
      {
        index: 'doc-hr-schedule',
        label: '排班策略',
        icon: Reading,
        to: '/docs/hr-schedule',
        children: hrScheduleChapterMenu
      }
    ]
  },
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
      },
      // 通用参数升级：模块化薪酬下的一份升级说明，不单独占一级分组
      {
        index: 'doc-general-param',
        label: '通用参数（升级）',
        icon: Reading,
        to: '/docs/general-param',
        children: generalParamChapterMenu
      },
      // 薪酬查询 Agent：模块化薪酬下的一份需求说明，不单独占一级分组
      {
        index: 'doc-salary-agent',
        label: '薪酬查询 Agent',
        icon: Reading,
        to: '/docs/salary-agent',
        children: salaryAgentChapterMenu
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
    children: [
      {
        index: 'doc-parttime-index',
        label: '产品需求说明',
        icon: Reading,
        to: '/docs/parttime-account-manager',
        children: parttimeChapterMenu
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
    children: [
      {
        index: 'doc-resign-flow-index',
        label: '产品需求说明',
        icon: Reading,
        to: '/docs/resign-flow',
        children: resignChapterMenu
      }
    ]
  },
  {
    index: 'doc-orchestration',
    label: '事件编排',
    icon: Connection,
    children: [
      {
        index: 'doc-orch-index',
        label: '产品需求说明',
        icon: Reading,
        to: '/docs/orchestration',
        children: orchChapterMenu
      }
    ]
  }
]

/** 纯数据形态（剥掉图标组件与 to），供 /gate「菜单配置」页的「文档中心」页签使用 */
const plainDocMenu = (nodes) => nodes.map((n) => ({
  index: n.index,
  label: n.label,
  ...(n.indent ? { indent: true } : {}),
  ...(n.children ? { children: plainDocMenu(n.children) } : {})
}))

export const docMenuCatalog = plainDocMenu(docMenu)
