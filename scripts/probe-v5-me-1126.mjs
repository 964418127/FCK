/**
 * v5 个人查询 11-26 行特写：悬浮该行出明细卡，裁剪 11-26 行 + 悬浮卡区域。
 * 用法：node probe-v5-me-1126.mjs <url> <out.png>
 */
import puppeteer from 'puppeteer-core'
const [, , url = 'http://localhost:5179/schedule-v5', out = 'probe-v5-me-1126.png'] = process.argv
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
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.offsetParent && b.textContent.trim() === '个人查询')
    if (btn) btn.click()
  })
  await sleep(800)
  const target = await page.evaluate(() => {
    const row = [...document.querySelectorAll('.me-row')].find(n => n.textContent.includes('11-26'))
    if (!row) return null
    const track = row.querySelector('.me-track')
    const r = track.getBoundingClientRect()
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, rect: { x: r.x, y: r.y, width: r.width, height: r.height } }
  })
  if (!target) { console.error('找不到 11-26 行'); process.exit(1) }
  await page.mouse.move(target.x, target.y)
  await sleep(600)
  /* 裁：11-26 行左右 900px + 下方 400px（盖住悬浮卡） */
  const clip = { x: Math.max(0, target.rect.x - 60), y: Math.max(0, target.rect.y - 30), width: 1100, height: 420 }
  await page.screenshot({ path: out, clip })
  console.log('[probe-v5-me-1126] 已输出', out)
} finally { await browser.close() }
