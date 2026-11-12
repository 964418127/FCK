/**
 * 文档截图：支持点击 / 滚动后再截，用于截取「弹窗、终态、下半页」这类单次截图拿不到的画面。
 *
 * 用法：node pt-shot.mjs <url> <out.png> <宽> <高> '<actions-json>'
 *   actions: [{ "click": "编辑" }, { "clickSel": ".el-tabs__item:nth-child(2)" }, { "wait": 600 }, { "scrollTo": ".week-overview" }]
 *   click 精确匹配可见文本；clickSel 走 CSS 选择器（取第一个可见元素）
 */
import puppeteer from 'puppeteer-core'

const [, , url, out, w = '1440', h = '1000', rawActions = '[]'] = process.argv
if (!url || !out) {
  console.error('用法: node pt-shot.mjs <url> <out.png> [宽] [高] [actions-json]')
  process.exit(1)
}
const actions = JSON.parse(rawActions)
const sleep = ms => new Promise(r => setTimeout(r, ms))

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', `--window-size=${w},${h}`]
})

try {
  const page = await browser.newPage()
  await page.setViewport({ width: +w, height: +h, deviceScaleFactor: 2 })
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 }).catch(e => console.warn('[warn]', e.message))
  await sleep(1500)

  for (const act of actions) {
    if (act.wait) { await sleep(act.wait); continue }
    if (act.click) {
      const ok = await page.evaluate(text => {
        const nodes = [...document.querySelectorAll('button, .el-tabs__item, a, span, div, li')]
          .filter(n => n.offsetParent !== null && n.textContent.trim() === text)
        const hit = nodes[nodes.length - 1]
        if (!hit) return false
        hit.click()
        return true
      }, act.click)
      console.log('[click]', act.click, ok)
      await sleep(act.after ?? 700)
      continue
    }
    if (act.clickSel) {
      const ok = await page.evaluate(sel => {
        const el = [...document.querySelectorAll(sel)].find(n => n.offsetParent !== null)
        if (!el) return false
        el.click()
        return true
      }, act.clickSel)
      console.log('[clickSel]', act.clickSel, ok)
      await sleep(act.after ?? 700)
      continue
    }
    if (act.scrollTo) {
      const ok = await page.evaluate(({ sel, index }) => {
        const list = [...document.querySelectorAll(sel)]
        const el = list[index || 0]
        if (!el) return false
        el.scrollIntoView({ block: 'start' })
        return true
      }, { sel: act.scrollTo, index: act.index || 0 })
      console.log('[scrollTo]', act.scrollTo, act.index || 0, ok)
      await sleep(act.after ?? 500)
      continue
    }
    if (act.type) {
      const ok = await page.evaluate(({ sel, text }) => {
        const el = [...document.querySelectorAll(sel)].find(n => n.offsetParent !== null)
        if (!el) return false
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
        setter.call(el, text)
        el.dispatchEvent(new Event('input', { bubbles: true }))
        el.dispatchEvent(new Event('change', { bubbles: true }))
        el.blur()
        return true
      }, act.type)
      console.log('[type]', act.type.sel, ok)
      await sleep(act.after ?? 400)
    }
  }

  await page.screenshot({ path: out })
  console.log('[shot]', out)
} finally {
  await browser.close()
}
