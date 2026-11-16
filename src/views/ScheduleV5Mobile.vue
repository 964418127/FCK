<!--
  移动端 · 排班（v5）
  员工侧两段：我的排班（月历选中日看当天时间线 + 这条班怎么来的 + 请假 / 换班 / 补位确认）· 可获取（按天看窗口内名额，能拿的直接拿，拿不了的当场说原因）。
  通知不在这页：通知是通用模块（/mobile-notification），这里只在班次上标「待你确认」，处理动作落在这一天的班上。
  原则：不摆数据摆事情——每个数字后面跟一句人话；不暴露分配机制术语；拿不了的原因是先说后做，不是点了才报错。
  视觉沿用移动端规范：全屏页、白 sticky 页头、#f5f5f5 底、白卡 12px、品牌红 #a40035、确认用自写底部弹层。
-->
<template>
  <div class="m-page">
    <header class="page-header">
      <el-icon class="back-icon" @click="goBack"><ArrowLeft /></el-icon>
      <h1>排班</h1>
      <div class="ps-slot">
        <PersonaSwitch5 @pick="meId = $event" />
      </div>
    </header>

    <div class="content-container">
      <div class="view-tabs">
        <button :class="{ active: tab === 'mine' }" @click="tab = 'mine'">我的排班</button>
        <button :class="{ active: tab === 'pick' }" @click="tab = 'pick'">可获取<span v-if="okCount" class="dot-badge">{{ okCount }}</span></button>
      </div>

      <!-- 时间锚点：现在几点、这一轮铺到哪 -->
      <div class="now-line">演示时刻 {{ v5.now }} · 本轮覆盖 {{ shortM(myRound.span[0]) }}–{{ shortM(myRound.span[1]) }} · 申领 {{ shortAt(myRound.applyDeadline) }} 截止</div>

      <!-- ============ 我的排班 ============ -->
      <section v-if="tab === 'mine'">
        <div class="overview-card">
          <div class="ov-item">
            <span class="ov-label">本轮班次</span>
            <b class="ov-value">{{ weekStats.count }}<i>个</i></b>
          </div>
          <div class="ov-item">
            <span class="ov-label">合计工时</span>
            <b class="ov-value">{{ weekStats.hours }}<i>小时</i></b>
          </div>
          <div class="ov-item">
            <span class="ov-label">待你确认</span>
            <b :class="['ov-value', { warn: weekStats.pending > 0 }]">{{ weekStats.pending }}<i>条</i></b>
          </div>
        </div>

        <!-- 有人要跟你换班：这条请求落在某一天，处理也在这一天，不另开一页 -->
        <div v-if="pendingSwaps.length" class="swap-req">
          <div class="section-title-row">
            <span class="red-bar"></span>
            <span class="section-title">有人想跟你换班</span>
            <span class="title-count">{{ pendingSwaps.length }} 条</span>
          </div>
          <div v-for="req in pendingSwaps" :key="req.id" class="notice-card unacked">
            <div class="nc-head">
              <strong>换班请求</strong>
              <span class="nc-date">{{ dayShort(swapText(req).date) }}</span>
            </div>
            <p>{{ swapText(req).text }}</p>
            <p class="nc-detail">双方同意才生效；等待期超时两边都不动</p>
            <div class="nc-act">
              <button class="act-btn ghost" @click="answer(req, false)">拒绝</button>
              <button class="act-btn primary" @click="answer(req, true)">同意换班</button>
            </div>
          </div>
        </div>

        <MonthCalendar
          :year="mineYear"
          :month="mineMonth"
          :selected="mineSel"
          :marks="mineMarks"
          :today="v5.today"
          :legend="[
            { cls: 'red', label: '有班' },
            { cls: 'amber', label: '有时间被占用' }
          ]"
          @select="mineSel = $event"
          @move="moveMine"
        />

        <div class="section-title-row">
          <span class="red-bar"></span>
          <span class="section-title">{{ mineSel ? dayLabel(mineSel) : '排班明细' }}</span>
          <span class="title-count">{{ dayRows.length ? `${dayRows.length} 个班` : '' }}</span>
        </div>

        <div v-if="!dayRows.length" class="empty-box">
          <p class="empty-main">这一天没有你的班</p>
          <p class="empty-sub">有班的日子在月历上是红点，点一下看那天的安排</p>
        </div>

        <div v-for="r in dayRows" :key="r.id" :class="['res-card', { covered: r.status === 'covered' || !!outTo(r) }]">
          <div class="rc-head">
            <div class="rc-tags">
              <span v-if="outTo(r)" class="way-tag gray">已换给 {{ outTo(r) }}</span>
              <span v-else-if="inFrom(r)" class="way-tag">换班来的 · {{ inFrom(r) }} 的班</span>
              <span v-else :class="['way-tag', { gray: r.status === 'covered' }]">{{ r.status === 'covered' ? '时间被占用' : wayLabel(r) }}</span>
              <span v-if="r.status === 'active' && !outTo(r) && pendingNoticeOf(r)" class="state-tag warn">待你确认</span>
              <span v-else-if="swapPendingOf(r)" class="state-tag">换班等对方</span>
            </div>
            <span :class="['rc-hours', { strike: r.status === 'covered' || !!outTo(r) }]">{{ durText(r) }}</span>
          </div>

          <div class="rc-main">
            <div :class="['rc-time', { strike: r.status === 'covered' || !!outTo(r) }]">{{ slotOf(r.slotId).start }}<span>–</span>{{ slotOf(r.slotId).end }}</div>
            <div class="rc-where">
              <el-icon><Location /></el-icon>
              <span>{{ spaceName(slotOf(r.slotId).spaceId) }} · {{ slotOf(r.slotId).name }}</span>
            </div>
          </div>

          <p class="rc-note">{{ noteOf(r) }}</p>
          <p v-if="r.status === 'active' && !outTo(r) && overtimeOf(r)" class="rc-overtime">{{ overtimeOf(r) }}</p>

          <div v-if="r.status === 'active' && !outTo(r) && pendingNoticeOf(r)" class="rc-acts pending">
            <span class="rc-pending">人事安排你顶上这个班，确认一下</span>
            <button class="act-line" @click="declineMakeup(r)">我去不了</button>
            <button class="act-line strong" @click="ackMakeup(r)">收到，我来</button>
          </div>
          <div v-else-if="r.status === 'active' && !outTo(r) && canAct(r)" class="rc-acts">
            <button class="act-line" @click="openLeave(r)">这天我来不了</button>
            <button class="act-line" @click="openSwap(r)">找人换班</button>
          </div>
        </div>
      </section>

      <!-- ============ 可获取 ============ -->
      <section v-else-if="tab === 'pick'">
        <!-- 签了多家门店的人：先选门店，下面的横幅 / 规则 / 额度都是这家店的 -->
        <div v-if="myStores.length > 1" class="store-switch">
          <button v-for="id in myStores" :key="id" :class="{ on: pickStore === id }" @click="switchStore(id)">{{ spaceName(id) }}</button>
        </div>

        <div class="pick-banner">
          <div class="pb-top">
            <el-icon><Clock /></el-icon>
            <strong>{{ okCount ? `本轮还有 ${okCount} 个名额你能拿` : (board.length ? '现在没有你能拿的名额' : '这里的班排完直接分给你，没有要你领的名额') }}</strong>
          </div>
          <p v-if="board.length">申领 {{ shortAt(roundDeadline) }} 截止</p>
          <p v-else>这一轮的班都是系统按规则排的，结果在「我的排班」里看。</p>
        </div>

        <!-- 这家店对我的要求：额度常驻，规则按类给进度；没配规则 / 额度的店不出现 -->
        <div v-if="claimBoard && (claimBoard.hasRule || claimBoard.limits.length)" class="claim-meter">
          <div v-for="i in meterBoard.items" :key="i.id" :class="['cm-line', { bad: !i.ok }]">
            <span class="cm-dot" />{{ i.name }}：{{ i.actual }}（要求 {{ i.need }}）{{ i.ok ? '' : '，还差' }}
          </div>
          <div v-for="l in meterBoard.limits" :key="l.name" :class="['cm-line', { bad: !l.ok }]">
            <span class="cm-dot" />{{ l.name }}：已用 {{ l.used }} / {{ l.cap }} 小时{{ l.ok ? `，还剩 ${Math.round((l.cap - l.used) * 10) / 10}h` : '，已满' }}
          </div>
        </div>

        <div class="date-strip">
          <button
            v-for="d in weekDays"
            :key="d.date"
            :class="['ds-cell', { active: pickSel === d.date, past: d.past }]"
            :disabled="d.past || !d.total"
            @click="pickSel = d.date"
          >
            <span class="ds-wd">{{ d.wd }}</span>
            <b class="ds-day">{{ d.day }}</b>
            <span :class="['ds-n', { zero: !d.ok }]">{{ d.ok ? `${d.ok}个` : (d.past ? '已过' : (d.total ? '拿不了' : '—')) }}</span>
          </button>
        </div>

        <div v-if="!dayOffers.length" class="empty-box">
          <p class="empty-main">这天没有可拿的名额</p>
          <p class="empty-sub">{{ board.length ? '名额放出来会出现在这里，也会推一条通知给你' : '班次排好后直接进「我的排班」' }}</p>
        </div>

        <div v-for="g in dayGroups" :key="g.id || 'none'" class="offer-group">
          <!-- 有类别时按类分组：类头上直接给这条规则今天的进度（或语义——同类的哪一条都算） -->
          <div v-if="spaceCats.length" class="og-head">
            <span class="og-name">{{ g.name }}</span>
            <span v-if="g.item" :class="['og-req', { bad: !g.item.ok }]">{{ g.item.actual }} · 要求 {{ g.item.need }}</span>
          </div>
          <div v-for="o in g.offers" :key="o.slotId + o.date" :class="['offer-card', { dim: !o.gate.ok }]">
          <div class="oc-head">
            <span class="oc-where">{{ spaceName(o.slot.spaceId) }} · {{ o.slot.name }}</span>
            <span :class="['oc-way', o.row.way === 'grab' ? 'grab' : 'apply']">{{ o.row.way === 'grab' ? '先到先得' : '申领' }}</span>
          </div>

          <div class="oc-time">{{ o.slot.start }}<span>–</span>{{ o.slot.end }}<em>{{ hoursText(o.slot) }}</em></div>

          <div class="oc-meta">
            <span><el-icon><User /></el-icon>{{ whoText(o.row.who) }}</span>
            <span>{{ o.row.way === 'grab' ? `开班（${o.slot.start}）前都能拿` : `${shortAt(roundDeadline)} 截止 · 按综合分排序` }}</span>
          </div>

          <div class="oc-quota">
            <span>已占 <b>{{ occ(o.slotId, o.date) }}</b> / {{ o.slot.snapN }} 个名额</span>
            <span class="oc-bar"><i :style="{ width: barWidth(o) }"></i></span>
          </div>

          <div class="oc-foot">
            <template v-if="o.gate.ok">
              <!-- 有「类型 + 数量」要求的班次：这一天这组勾好再一起交；普通班次照旧点了就成 -->
              <button
                v-if="needBasket(o)"
                :class="['act-btn', isSel(o) ? 'picked' : 'ghost']"
                @click="toggleSel(o)"
              >{{ isSel(o) ? '已选上' : '选这条' }}</button>
              <button v-else class="act-btn primary" @click="o.row.way === 'grab' ? openGrab(o) : openApply(o)">
                {{ o.row.way === 'grab' ? '抢' : '申领' }}
              </button>
            </template>
            <template v-else>
              <span class="oc-hint bad">{{ o.gate.reason }}</span>
              <button class="act-btn disabled" disabled>拿不了</button>
            </template>
          </div>
          </div>
        </div>

        <!-- 集合提交：有类型 + 数量要求的班次才勾着一起交；一条没选就交不了 -->
        <div v-if="basketVisible" class="basket-bar">
          <div class="bb-info">
            <b>{{ selItems.length ? `已选 ${selItems.length} 条 · 合计 ${selHours} 小时` : '这一天还没选班次' }}</b>
            <span :class="{ bad: selItems.length && !setPreview?.ok }">{{ basketHint }}</span>
          </div>
          <button class="bb-submit" :disabled="!canSubmit" @click="doSubmitSet">
            {{ selItems.length ? `提交（${selItems.length} 条）` : '提交' }}
          </button>
        </div>
      </section>
    </div>

    <!-- 抢：确认 -->
    <div v-if="sheet?.type === 'grab'" class="sheet-mask" @click.self="sheet = null">
      <div class="sheet">
        <div class="sheet-title">抢 {{ sheet.o.slot.name }}</div>
        <div class="sheet-body">
          <div class="sheet-shift">{{ dayLabel(sheet.o.date) }} · {{ sheet.o.slot.start }}–{{ sheet.o.slot.end }}</div>
          <div class="sheet-meta">{{ spaceName(sheet.o.slot.spaceId) }} · {{ hoursText(sheet.o.slot) }}</div>
          <div class="checks">
            <div><i>✓</i>和你已有的班次不撞（首尾相接可以）</div>
            <div><i>✓</i>名额在你的档位里，现在还剩 {{ sheet.o.slot.snapN - occ(sheet.o.slotId, sheet.o.date) }} 个</div>
            <div><i>✓</i>开班（{{ sheet.o.slot.start }}）前都能拿</div>
          </div>
          <p class="sheet-note">先到先得，点确认当场生效，直接进你的排班。</p>
        </div>
        <div class="sheet-acts">
          <button class="act-btn ghost" @click="sheet = null">再想想</button>
          <button class="act-btn primary" @click="doGrab">确认抢</button>
        </div>
      </div>
    </div>

    <!-- 申领：确认 -->
    <div v-if="sheet?.type === 'apply'" class="sheet-mask" @click.self="sheet = null">
      <div class="sheet">
        <div class="sheet-title">申领 {{ sheet.o.slot.name }}</div>
        <div class="sheet-body">
          <div class="sheet-shift">{{ dayLabel(sheet.o.date) }} · {{ sheet.o.slot.start }}–{{ sheet.o.slot.end }}</div>
          <div class="sheet-meta">{{ spaceName(sheet.o.slot.spaceId) }} · 名额 {{ sheet.o.slot.snapN }} 个</div>
          <div class="checks">
            <div><i>•</i>提交只是登记，不占名额</div>
            <div><i>•</i>{{ shortAt(roundDeadline) }} 截止后按综合分排序定人</div>
            <div><i>•</i>现在有 {{ sheet.rank.total }} 人登记，你综合分 {{ sheet.rank.score }}</div>
          </div>
          <p class="sheet-note">排不上不会作废你的机会，下一轮还能继续申领。</p>
        </div>
        <div class="sheet-acts">
          <button class="act-btn ghost" @click="sheet = null">再想想</button>
          <button class="act-btn primary" @click="doApply">提交申领</button>
        </div>
      </div>
    </div>

    <!-- 请假：确认 -->
    <div v-if="sheet?.type === 'leave'" class="sheet-mask" @click.self="sheet = null">
      <div class="sheet">
        <div class="sheet-title">这天我来不了</div>
        <div class="sheet-body">
          <div class="sheet-shift">{{ dayLabel(sheet.row.date) }} · {{ slotOf(sheet.row.slotId).name }} {{ slotOf(sheet.row.slotId).start }}–{{ slotOf(sheet.row.slotId).end }}</div>
          <div class="sheet-meta">{{ spaceName(slotOf(sheet.row.slotId).spaceId) }} · 你在 {{ shortAt(v5.now) }} 提交，影响的是这一班</div>
          <div class="checks">
            <div><i>•</i>提交一条请假事实，这段班的时间被占用</div>
            <div><i>•</i>系统按顺位找有空、没冲突的人顶上</div>
            <div><i>•</i>顶上班的人会推通知告诉你</div>
            <div><i>•</i>请假记录留在你的时间线里，不会消失；请假撤了班就回来</div>
          </div>
          <p class="sheet-note">名额本身不能退，退的只是这一次的班次占用；之后有需要可以再抢。</p>
        </div>
        <div class="sheet-acts">
          <button class="act-btn ghost" @click="sheet = null">再想想</button>
          <button class="act-btn primary" @click="doLeave">提交</button>
        </div>
      </div>
    </div>

    <!-- 换班：选对方的班 -->
    <div v-if="sheet?.type === 'swap'" class="sheet-mask" @click.self="sheet = null">
      <div class="sheet">
        <div class="sheet-title">找人换班</div>
        <div class="sheet-body">
          <div class="sheet-shift">你给出：{{ dayLabel(sheet.row.date) }} {{ slotOf(sheet.row.slotId).name }} {{ slotOf(sheet.row.slotId).start }}–{{ slotOf(sheet.row.slotId).end }}</div>
          <p class="sheet-note">换班是双向的：你给出这一条，对方给出一条。对方同意才真正对调，拒绝或超时两边都不动。</p>
          <div v-if="!swapCands.length" class="empty-box small">
            <p class="empty-main">没有能换的班</p>
            <p class="empty-sub">时间会撞的、对方那天没班的都不列出来</p>
          </div>
          <template v-for="g in swapGroups" :key="g.personId">
            <div class="cand-who-row">{{ g.person }}<span>{{ g.pos }} · {{ g.kind }}</span></div>
            <button v-for="c in g.items" :key="c.id" class="cand" @click="doSwap(c.id)">
              <span class="cand-time">{{ dayShort(c.date) }} {{ c.slotName }} {{ c.start }}–{{ c.end }}</span>
              <em>换这条</em>
            </button>
          </template>
        </div>
        <div class="sheet-acts">
          <button class="act-btn ghost" @click="sheet = null">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Clock, Location, User } from '@element-plus/icons-vue'
import MonthCalendar from '../components/v3/MonthCalendar.vue'
import PersonaSwitch5 from '../components/v5/PersonaSwitch5.vue'
import {
  v5, me as meRef, setMe, grabV5, applyV5, submitLeave, proposeSwap, answerSwap, ackNotice, myClaimBoard,
  myPlacements, myOfferBoard, myNotices, swapPendingFor, applyRankOf, previewClaimSet, submitClaimSet
} from '../mock/scheduleV5Store.js'
import { slotById, personById, spaceById, activeCount5, hours5, personBusy5, whoLabel5, WEEK_DATES, roundOf, datesOfRound5, categoriesOf5, catName5, dutyPersonId5 } from '../mock/scheduleV5.js'

const router = useRouter()
const route = useRoute()
/* 演示辅具：?as=<员工id> 直接落到那个人视角（与 MobileParttimeTasks ?as 同性质） */
watch(() => route.query.as, id => { if (id && v5.people.some(p => p.id === id)) setMe(id) }, { immediate: true })
const tab = ref(['mine', 'pick'].includes(route.query.tab) ? route.query.tab : 'mine')
const sheet = ref(null)

const meId = computed({
  get: () => meRef.value.id,
  set: v => {
    setMe(v)
    mineSel.value = pickDefaultMine()
    mineState.value = { year: Number(mineSel.value.slice(0, 4)), month: Number(mineSel.value.slice(5, 7)) }
    pickSel.value = pickDefaultPick()
  }
})
const me = computed(() => meRef.value)
/* 签约门店集合：多店的人选班时可切换，默认主店 */
const myStores = computed(() => (me.value.spaceIds?.length ? me.value.spaceIds : [me.value.spaceId]))
const pickStore = ref('')
watch(myStores, ids => { if (!ids.includes(pickStore.value)) pickStore.value = ids[0] }, { immediate: true })
const myRound = computed(() => roundOf(v5, pickStore.value || me.value.spaceId))
const roundDeadline = computed(() => myRound.value.applyDeadline)

/* ---------- 我的排班 ---------- */
const myRows = computed(() => myPlacements())
const marksDates = computed(() => [...new Set(myRows.value.map(r => r.date))].sort())
const mineSel = ref(pickDefaultMine())
const mineState = ref({ year: Number((mineSel.value || v5.today).slice(0, 4)), month: Number((mineSel.value || v5.today).slice(5, 7)) })
const mineYear = computed(() => mineState.value.year)
const mineMonth = computed(() => mineState.value.month)

function pickDefaultMine() {
  const rows = myPlacements()
  if (rows.some(r => r.date === v5.today)) return v5.today
  return rows[0]?.date || v5.today
}
const mineMarks = computed(() => {
  const m = {}
  myRows.value.forEach(r => {
    m[r.date] = m[r.date] || {}
    if (r.status === 'covered' || outTo(r)) m[r.date].amber = (m[r.date].amber || 0) + 1
    else m[r.date].red = (m[r.date].red || 0) + 1
  })
  return m
})
/* 换班是事件占住时段：原计划不改人，履约人可能已经不是我 */
const outTo = r => (r.personId === meId.value && r.swap ? personById(v5, r.swap.personId)?.name || '对方' : '')
const inFrom = r => (r.personId !== meId.value && r.swap ? personById(v5, r.personId)?.name || '同事' : '')
const dayRows = computed(() => myRows.value.filter(r => r.date === mineSel.value))
const weekStats = computed(() => {
  const active = myRows.value.filter(r => r.status === 'active' && !outTo(r))
  const hours = active.reduce((s, r) => s + hours5(slotOf(r.slotId).start, slotOf(r.slotId).end), 0)
  const pending = active.filter(r => pendingNoticeOf(r)).length
  return { count: active.length, hours: Math.round(hours * 10) / 10, pending }
})
function moveMine(delta) {
  let { year, month } = mineState.value
  month += delta
  if (month < 1) { month = 12; year-- } else if (month > 12) { month = 1; year++ }
  mineState.value = { year, month }
  const key = `${year}-${String(month).padStart(2, '0')}`
  mineSel.value = marksDates.value.filter(d => d.startsWith(key))[0] || `${key}-01`
}

/* ---------- 可获取 ---------- */
const board = computed(() => myOfferBoard().filter(o => o.slot.spaceId === pickStore.value))
const okCount = computed(() => board.value.filter(o => o.gate.ok).length)
/* 可获取的日期条 = 这一轮铺了几天就几天：门店七天、办公区整月 */
const roundDates = computed(() => datesOfRound5(myRound.value))
const weekDays = computed(() => roundDates.value.map(date => {
  const items = board.value.filter(o => o.date === date)
  return {
    date,
    wd: '周' + '日一二三四五六'[new Date(`${date}T00:00:00`).getDay()],
    day: Number(date.slice(8)),
    ok: items.filter(o => o.gate.ok).length,
    total: items.length,
    past: date < v5.today
  }
}))
const pickSel = ref(pickDefaultPick())
function switchStore(id) {
  pickStore.value = id
  pickSel.value = pickDefaultPick()
}
function pickDefaultPick() {
  const okDates = board.value.filter(o => o.gate.ok).map(o => o.date).sort()
  return okDates[0] || roundDates.value.find(d => d >= v5.today) || roundDates.value[0] || WEEK_DATES[0]
}
/* 演示辅具：?date=YYYY-MM-DD 直接定位到那一天（看不同日期的规则状态） */
watch(() => route.query.date, d => { if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) pickSel.value = d }, { immediate: true })
/* 演示辅具：?date=YYYY-MM-DD 直接定位到那一天（看不同日期的规则状态） */
watch(() => route.query.date, d => { if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) pickSel.value = d }, { immediate: true })
const dayOffers = computed(() => board.value.filter(o => o.date === pickSel.value))
const curSpaceObj = computed(() => spaceById(v5, pickStore.value))
const spaceCats = computed(() => categoriesOf5(curSpaceObj.value))
/* 类头上的进度：这条类有没有条数规则、今天占到几条（勾选时跟着动） */
function catRuleItem(catId) {
  return meterBoard.value.items.find(i => i.unit === 'count' && i.scope?.type === 'category' && i.scope.id === catId) || null
}
const dayGroups = computed(() => {
  if (!spaceCats.value.length) return [{ id: '', name: '', offers: dayOffers.value, item: null }]
  const byCat = new Map()
  dayOffers.value.forEach(o => {
    const k = o.slot.category || ''
    if (!byCat.has(k)) byCat.set(k, [])
    byCat.get(k).push(o)
  })
  const out = []
  spaceCats.value.forEach(c => {
    if (byCat.has(c.id)) out.push({ id: c.id, name: c.name, offers: byCat.get(c.id), item: catRuleItem(c.id) })
  })
  if (byCat.has('')) out.push({ id: '', name: '其他', offers: byCat.get(''), item: null })
  return out
})
/* 这家店对我的要求：按这一轮快照口径（配了才有内容） */
const claimBoard = computed(() => {
  try { return myClaimBoard(pickStore.value || me.value.spaceId, me.value.id, pickSel.value || v5.today) } catch { return null }
})

/* ---------- 集合提交 ----------
   只有「按类型 + 数量」要求的班次才这么走：这一天这类班勾好一起交。
   其他班次（没这类要求的人、没被规则圈到的班）照旧按自己的方式——抢点了就成、申领单条登记。 */
const countRules = computed(() => (claimBoard.value?.rules || []).filter(r => r.unit === 'count' && r.scope?.type === 'category'))
const needBasket = o => countRules.value.some(r => r.scope.id === o.slot.category)
/* 当天还有这类可拿的班次，才出提交条 */
const basketVisible = computed(() => dayOffers.value.some(o => o.gate.ok && needBasket(o)))
const sel = ref([])
const selKey = o => `${o.slotId}|${o.date}`
const isSel = o => sel.value.includes(selKey(o))
function toggleSel(o) {
  const k = selKey(o)
  sel.value = sel.value.includes(k) ? sel.value.filter(x => x !== k) : [...sel.value, k]
}
watch([pickSel, pickStore, () => meId.value], () => { sel.value = [] })
const selItems = computed(() => dayOffers.value.filter(o => isSel(o)))
const selHours = computed(() => Math.round(selItems.value.reduce((s, o) => s + hours5(o.slot.start, o.slot.end), 0) * 10) / 10)
const setPreview = computed(() => {
  try {
    return previewClaimSet(pickStore.value || me.value.spaceId, me.value.id, pickSel.value || v5.today, selItems.value.map(o => o.slotId))
  } catch { return null }
})
/* 进度条在勾选时就要跟着动：看的是「勾上以后这天到手的样子」 */
const meterBoard = computed(() => {
  const src = setPreview.value || claimBoard.value
  return { items: src?.items || [], limits: src?.limits || [] }
})
const basketHint = computed(() => {
  if (!selItems.value.length) return '先选班次才能提交'
  const p = setPreview.value
  if (!p) return ''
  if (!p.ok) return p.reasons.join('；')
  const allOk = p.items.every(i => i.ok) && p.limits.every(l => l.ok)
  return allOk ? '要求已满足，可以提交' : '可以提交'
})
const canSubmit = computed(() => selItems.value.length > 0 && !!setPreview.value?.ok)
function doSubmitSet() {
  if (!selItems.value.length) { ElMessage.warning('先选班次再提交'); return }
  const r = submitClaimSet(
    pickStore.value || me.value.spaceId, me.value.id, pickSel.value || v5.today,
    selItems.value.map(o => ({ slotId: o.slotId, way: o.row.way }))
  )
  if (!r.ok) { ElMessage.warning(r.reason || r.failed?.[0]?.reason || '没提交成功'); return }
  const grabbed = selItems.value.filter(o => o.row.way === 'grab').length
  const applied = r.done.length - grabbed
  ElMessage.success([grabbed ? `${grabbed} 条已进你的排班` : '', applied ? `${applied} 条已登记` : ''].filter(Boolean).join(' · ') || '已提交')
  sel.value = []
}

/* 日期条按这一天一天的铺：选中那天自动滑到视野中间，别让人自己找 */
watch(pickSel, async () => {
  await nextTick()
  const el = document.querySelector('.date-strip .ds-cell.active')
  if (el) el.scrollIntoView({ inline: 'center', block: 'nearest' })
}, { immediate: true })

/* ---------- 待处理（通知走通用通知页，动作落在这页） ---------- */
const pendingSwaps = computed(() => swapPendingFor())

/* ---------- 小工具 ---------- */
function slotOf(id) { return slotById(v5, id) || { name: '', start: '00:00', end: '00:00', spaceId: '' } }
function spaceName(id) { return spaceById(v5, id)?.name || '' }
function occ(slotId, date) { return activeCount5(v5, slotId, date) }
function dayLabel(d) {
  const w = '日一二三四五六'[new Date(`${d}T00:00:00`).getDay()]
  return `${Number(d.slice(5, 7))}月${Number(d.slice(8))}日 周${w}`
}
function dayShort(d) {
  const w = '日一二三四五六'[new Date(`${d}T00:00:00`).getDay()]
  return `${Number(d.slice(5, 7))}/${Number(d.slice(8))} 周${w}`
}
function shortAt(at) {
  return `${Number(at.slice(5, 7))}/${Number(at.slice(8, 10))} ${at.slice(11, 16)}`
}
function shortM(d) {
  return `${Number(d.slice(5, 7))}/${Number(d.slice(8))}`
}
function hoursText(slot) {
  return `${hours5(slot.start, slot.end)} 小时`
}
function durText(r) {
  return hoursText(slotOf(r.slotId))
}
function whoText(who) {
  const label = typeof who === 'string' ? who : whoLabel5(who)
  if (!label) return ''
  if (label === '本店全员') return '面向本店所有人'
  if (label.startsWith('本店')) return `面向本店${label.slice(2).replace(' · ', '')}`
  if (label.startsWith('附近')) {
    const [scope, rest] = label.split(' · ')
    return rest ? `面向${scope} ${rest}` : `面向${scope}所有人`
  }
  return label
}
function barWidth(o) {
  const n = o.slot.snapN || 1
  return `${Math.min(100, Math.round(occ(o.slotId, o.date) / n * 100))}%`
}

/* 员工侧人话：不暴露档位机制 */
function wayLabel(r) {
  const w = r.way || ''
  if (r.fromFact) return '系统补位'
  if (w.startsWith('直派')) return '系统排定'
  if (w.startsWith('抢')) return '自己抢的'
  if (w.startsWith('申领')) return '申领排上'
  if (w.startsWith('顶班')) return '系统补位'
  if (w.startsWith('换班')) return '同事换班'
  return '已排定'
}
function noteOf(r) {
  if (outTo(r)) return `这段已经交给 ${outTo(r)}，你不用去；原来怎么排的还留在记录里`
  if (inFrom(r)) return `${inFrom(r)} 的这段换给你，你要去上；他那条记录不动`
  if (r.status === 'covered') {
    const h = r.history?.[r.history.length - 1]?.note
    return h ? `这段时间被占用：${h}（班次记录没动，占用撤了班就回来）` : '这段时间被占用'
  }
  if (r.history?.length) return r.history[r.history.length - 1].note
  if (r.fromFact) return '有人请假，系统按顺位找到你顶上；这条不是你自己抢的'
  const w = r.way || ''
  if (w.startsWith('直派')) return '系统按规则直接排给你的，不用抢'
  if (w.startsWith('抢')) return '你在可获取里自己抢的'
  if (w.startsWith('申领')) return '你申领后，截止时按综合分排上的'
  return '已排定'
}
function overtimeOf(r) {
  if (me.value?.kind !== 'fulltime') return ''
  const total = myRows.value.filter(x => x.date === r.date && x.status === 'active' && !outTo(x))
    .reduce((s, x) => s + hours5(slotOf(x.slotId).start, slotOf(x.slotId).end), 0)
  return total > 8 ? `当天合计 ${Math.round(total * 10) / 10} 小时，超出标准时间的部分计加班` : ''
}
function pendingNoticeOf(r) {
  return myNotices().find(n => n.kind === 'makeup' && !n.acked && n.date === r.date && n.to === meId.value)
}
function swapPendingOf(r) {
  return (v5.swapRequests || []).some(x => x.status === 'pending' && x.from === meId.value && x.placementId === r.id)
}
function canAct(r) {
  if (r.date < v5.today) return false
  if (swapPendingOf(r) || pendingNoticeOf(r)) return false
  return true
}

const swapCands = computed(() => {
  if (sheet.value?.type !== 'swap') return []
  const my = sheet.value.row
  const mySlot = slotOf(my.slotId)
  return v5.placements
    .filter(p => p.status === 'active' && p.personId !== meId.value && p.id !== my.id)
    /* 已经换出去的班不在他名下，不能拿来换 */
    .filter(p => !p.swap)
    .filter(p => {
      const s = slotOf(p.slotId)
      // 换过来和我换出的一条一模一样 = 没换，不列
      if (p.date === my.date && s.start === mySlot.start && s.end === mySlot.end) return false
      if (personBusy5(v5, p.personId, my.date, mySlot.start, mySlot.end, p.id)) return false
      if (personBusy5(v5, meId.value, p.date, s.start, s.end, my.id)) return false
      return true
    })
    .slice(0, 8)
    .map(p => {
      const s = slotOf(p.slotId)
      const person = personById(v5, p.personId)
      return {
        id: p.id, date: p.date, personId: p.personId, person: person?.name,
        pos: person?.position, kind: person?.kind === 'fulltime' ? '全职' : '非全',
        slotName: s.name, start: s.start, end: s.end
      }
    })
})
const swapGroups = computed(() => {
  const map = new Map()
  swapCands.value.forEach(c => {
    if (!map.has(c.personId)) map.set(c.personId, { personId: c.personId, person: c.person, pos: c.pos, kind: c.kind, items: [] })
    map.get(c.personId).items.push(c)
  })
  return [...map.values()]
})

/* 换班请求说人话：谁、拿哪天的哪个班、换我哪天的哪个班 */
function swapText(req) {
  const theirs = v5.placements.find(p => p.id === req.placementId)
  const mine = v5.placements.find(p => p.id === req.partnerPlacementId)
  if (!theirs || !mine) return { date: v5.today, text: '这条请求的班次已经不在了' }
  const ts = slotOf(theirs.slotId)
  const ms = slotOf(mine.slotId)
  return {
    date: mine.date,
    text: `${personById(v5, req.from)?.name || '对方'} 想用他 ${dayShort(theirs.date)} ${ts.name}（${ts.start}–${ts.end}）换你 ${dayShort(mine.date)} ${ms.name}（${ms.start}–${ms.end}）`
  }
}
function goBack() { router.push('/mobile-menu') }

/* ---------- 动作 ---------- */
function openGrab(o) { sheet.value = { type: 'grab', o } }
function doGrab() {
  const o = sheet.value.o
  const r = grabV5(o.slotId, o.date)
  sheet.value = null
  if (r.ok) {
    ElMessage.success('抢到了，已经进你的排班')
    mineSel.value = o.date
    mineState.value = { year: Number(o.date.slice(0, 4)), month: Number(o.date.slice(5, 7)) }
  } else ElMessage.error(r.reason)
}
function openApply(o) { sheet.value = { type: 'apply', o, rank: applyRankOf(o.slotId, o.date) } }
function doApply() {
  const o = sheet.value.o
  const r = applyV5(o.slotId, o.date)
  sheet.value = null
  r.ok ? ElMessage.success('已登记，截止后按综合分排序') : ElMessage.error(r.reason)
}
function openLeave(r) { sheet.value = { type: 'leave', row: r } }
function doLeave() {
  const r0 = sheet.value.row
  const r = submitLeave(r0.id)
  sheet.value = null
  if (r.ok) {
    ElMessage.success(r.text || '已提交，系统开始找顶班的人')
    mineSel.value = r0.date
  } else ElMessage.error(r.reason)
}
function openSwap(r) { sheet.value = { type: 'swap', row: r } }
function doSwap(partnerPlacementId) {
  const r = proposeSwap(sheet.value.row.id, partnerPlacementId)
  sheet.value = null
  r.ok ? ElMessage.success(r.text) : ElMessage.error(r.reason)
}
function answer(req, accept) {
  const r = answerSwap(req.id, accept)
  r.ok ? ElMessage.success(r.text) : ElMessage.error(r.reason)
}
/* 补位确认就落在这条班次上：收到了记一条回执，去不了直接走请假 */
function ackMakeup(r) {
  const n = pendingNoticeOf(r)
  if (!n) { ElMessage.error('这条已经确认过了'); return }
  ackNotice(n.id)
  ElMessage.success('已回执，人事那边同步可见')
}
function declineMakeup(row) {
  const n = pendingNoticeOf(row)
  if (n) n.acked = true
  sheet.value = { type: 'leave', row }
}
</script>

<style scoped>
.m-page { min-height: 100vh; background: #f5f5f5; padding-bottom: 24px; }
.page-header {
  position: sticky; top: 0; z-index: 10;
  display: flex; align-items: center; gap: 8px;
  height: 48px; padding: 0 12px;
  background: #fff; border-bottom: 1px solid #efefef;
}
.back-icon { font-size: 18px; color: #333; cursor: pointer; }
.page-header h1 { flex: 1; text-align: center; font-size: 15px; font-weight: 500; margin: 0; color: #222; }
.ps-slot { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); }
.content-container { padding: 10px 12px 0; }
.view-tabs { display: flex; gap: 6px; margin-bottom: 10px; }
.view-tabs button {
  flex: 1; height: 32px; border-radius: 16px; border: 1px solid #ececec; background: #fff;
  font-size: 12.5px; color: #6a6a75; display: inline-flex; align-items: center; justify-content: center; gap: 4px;
}
.view-tabs button.active { background: #a40035; border-color: #a40035; color: #fff; }
.badge { min-width: 15px; height: 15px; border-radius: 8px; background: #fff; color: #a40035; font-size: 10.5px; line-height: 15px; padding: 0 4px; }
.dot-badge { font-size: 10.5px; color: #a40035; }
.view-tabs button.active .badge { background: rgba(255, 255, 255, 0.92); }
.view-tabs button.active .dot-badge { color: rgba(255, 255, 255, 0.9); }
.now-line { font-size: 11px; color: #a5a5ad; margin: -2px 2px 8px; line-height: 1.5; }

/* 概览 */
.overview-card { display: flex; background: #fff; border-radius: 12px; padding: 12px 4px; margin-bottom: 10px; }
.ov-item { flex: 1; text-align: center; position: relative; }
.ov-item + .ov-item::before { content: ''; position: absolute; left: 0; top: 4px; bottom: 4px; width: 1px; background: #f0f0f0; }
.ov-label { display: block; font-size: 11px; color: #9a9fa9; }
.ov-value { display: block; margin-top: 4px; font-size: 18px; font-weight: 600; color: #222; font-variant-numeric: tabular-nums; }
.ov-value i { font-style: normal; font-size: 10.5px; font-weight: 400; color: #9a9fa9; margin-left: 2px; }
.ov-value.warn { color: #a40035; }

.section-title-row { display: flex; align-items: center; gap: 6px; margin: 12px 2px 8px; }
.red-bar { width: 3px; height: 13px; background: #a40035; border-radius: 2px; }
.section-title { font-size: 13px; font-weight: 500; color: #222; }
.title-count { font-size: 11.5px; color: #9a9fa9; }

/* 班次卡 */
.res-card { background: #fff; border-radius: 12px; padding: 12px; margin-bottom: 8px; border: 1px solid #f2eef0; }
.res-card.covered { background: #fbfaf9; }
.rc-head { display: flex; justify-content: space-between; align-items: center; }
.rc-tags { display: flex; gap: 5px; align-items: center; }
.way-tag { font-size: 11px; padding: 1px 7px; border-radius: 9px; background: #fdf1f4; color: #a40035; }
.way-tag.gray { background: #f1efe8; color: #8a8a95; }
.state-tag { font-size: 10.5px; padding: 1px 6px; border-radius: 8px; background: #f4f4f5; color: #6a6a75; }
.state-tag.warn { background: #fdf3e6; color: #a86a12; }
.rc-hours { font-size: 11.5px; color: #9a9fa9; }
.rc-main { margin-top: 8px; }
.rc-time { font-size: 19px; font-weight: 600; color: #a40035; font-variant-numeric: tabular-nums; letter-spacing: 0.2px; }
.rc-time span { font-weight: 400; margin: 0 2px; }
.rc-where { display: flex; align-items: center; gap: 4px; margin-top: 5px; font-size: 12px; color: #6a6a75; }
.strike { text-decoration: line-through; color: #b5b5bd !important; }
.rc-note { margin: 9px 0 0; font-size: 11.5px; color: #8a8a95; line-height: 1.65; }
.rc-overtime { margin: 6px 0 0; font-size: 11.5px; color: #a86a12; line-height: 1.6; }
.rc-acts { display: flex; gap: 16px; margin-top: 10px; padding-top: 9px; border-top: 1px dashed #f0eaec; }
.act-line { border: none; background: none; padding: 0; font-size: 12px; color: #6a6a75; cursor: pointer; }
.act-line:first-child { color: #a40035; }
.rc-acts.pending { align-items: center; }
.rc-pending { flex: 1; font-size: 11.5px; color: #8a8a95; }
.rc-acts.pending .act-line { color: #6a6a75; white-space: nowrap; }
.rc-acts.pending .act-line.strong { color: #a40035; font-weight: 500; }

/* 可获取 */
.store-switch { display: flex; gap: 8px; margin: 2px 0 10px; }
.store-switch button { border: 1px solid #e8e2e4; background: #fff; color: #6a6a75; border-radius: 16px; padding: 5px 14px; font-size: 13px; }
.store-switch button.on { background: #a40035; border-color: #a40035; color: #fff; font-weight: 500; }
.claim-meter { background: #fff; border: 1px solid #f0eaec; border-radius: 10px; padding: 9px 12px; margin: 10px 0 8px; display: flex; flex-direction: column; gap: 5px; }
.cm-line { font-size: 12px; color: #2f6f4f; display: flex; align-items: center; gap: 6px; }
.cm-line.bad { color: #a4441d; }
.cm-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; display: inline-block; flex: none; }
.pick-banner { background: #fff; border-radius: 12px; padding: 12px; margin-bottom: 10px; border: 1px solid #f2eef0; }
.pb-top { display: flex; align-items: center; gap: 6px; }
.pb-top .el-icon { color: #a40035; }
.pb-top strong { font-size: 13px; color: #222; }
.pick-banner p { margin: 6px 0 0; font-size: 11.5px; color: #8a8a95; line-height: 1.65; }

.date-strip { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; margin-bottom: 10px; }
.ds-cell {
  flex: 0 0 auto; width: 46px; padding: 7px 0 6px; border-radius: 10px; background: #fff;
  border: 1px solid #ececec; display: flex; flex-direction: column; align-items: center; gap: 1px;
}
.ds-cell.active { background: #a40035; border-color: #a40035; }
.ds-cell:disabled { opacity: 0.5; }
.ds-wd { font-size: 10.5px; color: #9a9fa9; }
.ds-day { font-size: 15px; color: #222; font-variant-numeric: tabular-nums; }
.ds-n { font-size: 10px; color: #a40035; }
.ds-n.zero { color: #b5b5bd; }
.ds-cell.active .ds-wd, .ds-cell.active .ds-day, .ds-cell.active .ds-n { color: #fff; }

.offer-group { margin-bottom: 4px; }
.og-head { display: flex; align-items: center; gap: 8px; margin: 10px 2px 6px; }
.og-name { font-size: 12px; color: #6a4b8a; background: #f4eefb; border: 1px solid #e0d2f2; border-radius: 10px; padding: 1px 9px; }
.og-req { font-size: 11.5px; color: #2f6f4f; }
.og-req.bad { color: #a4441d; }
.offer-card { background: #fff; border-radius: 12px; padding: 12px; margin-bottom: 8px; border: 1px solid #f2eef0; }
.offer-card.dim { background: #fbfbfc; }
.oc-head { display: flex; justify-content: space-between; align-items: center; }
.oc-where { font-size: 12.5px; color: #222; font-weight: 500; }
.oc-way { font-size: 10.5px; padding: 1px 7px; border-radius: 8px; }
.oc-way.grab { background: #eaf6f1; color: #0f6e56; }
.oc-way.apply { background: #eef2fb; color: #2f4d8f; }
.oc-time { margin-top: 7px; font-size: 19px; font-weight: 600; color: #222; font-variant-numeric: tabular-nums; }
.oc-time span { font-weight: 400; margin: 0 2px; color: #9a9fa9; }
.oc-time em { font-style: normal; font-size: 11.5px; font-weight: 400; color: #9a9fa9; margin-left: 8px; }
.oc-meta { display: flex; flex-wrap: wrap; gap: 4px 12px; margin-top: 6px; font-size: 11.5px; color: #8a8a95; }
.oc-meta span { display: inline-flex; align-items: center; gap: 3px; }
.oc-quota { display: flex; align-items: center; gap: 8px; margin-top: 9px; font-size: 11.5px; color: #6a6a75; }
.oc-quota b { color: #222; font-size: 13px; }
.oc-bar { flex: 1; height: 4px; border-radius: 2px; background: #f1eff0; overflow: hidden; }
.oc-bar i { display: block; height: 100%; background: #d9cfd3; }
.oc-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 10px; padding-top: 9px; border-top: 1px dashed #f0eaec; }
.oc-hint { font-size: 11px; color: #9a9fa9; flex: 1; line-height: 1.5; }
.oc-hint.ok { color: #8a8a95; }
.oc-hint.bad { color: #b0574f; }
.act-btn { height: 30px; padding: 0 16px; border-radius: 15px; font-size: 12.5px; border: 1px solid #ececec; background: #fff; color: #6a6a75; white-space: nowrap; }
.act-btn.primary { background: #a40035; border-color: #a40035; color: #fff; }
.act-btn.ghost { background: #fff; color: #6a6a75; }
.act-btn.disabled { background: #f4f4f5; color: #b5b5bd; border-color: #f0f0f0; }
.act-btn.picked { background: #fdeef2; border-color: #a40035; color: #a40035; font-weight: 600; }

/* 集合提交：勾完在底部一起交；一条没选就没得交 */
.basket-bar {
  position: sticky; bottom: 0; z-index: 6;
  display: flex; align-items: center; gap: 10px;
  margin: 10px -12px 0; padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
  background: #fff; border-top: 1px solid #f0eaec; box-shadow: 0 -2px 10px rgba(0, 0, 0, .04);
}
.bb-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.bb-info b { font-size: 13px; color: #2c2c2a; font-weight: 600; }
.bb-info span { font-size: 11px; color: #8a8a95; line-height: 1.45; }
.bb-info span.bad { color: #a4441d; }
.bb-submit { flex: none; height: 34px; padding: 0 18px; border: none; border-radius: 17px; background: #a40035; color: #fff; font-size: 13px; font-weight: 600; }
.bb-submit:disabled { background: #ebe6e8; color: #aaa3a6; }

/* 通知 */
.notice-card { background: #fff; border-radius: 12px; padding: 12px; margin-bottom: 8px; border: 1px solid #f2eef0; }
.notice-card.unacked { border-color: #f3d3db; }
.notice-card.done { background: #fbfbfc; }
.nc-head { display: flex; justify-content: space-between; align-items: center; }
.nc-head strong { font-size: 12.5px; color: #222; }
.nc-date { font-size: 11.5px; color: #9a9fa9; }
.notice-card p { margin: 7px 0 0; font-size: 12px; color: #4a4a55; line-height: 1.65; }
.nc-detail { color: #8a8a95 !important; font-size: 11.5 !important; }
.nc-foot { color: #a5a5ad !important; font-size: 11px !important; }
.nc-act { display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px; }
.nc-done { display: inline-block; margin-top: 8px; font-size: 11.5px; color: #9a9fa9; }

.empty-box { background: #fff; border-radius: 12px; padding: 26px 16px; text-align: center; }
.empty-box.small { padding: 16px; }
.empty-main { margin: 0; font-size: 12.5px; color: #6a6a75; }
.empty-sub { margin: 6px 0 0; font-size: 11.5px; color: #a5a5ad; line-height: 1.6; }

/* 弹层 */
.sheet-mask { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.45); display: flex; align-items: flex-end; z-index: 200; }
.sheet { width: 100%; max-height: 86vh; overflow-y: auto; background: #fff; border-radius: 16px 16px 0 0; padding: 16px 16px 20px; }
.sheet-title { font-size: 14px; font-weight: 500; color: #222; text-align: center; margin-bottom: 14px; }
.sheet-shift { font-size: 15px; font-weight: 500; color: #222; }
.sheet-meta { font-size: 11.5px; color: #8a8a95; margin-top: 4px; }
.sheet-body p { margin: 0 0 8px; font-size: 12.5px; color: #4a4a55; line-height: 1.7; }
.sheet-body .sheet-note { margin-top: 10px; color: #8a8a95; font-size: 11.5px; }
.checks { margin-top: 12px; padding: 10px 12px; background: #fbf8f9; border-radius: 10px; }
.checks div { font-size: 11.5px; color: #6a6a75; line-height: 1.9; }
.checks i { font-style: normal; color: #a40035; margin-right: 6px; }
.cand-who-row { display: flex; align-items: baseline; gap: 6px; margin: 12px 0 6px; font-size: 12.5px; color: #222; }
.cand-who-row span { font-size: 11px; color: #9a9fa9; }
.cand { width: 100%; display: flex; justify-content: space-between; align-items: center; border: 1px solid #f0eaec; background: #fff; border-radius: 9px; padding: 10px 11px; margin-bottom: 6px; }
.cand-time { font-size: 12px; color: #4a4a55; }
.cand em { font-style: normal; font-size: 11.5px; color: #a40035; }
.sheet-acts { display: flex; gap: 10px; margin-top: 14px; }
.sheet-acts .act-btn { flex: 1; height: 38px; border-radius: 19px; }
</style>
