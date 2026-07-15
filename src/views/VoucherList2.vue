<template>
  <div class="voucher-list-2">
    <div class="page-header">
      <h1>工资表</h1>
    </div>

    <div class="content-section">
      <!-- 体系锁定区（必选三维） -->
      <div class="gate-section">
        <el-form :inline="true" :model="gateForm" class="gate-form">
          <el-form-item label="计薪月份" required>
            <el-date-picker
              v-model="gateForm.month"
              type="month"
              placeholder="选择月份"
              value-format="YYYY-MM"
              style="width: 150px;"
            />
          </el-form-item>
          <el-form-item label="岗位" required>
            <el-select
              v-model="gateForm.position"
              placeholder="选择岗位"
              style="width: 140px;"
              @change="handlePositionChange"
            >
              <el-option v-for="p in positionOptions" :key="p" :label="p" :value="p" />
            </el-select>
          </el-form-item>
          <el-form-item label="发放策略" required>
            <el-select
              v-model="gateForm.strategyId"
              placeholder="先选岗位"
              :disabled="!gateForm.position"
              style="width: 320px;"
            >
              <el-option
                v-for="s in strategiesForPosition"
                :key="s.id"
                :label="s.name"
                :value="s.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button @click="handleResetGate">重置</el-button>
          </el-form-item>
        </el-form>

        <div v-if="isSystemReady" class="system-banner">
          <div class="banner-main">
            <span class="banner-label">当前体系</span>
            <strong>{{ gateForm.month }}</strong>
            <span class="banner-sep">·</span>
            <strong>{{ gateForm.position }}</strong>
            <span class="banner-sep">·</span>
            <strong>{{ currentStrategy.name }}</strong>
          </div>
          <div class="banner-meta">
            薪酬模板：{{ currentStrategy.templateName }}
            ｜ 发薪频次：{{ getFrequencyLabel(currentStrategy.frequency) }}
            ｜ 本月工资单骨架：<strong>{{ slipSlots.length }}</strong> 张/人
            <template v-if="slipSlots.length">
              （{{ slipSlots.map(s => s.label).join('、') }}）
            </template>
            ｜ 当前已出单：<strong>{{ issuedSlipCount }}</strong> 张
            <span v-if="hasEmptySlots" class="banner-note">（空槽 = 尚未生成，常见于周期进行中）</span>
          </div>
        </div>
      </div>

      <!-- 未锁定：空态 -->
      <div v-if="!isSystemReady" class="empty-gate">
        <div class="empty-gate-title">请先选定核对体系</div>
        <div class="empty-gate-desc">
          计薪月份、岗位、发放策略三者齐备后，才会加载同一骨架下的员工工资单列表。
        </div>
      </div>

      <!-- 已锁定：辅筛 + 列表 -->
      <template v-else>
        <div class="filter-section">
          <el-form :inline="true" :model="filterForm">
            <el-form-item label="员工">
              <el-input
                v-model="filterForm.employee"
                placeholder="姓名或工号"
                clearable
                style="width: 160px;"
              />
            </el-form-item>
            <el-form-item label="门店">
              <el-select v-model="filterForm.store" placeholder="全部" clearable filterable style="width: 140px;">
                <el-option v-for="s in storeOptions" :key="s" :label="s" :value="s" />
              </el-select>
            </el-form-item>
            <el-form-item label="城市">
              <el-select v-model="filterForm.city" placeholder="全部" clearable filterable style="width: 120px;">
                <el-option v-for="c in cityOptions" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
            <el-form-item label="合作模式">
              <el-select v-model="filterForm.coopMode" placeholder="全部" clearable style="width: 130px;">
                <el-option v-for="opt in coopModeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="劳动主体">
              <el-select v-model="filterForm.entity" placeholder="全部" clearable filterable style="width: 220px;">
                <el-option v-for="e in entityOptions" :key="e" :label="e" :value="e" />
              </el-select>
            </el-form-item>
            <el-form-item label="工资单状态">
              <el-select v-model="filterForm.status" placeholder="全部" clearable style="width: 130px;">
                <el-option label="待确认" value="pending" />
                <el-option label="待发放" value="confirmed" />
                <el-option label="已发放" value="paid" />
                <el-option label="发放失败" value="failed" />
              </el-select>
            </el-form-item>
          </el-form>
          <div class="filter-actions">
            <el-button @click="handleExport">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </div>
        </div>

        <el-table
          :data="tableRows"
          border
          stripe
          size="small"
          class="payroll-table"
          style="width: 100%;"
          :key="tableKey"
          empty-text="该体系下暂无员工数据"
        >
          <!-- 固定左：员工 -->
          <el-table-column label="员工" width="100" fixed>
            <template #default="{ row }">
              <div class="employee-cell">
                <div class="employee-name">{{ row.employeeName }}</div>
                <div class="employee-no">{{ row.employeeNo }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="talentId" label="人才库ID" width="90" fixed show-overflow-tooltip />
          <el-table-column prop="city" label="城市" width="80" show-overflow-tooltip />
          <el-table-column prop="storeName" label="门店" width="110" show-overflow-tooltip />
          <el-table-column prop="laborContractEntity" label="劳动合同单位" width="200" show-overflow-tooltip />
          <el-table-column label="合作模式" width="100">
            <template #default="{ row }">{{ formatCoopMode(row.coopMode) }}</template>
          </el-table-column>

          <!-- 横向：每张工资单一组完整信息链（含本单收款信息） -->
          <el-table-column
            v-for="slot in slipSlots"
            :key="slot.key"
            :label="slot.label"
            align="center"
          >
            <el-table-column label="计薪周期" width="168">
              <template #default="{ row }">
                <span v-if="row.slipsBySlot[slot.key]" class="period-text">
                  {{ formatSlotPeriod(row.slipsBySlot[slot.key]) }}
                </span>
                <span v-else class="empty-slot">未出单</span>
              </template>
            </el-table-column>
            <!-- 收入组：每个组 1 列 -->
            <el-table-column
              v-for="g in incomeGroupDefs"
              :key="`${slot.key}-inc-${g.key}`"
              :label="g.label"
              width="92"
              align="right"
            >
              <template #default="{ row }">
                <span v-if="row.slipsBySlot[slot.key]">{{ formatAmount(getGroupTotal(row.slipsBySlot[slot.key], g.key)) }}</span>
                <span v-else class="text-muted">—</span>
              </template>
            </el-table-column>
            <!-- 收入合计 -->
            <el-table-column label="合计收入" width="96" align="right">
              <template #default="{ row }">
                <strong v-if="row.slipsBySlot[slot.key]">{{ formatAmount(getIncomeTotal(row.slipsBySlot[slot.key])) }}</strong>
                <span v-else class="text-muted">—</span>
              </template>
            </el-table-column>
            <!-- 扣缴组：每个组 1 列 -->
            <el-table-column
              v-for="g in deductionGroupDefs"
              :key="`${slot.key}-ded-${g.key}`"
              :label="g.label"
              width="92"
              align="right"
            >
              <template #default="{ row }">
                <span
                  v-if="row.slipsBySlot[slot.key]"
                  class="amount-withholding"
                >- {{ formatAmount(getGroupTotal(row.slipsBySlot[slot.key], g.key)) }}</span>
                <span v-else class="text-muted">—</span>
              </template>
            </el-table-column>
            <!-- 合计扣缴 -->
            <el-table-column label="合计扣缴" width="96" align="right">
              <template #default="{ row }">
                <strong
                  v-if="row.slipsBySlot[slot.key]"
                  class="amount-withholding"
                >- {{ formatAmount(getBusinessDeductionTotal(row.slipsBySlot[slot.key]) + getWithholdingTotal(row.slipsBySlot[slot.key])) }}</strong>
                <span v-else class="text-muted">—</span>
              </template>
            </el-table-column>
            <!-- 应发 -->
            <el-table-column label="应发" width="88" align="right">
              <template #default="{ row }">
                <strong
                  v-if="row.slipsBySlot[slot.key]"
                  class="primary-amount"
                >{{ formatAmount(getPayable(row.slipsBySlot[slot.key])) }}</strong>
                <span v-else class="text-muted">—</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="92" align="center">
              <template #default="{ row }">
                <el-tag
                  v-if="row.slipsBySlot[slot.key]"
                  :type="getStatusTagType(row.slipsBySlot[slot.key].status)"
                  size="small"
                >
                  {{ getStatusLabel(row.slipsBySlot[slot.key].status) }}
                </el-tag>
                <span v-else class="empty-slot">未出单</span>
              </template>
            </el-table-column>
            <el-table-column label="收款人" width="72" show-overflow-tooltip>
              <template #default="{ row }">
                <span v-if="row.slipsBySlot[slot.key]">{{ getPayee(row.slipsBySlot[slot.key]).name || '—' }}</span>
                <span v-else class="text-muted">—</span>
              </template>
            </el-table-column>
            <el-table-column label="收款开户行" width="130" show-overflow-tooltip>
              <template #default="{ row }">
                <span v-if="row.slipsBySlot[slot.key]">{{ getPayee(row.slipsBySlot[slot.key]).bank || '—' }}</span>
                <span v-else class="text-muted">—</span>
              </template>
            </el-table-column>
            <el-table-column label="收款账号" width="118" show-overflow-tooltip>
              <template #default="{ row }">
                <span v-if="row.slipsBySlot[slot.key]" class="mono">{{ getPayee(row.slipsBySlot[slot.key]).account || '—' }}</span>
                <span v-else class="text-muted">—</span>
              </template>
            </el-table-column>
            <el-table-column label="确认时间" width="100">
              <template #default="{ row }">
                <span :class="{ 'text-muted': !row.slipsBySlot[slot.key]?.confirmDate }">
                  {{ row.slipsBySlot[slot.key]?.confirmDate || '—' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="付款单位" width="200" show-overflow-tooltip>
              <template #default="{ row }">
                <span v-if="getPayment(row.slipsBySlot[slot.key])">
                  {{ getPayment(row.slipsBySlot[slot.key]).payerEntity }}
                </span>
                <span v-else class="text-muted">—</span>
              </template>
            </el-table-column>
            <el-table-column label="付款时间" width="148">
              <template #default="{ row }">
                <span :class="{ 'text-muted': !getPayment(row.slipsBySlot[slot.key])?.payerTime }">
                  {{ getPayment(row.slipsBySlot[slot.key])?.payerTime || '—' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="56" align="center">
              <template #default="{ row }">
                <el-button
                  v-if="row.slipsBySlot[slot.key]"
                  type="primary"
                  size="small"
                  link
                  @click="handleSlipDetail(row, row.slipsBySlot[slot.key])"
                >详情</el-button>
                <span v-else class="text-muted">—</span>
              </template>
            </el-table-column>
          </el-table-column>

          <!-- 社保 / 公积金（购买单位 + 单位/个人部分分列） -->
          <el-table-column label="社保购买单位" width="200" show-overflow-tooltip>
            <template #default="{ row }">
              <span :class="{ 'text-muted': !row.socialPurchasingEntity || row.socialPurchasingEntity === '/' }">
                {{ row.socialPurchasingEntity && row.socialPurchasingEntity !== '/' ? row.socialPurchasingEntity : '—' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="社保单位部分" width="108" align="right">
            <template #default="{ row }">
              <span v-if="row.socialEmployerPart">{{ formatAmount(row.socialEmployerPart) }}</span>
              <span v-else class="text-muted">—</span>
            </template>
          </el-table-column>
          <el-table-column label="社保个人部分" width="108" align="right">
            <template #default="{ row }">
              <span v-if="row.socialPersonalPart">{{ formatAmount(row.socialPersonalPart) }}</span>
              <span v-else class="text-muted">—</span>
            </template>
          </el-table-column>
          <el-table-column label="公积金购买单位" width="200" show-overflow-tooltip>
            <template #default="{ row }">
              <span :class="{ 'text-muted': !row.fundPurchasingEntity || row.fundPurchasingEntity === '/' }">
                {{ row.fundPurchasingEntity && row.fundPurchasingEntity !== '/' ? row.fundPurchasingEntity : '—' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="公积金单位部分" width="118" align="right">
            <template #default="{ row }">
              <span v-if="row.fundEmployerPart">{{ formatAmount(row.fundEmployerPart) }}</span>
              <span v-else class="text-muted">—</span>
            </template>
          </el-table-column>
          <el-table-column label="公积金个人部分" width="118" align="right">
            <template #default="{ row }">
              <span v-if="row.fundPersonalPart">{{ formatAmount(row.fundPersonalPart) }}</span>
              <span v-else class="text-muted">—</span>
            </template>
          </el-table-column>

          <!-- 本月合计 -->
          <el-table-column label="本月应发合计" width="110" align="right" fixed="right">
            <template #default="{ row }">
              <strong class="primary-amount">{{ formatAmount(row.monthPayable) }}</strong>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// ==================== 基础选项 ====================
const positionOptions = ['推拿师', '客户经理', '总部职能']

const frequencyLabelMap = {
  biweekly: '策略编排 2 张/月（核算区间由策略配置）',
  weekly: '策略编排多张/月（按周核算区间）',
  monthly: '策略编排 1 张/月',
  per_order: '策略编排按单结算'
}
const getFrequencyLabel = (freq) => frequencyLabelMap[freq] || freq


// 数据：发放策略 / 员工 / 工资单（共享 mock 模块）
import { strategies } from '../mock/strategies.js'
import { employees } from '../mock/employees.js'
import { wageSlips } from '../mock/wageSlips.js'

const strategyMap = Object.fromEntries(strategies.map(s => [s.id, s]))
const employeeMap = Object.fromEntries(employees.map(e => [e.id, e]))

// ==================== 体系锁定 ====================
const gateForm = reactive({
  month: '2026-06',
  position: '推拿师',
  strategyId: '1109493788878143500'
})

const filterForm = reactive({
  employee: '',
  store: '',
  city: '',
  coopMode: '',
  entity: '',
  status: ''
})

const coopModeOptions = [
  { label: '全职', value: '劳动合同-全日制' },
  { label: '非全职', value: '非全日制劳动合同' },
  { label: '兼职', value: '劳务合作-兼职' },
  { label: '返聘', value: '劳务合作-返聘' }
]

// 门店 / 城市 / 劳动主体：从员工池聚合唯一值（按字母 / 拼音顺序）
const uniqueValues = (key) => {
  const set = new Set(employees.map(e => e[key]).filter(Boolean))
  return [...set].sort((a, b) => a.localeCompare(b, 'zh'))
}
const storeOptions = uniqueValues('storeName')
const cityOptions = uniqueValues('city')
const entityOptions = uniqueValues('laborContractEntity')

const coopModeLabelMap = Object.fromEntries(
  coopModeOptions.map(o => [o.value, o.label])
)
const coopModeValueMap = Object.fromEntries(
  coopModeOptions.map(o => [o.label, o.value])
)
const formatCoopMode = (val) => coopModeLabelMap[val] || val || '—'

const strategiesForPosition = computed(() =>
  strategies.filter(s => s.position === gateForm.position)
)

const currentStrategy = computed(() => strategyMap[gateForm.strategyId] || null)

const isSystemReady = computed(() =>
  Boolean(gateForm.month && gateForm.position && gateForm.strategyId && currentStrategy.value)
)

const tableKey = computed(() =>
  `${gateForm.month}|${gateForm.position}|${gateForm.strategyId}`
)

const handlePositionChange = () => {
  const stillValid = strategiesForPosition.value.some(s => s.id === gateForm.strategyId)
  if (!stillValid) gateForm.strategyId = ''
}

const handleResetGate = () => {
  gateForm.month = ''
  gateForm.position = ''
  gateForm.strategyId = ''
  filterForm.employee = ''
  filterForm.store = ''
  filterForm.city = ''
  filterForm.coopMode = ''
  filterForm.entity = ''
  filterForm.status = ''
}

const handleExport = () => {
  ElMessage.success(`已提交导出任务（${tableRows.value.length} 人）`)
}

// ==================== 工资单骨架（策略自定义名称 + 核算区间；同体系人数一致）====================
const daysInMonth = (month) => {
  const [y, m] = month.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

const pad2 = (n) => String(n).padStart(2, '0')

const formatDate = (d) => {
  const y = d.getFullYear()
  const m = pad2(d.getMonth() + 1)
  const day = pad2(d.getDate())
  return `${y}-${m}-${day}`
}

/** 按 periodRule 解析当月核算区间（规则可配，与工资单展示名无关） */
const resolvePeriod = (month, periodRule) => {
  const last = daysInMonth(month)
  if (periodRule === 'day_1_15') {
    return { periodStart: `${month}-01`, periodEnd: `${month}-15` }
  }
  if (periodRule === 'day_16_eom') {
    return { periodStart: `${month}-16`, periodEnd: `${month}-${pad2(last)}` }
  }
  if (periodRule === 'full_month') {
    return { periodStart: `${month}-01`, periodEnd: `${month}-${pad2(last)}` }
  }
  if (String(periodRule).startsWith('week_')) {
    const weekIdx = Number(String(periodRule).replace('week_', '')) || 1
    let cursor = new Date(`${month}-01T00:00:00`)
    const dow = cursor.getDay()
    const offset = dow === 0 ? -6 : 1 - dow
    cursor.setDate(cursor.getDate() + offset)
    cursor.setDate(cursor.getDate() + (weekIdx - 1) * 7)
    const start = new Date(cursor)
    const end = new Date(cursor)
    end.setDate(end.getDate() + 6)
    return { periodStart: formatDate(start), periodEnd: formatDate(end) }
  }
  if (String(periodRule).startsWith('order_')) {
    return { periodStart: null, periodEnd: null, orderIndex: Number(String(periodRule).replace('order_', '')) - 1 }
  }
  return { periodStart: null, periodEnd: null }
}

const buildSlipSlots = (strategy, month) => {
  if (!strategy || !month) return []
  const defs = strategy.slips || []
  return defs.map((def) => {
    const period = resolvePeriod(month, def.periodRule)
    return {
      key: def.key,
      label: def.name, // 自定义名称，不写死上下半月等语义
      periodStart: period.periodStart,
      periodEnd: period.periodEnd,
      orderIndex: period.orderIndex
    }
  })
}

const slipSlots = computed(() => {
  if (!isSystemReady.value) return []
  return buildSlipSlots(currentStrategy.value, gateForm.month)
})

const incomeGroupDefs = computed(() => currentStrategy.value?.incomeGroupDefs || [])
const deductionGroupDefs = computed(() => currentStrategy.value?.deductionGroupDefs || [])

// 将员工工资单匹配到骨架槽位
const matchSlipToSlot = (slip, slot, strategy) => {
  if (strategy.frequency === 'per_order') return false // 按序匹配
  return slip.periodStart === slot.periodStart && slip.periodEnd === slot.periodEnd
}

const slipsInMonthForEmployee = (employeeId, month) => {
  return wageSlips
    .filter(s => s.employeeId === employeeId)
    .filter(s => {
      // 周期与月份有交集
      return s.periodEnd.slice(0, 7) >= month && s.periodStart.slice(0, 7) <= month
    })
    .sort((a, b) => a.periodStart.localeCompare(b.periodStart) || a.slipNo.localeCompare(b.slipNo))
}

// ==================== 表格行：一人一行 ====================
const tableRows = computed(() => {
  if (!isSystemReady.value) return []
  const strategy = currentStrategy.value
  const slots = slipSlots.value
  const month = gateForm.month

  let list = employees.filter(
    e => e.position === gateForm.position && e.strategyId === strategy.id
  )

  if (filterForm.employee) {
    const kw = filterForm.employee
    list = list.filter(e => e.name.includes(kw) || e.no.includes(kw))
  }
  if (filterForm.store) {
    list = list.filter(e => e.storeName.includes(filterForm.store))
  }
  if (filterForm.city) {
    list = list.filter(e => (e.city || '').includes(filterForm.city))
  }
  if (filterForm.coopMode) {
    list = list.filter(e => e.coopMode === filterForm.coopMode)
  }
  if (filterForm.entity) {
    const kw = filterForm.entity
    list = list.filter(e => (e.laborContractEntity || '').includes(kw))
  }

  const rows = list.map(emp => {
    const monthSlips = slipsInMonthForEmployee(emp.id, month)
    const slipsBySlot = {}

    if (strategy.frequency === 'per_order') {
      slots.forEach((slot, i) => {
        slipsBySlot[slot.key] = monthSlips[i] || null
      })
    } else {
      slots.forEach(slot => {
        slipsBySlot[slot.key] =
          monthSlips.find(s => matchSlipToSlot(s, slot, strategy)) || null
      })
    }

    // 状态辅筛：任一槽位命中即保留
    if (filterForm.status) {
      const hit = Object.values(slipsBySlot).some(s => s && s.status === filterForm.status)
      if (!hit) return null
    }

    const monthPayable = Object.values(slipsBySlot).reduce((sum, s) => {
      return sum + (s ? getPayable(s) : 0)
    }, 0)

    // 社保/公积金购买：取本月任一工资单上的购买信息（通常落在含代扣的那张）
    const slipWithSocial = Object.values(slipsBySlot).find(
      s => s && s.socialPurchasingEntity && s.socialPurchasingEntity !== '/'
    )
    const slipWithFund = Object.values(slipsBySlot).find(
      s => s && s.fundPurchasingEntity && s.fundPurchasingEntity !== '/'
    )

    return {
      talentId: emp.id,
      employeeId: emp.id,
      employeeName: emp.name,
      employeeNo: emp.no,
      position: emp.position,
      city: emp.city,
      storeName: emp.storeName,
      laborContractEntity: emp.laborContractEntity,
      coopMode: emp.coopMode,
      slipsBySlot,
      monthPayable,
      socialPurchasingEntity: slipWithSocial?.socialPurchasingEntity || '/',
      socialEmployerPart: slipWithSocial ? getSocialEmployerPart(slipWithSocial) : 0,
      socialPersonalPart: slipWithSocial ? getSocialPersonalPart(slipWithSocial) : 0,
      fundPurchasingEntity: slipWithFund?.fundPurchasingEntity || '/',
      fundEmployerPart: slipWithFund?.fundEmployerPart || 0,
      fundPersonalPart: slipWithFund ? getFundPersonalPart(slipWithFund) : 0
    }
  }).filter(Boolean)

  return rows.sort((a, b) => a.employeeName.localeCompare(b.employeeName, 'zh'))
})

const totalPayable = computed(() =>
  tableRows.value.reduce((s, r) => s + r.monthPayable, 0)
)

const issuedSlipCount = computed(() =>
  tableRows.value.reduce(
    (n, r) => n + Object.values(r.slipsBySlot).filter(Boolean).length,
    0
  )
)

const hasEmptySlots = computed(() =>
  tableRows.value.some(r =>
    slipSlots.value.some(slot => !r.slipsBySlot[slot.key])
  )
)

// ==================== 详情：跳转到独立页面 ====================
import { useRouter } from 'vue-router'
const router = useRouter()

const handleSlipDetail = (row, slip) => {
  router.push({ name: 'voucher-list-2-slip-detail', params: { slipNo: slip.slipNo } })
}

// ==================== 工具 ====================
const sumItems = (items) => (items || []).reduce((s, i) => s + (i.amount || 0), 0)
const sumGroup = (group) => sumItems(group?.items)
const sumGroups = (groups) => (groups || []).reduce((s, g) => s + sumGroup(g), 0)

/** 合计收入：所有收入组的合计 */
const getIncomeTotal = (slip) => {
  if (!slip) return 0
  return sumGroups(slip.incomeGroups)
}

/** 业务扣款组小计（扣缴1 等） */
const getBusinessDeductionTotal = (slip) => {
  if (!slip) return 0
  return (slip.deductionGroups || [])
    .filter(g => g.groupKey === 'biz')
    .reduce((s, g) => s + sumGroup(g), 0)
}

/** 法定扣缴组小计（扣缴2 等） */
const getWithholdingTotal = (slip) => {
  if (!slip) return 0
  return (slip.deductionGroups || [])
    .filter(g => g.groupKey === 'stat')
    .reduce((s, g) => s + sumGroup(g), 0)
}

/** 取指定组 key 的小计 */
const getGroupTotal = (slip, groupKey) => {
  if (!slip) return 0
  const g = (slip.deductionGroups || []).find(x => x.groupKey === groupKey)
    || (slip.incomeGroups || []).find(x => x.groupKey === groupKey)
  return sumGroup(g)
}

/** 应发 = 合计收入 − 业务扣款项 − 合计扣缴 */
const getPayable = (slip) => {
  if (!slip) return 0
  return getIncomeTotal(slip) - getBusinessDeductionTotal(slip) - getWithholdingTotal(slip)
}

const getPayment = (slip) => {
  if (!slip?.payments?.length) return null
  return slip.payments[0]
}

/** 工资单级收款信息（工资单自带优先；缺则从员工档案补） */
const getPayee = (slip) => {
  if (!slip) return { name: '', bank: '', account: '' }
  const emp = employeeMap[slip.employeeId]
  return {
    name: slip.payeeName || emp?.name || '',
    bank: slip.payeeBank || emp?.payeeBank || '',
    account: slip.payeeAccount || emp?.payeeAccount || ''
  }
}

const hasSocialOrFund = (slip) => {
  if (!slip) return false
  const hasSocial = slip.socialPurchasingEntity && slip.socialPurchasingEntity !== '/'
  const hasFund = slip.fundPurchasingEntity && slip.fundPurchasingEntity !== '/'
  return Boolean(hasSocial || hasFund)
}

/** 社保单位部分：优先显式字段，否则用原 socialPurchasingAmount */
const getSocialEmployerPart = (slip) => {
  if (!slip) return 0
  if (slip.socialEmployerPart != null) return slip.socialEmployerPart
  return slip.socialPurchasingAmount || 0
}

/** 社保个人部分：优先显式字段，否则从扣缴组中找「社保」 */
const getSocialPersonalPart = (slip) => {
  if (!slip) return 0
  if (slip.socialPersonalPart != null) return slip.socialPersonalPart
  for (const g of slip.deductionGroups || []) {
    const item = (g.items || []).find(i => i.name === '社保')
    if (item) return item.amount || 0
  }
  return 0
}

/** 公积金个人部分：优先显式字段，否则从扣缴组中找「公积金」 */
const getFundPersonalPart = (slip) => {
  if (!slip) return 0
  if (slip.fundPersonalPart != null) return slip.fundPersonalPart
  for (const g of slip.deductionGroups || []) {
    const item = (g.items || []).find(i => i.name === '公积金')
    if (item) return item.amount || 0
  }
  return 0
}

const formatAmount = (val) => {
  if (val === null || val === undefined) return '—'
  return Number(val).toFixed(2)
}

const formatSlotPeriod = (slip) => {
  if (!slip) return '—'
  // 同月压缩为 MM-DD ~ MM-DD，减少列宽换行
  const s = slip.periodStart
  const e = slip.periodEnd
  if (s?.slice(0, 7) === e?.slice(0, 7)) {
    return `${s.slice(5)} ~ ${e.slice(5)}`
  }
  return `${s} ~ ${e}`
}

const getStatusTagType = (status) => {
  const map = {
    pending: 'warning',
    confirmed: 'primary',
    paid: 'success',
    failed: 'danger'
  }
  return map[status] || 'info'
}

const getStatusLabel = (status) => {
  const map = {
    pending: '待确认',
    confirmed: '待发放',
    paid: '已发放',
    failed: '发放失败'
  }
  return map[status] || status
}
</script>

<style scoped>
.voucher-list-2 {
  padding: 0;
}

.page-header {
  margin-bottom: 16px;
}

.page-header h1 {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 6px;
}

.content-section {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.gate-section {
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid #ebeef5;
}

.gate-title {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 10px;
}

.gate-form :deep(.el-form-item) {
  margin-bottom: 8px;
}

.system-banner {
  margin-top: 8px;
  padding: 10px 14px;
  background: #fff8fa;
  border: 1px solid #f5d0da;
  border-radius: 6px;
}

.banner-main {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.banner-label {
  display: inline-block;
  margin-right: 8px;
  padding: 1px 8px;
  background: #a40035;
  color: #fff;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 600;
}

.banner-sep {
  margin: 0 6px;
  color: #c0c4cc;
}

.banner-meta {
  font-size: 12px;
  color: #606266;
  line-height: 1.5;
}

.empty-gate {
  padding: 64px 24px;
  text-align: center;
  background: #fafafa;
  border-radius: 8px;
  border: 1px dashed #dcdfe6;
}

.empty-gate-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.empty-gate-desc {
  font-size: 13px;
  color: #909399;
  max-width: 420px;
  margin: 0 auto;
  line-height: 1.6;
}

.filter-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
}

.filter-section :deep(.el-form-item) {
  margin-bottom: 8px;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  padding-top: 4px;
}

.toolbar-info {
  font-size: 13px;
  color: #606266;
  padding-top: 6px;
}

.amount-strong {
  color: #a40035;
  font-weight: 700;
  font-size: 15px;
  margin-left: 4px;
}

.payroll-table :deep(.el-table__header .cell),
.payroll-table :deep(.el-table__body .cell) {
  white-space: nowrap;
  line-height: 1.4;
}

.payroll-table :deep(.el-table__header th) {
  font-size: 12px;
}

.employee-cell {
  display: flex;
  flex-direction: column;
  white-space: nowrap;
}

.employee-name {
  font-weight: 600;
  color: #303133;
  font-size: 13px;
}

.employee-no {
  font-size: 11px;
  color: #909399;
}

.account-cell {
  display: flex;
  flex-direction: column;
}

.account-bank {
  font-size: 13px;
  color: #303133;
  font-weight: 500;
}

.account-no {
  font-size: 11px;
  color: #909399;
  font-variant-numeric: tabular-nums;
}

.payer-cell {
  display: flex;
  flex-direction: column;
}

.payer-entity {
  font-size: 12px;
  color: #303133;
  font-weight: 500;
  line-height: 1.4;
}

.banner-note {
  color: #a40035;
  margin-left: 4px;
}

.empty-slot {
  font-size: 12px;
  color: #c0c4cc;
  font-style: italic;
}

.period-text {
  font-size: 12px;
  color: #606266;
  font-variant-numeric: tabular-nums;
}

.primary-amount {
  color: #a40035;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.amount-withholding {
  color: #606266;
  font-variant-numeric: tabular-nums;
}

.purchase-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: left;
}

.purchase-entity {
  font-size: 12px;
  color: #303133;
  font-weight: 500;
  line-height: 1.35;
}

.purchase-amount {
  font-size: 11px;
  color: #a40035;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.formula-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.text-muted {
  color: #c0c4cc;
}

.mono {
  font-family: 'SF Mono', Menlo, Consolas, monospace;
  font-size: 12px;
  color: #606266;
}

/* 详情 */
.slip-detail {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detail-card {
  background: #fafafa;
  border-radius: 6px;
  padding: 12px 14px;
  border: 1px solid #f0f0f0;
}

.detail-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}

.detail-table {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px 16px;
}

.detail-table-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.detail-table-label {
  font-size: 12px;
  color: #909399;
}

.detail-table-value {
  font-size: 13px;
  color: #303133;
  word-break: break-all;
}

.detail-table-value.highlight {
  color: #a40035;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.detail-table-value.primary-amount {
  color: #a40035;
  font-weight: 700;
  font-size: 16px;
}

.item-group {
  margin-bottom: 12px;
}

.item-group-title {
  font-size: 12px;
  font-weight: 600;
  color: #909399;
  margin-bottom: 6px;
  letter-spacing: 0.02em;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  font-size: 13px;
}

.item-row.item-leaf {
  padding-left: 20px;
  color: #606266;
}

.item-row.item-subtotal {
  background: #f5f5f5;
  font-weight: 600;
  border-radius: 4px;
  margin-top: 2px;
}

.item-grand-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #fff5f8;
  border-radius: 4px;
  border: 1px solid #ffd6e2;
  font-size: 14px;
  font-weight: 700;
  margin-top: 6px;
}

.item-label {
  color: #303133;
}

.item-value {
  color: #303133;
  font-variant-numeric: tabular-nums;
}

.income-amount {
  color: #a40035;
}

.deduction-amount {
  color: #666;
}
</style>
