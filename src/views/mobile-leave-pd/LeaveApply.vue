<template>
  <div class="pd-apply">
    <div class="page-header">
      <el-icon class="back-icon" @click="goBack"><ArrowLeft /></el-icon>
      <h1>休假申请</h1>
      <span class="pd-tag">预设计</span>
    </div>

    <div class="content">
      <!-- 谁在请假 -->
      <div class="card who">
        <span class="who-name">{{ emp.name }}</span>
        <span class="who-meta">{{ emp.job }}</span>
        <span class="who-meta">{{ emp.store }}</span>
        <span class="who-meta">{{ emp.staffNo }}</span>
      </div>

      <!-- 类型 -->
      <div class="card">
        <div class="sec-title">休假类型</div>
        <div v-for="g in groups" :key="g.channel" class="type-group">
          <div class="group-label">{{ g.channel }}</div>
          <div class="type-chips">
            <span
              v-for="t in g.items"
              :key="t.id"
              :class="['type-chip', { on: form.typeId === t.id, disabled: disabledType(t) }]"
              @click="pickType(t)"
            >
              {{ t.name }}
            </span>
          </div>
        </div>
        <div v-if="type" class="field-desc">{{ type.desc }}</div>
      </div>

      <!-- 表单 -->
      <div v-if="type" class="card">
        <div class="sec-title">休假信息</div>

        <div class="field">
          <span class="fl">{{ type.mode === 'event' || type.mode === 'range' || type.mode === 'chain' ? '休假日期' : '休假日期' }}</span>
          <el-date-picker
            v-if="isRange"
            v-model="form.range"
            type="daterange"
            value-format="YYYY-MM-DD"
            size="small"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%"
          />
          <el-date-picker
            v-else
            v-model="form.date"
            type="date"
            value-format="YYYY-MM-DD"
            size="small"
            placeholder="选择日期"
            style="width: 100%"
          />
        </div>

        <div v-if="type.mode === 'segment'" class="field">
          <span class="fl">休假班次</span>
          <el-select v-model="form.shiftId" size="small" style="width: 100%">
            <el-option v-for="s in shifts" :key="s.id" :label="`${s.name}（${s.range}）`" :value="s.id" />
          </el-select>
        </div>

        <div v-if="type.mode === 'hour'" class="field">
          <span class="fl">起止时间</span>
          <div class="time-row">
            <el-time-select v-model="form.startTime" start="09:00" step="00:30" end="22:00" size="small" placeholder="开始" />
            <span class="time-sep">至</span>
            <el-time-select v-model="form.endTime" start="09:00" step="00:30" end="22:00" size="small" placeholder="结束" />
          </div>
        </div>

        <div v-if="type.mode === 'chain'" class="field">
          <span class="fl">每日时长</span>
          <el-radio-group v-model="form.dayHours" size="small">
            <el-radio-button :value="8">整天</el-radio-button>
            <el-radio-button :value="4">半天</el-radio-button>
          </el-radio-group>
        </div>

        <div v-if="type.mode === 'range'" class="field">
          <span class="fl">时长口径</span>
          <el-radio-group v-model="form.half" size="small">
            <el-radio-button :value="false">整天</el-radio-button>
            <el-radio-button :value="'am'">上午半天</el-radio-button>
            <el-radio-button :value="'pm'">下午半天</el-radio-button>
          </el-radio-group>
        </div>

        <div v-if="type.mode === 'event'" class="field">
          <span class="fl">使用天数</span>
          <el-input-number v-model="form.eventDays" :min="0.5" :max="typeMaxDays" :step="0.5" size="small" />
          <span class="field-note">每次最多 {{ typeMaxDays }} 天</span>
        </div>

        <div v-if="type.validWithin" class="field">
          <span class="fl">有效期</span>
          <span class="field-value">{{ type.validWithin }}</span>
        </div>

        <div v-if="type.proof" class="field">
          <span class="fl">证明材料</span>
          <div class="proof-row">
            <el-button size="small" @click="pickProof">{{ form.proof ? '重新上传' : '上传证明' }}</el-button>
            <span v-if="form.proof" class="proof-name">{{ form.proof }}</span>
            <span v-else class="field-note">可事后补传</span>
          </div>
        </div>

        <div class="field">
          <span class="fl">请假事由</span>
          <el-input v-model="form.reason" size="small" type="textarea" :rows="2" placeholder="选填" />
        </div>
      </div>

      <!-- 扣减试算 -->
      <div v-if="type" class="card">
        <div class="sec-head">
          <span class="sec-title">本次扣除</span>
          <span class="sec-sub">{{ amountText }}</span>
        </div>
        <div class="deduct-chain">
          <template v-for="(l, i) in est.lines" :key="i">
            <span v-if="i" class="chain-arrow">→</span>
            <span :class="['chain-tag', { excess: !l.schemeId }]">
              {{ l.schemeId ? l.schemeName.split(' · ')[0] : '超出' }} {{ l.amount }}{{ l.unit }}
            </span>
          </template>
          <span v-if="!est.lines.length" class="field-note">请先填写休假信息</span>
        </div>

        <div v-if="est.lines.length" class="after-list">
          <div v-for="l in afterRows" :key="l.schemeId" class="after-row">
            <span class="after-key">{{ l.leaveType }}</span>
            <span class="after-val">
              剩余 <b :class="{ over: l.remainAfter < 0 }">{{ l.remainAfter }}</b> {{ l.unit }}
            </span>
          </div>
        </div>

        <div v-if="est.excess" class="warn-box">
          <span v-if="est.overBy">超出额度 {{ est.overBy }} {{ overUnit }}</span>
          <span v-else>超出额度部分</span>
          <span class="warn-sub">{{ excessNote }}</span>
        </div>
      </div>

      <!-- 缺岗信号预览 -->
      <div v-if="type && signal" class="card signal-card">
        <div class="sec-head">
          <span class="sec-title">将生成缺岗需求</span>
          <span class="sec-sub">交付 {{ signal.to }}</span>
        </div>
        <div class="signal-chips">
          <span class="sig-chip">{{ signal.date || '—' }}</span>
          <span class="sig-chip">{{ signal.store }}</span>
          <span class="sig-chip">{{ signal.job }}</span>
          <span class="sig-chip">{{ signal.shift }}</span>
          <span class="sig-chip">缺 {{ signal.headcount }} 人</span>
        </div>
      </div>

      <el-button type="primary" class="submit-btn" :disabled="!canSubmit" @click="submit">提交申请</el-button>
      <div class="foot-note">额度后果交付薪酬；缺岗需求交付排班调度，本模块不实现补人。</div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  currentEmployee,
  typeGroupsOf,
  leaveTypeOf,
  pdShifts,
  balancesOf,
  estimate,
  gapSignalPreview,
  pdToday,
  setCurrentEmpId
} from '../../mock/mobileLeavePd.js'

const router = useRouter()
const route = useRoute()
const emp = currentEmployee()
setCurrentEmpId(emp.id)

const groups = typeGroupsOf(emp)
const shifts = pdShifts

const initDate = route.query.date || ''

const form = reactive({
  typeId: route.query.type || 'shift-full',
  date: initDate,
  range: initDate ? [initDate, initDate] : [],
  shiftId: route.query.shift || 'morning',
  startTime: '',
  endTime: '',
  dayHours: 8,
  half: false,
  eventDays: 1,
  proof: '',
  reason: ''
})

const type = computed(() => leaveTypeOf(form.typeId))
const isRange = computed(() => ['event', 'range', 'chain'].includes(type.value && type.value.mode))
const typeMaxDays = computed(() => {
  if (!type.value) return 1
  if (type.value.mode === 'event') {
    const bal = balancesOf(emp).find(b => b.schemeId === type.value.schemeId)
    return bal ? bal.amount : 3
  }
  return 1
})

const disabledType = (t) => {
  if (t.mode === 'event') {
    const bal = balancesOf(emp).find(b => b.schemeId === t.schemeId)
    return bal ? bal.remain <= 0 : false
  }
  return false
}

const pickType = (t) => {
  if (disabledType(t)) {
    ElMessage.warning(`「${t.name}」当前额度不足`)
    return
  }
  form.typeId = t.id
}

const dayDiff = (a, b) => {
  if (!a || !b) return 0
  const ms = new Date(b).getTime() - new Date(a).getTime()
  return Math.max(Math.round(ms / 86400000) + 1, 1)
}

const hoursOf = () => {
  if (!form.startTime || !form.endTime) return 0
  const [h1, m1] = form.startTime.split(':').map(Number)
  const [h2, m2] = form.endTime.split(':').map(Number)
  return Math.max((h2 * 60 + m2 - (h1 * 60 + m1)) / 60, 0)
}

const daysValue = computed(() => {
  const t = type.value
  if (!t) return 0
  if (t.mode === 'segment') return t.days
  if (t.mode === 'range') {
    const d = dayDiff(form.range[0], form.range[1])
    return form.half ? Math.max(d - 0.5, 0.5) : d
  }
  if (t.mode === 'event') return form.eventDays
  if (t.mode === 'chain') {
    const d = dayDiff(form.range[0], form.range[1])
    return (d * form.dayHours) / 8
  }
  return 0
})

const hoursValue = computed(() => (type.value && type.value.mode === 'hour' ? hoursOf() : 0))

const est = computed(() => estimate(type.value, { days: daysValue.value, hours: hoursValue.value, emp }))

const amountText = computed(() => {
  const t = type.value
  if (!t) return ''
  if (t.mode === 'hour') return `${hoursValue.value} 小时`
  if (t.mode === 'chain') return `${daysValue.value} 天（按每天 ${form.dayHours} 小时）`
  if (t.mode === 'event') return `${form.eventDays} 天`
  return `${daysValue.value} 天`
})

const afterRows = computed(() => {
  const rows = []
  est.value.lines.forEach(l => {
    if (!l.schemeId) return
    const bal = balancesOf(emp).find(b => b.schemeId === l.schemeId)
    if (!bal) return
    const after = +(bal.remain - l.amount).toFixed(2)
    if (!rows.find(r => r.schemeId === l.schemeId)) {
      rows.push({ schemeId: l.schemeId, leaveType: bal.leaveType, unit: bal.unit, remainAfter: after })
    }
  })
  return rows
})

const overUnit = computed(() => {
  const ex = est.value.lines.find(l => !l.schemeId)
  return ex ? ex.unit : ''
})
const excessNote = computed(() => (emp.job === '推拿师' ? '不扣薪，仅记录超出时长' : '超出部分按薪资扣减'))

const signal = computed(() => {
  const t = type.value
  if (!t) return null
  const date = isRange.value ? (form.range[0] || '') : form.date
  const shiftName = t.mode === 'segment'
    ? (pdShifts.find(s => s.id === form.shiftId) || {}).name
    : t.timeText || ''
  return gapSignalPreview(emp, t, date, shiftName)
})

const canSubmit = computed(() => {
  const t = type.value
  if (!t) return false
  if (isRange.value) return !!form.range[0]
  if (t.mode === 'hour') return !!form.date && hoursOf() > 0
  return !!form.date
})

const pickProof = () => {
  form.proof = type.value.id === 'marriage' ? '结婚证.jpg' : '证明材料.jpg'
  ElMessage.success('已选择文件')
}

const submit = () => {
  if (type.value.proof && !form.proof) {
    ElMessage.warning('婚假 / 丧假需上传证明材料，或提交后补传')
    return
  }
  ElMessage.success('已提交，等待审核')
  router.push({ name: 'mobile-leave-pd-records' })
}

const goBack = () => router.push({ name: 'mobile-leave-pd' })
</script>

<style scoped>
.pd-apply { min-height: 100vh; height: 100vh; overflow-y: auto; background: #f5f5f5; -webkit-overflow-scrolling: touch; }
.page-header { display: flex; align-items: center; gap: 10px; padding: 14px 16px; background: #fff; position: sticky; top: 0; z-index: 20; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
.back-icon { font-size: 22px; color: #333; }
.page-header h1 { flex: 1; text-align: center; font-size: 17px; font-weight: 600; margin: 0; }
.pd-tag { font-size: 11px; color: #a40035; border: 1px solid #a40035; border-radius: 10px; padding: 1px 7px; }
.content { padding: 12px 12px 28px; }

.card { background: #fff; border-radius: 12px; padding: 14px; margin-bottom: 12px; }
.sec-title { font-size: 15px; font-weight: 600; color: #333; }
.sec-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.sec-sub { font-size: 12px; color: #999; }

.who { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 10px 14px; }
.who-name { font-size: 15px; font-weight: 600; color: #333; }
.who-meta { font-size: 12px; color: #999; }

.type-group { margin-top: 12px; }
.group-label { font-size: 12px; color: #999; margin-bottom: 8px; }
.type-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.type-chip { font-size: 13px; padding: 6px 14px; border-radius: 16px; border: 1px solid #e5e7eb; color: #555; background: #fafafa; }
.type-chip.on { color: #a40035; border-color: #a40035; background: #fff0f4; font-weight: 600; }
.type-chip.disabled { opacity: .4; }
.field-desc { font-size: 12px; color: #999; line-height: 1.6; margin-top: 10px; }

.field { margin-top: 14px; }
.fl { display: block; font-size: 13px; color: #666; margin-bottom: 7px; }
.field-note { font-size: 11px; color: #999; margin-left: 8px; }
.field-value { font-size: 13px; color: #333; }
.time-row { display: flex; align-items: center; gap: 8px; }
.time-row :deep(.el-select) { flex: 1; }
.time-sep { font-size: 12px; color: #999; }
.proof-row { display: flex; align-items: center; gap: 10px; }
.proof-name { font-size: 12px; color: #15803d; }

.deduct-chain { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.chain-tag { font-size: 12px; padding: 4px 10px; border-radius: 12px; background: #fff0f4; color: #a40035; border: 1px solid #f5c2d1; }
.chain-tag.excess { background: #fef3c7; color: #b45309; border-color: #fde68a; }
.chain-arrow { font-size: 12px; color: #bbb; }
.after-list { margin-top: 12px; border-top: 1px dashed #f0f0f0; padding-top: 10px; }
.after-row { display: flex; align-items: center; justify-content: space-between; padding: 4px 0; }
.after-key { font-size: 13px; color: #666; }
.after-val { font-size: 12px; color: #999; }
.after-val b { font-size: 14px; color: #333; }
.after-val b.over { color: #b91c1c; }
.warn-box { margin-top: 12px; padding: 10px 12px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; font-size: 12px; color: #b45309; }
.warn-sub { display: block; margin-top: 4px; color: #92400e; }

.signal-card { background: #f6fbf8; border: 1px solid #d6efe0; }
.signal-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.sig-chip { font-size: 12px; padding: 3px 10px; border-radius: 12px; background: #fff; border: 1px solid #d6efe0; color: #15803d; }

.submit-btn { width: 100%; background: #a40035; border-color: #a40035; height: 44px; font-size: 15px; }
.foot-note { font-size: 11px; color: #999; text-align: center; margin-top: 12px; line-height: 1.6; }
</style>
