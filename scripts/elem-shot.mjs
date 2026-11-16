/** 临时：按 h4 标题定位其后的 SVG，或按 aria-label 匹配 SVG。node elem-shot.mjs <url> <匹配文本> <out.png> */
import puppeteer from 'puppeteer-core'

const [, , url, titleText, out] = process.argv
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--window-size=1560,940']
})
try {
  const page = await browser.newPage()
  await page.setViewport({ width: 1240, height: 900, deviceScaleFactor: 2 })
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
  await new Promise(r => setTimeout(r, 1500))
  const rect = await page.evaluate((t) => {
    let svg = null
    const direct = [...document.querySelectorAll('svg')].find(x => (x.getAttribute('aria-label') || '').includes(t))
    if (direct) { svg = direct }
    else {
      const hs = [...document.querySelectorAll('h4')]
      const h = hs.find(x => x.textContent.includes(t))
      if (!h) return null
      let el = h.nextElementSibling
      while (el && el.tagName.toLowerCase() !== 'svg' && !el.querySelector('svg')) el = el.nextElementSibling
      if (!el) return null
      svg = el.tagName.toLowerCase() === 'svg' ? el : el.querySelector('svg')
    }
    svg.scrollIntoView({ block: 'center', behavior: 'instant' })
    const r = svg.getBoundingClientRect()
    return { x: r.x, y: r.y, width: r.width, height: r.height }
  }, titleText)
  if (!rect) { console.error('未找到标题或 SVG:', titleText); process.exit(1) }
  await page.screenshot({ path: out, clip: rect })
  console.log('[elem-shot] 已输出', out)
} finally { await browser.close() }
