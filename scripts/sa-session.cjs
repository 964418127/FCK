/* 薪酬咨询助手 · 会话生命周期交互验证（历史全已结束 / 继续对话更新状态 / 功能区） */
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

  // 1) 打开恢复进行中会话 C-001，且当前对话不显示状态标签
  let t = await text()
  console.log('恢复进行中会话:', t.includes('客次提成不对'))
  console.log('当前无「咨询进行中」标签:', !t.includes('咨询进行中'))
  console.log('页头无历史/工单按钮:', (await page.$$('.page-header .hdr-link')).length === 0)
  await page.screenshot({ path: path.join(OUT, 'session-chat-dock.png') })

  // 2) 底部功能区：历史 / 我的工单 / 新建对话三个入口
  console.log('功能区三入口:', (await page.$$('.dock-tool')).length === 3 && /历史记录/.test(t) && /我的工单/.test(t) && /新建对话/.test(t))

  // 3) 历史页：只有已结束会话（C-001 进行中不进历史）
  await clickByText('.dock-tool', '历史记录')
  await wait()
  t = await text()
  console.log('历史页只有已结束 C-002:', t.includes('C-002') && !t.includes('C-001'))
  console.log('历史项无「进行中」标签:', !t.includes('进行中'))
  await page.screenshot({ path: path.join(OUT, 'session-history.png') })

  // 4) 演示 +24h：C-001 到期，进入历史
  await clickByText('.db-btn', '+24 小时')
  t = await text()
  console.log('+24h 后 C-001 进入历史:', t.includes('C-001'))
  await page.screenshot({ path: path.join(OUT, 'session-history-24h.png') })

  // 5) 点开 C-001 = 查看记录（只读）：无选项、有「继续对话」主按钮、顶部历史提示
  await clickByText('.session-card', 'C-001')
  await wait()
  t = await text()
  console.log('查看历史记录只读:', t.includes('历史记录') && (await page.$$('.opt-btn')).length === 0)
  console.log('底部有「继续对话」:', (await page.$$('.dock-primary')).length === 1 && t.includes('继续对话'))
  await page.screenshot({ path: path.join(OUT, 'session-view-history.png') })

  // 6) 点「继续对话」→ 状态更新为进行中，可继续推进，主按钮消失
  await clickByText('.dock-primary', '继续对话')
  await wait()
  t = await text()
  console.log('继续对话后可推进:', (await page.$$('.opt-btn')).length > 0)
  console.log('继续对话后主按钮消失:', (await page.$$('.dock-primary')).length === 0)
  console.log('继续对话后无状态标签:', await page.evaluate(() => !document.querySelector('.history-view-tip')))
  await page.screenshot({ path: path.join(OUT, 'session-continued.png') })

  console.log('errors:', errors.length ? errors.join('\n') : 'none')
  await browser.close()
}

main().catch(e => { console.error(e); process.exit(1) })
