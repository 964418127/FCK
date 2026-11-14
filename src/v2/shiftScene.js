/**
 * 事件模板：班次请假补位（2026-11-13 追加）。
 *
 * 为什么加这一套：排班 v4 那边把「请假 → 释放 → 切补班段 → 算名额 → 发布 → 补位 → 写结果」
 * 直接写在排班引擎里；这一套是把同一件事搬到事件编排上，看用「提示词 + 骨架」能不能表达。
 *
 * 与离职 / 转正 / 调岗 / 调薪共用同一份契约、同一个生成器、同一套字段与路径构造器；
 * 不同只有两处：
 *   · 主体是一段容量（时段），不是一个人的档案
 *   · 承接的人是回执里的一个值，不是这一单的当事人
 */

import { SK_BUILD } from './skeleton.js'

const { system, action } = SK_BUILD

const SHIFT_BODY = `【这件事是什么】
一个人请假或临时走开，他名下的一段班次空出来了。这件事要交付的，是「这段容量被重新补上」：
先把这个人占的那一格放出来，再按时间形态决定补的方式，算出名额、发布出去、按档位顺序找到接手的人，最后写进排班结果。

【时间形态怎么处理】
原班次不一定还能用。请假覆盖的是连续几个小时，而一个人接着干满这么长未必合适 ——
先把被覆盖的区间按单人单段上限切开，切成一段一段的补班时段，再逐段算名额。
切出来的是容量形态，占位留给后面分配那一步；不要在这一步就指定谁干哪一段。

【名额怎么来】
名额由算法算，不由这一步的人拍：算出来时要把算式一起带回来，说不清怎么算的数不能拿去分配。
算完不直接生效 —— 中间留一个改动窗给人改，改了留痕；发布之后才可见。
发布之前名额存在但没人能领；档位开放时间也从发布那一刻起算。

【谁来补】
按档位顺序吃名额，不是挑最闲的人：第一档没人接才轮到第二档，最后才落到兜底档。
档位外的人不因为「反正空着」就放进来。补之前两条判断都要过：
这个人当天没有请假、岗位与这个名额的档位对得上；接手之后不与自己已有的班次重叠。
首尾相接可以接 —— 18:00 结束的班接着 18:00 开始的段，不算冲突；跨店还要看两段之间够不够通勤。

【不要做什么】
不代算工时与工资：补了几个小时、算不算加班、给多少钱，由薪酬侧按打卡与规则算，本流程只交付「这段有人了」。
不改请假结论：假是假勤批的，本流程只消费「某天某段被覆盖了」这个事实。
不跨店借人自己做主：档位里没有本店的人，就留空标「无人接」，转人事处理，不擅自去调别家店的人。
不硬凑满：一个时段两个人各 4 小时，就是两个占位，不要为了「看着排满了」合成一个 8 小时的段。`

const shiftSkeleton = [
  {
    key: 'shift.release',
    goal: '原班次名额已释放',
    needs: 'always',
    gate: 'must',
    after: [],
    note: '先把这个人占的那一格放出来；放出来的是名额，不是把时段删了',
    paths: [action('act.releaseShift', '请假覆盖的那个时段实例', { times: 2, interval: '30m', onExhaust: 'human' })]
  },
  {
    key: 'makeup.slots',
    goal: '补班时段已生成',
    needs: 'always',
    gate: 'must',
    after: ['shift.release'],
    note: '按单人单段上限切：4 小时的缺口切两段，不切成一个 8 小时的长班',
    paths: [action('act.makeupShifts', '被覆盖的时间区间', { times: 2, interval: '30m', onExhaust: 'human' })]
  },
  {
    key: 'quota.left',
    goal: '补班时段余量已读取',
    needs: 'always',
    gate: 'must',
    after: ['makeup.slots'],
    note: '只读：现在还剩几个位置。余量为 0 就不必往下算名额',
    paths: [system('shiftQuotaLeft', '1h', 3)]
  },
  {
    key: 'quota.calc',
    goal: '补位名额已算出',
    needs: 'always',
    gate: 'must',
    after: ['quota.left'],
    note: '算出来的是建议值，带算式；中间留改动窗，不直接生效',
    paths: [action('act.calcQuota', '刚切出来的补班时段', { times: 2, interval: '30m', onExhaust: 'human' })]
  },
  {
    key: 'quota.publish',
    goal: '补位名额已发布',
    needs: 'always',
    gate: 'must',
    after: ['quota.calc'],
    note: '发布才可见；发布之前名额存在但没人能领，档位开放时间从这一刻起算',
    paths: [action('act.publishQuota', '补班时段', { times: 3, interval: '30m', onExhaust: 'human' })]
  },
  {
    key: 'fill.qualify',
    goal: '补位人资格已核过',
    needs: 'always',
    gate: 'must',
    after: ['quota.publish'],
    note: '当天没请假、岗位与名额档位对得上；对不上就不进补位池',
    paths: [system('shiftQualify', '1h', 3)]
  },
  {
    key: 'fill.conflict',
    goal: '接手人没有时段冲突',
    needs: 'always',
    gate: 'must',
    after: ['fill.qualify'],
    note: '重叠才算冲突，首尾相接可以接；跨店还要看通勤间隔',
    paths: [system('shiftConflict', '1h', 3)]
  },
  {
    key: 'fill.assign',
    goal: '补位人已按优先序列确定',
    needs: 'always',
    gate: 'must',
    after: ['fill.conflict'],
    note: '按档位顺序吃名额，从上往下；档位全空就留空标「无人接」，不硬塞档位外的人',
    paths: [action('act.allocateShift', '本时段补位池', { times: 2, interval: '1h', onExhaust: 'human' })]
  },
  {
    key: 'write.result',
    goal: '排班结果已写入',
    needs: 'always',
    gate: 'must',
    after: ['fill.assign'],
    note: '全流程唯一写占位的口：这一条不落，前面释放和分配都只是中间态',
    paths: [action('act.writeScheduleResult', '这一单的补位结果', { times: 3, interval: '1h', onExhaust: 'human' })]
  }
]

export const shiftEvent = {
  key: 'shift-fill',
  name: '班次请假补位',
  desc: '班次被请假覆盖后，切补班段、算名额、发布并按档位补上人',
  scope: {
    jobs: ['推拿师', '客户经理', '前台'],
    cities: [],
    stores: [],
    employTypes: ['全职', '兼职', '试用']
  },
  trigger: {
    type: 'business',
    eventPoint: 'shift.leave.approved',
    entry: '假勤 · 请假审批 · 审批通过后发出',
    payload: [
      { field: 'applyNo', use: 'show' },
      { field: 'empId', use: 'intake' },
      { field: 'leaveDate', use: 'bind' },
      { field: 'shiftNo', use: 'bind' },
      { field: 'shiftStart', use: 'show' },
      { field: 'shiftEnd', use: 'show' }
    ]
  },
  skeleton: shiftSkeleton,
  facts: [],
  body: SHIFT_BODY,
  status: 'active',
  currentVersion: 1,
  versions: [
    {
      v: 1,
      savedAt: '2026-11-13 17:10',
      savedBy: 'Lacus7',
      note: '首版：释放 → 切补班段 → 读余量 → 算名额 → 发布 → 判资格 → 判冲突 → 分配 → 写结果',
      keys: shiftSkeleton.map((s) => s.key)
    }
  ],
  updatedAt: '2026-11-13 17:10',
  updatedBy: 'Lacus7'
}
