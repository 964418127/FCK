/* 临时探针：换班 = 事件占住时段（占位行不搬人）——移动端换出/换入两张卡 + web 结果表履约人 */
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
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()) })
  await page.setViewport({ width: 390, height: 900, deviceScaleFactor: 2 })
  await page.goto('http://localhost:5173/v5/m?as=E-206', { waitUntil: 'networkidle2', timeout: 30000 })
  await new Promise(r => setTimeout(r, 1200))
  await page.screenshot({ path: '/tmp/v5m-swap-before.png', fullPage: true })

  /* 同意换班 */
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes('同意换班'))
    b?.click()
  })
  await new Promise(r => setTimeout(r, 900))
  /* 切到换出去的那天（11-17）看「已换给谁」 */
  await page.evaluate(() => {
    const cells = [...document.querySelectorAll('.mc-day, td, .cal-cell, button, span, div')]
    const hit = cells.find(el => el.textContent.trim() === '17')
    hit?.click()
  })
  await new Promise(r => setTimeout(r, 700))
  await page.screenshot({ path: '/tmp/v5m-swap-after.png', fullPage: true })
  const mine = await page.evaluate(() => [...document.querySelectorAll('.res-card')].map(c => c.textContent.replace(/\s+/g, ' ').trim()))
  const ov = await page.evaluate(() => [...document.querySelectorAll('.ov-item')].map(x => x.textContent.replace(/\s+/g, '').trim()))

  /* web 结果表：履约人那一栏 */
  const p2 = await browser.newPage()
  const errs2 = []
  p2.on('pageerror', e => errs2.push('pageerror: ' + e.message))
  p2.on('console', m => { if (m.type() === 'error') errs2.push('console: ' + m.text()) })
  await p2.setViewport({ width: 1560, height: 940, deviceScaleFactor: 2 })
  await p2.goto('http://localhost:5173/schedule-v5?space=S-205&sub=round', { waitUntil: 'networkidle2', timeout: 30000 })
  await new Promise(r => setTimeout(r, 1500))
  await p2.screenshot({ path: '/tmp/v5-web-swap.png', fullPage: false })
  const dutyRows = await p2.evaluate(() => [...document.querySelectorAll('.duty-note')].map(x => x.parentElement.textContent.replace(/\s+/g, ' ').trim()))

  console.log(JSON.stringify({ ov, mine, dutyRows }, null, 2))
  console.log([...errs, ...errs2].length ? 'ERRORS:\n' + [...errs, ...errs2].join('\n') : 'NO_ERRORS')
} finally {
  await browser.close()
}
