<!--
  判定项的批次结果（只读）。

  口径：
    批次由检查方自己跑，每批落一份「当时的条件 + 当时的人名 + 当时的指标原值」快照。
    判完之后改版本，老批次不改写 —— 所以同一张单可能在不同批次里得到不同结论，
    这正是「取到哪一批」必须留痕的原因。
    流程侧只按取数频率来取结论，本页不改条件、不改结论。
-->
<template>
  <div class="sb-page">
    <div class="page-header">
      <div class="header-main">
        <div class="crumb">
          <el-button link size="small" @click="back">
            <el-icon><ArrowLeft /></el-icon>系统项
          </el-button>
          <span class="sep">/</span>
          <span class="curr">判定项 · 批次结果</span>
        </div>
        <h1>{{ item?.name || '批次结果' }}</h1>
        <span class="sub">
          来源 {{ item?.source || '—' }}
          <template v-if="mirror.version">· 当前条件 <b>{{ mirror.version }}</b>（{{ mirror.condAt }} 上线 · {{ mirror.configuredBy }} 配置）</template>
          <template v-if="latest">· 最近一批 <b>{{ latest.batchNo }}</b>（{{ latest.ranAt }}）</template>
        </span>
      </div>
      <span class="count-chip">{{ batches.length }} 个批次 · {{ totalVerdicts }} 条逐单结果</span>
    </div>

    <div class="rule-strip">
      <span class="rs-key">口径</span>
      <span class="rs-text">
        每批是<b>当时条件与人名快照</b>：判完再改版本，老批次不改写。流程侧只按取数频率来取某一批的结论，不重算、不改判。
      </span>
    </div>

    <div class="filter-bar">
      <div class="fb-chips">
        <span class="fb-label">判定</span>
        <span
          v-for="f in filters" :key="f.key"
          :class="['f-chip', { on: resultFilter === f.key }]"
          @click="resultFilter = f.key"
        >{{ f.label }}<i v-if="f.count > 0">{{ f.count }}</i></span>
      </div>
      <el-input
        v-model="empQuery" class="fb-search" clearable
        placeholder="按人查：姓名 / 工号（跨批次，带出当批条件）"
        :prefix-icon="Search" style="width: 300px"
      />
    </div>

    <div class="runs-body">
      <!-- 左：批次，按条件版本分组 -->
      <div class="batch-col">
        <div v-for="g in groups" :key="g.version" class="ver-group">
          <div class="vg-head">
            <span class="vg-v">{{ g.version }}</span>
            <span class="vg-meta">{{ g.condAt }} 上线 · {{ g.configuredBy }}</span>
            <span v-if="g.live" class="vg-live">当前生效</span>
          </div>
          <div
            v-for="b in g.batches" :key="b.batchNo"
            :class="['b-card', { on: !empQuery.trim() && b.batchNo === active?.batchNo }]"
            @click="selectBatch(b)"
          >
            <div class="bc-top">
              <span class="b-no">{{ b.batchNo }}</span>
              <span class="b-at">{{ b.ranAt }}</span>
            </div>
            <div class="bc-sum">
              <span class="v-chip total">扫 {{ b.scanned }}</span>
              <span v-if="b.passN" class="v-chip pass">通 {{ b.passN }}</span>
              <span v-if="b.softN" class="v-chip soft">软 {{ b.softN }}</span>
              <span v-if="b.failN" class="v-chip fail">未 {{ b.failN }}</span>
              <span v-if="b.errN" class="v-chip err">异 {{ b.errN }}</span>
            </div>
            <div v-if="b.note" class="bc-note">{{ b.note }}</div>
          </div>
        </div>
        <div v-if="!groups.length" class="empty">这一项还没有批次：发布上线后由检查方按自己的节奏跑批。</div>
      </div>

      <!-- 右：明细 -->
      <div class="detail-col">
        <!-- 按人跨批次 -->
        <template v-if="empQuery.trim()">
          <div class="panel-head">
            <span class="p-title">「{{ empQuery.trim() }}」的判定记录</span>
            <span class="p-sub">共 {{ rows.length }} 条 · 一条 = 一次批次判定（含当批条件）</span>
          </div>
          <div v-if="!rows.length" class="empty">没有匹配的记录，可换姓名或工号（如 T00676）再试。</div>
          <div v-for="(r, i) in rows" :key="r.batch.batchNo + r.v.empNo + i" class="emp-row">
            <div class="er-emp">
              <span class="er-name">{{ r.v.name }}</span>
              <span class="er-no">{{ r.v.empNo }}</span>
              <span class="er-job">{{ r.v.job }} · {{ r.v.store }}</span>
            </div>
            <span :class="['vd-res', toneOf(r.v.result)]">{{ r.v.result }}</span>
            <div class="er-main">
              <div class="er-batch">
                {{ r.batch.batchNo }} · 执行于 {{ r.batch.ranAt }} · 条件 {{ r.batch.version }}（{{ r.batch.condAt }} 上线 · {{ r.batch.configuredBy }} 配置）
              </div>
              <div class="er-cond">
                <i>通过</i><em>{{ condText(r.batch.pass) || '—' }}</em>
              </div>
              <div v-if="r.batch.soft" class="er-cond soft">
                <i>软性</i><em>{{ condText(r.batch.soft) }}</em>
              </div>
              <div class="er-metrics"><i>指标</i>{{ r.v.metrics }}</div>
            </div>
          </div>
        </template>

        <!-- 单批明细 -->
        <template v-else-if="active">
          <div class="panel-head">
            <span class="p-title">{{ active.batchNo }} · 逐单结果</span>
            <span class="p-sub">
              执行于 {{ active.ranAt }} · 条件 {{ active.version }}（{{ active.condAt }} 上线 · {{ active.configuredBy }} 配置）
            </span>
          </div>

          <div class="cond-box">
            <div class="er-cond">
              <i>通过</i><em>{{ condText(active.pass) || '—' }}</em>
            </div>
            <div v-if="active.soft" class="er-cond soft">
              <i>软性</i><em>{{ condText(active.soft) }}</em>
            </div>
            <div v-else class="er-cond none">
              <i>软性</i><em>本批没有软性区间（只会有通过或未通过）</em>
            </div>
            <div v-if="active.note" class="cond-note">本批说明：{{ active.note }}</div>
          </div>

          <div v-if="!rows.length" class="empty">
            <template v-if="resultFilter !== 'all'">本批没有「{{ resultFilter }}」的记录，切回「全部」看 {{ active.scanned }} 条。</template>
            <template v-else>本批逐单结果已归档（共 {{ active.scanned }} 单），仅保留汇总与条件快照。</template>
          </div>
          <div v-else class="vd-table">
            <div class="vd-tr vd-th">
              <span class="c-emp">员工</span>
              <span class="c-res">判定</span>
              <span class="c-metrics">指标原值（与差距）</span>
            </div>
            <div v-for="(r, i) in rows" :key="i" class="vd-tr">
              <span class="c-emp">
                <span class="er-name">{{ r.v.name }}</span>
                <span class="er-no">{{ r.v.empNo }} · {{ r.v.job }} · {{ r.v.store }}</span>
              </span>
              <span :class="['vd-res', toneOf(r.v.result)]">{{ r.v.result }}</span>
              <span class="c-metrics">{{ r.v.metrics }}</span>
            </div>
          </div>
        </template>
        <div v-else class="empty">左侧选一个批次，看当批条件与逐单结果。</div>
      </div>
    </div>

    <div class="foot-hint">本页只读 · 批次由检查 Agent 按批反馈留痕，流程侧按取数频率消费</div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Search } from '@element-plus/icons-vue'
import { sysItemOf, condLabel } from '../../v2/sysStore.js'

const route = useRoute()
const router = useRouter()

const key = computed(() => String(route.query.key || ''))
const item = computed(() => sysItemOf('check', key.value))
const batches = computed(() => item.value?.batches || [])
const mirror = computed(() => item.value?.mirror || {})
const latest = computed(() => batches.value[0] || null)

if (!item.value) router.replace({ name: 'v2-sys-items', query: { kind: 'check' } })

const back = () => router.push({ name: 'v2-sys-items', query: { kind: 'check' } })

const totalVerdicts = computed(() => batches.value.reduce((n, b) => n + (b.verdicts || []).length, 0))

/** 批次按条件版本分组：同一条目下「v3 跑了哪几批、v2 期间是哪几批」要能分开看 */
const groups = computed(() => {
  const order = []
  const map = new Map()
  batches.value.forEach((b) => {
    if (!map.has(b.version)) {
      map.set(b.version, {
        version: b.version,
        condAt: b.condAt || '',
        configuredBy: b.configuredBy || '',
        live: b.version === mirror.value.version,
        batches: []
      })
      order.push(b.version)
    }
    map.get(b.version).batches.push(b)
  })
  return order.map((v) => map.get(v))
})

/** 条件里的 key 换中文名（老数据兜底，幂等） */
const condText = (def) => {
  if (!def || !(def.items || []).length) return ''
  const fields = item.value?.fetch?.fields || []
  return def.items.map((c) => condLabel(c, fields)).join(def.logic === 'or' ? ' 或 ' : ' 且 ')
}

const toneOf = (r) => ({ 通过: 'ok', 未通过: 'bad', 软性命中: 'soft', 取数异常: 'err' }[r] || 'bad')

/* 选中批次：默认最新一批 */
const active = ref(latest.value)
/* 按人搜：跨全部批次 */
const empQuery = ref(String(route.query.q || ''))
const resultFilter = ref('all')

watch(() => key.value, () => { active.value = latest.value })
const selectBatch = (b) => { active.value = b; empQuery.value = '' }
watch(empQuery, () => { resultFilter.value = 'all' })

const scopeRows = computed(() => {
  const q = empQuery.value.trim().toLowerCase()
  if (q) {
    const out = []
    batches.value.forEach((b) => {
      ;(b.verdicts || []).forEach((v) => {
        if (String(v.name).toLowerCase().includes(q) || String(v.empNo).toLowerCase().includes(q)) {
          out.push({ batch: b, v })
        }
      })
    })
    return out
  }
  return (active.value?.verdicts || []).map((v) => ({ batch: active.value, v }))
})

const rows = computed(() =>
  scopeRows.value.filter((r) => resultFilter.value === 'all' || r.v.result === resultFilter.value)
)

const filters = computed(() =>
  [
    { key: 'all', label: '全部' },
    { key: '通过', label: '通过' },
    { key: '软性命中', label: '软性命中' },
    { key: '未通过', label: '未通过' }
  ].map((f) => ({
    ...f,
    count: f.key === 'all'
      ? scopeRows.value.length
      : scopeRows.value.filter((r) => r.v.result === f.key).length
  }))
)
</script>

<style scoped>
.sb-page { padding: 18px 22px 30px; }

.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 12px; }
.crumb { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #a3a0a1; margin-bottom: 2px; }
.crumb .el-button { font-size: 12px; }
.crumb .sep { color: #d5d3e0; }
.crumb .curr { color: #8b8a9b; }
.header-main h1 { margin: 0 0 4px; font-size: 20px; }
.header-main .sub { font-size: 12.5px; color: #8a8f99; line-height: 1.7; }
.header-main .sub b { color: #534ab7; }
.count-chip { font-size: 12px; color: #534ab7; background: #eeedfe; border-radius: 9px; padding: 3px 10px; flex-shrink: 0; }

.rule-strip { display: flex; gap: 10px; align-items: flex-start; background: #f7f8fa; border: 1px solid #ececf0; border-radius: 10px; padding: 9px 14px; margin-bottom: 12px; }
.rs-key { flex: none; font-size: 11px; color: #534ab7; background: #eeedfe; border-radius: 6px; padding: 1px 8px; line-height: 1.9; }
.rs-text { font-size: 12px; color: #5f6368; line-height: 1.8; }
.rs-text b { color: #3c3b4d; }

.filter-bar { display: flex; align-items: center; justify-content: space-between; gap: 14px; background: #fff; border: 1px solid #ececf0; border-radius: 10px; padding: 8px 14px; margin-bottom: 12px; }
.fb-chips { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.fb-label { font-size: 12px; color: #8a8f99; margin-right: 2px; }
.f-chip { font-size: 12px; color: #5f6368; background: #f1f2f5; border-radius: 9px; padding: 3px 10px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; }
.f-chip i { font-style: normal; font-size: 10.5px; background: #fff; border-radius: 8px; padding: 0 5px; color: #8a8f99; }
.f-chip.on { color: #534ab7; background: #eeedfe; font-weight: 600; }
.f-chip.on i { color: #534ab7; }

.runs-body { display: grid; grid-template-columns: 292px minmax(0, 1fr); gap: 12px; align-items: start; }

/* 左：版本分组 + 批次卡 */
.batch-col { display: flex; flex-direction: column; gap: 14px; }
.ver-group { display: flex; flex-direction: column; gap: 7px; }
.vg-head { display: flex; align-items: center; gap: 7px; padding-left: 2px; }
.vg-v { font-size: 11.5px; font-weight: 600; color: #4b3fa8; font-family: ui-monospace, monospace; }
.vg-meta { font-size: 10.5px; color: #b0aebe; }
.vg-live { font-size: 10px; color: #0f6e56; background: #e8f5f0; border-radius: 6px; padding: 0 6px; line-height: 1.7; }

.b-card { background: #fff; border: 1px solid #ececf0; border-radius: 10px; padding: 9px 12px; cursor: pointer; }
.b-card:hover { border-color: #d8d5f0; }
.b-card.on { border-color: #b5aee6; background: #fbfaff; box-shadow: 0 0 0 1px #b5aee6 inset; }
.bc-top { display: flex; align-items: baseline; gap: 8px; }
.b-no { font-size: 12px; font-weight: 600; color: #333; font-family: ui-monospace, monospace; }
.b-at { font-size: 11px; color: #a3a0a1; }
.bc-sum { display: flex; gap: 4px; margin-top: 6px; flex-wrap: wrap; }
.v-chip { font-size: 11px; border-radius: 7px; padding: 1px 7px; line-height: 1.7; }
.v-chip.total { color: #5f6368; background: #f1f2f5; }
.v-chip.pass { color: #0f6e56; background: #e8f5f0; }
.v-chip.soft { color: #9a6b00; background: #fdf6e7; }
.v-chip.fail { color: #b23b3b; background: #fbecec; }
.v-chip.err { color: #9a6b00; background: #fdf6e7; }
.bc-note { font-size: 10.5px; color: #b0aebe; margin-top: 5px; line-height: 1.6; }

/* 右：明细 */
.detail-col { background: #fff; border: 1px solid #ececf0; border-radius: 12px; padding: 14px 16px; min-height: 360px; }
.panel-head { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
.p-title { font-size: 13.5px; font-weight: 600; color: #333; }
.p-sub { font-size: 11.5px; color: #a3a0a1; }

.cond-box { display: flex; flex-direction: column; gap: 4px; background: #fafafb; border-radius: 9px; padding: 9px 12px; margin-bottom: 10px; }
.er-cond { display: flex; align-items: baseline; gap: 6px; font-size: 11.5px; line-height: 1.7; }
.er-cond i { font-style: normal; flex-shrink: 0; font-size: 10.5px; border-radius: 5px; padding: 0 5px; color: #0f6e56; background: #e8f5f0; }
.er-cond em { color: #0f6e56; font-style: normal; }
.er-cond.soft i { color: #9a6b00; background: #fdf6e7; }
.er-cond.soft em { color: #9a6b00; }
.er-cond.none i { color: #888; background: #f1f2f5; }
.er-cond.none em { color: #a3a0a1; }
.cond-note { font-size: 11px; color: #8b8a9b; border-top: 1px dashed #ececf0; margin-top: 4px; padding-top: 6px; }

.vd-table { border: 1px solid #ececf0; border-radius: 9px; overflow: hidden; }
.vd-tr { display: flex; align-items: center; gap: 12px; font-size: 12px; line-height: 1.7; padding: 6px 12px; background: #fff; }
.vd-tr + .vd-tr { border-top: 1px solid #f4f4f6; }
.vd-th { color: #a3a0a1; font-size: 11px; background: #fafafb; }
.c-emp { flex-shrink: 0; width: 210px; display: flex; flex-direction: column; line-height: 1.55; }
.er-name { font-weight: 600; color: #333; }
.er-no { font-size: 10.5px; color: #8a8f99; }
.c-res { flex-shrink: 0; width: 72px; font-weight: 600; }
.c-metrics { flex: 1; color: #5f6368; }
.vd-res.ok { color: #0f6e56; }
.vd-res.bad { color: #b23b3b; }
.vd-res.soft { color: #9a6b00; }
.vd-res.err { color: #9a6b00; }

/* 按人跨批次 */
.emp-row { display: flex; align-items: flex-start; gap: 12px; border: 1px solid #ececf0; border-radius: 10px; padding: 10px 12px; margin-bottom: 8px; }
.er-emp { flex-shrink: 0; width: 150px; display: flex; flex-direction: column; gap: 1px; }
.er-emp .er-no { color: #534ab7; font-family: ui-monospace, monospace; }
.er-job { font-size: 10.5px; color: #8a8f99; }
.emp-row .vd-res { flex-shrink: 0; margin-top: 2px; }
.er-main { flex: 1; display: flex; flex-direction: column; gap: 3px; }
.er-batch { font-size: 11.5px; color: #534ab7; font-weight: 500; }
.er-metrics { font-size: 12px; color: #5f6368; display: flex; gap: 6px; align-items: baseline; }
.er-metrics i { font-style: normal; flex-shrink: 0; font-size: 10.5px; color: #5f6368; background: #f1f2f5; border-radius: 5px; padding: 0 5px; }

.empty { font-size: 12.5px; color: #a3a0a1; padding: 26px 0; text-align: center; line-height: 1.8; }

.foot-hint { margin-top: 14px; font-size: 12px; color: #8a8f99; line-height: 1.8; }
</style>
