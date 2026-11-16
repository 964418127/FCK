/**
 * 元素级截图：点出弹层后只截那个元素（抽屉/对话框/面板），看清设置项不被页面裁掉。
 * 用法：node elem-shot.mjs <url> <out.png> '<actions-json>' '<selector>'
 *   actions 同 pt-shot.mjs：[{click},{clickSel},{wait},{type}]
 */
import puppeteer from 'puppeteer-core'
const [, , url, out, rawActions = '[]', selector = '.el-drawer', clipH] = process.argv
const actions = JSON.parse(rawActions)
const sleep = ms => new Promise(r => setTimeout(r, ms))
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new', args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--window-size=1560,1100']
})
try {
  const page = await browser.newPage()
  await page.setViewport({ width: 1560, height: 1100, deviceScaleFactor: 2 })
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {})
  await sleep(1500)
  for (const act of actions) {
    if (act.wait) { await sleep(act.wait); continue }
    if (act.click) {
      const ok = await page.evaluate(({ text, idx }) => {
        const nodes = [...document.querySelectorAll('button, .el-button, a, span, div')]
          .filter(n => n.offsetParent !== null && n.textContent.trim() === text)
        const btns = nodes.filter(n => n.tagName === 'BUTTON' || n.classList.contains('el-button'))
        const hit = btns[idx ?? 0] || nodes[nodes.length - 1]
        if (!hit) return false
        hit.click()
        return true
      }, { text: act.click, idx: act.idx })
      console.log('[click]', act.click, ok)
      await sleep(act.after ?? 800)
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
      await sleep(act.after ?? 800)
    }
  }
  await sleep(1200)
  const box = await page.evaluate((sel, clipH) => {
    const list = [...document.querySelectorAll(sel)]
    const best = list.find(n => n.classList.contains('open') || n.classList.contains('is-open'))
      || list.find(n => {
        const r = n.getBoundingClientRect()
        return r.width > 0 && r.height > 0 && getComputedStyle(n).visibility !== 'hidden' && getComputedStyle(n).display !== 'none'
      })
    if (!best) return null
    const r = best.getBoundingClientRect()
    const box = { x: r.x, y: r.y, width: r.width, height: r.height }
    /* 收紧底部空白：取可见子孙元素的最大底边 */
    let bottom = r.top
    for (const d of best.querySelectorAll('*')) {
      const dr = d.getBoundingClientRect()
      if (dr.width > 0 && dr.height > 0 && dr.bottom > bottom && dr.bottom <= r.bottom) bottom = dr.bottom
    }
    if (bottom > r.top + 60) box.height = Math.min(bottom - r.top + 24, r.height)
    /* 显式高度覆盖：容器撑满全高时按内容实际高度截 */
    if (clipH) box.height = Math.min(+clipH, r.height)
    return box
  }, selector, clipH || 0)
  if (!box || !box.width) { console.error('[elem-shot] 找不到可见元素', selector); process.exit(1) }
  await page.screenshot({ path: out, clip: box })
  console.log('[elem-shot] 已输出', out, Math.round(box.width), 'x', Math.round(box.height))
} finally { await browser.close() }
