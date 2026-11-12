/**
 * 事件模板：除离职之外的三套 —— 转正、调岗、调薪。
 *
 * 为什么放在一处而不写进 seed.js：
 *   seed.js 里的离职是「演示主线」（22 条、三条样例单、文档里逐条对照），
 *   而这几套是**用来验证这套写法能不能迁移到别的事件**的样本：
 *   它们与离职共用同一份契约、同一个生成器、同一套字段与路径构造器，
 *   只有「这件事必须交出什么结论」不同。
 *
 * 每套只写三样东西：
 *   body      口径（人话，业务人员照着写的部分）
 *   skeleton  骨架（这件事必须交付的结论，含成立条件与前置）
 *   trigger   这张单怎么开（事件点必须是登记表里有的）
 * 其余（树、依赖、承担者、表单）都在触发时按这一单的人与事实生成。
 */

import { SK_BUILD } from './skeleton.js'
import { stores as storeNames, jobs as jobList } from './model.js'

const { field: f, item: it, human, action } = SK_BUILD

const STORE_OPTIONS = storeNames.length ? storeNames : ['上海徐汇店', '上海静安店', '上海浦东店', '杭州西湖店', '杭州滨江店']
const JOB_OPTIONS = jobList.length ? jobList.map((j) => (typeof j === 'string' ? j : j.key)) : ['推拿师', '客户经理', '前台', '店长']

/* ======================= 一、转正 ======================= */

const REGULAR_BODY = `【这件事是什么】
试用期员工到期转正。从直属上级提交转正评估开始，到合同变更签署完成、权限与档案按正式员工更新、薪酬收到转正结果结束。

【必须办成的事】
按子事件清单逐条交付，缺一条即为不合格。评估在前，两级审核在后 —— 先后由「需等」表达，不靠节点数量猜。

【审核怎么摆】
三道结论：直属上级已提交转正评估（给的是评估结论，不是审批）、城市总已审核通过、人事已审核通过。
审核就是一条结论配一条人办路径，负责人就是审核人，审核意见是普通的多行文本字段；几级审核就几条结论，不要另设「提交审核」「审核通过」两个节点。

【按人差异怎么判断】
带团队的人多一条团队管理评估：试用期就管人的，转正要看带人情况；不带团队就没有这一条。
差异只来自事实，不按岗位想象补条目。

【发起只到期望】
发起侧只带试用到期日（档案事实）与期望转正日期（意向，可空），不在这时给评估结论 —— 评估结论是直属上级那条结论里的字段。
转正日期与转正后职级由城市总核定：试用到期日只是「最早能从哪天起算」的参照，不是转正生效日。

【不要做什么】
不代算转正后的薪资：薪酬按职级规则在薪酬侧算，我们只把「已转正」这件事通知过去。
不把「延长试用」「不通过」做成这张单里的分支节点 —— 那是另一次评估，走另一张单，不在这条流程里分叉。`

const regularSkeleton = [
  {
    key: 'eval.supervisor',
    goal: '直属上级已提交转正评估',
    needs: 'always',
    gate: 'must',
    after: [],
    note: '转正的第一手判断来自直接带他的人，不是人事',
    paths: [human('supervisor', [
      it('it.regular.eval', '转正评估 · 直属上级', '对照试用期目标逐项打分，给出转正建议并附评估表', [
        f('score', '试用期考核得分', 'number', true, '0-100'),
        f('proposal', '转正建议', 'select', true, ['建议转正', '建议延长试用', '建议不通过']),
        f('comment', '评估意见', 'textarea', true, '写清做到与没做到，不只给分'),
        f('evalSheet', '试用期评估表', 'file', true, '', 'PDF / JPG / PNG')
      ])
    ])]
  },
  {
    key: 'eval.team',
    goal: '试用期团队管理评估已完成',
    needs: 'team',
    gate: 'must',
    after: ['eval.supervisor'],
    note: '试用期就带人的，转正要单独看他带得怎么样',
    paths: [human('supervisor', [
      it('it.regular.team', '团队管理评估 · 直属上级', '带团队的试用期员工，评估其在管人数、带人方式与流失情况', [
        f('teamSize', '在管人数', 'number', true),
        f('teamNote', '管理评估', 'textarea', true)
      ])
    ])]
  },
  {
    key: 'review.city',
    goal: '城市总已审核通过',
    needs: 'always',
    gate: 'must',
    after: ['eval.supervisor'],
    note: '第一关：核定转正日期与转正后职级',
    paths: [human('city-head', [
      it('it.regular.city', '转正审核 · 城市总', '核对评估结论，核定转正日期与转正后职级，写清审核意见', [
        f('regularDate', '转正日期', 'date', true, '不早于试用到期日'),
        f('jobLevel', '转正后职级', 'select', true, ['P1', 'P2', 'P3']),
        f('reviewNote', '审核意见', 'textarea')
      ])
    ])]
  },
  {
    key: 'review.hr',
    goal: '人事已审核通过',
    needs: 'always',
    gate: 'must',
    after: ['review.city'],
    note: '第二关：复核评估与职级，定合同期限',
    paths: [human('hr', [
      it('it.regular.hr', '转正审核 · 人事', '复核评估与职级，确定合同期限，写清审核意见', [
        f('contractTerm', '合同期限', 'select', true, ['3 年', '1 年', '无固定期限']),
        f('reviewNote', '审核意见', 'textarea')
      ])
    ])]
  },
  {
    key: 'contract.change',
    goal: '合同变更已完成签署',
    needs: 'always',
    gate: 'must',
    after: ['review.hr'],
    note: '试用期条款要改，员工签完才算完 —— 推送成功只代表送达',
    paths: [{
      type: 'external',
      party: '电子签平台',
      via: 'act.pushContractChange',
      timeout: '3d',
      receipt: [{ key: 'signState', label: '员工签署状态', values: ['已签署', '已拒签', '待签署'] }],
      writeBack: 'signState'
    }]
  },
  {
    key: 'perm.adjust',
    goal: '正式员工系统权限已开通',
    needs: 'always',
    gate: 'must',
    after: ['review.hr'],
    paths: [action('act.grantPerm', '企业微信 · 门店收银系统', { times: 3, interval: '30m', onExhaust: 'human' })]
  },
  {
    key: 'payroll.notice',
    goal: '薪酬已收到转正结果',
    needs: 'always',
    gate: 'must',
    after: ['review.hr'],
    note: '只通知，不代算薪资 —— 按职级算钱是薪酬侧的事',
    paths: [action('act.notifyPayrollChange', '', { times: 2, interval: '1h', onExhaust: 'human' })]
  },
  {
    key: 'profile.update',
    goal: '员工档案已更新为正式员工',
    needs: 'always',
    gate: 'must',
    after: ['contract.change'],
    paths: [action('act.updateStaffProfile', '', { times: 3, interval: '1h', onExhaust: 'human' })]
  },
  {
    key: 'archive',
    goal: '转正材料已归档',
    needs: 'always',
    gate: 'optional',
    after: ['profile.update'],
    paths: [action('act.archive', '员工本人', { times: 2, interval: '1d', onExhaust: 'stop' })]
  }
]

export const regularEvent = {
  key: 'regular',
  name: '转正',
  desc: '试用期满转正，交付到合同变更签署与档案更新',
  scope: {
    jobs: ['推拿师', '客户经理', '前台', '店长'],
    cities: [],
    stores: [],
    employTypes: ['试用']
  },
  trigger: {
    type: 'business',
    eventPoint: 'regular.apply.submitted',
    entry: 'HR 后台 · 员工档案 · 发起转正',
    payload: [
      { field: 'applyNo', use: 'show' },
      { field: 'empId', use: 'intake' },
      { field: 'expireDate', use: 'show' },
      { field: 'expectDate', use: 'bind' }
    ]
  },
  skeleton: regularSkeleton,
  facts: [],
  body: REGULAR_BODY,
  status: 'active',
  currentVersion: 1,
  versions: [{ v: 1, savedAt: '2026-11-04 20:10', savedBy: 'Lacus7', note: '首版：评估 + 两级审核 + 合同变更 + 权限档案薪酬', keys: regularSkeleton.map((s) => s.key) }],
  updatedAt: '2026-11-04 20:10',
  updatedBy: 'Lacus7'
}

/* ======================= 二、调岗 ======================= */

const TRANSFER_BODY = `【这件事是什么】
员工在门店之间、或岗位之间调整。从交接开始，到权限切换、档案与薪酬按新岗位生效结束。

【必须办成的事】
按子事件清单逐条交付。交接那几条按事实长：有在跟客户才移交客户，名下有在册资产才回收，保管备用金才结清 —— 事实不成立就不长这一条，不为「流程完整」补一条空的。

【审核怎么摆】
两条结论：城市总已审核通过（定生效日期、调入门店与岗位）、人事已审核通过（复核档案与直属上级变更）。先后由「需等」表达。

【发起只到期望】
申请人只填期望生效日期（期望调入门店是可选意向），不填实际生效日期、不填调入岗位 —— 那些是城市总在审核那条结论里核定的事。
发起侧一律用「期望 ××」的说法，不用「生效日期」这种确定口径的字段名：员工当时给出的只是期望，写成确定口径，后面的人就不好改，也分不清谁拍的板。

【权限怎么切】
撤销原岗位权限与开通新岗位权限是两条结论，不是一条：撤销失败不能让「已开通」把这一步盖过去 —— 一个账号的账错了，下游就按错的岗位给权限。

【不要做什么】
不代算调岗后的薪资与补贴；不承诺新门店的排班与工位 —— 那些是接收门店的事，我们只交付「这个人从哪天起归谁管、是什么岗位」。`

const transferSkeleton = [
  {
    key: 'handover.clients',
    goal: '在跟客户已移交给原门店',
    needs: 'clients',
    gate: 'must',
    after: [],
    note: '客户是跟着门店走的，不是跟着人走的',
    paths: [human('store-manager', [
      it('it.transfer.clients', '客户移交 · 原门店店长', '逐个客户确认接收人，附客户交接单', [
        f('clientCount', '移交客户数', 'number', true),
        f('handoverSheet', '客户交接单', 'file', true, '', 'PDF / XLSX'),
        f('note', '说明', 'textarea')
      ])
    ])]
  },
  {
    key: 'handover.assets',
    goal: '在册资产已交回原门店',
    needs: 'assets',
    gate: 'must',
    after: [],
    paths: [human('store-manager', [
      it('it.transfer.assets', '资产回收 · 原门店店长', '对照在册资产逐项核对，缺件写清处理方式', [
        f('assetState', '归还情况', 'select', true, ['全部归还', '部分归还', '有损坏']),
        f('assetSheet', '资产清单', 'file', true, '', 'PDF / JPG / PNG')
      ])
    ])]
  },
  {
    key: 'handover.cash',
    goal: '保管的备用金已结清',
    needs: 'cash',
    gate: 'must',
    after: [],
    paths: [human('store-manager', [
      it('it.transfer.cash', '备用金结清 · 原门店店长', '当面清点现金，附收据', [
        f('amount', '结清金额', 'number', true),
        f('cashReceipt', '收据', 'file', true, '', 'PDF / JPG')
      ])
    ])]
  },
  {
    key: 'review.city',
    goal: '城市总已审核通过',
    needs: 'always',
    gate: 'must',
    after: ['handover.clients', 'handover.assets', 'handover.cash'],
    note: '第一关：定生效日期、调入门店与岗位',
    paths: [human('city-head', [
      it('it.transfer.city', '调岗审核 · 城市总', '核定生效日期与调入门店、岗位，写清审核意见', [
        /* 员工发起时只给期望日期 —— 这里带出来给他核，改不改由他定，口径仍是「实际生效日期」 */
        f('effectDate', '实际生效日期', 'date', true, '按申请人的期望日期核定，可改', '', 'payload.expectDate'),
        f('toStore', '调入门店', 'select', true, STORE_OPTIONS),
        f('toJob', '调入岗位', 'select', true, JOB_OPTIONS),
        f('reviewNote', '审核意见', 'textarea')
      ])
    ])]
  },
  {
    key: 'review.hr',
    goal: '人事已审核通过',
    needs: 'always',
    gate: 'must',
    after: ['review.city'],
    note: '第二关：复核档案与直属上级变更',
    paths: [human('hr', [
      it('it.transfer.hr', '调岗审核 · 人事', '复核档案与直属上级变更，写清审核意见', [
        f('newSupervisor', '新直属上级', 'text', true),
        f('reviewNote', '审核意见', 'textarea')
      ])
    ])]
  },
  {
    key: 'perm.revoke',
    goal: '原岗位系统权限已撤销',
    needs: 'accounts',
    gate: 'must',
    after: ['review.hr'],
    paths: [action('act.revokePerm', '该员工名下仍有效的账号', { times: 3, interval: '30m', onExhaust: 'human' })]
  },
  {
    key: 'perm.grant',
    goal: '新岗位系统权限已开通',
    needs: 'always',
    gate: 'must',
    after: ['review.hr'],
    note: '与撤销并列而不串联：撤销不到位的账号可能根本没有，新岗位必须照配',
    paths: [action('act.grantPerm', '新岗位应有的账号', { times: 3, interval: '30m', onExhaust: 'human' })]
  },
  {
    key: 'profile.update',
    goal: '员工档案已改为新门店与新岗位',
    needs: 'always',
    gate: 'must',
    after: ['review.hr'],
    paths: [action('act.updateStaffProfile', '', { times: 3, interval: '1h', onExhaust: 'human' })]
  },
  {
    key: 'payroll.notice',
    goal: '薪酬已收到调岗结果',
    needs: 'always',
    gate: 'must',
    after: ['profile.update'],
    paths: [action('act.notifyPayrollChange', '', { times: 2, interval: '1h', onExhaust: 'human' })]
  },
  {
    key: 'archive',
    goal: '调岗材料已归档',
    needs: 'always',
    gate: 'optional',
    after: ['payroll.notice'],
    paths: [action('act.archive', '员工本人', { times: 2, interval: '1d', onExhaust: 'stop' })]
  }
]

export const transferEvent = {
  key: 'transfer',
  name: '调岗',
  desc: '门店或岗位调整，交付到权限切换与薪酬生效',
  scope: {
    jobs: ['推拿师', '客户经理', '前台', '店长'],
    cities: [],
    stores: [],
    employTypes: ['全职', '试用']
  },
  trigger: {
    type: 'business',
    eventPoint: 'transfer.apply.submitted',
    entry: '员工自助端 · 我的 · 调岗申请',
    payload: [
      { field: 'applyNo', use: 'show' },
      { field: 'empId', use: 'intake' },
      { field: 'expectDate', use: 'bind' }
    ]
  },
  skeleton: transferSkeleton,
  facts: [],
  body: TRANSFER_BODY,
  status: 'active',
  currentVersion: 1,
  versions: [{ v: 1, savedAt: '2026-11-04 20:10', savedBy: 'Lacus7', note: '首版：交接按事实 + 两级审核 + 权限切换', keys: transferSkeleton.map((s) => s.key) }],
  updatedAt: '2026-11-04 20:10',
  updatedBy: 'Lacus7'
}

/* ======================= 三、调薪 ======================= */

const RAISE_BODY = `【这件事是什么】
员工薪酬调整。从城市总提交调薪建议开始，到人事核定、总经理审批、薪酬按核定月薪生效、员工签署确认单结束。

【必须办成的事】
按子事件清单逐条交付。三道审核逐级由「需等」串起来：城市总提议、人事核定、总经理审批 —— 几级审核就几条结论。

【金额只有一个口径】
核定月薪只在人事已审核通过那条结论的字段里表达一次（核定月薪）。其余子事件只能引用（结果：人事已审核通过 · 核定月薪），不许另设「调薪金额」字段，也不许在总经理那一关再录一遍：两处都能改，薪酬取数时就不知道听谁的。

【发起只到期望】
发起侧只带期望生效月份，不带金额、也不带确定的生效月份 —— 现月薪与建议月薪是城市总那条建议里的字段，核定月薪是人事那条结论里的字段，生效月份也由人事核定。
提示词不按「谁发起」改写结构：无论发起人是 HR 还是员工，这条规则一样 —— 发起只是表达意愿，定价与定日都在后面的结论上。

【不要做什么】
不代算个税与社保基数，也不判断调薪后是否超出预算 —— 那些在薪酬侧按各自规则算。
提议不设自动通过：没有核定的建议不能直接进薪酬生效。`

const raiseSkeleton = [
  {
    key: 'proposal.city',
    goal: '城市总已提交调薪建议',
    needs: 'always',
    gate: 'must',
    after: [],
    note: '建议是提议，不是决定：核定在人事那一关',
    paths: [human('city-head', [
      it('it.raise.proposal', '调薪建议 · 城市总', '给出建议月薪与理由，写清现月薪与调整幅度', [
        f('currentSalary', '现月薪', 'number', true),
        f('proposedSalary', '建议月薪', 'number', true, '不高于现月薪 130%'),
        f('reason', '调薪理由', 'textarea', true)
      ])
    ])]
  },
  {
    key: 'review.hr',
    goal: '人事已审核通过',
    needs: 'always',
    gate: 'must',
    after: ['proposal.city'],
    note: '核定月薪只在这一处表达，其余结论引用它',
    paths: [human('hr', [
      it('it.raise.hr', '调薪核定 · 人事', '核定月薪与生效月份，作为全流程唯一口径', [
        f('approvedSalary', '核定月薪', 'number', true, '不高于建议月薪'),
        /* 发起时只给了期望月份，这里带出来给人事核，改不改由他定 */
        f('effectiveMonth', '生效月份', 'text', true, 'YYYY-MM', '', 'payload.expectMonth'),
        f('reviewNote', '审核意见', 'textarea')
      ])
    ])]
  },
  {
    key: 'review.gm',
    goal: '总经理已审核通过',
    needs: 'always',
    gate: 'must',
    after: ['review.hr'],
    note: '只看核定结果，不再录一遍金额',
    paths: [human('gm', [
      it('it.raise.gm', '调薪审批 · 总经理', '对照核定月薪与理由给出结论，写清意见', [
        f('reviewNote', '审核意见', 'textarea', true)
      ])
    ])]
  },
  {
    key: 'payroll.write',
    goal: '薪酬系统已按核定月薪生效',
    needs: 'always',
    gate: 'must',
    after: ['review.gm'],
    paths: [action('act.notifyPayrollChange', '', { times: 3, interval: '1h', onExhaust: 'human' })]
  },
  {
    key: 'letter.sign',
    goal: '调薪确认单已完成签署',
    needs: 'always',
    gate: 'must',
    after: ['review.gm'],
    note: '送达不等于签完，只认回执里的签署状态',
    paths: [{
      type: 'external',
      party: '电子签平台',
      via: 'act.pushContractChange',
      timeout: '5d',
      receipt: [{ key: 'signState', label: '员工签署状态', values: ['已签署', '已拒签', '待签署'] }],
      writeBack: 'signState'
    }]
  },
  {
    key: 'archive',
    goal: '调薪材料已归档',
    needs: 'always',
    gate: 'optional',
    after: ['payroll.write'],
    paths: [action('act.archive', '员工本人', { times: 2, interval: '1d', onExhaust: 'stop' })]
  }
]

export const raiseEvent = {
  key: 'raise',
  name: '调薪',
  desc: '年度调薪，交付到薪酬生效与员工签署确认',
  scope: {
    jobs: ['推拿师', '客户经理', '前台', '店长'],
    cities: [],
    stores: [],
    employTypes: ['全职', '试用']
  },
  trigger: {
    type: 'business',
    eventPoint: 'salary.adjust.submitted',
    entry: 'HR 后台 · 薪酬 · 发起调薪',
    payload: [
      { field: 'applyNo', use: 'show' },
      { field: 'empId', use: 'intake' },
      { field: 'expectMonth', use: 'bind' }
    ]
  },
  skeleton: raiseSkeleton,
  facts: [],
  body: RAISE_BODY,
  status: 'active',
  currentVersion: 1,
  versions: [{ v: 1, savedAt: '2026-11-04 20:10', savedBy: 'Lacus7', note: '首版：三级审核 + 唯一核定月薪 + 生效与签署', keys: raiseSkeleton.map((s) => s.key) }],
  updatedAt: '2026-11-04 20:10',
  updatedBy: 'Lacus7'
}

export const sceneEvents = [regularEvent, transferEvent, raiseEvent]
