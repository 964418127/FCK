<template>
  <div class="business-management">
    <div class="page-header">
      <h2>业务管理</h2>
      <el-button type="primary" @click="handleAddBusiness">
        <el-icon-plus /> 新增业务
      </el-button>
    </div>
    
    <div class="business-content">
      <!-- 业务列表 -->
      <el-card shadow="hover" class="business-list-card">
        <el-table :data="businessList" style="width: 100%" @row-click="handleRowClick">
          <el-table-column prop="id" label="业务ID" width="150" />
          <el-table-column prop="name" label="业务名称" min-width="200" />
          <el-table-column prop="description" label="业务描述" min-width="300" />
          <el-table-column prop="status" label="状态" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
                {{ scope.row.status === 'active' ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="200">
            <template #default="scope">
              {{ formatDate(scope.row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="updateTime" label="更新时间" width="200">
            <template #default="scope">
              {{ formatDate(scope.row.updateTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="210" fixed="right">
            <template #default="scope">
              <div class="action-cell">
                <el-button size="small" type="primary" @click.stop="handleEditBusiness(scope.row)">
                  编辑
                </el-button>
                <el-dropdown trigger="click">
                  <span class="more-link" @click.stop>
                    更多
                    <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click.stop="handleToggleStatus(scope.row)">
                        {{ scope.row.status === 'active' ? '禁用' : '启用' }}
                      </el-dropdown-item>
                      <el-dropdown-item @click.stop="handleDeleteBusiness(scope.row)">删除</el-dropdown-item>
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
            :total="businessList.length"
          />
        </div>
      </el-card>
    </div>
    
    <!-- 业务表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑业务' : '新增业务'"
      width="500px"
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="业务名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入业务名称" />
        </el-form-item>
        <el-form-item label="业务描述" prop="description">
          <el-input 
            v-model="formData.description" 
            type="textarea" 
            rows="3" 
            placeholder="请输入业务描述"
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
          <el-button type="primary" @click="handleSaveBusiness">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { businesses as mockBusinesses } from '../mock/data'

// 响应式数据
const businessList = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const selectedBusiness = ref(null)
const formRef = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)

// 表单数据
const formData = ref({
  id: '',
  name: '',
  description: '',
  status: 'active'
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入业务名称', trigger: 'blur' },
    { min: 1, max: 50, message: '业务名称长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '业务描述长度不超过 200 个字符', trigger: 'blur' }
  ]
}

// 初始化业务数据
const initBusinesses = () => {
  businessList.value = [...mockBusinesses]
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

// 新增业务
const handleAddBusiness = () => {
  isEdit.value = false
  formData.value = {
    id: `business-${Date.now()}`,
    name: '',
    description: '',
    status: 'active'
  }
  dialogVisible.value = true
}

// 编辑业务
const handleEditBusiness = (row) => {
  isEdit.value = true
  formData.value = { ...row }
  dialogVisible.value = true
}

// 切换业务状态
const handleToggleStatus = (row) => {
  const newStatus = row.status === 'active' ? 'inactive' : 'active'
  ElMessageBox.confirm(
    `确定要${newStatus === 'active' ? '启用' : '禁用'}该业务吗？`,
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

// 删除业务
const handleDeleteBusiness = (row) => {
  ElMessageBox.confirm(
    '确定要删除该业务吗？删除后不可恢复',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }
  ).then(() => {
    const index = businessList.value.findIndex(b => b.id === row.id)
    if (index > -1) {
      businessList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    // 取消操作
  })
}

// 保存业务
const handleSaveBusiness = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        // 编辑业务
        const index = businessList.value.findIndex(b => b.id === formData.value.id)
        if (index > -1) {
          businessList.value[index] = { ...formData.value, updateTime: new Date() }
          ElMessage.success('编辑成功')
        }
      } else {
        // 新增业务
        businessList.value.push({
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

// 行点击事件
const handleRowClick = (row) => {
  selectedBusiness.value = { ...row }
}

// 初始化
onMounted(() => {
  initBusinesses()
})
</script>

<style scoped>
.business-management {
  padding: 20px;
}

.business-list-card :deep(.el-table .cell) {
  display: flex;
  align-items: center;
}

.action-cell {
  display: flex;
  align-items: center;
  gap: 10px;
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
}

.business-content {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.business-list-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>