<!--
  移动端 · 事项办理（列表）
  一件事发起来之后，处理人在这里看「现在轮到谁」；点进去就是把这一环办掉。
  状态不按单据状态分，按「轮到我 / 在等别人 / 已办结」分 —— 处理人只关心这个。
-->
<template>
  <div class="m-page">
    <div class="page-header">
      <el-icon class="back-icon" @click="goBack"><ArrowLeft /></el-icon>
      <h1>事项办理</h1>
      <!-- 原型辅助：正式开发就是登录账号，不需要切换；这里只用于演示不同处理人的视角 -->
      <span class="persona-hint" title="原型演示：切换处理人视角（正式开发为登录账号，无需切换）" @click="cyclePersona">{{ me?.name || '—' }}</span>
    </div>

    <div class="content">
      <div class="search-row">
        <el-input v-model="keyword" placeholder="按事件 / 员工 / 单号搜索" clearable :prefix-icon="Search" />
      </div>

      <div class="filter-row">
        <span
          v-for="f in filters" :key="f.value"
          :class="['fl-chip', { on: tab === f.value }]"
          @click="tab = f.value"
        >{{ f.label }}<em v-if="f.count">{{ f.count }}</em></span>
      </div>

      <div v-for="c in list" :key="c.id" class="case-card" @click="open(c)">
        <span :class="['corner', c.tone]">{{ c.tag }}</span>
        <div class="c-top">
          <span class="ev-name">{{ c.eventName }}</span>
          <span class="c-code">{{ c.code }}</span>
        </div>
        <div class="c-emp">{{ c.emp.name }} · {{ c.emp.job }} · {{ c.emp.store }}</div>
        <div :class="['now-line', c.tone]">
          <span class="nl-k">{{ c.tone === 'warn' ? '待办' : c.tone === 'ok' ? '结果' : '当前' }}</span>
          <span class="nl-v">{{ c.now }}</span>
          <span class="nl-go">›</span>
        </div>
        <div class="prog-line">
          <div class="bar"><i :style="{ width: c.pct + '%' }"></i></div>
          <span class="pg">{{ c.done }}/{{ c.total }}</span>
        </div>
      </div>

      <div v-if="!list.length" class="empty-text">没有匹配的事项</div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Search } from '@element-plus/icons-vue'
import { v2state, getEvent, resolveForInstance, setMe } from '../../../v2/store.js'
import { progressOf, nowTextOf, todoOf, myTodoOf, identitiesOf, instStateLabel } from '../../../v2/instance.js'

const router = useRouter()
const keyword = ref('')
const tab = ref('todo')

const treeOf = (inst) => resolveForInstance(inst).tree
const me = computed(() => v2state.me)
/**
 * 可切换的处理人视角：按「手上还有几项待办」从多到少排，所以轮换第一下就落到有话可看的人；
 * 没待办的排在后面（他们在这一单里只读）。
 */
const pool = computed(() => {
  const base = identitiesOf(v2state.instances, treeOf)
  const pendingOf = (p) => v2state.instances.reduce((n, inst) => n + myTodoOf(inst, treeOf(inst), p).length, 0)
  return base
    .map((p) => ({ p, n: pendingOf(p) }))
    .sort((a, b) => b.n - a.n)
    .map((x) => x.p)
})

const pendingOf = (p) => v2state.instances.reduce((n, inst) => n + myTodoOf(inst, treeOf(inst), p).length, 0)

/* 身份默认给「手上真有活」的那一个，否则打开就是一片空 */
onMounted(() => {
  if (me.value) return
  const cand = pool.value.find((p) => pendingOf(p))
  setMe(cand || pool.value[0] || null)
})
/** 原型辅助：点页角的名字依次换处理人视角（正式开发为登录账号） */
const cyclePersona = () => {
  if (!pool.value.length) return
  const i = pool.value.findIndex((p) => p.name === me.value?.name)
  const next = pool.value[(i + 1) % pool.value.length] || null
  setMe(next)
  tab.value = next && pendingOf(next) ? 'todo' : 'all'   // 手上没活时直接看全部，别让人对着空列表
}

const rows = computed(() => v2state.instances.map((inst) => {
  const ev = getEvent(inst.eventKey)
  const tree = treeOf(inst)
  const prog = progressOf(inst, tree)
  const now = nowTextOf(inst, tree, me.value)
  const todo = todoOf(inst, tree)
  const mine = myTodoOf(inst, tree, me.value)
  const tag = inst.state === 'terminated' ? '已终止' : inst.state === 'done' ? '已办结' : mine.length ? '待办' : todo.length ? '流转中' : '在等系统'
  return {
    id: inst.id,
    code: inst.code,
    eventName: ev?.name || inst.eventKey,
    emp: inst.emp,
    ...prog,
    now: now.text,
    tag,
    tone: inst.state === 'terminated' ? 'danger' : inst.state === 'done' ? 'muted' : mine.length ? 'warn' : 'info',
    mine: mine.length > 0,
    stateText: instStateLabel(inst.state)
  }
}))

const mineCount = computed(() => rows.value.filter((r) => r.mine).length)
const filters = computed(() => [
  { value: 'todo', label: '轮到我', count: rows.value.filter((r) => r.mine).length },
  { value: 'running', label: '流转中', count: rows.value.filter((r) => r.tone === 'info').length },
  { value: 'done', label: '已办结', count: rows.value.filter((r) => r.tone === 'muted').length },
  { value: 'all', label: '全部', count: rows.value.length }
])

const list = computed(() => {
  const k = keyword.value.trim()
  return rows.value
    .filter((r) => {
      if (tab.value === 'todo') return r.mine
      if (tab.value === 'running') return r.tone === 'info'
      if (tab.value === 'done') return r.tone === 'muted'
      return true
    })
    .filter((r) => !k || r.eventName.includes(k) || r.emp.name.includes(k) || r.code.includes(k) || r.emp.empNo.includes(k))
})

const open = (c) => router.push({ name: 'v2-m-instance', query: { id: c.id } })
const goBack = () => router.push('/mobile-menu')
</script>

<style scoped>
.m-page { min-height: 100vh; height: 100vh; overflow-y: auto; background: #f5f5f5; -webkit-overflow-scrolling: touch; }
.page-header { display: flex; align-items: center; gap: 10px; padding: 14px 16px; background: #fff; position: sticky; top: 0; z-index: 20; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
.back-icon { font-size: 22px; color: #333; }
.page-header h1 { flex: 1; text-align: center; font-size: 17px; font-weight: 600; margin: 0; }
.hd-sp { width: 22px; }

.content { padding: 12px 12px 28px; }
.persona-hint { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 10.5px; color: #cdc7c9; letter-spacing: .3px; padding: 2px 4px; user-select: none; }
.persona-hint:active { color: #a40035; }

.search-row { margin-bottom: 12px; }

.filter-row { display: flex; gap: 6px; overflow-x: auto; margin-bottom: 10px; padding-bottom: 2px; }
.fl-chip { flex-shrink: 0; font-size: 12px; color: #666; background: #fff; border: 1px solid #eceaec; border-radius: 14px; padding: 4px 11px; }
.fl-chip.on { color: #a40035; border-color: #f2ccd8; background: #fff5f7; font-weight: 600; }
.fl-chip em { font-style: normal; margin-left: 4px; font-size: 10.5px; color: #b9b3b5; }
.fl-chip.on em { color: #a40035; }

.case-card { position: relative; background: #fff; border-radius: 12px; padding: 14px; margin-bottom: 10px; overflow: hidden; }
.case-card:active { background: #fafafa; }
.corner { position: absolute; right: 0; top: 0; font-size: 10.5px; padding: 3px 9px; border-bottom-left-radius: 10px; color: #fff; }
.corner.warn { background: #e0a300; }
.corner.info { background: #7a8aa0; }
.corner.muted { background: #b9b3b5; }
.corner.danger { background: #c0392b; }

.c-top { display: flex; align-items: baseline; gap: 8px; padding-right: 54px; }
.ev-name { font-size: 16px; font-weight: 600; color: #333; }
.c-code { font-size: 11px; color: #aaa; font-family: ui-monospace, monospace; }
.c-emp { font-size: 12px; color: #888; margin-top: 5px; }

.now-line { display: flex; align-items: center; gap: 6px; margin-top: 10px; padding: 7px 9px; border-radius: 8px; font-size: 12px; background: #fafafa; }
.nl-k { flex-shrink: 0; color: #a3a0a1; }
.nl-v { flex: 1; color: #666; line-height: 1.55; }
.nl-go { flex-shrink: 0; color: #bbb; font-size: 15px; }
.now-line.warn { background: #fff8ec; }
.now-line.warn .nl-v { color: #b45309; }
.now-line.warn .nl-go { color: #b45309; }
.now-line.info { background: #f4f6f9; }
.now-line.info .nl-v { color: #5c6b80; }
.now-line.ok { background: #f2faf4; }
.now-line.ok .nl-v { color: #2f7d4f; }
.now-line.danger { background: #fdf0f0; }
.now-line.danger .nl-v { color: #8a2b2b; }

.prog-line { display: flex; align-items: center; gap: 8px; margin-top: 10px; }
.bar { flex: 1; height: 4px; border-radius: 2px; background: #f0eef4; overflow: hidden; }
.bar i { display: block; height: 100%; background: #a40035; border-radius: 2px; }
.pg { font-size: 11px; color: #a3a0a1; }

.empty-text { font-size: 13px; color: #999; padding: 24px 0; text-align: center; }
</style>
