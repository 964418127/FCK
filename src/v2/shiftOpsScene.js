/**
 * 事件模板：非全主动取消 / 非全转移 / 换班（2026-11-13 追加）。
 *
 * 排班 v4 事件清单里剩下的三条，与「班次请假补位」共用同一份契约、同一个生成器；
 * 差别只在：
 *   · 触发不是审批通过，是移动端上本人（或对方）的一个动作
 *   · 第一步都是「后续处理规则校验」—— 规则是生成时段时快照的，改规则不回溯已发的单子
 *   · 转移 / 换班多一个「等对方确认」的环节：确认发生在移动端、落成回执事实，
 *     流程侧按小时问「确认了没、等待期过了没」（与「离职日期到没到」同一套路）
 */

import { SK_BUILD } from './skeleton.js'

const { system, action } = SK_BUILD

/* ---------------- EV-02 · 非全主动取消 ---------------- */

const CANCEL_BODY = `【这件事是什么】
非全在移动端把自己的一段班次退回去。要交付的是「这段容量按规则处理完毕」：
规则允许、没过截止，才能发起；释放名额之后的去向不由发起人选，由时段快照里的规则定。

【释放之后】
回池：名额回到池子里，等下一轮分配，按档位顺序找接手的人；找不着就留空，不硬塞。
作废：名额不回池，时段直接少一个位 —— 适合临近开班、来不及找人的场景。
到底是回池还是作废，判规则那一步会带出 releaseMode，分配那一步照着办，不要自己挑。

【不要做什么】
不问原因：取消原因只留痕，规则判断不看它 —— 规则说能取消就是能取消。
不改别人的单：一个人只能取消自己名下的班次，payload 里的工号就是发起人本人。`

const cancelSkeleton = [
  {
    key: 'rule.check',
    goal: '规则允许取消且未过截止',
    needs: 'always',
    gate: 'must',
    after: [],
    note: '读这一单的时段快照，不读现行配置 —— 规则后来改了，不影响已经发出来的单子',
    paths: [system('aftercareRuleCheck', '1h', 1)]
  },
  {
    key: 'shift.release',
    goal: '被取消班次的名额已释放',
    needs: 'always',
    gate: 'must',
    after: ['rule.check'],
    note: '去向由规则定（回池 / 作废），判规则那一步已带出 releaseMode',
    paths: [action('act.releaseShift', '被取消的那个时段实例', { times: 2, interval: '30m', onExhaust: 'human' })]
  },
  {
    key: 'fill.assign',
    goal: '释放出的名额已有去向',
    needs: 'always',
    gate: 'must',
    after: ['shift.release'],
    note: '回池的按档位顺序找接手人，找不着留空标「无人接」转人事；作废的不找人，这里落一条去向说明',
    paths: [action('act.allocateShift', '被释放时段的承接池', { times: 2, interval: '1h', onExhaust: 'human' })]
  },
  {
    key: 'write.result',
    goal: '排班结果已写入',
    needs: 'always',
    gate: 'must',
    after: ['fill.assign'],
    note: '唯一写占位的口：取消后这条班次在发起人时间线上消失，去向都在历史里',
    paths: [action('act.writeScheduleResult', '这一单的取消结果', { times: 3, interval: '1h', onExhaust: 'human' })]
  }
]

export const shiftCancelEvent = {
  key: 'shift-cancel',
  name: '非全主动取消班次',
  desc: '规则允许且未过截止才放行；释放后名额按快照规则回池或作废',
  scope: {
    jobs: ['推拿师', '客户经理'],
    cities: [],
    stores: [],
    employTypes: ['兼职']
  },
  trigger: {
    type: 'business',
    eventPoint: 'shift.cancel.requested',
    entry: '移动端 · 我的排班 · 班次卡 · 取消',
    payload: [
      { field: 'applyNo', use: 'show' },
      { field: 'empId', use: 'intake' },
      { field: 'instanceId', use: 'bind' },
      { field: 'shiftDate', use: 'show' },
      { field: 'reason', use: 'show' }
    ]
  },
  skeleton: cancelSkeleton,
  facts: [],
  body: CANCEL_BODY,
  status: 'active',
  currentVersion: 1,
  versions: [
    {
      v: 1,
      savedAt: '2026-11-13 18:10',
      savedBy: 'Lacus7',
      note: '首版：规则校验 → 释放 → 承接 → 写结果',
      keys: cancelSkeleton.map((s) => s.key)
    }
  ],
  updatedAt: '2026-11-13 18:10',
  updatedBy: 'Lacus7'
}

/* ---------------- EV-03 · 非全转移班次 ---------------- */

const TRANSFER_BODY = `【这件事是什么】
非全把自己的班次转给指定的一位同事。单向：班从我这儿过到你那儿，没有对价 ——
要「我的班换你别的班」那是换班，另一件事，别混进这张单。

【先核再问】
发起人指定接收方，但资格和冲突不在发起时拍板：先核对方能不能接（在册、没请假、岗位对得上），
再看对方当天有没有重叠班次 —— 都过了才轮到对方确认。顺序反了就是拿没核过的单子去烦人。

【等对方】
确认发生在移动端，落成回执事实；流程侧按小时查「确认了没、等待期过了没」：
确认了就换主；还在等待期内就等下一批，不算失败；超时未确认，这一单判「失效」终止，占位不动。

【换主不是放名额】
转移成功换的是「人 × 名额」的绑定：名额不释放、不回池，filled / left 都不变，
原占位进历史留痕。把名额放出去再分配，是请假补位的路子，转移不走那条。`

const transferSkeleton = [
  {
    key: 'rule.check',
    goal: '规则允许转移且未过截止',
    needs: 'always',
    gate: 'must',
    after: [],
    note: '读这一单的时段快照；限同岗位的判断也在这里',
    paths: [system('aftercareRuleCheck', '1h', 1)]
  },
  {
    key: 'target.qualify',
    goal: '接收方资格已核过',
    needs: 'always',
    gate: 'must',
    after: ['rule.check'],
    note: '接收方在册、当天无请假、岗位与时段匹配；发起人指定不算数，核过才算',
    paths: [system('shiftQualify', '1h', 3)]
  },
  {
    key: 'target.conflict',
    goal: '接收方没有时段冲突',
    needs: 'always',
    gate: 'must',
    after: ['target.qualify'],
    note: '接收方同日无重叠班次；首尾相接可以接，跨店看通勤',
    paths: [system('shiftConflict', '1h', 3)]
  },
  {
    key: 'wait.accept',
    goal: '对方已确认（或等待期已超时）',
    needs: 'always',
    gate: 'must',
    after: ['target.conflict'],
    note: '按小时查：确认了往下走；还在等待期内等下一批（不是失败）；超时未确认本单失效、占位不动',
    paths: [system('waitPeriodExpired', '1h', 48)]
  },
  {
    key: 'occupy.transfer',
    goal: '占位已换主',
    needs: 'always',
    gate: 'must',
    after: ['wait.accept'],
    note: '换的是绑定不是名额：filled / left 不变，原占位进历史',
    paths: [action('act.transferOccupy', '发起人转出的那个时段占位', { times: 2, interval: '30m', onExhaust: 'human' })]
  },
  {
    key: 'write.result',
    goal: '排班结果已写入',
    needs: 'always',
    gate: 'must',
    after: ['occupy.transfer'],
    note: '唯一写占位的口：转移后两个工号的时间线都要对得上',
    paths: [action('act.writeScheduleResult', '这一单的转移结果', { times: 3, interval: '1h', onExhaust: 'human' })]
  }
]

export const shiftTransferEvent = {
  key: 'shift-transfer',
  name: '非全转移班次',
  desc: '先核对方资格与冲突，再等对方确认；超时失效，确认即占位换主',
  scope: {
    jobs: ['推拿师', '客户经理'],
    cities: [],
    stores: [],
    employTypes: ['兼职']
  },
  trigger: {
    type: 'business',
    eventPoint: 'shift.transfer.requested',
    entry: '移动端 · 我的排班 · 班次卡 · 转给同事',
    payload: [
      { field: 'applyNo', use: 'show' },
      { field: 'empId', use: 'intake' },
      { field: 'instanceId', use: 'bind' },
      { field: 'toPersonId', use: 'bind' }
    ]
  },
  skeleton: transferSkeleton,
  facts: [],
  body: TRANSFER_BODY,
  status: 'active',
  currentVersion: 1,
  versions: [
    {
      v: 1,
      savedAt: '2026-11-13 18:10',
      savedBy: 'Lacus7',
      note: '首版：规则校验 → 资格 → 冲突 → 等确认 → 换主 → 写结果',
      keys: transferSkeleton.map((s) => s.key)
    }
  ],
  updatedAt: '2026-11-13 18:10',
  updatedBy: 'Lacus7'
}

/* ---------------- EV-06 · 换班（两人对调） ---------------- */

const SWAP_BODY = `【这件事是什么】
两个人把各自的班次对调：我的早班换你的晚班，双向对价，一张单绑两个班次编号。
缺一边就不是换班 —— 单边给班是转移，别配错。

【两边都要核】
冲突检查双边各跑一次：我换出去的那段从我时间线让位、对方换入的那段进我时间线，
反过来同理。判的时候要把「自己换出的那条」排除掉，否则永远跟自己冲突。

【等对方】
与转移同一套路：对方在移动端点同意落成回执事实，流程按小时查；
等待期超时未同意，单子失效终止，两边占位都不动 —— 换班要么成要么不成，不做半套。

【对调不是释放】
对调成功是两边占位一起换主：名额池 filled / left 都不动，两条原占位各进各的历史、标「换给谁」。
把名额放回池子重新分配，就成了两次补位，对价关系就丢了。`

const swapSkeleton = [
  {
    key: 'rule.check',
    goal: '规则允许换班且未过截止',
    needs: 'always',
    gate: 'must',
    after: [],
    note: '两个班次各自的快照都要允许换班；同岗位对等的要求也在这里核',
    paths: [system('aftercareRuleCheck', '1h', 1)]
  },
  {
    key: 'both.conflict',
    goal: '双边冲突检查已通过',
    needs: 'always',
    gate: 'must',
    after: ['rule.check'],
    note: '各查各的换入段，排除自己换出的那条；首尾相接可以接，跨店看通勤',
    paths: [system('shiftConflict', '1h', 3)]
  },
  {
    key: 'wait.accept',
    goal: '对方已同意（或等待期已超时）',
    needs: 'always',
    gate: 'must',
    after: ['both.conflict'],
    note: '按小时查：同意了往下走；还在等待期内等下一批；超时未同意本单失效、两边占位都不动',
    paths: [system('waitPeriodExpired', '1h', 48)]
  },
  {
    key: 'occupy.swap',
    goal: '两边占位已对调',
    needs: 'always',
    gate: 'must',
    after: ['wait.accept'],
    note: '双向对价一次完成；任一边失败两边一起回滚，不做半套',
    paths: [action('act.swapOccupy', '发起人与对方各自的时段占位', { times: 2, interval: '30m', onExhaust: 'human' })]
  },
  {
    key: 'write.result',
    goal: '排班结果已写入',
    needs: 'always',
    gate: 'must',
    after: ['occupy.swap'],
    note: '唯一写占位的口：两个人时间线上的班次从此互换，痕迹都在历史里',
    paths: [action('act.writeScheduleResult', '这一单的对调结果', { times: 3, interval: '1h', onExhaust: 'human' })]
  }
]

export const shiftSwapEvent = {
  key: 'shift-swap',
  name: '换班（两人对调）',
  desc: '双边冲突各查一次，对方同意后两边占位一次对调；超时未同意即失效',
  scope: {
    jobs: ['推拿师', '客户经理'],
    cities: [],
    stores: [],
    employTypes: ['全职', '兼职']
  },
  trigger: {
    type: 'business',
    eventPoint: 'shift.swap.proposed',
    entry: '移动端 · 我的排班 · 班次卡 · 找人换班',
    payload: [
      { field: 'applyNo', use: 'show' },
      { field: 'empId', use: 'intake' },
      { field: 'instanceId', use: 'bind' },
      { field: 'toPersonId', use: 'bind' },
      { field: 'toInstanceId', use: 'bind' }
    ]
  },
  skeleton: swapSkeleton,
  facts: [],
  body: SWAP_BODY,
  status: 'active',
  currentVersion: 1,
  versions: [
    {
      v: 1,
      savedAt: '2026-11-13 18:10',
      savedBy: 'Lacus7',
      note: '首版：规则校验 → 双边冲突 → 等同意 → 对调占位 → 写结果',
      keys: swapSkeleton.map((s) => s.key)
    }
  ],
  updatedAt: '2026-11-13 18:10',
  updatedBy: 'Lacus7'
}
