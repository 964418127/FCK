/* 常乐豆脚本专项验证：查完即结论，无解释入口、无围墙词汇 */
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

  await clickByText('.chips button', '常乐豆')
  const text = await page.evaluate(() => document.body.innerText)
  console.log('三数齐全:', /本月结算/.test(text) && /可用余额/.test(text) && /提现冻结/.test(text))
  console.log('无围墙词汇:', !/明细|不在解答范围|构成|规则/.test(text))
  const opts = await page.evaluate(() => [...document.querySelectorAll('.opt-btn')].map(e => e.innerText.trim()))
  console.log('唯一选项为「好的」:', JSON.stringify(opts))
  await page.screenshot({ path: '.workbuddy/shots-salary-agent/bean-final.png' })
  await browser.close()
}

main().catch(e => { console.error(e); process.exit(1) })
