/**
 * v5 个人查询悬浮卡验证：切到个人查询 tab，悬浮 11-24 的轴，整页截图看悬浮卡。
 * 用法：node probe-v5-me-hover.mjs <url> <out.png>
 */
import puppeteer from 'puppeteer-core'
const [, , url = 'http://localhost:5179/schedule-v5', out = 'probe-v5-me-hover.png'] = process.argv
const sleep = ms => new Promise(r => setTimeout(r, ms))
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new', args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--window-size=1560,1100']
})
try {
  const page = await browser.newPage()
  await page.setViewport({ width: 1560, height: 1100, deviceScaleFactor: 2 })
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {})
  await sleep(1500)
  const ok = await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.offsetParent && b.textContent.trim() === '个人查询')
    if (!btn) return false
    btn.click()
    return true
  })
  console.log('[tab 个人查询]', ok)
  await sleep(800)
  /* 悬浮 11-24 的轴（这天有请假事实 + 补位，悬浮卡能看到班次/事实/补位三行） */
  const target = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.me-row')]
    const row = rows.find(n => n.textContent.includes('11-24')) || rows[2] || rows[0]
    if (!row) return null
    const track = row.querySelector('.me-track')
    if (!track) return null
    const r = track.getBoundingClientRect()
    return { x: r.x + Math.min(260, r.width / 3), y: r.y + r.height / 2 }
  })
  if (!target) { console.error('找不到 11-24 的轴'); process.exit(1) }
  await page.mouse.move(target.x, target.y)
  await sleep(600)
  /* 裁到主面板区域，供文档 6.3.5 使用 */
  const pane = await page.evaluate(() => {
    const el = document.querySelector('.pane')
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { x: r.x, y: r.y, width: r.width, height: Math.min(r.height, 1100 - r.y) }
  })
  if (pane) await page.screenshot({ path: out, clip: pane })
  else await page.screenshot({ path: out })
  console.log('[probe-v5-me-hover] 已输出', out)
} finally { await browser.close() }
