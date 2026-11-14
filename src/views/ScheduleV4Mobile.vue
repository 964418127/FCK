<!--
  移动端 · 排班（v4）
  三段：我的排班（个人时间线：原班次 → 被覆盖 → 补位，历史全保留）· 可申领名额（先到先得当场领）· 通知（补位确认 / 覆盖回执）。
  一套壳按资格过滤：打开看到的是自己空间里自己档位的东西，不按岗位分入口。
  视觉对齐 ScheduleV3Mobile / MobileParttimeTasks 规范：全屏页、白色页头、#f5f5f5 底、白卡 12px、品牌红 #a40035、自写底部弹层。
-->
<template>
  <div class="m-page">
    <header class="page-header">
      <el-icon class="back-icon" @click="goBack"><ArrowLeft /></el-icon>
      <h1>排班</h1>
      <div class="ps-slot"><PersonaSwitch4 /></div>
    </header>

    <div class="content-container">
      <div class="view-tabs">
        <button :class="{ active: tab === 'mine' }" @click="tab = 'mine'">我的排班</button>
        <button :class="{ active: tab === 'pick' }" @click="tab = 'pick'">可申领名额</button>
        <button :class="{ active: tab === 'notice' }" @click="tab = 'notice'">通知<span v-if="unacked" class="badge">{{ unacked }}</span></button>
      </div>

      <!-- 我的排班：个人时间线 -->
      <section v-if="tab === 'mine'">
        <MonthCalendar
          :year="mineYear"
          :month="mineMonth"
          :selected="selMineDate"
          :marks="mineMarks"
          :today="todayStr"
          :legend="[
            { cls: 'red', label: '已排定' },
            { cls: 'amber', label: '含覆盖历史' }
          ]"
          @select="selMineDate = $event"
          @move="moveMine"
        />

        <div class="day-section">
          <div class="section-title-row">
            <span class="red-bar"></span>
            <span class="section-title">{{ selMineDate ? `${selMineLabel} 的时间线` : '排班明细' }}</span>
          </div>

          <div v-if="!selMineDate || !dayLines.length" class="empty-text">这一天没有记录</div>

          <div v-for="(r, i) in dayLines" :key="r.id + r.state + i" :class="['res-card', { covered: r.state === 'covered' }]">
            <div class="rc-head">
              <span :class="['way-tag', r.state === 'covered' ? 'way-covered' : 'way-active']">
                {{ r.state === 'covered' ? '已释放' : wayLabel(r) }}
              </span>
              <span v-if="r.state === 'active' && r.fromEvent && !r.acked" class="need-ack">待确认</span>
              <span v-else-if="r.state === 'active' && r.swapPending" class="wait-tag">换班待同意</span>
              <span v-else-if="r.state === 'active' && r.transferPending" class="wait-tag">转移待接受</span>
            </div>
            <div class="rc-body">
              <div class="rc-store"><el-icon><Location /></el-icon><span>{{ spaceName(r.spaceId) }}</span></div>
              <div class="rc-time-row">
                <div :class="['rc-time', { strike: r.state === 'covered' }]">
                  <el-icon><Clock /></el-icon><span>{{ r.formName }} {{ r.start }} - {{ r.end }}</span>
                </div>
              </div>
            </div>
            <p class="rc-note">
              <template v-if="r.state === 'covered'">{{ r.note }}（原计划痕迹保留，不会消失）</template>
              <template v-else-if="r.swapPending">换班邀请还在等待期里，对方同意才真正对调，超时两边都不动</template>
              <template v-else-if="r.transferPending">转给同事的邀请还在等待期里，对方接受就换人，超时自动失效回到你名下</template>
              <template v-else-if="r.fromEvent">系统按事件规则把你排进来的补班，不是申领来的</template>
              <template v-else-if="r.fromSwap">换班对调来的，你换出的那条在历史里</template>
              <template v-else-if="r.fromClaim">你在可申领名额里自己领的</template>
              <template v-else-if="r.overtimeMin > 0">超出标准时间 {{ (r.overtimeMin / 60).toFixed(1) }} 小时，这部分计加班</template>
              <template v-else>系统排定</template>
            </p>
            <!-- 班次后续处理：规则跟时段走，允许才出按钮 -->
            <div v-if="r.state === 'active' && !r.transferPending && !r.swapPending && r.aftercare && r.date >= todayStr" class="rc-acts">
              <button v-if="r.aftercare.cancel?.allow" class="act-line" @click="openCancel(r)">取消班次</button>
              <button v-if="r.aftercare.transfer?.allow" class="act-line" @click="openTransfer(r)">转给同事</button>
              <button v-if="r.aftercare.swap?.allow" class="act-line" @click="openSwap(r)">找人换班</button>
            </div>
          </div>
        </div>
      </section>

      <!-- 可申领名额 -->
      <section v-else-if="tab === 'pick'">
        <div class="release-banner">
          <el-icon><Clock /></el-icon>
          <div>
            <strong>{{ pickList.length ? `${pickList.length} 个名额可以当场领` : '暂时没有你能领的名额' }}</strong>
            <p>只有「先到先得」的计划在这里出现；系统排定和事件补位的不走这里，直接出现在你的时间线和通知里。</p>
          </div>
        </div>

        <MonthCalendar
          :year="pickYear"
          :month="pickMonth"
          :selected="selDate"
          :marks="pickMarks"
          :today="todayStr"
          @select="selDate = $event"
          @move="movePick"
        />
        <div class="date-count-line">
          {{ selDate ? `${selDateLabel} · ${selDayList.length} 个可领时段` : '选一个有红点的日期看当天可领的名额' }}
        </div>

        <div v-for="it in selDayList" :key="it.id" class="slot-card">
          <div class="sc-head">
            <span class="sc-date">{{ headDate(it.date) }}</span>
            <span :class="['sc-badge', it.left > 0 ? 'tone-open' : 'tone-full']">{{ it.left > 0 ? '可领' : '已分完' }}</span>
          </div>
          <div class="sc-store"><el-icon><Location /></el-icon><span>{{ spaceName(it.spaceId) }} · {{ planName(it.planId) }}</span></div>
          <div class="sc-time-row">
            <div class="sc-time"><el-icon><Clock /></el-icon><span>{{ it.form.name }} {{ it.start }} - {{ it.end }}</span></div>
          </div>
          <p class="sc-close">先到先得、当场生效；领了就进你的时间线，与已有班次重叠的领不了</p>
          <div class="sc-foot">
            <span class="sc-quota"><b :class="{ full: it.left === 0 }">剩 {{ it.left }} / {{ it.quota.effective }} 个名额</b></span>
            <button v-if="it.left > 0" class="act-btn primary" @click="pick(it)">申领</button>
            <span v-else class="sc-done">没名额了</span>
          </div>
        </div>

        <div v-if="pickList.length && selDate && !selDayList.length" class="empty-text">这一天没有你能领的时段</div>
        <div v-else-if="!pickList.length" class="empty-text">现在没有你能领的名额</div>
      </section>

      <!-- 通知 -->
      <section v-else>
        <div v-if="!notices.length" class="empty-text">没有新通知</div>
        <div v-for="n in notices" :key="n.id" :class="['notice-card', n.kind, { unacked: !n.acked }]">
          <div class="nc-head">
            <strong>{{ n.kind === 'makeup' ? '补位通知' : n.kind === 'transfer' ? '转移邀请' : n.kind === 'swap' ? '换班邀请' : n.kind === 'transferIn' ? '转移生效' : n.kind === 'swapIn' ? '换班生效' : '班次调整' }}</strong>
            <span class="nc-date">{{ n.date }}</span>
          </div>
          <p>{{ n.text }}</p>
          <p class="nc-detail">{{ n.detail }}</p>
          <div v-if="(n.kind === 'transfer' || n.kind === 'swap') && !n.acked" class="nc-act">
            <button class="act-btn ghost" @click="doDecline(n)">拒绝</button>
            <button class="act-btn primary" @click="n.kind === 'swap' ? doAcceptSwap(n) : doAccept(n)">{{ n.kind === 'swap' ? '同意换班' : '接受' }}</button>
          </div>
          <div v-else-if="n.kind === 'makeup' && !n.acked" class="nc-act">
            <button class="act-btn primary" @click="ack(n)">确认收到</button>
          </div>
          <div v-else-if="n.kind === 'makeup'" class="nc-done">✓ 已确认</div>
        </div>
      </section>
    </div>

    <!-- 申领确认：底部弹层 -->
    <div v-if="confirming" class="sheet-mask" @click.self="confirming = false">
      <div class="sheet">
        <div class="sheet-h">申领确认</div>
        <div v-if="cur" class="sheet-body">
          <div class="sheet-shift">{{ shortDate(cur.date) }} · {{ cur.form.name }}</div>
          <div class="sheet-meta">{{ cur.start }}–{{ cur.end }} · {{ spaceName(cur.spaceId) }}</div>
          <div class="checks">
            <div><i>✓</i>与已有排班不冲突（首尾相接可以）</div>
            <div><i>✓</i>当天没有请假</div>
            <div><i>✓</i>名额在你的档位里</div>
          </div>
          <p class="sheet-note">先到先得，确认后当场生效并写入排班结果。</p>
          <div class="sheet-act">
            <button class="btn-ghost" @click="confirming = false">再想想</button>
            <button class="btn-main" @click="doClaim">确认申领</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 取消班次：底部弹层 -->
    <div v-if="canceling" class="sheet-mask" @click.self="canceling = false">
      <div class="sheet">
        <div class="sheet-h">取消班次</div>
        <div v-if="cancelRow" class="sheet-body">
          <div class="sheet-shift">{{ shortDate(cancelRow.date) }} · {{ cancelRow.formName }}</div>
          <div class="sheet-meta">{{ cancelRow.start }}–{{ cancelRow.end }} · {{ spaceName(cancelRow.spaceId) }}</div>
          <div class="checks">
            <div><i>✓</i>开班前 {{ fmtDur4(acMinutes4(cancelRow.aftercare?.cancel)) }}内不可取消</div>
            <div><i>✓</i>{{ cancelRow.aftercare?.cancel?.mode === 'void' ? '名额作废不回池，时段由后续安排弥补' : '名额回池，系统按计划规则补人' }}</div>
            <div><i>✓</i>取消记录保留在你的时间线里</div>
          </div>
          <p class="sheet-note">取消会触发「非全取消班次」事件：先释放名额，再按规则看要不要补人。</p>
          <div class="sheet-act">
            <button class="btn-ghost" @click="canceling = false">再想想</button>
            <button class="btn-main danger" @click="doCancel">确认取消</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 转给同事：底部弹层 -->
    <div v-if="transferring" class="sheet-mask" @click.self="transferring = false">
      <div class="sheet">
        <div class="sheet-h">转给同事</div>
        <div class="sheet-body">
          <div v-if="transferRow" class="sheet-shift">{{ shortDate(transferRow.date) }} · {{ transferRow.formName }} {{ transferRow.start }}–{{ transferRow.end }}</div>
          <p class="sheet-note">发起后进入等待期（{{ fmtDur4(acMinutes4(transferRow?.aftercare?.transfer)) }}）：对方接受就换人，拒绝或超时都自动失效、班次留在你名下。</p>
          <div v-if="candidates.length" class="cand-list">
            <button v-for="c in candidates" :key="c.id" class="cand" @click="doTransfer(c)">
              <strong>{{ c.name }}</strong>
              <span>{{ posName4(c.positionId) }} · {{ c.employ === 'fulltime' ? '全职' : '非全' }}</span>
              <em>发起转移</em>
            </button>
          </div>
          <div v-else class="empty-text">没有可转的同岗位同事（当天请假的除外）</div>
        </div>
      </div>
    </div>

    <!-- 找人换班：底部弹层（双向对价，列的是对方愿意换、且换过来不冲突的班次） -->
    <div v-if="swapping" class="sheet-mask" @click.self="swapping = false">
      <div class="sheet">
        <div class="sheet-h">找人换班</div>
        <div class="sheet-body">
          <div v-if="swapRow" class="sheet-shift">{{ shortDate(swapRow.date) }} · {{ swapRow.formName }} {{ swapRow.start }}–{{ swapRow.end }}</div>
          <p class="sheet-note">换班是双向的：你给出这条，对方给出一条。发起后进入等待期（{{ fmtDur4(acMinutes4(swapRow?.aftercare?.swap)) }}），对方同意才真正对调，超时两边都不动；名额池不受影响。</p>
          <div v-if="swapGroups.length" class="cand-list">
            <template v-for="g in swapGroups" :key="g.person.id">
              <div class="swap-person">{{ g.person.name }}<span>{{ posName4(g.person.positionId) }} · {{ g.person.employ === 'fulltime' ? '全职' : '非全' }}</span></div>
              <button v-for="s in g.shifts" :key="s.id" class="cand swap-cand" @click="doSwap(g.person, s)">
                <strong>{{ shortDate(s.date) }} {{ s.formName }}</strong>
                <span>{{ s.start }}–{{ s.end }}</span>
                <em>换这条</em>
              </button>
            </template>
          </div>
          <div v-else class="empty-text">没有能换的班次：同岗位、那天没请假、换过来双方都不冲突的才会列出来</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Clock, Location } from '@element-plus/icons-vue'
import { findSpace4, fmtDate, posName4, acMinutes4, fmtDur4 } from '../mock/scheduleV4.js'
import {
  v4, me4, claimableOf4, claim4, timelineOf4, noticesOf4, ackNotice4,
  cancelShift4, proposeTransfer4, acceptTransfer4, declineTransfer4,
  swapCandidates4, proposeSwap4, acceptSwap4
} from '../mock/scheduleV4Store.js'
import PersonaSwitch4 from '../components/v4/PersonaSwitch4.vue'
import MonthCalendar from '../components/v3/MonthCalendar.vue'

const route = useRoute()
const router = useRouter()
const tab = ref(['mine', 'pick', 'notice'].includes(route.query.tab) ? route.query.tab : 'mine')
const me = computed(() => me4())

/** 返回：一律回移动端菜单（移动端自己的桌面），不回 web 配置台 */
const goBack = () => router.replace({ name: 'mobile-menu' })

const todayStr = fmtDate(new Date(v4.now))
const shortDate = d => {
  const dt = new Date(`${d}T00:00:00`)
  return `${dt.getMonth() + 1}月${dt.getDate()}日 周${'日一二三四五六'[dt.getDay()]}`
}
const weekdayLabel = d => `周${'日一二三四五六'[new Date(`${d}T00:00:00`).getDay()]}`
const headDate = d => `${weekdayLabel(d)} · ${Number(d.slice(5, 7))}月${Number(d.slice(8))}日`
const spaceName = id => findSpace4(id)?.name || id
const planName = id => v4.plans.find(p => p.id === id)?.name || id

/** 员工侧人话：不暴露分配机制术语 */
const WAY_EMP = {
  轮转直派: '系统排定',
  先到先得: '自主领取',
  审核通过: '申领成功',
  补位分配: '系统补位',
  兜底补位: '系统调剂',
  转移承接: '同事转来',
  换班对调: '同事换班'
}
const wayLabel = r => WAY_EMP[r.way] || r.way

const monthKeyOf = d => d.slice(0, 7)
const shiftTo = (state, delta, markedDates) => {
  let m = state.month.value + delta
  let y = state.year.value
  if (m < 1) { m = 12; y-- } else if (m > 12) { m = 1; y++ }
  state.year.value = y
  state.month.value = m
  const key = `${y}-${String(m).padStart(2, '0')}`
  state.sel.value = markedDates.filter(d => monthKeyOf(d) === key).sort()[0] || ''
}

/* ---------- 我的排班：时间线 + 月历 ---------- */
const timeline = computed(() => timelineOf4(me.value.id))
const timelineDates = computed(() => [...new Set(timeline.value.map(r => r.date))])
const mineMarks = computed(() => {
  const m = {}
  for (const r of timeline.value) {
    m[r.date] = m[r.date] || {}
    if (r.state === 'covered') m[r.date].amber = (m[r.date].amber || 0) + 1
    else m[r.date].red = (m[r.date].red || 0) + 1
  }
  return m
})
const mineYear = ref(Number(todayStr.slice(0, 4)))
const mineMonth = ref(Number(todayStr.slice(5, 7)))
const selMineDate = ref(timelineDates.value.sort().find(d => d >= todayStr) || timelineDates.value[0] || todayStr)
// 切换身份后时间线会变：选中日期跟着走，避免停在新身份没有记录的日子上
watch(timelineDates, ds => {
  if (!selMineDate.value || !ds.includes(selMineDate.value)) {
    selMineDate.value = [...ds].sort().find(d => d >= todayStr) || ds[0] || ''
  }
})
const selMineLabel = computed(() => shortDate(selMineDate.value))
const dayLines = computed(() => timeline.value.filter(r => r.date === selMineDate.value))
const moveMine = delta => shiftTo({ year: mineYear, month: mineMonth, sel: selMineDate }, delta, timelineDates.value)

/* ---------- 可申领名额 ---------- */
const pickList = computed(() => claimableOf4(me.value.id))
const pickDates = computed(() => [...new Set(pickList.value.map(it => it.date))])
const pickMarks = computed(() => {
  const m = {}
  for (const it of pickList.value) m[it.date] = { red: (m[it.date]?.red || 0) + 1 }
  return m
})
const pickYear = ref(Number((pickDates.value[0] || todayStr).slice(0, 4)))
const pickMonth = ref(Number((pickDates.value[0] || todayStr).slice(5, 7)))
const selDate = ref(pickDates.value.sort()[0] || '')
// 切换身份后可领集合会变：选中日期跟着走，避免停在已不可领的日子上
watch(pickDates, ds => {
  if (!selDate.value || !ds.includes(selDate.value)) selDate.value = [...ds].sort()[0] || ''
})
const selDateLabel = computed(() => shortDate(selDate.value))
const selDayList = computed(() => pickList.value.filter(it => it.date === selDate.value))
const movePick = delta => shiftTo({ year: pickYear, month: pickMonth, sel: selDate }, delta, pickDates.value)

/* ---------- 申领 ---------- */
const confirming = ref(false)
const cur = ref(null)
const pick = it => { cur.value = it; confirming.value = true }
const doClaim = () => {
  claim4(me.value.id, cur.value.id)
  confirming.value = false
}

/* ---------- 通知 ---------- */
const notices = computed(() => noticesOf4(me.value.id))
const unacked = computed(() => notices.value.filter(n => !n.acked && (n.kind === 'makeup' || n.kind === 'transfer' || n.kind === 'swap')).length)
const ack = n => ackNotice4(n.rowId)

/* ---------- 取消班次 ---------- */
const canceling = ref(false)
const cancelRow = ref(null)
const openCancel = r => { cancelRow.value = r; canceling.value = true }
const doCancel = () => {
  const res = cancelShift4(me.value.id, cancelRow.value.instanceId)
  canceling.value = false
  if (!res.ok) {
    ElMessage.warning(res.why)
    return
  }
  ElMessage.success('已取消：名额按规则释放，系统继续编排')
}

/* ---------- 转给同事 ---------- */
const transferring = ref(false)
const transferRow = ref(null)
const openTransfer = r => { transferRow.value = r; transferring.value = true }
// 候选人：本空间在册、当天没请假、且计划的某个档位装得下他（岗位+用工性质都要匹配，
// 否则会把非全名额转给档位外的人）；规则限同岗位就再叠一层同岗位约束
const candidates = computed(() => {
  const r = transferRow.value
  if (!r) return []
  const plan = v4.plans.find(p => p.id === r.planId)
  const tiers = (plan?.priority || []).filter(t => !t.fallback)
  const samePosOnly = r.aftercare?.transfer?.samePositionOnly !== false
  return v4.people.filter(p =>
    p.id !== me.value.id && p.spaceId === r.spaceId && p.active !== false &&
    (!samePosOnly || p.positionId === me.value.positionId) &&
    tiers.some(t => t.positionId === p.positionId && (t.employ === 'any' || t.employ === p.employ)) &&
    !(v4.leaves || []).some(l => l.personId === p.id && l.date === r.date)
  )
})
const doTransfer = c => {
  const res = proposeTransfer4(me.value.id, transferRow.value.instanceId, c.id)
  transferring.value = false
  if (!res.ok) {
    ElMessage.warning(res.why)
    return
  }
  ElMessage.success(`已发起转移：等 ${c.name} 在 ${fmtDur4(res.transfer.waitMin)}内接受，超时自动失效`)
}

/* ---------- 转移邀请：接受 / 拒绝 ---------- */
const doAccept = n => {
  const res = acceptTransfer4(n.transferId)
  if (!res.ok) {
    ElMessage.warning(res.why)
    return
  }
  ElMessage.success('转移已成立，班次写入你的时间线')
}
const doDecline = n => {
  const res = declineTransfer4(n.kind === 'swap' ? n.swapId : n.transferId)
  if (res.ok) ElMessage.info('已拒绝，班次保持原样')
}

/* ---------- 找人换班 ---------- */
const swapping = ref(false)
const swapRow = ref(null)
const openSwap = r => { swapRow.value = r; swapping.value = true }
const swapGroups = computed(() => (swapRow.value ? swapCandidates4(me.value.id, swapRow.value.instanceId) : []))
const doSwap = (p, s) => {
  const res = proposeSwap4(me.value.id, swapRow.value.instanceId, p.id, s.instanceId)
  swapping.value = false
  if (!res.ok) {
    ElMessage.warning(res.why)
    return
  }
  ElMessage.success(`已发起换班：等 ${p.name} 在 ${fmtDur4(res.swap.waitMin)}内同意，超时两边都不动`)
}

/* ---------- 换班邀请：同意 ---------- */
const doAcceptSwap = n => {
  const res = acceptSwap4(n.swapId)
  if (!res.ok) {
    ElMessage.warning(res.why)
    return
  }
  ElMessage.success('换班已成立：两条班次对调，双方时间线都留痕')
}
</script>

<style scoped>
.m-page { min-height: 100vh; height: 100vh; display: flex; flex-direction: column; background: #f5f5f5; }

/* 页头 */
.page-header { display: flex; align-items: center; gap: 10px; padding: 14px 16px; background: #fff; position: sticky; top: 0; z-index: 20; box-shadow: 0 2px 8px rgba(0, 0, 0, .06); }
.back-icon { font-size: 22px; color: #333; cursor: pointer; }
.page-header h1 { flex: 1; text-align: center; font-size: 17px; font-weight: 600; margin: 0; }
.ps-slot { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); }

.content-container { flex: 1; min-height: 0; overflow-y: auto; -webkit-overflow-scrolling: touch; padding: 12px 15px 30px; }

/* 顶部三段 */
.view-tabs { display: flex; border-bottom: 1px solid #e5e7eb; margin-bottom: 14px; }
.view-tabs button { flex: 1; position: relative; padding: 12px 0; border: 0; border-bottom: 2px solid transparent; background: transparent; font-size: 15px; color: #666; cursor: pointer; }
.view-tabs button.active { color: #a40035; border-bottom-color: #a40035; font-weight: 600; }
.badge { display: inline-block; margin-left: 4px; min-width: 16px; height: 16px; line-height: 16px; border-radius: 8px; background: #a40035; color: #fff; font-size: 10px; padding: 0 4px; vertical-align: middle; }

/* 提示条 */
.release-banner { display: flex; gap: 10px; padding: 4px 0 14px; align-items: flex-start; }
.release-banner .el-icon { color: #a40035; font-size: 20px; margin-top: 1px; }
.release-banner strong { font-size: 14px; color: #333; }
.release-banner p { margin: 5px 0 0; font-size: 12px; line-height: 1.6; color: #888; }

.date-count-line { font-size: 12px; color: #777; margin: 0 0 10px; }

/* 可领卡 */
.slot-card { background: #fff; border: 1px solid #eee; border-radius: 12px; padding: 13px 14px; margin-bottom: 10px; }
.sc-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; }
.sc-date { font-size: 13px; font-weight: 600; color: #333; }
.sc-badge { flex: none; font-size: 12px; padding: 3px 10px; border-radius: 12px; font-weight: 600; }
.sc-badge.tone-open { background: #a40035; color: #fff; }
.sc-badge.tone-full { background: #e5e7eb; color: #6b7280; }
.sc-store { display: flex; align-items: center; gap: 6px; font-size: 15px; font-weight: 600; color: #333; margin-bottom: 8px; }
.sc-store .el-icon { color: #a40035; font-size: 16px; }
.sc-time-row { display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; border-bottom: 1px dashed #eee; }
.sc-time { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #666; }
.sc-time .el-icon { font-size: 13px; }
.sc-close { margin: 8px 0 0; font-size: 11.5px; line-height: 1.6; color: #9a9496; }
.sc-foot { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: 12px; padding-top: 10px; border-top: 1px solid #f3f4f6; }
.sc-quota { font-size: 12.5px; color: #888; }
.sc-quota b { font-weight: 600; color: #a40035; }
.sc-quota .full { color: #999; }
.sc-done { font-size: 12px; color: #999; }
.act-btn { border: 0; border-radius: 8px; padding: 8px 20px; font-size: 13px; font-weight: 600; cursor: pointer; font: inherit; }
.act-btn.primary { background: #a40035; color: #fff; }
.act-btn.ghost { background: #fff; color: #666; border: 1px solid #e5e7eb; }

/* 当天时间线 */
.day-section { background: #fff; border-radius: 12px; padding: 14px 14px 4px; }
.section-title-row { display: flex; align-items: center; gap: 6px; margin-bottom: 12px; }
.red-bar { display: inline-block; width: 4px; height: 14px; background: #a40035; border-radius: 2px; }
.section-title { font-size: 15px; font-weight: 600; color: #333; }
.res-card { border: 1px solid #eee; border-radius: 10px; padding: 12px; margin-bottom: 10px; background: #fff; }
.res-card.covered { background: #fafafa; border-color: #e5e7eb; }
.rc-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.way-tag { flex: none; font-size: 12px; padding: 3px 10px; border-radius: 12px; font-weight: 600; }
.way-tag.way-active { background: #d1fae5; color: #047857; }
.way-tag.way-covered { background: #e5e7eb; color: #6b7280; }
.need-ack { font-size: 11px; color: #a40035; background: #fdeef2; border-radius: 10px; padding: 2px 8px; font-weight: 600; }
.rc-body { padding-bottom: 8px; border-bottom: 1px dashed #eee; }
.rc-store { display: flex; align-items: center; gap: 6px; font-size: 15px; font-weight: 600; color: #333; margin-bottom: 8px; }
.rc-store .el-icon { color: #a40035; font-size: 16px; }
.rc-time-row { display: flex; justify-content: space-between; align-items: center; }
.rc-time { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #666; }
.rc-time .el-icon { font-size: 13px; }
.rc-time.strike span { text-decoration: line-through; color: #9ca3af; }
.rc-note { margin: 8px 0 0; font-size: 12px; line-height: 1.6; color: #666; background: #f3f4f6; border-radius: 6px; padding: 6px 10px; }

/* 通知 */
.notice-card { background: #fff; border: 1px solid #eee; border-left: 3px solid #d8d3d5; border-radius: 10px; padding: 13px 14px; margin-bottom: 10px; }
.notice-card.makeup { border-left-color: #247354; }
.notice-card.makeup.unacked { border-left-color: #a40035; }
.notice-card.covered { border-left-color: #e0a300; }
.notice-card.transfer { border-left-color: #6d3f8f; }
.notice-card.transfer.unacked { border-left-color: #a40035; }
.notice-card.transferIn { border-left-color: #247354; }
.nc-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.nc-head strong { font-size: 13.5px; color: #333; }
.nc-date { font-size: 11px; color: #aaa; }
.notice-card p { margin: 8px 0 0; padding: 8px 10px; border-radius: 6px; background: #f9f9f9; font-size: 12px; line-height: 1.65; color: #777; }
.nc-detail { background: transparent !important; padding: 4px 2px 0 !important; font-size: 11px !important; color: #9a9496 !important; }
.nc-act { margin-top: 10px; text-align: right; }
.nc-done { margin-top: 10px; font-size: 12px; color: #247354; font-weight: 600; text-align: right; }

.empty-text { font-size: 13px; color: #999; padding: 30px 0; text-align: center; }

/* 班次后续处理操作行 */
.rc-acts { display: flex; gap: 10px; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #eee; }
.act-line { flex: 1; height: 36px; border: 1px solid #e5e7eb; background: #fff; border-radius: 8px; font-size: 13px; color: #555; cursor: pointer; font: inherit; }
.act-line:active { background: #f7f8fa; }
.wait-tag { font-size: 11px; color: #b8791a; background: #faeeda; border-radius: 10px; padding: 2px 8px; font-weight: 600; }

/* 转移候选 */
.cand-list { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
.cand { display: flex; align-items: center; gap: 10px; border: 1px solid #eee; background: #fafafa; border-radius: 10px; padding: 11px 13px; cursor: pointer; font: inherit; text-align: left; }
.cand strong { font-size: 14px; color: #333; }
.cand span { font-size: 12px; color: #888; }
.cand em { margin-left: auto; font-style: normal; font-size: 12px; color: #a40035; font-weight: 600; }
.cand:active { background: #fdf2f5; }
.swap-person { display: flex; align-items: baseline; gap: 8px; margin: 8px 0 2px; font-size: 13px; font-weight: 600; color: #333; }
.swap-person span { font-size: 11.5px; font-weight: 400; color: #999; }
.swap-cand { background: #fff; }
.swap-cand strong { font-size: 13px; }

/* 申领确认（底部弹层） */
.sheet-mask { position: fixed; inset: 0; z-index: 60; background: rgba(0, 0, 0, .32); display: flex; align-items: flex-end; }
.sheet { width: 100%; background: #fff; border-radius: 16px 16px 0 0; padding: 18px 18px 22px; box-sizing: border-box; }
.sheet-h { font-size: 16px; font-weight: 600; color: #333; text-align: center; margin-bottom: 14px; }
.sheet-shift { font-size: 14px; font-weight: 600; color: #333; }
.sheet-meta { margin-top: 5px; font-size: 12px; color: #888; }
.checks { margin: 14px 0 4px; padding: 11px 12px; border-radius: 10px; background: #fafafa; }
.checks div { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #555; line-height: 1.9; }
.checks i { width: 14px; height: 14px; border-radius: 50%; background: #e9f6ef; color: #247354; font-size: 9px; font-style: normal; display: inline-flex; align-items: center; justify-content: center; }
.sheet-note { margin: 10px 0 16px; font-size: 11.5px; line-height: 1.65; color: #9a9496; }
.sheet-act { display: flex; gap: 10px; }
.sheet-act button { flex: 1; height: 46px; border-radius: 23px; font-size: 14px; border: 1px solid #e5e7eb; background: #fff; color: #666; font: inherit; }
.sheet-act .btn-main { border: 0; background: #a40035; color: #fff; font-weight: 600; }
.sheet-act .btn-main.danger { background: #c24545; }
</style>
