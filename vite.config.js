import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import http from 'node:http'
import { writeFileSync, existsSync, mkdirSync, statSync, createReadStream, readdirSync, readFileSync } from 'node:fs'
import { resolve, join, extname, relative } from 'node:path'
import { v2phase1Chapters } from './src/docs/chapters.js'

// 静态化白名单：只对 /docs/product-v2-phase1 这条线做预渲染
// 业务路由（/welcome /job-compensation-template 等）保持 SPA 模式
const ssgIncludePaths = [
  '/docs/product-v2-phase1',
  ...v2phase1Chapters.map(ch => ch.path)
]

// 收集本次 build 渲染过的所有路径
const renderedPaths = new Set()

// 确保 dist 目录存在（manifest 钩子要写到这里）
const distDir = resolve(process.cwd(), 'dist')
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true })
}

// ============== Dev server 同时 serve dist/ 产物 ==============
// 访问规则：
//   /_static/                              → 简易导航页（manifest 里的所有页面）
//   /_static/manifest.json                 → 静态化清单
//   /_static/<path>.html                   → 直接访问（带 .html 后缀）
//   /_static/<path>                        → 自动加 .html 后缀（clean URL）
const STATIC_PREFIX = '/_static'

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.ico':  'image/x-icon',
}

const serveDistPlugin = {
  name: 'serve-static-dist',
  configureServer(server) {
    if (!existsSync(distDir)) {
      console.log('\n  ⚠  [serve-dist] dist/ 不存在。先跑 npm run generate 生成静态产物。\n')
      return
    }

    server.middlewares.use(STATIC_PREFIX, (req, res, next) => {
      let urlPath = decodeURIComponent(req.url.split('?')[0])

      // /_static/ → 简易导航页
      if (urlPath === '/' || urlPath === '') {
        return serveIndexPage(res)
      }

      // /_static/manifest.json
      if (urlPath === '/manifest.json') {
        const mp = join(distDir, 'manifest.json')
        if (existsSync(mp)) return serveFile(res, mp)
        res.statusCode = 404
        return res.end('manifest.json not found, run npm run generate first')
      }

      // /_static/<path>  → dist/<path>（自动加 .html）
      let filePath = join(distDir, urlPath)
      if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
        const withHtml = filePath + '.html'
        if (existsSync(withHtml) && statSync(withHtml).isFile()) {
          filePath = withHtml
        } else {
          // 真的没有 → 404
          res.statusCode = 404
          return res.end(`404: ${urlPath} not found in dist/`)
        }
      }
      serveFile(res, filePath)
    })

    const port = server.config.server.port || 5178
    console.log(`\n  ✓ [serve-dist] dist/ 已挂载到 http://localhost:${port}${STATIC_PREFIX}/  (SSR HTML 预览)\n`)

    // 同时启动独立 3000 端口的完整静态服务器（含 client script，菜单/markmap 可用）
    startDistStaticServer()

    // dev server 关闭时也关掉 3000 server
    server.httpServer?.on('close', () => {
      stopDistStaticServer()
    })
  }
}

function serveFile(res, filePath) {
  const stat = statSync(filePath)
  const mime = mimeTypes[extname(filePath)] || 'application/octet-stream'
  res.statusCode = 200
  res.setHeader('Content-Type', mime)
  res.setHeader('Cache-Control', 'no-cache')

  if (extname(filePath) === '.html') {
    // 注入 <base href="/_static/"> + 把 /assets/ 改写为 /_static/assets/
    // 移除 <script type="module" src="/_static/assets/app-*.js"> 客户端入口
    //   → 静态预览不 hydrate，避免 vue-router 找不到 /_static/ 路径而清空 DOM
    //   → 页面是纯静态，点击链接触发完整页面跳转（等同于部署到 CDN 的体验）
    let html = readFileSync(filePath, 'utf-8')
    html = html
      .replace('<head>', '<head>\n    <base href="/_static/">')
      .replace(/(["'])\/assets\//g, '$1/_static/assets/')
      .replace(/<script[^>]*src="[^"]*\/assets\/app-[^"]*\.js"[^>]*><\/script>/, '')
    res.setHeader('Content-Type', mime)
    res.setHeader('Content-Length', Buffer.byteLength(html))
    return res.end(html)
  }

  res.setHeader('Content-Length', stat.size)
  createReadStream(filePath).pipe(res)
}

function serveIndexPage(res) {
  let pages = []
  try {
    const manifest = JSON.parse(readFileSync(join(distDir, 'manifest.json'), 'utf-8'))
    pages = manifest.pages || []
  } catch {
    // 没 manifest 就列 dist/docs/product-v2-phase1/ 下的 html
    try {
      const listDir = join(distDir, 'docs/product-v2-phase1')
      pages = readdirSync(listDir).filter(f => f.endsWith('.html')).map(f => '/docs/product-v2-phase1/' + f.replace(/\.html$/, ''))
      pages.unshift('/docs/product-v2-phase1')
    } catch {}
  }

  const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>静态化文档预览（_static 模式）</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1f2937; }
  h1 { font-size: 22px; border-bottom: 2px solid #ef4444; padding-bottom: 8px; }
  .meta { color: #6b7280; font-size: 13px; margin: 8px 0 24px; }
  .warn { background: #fef3c7; border-left: 3px solid #f59e0b; padding: 10px 14px; border-radius: 4px; font-size: 13px; line-height: 1.6; margin: 0 0 20px; }
  .warn strong { color: #b45309; }
  ul { list-style: none; padding: 0; }
  li { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
  li a { color: #2563eb; text-decoration: none; font-family: ui-monospace, monospace; font-size: 14px; }
  li a:hover { text-decoration: underline; }
  .empty { color: #9ca3af; padding: 20px; text-align: center; }
</style>
</head>
<body>
  <h1>📚 静态化文档预览（_static 模式）</h1>
  <div class="warn">
    <strong>⚠ 此模式仅供快速预览 SSR HTML。</strong>菜单点击、markmap 等需要 JS 的功能不可用。
    完整功能请访问 <a href="http://localhost:3000/">localhost:3000</a>（dist 独立服务器，dev 启动时自动起）。
  </div>
  <p class="meta">共 ${pages.length} 个页面。</p>
  ${pages.length === 0
    ? '<div class="empty">dist/ 是空的。先跑 npm run generate。</div>'
    : '<ul>' + pages.map(p =>
        `<li><a href="${STATIC_PREFIX}${p}.html">${p}</a></li>`
      ).join('') + '</ul>'
  }
</body>
</html>`
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.end(html)
}

// ============== 独立 dist 静态服务器（3000 端口）==============
// 完整功能版：保留 client script，菜单/markmap 全部工作
// dev 启动时自动 spawn，dev 关闭时自动 kill
const DIST_PORT = 3000
let distServer = null

function startDistStaticServer() {
  if (!existsSync(distDir)) {
    console.log('\n  ⚠  [dist-3000] dist/ 不存在，跳过。先跑 npm run generate。\n')
    return
  }
  if (distServer) return

  const mime = {
    '.html': 'text/html; charset=utf-8',
    '.js':   'application/javascript; charset=utf-8',
    '.mjs':  'application/javascript; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg':  'image/svg+xml',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.ico':  'image/x-icon',
  }

  distServer = http.createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split('?')[0])
    if (urlPath === '/' || urlPath === '') urlPath = '/index.html'
    let filePath = join(distDir, urlPath)

    if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
      const withHtml = filePath + '.html'
      if (existsSync(withHtml) && statSync(withHtml).isFile()) {
        filePath = withHtml
      } else {
        res.statusCode = 404
        return res.end('404 not found: ' + urlPath)
      }
    }

    const stat = statSync(filePath)
    res.setHeader('Content-Type', mime[extname(filePath)] || 'application/octet-stream')
    res.setHeader('Content-Length', stat.size)
    res.setHeader('Cache-Control', 'no-cache')
    createReadStream(filePath).pipe(res)
  })

  distServer.listen(DIST_PORT, () => {
    console.log(`\n  ✓ [dist-3000] http://localhost:${DIST_PORT}/  ← 完整静态产物（菜单/markmap 可用）\n`)
  })

  distServer.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      console.log(`\n  ⚠  [dist-3000] 端口 ${DIST_PORT} 已被占用，跳过（可能你已经手动起了 serve）\n`)
    } else {
      console.error('[dist-3000]', e)
    }
  })
}

function stopDistStaticServer() {
  if (distServer) {
    distServer.close()
    distServer = null
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), serveDistPlugin],
  server: {
    port: 5178,
    host: '0.0.0.0'
  },
  ssgOptions: {
    includedRoutes: async (paths) => paths.filter(p => ssgIncludePaths.includes(p)),
    script: 'async',
    formatting: 'minify',
    crittersOptions: {
      preload: 'swap',
    },
    onPageRendered: async (routePath, html) => {
      renderedPaths.add(routePath)
      const manifest = {
        buildAt: new Date().toISOString(),
        total: renderedPaths.size,
        pages: [...renderedPaths].sort()
      }
      writeFileSync(
        resolve(distDir, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
      )
    }
  },
})