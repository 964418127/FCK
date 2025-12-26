<template>
  <div class="user-management">
    <div class="user-header">
      <el-button type="primary" @click="handleAddUser">
        <el-icon><Plus /></el-icon>
        新增员工
      </el-button>
      <el-button type="success" @click="handleQuickPermissionConfig">
        <el-icon><Setting /></el-icon>
        快速权限配置
      </el-button>
    </div>
    
    <div class="user-content">
      <el-table :data="users" border stripe style="width: 100%">
        <el-table-column prop="name" label="姓名" min-width="100" />
        <el-table-column prop="employeeNo" label="工号" min-width="120" />
        <el-table-column prop="uid" label="用户UID" min-width="150" />
        <el-table-column prop="username" label="用户名" min-width="150" />
        <el-table-column prop="departmentName" label="所属部门" min-width="150" />
        <el-table-column prop="positionName" label="岗位" min-width="120" />
        <el-table-column label="工作岗位编号" min-width="160">
          <template #default="scope">
            <span>{{ getUserWorkPostCode(scope.row) || '' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="角色" min-width="320">
          <template #default="scope">
            <div class="role-tags-container">
              <el-tag 
                v-for="roleItem in getRoleItems(scope.row.roles)" 
                :key="roleItem.roleId" 
                size="small" 
                style="margin-right: 5px; margin-bottom: 5px"
              >
                {{ getRoleName(roleItem.roleId) }}
                <span v-if="roleItem.expiryStart || roleItem.expiryEnd" class="role-expiry">
                  ({{ formatDateTime(roleItem.expiryStart) }} ~ {{ formatDateTime(roleItem.expiryEnd) }})
                </span>
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="170" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button 
                type="primary" 
                size="small" 
                @click="handleAssignRole(scope.row)"
              >
                分配角色
              </el-button>
              <el-dropdown trigger="click">
                <span class="more-link">
                  更多
                  <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleEditUser(scope.row)">编辑</el-dropdown-item>
                    <el-dropdown-item @click="handleDeleteUser(scope.row)">删除</el-dropdown-item>
                    <el-dropdown-item @click="handleResetPassword(scope.row)">重置密码</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 员工表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="工号" prop="employeeNo">
          <el-input v-model="formData.employeeNo" placeholder="请输入工号" />
        </el-form-item>
        <el-form-item label="用户UID" prop="uid">
          <el-input v-model="formData.uid" placeholder="请输入统一用户UID（可选）" />
          <div class="form-tip">关联平台统一用户UID，如果该员工同时也是平台用户，请填写</div>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="所属部门" prop="departmentId">
          <el-tree-select
            v-model="formData.departmentId"
            :data="departments"
            :props="treeProps"
            placeholder="请选择所属部门"
            style="width: 100%"
            check-strictly
            :render-after-expand="false"
            default-expand-all
            :render-label="renderDeptLabel"
          />
        </el-form-item>
        <el-form-item label="岗位" prop="positionId">
          <el-select 
            v-model="formData.positionId" 
            placeholder="请选择岗位" 
            style="width: 100%"
            filterable
          >
            <el-option 
              v-for="position in allPositions" 
              :key="position.id" 
              :label="position.name" 
              :value="position.id"
            >
              <span>{{ position.name }}</span>
              <span style="color: #909399; font-size: 12px; margin-left: 10px">
                {{ position.description }}
              </span>
            </el-option>
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
    
    <!-- 分配角色对话框 -->
    <el-dialog
      v-model="roleDialogVisible"
      title="分配角色"
      width="600px"
    >
      <div class="role-assign-container">
        <h4>{{ selectedUser?.name }} - 角色分配</h4>
        <div class="role-list" style="margin-top: 20px">
          <div 
            v-for="role in roles" 
            :key="role.id" 
            class="role-item"
          >
            <el-checkbox 
              v-model="selectedRolesMap[role.id].selected"
              @change="handleRoleSelectionChange(role.id)"
            >
              {{ role.name }} - {{ role.description }}
            </el-checkbox>
            <el-date-picker
              v-if="selectedRolesMap[role.id].selected"
              v-model="selectedRolesMap[role.id].expiryRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始"
              end-placeholder="结束"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm"
              style="margin-left: 20px; width: 320px"
            />
          </div>
        </div>
        <div class="role-tip" style="margin-top: 15px; color: #909399; font-size: 12px">
          <el-icon><InfoFilled /></el-icon>
          提示：不设置有效期表示角色永久有效
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveRoles">保存角色</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 快速权限配置对话框 -->
    <el-dialog
      v-model="quickPermissionDialogVisible"
      title="快速权限配置"
      width="800px"
      fullscreen
    >
      <QuickPermissionConfig 
        @close="quickPermissionDialogVisible = false"
        @complete="handleQuickPermissionComplete"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { InfoFilled, Plus, Setting, ArrowDown } from '@element-plus/icons-vue'
import { users as mockUsers, departments as mockDepartments, positions as mockPositions, roles as mockRoles, workPosts as mockWorkPosts } from '../mock/data.js'
import QuickPermissionConfig from './QuickPermissionConfig.vue'

// 接收父组件传入的props
const props = defineProps({
  users: {
    type: Array,
    default: () => []
  }
})

// 定义事件
const emit = defineEmits(['update:users'])

// 响应式数据
const dialogVisible = ref(false)
const roleDialogVisible = ref(false)
const quickPermissionDialogVisible = ref(false)
const dialogTitle = ref('新增员工')
const formRef = ref(null)
const isEdit = ref(false)
const selectedUser = ref(null)
const selectedRoleIds = ref([])
const selectedRolesMap = ref({})
const formData = ref({
  id: '',
  name: '',
  employeeNo: '',
  uid: '',
  username: '',
  departmentId: '',
  departmentName: '',
  positionId: '',
  positionName: '',
  roles: [],
  attributes: {}
})

// 模拟数据
const users = ref(mockUsers)
const departments = ref(mockDepartments)
const allPositions = ref(mockPositions)
const roles = ref(mockRoles)
const workPosts = ref(mockWorkPosts || [])

// 若 mockWorkPosts 中没有为多数用户生成 assignedUserId，则在本组件 mount 时补齐，保证 /user 页面直接打开也能看到工作岗位编号
onMounted(() => {
  if ((!workPosts.value || workPosts.value.length === 0) && users.value && users.value.length) {
    const seqMap = {}
    const generated = []
    for (const u of users.value) {
      const posId = u.positionId
      const deptId = u.departmentId || ''
      if (!posId) continue
      const key = `${posId}::${deptId}`
      seqMap[key] = (seqMap[key] || 0) + 1
      const seq = seqMap[key]
      const pos = allPositions.value.find(p => p.id === posId)
      const mainCode = pos?.code || posId
      const suffix = String(seq).padStart(2, '0')
      const postCode = `${mainCode}-${suffix}`
      const post = {
        id: `wp-auto-${u.id}-${Date.now()}`,
        mainPositionId: posId,
        mainPositionCode: mainCode,
        postCode,
        departmentId: deptId || null,
        assignedUserId: u.id,
        status: 'filled'
      }
      generated.push(post)
    }
    if (generated.length) {
      workPosts.value = [...(workPosts.value || []), ...generated]
    }
  }
})

// 获取用户对应的工作岗位编号（如果有）
const getUserWorkPostCode = (user) => {
  if (!user || !workPosts.value) return ''
  const wp = workPosts.value.find(w => w.assignedUserId === user.id)
  return wp ? wp.postCode : ''
}

// 树形配置
const treeProps = {
  children: 'children',
  label: 'name',
  value: 'id'
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取角色项（支持新旧格式）
const getRoleItems = (roles) => {
  if (!roles || roles.length === 0) return []
  
  // 兼容旧格式（字符串数组）和新格式（对象数组）
  return roles.map(role => {
    if (typeof role === 'string') {
      return { roleId: role, expiryStart: null, expiryEnd: null }
    }
    return {
      roleId: role.roleId || role.id || role,
      expiryStart: role.expiryStart || null,
      expiryEnd: role.expiryEnd || null
    }
  })
}

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 1, max: 50, message: '姓名长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  employeeNo: [
    { required: true, message: '请输入工号', trigger: 'blur' },
    { min: 1, max: 50, message: '工号长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  uid: [
    { max: 100, message: '用户UID长度不超过 100 个字符', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  departmentId: [
    { required: true, message: '请选择所属部门', trigger: 'change' }
  ],
  positionId: [
    { required: true, message: '请选择岗位', trigger: 'change' }
  ]
}

// 生命周期钩子
onMounted(() => {
  if (props.users && props.users.length > 0) {
    users.value = props.users
  }
})

// 根据部门ID获取部门名称
const getDepartmentName = (departmentId) => {
  return getDepartmentPathLabel(departmentId) || ''
}

const getDepartmentPathLabel = (deptId) => {
  if (!deptId) return ''
  const path = []
  const dfs = (list) => {
    for (const item of list) {
      path.push(item)
      if (item.id === deptId) return true
      if (item.children && item.children.length > 0 && dfs(item.children)) return true
      path.pop()
    }
    return false
  }
  dfs(departments.value)
  return path.map(p => p.name || p.id).join(' / ')
}

const renderDeptLabel = ({ data }) => {
  return getDepartmentPathLabel(data.id) || data.name
}

// 根据岗位ID获取岗位名称
const getPositionName = (positionId) => {
  const position = allPositions.value.find(pos => pos.id === positionId)
  return position?.name || ''
}

// 根据角色ID获取角色名称
const getRoleName = (roleId) => {
  const role = roles.value.find(r => r.id === roleId)
  return role?.name || roleId
}

// 打开新增员工对话框
const handleAddUser = () => {
  isEdit.value = false
  dialogTitle.value = '新增员工'
  formData.value = {
    id: `user-${Date.now()}`,
    name: '',
    employeeNo: '',
    uid: '',
    username: '',
    departmentId: '',
    departmentName: '',
    positionId: '',
    positionName: '',
    roles: [],
    attributes: {}
  }
  dialogVisible.value = true
}

// 打开编辑员工对话框
const handleEditUser = (data) => {
  isEdit.value = true
  dialogTitle.value = '编辑员工'
  formData.value = JSON.parse(JSON.stringify(data))
  // 确保新字段存在
  if (!formData.value.employeeNo) {
    formData.value.employeeNo = ''
  }
  if (!formData.value.uid) {
    formData.value.uid = ''
  }
  dialogVisible.value = true
}

// 删除员工
const handleDeleteUser = (data) => {
  ElMessageBox.confirm('确定要删除该员工吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 实现删除逻辑
    const newUsers = users.value.filter(user => user.id !== data.id)
    users.value = newUsers
    emit('update:users', newUsers)
    ElMessage.success('员工删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 重置密码（占位提示）
const handleResetPassword = (user) => {
  ElMessage.success(`已触发 ${user.name || user.username} 的重置密码操作（占位）`)
}

// 打开分配角色对话框
const handleAssignRole = (user) => {
  selectedUser.value = JSON.parse(JSON.stringify(user))
  
  // 初始化角色映射
  selectedRolesMap.value = {}
  roles.value.forEach(role => {
    const roleItems = getRoleItems(user.roles)
    const existingRole = roleItems.find(r => r.roleId === role.id)
    selectedRolesMap.value[role.id] = {
      selected: !!existingRole,
      expiryRange: existingRole && (existingRole.expiryStart || existingRole.expiryEnd)
        ? [existingRole.expiryStart || '', existingRole.expiryEnd || '']
        : []
    }
  })
  
  roleDialogVisible.value = true
}

// 处理角色选择变化
const handleRoleSelectionChange = (roleId) => {
  if (!selectedRolesMap.value[roleId].selected) {
    selectedRolesMap.value[roleId].expiryRange = []
  }
}

// 保存角色分配
const handleSaveRoles = () => {
  if (!selectedUser.value) return
  
  // 构建角色数组（包含有效期）
  const newRoles = []
  Object.keys(selectedRolesMap.value).forEach(roleId => {
    if (selectedRolesMap.value[roleId].selected) {
      const roleItem = {
        roleId: roleId,
        expiryStart: selectedRolesMap.value[roleId].expiryRange?.[0] || null,
        expiryEnd: selectedRolesMap.value[roleId].expiryRange?.[1] || null
      }
      newRoles.push(roleItem)
    }
  })
  
  // 更新用户角色
  const updatedUser = {
    ...selectedUser.value,
    roles: newRoles
  }
  
  // 更新用户列表
  const newUsers = users.value.map(user => {
    if (user.id === updatedUser.id) {
      return updatedUser
    }
    return user
  })
  
  users.value = newUsers
  emit('update:users', newUsers)
  roleDialogVisible.value = false
  ElMessage.success('角色分配成功')
}

// 打开快速权限配置对话框
const handleQuickPermissionConfig = () => {
  quickPermissionDialogVisible.value = true
}

// 处理快速权限配置完成
const handleQuickPermissionComplete = (configData) => {
  // 这里可以添加权限配置完成后的处理逻辑
  ElMessage.success('快速权限配置完成')
  quickPermissionDialogVisible.value = false
}

// 提交表单
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      // 获取部门名称
      formData.value.departmentName = getDepartmentName(formData.value.departmentId)
      // 获取岗位名称
      formData.value.positionName = getPositionName(formData.value.positionId)
      
      let newUsers
      if (isEdit.value) {
        // 编辑用户
        newUsers = users.value.map(user => {
          if (user.id === formData.value.id) {
            return formData.value
          }
          return user
        })
      } else {
        // 新增用户
        newUsers = [...users.value, formData.value]
      }
      
      users.value = newUsers
      emit('update:users', newUsers)
      dialogVisible.value = false
      ElMessage.success(isEdit.value ? '员工更新成功' : '员工新增成功')
    } else {
      return false
    }
  })
}
</script>

<style scoped>
.user-management {
  width: 100%;
}

.user-header {
  margin-bottom: 20px;
}

.user-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.role-assign-container {
  padding: 10px 0;
}

.role-assign-container h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.role-list {
  max-height: 400px;
  overflow-y: auto;
}

.role-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.role-item:last-child {
  border-bottom: none;
}

.role-tags-container {
  display: flex;
  flex-wrap: wrap;
}

.role-expiry {
  font-size: 11px;
  color: #909399;
  margin-left: 4px;
}

.role-tip {
  display: flex;
  align-items: center;
  gap: 5px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: nowrap;
}

</style>