import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new', args: ['--no-sandbox', '--disable-gpu']
})
try {
  const page = await browser.newPage()
  await page.setViewport({ width: 1500, height: 1000 })
  await page.goto('http://localhost:5173/schedule-v5?space=S-201', { waitUntil: 'networkidle2', timeout: 30000 })
  await new Promise(r => setTimeout(r, 900))
  const btns = await page.evaluate(() => [...new Set([...document.querySelectorAll('.v5-main button')].map(b => b.textContent.trim()).filter(t => t && t.length < 14))])
  console.log(JSON.stringify(btns))
} finally { await browser.close() }
