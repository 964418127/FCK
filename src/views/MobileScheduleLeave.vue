<template>
  <div class="mobile-schedule-leave">
    <div class="page-header">
      <el-icon @click="goBack" class="back-icon"><ArrowLeft /></el-icon>
      <h1>排班排假</h1>
    </div>
    
    <div class="content-container">
      <!-- 自主下线（与自主下线页面共用） -->
      <div class="self-offline-card">
        <div class="module-title">
          <span class="red-bar"></span>
          自主下线
        </div>
        <div class="duration-row">
          <span class="duration-label">今日服务时长(分钟)：</span>
          <span class="duration-value">{{ todayServiceDuration }}</span>
          <el-button
            type="primary"
            @click="handleSelfOffline"
            :disabled="todayServiceDuration < 480 || isSelfOffline"
            class="offline-btn"
          >
            {{ isSelfOffline ? '已下线' : '我要下线' }}
          </el-button>
        </div>

        <div v-if="isSelfOffline && selfOfflineTime" class="offline-time">
          下线时间：{{ selfOfflineTime }}
        </div>

        <div class="info-block">
          <span class="info-label">注：</span>
          <span class="info-text">当日项目服务时长&gt;=480分钟且已完成订单，可自主下线。自主下线后，所有门店都将下线，不可重新上线。</span>
        </div>
      </div>

      <div class="calendar-section">
        <div class="month-selector">
          <el-icon @click="prevMonth"><ArrowLeft /></el-icon>
          <span class="month-text">{{ currentYear }}年{{ currentMonth }}月</span>
          <el-icon @click="nextMonth"><ArrowRight /></el-icon>
        </div>
        
        <div class="calendar-grid">
          <div class="calendar-header">
            <div v-for="day in weekDays" :key="day" class="calendar-day-header">{{ day }}</div>
          </div>
          <div class="calendar-body">
            <div 
              v-for="(date, index) in calendarDates" 
              :key="index" 
              :class="['calendar-day', { 
                'today': isToday(date), 
                'has-shift': hasShift(date),
                'has-leave': hasLeave(date)
              }]"
            >
              <div class="day-number">{{ date.day }}</div>
              <div v-if="hasShift(date)" class="shift-info">
                {{ getShifts(date) }}
              </div>
              <div v-if="hasLeave(date)" class="leave-info">
                <span class="leave-tag">可休</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="tab-bar">
        <div 
          v-for="tab in tabs" 
          :key="tab.id" 
          :class="['tab-item', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          {{ tab.name }}
        </div>
      </div>
      
      <div v-show="activeTab === 1" class="schedule-section">
        <div class="section-header">
          <div class="section-title">排班</div>
          <el-button type="primary" size="small" @click="applyAll">一键申请</el-button>
        </div>
        
        <div class="recommendation-info">
          <div class="recommendation-card">
            <div class="recommendation-header">
              <div class="recommendation-title">📊 来自数据洞察的排班建议</div>
              <div class="recommendation-content">系统已根据您目前的服务门店区域和客户分布情况，自动完成了符合需求的时间周期、时段的排班策略</div>
            </div>
            
            <div class="data-section">
              <div class="data-overview">
                <div class="overview-item">
                  <div class="overview-label">推荐总订单量</div>
                  <div class="overview-value highlight">{{ recommendedTotalOrders }}单</div>
                </div>
                <div class="overview-item">
                  <div class="overview-label">推荐预估收入</div>
                  <div class="overview-value highlight">{{ recommendedIncome }}元</div>
                </div>
              </div>
              
              <div class="selection-info">
                <div class="selection-title">🎯 你的选择</div>
                <div class="selection-stats">
                  <div class="stat-item">
                    <div class="stat-label">已选班次</div>
                    <div class="stat-value">{{ selectedShiftCount }}天</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">预计订单量</div>
                    <div class="stat-value highlight">{{ actualSelectedOrders }}单</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">预计收入</div>
                    <div class="stat-value highlight">{{ actualSelectedIncome }}元</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="week-summary">
          <div class="summary-item">
            <span class="summary-label">已选班次:</span>
            <span class="summary-value">{{ selectedShiftCount }} 天</span>
          </div>
        </div>
        
        <div class="date-list">
          <div 
              v-for="date in selectedWeekDates" 
              :key="date.date" 
              class="date-item"
            >
              <div class="date-section">
                <div class="date-weekday">{{ date.weekday }}</div>
                <div class="date-day">{{ date.day }}日</div>
              </div>
              <div class="shift-section">
                <div class="shift-options">
                  <div 
                    v-for="shift in shiftTypes" 
                    :key="shift.id"
                    :class="['shift-option', { 
                      selected: date.selectedShift === shift.id,
                      disabled: (shift.totalQuota - shift.appliedQuota) <= 0 || date.status === 'pending' || date.status === 'success',
                      'success-shift': date.status === 'success' && date.selectedShift === shift.id
                    }]"
                    @click="selectShiftForDate(date, shift)"
                  >
                    <div class="shift-name">{{ shift.name }}</div>
                    <div class="shift-quota">
                      <span class="quota-applied">{{ shift.totalQuota - shift.appliedQuota }}</span>
                      <span class="quota-separator">/</span>
                      <span class="quota-total">{{ shift.totalQuota }}</span>
                    </div>
                    <div class="shift-info">
                      <div v-if="shift.suggestion" class="recommend-tag">推荐</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="status-section">
                <div v-if="date.status === 'pending'" class="status-tag pending">审核中</div>
                <div v-if="date.status === 'success'" class="status-tag success">排班成功</div>
                <div v-if="date.status === 'failed'" class="status-tag failed">排班失败</div>
              </div>
            </div>
        </div>
      </div>
      
      <div v-show="activeTab === 2" class="leave-section">
        <div class="section-header">
          <div class="section-title">排假</div>
        </div>
        
        <div class="recommendation-info">
          <div class="recommendation-card">
            <div class="recommendation-header">
              <div class="recommendation-title">📊 来自数据洞察的休假建议</div>
              <div class="recommendation-content">系统已根据您目前的服务门店区域和客户分布情况，自动完成了符合需求的休假时间和类型的建议策略</div>
            </div>
            
            <div class="data-section">
              <div class="leave-summary">
                <div class="summary-item">
                  <div class="summary-icon">📅</div>
                  <div class="summary-content">
                    <div class="summary-label">建议休假天数</div>
                    <div class="summary-value highlight">4天</div>
                  </div>
                </div>
              </div>
              
              <div class="recommended-leave-types">
                <div class="section-title">推荐休假类型</div>
                <div class="leave-type-grid">
                  <div class="leave-type-item">
                    <div class="leave-type-header">
                      <div class="leave-type-name">早半天休</div>
                    </div>
                    <div class="leave-type-details">
                      <div class="leave-type-count">1次</div>
                      <div class="leave-type-desc">适合订单量较低的上午时段</div>
                    </div>
                  </div>
                  
                  <div class="leave-type-item">
                    <div class="leave-type-header">
                      <div class="leave-type-name">晚半天休</div>
                    </div>
                    <div class="leave-type-details">
                      <div class="leave-type-count">2次</div>
                      <div class="leave-type-desc">适合订单量较低的下午时段</div>
                    </div>
                  </div>
                  
                  <div class="leave-type-item">
                    <div class="leave-type-header">
                      <div class="leave-type-name">全天休</div>
                    </div>
                    <div class="leave-type-details">
                      <div class="leave-type-count">1次</div>
                      <div class="leave-type-desc">建议选择订单量最低的日期</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 排假类型列表 -->
        <div class="leave-types-list">
          <div 
            v-for="type in selectedDateLeaveTypes" 
            :key="type.id"
            class="leave-type-item"
          >
            <div class="leave-type-content">
              <div class="leave-type-name">
                {{ type.name }}
              </div>
              
              <div class="leave-quota-info">
                <div class="quota-item">
                  <div class="quota-label">总名额</div>
                  <div class="quota-value">{{ type.totalQuota }}人</div>
                </div>
                <div class="quota-item">
                  <div class="quota-label">已排</div>
                  <div class="quota-value used">{{ type.usedQuota }}人</div>
                </div>
                <div class="quota-item">
                  <div class="quota-label">可排</div>
                  <div class="quota-value available">{{ type.availableQuota }}人</div>
                </div>
              </div>
              
              <div v-if="type.isRecommended" class="recommend-info">
                <span class="recommend-tag">推荐休假</span>
              </div>
              
              <div class="leave-actions">
                <div v-if="type.status === 'pending'" class="status-tag pending">审核中</div>
                <div v-else-if="type.status === 'success'" class="status-tag success">排假成功</div>
                <div v-else-if="type.availableQuota > 0" 
                  class="action-button" 
                  @click="applyLeave(type)"
                >
                  去休假
                </div>
              </div>
            </div>
            
            <div v-if="type.appliedEmployees && type.appliedEmployees.length > 0" class="applied-employees">
              <div class="employees-title">已排假员工:</div>
              <div class="employees-list">
                <span 
                  v-for="(employee, index) in type.appliedEmployees" 
                  :key="index"
                  class="employee-tag"
                >
                  {{ employee }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

const tabs = ref([
  { id: 1, name: '排班按周' },
  { id: 2, name: '排假按天' }
])

const activeTab = ref(1)

const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const calendarDates = ref([])

const availableWeeks = ref([
  { 
    id: 1, 
    name: '排班周', 
    dateRange: '1月11日-1月17日',
    startDate: '2026-01-11',
    dates: [
      { date: '2026-01-11', day: 11, weekday: '周六', selectedShift: null, selectedLeaveType: null },
      { date: '2026-01-12', day: 12, weekday: '周日', selectedShift: null, selectedLeaveType: null },
      { date: '2026-01-13', day: 13, weekday: '周一', selectedShift: null, selectedLeaveType: null },
      { date: '2026-01-14', day: 14, weekday: '周二', selectedShift: null, selectedLeaveType: null },
      { date: '2026-01-15', day: 15, weekday: '周三', selectedShift: null, selectedLeaveType: null },
      { date: '2026-01-16', day: 16, weekday: '周四', selectedShift: null, selectedLeaveType: null },
      { date: '2026-01-17', day: 17, weekday: '周五', selectedShift: null, selectedLeaveType: null }
    ]
  }
])

const selectedWeek = ref(1)

const shiftTypes = ref([
  { id: 1, name: '早班', totalQuota: 10, appliedQuota: 5, suggestion: true },
  { id: 2, name: '晚班', totalQuota: 8, appliedQuota: 5, suggestion: false },
  { id: 3, name: '通班', totalQuota: 5, appliedQuota: 3, suggestion: true }
])

const leaveTypes = ref([
  { id: 1, name: '全天', quota: 4 },
  { id: 2, name: '早半天', quota: 2 },
  { id: 3, name: '晚半天', quota: 3 }
])

const totalLeaveDays = ref(2)
const remainingLeaveDays = ref(2)

// ==================== 自主下线模块 ====================
const todayServiceDuration = ref(482)
const isSelfOffline = ref(false)
const selfOfflineTime = ref(null)

const handleSelfOffline = async () => {
  try {
    await ElMessageBox.confirm(
      '下线后所有门店将不可重新上线，确定要自主下线吗？',
      '确认自主下线',
      { confirmButtonText: '确定下线', cancelButtonText: '取消', type: 'warning' }
    )
    isSelfOffline.value = true
    selfOfflineTime.value = new Date().toLocaleString('zh-CN', { hour12: false })
    ElMessage.success('已成功下线')
  } catch (e) {
    // 用户取消
  }
}

// 排假相关变量
const selectedLeaveDate = ref(null)
const selectedDateLeaveTypes = ref([])

// 初始化排假数据
const initLeaveData = () => {
  // 模拟默认获取排假数据，实际应从API获取
  selectedDateLeaveTypes.value = [
    {
      id: 1,
      name: '全天休',
      totalQuota: 4,
      usedQuota: 2,
      availableQuota: 2,
      status: null,
      appliedEmployees: ['张三', '李四'],
      isRecommended: false,
      estimatedOrderReduction: 10,
      estimatedIncomeReduction: 680,
      count: 1
    },
    {
      id: 2,
      name: '早半天休',
      totalQuota: 2,
      usedQuota: 1,
      availableQuota: 1,
      status: null,
      appliedEmployees: ['王五'],
      isRecommended: true,
      estimatedOrderReduction: 5,
      estimatedIncomeReduction: 340,
      count: 1
    },
    {
      id: 3,
      name: '晚半天休',
      totalQuota: 3,
      usedQuota: 0,
      availableQuota: 3,
      status: null,
      appliedEmployees: [],
      isRecommended: true,
      estimatedOrderReduction: 4,
      estimatedIncomeReduction: 272,
      count: 2
    }
  ]
}

// 选择排假日期
const selectLeaveDateFunc = (date) => {
  selectedLeaveDate.value = date.date
  // 模拟获取该日期的排假名额信息
  initLeaveData()
}

// 获取选中日期的信息
const getSelectedDateInfo = () => {
  if (!selectedLeaveDate.value) return { day: '', weekday: '' }
  const date = selectedWeekDates.value.find(d => d.date === selectedLeaveDate.value)
  return date || { day: '', weekday: '' }
}

// 申请排假
const applyLeave = (type) => {
  // 创建自定义确认框
  const dialog = document.createElement('div')
  dialog.className = 'custom-confirm-dialog'
  dialog.innerHTML = `
    <div class="dialog-content">
      <h3>确认申请${type.name}</h3>
      <div class="dialog-body">
        <div class="impact-section">
          <h4>预估影响</h4>
          <div class="impact-item">
            <span class="impact-label">预估订单减少：</span>
            <span class="impact-value">${type.estimatedOrderReduction}单</span>
          </div>
          <div class="impact-item">
            <span class="impact-label">预估收入减少：</span>
            <span class="impact-value">${type.estimatedIncomeReduction}元</span>
          </div>
        </div>
        ${!type.isRecommended ? '<div class="warning-section">提示：不推荐今日休假，坚持休假可能会导致较大收益损失。</div>' : ''}
      </div>
      <div class="dialog-actions">
        <button class="cancel-btn">取消</button>
        <button class="confirm-btn">确认</button>
      </div>
    </div>
  `
  
  // 添加样式
  const style = document.createElement('style')
  style.textContent = `
    .custom-confirm-dialog {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .dialog-content {
      background: white;
      border-radius: 12px;
      padding: 24px;
      width: 90%;
      max-width: 400px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }
    .dialog-content h3 {
      margin-top: 0;
      color: #333;
      font-size: 18px;
      font-weight: bold;
    }
    .dialog-body {
      margin: 20px 0;
    }
    .impact-section h4 {
      margin: 0 0 12px 0;
      color: #666;
      font-size: 14px;
    }
    .impact-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    .impact-label {
      color: #666;
      font-size: 14px;
    }
    .impact-value {
      color: #a40035;
      font-weight: bold;
      font-size: 14px;
    }
    .warning-section {
      margin-top: 16px;
      padding: 12px;
      background: #fff3cd;
      border: 1px solid #ffeeba;
      border-radius: 6px;
      color: #856404;
      font-size: 14px;
    }
    .dialog-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
    }
    .cancel-btn {
      padding: 10px 20px;
      background: #f3f4f6;
      color: #333;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s;
    }
    .cancel-btn:hover {
      background: #e5e7eb;
    }
    .confirm-btn {
      padding: 10px 20px;
      background: #a40035;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s;
    }
    .confirm-btn:hover {
      background: #8b002d;
    }
  `
  document.head.appendChild(style)
  document.body.appendChild(dialog)
  
  // 绑定事件
  const cancelBtn = dialog.querySelector('.cancel-btn')
  const confirmBtn = dialog.querySelector('.confirm-btn')
  
  cancelBtn.addEventListener('click', () => {
    document.body.removeChild(dialog)
    document.head.removeChild(style)
  })
  
  confirmBtn.addEventListener('click', () => {
    document.body.removeChild(dialog)
    document.head.removeChild(style)
    
    // 模拟审核过程
    type.status = 'pending'
    
    // 模拟5秒后审核完成
    setTimeout(() => {
      type.status = 'success'
      type.usedQuota += 1
      type.availableQuota -= 1
      type.appliedEmployees.push('当前用户')
    }, 5000)
  })
}

const selectedWeekDates = computed(() => {
  if (!selectedWeek.value) return []
  const week = availableWeeks.value.find(w => w.id === selectedWeek.value)
  return week ? week.dates : []
})

// 组件加载时初始化排假数据
onMounted(() => {
  initLeaveData()
})

const selectedShiftCount = computed(() => {
  return selectedWeekDates.value.filter(d => d.selectedShift !== null).length
})

const estimatedOrderIncrease = computed(() => {
  const selectedShifts = selectedWeekDates.value.filter(d => d.selectedShift !== null)
  const recommendedShifts = selectedShifts.filter(d => {
    const shift = shiftTypes.value.find(s => s.id === d.selectedShift)
    return shift && shift.suggestion
  })
  return recommendedShifts.length * 12
})

// 总体推荐数据
const recommendedTotalOrders = computed(() => {
  return 128
})

const recommendedIncome = computed(() => {
  return 8560
})

// 实际选择数据
const actualSelectedOrders = computed(() => {
  const selectedShifts = selectedWeekDates.value.filter(d => d.selectedShift !== null)
  return selectedShifts.length * 10
})

const actualSelectedIncome = computed(() => {
  const selectedShifts = selectedWeekDates.value.filter(d => d.selectedShift !== null)
  return selectedShifts.length * 680
})

const canConfirm = computed(() => {
  if (activeTab.value === 1) {
    return selectedWeek.value !== null && selectedShiftCount.value > 0
  }
  if (activeTab.value === 2) {
    return selectedWeek.value !== null && selectedWeekDates.value.some(d => d.selectedLeaveType !== null)
  }
  return false
})

const generateCalendar = () => {
  const year = currentYear.value
  const month = currentMonth.value - 1
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  const dates = []
  for (let i = 0; i < firstDay; i++) {
    dates.push({ day: '', shifts: [] })
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    let shiftText = ''
    if (i === 1) {
      shiftText = '早班'
    } else if (i === 2) {
      shiftText = '早班 晚班'
    } else if (i === 3) {
      shiftText = '晚班'
    } else if (i === 4) {
      shiftText = '全天休'
    } else if (i === 5) {
      shiftText = '早班 晚休'
    } else if (i === 6) {
      shiftText = '早休 晚班'
    } else if (i === 7) {
      shiftText = '早班 晚班'
    } else if (i === 8) {
      shiftText = '全天休'
    }
    
    dates.push({ day: i, shiftText: shiftText })
  }
  
  calendarDates.value = dates
}

const isToday = (date) => {
  const today = new Date()
  return date.day === today.getDate() && 
         currentMonth.value === today.getMonth() + 1 && 
         currentYear.value === today.getFullYear()
}

const hasShift = (date) => {
  return date.shiftText && date.shiftText.length > 0
}

const hasLeave = (date) => {
  // 模拟逻辑：假设每个月的1号、8号、15号、22号是可休假日期
  return date.day === 1 || date.day === 8 || date.day === 15 || date.day === 22
}



const getShifts = (date) => {
  return date.shiftText || ''
}

const prevMonth = () => {
  if (currentMonth.value === 1) {
    currentYear.value--
    currentMonth.value = 12
  } else {
    currentMonth.value--
  }
  generateCalendar()
}

const nextMonth = () => {
  if (currentMonth.value === 12) {
    currentYear.value++
    currentMonth.value = 1
  } else {
    currentMonth.value++
  }
  generateCalendar()
}

const selectWeek = (week) => {
  selectedWeek.value = week.id
}

const selectShiftForDate = (date, shift) => {
  if ((shift.totalQuota - shift.appliedQuota) <= 0) return
  const week = availableWeeks.value.find(w => w.id === selectedWeek.value)
  const dateItem = week.dates.find(d => d.date === date.date)
  if (dateItem) {
    dateItem.selectedShift = shift.id
  }
}

const selectLeaveForDate = (date, type) => {
  if (type.quota <= 0) return
  const week = availableWeeks.value.find(w => w.id === selectedWeek.value)
  const dateItem = week.dates.find(d => d.date === date.date)
  if (dateItem) {
    dateItem.selectedLeaveType = type.id
  }
}

const applyAll = () => {
  const selectedDates = selectedWeekDates.value.filter(d => d.selectedShift !== null)
  if (selectedDates.length === 0) {
    alert('请选择至少一个班次')
    return
  }
  
  // 标记为审核中
  selectedDates.forEach(date => {
    date.status = 'pending'
  })
  
  // 模拟审核过程
  setTimeout(() => {
    selectedDates.forEach((date, index) => {
      // 模拟部分成功的情况（例如奇数索引成功，偶数索引失败）
      if (index % 2 === 0) {
        // 排班成功
        date.status = 'success'
      } else {
        // 排班失败，清除选择状态，允许重新选择
        date.status = 'failed'
        date.selectedShift = null
      }
    })
  }, 5000)
}

const confirmSelection = () => {
  console.log('确认选择', {
    tab: activeTab.value,
    week: selectedWeek.value,
    dates: selectedWeekDates.value
  })
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  generateCalendar()
  initLeaveData()
})
</script>

<style scoped>
.mobile-schedule-leave {
  min-height: 100vh;
  background: #f5f5f5;
  height: 100vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* ========== 自主下线模块（顶部） ========== */
.self-offline-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  margin-bottom: 12px;
  padding: 12px 16px;
}

.self-offline-card .module-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.self-offline-card .red-bar {
  display: inline-block;
  width: 3px;
  height: 14px;
  background: #a40035;
  border-radius: 2px;
}

.duration-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.duration-label {
  font-size: 14px;
  color: #333;
  flex-shrink: 0;
}

.duration-value {
  font-size: 20px;
  font-weight: 700;
  color: #a40035;
  flex: 1;
}

.offline-btn {
  background: #a40035;
  border-color: #a40035;
}

.offline-btn.is-disabled {
  background: #ccc;
  border-color: #ccc;
}

.offline-time {
  font-size: 13px;
  color: #999;
  margin-bottom: 12px;
}

.info-block {
  font-size: 12px;
  color: #666;
  line-height: 1.7;
}

.info-label {
  font-weight: 600;
  color: #333;
  margin-right: 4px;
}

.info-text {
  color: #666;
}

.page-header {
  display: flex;
  align-items: center;
  padding: 15px;
  background: white;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.back-icon {
  font-size: 24px;
  color: #333;
  cursor: pointer;
}

.page-header h1 {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

.content-container {
  padding: 15px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

.calendar-section {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #a40035;
  margin-bottom: 0;
}

.month-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.month-text {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.calendar-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 10px;
}

.calendar-day-header {
  text-align: center;
  font-size: 12px;
  color: #999;
  padding: 8px 0;
}

.calendar-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.calendar-day {
  min-height: 60px;
  padding: 8px;
  border: 1px solid #eee;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.3s;
}

.calendar-day.today {
  background: #ffebee;
  border-color: #a40035;
}

.calendar-day.has-shift {
  background: #ffebee;
}

.calendar-day.has-leave {
  background: #f0f9ff;
  border-color: #3b82f6;
}

.leave-info {
  font-size: 9px;
  font-weight: bold;
  margin-top: 2px;
  text-align: center;
}

.leave-tag {
  color: #3b82f6;
  background: #eff6ff;
  padding: 1px 6px;
  border-radius: 6px;
  display: inline-block;
  white-space: nowrap;
}

.day-number {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 2px;
  text-align: center;
}

.shift-info {
  font-size: 9px;
  color: #a40035;
  font-weight: bold;
  text-align: center;
  white-space: nowrap;
}

.calendar-day {
  min-height: 60px;
  padding: 6px;
  border: 1px solid #eee;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
}

.recommendation-info {
  margin: 16px 0;
}

.leave-summary {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
  margin-bottom: 12px;
  border: 1px solid #e5e7eb;
}

.leave-summary .summary-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.leave-summary .summary-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.leave-summary .summary-content {
  flex: 1;
}

.leave-summary .summary-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 2px;
}

.leave-summary .summary-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.recommended-leave-types {
  margin-top: 16px;
}

.recommended-leave-types .section-title {
  font-size: 13px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.leave-type-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.leave-type-item {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  transition: all 0.3s;
}

.leave-type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.leave-type-header .leave-type-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.leave-type-badge {
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: bold;
}

.leave-type-details {
  display: flex;
  align-items: center;
  gap: 12px;
}

.leave-type-count {
  font-size: 12px;
  font-weight: 500;
  color: #a40035;
}

.leave-type-desc {
  font-size: 12px;
  color: #666;
  flex: 1;
}

.leave-type-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.leave-type-item.recommended {
  border-color: #a40035;
  background: #fff5f5;
}

.leave-type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.leave-type-header .leave-type-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.leave-type-item.recommended .leave-type-header .leave-type-name {
  color: #a40035;
}

.leave-type-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.leave-type-badge.recommended {
  background: #a40035;
  color: white;
}

.leave-type-details {
  display: flex;
  align-items: center;
  gap: 20px;
}

.leave-type-count {
  font-size: 14px;
  font-weight: 500;
  color: #a40035;
}

.leave-type-desc {
  font-size: 13px;
  color: #666;
  flex: 1;
}

.recommendation-card {
  background: linear-gradient(135deg, #fef2f2 0%, #f9fafb 100%);
  border-radius: 12px;
  border: 1px solid #fee2e2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.recommendation-header {
  padding: 16px;
  border-bottom: 1px solid #fee2e2;
}

.recommendation-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.recommendation-content {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.data-section {
  padding: 12px 16px;
}

.data-overview {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px dashed #e5e7eb;
  justify-content: space-between;
}

.overview-item {
  flex: 1;
  text-align: center;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.overview-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
}

.overview-value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  padding: 4px 12px;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  display: inline-block;
}

.selection-info {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 16px;
}

.selection-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.selection-stats {
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
  justify-content: space-between;
}

.stat-item {
  flex: 1;
  min-width: 90px;
  text-align: center;
  white-space: nowrap;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  padding: 4px 8px;
  background: #f9fafb;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  display: inline-block;
}

.highlight {
  color: #a40035 !important;
  background: #fff1f2 !important;
  border-color: #fecaca !important;
}

.increase-label {
  font-size: 12px;
  color: #666;
}

.increase-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  padding: 2px 8px;
  background: #f0f0f0;
  border-radius: 4px;
  border: 1px solid #ddd;
}

/* 排假类型列表样式 */
.leave-types-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.leave-type-item {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: relative;
}

.leave-type-content {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
  min-width: 0;
}

.leave-type-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  min-width: 80px;
  flex-shrink: 0;
}

.recommend-info {
  position: absolute;
  top: 8px;
  right: 16px;
  z-index: 1;
}

.recommend-tag {
  background: #ffebee;
  color: #a40035;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
  white-space: nowrap;
  border: 1px solid #a40035;
}

.leave-quota-info {
  display: flex;
  gap: 6px;
  align-items: center;
  flex: 1;
  overflow: visible;
  min-width: 0;
}

.quota-item {
  text-align: center;
  min-width: 40px;
  flex-shrink: 1;
  flex-grow: 1;
}

.quota-label {
  font-size: 11px;
  color: #666;
  margin-bottom: 2px;
}

.quota-value {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.quota-value.used {
  color: #a40035;
}

.quota-value.available {
  color: #6b21a8;
}

.leave-actions {
  flex-shrink: 0;
  min-width: 70px;
  flex-basis: 70px;
  flex-grow: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-button {
  padding: 6px 14px;
  background: #a40035;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
  white-space: nowrap;
  flex-shrink: 0;
  text-align: center;
}

.action-button:hover {
  background: #8b002d;
}

.action-button:active {
  transform: scale(0.98);
}

/* 已排假员工样式 */
.applied-employees {
  padding: 16px 20px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.employees-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  font-weight: 500;
}

.employees-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.employee-tag {
  padding: 6px 12px;
  background: #e5e7eb;
  color: #333;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s;
}

.employee-tag:hover {
  background: #d1d5db;
  transform: translateY(-1px);
}

.status-tag {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
  display: inline-block;
  margin-top: 4px;
}

.status-tag.pending {
  background: #ffebee;
  color: #a40035;
}

.status-tag.success {
  background: #ffebee;
  color: #a40035;
}

.status-tag.default {
  background: #fff3e0;
  color: #f57c00;
}

.status-tag.failed {
  background: #ffebee;
  color: #a40035;
}



.tab-bar {
  display: flex;
  background: white;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 12px;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}

.tab-item.active {
  color: #a40035;
  border-bottom-color: #a40035;
  font-weight: bold;
}

.schedule-section, .leave-section {
  background: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
}

.week-selector {
  margin-bottom: 20px;
}

.week-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.week-item {
  padding: 15px;
  border: 2px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.week-item.selected {
  border-color: #409EFF;
  background: #ecf5ff;
}

.week-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.week-date {
  font-size: 12px;
  color: #999;
}

.week-detail {
  margin-top: 20px;
}

.date-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.date-item {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  gap: 15px;
  align-items: flex-start;
  justify-content: space-between;
}

.date-section {
  width: 65px;
  text-align: center;
  flex-shrink: 0;
  margin-left: -8px;
}

.date-weekday {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 2px;
}

.date-day {
  font-size: 16px;
  font-weight: bold;
  color: #a40035;
  margin-bottom: 4px;
}

.shift-section {
  flex: 1;
}

.status-section {
  flex-shrink: 0;
  align-self: center;
  margin-left: 10px;
  min-width: 80px;
  max-width: 100px;
  text-align: center;
}

.shift-options, .leave-options {
  display: flex;
  gap: 6px;
  flex-wrap: nowrap;
  align-items: stretch;
}

.shift-option, .leave-option {
  padding: 8px;
  border: 1px solid #eee;
  border-radius: 6px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  min-height: 70px;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
}

.shift-name, .leave-name {
  font-size: 12px;
  font-weight: bold;
  color: #333;
  margin-bottom: 2px;
}

.shift-quota, .leave-quota {
  font-size: 10px;
  color: #333;
  margin-bottom: 2px;
}

.recommend-tag {
  background: #ffebee;
  color: #a40035;
  padding: 1px 6px;
  border: 1px solid #a40035;
  border-radius: 12px;
  font-weight: bold;
  font-size: 10px;
  display: inline-block;
}



.shift-option.selected, .leave-option.selected {
  border-color: #a40035;
  background: #ffebee;
}

.shift-option.disabled, .leave-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.shift-option.success-shift {
  border-color: #a40035;
  background: #ffebee;
  box-shadow: 0 0 0 2px rgba(164, 0, 53, 0.1);
}

.shift-option.success-shift .shift-name {
  color: #a40035;
  font-weight: bold;
}

.shift-name, .leave-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.shift-quota, .leave-quota {
  font-size: 12px;
  color: #333;
}

.quota-text {
  font-weight: bold;
  color: #333;
}

.quota-applied {
  color: #a40035;
  font-weight: bold;
}

.quota-total {
  color: #999;
}

.quota-separator {
  color: #999;
  margin: 0 2px;
}

.shift-info {
  margin-top: 4px;
  text-align: center;
}

.recommend-tag {
  background: #ffebee;
  color: #a40035;
  padding: 2px 8px;
  border: 1px solid #a40035;
  border-radius: 12px;
  font-weight: bold;
  font-size: 12px;
  display: inline-block;
}

.week-summary, .leave-summary {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.summary-label {
  font-size: 14px;
  color: #666;
}

.summary-value {
  font-size: 14px;
  font-weight: bold;
  color: #a40035;
}


</style>
