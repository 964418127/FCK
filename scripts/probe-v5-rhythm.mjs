import puppeteer from 'puppeteer-core'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage()
await p.setViewport({ width: 1440, height: 700 })
await p.goto('http://localhost:5173/schedule-v5?space=S-205&dev=1', { waitUntil: 'networkidle2' })
await sleep(1000)
const bar = await p.evaluate(() => {
  const el = document.querySelector('.rhythm')
  const r = el?.getBoundingClientRect()
  return r ? { top: Math.round(r.top), h: Math.round(r.height), text: el.innerText.replace(/\n/g, ' | ').slice(0, 80) } : null
})
console.log(bar)
await p.screenshot({ path: '/tmp/v5-rhythm.png' })
await b.close()
