/**
 * 侧边栏菜单目录（供 /gate 菜单配置页使用）。
 *
 * ⚠️ 这里不再是一份独立数据 —— 真实来源是 `sidebarMenu.js`（MainLayout 也用它渲染）。
 * 之前这份文件由 `npm run gen:menu` 从 MainLayout 模板反向生成，模板一改就得重跑，
 * 而且和模板各存一份真相。现在改为派生，`gen:menu` 已退役。
 */
import { sidebarMenu, toCatalog } from './sidebarMenu.js'

export const menuCatalog = toCatalog(sidebarMenu)
