/* 临时探针：移动端集合提交（勾选 → 一次提交；没选不许提交） */
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
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 })
  await page.goto('http://localhost:5173/v5/m?tab=pick&as=E-213&date=2026-11-19', { waitUntil: 'networkidle2', timeout: 30000 })
  await new Promise(r => setTimeout(r, 1500))
  await page.screenshot({ path: '/tmp/v5m-basket-empty.png', fullPage: true })

  // 空选时提交按钮必须是禁用态
  const empty = await page.evaluate(() => {
    const b = document.querySelector('.bb-submit')
    return { text: b?.textContent.trim(), disabled: b?.disabled, hint: document.querySelector('.bb-info span')?.textContent.trim() }
  })

  // 勾一条 B 类（常规）
  await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.offer-card')]
    const b = cards.find(c => c.textContent.includes('常规')) || cards[0]
    ;[...b.querySelectorAll('button')].find(x => x.textContent.includes('选这条'))?.click()
  })
  await new Promise(r => setTimeout(r, 600))
  await page.screenshot({ path: '/tmp/v5m-basket-one.png', fullPage: true })
  const one = await page.evaluate(() => {
    const b = document.querySelector('.bb-submit')
    return { text: b?.textContent.trim(), disabled: b?.disabled, info: document.querySelector('.bb-info b')?.textContent.trim(), hint: document.querySelector('.bb-info span')?.textContent.trim() }
  })

  // 再勾一条 A 类（早班）
  await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.offer-card')]
    const a = cards.find(c => c.textContent.includes('早班'))
    ;[...(a || document.createElement('div')).querySelectorAll('button')].find(x => x.textContent.includes('选这条'))?.click()
  })
  await new Promise(r => setTimeout(r, 600))
  await page.screenshot({ path: '/tmp/v5m-basket-two.png', fullPage: true })
  const two = await page.evaluate(() => {
    const b = document.querySelector('.bb-submit')
    return { text: b?.textContent.trim(), disabled: b?.disabled, info: document.querySelector('.bb-info b')?.textContent.trim(), hint: document.querySelector('.bb-info span')?.textContent.trim() }
  })

  // 提交
  await page.evaluate(() => document.querySelector('.bb-submit')?.click())
  await new Promise(r => setTimeout(r, 900))
  await page.screenshot({ path: '/tmp/v5m-basket-done.png', fullPage: true })
  const after = await page.evaluate(() => ({
    msg: document.querySelector('.el-message')?.textContent.trim(),
    info: document.querySelector('.bb-info b')?.textContent.trim(),
    meter: [...document.querySelectorAll('.cm-line')].map(x => x.textContent.trim())
  }))

  console.log(JSON.stringify({ empty, one, two, after }, null, 2))
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'NO_ERRORS')
} finally {
  await browser.close()
}
