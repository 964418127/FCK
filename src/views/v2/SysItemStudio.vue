<!--
  系统项工作台：说一句话 → Agent 给出条件 / 执行参数 → 人看 diff → 发布新版本。
  左侧只对话与试跑，右侧只读结果；不提供表单式逐字段录入。
-->
<template>
  <div class="ss">
    <header class="ss-head">
      <div class="h-left">
        <el-button link size="small" :icon="ArrowLeft" @click="back">系统项</el-button>
        <span class="divider">/</span>
        <h1>{{ view?.name || (isNew ? (kind === 'action' ? '新建执行项' : '新建判定项') : '未找到该条目') }}</h1>
        <span class="kind-chip" :class="kind">{{ kind === 'action' ? '执行项' : '判定项' }}</span>
        <span v-if="key" class="key-chip">{{ displayKey }}</span>
        <span v-if="current" class="ver-chip">{{ current.mirror.version }} · {{ current.mirror.configuredBy }}</span>
        <span v-if="draft" class="draft-chip">候选 {{ nextVer }}</span>
      </div>
      <div class="h-right">
        <span class="dot" :class="llmOk ? 'ok' : 'warn'">{{ llmOk ? (llmState.config.model || '模型已就绪') : '未配置模型' }}</span>
        <el-button v-if="draft" size="small" @click="discard">放弃草案</el-button>
        <el-button type="primary" size="small" :disabled="!draft" @click="publish">
          {{ current ? '发布新版本' : '发布并上线' }}
        </el-button>
      </div>
    </header>

    <div class="ss-body">
      <div class="pane">
        <main ref="chatEl" class="chat">
        <!-- 开场：对话开始前的引导，别让左栏空成一张表单 -->
        <div v-if="!turns.length" class="hello" :class="{ center: !latestBatch }">
          <div class="hello-row">
            <div class="avatar lg">A</div>
            <div class="hello-bubble">
              <div class="who">系统项 Agent</div>
              <p class="hb-t">
                <template v-if="isNew">
                  {{ kind === 'action'
                    ? '说清楚这件事要系统替人做什么、目标从哪来，我按契约起草执行参数。'
                    : '说清楚要判什么、数据在哪个系统，我按契约起草判定条件。' }}
                </template>
                <template v-else>
                  要改「{{ current?.name }}」的哪一处？只说你提到的地方，其余保持不动。
                </template>
              </p>
              <p class="hb-s">
                来源系统、入参、回执都从已登记的系统里选；目录里没有的，建议先建一条再引用。
              </p>
            </div>
          </div>

          <div class="sug-t">试试这样说</div>
          <div class="sug-list">
            <button v-for="(s, i) in suggestions" :key="i" class="sug" @click="useSuggestion(s)">
              <span class="sug-main">
                <span class="sug-txt">{{ s.text }}</span>
                <span class="sug-tag">{{ s.tag }}</span>
              </span>
              <span class="sug-arrow">↗</span>
            </button>
          </div>

          <div class="hello-foot">
            <template v-if="isNew">生成后右侧出草稿，确认再发布</template>
            <template v-else>当前 {{ current?.mirror.version }} · {{ current?.mirror.configuredBy }} · {{ current?.mirror.condAt }} 上线</template>
          </div>
        </div>

        <!-- 对话 -->
        <div v-for="(t, i) in turns" :key="i" class="msg" :class="t.role">
          <div v-if="t.role === 'agent'" class="avatar">A</div>
          <div class="bubble" :class="t.role">
            <div v-if="t.role === 'agent'" class="who">系统项 Agent</div>
            <p class="txt">{{ t.text }}</p>
            <div v-if="t.kind === 'result'" class="r-meta">
              <span class="r-chip">{{ t.isNew ? '新建条目' : (t.changes.length ? `改 ${t.changes.length} 处：${t.changes.join('、')}` : '结构与当前一致') }}</span>
            </div>
            <div v-if="t.recap && t.recap.length" class="recap">
              <div class="rc-t">它为什么这么定</div>
              <div v-for="(r, ri) in t.recap" :key="ri" class="rc-i">{{ r }}</div>
            </div>
          </div>
        </div>

        <div v-if="error" class="err">{{ error }}</div>

        <!-- 试跑：只展示真实批次，没有就是没有 -->
        <section v-if="latestBatch" class="trial">
          <div class="tr-head">
            <span class="tr-t">最近一批 · 真实批次留痕</span>
            <span class="tr-meta">
              {{ latestBatch.batchNo }} · {{ latestBatch.ranAt }} · {{ latestBatch.version }}
              <button class="tr-all" @click="openBatches">全部批次 →</button>
            </span>
          </div>
          <div class="tr-sum">
            扫 {{ latestBatch.scanned }} · 通过 {{ latestBatch.passN }} · 软性 {{ latestBatch.softN }} · 未通过 {{ latestBatch.failN }}
            <span v-if="latestBatch.note" class="tr-note">· {{ latestBatch.note }}</span>
          </div>
          <div class="tr-rows">
            <div v-for="(v, i) in latestBatch.verdicts || []" :key="i" class="tr-row">
              <span class="vc">{{ v.name }}<em>{{ v.empNo }}</em></span>
              <span :class="['vr', v.result === '通过' ? 'ok' : v.result === '未通过' ? 'bad' : 'soft']">{{ v.result }}</span>
              <span class="vm">{{ v.metrics }}</span>
            </div>
          </div>
        </section>
        <div v-else-if="current" class="trial-empty">
          <template v-if="kind === 'action'">
            这一项还没有执行记录：上线后由流程侧按目标逐条调用，逐目标回写回执。
          </template>
          <template v-else>
            这一项还没有取数记录：发布上线后由检查方按自己的节奏跑批，流程侧只等结论。
          </template>
        </div>
      </main>

        <footer class="composer">
          <div class="box">
            <textarea
              v-model="draftText" :disabled="chatting" :placeholder="placeholder"
              @keydown.meta.enter="ask" @keydown.ctrl.enter="ask"
            />
            <div class="box-bar">
              <kbd class="kbd">⌘</kbd><kbd class="kbd">↵</kbd>
              <span class="bar-hint">{{ draftText.trim() ? '可以交给 Agent 了' : '一句话说清要做什么，越具体越好' }}</span>
              <button class="send" :disabled="!draftText.trim() || chatting" @click="ask">
                <span v-if="chatting" class="spin"></span>
                {{ chatting ? '生成中' : (current ? '交给 Agent 修改' : '交给 Agent 生成') }}
              </button>
            </div>
          </div>
        </footer>
      </div>

      <!-- 右侧：当前配置 / 草案 -->
      <aside class="panel">
        <div class="p-head">
          <span class="ph-t">{{ kind === 'action' ? '执行配置' : '判定配置' }}</span>
          <span v-if="draft" class="ph-chip">草案</span>
          <span v-else-if="current" class="ph-chip live">已上线 {{ current.mirror.version }}</span>
          <span class="ph-hint">{{ draft ? '确认无误后发布，写入新版本' : '由 Agent 生成，可对话修改' }}</span>
        </div>
        <div class="p-body">
        <template v-if="view">
          <div class="p-block">
            <div class="p-t">身份</div>
            <div class="p-grid">
              <div class="p-line col"><b>名称</b><span>{{ view.name }}</span></div>
              <div class="p-line col"><b>来源</b><span class="src">{{ view.source }}</span></div>
              <div class="p-line col"><b>key</b><span class="mono">{{ displayKey }}</span></div>
              <div class="p-line col"><b>类别</b><span>{{ kind === 'action' ? '执行项 · ' + modeLabel(view.mode) : '判定项 · 只出结论' }}</span></div>
            </div>
            <div v-if="view.desc" class="p-desc">{{ view.desc }}</div>
            <div v-if="draft && current" class="p-foot">改动会随发布写入新版本，在途单不受影响</div>
          </div>

          <!-- 判定项 -->
          <template v-if="kind === 'check'">
            <div class="p-block">
              <div class="p-t">通过条件 <em>{{ view.pass.logic === 'or' ? '任一命中' : '全部命中' }}</em></div>
              <div class="conds">
                <template v-for="(c, i) in view.pass.items" :key="i">
                  <span v-if="i" class="logic">{{ view.pass.logic === 'or' ? '或' : '且' }}</span>
                  <span class="cond pass" :class="{ fresh: isFresh('pass', c) }">
                    {{ condText(c) }}<i v-if="isFresh('pass', c)">新</i>
                  </span>
                </template>
              </div>
            </div>
            <div class="p-block">
              <div class="p-t">软性区间 <em>命中即软性，都不中即未通过</em></div>
              <div v-if="view.soft" class="conds">
                <template v-for="(c, i) in view.soft.items" :key="i">
                  <span v-if="i" class="logic">{{ view.soft.logic === 'or' ? '或' : '且' }}</span>
                  <span class="cond soft" :class="{ fresh: isFresh('soft', c) }">
                    {{ condText(c) }}<i v-if="isFresh('soft', c)">新</i>
                  </span>
                </template>
              </div>
              <div v-else class="p-empty">无软性 —— 只有通过 / 未通过</div>
            </div>
            <div class="p-block">
              <div class="p-t">取数 <em>取回什么原值，流程侧只读</em></div>
              <div class="fields">
                <div v-for="(f, i) in view.fetch?.fields || []" :key="i" class="field-row">
                  <span class="field-name">{{ f.label }}</span>
                  <span v-if="f.key && f.key !== f.label" class="field-key">{{ f.key }}</span>
                </div>
                <span v-if="!(view.fetch?.fields || []).length" class="p-empty">未声明</span>
              </div>
              <div v-if="view.defaultFetch" class="p-line">
                <b class="w5">流程默认</b>
                <span>{{ freqText(view.defaultFetch.freq) }}取一次 · 上限 {{ view.defaultFetch.maxRuns }} 个未通过批次</span>
              </div>
              <div v-if="view.fetch?.cadenceHint" class="p-hint">建议节奏：{{ view.fetch.cadenceHint }}（由检查方定，流程侧不配）</div>
              <button v-if="missingLabels.length" class="p-fix" @click="askFixLabels">
                {{ missingLabels.length }} 个字段只有英文 key、缺中文名 —— 点这里让 Agent 补一遍
              </button>
            </div>
          </template>

          <!-- 执行项 -->
          <template v-else>
            <div class="p-block">
              <div class="p-t">执行</div>
              <div class="p-line"><b>方式</b><span class="mode-chip" :class="view.mode">{{ modeLabel(view.mode) }}</span></div>
              <div class="p-line"><b>单位</b><span>逐{{ view.target || '单' }} · {{ view.targetFrom }}</span></div>
            </div>
            <div class="p-block">
              <div class="p-t">入参 <em>从事实 / 载荷 / 上游结论取</em></div>
              <div class="io">
                <div v-for="(a, i) in view.args || []" :key="i" class="io-row">
                  <span class="io-k">{{ a.key }}</span>
                  <span class="io-l">{{ a.label }}</span>
                  <span class="io-f">{{ a.from }}</span>
                </div>
                <div v-if="!(view.args || []).length" class="p-empty">未声明</div>
              </div>
            </div>
            <div class="p-block">
              <div class="p-t">回执 <em>逐目标各一条</em></div>
              <div class="io">
                <div v-for="(r, i) in view.receipt || []" :key="i" class="io-row">
                  <span class="io-k">{{ r.key }}</span>
                  <span class="io-l">{{ r.label }}</span>
                </div>
                <div v-if="!(view.receipt || []).length" class="p-empty">未声明</div>
              </div>
            </div>
            <div class="p-block">
              <div class="p-t">兜底</div>
              <div class="p-line col"><b>幂等键</b><span>{{ view.idempotent || '未声明' }}</span></div>
              <div class="p-line col"><b>失败处理</b><span>{{ view.fallback || '未声明' }}</span></div>
            </div>
          </template>

          <div class="p-block">
            <div class="p-t">被引用 <em>发布后这些子事件跟着换镜像</em></div>
            <div v-if="usage.length" class="ref-wrap">
              <span v-for="u in usage" :key="u" class="ref-chip">{{ u }}</span>
            </div>
            <div v-else class="p-empty">还没有子事件引用它</div>
          </div>

          <div class="p-block">
            <div class="p-t">版本</div>
            <div v-if="current" class="ver-row">
              <span class="v-no">{{ current.mirror.version }}</span>
              <span class="v-t">{{ current.mirror.configuredBy }} · {{ current.mirror.condAt }}</span>
            </div>
            <div v-if="draft" class="ver-row draft">
              <span class="v-no">{{ nextVer }}</span>
              <span class="v-t">候选 · 待发布</span>
            </div>
            <div v-for="(l, i) in logs" :key="i" class="log-row">
              <span class="log-v">{{ l.version }}</span>
              <span class="log-a">{{ l.action === 'create' ? '新建' : '修改' }}</span>
              <span class="log-t">{{ l.at }}</span>
              <span class="log-n">{{ l.note }}</span>
            </div>
          </div>
        </template>

          <div v-else class="p-empty-state">
            <div class="pe-main">
              <div class="pe-t">Agent 给出这些配置</div>
              <div class="pe-list">
                <div v-for="(s, i) in emptySlots" :key="i" class="pe-item">
                  <span class="pe-i">{{ i + 1 }}</span>
                  <div class="pe-c">
                    <span class="pe-k">{{ s.k }}</span>
                    <span class="pe-d">{{ s.d }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="pe-foot">说一句话，右侧按契约填满；每一项都能再对话改。</div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import {
  sysItemOf, sysState, setSysDraft, publishSysDraft, dropSysDraft,
  normalizeCheckItem, condLabel
} from '../../v2/sysStore.js'
import { runSysCompose } from '../../v2/sysAgent.js'
import { sysUsageOf } from '../../v2/usage.js'
import { llmState, loadLlmConfig } from '../../composables/useLlmConfig.js'

const route = useRoute()
const router = useRouter()

const kind = computed(() => (route.query.kind === 'action' ? 'action' : 'check'))
const isNew = computed(() => route.query.mode === 'new')
const key = computed(() => String(route.query.key || ''))
const current = computed(() => (isNew.value ? null : sysItemOf(kind.value, key.value)))

const draft = ref(null)
const draftText = ref('')
const turns = ref([])
const chatting = ref(false)
const error = ref('')
const chatEl = ref(null)

const llmOk = computed(() => llmState.available === true && llmState.config.hasKey)
const view = computed(() => normalizeCheckItem(draft.value || current.value))
/** 条件文本展示：字段 key → 中文名（数据本身已映射，这里兜住老草案） */
const condText = (text) => condLabel(text, view.value?.fetch?.fields || [])
const displayKey = computed(() => draft.value?.key || key.value)
const nextVer = computed(() => {
  const v = parseInt(String(current.value?.mirror?.version || 'v0').replace(/[^\d]/g, ''), 10)
  return `v${Number.isFinite(v) ? v + 1 : 1}`
})
const latestBatch = computed(() => (current.value?.batches || [])[0] || null)
/** 批次结果单独一页：这里只看最近一批，全部批次（按版本分组、逐单到人）在那里 */
const openBatches = () => router.push({ name: 'v2-sys-batches', query: { key: key.value } })
const usage = computed(() => sysUsageOf(kind.value, displayKey.value))
const logs = computed(() => sysState.logs.filter((l) => l.key === displayKey.value).slice(0, 4))

/** 老数据/模型偷懒：字段只有英文 key，没有中文名（key 与 label 同值且含英文） */
const missingLabels = computed(() => (view.value?.fetch?.fields || [])
  .filter((f) => f.key === f.label && /[A-Za-z]/.test(f.label)))
const askFixLabels = () => {
  draftText.value = '取数字段缺中文业务名：按来源系统原字段补齐每个字段的中文名（key 保持不变），并把通过条件、软性区间里的英文 key 换成中文名。'
}

const SAMPLE_CHECK = '再加一个检查：竞业限制是否已解除。数据在法务合同库，取协议编号与解除日期；解除日期早于或等于离职日期算通过，离职后 7 天内解除算软性。'
const SAMPLE_ACTION = '离职时把员工在门店系统的账号全部停用，包括收银、排班、企业微信；每个账号要回执，失败重试 3 次后转 IT 人工，撤回过的不要重复撤。'

/** 建议话术：卡上只放一句短的，点进输入框的是完整口径，人能接着改 */
const suggestions = computed(() => {
  if (!isNew.value) {
    return kind.value === 'action'
      ? [
          { tag: '改兜底', text: '失败重试改成 5 次，仍失败转 IT 人工', full: '失败兜底改成重试 5 次，仍失败转 IT 人工处理，其余字段保持不动。' },
          { tag: '加入参', text: '入参再加一个「离职生效日期」', full: '入参再加一个「离职生效日期」，从载荷取当前单据的期望离职日期；其余字段保持不动。' }
        ]
      : [
          { tag: '改软性', text: '软性区间放宽到 200 以内', full: '把软性区间放宽：欠款合计在 200 以内算软性，其余条件与阈值保持不动。' },
          { tag: '加通过条件', text: '通过条件再加一条：备用金缺口 = 0', full: '通过条件里再加一条「备用金缺口 = 0」，仍要求全部命中；其余保持不动。' }
        ]
  }
  return kind.value === 'action'
    ? [
        { tag: '门店系统 · 逐账号', text: '离职时把门店账号全部停用，逐账号要回执', full: SAMPLE_ACTION },
        { tag: '薪酬系统 · 只冻不算', text: '离职当月起冻结薪酬发放，不代算应发', full: '离职当月起冻结该员工的薪酬发放，只冻结不结算；要拿到冻结单号回执，失败转薪酬人工，不阻塞离职流程。' }
      ]
    : [
        { tag: '法务合同库', text: '竞业限制是否已解除，解除日与离职日比较', full: SAMPLE_CHECK },
        { tag: '人事系统', text: '离职面谈是否完成，记录是否归档', full: '再加一个检查：离职面谈是否已完成。取面谈记录编号与归档时间；归档完成算通过，只有记录未归档算软性。' }
      ]
})

const placeholder = computed(() => {
  if (draft.value) return '还要改哪里？只说改动的那一处…'
  return kind.value === 'action'
    ? '说明要系统替人做什么、目标从哪来…'
    : '说明要判什么、数据在哪个系统…'
})

const useSuggestion = (s) => { draftText.value = s.full }

const MODE = { execute: '改数据', notify: '发通知', deliver: '交文件' }
const modeLabel = (m) => MODE[m] || m

/** '1d' → 每 1 天；'2h' → 每 2 小时；'none' → 只取一次 */
function freqText (f) {
  if (!f) return '未设'
  if (f === 'none') return '只取一次'
  const m = String(f).match(/^(\d+)([mhd])$/)
  if (!m) return String(f)
  return `每 ${m[1]} ${({ m: '分钟', h: '小时', d: '天' })[m[2]]}`
}

/** 空态：把「会填满哪几块」直接摆出来，别让右栏空着 */
const emptySlots = computed(() => (kind.value === 'action'
  ? [
      { k: '身份', d: '名称、来源系统、key、执行方式' },
      { k: '执行单位', d: '逐账号 / 逐单 / 逐人，目标从哪来' },
      { k: '入参', d: '从事实、载荷、上游结论各取什么' },
      { k: '回执', d: '逐目标回写哪些字段' },
      { k: '兜底', d: '幂等键、失败重试、转人工' }
    ]
  : [
      { k: '身份', d: '名称、来源系统、key' },
      { k: '通过条件', d: '全部命中或任一命中' },
      { k: '软性区间', d: '命中即软性，都不中即未通过' },
      { k: '取数', d: '取回哪些原值、建议节奏' }
    ]))

/** 草案里新出现的条件（相对当前版本）；两边都先走字段映射，避免「英文 key vs 中文名」误判为新 */
function isFresh (bucket, text) {
  if (!draft.value || !current.value) return false
  const prev = (current.value[bucket]?.items) || []
  return !prev.some((p) => condText(p) === condText(text))
}

/** 变更摘要 */
const changesOf = (next, prev) => {
  if (!prev) return ['新建条目']
  const out = []
  const simple = [['name', '名称'], ['source', '来源'], ['desc', '说明']]
  simple.forEach(([k, l]) => { if ((next[k] || '') !== (prev[k] || '')) out.push(l) })
  if (JSON.stringify(next.pass) !== JSON.stringify(prev.pass)) out.push('通过条件')
  if (JSON.stringify(next.soft || null) !== JSON.stringify(prev.soft || null)) out.push('软性区间')
  if (kind.value === 'check' && JSON.stringify(next.fetch) !== JSON.stringify(prev.fetch)) out.push('取数字段')
  if (kind.value === 'action') {
    ;[['mode', '执行方式'], ['target', '执行单位'], ['targetFrom', '执行范围'], ['args', '入参'], ['receipt', '回执'], ['idempotent', '幂等键'], ['fallback', '失败兜底']].forEach(([k, l]) => {
      if (JSON.stringify(next[k]) !== JSON.stringify(prev[k])) out.push(l)
    })
  }
  return out
}

onMounted(loadLlmConfig)
watch([kind, key, isNew], () => {
  draft.value = null
  turns.value = []
  error.value = ''
  draftText.value = ''
})

async function ask () {
  const u = draftText.value.trim()
  if (!u || chatting.value) return
  error.value = ''
  chatting.value = true
  turns.value.push({ role: 'user', text: u })
  draftText.value = ''
  try {
    const item = await runSysCompose({ kind: kind.value, current: current.value, utterance: u })
    draft.value = item
    const changes = changesOf(item, current.value)
    turns.value.push({
      role: 'agent',
      kind: 'result',
      isNew: isNew.value || !current.value,
      text: isNew.value || !current.value
        ? `已按契约生成「${item.name}」，草稿在右侧，确认无误后发布上线。`
        : `按你说的改了「${item.name}」，草稿在右侧；带「新」标记的是本次新增的条件。`,
      changes,
      recap: item.recap || []
    })
    await scrollEnd()
  } catch (e) {
    error.value = e.message || '生成失败'
  } finally {
    chatting.value = false
  }
}

function discard () {
  draft.value = null
  turns.value = []
  ElMessage.info('已放弃草案，条目回到当前版本')
}

function publish () {
  if (!draft.value) return
  const k = draft.value.key
  setSysDraft(kind.value, k, draft.value, { note: changesOf(draft.value, current.value).join('、') })
  const item = publishSysDraft(kind.value, k)
  if (!item) return
  draft.value = null
  turns.value = []
  ElMessage.success(`已上线 ${item.mirror.version}，流程侧镜像跟着更新`)
  router.replace({ name: 'v2-sys-studio', query: { kind: kind.value, key: k } })
}

function back () {
  dropSysDraft(kind.value, displayKey.value)
  router.push({ name: 'v2-sys-items', query: { kind: kind.value } })
}

async function scrollEnd () {
  await nextTick()
  if (chatEl.value) chatEl.value.scrollTop = chatEl.value.scrollHeight
}
</script>

<style scoped>
.ss { display: flex; flex-direction: column; height: calc(100vh - 88px); padding: 0 0 0; box-sizing: border-box; }
.ss-head { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding-bottom: 10px; border-bottom: 1px solid #f0eef7; }
.h-left { display: flex; align-items: center; gap: 8px; min-width: 0; }
.h-left h1 { margin: 0; font-size: 15px; font-weight: 600; color: #2b2b3a; white-space: nowrap; }
.divider { color: #d5d2e2; font-size: 12px; }
.kind-chip { font-size: 10.5px; border-radius: 6px; padding: 1px 7px; }
.kind-chip.check { color: #0f6e56; background: #e8f5f0; }
.kind-chip.action { color: #4b3fa8; background: #eeedfe; }
.key-chip { font-family: ui-monospace, monospace; font-size: 10.5px; color: #8b8a9b; background: #f5f4fa; border-radius: 6px; padding: 1px 7px; }
.ver-chip { font-size: 10.5px; color: #8b8a9b; }
.draft-chip { font-size: 10.5px; color: #b45309; background: #fdf6e7; border-radius: 6px; padding: 1px 7px; }
.h-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.dot { font-size: 11px; padding: 2px 8px; border-radius: 20px; }
.dot.ok { color: #1f8f66; background: #e9f8f1; }
.dot.warn { color: #a2700a; background: #fdf5e6; }

.ss-body { display: grid; grid-template-columns: minmax(0, 1fr) clamp(440px, 36%, 560px); gap: 18px; flex: 1; min-height: 0; padding: 12px 0 0; }
.pane { display: flex; flex-direction: column; min-height: 0; min-width: 0; }
.chat { flex: 1; min-height: 0; overflow-y: auto; padding: 0 6px 14px 0; display: flex; flex-direction: column; gap: 12px; }

.hello { max-width: 720px; padding: 6px 0 10px; display: flex; flex-direction: column; }
.hello.center { margin: auto 0; }
.hello-row { display: flex; gap: 10px; align-items: flex-start; }
.avatar.lg { width: 30px; height: 30px; border-radius: 10px; font-size: 12px; }
.hello-bubble { flex: 1; min-width: 0; background: #fff; border: 1px solid #eeebf8; border-radius: 12px; padding: 11px 14px 12px; box-shadow: 0 1px 3px rgba(90, 80, 160, .05); }
.who { font-size: 10.5px; color: #a8a6b8; margin-bottom: 3px; letter-spacing: .2px; }
.hb-t { margin: 0; font-size: 13px; line-height: 1.75; color: #3c3b4d; }
.hb-s { margin: 6px 0 0; font-size: 11.5px; line-height: 1.75; color: #9b99ab; }

.sug-t { margin: 18px 0 8px; font-size: 11px; color: #a8a6b8; letter-spacing: .2px; }
.sug-list { display: flex; flex-direction: column; gap: 8px; }
.sug {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  width: 100%; text-align: left; cursor: pointer;
  padding: 10px 13px; border: 1px solid #edebf6; border-radius: 11px; background: #fff;
  transition: border-color .15s, box-shadow .15s, transform .15s;
}
.sug:hover { border-color: #c9bff0; box-shadow: 0 2px 10px rgba(108, 92, 231, .10); transform: translateY(-1px); }
.sug-main { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.sug-txt { font-size: 12.5px; color: #4a4959; line-height: 1.6; }
.sug-tag { font-size: 10.5px; color: #a8a6b8; }
.sug-arrow { font-size: 12px; color: #b3a9e0; flex: none; }
.hello-foot { margin-top: 14px; font-size: 11px; color: #a8a6b8; }

.msg { display: flex; gap: 9px; align-items: flex-start; }
.msg.user { justify-content: flex-end; }
.avatar { width: 24px; height: 24px; border-radius: 8px; background: linear-gradient(140deg, #8375ef, #6c5ce7); color: #fff; font-size: 11px; display: flex; align-items: center; justify-content: center; flex: none; box-shadow: 0 1px 4px rgba(108, 92, 231, .25); }
.bubble { max-width: 720px; font-size: 12.5px; line-height: 1.8; }
.bubble.user {
  background: linear-gradient(140deg, #7f70ec, #6c5ce7); color: #fff;
  border-radius: 14px 14px 4px 14px; padding: 9px 14px;
  box-shadow: 0 2px 8px rgba(108, 92, 231, .18);
}
.bubble.agent {
  background: #fff; border: 1px solid #eeebf8; color: #3c3b4d;
  border-radius: 4px 14px 14px 14px; padding: 10px 14px;
  box-shadow: 0 1px 3px rgba(90, 80, 160, .05);
}
.txt { margin: 0; }
.r-meta { margin-top: 8px; }
.r-chip { font-size: 11px; color: #4b3fa8; background: #f4f1ff; border-radius: 6px; padding: 2px 8px; }
.recap { margin-top: 10px; padding: 7px 0 7px 10px; background: #fbfaff; border-left: 2px solid #d7cdf6; border-radius: 0 8px 8px 0; }
.rc-t { font-size: 10.5px; color: #9b99ab; margin-bottom: 4px; }
.rc-i { font-size: 11.5px; color: #55536a; line-height: 1.75; }
.err { font-size: 12px; color: #c0392b; background: #fdecea; border-radius: 8px; padding: 9px 12px; }

.trial { border: 1px solid #eceaf4; border-radius: 11px; background: #fff; padding: 10px 12px; }
.tr-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
.tr-t { font-size: 11.5px; color: #4a4959; font-weight: 500; }
.tr-meta { font-size: 10.5px; color: #b0aebe; display: inline-flex; align-items: baseline; gap: 8px; }
.tr-all { border: none; background: transparent; padding: 0; font-size: 10.5px; color: #6c5ce7; cursor: pointer; font-family: inherit; }
.tr-all:hover { color: #4b3fa8; text-decoration: underline; }
.tr-sum { font-size: 11px; color: #8b8a9b; margin-top: 3px; }
.tr-note { color: #b0aebe; }
.tr-rows { margin-top: 7px; display: flex; flex-direction: column; gap: 4px; }
.tr-row { display: flex; align-items: center; gap: 8px; }
.vc { flex: none; width: 74px; display: flex; flex-direction: column; line-height: 1.35; font-size: 11px; color: #3c3b4d; }
.vc em { font-style: normal; font-family: ui-monospace, monospace; font-size: 9.5px; color: #b0aebe; }
.vr { font-size: 10px; border-radius: 5px; padding: 1px 6px; }
.vr.ok { color: #0f6e56; background: #e1f5ee; }
.vr.bad { color: #b23b3b; background: #fdecec; }
.vr.soft { color: #9a6b00; background: #fdf6e7; }
.vm { font-size: 11px; color: #4a4a55; }
.trial-empty { font-size: 11.5px; color: #b0aebe; background: #faf9ff; border: 1px dashed #e6e2f5; border-radius: 10px; padding: 9px 12px; }

.panel { display: flex; flex-direction: column; min-height: 0; border: 1px solid #eceaf4; border-radius: 12px; background: #fff; overflow: hidden; }
.p-head { flex: none; display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: #fbfaff; border-bottom: 1px solid #f2f0f8; }
.ph-t { font-size: 12.5px; font-weight: 600; color: #3c3b4d; }
.ph-chip { font-size: 10.5px; color: #4b3fa8; background: #eeedfe; border-radius: 6px; padding: 1px 7px; }
.ph-chip.live { color: #0f6e56; background: #e8f5f0; }
.ph-hint { margin-left: auto; font-size: 10.5px; color: #b0aebe; }
.p-body { flex: 1; min-height: 0; overflow-y: auto; padding: 2px 0 10px; display: flex; flex-direction: column; }
.p-body > * { flex: none; }
.p-block { padding: 12px 18px; border-bottom: 1px solid #f5f3fa; }
.p-block:last-child { border-bottom: none; }
.p-t { font-size: 11.5px; color: #6f6d82; font-weight: 500; margin-bottom: 7px; display: flex; align-items: baseline; gap: 6px; }
.p-t em { font-style: normal; font-size: 10.5px; color: #b0aebe; font-weight: 400; }
.p-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px 18px; }
.p-line { display: flex; gap: 10px; font-size: 11.5px; line-height: 1.85; }
.p-line b { flex: none; width: 38px; font-weight: 400; color: #a3a0a1; }
.p-line b.w5 { width: 52px; }
.p-line span { color: #3c3b4d; }
.p-line.col { flex-direction: column; gap: 1px; }
.p-line.col b { width: auto; font-size: 10.5px; }
.p-desc { font-size: 11.5px; color: #7a7890; line-height: 1.75; margin-top: 5px; padding-top: 5px; border-top: 1px dashed #f2f0f8; }
.p-foot { font-size: 10.5px; color: #b0aebe; margin-top: 6px; }
.src { color: #5f6368; }
.mono { font-family: ui-monospace, monospace; font-size: 11px; }
.conds { display: flex; flex-wrap: wrap; gap: 5px; }
.cond { font-size: 11.5px; border-radius: 7px; padding: 2px 8px; line-height: 1.6; }
.cond.pass { color: #0f6e56; background: #e8f5f0; }
.cond.soft { color: #9a6b00; background: #fdf6e7; }
.cond.fresh { outline: 1px solid #8f7ce0; }
.cond i { font-style: normal; font-size: 9px; color: #fff; background: #8f7ce0; border-radius: 4px; padding: 0 3px; margin-left: 4px; }
.logic { font-size: 10px; font-weight: 600; color: #534ab7; background: #eeedfe; border-radius: 5px; padding: 0 5px; align-self: center; }
.field-chip { font-size: 11px; color: #55536a; background: #f5f4fa; border-radius: 6px; padding: 1px 7px; }
.fields { display: flex; flex-direction: column; gap: 3px; }
.field-row { display: flex; align-items: baseline; gap: 8px; font-size: 11.5px; }
.field-name { flex: 1; color: #3c3b4d; }
.field-key { font-family: ui-monospace, monospace; font-size: 10px; color: #b0aebe; text-align: right; flex: none; }
.p-empty { font-size: 11.5px; color: #b9b7bd; }
.p-hint { font-size: 10.5px; color: #b0aebe; margin-top: 6px; line-height: 1.7; }
.p-fix { margin-top: 7px; width: 100%; text-align: left; font-size: 10.5px; line-height: 1.6; color: #a2700a; background: #fdf6e7; border: 1px solid #f6e6c8; border-radius: 7px; padding: 5px 8px; cursor: pointer; font-family: inherit; }
.p-fix:hover { border-color: #e6c98a; background: #fcf1dc; }
.mode-chip { font-size: 10.5px; border-radius: 6px; padding: 1px 7px; }
.mode-chip.execute { color: #0f6e56; background: #e8f5f0; }
.mode-chip.notify { color: #35618f; background: #eef4fb; }
.mode-chip.deliver { color: #7a5c1f; background: #fbf3e2; }
.io { display: flex; flex-direction: column; gap: 3px; }
.io-row { display: flex; align-items: baseline; gap: 7px; font-size: 11.5px; }
.io-k { font-family: ui-monospace, monospace; font-size: 10.5px; color: #8b8a9b; width: 82px; flex: none; }
.io-l { color: #3c3b4d; }
.io-f { margin-left: auto; font-size: 10px; color: #a3a0a1; }
.ver-row { display: flex; align-items: baseline; gap: 8px; font-size: 11.5px; }
.ver-row.draft .v-no { color: #b45309; }
.v-no { font-family: ui-monospace, monospace; font-size: 11px; color: #4b3fa8; }
.v-t { color: #8b8a9b; font-size: 11px; }
.ref-wrap { display: flex; flex-wrap: wrap; gap: 6px; }
.ref-chip { font-size: 11.5px; color: #534ab7; background: #eeedfe; border-radius: 9px; padding: 2px 9px; }
.log-row { display: flex; align-items: baseline; gap: 7px; font-size: 11px; color: #8b8a9b; line-height: 1.9; flex-wrap: wrap; }
.log-v { font-family: ui-monospace, monospace; color: #4b3fa8; }
.log-a { color: #6f6d82; }
.log-t { color: #a3a0a1; }
.log-n { color: #b0aebe; flex: 1 1 100%; }
.p-empty-state { flex: 1; display: flex; flex-direction: column; padding: 18px 18px 20px; }
.pe-main { margin: auto 0; }
.pe-t { font-size: 12.5px; color: #55536a; font-weight: 500; }
.pe-list { display: flex; flex-direction: column; gap: 9px; margin-top: 13px; }
.pe-item { display: flex; gap: 10px; align-items: flex-start; border: 1px dashed #e9e5f6; border-radius: 9px; padding: 11px 12px; background: #fcfbff; }
.pe-i { flex: none; width: 18px; height: 18px; border-radius: 5px; background: #f1eefe; color: #7a6ee0; font-size: 10.5px; display: flex; align-items: center; justify-content: center; margin-top: 1px; }
.pe-c { display: flex; flex-direction: column; gap: 2px; }
.pe-k { font-size: 12px; color: #4a4959; line-height: 1.6; }
.pe-d { font-size: 11px; color: #a3a0a1; line-height: 1.65; }
.pe-foot { margin-top: auto; padding-top: 16px; font-size: 11px; color: #b0aebe; line-height: 1.75; border-top: 1px dashed #f0edf9; }

.composer { flex: none; padding: 8px 0 12px; }
.box {
  border: 1px solid #e6e2f4; border-radius: 13px; background: #fff;
  padding: 8px 10px 8px; transition: border-color .15s, box-shadow .15s;
  box-shadow: 0 1px 2px rgba(90, 80, 160, .04);
}
.box:focus-within { border-color: #b3a6ea; box-shadow: 0 0 0 3px rgba(124, 108, 240, .10); }
.box textarea {
  display: block; width: 100%; height: 46px; resize: none;
  border: none; outline: none; background: transparent;
  padding: 2px 3px; font-size: 12.5px; line-height: 1.7; color: #3c3b4d; font-family: inherit;
}
.box textarea::placeholder { color: #b9b7c6; }
.box-bar { display: flex; align-items: center; gap: 6px; padding: 4px 3px 0; }
.kbd { font-family: inherit; font-size: 10px; color: #a8a6b8; background: #f6f4fc; border: 1px solid #ece8f8; border-bottom-width: 2px; border-radius: 5px; padding: 0 5px; line-height: 15px; }
.bar-hint { font-size: 11px; color: #b3b1c1; margin-left: 2px; }
.send {
  margin-left: auto; display: inline-flex; align-items: center; gap: 6px;
  height: 30px; padding: 0 15px; border: none; border-radius: 8px;
  background: linear-gradient(140deg, #7f70ec, #6c5ce7); color: #fff;
  font-size: 12.5px; font-family: inherit; cursor: pointer;
  box-shadow: 0 2px 8px rgba(108, 92, 231, .20); transition: opacity .15s, transform .15s;
}
.send:hover:not(:disabled) { transform: translateY(-1px); }
.send:disabled { background: #eeecf8; color: #b8b4cb; box-shadow: none; cursor: not-allowed; }
.spin {
  width: 11px; height: 11px; border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, .45); border-top-color: #fff;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
