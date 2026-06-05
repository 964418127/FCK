<template>
  <div class="commercial-insurance">
    <div class="page-header">
      <h1>商业险管理</h1>
      <p class="tip">💡 员工福利保障分组下子页面，作为<strong>通用险种库</strong>。HR 维护"险种 / 适用城市 / 保费 / 成本单元 / 续保期"；入职时由办理入职人员按入职城市筛选项<strong>必选 1+</strong>（非全日制可选）。公司全额，<strong>不参与员工工资计算</strong>。</p>
    </div>

    <div class="content-section">
      <!-- 合作期限到期横幅 -->
      <div v-if="expiringSoonList.length > 0" class="renewal-banner">
        <div class="banner-icon">⚠️</div>
        <div class="banner-content">
          <div class="banner-title">合作期限提醒：{{ expiringSoonList.length }} 份商业险合作协议即将到期</div>
          <div class="banner-desc">
            下列商业险合作协议将在 <strong>{{ renewalWarnDays }} 天</strong> 内到期，请及时与保险公司<strong>续约</strong>：
            <span v-for="(item, idx) in expiringSoonList.slice(0, 3)" :key="item.id" class="banner-tag">
              {{ item.insuranceName }}（{{ item.expiryDate }}）
              <span v-if="idx < Math.min(2, expiringSoonList.length - 1)">、</span>
            </span>
            <span v-if="expiringSoonList.length > 3">等</span>
          </div>
        </div>
        <el-button type="warning" size="small" @click="filterExpiringSoon">查看全部</el-button>
      </div>

      <!-- 筛选区 -->
      <div class="search-section">
        <el-form :inline="true" class="demo-form-inline">
          <el-form-item label="险种名称">
            <el-input v-model="searchForm.insuranceName" placeholder="搜索" clearable style="width: 160px;" />
          </el-form-item>
          <el-form-item label="保险公司">
            <el-select v-model="searchForm.insuranceCompany" placeholder="选择" clearable style="width: 140px;">
              <el-option label="中国人保" value="中国人保" />
              <el-option label="平安保险" value="平安保险" />
              <el-option label="太平洋保险" value="太平洋保险" />
              <el-option label="中国人寿" value="中国人寿" />
            </el-select>
          </el-form-item>
          <el-form-item label="适用城市">
            <el-select v-model="searchForm.cityScope" placeholder="选择" clearable style="width: 120px;">
              <el-option label="全国通用" value="全国" />
              <el-option label="北京" value="北京" />
              <el-option label="上海" value="上海" />
              <el-option label="深圳" value="深圳" />
              <el-option label="杭州" value="杭州" />
            </el-select>
          </el-form-item>
          <el-form-item label="成本单元">
            <el-select v-model="searchForm.costUnit" placeholder="选择" clearable style="width: 100px;">
              <el-option label="月" value="月" />
              <el-option label="年" value="年" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="选择" clearable style="width: 110px;">
              <el-option label="有效" value="有效" />
              <el-option label="即将到期" value="即将到期" />
              <el-option label="已到期" value="已到期" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 操作按钮 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button type="primary" @click="handleCreate">+ 新增商业险</el-button>
          <el-button @click="handleImport">批量导入</el-button>
          <el-button @click="handleExport">导出</el-button>
        </div>
        <div class="toolbar-right">
          <el-tag type="info" size="small">
            <span>险种总数：</span>
            <span class="count">{{ totalCount }}</span>
          </el-tag>
          <el-tag type="warning" size="small">
            <span>即将到期：</span>
            <span class="count">{{ expiringSoonList.length }}</span>
          </el-tag>
          <el-tag type="danger" size="small">
            <span>已到期：</span>
            <span class="count">{{ expiredCount }}</span>
          </el-tag>
        </div>
      </div>

      <!-- 商业险列表 -->
      <el-table :data="filteredList" stripe style="width: 100%; margin-top: 12px;">
        <el-table-column prop="insuranceName" label="险种名称" width="160" />
        <el-table-column prop="insuranceCompany" label="保险公司" width="120" />
        <el-table-column label="适用城市" width="180">
          <template #default="{ row }">
            <el-tag v-if="row.cityScope === '全国'" type="success" size="small">全国通用</el-tag>
            <div v-else class="city-list">
              <el-tag v-for="city in row.applicableCities" :key="city" size="small" effect="plain" style="margin-right: 4px; margin-bottom: 2px;">
                {{ city }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="coverage" label="保额" width="120">
          <template #default="{ row }">
            ¥{{ row.coverage.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="premium" label="保费" width="120">
          <template #default="{ row }">
            ¥{{ row.premium.toLocaleString() }} / {{ row.costUnit }}
          </template>
        </el-table-column>
        <el-table-column label="月度折算" width="100">
          <template #default="{ row }">
            <span v-if="row.costUnit === '月'">¥{{ row.premium.toLocaleString() }}</span>
            <span v-else>¥{{ (row.premium / 12).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="有效期" width="220">
          <template #default="{ row }">
            <div class="date-range">
              <div>{{ row.effectiveDate }} ~ {{ row.expiryDate }}</div>
              <el-tag :type="getStatusTagType(row.status)" size="small" style="margin-top: 2px;">
                {{ row.status }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="renewalWarnDays" label="合作期限提醒" width="110" align="center">
          <template #default="{ row }">
            到期前 {{ row.renewalWarnDays }} 天
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
        <el-table-column prop="updateTime" label="更新时间" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" size="small" link @click="handleRenew(row)" v-if="row.status !== '有效'">续约</el-button>
            <el-button type="info" size="small" link @click="handleViewLog(row)">日志</el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          background
        />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" destroy-on-close>
      <el-form :model="form" label-width="120px" :rules="formRules" ref="formRef">
        <el-form-item label="险种名称" prop="insuranceName">
          <el-input v-model="form.insuranceName" placeholder="如：雇主责任险、意外险" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="保险公司" prop="insuranceCompany">
          <el-select v-model="form.insuranceCompany" placeholder="选择保险公司" style="width: 100%;">
            <el-option label="中国人保" value="中国人保" />
            <el-option label="平安保险" value="平安保险" />
            <el-option label="太平洋保险" value="太平洋保险" />
            <el-option label="中国人寿" value="中国人寿" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="适用城市" prop="cityScope">
          <el-radio-group v-model="form.cityScope" @change="onCityScopeChange">
            <el-radio label="城市专属">城市专属（1 或 N 个城市）</el-radio>
            <el-radio label="全国">全国通用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.cityScope === '城市专属'" label="选择城市" prop="applicableCities">
          <el-select v-model="form.applicableCities" multiple placeholder="可多选" style="width: 100%;">
            <el-option label="北京" value="北京" />
            <el-option label="上海" value="上海" />
            <el-option label="深圳" value="深圳" />
            <el-option label="杭州" value="杭州" />
            <el-option label="广州" value="广州" />
            <el-option label="成都" value="成都" />
          </el-select>
        </el-form-item>
        <el-form-item label="保额（元）" prop="coverage">
          <el-input-number v-model="form.coverage" :min="0" :step="10000" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="保费（元）" prop="premium">
          <el-input-number v-model="form.premium" :min="0" :step="100" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="成本单元" prop="costUnit">
          <el-radio-group v-model="form.costUnit">
            <el-radio label="月">月（直接进月度福利明细）</el-radio>
            <el-radio label="年">年（折算到月 = 保费 / 12）</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生效日期" prop="effectiveDate">
              <el-date-picker v-model="form.effectiveDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="到期日期" prop="expiryDate">
              <el-date-picker v-model="form.expiryDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="合作期限提醒" prop="renewalWarnDays">
          <el-input-number v-model="form.renewalWarnDays" :min="0" :max="365" :step="5" style="width: 100%;" />
          <div class="field-tip">合作协议到期前 N 天通知 HR 与保险公司续约（不针对单个员工）</div>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="可选" />
        </el-form-item>

        <el-divider content-position="left">计算预览</el-divider>
        <div class="calc-preview">
          <div class="preview-item">
            <span class="label">月度折算：</span>
            <span class="value">
              <strong v-if="form.costUnit === '月'">¥{{ (form.premium || 0).toLocaleString() }} / 月</strong>
              <strong v-else>¥{{ ((form.premium || 0) / 12).toFixed(2) }} / 月（年付折算）</strong>
            </span>
          </div>
          <div class="preview-item">
            <span class="label">公司全额：</span>
            <span class="value"><strong>是</strong>（不参与员工工资计算）</span>
          </div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <!-- 日志弹窗 -->
    <el-dialog v-model="logDialogVisible" title="调整日志" width="700px">
      <el-table :data="logList" stripe>
        <el-table-column prop="time" label="时间" width="160" />
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="action" label="操作类型" width="120" />
        <el-table-column prop="field" label="变更字段" width="160" />
        <el-table-column prop="beforeValue" label="原值" width="120" />
        <el-table-column prop="afterValue" label="新值" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const renewalWarnDays = ref(30)

// 续保提醒天数
const searchForm = reactive({
  insuranceName: '',
  insuranceCompany: '',
  cityScope: '',
  costUnit: '',
  status: ''
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 8
})

// 示例数据
const commercialInsuranceList = ref([
  // 雇主责任险 - 城市专属
  { id: 1, insuranceName: '雇主责任险-基础版', insuranceCompany: '中国人保', cityScope: '城市专属', applicableCities: ['北京', '上海'], coverage: 500000, premium: 1200, costUnit: '年', effectiveDate: '2026-01-01', expiryDate: '2026-12-31', renewalWarnDays: 30, status: '有效', remark: '标准雇主责任险，覆盖工伤、误工、医疗', updateTime: '2026-05-20 10:00:00' },
  { id: 2, insuranceName: '雇主责任险-基础版', insuranceCompany: '中国人保', cityScope: '城市专属', applicableCities: ['深圳'], coverage: 500000, premium: 1500, costUnit: '年', effectiveDate: '2026-01-01', expiryDate: '2026-12-31', renewalWarnDays: 30, status: '有效', remark: '深圳地区保费略高（行业基准不同）', updateTime: '2026-05-20 10:00:00' },
  { id: 3, insuranceName: '雇主责任险-基础版', insuranceCompany: '中国人保', cityScope: '城市专属', applicableCities: ['杭州'], coverage: 500000, premium: 1000, costUnit: '年', effectiveDate: '2026-01-01', expiryDate: '2026-06-15', renewalWarnDays: 30, status: '即将到期', remark: '杭州地区保单', updateTime: '2026-05-15 09:20:00' },
  // 雇主责任险 - 即将到期
  { id: 4, insuranceName: '雇主责任险-高保额版', insuranceCompany: '平安保险', cityScope: '城市专属', applicableCities: ['北京'], coverage: 1000000, premium: 2400, costUnit: '年', effectiveDate: '2025-07-01', expiryDate: '2026-06-10', renewalWarnDays: 30, status: '即将到期', remark: '高保额版本（管理岗）', updateTime: '2026-05-10 14:00:00' },
  // 意外险 - 全国通用
  { id: 5, insuranceName: '意外险-通勤版', insuranceCompany: '太平洋保险', cityScope: '全国', applicableCities: [], coverage: 200000, premium: 50, costUnit: '月', effectiveDate: '2026-01-01', expiryDate: '2099-12-31', renewalWarnDays: 30, status: '有效', remark: '全国通用，月付通勤意外险', updateTime: '2026-05-20 10:00:00' },
  { id: 6, insuranceName: '意外险-工作版', insuranceCompany: '太平洋保险', cityScope: '全国', applicableCities: [], coverage: 500000, premium: 100, costUnit: '月', effectiveDate: '2026-01-01', expiryDate: '2099-12-31', renewalWarnDays: 30, status: '有效', remark: '全国通用，月付工作意外险', updateTime: '2026-05-20 10:00:00' },
  // 医疗补充险
  { id: 7, insuranceName: '医疗补充险-高端版', insuranceCompany: '中国人寿', cityScope: '全国', applicableCities: [], coverage: 2000000, premium: 200, costUnit: '月', effectiveDate: '2026-01-01', expiryDate: '2099-12-31', renewalWarnDays: 30, status: '有效', remark: '全国通用，月付高端医疗补充', updateTime: '2026-05-20 10:00:00' },
  // 已到期
  { id: 8, insuranceName: '雇主责任险-旧版', insuranceCompany: '中国人保', cityScope: '城市专属', applicableCities: ['北京'], coverage: 300000, premium: 800, costUnit: '年', effectiveDate: '2025-01-01', expiryDate: '2025-12-31', renewalWarnDays: 30, status: '已到期', remark: '已停止使用，等待删除', updateTime: '2025-12-15 10:00:00' }
])

const expiringSoonList = computed(() => {
  return commercialInsuranceList.value.filter(item => item.status === '即将到期')
})

const expiredCount = computed(() => {
  return commercialInsuranceList.value.filter(item => item.status === '已到期').length
})

const totalCount = computed(() => commercialInsuranceList.value.length)

const filteredList = computed(() => {
  let result = commercialInsuranceList.value
  if (searchForm.insuranceName) {
    result = result.filter(item => item.insuranceName.includes(searchForm.insuranceName))
  }
  if (searchForm.insuranceCompany) {
    result = result.filter(item => item.insuranceCompany === searchForm.insuranceCompany)
  }
  if (searchForm.cityScope) {
    if (searchForm.cityScope === '全国') {
      result = result.filter(item => item.cityScope === '全国')
    } else {
      result = result.filter(item => item.applicableCities.includes(searchForm.cityScope))
    }
  }
  if (searchForm.costUnit) {
    result = result.filter(item => item.costUnit === searchForm.costUnit)
  }
  if (searchForm.status) {
    result = result.filter(item => item.status === searchForm.status)
  }
  return result
})

const getStatusTagType = (status) => {
  const map = { '有效': 'success', '即将到期': 'warning', '已到期': 'danger' }
  return map[status] || 'info'
}

const dialogVisible = ref(false)
const logDialogVisible = ref(false)
const dialogTitle = ref('新增商业险')
const isEdit = ref(false)
const formRef = ref(null)

const form = reactive({
  id: null,
  insuranceName: '',
  insuranceCompany: '',
  cityScope: '城市专属',
  applicableCities: [],
  coverage: 500000,
  premium: 0,
  costUnit: '年',
  effectiveDate: '',
  expiryDate: '',
  renewalWarnDays: 30,
  remark: ''
})

const formRules = {
  insuranceName: [{ required: true, message: '请输入险种名称', trigger: 'blur' }],
  insuranceCompany: [{ required: true, message: '请选择保险公司', trigger: 'change' }],
  cityScope: [{ required: true, message: '请选择适用城市范围', trigger: 'change' }],
  applicableCities: [{
    validator: (rule, value, callback) => {
      if (form.cityScope === '城市专属' && (!value || value.length === 0)) {
        callback(new Error('请至少选择一个城市'))
      } else {
        callback()
      }
    },
    trigger: 'change'
  }],
  coverage: [{ required: true, message: '请输入保额', trigger: 'blur' }],
  premium: [{ required: true, message: '请输入保费', trigger: 'blur' }],
  costUnit: [{ required: true, message: '请选择成本单元', trigger: 'change' }],
  effectiveDate: [{ required: true, message: '请选择生效日期', trigger: 'change' }],
  expiryDate: [{ required: true, message: '请选择到期日期', trigger: 'change' }],
  renewalWarnDays: [{ required: true, message: '请输入合作期限提醒天数', trigger: 'blur' }]
}

const logList = ref([
  { time: '2026-05-20 10:00:00', operator: '系统管理员', action: '新增', field: '-', beforeValue: '-', afterValue: '雇主责任险-基础版（北京/上海）' },
  { time: '2026-05-15 09:20:00', operator: '系统管理员', action: '修改', field: '保费', beforeValue: '1000 元/年', afterValue: '1200 元/年' },
  { time: '2026-05-10 14:00:00', operator: '系统管理员', action: '续约', field: '到期日期', beforeValue: '2025-07-01', afterValue: '2026-07-01' }
])

const handleSearch = () => {
  ElMessage.success(`已筛选，共 ${filteredList.value.length} 条`)
}

const handleReset = () => {
  Object.assign(searchForm, {
    insuranceName: '',
    insuranceCompany: '',
    cityScope: '',
    costUnit: '',
    status: ''
  })
}

const filterExpiringSoon = () => {
  searchForm.status = '即将到期'
}

const handleCreate = () => {
  isEdit.value = false
  dialogTitle.value = '新增商业险'
  Object.assign(form, {
    id: null,
    insuranceName: '',
    insuranceCompany: '',
    cityScope: '城市专属',
    applicableCities: [],
    coverage: 500000,
    premium: 0,
    costUnit: '年',
    effectiveDate: '',
    expiryDate: '',
    renewalWarnDays: 30,
    remark: ''
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑商业险'
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

const handleRenew = (row) => {
  ElMessageBox.prompt('请输入新的合作到期日期（YYYY-MM-DD）', '合作协议续约', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^\d{4}-\d{2}-\d{2}$/,
    inputErrorMessage: '请输入正确的日期格式'
  }).then(({ value }) => {
    const item = commercialInsuranceList.value.find(i => i.id === row.id)
    if (item) {
      item.expiryDate = value
      item.status = '有效'
      item.updateTime = new Date().toLocaleString('zh-CN')
      ElMessage.success('合作协议续约成功')
    }
  }).catch(() => {})
}

const handleViewLog = (row) => {
  logDialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除「${row.insuranceName}」？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const idx = commercialInsuranceList.value.findIndex(i => i.id === row.id)
    if (idx > -1) {
      commercialInsuranceList.value.splice(idx, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const handleImport = () => {
  ElMessage.info('批量导入功能开发中')
}

const handleExport = () => {
  ElMessage.info('导出功能开发中')
}

const onCityScopeChange = () => {
  if (form.cityScope === '全国') {
    form.applicableCities = []
  }
}

const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      const today = new Date().toISOString().split('T')[0]
      if (isEdit.value) {
        const idx = commercialInsuranceList.value.findIndex(i => i.id === form.id)
        if (idx > -1) {
          commercialInsuranceList.value[idx] = { ...form, updateTime: new Date().toLocaleString('zh-CN') }
        }
        ElMessage.success('保存成功')
      } else {
        commercialInsuranceList.value.push({
          ...form,
          id: Date.now(),
          status: form.expiryDate < today ? '已到期' : '有效',
          updateTime: new Date().toLocaleString('zh-CN')
        })
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
    }
  })
}

onMounted(() => {
  // 检查合作协议期限状态（实际项目应根据当前日期计算）
  // 此处简化处理：示例数据已预设状态
})
</script>

<style scoped>
.commercial-insurance {
  padding: 0;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: hsl(var(--foreground));
}

.page-header .tip {
  color: hsl(var(--muted-foreground));
  font-size: 14px;
  margin: 0;
  line-height: 1.6;
}

.content-section {
  background: hsl(var(--background));
  border-radius: 8px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.renewal-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: hsl(var(--warning) / 0.1);
  border-left: 3px solid hsl(var(--warning));
  border-radius: 4px;
  margin-bottom: 16px;
}

.banner-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.banner-content {
  flex: 1;
}

.banner-title {
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--warning));
  margin-bottom: 4px;
}

.banner-desc {
  font-size: 13px;
  color: hsl(var(--foreground));
  line-height: 1.5;
}

.banner-tag {
  display: inline-block;
  margin: 0 4px;
  padding: 2px 6px;
  background: hsl(var(--warning) / 0.15);
  border-radius: 3px;
  color: hsl(var(--warning));
  font-weight: 500;
}

.search-section {
  padding-bottom: 16px;
  border-bottom: 1px solid hsl(var(--border));
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 0;
}

.toolbar-left {
  display: flex;
  gap: 8px;
}

.toolbar-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.count {
  font-weight: 600;
  margin-left: 4px;
}

.city-list {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

.date-range {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.field-tip {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  margin-top: 4px;
}

.calc-preview {
  padding: 12px;
  background: hsl(var(--primary) / 0.05);
  border: 1px solid hsl(var(--primary) / 0.15);
  border-radius: 4px;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  font-size: 13px;
}

.preview-item .label {
  color: hsl(var(--muted-foreground));
}

.preview-item .value {
  color: hsl(var(--foreground));
}
</style>
