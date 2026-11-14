import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new', args: ['--no-sandbox']
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 1150 })
await page.goto('http://localhost:5200/docs/hr-schedule/scope', { waitUntil: 'networkidle2' })
await new Promise((r) => setTimeout(r, 1200))
const found = await page.evaluate(() => {
  const h = [...document.querySelectorAll('h2')].find((x) => x.textContent.includes('名额从哪来'))
  if (!h) return 'not found'
  h.scrollIntoView({ block: 'start' })
  window.scrollBy(0, -50)
  return h.textContent.trim()
})
await new Promise((r) => setTimeout(r, 500))
await page.screenshot({ path: '/tmp/doc-quota1.png' })
await page.evaluate(() => window.scrollBy(0, 560))
await new Promise((r) => setTimeout(r, 400))
await page.screenshot({ path: '/tmp/doc-quota2.png' })
console.log('heading:', found)
await browser.close()
