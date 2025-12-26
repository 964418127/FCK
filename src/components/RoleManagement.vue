<template>
  <div class="role-management">
    <div class="role-header">
      <el-button type="primary" @click="handleAddRole">
        <el-icon-plus /> 新增角色
      </el-button>
    </div>
    
    <div class="role-content">
      <el-table :data="roles" border stripe style="width: 100%">
        <el-table-column prop="name" label="角色名称" min-width="150" />
        <el-table-column prop="description" label="角色描述" min-width="300" />
        <el-table-column label="权限数量" min-width="100">
          <template #default="scope">
            {{ scope.row.permissions?.length || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small" 
              @click="handleConfigurePermission(scope.row)"
            >
              关联权限
            </el-button>
            <el-button 
              type="warning" 
              size="small" 
              @click="handleAssociateBusinessProcess(scope.row)"
            >
              关联业务流程
            </el-button>
            <el-dropdown trigger="click">
              <span class="more-link">
                更多
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleEditRole(scope.row)">编辑</el-dropdown-item>
                  <el-dropdown-item @click="handleDeleteRole(scope.row)">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 角色表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input 
            v-model="formData.description" 
            type="textarea" 
            rows="3" 
            placeholder="请输入角色描述"
          />
        </el-form-item>
        <el-form-item label="继承角色">
          <el-select 
            v-model="formData.inheritRoleId" 
            placeholder="请选择继承的角色" 
            style="width: 100%"
          >
            <el-option 
              v-for="role in roles" 
              :key="role.id" 
              :label="role.name" 
              :value="role.id"
              :disabled="formData.id && role.id === formData.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 权限配置对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="角色权限配置"
      width="800px"
      fullscreen
    >
      <PermissionConfiguration 
        v-if="selectedRole" 
        :role="selectedRole" 
        :permissions="permissions" 
        :dataRules="dataRules"
        @update:role="updateRolePermissions"
        @close="permissionDialogVisible = false"
      />
    </el-dialog>
    
    <!-- 业务流程关联对话框 -->
    <el-dialog
      v-model="businessProcessDialogVisible"
      title="角色-业务流程环节关联"
      width="800px"
    >
      <div class="business-process-form">
        <div class="section-header">
          <h4>关联业务流程环节</h4>
          <span class="tip">选择角色需要参与的业务、流程和环节，角色将获得所选环节配置的所有权限</span>
        </div>
        
        <div class="form-content">
          <el-form label-width="120px">
            <!-- 已关联的业务流程环节列表 -->
            <div v-if="selectedRole && selectedRole.processRoles && selectedRole.processRoles.length > 0" class="associated-list">
              <h5>已关联的业务流程环节：</h5>
              <div class="associated-tags">
                <el-tag 
                  v-for="item in selectedRole.processRoles" 
                  :key="`${item.processId}-${item.nodeId}`" 
                  closable 
                  @close="handleRemoveAssociatedNode(item)"
                >
                  {{ getBusinessNameByProcessId(item.processId) }} - {{ getProcessName(item.processId) }} - {{ getNodeName(item.nodeId) }}
                </el-tag>
              </div>
            </div>
            
            <el-divider />
            
            <!-- 新关联表单 -->
            <el-form-item label="选择业务">
              <el-select 
                v-model="businessProcessFormData.businessId" 
                placeholder="请选择业务" 
                style="width: 100%"
                @change="handleBusinessChange"
                filterable
              >
                <el-option 
                  v-for="business in businesses" 
                  :key="business.id" 
                  :label="business.name" 
                  :value="business.id"
                >
                  <div class="option-content">
                    <span>{{ business.name }}</span>
                    <span class="option-desc">({{ business.description }})</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="选择流程">
              <el-select 
                v-model="businessProcessFormData.processId" 
                placeholder="请选择流程" 
                style="width: 100%"
                @change="handleProcessChange"
                filterable
                :disabled="!businessProcessFormData.businessId"
              >
                <el-option 
                  v-for="process in filteredProcesses" 
                  :key="process.id" 
                  :label="process.name" 
                  :value="process.id"
                >
                  <div class="option-content">
                    <span>{{ process.name }}</span>
                    <span class="option-desc">({{ process.description }})</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="选择环节">
              <el-select 
                v-model="businessProcessFormData.nodeIds" 
                placeholder="请选择流程环节" 
                style="width: 100%"
                multiple
                filterable
                :disabled="!businessProcessFormData.processId"
              >
                <el-option 
                  v-for="node in filteredNodes" 
                  :key="node.id" 
                  :label="node.name" 
                  :value="node.id"
                >
                  <div class="option-content">
                    <span>{{ node.name }}</span>
                    <span class="option-desc">({{ node.type === 'start' ? '开始环节' : node.type === 'end' ? '结束环节' : '中间环节' }})</span>
                  </div>
                </el-option>
              </el-select>
              <div class="tip">可选择多个流程环节，角色将获得所选环节配置的所有权限</div>
            </el-form-item>
          </el-form>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="businessProcessDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveBusinessProcess">保存关联</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PermissionConfiguration from './PermissionConfiguration.vue'
import { 
  roles as mockRoles, 
  permissions as mockPermissions, 
  dataRules as mockDataRules, 
  businesses as mockBusinesses, 
  businessProcesses as mockBusinessProcesses, 
  processNodes as mockProcessNodes 
} from '../mock/data.js'

// 接收父组件传入的props
const props = defineProps({
  roles: {
    type: Array,
    default: () => []
  }
})

// 定义事件
const emit = defineEmits(['update:roles'])

// 响应式数据
const dialogVisible = ref(false)
const permissionDialogVisible = ref(false)
const businessProcessDialogVisible = ref(false)
const dialogTitle = ref('新增角色')
const formRef = ref(null)
const isEdit = ref(false)
const selectedRole = ref(null)
const formData = ref({
  id: '',
  name: '',
  description: '',
  permissions: [],
  dataRules: [],
  inheritRoleId: null,
  processRoles: []
})

// 业务流程关联数据
const businessProcessFormData = ref({
  roleId: '',
  businessId: '',
  processId: '',
  nodeIds: []
})

// 可用的业务流程和环节
const businesses = ref([])
const businessProcesses = ref([])
const processNodes = ref([])
const filteredProcesses = ref([])
const filteredNodes = ref([])

// 模拟数据
const roles = ref(mockRoles)
const permissions = ref(mockPermissions)
const dataRules = ref(mockDataRules)

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 1, max: 50, message: '角色名称长度在 1 到 50 个字符', trigger: 'blur' }
  ]
}

// 生命周期钩子
onMounted(() => {
  if (props.roles && props.roles.length > 0) {
    roles.value = props.roles
  }
  
  // 初始化业务、流程和环节数据
  businesses.value = mockBusinesses
  businessProcesses.value = mockBusinessProcesses
  processNodes.value = mockProcessNodes
})

// 打开新增角色对话框
const handleAddRole = () => {
  isEdit.value = false
  dialogTitle.value = '新增角色'
  formData.value = {
    id: `role-${Date.now()}`,
    name: '',
    description: '',
    permissions: [],
    dataRules: [],
    inheritRoleId: null
  }
  dialogVisible.value = true
}

// 打开编辑角色对话框
const handleEditRole = (data) => {
  isEdit.value = true
  dialogTitle.value = '编辑角色'
  formData.value = JSON.parse(JSON.stringify(data))
  dialogVisible.value = true
}

// 删除角色
const handleDeleteRole = (data) => {
  ElMessageBox.confirm('确定要删除该角色吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 实现删除逻辑
    const newRoles = roles.value.filter(role => role.id !== data.id)
    roles.value = newRoles
    emit('update:roles', newRoles)
    ElMessage.success('角色删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 打开权限配置对话框
const handleConfigurePermission = (role) => {
  selectedRole.value = JSON.parse(JSON.stringify(role))
  permissionDialogVisible.value = true
}

// 更新角色权限
const updateRolePermissions = (updatedRole) => {
  // 更新角色数据
  const newRoles = roles.value.map(role => {
    if (role.id === updatedRole.id) {
      return updatedRole
    }
    return role
  })
  roles.value = newRoles
  emit('update:roles', newRoles)
  ElMessage.success('角色权限更新成功')
}

// 打开业务流程关联对话框
const handleAssociateBusinessProcess = (role) => {
  selectedRole.value = JSON.parse(JSON.stringify(role))
  businessProcessFormData.value = {
    roleId: role.id,
    businessId: '',
    processId: '',
    nodeIds: []
  }
  // 过滤已关联的流程环节
  if (role.processRoles && role.processRoles.length > 0) {
    // 这里可以添加已关联环节的显示逻辑
  }
  businessProcessDialogVisible.value = true
}

// 处理业务选择变化
const handleBusinessChange = () => {
  // 根据选择的业务过滤流程
  filteredProcesses.value = businessProcesses.value.filter(process => 
    process.businessId === businessProcessFormData.value.businessId
  )
  // 重置流程和环节选择
  businessProcessFormData.value.processId = ''
  businessProcessFormData.value.nodeIds = []
  filteredNodes.value = []
}

// 处理流程选择变化
const handleProcessChange = () => {
  // 根据选择的流程过滤环节
  filteredNodes.value = processNodes.value.filter(node => 
    node.processId === businessProcessFormData.value.processId
  )
  // 重置环节选择
  businessProcessFormData.value.nodeIds = []
}

// 通过流程ID获取业务ID
const getBusinessIdByProcessId = (processId) => {
  const process = businessProcesses.value.find(p => p.id === processId)
  return process ? process.businessId : ''
}

// 通过流程ID获取业务名称
const getBusinessNameByProcessId = (processId) => {
  const businessId = getBusinessIdByProcessId(processId)
  const business = businesses.value.find(b => b.id === businessId)
  return business ? business.name : ''
}

// 获取流程名称
const getProcessName = (processId) => {
  const process = businessProcesses.value.find(p => p.id === processId)
  return process ? process.name : processId
}

// 获取节点名称
const getNodeName = (nodeId) => {
  const node = processNodes.value.find(n => n.id === nodeId)
  return node ? node.name : nodeId
}

// 移除已关联的节点
const handleRemoveAssociatedNode = (item) => {
  if (!selectedRole.value) return
  
  // 找到要移除的流程角色配置
  const removedProcessRole = selectedRole.value.processRoles.find(pr => 
    pr.processId === item.processId && pr.nodeId === item.nodeId
  )
  
  if (!removedProcessRole) return
  
  // 从角色的流程角色配置中移除
  const updatedProcessRoles = selectedRole.value.processRoles.filter(pr => 
    !(pr.processId === item.processId && pr.nodeId === item.nodeId)
  )
  
  // 重新计算基础权限：保留其他流程环节和直接分配的权限
  const remainingPermissionIds = new Set()
  const remainingDataRuleIds = new Set()
  
  // 添加其他流程环节的权限
  updatedProcessRoles.forEach(pr => {
    pr.permissionIds.forEach(permId => remainingPermissionIds.add(permId))
    pr.dataRuleIds.forEach(ruleId => remainingDataRuleIds.add(ruleId))
  })
  
  // 更新角色数据
  const updatedRole = {
    ...selectedRole.value,
    processRoles: updatedProcessRoles,
    permissions: Array.from(remainingPermissionIds),
    dataRules: Array.from(remainingDataRuleIds)
  }
  
  // 更新角色数据
  const newRoles = roles.value.map(role => {
    if (role.id === updatedRole.id) {
      return updatedRole
    }
    return role
  })
  
  roles.value = newRoles
  emit('update:roles', newRoles)
  ElMessage.success('已移除关联的流程环节，相关权限已更新')
}

// 保存业务流程关联
const handleSaveBusinessProcess = () => {
  if (!businessProcessFormData.value.businessId) {
    ElMessage.warning('请选择业务')
    return
  }
  if (!businessProcessFormData.value.processId) {
    ElMessage.warning('请选择流程')
    return
  }
  if (!businessProcessFormData.value.nodeIds || businessProcessFormData.value.nodeIds.length === 0) {
    ElMessage.warning('请选择至少一个流程环节')
    return
  }
  
  // 构建流程角色配置
  const processRoles = businessProcessFormData.value.nodeIds.map(nodeId => {
    const node = processNodes.value.find(n => n.id === nodeId)
    const process = businessProcesses.value.find(p => p.id === businessProcessFormData.value.processId)
    return {
      processId: process.id,
      nodeId: node.id,
      permissionIds: [...(node.permissions || []), ...(node.buttonPermissions || []), ...(node.apiPermissions || [])],
      dataRuleIds: node.dataRules || [],
      visibleFieldIds: node.visibleFields || [],
      validityType: node.validityType || 'nodeDuration',
      validityDuration: 0,
      description: `${process.name}-${node.name}环节权限`
    }
  })
  
  // 合并权限：将所有流程环节的权限合并到角色的基础权限中
  const allPermissionIds = new Set([...(selectedRole.value.permissions || [])])
  const allDataRuleIds = new Set([...(selectedRole.value.dataRules || [])])
  
  // 添加流程环节的权限
  processRoles.forEach(pr => {
    pr.permissionIds.forEach(permId => allPermissionIds.add(permId))
    pr.dataRuleIds.forEach(ruleId => allDataRuleIds.add(ruleId))
  })
  
  // 更新角色的流程角色配置和基础权限
  const updatedRole = {
    ...selectedRole.value,
    processRoles: [...(selectedRole.value.processRoles || []), ...processRoles],
    permissions: Array.from(allPermissionIds),
    dataRules: Array.from(allDataRuleIds)
  }
  
  // 更新角色数据
  const newRoles = roles.value.map(role => {
    if (role.id === updatedRole.id) {
      return updatedRole
    }
    return role
  })
  
  roles.value = newRoles
  emit('update:roles', newRoles)
  businessProcessDialogVisible.value = false
  ElMessage.success('业务流程环节关联成功，角色已获得所选环节的所有权限')
}

// 提交表单
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      let newRoles
      if (isEdit.value) {
        // 编辑角色
        newRoles = roles.value.map(role => {
          if (role.id === formData.value.id) {
            return formData.value
          }
          return role
        })
      } else {
        // 新增角色
        newRoles = [...roles.value, formData.value]
      }
      roles.value = newRoles
      emit('update:roles', newRoles)
      dialogVisible.value = false
      ElMessage.success(isEdit.value ? '角色更新成功' : '角色新增成功')
    } else {
      return false
    }
  })
}
</script>

<style scoped>
.role-management {
  width: 100%;
}


.role-header {
  margin-bottom: 20px;
}

.role-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 业务流程表单样式 */
.business-process-form {
  padding: 10px 0;
}

.section-header {
  margin-bottom: 20px;
}

.section-header h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #303133;
}

.section-header .tip {
  font-size: 12px;
  color: #909399;
  font-style: italic;
}

.form-content {
  background-color: #fafafa;
  padding: 20px;
  border-radius: 8px;
}

.option-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.option-desc {
  font-size: 12px;
  color: #909399;
}

.tip {
  margin-top: 10px;
  font-size: 12px;
  color: #909399;
  font-style: italic;
}

/* 已关联列表样式 */
.associated-list {
  margin-bottom: 20px;
}

.associated-list h5 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #303133;
}

.associated-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.associated-tags .el-tag {
  margin-bottom: 10px;
}

/* 表单内容样式 */
.form-content .el-form {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
</style>