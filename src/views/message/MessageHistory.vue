<template>
  <div class="message-history">
    <div class="page-header">
      <h2>历史消息管理</h2>
      <p>管理历史消息记录，支持查询、重发、删除等操作</p>
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
        <el-select v-model="searchForm.status" placeholder="状态" clearable style="width: 150px">
          <el-option label="全部" value="" />
          <el-option label="成功" value="success" />
          <el-option label="失败" value="failed" />
          <el-option label="已撤销" value="cancelled" />
        </el-select>
        <el-select v-model="searchForm.channel" placeholder="消息通道" clearable style="width: 150px">
          <el-option label="全部" value="" />
          <el-option label="站内信" value="inbox" />
          <el-option label="App推送" value="push" />
          <el-option label="邮件" value="email" />
          <el-option label="微信模板消息" value="wechat" />
          <el-option label="短信" value="sms" />
        </el-select>
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
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ formatStatus(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="plannedTime" label="计划发送时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.plannedTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="actualTime" label="实际发送时间" width="180">
          <template #default="scope">
            {{ scope.row.actualTime ? formatDateTime(scope.row.actualTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="来源" min-width="150">
          <template #default="scope">
            <div v-if="scope.row.sourceType === 'plan'">
              消息计划：{{ scope.row.planName }}
            </div>
            <div v-else>
              业务触发：{{ scope.row.sceneDescription }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button 
                v-if="scope.row.status === 'failed'" 
                type="primary" 
                link 
                @click="handleRetry(scope.row)"
              >
                重发
              </el-button>
              <el-dropdown trigger="click" class="more-link">
                <span class="more-link">
                  更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item 
                      v-if="scope.row.status === 'failed'"
                      @click="handleViewLog(scope.row)"
                    >
                      失败日志
                    </el-dropdown-item>
                    <el-dropdown-item 
                      @click="handleDelete(scope.row)"
                      divided
                    >
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
import { Search, Refresh, ArrowDown } from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const searchForm = ref({
  keyword: '',
  status: '',
  channel: '',
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
    templateCode: 'TPL001',
    userUid: 'U001',
    subject: '预约失效通知',
    content: '您的预约已失效，请重新预约',
    channel: 'sms',
    status: 'success',
    plannedTime: new Date('2024-01-15 10:00:00'),
    actualTime: new Date('2024-01-15 10:00:01'),
    sourceType: 'plan',
    planName: '预约失效提醒计划',
    planId: 'PLAN001'
  },
  {
    id: '2',
    templateCode: 'TPL002',
    userUid: 'U002',
    subject: '验证码',
    content: '您的验证码是：123456',
    channel: 'sms',
    status: 'failed',
    plannedTime: new Date('2024-01-15 11:00:00'),
    actualTime: null,
    sourceType: 'business',
    sceneCode: 'VERIFY_CODE',
    sceneDescription: '登录验证码'
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
  
  if (searchForm.value.status) {
    list = list.filter(item => item.status === searchForm.value.status)
  }
  
  if (searchForm.value.channel) {
    list = list.filter(item => item.channel === searchForm.value.channel)
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

const formatStatus = (status) => {
  const statusMap = {
    'success': '成功',
    'failed': '失败',
    'cancelled': '已撤销'
  }
  return statusMap[status] || status
}

const getStatusType = (status) => {
  const typeMap = {
    'success': 'success',
    'failed': 'danger',
    'cancelled': 'info'
  }
  return typeMap[status] || ''
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
    status: '',
    channel: '',
    dateRange: null
  }
  pagination.value.currentPage = 1
}

const handleRetry = (row) => {
  ElMessageBox.confirm('确定要重新发送该消息吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 重发逻辑
    ElMessage.success('重发成功')
  }).catch(() => {})
}

const handleViewLog = (row) => {
  ElMessageBox.alert('失败日志：网络连接超时', '失败日志', {
    confirmButtonText: '确定'
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该消息记录吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = messageList.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      messageList.value.splice(index, 1)
      ElMessage.success('删除成功')
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
.message-history {
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

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: nowrap;
}

.more-link {
  color: hsl(var(--primary));
  cursor: pointer;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
}

.more-link:hover {
  color: hsl(var(--primary-hover));
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>

