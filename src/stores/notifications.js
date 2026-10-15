import { reactive, watch } from 'vue'

const STORAGE_KEY = 'fck_notifications_v1'

/**
 * 应用级通知共享 store（localStorage 持久化）。
 * 临时派单仅保留一条演示通知，pushSystemDispatch() 更新该通知。
 * /mobile-notification 页面读 notifications 直接渲染。
 * 已读 / 未读状态也由本 store 持有。
 */

const seeds = [
  {
    id: 'seed-5',
    type: 'system_dispatch',
    title: '系统已为您临时派单',
    desc: '仁和店 / 可在非全任务列表查看任务安排',
    applyTime: '2026-09-28 14:30:00',
    displayDate: '09.28 14:30',
    read: false,
    processed: false,
    done: false,
    store: '仁和店',
    taskId: 'dispatch-sample',
    source: '麓山店',
    extra: '临时任务安排'
  },
  {
    id: 'seed-1',
    title: '计件提成确认通知',
    desc: '您有一条计件提成确认需要查看',
    applyTime: '2025-08-08 12:01:29',
    displayDate: '08.08 12:01',
    status: '待审核',
    store: '弹子石老街店',
    entity: '重庆弹子石推拿有限公司',
    read: false,
    processed: false,
    done: false,
    detail: {
      pageTitle: '月度汇算',
      period: '2025年07月(01-31日)计件提成',
      income: {
        title: '计件提成',
        items: [{ label: '提成金额', value: '6435.12' }],
        subtotal: '6435.12'
      },
      deduction: {
        title: '扣缴',
        items: [
          { label: '代扣社保', value: '-269.14' },
          { label: '投诉扣款', value: '-269.14' },
          { label: '服务时间不足扣提成', value: '-269.14' },
          { label: '负工资抵扣', value: '-269.14' }
        ],
        subtotal: '-538.28'
      },
      summary: {
        title: '汇总',
        items: [
          { label: '发薪主体', value: '重庆弹子石推拿有限公司' },
          { label: '收款人', value: '张小华' },
          { label: '卡号', value: '12121121212121212121' },
          { label: '开户行', value: '工商银行成都市高新区支行' },
          { label: '应发合计', value: '5965.98', isBold: true },
          { label: '应发合计', value: '5965.98', isBold: true },
          { label: '付款状态', value: '- -' }
        ]
      },
      confirms: [
        '1.本人已核实，已阅读并确认无误，同意公司下发。',
        '2.以上个人信息属于公司的高度保密资料，除自己本人以外，绝不允许本人对外泄露，本人严格遵照公司的信息的保密制度执行。'
      ]
    }
  },
  {
    id: 'seed-2',
    title: '加班工资确认通知',
    desc: '您有一条加班工资确认需要查看',
    applyTime: '2025-07-08 10:57:38',
    displayDate: '07.08 10:57',
    status: '待审核',
    store: '成都印象城店',
    entity: '成都印象城健康管理有限公司',
    read: false,
    processed: false,
    done: false,
    detail: {
      pageTitle: '月度汇算',
      period: '2025年07月(01-31日)加班工资',
      income: {
        title: '加班工资',
        items: [{ label: '加班工资', value: '1435.12' }],
        subtotal: '1435.12'
      },
      deduction: {
        title: '扣缴',
        items: [
          { label: '代扣个税', value: '-239.14' },
          { label: '负工资抵扣', value: '-30.00' }
        ],
        subtotal: '-269.14'
      },
      summary: {
        title: '汇总',
        items: [
          { label: '发薪主体', value: '成都印象城健康管理有限公司' },
          { label: '收款人', value: '张小华' },
          { label: '卡号', value: '12121121212121212121' },
          { label: '开户行', value: '工商银行成都市高新区支行' },
          { label: '应发合计', value: '1055.98', isBold: true },
          { label: '应发合计', value: '1055.98', isBold: true },
          { label: '付款状态', value: '- -' }
        ]
      },
      confirms: [
        '1.本人已核实，已阅读并确认无误，同意公司下发。',
        '2.以上个人信息属于公司的高度保密资料，除自己本人以外，绝不允许本人对外泄露，本人严格遵照公司的信息的保密制度执行。'
      ]
    }
  },
  {
    id: 'seed-3',
    title: '补贴确认通知',
    desc: '您有一条补贴确认需要查看',
    applyTime: '2025-06-25 15:07:24',
    displayDate: '06.25 15:07',
    status: '待审核',
    store: '北城天街店',
    entity: '重庆北城天街推拿有限公司',
    read: true,
    processed: false,
    done: false,
    detail: {
      pageTitle: '月度汇算',
      period: '2025年07月(01-31日)补贴',
      income: {
        title: '补贴',
        items: [
          { label: '超产值补贴金额', value: '1435.12' },
          { label: '客户打赏', value: '1435.12' },
          { label: '退单补贴', value: '1435.12' }
        ],
        subtotal: '1435.12'
      },
      deduction: {
        title: '扣缴',
        items: [{ label: '负工资抵扣', value: '-1269.14' }],
        subtotal: '-1269.14'
      },
      summary: {
        title: '汇总',
        items: [
          { label: '发薪主体', value: '重庆北城天街推拿有限公司' },
          { label: '收款人', value: '张小华' },
          { label: '卡号', value: '12121121212121212121' },
          { label: '开户行', value: '工商银行成都市高新区支行' },
          { label: '应发合计', value: '600.00', isBold: true },
          { label: '应发合计', value: '600.00', isBold: true },
          { label: '付款状态', value: '- -' }
        ]
      },
      confirms: [
        '1.本人已核实，已阅读并确认无误，同意公司下发。',
        '2.以上个人信息属于公司的高度保密资料，除自己本人以外，绝不允许本人对外泄露，本人严格遵照公司的信息的保密制度执行。'
      ]
    }
  },
  {
    id: 'seed-4',
    title: '常乐豆兑换确认通知',
    desc: '您有一条常乐豆兑换确认需要查看',
    applyTime: '2025-06-25 15:07:24',
    displayDate: '06.25 15:07',
    status: '待审核',
    store: '解放碑店',
    entity: '重庆解放碑推拿有限公司',
    read: true,
    processed: false,
    done: false,
    detail: {
      pageTitle: '常乐豆兑换',
      period: '2025年06月常乐豆兑换记录',
      exchange: {
        title: '兑换明细',
        items: [
          { label: '兑换类型', value: '提现到银行卡' },
          { label: '兑换数量', value: '200 颗' },
          { label: '兑换比例', value: '1 颗 = 0.5 元' },
          { label: '到账金额', value: '¥100.00' },
          { label: '申请时间', value: '2025-06-25 15:07:24' },
          { label: '到账时间', value: '预计 1-3 工作日' }
        ]
      },
      summary: {
        title: '汇总',
        items: [{ label: '发薪主体', value: '重庆解放碑推拿有限公司' }]
      },
      confirms: [
        '1.本人已核实，已阅读并确认无误，同意公司下发。',
        '2.以上个人信息属于公司的高度保密资料，除自己本人以外，绝不允许本人对外泄露，本人严格遵照公司的信息的保密制度执行。'
      ]
    }
  },
]

const normalizeNotifications = (list) => {
  const dispatch = { ...(list.find(item => item.type === 'system_dispatch') || seeds[0]) }
  delete dispatch.status
  dispatch.desc = `${dispatch.store} / 可在非全任务列表查看任务安排`
  dispatch.extra = '临时任务安排'
  return [dispatch, ...list.filter(item => item.type !== 'system_dispatch')]
}

const loadInitial = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return normalizeNotifications(parsed)
    }
  } catch (e) {
    // 解析失败回退到 seeds
  }
  return normalizeNotifications(seeds)
}

export const notificationStore = reactive({
  list: loadInitial()
})

// 任何变更都同步到 localStorage（路由跳转 / 刷新后保留）
watch(
  () => notificationStore.list,
  (list) => {
    try {
      const serialized = JSON.stringify(list)
      if (localStorage.getItem(STORAGE_KEY) !== serialized) localStorage.setItem(STORAGE_KEY, serialized)
    } catch (e) {
      // 配额满 / 隐私模式等静默失败
    }
  },
  { deep: true, immediate: true }
)

if (typeof window !== 'undefined') window.addEventListener('storage', event => {
  if (event.key !== STORAGE_KEY || !event.newValue) return
  try {
    const parsed = JSON.parse(event.newValue)
    if (Array.isArray(parsed)) notificationStore.list.splice(0, notificationStore.list.length, ...normalizeNotifications(parsed))
  } catch { /* 忽略无效的外部通知数据。 */ }
})

/**
 * 更新临时派单演示通知，避免重复演示时累积记录。
 * @param {object} payload
 *   storeName  派来的门店名
 *   taskId     新任务 id（用于通知详情跳回任务卡）
 *   source     取消的原任务门店名（便于追溯）
 */
export const pushSystemDispatch = (payload) => {
  const now = new Date()
  const time = now.toLocaleString('zh-CN', { hour12: false })
  for (let i = notificationStore.list.length - 1; i >= 0; i--) {
    if (notificationStore.list[i].type === 'system_dispatch') {
      notificationStore.list.splice(i, 1)
    }
  }
  notificationStore.list.unshift({
    id: `dispatch-${now.getTime()}`,
    type: 'system_dispatch',
    title: '系统已为您临时派单',
    desc: `${payload.storeName} / 可在非全任务列表查看任务安排`,
    applyTime: time,
    displayDate: formatDisplayDate(now),
    read: false,
    processed: false,
    done: false,
    store: payload.storeName,
    taskId: payload.taskId,
    source: payload.source,
    extra: '临时任务安排'
  })
}

export const pushTaskPublication = (window) => {
  const existing = notificationStore.list.findIndex(item => item.type === 'task_publication')
  if (existing !== -1) notificationStore.list.splice(existing, 1)
  const now = new Date()
  notificationStore.list.unshift({
    id: 'task-publication', type: 'task_publication', title: '可选任务已发布',
    desc: `${window.start} 至 ${window.end}，时段名额有限，先到先得`,
    applyTime: now.toLocaleString('zh-CN', { hour12: false }), displayDate: formatDisplayDate(now),
    read: false, processed: false, done: false
  })
}

export const markRead = (id) => {
  const item = notificationStore.list.find(n => n.id === id)
  if (item) item.read = true
}

export const unreadCount = () =>
  notificationStore.list.filter(n => !n.read).length

function formatDisplayDate(d) {
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${mm}.${dd} ${hh}:${mi}`
}
