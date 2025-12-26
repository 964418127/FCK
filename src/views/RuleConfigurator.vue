<template>
  <div class="page-wrapper">
    <div class="page-header">
      <div>
        <h2>可视化规则配置 v1</h2>
        <p class="subtitle">维护条件、校验、计算、权限等规则模板（独立于现有流程管理）</p>
      </div>
      <el-button type="primary" @click="handleAddRule">
        <el-icon><Plus /></el-icon>
        新建规则
      </el-button>
    </div>

    <el-card shadow="hover" class="panel-card">
      <div class="card-header">
        <div class="title-row">
          <el-icon><Setting /></el-icon>
          <span>规则列表</span>
        </div>
        <div class="search-bar">
          <el-input v-model="searchKeyword" placeholder="搜索规则编码/名称" clearable style="width: 200px" />
          <el-select v-model="filterType" placeholder="规则类型" clearable style="width: 150px; margin-left: 8px">
            <el-option label="条件规则" value="condition" />
            <el-option label="数据验证" value="validation" />
            <el-option label="业务计算" value="calculation" />
            <el-option label="权限校验" value="permission" />
          </el-select>
        </div>
      </div>
      <el-table :data="filteredRules" style="width: 100%">
        <el-table-column prop="code" label="规则编码" width="160" />
        <el-table-column prop="name" label="规则名称" min-width="180" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="scope">
            <el-tag :type="getTypeTagType(scope.row.type)">{{ getTypeLabel(scope.row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
              {{ scope.row.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button type="primary" text size="small" @click="handleEditRule(scope.row)">配置</el-button>
            <el-button text size="small" @click="handleCopyRule(scope.row)">复制</el-button>
            <el-button text size="small" type="danger" @click="handleDeleteRule(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 规则配置弹窗 -->
    <el-dialog v-model="ruleDialogVisible" :title="isEdit ? '编辑规则' : '新建规则'" width="800px" :close-on-click-modal="false">
      <el-tabs v-model="configTab">
        <el-tab-pane label="基本信息" name="basic">
          <el-form :model="ruleForm" label-width="100px" size="default">
            <el-form-item label="规则编码" required>
              <el-input v-model="ruleForm.code" placeholder="如：validate_phone_format" :disabled="isEdit" />
            </el-form-item>
            <el-form-item label="规则名称" required>
              <el-input v-model="ruleForm.name" placeholder="如：手机号格式校验" />
            </el-form-item>
            <el-form-item label="规则类型" required>
              <el-select v-model="ruleForm.type" placeholder="选择类型">
                <el-option label="条件规则" value="condition" />
                <el-option label="数据验证" value="validation" />
                <el-option label="业务计算" value="calculation" />
                <el-option label="权限校验" value="permission" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-radio-group v-model="ruleForm.status">
                <el-radio label="active">启用</el-radio>
                <el-radio label="inactive">停用</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="描述">
              <el-input v-model="ruleForm.description" type="textarea" :rows="3" placeholder="规则描述" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="可视化配置" name="visual">
          <div v-if="ruleForm.type === 'condition'">
            <el-form label-width="120px" size="default">
              <el-form-item label="条件组合">
                <el-radio-group v-model="ruleForm.conditionLogic">
                  <el-radio label="AND">AND（全部满足）</el-radio>
                  <el-radio label="OR">OR（任一满足）</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="条件列表">
                <el-button type="primary" size="small" @click="addCondition">添加条件</el-button>
                <el-table :data="ruleForm.conditions" style="margin-top: 12px">
                  <el-table-column label="字段" width="150">
                    <template #default="scope">
                      <el-input v-model="scope.row.field" placeholder="字段名" size="small" />
                    </template>
                  </el-table-column>
                  <el-table-column label="操作符" width="120">
                    <template #default="scope">
                      <el-select v-model="scope.row.operator" size="small">
                        <el-option label="等于" value="==" />
                        <el-option label="不等于" value="!=" />
                        <el-option label="大于" value=">" />
                        <el-option label="大于等于" value=">=" />
                        <el-option label="小于" value="<" />
                        <el-option label="小于等于" value="<=" />
                        <el-option label="包含" value="includes" />
                        <el-option label="不包含" value="notIncludes" />
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="值">
                    <template #default="scope">
                      <el-input v-model="scope.row.value" placeholder="比较值" size="small" />
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="80">
                    <template #default="scope">
                      <el-button type="danger" text size="small" @click="removeCondition(scope.$index)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-form-item>
            </el-form>
          </div>
          
          <div v-else-if="ruleForm.type === 'validation'">
            <el-form label-width="120px" size="default">
              <el-form-item label="验证类型">
                <el-select v-model="ruleForm.validationType" placeholder="选择验证类型">
                  <el-option label="必填验证" value="required" />
                  <el-option label="格式验证" value="format" />
                  <el-option label="范围验证" value="range" />
                  <el-option label="自定义验证" value="custom" />
                </el-select>
              </el-form-item>
              <el-form-item v-if="ruleForm.validationType === 'format'" label="格式类型">
                <el-select v-model="ruleForm.formatType" placeholder="选择格式">
                  <el-option label="邮箱" value="email" />
                  <el-option label="手机号" value="phone" />
                  <el-option label="身份证" value="idCard" />
                  <el-option label="URL" value="url" />
                </el-select>
              </el-form-item>
              <el-form-item v-if="ruleForm.validationType === 'range'" label="范围">
                <el-input-number v-model="ruleForm.min" placeholder="最小值" style="width: 120px" />
                <span style="margin: 0 8px">-</span>
                <el-input-number v-model="ruleForm.max" placeholder="最大值" style="width: 120px" />
              </el-form-item>
            </el-form>
          </div>
          
          <div v-else-if="ruleForm.type === 'calculation'">
            <el-form label-width="120px" size="default">
              <el-form-item label="计算类型">
                <el-select v-model="ruleForm.calculationType" placeholder="选择计算类型">
                  <el-option label="字段计算" value="field" />
                  <el-option label="聚合计算" value="aggregate" />
                  <el-option label="业务公式" value="formula" />
                </el-select>
              </el-form-item>
              <el-form-item label="计算公式">
                <el-input v-model="ruleForm.formula" type="textarea" :rows="4" placeholder="如：amount * quantity * (1 - discount)" />
              </el-form-item>
            </el-form>
          </div>
          
          <div v-else-if="ruleForm.type === 'permission'">
            <el-form label-width="120px" size="default">
              <el-form-item label="权限类型">
                <el-select v-model="ruleForm.permissionType" placeholder="选择权限类型">
                  <el-option label="角色权限" value="role" />
                  <el-option label="数据权限" value="data" />
                  <el-option label="操作权限" value="operation" />
                </el-select>
              </el-form-item>
              <el-form-item label="权限值">
                <el-input v-model="ruleForm.permissionValue" placeholder="角色/权限标识" />
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="表达式编辑" name="expression">
          <el-form label-width="100px" size="default">
            <el-form-item label="规则表达式">
              <el-input
                v-model="ruleForm.expression"
                type="textarea"
                :rows="8"
                placeholder="输入JavaScript表达式，如：phone && /^1[3-9]\d{9}$/.test(phone)"
              />
              <div class="tip">支持JavaScript表达式语法，可使用流程变量</div>
            </el-form-item>
            <el-form-item label="测试数据">
              <el-input
                v-model="testData"
                type="textarea"
                :rows="4"
                placeholder='JSON格式，如：{"phone": "13800138000"}'
              />
              <el-button type="primary" size="small" style="margin-top: 8px" @click="testExpression">测试表达式</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRule">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus, Setting } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const rules = ref([
  { code: 'validate_phone_format', name: '手机号格式校验', type: 'validation', status: 'active', updatedAt: '2025-01-10 10:00' },
  { code: 'identity.verified', name: '身份核验通过判断', type: 'condition', status: 'active', updatedAt: '2025-01-10 11:00' },
  { code: 'course.progress', name: '课程进度达标', type: 'condition', status: 'active', updatedAt: '2025-01-11 09:00' },
  { code: 'exam.passed', name: '考试通过计算', type: 'calculation', status: 'inactive', updatedAt: '2025-01-08 15:30' }
])

const searchKeyword = ref('')
const filterType = ref('')
const ruleDialogVisible = ref(false)
const isEdit = ref(false)
const configTab = ref('basic')
const testData = ref('')

const ruleForm = ref({
  code: '',
  name: '',
  type: '',
  status: 'active',
  description: '',
  expression: '',
  conditionLogic: 'AND',
  conditions: [],
  validationType: '',
  formatType: '',
  min: null,
  max: null,
  calculationType: '',
  formula: '',
  permissionType: '',
  permissionValue: ''
})

const filteredRules = computed(() => {
  let result = [...rules.value]
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(r => r.code.toLowerCase().includes(keyword) || r.name.toLowerCase().includes(keyword))
  }
  if (filterType.value) {
    result = result.filter(r => r.type === filterType.value)
  }
  return result
})

const getTypeLabel = (type) => {
  const map = {
    condition: '条件规则',
    validation: '数据验证',
    calculation: '业务计算',
    permission: '权限校验'
  }
  return map[type] || type
}

const getTypeTagType = (type) => {
  const map = {
    condition: 'primary',
    validation: 'success',
    calculation: 'warning',
    permission: 'danger'
  }
  return map[type] || 'info'
}

const handleAddRule = () => {
  isEdit.value = false
  ruleForm.value = {
    code: '',
    name: '',
    type: '',
    status: 'active',
    description: '',
    expression: '',
    conditionLogic: 'AND',
    conditions: [],
    validationType: '',
    formatType: '',
    min: null,
    max: null,
    calculationType: '',
    formula: '',
    permissionType: '',
    permissionValue: ''
  }
  configTab.value = 'basic'
  ruleDialogVisible.value = true
}

const handleEditRule = (row) => {
  isEdit.value = true
  ruleForm.value = { ...row }
  configTab.value = 'basic'
  ruleDialogVisible.value = true
}

const handleCopyRule = (row) => {
  isEdit.value = false
  ruleForm.value = { ...row, code: `${row.code}_copy` }
  ruleDialogVisible.value = true
}

const handleDeleteRule = (row) => {
  ElMessageBox.confirm('确定要删除该规则吗？', '确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = rules.value.findIndex(r => r.code === row.code)
    if (index > -1) {
      rules.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const addCondition = () => {
  ruleForm.value.conditions.push({ field: '', operator: '==', value: '' })
}

const removeCondition = (index) => {
  ruleForm.value.conditions.splice(index, 1)
}

const testExpression = () => {
  if (!ruleForm.value.expression) {
    ElMessage.warning('请先输入表达式')
    return
  }
  try {
    const data = testData.value ? JSON.parse(testData.value) : {}
    // 简单的表达式测试（实际应该使用安全的表达式引擎）
    const func = new Function(...Object.keys(data), `return ${ruleForm.value.expression}`)
    const result = func(...Object.values(data))
    ElMessage.success(`测试结果: ${result}`)
  } catch (e) {
    ElMessage.error(`表达式错误: ${e.message}`)
  }
}

const saveRule = () => {
  if (!ruleForm.value.code || !ruleForm.value.name || !ruleForm.value.type) {
    ElMessage.warning('请填写必填项')
    return
  }
  
  const ruleData = {
    ...ruleForm.value,
    updatedAt: new Date().toLocaleString('zh-CN')
  }
  
  if (isEdit.value) {
    const index = rules.value.findIndex(r => r.code === ruleForm.value.code)
    if (index > -1) {
      rules.value[index] = ruleData
    }
  } else {
    rules.value.push(ruleData)
  }
  
  ruleDialogVisible.value = false
  ElMessage.success(isEdit.value ? '编辑成功' : '创建成功')
}
</script>

<style scoped>
.page-wrapper {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0;
}

.subtitle {
  margin: 4px 0 0;
  color: #909399;
}

.panel-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.search-bar {
  display: flex;
  align-items: center;
}

.tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>

