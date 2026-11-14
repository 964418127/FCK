import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new', args: ['--no-sandbox']
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 1100 })
await page.goto('http://localhost:5200/docs/hr-schedule/scope', { waitUntil: 'networkidle2' })
await new Promise((r) => setTimeout(r, 1200))
for (const [key, kw, path] of [
  ['intercept', '拿的时候拦什么', '/tmp/doc-v35-1.png'],
  ['fact', '资格变化', '/tmp/doc-v35-2.png']
]) {
  await page.evaluate((k) => {
    const h = k === 'intercept'
      ? [...document.querySelectorAll('h4')].find((x) => x.textContent.includes('拿的时候拦什么'))
      : [...document.querySelectorAll('td strong')].find((x) => x.textContent.includes('资格变化'))
    if (h) { h.scrollIntoView({ block: 'center' }) }
  }, key)
  await new Promise((r) => setTimeout(r, 400))
  await page.screenshot({ path })
}
console.log('ok')
await browser.close()
