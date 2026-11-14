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
  },
  {
    key: 'compPending',
    name: '待执行补偿金读取',
    source: '补偿金系统',
    desc: '按工号查已核定、尚未执行发放的那一笔补偿金，把金额与协议带回来；本流程不重算',
    pass: { logic: 'and', items: ['存在未执行的补偿金记录'] },
    soft: { logic: 'or', items: ['协议已双方签署', '协议待签署'] },
    fetch: {
      fields: [
        { key: 'compAmount', label: '协商补偿金' },
        { key: 'monthlyAvg', label: '月均工资（近 12 个月）' },
        { key: 'agreementNo', label: '协议编号' },
        { key: 'agreementFile', label: '协议文件' }
      ],
      cadenceHint: '人事审核通过后查一次；读不到即视为补偿金系统尚未建单'
    },
    defaultFetch: { freq: '1d', maxRuns: 3 },
    mirror: { version: 'v1', configuredBy: '邓黎英', condAt: '2026-10-26 09:00' },
    batches: [
      {
        batchNo: 'B-20261026-01',
        ranAt: '2026-10-26 09:00',
        version: 'v1',
        condAt: '2026-10-26 09:00',
        configuredBy: '邓黎英',
        scanned: 2,
        passN: 1,
        softN: 0,
        failN: 1,
        errN: 0,
        note: '只读，不改补偿金系统里的任何数值',
        pass: { logic: 'and', items: ['存在未执行的补偿金记录'] },
        soft: { logic: 'or', items: ['协议已双方签署', '协议待签署'] },
        verdicts: [
          {
            empNo: 'M00690',
            name: '吴芳',
            job: '客户经理',
            store: '上海徐汇店',
            result: '通过',
            metrics: '读到 CP-2026-0087：协商补偿金 ¥12,800，月均 ¥8,600，协议已签署',
            /* 取回的字段值随批次带回，下游按「结果：<结论> · <字段>」取 */
            values: { compAmount: 12800, monthlyAvg: 8600, agreementNo: 'CP-2026-0087', agreementFile: 'CP-2026-0087.pdf' }
          },
          {
            empNo: 'T01660',
            name: '杨春燕',
            job: '城市总',
            store: '杭州西湖店',
            result: '通过',
            metrics: '读到 CP-2026-0091：协商补偿金 ¥26,400，月均 ¥13,200，协议待签署',
            values: { compAmount: 26400, monthlyAvg: 13200, agreementNo: 'CP-2026-0091', agreementFile: 'CP-2026-0091.pdf' }
          },
          { empNo: 'T00676', name: '张三', job: '推拿师', store: '上海徐汇店', result: '未通过', metrics: '补偿金系统无未执行记录' }
        ]
      }
    ]
  },

  /* ---------------- 排班类检查项（2026-11-13 追加：给「班次请假补位」那套事件用） ----------------
   * 三条都是只读：看这个时段现在能不能补、这个人能不能接、还剩几个名额。
   * 条件主权仍在检查方（排班系统），流程侧只按 key 取结论、按字段取值。
   */
  {
    key: 'shiftQualify',
    name: '补位资格检查',
    source: '门店排班系统',
    desc: '看的人能不能进这个时段的补位池：是否在册、当天是否请假、岗位与名额档位是否匹配',
    pass: { logic: 'and', items: ['在签约门店在册', '当天无请假单', '岗位与名额档位匹配'] },
    soft: { logic: 'or', items: ['当天有班次但与本时段首尾相接', '跨店但通勤间隔 ≥ 30 分钟'] },
    fetch: {
      fields: [
        { key: 'qualifyState', label: '资格结论（可接 / 不可接 + 原因）' },
        { key: 'blockedBy', label: '不可接的原因' },
        { key: 'tierLabel', label: '命中哪个名额档位' }
      ],
      cadenceHint: '名额发布后查一次；请假状态变了重新查'
    },
    defaultFetch: { freq: '1h', maxRuns: 3 },
    mirror: { version: 'v1', configuredBy: 'Lacus7', condAt: '2026-11-13 07:00' },
    batches: [
      {
        batchNo: 'B-20261113-01',
        ranAt: '2026-11-13 07:00',
        version: 'v1',
        condAt: '2026-11-13 07:00',
        configuredBy: 'Lacus7',
        scanned: 5,
        passN: 3,
        softN: 1,
        failN: 1,
        errN: 0,
        note: '按签约门店 + 当天请假单判；首尾相接不算冲突',
        pass: { logic: 'and', items: ['在签约门店在册', '当天无请假单', '岗位与名额档位匹配'] },
        soft: { logic: 'or', items: ['当天有班次但与本时段首尾相接', '跨店但通勤间隔 ≥ 30 分钟'] },
        verdicts: [
          { empNo: 'T00680', name: '王五', job: '推拿师', store: '上海徐汇店', result: '通过', metrics: '在册、当天无请假、属非全客户经理第一档', values: { qualifyState: '可接', blockedBy: '', tierLabel: '第一档 · 非全客户经理' } },
          { empNo: 'T00682', name: '刘洋', job: '推拿师', store: '上海徐汇店', result: '软性命中', metrics: '当天早班到 18:00，与补班段 18:00 起首尾相接', values: { qualifyState: '可接（首尾相接）', blockedBy: '', tierLabel: '第二档 · 全职推拿师' } },
          { empNo: 'T00685', name: '周凯', job: '推拿师', store: '上海静安店', result: '未通过', metrics: '当天已请假（事假 1 天），不进补位池', values: { qualifyState: '不可接', blockedBy: '当天请假', tierLabel: '' } }
        ]
      }
    ]
  },
  {
    key: 'shiftConflict',
    name: '时段冲突检查',
    source: '门店排班系统',
    desc: '接手人在同一天是否已有重叠班次；跨店还要看两段之间的通勤间隔',
    pass: { logic: 'and', items: ['同日时段不重叠', '跨店通勤间隔 ≥ 30 分钟'] },
    soft: { logic: 'and', items: ['同日有班次但首尾相接', '间隔 15–30 分钟且同商圈'] },
    fetch: {
      fields: [
        { key: 'conflictFree', label: '是否无冲突' },
        { key: 'conflictWith', label: '冲突的那条班次（时段 + 起止）' }
      ],
      cadenceHint: '接手人确认后查一次'
    },
    defaultFetch: { freq: '1h', maxRuns: 3 },
    mirror: { version: 'v1', configuredBy: 'Lacus7', condAt: '2026-11-13 07:00' },
    batches: [
      {
        batchNo: 'B-20261113-02',
        ranAt: '2026-11-13 07:00',
        version: 'v1',
        condAt: '2026-11-13 07:00',
        configuredBy: 'Lacus7',
        scanned: 4,
        passN: 3,
        softN: 1,
        failN: 0,
        errN: 0,
        note: '首尾相接可接；跨店间隔 30 分钟为硬底线',
        pass: { logic: 'and', items: ['同日时段不重叠', '跨店通勤间隔 ≥ 30 分钟'] },
        soft: { logic: 'and', items: ['同日有班次但首尾相接', '间隔 15–30 分钟且同商圈'] },
        verdicts: [
          { empNo: 'T00680', name: '王五', job: '推拿师', store: '上海徐汇店', result: '通过', metrics: '当天无其他班次，可整段接手', values: { conflictFree: '是', conflictWith: '' } },
          { empNo: 'T00682', name: '刘洋', job: '推拿师', store: '上海徐汇店', result: '软性命中', metrics: '早班 10:00–18:00 与本段首尾相接，不重叠', values: { conflictFree: '是（首尾相接）', conflictWith: '早班 10:00–18:00' } }
        ]
      }
    ]
  },
  {
    key: 'shiftQuotaLeft',
    name: '补位名额余量读取',
    source: '门店排班系统',
    desc: '读这个时段现在还空几个名额、已排几个人；只读，不改名额',
    pass: { logic: 'and', items: ['补位名额 ≥ 1'] },
    soft: null,
    fetch: {
      fields: [
        { key: 'quotaTotal', label: '名额总数' },
        { key: 'quotaFilled', label: '已占位数' },
        { key: 'quotaLeft', label: '剩余可分配数' }
      ],
      cadenceHint: '补位分配前后各查一次'
    },
    defaultFetch: { freq: '1h', maxRuns: 3 },
    mirror: { version: 'v1', configuredBy: 'Lacus7', condAt: '2026-11-13 07:00' },
    batches: [
      {
        batchNo: 'B-20261113-03',
        ranAt: '2026-11-13 07:00',
        version: 'v1',
        condAt: '2026-11-13 07:00',
        configuredBy: 'Lacus7',
        scanned: 3,
        passN: 3,
        softN: 0,
        failN: 0,
        errN: 0,
        note: '原班次释放后余量回到 2；补班段按 4 小时上限切成两段各 1 个',
        pass: { logic: 'and', items: ['补位名额 ≥ 1'] },
        soft: null,
        verdicts: [
          { empNo: 'T00676', name: '张三', job: '推拿师', store: '上海徐汇店', result: '通过', metrics: '晚班 14:00–22:00 释放后余量 1；补班段 14–18 / 18–22 各 1 个', values: { quotaTotal: 2, quotaFilled: 1, quotaLeft: 1 } },
          { empNo: 'T00680', name: '王五', job: '推拿师', store: '上海徐汇店', result: '通过', metrics: '本时段余量 1', values: { quotaTotal: 1, quotaFilled: 0, quotaLeft: 1 } }
        ]
      }
    ]
  },
  {
    /* 取消 / 转移 / 换班三件事的第一步都是它：这一单要做的操作，时段规则允不允许、来不来得及。
       规则是生成时快照到实例的（改规则不回溯），所以判定读的是这一单自己的快照，不读现行配置。 */
    key: 'aftercareRuleCheck',
    name: '后续处理规则校验',
    source: '门店排班系统',
    desc: '取消、转移、换班都先问这条：这一单要做的操作在时段的后续处理规则里允不允许、有没有过操作截止时间',
    pass: { logic: 'and', items: ['快照规则允许该操作', '未过操作截止时间'] },
    soft: null,
    fetch: {
      fields: [
        { key: 'opAllowed', label: '操作是否允许（取消 / 转移 / 换班）' },
        { key: 'deadline', label: '操作截止时刻' },
        { key: 'releaseMode', label: '取消后名额去向（回池 / 作废）' }
      ],
      cadenceHint: '发起那一刻查一次，结论落到单子上不再变'
    },
    defaultFetch: { freq: '1h', maxRuns: 1 },
    mirror: { version: 'v1', configuredBy: 'Lacus7', condAt: '2026-11-13 07:00' },
    batches: [
      {
        batchNo: 'B-20261113-04',
        ranAt: '2026-11-13 07:00',
        version: 'v1',
        condAt: '2026-11-13 07:00',
        configuredBy: 'Lacus7',
        scanned: 3,
        passN: 2,
        softN: 0,
        failN: 1,
        errN: 0,
        note: '读的是实例快照：规则后来改了不影响已经发出来的单子',
        pass: { logic: 'and', items: ['快照规则允许该操作', '未过操作截止时间'] },
        soft: null,
        verdicts: [
          { empNo: 'T00685', name: '周凯', job: '推拿师', store: '上海徐汇店', result: '通过', metrics: '晚班快照：可取消、截止班次前 6 小时，现在 07:00 离 18:00 开班还早', values: { opAllowed: '允许（取消）', deadline: '班次前 6 小时', releaseMode: '回池' } },
          { empNo: 'T00682', name: '刘洋', job: '推拿师', store: '上海徐汇店', result: '通过', metrics: '早班快照：可转移、限同岗位，接收方同为推拿师', values: { opAllowed: '允许（转移）', deadline: '未过', releaseMode: '' } },
          { empNo: 'T00676', name: '张三', job: '推拿师', store: '上海徐汇店', result: '未通过', metrics: '通班快照：取消、转移、换班全部不允许（通班兜底不可流转）', values: { opAllowed: '不允许', deadline: '', releaseMode: '' } }
        ]
      }
    ]
  },
  {
    /* 转移 / 换班的对方确认不是人在流程里点按钮那一步 —— 确认发生在移动端，落成一条回执事实；
       流程侧按小时问一句「确认了没、等待期过了没」，跟「离职日期到没到」同一个套路：
       确认了往下走，还在等待期内等下一批（不是失败），超时未确认判「失效」终止这一单。 */
    key: 'waitPeriodExpired',
    name: '等待期是否超时',
    source: '门店排班系统',
    desc: '转移、换班发出后按小时查：对方在移动端确认了没有；确认了就往下走，超时未确认这一单失效、占位不动',
    pass: { logic: 'and', items: ['等待期内对方已确认', '未超等待期时限'] },
    soft: null,
    fetch: {
      fields: [
        { key: 'peerConfirmed', label: '对方是否已确认' },
        { key: 'confirmedAt', label: '确认时刻' },
        { key: 'waitLeft', label: '距等待期截止还有多久' }
      ],
      cadenceHint: '按小时查一次，最长查 48 小时；确认或超时任一发生即停'
    },
    defaultFetch: { freq: '1h', maxRuns: 48 },
    mirror: { version: 'v1', configuredBy: 'Lacus7', condAt: '2026-11-13 07:00' },
    batches: [
      {
        batchNo: 'B-20261113-05',
        ranAt: '2026-11-13 07:00',
        version: 'v1',
        condAt: '2026-11-13 07:00',
        configuredBy: 'Lacus7',
        scanned: 2,
        passN: 1,
        softN: 0,
        failN: 1,
        errN: 0,
        note: '未到不算失败，等下一批；超时那一批直接判「失效」，由编排终止单子',
        pass: { logic: 'and', items: ['等待期内对方已确认', '未超等待期时限'] },
        soft: null,
        verdicts: [
          { empNo: 'T00680', name: '王五', job: '推拿师', store: '上海徐汇店', result: '通过', metrics: '16:52 在移动端确认接受，距截止还有 2 小时', values: { peerConfirmed: '是', confirmedAt: '2026-11-13 16:52', waitLeft: '2 小时' } },
          { empNo: 'T00685', name: '周凯', job: '推拿师', store: '上海静安店', result: '未通过', metrics: '等待期已过 20:00，对方一直未确认 —— 本单失效，占位不动', values: { peerConfirmed: '否', confirmedAt: '', waitLeft: '已超时' } }
        ]
      }
    ]
  },

  /* ---------------- 离职生效（2026-11-13 追加） ----------------
   * 不是新机制，就是一条普通的系统判断项：问人事系统「这个人的离职日期到了没」。
   * 检查方按天跑批，结论随批次回来；没到就等下一批（不是失败），到了就往下走。
   * 之所以需要它：离职单从提交到签署早就办完了，但人还没走 ——
   * 真正要动排班的是生效那天，而那天不是任何一个「人办完」的时刻。
   */
  {
    key: 'effectiveDateReached',
    name: '离职日期是否到达',
    source: '人事系统',
    desc: '这一单核定下来的实际离职日期到了没有；到了才该动排班，没到就等下一批',
    pass: { logic: 'and', items: ['今天 ≥ 实际离职日期'] },
    soft: null,
    fetch: {
      fields: [
        { key: 'effectiveDate', label: '实际离职日期' },
        { key: 'today', label: '判定当日' },
        { key: 'daysLeft', label: '距生效还有几天' }
      ],
      cadenceHint: '按天跑一批，到了就停'
    },
    defaultFetch: { freq: '1d', maxRuns: 40 },
    mirror: { version: 'v1', configuredBy: 'Lacus7', condAt: '2026-11-13 17:00' },
    batches: [
      {
        batchNo: 'B-20261113-09',
        ranAt: '2026-11-13 07:00',
        version: 'v1',
        condAt: '2026-11-13 17:00',
        configuredBy: 'Lacus7',
        scanned: 3,
        passN: 2,
        softN: 0,
        failN: 1,
        errN: 0,
        note: '按实际离职日期与当日比较；没到不算失败，等下一批再看',
        pass: { logic: 'and', items: ['今天 ≥ 实际离职日期'] },
        soft: null,
        verdicts: [
          { empNo: 'TL1834', name: '郑一鸣', job: '客户经理', store: '上海徐汇店', result: '通过', metrics: '实际离职日期 2026-11-05，已过 8 天', values: { effectiveDate: '2026-11-05', today: '2026-11-13', daysLeft: 0 } },
          { empNo: 'TL2015', name: '赵文博', job: '前台', store: '上海静安店', result: '通过', metrics: '实际离职日期 2026-09-30，已过 44 天', values: { effectiveDate: '2026-09-30', today: '2026-11-13', daysLeft: 0 } },
          { empNo: 'TL1660', name: '杨春燕', job: '城市总', store: '上海', result: '未通过', metrics: '实际离职日期 2026-11-20，还差 7 天', values: { effectiveDate: '2026-11-20', today: '2026-11-13', daysLeft: 7 } }
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
    key: 'act.compPayout',
    name: '写入补偿金与常乐豆处置',
    source: '薪酬系统',
    mode: 'execute',
    target: '离职结算单据',
    targetFrom: '按工号定位这一单的补偿金单据（含待执行的那一笔）',
    args: [
      { key: 'empNo', label: '员工工号', from: 'facts' },
      { key: 'compAmount', label: '协商补偿金', from: '结果：离职补偿金与常乐豆余额处置已确认 · 协商补偿金' },
      { key: 'beanPayout', label: '常乐豆余额出口', from: '结果：离职补偿金与常乐豆余额处置已确认 · 常乐豆余额出口' },
      { key: 'actualDate', label: '实际离职日期', from: '结果：城市总已审核通过 · 实际离职日期' }
    ],
    receipt: [
      { key: 'billNo', label: '补偿金单据号' },
      { key: 'beanIntent', label: '常乐豆处置（通道 + 生效日）' },
      { key: 'result', label: '写入结果' },
      { key: 'at', label: '完成时间' }
    ],
    idempotent: '工号 + 单据号：重复触发不重复写入',
    fallback: '写入失败重试 3 次，仍失败转薪酬人工处理，本流程记未取得回执',
    note: '只写「协商金额 + 常乐豆走哪条通道 + 实际离职日期」，不结算、不扣减；并入、冻结、跑批、发放、个税全部由薪酬系统按补偿金逻辑处理'
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
    name: '清除生效日后的排班结果',
    source: '门店排班系统',
    mode: 'execute',
    target: '班次',
    targetFrom: '离职生效日之后仍存在的那几条排班结果行',
    args: [
      { key: 'empNo', label: '员工工号', from: 'facts' },
      { key: 'effectiveDate', label: '实际离职日期', from: '结果：离职日期已到' }
    ],
    receipt: [{ key: 'shiftNo', label: '班次号' }, { key: 'result', label: '清除结果' }],
    idempotent: '工号 + 班次号',
    fallback: '失败转店长人工清除，不阻塞离职',
    note: '清的是结果表里那几行，不动时段名额 —— 名额是容量，人走了是换人接，不是把名额注销；已发生的考勤归假勤核算'
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
  },
  /* ---------------- 人事变更类事件（转正 / 调岗 / 调薪）引用的动作 ----------------
   * 与离职场合一类：都是「改一条台账、发一份东西、拿回执」，只是变更对象不同。
   * 不另立一套动作模型 —— 动作就是系统真的能做的那件事，不分事件。
   */
  {
    key: 'act.grantPerm',
    name: '开通系统权限',
    source: '统一身份平台',
    mode: 'execute',
    target: '账号',
    targetFrom: '新岗位应有的权限配置（按岗位基线给出）',
    args: [
      { key: 'empNo', label: '员工工号', from: 'facts' },
      { key: 'account', label: '账号标识', from: 'facts' },
      { key: 'effectiveAt', label: '生效时间', from: 'payload' }
    ],
    receipt: [
      { key: 'account', label: '账号' },
      { key: 'result', label: '开通结果（成功 / 已存在 / 失败）' },
      { key: 'at', label: '完成时间' }
    ],
    idempotent: '工号 + 账号 + 生效日：重复触发不重复开通',
    fallback: '单账号失败重试 3 次，仍失败转 IT 人工，其余账号照常推进',
    note: '与撤销权限成对：撤销的是原岗位的，开通的是新岗位的，一次变更两笔账'
  },
  {
    key: 'act.updateStaffProfile',
    name: '更新员工档案',
    source: '员工档案系统',
    mode: 'execute',
    target: '档案',
    targetFrom: '按工号定位这一单的员工档案',
    args: [
      { key: 'empNo', label: '员工工号', from: 'facts' },
      { key: 'changeType', label: '变更项（转正 / 调岗 / 调薪）', from: 'payload' },
      { key: 'effectiveAt', label: '生效日期', from: 'payload' }
    ],
    receipt: [
      { key: 'changeNo', label: '变更单号' },
      { key: 'result', label: '写入结果' },
      { key: 'at', label: '完成时间' }
    ],
    idempotent: '工号 + 变更项 + 生效日',
    fallback: '失败转人事人工补录，不阻塞后续通知',
    note: '档案是下游口径的来源：这一条不落，薪酬与权限拿到的新岗位就没有依据'
  },
  {
    key: 'act.notifyPayrollChange',
    name: '通知薪酬变更',
    source: '薪酬系统',
    mode: 'notify',
    target: '单据',
    targetFrom: '按工号生成的变更通知单',
    args: [
      { key: 'empNo', label: '员工工号', from: 'facts' },
      { key: 'changeType', label: '变更类型', from: 'payload' },
      { key: 'effectiveAt', label: '生效日期', from: 'payload' }
    ],
    receipt: [
      { key: 'subscriber', label: '订阅方' },
      { key: 'result', label: '投递结果' },
      { key: 'at', label: '投递时间' }
    ],
    idempotent: '工号 + 变更类型 + 生效日',
    fallback: '投递失败重试 2 次，仍失败转薪酬人工接收',
    note: '只证明送达，不证明薪酬已按新口径算过 —— 算账在薪酬侧，不在我们这一步'
  },
  {
    key: 'act.pushContractChange',
    name: '推送合同变更',
    source: '电子签平台',
    mode: 'execute',
    target: '单据',
    targetFrom: '按工号生成的合同变更文本',
    args: [
      { key: 'empNo', label: '员工工号', from: 'facts' },
      { key: 'changeType', label: '变更类型', from: 'payload' },
      { key: 'effectiveAt', label: '生效日期', from: 'payload' }
    ],
    receipt: [
      { key: 'docNo', label: '外部单号' },
      { key: 'result', label: '送达结果' }
    ],
    idempotent: '工号 + 变更类型 + 生效日',
    fallback: '推送失败重试 3 次，仍失败转人事线下处理',
    note: '送达不等于签完：签署状态要另一条外部回执认，别拿送达当签署'
  },

  /* ---------------- 排班类动作（2026-11-13 追加） ----------------
   * 与前面那些同构：改一条数据、发一份东西、拿回执；只是对象从「人的档案」换成「时段的占位」。
   * 分工口径沿用排班 v4 的定案：时段=容量形态，名额=分配单位，占位=人 × 名额的绑定；
   * 写结果表只有一处入口，别在别处顺手改占位。
   */
  {
    key: 'act.releaseShift',
    name: '释放时段名额',
    source: '门店排班系统',
    mode: 'execute',
    target: '时段',
    targetFrom: '请假覆盖的那个时段实例（可按请假单定位）',
    args: [
      { key: 'empNo', label: '请假人工号', from: 'facts' },
      { key: 'shiftNo', label: '时段编号', from: 'payload' },
      { key: 'releaseMode', label: '名额去向（回池 / 作废）', from: 'payload' }
    ],
    receipt: [
      { key: 'releasedCount', label: '释放的名额数' },
      { key: 'releaseResult', label: '释放结果（回池 / 作废 / 失败）' }
    ],
    idempotent: '时段编号 + 请假人工号：重复触发不重复释放',
    fallback: '释放失败重试 2 次，仍失败转店长人工处理，不阻塞后续补位',
    note: '只把这个人占的那一格放出来，不动时段本身；是否回池由时段规则定，不由这一步擅自决定'
  },
  {
    key: 'act.makeupShifts',
    name: '生成补班时段',
    source: '门店排班系统',
    mode: 'execute',
    target: '时段',
    targetFrom: '被覆盖的时间区间（请假时段的起止）',
    args: [
      { key: 'coveredStart', label: '被覆盖起', from: 'payload' },
      { key: 'coveredEnd', label: '被覆盖止', from: 'payload' },
      { key: 'maxHoursPerShift', label: '单人单段上限（小时）', from: 'input' }
    ],
    receipt: [
      { key: 'makeupSlotIds', label: '生成的补班时段编号' },
      { key: 'slotCount', label: '生成段数' },
      { key: 'makeupResult', label: '生成结果' }
    ],
    idempotent: '被覆盖区间 + 上限：同一区间重复生成不叠加，只补缺的那几段',
    fallback: '生成失败重试 2 次，仍失败转人事手工加班次',
    note: '按上限切段，不按人切：切出来的是容量形态，占位留给分配那一步'
  },
  {
    key: 'act.calcQuota',
    name: '算补位名额',
    source: '门店排班系统',
    mode: 'execute',
    target: '时段',
    targetFrom: '刚生成的补班时段',
    args: [
      { key: 'slotIds', label: '补班时段编号', from: '结果：补班时段已生成 · 生成的补班时段编号' },
      { key: 'algoKey', label: '名额算法（覆盖法 / 签约比 / 固定值）', from: 'input' }
    ],
    receipt: [
      { key: 'quotaValue', label: '算出的名额数' },
      { key: 'quotaExpr', label: '算式（怎么算出来的）' },
      { key: 'calcResult', label: '计算结果' }
    ],
    idempotent: '时段编号 + 算法：同一参数重复算得同一个数',
    fallback: '算法取不到数就落到「人工固定 1 个」，并留一条说明，不空着时段',
    note: '只算不发布：算出来的是系统建议值，中间留人工改动窗；算式必须一起带回，否则谁都说不清这个数怎么来的'
  },
  {
    key: 'act.publishQuota',
    name: '发布补位名额',
    source: '门店排班系统',
    mode: 'execute',
    target: '时段',
    targetFrom: '补班时段的建议名额',
    args: [
      { key: 'slotIds', label: '补班时段编号', from: '结果：补班时段已生成 · 生成的补班时段编号' },
      { key: 'publishAt', label: '发布时刻', from: 'payload' }
    ],
    receipt: [
      { key: 'publishedCount', label: '发布名额数' },
      { key: 'visibleTo', label: '可见人群（第一档先可见 / 全档可见）' },
      { key: 'publishResult', label: '发布结果' }
    ],
    idempotent: '时段编号 + 发布时刻：重复发布覆盖同一批，不叠加名额',
    fallback: '发布失败重试 3 次，仍失败转人事手动发布；未发布的时段不进任何人的可领列表',
    note: '发布才算「可见」：在此之前名额存在但没人能领；档位开放时间从这里起算'
  },
  {
    key: 'act.allocateShift',
    name: '按优先序列分配补位',
    source: '门店排班系统',
    mode: 'execute',
    target: '人',
    targetFrom: '本时段补位池里符合档位的人（按档位从高到低）',
    args: [
      { key: 'slotIds', label: '补班时段编号', from: '结果：补班时段已发布 · 补班时段编号' },
      { key: 'tierOrder', label: '优先序列（档位 → 人群）', from: 'input' },
      { key: 'conflictFree', label: '无时段冲突', from: '结果：时段冲突检查已通过 · 是否无冲突' }
    ],
    receipt: [
      { key: 'fillPerson', label: '补上的那个人' },
      { key: 'fillWay', label: '承接方式（系统补位 / 兜底 / 无人接）' },
      { key: 'fillResult', label: '分配结果' }
    ],
    idempotent: '时段编号 + 人：同一段不会重复塞同一个人',
    fallback: '档位全空就留空并标记「无人接」，转人事手动指定，不硬塞档位外的人',
    note: '按档位顺序吃名额，不是挑最闲的人；档位外的人不因为空着就放进来'
  },
  {
    key: 'act.writeScheduleResult',
    name: '写排班结果',
    source: '门店排班系统',
    mode: 'execute',
    target: '单据',
    targetFrom: '这一单的补位结果（时段 × 人）',
    args: [
      { key: 'slotIds', label: '补班时段编号', from: '结果：补班时段已发布 · 补班时段编号' },
      { key: 'fillPerson', label: '补上的人', from: '结果：补位分配已确定 · 补上的那个人' }
    ],
    receipt: [
      { key: 'scheduleRowNos', label: '排班记录编号' },
      { key: 'writeResult', label: '写入结果' }
    ],
    idempotent: '时段编号 + 人：重复写入是覆盖同一条，不新增重复占位',
    fallback: '写入失败重试 3 次，仍失败转人事手工补录并标记「结果未落库」',
    note: '全流程唯一写占位的口；这一条不落，前面释放和分配都只是中间态，人的时间线上看不到'
  },
  {
    key: 'act.transferOccupy',
    name: '占位换主（转移承接）',
    source: '门店排班系统',
    mode: 'execute',
    target: '占位',
    targetFrom: '发起人转出的那个时段占位',
    args: [
      { key: 'instanceId', label: '时段实例编号', from: 'payload' },
      { key: 'fromEmpNo', label: '原持有人（发起人）', from: 'facts' },
      { key: 'toEmpNo', label: '接手人', from: 'payload' }
    ],
    receipt: [
      { key: 'transferResult', label: '换主结果' },
      { key: 'historyRef', label: '原占位留痕编号' }
    ],
    idempotent: '时段实例编号 + 接手人：重复执行是同一次换主，不产生第二个占位',
    fallback: '执行失败重试 2 次，仍失败转人事人工换主；原占位保持不动',
    note: '换的是「人 × 名额」的绑定，名额本身不释放也不回池：filled / left 都不变，原占位进历史留痕'
  },
  {
    key: 'act.swapOccupy',
    name: '对调占位（换班）',
    source: '门店排班系统',
    mode: 'execute',
    target: '占位',
    targetFrom: '发起人与对方各自的时段占位（两个编号在发起时绑定）',
    args: [
      { key: 'instanceId', label: '发起人的班次编号', from: 'payload' },
      { key: 'toInstanceId', label: '对方的班次编号', from: 'payload' },
      { key: 'fromEmpNo', label: '发起人工号', from: 'facts' },
      { key: 'toEmpNo', label: '对方工号', from: 'payload' }
    ],
    receipt: [
      { key: 'swapResult', label: '对调结果' },
      { key: 'historyRefs', label: '两条原占位留痕编号' }
    ],
    idempotent: '两个班次编号：同一对班次重复对调不叠加',
    fallback: '任一边执行失败则两边一起回滚（对调要么成要么不成，不做半套），转人事人工处理',
    note: '双向对价：两边占位一起换，名额池 filled / left 都不动；两条原占位各进各的历史，标「换给谁」'
  }
]
export const actionByKey = (k) => actions.find((a) => a.key === k) || null
export const actionName = (k) => (actionByKey(k) || {}).name || k
