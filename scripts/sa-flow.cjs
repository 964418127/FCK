/* 薪酬咨询助手 · 成单链路交互验证 */
const puppeteer = require('puppeteer-core')
const path = require('path')
const fs = require('fs')

const OUT = path.join(__dirname, '..', '.workbuddy', 'shots-salary-agent')

async function findChrome () {
  for (const c of ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge']) {
    if (fs.existsSync(c)) return c
  }
  throw new Error('no chrome found')
}

async function main () {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await puppeteer.launch({ executablePath: await findChrome(), headless: 'new', args: ['--no-sandbox'] })
  const page = await browser.newPage()
  await page.setViewport({ width: 430, height: 900 })
  const errors = []
  page.on('pageerror', e => errors.push(e.message))

  await page.goto('http://localhost:5199/mobile-salary-agent', { waitUntil: 'domcontentloaded' })
  await new Promise(r => setTimeout(r, 2000))

  const clickByText = async (sel, text) => {
    const ok = await page.evaluate((sel, text) => {
      const els = [...document.querySelectorAll(sel)]
      const el = els.find(e => e.innerText.includes(text))
      if (el) { el.click(); return true }
      return false
    }, sel, text)
    if (!ok) throw new Error(`not found: ${text}`)
    await new Promise(r => setTimeout(r, 500))
  }

  // 打开会恢复最近进行中的历史会话，先新建对话回到欢迎态
  await clickByText('.sb-new', '新建对话')
  await clickByText('.chips button', '客次提成')
  await clickByText('.opt-btn', '客次提成不对')
  await clickByText('.opt-btn', '金额算错了')
  await clickByText('.opt-btn', '11 月 1 日')
  await clickByText('.opt-btn', '700 元')
  await clickByText('.opt-btn', '11-12 我接待了 5 单')
  await clickByText('.opt-btn', '到店后取消')
  await clickByText('.opt-btn', '12.5 元怎么办')
  await page.screenshot({ path: path.join(OUT, 'flow-confirm.png') })
  await clickByText('.opt-btn', '确认，提交工单')
  await new Promise(r => setTimeout(r, 500))
  await page.screenshot({ path: path.join(OUT, 'flow-sheet.png') })
  await clickByText('.act-btn.primary', '确认提交')
  await new Promise(r => setTimeout(r, 600))
  await page.screenshot({ path: path.join(OUT, 'flow-done.png') })

  const afterChat = await page.evaluate(() => document.body.innerText)
  console.log('成单消息出现:', /工单已提交/.test(afterChat))
  console.log('气泡含偏差 12.5:', /587\.5/.test(afterChat))

  // SPA 内路由跳转（store 单例不重置）：点击成单消息里的「查看我的工单」
  await clickByText('.ticket-link', '查看我的工单')
  await new Promise(r => setTimeout(r, 800))
  const t1 = await page.evaluate(() => document.body.innerText)
  console.log('我的工单额度 1/2:', /1\s*\/2/.test(t1))
  console.log('新工单 SA-202611-03 出现:', t1.includes('SA-202611-03'))
  await page.screenshot({ path: path.join(OUT, 'flow-tickets.png') })

  // SPA 内跳人事页：返回菜单 → 点「薪酬工单处理」
  await page.evaluate(() => document.querySelector('.back-icon').click())
  await new Promise(r => setTimeout(r, 800))
  await clickByText('.grid-item', '薪酬工单处理')
  await new Promise(r => setTimeout(r, 800))
  await clickByText('.ticket-card', '客次提成')
  await new Promise(r => setTimeout(r, 500))
  await clickByText('.act-btn.primary', '接单处理')
  await new Promise(r => setTimeout(r, 500))
  await page.evaluate(() => {
    const ta = document.querySelector('.reply-input')
    ta.value = '经复核确认少算 12.5 元，已转薪酬侧随下周工资单补差。本答复即工单最终结论。'
    ta.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await new Promise(r => setTimeout(r, 300))
  await clickByText('.act-btn.primary', '答复并结案')
  await new Promise(r => setTimeout(r, 600))
  const hrText = await page.evaluate(() => document.body.innerText)
  console.log('人事侧结案计数 3:', /已结案/.test(hrText))
  await page.screenshot({ path: path.join(OUT, 'flow-hr-closed.png') })
  await page.evaluate(() => { document.querySelector('.sheet-mask') && [...document.querySelectorAll('.sheet-mask')].forEach(m => m.click()) })

  console.log('errors:', errors.length ? errors.join('\n') : 'none')
  await browser.close()
}

main().catch(e => { console.error(e); process.exit(1) })
