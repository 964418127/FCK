<template>
  <div class="pd-home">
    <div class="page-header">
      <el-icon class="back-icon" @click="goBack"><ArrowLeft /></el-icon>
      <h1>交接处理</h1>
    </div>

    <div class="content">
      <div class="search-row">
        <el-input v-model="keyword" placeholder="按姓名 / 工号搜索" clearable :prefix-icon="Search" size="default" />
      </div>

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

      <div v-for="t in visibleList" :key="t.inst.caseId + '-' + t.node.id" :class="['todo-card', { read: t.st !== 'running' }]" @click="t.st === 'running' && goNode(t)">
        <span :class="['corner', cornerOf(t)]">{{ cornerTextOf(t) }}</span>
        <div class="todo-top">
          <div class="avatar"><el-icon><User /></el-icon></div>
          <div class="todo-head">
            <div class="name-row">
              <span class="todo-name">{{ t.c.name }}</span>
              <span class="todo-no">{{ t.c.staffNo }}</span>
              <span class="persona-chip">{{ personaLabelOf(t.c) }}</span>
            </div>
            <div class="todo-meta">{{ t.c.job }} · {{ orgTextOf(t.c) }}</div>
          </div>
        </div>
        <div :class="['node-line', { muted: t.st !== 'running' }]">
          <span class="nl-k">{{ t.st === 'running' ? '待办节点' : '节点' }}</span>
          <span class="nl-v">
            {{ t.node.name }}<i v-if="t.st === 'running'" class="nl-n">{{ t.node.tasks.length }} 件待确认</i>
          </span>
          <span v-if="t.st === 'running'" class="nl-go">去处理 ›</span>
          <span v-else :class="['nl-st', t.st]">{{ stateLabelOf(t.st) }}</span>
        </div>
        <div v-if="t.st === 'running'" class="todo-sub">交接开始：{{ t.inst.startedAt }}<span v-if="t.inst.passive"> · 异常监控（被动离职）</span></div>
        <div v-else class="todo-sub">办结时间：{{ t.rec?.at || '—' }}<span v-if="t.rec?.by"> · 确认人 {{ t.rec.by }}</span></div>
      </div>
      <div v-if="!visibleList.length" class="empty-text">没有匹配的交接记录</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Search, User } from '@element-plus/icons-vue'
import { caseOf, orgTextOf, personaLabelOf } from '../../mock/mobileResignPd.js'
import {
  handoverInstances, handoverRoles, roleOwners,
  templateOf, isSystemNode, nodeStateOf, ownerOf, stateLabelOf
} from '../../mock/resignHandoverPd.js'

const router = useRouter()
const route = useRoute()
const keyword = ref('')
const statusFilter = ref('all')

/* 原型模拟「当前登录人」：负责人按角色自动定位（正式实现取账号组织角色解析）。
   演示参数 ?who=<姓名> 可换人看，界面上不暴露切换入口。 */
const whoParam = typeof route.query.who === 'string' ? route.query.who : ''
const me = ref(
  whoParam && handoverRoles.some(r => roleOwners[r.key] === whoParam)
    ? whoParam
    : roleOwners[handoverRoles[0].key]
)

const SETTLED = ['done', 'rejected', 'skipped']
const nodesOf = (inst) => templateOf(inst.templateId)?.nodes || []

/* 我的全部交接记录：待处理（当前可办）+ 已处理（办结留痕）；还没轮到 / 因终止关闭的不出现 */
const myList = computed(() => {
  const out = []
  for (const inst of Object.values(handoverInstances)) {
    /* 历史完成单（旧版模板、无节点实例）没有可办节点 */
    if (inst.status === 'done' && !inst.nodes) continue
    for (const n of nodesOf(inst)) {
      if (isSystemNode(n) || ownerOf(n) !== me.value) continue
      const st = nodeStateOf(inst, n.id)
      if (st === 'running' || SETTLED.includes(st)) {
        out.push({ inst, node: n, c: caseOf(inst.caseId), st, rec: inst.nodes?.[n.id] || null })
      }
    }
  }
  /* 待处理在前，已处理按时间倒序在后 */
  return out.sort((a, b) => (a.st === 'running' ? 0 : 1) - (b.st === 'running' ? 0 : 1))
})

const filters = computed(() => [
  { value: 'all', label: '全部', count: myList.value.length },
  { value: 'running', label: '待处理', count: myList.value.filter((t) => t.st === 'running').length },
  { value: 'done', label: '已完成', count: myList.value.filter((t) => t.st === 'done').length },
  { value: 'rejected', label: '不通过', count: myList.value.filter((t) => t.st === 'rejected').length },
  { value: 'skipped', label: '已跳过', count: myList.value.filter((t) => t.st === 'skipped').length }
])

const visibleList = computed(() => {
  const k = keyword.value.trim()
  return myList.value.filter((t) => {
    if (statusFilter.value !== 'all' && t.st !== statusFilter.value) return false
    if (!k) return true
    return t.c.name.includes(k) || t.c.staffNo.includes(k)
  })
})

const cornerOf = (t) => (t.st === 'running' ? (t.node.gate === 'must' ? 'warn' : 'muted') : t.st === 'rejected' ? 'danger' : 'muted2')
const cornerTextOf = (t) => (t.st === 'running' ? (t.node.gate === 'must' ? '必过' : '可选') : t.st === 'rejected' ? '不通过' : '已办结')

const goNode = (t) => router.push({ name: 'mobile-resign-handover-node', query: { id: t.inst.caseId, nodeId: t.node.id } })
const goBack = () => router.push('/mobile-menu')
</script>

<style scoped>
.pd-home { min-height: 100vh; height: 100vh; overflow-y: auto; background: #f5f5f5; -webkit-overflow-scrolling: touch; }
.page-header { display: flex; align-items: center; gap: 10px; padding: 14px 16px; background: #fff; position: sticky; top: 0; z-index: 20; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
.back-icon { font-size: 22px; color: #333; }
.page-header h1 { flex: 1; text-align: center; font-size: 17px; font-weight: 600; margin: 0; }

.content { padding: 12px 12px 28px; }
.search-row { margin-bottom: 10px; }

.filter-row { display: flex; gap: 6px; overflow-x: auto; margin-bottom: 10px; padding-bottom: 2px; }
.fl-chip { flex-shrink: 0; font-size: 12px; color: #666; background: #fff; border: 1px solid #eceaec; border-radius: 14px; padding: 4px 11px; }
.fl-chip.on { color: #a40035; border-color: #f2ccd8; background: #fff5f7; font-weight: 600; }
.fl-chip em { font-style: normal; margin-left: 4px; font-size: 10.5px; color: #b9b3b5; }
.fl-chip.on em { color: #a40035; }

.todo-card { position: relative; background: #fff; border-radius: 12px; padding: 14px; margin-bottom: 10px; overflow: hidden; }
.todo-card:active { background: #fafafa; }
.todo-card.read { opacity: .88; }
.corner { position: absolute; right: 0; top: 0; font-size: 10.5px; padding: 3px 9px; border-bottom-left-radius: 10px; color: #fff; }
.corner.warn { background: #e0a300; }
.corner.muted { background: #b9b3b5; }
.corner.muted2 { background: #8fae7e; }
.corner.danger { background: #c0392b; }

.todo-top { display: flex; gap: 12px; align-items: flex-start; }
.avatar { width: 42px; height: 42px; flex-shrink: 0; border-radius: 50%; background: #f2f2f2; color: #bbb; display: flex; align-items: center; justify-content: center; font-size: 19px; }
.todo-head { flex: 1; min-width: 0; }
.name-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px; }
.todo-name { font-size: 16px; font-weight: 600; color: #333; }
.todo-no { font-size: 12px; color: #999; }
.todo-meta { font-size: 12px; color: #888; }

.node-line { display: flex; align-items: center; gap: 6px; margin-top: 10px; padding: 8px 10px; border-radius: 8px; font-size: 12.5px; background: #fff8ec; }
.node-line.muted { background: #f7f7f8; }
.nl-k { flex-shrink: 0; color: #a3876a; font-size: 11.5px; }
.node-line.muted .nl-k { color: #a3a0a1; }
.nl-v { flex: 1; color: #b45309; font-weight: 500; }
.node-line.muted .nl-v { color: #666; }
.nl-n { font-style: normal; font-weight: 400; font-size: 11px; color: #c4925a; margin-left: 6px; }
.nl-go { flex-shrink: 0; color: #a40035; font-weight: 600; }
.nl-st { flex-shrink: 0; font-size: 11px; border-radius: 8px; padding: 1px 8px; }
.nl-st.done { color: #3b6d11; background: #eaf3de; }
.nl-st.rejected { color: #a32d2d; background: #fcebeb; }
.nl-st.skipped { color: #888780; background: #f1efe8; }
.todo-sub { margin-top: 7px; font-size: 11.5px; color: #a3a0a1; }

.persona-chip { font-size: 10.5px; font-weight: 500; color: #a40035; background: #fdeef2; border-radius: 9px; padding: 1px 7px; }
.empty-text { font-size: 13px; color: #999; padding: 18px 0; text-align: center; }
</style>
