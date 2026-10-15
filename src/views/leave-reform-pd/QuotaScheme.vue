<template>
  <div class="quota-page">
    <div class="page-header">
      <div class="header-main">
        <h1>假期方案</h1>
        <el-tag type="warning" effect="plain" size="small">预设计 v2 · 非结论</el-tag>
        <el-tag type="primary" effect="plain" size="small">配置层</el-tag>
      </div>
    </div>

    <div class="section-card">
      <div class="card-header">
        <span class="card-title">方案库</span>
        <span class="card-sub">共 {{ quotas.length }} 份 · 被 {{ totalRef }} 个岗位引用</span>
        <div class="header-actions">
          <el-button size="small" type="primary" @click="openCreate">+ 新建假期方案</el-button>
        </div>
      </div>

      <el-table :data="quotas" size="small">
        <el-table-column label="方案" min-width="190">
          <template #default="{ row }">
            <div class="q-cell">
              <span class="q-name">{{ row.name }}</span>
              <span class="q-type">{{ row.leaveType }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="计量方式" width="110">
          <template #default="{ row }">
            <el-tag size="small" effect="plain" :type="row.measure === 'cycle' ? 'primary' : 'success'">
              {{ measureLabel(row.measure) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="期间 / 有效期" min-width="150">
          <template #default="{ row }">
            <span class="q-period">{{ periodText(row) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="额度" width="130">
          <template #default="{ row }">
            <span class="q-amount">{{ row.amount }} {{ row.unit }}</span>
          </template>
        </el-table-column>

        <el-table-column label="结转" width="80">
          <template #default="{ row }">
            <span class="q-carry">{{ row.measure === 'cycle' ? (row.carryOver ? '可结转' : '不结转') : '—' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="引用岗位" min-width="200">
          <template #default="{ row }">
            <div class="ref-jobs">
              <span v-for="j in jobsUsingQuota(row.id)" :key="j" class="ref-job">{{ j }}</span>
              <span v-if="!jobsUsingQuota(row.id).length" class="ref-none">暂无岗位引用</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="90" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="openEdit(row)">配置</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- ============ 配置抽屉 ============ -->
    <el-drawer v-model="drawerVisible" :title="drawerTitle" size="600px" :modal="false">
      <div class="drawer-body" v-if="current">
        <div class="src-banner">
          <span class="src-badge">{{ current.builtin ? '预置方案' : '自建方案' }}</span>
          <span class="src-text">被 {{ jobsUsingQuota(current.id).length }} 个岗位引用 —— 本页改动会同时作用于它们</span>
        </div>

        <div class="cfg-block">
          <div class="cfg-label"><span>方案名称</span></div>
          <el-input v-model="current.name" size="small" style="max-width: 300px" />
        </div>

        <div class="cfg-block">
          <div class="cfg-label"><span>假种</span></div>
          <el-select v-model="current.leaveType" size="small" filterable allow-create default-first-option style="max-width: 220px">
            <el-option v-for="t in leaveTypes" :key="t" :label="t" :value="t" />
          </el-select>
        </div>

        <div class="cfg-block">
          <div class="cfg-label"><span>计量方式</span></div>
          <el-radio-group v-model="current.measure">
            <el-radio v-for="m in measures" :key="m.value" :value="m.value">{{ m.label }}</el-radio>
          </el-radio-group>
          <div class="field-desc">{{ measureDesc }}</div>
        </div>

        <div v-if="current.measure === 'cycle'" class="cfg-block">
          <div class="cfg-label"><span>周期</span></div>
          <el-select v-model="current.cycle" size="small" style="max-width: 200px">
            <el-option v-for="c in cycles" :key="c" :label="c" :value="c" />
          </el-select>
          <div class="cfg-row">
            <span class="row-label">额度</span>
            <el-input-number v-model="current.amount" size="small" :min="0" :step="1" controls-position="right" style="width: 120px" />
            <el-select v-model="current.unit" size="small" style="width: 100px">
              <el-option v-for="u in units" :key="u" :label="u" :value="u" />
            </el-select>
          </div>
          <div class="cfg-row">
            <span class="row-label">结转下期</span>
            <el-switch v-model="current.carryOver" size="small" />
          </div>
        </div>

        <div v-else class="cfg-block">
          <div class="cfg-label"><span>有效期</span></div>
          <el-input v-model="current.validWithin" size="small" placeholder="如：领证后 12 个月内" style="max-width: 300px" />
          <div class="cfg-row">
            <span class="row-label">每次额度</span>
            <el-input-number v-model="current.amount" size="small" :min="0" :step="1" controls-position="right" style="width: 120px" />
            <el-select v-model="current.unit" size="small" style="width: 100px">
              <el-option v-for="u in units" :key="u" :label="u" :value="u" />
            </el-select>
          </div>
        </div>

        <div class="cfg-block">
          <div class="cfg-label">
            <span>取数说明</span>
            <span class="cfg-note">额度由系统折算时填</span>
          </div>
          <el-input v-model="current.derivedFrom" size="small" placeholder="如：按上月业绩折算" style="max-width: 340px" />
        </div>

        <div class="cfg-block">
          <div class="cfg-label"><span>引用岗位</span><span class="cfg-note">只读 · 到「工作模式」页改</span></div>
          <div class="ref-jobs">
            <span v-for="j in jobsUsingQuota(current.id)" :key="j" class="ref-job">{{ j }}</span>
            <span v-if="!jobsUsingQuota(current.id).length" class="ref-none">暂无岗位引用</span>
          </div>
        </div>

        <div class="cfg-block last">
          <div class="cfg-label"><span>备注</span></div>
          <el-input v-model="current.note" type="textarea" :rows="2" style="max-width: 420px" />
        </div>

        <div class="drawer-foot">
          <el-popconfirm
            title="删除该假期方案？引用它的岗位会少掉这项额度。"
            confirm-button-text="删除"
            cancel-button-text="取消"
            @confirm="removeQuota"
          >
            <template #reference>
              <el-button size="small" link type="danger">删除方案</el-button>
            </template>
          </el-popconfirm>
        </div>
      </div>
    </el-drawer>

    <!-- ============ 新建 ============ -->
    <el-dialog v-model="createVisible" title="新建假期方案" width="560px">
      <div class="dlg-body">
        <div class="dlg-row">
          <div class="dlg-label">方案名称</div>
          <el-input v-model="newForm.name" placeholder="如：产假 · 每次 128 天" style="max-width: 300px" />
        </div>
        <div class="dlg-row">
          <div class="dlg-label">假种</div>
          <el-select v-model="newForm.leaveType" filterable allow-create default-first-option style="width: 200px">
            <el-option v-for="t in leaveTypes" :key="t" :label="t" :value="t" />
          </el-select>
        </div>
        <div class="dlg-row">
          <div class="dlg-label">计量方式</div>
          <el-radio-group v-model="newForm.measure">
            <el-radio v-for="m in measures" :key="m.value" :value="m.value">{{ m.label }}</el-radio>
          </el-radio-group>
        </div>
        <div v-if="newForm.measure === 'cycle'" class="dlg-row">
          <div class="dlg-label">周期</div>
          <div class="row-inline">
            <el-select v-model="newForm.cycle" style="width: 130px">
              <el-option v-for="c in cycles" :key="c" :label="c" :value="c" />
            </el-select>
            <el-input-number v-model="newForm.amount" :min="0" controls-position="right" style="width: 120px" />
            <el-select v-model="newForm.unit" style="width: 90px">
              <el-option v-for="u in units" :key="u" :label="u" :value="u" />
            </el-select>
          </div>
        </div>
        <div v-else class="dlg-row">
          <div class="dlg-label">有效期 / 额度</div>
          <div class="row-inline">
            <el-input v-model="newForm.validWithin" placeholder="如：领证后 12 个月内" style="width: 190px" />
            <el-input-number v-model="newForm.amount" :min="0" controls-position="right" style="width: 120px" />
            <el-select v-model="newForm.unit" style="width: 90px">
              <el-option v-for="u in units" :key="u" :label="u" :value="u" />
            </el-select>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" @click="createQuota">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  quotaSchemes,
  jobsUsingQuota,
  leaveTypeOptions,
  cycleOptions,
  quotaMeasureOptions
} from '../../mock/leaveWorkMode.js'

const leaveTypes = leaveTypeOptions
const cycles = cycleOptions
const measures = quotaMeasureOptions
const units = ['天', '小时']

const quotas = ref(quotaSchemes.map(q => ({ ...q })))

const totalRef = computed(() => quotas.value.reduce((n, q) => n + jobsUsingQuota(q.id).length, 0))

const measureLabel = (v) => (measures.find(m => m.value === v) || {}).label || v
const periodText = (row) => (row.measure === 'cycle' ? row.cycle : row.validWithin || '—')
const measureDesc = computed(() => (measures.find(m => m.value === (current.value ? current.value.measure : '')) || {}).desc || '')

/* ---------- 编辑 ---------- */
const drawerVisible = ref(false)
const current = ref(null)
const drawerTitle = computed(() => (current.value ? `配置假期方案 · ${current.value.name}` : '配置假期方案'))

const openEdit = (row) => {
  current.value = row
  drawerVisible.value = true
}

const removeQuota = () => {
  const idx = quotas.value.findIndex(q => q.id === current.value.id)
  if (idx !== -1) quotas.value.splice(idx, 1)
  drawerVisible.value = false
  ElMessage.success('假期方案已删除')
}

/* ---------- 新建 ---------- */
const createVisible = ref(false)
const emptyForm = () => ({
  name: '', leaveType: '班次假', measure: 'cycle', cycle: '自然月',
  amount: 4, unit: '天', carryOver: false, validWithin: ''
})
const newForm = reactive(emptyForm())

const openCreate = () => {
  Object.assign(newForm, emptyForm())
  createVisible.value = true
}

const createQuota = () => {
  if (!newForm.name.trim()) { ElMessage.warning('请填写方案名称'); return }
  quotas.value.push({
    id: 'qs-' + Date.now(),
    name: newForm.name.trim(),
    leaveType: newForm.leaveType,
    measure: newForm.measure,
    cycle: newForm.measure === 'cycle' ? newForm.cycle : '',
    validWithin: newForm.measure === 'event' ? newForm.validWithin : '',
    amount: newForm.amount,
    unit: newForm.unit,
    carryOver: newForm.carryOver,
    derivedFrom: '',
    note: '',
    builtin: false,
    updatedAt: '2026-10-13'
  })
  createVisible.value = false
  ElMessage.success('假期方案已创建，可在「工作模式」页被岗位引用')
}
</script>

<style scoped>
.quota-page { padding: 0; }
.page-header { margin-bottom: 16px; }
.header-main { display: flex; align-items: center; gap: 10px; }
.header-main h1 { font-size: 22px; font-weight: 600; margin: 0; color: hsl(var(--foreground)); }

.section-card { background: hsl(var(--background)); border: 1px solid hsl(var(--border)); border-radius: 10px; padding: 16px 18px; }
.card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid hsl(var(--border)); }
.card-title { font-size: 15px; font-weight: 600; color: hsl(var(--foreground)); }
.card-sub { font-size: 12px; color: hsl(var(--muted-foreground)); }
.header-actions { margin-left: auto; }

.q-cell { display: flex; flex-direction: column; gap: 2px; }
.q-name { font-size: 13.5px; font-weight: 500; color: hsl(var(--foreground)); }
.q-type { font-size: 11.5px; color: hsl(var(--muted-foreground)); }
.q-period, .q-amount, .q-carry { font-size: 12.5px; color: hsl(var(--foreground)); }

.ref-jobs { display: flex; flex-wrap: wrap; gap: 5px; }
.ref-job {
  font-size: 11.5px; padding: 1px 8px; border-radius: 9px;
  background: hsl(var(--primary) / 0.1); color: hsl(var(--primary)); border: 1px solid hsl(var(--primary) / 0.3);
}
.ref-none { font-size: 12px; color: hsl(var(--muted-foreground) / 0.8); }

/* 抽屉 */
.drawer-body { padding-bottom: 8px; }
.src-banner { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 6px; background: hsl(var(--muted) / 0.45); border: 1px solid hsl(var(--border)); flex-wrap: wrap; margin-bottom: 6px; }
.src-badge { font-size: 11px; padding: 1px 7px; border-radius: 9px; border: 1px solid hsl(var(--border)); color: hsl(var(--muted-foreground)); background: hsl(var(--background)); }
.src-text { font-size: 12px; color: hsl(var(--muted-foreground)); }
.cfg-block { margin-bottom: 18px; }
.cfg-label { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 13px; font-weight: 500; color: hsl(var(--foreground)); }
.cfg-note { font-size: 11px; font-weight: 400; color: hsl(var(--muted-foreground)); }
.cfg-row { display: flex; align-items: center; gap: 10px; margin-top: 10px; }
.row-label { font-size: 12.5px; color: hsl(var(--muted-foreground)); width: 64px; }
.field-desc { font-size: 12px; color: hsl(var(--muted-foreground)); line-height: 1.65; margin-top: 6px; }
.drawer-foot { margin-top: 10px; padding-top: 12px; border-top: 1px solid hsl(var(--border)); }

/* 弹窗 */
.dlg-body { display: flex; flex-direction: column; gap: 16px; }
.dlg-label { font-size: 13px; font-weight: 500; color: hsl(var(--foreground)); margin-bottom: 8px; }
.row-inline { display: flex; align-items: center; gap: 8px; }
</style>
