<template>
  <div class="ledger-page">
    <div class="page-header">
      <div class="header-main">
        <h1>假期盘点</h1>
        <el-tag type="warning" effect="plain" size="small">预设计 v2 · 非结论</el-tag>
        <el-tag type="info" effect="plain" size="small">盘点视角</el-tag>
      </div>
    </div>

    <!-- ============ 筛选 ============ -->
    <div class="section-card filter-card">
      <div class="filter-row">
        <span class="fl">周期</span>
        <el-radio-group v-model="mode" size="small" @change="onModeChange">
          <el-radio-button v-for="m in modes" :key="m.value" :value="m.value">{{ m.label }}</el-radio-button>
        </el-radio-group>
        <el-select v-model="period" size="small" style="width: 148px">
          <el-option v-for="p in periodsOfMode" :key="p.value" :label="p.label" :value="p.value" />
        </el-select>

        <span class="fl">所属组织</span>
        <el-select
          v-model="org"
          size="small"
          filterable
          clearable
          allow-create
          default-first-option
          placeholder="输入门店名称"
          style="width: 158px"
        >
          <el-option v-for="o in stores" :key="o" :label="o" :value="o" />
        </el-select>

        <span class="fl">岗位</span>
        <el-select v-model="job" size="small" style="width: 130px">
          <el-option v-for="j in jobs" :key="j" :label="j" :value="j" />
        </el-select>

        <el-input v-model="keyword" size="small" placeholder="搜工号 / 姓名" clearable style="width: 168px" />
        <span class="filter-note">额度取岗位引用的假期方案；已用取自假勤申请记录</span>
      </div>
    </div>

    <!-- ============ 汇总 ============ -->
    <div class="kpi-row">
      <div class="kpi">
        <span class="kpi-num">{{ summary.employees }}</span>
        <span class="kpi-label">盘点人数</span>
      </div>
      <div class="kpi">
        <span class="kpi-num">{{ summary.records }}</span>
        <span class="kpi-label">本期申请</span>
      </div>
      <div class="kpi">
        <span class="kpi-num">{{ summary.leaveTypes }}</span>
        <span class="kpi-label">涉及假种</span>
      </div>
      <div class="kpi" :class="{ warn: summary.excess > 0 }">
        <span class="kpi-num">{{ summary.excess }}</span>
        <span class="kpi-label">含超出</span>
      </div>
      <div class="kpi">
        <span class="kpi-num">{{ summary.pending }}</span>
        <span class="kpi-label">待审批</span>
      </div>
    </div>

    <!-- ============ 两个视图 ============ -->
    <div class="section-card">
      <el-tabs v-model="tab">
        <!-- 余额盘点 -->
        <el-tab-pane label="余额盘点" name="balance">
          <el-table :data="rows" size="small" class="bal-table">
            <el-table-column label="员工" width="150" fixed>
              <template #default="{ row }">
                <div class="emp-cell">
                  <span class="emp-name">{{ row.emp.name }}</span>
                  <span class="emp-sub">{{ row.emp.staffNo }} · {{ row.emp.job }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="门店 / 组织" width="120">
              <template #default="{ row }">
                <span class="dim-text">{{ row.emp.store }}</span>
              </template>
            </el-table-column>

            <el-table-column v-for="t in leaveTypes" :key="t" :label="colLabel(t)" min-width="132">
              <template #default="{ row }">
                <div v-if="cellOf(row, t)" class="bal-cell" :class="{ over: cellOf(row, t).over }">
                  <template v-if="cellOf(row, t).kind === 'cycle'">
                    <span class="bal-main">
                      <template v-if="cellOf(row, t).over">超出 {{ -cellOf(row, t).remaining }} {{ cellOf(row, t).unit }}</template>
                      <template v-else>剩 {{ cellOf(row, t).remaining }} {{ cellOf(row, t).unit }}</template>
                    </span>
                    <span class="bal-sub">
                      已用 {{ cellOf(row, t).used }} / 额度 {{ cellOf(row, t).quota }} {{ cellOf(row, t).unit }} · {{ cellOf(row, t).scopeText }}
                      <template v-if="cellOf(row, t).adjusted">（{{ cellOf(row, t).adjustNote }}）</template>
                    </span>
                  </template>
                  <template v-else>
                    <span class="bal-main">{{ cellOf(row, t).usedTimes }} 次</span>
                    <span class="bal-sub">每次 {{ cellOf(row, t).perTime }} {{ cellOf(row, t).unit }}</span>
                  </template>
                </div>
                <span v-else class="none-text">—</span>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="90" fixed="right">
              <template #default="{ row }">
                <el-button size="small" link type="primary" @click="openDetail(row)">明细</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 使用明细 -->
        <el-tab-pane :label="`使用明细（${recordRows.length}）`" name="detail">
          <el-table :data="recordRows" size="small">
            <el-table-column label="申请日期" width="110">
              <template #default="{ row }">
                <span class="dim-text">{{ row.date }}</span>
              </template>
            </el-table-column>

            <el-table-column label="员工" width="140">
              <template #default="{ row }">
                <div class="emp-cell">
                  <span class="emp-name">{{ empName(row.empId) }}</span>
                  <span class="emp-sub">{{ empNo(row.empId) }} · {{ empJob(row.empId) }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="申请类型" width="130">
              <template #default="{ row }">
                <span class="type-text">{{ row.leaveType }}</span>
              </template>
            </el-table-column>

            <el-table-column label="时长" width="90">
              <template #default="{ row }">
                <span class="type-text">{{ row.amount }} {{ row.unit }}</span>
              </template>
            </el-table-column>

            <el-table-column label="扣减" min-width="240">
              <template #default="{ row }">
                <div class="ded-wrap">
                  <template v-for="(d, i) in row.deduction" :key="i">
                    <span v-if="i" class="ded-arrow">→</span>
                    <span class="ded-chip" :class="{ excess: !d.schemeId }">{{ d.label }} {{ d.value }} {{ d.unit }}</span>
                  </template>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="状态" width="96">
              <template #default="{ row }">
                <el-tag size="small" effect="plain" :type="row.status === '已通过' ? 'success' : 'warning'">{{ row.status }}</el-tag>
              </template>
            </el-table-column>

            <el-table-column label="备注" min-width="160">
              <template #default="{ row }">
                <span class="dim-text">{{ row.note || '—' }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- ============ 员工明细抽屉 ============ -->
    <el-drawer v-model="drawerVisible" :title="drawerTitle" size="620px" :modal="false">
      <div v-if="current" class="drawer-body">
        <div class="emp-head">
          <div class="emp-head-main">
            <span class="emp-head-name">{{ current.emp.name }}</span>
            <el-tag size="small" effect="plain" type="primary">{{ current.emp.job }}</el-tag>
            <span class="dim-text">{{ current.emp.staffNo }} · {{ current.emp.store }} · 入职 {{ current.emp.joinedAt }}</span>
          </div>
          <span class="dim-text">周期：{{ periodLabel }}</span>
        </div>

        <div class="cfg-block">
          <div class="cfg-label"><span>当前余额</span></div>
          <div class="bal-cards">
            <div v-for="b in current.balances" :key="b.schemeId" class="bal-card" :class="{ over: b.over }">
              <span class="bc-type">{{ b.leaveType }}</span>
              <template v-if="b.kind === 'cycle'">
                <span class="bc-main" :class="{ over: b.over }">
                  {{ b.over ? `超出 ${-b.remaining}` : `剩 ${b.remaining}` }} {{ b.unit }}
                </span>
                <span class="bc-sub">已用 {{ b.used }} / 额度 {{ b.quota }} {{ b.unit }} · {{ b.scopeText }}口径</span>
                <span v-if="b.adjusted" class="bc-note">{{ b.adjustNote }}</span>
              </template>
              <template v-else>
                <span class="bc-main">{{ b.usedTimes }} 次</span>
                <span class="bc-sub">每次 {{ b.perTime }} {{ b.unit }}</span>
              </template>
            </div>
            <div v-if="!current.balances.length" class="none-text">该岗位未引用任何假期方案</div>
          </div>
        </div>

        <div class="cfg-block last">
          <div class="cfg-label">
            <span>本期申请记录</span>
            <span class="cfg-note">共 {{ current.records.length }} 条</span>
          </div>
          <div v-if="current.records.length" class="rec-list">
            <div v-for="r in current.records" :key="r.id" class="rec-item">
              <div class="rec-row1">
                <span class="rec-date">{{ r.date }}</span>
                <span class="type-text">{{ r.leaveType }}</span>
                <span class="rec-amount">{{ r.amount }} {{ r.unit }}</span>
                <el-tag size="small" effect="plain" :type="r.status === '已通过' ? 'success' : 'warning'">{{ r.status }}</el-tag>
                <span v-if="excessText(r)" class="rec-excess">含超出 {{ excessText(r) }}</span>
              </div>
              <div class="rec-row2">
                <template v-for="(d, i) in r.deduction" :key="i">
                  <span v-if="i" class="ded-arrow">→</span>
                  <span class="ded-chip" :class="{ excess: !d.schemeId }">{{ d.label }} {{ d.value }} {{ d.unit }}</span>
                </template>
                <span v-if="r.note" class="dim-text rec-note">{{ r.note }}</span>
              </div>
            </div>
          </div>
          <div v-else class="none-text">本周期没有申请记录</div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  ledgerModes,
  ledgerPeriods,
  ledgerJobOptions,
  ledgerStoreOptions,
  ledgerEmployees,
  balancesOf,
  recordsOf,
  leaveRecords,
  ledgerSummary,
  excessText
} from '../../mock/leaveLedger.js'

const modes = ledgerModes
const jobs = ledgerJobOptions
const stores = ledgerStoreOptions
const leaveTypes = ['班次假', '临时假', '年假', '婚假', '丧假']

/* 方案单位：列头用（临时假按小时计） */
const unitOf = (t) => (t === '临时假' ? '小时' : '天')
const colLabel = (t) => `${t} · ${unitOf(t)}`

/* ---------- 筛选 ---------- */
const mode = ref('month')
const period = ref('2026-10')
const org = ref('全部')
const job = ref('全部')
const keyword = ref('')

const periodsOfMode = computed(() => ledgerPeriods[mode.value] || [])

const onModeChange = () => {
  const list = periodsOfMode.value
  period.value = list.length ? list[0].value : ''
}

const periodLabel = computed(() => {
  const p = (ledgerPeriods[mode.value] || []).find(x => x.value === period.value)
  return p ? p.label : period.value
})

/* ---------- 数据 ---------- */
const rows = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  const storeKey = (org.value || '').trim()
  return ledgerEmployees
    .filter(e => !storeKey || storeKey === '全部' || (e.store || '').includes(storeKey))
    .filter(e => job.value === '全部' || e.job === job.value)
    .filter(e => !k || e.name.includes(k) || (e.staffNo || '').toLowerCase().includes(k))
    .map(emp => ({
      emp,
      balances: balancesOf(emp, mode.value, period.value),
      records: recordsOf(emp.id, mode.value, period.value)
    }))
})

const cellOf = (row, type) => row.balances.find(b => b.leaveType === type) || null

const filteredEmps = computed(() => rows.value.map(r => r.emp))
const summary = computed(() => ledgerSummary(filteredEmps.value, mode.value, period.value))

const empName = (id) => (ledgerEmployees.find(e => e.id === id) || {}).name || id
const empJob = (id) => (ledgerEmployees.find(e => e.id === id) || {}).job || ''
const empNo = (id) => (ledgerEmployees.find(e => e.id === id) || {}).staffNo || ''

const recordRows = computed(() => {
  const ids = rows.value.map(r => r.emp.id)
  const list = leaveRecords.filter(r => ids.includes(r.empId))
  return list
    .filter(r => r.date.startsWith(period.value.slice(0, 4)) && (
      mode.value === 'year' ? true
        : mode.value === 'month' ? r.date.slice(0, 7) === period.value
          : Math.ceil(Number(r.date.slice(5, 7)) / 3) === Number(period.value.slice(-1))
    ))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
})

/* ---------- 抽屉 ---------- */
const tab = ref('balance')
const drawerVisible = ref(false)
const current = ref(null)
const drawerTitle = computed(() => (current.value ? `${current.value.emp.name} · 假期明细` : '假期明细'))

const openDetail = (row) => {
  current.value = row
  drawerVisible.value = true
}
</script>

<style scoped>
.ledger-page { padding: 0; }
.page-header { margin-bottom: 16px; }
.header-main { display: flex; align-items: center; gap: 10px; }
.header-main h1 { font-size: 22px; font-weight: 600; margin: 0; color: hsl(var(--foreground)); }

.section-card { background: hsl(var(--background)); border: 1px solid hsl(var(--border)); border-radius: 10px; padding: 16px 18px; }

/* 筛选 */
.filter-card { margin-bottom: 14px; }
.filter-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.fl { font-size: 12.5px; color: hsl(var(--muted-foreground)); }
.filter-note { margin-left: auto; font-size: 12px; color: hsl(var(--muted-foreground) / 0.85); }

/* 汇总 */
.kpi-row { display: flex; gap: 12px; margin-bottom: 14px; }
.kpi {
  flex: 1; display: flex; flex-direction: column; gap: 2px;
  background: hsl(var(--background)); border: 1px solid hsl(var(--border));
  border-radius: 10px; padding: 12px 16px;
}
.kpi.warn { border-color: hsl(38 92% 50% / 0.5); background: hsl(38 92% 50% / 0.06); }
.kpi-num { font-size: 20px; font-weight: 600; color: hsl(var(--foreground)); line-height: 1.3; }
.kpi.warn .kpi-num { color: hsl(38 92% 42%); }
.kpi-label { font-size: 12px; color: hsl(var(--muted-foreground)); }

/* 余额表 */
.emp-cell { display: flex; flex-direction: column; gap: 1px; }
.emp-name { font-size: 13.5px; font-weight: 500; color: hsl(var(--foreground)); }
.emp-sub { font-size: 11.5px; color: hsl(var(--muted-foreground)); }
.dim-text { font-size: 12.5px; color: hsl(var(--muted-foreground)); }
.none-text { font-size: 12.5px; color: hsl(var(--muted-foreground) / 0.7); }

.bal-cell { display: flex; flex-direction: column; gap: 1px; }
.bal-main { font-size: 13px; font-weight: 500; color: hsl(var(--foreground)); }
.bal-cell.over .bal-main { color: hsl(0 72% 51%); }
.bal-sub { font-size: 11.5px; color: hsl(var(--muted-foreground)); }

/* 明细 */
.type-text { font-size: 12.5px; color: hsl(var(--foreground)); }
.ded-wrap { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.ded-arrow { font-size: 11px; color: hsl(var(--muted-foreground) / 0.7); }
.ded-chip {
  font-size: 11.5px; padding: 1px 8px; border-radius: 9px;
  background: hsl(var(--primary) / 0.1); color: hsl(var(--primary)); border: 1px solid hsl(var(--primary) / 0.3);
}
.ded-chip.excess { background: hsl(38 92% 50% / 0.12); color: hsl(38 92% 38%); border-color: hsl(38 92% 50% / 0.5); }

/* 抽屉 */
.drawer-body { padding-bottom: 8px; }
.emp-head {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 10px 12px; margin-bottom: 18px; border-radius: 6px;
  background: hsl(var(--muted) / 0.45); border: 1px solid hsl(var(--border));
}
.emp-head-main { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.emp-head-name { font-size: 15px; font-weight: 600; color: hsl(var(--foreground)); }

.cfg-block { margin-bottom: 20px; }
.cfg-block.last { margin-bottom: 0; }
.cfg-label { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font-size: 13px; font-weight: 500; color: hsl(var(--foreground)); }
.cfg-note { font-size: 11px; font-weight: 400; color: hsl(var(--muted-foreground)); }

.bal-cards { display: flex; flex-wrap: wrap; gap: 10px; }
.bal-card {
  display: flex; flex-direction: column; gap: 2px; min-width: 132px;
  padding: 10px 12px; border-radius: 8px;
  background: hsl(var(--muted) / 0.35); border: 1px solid hsl(var(--border));
}
.bal-card.over { border-color: hsl(0 72% 51% / 0.45); background: hsl(0 72% 51% / 0.06); }
.bc-type { font-size: 12px; color: hsl(var(--muted-foreground)); }
.bc-main { font-size: 14px; font-weight: 600; color: hsl(var(--foreground)); }
.bc-main.over { color: hsl(0 72% 51%); }
.bc-sub { font-size: 11.5px; color: hsl(var(--muted-foreground)); }
.bc-note { font-size: 11px; color: hsl(38 92% 38%); }

.rec-list { display: flex; flex-direction: column; gap: 8px; }
.rec-item { padding: 9px 12px; border-radius: 6px; border: 1px solid hsl(var(--border)); }
.rec-row1 { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.rec-row2 { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; margin-top: 7px; }
.rec-date { font-size: 12.5px; color: hsl(var(--muted-foreground)); }
.rec-amount { font-size: 12.5px; font-weight: 500; color: hsl(var(--foreground)); }
.rec-excess { font-size: 11.5px; color: hsl(38 92% 38%); }
.rec-note { margin-left: 6px; }
</style>
