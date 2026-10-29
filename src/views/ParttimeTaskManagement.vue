<template>
  <div class="task-management">
    <header class="management-header">
      <div><h1>{{ isPublicationRoute ? '任务发布' : '排班排假' }}</h1><p>{{ isPublicationRoute ? '非全客户经理 · 定时发布任务' : '非全客户经理 · 时段需求配置' }}</p></div>
      <el-button @click="router.push('/mobile-parttime-tasks')"><el-icon><Cellphone /></el-icon>查看移动端</el-button>
    </header>
    <div v-if="!isPublicationRoute" class="scope-toolbar">
      <el-input v-model="storeSearch" placeholder="搜索门店名称或编码" :prefix-icon="Search" clearable aria-label="搜索门店" />
      <el-select model-value="parttime-account-manager" class="role-selector" aria-label="岗位范围" disabled>
        <el-option label="客户经理（非全日制）" value="parttime-account-manager" />
      </el-select>
      <el-button class="toolbar-action" :icon="Upload" @click="importInput?.click()">导入排班配置</el-button>
      <el-button class="toolbar-action" :icon="Download" @click="exportSchedule">导出排班配置</el-button>
      <input ref="importInput" type="file" accept="application/json,.json" hidden @change="importSchedule" />
    </div>
    <div :class="['configuration-layout', { 'publication-layout': isPublicationRoute }]">
      <aside v-if="!isPublicationRoute" class="store-list" aria-label="门店列表">
        <div class="store-list-header"><span>门店编码</span><span>门店名称</span></div>
        <div class="store-list-body">
          <button v-for="store in filteredStores" :key="store.id" :class="['store-option', { selected: selectedStoreId === store.id }]" :aria-pressed="selectedStoreId === store.id" @click="selectedStoreId = store.id">
            <span>{{ store.code }}</span><strong>{{ store.name }}</strong>
          </button>
          <el-empty v-if="!filteredStores.length" description="暂无匹配门店" :image-size="55" />
        </div>
      </aside>
      <main class="configuration-content">
        <el-tabs v-model="activeTab">
          <el-tab-pane v-if="!isPublicationRoute" label="门店时段需求" name="requirements">
            <div class="section-heading">
              <div><h2>{{ selectedStore.name }} <span class="store-code">{{ selectedStore.code }}</span></h2><p>营业时间 {{ selectedStore.open }} - {{ selectedStore.close }}</p></div>
              <el-button type="primary" :icon="Plus" @click="editRequirement()">新增时段需求</el-button>
            </div>
            <div class="weekday-tabs" aria-label="选择星期">
              <button v-for="day in weekdayOptions" :key="day.value" :class="{ active: selectedDay === day.value }" @click="selectedDay = day.value">{{ day.label }}</button>
            </div>
            <div class="day-heading"><h3>{{ selectedDayLabel }} · 时段需求</h3><span>{{ activeDayRows.length }} 个时段 · {{ activeDayRows.reduce((sum, row) => sum + row.quota, 0) }} 个名额</span></div>
            <el-table :data="dayRows" empty-text="当天暂无时段需求" class="demand-table">
              <el-table-column label="任务时段" min-width="160"><template #default="{ row }">{{ row.startTime }} - {{ row.endTime }}</template></el-table-column>
              <el-table-column label="时长" width="95"><template #default="{ row }">{{ durationLabel(row) }}</template></el-table-column>
              <el-table-column prop="quota" label="名额" width="80" />
              <el-table-column label="生效期间" min-width="215"><template #default="{ row }">{{ row.requirement.startDate }} 至 {{ row.requirement.endDate || '不限结束日期' }}</template></el-table-column>
              <el-table-column label="备注" min-width="170" show-overflow-tooltip><template #default="{ row }">{{ row.requirement.remark || '-' }}</template></el-table-column>
              <el-table-column label="状态" width="90"><template #default="{ row }"><span :class="['demand-label', row.voidedAt || !row.requirement.enabled ? 'inactive' : 'long']">{{ row.voidedAt ? '已作废' : row.requirement.enabled ? '启用' : '停用' }}</span></template></el-table-column>
              <el-table-column label="操作" width="125" fixed="right"><template #default="{ row }"><template v-if="!row.voidedAt"><el-button link type="primary" @click="editRequirement(row.requirement)">编辑</el-button><el-button link type="danger" @click="removeSlot(row)">作废</el-button></template></template></el-table-column>
            </el-table>
            <h3 class="weekly-heading">一周需求概览</h3>
            <div class="week-overview">
              <div v-for="day in weekdayOptions" :key="day.value" class="week-column">
                <strong>{{ day.label }}</strong>
                <div v-for="row in rowsForDay(day.value).filter(row => !row.voidedAt)" :key="row.key" class="week-slot" :class="{ disabled: !row.requirement.enabled }">
                  <span>{{ row.startTime }} - {{ row.endTime }}</span><small>{{ row.quota }} 个名额{{ row.requirement.enabled ? '' : ' · 停用' }}</small>
                </div>
                <span v-if="!rowsForDay(day.value).some(row => !row.voidedAt)" class="muted">无需求</span>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane v-if="isPublicationRoute" label="任务发布" name="publication">
        <div class="publication-policy"><el-icon><Clock /></el-icon><div><strong>每周四 10:00 发布可选任务</strong><p>下周六至下下周五 · 名额有限，先到先得</p></div></div>
        <div class="publication-toolbar">
          <el-date-picker v-model="releaseDate" type="date" value-format="YYYY-MM-DD" :disabled-date="disableNonThursday" placeholder="发布日（周四）" />
          <span v-if="releaseDate">任务周期：{{ releaseWindow.start }} 至 {{ releaseWindow.end }}</span>
          <el-button type="primary" :disabled="!releaseDate || isPublished || !previewSlots.length" :icon="Promotion" @click="publishSelected">{{ isPublished ? '本期已发布' : '发布所选周期' }}</el-button>
        </div>
        <div class="publication-summary"><span>时段 <strong>{{ previewSlots.length }}</strong></span><span>总名额 <strong>{{ previewSlots.reduce((sum, slot) => sum + slot.quota, 0) }}</strong></span></div>
        <el-table :data="previewSlots" empty-text="该周期暂无有效需求">
          <el-table-column prop="date" label="日期" width="130" />
          <el-table-column prop="storeName" label="门店" min-width="130" />
          <el-table-column prop="remark" label="备注" min-width="170" show-overflow-tooltip />
          <el-table-column label="任务时段" min-width="150"><template #default="{ row }">{{ row.startTime }} - {{ row.endTime }}</template></el-table-column>
          <el-table-column prop="quota" label="名额" width="100" />
          <el-table-column label="剩余名额" width="100"><template #default="{ row }">{{ isPublished ? slotRemaining(row) : row.quota }}</template></el-table-column>
        </el-table>
        <h3 class="weekly-heading">发布记录</h3>
        <el-table :data="pagedRows2">
          <el-table-column prop="releaseDate" label="发布周期日" width="135" />
          <el-table-column label="任务周期" min-width="230"><template #default="{ row }">{{ row.start }} 至 {{ row.end }}</template></el-table-column>
          <el-table-column prop="slotCount" label="时段数" width="100" /><el-table-column prop="quota" label="总名额" width="100" /><el-table-column prop="mode" label="发布方式" min-width="120" />
        </el-table>
        <TablePagination v-model:page="page2" v-model:page-size="pageSize2" :total="total2" />
          </el-tab-pane>
          <el-tab-pane v-if="!isPublicationRoute" label="临时补人" name="temporary">
        <div class="section-heading"><h2>临时任务发布</h2><el-button type="primary" :icon="Plus" @click="openTemporaryDialog">发布临时任务</el-button></div>
        <div class="temporary-filters"><el-radio-group v-model="needFilter"><el-radio-button value="全部">全部</el-radio-button><el-radio-button value="待派发">待派发</el-radio-button><el-radio-button value="部分派发">部分派发</el-radio-button><el-radio-button value="已派发">已派发</el-radio-button></el-radio-group></div>
        <el-table :data="pagedRows" empty-text="暂无临时任务">
          <el-table-column prop="storeName" label="门店" min-width="120" /><el-table-column prop="date" label="日期" width="130" />
          <el-table-column label="任务时段" min-width="140"><template #default="{ row }">{{ row.startTime }} - {{ row.endTime }}</template></el-table-column>
          <el-table-column label="需求人数" width="90"><template #default="{ row }">{{ row.quota || 1 }}</template></el-table-column>
          <el-table-column label="已派人数" width="90"><template #default="{ row }">{{ row.assignedCount }} / {{ row.quota || 1 }}</template></el-table-column>
          <el-table-column prop="source" label="发布来源" min-width="120" />
          <el-table-column prop="dispatchStatus" label="派发状态" width="105" />
          <el-table-column prop="assignedNames" label="已派人员" min-width="170" show-overflow-tooltip />
          <el-table-column prop="remark" label="备注" min-width="140" show-overflow-tooltip />
          <el-table-column label="操作" width="105" fixed="right"><template #default="{ row }"><el-button v-if="row.assignedCount < (row.quota || 1)" link type="primary" @click="retryDispatch(row)">重试派发</el-button><el-button v-else link type="primary" @click="router.push('/parttime-task-tracking')">任务跟踪</el-button></template></el-table-column>
        </el-table>
        <TablePagination v-model:page="page" v-model:page-size="pageSize" :total="total" />
          </el-tab-pane>
        </el-tabs>
      </main>
    </div>

    <el-dialog v-model="requirementDialogVisible" :title="form.id ? '编辑时段需求' : '新增时段需求'" width="min(760px, 94vw)">
      <el-form label-position="top">
        <el-form-item label="门店"><el-input :model-value="selectedStore.name" disabled /></el-form-item>
        <div class="form-grid"><el-form-item label="生效日期"><el-date-picker v-model="form.startDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" /></el-form-item><el-form-item label="结束日期（选填）"><el-date-picker v-model="form.endDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" clearable /></el-form-item></div>
        <el-form-item label="备注（选填）"><el-input v-model="form.remark" type="textarea" :rows="2" maxlength="200" show-word-limit /></el-form-item>
        <el-form-item label="启用需求"><el-switch v-model="form.enabled" /></el-form-item>
        <div class="weekday-tabs"><button v-for="day in weekdayOptions" :key="day.value" type="button" :class="{ active: formDay === day.value }" @click="formDay = day.value">{{ day.label }}<small v-if="form.days[day.value].length"> {{ form.days[day.value].length }}</small></button></div>
        <div class="slot-editor-heading"><span>任务时段</span><el-button :icon="Plus" size="small" @click="form.days[formDay].push({ startTime: '10:00', endTime: '12:00', quota: 1 })">添加时段</el-button></div>
        <div v-for="(row, index) in form.days[formDay]" :key="index" class="slot-editor">
          <template v-if="row.voidedAt"><span>{{ row.startTime }} - {{ row.endTime }} · {{ row.quota }} 名额 · 已作废</span></template>
          <template v-else>
            <el-time-select v-model="row.startTime" start="10:00" step="00:30" end="21:30" placeholder="开始时间" /><span>至</span><el-time-select v-model="row.endTime" start="10:30" step="00:30" end="22:00" placeholder="结束时间" />
            <el-input-number v-model="row.quota" :min="1" :max="99" aria-label="时段名额" /><span>名额</span>
            <el-tooltip :content="form.id ? '作废时段' : '移除时段'"><el-button :icon="Delete" circle @click="removeFormSlot(index)" /></el-tooltip>
          </template>
        </div>
        <el-empty v-if="!form.days[formDay].length" description="当天暂无时段" :image-size="50" />
        <div class="copy-days"><span>复制当前日到</span><el-checkbox-group v-model="copyDays"><el-checkbox v-for="day in weekdayOptions.filter(day => day.value !== formDay)" :key="day.value" :value="day.value">{{ day.label }}</el-checkbox></el-checkbox-group><el-button size="small" :disabled="!copyDays.length" @click="copyCurrentDay">复制时段</el-button></div>
      </el-form>
      <template #footer><el-button @click="requirementDialogVisible = false">取消</el-button><el-button type="primary" @click="saveForm">保存需求</el-button></template>
    </el-dialog>
    <el-dialog v-model="temporaryDialogVisible" title="发布临时任务" width="min(520px, 94vw)">
      <el-form label-position="top">
        <el-form-item label="门店"><el-select v-model="temporaryForm.storeId" style="width: 100%"><el-option v-for="store in stores" :key="store.id" :label="store.name" :value="store.id" /></el-select></el-form-item>
        <el-form-item label="任务日期"><el-date-picker v-model="temporaryForm.date" type="date" value-format="YYYY-MM-DD" :disabled-date="date => dateKey(date) < dateKey(new Date())" style="width: 100%" /></el-form-item>
        <div class="form-grid"><el-form-item label="开始时间"><el-time-select v-model="temporaryForm.startTime" start="10:00" step="00:30" end="21:30" /></el-form-item><el-form-item label="结束时间"><el-time-select v-model="temporaryForm.endTime" start="10:30" step="00:30" end="22:00" /></el-form-item></div>
        <el-form-item label="需求人数"><el-input-number v-model="temporaryForm.quota" :min="1" :max="99" aria-label="需求人数" /></el-form-item>
        <el-form-item label="备注（选填）"><el-input v-model="temporaryForm.remark" type="textarea" :rows="2" maxlength="200" show-word-limit /></el-form-item>
      </el-form>
      <template #footer><el-button @click="temporaryDialogVisible = false">取消</el-button><el-button type="primary" @click="publishTemporary">确认发布</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Cellphone, Clock, Delete, Download, Plus, Promotion, Search, Upload } from '@element-plus/icons-vue'
import { parttimeStore, stores, employees, weekdayOptions, dateKey, addDays, latestPublicationDate, publicationWindow, previewPublication, publishTasks, saveRequirement, deleteRequirementSlot, durationLabel, slotRemaining, publishTemporaryTask, dispatchPendingNeed, needAssignments } from '../stores/parttimeTasks'

import { usePager } from '../composables/usePager.js'
import TablePagination from '../components/TablePagination.vue'
const router = useRouter()
const route = useRoute()
const importInput = ref(null)
const activeTab = ref(route.name === 'parttime-task-publication' ? 'publication' : 'requirements')
const isPublicationRoute = computed(() => route.name === 'parttime-task-publication')
watch(() => route.name, name => { activeTab.value = name === 'parttime-task-publication' ? 'publication' : 'requirements' })
const storeSearch = ref('')
const selectedStoreId = ref(stores[0].id)
const selectedStore = computed(() => stores.find(store => store.id === selectedStoreId.value))
const filteredStores = computed(() => stores.filter(store => `${store.name}${store.code}${store.businessArea}`.includes(storeSearch.value.trim())))
watch(filteredStores, list => {
  if (list.length && !list.some(store => store.id === selectedStoreId.value)) selectedStoreId.value = list[0].id
}, { immediate: true })
const selectedDay = ref(6)
const rowsForDay = day => parttimeStore.requirements.filter(requirement => requirement.storeId === selectedStoreId.value).flatMap(requirement => (requirement.days[day] || []).map((row, index) => ({ ...row, requirement, slotIndex: index, key: `${requirement.id}-${day}-${index}` }))).sort((a, b) => a.startTime.localeCompare(b.startTime))
const dayRows = computed(() => rowsForDay(selectedDay.value))
const activeDayRows = computed(() => dayRows.value.filter(row => !row.voidedAt && row.requirement.enabled))
const selectedDayLabel = computed(() => weekdayOptions.find(day => day.value === selectedDay.value)?.label || '')
const requirementDialogVisible = ref(false)
const emptyForm = () => ({ storeId: selectedStoreId.value, remark: '', startDate: dateKey(new Date()), endDate: '', enabled: true, days: Object.fromEntries(weekdayOptions.map(day => [day.value, []])) })
const form = ref(emptyForm())
const formDay = ref(6)
const copyDays = ref([])
const editRequirement = requirement => {
  form.value = requirement ? JSON.parse(JSON.stringify(requirement)) : emptyForm()
  formDay.value = selectedDay.value
  copyDays.value = []
  requirementDialogVisible.value = true
}
const removeFormSlot = index => {
  if (form.value.id) form.value.days[formDay.value][index].voidedAt = new Date().toISOString()
  else form.value.days[formDay.value].splice(index, 1)
}
const copyCurrentDay = async () => {
  if (copyDays.value.some(day => form.value.days[day].length)) {
    try { await ElMessageBox.confirm('目标日期已有时段，确认覆盖？', '复制时段', { confirmButtonText: '确认覆盖', cancelButtonText: '取消' }) } catch { return }
  }
  for (const day of copyDays.value) form.value.days[day] = JSON.parse(JSON.stringify(form.value.days[formDay.value]))
  copyDays.value = []
  ElMessage.success('已复制时段')
}
const saveForm = () => {
  const error = saveRequirement(form.value)
  if (error) return ElMessage.warning(error)
  requirementDialogVisible.value = false
  ElMessage.success('需求已保存，已发布的任务保持原安排')
}
const exportSchedule = () => {
  const requirements = parttimeStore.requirements.filter(requirement => requirement.storeId === selectedStoreId.value)
  const payload = { type: '排班排假配置', version: 1, store: selectedStore.value, requirements: JSON.parse(JSON.stringify(requirements)) }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${selectedStore.value.code}-${selectedStore.value.name}-排班排假配置.json`
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success(`已导出${selectedStore.value.name}的排班排假配置`)
}
const importSchedule = event => {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const payload = JSON.parse(reader.result)
      if (payload.type !== '排班排假配置' || !Array.isArray(payload.requirements)) throw new Error('格式不匹配')
      const errors = payload.requirements.map(requirement => saveRequirement({ ...requirement, storeId: selectedStoreId.value })).filter(Boolean)
      if (errors.length) return ElMessage.warning(errors[0])
      ElMessage.success(`已导入${selectedStore.value.name}的排班排假配置`)
    } catch {
      ElMessage.error('导入失败，请选择排班排假配置文件')
    }
  }
  reader.readAsText(file)
}
const removeSlot = async row => {
  const weekday = selectedDay.value
  try { await ElMessageBox.confirm(`作废${weekdayOptions.find(day => day.value === weekday).label} ${row.startTime} - ${row.endTime} 的需求？仅影响后续任务发布，已发布任务保持原安排。`, '作废时段', { confirmButtonText: '确认作废', cancelButtonText: '取消', type: 'warning' }) } catch { return }
  if (deleteRequirementSlot(row.requirement.id, weekday, row.slotIndex)) ElMessage.success('时段需求已作废')
}
const releaseDate = ref(addDays(latestPublicationDate(), 7))
const releaseWindow = computed(() => publicationWindow(releaseDate.value || latestPublicationDate()))
const disableNonThursday = date => date.getDay() !== 4
const isPublished = computed(() => parttimeStore.publications.some(item => item.releaseDate === releaseDate.value))
const previewSlots = computed(() => !releaseDate.value ? [] : isPublished.value ? parttimeStore.slots.filter(slot => slot.releaseDate === releaseDate.value) : previewPublication(releaseDate.value))
const publicationRecords = computed(() => [...parttimeStore.publications].sort((a, b) => b.releaseDate.localeCompare(a.releaseDate)))
const publishSelected = async () => {
  try { await ElMessageBox.confirm(`发布 ${releaseWindow.value.start} 至 ${releaseWindow.value.end} 的任务，共 ${previewSlots.value.length} 个时段？`, '发布任务', { confirmButtonText: '确认发布', cancelButtonText: '取消' }) } catch { return }
  const error = publishTasks(releaseDate.value)
  if (error) return ElMessage.warning(error)
  ElMessage.success('任务已发布')
}
const needFilter = ref('全部')
const filteredNeeds = computed(() => [...parttimeStore.temporaryNeeds].reverse().map(need => {
  const tasks = needAssignments(need)
  const assignedCount = tasks.length
  return { ...need, assignedCount, assignedNames: tasks.map(task => employees.find(person => person.id === task.assigneeId)?.name || task.assigneeName).join('、') || '-', dispatchStatus: assignedCount >= (need.quota || 1) ? '已派发' : assignedCount ? '部分派发' : '待派发' }
}).filter(need => needFilter.value === '全部' || need.dispatchStatus === needFilter.value))
const temporaryDialogVisible = ref(false)
const emptyTemporaryForm = () => ({ storeId: selectedStoreId.value, date: addDays(dateKey(new Date()), 1), startTime: '10:00', endTime: '12:00', quota: 1, remark: '' })
const temporaryForm = ref(emptyTemporaryForm())
const openTemporaryDialog = () => { temporaryForm.value = emptyTemporaryForm(); temporaryDialogVisible.value = true }
const publishTemporary = () => {
  const result = publishTemporaryTask(temporaryForm.value)
  if (result.error) return ElMessage.warning(result.error)
  temporaryDialogVisible.value = false
  ElMessage.success(`任务已发布，已派发 ${result.tasks.length} / ${result.need.quota} 人`)
}
const retryDispatch = need => {
  const tasks = dispatchPendingNeed(need.id)
  if (!tasks.length) return ElMessage.warning('暂无符合商圈、时段及工时条件的客户经理')
  ElMessage.success(`已派发 ${tasks.length} 人`)
}

/* 分页：数据已筛选 / 排序，这里只切片 */
const { page: page, pageSize: pageSize, total: total, rows: pagedRows } = usePager(filteredNeeds)
const { page: page2, pageSize: pageSize2, total: total2, rows: pagedRows2 } = usePager(publicationRecords)
</script>

<style scoped>
.task-management { padding: 24px; color: #303133; background: #fff; min-height: 100%; }
.management-header, .section-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
h1 { font-size: 22px; margin: 0 0 8px; } h2 { font-size: 17px; margin: 0; } h3 { font-size: 15px; }
p { margin: 6px 0 0; color: #777; font-size: 13px; }
.scope-toolbar { display: flex; align-items: center; gap: 16px; padding: 0 0 18px; border-bottom: 1px solid #e5e7eb; }
.scope-toolbar .el-input { width: 280px; } .role-selector { width: 220px; } .role-selector :deep(.el-input__wrapper) { border-radius: 6px; }
.toolbar-action { border: 0; border-radius: 20px; background: #f9e9ef; color: #a40035; font-weight: 600; }
.toolbar-action:hover { background: #f4dce5; color: #8e002d; }
.configuration-layout { display: grid; grid-template-columns: 250px minmax(0, 1fr); min-height: 680px; }
.configuration-layout.publication-layout { display: block; min-height: 0; }
.store-list { border-right: 1px solid #e8e8e8; min-width: 0; }
.store-list-header { display: grid; grid-template-columns: 1fr 1.2fr; gap: 8px; padding: 14px 16px; background: #f5f4f6; color: #444; font-weight: 600; font-size: 14px; }
.store-list-body { max-height: 690px; overflow-y: auto; }
.store-option { display: grid; grid-template-columns: 1fr 1.2fr; gap: 8px; align-items: center; width: 100%; min-height: 62px; text-align: left; border: 0; border-bottom: 1px solid #eee; border-left: 3px solid transparent; background: white; padding: 12px 13px; cursor: pointer; color: #303133; font: inherit; }
.store-option strong, .store-option span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.store-option span { font-size: 13px; } .store-option strong { font-size: 14px; }
.store-option.selected { background: #f8edf1; color: #a40035; border-left: 3px solid #a40035; }
.configuration-content { min-width: 0; padding: 0 0 0 24px; }
.publication-layout .configuration-content { padding-left: 0; }
.store-code { margin-left: 8px; color: #999; font-size: 12px; font-weight: 400; }
.day-heading { display: flex; justify-content: space-between; align-items: center; margin: 0 0 12px; color: #666; }
.day-heading h3 { margin: 0; color: #303133; }
.day-heading span { font-size: 13px; }
.demand-label { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 12px; line-height: 18px; white-space: nowrap; }
.demand-label.long { color: #247354; background: #eaf5ef; } .demand-label.inactive { color: #777; background: #f1f1f1; }
.management-header .el-icon { margin-right: 6px; }
.weekday-tabs { display: flex; gap: 8px; margin: 16px 0 20px; }
.weekday-tabs button { flex: 1; min-width: 0; padding: 10px 4px; border: 1px solid #eee; border-radius: 6px; background: #f7f7f7; cursor: pointer; color: #555; }
.weekday-tabs button.active { background: #a40035; border-color: #a40035; color: white; }
.weekly-heading { margin: 28px 0 14px; }
.week-overview { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); border-top: 1px solid #eee; }
.week-column { padding: 14px 8px; border-right: 1px solid #eee; font-size: 13px; }
.week-column:last-child { border: 0; } .week-column > strong { display: block; margin-bottom: 14px; }
.week-slot { margin-bottom: 10px; border-left: 2px solid #a40035; padding-left: 7px; line-height: 1.7; }
.week-slot span, .week-slot small { display: block; } .week-slot small, .muted { color: #888; } .disabled { opacity: .5; }
.publication-policy { display: flex; align-items: center; gap: 14px; padding: 16px 0; border-bottom: 1px solid #eee; margin-bottom: 20px; }
.publication-policy .el-icon { font-size: 26px; color: #a40035; }
.publication-toolbar { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; font-size: 14px; }
.publication-summary { display: flex; gap: 32px; margin: 20px 0; font-size: 14px; } .publication-summary strong { color: #a40035; margin-left: 8px; }
.temporary-filters { margin: 0 0 20px; } .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.slot-editor-heading { display: flex; justify-content: space-between; align-items: center; margin: 16px 0; }
.slot-editor { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.slot-editor .el-select { width: 140px; } .slot-editor .el-input-number { width: 120px; }
.copy-days { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: 22px; border-top: 1px solid #eee; padding-top: 16px; }
.copy-days .el-checkbox { margin-right: 12px; } .split-preview { display: flex; flex-direction: column; gap: 10px; background: #f7f7f7; padding: 14px; border-radius: 6px; font-size: 13px; }
@media (max-width: 1000px) { .configuration-layout { grid-template-columns: 190px minmax(0, 1fr); } .configuration-content { padding-left: 16px; } .week-overview { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
@media (max-width: 600px) { .task-management { padding: 16px; } .management-header { align-items: flex-start; flex-wrap: wrap; } .scope-toolbar { flex-wrap: wrap; } .scope-toolbar .el-input { width: 100%; } .configuration-layout { grid-template-columns: minmax(0, 1fr); } .store-list { border-right: 0; margin-bottom: 16px; } .store-list-body { display: flex; gap: 8px; overflow-x: auto; max-height: none; padding-bottom: 4px; } .store-list-header { display: none; } .store-option { min-width: 180px; border: 1px solid #eee; border-left: 3px solid transparent; } .store-option.selected { border-left-color: #a40035; } .configuration-content { padding-left: 0; } .week-overview { grid-template-columns: repeat(2, minmax(0, 1fr)); } .slot-editor { flex-wrap: wrap; } .form-grid { grid-template-columns: minmax(0, 1fr); gap: 0; } }
</style>
