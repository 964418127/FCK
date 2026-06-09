// V2 完整版产品功能树（用于 V2ProductGuide.vue）
// 节点 = 真实产品功能模块（不是文档章节）
// v2.0 (2026-06-01) + v2.1 (2026-06-05) 的所有新增/升级
// 子分组：福利与权益 / 薪酬体系 / 工资条与查询 / 用工类型 / 常乐豆机制 / App

export const v2FullTree = {
  title: 'V2 产品功能架构（完整版）',
  rootIcon: '🗺️',
  legend: [
    { label: '推拿之家平台（HR 后台）', color: 'hsl(217, 91%, 60%)' },
    { label: '推拿之家App（移动端）', color: 'hsl(330, 81%, 60%)' }
  ],
  groups: [
    {
      id: 'platform',
      label: '推拿之家平台',
      type: 'group',
      icon: '🏢',
      color: 'hsl(217, 91%, 60%)',
      children: [
        // 福利与权益
        { id: 'welfare-block', label: '福利与权益', type: 'group', icon: '🛡️', color: 'hsl(160, 84%, 39%)',
          children: [
            { id: 'city-baseline', label: '城市基准系数', type: 'section', anchor: 'welfare', icon: '🏙️' },
            { id: 'commercial-insurance', label: '商业险库', type: 'route', route: '/commercial-insurance', icon: '🛡️' },
            { id: 'welfare-detail', label: '员工福利保障', type: 'route', route: '/employee-welfare-detail', icon: '🏥' },
            { id: 'monthly-flow', label: '社保/公积金/个税 月度流水', type: 'group', icon: '💧',
              children: [
                { id: 'security-flow', label: '社保月度流水', type: 'route', route: '/security-monthly-record', icon: '🏛️' },
                { id: 'housing-flow', label: '公积金月度流水', type: 'route', route: '/housing-fund-monthly-record', icon: '🏠' },
                { id: 'tax-flow', label: '个税月度流水', type: 'route', route: '/individual-tax-monthly-record', icon: '🧾' }
              ]
            }
          ]
        },
        // 薪酬体系
        { id: 'comp-block', label: '薪酬体系', type: 'group', icon: '📊', color: 'hsl(262, 83%, 58%)',
          children: [
            { id: 'salary-items', label: '薪酬项配置', type: 'route', route: '/salary-item-management', icon: '🧩' },
            { id: 'job-template', label: '岗位薪酬模板', type: 'route', route: '/job-compensation-template', icon: '📄' },
            { id: 'salary-distribution', label: '薪酬发放策略', type: 'route', route: '/salary-distribution-strategy', icon: '📤' },
            { id: 'negative-wage', label: '负工资', type: 'route', route: '/negative-wage-account', icon: '➖' },
            { id: 'multi-tax', label: '多轮报税逻辑（多主体倒序）', type: 'section', anchor: 'scenarios', icon: '🔄' }
          ]
        },
        // 工资条与查询
        { id: 'payroll-block', label: '工资条与查询', type: 'group', icon: '💵', color: 'hsl(330, 81%, 60%)',
          children: [
            { id: 'personnel-salary', label: '人员薪酬明细', type: 'route', route: '/personnel-salary-detail', icon: '👥' }
          ]
        },
        // 用工类型
        { id: 'employment-block', label: '用工类型', type: 'group', icon: '👔', color: 'hsl(217, 91%, 60%)',
          children: [
            { id: 'employment-types', label: '4 种用工类型（全职/非全日制/兼职/返聘）', type: 'section', anchor: 'template', icon: '🪪' }
          ]
        },
        // 常乐豆机制
        { id: 'bean-block', label: '常乐豆机制', type: 'group', icon: '🫘', color: 'hsl(38, 92%, 50%)',
          children: [
            { id: 'bean-rule', label: '常乐豆使用规则（只抵公积金）', type: 'section', anchor: 'bean', icon: '🫘' },
            { id: 'housing-deduction', label: '【公积金个人扣款】动态项', type: 'section', anchor: 'bean', icon: '💸' },
            { id: 'bean-monthly', label: '账户月度信息（含离职提现）', type: 'route', route: '/bean-account-monthly', icon: '📅' }
          ]
        }
      ]
    },
    {
      id: 'app',
      label: '推拿之家App',
      type: 'group',
      icon: '📱',
      color: 'hsl(330, 81%, 60%)',
      children: [
        { id: 'app-salary', label: 'App 薪酬视图', type: 'group', icon: '💰', color: 'hsl(330, 81%, 60%)',
          children: [
            { id: 'app-fulltime', label: '全职薪酬看板（日/月/到账）', type: 'route', route: '/mobile-salary-dashboard', icon: '📊' },
            { id: 'app-parttime', label: '非全日制薪酬看板（日/周/月/到账）', type: 'route', route: '/mobile-part-time-salary-dashboard', icon: '📈' }
          ]
        },
        { id: 'app-notification', label: '移动端通知（含门店/主体）', type: 'route', route: '/mobile-notification', icon: '🔔' }
      ]
    }
  ]
}
