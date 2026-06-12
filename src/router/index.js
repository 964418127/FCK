/**
 * 客户端使用的 router 实例。
 * createWebHistory 必须在浏览器环境执行（window 存在），
 * 因此本文件只在客户端 import 才会执行顶层 createRouter。
 * vite-ssg 静态化时 import 的是 routes.js（纯数据）。
 */
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫：设置页面标题（仅客户端）
router.beforeEach((to, from, next) => {
  if (typeof document !== 'undefined') {
    document.title = to.meta.title || '权限管理系统'
  }
  next()
})

export default router
