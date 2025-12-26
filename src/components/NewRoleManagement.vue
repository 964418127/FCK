<template>
  <div class="new-role-management">
    <div class="page-header">
      <div>
        <h2>平台超管</h2>
        <p>管理平台超级管理员的身份类型</p>
      </div>
      <el-button type="primary" @click="handleAddRole">
        <el-icon-plus /> 新增平台超管
      </el-button>
    </div>
    
    <div class="page-content">
      <el-table :data="roles" border stripe style="width: 100%">
        <el-table-column label="身份类型" width="120" fixed="left">
          <template #default="scope">
            <el-tag type="warning" size="small">平台超管</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="identityCode" label="身份编码" width="180" fixed="left">
          <template #default="scope">
            <el-tag type="info" size="small">{{ scope.row.identityCode || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="身份名称" min-width="150" />
        <el-table-column prop="description" label="角色描述" min-width="300" />
        <el-table-column prop="permissions" label="权限数量" min-width="100">
          <template #default="scope">
            {{ scope.row.permissions?.length || 0 }}
          </template>
        </el-table-column>
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
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button 
                type="primary" 
                size="small" 
                @click="handleConfigurePermission(scope.row)"
                style="margin-right: 5px"
              >
                工作权限
              </el-button>
              <el-button 
                type="success" 
                size="small" 
                @click="handleConfigureContainerScope(scope.row)"
                style="margin-right: 5px"
              >
                容器范围
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
            </div>
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
          <el-input v-model="formData.name" placeholder="请输入岗位工作角色名称" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input 
            v-model="formData.description" 
            type="textarea" 
            rows="3" 
            placeholder="请输入角色描述，说明该角色负责的工作" 
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
                v-for="business in businesses" 
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
            
            <!-- 空状态 -->
            <div v-if="businesses.length === 0" class="empty-state">
              <el-empty description="暂无业务数据" />
            </div>
          </div>
          
          <!-- 第二列：流程&环节选择 -->
          <div class="middle-panel">
            <h3>2. 选择流程和环节</h3>
            
            <!-- 流程选择 -->
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
            
            <!-- 空状态 -->
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
                  <el-tooltip 
                    v-for="perm in previewPermissions.page" 
                    :key="perm.id"
                    placement="top"
                    effect="light"
                    :html="true"
                  >
                    <template #content>
                      <div class="page-permission-tooltip advanced-tooltip">
                        <div class="tooltip-section">
                          <strong>所属产品端口：</strong>
                          <span>{{ perm.productPort }}</span>
                        </div>
                        <div class="tooltip-section">
                          <strong>页面路由：</strong>
                          <span>{{ perm.path || '无' }}</span>
                        </div>
                        <div class="tooltip-section">
                          <strong>页面描述：</strong>
                          <span>{{ perm.description || '无' }}</span>
                        </div>
                        <div class="tooltip-section">
                          <strong>页面编码：</strong>
                          <span>{{ perm.code || '无' }}</span>
                        </div>
                      </div>
                    </template>
                    <el-tag 
                      size="small"
                      class="permission-tag"
                    >
                      {{ perm.name }}
                    </el-tag>
                  </el-tooltip>
                  <span v-if="previewPermissions.page.length === 0" class="empty-text">无</span>
                </div>
              </el-tab-pane>
              <el-tab-pane label="按钮权限" name="button">
                <div class="permission-preview-list">
                  <el-tooltip 
                    v-for="perm in previewPermissions.button" 
                    :key="perm.id"
                    placement="top"
                    effect="light"
                    :html="true"
                  >
                    <template #content>
                      <div class="button-permission-tooltip advanced-tooltip">
                        <div class="tooltip-section">
                          <strong>所属产品端口：</strong>
                          <span>{{ perm.productPort }}</span>
                        </div>
                        <div class="tooltip-section">
                          <strong>按钮描述：</strong>
                          <span>{{ perm.description || '无' }}</span>
                        </div>
                        <div class="tooltip-section">
                          <strong>调用API链：</strong>
                          <div class="api-chain-list">
                            <div 
                              v-for="(api, index) in getButtonApiChain(perm.id)" 
                              :key="index"
                              class="api-chain-item"
                            >
                              {{ api }}
                            </div>
                            <div v-if="getButtonApiChain(perm.id).length === 0" class="empty-api-chain">
                              无
                            </div>
                          </div>
                        </div>
                      </div>
                    </template>
                    <el-tag 
                      size="small"
                      class="permission-tag"
                    >
                      {{ perm.name }}
                    </el-tag>
                  </el-tooltip>
                  <span v-if="previewPermissions.button.length === 0" class="empty-text">无</span>
                </div>
              </el-tab-pane>
              <el-tab-pane label="API权限" name="api">
                <div class="permission-preview-list">
                  <el-tooltip 
                    v-for="perm in previewPermissions.api" 
                    :key="perm.id"
                    placement="bottom"
                    effect="light"
                    :html="true"
                  >
                    <template #content>
                      <div class="api-permission-tooltip advanced-tooltip">
                        <!-- 基础信息区域 -->
                        <div class="tooltip-section">
                          <strong>所属产品端口：</strong>
                          <span>{{ perm.productPort }}</span>
                        </div>
                        <div class="tooltip-section">
                          <strong>API地址：</strong>
                          <span class="api-url">
                            <span :class="['api-method', perm.method || 'GET']">{{ perm.method || 'GET' }}</span>
                            <span class="api-path">{{ perm.apiUrl || '无' }}</span>
                          </span>
                        </div>
                        <div class="tooltip-section">
                          <strong>API描述：</strong>
                          <span>{{ perm.description || '无' }}</span>
                        </div>
                        
                        <!-- 关联按钮区域 -->
                        <div class="tooltip-divider"></div>
                        <div class="tooltip-section">
                          <strong>关联功能/按钮：</strong>
                          <div class="associated-buttons">
                            <el-tag 
                              v-for="button in getAssociatedButtons(perm.id)" 
                              :key="button.id"
                              size="small"
                              type="success"
                              class="associated-button-tag"
                            >
                              {{ button.name }}
                            </el-tag>
                            <span v-if="getAssociatedButtons(perm.id).length === 0" class="empty-text">无</span>
                          </div>
                        </div>
                        
                        <!-- 数据权限区域 -->
                        <div class="tooltip-divider"></div>
                        <div class="tooltip-section">
                          <strong>数据权限：</strong>
                          <div class="data-permission-section">
                            <!-- 数据规则列表 -->
                            <div 
                              v-for="rule in getAssociatedDataRules(perm.id)" 
                              :key="rule.id"
                              class="data-rule-item"
                            >
                              <div class="data-rule-header">
                                <strong>{{ rule.name }}</strong>
                                <span class="rule-description">{{ rule.description }}</span>
                              </div>
                               
                              <!-- 来源信息 -->
                              <div class="data-rule-sources">
                                <strong>来源信息：</strong>
                                <div class="source-nodes">
                                  <el-tag 
                                    v-for="source in rule.fromNodes" 
                                    :key="source.nodeId"
                                    size="small"
                                    type="info"
                                    class="source-node-tag"
                                  >
                                    {{ source.businessName }} - {{ source.processName }} - {{ source.nodeName }}
                                  </el-tag>
                                </div>
                              </div>
                               
                              <!-- 数据对象 -->
                              <div class="data-rule-object">
                                <strong>数据对象：</strong>
                                <span class="object-type">{{ rule.type === 'order' ? '订单' : rule.type || '数据' }}</span>
                              </div>
                               
                              <!-- 配置条件 -->
                              <div class="data-rule-conditions">
                                <div class="conditions-title">
                                  <strong>配置条件：</strong>
                                </div>
                                <div class="conditions-container">
                                  <div class="condition-group">
                                    <div class="condition-group-header">
                                      <span>所有条件都满足</span>
                                    </div>
                                    <div class="condition-list">
                                      <div 
                                        v-for="(cond, index) in rule.conditions" 
                                        :key="index"
                                        class="condition-item"
                                      >
                                        <div class="condition-item-content">
                                          <span class="condition-label">{{ getAttributeLabel(cond.attribute) }}</span>
                                          <span class="condition-operator">{{ getOperatorLabel(cond.operator) }}</span>
                                          <span class="condition-value">{{ getValueLabel(cond.attribute, cond.value) }}</span>
                                        </div>
                                        <div class="condition-separator" v-if="index < rule.conditions.length - 1">并且</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <!-- 无数据规则时的提示 -->
                            <div v-if="getAssociatedDataRules(perm.id).length === 0" class="no-data-rules">
                              无特定数据规则配置
                            </div>
                            
                            <!-- 默认权限规则 -->
                            <div class="default-permission-rules">
                              <div class="default-rules-title">
                                <strong>默认权限规则：</strong>
                              </div>
                              <ul class="default-rules-list">
                                <li>• 组织权限：只能访问所属组织的数据</li>
                                <li>• 业务容器权限：只能访问分配的业务容器（如城市、门店等）的数据</li>
                                <li>• 个人权限：默认只能访问个人相关的数据</li>
                              </ul>
                            </div>
                            
                            <!-- 最终权限范围 -->
                            <div class="final-permission-scope">
                              <div class="final-scope-title">
                                <strong>最终数据可见范围：</strong>
                              </div>
                              <div class="final-scope-formula">
                                配置条件 + 组织权限 + 业务容器权限 + 个人权限
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </template>
                    <el-tag 
                      size="small"
                      class="permission-tag"
                    >
                      {{ perm.name }}
                    </el-tag>
                  </el-tooltip>
                  <span v-if="previewPermissions.api.length === 0" class="empty-text">无</span>
                </div>
              </el-tab-pane>
            </el-tabs>
            
            <!-- 权限关系说明 -->
            <div class="permission-relationship">
              <h4>权限关系说明</h4>
              <p>在本系统中，权限模型采用业务流程驱动的设计，各权限之间存在以下关系：</p>
              <ul>
                <li><strong>页面权限</strong>：控制用户可以访问哪些页面，是权限体系的基础。</li>
                <li><strong>按钮权限</strong>：控制用户可以在页面上执行哪些操作，依赖于页面权限。</li>
                <li><strong>API权限</strong>：控制用户可以调用哪些后端接口，是按钮功能的实现基础。</li>
                <li><strong>数据规则</strong>：控制用户可以访问的数据范围，作用于API层面，实现细粒度的数据访问控制。</li>
                <li><strong>容器范围</strong>：控制用户可以访问哪些业务容器的数据，实现基于地理/组织层级的数据访问控制。</li>
              </ul>
              <p><strong>权限继承关系</strong>：</p>
              <ul>
                <li>页面权限是基础，没有页面权限则无法访问该页面的任何功能。</li>
                <li>按钮权限依赖于页面权限，只有拥有页面权限才能使用该页面上的按钮。</li>
                <li>按钮权限关联API权限，点击按钮时会调用对应的API接口。</li>
                <li>API权限可以配置数据规则，数据规则决定了API返回的数据范围。</li>
                <li>数据规则与业务流程环节关联，不同环节调用同一个API时可能应用不同的数据规则。</li>
                <li>容器范围与角色关联，决定了角色可以访问的数据的地理/组织范围。</li>
              </ul>
              <p><strong>业务流程驱动</strong>：</p>
              <ul>
                <li>角色通过参与业务流程的环节获得相应的权限。</li>
                <li>每个流程环节预设了所需的页面、按钮、API权限和数据规则。</li>
                <li>当角色关联到某个流程环节时，自动获得该环节预设的所有权限。</li>
                <li>角色可以参与多个业务流程的多个环节，获得的权限是所有参与环节权限的集合。</li>
                <li>角色可以配置多个容器范围，决定了可以访问的数据的地理/组织范围。</li>
              </ul>
            </div>
          </div>
        </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSavePermissionConfig">保存配置</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  roles as mockRoles, 
  permissions as mockPermissions, 
  dataRules as mockDataRules, 
  businesses as mockBusinesses, 
  businessProcesses as mockBusinessProcesses, 
  processNodes as mockProcessNodes,
  businessContainers as mockBusinessContainers 
} from '../mock/data.js'

// 响应式数据
const dialogVisible = ref(false)
const dialogTitle = ref('新增岗位工作角色')
const formRef = ref(null)
const isEdit = ref(false)
const formData = ref({
  id: '',
  name: '',
  description: '',
  permissions: [],
  dataRules: [],
  inheritRoleId: null,
  processRoles: [],
  containerScope: [], // 容器范围配置
  identityCode: '' // 身份编码：平台超管
})

// 角色数据 - 确保所有角色都有身份编码
const roles = ref(mockRoles.map(role => {
  if (!role.identityCode) {
    // 为没有身份编码的角色自动生成（基于角色ID，确保稳定性）
    const roleIdSuffix = role.id.replace('role-', '').toUpperCase()
    role.identityCode = `PLATFORM_ADMIN_${roleIdSuffix.padStart(6, '0')}`
  }
  return role
}))
const permissions = ref(mockPermissions)
const dataRules = ref(mockDataRules)
const businesses = ref(mockBusinesses)
const businessProcesses = ref(mockBusinessProcesses)
const processNodes = ref(mockProcessNodes)
const businessContainers = ref(mockBusinessContainers)

// 业务树形结构
const businessesTree = ref([])
const businessTreeProps = {
  children: 'children',
  label: 'name'
}

// 业务容器树形结构
const containerTree = ref([])
const containerTreeProps = {
  label: 'name',
  children: 'children'
}

// 构建业务容器树形结构
const buildContainerTree = (containerList) => {
  const tree = []
  const map = new Map()
  
  // 先将所有业务容器放入map
  containerList.forEach(container => {
    map.set(container.id, { ...container, children: [] })
  })
  
  // 构建树形结构
  map.forEach(container => {
    if (!container.parentId) {
      // 根节点
      tree.push(container)
    } else {
      // 子节点，添加到父节点的children中
      const parent = map.get(container.parentId)
      if (parent) {
        parent.children.push(container)
      } else {
        // 如果找不到父节点，作为根节点处理
        tree.push(container)
      }
    }
  })
  
  return tree
}

// 获取容器类型标签类型
const getContainerTypeTagType = (type) => {
  const typeMap = {
    'COUNTRY': 'info',
    'REGION': 'primary',
    'PROVINCE': 'success',
    'CITY': 'warning',
    'DISTRICT': 'danger',
    'BUSINESS_AREA': 'info',
    'CBD': 'primary',
    'STORE': 'success'
  }
  return typeMap[type] || 'info'
}

// 获取容器类型标签文本
const getContainerTypeLabel = (type) => {
  const labelMap = {
    'COUNTRY': '全国',
    'REGION': '大区',
    'PROVINCE': '省',
    'CITY': '市',
    'DISTRICT': '区',
    'BUSINESS_AREA': '商圈',
    'CBD': 'CBD',
    'STORE': '门店'
  }
  return labelMap[type] || type
}

// 路由相关
const router = useRouter()

// 权限配置对话框
const permissionDialogVisible = ref(false)
const permissionDialogTitle = ref('配置工作权限')
const selectedRole = ref(null)
const previewActiveTab = ref('page')

// 权限配置表单
const permissionConfigForm = ref({
  selectedBusinessId: '', // 单选业务ID
  selectedProcesses: {}, // processId: boolean
  selectedNodes: {}, // nodeId: boolean
  selectedContainers: [] // 选中的容器ID列表
})

// 根据业务ID获取流程列表
const getBusinessProcesses = (businessId) => {
  if (!businessId) {
    return []
  }
  
  return businessProcesses.value.filter(process => 
    process.businessId === businessId
  )
}

// 权限预览数据
const previewPermissions = ref({
  page: [],
  button: [],
  api: [],
  dataRule: []
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 1, max: 50, message: '角色名称长度在 1 到 50 个字符', trigger: 'blur' }
  ]
}

// 生命周期钩子
onMounted(() => {
  // 构建业务树形结构（目前业务是扁平的，直接使用）
  businessesTree.value = businesses.value
  
  // 构建业务容器树形结构
  containerTree.value = buildContainerTree(businessContainers.value)
})

// 打开新增角色对话框
const handleAddRole = () => {
  isEdit.value = false
  dialogTitle.value = '新增岗位工作角色'
  // 自动生成身份编码：PLATFORM_ADMIN_ + 时间戳后6位
  const timestamp = Date.now().toString()
  const identityCode = `PLATFORM_ADMIN_${timestamp.slice(-6)}`
  formData.value = {
    id: `role-${Date.now()}`,
    name: '',
    description: '',
    permissions: [],
    dataRules: [],
    inheritRoleId: null,
    processRoles: [],
    identityCode: identityCode
  }
  dialogVisible.value = true
}

// 打开编辑角色对话框
const handleEditRole = (data) => {
  isEdit.value = true
  dialogTitle.value = '编辑岗位工作角色'
  const roleData = JSON.parse(JSON.stringify(data))
  // 编辑时保留原有的identityCode，如果没有则保持为空
  formData.value = {
    ...roleData,
    identityCode: roleData.identityCode || ''
  }
  dialogVisible.value = true
}

// 删除角色
const handleDeleteRole = (data) => {
  ElMessageBox.confirm('确定要删除该角色吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const newRoles = roles.value.filter(role => role.id !== data.id)
    roles.value = newRoles
    ElMessage.success('角色删除成功')
  }).catch(() => {
    // 取消删除
  })
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
      dialogVisible.value = false
      ElMessage.success(isEdit.value ? '角色更新成功' : '角色新增成功')
    } else {
      return false
    }
  })
}

// 打开权限配置对话框
const handleConfigurePermission = (role) => {
  selectedRole.value = JSON.parse(JSON.stringify(role))
  
  // 初始化权限配置表单
  initializePermissionConfigForm()
  
  // 更新预览权限
  updatePreviewPermissions()
  
  permissionDialogTitle.value = `配置 ${role.name} 的工作权限`
  permissionDialogVisible.value = true
}

// 选择业务
const selectBusiness = (businessId) => {
  // 如果已经选中当前业务，则取消选择
  if (permissionConfigForm.value.selectedBusinessId === businessId) {
    permissionConfigForm.value.selectedBusinessId = ''
  } else {
    permissionConfigForm.value.selectedBusinessId = businessId
  }
  
  // 重置流程和环节选择
  permissionConfigForm.value.selectedProcesses = {}
  permissionConfigForm.value.selectedNodes = {}
  
  // 更新预览权限
  updatePreviewPermissions()
}

// 初始化权限配置表单
const initializePermissionConfigForm = () => {
  // 初始化表单
  permissionConfigForm.value = {
    selectedBusinessId: '',
    selectedProcesses: {},
    selectedNodes: {},
    selectedContainers: []
  }
  
  // 从processRoles中提取关联的业务、流程和环节
  if (selectedRole.value.processRoles?.length > 0) {
    // 获取第一个关联的业务作为默认选择
    const firstProcessRole = selectedRole.value.processRoles[0]
    const firstProcess = businessProcesses.value.find(p => p.id === firstProcessRole.processId)
    if (firstProcess) {
      permissionConfigForm.value.selectedBusinessId = firstProcess.businessId
    }
    
    // 设置已关联的流程和环节
    selectedRole.value.processRoles.forEach(pr => {
      permissionConfigForm.value.selectedProcesses[pr.processId] = true
      permissionConfigForm.value.selectedNodes[pr.nodeId] = true
    })
  }
  
  // 设置已配置的容器范围
  if (selectedRole.value.containerScope?.length > 0) {
    permissionConfigForm.value.selectedContainers = [...selectedRole.value.containerScope]
  }
  
  // 更新预览权限
  updatePreviewPermissions()
}

// 打开角色详情对话框
const handleViewRole = (role) => {
  selectedRole.value = JSON.parse(JSON.stringify(role))
  // 这里可以跳转到角色详情页面或打开详情对话框
  ElMessage.info('角色详情功能开发中...')
}

// 跳转到容器范围配置页面
const handleConfigureContainerScope = (role) => {
  router.push(`/role-container-scope/${role.id}`)
}

// 获取参与的业务
const getParticipatingBusinesses = (role) => {
  const businessIds = new Set()
  
  // 从processRoles中提取关联的业务
  role.processRoles?.forEach(pr => {
    const process = businessProcesses.value.find(p => p.id === pr.processId)
    if (process) {
      businessIds.add(process.businessId)
    }
  })
  
  // 返回业务对象数组
  return businesses.value.filter(b => businessIds.has(b.id))
}

// 处理流程选择变化
const handleProcessChange = (processId) => {
  // 如果取消选择流程，移除该流程下的所有环节选择
  if (!permissionConfigForm.value.selectedProcesses[processId]) {
    const nodes = getProcessNodes(processId)
    nodes.forEach(node => {
      delete permissionConfigForm.value.selectedNodes[node.id]
    })
  }
  
  // 更新预览权限
  updatePreviewPermissions()
}

// 处理环节选择变化
const handleNodeChange = () => {
  // 更新预览权限
  updatePreviewPermissions()
}

// 获取流程环节
const getProcessNodes = (processId) => {
  return processNodes.value.filter(node => node.processId === processId)
    .sort((a, b) => a.order - b.order)
}

// 更新预览权限
const updatePreviewPermissions = () => {
  // 获取所有选中的环节
  const selectedNodeIds = Object.keys(permissionConfigForm.value.selectedNodes)
    .filter(nodeId => permissionConfigForm.value.selectedNodes[nodeId])
  
  // 获取这些环节的权限
  const allPermissionIds = new Set()
  const allDataRuleIds = new Set()
  
  selectedNodeIds.forEach(nodeId => {
    const node = processNodes.value.find(n => n.id === nodeId)
    if (node) {
      // 添加所有权限（节点可能包含不同类型的权限引用）
      ;[...(node.permissions || []), ...(node.buttonPermissions || []), ...(node.apiPermissions || [])]
        .forEach(permId => allPermissionIds.add(permId))
      
      // 添加数据规则
      ;[...(node.dataRules || [])]
        .forEach(ruleId => allDataRuleIds.add(ruleId))
    }
  })
  
  // 将权限分组
  const pagePermissions = []
  const buttonPermissions = []
  const apiPermissions = []
  
  // 保存API信息，用于显示不同请求方法和关联按钮
  const apiInfoMap = new Map()
  
  // 保存所有FUNCTION权限，用于后续处理API关联
  const functionPermissions = []
  
  // 第一次遍历：分组权限并收集FUNCTION权限
  Array.from(allPermissionIds).forEach(permId => {
    const perm = permissions.value.find(p => p.id === permId)
    if (perm) {
      if (perm.type === 'PAGE') {
        pagePermissions.push(perm)
      } else if (perm.type === 'FUNCTION') {
        buttonPermissions.push(perm)
        functionPermissions.push(perm)
      } else if (perm.type === 'API') {
        // 直接添加API权限，后续会处理关联关系
        apiPermissions.push(perm)
      }
      // 跳过DIRECTORY类型，因为它是用于组织的
    }
  })
  
  // 处理FUNCTION权限关联的API权限
  functionPermissions.forEach(funcPerm => {
    if (funcPerm.apiPermissions && funcPerm.apiPermissions.length > 0) {
      funcPerm.apiPermissions.forEach(apiPermId => {
        const apiPerm = permissions.value.find(p => p.id === apiPermId)
        if (apiPerm && apiPerm.type === 'API') {
          // 检查API是否已经在列表中
          const existingIndex = apiPermissions.findIndex(p => p.id === apiPerm.id)
          if (existingIndex === -1) {
            apiPermissions.push(apiPerm)
          }
        }
      })
    }
    
    // 保存按钮的API链信息，用于显示不同请求方法
    const apiChain = getButtonApiChain(funcPerm.id)
    
    // 去重处理，每个API只添加一次
    const uniqueApis = [...new Set(apiChain)]
    
    uniqueApis.forEach(api => {
      const [method, url] = api.split(' ')
      const apiKey = `${method} ${url}`
      
      // 查找对应的API权限
      const perm = permissions.value.find(p => p.type === 'API' && p.apiUrl === url)
      if (perm) {
        if (!apiInfoMap.has(apiKey)) {
          // 根据请求方法生成不同的描述
          let description = perm.description
          let name = perm.name
          
          // 根据请求方法生成合适的描述和名称
          switch (method) {
            case 'POST':
              name = `创建${url.split('/').pop()}`
              description = `创建${url.split('/').pop()}API`
              break
            case 'PUT':
              name = `更新${url.split('/').pop()}`
              description = `更新${url.split('/').pop()}API`
              break
            case 'DELETE':
              name = `删除${url.split('/').pop()}`
              description = `删除${url.split('/').pop()}API`
              break
            case 'PATCH':
              name = `部分更新${url.split('/').pop()}`
              description = `部分更新${url.split('/').pop()}API`
              break
            case 'GET':
            default:
              // 保持原有名称和描述
              break
          }
          
          apiInfoMap.set(apiKey, { 
            ...perm, 
            method, 
            description,
            name
          })
        }
      }
    })
  })
  
  // 合并API信息（从FUNCTION关联和直接权限中获取）
  const finalApiPermissions = [...new Set([...apiPermissions, ...Array.from(apiInfoMap.values())])]
    // 去重，保留完整信息的版本
    .reduce((acc, apiPerm) => {
      const key = apiPerm.apiUrl + (apiPerm.method || '')
      if (!acc[key] || (apiPerm.method && !acc[key].method)) {
        acc[key] = apiPerm
      }
      return acc
    }, {})
  
  // 获取数据规则
  const dataRulePermissions = Array.from(allDataRuleIds)
    .map(ruleId => dataRules.value.find(r => r.id === ruleId))
    .filter(Boolean)
  
  // 更新预览数据
  previewPermissions.value = {
    page: pagePermissions,
    button: buttonPermissions,
    api: Object.values(finalApiPermissions),
    dataRule: dataRulePermissions
  }
}

// 数据规则条件辅助函数
// 获取属性中文标签
const getAttributeLabel = (attribute) => {
  const attributeMap = {
    'status': '状态',
    'city': '城市',
    'pendingTime': '下单时间',
    'unusedDays': '未使用天数',
    'rating': '评分',
    'completedDays': '完成天数',
    'aftersaleStatus': '售后状态'
  }
  return attributeMap[attribute] || attribute
}

// 获取操作符中文标签
const getOperatorLabel = (operator) => {
  const operatorMap = {
    'eq': '等于',
    'gt': '大于',
    'gte': '大于等于',
    'lt': '小于',
    'lte': '小于等于',
    'in': '包含于',
    'ne': '不等于'
  }
  return operatorMap[operator] || operator
}

// 获取值中文标签
const getValueLabel = (attribute, value) => {
  // 状态值映射
  const statusMap = {
    'pending': '待支付',
    'unused': '未使用',
    'serviceing': '服务中',
    'completed': '已完成',
    'canceled': '已取消',
    'refunded': '已退款',
    'pending': '待处理'
  }
  
  // 根据属性类型处理值
  if (attribute === 'status' || attribute === 'aftersaleStatus') {
    return statusMap[value] || value
  }
  
  // 城市特殊处理
  if (attribute === 'city') {
    return value
  }
  
  // 数值类型保留原始值
  return value
}

// 获取按钮API链（从权限数据动态生成，避免漏配）
const getButtonApiChain = (buttonId) => {
  const buttonPerm = permissions.value.find(p => p.id === buttonId && p.type === 'FUNCTION')
  if (!buttonPerm || !Array.isArray(buttonPerm.apiPermissions)) {
    return []
  }

  const seen = new Set()
  return buttonPerm.apiPermissions
    .map(apiId => permissions.value.find(p => p.id === apiId && p.type === 'API'))
    .filter(Boolean)
    .map(apiPerm => {
      const method = apiPerm.method || 'GET' // mock数据未提供method，默认GET
      const entry = `${method} ${apiPerm.apiUrl || ''}`.trim()
      return entry
    })
    .filter(entry => {
      if (seen.has(entry)) return false
      seen.add(entry)
      return !!entry
    })
}

// 获取API关联的数据规则，包含流程环节信息
const getAssociatedDataRules = (apiId) => {
  // 获取API的实际URL，忽略请求方法
  const api = permissions.value.find(p => p.id === apiId)
  if (!api) {
    return []
  }
  
  // 1. 获取当前选中的环节（只考虑用户实际选择的环节）
  const selectedNodeIds = Object.keys(permissionConfigForm.value.selectedNodes)
    .filter(nodeId => permissionConfigForm.value.selectedNodes[nodeId])
  
  // 2. 过滤出包含该API URL且被选中的流程环节（不考虑请求方法）
  const relevantNodes = processNodes.value.filter(node => 
    selectedNodeIds.includes(node.id) && 
    node.apiPermissions && 
    node.apiPermissions.some(permId => {
      const perm = permissions.value.find(p => p.id === permId)
      return perm && perm.apiUrl === api.apiUrl
    })
  )
  
  // 3. 提取所有关联的数据规则，包含流程环节信息
  const ruleMap = new Map()
  
  relevantNodes.forEach(node => {
    if (node.dataRules && node.dataRules.length > 0) {
      node.dataRules.forEach(ruleId => {
        const rule = dataRules.value.find(r => r.id === ruleId)
        if (rule) {
          // 获取流程和业务信息
          const process = businessProcesses.value.find(p => p.id === node.processId)
          const business = businesses.value.find(b => b.id === process?.businessId)
          
          // 如果规则已存在，添加流程环节信息
          if (ruleMap.has(ruleId)) {
            const existingRule = ruleMap.get(ruleId)
            // 检查来源环节是否已存在，避免重复
            const isExisting = existingRule.fromNodes.some(
              fromNode => fromNode.nodeId === node.id
            )
            if (!isExisting) {
              existingRule.fromNodes.push({
                nodeId: node.id,
                nodeName: node.name,
                processId: node.processId,
                processName: process?.name || '未知流程',
                businessId: business?.id || 'unknown',
                businessName: business?.name || '未知业务'
              })
            }
          } else {
            // 否则创建新的规则对象，包含流程环节信息
            ruleMap.set(ruleId, {
              ...rule,
              fromNodes: [{
                nodeId: node.id,
                nodeName: node.name,
                processId: node.processId,
                processName: process?.name || '未知流程',
                businessId: business?.id || 'unknown',
                businessName: business?.name || '未知业务'
              }]
            })
          }
        }
      })
    }
  })
  
  // 4. 如果没有直接关联的规则，添加默认数据规则
  if (ruleMap.size === 0) {
    // 添加一些默认数据规则
    // 默认规则：只能查看本人相关数据
    ruleMap.set('rule-1', {
      ...dataRules.value.find(r => r.id === 'rule-1'),
      fromNodes: [{ 
        nodeId: 'default', 
        nodeName: '默认规则', 
        processId: 'default',
        processName: '默认流程',
        businessId: 'default',
        businessName: '默认业务'
      }]
    })
    // 默认规则：只能查看本部门数据
    ruleMap.set('rule-2', {
      ...dataRules.value.find(r => r.id === 'rule-2'),
      fromNodes: [{ 
        nodeId: 'default', 
        nodeName: '默认规则', 
        processId: 'default',
        processName: '默认流程',
        businessId: 'default',
        businessName: '默认业务'
      }]
    })
  }
  
  // 5. 获取数据规则对象数组
  return Array.from(ruleMap.values())
}

// 获取关联到API的所有功能/按钮权限，包含页面信息
const getAssociatedButtons = (apiId) => {
  // 获取API的实际URL，忽略请求方法
  const api = permissions.value.find(p => p.id === apiId)
  if (!api) {
    return []
  }
  
  // 查找所有关联到该API的FUNCTION权限
  const associatedButtons = permissions.value.filter(perm => 
    perm.type === 'FUNCTION' && 
    perm.apiPermissions && 
    perm.apiPermissions.includes(api.id)
  )
  
  // 为每个按钮添加所属页面信息
  return associatedButtons.map(button => {
    // 查找按钮所属的页面
    const page = permissions.value.find(perm => perm.id === button.parentId)
    return {
      ...button,
      pageName: page ? page.name : '未知页面'
    }
  })
}



// 保存权限配置
const handleSavePermissionConfig = () => {
  // 获取所有选中的环节
  const selectedNodeIds = Object.keys(permissionConfigForm.value.selectedNodes)
    .filter(nodeId => permissionConfigForm.value.selectedNodes[nodeId])
  
  // 构建流程角色配置
  const processRoles = selectedNodeIds.map(nodeId => {
    const node = processNodes.value.find(n => n.id === nodeId)
    const process = businessProcesses.value.find(p => p.id === node.processId)
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
  
  // 更新角色
  const updatedRole = {
    ...selectedRole.value,
    processRoles: processRoles,
    permissions: Array.from(allPermissionIds),
    dataRules: Array.from(allDataRuleIds),
    containerScope: permissionConfigForm.value.selectedContainers
  }
  
  // 更新角色数据
  const newRoles = roles.value.map(role => {
    if (role.id === updatedRole.id) {
      return updatedRole
    }
    return role
  })
  
  roles.value = newRoles
  permissionDialogVisible.value = false
  ElMessage.success('工作权限配置成功，角色已获得所选环节的所有权限')
}
</script>

<style scoped>
.new-role-management {
  width: 100%;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.page-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.page-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-buttons {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 5px;
}

.empty-text {
  color: #909399;
  font-style: italic;
}

/* 权限配置对话框 */
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

/* 业务选择样式 */
.business-section {
  margin-bottom: 30px;
}

.business-section h4 {
  margin-bottom: 20px;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
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

/* 流程选择样式 */
.process-section {
  margin-bottom: 30px;
}

.process-section h4 {
  margin-bottom: 20px;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
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

/* 环节选择样式 */
.node-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed #ebeef5;
}

.node-section h6 {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: #303133;
  font-weight: 600;
}

.node-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-left: 0;
}

.node-item {
  margin-bottom: 0;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.node-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.node-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.node-name {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
}

.node-order {
  font-size: 12px;
  color: #909399;
  background-color: #f5f7fa;
  padding: 2px 8px;
  border-radius: 10px;
}

.node-desc {
  font-size: 13px;
  color: #606266;
  margin-left: 0;
  margin-top: 5px;
  line-height: 1.4;
}

/* 权限预览样式 */
.permission-preview-list {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.permission-tag {
  margin-bottom: 8px;
}

/* 空状态样式 */
.empty-state {
  margin-top: 50px;
  text-align: center;
}

/* 容器面板样式 */
.container-panel {
  width: 25%;
  padding: 20px;
  border-right: 1px solid #ebeef5;
  overflow-y: auto;
}

/* 树形结构样式 */
.container-tree-container {
  margin-top: 20px;
}

.container-tree {
  background-color: #fff;
  border-radius: 4px;
  padding: 10px;
}

.tree-node-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.node-info {
  display: flex;
  align-items: center;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .permission-config-container {
    flex-direction: column;
  }
  
  .left-panel,
  .middle-panel,
  .container-panel,
  .right-panel {
    width: 100%;
    border-right: none;
  }
}

@media (min-width: 1200px) {
  .left-panel {
    width: 20%;
  }
  
  .middle-panel {
    width: 25%;
  }
  
  .container-panel {
    width: 25%;
  }
  
  .right-panel {
    width: 30%;
  }
}

@media (max-width: 768px) {
  .business-cards {
    flex-direction: column;
  }
  
  .business-card {
    min-width: auto;
  }
  
  .permission-preview-list {
    justify-content: center;
  }
}

/* 权限标签样式优化 */
.permission-tag {
  cursor: pointer;
  transition: all 0.3s ease;
}

.permission-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 标题样式优化 */
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

/* 高级Tooltip样式 */
.advanced-tooltip {
  max-width: 400px;
  max-height: 600px;
  overflow-y: auto;
  line-height: 1.6;
  background-color: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 12px 16px;
  font-size: 14px;
  scrollbar-width: thin;
  scrollbar-color: #c0c4cc transparent;
}

/* 滚动条样式 */
.advanced-tooltip::-webkit-scrollbar {
  width: 6px;
}

.advanced-tooltip::-webkit-scrollbar-track {
  background: transparent;
}

.advanced-tooltip::-webkit-scrollbar-thumb {
  background-color: #c0c4cc;
  border-radius: 3px;
  border: 2px solid transparent;
}

.advanced-tooltip::-webkit-scrollbar-thumb:hover {
  background-color: #909399;
}

/* Tooltip通用样式 */
.tooltip-section {
  margin-bottom: 8px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 8px;
}

.tooltip-section:last-child {
  margin-bottom: 0;
}

.tooltip-section strong {
  color: #303133;
  font-weight: 600;
  min-width: 80px;
  flex-shrink: 0;
}

.tooltip-section span {
  color: #606266;
  flex: 1;
  word-break: break-word;
}

/* Tooltip分隔线 */
.tooltip-divider {
  height: 1px;
  background-color: #ebeef5;
  margin: 10px 0;
}

/* 数据规则Tooltip样式 */
.data-rule-tooltip {
}

/* 配置条件样式 */
.conditions {
  margin-top: 5px;
  margin-left: 0;
  width: 100%;
}

.condition-item {
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  width: 100%;
}

.condition-label {
  color: #606266;
}

.condition-operator {
  color: #409eff;
  font-weight: 500;
  background-color: rgba(64, 158, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.condition-value {
  color: #67c23a;
  font-weight: 500;
  background-color: rgba(103, 194, 58, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.condition-relation {
  color: #909399;
  margin-right: 6px;
  font-size: 13px;
}

.empty-condition {
  color: #909399;
  font-style: italic;
}

/* 附加信息样式 */
.additional-info {
  background-color: #f0f9eb;
  padding: 10px;
  border-radius: 6px;
  margin-top: 8px;
}

.additional-info-content {
  margin-top: 5px;
}

.additional-info-content p {
  margin: 5px 0;
  color: #67c23a;
  font-size: 13px;
  line-height: 1.5;
}

/* 页面权限Tooltip样式 */
.page-permission-tooltip {
}

/* 按钮权限Tooltip样式 */
.button-permission-tooltip {
}

/* API链样式 */
.api-chain-list {
  margin-top: 5px;
  width: 100%;
}

.api-chain-item {
  margin-bottom: 4px;
  color: #606266;
  font-size: 13px;
  padding-left: 12px;
  position: relative;
}

.api-chain-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #409eff;
  font-weight: bold;
}

.empty-api-chain {
  color: #909399;
  font-style: italic;
  font-size: 13px;
}

/* API权限Tooltip样式 */
.api-permission-tooltip {
}

/* API URL样式 */
.api-url {
  display: flex;
  align-items: center;
  gap: 6px;
  /* 移除width: 100%，让容器自适应内容宽度 */
}

/* 使用更具体的选择器，提高样式优先级 */
.advanced-tooltip .api-url .api-method {
  color: #ffffff !important;
  padding: 2px 3px !important;
  border-radius: 3px;
  font-size: 9px !important;
  font-weight: 600;
  min-width: 24px !important;
  width: auto !important;
  max-width: 30px !important;
  text-align: center;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  letter-spacing: 0px !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  /* 确保没有固定宽度导致容器过宽 */
  /* 使用!important确保样式优先级最高 */
  /* 进一步缩小内边距、字体大小和字间距 */
}

/* 不同HTTP方法的样式，使用具体选择器 */
.advanced-tooltip .api-url .api-method.GET {
  background-color: #67c23a;
}

.advanced-tooltip .api-url .api-method.POST {
  background-color: #409eff;
}

.advanced-tooltip .api-url .api-method.PUT {
  background-color: #e6a23c;
}

.advanced-tooltip .api-url .api-method.DELETE {
  background-color: #f56c6c;
}

.advanced-tooltip .api-url .api-method.PATCH {
  background-color: #909399;
}

.advanced-tooltip .api-url .api-method.OPTIONS {
  background-color: #909399;
}

/* API路径样式，使用具体选择器 */
.advanced-tooltip .api-url .api-path {
  color: #303133 !important;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  background-color: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  flex: 1;
  word-break: break-all;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  /* 调整字体颜色为更深的灰色，提高可读性 */
}

/* 数据权限区域样式 */
.data-permission-section {
  margin-top: 8px;
  width: 100%;
}

.data-rule-item {
  margin-bottom: 15px;
  padding: 12px;
  background-color: #f0f9eb;
  border: 1px solid #e1f3d8;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.data-rule-item:hover {
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.15);
}

.data-rule-item:last-child {
  margin-bottom: 0;
}

.data-rule-header {
  margin-bottom: 10px;
}

.data-rule-header strong {
  color: #67c23a;
  font-weight: 600;
  font-size: 14px;
  display: block;
  margin-bottom: 3px;
}

.data-rule-header .rule-description {
  color: #606266;
  font-size: 12px;
  display: block;
}

/* 数据规则来源环节 */
.data-rule-sources {
  margin-bottom: 8px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.source-nodes {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.source-node-tag {
  margin: 2px 0;
}

/* 数据对象 */
.data-rule-object {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.object-type {
  color: #409eff;
  font-weight: 500;
  background-color: rgba(64, 158, 255, 0.1);
  padding: 2px 6px;
  border-radius: 3px;
}

/* 配置条件区域优化 */
.data-rule-conditions {
  margin-bottom: 12px;
}

.conditions-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.conditions-container {
  background-color: #fafafa;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 12px;
}

.condition-group {
  margin-bottom: 10px;
}

.condition-group-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding: 6px 10px;
  background-color: #ecf5ff;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  color: #409eff;
}

.condition-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 0;
}

.condition-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.condition-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.condition-item-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  font-size: 13px;
}

.condition-label {
  color: #303133;
  font-weight: 500;
  min-width: 60px;
}

.condition-operator {
  color: #409eff;
  font-weight: 600;
  background-color: rgba(64, 158, 255, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.condition-value {
  color: #67c23a;
  font-weight: 600;
  background-color: rgba(103, 194, 58, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  flex: 1;
  text-align: left;
}

.condition-separator {
  color: #909399;
  font-size: 12px;
  margin: 0 4px;
}

.condition-leaf:first-child::after {
  top: 15px;
}

.condition-leaf:last-child::after {
  height: 15px;
}

.condition-leaf-content {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.condition-leaf-content .condition-label {
  color: #606266;
  font-size: 13px;
}

.condition-leaf-content .condition-operator {
  color: #409eff;
  font-weight: 500;
  font-size: 13px;
  background-color: rgba(64, 158, 255, 0.1);
  padding: 2px 6px;
  border-radius: 3px;
}

.condition-leaf-content .condition-value {
  color: #67c23a;
  font-weight: 500;
  font-size: 13px;
  background-color: rgba(103, 194, 58, 0.1);
  padding: 2px 6px;
  border-radius: 3px;
}

/* 权限范围说明 */
.permission-scope {
  background-color: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 10px;
}

.scope-title {
  margin-bottom: 8px;
  font-size: 13px;
}

.scope-list {
  margin: 0;
  padding-left: 20px;
  color: #606266;
  font-size: 13px;
  line-height: 1.6;
}

.scope-list li {
  margin-bottom: 4px;
}

.scope-list li:last-child {
  margin-bottom: 0;
}

/* 无数据规则提示 */
.no-data-rules {
  color: #909399;
  font-style: italic;
  font-size: 13px;
  text-align: center;
  padding: 15px;
  background-color: #f5f7fa;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
}

/* 默认权限规则样式 */
.default-permission-rules {
  margin-top: 12px;
  background-color: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 10px;
}

.default-rules-title {
  margin-bottom: 8px;
  font-size: 13px;
}

.default-rules-list {
  margin: 0;
  padding-left: 20px;
  color: #606266;
  font-size: 13px;
  line-height: 1.6;
}

.default-rules-list li {
  margin-bottom: 4px;
}

.default-rules-list li:last-child {
  margin-bottom: 0;
}

/* 最终权限范围样式 */
.final-permission-scope {
  margin-top: 12px;
  background-color: #ecf5ff;
  border: 1px solid #d9ecff;
  border-radius: 6px;
  padding: 10px;
}

.final-scope-title {
  margin-bottom: 6px;
  font-size: 13px;
  color: #303133;
}

.final-scope-formula {
  color: #409eff;
  font-weight: 500;
  font-size: 13px;
  text-align: center;
  padding: 8px;
  background-color: #ffffff;
  border-radius: 4px;
  border: 1px dashed #409eff;
}

/* 优化高级Tooltip的最大宽度 */
.api-permission-tooltip {
  max-width: 400px;
}

/* 权限关系说明样式 */
.permission-relationship {
  margin-top: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  margin-bottom: 20px;
}

.permission-relationship h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.permission-relationship p {
  margin: 0 0 10px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.permission-relationship ul {
  margin-left: 20px;
  margin-bottom: 15px;
  padding-left: 0;
}

.permission-relationship li {
  margin-bottom: 8px;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  list-style-type: disc;
}

.permission-relationship strong {
  color: #303133;
  font-weight: 600;
}
</style>