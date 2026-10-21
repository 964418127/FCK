import { ViteSSG } from 'vite-ssg'
import './style.css'
import App from './App.vue'

// 引入Element Plus组件库
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 引入 Shadcn 风格主题覆盖样式（必须在 Element Plus 样式之后引入）
import './styles/theme.css'

// 引入Element Plus图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 引入纯数据路由配置（不含 createWebHistory，SSR 安全）
import { routes } from './router/routes.js'

// 引入权限指令
import { setupPermissionDirective } from './composables/usePermission'

// 菜单门控：在挂载前就把配置套上（Web 与移动端菜单是两套页面，不能只在 MainLayout 里加载）
import { bootstrapGate, connectGate } from './composables/useGateConfig.js'

// vite-ssg 约定的导出形式：dev / build / generate 都会调用
export const createApp = ViteSSG(
  App,
  { routes, base: import.meta.env.BASE_URL },
  ({ app, isClient, router, initialState }) => {
    // 注册Element Plus图标
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
      app.component(key, component)
    }

    // 使用Element Plus组件库
    app.use(ElementPlus)

    // 设置权限指令
    setupPermissionDirective(app)

    // 客户端 hydration 之后才会执行的逻辑
    if (isClient) {
      // 菜单配置：先套本机缓存（避免首帧闪全套菜单），再向服务端对齐并订阅变更。
      // 放在这里而不是 MainLayout —— 移动端菜单（/mobile-menu）是顶层路由，不走 MainLayout
      const query = Object.fromEntries(new URLSearchParams(window.location.search))
      bootstrapGate(query)
      connectGate()

      // 动态导入 router 实例（client-only），叠加客户端守卫
      import('./router').then(({ default: clientRouter }) => {
        clientRouter.beforeEach((to, from, next) => {
          if (typeof document !== 'undefined') {
            document.title = to.meta.title || '权限管理系统'
          }
          next()
        })
      })
    }
  }
)
