<template>
  <div class="certified-user">
    <div class="page-header">
      <h2>认证用户配置</h2>
      <p>管理平台认证用户的身份类型</p>
    </div>
    
    <div class="page-content">
      <!-- 操作栏 -->
      <div class="action-bar">
        <el-button type="primary" @click="handleAddIdentity">
          <el-icon><Plus /></el-icon>
          新增身份类型
        </el-button>
      </div>
      
      <!-- 身份类型列表 -->
      <el-table :data="identityTypes" border stripe v-loading="loading" style="width: 100%">
        <el-table-column label="身份类型" width="120" fixed="left">
          <template #default="scope">
            <el-tag type="success" size="small">认证用户</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="身份编码" width="180" fixed="left">
          <template #default="scope">
            <el-tag type="info" size="small">{{ scope.row.code || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="身份名称" min-width="150" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="参与业务" min-width="200">
          <template #default="scope">
            <el-tag
              v-for="business in getParticipatingBusinesses(scope.row)"
              :key="business.id"
              size="small"
              style="margin-right: 5px; margin-bottom: 5px"
            >
              {{ business.name }}
            </el-tag>
            <span v-if="getParticipatingBusinesses(scope.row).length === 0" class="empty-text">无</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button type="primary" size="small" @click="handleConfigurePermission(scope.row)">
                工作权限
              </el-button>
              <el-button type="primary" size="small" @click="handleEdit(scope.row)">
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(scope.row)">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="身份类型名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入身份类型名称" />
        </el-form-item>
        <el-form-item label="身份编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入身份编码" :disabled="!!formData.id" />
          <div class="form-tip">身份编码唯一，创建后不可修改</div>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入描述信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
    
    <!-- 工作权限配置对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      :title="permissionDialogTitle"
      width="1000px"
      fullscreen
    >
      <div class="permission-config-container">
        <!-- 第一列：业务选择 -->
        <div class="left-panel">
          <h3>1. 选择业务</h3>
          <div class="business-cards">
            <el-card
              v-for="business in cEndBusinesses"
              :key="business.id"
              :class="['business-card', { active: permissionConfigForm.selectedBusinessId === business.id }]"
              shadow="hover"
              @click="selectBusiness(business.id)"
            >
              <div class="business-info">
                <h5>{{ business.name }}</h5>
                <p class="business-desc">{{ business.description || '无描述' }}</p>
                <div class="business-status">
                  <el-tag :type="business.status === 'active' ? 'success' : 'danger'">
                    {{ business.status === 'active' ? '启用' : '禁用' }}
                  </el-tag>
                </div>
              </div>
            </el-card>
          </div>
          <div v-if="cEndBusinesses.length === 0" class="empty-state">
            <el-empty description="暂无C端业务数据" />
          </div>
        </div>
        
        <!-- 第二列：流程&环节选择 -->
        <div class="middle-panel">
          <h3>2. 选择流程和环节</h3>
          <div v-if="permissionConfigForm.selectedBusinessId" class="process-section">
            <h4>选择要参与的流程</h4>
            <div class="process-list">
              <el-card
                v-for="process in getBusinessProcesses(permissionConfigForm.selectedBusinessId)"
                :key="process.id"
                :class="['process-card', { active: permissionConfigForm.selectedProcesses[process.id] }]"
                shadow="hover"
              >
                <div class="process-header">
                  <h5>{{ process.name }}</h5>
                  <el-switch
                    v-model="permissionConfigForm.selectedProcesses[process.id]"
                    @change="handleProcessChange(process.id)"
                  >
                    <template #default="{ checked }">
                      {{ checked ? '参与' : '不参与' }}
                    </template>
                  </el-switch>
                </div>
                <p class="process-desc">{{ process.description || '无描述' }}</p>
                <div class="process-status">
                  <el-tag :type="process.status === 'active' ? 'success' : 'danger'">
                    {{ process.status === 'active' ? '启用' : '禁用' }}
                  </el-tag>
                </div>
                
                <!-- 环节选择 -->
                <div v-if="permissionConfigForm.selectedProcesses[process.id]" class="node-section">
                  <h6>选择要参与的环节</h6>
                  <div class="node-list">
                    <div
                      v-for="node in getProcessNodes(process.id)"
                      :key="node.id"
                      class="node-item"
                    >
                      <el-checkbox
                        v-model="permissionConfigForm.selectedNodes[node.id]"
                        @change="handleNodeChange"
                      >
                        <div class="node-info">
                          <span class="node-name">{{ node.name }}</span>
                          <el-tag
                            :type="node.type === 'start' ? 'success' : node.type === 'end' ? 'danger' : 'primary'"
                            size="small"
                          >
                            {{ node.type === 'start' ? '开始环节' : node.type === 'end' ? '结束环节' : '中间环节' }}
                          </el-tag>
                          <span class="node-order">#{{ node.order }}</span>
                        </div>
                        <div class="node-desc">{{ node.description || '无描述' }}</div>
                      </el-checkbox>
                    </div>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
          <div v-if="permissionConfigForm.selectedBusinessId && getBusinessProcesses(permissionConfigForm.selectedBusinessId).length === 0" class="empty-state">
            <el-empty description="暂无流程数据" />
          </div>
          <div v-if="!permissionConfigForm.selectedBusinessId" class="empty-state">
            <el-empty description="请先选择业务" />
          </div>
        </div>
        
        <!-- 第三列：权限预览 -->
        <div class="right-panel">
          <h3>3. 动态预览获得的权限</h3>
          <el-tabs v-model="previewActiveTab">
            <el-tab-pane label="页面权限" name="page">
              <div class="permission-preview-list">
                <el-tag
                  v-for="perm in previewPermissions.page"
                  :key="perm.id"
                  size="small"
                  class="permission-tag"
                >
                  {{ perm.name }}
                </el-tag>
                <span v-if="previewPermissions.page.length === 0" class="empty-text">无</span>
              </div>
            </el-tab-pane>
            <el-tab-pane label="按钮权限" name="button">
              <div class="permission-preview-list">
                <el-tag
                  v-for="perm in previewPermissions.button"
                  :key="perm.id"
                  size="small"
                  class="permission-tag"
                >
                  {{ perm.name }}
                </el-tag>
                <span v-if="previewPermissions.button.length === 0" class="empty-text">无</span>
              </div>
            </el-tab-pane>
            <el-tab-pane label="API权限" name="api">
              <div class="permission-preview-list">
                <el-tag
                  v-for="perm in previewPermissions.api"
                  :key="perm.id"
                  size="small"
                  class="permission-tag"
                >
                  {{ perm.name }}
                </el-tag>
                <span v-if="previewPermissions.api.length === 0" class="empty-text">无</span>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSavePermission">保存配置</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  businesses as mockBusinesses,
  businessProcesses as mockBusinessProcesses,
  processNodes as mockProcessNodes,
  permissions as mockPermissions
} from '../mock/data.js'

// 响应式数据
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增身份类型')
const formRef = ref(null)

// 业务数据
const allBusinesses = ref(mockBusinesses)
const businessProcesses = ref(mockBusinessProcesses)
const processNodes = ref(mockProcessNodes)
const permissions = ref(mockPermissions)

// C端业务数据（筛选业务ID以'business-c-'开头的业务）
const cEndBusinesses = computed(() => {
  return allBusinesses.value.filter(b => b.id.startsWith('business-c-'))
})

// 表单数据
const formData = ref({
  id: null,
  name: '',
  code: '',
  description: ''
})

// 工作权限配置
const permissionDialogVisible = ref(false)
const permissionDialogTitle = ref('配置工作权限')
const selectedIdentity = ref(null)
const previewActiveTab = ref('page')

// 权限配置表单
const permissionConfigForm = ref({
  selectedBusinessId: '',
  selectedProcesses: {},
  selectedNodes: {}
})

// 权限预览数据
const previewPermissions = ref({
  page: [],
  button: [],
  api: []
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入身份类型名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入身份编码', trigger: 'blur' },
    { pattern: /^[A-Z0-9_]+$/, message: '身份编码只能包含大写字母、数字和下划线', trigger: 'blur' }
  ]
}

// 身份类型数据
const identityTypes = ref([
  {
    id: 'cert-1',
    name: '推拿师',
    code: 'MASSAGE_THERAPIST',
    description: '具备推拿技能的专业人员',
    processRoles: [{ processId: 'process-c-1', nodeId: 'node-c-1-1' }], // 参与的业务流程和环节
    createTime: new Date('2024-01-01 10:00:00'),
    updateTime: new Date('2024-01-01 10:00:00')
  },
  {
    id: 'cert-2',
    name: '理疗师',
    code: 'PHYSIOTHERAPIST',
    description: '具备理疗技能的专业人员',
    processRoles: [{ processId: 'process-c-2', nodeId: 'node-c-2-1' }],
    createTime: new Date('2024-01-01 10:00:00'),
    updateTime: new Date('2024-01-01 10:00:00')
  },
  {
    id: 'cert-3',
    name: '康复师',
    code: 'REHABILITATION_THERAPIST',
    description: '具备康复技能的专业人员',
    processRoles: [],
    createTime: new Date('2024-01-01 10:00:00'),
    updateTime: new Date('2024-01-01 10:00:00')
  },
  {
    id: 'cert-4',
    name: '经络讲师',
    code: 'MERIDIAN_LECTURER',
    description: '具备经络知识教学能力的专业人员',
    processRoles: [],
    createTime: new Date('2024-01-01 10:00:00'),
    updateTime: new Date('2024-01-01 10:00:00')
  }
])

// 获取参与的业务
const getParticipatingBusinesses = (identity) => {
  const businessIds = new Set()
  
  // 从processRoles中提取关联的业务
  identity.processRoles?.forEach(pr => {
    const process = businessProcesses.value.find(p => p.id === pr.processId)
    if (process) {
      businessIds.add(process.businessId)
    }
  })
  
  // 返回业务对象数组（只返回C端业务）
  return cEndBusinesses.value.filter(b => businessIds.has(b.id))
}

// 根据业务ID获取流程列表
const getBusinessProcesses = (businessId) => {
  if (!businessId) {
    return []
  }
  return businessProcesses.value.filter(process => 
    process.businessId === businessId
  )
}

// 获取流程环节
const getProcessNodes = (processId) => {
  return processNodes.value.filter(node => node.processId === processId)
    .sort((a, b) => a.order - b.order)
}

// 格式化日期时间
const formatDateTime = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 新增身份类型
const handleAddIdentity = () => {
  dialogTitle.value = '新增身份类型'
  formData.value = {
    id: null,
    name: '',
    code: '',
    description: ''
  }
  dialogVisible.value = true
}

// 编辑身份类型
const handleEdit = (row) => {
  dialogTitle.value = '编辑身份类型'
  formData.value = JSON.parse(JSON.stringify(row))
  dialogVisible.value = true
}

// 删除身份类型
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该身份类型吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = identityTypes.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      identityTypes.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  })
}

// 保存身份类型
const handleSave = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      // 检查编码是否重复
      const exists = identityTypes.value.find(item => 
        item.code === formData.value.code && item.id !== formData.value.id
      )
      if (exists) {
        ElMessage.error('身份编码已存在')
        return
      }
      
      if (formData.value.id) {
        // 编辑
        const index = identityTypes.value.findIndex(item => item.id === formData.value.id)
        if (index > -1) {
          identityTypes.value[index] = {
            ...identityTypes.value[index],
            ...formData.value,
            updateTime: new Date()
          }
          ElMessage.success('更新成功')
        }
      } else {
        // 新增
        identityTypes.value.push({
          ...formData.value,
          id: `cert-${Date.now()}`,
          processRoles: [],
          createTime: new Date(),
          updateTime: new Date()
        })
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
    }
  })
}

// 配置工作权限
const handleConfigurePermission = (row) => {
  selectedIdentity.value = JSON.parse(JSON.stringify(row))
  
  // 初始化权限配置表单
  initializePermissionConfigForm()
  
  // 更新预览权限
  updatePreviewPermissions()
  
  permissionDialogTitle.value = `配置 ${row.name} 的工作权限`
  permissionDialogVisible.value = true
}

// 初始化权限配置表单
const initializePermissionConfigForm = () => {
  permissionConfigForm.value = {
    selectedBusinessId: '',
    selectedProcesses: {},
    selectedNodes: {}
  }
  
  // 从processRoles中提取关联的业务、流程和环节
  if (selectedIdentity.value.processRoles?.length > 0) {
    const firstProcessRole = selectedIdentity.value.processRoles[0]
    const firstProcess = businessProcesses.value.find(p => p.id === firstProcessRole.processId)
    if (firstProcess) {
      permissionConfigForm.value.selectedBusinessId = firstProcess.businessId
    }
    
    // 设置已关联的流程和环节
    selectedIdentity.value.processRoles.forEach(pr => {
      permissionConfigForm.value.selectedProcesses[pr.processId] = true
      permissionConfigForm.value.selectedNodes[pr.nodeId] = true
    })
  }
  
  updatePreviewPermissions()
}

// 选择业务
const selectBusiness = (businessId) => {
  if (permissionConfigForm.value.selectedBusinessId === businessId) {
    permissionConfigForm.value.selectedBusinessId = ''
  } else {
    permissionConfigForm.value.selectedBusinessId = businessId
  }
  
  // 重置流程和环节选择
  permissionConfigForm.value.selectedProcesses = {}
  permissionConfigForm.value.selectedNodes = {}
  
  updatePreviewPermissions()
}

// 处理流程选择变化
const handleProcessChange = (processId) => {
  if (!permissionConfigForm.value.selectedProcesses[processId]) {
    const nodes = getProcessNodes(processId)
    nodes.forEach(node => {
      delete permissionConfigForm.value.selectedNodes[node.id]
    })
  }
  updatePreviewPermissions()
}

// 处理环节选择变化
const handleNodeChange = () => {
  updatePreviewPermissions()
}

// 更新预览权限
const updatePreviewPermissions = () => {
  const selectedNodeIds = Object.keys(permissionConfigForm.value.selectedNodes)
    .filter(nodeId => permissionConfigForm.value.selectedNodes[nodeId])
  
  const allPermissionIds = new Set()
  
  selectedNodeIds.forEach(nodeId => {
    const node = processNodes.value.find(n => n.id === nodeId)
    if (node) {
      ;[...(node.permissions || []), ...(node.buttonPermissions || []), ...(node.apiPermissions || [])]
        .forEach(permId => allPermissionIds.add(permId))
    }
  })
  
  const pagePermissions = []
  const buttonPermissions = []
  const apiPermissions = []
  
  Array.from(allPermissionIds).forEach(permId => {
    const perm = permissions.value.find(p => p.id === permId)
    if (perm) {
      if (perm.type === 'PAGE') {
        pagePermissions.push(perm)
      } else if (perm.type === 'FUNCTION') {
        buttonPermissions.push(perm)
      } else if (perm.type === 'API') {
        apiPermissions.push(perm)
      }
    }
  })
  
  previewPermissions.value = {
    page: pagePermissions,
    button: buttonPermissions,
    api: apiPermissions
  }
}

// 保存工作权限配置
const handleSavePermission = () => {
  if (!selectedIdentity.value) return
  
  // 构建processRoles
  const processRoles = []
  Object.keys(permissionConfigForm.value.selectedNodes).forEach(nodeId => {
    if (permissionConfigForm.value.selectedNodes[nodeId]) {
      const node = processNodes.value.find(n => n.id === nodeId)
      if (node) {
        processRoles.push({
          processId: node.processId,
          nodeId: nodeId
        })
      }
    }
  })
  
  const index = identityTypes.value.findIndex(item => item.id === selectedIdentity.value.id)
  if (index > -1) {
    identityTypes.value[index].processRoles = processRoles
    ElMessage.success('工作权限配置成功')
    permissionDialogVisible.value = false
  }
}

// 初始化
onMounted(() => {
  // 可以在这里加载数据
})
</script>

<style scoped>
.certified-user {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.page-header p {
  margin: 5px 0 0 0;
  color: #666;
  font-size: 14px;
}

.page-content {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-bar {
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.empty-text {
  color: #909399;
  font-size: 12px;
}

/* 权限配置对话框样式 */
.permission-config-container {
  display: flex;
  height: calc(100vh - 200px);
}

.left-panel {
  flex: 1;
  padding: 20px;
  border-right: 1px solid #ebeef5;
  overflow-y: auto;
}

.middle-panel {
  flex: 1.8;
  padding: 20px;
  border-right: 1px solid #ebeef5;
  overflow-y: auto;
}

.right-panel {
  flex: 1.4;
  padding: 20px;
  overflow-y: auto;
}

.permission-config-container h3 {
  margin-top: 0;
  margin-bottom: 25px;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.permission-config-container h4 {
  margin-bottom: 15px;
  color: #303133;
  font-size: 16px;
  font-weight: 500;
}

.permission-config-container h6 {
  margin-bottom: 12px;
  color: #303133;
  font-size: 14px;
  font-weight: 500;
}

.business-cards {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.business-card {
  flex: 1;
  min-width: 250px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.business-card.active {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.business-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.business-info h5 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #303133;
}

.business-desc {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.business-status {
  margin-top: 10px;
}

.process-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.process-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.process-card.active {
  border-color: #67c23a;
  background-color: #f0f9eb;
}

.process-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.process-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.process-header h5 {
  margin: 0;
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.process-desc {
  margin: 10px 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.process-status {
  margin-bottom: 15px;
}

.node-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed #ebeef5;
}

.node-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.node-item {
  padding: 15px;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.node-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.node-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.node-name {
  font-weight: 500;
  color: #303133;
}

.node-order {
  color: #909399;
  font-size: 12px;
}

.node-desc {
  font-size: 12px;
  color: #606266;
  margin-top: 5px;
}

.permission-preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.permission-tag {
  margin-bottom: 5px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}
</style>

