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
          <template #label>
            <span class="label-with-tooltip">
              门店
              <el-tooltip content="主服务门店、已挂店信息、推荐/取消挂店门店、意向挂店门店" placement="top">
                <el-icon class="question-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-select
            v-model="searchForm.store"
            placeholder="选择门店"
            clearable
            multiple
            style="width: 200px"
          >
            <el-option label="天府凯德店" value="天府凯德店" />
            <el-option label="环球中心店" value="环球中心店" />
            <el-option label="高新区店" value="高新区店" />
            <el-option label="春熙路店" value="春熙路店" />
            <el-option label="金牛凯德店" value="金牛凯德店" />
            <el-option label="万达广场店" value="万达广场店" />
            <el-option label="世纪城店" value="世纪城店" />
            <el-option label="太古里店" value="太古里店" />
            <el-option label="九眼桥店" value="九眼桥店" />
            <el-option label="桐梓林店" value="桐梓林店" />
          </el-select>
        </el-form-item>
        <el-form-item label="意向状态">
          <el-select
            v-model="searchForm.status"
            placeholder="选择意向状态"
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
        <el-form-item label="推送状态">
          <el-select
            v-model="searchForm.pushStatus"
            placeholder="选择推送状态"
            clearable
            style="width: 120px"
          >
            <el-option label="已推送" value="已推送" />
            <el-option label="未推送" value="未推送" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目标签">
          <template #label>
            <span class="label-with-tooltip">
              项目标签
              <el-tooltip content="技师自身包含的项目标签" placement="top">
                <el-icon class="question-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-select
            v-model="searchForm.projectTagInclude"
            placeholder="选择项目标签"
            clearable
            multiple
            style="width: 200px"
          >
            <el-option label="中医推拿" value="中医推拿" />
            <el-option label="精油推拿" value="精油推拿" />
            <el-option label="肩颈调理" value="肩颈调理" />
            <el-option label="中式足疗" value="中式足疗" />
            <el-option label="泰式足疗" value="泰式足疗" />
            <el-option label="草药足疗" value="草药足疗" />
            <el-option label="精油SPA" value="精油SPA" />
            <el-option label="热石SPA" value="热石SPA" />
            <el-option label="面部护理" value="面部护理" />
          </el-select>
        </el-form-item>
        <el-form-item label="技法等级">
          <template #label>
            <span class="label-with-tooltip">
              技法等级
              <el-tooltip content="技师自身的技法等级" placement="top">
                <el-icon class="question-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-select
            v-model="searchForm.skillLevelInclude"
            placeholder="选择技法等级"
            clearable
            multiple
            style="width: 150px"
          >
            <el-option label="LV3" value="LV3" />
            <el-option label="LV4" value="LV4" />
            <el-option label="LV5" value="LV5" />
            <el-option label="LV6" value="LV6" />
          </el-select>
        </el-form-item>
        <el-form-item label="挂店门店">
          <template #label>
            <span class="label-with-tooltip">
              挂店门店
              <el-tooltip content="推荐/取消挂店列中的门店" placement="top">
                <el-icon class="question-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-select
            v-model="searchForm.hangingStore"
            placeholder="选择挂店门店"
            clearable
            multiple
            style="width: 200px"
          >
            <el-option label="天府凯德店" value="天府凯德店" />
            <el-option label="环球中心店" value="环球中心店" />
            <el-option label="高新区店" value="高新区店" />
            <el-option label="春熙路店" value="春熙路店" />
            <el-option label="金牛凯德店" value="金牛凯德店" />
            <el-option label="万达广场店" value="万达广场店" />
            <el-option label="世纪城店" value="世纪城店" />
            <el-option label="太古里店" value="太古里店" />
            <el-option label="九眼桥店" value="九眼桥店" />
            <el-option label="桐梓林店" value="桐梓林店" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目标签去重">
          <template #label>
            <span class="label-with-tooltip">
              项目标签去重
              <el-tooltip content="挂入的技师，与主服务门店技师的项目标签不重复" placement="top">
                <el-icon class="question-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-select
            v-model="searchForm.projectTagNotRepeat"
            placeholder="选择项目标签"
            clearable
            multiple
            style="width: 200px"
          >
            <el-option label="中医推拿" value="中医推拿" />
            <el-option label="精油推拿" value="精油推拿" />
            <el-option label="肩颈调理" value="肩颈调理" />
            <el-option label="中式足疗" value="中式足疗" />
            <el-option label="泰式足疗" value="泰式足疗" />
            <el-option label="草药足疗" value="草药足疗" />
            <el-option label="精油SPA" value="精油SPA" />
            <el-option label="热石SPA" value="热石SPA" />
            <el-option label="面部护理" value="面部护理" />
          </el-select>
        </el-form-item>
        <el-form-item label="技法等级去重">
          <template #label>
            <span class="label-with-tooltip">
              技法等级去重
              <el-tooltip content="挂入的技师，与主服务门店技师的等级不重复" placement="top">
                <el-icon class="question-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-select
            v-model="searchForm.skillLevelNotRepeat"
            placeholder="选择技法等级"
            clearable
            multiple
            style="width: 150px"
          >
            <el-option label="LV3" value="LV3" />
            <el-option label="LV4" value="LV4" />
            <el-option label="LV5" value="LV5" />
            <el-option label="LV6" value="LV6" />
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

    <!-- 操作按钮区域 -->
    <div class="action-section">
      <el-button type="primary" @click="handleBatchPush" :disabled="selectedRows.length === 0 || !selectedRows.some(row => row.type === '推荐挂店')">
        <el-icon><ArrowRight /></el-icon>
        批量推送
      </el-button>
      <el-button type="primary" @click="handleOneClickPush" :disabled="filteredRecords.length === 0 || !filteredRecords.some(row => row.type === '推荐挂店')">
        <el-icon><ArrowRight /></el-icon>
        一键推送
      </el-button>
    </div>

    <!-- 表格区域 -->
    <div class="table-section">
      <el-table
        ref="tableRef"
        :data="filteredRecords"
        border
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.type === '推荐挂店' ? 'primary' : 'danger'" size="small">
              {{ scope.row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pushStatus" label="确认推送" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.pushStatus === '已推送' ? 'success' : 'info'" size="small">
              {{ scope.row.pushStatus || '未推送' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="意向状态" width="100">
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
        <el-table-column label="项目标签" width="150">
          <template #default="scope">
            <el-tag v-for="tag in scope.row.projectTags" :key="tag" size="small" type="info" style="margin-right: 4px; margin-bottom: 4px;">
              {{ tag }}
            </el-tag>
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
        <el-table-column prop="recommendStore" label="推荐/取消挂店门店" width="250">
          <template #default="scope">
            <div v-for="store in scope.row.recommendStore" :key="store" style="display: inline-block; margin-right: 4px; margin-bottom: 4px;">
              <el-tag size="small" :type="scope.row.type === '推荐挂店' ? 'warning' : 'danger'" style="margin-right: 4px;">
                {{ store }}
              </el-tag>
              <el-icon v-if="scope.row.type === '推荐挂店' && (scope.row.pushStatus !== '已推送')" class="delete-icon" @click="handleRemoveStore(scope.row, store)">
                <Close />
              </el-icon>
            </div>
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
import { Search, Refresh, ArrowRight, QuestionFilled, Close } from '@element-plus/icons-vue'

// 响应式数据
const searchForm = reactive({
  type: '',
  employee: '',
  store: [],
  status: '',
  pushStatus: '',
  projectTagInclude: [],
  projectTagNotRepeat: [],
  skillLevelInclude: [],
  skillLevelNotRepeat: [],
  hangingStore: [],
  confirmTimeRange: []
})

// 表格引用
const tableRef = ref(null)

// 选中的行
const selectedRows = ref([])

// 模拟数据
const records = ref([
  {    id: '1',
    type: '推荐挂店',
    employeeId: '10001',
    employeeName: '张三',
    projectPlate: '推拿',
    projectTags: ['中医推拿', '精油推拿', '肩颈调理'],
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
    pushStatus: '已推送',
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
    projectTags: ['中式足疗', '泰式足疗', '草药足疗'],
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
    pushStatus: '未推送',
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
    projectTags: ['精油SPA', '热石SPA', '面部护理'],
    skillLevel: 'LV5',
    workDuration: 30,
    mainStore: '环球中心店',
    hangingStores: ['春熙路店', '桐梓林店'],
    recommendStore: ['太古里店', '九眼桥店'],
    intentionStore: ['太古里店', '九眼桥店'],
    operationTime: '2026-01-27 09:00:00',
    expireTime: '2026-02-01 00:00:00',
    status: '待确认',
    pushStatus: '未推送',
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
    projectTags: ['中医推拿', '肩颈调理'],
    skillLevel: 'LV3',
    workDuration: 12,
    mainStore: '桐梓林店',
    hangingStores: ['环球中心店'],
    recommendStore: ['天府凯德店', '春熙路店'],
    intentionStore: [],
    operationTime: '2026-01-20 11:00:00',
    expireTime: '2026-01-25 00:00:00',
    status: '自动取消',
    pushStatus: '未推送',
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
    // 门店搜索（多选）
    if (searchForm.store && searchForm.store.length > 0) {
      const storeText = `${record.mainStore} ${record.hangingStores.join(' ')} ${record.recommendStore.join(' ')} ${record.intentionStore.join(' ')}`;
      const hasMatchingStore = searchForm.store.some(store => storeText.includes(store));
      if (!hasMatchingStore) {
        return false;
      }
    }
    // 挂店门店搜索（多选）
    if (searchForm.hangingStore && searchForm.hangingStore.length > 0) {
      const recommendStoreText = record.recommendStore.join(' ');
      const hasMatchingHangingStore = searchForm.hangingStore.some(store => recommendStoreText.includes(store));
      if (!hasMatchingHangingStore) {
        return false;
      }
    }
    // 意向状态过滤
    if (searchForm.status && record.status !== searchForm.status) {
      return false
    }
    // 推送状态过滤
    if (searchForm.pushStatus) {
      if (searchForm.pushStatus === '已推送' && record.pushStatus !== '已推送') {
        return false
      }
      if (searchForm.pushStatus === '未推送' && record.pushStatus === '已推送') {
        return false
      }
    }
    // 项目标签包含过滤（多选）
    if (searchForm.projectTagInclude && searchForm.projectTagInclude.length > 0) {
      const hasMatchingTag = searchForm.projectTagInclude.some(tag => record.projectTags.includes(tag))
      if (!hasMatchingTag) {
        return false
      }
    }
    // 项目标签不重复过滤（多选）
    if (searchForm.projectTagNotRepeat && searchForm.projectTagNotRepeat.length > 0) {
      // 这里需要根据实际业务逻辑实现，暂时假设与主服务门店技师的项目标签不重复
      // 为了演示，我们假设所有记录都满足不重复条件
    }
    // 技法等级包含过滤（多选）
    if (searchForm.skillLevelInclude && searchForm.skillLevelInclude.length > 0) {
      if (!searchForm.skillLevelInclude.includes(record.skillLevel)) {
        return false
      }
    }
    // 技法等级不重复过滤（多选）
    if (searchForm.skillLevelNotRepeat && searchForm.skillLevelNotRepeat.length > 0) {
      // 这里需要根据实际业务逻辑实现，暂时假设与主服务门店技师的等级不重复
      // 为了演示，我们假设所有记录都满足不重复条件
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
    store: [],
    status: '',
    pushStatus: '',
    projectTagInclude: [],
    projectTagNotRepeat: [],
    skillLevelInclude: [],
    skillLevelNotRepeat: [],
    hangingStore: [],
    confirmTimeRange: []
  })
}

// 处理选择变化
const handleSelectionChange = (val) => {
  selectedRows.value = val
}

// 批量推送
const handleBatchPush = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要推送的数据')
    return
  }
  
  // 过滤出类型为推荐挂店的记录
  const recommendRecords = selectedRows.value.filter(row => row.type === '推荐挂店')
  if (recommendRecords.length === 0) {
    ElMessage.warning('只能推送类型为推荐挂店的记录')
    return
  }
  
  ElMessageBox.confirm('确定要推送选中的推荐挂店记录吗？', '确认推送', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟推送操作
    recommendRecords.forEach(row => {
      row.pushStatus = '已推送'
    })
    ElMessage.success(`成功推送 ${recommendRecords.length} 条推荐挂店记录`)
    // 清空选择
    selectedRows.value = []
  }).catch(() => {
    // 取消操作
  })
}

// 一键推送
const handleOneClickPush = () => {
  if (filteredRecords.value.length === 0) {
    ElMessage.warning('没有可推送的数据')
    return
  }
  
  // 过滤出类型为推荐挂店的记录
  const recommendRecords = filteredRecords.value.filter(row => row.type === '推荐挂店')
  if (recommendRecords.length === 0) {
    ElMessage.warning('只能推送类型为推荐挂店的记录')
    return
  }
  
  ElMessageBox.confirm('确定要推送所有筛选出来的推荐挂店记录吗？', '一键推送', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟推送操作
    recommendRecords.forEach(row => {
      row.pushStatus = '已推送'
    })
    ElMessage.success(`成功推送 ${recommendRecords.length} 条推荐挂店记录`)
  }).catch(() => {
    // 取消操作
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

// 移除推荐挂店门店
const handleRemoveStore = (row, store) => {
  ElMessageBox.confirm(`确定要移除门店 ${store} 吗？`, '确认移除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 从推荐门店数组中移除指定门店
    const index = row.recommendStore.indexOf(store)
    if (index > -1) {
      row.recommendStore.splice(index, 1)
      ElMessage.success(`成功移除门店 ${store}`)
    }
  }).catch(() => {
    // 取消操作
  })
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

.label-with-tooltip {
  display: flex;
  align-items: center;
  gap: 5px;
}

.question-icon {
  font-size: 14px;
  color: #909399;
  cursor: help;
}

.delete-icon {
  font-size: 14px;
  color: #f56c6c;
  cursor: pointer;
  vertical-align: middle;
}

.delete-icon:hover {
  color: #f5222d;
}

.action-section {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
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