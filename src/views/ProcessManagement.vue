<template>
  <div class="process-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>业务流程管理</h2>
      <el-button type="primary" @click="handleAddProcess">
        <el-icon-plus /> 新增流程
      </el-button>
    </div>
    
    <!-- 流程列表 -->
    <div class="process-content">
      <el-card shadow="hover" class="process-list-card">
        <!-- 查询区域 -->
        <div class="search-section">
          <el-form :inline="true" :model="searchForm" class="search-form">
            <el-form-item label="流程名称">
              <el-input 
                v-model="searchForm.name" 
                placeholder="请输入流程名称" 
                clearable
                style="width: 200px"
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item label="所属业务">
              <el-select 
                v-model="searchForm.businessId" 
                placeholder="请选择所属业务" 
                clearable
                filterable
                style="width: 200px"
              >
                <el-option 
                  v-for="business in businesses" 
                  :key="business.id" 
                  :label="business.name" 
                  :value="business.id" 
                />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select 
                v-model="searchForm.status" 
                placeholder="请选择状态" 
                clearable
                style="width: 150px"
              >
                <el-option label="启用" value="active" />
                <el-option label="禁用" value="inactive" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">
                <el-icon-search /> 查询
              </el-button>
              <el-button @click="handleReset">
                <el-icon-refresh /> 重置
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <el-table 
          :data="filteredProcesses" 
          style="width: 100%" 
          @row-click="handleRowClick"
          v-loading="loading"
        >
          <el-table-column prop="id" label="流程ID" width="120" />
          <el-table-column prop="businessName" label="所属业务" width="120">
            <template #default="scope">
              {{ getBusinessName(scope.row.businessId) }}
            </template>
          </el-table-column>
          <el-table-column prop="name" label="流程名称" min-width="150" />
          <el-table-column prop="description" label="流程描述" min-width="200" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
                {{ scope.row.status === 'active' ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="240" fixed="right">
            <template #default="scope">
              <div class="action-cell">
                <el-button size="small" type="primary" @click.stop="handleViewNodes(scope.row)">
                  <el-icon-view /> 流程节点
                </el-button>
                <el-dropdown trigger="click">
                  <span class="more-link" @click.stop>
                    更多
                    <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click.stop="handleEditProcess(scope.row)">
                        <el-icon-edit style="margin-right:6px" />编辑
                      </el-dropdown-item>
                      <el-dropdown-item @click.stop="handleToggleStatus(scope.row)">
                        {{ scope.row.status === 'active' ? '禁用' : '启用' }}
                      </el-dropdown-item>
                      <el-dropdown-item @click.stop="handleDeleteProcess(scope.row)">
                        删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="filteredProcesses.length"
          />
        </div>
      </el-card>
    </div>
    
    <!-- 流程详情抽屉 -->
    <el-drawer
      v-model="detailDrawerVisible"
      title="流程详情"
      size="60%"
      direction="rtl"
      :close-on-click-modal="false"
    >
      <div v-if="selectedProcess" class="process-detail">
        <!-- 流程基本信息 -->
        <el-descriptions :column="2" border class="process-info">
          <el-descriptions-item label="流程ID">{{ selectedProcess.id }}</el-descriptions-item>
          <el-descriptions-item label="流程名称">{{ selectedProcess.name }}</el-descriptions-item>
          <el-descriptions-item label="流程描述">{{ selectedProcess.description }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="selectedProcess.status === 'active' ? 'success' : 'danger'">
              {{ selectedProcess.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">{{ formatDate(selectedProcess.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间" :span="2">{{ formatDate(selectedProcess.updateTime) }}</el-descriptions-item>
        </el-descriptions>
        
        <!-- 流程节点列表 -->
        <div class="process-nodes-section">
          <div class="section-header">
            <h3>流程节点</h3>
            <el-button size="small" type="primary" @click="handleAddNode">
              <el-icon-plus /> 新增节点
            </el-button>
          </div>
          <el-table :data="getProcessNodes(selectedProcess.id)" style="width: 100%">
            <el-table-column prop="id" label="节点ID" width="150" />
            <el-table-column prop="name" label="节点名称" width="150" />
            <el-table-column prop="type" label="节点类型" width="120">
              <template #default="scope">
                <el-tag :type="getTypeTagType(scope.row.type)">
                  {{ scope.row.type === 'start' ? '开始' : scope.row.type === 'end' ? '结束' : '中间' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="order" label="顺序" width="80" />
            <el-table-column prop="description" label="描述" min-width="200" />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="scope">
                <el-button size="small" type="primary" @click.stop="handleEditNode(scope.row)">
                  <el-icon-edit /> 配置
                </el-button>
                <el-button size="small" type="danger" @click.stop="handleDeleteNode(scope.row)">
                  <el-icon-delete /> 删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-drawer>
    
    <!-- 流程表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑流程' : '新增流程'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="所属业务" prop="businessId">
          <el-select v-model="formData.businessId" placeholder="请选择所属业务" style="width: 100%" filterable>
            <el-option 
              v-for="business in businesses" 
              :key="business.id" 
              :label="business.name" 
              :value="business.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="流程名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入流程名称" />
        </el-form-item>
        <el-form-item label="流程描述" prop="description">
          <el-input 
            v-model="formData.description" 
            type="textarea" 
            rows="3" 
            placeholder="请输入流程描述"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveProcess">保存</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 流程节点配置对话框 -->
    <el-dialog
      v-model="nodeConfigVisible"
      :title="selectedNode ? '编辑流程节点' : '新增流程节点'"
      width="800px"
      fullscreen
    >
      <ProcessNodeConfiguration
        v-if="selectedProcess"
        :node="selectedNode"
        :process-id="selectedProcess.id"
        :available-nodes="getProcessNodes(selectedProcess.id)"
        @save="handleSaveNode"
        @cancel="handleCancelNodeConfig"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { businesses, businessProcesses, processNodes } from '../mock/data'
import ProcessNodeConfiguration from '../components/ProcessNodeConfiguration.vue'
import {
  Plus as ElIconPlus,
  View as ElIconView,
  Edit as ElIconEdit,
  Check as ElIconCheck,
  Close as ElIconClose,
  Delete as ElIconDelete,
  Search as ElIconSearch,
  Refresh as ElIconRefresh
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const processes = ref([])
const dialogVisible = ref(false)
const detailDrawerVisible = ref(false)
const nodeConfigVisible = ref(false)
const isEdit = ref(false)
const selectedProcess = ref(null)
const selectedNode = ref(null)
const formRef = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)

// 查询表单
const searchForm = ref({
  name: '',
  businessId: '',
  status: ''
})

// 表单数据
const formData = ref({
  id: '',
  businessId: '',
  name: '',
  description: '',
  status: 'active'
})

// 表单验证规则
const rules = {
  businessId: [
    { required: true, message: '请选择所属业务', trigger: 'change' }
  ],
  name: [
    { required: true, message: '请输入流程名称', trigger: 'blur' },
    { min: 1, max: 50, message: '流程名称长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '流程描述长度不超过 200 个字符', trigger: 'blur' }
  ]
}

// 初始化流程数据
const initProcesses = async () => {
  loading.value = true
  try {
    // 模拟异步加载
    await new Promise(resolve => setTimeout(resolve, 500))
    processes.value = [...businessProcesses]
  } catch (error) {
    ElMessage.error('加载流程数据失败')
    console.error('加载流程数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 获取节点类型标签类型
const getTypeTagType = (type) => {
  const typeMap = {
    start: 'success',
    middle: 'primary',
    end: 'danger'
  }
  return typeMap[type] || 'info'
}

// 获取有效期类型标签
const getValidityTypeLabel = (type) => {
  const typeMap = {
    permanent: '永久',
    temporary: '临时',
    nodeDuration: '节点期间'
  }
  return typeMap[type] || '未知'
}

// 根据流程ID获取节点列表
const getProcessNodes = (processId) => {
  return processNodes.filter(node => node.processId === processId).sort((a, b) => a.order - b.order)
}

// 过滤后的流程列表
const filteredProcesses = computed(() => {
  let result = [...processes.value]
  
  // 按流程名称过滤
  if (searchForm.value.name) {
    result = result.filter(p => p.name.toLowerCase().includes(searchForm.value.name.toLowerCase()))
  }
  
  // 按所属业务过滤
  if (searchForm.value.businessId) {
    result = result.filter(p => p.businessId === searchForm.value.businessId)
  }
  
  // 按状态过滤
  if (searchForm.value.status) {
    result = result.filter(p => p.status === searchForm.value.status)
  }
  
  return result
})

// 查询
const handleSearch = () => {
  // 查询逻辑已在computed中实现
  ElMessage.success('查询完成')
}

// 重置查询
const handleReset = () => {
  searchForm.value = {
    name: '',
    businessId: '',
    status: ''
  }
  ElMessage.success('已重置查询条件')
}

// 根据业务ID获取业务名称
const getBusinessName = (businessId) => {
  if (!businessId) return ''
  const business = businesses.find(b => b.id === businessId)
  return business ? business.name : ''
}

// 新增流程
const handleAddProcess = () => {
  isEdit.value = false
  formData.value = {
    id: `process-${Date.now()}`,
    businessId: '',
    name: '',
    description: '',
    status: 'active'
  }
  dialogVisible.value = true
}

// 编辑流程
const handleEditProcess = (row) => {
  isEdit.value = true
  formData.value = { ...row }
  dialogVisible.value = true
}

// 查看流程节点
const handleViewNodes = (row) => {
  selectedProcess.value = { ...row }
  detailDrawerVisible.value = true
}

// 切换流程状态
const handleToggleStatus = (row) => {
  const newStatus = row.status === 'active' ? 'inactive' : 'active'
  ElMessageBox.confirm(
    `确定要${newStatus === 'active' ? '启用' : '禁用'}该流程吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    row.status = newStatus
    ElMessage.success(`${newStatus === 'active' ? '启用' : '禁用'}成功`)
  }).catch(() => {
    // 取消操作
  })
}

// 删除流程
const handleDeleteProcess = (row) => {
  // 检查是否有关联的节点
  const hasNodes = processNodes.some(node => node.processId === row.id)
  if (hasNodes) {
    ElMessage.warning('该流程下有关联的节点，无法删除')
    return
  }
  
  ElMessageBox.confirm(
    '确定要删除该流程吗？删除后不可恢复',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }
  ).then(() => {
    const index = processes.value.findIndex(p => p.id === row.id)
    if (index > -1) {
      processes.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    // 取消操作
  })
}

// 保存流程
const handleSaveProcess = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        // 编辑流程
        const index = processes.value.findIndex(p => p.id === formData.value.id)
        if (index > -1) {
          processes.value[index] = { ...formData.value, updateTime: new Date() }
          ElMessage.success('编辑成功')
        }
      } else {
        // 新增流程
        processes.value.push({
          ...formData.value,
          createTime: new Date(),
          updateTime: new Date()
        })
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
    }
  })
}

// 新增节点
const handleAddNode = () => {
  if (!selectedProcess.value) return
  selectedNode.value = null
  nodeConfigVisible.value = true
}

// 编辑节点
const handleEditNode = (row) => {
  selectedNode.value = { ...row }
  nodeConfigVisible.value = true
}

// 保存节点
const handleSaveNode = (node) => {
  // 检查节点是否已存在
  const existingIndex = processNodes.findIndex(n => n.id === node.id)
  if (existingIndex > -1) {
    // 更新节点
    processNodes[existingIndex] = node
  } else {
    // 新增节点
    processNodes.push(node)
  }
  ElMessage.success(selectedNode.value ? '节点编辑成功' : '节点新增成功')
  nodeConfigVisible.value = false
  selectedNode.value = null
}

// 删除节点
const handleDeleteNode = (row) => {
  ElMessageBox.confirm(
    '确定要删除该流程节点吗？删除后不可恢复',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }
  ).then(() => {
    const index = processNodes.findIndex(n => n.id === row.id)
    if (index > -1) {
      processNodes.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    // 取消操作
  })
}

// 取消节点配置
const handleCancelNodeConfig = () => {
  nodeConfigVisible.value = false
  selectedNode.value = null
}

// 行点击事件
const handleRowClick = (row) => {
  selectedProcess.value = { ...row }
  detailDrawerVisible.value = true
}

// 初始化
onMounted(() => {
  initProcesses()
})
</script>

<style scoped>
.process-management {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.action-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}


.process-list-card :deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 6px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #333;
  font-size: 20px;
  font-weight: 600;
}

.process-content {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.process-list-card {
  margin-bottom: 20px;
}

.search-section {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.search-form {
  margin: 0;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.process-detail {
  padding: 20px 0;
}

.process-info {
  margin-bottom: 20px;
}

.process-nodes-section {
  margin-top: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h3 {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>