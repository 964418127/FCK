<!--
  移动端 · 排班（v3）
  一套壳，按资格过滤：推拿师 / 客户经理打开看到的是各自能申的时段，不按岗位分入口。
  排班（v3）移动端。两块：我的排班（月历点选日期看当天排班结果）→ 可选班次（月历打点当天可申时段，点日期申领）。
  排班通知已拆独立入口 /v3/m/notice（移动端通知本来就是独立页面，见 ScheduleV3MobileNotice.vue）。
  视觉对齐 MobileParttimeTasks：全屏页、白色页头、#f5f5f5 底、白卡 12px、品牌红 #a40035、状态色板同款。
-->
<template>
  <div class="m-page">
    <header class="page-header">
      <el-icon class="back-icon" @click="goBack"><ArrowLeft /></el-icon>
      <h1>排班</h1>
      <div class="ps-slot"><PersonaSwitch3 /></div>
    </header>

    <div class="content-container">
      <div class="view-tabs">
        <button :class="{ active: tab === 'mine' }" @click="tab = 'mine'">我的排班</button>
        <button :class="{ active: tab === 'pick' }" @click="tab = 'pick'">可选班次</button>
      </div>

      <!-- 可选班次 -->
      <section v-if="tab === 'pick'">
        <div class="release-banner">
          <el-icon><Clock /></el-icon>
          <div>
            <strong>{{ openList.length ? `${openList.length} 个时段可以申` : '暂时没有可申的时段' }}</strong>
            <p>只显示你能申的：同一门店、你的岗位在这一轮、申领期已开。看不到的就是不适用。</p>
          </div>
        </div>

        <!-- 月历：红点 = 当天可申时段 -->
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
          {{ selDate ? `${selDateLabel} · ${selDayList.length} 个任务时段` : '选一个有红点的日期看当天可申的班次' }}
        </div>

        <div v-for="it in selDayList" :key="it.date + it.slot.id" :class="['slot-card', cardTone(it)]">
          <div class="sc-head">
            <span class="sc-date">{{ headDate(it.date) }}</span>
            <span :class="['sc-badge', `tone-${stateOf(it).tone}`]">{{ stateOf(it).text }}</span>
          </div>
          <div class="sc-store"><el-icon><Location /></el-icon><span>{{ containerName3(it.slot.containerId) }}</span></div>
          <div class="sc-time-row">
            <div class="sc-time"><el-icon><Clock /></el-icon><span>{{ it.shift.name }} {{ it.shift.start }} - {{ it.shift.end }}</span></div>
          </div>
          <p class="sc-close">
            <template v-if="it.closeAt">截止 {{ fmtMoment(it.closeAt) }}，截止后在申领人里按业绩排序出结果</template>
            <template v-else>公布即可领，先到先得、当场生效</template>
          </p>
          <div class="sc-foot">
            <span class="sc-quota">
              已申 {{ it.pending }} · <b :class="{ full: it.remaining === 0 }">剩 {{ it.remaining }} / {{ it.slot.capacity }} 个名额</b>
            </span>
            <button v-if="!it.app" class="act-btn primary" :disabled="it.remaining === 0" @click="pick(it)">申领</button>
            <button v-else-if="it.app.status === 'pending'" class="act-btn plain" @click="cancel(it)">取消申领</button>
            <span v-else class="sc-done">✓ 已占用这个时段</span>
          </div>
        </div>

        <div v-if="openList.length && selDate && !selDayList.length" class="empty-text">这一天没有你能申的时段</div>
        <div v-else-if="!openList.length" class="empty-text">现在没有可申的时段</div>
      </section>

      <!-- 我的排班：月历点选 -->
      <section v-else-if="tab === 'mine'">
        <div v-if="pendingApps.length" class="pending-strip">
          <el-icon><Clock /></el-icon>
          <span>有 {{ pendingApps.length }} 条申领还在等截止，截止后按业绩排序出结果，结果会写进日历</span>
        </div>

        <!-- 月历：红点 = 已排定，黄点 = 申领中 -->
        <MonthCalendar
          :year="mineYear"
          :month="mineMonth"
          :selected="selMineDate"
          :marks="mineMarks"
          :today="todayStr"
          :legend="[
            { cls: 'red', label: '已排定' },
            { cls: 'amber', label: '申领中待结果' }
          ]"
          @select="selMineDate = $event"
          @move="moveMine"
        />

        <!-- 当天排班明细 -->
        <div class="day-section">
          <div class="section-title-row">
            <span class="red-bar"></span>
            <span class="section-title">{{ selMineDate ? `${selMineLabel} 的排班` : '排班明细' }}</span>
          </div>

          <div v-if="!selMineDate || !dayResults.length" class="empty-text">这一天没有排班</div>

          <div v-for="r in dayResults" :key="r.date + r.slotId" class="res-card">
            <div class="rc-head">
              <div class="task-date">
                <div class="task-weekday">{{ weekdayLabel(r.date) }}</div>
                <div class="task-day">{{ r.date.slice(5).replace('-', '/') }}</div>
              </div>
              <span :class="['way-tag', `way-${wayTone(r)}`]">{{ wayLabel(r) }}</span>
            </div>
            <div class="rc-body">
              <div class="rc-store"><el-icon><Location /></el-icon><span>{{ containerName3(r.containerId) }}</span></div>
              <div class="rc-time-row">
                <div class="rc-time"><el-icon><Clock /></el-icon><span>{{ r.shiftName }} {{ r.start }} - {{ r.end }}</span></div>
              </div>
            </div>
            <p v-if="r.fallback" class="rc-note">从「{{ slotNameOf(r.fromSlotId) }}」漏下来，兜底排到这一班</p>
          </div>
        </div>
      </section>
    </div>

    <!-- 申领确认：底部弹层 -->
    <div v-if="confirming" class="sheet-mask" @click.self="confirming = false">
      <div class="sheet">
        <div class="sheet-h">申领确认</div>
        <div v-if="cur" class="sheet-body">
          <div class="sheet-shift">{{ shortDate(cur.date) }} · {{ cur.shift.name }}</div>
          <div class="sheet-meta">{{ cur.shift.start }}–{{ cur.shift.end }} · {{ containerName3(cur.slot.containerId) }}</div>
          <div class="checks">
            <div><i>✓</i>与已有排班不冲突</div>
            <div><i>✓</i>单日累计工时未超上限</div>
            <div><i>✓</i>你的岗位在这一轮的申领人群里</div>
          </div>
          <p v-if="cur.closeAt" class="sheet-warn">
            {{ fmtMoment(cur.closeAt) }} 截止。截止后在申领人里按业绩排序，不是先到先得。
          </p>
          <p v-else class="sheet-note">公布即可领，确认后当场生效。</p>
          <div class="sheet-act">
            <button class="btn-ghost" @click="confirming = false">再想想</button>
            <button class="btn-main" @click="doApply">确认申领</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Clock, Location } from '@element-plus/icons-vue'
import { containerName3, findSlot3, fmtDate } from '../mock/scheduleV3.js'
import {
  v3, me3, openForPerson3, resultOfPerson3, appsOfPerson3, apply3, cancelApply3
} from '../mock/scheduleV3Store.js'
import PersonaSwitch3 from '../components/v3/PersonaSwitch3.vue'
import MonthCalendar from '../components/v3/MonthCalendar.vue'

const route = useRoute()
/** 默认落「我的排班」；菜单「选班」入口带 ?tab=pick 直落可选班次 */
const tab = ref(route.query.tab === 'pick' ? 'pick' : 'mine')
const router = useRouter()
const me = computed(() => me3())

/** 返回：一律回移动端菜单（移动端自己的桌面），不回 web 配置台 */
const goBack = () => router.replace({ name: 'mobile-menu' })

const todayStr = fmtDate(v3.now)
const shortDate = d => {
  const dt = new Date(`${d}T00:00:00`)
  return `${dt.getMonth() + 1}月${dt.getDate()}日 周${'日一二三四五六'[dt.getDay()]}`
}
const fmtMoment = d => `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
const weekdayLabel = d => `周${'日一二三四五六'[new Date(`${d}T00:00:00`).getDay()]}`
const headDate = d => `${weekdayLabel(d)} · ${Number(d.slice(5, 7))}月${Number(d.slice(8))}日`
const monthKeyOf = d => d.slice(0, 7)

/** 月切换：切过去后自动选中该月第一个有打点的日期 */
const shiftTo = (state, delta, markedDates, fallback) => {
  let m = state.month.value + delta
  let y = state.year.value
  if (m < 1) { m = 12; y-- } else if (m > 12) { m = 1; y++ }
  state.year.value = y
  state.month.value = m
  const key = `${y}-${String(m).padStart(2, '0')}`
  const next = markedDates.filter(d => monthKeyOf(d) === key).sort()[0] || ''
  state.sel.value = next
}

/* ---------- 可选班次：月历 ---------- */
const openList = computed(() => openForPerson3(me.value.id))
const openDates = computed(() => [...new Set(openList.value.map(it => it.date))])
const pickYear = ref(Number((openDates.value[0] || todayStr).slice(0, 4)))
const pickMonth = ref(Number((openDates.value[0] || todayStr).slice(5, 7)))
const selDate = ref(openDates.value.sort()[0] || '')
const pickMarks = computed(() => {
  const m = {}
  for (const it of openList.value) m[it.date] = { red: (m[it.date]?.red || 0) + 1 }
  return m
})
const selDateLabel = computed(() => shortDate(selDate.value))
const selDayList = computed(() => openList.value.filter(it => it.date === selDate.value))
const movePick = delta => shiftTo({ year: pickYear, month: pickMonth, sel: selDate }, delta, openDates.value)

const stateOf = it => {
  if (!it.app) return { text: '可申领', tone: 'open' }
  if (it.app.status === 'pending') return { text: '待审核', tone: 'wait' }
  return { text: '已得', tone: 'ok' }
}
const cardTone = it => ({ open: '', wait: 'is-wait', ok: 'is-ok' }[stateOf(it).tone])

/* ---------- 我的排班：月历 ---------- */
const pendingApps = computed(() => appsOfPerson3(me.value.id).filter(a => a.status === 'pending'))
const mine = computed(() => resultOfPerson3(me.value.id))
const resultDates = computed(() => [...new Set(mine.value.map(r => r.date))])
const mineMarks = computed(() => {
  const m = {}
  for (const r of mine.value) m[r.date] = { ...m[r.date], red: (m[r.date]?.red || 0) + 1 }
  for (const a of pendingApps.value) m[a.date] = { ...m[a.date], amber: (m[a.date]?.amber || 0) + 1 }
  return m
})
const mineYear = ref(v3.now.getFullYear())
const mineMonth = ref(v3.now.getMonth() + 1)
const selMineDate = ref(
  resultDates.value.sort().find(d => d >= todayStr)
  || resultDates.value[resultDates.value.length - 1]
  || todayStr
)
const selMineLabel = computed(() => shortDate(selMineDate.value))
const dayResults = computed(() => mine.value.filter(r => r.date === selMineDate.value))
const moveMine = delta => shiftTo({ year: mineYear, month: mineMonth, sel: selMineDate }, delta,
  [...resultDates.value, ...pendingApps.value.map(a => a.date)])

/** 员工侧「怎么排上的」人话：不暴露分配机制术语（轮转/直派/兜底留给 PC 配置台） */
const WAY_EMP = {
  轮转排定: '系统排定',
  系统直派: '系统排定',
  先到先得自领: '自主领取',
  审核通过: '申领成功'
}
const wayLabel = r => WAY_EMP[r.way] || (r.way.startsWith('兜底') ? '系统调剂' : r.way)
const wayTone = r => r.way === '审核通过' ? 'review' : r.way.startsWith('兜底') ? 'fallback' : r.way === '先到先得自领' ? 'grab' : 'direct'

const slotNameOf = id => findSlot3(id)?.name || id

/* ---------- 申领 / 取消 ---------- */
const confirming = ref(false)
const cur = ref(null)
const pick = it => { cur.value = it; confirming.value = true }
const doApply = () => {
  apply3(me.value.id, cur.value.slot.id, cur.value.date, cur.value.round.id)
  confirming.value = false
}
const cancel = it => cancelApply3(me.value.id, it.slot.id, it.date)
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

/* 提示条 */
.release-banner { display: flex; gap: 10px; padding: 4px 0 14px; align-items: flex-start; }
.release-banner .el-icon { color: #a40035; font-size: 20px; margin-top: 1px; }
.release-banner strong { font-size: 14px; color: #333; }
.release-banner p { margin: 5px 0 0; font-size: 12px; line-height: 1.6; color: #888; }

.date-count-line { font-size: 12px; color: #777; margin: 0 0 10px; }

/* 可选班次卡 */
.slot-card { background: #fff; border: 1px solid #eee; border-radius: 12px; padding: 13px 14px; margin-bottom: 10px; }
.slot-card.is-wait { background: #fffdf5; border-color: #f2e3bd; }
.slot-card.is-ok { background: #f5fbf7; border-color: #93cbb0; }
.sc-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; }
.sc-date { font-size: 13px; font-weight: 600; color: #333; }
.sc-badge { flex: none; font-size: 12px; padding: 3px 10px; border-radius: 12px; font-weight: 600; }
.sc-badge.tone-open { background: #a40035; color: #fff; }
.sc-badge.tone-wait { background: #fef3c7; color: #b45309; }
.sc-badge.tone-ok { background: #d1fae5; color: #047857; }
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
.sc-done { font-size: 12px; color: #247354; font-weight: 600; }
.act-btn { border: 0; border-radius: 8px; padding: 8px 20px; font-size: 13px; font-weight: 600; cursor: pointer; font: inherit; }
.act-btn.primary { background: #a40035; color: #fff; }
.act-btn.primary:disabled { background: #d8d3d5; color: #fff; cursor: default; }
.act-btn.plain { background: #fff; border: 1px solid #e5e7eb; color: #666; }

/* 待申领提示条（对齐 incoming-card） */
.pending-strip { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 12px; padding: 10px 12px; background: #fff; border: 1px solid #f3c7d5; border-left: 3px solid #a40035; border-radius: 10px; color: #8a5a2b; font-size: 12px; line-height: 1.6; }
.pending-strip .el-icon { color: #a40035; font-size: 15px; margin-top: 2px; }

/* 当天排班明细 */
.day-section { background: #fff; border-radius: 12px; padding: 14px 14px 4px; }
.section-title-row { display: flex; align-items: center; gap: 6px; margin-bottom: 12px; }
.red-bar { display: inline-block; width: 4px; height: 14px; background: #a40035; border-radius: 2px; }
.section-title { font-size: 15px; font-weight: 600; color: #333; }
.res-card { border: 1px solid #eee; border-radius: 10px; padding: 12px; margin-bottom: 10px; background: #fff; }
.rc-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.task-weekday { font-size: 12px; color: #666; }
.task-day { font-size: 14px; font-weight: 600; color: #333; }
.way-tag { flex: none; font-size: 12px; padding: 3px 10px; border-radius: 12px; font-weight: 600; }
.way-tag.way-review { background: #a40035; color: #fff; }
.way-tag.way-grab { background: #d1fae5; color: #047857; }
.way-tag.way-fallback { background: #fef3c7; color: #b45309; }
.way-tag.way-direct { background: #e5e7eb; color: #4b5563; }
.rc-body { padding-bottom: 8px; border-bottom: 1px dashed #eee; }
.rc-store { display: flex; align-items: center; gap: 6px; font-size: 15px; font-weight: 600; color: #333; margin-bottom: 8px; }
.rc-store .el-icon { color: #a40035; font-size: 16px; }
.rc-time-row { display: flex; justify-content: space-between; align-items: center; }
.rc-time { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #666; }
.rc-time .el-icon { font-size: 13px; }
.rc-note { margin: 8px 0 0; font-size: 12px; line-height: 1.6; color: #666; background: #f3f4f6; border-radius: 6px; padding: 6px 10px; }

/* 通知（对齐 incoming-card 风格） */
.notice-card { background: #fff; border: 1px solid #eee; border-left: 3px solid #d8d3d5; border-radius: 10px; padding: 13px 14px; margin-bottom: 10px; }
.notice-card.lost { border-left-color: #a40035; }
.notice-card.fallback { border-left-color: #e0a300; }
.notice-card.assigned { border-left-color: #247354; }
.notice-card.pending { border-left-color: #e0a300; }
.nc-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.nc-head strong { font-size: 13.5px; color: #333; }
.nc-date { font-size: 11px; color: #aaa; }
.notice-card p { margin: 8px 0 0; padding: 8px 10px; border-radius: 6px; background: #f9f9f9; font-size: 12px; line-height: 1.65; color: #777; }

.empty-text { font-size: 13px; color: #999; padding: 30px 0; text-align: center; }

/* 申领确认（底部弹层） */
.sheet-mask { position: fixed; inset: 0; z-index: 60; background: rgba(0, 0, 0, .32); display: flex; align-items: flex-end; }
.sheet { width: 100%; background: #fff; border-radius: 16px 16px 0 0; padding: 18px 18px 22px; box-sizing: border-box; }
.sheet-h { font-size: 16px; font-weight: 600; color: #333; text-align: center; margin-bottom: 14px; }
.sheet-shift { font-size: 14px; font-weight: 600; color: #333; }
.sheet-meta { margin-top: 5px; font-size: 12px; color: #888; }
.checks { margin: 14px 0 4px; padding: 11px 12px; border-radius: 10px; background: #fafafa; }
.checks div { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #555; line-height: 1.9; }
.checks i { width: 14px; height: 14px; border-radius: 50%; background: #e9f6ef; color: #247354; font-size: 9px; font-style: normal; display: inline-flex; align-items: center; justify-content: center; }
.sheet-warn { margin: 10px 0 16px; padding: 8px 10px; border-radius: 6px; background: #fff8ec; font-size: 12px; line-height: 1.65; color: #8a5a2b; }
.sheet-note { margin: 10px 0 16px; font-size: 11.5px; line-height: 1.65; color: #9a9496; }
.sheet-act { display: flex; gap: 10px; }
.sheet-act button { flex: 1; height: 46px; border-radius: 23px; font-size: 14px; border: 1px solid #e5e7eb; background: #fff; color: #666; font: inherit; }
.sheet-act .btn-main { border: 0; background: #a40035; color: #fff; font-weight: 600; }
</style>
