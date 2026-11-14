/**
 * 事件点登记（由业务开发在我们的开放平台上注册，我方只读）
 *
 * 一个事件点 = 业务系统承诺「在这个时刻，我会发出这些字段」。
 * 它是**对岸的事实**，不是我们能编的：
 *   - 字段必须带 key：触发时对岸发的是 key → 值，我方按 key 取值、按 key 校验
 *   - 只登记中文名不行：两边就没有能对齐的键，只能靠人读的一句话做桥
 *   - type / required / options 由对岸给：它才知道自己发什么、哪些一定有
 *   - role='empNo' 的那个字段是引擎要用的：拿它去取员工档案
 *
 * 单独成文件的原因：它是「跨系统契约」，与演示数据（seed）不是一类东西，
 * 而载荷层要读它、seed 又要用它播种，放一处会绕成循环依赖。
 */

export const eventPoints = [
  {
    key: 'resign.apply.submitted',
    label: '离职申请提交',
    source: '员工自助端',
    entry: '员工自助端 · 我的 · 离职申请',
    payload: [
      /* 只列员工在这一步真会产生的值。常乐豆余额出口、补偿这些是审核环节才补的，
         不放发起登记 —— 发起时既不该让员工看，也不该指望对岸这时就发过来 */
      /* 申请单号不由员工填：提交时系统按「RQ+日期+流水」生成（auto 标记，发起页不出输入框） */
      { key: 'applyNo', label: '申请单号', type: 'text', required: true, auto: true },
      { key: 'empId', label: '员工工号', type: 'text', required: true, role: 'empNo' },
      { key: 'expectDate', label: '期望离职日期', type: 'date', required: true, default: 'today+30d', note: '员工自己填的期望日期，审核时可改' },
      { key: 'reason', label: '离职原因', type: 'multi', required: true, options: ['工资太低', '离家太远', '结婚生子', '自主创业', '照顾家庭'], note: '可多选' },
      { key: 'note', label: '补充说明', type: 'text', required: false, long: true }
    ]
  },
  {
    key: 'resign.monitor.terminate',
    label: '异常监控告警',
    source: '用工风险监控',
    entry: '用工风险监控 · 告警详情 · 转离职处理',
    payload: [
      { key: 'empId', label: '员工工号', type: 'text', required: true, role: 'empNo' },
      { key: 'alertType', label: '告警类型', type: 'text', required: true },
      { key: 'alertAt', label: '告警时间', type: 'date', required: true }
    ]
  },
  {
    key: 'headcount.monthly.plan',
    label: '月度盘点任务',
    source: '人力资源计划',
    entry: '人力资源计划 · 月度盘点 · 生成任务',
    payload: [
      { key: 'month', label: '盘点月份', type: 'text', required: true },
      { key: 'orgScope', label: '组织范围', type: 'text', required: false }
    ]
  },
  {
    key: 'transfer.apply.submitted',
    label: '调岗申请提交',
    source: '员工自助端',
    entry: '员工自助端 · 我的 · 调岗申请',
    payload: [
      { key: 'applyNo', label: '申请单号', type: 'text', required: true, auto: true },
      { key: 'empId', label: '员工工号', type: 'text', required: true, role: 'empNo' },
      /* 申请人只说「想什么时候调」，去哪、什么岗位、实际哪天生效都由后续子事件的人核定 ——
         发起时让员工自己挑门店与日期，等于把审核人的判断提前替他做了 */
      { key: 'toStore', label: '期望调入门店', type: 'enum', required: false, options: ['上海徐汇店', '上海静安店', '杭州西湖店', '杭州滨江店'], note: '员工意向，可空；调入门店由城市总核定' },
      { key: 'expectDate', label: '期望生效日期', type: 'date', required: true, default: 'today+30d', note: '员工自己填的期望日期，实际生效日期由城市总核定' }
    ]
  },
  {
    key: 'regular.apply.submitted',
    label: '转正申请提交',
    source: 'HR 后台',
    entry: 'HR 后台 · 员工档案 · 发起转正',
    payload: [
      { key: 'applyNo', label: '申请单号', type: 'text', required: true, auto: true },
      { key: 'empId', label: '员工工号', type: 'text', required: true, role: 'empNo' },
      /* 试用到期日是档案里的事实，不由发起人重录；评估结论属于直属上级那条评估，不在这里 */
      { key: 'expireDate', label: '试用到期日', type: 'date', required: false, note: '档案带出' },
      { key: 'expectDate', label: '期望转正日期', type: 'date', required: false, note: '意向，可空；转正日期由城市总核定' }
    ]
  },
  {
    key: 'salary.adjust.submitted',
    label: '调薪建议提交',
    source: 'HR 后台',
    entry: 'HR 后台 · 薪酬 · 发起调薪',
    payload: [
      { key: 'applyNo', label: '申请单号', type: 'text', required: true, auto: true },
      { key: 'empId', label: '员工工号', type: 'text', required: true, role: 'empNo' },
      /* 发起只到「希望什么时候调」为止：现月薪由城市总在建议里写，核定月薪在人事那一关定 */
      { key: 'expectMonth', label: '期望生效月份', type: 'text', required: true, note: 'YYYY-MM；实际生效月份由人事核定' }
    ]
  },
  {
    /* 排班侧发出来的事实：请假审批通过那一刻，把「谁、哪一天、哪一段」告诉事件系统。
       排班不主动去猜请假单，也不管假是怎么批下来的 —— 那是假勤的事。 */
    key: 'shift.leave.approved',
    label: '班次请假审批通过',
    source: '假勤模块',
    entry: '假勤 · 请假审批 · 审批通过后发出',
    payload: [
      { key: 'applyNo', label: '请假单号', type: 'text', required: true, auto: true },
      { key: 'empId', label: '请假人工号', type: 'text', required: true, role: 'empNo' },
      { key: 'leaveDate', label: '请假日期', type: 'date', required: true },
      { key: 'shiftNo', label: '被覆盖的班次编号', type: 'text', required: true, note: '排班系统给；一个班次一条' },
      { key: 'shiftStart', label: '班次开始', type: 'text', required: false, note: 'HH:mm' },
      { key: 'shiftEnd', label: '班次结束', type: 'text', required: false, note: 'HH:mm' }
    ]
  },
  {
    /* 排班侧事实：非全在移动端点了「取消」。名额去向（回池/作废）不由发起人选，
       由时段快照里的后续处理规则定 —— 所以载荷里没有 mode 字段。 */
    key: 'shift.cancel.requested',
    label: '非全主动取消班次',
    source: '员工自助端',
    entry: '移动端 · 我的排班 · 班次卡 · 取消',
    payload: [
      { key: 'applyNo', label: '取消单号', type: 'text', required: true, auto: true },
      { key: 'empId', label: '取消人工号', type: 'text', required: true, role: 'empNo' },
      { key: 'instanceId', label: '被取消的时段实例编号', type: 'text', required: true, note: '排班系统给；一段班次一条' },
      { key: 'shiftDate', label: '班次日期', type: 'date', required: false },
      { key: 'reason', label: '取消原因', type: 'text', required: false, note: '只用于留痕，规则判断不看它' }
    ]
  },
  {
    /* 排班侧事实：非全点了「转给同事」。能不能转看规则，接不接看对方，
       两者都不在发起人的控制里 —— 载荷只带「谁、哪段、想转给谁」。 */
    key: 'shift.transfer.requested',
    label: '非全转移班次发起',
    source: '员工自助端',
    entry: '移动端 · 我的排班 · 班次卡 · 转给同事',
    payload: [
      { key: 'applyNo', label: '转移单号', type: 'text', required: true, auto: true },
      { key: 'empId', label: '发起人工号', type: 'text', required: true, role: 'empNo' },
      { key: 'instanceId', label: '要转出的时段实例编号', type: 'text', required: true },
      { key: 'toPersonId', label: '想转给谁（工号）', type: 'text', required: true, note: '发起人指定；资格与冲突由后续判断核，不在发起时拍板' }
    ]
  },
  {
    /* 排班侧事实：换班发起。一张单带两边：我的班次 + 对方的班次，
       对价关系在这里定死 —— 不是「我把班给你」，是「咱俩对调」。 */
    key: 'shift.swap.proposed',
    label: '换班发起（两人对调）',
    source: '员工自助端',
    entry: '移动端 · 我的排班 · 班次卡 · 找人换班',
    payload: [
      { key: 'applyNo', label: '换班单号', type: 'text', required: true, auto: true },
      { key: 'empId', label: '发起人工号', type: 'text', required: true, role: 'empNo' },
      { key: 'instanceId', label: '发起人的班次编号', type: 'text', required: true },
      { key: 'toPersonId', label: '换班对象（工号）', type: 'text', required: true },
      { key: 'toInstanceId', label: '对方的班次编号', type: 'text', required: true, note: '对调关系由这两个编号绑定，缺一边就不是换班' }
    ]
  }
]

/* 这里曾经登记过一个「离职生效」事件点（2026-11-13 当天加、当天下掉）。
 * 为什么不登记：它不是对岸推过来的事 —— 没有哪个系统在生效那一刻"喊一声"，
 * 是我方按天问一句「这个人的离职日期到了没」。所以它落在系统检查项（effectiveDateReached）里，
 * 由离职单自己按执行周期查，不占事件点。 */

export const eventPointOf = (k) => eventPoints.find((e) => e.key === k) || null
export const eventPointLabel = (k) => eventPointOf(k)?.label || k
/** 触点入口：要么来自事件点登记，要么人工指定 */
export const entryOf = (k) => eventPointOf(k)?.entry || ''
/** 这个事件点承诺发哪些字段：业务系统登记的事实，我们只读 */
export const eventPointFields = (k) => eventPointOf(k)?.payload || []
/** 按 key 找登记字段；也认中文名（兼容模型或人写成标签的情况） */
export function pointFieldOf (k, raw) {
  const list = eventPointFields(k)
  const s = String(raw || '')
  return list.find((x) => x.key === s) || list.find((x) => x.label === s) || null
}
/** 引擎要用的那个字段（工号）：拿它去取员工档案 */
export const empNoFieldOf = (k) => eventPointFields(k).find((x) => x.role === 'empNo') || null
