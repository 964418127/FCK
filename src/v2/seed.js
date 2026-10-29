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
城市总先核定实际离职日期，人事再复核并定下这一笔常乐豆走哪条通道（款项出口）；后面每一条都等这两条。几级审核就几条结论，先后由「需等」表达 —— 不再另设「提交审核」「审核通过」两对节点，同一次审批占两个节点，只会让「到底算不算审完」说不清。

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
   * 首次生成（起草那一次由提示词产出的结果）的快照。
   * 页面上的清单是人改过的，走查时要能回答「哪几条是提示词给的、哪几条是后人加的、哪条被改了口径」。
   * 只留对账要用的字段：结论、门禁、路径、附件 —— 不是整份骨架的副本。
   */
  firstGen: {
    at: '2026-09-10 14:20',
    by: '起草 Agent',
    version: 1,
    items: snapshotOfSkeleton(resignSkeleton.filter((s) => !['compensation', 'archive', 'bean.intent', 'review.city'].includes(s.key)))
      /* 起草时这条写成了「系统权限已回收」，判不了达成没有 —— 人后来改成带范围的说法 */
      .map((x) => (x.key === 'account.recover' ? { ...x, goal: '系统权限已回收' } : x))
      /* 起草时只有人事一道审核，后来按「几级审核就几条结论」补了城市总这一关 */
      .map((x) => (x.key === 'review' ? { ...x, goal: '离职需求已审核通过' } : x))
  },
  status: 'active',
  currentVersion: 3,
  versions: [
    { v: 1, savedAt: '2026-09-10 14:20', savedBy: 'Lacus7', note: '首版：审核 + 交接 + 签署', keys: resignSkeleton.filter((s) => !['compensation', 'archive'].includes(s.key)).map((s) => s.key) },
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

export const previewPeople = [zhang, ...otherPeople].map((p) => ({ ...p, facts: factsOfPerson(p) }))

/** 基线树 = 张三（推拿师）这一单长出来的树，给回归脚本与文档当参照 */
export const resignBaseline = composeFor({ prompt: resignPrompt, emp: previewPeople[0] }).tree

/* ---------------- 样例实例 ---------------- */

/** 批次留痕：补齐字段默认值。repeat = 同一批次又被取到一次，不算新的未通过批次 */
const mkDetail = (rows = []) =>
  rows.map((r) => ({ at: '', batchNo: '', metrics: '', result: '通过', repeat: false, ...r }))

/**
 * 每笔实例的树都由生成器现算 —— 种子里不存「预生成好的树」。
 * subs 只写这一单真实发生过的记录；树里没有的节点直接丢掉（说明这一单本来就没这一条）。
 */
function makeInstance (base) {
  // 与真实触发同一条路：校验载荷 → 取数 → 预填 → 生成
  const payload = keepKnownPayload(resignPrompt.trigger, {
    ...payloadDefaultsOf(resignPrompt.trigger, { empNo: base.emp.empNo }),
    applyNo: `${base.code}-RQ`,
    empId: base.emp.empNo,
    expectDate: base.emp.expectDate,
    reason: '工资太低、离家太远',
    ...(base.payload || {})
  })
  const intake = runIntake({ emp: { ...base.emp, payload }, at: (base.startedAt || '').split(' ').pop() })
  const fullEmp = { ...intake.emp, payload }
  const r = composeFor({ prompt: resignPrompt, emp: fullEmp })
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
      promptVersion: resignPrompt.currentVersion,
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
      'se.review': { state: 'done', verdict: '通过', by: '邓黎英', at: '2026-10-15 10:05', records: { 'it.review': { verdict: '通过', values: { payout: '并入薪金', reviewNote: '按并入薪金处理' }, files: 0, note: '' } } },
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
      'se.review': { state: 'done', verdict: '通过', by: '邓黎英', at: '2026-09-20 10:40', records: { 'it.review': { verdict: '通过', values: { payout: '并入薪金', reviewNote: '无补偿' }, files: 0, note: '' } } },
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
      'se.review': { state: 'done', verdict: '通过', by: '李文静', at: '2026-10-24 10:00', records: { 'it.review': { verdict: '通过', values: { payout: '并入薪金', reviewNote: '按并入薪金处理' }, files: 0, note: '' } } },
      'se.handover.team': { state: 'running', records: {} },
      'se.handover.work': { state: 'running', records: {} },
      'se.debt.settle': { state: 'running', records: {} },
      'se.debt.check': { state: 'checking', polls: 1, failBatches: 1, nextAt: '2026-10-27 09:00', result: '欠款合计 ¥80，未命中任何区间', detail: mkDetail([{ at: '2026-10-26 09:00', batchNo: 'B-20261024-01', metrics: '欠款合计 ¥80，未命中任何区间', result: '未通过' }]), records: {} }
    }
  }
]

export const seedInstances = rawInstances.map(makeInstance)

/* ---------------- 导出（store 只认这两个名字） ---------------- */

export const seedEvents = [resignPrompt]
