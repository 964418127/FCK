/* 探针：① 排班节奏发布/截止时刻改时间控件 ② 轮与结果视图按钮顺序（空间时间轴在前） */
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

  /* ① 排班节奏折叠条展开 → 两行时刻应为时间控件 */
  await page.goto('http://localhost:5173/schedule-v5?space=S-201', { waitUntil: 'networkidle2', timeout: 30000 })
  await new Promise(r => setTimeout(r, 1000))
  const rhythmOpened = await page.evaluate(() => {
    const bar = [...document.querySelectorAll('button, .fold-bar, .rh-fold, [class*="fold"], [class*="rhythm"] *')]
      .find(b => (b.textContent || '').includes('排班节奏'))
    bar?.click()
    return !!bar
  })
  await new Promise(r => setTimeout(r, 600))
  const rhythm = await page.evaluate(() => {
    const times = [...document.querySelectorAll('.el-time-select')].length
    const inputs = [...document.querySelectorAll('.rh-row .el-input__inner')].map(i => i.value)
    const label = document.querySelector('.rh-label, .rhythm-label')?.textContent.trim()
    return { rhythmOpened: document.body.innerHTML.includes('rh-row'), times, inputs, label }
  })
  await page.screenshot({ path: '/tmp/v5-rhythm.png', fullPage: false })

  /* ② 轮与结果：按钮顺序 */
  await page.evaluate(() => {
    ;[...document.querySelectorAll('.tabs button')].find(b => b.textContent.includes('轮与结果'))?.click()
  })
  await new Promise(r => setTimeout(r, 700))
  const switchOrder = await page.evaluate(() =>
    [...document.querySelectorAll('.run-switch button')].map(b => b.textContent.trim())
  )
  await page.screenshot({ path: '/tmp/v5-runview.png', fullPage: false })

  console.log('[probe] 节奏折叠条点击:', rhythmOpened, JSON.stringify(rhythm))
  console.log('[probe] 视图按钮顺序:', switchOrder.join(' → '))
  console.log('[probe] 页面错误:', errs.length ? errs.join(' / ') : '无')
} finally {
  await browser.close()
}
