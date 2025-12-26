<template>
  <div class="permission-configuration">
    <div class="permission-header">
      <h3>{{ role.name }} - 权限配置</h3>
      <div class="header-actions">
        <el-button type="primary" @click="handleSave">
          <el-icon-check /> 保存配置
        </el-button>
        <el-button @click="handleClose">
          <el-icon-close /> 关闭
        </el-button>
      </div>
    </div>
    
    <div class="permission-content">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 页面权限 -->
        <el-tab-pane label="页面权限" name="page">
          <div class="permission-tree-container">
            <el-tree
              :data="pagePermissionsTree"
              :props="treeProps"
              :expand-on-click-node="false"
              node-key="id"
              show-checkbox
              :default-checked-keys="selectedPermissionIds"
              ref="pagePermissionTree"
              @check="handlePermissionCheck"
            >
              <template #default="{ node, data }">
                <div class="tree-node">
                  <span>{{ node.label }}</span>
                  <span class="node-description">{{ data.description || '无描述' }}</span>
                </div>
              </template>
            </el-tree>
          </div>
        </el-tab-pane>
        
        <!-- 按钮权限 -->
        <el-tab-pane label="按钮权限" name="button">
          <div class="permission-tree-container">
            <el-tree
              :data="buttonPermissionsTree"
              :props="treeProps"
              :expand-on-click-node="false"
              node-key="id"
              show-checkbox
              :default-checked-keys="selectedPermissionIds"
              ref="buttonPermissionTree"
              @check="handlePermissionCheck"
            >
              <template #default="{ node, data }">
                <div class="tree-node">
                  <span>{{ node.label }}</span>
                  <span class="node-description">{{ data.code }} - {{ data.description || '无描述' }}</span>
                </div>
              </template>
            </el-tree>
          </div>
        </el-tab-pane>
        
        <!-- API权限 -->
        <el-tab-pane label="API权限" name="api">
          <div class="permission-tree-container">
            <el-tree
              :data="apiPermissionsTree"
              :props="treeProps"
              :expand-on-click-node="false"
              node-key="id"
              show-checkbox
              :default-checked-keys="selectedPermissionIds"
              ref="apiPermissionTree"
              @check="handlePermissionCheck"
            >
              <template #default="{ node, data }">
                <div class="tree-node">
                  <span>{{ node.label }}</span>
                  <span class="node-description">{{ data.apiUrl }} - {{ data.description || '无描述' }}</span>
                </div>
              </template>
            </el-tree>
          </div>
        </el-tab-pane>
        
        <!-- 数据规则 -->
        <el-tab-pane label="数据规则" name="data-rule">
          <div class="data-rule-container">
            <el-table :data="dataRules" border stripe style="width: 100%">
              <el-table-column type="selection" width="55" />
              <el-table-column prop="name" label="规则名称" min-width="150" />
              <el-table-column prop="type" label="规则类型" min-width="100" />
              <el-table-column prop="scope" label="数据范围" min-width="100">
                <template #default="scope">
                  <el-tag size="small" :type="getScopeTagType(scope.row.scope)">
                    {{ getScopeLabel(scope.row.scope) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="规则描述" min-width="300" />
            </el-table>
          </div>
        </el-tab-pane>
        
        <!-- 业务流程环节权限 -->
        <el-tab-pane label="业务流程环节" name="business-process">
          <div class="business-process-container">
            <!-- 业务选择 -->
            <el-select 
              v-model="selectedBusinessId" 
              placeholder="请选择业务" 
              style="width: 100%; margin-bottom: 20px"
              @change="handleBusinessChange"
              filterable
            >
              <el-option 
                v-for="business in businesses" 
                :key="business.id" 
                :label="business.name" 
                :value="business.id"
              >
                <div class="business-option">
                  <span>{{ business.name }}</span>
                  <span class="business-desc">({{ business.description }})</span>
                </div>
              </el-option>
            </el-select>
            
            <!-- 流程列表 -->
            <div class="process-list">
              <el-card 
                v-for="process in filteredProcesses" 
                :key="process.id" 
                shadow="hover" 
                class="process-card"
              >
                <template #header>
                  <div class="process-header">
                    <h4>{{ process.name }}</h4>
                    <span class="process-status" :class="process.status === 'active' ? 'active' : 'inactive'">
                      {{ process.status === 'active' ? '启用' : '禁用' }}
                    </span>
                  </div>
                </template>
                <div class="process-description">{{ process.description }}</div>
                
                <!-- 环节列表 -->
                <div class="node-list">
                  <h5>流程环节：</h5>
                  <el-table :data="getNodeList(process.id)" border style="width: 100%; margin-top: 10px">
                    <el-table-column prop="name" label="环节名称" min-width="150" />
                    <el-table-column prop="type" label="环节类型" width="120">
                      <template #default="scope">
                        <el-tag size="small" :type="getNodeTypeTagType(scope.row.type)">
                          {{ getNodeTypeLabel(scope.row.type) }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="order" label="顺序" width="80" />
                    <el-table-column prop="validityType" label="权限有效期" width="150">
                      <template #default="scope">
                        <el-tag size="small">
                          {{ getValidityTypeLabel(scope.row.validityType) }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="150" fixed="right">
                      <template #default="scope">
                        <el-button 
                          size="small" 
                          type="primary" 
                          @click="handleAssociateNode(process.id, scope.row.id)"
                          :disabled="isNodeAssociated(process.id, scope.row.id)"
                        >
                          {{ isNodeAssociated(process.id, scope.row.id) ? '已关联' : '关联' }}
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </el-card>
            </div>
            
            <!-- 已关联的流程环节 -->
            <div v-if="role.processRoles && role.processRoles.length > 0" class="associated-nodes">
              <h4>已关联的流程环节</h4>
              <el-table :data="role.processRoles" border stripe style="width: 100%; margin-top: 20px">
                <el-table-column prop="processId" label="流程ID" width="150" />
                <el-table-column prop="nodeId" label="环节ID" width="150" />
                <el-table-column label="流程名称" width="200">
                  <template #default="scope">
                    {{ getProcessName(scope.row.processId) }}
                  </template>
                </el-table-column>
                <el-table-column label="环节名称" width="200">
                  <template #default="scope">
                    {{ getNodeName(scope.row.nodeId) }}
                  </template>
                </el-table-column>
                <el-table-column prop="validityType" label="权限有效期" width="150">
                  <template #default="scope">
                    <el-tag size="small">
                      {{ getValidityTypeLabel(scope.row.validityType) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="description" label="描述" min-width="300" />
                <el-table-column label="操作" width="100" fixed="right">
                  <template #default="scope">
                    <el-button 
                      size="small" 
                      type="danger" 
                      @click="handleDisassociateNode(scope.row)"
                    >
                      解除关联
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 接收父组件传入的props
const props = defineProps({
  role: {
    type: Object,
    required: true
  },
  permissions: {
    type: Array,
    required: true
  },
  dataRules: {
    type: Array,
    required: true
  }
})

// 定义事件
const emit = defineEmits(['update:role', 'close'])

// 响应式数据
const activeTab = ref('page')
const pagePermissionTree = ref(null)
const buttonPermissionTree = ref(null)
const apiPermissionTree = ref(null)
const selectedPermissionIds = ref([])
const selectedDataRuleIds = ref([])
const selectedBusinessId = ref('')
const filteredProcesses = ref([])

// 树形配置
const treeProps = {
  children: 'children',
  label: 'name'
}

// 模拟数据 - 业务、流程、环节
import { 
  businesses as mockBusinesses, 
  businessProcesses as mockBusinessProcesses, 
  processNodes as mockProcessNodes 
} from '../mock/data'

const businesses = ref(mockBusinesses)
const businessProcesses = ref(mockBusinessProcesses)
const processNodes = ref(mockProcessNodes)

// 监听角色变化，初始化选中的权限ID
watch(() => props.role, (newRole) => {
  if (newRole) {
    selectedPermissionIds.value = newRole.permissions || []
    selectedDataRuleIds.value = newRole.dataRules || []
  }
}, { immediate: true, deep: true })

// 将权限列表转换为树形结构
const buildPermissionTree = (permissions, type) => {
  // 过滤指定类型的权限
  const filteredPermissions = permissions.filter(perm => perm.type === type)
  
  // 构建树形结构
  const buildTree = (parentId = null) => {
    return filteredPermissions
      .filter(perm => perm.parentId === parentId)
      .map(perm => {
        const children = buildTree(perm.id)
        return {
          ...perm,
          children: children.length > 0 ? children : []
        }
      })
  }
  
  return buildTree()
}

// 页面权限树形数据
const pagePermissionsTree = computed(() => {
  return buildPermissionTree(props.permissions, 'page')
})

// 按钮权限树形数据（按所属页面分组）
const buttonPermissionsTree = computed(() => {
  // 先获取所有页面权限
  const pages = props.permissions.filter(perm => perm.type === 'page')
  // 获取所有按钮权限
  const buttons = props.permissions.filter(perm => perm.type === 'button')
  
  // 构建树形结构，页面作为父节点，按钮作为子节点
  return pages.map(page => {
    const pageButtons = buttons.filter(btn => btn.parentId === page.id)
    return {
      ...page,
      children: pageButtons.map(btn => ({
        ...btn,
        children: []
      }))
    }
  })
})

// API权限树形数据
const apiPermissionsTree = computed(() => {
  return buildPermissionTree(props.permissions, 'api')
})

// 处理标签页切换
const handleTabChange = (tab) => {
  console.log('切换到标签页:', tab)
}

// 处理权限勾选
const handlePermissionCheck = (data, checked, indeterminate) => {
  // 合并所有已勾选的权限ID
  let allCheckedIds = []
  
  // 获取页面权限树的勾选状态
  if (pagePermissionTree.value) {
    allCheckedIds = [...allCheckedIds, ...pagePermissionTree.value.getCheckedKeys()]
  }
  
  // 获取按钮权限树的勾选状态
  if (buttonPermissionTree.value) {
    allCheckedIds = [...allCheckedIds, ...buttonPermissionTree.value.getCheckedKeys()]
  }
  
  // 获取API权限树的勾选状态
  if (apiPermissionTree.value) {
    allCheckedIds = [...allCheckedIds, ...apiPermissionTree.value.getCheckedKeys()]
  }
  
  // 去重
  selectedPermissionIds.value = [...new Set(allCheckedIds)]
}

// 获取数据范围标签类型
const getScopeTagType = (scope) => {
  const typeMap = {
    'self': 'info',
    'department': 'success',
    'organization': 'warning',
    'custom': 'primary'
  }
  return typeMap[scope] || 'info'
}

// 获取数据范围标签文本
const getScopeLabel = (scope) => {
  const labelMap = {
    'self': '本人',
    'department': '部门',
    'organization': '组织',
    'custom': '自定义'
  }
  return labelMap[scope] || scope
}

// 保存权限配置
const handleSave = () => {
  // 更新角色的权限配置，保留从业务流程环节继承的权限
  const allPermissionIds = new Set(selectedPermissionIds.value)
  const allDataRuleIds = new Set(selectedDataRuleIds.value)
  
  // 保存更新后的角色
  const updatedRole = {
    ...props.role,
    permissions: Array.from(allPermissionIds),
    dataRules: Array.from(allDataRuleIds)
  }
  
  // 发送更新事件
  emit('update:role', updatedRole)
  ElMessage.success('权限配置保存成功')
}

// 处理业务选择变化
const handleBusinessChange = () => {
  if (selectedBusinessId.value) {
    filteredProcesses.value = businessProcesses.value.filter(process => 
      process.businessId === selectedBusinessId.value
    )
  } else {
    filteredProcesses.value = []
  }
}

// 根据流程ID获取环节列表
const getNodeList = (processId) => {
  return processNodes.value.filter(node => node.processId === processId)
    .sort((a, b) => a.order - b.order)
}

// 检查环节是否已关联
const isNodeAssociated = (processId, nodeId) => {
  return props.role.processRoles && props.role.processRoles.some(item => 
    item.processId === processId && item.nodeId === nodeId
  )
}

// 关联流程环节
const handleAssociateNode = (processId, nodeId) => {
  const node = processNodes.value.find(n => n.id === nodeId)
  const process = businessProcesses.value.find(p => p.id === processId)
  
  if (!node || !process) {
    ElMessage.error('无效的流程或环节')
    return
  }
  
  // 构建流程角色配置
  const processRoleConfig = {
    processId: process.id,
    nodeId: node.id,
    permissionIds: [...(node.permissions || []), ...(node.buttonPermissions || []), ...(node.apiPermissions || [])],
    dataRuleIds: node.dataRules || [],
    visibleFieldIds: node.visibleFields || [],
    validityType: node.validityType || 'nodeDuration',
    validityDuration: 0,
    description: `${process.name}-${node.name}环节权限`
  }
  
  // 更新角色的流程角色配置
  const updatedRole = {
    ...props.role,
    processRoles: [...(props.role.processRoles || []), processRoleConfig]
  }
  
  emit('update:role', updatedRole)
  ElMessage.success('流程环节关联成功')
}

// 解除流程环节关联
const handleDisassociateNode = (processRoleConfig) => {
  const updatedRole = {
    ...props.role,
    processRoles: (props.role.processRoles || []).filter(item => 
      !(item.processId === processRoleConfig.processId && item.nodeId === processRoleConfig.nodeId)
    )
  }
  
  emit('update:role', updatedRole)
  ElMessage.success('流程环节关联已解除')
}

// 获取流程名称
const getProcessName = (processId) => {
  const process = businessProcesses.value.find(p => p.id === processId)
  return process ? process.name : processId
}

// 获取环节名称
const getNodeName = (nodeId) => {
  const node = processNodes.value.find(n => n.id === nodeId)
  return node ? node.name : nodeId
}

// 获取环节类型标签类型
const getNodeTypeTagType = (type) => {
  const typeMap = {
    start: 'success',
    middle: 'primary',
    end: 'danger'
  }
  return typeMap[type] || 'info'
}

// 获取环节类型标签
const getNodeTypeLabel = (type) => {
  const typeMap = {
    start: '开始环节',
    middle: '中间环节',
    end: '结束环节'
  }
  return typeMap[type] || type
}

// 获取有效期类型标签
const getValidityTypeLabel = (type) => {
  const typeMap = {
    permanent: '永久',
    temporary: '临时',
    nodeDuration: '环节期间'
  }
  return typeMap[type] || type
}

// 关闭对话框
const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
.permission-configuration {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
}

.permission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.permission-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.permission-content {
  flex: 1;
  overflow: auto;
}

.permission-tree-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-height: 600px;
  overflow-y: auto;
}

.tree-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.node-description {
  font-size: 12px;
  color: #999;
  margin-left: 10px;
}

.data-rule-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.el-tree-node__content) {
  height: auto;
  padding: 8px 0;
}

/* 业务流程环节样式 */
.business-process-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.business-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.business-desc {
  font-size: 12px;
  color: #909399;
}

.process-list {
  margin-top: 20px;
}

.process-card {
  margin-bottom: 20px;
}

.process-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.process-header h4 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.process-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.process-status.active {
  background-color: #ecf5ff;
  color: #409eff;
}

.process-status.inactive {
  background-color: #fef0f0;
  color: #f56c6c;
}

.process-description {
  font-size: 14px;
  color: #606266;
  margin-bottom: 15px;
}

.node-list h5 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #303133;
}

.associated-nodes h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #303133;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .permission-configuration {
    padding: 10px;
  }
  
  .permission-tree-container,
  .data-rule-container,
  .business-process-container {
    padding: 15px;
  }
}
</style>