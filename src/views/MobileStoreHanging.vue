<template>
  <div class="mobile-store-hanging">
    <!-- 顶部导航 -->
    <div class="top-nav">
      <el-button type="text" @click="goBack" style="color: white;">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <div class="nav-title">挂店申请审核</div>
      <div class="nav-actions">
            <el-button type="text" @click="toggleBatch" style="color: white; font-size: 14px;">
              <el-icon><Check style="margin-right: 4px;" /></el-icon>
              批量
            </el-button>
            <el-button type="text" @click="showFilter" style="color: white; font-size: 14px;">
              <el-icon><Filter style="margin-right: 4px;" /></el-icon>
              筛选
            </el-button>
          </div>
    </div>
    
    <!-- 搜索区域 -->
    <div class="search-section">
      <el-input v-model="searchForm.employee" placeholder="搜索员工姓名或工号" prefix-icon="Search" @input="handleSearch" style="width: 100%;" />
    </div>
    
    <!-- 批量操作区域 -->
        <div class="batch-actions" v-if="batchMode">
          <el-button type="primary" @click="handleBatchApprove" :disabled="selectedRows.length === 0" style="flex: 1;">
            批量同意
          </el-button>
          <el-button type="danger" @click="handleBatchReject" :disabled="selectedRows.length === 0" style="flex: 1;">
            批量拒绝
          </el-button>
          <el-button type="text" @click="toggleBatch" style="width: 60px;">
            取消
          </el-button>
        </div>
    
    <!-- 列表区域 -->
    <div class="list-section">
      <div class="list-item" v-for="item in filteredApplications" :key="item.id" :class="{ 'selected-item': item.selected }" @click="handleItemClick(item)">
        <div class="item-header" :class="{ 'selected-header': item.selected }">
          <div class="item-info">
            <div class="employee-name">{{ item.employeeName }}（{{ item.employeeId }}）</div>
            <div class="employee-details">
              <span class="skill-level">{{ item.skillLevel }}</span>
              <span class="project-plate">{{ item.projectPlate }}</span>
            </div>
          </div>
          <div class="header-actions">
            <el-tag :type="item.status === '已批准' ? 'success' : item.status === '已拒绝' ? 'danger' : 'warning'" size="small">
              {{ item.status }}
            </el-tag>
          </div>
        </div>
        
        <div class="item-body">
          <div class="store-info">
            <div class="store-label">主服务门店：</div>
            <div class="store-value">{{ item.mainStore }}</div>
          </div>
          <div class="store-info">
            <div class="store-label">申请挂店：</div>
            <div class="store-value">
              <el-tag v-for="store in Array.isArray(item.applyStore) ? item.applyStore : [item.applyStore]" :key="store" size="small" type="primary" style="margin-right: 4px; margin-bottom: 4px;">
                {{ store }}
              </el-tag>
            </div>
          </div>
          <div class="store-info">
                    <div class="store-label">已挂店：</div>
                    <div class="store-value">
                      <el-tag v-for="store in Array.isArray(item.hangingStores) ? item.hangingStores : [item.hangingStores]" :key="store" size="small" type="success" style="margin-right: 4px; margin-bottom: 4px;">
                        {{ store }}
                      </el-tag>
                    </div>
                  </div>
          <div class="store-info">
            <div class="store-label">上周产值：</div>
            <div class="store-value">{{ item.lastWeekOutput.target }} / {{ item.lastWeekOutput.actual }}</div>
          </div>
          <div class="store-info">
            <div class="store-label">上周回头率：</div>
            <div class="store-value">{{ item.thisMonthRetentionRate }}%</div>
          </div>
          <div class="store-info">
            <div class="store-label">上周流失率：</div>
            <div class="store-value">{{ item.thisMonthChurnRate }}%</div>
          </div>
          <div class="time-info">
            <div class="time-label">申请时间：</div>
            <div class="time-value">{{ formatDate(item.applyTime) }}</div>
          </div>
          <div class="time-info" v-if="item.status === '已过期'">
            <div class="time-label">过期时间：</div>
            <div class="time-value">{{ formatDate(item.expireTime) }}</div>
          </div>
          <div class="time-info" v-if="item.status === '已批准' || item.status === '已拒绝'">
            <div class="time-label">审批时间：</div>
            <div class="time-value">{{ formatDate(item.approveTime) }}</div>
          </div>
        </div>
        
        <div class="item-actions" v-if="!batchMode && item.status === '待审核'">
          <el-button type="primary" @click="handleApprove(item)" style="flex: 1; margin-right: 10px; height: 44px; font-size: 16px;">
            同意
          </el-button>
          <el-button type="danger" @click="handleReject(item)" style="flex: 1; height: 44px; font-size: 16px;">
            拒绝
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 侧滑筛选视图 -->
    <div class="filter-slide" :class="{ 'show': filterVisible }">
      <div class="filter-header">
        <div class="filter-title">筛选条件</div>
        <el-button type="text" @click="hideFilter">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
      
      <div class="filter-body">
        <div class="filter-row">
          <div class="filter-label">状态筛选</div>
          <div class="filter-options">
            <el-radio-group v-model="searchForm.status">
              <el-radio label="">全部</el-radio>
              <el-radio label="待审核">待审核</el-radio>
              <el-radio label="已批准">已批准</el-radio>
              <el-radio label="已拒绝">已拒绝</el-radio>
            </el-radio-group>
          </div>
        </div>
        
        <div class="filter-row">
          <div class="filter-label">时间范围</div>
          <div class="filter-options">
            <el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 100%;" />
          </div>
        </div>
      </div>
      
      <div class="filter-footer">
        <el-button type="primary" @click="handleSearch">
          确定
        </el-button>
        <el-button @click="resetFilter">
          重置
        </el-button>
      </div>
    </div>
    
    <!-- 遮罩层 -->
    <div class="mask" v-if="filterVisible" @click="hideFilter"></div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { ArrowLeft, Check, Filter, Close } from '@element-plus/icons-vue'

const router = useRouter()

const batchMode = ref(false)
const selectedRows = ref([])
const filterVisible = ref(false)

// 搜索表单
const searchForm = reactive({
  employee: '',
  status: '',
  dateRange: []
})

// 状态选项
const statusOptions = [
  { label: '全部', value: '' },
  { label: '待审核', value: '待审核' },
  { label: '已批准', value: '已批准' },
  { label: '已拒绝', value: '已拒绝' }
]

// 模拟数据，与StoreHangingApplication.vue字段一致
const applications = ref([
  {
    id: '1',
    employeeId: '10001',
    employeeName: '张三',
    projectPlate: '推拿',
    skillLevel: 'LV6',
    workDuration: 24,
    mainStore: '天府凯德店',
    lastWeekOutput: { target: 40000, actual: 38000 },
    thisMonthRetentionRate: 88.2,
    thisMonthChurnRate: 10.1,
    hangingStoreCount: 2,
    hangingStores: ['环球中心店', '高新区店'],
    applyStore: ['金牛凯德店', '春熙路店'],
    applyTime: '2024-12-26 10:00:00',
    status: '待审核',
    expireTime: '2024-12-31 00:00:00'
  },
  {
    id: '2',
    employeeId: '10002',
    employeeName: '李四',
    projectPlate: '足疗',
    skillLevel: 'LV4',
    workDuration: 18,
    mainStore: '春熙路店',
    lastWeekOutput: { target: 35000, actual: 33000 },
    thisMonthRetentionRate: 84.7,
    thisMonthChurnRate: 12.6,
    hangingStoreCount: 1,
    hangingStores: ['天府凯德店'],
    applyStore: ['万达广场店', '世纪城店'],
    applyTime: '2024-12-25 14:30:00',
    status: '已批准',
    expireTime: '2024-12-31 00:00:00',
    approveTime: '2024-12-25 15:00:00'
  },
  {
    id: '3',
    employeeId: '10003',
    employeeName: '王五',
    projectPlate: '经络',
    skillLevel: 'LV2',
    workDuration: 12,
    mainStore: '世纪城店',
    lastWeekOutput: { target: 25000, actual: 23000 },
    thisMonthRetentionRate: 80.5,
    thisMonthChurnRate: 14.8,
    hangingStoreCount: 0,
    hangingStores: [],
    applyStore: ['环球中心店', '高新区店', '华阳店'],
    applyTime: '2024-12-24 09:15:00',
    status: '已拒绝',
    expireTime: '2024-12-31 00:00:00',
    approveTime: '2024-12-24 09:30:00'
  },
  {
    id: '4',
    employeeId: '10004',
    employeeName: '赵六',
    projectPlate: '运动康复',
    skillLevel: 'LV5',
    workDuration: 36,
    mainStore: '高新区店',
    lastWeekOutput: { target: 50000, actual: 52000 },
    thisMonthRetentionRate: 92.1,
    thisMonthChurnRate: 7.2,
    hangingStoreCount: 3,
    hangingStores: ['世纪城店', '环球中心店', '华阳店'],
    applyStore: ['华阳店', '天府凯德店', '春熙路店', '万达广场店'],
    applyTime: '2024-12-23 16:45:00',
    status: '待审核',
    expireTime: '2024-12-30 00:00:00'
  }
])

// 过滤后的数据
const filteredApplications = computed(() => {
  return applications.value.filter(application => {
    if (searchForm.employee) {
      const employeeMatch = application.employeeName.includes(searchForm.employee) || application.employeeId.includes(searchForm.employee)
      if (!employeeMatch) {
        return false
      }
    }
    if (searchForm.status) {
      if (application.status !== searchForm.status) {
        return false
      }
    }
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      const applyDate = new Date(application.applyTime)
      if (applyDate < searchForm.dateRange[0] || applyDate > searchForm.dateRange[1]) {
        return false
      }
    }
    return true
  })
})

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

// 返回上一级
const goBack = () => {
  router.back()
}

// 切换批量模式
const toggleBatch = () => {
  batchMode.value = !batchMode.value
  if (!batchMode.value) {
    selectedRows.value = []
    // 清除所有选中状态
    applications.value.forEach(item => {
      item.selected = false
    })
  }
}

// 处理单个项目点击
const handleItemClick = (item) => {
  if (batchMode.value) {
    item.selected = !item.selected
    if (item.selected) {
      selectedRows.value.push(item)
    } else {
      const index = selectedRows.value.findIndex(row => row.id === item.id)
      if (index > -1) {
        selectedRows.value.splice(index, 1)
      }
    }
  }
}

// 显示筛选视图
const showFilter = () => {
  filterVisible.value = true
}

// 隐藏筛选视图
const hideFilter = () => {
  filterVisible.value = false
}

// 重置筛选条件
const resetFilter = () => {
  searchForm.status = ''
  searchForm.dateRange = []
  handleSearch()
  hideFilter()
}

// 搜索处理
const handleSearch = () => {
  ElMessage.success('搜索完成')
}

// 处理同意
const handleApprove = (row) => {
  const applyStores = Array.isArray(row.applyStore) ? row.applyStore : [row.applyStore]
  const storeList = applyStores.map(store => `
    <div style="margin-bottom: 8px;">
      <input type="checkbox" checked id="store_${store}" value="${store}">
      <label for="store_${store}" style="margin-left: 8px;">${store}</label>
    </div>
  `).join('')
  
  ElMessageBox.confirm(`
    <div style="text-align: left;">
      <p style="margin-bottom: 16px;">确认同意${row.employeeName}（${row.employeeId}）的挂店申请吗？</p>
      <p style="margin-bottom: 8px;">选择同意的门店：</p>
      ${storeList}
    </div>
  `, '同意申请', {
    confirmButtonText: '同意',
    cancelButtonText: '取消',
    type: 'warning',
    dangerouslyUseHTMLString: true
  }).then(() => {
    row.status = '已批准'
    row.approveTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
    ElMessage.success(`已同意${row.employeeName}（${row.employeeId}）的挂店申请`)
  }).catch(() => {
    ElMessage.info('已取消同意操作')
  })
}

// 处理拒绝
const handleReject = (row) => {
  const rejectReasons = ['资质不符', '经验不足', '考核未通过']
  
  const dialog = ElMessageBox({
    title: '拒绝申请',
    message: `
      <div style="text-align: left;">
        <p style="margin-bottom: 16px; font-weight: 600;">确认拒绝${row.employeeName}（${row.employeeId}）的挂店申请吗？</p>
        <p style="margin-bottom: 16px; font-weight: 600;">请选择拒绝理由：</p>
        <div style="margin-bottom: 16px;">
          ${rejectReasons.map(reason => `
            <label style="display: block; margin-bottom: 8px; cursor: pointer;">
              <input type="radio" name="rejectReason" value="${reason}" style="margin-right: 8px;">
              ${reason}
            </label>
          `).join('')}
        </div>
      </div>
    `,
    confirmButtonText: '拒绝',
    cancelButtonText: '取消',
    type: 'warning',
    dangerouslyUseHTMLString: true
  })
  
  dialog.then(({ value }) => {
    const selectedReason = document.querySelector('input[name="rejectReason"]:checked')?.value
    
    if (selectedReason) {
      row.status = '已拒绝'
      row.approveTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
      row.rejectReason = selectedReason
      ElMessage.success(`已拒绝${row.employeeName}（${row.employeeId}）的挂店申请，理由：${selectedReason}`)
    } else {
      ElMessage.warning('请选择拒绝理由')
    }
  }).catch(() => {
    ElMessage.info('已取消拒绝操作')
  })
}

// 处理批量同意
const handleBatchApprove = () => {
  const employeeNames = selectedRows.value.map(row => `${row.employeeName}（${row.employeeId}）`).join('、')
  ElMessageBox.confirm(`确认同意以下${selectedRows.value.length}位员工的挂店申请吗？\n${employeeNames}`, '批量同意申请', {
    confirmButtonText: '同意',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedRows.value.forEach(row => {
      if (row.status === '待审核') {
        row.status = '已批准'
        row.approveTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
      }
    })
    ElMessage.success(`已批量同意${selectedRows.value.length}条申请`)
    batchMode.value = false
    selectedRows.value = []
  }).catch(() => {
    ElMessage.info('已取消批量同意操作')
  })
}

// 处理批量拒绝
const handleBatchReject = () => {
  const employeeNames = selectedRows.value.map(row => `${row.employeeName}（${row.employeeId}）`).join('、')
  const rejectReasons = ['资质不符', '经验不足', '考核未通过']
  
  const dialog = ElMessageBox({
    title: '批量拒绝申请',
    message: `
      <div style="text-align: left;">
        <p style="margin-bottom: 16px; font-weight: 600;">确认拒绝以下${selectedRows.value.length}位员工的挂店申请吗？\n${employeeNames}</p>
        <p style="margin-bottom: 16px; font-weight: 600;">请选择拒绝理由：</p>
        <div style="margin-bottom: 16px;">
          ${rejectReasons.map(reason => `
            <label style="display: block; margin-bottom: 8px; cursor: pointer;">
              <input type="radio" name="rejectReason" value="${reason}" style="margin-right: 8px;">
              ${reason}
            </label>
          `).join('')}
        </div>
      </div>
    `,
    confirmButtonText: '拒绝',
    cancelButtonText: '取消',
    type: 'warning',
    dangerouslyUseHTMLString: true
  })
  
  dialog.then(({ value }) => {
    const selectedReason = document.querySelector('input[name="rejectReason"]:checked')?.value
    
    if (selectedReason) {
      selectedRows.value.forEach(row => {
        if (row.status === '待审核') {
          row.status = '已拒绝'
          row.approveTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
          row.rejectReason = selectedReason
        }
      })
      ElMessage.success(`已批量拒绝${selectedRows.value.length}条申请`)
      batchMode.value = false
      selectedRows.value = []
    } else {
      ElMessage.warning('请选择拒绝理由')
    }
  }).catch(() => {
    ElMessage.info('已取消批量拒绝操作')
  })
}
</script>

<style scoped>
.mobile-store-hanging {
  background: #f5f5f5;
  min-height: 100vh;
}

.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, #a40035 0%, #7a0026 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-title {
  font-size: 18px;
  font-weight: 600;
}

.search-section {
  padding: 16px;
  background: white;
  margin-bottom: 10px;
}

.filter-slide {
  position: fixed;
  top: 0;
  right: -100%;
  width: 80%;
  height: 100%;
  background: white;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  transition: right 0.3s ease;
  z-index: 1000;
}

.filter-slide.show {
  right: 0;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.filter-title {
  font-size: 18px;
  font-weight: 600;
}

.filter-body {
  padding: 16px;
}

.filter-row {
  margin-bottom: 24px;
}

.filter-label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}

.filter-options {
  width: 100%;
}

.filter-footer {
  display: flex;
  gap: 10px;
  padding: 16px;
  border-top: 1px solid #eee;
}

.mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.batch-actions {
  display: flex;
  gap: 10px;
  padding: 16px;
  background: white;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.list-section {
  padding: 10px;
  max-height: calc(100vh - 180px);
  overflow-y: auto;
  padding-bottom: 80px;
}

.list-item.selected-item {
  background: #e6f7ff;
  border: 2px solid #1890ff;
  box-shadow: 0 0 8px rgba(24, 144, 255, 0.3);
}

.list-item {
  background: white;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
  position: relative;
}

.item-header.selected-header {
  background: #e6f7ff;
  border-bottom: 1px solid #1890ff;
}

.item-info {
  flex: 1;
}

.employee-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.employee-details {
  display: flex;
  gap: 8px;
}

.skill-level {
  border: 1px solid #a40035;
  color: #a40035;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.project-plate {
  border: 1px solid #a40035;
  color: #a40035;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.item-body {
  padding: 16px;
}

.store-info {
  display: flex;
  margin-bottom: 12px;
}

.store-label {
  width: 100px;
  color: #999;
  font-size: 14px;
}

.store-value {
  flex: 1;
  font-size: 14px;
}

.time-info {
  display: flex;
}

.time-label {
  width: 80px;
  color: #999;
  font-size: 14px;
}

.time-value {
  flex: 1;
  font-size: 14px;
}

.item-actions {
  display: flex;
  gap: 10px;
  padding: 16px;
  border-top: 1px solid #eee;
}
</style>