/**
 * 侧边栏里由 MultiLevelMenu 渲染的两组多级菜单。
 * 抽到独立文件的原因：MainLayout 与「菜单配置（gate）」页要共用同一份结构，
 * 否则 gate 里配不到这两组，或者两边各写一份会走样。
 */
import { Coin, Document, List, Wallet } from '@element-plus/icons-vue'

// 员工福利保障菜单数据
export const employeeWelfareMenu = [
  {
    index: 'employee-welfare',
    label: '员工福利保障',
    icon: Coin,
    children: [
      { index: 'city-salary-standard', label: '城市基准系数', icon: List },
      { index: 'commercial-insurance', label: '商业险管理', icon: List },
      { index: 'employee-welfare-detail', label: '员工福利保障', icon: List },
      { index: 'job-welfare-config', label: '岗位福利保障', icon: Document },
      {
        index: 'social-security',
        label: '社保',
        icon: Document,
        children: [
          { index: 'security-monthly-summary', label: '社保月度汇总', icon: Document },
          { index: 'security-monthly-record', label: '社保月度流水', icon: Document }
        ]
      },
      {
        index: 'housing-fund',
        label: '公积金',
        icon: Document,
        children: [
          { index: 'housing-fund-monthly-summary', label: '公积金月度汇总', icon: Document },
          { index: 'housing-fund-monthly-record', label: '公积金月度流水', icon: Document }
        ]
      },
      {
        index: 'individual-tax',
        label: '个税',
        icon: Document,
        children: [
          { index: 'individual-tax-monthly-summary', label: '个税月度汇总', icon: Document },
          { index: 'individual-tax-monthly-record', label: '个税月度流水', icon: Document }
        ]
      }
    ]
  }
]

// 模块薪酬菜单数据
export const moduleSalaryMenu = [
  {
    index: 'module-salary',
    label: '模块薪酬',
    icon: Coin,
    children: [
      { index: 'personnel-change-processing', label: '人员异动处理', icon: Document },
      { index: 'personnel-position-salary-planning', label: '人员岗位薪酬规划', icon: Document },
      { index: 'salary-distribution-strategy', label: '薪酬发放策略', icon: Coin },
      { index: 'config-rule-management', label: '配置规则管理', icon: Coin },
      { index: 'personnel-salary-detail', label: '人员薪酬明细', icon: List },
      {
        index: 'negative-wage',
        label: '负工资',
        icon: Wallet,
        children: [
          { index: 'negative-wage-account', label: '负工资账户', icon: Wallet },
          { index: 'negative-wage-record-list', label: '负工资流水查询', icon: List }
        ]
      },
      { index: 'dependency-calculation', label: '依赖计算', icon: List }
    ]
  }
]
