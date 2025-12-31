<template>
  <div class="custom-time-strategy-page">
    <div class="page-header">
      <h1>自定义时间策略</h1>
      <p>基于推拿师个人维度配置门店路线间隔时间</p>
    </div>

    <!-- 搜索区域 -->
    <div class="search-section">
      <el-form :model="searchForm" inline>
        <el-form-item label="员工搜索">
          <el-input
            v-model="searchForm.employeeQuery"
            placeholder="输入员工姓名或工号"
            clearable
            style="width: 250px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="选择状态"
            clearable
            style="width: 150px"
          >
            <el-option label="启用" value="active" />
            <el-option label="部分启用" value="department-active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
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
          <el-button type="primary" @click="handleAddStrategy">
            <el-icon><Plus /></el-icon>
            新增策略
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 自定义策略列表 -->
    <div class="strategy-section">
      <el-card class="box-card">
        <el-table
          :data="filteredStrategies"
          stripe
          style="width: 100%"
          :max-height="600"
        >
          <el-table-column prop="employeeName" label="员工" width="150">
            <template #default="scope">
              <div class="employee-info">
                <div class="employee-name">{{ scope.row.employeeName }}</div>
                <div class="employee-id">({{ scope.row.employeeId }})</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="门店对路线" width="150">
            <template #default="scope">
              <div class="route-count">
                <el-tag size="small" type="primary">
                  {{ scope.row.storePairs.length }} 条路线
                </el-tag>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="status" label="状态" width="120">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="200" fixed="right">
            <template #default="scope">
              <div class="operation-buttons">
                <el-button size="small" type="primary" @click="handleManageStrategy(scope.row)">
                  <el-icon><Edit /></el-icon>
                  策略管理
                </el-button>
                <el-button size="small" type="danger" @click="handleDeleteStrategy(scope.row)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 分页 -->
    <div class="pagination-section">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新增/编辑策略对话框 -->
    <el-dialog
      v-model="strategyDialogVisible"
      :title="dialogTitle"
      width="900px"
      teleported
    >
      <el-form :model="strategyForm" :rules="strategyRules" ref="strategyFormRef">
        <div class="simple-form">
          <div class="simple-row">
            <div class="simple-label">员工信息</div>
            <div class="simple-control">
              <!-- 编辑策略时直接显示员工信息 -->
              <div v-if="strategyForm.id" class="employee-info-display">
                {{ strategyForm.employeeName }} ({{ strategyForm.employeeId }})
              </div>
              
              <!-- 新增策略时显示下拉框 -->
              <el-select 
                v-else
                v-model="strategyForm.employeeId" 
                placeholder="选择员工"
                filterable
                style="width: 100%"
                @change="handleEmployeeChange"
              >
                <el-option
                  v-for="employee in availableEmployees"
                  :key="employee.id"
                  :label="`${employee.name} (${employee.id})`"
                  :value="employee.id"
                />
              </el-select>
            </div>
          </div>

          <!-- 门店对配置 -->
          <div v-if="strategyForm.employeeId" class="store-pairs-section">
            <h4>门店对配置</h4>
            <div v-for="(pair, index) in employeeStorePairs" :key="index" class="store-pair-item">
              <div class="pair-header">
                <span class="pair-name">{{ pair.route }}</span>
                <el-switch
                  v-model="pair.enabled"
                  active-text="启用"
                  inactive-text="禁用"
                  @change="handlePairEnableChange(pair)"
                />
              </div>
              
              <div class="pair-directions">
                <!-- 前往和返回方向并排 -->
                <div class="directions-row">
                  <!-- 前往方向 -->
                  <div class="direction-section">
                    <h5>前往</h5>
                    <div class="direction-details">
                      <div class="detail-row">
                        <span class="detail-label">导航时间：</span>
                        <span class="detail-value">{{ pair.forward.navigationTime }}分钟 ({{ getNavigationTypeLabel(pair.forward.navigationType) }} + {{ getPlanStrategyLabel(pair.forward.planStrategy) }})</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">标准时间：</span>
                        <span class="detail-value">{{ pair.forward.standardTime }}分钟</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">自定义时间：</span>
                        <el-input-number
                          v-model="pair.forward.customTime"
                          :min="10"
                          :max="60"
                          :disabled="!pair.enabled"
                          controls-position="right"
                          style="width: 120px; margin-right: 8px;"
                        />
                        <span>分钟</span>
                      </div>
                    </div>
                  </div>

                  <!-- 返回方向 -->
                  <div class="direction-section">
                    <h5>返回</h5>
                    <div class="direction-details">
                      <div class="detail-row">
                        <span class="detail-label">导航时间：</span>
                        <span class="detail-value">{{ pair.backward.navigationTime }}分钟 ({{ getNavigationTypeLabel(pair.backward.navigationType) }} + {{ getPlanStrategyLabel(pair.backward.planStrategy) }})</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">标准时间：</span>
                        <span class="detail-value">{{ pair.backward.standardTime }}分钟</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">自定义时间：</span>
                        <el-input-number
                          v-model="pair.backward.customTime"
                          :min="10"
                          :max="60"
                          :disabled="!pair.enabled"
                          controls-position="right"
                          style="width: 120px; margin-right: 8px;"
                        />
                        <span>分钟</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 有效期模式 -->
                <div class="validity-section">
                  <div class="detail-row">
                    <span class="detail-label">有效期模式：</span>
                    <el-radio-group v-model="pair.validity" :disabled="!pair.enabled">
                      <el-radio label="permanent">永久</el-radio>
                      <el-radio label="temporary">限时有效</el-radio>
                    </el-radio-group>
                  </div>
                  
                  <div v-if="pair.validity === 'temporary'" class="validity-dates">
                    <div class="date-row">
                      <span class="detail-label">开始时间：</span>
                      <el-date-picker
                        v-model="pair.validFrom"
                        type="datetime"
                        placeholder="选择开始时间"
                        format="YYYY-MM-DD HH:mm"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        :disabled="!pair.enabled"
                        style="width: 200px; margin-right: 20px;"
                      />
                      <span class="detail-label">结束时间：</span>
                      <el-date-picker
                        v-model="pair.validTo"
                        type="datetime"
                        placeholder="选择结束时间"
                        format="YYYY-MM-DD HH:mm"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        :disabled="!pair.enabled"
                        style="width: 200px;"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="strategyDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveStrategy">确认保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Plus,
  Edit,
  Delete,
  Refresh
} from '@element-plus/icons-vue'

// 响应式数据
const searchForm = reactive({
  employeeQuery: '',
  status: ''
})

const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 员工数据
const employees = ref([
  { id: '10001', name: '张三', position: '推拿师' },
  { id: '10002', name: '李四', position: '推拿师' },
  { id: '10003', name: '王五', position: '推拿师' },
  { id: '10004', name: '赵六', position: '推拿师' },
  { id: '10005', name: '钱七', position: '推拿师' }
])

// 门店数据
const stores = ref([
  {
    id: '1',
    name: '天府凯德店',
    displayName: '天府凯德店',
    address: '成都市高新区天府大道123号天府凯德广场3F',
    city: 'chengdu',
    longitude: '104.0647',
    latitude: '30.5702'
  },
  {
    id: '2',
    name: '金牛凯德店',
    displayName: '金牛凯德店',
    address: '成都市金牛区蜀汉路456号金牛凯德广场2F',
    city: 'chengdu',
    longitude: '104.0520',
    latitude: '30.6907'
  },
  {
    id: '3',
    name: '春熙路店',
    displayName: '春熙路店',
    address: '成都市锦江区春熙路789号王府井百货B1',
    city: 'chengdu',
    longitude: '104.0770',
    latitude: '30.6574'
  },
  {
    id: '4',
    name: '万达广场店',
    displayName: '万达广场店',
    address: '成都市郫都区创业路999号郫都万达广场4F',
    city: 'chengdu',
    longitude: '103.8967',
    latitude: '30.8108'
  }
])

// 生成门店对数据
const generateStorePairs = (employeeId) => {
  const pairs = []
  const navigationTypes = ['walking', 'cycling', 'e-bike', 'bus', 'driving']
  const planStrategies = ['shortest-distance', 'shortest-time']
  
  // 生成所有可能的门店组合
  for (let i = 0; i < stores.value.length; i++) {
    for (let j = i + 1; j < stores.value.length; j++) {
      // 为每个门店对生成多条路线（不同导航方式）
      const navigationType = navigationTypes[Math.floor(Math.random() * navigationTypes.length)]
      const planStrategy = planStrategies[Math.floor(Math.random() * planStrategies.length)]
      
      pairs.push({
        id: `${stores.value[i].id}-${stores.value[j].id}-${navigationType}`,
        route: `${stores.value[i].displayName} ↔ ${stores.value[j].displayName}`,
        forward: {
          navigationTime: Math.floor(Math.random() * 20) + 10, // 10-30分钟
          standardTime: Math.floor(Math.random() * 20) + 15,   // 15-35分钟
          navigationType: navigationType,
          planStrategy: planStrategy,
          customTime: null
        },
        backward: {
          navigationTime: Math.floor(Math.random() * 20) + 10, // 10-30分钟
          standardTime: Math.floor(Math.random() * 20) + 15,   // 15-35分钟
          navigationType: navigationType,
          planStrategy: planStrategy,
          customTime: null
        },
        enabled: false,
        validity: 'permanent',
        validFrom: null,
        validTo: null
      })
    }
  }
  
  // 额外生成一些反向路线（增加数据量）
  for (let i = 0; i < stores.value.length; i++) {
    for (let j = i + 1; j < stores.value.length; j++) {
      if (Math.random() > 0.5) {
        const navigationType = navigationTypes[Math.floor(Math.random() * navigationTypes.length)]
        const planStrategy = planStrategies[Math.floor(Math.random() * planStrategies.length)]
        
        pairs.push({
          id: `${stores.value[j].id}-${stores.value[i].id}-${navigationType}`,
          route: `${stores.value[j].displayName} ↔ ${stores.value[i].displayName}`,
          forward: {
            navigationTime: Math.floor(Math.random() * 20) + 10, // 10-30分钟
            standardTime: Math.floor(Math.random() * 20) + 15,   // 15-35分钟
            navigationType: navigationType,
            planStrategy: planStrategy,
            customTime: null
          },
          backward: {
            navigationTime: Math.floor(Math.random() * 20) + 10, // 10-30分钟
            standardTime: Math.floor(Math.random() * 20) + 15,   // 15-35分钟
            navigationType: navigationType,
            planStrategy: planStrategy,
            customTime: null
          },
          enabled: false,
          validity: 'permanent',
          validFrom: null,
          validTo: null
        })
      }
    }
  }
  
  return pairs
}

// 自定义策略数据
const customStrategies = ref([
  {
    id: 's1',
    employeeId: '10001',
    employeeName: '张三',
    status: 'active',
    storePairs: [
      {
        id: '1-2-cycling',
        route: '天府凯德店 ↔ 金牛凯德店',
        forward: {
          navigationTime: 18,
          standardTime: 20,
          navigationType: 'cycling',
          planStrategy: 'shortest-time',
          customTime: 22
        },
        backward: {
          navigationTime: 16,
          standardTime: 20,
          navigationType: 'cycling',
          planStrategy: 'shortest-time',
          customTime: 18
        },
        enabled: true,
        validity: 'temporary',
        validFrom: '2024-12-27 00:00:00',
        validTo: '2025-01-27 23:59:59'
      },
      {
        id: '1-3-bus',
        route: '天府凯德店 ↔ 春熙路店',
        forward: {
          navigationTime: 25,
          standardTime: 30,
          navigationType: 'bus',
          planStrategy: 'shortest-distance',
          customTime: 28
        },
        backward: {
          navigationTime: 22,
          standardTime: 30,
          navigationType: 'bus',
          planStrategy: 'shortest-distance',
          customTime: 25
        },
        enabled: true,
        validity: 'permanent',
        validFrom: null,
        validTo: null
      },
      {
        id: '1-4-walking',
        route: '天府凯德店 ↔ 万达广场店',
        forward: {
          navigationTime: 35,
          standardTime: 40,
          navigationType: 'walking',
          planStrategy: 'shortest-time',
          customTime: null
        },
        backward: {
          navigationTime: 32,
          standardTime: 40,
          navigationType: 'walking',
          planStrategy: 'shortest-time',
          customTime: null
        },
        enabled: false,
        validity: 'permanent',
        validFrom: null,
        validTo: null
      }
    ],
    createdAt: '2024-12-26 10:00:00'
  },
  {
    id: 's2',
    employeeId: '10002',
    employeeName: '李四',
    status: 'inactive',
    storePairs: [
      {
        id: '1-3-e-bike',
        route: '天府凯德店 ↔ 春熙路店',
        forward: {
          navigationTime: 12,
          standardTime: 15,
          navigationType: 'e-bike',
          planStrategy: 'shortest-time',
          customTime: null
        },
        backward: {
          navigationTime: 11,
          standardTime: 15,
          navigationType: 'e-bike',
          planStrategy: 'shortest-time',
          customTime: null
        },
        enabled: false,
        validity: 'permanent',
        validFrom: null,
        validTo: null
      },
      {
        id: '2-3-driving',
        route: '金牛凯德店 ↔ 春熙路店',
        forward: {
          navigationTime: 15,
          standardTime: 20,
          navigationType: 'driving',
          planStrategy: 'shortest-distance',
          customTime: null
        },
        backward: {
          navigationTime: 13,
          standardTime: 20,
          navigationType: 'driving',
          planStrategy: 'shortest-distance',
          customTime: null
        },
        enabled: false,
        validity: 'permanent',
        validFrom: null,
        validTo: null
      }
    ],
    createdAt: '2024-12-25 14:30:00'
  }
])

// 当前员工的门店对
const employeeStorePairs = ref([])

// 可用员工（不存在自定义策略的员工）
const availableEmployees = computed(() => {
  const existingEmployeeIds = customStrategies.value.map(s => s.employeeId)
  return employees.value.filter(emp => !existingEmployeeIds.includes(emp.id))
})

// 过滤后的策略数据
const filteredStrategies = computed(() => {
  let data = [...customStrategies.value]
  
  if (searchForm.employeeQuery) {
    data = data.filter(item => 
      item.employeeName.includes(searchForm.employeeQuery) || 
      item.employeeId.includes(searchForm.employeeQuery)
    )
  }
  
  if (searchForm.status) {
    data = data.filter(item => item.status === searchForm.status)
  }
  
  total.value = data.length
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return data.slice(start, end)
})

// 对话框相关
const strategyDialogVisible = ref(false)
const dialogTitle = ref('新增策略')
const strategyForm = reactive({
  id: null,
  employeeId: '',
  employeeName: '',
  status: 'inactive'
})

// 表单验证规则
const strategyRules = {
  employeeId: [
    { required: true, message: '请选择员工', trigger: 'change' }
  ]
}

// 方法
const handleSearch = () => {
  currentPage.value = 1
}

const handleReset = () => {
  searchForm.employeeQuery = ''
  searchForm.status = ''
  currentPage.value = 1
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

const handleAddStrategy = () => {
  Object.assign(strategyForm, {
    id: null,
    employeeId: '',
    employeeName: '',
    status: 'inactive'
  })
  
  employeeStorePairs.value = []
  dialogTitle.value = '新增策略'
  strategyDialogVisible.value = true
}

const handleManageStrategy = (row) => {
  Object.assign(strategyForm, { ...row })
  
  // 加载该员工的门店对配置
  employeeStorePairs.value = JSON.parse(JSON.stringify(row.storePairs))
  dialogTitle.value = '策略管理'
  strategyDialogVisible.value = true
}

const handleDeleteStrategy = (row) => {
  ElMessageBox.confirm(
    `确定要删除 ${row.employeeName} (${row.employeeId}) 的自定义策略吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = customStrategies.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      customStrategies.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  })
}

const handleEmployeeChange = (employeeId) => {
  if (employeeId) {
    // 加载该员工的门店对
    const selectedEmployee = employees.value.find(emp => emp.id === employeeId)
    if (selectedEmployee) {
      strategyForm.employeeName = selectedEmployee.name
      employeeStorePairs.value = generateStorePairs(employeeId)
    }
  }
}

const handlePairEnableChange = (pair) => {
  // 当启用门店对时，设置默认的自定义时间
  if (pair.enabled) {
    if (!pair.forward.customTime) {
      pair.forward.customTime = pair.forward.standardTime
    }
    if (!pair.backward.customTime) {
      pair.backward.customTime = pair.backward.standardTime
    }
  }
}

const handleSaveStrategy = async () => {
  // 验证表单
  if (!strategyForm.employeeId) {
    ElMessage.error('请选择员工')
    return
  }

  // 验证启用的门店对配置
  const enabledPairs = employeeStorePairs.value.filter(pair => pair.enabled)
  for (const pair of enabledPairs) {
    // 验证自定义时间范围
    if (pair.forward.enabled && (pair.forward.customTime < 10 || pair.forward.customTime > 60)) {
      ElMessage.error(`前往方向的自定义时间必须在10-60分钟之间`)
      return
    }
    
    if (pair.backward.enabled && (pair.backward.customTime < 10 || pair.backward.customTime > 60)) {
      ElMessage.error(`返回方向的自定义时间必须在10-60分钟之间`)
      return
    }
    
    // 验证限时有效期
    if (pair.validity === 'temporary') {
      if (!pair.validFrom || !pair.validTo) {
        ElMessage.error(`门店对 ${pair.route} 的限时有效期不能为空`)
        return
      }
      
      const fromDate = new Date(pair.validFrom)
      const toDate = new Date(pair.validTo)
      
      // 验证时间间隔（最小10分钟，最大3个月）
      const diffMinutes = (toDate - fromDate) / (1000 * 60)
      if (diffMinutes < 10) {
        ElMessage.error(`门店对 ${pair.route} 的有效期至少需要10分钟`)
        return
      }
      
      if (diffMinutes > 3 * 30 * 24 * 60) { // 3个月的分钟数
        ElMessage.error(`门店对 ${pair.route} 的有效期不能超过3个月`)
        return
      }
      
      if (fromDate >= toDate) {
        ElMessage.error(`门店对 ${pair.route} 的开始时间必须早于结束时间`)
        return
      }
    }
  }

  // 获取员工信息
  const selectedEmployee = employees.value.find(emp => emp.id === strategyForm.employeeId)

  if (strategyForm.id) {
    // 更新现有策略
    const index = customStrategies.value.findIndex(item => item.id === strategyForm.id)
    if (index !== -1) {
      customStrategies.value[index] = {
        ...strategyForm,
        storePairs: employeeStorePairs.value,
        status: enabledPairs.length > 0 ? 'active' : 'inactive',
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      }
    }
  } else {
    // 添加新策略
    const newStrategy = {
      id: `s${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      employeeId: strategyForm.employeeId,
      employeeName: selectedEmployee.name,
      status: enabledPairs.length > 0 ? 'active' : 'inactive',
      storePairs: employeeStorePairs.value,
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
    }
    customStrategies.value.push(newStrategy)
  }

  ElMessage.success('保存成功')
  strategyDialogVisible.value = false
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  switch (status) {
    case 'active': return 'success'
    case 'department-active': return 'warning'
    case 'inactive': return 'info'
    default: return 'info'
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'active': return '启用'
    case 'department-active': return '部分启用'
    case 'inactive': return '禁用'
    default: return '未知'
  }
}

// 获取导航方式标签
const getNavigationTypeLabel = (value) => {
  const labels = {
    'walking': '步行',
    'cycling': '骑行',
    'e-bike': '骑电动车',
    'bus': '公交',
    'driving': '驾车'
  }
  return labels[value] || value
}

// 获取方案策略标签
const getPlanStrategyLabel = (value) => {
  const labels = {
    'shortest-distance': '距离最短',
    'shortest-time': '用时最短'
  }
  return labels[value] || value
}

onMounted(() => {
  console.log('CustomTimeStrategy page loaded')
  total.value = customStrategies.value.length
})
</script>

<style scoped>
.custom-time-strategy-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  color: #606266;
}

.search-section {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.employee-info {
  display: flex;
  flex-direction: column;
}

.employee-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.employee-id {
  font-size: 12px;
  color: #909399;
}

.route-info {
  display: flex;
  flex-direction: column;
}

.route-item {
  margin-bottom: 8px;
  padding: 8px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #fafafa;
}

.route-pair {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.route-text {
  font-weight: 500;
  margin-right: 8px;
}

.route-details {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.operation-buttons {
  display: flex;
  gap: 8px;
}

.simple-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.simple-row {
  display: flex;
  align-items: flex-start;
}

.simple-label {
  width: 120px;
  font-weight: 500;
  color: #606266;
  padding-top: 6px;
}

.simple-control {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.employee-info-display {
  margin-top: 4px;
  padding: 4px 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
}

.store-pairs-section {
  margin-top: 12px;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #fafafa;
}

.store-pair-item {
  margin-bottom: 12px;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.pair-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid #ebeef5;
}

.pair-name {
  font-weight: 500;
  font-size: 16px;
}

.pair-directions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.directions-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .directions-row {
    flex-direction: column;
  }
}

.direction-section {
  flex: 1;
  min-width: 300px;
  padding: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.direction-section h5 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.direction-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.detail-label {
  font-weight: 500;
  color: #606266;
  min-width: 100px;
}

.detail-value {
  color: #303133;
  margin-right: 8px;
}

.validity-section {
  margin-top: 8px;
  padding: 8px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  background-color: #f4f4f5;
}

.validity-dates {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.date-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 修复下拉框z-index问题 */
:deep(.el-dialog) {
  z-index: 2000 !important;
}

:deep(.el-popper) {
  z-index: 2100 !important;
}

:deep(.el-select-dropdown) {
  z-index: 2100 !important;
}
</style>