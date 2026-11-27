<!--
  移动端 · 薪酬咨询助手（员工侧 · 历史咨询）
  这里全部是「已结束」的咨询（进行中的就是当前对话，不进历史）。
  点一条 = 查看当时的记录（只读）；要继续，到对话页底部功能区点「继续对话」更新状态。
  时间推进控件是演示辅具，仅在 ?dev=1 时出现，正常员工侧不露。
  视觉沿用移动端规范：全屏页、白 sticky 页头、白卡 12px、品牌红 #a40035。
-->
<template>
  <div class="m-page">
    <header class="page-header">
      <el-icon class="back-icon" @click="goBack"><ArrowLeft /></el-icon>
      <h1>历史咨询</h1>
    </header>

    <div class="content-container">
      <div class="rule-card">
        <p class="rc-title">已结束的咨询</p>
        <p>这里只保留已结束的咨询。无工单的咨询 24 小时后结束；有工单的咨询在工单结案后保留 24 小时。点开可查看当时记录，需要继续时在对话页点「继续对话」。</p>
      </div>

      <!-- 演示辅具：仅 ?dev=1 出现，用于推进时间展示 24h 自动结束 -->
      <div v-if="showDev" class="demo-bar">
        <span class="db-label">演示时间 {{ demoNow }}</span>
        <button class="db-btn" @click="advanceDemoHours(24)">+24 小时</button>
        <button class="db-btn ghost" @click="resetDemoTime">恢复</button>
      </div>

      <div class="section-title-row">
        <span class="red-bar"></span>
        <span class="section-title">历史记录</span>
        <span class="title-count">{{ historySessions.length }} 条</span>
      </div>

      <div v-if="!historySessions.length" class="empty-card">
        <p>还没有已结束的咨询。</p>
        <p class="empty-sub">咨询结束 24 小时后，记录会出现在这里。</p>
      </div>

      <button v-for="s in historySessions" :key="s.id" class="session-card" @click="openSession(s)">
        <div class="sc-head">
          <span class="sc-title">{{ s.title }}</span>
          <span class="sc-ended">已结束</span>
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

      <p class="bottom-note">点开只查看记录；要在这个问题上继续，请在对话页点「继续对话」。</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { historySessions, demoNow, advanceDemoHours, resetDemoTime, loadSession } from '../../mock/salaryAgentTicketsStore.js'

const router = useRouter()
const route = useRoute()
const showDev = route.query.dev === '1'

function openSession (s) {
  loadSession(s.id)
  router.push({ path: '/mobile-salary-agent', query: { session: s.id } })
}
function goBack () { router.push('/mobile-salary-agent') }
</script>

<style scoped>
.m-page { min-height: 100vh; background: #f5f5f5; padding-bottom: 24px; }
.page-header { position: sticky; top: 0; z-index: 10; height: 48px; background: #fff; display: flex; align-items: center; padding: 0 12px; gap: 8px; border-bottom: 1px solid #f0e7ea; }
.page-header h1 { font-size: 16px; font-weight: 500; color: #262626; flex: 1; margin: 0; }
.back-icon { font-size: 20px; color: #595959; }

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
.sc-ended { font-size: 11px; padding: 3px 8px; border-radius: 10px; flex: none; background: #f1efe8; color: #5f5e5a; }
.sc-meta { display: flex; gap: 10px; font-size: 11px; color: #bfbfbf; margin: 6px 0 8px; }
.sc-foot { display: flex; align-items: center; justify-content: space-between; }
.sc-ticket { font-size: 11px; color: #a40035; background: #fceff2; border-radius: 8px; padding: 2px 8px; }
.sc-plain { font-size: 11px; color: #8c8c8c; }
.sc-arrow { font-size: 12px; color: #bfbfbf; }
.bottom-note { font-size: 11px; color: #bfbfbf; line-height: 1.6; margin: 4px 2px 0; }
</style>
