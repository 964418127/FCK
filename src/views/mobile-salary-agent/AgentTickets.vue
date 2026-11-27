<!--
  移动端 · 薪酬咨询助手（员工侧 · 我的工单）
  额度卡（本月剩 x/2，工单成立才扣）→ 工单卡列表（状态 / 优先级 / 薪酬项）→ 点卡弹详情：
  争议点（期望 vs 实际）→ 取证包（描述 + 截图）→ 预核查报告（结论 + 四步）→ 人事答复（结案后只读）。
  页头可切换演示身份（蓝田 / 林小满 / 陈一舟），对话演示页固定蓝田不在此列冲突。
  视觉沿用移动端规范：全屏页、白 sticky 页头、白卡 12px、品牌红 #a40035、自写底部弹层。
-->
<template>
  <div class="m-page">
    <header class="page-header">
      <el-icon class="back-icon" @click="goBack"><ArrowLeft /></el-icon>
      <h1>我的工单</h1>
      <button class="hdr-me" @click="personSheet = true">
        {{ meName }}<span class="hdr-pos">{{ mePosition }}</span>
      </button>
    </header>

    <div class="content-container">
      <!-- 额度卡 -->
      <div class="quota-card">
        <div class="qc-left">
          <p class="qc-label">本月工单额度</p>
          <p class="qc-value">{{ monthlyLeft }}<span>/{{ monthlyQuota }} 次</span></p>
        </div>
        <p class="qc-note">提交工单会占用本月可提交次数；和助手的对话咨询不限次。</p>
      </div>

      <!-- 工单列表 -->
      <div class="section-title-row">
        <span class="red-bar"></span>
        <span class="section-title">工单记录</span>
        <span class="title-count">{{ myTickets.length ? `${myTickets.length} 单` : '' }}</span>
      </div>

      <div v-if="!myTickets.length" class="empty-card">
        <p>本月还没有工单记录。</p>
        <p class="empty-sub">有疑问随时和助手聊，需要时会引导你提交工单。</p>
      </div>

      <button v-for="t in myTickets" :key="t.id" class="ticket-card" @click="openDetail(t)">
        <div class="tc-head">
          <span class="tc-item">{{ t.salaryItem }}</span>
          <span class="st-tag" :class="t.status">{{ statusLabel(t.status) }}</span>
        </div>
        <div class="tc-meta">
          <span>{{ t.id }}</span>
          <span>{{ t.period }}</span>
        </div>
        <div class="tc-foot">
          <span class="tc-brief">{{ briefOf(t) }}</span>
          <span class="tc-time">{{ shortTime(t.createdAt) }}</span>
        </div>
      </button>
    </div>

    <!-- 身份切换弹层 -->
    <div v-if="personSheet" class="sheet-mask" @click.self="personSheet = false">
      <div class="sheet">
        <div class="sheet-bar"></div>
        <p class="sheet-title">切换演示身份</p>
        <button
          v-for="p in staff"
          :key="p.id"
          class="person-row"
          :class="{ active: p.id === meIdRef }"
          @click="pickPerson(p.id)"
        >
          <span class="p-name">{{ p.name }}</span>
          <span class="p-pos">{{ p.position }}</span>
          <el-icon v-if="p.id === meIdRef"><Check /></el-icon>
        </button>
      </div>
    </div>

    <!-- 工单详情弹层 -->
    <div v-if="detail" class="sheet-mask" @click.self="detail = null">
      <div class="sheet">
        <div class="sheet-bar"></div>
        <div class="dt-head">
          <p class="sheet-title">{{ detail.salaryItem }}</p>
          <span class="st-tag" :class="detail.status">{{ statusLabel(detail.status) }}</span>
        </div>
        <p class="dt-sub">{{ detail.id }} · {{ detail.period }} · {{ detail.createdAt }}</p>

        <!-- 争议点 -->
        <p class="dt-label">你的主张</p>
        <div class="dt-dispute">
          <div class="dd-nums">
            <div class="dd-cell"><span>你认为</span><b>{{ fmtVal(detail.dispute.expected) }}</b></div>
            <div class="dd-cell"><span>系统核算</span><b>{{ fmtVal(detail.dispute.actual) }}</b></div>
          </div>
          <p class="dd-reason">{{ detail.dispute.reason }}</p>
        </div>

        <!-- 取证包 -->
        <p class="dt-label">你的证据</p>
        <div class="dt-evi">
          <div v-for="(e, i) in detail.evidence" :key="i" :class="e.kind === 'shot' ? 'evi-shot' : 'evi-desc'">
            <span v-if="e.kind === 'shot'" class="shot-icon"></span>
            {{ e.text || e.label }}
          </div>
        </div>

        <!-- 复核情况（员工视角：只看结论与还原过程，优先级评定等内部机制不露） -->
        <p class="dt-label">助手复核</p>
        <div class="dt-recheck">
          <div class="rc-head">
            <span class="rc-conclusion" :class="detail.recheck.deviate > 0 ? 'deviate' : 'keep'">
              {{ detail.recheck.conclusion }}<template v-if="detail.recheck.deviate > 0">（{{ detail.recheck.deviate }} 元）</template>
            </span>
          </div>
          <div v-for="(s, i) in detail.recheck.steps" :key="i" class="rc-step">
            <span class="rc-no">{{ i + 1 }}</span>{{ s }}
          </div>
        </div>

        <!-- 人事答复 -->
        <template v-if="detail.status === 'closed'">
          <p class="dt-label">人事答复（最终结论）</p>
          <div class="dt-reply">
            <p class="dr-meta">{{ detail.reply.by }} · {{ detail.reply.at }}</p>
            <p class="dr-text">{{ detail.reply.text }}</p>
          </div>
        </template>
        <template v-else-if="detail.status === 'processing'">
          <p class="dt-label">处理进展</p>
          <p class="dt-progress">人事已接单，正在核实，答复后本单完结。</p>
        </template>
        <template v-else>
          <p class="dt-label">处理进展</p>
          <p class="dt-progress">工单已提交，等待人事接单。处理过程中你可以在工单通道内补充说明。</p>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Check } from '@element-plus/icons-vue'
import { SA_PEOPLE, statusLabel, MONTHLY_QUOTA } from '../../mock/salaryAgentTickets.js'
import { myTickets, meName, mePosition, meId, setMe, monthlyLeft } from '../../mock/salaryAgentTicketsStore.js'

const router = useRouter()

const monthlyQuota = MONTHLY_QUOTA
const staff = SA_PEOPLE.filter(p => p.id !== 'HR-01')

const personSheet = ref(false)
const meIdRef = meId
function pickPerson (id) { setMe(id); personSheet.value = false }

const detail = ref(null)
function openDetail (t) { detail.value = t }

function briefOf (t) {
  const d = t.dispute
  return `主张 ${d.expected} · 系统 ${d.actual}`
}
function shortTime (s) { return s.slice(5, 16) }
function fmtVal (v) { return typeof v === 'number' ? `${v} 元` : v }

function goBack () { router.push('/mobile-menu') }
</script>

<style scoped>
.m-page { min-height: 100vh; background: #f5f5f5; padding-bottom: 24px; }
.page-header { position: sticky; top: 0; z-index: 10; height: 48px; background: #fff; display: flex; align-items: center; padding: 0 12px; gap: 8px; border-bottom: 1px solid #f0e7ea; }
.page-header h1 { font-size: 16px; font-weight: 500; color: #262626; flex: 1; margin: 0; }
.back-icon { font-size: 20px; color: #595959; }
.hdr-me { border: none; background: none; display: flex; flex-direction: column; align-items: flex-end; gap: 1px; padding: 0; }
.hdr-me { color: #a40035; font-size: 13px; font-weight: 500; }
.hdr-pos { font-size: 10px; color: #bfbfbf; font-weight: 400; }

.content-container { padding: 14px 12px 0; }

/* 额度卡 */
.quota-card { background: linear-gradient(135deg, #c31450, #a40035); border-radius: 12px; padding: 14px 16px; color: #fff; display: flex; align-items: center; gap: 14px; }
.qc-label { margin: 0 0 4px; font-size: 12px; opacity: 0.85; }
.qc-value { margin: 0; font-size: 26px; font-weight: 500; }
.qc-value span { font-size: 12px; opacity: 0.85; font-weight: 400; }
.qc-note { flex: 1; margin: 0; font-size: 11px; line-height: 1.6; opacity: 0.9; }

.section-title-row { display: flex; align-items: center; gap: 8px; margin: 16px 2px 10px; }
.red-bar { width: 3px; height: 14px; border-radius: 2px; background: #a40035; }
.section-title { font-size: 14px; font-weight: 500; color: #262626; }
.title-count { font-size: 12px; color: #8c8c8c; }

.empty-card { background: #fff; border-radius: 12px; padding: 20px 16px; text-align: center; }
.empty-card p { margin: 0; font-size: 13px; color: #595959; }
.empty-sub { margin-top: 6px !important; font-size: 12px; color: #bfbfbf !important; line-height: 1.6; }

/* 工单卡 */
.ticket-card { width: 100%; display: block; text-align: left; background: #fff; border: none; border-radius: 12px; padding: 12px 14px; margin-bottom: 10px; }
.tc-head { display: flex; align-items: center; justify-content: space-between; }
.tc-item { font-size: 15px; font-weight: 500; color: #262626; }
.tc-meta { display: flex; gap: 10px; font-size: 11px; color: #bfbfbf; margin: 6px 0 8px; }
.tc-foot { display: flex; align-items: center; gap: 8px; }
.tc-brief { flex: 1; font-size: 12px; color: #8c8c8c; }
.tc-time { font-size: 11px; color: #bfbfbf; }

.st-tag { font-size: 11px; padding: 3px 8px; border-radius: 10px; flex: none; }
.st-tag.pending { background: #fceff2; color: #a40035; }
.st-tag.processing { background: #faeeda; color: #854f0b; }
.st-tag.closed { background: #f1efe8; color: #5f5e5a; }

/* 弹层通用 */
.sheet-mask { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.45); display: flex; align-items: flex-end; z-index: 200; }
.sheet { width: 100%; max-height: 86vh; overflow-y: auto; background: #fff; border-radius: 16px 16px 0 0; padding: 14px 16px 24px; }
.sheet-bar { width: 36px; height: 4px; border-radius: 2px; background: #e8e8e8; margin: 0 auto 12px; }
.sheet-title { font-size: 16px; font-weight: 500; color: #262626; margin: 0; }
.dt-head { display: flex; align-items: center; justify-content: space-between; }
.dt-sub { font-size: 11px; color: #bfbfbf; margin: 6px 0 0; }
.dt-label { font-size: 13px; font-weight: 500; color: #262626; margin: 16px 0 8px; }

/* 身份切换 */
.person-row { width: 100%; display: flex; align-items: center; gap: 10px; background: #fafafa; border: none; border-radius: 10px; padding: 12px 14px; margin-bottom: 8px; }
.person-row.active { background: #fceff2; }
.p-name { font-size: 14px; color: #262626; font-weight: 500; }
.p-pos { flex: 1; text-align: left; font-size: 12px; color: #8c8c8c; }
.person-row .el-icon { color: #a40035; }

/* 详情 */
.dt-dispute { background: #fafafa; border-radius: 10px; padding: 12px; }
.dd-nums { display: flex; gap: 10px; }
.dd-cell { flex: 1; background: #fff; border-radius: 8px; padding: 8px 10px; }
.dd-cell span { display: block; font-size: 11px; color: #8c8c8c; margin-bottom: 4px; }
.dd-cell b { font-size: 15px; color: #262626; font-weight: 500; }
.dd-reason { margin: 8px 0 0; font-size: 12px; color: #595959; line-height: 1.6; }

.dt-evi { display: flex; flex-direction: column; gap: 6px; }
.evi-desc { background: #fff; border: 1px solid #f0f0f0; border-radius: 8px; padding: 8px 10px; font-size: 12px; color: #595959; line-height: 1.6; }
.evi-shot { display: flex; align-items: center; gap: 8px; background: #fff; border: 1px dashed #d9b3bd; border-radius: 8px; padding: 8px 10px; font-size: 12px; color: #595959; }
.shot-icon { width: 14px; height: 14px; border-radius: 3px; background: #f0d5dc; flex: none; }

.dt-recheck { background: #fafafa; border-radius: 10px; padding: 12px; }
.rc-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.rc-conclusion { font-size: 13px; font-weight: 500; }
.rc-conclusion.deviate { color: #a40035; }
.rc-conclusion.keep { color: #5f5e5a; }
.rc-step { display: flex; gap: 8px; font-size: 12px; color: #595959; line-height: 1.6; padding: 4px 0; }
.rc-no { flex: none; width: 18px; height: 18px; border-radius: 50%; background: #f1efe8; color: #5f5e5a; font-size: 10px; display: flex; align-items: center; justify-content: center; margin-top: 1px; }

.dt-reply { background: #fafafa; border-radius: 10px; padding: 12px; }
.dr-meta { margin: 0 0 6px; font-size: 11px; color: #8c8c8c; }
.dr-text { margin: 0; font-size: 13px; color: #262626; line-height: 1.7; }
.dt-progress { margin: 0; font-size: 12px; color: #854f0b; background: #faeeda; border-radius: 8px; padding: 10px 12px; line-height: 1.6; }
</style>
