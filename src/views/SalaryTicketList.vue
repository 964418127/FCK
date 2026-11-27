<!--
  PC 端 · 薪酬工单查询列表
  「薪酬咨询助手」的管理面：移动端办单，PC 端管单。全量工单数据表，
  支持按员工 / 岗位 / 状态 / 优先级 / 月份筛选；详情抽屉展示三件套
  （员工主张+证据 / 助手预核查报告 / 人事答复）。
  数据与移动端共享同一份 reactive 单例（salaryAgentTicketsStore），两边演示互通。
  分页走项目约定：usePager + TablePagination。
-->
<template>
  <div class="ticket-list-page">
    <h1>薪酬工单列表</h1>
    <p class="page-desc">
      员工在【薪酬咨询助手】内经取证引导、复核后由助手判定生成的薪酬工单；到达人事前已完成预核查与优先级评定，一次答复即结案。
    </p>

    <div class="filter-section">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="员工">
          <el-input v-model="filterForm.employee" placeholder="姓名或工号" clearable style="width: 150px;" />
        </el-form-item>
        <el-form-item label="岗位">
          <el-select v-model="filterForm.position" placeholder="全部" clearable style="width: 150px;">
            <el-option v-for="p in positionOptions" :key="p" :label="p" :value="p" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部" clearable style="width: 130px;">
            <el-option label="待人事处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已结案" value="closed" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="filterForm.priority" placeholder="全部" clearable style="width: 110px;">
            <el-option label="P1 优先处理" value="P1" />
            <el-option label="P2 常规核实" value="P2" />
            <el-option label="P3 低优先" value="P3" />
          </el-select>
        </el-form-item>
        <el-form-item label="月份">
          <el-select v-model="filterForm.month" placeholder="全部" clearable style="width: 120px;">
            <el-option v-for="m in monthOptions" :key="m" :label="m" :value="m" />
          </el-select>
        </el-form-item>
        <el-form-item label="预核查">
          <el-select v-model="filterForm.recheck" placeholder="全部" clearable style="width: 130px;">
            <el-option label="发现偏差" value="deviate" />
            <el-option label="维持原结论" value="keep" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <div class="stat-strip">
      <span>全量 <b>{{ filteredRows.length }}</b> 单</span>
      <span>待处理 <b class="c-pending">{{ countByStatus('pending') }}</b></span>
      <span>处理中 <b class="c-processing">{{ countByStatus('processing') }}</b></span>
      <span>已结案 <b class="c-closed">{{ countByStatus('closed') }}</b></span>
      <span>预核查发现偏差 <b class="c-deviate">{{ countDeviate() }}</b></span>
    </div>

    <el-table :data="pagedRows" border stripe size="small" style="width: 100%;" empty-text="暂无工单">
      <el-table-column prop="id" label="工单号" width="120" fixed show-overflow-tooltip />
      <el-table-column label="员工" width="110" fixed>
        <template #default="{ row }">
          <div class="employee-cell">
            <div class="employee-name">{{ row.employeeName }}</div>
            <div class="employee-no">{{ row.employeeId }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="position" label="岗位" width="130" show-overflow-tooltip />
      <el-table-column prop="salaryItem" label="薪酬项" width="120" show-overflow-tooltip />
      <el-table-column prop="period" label="争议周期" width="170" show-overflow-tooltip />
      <el-table-column label="主张 / 核算" width="130">
        <template #default="{ row }">{{ disputeBrief(row) }}</template>
      </el-table-column>
      <el-table-column prop="dispute.type" label="争议类型" width="100" />
      <el-table-column label="优先级" width="90">
        <template #default="{ row }">
          <el-tag :type="tagTypeOfPriority(row.priority)" size="small" effect="plain">{{ row.priority }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="预核查" width="110">
        <template #default="{ row }">
          <el-tag :type="row.recheck.deviate > 0 ? 'danger' : 'info'" size="small" effect="plain">
            {{ row.recheck.deviate > 0 ? `偏差 ${row.recheck.deviate} 元` : '维持原结论' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="tagTypeOfStatus(row.status)" size="small" effect="plain">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="提交时间" width="140" show-overflow-tooltip />
      <el-table-column label="操作" width="80" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="openDetail(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <TablePagination v-model:page="page" v-model:page-size="pageSize" :total="total" />

    <!-- 详情抽屉 -->
    <el-drawer v-model="drawer" title="工单详情" size="460px">
      <template v-if="cur">
        <div class="d-head">
          <div>
            <p class="d-item">{{ cur.salaryItem }}</p>
            <p class="d-sub">{{ cur.id }} · {{ cur.period }}</p>
          </div>
          <el-tag :type="tagTypeOfStatus(cur.status)" effect="plain">{{ statusLabel(cur.status) }}</el-tag>
        </div>
        <p class="d-priority">
          <el-tag :type="tagTypeOfPriority(cur.priority)" size="small" effect="plain">{{ cur.priority }}</el-tag>
          {{ cur.priorityReason }}
        </p>

        <p class="d-label">员工主张与证据（{{ cur.employeeName }} · {{ cur.position }}）</p>
        <div class="d-nums">
          <div class="d-num"><span>员工认为</span><b>{{ fmtVal(cur.dispute.expected) }}</b></div>
          <div class="d-num"><span>系统核算</span><b>{{ fmtVal(cur.dispute.actual) }}</b></div>
        </div>
        <p class="d-reason">{{ cur.dispute.reason }}</p>
        <ul class="d-evi">
          <li v-for="(e, i) in cur.evidence" :key="i" :class="e.kind">
            {{ e.text || e.label }}
          </li>
        </ul>

        <p class="d-label">助手预核查报告</p>
        <ol class="d-steps">
          <li v-for="(s, i) in cur.recheck.steps" :key="i">{{ s }}</li>
        </ol>

        <p class="d-label">人事答复</p>
        <p v-if="cur.reply" class="d-reply">
          <span class="d-reply-meta">{{ cur.reply.by }} · {{ cur.reply.at }}</span>
          {{ cur.reply.text }}
        </p>
        <p v-else class="d-no-reply">{{ cur.status === 'processing' ? '已接单，核实中。' : '等待人事接单。' }}</p>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { usePager } from '../composables/usePager.js'
import TablePagination from '../components/TablePagination.vue'
import { statusLabel } from '../mock/salaryAgentTickets.js'
import { allTickets } from '../mock/salaryAgentTicketsStore.js'

const filterForm = reactive({
  employee: '',
  position: '',
  status: '',
  priority: '',
  month: '',
  recheck: ''
})

const positionOptions = [...new Set(allTickets.value.map(t => t.position))]
const monthOptions = [...new Set(allTickets.value.map(t => t.createdAt.slice(0, 7)))]

const filteredRows = computed(() => allTickets.value.filter(t => {
  if (filterForm.employee) {
    const q = filterForm.employee.trim()
    if (!t.employeeName.includes(q) && !t.employeeId.includes(q)) return false
  }
  if (filterForm.position && t.position !== filterForm.position) return false
  if (filterForm.status && t.status !== filterForm.status) return false
  if (filterForm.priority && t.priority !== filterForm.priority) return false
  if (filterForm.month && !t.createdAt.startsWith(filterForm.month)) return false
  if (filterForm.recheck === 'deviate' && !(t.recheck.deviate > 0)) return false
  if (filterForm.recheck === 'keep' && t.recheck.deviate > 0) return false
  return true
}))

const { page, pageSize, total, rows: pagedRows } = usePager(filteredRows)

const countByStatus = (s) => filteredRows.value.filter(t => t.status === s).length
const countDeviate = () => filteredRows.value.filter(t => t.recheck.deviate > 0).length

function disputeBrief (row) {
  const { expected, actual } = row.dispute
  const f = (v) => typeof v === 'number' ? `${v}元` : v
  return `${f(expected)} / ${f(actual)}`
}

function tagTypeOfPriority (p) {
  return { P1: 'danger', P2: 'warning', P3: 'info' }[p] || 'info'
}
function tagTypeOfStatus (s) {
  return { pending: 'danger', processing: 'warning', closed: 'info' }[s] || 'info'
}

const drawer = ref(false)
const cur = ref(null)
function openDetail (row) { cur.value = row; drawer.value = true }

function fmtVal (v) { return typeof v === 'number' ? `${v} 元` : v }
</script>

<style scoped>
.ticket-list-page { padding: 20px 24px; }
h1 { font-size: 20px; font-weight: 500; color: #262626; margin: 0 0 6px; }
.page-desc { font-size: 12px; color: #8c8c8c; margin: 0 0 16px; line-height: 1.6; }

.filter-section { background: #fff; border-radius: 8px; padding: 14px 16px 0; margin-bottom: 12px; }
.filter-section .el-form-item { margin-bottom: 12px; }

.stat-strip { display: flex; gap: 20px; font-size: 12px; color: #595959; margin-bottom: 10px; padding: 0 2px; }
.stat-strip b { font-weight: 500; color: #262626; }
.stat-strip .c-pending { color: #a40035; }
.stat-strip .c-processing { color: #854f0b; }
.stat-strip .c-closed { color: #5f5e5a; }
.stat-strip .c-deviate { color: #a40035; }

.employee-cell .employee-name { font-weight: 500; color: #262626; }
.employee-cell .employee-no { font-size: 11px; color: #bfbfbf; }

/* 详情抽屉 */
.d-head { display: flex; align-items: flex-start; justify-content: space-between; }
.d-item { font-size: 17px; font-weight: 500; color: #262626; margin: 0; }
.d-sub { font-size: 12px; color: #bfbfbf; margin: 4px 0 0; }
.d-priority { font-size: 12px; color: #595959; display: flex; align-items: center; gap: 8px; margin: 12px 0 0; }
.d-label { font-size: 13px; font-weight: 500; color: #262626; margin: 18px 0 8px; }
.d-nums { display: flex; gap: 10px; }
.d-num { flex: 1; background: #fafafa; border-radius: 8px; padding: 10px 12px; }
.d-num span { display: block; font-size: 11px; color: #8c8c8c; margin-bottom: 4px; }
.d-num b { font-size: 15px; color: #262626; font-weight: 500; }
.d-reason { font-size: 12px; color: #595959; line-height: 1.7; margin: 10px 0 0; }
.d-evi { list-style: none; margin: 8px 0 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.d-evi li { font-size: 12px; color: #595959; background: #fafafa; border-radius: 8px; padding: 8px 12px; line-height: 1.6; }
.d-evi li.shot { border: 1px dashed #d9b3bd; background: #fff; }
.d-steps { margin: 0; padding-left: 20px; }
.d-steps li { font-size: 12px; color: #595959; line-height: 1.9; }
.d-reply { font-size: 13px; color: #262626; background: #fafafa; border-radius: 8px; padding: 12px; line-height: 1.7; margin: 0; }
.d-reply-meta { display: block; font-size: 11px; color: #8c8c8c; margin-bottom: 6px; }
.d-no-reply { font-size: 12px; color: #8c8c8c; margin: 0; }
</style>
