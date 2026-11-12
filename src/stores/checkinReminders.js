import { parttimeStore } from './parttimeTasks.js'
import { pushCheckinReminder } from './notifications.js'

/**
 * 打卡提醒：任务开始前 1 小时 / 30 分钟 / 5 分钟各推一次，共 3 次。
 * - 第一次正对打卡窗口开放（开始前 1 小时内可打卡，6.6.4），后两次催办
 * - 只对「待到店」且未到店的任务发；已到店、已取消、已转发、还没接受的转发都不提醒
 * - 每条任务每个节点只推一次：命中即记账（checkinReminders），刷新页面不重复推
 */
export const CHECKIN_REMINDER_MINUTES = [60, 30, 5]

const clock = date => `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
const startOf = task => new Date(`${task.date}T${task.startTime}:00`)

export const reminderPlan = task => CHECKIN_REMINDER_MINUTES.map(offset => {
  const at = new Date(startOf(task).getTime() - offset * 60000)
  return { offset, at, clock: clock(at), key: `${task.id}-${offset}` }
})

export const reminderEligible = task => task.status === '待到店' && !task.arriveTime

/** 已经该发、但还没发过的提醒 */
export const pendingCheckinReminders = (now = new Date()) => {
  const sent = new Set(parttimeStore.checkinReminders.map(item => item.key))
  return parttimeStore.assignments
    .filter(reminderEligible)
    .flatMap(task => reminderPlan(task).map(plan => ({ task, ...plan })))
    .filter(item => !sent.has(item.key) && item.at <= now)
    .sort((a, b) => a.at - b.at)
}

/**
 * 推送到消息中心。同一任务若积压了多个已到点却没发的节点（例如页面刚打开），
 * 只补最近一次 —— 三条一起弹只会把人骂醒，不会让他更早到店。
 */
export const syncCheckinReminders = (now = new Date()) => {
  const due = pendingCheckinReminders(now)
  const latestPerTask = new Map()
  for (const item of due) latestPerTask.set(item.task.id, item)
  const fired = []
  for (const item of latestPerTask.values()) {
    // 任务已开始就不再补发：这时候要解决的是没到店，不是提醒
    if (startOf(item.task) <= now) continue
    parttimeStore.checkinReminders.push({
      key: item.key, taskId: item.task.id, assigneeId: item.task.assigneeId,
      offset: item.offset, at: item.at.toISOString(), sentAt: now.toISOString()
    })
    pushCheckinReminder({ task: item.task, offset: item.offset })
    fired.push(item)
  }
  return fired
}

/** 演示辅具：立刻把某条任务最近一个节点的提醒推一遍，不等真实时间到点 */
export const remindNow = (task, now = new Date()) => {
  if (!task) return null
  const plan = reminderPlan(task).filter(item => item.at > now).sort((a, b) => a.offset - b.offset)[0]
    || reminderPlan(task).find(item => item.offset === 5)
  const key = plan.key
  if (!parttimeStore.checkinReminders.some(item => item.key === key)) {
    parttimeStore.checkinReminders.push({ key, taskId: task.id, assigneeId: task.assigneeId, offset: plan.offset, at: plan.at.toISOString(), sentAt: now.toISOString() })
  }
  pushCheckinReminder({ task, offset: plan.offset })
  return plan
}

/** 任务卡上用：只说「开始前多久」，不写具体时:分 —— 非全端不出现打卡时刻（6.6.7） */
export const reminderText = () => CHECKIN_REMINDER_MINUTES.map(item => (item >= 60 ? `${item / 60} 小时` : `${item} 分钟`)).join(' · ')

export const reminderOffsetLabel = offset => (offset >= 60 ? `${offset / 60} 小时` : `${offset} 分钟`)

/** 剩余多久到下一次提醒（演示用文案，不追求秒级准确） */
export const nextReminderOf = (task, now = new Date()) => reminderPlan(task).find(item => item.at > now) || null
