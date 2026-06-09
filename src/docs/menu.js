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
import { Document, InfoFilled, Reading } from '@element-plus/icons-vue'
import { v2phase1Chapters } from './chapters.js'

// 把 chapters 转换成菜单叶子节点
const v2phase1MenuChildren = v2phase1Chapters.map(ch => ({
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
        icon: Reading
      },
      {
        index: 'doc-product-v1',
        label: '产品需求v1',
        icon: Reading
      }
    ]
  },
  {
    index: 'doc-welfare',
    label: '福利保障',
    icon: Document,
    children: [
      {
        index: 'doc-welfare-guide',
        label: '福利保障说明',
        icon: InfoFilled
      }
    ]
  }
]
