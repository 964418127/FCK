/* 薪酬咨询助手 · 会话生命周期交互验证（输入框为主 / 历史全已结束 / 继续对话 / 演示辅具收进 ?dev=1） */
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
  const typeAndSend = async (t) => {
    await page.evaluate((v) => {
      const input = document.querySelector('.cp-input')
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
      setter.call(input, v)
      input.dispatchEvent(new Event('input', { bubbles: true }))
    }, t)
    await new Promise(r => setTimeout(r, 200))
    await page.click('.cp-send')
    await new Promise(r => setTimeout(r, 600))
  }
  const wait = (ms = 800) => new Promise(r => setTimeout(r, ms))

  await page.goto('http://localhost:5199/mobile-salary-agent', { waitUntil: 'domcontentloaded' })
  await wait(1200)

  // 1) 打开恢复进行中会话 C-001，当前对话不显示状态标签
  let t = await text()
  console.log('恢复进行中会话:', t.includes('客次提成不对'))
  console.log('当前无「咨询进行中」标签:', !t.includes('咨询进行中'))
  console.log('页头无历史/工单按钮:', (await page.$$('.page-header .hdr-link')).length === 0)

  // 2) 底部以输入框为主体：输入框 + 发送按钮在场，功能入口是 + 号
  console.log('输入框为主体:', (await page.$$('.cp-input')).length === 1 && (await page.$$('.cp-send')).length === 1)
  console.log('无「演示原型·点击选项推进」话术:', !t.includes('演示原型'))
  console.log('功能入口收进 + 号:', (await page.$$('.cp-plus')).length === 1 && (await page.$$('.dock-tool')).length === 0)
  await page.screenshot({ path: path.join(OUT, 'session-chat-dock.png') })

  // 3) 输入框真实发送：对话态输入自由文本，追加用户气泡 + 助手回应
  await typeAndSend('这个提成是怎么算的')
  t = await text()
  console.log('输入框发送产生用户气泡:', t.includes('这个提成是怎么算的'))
  await page.screenshot({ path: path.join(OUT, 'session-input-send.png') })

  // 4) + 号展开功能区：历史记录 / 我的工单 / 新建对话
  await page.click('.cp-plus')
  await wait(400)
  console.log('+ 号弹层三入口:', (await page.$$('.ts-item')).length === 3)
  await page.screenshot({ path: path.join(OUT, 'session-tools-sheet.png') })

  // 5) 历史页（正常员工侧无演示控件；?dev=1 才有推进控件）
  await clickByText('.ts-item', '历史记录')
  await wait()
  t = await text()
  console.log('历史页只有已结束 C-002:', t.includes('C-002') && !t.includes('C-001'))
  console.log('历史项无「进行中」标签:', !t.includes('进行中'))
  console.log('正常侧无演示控件:', (await page.$$('.demo-bar')).length === 0)
  await page.screenshot({ path: path.join(OUT, 'session-history.png') })

  // 6) ?dev=1 历史页：推进时间展示 24h 自动结束
  await page.goto('http://localhost:5199/mobile-salary-agent/history?dev=1', { waitUntil: 'domcontentloaded' })
  await wait(1000)
  console.log('?dev=1 显示演示控件:', (await page.$$('.demo-bar')).length === 1)
  await clickByText('.db-btn', '+24 小时')
  t = await text()
  console.log('+24h 后 C-001 进入历史:', t.includes('C-001'))
  await page.screenshot({ path: path.join(OUT, 'session-history-24h.png') })

  // 7) 点开 C-001 = 查看记录（只读）：无选项、有「继续对话」主按钮、顶部历史提示
  await clickByText('.session-card', 'C-001')
  await wait()
  t = await text()
  console.log('查看历史记录只读:', t.includes('历史记录') && (await page.$$('.opt-btn')).length === 0)
  console.log('底部有「继续对话」:', (await page.$$('.composer-continue')).length === 1 && t.includes('继续对话'))
  await page.screenshot({ path: path.join(OUT, 'session-view-history.png') })

  // 8) 点「继续对话」→ 状态更新，可继续推进，主按钮消失，无状态标签
  await clickByText('.composer-continue', '继续对话')
  await wait()
  console.log('继续对话后可推进:', (await page.$$('.opt-btn')).length > 0)
  console.log('继续对话后主按钮消失:', (await page.$$('.composer-continue')).length === 0)
  console.log('继续对话后无状态标签:', await page.evaluate(() => !document.querySelector('.history-view-tip')))
  await page.screenshot({ path: path.join(OUT, 'session-continued.png') })

  console.log('errors:', errors.length ? errors.join('\n') : 'none')
  await browser.close()
}

main().catch(e => { console.error(e); process.exit(1) })
