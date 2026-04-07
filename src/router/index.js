import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../components/MainLayout.vue'
import Welcome from '../views/Welcome.vue'

// 路由配置
const routes = [
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
    path: '/mobile-schedule-leave',
    name: 'mobile-schedule-leave',
    component: () => import('../views/MobileScheduleLeave.vue'),
    meta: {
      title: '移动端排班排假'
    }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title || '权限管理系统'
  next()
})

export default router