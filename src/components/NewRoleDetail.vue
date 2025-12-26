<template>
  <div class="new-role-detail">
    <!-- 角色基本信息 -->
    <div class="role-basic-info">
      <h2>{{ role.name }} - 角色详情</h2>
      <div class="info-cards">
        <el-card shadow="hover" class="info-card">
          <div class="info-item">
            <span class="info-label">角色描述：</span>
            <span class="info-value">{{ role.description || '无描述' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">权限数量：</span>
            <span class="info-value">{{ role.permissions?.length || 0 }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">数据规则：</span>
            <span class="info-value">{{ role.dataRules?.length || 0 }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">继承角色：</span>
            <span class="info-value">{{ getInheritRoleName() }}</span>
          </div>
        </el-card>
        
        <!-- 参与业务概览 -->
        <el-card shadow="hover" class="info-card">
          <div class="info-item">
            <span class="info-label">参与业务：</span>
          </div>
          <div class="business-tags">
            <el-tag 
              v-for="business in participatingBusinesses" 
              :key="business.id"
              size="small"
              style="margin-right: 5px; margin-bottom: 5px"
            >
              {{ business.name }}
            </el-tag>
            <span v-if="participatingBusinesses.length === 0" class="empty-text">无</span>
          </div>
        </el-card>
      </div>
    </div>
    
    <!-- 业务流程详情 -->
    <div class="business-process-detail">
      <h3>参与的业务流程详情</h3>
      
      <!-- 业务筛选 -->
      <div class="filter-bar">
        <el-select 
          v-model="selectedBusinessId" 
          placeholder="请选择业务"
          style="width: 200px"
          @change="handleBusinessFilterChange"
        >
          <el-option label="全部业务" value="" />
          <el-option 
            v-for="business in businesses" 
            :key="business.id"
            :label="business.name"
            :value="business.id"
          />
        </el-select>
      </div>
      
      <!-- 业务流程列表 -->
      <div 
        v-for="business in filteredBusinesses" 
        :key="business.id"
        class="business-section"
      >
        <h4 class="business-title">{{ business.name }}</h4>
        
        <!-- 流程列表 -->
        <div 
          v-for="process in getBusinessProcesses(business.id)" 
          :key="process.id"
          class="process-section"
        >
          <h5 class="process-title">{{ process.name }}</h5>
          
          <!-- 环节列表 -->
          <el-table :data="getProcessNodes(process.id)" border stripe style="width: 100%">
            <el-table-column prop="name" label="环节名称" min-width="150" />
            <el-table-column prop="type" label="环节类型" min-width="100">
              <template #default="scope">
                <el-tag 
                  :type="scope.row.type === 'start' ? 'success' : scope.row.type === 'end' ? 'danger' : 'primary'"
                  size="small"
                >
                  {{ scope.row.type === 'start' ? '开始环节' : scope.row.type === 'end' ? '结束环节' : '中间环节' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="order" label="环节顺序" min-width="80" />
            <el-table-column label="权限数量" min-width="100">
              <template #default="scope">
                {{ getNodePermissionCount(scope.row.id) }}
              </template>
            </el-table-column>
            <el-table-column label="数据规则" min-width="100">
              <template #default="scope">
                {{ getNodeDataRuleCount(scope.row.id) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="100" fixed="right">
              <template #default="scope">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="showNodePermissions(scope.row)"
                >
                  查看权限
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      
      <div v-if="filteredBusinesses.length === 0" class="empty-state">
        <el-empty description="该角色未参与任何业务流程" />
      </div>
    </div>
    
    <!-- 权限详情 -->
    <div class="permission-detail">
      <h3>角色权限详情</h3>
      <el-tabs v-model="activePermissionTab">
        <!-- 页面权限 -->
        <el-tab-pane label="页面权限" name="page">
          <div class="permission-list">
            <el-tag 
              v-for="perm in pagePermissions" 
              :key="perm.id"
              size="medium"
              class="permission-tag"
            >
              {{ perm.name }}
            </el-tag>
            <span v-if="pagePermissions.length === 0" class="empty-text">无</span>
          </div>
        </el-tab-pane>
        
        <!-- 按钮权限 -->
        <el-tab-pane label="按钮权限" name="button">
          <div class="permission-list">
            <el-tag 
              v-for="perm in buttonPermissions" 
              :key="perm.id"
              size="medium"
              class="permission-tag"
            >
              {{ perm.name }}
            </el-tag>
            <span v-if="buttonPermissions.length === 0" class="empty-text">无</span>
          </div>
        </el-tab-pane>
        
        <!-- API权限 -->
        <el-tab-pane label="API权限" name="api">
          <div class="permission-list">
            <el-tag 
              v-for="perm in apiPermissions" 
              :key="perm.id"
              size="medium"
              class="permission-tag"
            >
              {{ perm.name }}
            </el-tag>
            <span v-if="apiPermissions.length === 0" class="empty-text">无</span>
          </div>
        </el-tab-pane>
        
        <!-- 数据规则 -->
        <el-tab-pane label="数据规则" name="dataRule">
          <div class="permission-list">
            <el-tag 
              v-for="rule in roleDataRules" 
              :key="rule.id"
              size="medium"
              class="permission-tag"
            >
              {{ rule.name }}
            </el-tag>
            <span v-if="roleDataRules.length === 0" class="empty-text">无</span>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <!-- 环节权限详情对话框 -->
    <el-dialog
      v-model="nodePermissionDialogVisible"
      :title="nodePermissionDialogTitle"
      width="800px"
    >
      <div class="node-permission-detail">
        <h4>{{ currentNode.name }} - 环节权限详情</h4>
        <div class="permission-tabs">
          <el-tabs v-model="nodePermissionActiveTab">
            <!-- 页面权限 -->
            <el-tab-pane label="页面权限" name="page">
              <div class="permission-list">
                <el-tag 
                  v-for="perm in getNodePermissionsByType(currentNode, 'page')" 
                  :key="perm.id"
                  size="small"
                  class="permission-tag"
                >
                  {{ perm.name }}
                </el-tag>
                <span v-if="getNodePermissionsByType(currentNode, 'page').length === 0" class="empty-text">无</span>
              </div>
            </el-tab-pane>
            
            <!-- 按钮权限 -->
            <el-tab-pane label="按钮权限" name="button">
              <div class="permission-list">
                <el-tag 
                  v-for="perm in getNodePermissionsByType(currentNode, 'button')" 
                  :key="perm.id"
                  size="small"
                  class="permission-tag"
                >
                  {{ perm.name }}
                </el-tag>
                <span v-if="getNodePermissionsByType(currentNode, 'button').length === 0" class="empty-text">无</span>
              </div>
            </el-tab-pane>
            
            <!-- API权限 -->
            <el-tab-pane label="API权限" name="api">
              <div class="permission-list">
                <el-tag 
                  v-for="perm in getNodePermissionsByType(currentNode, 'api')" 
                  :key="perm.id"
                  size="small"
                  class="permission-tag"
                >
                  {{ perm.name }}
                </el-tag>
                <span v-if="getNodePermissionsByType(currentNode, 'api').length === 0" class="empty-text">无</span>
              </div>
            </el-tab-pane>
            
            <!-- 数据规则 -->
            <el-tab-pane label="数据规则" name="dataRule">
              <div class="permission-list">
                <el-tag 
                  v-for="rule in getNodeDataRules(currentNode)" 
                  :key="rule.id"
                  size="small"
                  class="permission-tag"
                >
                  {{ rule.name }}
                </el-tag>
                <span v-if="getNodeDataRules(currentNode).length === 0" class="empty-text">无</span>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="nodePermissionDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
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
  role: {
    type: Object,
    required: true
  }
})

// 响应式数据
const role = ref(props.role)
const businesses = ref(mockBusinesses)
const businessProcesses = ref(mockBusinessProcesses)
const processNodes = ref(mockProcessNodes)
const permissions = ref(mockPermissions)
const allDataRules = ref(mockDataRules)
const selectedBusinessId = ref('')
const activePermissionTab = ref('page')

// 环节权限对话框
const nodePermissionDialogVisible = ref(false)
const nodePermissionDialogTitle = ref('环节权限详情')
const currentNode = ref(null)
const nodePermissionActiveTab = ref('page')

// 参与的业务
const participatingBusinesses = computed(() => {
  const businessIds = new Set()
  
  // 从processRoles中提取关联的业务
  role.value.processRoles?.forEach(pr => {
    const process = businessProcesses.value.find(p => p.id === pr.processId)
    if (process) {
      businessIds.add(process.businessId)
    }
  })
  
  // 返回业务对象数组
  return businesses.value.filter(b => businessIds.has(b.id))
})

// 过滤后的业务
const filteredBusinesses = computed(() => {
  if (!selectedBusinessId.value) {
    return participatingBusinesses.value
  }
  
  return participatingBusinesses.value.filter(business => 
    business.id === selectedBusinessId.value
  )
})

// 获取继承角色名称
const getInheritRoleName = () => {
  if (!role.value.inheritRoleId) {
    return '无'
  }
  
  const inheritRole = mockRoles.find(r => r.id === role.value.inheritRoleId)
  return inheritRole ? inheritRole.name : '未知角色'
}

// 根据业务ID获取流程列表
const getBusinessProcesses = (businessId) => {
  // 获取角色参与的流程ID
  const roleProcessIds = new Set()
  role.value.processRoles?.forEach(pr => {
    const process = businessProcesses.value.find(p => p.id === pr.processId)
    if (process && process.businessId === businessId) {
      roleProcessIds.add(pr.processId)
    }
  })
  
  // 返回流程对象数组
  return businessProcesses.value.filter(p => 
    p.businessId === businessId && roleProcessIds.has(p.id)
  )
}

// 根据流程ID获取环节列表
const getProcessNodes = (processId) => {
  // 获取角色参与的环节ID
  const roleNodeIds = new Set()
  role.value.processRoles?.forEach(pr => {
    if (pr.processId === processId) {
      roleNodeIds.add(pr.nodeId)
    }
  })
  
  // 返回环节对象数组
  return processNodes.value.filter(n => 
    n.processId === processId && roleNodeIds.has(n.id)
  ).sort((a, b) => a.order - b.order)
}

// 获取环节的权限数量
const getNodePermissionCount = (nodeId) => {
  const node = processNodes.value.find(n => n.id === nodeId)
  if (!node) return 0
  
  return [...(node.permissions || []), ...(node.buttonPermissions || []), ...(node.apiPermissions || [])].length
}

// 获取环节的数据规则数量
const getNodeDataRuleCount = (nodeId) => {
  const node = processNodes.value.find(n => n.id === nodeId)
  if (!node) return 0
  
  return node.dataRules?.length || 0
}

// 处理业务筛选变化
const handleBusinessFilterChange = () => {
  // 业务筛选变化时，自动滚动到业务流程详情区域
  setTimeout(() => {
    const element = document.querySelector('.business-process-detail')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }, 100)
}

// 页面权限
const pagePermissions = computed(() => {
  const permissionIds = new Set(role.value.permissions || [])
  return permissions.value.filter(p => 
    p.type === 'page' && permissionIds.has(p.id)
  )
})

// 按钮权限
const buttonPermissions = computed(() => {
  const permissionIds = new Set(role.value.permissions || [])
  return permissions.value.filter(p => 
    p.type === 'button' && permissionIds.has(p.id)
  )
})

// API权限
const apiPermissions = computed(() => {
  const permissionIds = new Set(role.value.permissions || [])
  return permissions.value.filter(p => 
    p.type === 'api' && permissionIds.has(p.id)
  )
})

// 角色数据规则
const roleDataRules = computed(() => {
  const ruleIds = new Set(role.value.dataRules || [])
  return allDataRules.value.filter(r => ruleIds.has(r.id))
})

// 显示环节权限详情
const showNodePermissions = (node) => {
  currentNode.value = node
  nodePermissionDialogTitle.value = `${node.name} - 环节权限详情`
  nodePermissionDialogVisible.value = true
}

// 根据类型获取环节权限
const getNodePermissionsByType = (node, type) => {
  if (!node) return []
  
  const allNodePermissions = [...(node.permissions || []), ...(node.buttonPermissions || []), ...(node.apiPermissions || [])]
  return permissions.value.filter(p => 
    p.type === type && allNodePermissions.includes(p.id)
  )
}

// 获取环节数据规则
const getNodeDataRules = (node) => {
  if (!node || !node.dataRules) return []
  
  return allDataRules.value.filter(r => node.dataRules.includes(r.id))
}
</script>

<style scoped>
.new-role-detail {
  padding: 20px;
}

.role-basic-info {
  margin-bottom: 30px;
}

.role-basic-info h2 {
  margin-bottom: 20px;
  color: #303133;
}

.info-cards {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.info-card {
  flex: 1;
  min-width: 300px;
}

.info-item {
  margin-bottom: 15px;
}

.info-label {
  font-weight: 500;
  color: #606266;
  margin-right: 10px;
}

.info-value {
  color: #303133;
}

.business-tags {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.business-process-detail {
  margin-bottom: 30px;
}

.business-process-detail h3 {
  margin-bottom: 20px;
  color: #303133;
}

.filter-bar {
  margin-bottom: 20px;
}

.business-section {
  margin-bottom: 30px;
}

.business-title {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #409eff;
  color: #303133;
  font-size: 18px;
}

.process-section {
  margin-bottom: 20px;
}

.process-title {
  margin-bottom: 15px;
  color: #606266;
  font-size: 16px;
}

.permission-detail {
  margin-bottom: 30px;
}

.permission-detail h3 {
  margin-bottom: 20px;
  color: #303133;
}

.permission-list {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.permission-tag {
  margin-bottom: 10px;
  background-color: #ecf5ff;
  color: #409eff;
}

.empty-text {
  color: #909399;
  font-style: italic;
  margin: 10px 0;
  display: inline-block;
}

.empty-state {
  margin: 50px 0;
  text-align: center;
}

/* 环节权限详情 */
.node-permission-detail {
  margin-bottom: 20px;
}

.node-permission-detail h4 {
  margin-bottom: 20px;
  color: #303133;
}

.permission-tabs {
  margin-top: 20px;
}
</style>