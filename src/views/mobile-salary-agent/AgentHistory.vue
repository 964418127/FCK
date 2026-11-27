<!--
  移动端 · 薪酬咨询助手（员工侧 · 历史咨询）
  会话列表：标题 / 状态（进行中·已结束）/ 最近咨询时间 / 关联工单；点击加载历史聊天记录。
  已结束会话只可查看；继续咨询走「新建对话」。
  顶部演示控件用于展示 24h 自动结束规则（演示辅具，不属业务文案）。
  视觉沿用移动端规范：全屏页、白 sticky 页头、白卡 12px、品牌红 #a40035。
-->
<template>
  <div class="m-page">
    <header class="page-header">
      <el-icon class="back-icon" @click="goBack"><ArrowLeft /></el-icon>
      <h1>历史咨询</h1>
      <button class="hdr-new" @click="newChat">新建对话</button>
    </header>

    <div class="content-container">
      <div class="rule-card">
        <p class="rc-title">咨询记录保留说明</p>
        <p>无工单的咨询，24 小时后自动结束；有工单的咨询，在工单结案后保留 24 小时。已结束的咨询可以查看记录，继续咨询请新建对话。</p>
      </div>

      <!-- 演示控件：推进时间展示 24h 自动结束 -->
      <div class="demo-bar">
        <span class="db-label">演示时间 {{ demoNow }}</span>
        <button class="db-btn" @click="advanceDemoHours(24)">+24 小时</button>
        <button class="db-btn ghost" @click="resetDemoTime">恢复</button>
      </div>

      <div class="section-title-row">
        <span class="red-bar"></span>
        <span class="section-title">全部咨询</span>
        <span class="title-count">{{ sessionList.length }} 条</span>
      </div>

      <div v-if="!sessionList.length" class="empty-card">
        <p>还没有咨询记录。</p>
        <p class="empty-sub">回到助手提问后，记录会出现在这里。</p>
      </div>

      <button v-for="s in sessionList" :key="s.id" class="session-card" @click="openSession(s)">
        <div class="sc-head">
          <span class="sc-title">{{ s.title }}</span>
          <span class="sc-status" :class="{ ended: s.endInfo.ended }">
            {{ s.endInfo.ended ? '已结束' : '进行中' }}
          </span>
        </div>
        <div class="sc-meta">
          <span>{{ s.id }}</span>
          <span>{{ s.updatedAt }}</span>
        </div>
        <div class="sc-foot">
          <span v-if="s.ticketId" class="sc-ticket">关联工单 {{ s.ticketId }}</span>
          <span v-else class="sc-plain">咨询解答</span>
          <span class="sc-arrow">查看记录 ›</span>
        </div>
      </button>

      <p class="bottom-note">已结束的咨询仅可查看记录，不能在原对话继续；继续咨询请新建对话。</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { sessionList, demoNow, advanceDemoHours, resetDemoTime, loadSession, newDialog } from '../../mock/salaryAgentTicketsStore.js'

const router = useRouter()

function openSession (s) {
  loadSession(s.id)
  router.push({ path: '/mobile-salary-agent', query: { session: s.id } })
}
function newChat () {
  newDialog()
  router.push('/mobile-salary-agent')
}
function goBack () { router.push('/mobile-salary-agent') }
</script>

<style scoped>
.m-page { min-height: 100vh; background: #f5f5f5; padding-bottom: 24px; }
.page-header { position: sticky; top: 0; z-index: 10; height: 48px; background: #fff; display: flex; align-items: center; padding: 0 12px; gap: 8px; border-bottom: 1px solid #f0e7ea; }
.page-header h1 { font-size: 16px; font-weight: 500; color: #262626; flex: 1; margin: 0; }
.back-icon { font-size: 20px; color: #595959; }
.hdr-new { border: none; background: #fceff2; color: #a40035; font-size: 12px; padding: 6px 10px; border-radius: 14px; }

.content-container { padding: 14px 12px 0; }

.rule-card { background: #fff; border-radius: 12px; padding: 12px 14px; }
.rc-title { font-size: 13px; font-weight: 500; color: #262626; margin: 0 0 6px; }
.rule-card p:last-child { font-size: 12px; color: #8c8c8c; line-height: 1.7; margin: 0; }

.demo-bar { display: flex; align-items: center; gap: 8px; margin-top: 10px; background: #f0eeea; border-radius: 10px; padding: 8px 10px; }
.db-label { flex: 1; font-size: 11px; color: #8c8c8c; }
.db-btn { border: none; background: #fff; color: #595959; font-size: 11px; padding: 5px 9px; border-radius: 10px; }
.db-btn.ghost { background: transparent; color: #8c8c8c; }

.section-title-row { display: flex; align-items: center; gap: 8px; margin: 16px 2px 10px; }
.red-bar { width: 3px; height: 14px; border-radius: 2px; background: #a40035; }
.section-title { font-size: 14px; font-weight: 500; color: #262626; }
.title-count { font-size: 12px; color: #8c8c8c; }

.empty-card { background: #fff; border-radius: 12px; padding: 20px 16px; text-align: center; }
.empty-card p { margin: 0; font-size: 13px; color: #595959; }
.empty-sub { margin-top: 6px !important; font-size: 12px; color: #bfbfbf !important; }

.session-card { width: 100%; display: block; text-align: left; background: #fff; border: none; border-radius: 12px; padding: 12px 14px; margin-bottom: 10px; }
.sc-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.sc-title { font-size: 14px; color: #262626; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sc-status { font-size: 11px; padding: 3px 8px; border-radius: 10px; flex: none; background: #fceff2; color: #a40035; }
.sc-status.ended { background: #f1efe8; color: #5f5e5a; }
.sc-meta { display: flex; gap: 10px; font-size: 11px; color: #bfbfbf; margin: 6px 0 8px; }
.sc-foot { display: flex; align-items: center; justify-content: space-between; }
.sc-ticket { font-size: 11px; color: #a40035; background: #fceff2; border-radius: 8px; padding: 2px 8px; }
.sc-plain { font-size: 11px; color: #8c8c8c; }
.sc-arrow { font-size: 12px; color: #bfbfbf; }
.bottom-note { font-size: 11px; color: #bfbfbf; line-height: 1.6; margin: 4px 2px 0; }
</style>
