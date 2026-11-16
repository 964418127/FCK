/* 临时探针：缺口规则页签（规则切换 + 缺口清单 + 试算） */
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
  await page.goto('http://localhost:5173/schedule-v5?space=S-201', { waitUntil: 'networkidle2', timeout: 30000 })
  await new Promise(r => setTimeout(r, 1200))
  /* 切到缺口规则页签 */
  await page.evaluate(() => {
    ;[...document.querySelectorAll('.tabs button')].find(b => b.textContent.includes('缺口规则'))?.click()
  })
  await new Promise(r => setTimeout(r, 700))
  await page.screenshot({ path: '/tmp/v5-gap-1.png', fullPage: true })

  const first = await page.evaluate(() => ({
    rules: [...document.querySelectorAll('.gp-rule')].map(x => x.querySelector('.gr-top')?.textContent.replace(/\s+/g, ' ').trim()),
    onRule: document.querySelector('.gp-rule.on .gr-top')?.textContent.replace(/\s+/g, ' ').trim(),
    rows: [...document.querySelectorAll('.gp-trial')].length,
    gaps: [...document.querySelectorAll('tbody tr')].slice(0, 6).map(tr => [...tr.querySelectorAll('td')].map(td => td.textContent.replace(/\s+/g, ' ').trim()).join(' | ')),
    trial: [...document.querySelectorAll('.gt-card')].map(c => c.textContent.replace(/\s+/g, ' ').trim())
  }))

  /* 切到 G2，并把假定此刻拨到「不足 1 小时」 */
  await page.evaluate(() => {
    ;[...document.querySelectorAll('.gp-rule')].find(x => x.textContent.includes('G2'))?.click()
  })
  await new Promise(r => setTimeout(r, 500))
  await page.evaluate(() => {
    ;[...document.querySelectorAll('.mini-pills button')].find(b => b.textContent.includes('不足 1 小时'))?.click()
  })
  await new Promise(r => setTimeout(r, 600))
  await page.screenshot({ path: '/tmp/v5-gap-2.png', fullPage: true })
  const second = await page.evaluate(() => ({
    onRule: document.querySelector('.gp-rule.on .gr-top')?.textContent.replace(/\s+/g, ' ').trim(),
    verdicts: [...document.querySelectorAll('tbody tr')].slice(0, 4).map(tr => tr.querySelector('.vd')?.textContent.trim() + ' / ' + tr.querySelector('.vd-why')?.textContent.trim()),
    trial: [...document.querySelectorAll('.gt-card')].map(c => c.textContent.replace(/\s+/g, ' ').trim())
  }))

  /* 切到 G3，把预测值调低 */
  await page.evaluate(() => {
    ;[...document.querySelectorAll('.gp-rule')].find(x => x.textContent.includes('G3'))?.click()
  })
  await new Promise(r => setTimeout(r, 500))
  await page.evaluate(() => {
    const input = document.querySelector('.gt-left .el-input-number input')
    if (input) {
      input.focus()
      input.value = '1'
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.blur()
    }
  })
  await new Promise(r => setTimeout(r, 700))
  await page.screenshot({ path: '/tmp/v5-gap-3.png', fullPage: true })
  const third = await page.evaluate(() => ({
    trial: [...document.querySelectorAll('.gt-card')].map(c => c.textContent.replace(/\s+/g, ' ').trim())
  }))

  console.log(JSON.stringify({ first, second, third }, null, 2))
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'NO_ERRORS')
} finally {
  await browser.close()
}
