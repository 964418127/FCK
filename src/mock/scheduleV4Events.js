/**
 * 排班策略 v4 —— 原子能力注册表 + 枚举事件 + 事件定义（编排）+ 试跑
 *
 * 为什么拆成「能力」而不是「流程」：
 *  事件系统要拼能力（1..N 个原子执行/判断），排班只交出能力，不交出流程。
 *  判据：①输入输出明确 ②可单独调用 ③幂等 ④不替人做跨域决策。
 *  检验准则：加一个岗位，能力清单不该变长。
 */
import {
  findSpace4, posName4, timeMin, minTime, qualify4, quotaOf4, overtimeMin4
} from './scheduleV4.js'

/* ---- 能力注册表（14 条：执行 10 / 判断 4） ---- */
export const V4_CAPS = [
  {
    key: 'genBatch', name: '生成批次时段', kind: 'exec', domain: '时段',
    input: '计划 + 周期', output: '时段实例集', idempotent: true,
    desc: '按计划把周期内的时段实例铺出来，已存在的不重复铺'
  },
  {
    key: 'makeupSlots', name: '生成补班时段', kind: 'exec', domain: '时段',
    input: '被覆盖区间 + 切分上限', output: '1..N 个补班时段', idempotent: true,
    desc: '把要补的时长按单人上限切开，一段一个时段',
    params: [
      { key: 'coveredStart', label: '被覆盖起', type: 'text', value: '14:00' },
      { key: 'coveredEnd', label: '被覆盖止', type: 'text', value: '22:00' },
      { key: 'maxHours', label: '单人上限（小时）', type: 'number', value: 4 }
    ]
  },
  {
    key: 'stopSlot', name: '停用/调整时段', kind: 'exec', domain: '时段',
    input: '时段 + 变更', output: '时段状态', idempotent: true,
    desc: '停掉一个已铺的时段，或改它的起止'
  },
  {
    key: 'quotaInit', name: '算名额初始值', kind: 'exec', domain: '名额',
    input: '时段 + 算法能力', output: '名额数 + 算式', idempotent: true,
    desc: '调用名额算法能力算出初始值，同时返回它是怎么算的',
    params: [{ key: 'algoId', label: '算法能力', type: 'select', value: 'AG-05', options: ['AG-01', 'AG-02', 'AG-03', 'AG-04', 'AG-05'] }]
  },
  {
    key: 'publishQuota', name: '发布名额', kind: 'exec', domain: '名额',
    input: '时段 + 名额数', output: '可申领名额', idempotent: true,
    desc: '把名额放到可申领状态；人工改动窗在这之前'
  },
  {
    key: 'adjustQuota', name: '人工调整名额', kind: 'exec', domain: '名额',
    input: '时段 + 新值 + 操作人', output: '生效值 + 留痕', idempotent: false,
    desc: '人事直接改名额，改动记在留痕里，不改算法的初始值；人工入口直接用，不挂事件',
    params: [
      { key: 'count', label: '增加/减少', type: 'number', value: 1 },
      { key: 'by', label: '操作人', type: 'text', value: '人事' }
    ]
  },
  {
    key: 'readQuota', name: '读余量', kind: 'judge', domain: '名额',
    input: '时段', output: '剩余数', idempotent: true,
    desc: '只读，不写库'
  },
  {
    key: 'judgeQualify', name: '判资格', kind: 'judge', domain: '资格',
    input: '人 + 时段', output: '是/否 + 原因', idempotent: true,
    desc: '在册、合同类型、当天是否请假、是否已有班次；只读不写库',
    params: [{ key: 'scope', label: '判断口径', type: 'select', value: 'space', options: ['space', 'person'] }]
  },
  {
    key: 'judgeConflict', name: '判时段冲突', kind: 'judge', domain: '资格',
    input: '人 + 时段', output: '是/否 + 冲突项', idempotent: true,
    desc: '同一天时间重叠、跨空间通勤间隔不够都算冲突；只读不写库'
  },
  {
    key: 'allocate', name: '按优先序列分配', kind: 'exec', domain: '分配',
    input: '时段 + 申领池 + 有序档位', output: '分配结果', idempotent: true,
    desc: '按档位顺序吃名额，档位层数由计划配置决定'
  },
  {
    key: 'release', name: '释放名额', kind: 'exec', domain: '分配',
    input: '排班记录', output: '名额回到可分配', idempotent: true,
    desc: '取消/转移时把名额放回来，不自动找人'
  },
  {
    key: 'swapResults', name: '对调占位', kind: 'exec', domain: '分配',
    input: '两条排班记录', output: '两条对调后的记录', idempotent: true,
    desc: '两个人的班次原子互换：名额池不动，两条原记录都进历史（换班专用）'
  },
  {
    key: 'commitResult', name: '写结果表', kind: 'exec', domain: '结果',
    input: '分配结果', output: '排班记录', idempotent: true,
    desc: '名额真正落到人身上的那一步，只有一个写入口'
  },
  {
    key: 'queryResult', name: '查结果', kind: 'judge', domain: '结果',
    input: '人/时段/日期', output: '记录集', idempotent: true,
    desc: '只读'
  }
]
export const capOf4 = key => V4_CAPS.find(c => c.key === key) || null

/* ---- 枚举事件（过渡形态：先把已知事件列清楚，背后才是编排） ----
 * 只收「外面发生了什么、排班需要接住」的事实。
 * EV-04 曾是「临时加人」，2026-11-13 按边界移出：它是人事在配置台点出来的
 * 人工入口（直接调 adjustQuota），不是业务事实，配成事件等于「假装发生了一件事」。
 * 编号留空不复用，避免与已有对照表、留痕记录错位。
 */
export const V4_EVENTS = [
  { id: 'EV-01', name: '全职请假成功', domain: '请假', fields: ['personId', 'date'], note: '请假审批通过后发出；排班不主动感知' },
  { id: 'EV-02', name: '非全主动取消班次', domain: '取消', fields: ['personId', 'instanceId'], note: '本人取消，名额空出来' },
  { id: 'EV-03', name: '非全转移班次', domain: '转移', fields: ['personId', 'toPersonId', 'instanceId'], note: '需被接受才成立' },
  { id: 'EV-05', name: '离职生效', domain: '离职', fields: ['personId'], note: '停掉其后续班次并释放名额' },
  { id: 'EV-06', name: '换班（两人对调）', domain: '换班', fields: ['personId', 'toPersonId', 'instanceId', 'toInstanceId'], note: '双向对价：我给出一条班次、对方给出一条，两边都同意才成立；不碰名额池' }
]
export const eventOf4 = id => V4_EVENTS.find(e => e.id === id) || null

/* ---- 事件定义：能力编排 ---- */
export const V4_EVENT_DEFS = [
  {
    id: 'ED-01', eventId: 'EV-01', name: '最后一名全职请假 → 自动补班',
    desc: '门店当天已无有效全职在岗时，原名额时间形态对补位人群不可用 → 标记可不用，按剩余覆盖切分（补位专用算法 AG-05）生成补班时段并分配',
    steps: [
      { cap: 'judgeQualify', params: { scope: 'space' } },
      { cap: 'release', params: {} },
      { cap: 'makeupSlots', params: { coveredStart: '10:00', coveredEnd: '18:00', maxHours: 4 } },
      { cap: 'quotaInit', params: { algoId: 'AG-05' } },
      { cap: 'publishQuota', params: {} },
      { cap: 'allocate', params: {} },
      { cap: 'commitResult', params: {} }
    ]
  },
  {
    id: 'ED-02', eventId: 'EV-02', name: '非全取消 → 释放并按规则补人',
    desc: '前置：计划的后续处理规则允许取消且未过截止。先放回名额（规则可配回池或作废），再看余量，有余量才补人；没配规则就只释放不补',
    steps: [
      { cap: 'release', params: {} },
      { cap: 'readQuota', params: {} },
      { cap: 'allocate', params: {} },
      { cap: 'commitResult', params: {} }
    ]
  },
  {
    id: 'ED-03', eventId: 'EV-03', name: '转移申请 → 判冲突后接手',
    desc: '前置：发起即进入等待期（时段规则等待期，超时自动失效、班次留原人）。对方在等待期内接受才触发本编排：判冲突 → 释放原名额 → 分配给接手人 → 写结果',
    steps: [
      { cap: 'judgeConflict', params: {} },
      { cap: 'release', params: {} },
      { cap: 'allocate', params: {} },
      { cap: 'commitResult', params: {} }
    ]
  },
  {
    id: 'ED-05', eventId: 'EV-05', name: '离职 → 停后续班次 + 释放',
    desc: '把人停掉，已排的班次释放回名额池',
    steps: [
      { cap: 'stopSlot', params: {} },
      { cap: 'release', params: {} }
    ]
  },
  {
    id: 'ED-06', eventId: 'EV-06', name: '换班申请 → 双方同意后对调占位',
    desc: '前置：两边所在的时段都允许换班、且对方在等待期内同意（超时两边都不动）。换班是双向对价，不释放名额：判我接他的班次不与我其余排班重叠 → 判他接我的班次不与他其余排班重叠 → 两条占位原子对调 → 写结果',
    steps: [
      // side: from = 发起人接接手人的时段；side: to = 接手人接发起人的时段（同一能力的两次调用）
      { cap: 'judgeConflict', params: { side: 'from' } },
      { cap: 'judgeConflict', params: { side: 'to' } },
      { cap: 'swapResults', params: {} },
      { cap: 'commitResult', params: {} }
    ]
  }
]
export const defOf4 = id => V4_EVENT_DEFS.find(d => d.id === id) || null

/* ---- 试跑：一步一步执行，返回人话日志 ---- */
export const executeEvent4 = (def, payload, ctx) => {
  const { batch, plans, people, events } = ctx
  const log = []
  const created = []
  // 本轮被「可不用」的原班次（EV-01 补班路径下，release 与 makeupSlots 之间要传洞的信息）
  const voidedRows = []
  const push = (step, ok, title, detail) => {
    log.push({ seq: log.length + 1, cap: step?.cap || '', ok, title, detail })
    return ok
  }
  const capName = key => capOf4(key)?.name || key
  const personName = id => people.find(p => p.id === id)?.name || id

  // 事件自身带来的上下文
  const person = people.find(p => p.id === payload.personId) || null
  const spaceId = payload.spaceId || person?.spaceId || null
  const date = payload.date || batch.range?.from || null

  // 请假成功的事件数据先落成请假记录：当事人当天不再具备资格
  if (def.eventId === 'EV-01' && payload.personId && date && !(ctx.leaves || []).some(l => l.personId === payload.personId && l.date === date)) {
    ctx.leaves.push({ id: `LV-E${Date.now()}`, personId: payload.personId, date, reason: payload.reason || '请假成功（事件）' })
  }

  for (const step of def.steps || []) {
    const p = step.params || {}
    switch (step.cap) {
      /* --- 判断：该空间该日还有没有有效全职在岗 --- */
      case 'judgeQualify': {
        if (p.scope === 'space' && spaceId && date) {
          const onDuty = batch.results.filter(r => r.spaceId === spaceId && r.date === date && r.employ === 'fulltime')
          const left = onDuty.filter(r => r.personId !== payload.personId)
          const pass = left.length === 0
          push(step, true, '判资格', pass
            ? `${findSpace4(spaceId)?.name || spaceId} ${date} 已无其他全职在岗 → 需要补班`
            : `${findSpace4(spaceId)?.name || spaceId} ${date} 还有 ${left.length} 名全职在岗 → 不补班`)
          if (!pass) return { log, created, stopped: true }
        } else {
          const ok = person ? qualify4(person, date, ctx.leaves || []) : false
          push(step, true, '判资格', ok ? `${personName(payload.personId)} 符合资格` : `${personName(payload.personId)} 不满足资格（请假/停用/已有班次）`)
          if (!ok) return { log, created, stopped: true }
        }
        break
      }
      /* --- 执行：按时长切分补班时段 --- */
      case 'makeupSlots': {
        const plan = plans.find(pl => pl.spaceId === spaceId && person && (pl.positions || []).includes(person.positionId)) || plans[0]
        const start = timeMin(p.coveredStart || '14:00')
        const end = timeMin(p.coveredEnd || '22:00')
        const maxMin = Math.max(60, Number(p.maxHours || 4) * 60)
        let cur = start
        const made = []
        const compensates = voidedRows.length
          ? { formName: voidedRows[0].formName, start: voidedRows[0].start, end: voidedRows[0].end }
          : null
        while (cur < end) {
          const segEnd = Math.min(end, cur + maxMin)
          const instId = `IN-MK-${date}-${cur}`
          if (!batch.instances.some(x => x.id === instId)) {
            const inst = {
              id: instId, planId: plan?.id || 'PL-02', spaceId, date,
              formId: `MK-${cur}`, form: { id: `MK-${cur}`, name: '补班', start: minTime(cur), end: minTime(segEnd), makeup: true },
              start: minTime(cur), end: minTime(segEnd),
              fallbackForm: false, makeup: true,
              // 洞的信息：给 AG-05 算名额用；compensates 让界面能说清「弥补的是哪个洞」
              cover: { start, end, maxHours: Number(p.maxHours || 4) },
              compensates,
              quota: { initial: 1, adjusted: null, effective: 1, expr: '待算', algoName: '未算', windowMin: 5 },
              published: false, filled: 0, left: 1, results: []
            }
            batch.instances.push(inst)
            created.push(inst)
          }
          made.push(`${minTime(cur)}-${minTime(segEnd)}`)
          cur = segEnd
        }
        push(step, true, '生成补班时段', `覆盖 ${p.coveredStart}-${p.coveredEnd}，单人不超过 ${p.maxHours} 小时 → 生成 ${made.length} 段：${made.join('、')}${compensates ? `，弥补「${compensates.formName} ${compensates.start}–${compensates.end}」的洞` : ''}`)
        break
      }
      case 'quotaInit': {
        const plan = plans.find(pl => created.length && pl.id === created[0].planId) || plans[0]
        if (!created.length) { push(step, false, '算名额初始值', '没有待算的时段'); break }
        for (const inst of created) {
          const q = quotaOf4({ ...plan, quota: { ...plan.quota, source: 'algo', algoId: p.algoId, adjusted: null } }, { space: findSpace4(inst.spaceId), form: inst.form, people, date, cover: inst.cover })
          inst.quota = q
          inst.left = q.effective
        }
        push(step, true, '算名额初始值', `${created[0].quota.algoName}：${created[0].quota.expr}；共 ${created.length} 段，每段 ${created[0].quota.effective} 个名额`)
        break
      }
      case 'publishQuota': {
        if (!created.length) {
          const inst = payload.instanceId ? batch.instances.find(i => i.id === payload.instanceId) : null
          if (inst) { inst.published = true; push(step, true, '发布名额', `${inst.form.name} ${inst.start}-${inst.end} 发布 ${inst.quota.effective} 个名额`) }
          else push(step, false, '发布名额', '没有可发布的时段')
          break
        }
        for (const inst of created) inst.published = true
        push(step, true, '发布名额', `${created.length} 段补班已发布，可被申领`)
        break
      }
      case 'allocate': {
        const targets = created.length
          ? created
          : (payload.instanceId ? batch.instances.filter(i => i.id === payload.instanceId) : [])
        if (!targets.length) { push(step, false, '按优先序列分配', '没有可分配的时段'); break }
        const plan = plans.find(pl => pl.id === targets[0].planId) || plans[0]
        let assigned = 0
        for (const inst of targets) {
          // 冲突排除：当天已有时间重叠班次的人不能再接；首尾相接、同日多段都可以（口径：不重叠即可）
          const conflictFree = pp => !batch.results.some(r =>
            r.personId === pp.id && r.date === inst.date &&
            timeMin(r.start) < timeMin(inst.end) && timeMin(inst.start) < timeMin(r.end)
          )
          let remaining = inst.quota.effective - inst.filled
          const tiers = (plan?.priority || []).filter(t => !t.fallback)
          const pool = people.filter(pp =>
            pp.id !== payload.personId &&
            pp.spaceId === inst.spaceId && qualify4(pp, inst.date, ctx.leaves || []) &&
            conflictFree(pp) &&
            tiers.some(t => t.positionId === pp.positionId && (t.employ === 'any' || t.employ === pp.employ))
          ).sort((a, b) => (a.signDate < b.signDate ? -1 : a.signDate > b.signDate ? 1 : 0))
          for (const pp of pool.slice(0, Math.max(0, remaining))) {
            const r = {
              id: `R-${inst.id}-${pp.id}`, instanceId: inst.id, planId: inst.planId, spaceId: inst.spaceId,
              date: inst.date, personId: pp.id, personName: pp.name,
              positionId: pp.positionId, positionName: posName4(pp.positionId), employ: pp.employ,
              formName: inst.form.name, start: inst.start, end: inst.end,
            way: payload.transfer ? '转移承接' : '补位分配',
              score: pp.comp, hours: (timeMin(inst.end) - timeMin(inst.start)) / 60, overtimeMin: 0,
              fallback: false, fromEvent: true
            }
            batch.results.push(r)
            inst.results.push(r)
            inst.filled += 1
            inst.left = Math.max(0, remaining - 1)
            assigned += 1
            remaining -= 1
          }
        }
        push(step, true, '按优先序列分配', assigned
          ? `按档位顺序（${(plan?.priority || []).filter(t => !t.fallback).map(t => t.label).join(' → ')}）补进 ${assigned} 人`
          : '当天已没有符合资格且空闲的人，名额留空')
        break
      }
      case 'commitResult': {
        const rows = batch.results.filter(r => (r.fromEvent || r.fromSwap) && !r.committed)
        for (const r of rows) r.committed = true
        push(step, true, '写结果表', rows.length ? `${rows.length} 条记录已写入排班结果表` : '没有新增记录，结果表不变')
        break
      }
      case 'release': {
        const rows = payload.instanceId
          ? batch.results.filter(r => r.instanceId === payload.instanceId && (!payload.personId || r.personId === payload.personId))
          : batch.results.filter(r => r.personId === payload.personId && (!date || r.date === date))
        if (!rows.length) { push(step, false, '释放名额', '没找到对应的排班记录'); break }
        // 两条路径的产品分叉（2026-11-13 拍板）：
        //  补班路径（EV-01）：原名额的时间形态对补位人群不可用 → 不回池，标记「可不用」；
        //    全部名额失效 → 时段实例收敛为空壳（voided），由补班段组合弥补
        //  再分配路径（ED-02/03/05）：名额放回池子，等下一次分配
        //  作废变体（ED-02 + 规则 mode=void）：取消后名额作废不回池，同补班路径一样标「可不用」
        const makeupPath = def.eventId === 'EV-01' || payload.voidMode === true
        for (const r of rows) {
          const i = batch.results.indexOf(r)
          if (i !== -1) batch.results.splice(i, 1)
          const inst = batch.instances.find(x => x.id === r.instanceId)
          if (inst) {
            inst.filled = Math.max(0, inst.filled - 1)
            if (makeupPath) {
              inst.voidedQuota = (inst.voidedQuota || 0) + 1
              if (inst.voidedQuota >= inst.quota.effective) inst.voided = true
              else inst.left = Math.max(0, inst.left - 1)
            } else {
              inst.left += 1
            }
          }
          r.released = true
          r.releasedWhy = payload.releaseWhy || (makeupPath ? '请假覆盖：时间形态由补班段组合弥补' : '释放（再分配路径）')
          batch.history = batch.history || []
          batch.history.push(r)
        }
        if (makeupPath) voidedRows.push(...rows)
        push(step, true, '释放名额', makeupPath
          ? `${rows.map(r => `${r.date} ${r.formName}`).join('、')} 的名额不回池 → 标记「可不用」，由补班段组合弥补（原班次进历史，痕迹保留）`
          : `${rows.length} 个名额回到可分配（${rows.map(r => `${r.date} ${r.formName}`).join('、')}）`)
        break
      }
      case 'readQuota': {
        const inst = payload.instanceId ? batch.instances.find(i => i.id === payload.instanceId) : null
        const n = inst ? inst.left : batch.instances.reduce((a, b) => a + b.left, 0)
        push(step, true, '读余量', `剩余 ${n} 个名额${n > 0 ? ' → 可以补人' : ' → 无需补人'}`)
        break
      }
      case 'judgeConflict': {
        // 冲突口径（2026-11-13 拍板）：时段重叠才算冲突，首尾相接可以接；不是「当天有班就不行」
        // 换班要判两个方向：side=from 判发起人接接手人的时段；side=to 判接手人接发起人的时段。
        // 自己那条要交出去的班次不算冲突（它本来就要换走）。
        const side = p.side || 'to'
        const target = side === 'from' ? payload.personId : (payload.toPersonId || payload.personId)
        const targetInstId = side === 'from' ? payload.toInstanceId : payload.instanceId
        const excludeInstId = side === 'from' ? payload.instanceId : payload.toInstanceId
        const inst = targetInstId ? batch.instances.find(i => i.id === targetInstId) : null
        const rows = inst
          ? batch.results.filter(r => r.personId === target && r.date === inst.date && r.instanceId !== excludeInstId &&
              timeMin(r.start) < timeMin(inst.end) && timeMin(inst.start) < timeMin(r.end))
          : batch.results.filter(r => r.personId === target)
        const pass = rows.length === 0
        const verb = def.eventId === 'EV-06' ? '换到' : '接手'
        push(step, true, '判时段冲突', pass
          ? `${personName(target)} ${verb} ${inst ? `${inst.form.name} ${inst.start}-${inst.end}` : '这个时段'} 不与其排班重叠，可以继续`
          : `${personName(target)} ${inst ? `当天已有重叠班次（${rows.map(r => `${r.formName} ${r.start}-${r.end}`).join('、')}）` : '已有排班'}，不能${verb}`)
        if (!pass) return { log, created, stopped: true }
        break
      }
      case 'swapResults': {
        const aInst = batch.instances.find(i => i.id === payload.instanceId)
        const bInst = batch.instances.find(i => i.id === payload.toInstanceId)
        const aRow = batch.results.find(r => r.personId === payload.personId && r.instanceId === payload.instanceId)
        const bRow = batch.results.find(r => r.personId === payload.toPersonId && r.instanceId === payload.toInstanceId)
        if (!aInst || !bInst || !aRow || !bRow) {
          push(step, false, '对调占位', '两边没有同时在场次里的排班记录，换不了')
          break
        }
        const moveRow = (row, fromInst, toInst) => {
          const i = batch.results.indexOf(row)
          if (i !== -1) batch.results.splice(i, 1)
          const fi = fromInst.results.indexOf(row)
          if (fi !== -1) fromInst.results.splice(fi, 1)
          const next = {
            ...row,
            id: `R-${toInst.id}-${row.personId}`,
            instanceId: toInst.id, planId: toInst.planId, spaceId: toInst.spaceId, date: toInst.date,
            formName: toInst.form.name, start: toInst.start, end: toInst.end,
            hours: (timeMin(toInst.end) - timeMin(toInst.start)) / 60,
            overtimeMin: overtimeMin4(toInst.spaceId, row.positionId, toInst.start, toInst.end),
            way: '换班对调', fromEvent: false, fromSwap: true, committed: false
          }
          batch.results.push(next)
          toInst.results.push(next)
          return next
        }
        const aNext = moveRow(aRow, aInst, bInst)
        const bNext = moveRow(bRow, bInst, aInst)
        // 换班不碰名额池：两边实例的 filled / left 都不变（各实例仍是同样多的人在岗，只是换了谁）
        // 痕迹：两条原记录都进历史，写清换的是哪一条
        batch.history = batch.history || []
        const aOld = { ...aRow, released: true, releasedWhy: `换班对调：${aInst.date} ${aInst.form.name} ${aInst.start}–${aInst.end} 换给 ${personName(payload.toPersonId)}` }
        const bOld = { ...bRow, released: true, releasedWhy: `换班对调：${bInst.date} ${bInst.form.name} ${bInst.start}–${bInst.end} 换给 ${personName(payload.personId)}` }
        batch.history.push(aOld, bOld)
        push(step, true, '对调占位',
          `${personName(payload.personId)} ${aInst.date} ${aInst.form.name} ↔ ${personName(payload.toPersonId)} ${bInst.date} ${bInst.form.name} 对调完成；名额池不动，两条原班次进历史（${aNext.id} / ${bNext.id}）`)
        break
      }
      case 'stopSlot': {
        const rows = batch.results.filter(r => r.personId === payload.personId && !r.fromEvent)
        for (const r of rows) r.stopped = true
        push(step, true, '停用/调整时段', rows.length ? `停用 ${personName(payload.personId)} 后续 ${rows.length} 个班次` : '没有需要停用的班次')
        break
      }
      case 'adjustQuota': {
        const inst = payload.instanceId ? batch.instances.find(i => i.id === payload.instanceId) : null
        if (!inst) { push(step, false, '人工调整名额', '没找到时段'); break }
        const delta = Number(p.count || 1)
        const before = inst.quota.effective
        inst.quota.adjusted = { value: Math.max(0, before + delta), by: p.by || '人事', at: '演示时刻' }
        inst.quota.effective = inst.quota.adjusted.value
        inst.left = Math.max(0, inst.quota.effective - inst.filled)
        push(step, true, '人工调整名额', `${inst.form.name} ${inst.start}-${inst.end}：${before} → ${inst.quota.effective}（${p.by || '人事'}操作，算法初始值 ${inst.quota.initial} 不变）`)
        break
      }
      case 'genBatch': {
        push(step, true, '生成批次时段', '按计划铺开本周期时段（在配置台「立即生成」里可用）')
        break
      }
      case 'queryResult': {
        const rows = batch.results.filter(r => !payload.personId || r.personId === payload.personId)
        push(step, true, '查结果', `查到 ${rows.length} 条记录`)
        break
      }
      default:
        push(step, false, capName(step.cap), '能力未实现')
    }
  }
  return { log, created, stopped: false }
}
