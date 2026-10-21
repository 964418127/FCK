<template>
  <div class="scheme-page">
    <div class="page-header">
      <div class="header-main">
        <h1>出勤方案</h1>
      </div>
      <p class="tip">
        只定「哪天默认该上班」的<strong>日历口径</strong>（周基础模式 + 法定节假日解读 + 方案内特殊日）。
        排班岗<strong>具体哪天上哪个班次由现有排班排假系统决定</strong>，本页不排班、不定班次、不生成名额；
        对不排班的岗位，日历即考勤比对的计划基准。
      </p>
    </div>

    <div class="section-card">
      <div class="card-header">
        <span class="card-title">方案库</span>
        <span class="card-sub">共 {{ schemes.length }} 份 · 被 {{ totalRef }} 个岗位引用</span>
        <div class="header-actions">
          <el-button size="small" type="primary" @click="openCreate">+ 新建方案</el-button>
        </div>
      </div>

      <el-table :data="schemes" size="small">
        <el-table-column label="方案" min-width="210">
          <template #default="{ row }">
            <div class="scheme-cell">
              <span class="scheme-name">
                {{ row.name }}
                <el-tag v-if="row.builtin" size="small" effect="plain" type="info">预置</el-tag>
              </span>
              <span class="scheme-domain">{{ row.domain }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="周基础模式" min-width="180">
          <template #default="{ row }">
            <div class="mini-week">
              <span
                v-for="(v, i) in row.weekPattern"
                :key="i"
                class="mw-cell"
                :class="{ rest: !v }"
              >{{ weekDayNames[i] }}</span>
            </div>
            <span class="pattern-text">{{ patternText(row.weekPattern) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="法定节假日" width="130">
          <template #default="{ row }">
            <el-tag size="small" effect="plain" :type="row.holidayPolicy === 'rest' ? 'success' : 'warning'">
              {{ policyLabel(row.holidayPolicy) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="特殊日" width="86">
          <template #default="{ row }">
            <span class="num-text">{{ row.specialDays.length }} 天</span>
          </template>
        </el-table-column>

        <el-table-column label="引用岗位（横向复用）" min-width="240">
          <template #default="{ row }">
            <div class="ref-jobs">
              <span v-for="j in jobsUsingScheme(row.id)" :key="j" class="ref-job">{{ j }}</span>
              <span v-if="!jobsUsingScheme(row.id).length" class="ref-none">暂无岗位引用</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="openEdit(row)">配置</el-button>
            <el-button size="small" link @click="duplicate(row)">复制</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- ============ 配置抽屉 ============ -->
    <el-drawer v-model="drawerVisible" :title="drawerTitle" size="640px" :modal="false">
      <div class="drawer-body" v-if="current">
        <div class="src-banner">
          <span class="src-badge">{{ current.builtin ? '预置方案' : '自建方案' }}</span>
          <span class="src-text">
            被 {{ jobsUsingScheme(current.id).length }} 个岗位引用 —— 本页改动会同时作用于它们
          </span>
        </div>

        <div class="cfg-block">
          <div class="cfg-label"><span>方案名称</span></div>
          <el-input v-model="current.name" size="small" style="max-width: 280px" />
        </div>

        <div class="cfg-block">
          <div class="cfg-label">
            <span>适用域</span>
            <span class="cfg-note">仅作标签，不参与判定</span>
          </div>
          <el-input v-model="current.domain" size="small" style="max-width: 280px" />
        </div>

        <div class="cfg-block">
          <div class="cfg-label">
            <span>周基础模式</span>
          </div>
          <div class="preset-row">
            <el-button
              v-for="p in presets"
              :key="p.id"
              size="small"
              :type="samePattern(current.weekPattern, p.pattern) ? 'primary' : 'default'"
              @click="applyPreset(p)"
            >{{ p.label }}</el-button>
          </div>
          <div class="week-row">
            <div
              v-for="(w, i) in weekDayNames"
              :key="i"
              class="week-cell"
              :class="{ rest: !current.weekPattern[i] }"
              @click="toggleWeek(i)"
            >
              <span class="week-name">周{{ w }}</span>
              <span class="week-state">{{ current.weekPattern[i] ? '上班' : '休息' }}</span>
            </div>
          </div>
          <div class="field-desc">点任一天切换「上班 / 休息」，或直接套预置。</div>
        </div>

        <div class="cfg-block">
          <div class="cfg-label">
            <span>法定节假日口径</span>
          </div>
          <el-radio-group v-model="current.holidayPolicy" class="policy-group">
            <el-radio v-for="p in policies" :key="p.value" :value="p.value">{{ p.label }}</el-radio>
          </el-radio-group>
          <div class="field-desc">{{ policyDesc }}</div>

          <div class="holiday-mini">
            <div class="mini-title">国家法定节假日（只读 · {{ statutoryCalendar.year }} 年）</div>
            <div class="mini-list">
              <span v-for="h in statutoryCalendar.holidays" :key="h.name" class="mini-item">
                {{ h.name }} · {{ h.days }} 天
              </span>
            </div>
            <div class="mini-source">{{ statutoryCalendar.source }}</div>
          </div>
        </div>

        <div class="cfg-block last">
          <div class="cfg-label">
            <span>方案内特殊日</span>
            <span class="cfg-note">作用于所有引用者</span>
            <el-button size="small" type="primary" @click="openSpecial">+ 新增特殊日</el-button>
          </div>
          <el-table v-if="current.specialDays.length" :data="current.specialDays" size="small">
            <el-table-column label="日期" width="150">
              <template #default="{ row }">{{ row.date }}</template>
            </el-table-column>
            <el-table-column label="类型" width="100">
              <template #default="{ row }">
                <el-tag size="small" effect="plain" :type="row.type === 'work' ? 'primary' : 'info'">
                  {{ typeLabel(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="原因" min-width="150" prop="reason" />
            <el-table-column label="操作" width="70">
              <template #default="{ $index }">
                <el-button size="small" link type="danger" @click="removeSpecial($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div v-else class="empty-hint">暂无特殊日。法定节假日之外的单日调整（团建、盘点、值班）放这里。</div>
        </div>

        <div class="cfg-block">
          <div class="cfg-label"><span>引用岗位</span><span class="cfg-note">只读 · 到「岗位假勤方案」页改归属</span></div>
          <div class="ref-jobs">
            <span v-for="j in jobsUsingScheme(current.id)" :key="j" class="ref-job">{{ j }}</span>
            <span v-if="!jobsUsingScheme(current.id).length" class="ref-none">暂无岗位引用</span>
          </div>
        </div>

        <div class="drawer-foot">
          <el-popconfirm
            title="删除该方案？引用它的岗位会变成「未引用方案」。"
            confirm-button-text="删除"
            cancel-button-text="取消"
            @confirm="removeScheme"
          >
            <template #reference>
              <el-button size="small" link type="danger">删除方案</el-button>
            </template>
          </el-popconfirm>
        </div>
      </div>
    </el-drawer>

    <!-- ============ 新建方案 ============ -->
    <el-dialog v-model="createVisible" title="新建出勤方案" width="620px">
      <div class="dlg-body">
        <div class="dlg-row">
          <div class="dlg-label">方案名称</div>
          <el-input v-model="newForm.name" placeholder="如：门店 · 夜班岗" style="max-width: 300px" />
        </div>
        <div class="dlg-row">
          <div class="dlg-label">适用域</div>
          <el-input v-model="newForm.domain" placeholder="如：门店一线" style="max-width: 300px" />
        </div>
        <div class="dlg-row">
          <div class="dlg-label">周基础模式<em>可套预置，也可逐天点</em></div>
          <div class="preset-row">
            <el-button
              v-for="p in presets"
              :key="p.id"
              size="small"
              :type="samePattern(newForm.weekPattern, p.pattern) ? 'primary' : 'default'"
              @click="newForm.weekPattern = [...p.pattern]"
            >{{ p.label }}</el-button>
          </div>
          <div class="week-row">
            <div
              v-for="(w, i) in weekDayNames"
              :key="i"
              class="week-cell"
              :class="{ rest: !newForm.weekPattern[i] }"
              @click="newForm.weekPattern[i] = newForm.weekPattern[i] ? 0 : 1"
            >
              <span class="week-name">周{{ w }}</span>
              <span class="week-state">{{ newForm.weekPattern[i] ? '上班' : '休息' }}</span>
            </div>
          </div>
        </div>
        <div class="dlg-row">
          <div class="dlg-label">法定节假日口径</div>
          <el-radio-group v-model="newForm.holidayPolicy">
            <el-radio v-for="p in policies" :key="p.value" :value="p.value">{{ p.label }}</el-radio>
          </el-radio-group>
        </div>
        <div class="dlg-row">
          <div class="dlg-label">说明</div>
          <el-input v-model="newForm.basis" type="textarea" :rows="2" placeholder="这份方案为什么长这样" style="max-width: 420px" />
        </div>
      </div>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" @click="createScheme">创建</el-button>
      </template>
    </el-dialog>

    <!-- ============ 新增特殊日 ============ -->
    <el-dialog v-model="specialVisible" title="新增特殊日" width="520px">
      <el-form :model="specialForm" label-width="88px">
        <el-form-item label="日期">
          <el-date-picker
            v-model="specialForm.date"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="specialForm.type" style="width: 100%">
            <el-option v-for="t in specialDayTypes" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
          <div class="field-desc">{{ typeDesc }}</div>
        </el-form-item>
        <el-form-item label="原因">
          <el-input v-model="specialForm.reason" placeholder="如：门店年度盘点，歇业一天" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="specialVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSpecial">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  scheduleSchemes,
  jobsUsingScheme,
  patternText,
  weekDayNames,
  statutoryCalendar,
  weekPatternPresets,
  holidayPolicies,
  specialDayTypes
} from '../../mock/leaveWorkMode.js'

const presets = weekPatternPresets
const policies = holidayPolicies
const schemes = ref(scheduleSchemes.map(s => ({ ...s, weekPattern: [...s.weekPattern], specialDays: (s.specialDays || []).map(d => ({ ...d })) })))

const totalRef = computed(() => schemes.value.reduce((n, s) => n + jobsUsingScheme(s.id).length, 0))

const policyLabel = (v) => (policies.find(p => p.value === v) || {}).label || v
const typeLabel = (v) => (specialDayTypes.find(t => t.value === v) || {}).label || v
const samePattern = (a, b) => a.length === b.length && a.every((v, i) => v === b[i])
const policyDesc = computed(() => {
  const hit = policies.find(p => p.value === (current.value ? current.value.holidayPolicy : ''))
  return hit ? hit.desc : ''
})
const typeDesc = computed(() => (specialDayTypes.find(t => t.value === specialForm.type) || {}).desc || '')

/* ---------- 编辑 ---------- */
const drawerVisible = ref(false)
const current = ref(null)
const drawerTitle = computed(() => (current.value ? `配置方案 · ${current.value.name}` : '配置方案'))

const openEdit = (row) => {
  current.value = row
  drawerVisible.value = true
}
const applyPreset = (p) => { current.value.weekPattern = [...p.pattern] }
const toggleWeek = (i) => { current.value.weekPattern[i] = current.value.weekPattern[i] ? 0 : 1 }
const removeScheme = () => {
  const idx = schemes.value.findIndex(s => s.id === current.value.id)
  if (idx !== -1) schemes.value.splice(idx, 1)
  drawerVisible.value = false
  ElMessage.success('方案已删除')
}

/* ---------- 特殊日 ---------- */
const specialVisible = ref(false)
const specialForm = reactive({ date: '', type: 'work', reason: '' })
const openSpecial = () => {
  Object.assign(specialForm, { date: '', type: 'work', reason: '' })
  specialVisible.value = true
}
const saveSpecial = () => {
  if (!specialForm.date) { ElMessage.warning('请选择日期'); return }
  current.value.specialDays.push({ ...specialForm })
  specialVisible.value = false
}
const removeSpecial = (idx) => { current.value.specialDays.splice(idx, 1) }

/* ---------- 新建 ---------- */
const createVisible = ref(false)
const newForm = reactive({ name: '', domain: '', weekPattern: [1, 1, 1, 1, 1, 0, 0], holidayPolicy: 'rest', basis: '' })
const openCreate = () => {
  Object.assign(newForm, { name: '', domain: '', weekPattern: [1, 1, 1, 1, 1, 0, 0], holidayPolicy: 'rest', basis: '' })
  createVisible.value = true
}
const createScheme = () => {
  if (!newForm.name.trim()) { ElMessage.warning('请填写方案名称'); return }
  schemes.value.push({
    id: 'sch-' + Date.now(),
    name: newForm.name.trim(),
    domain: newForm.domain.trim() || '自定义',
    basis: newForm.basis,
    weekPattern: [...newForm.weekPattern],
    holidayPolicy: newForm.holidayPolicy,
    specialDays: [],
    builtin: false,
    updatedAt: '2026-10-13'
  })
  createVisible.value = false
  ElMessage.success('方案已创建，可在「岗位假勤方案」页被岗位引用')
}

/* ---------- 复制 ---------- */
const duplicate = (row) => {
  schemes.value.push({
    ...row,
    id: 'sch-' + Date.now(),
    name: row.name + '（副本）',
    weekPattern: [...row.weekPattern],
    specialDays: row.specialDays.map(d => ({ ...d })),
    builtin: false
  })
  ElMessage.success(`已复制「${row.name}」`)
}
</script>

<style scoped>
.scheme-page { padding: 0; }
.page-header { margin-bottom: 16px; }
.header-main { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.header-main h1 { font-size: 22px; font-weight: 600; margin: 0; color: hsl(var(--foreground)); }
.tip { margin: 0; font-size: 13px; line-height: 1.7; color: hsl(var(--muted-foreground)); max-width: 940px; }
.tip strong { color: hsl(var(--foreground)); font-weight: 600; }

.section-card { background: hsl(var(--background)); border: 1px solid hsl(var(--border)); border-radius: 10px; padding: 16px 18px; }
.card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid hsl(var(--border)); }
.card-title { font-size: 15px; font-weight: 600; color: hsl(var(--foreground)); }
.card-sub { font-size: 12px; color: hsl(var(--muted-foreground)); }
.header-actions { margin-left: auto; }

.scheme-cell { display: flex; flex-direction: column; gap: 2px; }
.scheme-name { font-size: 13.5px; font-weight: 500; color: hsl(var(--foreground)); display: inline-flex; align-items: center; gap: 6px; }
.scheme-domain { font-size: 11.5px; color: hsl(var(--muted-foreground)); }
.mini-week { display: flex; gap: 3px; margin-bottom: 4px; }
.mw-cell {
  width: 18px; height: 18px; border-radius: 4px; font-size: 10px;
  display: inline-flex; align-items: center; justify-content: center;
  background: hsl(var(--primary) / 0.15); color: hsl(var(--primary));
}
.mw-cell.rest { background: hsl(var(--muted)); color: hsl(var(--muted-foreground)); }
.pattern-text { font-size: 11.5px; color: hsl(var(--muted-foreground)); }
.num-text { font-size: 13px; color: hsl(var(--foreground)); }
.ref-jobs { display: flex; flex-wrap: wrap; gap: 5px; }
.ref-job {
  font-size: 11.5px; padding: 1px 8px; border-radius: 9px;
  background: hsl(var(--primary) / 0.1); color: hsl(var(--primary)); border: 1px solid hsl(var(--primary) / 0.3);
}
.ref-none { font-size: 12px; color: hsl(var(--muted-foreground) / 0.8); }
.table-foot { margin-top: 14px; padding-top: 12px; border-top: 1px dashed hsl(var(--border)); font-size: 12px; color: hsl(var(--muted-foreground)); line-height: 1.7; }
.table-foot b { color: hsl(var(--foreground)); font-weight: 600; }

/* 抽屉 */
.drawer-body { padding-bottom: 8px; }
.src-banner { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 6px; background: hsl(var(--muted) / 0.45); border: 1px solid hsl(var(--border)); flex-wrap: wrap; margin-bottom: 6px; }
.src-badge { font-size: 11px; padding: 1px 7px; border-radius: 9px; border: 1px solid hsl(var(--border)); color: hsl(var(--muted-foreground)); background: hsl(var(--background)); }
.src-text { font-size: 12px; color: hsl(var(--muted-foreground)); }
.cfg-block { margin-bottom: 16px; }
.cfg-label { display: flex; align-items: center; gap: 8px; margin-bottom: 7px; font-size: 13px; font-weight: 500; color: hsl(var(--foreground)); }
.cfg-note { font-size: 11px; font-weight: 400; color: hsl(var(--muted-foreground)); }
.preset-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
.week-row { display: flex; gap: 6px; }
.week-cell {
  flex: 1; text-align: center; padding: 7px 4px; border-radius: 6px; cursor: pointer;
  border: 1px solid hsl(var(--border)); background: hsl(var(--primary) / 0.07); transition: all 0.12s;
}
.week-cell.rest { background: hsl(var(--muted) / 0.45); }
.week-cell:hover { border-color: hsl(var(--primary) / 0.5); }
.week-name { display: block; font-size: 12px; color: hsl(var(--foreground)); }
.week-state { display: block; font-size: 11px; color: hsl(var(--muted-foreground)); margin-top: 2px; }
.policy-group { margin-bottom: 4px; }
.holiday-mini { margin-top: 12px; padding: 10px 12px; border-radius: 6px; background: hsl(var(--muted) / 0.4); border: 1px solid hsl(var(--border)); }
.mini-title { font-size: 12px; font-weight: 500; color: hsl(var(--foreground)); margin-bottom: 8px; }
.mini-list { display: flex; flex-wrap: wrap; gap: 8px; }
.mini-item { font-size: 12px; color: hsl(var(--foreground)); background: hsl(var(--background)); padding: 2px 8px; border-radius: 10px; border: 1px solid hsl(var(--border)); }
.mini-source { margin-top: 8px; font-size: 11px; color: hsl(var(--muted-foreground)); }
.field-desc { font-size: 12px; color: hsl(var(--muted-foreground)); line-height: 1.65; margin-top: 6px; }
.warn-text { color: hsl(38 92% 42%); }
.empty-hint { font-size: 12.5px; color: hsl(var(--muted-foreground)); padding: 6px 0; }
.drawer-foot { margin-top: 10px; padding-top: 12px; border-top: 1px solid hsl(var(--border)); }

/* 弹窗 */
.dlg-body { display: flex; flex-direction: column; gap: 16px; }
.dlg-label { font-size: 13px; font-weight: 500; color: hsl(var(--foreground)); margin-bottom: 8px; }
.dlg-label em { font-style: normal; font-size: 11.5px; font-weight: 400; color: hsl(var(--muted-foreground)); margin-left: 8px; }
:deep(.el-divider__text) { font-size: 13px; color: hsl(var(--muted-foreground)); background: hsl(var(--background)); }
</style>
