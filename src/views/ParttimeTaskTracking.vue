<template>
  <div class="task-tracking">
    <header class="tracking-header">
      <div><h1>任务跟踪</h1><p>非全客户经理</p></div>
      <el-button @click="router.push('/parttime-task-management')"><el-icon><Calendar /></el-icon>排班排假</el-button>
    </header>
    <div class="tracking-filters">
      <el-date-picker v-model="dateRange" class="tracking-date-range" type="daterange" value-format="YYYY-MM-DD" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" aria-label="任务日期范围" />
      <el-select v-model="storeId" clearable placeholder="全部门店" aria-label="门店"><el-option v-for="store in stores" :key="store.id" :label="store.name" :value="store.id" /></el-select>
      <el-select v-model="employeeId" class="employee-filter" filterable clearable placeholder="输入工号或姓名" aria-label="客户经理" no-match-text="暂无匹配人员"><el-option v-for="employee in employees" :key="employee.id" :label="`${employee.employeeNo} ${employee.name}`" :value="employee.id"><span class="employee-option-number">{{ employee.employeeNo }}</span><span>{{ employee.name }}</span></el-option></el-select>
      <el-select v-model="taskStatus" clearable placeholder="全部任务状态" aria-label="任务状态"><el-option v-for="status in statuses" :key="status" :label="status" :value="status" /></el-select>
      <el-checkbox v-model="abnormalOnly">仅看异常打卡</el-checkbox>
      <el-button :icon="RefreshLeft" @click="resetFilters">重置</el-button>
    </div>
    <div class="tracking-summary">
      <div><span>任务总数</span><strong>{{ filteredTasks.length }}</strong></div>
      <div><span>待到店</span><strong>{{ filteredTasks.filter(task => task.status === '待到店').length }}</strong></div>
      <div><span>在店中</span><strong class="success">{{ filteredTasks.filter(task => task.status === '已到店').length }}</strong></div>
      <div><span>已离店</span><strong>{{ filteredTasks.filter(task => task.status === '已离店').length }}</strong></div>
      <div><span>异常打卡</span><strong class="warning">{{ filteredTasks.filter(task => task.attendance.abnormal).length }}</strong></div>
    </div>
    <el-table :data="pageTasks" row-key="id" empty-text="暂无符合条件的任务" class="tracking-table">
      <el-table-column prop="employeeName" label="客户经理" width="110" fixed="left"><template #default="{ row }">{{ row.employeeName }}<small class="planned-duration">{{ row.employeeNo }}</small></template></el-table-column>
      <el-table-column prop="storeName" label="门店" min-width="105" />
      <el-table-column prop="date" label="任务日期" width="110" />
      <el-table-column label="计划时段" width="125"><template #default="{ row }">{{ row.startTime }} - {{ row.endTime }}<small class="planned-duration">{{ durationLabel(row) }}</small></template></el-table-column>
      <el-table-column label="任务状态" width="90"><template #default="{ row }"><span :class="['task-status', statusClass(row.status)]">{{ row.status }}</span></template></el-table-column>
      <el-table-column label="实际到店打卡时间" min-width="175"><template #default="{ row }"><span class="actual-time">{{ row.arriveTime || '未记录' }}</span><small v-if="row.arriveTime" :class="['attendance-result', { 'attendance-warning': row.attendance.arrivalStatus === '迟到到店' }]">{{ row.attendance.arrivalStatus }}</small></template></el-table-column>
      <el-table-column label="实际离店打卡时间" min-width="175"><template #default="{ row }"><span class="actual-time">{{ row.leaveTime || '未记录' }}</span><small v-if="row.leaveTime" :class="['attendance-result', { 'attendance-warning': row.attendance.leaveStatus === '提前离店' }]">{{ row.attendance.leaveStatus }}</small></template></el-table-column>
      <el-table-column label="实际在店时长" width="115"><template #default="{ row }">{{ row.attendance.actualMinutes === null ? '-' : `${row.attendance.actualMinutes}分钟` }}</template></el-table-column>
      <el-table-column label="任务来源" min-width="145"><template #default="{ row }"><span class="source-label">{{ row.sourceLabel }}</span></template></el-table-column>
      <el-table-column label="备注" min-width="140" show-overflow-tooltip><template #default="{ row }">{{ row.cancelReason ? `取消原因：${row.cancelReason}` : row.forwardTo ? `转发至：${row.forwardTo}` : row.remark || '-' }}</template></el-table-column>
      <el-table-column label="操作" width="105" fixed="right"><template #default="{ row }"><el-button link type="primary" @click="openLog(row)">明细日志</el-button></template></el-table-column>
    </el-table>
    <div class="tracking-pagination"><el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50]" :total="filteredTasks.length" layout="total, sizes, prev, pager, next" /></div>

    <el-dialog v-model="logOpen" title="任务明细日志" width="min(620px, 92vw)">
      <div v-if="selectedTask" class="log-summary">
        <div><strong>{{ selectedTask.storeName }}</strong><span>{{ selectedTask.date }} · {{ selectedTask.startTime }} - {{ selectedTask.endTime }}</span></div>
        <span :class="['task-status', statusClass(selectedTask.status)]">当前：{{ selectedTask.status }}</span>
      </div>
      <el-empty v-if="!logEntries.length" description="暂无明细日志" :image-size="55" />
      <div v-else class="task-timeline">
        <div v-for="(entry, index) in logEntries" :key="`${entry.title}-${index}`" class="timeline-item">
          <span class="timeline-dot" :class="entry.kind"></span>
          <div class="timeline-content"><strong>{{ entry.title }}</strong><p>{{ entry.detail }}</p><small>{{ entry.time }}</small></div>
        </div>
      </div>
      <template #footer><el-button @click="logOpen = false">关闭</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Calendar, RefreshLeft } from '@element-plus/icons-vue'
import { parttimeStore, stores, employees, durationLabel, summarizeAttendance } from '../stores/parttimeTasks'

const router = useRouter()
const dateRange = ref(null)
const storeId = ref('')
const employeeId = ref(null)
const taskStatus = ref('')
const abnormalOnly = ref(false)
const logOpen = ref(false)
const selectedTask = ref(null)
const currentPage = ref(1)
const pageSize = ref(20)
const statuses = ['待到店', '已到店', '已离店', '已取消', '已转发', '等待接单']
const inferSource = task => task.sourceTaskId ? '已生成任务被转移' : task.taskId ? '取消后重派' : task.slotId ? '排班生成' : '任务生成'
const sourceLabelFor = task => task.sourceLabel || ({ '非全无法履约': '取消后重派', '全职请假': '请假接班生成', '手动发布': '临时手动发布' }[task.source] || inferSource(task))
const employeeName = id => employees.find(employee => employee.id === id)?.name || '未记录人员'
const filteredTasks = computed(() => parttimeStore.assignments.filter(task =>
  (!dateRange.value || (task.date >= dateRange.value[0] && task.date <= dateRange.value[1])) &&
  (!storeId.value || task.storeId === storeId.value) &&
  (!employeeId.value || task.assigneeId === employeeId.value) &&
  (!taskStatus.value || task.status === taskStatus.value)
).map(task => {
  const employee = employees.find(employee => employee.id === task.assigneeId)
  return { ...task, employeeName: employee?.name || '-', employeeNo: employee?.employeeNo || '-', sourceLabel: sourceLabelFor(task), attendance: summarizeAttendance(task) }
}).filter(task => !abnormalOnly.value || task.attendance.abnormal).sort((a, b) => b.date.localeCompare(a.date) || a.startTime.localeCompare(b.startTime)))
const pageTasks = computed(() => filteredTasks.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value))
watch([dateRange, storeId, employeeId, taskStatus, abnormalOnly, pageSize], () => { currentPage.value = 1 })
watch(() => filteredTasks.value.length, total => { currentPage.value = Math.min(currentPage.value, Math.max(1, Math.ceil(total / pageSize.value))) })
const statusClass = status => ({ 待到店: 'pending', 已到店: 'active', 已离店: 'done' }[status] || 'inactive')
const taskRootId = task => task.sourceTaskId || task.taskId || task.id
const logEntries = computed(() => {
  const task = selectedTask.value
  if (!task) return []
  const rootId = taskRootId(task)
  const related = parttimeStore.assignments.filter(item => item.id === rootId || item.sourceTaskId === rootId || item.taskId === rootId)
  const original = related.find(item => item.id === rootId) || task
  const entries = [{ title: sourceLabelFor(original), detail: `初始承接人：${employeeName(original.assigneeId)}`, time: original.date, kind: 'created' }]
  for (const item of related) {
    if (item.status === '已取消') entries.push({ title: '任务被取消', detail: `${employeeName(item.assigneeId)}取消任务${item.cancelReason ? `，原因：${item.cancelReason}` : ''}`, time: item.cancelledAt || item.date, kind: 'cancelled' })
    if (item.status === '已转发') entries.push({ title: '任务被转移', detail: `${employeeName(item.assigneeId)}转发至${item.forwardTo || '其他客户经理'}`, time: item.date, kind: 'transfer' })
    if (item.status === '等待接单') entries.push({ title: '进入任务池', detail: item.forwardTo || '等待其他客户经理接单', time: item.date, kind: 'transfer' })
    if (item !== original && item.status !== '已取消') entries.push({ title: item.sourceTaskId ? '转移后接替' : item.taskId ? '重派接替' : '重新派发', detail: `当前承接人：${employeeName(item.assigneeId)}，来源：${sourceLabelFor(item)}`, time: item.assignedAt || item.date, kind: 'assigned' })
    if (item.arriveTime) entries.push({ title: '到店打卡', detail: `实际到店：${item.arriveTime}`, time: item.arriveTime, kind: 'attendance' })
    if (item.leaveTime) entries.push({ title: '离店打卡', detail: `实际离店：${item.leaveTime}`, time: item.leaveTime, kind: 'attendance' })
  }
  return entries
})
const openLog = row => { selectedTask.value = row; logOpen.value = true }
const resetFilters = () => { dateRange.value = null; storeId.value = ''; employeeId.value = null; taskStatus.value = ''; abnormalOnly.value = false }
</script>

<style scoped>
.task-tracking { padding: 24px; background: #fff; min-height: 100%; color: #303133; }
.tracking-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 24px; }
.tracking-header h1 { font-size: 22px; margin: 0 0 8px; } .tracking-header p { font-size: 13px; color: #777; margin: 0; }
.tracking-header .el-icon { margin-right: 6px; }
.tracking-filters { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding-bottom: 20px; border-bottom: 1px solid #eee; }
.tracking-filters .el-select { flex: 0 0 170px; width: 170px; }
.tracking-filters .employee-filter { flex-basis: 210px; width: 210px; }
.tracking-filters :deep(.tracking-date-range.el-date-editor) { flex: 0 0 300px; width: 300px; min-width: 0; max-width: 100%; box-sizing: border-box; }
.employee-option-number { display: inline-block; width: 76px; color: #888; font-variant-numeric: tabular-nums; }
.tracking-summary { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 16px; padding: 24px 0; }
.tracking-summary div { padding-left: 16px; border-left: 2px solid #eee; } .tracking-summary span { display: block; font-size: 13px; color: #777; }
.tracking-summary strong { display: block; font-size: 24px; margin-top: 8px; } .tracking-summary .success { color: #247354; } .tracking-summary .warning { color: #b45309; }
.task-status { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 12px; line-height: 18px; white-space: nowrap; }
.task-status.pending { color: #8a650a; background: #fff5d9; } .task-status.active { color: #1764a0; background: #eaf3fb; }
.task-status.done { color: #247354; background: #eaf5ef; } .task-status.inactive { color: #777; background: #f1f1f1; }
.actual-time { font-variant-numeric: tabular-nums; white-space: nowrap; } .planned-duration { display: block; font-size: 12px; color: #888; margin-top: 3px; }
.attendance-result { display: block; margin-top: 3px; font-size: 12px; color: #247354; }
.source-label { color: #606266; font-size: 13px; }
.log-summary { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 14px; margin-bottom: 18px; background: #f7f8fa; border-radius: 6px; }
.log-summary strong, .log-summary span { display: block; } .log-summary span { margin-top: 5px; color: #888; font-size: 12px; }
.task-timeline { padding: 2px 4px; } .timeline-item { position: relative; display: flex; gap: 12px; min-height: 68px; }
.timeline-item:not(:last-child)::before { content: ''; position: absolute; left: 5px; top: 14px; bottom: 0; width: 1px; background: #e5e7eb; }
.timeline-dot { position: relative; z-index: 1; flex: 0 0 11px; width: 11px; height: 11px; margin-top: 4px; border-radius: 50%; background: #a40035; box-shadow: 0 0 0 3px #f9e9ef; }
.timeline-dot.cancelled { background: #b42318; box-shadow: 0 0 0 3px #fcebea; } .timeline-dot.transfer { background: #b7791f; box-shadow: 0 0 0 3px #fff5d9; } .timeline-dot.attendance { background: #247354; box-shadow: 0 0 0 3px #eaf5ef; }
.timeline-content { min-width: 0; padding-bottom: 14px; } .timeline-content strong { font-size: 14px; } .timeline-content p { margin: 4px 0; color: #606266; font-size: 13px; line-height: 1.5; } .timeline-content small { color: #999; font-size: 12px; }
.attendance-warning { color: #b45309; font-weight: 600; } .tracking-pagination { display: flex; justify-content: flex-end; margin-top: 20px; overflow-x: auto; }
@media (max-width: 600px) { .task-tracking { padding: 16px; } .tracking-header { flex-wrap: wrap; } .tracking-summary { gap: 6px; } .tracking-summary div { padding-left: 6px; } .tracking-summary span { font-size: 12px; } .tracking-filters .el-select { flex-basis: 100%; width: 100%; } .tracking-filters :deep(.tracking-date-range.el-date-editor) { flex-basis: 100%; width: 100%; } }
</style>
