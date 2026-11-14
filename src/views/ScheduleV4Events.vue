<template>
  <div class="v4e-page">
    <header class="v4e-head">
      <div class="hl">
        <el-button link @click="$router.push('/schedule-v4')">← 回到配置台</el-button>
        <h1>事件编排</h1>
        <p>事件定义 = 1..N 个原子能力的编排；排班只交出能力，不交出流程</p>
      </div>
      <div class="hr">
        <span class="badge-soft">枚举事件 {{ v4.events.length }} 条</span>
        <span class="badge-soft">能力 {{ V4_CAPS.length }} 条（执行 {{ execCount }} / 判断 {{ judgeCount }}）</span>
      </div>
    </header>

    <div class="layout">
      <!-- 左：枚举事件 -->
      <aside class="col events">
        <div class="col-head">枚举事件<span class="hint2">过渡形态：先列清单，背后才是编排</span></div>
        <button
          v-for="e in v4.events" :key="e.id" class="ev-item"
          :class="{ on: defOf(e.id)?.id === defId }" @click="pickEvent(e)"
        >
          <div class="ev-name">{{ e.name }}</div>
          <div class="ev-meta">{{ e.domain }} · {{ e.fields.join(' / ') }}</div>
          <div class="ev-def">{{ defOf(e.id)?.name || '未配定义' }}</div>
        </button>
      </aside>

      <!-- 中：事件定义 -->
      <section class="col def" v-if="def">
        <div class="col-head">
          {{ def.name }}
          <span class="hint2">{{ def.desc }}</span>
        </div>
        <div class="steps">
          <div v-for="(s, i) in def.steps" :key="i" class="step" :class="logAt(i)?.ok === false ? 'bad' : ''">
            <div class="step-idx">{{ i + 1 }}</div>
            <div class="step-body">
              <div class="step-top">
                <span class="cap-name">{{ capName4(s.cap) }}</span>
                <span class="kind" :class="capOf(s.cap)?.kind">{{ capOf(s.cap)?.kind === 'judge' ? '判断' : '执行' }}</span>
                <span class="domain">{{ capOf(s.cap)?.domain }}</span>
                <span class="grow" />
                <el-button link size="small" :disabled="i === 0" @click="moveStep(i, -1)">上移</el-button>
                <el-button link size="small" :disabled="i === def.steps.length - 1" @click="moveStep(i, 1)">下移</el-button>
                <el-button link size="small" @click="def.steps.splice(i, 1)">删</el-button>
              </div>
              <div class="step-desc">{{ capOf(s.cap)?.desc }}</div>
              <div v-if="capOf(s.cap)?.params" class="params">
                <label v-for="p in capOf(s.cap).params" :key="p.key">
                  <span>{{ p.label }}</span>
                  <el-select v-if="p.type === 'select'" v-model="s.params[p.key]" size="small" style="width: 130px">
                    <el-option v-for="o in p.options" :key="o" :label="o" :value="o" />
                  </el-select>
                  <el-input v-else v-model="s.params[p.key]" size="small" style="width: 110px" />
                </label>
              </div>
              <div v-if="logAt(i)" class="step-log" :class="{ bad: logAt(i).ok === false }">
                {{ logAt(i).detail }}
              </div>
            </div>
          </div>
        </div>
        <div class="add-step">
          <el-select v-model="newCap" size="small" placeholder="选一条能力加进编排" style="width: 220px">
            <el-option v-for="c in V4_CAPS" :key="c.key" :label="`${c.name}（${c.kind === 'judge' ? '判断' : '执行'}）`" :value="c.key" />
          </el-select>
          <el-button size="small" :disabled="!newCap" @click="addStep">加入</el-button>
          <span class="hint2">顺序即执行顺序；判断返回否会中止后续</span>
        </div>
      </section>

      <!-- 右：试跑 -->
      <section class="col run">
        <div class="col-head">试跑<span class="hint2">手工触发，看它调了哪些能力</span></div>
        <div class="payload">
          <label v-for="f in currentEvent?.fields || []" :key="f">
            <span>{{ fieldLabel(f) }}</span>
            <el-select v-if="f === 'instanceId'" v-model="payload[f]" size="small" style="width: 100%" filterable>
              <el-option v-for="inst in instanceOptions" :key="inst.id" :label="`${inst.date} ${inst.form.name}（${inst.start}-${inst.end}）`" :value="inst.id" />
            </el-select>
            <el-input v-else-if="f === 'date'" v-model="payload[f]" size="small" placeholder="2026-11-17" />
            <el-select v-else-if="f === 'count'" v-model="payload[f]" size="small">
              <el-option v-for="n in [1, 2, 3]" :key="n" :label="`${n} 人`" :value="n" />
            </el-select>
            <el-select v-else v-model="payload[f]" size="small" filterable>
              <el-option v-for="p in v4.people" :key="p.id" :label="`${p.name} · ${posName4(p.positionId)} · ${spaceName(p.spaceId)}`" :value="p.id" />
            </el-select>
          </label>
        </div>
        <el-button type="primary" size="small" style="width: 100%" @click="run">执行这个事件</el-button>
        <el-button v-if="pendingTransferCount" size="small" style="width: 100%; margin: 8px 0 0" @click="expireDemo">
          演示：{{ pendingTransferCount }} 条转移邀请等待期超时
        </el-button>

        <div v-if="log.length" class="run-log">
          <div class="log-head">
            <span>执行链</span>
            <span class="hint2">{{ log.filter(l => l.ok).length }}/{{ log.length }} 步完成<span v-if="stopped"> · 中途中止</span></span>
          </div>
          <div v-for="l in log" :key="l.seq" class="log-row" :class="{ bad: !l.ok }">
            <span class="log-seq">{{ l.seq }}</span>
            <div>
              <div class="log-title">{{ l.title }}</div>
              <div class="log-detail">{{ l.detail }}</div>
            </div>
          </div>
          <div class="log-tail">
            结果表：{{ beforeRows }} → {{ afterRows }} 条
          </div>
        </div>
        <div v-else class="run-empty">还没有跑过。点上面的按钮，看能力怎么被拼起来。</div>
      </section>
    </div>

    <!-- 能力清单 -->
    <section class="caps">
      <div class="col-head">原子能力清单<span class="hint2">检验准则：加一个岗位，这个表不该变长</span></div>
      <el-table :data="V4_CAPS" size="small" border class="cap-table">
        <el-table-column label="域" width="88" prop="domain" />
        <el-table-column label="能力" width="150" prop="name" />
        <el-table-column label="类型" width="80">
          <template #default="{ row }">
            <el-tag size="small" :type="row.kind === 'judge' ? 'info' : 'success'" effect="plain">{{ row.kind === 'judge' ? '判断' : '执行' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="输入 → 输出" width="230">
          <template #default="{ row }">{{ row.input }} → {{ row.output }}</template>
        </el-table-column>
        <el-table-column label="幂等" width="70">
          <template #default="{ row }">{{ row.idempotent ? '是' : '否' }}</template>
        </el-table-column>
        <el-table-column label="说明" prop="desc" />
      </el-table>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { v4, runEvent4, capName4, posName4, findSpace4, expireTransfers4 } from '../mock/scheduleV4Store.js'
import { V4_CAPS, capOf4 } from '../mock/scheduleV4Events.js'

const defId = ref('ED-01')
const newCap = ref('')
const payload = ref({})
const log = ref([])
const stopped = ref(false)
const beforeRows = ref(0)
const afterRows = ref(0)

const execCount = V4_CAPS.filter(c => c.kind === 'exec').length
const judgeCount = V4_CAPS.filter(c => c.kind === 'judge').length

const defOf = eventId => v4.eventDefs.find(d => d.eventId === eventId) || null
const def = computed(() => v4.eventDefs.find(d => d.id === defId.value) || null)
const currentEvent = computed(() => v4.events.find(e => e.id === def.value?.eventId) || null)
const capOf = key => capOf4(key)
const spaceName = id => findSpace4(id)?.name || id

const instanceOptions = computed(() =>
  [...(v4.batch?.instances || [])].filter(i => i.date >= '2026-11-16' && i.date <= '2026-11-22').slice(0, 60)
)

const fieldLabel = f => ({ personId: '当事人', toPersonId: '接手人', date: '日期', instanceId: '时段', toInstanceId: '对方时段', count: '数量' }[f] || f)

const defaultPayload = evId => {
  if (evId === 'EV-01') return { personId: 'E-425', date: '2026-11-18' }
  if (evId === 'EV-02') return { personId: 'E-405', instanceId: firstInstance('PL-01') }
  if (evId === 'EV-03') return { personId: 'E-405', toPersonId: 'E-406', instanceId: firstInstance('PL-01') }
  if (evId === 'EV-05') return { personId: 'E-404' }
  // 换班演示：麓山 11-16 早班（韩野）↔ 晚班（严青）
  if (evId === 'EV-06') {
    return {
      personId: 'E-425', toPersonId: 'E-426',
      instanceId: instOf('PL-03', '2026-11-16', 'SH-E'),
      toInstanceId: instOf('PL-03', '2026-11-16', 'SH-G')
    }
  }
  return {}
}
const firstInstance = planId => (v4.batch?.instances || []).find(i => i.planId === planId && i.date === '2026-11-17')?.id || ''
const instOf = (planId, date, formId) =>
  (v4.batch?.instances || []).find(i => i.planId === planId && i.date === date && i.formId === formId)?.id || ''

const pickEvent = ev => {
  const d = defOf(ev.id)
  if (!d) return
  defId.value = d.id
  payload.value = defaultPayload(ev.id)
  log.value = []
}
payload.value = defaultPayload('EV-01')

const run = () => {
  beforeRows.value = v4.batch?.results.length || 0
  const res = runEvent4(defId.value, payload.value)
  log.value = res?.log || []
  stopped.value = !!res?.stopped
  afterRows.value = v4.batch?.results.length || 0
}
const logAt = i => log.value[i] || null

/* 转移等待期超时（演示触发；线上按 deadline 自动判定） */
const pendingTransferCount = computed(() => (v4.transfers || []).filter(t => t.status === 'pending').length)
const expireDemo = () => {
  const out = expireTransfers4(true)
  ElMessage.info(out.length ? `${out.length} 条转移邀请已超时失效，班次留在原人名下` : '没有等待中的转移邀请')
}

const moveStep = (i, dir) => {
  const arr = def.value.steps
  const j = i + dir
  if (j < 0 || j >= arr.length) return
  const tmp = arr[i]
  arr.splice(i, 1, arr[j])
  arr.splice(j, 1, tmp)
}
const addStep = () => {
  if (!newCap.value) return
  const cap = capOf(newCap.value)
  const params = {}
  for (const p of cap.params || []) params[p.key] = p.value
  def.value.steps.push({ cap: newCap.value, params })
  newCap.value = ''
}
</script>

<style scoped>
.v4e-page { padding: 20px 24px 40px; background: #f5f6f8; min-height: 100%; }
.v4e-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
.v4e-head h1 { margin: 4px 0 0; font-size: 19px; font-weight: 600; color: #1f2329; }
.v4e-head p { margin: 4px 0 0; font-size: 12px; color: #9096a0; }
.v4e-head .hr { display: flex; gap: 8px; }
.badge-soft { font-size: 11px; color: #5f6570; background: #fff; border: 1px solid #eef0f3; border-radius: 999px; padding: 4px 10px; }

.layout { display: grid; grid-template-columns: 230px 1fr 300px; gap: 14px; align-items: start; }
.col { background: #fff; border: 1px solid #eef0f3; border-radius: 12px; padding: 12px 14px; }
.col-head { display: flex; align-items: baseline; gap: 8px; font-size: 13px; font-weight: 500; color: #1f2329; margin-bottom: 10px; }
.hint2 { font-size: 11px; color: #a8adb5; font-weight: 400; }

.ev-item { display: block; width: 100%; text-align: left; border: 1px solid #eef0f3; background: #fbfbfc; border-radius: 8px; padding: 8px 10px; margin-bottom: 8px; cursor: pointer; }
.ev-item.on { border-color: #a40035; background: #fdf2f5; }
.ev-name { font-size: 12px; font-weight: 500; color: #1f2329; }
.ev-meta { font-size: 10px; color: #a8adb5; margin: 2px 0; }
.ev-def { font-size: 10px; color: #854f0b; }

.steps { display: flex; flex-direction: column; gap: 8px; }
.step { display: flex; gap: 10px; border: 1px solid #eef0f3; border-radius: 8px; padding: 8px 10px; background: #fbfcfd; }
.step.bad { border-color: #f4c0d1; background: #fdf2f5; }
.step-idx { width: 20px; height: 20px; border-radius: 50%; background: #1f2329; color: #fff; font-size: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.step-body { flex: 1; }
.step-top { display: flex; align-items: center; gap: 6px; }
.cap-name { font-size: 12px; font-weight: 500; color: #1f2329; }
.kind { font-size: 10px; border-radius: 4px; padding: 1px 6px; }
.kind.exec { color: #0f6e56; background: #e1f5ee; }
.kind.judge { color: #185fa5; background: #e6f1fb; }
.domain { font-size: 10px; color: #a8adb5; }
.grow { flex: 1; }
.step-desc { font-size: 11px; color: #9096a0; margin-top: 2px; }
.params { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 6px; }
.params label { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #5f6570; }
.step-log { margin-top: 6px; font-size: 11px; color: #0f6e56; background: #e8f5ee; border-radius: 6px; padding: 5px 8px; }
.step-log.bad { color: #993556; background: #fbeaf0; }
.add-step { display: flex; align-items: center; gap: 8px; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #eef0f3; }

.payload { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
.payload label { display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: #5f6570; }
.run-log { margin-top: 12px; border-top: 1px dashed #eef0f3; padding-top: 10px; }
.log-head { display: flex; justify-content: space-between; font-size: 12px; font-weight: 500; color: #1f2329; margin-bottom: 8px; }
.log-row { display: flex; gap: 8px; padding: 6px 0; border-bottom: 1px solid #f5f6f8; }
.log-row.bad { background: #fdf2f5; }
.log-seq { width: 16px; font-size: 10px; color: #a8adb5; }
.log-title { font-size: 11px; font-weight: 500; color: #1f2329; }
.log-detail { font-size: 11px; color: #6b7280; line-height: 1.5; }
.log-tail { margin-top: 8px; font-size: 11px; color: #5f6570; background: #f7f8fa; border-radius: 6px; padding: 6px 8px; }
.run-empty { font-size: 11px; color: #a8adb5; padding: 10px 0; }

.caps { margin-top: 14px; background: #fff; border: 1px solid #eef0f3; border-radius: 12px; padding: 12px 14px; }
.cap-table { margin-top: 4px; }
</style>
