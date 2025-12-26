<template>
  <div class="page-wrapper">
    <div class="page-header">
      <h2>引擎业务</h2>
      <el-button type="primary" @click="openDialog()">新建业务</el-button>
    </div>

    <el-card shadow="hover" class="panel-card">
      <el-table 
        :data="businessList" 
        style="width: 100%" 
        row-key="id"
        :expand-row-keys="expandedRows" 
        @expand-change="onExpandChange"
      >
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="process-list-container">
              <div class="process-list-header">
                <div class="header-left">
                  <span class="process-list-title">业务流程列表</span>
                  <el-tag type="info" size="small">{{ getProcessList(row.id).length }} 个流程</el-tag>
                </div>
                <el-button size="small" type="primary" @click="createProcess(row)">
                  <el-icon><Plus /></el-icon>
                  新建流程
                </el-button>
              </div>
              <div class="process-list-content">
                <div v-if="getProcessList(row.id).length === 0" class="empty-process">
                  <el-empty description="暂无流程，点击上方按钮创建" :image-size="80" />
                </div>
                <div v-else class="process-cards">
                  <div 
                    v-for="process in getProcessList(row.id)" 
                    :key="process.id" 
                    class="process-card"
                  >
                    <div class="process-card-header">
                      <div class="process-info">
                        <div class="process-name-row">
                          <span class="process-name">{{ process.name }}</span>
                          <el-tag :type="process.status === 'active' ? 'success' : 'info'" size="small">
                            {{ process.status === 'active' ? '启用' : '停用' }}
                          </el-tag>
                        </div>
                        <div class="process-meta">
                          <span class="meta-item">
                            <el-icon><Document /></el-icon>
                            {{ process.code }}
                          </span>
                          <span class="meta-item">
                            <el-icon><CollectionTag /></el-icon>
                            v{{ process.version }}
                          </span>
                          <span class="meta-item">
                            <el-icon><Clock /></el-icon>
                            {{ process.updateTime }}
                          </span>
                        </div>
                        <div v-if="process.description" class="process-description">
                          {{ process.description }}
                        </div>
                      </div>
                      <div class="process-actions">
                        <el-button 
                          size="small" 
                          type="primary" 
                          @click="designProcess(row, process)"
                        >
                          <el-icon><Edit /></el-icon>
                          设计流程
                        </el-button>
                        <el-dropdown trigger="click" @command="(cmd) => handleProcessAction(cmd, row, process)">
                          <el-button size="small">
                            更多
                            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                          </el-button>
                          <template #dropdown>
                            <el-dropdown-menu>
                              <el-dropdown-item command="edit">编辑基础信息</el-dropdown-item>
                              <el-dropdown-item command="copy">复制</el-dropdown-item>
                              <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                            </el-dropdown-menu>
                          </template>
                        </el-dropdown>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="业务编码" width="160" />
        <el-table-column prop="name" label="业务名称" min-width="180" />
        <el-table-column prop="description" label="业务描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="processCount" label="流程数量" width="100">
          <template #default="scope">
            <el-tag size="small">{{ getProcessList(scope.row.id).length }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
              {{ scope.row.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button 
                size="small" 
                type="primary" 
                @click="openDialog(scope.row)"
              >
                编辑
              </el-button>
              <el-dropdown trigger="click">
                <span class="more-link">
                  更多
                  <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="createProcess(scope.row)">新建流程</el-dropdown-item>
                    <el-dropdown-item @click="deleteBusiness(scope.row.id)" divided>删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 业务配置弹窗 -->
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑业务' : '新建业务'" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="业务编码" required>
          <el-input v-model="form.code" :disabled="!!form.id" placeholder="如：order_process" />
        </el-form-item>
        <el-form-item label="业务名称" required>
          <el-input v-model="form.name" placeholder="如：订单处理业务" />
        </el-form-item>
        <el-form-item label="业务描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="业务描述" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveBusiness">保存</el-button>
      </template>
    </el-dialog>

    <!-- 流程配置弹窗 -->
    <el-dialog v-model="processDialogVisible" :title="processForm.id ? '编辑流程' : '新建流程'" width="600px">
      <el-form :model="processForm" label-width="100px">
        <el-form-item label="所属业务">
          <el-input :value="currentBusiness?.name" disabled />
        </el-form-item>
        <el-form-item label="流程编码" required>
          <el-input v-model="processForm.code" :disabled="!!processForm.id" placeholder="如：order_create_flow" />
        </el-form-item>
        <el-form-item label="流程名称" required>
          <el-input v-model="processForm.name" placeholder="如：订单创建流程" />
        </el-form-item>
        <el-form-item label="流程描述">
          <el-input v-model="processForm.description" type="textarea" :rows="3" placeholder="流程描述" />
        </el-form-item>
        <el-form-item label="版本">
          <el-input v-model="processForm.version" placeholder="如：1.0.0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="processForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="processDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProcess">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, Plus, Document, CollectionTag, Clock, Edit } from '@element-plus/icons-vue'

const router = useRouter()

const businessList = ref([])
const processListMap = ref({}) // 业务ID -> 流程列表
const expandedRows = ref([])
const dialogVisible = ref(false)
const processDialogVisible = ref(false)
const currentBusiness = ref(null)

const form = ref({
  id: null,
  code: '',
  name: '',
  description: '',
  status: 'active'
})

const processForm = ref({
  id: null,
  businessId: null,
  code: '',
  name: '',
  description: '',
  version: '1.0.0',
  status: 'active'
})

// 加载业务列表
const loadBusinessList = () => {
  // TODO: 从API加载
  businessList.value = [
    {
      id: 1,
      code: 'order_process',
      name: '订单处理业务',
      description: '处理订单的自动化业务流程',
      status: 'active',
      createTime: '2024-01-01 10:00:00'
    },
    {
      id: 2,
      code: 'refund_process',
      name: '退款处理业务',
      description: '处理退款的自动化业务流程',
      status: 'active',
      createTime: '2024-01-02 10:00:00'
    }
  ]
  
  // 加载每个业务的流程列表
  businessList.value.forEach(business => {
    loadProcessList(business.id)
  })
}

// 加载流程列表
const loadProcessList = (businessId) => {
  // TODO: 从API加载该业务下的流程列表
  if (!processListMap.value[businessId]) {
    processListMap.value[businessId] = [
      {
        id: 1,
        businessId: businessId,
        code: 'order_create_flow',
        name: '订单创建流程',
        description: '订单创建自动化流程',
        version: '1.0.0',
        status: 'active',
        updateTime: '2024-01-01 11:00:00'
      }
    ]
  }
}

// 获取流程列表
const getProcessList = (businessId) => {
  return processListMap.value[businessId] || []
}

// 展开/收起行
const onExpandChange = (row, expandedRows) => {
  if (expandedRows.includes(row)) {
    // 展开时加载流程列表
    loadProcessList(row.id)
  }
}

// 打开业务弹窗
const openDialog = (row = null) => {
  if (row) {
    form.value = { ...row }
  } else {
    form.value = {
      id: null,
      code: '',
      name: '',
      description: '',
      status: 'active'
    }
  }
  dialogVisible.value = true
}

// 保存业务
const saveBusiness = () => {
  if (!form.value.code || !form.value.name) {
    ElMessage.warning('请填写必填项')
    return
  }
  // TODO: 调用API保存
  ElMessage.success(form.value.id ? '更新成功' : '创建成功')
  dialogVisible.value = false
  loadBusinessList()
}

// 删除业务
const deleteBusiness = (id) => {
  ElMessageBox.confirm('确定要删除该业务吗？删除后该业务下的所有流程也将被删除', '提示', {
    type: 'warning'
  }).then(() => {
    // TODO: 调用API删除
    ElMessage.success('删除成功')
    loadBusinessList()
  }).catch(() => {})
}

// 创建流程
const createProcess = (business) => {
  currentBusiness.value = business
  processForm.value = {
    id: null,
    businessId: business.id,
    code: '',
    name: '',
    description: '',
    version: '1.0.0',
    status: 'active'
  }
  processDialogVisible.value = true
}

// 设计流程（进入画布编辑）
const designProcess = (business, process) => {
  router.push({
    name: 'engine-process',
    query: {
      businessId: business.id,
      businessCode: business.code,
      processId: process.id,
      processCode: process.code
    }
  })
}

// 编辑流程基础信息
const editProcessInfo = (business, process) => {
  currentBusiness.value = business
  processForm.value = { ...process }
  processDialogVisible.value = true
}

// 保存流程基础信息
const saveProcess = () => {
  if (!processForm.value.code || !processForm.value.name) {
    ElMessage.warning('请填写必填项')
    return
  }
  // TODO: 调用API保存
  ElMessage.success(processForm.value.id ? '更新成功' : '创建成功')
  processDialogVisible.value = false
  
  // 如果是新建流程，保存后跳转到流程设计器
  if (!processForm.value.id) {
    router.push({
      name: 'engine-process',
      query: {
        businessId: processForm.value.businessId,
        businessCode: currentBusiness.value.code,
        processId: 'new',
        processCode: processForm.value.code
      }
    })
  }
  
  // 重新加载流程列表
  loadProcessList(processForm.value.businessId)
}

// 复制流程
const copyProcess = (business, process) => {
  currentBusiness.value = business
  processForm.value = {
    id: null,
    businessId: business.id,
    code: `${process.code}_copy`,
    name: `${process.name}_副本`,
    description: process.description,
    version: '1.0.0',
    status: 'inactive'
  }
  processDialogVisible.value = true
}

// 删除流程
const deleteProcess = (business, processId) => {
  ElMessageBox.confirm('确定要删除该流程吗？', '提示', {
    type: 'warning'
  }).then(() => {
    // TODO: 调用API删除
    const list = processListMap.value[business.id] || []
    const index = list.findIndex(p => p.id === processId)
    if (index > -1) {
      list.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 处理流程操作
const handleProcessAction = (command, business, process) => {
  switch (command) {
    case 'edit':
      editProcessInfo(business, process)
      break
    case 'copy':
      copyProcess(business, process)
      break
    case 'delete':
      deleteProcess(business, process.id)
      break
  }
}

onMounted(() => {
  loadBusinessList()
})
</script>

<style scoped>
.page-wrapper {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.panel-card {
  margin-bottom: 20px;
}

.process-list-container {
  padding: 24px;
  background: #fafbfc;
  border-top: 1px solid #ebeef5;
}

.process-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.process-list-title {
  font-weight: 600;
  font-size: 15px;
  color: #303133;
}

.process-list-content {
  min-height: 60px;
}

.empty-process {
  padding: 40px 0;
  text-align: center;
}

.process-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.process-card {
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s;
}

.process-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-color: #c0c4cc;
}

.process-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.process-info {
  flex: 1;
  min-width: 0;
}

.process-name-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.process-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.process-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #909399;
}

.meta-item .el-icon {
  font-size: 14px;
}

.process-description {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f0f2f5;
}

.process-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>

