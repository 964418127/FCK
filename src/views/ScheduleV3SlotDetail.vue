<template>
  <div class="page">
    <header class="head">
      <div class="left">
        <el-button link @click="back"><el-icon><ArrowLeft /></el-icon> 返回</el-button>
        <h1>{{ slot?.name || '时段' }}</h1>
        <el-tag size="small" effect="plain">{{ containerName3(slot?.containerId) }}</el-tag>
        <el-tag v-if="slot?.source === 'custom'" size="small" type="warning" effect="plain">门店自建</el-tag>
        <el-tag size="small" type="info" effect="plain">{{ slot?.id }}</el-tag>
      </div>
      <div class="right">
        <el-button @click="back">返回列表</el-button>
      </div>
    </header>

    <el-card shadow="never" class="block">
      <template #header><span class="card-title">① 时间形态 —— 只描述「几点到几点、哪几天、几个名额、什么时候铺」</span></template>
      <el-form label-width="92px" class="compact">
        <div class="grid">
          <el-form-item label="本店班次">
            <el-select v-model="slot.shiftId" style="width: 220px">
              <el-option v-for="s in shiftsHere" :key="s.id" :label="`${s.name}（${s.start}–${s.end}）`" :value="s.id" />
            </el-select>
            <el-tag v-for="f in flags" :key="f" size="small" type="warning" effect="plain" class="tag">{{ f }}</el-tag>
          </el-form-item>
          <el-form-item label="班次名称">
            <el-input v-model="shift.name" style="width: 160px" />
          </el-form-item>
          <el-form-item label="起止">
            <el-time-select v-model="shift.start" start="06:00" end="23:30" step="00:30" style="width: 110px" />
            <span class="dash">–</span>
            <el-time-select v-model="shift.end" start="06:00" end="23:30" step="00:30" style="width: 110px" />
          </el-form-item>
          <el-form-item label="休息">
            <el-input-number v-model="shift.breakMin" :min="0" :step="15" controls-position="right" style="width: 110px" />
            <span class="unit">分钟</span>
            <span class="net">净工时 {{ netHours3(shift) }}h</span>
          </el-form-item>
          <el-form-item label="时段名称">
            <el-input v-model="slot.name" style="width: 180px" />
          </el-form-item>
          <el-form-item label="名额">
            <el-input-number v-model="slot.capacity" :min="1" :max="30" controls-position="right" style="width: 110px" />
            <span class="hint-inline">物理容量，谁都超不了</span>
          </el-form-item>
        </div>

        <el-form-item label="生效星期">
          <div class="days">
            <button
              v-for="(n, i) in weekDays" :key="i" type="button"
              :class="{ on: slot.days.includes(i) }" @click="toggleDay(i)"
            >{{ n }}</button>
          </div>
        </el-form-item>

        <el-form-item label="生成节奏">
          <el-radio-group v-model="slot.generation.cadence" size="small">
            <el-radio-button value="weekly">每周</el-radio-button>
            <el-radio-button value="monthly">每月</el-radio-button>
          </el-radio-group>
          <template v-if="slot.generation.cadence === 'weekly'">
            <el-select v-model="slot.generation.weekday" size="small" style="width: 90px; margin-left: 8px">
              <el-option v-for="(n, i) in weekDays" :key="i" :label="n" :value="i" />
            </el-select>
          </template>
          <el-input-number v-else v-model="slot.generation.day" :min="1" :max="28" size="small" controls-position="right" style="width: 90px; margin-left: 8px" />
          <el-time-select v-model="slot.generation.time" start="00:00" end="23:30" step="00:30" size="small" style="width: 100px; margin-left: 8px" />
          <el-select v-model="slot.generation.horizon" size="small" style="width: 110px; margin-left: 8px">
            <el-option label="铺下一批" value="n1" />
            <el-option label="铺整月" value="month" />
          </el-select>
          <div class="hint">生成的是名额，不是排班结果；同一批重复跑不会重复铺。</div>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="block">
      <template #header>
        <div class="card-head">
          <span class="card-title">② 名额获取 —— 独立对象，挂在这条时段上</span>
          <el-tag size="small" type="success" effect="plain">与时段解耦</el-tag>
        </div>
      </template>
      <el-form label-width="92px" class="compact">
        <el-form-item label="挂的规则">
          <el-select :model-value="v3.ruleOf[slot.id] || ''" style="width: 320px" @update:model-value="mountRule">
            <el-option label="不挂（兜底承接时段，只接别人漏下来的）" value="" />
            <el-option v-for="r in rules" :key="r.id" :label="`${r.name}（${modeLabel(r)}）`" :value="r.id" />
          </el-select>
          <div class="hint">同一套规则可以挂到多条时段；换规则不影响时段本身。</div>
        </el-form-item>
      </el-form>

      <div v-if="rule" class="rule-detail">
        <div class="rule-line">
          <el-tag size="small" :type="rule.mode === 'review' ? 'warning' : rule.mode === 'grab' ? 'success' : 'info'" effect="plain">{{ modeLabel(rule) }}</el-tag>
          <span class="rule-mode-hint">{{ modeOf3(rule.mode).hint }}</span>
        </div>
        <div v-for="(rd, i) in rule.rounds" :key="rd.id" class="round">
          <span class="r-idx">第 {{ i + 1 }} 轮</span>
          <span class="r-body">
            {{ rd.crowds.join('、') }}
            <span class="dot">·</span>{{ timeNote(rd.open) }}
            <template v-if="rd.close"><span class="dot">·</span>截止 {{ timeNote(rd.close) }}，截止时在申领人里结算</template>
            <template v-else><span class="dot">·</span>无截止，先到先得即时生效</template>
          </span>
        </div>
        <div v-if="rule.mode === 'review'" class="audit">
          审核口径：{{ rule.rounds[0].audit.metrics.map(m => `${m.name}${m.weight}`).join(' + ') }} → {{ rule.rounds[0].audit.tiebreak }}破平 · 取数 {{ rule.rounds[0].audit.period }}
        </div>
        <div class="balance">
          余额处理：<strong>{{ balanceOf3(rule.balance).label }}</strong>
          <span class="sub">{{ rule.balanceNote }}</span>
        </div>
        <div v-if="rule.fallbackSlotIds?.length" class="seq">
          <div v-for="(id, i) in rule.fallbackSlotIds" :key="id" class="seq-row">
            <span class="seq-idx">{{ i + 1 }}</span>
            <span>{{ findSlot3(id)?.name || id }}</span>
            <span class="sub">吃当天剩余名额，与已有班次重叠则跳下一档</span>
          </div>
        </div>
      </div>
      <div v-else class="empty-rule">
        这条时段不发布名额，只作为别的时段的兜底目标：名额空着，等漏下来的人填。
      </div>
    </el-card>

    <el-card shadow="never" class="block">
      <template #header><span class="card-title">③ 这几天的状态 —— 同一套配置，按当前时刻推到哪一步</span></template>
      <el-table :data="instRows" border size="small">
        <el-table-column label="日期" width="120">
          <template #default="{ row }">{{ row.date }} {{ row.week }}</template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag size="small" :type="row.state === 'settled' ? 'success' : row.state === 'open' ? 'warning' : 'info'" effect="plain">{{ stateText(row.state) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="已排 / 名额" width="110">
          <template #default="{ row }">{{ row.filled }} / {{ slot.capacity }}</template>
        </el-table-column>
        <el-table-column label="怎么分的" min-width="320">
          <template #default="{ row }">
            <span v-if="row.names.length" class="names">{{ row.names.join('、') }}</span>
            <span v-else class="sub">还没有结果</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import {
  containerName3, findShift3, findSlot3, findRule3, modeOf3, balanceOf3,
  netHours3, timeNote, weekdayLabel3
} from '../mock/scheduleV3.js'
import { v3, batch3 } from '../mock/scheduleV3Store.js'

const route = useRoute()
const router = useRouter()
const slot = computed(() => v3.slots.find(s => s.id === route.params.id))
const shift = computed(() => v3.shifts.find(s => s.id === slot.value?.shiftId) || {})
const shiftsHere = computed(() => v3.shifts.filter(s => s.containerId === slot.value?.containerId))
const rules = computed(() => v3.rules)
const rule = computed(() => (slot.value ? findRule3(v3.ruleOf[slot.value.id]) : null))
const modeLabel = r => modeOf3(r.mode).label
const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const flags = computed(() => {
  const sh = findShift3(shift.value?.id)
  if (!sh) return []
  const f = []
  if (!sh.templateId) f.push('门店自建')
  return f
})
const toggleDay = i => {
  const d = slot.value.days
  const k = d.indexOf(i)
  k === -1 ? d.push(i) : d.splice(k, 1)
}
const mountRule = v => {
  if (v) v3.ruleOf[slot.value.id] = v
  else delete v3.ruleOf[slot.value.id]
}
const stateText = s => s === 'settled' ? '已结算' : s === 'open' ? '申领中' : s === 'no-rule' ? '兜底承接' : '未开始'
const instRows = computed(() => {
  const list = batch3.value.instances.filter(i => i.slot.id === slot.value?.id)
  return list.map(i => {
    const rs = batch3.value.results.filter(r => r.slotId === i.slot.id && r.date === i.date)
    return {
      date: i.date, week: weekdayLabel3(i.date), state: i.state,
      filled: rs.length, names: rs.map(r => `${r.personName}（${r.way}）`)
    }
  })
})
const back = () => router.push({ name: 'schedule-v3' })
</script>

<style scoped>
.page { padding: 20px 24px 60px; max-width: 1080px; }
.head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.left { display: flex; align-items: center; gap: 10px; }
.left h1 { margin: 0; font-size: 20px; }
.right { display: flex; gap: 8px; }
.block { margin-bottom: 16px; }
.card-title { font-size: 14px; font-weight: 500; }
.card-head { display: flex; justify-content: space-between; align-items: center; }
.compact :deep(.el-form-item) { margin-bottom: 12px; }
.grid { display: flex; flex-wrap: wrap; gap: 0 24px; }
.tag { margin-left: 6px; }
.dash { margin: 0 6px; color: #9ca3af; }
.unit { margin-left: 6px; font-size: 12px; color: #9ca3af; }
.net { margin-left: 12px; font-size: 13px; color: #0f6e56; }
.hint-inline { margin-left: 10px; font-size: 12px; color: #9ca3af; }
.hint { font-size: 12px; color: #9ca3af; line-height: 1.6; margin-top: 4px; }
.days { display: flex; gap: 6px; }
.days button { border: 1px solid #e5e7eb; background: #fff; border-radius: 14px; padding: 4px 12px; font-size: 12px; color: #374151; cursor: pointer; }
.days button.on { background: #0f6e56; border-color: #0f6e56; color: #fff; }
.rule-detail { background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; padding: 12px 14px; }
.rule-line { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.rule-mode-hint { font-size: 12px; color: #6b7280; }
.round { display: flex; gap: 8px; font-size: 12px; color: #374151; line-height: 1.9; }
.r-idx { flex: none; color: #0f6e56; }
.dot { color: #d1d5db; margin: 0 4px; }
.audit { font-size: 12px; color: #6b7280; margin-top: 6px; }
.balance { font-size: 12px; color: #374151; margin-top: 8px; }
.balance strong { color: #0f6e56; }
.sub { font-size: 12px; color: #9ca3af; margin-left: 6px; }
.seq { margin-top: 8px; }
.seq-row { display: flex; align-items: baseline; gap: 8px; font-size: 12px; padding: 4px 0; }
.seq-idx { width: 16px; height: 16px; border-radius: 50%; background: #e1f5ee; color: #0f6e56; text-align: center; line-height: 16px; font-size: 11px; flex: none; }
.empty-rule { font-size: 12px; color: #9ca3af; background: #f9fafb; border: 1px dashed #e5e7eb; border-radius: 8px; padding: 12px 14px; line-height: 1.7; }
.names { font-size: 12px; color: #374151; line-height: 1.7; }
</style>
