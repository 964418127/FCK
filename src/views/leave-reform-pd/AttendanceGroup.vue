<template>
  <div class="att-page">
    <div class="page-header">
      <div class="header-main">
        <h1>考勤组</h1>
      </div>
    </div>

    <!-- 岗位声明与引用自洽 -->
    <div class="section-card" :class="{ 'has-warn': issues.length }">
      <div class="card-header">
        <span class="card-title">岗位声明与引用自洽</span>
        <span class="card-sub">声明「需要打卡」的岗位，应引用一个考勤组</span>
      </div>
      <div v-if="issues.length" class="issue-list">
        <div v-for="it in issues" :key="it.job" class="issue-item">
          <el-tag size="small" effect="plain" type="warning">待处理</el-tag>
          <span class="issue-job">{{ it.job }}</span>
          <span class="issue-text">{{ it.text }}</span>
        </div>
      </div>
      <div v-else class="ok-line">
        <el-icon color="#52a06a"><CircleCheck /></el-icon>
        <span>全部自洽：{{ needPunch.length }} 个岗位声明需打卡，均已引用考勤组；{{ noPunch.length }} 个岗位不打卡，均未引用。</span>
      </div>
    </div>

    <div class="section-card">
      <div class="card-header">
        <span class="card-title">考勤组</span>
        <span class="card-sub">共 {{ groups.length }} 个 · 被 {{ totalRef }} 个岗位引用</span>
        <span class="card-note">岗位在「岗位假勤方案」里选择考勤组，本页只做定义</span>
        <div class="header-actions">
          <el-button size="small" type="primary" @click="openCreate">+ 新建考勤组</el-button>
        </div>
      </div>

      <div class="group-cards">
        <div v-for="g in groups" :key="g.id" class="att-card" :class="{ disabled: !g.enabled }">
          <div class="ac-head">
            <div class="ac-title">
              <span class="ac-name">{{ g.name }}</span>
              <el-tag size="small" effect="plain" :type="g.enabled ? 'success' : 'info'">
                {{ g.enabled ? '启用中' : '未启用' }}
              </el-tag>
            </div>
            <div class="ac-ops">
              <el-button size="small" link type="primary" @click="openEdit(g)">配置</el-button>
            </div>
          </div>

          <div class="ac-fields">
            <div class="ac-field">
              <span class="af-label">资产来源</span>
              <span class="af-value">{{ g.source }}</span>
            </div>
            <div class="ac-field">
              <span class="af-label">打卡方式</span>
              <span class="af-value">{{ g.method }}</span>
            </div>
            <div class="ac-field">
              <span class="af-label">有效范围</span>
              <span class="af-value">{{ g.scope }}</span>
            </div>
            <div class="ac-field">
              <span class="af-label">成员人数</span>
              <span class="af-value">{{ g.memberCount }} 人</span>
            </div>
            <div class="ac-field">
              <span class="af-label">同步时间</span>
              <span class="af-value">{{ g.updatedAt }}</span>
            </div>
          </div>

          <div class="ac-ref">
            <div class="ac-ref-title">
              被引用岗位
              <span class="ac-ref-count">{{ refsOf(g.id).length }} 个</span>
            </div>
            <div v-if="refsOf(g.id).length" class="ref-jobs">
              <span v-for="j in refsOf(g.id)" :key="j" class="ref-job">{{ j }}</span>
            </div>
            <div v-else class="ref-none">暂无岗位引用本组</div>
          </div>

          <div class="ac-note">{{ g.note }}</div>
        </div>
      </div>
    </div>

    <!-- ============ 配置抽屉 ============ -->
    <el-drawer v-model="drawerVisible" :title="drawerTitle" size="620px" :modal="false">
      <div class="drawer-body" v-if="current">
        <div class="src-banner">
          <span class="src-badge">{{ current.source }}</span>
          <span class="src-text">打卡流水同步于 {{ current.updatedAt }}</span>
        </div>

        <div class="cfg-block">
          <div class="cfg-label"><span>考勤组名称</span></div>
          <el-input v-model="current.name" size="small" style="max-width: 300px" />
          <div class="field-desc">只影响识别，不改变打卡行为。</div>
        </div>

        <div class="cfg-block">
          <div class="cfg-label">
            <span>打卡方式</span>
            <span class="cfg-note">打卡组口径 · 取决于设备能力</span>
          </div>
          <el-select
            v-model="current.method"
            size="small"
            filterable
            allow-create
            default-first-option
            placeholder="选择或输入打卡方式"
            style="width: 100%; max-width: 380px"
          >
            <el-option v-for="m in methodOptions" :key="m" :label="m" :value="m" />
          </el-select>
        </div>

        <div class="cfg-block">
          <div class="cfg-label">
            <span>有效范围</span>
            <span class="cfg-note">决定哪些地点算「在岗」</span>
          </div>
          <el-select
            v-model="current.scope"
            size="small"
            filterable
            allow-create
            default-first-option
            placeholder="选择或输入有效范围"
            style="width: 100%; max-width: 380px"
          >
            <el-option v-for="s in scopeOptions" :key="s" :label="s" :value="s" />
          </el-select>
        </div>

        <div class="cfg-block">
          <div class="cfg-label">
            <span>被引用岗位</span>
            <span class="cfg-note">只读 · 在「岗位假勤方案」页选择</span>
          </div>
          <div v-if="refsOf(current.id).length" class="ref-jobs">
            <span v-for="j in refsOf(current.id)" :key="j" class="ref-job">{{ j }}</span>
          </div>
          <div v-else class="field-desc">暂无岗位引用本组。</div>
        </div>

        <div class="cfg-block">
          <div class="cfg-label">
            <span>成员人数</span>
            <span class="cfg-note">打卡组按花名册算 · 只读</span>
          </div>
          <span class="ro-value">{{ current.memberCount }} 人</span>
        </div>

        <div class="cfg-block">
          <div class="cfg-label"><span>状态</span></div>
          <el-switch v-model="current.enabled" active-text="启用" inactive-text="停用" size="small" />
          <div class="field-desc">停用后，引用它的岗位会变成「未引用考勤组」。</div>
        </div>

        <div class="cfg-block last">
          <div class="cfg-label"><span>备注</span></div>
          <el-input v-model="current.note" type="textarea" :rows="2" style="max-width: 460px" />
        </div>

        <div class="drawer-foot">
          <el-popconfirm
            title="删除该考勤组？引用它的岗位会变成「未引用考勤组」。"
            confirm-button-text="删除"
            cancel-button-text="取消"
            @confirm="removeGroup"
          >
            <template #reference>
              <el-button size="small" link type="danger">删除考勤组</el-button>
            </template>
          </el-popconfirm>
          <el-button size="small" link @click="resetGroup">恢复初始值</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- ============ 新建考勤组 ============ -->
    <el-dialog v-model="createVisible" title="新建考勤组" width="560px">
      <div class="dlg-body">
        <div class="dlg-row">
          <div class="dlg-label">考勤组名称</div>
          <el-input v-model="newForm.name" placeholder="如：门店 · 人脸闸机组" style="max-width: 320px" />
        </div>
        <div class="dlg-row">
          <div class="dlg-label">打卡方式</div>
          <el-select
            v-model="newForm.method"
            filterable
            allow-create
            default-first-option
            placeholder="选择或输入"
            style="width: 100%; max-width: 320px"
          >
            <el-option v-for="m in methodOptions" :key="m" :label="m" :value="m" />
          </el-select>
        </div>
        <div class="dlg-row">
          <div class="dlg-label">有效范围</div>
          <el-select
            v-model="newForm.scope"
            filterable
            allow-create
            default-first-option
            placeholder="选择或输入"
            style="width: 100%; max-width: 320px"
          >
            <el-option v-for="s in scopeOptions" :key="s" :label="s" :value="s" />
          </el-select>
        </div>
        <div class="dlg-row">
          <div class="dlg-label">备注</div>
          <el-input v-model="newForm.note" type="textarea" :rows="2" placeholder="这个组为什么存在" style="max-width: 420px" />
        </div>
      </div>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" @click="createGroup">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { CircleCheck } from '@element-plus/icons-vue'
import {
  attendanceGroups,
  jobsUsingAttendance,
  jobWorkModes,
  punchMethodOptions,
  punchScopeOptions
} from '../../mock/leaveWorkMode.js'

const methodOptions = punchMethodOptions
const scopeOptions = punchScopeOptions

const clone = (g) => ({ ...g })
const groups = ref(attendanceGroups.map(clone))

const needPunch = computed(() => jobWorkModes.filter(m => m.attendance))
const noPunch = computed(() => jobWorkModes.filter(m => !m.attendance))

const refsOf = (id) => jobsUsingAttendance(id)
const totalRef = computed(() => groups.value.reduce((n, g) => n + refsOf(g.id).length, 0))

/** 岗位声明与引用不自洽 */
const issues = computed(() => {
  const list = []
  jobWorkModes.forEach(m => {
    if (m.attendance && !m.attendanceGroupId) {
      list.push({ job: m.job, text: '声明需打卡，但未引用任何考勤组 → 打卡有效性无从判定' })
    }
    if (!m.attendance && m.attendanceGroupId) {
      list.push({ job: m.job, text: '引用了考勤组，却声明不打卡 → 该引用不会生效' })
    }
  })
  return list
})

/* ---------- 抽屉编辑 ---------- */
const drawerVisible = ref(false)
const current = ref(null)
const drawerTitle = computed(() => (current.value ? `配置考勤组 · ${current.value.name}` : '配置考勤组'))

const openEdit = (g) => {
  current.value = g
  drawerVisible.value = true
}

const resetGroup = () => {
  if (!current.value) return
  const origin = attendanceGroups.find(a => a.id === current.value.id)
  if (!origin) return
  Object.assign(current.value, clone(origin))
  ElMessage.success('已恢复初始值')
}

const removeGroup = () => {
  const idx = groups.value.findIndex(g => g.id === current.value.id)
  if (idx !== -1) groups.value.splice(idx, 1)
  drawerVisible.value = false
  ElMessage.success('考勤组已删除')
}

/* ---------- 新建 ---------- */
const createVisible = ref(false)
const emptyForm = () => ({ name: '', method: '', scope: '', note: '' })
const newForm = reactive(emptyForm())

const openCreate = () => {
  Object.assign(newForm, emptyForm())
  createVisible.value = true
}

const createGroup = () => {
  if (!newForm.name.trim()) { ElMessage.warning('请填写考勤组名称'); return }
  groups.value.push({
    id: 'att-' + Date.now(),
    name: newForm.name.trim(),
    method: newForm.method || '未指定',
    scope: newForm.scope || '未指定',
    memberCount: 0,
    enabled: true,
    source: '假勤侧新建',
    updatedAt: '2026-10-21',
    note: newForm.note
  })
  createVisible.value = false
  ElMessage.success('考勤组已创建，可在「岗位假勤方案」页被岗位引用')
}
</script>

<style scoped>
.att-page { padding: 0; }
.page-header { margin-bottom: 14px; }
.header-main { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.header-main h1 { font-size: 22px; font-weight: 600; margin: 0; color: hsl(var(--foreground)); }

.section-card { background: hsl(var(--background)); border: 1px solid hsl(var(--border)); border-radius: 10px; padding: 16px 18px; margin-bottom: 16px; }
.section-card.has-warn { border-color: hsl(38 92% 50% / 0.5); }
.card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid hsl(var(--border)); flex-wrap: wrap; }
.card-title { font-size: 15px; font-weight: 600; color: hsl(var(--foreground)); }
.card-sub { font-size: 12px; color: hsl(var(--muted-foreground)); }
.card-note { font-size: 11.5px; color: hsl(var(--muted-foreground) / 0.85); margin-left: auto; }
.header-actions { margin-left: auto; }

.issue-list { display: flex; flex-direction: column; gap: 8px; }
.issue-item { display: flex; align-items: center; gap: 10px; font-size: 12.5px; }
.issue-job { font-weight: 600; color: hsl(var(--foreground)); min-width: 72px; }
.issue-text { color: hsl(var(--muted-foreground)); }
.ok-line { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: hsl(var(--muted-foreground)); }

.group-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 16px; }
.att-card {
  border: 1px solid hsl(var(--border)); border-radius: 10px; padding: 16px 18px;
  background: hsl(var(--background)); transition: box-shadow 0.15s;
}
.att-card:hover { box-shadow: var(--shadow-sm); }
.att-card.disabled { opacity: 0.72; border-style: dashed; }
.ac-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
.ac-title { display: flex; align-items: center; gap: 8px; }
.ac-name { font-size: 14.5px; font-weight: 600; color: hsl(var(--foreground)); }
.ac-ops { flex-shrink: 0; }
.ac-fields { display: flex; flex-direction: column; gap: 7px; margin-bottom: 12px; }
.ac-field { display: flex; gap: 10px; font-size: 12.5px; }
.af-label { width: 64px; flex-shrink: 0; color: hsl(var(--muted-foreground)); }
.af-value { color: hsl(var(--foreground)); }
.ac-ref { padding-top: 11px; border-top: 1px dashed hsl(var(--border)); }
.ac-ref-title { display: flex; align-items: center; gap: 8px; font-size: 12px; color: hsl(var(--muted-foreground)); margin-bottom: 7px; }
.ac-ref-count { font-size: 11px; padding: 1px 7px; border-radius: 9px; background: hsl(var(--muted) / 0.6); }
.ref-jobs { display: flex; flex-wrap: wrap; gap: 5px; }
.ref-job {
  font-size: 11.5px; padding: 1px 8px; border-radius: 9px;
  background: hsl(var(--primary) / 0.1); color: hsl(var(--primary)); border: 1px solid hsl(var(--primary) / 0.3);
}
.ref-none { font-size: 12px; color: hsl(var(--muted-foreground) / 0.8); }
.ac-note { margin-top: 12px; font-size: 12px; line-height: 1.65; color: hsl(var(--muted-foreground)); }

/* 抽屉 */
.drawer-body { padding-bottom: 8px; }
.src-banner { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 6px; background: hsl(var(--muted) / 0.45); border: 1px solid hsl(var(--border)); flex-wrap: wrap; margin-bottom: 6px; }
.src-badge { font-size: 11px; padding: 1px 7px; border-radius: 9px; border: 1px solid hsl(var(--border)); color: hsl(var(--muted-foreground)); background: hsl(var(--background)); }
.src-text { font-size: 12px; color: hsl(var(--muted-foreground)); }
.cfg-block { margin-bottom: 16px; }
.cfg-label { display: flex; align-items: center; gap: 8px; margin-bottom: 7px; font-size: 13px; font-weight: 500; color: hsl(var(--foreground)); flex-wrap: wrap; }
.cfg-note { font-size: 11px; font-weight: 400; color: hsl(var(--muted-foreground)); }
.field-desc { font-size: 12px; color: hsl(var(--muted-foreground)); line-height: 1.65; margin-top: 6px; }
.ro-value { font-size: 13px; color: hsl(var(--foreground)); }
.drawer-foot { margin-top: 10px; padding-top: 12px; border-top: 1px solid hsl(var(--border)); }

/* 弹窗 */
.dlg-body { display: flex; flex-direction: column; gap: 16px; }
.dlg-label { font-size: 13px; font-weight: 500; color: hsl(var(--foreground)); margin-bottom: 8px; }
</style>
