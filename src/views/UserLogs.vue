<template>
  <div class="user-logs">
    <div class="page-header">
      <h2>动态日志</h2>
      <p v-if="userName">用户：{{ userName }}</p>
    </div>
    
    <div class="page-content">
      <!-- 筛选条件 -->
      <div class="filter-section">
        <el-form :model="filterForm" inline>
          <el-form-item label="事件类型">
            <el-select v-model="filterForm.eventType" placeholder="全部" clearable style="width: 150px">
              <el-option label="全部" value="" />
              <el-option label="登录" value="login" />
              <el-option label="登出" value="logout" />
              <el-option label="密码修改" value="password_change" />
              <el-option label="注册" value="register" />
              <el-option label="身份变更" value="identity_change" />
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="filterForm.dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 380px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 日志列表 -->
      <el-table :data="filteredLogs" border stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="eventTime" label="时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.eventTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="eventType" label="事件类型" width="120">
          <template #default="scope">
            <el-tag :type="getEventTypeTagType(scope.row.eventType)" size="small">
              {{ getEventTypeLabel(scope.row.eventType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="eventContent" label="事件内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="city" label="城市" width="120" />
        <el-table-column prop="application" label="应用" width="150" />
        <el-table-column prop="device" label="设备" width="150" />
        <el-table-column prop="ip" label="IP地址" width="140" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="handleViewDetail(scope.row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
    
    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="日志详情"
      width="600px"
    >
      <el-descriptions :column="2" border v-if="selectedLog">
        <el-descriptions-item label="时间">
          {{ formatDateTime(selectedLog.eventTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="事件类型">
          <el-tag :type="getEventTypeTagType(selectedLog.eventType)" size="small">
            {{ getEventTypeLabel(selectedLog.eventType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="事件内容" :span="2">
          {{ selectedLog.eventContent }}
        </el-descriptions-item>
        <el-descriptions-item label="城市">
          {{ selectedLog.city || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="应用">
          {{ selectedLog.application || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="设备">
          {{ selectedLog.device || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="IP地址">
          {{ selectedLog.ip || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Search, Refresh } from '@element-plus/icons-vue'

const route = useRoute()

// 响应式数据
const loading = ref(false)
const userName = ref(route.query.userName || '')
const userId = ref(route.query.userId || '')
const detailDialogVisible = ref(false)
const selectedLog = ref(null)

// 筛选表单
const filterForm = ref({
  eventType: '',
  dateRange: null
})

// 分页
const pagination = ref({
  page: 1,
  size: 20,
  total: 0
})

// 模拟日志数据
const logs = ref([
  {
    id: 'log-1',
    userId: 'user-1',
    eventType: 'login',
    eventTime: new Date('2024-01-15 09:30:00'),
    eventContent: '用户登录系统',
    city: '上海',
    application: 'Web端',
    device: 'Windows 10 / Chrome 120',
    ip: '192.168.1.100'
  },
  {
    id: 'log-2',
    userId: 'user-1',
    eventType: 'password_change',
    eventTime: new Date('2024-01-15 10:15:00'),
    eventContent: '用户修改了登录密码',
    city: '上海',
    application: 'Web端',
    device: 'Windows 10 / Chrome 120',
    ip: '192.168.1.100'
  },
  {
    id: 'log-3',
    userId: 'user-1',
    eventType: 'identity_change',
    eventTime: new Date('2024-01-15 14:20:00'),
    eventContent: '用户身份从访客变更为认证用户',
    city: '上海',
    application: 'Web端',
    device: 'Windows 10 / Chrome 120',
    ip: '192.168.1.100'
  },
  {
    id: 'log-4',
    userId: 'user-1',
    eventType: 'logout',
    eventTime: new Date('2024-01-15 18:00:00'),
    eventContent: '用户退出系统',
    city: '上海',
    application: 'Web端',
    device: 'Windows 10 / Chrome 120',
    ip: '192.168.1.100'
  },
  {
    id: 'log-5',
    userId: 'user-1',
    eventType: 'login',
    eventTime: new Date('2024-01-16 08:45:00'),
    eventContent: '用户登录系统',
    city: '北京',
    application: '移动端',
    device: 'iOS 17 / Safari',
    ip: '10.0.0.50'
  },
  {
    id: 'log-6',
    userId: 'user-2',
    eventType: 'register',
    eventTime: new Date('2024-01-10 10:00:00'),
    eventContent: '新用户注册',
    city: '深圳',
    application: 'Web端',
    device: 'macOS / Chrome 120',
    ip: '172.16.0.10'
  }
])

// 过滤后的日志
const filteredLogs = computed(() => {
  let result = logs.value
  
  // 如果传入了userId，只显示该用户的日志
  if (userId.value) {
    result = result.filter(log => log.userId === userId.value)
  }
  
  // 按事件类型筛选
  if (filterForm.value.eventType) {
    result = result.filter(log => log.eventType === filterForm.value.eventType)
  }
  
  // 按时间范围筛选
  if (filterForm.value.dateRange && filterForm.value.dateRange.length === 2) {
    const [start, end] = filterForm.value.dateRange
    result = result.filter(log => {
      const logTime = new Date(log.eventTime).getTime()
      return logTime >= new Date(start).getTime() && logTime <= new Date(end).getTime()
    })
  }
  
  // 更新总数
  pagination.value.total = result.length
  
  // 分页
  const start = (pagination.value.page - 1) * pagination.value.size
  const end = start + pagination.value.size
  return result.slice(start, end)
})

// 获取事件类型标签
const getEventTypeLabel = (type) => {
  const map = {
    login: '登录',
    logout: '登出',
    password_change: '密码修改',
    register: '注册',
    identity_change: '身份变更'
  }
  return map[type] || type
}

// 获取事件类型标签颜色
const getEventTypeTagType = (type) => {
  const map = {
    login: 'success',
    logout: 'info',
    password_change: 'warning',
    register: 'primary',
    identity_change: 'danger'
  }
  return map[type] || ''
}

// 格式化日期时间
const formatDateTime = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 搜索
const handleSearch = () => {
  pagination.value.page = 1
}

// 重置
const handleReset = () => {
  filterForm.value = {
    eventType: '',
    dateRange: null
  }
  pagination.value.page = 1
}

// 查看详情
const handleViewDetail = (row) => {
  selectedLog.value = row
  detailDialogVisible.value = true
}

// 分页变化
const handleSizeChange = (size) => {
  pagination.value.size = size
  pagination.value.page = 1
}

const handlePageChange = (page) => {
  pagination.value.page = page
}

// 初始化
onMounted(() => {
  // 可以在这里加载数据
})
</script>

<style scoped>
.user-logs {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 20px;
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

.page-content {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>

