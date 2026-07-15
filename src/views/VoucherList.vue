<template>
  <div class="voucher-list">
    <!-- 背景装饰 -->
    <div class="page-bg"></div>

    <div class="page-header">
      <h1>凭证列表</h1>
      <p class="tip">基于人员薪酬明细衍生的计提凭证列表 — 不同合作模式对应不同薪酬模板，列结构与代扣项按模板动态展示。</p>
    </div>

    <!-- 搜索区 -->
    <el-card class="box-card filter-card" shadow="never">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="岗位">
          <el-select v-model="searchForm.position" placeholder="全部岗位" clearable style="width: 150px;">
            <el-option v-for="p in positionOptions" :key="p" :label="p" :value="p" />
          </el-select>
        </el-form-item>
        <el-form-item label="合作模式">
          <el-select v-model="searchForm.mode" placeholder="全部模式" clearable style="width: 200px;" @change="handleModeChange">
            <el-option v-for="tpl in templateOptions" :key="tpl.key" :label="tpl.label" :value="tpl.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="薪酬模板">
          <el-select v-model="searchForm.template" placeholder="全部模板" clearable style="width: 220px;">
            <el-option v-for="tpl in templateOptions" :key="tpl.key" :label="tpl.label" :value="tpl.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="城市">
          <el-input v-model="searchForm.city" placeholder="城市搜索" clearable style="width: 130px;" />
        </el-form-item>
        <el-form-item label="门店">
          <el-input v-model="searchForm.store" placeholder="门店搜索" clearable style="width: 130px;" />
        </el-form-item>
        <el-form-item label="月份">
          <el-date-picker
            v-model="searchForm.month"
            type="month"
            placeholder="选择月份"
            value-format="YYYY-MM"
            clearable
            style="width: 140px;"
          />
        </el-form-item>
        <el-form-item label="员工">
          <el-input v-model="searchForm.employeeKeyword" placeholder="提示姓名或工号" clearable style="width: 160px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 当前模板摘要 -->
      <div v-if="activeTemplate" class="template-summary">
        <el-icon class="summary-icon"><InfoFilled /></el-icon>
        <span>
          当前模板：<strong>{{ activeTemplate.modeLabel }}</strong>
          ｜ 收入分组 <strong>{{ activeTemplate.incomeGroups.length }}</strong> 个
          ｜ 扣款分组 <strong>{{ activeTemplate.deductionGroups.length }}</strong> 个
          ｜ 代扣项 <strong>{{ activeTemplate.withholdingItems.length }}</strong> 项（<strong>{{ activeTemplate.withholdingItems.map(w => w.name).join('、') }}</strong>）
          ｜ 工资条 <strong>{{ activeTemplate.paymentGroups.length }}</strong> 条
        </span>
      </div>
    </el-card>

    <div class="content-section">
      <el-card class="box-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>计提凭证（<strong>{{ filteredData.length }}</strong> 条）</span>
            <div class="card-actions">
              <el-button size="small" @click="handleExport">
                <el-icon><Download /></el-icon>
                导出
              </el-button>
            </div>
          </div>
        </template>

        <div class="table-wrapper">
          <el-table :data="filteredData" border stripe height="640" size="small" :key="activeTemplate.key">
            <!-- ========== 固定左：基础信息 ========== -->
            <el-table-column prop="talentId" label="人才库ID" min-width="160" fixed />
            <el-table-column prop="cityName" label="城市名称" min-width="100" />
            <el-table-column prop="storeCode" label="门店编码" min-width="100" />
            <el-table-column prop="storeName" label="门店名称" min-width="140" />
            <el-table-column prop="laborContractEntity" label="劳动合同单位" min-width="180" />
            <el-table-column prop="employeeNo" label="工号" min-width="100" />
            <el-table-column prop="idCard" label="身份证号码" min-width="180" />
            <el-table-column prop="therapistName" label="姓名" min-width="100" fixed />
            <el-table-column prop="period" label="薪酬周期" min-width="100">
              <template #default="{ row }">{{ formatPeriod(row.period) }}</template>
            </el-table-column>
            <el-table-column prop="employmentStatus" label="任职状态" min-width="90" />
            <el-table-column prop="level" label="等级" min-width="70" />
            <el-table-column prop="modeLabel" label="合作模式" min-width="160" />
            <el-table-column prop="templateLabel" label="薪酬模板" min-width="180" />

            <!-- ========== 动态：收入项（按模板）========== -->
            <el-table-column
              v-for="g in activeTemplate.incomeGroups"
              :key="`income-${g.key}`"
              :label="g.name"
              min-width="110"
              align="right"
            >
              <template #default="{ row }">{{ formatAmount(row[g.key]) }}</template>
            </el-table-column>
            <el-table-column label="收入小计" min-width="120" align="right">
              <template #default="{ row }">
                <strong>{{ formatAmount(computeSubtotal(row, activeTemplate.incomeGroups)) }}</strong>
              </template>
            </el-table-column>

            <!-- ========== 动态：扣款（按模板）========== -->
            <el-table-column
              v-for="g in activeTemplate.deductionGroups"
              :key="`deduction-${g.key}`"
              :label="g.name"
              min-width="110"
              align="right"
            >
              <template #default="{ row }">- {{ formatAmount(row[g.key]) }}</template>
            </el-table-column>
            <el-table-column label="扣款小计" min-width="120" align="right">
              <template #default="{ row }">
                <strong>- {{ formatAmount(computeSubtotal(row, activeTemplate.deductionGroups)) }}</strong>
              </template>
            </el-table-column>

            <!-- ========== 动态：代扣（按合作模式）========== -->
            <el-table-column
              v-for="w in activeTemplate.withholdingItems"
              :key="`withholding-${w.key}`"
              :label="w.name"
              min-width="110"
              align="right"
            >
              <template #default="{ row }">- {{ formatAmount(row[w.key]) }}</template>
            </el-table-column>
            <el-table-column label="代扣小计" min-width="120" align="right">
              <template #default="{ row }">
                <strong>- {{ formatAmount(computeSubtotal(row, activeTemplate.withholdingItems)) }}</strong>
              </template>
            </el-table-column>

            <!-- ========== 应发合计（固定右）========== -->
            <el-table-column label="应发合计" min-width="120" align="right" fixed="right">
              <template #default="{ row }">
                <strong class="primary-amount">{{ formatAmount(computePayableTotal(row)) }}</strong>
              </template>
            </el-table-column>

            <!-- ========== 动态：工资条（按模板的 paymentGroups）========== -->
            <el-table-column
              v-for="(pg, pgi) in activeTemplate.paymentGroups"
              :key="`pg-${pgi}`"
              :label="`${pg.name} 确认金额`"
              min-width="180"
              align="right"
            >
              <template #default="{ row }">{{ formatAmount(payField(row, pgi, 'confirmAmount')) }}</template>
            </el-table-column>
            <el-table-column
              v-for="(pg, pgi) in activeTemplate.paymentGroups"
              :key="`pg-ent-${pgi}`"
              :label="pg.name + ' 付款单位'"
              min-width="180"
            >
              <template #default="{ row }">{{ payField(row, pgi, 'payerEntity') || '/' }}</template>
            </el-table-column>
            <el-table-column
              v-for="(pg, pgi) in activeTemplate.paymentGroups"
              :key="`pg-bnk-${pgi}`"
              :label="pg.name + ' 开户行'"
              min-width="150"
            >
              <template #default="{ row }">{{ payField(row, pgi, 'payerBank') || '/' }}</template>
            </el-table-column>
            <el-table-column
              v-for="(pg, pgi) in activeTemplate.paymentGroups"
              :key="`pg-acct-${pgi}`"
              :label="pg.name + ' 付款账号'"
              min-width="180"
            >
              <template #default="{ row }">{{ payField(row, pgi, 'payerAccount') || '/' }}</template>
            </el-table-column>
            <el-table-column
              v-for="(pg, pgi) in activeTemplate.paymentGroups"
              :key="`pg-time-${pgi}`"
              :label="pg.name + ' 付款时间'"
              min-width="170"
            >
              <template #default="{ row }">{{ payField(row, pgi, 'payerTime') || '/' }}</template>
            </el-table-column>
            <el-table-column
              v-for="(pg, pgi) in activeTemplate.paymentGroups"
              :key="`pg-amt-${pgi}`"
              :label="pg.name + ' 付款金额'"
              min-width="110"
              align="right"
            >
              <template #default="{ row }">{{ formatAmount(payField(row, pgi, 'paymentAmount')) }}</template>
            </el-table-column>
            <el-table-column
              v-for="(pg, pgi) in activeTemplate.paymentGroups"
              :key="`pg-pname-${pgi}`"
              :label="pg.name + ' 收款人姓名'"
              min-width="100"
            >
              <template #default="{ row }">{{ payField(row, pgi, 'payeeName') || '/' }}</template>
            </el-table-column>
            <el-table-column
              v-for="(pg, pgi) in activeTemplate.paymentGroups"
              :key="`pg-pacct-${pgi}`"
              :label="pg.name + ' 收款银行账号'"
              min-width="180"
            >
              <template #default="{ row }">{{ payField(row, pgi, 'payeeAccount') || '/' }}</template>
            </el-table-column>
            <el-table-column
              v-for="(pg, pgi) in activeTemplate.paymentGroups"
              :key="`pg-pbnk-${pgi}`"
              :label="pg.name + ' 收款账号开户行'"
              min-width="150"
            >
              <template #default="{ row }">{{ payField(row, pgi, 'payeeBank') || '/' }}</template>
            </el-table-column>

            <!-- ========== 福利（静态）========== -->
            <el-table-column prop="fundPurchasingEntity" label="公积金购买单位" min-width="180" />
            <el-table-column label="公积金单位部分" min-width="130" align="right">
              <template #default="{ row }">{{ formatAmount(row.fundEmployerPart) }}</template>
            </el-table-column>
            <el-table-column prop="socialPurchasingEntity" label="社保购买单位" min-width="180" />
            <el-table-column label="社保购买金额" min-width="130" align="right">
              <template #default="{ row }">{{ formatAmount(row.socialPurchasingAmount) }}</template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Download, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// ==================== 薪酬模板配置 ====================
// 关键：合作模式 → 模板结构（收入分组 / 扣款分组 / 代扣项）
// 1 合作模式 = 1 薪酬模板（原型简化），实际可能 1 模式对应多模板
const templates = {
  'fulltime-labor': {
    key: 'fulltime-labor',
    mode: 'fulltime-labor',
    modeLabel: '劳动合同-全日制',
    templateLabel: '全职推拿师提成模板',
    incomeGroups: [
      { key: 'pieceworkCommission', name: '计件提成' },
      { key: 'overtimePay', name: '加班工资' },
      { key: 'incentiveSubsidy', name: '激励补贴' },
      { key: 'tips', name: '打赏' }
    ],
    deductionGroups: [
      { key: 'complaintDeduction', name: '投诉扣款' },
      { key: 'refundDeduction', name: '退单扣款' },
      { key: 'serviceTimeShortageDeduction', name: '服务时间不足扣款' }
    ],
    withholdingItems: [
      { key: 'socialSecurityPersonal', name: '社保' },
      { key: 'fundPersonal', name: '公积金' },
      { key: 'tax', name: '个税' }
    ],
    paymentGroups: [
      { key: 'wageSlip1', name: '工资条1（计件）' },
      { key: 'wageSlip2', name: '工资条2（奖金）' },
      { key: 'wageSlip3', name: '工资条3（保底+个税）' }
    ]
  },
  'parttime-labor': {
    key: 'parttime-labor',
    mode: 'parttime-labor',
    modeLabel: '劳动合同-非全日制',
    templateLabel: '非全日制推拿师模板',
    incomeGroups: [
      { key: 'pieceworkCommission', name: '计件提成' },
      { key: 'overtimePay', name: '加班工资' }
      // 注：非全日制不享常乐豆 → 无激励补贴
    ],
    deductionGroups: [
      { key: 'complaintDeduction', name: '投诉扣款' },
      { key: 'serviceTimeShortageDeduction', name: '服务时间不足扣款' }
    ],
    withholdingItems: [
      { key: 'tax', name: '个税' }
      // 注：非全日制仅个税
    ],
    paymentGroups: [
      { key: 'week1', name: '第1周' },
      { key: 'week2', name: '第2周' },
      { key: 'week3', name: '第3周' },
      { key: 'week4', name: '第4周' }
    ]
  },
  'rehired': {
    key: 'rehired',
    mode: 'rehired',
    modeLabel: '劳务合作-返聘',
    templateLabel: '返聘推拿师模板',
    incomeGroups: [
      { key: 'pieceworkCommission', name: '计件提成' }
      // 简化：返聘以计件为主
    ],
    deductionGroups: [
      { key: 'complaintDeduction', name: '投诉扣款' }
    ],
    withholdingItems: [
      { key: 'tax', name: '个税' }
    ],
    paymentGroups: [
      { key: 'wageSlip1', name: '工资条1（计件）' },
      { key: 'wageSlip2', name: '工资条2（奖金）' },
      { key: 'wageSlip3', name: '工资条3（保底+个税）' }
    ]
  },
  'parttime-service': {
    key: 'parttime-service',
    mode: 'parttime-service',
    modeLabel: '劳务合作-兼职',
    templateLabel: '兼职推拿师模板',
    incomeGroups: [
      { key: 'pieceworkCommission', name: '计件提成' }
    ],
    deductionGroups: [
      { key: 'complaintDeduction', name: '投诉扣款' }
    ],
    withholdingItems: [
      { key: 'tax', name: '个税' }
    ],
    paymentGroups: [
      { key: 'week1', name: '第1周' },
      { key: 'week2', name: '第2周' },
      { key: 'week3', name: '第3周' },
      { key: 'week4', name: '第4周' }
    ]
  }
}

const templateOptions = Object.values(templates).map(t => ({
  key: t.key,
  label: `${t.modeLabel}（${t.templateLabel}）`
}))

// ==================== 搜索表单 ====================
const positionOptions = ['推拿师', '调理师', '理疗师', '客户经理']

const searchForm = reactive({
  position: '',
  mode: '',
  template: '',
  city: '',
  store: '',
  month: '',
  employeeKeyword: ''
})

// 默认显示"全部"——用第一个模板的结构做基线展示（用户可下拉切换）
const activeTemplate = computed(() => {
  if (searchForm.template && templates[searchForm.template]) {
    return templates[searchForm.template]
  }
  if (searchForm.mode && templates[searchForm.mode]) {
    return templates[searchForm.mode]
  }
  return templates['fulltime-labor']
})

const handleModeChange = (val) => {
  // 选择合作模式时，自动联动薪酬模板（1 模式 = 1 模板）
  if (val && templates[val]) {
    searchForm.template = val
  }
}

// ==================== Mock 数据 ====================
// 每条记录带合作模式 + 模板标识，列字段按模板 key 命名
const rawData = [
  // 全职-全日制（张三）
  {
    mode: 'fulltime-labor',
    modeLabel: '劳动合同-全日制',
    templateLabel: '全职推拿师提成模板',
    position: '推拿师',
    talentId: '1116914240949403726', cityName: '上海', storeCode: 'SH001', storeName: '上海徐汇店',
    laborContractEntity: '上海推拿之家健康管理有限公司', employeeNo: 'T00676', idCard: '310**********1234',
    therapistName: '张三', employmentStatus: '在职', level: 'T3', period: '2026-06',
    pieceworkCommission: 6000, overtimePay: 500, incentiveSubsidy: 800, tips: 200,
    complaintDeduction: 100, refundDeduction: 50, serviceTimeShortageDeduction: 0,
    socialSecurityPersonal: 800, fundPersonal: 1200, tax: 90,
    payments: [
      { confirmAmount: 2000, payerEntity: '上海推拿之家健康管理有限公司', payerBank: '招商银行上海分行', payerAccount: '6225**********1234', payerTime: '2026-06-17 10:00:00', paymentAmount: 2000, payeeName: '张三', payeeAccount: '6228**********5678', payeeBank: '工商银行徐汇支行' },
      { confirmAmount: 1500, payerEntity: '上海推拿之家健康管理有限公司', payerBank: '招商银行上海分行', payerAccount: '6225**********1234', payerTime: '2026-06-22 10:00:00', paymentAmount: 1500, payeeName: '张三', payeeAccount: '6228**********5678', payeeBank: '工商银行徐汇支行' },
      { confirmAmount: 1760, payerEntity: '上海推拿之家健康管理有限公司', payerBank: '招商银行上海分行', payerAccount: '6225**********1234', payerTime: '2026-06-30 10:00:00', paymentAmount: 1760, payeeName: '张三', payeeAccount: '6228**********5678', payeeBank: '工商银行徐汇支行' }
    ],
    fundPurchasingEntity: '上海推拿之家健康管理有限公司', fundEmployerPart: 1200,
    socialPurchasingEntity: '上海推拿之家健康管理有限公司', socialPurchasingAmount: 2000
  },
  // 全职-全日制（王五）
  {
    mode: 'fulltime-labor',
    modeLabel: '劳动合同-全日制',
    templateLabel: '全职推拿师提成模板',
    position: '推拿师',
    talentId: '1116914240949403728', cityName: '上海', storeCode: 'SH001', storeName: '上海徐汇店',
    laborContractEntity: '上海推拿之家健康管理有限公司', employeeNo: 'T00680', idCard: '310**********5678',
    therapistName: '王五', employmentStatus: '在职', level: 'T4', period: '2026-06',
    pieceworkCommission: 7200, overtimePay: 300, incentiveSubsidy: 1000, tips: 350,
    complaintDeduction: 0, refundDeduction: 0, serviceTimeShortageDeduction: 50,
    socialSecurityPersonal: 800, fundPersonal: 1200, tax: 165,
    payments: [
      { confirmAmount: 2200, payerEntity: '上海推拿之家健康管理有限公司', payerBank: '招商银行上海分行', payerAccount: '6225**********1234', payerTime: '2026-06-17 10:00:00', paymentAmount: 2200, payeeName: '王五', payeeAccount: '6228**********9012', payeeBank: '工商银行徐汇支行' },
      { confirmAmount: 1800, payerEntity: '上海推拿之家健康管理有限公司', payerBank: '招商银行上海分行', payerAccount: '6225**********1234', payerTime: '2026-06-22 10:00:00', paymentAmount: 1800, payeeName: '王五', payeeAccount: '6228**********9012', payeeBank: '工商银行徐汇支行' },
      { confirmAmount: 1635, payerEntity: '上海推拿之家健康管理有限公司', payerBank: '招商银行上海分行', payerAccount: '6225**********1234', payerTime: '2026-06-30 10:00:00', paymentAmount: 1635, payeeName: '王五', payeeAccount: '6228**********9012', payeeBank: '工商银行徐汇支行' }
    ],
    fundPurchasingEntity: '上海推拿之家健康管理有限公司', fundEmployerPart: 1200,
    socialPurchasingEntity: '上海推拿之家健康管理有限公司', socialPurchasingAmount: 2000
  },
  // 非全日制（李四）
  {
    mode: 'parttime-labor',
    modeLabel: '劳动合同-非全日制',
    templateLabel: '非全日制推拿师模板',
    position: '推拿师',
    talentId: '1116914240949403729', cityName: '北京', storeCode: 'BJ002', storeName: '北京朝阳店',
    laborContractEntity: '北京推拿之家健康管理有限公司', employeeNo: 'B02145', idCard: '110**********5678',
    therapistName: '李四', employmentStatus: '在职', level: 'P2', period: '2026-05',
    pieceworkCommission: 4500, overtimePay: 200, incentiveSubsidy: 0, tips: 100,
    complaintDeduction: 50, refundDeduction: 0, serviceTimeShortageDeduction: 0,
    socialSecurityPersonal: 0, fundPersonal: 0, tax: 135,
    payments: [
      { confirmAmount: 1200, payerEntity: '北京推拿之家健康管理有限公司', payerBank: '建设银行北京分行', payerAccount: '6217**********4321', payerTime: '2026-06-07 14:30:00', paymentAmount: 1200, payeeName: '李四', payeeAccount: '6217**********8765', payeeBank: '建设银行朝阳支行' },
      { confirmAmount: 1100, payerEntity: '北京推拿之家健康管理有限公司', payerBank: '建设银行北京分行', payerAccount: '6217**********4321', payerTime: '2026-06-14 14:30:00', paymentAmount: 1100, payeeName: '李四', payeeAccount: '6217**********8765', payeeBank: '建设银行朝阳支行' },
      { confirmAmount: 1300, payerEntity: '北京推拿之家健康管理有限公司', payerBank: '建设银行北京分行', payerAccount: '6217**********4321', payerTime: '2026-06-21 14:30:00', paymentAmount: 1300, payeeName: '李四', payeeAccount: '6217**********8765', payeeBank: '建设银行朝阳支行' },
      { confirmAmount: 1015, payerEntity: '北京推拿之家健康管理有限公司', payerBank: '建设银行北京分行', payerAccount: '6217**********4321', payerTime: '2026-06-30 14:30:00', paymentAmount: 1015, payeeName: '李四', payeeAccount: '6217**********8765', payeeBank: '建设银行朝阳支行' }
    ],
    fundPurchasingEntity: '/', fundEmployerPart: 0,
    socialPurchasingEntity: '/', socialPurchasingAmount: 0
  },
  // 返聘（赵六）
  {
    mode: 'rehired',
    modeLabel: '劳务合作-返聘',
    templateLabel: '返聘推拿师模板',
    position: '推拿师',
    talentId: '1116914240949403730', cityName: '北京', storeCode: 'BJ002', storeName: '北京朝阳店',
    laborContractEntity: '北京推拿之家健康管理有限公司', employeeNo: 'B02199', idCard: '110**********9012',
    therapistName: '赵六', employmentStatus: '在职', level: 'R1', period: '2026-05',
    pieceworkCommission: 3800, overtimePay: 0, incentiveSubsidy: 0, tips: 50,
    complaintDeduction: 0, refundDeduction: 0, serviceTimeShortageDeduction: 0,
    socialSecurityPersonal: 0, fundPersonal: 0, tax: 115.5,
    payments: [
      { confirmAmount: 1300, payerEntity: '北京推拿之家健康管理有限公司', payerBank: '建设银行北京分行', payerAccount: '6217**********4321', payerTime: '2026-06-17 14:30:00', paymentAmount: 1300, payeeName: '赵六', payeeAccount: '6217**********3456', payeeBank: '建设银行朝阳支行' },
      { confirmAmount: 1200, payerEntity: '北京推拿之家健康管理有限公司', payerBank: '建设银行北京分行', payerAccount: '6217**********4321', payerTime: '2026-06-22 14:30:00', paymentAmount: 1200, payeeName: '赵六', payeeAccount: '6217**********3456', payeeBank: '建设银行朝阳支行' },
      { confirmAmount: 1234.5, payerEntity: '北京推拿之家健康管理有限公司', payerBank: '建设银行北京分行', payerAccount: '6217**********4321', payerTime: '2026-06-30 14:30:00', paymentAmount: 1234.5, payeeName: '赵六', payeeAccount: '6217**********3456', payeeBank: '建设银行朝阳支行' }
    ],
    fundPurchasingEntity: '/', fundEmployerPart: 0,
    socialPurchasingEntity: '/', socialPurchasingAmount: 0
  },
  // 兼职（钱七）
  {
    mode: 'parttime-service',
    modeLabel: '劳务合作-兼职',
    templateLabel: '兼职推拿师模板',
    position: '推拿师',
    talentId: '1116914240949403731', cityName: '上海', storeCode: 'SH003', storeName: '上海浦东店',
    laborContractEntity: '上海推拿之家健康管理有限公司', employeeNo: 'F00128', idCard: '310**********7890',
    therapistName: '钱七', employmentStatus: '兼职', level: 'J1', period: '2026-04',
    pieceworkCommission: 2200, overtimePay: 0, incentiveSubsidy: 0, tips: 0,
    complaintDeduction: 0, refundDeduction: 0, serviceTimeShortageDeduction: 0,
    socialSecurityPersonal: 0, fundPersonal: 0, tax: 66,
    payments: [
      { confirmAmount: 600, payerEntity: '上海推拿之家健康管理有限公司', payerBank: '招商银行上海分行', payerAccount: '6225**********1234', payerTime: '2026-06-07 10:00:00', paymentAmount: 600, payeeName: '钱七', payeeAccount: '6228**********3456', payeeBank: '工商银行浦东支行' },
      { confirmAmount: 500, payerEntity: '上海推拿之家健康管理有限公司', payerBank: '招商银行上海分行', payerAccount: '6225**********1234', payerTime: '2026-06-14 10:00:00', paymentAmount: 500, payeeName: '钱七', payeeAccount: '6228**********3456', payeeBank: '工商银行浦东支行' },
      { confirmAmount: 534, payerEntity: '上海推拿之家健康管理有限公司', payerBank: '招商银行上海分行', payerAccount: '6225**********1234', payerTime: '2026-06-21 10:00:00', paymentAmount: 534, payeeName: '钱七', payeeAccount: '6228**********3456', payeeBank: '工商银行浦东支行' },
      { confirmAmount: 500, payerEntity: '上海推拿之家健康管理有限公司', payerBank: '招商银行上海分行', payerAccount: '6225**********1234', payerTime: '2026-06-30 10:00:00', paymentAmount: 500, payeeName: '钱七', payeeAccount: '6228**********3456', payeeBank: '工商银行浦东支行' }
    ],
    fundPurchasingEntity: '/', fundEmployerPart: 0,
    socialPurchasingEntity: '/', socialPurchasingAmount: 0
  }
]

// 过滤数据：mode / template / 城市 / 门店 / 姓名
const filteredData = computed(() => {
  return rawData.filter(r => {
    if (searchForm.position && r.position !== searchForm.position) return false
    if (searchForm.mode && r.mode !== searchForm.mode) return false
    if (searchForm.template && r.mode !== searchForm.template) return false
    if (searchForm.city && !r.cityName.includes(searchForm.city)) return false
    if (searchForm.store && !r.storeName.includes(searchForm.store)) return false
    if (searchForm.month && r.period !== searchForm.month) return false
    if (searchForm.employeeKeyword) {
      const kw = searchForm.employeeKeyword.trim()
      const matchName = r.therapistName && r.therapistName.includes(kw)
      const matchNo = r.employeeNo && r.employeeNo.includes(kw)
      if (!matchName && !matchNo) return false
    }
    return true
  })
})

// ==================== 工具函数 ====================
const formatAmount = (val) => {
  if (val === null || val === undefined) return '/'
  return `¥ ${val.toFixed(2)}`
}

const formatPeriod = (val) => {
  if (!val) return '/'
  const [y, m] = val.split('-')
  return `${y}年${m}月`
}

const payField = (row, pgi, field) => {
  return row.payments?.[pgi]?.[field] ?? null
}

const computeSubtotal = (row, groups) => {
  return groups.reduce((sum, g) => sum + (Number(row[g.key]) || 0), 0)
}

const computePayableTotal = (row) => {
  const income = computeSubtotal(row, activeTemplate.value.incomeGroups)
  const deduction = computeSubtotal(row, activeTemplate.value.deductionGroups)
  const withholding = computeSubtotal(row, activeTemplate.value.withholdingItems)
  return income - deduction - withholding
}

const handleSearch = () => {
  ElMessage.success(`已搜索到 ${filteredData.value.length} 条记录`)
}

const handleReset = () => {
  searchForm.position = ''
  searchForm.mode = ''
  searchForm.template = ''
  searchForm.city = ''
  searchForm.store = ''
  searchForm.therapistName = ''
  ElMessage.info('搜索条件已重置')
}

const handleExport = () => {
  ElMessage.success('导出任务已提交')
}
</script>

<style scoped>
.voucher-list {
  padding: 0;
  position: relative;
  min-height: 100%;
}
/* 背景装饰：径向渐变，呼应"首页有背景" */
.page-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 320px;
  background: radial-gradient(ellipse at 30% 0%, hsl(var(--primary) / 0.10), transparent 60%),
              radial-gradient(ellipse at 80% 20%, hsl(220 80% 60% / 0.08), transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.page-header {
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}
.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 6px 0;
  color: hsl(var(--foreground));
  letter-spacing: 0.5px;
}
.page-header .tip {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  margin: 0;
  max-width: 760px;
  line-height: 1.6;
}

.filter-card {
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}
.filter-card :deep(.el-card__body) {
  padding: 18px 20px 12px 20px;
}
.filter-card :deep(.el-form-item) {
  margin-bottom: 12px;
}
.template-summary {
  margin-top: 4px;
  padding: 8px 12px;
  background: hsl(var(--primary) / 0.05);
  border-left: 3px solid hsl(var(--primary));
  border-radius: 3px;
  font-size: 12.5px;
  color: hsl(var(--muted-foreground));
  display: flex;
  align-items: center;
  gap: 6px;
}
.template-summary .summary-icon {
  color: hsl(var(--primary));
  font-size: 14px;
}
.template-summary strong {
  color: hsl(var(--foreground));
  font-weight: 600;
}

.content-section {
  background: transparent;
  position: relative;
  z-index: 1;
}
.box-card :deep(.el-card__header) {
  padding: 14px 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
}
.card-actions {
  display: flex;
  gap: 8px;
}
.table-wrapper {
  width: 100%;
  overflow-x: auto;
}
.primary-amount {
  color: hsl(var(--primary));
  font-variant-numeric: tabular-nums;
}
</style>
