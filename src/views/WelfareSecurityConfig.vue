<template>
  <div class="welfare-security-config">
    <div class="page-header">
      <h1>员工福利保障</h1>
      <p class="tip">💡 查看员工福利保障明细，支持对继承自岗位标准的配置进行微调 Override</p>
    </div>

    <div class="content-section">
      <!-- Tab切换 -->
      <el-tabs v-model="activeTab" class="welfare-tabs">
        <!-- 社保Tab -->
        <el-tab-pane label="社保" name="security">
          <div class="config-content">
            <div class="toolbar">
              <div class="toolbar-left">
                <el-input v-model="securityConfigSearch" placeholder="搜索员工" clearable style="width: 160px;" />
                <el-button @click="handleSecurityConfigReset">重置</el-button>
              </div>
              <div class="toolbar-right">
                <el-button type="primary" @click="openSecurityConfigDialog">+ 新增配置</el-button>
              </div>
            </div>

            <el-table :data="filteredSecurityConfig" stripe style="width: 100%; margin-top: 12px;">
              <el-table-column prop="employeeId" label="员工编号" width="120" />
              <el-table-column prop="employeeName" label="员工姓名" width="120" />
              <el-table-column prop="securityGrade" label="缴费等级" width="100">
                <template #default="{ row }">
                  {{ row.securityGrade }}级
                </template>
              </el-table-column>
              <el-table-column prop="securityStandard" label="标准值(元)" width="120">
                <template #default="{ row }">
                  ¥{{ row.securityStandard.toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column prop="updateTime" label="更新时间" width="180" />
              <el-table-column label="操作" width="100">
                <template #default="{ row }">
                  <el-button type="primary" size="small" link @click="editSecurityConfig(row)">编辑</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 公积金Tab -->
        <el-tab-pane label="公积金" name="fund">
          <div class="config-content">
            <div class="toolbar">
              <div class="toolbar-left">
                <el-input v-model="fundConfigSearch" placeholder="搜索员工" clearable style="width: 160px;" />
                <el-button @click="handleFundConfigReset">重置</el-button>
              </div>
              <div class="toolbar-right">
                <el-button type="primary" @click="openFundConfigDialog">+ 新增配置</el-button>
              </div>
            </div>

            <el-table :data="filteredFundConfig" stripe style="width: 100%; margin-top: 12px;">
              <el-table-column prop="employeeId" label="员工编号" width="120" />
              <el-table-column prop="employeeName" label="员工姓名" width="120" />
              <el-table-column prop="fundGrade" label="缴费等级" width="100">
                <template #default="{ row }">
                  {{ row.fundGrade }}级
                </template>
              </el-table-column>
              <el-table-column prop="fundStandard" label="标准值(元)" width="120">
                <template #default="{ row }">
                  ¥{{ row.fundStandard.toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column prop="updateTime" label="更新时间" width="180" />
              <el-table-column label="操作" width="100">
                <template #default="{ row }">
                  <el-button type="primary" size="small" link @click="editFundConfig(row)">编辑</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 社保配置弹窗 -->
    <el-dialog v-model="securityConfigVisible" :title="isSecurityConfigEdit ? '编辑配置' : '新增配置'" width="400px">
      <el-form :model="securityConfigForm" label-width="100px">
        <el-form-item label="员工">
          <el-select v-model="securityConfigForm.employeeId" placeholder="请选择员工" style="width: 100%;">
            <el-option label="张三 (E001)" value="E001" />
            <el-option label="李四 (E002)" value="E002" />
            <el-option label="王五 (E003)" value="E003" />
          </el-select>
        </el-form-item>
        <el-form-item label="社保等级">
          <el-select v-model="securityConfigForm.securityGrade" placeholder="请选择等级" style="width: 100%;">
            <el-option label="等级1 (3000)" value="1" />
            <el-option label="等级2 (5000)" value="2" />
            <el-option label="等级3 (8000)" value="3" />
            <el-option label="等级4 (10000)" value="4" />
            <el-option label="等级5 (15000)" value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="标准值">
          <el-input-number v-model="securityConfigForm.securityStandard" :min="0" :step="100" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="securityConfigVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSecurityConfig">确认</el-button>
      </template>
    </el-dialog>

    <!-- 公积金配置弹窗 -->
    <el-dialog v-model="fundConfigVisible" :title="isFundConfigEdit ? '编辑配置' : '新增配置'" width="400px">
      <el-form :model="fundConfigForm" label-width="100px">
        <el-form-item label="员工">
          <el-select v-model="fundConfigForm.employeeId" placeholder="请选择员工" style="width: 100%;">
            <el-option label="张三 (E001)" value="E001" />
            <el-option label="李四 (E002)" value="E002" />
            <el-option label="王五 (E003)" value="E003" />
          </el-select>
        </el-form-item>
        <el-form-item label="公积金等级">
          <el-select v-model="fundConfigForm.fundGrade" placeholder="请选择等级" style="width: 100%;">
            <el-option label="等级1 (1200)" value="1" />
            <el-option label="等级2 (2000)" value="2" />
            <el-option label="等级3 (3000)" value="3" />
            <el-option label="等级4 (5000)" value="4" />
            <el-option label="等级5 (8000)" value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="标准值">
          <el-input-number v-model="fundConfigForm.fundStandard" :min="0" :step="100" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="fundConfigVisible = false">取消</el-button>
        <el-button type="primary" @click="saveFundConfig">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('security')

// ========== 社保配置 ==========
const securityConfigSearch = ref('')
const securityConfig = ref([
  { id: 1, employeeId: 'E001', employeeName: '张三', securityGrade: '3', securityStandard: 8000, updateTime: '2026-01-15 10:00:00' },
  { id: 2, employeeId: 'E002', employeeName: '李四', securityGrade: '2', securityStandard: 5000, updateTime: '2026-01-15 10:00:00' },
  { id: 3, employeeId: 'E003', employeeName: '王五', securityGrade: '4', securityStandard: 10000, updateTime: '2026-01-15 10:00:00' }
])
const filteredSecurityConfig = computed(() => {
  return securityConfig.value.filter(item =>
    !securityConfigSearch.value || item.employeeId.includes(securityConfigSearch.value) || item.employeeName.includes(securityConfigSearch.value)
  )
})
const securityConfigVisible = ref(false)
const isSecurityConfigEdit = ref(false)
const securityConfigForm = reactive({ employeeId: '', securityGrade: '', securityStandard: 0 })
const openSecurityConfigDialog = () => { isSecurityConfigEdit.value = false; Object.assign(securityConfigForm, { employeeId: '', securityGrade: '', securityStandard: 0 }); securityConfigVisible.value = true }
const editSecurityConfig = (row) => { isSecurityConfigEdit.value = true; Object.assign(securityConfigForm, row); securityConfigVisible.value = true }
const handleSecurityConfigReset = () => { securityConfigSearch.value = '' }
const saveSecurityConfig = () => {
  const name = { E001: '张三', E002: '李四', E003: '王五' }[securityConfigForm.employeeId]
  if (isSecurityConfigEdit.value) {
    const idx = securityConfig.value.findIndex(i => i.employeeId === securityConfigForm.employeeId)
    if (idx !== -1) { securityConfig.value[idx] = { ...securityConfig.value[idx], ...securityConfigForm, employeeName: name, updateTime: new Date().toLocaleString('zh-CN') } }
  } else {
    securityConfig.value.push({ id: Date.now(), ...securityConfigForm, employeeName: name, updateTime: new Date().toLocaleString('zh-CN') })
  }
  securityConfigVisible.value = false; ElMessage.success('保存成功')
}

// ========== 公积金配置 ==========
const fundConfigSearch = ref('')
const fundConfig = ref([
  { id: 1, employeeId: 'E001', employeeName: '张三', fundGrade: '2', fundStandard: 2000, updateTime: '2026-01-15 10:00:00' },
  { id: 2, employeeId: 'E002', employeeName: '李四', fundGrade: '2', fundStandard: 2000, updateTime: '2026-01-15 10:00:00' },
  { id: 3, employeeId: 'E003', employeeName: '王五', fundGrade: '3', fundStandard: 3000, updateTime: '2026-01-15 10:00:00' }
])
const filteredFundConfig = computed(() => {
  return fundConfig.value.filter(item =>
    !fundConfigSearch.value || item.employeeId.includes(fundConfigSearch.value) || item.employeeName.includes(fundConfigSearch.value)
  )
})
const fundConfigVisible = ref(false)
const isFundConfigEdit = ref(false)
const fundConfigForm = reactive({ employeeId: '', fundGrade: '', fundStandard: 0 })
const openFundConfigDialog = () => { isFundConfigEdit.value = false; Object.assign(fundConfigForm, { employeeId: '', fundGrade: '', fundStandard: 0 }); fundConfigVisible.value = true }
const editFundConfig = (row) => { isFundConfigEdit.value = true; Object.assign(fundConfigForm, row); fundConfigVisible.value = true }
const handleFundConfigReset = () => { fundConfigSearch.value = '' }
const saveFundConfig = () => {
  const name = { E001: '张三', E002: '李四', E003: '王五' }[fundConfigForm.employeeId]
  if (isFundConfigEdit.value) {
    const idx = fundConfig.value.findIndex(i => i.employeeId === fundConfigForm.employeeId)
    if (idx !== -1) { fundConfig.value[idx] = { ...fundConfig.value[idx], ...fundConfigForm, employeeName: name, updateTime: new Date().toLocaleString('zh-CN') } }
  } else {
    fundConfig.value.push({ id: Date.now(), ...fundConfigForm, employeeName: name, updateTime: new Date().toLocaleString('zh-CN') })
  }
  fundConfigVisible.value = false; ElMessage.success('保存成功')
}
</script>

<style scoped>
.welfare-security-config {
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
}

.content-section {
  background: hsl(var(--background));
  border-radius: 8px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.config-content {
  padding: 16px 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 8px;
}
</style>