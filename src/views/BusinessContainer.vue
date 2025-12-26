<template>
  <div class="business-container-page">
    <div class="page-header">
      <h2>业务容器管理</h2>
      <p>管理业务发送的物理空间容器，支持全国、大区、省、市、区、商圈、CBD、门店等层级</p>
    </div>
    
    <div class="page-content">
      <el-card shadow="hover" class="content-card">
        <template #header>
          <div class="card-header">
            <h3>业务容器列表</h3>
            <el-button type="primary" @click="handleAddContainer">
              <el-icon-plus /> 新增业务容器
            </el-button>
          </div>
        </template>
        <div class="container-filter">
          <el-select v-model="containerType" placeholder="请选择容器类型" style="width: 150px; margin-right: 20px">
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
          <el-input v-model="searchKeyword" placeholder="请输入容器名称或编码" style="width: 250px" />
        </div>
        
        <!-- 业务容器树形展示 -->
        <div class="container-tree-container">
          <el-tree
            :data="containerTree"
            :props="treeProps"
            node-key="id"
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
                  {{ node.label }}
                </div>
                <div class="node-actions">
                  <el-button 
                    type="success" 
                    size="small" 
                    @click="handleEditContainer(data)"
                    style="margin-right: 5px"
                  >
                    编辑
                  </el-button>
                  <el-button 
                    type="danger" 
                    size="small" 
                    @click="handleDeleteContainer(data)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </template>
          </el-tree>
        </div>
      </el-card>
    </div>
    
    <!-- 新增/编辑业务容器对话框 -->
    <el-dialog
      v-model="containerDialogVisible"
      :title="containerDialogTitle"
      width="600px"
    >
      <el-form :model="containerForm" :rules="containerRules" ref="containerFormRef" label-width="120px">
        <el-form-item label="容器名称" prop="name">
          <el-input v-model="containerForm.name" placeholder="请输入业务容器名称" />
        </el-form-item>
        <el-form-item label="容器编码" prop="code">
          <el-input v-model="containerForm.code" placeholder="请输入业务容器编码" />
        </el-form-item>

        <el-form-item label="容器类型" prop="type">
          <el-select v-model="containerForm.type" placeholder="请选择容器类型" style="width: 100%">
            <el-option label="全国" value="COUNTRY" />
            <el-option label="大区" value="REGION" />
            <el-option label="省" value="PROVINCE" />
            <el-option label="市" value="CITY" />
            <el-option label="区" value="DISTRICT" />
            <el-option label="商圈" value="BUSINESS_AREA" />
            <el-option label="CBD" value="CBD" />
            <el-option label="门店" value="STORE" />
          </el-select>
        </el-form-item>
        <el-form-item label="上级容器" prop="parentId">
          <el-select v-model="containerForm.parentId" placeholder="请选择上级容器" style="width: 100%">
            <el-option label="无" value="" />
            <el-option 
              v-for="container in parentContainerOptions" 
              :key="container.id" 
              :label="container.name" 
              :value="container.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="容器描述" prop="description">
          <el-input 
            v-model="containerForm.description" 
            type="textarea" 
            rows="3" 
            placeholder="请输入业务容器描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="containerDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitContainer">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { businessContainers as mockContainers } from '../mock/data.js'

// 响应式数据
const containers = ref([])
const containerType = ref('')
const searchKeyword = ref('')
const containerDialogVisible = ref(false)
const containerDialogTitle = ref('新增业务容器')
const containerFormRef = ref(null)
const isEdit = ref(false)
const editingContainerId = ref('')

// 树形结构配置
const treeProps = {
  label: 'name',
  children: 'children'
}

// 业务容器表单数据
const containerForm = ref({
  id: '',
  name: '',
  code: '',
  type: '',
  parentId: '',
  description: ''
})

// 表单验证规则
const containerRules = {
  name: [
    { required: true, message: '请输入容器名称', trigger: 'blur' },
    { min: 1, max: 50, message: '容器名称长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入容器编码', trigger: 'blur' },
    { min: 1, max: 50, message: '容器编码长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择容器类型', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入容器描述', trigger: 'blur' },
    { min: 1, max: 200, message: '容器描述长度在 1 到 200 个字符', trigger: 'blur' }
  ]
}

// 生命周期钩子
onMounted(() => {
  // 直接使用mock数据
  containers.value = [...mockContainers]
})

// 构建树形结构
const buildTree = (containerList) => {
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

// 获取所有相关容器ID（包括自身和所有子级）
const getAllRelatedContainerIds = (containerId, allContainers) => {
  const relatedIds = new Set([containerId])
  
  // 递归获取所有子级
  const findChildren = (id) => {
    allContainers.forEach(container => {
      if (container.parentId === id) {
        relatedIds.add(container.id)
        findChildren(container.id)
      }
    })
  }
  
  findChildren(containerId)
  return relatedIds
}

// 过滤后的业务容器列表
const filteredContainersList = computed(() => {
  let result = [...containers.value]
  
  // 按搜索关键词过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(container => 
      container.name.toLowerCase().includes(keyword) || 
      container.code.toLowerCase().includes(keyword)
    )
  }
  
  // 按容器类型过滤，同时包含其子级
  if (containerType.value) {
    // 找到所有匹配类型的容器
    const matchingContainers = result.filter(container => container.type === containerType.value)
    
    // 收集这些容器及其所有子级的ID
    const relatedIds = new Set()
    matchingContainers.forEach(container => {
      const containerIds = getAllRelatedContainerIds(container.id, containers.value)
      containerIds.forEach(id => relatedIds.add(id))
    })
    
    // 过滤出相关ID的容器
    result = result.filter(container => relatedIds.has(container.id))
  }
  
  return result
})

// 业务容器树形结构
const containerTree = computed(() => {
  return buildTree(filteredContainersList.value)
})

// 可选择的上级业务容器列表
const parentContainerOptions = computed(() => {
  return containers.value.map(container => ({
    id: container.id,
    name: `${container.name} (${getContainerTypeLabel(container.type)})`,
    type: container.type
  }))
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

// 新增业务容器
const handleAddContainer = () => {
  isEdit.value = false
  containerDialogTitle.value = '新增业务容器'
  containerForm.value = {
    id: `container-${Date.now()}`,
    name: '',
    code: '',
    type: '',
    parentId: '',
    description: ''
  }
  containerDialogVisible.value = true
}

// 编辑业务容器
const handleEditContainer = (container) => {
  isEdit.value = true
  editingContainerId.value = container.id
  containerDialogTitle.value = '编辑业务容器'
  containerForm.value = JSON.parse(JSON.stringify(container))
  containerDialogVisible.value = true
}

// 提交业务容器表单
const handleSubmitContainer = () => {
  containerFormRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        // 编辑业务容器
        const index = containers.value.findIndex(p => p.id === editingContainerId.value)
        if (index !== -1) {
          containers.value[index] = containerForm.value
          ElMessage.success('业务容器编辑成功')
        }
      } else {
        // 新增业务容器
        containers.value.push(containerForm.value)
        ElMessage.success('业务容器新增成功')
      }
      containerDialogVisible.value = false
    }
  })
}

// 删除业务容器
const handleDeleteContainer = (container) => {
  // 检查是否有子容器
  const hasChildren = containers.value.some(p => p.parentId === container.id)
  if (hasChildren) {
    ElMessage.warning('该业务容器下存在子容器，无法删除')
    return
  }
  
  ElMessageBox.confirm('确定要删除该业务容器吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 实现删除逻辑
    containers.value = containers.value.filter(p => p.id !== container.id)
    ElMessage.success('业务容器删除成功')
  }).catch(() => {
    // 取消删除
  })
}
</script>

<style scoped>
.business-container-page {
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
.container-filter {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

/* 树形结构 */
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

.node-actions {
  display: flex;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container-filter {
    flex-direction: column;
    align-items: stretch;
  }
  
  .container-filter .el-select,
  .container-filter .el-input {
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