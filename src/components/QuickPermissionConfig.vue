<template>
  <div class="quick-permission-config">
    <div class="config-header">
      <h3>快速权限配置</h3>
      <el-button @click="handleClose" type="text">
        <el-icon-close /> 关闭
      </el-button>
    </div>
    
    <div class="config-content">
      <!-- 步骤指示器 -->
      <el-steps :active="activeStep" finish-status="success" class="steps">
        <el-step title="选择用户" />
        <el-step title="选择或创建角色" />
        <el-step title="关联业务流程业务节点" />
        <el-step title="配置完成" />
      </el-steps>
      
      <!-- 步骤内容 -->
      <div class="step-content">
        <!-- 步骤1：选择用户 -->
        <div v-if="activeStep === 0" class="step-section">
          <h4>选择用户</h4>
          <div class="user-select-section">
            <el-radio-group v-model="configData.userSelection" class="user-selection">
              <el-radio label="existing">现有用户</el-radio>
              <el-radio label="new">新建用户</el-radio>
            </el-radio-group>
            
            <!-- 现有用户选择 -->
            <div v-if="configData.userSelection === 'existing'" class="existing-user">
              <el-form-item label="选择用户" prop="userId">
                <el-select 
                  v-model="configData.userId" 
                  placeholder="请选择用户" 
                  style="width: 100%"
                  filterable
                  @change="handleUserChange"
                >
                  <el-option 
                    v-for="user in users" 
                    :key="user.id" 
                    :label="user.name" 
                    :value="user.id"
                  >
                    <div class="user-option">
                      <span>{{ user.name }}</span>
                      <span class="user-info">({{ user.username }} - {{ user.positionName }})</span>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
              
              <!-- 显示选中用户的岗位信息 -->
              <el-form-item v-if="configData.userId && selectedUser" label="岗位信息">
                <el-descriptions :column="2" border size="small">
                  <el-descriptions-item label="岗位名称">
                    {{ selectedUser.positionName }}
                  </el-descriptions-item>
                  <el-descriptions-item label="部门">
                    {{ selectedUser.departmentName }}
                  </el-descriptions-item>
                </el-descriptions>
              </el-form-item>
            </div>
            
            <!-- 新建用户表单 -->
            <div v-else class="new-user-form">
              <el-form :model="newUserForm" :rules="newUserRules" ref="newUserFormRef" label-width="120px">
                <el-form-item label="用户名" prop="username">
                  <el-input v-model="newUserForm.username" placeholder="请输入用户名" />
                </el-form-item>
                <el-form-item label="姓名" prop="name">
                  <el-input v-model="newUserForm.name" placeholder="请输入姓名" />
                </el-form-item>
                <el-form-item label="部门" prop="departmentId">
                  <el-select 
                    v-model="newUserForm.departmentId" 
                    placeholder="请选择部门" 
                    style="width: 100%"
                  >
                    <el-option 
                      v-for="dept in departments" 
                      :key="dept.id" 
                      :label="dept.name" 
                      :value="dept.id"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="岗位" prop="positionId">
                  <el-select 
                    v-model="newUserForm.positionId" 
                    placeholder="请选择岗位" 
                    style="width: 100%"
                  >
                    <el-option 
                      v-for="pos in positions" 
                      :key="pos.id" 
                      :label="pos.name" 
                      :value="pos.id"
                    />
                  </el-select>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </div>
        
        <!-- 步骤2：选择或创建角色 -->
        <div v-if="activeStep === 1" class="step-section">
          <h4>选择或创建角色</h4>
          <div class="role-select-section">
            <el-radio-group v-model="configData.roleSelection" class="role-selection">
              <el-radio label="existing">现有角色</el-radio>
              <el-radio label="new">新建角色</el-radio>
            </el-radio-group>
            
            <!-- 现有角色选择 -->
            <div v-if="configData.roleSelection === 'existing'" class="existing-role">
              <el-form-item label="选择角色" prop="roleId">
                <el-select 
                  v-model="configData.roleId" 
                  placeholder="请选择角色" 
                  style="width: 100%"
                  filterable
                >
                  <el-option 
                    v-for="role in roles" 
                    :key="role.id" 
                    :label="role.name" 
                    :value="role.id"
                  >
                    <div class="role-option">
                      <span>{{ role.name }}</span>
                      <span class="role-info">({{ role.description }})</span>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
            </div>
            
            <!-- 新建角色表单 -->
            <div v-else class="new-role-form">
              <el-form :model="newRoleForm" :rules="newRoleRules" ref="newRoleFormRef" label-width="120px">
                <el-form-item label="角色名称" prop="name">
                  <el-input v-model="newRoleForm.name" placeholder="请输入角色名称" />
                </el-form-item>
                <el-form-item label="角色描述">
                  <el-input 
                    v-model="newRoleForm.description" 
                    type="textarea" 
                    rows="2" 
                    placeholder="请输入角色描述"
                  />
                </el-form-item>
              </el-form>
            </div>
          </div>
        </div>
        
        <!-- 步骤3：关联业务流程业务节点 -->
        <div v-if="activeStep === 2" class="step-section">
          <h4>关联业务流程业务节点</h4>
          <div class="business-process-section">
            <!-- 业务选择（多选） -->
            <el-form-item label="选择业务" prop="businessIds">
              <el-select 
                v-model="configData.businessIds" 
                placeholder="请选择业务（可多选）" 
                style="width: 100%"
                multiple
                filterable
                collapse-tags
                collapse-tags-tooltip
                @change="handleBusinessChange"
              >
                <el-option 
                  v-for="business in businesses" 
                  :key="business.id" 
                  :label="business.name" 
                  :value="business.id"
                >
                  <div class="business-option">
                    <span>{{ business.name }}</span>
                    <span class="business-info">({{ business.description }})</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
            
            <!-- 按业务分组显示流程和节点 -->
            <div v-if="configData.businessIds && configData.businessIds.length > 0" class="business-group-container">
              <div 
                v-for="businessId in configData.businessIds" 
                :key="businessId" 
                class="business-group"
              >
                <div class="business-group-header">
                  <h5>{{ getBusinessName(businessId) }}</h5>
                </div>
                
                <!-- 流程选择（多选，按业务过滤） -->
                <el-form-item :label="`${getBusinessName(businessId)} - 选择流程`" prop="processIds">
                  <el-select 
                    v-model="configData.processIdsMap[businessId]" 
                    :placeholder="`请选择${getBusinessName(businessId)}的流程（可多选）`" 
                    style="width: 100%"
                    multiple
                    filterable
                    collapse-tags
                    collapse-tags-tooltip
                    @change="handleProcessChange(businessId)"
                  >
                    <el-option 
                      v-for="process in getProcessesByBusiness(businessId)" 
                      :key="process.id" 
                      :label="process.name" 
                      :value="process.id"
                    >
                      <div class="process-option">
                        <span>{{ process.name }}</span>
                        <span class="process-info">({{ process.description }})</span>
                      </div>
                    </el-option>
                  </el-select>
                </el-form-item>
                
                <!-- 按流程分组显示业务节点 -->
                <div v-if="configData.processIdsMap[businessId] && configData.processIdsMap[businessId].length > 0" class="process-group-container">
                  <div 
                    v-for="processId in configData.processIdsMap[businessId]" 
                    :key="processId" 
                    class="process-group"
                  >
                    <div class="process-group-header">
                      <h6>{{ getProcessName(processId) }}</h6>
                    </div>
                    
                    <!-- 业务节点选择（多选，按流程过滤） -->
                    <el-form-item :label="`${getProcessName(processId)} - 选择业务节点`" prop="nodeIds">
                      <el-select 
                        v-model="configData.nodeIdsMap[businessId + '-' + processId]" 
                        :placeholder="`请选择${getProcessName(processId)}的业务节点（可多选）`" 
                        style="width: 100%"
                        multiple
                        filterable
                        collapse-tags
                        collapse-tags-tooltip
                      >
                        <el-option 
                          v-for="node in getNodesByProcess(processId)" 
                          :key="node.id" 
                          :label="node.name" 
                          :value="node.id"
                        >
                          <div class="node-option">
                            <span>{{ node.name }}</span>
                            <span class="node-info">({{ getNodeTypeLabel(node.type) }} - {{ node.description }})</span>
                          </div>
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </div>
                </div>
                <div v-else class="no-process-tip">
                  <el-alert
                    :title="`请先为『${getBusinessName(businessId)}』选择至少一个流程`"
                    type="info"
                    :closable="false"
                    show-icon
                  />
                </div>
              </div>
            </div>
            
            <div class="tip">可以同时选择多个业务，每个业务下可以选择多个流程和业务节点，角色将获得所选业务节点配置的所有权限</div>
          </div>
        </div>
        
        <!-- 步骤4：配置完成 -->
        <div v-if="activeStep === 3" class="step-section">
          <div class="complete-section">
            <el-icon-check-circle class="success-icon" />
            <h4>配置完成</h4>
            <div class="complete-info">
              <p>您已成功配置权限：</p>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="用户">
                  {{ configData.userSelection === 'existing' ? getUserName(configData.userId) : newUserForm.name }}
                </el-descriptions-item>
                <el-descriptions-item label="角色">
                  {{ configData.roleSelection === 'existing' ? getRoleName(configData.roleId) : newRoleForm.name }}
                </el-descriptions-item>
                <el-descriptions-item label="关联业务">
                  <div v-for="businessId in configData.businessIds" :key="businessId" class="node-tag">
                    {{ getBusinessName(businessId) }}
                  </div>
                </el-descriptions-item>
                <el-descriptions-item label="关联流程">
                  <div v-for="(processIds, businessId) in configData.processIdsMap" :key="businessId">
                    <div class="business-node-group">
                      <strong>{{ getBusinessName(businessId) }}：</strong>
                      <div v-for="processId in processIds" :key="processId" class="node-tag">
                        {{ getProcessName(processId) }}
                      </div>
                    </div>
                  </div>
                </el-descriptions-item>
                <el-descriptions-item label="关联业务节点">
                  <div v-for="businessId in configData.businessIds" :key="businessId">
                    <div class="business-node-group">
                      <strong>{{ getBusinessName(businessId) }}：</strong>
                      <div v-for="processId in configData.processIdsMap[businessId]" :key="processId">
                        <div class="process-node-group">
                          <span class="process-label">{{ getProcessName(processId) }}：</span>
                          <div v-for="nodeId in configData.nodeIdsMap[businessId + '-' + processId]" :key="nodeId" class="node-tag">
                            {{ getNodeName(nodeId) }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="step-actions">
        <el-button 
          v-if="activeStep > 0" 
          @click="handlePrevStep"
        >
          上一步
        </el-button>
        <template v-else>
          <el-button @click="handleClose">
            取消
          </el-button>
        </template>
        
        <template v-if="activeStep < 3">
          <el-button 
            type="primary" 
            @click="handleNextStep"
            :loading="isSubmitting"
          >
            下一步
          </el-button>
        </template>
        <template v-else>
          <el-button 
            type="primary" 
            @click="handleComplete"
            :loading="isSubmitting"
          >
            完成配置
          </el-button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  users as mockUsers, 
  roles as mockRoles, 
  businesses as mockBusinesses, 
  businessProcesses as mockBusinessProcesses,
  processNodes as mockProcessNodes,
  departments as mockDepartments,
  positions as mockPositions
} from '../mock/data'

// 接收父组件传入的props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

// 定义事件
const emit = defineEmits(['close', 'complete'])

// 响应式数据
const activeStep = ref(0)
const isSubmitting = ref(false)

// 配置数据
const configData = ref({
  userSelection: 'existing', // existing, new
  userId: '',
  roleSelection: 'existing', // existing, new
  roleId: '',
  businessIds: [], // 改为数组，支持多选
  processIdsMap: {}, // 按业务ID映射流程ID数组 { businessId: [processId1, processId2] }
  nodeIdsMap: {} // 按业务ID映射节点ID数组 { businessId: [nodeId1, nodeId2] }
})

// 选中的用户信息
const selectedUser = computed(() => {
  if (!configData.value.userId) return null
  return users.value.find(u => u.id === configData.value.userId)
})

// 新建用户表单
const newUserForm = ref({
  id: '',
  name: '',
  username: '',
  departmentId: '',
  positionId: ''
})

// 新建角色表单
const newRoleForm = ref({
  id: '',
  name: '',
  description: ''
})

// 表单验证规则
const newUserRules = {
  name: [
    { required: true, message: '请输入用户姓名', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  departmentId: [
    { required: true, message: '请选择部门', trigger: 'change' }
  ],
  positionId: [
    { required: true, message: '请选择岗位', trigger: 'change' }
  ]
}

const newRoleRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' }
  ]
}

// 模拟数据
const users = ref(mockUsers)
const roles = ref(mockRoles)
const businesses = ref(mockBusinesses)
const businessProcesses = ref(mockBusinessProcesses)
const processNodes = ref(mockProcessNodes)
const departments = ref(mockDepartments)
const positions = ref(mockPositions)

// 根据业务ID获取流程列表
const getProcessesByBusiness = (businessId) => {
  return businessProcesses.value.filter(process => process.businessId === businessId)
}

// 根据流程ID获取节点列表
const getNodesByProcess = (processId) => {
  return processNodes.value.filter(node => node.processId === processId)
}

// 步骤导航
const handlePrevStep = () => {
  activeStep.value--
}

const handleNextStep = async () => {
  // 验证当前步骤
  if (activeStep.value === 0) {
    // 步骤1验证
    if (configData.value.userSelection === 'existing' && !configData.value.userId) {
      ElMessage.warning('请选择用户')
      return
    }
    if (configData.value.userSelection === 'new') {
      // 验证新建用户表单
      // 这里简化处理，实际项目中需要使用表单验证
    }
  } else if (activeStep.value === 1) {
    // 步骤2验证
    if (configData.value.roleSelection === 'existing' && !configData.value.roleId) {
      ElMessage.warning('请选择角色')
      return
    }
    if (configData.value.roleSelection === 'new') {
      // 验证新建角色表单
      // 这里简化处理，实际项目中需要使用表单验证
    }
  } else if (activeStep.value === 2) {
    // 步骤3验证
    if (!configData.value.businessIds || configData.value.businessIds.length === 0) {
      ElMessage.warning('请选择至少一个业务')
      return
    }
    
    // 检查每个业务是否至少选择了一个流程
    for (const businessId of configData.value.businessIds) {
      const processIds = configData.value.processIdsMap[businessId] || []
      if (processIds.length === 0) {
        ElMessage.warning(`请为"${getBusinessName(businessId)}"选择至少一个流程`)
        return
      }
    }
    
    // 检查每个业务下的每个流程是否至少选择了一个业务节点
    for (const businessId of configData.value.businessIds) {
      const processIds = configData.value.processIdsMap[businessId] || []
      for (const processId of processIds) {
        const key = businessId + '-' + processId
        const nodeIds = configData.value.nodeIdsMap[key] || []
        if (nodeIds.length === 0) {
          ElMessage.warning(`请为"${getBusinessName(businessId)}"的流程"${getProcessName(processId)}"选择至少一个业务节点`)
          return
        }
      }
    }
  }
  
  activeStep.value++
}

// 完成配置
const handleComplete = async () => {
  isSubmitting.value = true
  try {
    // 这里实现实际的权限配置逻辑
    // 1. 如果是新建用户，创建用户
    // 2. 如果是新建角色，创建角色
    // 3. 关联用户和角色
    // 4. 关联角色和流程环节
    
    setTimeout(() => {
      ElMessage.success('权限配置成功')
      emit('complete', {
        ...configData.value,
        newUserForm: { ...newUserForm.value },
        newRoleForm: { ...newRoleForm.value }
      })
      handleClose()
      isSubmitting.value = false
    }, 1000)
  } catch (error) {
    ElMessage.error('权限配置失败：' + error.message)
    isSubmitting.value = false
  }
}

// 关闭配置
const handleClose = () => {
  // 重置表单
  resetForm()
  emit('close')
}

// 重置表单
const resetForm = () => {
  activeStep.value = 0
  configData.value = {
    userSelection: 'existing',
    userId: '',
    roleSelection: 'existing',
    roleId: '',
    businessIds: [],
    processIdsMap: {},
    nodeIdsMap: {}
  }
  newUserForm.value = {
    id: '',
    name: '',
    username: '',
    departmentId: '',
    positionId: ''
  }
  newRoleForm.value = {
    id: '',
    name: '',
    description: ''
  }
}

// 辅助函数
const getUserName = (userId) => {
  const user = users.value.find(u => u.id === userId)
  return user ? user.name : ''
}

const getRoleName = (roleId) => {
  const role = roles.value.find(r => r.id === roleId)
  return role ? role.name : ''
}

const getBusinessName = (businessId) => {
  const business = businesses.value.find(b => b.id === businessId)
  return business ? business.name : ''
}

const getProcessName = (processId) => {
  const process = businessProcesses.value.find(p => p.id === processId)
  return process ? process.name : ''
}

const getNodeName = (nodeId) => {
  const node = processNodes.value.find(n => n.id === nodeId)
  return node ? node.name : ''
}

const getNodeTypeLabel = (type) => {
  const typeMap = {
    start: '开始环节',
    middle: '中间环节',
    end: '结束环节'
  }
  return typeMap[type] || type
}

// 用户选择变化
const handleUserChange = () => {
  // 用户选择变化时的处理逻辑
}

// 业务选择变化
const handleBusinessChange = () => {
  // 重置未选中业务的流程和节点映射
  const selectedBusinessIds = configData.value.businessIds || []
  
  // 清理未选中业务的映射
  Object.keys(configData.value.processIdsMap).forEach(businessId => {
    if (!selectedBusinessIds.includes(businessId)) {
      delete configData.value.processIdsMap[businessId]
      // 清理该业务下所有流程的节点映射
      const processIds = configData.value.processIdsMap[businessId] || []
      processIds.forEach(processId => {
        delete configData.value.nodeIdsMap[businessId + '-' + processId]
      })
    }
  })
  
  // 为新选中的业务初始化映射
  selectedBusinessIds.forEach(businessId => {
    if (!configData.value.processIdsMap[businessId]) {
      configData.value.processIdsMap[businessId] = []
    }
  })
}

// 流程选择变化
const handleProcessChange = (businessId) => {
  const selectedProcessIds = configData.value.processIdsMap[businessId] || []
  
  // 清理未选中流程的节点映射
  Object.keys(configData.value.nodeIdsMap).forEach(key => {
    if (key.startsWith(businessId + '-')) {
      const processId = key.replace(businessId + '-', '')
      if (!selectedProcessIds.includes(processId)) {
        delete configData.value.nodeIdsMap[key]
      }
    }
  })
  
  // 为新选中的流程初始化节点映射
  selectedProcessIds.forEach(processId => {
    const key = businessId + '-' + processId
    if (!configData.value.nodeIdsMap[key]) {
      configData.value.nodeIdsMap[key] = []
    }
  })
}
</script>

<style scoped>
.quick-permission-config {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.config-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.config-content {
  max-width: 800px;
  margin: 0 auto;
}

.steps {
  margin-bottom: 30px;
}

.step-content {
  margin-bottom: 30px;
}

.step-section {
  background-color: #fafafa;
  padding: 20px;
  border-radius: 8px;
}

.step-section h4 {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #303133;
}

.user-selection,
.role-selection {
  margin-bottom: 20px;
}

.user-selection .el-radio,
.role-selection .el-radio {
  margin-right: 20px;
}

.existing-user,
.new-user-form,
.existing-role,
.new-role-form,
.business-process-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.user-option,
.role-option,
.business-option,
.process-option,
.node-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info,
.role-info,
.business-info,
.process-info,
.node-info {
  font-size: 12px;
  color: #909399;
}

.tip {
  margin-top: 10px;
  font-size: 12px;
  color: #909399;
  font-style: italic;
}

.complete-section {
  text-align: center;
  padding: 40px 0;
}

.success-icon {
  font-size: 64px;
  color: #67c23a;
  margin-bottom: 20px;
}

.complete-section h4 {
  margin: 0 0 20px 0;
  font-size: 24px;
  color: #303133;
}

.complete-info {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-top: 20px;
}

.complete-info p {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #303133;
}

.node-tag {
  display: inline-block;
  background-color: #ecf5ff;
  color: #409eff;
  padding: 2px 8px;
  border-radius: 4px;
  margin-right: 8px;
  margin-bottom: 8px;
  font-size: 12px;
}

.business-node-group {
  margin-bottom: 15px;
}

.business-node-group strong {
  display: block;
  margin-bottom: 8px;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.process-node-group {
  margin-left: 20px;
  margin-bottom: 8px;
}

.process-label {
  display: inline-block;
  margin-right: 8px;
  color: #606266;
  font-size: 13px;
  font-weight: 500;
}

.business-group-container {
  margin-top: 20px;
}

.business-group {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.business-group-header {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid hsl(var(--primary));
}

.business-group-header h5 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--primary));
}

.process-group-container {
  margin-top: 15px;
}

.process-group {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #ffffff;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.process-group-header {
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.process-group-header h6 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

.no-process-tip {
  margin-top: 15px;
}

.step-actions {
  text-align: right;
  margin-top: 30px;
}

.step-actions .el-button {
  margin-left: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .quick-permission-config {
    padding: 10px;
  }
  
  .step-section {
    padding: 15px;
  }
  
  .existing-user,
  .new-user-form,
  .existing-role,
  .new-role-form,
  .business-process-section {
    padding: 15px;
  }
}
</style>