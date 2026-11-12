/**
 * 评审稿种子数据（.js 而非 .json：node 回归脚本要 import）
 *
 * 新范式的三条：
 *   · 定义期只有「一套提示词 + 一份骨架」，没有预生成好的树
 *   · 根事件触发后，按这一单的人与事实生成子事件（每单一份）
 *   · 事实取不到就不长那一条 —— 差异只有这一个来源
 *
 * 所以这里播种的是：一个提示词（离职）、三个样本人（预览用）、
 * 三笔样例实例（每笔都带自己那棵树，由生成器现算）、六个系统检查项、四个动作。
 */
import { composeFor } from './blueprint.js'
import { resignSkeleton, RESIGN_FACTS } from './skeleton.js'
import { snapshotOfSkeleton } from './template.js'
import { runIntake } from './intake.js'
import { keepKnownPayload, prefillTree, payloadDefaultsOf } from './payload.js'
import { factsOfPerson, staffById } from './base.js'
import { sceneEvents } from './scenes.js'

import { systemChecks, actions, checkByKey, latestBatchOf, actionByKey, actionName } from './catalog.js'

export { systemChecks, actions, checkByKey, latestBatchOf, actionByKey, actionName }

/* ---------------- 触发源（登记在 points.js：跨系统契约，与演示数据分开） ---------------- */

export {
  eventPoints, eventPointLabel, eventPointOf, entryOf,
  eventPointFields, pointFieldOf, empNoFieldOf
} from './points.js'

/* ---------------- 提示词正文（人写的那部分） ---------------- */

const RESIGN_BODY = `【这件事是什么】
员工与企业结束用工关系。从离职申请提交开始，到合同签署完成、结果广播给下游、档案归档结束。

【必须办成的事】
按子事件清单逐条交付。缺一条即为不合格 —— 它不是「建议做的事」，是这件事的完成定义。

【审核怎么摆】
审核不是流程里的一个环节，也不是一种路径类型：它就是两条结论 —— 城市总已审核通过、人事已审核通过，各配一条人办路径，负责人就是审核人，审核意见是一个普通的多行文本字段。
城市总先核定实际离职日期，人事再复核申请与交接范围；后面每一条都等这两条。几级审核就几条结论，先后由「需等」表达 —— 不再另设「提交审核」「审核通过」两对节点，同一次审批占两个节点，只会让「到底算不算审完」说不清。
钱的事不挂在审核结论上：审核只回答「这个人能不能走、范围对不对」，补偿金与常乐豆另立一条（见下）。

【补偿金与常乐豆余额怎么处理】
补偿金是人事的一条独立结论，不挂在合同推送上：推送离职合同本来就是这件事的终点动作，钱怎么结是它之前必须定下的事 —— 合同签署这一条等它，但它不是合同推送的一环。
这条结论同时管两笔钱（离职补偿金与常乐豆余额处置已确认），因为它们在业务上就是一笔：员工到手的离职补偿金 = 协商的补偿金 + 从补偿金口出去的常乐豆余额。
钱不从这一侧算。先有一条系统结论（待执行补偿金已从补偿金系统取回）：按工号去补偿金系统读回那一笔「已核定、未执行」的记录，带出金额、协议号、协议文件。本流程不重算金额、不改核定口径，也不重复让人录一遍。
读到了，人事在确认这条上核对；读不到（补偿金系统还没建单），人事按协商结果补录，没有补偿就填 0 并附无补偿确认 —— 无论如何协议都是必传附件，否则「赔了多少」这件事没有凭证。
常乐豆余额的出口只有两条：「并入一次性补偿金」或「并入当期薪金」，默认并入当期薪金。这个选择由人事与员工协商后定，不是系统自动判的；它决定的是这笔钱落进哪个个税申报科目（解除劳动合同一次性补偿金 / 工资薪金），不是给不给这笔钱。
有没有这一条由事实决定（涉补偿的人才长），但形状只有一种：不要按「只有补偿金」「只有常乐豆」「两样都有」写三种子事件 —— 一份提示词、一条子事件，长不长由事实判。不涉补偿的人没有补偿金单可并，常乐豆由薪酬系统按余额自动结转进当期薪金，这里不长这一条。
字段名必须点到是哪一笔钱：这一格叫「常乐豆余额出口」，不许写成「款项出口」这类泛称 —— 备用金、欠款、未结报销各有自己的结论，名字撞了，下游按字段取数就会取错一笔。
整件事里，常乐豆余额的处置意见只能有一处表达 —— 就是「离职补偿金与常乐豆余额处置已确认」这条结论上的「常乐豆余额出口」字段。其余子事件只能引用它的结论，不许再设第二个字段、也不许另立一条结论去表达同一件事。
最后一条系统执行：把协商金额、常乐豆出口、实际离职日期一起写进薪酬系统，拿回回执。它不产生意见、不算钱、不冻结、不结算 —— 员工到手多少、个税怎么算，由薪酬系统按补偿金逻辑统一处理。

【按人差异怎么判断】
差异只有一个来源：这一单取到的事实。有在跟客户才移交客户，带团队才交接团队，管备用金才结清现金，有欠款才清账。
事实取不到就不长这一条，不要为了「流程完整」补一条空的。
不许按岗位想象事实：同岗位两个人的资产、欠款、团队都可能不同。

【等对方回话怎么算完成】
合同签署由员工在电子签平台完成，我们只认回执里的签署状态。推送成功只代表送达，不代表签了 —— 送达不能当签署结果用。

【表单怎么给】
负责人在移动端逐项填写，字段只收他要交的东西：凭证、清单、日期、金额、审核意见。审核也不单设控件 —— 通过与否由提交时的判定给，意见就是一个多行文本框。

【不要做什么】
不代下游计算薪酬与社保；不重复审（审核就是城市总、人事那两条结论）；不写不可判定的结果 ——「交接已完成」不合格，「客户资料已移交并登记接收人」才合格。`

/* ---------------- 根事件 = 一套提示词 ---------------- */

export const resignPrompt = {
  key: 'resign',
  name: '离职',
  desc: '员工与企业结束用工关系，交付到合同签署与档案归档',
  /** 适用范围：只用来选这套提示词，不决定树 */
  scope: {
    jobs: ['调理师', '推拿师', '前台', '客户经理', '店长', '城市总'],
    cities: [],
    stores: [],
    employTypes: ['全职', '试用']
  },
  trigger: {
    type: 'business',
    eventPoint: 'resign.apply.submitted',
    entry: '员工自助端 · 我的 · 离职申请',
    /* 用登记字段里的哪几个、各自走到哪去（类型与必传一律从登记表来，这里不重写） */
    payload: [
      { field: 'applyNo', use: 'show' },
      { field: 'empId', use: 'intake' },
      { field: 'expectDate', use: 'bind' },
      { field: 'reason', use: 'bind' },
      { field: 'note', use: 'bind' }
    ]
  },
  skeleton: resignSkeleton,
  /** 这套事件自己声明的事实（基础表之外）：换一件事就另写一批 */
  facts: RESIGN_FACTS,
  body: RESIGN_BODY,
  /**
   * 这一次生成的结果快照。
   * 定义页只做调试：清单是提示词生出来的，人不在这里改结果 ——
   * 所以快照就等于当前清单，不再留「哪几条是后加的、哪条被改过」的差异。
   */
  firstGen: {
    at: '2026-10-15 17:40',
    by: '起草 Agent',
    version: 3,
    items: snapshotOfSkeleton(resignSkeleton)
  },
  status: 'active',
  currentVersion: 3,
  versions: [
    { v: 1, savedAt: '2026-09-10 14:20', savedBy: 'Lacus7', note: '首版：审核 + 交接 + 签署', keys: resignSkeleton.filter((s) => !['comp.confirm', 'comp.push', 'archive'].includes(s.key)).map((s) => s.key) },
    { v: 2, savedAt: '2026-09-28 10:05', savedBy: 'Lacus7', note: '补补偿金与档案归档', keys: resignSkeleton.filter((s) => s.key !== 'archive').map((s) => s.key) },
    { v: 3, savedAt: '2026-10-15 17:40', savedBy: 'Lacus7', note: '交接后自动取资产核销结论', keys: resignSkeleton.map((s) => s.key) }
  ],
  updatedAt: '2026-10-15 17:40',
  updatedBy: 'Lacus7'
}

/* ---------------- 样本人（预览用：同样一套提示词，长出不同的树） ----------------
 * 事实一律由 factsOfPerson 从台账属性派生 —— 与真实触发时引擎取回的是同一套算法，
 * 所以「预览这一棵」就是「这个人真发起时那一棵」，不会出现预览 13 条、发起后 16 条。
 * 张三直接用员工主数据里那一条，不另写一份。
 */
const zhang = staffById('T00676')

/** 不在员工主数据里的两个人（店长 / 城市总），按同样的台账属性给，事实仍由同一套推导得出 */
const otherPeople = [
  {
    id: 'T00512', name: '刘丹', job: '店长', city: '上海', store: '上海徐汇店', employType: '全职', onboardAt: '2020-06-01',
    contractEntity: '上海推拿之家健康管理有限公司',
    perms: ['store.admin', 'pos', 'schedule', 'wecom'],
    assets: ['工牌', '对讲机'],
    clients: 3, tasks: 4, team: 5, cash: 2000, complaint: 1,
    debt: { loan: 0, advance: 0, reimburse: 0 }
  },
  {
    id: 'T01660', name: '杨春燕', job: '城市总', city: '杭州', store: '杭州西湖店', employType: '全职', onboardAt: '2019-03-18',
    contractEntity: '杭州推拿之家健康管理有限公司',
    perms: ['city.admin', 'wecom'],
    assets: ['工牌', '办公笔记本'],
    clients: 0, tasks: 6, team: 9, cash: 0, complaint: 0, severance: true,
    debt: { loan: 0, advance: 0, reimburse: 0 }
  }
]

/* 试用期样本：转正这件事只对试用期的人存在，预览池里得真有这样一个人 */
const chen = staffById('T00695')

export const previewPeople = [zhang, ...otherPeople, chen].filter(Boolean).map((p) => ({ ...p, facts: factsOfPerson(p) }))

/** 基线树 = 张三（推拿师）这一单长出来的树，给回归脚本与文档当参照 */
export const resignBaseline = composeFor({ prompt: resignPrompt, emp: previewPeople[0] }).tree

/* ---------------- 样例实例 ---------------- */

/** 批次留痕：补齐字段默认值。repeat = 同一批次又被取到一次，不算新的未通过批次 */
const mkDetail = (rows = []) =>
  rows.map((r) => ({ at: '', batchNo: '', metrics: '', result: '通过', repeat: false, ...r }))

/**
 * 每笔实例的树都由生成器现算 —— 种子里不存「预生成好的树」。
 * subs 只写这一单真实发生过的记录；树里没有的节点直接丢掉（说明这一单本来就没这一条）。
 *
 * 四套事件共用这一条路径：事件不同只换提示词，取数、预填、生成、挂状态都不分叉 ——
 * 分叉了就说明「换一件事写一套提示词」这句话不成立。
 */
const PROMPTS = [resignPrompt, ...sceneEvents]
const promptOf = (key) => PROMPTS.find((p) => p.key === key) || resignPrompt

function makeInstance (base) {
  const prompt = promptOf(base.eventKey || 'resign')
  // 与真实触发同一条路：校验载荷 → 取数 → 预填 → 生成
  const payload = keepKnownPayload(prompt.trigger, {
    ...payloadDefaultsOf(prompt.trigger, { empNo: base.emp.empNo }),
    empId: base.emp.empNo,
    // 申请单号每件事都有（登记里是 auto）：种子直接给一个，与真机提交时生成的口径一致
    applyNo: `${base.code}-RQ`,
    // 离职意向是离职这件事自己的登记项，别的事件没有，塞了也会被登记表挡掉
    ...(prompt.key === 'resign'
      ? { expectDate: base.emp.expectDate, reason: '工资太低、离家太远' }
      : {}),
    ...(base.payload || {})
  })
  const intake = runIntake({ emp: { ...base.emp, payload }, at: (base.startedAt || '').split(' ').pop() })
  const fullEmp = { ...intake.emp, payload }
  const r = composeFor({ prompt, emp: fullEmp })
  prefillTree(r.tree, payload)
  const subs = {}
  r.tree.forEach((s) => {
    subs[s.id] = base.subs?.[s.id] || { state: base.state === 'done' ? 'done' : 'pending', records: {} }
  })
  return {
    ...base,
    emp: fullEmp,
    payload,
    intake,
    tree: r.tree,
    subs,
    gen: {
      at: base.startedAt,
      by: '规则生成',
      promptVersion: prompt.currentVersion,
      mode: 'rule',
      ok: r.check.ok,
      degraded: false,
      attempts: 1,
      kept: r.tree.length,
      dropped: r.dropped
    }
  }
}

const rawInstances = [
  {
    id: 'rs01',
    code: 'LZ-2026-1027-001',
    eventKey: 'resign',
    version: 3,
    emp: {
      name: '郑一鸣', empNo: 'TL1834', job: '客户经理', city: '上海', store: '上海静安店', employType: '试用', expectDate: '2026-11-05',
      facts: {
        clients: 3, tasks: 2, team: 0, assets: ['工服 2 套', '对讲机'], cash: 0, debt: 1200,
        accounts: ['门店收银', '排班', '企业微信', '客户档案（岗位标准之外）'], complaint: 2, severance: false
      }
    },
    state: 'running',
    startedAt: '2026-10-15 09:20',
    subs: {
      'se.review.city': { state: 'done', verdict: '通过', by: '冯海霞', at: '2026-10-15 09:48', records: { 'it.review.city': { verdict: '通过', values: { expectDate: '2026-11-05', reason: ['工资太低', '离家太远'], actualDate: '2026-11-05', reviewNote: '交接范围已明确，门店已安排接替' }, files: 0, note: '' } } },
      'se.review': { state: 'done', verdict: '通过', by: '邓黎英', at: '2026-10-15 10:05', records: { 'it.review': { verdict: '通过', values: { reviewNote: '交接范围已确认' }, files: 0, note: '' } } },
      'se.comp.confirm': { state: 'done', verdict: '通过', by: '邓黎英', at: '2026-10-15 10:30', records: { 'it.comp': { verdict: '通过', values: { compAmount: 0, monthlyAvg: 8600, beanPayout: '并入当期薪金', compNote: '员工主动离职，无补偿' }, files: 1, note: '已附无补偿确认' } } },
      'se.comp.push': { state: 'done', verdict: '通过', by: '系统', at: '2026-10-15 10:32', result: '已执行 写入补偿金与常乐豆处置：1 个目标全部成功（按协商补偿金 = 0、常乐豆余额出口 = 并入当期薪金）', used: [{ key: 'compAmount', label: '协商补偿金', value: 0 }, { key: 'beanPayout', label: '常乐豆余额出口', value: '并入当期薪金' }], exec: [{ target: '薪酬系统', result: '成功' }], records: {} },
      'se.handover.client': { state: 'done', verdict: '通过', by: '马晓东', at: '2026-10-15 16:02', records: { 'it.client': { verdict: '通过', values: { clientName: '王女士等 3 人', receiver: '刘丹', handoverDate: '2026-10-15' }, files: 2, note: '' } } },
      'se.handover.work': { state: 'done', verdict: '通过', by: '朱艳秋', at: '2026-10-16 11:20', records: { 'it.plan': { verdict: '通过', values: { scope: '在跟客户 12 人', nextOwner: '钱伟' }, files: 1, note: '' } } },
      'se.goods': { state: 'done', verdict: '通过', by: '马晓东', at: '2026-10-15 16:10', records: { 'it.goods': { verdict: '通过', values: { goodsNote: '工服 2 套、钥匙 1 把' }, files: 1, note: '' } } },
      'se.debt.settle': { state: 'done', verdict: '通过', by: '周芸', at: '2026-10-16 15:40', records: { 'it.debt': { verdict: '通过', values: { amount: 1200 }, files: 1, note: '已还款 1200' } } },
      'se.debt.check': { state: 'done', verdict: '通过', by: '系统', at: '2026-10-15 09:30', result: '无未结清负债', records: {} },
      'se.asset.check': {
        state: 'checking',
        by: '系统',
        at: null,
        polls: 3,
        failBatches: 2,
        nextAt: '2026-10-18 09:00',
        result: '资产台账核销中：工服 1 件待销账',
        detail: mkDetail([
          { at: '2026-10-16 09:00', batchNo: 'B-20261016-01', metrics: '应归还资产未销账 2 件（工服 2）', result: '未通过' },
          { at: '2026-10-16 21:00', batchNo: 'B-20261016-01', metrics: '应归还资产未销账 2 件（工服 2）', result: '未通过', repeat: true },
          { at: '2026-10-17 09:00', batchNo: 'B-20261017-01', metrics: '应归还资产未销账 1 件（工服 1）', result: '未通过' }
        ]),
        records: {}
      },
      'se.complaint.check': {
        state: 'checking',
        by: '系统',
        at: null,
        polls: 2,
        failBatches: 2,
        nextAt: '2026-10-17 17:00',
        result: '近 30 天工单 2 件处理中，继续跟踪',
        detail: mkDetail([
          { at: '2026-10-17 15:00', batchNo: 'B-20261017-03', metrics: '近 30 天待处理工单 3 件', result: '未通过' },
          { at: '2026-10-17 17:00', batchNo: 'B-20261017-03', metrics: '近 30 天待处理工单 2 件', result: '未通过', repeat: true }
        ]),
        records: {}
      }
    }
  },
  {
    id: 'rs02',
    code: 'LZ-2026-0918-004',
    eventKey: 'resign',
    version: 2,
    emp: {
      name: '赵文博', empNo: 'TL2015', job: '前台', city: '上海', store: '上海徐汇店', employType: '全职', expectDate: '2026-09-30',
      facts: {
        clients: 2, tasks: 1, team: 0, assets: ['工牌 1'], cash: 0, debt: 0,
        accounts: ['排班', '企业微信'], complaint: 0, severance: false
      }
    },
    state: 'done',
    startedAt: '2026-09-20 10:05',
    finishedAt: '2026-09-22 18:40',
    subs: {
      'se.review.city': { state: 'done', verdict: '通过', by: '冯海霞', at: '2026-09-20 10:22', records: { 'it.review.city': { verdict: '通过', values: { expectDate: '2026-09-30', reason: '家庭原因', actualDate: '2026-09-30', reviewNote: '已与员工谈定日期' }, files: 0, note: '' } } },
      'se.review': { state: 'done', verdict: '通过', by: '邓黎英', at: '2026-09-20 10:40', records: { 'it.review': { verdict: '通过', values: { reviewNote: '无未结事项' }, files: 0, note: '' } } },
      'se.comp.confirm': { state: 'done', verdict: '通过', by: '邓黎英', at: '2026-09-20 10:50', records: { 'it.comp': { verdict: '通过', values: { compAmount: 0, monthlyAvg: 6200, beanPayout: '并入当期薪金', compNote: '无补偿' }, files: 1, note: '' } } },
      'se.comp.push': { state: 'done', verdict: '通过', by: '系统', at: '2026-09-20 10:52', result: '已执行 写入补偿金与常乐豆处置：1 个目标全部成功', exec: [{ target: '薪酬系统', result: '成功' }], records: {} },
      'se.handover.client': { state: 'done', verdict: '通过', by: '刘丹', at: '2026-09-21 09:30', records: {} },
      'se.handover.work': { state: 'done', verdict: '通过', by: '朱艳秋', at: '2026-09-21 14:10', records: {} },
      'se.goods': { state: 'done', verdict: '通过', by: '刘丹', at: '2026-09-21 09:40', records: {} },
      'se.debt.check': { state: 'done', verdict: '通过', by: '系统', at: '2026-09-20 10:20', result: '无未结清负债', records: {} },
      'se.asset.check': { state: 'done', verdict: '通过', by: '系统', at: '2026-09-22 09:00', result: '资产已全部销账', polls: 2, failBatches: 1, records: {} },
      'se.complaint.check': { state: 'done', verdict: '通过', by: '系统', at: '2026-09-22 09:10', result: '近 30 天待处理工单 0 件', polls: 1, failBatches: 0, records: {} },
      'se.account.recover': {
        state: 'done',
        verdict: '通过',
        by: '统一身份平台',
        at: '2026-09-22 10:00',
        exec: [
          { target: '门店收银系统', result: '成功', at: '2026-09-22 09:58' },
          { target: '门店排班系统', result: '成功', at: '2026-09-22 09:58' },
          { target: '企业微信', result: '成功', at: '2026-09-22 09:59' }
        ]
      },
      'se.interview': { state: 'done', verdict: '通过', by: '邓黎英', at: '2026-09-22 15:00', records: {} },
      'se.attendance.check': { state: 'done', verdict: '通过', by: '系统', at: '2026-09-22 18:00', result: '未处理异常 0 条', polls: 1, failBatches: 0, records: {} },
      'se.contract.push': { state: 'done', verdict: '通过', by: '电子签平台', at: '2026-09-22 18:05', note: '外部单号 ES-20260922-0031，已送达', records: {} },
      'se.sign': { state: 'done', verdict: '通过', by: '电子签平台', at: '2026-09-22 18:20', note: '外部单号 ES-20260922-0031', records: {} },
      'se.broadcast': { state: 'done', verdict: '通过', by: '消息中心', at: '2026-09-22 18:30', note: '薪酬 / 社保 / 假勤已投递', records: {} },
      'se.archive': { state: 'done', verdict: '通过', by: '档案系统', at: '2026-09-22 18:40', note: '归档编号 AR-0912', records: {} }
    }
  },
  {
    id: 'rs03',
    code: 'LZ-2026-1024-002',
    eventKey: 'resign',
    version: 3,
    emp: {
      name: '杨春燕', empNo: 'TL1660', job: '城市总', city: '杭州', store: '杭州西湖店', employType: '全职', expectDate: '2026-11-20',
      facts: {
        clients: 0, tasks: 6, team: 9, assets: ['工牌', '办公笔记本'], cash: 0, debt: 80,
        accounts: ['城市后台', '企业微信'], complaint: 0, severance: false
      }
    },
    state: 'running',
    startedAt: '2026-10-24 09:00',
    subs: {
      'se.review.city': { state: 'done', verdict: '通过', by: '罗嘉铭', at: '2026-10-24 09:48', records: { 'it.review.city': { verdict: '通过', values: { expectDate: '2026-11-20', reason: '个人原因', actualDate: '2026-11-20', reviewNote: '在管 2 家门店，交接范围已明确' }, files: 0, note: '' } } },
      'se.review': { state: 'done', verdict: '通过', by: '李文静', at: '2026-10-24 10:00', records: { 'it.review': { verdict: '通过', values: { reviewNote: '在管门店交接范围已明确' }, files: 0, note: '' } } },
      'se.comp.confirm': { state: 'running', records: {} },
      'se.comp.push': { state: 'pending', records: {} },
      'se.handover.team': { state: 'running', records: {} },
      'se.handover.work': { state: 'running', records: {} },
      'se.debt.settle': { state: 'running', records: {} },
      'se.debt.check': { state: 'checking', polls: 1, failBatches: 1, nextAt: '2026-10-27 09:00', result: '欠款合计 ¥80，未命中任何区间', detail: mkDetail([{ at: '2026-10-26 09:00', batchNo: 'B-20261024-01', metrics: '欠款合计 ¥80，未命中任何区间', result: '未通过' }]), records: {} }
    }
  },

  /* ---------------- 另外三件事：同一套写法，只换「这件事必须交出什么」 ---------------- */

  {
    id: 'zz01',
    code: 'ZZ-2026-1103-001',
    eventKey: 'regular',
    version: 1,
    emp: {
      name: '陈思远', empNo: 'T00695', job: '推拿师', city: '上海', store: '上海静安店', employType: '试用',
      facts: {
        clients: 0, tasks: 2, team: 0, assets: ['工服 1 套', '工牌'], cash: 0, debt: 0,
        accounts: ['门店收银', '排班', '企业微信'], complaint: 0, severance: false
      }
    },
    payload: { expireDate: '2026-11-30', expectDate: '2026-12-01' },
    state: 'running',
    startedAt: '2026-11-03 09:20',
    subs: {
      'se.eval.supervisor': { state: 'done', verdict: '通过', by: '周凯', at: '2026-11-03 10:12', records: { 'it.regular.eval': { verdict: '通过', values: { score: 86, proposal: '建议转正', comment: '手法达标，客诉 0，独立当班已满 2 个月' }, files: 1, note: '' } } },
      'se.review.city': { state: 'done', verdict: '通过', by: '冯海霞', at: '2026-11-03 15:30', records: { 'it.regular.city': { verdict: '通过', values: { regularDate: '2026-12-01', jobLevel: 'P2', reviewNote: '按试用到期日转正，职级 P2' }, files: 0, note: '' } } },
      'se.review.hr': { state: 'running', records: {} }
    }
  },
  {
    id: 'dg01',
    code: 'DG-2026-1102-001',
    eventKey: 'transfer',
    version: 1,
    emp: {
      name: '张三', empNo: 'T00676', job: '推拿师', city: '上海', store: '上海徐汇店', employType: '全职',
      facts: {
        clients: 2, tasks: 6, team: 0, assets: ['工服 2 套', '工牌', '对讲机', 'AACB'], cash: 0, debt: 320,
        accounts: ['门店收银', '排班', '企业微信', '调班申请'], complaint: 0, severance: false
      }
    },
    payload: { expectDate: '2026-11-10' },
    state: 'running',
    startedAt: '2026-11-02 14:05',
    subs: {
      'se.handover.clients': { state: 'done', verdict: '通过', by: '马晓东', at: '2026-11-02 17:20', records: { 'it.transfer.clients': { verdict: '通过', values: { clientCount: 2, note: '两位老客已交接给刘丹' }, files: 1, note: '' } } },
      'se.handover.assets': { state: 'done', verdict: '通过', by: '马晓东', at: '2026-11-02 17:40', records: { 'it.transfer.assets': { verdict: '通过', values: { assetState: '全部归还' }, files: 1, note: 'AACB 一并交回' } } },
      'se.review.city': { state: 'running', records: {} }
    }
  },
  {
    id: 'dx01',
    code: 'DX-2026-1104-001',
    eventKey: 'raise',
    version: 1,
    emp: {
      name: '王五', empNo: 'T00680', job: '推拿师', city: '上海', store: '上海徐汇店', employType: '全职',
      facts: {
        clients: 3, tasks: 4, team: 0, assets: ['工服 2 套', '工牌'], cash: 0, debt: 0,
        accounts: ['门店收银', '排班', '企业微信'], complaint: 0, severance: false
      }
    },
    payload: { expectMonth: '2026-12' },
    state: 'running',
    startedAt: '2026-11-04 10:30',
    subs: {
      'se.proposal.city': { state: 'done', verdict: '通过', by: '冯海霞', at: '2026-11-04 11:00', records: { 'it.raise.proposal': { verdict: '通过', values: { currentSalary: 9000, proposedSalary: 9800, reason: '近半年出勤与客评稳定在前二，带教 1 名新人' }, files: 0, note: '' } } },
      'se.review.hr': { state: 'running', records: {} }
    }
  }
]

export const seedInstances = rawInstances.map(makeInstance)

/* ---------------- 导出（store 只认这两个名字） ---------------- */

export const seedEvents = PROMPTS
