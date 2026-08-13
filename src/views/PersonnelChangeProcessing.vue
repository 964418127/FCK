<template>
  <div class="personnel-change-processing">
    <div class="page-header">
      <h1>人员异动处理</h1>
      <p class="tip">HR 人事模块按日同步人员异动；本页分两步：异动结束（仅查看事实）+ 新关系确认（薪酬专员挑模板）。起止时间由 HR 提供，模板才是确认点。</p>
    </div>

    <div class="content-section">
      <!-- 同步信息条 -->
      <div class="sync-info-bar">
        <div class="sync-info-item">
          <el-icon><Connection /></el-icon>
          <span class="sync-info-label">数据来源</span>
          <span class="sync-info-value">HR 人事模块</span>
        </div>
        <div class="sync-info-divider"></div>
        <div class="sync-info-item">
          <el-icon><Clock /></el-icon>
          <span class="sync-info-label">上次同步</span>
          <span class="sync-info-value">{{ syncInfo.lastSyncTime }}</span>
        </div>
        <div class="sync-info-divider"></div>
        <div class="sync-info-item">
          <el-icon><Warning /></el-icon>
          <span class="sync-info-label">待确认</span>
          <span class="sync-info-value sync-info-pending">{{ pendingCount }} 条</span>
        </div>
        <div class="sync-info-divider"></div>
        <div class="sync-info-item">
          <el-icon><Plus /></el-icon>
          <span class="sync-info-label">今日新增</span>
          <span class="sync-info-value">{{ todayAddedCount }} 条</span>
        </div>
        <div class="sync-info-actions">
          <el-button type="primary" plain size="small" @click="handleSimulateSync">
            <el-icon><Refresh /></el-icon>
            <span>立即同步（模拟）</span>
          </el-button>
        </div>
      </div>

      <el-tabs v-model="activeTab" class="processing-tabs">
        <!-- ===== Tab 1: 异动结束（查看）—— 只读事实记录 ===== -->
        <el-tab-pane name="end">
          <template #label>
            <span><el-icon><Document /></el-icon> 异动结束（查看）</span>
          </template>

          <div class="tab-pane-inner">
            <div class="tab-desc">
              <el-icon><InfoFilled /></el-icon>
              <span>本页是 HR 人事模块已落定的"结束"事实 —— 谁在哪一天结束了哪段任职关系。仅查看，不可编辑；旧关系的岗位计算失效时间已自动写入【人员薪酬规划】。</span>
            </div>

            <div class="search-section">
              <el-form :inline="true" class="demo-form-inline">
                <el-form-item>
                  <el-input v-model="endSearch.keyword" placeholder="搜索姓名/人才ID" clearable style="width: 200px;" />
                </el-form-item>
                <el-form-item>
                  <el-select v-model="endSearch.changeType" placeholder="异动类型" clearable style="width: 130px;">
                    <el-option label="换签主体" value="换签主体" />
                    <el-option label="换合作方式" value="换合作方式" />
                    <el-option label="换岗位" value="换岗位" />
                    <el-option label="离职" value="离职" />
                  </el-select>
                </el-form-item>
<el-form-item>
                  <el-button type="primary" @click="applyEndSearch">搜索</el-button>
                  <el-button @click="handleEndReset">重置</el-button>
                </el-form-item>
              </el-form>
            </div>

            <el-table :data="filteredEndList" stripe style="width: 100%; margin-top: 12px;">
              <el-table-column prop="syncDate" label="同步日期" width="110" />
              <el-table-column prop="changeId" label="异动ID" width="170" />
              <el-table-column prop="name" label="姓名" width="80" />
              <el-table-column prop="talentId" label="人才ID" width="160" />
              <el-table-column prop="changeType" label="异动类型" width="100">
                <template #default="{ row }">
                  <el-tag :type="getChangeTypeTag(row.changeType)" size="small">{{ row.changeType }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="结束什么关系" min-width="360">
                <template #default="{ row }">
                  <div class="end-relation">
                    <div><span class="rel-key">主体</span>{{ row.oldCompany }}</div>
                    <div><span class="rel-key">合作</span>{{ row.oldCoopMode }}</div>
                    <div><span class="rel-key">岗位</span>{{ row.oldPosition }} / {{ row.oldStore }}</div>
                    <div><span class="rel-key">失效</span><span class="rel-time">{{ row.oldEndTime }}</span></div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="同步状态" width="110" align="center">
                <template #default="{ row }">
                  <el-tag type="success" size="small" effect="plain">✓ 已写入</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="对应新关系" width="120">
                <template #default="{ row }">
                  <el-tag
                    :type="row.status === '已确认' || row.status === '已结束' ? 'success' : 'warning'"
                    size="small"
                  >
                    {{ row.status === '已确认' ? '已确认' : row.status === '已结束' ? '无需确认' : '待确认' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80" fixed="right">
                <template #default="{ row }">
                  <el-button type="info" size="small" link @click="handleViewDetail(row)">详情</el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination-wrapper">
              <el-pagination
                v-model:current-page="endPagination.currentPage"
                v-model:page-size="endPagination.pageSize"
                :total="endPagination.total"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                background
              />
            </div>
          </div>
        </el-tab-pane>

        <!-- ===== Tab 2: 新关系确认 —— 薪酬专员挑模板即可 ===== -->
        <el-tab-pane name="start">
          <template #label>
            <span><el-icon><Edit /></el-icon> 新关系确认 ({{ pendingCount }})</span>
          </template>

          <div class="tab-pane-inner">
            <div class="tab-desc tab-desc-primary">
              <el-icon><InfoFilled /></el-icon>
              <span>起止时间已由 HR 提供，可直接采用；薪酬专员只需为每条新关系挑一个岗位薪酬模板，点击【确认】写入【人员薪酬规划】。</span>
            </div>

            <div class="search-section">
              <el-form :inline="true" class="demo-form-inline">
                <el-form-item>
                  <el-input v-model="startSearch.keyword" placeholder="搜索姓名/人才ID" clearable style="width: 200px;" />
                </el-form-item>
                <el-form-item>
                  <el-select v-model="startSearch.newPosition" placeholder="岗位" clearable style="width: 130px;">
                    <el-option label="客户经理" value="客户经理" />
                    <el-option label="推拿师" value="推拿师" />
                    <el-option label="调理师" value="调理师" />
                    <el-option label="理疗师" value="理疗师" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-select v-model="startSearch.changeType" placeholder="异动类型" clearable style="width: 130px;">
                    <el-option label="换签主体" value="换签主体" />
                    <el-option label="换合作方式" value="换合作方式" />
                    <el-option label="换岗位" value="换岗位" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="applyStartSearch">搜索</el-button>
                  <el-button @click="handleStartReset">重置</el-button>
                </el-form-item>
              </el-form>
            </div>

            <div class="toolbar">
              <div class="toolbar-left">
                <el-button type="primary" :disabled="!hasSelected" @click="handleBatchConfirm">
                  批量确认（{{ selectedIds.length }}）
                </el-button>
                <el-button @click="handleSelectAllPending">选中全部</el-button>
                <el-button @click="handleClearSelection">清空选择</el-button>
              </div>
              <div class="toolbar-right">
                <span v-if="hasSelected && selectedPositionConflict" class="toolbar-warn">
                  ⚠ 所选 {{ selectedIds.length }} 条新关系岗位不一致（{{ selectedPositions.join(' / ') }}），无法批量处理
                </span>
                <span v-else-if="hasSelected" class="toolbar-tip-inline">
                  所选 {{ selectedIds.length }} 条岗位均为 <strong>{{ selectedPositions[0] }}</strong>
                </span>
                <span v-else class="toolbar-tip">💡 仅需为每条新关系挑一个岗位薪酬模板即可完成确认</span>
              </div>
            </div>

            <el-table
              ref="tableRef"
              :data="filteredStartList"
              stripe
              style="width: 100%; margin-top: 12px;"
              @selection-change="handleSelectionChange"
            >
              <el-table-column type="selection" width="44" :selectable="(row) => row.status === '待确认'" />
              <el-table-column prop="changeId" label="异动ID" width="170" />
              <el-table-column prop="name" label="姓名" width="80" />
              <el-table-column prop="changeType" label="异动类型" width="100">
                <template #default="{ row }">
                  <el-tag :type="getChangeTypeTag(row.changeType)" size="small">{{ row.changeType }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="新岗位" width="120">
                <template #default="{ row }">
                  <el-tag :type="row.newPosition !== row.oldPosition ? 'warning' : 'info'" size="small">
                    {{ row.newPosition }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="新任职" min-width="240">
                <template #default="{ row }">
                  <div class="new-relation">
                    <div><span class="rel-key">主体</span>{{ row.newCompany }}</div>
                    <div><span class="rel-key">合作</span>{{ row.newCoopMode }}</div>
                    <div><span class="rel-key">门店</span>{{ row.newStore }}</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="起止时间（HR 提供）" width="220">
                <template #default="{ row }">
                  <div class="time-readonly">
                    <div>{{ row.newStartTime }}</div>
                    <div class="time-arrow">~</div>
                    <div>{{ row.newEndTime || '至今' }}</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="岗位薪酬模板 *" min-width="200">
                <template #default="{ row }">
                  <el-select
                    v-model="rowDrafts[row.changeId]"
                    placeholder="挑一个模板"
                    filterable
                    style="width: 100%;"
                  >
                    <el-option
                      v-for="opt in getTemplatesByPosition(row.newPosition)"
                      :key="opt"
                      :label="opt"
                      :value="opt"
                    />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" fixed="right">
                <template #default="{ row }">
                  <el-button
                    type="primary"
                    size="small"
                    :disabled="!rowDrafts[row.changeId]"
                    @click="handleSingleConfirm(row)"
                  >
                    确认
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination-wrapper">
              <el-pagination
                v-model:current-page="startPagination.currentPage"
                v-model:page-size="startPagination.pageSize"
                :total="startPagination.total"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                background
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 批量确认弹窗：仅需选模板 -->
    <el-dialog
      v-model="batchDialogVisible"
      :title="`批量确认新关系（${batchTargets.length} 条）`"
      width="560px"
      destroy-on-close
    >
      <div class="batch-context">
        <div><span class="ctx-key">岗位</span><strong>{{ batchTargetPositions[0] }}</strong>（已校验一致）</div>
        <div><span class="ctx-key">条数</span>{{ batchTargets.length }} 条</div>
        <div><span class="ctx-key">可选模板</span>{{ form.templateCandidates.length }} 个</div>
        <div class="batch-hint-mini">
          每条异动的【新主体/新合作方式/新岗位/门店/起止时间】保持原值，仅写入统一的薪酬模板。
        </div>
      </div>
      <el-form :model="form" label-width="100px">
        <el-form-item label="岗位薪酬模板" required>
          <el-select v-model="form.templateName" placeholder="挑一个模板" filterable style="width: 100%;">
            <el-option v-for="opt in form.templateCandidates" :key="opt" :label="opt" :value="opt" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!form.templateName" @click="handleBatchDialogConfirm">确认</el-button>
      </template>
    </el-dialog>

    <!-- 异动详情弹窗 -->
    <el-dialog v-model="detailVisible" title="异动详情" width="700px" destroy-on-close>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="异动ID">{{ detail.changeId }}</el-descriptions-item>
        <el-descriptions-item label="异动类型">{{ detail.changeType }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ detail.name }}</el-descriptions-item>
        <el-descriptions-item label="人才ID">{{ detail.talentId }}</el-descriptions-item>
        <el-descriptions-item label="同步日期">{{ detail.syncDate }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ detail.status }}</el-descriptions-item>
        <el-descriptions-item label="旧主体">{{ detail.oldCompany }}</el-descriptions-item>
        <el-descriptions-item label="新主体">{{ detail.newCompany }}</el-descriptions-item>
        <el-descriptions-item label="旧合作方式">{{ detail.oldCoopMode }}</el-descriptions-item>
        <el-descriptions-item label="新合作方式">{{ detail.newCoopMode }}</el-descriptions-item>
        <el-descriptions-item label="旧岗位">{{ detail.oldPosition }} / {{ detail.oldStore }}</el-descriptions-item>
        <el-descriptions-item label="新岗位">{{ detail.newPosition }} / {{ detail.newStore }}</el-descriptions-item>
        <el-descriptions-item label="旧结束时间">{{ detail.oldEndTime }}</el-descriptions-item>
        <el-descriptions-item label="新起止时间">{{ detail.newStartTime }} ~ {{ detail.newEndTime || '至今' }}</el-descriptions-item>
        <el-descriptions-item label="自动截尾" :span="2">
          <span v-if="detail.oldRelationTruncated === true" style="color: hsl(var(--success));">✓ 已自动写入（旧记录计算失效时间已更新为 {{ detail.oldEndTime }}）</span>
          <span v-else style="color: hsl(var(--danger));">× 未匹配到旧记录（仅新增新关系）</span>
        </el-descriptions-item>
        <el-descriptions-item v-if="detail.status === '已确认'" label="已写入模板" :span="2">{{ detail.templateName }}</el-descriptions-item>
        <el-descriptions-item v-if="detail.appliedAt" label="确认时间">{{ detail.appliedAt }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Connection, Clock, Warning, Plus, Refresh, InfoFilled,
  Document, Edit
} from '@element-plus/icons-vue'
import { usePlanningRecords, getTemplatesByPosition } from '../composables/usePlanningRecords.js'

const { changeList, confirmNewRelation, simulateSync } = usePlanningRecords()

const activeTab = ref('end')

const syncInfo = reactive({ lastSyncTime: '2026-08-13 08:00:00' })

// ===== 筛选（两个 tab 各一份） =====
const endSearch = reactive({ keyword: '', changeType: '' })
const startSearch = reactive({ keyword: '', changeType: '', newPosition: '' })

const endPagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })
const startPagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })

// ===== 行内 template 选择器草稿（按 changeId 存） =====
const rowDrafts = reactive({})

// ===== 批量确认 =====
const selectedIds = ref([])
const tableRef = ref(null)
const batchDialogVisible = ref(false)
const batchTargets = ref([])
const batchTargetPositions = ref([])
const form = reactive({ templateName: '', templateCandidates: [] })

// ===== 详情 =====
const detailVisible = ref(false)
const detail = reactive({})

// ===== 派生数据 =====
const filteredEndList = computed(() => {
  const kw = endSearch.keyword.trim()
  return changeList.value.filter(r => {
    if (kw && !(r.name.includes(kw) || r.talentId.includes(kw))) return false
    if (endSearch.changeType && r.changeType !== endSearch.changeType) return false
    return true
  })
})

const filteredStartList = computed(() => {
  const kw = startSearch.keyword.trim()
  return changeList.value.filter(r => {
    if (r.status !== '待确认') return false
    if (kw && !(r.name.includes(kw) || r.talentId.includes(kw))) return false
    if (startSearch.changeType && r.changeType !== startSearch.changeType) return false
    if (startSearch.newPosition && r.newPosition !== startSearch.newPosition) return false
    return true
  })
})

const pendingCount = computed(() => changeList.value.filter(r => r.status === '待确认').length)
const todayAddedCount = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return changeList.value.filter(r => r.syncDate === today).length
})
const hasSelected = computed(() => selectedIds.value.length > 0)
const selectedPositions = computed(() => {
  return Array.from(new Set(
    selectedIds.value
      .map(id => changeList.value.find(r => r.changeId === id)?.newPosition)
      .filter(Boolean)
  ))
})
const selectedPositionConflict = computed(() => selectedPositions.value.length > 1)

endPagination.total = filteredEndList.value.length
startPagination.total = filteredStartList.value.length

// ===== 工具 =====
const getChangeTypeTag = (type) => ({
  '换签主体': 'primary',
  '换合作方式': 'warning',
  '换岗位': 'success',
  '离职': 'danger'
}[type] || 'info')

// ===== 操作 =====
const applyEndSearch = () => { /* computed */ }
const handleEndReset = () => {
  endSearch.keyword = ''
  endSearch.changeType = ''
}

const applyStartSearch = () => { /* computed */ }
const handleStartReset = () => {
  startSearch.keyword = ''
  startSearch.changeType = ''
  startSearch.newPosition = ''
}

const handleSelectionChange = (rows) => {
  selectedIds.value = rows.map(r => r.changeId)
}

const handleSelectAllPending = () => {
  filteredStartList.value.forEach(r => {
    tableRef.value?.toggleRowSelection(r, true)
  })
}

const handleClearSelection = () => {
  tableRef.value?.clearSelection()
  selectedIds.value = []
}

const handleSingleConfirm = (row) => {
  const templateName = rowDrafts[row.changeId]
  if (!templateName) {
    ElMessage.warning('请先挑一个岗位薪酬模板')
    return
  }
  // 起止时间采用 HR 提供的值（newStartTime / newEndTime），不传即代表用默认值
  const ok = confirmNewRelation(row.changeId, { templateName })
  if (ok) {
    ElMessage.success(`已为 ${row.name} 写入新关系（${templateName}）`)
    delete rowDrafts[row.changeId]
  } else {
    ElMessage.error('确认失败')
  }
}

const handleBatchConfirm = () => {
  if (selectedIds.value.length === 0) return
  const targets = selectedIds.value
    .map(id => changeList.value.find(r => r.changeId === id))
    .filter(Boolean)
  batchTargetPositions.value = targets.map(r => r.newPosition)
  if (new Set(batchTargetPositions.value).size > 1) {
    ElMessage.warning(
      `批量处理要求岗位一致，当前选择包含：${[...new Set(batchTargetPositions.value)].join(' / ')}。请按岗位分批确认。`
    )
    return
  }
  const position = batchTargetPositions.value[0]
  form.templateCandidates = getTemplatesByPosition(position)
  form.templateName = ''
  batchTargets.value = targets.map(t => t.changeId)
  batchDialogVisible.value = true
}

const handleBatchDialogConfirm = () => {
  if (!form.templateName) {
    ElMessage.warning('请挑一个岗位薪酬模板')
    return
  }
  let okCount = 0
  batchTargets.value.forEach(cid => {
    if (confirmNewRelation(cid, { templateName: form.templateName })) okCount++
  })
  ElMessage.success(`已为 ${okCount} 条新关系批量写入模板：${form.templateName}`)
  batchDialogVisible.value = false
  handleClearSelection()
}

const handleViewDetail = (row) => {
  Object.assign(detail, row)
  detailVisible.value = true
}

const handleSimulateSync = async () => {
  try {
    await ElMessageBox.confirm('模拟 HR 人事模块按日汇入异动，将在异动结束列表新增 2 条今日结束事件 + 新关系确认列表新增 2 条待确认起算。', '模拟同步', {
      type: 'info',
      confirmButtonText: '继续',
      cancelButtonText: '取消'
    })
    const n = simulateSync()
    syncInfo.lastSyncTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
    ElMessage.success(`已模拟汇入 ${n} 条异动（自动截尾已执行）`)
  } catch { /* 取消 */ }
}
</script>

<style scoped>
.personnel-change-processing { padding: 0; }

.page-header { margin-bottom: 20px; }
.page-header h1 { font-size: 24px; font-weight: 600; margin: 0 0 8px 0; color: hsl(var(--foreground)); }
.page-header .tip { color: hsl(var(--muted-foreground)); font-size: 14px; margin: 0; }

.content-section {
  background: hsl(var(--background));
  border-radius: 8px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.sync-info-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  margin-bottom: 16px;
  background: hsl(var(--muted) / 0.5);
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}
.sync-info-item { display: flex; align-items: center; gap: 6px; }
.sync-info-divider { width: 1px; height: 16px; background: hsl(var(--border)); }
.sync-info-label { color: hsl(var(--muted-foreground)); font-size: 12px; }
.sync-info-value { font-size: 13px; font-weight: 500; color: hsl(var(--foreground)); }
.sync-info-pending { color: hsl(var(--warning)); }
.sync-info-actions { margin-left: auto; }

.processing-tabs :deep(.el-tabs__item) { font-size: 14px; font-weight: 500; }
.processing-tabs :deep(.el-tabs__item .el-icon) { margin-right: 4px; vertical-align: -2px; }

.tab-pane-inner { padding-top: 4px; }

.tab-desc {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  margin-bottom: 12px;
  background: hsl(var(--muted) / 0.4);
  border-left: 3px solid hsl(var(--muted-foreground));
  border-radius: 4px;
  font-size: 12px;
  color: hsl(var(--foreground));
  line-height: 1.6;
}
.tab-desc .el-icon { color: hsl(var(--muted-foreground)); flex-shrink: 0; margin-top: 2px; }
.tab-desc-primary { border-left-color: hsl(var(--primary)); background: hsl(var(--primary) / 0.06); }
.tab-desc-primary .el-icon { color: hsl(var(--primary)); }

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  flex-wrap: wrap;
  gap: 8px;
}
.toolbar-left { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.toolbar-tip { font-size: 12px; color: hsl(var(--muted-foreground)); }
.toolbar-tip-inline { color: hsl(var(--muted-foreground)); font-size: 12px; }
.toolbar-tip-inline strong { color: hsl(var(--primary)); margin: 0 2px; }
.toolbar-warn { color: hsl(var(--warning)); font-size: 12px; }

/* 异动结束 tab 的关系展示 */
.end-relation, .new-relation {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
  line-height: 1.6;
}
.rel-key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  padding: 0 4px;
  height: 18px;
  background: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
  border-radius: 3px;
  font-size: 11px;
  margin-right: 6px;
}
.rel-time { color: hsl(var(--primary)); font-weight: 500; }

/* 起止时间只读展示 */
.time-readonly {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
  line-height: 1.5;
}
.time-arrow { text-align: center; color: hsl(var(--muted-foreground)); }

/* 批量弹窗上下文 */
.batch-context {
  padding: 12px 14px;
  background: hsl(var(--muted) / 0.4);
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.8;
  margin-bottom: 16px;
}
.batch-context > div { display: flex; gap: 8px; }
.ctx-key { color: hsl(var(--muted-foreground)); min-width: 70px; }
.batch-hint-mini {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed hsl(var(--border));
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.pagination-wrapper { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
