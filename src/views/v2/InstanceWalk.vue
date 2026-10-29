<template>
  <div class="iw-page">
    <!-- 列表 -->
    <template v-if="!inst">
      <div class="page-header">
        <div class="header-main">
          <h1>事件数据</h1>
        </div>
      </div>

      <div class="section-card">
        <el-table :data="v2state.instances" size="small" row-key="id" @row-click="open">
          <el-table-column label="单号" width="160">
            <template #default="{ row }">
              <span class="code">{{ row.code }}</span>
            </template>
          </el-table-column>
          <el-table-column label="员工" min-width="150">
            <template #default="{ row }">
              <div class="emp-cell">
                <span class="en">{{ row.emp.name }} <em>{{ row.emp.empNo }}</em></span>
                <span class="ed">{{ row.emp.job }} · {{ row.emp.store }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="用工 / 期望离职" width="150">
            <template #default="{ row }">
              <div class="emp-cell">
                <span class="en">{{ row.emp.employType }}</span>
                <span class="ed">{{ row.emp.expectDate }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="版本" width="110">
            <template #default="{ row }">
              <div class="emp-cell">
                <span class="en">第 {{ row.version }} 版</span>
                <span v-if="verAt(row)" class="ed">{{ verAt(row) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="进度" width="150">
            <template #default="{ row }">
              <div class="prog">
                <el-progress :percentage="progress(row).pct" :stroke-width="6" :show-text="false" :color="progress(row).color" />
                <span class="pg">{{ progress(row).done }}/{{ progress(row).total }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="96">
            <template #default="{ row }">
              <span :class="['st-chip', row.state]">{{ instStateLabel(row.state) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="发起时间" width="130">
            <template #default="{ row }"><span class="time">{{ row.startedAt }}</span></template>
          </el-table-column>
          <el-table-column label="" width="150" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click.stop="open(row)">看进度</el-button>
              <el-button link size="small" @click.stop="openTree(row)">编排</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </template>

    <!-- 详情：和编排页同一张画布，点卡片看这一环办了什么 -->
    <template v-else>
      <div class="topbar">
        <el-button link size="small" :icon="Back" @click="close">事件数据</el-button>
        <h1>{{ inst.code }}</h1>
        <span :class="['st-chip', inst.state]">{{ instStateLabel(inst.state) }}</span>
        <span class="who">{{ inst.emp.name }} · {{ inst.emp.job }} · {{ inst.emp.store }}</span>
        <span class="spacer" />
        <span class="pg">{{ progress(inst).done }}/{{ progress(inst).total }}</span>
        <el-button size="small" @click="openTree(inst)">编排视图</el-button>
      </div>

      <div class="meta">
        <span>工号 {{ inst.emp.empNo }}</span>
        <span>{{ inst.emp.employType }}</span>
        <span>发起 {{ inst.startedAt }}</span>
        <span>第 {{ inst.version }} 版</span>
        <span>{{ genSummary(inst.gen) }}</span>
      </div>

      <!-- 取数 / 带入 / 这一单没有的：都是这一单的事实，一行看完 -->
      <div v-if="inst.intake || payloadItems.length || (inst.gen?.dropped || []).length" class="facts">
        <span v-if="inst.intake" class="f-g">
          <span class="f-k">取数</span>
          <span v-for="s in inst.intake.steps" :key="s.key" :class="['f-i', { bad: !s.ok }]">
            {{ s.label }}<em>{{ s.query }}</em>{{ s.result }}
          </span>
        </span>
        <span v-if="payloadItems.length" class="f-g">
          <span class="f-k pay">带入</span>
          <span v-for="p in payloadItems" :key="p.key" class="f-i">{{ p.label }}<em>{{ p.raw }}</em></span>
        </span>
        <span v-if="(inst.gen?.dropped || []).length" class="f-g">
          <span class="f-k drop">这单没有 {{ inst.gen.dropped.length }}</span>
          <span class="f-i">{{ inst.gen.dropped.map((r) => r.goal).join(' · ') }}</span>
        </span>
      </div>

      <div class="flow-box">
        <div class="c-head">
          <b>这一单的子事件</b>
          <span class="c-sub">点卡片看这一环办了什么</span>
          <em>{{ sorted.length }} 条 · 必过 {{ mustCount }}</em>
        </div>
        <div class="c-canvas">
          <FlowBoard
            :nodes="flowNodes"
            :start-label="inst.emp.name + ' 提出申请'"
            :selected="selId"
            :card-width="216"
            :gap-x="50"
            @pick="pick"
          />
        </div>
      </div>

      <el-drawer
        v-model="detOpen"
        class="iw-drawer"
        size="474px"
        :with-header="false"
        :modal="false"
        :lock-scroll="false"
        @closed="selId = ''"
      >
        <section v-if="cur" class="det">
          <div class="d-head">
            <span class="d-no">{{ noOf(cur.id) }}</span>
            <span class="d-goal">{{ cur.goal }}</span>
            <span :class="['d-gate', cur.gate]">{{ cur.gate === 'optional' ? '可选' : '必过' }}</span>
            <span :class="['d-state', curSt.state]">{{ stateLabel(curSt.state) }}</span>
            <button class="d-x" title="收起" @click="detOpen = false"><el-icon><Close /></el-icon></button>
          </div>

          <div class="d-ways">
            <span v-for="w in cur.ways" :key="w.type" class="w-chip" :class="w.type">
              <template v-if="w.type === 'human'">{{ ownerLabel(ownerOfWay(w)) }} → {{ ownerOf(ownerOfWay(w)) }}</template>
              <template v-else-if="w.type === 'system'">{{ checkName(w.sysKey) }} · {{ freqText(w.fetch) }}</template>
              <template v-else-if="w.type === 'action'">{{ actionName(w.actionKey) }} · {{ w.targets || '整单' }}</template>
              <template v-else>{{ w.party }}</template>
            </span>
            <span v-if="curSt.by" class="by">{{ curSt.by }} {{ curSt.at || '' }}</span>
          </div>

          <div v-if="curSt.result" class="d-result">{{ curSt.result }}</div>
          <div v-if="curSt.note" class="d-note">{{ curSt.note }}</div>

          <!-- 系统判定：取了几次、每批什么结论 -->
          <div v-if="curSt.state === 'checking' || (curSt.detail || []).length" class="d-sec">
            <div class="ds-t">
              取数记录
              <em v-if="curSt.state === 'checking'">
                已取 {{ curSt.polls || 0 }} 次 · 消费 {{ curSt.failBatches || 0 }} 个未通过批次
                <template v-if="curSt.nextAt"> · 下次 {{ curSt.nextAt }}</template>
              </em>
            </div>
            <div v-if="(curSt.detail || []).length" class="batches">
              <div class="bt-head"><span>取数时间</span><span>批次号</span><span>指标原值</span><span>判定</span></div>
              <div v-for="(d, di) in curSt.detail" :key="di" class="bt-row">
                <span class="bt-at">{{ d.at }}</span>
                <span class="bt-no">{{ d.batchNo }}<i v-if="d.repeat" class="rep">重复</i></span>
                <span class="bt-m">{{ d.metrics }}</span>
                <span :class="['bt-r', d.result === '通过' ? 'ok' : d.result === '未通过' ? 'bad' : 'soft']">{{ d.result }}</span>
              </div>
            </div>
          </div>

          <!-- 系统执行：逐目标回执 -->
          <div v-if="(curSt.exec || []).length" class="d-sec">
            <div class="ds-t">执行回执 <em>{{ execSummary(curSt.exec) }}</em></div>
            <div class="exec">
              <div class="ex-head"><span>目标</span><span>结果</span><span>完成时间</span></div>
              <div v-for="(e, ei) in curSt.exec" :key="ei" class="ex-row">
                <span class="ex-t">{{ e.target }}</span>
                <span :class="['ex-r', e.result === '成功' ? 'ok' : e.result === '部分成功' ? 'soft' : 'bad']">{{ e.result }}</span>
                <span class="ex-at">{{ e.at }}</span>
              </div>
            </div>
          </div>

          <!-- 人办：逐事项填了什么 -->
          <div v-if="recordsOf(cur.id).length" class="d-sec">
            <div class="ds-t">填了什么</div>
            <div v-for="(it, ii) in recordsOf(cur.id)" :key="ii" class="rec">
              <div class="rc-h">
                <span class="rc-t">{{ it.title }}</span>
                <span :class="['rc-v', it.rec.verdict === '通过' ? 'ok' : 'bad']">{{ it.rec.verdict }}</span>
                <span v-if="it.rec.files" class="rc-f">{{ it.rec.files }} 个附件</span>
              </div>
              <div v-if="Object.keys(it.rec.values || {}).length" class="rc-vals">
                <span v-for="(v, k) in it.rec.values" :key="k" class="rv">
                  <b>{{ fieldLabel(cur.id, it.id, k) }}</b>{{ valueText(v) }}
                </span>
              </div>
              <div v-if="it.rec.note" class="rc-note">{{ it.rec.note }}</div>
            </div>
          </div>

          <div class="d-foot">前置：{{ depsText(cur) }}</div>
        </section>
      </el-drawer>
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Back, Close } from '@element-plus/icons-vue'
import {
  v2state, getInstance, resolveForInstance, checks, getEvent
} from '../../v2/store.js'
import {
  topoSort, stateLabel, resolveOwner, ownerOfWay, ownerLabel, flatDeps, valueText
} from '../../v2/model.js'
import { actionName } from '../../v2/seed.js'
import { instStateLabel } from '../../v2/instance.js'
import { genSummary } from '../../v2/blueprint.js'
import { payloadPlanOf, payloadTextOf } from '../../v2/payload.js'
import FlowBoard from '../../components/v2/FlowBoard.vue'

const route = useRoute()
const router = useRouter()

const inst = computed(() => (route.query.id ? getInstance(route.query.id) : null))
/** 这一单钉住的是哪一版、那一版什么时候生效的 */
const verAt = (i) => {
  const ev = getEvent(i.eventKey)
  const v = (ev?.versions || []).find((x) => x.v === i.version)
  return (v?.publishedAt || v?.at || '').slice(0, 10)
}
const ev = computed(() => (inst.value ? getEvent(inst.value.eventKey) : null))
/** 触点跟版本走：实例按发起时那一版的触点看 */
const evTrigger = computed(() => {
  const e = ev.value
  if (!e) return {}
  const snap = (e.versions || []).find((v) => v.v === inst.value?.version)
  return snap?.trigger || e.trigger || {}
})
const resolved = computed(() => (inst.value ? resolveForInstance(inst.value) : { tree: [] }))
const sorted = computed(() => topoSort(resolved.value.tree))
const mustCount = computed(() => sorted.value.filter((s) => s.gate !== 'optional').length)

/** 这一单触发时带进来的值：按登记顺序显示；这一单没带的不占位置 */
const payloadItems = computed(() => payloadPlanOf(evTrigger.value || {})
  .map((f) => ({ ...f, value: inst.value?.payload?.[f.key] }))
  .filter((f) => f.value !== undefined && f.value !== null && String(f.value).trim() !== '')
  .map((f) => ({ key: f.key, label: f.label, raw: payloadTextOf(f, f.value) })))

const stateOf = (subId) => inst.value?.subs?.[subId] || { state: 'pending', records: {} }
const checkName = (k) => (checks.find((c) => c.key === k) || {}).name || k
const freqText = (f) => (!f ? '未配' : f.fetchFreq === 'none' ? '只取一次' : `每 ${f.fetchFreq.replace('h', ' 小时').replace('d', ' 天')}`)
const ownerOf = (owner) => resolveOwner(owner, { store: inst.value?.emp?.store, city: inst.value?.emp?.city })

/* ---------------- 画布 ---------------- */

const selId = ref('')
const detOpen = ref(false)
const cur = computed(() => sorted.value.find((s) => s.id === selId.value) || null)
const curSt = computed(() => stateOf(selId.value))
const noOf = (id) => String(sorted.value.findIndex((s) => s.id === id) + 1).padStart(2, '0')
const DONE = ['done', 'rejected', 'skipped', 'closed']

function pick (id) {
  selId.value = id
  detOpen.value = true
}

const flowNodes = computed(() => sorted.value.map((s) => {
  const st = stateOf(s.id)
  const ds = flatDeps(s.deps || [])
  const sysW = (s.ways || []).find((w) => w.type === 'system')
  const onlySys = (s.ways || []).length === 1 && sysW
  const man = (s.ways || []).find((w) => w.type === 'human')
  return {
    id: s.id,
    title: s.goal,
    gate: s.gate,
    who: man ? `${ownerLabel(ownerOfWay(man))} ${ownerOf(ownerOfWay(man))}` : (onlySys ? '系统' : (s.ways?.[0]?.party || '')),
    foot: ds.length ? `等 ${ds.length} 条办结` : (onlySys ? freqText(sysW.fetch) : ''),
    footTone: ds.length ? 'mute' : 'info',
    kind: onlySys ? 'system' : '',
    deps: ds,
    state: st.state,
    stateLabel: st.state && st.state !== 'pending' ? stateLabel(st.state) : '',
    locked: DONE.includes(st.state)
  }
}))

const depsText = (s) => {
  const ds = flatDeps(s.deps || [])
  if (!ds.length) return '没有前置（发起即可办）'
  return ds.map((id) => (sorted.value.find((x) => x.id === id) || {}).goal || id).join('、')
}

function progress (row) {
  const tree = resolveForInstance(row).tree
  const total = tree.length
  const done = tree.filter((s) => DONE.includes(row.subs?.[s.id]?.state)).length
  const pct = total ? Math.round((done / total) * 100) : 0
  return { total, done, pct, color: row.state === 'done' ? '#1d9e75' : '#534ab7' }
}

function execSummary (exec = []) {
  const ok = exec.filter((e) => e.result === '成功').length
  const bad = exec.filter((e) => e.result !== '成功').length
  return `共 ${exec.length} 个目标：成功 ${ok}${bad ? `，其余 ${bad}（已转人工）` : ''}`
}

function recordsOf (subId) {
  const sub = resolved.value.tree.find((s) => s.id === subId)
  const human = (sub?.ways || []).find((w) => w.type === 'human')
  const recs = inst.value?.subs?.[subId]?.records || {}
  return (human?.items || [])
    .filter((it) => recs[it.id])
    .map((it) => ({ id: it.id, title: it.title, rec: recs[it.id] }))
}

const fieldLabel = (subId, itemId, key) => {
  const sub = resolved.value.tree.find((s) => s.id === subId)
  const item = ((sub?.ways || []).find((w) => w.type === 'human')?.items || []).find((i) => i.id === itemId)
  return (item?.fields || []).find((f) => f.key === key)?.label || key
}

function open (row) {
  router.push({ query: { id: row.id } })
}
function openTree (row) {
  router.push({ name: 'v2-inst-tree', query: { id: row.id } })
}
function close () {
  router.push({ query: {} })
}
</script>

<style scoped>
.iw-page { padding: 16px 20px 24px; height: 100%; display: flex; flex-direction: column; min-height: 0; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
.header-main h1 { margin: 0 0 4px; font-size: 20px; }
.header-main .sub { font-size: 12.5px; color: #8a8f99; }
.section-card { background: #fff; border: 1px solid #ececf0; border-radius: 12px; padding: 14px 16px; }
.section-card :deep(.el-table__row) { cursor: pointer; }
.code { font-size: 11.5px; font-family: ui-monospace, monospace; color: #534ab7; }
.emp-cell { display: flex; flex-direction: column; }
.en { font-size: 12.5px; color: #2b2b33; }
.en em { font-style: normal; font-size: 11px; color: #a3a0a1; }
.ed { font-size: 11px; color: #a3a0a1; }
.prog { display: flex; align-items: center; gap: 8px; }
.prog :deep(.el-progress) { flex: 1; }
.pg { font-size: 11.5px; color: #8a8f99; }
.time { font-size: 11.5px; color: #6a6a75; }

/* 顶部 */
.topbar { display: flex; align-items: center; gap: 10px; flex: none; margin-bottom: 8px; }
.topbar h1 { margin: 0; font-size: 17px; }
.spacer { flex: 1; }
.who { font-size: 12px; color: #6a6a75; }
.st-chip { font-size: 11px; border-radius: 8px; padding: 1px 7px; }
.st-chip.done { color: #0f6e56; background: #e1f5ee; }
.st-chip.running { color: #534ab7; background: #eeedfe; }
.st-chip.terminated { color: #b23b3b; background: #fdecec; }

.meta { flex: none; display: flex; align-items: center; gap: 14px; font-size: 11.5px; color: #a3a0a1; padding-left: 2px; margin-bottom: 8px; }

/* 一单的事实：取数 / 带入 / 没有的，压成一行，放不下就裁 */
.facts { flex: none; display: flex; align-items: flex-start; gap: 6px 18px; flex-wrap: wrap; background: #f8f8fb; border: 1px solid #f0eff4; border-radius: 10px; padding: 7px 12px; margin-bottom: 10px; font-size: 11.5px; color: #5b5966; line-height: 1.9; }
.f-g { display: flex; align-items: center; gap: 4px 10px; flex-wrap: wrap; min-width: 0; }
.f-k { flex: none; font-weight: 600; color: #7a7787; }
.f-k.pay { color: #6b5bd2; }
.f-k.drop { color: #9a6b00; }
.f-i { white-space: nowrap; }
.f-i em { font-style: normal; font-size: 10.5px; color: #a8a6b4; margin-left: 5px; }
.f-i.bad, .f-i.bad em { color: #c45656; }

/* 画布 */
.flow-box { flex: 1; min-height: 0; display: flex; flex-direction: column; background: #fff; border: 1px solid #ececf0; border-radius: 12px; overflow: hidden; }
.c-head { flex: none; display: flex; align-items: center; gap: 8px; padding: 11px 14px 9px; border-bottom: 1px solid #f2f1f5; }
.c-head b { font-size: 13px; color: #2b2b33; }
.c-sub { font-size: 11px; color: #a3a0a1; }
.c-head em { margin-left: auto; font-style: normal; font-size: 11px; color: #a40035; }
.c-canvas { flex: 1; min-height: 0; }

/* 抽屉 */
.det { height: 100%; overflow-y: auto; box-sizing: border-box; padding: 0 18px 22px; background: #fff; }
.d-head { position: sticky; top: 0; z-index: 3; background: #fff; display: flex; align-items: center; gap: 8px; padding: 13px 0 9px; border-bottom: 1px solid #f4f3f7; }
.d-no { font-family: ui-monospace, monospace; font-size: 11px; color: #c3c1cb; }
.d-goal { flex: 1; min-width: 0; font-size: 13.5px; font-weight: 600; color: #2b2b33; line-height: 1.4; }
.d-gate { flex: none; font-size: 10px; border-radius: 5px; padding: 0 6px; color: #993556; background: #fdeef4; }
.d-gate.optional { color: #8a8f99; background: #f2f1f5; }
.d-state { flex: none; font-size: 10.5px; border-radius: 6px; padding: 1px 7px; color: #a3a0a1; background: #f2f1f5; }
.d-state.done { color: #0f6e56; background: #e1f5ee; }
.d-state.running { color: #534ab7; background: #eeedfe; }
.d-state.checking { color: #9a6b00; background: #fdf6e7; }
.d-state.rejected { color: #b23b3b; background: #fdecec; }
.d-x { flex: none; display: grid; place-items: center; width: 24px; height: 24px; border: 0; border-radius: 7px; background: #f6f5f9; color: #8a8489; cursor: pointer; }
.d-x:hover { background: #f0eef4; color: #2b2b33; }
.d-x .el-icon { font-size: 13px; }

.d-ways { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
.w-chip { font-size: 11px; border-radius: 7px; padding: 1px 7px; }
.w-chip.human { color: #534ab7; background: #eeedfe; }
.w-chip.review { color: #4b3fa8; background: #f0ecff; }
.w-chip.system { color: #0f6e56; background: #e1f5ee; }
.w-chip.action { color: #2f6fa8; background: #e8f1fa; }
.w-chip.external { color: #9a6b00; background: #fdf6e7; }
.by { font-size: 11px; color: #a3a0a1; }

.d-result { margin-top: 9px; font-size: 12px; color: #0f6e56; background: #f2faf7; border-radius: 8px; padding: 6px 10px; line-height: 1.6; }
.d-note { margin-top: 6px; font-size: 12px; color: #9a6b00; background: #fdf6e7; border-radius: 8px; padding: 6px 10px; line-height: 1.6; }

.d-sec { margin-top: 14px; }
.ds-t { font-size: 11.5px; font-weight: 600; color: #4a4750; margin-bottom: 6px; }
.ds-t em { margin-left: 6px; font-style: normal; font-weight: 400; font-size: 10.5px; color: #a3a0a1; }

.batches { border: 1px solid #f3ead6; border-radius: 8px; overflow: hidden; }
.bt-head, .bt-row { display: grid; grid-template-columns: 96px 150px 1fr 54px; gap: 6px; padding: 5px 9px; font-size: 11px; }
.bt-head { background: #fdf8ee; color: #a3a0a1; font-size: 10.5px; }
.bt-row { border-top: 1px solid #f8f1e2; }
.bt-at { color: #8a8f99; }
.bt-no { font-family: ui-monospace, monospace; color: #534ab7; }
.rep { font-style: normal; font-size: 10px; color: #b0aebe; margin-left: 4px; }
.bt-m { color: #4a4a55; }
.bt-r { font-size: 10.5px; }
.bt-r.ok { color: #0f6e56; }
.bt-r.bad { color: #b23b3b; }
.bt-r.soft { color: #9a6b00; }

.exec { border: 1px solid #f0eef7; border-radius: 8px; overflow: hidden; }
.ex-head, .ex-row { display: grid; grid-template-columns: 1fr 86px 118px; gap: 6px; padding: 5px 9px; font-size: 11px; }
.ex-head { background: #f6f4fd; color: #a3a0a1; font-size: 10.5px; }
.ex-row { border-top: 1px solid #f0eef7; }
.ex-t { color: #4a4a55; }
.ex-r { font-size: 10.5px; }
.ex-r.ok { color: #0f6e56; }
.ex-r.soft { color: #9a6b00; }
.ex-r.bad { color: #b23b3b; }
.ex-at { color: #8a8f99; }

.rec { padding: 7px 0; border-top: 1px dashed #f0eef4; }
.rec:first-of-type { border-top: 0; }
.rc-h { display: flex; align-items: baseline; gap: 8px; }
.rc-t { font-size: 12px; color: #2b2b33; font-weight: 500; }
.rc-v { font-size: 10.5px; border-radius: 6px; padding: 0 6px; }
.rc-v.ok { color: #0f6e56; background: #e1f5ee; }
.rc-v.bad { color: #b23b3b; background: #fdecec; }
.rc-f { font-size: 10.5px; color: #b0aebe; }
.rc-vals { display: flex; flex-wrap: wrap; gap: 4px 14px; margin-top: 4px; }
.rv { font-size: 11.5px; color: #6a6a75; }
.rv b { font-weight: 400; color: #a3a0a1; margin-right: 5px; }
.rc-note { margin-top: 4px; font-size: 11.5px; color: #a3a0a1; }

.d-foot { margin-top: 14px; padding-top: 10px; border-top: 1px dashed #f0eef4; font-size: 11.5px; color: #a3a0a1; line-height: 1.6; }
</style>

<style>
/* 抽屉挂在 body 上，scoped 够不到 */
.iw-drawer .el-drawer__body { padding: 0; }
.iw-drawer .el-drawer__header { display: none; }
</style>
