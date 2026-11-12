/**
 * 排班配置的 Excel 表结构与解析规则。
 * 只做「表格 ⇄ 时段需求」的换算，不碰页面与存储，便于单独验证。
 *
 * 一行 = 一个门店某一天的某个时段；同一门店 + 同一生效期间的行合并成一条时段需求，
 * 因为需求本身是「门店 + 生效期间 + 一组星期几的时段」，备注属于整条需求而不是某一行。
 * 「分配策略」是时段级属性，所以留在行上，不参与合并。
 */

export const SHEET_HEADERS = ['门店编码', '门店名称', '星期', '开始时间', '结束时间', '名额', '生效日期', '结束日期', '备注', '分配策略']

export const SHEET_COLS = [{ wch: 12 }, { wch: 16 }, { wch: 8 }, { wch: 11 }, { wch: 11 }, { wch: 8 }, { wch: 13 }, { wch: 13 }, { wch: 30 }, { wch: 22 }]

const pad = value => String(value).padStart(2, '0')
const text = value => String(value ?? '').trim()

export const todayText = (date = new Date()) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

/** Excel 会把日期存成序列号、把时间存成小数，这里统一折算成文本。 */
const toDateText = value => {
  if (value instanceof Date) return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
  if (typeof value === 'number' && Number.isFinite(value)) {
    const date = new Date(Math.round((value - 25569) * 86400000))
    if (Number.isNaN(date.getTime())) return ''
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
  }
  const matched = text(value).match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/)
  return matched ? `${matched[1]}-${pad(matched[2])}-${pad(matched[3])}` : ''
}

const toTimeText = value => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const minutes = Math.round(value * 1440)
    if (minutes < 0 || minutes > 1440) return ''
    return `${pad(Math.floor(minutes / 60) % 24)}:${pad(minutes % 60)}`
  }
  const matched = text(value).match(/^(\d{1,2})[:：](\d{2})/)
  return matched ? `${pad(matched[1])}:${matched[2]}` : ''
}

const minutesOf = time => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/** 模版：表头 + 当前门店的一周占位行，填时间和名额即可，不需要的行留空会被忽略。 */
export const templateRows = ({ store, weekdays, startDate = todayText() }) => [
  SHEET_HEADERS,
  ...weekdays.map(day => [store.code, store.name, day.label, '', '', '', startDate, '', '', ''])
]

/** 导出：把现有需求摊平成同样的行，导出后可以原样改完再导入。 */
export const exportRows = (requirements, stores, weekdays, policies = []) => {
  const nameById = new Map(policies.map(policy => [policy.id, policy.name]))
  const rows = [SHEET_HEADERS]
  for (const requirement of requirements) {
    const store = stores.find(item => item.id === requirement.storeId)
    if (!store) continue
    for (const day of weekdays) {
      const slots = (requirement.days?.[day.value] || []).filter(row => !row.voidedAt).sort((a, b) => a.startTime.localeCompare(b.startTime))
      for (const slot of slots) {
        rows.push([store.code, store.name, day.label, slot.startTime, slot.endTime, slot.quota, requirement.startDate, requirement.endDate || '', requirement.remark || '', nameById.get(slot.policyId) || ''])
      }
    }
  }
  return rows
}

export const guideRows = () => [
  ['排班配置导入说明'],
  [''],
  ['1', '一行 = 一个门店某一天的某个时段。同一门店、同一生效日期、同一结束日期的行，会合并成一条时段需求。'],
  ['2', '门店编码须是系统里已有的门店；门店名称只用于核对，不参与导入。'],
  ['3', '星期填「周一」至「周日」；时段须在门店营业时间内，结束时间晚于开始时间，且每个时段不超过 4 小时。'],
  ['4', '名额填大于 0 的整数；开始时间、结束时间、名额三列都空的行会被忽略，可以放心留着不用的日期。'],
  ['5', '生效日期格式 2026-11-05；结束日期留空表示不限结束日期。'],
  ['6', '备注是整条需求的属性，同一门店同一生效期间的多行备注需要一致。'],
  ['7', '分配策略填策略名称，留空按默认策略（本店非全客户经理）处理；策略要在系统里先建好，名称须一致。'],
  ['8', '导入是新增，不会删除或覆盖已有需求；要停用某条需求，请到列表里作废。']
]

const headerIndexMap = header => {
  const map = new Map()
  header.forEach((cell, index) => {
    const label = text(cell)
    if (label && !map.has(label)) map.set(label, index)
  })
  return map
}

/**
 * 解析表格为时段需求。
 * 返回 { drafts, errors, stats }，errors 带 Excel 行号，页面按行号提示。
 * 「分配策略」列可省：没有该列或留空都按默认策略落；写了名字就必须是系统里已有的策略。
 */
export const parseScheduleRows = (rows, { stores, weekdays, policies = [] }) => {
  const errors = []
  const drafts = []
  const draftByKey = new Map()
  const storeByCode = new Map(stores.map(store => [store.code, store]))
  const policyByName = new Map(policies.map(policy => [policy.name, policy.id]))
  const dayByText = new Map()
  for (const day of weekdays) {
    dayByText.set(day.label, day.value)
    dayByText.set(day.label.replace('周', ''), day.value)
    dayByText.set(String(day.value), day.value)
  }

  const headerRowIndex = (rows || []).findIndex(row => Array.isArray(row) && row.some(cell => text(cell) === '门店编码'))
  if (headerRowIndex === -1) {
    return { drafts, errors: [{ line: 1, message: '表头里找不到「门店编码」，请用下载的模版填写' }], stats: { requirements: 0, slots: 0, storeNames: [] } }
  }

  const columns = headerIndexMap(rows[headerRowIndex])
  const cellOf = (row, label) => {
    const index = columns.get(label)
    return index === undefined ? '' : row[index]
  }
  const required = ['门店编码', '星期', '开始时间', '结束时间', '名额', '生效日期']
  const missing = required.filter(label => !columns.has(label))
  if (missing.length) {
    return { drafts, errors: [{ line: headerRowIndex + 1, message: `表头缺少「${missing.join('、')}」列，请用下载的模版填写` }], stats: { requirements: 0, slots: 0, storeNames: [] } }
  }

  for (let index = headerRowIndex + 1; index < rows.length; index++) {
    const row = rows[index]
    if (!Array.isArray(row)) continue
    const line = index + 1
    const startTime = toTimeText(cellOf(row, '开始时间'))
    const endTime = toTimeText(cellOf(row, '结束时间'))
    const quotaText = text(cellOf(row, '名额'))
    if (!startTime && !endTime && !quotaText) continue

    const code = text(cellOf(row, '门店编码'))
    const store = storeByCode.get(code)
    if (!code) { errors.push({ line, message: '门店编码不能为空' }); continue }
    if (!store) { errors.push({ line, message: `门店编码「${code}」不存在` }); continue }

    const weekdayText = text(cellOf(row, '星期'))
    const weekday = dayByText.get(weekdayText) ?? dayByText.get(weekdayText.replace(/^周/, ''))
    if (weekday === undefined) { errors.push({ line, message: `星期「${weekdayText || '空'}」无法识别，请填「周一」至「周日」` }); continue }

    if (!startTime || !endTime) { errors.push({ line, message: '开始时间和结束时间都要填' }); continue }
    if (minutesOf(endTime) <= minutesOf(startTime)) { errors.push({ line, message: '结束时间要晚于开始时间' }); continue }
    if (minutesOf(endTime) - minutesOf(startTime) > 240) { errors.push({ line, message: '单个时段不能超过 4 小时' }); continue }
    if (startTime < store.open || endTime > store.close) { errors.push({ line, message: `时段须在门店营业时间 ${store.open} - ${store.close} 内` }); continue }

    const quota = Number(quotaText)
    if (!Number.isInteger(quota) || quota < 1) { errors.push({ line, message: '名额要填大于 0 的整数' }); continue }

    const startDate = toDateText(cellOf(row, '生效日期'))
    if (!startDate) { errors.push({ line, message: '生效日期要填，格式如 2026-11-05' }); continue }
    const endDate = toDateText(cellOf(row, '结束日期'))
    if (endDate && endDate < startDate) { errors.push({ line, message: '结束日期不能早于生效日期' }); continue }

    const policyText = columns.has('分配策略') ? text(cellOf(row, '分配策略')) : ''
    let policyId = ''
    if (policyText) {
      policyId = policyByName.get(policyText)
      if (!policyId) { errors.push({ line, message: `分配策略「${policyText}」不存在，请先在系统里建好这条策略` }); continue }
    }

    const remark = text(cellOf(row, '备注'))
    const key = `${store.id}|${startDate}|${endDate}`
    let draft = draftByKey.get(key)
    if (!draft) {
      draft = { storeId: store.id, storeName: store.name, startDate, endDate, remark, remarkLine: remark ? line : 0, firstLine: line, days: {} }
      draftByKey.set(key, draft)
      drafts.push(draft)
    } else if (remark && draft.remark && remark !== draft.remark) {
      errors.push({ line, message: `备注是整条需求的属性，与第 ${draft.remarkLine} 行不一致，请统一后重试` })
      continue
    } else if (remark && !draft.remark) {
      draft.remark = remark
      draft.remarkLine = line
    }

    draft.days[weekday] ||= []
    draft.days[weekday].push({ startTime, endTime, quota, line, ...(policyId ? { policyId } : {}) })
  }

  for (const draft of drafts) {
    for (const day of weekdays) {
      const slots = draft.days[day.value]
      if (!slots) continue
      slots.sort((a, b) => a.startTime.localeCompare(b.startTime))
      for (let i = 1; i < slots.length; i++) {
        if (slots[i - 1].endTime > slots[i].startTime) {
          errors.push({ line: slots[i].line, message: `${day.label} ${slots[i].startTime} - ${slots[i].endTime} 与第 ${slots[i - 1].line} 行时段重叠` })
        }
      }
    }
  }

  const built = drafts.map(draft => ({
    storeId: draft.storeId,
    storeName: draft.storeName,
    startDate: draft.startDate,
    endDate: draft.endDate,
    remark: draft.remark,
    enabled: true,
    line: draft.firstLine,
    days: Object.fromEntries(weekdays.map(day => [day.value, (draft.days[day.value] || []).map(({ line, ...slot }) => slot)]))
  }))

  errors.sort((a, b) => a.line - b.line)
  return {
    drafts: built,
    errors,
    stats: {
      requirements: built.length,
      slots: built.reduce((sum, draft) => sum + Object.values(draft.days).reduce((count, slots) => count + slots.length, 0), 0),
      storeNames: [...new Set(built.map(draft => draft.storeName))]
    }
  }
}
