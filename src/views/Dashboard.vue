<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h2>仪表盘</h2>
      <p>欢迎使用权限管理系统</p>
    </div>
    
    <div class="dashboard-stats">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-value">{{ stats.organizationCount }}</div>
                <div class="stat-label">组织数量</div>
              </div>
              <div class="stat-icon organization">
                <el-icon-office-building />
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-value">{{ stats.departmentCount }}</div>
                <div class="stat-label">部门数量</div>
              </div>
              <div class="stat-icon department">
                <el-icon-s-grid />
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-value">{{ stats.positionCount }}</div>
                <div class="stat-label">岗位数量</div>
              </div>
              <div class="stat-icon position">
                <el-icon-s-promotion />
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-value">{{ stats.roleCount }}</div>
                <div class="stat-label">角色数量</div>
              </div>
              <div class="stat-icon role">
                <el-icon-key />
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-value">{{ stats.userCount }}</div>
                <div class="stat-label">用户数量</div>
              </div>
              <div class="stat-icon user">
                <el-icon-user />
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <div class="stat-info">
                <div class="stat-value">{{ stats.permissionCount }}</div>
                <div class="stat-label">权限数量</div>
              </div>
              <div class="stat-icon permission">
                <el-icon-s-order />
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <div class="dashboard-content">
      <el-row :gutter="20">
        <el-col :xs="24" :lg="12">
          <el-card shadow="hover" class="content-card">
            <template #header>
              <div class="card-header">
                <h3>最近操作</h3>
                <el-button type="text" size="small">查看全部</el-button>
              </div>
            </template>
            <el-timeline>
              <el-timeline-item
                v-for="(item, index) in recentOperations"
                :key="index"
                :timestamp="item.time"
              >
                <el-card>
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.description }}</p>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :lg="12">
          <el-card shadow="hover" class="content-card">
            <template #header>
              <div class="card-header">
                <h3>系统状态</h3>
              </div>
            </template>
            <div class="system-status">
              <div class="status-item">
                <span class="status-label">系统版本</span>
                <span class="status-value">{{ systemInfo.version }}</span>
              </div>
              <div class="status-item">
                <span class="status-label">运行时间</span>
                <span class="status-value">{{ systemInfo.uptime }}</span>
              </div>
              <div class="status-item">
                <span class="status-label">在线用户</span>
                <span class="status-value">{{ systemInfo.onlineUsers }}</span>
              </div>
              <div class="status-item">
                <span class="status-label">API请求</span>
                <span class="status-value">{{ systemInfo.apiRequests }}</span>
              </div>
              <div class="status-item">
                <span class="status-label">数据库状态</span>
                <span class="status-value">
                  <el-tag type="success">正常</el-tag>
                </span>
              </div>
              <div class="status-item">
                <span class="status-label">服务器状态</span>
                <span class="status-value">
                  <el-tag type="success">正常</el-tag>
                </span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { 
  departments as mockDepartments, 
  positions as mockPositions, 
  roles as mockRoles, 
  users as mockUsers,
  permissions as mockPermissions
} from '../mock/data.js'

// 响应式数据
const stats = ref({
  organizationCount: 1,
  departmentCount: 0,
  positionCount: 0,
  roleCount: 0,
  userCount: 0,
  permissionCount: 0
})

const recentOperations = ref([
  {
    time: '2024-01-15 14:30',
    title: '新增角色',
    description: '管理员新增了「运营专员」角色'
  },
  {
    time: '2024-01-15 13:15',
    title: '更新用户',
    description: '管理员更新了用户「张三」的信息'
  },
  {
    time: '2024-01-15 11:45',
    title: '分配权限',
    description: '管理员为「运营总监」角色分配了新的权限'
  },
  {
    time: '2024-01-15 10:20',
    title: '新增部门',
    description: '管理员新增了「运营二部」部门'
  },
  {
    time: '2024-01-14 16:30',
    title: '新增用户',
    description: '管理员新增了用户「李四」'
  }
])

const systemInfo = ref({
  version: '1.0.0',
  uptime: '23天 14小时 30分钟',
  onlineUsers: 128,
  apiRequests: '1,234,567'
})

// 生命周期钩子
onMounted(() => {
  // 计算统计数据
  stats.value.departmentCount = countDepartments(mockDepartments)
  stats.value.positionCount = mockPositions.length
  stats.value.roleCount = mockRoles.length
  stats.value.userCount = mockUsers.length
  stats.value.permissionCount = mockPermissions.length
})

// 计算部门数量（包括子部门）
const countDepartments = (departments) => {
  let count = 0
  const traverse = (deptList) => {
    deptList.forEach(dept => {
      count++
      if (dept.children && dept.children.length > 0) {
        traverse(dept.children)
      }
    })
  }
  traverse(departments)
  return count
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.dashboard-header {
  margin-bottom: 30px;
}

.dashboard-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.dashboard-header p {
  margin: 5px 0 0 0;
  color: #666;
  font-size: 14px;
}

/* 统计卡片 */
.dashboard-stats {
  margin-bottom: 30px;
}

.stat-card {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.stat-icon {
  font-size: 48px;
  opacity: 0.8;
}

.stat-icon.organization {
  color: #409eff;
}

.stat-icon.department {
  color: #67c23a;
}

.stat-icon.position {
  color: #e6a23c;
}

.stat-icon.role {
  color: #f56c6c;
}

.stat-icon.user {
  color: #909399;
}

.stat-icon.permission {
  color: #722ed1;
}

/* 内容卡片 */
.dashboard-content {
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

/* 最近操作 */
.el-timeline-item {
  padding: 0;
  margin-bottom: 20px;
}

.el-timeline-item .el-card {
  margin-left: 20px;
  border-radius: 8px;
}

.el-timeline-item .el-card h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.el-timeline-item .el-card p {
  margin: 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}

/* 系统状态 */
.system-status {
  padding: 10px 0;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f2f5;
}

.status-item:last-child {
  border-bottom: none;
}

.status-label {
  font-size: 14px;
  color: #606266;
}

.status-value {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}
</style>