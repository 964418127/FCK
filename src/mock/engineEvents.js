// 引擎事件共享模拟数据与本地存储工具
const defaultEngineEvents = [
  {
    id: 1,
    code: 'order.created',
    name: '订单创建',
    type: 'business',
    businessId: 1,
    status: 'active',
    updateTime: '2024-01-01 10:00:00',
    dataFields: [
      { name: 'orderId', type: 'string', description: '订单ID', required: true },
      { name: 'userId', type: 'string', description: '用户ID', required: true },
      { name: 'amount', type: 'number', description: '订单金额', required: true }
    ]
  },
  {
    id: 2,
    code: 'order.validated',
    name: '订单验证完成',
    type: 'process',
    businessId: 1,
    status: 'active',
    updateTime: '2024-01-01 11:00:00',
    dataFields: [
      { name: 'orderId', type: 'string', description: '订单ID', required: true },
      { name: 'status', type: 'string', description: '验证状态', required: true },
      { name: 'validatedBy', type: 'string', description: '校验人', required: false }
    ]
  },
  {
    id: 3,
    code: 'order.paid',
    name: '订单支付完成',
    type: 'business',
    businessId: 1,
    status: 'active',
    updateTime: '2024-01-01 12:00:00',
    dataFields: [
      { name: 'orderId', type: 'string', description: '订单ID', required: true },
      { name: 'paymentId', type: 'string', description: '支付流水号', required: true },
      { name: 'amount', type: 'number', description: '支付金额', required: true },
      { name: 'channel', type: 'string', description: '支付渠道', required: false }
    ]
  },
  {
    id: 4,
    code: 'user.registered',
    name: '用户注册成功',
    type: 'business',
    businessId: null,
    status: 'active',
    updateTime: '2024-01-02 10:00:00',
    dataFields: [
      { name: 'userId', type: 'string', description: '用户ID', required: true },
      { name: 'username', type: 'string', description: '用户名', required: true },
      { name: 'mobile', type: 'string', description: '手机号码', required: false }
    ]
  },
  {
    id: 5,
    code: 'process.node.completed',
    name: '节点完成（通用）',
    type: 'process',
    businessId: null,
    status: 'active',
    updateTime: '2024-01-02 12:00:00',
    dataFields: [
      { name: 'processInstanceId', type: 'string', description: '流程实例ID', required: true },
      { name: 'nodeId', type: 'string', description: '节点ID', required: true },
      { name: 'status', type: 'string', description: '节点完成状态', required: true },
      { name: 'result', type: 'object', description: '节点输出结果', required: false }
    ]
  },
  {
    id: 6,
    code: 'process.instance.completed',
    name: '流程实例完成',
    type: 'process',
    businessId: null,
    status: 'active',
    updateTime: '2024-01-02 13:00:00',
    dataFields: [
      { name: 'processInstanceId', type: 'string', description: '流程实例ID', required: true },
      { name: 'status', type: 'string', description: '流程状态', required: true },
      { name: 'finishedAt', type: 'string', description: '完成时间', required: false }
    ]
  },
  {
    id: 7,
    code: 'system.scheduled.task',
    name: '定时任务触发',
    type: 'system',
    businessId: null,
    status: 'active',
    updateTime: '2024-01-02 14:00:00',
    dataFields: [
      { name: 'taskCode', type: 'string', description: '定时任务编码', required: true },
      { name: 'triggerTime', type: 'string', description: '触发时间', required: true }
    ]
  }
]

const STORAGE_KEY = 'engine_events'

const safeParse = (val) => {
  try {
    return JSON.parse(val)
  } catch (e) {
    return null
  }
}

export const getEngineEvents = () => {
  const cached = typeof localStorage !== 'undefined' ? safeParse(localStorage.getItem(STORAGE_KEY)) : null
  if (Array.isArray(cached) && cached.length) {
    return cached
  }
  return [...defaultEngineEvents]
}

export const saveEngineEvents = (list) => {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list || []))
}

export const upsertEngineEvent = (event) => {
  const list = getEngineEvents()
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
  if (event.id) {
    const idx = list.findIndex(e => e.id === event.id)
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...event, updateTime: now }
    } else {
      list.push({ ...event, updateTime: now })
    }
  } else {
    const nextId = list.reduce((max, e) => Math.max(max, e.id || 0), 0) + 1
    list.push({ ...event, id: nextId, updateTime: now })
  }
  saveEngineEvents(list)
  return list
}

export const removeEngineEvent = (id) => {
  const list = getEngineEvents().filter(e => e.id !== id)
  saveEngineEvents(list)
  return list
}

