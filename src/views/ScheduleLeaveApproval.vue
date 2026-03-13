<template>
  <div class="schedule-leave-approval">
    <div class="page-header">
      <h1>排班排假审核</h1>
    </div>
    
    <div class="content-container">

      
      <!-- 页签 -->
      <el-tabs v-model="activeTab" type="card" style="margin-bottom: 20px">
        <el-tab-pane label="排班审核" name="schedule">
          <!-- 搜索和周选择器 -->
          <div class="search-and-week">
            <div class="search-container">
              <el-select
                v-model="scheduleSelectedStore"
                placeholder="选择门店"
                style="width: 200px"
                clearable
              >
                <el-option
                  v-for="store in allStores"
                  :key="store.storeCode"
                  :label="store.storeName"
                  :value="store.storeCode"
                />
              </el-select>
            </div>
            
            <div class="week-selector">
              <el-select v-model="selectedWeek" placeholder="选择排班周" @change="loadWeekData" style="width: 200px">
                <el-option 
                  v-for="week in availableWeeks" 
                  :key="week.id" 
                  :label="week.name" 
                  :value="week.id"
                />
              </el-select>
            </div>
          </div>
          
          <!-- 排班审核操作按钮 -->
          <div class="action-buttons">
            <el-button type="primary" @click="adoptAllRecommendations">一键采纳</el-button>
            <el-button type="default" @click="batchAdoptRecommendations">批量采纳</el-button>
            <el-button type="default" @click="confirmAll">释放排班名额</el-button>
            <el-button type="default" @click="exportData">导出</el-button>
          </div>
          
          <!-- 排班审核门店列表 -->
          <div class="store-table-container">
            <el-table :data="storeData" style="width: 100%" size="small" :default-expand-all="false" @selection-change="handleSelectionChange">
              <el-table-column type="selection" width="55" />

              <!-- 门店基本信息 -->
              <el-table-column prop="storeCode" label="门店编码" width="100" />
              <el-table-column prop="storeName" label="门店" min-width="120" />
              <el-table-column prop="therapistCount" label="在岗调理师数" width="120" />
              
              <!-- 每个日期的班次数据 -->
              <el-table-column v-for="date in selectedWeekDates" :key="date" :label="date" min-width="800">
                <template #default="scope">
                  <div class="date-shifts">
                    <!-- 早班 -->
                    <div class="shift-item">
                      <div class="shift-header">早班</div>
                      <div class="shift-content">
                        <span class="shift-info">
                          名额: 
                          <el-input-number 
                            :model-value="getShiftData(scope.row, '早班', date + 'Quota')" 
                            @update:model-value="updateShiftData(scope.row, '早班', date + 'Quota', $event)"
                            :min="0" 
                            size="small"
                            style="width: 70px; margin: 0 5px"
                          />
                        </span>
                        <span class="shift-info recommended">
                          建议: <span class="recommended-value">{{ getShiftData(scope.row, '早班', date + 'Recommended') }}</span>
                        </span>
                      </div>
                    </div>
                    
                    <!-- 晚班 -->
                    <div class="shift-item">
                      <div class="shift-header">晚班</div>
                      <div class="shift-content">
                        <span class="shift-info">
                          名额: 
                          <el-input-number 
                            :model-value="getShiftData(scope.row, '晚班', date + 'Quota')" 
                            @update:model-value="updateShiftData(scope.row, '晚班', date + 'Quota', $event)"
                            :min="0" 
                            size="small"
                            style="width: 70px; margin: 0 5px"
                          />
                        </span>
                        <span class="shift-info recommended">
                          建议: <span class="recommended-value">{{ getShiftData(scope.row, '晚班', date + 'Recommended') }}</span>
                        </span>
                      </div>
                    </div>
                    
                    <!-- 通班 -->
                    <div class="shift-item">
                      <div class="shift-header">通班</div>
                      <div class="shift-content">
                        <span class="shift-info">
                          名额: 
                          <el-input-number 
                            :model-value="getShiftData(scope.row, '通班', date + 'Quota')" 
                            @update:model-value="updateShiftData(scope.row, '通班', date + 'Quota', $event)"
                            :min="0" 
                            size="small"
                            style="width: 70px; margin: 0 5px"
                          />
                        </span>
                        <span class="shift-info recommended">
                          建议: <span class="recommended-value">{{ getShiftData(scope.row, '通班', date + 'Recommended') }}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              
              <!-- 操作按钮 -->
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="scope">
                  <div class="store-actions">
                    <el-button size="small" type="default" @click="confirmStore(scope.row)">
                      编辑
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
            
            <!-- 分页 -->
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="scheduleCurrentPage"
                v-model:page-size="schedulePageSize"
                :page-sizes="[5, 10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="scheduleTotal"
                @size-change="handleScheduleSizeChange"
                @current-change="handleScheduleCurrentChange"
              />
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="排假审核" name="leave">
          <!-- 搜索和周选择器 -->
          <div class="search-and-week">
            <div class="search-container">
              <el-select
                v-model="leaveSelectedStore"
                placeholder="选择门店"
                style="width: 200px"
                clearable
              >
                <el-option
                  v-for="store in allStores"
                  :key="store.storeCode"
                  :label="store.storeName"
                  :value="store.storeCode"
                />
              </el-select>
            </div>
            
            <div class="week-selector">
              <el-select v-model="selectedWeek" placeholder="选择排假周" @change="loadWeekData" style="width: 200px">
                <el-option 
                  v-for="week in availableWeeks" 
                  :key="week.id" 
                  :label="week.name" 
                  :value="week.id"
                />
              </el-select>
            </div>
          </div>
          
          <!-- 排假审核操作按钮 -->
          <div class="action-buttons">
            <el-button type="primary" @click="adoptAllLeaveRecommendations">一键采纳</el-button>
            <el-button type="default" @click="batchAdoptLeaveRecommendations">批量采纳</el-button>
            <el-button type="default" @click="confirmAllLeave">释放排假名额</el-button>
            <el-button type="default" @click="exportLeaveData">导出</el-button>
          </div>
          
          <!-- 排假审核门店列表 -->
          <div class="store-table-container">
            <el-table :data="leaveData" style="width: 100%" size="small" :default-expand-all="false" @selection-change="handleLeaveSelectionChange">
              <el-table-column type="selection" width="55" />

              <!-- 门店基本信息 -->
              <el-table-column prop="storeCode" label="门店编码" width="100" />
              <el-table-column prop="storeName" label="门店" min-width="120" />
              <el-table-column prop="therapistCount" label="在岗调理师数" width="120" />
              <el-table-column label="人均服时长" width="120">
                <template #default="scope">
                  <span>{{ getLeaveData(scope.row, '全天', selectedWeekDates[0] + 'AvgServiceTime') }}分钟</span>
                </template>
              </el-table-column>
              
              <!-- 每个日期的排假数据 -->
              <el-table-column v-for="date in selectedWeekDates" :key="date" :label="date" min-width="1050">
                <template #default="scope">
                  <div class="date-shifts">
                    <!-- 全天 -->
                    <div class="shift-item">
                      <div class="shift-header">全天</div>
                      <div class="shift-content">
                        <span class="shift-info">
                          名额: 
                          <el-input-number 
                            :model-value="getLeaveData(scope.row, '全天', date + 'Quota')" 
                            @update:model-value="updateLeaveData(scope.row, '全天', date + 'Quota', $event)"
                            :min="0" 
                            size="small"
                            style="width: 70px; margin: 0 5px"
                          />
                        </span>
                        <span class="shift-info recommended">
                          建议: <span class="recommended-value">{{ getLeaveData(scope.row, '全天', date + 'Recommended') }}</span>
                        </span>
                        <span class="shift-info">
                          在岗率: 
                          <el-input-number 
                            :model-value="70" 
                            @update:model-value="updateLeaveData(scope.row, '全天', date + 'AttendanceRate', $event)"
                            :min="0" 
                            :max="100" 
                            size="small"
                            style="width: 90px; margin: 0 5px"
                          />
                          <span>%</span>
                        </span>
                      </div>
                    </div>
                    
                    <!-- 早半天 -->
                    <div class="shift-item">
                      <div class="shift-header">早半天</div>
                      <div class="shift-content">
                        <span class="shift-info">
                          名额: 
                          <el-input-number 
                            :model-value="getLeaveData(scope.row, '早半天', date + 'Quota')" 
                            @update:model-value="updateLeaveData(scope.row, '早半天', date + 'Quota', $event)"
                            :min="0" 
                            size="small"
                            style="width: 70px; margin: 0 5px"
                          />
                        </span>
                        <span class="shift-info recommended">
                          建议: <span class="recommended-value">{{ getLeaveData(scope.row, '早半天', date + 'Recommended') }}</span>
                        </span>
                        <span class="shift-info">
                          在岗率: 
                          <el-input-number 
                            :model-value="70" 
                            @update:model-value="updateLeaveData(scope.row, '早半天', date + 'AttendanceRate', $event)"
                            :min="0" 
                            :max="100" 
                            size="small"
                            style="width: 90px; margin: 0 5px"
                          />
                          <span>%</span>
                        </span>
                      </div>
                    </div>
                    
                    <!-- 晚半天 -->
                    <div class="shift-item">
                      <div class="shift-header">晚半天</div>
                      <div class="shift-content">
                        <span class="shift-info">
                          名额: 
                          <el-input-number 
                            :model-value="getLeaveData(scope.row, '晚半天', date + 'Quota')" 
                            @update:model-value="updateLeaveData(scope.row, '晚半天', date + 'Quota', $event)"
                            :min="0" 
                            size="small"
                            style="width: 70px; margin: 0 5px"
                          />
                        </span>
                        <span class="shift-info recommended">
                          建议: <span class="recommended-value">{{ getLeaveData(scope.row, '晚半天', date + 'Recommended') }}</span>
                        </span>
                        <span class="shift-info">
                          在岗率: 
                          <el-input-number 
                            :model-value="70" 
                            @update:model-value="updateLeaveData(scope.row, '晚半天', date + 'AttendanceRate', $event)"
                            :min="0" 
                            :max="100" 
                            size="small"
                            style="width: 90px; margin: 0 5px"
                          />
                          <span>%</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              
              <!-- 操作按钮 -->
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="scope">
                  <div class="store-actions">
                    <el-button size="small" type="default" @click="confirmLeaveStore(scope.row)">
                      编辑
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
            
            <!-- 分页 -->
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="leaveCurrentPage"
                v-model:page-size="leavePageSize"
                :page-sizes="[5, 10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="leaveTotal"
                @size-change="handleLeaveSizeChange"
                @current-change="handleLeaveCurrentChange"
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 业务周数据
const availableWeeks = ref([
  { id: 1, name: '排班周 1月11日-1月17日', startDate: '2026-01-11', endDate: '2026-01-17' },
  { id: 2, name: '排班周 1月18日-1月24日', startDate: '2026-01-18', endDate: '2026-01-24' },
  { id: 3, name: '排班周 1月25日-1月31日', startDate: '2026-01-25', endDate: '2026-01-31' }
])

const selectedWeek = ref(1)

// 选中的业务周日期
const selectedWeekDates = computed(() => {
  if (!selectedWeek.value) return []
  const week = availableWeeks.value.find(w => w.id === selectedWeek.value)
  if (!week) return []
  
  // 生成业务周的日期列表（周六开始）
  const dates = []
  const startDate = new Date(week.startDate)
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    dates.push(`${date.getMonth() + 1}/${date.getDate()}`)
  }
  
  return dates
})

// 门店数据
const storeData = ref([])
const leaveData = ref([])
const scheduleSelectedStore = ref('')
const leaveSelectedStore = ref('')
const allStores = ref([])
const activeTab = ref('schedule')

// 多选框数据
const selectedScheduleStores = ref([])
const selectedLeaveStores = ref([])

// 分页数据
const scheduleCurrentPage = ref(1)
const schedulePageSize = ref(10)
const scheduleTotal = ref(0)

const leaveCurrentPage = ref(1)
const leavePageSize = ref(10)
const leaveTotal = ref(0)

// 加载业务周数据
const loadWeekData = () => {
  // 模拟从API获取数据
  storeData.value = generateMockData()
  leaveData.value = generateLeaveMockData()
  
  // 设置分页总数
  scheduleTotal.value = storeData.value.length
  leaveTotal.value = leaveData.value.length
  
  // 重置当前页码
  scheduleCurrentPage.value = 1
  leaveCurrentPage.value = 1
}

// 生成模拟数据
const generateMockData = () => {
  const stores = [
    { storeCode: 'ST001', storeName: '中心店', therapistCount: 15 },
    { storeCode: 'ST002', storeName: '东区店', therapistCount: 12 },
    { storeCode: 'ST003', storeName: '西区店', therapistCount: 10 }
  ]
  
  return stores.map(store => {
    const scheduleData = {
      storeCode: store.storeCode,
      storeName: store.storeName,
      therapistCount: store.therapistCount,
      shifts: []
    }
    
    // 为每个门店生成班次数据
    const shiftTypes = ['早班', '晚班', '通班']
    
    shiftTypes.forEach((shiftType, index) => {
      const shiftData = { shiftType }
      
      // 为每个日期生成数据
      selectedWeekDates.value.forEach(date => {
        const baseOrders = Math.floor(Math.random() * 20) + 10
        const baseQuota = Math.floor(Math.random() * 5) + 3
        const recommended = Math.floor(baseQuota * (1 + Math.random() * 0.3))
        
        shiftData[date + 'Orders'] = baseOrders
        shiftData[date + 'Quota'] = baseQuota
        shiftData[date + 'Recommended'] = recommended
      })
      
      scheduleData.shifts.push(shiftData)
    })
    
    return scheduleData
  })
}

// 获取门店的排班数据
const getStoreScheduleData = (store) => {
  return store.shifts
}

// 获取班次数据
const getShiftData = (store, shiftType, field) => {
  const shift = store.shifts.find(s => s.shiftType === shiftType)
  return shift ? shift[field] : 0
}

// 更新班次数据
const updateShiftData = (store, shiftType, field, value) => {
  const shift = store.shifts.find(s => s.shiftType === shiftType)
  if (shift) {
    shift[field] = value
  }
}

// 整体采纳建议
const adoptAllRecommendations = () => {
  storeData.value.forEach(store => {
    adoptStoreRecommendations(store)
  })
  
  ElMessage.success('已整体采纳建议名额')
}

// 采纳门店建议
const adoptStoreRecommendations = (store) => {
  store.shifts.forEach(shift => {
    selectedWeekDates.value.forEach(date => {
      shift[date + 'Quota'] = shift[date + 'Recommended']
    })
  })
  
  ElMessage.success(`已采纳 ${store.storeName} 的建议名额`)
}

// 确认所有门店
const confirmAll = () => {
  // 只提示总体成功
  setTimeout(() => {
    ElMessage.success('所有门店排班名额已确认释放')
  }, 500)
}

// 确认门店
const confirmStore = (store) => {
  // 模拟确认操作
  setTimeout(() => {
    ElMessage.success(`${store.storeName} 已确认，排班名额已释放`)
  }, 500)
}

// 导出数据
const exportData = () => {
  // 模拟导出功能
  ElMessage.success('数据导出成功')
  console.log('导出数据:', storeData.value)
}

// 生成排假模拟数据
const generateLeaveMockData = () => {
  const stores = [
    { storeCode: 'ST001', storeName: '中心店', therapistCount: 15 },
    { storeCode: 'ST002', storeName: '东区店', therapistCount: 12 },
    { storeCode: 'ST003', storeName: '西区店', therapistCount: 10 }
  ]
  
  return stores.map(store => {
    const leaveData = {
      storeCode: store.storeCode,
      storeName: store.storeName,
      therapistCount: store.therapistCount,
      leaves: []
    }
    
    // 为每个门店生成排假数据
    const leaveTypes = ['全天', '早半天', '晚半天']
    
    leaveTypes.forEach((leaveType, index) => {
      const leaveItem = { leaveType }
      
      // 为每个日期生成数据
      selectedWeekDates.value.forEach(date => {
        // 生成随机数据
        const avgServiceTime = Math.floor(Math.random() * 30) + 40 // 40-70分钟
        const quota = Math.floor(Math.random() * 5) + 1 // 1-5个名额
        const recommended = Math.floor(Math.random() * 5) + 1 // 1-5个建议名额
        
        leaveItem[date + 'AvgServiceTime'] = avgServiceTime
        leaveItem[date + 'Quota'] = quota
        leaveItem[date + 'Recommended'] = recommended
      })
      
      leaveData.leaves.push(leaveItem)
    })
    
    return leaveData
  })
}

// 获取排假数据
const getLeaveData = (store, leaveType, field) => {
  const leave = store.leaves.find(l => l.leaveType === leaveType)
  return leave ? leave[field] : 0
}

// 更新排假数据
const updateLeaveData = (store, leaveType, field, value) => {
  const leave = store.leaves.find(l => l.leaveType === leaveType)
  if (leave) {
    leave[field] = value
  }
}

// 整体采纳排假建议
const adoptAllLeaveRecommendations = () => {
  leaveData.value.forEach(store => {
    adoptStoreLeaveRecommendations(store)
  })
  
  ElMessage.success('已整体采纳排假建议名额')
}

// 采纳门店排假建议
const adoptStoreLeaveRecommendations = (store) => {
  store.leaves.forEach(leave => {
    selectedWeekDates.value.forEach(date => {
      leave[date + 'Quota'] = leave[date + 'Recommended']
    })
  })
  
  ElMessage.success(`已采纳 ${store.storeName} 的排假建议名额`)
}

// 确认所有门店排假
const confirmAllLeave = () => {
  // 只提示总体成功
  setTimeout(() => {
    ElMessage.success('所有门店排假名额已确认释放')
  }, 500)
}

// 确认门店排假
const confirmLeaveStore = (store) => {
  // 模拟确认操作
  setTimeout(() => {
    ElMessage.success(`${store.storeName} 已确认，排假名额已释放`)
  }, 500)
}

// 导出排假数据
const exportLeaveData = () => {
  // 模拟导出功能
  ElMessage.success('排假数据导出成功')
  console.log('导出排假数据:', leaveData.value)
}

// 处理排班多选
const handleSelectionChange = (val) => {
  selectedScheduleStores.value = val
}

// 处理排假多选
const handleLeaveSelectionChange = (val) => {
  selectedLeaveStores.value = val
}

// 批量采纳排班建议
const batchAdoptRecommendations = () => {
  if (selectedScheduleStores.value.length === 0) {
    ElMessage.warning('请选择要采纳建议的门店')
    return
  }
  
  selectedScheduleStores.value.forEach(store => {
    adoptStoreRecommendations(store)
  })
  
  ElMessage.success(`已批量采纳 ${selectedScheduleStores.value.length} 个门店的建议名额`)
}

// 批量采纳排假建议
const batchAdoptLeaveRecommendations = () => {
  if (selectedLeaveStores.value.length === 0) {
    ElMessage.warning('请选择要采纳建议的门店')
    return
  }
  
  selectedLeaveStores.value.forEach(store => {
    adoptStoreLeaveRecommendations(store)
  })
  
  ElMessage.success(`已批量采纳 ${selectedLeaveStores.value.length} 个门店的建议名额`)
}

// 处理排班分页大小变化
const handleScheduleSizeChange = (size) => {
  schedulePageSize.value = size
  // 这里可以添加实际的分页数据加载逻辑
}

// 处理排班分页当前页变化
const handleScheduleCurrentChange = (current) => {
  scheduleCurrentPage.value = current
  // 这里可以添加实际的分页数据加载逻辑
}

// 处理排假分页大小变化
const handleLeaveSizeChange = (size) => {
  leavePageSize.value = size
  // 这里可以添加实际的分页数据加载逻辑
}

// 处理排假分页当前页变化
const handleLeaveCurrentChange = (current) => {
  leaveCurrentPage.value = current
  // 这里可以添加实际的分页数据加载逻辑
}

// 组件挂载时加载数据
onMounted(() => {
  // 初始化所有门店列表
  allStores.value = [
    { storeCode: 'ST001', storeName: '中心店' },
    { storeCode: 'ST002', storeName: '东区店' },
    { storeCode: 'ST003', storeName: '西区店' }
  ]
  loadWeekData()
})
</script>

<style scoped>
.schedule-leave-approval {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.search-and-week {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.week-selector {
  display: flex;
  align-items: center;
}

.action-buttons {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.store-table-container {
  overflow-x: auto;
}

.date-shifts {
  display: flex;
  gap: 10px;
  align-items: stretch;
  width: 100%;
}

.shift-item {
  background: #f9fafb;
  border-radius: 6px;
  padding: 10px;
  border: 1px solid #e5e7eb;
  flex: 1;
  min-width: 260px;
  box-sizing: border-box;
}

.shift-header {
  font-size: 12px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
  text-align: center;
  padding-bottom: 6px;
  border-bottom: 1px solid #e5e7eb;
}

.shift-content {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: nowrap;
  width: 100%;
  white-space: nowrap;
}

.shift-info {
  font-size: 11px;
  color: #666;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  min-width: 40px;
  white-space: nowrap;
}

.shift-info.recommended {
  color: #a40035;
}

.recommended-value {
  font-size: 11px;
  font-weight: bold;
  color: #a40035;
  background: #ffebee;
  padding: 2px 6px;
  border-radius: 3px;
  margin-left: 4px;
}

.store-actions {
  display: flex;
  gap: 6px;
}

/* 按钮样式调整 */
.action-buttons {
  gap: 8px;
}

.action-buttons .el-button {
  border-radius: 4px;
}

.action-buttons .el-button--primary {
  background-color: #a40035;
  border-color: #a40035;
}

.action-buttons .el-button--primary:hover {
  background-color: #8e002d;
  border-color: #8e002d;
}

.action-buttons .el-button--default {
  border-color: #ddd;
  color: #333;
}

.action-buttons .el-button--default:hover {
  border-color: #a40035;
  color: #a40035;
}

/* 调整表格样式 */
:deep(.el-table__row) {
  height: auto;
  min-height: 140px;
}

:deep(.el-table__cell) {
  padding: 10px;
}

/* 确保操作列固定 */
:deep(.el-table__fixed-right) {
  height: calc(100% - 32px) !important;
}

/* 分页样式 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.pagination-container .el-pagination {
  margin: 0;
}


</style>