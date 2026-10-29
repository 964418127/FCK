<template>
  <div class="job-roster">
    <div class="page-header">
      <div class="header-main">
        <h1>岗位列表</h1>
        <el-tag type="info" effect="plain" size="small">只读 · 引用</el-tag>
      </div>
      <p class="tip">
        岗位来自<strong>组织架构</strong>，假勤侧只引用、不新建不删除。
      </p>
    </div>

    <div class="section-card">
      <div class="card-header">
        <span class="card-title">全部岗位</span>
        <span class="card-sub">共 {{ jobs.length }} 个岗位 · {{ totalHeadcount }} 人</span>
        <div class="header-actions">
          <el-radio-group v-model="orgFilter" size="small">
            <el-radio-button value="all">全部</el-radio-button>
            <el-radio-button v-for="o in organizations" :key="o.id" :value="o.id">
              {{ o.name }}
            </el-radio-button>
          </el-radio-group>
          <el-input
            v-model="keyword"
            placeholder="搜索岗位"
            clearable
            size="small"
            style="width: 160px;"
          />
        </div>
      </div>

      <el-table :data="pagedRows" size="small" row-key="id">
        <el-table-column label="岗位" min-width="200">
          <template #default="{ row }">
            <span class="job-name">{{ row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column label="所属组织" width="160">
          <template #default="{ row }">
            <span class="org-text">{{ orgName(row.name) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="在册人数" width="110" align="right">
          <template #default="{ row }">
            <span class="org-text">{{ row.headcount ?? '—' }}</span>
          </template>
        </el-table-column>
      </el-table>
      <TablePagination v-model:page="page" v-model:page-size="pageSize" :total="total" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { jobs, organizations, orgOf } from '../../mock/leaveAttendance.js'
import { usePager } from '../../composables/usePager.js'
import TablePagination from '../../components/TablePagination.vue'

const keyword = ref('')
const orgFilter = ref('all')

const orgName = (jobName) => (orgOf(jobName) || {}).name || '—'

const filteredJobs = computed(() => jobs.filter(j => {
  const okOrg = orgFilter.value === 'all' || (orgOf(j.name) || {}).id === orgFilter.value
  const okKey = !keyword.value.trim() || j.name.includes(keyword.value.trim())
  return okOrg && okKey
}))

const totalHeadcount = computed(() => jobs.reduce((s, j) => s + j.headcount, 0))

/* 分页：列表数据已筛选 / 排序，这里只切片 */
const { page, pageSize, total, rows: pagedRows } = usePager(filteredJobs)
</script>

<style scoped>
.job-roster {
  padding: 0;
}

.page-header {
  margin-bottom: 16px;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.header-main h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.tip {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: hsl(var(--muted-foreground));
}

.section-card {
  padding: 16px 18px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid hsl(var(--border));
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.card-sub {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.job-name {
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--foreground));
}

.org-text {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}
</style>
