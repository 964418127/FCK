<!--
  起草新事件：一段话 → 查事实 → 追问缺口 → 确认单（触点 / 适用范围 / 骨架）→ 存成一套提示词

  为什么它不是侧栏里的一级页面：
  对话不是一类对象，而是「新建根事件」的起草方式。挂成并列菜单会暗示
  这是一个可以脱离事件反复产草稿的工作区，实际它每次产出的都是一个新事件。

  为什么确认单要分成三段：
  一件事不是一棵树，是三样东西叠在一起 ——
    触点：这张单什么时候存在（从哪触发、带什么进来）
    人群：这件事对谁存在（谁会被卷进来，多少人）
    子事件：谁把哪条结论做实（人交什么、系统取什么结论）
  只生成第三样，前两样就只能事后手填或从样本人反推 —— 那是缺口，不是交互问题。

-->
<template>
  <div class="cs">
    <header class="cs-head">
      <div class="h-left">
        <el-button link size="small" :icon="Back" class="crumb" @click="backToEvents">事件管理</el-button>
        <h1>新建根事件</h1>
        <p class="h-sub">说清从哪触发、对谁、分几步；Agent 查事实、问缺口，给出确认单。确认即发 v1，回到事件管理。</p>
      </div>
      <div class="h-right">
        <!-- 契约版本属开发面：?dev=1 才露；模型名挪到输入框旁（那儿才是换模型的地方） -->
        <span v-if="dev" class="ver">契约 {{ contractVersion }}</span>
      </div>
    </header>

    <div class="cs-body">
      <div class="pane">
        <main ref="chatEl" class="chat">
          <!-- 开场：对话开始前的引导，别让左栏空成一张表单 -->
          <div v-if="!userText" class="hello center">
            <div class="hello-row">
              <div class="avatar lg">A</div>
              <div class="hello-bubble">
                <div class="who">事件 Agent</div>
                <p class="hb-t">
                  说清楚这件事怎么走 —— 从哪触发、对谁、分几步；我把它拆成触点、人群与子事件。
                </p>
                <p class="hb-s">
                  模型能看见组织、岗位编制、角色解析与系统项目录；金额、账号这类逐人数据属于触发后随单带进来的数据，定义期不假设。
                </p>
              </div>
            </div>

            <div class="sug-t">试试这样说</div>
            <div class="sug-list">
              <button class="sug" @click="useSample">
                <span class="sug-main">
                  <span class="sug-tag">示例 · 离职全流程</span>
                  <span class="sug-txt">{{ SAMPLE }}</span>
                </span>
                <span class="sug-arrow">↗</span>
              </button>
            </div>

            <div class="hello-foot">Agent 先查事实、再问缺口，确认单在对话里逐步成形</div>
          </div>

          <!-- 用户 -->
          <div v-if="userText" class="msg user">
            <div class="bubble user">{{ userText }}</div>
          </div>

          <!-- Agent：理解 + 追问 -->
          <div v-if="ask" class="msg agent">
            <div class="avatar">A</div>
            <div class="bubble agent">
              <div class="who">事件 Agent</div>
              <p class="understood">{{ ask.understood }}</p>

              <div class="gaps">
                <div v-for="g in ask.gaps" :key="g.id" class="gap">
                  <div class="g-top">
                    <span class="lvl" :class="g.level">{{ g.level === 'hard' ? '必答' : '建议' }}</span>
                    <span class="kind" :class="g.kind">{{ KIND_LABEL[g.kind] || '契约缺口' }}</span>
                    <span class="about">{{ g.about }}</span>
                  </div>
                  <div class="g-q">{{ g.question }}</div>
                  <div class="g-why">为什么问：{{ g.why }}</div>
                  <div class="g-opts">
                    <button
                      v-for="o in g.options" :key="o" class="opt"
                      :class="{ on: answers[g.id] === o }" @click="answers[g.id] = o"
                    >{{ o }}</button>
                    <button
                      v-if="g.level === 'soft'" class="opt skip"
                      :class="{ on: answers[g.id] === '（跳过）' }" @click="answers[g.id] = '（跳过）'"
                    >先不管</button>
                  </div>
                </div>
              </div>

              <div class="g-foot">
                <button class="g-btn" :disabled="!!hardLeft || composing" @click="doCompose">
                  <span v-if="composing" class="spin dark"></span>
                  {{ composing ? '正在生成' : '确认并生成' }}
                </button>
                <span class="hint">{{ hardLeft ? `还有 ${hardLeft} 个必答没选` : '必答齐了' }}</span>
              </div>
            </div>
          </div>

          <!-- Agent：确认单 -->
          <div v-if="result" class="msg agent">
            <div class="avatar">A</div>
            <div class="bubble agent wide">
              <div class="who">事件 Agent</div>
              <div class="r-head">
                <div class="rh-main">
                  <div class="r-name">{{ result.name }}</div>
                  <div class="r-sum">{{ result.summary }}</div>
                </div>
                <div class="rh-side">
                  <span :class="['vstat', blocked ? 'bad' : issues.length ? 'warn' : 'ok']">{{ verdictText }}</span>
                  <button class="r-btn" :disabled="blocked" @click="doPublish">保存并进工作台</button>
                </div>
              </div>

              <!-- 一 / 触点 -->
              <section class="blk">
                <div class="blk-h">
                  <i class="bn">1</i><b>触点</b>
                  <span class="bh-sub">这件事从哪触发 · 没有触点就不会触发</span>
                </div>

                <div class="seg">
                  <button
                    v-for="t in TRIGGER_TYPES" :key="t.key"
                    :class="{ on: result.trigger.type === t.key }"
                    @click="switchTrigger(t.key)"
                  >{{ t.label }}</button>
                </div>
                <div class="tp-hint">{{ triggerTypeOf(result.trigger.type)?.hint }}</div>

                <div class="grid2">
                  <template v-if="result.trigger.type === 'business'">
                    <label>业务事件点</label>
                    <el-select :model-value="result.trigger.eventPoint" size="small" filterable placeholder="从触点目录选" @update:model-value="onPointChange">
                      <el-option v-for="p in eventPoints" :key="p.key" :label="`${p.label} · ${p.source}`" :value="p.key" />
                    </el-select>
                    <label>触点入口</label>
                    <el-input v-model="result.trigger.entry" size="small" placeholder="端 · 位置，如 员工自助端 · 我的 · 离职申请" />
                  </template>

                  <template v-else-if="result.trigger.type === 'manual'">
                    <label>可发起角色</label>
                    <el-select v-model="result.trigger.who.roles" multiple collapse-tags size="small" placeholder="谁可以发起">
                      <el-option v-for="r in roles" :key="r.key" :label="r.label" :value="r.key" />
                    </el-select>
                    <label>触点入口</label>
                    <el-input v-model="result.trigger.entry" size="small" placeholder="哪个端、哪个位置点「发起」" />
                  </template>

                  <template v-else>
                    <label>巡检周期</label>
                    <el-input v-model="result.trigger.cron" size="small" placeholder="例：每月 1 日 09:00" />
                    <label>触点入口</label>
                    <el-input v-model="result.trigger.entry" size="small" placeholder="巡检结果出现在哪" />
                  </template>
                </div>

                <div v-if="payloadCands.length" class="pl">
                  <span class="pl-k">接住时带入</span>
                  <span
                    v-for="f in payloadCands" :key="f.key"
                    :class="['pl-i', { on: isPicked(f.key), lock: f.role === 'empNo' }]"
                    :title="f.role === 'empNo' ? '取数入参：引擎拿它查员工档案，不能取消' : `来源：${result.trigger.eventPoint} 登记`"
                    @click="f.role === 'empNo' ? null : togglePayload(f)"
                  >{{ f.label }}<em v-if="f.role === 'empNo'">必用</em><em v-else-if="f.required">必传</em></span>
                </div>

                <div v-if="payloadPicked.length" class="pu">
                  <div v-for="f in payloadPicked" :key="f.key" class="pu-i">
                    <span class="pu-k">{{ f.label }}</span>
                    <el-select :model-value="f.use" size="small" class="pu-sel" @change="(v) => setUse(f.key, v)">
                      <el-option v-for="u in PAYLOAD_USE" :key="u.key" :label="u.label" :value="u.key" />
                    </el-select>
                  </div>
                </div>
              </section>

              <!-- 二 / 人群 -->
              <section class="blk">
                <div class="blk-h">
                  <i class="bn">2</i><b>适用条件</b>
                  <span class="bh-sub">这套提示词管谁 · 匹配条件不是名单 · 空维度表示不限</span>
                  <em class="hcnt">≈ {{ estimate }} 人（估）</em>
                </div>
                <div v-for="dim in COVERAGE_DIMS" :key="dim.key" class="cov-row">
                  <span class="cv-k">{{ dim.label }}</span>
                  <el-select v-model="result.coverage[dim.key]" multiple collapse-tags size="small" :placeholder="dim.hint">
                    <el-option v-for="o in dim.options" :key="o" :label="o" :value="o" />
                  </el-select>
                </div>
                <div class="cov-note">人数按岗位编制 × 城市占比 × 用工占比估算，只是量级，不是名单 —— 谁符合条件要等触发时按员工档案判；判完的差异由这一单的事实决定。</div>
              </section>

              <!-- 三 / 子事件 -->
              <section class="blk">
                <div class="blk-h">
                  <i class="bn">3</i><b>子事件</b>
                  <span class="bh-sub">{{ result.skeleton.length }} 条 · 必过 {{ mustCount }} · 触发时才长成树</span>
                </div>

                <div class="sks">
                  <div v-for="(s, i) in result.skeleton" :key="s.key" class="sk">
                    <div class="sk-top">
                      <span class="idx">{{ i + 1 }}</span>
                      <span class="sk-goal">{{ s.goal }}</span>
                      <button class="gate" :class="s.gate" @click="toggleGate(s)">{{ s.gate === 'must' ? '必过' : '可选' }}</button>
                    </div>
                    <div class="sk-meta">
                      <span class="sk-need">{{ needTextOf(s.needs, result) }}</span>
                      <span class="sk-path">{{ pathSummary(s) }}</span>
                      <span v-if="(s.after || []).length" class="sk-after">等 {{ s.after.length }} 条前置</span>
                    </div>
                    <div v-if="firstItemOf(s)" class="sk-form">
                      {{ firstItemOf(s).title }}：{{ firstItemOf(s).require }}
                      <em v-if="(firstItemOf(s).fields || []).length">{{ firstItemOf(s).fields.length }} 个组件</em>
                    </div>
                  </div>
                </div>

                <div v-if="(result.facts || []).length" class="sk-facts">
                  <span class="sf-k">本事件声明的事实</span>
                  <span v-for="f in result.facts" :key="f.key" class="sf-i">
                    {{ f.label }}<em>{{ f.absent }}</em>
                  </span>
                </div>

                <div class="cov-note">
                  这里只写这一单必须办成什么，不是流程：依赖、表单与承担者在触发时按这一单的人与事实算，
                  事实取不到的那一条不长出来。这里只保证「一条都不能少」。
                  <button class="inline-link" @click="srcOpen = true">看它长成什么树 ↗</button>
                </div>
              </section>

              <div v-if="issues.length" class="issue-box">
                <div class="ib-t">{{ blocked ? '还不能发布 · 先解掉这些' : '可以发布 · 这些只是提醒' }}</div>
                <div v-for="(it, i) in issues" :key="i" class="ib-i" :class="it.level">
                  <span class="ib-lv">{{ it.level === 'error' ? '错误' : '提醒' }}</span>{{ it.text }}
                </div>
              </div>

              <div v-if="result.recap && result.recap.length" class="recap">
                <div class="rc-t">它为什么这么排</div>
                <div v-for="(r, i) in result.recap" :key="i" class="rc-i">{{ r }}</div>
              </div>
            </div>
          </div>

          <div v-if="error" class="err">{{ error }}</div>
        </main>

        <footer class="composer">
          <!-- 提示词模板：给人学的写作蓝本，放在「开口之前」而不是存完之后 -->
          <button class="tpl-bar" @click="srcOpen = true">
            <span class="tb-k">写作样板</span>
            <span class="tb-v">{{ result ? '这一套会长成什么样' : '一套合格的提示词长什么样 · 照着写，不靠猜' }}</span>
            <span class="tb-a">看样板 ↗</span>
          </button>
          <div class="box">
            <textarea
              ref="taEl"
              v-model="draft" :class="{ long: draft.length > 160 }" :disabled="asking || composing"
              placeholder="例如：推拿师和调理师（全职、试用）在员工自助端提交离职申请后自动触发；先由城市人事经理审核离职信息（必过），再进交接：交还工服（非必过）、移除门店系统权限（必过），最后发电子合同"
              @keydown.meta.enter="doAsk" @keydown.ctrl.enter="doAsk"
            />
            <div class="box-bar">
              <kbd class="kbd">⌘</kbd><kbd class="kbd">↵</kbd>
              <span class="bar-hint">{{ draft.trim() ? '可以交给 Agent 了' : '一句话说清这件事怎么走，越具体越好' }}</span>

              <!-- 模型就在要说的话旁边：现在能换（供应商列表 / 已拉到的模型），换供应商与 key 仍归菜单配置 -->
              <div ref="mdlEl" class="mdl">
                <button :class="['mdl-chip', { warn: !llmOk }]" @click="mdlOpen = !mdlOpen">
                  <span class="mdl-dot"></span>{{ mdlLabel }}<i>▾</i>
                </button>

                <div v-if="mdlOpen" class="mdl-pop">
                  <div class="mp-head">
                    <span class="mp-p">{{ providerLabel }}</span>
                    <button class="mp-refresh" :disabled="llmState.modelsLoading" @click="refreshModels">
                      {{ llmState.modelsLoading ? '拉取中…' : '刷新列表' }}
                    </button>
                  </div>
                  <div class="mp-list">
                    <button
                      v-for="m in modelOptions" :key="m"
                      :class="['mp-i', { on: m === llmState.config.model }]"
                      @click="pickModel(m)"
                    >
                      <span class="mp-n">{{ m }}</span>
                      <span v-if="m === llmState.config.model" class="mp-ok">当前</span>
                    </button>
                    <p v-if="!modelOptions.length" class="mp-empty">
                      这个供应商没有预置模型名，去菜单配置里手填一个。
                    </p>
                  </div>
                  <div class="mp-foot">
                    <span v-if="!llmState.config.hasKey" class="mp-warn">还没配 key，选了也生成不了</span>
                    <button class="mp-go" @click="goLlmConfig">换供应商 / 填 key →</button>
                  </div>
                </div>
              </div>

              <button class="send" :disabled="!draft.trim() || !!ask" @click="doAsk">
                <span v-if="asking" class="spin"></span>
                {{ asking ? '正在查事实、找缺口' : '交给 Agent 梳理' }}
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>

    <div v-if="srcOpen" class="src-layer" @click.self="srcOpen = false">
      <div class="src-panel">
        <header class="sp-head">
          <div class="sp-title">
            <b>{{ result ? '这一套会变成什么' : '写作样板 · 一套写好之后长这样' }}</b>
            <span>{{ result ? '上面审的口径与清单，渲染出来就是这段 · 触发时整段发给模型' : '照这个结构说需求：口径分几段、一条结论怎么写字、什么时候必须挂附件' }}</span>
          </div>
          <div class="sp-act">
            <button class="sp-primary" @click="insertSrc">{{ result ? '插回输入框改' : '用这套样板起草' }}</button>
            <button @click="copySrc">{{ srcCopied ? '已复制' : '复制' }}</button>
            <button class="sp-x" @click="srcOpen = false">关闭</button>
          </div>
        </header>
        <div class="sp-body"><pre class="src-pre">{{ srcTpl }}</pre></div>
        <footer class="sp-foot">
          <template v-if="result">要改就在确认单里改：口径改一句、清单加一条，这里跟着变 —— 它不是第二份文档。想直接改这段文字，就「插回输入框改」，改完再交给 Agent 重梳一遍。</template>
          <template v-else>这是「离职」那一套的成品，给你看写法与粒度。点「用这套样板起草」会整段填进输入框，把离职换成你的事、删掉用不上的条目，就能交给 Agent —— 以改代写，比从零抄快。</template>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Back } from '@element-plus/icons-vue'
import { runAsk, runCompose } from '../../v2/gen.js'
import { adoptPrompt, checks, actionList } from '../../v2/store.js'
import {
  TRIGGER_TYPES, COVERAGE_DIMS, roles, wayTypeLabel, triggerTypeOf,
  controlsOf, controlOf, headcountOf, ownersOf, subMapOf, clone,
  ownerOfWay, ownerLabel
} from '../../v2/model.js'
import { eventPoints, resignPrompt } from '../../v2/seed.js'
import { renderTemplate } from '../../v2/template.js'
import { resignSkeleton, RESIGN_FACTS, needTextOf, pathSummary, unknownNeedsOf } from '../../v2/skeleton.js'
import { normalizeTrigger, normalizeCoverage } from '../../v2/shape.js'
import { PAYLOAD_USE, payloadCandidatesOf, payloadPlanOf, unknownPayloadOf } from '../../v2/payload.js'
import { validateEvent } from '../../v2/validate.js'
import { CONTRACT } from '../../v2/contract.js'
import { llmState, loadLlmConfig, saveLlmConfig, fetchLlmModels } from '../../composables/useLlmConfig.js'
import { presetOf } from '../../config/llmPresets.js'

const SAMPLE = '推拿师和调理师（全职、试用）在员工自助端提交离职申请后自动触发。先由城市人事经理审核离职信息：期望离职日期、离职原因，必须通过才能进交接。后勤交接由门店店长办：交还工服（非必过）。然后系统去查欠款，移除门店系统权限（必过），最后给员工发离职电子合同，签完把结果推给薪酬、社保和假勤。'

const KIND_LABEL = { touch: '触点缺口', crowd: '人群缺口', contract: '契约缺口', data: '数据联想' }
const FREQ_TEXT = { none: '只取一次', '2h': '每 2 小时', '12h': '每 12 小时', '1d': '每天', '3d': '每 3 天' }

const router = useRouter()
const route = useRoute()
const draft = ref('')
const userText = ref('')
const ask = ref(null)
const result = ref(null)
/* 写作样板：没起草时看离职那套成品，起草后看「这一套」的实时渲染 */
const srcOpen = ref(false)
const srcCopied = ref(false)
const srcTpl = computed(() => {
  const r = result.value
  if (!r) return renderTemplate(resignPrompt)
  return renderTemplate({
    name: r.name, summary: r.summary, body: r.body,
    skeleton: r.skeleton, scope: r.coverage, trigger: r.trigger, facts: r.facts
  })
})
const taEl = ref(null)
async function copySrc () {
  try {
    await navigator.clipboard.writeText(srcTpl.value)
    srcCopied.value = true
    setTimeout(() => { srcCopied.value = false }, 1600)
  } catch (e) {
    ElMessage.warning('浏览器不允许直接复制，手动选中复制')
  }
}
/* 样板不是只在别处用：直接填回输入框，改一改就是自己的了（以改代写） */
function insertSrc () {
  draft.value = srcTpl.value
  srcOpen.value = false
  nextTick(() => {
    const el = taEl.value
    if (!el) return
    el.focus()
    el.setSelectionRange(0, 0)
    el.scrollTop = 0
  })
  ElMessage.success(result.value
    ? '已插回输入框，改完再交给 Agent'
    : '已插入 · 把「离职」换成你的事、删掉用不上的条目')
}
const answers = reactive({})
const asking = ref(false)
const composing = ref(false)
const error = ref('')
const chatEl = ref(null)
const contractVersion = `${CONTRACT.id} ${CONTRACT.version}`
/** 契约版本 / 模型名属于开发面：交付态不摆出来，?dev=1 才显示 */
const dev = computed(() => route.query.dev === '1')

const llmOk = computed(() => llmState.available === true && llmState.config.hasKey)

/* ---------------- 模型：就在输入框旁边 ----------------
 * 名字放这儿、能点开换 —— 换的是「这一问用哪个模型」，不是供应商与 key（那些归菜单配置）。
 * 候选优先用供应商 /models 拉回来的真名单（模型名变得快），拉不到就退预置列表。
 */
const mdlOpen = ref(false)
const mdlEl = ref(null)
/** 点面板外收起：不用遮罩，输入框还得能继续打 */
function closeMdlOnOutside (e) {
  if (mdlOpen.value && mdlEl.value && !mdlEl.value.contains(e.target)) mdlOpen.value = false
}
onMounted(() => document.addEventListener('click', closeMdlOnOutside, true))
onBeforeUnmount(() => document.removeEventListener('click', closeMdlOnOutside, true))
const providerLabel = computed(() => presetOf(llmState.config.provider || 'deepseek').label)
const mdlLabel = computed(() => (llmOk.value ? (llmState.config.model || '模型已就绪') : '未配置模型'))
const modelOptions = computed(() => {
  const preset = presetOf(llmState.config.provider || 'deepseek')
  return llmState.models.length ? llmState.models : (preset.models || [])
})
async function refreshModels () {
  const r = await fetchLlmModels()
  if (!r.ok) ElMessage.warning(r.message || '拉取失败，先用预置名单')
}
async function pickModel (m) {
  if (m === llmState.config.model) { mdlOpen.value = false; return }
  const r = await saveLlmConfig({ model: m })
  if (r.ok) {
    mdlOpen.value = false
    ElMessage.success(`已切到 ${m}`)
  } else {
    /* 换模型是写配置：没登录时后端会拦，说清楚去哪儿登录，别丢一句 401 */
    const msg = /\/gate/.test(r.message || '')
      ? '改模型要先在菜单配置（/gate）登录，登录后回来再选'
      : (r.message || '切换失败')
    ElMessage.warning(msg)
  }
}
function goLlmConfig () {
  mdlOpen.value = false
  router.push({ name: 'gate' })
}
const busy = computed(() => asking.value || composing.value)
const hardLeft = computed(() => {
  if (!ask.value) return 0
  return ask.value.gaps.filter((g) => g.level === 'hard' && !answers[g.id]).length
})

/* ---------------- 触点 ---------------- */
const payloadCands = computed(() => payloadCandidatesOf(result.value?.trigger?.eventPoint || ''))
const payloadPicked = computed(() => payloadPlanOf(result.value?.trigger || {}))
const isPicked = (k) => (result.value?.trigger?.payload || []).some((p) => p.field === k)
function togglePayload (f) {
  const t = result.value.trigger
  const list = t.payload || []
  t.payload = list.some((p) => p.field === f.key)
    ? list.filter((p) => p.field !== f.key)
    : [...list, { field: f.key, use: f.use }]
}
function setUse (k, use) {
  const t = result.value.trigger
  t.payload = (t.payload || []).map((p) => (p.field === k ? { ...p, use } : p))
}

function switchTrigger (type) {
  const cur = result.value.trigger
  const entry = cur.entry || ''
  if (type === 'business') {
    const p = eventPoints[0]
    result.value.trigger = {
      type,
      entry: entry || p.entry,
      eventPoint: cur.eventPoint || p.key,
      payload: (cur.payload || []).length ? cur.payload : payloadCandidatesOf(p.key).map((f) => ({ field: f.key, use: f.use }))
    }
  } else if (type === 'manual') {
    result.value.trigger = { type, entry, who: { roles: [], resolveBy: 'store' } }
  } else {
    result.value.trigger = { type, entry, cron: '' }
  }
}
function onPointChange (key) {
  const p = eventPoints.find((x) => x.key === key)
  if (!p) return
  const t = result.value.trigger
  // 入口还空着、或还是别的事件点的登记入口 → 跟着换掉；人改过的就不动
  if (!t.entry || eventPoints.some((x) => x.entry === t.entry)) t.entry = p.entry
  if (!(t.payload || []).length) t.payload = payloadCandidatesOf(p.key).map((f) => ({ field: f.key, use: f.use }))
}

/* ---------------- 人群 ---------------- */
const estimate = computed(() => (result.value ? headcountOf(result.value.coverage) : 0))
function ownerText (owner) {
  const names = ownersOf(owner, result.value.coverage)
  return names.length <= 2 ? names.join(' / ') : `${names.slice(0, 2).join(' / ')} 等 ${names.length} 人`
}

/* ---------------- 骨架 ---------------- */
const mustCount = computed(() => (result.value?.skeleton || []).filter((s) => s.gate !== 'optional').length)
const firstItemOf = (s) => (s.paths || []).filter((p) => p.type === 'human').flatMap((p) => p.items || [])[0] || null
const levelMap = computed(() => subMapOf(result.value?.subs || []))

const checkOf = (k) => checks.find((c) => c.key === k) || null
const actionOf = (k) => actionList.find((a) => a.key === k) || null
const levelsOf = (w) => (w.levels?.length ? w.levels : [{ owner: ownerOfWay(w), mode: 'any' }])

function wayWho (w) {
  if (w.type === 'human') return `${ownerLabel(ownerOfWay(w))} → ${ownerText(ownerOfWay(w))}`
  if (w.type === 'system') {
    const c = checkOf(w.sysKey)
    return c ? `${c.name} · ${c.source}` : '未选判定项'
  }
  if (w.type === 'action') {
    const a = actionOf(w.actionKey)
    return a ? `${a.name} · ${a.source}` : '未选动作'
  }
  return w.party || '未填回执方'
}
function depsLabel (s) {
  const ids = (s.deps || []).flatMap((d) => (Array.isArray(d) ? d : [d]))
  const goals = ids.map((id) => levelMap.value[id]?.goal).filter(Boolean)
  return goals.slice(0, 2).join('、') + (goals.length > 2 ? ` 等 ${goals.length} 项` : '')
}
function toggleGate (s) {
  s.gate = s.gate === 'must' ? 'optional' : 'must'
}
function isDefaultFetch (w) {
  const d = checkOf(w.sysKey)?.defaultFetch || {}
  return (d.freq || '1d') === w.fetch.fetchFreq && (d.maxRuns || 5) === w.fetch.maxRuns
}
function defaultFetchText (w) {
  const d = checkOf(w.sysKey)?.defaultFetch || {}
  return `${FREQ_TEXT[d.freq || '1d'] || d.freq} / 上限 ${d.maxRuns || 5}`
}

/* ---------------- 校验 ---------------- */
const issues = computed(() => {
  if (!result.value) return []
  const draftEv = { key: 'new', scope: result.value.coverage, trigger: result.value.trigger }
  const sk = result.value.skeleton || []
  const out = [...validateEvent(draftEv)]
  if (!sk.length) out.push({ level: 'error', code: 'SKELETON_EMPTY', text: '子事件为空：没定义这单必须办成什么' })
  sk.forEach((x, i) => {
    if (!String(x.goal || '').trim()) out.push({ level: 'error', code: 'SK_GOAL', text: `第 ${i + 1} 条子事件没写要办成什么` })
    if (!(x.paths || []).length) out.push({ level: 'error', code: 'SK_PATH', text: `「${x.goal || `第 ${i + 1} 条`}」没有兑现路径` })
    if ((x.paths || []).some((p) => p.type === 'human') && !(x.paths || []).filter((p) => p.type === 'human').some((p) => (p.items || []).length)) {
      out.push({ level: 'error', code: 'SK_ITEM', text: `「${x.goal || `第 ${i + 1} 条`}」的人给结论没有事项` })
    }
  })
  if (!mustCount.value) out.push({ level: 'warning', code: 'SK_ALL_OPTIONAL', text: '一条必过都没有：这单缺一条也不会终止，确认是有意的' })
  // 用了没声明的事实：触发时永远取不到，那一条会静默消失 —— 必须在发布前拦住
  unknownNeedsOf(sk, result.value).forEach((k) => {
    out.push({ level: 'error', code: 'NEEDS_UNKNOWN', text: `这条子事件用了本事件没有声明的事实「${k}」：在事实里补一条，或改成基础表里的键` })
  })
  // 载荷：写了登记表没有的键（对岸不会发），或漏勾必传（触发时必然拒单）
  unknownPayloadOf(result.value.trigger || {}).forEach((k) => {
    out.push({ level: 'error', code: 'PAYLOAD_UNKNOWN', text: `带入字段「${k}」不在这个事件点的登记里：对岸不会发它，只能用登记过的 key` })
  })
  const plan = payloadPlanOf(result.value.trigger || {})
  if (result.value.trigger?.type === 'business') {
    const picked = new Set(plan.map((f) => f.key))
    const missed = (payloadCands.value || []).filter((f) => f.required && !picked.has(f.key))
    if (missed.length) out.push({ level: 'warning', code: 'PAYLOAD_MISSING', text: `登记为必传的字段没勾：${missed.map((f) => f.label).join('、')} —— 触发时会被拒单` })
    if (!plan.some((f) => f.use === 'intake')) out.push({ level: 'error', code: 'PAYLOAD_NO_EMPNO', text: '没有勾「取数入参」的字段：触发时取不到员工档案，树就没依据' })
  }
  return out
})
const blocked = computed(() => issues.value.some((i) => i.level === 'error'))
const verdictText = computed(() => {
  if (blocked.value) return `${issues.value.filter((i) => i.level === 'error').length} 处挡住发布`
  return issues.value.length ? `可发布 · ${issues.value.length} 条提醒` : '校验通过'
})

/* ---------------- 流程 ---------------- */
function useSample () {
  draft.value = SAMPLE
}
function backToEvents () {
  router.push({ name: 'v2-events' })
}

onMounted(async () => {
  await loadLlmConfig()
  // 评审 / 文档截图用：显式带 ?sample=1 才载入一份样例确认单；
  // 生成失败时绝不走这条路，报错就是报错。
  if (route.query.sample === '1') loadSample()
})

/**
 * 样例确认单：用种子里的离职基线，配一套真实触点与人群。
 * 只用于评审与截图，不参与任何生成失败兜底。
 */
function loadSample () {
  userText.value = SAMPLE
  result.value = {
    name: '离职',
    summary: '员工主动离职：人事审核 → 交接与系统检查并行 → 签署 → 结果推给薪酬 / 社保 / 假勤',
    /* 载荷与真实事件保持一致：样例看见什么，线上就是什么 */
    trigger: normalizeTrigger({
      type: 'business',
      eventPoint: 'resign.apply.submitted',
      entry: '员工自助端 · 我的 · 离职申请',
      payload: clone(resignPrompt.trigger.payload)
    }),
    coverage: normalizeCoverage({ jobs: ['推拿师', '调理师'], cities: [], employTypes: ['全职', '试用'] }),
    skeleton: clone(resignSkeleton),
    facts: clone(RESIGN_FACTS),
    body: resignPrompt.body,
    recap: [
      '必须办成的事写进子事件清单，缺一条即不合格；怎么算完成写进各条的口径',
      '差异不写死：有客户才移交客户、带团队才交接团队，靠这一单的事实判断',
      '资产与客诉走判定项，按条目自带的默认取数频率取结论，流程侧只负责看一眼',
      '签署之后按结果广播给薪酬 / 社保 / 假勤，颗粒度深的下游各自处理'
    ]
  }
}

async function doAsk () {
  const u = draft.value.trim()
  if (!u || busy.value) return
  error.value = ''
  ask.value = null
  result.value = null
  Object.keys(answers).forEach((k) => delete answers[k])
  userText.value = u
  /* 发出即清空：原话进对话流（userText），输入框留给下一句；失败再填回来，不用重打 */
  draft.value = ''
  asking.value = true
  try {
    ask.value = await runAsk({ utterance: u })
    await scrollEnd()
  } catch (e) {
    error.value = e.message || '生成失败'
    draft.value = u
  } finally {
    asking.value = false
  }
}

async function doCompose () {
  if (!ask.value || hardLeft.value || busy.value) return
  error.value = ''
  composing.value = true
  try {
    const list = ask.value.gaps.map((g) => ({
      id: g.id,
      question: g.question,
      answer: answers[g.id] || (g.level === 'soft' ? '（跳过）' : '')
    }))
    result.value = await runCompose({ utterance: userText.value, answers: list })
    await scrollEnd()
  } catch (e) {
    error.value = e.message || '生成失败'
  } finally {
    composing.value = false
  }
}

function doPublish () {
  if (!result.value || blocked.value) return
  const ev = adoptPrompt({
    name: result.value.name,
    summary: result.value.summary,
    skeleton: result.value.skeleton,
    facts: result.value.facts || [],
    body: result.value.body,
    trigger: result.value.trigger,
    coverage: result.value.coverage
  })
  ElMessage.success(`已存「${ev.name}」：${ev.skeleton.length} 条子事件 · 约 ${estimate.value} 人；触发时按这一单生成`)
  router.push({ name: 'v2-prompt', query: { key: ev.key } })
}

async function scrollEnd () {
  await nextTick()
  if (chatEl.value) chatEl.value.scrollTop = chatEl.value.scrollHeight
}
</script>

<style scoped>
.cs { display: flex; flex-direction: column; height: calc(100vh - 88px); padding: 0; box-sizing: border-box; }
.cs-head { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding-bottom: 10px; border-bottom: 1px solid #f0eef7; }
.h-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
.crumb { flex: none; font-size: 11.5px; color: #8b8a9b; }
.crumb:hover { color: #6c5ce7; }
.h-left h1 { margin: 0; font-size: 15px; font-weight: 600; color: #2b2b3a; white-space: nowrap; }
.h-sub { margin: 0; font-size: 11.5px; color: #a8a6b8; line-height: 1.6; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.h-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.ver { font-size: 11px; color: #7b7990; background: #f5f4fa; border-radius: 20px; padding: 2px 9px; }

.cs-body { display: grid; grid-template-columns: minmax(0, 1fr); gap: 18px; flex: 1; min-height: 0; padding: 12px 0 0; }
.pane { display: flex; flex-direction: column; min-height: 0; min-width: 0; width: 100%; max-width: 1000px; margin: 0 auto; }
.chat { flex: 1; min-height: 0; overflow-y: auto; padding: 0 6px 14px 0; display: flex; flex-direction: column; gap: 12px; }

/* ---- 开场 ---- */
.hello { max-width: 760px; padding: 6px 0 10px; display: flex; flex-direction: column; }
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
.sug-txt {
  font-size: 12.5px; color: #4a4959; line-height: 1.6;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.sug-tag { font-size: 10.5px; color: #a8a6b8; order: 2; }
.sug-arrow { font-size: 12px; color: #b3a9e0; flex: none; }
.hello-foot { margin-top: 14px; font-size: 11px; color: #a8a6b8; }

/* ---- 消息 ---- */
.msg { display: flex; gap: 9px; align-items: flex-start; }
.msg.user { justify-content: flex-end; }
.avatar { width: 24px; height: 24px; border-radius: 8px; background: linear-gradient(140deg, #8375ef, #6c5ce7); color: #fff; font-size: 11px; display: flex; align-items: center; justify-content: center; flex: none; box-shadow: 0 1px 4px rgba(108, 92, 231, .25); }
.bubble { max-width: 760px; font-size: 12.5px; line-height: 1.8; }
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
.bubble.agent.wide { flex: 1; min-width: 0; max-width: none; }
.understood { margin: 0 0 11px; padding-bottom: 9px; border-bottom: 1px dashed #f0edf9; color: #4a4959; }

/* ---- 追问 ---- */
.gaps { display: flex; flex-direction: column; gap: 9px; }
.gap { border: 1px solid #f2f0f8; border-radius: 10px; padding: 10px 12px; background: #fbfaff; }
.g-top { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; flex-wrap: wrap; }
.lvl { font-size: 10px; padding: 1px 6px; border-radius: 5px; }
.lvl.hard { color: #b23b3b; background: #fdecec; }
.lvl.soft { color: #8b8a9b; background: #f1f0f6; }
.kind { font-size: 10px; padding: 1px 6px; border-radius: 5px; }
.kind.data { color: #35618f; background: #eef4fb; }
.kind.contract { color: #7a5c1f; background: #fbf3e2; }
.kind.touch { color: #4b3fa8; background: #eeedfe; }
.kind.crowd { color: #0f6e56; background: #e8f5f0; }
.about { font-size: 11px; color: #a3a0a1; }
.g-q { font-size: 12.5px; color: #2b2b3a; line-height: 1.7; }
.g-why { font-size: 11px; color: #9b99ab; margin-top: 3px; line-height: 1.7; }
.g-opts { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.opt {
  border: 1px solid #e6e2f4; background: #fff; color: #55536a;
  font-size: 11.5px; padding: 3px 11px; border-radius: 20px; cursor: pointer;
  line-height: 1.6; font-family: inherit; transition: border-color .15s, background .15s;
}
.opt:hover { border-color: #b3a6ea; }
.opt.on { background: #eeedfe; border-color: #8f7ce0; color: #4b3fa8; }
.opt.skip { color: #a8a6b8; }
.g-foot { display: flex; align-items: center; gap: 10px; margin-top: 11px; padding-top: 10px; border-top: 1px dashed #f0edf9; }
.hint { font-size: 11px; color: #a8a6b8; }
.g-btn, .r-btn {
  display: inline-flex; align-items: center; gap: 6px; border: none; cursor: pointer;
  height: 30px; padding: 0 15px; border-radius: 8px;
  background: linear-gradient(140deg, #7f70ec, #6c5ce7); color: #fff;
  font-size: 12.5px; font-family: inherit;
  box-shadow: 0 2px 8px rgba(108, 92, 231, .20); transition: opacity .15s, transform .15s;
}
.g-btn:hover:not(:disabled), .r-btn:hover:not(:disabled) { transform: translateY(-1px); }
.g-btn:disabled, .r-btn:disabled { background: #eeecf8; color: #b8b4cb; box-shadow: none; cursor: not-allowed; }

/* ---- 确认单 ---- */
.r-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.rh-main { flex: 1; min-width: 0; }
.r-name { font-size: 14px; font-weight: 600; color: #2b2b3a; }
.r-sum { font-size: 11.5px; color: #8b8a9b; margin-top: 3px; line-height: 1.7; }
.rh-side { display: flex; align-items: center; gap: 8px; flex: none; }
.vstat { font-size: 10.5px; border-radius: 20px; padding: 2px 9px; white-space: nowrap; }
.vstat.ok { color: #1f8f66; background: #e9f8f1; }
.vstat.warn { color: #a2700a; background: #fdf5e6; }
.vstat.bad { color: #b23b3b; background: #fdecec; }

.blk { margin-top: 13px; padding-top: 12px; border-top: 1px solid #f5f3fa; }
.blk-h { display: flex; align-items: center; gap: 8px; margin-bottom: 9px; }
.bn { width: 17px; height: 17px; border-radius: 5px; background: #6c5ce7; color: #fff; font-size: 10.5px; font-style: normal; display: flex; align-items: center; justify-content: center; flex: none; }
.blk-h b { font-size: 12.5px; color: #2b2b3a; }
.bh-sub { font-size: 11px; color: #a8a6b8; }
.hcnt { margin-left: auto; font-size: 10.5px; font-style: normal; color: #4b3fa8; background: #eeedfe; border-radius: 20px; padding: 1px 9px; }

.seg { display: inline-flex; gap: 2px; padding: 2px; background: #f4f2fb; border-radius: 8px; }
.seg button { border: none; background: transparent; font-size: 11.5px; color: #6b6880; padding: 3px 12px; border-radius: 6px; cursor: pointer; font-family: inherit; }
.seg button.on { background: #fff; color: #4b3fa8; box-shadow: 0 1px 3px rgba(76, 63, 168, .12); }
.tp-hint { font-size: 11px; color: #a8a6b8; margin: 7px 0 9px; }

.grid2 { display: grid; grid-template-columns: 72px minmax(0, 1fr); gap: 7px 10px; align-items: center; }
.grid2 > label { font-size: 11.5px; color: #a3a0a1; }

.pl { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; margin-top: 9px; padding: 7px 9px; background: #fbfaff; border: 1px solid #f2f0f8; border-radius: 9px; }
.pl-k { font-size: 10.5px; color: #9b99ab; }
.pl-i { font-size: 11px; color: #4b3fa8; background: #fff; border: 1px solid #eae6f8; border-radius: 6px; padding: 1px 7px; cursor: pointer; }
.pl-i.on { color: #fff; background: #6b5bd2; border-color: #6b5bd2; }
.pl-i.lock { cursor: default; }
.pl-i em { font-style: normal; color: #a8a6b8; margin-left: 4px; }
.pl-i.on em { color: #ded9f2; }
.pu { display: flex; flex-wrap: wrap; gap: 4px 10px; margin-top: 7px; }
.pu-i { display: flex; align-items: center; gap: 4px; }
.pu-k { font-size: 10.5px; color: #9b99ab; }
.pu-sel { width: 102px; }

.cov-row { display: grid; grid-template-columns: 46px minmax(0, 1fr); gap: 8px; align-items: center; margin-bottom: 7px; }
.cv-k { font-size: 11.5px; color: #a3a0a1; }
.cov-note { font-size: 11px; color: #a8a6b8; line-height: 1.75; margin-top: 5px; }

.sk-facts { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; margin-top: 8px; }
.sk-facts .sf-k { font-size: 10.5px; color: #b0aebe; }
.sk-facts .sf-i { font-size: 10px; padding: 1px 7px; border-radius: 8px; background: #fbeef3; color: #a40035; }
.sk-facts .sf-i em { font-style: normal; opacity: .6; margin-left: 4px; }

.sks { display: flex; flex-direction: column; gap: 6px; }
.sk { border: 1px solid #f0eef7; border-radius: 9px; padding: 7px 10px 6px; }
.sk-top { display: flex; align-items: center; gap: 7px; }
.sk-goal { flex: 1; min-width: 0; font-size: 12.5px; color: #2b2b3a; font-weight: 500; }
.sk-meta { display: flex; align-items: center; gap: 8px; margin-top: 3px; padding-left: 25px; }
.sk-need { font-size: 10.5px; color: #4b3fa8; background: #eeedfe; border-radius: 5px; padding: 0 6px; }
.sk-path { font-size: 10.5px; color: #8b8a9b; }
.sk-after { margin-left: auto; font-size: 10.5px; color: #b0aebe; }
.sk-form { margin-top: 3px; padding-left: 25px; font-size: 10.5px; color: #8b8a9b; line-height: 1.6; }
.sk-form em { font-style: normal; color: #b0aebe; margin-left: 4px; }

.subs { display: flex; flex-direction: column; gap: 8px; }
.sub { border: 1px solid #f2f0f8; border-radius: 10px; padding: 9px 11px; background: #fcfbff; }
.sr-top { display: flex; align-items: center; gap: 8px; }
.idx { width: 18px; height: 18px; border-radius: 50%; background: #eeedfe; color: #6c5ce7; font-size: 10.5px; display: flex; align-items: center; justify-content: center; flex: none; }
.sr-goal { flex: 1; font-size: 12.5px; color: #2b2b3a; line-height: 1.6; }
.gate { border: none; cursor: pointer; font-size: 10px; border-radius: 5px; padding: 1px 7px; flex: none; font-family: inherit; }
.gate.must { color: #b23b3b; background: #fdecec; }
.gate.optional { color: #35618f; background: #eef4fb; }
.sr-dep { font-size: 10.5px; color: #a8a6b8; margin: 3px 0 0 26px; }

.way { margin-top: 7px; padding: 7px 10px; background: #fff; border: 1px solid #f2f0f8; border-left-width: 2px; border-radius: 8px; }
.way.human, .way.review { border-left-color: #6c5ce7; }
.way.system { border-left-color: #1f8f66; }
.way.action { border-left-color: #35618f; }
.way.external { border-left-color: #c99a2e; }
.w-head { display: flex; align-items: center; gap: 7px; margin-bottom: 5px; flex-wrap: wrap; }
.wtag { font-size: 10px; border-radius: 5px; padding: 1px 6px; color: #4b3fa8; background: #eeedfe; flex: none; }
.way.system .wtag { color: #0f6e56; background: #e8f5f0; }
.way.action .wtag { color: #35618f; background: #eef4fb; }
.way.external .wtag { color: #9a6b00; background: #fdf6e7; }
.w-who { font-size: 11.5px; color: #4a4959; }
.w-line { font-size: 11px; color: #7a7890; line-height: 1.7; }
.w-line.muted { color: #a8a6b8; }

.item { padding: 5px 0 6px; border-top: 1px dashed #f2f0f8; }
.item:first-of-type { border-top: none; padding-top: 2px; }
.i-top { display: flex; align-items: baseline; gap: 8px; }
.i-t { font-size: 11.5px; color: #3c3b4d; flex: none; }
.i-r { font-size: 11px; color: #9b99ab; line-height: 1.6; }
.ctrls { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 4px; }
.ctrl { font-size: 10.5px; color: #55536a; background: #f6f5fa; border-radius: 6px; padding: 1px 7px; }
.ctrl.req { color: #4b3fa8; background: #f0ecff; }
.ctrl em { font-style: normal; color: #9b99ab; margin-left: 4px; }
.ctrl.req em { color: #7c72c9; }
.ctrl.none { color: #b0aebe; background: #faf9fc; }
.reqm { font-style: normal; color: #b23b3b; margin-right: 2px; }

.lv-line { display: flex; flex-wrap: wrap; gap: 5px; }
.lv-chip { font-size: 10.5px; color: #4a4959; background: #f6f5fa; border-radius: 6px; padding: 1px 7px; }
.lv-chip i { font-style: normal; color: #a8a6b8; margin-left: 4px; }

.freq { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin: 2px 0 5px; }
.f-k { font-size: 11px; color: #a3a0a1; }
.f-k.muted { color: #a8a6b8; }
.f-def { font-size: 10.5px; color: #0f6e56; background: #e8f5f0; border-radius: 6px; padding: 1px 7px; }
.f-chg { font-size: 10.5px; color: #a2700a; background: #fdf6e7; border-radius: 6px; padding: 1px 7px; }

.issue-box { margin-top: 13px; border-radius: 9px; padding: 9px 11px; background: #fdf7f7; border: 1px solid #f6e2e2; }
.ib-t { font-size: 11px; color: #b23b3b; margin-bottom: 5px; }
.ib-i { font-size: 11.5px; color: #4a4959; line-height: 1.75; }
.ib-i.warning { color: #7a6a45; }
.ib-lv { font-size: 10px; margin-right: 6px; color: #b23b3b; }
.ib-i.warning .ib-lv { color: #a2700a; }

.recap { margin-top: 12px; padding: 9px 11px; background: #fbfaff; border: 1px solid #f2f0f8; border-radius: 9px; }
.rc-t { font-size: 10.5px; color: #9b99ab; margin-bottom: 4px; }
.rc-i { font-size: 11.5px; color: #55536a; line-height: 1.8; }

.err { font-size: 12px; color: #b23b3b; background: #fdecea; border-radius: 8px; padding: 9px 12px; }

/* ---- 写作样板入口：开口之前就在手边 ---- */
.tpl-bar { display: flex; align-items: center; gap: 8px; width: 100%; margin-bottom: 7px; padding: 6px 10px; border: 1px solid #ece9f6; border-radius: 9px; background: #fbfaff; cursor: pointer; text-align: left; }
.tpl-bar:hover { border-color: #d9d2ee; background: #f8f6ff; }
.tb-k { flex: none; font-size: 10px; color: #5a4f9e; background: #efecfd; border-radius: 5px; padding: 1px 6px; }
.tb-v { flex: 1; min-width: 0; font-size: 11px; color: #77738a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tb-a { flex: none; font-size: 11px; color: #a40035; }
.inline-link { border: 0; background: transparent; padding: 0; color: #a40035; font-size: 11px; cursor: pointer; }

/* ---- 样板浮层 ---- */
.src-layer { position: fixed; inset: 0; z-index: 3000; display: flex; align-items: center; justify-content: center; padding: 40px; background: rgba(28, 24, 38, .34); }
.src-panel { display: flex; flex-direction: column; width: min(800px, 92vw); max-height: 84vh; background: #fff; border-radius: 14px; box-shadow: 0 18px 50px rgba(0, 0, 0, .18); overflow: hidden; }
.sp-head { flex: none; display: flex; align-items: center; gap: 12px; padding: 12px 18px; border-bottom: 1px solid #f2f0f5; }
.sp-title { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.sp-title b { font-size: 14px; color: #2c2a33; }
.sp-title span { font-size: 11px; color: #a3a0a1; line-height: 1.5; }
.sp-act { flex: none; display: flex; gap: 8px; align-items: center; }
.sp-act button { border: 1px solid #e6e2ec; background: #fff; color: #6b6570; font-size: 11.5px; border-radius: 7px; padding: 3px 10px; cursor: pointer; }
.sp-act button:hover { color: #a40035; border-color: #e0d5dc; }
.sp-act .sp-primary { border-color: #a40035; background: #a40035; color: #fff; }
.sp-act .sp-primary:hover { border-color: #8d0030; background: #8d0030; color: #fff; }
.sp-x { color: #8a8489; }
.sp-body { flex: 1; min-height: 0; overflow: auto; padding: 14px 18px; }
.src-pre { margin: 0; background: #fbfaff; border: 1px solid #f0eef4; border-radius: 9px; padding: 13px 15px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.5px; line-height: 1.85; color: #3c3a47; white-space: pre-wrap; word-break: break-word; }
.sp-foot { flex: none; padding: 10px 18px; border-top: 1px solid #f2f0f5; background: #fbfafd; font-size: 10.5px; color: #a3a0a1; line-height: 1.7; }

/* ---- 输入板 ---- */
.composer { flex: none; padding: 8px 0 12px; }
.box {
  border: 1px solid #e6e2f4; border-radius: 13px; background: #fff;
  padding: 8px 10px 8px; transition: border-color .15s, box-shadow .15s;
  box-shadow: 0 1px 2px rgba(90, 80, 160, .04);
}
.box:focus-within { border-color: #b3a6ea; box-shadow: 0 0 0 3px rgba(124, 108, 240, .10); }
.box textarea {
  display: block; width: 100%; height: 58px; resize: none;
  border: none; outline: none; background: transparent;
  padding: 2px 3px; font-size: 12.5px; line-height: 1.7; color: #3c3b4d; font-family: inherit;
  box-sizing: border-box;
}
.box textarea::placeholder { color: #b9b7c6; }
/* 插进来的样板是一整段文字：给到能读的高度，再长就自己滚 */
.box textarea.long { height: 148px; overflow-y: auto; }
.box-bar { display: flex; align-items: center; gap: 6px; padding: 4px 3px 0; }
.kbd { font-family: inherit; font-size: 10px; color: #a8a6b8; background: #f6f4fc; border: 1px solid #ece8f8; border-bottom-width: 2px; border-radius: 5px; padding: 0 5px; line-height: 15px; }
.bar-hint { flex: 1; min-width: 0; font-size: 11px; color: #b3b1c1; margin-left: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* ---- 模型：名字挨着输入框，点开能换 ---- */
.mdl { position: relative; flex: none; margin-left: auto; display: flex; }
.mdl-chip {
  display: inline-flex; align-items: center; gap: 5px; height: 24px; padding: 0 8px;
  border: 1px solid #ece9f6; border-radius: 7px; background: #fbfaff;
  color: #6b6570; font-size: 11px; font-family: inherit; cursor: pointer;
}
.mdl-chip:hover { border-color: #d9d2ee; color: #4b3fa8; }
.mdl-chip.warn { color: #a2700a; background: #fdf6e7; border-color: #f3e5c7; }
.mdl-dot { width: 5px; height: 5px; border-radius: 50%; background: #22a06b; }
.mdl-chip.warn .mdl-dot { background: #d9a531; }
.mdl-chip i { font-style: normal; font-size: 9px; color: #b3b1c1; }

.mdl-pop {
  position: absolute; right: 0; bottom: calc(100% + 8px); z-index: 30;
  width: 276px; display: flex; flex-direction: column;
  background: #fff; border: 1px solid #eceaf1; border-radius: 12px;
  box-shadow: 0 12px 32px rgba(28, 24, 38, .14); overflow: hidden;
}
.mp-head { flex: none; display: flex; align-items: center; gap: 8px; padding: 9px 12px; border-bottom: 1px solid #f4f2f8; background: #fbfafd; }
.mp-p { font-size: 11.5px; color: #3c3a47; font-weight: 600; }
.mp-refresh { margin-left: auto; border: 0; background: transparent; color: #a40035; font-size: 10.5px; cursor: pointer; }
.mp-refresh:disabled { color: #b9b7c6; cursor: default; }
.mp-list { flex: 1; min-height: 0; max-height: 208px; overflow-y: auto; padding: 4px 4px 8px; }
.mp-i { display: flex; align-items: center; width: 100%; padding: 5px 8px; border: 0; border-radius: 7px; background: transparent; cursor: pointer; text-align: left; }
.mp-i:hover { background: #faf9fd; }
.mp-i.on { background: #fbf6f8; }
.mp-n { flex: 1; min-width: 0; font-size: 11.5px; color: #3c3a47; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mp-i.on .mp-n { color: #a40035; font-weight: 600; }
.mp-ok { flex: none; font-size: 9.5px; color: #a40035; background: #fbeef3; border-radius: 4px; padding: 0 5px; line-height: 15px; }
.mp-empty { margin: 8px 6px; font-size: 11px; color: #b0aebe; line-height: 1.7; }
.mp-foot { flex: none; display: flex; align-items: center; gap: 8px; padding: 9px 12px; border-top: 1px solid #f4f2f8; background: #fbfafd; }
.mp-warn { font-size: 10.5px; color: #b06a1c; }
.mp-go { margin-left: auto; border: 0; background: transparent; color: #a40035; font-size: 10.5px; cursor: pointer; }
.send {
  margin-left: 8px; display: inline-flex; align-items: center; gap: 6px;
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
.spin.dark { border-color: rgba(255, 255, 255, .45); border-top-color: #fff; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 1120px) {
  .h-sub { display: none; }
}
</style>
