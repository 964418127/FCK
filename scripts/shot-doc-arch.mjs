import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new', args: ['--no-sandbox']
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 1100 })
await page.goto('http://localhost:5200/docs/hr-schedule/scope', { waitUntil: 'networkidle2' })
await new Promise((r) => setTimeout(r, 1200))
const found = await page.evaluate(() => {
  const h = [...document.querySelectorAll('h4')].find((x) => x.textContent.includes('准确形态'))
  if (!h) return 'not found'
  h.scrollIntoView({ block: 'start' })
  window.scrollBy(0, -40)
  return h.textContent.trim()
})
await new Promise((r) => setTimeout(r, 500))
await page.screenshot({ path: '/tmp/doc-arch.png' })
console.log('heading:', found)
await browser.close()
