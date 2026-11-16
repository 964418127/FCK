import puppeteer from 'puppeteer-core'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] })
const p = await b.newPage()
await p.setViewport({ width: 1440, height: 900 })
await p.goto('http://localhost:5173/schedule-v5?space=S-205&dev=1', { waitUntil: 'networkidle2' })
await sleep(1000)
/* 切到按班次视图再点编辑 */
await p.evaluate(() => {
  const sw = [...document.querySelectorAll('.cyc-switch button')].find(e => e.textContent.trim() === '按班次')
  if (sw) sw.click()
})
await sleep(500)
await p.evaluate(() => {
  const el = [...document.querySelectorAll('.slot-card .el-button')].find(e => e.textContent.trim() === '编辑')
  if (el) el.click()
})
await sleep(900)
const t1 = await p.evaluate(() => ({
  drawer: !!document.querySelector('.el-drawer'),
  open: !!document.querySelector('.el-drawer:not([style*="display: none"])'),
  title: document.querySelector('.el-drawer__title')?.textContent.trim(),
  formRows: document.querySelectorAll('.drawer-box .er').length,
  bodyLen: document.querySelector('.drawer-box')?.innerText.length || 0
}))
console.log('抽屉:', t1)
await p.screenshot({ path: '/tmp/v5-drawer.png' })
await p.keyboard.press('Escape')
await sleep(500)
await p.evaluate(() => {
  const el = [...document.querySelectorAll('button, .el-button')].find(e => e.textContent.trim() === '管理')
  if (el) el.click()
})
await sleep(700)
await p.screenshot({ path: '/tmp/v5-cat-dlg2.png' })
await b.close()
