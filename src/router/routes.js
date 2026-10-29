/**
 * 纯数据路由配置。
 * 不在顶层调用 createWebHistory（避免 SSR 阶段 window 不存在的报错）。
 * vite-ssg 静态化时直接 import 此文件的 routes 数组。
 */
import MainLayout from '../components/MainLayout.vue'
import Welcome from '../views/Welcome.vue'
import { v2phase1Chapters } from '../docs/chapters.js'
import { leaveReformChapters } from '../docs/leaveReformChapters.js'
import { resignChapters, featureChapters } from '../docs/resignChapters.js'
import { orchChapters, orchFeatureChapters } from '../docs/orchestrationChapters.js'

// Vite 编译时把所有章节 SFC 转成静态映射（SSR 也能解析）
const chapterModules = import.meta.glob('../views/v2phase1/*.vue')
const leaveReformChapterModules = import.meta.glob('../views/leave-reform-guide/*.vue')
const resignChapterModules = {
  ...import.meta.glob('../views/resign-flow-guide/*.vue'),
  ...import.meta.glob('../views/resign-flow-guide/sections/*.vue')
}
const orchChapterModules = {
  ...import.meta.glob('../views/orchestration-guide/*.vue'),
  ...import.meta.glob('../views/orchestration-guide/sections/*.vue')
}

export const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue'),
    meta: {
      title: '登录'
    }
  },
  {
    path: '/',
    name: 'main',
    component: MainLayout,
    redirect: '/welcome',
    children: [
      {
        path: 'welcome',
        name: 'welcome',
        component: Welcome,
        meta: {
          title: '欢迎页'
        }
      },
      // 菜单配置：不在侧边栏展示，需手动输入 /gate 访问（配置工具页，本身不占菜单位）
      {
        path: 'gate',
        name: 'gate',
        component: () => import('../views/GateConfig.vue'),
        meta: {
          title: '菜单配置'
        }
      },
      {
        path: 'monthly-diff-confirm',
        name: 'monthly-diff-confirm',
        component: () => import('../views/MonthlyDiffConfirm.vue'),
        meta: {
          title: '月差异确认'
        }
      },
      {
        path: 'store-interval',
        name: 'store-interval',
        component: () => import('../views/StoreInterval.vue'),
        meta: {
          title: '门店间隔时间库'
        }
      },
      {
        path: 'custom-time-strategy',
        name: 'custom-time-strategy',
        component: () => import('../views/CustomTimeStrategy.vue'),
        meta: {
          title: '自定义时间策略'
        }
      },
      {
        path: 'dependency-calculation',
        name: 'dependency-calculation',
        component: () => import('../views/DependencyCalculation.vue'),
        meta: {
          title: '依赖计算'
        }
      },
      {
        path: 'strategy-form',
        name: 'strategy-form',
        component: () => import('../views/StrategyForm.vue'),
        meta: {
          title: '策略表单'
        }
      },
      {
        path: 'salary-item-management',
        name: 'salary-item-management',
        component: () => import('../views/SalaryItemManagement.vue'),
        meta: {
          title: '薪酬项配置'
        }
      },
      {
        path: 'personnel-position-salary-planning',
        name: 'personnel-position-salary-planning',
        component: () => import('../views/PersonnelPositionSalaryPlanning.vue'),
        meta: {
          title: '人员岗位薪酬规划'
        }
      },
      {
        path: 'personnel-change-processing',
        name: 'personnel-change-processing',
        component: () => import('../views/PersonnelChangeProcessing.vue'),
        meta: {
          title: '人员异动处理'
        }
      },

      {
        path: 'job-welfare-config',
        name: 'job-welfare-config',
        component: () => import('../views/JobWelfareConfig.vue'),
        meta: {
          title: '岗位福利保障'
        }
      },
      {
        path: 'job-compensation-template/:id',
        name: 'job-compensation-template-detail',
        component: () => import('../views/JobCompensationTemplateDetail.vue'),
        meta: {
          title: '岗位模板详情'
        }
      },
      {
        path: 'employee-welfare-detail',
        name: 'employee-welfare-detail',
        component: () => import('../views/EmployeeWelfareDetail.vue'),
        meta: {
          title: '员工福利保障明细'
        }
      },
      {
        path: 'city-salary-standard',
        name: 'city-salary-standard',
        component: () => import('../views/CitySalaryStandard.vue'),
        meta: {
          title: '城市基准系数配置'
        }
      },
      {
        path: 'commercial-insurance',
        name: 'commercial-insurance',
        component: () => import('../views/CommercialInsurance.vue'),
        meta: {
          title: '商业险管理'
        }
      },
      {
        path: 'security-monthly-summary',
        name: 'security-monthly-summary',
        component: () => import('../views/SecurityMonthlySummary.vue'),
        meta: {
          title: '社保月度汇总'
        }
      },
      {
        path: 'security-monthly-record',
        name: 'security-monthly-record',
        component: () => import('../views/SecurityMonthlyRecord.vue'),
        meta: {
          title: '社保月度流水明细'
        }
      },
      {
        path: 'housing-fund-monthly-summary',
        name: 'housing-fund-monthly-summary',
        component: () => import('../views/HousingFundMonthlySummary.vue'),
        meta: {
          title: '公积金月度汇总'
        }
      },
      {
        path: 'housing-fund-monthly-record',
        name: 'housing-fund-monthly-record',
        component: () => import('../views/HousingFundMonthlyRecord.vue'),
        meta: {
          title: '公积金月度流水明细'
        }
      },
      {
        path: 'individual-tax-monthly-summary',
        name: 'individual-tax-monthly-summary',
        component: () => import('../views/IndividualTaxMonthlySummary.vue'),
        meta: {
          title: '个税月度汇总'
        }
      },
      {
        path: 'individual-tax-monthly-record',
        name: 'individual-tax-monthly-record',
        component: () => import('../views/IndividualTaxMonthlyRecord.vue'),
        meta: {
          title: '个税月度流水明细'
        }
      },
      {
        path: 'store-interval2',
        name: 'store-interval2',
        component: () => import('../views/StoreInterval2.vue'),
        meta: {
          title: '标准时间库'
        }
      },
      {
        path: 'store-interval3',
        name: 'store-interval3',
        component: () => import('../views/StoreInterval3.vue'),
        meta: {
          title: '标库3'
        }
      },
      {
        path: 'store-hanging-application',
        name: 'store-hanging-application',
        component: () => import('../views/StoreHangingApplication.vue'),
        meta: {
          title: '挂店申请管理'
        }
      },
      {
        path: 'store-recommendation-record',
        name: 'store-recommendation-record',
        component: () => import('../views/StoreRecommendationRecord.vue'),
        meta: {
          title: '挂店推荐记录'
        }
      },
      {
        path: 'temporary-leave-rules',
        name: 'temporary-leave-rules',
        component: () => import('../views/TemporaryLeaveRules.vue'),
        meta: {
          title: '临时假获取规则'
        }
      },
      {
        path: 'schedule-leave-approval',
        name: 'schedule-leave-approval',
        component: () => import('../views/ScheduleLeaveApproval.vue'),
        meta: {
          title: '排班排假审核'
        }
      },
      // ===== 补齐此前的断链路由（推拿师自主下线） =====
      {
        path: 'therapist-offline-config',
        name: 'therapist-offline-config',
        component: () => import('../views/TherapistOfflineConfig.vue'),
        meta: {
          title: '推拿师自主下线配置'
        }
      },
      {
        path: 'therapist-offline-detail',
        name: 'therapist-offline-detail',
        component: () => import('../views/TherapistOfflineDetail.vue'),
        meta: {
          title: '推拿师自主下线明细'
        }
      },
      // ===== 假勤管理（合并后的唯一分组；原「假勤重构」「工作模式」两组已合并）=====
      // 岗位列表：只读引用的岗位清单（原「岗位台账」），排在分组末尾作参考
      {
        path: 'leave-job-roster',
        name: 'leave-job-roster',
        component: () => import('../views/leave-reform/JobRoster.vue'),
        meta: {
          title: '岗位列表'
        }
      },
      {
        path: 'leave-type-dictionary',
        name: 'leave-type-dictionary',
        component: () => import('../views/leave-reform/LeaveTypeDictionary.vue'),
        meta: {
          title: '假期类型'
        }
      },
      {
        path: 'leave-audit-consequence',
        name: 'leave-audit-consequence',
        component: () => import('../views/leave-reform/LeaveApprovalRules.vue'),
        meta: {
          title: '假期审核规则'
        }
      },
      // 旧入口：审核规则页已更名「假期审核规则」，保留跳转不破坏既有链接
      {
        path: 'leave-approval-rules',
        name: 'leave-approval-rules',
        redirect: { name: 'leave-audit-consequence' }
      },
      // ===== 假勤管理 · 方案与结果（原「工作模式」分组，现与上段同组）=====
      {
        path: 'leave-wm-work-mode',
        name: 'leave-wm-work-mode',
        component: () => import('../views/leave-reform-pd/WorkMode.vue'),
        meta: {
          title: '岗位假勤方案'
        }
      },
      {
        path: 'leave-wm-scheme',
        name: 'leave-wm-scheme',
        component: () => import('../views/leave-reform-pd/ScheduleScheme.vue'),
        meta: {
          title: '出勤方案'
        }
      },
      {
        path: 'leave-wm-quota',
        name: 'leave-wm-quota',
        component: () => import('../views/leave-reform-pd/QuotaScheme.vue'),
        meta: {
          title: '假期额度方案'
        }
      },
      {
        path: 'leave-wm-attendance',
        name: 'leave-wm-attendance',
        component: () => import('../views/leave-reform-pd/AttendanceGroup.vue'),
        meta: {
          title: '考勤组'
        }
      },
      // 旧入口：「引用总览」已并入「岗位假勤方案」的矩阵视图，保留跳转不破坏既有链接
      {
        path: 'leave-wm-reference',
        name: 'leave-wm-reference',
        redirect: { name: 'leave-wm-work-mode', query: { view: 'matrix' } }
      },
      {
        path: 'leave-wm-ledger',
        name: 'leave-wm-ledger',
        component: () => import('../views/leave-reform-pd/LeaveLedger.vue'),
        meta: {
          title: '假期盘点'
        }
      },
      {
        path: 'leave-wm-consequence',
        name: 'leave-wm-consequence',
        redirect: { name: 'leave-audit-consequence' }
      },
      // ===== 离职重构（Web 端）=====
      {
        path: 'resign-flow-template',
        name: 'resign-flow-template',
        component: () => import('../views/resign-flow-pd/ResignFlowTemplateList.vue'),
        meta: {
          title: '离职流程模板'
        }
      },
      {
        path: 'resign-system-checks',
        name: 'resign-system-checks',
        component: () => import('../views/resign-flow-pd/SystemCheckDict.vue'),
        meta: {
          title: '系统检查项'
        }
      },
      {
        path: 'resign-system-check-runs',
        name: 'resign-system-check-runs',
        component: () => import('../views/resign-flow-pd/SystemCheckRuns.vue'),
        meta: {
          title: '系统检查 · Agent 执行日志'
        }
      },
      {
        path: 'resign-flow-template-detail',
        name: 'resign-flow-template-detail',
        component: () => import('../views/resign-flow-pd/ResignFlowTemplateDetail.vue'),
        meta: {
          title: '交接流程 · 列表视图'
        }
      },
      {
        path: 'resign-flow-template-flow',
        name: 'resign-flow-template-flow',
        component: () => import('../views/resign-flow-pd/ResignFlowTemplateFlow.vue'),
        meta: {
          title: '交接流程 · 画布（已隐藏入口）'
        }
      },
      {
        path: 'resign-flow-template-timeline',
        name: 'resign-flow-template-timeline',
        component: () => import('../views/resign-flow-pd/ResignFlowTemplateTimeline.vue'),
        meta: {
          title: '交接流程编排'
        }
      },
      {
        path: 'resign-compensation-ledger',
        name: 'resign-compensation-ledger',
        component: () => import('../views/resign-reform-pd/CompensationLedger.vue'),
        meta: {
          title: '补偿金明细'
        }
      },

      /* ---------------- 事件编排（评审稿 v2） ----------------
         与 v1 并列对照：v1 的离职模板/系统检查项/交接流程编排保持不动。 */
      {
        /* 入口只有事件管理的「新建根事件」：对话是起草方式，不是并列页面 */
        path: 'v2/compose',
        name: 'v2-compose',
        component: () => import('../views/v2/ComposeStudio.vue'),
        meta: { title: '起草新事件' }
      },
      {
        path: 'v2/contract',
        name: 'v2-contract',
        component: () => import('../views/v2/ContractView.vue'),
        meta: { title: '契约全文' }
      },
      {
        /* 定义期事实：模型能看见什么。与契约全文成对（契约管形状，这里管事实） */
        path: 'v2/facts',
        name: 'v2-facts',
        component: () => import('../views/v2/FactsView.vue'),
        meta: { title: '起草依据' }
      },
      {
        /* 同一份视图，打开即停在「系统项目录」标签；独立 name 只为了菜单能各自高亮 */
        path: 'v2/catalog',
        name: 'v2-catalog',
        component: () => import('../views/v2/ContractView.vue'),
        meta: { title: '系统项目录' }
      },
      {
        /* 系统项：目录（判定 / 执行）+ 生成工作台。工作台用 query 传参，静态站可直达 */
        path: 'v2/sys-items',
        name: 'v2-sys-items',
        component: () => import('../views/v2/SysItemList.vue'),
        meta: { title: '系统项' }
      },
      {
        path: 'v2/sys-studio',
        name: 'v2-sys-studio',
        component: () => import('../views/v2/SysItemStudio.vue'),
        meta: { title: '系统项工作台' }
      },
      {
        /* 判定项的批次结果：按条件版本分组，逐单到人（v1 执行日志的同构页） */
        path: 'v2/sys-batches',
        name: 'v2-sys-batches',
        component: () => import('../views/v2/SysBatches.vue'),
        meta: { title: '批次结果' }
      },
      {
        path: 'v2/events',
        name: 'v2-events',
        component: () => import('../views/v2/EventCatalog.vue'),
        meta: { title: '事件管理' }
      },
      {
        /* 工作台：维护提示词与骨架，树在触发时生成 —— 这里不编排树 */
        path: 'v2/prompt',
        name: 'v2-prompt',
        component: () => import('../views/v2/PromptStudio.vue'),
        meta: { title: '提示词工作台' }
      },
      {
        /* 旧地址保住：带 query 转过去 */
        path: 'v2/studio',
        redirect: (to) => ({ name: 'v2-prompt', query: to.query })
      },
      {
        /* 旧入口已撤：「作用域覆盖」不再存在，差异落在子事件的承担者上；保住老地址不白屏 */
        path: 'v2/overlays',
        redirect: { name: 'v2-events' }
      },
      {
        /* 旧入口并入「系统项」：同一页两个标签（判定 / 执行），这里重定向保住老地址 */
        path: 'v2/ref/checks',
        redirect: { name: 'v2-sys-items', query: { kind: 'check' } }
      },
      {
        path: 'v2/ref/actions',
        redirect: { name: 'v2-sys-items', query: { kind: 'action' } }
      },
      {
        path: 'v2/instances',
        name: 'v2-instances',
        component: () => import('../views/v2/InstanceWalk.vue'),
        meta: { title: '事件数据' }
      },
      {
        path: 'v2/inst-tree',
        name: 'v2-inst-tree',
        component: () => import('../views/v2/InstTree.vue'),
        meta: { title: '这一单的编排' }
      },

      {
        path: 'parttime-task-management',
        name: 'parttime-task-management',
        component: () => import('../views/ParttimeTaskManagement.vue'),
        meta: { title: '排班排假' }
      },
      {
        path: 'parttime-task-publication',
        name: 'parttime-task-publication',
        component: () => import('../views/ParttimeTaskManagement.vue'),
        meta: { title: '任务发布' }
      },
      {
        path: 'parttime-task-tracking',
        name: 'parttime-task-tracking',
        component: () => import('../views/ParttimeTaskTracking.vue'),
        meta: { title: '任务跟踪' }
      },
      {
        path: 'parttime-income-guarantee',
        name: 'parttime-income-guarantee',
        component: () => import('../views/ParttimeIncomeGuarantee.vue'),
        meta: { title: '收入保底配置' }
      },
      {
        path: 'parttime-unit-prices',
        name: 'parttime-unit-prices',
        component: () => import('../views/ParttimeUnitPrices.vue'),
        meta: { title: '收入单价配置' }
      },
      {
        path: 'shift-subsidy-config',
        name: 'shift-subsidy-config',
        component: () => import('../views/ShiftSubsidyConfig.vue'),
        meta: { title: '顶班补贴配置' }
      },
      {
        path: 'leave-deduction-config',
        name: 'leave-deduction-config',
        component: () => import('../views/LeaveDeductionConfig.vue'),
        meta: { title: '请假扣款配置' }
      },
      {
        path: 'bean-account-list',
        name: 'bean-account-list',
        component: () => import('../views/BeanAccountList.vue'),
        meta: {
          title: '常乐豆账户列表'
        }
      },
      {
        path: 'bean-settlement-detail',
        name: 'bean-settlement-detail',
        component: () => import('../views/BeanSettlementDetail.vue'),
        meta: {
          title: '常乐豆结算明细'
        }
      },
      {
        path: 'bean-withdrawal-detail',
        name: 'bean-withdrawal-detail',
        component: () => import('../views/BeanWithdrawalDetail.vue'),
        meta: {
          title: '常乐豆提现明细'
        }
      },
      {
        path: 'bean-consumption-detail',
        name: 'bean-consumption-detail',
        component: () => import('../views/BeanConsumptionDetail.vue'),
        meta: {
          title: '常乐豆消费明细'
        }
      },
      {
        path: 'bean-refund-detail',
        name: 'bean-refund-detail',
        component: () => import('../views/BeanRefundDetail.vue'),
        meta: {
          title: '常乐豆退货明细'
        }
      },
      {
        path: 'bean-therapist-detail',
        name: 'bean-therapist-detail',
        component: () => import('../views/BeanTherapistDetail.vue'),
        meta: {
          title: '推拿师获豆明细'
        }
      },
      {
        path: 'bean-account-manager-detail',
        name: 'bean-account-manager-detail',
        component: () => import('../views/BeanAccountManagerDetail.vue'),
        meta: {
          title: '客户经理获豆明细'
        }
      },
      {
        path: 'bean-headquarter-detail',
        name: 'bean-headquarter-detail',
        component: () => import('../views/BeanHeadquarterDetail.vue'),
        meta: {
          title: '总部岗位获豆明细'
        }
      },
      {
        path: 'bean-account-monthly',
        name: 'bean-account-monthly',
        component: () => import('../views/BeanAccountMonthly.vue'),
        meta: {
          title: '账户月度信息'
        }
      },
      {
        path: 'bean-usage-detail',
        name: 'bean-usage-detail',
        component: () => import('../views/BeanUsageDetail.vue'),
        meta: {
          title: '常乐豆使用明细'
        }
      },
      {
        path: 'negative-wage-account',
        name: 'negative-wage-account',
        component: () => import('../views/NegativeWageAccount.vue'),
        meta: {
          title: '员工负工资账户'
        }
      },
      {
        path: 'negative-wage-record',
        name: 'negative-wage-record',
        component: () => import('../views/NegativeWageRecord.vue'),
        meta: {
          title: '负工资流水明细'
        }
      },
      {
        path: 'negative-wage-record-list',
        name: 'negative-wage-record-list',
        component: () => import('../views/NegativeWageRecordList.vue'),
        meta: {
          title: '负工资流水查询'
        }
      },
      {
        path: 'salary-distribution-strategy',
        name: 'salary-distribution-strategy',
        component: () => import('../views/SalaryDistributionStrategy.vue'),
        meta: {
          title: '薪酬发放策略'
        }
      },
      {
        path: 'salary-distribution-strategy/:id',
        name: 'salary-distribution-strategy-detail',
        component: () => import('../views/SalaryDistributionStrategyDetail.vue'),
        meta: {
          title: '发放策略详情'
        }
      },
      {
        path: 'config-rule-management',
        name: 'config-rule-management',
        component: () => import('../views/ConfigRuleManagement.vue'),
        meta: {
          title: '配置规则管理'
        }
      },
      {
        path: 'store-salary-strategy',
        name: 'store-salary-strategy',
        component: () => import('../views/StoreSalaryStrategy.vue'),
        meta: {
          title: '数据源策略'
        }
      },
      {
        path: 'store-salary-strategy/:id',
        name: 'store-salary-strategy-detail',
        component: () => import('../views/StoreSalaryStrategyDetail.vue'),
        meta: {
          title: '数据源策略详情'
        }
      },
      {
        path: 'personnel-salary-detail',
        name: 'personnel-salary-detail',
        component: () => import('../views/PersonnelSalaryDetail.vue'),
        meta: {
          title: '人员薪酬明细'
        }
      },
      {
        path: 'personnel-salary-bill-detail/:billNo',
        name: 'personnel-salary-bill-detail',
        component: () => import('../views/PersonnelSalaryBillDetail.vue'),
        meta: {
          title: '工资单详情'
        }
      },
      {
        path: 'voucher-list',
        name: 'voucher-list',
        component: () => import('../views/VoucherList.vue'),
        meta: {
          title: '凭证列表'
        }
      },
      {
        path: 'voucher-list-2',
        name: 'voucher-list-2',
        component: () => import('../views/VoucherList2.vue'),
        meta: {
          title: '工资表'
        }
      },
      {
        path: 'voucher-list-2/slip/:slipNo',
        name: 'voucher-list-2-slip-detail',
        component: () => import('../views/VoucherList2SlipDetail.vue'),
        meta: {
          title: '工资单详情（v2）'
        }
      }
    ]
  },
  {
    path: '/mobile-login',
    name: 'mobile-login',
    component: () => import('../views/MobileLogin.vue'),
    meta: {
      title: '移动端登录'
    }
  },
  {
    path: '/mobile-menu',
    name: 'mobile-menu',
    component: () => import('../views/MobileMenu.vue'),
    meta: {
      title: '移动端菜单'
    }
  },
  {
    path: '/mobile-store-hanging',
    name: 'mobile-store-hanging',
    component: () => import('../views/MobileStoreHanging.vue'),
    meta: {
      title: '移动端挂店申请审核'
    }
  },
  {
    path: '/mobile-store-management',
    name: 'mobile-store-management',
    component: () => import('../views/MobileStoreManagement.vue'),
    meta: {
      title: '移动端挂店管理'
    }
  },
  {
    path: '/mobile-store-self-offline',
    name: 'mobile-store-self-offline',
    component: () => import('../views/MobileStoreSelfOffline.vue'),
    meta: {
      title: '移动端自主下线'
    }
  },
  {
    path: '/mobile-store-hanging-new',
    name: 'mobile-store-hanging-new',
    component: () => import('../views/MobileStoreHangingNew.vue'),
    meta: {
      title: '移动端新挂店管理'
    }
  },
  {
    path: '/mobile-schedule-leave',
    name: 'mobile-schedule-leave',
    component: () => import('../views/MobileScheduleLeave.vue'),
    meta: {
      title: '移动端排班排假'
    }
  },
  {
    path: '/mobile-leave-pd',
    name: 'mobile-leave-pd',
    component: () => import('../views/mobile-leave-pd/LeaveHome.vue'),
    meta: {
      title: '移动端请假'
    }
  },
  {
    path: '/mobile-leave-pd/apply',
    name: 'mobile-leave-pd-apply',
    component: () => import('../views/mobile-leave-pd/LeaveApply.vue'),
    meta: {
      title: '移动端休假申请'
    }
  },
  {
    path: '/mobile-leave-pd/records',
    name: 'mobile-leave-pd-records',
    component: () => import('../views/mobile-leave-pd/LeaveRecords.vue'),
    meta: {
      title: '移动端休假记录'
    }
  },
  {
    path: '/mobile-leave-pd/approval',
    name: 'mobile-leave-pd-approval',
    component: () => import('../views/mobile-leave-pd/LeaveApproval.vue'),
    meta: {
      title: '移动端假期审批'
    }
  },
  {
    path: '/mobile-resign-apply',
    name: 'mobile-resign-apply',
    component: () => import('../views/mobile-resign-pd/ResignApply.vue'),
    meta: {
      title: '移动端离职需求发起'
    }
  },
  {
    path: '/mobile-resign-pd',
    name: 'mobile-resign-pd',
    component: () => import('../views/mobile-resign-pd/ResignHome.vue'),
    meta: {
      title: '移动端离职处理'
    }
  },
  {
    path: '/mobile-resign-pd/detail',
    name: 'mobile-resign-pd-detail',
    component: () => import('../views/mobile-resign-pd/ResignDetail.vue'),
    meta: {
      title: '移动端离职申请详情'
    }
  },
  {
    path: '/mobile-resign-pd/release',
    name: 'mobile-resign-pd-release',
    component: () => import('../views/mobile-resign-pd/ResignRelease.vue'),
    meta: {
      title: '移动端解除用工'
    }
  },
  {
    path: '/mobile-resign-handover/list',
    name: 'mobile-resign-handover-list',
    component: () => import('../views/mobile-resign-pd/ResignHandoverList.vue'),
    meta: {
      title: '移动端交接处理列表'
    }
  },
  {
    path: '/mobile-resign-handover',
    name: 'mobile-resign-handover',
    component: () => import('../views/mobile-resign-pd/ResignHandover.vue'),
    meta: {
      title: '移动端离职交接进度'
    }
  },
  {
    path: '/mobile-resign-handover/node',
    name: 'mobile-resign-handover-node',
    component: () => import('../views/mobile-resign-pd/ResignHandoverNode.vue'),
    meta: {
      title: '移动端交接节点确认'
    }
  },
  /* ---------------- 事件编排（评审稿 v2）· 实例侧移动端 ----------------
     定义在 PC 上编排发布，实例在移动端被办理：发起 → 待办 → 办结。
     这三页只认实例快照，不改定义。 */
  {
    path: '/v2/m/list',
    name: 'v2-m-instances',
    component: () => import('../views/v2/mobile/MInstList.vue'),
    meta: { title: '移动端事项办理' }
  },
  {
    path: '/v2/m/inst',
    name: 'v2-m-instance',
    component: () => import('../views/v2/mobile/MInstDetail.vue'),
    meta: { title: '移动端事项办理详情' }
  },
  {
    path: '/v2/m/apply',
    name: 'v2-m-apply',
    component: () => import('../views/v2/mobile/MInstApply.vue'),
    meta: { title: '移动端发起事项' }
  },
  {
    path: '/mobile-salary-dashboard',
    name: 'mobile-salary-dashboard',
    component: () => import('../views/MobileSalaryDashboard.vue'),
    meta: {
      title: '薪酬看板'
    }
  },
  {
    path: '/mobile-salary-dashboard-2',
    name: 'mobile-salary-dashboard-2',
    component: () => import('../views/MobileSalaryDashboard2.vue'),
    meta: {
      title: '全职薪酬看板2'
    }
  },
  {
    path: '/mobile-part-time-salary-dashboard',
    name: 'mobile-part-time-salary-dashboard',
    component: () => import('../views/MobilePartTimeSalaryDashboard.vue'),
    meta: {
      title: '非全日制薪酬看板'
    }
  },
  {
    path: '/mobile-part-time-salary-dashboard-2',
    name: 'mobile-part-time-salary-dashboard-2',
    component: () => import('../views/MobilePartTimeSalaryDashboard2.vue'),
    meta: {
      title: '非全日制薪酬看板2'
    }
  },
  {
    path: '/mobile-account-manager-salary-dashboard',
    name: 'mobile-account-manager-salary-dashboard',
    component: () => import('../views/MobileAccountManagerSalaryDashboard.vue'),
    meta: {
      title: '客户经理薪酬看板'
    }
  },
  {
    path: '/mobile-account-manager-attendance',
    name: 'mobile-account-manager-attendance',
    component: () => import('../views/MobileAttendance.vue'),
    meta: {
      title: '客户经理考勤'
    }
  },
  {
    path: '/mobile-parttime-tasks',
    name: 'mobile-parttime-tasks',
    component: () => import('../views/MobileParttimeTasks.vue'),
    meta: {
      title: '任务列表'
    }
  },
  {
    path: '/mobile-bean-view',
    name: 'mobile-bean-view',
    component: () => import('../views/MobileBeanView.vue'),
    meta: {
      title: '常乐豆明细'
    }
  },
  {
    path: '/mobile-bean-account',
    name: 'mobile-bean-account',
    component: () => import('../views/MobileBeanAccount.vue'),
    meta: {
      title: '常乐豆账户'
    }
  },
  {
    path: '/mobile-bean-withdraw-records',
    name: 'mobile-bean-withdraw-records',
    component: () => import('../views/MobileBeanWithdrawRecords.vue'),
    meta: {
      title: '提现记录'
    }
  },
  {
    path: '/mobile-bean-withdraw',
    name: 'mobile-bean-withdraw',
    component: () => import('../views/MobileBeanWithdraw.vue'),
    meta: {
      title: '自助提现'
    }
  },
  {
    path: '/mobile-bean-settlement',
    name: 'mobile-bean-settlement',
    component: () => import('../views/MobileBeanSettlement.vue'),
    meta: {
      title: '结算记录'
    }
  },
  {
    path: '/mobile-bean-consumption-detail',
    name: 'mobile-bean-consumption-detail',
    component: () => import('../views/MobileBeanConsumptionDetail.vue'),
    meta: {
      title: '消费记录'
    }
  },
  {
    path: '/mobile-notification',
    name: 'mobile-notification',
    component: () => import('../views/MobileNotification.vue'),
    meta: {
      title: '通知'
    }
  },
  {
    path: '/mobile-reimbursement-submit',
    name: 'mobile-reimbursement-submit',
    component: () => import('../views/MobileReimbursementSubmit.vue'),
    meta: {
      title: '申请报销'
    }
  },
  {
    path: '/mobile-reimbursement-list',
    name: 'mobile-reimbursement-list',
    component: () => import('../views/MobileReimbursementList.vue'),
    meta: {
      title: '我的报销'
    }
  },
  {
    path: '/mobile-reimbursement-detail/:id',
    name: 'mobile-reimbursement-detail',
    component: () => import('../views/MobileReimbursementDetail.vue'),
    meta: {
      title: '报销详情'
    }
  },
  {
    path: '/docs',
    name: 'docs',
    component: () => import('../components/DocCenterLayout.vue'),
    // 主侧栏按 name 跳父路由时子路由不参与匹配（内容区空白），这里重定向到默认子路由
    redirect: { name: 'doc-home' },
    meta: {
      title: '文档中心'
    },
    children: [
      // 目录页：/docs 的默认落地页，列出全部文档并承接「我该看哪一份」
      {
        path: '',
        name: 'doc-home',
        component: () => import('../views/DocsHome.vue'),
        meta: {
          title: '文档中心'
        }
      },
      {
        path: 'product-v1',
        name: 'doc-product-v1',
        component: () => import('../views/CompensationCalculationGuide.vue'),
        meta: {
          title: '产品需求v1'
        }
      },
      {
        path: 'product-v2',
        name: 'doc-product-v2',
        component: () => import('../views/V2ProductGuide.vue'),
        meta: {
          title: '产品需求v2'
        }
      },
      {
        path: 'product-v2/financial-voucher',
        name: 'doc-product-v2-financial-voucher',
        component: () => import('../views/v2-product-guide/sections/FinancialVoucher.vue'),
        meta: {
          title: '产品需求v2 / 十一、财务计提凭证'
        }
      },
      {
        path: 'product-v2-phase1',
        name: 'doc-product-v2-phase1',
        component: () => import('../views/V2Phase1ProductGuide.vue'),
        meta: {
          title: '产品需求v2（阶段1）'
        }
      },
      ...v2phase1Chapters.map(ch => ({
        path: `product-v2-phase1/${ch.id}`,
        name: ch.routeName,
        component: chapterModules[`../views/v2phase1/${ch.file}`],
        meta: { title: `产品需求v2（阶段1） / ${ch.order}、${ch.title}` }
      })),
      {
        path: 'welfare-guide',
        name: 'doc-welfare-guide',
        component: () => import('../views/EmployeeWelfareGuide.vue'),
        meta: {
          title: '福利保障说明'
        }
      },
      {
        path: 'personnel-change-flow',
        name: 'doc-personnel-change-flow',
        component: () => import('../views/personnel-change-flow/PersonnelChangeFlowGuide.vue'),
        meta: {
          title: '人员异动流程'
        }
      },
      {
        path: 'personnel-change-flow/function',
        name: 'doc-personnel-change-flow-function',
        component: () => import('../views/personnel-change-flow/sections/FunctionFlow.vue'),
        meta: {
          title: '人员异动流程 / 一、功能流程说明'
        }
      },
      {
        path: 'personnel-change-flow/requirement',
        name: 'doc-personnel-change-flow-requirement',
        component: () => import('../views/personnel-change-flow/sections/Requirement.vue'),
        meta: {
          title: '人员异动流程 / 二、产品需求说明'
        }
      },
      // 假勤重构模块：章节由 leaveReformChapters 单一数据源展开
      ...leaveReformChapters.map(ch => ({
        path: `leave-reform/${ch.id}`,
        name: ch.routeName,
        component: leaveReformChapterModules[`../views/leave-reform-guide/${ch.file}`],
        meta: { title: `假勤重构 / ${ch.order}、${ch.title}` }
      })),
      // 离职流程模块：索引页 + 章节由 resignChapters 单一数据源展开
      {
        path: 'resign-flow',
        name: 'doc-resign-flow-index',
        component: () => import('../views/resign-flow-guide/ResignFlowDocIndex.vue'),
        meta: { title: '离职流程' }
      },
      ...resignChapters.map(ch => ({
        path: `resign-flow/${ch.id}`,
        name: ch.routeName,
        component: resignChapterModules[`../views/resign-flow-guide/${ch.file}`],
        meta: { title: `离职流程 / ${ch.no ? ch.no + ' ' : ch.order + '、'}${ch.title}` }
      })),
      // 第六章「功能详细说明」下的 6.x 章节
      ...featureChapters.map(ch => ({
        path: `resign-flow/${ch.id}`,
        name: ch.routeName,
        component: resignChapterModules[`../views/resign-flow-guide/${ch.file}`],
        meta: { title: `离职流程 / 六、功能详细说明 / ${ch.no} ${ch.title}` }
      })),
      // 事件编排模块：索引页 + 章节由 orchChapters 单一数据源展开
      {
        path: 'orchestration',
        name: 'doc-orch-index',
        component: () => import('../views/orchestration-guide/OrchestrationDocIndex.vue'),
        meta: { title: '事件编排' }
      },
      ...orchChapters.map(ch => ({
        path: `orchestration/${ch.id}`,
        name: ch.routeName,
        component: orchChapterModules[`../views/orchestration-guide/${ch.file}`],
        meta: { title: `事件编排 / ${ch.no ? ch.no + ' ' : ch.order + '、'}${ch.title}` }
      })),
      // 第六章「功能详细说明」下的 6.x 章节
      ...orchFeatureChapters.map(ch => ({
        path: `orchestration/${ch.id}`,
        name: ch.routeName,
        component: orchChapterModules[`../views/orchestration-guide/${ch.file}`],
        meta: { title: `事件编排 / 六、功能详细说明 / ${ch.no} ${ch.title}` }
      })),
      {
        path: 'parttime-account-manager',
        name: 'doc-parttime-account-manager',
        component: () => import('../views/parttime-account-manager/ParttimeAccountManagerGuide.vue'),
        meta: {
          title: '非全客户经理'
        }
      },
      {
        path: 'parttime-account-manager/attendance',
        name: 'doc-parttime-am-attendance',
        component: () => import('../views/parttime-account-manager/sections/Attendance.vue'),
        meta: {
          title: '非全客户经理 / 考勤打卡'
        }
      },
      {
        path: 'parttime-account-manager/functions',
        name: 'doc-parttime-am-functions',
        component: () => import('../views/parttime-account-manager/sections/Functions.vue'),
        meta: {
          title: '非全客户经理 / 功能模块（Web 端与移动端）'
        }
      }
    ]
  },
  // 向后兼容：旧路径重定向到文档中心
  {
    path: '/compensation-calculation-guide',
    redirect: '/docs/product-v1'
  },
  {
    path: '/v2-product-guide',
    redirect: '/docs/product-v2'
  },
  {
    path: '/employee-welfare-guide',
    redirect: '/docs/welfare-guide'
  }
]
