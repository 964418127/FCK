<template>
  <div class="process-role-configuration">
    <div class="configuration-header">
      <h3>{{ config ? '编辑流程角色配置' : '新增流程角色配置' }}</h3>
    </div>
    
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px" class="config-form">
      <!-- 流程与环节选择 -->
      <el-card shadow="hover" class="form-card">
        <template #header>
          <h4>流程与环节</h4>
        </template>
        <el-form-item label="选择流程" prop="processId">
          <el-select 
            v-model="formData.processId" 
            placeholder="请选择流程" 
            style="width: 100%"
            @change="handleProcessChange"
          >
            <el-option 
              v-for="process in availableProcesses" 
              :key="process.id" 
              :label="process.name" 
              :value="process.id"
            >
              <div class="process-option">
                <span>{{ process.name }}</span>
                <span class="process-desc">({{ process.description }})</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="选择环节" prop="nodeId">
          <el-select 
            v-model="formData.nodeId" 
            placeholder="请选择环节" 
            style="width: 100%"
            :disabled="!formData.processId"
          >
            <el-option 
              v-for="node in availableNodes" 
              :key="node.id" 
              :label="node.name" 
              :value="node.id"
            >
              <div class="node-option">
                <span>{{ node.name }}</span>
                <span class="node-type">({{ node.type === 'start' ? '开始' : node.type === 'end' ? '结束' : '中间' }})</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </el-card>
      
      <!-- 权限配置 -->
      <el-card shadow="hover" class="form-card" style="margin-top: 20px">
        <template #header>
          <h4>权限配置</h4>
        </template>
        <el-form-item label="页面权限">
          <el-select 
            v-model="formData.permissionIds" 
            placeholder="请选择页面权限" 
            multiple 
            filterable 
            style="width: 100%"
          >
            <el-option 
              v-for="perm in pagePermissions" 
              :key="perm.id" 
              :label="perm.name" 
              :value="perm.id"
            >
              <div class="permission-option">
                <span>{{ perm.name }}</span>
                <span class="perm-code">({{ perm.code }})</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="按钮权限">
          <el-select 
            v-model="formData.buttonPermissionIds" 
            placeholder="请选择按钮权限" 
            multiple 
            filterable 
            style="width: 100%"
          >
            <el-option 
              v-for="perm in buttonPermissions" 
              :key="perm.id" 
              :label="perm.name" 
              :value="perm.id"
            >
              <div class="permission-option">
                <span>{{ perm.name }}</span>
                <span class="perm-code">({{ perm.code }})</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="API权限">
          <el-select 
            v-model="formData.apiPermissionIds" 
            placeholder="请选择API权限" 
            multiple 
            filterable 
            style="width: 100%"
          >
            <el-option 
              v-for="perm in apiPermissions" 
              :key="perm.id" 
              :label="perm.name" 
              :value="perm.id"
            >
              <div class="permission-option">
                <span>{{ perm.name }}</span>
                <span class="perm-url">({{ perm.apiUrl }})</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </el-card>
      
      <!-- 数据规则配置 -->
      <el-card shadow="hover" class="form-card" style="margin-top: 20px">
        <template #header>
          <h4>数据规则配置</h4>
        </template>
        <el-form-item label="数据规则">
          <el-select 
            v-model="formData.dataRuleIds" 
            placeholder="请选择数据规则" 
            multiple 
            filterable 
            style="width: 100%"
          >
            <el-option 
              v-for="rule in availableDataRules" 
              :key="rule.id" 
              :label="rule.name" 
              :value="rule.id"
            >
              <div class="rule-option">
                <span>{{ rule.name }}</span>
                <span class="rule-desc">({{ rule.description }})</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </el-card>
      
      <!-- 权限有效期配置 -->
      <el-card shadow="hover" class="form-card" style="margin-top: 20px">
        <template #header>
          <h4>权限有效期配置</h4>
        </template>
        <el-form-item label="有效期类型" prop="validityType">
          <el-select v-model="formData.validityType" placeholder="请选择有效期类型" style="width: 100%">
            <el-option label="永久" value="permanent" />
            <el-option label="临时" value="temporary" />
            <el-option label="环节期间" value="nodeDuration" />
          </el-select>
        </el-form-item>
        
        <el-form-item 
          v-if="formData.validityType === 'temporary'" 
          label="有效期时长" 
          prop="validityDuration"
        >
          <el-input-number 
            v-model="formData.validityDuration" 
            :min="1" 
            :max="864000" 
            :step="3600" 
            placeholder="请输入有效期时长（秒）"
          />
          <span class="unit-desc">秒</span>
        </el-form-item>
        
        <el-form-item label="配置描述">
          <el-input 
            v-model="formData.description" 
            type="textarea" 
            rows="3" 
            placeholder="请输入配置描述"
          />
        </el-form-item>
      </el-card>
      
      <!-- 操作按钮 -->
      <div class="form-actions">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSave">保存配置</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  businessProcesses, 
  processNodes as allProcessNodes, 
  permissions as allPermissions, 
  dataRules 
} from '../mock/data'

// 接收父组件传入的props
const props = defineProps({
  config: {
    type: Object,
    default: null
  }
})

// 定义事件
const emit = defineEmits(['save', 'cancel'])

// 响应式数据
const formRef = ref(null)
const formData = ref({
  id: '',
  processId: '',
  nodeId: '',
  permissionIds: [],
  buttonPermissionIds: [],
  apiPermissionIds: [],
  dataRuleIds: [],
  validityType: 'nodeDuration',
  validityDuration: 0,
  description: ''
})

// 表单验证规则
const rules = {
  processId: [
    { required: true, message: '请选择流程', trigger: 'change' }
  ],
  nodeId: [
    { required: true, message: '请选择环节', trigger: 'change' }
  ],
  validityType: [
    { required: true, message: '请选择有效期类型', trigger: 'change' }
  ]
}

// 可用流程列表
const availableProcesses = ref(businessProcesses)

// 根据选择的流程过滤环节
const availableNodes = computed(() => {
  if (!formData.value.processId) return []
  return allProcessNodes.filter(node => node.processId === formData.value.processId)
})

// 页面权限列表
const pagePermissions = computed(() => {
  return allPermissions.filter(p => p.type === 'page')
})

// 按钮权限列表
const buttonPermissions = computed(() => {
  return allPermissions.filter(p => p.type === 'button')
})

// API权限列表
const apiPermissions = computed(() => {
  return allPermissions.filter(p => p.type === 'api')
})

// 可用数据规则列表
const availableDataRules = ref(dataRules)

// 处理流程变化，重置环节和权限
const handleProcessChange = () => {
  // 重置环节选择
  formData.value.nodeId = ''
  // 可以根据需要重置其他相关字段
}

// 监听配置变化，初始化表单数据
watch(() => props.config, (newConfig) => {
  if (newConfig) {
    // 合并所有权限ID到permissionIds字段
    const allPermissionIds = [
      ...(newConfig.permissionIds || []),
      ...(newConfig.buttonPermissionIds || []),
      ...(newConfig.apiPermissionIds || [])
    ]
    
    formData.value = {
      ...JSON.parse(JSON.stringify(newConfig)),
      permissionIds: allPermissionIds,
      buttonPermissionIds: [],
      apiPermissionIds: []
    }
    
    // 根据权限类型分离权限ID
    formData.value.permissionIds = allPermissionIds.filter(id => {
      const perm = allPermissions.find(p => p.id === id)
      return perm && perm.type === 'page'
    })
    
    formData.value.buttonPermissionIds = allPermissionIds.filter(id => {
      const perm = allPermissions.find(p => p.id === id)
      return perm && perm.type === 'button'
    })
    
    formData.value.apiPermissionIds = allPermissionIds.filter(id => {
      const perm = allPermissions.find(p => p.id === id)
      return perm && perm.type === 'api'
    })
  } else {
    // 重置表单
    formData.value = {
      id: `proc-role-${Date.now()}`,
      processId: '',
      nodeId: '',
      permissionIds: [],
      buttonPermissionIds: [],
      apiPermissionIds: [],
      dataRuleIds: [],
      validityType: 'nodeDuration',
      validityDuration: 0,
      description: ''
    }
  }
}, { immediate: true, deep: true })

// 保存配置
const handleSave = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      // 合并所有权限ID
      const allPermissionIds = [
        ...formData.value.permissionIds,
        ...formData.value.buttonPermissionIds,
        ...formData.value.apiPermissionIds
      ]
      
      const saveData = {
        ...formData.value,
        permissionIds: allPermissionIds
      }
      
      // 删除临时字段
      delete saveData.buttonPermissionIds
      delete saveData.apiPermissionIds
      
      emit('save', saveData)
      ElMessage.success('配置保存成功')
    }
  })
}

// 取消操作
const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.process-role-configuration {
  padding: 20px;
}

.configuration-header {
  margin-bottom: 20px;
}

.configuration-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.config-form {
  max-width: 800px;
}

.form-card {
  margin-bottom: 20px;
}

.form-card :deep(.el-card__header) {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}

.form-card :deep(.el-card__body) {
  padding: 20px;
}

.form-actions {
  margin-top: 30px;
  text-align: right;
}

.process-option,
.node-option,
.permission-option,
.rule-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.process-desc,
.node-type,
.perm-code,
.perm-url,
.rule-desc {
  font-size: 12px;
  color: #909399;
}

.unit-desc {
  margin-left: 10px;
  color: #909399;
  font-size: 14px;
}
</style>