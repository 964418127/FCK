/**
 * v4 班次后续处理 · 端到端探测（演示链）
 * 链路：何清当天取消被截止拦住 → 未来日期取消成功 → 申领晚段 → 转给苏禾（等待期）
 *      → 切苏禾接受转移 → 双方时间线核对 → web 名额视野手动加班次
 * 用法：node scripts/probe-v4-aftercare.mjs http://localhost:5200
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
  const p = `/tmp/v4e2e-${name}.png`
  await page.screenshot({ path: p })
  shots.push(p)
  console.log('[shot]', name)
}
const clickText = async text => {
  const ok = await page.evaluate(t => {
    const nodes = [...document.querySelectorAll('button, a, .el-button, .calendar-day, .cand, .act-line')]
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
/** 读 toast 文本（最近一条） */
const lastToast = async () => {
  await sleep(400)
  return page.evaluate(() => {
    const ms = [...document.querySelectorAll('.el-message')]
    return ms.length ? ms[ms.length - 1].textContent.trim() : ''
  })
}
/** 点月历上某一天（.calendar-day 内 day-number 文本） */
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
/** 切演示身份 */
const switchMe = async name => {
  await clickSel('.ps-trigger')
  await sleep(400)
  await page.evaluate(() => {})
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

/* ---------- ① 何清：当天取消被截止拦住 ---------- */
await page.goto(`${base}/v4/m`, { waitUntil: 'networkidle2', timeout: 30000 })
await sleep(1200)
await switchMe('何清')
await expect(await bodyHas('何清'), '切到何清视角')
// 显式选 11-13（今天）：早班 12:00 开班，此时 15:00 已过开班前 4h 取消截止
await pickDay(13)
await expect(await bodyHas('取消班次'), '允许取消的计划出现「取消班次」按钮')
await shot('1-mine-default')
await clickText('取消班次')
await expect(await bodyHas('名额回池'), '取消弹层写明名额去向')
await shot('2-cancel-sheet')
await clickText('确认取消')
const toast1 = await lastToast()
await expect(/截止/.test(toast1), `过截止被拦（toast: ${toast1}）`)
await shot('3-cancel-blocked')

/* ---------- ② 未来日期（11-16 早段）取消成功 ---------- */
await pickDay(16)
await clickText('取消班次')
await clickText('确认取消')
const toast2 = await lastToast()
await expect(/已取消/.test(toast2), `取消成功（toast: ${toast2}）`)
await expect(await bodyHas('本人取消'), '时间线出现「本人取消」痕迹')
await shot('4-cancel-ok')

/* ---------- ③ 申领 11-17 晚段 → 发起转移给苏禾 ---------- */
await clickSel('.view-tabs button:nth-child(2)')
await pickDay(17)
await shot('5-pick')
const canClaim = await page.evaluate(() => !![...document.querySelectorAll('.slot-card .act-btn.primary')].find(n => n.offsetParent !== null))
await expect(canClaim, '11-17 有可领晚段')
if (canClaim) {
  await page.evaluate(() => [...document.querySelectorAll('.slot-card .act-btn.primary')].find(n => n.offsetParent !== null).click())
  await sleep(500)
  await clickText('确认申领')
  const toast3 = await lastToast()
  await expect(toast3 === '' || /成功|领取/.test(toast3), `申领完成（toast: ${toast3 || '无（直接生效）'}）`)
  await clickSel('.view-tabs button:nth-child(1)')
  await pickDay(17)
  await expect(await bodyHas('转给同事'), '已领班次出现「转给同事」按钮')
  await clickText('转给同事')
  await expect(await bodyHas('等待期'), '转移弹层写明等待期规则')
  await shot('6-transfer-sheet')
  await clickSel('.cand') // 第一个候选 = 苏禾（按花名册顺序）
  const toast4 = await lastToast()
  await expect(/已发起转移/.test(toast4), `转移发起（toast: ${toast4}）`)
  await expect(await bodyHas('转移待接受'), '卡片进入「转移待接受」状态')
  await shot('7-transfer-pending')
}

/* ---------- ④ 切苏禾：通知页接受转移 ---------- */
await switchMe('苏禾')
await clickSel('.view-tabs button:nth-child(3)')
await expect(await bodyHas('转移邀请'), '苏禾收到转移邀请')
await shot('8-invite')
await clickText('接受')
const toast5 = await lastToast()
await expect(/已成立|成功/.test(toast5), `转移成立（toast: ${toast5}）`)
await shot('9-accepted')
// 苏禾的时间线：11-17 出现转移承接的晚段
await clickSel('.view-tabs button:nth-child(1)')
await pickDay(17)
await expect(await bodyHas('自主领取') || await bodyHas('转移成立') || await bodyHas('转移承接'), '苏禾时间线出现承接的班次')
await shot('10-suname')

/* ---------- ⑤ 切回何清：原班次进历史 ---------- */
await switchMe('何清')
await pickDay(17)
await expect(await bodyHas('已释放'), '何清侧原班次标记已释放')
await shot('11-histime')

/* ---------- ⑥ web 名额视野：手动加班次 ---------- */
await page.setViewport({ width: 1440, height: 1000 })
await page.goto(`${base}/schedule-v4`, { waitUntil: 'networkidle2', timeout: 30000 })
await sleep(1000)
await clickText('名额视野')
await clickText('+ 手动加班次')
await expect(await bodyHas('手动补充班次'), '手动加班次弹层打开')
await shot('12-manual-dialog')
await clickText('创建并发布')
const toast6 = await lastToast()
await expect(/已创建并发布/.test(toast6), `手动班次创建（toast: ${toast6}）`)
await shot('13-manual-created')
await expect(await bodyHas('手动'), '名额视野出现「手动」标记')

console.log(failures === 0 ? '\n== 端到端全部通过 ==' : `\n== ${failures} 处失败 ==`)
console.log(shots.join('\n'))
await browser.close()
process.exit(failures === 0 ? 0 : 1)
