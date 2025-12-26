<template>
  <div class="permission-page">
    <div class="page-header">
      <h2>权限注册</h2>
      <p>管理系统中的目录、页面、功能/按钮和API权限</p>
    </div>
    
    <div class="page-content">
      <el-card shadow="hover" class="content-card">
        <template #header>
          <div class="card-header">
            <h3>权限列表</h3>
            <el-button type="primary" @click="handleAddPermission">
              <el-icon-plus /> 新增权限
            </el-button>
          </div>
        </template>
        <div class="permission-filter">
          <el-select v-model="permissionType" placeholder="请选择权限类型" style="width: 150px; margin-right: 20px">
            <el-option label="全部" value="" />
            <el-option label="目录" value="DIRECTORY" />
            <el-option label="页面" value="PAGE" />
            <el-option label="功能/按钮" value="FUNCTION" />
            <el-option label="API" value="API" />
          </el-select>
          <el-select v-model="productPort" placeholder="请选择产品端口" style="width: 200px; margin-right: 20px">
            <el-option label="全部" value="" />
            <el-option 
              v-for="port in uniqueProductPorts" 
              :key="port"
              :label="port"
              :value="port"
            />
          </el-select>
          <el-input v-model="searchKeyword" placeholder="请输入权限名称或编码" style="width: 250px" />
        </div>
        
        <!-- 产品分组展示 -->
        <div class="product-groups">
          <div 
            v-for="productGroup in productGroups" 
            :key="productGroup.port"
            class="product-group"
          >
            <h4 class="product-group-title">{{ productGroup.port }}</h4>
            <el-tree
              :data="productGroup.permissions"
              :props="treeProps"
              node-key="id"
              default-expand-all
              class="permission-tree"
            >
              <template #default="{ node, data }">
              <div class="tree-node-content">
                <div class="node-info">
                  <el-tag 
                    size="small" 
                    :type="getPermissionTypeTagType(data.type)"
                    style="margin-right: 8px"
                  >
                    {{ getPermissionTypeLabel(data.type) }}
                  </el-tag>
                  {{ node.label }}
                  <span class="permission-code">({{ data.code }})</span>
                  
                  <!-- API权限显示数据域和数据对象信息 -->
                  <template v-if="data.type === 'API'">
                    <!-- 数据域和数据对象悬浮显示 -->
                    <template v-if="data.dataObjectInfo && data.dataObjectInfo.length > 0">
                      <el-tooltip 
                        placement="top"
                        effect="light"
                      >
                        <template #content>
                          <div class="api-associated-objects">
                            <div v-for="(objInfo, index) in data.dataObjectInfo" :key="index" class="associated-object-item">
                              <strong>{{ objInfo.objectName }}</strong> ({{ objInfo.table }})
                            </div>
                          </div>
                        </template>
                        <el-tag 
                          size="small" 
                          type="info"
                          effect="light"
                          style="margin-left: 8px"
                        >
                          使用{{ data.dataObjectInfo.length }}个数据对象
                        </el-tag>
                      </el-tooltip>
                    </template>
                    
                    <!-- API权限显示关联按钮 -->
                    <el-tooltip 
                      v-if="getAssociatedButtons(data.id).length > 0"
                      placement="top"
                      effect="light"
                    >
                      <template #content>
                        <div class="api-associated-buttons">
                          <div v-for="button in getAssociatedButtons(data.id)" :key="button.id" class="associated-button-item">
                            <strong>{{ button.productPort }}</strong> - {{ button.pageName }} - {{ button.name }}
                          </div>
                        </div>
                      </template>
                      <el-tag 
                        size="small" 
                        type="warning"
                        style="margin-left: 8px"
                      >
                        还被{{ getAssociatedButtons(data.id).length }}个按钮使用
                      </el-tag>
                    </el-tooltip>
                  </template>
                </div>
                <div class="node-actions">
                  <el-button 
                    type="success" 
                    size="small" 
                    @click="handleEditPermission(data)"
                    style="margin-right: 5px"
                  >
                    编辑
                  </el-button>
                  <el-button 
                    type="danger" 
                    size="small" 
                    @click="handleDeletePermission(data)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </template>
            </el-tree>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 新增/编辑权限对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      :title="permissionDialogTitle"
      width="600px"
    >
      <el-form :model="permissionForm" :rules="permissionRules" ref="permissionFormRef" label-width="120px">
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="permissionForm.name" placeholder="请输入权限名称" />
        </el-form-item>
        <el-form-item label="权限编码" prop="code">
          <el-input v-model="permissionForm.code" placeholder="请输入权限编码" />
        </el-form-item>
        <el-form-item label="所属产品端口" prop="productPort">
          <el-select v-model="permissionForm.productPort" placeholder="请选择产品端口" style="width: 100%">
            <el-option 
              v-for="port in uniqueProductPorts" 
              :key="port"
              :label="port"
              :value="port"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="权限类型" prop="type">
          <el-select v-model="permissionForm.type" placeholder="请选择权限类型" style="width: 100%" @change="handlePermissionTypeChange">
            <el-option label="目录" value="DIRECTORY" />
            <el-option label="页面" value="PAGE" />
            <el-option label="功能/按钮" value="FUNCTION" />
            <el-option label="API" value="API" />
          </el-select>
        </el-form-item>
        <el-form-item label="上级权限" prop="parentId">
          <el-select v-model="permissionForm.parentId" placeholder="请选择上级权限" style="width: 100%">
            <el-option label="无" value="" />
            <el-option 
              v-for="perm in parentPermissionOptions" 
              :key="perm.id" 
              :label="perm.name" 
              :value="perm.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="页面路径" prop="path" v-if="permissionForm.type === 'PAGE'">
          <el-input v-model="permissionForm.path" placeholder="请输入页面路径" />
        </el-form-item>
        <el-form-item label="组件名称" prop="component" v-if="permissionForm.type === 'PAGE'">
          <el-input v-model="permissionForm.component" placeholder="请输入组件名称" />
        </el-form-item>
        <el-form-item label="API地址" prop="apiUrl" v-if="permissionForm.type === 'API'">
          <el-input v-model="permissionForm.apiUrl" placeholder="请输入API地址" />
        </el-form-item>
        <el-form-item label="数据域和对象" prop="dataDomainObjects" v-if="permissionForm.type === 'API'">
          <div v-if="permissionForm.dataDomainObjects && permissionForm.dataDomainObjects.length > 0">
            <div 
              v-for="(item, index) in permissionForm.dataDomainObjects" 
              :key="index" 
              class="data-domain-object-item"
              style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center;"
            >
              <el-select 
                v-model="item.domain" 
                placeholder="请选择数据域" 
                style="width: 150px"
                @change="() => handleDomainChange(item, index)"
              >
                <el-option 
                  v-for="domain in getAllDataDomains()" 
                  :key="domain.value" 
                  :label="domain.label" 
                  :value="domain.value"
                />
              </el-select>
              <el-select 
                v-model="item.objectId" 
                placeholder="请选择数据对象" 
                style="width: 200px"
              >
                <el-option 
                  v-for="obj in getDataObjectsByDomain(item.domain)" 
                  :key="obj.value" 
                  :label="obj.label" 
                  :value="obj.value"
                />
              </el-select>
              <el-button 
                type="danger" 
                size="small" 
                @click="removeDataDomainObject(index)"
              >
                删除
              </el-button>
            </div>
          </div>
          <el-button 
            type="primary" 
            size="small" 
            @click="addDataDomainObject"
            style="margin-top: 10px"
          >
            添加数据域和对象
          </el-button>
        </el-form-item>
        <el-form-item label="关联API权限" prop="apiPermissions" v-if="permissionForm.type === 'FUNCTION'">
          <el-select 
            v-model="permissionForm.apiPermissions" 
            placeholder="请选择关联的API权限" 
            multiple
            filterable
            style="width: 100%"
          >
            <el-option 
              v-for="apiPerm in apiPermissions" 
              :key="apiPerm.id" 
              :label="apiPerm.name" 
              :value="apiPerm.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="权限描述" prop="description">
          <el-input 
            v-model="permissionForm.description" 
            type="textarea" 
            rows="3" 
            placeholder="请输入权限描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitPermission">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { permissions as mockPermissions } from '../mock/data.js'

// 响应式数据
const permissions = ref([])
const permissionType = ref('')
const productPort = ref('')
const searchKeyword = ref('')
const permissionDialogVisible = ref(false)
const permissionDialogTitle = ref('新增权限')
const permissionFormRef = ref(null)
const isEdit = ref(false)
const editingPermissionId = ref('')

// 树形结构配置
const treeProps = {
  label: (data) => data.displayName || data.name,
  children: 'children'
}

// 权限表单数据
const permissionForm = ref({
  id: '',
  name: '',
  code: '',
  productPort: '',
  type: '',
  parentId: '',
  path: '',
  component: '',
  apiUrl: '',
  apiPermissions: [],
  dataDomainObjects: [],
  description: ''
})

// 表单验证规则
const permissionRules = {
  name: [
    { required: true, message: '请输入权限名称', trigger: 'blur' },
    { min: 1, max: 50, message: '权限名称长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入权限编码', trigger: 'blur' },
    { min: 1, max: 50, message: '权限编码长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  productPort: [
    { required: true, message: '请选择所属产品端口', trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择权限类型', trigger: 'change' }
  ],
  path: [
    { required: true, message: '请输入页面路径', trigger: 'blur', required: permissionForm.value.type === 'PAGE' }
  ],
  component: [
    { required: true, message: '请输入组件名称', trigger: 'blur', required: permissionForm.value.type === 'PAGE' }
  ],
  apiUrl: [
    { required: true, message: '请输入API地址', trigger: 'blur', required: permissionForm.value.type === 'API' }
  ],
  dataDomainObjects: [
    { required: true, message: '请至少选择一个数据对象', trigger: 'change', required: permissionForm.value.type === 'API' }
  ],
  apiPermissions: [
    { required: true, message: '请至少选择一个关联的API权限', trigger: 'change', required: permissionForm.value.type === 'FUNCTION' }
  ],
  description: [
    { required: true, message: '请输入权限描述', trigger: 'blur' },
    { min: 1, max: 200, message: '权限描述长度在 1 到 200 个字符', trigger: 'blur' }
  ]
}

// 生命周期钩子
onMounted(() => {
  // 直接使用mock数据，已包含完整的产品端口信息
  permissions.value = [...mockPermissions]
})

// 唯一产品端口列表
const uniqueProductPorts = computed(() => {
  const ports = new Set()
  permissions.value.forEach(perm => {
    if (perm.productPort) {
      ports.add(perm.productPort)
    }
  })
  return Array.from(ports)
})

// 构建树形结构
const buildTree = (permissionList) => {
  const tree = []
  const map = new Map()
  const apiPermissionsMap = new Map()
  
  // 先将所有权限放入map
  permissionList.forEach(perm => {
    const processedPerm = { ...perm, children: [] }
    map.set(perm.id, processedPerm)
    if (perm.type === 'API') {
      apiPermissionsMap.set(perm.id, perm)
    }
  })
  
  // 构建基本树形结构
  map.forEach(perm => {
    if (!perm.parentId) {
      // 根节点
      tree.push(perm)
    } else {
      // 子节点，添加到父节点的children中
      const parent = map.get(perm.parentId)
      if (parent) {
        parent.children.push(perm)
      } else {
        // 如果找不到父节点，作为根节点处理
        tree.push(perm)
      }
    }
  })
  
  // 处理FUNCTION权限关联的API权限
  map.forEach(perm => {
    if (perm.type === 'FUNCTION' && perm.apiPermissions && perm.apiPermissions.length > 0) {
      // 将关联的API权限添加到FUNCTION权限的children中
      perm.apiPermissions.forEach(apiPermId => {
        const apiPerm = apiPermissionsMap.get(apiPermId)
        if (apiPerm) {
          // 处理API权限显示的数据域和对象信息
          const processedApiPerm = { ...apiPerm }
          processApiPermissionDisplay(processedApiPerm)
          perm.children.push(processedApiPerm)
        }
      })
    }
  })
  
  // 从根节点移除已经关联到FUNCTION的API权限
  const rootApiIds = new Set()
  map.forEach(perm => {
    if (perm.type === 'FUNCTION' && perm.apiPermissions && perm.apiPermissions.length > 0) {
      perm.apiPermissions.forEach(apiPermId => {
        rootApiIds.add(apiPermId)
      })
    }
  })
  
  // 处理剩余根节点API权限的显示
  tree.forEach(perm => {
    if (perm.type === 'API') {
      processApiPermissionDisplay(perm)
    }
  })
  
  // 过滤掉已经被关联到FUNCTION的API根节点
  const filteredTree = tree.filter(perm => {
    return !(perm.type === 'API' && rootApiIds.has(perm.id))
  })
  
  return filteredTree
}

// 处理API权限显示的数据域和对象信息
const processApiPermissionDisplay = (apiPerm) => {
  if (apiPerm.dataDomainObjects && apiPerm.dataDomainObjects.length > 0) {
    // 构建数据域和对象的详细信息，存储在单独字段中，供模板使用
    apiPerm.dataObjectInfo = apiPerm.dataDomainObjects.map(item => {
      const domain = getAllDataDomains().find(d => d.value === item.domain)
      const domainLabel = domain ? domain.label : item.domain
      
      // 从dataDomains中找到对应的对象信息
      let objectInfo = null
      for (const [key, domainData] of Object.entries(dataDomains)) {
        if (key === item.domain) {
          objectInfo = domainData.objects.find(obj => obj.id === item.objectId)
          break
        }
      }
      
      return {
        domain: domainLabel,
        domainKey: item.domain,
        objectId: item.objectId,
        objectName: objectInfo ? objectInfo.name : '未知对象',
        table: objectInfo ? objectInfo.table : '未知表'
      }
    })
    
    // 显示名称只保留API名称，数据对象信息通过标签单独展示
    apiPerm.displayName = apiPerm.name
  } else {
    apiPerm.displayName = apiPerm.name
    apiPerm.dataObjectInfo = []
  }
}

// 获取所有相关权限ID（包括自身和所有子级）
const getAllRelatedPermissionIds = (permissionId, allPermissions) => {
  const relatedIds = new Set([permissionId])
  
  // 递归获取所有子级
  const findChildren = (id) => {
    allPermissions.forEach(perm => {
      if (perm.parentId === id) {
        relatedIds.add(perm.id)
        findChildren(perm.id)
      }
    })
  }
  
  findChildren(permissionId)
  return relatedIds
}

// 过滤后的权限列表
const filteredPermissionsList = computed(() => {
  let result = [...permissions.value]
  
  // 按搜索关键词过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(perm => 
      perm.name.toLowerCase().includes(keyword) || 
      perm.code.toLowerCase().includes(keyword)
    )
  }
  
  // 按权限类型过滤，同时包含其子级
  if (permissionType.value) {
    // 找到所有匹配类型的权限
    const matchingPermissions = result.filter(perm => perm.type === permissionType.value)
    
    // 收集这些权限及其所有子级的ID
    const relatedIds = new Set()
    matchingPermissions.forEach(perm => {
      const permissionIds = getAllRelatedPermissionIds(perm.id, permissions.value)
      permissionIds.forEach(id => relatedIds.add(id))
    })
    
    // 过滤出相关ID的权限
    result = result.filter(perm => relatedIds.has(perm.id))
  }
  
  // 按产品端口过滤
  if (productPort.value) {
    result = result.filter(perm => perm.productPort === productPort.value)
  }
  
  return result
})

// 产品分组
const productGroups = computed(() => {
  // 按产品端口分组
  const groups = new Map()
  
  filteredPermissionsList.value.forEach(perm => {
    const port = perm.productPort || '默认'
    if (!groups.has(port)) {
      groups.set(port, { port, permissions: [] })
    }
    groups.get(port).permissions.push(perm)
  })
  
  // 转换为数组并为每个组构建树形结构
  return Array.from(groups.values()).map(group => ({
    ...group,
    permissions: buildTree(group.permissions)
  }))
})

// 可选择的上级权限列表
const parentPermissionOptions = computed(() => {
  return permissions.value.map(perm => ({
    id: perm.id,
    name: `${perm.name} (${getPermissionTypeLabel(perm.type)})`,
    type: perm.type
  }))
})

// API权限列表（用于按钮权限配置）
const apiPermissions = computed(() => {
  return permissions.value.filter(perm => perm.type === 'API')
})

// 获取权限类型标签类型
const getPermissionTypeTagType = (type) => {
  const typeMap = {
    'DIRECTORY': 'info',
    'PAGE': 'primary',
    'FUNCTION': 'success',
    'API': 'warning'
  }
  return typeMap[type] || 'info'
}

// 获取权限类型标签文本
const getPermissionTypeLabel = (type) => {
  const labelMap = {
    'DIRECTORY': '目录',
    'PAGE': '页面',
    'FUNCTION': '功能/按钮',
    'API': 'API'
  }
  return labelMap[type] || type
}

// 根据API权限ID获取API权限名称
const getApiPermissionName = (apiPermId) => {
  const apiPerm = permissions.value.find(p => p.id === apiPermId)
  return apiPerm ? apiPerm.name : apiPermId
}

// 获取关联到API的所有功能/按钮权限，包含页面信息
const getAssociatedButtons = (apiId) => {
  // 查找所有关联到该API的FUNCTION权限
  const associatedButtons = permissions.value.filter(perm => 
    perm.type === 'FUNCTION' && 
    Array.isArray(perm.apiPermissions) && 
    perm.apiPermissions.includes(apiId)
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

// 模拟数据域和数据对象
const dataDomains = {
  'order': {
    name: '订单数据域',
    objects: [
      { id: 'order_order', name: '服务订单数据对象', table: 'orders' },
      { id: 'order_customer', name: '客户数据对象', table: 'customers' },
      { id: 'order_product', name: '产品数据对象', table: 'products' },
      { id: 'order_payment', name: '支付数据对象', table: 'payments' },
      { id: 'order_refund', name: '退款数据对象', table: 'refunds' }
    ]
  },
  'coupon': {
    name: '优惠券数据域',
    objects: [
      { id: 'coupon_coupon', name: '优惠券数据对象', table: 'coupons' },
      { id: 'coupon_campaign', name: '优惠券活动数据对象', table: 'coupon_campaigns' }
    ]
  },
  'service': {
    name: '服务数据域',
    objects: [
      { id: 'service_service', name: '服务数据对象', table: 'services' },
      { id: 'service_provider', name: '服务提供者数据对象', table: 'service_providers' },
      { id: 'service_feedback', name: '服务反馈数据对象', table: 'service_feedback' }
    ]
  },
  'hr': {
    name: 'HR数据域',
    objects: [
      { id: 'hr_candidate', name: '候选人数据对象', table: 'candidates' },
      { id: 'hr_employee', name: '员工数据对象', table: 'employees' },
      { id: 'hr_interview', name: '面试数据对象', table: 'interviews' },
      { id: 'hr_offer', name: 'Offer数据对象', table: 'offers' }
    ]
  },
  'permission': {
    name: '权限数据域',
    objects: [
      { id: 'permission_user', name: '用户数据对象', table: 'users' },
      { id: 'permission_role', name: '角色数据对象', table: 'roles' },
      { id: 'permission_permission', name: '权限数据对象', table: 'permissions' }
    ]
  },
  'learning': {
    name: '学习培训数据域',
    objects: [
      { id: 'learning_course', name: '课程数据对象', table: 'courses' },
      { id: 'learning_enrollment', name: '课程报名数据对象', table: 'course_enrollments' },
      { id: 'learning_progress', name: '学习进度数据对象', table: 'learning_progress' },
      { id: 'learning_record', name: '学习记录数据对象', table: 'learning_records' }
    ]
  },
  'exam': {
    name: '考试认证数据域',
    objects: [
      { id: 'exam_exam', name: '考试数据对象', table: 'exams' },
      { id: 'exam_enrollment', name: '考试报名数据对象', table: 'exam_enrollments' },
      { id: 'exam_answer', name: '考试答案数据对象', table: 'exam_answers' },
      { id: 'exam_score', name: '考试成绩数据对象', table: 'exam_scores' },
      { id: 'exam_certificate', name: '证书数据对象', table: 'certificates' }
    ]
  },
  'skill': {
    name: '技能提升数据域',
    objects: [
      { id: 'skill_assessment', name: '技能评估数据对象', table: 'skill_assessments' },
      { id: 'skill_plan', name: '提升计划数据对象', table: 'skill_plans' },
      { id: 'skill_certification', name: '技能认证数据对象', table: 'skill_certifications' }
    ]
  },
  'certificate': {
    name: '证书管理数据域',
    objects: [
      { id: 'certificate_certificate', name: '证书数据对象', table: 'certificates' },
      { id: 'certificate_renewal', name: '证书续期数据对象', table: 'certificate_renewals' }
    ]
  }
}

// 获取所有数据域
const getAllDataDomains = () => {
  return Object.entries(dataDomains).map(([key, domain]) => ({
    value: key,
    label: domain.name
  }))
}

// 根据数据域获取数据对象
const getDataObjectsByDomain = (domain) => {
  if (!domain) {
    return []
  }
  return dataDomains[domain]?.objects.map(obj => ({
    value: obj.id,
    label: `${obj.name}(${obj.table})`
  })) || []
}

// 处理权限类型变化
const handlePermissionTypeChange = () => {
  // 重置相关字段
  if (permissionForm.value.type !== 'PAGE') {
    permissionForm.value.path = ''
    permissionForm.value.component = ''
  }
  if (permissionForm.value.type !== 'API') {
    permissionForm.value.apiUrl = ''
    permissionForm.value.dataDomainObjects = []
  }
  if (permissionForm.value.type !== 'FUNCTION') {
    permissionForm.value.apiPermissions = []
  }
}

// 添加数据域和数据对象
const addDataDomainObject = () => {
  if (!permissionForm.value.dataDomainObjects) {
    permissionForm.value.dataDomainObjects = []
  }
  permissionForm.value.dataDomainObjects.push({
    domain: '',
    objectId: ''
  })
}

// 删除数据域和数据对象
const removeDataDomainObject = (index) => {
  permissionForm.value.dataDomainObjects.splice(index, 1)
}

// 处理数据域变化
const handleDomainChange = (item, index) => {
  // 当数据域变化时，重置数据对象
  item.objectId = ''
  permissionForm.value.dataDomainObjects[index] = { ...item }
}

// 处理数据域变化（兼容旧方法名）
const handleDatabaseChange = () => {
  // 保留空实现以兼容现有代码
}

// 新增权限
const handleAddPermission = () => {
  isEdit.value = false
  permissionDialogTitle.value = '新增权限'
  permissionForm.value = {
    id: `perm-${Date.now()}`,
    name: '',
    code: '',
    productPort: '',
    type: '',
    parentId: '',
    path: '',
    component: '',
    apiUrl: '',
    apiPermissions: [],
    dataDomainObjects: [],
    description: ''
  }
  permissionDialogVisible.value = true
}

// 编辑权限
const handleEditPermission = (permission) => {
  isEdit.value = true
  editingPermissionId.value = permission.id
  permissionDialogTitle.value = '编辑权限'
  permissionForm.value = JSON.parse(JSON.stringify(permission))
  permissionDialogVisible.value = true
}

// 提交权限表单
const handleSubmitPermission = () => {
  permissionFormRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        // 编辑权限
        const index = permissions.value.findIndex(p => p.id === editingPermissionId.value)
        if (index !== -1) {
          permissions.value[index] = permissionForm.value
          ElMessage.success('权限编辑成功')
        }
      } else {
        // 新增权限
        permissions.value.push(permissionForm.value)
        ElMessage.success('权限新增成功')
      }
      permissionDialogVisible.value = false
    }
  })
}

// 删除权限
const handleDeletePermission = (permission) => {
  // 检查是否有子权限
  const hasChildren = permissions.value.some(p => p.parentId === permission.id)
  if (hasChildren) {
    ElMessage.warning('该权限下存在子权限，无法删除')
    return
  }
  
  ElMessageBox.confirm('确定要删除该权限吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 实现删除逻辑
    permissions.value = permissions.value.filter(p => p.id !== permission.id)
    ElMessage.success('权限删除成功')
  }).catch(() => {
    // 取消删除
  })
}
</script>

<style scoped>
.permission-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
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

/* 内容卡片 */
.page-content {
  margin-bottom: 30px;
}

.content-card {
  border-radius: 8px;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* 过滤条件 */
.permission-filter {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

/* 产品分组 */
.product-groups {
  margin-top: 20px;
}

.product-group {
  margin-bottom: 30px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.product-group-title {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
}

/* 树形结构 */
.permission-tree {
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

.permission-code {
  color: #909399;
  margin-left: 6px;
  font-size: 12px;
}

.node-actions {
  display: flex;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .permission-filter {
    flex-direction: column;
    align-items: stretch;
  }
  
  .permission-filter .el-select,
  .permission-filter .el-input {
    margin-right: 0 !important;
    margin-bottom: 10px;
    width: 100% !important;
  }
  
  .tree-node-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .node-actions {
    margin-top: 8px;
  }
}
</style>