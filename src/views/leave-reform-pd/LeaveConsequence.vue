<template>
  <div class="lc-page">
    <div class="page-header">
      <div class="header-main">
        <h1>请假后果</h1>
        <el-tag type="warning" effect="plain" size="small">预设计 v2 · 非结论</el-tag>
      </div>
    </div>

    <div class="lane-strip">
      <div class="lane">
        <span class="lane-key">额度后果</span>
        <span class="lane-arrow">→</span>
        <span class="lane-target">薪酬</span>
        <span class="lane-note">休假时长 + 假种</span>
      </div>
      <div class="lane-sep"></div>
      <div class="lane">
        <span class="lane-key">人力后果</span>
        <span class="lane-arrow">→</span>
        <span class="lane-target">人力调度</span>
        <span class="lane-chips">
          <i v-for="f in signalFields" :key="f.key" class="sig-chip">{{ f.label }}</i>
        </span>
      </div>
    </div>

    <div class="section-card">
      <div class="card-header">
        <span class="card-title">岗位 × 审核与后果</span>
        <span class="card-sub">补缺一律同岗位</span>
      </div>

      <el-table :data="rows" size="small" class="lc-table">
        <el-table-column label="岗位" width="110" fixed>
          <template #default="{ row }">
            <span class="job-name">{{ row.job }}</span>
          </template>
        </el-table-column>

        <el-table-column label="审批方式" min-width="190">
          <template #default="{ row }">
            <span class="cell-text">{{ row.approveText }}</span>
          </template>
        </el-table-column>

        <el-table-column label="经营人数校验" width="130">
          <template #default="{ row }">
            <span :class="['chk', row.headcountCheck]">{{ checkLabel(row.headcountCheck) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="额度后果 → 薪酬" min-width="230">
          <template #default="{ row }">
            <span class="cell-text">{{ row.payConsequence }}</span>
          </template>
        </el-table-column>

        <el-table-column label="人力后果 → 人力调度" min-width="170">
          <template #default="{ row }">
            <template v-if="row.signal">
              <span class="sig-on">产出缺岗信号</span>
              <div class="sig-sub">{{ subLabel(row.backfill) }}</div>
            </template>
            <span v-else class="cell-text muted">无</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openConfig(row)">配置</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-drawer v-model="drawerVisible" size="440px" :modal="false" :title="`请假后果 · ${form.job}`">
      <div class="cfg-wrap">
        <div class="cfg-block">
          <div class="cfg-label"><span>审批方式</span></div>
          <el-select v-model="form.approve" style="width: 100%">
            <el-option v-for="a in approveOptions" :key="a.value" :label="a.label" :value="a.value" />
          </el-select>
          <div class="field-desc">{{ form.approveText }}</div>
        </div>

        <div class="cfg-block">
          <div class="cfg-label"><span>经营人数校验</span><span class="cfg-note">门店当值是否够人</span></div>
          <el-select v-model="form.headcountCheck" style="width: 100%">
            <el-option v-for="c in headcountCheckOptions" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
          <div class="field-desc">{{ checkDesc }}</div>
        </div>

        <el-divider content-position="left">额度后果</el-divider>
        <div class="cfg-block">
          <div class="cfg-label"><span>交付薪酬</span></div>
          <div class="readonly-row">
            <span class="rd-key">交付内容</span>
            <span class="rd-item">休假时长 + 假种</span>
          </div>
          <div class="readonly-row">
            <span class="rd-key">本侧结论</span>
            <span class="rd-item">{{ form.payConsequence }}</span>
          </div>
        </div>

        <el-divider content-position="left">人力后果</el-divider>
        <div class="cfg-block">
          <div class="cfg-label"><span>产出缺岗信号</span><span class="cfg-note">交付人力调度</span></div>
          <el-switch v-model="form.signal" active-text="产出" inactive-text="不产出" size="small" />
          <div v-if="form.signal" class="readonly-row">
            <span class="rd-key">信号字段</span>
            <span class="rd-item">{{ signalFields.map(f => f.label).join(' · ') }}</span>
          </div>
          <div class="field-desc">补缺由人力调度实现，本侧不实现补人。</div>
        </div>

        <div v-if="form.signal" class="cfg-block">
          <div class="cfg-label"><span>补缺方式</span><span class="cfg-note">同岗位补，不跨岗位</span></div>
          <el-select v-model="form.backfill" style="width: 100%">
            <el-option v-for="b in backfillOptions" :key="b.value" :label="b.label" :value="b.value" />
          </el-select>
          <div class="field-desc">{{ backfillDesc }}</div>
        </div>

        <div class="cfg-block last">
          <div class="cfg-label"><span>备注</span></div>
          <el-input v-model="form.note" type="textarea" :rows="3" />
        </div>
      </div>

      <template #footer>
        <el-button @click="drawerVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  reviewPolicies,
  headcountCheckOptions,
  approveOptions,
  backfillOptions,
  gapSignalFields
} from '../../mock/leaveWorkMode.js'

const signalFields = gapSignalFields
const rows = ref(reviewPolicies.map(p => ({ ...p })))

const checkLabel = (v) => (headcountCheckOptions.find(c => c.value === v) || {}).label || v
const subLabel = (v) => (backfillOptions.find(b => b.value === v) || {}).label || v

const drawerVisible = ref(false)
const emptyForm = () => ({
  job: '', approve: 'auto', approveText: '', headcountCheck: 'none',
  payConsequence: '', signal: false, backfill: 'none', note: ''
})
const form = reactive(emptyForm())

const checkDesc = computed(() => {
  const hit = headcountCheckOptions.find(c => c.value === form.headcountCheck)
  return hit ? hit.desc : ''
})
const backfillDesc = computed(() => {
  const hit = backfillOptions.find(b => b.value === form.backfill)
  return hit ? hit.desc : ''
})

const openConfig = (row) => {
  Object.assign(form, emptyForm(), JSON.parse(JSON.stringify(row)))
  drawerVisible.value = true
}

const save = () => {
  const idx = rows.value.findIndex(r => r.job === form.job)
  if (idx !== -1) {
    rows.value[idx] = { ...rows.value[idx], ...JSON.parse(JSON.stringify(form)) }
  }
  drawerVisible.value = false
  ElMessage.success(`「${form.job}」的请假后果已更新`)
}
</script>

<style scoped>
.lc-page { padding: 0; }
.page-header { margin-bottom: 14px; }
.header-main { display: flex; align-items: center; gap: 10px; }
.header-main h1 { font-size: 22px; font-weight: 600; margin: 0; color: hsl(var(--foreground)); }

.lane-strip {
  display: flex; align-items: center; gap: 16px;
  padding: 12px 16px; margin-bottom: 14px;
  background: hsl(var(--muted) / 0.35);
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
}
.lane { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.lane-key { font-size: 13px; font-weight: 500; color: hsl(var(--foreground)); }
.lane-arrow { color: hsl(var(--muted-foreground) / 0.7); }
.lane-target { font-size: 13px; font-weight: 500; color: hsl(var(--primary)); }
.lane-note { font-size: 12px; color: hsl(var(--muted-foreground)); }
.lane-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.sig-chip {
  font-style: normal; font-size: 11.5px; padding: 2px 9px; border-radius: 10px;
  background: hsl(var(--background)); border: 1px solid hsl(var(--border));
  color: hsl(var(--muted-foreground));
}
.lane-sep { width: 1px; align-self: stretch; background: hsl(var(--border)); }

.section-card { background: hsl(var(--background)); border: 1px solid hsl(var(--border)); border-radius: 10px; padding: 16px 18px; }
.card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid hsl(var(--border)); }
.card-title { font-size: 15px; font-weight: 500; color: hsl(var(--foreground)); }
.card-sub { font-size: 12px; color: hsl(var(--muted-foreground)); }

.job-name { font-size: 13.5px; font-weight: 500; color: hsl(var(--foreground)); }
.cell-text { font-size: 12.5px; color: hsl(var(--foreground)); line-height: 1.6; }
.cell-text.muted { color: hsl(var(--muted-foreground)); }
.chk { font-size: 12px; padding: 2px 9px; border-radius: 10px; border: 1px solid hsl(var(--border)); }
.chk.none { color: hsl(var(--muted-foreground)); background: hsl(var(--muted) / 0.4); }
.chk.soft { color: hsl(38 92% 38%); background: hsl(38 92% 50% / 0.12); border-color: hsl(38 92% 50% / 0.45); }
.chk.hard { color: hsl(0 65% 45%); background: hsl(0 65% 50% / 0.1); border-color: hsl(0 65% 50% / 0.4); }
.sig-on { font-size: 12.5px; color: hsl(150 45% 32%); font-weight: 500; }
.sig-sub { font-size: 11.5px; color: hsl(var(--muted-foreground)); margin-top: 3px; }

.cfg-wrap { padding: 0 4px 8px; }
.cfg-block { margin-bottom: 14px; }
.cfg-block.last { margin-bottom: 0; }
.cfg-label { display: flex; align-items: baseline; gap: 8px; font-size: 13px; font-weight: 500; color: hsl(var(--foreground)); margin-bottom: 8px; }
.cfg-note { font-size: 11px; font-weight: 400; color: hsl(var(--muted-foreground)); }
.field-desc { font-size: 12px; color: hsl(var(--muted-foreground)); line-height: 1.65; margin-top: 6px; }
.readonly-row { display: flex; align-items: baseline; gap: 8px; margin-top: 6px; font-size: 12px; }
.rd-key { color: hsl(var(--muted-foreground)); flex-shrink: 0; min-width: 62px; }
.rd-item { color: hsl(var(--foreground)); }
</style>
