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
        <div v-for="c in applyList" :key="c.id" class="case-card" @click="goDetail(c)">
          <span :class="['corner', c.status === 'pending' ? 'warn' : 'muted']">{{ badgeOf(c) }}</span>
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
  badgeOf,
  personaLabelOf,
  orgTextOf,
  statusLabel
} from '../../mock/mobileResignPd.js'

const router = useRouter()
const tab = ref('apply')
const keyword = ref('')

const match = (c) => {
  const k = keyword.value.trim()
  if (!k) return true
  return c.name.includes(k) || c.staffNo.includes(k)
}

const applyList = computed(() => applyCases.filter(match))
const monitorList = computed(() => monitorCases.filter(match))
const pendingCount = computed(() => applyCases.filter(c => c.status === 'pending').length)
const monitorCount = computed(() => monitorCases.length)

const goDetail = (c) => router.push({ name: 'mobile-resign-pd-detail', query: { id: c.id } })
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

.case-card { position: relative; background: #fff; border-radius: 12px; padding: 14px; margin-bottom: 10px; overflow: hidden; }
.case-card:active { background: #fafafa; }
.corner { position: absolute; right: 0; top: 0; font-size: 10.5px; padding: 3px 9px; border-bottom-left-radius: 10px; color: #fff; }
.corner.warn { background: #e0a300; }
.corner.muted { background: #b9b3b5; }

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
