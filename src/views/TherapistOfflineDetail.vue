<template>
  <div class="therapist-offline-detail">
    <div class="page-header">
      <h1>推拿师自主下线明细</h1>
      <p class="tip">💡 查看各配置层级的日期明细，已手动修改的日期标记为特殊日期</p>
    </div>

    <div class="content-section">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 城市明细 Tab -->
        <el-tab-pane label="城市明细" name="city">
          <div class="detail-toolbar">
            <div class="toolbar-left">
              <el-select v-model="cityWeek" placeholder="选择业务周" style="width: 260px;" @change="loadCityDetail">
                <el-option v-for="week in availableWeeks" :key="week.id" :label="week.name" :value="week.id" />
              </el-select>
              <el-select v-model="cityFilterCity" placeholder="筛选城市" style="width: 140px;">
                <el-option v-for="city in availableCities" :key="city" :label="city" :value="city" />
              </el-select>
            </div>
            <div class="toolbar-right">
              <el-tooltip content="将指定业务周的配置明细，重置为基础配置的限制" placement="top">
                <el-button @click="batchReset('city')">批量重置<el-icon><QuestionFilled /></el-icon></el-button>
              </el-tooltip>
            </div>
          </div>

          <el-table :data="filteredCityDetailData" border style="width: 100%">
            <el-table-column prop="cityName" label="城市" width="150" fixed="left">
              <template #default="scope">
                <span class="entity-name">🏢 {{ scope.row.cityName }}</span>
              </template>
            </el-table-column>

            <el-table-column v-for="date in weekDates" :key="date.date" :label="date.label" min-width="100">
              <template #header>
                <div :class="['date-header', { 'is-holiday': date.holidayName }]">
                  <span>{{ date.label }}</span>
                  <el-tag size="small" :type="date.holidayName ? 'warning' : (date.isWeekend ? 'success' : 'info')">
                    {{ date.type }}
                  </el-tag>
                </div>
              </template>
              <template #default="scope">
                <div :class="['threshold-cell', { modified: scope.row.thresholds[date.date]?.modified }]">
                  <span class="threshold-value">{{ scope.row.thresholds[date.date]?.value || '—' }}</span>
                  <el-button type="primary" size="small" link @click="editThreshold('city', scope.row, date)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <span v-if="scope.row.thresholds[date.date]?.modified" class="modified-mark">★</span>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <div class="legend-bar">
            <span class="legend-item modified">★ 已手动修改（特殊日期）</span>
          </div>
        </el-tab-pane>

        <!-- 门店明细 Tab -->
        <el-tab-pane label="门店明细" name="store">
          <div class="detail-toolbar">
            <div class="toolbar-left">
              <el-select v-model="storeWeek" placeholder="选择业务周" style="width: 260px;" @change="loadStoreDetail">
                <el-option v-for="week in availableWeeks" :key="week.id" :label="week.name" :value="week.id" />
              </el-select>
              <el-select v-model="storeFilterCity" placeholder="筛选城市" style="width: 140px;" @change="handleStoreCityChange">
                <el-option v-for="city in availableCities" :key="city" :label="city" :value="city" />
              </el-select>
              <el-select v-model="storeFilterStore" placeholder="筛选门店" style="width: 160px;" :disabled="!storeFilterCity">
                <el-option v-for="store in availableStoresForStoreFilter" :key="store" :label="store" :value="store" />
              </el-select>
            </div>
            <div class="toolbar-right">
                            <el-tooltip content="将指定业务周的配置明细，重置为基础配置的限制" placement="top">
                <el-button @click="batchReset('store')">批量重置<el-icon><QuestionFilled /></el-icon></el-button>
              </el-tooltip>
            </div>
          </div>

          <el-table :data="filteredStoreDetailData" border style="width: 100%">
            <el-table-column prop="storeName" label="门店" width="180" fixed="left">
              <template #default="scope">
                <span class="entity-name">🏪 {{ scope.row.storeName }}</span>
                <el-tag size="small" type="info" style="margin-left: 8px;">{{ scope.row.cityName }}</el-tag>
              </template>
            </el-table-column>

            <el-table-column v-for="date in weekDates" :key="date.date" :label="date.label" min-width="100">
              <template #header>
                <div :class="['date-header', { 'is-holiday': date.holidayName }]">
                  <span>{{ date.label }}</span>
                  <el-tag size="small" :type="date.holidayName ? 'warning' : (date.isWeekend ? 'success' : 'info')">
                    {{ date.type }}
                  </el-tag>
                </div>
              </template>
              <template #default="scope">
                <div :class="['threshold-cell', { modified: scope.row.thresholds[date.date]?.modified }]">
                  <span class="threshold-value">{{ scope.row.thresholds[date.date]?.value || '—' }}</span>
                  <el-button type="primary" size="small" link @click="editThreshold('store', scope.row, date)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <span v-if="scope.row.thresholds[date.date]?.modified" class="modified-mark">★</span>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <div class="legend-bar">
            <span class="legend-item modified">★ 已手动修改（特殊日期）</span>
          </div>
        </el-tab-pane>

        <!-- 推拿师明细 Tab -->
        <el-tab-pane label="推拿师明细" name="therapist">
          <div class="detail-toolbar">
            <div class="toolbar-left">
              <el-select v-model="therapistWeek" placeholder="选择业务周" style="width: 260px;" @change="loadTherapistDetail">
                <el-option v-for="week in availableWeeks" :key="week.id" :label="week.name" :value="week.id" />
              </el-select>
              <el-select v-model="therapistFilterCity" placeholder="筛选城市" style="width: 140px;" @change="handleTherapistCityChange">
                <el-option v-for="city in availableCities" :key="city" :label="city" :value="city" />
              </el-select>
              <el-select v-model="therapistFilterStore" placeholder="筛选门店" style="width: 160px;" :disabled="!therapistFilterCity">
                <el-option v-for="store in availableStoresForFilter" :key="store" :label="store" :value="store" />
              </el-select>
              <el-input v-model="therapistKeyword" placeholder="工号或姓名" style="width: 150px;" clearable />
            </div>
            <div class="toolbar-right">
                            <el-tooltip content="将指定业务周的配置明细，重置为基础配置的限制" placement="top">
                <el-button @click="batchReset('therapist')">批量重置<el-icon><QuestionFilled /></el-icon></el-button>
              </el-tooltip>
            </div>
          </div>

          <el-table :data="filteredTherapistDetailData" border style="width: 100%">
            <el-table-column prop="therapistName" label="推拿师" width="180" fixed="left">
              <template #default="scope">
                <span class="entity-name">👤 {{ scope.row.therapistName }}</span>
                <el-tag size="small" type="info" style="margin-left: 8px;">{{ scope.row.storeName }}</el-tag>
              </template>
            </el-table-column>

            <el-table-column v-for="date in weekDates" :key="date.date" :label="date.label" min-width="100">
              <template #header>
                <div :class="['date-header', { 'is-holiday': date.holidayName }]">
                  <span>{{ date.label }}</span>
                  <el-tag size="small" :type="date.holidayName ? 'warning' : (date.isWeekend ? 'success' : 'info')">
                    {{ date.type }}
                  </el-tag>
                </div>
              </template>
              <template #default="scope">
                <div :class="['threshold-cell', { modified: scope.row.thresholds[date.date]?.modified }]">
                  <span class="threshold-value">{{ scope.row.thresholds[date.date]?.value || '—' }}</span>
                  <el-button type="primary" size="small" link @click="editThreshold('therapist', scope.row, date)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <span v-if="scope.row.thresholds[date.date]?.modified" class="modified-mark">★</span>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <div class="legend-bar">
            <span class="legend-item modified">★ 已手动修改（特殊日期）</span>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 编辑阈值弹窗 -->
    <el-dialog v-model="editDialogVisible" :title="`编辑 ${editForm.entityName} ${editForm.dateLabel} 阈值`" width="450px">
      <el-form label-width="100px">
        <el-form-item label="配置对象">
          <span class="form-value">{{ editForm.entityName }}</span>
        </el-form-item>
        <el-form-item label="日期类型">
          <el-tag size="small" :type="editForm.dateIsHoliday ? 'warning' : (editForm.dateIsWeekend ? 'success' : 'info')">
            {{ editForm.dateType }}
          </el-tag>
          <span style="margin-left: 8px; color: #999;">模板值：{{ editForm.templateValue }}分钟</span>
        </el-form-item>
        <el-form-item label="阈值">
          <el-input-number v-model="editForm.threshold" :min="0" :step="30" controls-position="right" style="width: 150px;" />
          <span class="unit-text">分钟</span>
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="editForm.remark" type="textarea" :rows="2" placeholder="请输入修改原因" />
        </el-form-item>
        <el-alert v-if="editForm.modified" type="info" :closable="false" style="margin-top: 10px;">
          该日期已被手动修改，原值：{{ editForm.originalValue }}分钟
        </el-alert>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveThreshold">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, QuestionFilled } from '@element-plus/icons-vue'

// 当前 Tab
const activeTab = ref('city')

// 业务周数据
const availableWeeks = ref([
  { id: 1, name: '排班周 1月11日-1月17日', startDate: '2026-01-11', endDate: '2026-01-17' },
  { id: 2, name: '排班周 1月18日-1月24日', startDate: '2026-01-18', endDate: '2026-01-24' },
  { id: 3, name: '排班周 1月25日-1月31日', startDate: '2026-01-25', endDate: '2026-01-31' },
  { id: 4, name: '排班周 2月1日-2月7日', startDate: '2026-02-01', endDate: '2026-02-07' }
])

// 选中的业务周
const cityWeek = ref(1)
const storeWeek = ref(1)
const therapistWeek = ref(1)

// 筛选条件
const storeFilterCity = ref('')
const storeFilterStore = ref('')
const therapistFilterCity = ref('')
const therapistFilterStore = ref('')
const therapistKeyword = ref('')
const cityFilterCity = ref('')

// 门店数据（用于筛选）
const allStoresData = {
  '深圳市': ['深圳南山店', '深圳福田店', '深圳宝安店', '深圳龙华店'],
  '成都市': ['成都春熙路店', '成都天府店', '成都武侯店'],
  '北京市': ['北京国贸店', '北京三里屯店', '北京望京店'],
  '上海市': ['上海陆家嘴店', '上海南京路店']
}

// 业务周日期
const weekDates = computed(() => {
  const week = availableWeeks.value.find(w => w.id === 1) // 默认取第一个
  if (!week) return []

  const dates = []
  const startDate = new Date(week.startDate)
  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    const dayOfWeek = date.getDay()
    dates.push({
      date: formatDate(date),
      label: `${date.getMonth() + 1}月${date.getDate()}号`,
      dayName: dayNames[dayOfWeek],
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      isHoliday: !!isHolidayDate(date),
      holidayName: isHolidayDate(date),
      type: getDateType(dayOfWeek, isHolidayDate(date))
    })
  }
  return dates
})

const availableCities = computed(() => ['深圳市', '成都市', '北京市', '上海市'])

// 明细数据
const cityDetailData = ref([])
const storeDetailData = ref([])
const therapistDetailData = ref([])

// 城市筛选后的数据
const filteredCityDetailData = computed(() => {
  if (!cityFilterCity.value) return cityDetailData.value
  return cityDetailData.value.filter(d => d.cityName === cityFilterCity.value)
})

// 筛选后的数据
const availableStoresForStoreFilter = computed(() => {
  if (!storeFilterCity.value) return []
  return allStoresData[storeFilterCity.value] || []
})

const filteredStoreDetailData = computed(() => {
  let data = [...storeDetailData.value]
  if (storeFilterCity.value) {
    data = data.filter(d => d.cityName === storeFilterCity.value)
  }
  if (storeFilterStore.value) {
    data = data.filter(d => d.storeName === storeFilterStore.value)
  }
  return data
})

const availableStoresForFilter = computed(() => {
  if (!therapistFilterCity.value) return []
  return allStoresData[therapistFilterCity.value] || []
})

const filteredTherapistDetailData = computed(() => {
  let data = [...therapistDetailData.value]
  if (therapistFilterCity.value) {
    data = data.filter(d => d.cityName === therapistFilterCity.value)
  }
  if (therapistFilterStore.value) {
    data = data.filter(d => d.storeName === therapistFilterStore.value)
  }
  if (therapistKeyword.value) {
    data = data.filter(d => d.therapistName.includes(therapistKeyword.value))
  }
  return data
})

// 编辑弹窗
const editDialogVisible = ref(false)
const editForm = reactive({
  type: '',
  entityId: '',
  entityName: '',
  date: '',
  dateLabel: '',
  dateType: '',
  dateIsWeekend: false,
  dateIsHoliday: false,
  templateValue: 0,
  threshold: 0,
  originalValue: 0,
  remark: '',
  modified: false
})

// 方法
const loadCityDetail = () => {
  // 模拟数据
  cityDetailData.value = [
    {
      id: 1,
      cityName: '深圳市',
      remark: '',
      thresholds: generateThresholds(480, 420, 360, [0, 1])
    },
    {
      id: 2,
      cityName: '成都市',
      remark: '',
      thresholds: generateThresholds(450, 400, 350, [])
    },
    {
      id: 3,
      cityName: '北京市',
      remark: '',
      thresholds: generateThresholds(480, 420, 360, [2, 3])
    }
  ]
}

const loadStoreDetail = () => {
  // 模拟数据
  storeDetailData.value = [
    {
      id: 1,
      storeName: '深圳南山店',
      cityName: '深圳市',
      remark: '',
      thresholds: generateThresholds(420, 380, 320, [0])
    },
    {
      id: 2,
      storeName: '深圳福田店',
      cityName: '深圳市',
      remark: '',
      thresholds: generateThresholds(400, 360, 300, [])
    },
    {
      id: 3,
      storeName: '成都春熙路店',
      cityName: '成都市',
      remark: '',
      thresholds: generateThresholds(360, 320, 280, [1])
    },
    {
      id: 4,
      storeName: '北京国贸店',
      cityName: '北京市',
      remark: '',
      thresholds: generateThresholds(450, 400, 350, [])
    }
  ]
}

const loadTherapistDetail = () => {
  // 模拟数据 - 推拿师级明细，各自独立配置
  therapistDetailData.value = [
    {
      id: 1,
      therapistName: '张三',
      storeName: '深圳南山店',
      cityName: '深圳市',
      thresholds: generateThresholds(360, 300, 240, [0])
    },
    {
      id: 2,
      therapistName: '李四',
      storeName: '深圳福田店',
      cityName: '深圳市',
      thresholds: generateThresholds(400, 350, 280, [])
    },
    {
      id: 3,
      therapistName: '王五',
      storeName: '成都春熙路店',
      cityName: '成都市',
      thresholds: generateThresholds(320, 280, 200, [1, 2])
    },
    {
      id: 4,
      therapistName: '赵六',
      storeName: '成都天府店',
      cityName: '成都市',
      thresholds: generateThresholds(300, 260, 180, [])
    }
  ]
}

const generateThresholds = (weekday, weekend, holiday, modifiedDays) => {
  const thresholds = {}
  weekDates.value.forEach((date, index) => {
    let value = weekday
    if (date.isHoliday) value = holiday
    else if (date.isWeekend) value = weekend

    thresholds[date.date] = {
      value,
      modified: modifiedDays.includes(index),
      remark: modifiedDays.includes(index) ? '手动调整' : ''
    }
  })
  return thresholds
}

const editThreshold = (type, row, date) => {
  editForm.type = type
  editForm.entityId = row.id
  editForm.entityName = type === 'therapist' ? row.therapistName : (row.storeName || row.cityName)
  editForm.date = date.date
  editForm.dateLabel = date.label
  editForm.dateType = date.type
  editForm.dateIsWeekend = date.isWeekend
  editForm.dateIsHoliday = date.isHoliday

  const thresholdData = row.thresholds[date.date]
  editForm.threshold = thresholdData?.value || 0
  editForm.originalValue = thresholdData?.value || 0
  editForm.remark = thresholdData?.remark || ''
  editForm.modified = thresholdData?.modified || false

  // 计算模板值
  if (date.isHoliday) editForm.templateValue = type === 'therapist' ? 240 : 360
  else if (date.isWeekend) editForm.templateValue = type === 'therapist' ? 300 : 420
  else editForm.templateValue = type === 'therapist' ? 360 : 480

  editDialogVisible.value = true
}

const saveThreshold = () => {
  ElMessage.success('阈值已修改')
  editDialogVisible.value = false
}

const batchReset = (type) => {
  const typeName = type === 'city' ? '城市' : type === 'store' ? '门店' : '推拿师'
  ElMessageBox.confirm(`确定要将${typeName}级明细全部重置为模板值吗？此操作不可恢复。`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('已重置为模板值')
  }).catch(() => {})
}

const handleTherapistCityChange = () => {
  therapistFilterStore.value = ''
}

const handleStoreCityChange = () => {
  storeFilterStore.value = ''
}

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const isHolidayDate = (date) => {
  const dateStr = formatDate(date)
  // 模拟节假日：元旦、春节假期
  const holidays = {
    '2026-01-01': '元旦',
    '2026-01-26': '春节',
    '2026-01-27': '春节',
    '2026-01-28': '春节',
    '2026-01-29': '春节',
    '2026-01-30': '春节',
    '2026-01-31': '春节',
  }
  return holidays[dateStr] || null
}

const getDateType = (dayOfWeek, isHoliday) => {
  if (isHoliday) return isHoliday
  if (dayOfWeek === 0 || dayOfWeek === 6) return '周末'
  return '工作日'
}

// 初始化
loadCityDetail()
loadStoreDetail()
loadTherapistDetail()
</script>

<style scoped>
.therapist-offline-detail {
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

.tip {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.content-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.detail-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fafafa;
  border-bottom: 1px solid #eee;
}

.toolbar-left {
  display: flex;
  gap: 10px;
  align-items: center;
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

.date-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.date-header.is-holiday {
  background: linear-gradient(to bottom, #fff7e6, transparent);
}

.entity-name {
  font-size: 14px;
  color: #333;
}

.threshold-cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 4px;
}

.threshold-cell.modified {
  background: #fff7e6;
}

.threshold-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.modified-mark {
  position: absolute;
  top: 2px;
  right: 4px;
  color: #faad14;
  font-size: 12px;
}

.legend-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fafafa;
  border-top: 1px solid #eee;
  font-size: 13px;
}

.legend-item {
  color: #666;
}

.legend-item.modified {
  color: #faad14;
  font-weight: 500;
}

.legend-tag {
  margin-right: 4px;
}

.form-value {
  color: #333;
  font-weight: 500;
}

.unit-text {
  margin-left: 8px;
  color: #999;
}
</style>
