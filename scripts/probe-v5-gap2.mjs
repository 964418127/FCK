/* 探针二：缺口规则页（瘦身复核）+ 临时班次抽屉的缺口规则行 */
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

  await page.goto('http://localhost:5173/schedule-v5?space=S-201&main=gap', { waitUntil: 'networkidle2', timeout: 30000 })
  await new Promise(r => setTimeout(r, 1000))
  await page.screenshot({ path: '/tmp/v5-gaprule2.png', fullPage: true })
  const rulePage = await page.evaluate(() => [...document.querySelectorAll('.data-table tbody tr')].map(tr => [...tr.querySelectorAll('td')].map(td => td.textContent.replace(/\s+/g, ' ').trim()).join(' | ')))

  /* 临时班次抽屉 */
  await page.goto('http://localhost:5173/schedule-v5?space=S-201&sub=tmp', { waitUntil: 'networkidle2', timeout: 30000 })
  await new Promise(r => setTimeout(r, 900))
  await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.textContent.includes('新增临时班次'))?.click())
  await new Promise(r => setTimeout(r, 900))
  const drawer = await page.evaluate(() => [...document.querySelectorAll('.el-drawer')].map(d => [...d.querySelectorAll('.er')].map(x => x.textContent.replace(/\s+/g, ' ').trim())))
  await page.screenshot({ path: '/tmp/v5-temp-drawer.png' })

  console.log(JSON.stringify({ rulePage, drawer }, null, 2))
  console.log(errs.length ? 'ERRORS: ' + errs.join(' | ') : 'NO_ERRORS')
} finally { await browser.close() }
