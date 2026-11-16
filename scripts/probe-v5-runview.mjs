/* 探针：轮与结果默认视图应为空间时间轴 */
import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars']
})
try {
  const page = await browser.newPage()
  await page.setViewport({ width: 1500, height: 1000, deviceScaleFactor: 1 })
  await page.goto('http://localhost:5173/schedule-v5?space=S-201', { waitUntil: 'networkidle2', timeout: 30000 })
  await new Promise(r => setTimeout(r, 1000))
  await page.evaluate(() => {
    ;[...document.querySelectorAll('.tabs button')].find(b => b.textContent.includes('轮与结果'))?.click()
  })
  await new Promise(r => setTimeout(r, 700))
  const info = await page.evaluate(() => {
    const on = [...document.querySelectorAll('.run-switch button')].find(b => b.classList.contains('on'))
    const hasAxis = !!document.querySelector('.ax-box')
    const hint = document.querySelector('.rs-hint')?.textContent.trim()
    return { default: on?.textContent.trim(), hasAxis, hint }
  })
  await page.screenshot({ path: '/tmp/v5-default-axis.png', fullPage: false })
  console.log('[probe] 默认选中:', info.default, '| 时间轴已渲染:', info.hasAxis, '| 提示:', info.hint)
} finally {
  await browser.close()
}
