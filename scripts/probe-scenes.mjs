/**
 * 场景探针：转正 / 调岗 / 调薪 三套模板，各跑一遍真链路。
 *
 * 「真」是指：模板由骨架渲染 → 发给真模型（不是规则生成）→ 模型返回的树过同一套自检
 * → 拿这棵树建单 → 打开移动端详情截图。任何一步失败都如实报，不降级、不造数据。
 *
 * 用法：node scripts/probe-scenes.mjs [端口] [场景key…]
 *   node scripts/probe-scenes.mjs 5194
 *   node scripts/probe-scenes.mjs 5194 transfer
 */

import puppeteer from 'puppeteer-core'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const port = process.argv[2] || '5194'
const only = process.argv.slice(3)
const BASE = `http://localhost:${port}`

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
await new Promise((r) => setTimeout(r, 1800))

const scenes = await page.evaluate(async () => {
  const seed = await import('/src/v2/seed.js')
  const list = seed.seedEvents.filter((e) => e.key !== 'resign')
  return list.map((e) => ({ key: e.key, name: e.name, count: e.skeleton.length }))
})

const targets = only.length ? scenes.filter((s) => only.includes(s.key)) : scenes
console.log(`场景：${targets.map((s) => `${s.name}（${s.count} 条）`).join('、')}\n`)

for (const sc of targets) {
  const t0 = Date.now()
  const out = await page.evaluate(async (key) => {
    const seed = await import('/src/v2/seed.js')
    const gen = await import('/src/v2/gen.js')
    const bp = await import('/src/v2/blueprint.js')
    const payloadMod = await import('/src/v2/payload.js')
    const store = await import('/src/v2/store.js')
    const promptMod = await import('/src/v2/prompt.js')

    const ev = seed.seedEvents.find((e) => e.key === key)
    /* 模型配置由页面启动时才加载：探针先自己拉一次，否则看到的是「还没配置模型」 */
    const llm = await import('/src/composables/useLlmConfig.js')
    await llm.loadLlmConfig()
    /* 挑人：在覆盖人群里按 scopeHit 找第一个（与页面「试跑」同一条规则：先 scope 再人） */
    const model = await import('/src/v2/model.js')
    const pool = seed.previewPeople.filter((p) => model.scopeHit(ev.scope || {}, p))
    const emp = pool[0]
    if (!emp) return { refused: '这套提示词没有命中的人', key }

    /* 这一单的载荷：登记默认值 + 必传里没默认值的，按登记类型补一个**合规**的值
     * （日期补日期、单选补第一个可选值 —— 拿占位文本填日期会被载荷校验挡下，那是对的） */
    const base = payloadMod.payloadDefaultsOf(ev.trigger, { empNo: emp.id })
    const plan = payloadMod.payloadPlanOf(ev.trigger)
    const day = (n) => {
      const d = new Date(Date.now() + n * 86400000)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }
    const fill = {}
    plan.forEach((f) => {
      if (base[f.key] !== undefined || !f.required) return
      /* auto 的字段是系统生成（申请单号），给一个形状对的号，不按日期凑 */
      if (f.auto) { fill[f.key] = `RQ-AUTO-${key}`; return }
      if (f.type === 'date') fill[f.key] = day(30)
      else if (f.type === 'enum') fill[f.key] = (f.options || [])[0] || ''
      else if (f.type === 'multi') fill[f.key] = (f.options || []).slice(0, 1)
      else if (f.type === 'number') fill[f.key] = 0
      else fill[f.key] = day(0).slice(0, 7)
    })
    const payload = payloadMod.keepKnownPayload(ev.trigger, { ...base, ...fill })

    /* 规则生成（对照）+ 模型生成（真的跑） */
    const rule = bp.composeFor({ prompt: ev, emp })
    const got = await gen.runGenerate({ prompt: ev, emp, factsText: promptMod.instanceFactsText(emp) })
    const inst = store.createInstance({ eventKey: key, emp, payload, tree: got.tree, by: '模型生成' })

    const ruleKeys = rule.tree.map((s) => s.skeletonKey).sort()
    const modelKeys = got.tree.map((s) => s.skeletonKey).sort()
    return {
      key,
      who: `${emp.name}（${emp.job} · ${emp.store} · ${emp.employType}）`,
      payload,
      ruleCount: ruleKeys.length,
      modelCount: modelKeys.length,
      onlyRule: ruleKeys.filter((k) => !modelKeys.includes(k)),
      onlyModel: modelKeys.filter((k) => !ruleKeys.includes(k)),
      dropped: rule.dropped.map((d) => d.key),
      check: { ok: got.check.ok, errors: got.check.errors, warnings: got.check.warnings },
      instanceId: inst?.id || null,
      refused: inst?.refused ? inst.why : null,
      code: inst?.code || null,
      tree: (inst?.tree || []).map((s) => ({ id: s.id, goal: s.goal, deps: s.deps, state: (inst?.subs?.[s.id] || {}).state }))
    }
  }, sc.key)

  const sec = ((Date.now() - t0) / 1000).toFixed(1)
  console.log(`\n=== ${sc.name} · ${out.who || ''} · ${sec}s ===`)
  if (out.refused) {
    console.log('  建单被拒：' + out.refused)
    continue
  }
  console.log(`  规则 ${out.ruleCount} 条 / 模型 ${out.modelCount} 条｜多 ${out.onlyModel.length} 少 ${out.onlyRule.length}`)
  if (out.onlyRule.length) console.log('  模型缺：' + out.onlyRule.join('、'))
  if (out.onlyModel.length) console.log('  模型多：' + out.onlyModel.join('、'))
  if (out.dropped.length) console.log('  事实不成立而不长：' + out.dropped.join('、'))
  console.log(`  自检：${out.check.ok ? '通过' : '不合格'}（错误 ${out.check.errors.length} / 提醒 ${out.check.warnings.length}）`)
  out.check.errors.forEach((e) => console.log('    E ' + e.code + ' ' + e.text))
  out.check.warnings.forEach((e) => console.log('    W ' + e.code + ' ' + e.text))
  console.log(`  建单：${out.code}（${out.instanceId}）· ${out.tree.length} 条待办链`)
  out.tree.forEach((s) => console.log(`    ${s.id} ← ${s.deps.length ? s.deps.join(',') : '触发'}`))

  if (out.instanceId) {
    const p2 = await browser.newPage()
    await p2.setViewport({ width: 390, height: 900, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
    await p2.goto(`${BASE}/v2/m/inst?id=${out.instanceId}`, { waitUntil: 'domcontentloaded' })
    await new Promise((r) => setTimeout(r, 2200))
    const shot = `/tmp/scene-${sc.key}-inst.png`
    await p2.screenshot({ path: shot, fullPage: false })
    /* 顺带量一下这一单在移动端看到的是什么 */
    const head = await p2.evaluate(() => ({
      code: document.querySelector('.code')?.innerText?.trim() || '',
      prog: document.querySelector('.pg')?.innerText?.trim() || '',
      todo: document.querySelector('.todo-card .td-goal')?.innerText?.trim() || '',
      cards: document.querySelectorAll('.todo-card').length
    }))
    console.log(`  移动端：${head.code || '—'} · ${head.prog || '—'} · 当前待办「${head.todo || '—'}」（${head.cards} 张）· 截图 ${shot}`)
    await p2.close()
  }
}

await browser.close()
