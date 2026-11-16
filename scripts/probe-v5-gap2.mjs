/* 探针三：算法服务页 + 编辑抽屉最后一步 + 结果层缺口视图 */
import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars']
})
try {
  const page = await browser.newPage()
  const errs = []
  page.on('pageerror', e => errs.push('pageerror: ' + e.message))
  await page.setViewport({ width: 1500, height: 1000, deviceScaleFactor: 1 })

  /* ① 算法服务页 */
  await page.goto('http://localhost:5173/schedule-v5?main=algo', { waitUntil: 'networkidle2', timeout: 30000 })
  await new Promise(r => setTimeout(r, 900))
  await page.screenshot({ path: '/tmp/v5-algo2.png', fullPage: true })
  const algo = await page.evaluate(() => ({
    hasRegBtn: [...document.querySelectorAll('button')].some(b => b.textContent.includes('登记一项')),
    head: document.querySelector('.svc-head p')?.textContent.replace(/\s+/g, ' ').trim()
  }))

  /* ② 编辑班次抽屉 */
  await page.goto('http://localhost:5173/schedule-v5?space=S-201', { waitUntil: 'networkidle2', timeout: 30000 })
  await new Promise(r => setTimeout(r, 900))
  const clicked = await page.evaluate(() => {
    ;[...document.querySelectorAll('button')].find(b => b.textContent.trim() === '按周期')?.click()
    return 'switched'
  })
  await new Promise(r => setTimeout(r, 500))
  const clicked2 = await page.evaluate(() => {
    const b = document.querySelector('.cd-slot') || [...document.querySelectorAll('.sacts button')].find(x => x.textContent.trim() === '编辑')
    b?.click()
    return b?.textContent.trim() || 'none'
  })
  await new Promise(r => setTimeout(r, 800))
  console.log('edit clicked:', clicked, clicked2)
  const dlg = await page.evaluate(() => {
    const d = document.querySelector('.el-drawer')
    if (!d) return null
    const labels = [...d.querySelectorAll('.er > label, .er label')].map(l => l.textContent.trim())
    const gap = d.querySelector('.er-gap')?.textContent.replace(/\s+/g, ' ').trim()
    const isLast = [...d.querySelectorAll('.edit-box > *')].slice(-3).map(x => x.className)
    return { labels, gap, tailOrder: isLast }
  })
  await page.screenshot({ path: '/tmp/v5-slot-drawer.png', fullPage: false })

  /* ③ 结果层缺口视图 */
  await page.keyboard.press('Escape')
  await new Promise(r => setTimeout(r, 400))
  await page.evaluate(() => [...document.querySelectorAll('.tabs button')].find(b => b.textContent.includes('轮与结果'))?.click())
  await new Promise(r => setTimeout(r, 600))
  await page.evaluate(() => [...document.querySelectorAll('.run-switch button')].find(x => x.textContent.trim() === '缺口')?.click())
  await new Promise(r => setTimeout(r, 700))
  await page.screenshot({ path: '/tmp/v5-gap-view2.png', fullPage: true })
  const gapView = await page.evaluate(() => ({
    note: document.querySelector('.gap-view-note')?.textContent.replace(/\s+/g, ' ').trim(),
    srcs: [...new Set([...document.querySelectorAll('.data-table .src-tag')].map(x => x.textContent.trim()))]
  }))

  console.log(JSON.stringify({ algo, dlg, gapView }, null, 2))
  console.log(errs.length ? 'ERRORS: ' + errs.join(' | ') : 'NO_ERRORS')
} finally { await browser.close() }
