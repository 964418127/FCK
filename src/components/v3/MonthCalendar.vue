<!--
  v3 移动端共用月历：可选班次（红点 = 当天可申时段数）与我的排班（红点 = 已排定、黄点 = 申领中）共用。
  点选日期回抛 select，左右切月回抛 move(delta)。打点数据由父级给 marks[date] = { red, amber }。
-->
<template>
  <div class="calendar-section">
    <div class="month-selector">
      <el-icon @click="$emit('move', -1)"><ArrowLeft /></el-icon>
      <span class="month-text">{{ year }}年{{ month }}月</span>
      <el-icon @click="$emit('move', 1)"><ArrowRight /></el-icon>
    </div>

    <div class="calendar-grid">
      <div class="calendar-header">
        <div v-for="w in weekDays" :key="w" class="calendar-day-header">{{ w }}</div>
      </div>
      <div class="calendar-body">
        <div
          v-for="(d, i) in dates"
          :key="i"
          :class="['calendar-day', {
            'today': d.date && d.date === today,
            'selected': d.date && d.date === selected,
            'has-red': d.red > 0,
            'has-amber': d.red === 0 && d.amber > 0
          }]"
          @click="d.date && $emit('select', d.date)"
        >
          <div class="day-number">{{ d.day || '' }}</div>
          <div v-if="d.red || d.amber" class="dot-row">
            <span v-for="n in Math.min(d.red, 3)" :key="'r' + n" class="dot red"></span>
            <span v-for="n in Math.min(d.amber, 3 - Math.min(d.red, 3))" :key="'a' + n" class="dot amber"></span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="legend.length" class="calendar-legend">
      <template v-for="(l, i) in legend" :key="i">
        <span :class="['dot', l.cls]"></span>{{ l.label }}
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  selected: { type: String, default: '' },
  /** marks[date] = { red: n, amber: n } */
  marks: { type: Object, default: () => ({}) },
  legend: { type: Array, default: () => [] },
  today: { type: String, default: '' }
})
defineEmits(['select', 'move'])

const weekDays = ['日', '一', '二', '三', '四', '五', '六']
const dates = computed(() => {
  const y = props.year
  const month = props.month - 1
  const firstDay = new Date(y, month, 1).getDay()
  const daysInMonth = new Date(y, month + 1, 0).getDate()
  const out = Array.from({ length: firstDay }, () => ({ day: 0, date: '', red: 0, amber: 0 }))
  for (let i = 1; i <= daysInMonth; i++) {
    const date = `${y}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    const m = props.marks[date] || {}
    out.push({ day: i, date, red: m.red || 0, amber: m.amber || 0 })
  }
  return out
})
</script>

<style scoped>
.calendar-section { background: #fff; border-radius: 12px; padding: 14px 12px 10px; margin-bottom: 12px; }
.month-selector { display: flex; align-items: center; justify-content: space-between; padding: 0 4px 12px; border-bottom: 1px solid #eee; margin-bottom: 10px; }
.month-selector .el-icon { font-size: 18px; color: #666; cursor: pointer; padding: 4px 8px; }
.month-text { font-size: 15px; font-weight: 600; color: #333; }
.calendar-grid { display: flex; flex-direction: column; }
.calendar-header { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 6px; }
.calendar-day-header { text-align: center; font-size: 11px; color: #999; padding: 4px 0; }
.calendar-body { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.calendar-day { min-height: 44px; padding: 4px; border: 1px solid transparent; border-radius: 6px; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: background .2s; }
.calendar-day.has-red { background: #fef2f2; }
.calendar-day.has-amber { background: #fff8ec; }
.calendar-day.today { border-color: #a40035; }
.calendar-day.today .day-number { color: #a40035; }
.calendar-day.selected { background: #fee2e2; border-color: #a40035; }
.calendar-day.selected .day-number { color: #a40035; }
.day-number { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 2px; }
.dot-row { display: flex; gap: 2px; }
.dot { width: 4px; height: 4px; border-radius: 50%; display: inline-block; }
.dot.red { background: #a40035; }
.dot.amber { background: #e0a300; }
.calendar-legend { display: flex; align-items: center; gap: 5px; margin-top: 10px; padding-top: 8px; border-top: 1px dashed #eee; font-size: 11px; color: #999; }
.calendar-legend .dot { margin: 0 3px 0 10px; }
.calendar-legend .dot:nth-child(1) { margin-left: 0; }
</style>
