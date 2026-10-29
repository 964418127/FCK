#!/usr/bin/env node
/**
 * 预览 npm run static 的产物（纯静态，无 dev server、无 SPA 回退）。
 *   npm run static:serve
 *   npm run static:serve -- --out=site --port=3100
 *
 * 行为刻意贴近 CDN：
 *   /docs/xxx        → docs/xxx.html（clean URL）
 *   /docs/xxx.html   → 原样
 *   找不到            → 真 404（标签页里就是纯 HTML，不 hydrate）
 */
import { createServer } from 'node:http'
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs'
import { resolve, join, extname } from 'node:path'

const root = process.cwd()
const args = process.argv.slice(2)
const arg = (name, fallback) => {
  const hit = args.find(a => a === `--${name}` || a.startsWith(`--${name}=`))
  if (!hit) return fallback
  const i = hit.indexOf('=')
  return i > -1 ? hit.slice(i + 1) : true
}
const outDir = resolve(root, String(arg('out', 'site')))
const port = Number(arg('port', 3100))

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
}

if (!existsSync(join(outDir, 'manifest.json'))) {
  console.error(`✗ ${outDir} 里没有 manifest.json。先跑：npm run static`)
  process.exit(1)
}

const server = createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0])
  if (urlPath === '/' || urlPath === '') urlPath = '/pages.html'

  let filePath = join(outDir, urlPath)
  if (existsSync(filePath) && statSync(filePath).isDirectory()) filePath = join(filePath, 'index.html')
  if (!existsSync(filePath) && !extname(urlPath)) {
    const withHtml = filePath + '.html'
    if (existsSync(withHtml)) filePath = withHtml
  }

  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.end(`<!doctype html><meta charset="utf-8"><body style="font:14px -apple-system;padding:40px">
      <h2>404</h2><p style="color:#64748b">这个路径没有预渲染成 HTML：<code>${urlPath}</code></p>
      <p><a href="/pages.html">← 回索引</a></p></body>`)
  }

  const st = statSync(filePath)
  res.setHeader('Content-Type', mime[extname(filePath)] || 'application/octet-stream')
  res.setHeader('Content-Length', st.size)
  res.setHeader('Cache-Control', 'no-cache')
  createReadStream(filePath).pipe(res)
})

server.listen(port, () => {
  const manifest = JSON.parse(readFileSync(join(outDir, 'manifest.json'), 'utf-8'))
  console.log(`\n  ✓ 纯静态预览 http://localhost:${port}/`)
  console.log(`    目录：${outDir}`)
  console.log(`    页面：${manifest.pages.length} 个（构建于 ${manifest.buildAt}）\n`)
})
