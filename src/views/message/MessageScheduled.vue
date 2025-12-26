<template>
  <div class="message-scheduled">
    <div class="page-header">
      <h2>定时消息管理</h2>
      <p>管理业务场景触发的定时消息，支持撤销操作</p>
    </div>
    
    <div class="page-content">
      <!-- 搜索栏 -->
      <div class="search-section">
        <el-input
          v-model="searchForm.keyword"
          placeholder="搜索模板编号、用户UID、消息主题"
          style="width: 300px"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-date-picker
          v-model="searchForm.dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="计划发送时间"
          end-placeholder="计划发送时间"
          style="width: 400px"
        />
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </div>
      
      <!-- 消息列表 -->
      <el-table :data="filteredList" border stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="templateCode" label="模板编号" width="120" />
        <el-table-column prop="userUid" label="用户UID" width="120" />
        <el-table-column prop="subject" label="消息主题" min-width="150" show-overflow-tooltip />
        <el-table-column prop="content" label="消息内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="channel" label="消息通道" width="120">
          <template #default="scope">
            {{ formatChannel(scope.row.channel) }}
          </template>
        </el-table-column>
        <el-table-column prop="plannedTime" label="计划发送时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.plannedTime) }}
          </template>
        </el-table-column>
        <el-table-column label="来源" min-width="150">
          <template #default="scope">
            <div>业务触发：{{ scope.row.sceneDescription }}</div>
            <div style="font-size: 12px; color: #909399;">场景Code：{{ scope.row.sceneCode }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button type="danger" link @click="handleCancel(scope.row)">
              撤销
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const searchForm = ref({
  keyword: '',
  dateRange: null
})

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 模拟数据
const messageList = ref([
  {
    id: '1',
    templateCode: 'TPL003',
    userUid: 'U003',
    subject: '课程开始提醒',
    content: '您预约的课程将在30分钟后开始',
    channel: 'push',
    plannedTime: new Date('2024-01-16 14:00:00'),
    sourceType: 'business',
    sceneCode: 'COURSE_START',
    sceneDescription: '课程开始提醒'
  }
])

// 过滤后的列表
const filteredList = computed(() => {
  let list = [...messageList.value]
  
  if (searchForm.value.keyword) {
    const keyword = searchForm.value.keyword.toLowerCase()
    list = list.filter(item => 
      item.templateCode.toLowerCase().includes(keyword) ||
      item.userUid.toLowerCase().includes(keyword) ||
      item.subject.toLowerCase().includes(keyword)
    )
  }
  
  pagination.value.total = list.length
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return list.slice(start, end)
})

// 格式化函数
const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatChannel = (channel) => {
  const channelMap = {
    'inbox': '站内信',
    'push': 'App推送',
    'email': '邮件',
    'wechat': '微信模板消息',
    'sms': '短信'
  }
  return channelMap[channel] || channel
}

// 操作函数
const handleSearch = () => {
  pagination.value.currentPage = 1
}

const handleReset = () => {
  searchForm.value = {
    keyword: '',
    dateRange: null
  }
  pagination.value.currentPage = 1
}

const handleCancel = (row) => {
  ElMessageBox.confirm('确定要撤销该定时消息吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = messageList.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      messageList.value.splice(index, 1)
      ElMessage.success('撤销成功')
    }
  }).catch(() => {})
}

const handleSizeChange = (size) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
}

const handlePageChange = (page) => {
  pagination.value.currentPage = page
}
</script>

<style scoped>
.message-scheduled {
  padding: 0;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.page-header p {
  margin: 0;
  color: hsl(var(--muted-foreground));
  font-size: 14px;
}

.page-content {
  background: hsl(var(--background));
  border-radius: var(--radius-lg);
  padding: 20px;
}

.search-section {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>

