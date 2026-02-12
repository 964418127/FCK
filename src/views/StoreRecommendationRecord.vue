<template>
  <div class="store-recommendation-record-page">
    <div class="page-header">
      <h1>挂店推荐记录</h1>
      <p>查看推拿师的挂店推荐记录</p>
    </div>

    <!-- 搜索过滤区域 -->
    <div class="search-section">
      <el-form :model="searchForm" inline>
        <el-form-item label="类型">
          <el-select
            v-model="searchForm.type"
            placeholder="选择类型"
            clearable
            style="width: 120px"
          >
            <el-option label="推荐挂店" value="推荐挂店" />
            <el-option label="取消挂店" value="取消挂店" />
          </el-select>
        </el-form-item>
        <el-form-item label="员工">
          <el-input
            v-model="searchForm.employee"
            placeholder="输入员工名称或工号"
            clearable
            style="width: 200px"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="门店">
          <el-input
            v-model="searchForm.store"
            placeholder="输入门店编号或名称"
            clearable
            style="width: 200px"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="待确认" value="待确认" />
            <el-option label="已过期" value="已过期" />
            <el-option label="已拒绝" value="已拒绝" />
            <el-option label="已确认" value="已确认" />
            <el-option label="自动取消" value="自动取消" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间">
          <el-date-picker
            v-model="searchForm.confirmTimeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
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

    <!-- 表格区域 -->
    <div class="table-section">
      <el-table
        ref="tableRef"
        :data="filteredRecords"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.type === '推荐挂店' ? 'primary' : 'danger'" size="small">
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getTagType(scope.row.status)" size="small">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="员工信息" width="180">
          <template #default="scope">
            <div>{{ scope.row.employeeName }}（{{ scope.row.employeeId }}）</div>
          </template>
        </el-table-column>
        <el-table-column prop="workDuration" label="在职月数" width="80" />
        <el-table-column prop="mainStore" label="主服务门店" width="160" />
        <el-table-column prop="projectPlate" label="项目板块" width="100">
          <template #default="scope">
            <el-tag type="primary" size="small">{{ scope.row.projectPlate }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="skillLevel" label="技法等级" width="80">
          <template #default="scope">
            <el-tag type="info" size="small">{{ scope.row.skillLevel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="hangingStores" label="已挂店信息" width="200">
          <template #default="scope">
            <el-tag v-for="store in scope.row.hangingStores" :key="store" size="small" type="success" style="margin-right: 4px; margin-bottom: 4px;">
              {{ store }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="recommendStore" label="推荐/取消挂店门店" width="200">
          <template #default="scope">
            <el-tag v-for="store in scope.row.recommendStore" :key="store" size="small" :type="scope.row.type === '推荐挂店' ? 'warning' : 'danger'" style="margin-right: 4px; margin-bottom: 4px;">
              {{ store }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="intentionStore" label="意向挂店门店" width="200">
          <template #default="scope">
            <el-tag v-for="store in scope.row.intentionStore" :key="store" size="small" type="success" style="margin-right: 4px; margin-bottom: 4px;">
              {{ store }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operationTime" label="操作时间" width="140">
          <template #default="scope">
            <div>{{ formatDate(scope.row.operationTime) }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="expireTime" label="过期时间" width="140">
          <template #default="scope">
            <div v-if="scope.row.status === '已过期'">
              <el-tag type="warning" size="small">{{ formatDate(scope.row.expireTime) }}</el-tag>
            </div>
          </template>
        </el-table-column>


      </el-table>
    </div>

    <!-- 趋势变化弹窗 -->
    <el-dialog
      title="趋势变化"
      v-model="trendDialogVisible"
      width="800px"
      @close="closeTrendDialog"
    >
      <el-loading :visible="trendLoading" text="加载中...">
        <div v-if="currentTrendData" class="trend-data">
          <div v-for="store in currentTrendData.stores" :key="store.name" class="store-trend">
            <div class="store-name">{{ store.name }}</div>
            <div class="trend-items">
              <div class="trend-item">
                <div class="trend-title">周产值环比</div>
                <div class="trend-content">
                  <span class="trend-value">{{ store.weekOutputTrend.value }}</span>
                  <span :class="['trend-change', store.weekOutputTrend.change > 0 ? 'increase' : 'decrease']">
                    {{ store.weekOutputTrend.change > 0 ? '↑' : '↓' }}{{ Math.abs(store.weekOutputTrend.change) }}%
                  </span>
                </div>
              </div>
              <div class="trend-item">
                <div class="trend-title">周回头率环比</div>
                <div class="trend-content">
                  <span class="trend-value">{{ store.weekRetentionTrend.value }}</span>
                  <span :class="['trend-change', store.weekRetentionTrend.change > 0 ? 'increase' : 'decrease']">
                    {{ store.weekRetentionTrend.change > 0 ? '↑' : '↓' }}{{ Math.abs(store.weekRetentionTrend.change) }}%
                  </span>
                </div>
              </div>
              <div class="trend-item">
                <div class="trend-title">周流失率环比</div>
                <div class="trend-content">
                  <span class="trend-value">{{ store.weekChurnTrend.value }}</span>
                  <span :class="['trend-change', store.weekChurnTrend.change > 0 ? 'increase' : 'decrease']">
                    {{ store.weekChurnTrend.change > 0 ? '↑' : '↓' }}{{ Math.abs(store.weekChurnTrend.change) }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-loading>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'

// 响应式数据
const searchForm = reactive({
  type: '',
  employee: '',
  store: '',
  status: '',
  confirmTimeRange: []
})

// 表格引用
const tableRef = ref(null)

// 模拟数据
const records = ref([
  {
    id: '1',
    type: '推荐挂店',
    employeeId: '10001',
    employeeName: '张三',
    projectPlate: '推拿',
    skillLevel: 'LV6',
    workDuration: 24,
    mainStore: '天府凯德店',
    hangingStores: ['环球中心店', '高新区店'],
    recommendStore: ['金牛凯德店', '春熙路店'],
    intentionStore: ['金牛凯德店'],
    operationTime: '2026-01-26 10:00:00',
    expireTime: '2026-01-31 00:00:00',
    approveTime: '2026-01-26 15:00:00',
    status: '已确认',
    trendData: {
      stores: [
        { name: '天府凯德店', weekOutputTrend: { value: '48000元', change: 5.2 }, weekRetentionTrend: { value: '85.6%', change: 2.3 }, weekChurnTrend: { value: '12.3%', change: -1.5 } },
        { name: '环球中心店', weekOutputTrend: { value: '36000元', change: 8.7 }, weekRetentionTrend: { value: '82.4%', change: 1.8 }, weekChurnTrend: { value: '14.1%', change: -0.9 } }
      ]
    }
  },
  {
    id: '2',
    type: '推荐挂店',
    employeeId: '10002',
    employeeName: '李四',
    projectPlate: '足疗',
    skillLevel: 'LV4',
    workDuration: 18,
    mainStore: '春熙路店',
    hangingStores: ['天府凯德店'],
    recommendStore: ['万达广场店', '世纪城店'],
    intentionStore: [],
    operationTime: '2026-01-25 14:30:00',
    expireTime: '2026-01-30 00:00:00',
    approveTime: '2026-01-25 16:00:00',
    status: '已拒绝',
    trendData: {
      stores: [
        { name: '春熙路店', weekOutputTrend: { value: '33000元', change: -8.1 }, weekRetentionTrend: { value: '84.7%', change: -1.2 }, weekChurnTrend: { value: '12.6%', change: 3.4 } }
      ]
    }
  },
  {
    id: '3',
    type: '推荐挂店',
    employeeId: '10003',
    employeeName: '王五',
    projectPlate: 'SPA',
    skillLevel: 'LV5',
    workDuration: 30,
    mainStore: '环球中心店',
    hangingStores: ['春熙路店', '桐梓林店'],
    recommendStore: ['太古里店', '九眼桥店'],
    intentionStore: ['太古里店', '九眼桥店'],
    operationTime: '2026-01-27 09:00:00',
    expireTime: '2026-02-01 00:00:00',
    status: '待确认',
    trendData: {
      stores: [
        { name: '环球中心店', weekOutputTrend: { value: '52000元', change: 12.5 }, weekRetentionTrend: { value: '88.2%', change: 4.1 }, weekChurnTrend: { value: '9.8%', change: -2.7 } },
        { name: '春熙路店', weekOutputTrend: { value: '45000元', change: 6.3 }, weekRetentionTrend: { value: '86.7%', change: 2.9 }, weekChurnTrend: { value: '11.2%', change: -1.8 } }
      ]
    }
  },
  {
    id: '4',
    type: '取消挂店',
    employeeId: '10004',
    employeeName: '赵六',
    projectPlate: '推拿',
    skillLevel: 'LV3',
    workDuration: 12,
    mainStore: '桐梓林店',
    hangingStores: ['环球中心店'],
    recommendStore: ['天府凯德店', '春熙路店'],
    intentionStore: [],
    operationTime: '2026-01-20 11:00:00',
    expireTime: '2026-01-25 00:00:00',
    status: '自动取消',
    trendData: {
      stores: [
        { name: '桐梓林店', weekOutputTrend: { value: '28000元', change: -15.3 }, weekRetentionTrend: { value: '79.5%', change: -3.8 }, weekChurnTrend: { value: '18.2%', change: 5.6 } }
      ]
    }
  }])

// 趋势弹窗相关
const trendDialogVisible = ref(false)
const currentTrendData = ref(null)
const trendLoading = ref(false)

// 过滤后的数据
const filteredRecords = computed(() => {
  return records.value.filter(record => {
    // 类型过滤
    if (searchForm.type && record.type !== searchForm.type) {
      return false
    }
    // 员工搜索
    if (searchForm.employee && !`${record.employeeName}${record.employeeId}`.includes(searchForm.employee)) {
      return false
    }
    // 门店搜索
    if (searchForm.store) {
      const searchValue = searchForm.store.toLowerCase();
      const storeText = `${record.mainStore} ${record.hangingStores.join(' ')} ${record.recommendStore.join(' ')} ${record.intentionStore.join(' ')}`.toLowerCase();
      if (!storeText.includes(searchValue)) {
        return false;
      }
    }
    // 状态过滤
    if (searchForm.status && record.status !== searchForm.status) {
      return false
    }
    // 时间范围过滤
    if (searchForm.confirmTimeRange && searchForm.confirmTimeRange.length === 2) {
      const confirmTime = new Date(record.approveTime || record.operationTime)
      const startTime = new Date(searchForm.confirmTimeRange[0])
      const endTime = new Date(searchForm.confirmTimeRange[1])
      if (confirmTime < startTime || confirmTime > endTime) {
        return false
      }
    }
    return true
  })
})

// 获取标签类型
const getTagType = (status) => {
  switch (status) {
    case '待确认':
      return 'warning'
    case '已过期':
      return 'default'
    case '已拒绝':
      return 'danger'
    case '已确认':
      return 'success'
    case '自动取消':
      return 'default'
    default:
      return 'info'
  }
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 搜索
const handleSearch = () => {
  ElMessage.info('搜索功能已触发')
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    employee: '',
    store: '',
    status: '',
    confirmTimeRange: []
  })
}

// 显示趋势变化
const showTrend = (row) => {
  if (!row.trendData) {
    ElMessage.warning('无趋势数据')
    return
  }
  trendLoading.value = true
  // 模拟异步加载
  setTimeout(() => {
    currentTrendData.value = row.trendData
    trendDialogVisible.value = true
    trendLoading.value = false
  }, 500)
}

// 关闭趋势弹窗
const closeTrendDialog = () => {
  trendDialogVisible.value = false
  currentTrendData.value = null
}
</script>

<style scoped>
.store-recommendation-record-page {
  padding: 20px;
  background: #f5f5f5;
}

.page-header {
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-header h1 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #333;
}

.page-header p {
  margin: 0;
  color: #999;
}

.search-section {
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-section {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.trend-data {
  padding: 20px;
}

.store-trend {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
}

.store-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
}

.trend-items {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.trend-item {
  flex: 1;
  min-width: 200px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.trend-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
}

.trend-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.trend-value {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.trend-change {
  font-size: 16px;
  font-weight: 600;
}

.trend-change.increase {
  color: #67c23a;
}

.trend-change.decrease {
  color: #f56c6c;
}
</style>