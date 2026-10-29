/**
 * 文档「功能页面示例」截图工具：用系统 Chrome（puppeteer-core 驱动）截原型页面。
 *
 * 用法：node doc-shot.js <url> <out.png> [宽] [高] [渲染后等待 ms] [缩放]
 *   node doc-shot.js "http://localhost:5178/leave-wm-quota?shot=1" shot.png
 * 页面自身支持 ?shot=1（隐藏侧边栏 / 顶栏）与各页面的演示参数（如额度方案 ?open=<假种id>）。
 */
import puppeteer from 'puppeteer-core'

const [, , url, out, w = '1560', h = '940', wait = '1500', scale = '2'] = process.argv
if (!url || !out) {
  console.error('用法: node doc-shot.js <url> <out.png> [宽] [高] [等待ms] [缩放]')
  process.exit(1)
}

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', `--window-size=${w},${h}`]
})

try {
  const page = await browser.newPage()
  await page.setViewport({ width: +w, height: +h, deviceScaleFactor: +scale })
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 }).catch(e => {
    console.warn('[doc-shot] networkidle2 超时，降级继续:', e.message)
  })
  await new Promise(r => setTimeout(r, +wait))
  await page.screenshot({ path: out })
  console.log('[doc-shot] 已输出', out)
} finally {
  await browser.close()
}
