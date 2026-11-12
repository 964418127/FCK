<template>
  <div class="policy-panel">
    <el-tabs v-model="activeTab" class="policy-tabs">
      <el-tab-pane label="策略库" name="library">
        <div class="section-heading">
          <div>
            <h2>策略库</h2>
            <p>一条策略 = 一串档位：每类人<strong>从哪个时刻起</strong>看得到。档位累计开放 —— 后面的档到点只加不放，先开的档不会关。时段挂哪条策略在「时段需求」里配，任务生成时按那一刻的策略快照继承</p>
          </div>
          <el-button type="primary" :icon="Plus" @click="editPolicy()">新建策略</el-button>
        </div>
        <div class="policy-list">
          <article v-for="policy in parttimeStore.policies" :key="policy.id" class="policy-card">
            <header>
              <div class="policy-title">
                <h3>{{ policy.name }}</h3>
                <span v-if="policy.builtin" class="policy-tag">内置</span>
                <span class="policy-usage">{{ policyUsage(policy.id) }} 个时段在用</span>
              </div>
              <div class="policy-actions">
                <el-button link type="primary" @click="filterByPolicy(policy)">看用它的时段</el-button>
                <el-button link type="primary" @click="editPolicy(policy)">编辑</el-button>
                <el-button link type="primary" @click="copyPolicy(policy)">复制</el-button>
                <el-button v-if="!policy.builtin" link type="danger" @click="removePolicy(policy)">删除</el-button>
              </div>
            </header>
            <p class="policy-remark">{{ policy.remark || '没有补充说明' }}</p>
            <div class="policy-stages">
              <template v-for="(stage, index) in policy.stages" :key="stage.id || index">
                <span class="policy-stage"><b>{{ index + 1 }}</b><i>|</i>{{ stageText(stage) }}</span>
                <el-icon v-if="index < policy.stages.length - 1" class="policy-arrow"><Right /></el-icon>
              </template>
            </div>
            <p class="policy-exception"><span class="exception-tag">异常补人</span>{{ describeException(policy) }}</p>
            <p class="policy-note">档位累计开放：到点的档全部可见可接，不是「换一档关一档」。所有档都开放后仍没人接：任务停在未承接，由临时时段补人；系统不按业绩自动派。</p>
          </article>
        </div>
        <p class="table-note">人群只有三类：本店签约非全客户经理、本店非全推拿师、本店全职推拿师。跨店非全客户经理要另签承接协议，本版不提供；全职客户经理的班次在原有排班系统里排，不进这个池。</p>
      </el-tab-pane>

      <el-tab-pane label="应用时段" name="usage">
        <div class="section-heading">
          <div>
            <h2>应用时段</h2>
            <p>哪些时段挂了哪条策略、会不会有档位接不到，在这一页一次看完</p>
          </div>
        </div>
        <div class="usage-toolbar">
          <el-select v-model="usagePolicy" aria-label="按策略筛选" style="width: 220px">
            <el-option label="全部策略" value="全部" />
            <el-option v-for="policy in parttimeStore.policies" :key="policy.id" :label="policy.name" :value="policy.id" />
          </el-select>
          <el-select v-model="usageStore" aria-label="按门店筛选" style="width: 200px">
            <el-option label="全部门店" value="全部" />
            <el-option v-for="store in stores" :key="store.id" :label="store.name" :value="store.id" />
          </el-select>
          <span class="usage-summary">{{ usageRows.length }} 个时段 · {{ usageRows.filter(row => row.policyId === DEFAULT_POLICY_ID).length }} 个在用内置默认策略</span>
        </div>
        <el-table :data="usageRows" empty-text="没有符合条件的时段">
          <el-table-column label="门店" min-width="150">
            <template #default="{ row }"><div>{{ row.storeName }}</div><small class="cell-sub">{{ row.storeCode }}</small></template>
          </el-table-column>
          <el-table-column prop="weekday" label="星期" width="80" />
          <el-table-column label="时段" width="130"><template #default="{ row }">{{ row.startTime }} - {{ row.endTime }}</template></el-table-column>
          <el-table-column prop="quota" label="名额" width="70" />
          <el-table-column label="分配策略" min-width="180" show-overflow-tooltip><template #default="{ row }">{{ row.policyName }}</template></el-table-column>
          <el-table-column label="生效期间" min-width="200"><template #default="{ row }">{{ row.startDate }} 至 {{ row.endDate || '不限结束日期' }}</template></el-table-column>
          <el-table-column label="状态" width="90"><template #default="{ row }"><span :class="['usage-label', row.voidedAt || !row.enabled ? 'inactive' : 'active']">{{ row.voidedAt ? '已作废' : row.enabled ? '启用' : '停用' }}</span></template></el-table-column>
        </el-table>
        <p class="table-note">这一页只读：改策略去「策略库」，换时段挂的策略去「时段需求 · 周期时段」。改完只影响还没生成的周期，已生成的任务按快照走。</p>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="policyDialogVisible" :title="policyForm.id ? '编辑分配策略' : '新建分配策略'" width="min(720px, 94vw)">
      <el-form label-position="top">
        <el-form-item label="策略名称"><el-input v-model="policyForm.name" maxlength="20" show-word-limit placeholder="如：非全优先 · 推拿师兜底" /></el-form-item>
        <el-form-item label="说明（选填）"><el-input v-model="policyForm.remark" type="textarea" :rows="2" maxlength="120" show-word-limit /></el-form-item>
        <div class="stage-editor-heading"><span>档位（按开放起点排序 · 累计开放）</span><el-button size="small" :icon="Plus" @click="addStage">添加档位</el-button></div>
        <div v-for="(stage, index) in policyForm.stages" :key="index" class="stage-editor">
          <span class="stage-index">{{ index + 1 }}</span>
          <el-select v-model="stage.audience" style="width: 200px" aria-label="档位人群"><el-option v-for="audience in AUDIENCES" :key="audience.key" :label="audience.short" :value="audience.key" /></el-select>
          <el-select v-model="stage.mode" style="width: 150px" aria-label="开放方式"><el-option v-for="mode in STAGE_MODES" :key="mode.key" :label="mode.label" :value="mode.key" /></el-select>
          <el-time-select v-if="stage.mode === 'day'" v-model="stage.at" start="00:00" step="00:30" end="23:30" style="width: 128px" placeholder="开放时间" />
          <span v-else class="stage-fixed">发布那一刻</span>
          <el-button :icon="Delete" circle :disabled="policyForm.stages.length === 1" @click="policyForm.stages.splice(index, 1)" />
        </div>
        <p class="stage-preview">档位链：{{ describePolicy(policyForm) }}</p>
        <p class="stage-hint">档位是<strong>累计开放</strong>：下一档到点后，前面档的人群照样可见可接 —— 档位只决定「从什么时候起能看」，不轮流独占。定时档按<strong>排班日当天</strong>的钟点算，且必须早于时段开始；保存时会拿正在用它的时段逐条再校一遍。</p>

        <div class="exception-editor">
          <div class="stage-editor-heading">
            <span>异常补人 · 提前下线后剩下的那段</span>
            <el-switch v-model="policyForm.exception.enabled" />
          </div>
          <template v-if="policyForm.exception.enabled">
            <div class="exception-row">
              <span>可用工时 ≥</span>
              <el-select v-model="policyForm.exception.minWorkMinutes" style="width: 150px" aria-label="补人门槛">
                <el-option v-for="item in minWorkOptions" :key="item" :label="minutesLabel(item)" :value="item" />
              </el-select>
              <span class="exception-sep">扣通勤 30 分钟（固定）</span>
            </div>
            <div class="exception-row">
              <span>本店非全客户经理都不行时</span>
              <el-select v-model="policyForm.exception.fallback" style="width: 280px" aria-label="兜底人群">
                <el-option v-for="item in FALLBACKS" :key="item.key" :label="item.label" :value="item.key" />
              </el-select>
            </div>
            <p class="stage-hint">
              剩余时长先扣固定 30 分钟通勤，再和门槛比：不够就不补人，原任务按实际离店截断，空档留记录。
              够就先生成一条「提前下线补人」的时段需求，先派本店签约非全客户经理，派不出去才落兜底人群。
            </p>
          </template>
          <p v-else class="stage-hint">关闭后提前下线不再补人，剩余时段直接留空档。</p>
        </div>
      </el-form>
      <template #footer><el-button @click="policyDialogVisible = false">取消</el-button><el-button type="primary" @click="savePolicyForm">保存策略</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Plus, Right } from '@element-plus/icons-vue'
import { parttimeStore, stores, weekdayOptions, policyNameOf, policyUsage, savePolicy, deletePolicy } from '../../stores/parttimeTasks'
import { AUDIENCES, STAGE_MODES, DEFAULT_POLICY_ID, DEFAULT_EXCEPTION, FALLBACKS, describePolicy, describeException, exceptionOf, stageText } from '../../stores/parttimePolicies'

const props = defineProps({ initialTab: { type: String, default: 'library' }, policyFilter: { type: String, default: '' }, storeFilter: { type: String, default: '' } })
const activeTab = ref(props.initialTab === 'usage' ? 'usage' : 'library')
watch(() => props.initialTab, tab => { activeTab.value = tab === 'usage' ? 'usage' : 'library' })

const policyDialogVisible = ref(false)
const minutesLabel = value => Number(value) < 60 ? `${value} 分钟` : `${Math.floor(value / 60)} 小时${value % 60 ? ` ${value % 60} 分` : ''}`
const minWorkOptions = Array.from({ length: 8 }, (_, index) => (index + 1) * 30)
const emptyStage = () => ({ audience: 'am-parttime', mode: 'publish', at: '10:00' })
const emptyPolicy = () => ({ name: '', remark: '', stages: [emptyStage()], exception: { ...DEFAULT_EXCEPTION } })
const policyForm = ref(emptyPolicy())
const editPolicy = policy => {
  policyForm.value = policy ? JSON.parse(JSON.stringify(policy)) : emptyPolicy()
  if (!policyForm.value.stages?.length) policyForm.value.stages = [emptyStage()]
  policyForm.value.exception = exceptionOf(policyForm.value)
  policyDialogVisible.value = true
}
const copyPolicy = policy => editPolicy({ ...policy, id: '', name: `${policy.name} 副本` })
const bumpTime = (time, minutes) => {
  const [hours, mins] = String(time || '09:00').split(':').map(Number)
  const total = Math.min(23 * 60 + 30, hours * 60 + mins + minutes)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}
const addStage = () => {
  const last = policyForm.value.stages[policyForm.value.stages.length - 1]
  policyForm.value.stages.push({ audience: '', mode: 'day', at: last?.mode === 'day' ? bumpTime(last.at, 120) : '09:00' })
}
const savePolicyForm = () => {
  const error = savePolicy(policyForm.value)
  if (error) return ElMessage.warning(error)
  policyDialogVisible.value = false
  ElMessage.success('策略已保存，已生成的任务保持原安排')
}
const removePolicy = async policy => {
  try { await ElMessageBox.confirm(`删除策略「${policy.name}」？正在使用它的时段需要先改成别的策略。`, '删除策略', { confirmButtonText: '确认删除', cancelButtonText: '取消', type: 'warning' }) } catch { return }
  const error = deletePolicy(policy.id)
  if (error) return ElMessage.warning(error)
  ElMessage.success('策略已删除')
}

/* 应用时段：把所有门店、所有星期的时段摊成一张表，回答「谁在用哪条策略」 */
const usagePolicy = ref(props.policyFilter || '全部')
const usageStore = ref(props.storeFilter || '全部')
watch(() => props.policyFilter, value => { if (value) usagePolicy.value = value })
const filterByPolicy = policy => { usagePolicy.value = policy.id; activeTab.value = 'usage' }
const allUsageRows = computed(() => parttimeStore.requirements.flatMap(requirement => {
  const store = stores.find(item => item.id === requirement.storeId) || {}
  return weekdayOptions.flatMap(day => (requirement.days[day.value] || []).map(row => ({
    key: `${requirement.id}-${day.value}-${row.startTime}`,
    storeId: requirement.storeId, storeName: store.name, storeCode: store.code, weekday: day.label,
    startTime: row.startTime, endTime: row.endTime, quota: row.quota,
    policyId: row.policyId || DEFAULT_POLICY_ID, policyName: policyNameOf(row.policyId),
    startDate: requirement.startDate, endDate: requirement.endDate || '',
    enabled: requirement.enabled, voidedAt: row.voidedAt || ''
  }))).sort((a, b) => a.startTime.localeCompare(b.startTime))
}).sort((a, b) => a.storeName.localeCompare(b.storeName) || weekdayOptions.findIndex(day => day.label === a.weekday) - weekdayOptions.findIndex(day => day.label === b.weekday)))
const usageRows = computed(() => allUsageRows.value.filter(row =>
  (usagePolicy.value === '全部' || row.policyId === usagePolicy.value) &&
  (usageStore.value === '全部' || row.storeId === usageStore.value)))
</script>

<style scoped>
.policy-panel { min-width: 0; }
.section-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
h2 { font-size: 17px; margin: 0; } h3 { font-size: 15px; }
p { margin: 6px 0 0; color: #777; font-size: 13px; }
.policy-tabs :deep(.el-tabs__header) { margin-bottom: 22px; }
.policy-tabs :deep(.el-tabs__item) { font-size: 14px; }
.policy-list { display: grid; gap: 12px; }
.policy-card { padding: 16px 18px; border: 1px solid #eee; border-radius: 6px; background: #fff; }
.policy-card header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.policy-title { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.policy-title h3 { margin: 0; font-size: 15px; }
.policy-tag { padding: 1px 7px; border-radius: 9px; background: #f3f0f2; color: #8a8589; font-size: 11px; }
.policy-usage { color: #909399; font-size: 12px; }
.policy-actions { display: flex; align-items: center; gap: 4px; }
.policy-remark { margin: 8px 0 0; color: #777; font-size: 12.5px; }
.policy-stages { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
.policy-stage { display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; border-radius: 4px; background: #faf3f6; color: #7d1230; font-size: 12.5px; }
.policy-stage b { font-size: 12.5px; font-weight: 700; color: #a40035; }
.policy-stage i { font-style: normal; color: #d8bcc7; margin: 0 1px; }
.policy-arrow { color: #c8c4c6; }
.policy-note { margin: 12px 0 0; padding-top: 10px; border-top: 1px dashed #eee; color: #909399; font-size: 12px; }
.policy-exception { display: flex; align-items: center; gap: 8px; margin: 10px 0 0; color: #6b5b60; font-size: 12px; }
.exception-tag { flex: none; padding: 1px 7px; border-radius: 9px; background: #fdf2f5; color: #a40035; font-size: 11px; }
.exception-editor { margin-top: 18px; padding: 14px 16px 6px; border: 1px solid #f0e6ea; border-radius: 6px; background: #fdfbfc; }
.exception-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font-size: 12.5px; color: #606266; flex-wrap: wrap; }
.exception-sep { margin-left: 8px; color: #909399; }
.table-note { font-size: 12px; color: #909399; margin: 12px 0 0; }
.usage-toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.usage-summary { color: #909399; font-size: 12.5px; }
.usage-label { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 12px; line-height: 18px; white-space: nowrap; }
.usage-label.active { color: #247354; background: #eaf5ef; }
.usage-label.inactive { color: #777; background: #f1f1f1; }
.cell-sub { display: block; margin-top: 3px; font-size: 12px; color: #909399; }
.stage-editor-heading { display: flex; align-items: center; justify-content: space-between; margin: 8px 0 12px; font-size: 13px; color: #606266; }
.stage-editor { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.stage-index { width: 20px; height: 20px; border-radius: 50%; background: #a40035; color: #fff; font-size: 11px; display: inline-flex; align-items: center; justify-content: center; }
.stage-fixed { width: 128px; color: #909399; font-size: 12.5px; }
.stage-preview { margin: 14px 0 0; padding: 10px 12px; background: #fafafa; border-radius: 4px; color: #303133; font-size: 12.5px; }
.stage-hint { margin: 8px 0 0; color: #909399; font-size: 12px; }
@media (max-width: 760px) { .section-heading { align-items: flex-start; flex-wrap: wrap; } .stage-editor { flex-wrap: wrap; } }
</style>
