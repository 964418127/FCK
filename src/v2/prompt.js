/**
 * 提示词装配：契约渲染 + 每次现拼的用户侧上下文。
 *
 * 系统提示词不在这里手写 —— 它由 contract.js 渲染而来。
 * 本文件只负责把「这次变了的东西」拼在用户侧：
 *   用户原话 + 查到的事实 + 可引用目录 + 上一轮回答
 */

import { permCatalog, org, jobPerms, permName } from './base.js'
import { jobs, cities, stores, employTypes, roles } from './model.js'
import { eventPoints } from './seed.js'
import { BASE_NEEDS } from './skeleton.js'
import { renderTemplate } from './template.js'
import { CONTRACT, renderSystemPrompt } from './contract.js'

export const SYSTEM_PROMPT = renderSystemPrompt(CONTRACT)

/**
 * 定义期事实：只有组织与目录，没有任何具体员工。
 *
 * 为什么不能按人给：
 *   一件事对谁存在由 coverage（人群）决定；某个员工的账号、欠款、假勤余额是
 *   触发之后随单带进来的实例数据，逐人不同。定义期拿一个人当样本，等于用
 *   一个人的数值去替一群人拍口径，也会把「这一单的人」误当成「这类人」。
 */
export function designFactsText () {
  const cityLine = org.cities.map((c) => `${c.name}（人事 ${c.hr} · 城市总 ${c.cityHead}）`).join('、')
  const storeLine = org.stores.map((s) => `${s.name}（${s.city} · 店长 ${s.manager} · 直属上级 ${s.supervisor}）`).join('、')
  const jobLine = jobs.map((j) => `${j.key} ${j.headcount}`).join('、')
  const typeLine = employTypes.map((e) => `${e.key} ${e.headcount}`).join('、')
  const permLine = Object.entries(jobPerms)
    .map(([job, keys]) => `${job} → ${keys.map(permName).join('、')}`)
    .join('；')
  return [
    '（定义期事实：只有组织与目录，不含任何具体员工；逐人数据在触发后随单带入）',
    `城市与责任人：${cityLine}`,
    `门店与责任人：${storeLine}`,
    `岗位与编制：${jobLine}`,
    `用工类型与编制：${typeLine}`,
    `岗位权限基线（该岗位离职时应撤的账号）：${permLine}`,
    '角色解析口径：员工本人 = 触发那件事上的人；店长 / 直属上级按门店解析；人事经理 / 城市总按城市解析；IT / 财务 / 大区总 / 总经理取总部固定责任人',
    '单个员工的账号清单、欠款、假勤余额逐人不同：定义期不假设具体是谁、也不假设取到多少；它们属于触发后的实例载荷与判定项批次结果'
  ].join('\n')
}

/**
 * 事件点登记字段的完整说法：key、类型、是否必传、可选取值。
 *
 * 只渲「有没有值」不够：漏掉 type 与 options，模型会把一个多选字段当成单值文本，
 * 于是问出「reason 是单一字段，可否扩展成多选」这种其实已经登记过的假缺口。
 */
const PAYLOAD_TYPE = {
  text: '文本', date: '日期', number: '数字', enum: '单选', multi: '多选', bool: '是/否'
}

function payloadFieldText (f) {
  const bits = [PAYLOAD_TYPE[f.type] || f.type || '文本']
  bits.push(f.required ? '必传' : '选填')
  if (f.auto) bits.push('提交时系统生成')
  if (f.role === 'empNo') bits.push('引擎取档案用')
  const opts = (f.options || []).length ? `：${f.options.join(' / ')}` : ''
  return `${f.key}=${f.label}（${bits.join(' · ')}${opts}）`
}

function catalogText (checks = [], actions = []) {
  return [
    '## 可用的触点（trigger.type = business 时 eventPoint 只能从这里取，不许自造事件点）',
    'payload 只填 field（登记字段的 key）与 use（intake 取数入参 / show 实例回看 / bind 预填子事件）；类型、必传、可选值一律由登记决定，不要在这里重写，也不要问「能不能改成多选」—— 登记里是什么就是什么。',
    ...eventPoints.map((p) => `- ${p.key}｜${p.label}｜来源 ${p.source}｜登记入口 ${p.entry}｜带入字段 ${p.payload.map(payloadFieldText).join('、')}`),
    '',
    '## 组织维度（coverage 是「这套提示词管谁」，只能从这里取值，空数组表示不限；人数不用你算，系统按编制估）',
    `- 岗位：${jobs.map((j) => j.key).join(' / ')}（编制 ${jobs.map((j) => `${j.key} ${j.headcount}`).join('、')}）`,
    `- 城市：${cities.map((c) => c.key).join(' / ')}`,
    `- 门店：${stores.join(' / ')}`,
    `- 用工类型：${employTypes.map((e) => e.key).join(' / ')}`,
    '',
    '## 角色（人办与审核都写角色 key，不写人名；人名由系统按门店 / 城市解析）',
    ...roles.map((r) => `- ${r.key}｜${r.label}`),
    '',
    '## 可引用的系统检查项（sysKey 只能从这里取；只出结论，不改数据）',
    '（每条自带 defaultFetch：freq 是流程多久去它那儿取一次结论、maxRuns 是批次上限。引用时照抄这两项，不要自己编；用户明确说要改才改）',
    ...checks.map((c) => {
      const d = c.defaultFetch || {}
      return `- ${c.key}｜${c.name}｜来源 ${c.source}｜默认取数 ${d.freq || '1d'} · 上限 ${d.maxRuns || 5} 个未通过批次｜通过条件：${(c.pass?.items || []).join(' 且 ')}｜软性：${(c.soft?.items || []).join(' 或 ') || '无'}`
    }),
    '',
    '## 可引用的动作（actionKey 只能从这里取；真的改数据或发出东西，拿回执）',
    ...actions.map((a) => `- ${a.key}｜${a.name}｜执行方 ${a.source}｜类型 ${a.mode}｜执行单位 ${a.target || '整单'}｜入参 ${(a.args || []).map((x) => x.label).join('、')}｜回执 ${(a.receipt || []).map((x) => x.label).join('、')}`),
    '',
    '## 系统权限目录（撤销权限这类动作的目标清单来源，不是可引用对象；写 targets 时用名称，不用 key）',
    ...permCatalog.map((p) => `- ${p.name}（${p.side}）｜内部 key ${p.key}`)
  ].join('\n')
}

/**
 * 条件可用的事实：基础表直接可用，本事件专用的事实要自己在 facts 里声明。
 * 不说清这条，模型会随手写一个取不到的键 —— 那一条在触发时静默消失，最难查。
 */
export function needVocabText () {
  return [
    '## 条件可用的事实（骨架的 needs 只能取这里的键）',
    `基础事实表（跨事件通用，直接可用）：${BASE_NEEDS.map((n) => `${n.key}=${n.label}（没有时写「${n.absent || '不适用'}」）`).join('｜')}`,
    '某件事专用的事实：基础表里没有的，自己在 facts 里声明一条 —— { key, label（肯定说法，如「持有 AACB」）, absent（否定说法，如「无 AACB」）, hint（从哪查、什么口径） }，骨架里再用这个 key。',
    '不许用没声明的键：触发时永远取不到，那一条会静默消失，比报错更难发现。'
  ].join('\n')
}

export function buildAskMessages ({ utterance, factsText, answers = [], checkList = [], actionList = [], prevSummary = '' }) {
  const parts = ['## 用户原话', utterance, '', '## 事实（已从系统查到，只能用这些）', factsText, '']
  if (prevSummary) parts.push('## 已发布过的同类编排（供参考，不要照抄）', prevSummary, '')
  if (answers.length) {
    parts.push('## 用户对上一轮追问的回答')
    answers.forEach((a) => parts.push(`- [${a.id}] ${a.question} → ${a.answer || '（跳过）'}`))
    parts.push('')
    parts.push('现在进入第二步：起草这套提示词与骨架。只输出 compose 的 JSON（body + skeleton + facts），不要生成树。')
  } else {
    parts.push('现在做第一步：只做缺口识别，不要起草骨架。只输出 ask 的 JSON。')
  }
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: parts.join('\n') },
    { role: 'user', content: catalogText(checkList, actionList) },
    { role: 'user', content: needVocabText() }
  ]
}

/* ---------------- 事实 → 文本 ---------------- */

export function factsToText (facts) {
  if (!facts) return '（未指定人员，按岗位共性判断）'
  if (facts.kind === 'person') {
    const f = facts.person
    return [
      `员工：${f.name}（${f.id}）｜${f.job}｜${f.city} / ${f.store}｜${f.employType}｜入职 ${f.onboardAt}`,
      `现有系统权限：${facts.perms.map((p) => `${p.name}(${p.side})`).join('、') || '无'}`,
      `该岗位应移除：${facts.jobPermStandard.map((p) => p.name).join('、') || '无'}`,
      `超出岗位标准的账号：${facts.beyondStandard.map((p) => `${p.name}(${p.side})`).join('、') || '无'}`,
      `欠款：合计 ¥${facts.debt.total}（借款 ${facts.debt.loan}、备用金 ${facts.debt.advance}、报销 ${facts.debt.reimburse}）`,
      `假勤剩余：年假 ${facts.leave.annual} 天、调休 ${facts.leave.comp} 天、病假 ${facts.leave.sick} 天`,
      `角色：店长 ${facts.roles.storeManager}｜直属上级 ${facts.roles.supervisor}｜人事经理 ${facts.roles.hr}｜城市总 ${facts.roles.cityHead}｜IT ${facts.roles.it}｜财务 ${facts.roles.finance}`
    ].join('\n')
  }
  return [
    `范围：${[facts.condition.job, facts.condition.store, facts.condition.city].filter(Boolean).join(' / ') || '全体'}，${facts.count} 人`,
    `有欠款 ${facts.withDebt} 人，挂超岗位权限 ${facts.withExtraPerms} 人`,
    `人事经理：${facts.roleCoverage.hr.join('、')}`
  ].join('\n')
}


/* ---------------- 实例期：这一单的事实 ---------------- */

const FACT_LINES = [
  ['clients', '在跟客户', (v) => `${v} 人`],
  ['tasks', '在办工作事项', (v) => `${v} 项`],
  ['team', '直属下属 / 在管门店', (v) => `${v} 人`],
  ['cash', '保管的备用金 / 现金', (v) => `¥${v}`],
  ['debt', '未结清款项', (v) => `¥${v}`],
  ['complaint', '近 30 天未完结工单', (v) => `${v} 件`]
]

const yesNo = (v) => (v ? '是' : '否')

/**
 * 触发后的事实：这一单的人 + 逐人数据。
 * 与设计期事实的区别就在这一段 —— 长哪几条由它决定，不由岗位想象。
 */
export function instanceFactsText (emp = {}) {
  const f = emp.facts || {}
  const lines = [
    '（实例期事实：这是这一单的人，逐人不同；下面的数值取不到就不成立，不要按岗位想象）',
    `员工：${emp.name || '—'}（${emp.empNo || '—'}）｜${emp.job || '—'}｜${emp.city || '—'} / ${emp.store || '—'}｜${emp.employType || '—'}｜入职 ${emp.onboardAt || '—'}`,
    `期望离职日期：${emp.expectDate || '—'}`
  ]
  FACT_LINES.forEach(([k, label, fmt]) => {
    const v = f[k]
    if (v == null) return
    lines.push(`${label}：${fmt(v)}`)
  })
  if (Array.isArray(f.assets)) lines.push(`在册资产：${f.assets.length ? f.assets.join('、') : '无'}`)
  if (Array.isArray(f.accounts)) lines.push(`持有系统账号：${f.accounts.length ? f.accounts.join('、') : '无'}`)
  lines.push(`需支付补偿：${yesNo(f.severance)}`)
  lines.push('角色解析口径：员工本人 = 这一单的人；店长 / 直属上级按门店解析；人事经理 / 城市总按城市解析；IT / 财务 / 大区总 / 总经理取总部固定责任人')
  return lines.join('\n')
}

/**
 * 实例期生成提示：这套提示词 + 这一单的事实 → 这一单的树。
 * 模型不是必需路径（规则生成器就能跑），但留在这里：换了模型实现不用改契约。
 *
 * 模板由 template.js 渲染（骨架 → 文本），不再在这里手拼 ——
 * 手拼的那份迟早与界面上展示的那份不一样，走查时会问「到底发给模型的是哪段」。
 */
export function buildGenerateMessages ({ prompt, emp, factsText }) {
  const parts = [
    '## 这套提示词（模板：口径 + 结构约束 + 必须交付的结论）',
    /* 与工作台展示的是同一个函数 —— 页面上看到的模板，就是这里发出去的 */
    renderTemplate(prompt || {}),
    '',
    '## 这一单的人与事实（只能用这些）',
    factsText || instanceFactsText(emp),
    '',
    '## 现在要做的',
    '按上面的事实判断每一条结论成立不成立：成立就生成一个子事件（一条结论 + 一个事项 + 一组字段），不成立就不要生成（不要为了流程完整补一条空的）。',
    '一个子事件只挂一个事项；要凭证的环节把附件字段写全（类型 = 附件、必传 = 是、写明格式）。',
    '只输出生成结果的 JSON：{ step: "generate", subs: [{ skeletonKey, goal, gate, deps, ways, ... }], dropped: [{ key, why }] }。'
  ]
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: parts.join('\n') }
  ]
}

/** 单条骨架在提示词里的说法（预览页用） */
export function needHintText (needs) {
  const list = Array.isArray(needs) ? needs : [needs]
  return list.includes('always') ? '人人都有' : list.join(' 且 ')
}
