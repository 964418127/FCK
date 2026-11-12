// 时段与名额 v2 的运行期数据源：列表页与时段配置页共用同一份对象。
// 种子与常量在 mock/slotModel.js（纯数据，node 测试可 import）。
import { reactive } from 'vue'
import {
  slotSeeds, netHours,
  findTemplate, findContainer, CONTAINER_SHIFTS, LEFTOVERS,
  GEN_CADENCES, GEN_HORIZONS, CLAIM_GRANULARITY,
  SLOT_TEMPLATES, findSlotTemplate,
  keyModeOf, parseOpenTime, WINDOW_ANCHORS, OPEN_ANCHORS
} from './slotModel.js'

export const slotList = reactive(slotSeeds)
/** 本容器班次库（运行期）：与种子共用同一批对象，页面从这里读、直接改 */
export const containerShiftList = reactive(CONTAINER_SHIFTS)

export const findSlot = id => slotList.find(s => s.id === id) || null
export const findShift = id => containerShiftList.find(p => p.id === id) || null
export const shiftsOf = containerId => containerShiftList.filter(p => p.containerId === containerId)

function nextShiftId () {
  const max = containerShiftList.reduce((acc, p) => {
    const n = Number(String(p.id ?? '').replace(/\D/g, ''))
    return Number.isFinite(n) && n > acc ? n : acc
  }, 0)
  return `PS-${String(max + 1).padStart(3, '0')}`
}

/** 引用通用模板生成本容器班次（已有引用则复用） */
export function ensureShiftFromTemplate (containerId, templateId) {
  const exist = containerShiftList.find(p => p.containerId === containerId && p.templateId === templateId)
  if (exist) return exist
  const t = findTemplate(templateId)
  if (!t) return null
  const sh = { id: nextShiftId(), containerId, templateId, name: t.name, start: t.start, end: t.end, breakMin: t.breakMin }
  containerShiftList.push(sh)
  return sh
}

/** 自建班次（本容器特有，标「门店自定义」） */
export function addCustomShift (containerId) {
  const sh = { id: nextShiftId(), containerId, templateId: null, name: '自建班次', start: '09:00', end: '18:00', breakMin: 60 }
  containerShiftList.push(sh)
  return sh
}

export function nextSlotId () {
  const max = slotList.reduce((acc, s) => {
    const n = Number(String(s.id ?? '').replace(/\D/g, ''))
    return Number.isFinite(n) && n > acc ? n : acc
  }, 0)
  return `SL-${String(max + 1).padStart(3, '0')}`
}

/** 新建时段：选时段通用模板 → 按容器解析班次 → 实例化（之后一切字段可改） */
export function createSlot (containerId, slotTemplateId = 'ST-05', kind = 'cycle') {
  const tpl = findSlotTemplate(slotTemplateId) || SLOT_TEMPLATES[SLOT_TEMPLATES.length - 1]
  const sh = ensureShiftFromTemplate(containerId, tpl.shiftTemplateId)
  const body = structuredClone(tpl.body)
  const slot = { id: '', ...body, containerId, kind, date: '', shiftId: sh.id }
  if (kind === 'temp') {
    slot.days = []
    slot.generation = null
  }
  slot.id = nextSlotId()
  // 窗口/层 id 重新生成，避免与模板或其他实例撞 key
  slot.windows.forEach((w, wi) => {
    w.id = `${slot.id}-W${wi + 1}`
    ;(w.tiers || []).forEach((t, ti) => {
      t.id = `${slot.id}-W${wi + 1}T${ti + 1}`
      t.order = ti + 1
    })
  })
  slotList.push(slot)
  return slot
}

export function removeSlot (id) {
  const i = slotList.findIndex(s => s.id === id)
  if (i !== -1) slotList.splice(i, 1)
}

/** 校验时段（保存时调用），返回错误文案或 '' */
export function validateSlot (slot) {
  if (!findContainer(slot.containerId)) return '时段必须挂在已有容器上（容器类型 + 具体容器）'
  const sh = findShift(slot.shiftId)
  if (!sh || sh.containerId !== slot.containerId) return '时段必须挂在本容器的班次上'
  if (!sh.name?.trim()) return `班次「${sh.id}」名称必填`
  if (netHours(sh) <= 0) return `班次「${sh.name}」起止与休息算不出净工时`
  if (slot.kind === 'temp' && !slot.date) return '临时时段必须指定日期'
  if (slot.kind === 'cycle' && !(slot.days || []).length) return '周期时段至少要选一个星期'
  if (netHours(slot) <= 0) return '起止与休息算不出净工时（止需晚于起，休息小于跨度）'
  if (!(slot.capacity?.value > 0)) return '名额必须大于 0'
  // 生成规则：周期时段必须有结构化的生成时钟（铺的是名额实例，不是排班结果）
  if (slot.kind === 'cycle') {
    const g = slot.generation || {}
    if (!GEN_CADENCES.some(c => c.value === g.cadence) || g.cadence === 'manual') {
      return '生成节奏必选（每周 / 每月）；临时时段才允许手动发布'
    }
    if (g.cadence === 'weekly' && !(g.weekday >= 0 && g.weekday <= 6)) return '每周生成需选星期'
    if (g.cadence === 'monthly' && !(g.day >= 1 && g.day <= 28)) return '每月生成需选 1–28 日'
    if (!parseOpenTime(g.time)) return '生成时刻格式应为 HH:MM（可写 25:00 这类跨日时刻）'
    if (!GEN_HORIZONS.some(h => h.value === g.horizon)) return '生成视野必选（下一批 / 未来两周 / 整月）'
  }
  // 领取约束：可拆分必须给最少小时数；个人单日上限 0 = 不限
  const c = slot.claim || {}
  if (!CLAIM_GRANULARITY.some(x => x.value === c.granularity)) return '领取方式必选（整段 / 可拆分）'
  if (c.granularity === 'split' && !(c.minHours > 0)) return '可拆分领取需填最少小时数'
  // 覆盖要求与兜底一致：必须分完的时段兜底不能是「留空」——分满是承诺，留空不是动作
  if (slot.required && slot.leftover === '留空') return '「必须分完」的时段兜底不能是「留空」——请选一个兜底动作（如留待派发 / 生成通班）'
  if (!LEFTOVERS.includes(slot.leftover)) return '兜底动作不在目录内'
  if (!(slot.windows || []).length) return '至少一个分配窗口'
  for (const w of slot.windows) {
    if (!w.label?.trim()) return '窗口名称必填'
    const wo = w.openAt || {}
    const wAnchor = WINDOW_ANCHORS.find(a => a.value === wo.anchor)
    if (!wAnchor) return `窗口「${w.label}」开放时刻未选锚点（每周 / 每月 / 发布即开放）`
    if (wAnchor.value === 'weekly' && !(wo.weekday >= 0 && wo.weekday <= 6)) return `窗口「${w.label}」每周开放需选星期`
    if (wAnchor.value === 'monthly' && !(wo.day >= 1 && wo.day <= 28)) return `窗口「${w.label}」每月开放需选 1–28 日`
    if ((wAnchor.value === 'weekly' || wAnchor.value === 'monthly') && !parseOpenTime(wo.time)) {
      return `窗口「${w.label}」开放时刻格式应为 HH:MM（可写 25:00 这类跨日时刻）`
    }
    if (!(w.tiers || []).length) return `窗口「${w.label}」至少一层`
    for (const t of w.tiers) {
      if (!(t.crowds || []).length) return `窗口「${w.label}」存在未设人群的层`
      if (!keyModeOf(t.key)) {
        return `窗口「${w.label}」存在裁决键不完整的层（先选键类型，再选键的具体方式）`
      }
      if (t.key.type === 'perf' && t.key.mode === 'composite') {
        const sum = (t.key.params?.metrics || []).reduce((a, m) => a + (Number(m.weight) || 0), 0)
        if (sum !== 100) return `窗口「${w.label}」存在综合分权重合计 ≠ 100 的层（当前 ${sum}）`
      }
      if (t.key.type === 'state' && !(t.key.params?.order || []).length) {
        return `窗口「${w.label}」存在轮转顺序为空的层`
      }
      if (t.obligation === 'duty' && t.key.type === 'time' && t.key.mode === 'first') return '班次性质为「必选」的层不能用「先到先得」裁决（先到先得是可选层的方式）；按资历指派可用入职/签约早晚'
      const to = t.openAt || {}
      const tAnchor = OPEN_ANCHORS.find(a => a.value === to.anchor)
      if (!tAnchor) return `窗口「${w.label}」存在开放锚点未选的层`
      if (!tAnchor.fixed && !parseOpenTime(to.time)) {
        return `窗口「${w.label}」存在开放时刻缺填或格式不对的层（HH:MM，可写 25:00 这类跨日时刻）`
      }
    }
  }
  return ''
}
