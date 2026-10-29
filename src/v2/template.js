/**
 * 提示词模板：把「骨架」渲染成生成时整段喂给模型的那段文本。
 *
 * 为什么要这一层：
 *   · 骨架是给人审的清单，字段名、路径、附件要求这些细节它兜不住；
 *   · 模型需要的不是「一份 JSON」，而是「这件事必须交出什么、每条交几样东西、哪些要凭证」；
 *   · 两者本来是同一份数据的两种说法 —— 所以模板由骨架渲染，不另写一份（另写必然漂移）。
 *
 * 模板里有两段是写死的结构约束（不是这个事件的口径，是所有事件都这样）：
 *   1) 一个子事件 = 一条结论 = 一个事项
 *   2) 要凭证的环节，字段必须是附件且必传
 * 这两条是生成质量的地板 —— 少了它们，模型会把三件事塞进一个子事件，
 * 或者把「移交清单」写成备注，扫码走查时就变成「说办完了但没有凭证」。
 *
 * 渲染出来的文本同时用于：界面展示（这段就是生成时喂进去的）与 buildGenerateMessages。
 * 所见即所发 —— 页面上看到的模板改一个字，模型收到的就改一个字。
 */

import { ownerOfWay, ownerLabel, fieldTypeLabel } from './model.js'
import { needTextOf, pathSummary } from './skeleton.js'
import { actions, systemChecks } from './catalog.js'

/**
 * 结构约束：与具体事件无关，所有提示词共用。
 * 每条 = 一句规定 + 一句「为什么」+ 一句「写错长什么样」，模型对反例最敏感。
 */
export const TEMPLATE_RULES = [
  {
    key: 'one-sub-one-item',
    title: '一个子事件 = 一条结论 = 一个事项',
    body: [
      '每条结论只开一个子事件，一个子事件只挂一个事项。',
      '两个事项不等于一个事项拆两半：「交还工服」与「交还钥匙」是两条结论（各自要判定），就写两个子事件；',
      '「客户资料移交」只交一次东西，就写一条子事件、一个事项 —— 不要拆成「登记接收人」「附移交清单」两条，那是同一个事项里的两个字段。',
      '子事件的结论要带达成状态（已交接完毕 / 已签署 / 已销账）；写成「交接」「审核」「处理」不合格。'
    ].join('')
  },
  {
    key: 'proof-must-attach',
    title: '要凭证的环节，附件必须必传',
    body: [
      '凡是「台账要对得上、钱要能核、设备要验、协议要留档」的环节，都要一个附件字段：类型 = 附件，必传 = 是，并写明允许格式（PDF / JPG / PNG）。',
      '凭证不能写进备注，也不能默认给「选填」—— 能选填就等于没有：办完时谁都能不传，事后核不了账。',
      '确实只在某种情况下才存在的凭证（如补偿金为 0 时没有协议），把条件写进这条字段的规则里，不要笼统给一个选填的附件位。',
      '反过来，只在系统里改一个状态、没有东西要交的环节，不要硬造附件。'
    ].join('')
  },
  {
    key: 'fields-are-human-input',
    title: '字段只收人要填、要传的东西',
    body: '系统算出来的值（台账余额、判定结论、上游办结结果）是展示，不进字段；上游单据带过来的值写默认来源，不让人再填一遍。'
  },
  {
    key: 'difference-by-fact',
    title: '差异只来自事实',
    body: '某条结论成立不成立，由它的成立条件判定：条件不满足就不生成，不要为了「流程完整」补一条空壳；同一个人也不因为岗位想象多长几条。'
  },
  {
    key: 'review-is-conclusion',
    title: '审核是一条结论 + 人给结论，不是一种类型',
    body: [
      '传统审批不需要单独的节点类型、事件点，也不需要「审核」这个路径类型：它就是一条结论（×× 已审核通过）配一条人办路径，负责人就是审核人，审核意见只是事项里的一个文本字段。',
      '几级审核就写几条结论，用「需等」串成先后（城市总先、人事后，就是两条）；会签 = 几条结论同一前置、都要过。这样「审完没有」只看每条结论的达成状态，不靠节点数量猜。',
      '不要拆成「提交审核」「审核通过」两条 —— 那等于同一个环节占两个节点；也不要把结论写成「离职需求审核」「审批」「处理」，那是动作，判不出通过与否。'
    ].join('')
  },
  {
    key: 'who-does-decides-form',
    title: '谁做由提示词定，表单跟着谁做走',
    body: [
      '人做的结论：给事项字段，收他要交的东西；要凭证就给附件（必传 + 允许格式），只是核对就给意见 / 日期这类字段。不要为了「看起来正式」硬加一个审批意见框。',
      '系统做的结论：用系统判定 / 系统执行，没有人工表单，也不给意见字段 —— 系统项自己出结论、自己留批次与回执。',
      '一条结论只留一种兑现方式。要「系统失败再人工兜底」就写进这条系统项的重试出口，不要再并一条人办路径：多条路径是「或」，等于系统没成功、人点一下也算达成。'
    ].join('')
  },
  {
    key: 'receipt-has-fields',
    title: '等对方回话的结论，要写清回执认哪几个字段',
    body: [
      '签署、确认、接收这类由对方完成的结论，要写四样：谁动手、这次回执由哪个动作招来、回执里有哪些字段（含可能取值）、回执写回哪个结果字段。',
      '只写一句「员工签署状态」等于没有约定：下游引用不到，也判不出「已签署」。',
      '我方推送 / 通知拿到的回执只证明送达，不证明对方完成 —— 送达不能当签署结果用。'
    ].join('')
  },
  {
    key: 'skeleton-is-floor',
    title: '子事件是下限，不是上限',
    body: '必过的子事件一条都不能少；可以按岗位、按这一单的事实补细节与字段，但不能删、不能改口径。'
  }
]

/**
 * 骨架里人办路径写的是 role（不是 owner）—— 与生成器同一套归一，
 * 否则模板里会出现「路径：人给结论 · （按门店 / 城市解析）」这种缺主语的句子。
 */
const ownerOfPath = (w) => ownerOfWay({ ...w, owner: w.owner || (w.role ? { kind: 'role', role: w.role } : null) })

/** 一条路径的负责人说法（模板里给「谁给结论」，不展开到人名 —— 生成期还不知道是哪个门店） */
function ownerText (w) {
  const o = ownerOfPath(w)
  if (o.kind === 'person') return `指定 ${o.name || '未填人'}`
  const label = ownerLabel(o)
  return label ? `${label}（按门店 / 城市解析）` : '负责人未写'
}

/** 回执字段：数组 = 已约定字段；字符串 = 还没写成字段（旧写法，明说它引用不到） */
function receiptText (w) {
  const list = Array.isArray(w.receipt) ? w.receipt : []
  if (list.length) {
    return `回执：${list.map((r) => `${r.label}${(r.values || []).length ? `（${r.values.join(' / ')}）` : ''}`).join('、')}`
  }
  const legacy = typeof w.receipt === 'string' ? w.receipt.trim() : ''
  return legacy ? `回执：${legacy}（没有字段，下游引用不到）` : '回执字段未写'
}

/** 路径一行：人给结论 / 系统判定 / 系统执行 / 外部回执 */
function wayLine (w) {
  if (w.type === 'human') return `人给结论 · ${ownerText(w)}`
  if (w.type === 'system') {
    const c = systemChecks.find((x) => x.key === w.sysKey) || {}
    const f = w.fetch || {}
    return `系统判定 · ${c.name || w.sysKey} · 每 ${f.fetchFreq || c.defaultFetch?.freq || '1d'} 取一次 · 批次上限 ${f.maxRuns ?? c.defaultFetch?.maxRuns ?? 5}`
  }
  if (w.type === 'action') {
    const a = actions.find((x) => x.key === w.actionKey) || {}
    return `系统执行 · ${a.name || w.actionKey}${w.targets ? ` · 对 ${w.targets} 逐个执行` : ' · 整单执行一次'}`
  }
  const a = w.via ? actions.find((x) => x.key === w.via) : null
  return `外部回执 · ${w.party || '对方'}${a ? ` · 由「${a.name}」招来` : ' · 没说回执由哪个动作招来'}${w.timeout ? ` · ${w.timeout} 内回执` : ''} · ${receiptText(w)}${w.writeBack ? ` · 写回 ${w.writeBack}` : ' · 没写写回哪个字段'}`
}

/** 字段一行：名称（类型 · 必传/选填 · 格式 · 规则 · 默认来源） */
export function fieldText (f) {
  const bits = [fieldTypeLabel(f.type)]
  bits.push(f.required ? '必传' : '选填')
  if (f.type === 'file' && f.formats) bits.push(f.formats)
  if (f.rule) bits.push(f.rule)
  if (f.from) bits.push(`默认取 ${f.from}`)
  return `${f.label}（${bits.join(' · ')}）`
}

/** 这条结论所有要交的附件（模板里单列一行，模型漏附件时最容易被发现） */
export function proofFieldsOf (item) {
  return (item?.paths || [])
    .flatMap((w) => (w.items || []).flatMap((it) => it.fields || []))
    .filter((f) => f.type === 'file')
}

/** 骨架 → 模板正文（不含口径与规则） */
export function skeletonTextOf (ev) {
  const list = ev?.skeleton || []
  return list.map((s, i) => {
    const lines = [`${i + 1}. ${s.goal}｜成立条件：${needTextOf(s.needs, ev)}｜门禁：${s.gate === 'optional' ? '可选' : '必过'}`]
    ;(s.paths || []).forEach((w) => {
      lines.push(`   路径：${wayLine(w)}`)
      ;(w.items || []).forEach((it) => {
        lines.push(`   事项：${it.title} —— ${it.require}`)
        if ((it.fields || []).length) lines.push(`   字段：${it.fields.map(fieldText).join('｜')}`)
      })
    })
    const deps = (s.after || []).map((k) => (list.find((x) => x.key === k) || {}).goal || k)
    if (deps.length) lines.push(`   需等：${deps.join('、')}`)
    return lines.join('\n')
  }).join('\n')
}

/**
 * 首次生成快照：只留对账要用的四样（结论 / 门禁 / 路径 / 附件），不是整份骨架的副本。
 * 起草时存一次，之后界面靠它回答「哪几条是提示词给的、哪几条是后人加的、哪条被改了口径」。
 */
export function snapshotOfSkeleton (skeleton = []) {
  return skeleton.map((s) => ({
    key: s.key,
    goal: s.goal,
    gate: s.gate,
    path: pathSummary(s),
    proofs: proofFieldsOf(s).map((f) => f.label)
  }))
}

/**
 * 完整模板：口径（人写）+ 结构约束（写死）+ 粒度示例 + 必须交付的结论。
 * 这一段就是生成时喂给模型的全部业务侧内容 —— 界面上展示的、实际发送的是同一个函数产物。
 */
export function renderTemplate (ev = {}) {
  const sk = ev.skeleton || []
  const must = sk.filter((s) => s.gate !== 'optional').length
  const rules = TEMPLATE_RULES.map((r, i) => `${i + 1}. ${r.title}\n   ${r.body}`).join('\n')
  return [
    `# ${ev.name || '这件事'}（一套提示词）`,
    '',
    '## 这件事的口径（人写，按它做）',
    (ev.body || '').trim() || '（还没写口径）',
    '',
    '## 结构约束（所有事件都一样，违反即不合格）',
    rules,
    '',
    '## 照这个粒度写',
    '子事件：客户资料已交接完毕｜必过｜负责人 店长',
    '事项：客户资料移交 —— 员工本人把在跟客户逐个交接，店长登记接收人并核对移交清单',
    '字段：客户姓名（文本 · 必传）｜接收人（人员 · 必传）｜移交清单（附件 · 必传 · PDF / JPG / PNG）',
    '审核①：城市总已审核通过｜必过｜城市总｜需等：无｜字段：期望离职日期（日期 · 必传）｜实际离职日期（日期 · 必传）｜审核意见（多行文本）',
    '审核②：人事已审核通过｜必过｜人事经理｜需等：城市总已审核通过｜字段：款项出口（单选 · 必传：一次性补偿金 / 并入薪金）｜审核意见（多行文本）',
    '回执：离职合同已完成签署｜必过｜电子签平台 · 由「推送电子合同」招来 · 回执 员工签署状态（已签署 / 已拒签 / 待签署）· 写回 signState',
    '',
    `## 子事件（${sk.length} 条 · 必过 ${must} 条 · 少一条即不合格）`,
    sk.length ? skeletonTextOf(ev) : '（还没有子事件，先加上去）'
  ].join('\n')
}
