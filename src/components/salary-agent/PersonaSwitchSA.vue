<!--
  薪酬咨询助手 · 视角切换（演示辅具，不是功能）
  与排班 v5 的 PersonaSwitch5 同一套视觉：页头一个灰色姓名 + 小三角，点开搜索 + 列表。
  低调常驻（不靠 ?dev=1 隐藏）：title 写明演示用，正式开发按登录员工。
  演示看点标记 = 该员工名下有几张工单（带数字的人有工单可看）。
-->
<template>
  <div ref="root" class="ps">
    <button class="ps-trigger" :title="tip" @click.stop="open = !open">
      <span class="ps-name">{{ me?.name || '—' }}</span>
      <i class="ps-caret" :class="{ on: open }"></i>
    </button>

    <div v-if="open" class="ps-pop" @click.stop>
      <div class="ps-h">切换视角 <span class="ps-hint">带数字的人有工单演示</span></div>
      <input v-model="kw" class="ps-q" placeholder="按姓名 / 岗位找" />
      <div class="ps-list">
        <button
          v-for="p in shown"
          :key="p.id"
          :class="['ps-row', { on: p.id === me?.id }]"
          @click="choose(p.id)"
        >
          <span class="ps-n">{{ p.name }}</span>
          <span class="ps-m">{{ p.position }}</span>
          <span v-if="ticketCount[p.id]" class="ps-demo">{{ ticketCount[p.id] }} 单</span>
          <span v-if="p.id === me?.id" class="ps-ok">当前</span>
        </button>
        <div v-if="!shown.length" class="ps-empty">没这个人</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { SA_PEOPLE } from '../../mock/salaryAgentTickets.js'
import { meId, setMe, allTickets } from '../../mock/salaryAgentTicketsStore.js'

const emit = defineEmits(['pick'])
const open = ref(false)
const root = ref(null)
const tip = '切换查看视角（演示用；正式开发按登录员工）'

const me = computed(() => SA_PEOPLE.find(p => p.id === meId.value) || null)
const staff = SA_PEOPLE.filter(p => p.id !== 'HR-01')

/** 演示看点：每个人名下工单数 */
const ticketCount = computed(() => {
  const m = {}
  for (const t of allTickets.value) m[t.employeeId] = (m[t.employeeId] || 0) + 1
  return m
})

const kw = ref('')
const shown = computed(() => {
  const k = kw.value.trim()
  if (!k) return staff
  return staff.filter(p => `${p.name}${p.position}${p.id}`.includes(k))
})

function choose (id) {
  setMe(id)
  emit('pick', id)
  open.value = false
}

const onDoc = e => {
  if (open.value && root.value && !root.value.contains(e.target)) open.value = false
}
onMounted(() => document.addEventListener('click', onDoc))
onBeforeUnmount(() => document.removeEventListener('click', onDoc))
</script>

<style scoped>
.ps { position: relative; flex: none; }

.ps-trigger { display: inline-flex; align-items: center; gap: 4px; padding: 2px 4px; border: 0; background: none; font-size: 12px; color: #6a6a75; letter-spacing: .3px; cursor: pointer; user-select: none; }
.ps-trigger:active, .ps-trigger:hover { color: #a40035; }
.ps-name { max-width: 64px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ps-caret { width: 0; height: 0; border-left: 3px solid transparent; border-right: 3px solid transparent; border-top: 3.5px solid currentColor; opacity: .8; transition: transform .15s; }
.ps-caret.on { transform: rotate(180deg); }

.ps-pop { position: absolute; top: calc(100% + 6px); right: -6px; z-index: 40; width: 232px; padding: 6px; background: #fff; border: 1px solid #f0eef0; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,.10); }
.ps-h { padding: 3px 8px 4px; font-size: 10.5px; color: #b0aaac; letter-spacing: .3px; display: flex; align-items: baseline; justify-content: space-between; gap: 6px; }
.ps-hint { font-size: 9.5px; color: #cdc7c9; letter-spacing: 0; }
.ps-q { display: block; width: 100%; box-sizing: border-box; margin: 0 0 4px; padding: 5px 8px; border: 0; border-bottom: 1px dashed #efecee; background: none; font-size: 11.5px; color: #333; outline: none; }
.ps-q::placeholder { color: #c3bec0; }
.ps-list { max-height: 300px; overflow-y: auto; -webkit-overflow-scrolling: touch; }
.ps-empty { padding: 12px 8px; font-size: 11.5px; color: #b0aaac; text-align: center; }

.ps-row { display: flex; align-items: baseline; gap: 6px; width: 100%; padding: 7px 8px; border: 0; border-radius: 7px; background: none; text-align: left; cursor: pointer; }
.ps-row:hover { background: #faf7f8; }
.ps-row.on { background: #fdeef2; }
.ps-n { flex: none; font-size: 12.5px; color: #333; font-weight: 500; }
.ps-row.on .ps-n { color: #a40035; }
.ps-m { flex: 1; min-width: 0; font-size: 10.5px; color: #a3a0a1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ps-demo { flex: none; font-size: 9.5px; color: #b45309; background: #fff7e8; border-radius: 8px; padding: 1px 6px; }
.ps-ok { flex: none; font-size: 10px; color: #a40035; }
</style>
