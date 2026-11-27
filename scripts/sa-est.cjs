/* 算薪前预估脚本专项验证：三要素 + 合规标注 + 与求证链衔接 */
const puppeteer = require('puppeteer-core')
const fs = require('fs')

async function findChrome () {
  for (const c of ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge']) {
    if (fs.existsSync(c)) return c
  }
  throw new Error('no chrome found')
}

async function main () {
  const browser = await puppeteer.launch({ executablePath: await findChrome(), headless: 'new', args: ['--no-sandbox'] })
  const page = await browser.newPage()
  await page.setViewport({ width: 430, height: 900 })
  await page.goto('http://localhost:5199/mobile-salary-agent', { waitUntil: 'domcontentloaded' })
  await new Promise(r => setTimeout(r, 2000))

  const clickByText = async (sel, text) => {
    const ok = await page.evaluate((sel, text) => {
      const el = [...document.querySelectorAll(sel)].find(e => e.innerText.includes(text))
      if (el) { el.click(); return true }
      return false
    }, sel, text)
    if (!ok) throw new Error(`not found: ${text}`)
    await new Promise(r => setTimeout(r, 500))
  }

  await clickByText('.chips button', '我这个月提成有多少了')
  const text1 = await page.evaluate(() => document.body.innerText)
  console.log('预估三要素（累计/单价/预估）:', /41 次/.test(text1) && /25 元\/客次/.test(text1) && /1025 元/.test(text1))
  console.log('结算为准标注在场:', /以工资结算为准/.test(text1))
  await page.screenshot({ path: '.workbuddy/shots-salary-agent/estimate.png' })

  await clickByText('.opt-btn', '差多少怎么办')
  const text2 = await page.evaluate(() => document.body.innerText)
  console.log('衔接求证链话术:', /发放后/.test(text2) && /查证/.test(text2))
  await page.screenshot({ path: '.workbuddy/shots-salary-agent/estimate-link.png' })
  await browser.close()
}

main().catch(e => { console.error(e); process.exit(1) })
