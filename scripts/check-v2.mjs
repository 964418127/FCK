/**
 * v2 评审稿逻辑回归：按人生成 / 骨架下限 / 树结构 / 实例推进
 * 跑法：node scripts/check-v2.mjs
 *
 * 这一版最重要的三条性质：
 *   ① 同样一套提示词，不同的人长出不同的树 —— 差异只由事实决定
 *   ② 骨架是下限：必办项缺一条即不合格，不适用的生成了只提醒
 *   ③ 生成是确定性的：同骨架 + 同事实 → 同一棵树（可解释、可回归）
 */
import { resignPrompt, previewPeople, systemChecks, actions } from '../src/v2/seed.js'
import { composeFor, checkGenerated, degradedTree } from '../src/v2/blueprint.js'
import {
  needOk, skeletonOf, NEEDS, NEED_LABEL, NEED_ABSENT,
  BASE_NEEDS, RESIGN_FACTS, needsOf, unknownNeedsOf
} from '../src/v2/skeleton.js'
import { validateTree, validateEvent, validateSkeleton } from '../src/v2/validate.js'
import { layersOf, topoSort, ownerOfWay, resolveOwner } from '../src/v2/model.js'
import { CONTRACT, renderSystemPrompt } from '../src/v2/contract.js'
import { designFactsText, instanceFactsText, buildGenerateMessages, buildAskMessages } from '../src/v2/prompt.js'
import { renderTemplate } from '../src/v2/template.js'
import { todoOf, depsMet, progressOf, canHandle, formOf } from '../src/v2/instance.js'
import { runReceipt } from '../src/v2/sysRun.js'
import { createInstance, submitInstanceSub, resolveForInstance, addInstanceSub, removeInstanceSub, updateInstanceSub, subLocked, getEvent, v2state } from '../src/v2/store.js'
import { factsOfPerson, staffById } from '../src/v2/base.js'
import { eventPoints, eventPointFields } from '../src/v2/points.js'
import {
  payloadPlanOf, checkPayload, normalizePayloadMap, unknownPayloadOf,
  keepKnownPayload, empNoOfPayload, payloadDefaultsOf
} from '../src/v2/payload.js'

let fail = 0
const ok = (cond, msg) => {
  if (cond) console.log('  ✓', msg)
  else { console.log('  ✗', msg); fail++ }
}
const section = (t) => console.log(`\n${t}`)

const checks = systemChecks
const [tuina, dianzhang, cityhead] = previewPeople
const gen = (p) => composeFor({ prompt: resignPrompt, emp: p })

/* ---------------- 1. 按人生成 ---------------- */
section('1. 同一套提示词，按人长出不同的树')
const A = gen(tuina)
const B = gen(dianzhang)
const C = gen(cityhead)
const ids = (r) => new Set(r.tree.map((s) => s.id))
console.log(`   推拿师 ${A.tree.length} 条 / 店长 ${B.tree.length} 条 / 城市总 ${C.tree.length} 条`)
ok(A.tree.length !== B.tree.length, '不同的人条数不同（推拿师 vs 店长）')
ok(!ids(A).has('se.handover.team'), '推拿师没有团队 → 不长团队交接')
ok(ids(B).has('se.handover.team'), '店长带 5 个人 → 长出团队交接')
ok(!ids(A).has('se.cash') && ids(B).has('se.cash'), '只有管备用金的店长才有现金结清')
ok(!ids(C).has('se.handover.client') && ids(C).has('se.handover.team'), '城市总没有在跟客户、但有团队')
ok(ids(C).has('se.compensation') && !ids(A).has('se.compensation'), '只有需支付补偿的人才有补偿金确认')
ok(A.dropped.every((d) => d.key && d.goal && d.needs), '被裁掉的每一条都记了目标与「缺什么事实」')
ok(NEEDS.filter((n) => n.key !== 'always').every((n) => NEED_ABSENT[n.key] && NEED_ABSENT[n.key] !== NEED_LABEL[n.key]), '每种事实都有「这一单没有」的说法，能解释为什么不长')

/* ---------------- 1b. 事实词表：基础表 + 事件扩展 ---------------- */
section('1b. 事实词表不写死在一件事上')
ok(!BASE_NEEDS.some((n) => ['severance', 'complaint', 'aacb'].includes(n.key)), '补偿 / 客诉 / AACB 这类离职口径的事实不在基础表里')
ok(RESIGN_FACTS.some((n) => n.key === 'severance') && RESIGN_FACTS.some((n) => n.key === 'aacb'), '离职把它们声明成自己的扩展事实')
ok(needsOf(resignPrompt).length === BASE_NEEDS.length + RESIGN_FACTS.length, `离职可用事实 = 基础 ${BASE_NEEDS.length} + 扩展 ${RESIGN_FACTS.length}`)
ok(needsOf({ facts: [] }).every((n) => n.key !== 'severance'), '不声明就取不到：另一件事拿不到离职的扩展事实')
ok(
  needsOf({ facts: [{ key: 'crossCity', label: '跨城', absent: '同城' }] }).some((n) => n.key === 'crossCity'),
  '换一件事（调店调岗）可以声明自己的事实，机制不用改'
)
ok(unknownNeedsOf([{ key: 'x', needs: 'severance' }], { facts: [] }).length === 1, '用了没声明的事实会被点出来')
const badNeeds = checkGenerated({
  tree: [],
  prompt: { skeleton: [{ key: 'k', goal: '随便一条', needs: 'nope' }], facts: [] },
  facts: {}
})
ok(!badNeeds.ok && badNeeds.errors.some((e) => e.code === 'NEEDS_UNKNOWN'), '生成自检也报「事实未声明」，不让它静默消失')
ok(
  CONTRACT.enums.needsBase.includes('clients') && !CONTRACT.enums.needsBase.includes('severance'),
  '契约里基础表与事件扩展是分开登记的'
)

/* ---------------- 2. 骨架是下限 ---------------- */
section('2. 骨架：必办不漏、不适用不长')
const sk = skeletonOf(resignPrompt)
sk.forEach((item) => {
  const should = needOk(item.needs, tuina.facts)
  const got = A.tree.some((s) => s.skeletonKey === item.key)
  if (should !== got) console.log(`  ✗ 骨架「${item.goal}」应${should ? '存在' : '不存在'}`)
})
ok(sk.filter((i) => i.gate === 'must' && needOk(i.needs, tuina.facts)).every((i) => ids(A).has(`se.${i.key}`)), '张三这单：所有成立的必办项都在树里')
ok(A.check.ok && B.check.ok && C.check.ok, '三个人生成后自检都通过')

const missing = A.tree.filter((s) => s.skeletonKey !== 'goods')
const missCheck = checkGenerated({ tree: missing, prompt: resignPrompt, facts: tuina.facts })
ok(missCheck.errors.some((e) => e.code === 'SKELETON_MISSING' && e.key === 'goods'), '必办项被删 → 报缺项错误')

const extra = [...A.tree, { ...A.tree.find((s) => s.skeletonKey === 'review'), id: 'se.cash', skeletonKey: 'cash', goal: '备用金已结清' }]
const extraCheck = checkGenerated({ tree: extra, prompt: resignPrompt, facts: tuina.facts })
ok(extraCheck.ok && extraCheck.warnings.some((w) => w.code === 'SKELETON_EXTRA'), '不适用却生成了 → 只提醒，不拦')

const degraded = degradedTree({ prompt: resignPrompt, emp: tuina })
ok(degraded.tree.every((s) => s.gate !== 'optional'), '降级生成只留必办项')

/* ---------------- 3. 确定性 ---------------- */
section('3. 生成是确定性的')
ok(JSON.stringify(gen(tuina).tree) === JSON.stringify(gen(tuina).tree), '同样的骨架 + 同样的事实 → 同一棵树（逐字节相同）')
ok(JSON.stringify(gen(tuina).tree) !== JSON.stringify(gen(dianzhang).tree), '换一个人 → 换一棵树（差异来自事实，不是随机）')

/* ---------------- 4. 结构与位次 ---------------- */
section('4. 树结构：起点唯一、依赖不悬空、层号正确')
ok(A.tree.filter((s) => (s.deps || []).length === 0).length === 1, '只有一个起点（审核），交接都在它下游')
ok(A.tree.find((s) => s.id === 'se.review.city').deps.length === 0, '起点是「城市总已审核通过」')
let dangling = 0
A.tree.forEach((s) => {
  ;(s.deps || []).forEach((d) => {
    ;(Array.isArray(d) ? d : [d]).forEach((x) => { if (!ids(A).has(x)) dangling++ })
  })
})
ok(dangling === 0, '所有依赖都指向树里存在的节点（被裁掉的前置已跳过）')
ok(ids(A).has('se.debt.check'), '张三有 320 借款 → 长出「财务台账侧无未结清负债」')
ok(!ids(B).has('se.debt.check'), '刘丹没有欠款 → 这一条根本不长')
ok(A.tree.find((s) => s.id === 'se.interview').deps.includes('se.account.recover'), '离职面谈挂在账号回收之后')
ok(A.tree.find((s) => s.id === 'se.account.recover').deps.includes('se.asset.check'), '账号回收挂在资产销账之后')

const lv = layersOf(A.tree)
ok(lv['se.review.city'] === 0 && lv['se.review'] === 1, '第一条审核在第 1 层，第二条在第 2 层')
ok(lv['se.interview'] > lv['se.account.recover'], '面谈排在账号回收之后')
const orTree = [
  { id: 'se.a', goal: 'A', deps: [], ways: [] },
  { id: 'se.b', goal: 'B', deps: [], ways: [] },
  { id: 'se.c', goal: 'C', deps: [['se.a', 'se.b']], ways: [] }
]
ok(layersOf(orTree)['se.c'] === 1, '或组：任一前置办结即可 → 层取早的那个')
const andTree = [
  { id: 'se.a', goal: 'A', deps: [], ways: [] },
  { id: 'se.b', goal: 'B', deps: [], ways: [] },
  { id: 'se.c', goal: 'C', deps: ['se.a'], ways: [] },
  { id: 'se.d', goal: 'D', deps: ['se.c', 'se.b'], ways: [] }
]
ok(layersOf(andTree)['se.d'] === 2, '组间是「且」：层取最晚的那个')
ok(topoSort(A.tree)[0].id === 'se.review.city', '排序按层升序，起点在最前')

/* ---------------- 5. 校验器 ---------------- */
section('5. 校验')
const v0 = validateTree(A.tree, { checks, actions, event: resignPrompt })
console.log('   issues:', v0.map((i) => i.code).join(', ') || '(none)')
ok(!v0.some((i) => i.level === 'error'), '生成出来的树没有结构性错误')
ok(validateEvent(resignPrompt).every((i) => i.level !== 'error'), '事件级校验通过（适用范围 + 触点）')
const noGoal = validateTree([{ id: 'se.x', goal: '', gate: 'must', deps: [], ways: [{ type: 'human', owner: { kind: 'role', role: 'hr' }, items: [{ id: 'it.x', title: '事项', require: '口径', fields: [] }] }] }], { checks, actions })
ok(noGoal.some((i) => i.code === 'SUB_NO_GOAL'), '没有结论 → 错误')
const badOwner = validateTree([{ id: 'se.y', goal: '某事已完成', gate: 'must', deps: [], ways: [{ type: 'human', items: [{ id: 'it.y', title: '事项', require: '口径', fields: [] }] }] }], { checks, actions })
ok(badOwner.some((i) => i.code === 'OWNER_MISSING'), '没写负责人 → 错误')

/* ---------------- 6. 负责人与可见性 ---------------- */
section('6. 负责人：核对并填结果的人')
/** 触发一个事件要带载荷：缺必传会被拒单，所以每处都按登记字段给齐 */
const payOf = (emp = {}) => ({
  applyNo: `RQ-${emp.empNo || emp.id || 'X'}`,
  empId: emp.empNo || emp.id || 'T00676',
  expectDate: '2026-11-30',
  reason: '工资太低、离家太远'
})
const ho = A.tree.find((s) => s.skeletonKey === 'handover.client')
ok(ownerOfWay(ho.ways[0]).kind === 'role' && ownerOfWay(ho.ways[0]).role === 'store-manager', '客户交接的负责人是店长（核对签收的人）')
ok((ho.ways[0].items || []).some((it) => (it.require || '').includes('员工本人')), '动手的人是员工本人：写在完成口径里，不占字段')
const compSub = C.tree.find((s) => s.skeletonKey === 'compensation')
ok(ownerOfWay(compSub.ways[0]).kind === 'person' && resolveOwner(ownerOfWay(compSub.ways[0])) === '周芸', '指定的人：负责人就是他本人，不按门店城市解析')
ok(resolveOwner({ kind: 'role', role: 'hr' }, { city: '杭州' }) === '李文静', '角色的负责人仍按城市解析到人')

const inst0 = createInstance({ eventKey: 'resign', emp: tuina, payload: payOf(tuina) })
const mgr = { name: '刘丹', job: '店长', store: '上海徐汇店', city: '上海' }
const hoInst = inst0.tree.find((s) => s.skeletonKey === 'handover.client')
ok(canHandle(hoInst, inst0, mgr) === true, '角色负责人：该角色的人能看见、能办')
ok(canHandle(hoInst, inst0, { name: '路人甲' }) === false, '不相干的人不能办')

/* 张三比别人多一步：加的是「挂在事实上的一条骨架」，不是给这个人配流程 */
const aacb = A.tree.find((s) => s.skeletonKey === 'handover.aacb')
ok(!!aacb && aacb.gate === 'must', '张三持有 AACB → 长出「AACB 已交还并验收」，且是必过')
ok(JSON.stringify(aacb.deps).includes('se.review'), '它排在「离职需求已审核通过」之后（after: review）')
ok(resolveOwner(ownerOfWay(aacb.ways[0]), { store: '上海徐汇店', city: '上海' }) === '刘丹', '验收人写角色、按这一单的门店解析到刘丹，不写死人名')
ok(!B.tree.some((s) => s.skeletonKey === 'handover.aacb') && !C.tree.some((s) => s.skeletonKey === 'handover.aacb'), '没持有 AACB 的人不长这一条：差异只来自事实')
const acA = A.tree.find((s) => s.skeletonKey === 'asset.check')
const acB = B.tree.find((s) => s.skeletonKey === 'asset.check')
ok(JSON.stringify(acA.deps).includes('se.handover.aacb'), '资产销账等 AACB 交还（同一份骨架，人不同排法就不同）')
ok(!JSON.stringify(acB.deps).includes('aacb'), '店长那单没有这一项，前置自动跳过、不留悬空')
ok(factsOfPerson(staffById('T00676')).aacb === true, '事实由台账派生：名下资产里有 AACB，事实就成立，不用单独配')

/* ---------------- 7. 岗位细化 ---------------- */
section('7. 表单按岗位细化')
const goodsA = A.tree.find((s) => s.skeletonKey === 'goods').ways[0].items[0]
const goodsB = B.tree.find((s) => s.skeletonKey === 'goods').ways[0].items[0]
console.log(`   推拿师：${goodsA.require}`)
console.log(`   店长：${goodsB.require}`)
ok(goodsA.require.includes('按摩床') && goodsB.require.includes('钥匙'), '同一个结论按岗位给不同的归还口径')
ok(goodsB.fields.some((f) => f.key === 'stampNo') && !goodsA.fields.some((f) => f.key === 'stampNo'), '店长的物品归还要多交印章编号')

/* ---------------- 8. 实例 ---------------- */
section('8. 实例：开单即生成，办一步推进一格')
ok(inst0.state === 'running', '开单后直接进入流转（生成是同步的）')
ok(inst0.tree.length === A.tree.length, '实例带着自己那棵树，与预览一致')
ok(inst0.gen.kept === A.tree.length && inst0.gen.ok, '生成记录写了保留条数与自检结果')
ok(resolveForInstance(inst0).tree === inst0.tree, '取这一单的树就是开单时生成的那一份')

const reviewCity = inst0.tree.find((s) => s.skeletonKey === 'review.city')
const review = inst0.tree.find((s) => s.skeletonKey === 'review')
ok(todoOf(inst0, inst0.tree).some((s) => s.id === reviewCity.id), '第一关（城市总）是第一个待办')
ok(!todoOf(inst0, inst0.tree).some((s) => s.id === review.id), '人事那条还没轮到：它等城市总那条')
const second = inst0.tree.find((s) => s.skeletonKey === 'goods')
ok(!depsMet(second, inst0), '两道审核都没办，物品归还办不了')
submitInstanceSub(inst0.id, reviewCity.id, { verdict: '通过', by: '冯海霞' })
ok(todoOf(inst0, inst0.tree).some((s) => s.id === review.id), '城市总过了才轮到人事那条')
ok(!depsMet(second, inst0), '只过了城市总，物品归还还是办不了')
submitInstanceSub(inst0.id, review.id, { verdict: '通过', by: '邓黎英' })
ok(depsMet(second, inst0), '两条审核都过了，物品归还才能办')
ok(progressOf(inst0, inst0.tree).done >= 1, '进度至少 1 条')

const mustSub = inst0.tree.find((s) => s.skeletonKey === 'goods')
submitInstanceSub(inst0.id, mustSub.id, { verdict: '未通过' })
ok(inst0.state === 'terminated', '必过项未通过 → 终止全部流程')

/* ---------------- 8b. 中期调整：这一单的树可以改，已办结的锁住 ---------------- */
section('8b. 中期调整：改这一单，不动定义与别人')
const inst1 = createInstance({ eventKey: 'resign', emp: tuina, payload: payOf(tuina) })
const before = inst1.tree.length
const genKeptBefore = inst1.gen.kept
const added = addInstanceSub(inst1.id, { goal: '门店钥匙已交回并登记' })
ok(inst1.tree.length === before + 1, '加一条：只加在这一单上')
ok(!(added.deps || []).length, '新加的一条默认没有前置')
ok(depsMet(added, inst1), '没有前置，加完就能办')
ok((inst1.adjusts || []).length === 1 && inst1.adjusts[0].text.includes('门店钥匙'), '加一条写了留痕')
ok(inst1.gen.kept === genKeptBefore, '生成记录不因调整而改写：生成是当时那一份，调整另记')

updateInstanceSub(inst1.id, added.id, { goal: '门店钥匙与门禁卡已交回并登记' })
ok(inst1.tree.find((s) => s.id === added.id).goal.includes('门禁卡'), '改结论：改的是这一单这一条')
ok(inst1.adjusts.length === 2, '改一条也写了留痕')

const rev1 = inst1.tree.find((s) => s.skeletonKey === 'review')
submitInstanceSub(inst1.id, rev1.id, { verdict: '通过', by: '邓黎英' })
ok(subLocked(inst1, rev1.id), '办结之后这一环锁住')
const refusedDel = removeInstanceSub(inst1.id, rev1.id)
ok(refusedDel?.refused && inst1.tree.some((s) => s.id === rev1.id), '已办结的不许删：它是事实')
const refusedEdit = updateInstanceSub(inst1.id, rev1.id, { goal: '想改掉它' })
ok(refusedEdit?.refused, '已办结的也不许改结论 / 门禁 / 前置')
ok(updateInstanceSub(inst1.id, rev1.id, { biz: '补一句说明' }).refused === undefined, '已办结的仍可以改说明')

const goods1 = inst1.tree.find((s) => s.skeletonKey === 'goods')
const asset1 = inst1.tree.find((s) => s.skeletonKey === 'asset.check')
ok(JSON.stringify(asset1.deps).includes(goods1.id), '删之前：资产销账等着物品归还')
removeInstanceSub(inst1.id, goods1.id)
ok(!inst1.tree.some((s) => s.id === goods1.id), '删一条：从这一单的树里摘掉')
ok(!JSON.stringify(inst1.tree.find((s) => s.skeletonKey === 'asset.check').deps).includes(goods1.id), '删了之后：指向它的前置一起摘掉，不留悬空')
ok(!inst1.subs[goods1.id], '删掉的环节不再留状态垃圾')

/* ---------------- 8c. 触发前取数：引擎内置，不进骨架、不在树上、不可调整 ---------------- */
section('8c. 触发前取数：所有事件天然跑，不是可配的一步')
const inst2 = createInstance({ eventKey: 'resign', emp: tuina, payload: payOf(tuina) })
ok(!!inst2.intake && inst2.intake.ok, '触发时自动跑了取数')
ok(inst2.intake.steps.length === 2 && inst2.intake.steps[0].key === 'staff' && inst2.intake.steps[1].key === 'facts', '固定两步：先员工档案，再逐人事实')
ok(inst2.intake.steps.every((s) => s.query && s.result && s.at), '每一步都留了「按什么查、取回什么、什么时候」')
ok(!!inst2.emp.facts && Object.keys(inst2.emp.facts).length > 0, '事实由取数带回，调用方不用自己算')
ok(inst2.gen.factsFrom === 'intake', '生成记录写明事实来自取数')
ok(!inst2.tree.some((s) => /intake|员工档案|逐人事实/.test(s.id + s.goal + (s.skeletonKey || ''))), '取数不出现在树上：它不给结论、没有承担者')
const sk2 = skeletonOf(getEvent('resign'))
ok(!sk2.some((s) => /intake|员工档案/.test(s.key + s.goal)), '取数不进骨架：骨架是结论清单，取数是生成它的输入')
ok(!CONTRACT.enums.needs.some((n) => n.key === 'intake'), '取数不是一种事实')
const noProfile = createInstance({ eventKey: 'resign', emp: { name: '', job: '', store: '' }, payload: payOf({ empNo: 'T99999' }) })
ok(noProfile?.refused === true && /工号|档案/.test(noProfile.why), '档案取不到 → 触发不成立（不知道人是谁，树没有依据）')
ok(!v2state.instances.some((i) => i === noProfile), '失败的触发不留下空单')
ok(inst2.intake.at <= inst2.gen.at.slice(-5) || inst2.intake.at === inst2.gen.at.slice(-5), '取数时间不晚于生成时间')

/* ---------------- 9. 契约 ---------------- */
section('9. 契约 v3.9：定义期没有树，审核与回执有规范')
ok(CONTRACT.version === 'v3.9', `版本 ${CONTRACT.version}`)
ok(!CONTRACT.enums.wayTypes.some((t) => t.key === 'review'), '路径类型里没有「审核」：审核就是人给结论')
ok(CONTRACT.objects.some((o) => o.key === 'skeleton'), '新增 skeleton 对象')
ok(CONTRACT.enums.needs.length >= 8, `needs 词表 ${CONTRACT.enums.needs.length} 项`)
ok(!!CONTRACT.io.compose.skeleton && !CONTRACT.io.compose.subs, 'compose 输出骨架，不再输出子事件树')
ok(CONTRACT.invariants.some((i) => i.key === 'skeleton-floor'), '不变式：骨架是生成的下限')
ok(CONTRACT.invariants.some((i) => i.key === 'generated-per-instance'), '不变式：每单一棵树，不是定义的副本')
ok(CONTRACT.objects.some((o) => o.key === 'intake' && o.exposeToModel === false), '契约登记了 intake（引擎内置，不交给模型生成）')
ok(CONTRACT.invariants.some((i) => i.key === 'intake-builtin'), '不变式：取数是引擎内置的一层，不进骨架、不在树上、不可调整')
ok(CONTRACT.invariants.some((i) => i.key === 'difference-by-fact'), '不变式：差异只来自事实')
ok(CONTRACT.objects.some((o) => o.key === 'eventPoint' && o.exposeToModel === false), '契约登记了事件点（对岸注册，我方只读）')
ok(CONTRACT.invariants.some((i) => i.key === 'payload-registered'), '不变式：载荷形状由登记决定，缺必传即拒单')
ok(CONTRACT.invariants.some((i) => i.key === 'payload-value-only'), '不变式：载荷只参与值，不参与结构')
ok(CONTRACT.enums.payloadUse.map((u) => u.key).join(',') === 'intake,show,bind', '载荷用途三种：取数入参 / 实例回看 / 预填子事件')
ok(!CONTRACT.enums.fieldTypes.includes('ref'), '关联引用已移除：字段只收人要交的东西')
const prompt = renderSystemPrompt(CONTRACT)
ok(prompt.includes('骨架'), '系统提示词里能看到骨架这一段')

/* ---------------- 10. 事实与提示词 ---------------- */
section('10. 事实：定义期不查人，实例期才有逐人数值')
const df = designFactsText()
ok(!/张三|郑一鸣|杨春燕/.test(df), '定义期事实不含任何具体员工')
ok(df.includes('角色解析口径'), '定义期事实给了角色解析口径')
const inf = instanceFactsText(tuina)
ok(inf.includes('推拿师') && inf.includes('在跟客户：4 人'), '实例期事实带这一单的人与逐人数值')
const msgs = buildGenerateMessages({ prompt: resignPrompt, emp: tuina })
const userMsg = msgs[1].content
ok(userMsg.includes('## 子事件') && userMsg.includes('在跟客户：4 人'), '生成提示里有子事件这一段与这一单的事实')

/* ---------------- 11. 载荷：登记 / 映射 / 值 ---------------- */
section('11. 载荷：登记定形状，映射定用途，值只管这一单')
ok(eventPoints.every((p) => p.payload.every((f) => f.key && f.label && f.type)), '每个事件点的字段都带 key / 中文名 / 类型')
ok(eventPointFields('resign.apply.submitted').every((f) => typeof f.required === 'boolean'), '每格都标了必不必传（页面不再靠字段名猜）')
const plan = payloadPlanOf(resignPrompt.trigger)
ok(plan.length === 5, `离职发起只用了登记里的 5 格（${plan.map((f) => f.key).join(' / ')}）`)
ok(!eventPointFields('resign.apply.submitted').some((f) => /^(bean|comp|bank)/.test(f.key)), '常乐豆 / 补偿 / 收款账户不在发起登记里：它们是审核环节才产生的值与成本中心数据')
ok(plan.find((f) => f.key === 'empId')?.use === 'intake', '工号是取数入参（type 与必传取自登记，不由事件重写）')
ok(plan.find((f) => f.key === 'expectDate')?.type === 'date' && plan.find((f) => f.key === 'expectDate')?.required, '期望离职日期沿用登记的 date + 必传')
ok(plan.find((f) => f.key === 'reason')?.options?.includes('工资太低'), '离职原因的可选值来自登记（v1 同款，可多选），不再写死在页面')

const norm = normalizePayloadMap([{ field: '员工工号' }, { field: 'invented' }, { field: 'reason', use: 'bind' }], 'resign.apply.submitted')
ok(norm.length === 2 && norm.every((x) => x.field !== 'invented'), '中文名能对上登记、自造的 key 一律剔掉（对岸不会发）')
ok(norm.find((x) => x.field === 'empId')?.use === 'intake', '没写用途时按登记意图给默认：工号 → 取数入参')
ok(unknownPayloadOf({ eventPoint: 'resign.apply.submitted', payload: [{ field: 'ghost' }] }).includes('ghost'), '写了没登记的键会被点出来（定义期就报，不等触发）')

const bad = checkPayload(resignPrompt.trigger, { applyNo: 'R-1', empId: 'T00676' })
ok(!bad.ok && bad.missing.includes('期望离职日期'), '缺必传 → 拒单，且指明缺哪一格')
ok(!checkPayload(resignPrompt.trigger, { ...payOf(tuina), expectDate: '2026/11/30' }).ok, '日期格式不对 → 拒单')
ok(!checkPayload(resignPrompt.trigger, { ...payOf(tuina), reason: '想走' }).ok, '值不在登记的可选范围内 → 拒单')
const refused = createInstance({ eventKey: 'resign', emp: tuina, payload: { applyNo: 'R-1', empId: 'T00676' } })
ok(refused.refused === true && /期望离职日期/.test(refused.why), '触发时按同一条规则拒单，不留半张单')
ok(empNoOfPayload(resignPrompt.trigger, { empId: 'T00676' }) === 'T00676', '引擎按登记的工号那一格去取档案')

const defs = payloadDefaultsOf(resignPrompt.trigger, { id: 'T00676' })
ok(defs.empId === 'T00676' && /^\d{4}-\d{2}-\d{2}$/.test(defs.expectDate), '能自动带的先带上：工号取身份，日期按登记的默认值（页面不再硬编码 30 天）')

const only = keepKnownPayload(resignPrompt.trigger, { ...payOf(tuina), extra: '多发的东西' })
ok(!('extra' in only), '对岸多发的字段不落库，免得下游误用')

/* 预填：bind 的字段真的落到了子事件的事项字段上 */
const reviewSub0 = inst0.tree.find((s) => s.skeletonKey === 'review.city')
const reviewFields = (reviewSub0.ways[0].items || []).flatMap((it) => it.fields || [])
ok(reviewFields.find((f) => f.key === 'expectDate')?.prefill === '2026-11-30', '期望日期预填到「城市总审核」那一格，审核人核对或改')
const reasonPrefill = reviewFields.find((f) => f.key === 'reason')?.prefill
ok(Array.isArray(reasonPrefill) && reasonPrefill.join('、') === '工资太低、离家太远', '离职原因同样预填（多选落成数组：参预后续子事件，不只是展示）')
ok(reviewFields.find((f) => f.key === 'reviewNote')?.prefill === undefined, '没写 from 的字段不会被载荷污染')

/* 边界：载荷只参与值，不参与结构 —— 同一个人换一张申请单，树必须一模一样 */
const shape1 = JSON.stringify(createInstance({ eventKey: 'resign', emp: tuina, payload: payOf(tuina) }).tree.map((s) => [s.id, s.deps, s.gate]))
const shape2 = JSON.stringify(createInstance({ eventKey: 'resign', emp: tuina, payload: { ...payOf(tuina), expectDate: '2027-03-01', reason: '结婚生子' } }).tree.map((s) => [s.id, s.deps, s.gate]))
ok(shape1 === shape2, '换一张申请单（日期 / 原因不同）→ 树的形状一条不差：差异只来自事实')

/* ---------------- 提示词模板：骨架 → 生成时那段文本 ----------------
 * 模板不是给人看的说明，它就是要发给模型的那段；两条结构约束必须在里面，
 * 否则「一个子事件一个事项」「要凭证必传附件」只是口头约定。
 */
const tpl = renderTemplate(resignPrompt)
ok(tpl.includes('一个子事件 = 一条结论 = 一个事项'), '模板里写明「一个子事件 = 一条结论 = 一个事项」')
ok(tpl.includes('附件') && tpl.includes('必传 = 是'), '模板里写明要凭证的环节附件必传、并写允许格式')
ok(tpl.includes('移交清单（附件 · 必传 · PDF / JPG / PNG）'), '骨架里的附件要求渲染成字段（含格式），不是一句话带过')
const genMsgs = buildGenerateMessages({ prompt: resignPrompt, emp: previewPeople[0] })
ok(genMsgs[1].content.includes(tpl), '生成时用的就是这段模板（所见即所发），不另拼一份')

/* 结构约束真的在校验：一条结论挂两个事项 → 不合格 */
const pv0 = composeFor({ prompt: resignPrompt, emp: previewPeople[0] })
const hacked = pv0.tree.map((s) => {
  if (s.skeletonKey !== 'handover.client') return s
  const w = s.ways[0]
  return { ...s, ways: [{ ...w, items: [...w.items, { ...w.items[0], id: 'it.extra' }] }] }
})
const hackCheck = checkGenerated({ tree: hacked, prompt: resignPrompt, facts: previewPeople[0].facts })
ok(!hackCheck.ok && hackCheck.errors.some((e) => e.code === 'ITEM_MANY'), '一条结论挂两个事项 → 判定不合格（与模板同一条判据）')

/* 首次生成快照：起草那一次产出的清单留档，之后加的要能对出来 */
const g0 = resignPrompt.firstGen.items
const g0Added = resignPrompt.skeleton.filter((s) => !g0.some((x) => x.key === s.key)).length
const g0Edited = resignPrompt.skeleton.filter((s) => {
  const x = g0.find((y) => y.key === s.key)
  return x && x.goal !== s.goal
}).length
ok(g0.length === 17 && g0Added === 4 && g0Edited === 2, '首次生成留了快照：17 条 → 现 21 条（后加 4、改过 2）')

/* ---------------- 12. 审核与回执：两个最容易「说不清」的地方 ---------------- */
section('12. 审核是一条结论，回执要有字段')

/* 审核：不是节点，是一条带达成状态的结论 —— 口径里不许再出现「从审核通过开始」 */
ok(/审核不是节点，也不是路径类型/.test(CONTRACT.discipline.join('\n')), '契约纪律写清「审核不是节点，也不是路径类型」')
ok(tpl.includes('审核是一条结论 + 人给结论，不是一种类型'), '模板里有这条结构约束（与契约同源）')
ok(!/从离职需求审核通过开始/.test(resignPrompt.body), '口径不再写「从审核通过开始」—— 触发的是提交，第一条结论才是审核通过')
const reviewCitySk = resignPrompt.skeleton.find((s) => s.key === 'review.city')
const reviewSk = resignPrompt.skeleton.find((s) => s.key === 'review')
ok(reviewCitySk.goal.includes('已审核通过') && !reviewCitySk.after.length, '第一关是结论（带达成状态），前面直接接触发')
ok(reviewSk.after.includes('review.city'), '第二关等第一关：两级审核 = 两条结论 + 前置')
ok(resignPrompt.skeleton.filter((s) => /审核通过/.test(s.goal)).length === 2, '两级审核就是两条结论，不拆成「审核」+「通过」四条')

/* 审核写成动作（「离职需求审核」）要判不合格 */
const actGoal = pv0.tree.map((s) => (s.skeletonKey === 'review' ? { ...s, goal: '离职需求审核' } : s))
const actGoalCheck = checkGenerated({ tree: actGoal, prompt: resignPrompt, facts: previewPeople[0].facts })
ok(actGoalCheck.errors.some((e) => e.code === 'GOAL_IS_ACTION'), '审核写成动作 → 判定不合格')

/* 回执：字段清单 + 写回 + 能取到值 */
const signSk = resignPrompt.skeleton.find((s) => s.key === 'sign')
const signW = signSk.paths.find((p) => p.type === 'external')
ok(Array.isArray(signW.receipt) && signW.receipt.some((r) => r.key === 'signState'), '签署回执是字段清单（含 signState）')
ok(signW.writeBack === 'signState' && signW.via === 'act.pushContract', '回执写了写回字段与招来它的动作')
const signSub = pv0.tree.find((s) => s.skeletonKey === 'sign')
const signSt = { state: 'running', records: {} }
runReceipt(inst0, signSub, signSt)
ok(signSt.records['receipt.signState']?.values?.signState === '已签署', '回执落成了值（signState = 已签署）')
ok(/signState/.test(signSt.result), '回执回写时说明了写回哪个字段')

/* 没写回执字段的 external：必过项直接判错 */
const noReceipt = pv0.tree.map((s) => {
  if (s.skeletonKey !== 'sign') return s
  return { ...s, ways: [{ type: 'external', party: '电子签平台', receipt: '员工签署状态', timeout: '7d' }] }
})
const nrCheck = checkGenerated({ tree: noReceipt, prompt: resignPrompt, facts: previewPeople[0].facts })
ok(nrCheck.errors.some((e) => e.code === 'RECEIPT_NO_FIELD'), '回执只有一句话（没有字段）→ 必过项判不合格')
const nrV = validateTree(noReceipt, { checks, actions })
ok(nrV.some((e) => e.code === 'EXTERNAL_NO_RECEIPT' && e.level === 'error'), '发布校验同样拦住：没字段的回执判不出达成')

/* 离职原因：登记是 multi，骨架就得是多选 —— 两边口径一致，模型不会再问「能不能改成多选」 */
ok(eventPointFields('resign.apply.submitted').find((f) => f.key === 'reason')?.type === 'multi', '登记口径：离职原因可多选')
ok(reviewCitySk.paths[0].items[0].fields.find((f) => f.key === 'reason')?.type === 'multiselect', '骨架字段与登记同口径：多选')
ok(reviewCitySk.paths[0].items[0].fields.find((f) => f.key === 'reviewNote')?.type === 'textarea', '审核意见就是一个多行文本框（不是特殊控件）')
ok(CONTRACT.enums.fieldTypes.includes('multiselect'), '契约字段类型里有「多选」')
const askMsgs = buildAskMessages({ utterance: '员工离职', factsText: designFactsText(), checkList: checks, actionList: actions })
ok(/离职原因（多选 · 必传：工资太低/.test(askMsgs[2].content), '登记里的类型与可选值都渲染给模型（不再只认 enum，也不会误报成单字段）')

/* 审核表单：多选预填是数组，审核人看到的是可勾选的项，不是一句「工资太低、离家太远」 */
const rvSub = inst0.tree.find((s) => s.skeletonKey === 'review.city')
const reasonF = (formOf(rvSub)[0]?.fields || []).find((f) => f.key === 'reason')
ok(reasonF && reasonF.type === 'multiselect', '审核表单里离职原因是多选控件')
ok(Array.isArray(reasonF?.prefill) && reasonF.prefill.length === 2, '预填按字段类型归一成数组（不是一句拼好的文本）')

/* 定义期就拦：不等触发才发现回执没有字段 */
const skIssues = validateSkeleton(resignPrompt)
ok(skIssues.every((x) => x.level !== 'error'), `离职骨架发布前 0 个不合规错误（${skIssues.length} 条提醒）`)
const badSk = {
  ...resignPrompt,
  skeleton: resignPrompt.skeleton.map((s) => (s.key === 'sign'
    ? { ...s, paths: [{ type: 'external', party: '电子签平台', receipt: '员工签署状态', timeout: '7d' }] }
    : s))
}
ok(validateSkeleton(badSk).some((x) => x.code === 'EXTERNAL_NO_RECEIPT' && x.level === 'error'), '骨架里回执只有一句话 → 发布前就拦住')

/* 审核不是类型：谁再立一个 review 路径，生成期就拦 */
const relit = pv0.tree.map((s) => (s.skeletonKey === 'review.city'
  ? { ...s, ways: [{ type: 'review', owner: { kind: 'role', role: 'hr' }, levels: [{ owner: { kind: 'role', role: 'hr' }, mode: 'any' }], form: [] }] }
  : s))
const relitCheck = checkGenerated({ tree: relit, prompt: resignPrompt, facts: previewPeople[0].facts })
ok(relitCheck.errors.some((e) => e.code === 'WAY_TYPE_UNKNOWN'), '再立「审核」路径类型 → 判定不合格')

/* 审核结论没有意见字段：能过，但提醒留痕没地方写 */
const noNote = pv0.tree.map((s) => {
  if (s.skeletonKey !== 'review.city') return s
  const w = s.ways[0]
  return { ...s, ways: [{ ...w, items: [{ ...w.items[0], fields: w.items[0].fields.filter((f) => !/意见/.test(f.label)) }] }] }
})
ok(validateTree(noNote, { checks, actions }).some((i) => i.code === 'REVIEW_NO_OPINION' && i.level === 'warning'), '审核没有「意见」字段 → 提醒（审核留痕要地方写）')

/* 附件没写格式：交上来打不开等于没交 —— 错，不是提醒 */
const noFmt = pv0.tree.map((s) => {
  if (s.skeletonKey !== 'handover.client') return s
  const w = s.ways[0]
  const fields = w.items[0].fields.map((f) => (f.type === 'file' ? { ...f, formats: '' } : f))
  return { ...s, ways: [{ ...w, items: [{ ...w.items[0], fields }] }] }
})
ok(validateTree(noFmt, { checks, actions }).some((i) => i.code === 'FILE_NO_FORMAT' && i.level === 'error'), '附件没写允许格式 → 判错')

console.log(fail ? `\n${fail} 项断言失败` : '\n全部通过')
process.exit(fail ? 1 : 0)
