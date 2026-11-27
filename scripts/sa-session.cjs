/* 薪酬咨询助手 · 会话生命周期交互验证 */
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

  const text = () => page.evaluate(() => document.body.innerText)
  const clickByText = async (sel, t) => {
    const ok = await page.evaluate((sel, t) => {
      const el = [...document.querySelectorAll(sel)].find(e => e.innerText.includes(t))
      if (el) { el.click(); return true }
      return false
    }, sel, t)
    if (!ok) throw new Error(`not found: ${t}`)
    await new Promise(r => setTimeout(r, 500))
  }
  const wait = (ms = 800) => new Promise(r => setTimeout(r, ms))

  await page.goto('http://localhost:5199/mobile-salary-agent', { waitUntil: 'domcontentloaded' })
  await wait(1200)

  // 1) 打开恢复最近进行中会话：C-001 归因节点，带状态条
  let t = await text()
  console.log('打开恢复进行中会话:', t.includes('客次提成不对') && t.includes('咨询进行中'))
  await page.screenshot({ path: path.join(OUT, 'session-resume.png') })

  // 2) 随时新建对话：不必走完流程即可回欢迎态
  await clickByText('.sb-new', '新建对话')
  t = await text()
  console.log('新建对话回欢迎态:', t.includes('你好，我是薪酬咨询助手'))

  // 3) 历史页：两条种子会话，一进行中一已结束
  await clickByText('.hdr-link.ghost', '历史')
  await wait()
  t = await text()
  console.log('历史页两条会话:', (t.match(/C-00[12]/g) || []).length >= 2)
  console.log('初始状态 进行中+已结束:', t.includes('进行中') && t.includes('已结束'))
  await page.screenshot({ path: path.join(OUT, 'session-history.png') })

  // 4) 演示时间 +24h：进行中会话自动结束
  await clickByText('.db-btn', '+24 小时')
  t = await text()
  console.log('+24h 后 C-001 已结束:', /C-001[\s\S]{0,120}已结束/.test(t))
  await page.screenshot({ path: path.join(OUT, 'session-history-24h.png') })

  // 5) 从历史加载已结束会话：只读、无选项、提示去新建
  await clickByText('.session-card', 'C-001')
  await wait()
  t = await text()
  console.log('加载已结束会话:', t.includes('该咨询已结束') && t.includes('客次提成不对'))
  console.log('已结束无选项按钮:', (await page.$$('.opt-btn')).length === 0)
  await page.screenshot({ path: path.join(OUT, 'session-ended-readonly.png') })

  // 6) 已结束会话里点新建对话回欢迎态
  await clickByText('.sb-new', '新建对话')
  t = await text()
  console.log('已结束态可新建对话:', t.includes('你好，我是薪酬咨询助手'))

  console.log('errors:', errors.length ? errors.join('\n') : 'none')
  await browser.close()
}

main().catch(e => { console.error(e); process.exit(1) })
