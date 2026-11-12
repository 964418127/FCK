/**
 * 真跑一遍：提示词 → 模型 → 这一单的树 → 触发成实例。
 *
 * 不是拼一棵树给页面看，也不是把规则生成的结果冒充模型产物：
 * 页面里调的是 gen.runGenerate（真模型），拿回来的树过 checkGenerated，
 * 再由 store.createInstance({ tree }) 建单 —— 与真触发同一条路，只是生成器换了。
 *
 * 用法：node scripts/probe-bean.mjs [端口] [员工姓名]
 */
import puppeteer from 'puppeteer-core'

const PORT = process.argv[2] || '5194'
const WHO = process.argv[3] || '杨春燕'
const BASE = `http://127.0.0.1:${PORT}`

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-sandbox']
})
const page = await browser.newPage()
page.on('console', (m) => { if (m.type() === 'error') console.error('[page]', m.text()) })
page.on('pageerror', (e) => console.error('[page error]', e.message))

await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
await new Promise((r) => setTimeout(r, 1500))

const out = await page.evaluate(async (who) => {
  const { loadLlmConfig } = await import('/src/composables/useLlmConfig.js')
  const seed = await import('/src/v2/seed.js')
  const gen = await import('/src/v2/gen.js')
  const store = await import('/src/v2/store.js')
  const tpl = await import('/src/v2/template.js')

  await loadLlmConfig()

  const ev = store.getEvent('resign')
  const person = seed.previewPeople.find((p) => p.name === who) || seed.previewPeople[0]
  const rendered = tpl.renderTemplate(ev)

  const t0 = Date.now()
  const r = await gen.runGenerate({ prompt: ev, emp: person })
  const ms = Date.now() - t0

  const pick = (t) => t.map((s) => ({
    id: s.id,
    goal: s.goal,
    gate: s.gate,
    deps: s.deps,
    ways: (s.ways || []).map((w) => (w.type === 'human'
      ? `人给结论 · ${w.owner?.role || w.owner?.name || '未写'} · ${(w.items || []).length} 个事项`
      : w.type === 'action' ? `系统执行 · ${w.actionKey}` : w.type === 'system' ? `系统判定 · ${w.sysKey}` : '外部回执'))
  }))

  const payout = r.tree.flatMap((s) => (s.ways || [])
    .flatMap((w) => (w.items || []).flatMap((it) => (it.fields || [])
      .filter((f) => f.key === 'beanPayout' || f.key === 'compAmount' || /常乐豆余额出口|补偿金/.test(f.label || ''))
      .map((f) => ({ sub: s.id, goal: s.goal, key: f.key, label: f.label, type: f.type, required: f.required, options: f.options, rule: f.rule, prefill: f.prefill })))))

  const payloadMod = await import('/src/v2/payload.js')
  const payload = payloadMod.keepKnownPayload(ev.trigger, {
    ...payloadMod.payloadDefaultsOf(ev.trigger, { empNo: person.id || person.empNo }),
    /* 申请单号与发起页同一条规则：提交时系统生成，不由人填 */
    applyNo: 'RQ20261104-9001',
    empId: person.id,
    expectDate: '2026-12-01',
    reason: ['工资太低'],
    note: '探针触发的单'
  })
  const inst = store.createInstance({ eventKey: 'resign', emp: person, payload, tree: r.tree, by: '模型生成' })

  const rule = (await import('/src/v2/blueprint.js')).composeFor({ prompt: ev, emp: person })
  const ruleKeys = rule.tree.map((s) => s.skeletonKey).sort()
  const modelKeys = r.tree.map((s) => s.skeletonKey).sort()

  return {
    who: person.name,
    modelMs: ms,
    tplLines: rendered.split('\n').length,
    skeletonCount: (ev.skeleton || []).length,
    tree: pick(r.tree),
    ruleDiff: {
      ruleCount: ruleKeys.length,
      modelCount: modelKeys.length,
      onlyRule: ruleKeys.filter((k) => !modelKeys.includes(k)),
      onlyModel: modelKeys.filter((k) => !ruleKeys.includes(k))
    },
    dropped: r.dropped,
    check: { ok: r.check.ok, errors: r.check.errors, warnings: r.check.warnings },
    payout,
    bean: r.tree.filter((s) => /bean|常乐豆/.test(s.id + s.goal)).map((s) => ({ id: s.id, goal: s.goal, ways: s.ways })),
    inst: inst?.refused ? { refused: true, why: inst.why } : (inst ? {
      id: inst.id,
      code: inst.code,
      kept: inst.tree.length,
      state: inst.state,
      gen: inst.gen,
      todo: Object.entries(inst.subs).filter(([, v]) => v.state === 'pending').length,
      intake: (inst.intake?.steps || []).map((s) => `${s.label}: ${s.result}`)
    } : null)
  }
}, WHO)

console.log(JSON.stringify(out, null, 1))

/* 同一份 localStorage 里接着看界面：不另启 profile，否则刚建的单就没了 */
if (out.inst?.id && !out.inst.refused) {
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  await page.goto(`${BASE}/v2/m/inst?id=${out.inst.id}`, { waitUntil: 'domcontentloaded' })
  await new Promise((r) => setTimeout(r, 1800))
  await page.screenshot({ path: '/tmp/bean-model-inst.png', fullPage: false })
  console.log('shot: /tmp/bean-model-inst.png')

  await page.setViewport({ width: 1440, height: 1000 })
  await page.goto(`${BASE}/v2/inst-tree?id=${out.inst.id}`, { waitUntil: 'domcontentloaded' })
  await new Promise((r) => setTimeout(r, 2200))
  await page.screenshot({ path: '/tmp/bean-model-tree.png', fullPage: false })
  console.log('shot: /tmp/bean-model-tree.png')
}

await browser.close()
