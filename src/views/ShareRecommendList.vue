<template>
  <div class="share-recommend-list">
    <div class="page-header">
      <h2>分享推荐列表</h2>
      <p>管理用户分享推荐记录</p>
    </div>
    
    <div class="page-content">
      <!-- 搜索栏 -->
      <div class="search-section">
        <el-input
          v-model="searchForm.keyword"
          placeholder="搜索记录编码、邀请人昵称、被邀请人昵称"
          style="width: 280px"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="searchForm.status" placeholder="状态" clearable style="width: 140px">
          <el-option label="全部" value="" />
          <el-option label="有效邀请" value="valid" />
          <el-option label="无效邀请" value="invalid" />
        </el-select>
        <el-date-picker
          v-model="searchForm.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 220px"
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
      
      <!-- 分享推荐列表 -->
      <el-table :data="filteredList" border stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="recordCode" label="记录编码" min-width="160" />
        <el-table-column prop="inviterUid" label="邀请人UID" min-width="140" />
        <el-table-column prop="inviterNickname" label="邀请人昵称" min-width="140" />
        <el-table-column prop="inviteeUid" label="被邀请人UID" min-width="140" />
        <el-table-column prop="inviteeNickname" label="被邀请人昵称" min-width="140" />
        <el-table-column prop="inviteTime" label="邀请时间" min-width="170">
          <template #default="scope">
            {{ formatDateTime(scope.row.inviteTime) }}
          </template>
        </el-table-column>
        <el-table-column label="关联活动" min-width="200">
          <template #default="scope">
            <el-tag v-if="scope.row.activityName" type="info" size="small">
              {{ scope.row.activityName }}
            </el-tag>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="110">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'valid' ? 'success' : 'danger'" size="small">
              {{ scope.row.status === 'valid' ? '有效邀请' : '无效邀请' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button type="primary" link @click="handleViewDetail(scope.row)">
                详情
              </el-button>
              <el-button 
                type="danger" 
                link 
                @click="handleInvalidate(scope.row)"
                :disabled="scope.row.status === 'invalid'"
              >
                作废
              </el-button>
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
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    
    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="detailDialogTitle"
      width="600px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="记录编码">{{ selectedRecord?.recordCode }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="selectedRecord?.status === 'valid' ? 'success' : 'danger'" size="small">
            {{ selectedRecord?.status === 'valid' ? '有效邀请' : '无效邀请' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="关联活动" :span="2">
          <el-tag v-if="selectedRecord?.activityName" type="info" size="small">
            {{ selectedRecord.activityName }}
          </el-tag>
          <span v-else class="text-muted">-</span>
        </el-descriptions-item>
        <el-descriptions-item label="邀请人UID">{{ selectedRecord?.inviterUid }}</el-descriptions-item>
        <el-descriptions-item label="邀请人昵称">{{ selectedRecord?.inviterNickname }}</el-descriptions-item>
        <el-descriptions-item label="被邀请人UID">{{ selectedRecord?.inviteeUid }}</el-descriptions-item>
        <el-descriptions-item label="被邀请人昵称">{{ selectedRecord?.inviteeNickname }}</el-descriptions-item>
        <el-descriptions-item label="邀请时间" :span="2">
          {{ selectedRecord ? formatDateTime(selectedRecord.inviteTime) : '' }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const searchForm = ref({
  keyword: '',
  status: '',
  dateRange: null
})

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 模拟数据
const shareRecommendList = ref([
  {
    id: '1',
    recordCode: 'SR20240101001',
    inviterUid: 'uid-1001',
    inviterNickname: '张三',
    inviteeUid: 'uid-2001',
    inviteeNickname: '李四',
    inviteTime: new Date('2024-01-01 10:30:00'),
    status: 'valid',
    activityId: '1',
    activityName: '新用户注册奖励规则'
  },
  {
    id: '2',
    recordCode: 'SR20240101002',
    inviterUid: 'uid-1002',
    inviterNickname: '王五',
    inviteeUid: 'uid-2002',
    inviteeNickname: '赵六',
    inviteTime: new Date('2024-01-01 14:20:00'),
    status: 'valid',
    activityId: '1',
    activityName: '新用户注册奖励规则'
  },
  {
    id: '3',
    recordCode: 'SR20240101003',
    inviterUid: 'uid-1003',
    inviterNickname: '孙七',
    inviteeUid: 'uid-2003',
    inviteeNickname: '周八',
    inviteTime: new Date('2024-01-02 09:15:00'),
    status: 'invalid',
    activityId: '2',
    activityName: '品牌推广奖励规则'
  },
  {
    id: '4',
    recordCode: 'SR20240102001',
    inviterUid: 'uid-1004',
    inviterNickname: '吴九',
    inviteeUid: 'uid-2004',
    inviteeNickname: '郑十',
    inviteTime: new Date('2024-01-02 16:45:00'),
    status: 'valid',
    activityId: '2',
    activityName: '品牌推广奖励规则'
  },
  {
    id: '5',
    recordCode: 'SR20240102002',
    inviterUid: 'uid-1005',
    inviterNickname: '钱一',
    inviteeUid: 'uid-2005',
    inviteeNickname: '钱二',
    inviteTime: new Date('2024-01-03 11:30:00'),
    status: 'valid',
    activityId: '1',
    activityName: '新用户注册奖励规则'
  }
])

// 详情对话框
const detailDialogVisible = ref(false)
const detailDialogTitle = ref('详情')
const selectedRecord = ref(null)

// 过滤后的列表
const filteredList = computed(() => {
  let list = [...shareRecommendList.value]
  
  // 关键词搜索
  if (searchForm.value.keyword) {
    const keyword = searchForm.value.keyword.toLowerCase()
    list = list.filter(item => 
      item.recordCode.toLowerCase().includes(keyword) ||
      item.inviterNickname.toLowerCase().includes(keyword) ||
      item.inviteeNickname.toLowerCase().includes(keyword)
    )
  }
  
  // 状态筛选
  if (searchForm.value.status) {
    list = list.filter(item => item.status === searchForm.value.status)
  }
  
  // 日期范围筛选
  if (searchForm.value.dateRange && searchForm.value.dateRange.length === 2) {
    const [startDate, endDate] = searchForm.value.dateRange
    list = list.filter(item => {
      const itemDate = new Date(item.inviteTime)
      return itemDate >= startDate && itemDate <= endDate
    })
  }
  
  // 更新总数
  pagination.value.total = list.length
  
  // 分页
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return list.slice(start, end)
})

// 格式化日期时间
const formatDateTime = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 搜索
const handleSearch = () => {
  pagination.value.currentPage = 1
}

// 重置
const handleReset = () => {
  searchForm.value = {
    keyword: '',
    status: '',
    dateRange: null
  }
  pagination.value.currentPage = 1
}

// 查看详情
const handleViewDetail = (row) => {
  selectedRecord.value = row
  detailDialogTitle.value = '分享推荐详情'
  detailDialogVisible.value = true
}

// 作废
const handleInvalidate = (row) => {
  ElMessageBox.confirm('确定要作废该邀请记录吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 'invalid'
    ElMessage.success('作废成功')
  }).catch(() => {})
}

// 分页
const handleSizeChange = (val) => {
  pagination.value.pageSize = val
  pagination.value.currentPage = 1
}

const handleCurrentChange = (val) => {
  pagination.value.currentPage = val
}

// 初始化
onMounted(() => {
  pagination.value.total = shareRecommendList.value.length
})
</script>

<style scoped>
.share-recommend-list {
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

/* 限制日期选择器宽度 */
.search-section :deep(.el-date-editor) {
  width: 360px !important;
  max-width: 360px !important;
  min-width: 360px !important;
}

.search-section :deep(.el-date-editor.el-input) {
  width: 360px !important;
  max-width: 360px !important;
  min-width: 360px !important;
}

.search-section :deep(.el-date-editor .el-input__wrapper) {
  width: 100% !important;
  max-width: 100% !important;
}

.search-section :deep(.el-date-editor .el-range-input) {
  width: 100% !important;
  max-width: 100% !important;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.text-muted {
  color: #909399;
  font-size: 14px;
}
</style>

