<template>
  <div class="page">
    <header class="page-head">
      <div>
        <h1>排班策略 v3 <span class="ver">设计基线</span></h1>
        <p>容器承接时段，时段只描述时间形态；谁能领、怎么领、余额怎么办，全部挂在独立的「获取规则」上；结算完直接写排班结果。</p>
      </div>
      <el-button plain size="small" class="m-entry" @click="router.push({ name: 'v3-mobile' })">移动端预览</el-button>
    </header>

    <div class="tabs" role="tablist">
      <button v-for="t in tabs" :key="t.value" role="tab" :class="{ active: tab === t.value }" @click="tab = t.value">{{ t.label }}</button>
    </div>

    <!-- 时段 -->
    <div v-if="tab === 'slot'" class="layout">
      <aside class="cont-list">
        <div class="cont-head"><span>编码</span><span>容器</span></div>
        <button
          v-for="c in containers" :key="c.id"
          :class="['cont-item', { on: contId === c.id }]"
          @click="contId = c.id"
        >
          <span class="cont-id">{{ c.id }}</span>
          <strong>{{ c.name }}<small>{{ typeLabel(c.type) }}</small></strong>
        </button>
      </aside>

      <main class="main">
        <div class="sec-head">
          <div>
            <h2>{{ curCont?.name }} <span class="sub">{{ typeLabel(curCont?.type) }}容器</span></h2>
            <p>营业 {{ curCont?.open }} – {{ curCont?.close }} · 时段只管时间形态，「谁先领」在获取规则里</p>
          </div>
          <el-button type="primary" @click="onAddSlot">新增时段</el-button>
        </div>

        <el-table :data="slotsHere" border size="small" empty-text="这个容器还没有时段">
          <el-table-column label="时段" min-width="150">
            <template #default="{ row }">
              <span class="name">{{ row.name }}</span>
              <el-tag v-if="row.source === 'custom'" size="small" type="warning" effect="plain" class="tag">门店自建</el-tag>
              <div class="sub">{{ row.note }}</div>
            </template>
          </el-table-column>
          <el-table-column label="起止 · 净工时" width="170">
            <template #default="{ row }">
              {{ sh(row).start }} – {{ sh(row).end }}
              <span class="net">净 {{ netHours3(sh(row)) }}h</span>
              <div class="sub">{{ sh(row).breakMin ? `休 ${sh(row).breakMin} 分` : '无休息' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="名额" width="64" align="center">
            <template #default="{ row }">{{ row.capacity }}</template>
          </el-table-column>
          <el-table-column label="星期" width="96">
            <template #default="{ row }">{{ daysText(row.days) }}</template>
          </el-table-column>
          <el-table-column label="生成" width="150">
            <template #default="{ row }"><span class="sub">{{ genText(row.generation) }}</span></template>
          </el-table-column>
          <el-table-column label="获取规则" min-width="230">
            <template #default="{ row }">
              <template v-if="ruleOf(row)">
                <span class="rule-name">{{ ruleOf(row).name }}</span>
                <el-tag size="small" effect="plain" class="tag">{{ modeLabel(ruleOf(row)) }}</el-tag>
                <div class="sub">{{ ruleSummary3(ruleOf(row)) }} · 余额：{{ balanceSummary3(ruleOf(row)) }}</div>
              </template>
              <el-tag v-else size="small" type="info" effect="plain">兜底承接（不单独发布）</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template #default="{ row }">
              <el-button link type="primary" @click="goSlot(row)">配置</el-button>
            </template>
          </el-table-column>
        </el-table>
      </main>
    </div>

    <!-- 时段模板 -->
    <div v-else-if="tab === 'tpl'" class="wrap">
      <div class="sec-head">
        <div>
          <h2>时段模板 <span class="sub">纯时间形态 · 不含任何「谁能领」</span></h2>
          <p>模板只有班次、星期、名额、生成节奏。引用时按容器落地成一条时段，改模板不影响已建的时段。</p>
        </div>
      </div>
      <div class="grid">
        <div v-for="t in templates" :key="t.id" class="tpl">
          <div class="tpl-head">
            <strong>{{ t.name }}</strong>
            <el-tag size="small" effect="plain">{{ t.scope }}</el-tag>
          </div>
          <div class="tpl-meta">
            <span>班次：{{ tplShift(t).name }} {{ tplShift(t).start }}–{{ tplShift(t).end }}</span>
            <span>{{ daysText(t.days) }} · {{ t.capacity }} 个名额</span>
            <span>生成：{{ genText(t.generation) }}</span>
          </div>
          <el-button size="small" plain @click="onAddFromTpl(t)">用此模板建时段</el-button>
        </div>
      </div>
    </div>

    <!-- 获取规则 -->
    <div v-else-if="tab === 'rule'" class="wrap">
      <div class="sec-head">
        <div>
          <h2>名额获取规则 <span class="sub">独立对象 · 可挂到多条时段</span></h2>
          <p>三种模式：系统直派（无申领）、公布即抢（即时生效）、申领审核（截止在申领人里按业绩截断）。余额三选：再开一轮 / 兜底序列 / 不管。</p>
        </div>
      </div>
      <div class="grid two">
        <div v-for="r in rules" :key="r.id" class="rule-card">
          <div class="rule-head">
            <strong>{{ r.name }}</strong>
            <el-tag size="small" :type="r.mode === 'review' ? 'warning' : r.mode === 'grab' ? 'success' : 'info'" effect="plain">{{ modeLabel(r) }}</el-tag>
          </div>
          <div class="rule-line">挂在：{{ slotNamesOf(r) }}</div>
          <div v-for="(rd, i) in r.rounds" :key="rd.id" class="round">
            <span class="round-idx">第 {{ i + 1 }} 轮</span>
            <span class="round-body">
              {{ rd.crowds.join('、') || '—' }} · {{ timeNote(rd.open) }}<template v-if="rd.close"> → 截止 {{ timeNote(rd.close) }}</template>
              <template v-else> · 无截止</template>
              <span class="dot">·</span>{{ rd.settle === 'instant' ? '即时结算' : '截止结算' }}
            </span>
          </div>
          <div v-if="r.mode === 'review'" class="audit-line">
            审核：{{ r.rounds[0].audit.metrics.map(m => `${m.name}${m.weight}`).join(' + ') }} → {{ r.rounds[0].audit.tiebreak }}破平 · 取数 {{ r.rounds[0].audit.period }}
          </div>
          <div class="bal-line">
            余额：<strong>{{ balanceSummary3(r) }}</strong><span class="sub">{{ r.balanceNote }}</span>
          </div>
          <el-button size="small" plain @click="openRule(r)">看轮与余额</el-button>
        </div>
      </div>
    </div>

    <!-- 排班结果 -->
    <div v-else class="wrap">
      <div class="sec-head">
        <div>
          <h2>排班结果 <span class="sub">既有记录表 · 审核通过 / 兜底安排都写这一张</span></h2>
          <p>「怎么来的」区分：审核通过 / 先到先得自领 / 轮转排定 / 系统直派 / 兜底·某班次。</p>
        </div>
        <div class="filters">
          <el-select v-model="resScope" size="small" style="width: 110px">
            <el-option label="本周" value="current" />
            <el-option label="下一批" value="next" />
            <el-option label="下月" value="month" />
            <el-option label="全部" value="all" />
          </el-select>
          <el-select v-model="resCont" size="small" style="width: 130px">
            <el-option label="全部容器" value="all" />
            <el-option v-for="c in containers" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
          <el-switch v-model="onlyFallback" size="small" active-text="只看兜底" />
        </div>
      </div>

      <el-table :data="resRows" border size="small" max-height="560" empty-text="这个范围内还没有结算结果">
        <el-table-column label="日期" width="104">
          <template #default="{ row }">{{ shortDate(row.date) }}</template>
        </el-table-column>
        <el-table-column label="容器" width="96">
          <template #default="{ row }">{{ containerName3(row.containerId) }}</template>
        </el-table-column>
        <el-table-column label="时段" min-width="150">
          <template #default="{ row }">
            {{ row.shiftName }}<span class="sub">{{ row.start }}–{{ row.end }} · 净 {{ row.hours }}h</span>
          </template>
        </el-table-column>
        <el-table-column label="人员" width="80">
          <template #default="{ row }">{{ row.personName }}</template>
        </el-table-column>
        <el-table-column label="岗位" width="112">
          <template #default="{ row }">{{ row.crowd }}</template>
        </el-table-column>
        <el-table-column label="怎么排上的" min-width="220">
          <template #default="{ row }">
            <el-tag size="small" :type="wayType(row)" effect="plain">{{ row.way }}</el-tag>
            <span v-if="row.score" class="score">综合分 {{ row.score }}</span>
            <span v-if="row.fallback" class="sub">从 {{ slotNameOf(row.fromSlotId) }} 漏下来</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="unfilled" :class="{ warn: unfilledRows.length }">
        <template v-if="unfilledRows.length">
          此刻已结算时段的余量 {{ unfilledRows.length }} 条（还在申领中的时段不算）：
          {{ unfilledRows.slice(0, 4).map(u => `${shortDate(u.date)} ${u.shiftName} 剩 ${u.rest}`).join('，') }}
        </template>
        <template v-else>此刻已结算时段没有余量。</template>
      </div>
    </div>

    <!-- 新增时段：选模板 + 选规则（时段与规则解耦，建完可换） -->
    <el-dialog v-model="addVisible" title="新增时段" width="480">
      <el-form label-width="88px">
        <el-form-item label="容器">
          <span class="plain-val">{{ curCont?.name }}（{{ typeLabel(curCont?.type) }}）</span>
        </el-form-item>
        <el-form-item label="时段模板">
          <el-select v-model="addTplId" style="width: 100%">
            <el-option v-for="t in templates" :key="t.id" :label="t.name" :value="t.id" />
          </el-select>
          <div class="dlg-hint">模板只有时间形态，不含谁能领</div>
        </el-form-item>
        <el-form-item label="获取规则">
          <el-select v-model="addRuleId" style="width: 100%" clearable placeholder="先空着（做兜底承接时段）">
            <el-option v-for="r in rules" :key="r.id" :label="`${r.name}（${modeLabel(r)}）`" :value="r.id" />
          </el-select>
          <div class="dlg-hint">规则可以之后再挂或换掉</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAdd">创建并配置</el-button>
      </template>
    </el-dialog>

    <!-- 规则抽屉：轮与余额 -->
    <el-drawer v-model="drawer" :title="curRule?.name || '获取规则'" size="520px">
      <div v-if="curRule" class="drawer-body">
        <div class="row">
          <span class="k">模式</span>
          <el-radio-group v-model="curRule.mode" size="small">
            <el-radio-button v-for="m in modes" :key="m.value" :value="m.value">{{ m.label }}</el-radio-button>
          </el-radio-group>
        </div>
        <p class="hint">{{ modes.find(m => m.value === curRule.mode)?.hint }}</p>

        <h4>轮（申领期 → 截止 → 结算）</h4>
        <div v-for="(rd, i) in curRule.rounds" :key="rd.id" class="round-box">
          <div class="round-box-head">
            <strong>第 {{ i + 1 }} 轮 · {{ rd.name }}</strong>
            <span class="sub">{{ rd.crowds.join('、') }}</span>
          </div>
          <div class="kv"><span>开放</span>{{ timeNote(rd.open) }}</div>
          <div class="kv"><span>截止</span>{{ rd.close ? timeNote(rd.close) : '无截止（即时生效）' }}</div>
          <div class="kv"><span>结算</span>{{ rd.settle === 'instant' ? '即时' : '截止时在申领人里结算' }}</div>
          <div v-if="rd.audit" class="kv"><span>审核</span>
            {{ rd.audit.metrics.map(m => `${m.name}${m.weight}`).join(' + ') }} → {{ rd.audit.tiebreak }}破平
          </div>
        </div>

        <h4>余额</h4>
        <el-radio-group v-model="curRule.balance" size="small">
          <el-radio v-for="b in balances" :key="b.value" :value="b.value">{{ b.label }}</el-radio>
        </el-radio-group>
        <p class="hint">{{ balances.find(b => b.value === curRule.balance)?.hint }}</p>
        <div v-if="curRule.balance === 'sequence'" class="seq">
          <div v-for="(id, i) in curRule.fallbackSlotIds" :key="id" class="seq-row">
            <span class="seq-idx">{{ i + 1 }}</span>
            <span>{{ slotNameOf(id) }}</span>
            <span class="sub">吃当天剩余名额；与已有班次重叠就跳过这一档</span>
          </div>
        </div>
        <p class="hint">改动会立刻反映到「排班结果」——结果表是按当前配置重算的。</p>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  V3_CONTAINERS, V3_CONTAINER_TYPES, V3_SLOT_TPL, V3_MODES, BALANCE_MODES, V3_SHIFT_TPL,
  containerName3, netHours3, timeNote, weekdayLabel3, findSlot3, findRule3, modeOf3
} from '../mock/scheduleV3.js'
import {
  v3, batch3, ruleSummary3, balanceSummary3, shiftOf3Row as sh, createSlot3
} from '../mock/scheduleV3Store.js'

const router = useRouter()
const tabs = [
  { value: 'slot', label: '时段' },
  { value: 'tpl', label: '时段模板' },
  { value: 'rule', label: '获取规则' },
  { value: 'result', label: '排班结果' }
]
const tab = ref('slot')
const containers = V3_CONTAINERS
const templates = V3_SLOT_TPL
const modes = V3_MODES
const balances = BALANCE_MODES
const rules = computed(() => v3.rules)
const typeLabel = v => (V3_CONTAINER_TYPES.find(t => t.value === v) || {}).label || v

const contId = ref(V3_CONTAINERS[0].id)
const curCont = computed(() => containers.find(c => c.id === contId.value))
const slotsHere = computed(() => v3.slots.filter(s => s.containerId === contId.value))
const ruleOf = slot => findRule3(v3.ruleOf[slot.id])
const modeLabel = rule => modeOf3(rule.mode).label

const daysText = days => {
  const d = [...new Set(days || [])].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7))
  if (d.length === 7) return '每天'
  if (d.join(',') === '1,2,3,4,5') return '工作日'
  return d.map(x => `周${'日一二三四五六'[x]}`).join('、')
}
const genText = g => {
  if (!g) return '不生成'
  const t = `${g.cadence === 'weekly' ? `每周${'日一二三四五六'[g.weekday]}` : `每月 ${g.day} 日`} ${g.time}`
  return `${t} · ${g.horizon === 'month' ? '铺整月' : '铺下一批'}`
}
const tplShift = t => V3_SHIFT_TPL.find(s => s.id === t.shiftTemplateId) || { name: '—', start: '--:--', end: '--:--' }

const goSlot = row => router.push({ name: 'schedule-v3-slot', params: { id: row.id } })
const addVisible = ref(false)
const addTplId = ref(V3_SLOT_TPL[0].id)
const addRuleId = ref('')
const onAddSlot = () => { addTplId.value = V3_SLOT_TPL[0].id; addRuleId.value = ''; addVisible.value = true }
const onAddFromTpl = t => { addTplId.value = t.id; addRuleId.value = ''; addVisible.value = true }
const confirmAdd = () => {
  const s = createSlot3(contId.value, addTplId.value, addRuleId.value || null)
  addVisible.value = false
  router.push({ name: 'schedule-v3-slot', params: { id: s.id } })
}

const drawer = ref(false)
const curRule = ref(null)
const openRule = r => { curRule.value = r; drawer.value = true }
const slotNamesOf = r => v3.slots.filter(s => v3.ruleOf[s.id] === r.id).map(s => s.name).join('、') || '未挂载'
const slotNameOf = id => findSlot3(id)?.name || id

/* 结果 */
const resScope = ref('current')
const resCont = ref('all')
const onlyFallback = ref(false)
const shortDate = d => `${d.slice(5)} ${weekdayLabel3(d)}`
const wayType = r => r.way === '审核通过' ? 'warning' : r.way.startsWith('兜底') ? 'danger' : r.way === '先到先得自领' ? 'success' : 'info'
const resRows = computed(() => batch3.value.results.filter(r => {
  if (resCont.value !== 'all' && r.containerId !== resCont.value) return false
  if (onlyFallback.value && !r.fallback) return false
  if (resScope.value === 'all') return true
  if (resScope.value === 'month') return r.date >= '2026-12-01' && r.date <= '2026-12-31'
  if (resScope.value === 'next') return r.date >= '2026-11-16' && r.date <= '2026-11-22'
  return r.date >= '2026-11-09' && r.date <= '2026-11-15'
}))
const unfilledRows = computed(() => batch3.value.unfilled)
</script>

<style scoped>
.page { padding: 20px 24px 60px; }
.page-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
.page-head h1 { margin: 0 0 6px; font-size: 20px; }
.ver { font-size: 12px; font-weight: 400; color: #0f6e56; border: 1px solid #9fe1cb; background: #e1f5ee; border-radius: 10px; padding: 2px 8px; margin-left: 6px; vertical-align: middle; }
.page-head p { margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6; max-width: 780px; }

.tabs { display: flex; gap: 4px; margin: 14px 0; border-bottom: 1px solid #e5e7eb; }
.tabs button { border: 0; background: none; padding: 8px 16px; font-size: 14px; color: #6b7280; cursor: pointer; border-bottom: 2px solid transparent; }
.tabs button.active { color: #0f6e56; font-weight: 500; border-bottom-color: #0f6e56; }

.layout { display: flex; gap: 16px; align-items: flex-start; }
.cont-list { width: 210px; flex: none; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; background: #fff; }
.cont-head { display: flex; justify-content: space-between; padding: 9px 12px; font-size: 12px; color: #9ca3af; background: #f9fafb; }
.cont-item { display: flex; gap: 8px; width: 100%; border: 0; background: none; padding: 10px 12px; text-align: left; cursor: pointer; border-bottom: 1px solid #f3f4f6; }
.cont-id { font-size: 12px; color: #9ca3af; }
.cont-item strong { font-size: 13px; color: #1f2937; display: flex; flex-direction: column; gap: 2px; font-weight: 500; }
.cont-item small { font-size: 11px; color: #9ca3af; font-weight: 400; }
.cont-item.on { background: #e1f5ee; }
.cont-item.on strong { color: #0f6e56; }

.main { flex: 1; min-width: 0; }
.wrap { max-width: 1080px; }
.sec-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 12px; }
.sec-head h2 { margin: 0 0 4px; font-size: 16px; }
.sec-head p { margin: 0; font-size: 12px; color: #9ca3af; line-height: 1.6; }
.sub { font-size: 12px; color: #9ca3af; font-weight: 400; margin-left: 4px; }
.name { font-weight: 500; }
.tag { margin-left: 6px; }
.net { font-size: 12px; color: #0f6e56; margin-left: 6px; }
.rule-name { font-size: 13px; }
.score { font-size: 12px; color: #0f6e56; margin-left: 8px; }
.filters { display: flex; align-items: center; gap: 8px; flex: none; }
.unfilled { margin-top: 10px; font-size: 12px; color: #6b7280; background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 6px; padding: 8px 12px; line-height: 1.6; }
.unfilled.warn { color: #92400e; background: #fef3c7; border-color: #fde68a; }

.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.tpl, .rule-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; }
.tpl-head, .rule-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.tpl-head strong, .rule-head strong { font-size: 14px; font-weight: 500; }
.tpl-meta { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #374151; background: #f9fafb; border-radius: 6px; padding: 8px 10px; }
.rule-line { font-size: 12px; color: #6b7280; }
.round { display: flex; gap: 8px; font-size: 12px; color: #374151; }
.round-idx { flex: none; color: #0f6e56; }
.round-body { line-height: 1.7; }
.dot { color: #d1d5db; margin: 0 4px; }
.audit-line { font-size: 12px; color: #6b7280; background: #f9fafb; border-radius: 6px; padding: 6px 10px; }
.bal-line { font-size: 12px; color: #374151; }
.bal-line strong { color: #0f6e56; }

.plain-val { font-size: 13px; color: #1f2937; }
.dlg-hint { font-size: 12px; color: #9ca3af; margin-top: 4px; }
.drawer-body h4 { margin: 16px 0 8px; font-size: 13px; font-weight: 500; }
.row { display: flex; align-items: center; gap: 10px; }
.k { font-size: 12px; color: #9ca3af; }
.hint { font-size: 12px; color: #9ca3af; line-height: 1.6; margin: 6px 0 0; }
.round-box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 12px; margin-bottom: 8px; background: #fafafa; }
.round-box-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; }
.round-box-head strong { font-size: 13px; font-weight: 500; }
.kv { font-size: 12px; color: #374151; line-height: 1.9; }
.kv span { display: inline-block; width: 44px; color: #9ca3af; }
.seq { margin-top: 8px; }
.seq-row { display: flex; align-items: baseline; gap: 8px; font-size: 12px; padding: 6px 0; border-bottom: 1px dashed #eee; }
.seq-idx { width: 16px; height: 16px; border-radius: 50%; background: #e1f5ee; color: #0f6e56; text-align: center; line-height: 16px; font-size: 11px; flex: none; }
</style>
