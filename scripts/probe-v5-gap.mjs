/* 探针：缺口规则页（只有规则）+ 结果层的缺口视图 + 试算弹层 + 临时班次抽屉 */
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
  await page.setViewport({ width: 1500, height: 1100, deviceScaleFactor: 1 })

  /* ① 缺口规则页：只应有一张规则表 */
  await page.goto('http://localhost:5173/schedule-v5?space=S-201&main=gap', { waitUntil: 'networkidle2', timeout: 30000 })
  await new Promise(r => setTimeout(r, 1000))
  await page.screenshot({ path: '/tmp/v5-gaprule.png', fullPage: true })
  const rulePage = await page.evaluate(() => ({
    tables: document.querySelectorAll('.data-table').length,
    rows: [...document.querySelectorAll('.data-table tbody tr')].map(tr => [...tr.querySelectorAll('td')].map(td => td.textContent.replace(/\s+/g, ' ').trim()).join(' | ')),
    hasGapList: !!document.body.textContent.includes('缺口清单'),
    hasTrial: !!document.body.textContent.includes('试算')
  }))

  /* ② 结果层：切到「缺口」*/
  await page.goto('http://localhost:5173/schedule-v5?space=S-201', { waitUntil: 'networkidle2', timeout: 30000 })
  await new Promise(r => setTimeout(r, 900))
  await page.evaluate(() => {
    ;[...document.querySelectorAll('.tabs button')].find(b => b.textContent.includes('轮与结果'))?.click()
  })
  await new Promise(r => setTimeout(r, 700))
  const switched = await page.evaluate(() => {
    const b = [...document.querySelectorAll('.run-switch button')].find(x => x.textContent.trim() === '缺口')
    b?.click()
    return !!b
  })
  await new Promise(r => setTimeout(r, 800))
  await page.screenshot({ path: '/tmp/v5-gap-view.png', fullPage: true })
  const gapView = await page.evaluate(() => ({
    rows: [...document.querySelectorAll('.data-table tbody tr')].slice(0, 8).map(tr => [...tr.querySelectorAll('td')].map(td => td.textContent.replace(/\s+/g, ' ').trim()).join(' | ')),
    hint: document.querySelector('.rs-hint')?.textContent.trim()
  }))

  /* ③ 点第一行 → 试算弹层 */
  await page.evaluate(() => document.querySelector('.data-table tbody tr.pointable')?.click())
  await new Promise(r => setTimeout(r, 900))
  await page.screenshot({ path: '/tmp/v5-trial.png' })
  const trial = await page.evaluate(() => ({
    title: document.querySelector('.el-dialog__title')?.textContent.trim(),
    cards: [...document.querySelectorAll('.gt-card')].map(c => c.textContent.replace(/\s+/g, ' ').trim())
  }))
  await page.keyboard.press('Escape')
  await new Promise(r => setTimeout(r, 400))

  /* ④ 临时班次抽屉 */
  await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.textContent.includes('临时班次'))?.click())
  await new Promise(r => setTimeout(r, 900))
  const drawers = await page.evaluate(() => [...document.querySelectorAll('.el-drawer')].map(d => d.textContent.replace(/\s+/g, ' ').trim().slice(0, 200)))
  await page.screenshot({ path: '/tmp/v5-temp-drawer.png' })

  console.log(JSON.stringify({ rulePage, switched, gapView, trial, drawers }, null, 2))
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'NO_ERRORS')
} finally {
  await browser.close()
}
