/**
 * 文档中心「目录页」（/docs）的卡片数据源。
 *
 * 与 menu.js 的分工：
 *   menu.js     左栏导航 —— 分组、图标、gate id、章节叶子
 *   本文件       目录页卡片 —— 一句话定位、版本标记、篇幅、入口地址
 *
 * 新增文档时两处都要动：menu.js 加入口，这里加一张卡；`gateId` 必须与菜单节点的 index 一致，
 * 这样 /gate 里把文档隐藏后，目录页也不会留一张点得进去的空卡。
 *
 * 字段：
 *   gateId  对应菜单 index（受 gate 显隐控制）
 *   title   卡片标题（与菜单 label 同名，不加序号）
 *   meta    版本 / 形态标记，如 v2.1 · 2026-06-05
 *   desc    一句话说明这份文档回答什么问题
 *   scope   篇幅，如「11 章」「单页」「7 章 + 6 个功能章节」
 *   updated 最近更新时间（目录页取最大值显示）
 */
export const docGroups = [
  {
    key: 'payroll',
    label: '模块化薪酬',
    desc: '薪酬项怎么配、钱怎么算出来、工资条怎么组装',
    docs: [
      {
        gateId: 'doc-product-v2-phase1',
        title: '产品需求 v2（阶段 1）',
        meta: '阶段 1 落地版',
        desc: '按章拆页的落地范围产品需求，从版本信息一直到功能详细说明',
        scope: '11 章',
        path: '/docs/product-v2-phase1'
      },
      {
        gateId: 'doc-product-v2',
        title: '产品需求 v2',
        meta: 'v2.1 · 2026-06-05',
        desc: '不同用工形式下，入职合作、福利保障配置、薪酬计算与发放的全流程',
        scope: '单页 + 1 个子页',
        updated: '2026-06-05',
        path: '/docs/product-v2'
      },
      {
        gateId: 'doc-product-v1',
        title: '产品需求 v1',
        meta: 'v1.2 · 2026-05-22',
        desc: '全职 / 兼职的薪酬项配置、计算节点与工资条组装流程',
        scope: '单页',
        updated: '2026-05-22',
        path: '/docs/product-v1'
      }
    ]
  },
  {
    key: 'hr',
    label: '人事与假勤',
    desc: '异动、福利、假勤口径 —— 与薪酬计算互为上下游的那几层',
    docs: [
      {
        gateId: 'doc-personnel-change-flow',
        title: '人员异动流程',
        desc: '转正、调岗、调薪等异动从发起到落地的功能流程与需求说明',
        scope: '2 节',
        path: '/docs/personnel-change-flow'
      },
      {
        gateId: 'doc-welfare-guide',
        title: '员工福利保障',
        meta: 'v2.0 · 2026-06-02',
        desc: '城市基准系数、岗位薪酬模板、员工福利保障与薪酬计算之间的关系',
        scope: '单页',
        updated: '2026-06-02',
        path: '/docs/welfare-guide'
      },
      {
        gateId: 'doc-leave-reform',
        title: '假勤管理（重构）',
        desc: '出勤方案、假期类型定性、额度来源与余额口径 —— 只处理自己这一环',
        scope: '1 章',
        path: '/docs/leave-reform/overview'
      }
    ]
  },
  {
    key: 'resign',
    label: '离职流程',
    desc: '从员工提出到次月补偿金到账，一条完整的链路',
    docs: [
      {
        gateId: 'doc-resign-flow',
        title: '离职流程 · 产品需求说明',
        meta: 'v0.3 · 2026-10-26',
        desc: '发起 → 离职需求审核 → 交接 → 签署 → 次月补偿金计算与发放；含前置模板配置',
        scope: '7 章 + 6 个功能章节',
        updated: '2026-10-26',
        path: '/docs/resign-flow'
      }
    ]
  },
  {
    key: 'orchestration',
    label: '事件编排',
    desc: '一件事如何被定义成可办子事件：提示词、子事件清单、按事实生成、办理与交付',
    docs: [
      {
        gateId: 'doc-orchestration',
        title: '事件编排 · 产品需求说明',
        meta: 'v0.1 · 2026-10-30',
        desc: '一件事 = 一套提示词 + 一份子事件清单 + 一个触点；定义期不生成树，触发时按人与事实生成',
        scope: '7 章 + 6 个功能章节',
        updated: '2026-10-30',
        path: '/docs/orchestration'
      }
    ]
  },
  {
    key: 'parttime',
    label: '非全客户经理',
    desc: '需求配置、任务生成、移动端承接与运营跟踪',
    docs: [
      {
        gateId: 'doc-parttime-account-manager',
        title: '非全客户经理任务体系',
        desc: '非全客户经理从需求配置、任务生成、移动端承接到运营跟踪的业务宣讲与产品需求总览',
        scope: '2 节',
        path: '/docs/parttime-account-manager'
      }
    ]
  }
]
