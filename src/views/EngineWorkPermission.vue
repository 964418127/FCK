<template>
  <div class="engine-work-permission">
    <div class="page-header">
      <div>
        <h2>自动化引擎工作权限</h2>
        <p>为角色分配自动化引擎业务和流程节点的权限</p>
      </div>
    </div>
    
    <div class="page-content">
      <el-card shadow="hover">
        <el-table :data="roles" border stripe style="width: 100%">
          <el-table-column prop="name" label="角色名称" min-width="150" />
          <el-table-column prop="description" label="角色描述" min-width="300" />
          <el-table-column label="角色类型" width="120">
            <template #default="scope">
              <el-tag :type="getRoleTypeTagType(scope.row.type)" size="small">
                {{ getRoleTypeLabel(scope.row.type) }}
              </el-tag>
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
              <el-button 
                type="primary" 
                size="small" 
                @click="handleConfigurePermission(scope.row)"
                style="margin-right: 5px"
              >
                配置工作权限
              </el-button>
              <el-button 
                type="success" 
                size="small" 
                @click="handleConfigureContainerScope(scope.row)"
              >
                容器范围
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
    
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
                v-for="business in engineBusinessList" 
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
            <div v-if="engineBusinessList.length === 0" class="empty-state">
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
                    <h6>选择要参与的环节（仅显示 task 和 approval 节点）</h6>
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
                            <span class="node-name">{{ node.label || node.name }}</span>
                            <el-tag 
                              :type="node.type === 'task' ? 'primary' : 'success'"
                              size="small"
                            >
                              {{ node.type === 'task' ? '任务' : '审批' }}
                            </el-tag>
                          </div>
                          <div class="node-desc">{{ node.description || '无描述' }}</div>
                        </el-checkbox>
                      </div>
                      <div v-if="getProcessNodes(process.id).length === 0" class="empty-text" style="text-align: center; padding: 20px;">
                        该流程中暂无人工节点
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
                          <span>{{ perm.productPort || '无' }}</span>
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
                          <span>{{ perm.productPort || '无' }}</span>
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
                          <span>{{ perm.productPort || '无' }}</span>
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
    
    <!-- 容器范围配置对话框 -->
    <el-dialog
      v-model="containerScopeDialogVisible"
      :title="containerScopeDialogTitle"
      width="1000px"
      fullscreen
    >
      <div class="container-scope-dialog">
        <el-card shadow="hover" class="container-scope-card">
          <template #header>
            <div class="card-header">
              <div>
                <h3>选择可管理的业务容器范围</h3>
                <p class="header-desc">勾选角色可以管理的业务容器，支持多选，支持树形结构展示</p>
              </div>
            </div>
          </template>
          
          <!-- 容器类型过滤 -->
          <div class="container-filter">
            <el-select v-model="containerType" placeholder="请选择容器类型" style="width: 180px; margin-right: 20px">
              <el-option label="全部" value="" />
              <el-option label="全国" value="COUNTRY" />
              <el-option label="大区" value="REGION" />
              <el-option label="省" value="PROVINCE" />
              <el-option label="市" value="CITY" />
              <el-option label="区" value="DISTRICT" />
              <el-option label="商圈" value="BUSINESS_AREA" />
              <el-option label="CBD" value="CBD" />
              <el-option label="门店" value="STORE" />
            </el-select>
            <el-input 
              v-model="containerSearchKeyword" 
              placeholder="请输入容器名称或编码" 
              style="width: 300px"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          
          <!-- 两列布局：左侧树形结构，右侧已选容器预览 -->
          <div class="container-scope-content">
            <!-- 左侧：业务容器树形展示 -->
            <div class="container-tree-wrapper">
              <h4 class="tree-title">业务容器树</h4>
              <div class="container-tree-container">
                <el-tree
                  ref="containerTreeRef"
                  :data="filteredContainerTree"
                  :props="containerTreeProps"
                  node-key="id"
                  show-checkbox
                  :default-checked-keys="containerScopeForm.selectedContainers"
                  @check="handleContainerCheck"
                  default-expand-all
                  class="container-tree"
                >
                  <template #default="{ node, data }">
                    <div class="tree-node-content">
                      <div class="node-info">
                        <el-tag 
                          size="small" 
                          :type="getContainerTypeTagType(data.type)"
                          style="margin-right: 8px"
                        >
                          {{ getContainerTypeLabel(data.type) }}
                        </el-tag>
                        <span class="node-name">{{ node.label }}</span>
                        <span v-if="data.code" class="node-code">({{ data.code }})</span>
                      </div>
                    </div>
                  </template>
                </el-tree>
              </div>
            </div>
            
            <!-- 右侧：已选容器预览 -->
            <div class="selected-containers-wrapper">
              <h4 class="preview-title">已选容器预览</h4>
              <div class="selected-containers-preview">
                <div class="selected-count">
                  <el-tag type="info" size="large">
                    已选择 <strong>{{ containerScopeForm.selectedContainers.length }}</strong> 个容器
                  </el-tag>
                </div>
                <div class="selected-containers-list">
                  <el-tag
                    v-for="containerId in containerScopeForm.selectedContainers"
                    :key="containerId"
                    :type="getContainerTypeTagType(getContainerById(containerId)?.type)"
                    size="default"
                    closable
                    @close="removeContainer(containerId)"
                    class="container-tag"
                  >
                    <span class="tag-type">{{ getContainerTypeLabel(getContainerById(containerId)?.type) }}</span>
                    <span class="tag-name">{{ getContainerById(containerId)?.name || containerId }}</span>
                  </el-tag>
                  <div v-if="containerScopeForm.selectedContainers.length === 0" class="empty-state">
                    <el-empty description="未选择任何容器" :image-size="100" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="containerScopeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveContainerScope">保存配置</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

// 角色列表
const roles = ref([])

// 自动化引擎业务列表
const engineBusinessList = ref([])

// 自动化引擎流程列表（业务ID -> 流程列表）
const engineProcessListMap = ref({})

// 自动化引擎节点列表（流程ID -> 节点列表）
const engineNodeListMap = ref({})

// 权限配置对话框
const permissionDialogVisible = ref(false)
const permissionDialogTitle = ref('配置工作权限')
const selectedRole = ref(null)
const previewActiveTab = ref('page')

// 容器范围相关
const businessContainers = ref([])
const containerType = ref('')
const containerSearchKeyword = ref('')
const containerTreeRef = ref(null)
const containerTreeProps = {
  label: 'name',
  children: 'children'
}

// 权限配置表单
const permissionConfigForm = ref({
  selectedBusinessId: '',
  selectedProcesses: {},
  selectedNodes: {}
})

// 容器范围配置对话框
const containerScopeDialogVisible = ref(false)
const containerScopeDialogTitle = ref('配置容器范围')
const selectedRoleForContainer = ref(null)
const containerScopeForm = ref({
  selectedContainers: []
})

// 权限预览数据
const previewPermissions = ref({
  page: [],
  button: [],
  api: [],
  dataRule: []
})

// 加载角色列表
const loadRoles = async () => {
  // TODO: 从API加载所有类型的角色（平台超管、认证用户、品牌角色）
  try {
    const { roles: mockRoles } = await import('../mock/data.js')
    roles.value = mockRoles.map(role => ({
      ...role,
      type: 'platform-admin' // 平台超管
    }))
  } catch (e) {
    console.error('加载角色列表失败:', e)
    roles.value = []
  }
}

// 加载自动化引擎业务列表
const loadEngineBusinessList = () => {
  // 从本地存储加载业务列表（与 EngineBusiness.vue 共享数据）
  // TODO: 从API加载
  try {
    const savedBusinesses = localStorage.getItem('engine_business_list')
    if (savedBusinesses) {
      engineBusinessList.value = JSON.parse(savedBusinesses)
    } else {
      // 使用示例数据
      engineBusinessList.value = [
        {
          id: 1,
          code: 'order_process',
          name: '订单处理业务',
          description: '处理订单的自动化业务流程',
          status: 'active'
        },
        {
          id: 2,
          code: 'refund_process',
          name: '退款处理业务',
          description: '处理退款的自动化业务流程',
          status: 'active'
        }
      ]
    }
  } catch (e) {
    console.error('加载业务列表失败:', e)
    engineBusinessList.value = []
  }
  
  // 加载每个业务的流程列表
  engineBusinessList.value.forEach(business => {
    loadEngineProcessList(business.id)
  })
}

// 加载自动化引擎流程列表
const loadEngineProcessList = (businessId) => {
  // 从本地存储加载流程列表（与 EngineBusiness.vue 共享数据）
  // TODO: 从API加载
  if (!engineProcessListMap.value[businessId]) {
    try {
      const savedProcesses = localStorage.getItem(`engine_process_list_${businessId}`)
      if (savedProcesses) {
        engineProcessListMap.value[businessId] = JSON.parse(savedProcesses)
      } else {
        // 使用示例数据
        engineProcessListMap.value[businessId] = [
          {
            id: 1,
            businessId: businessId,
            code: 'order_create_flow',
            name: '订单创建流程',
            description: '订单创建自动化流程',
            version: '1.0.0',
            status: 'active'
          }
        ]
      }
    } catch (e) {
      console.error('加载流程列表失败:', e)
      engineProcessListMap.value[businessId] = []
    }
    
    // 加载每个流程的节点列表
    engineProcessListMap.value[businessId].forEach(process => {
      loadEngineNodeList(businessId, process.id)
    })
  }
}

// 加载自动化引擎节点列表
const loadEngineNodeList = (businessId, processId) => {
  // 从本地存储加载流程设计数据（节点和连线）
  // 使用与 EngineProcessDesigner.vue 相同的 key 格式
  const draftKey = `engine_process_draft_${businessId}_${processId}`
  const savedDraft = localStorage.getItem(draftKey)
  
  if (savedDraft) {
    try {
      const draft = JSON.parse(savedDraft)
      if (draft.nodes) {
        // 只保留人工节点（task），并确保包含完整的权限配置
        engineNodeListMap.value[processId] = draft.nodes
          .filter(node => node.type === 'task')
          .map(node => ({
            ...node,
            processId: processId, // 确保 processId 存在
            // 确保 productConfigs 存在且格式正确
            productConfigs: node.productConfigs || []
          }))
      } else {
        engineNodeListMap.value[processId] = []
      }
    } catch (e) {
      console.error('加载流程节点失败:', e)
      engineNodeListMap.value[processId] = []
    }
  } else {
    // 如果没有保存的配置，使用示例数据（包含完整的权限配置结构，仅任务节点）
    // 使用与 mock/data.js 中实际存在的权限ID
    engineNodeListMap.value[processId] = [
      {
        id: `node_${processId}_1`,
        processId: processId,
        type: 'task',
        label: '订单审核任务',
        name: '订单审核任务',
        description: '审核订单信息',
        productConfigs: [
          {
            id: 'config_1',
            productPort: '服务订单系统(app)',
            permissionIds: [
              'perm-6', // 订单管理页面
              'perm-6-2', // 查看订单详情按钮
              'perm-6-3', // 处理订单按钮
              'perm-api-6', // 获取订单列表API
              'perm-api-7' // 获取优惠券列表API
            ],
            apiConfigs: [
              {
                apiId: 'perm-api-6',
                dataRuleIds: ['rule-12'] // 使用现有的订单数据规则（广州地区订单规则）
              },
              {
                apiId: 'perm-api-7',
                dataRuleIds: []
              }
            ]
          }
        ]
      }
    ]
  }
}

// 获取业务下的流程列表
const getBusinessProcesses = (businessId) => {
  return engineProcessListMap.value[businessId] || []
}

// 获取流程节点（仅显示 task 和 approval 节点）
const getProcessNodes = (processId) => {
  return (engineNodeListMap.value[processId] || []).filter(node => 
    node.type === 'task'
  )
}

// 获取流程名称
const getProcessName = (processId) => {
  for (const businessId in engineProcessListMap.value) {
    const process = engineProcessListMap.value[businessId].find(p => p.id === processId)
    if (process) return process.name
  }
  return '未知流程'
}

// 根据流程ID获取业务名称
const getBusinessNameByProcess = (processId) => {
  for (const businessId in engineProcessListMap.value) {
    const process = engineProcessListMap.value[businessId].find(p => p.id === processId)
    if (process) {
      const business = engineBusinessList.value.find(b => b.id === parseInt(businessId))
      return business ? business.name : '未知业务'
    }
  }
  return '未知业务'
}

// 获取参与的业务
const getParticipatingBusinesses = (role) => {
  const businessIds = new Set()
  
  // 从processRoles中提取关联的业务
  role.processRoles?.forEach(pr => {
    // 从节点中找到对应的流程和业务
    for (const businessId in engineProcessListMap.value) {
      const process = engineProcessListMap.value[businessId].find(p => p.id === pr.processId)
      if (process) {
        businessIds.add(parseInt(businessId))
        break
      }
    }
  })
  
  return engineBusinessList.value.filter(b => businessIds.has(b.id))
}

// 获取角色类型标签类型
const getRoleTypeTagType = (type) => {
  const typeMap = {
    'platform-admin': 'warning',
    'certified': 'success',
    'brand': 'primary'
  }
  return typeMap[type] || 'info'
}

// 获取角色类型标签文本
const getRoleTypeLabel = (type) => {
  const labelMap = {
    'platform-admin': '平台超管',
    'certified': '认证用户',
    'brand': '品牌角色'
  }
  return labelMap[type] || '未知'
}

// 获取API方法的标签类型
const getApiMethodTagType = (method) => {
  const methodUpper = (method || 'GET').toUpperCase()
  const map = {
    'GET': 'success',
    'POST': 'primary',
    'PUT': 'warning',
    'DELETE': 'danger',
    'PATCH': 'info'
  }
  return map[methodUpper] || 'info'
}

// 选择业务
const selectBusiness = (businessId) => {
  // 如果已经选中当前业务，则取消选择
  if (permissionConfigForm.value.selectedBusinessId === businessId) {
    permissionConfigForm.value.selectedBusinessId = ''
  } else {
    permissionConfigForm.value.selectedBusinessId = businessId
  }
  
  // 重置流程和节点选择
  permissionConfigForm.value.selectedProcesses = {}
  permissionConfigForm.value.selectedNodes = {}
  
  // 更新预览权限
  updatePreviewPermissions()
}

// 流程选择变化
const handleProcessChange = (processId) => {
  // 如果取消选择流程，移除该流程下的所有节点选择
  if (!permissionConfigForm.value.selectedProcesses[processId]) {
    const nodes = getProcessNodes(processId)
    nodes.forEach(node => {
      delete permissionConfigForm.value.selectedNodes[node.id]
    })
  }
  
  // 更新预览权限
  updatePreviewPermissions()
}

// 节点选择变化
const handleNodeChange = () => {
  updatePreviewPermissions()
}

// 更新预览权限
const updatePreviewPermissions = async () => {
  // 获取所有选中的节点
  const selectedNodeIds = Object.keys(permissionConfigForm.value.selectedNodes)
    .filter(nodeId => permissionConfigForm.value.selectedNodes[nodeId])
  
  // 获取这些节点的权限
  const allPermissionIds = new Set()
  const allDataRuleIds = new Set()
  const apiDataRuleMap = new Map() // API ID -> 数据规则ID列表的映射
  
  selectedNodeIds.forEach(nodeId => {
    // 找到节点
    let node = null
    for (const processId in engineNodeListMap.value) {
      node = engineNodeListMap.value[processId].find(n => n.id === nodeId)
      if (node) break
    }
    
    if (node && node.productConfigs) {
      // 从节点的 productConfigs 中提取权限ID
      node.productConfigs.forEach(config => {
        if (config.permissionIds) {
          config.permissionIds.forEach(permId => allPermissionIds.add(permId))
        }
        // 从 apiConfigs 中提取数据规则，并建立 API 与数据规则的关联
        if (config.apiConfigs) {
          config.apiConfigs.forEach(apiConfig => {
            if (apiConfig.apiId) {
              if (!apiDataRuleMap.has(apiConfig.apiId)) {
                apiDataRuleMap.set(apiConfig.apiId, new Set())
              }
              if (apiConfig.dataRuleIds) {
                apiConfig.dataRuleIds.forEach(ruleId => {
                  allDataRuleIds.add(ruleId)
                  apiDataRuleMap.get(apiConfig.apiId).add(ruleId)
                })
              }
            }
          })
        }
      })
    }
  })
  
  // 加载权限数据
  try {
    const { permissions: allPerms, dataRules: allRules } = await import('../mock/data.js')
    
    // 分类权限
    const pagePermissions = []
    const buttonPermissions = []
    const apiPermissions = []
    
    // 保存所有FUNCTION权限，用于后续处理API关联
    const functionPermissions = []
    
    Array.from(allPermissionIds).forEach(permId => {
      const perm = allPerms.find(p => p.id === permId)
      if (perm) {
        if (perm.type === 'PAGE') {
          pagePermissions.push(perm)
        } else if (perm.type === 'FUNCTION') {
          buttonPermissions.push(perm)
          functionPermissions.push(perm)
        } else if (perm.type === 'API') {
          // 为 API 权限添加关联的数据规则信息
          const ruleIds = apiDataRuleMap.get(permId) || new Set()
          apiPermissions.push({
            ...perm,
            _dataRuleIds: Array.from(ruleIds) // 保存关联的数据规则ID
          })
        }
      }
    })
    
    // 处理FUNCTION权限关联的API权限
    functionPermissions.forEach(funcPerm => {
      if (funcPerm.apiPermissions && funcPerm.apiPermissions.length > 0) {
        funcPerm.apiPermissions.forEach(apiPermId => {
          const apiPerm = allPerms.find(p => p.id === apiPermId)
          if (apiPerm && apiPerm.type === 'API') {
            // 检查API是否已经在列表中
            const existingIndex = apiPermissions.findIndex(p => p.id === apiPerm.id)
            if (existingIndex === -1) {
              // 为 API 权限添加关联的数据规则信息
              const ruleIds = apiDataRuleMap.get(apiPermId) || new Set()
              apiPermissions.push({
                ...apiPerm,
                _dataRuleIds: Array.from(ruleIds)
              })
            }
          }
        })
      }
    })
    
    // 获取数据规则（包含来源信息）
    const dataRulePermissions = Array.from(allDataRuleIds).map(ruleId => {
      const rule = allRules.find(r => r.id === ruleId)
      if (!rule) return null
      
      // 添加来源信息（从哪些节点来的）
      const fromNodes = []
      selectedNodeIds.forEach(nodeId => {
        let node = null
        for (const processId in engineNodeListMap.value) {
          node = engineNodeListMap.value[processId].find(n => n.id === nodeId)
          if (node) break
        }
        
        if (node && node.productConfigs) {
          node.productConfigs.forEach(config => {
            if (config.apiConfigs) {
              config.apiConfigs.forEach(apiConfig => {
                if (apiConfig.dataRuleIds && apiConfig.dataRuleIds.includes(ruleId)) {
                  // 找到对应的流程和业务
                  const process = engineProcessListMap.value[permissionConfigForm.value.selectedBusinessId]
                    ?.find(p => {
                      const nodes = getProcessNodes(p.id)
                      return nodes.some(n => n.id === nodeId)
                    })
                  const business = engineBusinessList.value.find(b => b.id === permissionConfigForm.value.selectedBusinessId)
                  
                  fromNodes.push({
                    nodeId: nodeId,
                    businessName: business?.name || '未知业务',
                    processName: process?.name || '未知流程',
                    nodeName: node.label || node.name || '未知节点'
                  })
                }
              })
            }
          })
        }
      })
      
      return {
        ...rule,
        fromNodes: fromNodes
      }
    }).filter(Boolean)
    
    // 更新预览数据
    previewPermissions.value = {
      page: pagePermissions,
      button: buttonPermissions,
      api: apiPermissions,
      dataRule: dataRulePermissions
    }
  } catch (e) {
    console.error('加载权限数据失败:', e)
  }
}

// 获取按钮API链
const getButtonApiChain = (buttonPermId) => {
  // 从预览数据中查找按钮权限
  const buttonPerm = previewPermissions.value.button.find(p => p.id === buttonPermId)
  if (buttonPerm && buttonPerm.apiPermissions) {
    return buttonPerm.apiPermissions.map(apiPermId => {
      const apiPerm = previewPermissions.value.api.find(p => p.id === apiPermId)
      if (apiPerm) {
        return `${apiPerm.method || 'GET'} ${apiPerm.apiUrl || ''}`
      }
      return ''
    }).filter(Boolean)
  }
  return []
}

// 获取关联的按钮
const getAssociatedButtons = (apiPermId) => {
  // 从预览数据中查找关联的按钮权限
  return previewPermissions.value.button.filter(p => 
    p.apiPermissions && 
    p.apiPermissions.includes(apiPermId)
  )
}

// 获取关联的数据规则
const getAssociatedDataRules = (apiPermId) => {
  // 从预览数据中查找该 API 关联的数据规则
  const apiPerm = previewPermissions.value.api.find(p => p.id === apiPermId)
  if (!apiPerm || !apiPerm._dataRuleIds) {
    return []
  }
  
  // 根据数据规则ID查找完整的数据规则信息
  return previewPermissions.value.dataRule.filter(rule => 
    apiPerm._dataRuleIds.includes(rule.id)
  )
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

// 初始化权限配置表单
const initializePermissionConfigForm = () => {
  // 初始化表单
  permissionConfigForm.value = {
    selectedBusinessId: '',
    selectedProcesses: {},
    selectedNodes: {}
  }
  
  // 从processRoles中提取关联的业务、流程和节点
  if (selectedRole.value.processRoles?.length > 0) {
    // 获取第一个关联的业务作为默认选择
    const firstProcessRole = selectedRole.value.processRoles[0]
    // 找到对应的业务
    for (const businessId in engineProcessListMap.value) {
      const process = engineProcessListMap.value[businessId].find(p => p.id === firstProcessRole.processId)
      if (process) {
        permissionConfigForm.value.selectedBusinessId = parseInt(businessId)
        break
      }
    }
    
    // 设置已关联的流程和节点
    selectedRole.value.processRoles.forEach(pr => {
      permissionConfigForm.value.selectedProcesses[pr.processId] = true
      permissionConfigForm.value.selectedNodes[pr.nodeId] = true
    })
  }
  
  // 更新预览权限
  updatePreviewPermissions()
}

// 保存权限配置
const handleSavePermissionConfig = () => {
  // 获取所有选中的节点
  const selectedNodeIds = Object.keys(permissionConfigForm.value.selectedNodes)
    .filter(nodeId => permissionConfigForm.value.selectedNodes[nodeId])
  
  // 构建流程角色配置
  const processRoles = selectedNodeIds.map(nodeId => {
    // 找到节点
    let node = null
    let processId = null
    for (const pid in engineNodeListMap.value) {
      node = engineNodeListMap.value[pid].find(n => n.id === nodeId)
      if (node) {
        processId = pid
        break
      }
    }
    
    if (!node) return null
    
    // 从节点的 productConfigs 中提取所有权限ID
    const permissionIds = new Set()
    const dataRuleIds = new Set()
    if (node.productConfigs) {
      node.productConfigs.forEach(config => {
        if (config.permissionIds) {
          config.permissionIds.forEach(permId => permissionIds.add(permId))
        }
        if (config.apiConfigs) {
          config.apiConfigs.forEach(apiConfig => {
            if (apiConfig.dataRuleIds) {
              apiConfig.dataRuleIds.forEach(ruleId => dataRuleIds.add(ruleId))
            }
          })
        }
      })
    }
    
    const process = engineProcessListMap.value[processId]?.find(p => p.id === parseInt(processId))
    const business = engineBusinessList.value.find(b => {
      return engineProcessListMap.value[b.id]?.some(p => p.id === parseInt(processId))
    })
    
    return {
      processId: parseInt(processId),
      nodeId: nodeId,
      permissionIds: Array.from(permissionIds),
      dataRuleIds: Array.from(dataRuleIds),
      description: `${business?.name || '未知业务'}-${process?.name || '未知流程'}-${node.label || node.name || '未知节点'}`
    }
  }).filter(Boolean)
  
  // 合并权限：将所有流程节点的权限合并到角色的基础权限中
  const allPermissionIds = new Set([...(selectedRole.value.permissions || [])])
  const allDataRuleIds = new Set([...(selectedRole.value.dataRules || [])])
  
  // 添加流程节点的权限
  processRoles.forEach(pr => {
    pr.permissionIds.forEach(permId => allPermissionIds.add(permId))
    pr.dataRuleIds.forEach(ruleId => allDataRuleIds.add(ruleId))
  })
  
  // 更新角色
  const updatedRole = {
    ...selectedRole.value,
    processRoles: processRoles,
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
  permissionDialogVisible.value = false
  ElMessage.success('工作权限配置成功，角色已获得所选节点的所有权限')
}

// 打开容器范围配置对话框
const handleConfigureContainerScope = (role) => {
  selectedRoleForContainer.value = JSON.parse(JSON.stringify(role))
  containerScopeForm.value = {
    selectedContainers: role.containerScope || []
  }
  containerScopeDialogTitle.value = `配置 ${role.name} 的容器范围`
  containerScopeDialogVisible.value = true
}

// 保存容器范围配置
const handleSaveContainerScope = () => {
  // 更新角色
  const updatedRole = {
    ...selectedRoleForContainer.value,
    containerScope: containerScopeForm.value.selectedContainers
  }
  
  // 更新角色数据
  const newRoles = roles.value.map(role => {
    if (role.id === updatedRole.id) {
      return updatedRole
    }
    return role
  })
  
  roles.value = newRoles
  containerScopeDialogVisible.value = false
  ElMessage.success('容器范围配置保存成功')
}

// 构建容器树形结构
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

// 过滤后的业务容器列表
const filteredContainersList = computed(() => {
  let result = [...businessContainers.value]
  
  // 按搜索关键词过滤
  if (containerSearchKeyword.value) {
    const keyword = containerSearchKeyword.value.toLowerCase()
    result = result.filter(container => 
      container.name.toLowerCase().includes(keyword) || 
      container.code?.toLowerCase().includes(keyword)
    )
  }
  
  // 按容器类型过滤
  if (containerType.value) {
    result = result.filter(container => container.type === containerType.value)
  }
  
  return result
})

// 业务容器树形结构
const filteredContainerTree = computed(() => {
  return buildContainerTree(filteredContainersList.value)
})

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

// 根据ID获取容器
const getContainerById = (containerId) => {
  return businessContainers.value.find(c => c.id === containerId)
}

// 容器选择变化
const handleContainerCheck = (data, checkedInfo) => {
  // checkedInfo 包含 checkedNodes 和 halfCheckedNodes
  const checkedNodes = checkedInfo.checkedNodes || []
  const allCheckedIds = checkedNodes.map(node => node.id)
  
  // 更新选中的容器列表
  containerScopeForm.value.selectedContainers = allCheckedIds
}

// 移除容器
const removeContainer = (containerId) => {
  const index = containerScopeForm.value.selectedContainers.indexOf(containerId)
  if (index > -1) {
    containerScopeForm.value.selectedContainers.splice(index, 1)
  }
}

// 加载业务容器数据
const loadBusinessContainers = async () => {
  try {
    const { businessContainers: mockContainers } = await import('../mock/data.js')
    businessContainers.value = [...mockContainers]
  } catch (e) {
    console.error('加载业务容器数据失败:', e)
    businessContainers.value = []
  }
}

// 生命周期
onMounted(() => {
  loadRoles()
  loadEngineBusinessList()
  loadBusinessContainers()
})
</script>

<style scoped>
.engine-work-permission {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
}

.page-header p {
  margin: 5px 0 0 0;
  color: #909399;
  font-size: 14px;
}

.page-content {
  margin-top: 20px;
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
  cursor: pointer;
  transition: all 0.3s ease;
}

.permission-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 空状态样式 */
.empty-state {
  margin-top: 50px;
  text-align: center;
}

.empty-text {
  color: #909399;
  font-size: 12px;
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

/* API URL样式 */
.api-url {
  display: flex;
  align-items: center;
  gap: 6px;
}

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
}

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

.associated-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.associated-button-tag {
  margin: 2px 0;
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

/* 响应式设计 */
@media (max-width: 1200px) {
  .permission-config-container {
    flex-direction: column;
  }
  
  .left-panel,
  .middle-panel,
  .right-panel {
    width: 100%;
    border-right: none;
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

/* 容器范围样式 */
.container-scope-section {
  padding: 20px 0;
}

.container-scope-section .section-header {
  margin-bottom: 20px;
}

.container-scope-section .section-header h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.container-scope-section .section-header p {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.container-filter {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.container-tree-container {
  margin: 20px 0;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 4px;
  min-height: 300px;
  max-height: 500px;
  overflow-y: auto;
}

.container-tree {
  background-color: #fff;
  border-radius: 4px;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.tree-node-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.tree-node-content .node-info {
  display: flex;
  align-items: center;
}

.selected-containers-preview {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.selected-containers-preview h4 {
  margin: 0 0 15px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.selected-containers-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 40px;
  align-items: flex-start;
}

/* 容器范围对话框样式 */
.container-scope-dialog {
  padding: 20px;
  height: calc(100vh - 200px);
}

.container-scope-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.container-scope-card .el-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.header-desc {
  margin: 8px 0 0 0;
  font-size: 14px;
  color: #606266;
}

.container-scope-dialog .container-filter {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.container-scope-content {
  flex: 1;
  display: flex;
  gap: 20px;
  overflow: hidden;
  min-height: 0;
}

.container-tree-wrapper {
  flex: 1.5;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.tree-title {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  padding-bottom: 10px;
  border-bottom: 2px solid #409eff;
}

.container-scope-dialog .container-tree-container {
  flex: 1;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  overflow-y: auto;
  min-height: 0;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
}

.container-scope-dialog .container-tree {
  background-color: #fff;
  border-radius: 4px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.tree-node-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 4px 0;
}

.tree-node-content .node-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.node-name {
  font-size: 14px;
  color: #303133;
  margin-right: 8px;
}

.node-code {
  font-size: 12px;
  color: #909399;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.selected-containers-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 400px;
}

.preview-title {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  padding-bottom: 10px;
  border-bottom: 2px solid #67c23a;
}

.container-scope-dialog .selected-containers-preview {
  flex: 1;
  padding: 20px;
  background: linear-gradient(135deg, #f0f9eb 0%, #e8f5e9 100%);
  border-radius: 8px;
  border: 1px solid #e1f3d8;
  overflow-y: auto;
  min-height: 0;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.1);
}

.selected-count {
  margin-bottom: 20px;
  text-align: center;
}

.selected-count strong {
  font-size: 18px;
  color: #409eff;
}

.container-scope-dialog .selected-containers-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 40px;
}

.container-tag {
  padding: 8px 12px;
  font-size: 14px;
  border-radius: 6px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.container-tag:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tag-type {
  font-weight: 600;
  margin-right: 8px;
  padding: 2px 6px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.tag-name {
  font-weight: 500;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #909399;
}
</style>
