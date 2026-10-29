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
      /* 只列员工在这一步真会产生的值。常乐豆、补偿、款项出口这些是审核环节才补的，
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
      { key: 'applyNo', label: '申请单号', type: 'text', required: true },
      { key: 'empId', label: '员工工号', type: 'text', required: true, role: 'empNo' },
      { key: 'toStore', label: '调入门店', type: 'enum', required: true, options: ['上海徐汇店', '上海静安店', '杭州西湖店', '杭州滨江店'] },
      { key: 'effectDate', label: '生效日期', type: 'date', required: true, default: 'today+30d' }
    ]
  },
  {
    key: 'regular.apply.submitted',
    label: '转正申请提交',
    source: 'HR 后台',
    entry: 'HR 后台 · 员工档案 · 发起转正',
    payload: [
      { key: 'empId', label: '员工工号', type: 'text', required: true, role: 'empNo' },
      { key: 'expireDate', label: '试用到期日', type: 'date', required: true },
      { key: 'verdict', label: '评估结论', type: 'enum', required: true, options: ['通过', '延长试用', '不通过'] }
    ]
  }
]

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
