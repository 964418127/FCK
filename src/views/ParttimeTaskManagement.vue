<template>
  <div class="task-management">
    <header class="management-header">
      <div><h1>{{ isPublicationRoute ? '任务发布' : '排班排假' }}</h1><p>{{ isPublicationRoute ? '非全客户经理 · 定时发布 + 手动发布' : pageTab === 'policies' ? '非全客户经理 · 分配策略' : '非全客户经理 · 时段需求配置' }}</p></div>
    </header>
    <div v-if="!isPublicationRoute" class="page-tabs" role="tablist" aria-label="页面视图">
      <button type="button" role="tab" :aria-selected="pageTab === 'tasks'" :class="{ active: pageTab === 'tasks' }" @click="pageTab = 'tasks'">时段需求</button>
      <button type="button" role="tab" :aria-selected="pageTab === 'policies'" :class="{ active: pageTab === 'policies' }" @click="pageTab = 'policies'">分配策略</button>
    </div>
    <div v-if="!isPublicationRoute && pageTab === 'tasks'" class="scope-toolbar">
      <el-input v-model="storeSearch" placeholder="搜索门店名称或编码" :prefix-icon="Search" clearable aria-label="搜索门店" />
      <el-select model-value="parttime-account-manager" class="role-selector" aria-label="岗位范围" disabled>
        <el-option label="客户经理（非全日制）" value="parttime-account-manager" />
      </el-select>
      <el-button class="toolbar-action" :icon="Upload" @click="openImport">导入排班配置</el-button>
      <el-button class="toolbar-action" :icon="Download" @click="exportSchedule">导出排班配置</el-button>
    </div>
    <div :class="['configuration-layout', { 'publication-layout': isPublicationRoute || pageTab === 'policies' }]">
      <aside v-if="!isPublicationRoute && pageTab === 'tasks'" class="store-list" aria-label="门店列表">
        <div class="store-list-header"><span>门店编码</span><span>门店名称</span></div>
        <div class="store-list-body">
          <button v-for="store in filteredStores" :key="store.id" :class="['store-option', { selected: selectedStoreId === store.id }]" :aria-pressed="selectedStoreId === store.id" @click="selectedStoreId = store.id">
            <span>{{ store.code }}</span><strong>{{ store.name }}</strong>
          </button>
          <el-empty v-if="!filteredStores.length" description="暂无匹配门店" :image-size="55" />
        </div>
      </aside>
      <main class="configuration-content">
        <AssignmentPolicyPanel v-if="!isPublicationRoute && pageTab === 'policies'" :initial-tab="policyTab" :policy-filter="String(route.query.policy || '')" :store-filter="String(route.query.store || '')" />
        <el-tabs v-else-if="!isPublicationRoute" v-model="activeTab">
          <el-tab-pane label="周期时段" name="requirements">
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
              <el-table-column label="分配策略" min-width="150" show-overflow-tooltip><template #default="{ row }">{{ policyNameOf(row.policyId) }}</template></el-table-column>
              <el-table-column label="生效期间" min-width="215"><template #default="{ row }">{{ row.requirement.startDate }} 至 {{ row.requirement.endDate || '不限结束日期' }}</template></el-table-column>
              <el-table-column label="备注" min-width="170" show-overflow-tooltip><template #default="{ row }">{{ row.requirement.remark || '-' }}</template></el-table-column>
              <el-table-column label="状态" width="90"><template #default="{ row }"><span :class="['demand-label', row.voidedAt || !row.requirement.enabled ? 'inactive' : 'long']">{{ row.voidedAt ? '已作废' : row.requirement.enabled ? '启用' : '停用' }}</span></template></el-table-column>
              <el-table-column label="操作" width="125" fixed="right"><template #default="{ row }"><template v-if="!row.voidedAt"><el-button link type="primary" @click="editRequirement(row.requirement)">编辑</el-button><el-button link type="danger" @click="removeSlot(row)">作废</el-button></template></template></el-table-column>
            </el-table>
            <p class="table-note">这一列挂的是「分配策略」：换某条时段的策略在编辑需求里选，策略本身（档位、人群、开放时刻）在上方 <el-button link type="primary" size="small" @click="pageTab = 'policies'">分配策略</el-button> 里维护。</p>
            <h3 class="weekly-heading">一周需求概览</h3>
            <div class="week-overview">
              <div v-for="day in weekdayOptions" :key="day.value" class="week-column">
                <strong>{{ day.label }}</strong>
                <div v-for="row in rowsForDay(day.value).filter(row => !row.voidedAt)" :key="row.key" class="week-slot" :class="{ disabled: !row.requirement.enabled }">
                  <span>{{ row.startTime }} - {{ row.endTime }}</span><small>{{ row.quota }} 个名额{{ row.requirement.enabled ? '' : ' · 停用' }}</small>
                  <small class="week-policy">{{ policyNameOf(row.policyId) }}</small>
                </div>
                <span v-if="!rowsForDay(day.value).some(row => !row.voidedAt)" class="muted">无需求</span>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="临时时段" name="temporary">
        <div class="section-heading"><h2>临时时段</h2><el-button type="primary" :icon="Plus" @click="openTemporaryDialog">发布临时时段</el-button></div>
        <div class="temporary-filters"><el-radio-group v-model="needFilter"><el-radio-button value="全部">全部</el-radio-button><el-radio-button value="待派发">待派发</el-radio-button><el-radio-button value="部分派发">部分派发</el-radio-button><el-radio-button value="已派发">已派发</el-radio-button></el-radio-group></div>
        <el-table :data="pagedRows" empty-text="暂无临时时段" class="temporary-table">
          <el-table-column label="门店" width="120"><template #default="{ row }"><div>{{ row.storeName }}</div><small v-if="row.remark" class="cell-sub">{{ row.remark }}</small></template></el-table-column>
          <el-table-column label="日期 · 时段" width="118"><template #default="{ row }"><div>{{ row.date }}</div><small class="cell-sub">{{ row.startTime }} - {{ row.endTime }}</small></template></el-table-column>
          <el-table-column label="已派名额" width="92"><template #default="{ row }"><span :class="{ 'cell-warn': row.assignedCount < (row.quota || 1) }">{{ row.assignedCount }} / {{ row.quota || 1 }}</span></template></el-table-column>
          <el-table-column label="来源 · 状态" width="100"><template #default="{ row }"><div>{{ row.sourceText }}</div><small class="cell-sub" :class="{ 'cell-warn': row.assignedCount < (row.quota || 1) }">{{ row.dispatchStatus }}</small></template></el-table-column>
          <el-table-column label="派单范围" min-width="150" show-overflow-tooltip><template #default="{ row }"><div>{{ row.scopeText }}</div><small v-if="row.scopeNames" class="cell-sub">{{ row.scopeNames }}</small></template></el-table-column>
          <el-table-column prop="assignedNames" label="已派人员" min-width="100" show-overflow-tooltip />
          <el-table-column label="操作" width="95" fixed="right"><template #default="{ row }"><el-button v-if="row.assignedCount < (row.quota || 1)" link type="primary" @click="retryDispatch(row)">重试派发</el-button><el-button v-else link type="primary" @click="router.push('/parttime-task-tracking')">任务跟踪</el-button></template></el-table-column>
        </el-table>
        <TablePagination v-model:page="page" v-model:page-size="pageSize" :total="total" />
          </el-tab-pane>
        </el-tabs>
        <template v-else>
          <div class="publication-policy">
            <el-icon><Clock /></el-icon>
            <div><strong>每周四 06:00 自动发布可选任务</strong><p>下周六至下下周五 · 名额有限，先到先得；临时调整也可手动发布（见右侧按钮）</p></div>
            <el-button type="primary" :icon="Upload" class="manual-publish" @click="openManualPublish">手动发布</el-button>
          </div>
          <div class="publication-next">
            <span>下次执行 <strong>{{ nextReleaseDate }}（周四）06:00</strong></span>
            <span>覆盖周期 <strong>{{ nextWindow.start }} 至 {{ nextWindow.end }}</strong></span>
          </div>
          <el-tabs v-model="releaseTab" class="release-tabs">
            <el-tab-pane label="本期任务" name="current">
              <template v-if="currentPublication">
                <div class="publication-summary">
                  <span>周期 <strong>{{ currentPublication.start }} 至 {{ currentPublication.end }}</strong></span>
                  <span>时段 <strong>{{ currentSlots.length }}</strong></span>
                  <span>总名额 <strong>{{ currentPublication.quota }}</strong></span>
                  <span>剩余 <strong>{{ currentRemaining }}</strong></span>
                </div>
                <el-table :data="currentSlots" empty-text="本期没有生成任务">
                  <el-table-column prop="date" label="日期" width="130" />
                  <el-table-column prop="storeName" label="门店" min-width="130" />
                  <el-table-column prop="remark" label="备注" min-width="170" show-overflow-tooltip />
                  <el-table-column label="任务时段" min-width="150"><template #default="{ row }">{{ row.startTime }} - {{ row.endTime }}</template></el-table-column>
                  <el-table-column prop="quota" label="名额" width="80" />
                  <el-table-column label="剩余名额" width="100"><template #default="{ row }">{{ slotRemaining(row) }}</template></el-table-column>
                  <el-table-column label="分配策略" min-width="150" show-overflow-tooltip><template #default="{ row }">{{ policyNameOf(row.policyId) }}</template></el-table-column>
                  <el-table-column label="此刻开放档位" width="140"><template #default="{ row }"><span :class="['stage-now', { closed: stageStarted(row) }]">{{ stageNowText(row) }}</span></template></el-table-column>
                </el-table>
                <p class="table-note">本页只读：定时任务由系统每周四生成，临时调整用页头「手动发布」；需求后续改动不影响已生成任务。档位累计开放，每条任务按自己的策略计时。</p>
              </template>
              <el-empty v-else description="还没有生成过任务" :image-size="70" />
            </el-tab-pane>
            <el-tab-pane label="发布记录" name="records">
              <el-table :data="pagedRows2" empty-text="暂无发布记录">
                <el-table-column prop="releaseDate" label="发布日（周四）" width="140" />
                <el-table-column label="任务周期" min-width="230"><template #default="{ row }">{{ row.start }} 至 {{ row.end }}</template></el-table-column>
                <el-table-column prop="mode" label="方式" width="140"><template #default="{ row }">{{ row.mode }}</template></el-table-column>
                <el-table-column prop="slotCount" label="时段数" width="100" />
                <el-table-column prop="quota" label="总名额" width="100" />
              </el-table>
              <TablePagination v-model:page="page2" v-model:page-size="pageSize2" :total="total2" />
            </el-tab-pane>
          </el-tabs>
        </template>
      </main>
    </div>

    <el-dialog v-model="requirementDialogVisible" :title="form.id ? '编辑时段需求' : '新增时段需求'" width="min(760px, 94vw)">
      <el-form label-position="top">
        <el-form-item label="门店"><el-input :model-value="selectedStore.name" disabled /></el-form-item>
        <div class="form-grid"><el-form-item label="生效日期"><el-date-picker v-model="form.startDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" /></el-form-item><el-form-item label="结束日期（选填）"><el-date-picker v-model="form.endDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" clearable /></el-form-item></div>
        <el-form-item label="备注（选填）"><el-input v-model="form.remark" type="textarea" :rows="2" maxlength="200" show-word-limit /></el-form-item>
        <el-form-item label="启用需求"><el-switch v-model="form.enabled" /></el-form-item>
        <div class="weekday-tabs"><button v-for="day in weekdayOptions" :key="day.value" type="button" :class="{ active: formDay === day.value }" @click="formDay = day.value">{{ day.label }}<small v-if="form.days[day.value].length"> {{ form.days[day.value].length }}</small></button></div>
        <div class="slot-editor-heading"><span>任务时段</span><el-button :icon="Plus" size="small" @click="form.days[formDay].push({ startTime: '10:00', endTime: '12:00', quota: 1, policyId: DEFAULT_POLICY_ID })">添加时段</el-button></div>
        <div v-for="(row, index) in form.days[formDay]" :key="index" class="slot-editor">
          <template v-if="row.voidedAt"><span>{{ row.startTime }} - {{ row.endTime }} · {{ row.quota }} 名额 · 已作废</span></template>
          <template v-else>
            <el-time-select v-model="row.startTime" start="10:00" step="00:30" end="21:30" placeholder="开始时间" /><span>至</span><el-time-select v-model="row.endTime" start="10:30" step="00:30" end="22:00" placeholder="结束时间" />
            <el-input-number v-model="row.quota" :min="1" :max="99" aria-label="时段名额" /><span>名额</span>
            <el-select v-model="row.policyId" size="small" class="slot-policy" aria-label="分配策略"><el-option v-for="policy in parttimeStore.policies" :key="policy.id" :label="policy.name" :value="policy.id" /></el-select>
            <el-tooltip :content="form.id ? '作废时段' : '移除时段'"><el-button :icon="Delete" circle @click="removeFormSlot(index)" /></el-tooltip>
          </template>
        </div>
        <el-empty v-if="!form.days[formDay].length" description="当天暂无时段" :image-size="50" />
        <div class="copy-days"><span>复制当前日到</span><el-checkbox-group v-model="copyDays"><el-checkbox v-for="day in weekdayOptions.filter(day => day.value !== formDay)" :key="day.value" :value="day.value">{{ day.label }}</el-checkbox></el-checkbox-group><el-button size="small" :disabled="!copyDays.length" @click="copyCurrentDay">复制时段</el-button></div>
      </el-form>
      <template #footer><el-button @click="requirementDialogVisible = false">取消</el-button><el-button type="primary" @click="saveForm">保存需求</el-button></template>
    </el-dialog>
    <el-dialog v-model="temporaryDialogVisible" title="发布临时时段" width="min(520px, 94vw)">
      <el-form label-position="top">
        <el-form-item label="门店"><el-select v-model="temporaryForm.storeId" style="width: 100%"><el-option v-for="store in stores" :key="store.id" :label="store.name" :value="store.id" /></el-select></el-form-item>
        <el-form-item label="任务日期"><el-date-picker v-model="temporaryForm.date" type="date" value-format="YYYY-MM-DD" :disabled-date="date => dateKey(date) < dateKey(new Date())" style="width: 100%" /></el-form-item>
        <div class="form-grid"><el-form-item label="开始时间"><el-time-select v-model="temporaryForm.startTime" start="10:00" step="00:30" end="21:30" /></el-form-item><el-form-item label="结束时间"><el-time-select v-model="temporaryForm.endTime" start="10:30" step="00:30" end="22:00" /></el-form-item></div>
        <el-form-item label="派单范围">
          <el-radio-group v-model="temporaryForm.scopeMode" class="scope-modes">
            <el-radio value="auto">本店签约非全客户经理</el-radio>
            <el-radio value="picked">指定人员</el-radio>
          </el-radio-group>
          <p class="scope-hint">{{ temporaryForm.scopeMode === 'auto' ? '与当前门店签约的非全客户经理都可能被派到：先按资格筛出可被派的人（时段不冲突、累计不超），再按签约时间先后（最早签约优先）取第一位；推拿师不参与临时时段承接' : '只派给下面点名的人，有人不满足资格就留待派发，系统不擅自换人；需求人数 = 选中人数' }}</p>
        </el-form-item>
        <el-form-item v-if="temporaryForm.scopeMode === 'picked'" label="指定承接人">
          <el-select v-model="temporaryForm.employeeIds" multiple filterable style="width: 100%" placeholder="选择与该门店签约的非全客户经理" aria-label="指定承接人">
            <el-option v-for="person in temporaryCandidates" :key="person.id" :label="person.conflict ? `${person.name}（${person.conflict}）` : person.name" :value="person.id" :disabled="Boolean(person.conflict)">
              <span>{{ person.name }}</span>
              <span class="candidate-sub">{{ person.conflict || person.intent }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="需求人数">
          <el-input-number v-model="temporaryForm.quota" :min="1" :max="99" :disabled="temporaryForm.scopeMode === 'picked'" aria-label="需求人数" />
          <span v-if="temporaryForm.scopeMode === 'picked'" class="scope-hint inline">指定人员时按选中人数，不用另填</span>
        </el-form-item>
        <el-form-item label="备注（选填）"><el-input v-model="temporaryForm.remark" type="textarea" :rows="2" maxlength="200" show-word-limit /></el-form-item>
      </el-form>
      <template #footer><el-button @click="temporaryDialogVisible = false">取消</el-button><el-button type="primary" @click="publishTemporary">确认发布</el-button></template>
    </el-dialog>
    <el-dialog v-model="manualPublishVisible" title="手动发布任务" width="min(560px, 94vw)">
      <el-form label-position="top">
        <el-form-item label="发布批次（只能选未来两周内的周四批）">
          <el-radio-group v-model="manualForm.releaseDate" class="batch-group">
            <el-radio v-for="batch in manualBatches" :key="batch.releaseDate" :value="batch.releaseDate" class="batch-radio">
              <span class="batch-title">{{ batch.releaseDate }}（周四）</span>
              <span class="batch-sub">覆盖 {{ batch.window.start }} 至 {{ batch.window.end }}{{ batch.published ? ' · 已发布，确认后覆盖' : ' · 尚未发布' }}</span>
            </el-radio>
          </el-radio-group>
          <p class="manual-hint">{{ manualBatchHint }}</p>
        </el-form-item>
        <el-form-item label="发布门店（不选 = 全部门店）">
          <el-select v-model="manualForm.storeIds" multiple style="width: 100%" placeholder="全部门店" aria-label="发布门店">
            <el-option v-for="store in stores" :key="store.id" :label="store.name" :value="store.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="manual-warn">
        <strong>该批已发布过时，手动发布是覆盖：</strong>按当前时段需求重新生成这一批 ——
        已被承接的任务保持原安排、不回收；未被承接的名额按新配置替换，需求里已作废或停用的时段不再生成。
      </div>
      <template #footer><el-button @click="manualPublishVisible = false">取消</el-button><el-button type="primary" @click="submitManualPublish">确认发布</el-button></template>
    </el-dialog>
    <el-dialog v-model="importDialogVisible" title="导入" width="min(668px, 94vw)" class="import-dialog" :close-on-click-modal="false" @closed="resetImport">
      <div class="import-steps">
        <section class="import-step">
          <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
            <path d="M14 10a3 3 0 0 1 3-3h22l11 11v36a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3z" fill="#fff" stroke="#dcdcdc" stroke-width="2" />
            <path d="M39 7v11h11z" fill="#ededed" />
            <rect x="22" y="26" width="20" height="3" rx="1.5" fill="#e8e8e8" />
            <rect x="22" y="34" width="13" height="3" rx="1.5" fill="#e8e8e8" />
            <circle cx="24" cy="47" r="9" fill="#dedede" />
            <path d="M24 42.5v8.5m-3.4-3.4 3.4 3.4 3.4-3.4" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <p>1、下载模版，填写信息</p>
          <el-button class="step-button solid" :loading="templateBusy" @click="downloadTemplate">下载模版</el-button>
        </section>
        <section class="import-step">
          <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
            <path d="M9 17a3 3 0 0 1 3-3h12l6 6h22a3 3 0 0 1 3 3v27a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3z" fill="#f6bfd1" />
            <path d="M9 27h46v23a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3z" fill="#fbdae4" />
            <path d="M32 45V28m0 0-6.5 6.5M32 28l6.5 6.5" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <p>2、上传填写好的文件</p>
          <el-button class="step-button soft" @click="importInput?.click()">{{ importFile ? '重新上传' : '上传文件' }}</el-button>
          <small v-if="importFile" class="file-name" :title="importFile.name">{{ importFile.name }}</small>
        </section>
      </div>
      <p class="import-hint">模版是 Excel，也支持 .csv。一行填一个时段，同一门店同一生效日期的多行会合并成一条需求；导入是新增，不会改动已有需求。</p>
      <div v-if="importStats && !importErrors.length" class="import-result">
        <el-icon><CircleCheck /></el-icon>
        <span>已读取 {{ importStats.requirements }} 条需求 · {{ importStats.slots }} 个时段 · {{ importStats.storeNames.join('、') }}</span>
      </div>
      <ul v-if="importErrors.length" class="import-errors">
        <li v-for="(error, index) in visibleErrors" :key="`${error.line}-${error.message}-${index}`">{{ error.line ? `第 ${error.line} 行：` : '' }}{{ error.message }}</li>
        <li v-if="importErrors.length > visibleErrors.length" class="more">另外还有 {{ importErrors.length - visibleErrors.length }} 处问题，请先在文件里改完再上传</li>
      </ul>
      <input ref="importInput" type="file" accept=".xlsx,.xls,.csv" hidden @change="handleImportFile" />
      <template #footer>
        <el-button class="import-close" @click="importDialogVisible = false">关闭</el-button>
        <el-button class="import-submit" :disabled="!canSubmit" @click="submitImport">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CircleCheck, Clock, Delete, Download, Plus, Search, Upload } from '@element-plus/icons-vue'
import { parttimeStore, stores, employees, weekdayOptions, dateKey, addDays, latestPublicationDate, publicationWindow, saveRequirement, deleteRequirementSlot, durationLabel, slotRemaining, publishTasks, publishTemporaryTask, dispatchPendingNeed, needAssignments, validateRequirement, policyById, policyNameOf, previewPublication, eligibilityError } from '../stores/parttimeTasks'
import { DEFAULT_POLICY_ID, openStageCountOn } from '../stores/parttimePolicies'
import { SHEET_COLS, templateRows, exportRows, parseScheduleRows, guideRows } from '../stores/parttimeScheduleSheet'

import { usePager } from '../composables/usePager.js'
import TablePagination from '../components/TablePagination.vue'
import AssignmentPolicyPanel from './parttime-account-manager/AssignmentPolicyPanel.vue'
const router = useRouter()
const route = useRoute()
const importInput = ref(null)
const activeTab = ref(route.name === 'parttime-task-publication' ? 'publication' : 'requirements')
const isPublicationRoute = computed(() => route.name === 'parttime-task-publication')
// 页面级两个视图：时段需求（门店 × 时段，配要几个人；下分周期时段 / 临时时段）与分配策略（模块级规则，不跟门店走）
const pageTab = ref(route.query.tab === 'policies' ? 'policies' : 'tasks')
const policyTab = ref(route.query.sub === 'usage' ? 'usage' : 'library')
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
const downloadWorkbook = async (rows, filename) => {
  const XLSX = await import('xlsx')
  const workbook = XLSX.utils.book_new()
  const sheet = XLSX.utils.aoa_to_sheet(rows)
  sheet['!cols'] = SHEET_COLS
  XLSX.utils.book_append_sheet(workbook, sheet, '排班配置')
  const guide = XLSX.utils.aoa_to_sheet(guideRows())
  guide['!cols'] = [{ wch: 110 }]
  XLSX.utils.book_append_sheet(workbook, guide, '填写说明')
  XLSX.writeFile(workbook, filename)
  return workbook
}
const templateBusy = ref(false)
const downloadTemplate = async () => {
  templateBusy.value = true
  try {
    await downloadWorkbook(templateRows({ store: selectedStore.value, weekdays: weekdayOptions }), `${selectedStore.value.code}-${selectedStore.value.name}-排班配置模版.xlsx`)
    ElMessage.success('模版已下载，填好后回到这里上传')
  } catch {
    ElMessage.error('模版下载失败，请重试')
  } finally {
    templateBusy.value = false
  }
}
const exportSchedule = async () => {
  const requirements = parttimeStore.requirements.filter(requirement => requirement.storeId === selectedStoreId.value)
  if (!requirements.length) return ElMessage.warning('该门店还没有时段需求，先下载模版填写')
  try {
    await downloadWorkbook(exportRows(requirements, stores, weekdayOptions, parttimeStore.policies), `${selectedStore.value.code}-${selectedStore.value.name}-排班配置.xlsx`)
    ElMessage.success(`已导出${selectedStore.value.name}的排班配置`)
  } catch {
    ElMessage.error('导出失败，请重试')
  }
}
/* 导入：下载模版 → 上传 → 校验 → 提交，一次性写入 */
const importDialogVisible = ref(false)
const importFile = ref(null)
const importDrafts = ref([])
const importErrors = ref([])
const importStats = ref(null)
const importBusy = ref(false)
const visibleErrors = computed(() => importErrors.value.slice(0, 6))
const canSubmit = computed(() => importDrafts.value.length > 0 && !importErrors.value.length && !importBusy.value)
const openImport = () => { resetImport(); importDialogVisible.value = true }
const resetImport = () => { importFile.value = null; importDrafts.value = []; importErrors.value = []; importStats.value = null }
const toRequirement = draft => ({ storeId: draft.storeId, remark: draft.remark, startDate: draft.startDate, endDate: draft.endDate, enabled: true, days: JSON.parse(JSON.stringify(draft.days)) })
const decodeCsv = buffer => {
  const utf8 = new TextDecoder('utf-8').decode(buffer)
  if (!utf8.includes('\uFFFD')) return utf8
  try { return new TextDecoder('gbk').decode(buffer) } catch { return utf8 }
}
const handleImportFile = async event => {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  importBusy.value = true
  importFile.value = file
  importDrafts.value = []
  importErrors.value = []
  importStats.value = null
  try {
    const XLSX = await import('xlsx')
    const buffer = await file.arrayBuffer()
    const payload = file.name.toLowerCase().endsWith('.csv') ? decodeCsv(buffer) : buffer
    const workbook = XLSX.read(payload, { type: typeof payload === 'string' ? 'string' : 'array' })
    const sheetName = workbook.SheetNames.includes('排班配置') ? '排班配置' : workbook.SheetNames[0]
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, raw: true, blankrows: false, defval: '' })
    const parsed = parseScheduleRows(rows, { stores, weekdays: weekdayOptions, policies: parttimeStore.policies })
    const conflicts = parsed.drafts
      .map(draft => ({ draft, error: validateRequirement(toRequirement(draft)) }))
      .filter(item => item.error)
      .map(item => ({ line: item.draft.line, message: `${item.draft.storeName} ${item.draft.startDate} 起：${item.error}` }))
    importDrafts.value = parsed.drafts
    importStats.value = parsed.stats
    importErrors.value = [...parsed.errors, ...conflicts].sort((a, b) => (a.line || 0) - (b.line || 0))
  } catch {
    importErrors.value = [{ line: 0, message: '文件读不出来，请确认是用下载的模版填写的 Excel 或 CSV' }]
  } finally {
    importBusy.value = false
  }
}
const submitImport = () => {
  if (!canSubmit.value) return
  const failures = []
  let imported = 0
  for (const draft of importDrafts.value) {
    const error = saveRequirement(toRequirement(draft))
    if (error) failures.push({ line: draft.line, message: `${draft.storeName} ${draft.startDate} 起：${error}` })
    else imported += 1
  }
  if (failures.length) {
    importErrors.value = failures
    if (imported) ElMessage.warning(`已导入 ${imported} 条，${failures.length} 条没导入`)
    return
  }
  const firstStoreId = importDrafts.value[0]?.storeId
  importDialogVisible.value = false
  if (firstStoreId && stores.some(store => store.id === firstStoreId)) selectedStoreId.value = firstStoreId
  activeTab.value = 'requirements'
  ElMessage.success(`已导入 ${imported} 条时段需求，已发布的任务保持原安排`)
}
const removeSlot = async row => {
  const weekday = selectedDay.value
  try { await ElMessageBox.confirm(`作废${weekdayOptions.find(day => day.value === weekday).label} ${row.startTime} - ${row.endTime} 的需求？仅影响后续任务发布，已发布任务保持原安排。`, '作废时段', { confirmButtonText: '确认作废', cancelButtonText: '取消', type: 'warning' }) } catch { return }
  if (deleteRequirementSlot(row.requirement.id, weekday, row.slotIndex)) ElMessage.success('时段需求已作废')
}
const releaseTab = ref('current')
// 本期 = 最近一次已执行的那一批（发布日已到 / 已过），未来批次还没执行，不算本期
const currentPublication = computed(() => {
  const todayKey = dateKey(new Date())
  const executed = parttimeStore.publications.filter(item => item.releaseDate <= todayKey)
  const pool = executed.length ? executed : parttimeStore.publications
  return [...pool].sort((a, b) => b.releaseDate.localeCompare(a.releaseDate))[0] || null
})
const currentSlots = computed(() => currentPublication.value ? parttimeStore.slots.filter(slot => slot.releaseDate === currentPublication.value.releaseDate) : [])
const currentRemaining = computed(() => currentSlots.value.reduce((sum, slot) => sum + slotRemaining(slot), 0))
/* 「此刻开放档位」按每条任务自己的策略计时（累计开放：起点已到的档都算）；每 30 秒刷一次 */
const now = ref(new Date())
const stageClock = setInterval(() => { now.value = new Date() }, 30000)
onUnmounted(() => clearInterval(stageClock))
const stageStarted = slot => new Date(`${slot.date}T${slot.startTime}:00`) <= now.value
const stageNowText = slot => {
  if (stageStarted(slot)) return '已开始'
  const count = openStageCountOn(policyById(slot.policyId), slot, currentPublication.value, now.value)
  return count ? `已开 ${count} 档` : '未开放'
}
const nextReleaseDate = computed(() => addDays(latestPublicationDate(), 7))
const nextWindow = computed(() => publicationWindow(nextReleaseDate.value))

/* 手动发布：批次只能选未来两周内的两个周四（最近 n+1 周）；该批已发布时按当前需求覆盖 */
const manualPublishVisible = ref(false)
const manualForm = ref({ releaseDate: '', storeIds: [] })
const manualBatches = computed(() => [latestPublicationDate(), addDays(latestPublicationDate(), 7)].map(releaseDate => {
  const window = publicationWindow(releaseDate)
  const published = parttimeStore.publications.some(item => item.releaseDate === releaseDate)
  return { releaseDate, window, published }
}))
const manualBatchHint = computed(() => {
  const batch = manualBatches.value.find(item => item.releaseDate === manualForm.value.releaseDate)
  if (!batch) return '先选一个发布批次'
  const count = previewPublication(batch.releaseDate).filter(slot => !manualForm.value.storeIds.length || manualForm.value.storeIds.includes(slot.storeId)).length
  return `将生成 ${count} 个时段 · ${batch.window.start} 至 ${batch.window.end}${batch.published ? '；该批已发布，确认后覆盖' : ''}`
})
const openManualPublish = () => {
  // 默认落在下周四那一批（最近一次还没执行/最可能要补的），没有就更远一批
  const preferred = manualBatches.value.find(batch => !batch.published) || manualBatches.value[manualBatches.value.length - 1]
  manualForm.value = { releaseDate: preferred?.releaseDate || '', storeIds: [] }
  manualPublishVisible.value = true
}
const submitManualPublish = () => {
  if (!manualForm.value.releaseDate) return ElMessage.warning('请选择发布批次')
  const published = manualBatches.value.find(batch => batch.releaseDate === manualForm.value.releaseDate)?.published
  const error = publishTasks(manualForm.value.releaseDate, published ? '手动发布（覆盖）' : '手动发布', { storeIds: manualForm.value.storeIds, overwrite: true })
  if (error) return ElMessage.warning(error)
  manualPublishVisible.value = false
  ElMessage.success(published ? '该批任务已按当前时段需求覆盖生成' : '任务已发布')
}
const publicationRecords = computed(() => [...parttimeStore.publications].sort((a, b) => b.releaseDate.localeCompare(a.releaseDate)))
const needFilter = ref('全部')
const sourceTextOf = need => need.sourceLabel || ({ 临时时段: '临时时段', 非全无法履约: '取消后重派', 全职请假: '请假接班生成' }[need.source] || need.source)
const filteredNeeds = computed(() => [...parttimeStore.temporaryNeeds].reverse().map(need => {
  const tasks = needAssignments(need)
  const assignedCount = tasks.length
  const picked = need.employeeIds || []
  const scopeNames = picked.map(id => employees.find(person => person.id === id)?.name || '').filter(Boolean).join('、')
  return { ...need, sourceText: sourceTextOf(need), assignedCount, scopeText: picked.length ? `指定 ${picked.length} 人` : '本店非全客户经理', scopeNames, assignedNames: tasks.map(task => employees.find(person => person.id === task.assigneeId)?.name || task.assigneeName).join('、') || '-', dispatchStatus: assignedCount >= (need.quota || 1) ? '已派发' : assignedCount ? '部分派发' : '待派发' }
}).filter(need => needFilter.value === '全部' || need.dispatchStatus === needFilter.value))
const temporaryDialogVisible = ref(false)
const emptyTemporaryForm = () => ({ storeId: selectedStoreId.value, date: addDays(dateKey(new Date()), 1), startTime: '10:00', endTime: '12:00', quota: 1, scopeMode: 'auto', employeeIds: [], remark: '' })
const temporaryForm = ref(emptyTemporaryForm())
/* 可选的人只有一类：与当前门店签约的非全客户经理；当天已经排了交叉时段的人直接置灰并写明原因 */
const temporaryCandidates = computed(() => {
  const form = temporaryForm.value
  const slot = { storeId: form.storeId, date: form.date, startTime: form.startTime, endTime: form.endTime }
  const ready = form.date && form.startTime && form.endTime
  return employees
    .filter(person => person.position === 'am' && person.signedStoreIds.includes(form.storeId))
    .map(person => ({ id: person.id, name: person.name, intent: person.intent, conflict: ready ? eligibilityError(person.id, slot) : '' }))
})
watch(() => temporaryForm.value.employeeIds, ids => {
  if (temporaryForm.value.scopeMode === 'picked') temporaryForm.value.quota = Math.max(1, ids.length)
}, { deep: true })
watch(() => temporaryForm.value.storeId, () => { temporaryForm.value.employeeIds = [] })
const openTemporaryDialog = () => { temporaryForm.value = emptyTemporaryForm(); temporaryDialogVisible.value = true }
const publishTemporary = () => {
  const form = temporaryForm.value
  if (form.scopeMode === 'picked' && !form.employeeIds.length) return ElMessage.warning('请选择指定承接人，或改回「本店签约非全客户经理」')
  const result = publishTemporaryTask(form)
  if (result.error) return ElMessage.warning(result.error)
  temporaryDialogVisible.value = false
  ElMessage.success(`临时时段已发布，已派发 ${result.tasks.length} / ${result.need.quota} 人`)
}
const retryDispatch = need => {
  const tasks = dispatchPendingNeed(need.id)
  if (!tasks.length) return ElMessage.warning(need.employeeIds?.length ? '指定的人员此时不满足条件（时段冲突 / 当日累计超 4 小时 / 门店不在签约范围），可改派或等其空出时段' : '暂无符合门店、时段及工时条件的客户经理')
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
.page-tabs { display: inline-flex; gap: 4px; margin: 0 0 20px; padding: 4px; border-radius: 8px; background: #f6f4f5; }
.page-tabs button { min-width: 104px; padding: 8px 18px; border: 0; border-radius: 6px; background: transparent; color: #555; font: inherit; font-size: 14px; cursor: pointer; }
.page-tabs button.active { background: #a40035; color: #fff; font-weight: 600; }
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
.publication-policy .manual-publish { margin-left: auto; }
.manual-hint { margin: 6px 0 0; font-size: 12px; color: #909399; }
.batch-group { display: flex; flex-direction: column; gap: 8px; width: 100%; }
.batch-radio { height: auto; margin-right: 0; padding: 8px 12px; border: 1px solid #ebeef5; border-radius: 6px; align-items: flex-start; }
.batch-radio :deep(.el-radio__label) { display: flex; flex-direction: column; line-height: 1.6; }
.batch-title { color: #303133; font-size: 13px; font-weight: 600; }
.batch-sub { color: #909399; font-size: 12px; }
.manual-warn { margin-top: 6px; padding: 10px 12px; border-radius: 4px; background: #fdf6ec; color: #926200; font-size: 12.5px; line-height: 1.8; }
.publication-next { display: flex; gap: 32px; flex-wrap: wrap; font-size: 13px; color: #666; padding: 12px 14px; background: #fafafa; border: 1px solid #f0f0f0; border-radius: 4px; }
.publication-next strong { color: #303133; font-weight: 600; }
.release-tabs :deep(.el-tabs__header) { margin: 18px 0 4px; }
.release-tabs :deep(.el-tabs__item) { font-size: 14px; }
.table-note { font-size: 12px; color: #909399; margin: 10px 0 0; }
.publication-summary { display: flex; gap: 32px; margin: 20px 0; font-size: 14px; } .publication-summary strong { color: #a40035; margin-left: 8px; }
.temporary-filters { margin: 0 0 20px; } .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.scope-modes { display: flex; gap: 18px; }
.scope-hint { flex-basis: 100%; width: 100%; margin: 2px 0 0; font-size: 12.5px; color: #909399; line-height: 1.7; }
.scope-hint.inline { flex-basis: auto; width: auto; margin: 0 0 0 10px; }
.candidate-sub { float: right; margin-left: 12px; font-size: 12px; color: #a8abb2; }
.temporary-table .cell-sub { display: block; margin-top: 3px; font-size: 12px; color: #909399; }
.temporary-table .cell-warn { color: #b45309; }
.slot-editor-heading { display: flex; justify-content: space-between; align-items: center; margin: 16px 0; }
.slot-editor { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
.slot-editor .el-select { width: 140px; } .slot-editor .el-input-number { width: 120px; }
.slot-editor .slot-policy { width: 152px; }
.week-policy { color: #a40035 !important; }
.stage-now { color: #247354; font-size: 12.5px; } .stage-now.closed { color: #909399; }
.copy-days { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: 22px; border-top: 1px solid #eee; padding-top: 16px; }
.copy-days .el-checkbox { margin-right: 12px; } .split-preview { display: flex; flex-direction: column; gap: 10px; background: #f7f7f7; padding: 14px; border-radius: 6px; font-size: 13px; }
.import-dialog :deep(.el-dialog__header) { padding: 20px 28px 8px; margin: 0; }
.import-dialog :deep(.el-dialog__title) { font-size: 18px; font-weight: 600; color: #303133; }
.import-dialog :deep(.el-dialog__body) { padding: 8px 28px 0; }
.import-dialog :deep(.el-dialog__footer) { padding: 20px 28px 26px; text-align: center; }
.import-steps { display: grid; grid-template-columns: 1fr 1fr; gap: 34px; }
.import-step { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; min-height: 252px; padding: 30px 16px; background: #f6f6f7; border-radius: 4px; }
.import-step p { margin: 0; font-size: 14px; color: #606266; }
.step-button { width: 106px; height: 34px; border-radius: 4px; font-size: 13px; }
.step-button.solid { background: #a40035; border-color: #a40035; color: #fff; }
.step-button.solid:hover, .step-button.solid:focus { background: #8d002d; border-color: #8d002d; color: #fff; }
.step-button.soft { background: #f7e3ea; border-color: #f7e3ea; color: #a40035; }
.step-button.soft:hover, .step-button.soft:focus { background: #f1d3de; border-color: #f1d3de; color: #a40035; }
.file-name { max-width: 210px; font-size: 12px; color: #909399; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.import-hint { margin: 16px 0 0; font-size: 12px; line-height: 1.9; color: #909399; }
.import-result { display: flex; align-items: center; gap: 8px; margin-top: 12px; padding: 10px 12px; border-radius: 4px; background: #eef7f1; color: #247354; font-size: 13px; }
.import-errors { margin: 12px 0 0; padding: 10px 12px 10px 28px; border-radius: 4px; background: #fdf3f4; color: #b03a47; font-size: 12px; line-height: 1.9; max-height: 148px; overflow-y: auto; }
.import-errors .more { list-style: none; margin-left: -16px; color: #a94442; }
.import-close, .import-submit { width: 108px; height: 38px; border-radius: 4px; }
.import-close { background: #f2f2f3; border-color: #f2f2f3; color: #606266; }
.import-close:hover { background: #e9e9ea; border-color: #e9e9ea; color: #303133; }
.import-submit { background: #a40035; border-color: #a40035; }
.import-submit:hover { background: #8d002d; border-color: #8d002d; }
.import-submit.is-disabled, .import-submit.is-disabled:hover { background: #f3c9d7; border-color: #f3c9d7; color: #fff; }
@media (max-width: 1000px) { .configuration-layout { grid-template-columns: 190px minmax(0, 1fr); } .configuration-content { padding-left: 16px; } .week-overview { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
@media (max-width: 600px) { .import-steps { grid-template-columns: minmax(0, 1fr); gap: 16px; } .import-step { min-height: 180px; } .task-management { padding: 16px; } .management-header { align-items: flex-start; flex-wrap: wrap; } .scope-toolbar { flex-wrap: wrap; } .scope-toolbar .el-input { width: 100%; } .configuration-layout { grid-template-columns: minmax(0, 1fr); } .store-list { border-right: 0; margin-bottom: 16px; } .store-list-body { display: flex; gap: 8px; overflow-x: auto; max-height: none; padding-bottom: 4px; } .store-list-header { display: none; } .store-option { min-width: 180px; border: 1px solid #eee; border-left: 3px solid transparent; } .store-option.selected { border-left-color: #a40035; } .configuration-content { padding-left: 0; } .week-overview { grid-template-columns: repeat(2, minmax(0, 1fr)); } .slot-editor { flex-wrap: wrap; } .form-grid { grid-template-columns: minmax(0, 1fr); gap: 0; } }
</style>
