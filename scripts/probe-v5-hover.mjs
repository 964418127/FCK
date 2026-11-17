/**
 * v5 全员一周悬浮卡验证：切到事实记录 tab，悬浮有内容的格子，整页截图看悬浮卡位置。
 * 用法：node probe-v5-hover.mjs <url> <out.png>
 */
import puppeteer from 'puppeteer-core'
const [, , url = 'http://localhost:5179/schedule-v5', out = 'probe-v5-hover.png'] = process.argv
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
    const btn = [...document.querySelectorAll('button')].find(b => b.offsetParent && b.textContent.trim() === '事实记录')
    if (!btn) return false
    btn.click()
    return true
  })
  console.log('[tab 事实记录]', ok)
  await sleep(800)
  /* 悬浮含请假占用 chip 的格子（能看到班次/事实/补位三条带），没有就退第一个有内容的格子 */
  const cell = await page.evaluate(() => {
    const pick = sel => {
      const chip = [...document.querySelectorAll(sel)].find(n => n.offsetParent)
      const el = chip && chip.closest('.tl-cell')
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
    }
    return pick('.tl-chip.ft') || pick('.tl-cell.has')
  })
  if (!cell) { console.error('找不到有内容的格子'); process.exit(1) }
  await page.mouse.move(cell.x, cell.y)
  await sleep(600)
  await page.screenshot({ path: out })
  console.log('[probe-v5-hover] 已输出', out)
} finally { await browser.close() }
