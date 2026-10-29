<template>
  <div class="scd-page">
    <div class="page-header">
      <div class="header-main">
        <h1>系统检查项</h1>
        <span class="sub">公共枚举字典 · 判定条件由检查 Agent 管理并按批次反馈，本页只读</span>
      </div>
      <span class="count-chip">共 {{ items.length }} 项 · 覆盖 {{ sources.length }} 个来源系统</span>
    </div>

    <!-- 功能短提示 -->
    <div class="rule-strip">
      <span class="rs-key">说明</span>
      <span class="rs-text">条件由检查 Agent 管理并按批次反馈，本页只读；点「最近执行」进入执行明细页，看完整执行日志。</span>
    </div>

    <div class="section-card">
      <el-table :data="pagedRows" size="small" class="scd-table" row-key="key">
        <el-table-column label="检查项" min-width="150">
          <template #default="{ row }">
            <div class="cell-name">
              <span class="nm">{{ row.name }}</span>
              <span class="desc">{{ row.desc }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="来源系统" width="100">
          <template #default="{ row }">
            <span class="src-chip">{{ row.source }}</span>
          </template>
        </el-table-column>
        <el-table-column label="通过（最新镜像）" min-width="200">
          <template #default="{ row }">
            <span class="def-chips">
              <template v-for="(c, i) in row.pass?.items || []" :key="i">
                <span v-if="i" class="logic-badge">{{ row.pass.logic === 'or' ? '或' : '且' }}</span>
                <span class="cond pass">{{ c }}</span>
              </template>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="软性（最新镜像）" min-width="190">
          <template #default="{ row }">
            <span v-if="row.soft" class="def-chips">
              <template v-for="(c, i) in row.soft.items" :key="i">
                <span v-if="i" class="logic-badge">{{ row.soft.logic === 'or' ? '或' : '且' }}</span>
                <span class="cond soft">{{ c }}</span>
              </template>
            </span>
            <span v-else class="def none">无软性区间（不支持软性门禁）</span>
          </template>
        </el-table-column>
        <el-table-column label="未通过" min-width="170">
          <template #default>
            <span class="def fail">流程按节点配置的取数频率继续取下一批次</span>
          </template>
        </el-table-column>
        <el-table-column label="最近执行" min-width="185">
          <template #default="{ row }">
            <template v-if="latestBatchOf(row.key)">
              <span class="mirror" @click="openRuns(row)">
                <span class="m-run"><i class="m-bno">{{ latestBatchOf(row.key).batchNo }}</i>{{ latestBatchOf(row.key).ranAt }}</span>
                <span class="m-ver">{{ latestBatchOf(row.key).version }} · {{ latestBatchOf(row.key).configuredBy }}（{{ latestBatchOf(row.key).condAt }} 上线）</span>
                <span class="m-link">执行日志 →</span>
              </span>
            </template>
            <span v-else class="def none">暂无执行记录</span>
          </template>
        </el-table-column>
        <el-table-column label="被引用" min-width="140">
          <template #default="{ row }">
            <template v-if="usageOf(row.key).length">
              <span v-for="u in usageOf(row.key)" :key="u.id" class="use-tpl">{{ u.name }}</span>
            </template>
            <span v-else class="use-none">暂无模板引用</span>
          </template>
        </el-table-column>
      </el-table>

      <TablePagination v-model:page="page" v-model:page-size="pageSize" :total="total" />
    </div>

    <div class="foot-hint">
      条件的配置与测试过程留档在检查 Agent 侧，本页只消费其批次反馈；被流程节点使用的那次判断，
      经「检查明细的批次号 → 执行明细页」两级即可对上：当时执行的是哪一批、用的什么条件、取到的结果值是什么。
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  systemCheckDict, resignFlowTemplates, flattenNodes, latestBatchOf
} from '../../mock/resignHandoverPd.js'
import { usePager } from '../../composables/usePager.js'
import TablePagination from '../../components/TablePagination.vue'

const router = useRouter()
const items = systemCheckDict

/* 「最近执行」点击 → 执行明细页（批次浏览 + 判定筛选 + 员工跨批次查询） */
const openRuns = (row) => router.push({ name: 'resign-system-check-runs', query: { sysKey: row.key } })

const sources = computed(() => [...new Set(items.map(i => i.source))])

/* 反查：哪些交接流程模板引用了这个检查项（模板节点 kind='system' 且 sysKey 命中） */
const allSysNodes = computed(() =>
  resignFlowTemplates.flatMap(t =>
    flattenNodes(t)
      .filter(n => n.kind === 'system')
      .map(n => ({ tpl: t, node: n }))
  )
)
const usageOf = (key) => {
  const seen = new Set()
  return allSysNodes.value
    .filter(x => x.node.sysKey === key && !seen.has(x.tpl.id) && seen.add(x.tpl.id))
    .map(x => x.tpl)
}

const { page, pageSize, total, rows: pagedRows } = usePager(computed(() => [...items]), 5)
</script>

<style scoped>
.scd-page { padding: 18px 22px 30px; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 14px; }
.header-main h1 { margin: 0 0 4px; font-size: 20px; }
.header-main .sub { font-size: 12.5px; color: #8a8f99; }
.count-chip { font-size: 12px; color: #534ab7; background: #eeedfe; border-radius: 9px; padding: 3px 10px; flex-shrink: 0; }

.rule-strip { display: flex; gap: 10px; align-items: flex-start; background: #f7f8fa; border: 1px solid #ececf0; border-radius: 10px; padding: 10px 14px; margin-bottom: 14px; }
.rs-key { flex-shrink: 0; font-size: 12px; font-weight: 600; color: #534ab7; background: #eeedfe; border-radius: 8px; padding: 2px 8px; }
.rs-text { font-size: 12.5px; color: #5f6368; line-height: 1.7; }
.rs-text b { color: #534ab7; }

.section-card { background: #fff; border: 1px solid #ececf0; border-radius: 12px; padding: 14px 16px; }
.scd-table :deep(.el-table__row) { --el-table-tr-bg-color: #fff; }

.cell-name { display: flex; flex-direction: column; gap: 2px; }
.cell-name .nm { font-size: 12.5px; font-weight: 600; color: #333; }
.cell-name .desc { font-size: 11.5px; color: #a3a0a1; }
.src-chip { font-size: 11.5px; color: #5f6368; background: #f1f2f5; border-radius: 9px; padding: 2px 9px; }

.def { font-size: 12px; line-height: 1.55; }
.def.none { color: #a3a0a1; }
.def.fail { color: #b23b3b; }

.def-chips { display: inline-flex; align-items: center; flex-wrap: wrap; gap: 4px; }
.cond { font-size: 11.5px; border-radius: 7px; padding: 1px 7px; line-height: 1.6; }
.cond.pass { color: #0f6e56; background: #e8f5f0; }
.cond.soft { color: #9a6b00; background: #fdf6e7; }
.logic-badge { font-size: 10.5px; font-weight: 600; color: #534ab7; background: #eeedfe; border-radius: 6px; padding: 0 5px; line-height: 1.7; }

/* 最近执行列（点击进执行明细页） */
.mirror { display: inline-flex; flex-direction: column; gap: 1px; font-size: 11.5px; cursor: pointer; }
.mirror:hover .m-link { text-decoration: underline; }
.mirror .m-run { color: #333; display: inline-flex; align-items: center; gap: 6px; }
.mirror .m-run .m-bno { font-style: normal; font-weight: 600; font-family: ui-monospace, monospace; color: #534ab7; }
.mirror .m-ver { color: #a3a0a1; }
.mirror .m-link { color: #534ab7; font-weight: 600; }

.use-tpl { font-size: 11.5px; color: #534ab7; background: #eeedfe; border-radius: 9px; padding: 1px 8px; margin-right: 4px; }
.use-none { font-size: 11.5px; color: #b9b7bd; }

.foot-hint { margin-top: 14px; font-size: 12px; color: #8a8f99; line-height: 1.8; }
</style>
