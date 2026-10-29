/**
 * 真跑一遍「缺口识别 → 生成编排」，验证契约、事实、目录是否够用。
 * 用法：node scripts/probe-compose.mjs "用户原话" [员工姓名]
 *
 * 追问一律取模型给的默认值（或第一个选项），只为看第二步生成出来的形状。
 */
import { factsFor } from '../src/v2/base.js'
import { buildAskMessages, factsToText } from '../src/v2/prompt.js'
import { systemChecks, actions } from '../src/v2/seed.js'

const BASE = process.env.BASE || 'http://localhost:5179'
const utterance = process.argv[2] || '推拿师员工主动发起离职后，首先走一个人事经理审核，明确员工离职信息，由于人事经理填写后，必过后才可以进入后续的交接流程，推拿师目前只要交还工服（非必过），然后是移除门店系统权限（这个是必过）后，发送离职电子合同。'
const person = process.argv[3] || '张三'

const facts = factsFor({ person })
const factsText = factsToText(facts)
const checkList = systemChecks
const actionList = actions

async function call (messages, temperature) {
  const res = await fetch(`${BASE}/api/llm/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, temperature, jsonMode: true })
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text()}`)
  const reader = res.body.getReader()
  const dec = new TextDecoder()
  let buf = ''
  let full = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buf += dec.decode(value, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop() || ''
    for (const line of lines) {
      if (!line.startsWith('data:')) continue
      const payload = line.slice(5).trim()
      if (!payload || payload === '[DONE]') continue
      try {
        const j = JSON.parse(payload)
        if (j.type === 'delta' && j.text) full += j.text
        else if (j.type === 'done' && j.text) full = j.text
        else if (j.type === 'error') throw new Error(j.message || '生成失败')
      } catch (e) {
        if (String(e.message || '').includes('生成失败') || String(e.message || '').includes('超时')) throw e
      }
    }
  }
  return full
}

const parse = (t) => {
  const s = String(t).replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  const i = s.indexOf('{')
  const j = s.lastIndexOf('}')
  return i < 0 || j <= i ? null : JSON.parse(s.slice(i, j + 1))
}

console.log('=== 第一步：缺口识别 ===')
const askText = await call(buildAskMessages({ utterance, factsText, checkList, actionList }), 0.15)
const ask = parse(askText)
if (!ask) { console.error('未解析出 JSON：', askText.slice(0, 400)); process.exit(1) }
console.log('理解：', ask.understood)
ask.gaps.forEach((g) => console.log(`- [${g.level}/${g.kind}] ${g.about}：${g.question}`))

const answers = ask.gaps.map((g) => ({
  id: g.id,
  question: g.question,
  answer: g.default || (g.options || [])[0] || '按常规处理'
}))
console.log(`\n=== 第二步：生成编排（自动采纳 ${answers.length} 条默认答案）===`)
const composeText = await call(buildAskMessages({ utterance, factsText, answers, checkList, actionList }), 0.2)
const out = parse(composeText)
if (!out) { console.error('未解析出 JSON：', composeText.slice(0, 600)); process.exit(1) }
console.log('事件：', out.name, '|', out.summary)
out.subs.forEach((s, i) => {
  const ways = (s.ways || []).map((w) => {
    if (w.type === 'action') return `action:${w.actionKey}（${w.targets || '整单'}）`
    if (w.type === 'system') return `system:${w.sysKey}`
    if (w.type === 'external') return `external:${w.party}`
    return `${w.type}:${w.role || ''}`
  })
  console.log(`${String(i + 1).padStart(2, '0')} [${s.gate}] ${s.goal}`)
  console.log(`     路径 ${ways.join(' | ')}`)
})
console.log('\nrecap：')
;(out.recap || []).forEach((r) => console.log('-', r))
