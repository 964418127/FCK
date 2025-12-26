<template>
  <div class="organization-container">
    <div class="organization-header">
      <h2>组织架构管理</h2>
    </div>
    
    <div class="organization-tabs">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="组织视图" name="employee">
          <OrganizationEmployeeView 
            :users="users"
            :departments="departments"
            :positions="positions"
            :work-posts="workPosts"
            @update:users="updateUsers"
            @update:departments="updateDepartments"
            @update:work-posts="(posts) => workPosts.value = posts"
            @edit-user="handleEditUser"
            @quick-add-child="handleQuickAddChild"
          />
        </el-tab-pane>
        <el-tab-pane label="组织管理" name="department">
          <DepartmentManagement 
            :departments="departments" 
            @update:departments="updateDepartments"
          />
        </el-tab-pane>
        <el-tab-pane label="岗位管理" name="position">
          <PositionManagement 
            :positions="positions" 
            :departments="departments"
            :work-posts="workPosts"
            @update:positions="updatePositions"
            @create-work-posts="handleCreateWorkPosts"
            @allocate-work-posts="handleAllocateWorkPosts"
          />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DepartmentManagement from './DepartmentManagement.vue'
import PositionManagement from './PositionManagement.vue'
import OrganizationEmployeeView from './OrganizationEmployeeView.vue'
import { departments as mockDepartments, positions as mockPositions, users as mockUsers, workPosts as mockWorkPosts, extraUsersWithoutWorkPost } from '../mock/data.js'

// 响应式数据
const activeTab = ref('employee')
const departments = ref([])
const positions = ref([])
const users = ref([])
const workPosts = ref([])

// 生命周期钩子
onMounted(() => {
  // 初始化数据
  if (!departments.value || departments.value.length === 0) departments.value = mockDepartments
  if (!positions.value || positions.value.length === 0) positions.value = mockPositions
  if (!users.value || users.value.length === 0) users.value = [...mockUsers, ...(extraUsersWithoutWorkPost || [])]
  if (!workPosts.value || workPosts.value.length === 0) workPosts.value = mockWorkPosts || []
  // 若 mockWorkPosts 为空，则根据现有 users 自动生成 assigned workPosts 以兼容老数据结构
  if ((!mockWorkPosts || mockWorkPosts.length === 0) && users && users.length) {
    const countMap = {} // key = `${positionId}::${departmentId}` -> seq
    const generated = []
    for (const u of users.value) {
      const posId = u.positionId
      const deptId = u.departmentId || ''
      if (!posId) continue
      const pos = positions.value.find(p => p.id === posId)
      const mainCode = pos?.code || posId
      const key = `${posId}::${deptId}`
      const seq = (countMap[key] || 0) + 1
      countMap[key] = seq
      const suffix = String(seq).padStart(2, '0')
      const postCode = `${mainCode}-${suffix}`
      const post = {
        id: `wp-gen-${posId}-${deptId}-${seq}`,
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
      workPosts.value = generated
    }
  }
  // 如果有 workPosts 数据，但部分用户尚未有对应的工作岗位，尝试分配已有空缺或生成新的工作岗位并与用户关联
  if (mockWorkPosts && mockWorkPosts.length > 0 && users && users.length) {
    // map assigned user ids
    const assignedUserIds = new Set((workPosts.value || []).filter(w => w.assignedUserId).map(w => w.assignedUserId))
    // helper to get next seq per position+dept
    const seqMap = {}
    const incrementSeq = (posId, deptId) => {
      const key = `${posId}::${deptId}`
      seqMap[key] = (seqMap[key] || 0) + 1
      return seqMap[key]
    }
    // initialize seqMap with existing counts
    for (const wp of workPosts.value) {
      const key = `${wp.mainPositionId}::${wp.departmentId || ''}`
      seqMap[key] = (seqMap[key] || 0) + 1
    }
    const newPosts = []
    for (const u of users.value) {
      if (!u.positionId) continue
      if (assignedUserIds.has(u.id)) continue
      // try find an unassigned workPost matching position and department
      const match = (workPosts.value || []).find(w => w.mainPositionId === u.positionId && (w.departmentId === u.departmentId) && !w.assignedUserId)
      if (match) {
        match.assignedUserId = u.id
        match.status = 'filled'
        assignedUserIds.add(u.id)
      } else {
        // create new filled workPost for this user
        const pos = positions.value.find(p => p.id === u.positionId)
        const mainCode = pos?.code || u.positionId
        const seq = incrementSeq(u.positionId, u.departmentId || '')
        const suffix = String(seq).padStart(2, '0')
        const postCode = `${mainCode}-${suffix}`
        const post = {
          id: `wp-auto-${u.id}-${Date.now()}`,
          mainPositionId: u.positionId,
          mainPositionCode: mainCode,
          postCode,
          departmentId: u.departmentId || null,
          assignedUserId: u.id,
          status: 'filled'
        }
        newPosts.push(post)
        assignedUserIds.add(u.id)
      }
    }
    if (newPosts.length) {
      workPosts.value = [...workPosts.value, ...newPosts]
    }
  }
})

// 处理标签页切换
const handleTabChange = (tab) => {
  console.log('切换到标签页:', tab)
}

// 更新部门数据
const updateDepartments = (newDepartments) => {
  departments.value = newDepartments
}

// 更新岗位数据
const updatePositions = (newPositions) => {
  positions.value = newPositions
}

// 更新用户数据
const updateUsers = (newUsers) => {
  users.value = newUsers
}

// 处理编辑用户
const handleEditUser = (user) => {
  // 可以在这里打开用户编辑对话框或跳转到用户管理页面
  console.log('编辑用户:', user)
}

// 处理快速新增子节点（现在在OrganizationEmployeeView中直接处理，这里不需要做任何事）
const handleQuickAddChild = (nodeData) => {
  // 快速新增功能已在OrganizationEmployeeView中直接实现，不需要切换标签
}

// 父组件处理创建的工作岗位（由岗位管理触发）
const handleCreateWorkPosts = (posts) => {
  if (!posts || !Array.isArray(posts) || posts.length === 0) return
  workPosts.value = [...workPosts.value, ...posts]
}

// 分配未分配工作岗位到指定部门
const handleAllocateWorkPosts = ({ positionId, departmentId, count }) => {
  if (!positionId || !departmentId || !count) return
  // find existing unassigned candidates for this position
  const candidates = workPosts.value.filter(w => w.mainPositionId === positionId && (w.departmentId === null || w.departmentId === undefined))
  const assignList = candidates.slice(0, count)
  let remaining = count - assignList.length

  // assign existing unallocated posts to target department
  assignList.forEach(wp => {
    const idx = workPosts.value.findIndex(x => x.id === wp.id)
    if (idx !== -1) workPosts.value[idx] = { ...workPosts.value[idx], departmentId }
  })

  // if still need more, generate new vacant posts and assign
  if (remaining > 0) {
    const pos = positions.value.find(p => p.id === positionId)
    const mainCode = pos?.code || positionId
    // compute next seq per position across all existing posts to keep postCode unique
    const existingCount = workPosts.value.filter(w => w.mainPositionId === positionId).length
    const newPosts = []
    for (let i = 1; i <= remaining; i++) {
      const seq = existingCount + i
      const postCode = `${mainCode}-${String(seq).padStart(2, '0')}`
      const post = {
        id: `wp-auto-${positionId}-${Date.now()}-${i}`,
        mainPositionId: positionId,
        mainPositionCode: mainCode,
        mainPositionName: pos?.name || '',
        postCode,
        departmentId,
        assignedUserId: null,
        status: 'vacant',
        fromBudget: false
      }
      newPosts.push(post)
    }
    if (newPosts.length) workPosts.value = [...workPosts.value, ...newPosts]
  }
  // no explicit emit needed; workPosts.value is reactive and passed down to children
}
</script>

<style scoped>
.organization-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.organization-header {
  margin-bottom: 20px;
}

.organization-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.organization-tabs {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}
</style>