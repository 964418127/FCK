import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// 引入Element Plus组件库
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 引入 Shadcn 风格主题覆盖样式（必须在 Element Plus 样式之后引入）
import './styles/theme.css'

// 引入Element Plus图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 引入路由配置
import router from './router'

// 引入权限指令
import { setupPermissionDirective } from './composables/usePermission'

// 创建Vue应用
const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用Element Plus组件库
app.use(ElementPlus)

// 使用路由
app.use(router)

// 设置权限指令
setupPermissionDirective(app)

// 挂载应用
app.mount('#app')
