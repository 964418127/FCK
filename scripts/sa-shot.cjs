/* 薪酬咨询助手原型 · 四页签截图验证（puppeteer-core + 系统 Chrome） */
const puppeteer = require('puppeteer-core')
const path = require('path')

const OUT = path.join(__dirname, '..', '.workbuddy', 'shots-salary-agent')

async function findChrome () {
  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
  ]
  const fs = require('fs')
  for (const c of candidates) if (fs.existsSync(c)) return c
  throw new Error('no chrome found')
}

async function main () {
  const fs = require('fs')
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await puppeteer.launch({
    executablePath: await findChrome(),
    headless: 'new',
    args: ['--no-sandbox', '--window-size=430,900']
  })
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) })

  const shots = [
    { name: 'chat-welcome', url: 'http://localhost:5199/mobile-salary-agent', w: 430, h: 900 },
    { name: 'tickets-blue', url: 'http://localhost:5199/mobile-salary-agent/tickets', w: 430, h: 900 },
    { name: 'hr-queue', url: 'http://localhost:5199/mobile-salary-agent/hr', w: 430, h: 900 },
    { name: 'pc-list', url: 'http://localhost:5199/salary-agent-tickets', w: 1440, h: 900 }
  ]

  for (const s of shots) {
    await page.setViewport({ width: s.w, height: s.h })
    await page.goto(s.url, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await new Promise(r => setTimeout(r, 2500))
    await page.screenshot({ path: path.join(OUT, `${s.name}.png`) })
    const text = await page.evaluate(() => document.body.innerText.slice(0, 300))
    console.log(`\n=== ${s.name} ===\n${text.replace(/\n+/g, ' | ').slice(0, 260)}`)
  }

  console.log('\nerrors:', errors.length ? errors.join('\n') : 'none')
  await browser.close()
}

main().catch(e => { console.error(e); process.exit(1) })
