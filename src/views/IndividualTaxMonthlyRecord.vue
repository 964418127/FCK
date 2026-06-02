<template>
  <div class="individual-tax-monthly-record">
    <div class="page-header">
      <h1>个税月度流水明细</h1>
      <p class="tip">💡 1 个员工在 N 个门店 = N 个申报主体（1 门店 = 1 主体），每主体 1 行明细。多主体兼职/非全日制员工按倒序申报顺序展示</p>
    </div>

    <div class="content-section">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input v-model="searchForm.keyword" placeholder="搜索员工" clearable style="width: 140px;" />
          <el-select v-model="searchForm.month" placeholder="月份" clearable style="width: 110px;">
            <el-option v-for="m in monthOptions" :key="m" :label="m" :value="m" />
          </el-select>
          <el-select v-model="searchForm.recordType" placeholder="类型" clearable style="width: 100px;">
            <el-option label="正常" value="正常" />
            <el-option label="补税" value="补税" />
            <el-option label="退税" value="退税" />
            <el-option label="汇算清缴" value="汇算清缴" />
          </el-select>
          <el-button @click="handleReset">重置</el-button>
        </div>
        <div class="toolbar-right">
          <el-button @click="handleImport">手动导入</el-button>
          <el-button type="primary" @click="openAddDialog">+ 新增记录</el-button>
        </div>
      </div>

      <!-- 数据来源图例 -->
      <div class="source-legend">
        <span class="legend-item">
          <span class="dot third-party"></span>
          <span>三方服务</span>
        </span>
        <span class="legend-item">
          <span class="dot manual"></span>
          <span>手动导入</span>
        </span>
      </div>

      <el-table :data="filteredData" stripe style="width: 100%; margin-top: 12px;">
        <el-table-column prop="employeeId" label="员工编号" width="100" />
        <el-table-column prop="employeeName" label="姓名" width="100" />
        <el-table-column prop="idCard" label="身份证号" width="160" />
        <el-table-column prop="declarationEntity" label="申报主体" width="160">
          <template #default="{ row }">
            <el-tag size="small" type="primary">{{ row.declarationEntity }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="store" label="门店" width="120" />
        <el-table-column prop="feeType" label="费用类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.feeType === '滞纳金' ? 'danger' : 'success'" size="small">
              {{ row.feeType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="salaryBeforeTax" label="税前工资" width="100">
          <template #default="{ row }">
            ¥{{ row.salaryBeforeTax.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="taxableIncome" label="应纳税所得额" width="120">
          <template #default="{ row }">
            ¥{{ row.taxableIncome.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="taxAmount" label="税额" width="100">
          <template #default="{ row }">
            <span class="tax-amount">¥{{ row.taxAmount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="thisEntityPreDeduct" label="本主体预扣合计" width="130">
          <template #default="{ row }">
            <span class="amount">¥{{ row.thisEntityPreDeduct.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="declarationOrder" label="倒序申报顺序" width="110" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.declarationOrder" size="small" type="info">第 {{ row.declarationOrder }} 个</el-tag>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="relatedSlipId" label="对应工资条" width="140">
          <template #default="{ row }">
            <span v-if="row.relatedSlipId" class="slip-link">{{ row.relatedSlipId }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="generateMonth" label="费用产生月份" width="120" />
        <el-table-column prop="attrributionMonth" label="费用归属月份" width="120" />
        <el-table-column prop="paymentMonth" label="费用实际缴纳月份" width="140" />
        <el-table-column prop="recordType" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getRecordTypeTag(row.recordType)" size="small">
              {{ row.recordType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="dataSource" label="来源" width="90">
          <template #default="{ row }">
            <span :class="['source-tag', row.dataSource === '三方服务' ? 'third-party' : 'manual']">
              {{ row.dataSource }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === '已确认' ? 'success' : 'warning'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="openEditDialog(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑记录' : '新增记录'" width="500px" destroy-on-close>
      <el-form :model="form" label-width="110px">
        <el-form-item label="员工">
          <el-select v-model="form.employeeId" placeholder="请选择员工" style="width: 100%;">
            <el-option label="张三 (E001)" value="E001" />
            <el-option label="李四 (E002)" value="E002" />
            <el-option label="王五 (E003)" value="E003" />
          </el-select>
        </el-form-item>
        <el-form-item label="申报主体">
          <el-select v-model="form.declarationEntity" placeholder="选择申报主体" style="width: 100%;">
            <el-option label="北京推拿公司" value="北京推拿公司" />
            <el-option label="上海推拿公司A店" value="上海推拿公司A店" />
            <el-option label="上海推拿公司B店" value="上海推拿公司B店" />
            <el-option label="深圳推拿公司" value="深圳推拿公司" />
          </el-select>
        </el-form-item>
        <el-form-item label="门店">
          <el-select v-model="form.store" placeholder="选择门店" style="width: 100%;">
            <el-option label="北京旗舰店" value="北京旗舰店" />
            <el-option label="上海A店" value="上海A店" />
            <el-option label="上海B店" value="上海B店" />
            <el-option label="深圳总店" value="深圳总店" />
          </el-select>
        </el-form-item>
        <el-form-item label="月份">
          <el-date-picker v-model="form.month" type="month" value-format="YYYY-MM" placeholder="选择月份" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="税前工资">
          <el-input-number v-model="form.salaryBeforeTax" :min="0" :step="100" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="应纳税所得额">
          <el-input-number v-model="form.taxableIncome" :min="0" :step="100" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="税额">
          <el-input-number v-model="form.taxAmount" :min="0" :step="100" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="本主体预扣">
          <el-input-number v-model="form.thisEntityPreDeduct" :min="0" :step="100" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="倒序申报顺序">
          <el-input-number v-model="form.declarationOrder" :min="0" :step="1" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="对应工资条">
          <el-input v-model="form.relatedSlipId" placeholder="如 PS-2026-01-E002-A-W4" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="记录类型">
          <el-radio-group v-model="form.recordType">
            <el-radio-button label="正常" value="正常" />
            <el-radio-button label="补税" value="补税" />
            <el-radio-button label="退税" value="退税" />
            <el-radio-button label="汇算清缴" value="汇算清缴" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="数据来源">
          <el-radio-group v-model="form.dataSource">
            <el-radio-button label="三方服务" value="三方服务" />
            <el-radio-button label="手动导入" value="手动导入" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio-button label="已确认" value="已确认" />
            <el-radio-button label="待确认" value="待确认" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </template>
    </el-dialog>

    <!-- 导入弹窗 -->
    <el-dialog v-model="importDialogVisible" title="手动导入" width="500px" destroy-on-close>
      <el-form :model="importForm" label-width="100px">
        <el-form-item label="导入文件">
          <el-upload
            class="upload-demo"
            drag
            action="#"
            :auto-upload="false"
            :limit="1"
            accept=".xlsx,.xls,.csv"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">拖拽文件到此处，或 <em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip">支持 xlsx、xls、csv 格式</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="导入月份">
          <el-date-picker v-model="importForm.month" type="month" value-format="YYYY-MM" placeholder="选择月份" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="数据类型">
          <el-radio-group v-model="importForm.recordType">
            <el-radio-button label="正常" value="正常" />
            <el-radio-button label="补税" value="补税" />
            <el-radio-button label="退税" value="退税" />
            <el-radio-button label="汇算清缴" value="汇算清缴" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="数据来源">
          <el-tag type="warning">手动导入</el-tag>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleImportSubmit">确认导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'

const searchForm = reactive({ keyword: '', month: '', recordType: '' })
const monthOptions = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06']

const records = ref([
  // 张三（全职）单主体，反映"累计预扣预缴"真实业务
  // 1月：累计应纳税所得额10000, 累计税额=10000×3%=290, 当月预扣=290
  // 2月：累计应纳税所得额20000, 累计税额=20000×3%=600, 当月预扣=600-290=310
  // 3月：累计应纳税所得额35000, 累计税额=35000×3%=1050, 当月预扣=1050-600=450
  { id: 1, employeeId: 'E001', employeeName: '张三', idCard: '110101199001011234', declarationEntity: '北京推拿公司', store: '北京旗舰店', feeType: '个税', salaryBeforeTax: 15000, taxableIncome: 10000, taxAmount: 290, thisEntityPreDeduct: 290, declarationOrder: null, relatedSlipId: null, generateMonth: '2026-01', attrributionMonth: '2026-01', paymentMonth: '2026-02', recordType: '正常', dataSource: '三方服务', status: '已确认', remark: '1月：累计应纳税所得额10000，累计税额290' },
  { id: 2, employeeId: 'E001', employeeName: '张三', idCard: '110101199001011234', declarationEntity: '北京推拿公司', store: '北京旗舰店', feeType: '个税', salaryBeforeTax: 15000, taxableIncome: 10000, taxAmount: 310, thisEntityPreDeduct: 310, declarationOrder: null, relatedSlipId: null, generateMonth: '2026-02', attrributionMonth: '2026-02', paymentMonth: '2026-02', recordType: '正常', dataSource: '三方服务', status: '已确认', remark: '2月：累计应纳税所得额20000，累计税额600，本月预扣=600-290=310' },
  { id: 3, employeeId: 'E001', employeeName: '张三', idCard: '110101199001011234', declarationEntity: '北京推拿公司', store: '北京旗舰店', feeType: '个税', salaryBeforeTax: 15000, taxableIncome: 10000, taxAmount: 450, thisEntityPreDeduct: 450, declarationOrder: null, relatedSlipId: null, generateMonth: '2026-03', attrributionMonth: '2026-03', paymentMonth: '2026-03', recordType: '正常', dataSource: '三方服务', status: '已确认', remark: '3月：累计应纳税所得额35000，累计税额1050，本月预扣=1050-600=450' },
  // 李四（兼职）多主体示例：1 个门店 = 1 个主体，按应税金额倒序申报
  { id: 4, employeeId: 'E002', employeeName: '李四', idCard: '310101199002022345', declarationEntity: '上海推拿公司A店', store: '上海A店', feeType: '个税', salaryBeforeTax: 22400, taxableIncome: 20400, taxAmount: 1128, thisEntityPreDeduct: 672, declarationOrder: 1, relatedSlipId: 'PS-2026-01-E002-A-W4', generateMonth: '2026-01', attrributionMonth: '2026-01', paymentMonth: '2026-02', recordType: '补税', dataSource: '三方服务', status: '已确认', remark: '门店A 倒序申报第1个，应税22400，百旺累计1800-本主体预扣672' },
  { id: 5, employeeId: 'E002', employeeName: '李四', idCard: '310101199002022345', declarationEntity: '上海推拿公司B店', store: '上海B店', feeType: '个税', salaryBeforeTax: 12600, taxableIncome: 10600, taxAmount: 822, thisEntityPreDeduct: 378, declarationOrder: 2, relatedSlipId: 'PS-2026-01-E002-B-W4', generateMonth: '2026-01', attrributionMonth: '2026-01', paymentMonth: '2026-02', recordType: '补税', dataSource: '三方服务', status: '已确认', remark: '门店B 倒序申报第2个，应税12600，可能跳档' },
  // 张三的滞纳金（与个税分开记录，但产生月份/归属月份不同）
  { id: 6, employeeId: 'E001', employeeName: '张三', idCard: '110101199001011234', declarationEntity: '北京推拿公司', store: '北京旗舰店', feeType: '滞纳金', salaryBeforeTax: 0, taxableIncome: 0, taxAmount: 18, thisEntityPreDeduct: 0, declarationOrder: null, relatedSlipId: null, generateMonth: '2026-01', attrributionMonth: '2026-01', paymentMonth: '2026-04', recordType: '正常', dataSource: '三方服务', status: '已确认', remark: '个税逾期未缴产生滞纳金' },
  // 王五（全职）单主体，含汇算清缴
  { id: 7, employeeId: 'E003', employeeName: '王五', idCard: '440101199003033456', declarationEntity: '深圳推拿公司', store: '深圳总店', feeType: '个税', salaryBeforeTax: 20000, taxableIncome: 15000, taxAmount: 790, thisEntityPreDeduct: 790, declarationOrder: null, relatedSlipId: 'PS-2026-01-E003-M1', generateMonth: '2026-01', attrributionMonth: '2026-01', paymentMonth: '2026-01', recordType: '汇算清缴', dataSource: '手动导入', status: '已确认', remark: '年终汇算补税' },
  // 李四（兼职）退税示例
  { id: 8, employeeId: 'E002', employeeName: '李四', idCard: '310101199002022345', declarationEntity: '上海推拿公司B店', store: '上海B店', feeType: '个税', salaryBeforeTax: 8000, taxableIncome: 4000, taxAmount: 0, thisEntityPreDeduct: 0, declarationOrder: 2, relatedSlipId: 'PS-2026-03-E002-B-W4', generateMonth: '2026-03', attrributionMonth: '2026-03', paymentMonth: '2026-03', recordType: '退税', dataSource: '手动导入', status: '已确认', remark: '专项附加扣除补充，退税-30' }
])

const filteredData = computed(() => {
  return records.value.filter(item => {
    const matchKeyword = !searchForm.keyword || item.employeeId.includes(searchForm.keyword) || item.employeeName.includes(searchForm.keyword)
    const matchMonth = !searchForm.month || item.month === searchForm.month
    const matchType = !searchForm.recordType || item.recordType === searchForm.recordType
    return matchKeyword && matchMonth && matchType
  })
})

const getRecordTypeTag = (type) => {
  const map = { '正常': 'success', '补税': 'warning', '退税': 'info', '汇算清缴': 'primary' }
  return map[type] || 'default'
}

const dialogVisible = ref(false)
const importDialogVisible = ref(false)
const isEdit = ref(false)
const currentEditId = ref(null)
const form = reactive({
  employeeId: '', declarationEntity: '', store: '', month: '',
  salaryBeforeTax: 0, taxableIncome: 0, taxAmount: 0,
  thisEntityPreDeduct: 0, declarationOrder: null, relatedSlipId: '',
  recordType: '正常', dataSource: '三方服务', status: '已确认', remark: ''
})
const importForm = reactive({ month: '', recordType: '正常' })

const handleReset = () => { searchForm.keyword = ''; searchForm.month = ''; searchForm.recordType = '' }

const openAddDialog = () => {
  isEdit.value = false
  Object.assign(form, {
    employeeId: '', declarationEntity: '', store: '', month: '',
    salaryBeforeTax: 0, taxableIncome: 0, taxAmount: 0,
    thisEntityPreDeduct: 0, declarationOrder: null, relatedSlipId: '',
    recordType: '正常', dataSource: '三方服务', status: '已确认', remark: ''
  })
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  isEdit.value = true
  currentEditId.value = row.id
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleSubmit = () => {
  const name = { E001: '张三', E002: '李四', E003: '王五' }[form.employeeId]
  const idCard = { E001: '110101199001011234', E002: '310101199002022345', E003: '440101199003033456' }[form.employeeId]
  if (isEdit.value) {
    const idx = records.value.findIndex(i => i.id === currentEditId.value)
    if (idx !== -1) records.value[idx] = { ...records.value[idx], ...form, employeeName: name, idCard }
  } else {
    records.value.push({ id: Date.now(), ...form, employeeName: name, idCard })
  }
  dialogVisible.value = false
  ElMessage.success('保存成功')
}

const handleImport = () => {
  importForm.month = ''
  importForm.recordType = '正常'
  importDialogVisible.value = true
}

const handleImportSubmit = () => {
  importDialogVisible.value = false
  ElMessage.success('导入成功')
}
</script>

<style scoped>
.individual-tax-monthly-record { padding: 0; }
.page-header { margin-bottom: 20px; }
.page-header h1 { font-size: 24px; font-weight: 600; margin: 0 0 8px 0; color: hsl(var(--foreground)); }
.page-header .tip { color: hsl(var(--muted-foreground)); font-size: 14px; margin: 0; }
.content-section { background: hsl(var(--background)); border-radius: 8px; padding: 20px; box-shadow: var(--shadow-sm); }
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.toolbar-left, .toolbar-right { display: flex; gap: 8px; align-items: center; }

.source-legend {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: hsl(var(--muted) / 0.3);
  border-radius: 4px;
  font-size: 12px;
}
.legend-item { display: flex; align-items: center; gap: 6px; }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot.third-party { background: hsl(var(--primary)); }
.dot.manual { background: hsl(var(--warning)); }

.source-tag {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}
.source-tag.third-party { background: hsl(var(--primary) / 0.1); color: hsl(var(--primary)); }
.source-tag.manual { background: hsl(var(--warning) / 0.1); color: hsl(var(--warning)); }

.tax-amount { color: hsl(var(--destructive)); font-weight: 600; }
.amount { color: hsl(var(--foreground)); font-weight: 500; }
.text-muted { color: hsl(var(--muted-foreground)); font-size: 12px; }
.slip-link { color: hsl(var(--primary)); font-family: monospace; font-size: 12px; cursor: pointer; }
.slip-link:hover { text-decoration: underline; }
</style>