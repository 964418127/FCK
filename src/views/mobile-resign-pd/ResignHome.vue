<template>
  <div class="pd-home">
    <div class="page-header">
      <el-icon class="back-icon" @click="goBack"><ArrowLeft /></el-icon>
      <h1>离职处理</h1>
    </div>

    <!-- Tab：主动离职 / 异常监控 -->
    <div class="tabs">
      <div :class="['tab', { on: tab === 'apply' }]" @click="tab = 'apply'">
        主动离职
        <span v-if="pendingCount" class="tab-dot">{{ pendingCount }}</span>
      </div>
      <div :class="['tab', { on: tab === 'monitor' }]" @click="tab = 'monitor'">
        异常监控
        <span v-if="monitorCount" class="tab-dot">{{ monitorCount }}</span>
      </div>
    </div>

    <div class="content">
      <div class="search-row">
        <el-input v-model="keyword" placeholder="按姓名 / 工号搜索" clearable :prefix-icon="Search" size="default" />
      </div>

      <!-- ---------- 主动离职 ---------- -->
      <template v-if="tab === 'apply'">
        <div class="filter-row">
          <span
            v-for="f in filters"
            :key="f.value"
            :class="['fl-chip', { on: statusFilter === f.value }]"
            @click="statusFilter = f.value"
          >
            {{ f.label }}<em v-if="f.count">{{ f.count }}</em>
          </span>
        </div>

        <div v-for="c in applyList" :key="c.id" class="case-card" @click="open(c)">
          <span :class="['corner', cornerOf(c).tone]">{{ cornerOf(c).text }}</span>
          <div class="case-top">
            <div class="avatar"><el-icon><User /></el-icon></div>
            <div class="case-head">
              <div class="name-row">
                <span class="case-name">{{ c.name }}</span>
                <span class="persona-chip">{{ personaLabelOf(c) }}</span>
                <span :class="['st', c.status === 'pending' ? 'pending' : 'withdrawn']">{{ statusLabel(c) }}</span>
              </div>
              <div class="case-meta">岗龄：{{ c.tenureYears }} 年 | {{ c.job }} · {{ orgTextOf(c) }}</div>
              <div class="case-date">申请日期：{{ c.appliedAt.slice(0, 10) }}</div>
            </div>
          </div>
          <div :class="['handover-line', handoverOf(c).tone]">
            <span class="hl-k">交接</span>
            <span class="hl-v">{{ handoverText(c) }}</span>
            <span v-if="handoverOf(c).tone === 'warn'" class="hl-go">去处理 ›</span>
          </div>
        </div>
        <div v-if="!applyList.length" class="empty-text">没有匹配的离职申请</div>
      </template>

      <!-- ---------- 异常监控 ---------- -->
      <template v-else-if="tab === 'monitor'">
        <div v-for="c in monitorList" :key="c.id" class="mon-card">
          <span class="corner warn">未处理</span>
          <div class="case-top">
            <div class="avatar"><el-icon><User /></el-icon></div>
            <div class="case-head">
              <div class="name-row">
                <span class="case-name">{{ c.name }}</span>
                <span class="mon-no">{{ c.staffNo }}</span>
                <span class="mon-job">{{ c.job }}</span>
                <span class="persona-chip">{{ personaLabelOf(c) }}</span>
                <span class="mon-level">{{ c.level }}</span>
              </div>
              <div class="case-meta">{{ c.age }}岁 | {{ c.gender }} | 工龄：{{ c.tenureYears }} 年 | 评分：{{ c.score }}</div>
              <div class="kv"><span>合同门店</span><b>{{ c.store }}</b></div>
              <div class="kv"><span>用工状态</span><b>{{ c.workState }}</b></div>
              <div class="kv">
                <span>手机号</span>
                <b>{{ c.phone }}</b>
                <el-icon class="phone-icon"><Phone /></el-icon>
              </div>
            </div>
          </div>

          <div class="alert-row">未出勤{{ c.absentDays }}天</div>

          <div class="handover-line muted">
            <span class="hl-k">交接</span>
            <span class="hl-v">被动离职：按岗位模板生成清单，转事后补录、不阻塞解除</span>
          </div>

          <div class="mon-actions">
            <button class="ghost-btn" @click="pause(c)">暂停用工</button>
            <button class="solid-btn" @click="goRelease(c)">解除用工</button>
          </div>
        </div>
        <div v-if="!monitorList.length" class="empty-text">没有匹配的异常项</div>

        <el-button type="primary" class="pd-btn full" @click="addMonitor">新增异常监控</el-button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Search, User, Phone } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  applyCases,
  monitorCases,
  personaLabelOf,
  orgTextOf,
  statusLabel,
  admissionOf,
  admissionReviewersOf
} from '../../mock/mobileResignPd.js'
import { gateStatusOf, progressOf, blockerOf } from '../../mock/resignHandoverPd.js'

const router = useRouter()
const tab = ref('apply')
const keyword = ref('')
const statusFilter = ref('all')

const match = (c) => {
  const k = keyword.value.trim()
  if (!k) return true
  return c.name.includes(k) || c.staffNo.includes(k)
}

/* 状态筛选：按交接门禁 + 单据状态合成一列，人事一眼看到「卡在哪一类」 */
const filters = computed(() => {
  const list = applyCases
  return [
    { value: 'all', label: '全部', count: list.length },
    { value: 'confirm', label: '待审核', count: list.filter((c) => admissionOf(c) === 'pending').length },
    { value: 'handover', label: '交接中', count: list.filter((c) => admissionOf(c) === 'approved' && gateStatusOf(c.id) === 'running').length },
    { value: 'pending', label: '待签署', count: list.filter((c) => c.status === 'pending' && admissionOf(c) === 'approved' && gateStatusOf(c.id) === 'passed').length },
    { value: 'released', label: '已办结', count: list.filter((c) => c.status === 'released').length },
    { value: 'void', label: '已作废', count: list.filter((c) => c.status === 'void').length }
  ]
})

const byStatus = (c) => {
  const g = gateStatusOf(c.id)
  const adm = admissionOf(c)
  if (statusFilter.value === 'all') return true
  if (statusFilter.value === 'confirm') return adm === 'pending'
  if (statusFilter.value === 'handover') return adm === 'approved' && g === 'running'
  if (statusFilter.value === 'pending') return c.status === 'pending' && adm === 'approved' && g === 'passed'
  if (statusFilter.value === 'released') return c.status === 'released'
  if (statusFilter.value === 'void') return c.status === 'void'
  return true
}

const applyList = computed(() => applyCases.filter(match).filter(byStatus))
const monitorList = computed(() => monitorCases.filter(match))
const pendingCount = computed(() => applyCases.filter(c => c.status === 'pending').length)
const monitorCount = computed(() => monitorCases.length)

const handoverOf = (c) => {
  if (admissionOf(c) === 'pending') return { tone: 'muted' }
  const g = gateStatusOf(c.id)
  if (g === 'passed') return { tone: 'ok' }
  if (g === 'terminated') return { tone: 'danger' }
  if (g === 'not-started') return { tone: 'muted' }
  return { tone: 'warn' }
}

const handoverText = (c) => {
  if (admissionOf(c) === 'pending') {
    const rs = admissionReviewersOf(c)
    return `离职需求审核中 · 审核人 ${rs.map(r => r.name + '（' + r.role + '）').join('、')}`
  }
  const g = gateStatusOf(c.id)
  if (g === 'not-started') return '未发起交接'
  const p = progressOf(c.id)
  const b = blockerOf(c.id)
  if (g === 'terminated') return `未通过 · 单据已作废（${b ? b.owner + ' 判不通过' : '必过节点不通过'}）`
  if (g === 'passed') return `已完成 ${p.text}，离职合同已自动发出，待员工在线签署`
  return `${p.text}${b ? ' · 卡在 ' + b.owner + '（' + b.roleLabel + '）' : ''}`
}

const cornerOf = (c) => {
  if (c.status === 'void') return { text: '已作废', tone: 'danger' }
  if (c.status === 'released') return { text: '已办结', tone: 'muted' }
  if (admissionOf(c) === 'pending') return { text: '待审核', tone: 'warn' }
  const g = gateStatusOf(c.id)
  if (g === 'running') return { text: '交接中', tone: 'warn' }
  if (g === 'passed') return { text: '待签署', tone: 'ok' }
  return { text: '待审核', tone: 'warn' }
}

/* 审核没过不进详情审批：待审核落详情（做离职需求审核），交接没走完落交接进度 */
const open = (c) => {
  if (admissionOf(c) === 'pending') {
    router.push({ name: 'mobile-resign-pd-detail', query: { id: c.id } })
    return
  }
  const g = gateStatusOf(c.id)
  if (g === 'passed') router.push({ name: 'mobile-resign-pd-detail', query: { id: c.id } })
  else router.push({ name: 'mobile-resign-handover', query: { id: c.id } })
}

const goRelease = (c) => router.push({ name: 'mobile-resign-pd-release', query: { id: c.id } })
const goBack = () => router.push('/mobile-menu')

const pause = (c) => ElMessage.warning(`「${c.name}」已标记暂停用工（原型演示，不写库）`)
const addMonitor = () => ElMessage.info('新增异常监控（原型演示）')
</script>

<style scoped>
.pd-home { min-height: 100vh; height: 100vh; overflow-y: auto; background: #f5f5f5; -webkit-overflow-scrolling: touch; }
.page-header { display: flex; align-items: center; gap: 10px; padding: 14px 16px; background: #fff; position: sticky; top: 0; z-index: 20; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
.back-icon { font-size: 22px; color: #333; }
.page-header h1 { flex: 1; text-align: center; font-size: 17px; font-weight: 600; margin: 0; }
.pd-tag { font-size: 11px; color: #a40035; border: 1px solid #a40035; border-radius: 10px; padding: 1px 7px; }

.tabs { display: flex; background: #fff; border-bottom: 1px solid #f0f0f0; position: sticky; top: 51px; z-index: 19; }
.tab { flex: 1; text-align: center; padding: 12px 0; font-size: 14px; color: #666; position: relative; }
.tab.on { color: #a40035; font-weight: 600; }
.tab.on::after { content: ''; position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); width: 34px; height: 2.5px; border-radius: 2px; background: #a40035; }
.tab-dot { display: inline-block; margin-left: 4px; min-width: 16px; height: 16px; line-height: 16px; padding: 0 4px; border-radius: 8px; background: #a40035; color: #fff; font-size: 10px; font-weight: 600; }

.content { padding: 12px 12px 28px; }

.search-row { margin-bottom: 12px; }

.filter-row { display: flex; gap: 6px; overflow-x: auto; margin-bottom: 10px; padding-bottom: 2px; }
.fl-chip { flex-shrink: 0; font-size: 12px; color: #666; background: #fff; border: 1px solid #eceaec; border-radius: 14px; padding: 4px 11px; }
.fl-chip.on { color: #a40035; border-color: #f2ccd8; background: #fff5f7; font-weight: 600; }
.fl-chip em { font-style: normal; margin-left: 4px; font-size: 10.5px; color: #b9b3b5; }
.fl-chip.on em { color: #a40035; }

.handover-line { display: flex; align-items: center; gap: 6px; margin-top: 10px; padding: 7px 9px; border-radius: 8px; font-size: 11.5px; background: #fafafa; }
.handover-line .hl-k { flex-shrink: 0; color: #a3a0a1; }
.handover-line .hl-v { flex: 1; color: #666; line-height: 1.55; }
.handover-line .hl-go { flex-shrink: 0; color: #a40035; font-weight: 500; }
.handover-line.warn { background: #fff8ec; }
.handover-line.warn .hl-v { color: #b45309; }
.handover-line.ok { background: #f2faf4; }
.handover-line.ok .hl-v { color: #2f7d4f; }
.handover-line.danger { background: #fdf0f0; }
.handover-line.danger .hl-v { color: #8a2b2b; }

.case-card { position: relative; background: #fff; border-radius: 12px; padding: 14px; margin-bottom: 10px; overflow: hidden; }
.case-card:active { background: #fafafa; }
.corner { position: absolute; right: 0; top: 0; font-size: 10.5px; padding: 3px 9px; border-bottom-left-radius: 10px; color: #fff; }
.corner.warn { background: #e0a300; }
.corner.muted { background: #b9b3b5; }
.corner.danger { background: #c0392b; }

.case-top { display: flex; gap: 12px; }
.avatar { width: 44px; height: 44px; flex-shrink: 0; border-radius: 50%; background: #f2f2f2; color: #bbb; display: flex; align-items: center; justify-content: center; font-size: 20px; }
.case-head { flex: 1; min-width: 0; }
.name-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 5px; }
.case-name { font-size: 16px; font-weight: 600; color: #333; }
.st { font-size: 10.5px; font-weight: 500; line-height: 1.5; padding: 1px 7px; border-radius: 9px; flex-shrink: 0; }
.st.pending { color: #2f7d5a; background: #eaf5ef; }
.st.withdrawn { color: #8a8586; background: #f3f0f1; }
.case-meta { font-size: 12px; color: #888; line-height: 1.7; }
.case-date { font-size: 12px; color: #aaa; margin-top: 2px; }
.kv { display: flex; align-items: baseline; gap: 6px; font-size: 12px; color: #888; line-height: 1.8; }
.kv b { color: #333; font-weight: 500; }
.phone-icon { color: #a40035; font-size: 15px; margin-left: 2px; }

.mon-no { font-size: 12px; color: #999; }
.mon-job, .mon-level { font-size: 11px; color: #666; background: #f5f5f5; border-radius: 4px; padding: 1px 6px; }
.persona-chip { font-size: 10.5px; font-weight: 500; color: #a40035; background: #fdeef2; border-radius: 9px; padding: 1px 7px; }

.mon-card { position: relative; background: #fff; border-radius: 12px; padding: 14px; margin-bottom: 10px; overflow: hidden; }
.alert-row { margin-top: 10px; font-size: 12.5px; color: #b45309; background: #fef7ec; border-radius: 8px; padding: 8px 10px; }
.mon-actions { display: flex; gap: 10px; margin-top: 12px; justify-content: flex-end; }
.ghost-btn, .solid-btn { font-size: 12.5px; padding: 7px 16px; border-radius: 18px; background: #fff; }
.ghost-btn { color: #666; border: 1px solid #dcdcdc; }
.solid-btn { color: #a40035; border: 1px solid #a40035; font-weight: 600; }

.pd-btn { background: #a40035; border-color: #a40035; }
.pd-btn.full { width: 100%; margin-top: 8px; }
.empty-text { font-size: 13px; color: #999; padding: 18px 0; text-align: center; }
</style>
