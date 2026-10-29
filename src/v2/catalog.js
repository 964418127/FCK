/**
 * 系统项目录（数据，不是契约）
 *
 * 这里放「系统能替人做的两类事」，是生成的**闭集**：
 *   判定 check —— 只出结论，不改数据（对应 way.type = system）
 *   执行 action —— 真的改数据或发出东西，拿回执（对应 way.type = action）
 *
 * 与 contract.js 的分工：
 *   contract.js 说「有哪两类、各自有哪些字段」；本文件说「实际登记了哪几条」。
 *   生成时模型只能从这里挑 key，挑不到就必须回到这里登记，不许自造。
 *
 * 条件（pass / soft）与批次归检查方，流程侧只读；生成侧只能选 key 并调取数频率与批次上限。
 */

/* ---------------- 系统检查项（只读引用，条件主权在检查方） ---------------- */

export const systemChecks = [
  {
    key: 'debt',
    name: '负债检查',
    source: '财务模块',
    desc: '是否存在未结清借款、欠款或备用金缺口',
    pass: { logic: 'and', items: ['未结清借款 = 0', '欠款 = 0', '备用金缺口 = 0'] },
    soft: { logic: 'and', items: ['-100 ≤ 欠款合计', '欠款合计 < 0'] },
    fetch: {
      fields: [
        { key: 'loanOutstanding', label: '未结清借款金额' },
        { key: 'debtTotal', label: '欠款合计' },
        { key: 'pettyCashGap', label: '备用金缺口' }
      ],
      cadenceHint: '每日 08:30 跑一批'
    },
    defaultFetch: { freq: '1d', maxRuns: 5 },
    mirror: { version: 'v3', configuredBy: '邓黎英', condAt: '2026-10-24 08:00' },
    batches: [
      {
        batchNo: 'B-20261024-01',
        ranAt: '2026-10-24 08:30',
        version: 'v3',
        condAt: '2026-10-24 08:00',
        configuredBy: '邓黎英',
        scanned: 4,
        passN: 2,
        softN: 0,
        failN: 2,
        errN: 0,
        note: '软性区间从 500 收窄到 100',
        pass: { logic: 'and', items: ['未结清借款 = 0', '欠款 = 0', '备用金缺口 = 0'] },
        soft: { logic: 'and', items: ['-100 ≤ 欠款合计', '欠款合计 < 0'] },
        verdicts: [
          { empNo: 'T00676', name: '张三', job: '推拿师', store: '上海徐汇店', result: '未通过', metrics: '未结清借款 ¥320，三项条件命中 1 项' },
          { empNo: 'T00680', name: '王五', job: '推拿师', store: '上海徐汇店', result: '通过', metrics: '无未结清负债（三项条件全部命中）' },
          { empNo: 'T00681', name: '陈晨', job: '推拿师', store: '上海浦东店', result: '通过', metrics: '无未结清负债（三项条件全部命中）' },
          { empNo: 'T00683', name: '孙悦', job: '推拿师', store: '杭州西湖店', result: '未通过', metrics: '欠款合计 ¥80，未命中软性区间（-100 ~ 0）' }
        ]
      },
      {
        batchNo: 'B-20261023-01',
        ranAt: '2026-10-23 08:30',
        version: 'v2',
        condAt: '2026-10-20 08:00',
        configuredBy: '李文静',
        scanned: 3,
        passN: 2,
        softN: 0,
        failN: 1,
        errN: 0,
        note: '',
        pass: { logic: 'and', items: ['未结清借款 = 0', '欠款 = 0', '备用金缺口 = 0'] },
        soft: { logic: 'and', items: ['-500 ≤ 欠款合计', '欠款合计 < 0'] },
        verdicts: [
          { empNo: 'T00676', name: '张三', job: '推拿师', store: '上海徐汇店', result: '通过', metrics: '无未结清负债' },
          { empNo: 'T00680', name: '王五', job: '推拿师', store: '上海徐汇店', result: '通过', metrics: '无未结清负债' },
          { empNo: 'T00683', name: '孙悦', job: '推拿师', store: '杭州西湖店', result: '未通过', metrics: '欠款合计 ¥120，未命中任何区间' }
        ]
      }
    ]
  },
  {
    key: 'asset',
    name: '资产归还检查',
    source: '资产台账',
    desc: '工服、工具、设备等是否全部归还销账',
    pass: { logic: 'and', items: ['应归还资产未销账 = 0 件'] },
    soft: { logic: 'and', items: ['未销账 ≤ 1 件', '剩余物品已约定归还日期'] },
    fetch: {
      fields: [
        { key: 'unreturnedCount', label: '未销账资产件数' },
        { key: 'unreturnedItems', label: '未销账明细（物品 / 门店仓）' }
      ],
      cadenceHint: '每日 09:00 跑一批'
    },
    defaultFetch: { freq: '1d', maxRuns: 5 },
    mirror: { version: 'v2', configuredBy: '邢斌', condAt: '2026-10-12 09:00' },
    batches: [
      {
        batchNo: 'B-20261017-01',
        ranAt: '2026-10-17 09:00',
        version: 'v2',
        condAt: '2026-10-12 09:00',
        configuredBy: '邢斌',
        scanned: 3,
        passN: 0,
        softN: 1,
        failN: 2,
        errN: 0,
        note: '工服销账口径按门店仓',
        pass: { logic: 'and', items: ['应归还资产未销账 = 0 件'] },
        soft: { logic: 'and', items: ['未销账 ≤ 1 件', '剩余物品已约定归还日期'] },
        verdicts: [
          { empNo: 'J00692', name: '钱七', job: '推拿师', store: '上海徐汇店', result: '未通过', metrics: '应归还资产未销账 1 件（工服 1）' },
          { empNo: 'T00685', name: '周凯', job: '推拿师', store: '上海静安店', result: '未通过', metrics: '应归还资产未销账 2 件（工服 2）' },
          { empNo: 'P00684', name: '李四', job: '推拿师', store: '上海徐汇店', result: '软性命中', metrics: '未销账 1 件（工服 1），已约定 10-19 前归还' }
        ]
      },
      {
        batchNo: 'B-20261016-01',
        ranAt: '2026-10-16 09:00',
        version: 'v2',
        condAt: '2026-10-12 09:00',
        configuredBy: '邢斌',
        scanned: 2,
        passN: 0,
        softN: 1,
        failN: 1,
        errN: 0,
        note: '',
        pass: { logic: 'and', items: ['应归还资产未销账 = 0 件'] },
        soft: { logic: 'and', items: ['未销账 ≤ 1 件', '剩余物品已约定归还日期'] },
        verdicts: [
          { empNo: 'J00692', name: '钱七', job: '推拿师', store: '上海徐汇店', result: '未通过', metrics: '应归还资产未销账 2 件（工服 2）' },
          { empNo: 'P00684', name: '李四', job: '推拿师', store: '上海徐汇店', result: '软性命中', metrics: '未销账 1 件（工服 1），已约定归还日期' }
        ]
      }
    ]
  },
  {
    key: 'complaint',
    name: '客诉纠纷检查',
    source: '客诉工单',
    desc: '是否有未完结的客诉与纠纷工单',
    pass: { logic: 'and', items: ['近 30 天待处理工单 = 0'] },
    soft: { logic: 'or', items: ['待处理 ≤ 2 件', '均已达成和解意向并进入处理流程'] },
    fetch: {
      fields: [
        { key: 'openTicketCount', label: '近 30 天待处理工单数' },
        { key: 'ticketStatusList', label: '工单状态明细' }
      ],
      cadenceHint: '每日 09:00 跑一批'
    },
    defaultFetch: { freq: '2h', maxRuns: 5 },
    mirror: { version: 'v2', configuredBy: '邓黎英', condAt: '2026-10-20 09:00' },
    batches: [
      {
        batchNo: 'B-20261020-01',
        ranAt: '2026-10-20 09:10',
        version: 'v2',
        condAt: '2026-10-20 09:00',
        configuredBy: '邓黎英',
        scanned: 3,
        passN: 1,
        softN: 1,
        failN: 1,
        errN: 0,
        note: '软性增加「已达成和解意向」通道',
        pass: { logic: 'and', items: ['近 30 天待处理工单 = 0'] },
        soft: { logic: 'or', items: ['待处理 ≤ 2 件', '均已达成和解意向并进入处理流程'] },
        verdicts: [
          { empNo: 'T00701', name: '赵敏', job: '推拿师', store: '成都春熙路店', result: '未通过', metrics: '近 30 天待处理工单 2 件，未命中任何区间' },
          { empNo: 'M00690', name: '吴芳', job: '客户经理', store: '上海徐汇店', result: '软性命中', metrics: '待处理 1 件（≤ 2），已达成和解意向' },
          { empNo: 'T00681', name: '陈晨', job: '推拿师', store: '上海浦东店', result: '通过', metrics: '近 30 天待处理工单 0 件' }
        ]
      },
      {
        batchNo: 'B-20261017-03',
        ranAt: '2026-10-17 15:00',
        version: 'v1',
        condAt: '2026-09-28 10:00',
        configuredBy: '王慧',
        scanned: 2,
        passN: 0,
        softN: 1,
        failN: 1,
        errN: 0,
        note: '',
        pass: { logic: 'and', items: ['近 30 天待处理工单 = 0'] },
        soft: { logic: 'or', items: ['待处理 ≤ 1 件'] },
        verdicts: [
          { empNo: 'T00701', name: '赵敏', job: '推拿师', store: '成都春熙路店', result: '未通过', metrics: '近 30 天待处理工单 3 件' },
          { empNo: 'M00690', name: '吴芳', job: '客户经理', store: '上海徐汇店', result: '软性命中', metrics: '待处理 1 件（≤ 1）' }
        ]
      }
    ]
  },
  {
    key: 'schedule',
    name: '在途排班检查',
    source: '排班系统',
    desc: '期望离职日期之后是否仍有已排班次',
    pass: { logic: 'and', items: ['期望离职日期后在途班次 = 0'] },
    soft: { logic: 'and', items: ['在途班次 ≤ 1', '剩余班次均可调休替'] },
    fetch: {
      fields: [
        { key: 'shiftAfterLastDay', label: '期望离职日期后的在途班次数' },
        { key: 'shiftList', label: '班次明细' }
      ],
      cadenceHint: '每日 07:00 跑一批'
    },
    defaultFetch: { freq: '12h', maxRuns: 5 },
    mirror: { version: 'v1', configuredBy: '钱伟', condAt: '2026-09-15 09:00' },
    batches: [
      {
        batchNo: 'B-20261018-01',
        ranAt: '2026-10-18 07:00',
        version: 'v1',
        condAt: '2026-09-15 09:00',
        configuredBy: '钱伟',
        scanned: 2,
        passN: 2,
        softN: 0,
        failN: 0,
        errN: 0,
        note: '',
        pass: { logic: 'and', items: ['期望离职日期后在途班次 = 0'] },
        soft: { logic: 'and', items: ['在途班次 ≤ 1', '剩余班次均可调休替'] },
        verdicts: [
          { empNo: 'T00682', name: '刘洋', job: '推拿师', store: '上海徐汇店', result: '通过', metrics: '期望离职日期后无在途班次' },
          { empNo: 'T00683', name: '孙悦', job: '推拿师', store: '杭州西湖店', result: '通过', metrics: '期望离职日期后无在途班次' }
        ]
      }
    ]
  },
  {
    key: 'bean',
    name: '常乐豆余额检查',
    source: '常乐豆',
    desc: '是否存在未结算账期或负余额',
    pass: { logic: 'and', items: ['账面余额已冻结且待结 = 0'] },
    soft: null,
    fetch: {
      fields: [
        { key: 'accountBalance', label: '账户余额' },
        { key: 'freezeStatus', label: '冻结状态' },
        { key: 'pendingSettleAmount', label: '待结金额' }
      ],
      cadenceHint: '每日 06:00 跑一批'
    },
    defaultFetch: { freq: '1d', maxRuns: 3 },
    mirror: { version: 'v1', configuredBy: '周芸', condAt: '2026-08-01 10:00' },
    batches: [
      {
        batchNo: 'B-20261015-01',
        ranAt: '2026-10-15 10:00',
        version: 'v1',
        condAt: '2026-08-01 10:00',
        configuredBy: '周芸',
        scanned: 3,
        passN: 3,
        softN: 0,
        failN: 0,
        errN: 0,
        note: '',
        pass: { logic: 'and', items: ['账面余额已冻结且待结 = 0'] },
        soft: null,
        verdicts: [
          { empNo: 'T00681', name: '陈晨', job: '推拿师', store: '上海浦东店', result: '通过', metrics: '余额已冻结，无待结账期' },
          { empNo: 'T00685', name: '周凯', job: '推拿师', store: '上海静安店', result: '通过', metrics: '余额已冻结，无待结账期' },
          { empNo: 'M00690', name: '吴芳', job: '客户经理', store: '上海徐汇店', result: '通过', metrics: '余额已冻结，无待结账期' }
        ]
      }
    ]
  },
  {
    key: 'attendance',
    name: '考勤异常检查',
    source: '假勤模块',
    desc: '是否有未处理的考勤异常与漏卡补登',
    pass: { logic: 'and', items: ['未处理异常 = 0 条'] },
    soft: { logic: 'or', items: ['排班差异 < 10%', '打卡差异 < 5%'] },
    fetch: {
      fields: [
        { key: 'openExceptionCount', label: '未处理异常条数' },
        { key: 'exceptionTypeDist', label: '异常类型分布' }
      ],
      cadenceHint: '每日 06:00 跑一批'
    },
    defaultFetch: { freq: '12h', maxRuns: 5 },
    mirror: { version: 'v2', configuredBy: '王慧', condAt: '2026-10-08 09:00' },
    batches: [
      {
        batchNo: 'B-20261019-01',
        ranAt: '2026-10-19 06:00',
        version: 'v2',
        condAt: '2026-10-08 09:00',
        configuredBy: '王慧',
        scanned: 2,
        passN: 2,
        softN: 0,
        failN: 0,
        errN: 0,
        note: '',
        pass: { logic: 'and', items: ['未处理异常 = 0 条'] },
        soft: { logic: 'or', items: ['排班差异 < 10%', '打卡差异 < 5%'] },
        verdicts: [
          { empNo: 'T00685', name: '周凯', job: '推拿师', store: '上海静安店', result: '通过', metrics: '未处理异常 0 条' },
          { empNo: 'T00683', name: '孙悦', job: '推拿师', store: '杭州西湖店', result: '通过', metrics: '未处理异常 0 条' }
        ]
      }
    ]
  }
]

export const checkByKey = (k) => systemChecks.find((x) => x.key === k) || null
export const latestBatchOf = (k) => (checkByKey(k)?.batches || [])[0] || null

/* ---------------- 终点动作（只读引用） ---------------- */

/**
 * 动作目录：系统真的能替人做的事。
 * 与「系统检查项」并列 —— 检查项只给结论，动作改数据或发出东西并拿回执。
 * 动作不分中途与终点：被收尾子事件引用，它就是终点动作。
 */
export const actions = [
  {
    key: 'act.revokePerm',
    name: '撤销系统权限',
    source: '统一身份平台',
    mode: 'execute',
    target: '账号',
    targetFrom: '该员工名下仍有效的账号清单（含岗位标准之外的）',
    args: [
      { key: 'empNo', label: '员工工号', from: 'facts' },
      { key: 'account', label: '账号标识', from: 'facts' },
      { key: 'effectiveAt', label: '生效时间', from: 'payload' }
    ],
    receipt: [
      { key: 'account', label: '账号' },
      { key: 'result', label: '撤销结果（成功 / 无此账号 / 失败）' },
      { key: 'at', label: '完成时间' }
    ],
    idempotent: '工号 + 账号 + 生效日：重复触发不重复撤销',
    fallback: '单账号失败重试 3 次，仍失败转 IT 人工处理，其余账号照常推进',
    note: '逐账号执行、逐账号回执；部分成功 = 软性，转人工处理剩余账号'
  },
  {
    key: 'act.disableAccount',
    name: '停用域账号',
    source: '目录服务',
    mode: 'execute',
    target: '账号',
    targetFrom: '该员工域账号',
    args: [{ key: 'empNo', label: '员工工号', from: 'facts' }],
    receipt: [{ key: 'result', label: '停用结果' }, { key: 'at', label: '完成时间' }],
    idempotent: '工号 + 停用类型',
    fallback: '失败转 IT 人工，不阻塞其他收尾',
    note: '与撤销业务系统权限分开：域账号停用影响登录，通常要求当日生效'
  },
  {
    key: 'act.beanPayoutIntent',
    name: '写入常乐豆处理意向',
    source: '常乐豆账户系统 · 薪酬系统',
    mode: 'execute',
    target: '员工常乐豆余额',
    targetFrom: '按工号定位这一单的员工账户（余额含待结）',
    args: [
      { key: 'empNo', label: '员工工号', from: 'facts' },
      { key: 'payout', label: '款项出口', from: '结果：人事已审核通过 · 款项出口' },
      { key: 'actualDate', label: '实际离职日期', from: '结果：城市总已审核通过 · 实际离职日期' }
    ],
    receipt: [
      { key: 'account', label: '账户' },
      { key: 'intent', label: '写入的意向（通道 + 生效日）' },
      { key: 'result', label: '写入结果' },
      { key: 'at', label: '完成时间' }
    ],
    idempotent: '工号 + 单据号 + 通道：重复触发不重复写入',
    fallback: '写入失败重试 3 次，仍失败转薪酬人工处理，本流程记未取得回执',
    note: '只写「这条余额走哪条通道、从哪天生效」的意向，不结算、不扣减；冻结与跑批由薪酬侧按意向执行'
  },
  {
    key: 'act.freezePayroll',
    name: '冻结薪酬发放',
    source: '薪酬系统',
    mode: 'execute',
    target: '单据',
    targetFrom: '员工工号',
    args: [
      { key: 'empNo', label: '员工工号', from: 'facts' },
      { key: 'freezeFrom', label: '冻结起始月', from: 'payload' }
    ],
    receipt: [{ key: 'billNo', label: '冻结单号' }, { key: 'result', label: '冻结结果' }],
    idempotent: '工号 + 起始月',
    fallback: '失败转薪酬人工，本流程只记未取得结论',
    note: '只冻结，不计算应发 —— 结算口径归薪酬系统'
  },
  {
    key: 'act.cancelSchedule',
    name: '取消未开始排班',
    source: '门店排班系统',
    mode: 'execute',
    target: '班次',
    targetFrom: '离职生效日之后该员工的全部班次',
    args: [
      { key: 'empNo', label: '员工工号', from: 'facts' },
      { key: 'effectiveAt', label: '离职生效日期', from: 'payload' }
    ],
    receipt: [{ key: 'shiftNo', label: '班次号' }, { key: 'result', label: '撤班结果' }],
    idempotent: '工号 + 班次号',
    fallback: '失败转店长人工撤班，不阻塞离职',
    note: '只撤未开始的班次；已发生的考勤归假勤系统核算，本流程不代算'
  },
  {
    key: 'act.notifyOwner',
    name: '催办待办',
    source: '消息中心',
    mode: 'notify',
    target: '人',
    targetFrom: '当前节点的责任人',
    args: [
      { key: 'empNo', label: '员工工号', from: 'facts' },
      { key: 'node', label: '节点名称', from: 'verdict' },
      { key: 'deadline', label: '截止时间', from: 'input' }
    ],
    receipt: [{ key: 'channel', label: '触达渠道' }, { key: 'result', label: '投递结果' }],
    idempotent: '工号 + 节点 + 日期',
    fallback: '失败重投；逾期升级到责任人上级',
    note: '只提醒，不改节点状态；逾期是否终止由节点的门禁决定'
  },
  {
    key: 'act.pushContract',
    name: '推送电子合同',
    source: '电子签平台',
    mode: 'deliver',
    target: '单据',
    targetFrom: '员工工号',
    args: [
      { key: 'empNo', label: '员工工号', from: 'facts' },
      { key: 'expectDate', label: '期望离职日期', from: 'payload' },
      { key: 'template', label: '合同模板', from: 'input' }
    ],
    receipt: [{ key: 'docNo', label: '外部单号' }, { key: 'result', label: '送达结果' }],
    idempotent: '工号 + 模板 + 期望离职日',
    fallback: '失败重试 2 次，仍失败转人事人工推送',
    note: '推送成功只代表送达；员工签署是外部回执，另立一条结论'
  },
  {
    key: 'act.broadcast',
    name: '广播离职结果',
    source: '消息中心',
    mode: 'notify',
    target: '系统',
    targetFrom: '订阅离职结果的系统清单',
    args: [
      { key: 'empNo', label: '员工工号', from: 'facts' },
      { key: 'effectiveAt', label: '离职生效日期', from: 'payload' }
    ],
    receipt: [{ key: 'target', label: '订阅方' }, { key: 'result', label: '投递结果' }],
    idempotent: '工号 + 事件类型：同一订阅方只投一次',
    fallback: '失败重投，24h 未达转人工通知',
    note: '薪酬 / 社保 / 假勤各自消费，本流程不做其口径计算'
  },
  {
    key: 'act.terminate',
    name: '解除用工',
    source: '人事系统',
    mode: 'execute',
    target: '单据',
    targetFrom: '员工工号',
    args: [
      { key: 'empNo', label: '员工工号', from: 'facts' },
      { key: 'terminateAt', label: '解除日期', from: 'payload' },
      { key: 'reason', label: '解除原因', from: 'input' }
    ],
    receipt: [{ key: 'result', label: '解除结果' }, { key: 'at', label: '生效时间' }],
    idempotent: '工号 + 解除日期',
    fallback: '失败转人事人工，必过项不通过即终止',
    note: '被动离职走此动作，不经过签署'
  },
  {
    key: 'act.archive',
    name: '归档人事档案',
    source: '档案系统',
    mode: 'execute',
    target: '单据',
    targetFrom: '员工工号',
    args: [{ key: 'empNo', label: '员工工号', from: 'facts' }],
    receipt: [{ key: 'archiveNo', label: '归档编号' }],
    idempotent: '工号 + 归档批次',
    fallback: '失败转档案管理员，不影响离职生效',
    note: '收尾动作，可与其他收尾并存'
  }
]
export const actionByKey = (k) => actions.find((a) => a.key === k) || null
export const actionName = (k) => (actionByKey(k) || {}).name || k
