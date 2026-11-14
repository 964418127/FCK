<!--
  v4 视角切换（演示辅具）
  与 v3 的 PersonaSwitch3 同一套视觉，数据源换成 v4 的花名册（V4_PEOPLE）。
  演示看点标记：补位（被系统分配补班）/ 被覆盖（班次被请假释放）/ 可领（有能当场申的名额）
-->
<template>
  <div ref="root" class="ps">
    <button class="ps-trigger" :title="tip" @click.stop="open = !open">
      <span class="ps-name">{{ me?.name || '—' }}</span>
      <i class="ps-caret" :class="{ on: open }"></i>
    </button>

    <div v-if="open" class="ps-pop" @click.stop>
      <div class="ps-h">切换视角 <span class="ps-hint">带标记的人有演示看点</span></div>
      <input v-model="kw" class="ps-q" placeholder="按姓名 / 岗位 / 空间找" />
      <div class="ps-list">
        <button
          v-for="p in shown"
          :key="p.id"
          :class="['ps-row', { on: p.id === me?.id }]"
          @click="choose(p)"
        >
          <span class="ps-n">{{ p.name }}</span>
          <span class="ps-m">{{ jobLine(p) }}</span>
          <span v-if="stories[p.id]?.length" class="ps-demo">{{ stories[p.id].join('+') }}</span>
          <span v-if="p.id === me?.id" class="ps-ok">当前</span>
        </button>
        <div v-if="!shown.length" class="ps-empty">没这个人</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { V4_PEOPLE, posName4, findSpace4 } from '../../mock/scheduleV4.js'
import { v4, me4, setMe4, claimableOf4, timelineOf4 } from '../../mock/scheduleV4Store.js'

const open = ref(false)
const root = ref(null)
const tip = '切换查看视角（演示用；正式开发按登录账号）'

const me = computed(() => me4())
const jobLine = p => [posName4(p.positionId), findSpace4(p.spaceId)?.name, p.employ === 'fulltime' ? '全职' : '非全'].join(' · ')

/** 演示看点标记（普通排班结果不打标） */
const stories = computed(() => {
  v4.batch
  const m = {}
  for (const p of V4_PEOPLE) {
    const t = []
    if (timelineOf4(p.id).some(r => r.state === 'covered')) t.push('被覆盖')
    if (timelineOf4(p.id).some(r => r.fromEvent)) t.push('补位')
    if (claimableOf4(p.id).length) t.push('可领')
    if (t.length) m[p.id] = t
  }
  return m
})

const kw = ref('')
const shown = computed(() => {
  const k = kw.value.trim()
  if (!k) return V4_PEOPLE
  return V4_PEOPLE.filter(p => `${p.name}${jobLine(p)}`.includes(k))
})

function choose (p) {
  setMe4(p)
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

.ps-trigger { display: inline-flex; align-items: center; gap: 4px; padding: 2px 4px; border: 0; background: none; font-size: 10.5px; color: #cdc7c9; letter-spacing: .3px; cursor: pointer; user-select: none; }
.ps-trigger:active, .ps-trigger:hover { color: #a40035; }
.ps-caret { width: 0; height: 0; border-left: 3px solid transparent; border-right: 3px solid transparent; border-top: 3.5px solid currentColor; opacity: .8; transition: transform .15s; }
.ps-caret.on { transform: rotate(180deg); }

.ps-pop { position: absolute; top: calc(100% + 6px); right: -6px; z-index: 40; width: 216px; padding: 6px; background: #fff; border: 1px solid #f0eef0; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,.10); }
.ps-h { padding: 3px 8px 4px; font-size: 10.5px; color: #b0aaac; letter-spacing: .3px; display: flex; align-items: baseline; justify-content: space-between; gap: 6px; }
.ps-hint { font-size: 9.5px; color: #cdc7c9; letter-spacing: 0; }
.ps-q { display: block; width: 100%; box-sizing: border-box; margin: 0 0 4px; padding: 5px 8px; border: 0; border-bottom: 1px dashed #efecee; background: none; font-size: 11.5px; color: #333; outline: none; }
.ps-q::placeholder { color: #c3bec0; }
.ps-list { max-height: 272px; overflow-y: auto; -webkit-overflow-scrolling: touch; }
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
