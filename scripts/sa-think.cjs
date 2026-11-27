/* 薪酬咨询助手 · 思考态 + 文案润色 + 演示身份收口 专项验证 */
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
  const wait = (ms) => new Promise(r => setTimeout(r, ms))

  await page.goto('http://localhost:5199/mobile-salary-agent', { waitUntil: 'domcontentloaded' })
  await wait(1200)

  // 新建对话回欢迎态
  await page.click('.cp-plus'); await wait(300)
  await page.evaluate(() => [...document.querySelectorAll('.ts-item')].find(e => e.innerText.includes('新建对话')).click())
  await wait(500)

  // 输入问题并发送
  await page.evaluate(() => {
    const input = document.querySelector('.cp-input')
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    setter.call(input, '查一下我的客次提成')
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await page.click('.cp-send')

  // 发出瞬间：思考气泡出现、真正答复尚未出现
  await wait(150)
  const during = await page.evaluate(() => ({
    thinking: !!document.querySelector('.thinking-bubble'),
    thinkingText: document.body.innerText.includes('正在查询'),
    answerYet: document.body.innerText.includes('查到了')
  }))
  console.log('发出后显示思考气泡:', during.thinking && during.thinkingText)
  console.log('思考期间答案未提前出现:', !during.answerYet)
  await page.screenshot({ path: path.join(OUT, 'thinking-state.png') })

  // 700ms 后：思考气泡消失、答复出现
  await wait(900)
  const after = await page.evaluate(() => ({
    thinking: !!document.querySelector('.thinking-bubble'),
    answer: document.body.innerText.includes('查到了'),
    // 求证链卡已润色为员工语言，不再出现内部方法名
    oldWords: /业务事实|规则命中|计算还原|结论判定/.test(document.body.innerText),
    newWords: /你这段时间的接待|按什么标准算|算下来|和工资条对得上/.test(document.body.innerText)
  }))
  console.log('思考结束后答复出现:', after.answer && !after.thinking)
  console.log('求证卡无内部思考链词:', !after.oldWords)
  console.log('求证卡是员工语言:', after.newWords)
  await page.screenshot({ path: path.join(OUT, 'verify-rewritten.png') })

  // 我的工单：页头常驻低调切换器（与排班 v5 同款，不靠 ?dev=1 隐藏）
  await page.goto('http://localhost:5199/mobile-salary-agent/tickets', { waitUntil: 'domcontentloaded' })
  await wait(1000)
  console.log('页头有低调切换器:', (await page.$$('.ps-trigger')).length === 1)
  const trigText = await page.$eval('.ps-trigger', el => el.innerText.trim())
  console.log('切换器显示当前姓名:', trigText.length > 0 && trigText.length <= 8)
  await page.screenshot({ path: path.join(OUT, 'tickets-persona.png') })

  // 点开下拉浮层：搜索框 + 人员列表（带工单数演示看点）
  await page.click('.ps-trigger')
  await wait(400)
  const pop = await page.evaluate(() => ({
    pop: !!document.querySelector('.ps-pop'),
    rows: document.querySelectorAll('.ps-row').length,
    search: !!document.querySelector('.ps-q'),
    tip: document.querySelector('.ps-trigger')?.title || ''
  }))
  console.log('下拉浮层展开:', pop.pop, '| 人员行数:', pop.rows, '| 搜索框:', pop.search)
  console.log('title 标注演示用:', /演示/.test(pop.tip))
  await page.screenshot({ path: path.join(OUT, 'tickets-persona-pop.png') })

  console.log('errors:', errors.length ? errors.join('\n') : 'none')
  await browser.close()
}

main().catch(e => { console.error(e); process.exit(1) })
