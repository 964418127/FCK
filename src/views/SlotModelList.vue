<template>
  <div class="task-management">
    <header class="management-header">
      <div>
        <h1>排班策略 v2</h1>
        <p>已归档的对照版本：各岗位共用的时段配置：容器（门店等）把时间切成时段，每条时段按生成节奏铺出名额实例，定名额、定「谁可以先领」。配置语言和展示语言分离——页面说人话，规则字段点进去才看。</p>
      </div>
    </header>

    <div class="page-tabs" role="tablist">
      <button type="button" role="tab" :aria-selected="pageTab === 'cycle'" :class="{ active: pageTab === 'cycle' }" @click="pageTab = 'cycle'">周期时段</button>
      <button type="button" role="tab" :aria-selected="pageTab === 'temp'" :class="{ active: pageTab === 'temp' }" @click="pageTab = 'temp'">临时时段</button>
      <button type="button" role="tab" :aria-selected="pageTab === 'tpl'" :class="{ active: pageTab === 'tpl' }" @click="pageTab = 'tpl'">时段模板</button>
      <button type="button" role="tab" :aria-selected="pageTab === 'result'" :class="{ active: pageTab === 'result' }" @click="pageTab = 'result'">排班结果</button>
    </div>

    <div class="configuration-layout">
      <!-- 左侧容器列表（门店是容器类型之一；时段的打卡考勤按容器归属关联） -->
      <aside v-if="pageTab === 'cycle'" class="store-list">
        <div class="store-list-header"><span>编码</span><span>容器名称</span></div>
        <div class="store-list-body">
          <button
            v-for="p in places" :key="p.id"
            :class="['store-option', { selected: selectedPlaceId === p.id }]"
            :aria-pressed="selectedPlaceId === p.id"
            @click="selectedPlaceId = p.id"
          >
            <span>{{ p.id }}</span>
            <strong>{{ p.name }}<small>{{ typeLabel(p.type) }}</small></strong>
          </button>
        </div>
      </aside>

      <main class="configuration-content">
        <!-- 周期时段 -->
        <template v-if="pageTab === 'cycle'">
          <div class="section-heading">
            <div>
              <h2>{{ place.name }} <span class="store-code">{{ typeLabel(place.type) }}容器</span></h2>
              <p>营业时间 {{ place.openTime }} - {{ place.closeTime }}</p>
            </div>
            <el-button type="primary" :icon="Plus" @click="onAdd(place.id)">新增时段</el-button>
          </div>

          <div class="weekday-tabs" aria-label="选择星期">
            <button
              v-for="d in weekdayOptions" :key="d.value"
              :class="{ active: selectedDay === d.value, has: daySlots(d.value).length }"
              @click="selectedDay = d.value"
            >{{ d.label }}</button>
          </div>

          <div class="day-heading">
            <h3>{{ weekdayLabel(selectedDay) }} · {{ place.name }}的时段</h3>
            <span>{{ daySlots(selectedDay).length }} 个时段 · {{ daySlots(selectedDay).reduce((s, r) => s + r.capacity.value, 0) }} 个名额</span>
          </div>

          <el-table :data="daySlots(selectedDay)" border size="small" empty-text="这一天没有安排时段">
            <el-table-column label="时段" min-width="170">
              <template #default="{ row }">
                <span class="slot-name">{{ shiftOfRow(row).name }}</span>
                <el-tag v-for="f in flagsOfRow(row)" :key="f" size="small" type="warning" effect="plain" class="adj-tag">{{ f }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="起止 · 时长" width="185">
              <template #default="{ row }">
                {{ shiftOfRow(row).start }} - {{ shiftOfRow(row).end }}
                <span class="net-hours">净 {{ netHours(row) }}h</span>
                <span v-if="shiftOfRow(row).breakMin" class="cell-sub">休 {{ shiftOfRow(row).breakMin }} 分</span>
              </template>
            </el-table-column>
            <el-table-column label="名额" width="70" align="center">
              <template #default="{ row }">{{ row.capacity.value }}</template>
            </el-table-column>
            <el-table-column label="生成" width="158">
              <template #default="{ row }">
                <span class="cell-sub">{{ genShort(row.generation) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="名额怎么分" min-width="300">
              <template #default="{ row }">
                <span class="flow-text">{{ slotFlow(row) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="须分完" width="70" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.required" size="small" type="danger" effect="plain">须分完</el-tag>
                <span v-else class="cell-sub">—</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="goDetail(row)">配置</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 概览跟随生成视野：按月生成的容器 → 整月日历；按周 → 一周网格 -->
          <div class="ov-head">
            <h3 class="weekly-heading">名额生成视野 · {{ isMonthView ? `整月（${monthGrid.label}）` : '下一批（一周）' }}</h3>
            <span class="ov-note">{{ genNote }}</span>
          </div>

          <div v-if="isMonthView" class="month-grid">
            <div v-for="d in weekdayOptions" :key="'mh' + d.value" class="month-head">{{ d.label }}</div>
            <template v-for="(row, ri) in monthGrid.rows" :key="'mr' + ri">
              <div v-for="(d, ci) in row" :key="'mc' + ri + '-' + ci" class="month-cell" :class="{ empty: d === null }">
                <template v-if="d !== null">
                  <span class="month-day">{{ d }}</span>
                  <div v-for="row2 in monthCellSlots(ci)" :key="row2.id" class="week-slot" :class="{ opt: !row2.required }">
                    <span>{{ shiftOfRow(row2).name }} {{ row2.capacity.value }} 名额</span>
                  </div>
                </template>
              </div>
            </template>
          </div>

          <div v-else class="week-overview">
            <div v-for="d in weekdayOptions" :key="d.value" class="week-column">
              <strong>{{ d.label }}</strong>
              <div v-for="row in daySlots(d.value)" :key="row.id" class="week-slot" :class="{ opt: !row.required }">
                <span>{{ shiftOfRow(row).name }} {{ shiftOfRow(row).start }} - {{ shiftOfRow(row).end }}</span>
                <small>{{ row.capacity.value }} 个名额 · {{ shortFlow(row) }}</small>
              </div>
              <span v-if="!daySlots(d.value).length" class="muted">无时段</span>
            </div>
          </div>
        </template>

        <!-- 时段通用模板 -->
        <template v-else-if="pageTab === 'tpl'">
          <div class="section-heading">
            <div>
              <h2>时段通用模板 <span class="store-code">总部维护 · {{ slotTemplates.length }} 条</span></h2>
              <p>新增时段的起点：选一个模板按容器实例化，之后一切字段可改。改模板不影响已创建的时段——实例是引用时的快照，不会因为模板变更而崩坏。</p>
            </div>
          </div>
          <div class="tpl-grid">
            <div v-for="t in slotTemplates" :key="t.id" class="tpl-card">
              <div class="tpl-head">
                <strong>{{ t.name }}</strong>
                <el-tag size="small" effect="plain">{{ t.id }}</el-tag>
              </div>
              <p class="tpl-desc">{{ t.desc }}</p>
              <div class="tpl-meta">
                <span>班次引用：{{ tplShiftText(t) }}</span>
                <span>{{ daysLabel(t.body.days) }} · {{ t.body.capacity.value }} 个名额 · {{ claimShort(t.body.claim) }}</span>
                <span>生成：{{ genHorizonNote(t.body.generation) }}</span>
                <span class="tpl-flow">{{ slotFlow(t.body) }}</span>
              </div>
              <el-button size="small" type="primary" plain @click="onAddWithTpl(t)">用此模板新增时段</el-button>
            </div>
          </div>
        </template>

        <!-- 临时时段 -->
        <template v-else-if="pageTab === 'temp'">
          <div class="section-heading">
            <div><h2>临时时段</h2><p>指定日期一次性发布，不分档：资格够的人按签约早晚直接派，只发通知</p></div>
            <el-button type="primary" :icon="Plus" @click="onAddTemp">发布临时时段</el-button>
          </div>
          <el-table :data="tempSlots" border size="small" empty-text="还没有临时时段">
            <el-table-column label="容器" width="130">
              <template #default="{ row }">{{ containerLabel(row.containerId) }}</template>
            </el-table-column>
            <el-table-column label="日期 · 时段" width="200">
              <template #default="{ row }">
                {{ row.date }}<span class="cell-sub">{{ shiftOfRow(row).start }} - {{ shiftOfRow(row).end }}</span>
              </template>
            </el-table-column>
            <el-table-column label="时段名称" width="110">
              <template #default="{ row }">{{ shiftOfRow(row).name }}</template>
            </el-table-column>
            <el-table-column label="名额" width="70" align="center">
              <template #default="{ row }">{{ row.capacity.value }}</template>
            </el-table-column>
            <el-table-column label="名额怎么分" min-width="320">
              <template #default="{ row }"><span class="flow-text">{{ slotFlow(row) }}</span></template>
            </el-table-column>
            <el-table-column label="须分完" width="70" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.required" size="small" type="danger" effect="plain">须分完</el-tag>
                <span v-else class="cell-sub">—</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="goDetail(row)">配置</el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>

        <!-- 排班结果：消化完成后直写排班记录的模拟 -->
        <template v-else>
          <div class="section-heading">
            <div>
              <h2>排班结果 <span class="store-code">模拟：名额消化完成后直写排班记录</span></h2>
              <p>生成时钟铺出名额实例 → 各窗口各层按人群与规则消化 → 排班结果直接写入。下面是消化完成后的名单，以及每个人「怎么排上的」。</p>
            </div>
          </div>

          <div class="crowd-chips" aria-label="按岗位筛选">
            <button
              v-for="c in crowdChips" :key="c"
              :class="{ active: crowdFilter === c }"
              @click="crowdFilter = c"
            >{{ c }}</button>
          </div>

          <div class="ov-head">
            <h3 class="weekly-heading">下一批周期排班 · {{ batchText }}</h3>
            <span class="ov-note">{{ weekEntries.length }} 条排班 · 涉及 {{ weekPeopleCount }} 人</span>
          </div>
          <el-table :data="weekEntries" border size="small" max-height="520">
            <el-table-column label="日期" width="110">
              <template #default="{ row }">{{ dateLabel(row.date) }}</template>
            </el-table-column>
            <el-table-column label="容器" width="100">
              <template #default="{ row }">{{ containerLabel(row.containerId) }}</template>
            </el-table-column>
            <el-table-column label="时段" min-width="150">
              <template #default="{ row }">
                {{ row.shiftName }}<span class="cell-sub">{{ row.time }} · 净 {{ row.hours }}h</span>
              </template>
            </el-table-column>
            <el-table-column label="人员" width="80">
              <template #default="{ row }">{{ row.personName }}</template>
            </el-table-column>
            <el-table-column label="岗位" width="120">
              <template #default="{ row }">{{ row.crowd }}</template>
            </el-table-column>
            <el-table-column label="怎么排上的" min-width="230">
              <template #default="{ row }">
                <el-tag size="small" :type="row.way.startsWith('系统') ? 'info' : row.way === '业绩竞标' ? 'warning' : 'success'" effect="plain">{{ row.way }}</el-tag>
                <span class="cell-sub">{{ row.note }}</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="unfilled-line" :class="{ warn: hasUnfilled }">{{ unfilledNote }}</div>

          <div class="ov-head">
            <h3 class="weekly-heading">临时时段（一次性）</h3>
            <span class="ov-note">指定日期独立发布，不分档</span>
          </div>
          <el-table :data="tempEntries" border size="small" empty-text="没有临时时段的排班">
            <el-table-column label="日期" width="110">
              <template #default="{ row }">{{ dateLabel(row.date) }}</template>
            </el-table-column>
            <el-table-column label="容器" width="100">
              <template #default="{ row }">{{ containerLabel(row.containerId) }}</template>
            </el-table-column>
            <el-table-column label="时段" min-width="150">
              <template #default="{ row }">
                {{ row.shiftName }}<span class="cell-sub">{{ row.time }} · 净 {{ row.hours }}h</span>
              </template>
            </el-table-column>
            <el-table-column label="人员" width="80">
              <template #default="{ row }">{{ row.personName }}</template>
            </el-table-column>
            <el-table-column label="岗位" width="120">
              <template #default="{ row }">{{ row.crowd }}</template>
            </el-table-column>
            <el-table-column label="怎么排上的" min-width="230">
              <template #default="{ row }">
                <el-tag size="small" type="info" effect="plain">{{ row.way }}</el-tag>
                <span class="cell-sub">{{ row.note }}</span>
              </template>
            </el-table-column>
          </el-table>

          <div class="ov-head">
            <h3 class="weekly-heading">按月排班 · {{ monthLabel }}</h3>
            <span class="ov-note">每月 25 日铺出下月整月名额，月初错峰自领、月末兜底指派</span>
          </div>
          <div class="month-grid">
            <div v-for="d in weekdayOptions" :key="'rh' + d.value" class="month-head">{{ d.label }}</div>
            <template v-for="(cell, ri) in monthCells" :key="'rc' + ri">
              <div v-if="cell === null" class="month-cell empty" />
              <div v-else class="month-cell">
                <span class="month-day">{{ cell.day }}</span>
                <div v-for="g in cell.groups" :key="g.slotId" class="month-group">
                  <strong>{{ g.shiftName }}</strong>
                  <small>{{ g.names.join('、') }}</small>
                </div>
                <span v-if="!cell.groups.length" class="muted">—</span>
              </div>
            </template>
          </div>
        </template>
      </main>
    </div>

    <!-- 新增时段：选容器 + 时段通用模板 + 类型（实例化后一切字段可改） -->
    <el-dialog v-model="addVisible" title="新增时段" width="480">
      <el-form label-width="84px">
        <el-form-item label="所属容器">
          <el-select v-model="addPlaceId" style="width: 100%">
            <el-option v-for="p in places" :key="p.id" :label="`${p.name}（${typeLabel(p.type)}）`" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="时段模板">
          <el-select v-model="addSlotTplId" style="width: 100%">
            <el-option v-for="t in slotTemplates" :key="t.id" :label="tplLabel(t)" :value="t.id">
              <span>{{ tplLabel(t) }}</span>
              <span class="opt-days">{{ daysLabel(t.body.days) }}</span>
            </el-option>
          </el-select>
          <div class="dialog-hint">{{ tplHint(addSlotTplId) }}</div>
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="addKind">
            <el-radio v-for="k in slotKinds" :key="k.value" :value="k.value">{{ k.label }}</el-radio>
          </el-radio-group>
          <div class="dialog-hint">{{ kindHint(addKind) }}</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!addSlotTplId || !addPlaceId" @click="confirmAdd">创建并配置</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import {
  CONTAINERS, CONTAINER_TYPES, SLOT_KINDS, WEEKDAY_NAMES,
  SLOT_TEMPLATES, findSlotTemplate, findTemplate,
  netHours, shiftFlags, kindOf, containerLabel, genShort, genHorizonNote, slotFlow,
  daysLabel, claimShort
} from '../mock/slotModel.js'
import { slotList, createSlot, shiftsOf } from '../mock/slotModelStore.js'
import {
  simulate, batchLabel, nextMonthLabel, weekdayLabel as dayLabelOf
} from '../mock/slotSim.js'

const router = useRouter()
const places = CONTAINERS
const typeLabel = v => (CONTAINER_TYPES.find(t => t.value === v) || {}).label || v
const slotTemplates = SLOT_TEMPLATES
const slotKinds = SLOT_KINDS
const tplShiftText = t => {
  const sh = findTemplate(t.shiftTemplateId)
  return sh ? `${sh.name} ${sh.start}–${sh.end}` : '—'
}
/** 下拉选项文案：模板名 · 班次 + 起止（表达「周几什么时段」由 hint 补充） */
const tplLabel = t => `${t.name} · ${tplShiftText(t)}`

const pageTab = ref('cycle')
const selectedPlaceId = ref(places[0].id)
const selectedDay = ref(6)
const place = computed(() => places.find(p => p.id === selectedPlaceId.value) || places[0])

const weekdayOptions = [1, 2, 3, 4, 5, 6, 0].map(d => ({ value: d, label: `周${WEEKDAY_NAMES[d]}` }))
const weekdayLabel = v => `周${WEEKDAY_NAMES[v]}`

const slotsOf = containerId => slotList.filter(s => s.containerId === containerId)
const cycleSlots = computed(() => slotsOf(selectedPlaceId.value).filter(s => s.kind === 'cycle'))
const tempSlots = computed(() => slotList.filter(s => s.kind === 'temp'))
const daySlots = day => cycleSlots.value.filter(s => (s.days || []).includes(day))

const shiftOfRow = row => shiftsOf(row.containerId).find(p => p.id === row.shiftId) || { name: '未挂班次', start: '--:--', end: '--:--', breakMin: 0 }
const flagsOfRow = row => shiftFlags(shiftOfRow(row))
const shortFlow = slot => {
  const parts = slotFlow(slot).split(' → ')
  return parts.length > 2 ? `${parts[0]} → … → ${parts[parts.length - 1]}` : slotFlow(slot)
}

const goDetail = row => router.push({ name: 'slot-model-detail', params: { id: row.id } })

const addVisible = ref(false)
const addPlaceId = ref('')
const addSlotTplId = ref('ST-05')
const addKind = ref('cycle')
const kindHint = v => kindOf(v).hint
const tplHint = id => {
  const t = findSlotTemplate(id)
  if (!t) return ''
  const days = daysLabel(t.body.days)
  return `${t.desc}｜${tplShiftText(t)} · ${days}`
}
const onAddWithTpl = t => { addPlaceId.value = selectedPlaceId.value; addSlotTplId.value = t.id; addKind.value = 'cycle'; addVisible.value = true }
const onAdd = containerId => { addPlaceId.value = containerId; addSlotTplId.value = 'ST-05'; addKind.value = 'cycle'; addVisible.value = true }
const onAddTemp = () => { addPlaceId.value = selectedPlaceId.value; addSlotTplId.value = 'ST-02'; addKind.value = 'temp'; addVisible.value = true }
const confirmAdd = () => {
  const s = createSlot(addPlaceId.value, addSlotTplId.value, addKind.value)
  addVisible.value = false
  router.push({ name: 'slot-model-detail', params: { id: s.id } })
}

/* ---- 概览跟随生成视野：容器里有按月生成的时段 → 整月日历；否则一周 ---- */
const monthlySlots = computed(() => cycleSlots.value.filter(s => s.generation?.horizon === 'month'))
const isMonthView = computed(() => monthlySlots.value.length > 0)
const genNote = computed(() => {
  const notes = monthlySlots.value.map(s => genHorizonNote(s.generation))
  const weekly = cycleSlots.value.filter(s => s.generation && s.generation.horizon !== 'month')
  return [...notes, ...weekly.map(s => `${genShort(s.generation)} 随批生成`)].join('；')
})
const monthGrid = computed(() => {
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth() + 1, 1) // 下月 1 号
  const y = first.getFullYear(), m = first.getMonth()
  const total = new Date(y, m + 1, 0).getDate()
  const offset = (first.getDay() + 6) % 7 // 周一为第一列
  const cells = Array.from({ length: offset }, () => null)
  for (let d = 1; d <= total; d++) cells.push(d)
  while (cells.length % 7) cells.push(null)
  const rows = []
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
  return { label: `${y} 年 ${m + 1} 月`, rows }
})
/** 月视图格子里的时段：按该列对应的星期取 */
const monthCellSlots = colIndex => daySlots(weekdayOptions[colIndex].value)

/* ---- 排班结果：名额消化完成后直写记录的模拟（四类岗位 + 其他人群全覆盖） ---- */
const CROWD_ORDER = ['全日制推拿师', '非全推拿师', '全日制客户经理', '非全客户经理', '储备客户经理', '保洁', '全栈工程师']
const crowdFilter = ref('全部')
const sim = computed(() => {
  try { return simulate(new Date(), slotList) } catch { return { entries: [], unfilled: [] } }
})
const crowdChips = computed(() => [
  '全部',
  ...CROWD_ORDER.filter(c => sim.value.entries.some(e => e.crowd === c))
])
const matchCrowd = e => crowdFilter.value === '全部' || e.crowd === crowdFilter.value
const weekEntries = computed(() => sim.value.entries.filter(e => e.scope === 'week' && matchCrowd(e)))
const tempEntries = computed(() => sim.value.entries.filter(e => e.scope === 'temp' && matchCrowd(e)))
const weekPeopleCount = computed(() => new Set(weekEntries.value.map(e => e.personId)).size)
const batchText = batchLabel()
const monthLabel = nextMonthLabel()
const dateLabel = d => `${d.slice(5)} ${dayLabelOf(d)}`
const hasUnfilled = computed(() => sim.value.unfilled.length > 0)
const unfilledNote = computed(() => {
  const u = sim.value.unfilled
  if (!u.length) return '本批名额全部消化，无落空。'
  return `落空名额 ${u.reduce((s, x) => s + x.rest, 0)} 个 → ${u[0].leftover}（如 ${u[0].date} ${u[0].shiftName}）`
})
/** 下月整月格子：每格里按时段分组列名单 */
const monthCells = computed(() => {
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const y = first.getFullYear(); const m = first.getMonth()
  const total = new Date(y, m + 1, 0).getDate()
  const offset = (first.getDay() + 6) % 7 // 周一为第一列
  const cells = Array.from({ length: offset }, () => null)
  const pad = n => String(n).padStart(2, '0')
  for (let d = 1; d <= total; d++) {
    const date = `${y}-${pad(m + 1)}-${pad(d)}`
    const es = sim.value.entries.filter(e => e.scope === 'month' && e.date === date && matchCrowd(e))
    const groups = []
    for (const e of es) {
      const g = groups.find(x => x.slotId === e.slotId)
      if (g) g.names.push(e.personName)
      else groups.push({ slotId: e.slotId, shiftName: e.shiftName, names: [e.personName] })
    }
    cells.push({ day: d, date, groups })
  }
  while (cells.length % 7) cells.push(null)
  return cells
})
</script>

<style scoped>
.task-management { padding: 20px 24px 40px; }
.management-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
.management-header h1 { margin: 0 0 6px; font-size: 20px; }
.management-header p { margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6; max-width: 720px; }

.page-tabs { display: flex; gap: 4px; margin-bottom: 14px; border-bottom: 1px solid #e5e7eb; }
.page-tabs button { border: none; background: none; padding: 8px 16px; font-size: 14px; color: #6b7280; cursor: pointer; border-bottom: 2px solid transparent; }
.page-tabs button.active { color: #534ab7; font-weight: 500; border-bottom-color: #534ab7; }

.configuration-layout { display: flex; gap: 16px; align-items: flex-start; }
.store-list { width: 220px; flex-shrink: 0; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; background: #fff; }
.store-list-header { display: flex; justify-content: space-between; padding: 10px 14px; font-size: 12px; color: #9ca3af; background: #f9fafb; }
.store-list-body { max-height: 480px; overflow: auto; }
.store-option { display: flex; gap: 10px; width: 100%; border: none; background: none; padding: 10px 14px; text-align: left; cursor: pointer; border-bottom: 1px solid #f3f4f6; }
.store-option span { font-size: 12px; color: #9ca3af; }
.store-option strong { font-size: 13px; color: #1f2937; display: flex; flex-direction: column; gap: 2px; }
.store-option small { font-size: 11px; color: #9ca3af; font-weight: 400; }
.store-option.selected { background: #f0eefc; }
.store-option.selected strong { color: #534ab7; }

.configuration-content { flex: 1; min-width: 0; }
.section-heading { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.section-heading h2 { margin: 0 0 4px; font-size: 16px; }
.section-heading p { margin: 0; color: #9ca3af; font-size: 12px; }
.store-code { font-size: 12px; color: #9ca3af; font-weight: 400; margin-left: 6px; }

.weekday-tabs { display: flex; gap: 6px; margin-bottom: 12px; }
.weekday-tabs button { border: 1px solid #e5e7eb; background: #fff; border-radius: 16px; padding: 5px 14px; font-size: 13px; color: #374151; cursor: pointer; }
.weekday-tabs button.active { background: #534ab7; border-color: #534ab7; color: #fff; }
.weekday-tabs button.has { border-color: #b9b2ee; }

.day-heading { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
.day-heading h3 { margin: 0; font-size: 14px; }
.day-heading span { font-size: 12px; color: #9ca3af; }

.slot-name { font-weight: 500; }
.adj-tag { margin-left: 6px; }
.net-hours { font-size: 12px; color: #185fa5; margin-left: 6px; }
.cell-sub { font-size: 12px; color: #9ca3af; margin-left: 6px; }
.flow-text { font-size: 12px; color: #374151; line-height: 1.5; }

.weekly-heading { margin: 0; font-size: 14px; }
.ov-head { display: flex; justify-content: space-between; align-items: baseline; margin: 18px 0 8px; }
.ov-note { font-size: 12px; color: #9ca3af; }
.week-overview { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
.month-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
.month-head { font-size: 12px; color: #6b7280; text-align: center; padding: 2px 0; }
.month-cell { background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 6px; padding: 5px; min-height: 58px; }
.month-cell.empty { background: transparent; border-color: transparent; }
.month-day { font-size: 11px; color: #9ca3af; display: block; margin-bottom: 4px; }
.week-column { background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; padding: 8px; min-height: 72px; }
.week-column strong { font-size: 12px; color: #374151; display: block; margin-bottom: 6px; }
.week-slot { background: #fff; border: 1px solid #e5e7eb; border-left: 3px solid #534ab7; border-radius: 6px; padding: 5px 8px; margin-bottom: 5px; }
.week-slot.opt { border-left-color: #0f6e56; }
.week-slot span { font-size: 11px; display: block; color: #1f2937; }
.week-slot small { font-size: 10px; color: #9ca3af; }

/* 排班结果页签 */
.crowd-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
.crowd-chips button { border: 1px solid #e5e7eb; background: #fff; border-radius: 16px; padding: 5px 14px; font-size: 13px; color: #374151; cursor: pointer; }
.crowd-chips button.active { background: #534ab7; border-color: #534ab7; color: #fff; }
.unfilled-line { margin: 10px 0 0; font-size: 12px; color: #6b7280; background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 6px; padding: 8px 12px; }
.unfilled-line.warn { color: #92400e; background: #fef3c7; border-color: #fde68a; }
.month-group { background: #fff; border: 1px solid #e5e7eb; border-left: 3px solid #534ab7; border-radius: 5px; padding: 3px 6px; margin-bottom: 4px; }
.month-group strong { display: block; font-size: 11px; color: #1f2937; font-weight: 500; }
.month-group small { display: block; font-size: 10px; color: #6b7280; line-height: 1.5; }
.muted { font-size: 11px; color: #d1d5db; }
.opt-days { float: right; font-size: 12px; color: #9ca3af; }

.tpl-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.tpl-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; }
.tpl-head { display: flex; justify-content: space-between; align-items: center; }
.tpl-head strong { font-size: 14px; }
.tpl-desc { margin: 0; font-size: 12px; color: #6b7280; line-height: 1.6; }
.tpl-meta { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #374151; background: #f9fafb; border-radius: 6px; padding: 8px 10px; }
.tpl-flow { color: #534ab7; line-height: 1.5; }
.dialog-hint { font-size: 12px; color: #9ca3af; line-height: 1.5; margin-top: 4px; }
</style>
