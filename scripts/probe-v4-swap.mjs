/**
 * v4 换班 · 端到端探测（演示链）
 * 链路：韩野 11-16 早班 → 找人换班（列的是真能换成的：严青同日 晚班）→ 进入等待期
 *      → 切严青看到换班邀请 → 同意 → 两条班次对调（名额池不动）
 *      → 双方时间线核对 → web 计划配置里的「可换班」规则
 * 用法：node scripts/probe-v4-swap.mjs http://localhost:5200
 */
import puppeteer from 'puppeteer-core'

const base = process.argv[2] || 'http://localhost:5200'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const shots = []
let failures = 0

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars']
})
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 })

const shot = async name => {
  const p = `/tmp/v4swap-${name}.png`
  await page.screenshot({ path: p })
  shots.push(p)
  console.log('[shot]', name)
}
const clickText = async text => {
  const ok = await page.evaluate(t => {
    const nodes = [...document.querySelectorAll('button, a, .el-button, .calendar-day, .cand, .act-line, .el-tabs__item, .space-item')]
      .filter(n => n.offsetParent !== null && n.textContent.trim().startsWith(t))
    const hit = nodes[nodes.length - 1]
    if (!hit) return false
    hit.click()
    return true
  }, text)
  console.log('[click]', text, ok)
  if (!ok) failures++
  await sleep(600)
  return ok
}
const clickSel = async sel => {
  const ok = await page.evaluate(s => {
    const el = [...document.querySelectorAll(s)].find(n => n.offsetParent !== null)
    if (!el) return false
    el.click()
    return true
  }, sel)
  console.log('[clickSel]', sel, ok)
  if (!ok) failures++
  await sleep(600)
  return ok
}
const expect = async (cond, label) => {
  console.log(cond ? '[ok]' : '[FAIL]', label)
  if (!cond) failures++
}
const lastToast = async () => {
  await sleep(400)
  return page.evaluate(() => {
    const ms = [...document.querySelectorAll('.el-message')]
    return ms.length ? ms[ms.length - 1].textContent.trim() : ''
  })
}
const pickDay = async day => {
  const ok = await page.evaluate(d => {
    const cells = [...document.querySelectorAll('.calendar-day')]
      .filter(n => n.offsetParent !== null && n.querySelector('.day-number')?.textContent.trim() === d)
    if (!cells.length) return false
    cells[0].click()
    return true
  }, String(day))
  console.log('[pickDay]', day, ok)
  if (!ok) failures++
  await sleep(500)
}
const switchMe = async name => {
  await clickSel('.ps-trigger')
  await sleep(400)
  const ok = await page.evaluate(n => {
    const q = document.querySelector('.ps-q')
    if (!q) return false
    q.value = n
    q.dispatchEvent(new Event('input', { bubbles: true }))
    return true
  }, name)
  await sleep(400)
  await clickText(name)
  await sleep(600)
  return ok
}
const bodyHas = async text => page.evaluate(t => document.body.textContent.includes(t), text)

/* ---------- ① 韩野：从 11-16 早班发起换班 ---------- */
await page.goto(`${base}/v4/m`, { waitUntil: 'networkidle2', timeout: 30000 })
await sleep(1200)
await switchMe('韩野')
await pickDay(16)
await expect(await bodyHas('找人换班'), '允许换班的班次出现「找人换班」按钮')
await shot('1-mine')
await clickText('找人换班')
await expect(await bodyHas('换班是双向的'), '换班弹层说明双向对价与等待期')
await expect(await bodyHas('严青'), '候选里列出严青（同日可换的晚班）')
await shot('2-swap-sheet')
await clickSel('.swap-cand')
const t1 = await lastToast()
await expect(/已发起换班/.test(t1), `换班发起（toast: ${t1}）`)
await expect(await bodyHas('换班待同意'), '卡片进入「换班待同意」状态')
await shot('3-swap-pending')

/* ---------- ② 严青：通知页同意换班 ---------- */
await switchMe('严青')
await clickSel('.view-tabs button:nth-child(3)')
await expect(await bodyHas('换班邀请'), '严青收到换班邀请')
await shot('4-invite')
await clickText('同意换班')
const t2 = await lastToast()
await expect(/换班已成立/.test(t2), `换班成立（toast: ${t2}）`)
await shot('5-accepted')

/* ---------- ③ 双方时间线核对 ---------- */
await clickSel('.view-tabs button:nth-child(1)')
await pickDay(16)
await expect(await bodyHas('早班'), '严青时间线拿到早班')
await expect(await bodyHas('同事换班'), '标「同事换班」')
await shot('6-yan-timeline')

await switchMe('韩野')
await pickDay(16)
await expect(await bodyHas('晚班'), '韩野时间线拿到晚班')
await expect(await bodyHas('同事换班'), '标「同事换班」')
await shot('7-han-timeline')

/* ---------- ④ web：计划里的换班规则 ---------- */
await page.setViewport({ width: 1440, height: 1000 })
await page.goto(`${base}/schedule-v4`, { waitUntil: 'networkidle2', timeout: 30000 })
await sleep(1000)
await clickText('麓山')
await clickText('周期计划')
await expect(await bodyHas('可换班'), '计划卡片显示「可换班」规则')
await shot('8-web-plan')
await clickText('编辑')
await expect(await bodyHas('同岗位对等'), '编辑抽屉有「可换班 + 等待期 + 同岗位对等」')
await shot('9-web-drawer')

console.log(failures === 0 ? '\n== 换班端到端全部通过 ==' : `\n== ${failures} 处失败 ==`)
console.log(shots.join('\n'))
await browser.close()
process.exit(failures === 0 ? 0 : 1)
