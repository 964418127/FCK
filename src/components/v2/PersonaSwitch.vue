<!--
  视角切换（演示辅具）
  正式开发就是登录账号，不需要这个；留在这里是为了演示「同一个环节，不同角色看到的不一样」。
  刻意做得不明显：平时只是标题右侧一个 10.5px 的淡灰名字，点开才出现人员列表 ——
  它不该抢走业务界面的注意力，但也不该让人一个个点着轮换（20 个人轮一圈要 20 下）。
-->
<template>
  <div ref="root" class="ps">
    <button class="ps-trigger" :title="tip" @click.stop="open = !open">
      <span class="ps-name">{{ me?.name || '—' }}</span>
      <i class="ps-caret" :class="{ on: open }"></i>
    </button>

    <div v-if="open" class="ps-pop" @click.stop>
      <div class="ps-h">切换视角</div>
      <!-- 人一多（员工 + 处理人快 30 个）滚着找太慢，给一个不显眼的查找框 -->
      <input v-model="kw" class="ps-q" placeholder="按姓名 / 岗位 / 门店找" />
      <div class="ps-list">
        <button
          v-for="p in shown"
          :key="p.id || p.name"
          :class="['ps-row', { on: p.name === me?.name }]"
          @click="choose(p)"
        >
          <span class="ps-n">{{ p.name }}</span>
          <span class="ps-m">{{ jobLine(p) }}</span>
          <span v-if="p.name === me?.name" class="ps-ok">当前</span>
        </button>
        <div v-if="!shown.length" class="ps-empty">没这个人</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { v2state, setMe, resolveForInstance } from '../../v2/store.js'
import { staff } from '../../v2/base.js'
import { previewPeople } from '../../v2/seed.js'
import { identitiesOf } from '../../v2/instance.js'
import { scopeHit } from '../../v2/model.js'

const open = ref(false)
const root = ref(null)
const tip = '切换查看视角（演示用；正式开发按登录账号）'

/**
 * 排序交出去：三个页面关心的「谁该排在前面」不一样 ——
 * 发起页关心能不能发起，办理页关心这一单手上有几件活。
 * 不传就按「能发起这件事」排，打开就能用。
 */
const props = defineProps({
  rank: { type: Function, default: null }
})

const me = computed(() => v2state.me || staff[0])

/**
 * 可切的人 = 全部员工 + 实例里出现过的处理人（如财务专员，用来看「没有可发起事项」的空态）。
 */
const activeEvents = computed(() => v2state.events.filter((e) => e.status === 'active' && e.currentVersion))
const pool = computed(() => {
  /*
   * 池子 = 员工主数据 + 预览样本 + 单上出现过的处理人。
   * 预览样本（店长、城市总、试用期）不一定进了主数据，但他们是完整档案（含用工类型），
   * 必须用这份而不是从实例里扒出来的那条 —— 后者没有用工类型，人群范围一判就不命中。
   */
  const roster = [...staff, ...previewPeople.filter((p) => !staff.some((s) => s.name === p.name))]
  const known = new Set(roster.map((p) => p.name))
  const extra = identitiesOf(v2state.instances, (inst) => resolveForInstance(inst).tree)
    .filter((p) => p.name && !known.has(p.name))
  const all = [...roster, ...extra]
  const score = props.rank || ((p) => (activeEvents.value.some((e) => scopeHit(e.scope || {}, p)) ? 1 : 0))
  return all
    .map((p, i) => ({ p, s: score(p) || 0, i }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .map((x) => x.p)
})

const jobLine = (p) => [p.job, p.store || p.city].filter(Boolean).join(' · ')

const kw = ref('')
const shown = computed(() => {
  const k = kw.value.trim()
  if (!k) return pool.value
  return pool.value.filter((p) => `${p.name}${jobLine(p)}`.includes(k))
})

function choose (p) {
  setMe(p)
  open.value = false
}

const onDoc = (e) => {
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
.ps-h { padding: 3px 8px 4px; font-size: 10.5px; color: #b0aaac; letter-spacing: .3px; }
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
.ps-ok { flex: none; font-size: 10px; color: #a40035; }
</style>
