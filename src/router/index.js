import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../components/MainLayout.vue'
import Dashboard from '../views/Dashboard.vue'
import Welcome from '../views/Welcome.vue'
import Organization from '../components/Organization.vue'
import RoleManagement from '../components/RoleManagement.vue'
import NewRoleManagement from '../components/NewRoleManagement.vue'
import NewRoleDetail from '../components/NewRoleDetail.vue'
import UserManagement from '../components/UserManagement.vue'

// 路由配置
const routes = [
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
        path: 'dashboard',
        name: 'dashboard',
        component: Dashboard,
        meta: {
          title: '仪表盘'
        }
      },
      {
        path: 'organization',
        name: 'organization',
        component: Organization,
        meta: {
          title: '组织架构'
        }
      },
      {
        path: 'role',
        name: 'role',
        component: RoleManagement,
        meta: {
          title: '角色管理（旧）'
        }
      },
      {
        path: 'new-role',
        name: 'new-role',
        component: NewRoleManagement,
        meta: {
          title: '平台超管'
        }
      },
      {
        path: 'brand-role',
        name: 'brand-role',
        component: () => import('../views/BrandRole.vue'),
        meta: {
          title: '品牌角色'
        }
      },
      {
        path: 'new-role/:id',
        name: 'new-role-detail',
        component: NewRoleDetail,
        meta: {
          title: '角色详情'
        }
      },
      {
        path: 'role-container-scope/:id',
        name: 'role-container-scope',
        component: () => import('../views/RoleContainerScope.vue'),
        meta: {
          title: '岗位容器范围配置'
        }
      },
      {
        path: 'user',
        name: 'user',
        component: UserManagement,
        meta: {
          title: '员工管理'
        }
      },
      {
        path: 'user-center',
        name: 'user-center',
        component: () => import('../views/UserCenter.vue'),
        meta: {
          title: '用户中心'
        }
      },
      {
        path: 'user-logs',
        name: 'user-logs',
        component: () => import('../views/UserLogs.vue'),
        meta: {
          title: '动态日志'
        }
      },
      {
        path: 'brand',
        name: 'brand',
        component: () => import('../views/BrandManagement.vue'),
        meta: {
          title: '品牌管理'
        }
      },
      {
        path: 'certified-user',
        name: 'certified-user',
        component: () => import('../views/CertifiedUser.vue'),
        meta: {
          title: '认证用户'
        }
      },
      {
        path: 'visitor-user',
        name: 'visitor-user',
        component: () => import('../views/VisitorUser.vue'),
        meta: {
          title: '访客用户'
        }
      },
      {
        path: 'data-rule',
        name: 'data-rule',
        component: () => import('../views/DataRule.vue'),
        meta: {
          title: '数据策略'
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
        path: 'business-entity',
        name: 'business-entity',
        component: () => import('../views/BusinessEntity.vue'),
        meta: {
          title: '业务主体管理'
        }
      },
      {
        path: 'data-sync',
        name: 'data-sync',
        component: () => import('../views/DataSyncConfig.vue'),
        meta: {
          title: '数据同步管理'
        }
      },
      {
        path: 'permission',
        name: 'permission',
        component: () => import('../views/Permission.vue'),
        meta: {
          title: '权限注册'
        }
      },
      {
        path: 'business',
        name: 'business',
        component: () => import('../views/BusinessManagement.vue'),
        meta: {
          title: '业务管理'
        }
      },
      {
          path: 'process',
          name: 'process',
          component: () => import('../views/ProcessManagement.vue'),
          meta: {
            title: '业务流程管理'
          }
        },
      {
        path: 'process-designer',
        name: 'process-designer',
        component: () => import('../views/ProcessDesigner.vue'),
        meta: {
          title: '可视化流程设计 v1'
        }
      },
      {
        path: 'rule-configurator',
        name: 'rule-configurator',
        component: () => import('../views/RuleConfigurator.vue'),
        meta: {
          title: '可视化规则配置 v1'
        }
      },
      {
        path: 'event-configurator',
        name: 'event-configurator',
        component: () => import('../views/EventConfigurator.vue'),
        meta: {
          title: '可视化事件配置 v1'
        }
      },
      {
        path: 'engine-business',
        name: 'engine-business',
        component: () => import('../views/EngineBusiness.vue'),
        meta: {
          title: '引擎业务'
        }
      },
      {
        path: 'engine-process',
        name: 'engine-process',
        component: () => import('../views/EngineProcessDesigner.vue'),
        meta: {
          title: '引擎流程设计'
        }
      },
      {
        path: 'engine-event',
        name: 'engine-event',
        component: () => import('../views/EngineEventManagement.vue'),
        meta: {
          title: '引擎事件管理'
        }
      },
      {
        path: 'engine-work-permission',
        name: 'engine-work-permission',
        component: () => import('../views/EngineWorkPermission.vue'),
        meta: {
          title: '自动化引擎工作权限'
        }
      },
        {
          path: 'business-container',
          name: 'business-container',
          component: () => import('../views/BusinessContainer.vue'),
          meta: {
            title: '业务容器管理'
          }
        },
        {
          path: 'share-recommend-list',
          name: 'share-recommend-list',
          component: () => import('../views/ShareRecommendList.vue'),
          meta: {
            title: '分享推荐列表'
          }
        },
        {
          path: 'share-rule-management',
          name: 'share-rule-management',
          component: () => import('../views/ShareRuleManagement.vue'),
          meta: {
            title: '分享活动'
          }
        },
        {
          path: 'message-history',
          name: 'message-history',
          component: () => import('../views/message/MessageHistory.vue'),
          meta: {
            title: '历史消息管理'
          }
        },
        {
          path: 'message-scheduled',
          name: 'message-scheduled',
          component: () => import('../views/message/MessageScheduled.vue'),
          meta: {
            title: '定时消息管理'
          }
        },
        {
          path: 'message-plan',
          name: 'message-plan',
          component: () => import('../views/message/MessagePlan.vue'),
          meta: {
            title: '消息发送计划'
          }
        },
        {
          path: 'message-template',
          name: 'message-template',
          component: () => import('../views/message/MessageTemplate.vue'),
          meta: {
            title: '模板配置'
          }
        },
        {
          path: 'message-channel',
          name: 'message-channel',
          component: () => import('../views/message/MessageChannel.vue'),
          meta: {
            title: '消息通道配置'
          }
        },
        {
          path: 'message-rule',
          name: 'message-rule',
          component: () => import('../views/message/MessageRule.vue'),
          meta: {
            title: '规则配置'
          }
        },
      {
        path: 'message-type',
        name: 'message-type',
        component: () => import('../views/message/MessageType.vue'),
        meta: {
          title: '消息类型配置'
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
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue'),
    meta: {
      title: '登录'
    }
  },
  {
    path: '/system-select',
    name: 'system-select',
    component: () => import('../views/SystemSelect.vue'),
    meta: {
      title: '选择系统'
    }
  },
  {
    path: '/403',
    name: '403',
    component: () => import('../views/403.vue'),
    meta: {
      title: '无权限访问'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: '404',
    component: () => import('../views/404.vue'),
    meta: {
      title: '页面不存在'
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