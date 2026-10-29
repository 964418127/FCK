/**
 * v2 评审稿交互冒烟：新建事件 → 空壳 → 加子事件 → 发布 diff
 * 跑法：node scripts/smoke-v2.mjs [baseUrl]
 */
import puppeteer from 'puppeteer-core'

const BASE = process.argv[2] || 'http://localhost:5179'
let fail = 0
const ok = (cond, msg) => {
  console.log(cond ? `  ✓ ${msg}` : `  ✗ ${msg}`)
  if (!cond) fail++
}

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--window-size=1600,1000']
})

const page = await browser.newPage()
await page.setViewport({ width: 1600, height: 1000 })
page.on('pageerror', (e) => { console.log('  ! 页面异常:', e.message); fail++ })

async function clickText (text, scope = 'body') {
  const done = await page.evaluate(
    (t, s) => {
      const root = document.querySelector(s) || document.body
      const nodes = [...root.querySelectorAll('button, .el-button, a, span, div')]
      const hit = nodes.filter((n) => n.textContent.trim() === t && n.offsetParent !== null).sort((a, b) => a.textContent.length - b.textContent.length)[0]
      if (!hit) return false
      const target = hit.closest('button, .el-button, a') || hit
      target.click()
      return true
    },
    text,
    scope
  )
  return done
}

try {
  await page.goto(`${BASE}/v2/events`, { waitUntil: 'networkidle2' })
  await page.evaluate(() => localStorage.removeItem('fck:v2:review:v3'))
  await page.reload({ waitUntil: 'networkidle2' })
  await new Promise((r) => setTimeout(r, 800))

  console.log('\n1. 新建根事件')
  ok(await clickText('新建根事件'), '点开新建弹窗')
  await page.waitForSelector('.el-dialog', { visible: true })
  await page.type('.el-dialog input', '调岗')
  await page.click('.el-dialog .el-checkbox')
  await new Promise((r) => setTimeout(r, 300))
  ok(await clickText('建立并进入编排'), '提交新建')
  await page.waitForFunction(() => location.pathname.includes('/studio'), { timeout: 8000 })
  ok(page.url().includes('key=ev-'), `进入工作台（${new URL(page.url()).pathname + new URL(page.url()).search}）`)

  console.log('\n2. 空壳状态')
  await new Promise((r) => setTimeout(r, 600))
  const emptyText = await page.evaluate(() => document.body.innerText)
  ok(emptyText.includes('这是个空壳'), '显示空壳提示')
  ok(emptyText.includes('还没有任何子事件'), '校验提示无子事件')
  const publishDisabled = await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.innerText.trim() === '发布')
    return btn?.disabled ?? null
  })
  ok(publishDisabled === true, '空壳时发布按钮禁用')

  console.log('\n3. 添加子事件')
  ok(await clickText('添加第一个子事件'), '点添加')
  await new Promise((r) => setTimeout(r, 500))
  const afterAdd = await page.evaluate(() => document.body.innerText)
  ok(afterAdd.includes('（待填写的结论目标）'), '出现新子事件卡片')
  ok(afterAdd.includes('结论目标'), '右栏切到契约编辑')

  console.log('\n4. 已有事件的发布 diff')
  await page.goto(`${BASE}/v2/studio?key=resign`, { waitUntil: 'networkidle2' })
  await new Promise((r) => setTimeout(r, 700))
  const before = await page.evaluate(() => document.body.innerText)
  ok(before.includes('草稿有 1 处未发布改动'), '顶栏提示未发布改动')
  ok(await clickText('发布'), '点发布')
  await page.waitForSelector('.el-dialog', { visible: true })
  const dlg = await page.evaluate(() => document.querySelector('.el-dialog')?.innerText || '')
  ok(dlg.includes('是否愿意再入职'), 'diff 里出现新增字段')
  ok(dlg.includes('发布 v4'), '目标版本 v4')
  ok(await clickText('发布 v4'), '确认发布')
  await new Promise((r) => setTimeout(r, 900))
  const after = await page.evaluate(() => document.body.innerText)
  ok(!after.includes('草稿有 1 处未发布改动'), '发布后未发布提示消失')
  ok(after.includes('当前 v4'), '版本号升到 v4')

  console.log('\n5. 覆盖页交互')
  await page.goto(`${BASE}/v2/overlays?event=resign&tab=resolve`, { waitUntil: 'networkidle2' })
  await new Promise((r) => setTimeout(r, 700))
  const ov = await page.evaluate(() => document.body.innerText)
  ok(ov.includes('所辖门店与团队已交接完毕'), '解析出新增子事件')
  ok(ov.includes('被跳过'), '显示被跳过项')

  console.log('\n6. 恢复演示数据')
  await page.evaluate(() => localStorage.removeItem('fck:v2:review:v3'))
  console.log('  已清理本地改动')
} catch (e) {
  console.log('\n执行失败：', e.message)
  fail++
} finally {
  await browser.close()
}

console.log(fail ? `\n${fail} 项失败` : '\n全部通过')
process.exit(fail ? 1 : 0)
