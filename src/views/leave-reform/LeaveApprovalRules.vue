<template>
  <div class="approval-rules">
    <div class="page-header">
      <div class="header-main">
        <h1>假期审核规则</h1>
      </div>
    </div>

    <div class="section-card">
      <div class="card-header">
        <span class="card-title">申请与审核要求</span>
        <span class="card-sub">{{ rows.length }} 个假种 · {{ autoCount }} 个自动审核 · {{ diffCount }} 条差异化</span>
        <span class="card-note">改动会记入下方变更记录</span>
      </div>

      <el-table :data="pagedRows" size="small" class="rule-table">
        <el-table-column label="假种" min-width="230">
          <template #default="{ row }">
            <div class="type-cell">
              <span class="type-name">{{ row.name }}</span>
              <span class="type-note">{{ row.note }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="类别" width="92">
          <template #default="{ row }">
            <el-tag size="small" effect="plain" :type="row.category === 'statutory' ? 'primary' : 'info'">
              {{ row.category === 'statutory' ? '法定假' : '公司自定' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="凭证要求" width="178" show-overflow-tooltip>
          <template #default="{ row }">
            <span :class="row.proofTypes.length ? 'proof-yes' : 'plain'">{{ proofTextOf(row.proofTypes) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="提前申请期" width="104" align="center">
          <template #default="{ row }">
            <span class="plain">{{ advanceText(row.advanceDays) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="审核方式" width="176">
          <template #default="{ row }">
            <el-radio-group
              :model-value="row.autoApprove ? 'auto' : 'manual'"
              size="small"
              @change="v => setAuto(row, v === 'auto')"
            >
              <el-radio-button value="auto">自动</el-radio-button>
              <el-radio-button value="manual">人工</el-radio-button>
            </el-radio-group>
          </template>
        </el-table-column>

        <el-table-column label="差异化" min-width="300">
          <template #default="{ row }">
            <div v-if="row.overrides.length" class="ov-wrap">
              <span v-for="o in row.overrides" :key="o.id" class="ov-chip" :title="o.note || ''">
                {{ dimLabel(o.dimension) }} · {{ shortValues(o) }}
                <b>{{ patchText(o) }}</b>
              </span>
            </div>
            <span v-else class="plain">—</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="openEdit(row)">配置</el-button>
          </template>
        </el-table-column>
      </el-table>
      <TablePagination v-model:page="page" v-model:page-size="pageSize" :total="total" />
    </div>

    <div class="section-card">
      <div class="card-header">
        <span class="card-title">配置变更记录</span>
      </div>
      <el-table :data="pagedRows2" size="small">
        <el-table-column prop="time" label="时间" width="150" />
        <el-table-column prop="operator" label="操作人" width="160" />
        <el-table-column prop="target" label="对象" width="170" />
        <el-table-column label="变更" width="200">
          <template #default="{ row }">
            <span class="log-from">{{ row.from }}</span>
            <span class="log-arrow">→</span>
            <span class="log-to">{{ row.to }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="原因" min-width="240" show-overflow-tooltip />
      </el-table>
      <TablePagination v-model:page="page2" v-model:page-size="pageSize2" :total="total2" />
    </div>

    <!-- ============ 配置抽屉 ============ -->
    <el-drawer v-model="drawerVisible" :title="drawerTitle" size="720px" :modal="false">
      <div class="drawer-body" v-if="current">
        <el-divider content-position="left">基础配置</el-divider>

        <div class="base-grid">
          <div class="ov-field">
            <span class="of-label">凭证要求</span>
            <el-select v-model="current.proofTypes" multiple size="small" placeholder="不选即无需凭证" style="flex: 1">
              <el-option v-for="p in proofTypes" :key="p.value" :label="p.label" :value="p.value">
                <span>{{ p.label }}</span>
                <span v-if="p.desc" class="opt-desc">{{ p.desc }}</span>
              </el-option>
            </el-select>
          </div>

          <div class="ov-field">
            <span class="of-label">提前申请期</span>
            <el-input-number v-model="current.advanceDays" size="small" :min="0" :step="1" controls-position="right" style="width: 120px" />
            <span class="row-unit">天</span>
            <span class="cfg-note">0 = 可事后补</span>
          </div>

          <div class="ov-field">
            <span class="of-label">审核方式</span>
            <el-radio-group v-model="current.autoApprove" size="small">
              <el-radio-button :value="true">自动审核</el-radio-button>
              <el-radio-button :value="false">人工审核</el-radio-button>
            </el-radio-group>
            <span class="cfg-note">全公司打底</span>
          </div>
        </div>

        <el-divider content-position="left">差异化</el-divider>

        <div class="cfg-block">
          <div class="cfg-label">
            <span>差异化条目</span>
            <span class="cfg-note">仅城市 / 门店 · 三项默认取基础配置，改动哪项就覆盖哪项</span>
            <el-button size="small" class="cfg-add" @click="addOverride">+ 添加差异化</el-button>
          </div>

          <div v-if="!current.overrides.length" class="field-desc">未配置差异化，全部按基础配置执行。</div>

          <div v-for="(o, idx) in current.overrides" :key="o.id" class="ov-row">
            <div class="ov-head">
              <span class="ov-index">{{ idx + 1 }}</span>
              <el-select v-model="o.dimension" size="small" style="width: 100px" @change="onOverrideDim(o)">
                <el-option v-for="d in dimChoices" :key="d.value" :label="d.label" :value="d.value" />
              </el-select>
              <el-select
                v-model="o.values"
                multiple
                filterable
                size="small"
                style="flex: 1; min-width: 180px"
                :placeholder="`选择${dimLabel(o.dimension)}（可多选）`"
              >
                <el-option v-for="v in dimValues(o.dimension)" :key="v" :label="v" :value="v" />
              </el-select>
              <el-button size="small" link type="danger" @click="removeOverride(idx)">删除</el-button>
            </div>

            <div class="ov-fields">
              <div class="ov-field">
                <span class="of-label">审核方式</span>
                <el-radio-group
                  :model-value="eff(o, 'autoApprove')"
                  size="small"
                  @change="v => setPatch(o, 'autoApprove', v)"
                >
                  <el-radio-button :value="true">自动</el-radio-button>
                  <el-radio-button :value="false">人工</el-radio-button>
                </el-radio-group>
              </div>

              <div class="ov-field">
                <span class="of-label">凭证要求</span>
                <el-select
                  :model-value="eff(o, 'proofTypes')"
                  multiple
                  size="small"
                  placeholder="不选即无需凭证"
                  style="flex: 1"
                  @change="v => setPatch(o, 'proofTypes', v)"
                >
                  <el-option v-for="p in proofTypes" :key="p.value" :label="p.label" :value="p.value" />
                </el-select>
              </div>

              <div class="ov-field">
                <span class="of-label">提前申请期</span>
                <el-input-number
                  :model-value="eff(o, 'advanceDays')"
                  size="small"
                  :min="0"
                  :step="1"
                  controls-position="right"
                  style="width: 110px"
                  @change="v => setPatch(o, 'advanceDays', v)"
                />
                <span class="row-unit">天</span>
              </div>
            </div>

            <div class="ov-sub">
              <el-input v-model="o.note" size="small" placeholder="差异原因（选填）" style="max-width: 420px" />
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  approvalRules as rawRules,
  ruleChangeLogs,
  findLeaveType,
  proofTypes,
  proofTextOf
} from '../../mock/leaveAttendance.js'
import { dimLabel, dimValues, diffDimensions } from '../../mock/leaveWorkMode.js'

import { usePager } from '../../composables/usePager.js'
import TablePagination from '../../components/TablePagination.vue'
const rules = ref(JSON.parse(JSON.stringify(rawRules)))
const changeLogs = ref(ruleChangeLogs)

const rows = computed(() =>
  rules.value.map(r => {
    const t = findLeaveType(r.leaveTypeId) || {}
    return {
      leaveTypeId: r.leaveTypeId,
      autoApprove: r.autoApprove,
      proofTypes: r.proofTypes || [],
      advanceDays: r.advanceDays ?? 0,
      overrides: r.overrides || [],
      name: t.name || r.leaveTypeId,
      note: t.note || '',
      category: t.category
    }
  })
)

const autoCount = computed(() => rows.value.filter(r => r.autoApprove).length)
const diffCount = computed(() => rows.value.reduce((n, r) => n + r.overrides.length, 0))

/* 差异化维度：与额度一致，只有城市 / 门店 */
const dimChoices = diffDimensions.filter(d => d.value === 'city' || d.value === 'store')

const advanceText = (d) => (d === 0 ? '可事后补' : `${d} 天`)
const shortValues = (o) => {
  const list = o.values || []
  if (!list.length) return '未指定'
  if (list.length <= 2) return list.join('、')
  return `${list[0]} 等 ${list.length} 个`
}
const patchText = (o) => {
  const p = o.patch || {}
  const parts = []
  if ('autoApprove' in p) parts.push(p.autoApprove ? '自动' : '人工')
  if ('proofTypes' in p) parts.push(`凭证：${p.proofTypes.length ? proofTextOf(p.proofTypes) : '无需'}`)
  if ('advanceDays' in p) parts.push(`提前 ${advanceText(p.advanceDays)}`)
  return parts.join(' / ') || '同基础配置'
}

const setAuto = (row, v) => {
  const hit = rules.value.find(r => r.leaveTypeId === row.leaveTypeId)
  if (hit) hit.autoApprove = v
  ElMessage.success(`「${row.name}」已设为${v ? '自动审核' : '人工审核'}`)
}

/* ---------- 抽屉 ---------- */
const drawerVisible = ref(false)
const current = ref(null)
const drawerTitle = computed(() => (current.value ? `配置审核规则 · ${current.value.name}` : '配置审核规则'))

const openEdit = (row) => {
  current.value = row
  drawerVisible.value = true
}

const addOverride = () => {
  current.value.overrides.push({
    id: 'ov-ap-' + Date.now(),
    dimension: 'city',
    values: [],
    patch: {},
    note: ''
  })
}
const onOverrideDim = (o) => { o.values = [] }

/** 差异化里每项默认显示基础配置的值；改动即写入 patch，改回基础值则退出 patch */
const eff = (o, k) => (k in o.patch ? o.patch[k] : current.value[k])
const sameVal = (a, b) => (Array.isArray(a) || Array.isArray(b))
  ? JSON.stringify(a || []) === JSON.stringify(b || [])
  : a === b
const setPatch = (o, k, v) => {
  if (sameVal(v, current.value[k])) delete o.patch[k]
  else o.patch[k] = v
}

const removeOverride = (idx) => { current.value.overrides.splice(idx, 1) }

/* 分页：数据已筛选 / 排序，这里只切片 */
const { page: page, pageSize: pageSize, total: total, rows: pagedRows } = usePager(rows)
const { page: page2, pageSize: pageSize2, total: total2, rows: pagedRows2 } = usePager(changeLogs)
</script>

<style scoped>
.approval-rules { padding: 0; }

.page-header { margin-bottom: 14px; }
.header-main { display: flex; align-items: center; gap: 12px; }
.page-header h1 { font-size: 22px; font-weight: 600; margin: 0; color: hsl(var(--foreground)); }

.section-card {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  padding: 16px 18px;
  margin-bottom: 14px;
}
.section-card:last-child { margin-bottom: 0; }

.card-header {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 12px; padding-bottom: 11px;
  border-bottom: 1px solid hsl(var(--border)); flex-wrap: wrap;
}
.card-title { font-size: 15px; font-weight: 600; color: hsl(var(--foreground)); }
.card-sub { font-size: 12px; color: hsl(var(--muted-foreground)); }
.card-note { font-size: 11.5px; color: hsl(var(--muted-foreground) / 0.85); margin-left: auto; }

.type-cell { display: flex; flex-direction: column; gap: 2px; }
.type-name { font-size: 13.5px; font-weight: 500; color: hsl(var(--foreground)); }
.type-note { font-size: 11.5px; color: hsl(var(--muted-foreground)); line-height: 1.5; }
.plain { font-size: 12.5px; color: hsl(var(--muted-foreground)); }
.proof-yes { font-size: 12.5px; color: #b8860b; }

.ov-wrap { display: flex; flex-wrap: wrap; gap: 5px; }
.ov-chip {
  font-size: 11.5px; padding: 2px 8px; border-radius: 10px;
  border: 1px solid hsl(38 92% 50% / 0.4); background: hsl(38 92% 50% / 0.1); color: hsl(38 92% 38%);
}
.ov-chip b { font-weight: 600; margin-left: 2px; }

/* 抽屉 */
.drawer-body { padding-bottom: 8px; }
.cfg-block { margin-bottom: 18px; }
.cfg-label { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 13px; font-weight: 500; color: hsl(var(--foreground)); flex-wrap: wrap; }
.cfg-note { font-size: 11px; font-weight: 400; color: hsl(var(--muted-foreground)); }
.cfg-add { margin-left: auto; }
.cfg-row { display: flex; align-items: center; gap: 8px; margin-bottom: 18px; }
.base-grid { display: flex; flex-direction: column; gap: 12px; padding: 2px 0 14px; }
.row-label { font-size: 12.5px; color: hsl(var(--muted-foreground)); width: 84px; }
.row-unit { font-size: 12px; color: hsl(var(--muted-foreground)); }
.field-desc { font-size: 12px; color: hsl(var(--muted-foreground)); line-height: 1.65; margin-top: 6px; }
.opt-desc { margin-left: 10px; font-size: 11.5px; color: hsl(var(--muted-foreground)); }

.ov-row { border: 1px solid hsl(38 92% 50% / 0.35); border-radius: 8px; padding: 10px 12px; margin-bottom: 8px; background: hsl(38 92% 50% / 0.04); }
.ov-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ov-index {
  width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0;
  font-size: 11px; display: inline-flex; align-items: center; justify-content: center;
  background: hsl(38 92% 50% / 0.15); color: hsl(38 92% 38%); font-weight: 600;
}
.ov-fields { display: flex; flex-direction: column; gap: 2px; margin-top: 6px; }
.ov-field { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
.of-label { font-size: 12px; color: hsl(var(--muted-foreground)); width: 84px; }
.ov-sub { margin-top: 8px; }

.log-from { font-size: 13px; color: hsl(var(--muted-foreground)); }
.log-arrow { margin: 0 8px; color: hsl(var(--muted-foreground)); }
.log-to { font-size: 13px; font-weight: 500; color: hsl(var(--primary)); }
</style>
