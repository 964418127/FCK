<template>
  <div class="rb">
    <div class="rb-axis">
      <span v-for="t in ticks" :key="t" class="rb-tick" :style="{ left: pct(t) + '%' }">{{ t }}</span>
    </div>
    <div class="rb-track" :style="{ height: trackH + 'px' }">
      <div
        v-for="(s, i) in segs" :key="'std' + i" class="rb-std"
        :style="box(s.start, s.end, 0)"
      >
        <span v-if="compact === false">{{ s.label || '标准时间' }}</span>
      </div>
      <div
        v-for="(b, i) in bars" :key="'bar' + i" class="rb-bar"
        :class="{ over: b.overtimeMin > 0 }"
        :style="box(b.start, b.end, 20 + i * 20)"
        :title="`${b.name} ${b.start}-${b.end}`"
      >
        <span class="rb-name">{{ b.name }}</span>
        <span v-if="b.overtimeMin > 0" class="rb-ot">+{{ (b.overtimeMin / 60).toFixed(1) }}h</span>
      </div>
    </div>
    <div class="rb-legend">
      <i class="lg std" />标准时间（尺子，不拦）
      <i class="lg bar" />实际时段
      <i class="lg over" />超出 = 加班
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { timeMin } from '../../mock/scheduleV4.js'

const props = defineProps({
  segs: { type: Array, default: () => [] },
  bars: { type: Array, default: () => [] },
  compact: { type: Boolean, default: false }
})

const base = computed(() => timeMin('08:00'))
const span = computed(() => timeMin('23:30') - base.value)
const ticks = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00']
const trackH = computed(() => 20 + Math.max(1, props.bars.length) * 20 + 6)

const pct = t => Math.max(0, Math.min(100, ((timeMin(t) - base.value) / span.value) * 100))
const box = (start, end, top) => {
  const l = pct(start)
  const w = Math.max(1.5, pct(end) - l)
  return { left: `${l}%`, width: `${w}%`, top: `${top}px` }
}
</script>

<style scoped>
.rb { background: #fff; border: 1px solid #eef0f3; border-radius: 10px; padding: 10px 12px 8px; }
.rb-axis { position: relative; height: 16px; margin-bottom: 2px; }
.rb-tick { position: absolute; transform: translateX(-50%); font-size: 10px; color: #a8adb5; }
.rb-track { position: relative; background: #f7f8fa; border-radius: 6px; }
.rb-std {
  position: absolute; height: 14px; background: #faeeda; border: 1px dashed #ba7517;
  border-radius: 3px; display: flex; align-items: center; justify-content: center;
}
.rb-std span { font-size: 10px; color: #854f0b; white-space: nowrap; }
.rb-bar {
  position: absolute; height: 16px; background: #9fe1cb; border-radius: 3px;
  display: flex; align-items: center; gap: 2px; padding: 0 4px; overflow: hidden;
}
.rb-bar.over { background: #f5c4b3; }
.rb-name { font-size: 10px; color: #04342c; white-space: nowrap; }
.rb-ot { font-size: 9px; color: #993c1d; white-space: nowrap; }
.rb-legend { display: flex; align-items: center; gap: 6px; margin-top: 6px; font-size: 10px; color: #9096a0; }
.lg { width: 8px; height: 8px; border-radius: 2px; display: inline-block; }
.lg.std { background: #faeeda; border: 1px dashed #ba7517; }
.lg.bar { background: #9fe1cb; }
.lg.over { background: #f5c4b3; }
</style>
