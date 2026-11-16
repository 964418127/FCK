import puppeteer from 'puppeteer-core'

const sleep = ms => new Promise(r => setTimeout(r, ms))
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage()
await p.setViewport({ width: 1440, height: 1000 })
await p.goto('http://localhost:5173/schedule-v5?sub=rule&dev=1', { waitUntil: 'networkidle2' })
await sleep(1200)
await p.screenshot({ path: '/tmp/v5-cat-rule.png', fullPage: true })
/* 打开管理类别 */
const opened = await p.evaluate(() => {
  const el = [...document.querySelectorAll('button, span, .el-button')].find(e => e.textContent.trim() === '管理类别')
  if (!el) return false
  el.click(); return true
})
await sleep(800)
if (opened) await p.screenshot({ path: '/tmp/v5-cat-dlg.png' })
/* 时段列表页有没有类别维护入口 */
await p.goto('http://localhost:5173/schedule-v5?space=S-205&dev=1', { waitUntil: 'networkidle2' })
await sleep(1000)
const txt = await p.evaluate(() => {
  const t = document.body.innerText
  return { hasCat: t.includes('类别'), hasManage: t.includes('管理类别') }
})
console.log('opened dialog:', opened, txt)
await p.screenshot({ path: '/tmp/v5-cat-slot.png', fullPage: true })
await b.close()
