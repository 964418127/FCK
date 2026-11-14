<template>
  <div class="quota">
    <div class="q-row">
      <el-select :model-value="q.service" size="small" style="width: 120px" @update:model-value="setService">
        <el-option v-for="s in services" :key="s.value" :label="s.label" :value="s.value" />
      </el-select>

      <template v-if="q.service === 'headcount'">
        <span class="k">在册</span>
        <el-input-number :model-value="q.params.headcount" :min="1" :max="99" size="small" controls-position="right" style="width: 80px" @update:model-value="setParam('headcount', $event)" />
        <span class="k">人 × 系数</span>
        <el-input-number :model-value="q.params.factor" :min="0.1" :max="3" :step="0.05" :precision="2" size="small" controls-position="right" style="width: 90px" @update:model-value="setParam('factor', $event)" />
      </template>
      <template v-else-if="q.service === 'volume'">
        <span class="k">需求</span>
        <el-input-number :model-value="q.params.volumeHours" :min="1" :max="200" size="small" controls-position="right" style="width: 80px" @update:model-value="setParam('volumeHours', $event)" />
        <span class="k">h ÷ 单班净</span>
        <el-input-number :model-value="q.params.shiftHours" :min="1" :max="16" size="small" controls-position="right" style="width: 80px" @update:model-value="setParam('shiftHours', $event)" />
        <span class="k">h</span>
      </template>
      <template v-else-if="q.service === 'signRatio'">
        <span class="k">签约</span>
        <el-input-number :model-value="q.params.signed" :min="1" :max="99" size="small" controls-position="right" style="width: 80px" @update:model-value="setParam('signed', $event)" />
        <span class="k">人 ÷</span>
        <el-input-number :model-value="q.params.divisor" :min="1" :max="6" size="small" controls-position="right" style="width: 70px" @update:model-value="setParam('divisor', $event)" />
        <span class="k">向上取整</span>
      </template>
      <template v-else>
        <span class="k">固定</span>
        <el-input-number :model-value="q.params.value" :min="1" :max="30" size="small" controls-position="right" style="width: 80px" @update:model-value="setParam('value', $event)" />
        <span class="k">个</span>
      </template>

      <span class="k gap">改动期</span>
      <el-input-number :model-value="q.windowMin" :min="5" :step="5" size="small" controls-position="right" style="width: 80px" @update:model-value="setWindow" />
      <span class="k">分钟</span>
    </div>
    <div class="chain">
      <span class="node">服务算 <b>{{ calc.computed }}</b></span>
      <span class="arrow">→</span>
      <span class="node">改动期 {{ q.windowMin }} 分钟<small>人事 / 店长可调，最少 5 分钟</small></span>
      <span class="arrow">→</span>
      <span class="node on">名额生效 <b>{{ calc.effective }}</b></span>
      <span class="formula">{{ calc.formula }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { V3_QUOTA_SERVICES, QUOTA_WINDOW_MIN, quotaCalc3, quotaOf3 } from '../../mock/scheduleV3.js'

const props = defineProps({ modelValue: { type: Object, default: null } })
const emit = defineEmits(['update:modelValue'])
const services = V3_QUOTA_SERVICES

const q = computed(() => quotaOf3({ quota: props.modelValue }))
const calc = computed(() => quotaCalc3({ quota: q.value }))

const patch = next => emit('update:modelValue', { ...q.value, ...next })
const defaultsOf = service => ({
  headcount: { headcount: 8, factor: 0.75 },
  volume: { volumeHours: 24, shiftHours: 8 },
  signRatio: { signed: 8, divisor: 2 },
  fixed: { value: calc.value.effective || 1 }
}[service])
const setService = service => patch({ service, params: defaultsOf(service) })
const setParam = (key, val) => patch({ params: { ...q.value.params, [key]: val ?? 1 } })
const setWindow = val => patch({ windowMin: Math.max(QUOTA_WINDOW_MIN, val || QUOTA_WINDOW_MIN) })
</script>

<style scoped>
.quota { width: 100%; }
.q-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.k { font-size: 12px; color: #6b7280; }
.k.gap { margin-left: 6px; }
.chain { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 8px; font-size: 12px; color: #374151; }
.node { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 3px 10px; display: inline-flex; align-items: center; gap: 4px; }
.node b { color: #0f6e56; }
.node small { color: #9ca3af; margin-left: 4px; font-size: 11px; }
.node.on { background: #e1f5ee; border-color: #9fe1cb; }
.arrow { color: #d1d5db; }
.formula { color: #9ca3af; font-size: 11px; margin-left: 4px; }
</style>
