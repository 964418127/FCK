<!--
  系统项：判定（只出结论）与执行（改数据、拿回执）两类，都由系统项 Agent 对话生成。
  列表只负责「有哪些、被谁引用、当前哪一版」；条件与执行参数的修改进工作台。
-->
<template>
  <div class="si-page">
    <div class="page-header">
      <div class="header-main">
        <h1>系统项</h1>
        <span class="sub">判定项只出结论、执行项改数据拿回执 · 配置、试跑后上线，流程侧只读引用</span>
      </div>
      <div class="head-right">
        <el-dropdown trigger="click" @command="createNew">
          <el-button type="primary" size="small">
            新建系统项<el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="check">新建判定项</el-dropdown-item>
              <el-dropdown-item command="action">新建执行项</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <div class="seg-wrap">
      <div class="seg">
        <button :class="{ on: tab === 'check' }" @click="tab = 'check'">
          <span class="seg-t">判定项<em>{{ checks.length }}</em></span>
          <span class="seg-d">只出结论，不改数据</span>
        </button>
        <button :class="{ on: tab === 'action' }" @click="tab = 'action'">
          <span class="seg-t">执行项<em>{{ actionList.length }}</em></span>
          <span class="seg-d">改数据 / 发东西，拿回执</span>
        </button>
      </div>
      <el-input
        v-model="q" size="small" clearable placeholder="搜名称、来源系统"
        class="seg-search" :prefix-icon="Search"
      />
    </div>

    <div class="tab-note">
      <span v-if="tab === 'check'">两类列不同，所以分标签看：判定看<b>通过与软性区间</b>、批次留痕；执行看<b>入参、回执、失败兜底</b>。</span>
      <span v-else>执行项逐目标执行、逐目标回执；点「编排」改执行参数，改完发布新版本。</span>
    </div>

    <!-- 判定项 -->
    <div v-if="tab === 'check'" class="section-card">
      <el-table :data="filteredChecks" size="small" row-key="key">

        <el-table-column label="判定项" min-width="190">
          <template #default="{ row }">
            <div class="cell-name">
              <span class="nm">{{ row.name }}</span>
              <span class="desc">{{ row.desc }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="来源" width="104">
          <template #default="{ row }"><span class="src-chip">{{ row.source }}</span></template>
        </el-table-column>
        <el-table-column label="通过条件" min-width="210">
          <template #default="{ row }">
            <span class="def-chips">
              <template v-for="(c, i) in row.pass.items" :key="i">
                <span v-if="i" class="logic">{{ row.pass.logic === 'or' ? '或' : '且' }}</span>
                <span class="cond pass">{{ c }}</span>
              </template>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="软性区间" min-width="180">
          <template #default="{ row }">
            <span v-if="row.soft" class="def-chips">
              <template v-for="(c, i) in row.soft.items" :key="i">
                <span v-if="i" class="logic">{{ row.soft.logic === 'or' ? '或' : '且' }}</span>
                <span class="cond soft">{{ c }}</span>
              </template>
            </span>
            <span v-else class="none">无软性</span>
          </template>
        </el-table-column>
        <el-table-column label="生效镜像" width="142">
          <template #default="{ row }">
            <div class="mir-cell">
              <span class="mv">{{ row.mirror.version }} · {{ row.mirror.configuredBy }}</span>
              <span class="mt">{{ row.mirror.condAt }} 上线</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="被引用" min-width="132">
          <template #default="{ row }">
            <template v-if="usageOf('check', row.key).length">
              <span v-for="u in usageOf('check', row.key)" :key="u" class="use-chip">{{ u }}</span>
            </template>
            <span v-else class="none">暂无子事件引用</span>
          </template>
        </el-table-column>
        <el-table-column label="批次" width="76">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openRuns(row)">
              {{ (row.batches || []).length }} 批
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="" width="68" align="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="studio('check', row.key)">编排</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 执行项 -->
    <div v-else class="section-card">
      <el-table :data="filteredActions" size="small" row-key="key">
        <el-table-column label="执行项" min-width="176">
          <template #default="{ row }">
            <div class="cell-name">
              <span class="nm">{{ row.name }}</span>
              <span class="desc">{{ row.note }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="执行方" width="104">
          <template #default="{ row }"><span class="src-chip">{{ row.source }}</span></template>
        </el-table-column>
        <el-table-column label="类型" width="86">
          <template #default="{ row }"><span class="mode-chip" :class="row.mode">{{ modeLabel(row.mode) }}</span></template>
        </el-table-column>
        <el-table-column label="执行单位" width="112">
          <template #default="{ row }">
            <div class="mir-cell">
              <span class="mv">逐{{ row.target || '单' }}</span>
              <span class="mt">{{ row.targetFrom }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="入参 → 回执" min-width="210">
          <template #default="{ row }">
            <div class="io-cell">
              <span class="io-line in">入参：{{ (row.args || []).map((a) => a.label).join('、') || '无' }}</span>
              <span class="io-line out">回执：{{ (row.receipt || []).map((r) => r.label).join('、') || '无' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="失败兜底" min-width="180">
          <template #default="{ row }"><span class="fallback">{{ row.fallback }}</span></template>
        </el-table-column>
        <el-table-column label="被引用" min-width="120">
          <template #default="{ row }">
            <template v-if="usageOf('action', row.key).length">
              <span v-for="u in usageOf('action', row.key)" :key="u" class="use-chip">{{ u }}</span>
            </template>
            <span v-else class="none">暂无子事件引用</span>
          </template>
        </el-table-column>
        <el-table-column label="" width="68" align="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="studio('action', row.key)">编排</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="foot-row">
      <span class="foot-hint">
        条目只读引用：子事件里只能选 key、配取数频率；条件与执行参数在这里维护。
      </span>
      <el-button v-if="devMode" link size="small" :icon="RefreshLeft" @click="reset">重置演示数据</el-button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowDown, RefreshLeft, Search } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { sysState, resetSysItems } from '../../v2/sysStore.js'
import { sysUsageMap } from '../../v2/usage.js'

const route = useRoute()
const router = useRouter()
/** 演示辅具（重置演示数据）只在 ?dev=1 时出现，正常走查看不到 */
const devMode = computed(() => route.query.dev === '1')
/** 两类列不同，所以同页分标签；?kind= 让工作台返回、菜单直达都能落到对的那一栏 */
const tab = ref(route.query.kind === 'action' ? 'action' : 'check')
const q = ref('')

const checks = computed(() => sysState.checks)
const actionList = computed(() => sysState.actions)

const hit = (row) => {
  const k = q.value.trim().toLowerCase()
  if (!k) return true
  return [row.name, row.source, row.key, row.desc, row.note].some((v) => String(v || '').toLowerCase().includes(k))
}
const filteredChecks = computed(() => checks.value.filter(hit))
const filteredActions = computed(() => actionList.value.filter(hit))

watch(tab, (v) => {
  if (route.query.kind !== v) router.replace({ name: 'v2-sys-items', query: { ...route.query, kind: v } })
})
watch(() => route.query.kind, (v) => {
  const next = v === 'action' ? 'action' : 'check'
  if (next !== tab.value) tab.value = next
})

const MODE = { execute: '改数据', notify: '发通知', deliver: '交文件' }
const modeLabel = (m) => MODE[m] || m

/** 引用统计：所有版本的树里，system 路径的 sysKey / action 路径的 actionKey */
const usageMap = computed(() => sysUsageMap())
const usageOf = (kind, key) => usageMap.value[kind][key] || []

/** 批次结果单独一页：按条件版本分组、逐单到人（v1 执行日志同构），抽屉装不下 */
function openRuns (row) {
  router.push({ name: 'v2-sys-batches', query: { key: row.key } })
}

function studio (kind, key) {
  router.push({ name: 'v2-sys-studio', query: { kind, key } })
}

function createNew (kind) {
  router.push({ name: 'v2-sys-studio', query: { kind, mode: 'new' } })
}

async function reset () {
  try {
    await ElMessageBox.confirm('恢复到初始目录？本机新增与发布记录会一起清掉。', '重置演示数据', { type: 'warning' })
  } catch (e) { return }
  resetSysItems()
  ElMessage.success('已恢复初始目录')
}
</script>

<style scoped>
.si-page { padding: 18px 22px 30px; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 14px; }
.header-main h1 { margin: 0 0 4px; font-size: 20px; }
.header-main .sub { font-size: 12.5px; color: #8a8f99; }
.head-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

.rule-strip { display: flex; gap: 10px; align-items: flex-start; background: #f7f8fa; border: 1px solid #ececf0; border-radius: 10px; padding: 10px 14px; margin-bottom: 12px; }
.rs-key { flex-shrink: 0; font-size: 12px; font-weight: 600; color: #534ab7; background: #eeedfe; border-radius: 8px; padding: 2px 8px; }
.rs-text { font-size: 12.5px; color: #5f6368; line-height: 1.75; }
.rs-text b { color: #534ab7; }

.seg-wrap { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.seg { display: inline-flex; gap: 3px; background: #f2f1f7; border-radius: 10px; padding: 3px; }
.seg button {
  display: flex; flex-direction: column; gap: 1px; align-items: flex-start;
  border: none; background: transparent; cursor: pointer;
  padding: 6px 16px; border-radius: 8px; transition: background .15s, box-shadow .15s;
}
.seg button.on { background: #fff; box-shadow: 0 1px 4px rgba(70, 60, 140, .12); }
.seg-t { font-size: 13px; color: #6f6d82; font-weight: 500; line-height: 1.5; }
.seg button.on .seg-t { color: #3f3595; }
.seg-t em { font-style: normal; font-size: 11px; margin-left: 5px; color: #a8a6b8; }
.seg button.on .seg-t em { color: #6c5ce7; }
.seg-d { font-size: 10.5px; color: #a8a6b8; line-height: 1.4; }
.seg-search { width: 216px; margin-left: auto; }

.tab-note { font-size: 11.5px; color: #9b99ab; line-height: 1.8; margin-bottom: 9px; }
.tab-note b { color: #6c5ce7; font-weight: 500; }

.section-card { background: #fff; border: 1px solid #ececf0; border-radius: 12px; padding: 12px 14px; }

.cell-name { display: flex; flex-direction: column; gap: 2px; }
.cell-name .nm { font-size: 12.5px; font-weight: 600; color: #2b2b33; }
.cell-name .desc { font-size: 11.5px; color: #a3a0a1; line-height: 1.6; }
.src-chip { font-size: 11.5px; color: #5f6368; background: #f1f2f5; border-radius: 9px; padding: 2px 9px; }
.mode-chip { font-size: 11px; border-radius: 7px; padding: 1px 7px; }
.mode-chip.execute { color: #0f6e56; background: #e8f5f0; }
.mode-chip.notify { color: #35618f; background: #eef4fb; }
.mode-chip.deliver { color: #7a5c1f; background: #fbf3e2; }

.def-chips { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 4px; }
.cond { font-size: 11.5px; border-radius: 7px; padding: 1px 7px; line-height: 1.6; }
.cond.pass { color: #0f6e56; background: #e8f5f0; }
.cond.soft { color: #9a6b00; background: #fdf6e7; }
.logic { font-size: 10.5px; font-weight: 600; color: #534ab7; background: #eeedfe; border-radius: 6px; padding: 0 5px; }
.none { font-size: 11.5px; color: #b9b7bd; }

.mir-cell { display: flex; flex-direction: column; }
.mv { font-size: 11.5px; color: #333; }
.mt { font-size: 10.5px; color: #a3a0a1; line-height: 1.6; }
.io-cell { display: flex; flex-direction: column; gap: 2px; }
.io-line { font-size: 11px; line-height: 1.6; }
.io-line.in { color: #55536a; }
.io-line.out { color: #8b8a9b; }
.fallback { font-size: 11px; color: #7a7890; line-height: 1.65; }
.use-chip { font-size: 11.5px; color: #534ab7; background: #eeedfe; border-radius: 9px; padding: 1px 8px; margin-right: 4px; }

.foot-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 12px; }
.foot-hint { font-size: 12px; color: #8a8f99; line-height: 1.8; }
.foot-hint b { color: #534ab7; }

</style>
