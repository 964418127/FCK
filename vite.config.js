import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { v2phase1Chapters } from './src/docs/chapters.js'
import { leaveReformChapters } from './src/docs/leaveReformChapters.js'
import { resignChapters } from './src/docs/resignChapters.js'
import { gateMiddleware } from './scripts/gate-store.js'
import { llmMiddleware } from './scripts/llm-proxy.js'
import { printCommandHelp } from './scripts/commands.mjs'
import { sidebarMenu } from './src/config/sidebarMenu.js'
import { mobileMenuGroups } from './src/config/mobileMenu.js'
import { docMenu } from './src/docs/menu.js'

// 静态化白名单：只对文档中心这几条线做预渲染
// 业务路由（/welcome /job-compensation-template 等）保持 SPA 模式
// 加线只需在这里补一条「线首页 + 章节 path」，章节数组是单一数据源
const ssgIncludePaths = [
  // 产品需求 v2（阶段1）
  '/docs/product-v2-phase1',
  ...v2phase1Chapters.map(ch => ch.path),
  // 假勤重构
  ...leaveReformChapters.map(ch => ch.path),
  // 离职流程
  ...resignChapters.map(ch => ch.path)
]

// ---------- gate 模式：只预渲染菜单里开放（未被隐藏）的页面 ----------
// SSG_GATE_HIDDEN=逗号分隔的菜单 id（build-static.mjs 从 .gate-state.json 读出传入）。
// 三棵菜单树（Web 侧边栏 / 移动端 / 文档中心）里没被隐藏的节点就是「开放集合」：
//   叶子 → 页面（to 或 index=路由 name 映射回 path）
//   分组 → 自身或后代有开放项时入口页保留
// 结构性底座（根 / 文档目录 / 移动端总览 / 登录）始终打包。
// 结果写进 SSG 产物 manifest.json 的 gate 字段，供 build-static 校验。
let gateAllowSet = null

const gateBasePaths = ['/', '/docs', '/mobile-menu', '/login', '/mobile-login']

function buildGateAllowSet (routes) {
  const hidden = new Set(String(process.env.SSG_GATE_HIDDEN || '').split(',').filter(Boolean))
  // name → 绝对 path（路由表里 children 的 path 是相对的，这里拼回绝对）
  const nameToPath = new Map()
  const walkRoutes = (list, parent = '') => {
    ;(list || []).forEach((r) => {
      if (!r || !r.path) return
      const abs = r.path.startsWith('/') ? r.path : (parent.replace(/\/$/, '') + '/' + r.path)
      if (r.name) nameToPath.set(r.name, abs)
      if (r.children) walkRoutes(r.children, abs)
    })
  }
  walkRoutes(routes)

  const idOf = (n) => n.index || n.id
  const kidsOf = (n) => n.children || n.items
  const hasOpenDescendant = (n) =>
    (kidsOf(n) || []).some((c) => !hidden.has(idOf(c)) || hasOpenDescendant(c))
  // 节点 → 页面 path：to 可能是字符串（可带 query，剥掉）、路由定位对象（path 或 name）、
  // 或干脆没有（靠 index=路由 name 映射）
  const toPathOf = (n) => {
    const t = n.to
    if (typeof t === 'string' && t) return t.split('?')[0]
    if (t && typeof t === 'object') {
      if (t.path) return String(t.path).split('?')[0]
      if (t.name) return nameToPath.get(t.name) || null
      return null
    }
    return nameToPath.get(idOf(n)) || null
  }

  const allow = new Set(gateBasePaths)
  const walkMenu = (nodes) => {
    (nodes || []).forEach((n) => {
      if (!n) return
      const visible = !hidden.has(idOf(n))
      const kids = kidsOf(n)
      if (kids && kids.length) {
        walkMenu(kids)
        // 分组自身开放、或组里还有开放项 → 分组入口页保留
        if (visible || hasOpenDescendant(n)) {
          const page = toPathOf(n)
          if (page) allow.add(page)
        }
        return
      }
      if (visible) {
        const page = toPathOf(n)
        if (page) allow.add(page)
      }
    })
  }
  walkMenu(sidebarMenu)
  walkMenu(mobileMenuGroups)
  walkMenu(docMenu)
  return allow
}

// 收集本次 build 渲染过的所有路径
const renderedPaths = new Set()

// 产物目录：默认 dist，可用 SSG_OUT_DIR 覆盖（vite-ssg 的 CLI 不认 --outDir，
// 想在别处试跑只能走这个环境变量，例如 SSG_OUT_DIR=/tmp/fck-ssg npm run generate）
const OUT_DIR = process.env.SSG_OUT_DIR || 'dist'

// 确保产物目录存在（manifest 钩子要写到这里）
const distDir = resolve(process.cwd(), OUT_DIR)
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true })
}

// ============== 菜单门控（gate）服务端接口 ==============
// 配置存在服务端（.gate-state.json），所有客户端读同一份 —— 多页签、多台电脑（局域网）都一致。
// 没有这个接口的静态托管（如 GitHub Pages）会自动退化为「仅本机」模式，见 src/composables/useGateConfig.js
const gateStatePlugin = {
  name: 'gate-state',
  configureServer(server) {
    server.middlewares.use('/api/gate', gateMiddleware)
  },
  configurePreviewServer(server) {
    server.middlewares.use('/api/gate', gateMiddleware)
  }
}

// ============== LLM 中转（v2 事件树生成） ==============
// key 存在服务端 .llm-config.json，浏览器只拿掩码；静态产物没有这层，前端退化为回放。
const llmProxyPlugin = {
  name: 'llm-proxy',
  configureServer(server) {
    server.middlewares.use('/api/llm', llmMiddleware)
  },
  configurePreviewServer(server) {
    server.middlewares.use('/api/llm', llmMiddleware)
  }
}

// ============== 启动横幅：把可用命令与作用打到控制台 ==============
// 命令清单在 scripts/commands.mjs（单一数据源），这里只负责挑时机打印：
// 等 httpServer 真正 listening 之后再打，才不会插在 vite 的 ready 之前显得突兀
const commandHelpPlugin = {
  name: 'command-help',
  configureServer(server) {
    const show = () => printCommandHelp({
      mode: 'dev',
      port: server.httpServer?.address()?.port,
      notes: [
        'gate 服务端共享已启用：GET/POST /api/gate · SSE /api/gate/events',
        'LLM 中转已挂载：/api/llm（配置 / 连通性测试 / 流式生成），key 存 .llm-config.json',
        '静态化产物：npm run static（site/）· npm run static:offline（site-offline/）'
      ]
    })
    if (server.httpServer?.listening) setTimeout(show, 0)
    else server.httpServer?.once('listening', () => setTimeout(show, 0))
  },
  configurePreviewServer(server) {
    const show = () => printCommandHelp({
      mode: 'preview',
      port: server.httpServer?.address()?.port
    })
    if (server.httpServer?.listening) setTimeout(show, 0)
    else server.httpServer?.once('listening', () => setTimeout(show, 0))
  }
}

// https://vite.dev/config/
// 用函数式 config：vite-ssg 会连跑两次构建（client → server），
// 只有 client 那次能改成 IIFE（server 那次必须是 ESM，否则渲染端加载不了）
export default defineConfig(({ isSsrBuild } = {}) => ({
  base: process.env.SSG_BASE || (process.env.GITHUB_PAGES === 'true' ? '/FCK/' : '/'),
  plugins: [vue(), gateStatePlugin, llmProxyPlugin, commandHelpPlugin],
  define: {
    // 离线包（SSG_IIFE=1）用 hash 路由：file:// 下 pushState 会 SecurityError。
    // main.js 据此给 ViteSSG 传自己的 history（vite-ssg 里 history 在 routerOptions 之前展开，传的会覆盖它）
    'import.meta.env.VITE_HASH_ROUTER': JSON.stringify(process.env.SSG_IIFE === '1' ? '1' : '0')
  },
  // 离线包：把「构建期固定的 /assets/xxx.png」改成「运行时按页面深度拼」。
  // 因为图片是 el-image 在 JS 里赋 src 的，HTML 层的路径改写管不到；
  // 页面深度由 build-static 注入的 window.__FCK_ASSET_BASE__ 给出（如 '../../'）。
  // 只在 client 那次构建生效：SSR 那次跑在 Node 里没有 window，会把带图的文档页直接渲染崩掉
  experimental: process.env.SSG_IIFE === '1' && !isSsrBuild
    ? {
        renderBuiltUrl (filename, { hostType }) {
          if (hostType === 'js') {
            return { runtime: `(window.__FCK_ASSET_BASE__||"")+${JSON.stringify(filename)}` }
          }
          return { relative: true }
        }
      }
    : undefined,
  build: {
    outDir: OUT_DIR,
    // 离线包本来就是一个 6MB 的单文件（file:// 不能懒加载）；SSR 那次也是整包进内存，
    // 两者的体积告警都没有意义，只对普通 client 构建保留（用来盯真实的首屏体积）
    chunkSizeWarningLimit: process.env.SSG_IIFE === '1' || isSsrBuild ? 8000 : 500,
    // SSG_IIFE=1 → 客户端打成单个经典脚本（非 ES module）。
    // file:// 下 <script type="module"> 会被 CORS 拦，只有 classic script（IIFE）能跑，
    // 且必须 inlineDynamicImports 把 135 个路由懒加载包并进一个文件。
    // assetFileNames 两次构建必须一致：client 默认 `name.hash.ext`、SSR 默认 `name-hash.ext`，
    // 预渲染出的 HTML 引用的是 SSR 那套（带短横线），到产物里就找不到文件了
    rollupOptions: process.env.SSG_IIFE === '1'
      ? {
          // IIFE 下 rolldown 会对每个用到 import.meta 的模块喊一句 EMPTY_IMPORT_META，
          // 全站 133 个模块 = 133 条警告，把真正的报错淹了。Vite 已经把 import.meta.env.*
          // 静态替换掉，剩下的运行时 import.meta 在离线包里没有使用方，直接静音。
          onwarn (warning, warn) {
            if (warning.code === 'EMPTY_IMPORT_META') return
            warn(warning)
          },
          output: {
            assetFileNames: 'assets/[name].[hash].[ext]',
            ...(isSsrBuild
              ? {}
              : {
                  format: 'iife',
                  inlineDynamicImports: true,
                  entryFileNames: 'assets/app.[hash].js',
                  chunkFileNames: 'assets/[name].[hash].js'
                })
          }
        }
      : undefined
  },
  server: {
    port: 5178,
    host: '0.0.0.0'
  },
  ssgOptions: {
    // 优先级：SSG_GATE_HIDDEN（gate 开放集合）> SSG_ALL=1（全站）> ssgIncludePaths 白名单
    includedRoutes: async (paths, routes) => {
      if (process.env.SSG_GATE_HIDDEN) {
        gateAllowSet = buildGateAllowSet(routes)
        const norm = (p) => (p.startsWith('/') ? p : '/' + p)
        return paths.filter((p) => gateAllowSet.has(norm(p)))
      }
      if (process.env.SSG_ALL === '1') return paths
      return paths.filter(p => ssgIncludePaths.includes(p))
    },
    script: 'async',
    formatting: 'minify',
    crittersOptions: {
      preload: 'swap',
    },
    onPageRendered: async (routePath, html) => {
      // vite-ssg 传进来的 routePath 有时带前导斜杠、有时不带，统一成 /xxx
      renderedPaths.add(routePath.startsWith('/') ? routePath : '/' + routePath)
      const manifest = {
        buildAt: new Date().toISOString(),
        total: renderedPaths.size,
        pages: [...renderedPaths].sort(),
        ...(gateAllowSet
          ? { gate: { filtered: true, allowed: [...gateAllowSet].sort(), hiddenIds: String(process.env.SSG_GATE_HIDDEN).split(',').filter(Boolean).length } }
          : {})
      }
      writeFileSync(
        resolve(distDir, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
      )
    }
  },
}))