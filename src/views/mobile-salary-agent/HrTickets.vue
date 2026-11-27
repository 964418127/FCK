<!--
  移动端 · 薪酬工单（人事侧 · 工单事件处理入口）
  只有人事能看到的处理队列：P1/P2/P3 优先级分组（预核查报告已就位，人事不做盲审）。
  点卡弹处理弹层三件套：员工主张+证据 / 助手预核查报告 / 处理动作。
  状态机：待人事处理 → 处理中（接单）→ 已结案（一次答复即结案）。
  IM 侧口径在弹层里表达：人事可主动联系员工；员工不可反向直聊，只能在本工单通道内补充说明。
  视觉沿用移动端规范：全屏页、白 sticky 页头、白卡 12px、品牌红 #a40035、自写底部弹层。
-->
<template>
  <div class="m-page">
    <header class="page-header">
      <el-icon class="back-icon" @click="goBack"><ArrowLeft /></el-icon>
      <h1>薪酬工单处理</h1>
      <span class="hdr-role">人事 · 顾清岚</span>
    </header>

    <div class="content-container">
      <!-- 统计卡 -->
      <div class="stat-row">
        <div class="stat-cell"><b>{{ countOf('pending') }}</b><span>待处理</span></div>
        <div class="stat-cell"><b>{{ countOf('processing') }}</b><span>处理中</span></div>
        <div class="stat-cell"><b>{{ countOf('closed') }}</b><span>已结案</span></div>
      </div>
      <p class="stat-note">工单到达你这里之前，助手已完成预核查并给出优先级评定；预核查只复核不判定，最终结论由你答复。</p>

      <!-- 优先级分组 -->
      <template v-for="g in groups" :key="g.key">
        <div v-if="g.list.length" class="section-title-row">
          <span class="red-bar"></span>
          <span class="section-title">{{ g.label }}</span>
          <span class="title-count">{{ g.list.length }} 单</span>
        </div>
        <button v-for="t in g.list" :key="t.id" class="ticket-card" @click="openDetail(t)">
          <div class="tc-head">
            <span class="pr-tag" :class="t.priority.toLowerCase()">{{ t.priority }}</span>
            <span class="tc-emp">{{ t.employeeName }}<i>{{ t.position }}</i></span>
            <span class="st-tag" :class="t.status">{{ statusLabel(t.status) }}</span>
          </div>
          <div class="tc-item">{{ t.salaryItem }} · {{ t.period }}</div>
          <div class="tc-foot">
            <span class="tc-brief">{{ briefOf(t) }}</span>
            <span class="tc-time">{{ shortTime(t.createdAt) }}</span>
          </div>
        </button>
      </template>

      <template v-if="!openList.length">
        <div class="empty-card"><p>进行中的工单都处理完了。</p></div>
      </template>

      <!-- 已结案 -->
      <div v-if="closedList.length" class="section-title-row">
        <span class="red-bar gray"></span>
        <span class="section-title">已结案</span>
        <span class="title-count">{{ closedList.length }} 单</span>
      </div>
      <button v-for="t in closedList" :key="t.id" class="ticket-card closed" @click="openDetail(t)">
        <div class="tc-head">
          <span class="tc-item">{{ t.salaryItem }}</span>
          <span class="tc-emp">{{ t.employeeName }}</span>
          <span class="st-tag closed">已结案</span>
        </div>
        <div class="tc-meta">{{ t.id }} · {{ shortTime(t.createdAt) }}</div>
      </button>
    </div>

    <!-- 处理弹层 -->
    <div v-if="cur" class="sheet-mask" @click.self="cur = null">
      <div class="sheet">
        <div class="sheet-bar"></div>
        <div class="dt-head">
          <p class="sheet-title">{{ cur.salaryItem }}</p>
          <span class="pr-tag" :class="cur.priority.toLowerCase()">{{ cur.priority }}</span>
        </div>
        <p class="dt-sub">{{ cur.employeeName }}（{{ cur.position }}）· {{ cur.id }} · {{ cur.createdAt }}</p>
        <p class="dt-pr-reason">{{ cur.priorityReason }}</p>

        <!-- 三件套 1：员工主张 + 证据 -->
        <p class="dt-label">员工主张与证据</p>
        <div class="dt-dispute">
          <div class="dd-nums">
            <div class="dd-cell"><span>员工认为</span><b>{{ fmtVal(cur.dispute.expected) }}</b></div>
            <div class="dd-cell"><span>系统核算</span><b>{{ fmtVal(cur.dispute.actual) }}</b></div>
          </div>
          <p class="dd-reason">{{ cur.dispute.reason }}</p>
          <div class="dt-evi">
            <div v-for="(e, i) in cur.evidence" :key="i" :class="e.kind === 'shot' ? 'evi-shot' : 'evi-desc'">
              <span v-if="e.kind === 'shot'" class="shot-icon"></span>
              {{ e.text || e.label }}
            </div>
          </div>
        </div>

        <!-- 三件套 2：预核查报告 -->
        <p class="dt-label">助手预核查报告</p>
        <div class="dt-recheck">
          <span class="rc-conclusion" :class="cur.recheck.deviate > 0 ? 'deviate' : 'keep'">
            {{ cur.recheck.conclusion }}<template v-if="cur.recheck.deviate > 0">（{{ cur.recheck.deviate }} 元）</template>
          </span>
          <div v-for="(s, i) in cur.recheck.steps" :key="i" class="rc-step">
            <span class="rc-no">{{ i + 1 }}</span>{{ s }}
          </div>
        </div>

        <!-- 三件套 3：处理动作 -->
        <template v-if="cur.status === 'pending'">
          <div class="sheet-act">
            <button class="act-btn primary" @click="take(cur.id)">接单处理</button>
          </div>
          <p class="im-note">接单后如需当面核实，你可以主动发起与员工的沟通（IM 侧人事可主动联系员工，员工不可反向直聊）。</p>
        </template>

        <template v-else-if="cur.status === 'processing'">
          <p class="dt-label">答复员工（一次答复即结案）</p>
          <textarea
            v-model="replyText"
            class="reply-input"
            rows="4"
            placeholder="给出核实结论与依据。答复提交即结案，员工再不服需次月发起新工单。"
          ></textarea>
          <div class="sheet-act">
            <button class="act-btn primary" :disabled="!replyText.trim()" @click="reply(cur.id)">答复并结案</button>
          </div>
        </template>

        <template v-else>
          <p class="dt-label">人事答复（最终结论）</p>
          <div class="dt-reply">
            <p class="dr-meta">{{ cur.reply.by }} · {{ cur.reply.at }}</p>
            <p class="dr-text">{{ cur.reply.text }}</p>
          </div>
          <div class="sheet-act">
            <button class="act-btn ghost" @click="contact(cur)">主动联系员工</button>
          </div>
          <p class="im-note">已结案工单通道只读；你可以主动发起沟通，员工侧不可再就此工单反向发起。</p>
        </template>
      </div>
    </div>

    <!-- 演示提示弹层 -->
    <div v-if="contactTip" class="sheet-mask" @click.self="contactTip = false">
      <div class="sheet">
        <div class="sheet-bar"></div>
        <p class="sheet-title">发起沟通（IM 演示）</p>
        <p class="tip-text">已向 {{ contactTarget }} 发起会话。人事可主动联系员工；员工不能反向直聊人事，只能在处理中的工单通道内补充说明。</p>
        <div class="sheet-act">
          <button class="act-btn primary" @click="contactTip = false">知道了</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { statusLabel, PRIORITIES } from '../../mock/salaryAgentTickets.js'
import { allTickets, hrTake, hrReply } from '../../mock/salaryAgentTicketsStore.js'

const router = useRouter()

const countOf = (s) => allTickets.value.filter(t => t.status === s).length
const openList = computed(() => allTickets.value.filter(t => t.status !== 'closed'))
const closedList = computed(() => allTickets.value.filter(t => t.status === 'closed'))

const groups = computed(() => PRIORITIES.map(g => ({
  key: g.key,
  label: g.label,
  list: openList.value.filter(t => t.priority === g.key)
})))

const cur = ref(null)
const replyText = ref('')
function openDetail (t) { cur.value = t; replyText.value = '' }

function briefOf (t) {
  const d = t.dispute
  if (typeof d.expected === 'number' && typeof d.actual === 'number') return `主张 ${d.expected} · 系统 ${d.actual}`
  return `主张 ${d.expected} · 系统 ${d.actual}`
}
function shortTime (s) { return s.slice(5, 16) }
function fmtVal (v) { return typeof v === 'number' ? `${v} 元` : v }

function take (id) {
  hrTake(id)
  cur.value = allTickets.value.find(t => t.id === id)
}
function reply (id) {
  hrReply(id, replyText.value.trim())
  cur.value = null
}

const contactTip = ref(false)
const contactTarget = ref('')
function contact (t) {
  contactTarget.value = `${t.employeeName}（${t.employeeId}）`
  contactTip.value = true
}

function goBack () { router.push('/mobile-menu') }
</script>

<style scoped>
.m-page { min-height: 100vh; background: #f5f5f5; padding-bottom: 24px; }
.page-header { position: sticky; top: 0; z-index: 10; height: 48px; background: #fff; display: flex; align-items: center; padding: 0 12px; gap: 8px; border-bottom: 1px solid #f0e7ea; }
.page-header h1 { font-size: 16px; font-weight: 500; color: #262626; flex: 1; margin: 0; }
.back-icon { font-size: 20px; color: #595959; }
.hdr-role { font-size: 11px; color: #8c8c8c; }

.content-container { padding: 14px 12px 0; }

.stat-row { display: flex; gap: 10px; }
.stat-cell { flex: 1; background: #fff; border-radius: 12px; padding: 12px 0; text-align: center; }
.stat-cell b { display: block; font-size: 20px; color: #a40035; font-weight: 500; }
.stat-cell span { font-size: 11px; color: #8c8c8c; }
.stat-note { font-size: 11px; color: #8c8c8c; line-height: 1.6; margin: 10px 2px 4px; }

.section-title-row { display: flex; align-items: center; gap: 8px; margin: 14px 2px 10px; }
.red-bar { width: 3px; height: 14px; border-radius: 2px; background: #a40035; }
.red-bar.gray { background: #b4b2a9; }
.section-title { font-size: 14px; font-weight: 500; color: #262626; }
.title-count { font-size: 12px; color: #8c8c8c; }

.ticket-card { width: 100%; display: block; text-align: left; background: #fff; border: none; border-radius: 12px; padding: 12px 14px; margin-bottom: 10px; }
.ticket-card.closed { opacity: 0.75; }
.tc-head { display: flex; align-items: center; gap: 8px; }
.tc-emp { flex: 1; font-size: 13px; color: #262626; font-weight: 500; }
.tc-emp i { font-style: normal; font-size: 11px; color: #bfbfbf; font-weight: 400; margin-left: 6px; }
.tc-item { font-size: 13px; color: #595959; margin: 8px 0; }
.tc-meta { font-size: 11px; color: #bfbfbf; margin-top: 6px; }
.tc-foot { display: flex; align-items: center; gap: 8px; }
.tc-brief { flex: 1; font-size: 12px; color: #8c8c8c; }
.tc-time { font-size: 11px; color: #bfbfbf; }

.st-tag { font-size: 11px; padding: 3px 8px; border-radius: 10px; flex: none; }
.st-tag.pending { background: #fceff2; color: #a40035; }
.st-tag.processing { background: #faeeda; color: #854f0b; }
.st-tag.closed { background: #f1efe8; color: #5f5e5a; }

.pr-tag { font-size: 11px; padding: 2px 7px; border-radius: 8px; flex: none; }
.pr-tag.p1 { background: #fcebeb; color: #a32d2d; }
.pr-tag.p2 { background: #faeeda; color: #854f0b; }
.pr-tag.p3 { background: #f1efe8; color: #5f5e5a; }

.empty-card { background: #fff; border-radius: 12px; padding: 20px 16px; text-align: center; margin-top: 14px; }
.empty-card p { margin: 0; font-size: 13px; color: #8c8c8c; }

/* 弹层通用 */
.sheet-mask { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.45); display: flex; align-items: flex-end; z-index: 200; }
.sheet { width: 100%; max-height: 86vh; overflow-y: auto; background: #fff; border-radius: 16px 16px 0 0; padding: 14px 16px 24px; }
.sheet-bar { width: 36px; height: 4px; border-radius: 2px; background: #e8e8e8; margin: 0 auto 12px; }
.sheet-title { font-size: 16px; font-weight: 500; color: #262626; margin: 0; }
.dt-head { display: flex; align-items: center; gap: 10px; }
.dt-sub { font-size: 11px; color: #bfbfbf; margin: 6px 0 0; }
.dt-pr-reason { font-size: 11px; color: #854f0b; background: #faeeda; border-radius: 8px; padding: 8px 10px; margin: 10px 0 0; line-height: 1.6; }
.dt-label { font-size: 13px; font-weight: 500; color: #262626; margin: 16px 0 8px; }

.dt-dispute { background: #fafafa; border-radius: 10px; padding: 12px; }
.dd-nums { display: flex; gap: 10px; }
.dd-cell { flex: 1; background: #fff; border-radius: 8px; padding: 8px 10px; }
.dd-cell span { display: block; font-size: 11px; color: #8c8c8c; margin-bottom: 4px; }
.dd-cell b { font-size: 15px; color: #262626; font-weight: 500; }
.dd-reason { margin: 8px 0; font-size: 12px; color: #595959; line-height: 1.6; }
.dt-evi { display: flex; flex-direction: column; gap: 6px; }
.evi-desc { background: #fff; border: 1px solid #f0f0f0; border-radius: 8px; padding: 8px 10px; font-size: 12px; color: #595959; line-height: 1.6; }
.evi-shot { display: flex; align-items: center; gap: 8px; background: #fff; border: 1px dashed #d9b3bd; border-radius: 8px; padding: 8px 10px; font-size: 12px; color: #595959; }
.shot-icon { width: 14px; height: 14px; border-radius: 3px; background: #f0d5dc; flex: none; }

.dt-recheck { background: #fafafa; border-radius: 10px; padding: 12px; }
.rc-conclusion { font-size: 13px; font-weight: 500; display: block; margin-bottom: 8px; }
.rc-conclusion.deviate { color: #a40035; }
.rc-conclusion.keep { color: #5f5e5a; }
.rc-step { display: flex; gap: 8px; font-size: 12px; color: #595959; line-height: 1.6; padding: 4px 0; }
.rc-no { flex: none; width: 18px; height: 18px; border-radius: 50%; background: #f1efe8; color: #5f5e5a; font-size: 10px; display: flex; align-items: center; justify-content: center; margin-top: 1px; }

.reply-input { width: 100%; box-sizing: border-box; border: 1px solid #e8e8e8; border-radius: 10px; padding: 10px 12px; font-size: 13px; color: #262626; resize: none; background: #fafafa; }
.reply-input:focus { outline: none; border-color: #a40035; }

.sheet-act { display: flex; gap: 10px; margin-top: 14px; }
.sheet-act .act-btn { flex: 1; }
.act-btn { border-radius: 10px; padding: 12px 0; font-size: 14px; }
.act-btn.primary { background: linear-gradient(135deg, #c31450, #a40035); color: #fff; border: none; }
.act-btn.primary:disabled { opacity: 0.45; }
.act-btn.ghost { background: #fff; border: 1px solid #d9d9d9; color: #595959; }
.im-note { font-size: 11px; color: #8c8c8c; line-height: 1.6; margin: 10px 0 0; }

.dt-reply { background: #fafafa; border-radius: 10px; padding: 12px; }
.dr-meta { margin: 0 0 6px; font-size: 11px; color: #8c8c8c; }
.dr-text { margin: 0; font-size: 13px; color: #262626; line-height: 1.7; }
.tip-text { font-size: 13px; color: #595959; line-height: 1.7; margin: 0 0 8px; }
</style>
