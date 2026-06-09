// V2 阶段1（v2-1）落地版产品功能树（用于 V2Phase1ProductGuide.vue）
// v2-1 = V2 完整版裁剪而来，仅含阶段1实际要开发的内容
// 平台 5 features + App 3 features（v2.1 同期升级的薪酬看板/工资条通知）
// 节点 = 真实产品功能模块（不是文档章节）

export const v2Phase1Tree = {
  title: 'V2 阶段1 功能架构（落地版）',
  rootIcon: '🎯',
  legend: [
    { label: '推拿之家平台', color: 'hsl(217, 91%, 60%)' },
    { label: '推拿之家App', color: 'hsl(330, 81%, 60%)' }
  ],
  groups: [
    {
      id: 'platform',
      label: '推拿之家平台',
      type: 'group',
      icon: '🏢',
      color: 'hsl(217, 91%, 60%)',
      children: [
        // 模块化薪酬（4 种用工类型）= 4 个独立子功能
        { id: 'modular-comp', label: '模块化薪酬（4 种用工类型）', type: 'group', icon: '👔', color: 'hsl(217, 91%, 60%)',
          children: [
            { id: 'salary-items', label: '薪酬项（薪酬项配置）', type: 'route', route: '/salary-item-management', icon: '🧩' },
            { id: 'job-template', label: '薪酬模板（岗位薪酬模板）', type: 'route', route: '/job-compensation-template', icon: '📄' },
            { id: 'personnel-salary', label: '人员薪酬明细', type: 'route', route: '/personnel-salary-detail', icon: '👥' },
            { id: 'salary-distribution', label: '发放策略（支持多主体）', type: 'route', route: '/salary-distribution-strategy', icon: '📤' }
          ]
        },
        // 常乐豆机制
        { id: 'bean-block', label: '常乐豆', type: 'group', icon: '🫘', color: 'hsl(38, 92%, 50%)',
          children: [
            { id: 'bean-rule', label: '常乐豆规则（只抵公积金）', type: 'section', anchor: 'bean', icon: '🫘' },
            { id: 'housing-deduction', label: '【公积金个人扣款】动态项', type: 'section', anchor: 'bean', icon: '💸' },
            { id: 'bean-monthly', label: '账户月度信息（含离职提现）', type: 'route', route: '/bean-account-monthly', icon: '📅' }
          ]
        },
        { id: 'negative-wage', label: '负工资模块', type: 'route', route: '/negative-wage-account', icon: '➖' },
        { id: 'multi-tax', label: '多轮报税逻辑（多主体倒序申报）', type: 'section', anchor: 'scenarios', icon: '🔄' }
      ]
    },
    {
      id: 'app',
      label: '推拿之家App',
      type: 'group',
      icon: '📱',
      color: 'hsl(330, 81%, 60%)',
      children: [
        { id: 'app-fulltime', label: '全职薪酬看板（日/月/到账）', type: 'route', route: '/mobile-salary-dashboard', icon: '💰' },
        { id: 'app-parttime', label: '非全日制薪酬看板（日/周/月/到账）', type: 'route', route: '/mobile-part-time-salary-dashboard', icon: '💵' },
        { id: 'app-notification', label: '工资条通知（含门店/主体）', type: 'route', route: '/mobile-notification', icon: '🔔' }
      ]
    }
  ]
}
