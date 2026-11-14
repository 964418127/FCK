/* 临时探针：排班策略 v5 开放窗口抽象——按班次视图窗口列 + 编辑表单窗口编辑器 */
import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--window-size=1560,940']
})
try {
  const page = await browser.newPage()
  const errs = []
  page.on('pageerror', e => errs.push('pageerror: ' + e.message))
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()) })
  await page.setViewport({ width: 1560, height: 940, deviceScaleFactor: 2 })
  await page.goto('http://localhost:5200/schedule-v5', { waitUntil: 'networkidle2', timeout: 30000 })
  await new Promise(r => setTimeout(r, 1500))

  // 切到「按班次」视图
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button, .cyc-switch *')].find(el => el.textContent.trim() === '按班次')
    btn?.click()
  })
  await new Promise(r => setTimeout(r, 800))
  await page.screenshot({ path: '/tmp/v5-win-listview.png' })

  // 打开第一个班次的编辑表单
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(el => el.textContent.trim() === '编辑')
    btn?.click()
  })
  await new Promise(r => setTimeout(r, 800))
  await page.screenshot({ path: '/tmp/v5-win-edit.png' })

  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'NO_ERRORS')
} finally {
  await browser.close()
}
