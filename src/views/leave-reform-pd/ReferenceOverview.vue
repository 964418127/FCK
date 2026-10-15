<template>
  <div class="ref-page">
    <div class="page-header">
      <div class="header-main">
        <h1>引用总览</h1>
        <el-tag type="warning" effect="plain" size="small">预设计 v2 · 非结论</el-tag>
      </div>
    </div>

    <div class="section-card">
      <div class="card-header">
        <span class="card-title">岗位 × 引用 / 声明</span>
        <div class="legend-inline">
          <span class="lg"><i class="dot ref"></i>引用（别人的资产 / 可复用实体）</span>
          <span class="lg"><i class="dot decl"></i>声明（写在岗位上）</span>
        </div>
      </div>

      <el-table :data="rows" size="small" class="ref-table">
        <el-table-column label="岗位" width="110" fixed>
          <template #default="{ row }">
            <span class="job-name">{{ row.job }}</span>
          </template>
        </el-table-column>

        <el-table-column label="工作日方案" min-width="150">
          <template #default="{ row }">
            <span v-if="row.scheme" class="chip ref" :style="schemeStyle(row.scheme.id)">
              {{ row.scheme.name }}
            </span>
            <span v-else class="chip warn">未引用</span>
          </template>
        </el-table-column>

        <el-table-column label="假期方案" min-width="220">
          <template #default="{ row }">
            <div v-if="row.quotas.length" class="chip-wrap">
              <span v-for="q in row.quotas" :key="q.id" class="chip quota">{{ q.name }}</span>
            </div>
            <span v-else class="chip none">未引用</span>
          </template>
        </el-table-column>

        <el-table-column label="考勤组" min-width="150">
          <template #default="{ row }">
            <span v-if="row.att" class="chip ref">{{ row.att.name }}</span>
            <span v-else class="chip none">{{ row.mode.attendance ? '未引用' : '不打卡' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="打卡" width="86">
          <template #default="{ row }">
            <span class="decl-text">{{ row.mode.attendance ? '需打卡' : '不打卡' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="补缺方式" width="140">
          <template #default="{ row }">
            <span class="decl-text">{{ subLabel(row.mode.backfill) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="缺岗信号" width="100">
          <template #default="{ row }">
            <span v-if="row.mode.backfill !== 'none'" class="decl-text">产出</span>
            <span v-else class="decl-text muted">—</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  scheduleSchemes,
  attendanceGroups,
  quotaSchemes,
  jobWorkModes,
  backfillOptions
} from '../../mock/leaveWorkMode.js'

const schemeColorMap = {
  'sch-store-year-round': 'hsl(210 80% 50%)',
  'sch-office-weekend': 'hsl(150 55% 40%)',
  'sch-store-duty': 'hsl(280 55% 55%)'
}
const schemeStyle = (id) => {
  const c = schemeColorMap[id] || 'hsl(220 10% 50%)'
  return { background: c.replace(')', ' / 0.12)'), borderColor: c.replace(')', ' / 0.4)'), color: c }
}

const subLabel = (v) => (backfillOptions.find(s => s.value === v) || {}).label || v

const rows = computed(() => jobWorkModes.map(m => ({
  job: m.job,
  mode: m,
  scheme: m.schemeId ? scheduleSchemes.find(s => s.id === m.schemeId) : null,
  att: m.attendanceGroupId ? attendanceGroups.find(a => a.id === m.attendanceGroupId) : null,
  quotas: (m.quotaSchemeIds || []).map(id => quotaSchemes.find(q => q.id === id)).filter(Boolean)
})))
</script>

<style scoped>
.ref-page { padding: 0; }
.page-header { margin-bottom: 16px; }
.header-main { display: flex; align-items: center; gap: 10px; }
.header-main h1 { font-size: 22px; font-weight: 600; margin: 0; color: hsl(var(--foreground)); }

.section-card { background: hsl(var(--background)); border: 1px solid hsl(var(--border)); border-radius: 10px; padding: 16px 18px; }
.card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid hsl(var(--border)); }
.card-title { font-size: 15px; font-weight: 600; color: hsl(var(--foreground)); }

.legend-inline { margin-left: auto; display: flex; gap: 16px; font-size: 12px; color: hsl(var(--muted-foreground)); }
.lg { display: inline-flex; align-items: center; gap: 5px; }
.dot { width: 9px; height: 9px; border-radius: 3px; display: inline-block; }
.dot.ref { background: hsl(var(--primary) / 0.35); }
.dot.decl { background: hsl(38 92% 50% / 0.5); }

.job-name { font-size: 13.5px; font-weight: 500; color: hsl(var(--foreground)); }
.chip-wrap { display: flex; flex-wrap: wrap; gap: 5px; }
.chip {
  display: inline-block; font-size: 11.5px; padding: 2px 9px; border-radius: 10px;
  border: 1px solid hsl(var(--border)); background: hsl(var(--muted) / 0.45); color: hsl(var(--muted-foreground));
}
.chip.ref { border-width: 1px; font-weight: 500; }
.chip.quota { color: hsl(150 45% 34%); border-color: hsl(150 45% 40% / 0.4); background: hsl(150 45% 40% / 0.1); }
.chip.warn { color: hsl(38 92% 42%); border-color: hsl(38 92% 50% / 0.5); background: hsl(38 92% 50% / 0.1); }
.chip.none { opacity: 0.6; }
.decl-text { font-size: 12.5px; color: hsl(var(--foreground)); }
.decl-text.muted { color: hsl(var(--muted-foreground)); }
</style>
