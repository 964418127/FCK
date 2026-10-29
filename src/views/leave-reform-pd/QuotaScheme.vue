<template>
  <div class="quota-page">
    <div class="page-header">
      <div class="header-main">
        <h1>假期额度方案</h1>
      </div>
    </div>

    <div class="section-card">
      <div class="card-header">
        <span class="card-title">方案库</span>
        <span class="card-sub">{{ hasFilter ? `${filteredQuotas.length} / ${quotas.length} 个方案` : `${quotas.length} 个假期类型` }}</span>
        <el-tooltip placement="top" effect="light" :show-after="120">
          <template #content>
            <div class="help-tip">
              <p><b>三类计量</b>：周期发放 / 周期上限 / 按次上限，每个假种一份方案（按需不设值）。</p>
              <p><b>差异化</b>：覆盖有数值的三档——标准额度 / 获取上限 / 每次上限，只有城市与门店两个维度。</p>
              <p><b>结转</b>：周期发放 / 周期上限可配，按期末剩余额度的比例带入下一周期；与本期发放或折算合计后仍受获取上限封顶。</p>
              <p>表格里的<b>岗位标签可点</b>，点一下按该岗位筛选。</p>
            </div>
          </template>
          <span class="help-dot">?</span>
        </el-tooltip>
        <div class="header-actions">
          <el-select
            v-model="filterType"
            size="small"
            clearable
            filterable
            placeholder="全部假种"
            style="width: 132px"
          >
            <el-option v-for="t in leaveTypes" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
          <el-select
            v-model="filterJobs"
            size="small"
            multiple
            collapse-tags
            collapse-tags-tooltip
            filterable
            clearable
            placeholder="全部岗位"
            style="width: 200px"
          >
            <el-option v-for="j in jobOptions" :key="j" :label="j" :value="j" />
          </el-select>
          <el-button size="small" type="primary" @click="openCreate">+ 新建额度方案</el-button>
        </div>
      </div>

      <div v-if="hasFilter" class="filter-bar">
        <span class="filter-label">筛选</span>
        <span v-if="filterType" class="filter-chip">
          假种 · {{ typeNameOf(filterType) }}
          <i class="chip-x" title="移除" @click="filterType = ''">×</i>
        </span>
        <span v-for="j in filterJobs" :key="j" class="filter-chip job">
          岗位 · {{ j }}
          <i class="chip-x" title="移除" @click="toggleFilterJob(j)">×</i>
        </span>
        <el-button size="small" link type="primary" class="filter-clear" @click="clearFilter">清空筛选</el-button>
      </div>

      <el-table :data="pagedRows" size="small" :empty-text="hasFilter ? '没有匹配的方案，试试清空筛选' : '暂无方案'">
        <el-table-column label="假种 / 方案" min-width="130">
          <template #default="{ row }">
            <div class="q-cell">
              <span class="q-name">{{ typeName(row) }}</span>
              <span class="q-type">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="适用岗位" min-width="280">
          <template #default="{ row }">
            <div v-if="(row.jobs || []).length" class="jobs-tags">
              <span
                v-for="j in row.jobs"
                :key="j"
                class="job-tag clickable"
                :class="{ active: filterJobs.includes(j) }"
                :title="filterJobs.includes(j) ? '取消该岗位筛选' : `筛选适用「${j}」的方案`"
                @click="toggleFilterJob(j)"
              >{{ j }}</span>
            </div>
            <span v-else class="jobs-empty">未指定</span>
          </template>
        </el-table-column>

        <el-table-column label="标准值" min-width="130">
          <template #default="{ row }">
            <span v-if="row.measure === 'ondemand'" class="q-plain">按需</span>
            <template v-else>
              <span class="q-amount">{{ row.measure === 'cap' ? '≤ ' : '' }}{{ row.amount }} {{ row.unit }}</span>
              <span class="q-period">{{ periodText(row) }}</span>
              <span v-if="row.measure === 'cycle' && row.acquireCap != null" class="q-cap">
                本期获取 ≤ {{ row.acquireCap }} {{ row.unit }}
              </span>
            </template>
          </template>
        </el-table-column>

        <el-table-column label="差异化" min-width="330">
          <template #default="{ row }">
            <span v-if="row.measure === 'ondemand'" class="q-plain">不适用</span>
            <div v-else-if="(row.overrides || []).length" class="ov-wrap">
              <span v-for="o in row.overrides" :key="o.id" class="ov-chip" :title="scopeText({ dimension: o.dimension, values: o.values })">
                {{ dimLabel(o.dimension) }} · {{ shortValues(o) }} <b>{{ row.measure === 'cap' ? '≤ ' : '' }}{{ o.amount }}{{ row.unit }}</b>
              </span>
            </div>
            <span v-else class="q-plain">—</span>
          </template>
        </el-table-column>

        <el-table-column label="计量方式" width="96">
          <template #default="{ row }">
            <span class="q-plain">{{ measureLabel(row.measure) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="结转" width="86">
          <template #default="{ row }">
            <span class="q-carry" :class="{ on: canCarry(row) && row.carryOver > 0 }">
              {{ canCarry(row) ? (row.carryOver > 0 ? `剩余 ${row.carryOver}%` : '不结转') : '—' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="82" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="openEdit(row)">配置</el-button>
          </template>
        </el-table-column>
      </el-table>
      <TablePagination v-model:page="page" v-model:page-size="pageSize" :total="total" />
    </div>

    <!-- ============ 配置抽屉 ============ -->
    <el-drawer v-model="drawerVisible" :title="drawerTitle" size="680px" :modal="false">
      <div class="drawer-body" v-if="current">
        <div class="cfg-block">
          <div class="cfg-label"><span>方案名称</span></div>
          <el-input v-model="current.name" size="small" style="max-width: 260px" />
        </div>

        <div class="cfg-block">
          <div class="cfg-label"><span>假种</span></div>
          <el-select v-model="current.leaveTypeId" size="small" filterable style="max-width: 220px" :disabled="isDerivedType(current.leaveTypeId)">
            <el-option v-for="t in leaveTypes" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
          <div class="field-desc">引用假期类型，本页不新建类型</div>
        </div>

        <div class="cfg-block" v-if="!isDerivedType(current.leaveTypeId)">
          <div class="cfg-label"><span>适用岗位</span></div>
          <el-select
            v-model="current.jobs"
            multiple
            filterable
            size="small"
            placeholder="选择适用岗位"
            style="width: 100%"
          >
            <el-option v-for="j in jobOptions" :key="j" :label="j" :value="j" />
          </el-select>
          <div class="field-desc">已选 {{ (current.jobs || []).length }} 个岗位；未勾选的岗位没有这个类型的额度。</div>
        </div>
        <div class="cfg-block" v-else>
          <div class="cfg-label"><span>适用岗位</span></div>
          <div class="field-desc">由假期类型的适用性决定（{{ (current.jobs || []).join('、') || '未指定' }}），本页不改。</div>
        </div>

        <div class="cfg-block">
          <div class="cfg-label"><span>计量方式</span></div>
          <el-radio-group v-model="current.measure" @change="onMeasureChange(current)">
            <el-radio v-for="m in measures" :key="m.value" :value="m.value" :disabled="isDerivedType(current.leaveTypeId) && m.value !== 'cap'">
              {{ m.label }}
            </el-radio>
          </el-radio-group>
          <div class="field-desc">{{ measureDesc }}</div>
        </div>

        <div class="cfg-block unified-block" v-if="current.measure !== 'ondemand'">
          <div class="cfg-label">
            <span>{{ valueLabel }}</span>
            <span class="cfg-note">{{ valueNote }}</span>
          </div>
          <template v-if="current.measure !== 'event'">
            <div class="cfg-row">
              <span class="row-label">周期</span>
              <el-select v-model="current.cycle" size="small" style="max-width: 180px">
                <el-option v-for="c in cycles" :key="c" :label="c" :value="c" />
              </el-select>
            </div>
            <div class="cfg-row">
              <span class="row-label">{{ current.measure === 'cap' ? '上限' : '额度' }}</span>
              <el-input-number v-model="current.amount" size="small" :min="0" :step="1" controls-position="right" style="width: 120px" />
              <el-select v-model="current.unit" size="small" style="width: 96px">
                <el-option v-for="u in units" :key="u" :label="u" :value="u" />
              </el-select>
              <span v-if="canCarry(current)" class="inline-check">
                <span class="inline-text">结转</span>
                <el-input-number
                  v-model="current.carryOver"
                  size="small"
                  :min="0"
                  :max="100"
                  :step="10"
                  controls-position="right"
                  style="width: 100px"
                />
                <span class="inline-text">% 剩余额度</span>
              </span>
            </div>
            <div v-if="canCarry(current)" class="field-desc">
              周期结束时按<strong>剩余额度 × 比例</strong>结转到下一周期，作为下期额度的来源之一：0 = 不结转，100 = 全额结转。
              结转量与本期{{ current.measure === 'cap' ? '折算' : '发放' }}合计后<strong>仍受上限封顶</strong>（{{ current.measure === 'cap' ? '上限就是上面那个数' : '见下方「本期获取上限」' }}）。
            </div>
            <div v-if="current.measure === 'cycle'" class="cfg-row">
              <span class="row-label">获取上限</span>
              <el-input-number
                v-model="current.acquireCap"
                size="small"
                :min="0"
                :step="1"
                :value-on-clear="null"
                controls-position="right"
                placeholder="不限"
                style="width: 120px"
              />
              <span class="inline-text">{{ current.unit }} / 期（留空 = 不限）</span>
            </div>
            <div v-if="current.measure === 'cycle'" class="field-desc">
              本期可得的封顶值：<strong>发放 + 结转</strong> 超过它时按它生效（如 8 天 + 结转 4 天 = 12 天，上限 10 天 → 生效 10 天）。
            </div>
          </template>
          <template v-else>
            <div class="cfg-row">
              <span class="row-label">有效期</span>
              <el-input v-model="current.validWithin" size="small" placeholder="如：领证后 12 个月内" style="max-width: 280px" />
            </div>
            <div class="cfg-row">
              <span class="row-label">每次上限</span>
              <el-input-number v-model="current.amount" size="small" :min="0" :step="1" controls-position="right" style="width: 120px" />
              <el-select v-model="current.unit" size="small" style="width: 96px">
                <el-option v-for="u in units" :key="u" :label="u" :value="u" />
              </el-select>
            </div>
            <div class="field-desc">不预发给员工、不占周期余额；每次申请时校验是否超出上限。</div>
          </template>
        </div>

        <!-- 差异化：只改数值（按需档没有数值，不参与） -->
        <div class="cfg-block" v-if="current.measure !== 'ondemand'">
          <div class="cfg-label">
            <span>差异化</span>
            <span class="cfg-note">{{ current.measure === 'cap' ? '只改上限值，仅城市 / 门店' : '只改数值，仅城市 / 门店' }}</span>
            <el-button size="small" class="cfg-add" @click="addOverride">+ 添加差异化</el-button>
          </div>

          <div v-if="!(current.overrides || []).length" class="field-desc">
            未配置差异化，按标准{{ current.measure === 'cap' ? '上限' : '额度' }}执行。
          </div>

          <div v-for="(o, idx) in current.overrides" :key="o.id" class="ov-row">
            <div class="ov-head">
              <span class="ov-index">{{ idx + 1 }}</span>
              <el-select v-model="o.dimension" size="small" style="width: 106px" @change="onOverrideDim(o)">
                <el-option v-for="d in dimChoices" :key="d.value" :label="d.label" :value="d.value" />
              </el-select>
              <el-select
                v-model="o.values"
                multiple
                filterable
                size="small"
                style="flex: 1; min-width: 190px"
                :placeholder="`选择${dimLabel(o.dimension)}（可多选）`"
              >
                <el-option v-for="v in dimValues(o.dimension)" :key="v" :label="v" :value="v" />
              </el-select>
              <span class="ov-key">{{ current.measure === 'cap' ? '上限' : '额度' }}</span>
              <el-input-number v-model="o.amount" size="small" :min="0" :step="1" controls-position="right" style="width: 104px" />
              <span class="ov-unit">{{ current.unit }}</span>
              <el-button size="small" link type="danger" @click="removeOverride(idx)">删除</el-button>
            </div>
            <div class="ov-sub">
              <el-input v-model="o.note" size="small" placeholder="差异原因（选填）" style="max-width: 420px" />
            </div>
          </div>
        </div>

        <div class="cfg-block">
          <div class="cfg-label">
            <span>取数说明</span>
            <span class="cfg-note">系统折算时填</span>
          </div>
          <el-input v-model="current.derivedFrom" size="small" placeholder="如：按上月业绩折算" style="max-width: 340px" />
        </div>

        <div class="cfg-block last">
          <div class="cfg-label"><span>备注</span></div>
          <el-input v-model="current.note" type="textarea" :rows="2" style="max-width: 440px" />
        </div>

        <div class="drawer-foot">
          <el-popconfirm
            title="删除该假种的额度方案？"
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
    <el-dialog v-model="createVisible" title="新建额度方案" width="560px">
      <div class="dlg-body">
        <div class="dlg-row">
          <div class="dlg-label">假期类型</div>
          <el-select v-model="newForm.leaveTypeId" filterable style="width: 200px" @change="onNewTypeChange">
            <el-option v-for="t in leaveTypes" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
        </div>
        <div v-if="!isDerivedType(newForm.leaveTypeId)" class="dlg-row">
          <div class="dlg-label">适用岗位</div>
          <el-select v-model="newForm.jobs" multiple filterable placeholder="选择适用岗位" style="width: 100%">
            <el-option v-for="j in jobOptions" :key="j" :label="j" :value="j" />
          </el-select>
        </div>
        <div v-else class="dlg-row">
          <div class="dlg-label">适用岗位</div>
          <div class="field-desc" style="margin-top: 0">由假期类型的适用性决定（{{ (capAppJobs || []).join('、') || '未指定' }}），创建后不可在此改。</div>
        </div>
        <div class="dlg-row">
          <div class="dlg-label">计量方式</div>
          <el-radio-group v-model="newForm.measure" @change="onMeasureChange(newForm)">
            <el-radio v-for="m in measures" :key="m.value" :value="m.value" :disabled="isDerivedType(newForm.leaveTypeId) && m.value !== 'cap'">
              {{ m.label }}
            </el-radio>
          </el-radio-group>
        </div>
        <div v-if="newForm.measure !== 'event' && newForm.measure !== 'ondemand'" class="dlg-row">
          <div class="dlg-label">{{ newForm.measure === 'cap' ? '周期 / 获取上限' : '周期 / 标准额度' }}</div>
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
        <div v-if="newForm.measure === 'cycle' || newForm.measure === 'cap'" class="dlg-row">
          <div class="dlg-label">结转比例</div>
          <div class="row-inline">
            <el-input-number v-model="newForm.carryOver" :min="0" :max="100" :step="10" controls-position="right" style="width: 120px" />
            <span class="inline-text">% 剩余额度（0 = 不结转）</span>
          </div>
        </div>
        <div v-else-if="newForm.measure === 'ondemand'" class="dlg-row">
          <div class="field-desc" style="margin-top: 0">按需：不设额度值，只声明岗位有这个假种；天数按法定 / 医疗口径核定，人工审核。</div>
        </div>
        <div v-else class="dlg-row">
          <div class="dlg-label">有效期 / 每次上限</div>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  quotaSchemes,
  schemeLeaveTypeOptions,
  cycleOptions,
  quotaMeasureOptions,
  quotaTypeName,
  diffDimensions,
  dimLabel,
  dimValues,
  scopeText,
  jobWorkModes
} from '../../mock/leaveWorkMode.js'

import { usePager } from '../../composables/usePager.js'
import TablePagination from '../../components/TablePagination.vue'
/* 方案库收全部假期类型：值（额度 / 上限）都只在这一层配置 */
const leaveTypes = schemeLeaveTypeOptions
const cycles = cycleOptions
const measures = quotaMeasureOptions
const units = ['天', '半天', '小时']

const isDerivedType = (id) => (leaveTypes.find(t => t.value === id) || {}).quotaSource === 'derived'
const capAppJobsOf = (id) => (leaveTypes.find(t => t.value === id) || {}).appJobs || []

const quotas = ref(quotaSchemes.map(q => ({
  ...q,
  jobs: [...(q.jobs || [])],
  overrides: (q.overrides || []).map(o => ({ ...o, values: [...o.values] }))
})))

/* 差异化维度：只有城市 / 门店 */
const dimChoices = diffDimensions.filter(d => d.value !== 'all')
/* 适用岗位候选 */
const jobOptions = jobWorkModes.map(m => m.job)

const typeName = (row) => quotaTypeName(row)
/** 哪些档可以结转：周期发放、周期上限（上限档结转后仍按上限封顶） */
const canCarry = (row) => !!row && (row.measure === 'cycle' || row.measure === 'cap')
const measureLabel = (v) => (measures.find(m => m.value === v) || {}).label || v
const periodText = (row) => (row.measure === 'event' ? (row.validWithin ? `/ ${row.validWithin}` : '') : row.cycle ? `/ ${row.cycle}` : '')
const shortValues = (o) => {
  const list = o.values || []
  if (!list.length) return '未指定'
  if (list.length <= 2) return list.join('、')
  return `${list[0]} 等 ${list.length} 个`
}

/* ---------- 筛选：假种 + 岗位标签（多选，任一命中即显示） ---------- */
const filterType = ref('')
const filterJobs = ref([])
const hasFilter = computed(() => Boolean(filterType.value) || filterJobs.value.length > 0)
const typeNameOf = (id) => (leaveTypes.find(t => t.value === id) || {}).label || id

const filteredQuotas = computed(() =>
  quotas.value.filter(q => {
    if (filterType.value && q.leaveTypeId !== filterType.value) return false
    if (filterJobs.value.length) {
      const jobs = q.jobs || []
      if (!filterJobs.value.some(j => jobs.includes(j))) return false
    }
    return true
  })
)

/** 岗位标签既是筛选项也是筛选入口：点一次加上、再点一次去掉 */
const toggleFilterJob = (job) => {
  if (!job) return
  const idx = filterJobs.value.indexOf(job)
  if (idx === -1) filterJobs.value.push(job)
  else filterJobs.value.splice(idx, 1)
}
const clearFilter = () => {
  filterType.value = ''
  filterJobs.value = []
}

/* ---------- 编辑 ---------- */
const drawerVisible = ref(false)
const current = ref(null)
const drawerTitle = computed(() => (current.value ? `配置额度方案 · ${typeName(current.value)}` : '配置额度方案'))

/** 计量方式的说明与数值区标签 */
const measureDesc = computed(() => (measures.find(m => m.value === current.value.measure) || {}).desc || '')
const valueLabel = computed(() => ({ cycle: '标准额度', cap: '获取上限', event: '每次上限', ondemand: '按需' }[current.value.measure] || '标准额度'))
const valueNote = computed(() => ({ cycle: '全公司打底值，预发给员工', cap: '不预发，折算值超过按上限计', event: '不预发，每次申请封顶', ondemand: '不设额度值，按需申请' }[current.value.measure] || ''))

/** 切换计量方式时清理不用的字段 */
const onMeasureChange = (s) => {
  if (s.measure === 'cap') {
    s.validWithin = ''
    s.acquireCap = null
    if (!s.cycle) s.cycle = '自然月'
  } else if (s.measure === 'event') {
    s.cycle = ''
    s.carryOver = 0
    s.acquireCap = null
  } else if (s.measure === 'ondemand') {
    s.cycle = ''
    s.validWithin = ''
    s.carryOver = 0
    s.acquireCap = null
    s.amount = null
    /* 按需档没有数值，差异化条目无处生效 —— 一并清掉，避免切回来时残留旧值 */
    if (s.overrides) s.overrides = []
  } else {
    s.validWithin = ''
    if (!s.cycle) s.cycle = '自然月'
  }
}

const openEdit = (row) => {
  current.value = row
  drawerVisible.value = true
}

const addOverride = () => {
  if (!current.value.overrides) current.value.overrides = []
  current.value.overrides.push({
    id: 'ov-' + Date.now(),
    dimension: 'city',
    values: [],
    amount: current.value.amount,
    note: ''
  })
}
const onOverrideDim = (o) => { o.values = [] }
const removeOverride = (idx) => { current.value.overrides.splice(idx, 1) }

const removeQuota = () => {
  const idx = quotas.value.findIndex(q => q.id === current.value.id)
  if (idx !== -1) quotas.value.splice(idx, 1)
  drawerVisible.value = false
  ElMessage.success('方案已删除')
}

/* 文档截图入口：?open=<假种id> 时自动打开该假种的配置抽屉（配合 ?shot=1 截「功能页面示例」） */
const route = useRoute()
onMounted(() => {
  const target = route.query.open
  if (!target) return
  const hit = quotas.value.find(q => q.leaveTypeId === target)
  if (hit) openEdit(hit)
})

/* ---------- 新建 ----------
const createVisible = ref(false)
const emptyForm = () => ({
  name: '', leaveTypeId: 'annual', jobs: [], measure: 'cycle', cycle: '自然年',
  amount: 5, unit: '天', carryOver: 0, acquireCap: null, validWithin: ''
})
const newForm = reactive(emptyForm())
const capAppJobs = computed(() => capAppJobsOf(newForm.leaveTypeId))

const openCreate = () => {
  Object.assign(newForm, emptyForm())
  newForm.jobs = []
  createVisible.value = true
}

/** 选到系统折算类型时，计量方式自动切到「周期上限」 */
const onNewTypeChange = (id) => {
  if (isDerivedType(id) && newForm.measure !== 'cap') {
    newForm.measure = 'cap'
    onMeasureChange(newForm)
  }
}

const createQuota = () => {
  const clash = quotas.value.find(q => q.leaveTypeId === newForm.leaveTypeId)
  if (clash) {
    ElMessage.warning(`「${typeName(clash)}」已有额度方案，差异化请在该方案里添加`)
    return
  }
  const derived = isDerivedType(newForm.leaveTypeId)
  if (derived) newForm.jobs = [...capAppJobs.value]
  else if (!newForm.jobs.length) {
    ElMessage.warning('请选择适用岗位')
    return
  }
  quotas.value.push({
    id: 'qs-' + Date.now(),
    name: newForm.name.trim() || (leaveTypes.find(t => t.value === newForm.leaveTypeId) || {}).label || '未命名方案',
    leaveTypeId: newForm.leaveTypeId,
    measure: newForm.measure,
    cycle: newForm.measure === 'event' ? '' : newForm.cycle,
    validWithin: newForm.measure === 'event' ? newForm.validWithin : '',
    amount: newForm.amount,
    unit: newForm.unit,
    carryOver: (newForm.measure === 'cycle' || newForm.measure === 'cap') ? Number(newForm.carryOver || 0) : 0,
    acquireCap: newForm.measure === 'cycle' ? (newForm.acquireCap ?? null) : null,
    jobs: [...newForm.jobs],
    overrides: [],
    derivedFrom: derived ? '按上月业绩折算；折算值超过上限按上限计' : '',
    note: '',
    builtin: false,
    updatedAt: '2026-10-21'
  })
  createVisible.value = false
  ElMessage.success('已创建')
}

/* 分页：数据已筛选 / 排序，这里只切片 */
const { page: page, pageSize: pageSize, total: total, rows: pagedRows } = usePager(filteredQuotas)
</script>

<style scoped>
.quota-page { padding: 0; }
.page-header { margin-bottom: 14px; }
.header-main { display: flex; align-items: center; gap: 10px; }
.header-main h1 { font-size: 22px; font-weight: 600; margin: 0; color: hsl(var(--foreground)); }

.section-card { background: hsl(var(--background)); border: 1px solid hsl(var(--border)); border-radius: 10px; padding: 16px 18px; }
.card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; padding-bottom: 11px; border-bottom: 1px solid hsl(var(--border)); flex-wrap: wrap; }
.card-title { font-size: 15px; font-weight: 600; color: hsl(var(--foreground)); }
.card-sub { font-size: 12px; color: hsl(var(--muted-foreground)); }
.card-note { font-size: 11.5px; color: hsl(var(--muted-foreground) / 0.85); margin-left: auto; }
.header-actions { margin-left: auto; display: flex; align-items: center; gap: 8px; }

.q-cell { display: flex; flex-direction: column; gap: 2px; }
.q-name { font-size: 13.5px; font-weight: 500; color: hsl(var(--foreground)); }
.q-type { font-size: 11.5px; color: hsl(var(--muted-foreground)); }
.q-amount { font-size: 12.5px; font-weight: 500; color: hsl(var(--foreground)); margin-right: 4px; }
.q-period { font-size: 11.5px; color: hsl(var(--muted-foreground)); }
.q-carry, .q-plain { font-size: 12.5px; color: hsl(var(--muted-foreground)); }
.q-carry.on { color: hsl(var(--primary)); font-weight: 500; }
.q-cap { display: block; margin-top: 2px; font-size: 11px; color: hsl(38 92% 38%); }

/* 说明气泡 */
.help-dot {
  width: 16px; height: 16px; flex-shrink: 0; cursor: help;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 11px; line-height: 1; border-radius: 50%;
  border: 1px solid hsl(var(--border)); background: hsl(var(--muted) / 0.55);
  color: hsl(var(--muted-foreground));
}
.help-dot:hover { border-color: hsl(var(--primary) / 0.5); color: hsl(var(--primary)); }
.help-tip { max-width: 300px; font-size: 12px; line-height: 1.75; color: hsl(var(--foreground)); }
.help-tip p { margin: 0 0 5px; }
.help-tip p:last-child { margin-bottom: 0; }
.jobs-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.job-tag {
  font-size: 11px; line-height: 1.7; padding: 0 8px; border-radius: 9px;
  background: hsl(var(--primary) / 0.08); border: 1px solid hsl(var(--primary) / 0.3);
  color: hsl(var(--primary)); white-space: nowrap;
}
.jobs-empty { font-size: 12px; color: hsl(var(--muted-foreground)); }
.job-tag.clickable { cursor: pointer; transition: background .15s, border-color .15s, color .15s; }
.job-tag.clickable:hover { background: hsl(var(--primary) / 0.16); }
.job-tag.active { background: hsl(var(--primary)); border-color: hsl(var(--primary)); color: #fff; }

/* 筛选条 */
.filter-bar { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin: -2px 0 10px; padding: 7px 10px; border-radius: 8px; background: hsl(var(--muted) / 0.35); }
.filter-label { font-size: 11.5px; color: hsl(var(--muted-foreground)); margin-right: 2px; }
.filter-chip {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11.5px; padding: 1px 4px 1px 9px; border-radius: 10px;
  border: 1px solid hsl(var(--primary) / 0.3); background: hsl(var(--primary) / 0.08); color: hsl(var(--primary));
}
.filter-chip.job { border-color: hsl(var(--border)); background: hsl(var(--background)); color: hsl(var(--foreground)); }
.chip-x { font-style: normal; cursor: pointer; padding: 0 3px; font-size: 13px; line-height: 1; color: hsl(var(--muted-foreground)); }
.chip-x:hover { color: hsl(var(--primary)); }
.filter-clear { margin-left: 4px; }

.ov-wrap { display: flex; flex-wrap: wrap; gap: 5px; }
.ov-chip {
  font-size: 11.5px; padding: 2px 8px; border-radius: 10px;
  border: 1px solid hsl(38 92% 50% / 0.4); background: hsl(38 92% 50% / 0.1); color: hsl(38 92% 38%);
}
.ov-chip b { font-weight: 600; margin-left: 2px; }

/* 抽屉 */
.drawer-body { padding-bottom: 8px; }
.cfg-block { margin-bottom: 18px; }
.cfg-label { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 13px; font-weight: 500; color: hsl(var(--foreground)); }
.cfg-note { font-size: 11px; font-weight: 400; color: hsl(var(--muted-foreground)); }
.cfg-add { margin-left: auto; }
.cfg-row { display: flex; align-items: center; gap: 10px; margin-top: 10px; }
.row-label { font-size: 12.5px; color: hsl(var(--muted-foreground)); width: 56px; }
.field-desc { font-size: 12px; color: hsl(var(--muted-foreground)); line-height: 1.65; margin-top: 6px; }
.unified-block { border: 1px solid hsl(var(--border)); border-radius: 8px; padding: 12px 14px; background: hsl(var(--muted) / 0.2); }
.inline-check { display: inline-flex; align-items: center; gap: 6px; margin-left: 6px; }
.inline-text { font-size: 12.5px; color: hsl(var(--muted-foreground)); }

/* 差异化行 */
.ov-row { border: 1px solid hsl(38 92% 50% / 0.35); border-radius: 8px; padding: 10px 12px; margin-bottom: 8px; background: hsl(38 92% 50% / 0.04); }
.ov-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.ov-index {
  width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0;
  font-size: 11px; display: inline-flex; align-items: center; justify-content: center;
  background: hsl(38 92% 50% / 0.15); color: hsl(38 92% 38%); font-weight: 600;
}
.ov-unit { font-size: 12px; color: hsl(var(--muted-foreground)); }
.ov-key { font-size: 11.5px; color: hsl(var(--muted-foreground)); }
.ov-sub { margin-top: 8px; }

.drawer-foot { margin-top: 10px; padding-top: 12px; border-top: 1px solid hsl(var(--border)); }

/* 弹窗 */
.dlg-body { display: flex; flex-direction: column; gap: 16px; }
.dlg-label { font-size: 13px; font-weight: 500; color: hsl(var(--foreground)); margin-bottom: 8px; }
.row-inline { display: flex; align-items: center; gap: 8px; }
</style>
