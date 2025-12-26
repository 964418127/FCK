<template>
  <div class="brand-role-page">
    <div class="page-header">
      <div>
        <h2>品牌角色</h2>
        <p>为每个品牌配置专属的角色体系，支持品牌超管与员工角色</p>
      </div>
      <el-button type="primary" @click="handleAddRole">
        <el-icon><Plus /></el-icon>
        新增品牌角色
      </el-button>
    </div>

    <div class="page-content">
      <!-- 搜索栏 -->
      <div class="search-section">
        <el-input
          v-model="searchForm.keyword"
          placeholder="搜索品牌名称、角色名称、身份编码"
          style="width: 300px"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="searchForm.brandId"
          placeholder="筛选品牌"
          clearable
          style="width: 150px"
        >
          <el-option
            v-for="brand in brands"
            :key="brand.id"
            :label="brand.name"
            :value="brand.id"
          />
        </el-select>
        <el-select
          v-model="searchForm.roleType"
          placeholder="筛选角色类型"
          clearable
          style="width: 150px"
        >
          <el-option label="品牌超管" value="super" />
          <el-option label="品牌员工" value="employee" />
        </el-select>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </div>

      <el-table :data="filteredBrandRoles" border stripe style="width: 100%">
        <el-table-column label="角色类型" width="120" fixed="left">
          <template #default="scope">
            <el-tag
              type="primary"
              size="small"
            >
              品牌员工
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="roleCode" label="身份编码" width="180" fixed="left">
          <template #default="scope">
            <el-tag size="small" type="info">{{ scope.row.roleCode || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="brandName" label="所属品牌" width="140" />
        <el-table-column prop="roleName" label="角色名称" min-width="160" />
        <el-table-column prop="description" label="角色描述" min-width="260" show-overflow-tooltip />
        <el-table-column prop="permissions" label="权限数量" width="120">
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
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button type="primary" size="small" @click="handleConfigurePermission(scope.row)">
                工作权限
              </el-button>
              <el-button type="success" size="small" @click="handleConfigureScope(scope.row)">
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="520px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="所属品牌" prop="brandId">
          <el-select v-model="formData.brandId" placeholder="请选择品牌" style="width: 100%" @change="handleBrandChange">
            <el-option v-for="brand in brands" :key="brand.id" :label="brand.name" :value="brand.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色类型" prop="isSuperAdmin">
          <el-radio-group v-model="formData.isSuperAdmin">
            <el-radio :label="true">品牌超管</el-radio>
            <el-radio :label="false">员工角色</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="formData.roleName" placeholder="请输入角色名称" @blur="autoFillRoleCode" />
          <div class="form-tip">示例：品牌超级管理员、员工初始角色、品牌运营总监、客情维护专员</div>
        </el-form-item>
        <el-form-item label="身份编码" prop="roleCode">
          <el-input v-model="formData.roleCode" placeholder="自动生成，可手动微调" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            rows="3"
            placeholder="请输入角色描述，说明职责范围"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowDown, Search, Refresh } from '@element-plus/icons-vue'

const brands = ref([
  { id: 'brand-1', name: '品牌A' },
  { id: 'brand-2', name: '品牌B' },
  { id: 'brand-3', name: '品牌C' }
])

// 模拟业务数据
const businesses = ref([
  { id: 'business-1', name: '服务订单系统' },
  { id: 'business-2', name: '会员管理系统' },
  { id: 'business-3', name: '营销活动系统' }
])

// 搜索表单
const searchForm = ref({
  keyword: '',
  brandId: '',
  roleType: ''
})

const brandRoles = ref([
  {
    id: 'brand-role-super-1',
    brandId: 'brand-1',
    brandName: '品牌A',
    roleName: '品牌超级管理员',
    roleCode: 'BRAND-1-SUPER',
    isSuperAdmin: true,
    description: '品牌A最高权限角色，负责品牌全局配置',
    permissions: ['page', 'button', 'api'],
    processRoles: [{ processId: 'process-1' }] // 参与的业务流程
  },
  {
    id: 'brand-role-init-1',
    brandId: 'brand-1',
    brandName: '品牌A',
    roleName: '员工初始角色',
    roleCode: 'BRAND-1-INIT',
    isSuperAdmin: false,
    description: '新员工默认角色，拥有基础操作权限',
    permissions: ['page'],
    processRoles: [{ processId: 'process-1' }]
  },
  {
    id: 'brand-role-ops-1',
    brandId: 'brand-1',
    brandName: '品牌A',
    roleName: '品牌运营总监',
    roleCode: 'BRAND-1-OPS',
    isSuperAdmin: false,
    description: '负责品牌运营策略与执行的核心角色',
    permissions: ['page', 'button'],
    processRoles: [{ processId: 'process-2' }]
  },
  {
    id: 'brand-role-care-1',
    brandId: 'brand-1',
    brandName: '品牌A',
    roleName: '客情维护专员',
    roleCode: 'BRAND-1-CRM',
    isSuperAdmin: false,
    description: '聚焦客户维护与回访的岗位角色',
    permissions: ['page'],
    processRoles: []
  },
  {
    id: 'brand-role-super-2',
    brandId: 'brand-2',
    brandName: '品牌B',
    roleName: '品牌超级管理员',
    roleCode: 'BRAND-2-SUPER',
    isSuperAdmin: true,
    description: '品牌B最高权限角色',
    permissions: ['page', 'button', 'api'],
    processRoles: [{ processId: 'process-3' }]
  }
])

const dialogVisible = ref(false)
const dialogTitle = ref('新增品牌角色')
const formRef = ref(null)
const formData = ref({
  id: '',
  brandId: '',
  roleName: '',
  roleCode: '',
  isSuperAdmin: false,
  description: ''
})

const rules = {
  brandId: [{ required: true, message: '请选择所属品牌', trigger: 'change' }],
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleCode: [{ required: true, message: '请输入身份编码', trigger: 'blur' }]
}

const handleAddRole = () => {
  dialogTitle.value = '新增品牌角色'
  formData.value = {
    id: '',
    brandId: brands.value[0]?.id || '',
    roleName: '',
    roleCode: '',
    isSuperAdmin: false,
    description: ''
  }
  dialogVisible.value = true
}

const handleEditRole = (row) => {
  dialogTitle.value = '编辑品牌角色'
  formData.value = { ...row }
  dialogVisible.value = true
}

const handleDeleteRole = (row) => {
  ElMessageBox.confirm(`确认删除品牌「${row.brandName}」的角色「${row.roleName}」吗？`, '提示', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      brandRoles.value = brandRoles.value.filter((item) => item.id !== row.id)
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

const handleConfigurePermission = (row) => {
  ElMessage.info(`模拟打开【${row.roleName}】的工作权限配置`)
}

const handleConfigureScope = (row) => {
  ElMessage.info(`模拟打开【${row.roleName}】的容器范围配置`)
}

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (!valid) return
    const brand = brands.value.find((b) => b.id === formData.value.brandId)
    const payload = {
      ...formData.value,
      brandName: brand ? brand.name : formData.value.brandId,
      permissions: formData.value.permissions || []
    }
    if (payload.id) {
      brandRoles.value = brandRoles.value.map((item) => (item.id === payload.id ? payload : item))
      ElMessage.success('品牌角色已更新')
    } else {
      payload.id = `brand-role-${Date.now()}`
      brandRoles.value.push(payload)
      ElMessage.success('品牌角色已新增')
    }
    dialogVisible.value = false
  })
}

const autoFillRoleCode = () => {
  if (!formData.value.roleName || !formData.value.brandId) return
  if (formData.value.roleCode) return
  formData.value.roleCode = generateRoleCode(formData.value.brandId, formData.value.roleName)
}

const handleBrandChange = () => {
  if (formData.value.roleName && !formData.value.roleCode) {
    formData.value.roleCode = generateRoleCode(formData.value.brandId, formData.value.roleName)
  }
}

const generateRoleCode = (brandId, roleName) => {
  const brandSuffix = (brandId || '').split('-')[1] || brandId || 'BRAND'
  const normalized = roleName
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5-]/g, '')
    .toUpperCase()
  return `${brandSuffix}-${normalized || 'ROLE'}`
}

// 模拟业务流程数据（实际应该从API获取）
const businessProcesses = ref([
  { id: 'process-1', name: '订单处理流程', businessId: 'business-1' },
  { id: 'process-2', name: '运营审核流程', businessId: 'business-3' },
  { id: 'process-3', name: '会员管理流程', businessId: 'business-2' }
])

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

// 过滤后的品牌角色列表
const filteredBrandRoles = computed(() => {
  let result = [...brandRoles.value]
  
  // 关键词搜索
  if (searchForm.value.keyword) {
    const keyword = searchForm.value.keyword.toLowerCase()
    result = result.filter(item =>
      (item.brandName && item.brandName.toLowerCase().includes(keyword)) ||
      (item.roleName && item.roleName.toLowerCase().includes(keyword)) ||
      (item.roleCode && item.roleCode.toLowerCase().includes(keyword))
    )
  }
  
  // 品牌筛选
  if (searchForm.value.brandId) {
    result = result.filter(item => item.brandId === searchForm.value.brandId)
  }
  
  // 角色类型筛选
  if (searchForm.value.roleType) {
    if (searchForm.value.roleType === 'super') {
      result = result.filter(item => item.isSuperAdmin)
    } else if (searchForm.value.roleType === 'employee') {
      result = result.filter(item => !item.isSuperAdmin)
    }
  }
  
  return result
})

// 搜索
const handleSearch = () => {
  // 搜索逻辑已在computed中实现
}

// 重置搜索
const handleReset = () => {
  searchForm.value = {
    keyword: '',
    brandId: '',
    roleType: ''
  }
}
</script>

<style scoped>
.brand-role-page {
  padding: 16px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0 0 4px 0;
}

.page-header p {
  margin: 0;
  color: #606266;
}

.page-content {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.more-link {
  display: inline-flex;
  align-items: center;
  color: var(--el-color-primary);
  cursor: pointer;
  user-select: none;
}

.role-name-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.role-type-tag {
  min-width: 70px;
  text-align: center;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.search-section {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  align-items: center;
}

.empty-text {
  color: #909399;
  font-size: 12px;
}
</style>

