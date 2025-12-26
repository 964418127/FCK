<template>
  <div class="department-management">
    <div class="department-header">
      <div class="header-actions">
        <el-button @click="openImportDialog">
          导入
        </el-button>
      <el-button type="primary" @click="handleAddDepartment">
        <el-icon><Plus /></el-icon>
        新增组织节点
      </el-button>
      </div>
    </div>
    
    <div class="department-content">
      <el-tree
        :data="props.departments"
        :props="treeProps"
        :expand-on-click-node="false"
        node-key="id"
        ref="departmentTree"
        default-expand-all
      >
        <template #default="{ node, data }">
          <div class="tree-node">
            <div class="node-info">
              <span class="node-label">{{ node.label }}</span>
              <el-tag :type="getNodeTypeTagType(data.type)" size="small" style="margin-left: 8px">
                {{ getNodeTypeLabel(data.type) }}
              </el-tag>
            </div>
            <div class="node-actions">
              <el-button 
                type="text" 
                size="small" 
                @click.stop="handleAddSubDepartment(data)"
              >
                新增子节点
              </el-button>
              <el-button 
                type="text" 
                size="small" 
                @click.stop="handleEditDepartment(data)"
              >
                编辑
              </el-button>
              <el-button 
                type="text" 
                size="small" 
                @click.stop="handleDeleteDepartment(data)"
                danger
              >
                删除
              </el-button>
            </div>
          </div>
        </template>
      </el-tree>
    </div>
    
    <!-- 部门表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="节点类型" prop="type">
          <el-select 
            v-model="formData.type" 
            placeholder="请选择节点类型" 
            style="width: 100%"
            :disabled="isEdit"
            @change="handleTypeChange"
          >
            <el-option 
              v-for="type in availableNodeTypes" 
              :key="type.value" 
              :label="type.label" 
              :value="type.value"
              :disabled="type.disabled"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="节点名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入节点名称" />
        </el-form-item>
        <el-form-item label="上级节点" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            :data="flatDepartments"
            :props="treeProps"
            placeholder="请选择上级节点"
            style="width: 100%"
            :disabled="isEdit && formData.parentId === null"
            :filter-node-method="filterParentNode"
            check-strictly
            :render-after-expand="false"
            clearable
            :render-label="renderNodeLabel"
          />
        </el-form-item>
        <el-form-item label="节点描述">
          <el-input 
            v-model="formData.description" 
            type="textarea" 
            rows="3" 
            placeholder="请输入节点描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 导入组织节点（占位，不落地数据） -->
    <el-dialog
      v-model="importDialogVisible"
      title="导入组织节点"
      width="520px"
    >
      <el-button type="primary" link @click="handleDownloadTemplate" style="margin-bottom: 6px">
        下载Excel模板
      </el-button>
      <el-alert
        title="此处仅提供模板与上传入口，未接通真实导入逻辑。"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 12px"
      />
      <el-upload
        drag
        action=""
        :auto-upload="false"
        :show-file-list="true"
        :limit="1"
        accept=".xlsx,.xls,.csv"
        :on-change="handleImportFileChange"
        :before-upload="() => false"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          拖拽或点击上传
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持xlsx/xls/csv，建议使用提供的模板填写数据
          </div>
        </template>
      </el-upload>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleImportConfirm">确认（占位）</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, UploadFilled } from '@element-plus/icons-vue'

// 接收父组件传入的props
const props = defineProps({
  departments: {
    type: Array,
    required: true
  }
})

// 定义事件
const emit = defineEmits(['update:departments'])

// 响应式数据
const departmentTree = ref(null)
const dialogVisible = ref(false)
const dialogTitle = ref('新增部门')
const formRef = ref(null)
const isEdit = ref(false)
const importDialogVisible = ref(false)
const importFileName = ref('')
const formData = ref({
  id: '',
  name: '',
  type: 'department',
  parentId: null,
  children: [],
  description: ''
})

// 节点类型定义
const nodeTypes = {
  headquarters: { label: '总公司', value: 'headquarters' },
  company: { label: '公司', value: 'company' },
  subsidiary: { label: '子公司', value: 'subsidiary' },
  branch: { label: '分公司', value: 'branch' },
  store: { label: '门店', value: 'store' },
  department: { label: '部门', value: 'department' },
  virtualTeam: { label: '虚拟团队', value: 'virtualTeam' }
}

// 节点类型层级关系规则
const nodeTypeRules = {
  headquarters: {
    allowedChildren: ['subsidiary', 'branch', 'store', 'department', 'virtualTeam']
  },
  subsidiary: {
    allowedChildren: ['branch', 'store', 'department', 'virtualTeam']
  },
  branch: {
    allowedChildren: ['store', 'department', 'virtualTeam']
  },
  store: {
    allowedChildren: ['department']
  },
  department: {
    allowedChildren: ['department'] // 子部门
  },
  virtualTeam: {
    allowedChildren: []
  },
  company: {
    allowedChildren: ['subsidiary', 'branch', 'store', 'department', 'virtualTeam']
  }
}

// 检查是否已存在总公司根节点
const hasHeadquartersRoot = computed(() => {
  const check = (deptList) => {
    for (const dept of deptList) {
      if (dept.type === 'headquarters' && !dept.parentId) {
        return true
      }
      if (dept.children && dept.children.length > 0) {
        if (check(dept.children)) return true
      }
    }
    return false
  }
  return check(props.departments)
})

// 获取可用的节点类型（根据父节点类型）
const availableNodeTypes = computed(() => {
  if (!formData.value.parentId) {
    // 未选择父级节点时，所有类型可选，但总公司根节点只允许出现1个
    return Object.values(nodeTypes).map(type => ({
      ...type,
      disabled: type.value === 'headquarters' && hasHeadquartersRoot.value
    }))
  }
  
  // 查找父节点
  const findParent = (deptList, parentId) => {
    for (const dept of deptList) {
      if (dept.id === parentId) {
        return dept
      }
      if (dept.children && dept.children.length > 0) {
        const found = findParent(dept.children, parentId)
        if (found) return found
      }
    }
    return null
  }
  
  const parent = findParent(props.departments, formData.value.parentId)
  if (!parent) {
    return Object.values(nodeTypes).map(type => ({ ...type, disabled: false }))
  }
  
  const allowedTypes = nodeTypeRules[parent.type]?.allowedChildren || []
  return Object.values(nodeTypes).map(type => ({
    ...type,
    disabled: !allowedTypes.includes(type.value)
  }))
})

// 渲染节点标签（显示名称而不是ID）
const renderNodeLabel = ({ node, data }) => {
  return getDepartmentPathLabel(data.id) || data.name || node.label || data.id
}

// 获取带层级的节点全路径，用于选择器显示
const getDepartmentPathLabel = (deptId) => {
  if (!deptId) return ''
  const path = []
  const dfs = (list, targetId) => {
    for (const item of list) {
      path.push(item)
      if (item.id === targetId) return true
      if (item.children && item.children.length > 0 && dfs(item.children, targetId)) {
        return true
      }
      path.pop()
    }
    return false
  }
  dfs(props.departments, deptId)
  return path.length ? path.map(d => d.name || d.id).join(' / ') : ''
}

// 过滤父节点选择（只能选择允许作为父节点的类型）
const filterParentNode = (value, data) => {
  if (!formData.value.type) return true
  
  // 根据当前选择的节点类型，过滤可选的父节点
  const currentType = formData.value.type
  const allowedParentTypes = Object.keys(nodeTypeRules).filter(type => {
    return nodeTypeRules[type].allowedChildren.includes(currentType)
  })
  
  // 总公司可以作为任何类型的父节点（除了它自己）
  if (currentType !== 'headquarters') {
    allowedParentTypes.push('headquarters')
  }
  
  return allowedParentTypes.includes(data.type)
}

// 表单验证规则
const rules = {
  type: [
    { required: true, message: '请选择节点类型', trigger: 'change' }
  ],
  name: [
    { required: true, message: '请输入节点名称', trigger: 'blur' },
    { min: 1, max: 50, message: '节点名称长度在 1 到 50 个字符', trigger: 'blur' }
  ]
}

// 树形配置
const treeProps = {
  children: 'children',
  label: 'name',
  value: 'id'
}

// 将树形结构转换为扁平结构，用于树形选择器
// 注意：el-tree-select 需要完整的树形结构，不是扁平结构
const flatDepartments = computed(() => {
  // 深拷贝部门树，避免修改原始数据
  const deepClone = (arr) => {
    return arr.map(item => ({
      ...item,
      children: item.children && item.children.length > 0 ? deepClone(item.children) : undefined
    }))
  }
  
  return deepClone(props.departments)
})

// 获取节点类型标签
const getNodeTypeLabel = (type) => {
  return nodeTypes[type]?.label || type
}

// 获取节点类型标签颜色
const getNodeTypeTagType = (type) => {
  const typeMap = {
    headquarters: 'danger',
    company: 'warning',
    subsidiary: 'success',
    branch: 'info',
    store: 'primary',
    department: '',
    virtualTeam: 'warning'
  }
  return typeMap[type] || ''
}

// 打开新增部门对话框
const handleAddDepartment = () => {
  isEdit.value = false
  dialogTitle.value = '新增组织节点'
  formData.value = {
    id: `dept-${Date.now()}`,
    name: '',
    type: 'headquarters',
    parentId: null,
    children: [],
    description: ''
  }
  dialogVisible.value = true
}

// 打开导入对话框
const openImportDialog = () => {
  importDialogVisible.value = true
}

// 选择文件（占位）
const handleImportFileChange = (file) => {
  importFileName.value = file.name || ''
  ElMessage.info('已选择文件，导入逻辑未实现')
}

// 下载Excel模板
const handleDownloadTemplate = () => {
  const header = ['节点名称', '节点类型', '上级节点ID(可空)', '描述']
  const sample = [
    ['总公司', 'headquarters', '', '根节点示例'],
    ['华东子公司', 'subsidiary', 'dept-root', '子公司示例'],
    ['上海分公司', 'branch', 'dept-huadong', '分公司示例']
  ]
  const csvRows = [header, ...sample].map(row => row.join(',')).join('\n')
  const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = '组织节点导入模板.csv'
  link.click()
  URL.revokeObjectURL(url)
}

// 确认导入（占位）
const handleImportConfirm = () => {
  ElMessage.success(importFileName.value ? `文件 ${importFileName.value} 已上传占位` : '未选择文件，已关闭占位导入')
  importDialogVisible.value = false
  importFileName.value = ''
}

// 打开新增子部门对话框
const handleAddSubDepartment = (parentData) => {
  isEdit.value = false
  dialogTitle.value = '新增子节点'
  formData.value = {
    id: `dept-${Date.now()}`,
    name: '',
    type: '',
    parentId: parentData.id,
    children: [],
    description: ''
  }
  dialogVisible.value = true
}

// 处理节点类型变化
const handleTypeChange = () => {
  // 类型变化时，清空父节点选择，让用户重新选择
  // formData.value.parentId = null
}

// 打开编辑部门对话框
const handleEditDepartment = (data) => {
  isEdit.value = true
  dialogTitle.value = '编辑组织节点'
  const editData = JSON.parse(JSON.stringify(data))
  // 确保有 type 字段，如果没有则默认为 department
  if (!editData.type) {
    editData.type = 'department'
  }
  formData.value = editData
  dialogVisible.value = true
}

// 删除部门
const handleDeleteDepartment = (data) => {
  ElMessageBox.confirm('确定要删除该部门吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 实现删除逻辑
    const newDepartments = deleteDepartmentFromTree(props.departments, data.id)
    emit('update:departments', newDepartments)
    ElMessage.success('部门删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 从树形结构中删除部门
const deleteDepartmentFromTree = (tree, id) => {
  return tree.filter(node => {
    if (node.id === id) {
      return false
    }
    if (node.children && node.children.length) {
      node.children = deleteDepartmentFromTree(node.children, id)
    }
    return true
  })
}

// 提交表单
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      // 验证层级关系
      if (!isEdit.value && formData.value.parentId) {
        const findParent = (deptList, parentId) => {
          for (const dept of deptList) {
            if (dept.id === parentId) {
              return dept
            }
            if (dept.children && dept.children.length > 0) {
              const found = findParent(dept.children, parentId)
              if (found) return found
            }
          }
          return null
        }
        
        const parent = findParent(props.departments, formData.value.parentId)
        if (parent) {
          const allowedTypes = nodeTypeRules[parent.type]?.allowedChildren || []
          if (!allowedTypes.includes(formData.value.type)) {
            ElMessage.error(`"${getNodeTypeLabel(parent.type)}"下不能创建"${getNodeTypeLabel(formData.value.type)}"类型的子节点`)
            return false
          }
        }
      }
      
      let newDepartments
      if (isEdit.value) {
        // 编辑部门
        newDepartments = updateDepartmentInTree(props.departments, formData.value)
      } else {
        // 新增部门
        newDepartments = addDepartmentToTree(props.departments, formData.value)
      }
      emit('update:departments', newDepartments)
      dialogVisible.value = false
      ElMessage.success(isEdit.value ? '节点更新成功' : '节点新增成功')
    } else {
      return false
    }
  })
}

// 向树形结构中添加部门
const addDepartmentToTree = (tree, department) => {
  // 确保新节点有 type 字段
  if (!department.type) {
    department.type = 'department'
  }
  
  if (!department.parentId) {
    // 根部门（只能是总公司）
    if (department.type !== 'headquarters') {
      ElMessage.error('根节点必须是总公司类型')
      return tree
    }
    return [...tree, department]
  }
  
  return tree.map(node => {
    if (node.id === department.parentId) {
      return {
        ...node,
        children: [...(node.children || []), department]
      }
    }
    if (node.children && node.children.length) {
      return {
        ...node,
        children: addDepartmentToTree(node.children, department)
      }
    }
    return node
  })
}

// 更新树形结构中的部门
const updateDepartmentInTree = (tree, department) => {
  return tree.map(node => {
    if (node.id === department.id) {
      return {
        ...node,
        ...department,
        children: node.children
      }
    }
    if (node.children && node.children.length) {
      return {
        ...node,
        children: updateDepartmentInTree(node.children, department)
      }
    }
    return node
  })
}

// 处理快速新增子节点事件
const handleQuickAddChildNode = (event) => {
  const nodeData = event.detail
  if (nodeData) {
    // 直接打开新增子节点对话框，父级节点已固定
    isEdit.value = false
    dialogTitle.value = '新增子节点'
    formData.value = {
      id: `dept-${Date.now()}`,
      name: '',
      type: '',
      parentId: nodeData.id || nodeData.parentId,
      children: [],
      description: ''
    }
    dialogVisible.value = true
  }
}

// 生命周期钩子
onMounted(() => {
  // 监听快速新增子节点事件
  window.addEventListener('quick-add-child-node', handleQuickAddChildNode)
})

onBeforeUnmount(() => {
  // 清理事件监听
  window.removeEventListener('quick-add-child-node', handleQuickAddChildNode)
})
</script>

<style scoped>
.department-management {
  width: 100%;
}

.department-header {
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.department-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tree-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.node-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.node-label {
  font-weight: 500;
}

.node-actions {
  display: flex;
  gap: 10px;
}

:deep(.el-tree-node__content) {
  height: auto;
  padding: 8px 0;
}
</style>