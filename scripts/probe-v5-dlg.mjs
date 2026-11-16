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
  await page.setViewport({ width: 1500, height: 1100, deviceScaleFactor: 1 })
  await page.goto('http://localhost:5173/schedule-v5?space=S-201', { waitUntil: 'networkidle2', timeout: 30000 })
  await new Promise(r => setTimeout(r, 900))
  await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.textContent.trim() === '按班次')?.click())
  await new Promise(r => setTimeout(r, 600))
  const btns = await page.evaluate(() => [...new Set([...document.querySelectorAll('button')].map(b => b.textContent.trim()).filter(t => t && t.length < 10))])
  await page.evaluate(() => {
    const cand = [...document.querySelectorAll('button')].find(b => ['改', '编辑'].includes(b.textContent.trim()))
    cand?.click()
  })
  await new Promise(r => setTimeout(r, 800))
  const dlg = await page.evaluate(() => [...document.querySelectorAll('.er')].map(x => x.textContent.replace(/\s+/g, ' ').trim()))
  await page.screenshot({ path: '/tmp/v5-slot-dlg3.png', fullPage: false })
  console.log('按钮:', JSON.stringify(btns))
  console.log(JSON.stringify(dlg, null, 2))
  console.log(errs.length ? 'ERRORS: ' + errs.join(' | ') : 'NO_ERRORS')
} finally { await browser.close() }
