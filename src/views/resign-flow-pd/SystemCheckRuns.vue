<template>
  <div class="scr-page">
    <div class="page-header">
      <div class="header-main">
        <el-button link @click="goBack"><el-icon><ArrowLeft /></el-icon>返回系统检查项</el-button>
        <h1>{{ item.name }} · Agent 执行日志</h1>
        <span class="sub">
          来源 {{ item.source }} · 最新条件 <b>v{{ latest?.version }}</b>（{{ latest?.condAt }} 上线 · {{ latest?.configuredBy }} 配置）·
          最近执行 <b>{{ latest?.batchNo }}</b>（{{ latest?.ranAt }}）
        </span>
      </div>
      <span class="count-chip">{{ batches.length }} 个批次</span>
    </div>

    <!-- 查询条：判定筛选 + 员工搜索 -->
    <div class="filter-bar">
      <div class="fb-chips">
        <span class="fb-label">判定</span>
        <span
          v-for="f in filters" :key="f.key"
          :class="['f-chip', f.key, { on: resultFilter === f.key }]"
          @click="resultFilter = f.key"
        >{{ f.label }}<i v-if="f.count > 0">{{ f.count }}</i></span>
      </div>
      <el-input
        v-model="empQuery" class="fb-search" clearable
        placeholder="按员工查：姓名 / 工号（跨批次检索，带出当批条件）"
        :prefix-icon="Search" style="width: 320px"
      />
    </div>
    <div class="filter-hint">
      <template v-if="empQuery.trim()">
        员工「{{ empQuery.trim() }}」的判定记录（跨批次）：<b>{{ flatRows.length }} 条</b>
      </template>
      <template v-else>
        左侧选批次看<b>当批条件快照 + 逐单明细</b>；或按员工姓名 / 工号跨批次检索
      </template>
    </div>

    <!-- 主区：批次列表 + 明细面板 -->
    <div class="runs-body">
      <!-- 批次列表 -->
      <div class="batch-col">
        <div
          v-for="b in batches" :key="b.batchNo"
          :class="['b-card', { on: !empQuery.trim() && b.batchNo === activeBatch?.batchNo }]"
          @click="selectBatch(b)"
        >
          <div class="bc-top">
            <span class="b-no">{{ b.batchNo }}</span>
            <span v-if="b === latest" class="b-live">当前生效</span>
          </div>
          <div class="bc-meta">执行于 {{ b.ranAt }} · 条件 {{ b.version }}（{{ b.condAt }} 上线）</div>
          <div class="bc-sum">
            <span class="v-chip total">扫 {{ b.scanned }}</span>
            <span v-if="b.passN" class="v-chip pass">通 {{ b.passN }}</span>
            <span v-if="b.softN" class="v-chip soft">软 {{ b.softN }}</span>
            <span v-if="b.failN" class="v-chip fail">未 {{ b.failN }}</span>
            <span v-if="b.errN" class="v-chip err">异 {{ b.errN }}</span>
          </div>
        </div>
      </div>

      <!-- 明细面板 -->
      <div class="detail-col">
        <!-- 员工跨批次检索模式 -->
        <template v-if="empQuery.trim()">
          <div class="panel-head">
            <span class="p-title">员工检索结果</span>
            <span class="p-sub">共 {{ flatRows.length }} 条 · 每条 = 一次批次判定（含当时使用的条件）</span>
          </div>
          <div v-if="!flatRows.length" class="empty">未找到匹配的员工判定记录，可改用姓名或工号（如 TL2201）再试</div>
          <div v-for="r in flatRows" :key="r.batch.batchNo + r.v.case" class="emp-row">
            <div class="er-emp">
              <span class="er-name">{{ r.emp.name }}</span>
              <span class="er-no">{{ r.emp.empNo }}</span>
              <span class="er-job">{{ r.emp.job }}</span>
            </div>
            <span :class="['vd-res', toneOf(r.v.result)]">{{ r.v.result }}</span>
            <div class="er-main">
              <div class="er-batch">
                {{ r.batch.batchNo }} · 执行于 {{ r.batch.ranAt }} · 条件 {{ r.batch.version }}（{{ r.batch.condAt }} 上线 · {{ r.batch.configuredBy }} 配置）
              </div>
              <div class="er-cond">
                <i>通过</i><em>{{ joinCond(r.batch.pass) || '—' }}</em>
              </div>
              <div v-if="r.batch.soft" class="er-cond soft">
                <i>软性</i><em>{{ joinCond(r.batch.soft) }}</em>
              </div>
              <div class="er-metrics"><i>指标</i>{{ r.v.metrics }}</div>
            </div>
          </div>
        </template>

        <!-- 批次浏览模式 -->
        <template v-else-if="activeBatch">
          <div class="panel-head">
            <span class="p-title">{{ activeBatch.batchNo }} · 执行明细</span>
            <span class="p-sub">
              执行于 {{ activeBatch.ranAt }} · 条件 {{ activeBatch.version }}（{{ activeBatch.condAt }} 上线 · {{ activeBatch.configuredBy }} 配置）
              <template v-if="activeBatch.note"> · {{ activeBatch.note }}</template>
            </span>
          </div>
          <div class="cond-box">
            <div class="er-cond pass"><i>通过</i><em>{{ joinCond(activeBatch.pass) || '—' }}</em></div>
            <div v-if="activeBatch.soft" class="er-cond soft"><i>软性</i><em>{{ joinCond(activeBatch.soft) }}</em></div>
            <div v-else class="er-cond none"><i>软性</i><em>本批无软性区间（只会查到通过或未通过）</em></div>
          </div>
          <div v-if="!batchRows.length" class="empty">本批逐单结果已归档（共 {{ activeBatch.scanned }} 单），仅保留汇总与条件快照</div>
          <div v-else class="vd-table">
            <div class="vd-tr vd-th"><span class="c-emp">员工</span><span class="c-res">判定</span><span class="c-metrics">指标原值（与差距）</span></div>
            <div v-for="(r, ri) in batchRows" :key="ri" class="vd-tr">
              <span class="c-emp">
                <span class="er-name">{{ r.emp.name }}</span>
                <span class="er-no">{{ r.emp.empNo }} · {{ r.emp.job }}</span>
              </span>
              <span :class="['vd-res', toneOf(r.v.result)]">{{ r.v.result }}</span>
              <span class="c-metrics">{{ r.v.metrics }}</span>
            </div>
          </div>
        </template>
        <div v-else class="empty">左侧选择一个批次查看当批条件与逐单明细</div>
      </div>
    </div>

    <div class="foot-hint">本页只读 · 数据由检查 Agent 按批次反馈留痕</div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Search } from '@element-plus/icons-vue'
import {
  systemCheckDict, batchesOf, latestBatchOf, empOf, defJoin
} from '../../mock/resignHandoverPd.js'

const route = useRoute()
const router = useRouter()

const item = computed(() => systemCheckDict.find(x => x.key === route.query.sysKey) || {})
const batches = computed(() => batchesOf(route.query.sysKey))
const latest = computed(() => latestBatchOf(route.query.sysKey))

/* 无效检查项回枚举页 */
if (!item.value.key) router.replace({ name: 'resign-system-checks' })

const joinCond = (def) => (!def || !def.items?.length) ? '' : defJoin(def)
const toneOf = (r) => ({ '通过': 'ok', '未通过': 'bad', '软性命中': 'soft', '取数异常': 'err' }[r] || 'bad')

/* 批次浏览：默认选最新一批 */
const activeBatch = ref(null)
if (batches.value.length) activeBatch.value = batches.value[0]
const selectBatch = (b) => { activeBatch.value = b; empQuery.value = '' }

/* 判定筛选 */
const resultFilter = ref('all')
/* 员工检索词支持 ?q= 预填（截图/演示） */
const empQuery = ref(String(route.query.q || ''))
watch(empQuery, () => { resultFilter.value = 'all' })
const filtersDef = [
  { key: 'all', label: '全部' },
  { key: '通过', label: '通过' },
  { key: '软性命中', label: '软性命中' },
  { key: '未通过', label: '未通过' },
  { key: '取数异常', label: '取数异常' }
]

/* 当前检索范围：员工检索时跨全部批次，否则选中批次内 */
const scopeRecords = computed(() => {
  const q = empQuery.value.trim().toLowerCase()
  if (q) {
    const out = []
    for (const b of batches.value) {
      for (const v of b.verdicts || []) {
        const emp = empOf(v.case)
        if (emp.name.toLowerCase().includes(q) || String(emp.empNo).toLowerCase().includes(q)) {
          out.push({ batch: b, v, emp })
        }
      }
    }
    return out
  }
  return (activeBatch.value?.verdicts || []).map(v => ({ batch: activeBatch.value, v, emp: empOf(v.case) }))
})

const flatRows = computed(() =>
  scopeRecords.value.filter(r => resultFilter.value === 'all' || r.v.result === resultFilter.value)
)
const batchRows = computed(() => flatRows.value)

/* 筛选 chips 计数（按当前检索范围统计，切范围时跟随） */
const filters = computed(() => filtersDef.map(f => ({
  ...f,
  count: f.key === 'all'
    ? scopeRecords.value.length
    : scopeRecords.value.filter(r => r.v.result === f.key).length
})))

const goBack = () => router.push({ name: 'resign-system-checks' })
</script>

<style scoped>
.scr-page { padding: 18px 22px 30px; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 12px; }
.header-main h1 { margin: 0 0 4px; font-size: 20px; display: flex; align-items: center; gap: 6px; }
.header-main h1 .el-button { font-size: 13px; margin-right: 2px; }
.header-main .sub { font-size: 12.5px; color: #8a8f99; line-height: 1.7; }
.header-main .sub b { color: #534ab7; }
.count-chip { font-size: 12px; color: #534ab7; background: #eeedfe; border-radius: 9px; padding: 3px 10px; flex-shrink: 0; }

/* 查询条 */
.filter-bar { display: flex; align-items: center; justify-content: space-between; gap: 14px; background: #fff; border: 1px solid #ececf0; border-radius: 10px; padding: 9px 14px; margin-bottom: 8px; }
.fb-chips { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.fb-label { font-size: 12px; color: #8a8f99; margin-right: 2px; }
.f-chip { font-size: 12px; color: #5f6368; background: #f1f2f5; border-radius: 9px; padding: 3px 10px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; }
.f-chip i { font-style: normal; font-size: 10.5px; background: #fff; border-radius: 8px; padding: 0 5px; color: #8a8f99; }
.f-chip.on { color: #534ab7; background: #eeedfe; font-weight: 600; }
.f-chip.on i { color: #534ab7; }
.f-chip.pass.on { color: #0f6e56; background: #e8f5f0; }
.f-chip.soft.on { color: #9a6b00; background: #fdf6e7; }
.f-chip.fail.on { color: #b23b3b; background: #fbecec; }
.f-chip.err.on { color: #9a6b00; background: #fdf6e7; }
.filter-hint { font-size: 12px; color: #8a8f99; margin-bottom: 12px; line-height: 1.7; }
.filter-hint b { color: #534ab7; }

/* 主区：批次列 + 明细列 */
.runs-body { display: grid; grid-template-columns: 300px 1fr; gap: 12px; align-items: start; }
.batch-col { display: flex; flex-direction: column; gap: 8px; }
.b-card { background: #fff; border: 1px solid #ececf0; border-radius: 10px; padding: 9px 12px; cursor: pointer; }
.b-card:hover { border-color: #d8d5f0; }
.b-card.on { border-color: #b5aee6; background: #fbfaff; box-shadow: 0 0 0 1px #b5aee6 inset; }
.bc-top { display: flex; align-items: center; gap: 8px; }
.b-no { font-size: 12.5px; font-weight: 600; color: #333; font-family: ui-monospace, monospace; }
.b-live { font-size: 10.5px; color: #0f6e56; background: #e8f5f0; border-radius: 6px; padding: 0 6px; line-height: 1.7; }
.bc-meta { font-size: 11.5px; color: #8a8f99; margin-top: 3px; }
.bc-sum { display: flex; gap: 4px; margin-top: 6px; flex-wrap: wrap; }
.v-chip { font-size: 11px; border-radius: 7px; padding: 1px 7px; line-height: 1.7; }
.v-chip.total { color: #5f6368; background: #f1f2f5; }
.v-chip.pass { color: #0f6e56; background: #e8f5f0; }
.v-chip.soft { color: #9a6b00; background: #fdf6e7; }
.v-chip.fail { color: #b23b3b; background: #fbecec; }
.v-chip.err { color: #9a6b00; background: #fdf6e7; }

/* 明细面板 */
.detail-col { background: #fff; border: 1px solid #ececf0; border-radius: 12px; padding: 14px 16px; min-height: 320px; }
.panel-head { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
.p-title { font-size: 13.5px; font-weight: 600; color: #333; }
.p-sub { font-size: 11.5px; color: #a3a0a1; }

.cond-box { display: flex; flex-direction: column; gap: 4px; background: #fafafb; border-radius: 9px; padding: 8px 12px; margin-bottom: 10px; }
.er-cond { display: flex; align-items: baseline; gap: 6px; font-size: 11.5px; line-height: 1.7; }
.er-cond i { font-style: normal; flex-shrink: 0; font-size: 10.5px; border-radius: 5px; padding: 0 5px; }
.er-cond.pass i, .er-cond i { color: #0f6e56; background: #e8f5f0; }
.er-cond.pass em, .er-cond > em { color: #0f6e56; font-style: normal; }
.er-cond.soft i { color: #9a6b00; background: #fdf6e7; }
.er-cond.soft em { color: #9a6b00; font-style: normal; }
.er-cond.none i { color: #888; background: #f1f2f5; }
.er-cond.none em { color: #a3a0a1; font-style: normal; }

/* 逐单明细表 */
.vd-table { border: 1px solid #ececf0; border-radius: 9px; overflow: hidden; }
.vd-tr { display: flex; align-items: center; gap: 12px; font-size: 12px; line-height: 1.9; padding: 4px 12px; background: #fff; }
.vd-tr + .vd-tr { border-top: 1px solid #f4f4f6; }
.vd-th { color: #a3a0a1; font-size: 11px; background: #fafafb; }
.c-emp { flex-shrink: 0; width: 180px; display: flex; flex-direction: column; line-height: 1.5; }
.er-name { font-weight: 600; color: #333; }
.er-no { font-size: 11px; color: #8a8f99; }
.c-res { flex-shrink: 0; width: 76px; font-weight: 600; }
.c-metrics { flex: 1; color: #5f6368; }
.vd-res.ok { color: #0f6e56; }
.vd-res.bad { color: #b23b3b; }
.vd-res.soft { color: #9a6b00; }
.vd-res.err { color: #9a6b00; }

/* 员工跨批次检索结果 */
.emp-row { display: flex; align-items: flex-start; gap: 12px; border: 1px solid #ececf0; border-radius: 10px; padding: 10px 12px; margin-bottom: 8px; background: #fff; }
.er-emp { flex-shrink: 0; width: 132px; display: flex; flex-direction: column; gap: 1px; }
.er-no { font-size: 11px; color: #534ab7; font-family: ui-monospace, monospace; }
.er-job { font-size: 11px; color: #8a8f99; }
.emp-row .vd-res { flex-shrink: 0; margin-top: 2px; }
.er-main { flex: 1; display: flex; flex-direction: column; gap: 3px; }
.er-batch { font-size: 11.5px; color: #534ab7; font-weight: 500; }
.er-metrics { font-size: 12px; color: #5f6368; display: flex; gap: 6px; align-items: baseline; }
.er-metrics i { font-style: normal; flex-shrink: 0; font-size: 10.5px; color: #5f6368; background: #f1f2f5; border-radius: 5px; padding: 0 5px; }

.empty { font-size: 12.5px; color: #a3a0a1; padding: 26px 0; text-align: center; }

.foot-hint { margin-top: 14px; font-size: 12px; color: #8a8f99; line-height: 1.8; }
</style>
