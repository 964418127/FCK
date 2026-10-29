<!--
  提示词工作台（原「事件编排」）

  界面按「定义 / 功能」分区：
    左 = 定义区（全部定义）：这套提示词管谁 → 提示词 → 子事件 → 怎么触发
    右 = 功能区（试跑，默认收起）：从覆盖人群里搜一个人，看这套提示词到他身上长出什么

  为什么预览是「搜一个人」而不是写死三个人：
    树本来就是触发时按这一单的人与事实生成的，那预览就该从「谁会被命中」里挑人，
    挑谁、看到的就是谁那一单 —— 这也顺带证明左侧的条件确实在筛人。
-->
<template>
  <div v-if="!ev" class="pt-empty">这套提示词不存在，回事件管理看看。</div>

  <div v-else class="pt">
    <header class="pt-head">
      <button class="back" @click="router.push('/v2/events')">
        <el-icon><ArrowLeft /></el-icon>事件管理
      </button>
      <div class="name-cell">
        <el-input v-model="draft.name" class="name-input" maxlength="12" placeholder="事件名称" />
        <span class="sub">提示词与子事件</span>
      </div>
      <span class="chip">v{{ ev.currentVersion }}</span>
      <span :class="['chip', ev.status === 'active' ? 'ok' : 'off']">{{ ev.status === 'active' ? '生效中' : '已停用' }}</span>

      <div class="h-right">
        <span class="dirty" v-if="dirty">有未保存改动</span>
        <el-button size="small" @click="tplOpen = true">看生成原文</el-button>
        <el-button size="small" :class="{ 'try-on': tryOpen }" @click="tryOpen = !tryOpen">{{ tryOpen ? '收起试跑' : '试跑' }}</el-button>
        <el-button size="small" @click="restore">还原</el-button>
        <el-button size="small" type="primary" :disabled="!dirty" @click="save">保存并记版本</el-button>
      </div>
    </header>

    <div :class="['pt-main', { 'no-try': !tryOpen }]">
      <!-- 左：定义区。一条竖着读下来，内容多就滚，不切视图 -->
      <div class="pt-def">
        <section class="card">
          <div class="c-head">
            <i class="bn">1</i><b>这套提示词管谁</b>
            <span class="c-sub">匹配条件，不是名单 · 空维度表示不限</span>
            <em class="hcnt">≈ {{ estimate }} 人（按当前组织估）</em>
          </div>
          <div class="scope-grid">
            <label>岗位</label>
            <el-select v-model="draft.scope.jobs" multiple size="small" collapse-tags collapse-tags-tooltip>
              <el-option v-for="j in jobs" :key="j.key" :label="j.key" :value="j.key" />
            </el-select>
            <label>城市</label>
            <el-select v-model="draft.scope.cities" multiple size="small" collapse-tags placeholder="不限">
              <el-option v-for="c in cities" :key="c.key" :label="c.key" :value="c.key" />
            </el-select>
            <label>门店</label>
            <el-select v-model="draft.scope.stores" multiple size="small" collapse-tags placeholder="不限">
              <el-option v-for="s in stores" :key="s" :label="s" :value="s" />
            </el-select>
            <label>用工类型</label>
            <el-select v-model="draft.scope.employTypes" multiple size="small" collapse-tags placeholder="不限">
              <el-option v-for="t in employTypes" :key="t.key" :label="t.key" :value="t.key" />
            </el-select>
          </div>
          <div class="c-note">
            条件按员工档案判：谁真的被卷进来，是这一单触发时才算出来的。人数只是按编制与占比估的量级，不是名单。
          </div>
        </section>

        <section class="card">
          <div class="c-head">
            <i class="bn">2</i><b>提示词</b>
            <span class="c-sub">生成时喂给模型的这套口径 · 不是文案，是判据</span>
            <em class="hcnt">{{ draft.body.length }} 字</em>
          </div>
          <div class="body-wrap">
            <el-input
              v-model="draft.body"
              type="textarea"
              :autosize="{ minRows: 14 }"
              resize="none"
              class="body-editor"
              placeholder="分五段写：这件事是什么 / 必须交付的结论 / 差异怎么判断 / 表单怎么给 / 不要做什么"
            />
          </div>
        </section>

        <section class="card">
          <div class="c-head">
            <i class="bn">3</i><b>子事件</b>
            <span class="c-sub">这一单要办的事 · 触发时按事实长成树，能长出来的都在这里</span>
            <em class="hcnt">{{ draft.skeleton.length }} 条 · 必过 {{ mustCount }} · 可选 {{ draft.skeleton.length - mustCount }}</em>
          </div>
          <div class="gen-strip">
            <span class="gs-k">首次生成</span>
            <span class="gs-v">{{ gen0.items.length }} 条 · {{ gen0.at }} 由 {{ gen0.by }} 产出</span>
            <span class="gs-d">
              现 {{ draft.skeleton.length }} 条
              <em v-if="gen0.added">后加 {{ gen0.added }}</em>
              <em v-if="gen0.edited">改过 {{ gen0.edited }}</em>
            </span>
            <button class="gs-toggle" @click="showFirst = !showFirst">{{ showFirst ? '收起' : '看首次生成' }}</button>
          </div>
          <div v-if="showFirst" class="gen-list">
            <div v-for="g in gen0.items" :key="g.key" class="gl-row">
              <span class="gl-g">{{ g.goal }}</span>
              <span :class="['gl-t', g.gate === 'optional' ? 'opt' : 'must']">{{ g.gate === 'optional' ? '可选' : '必过' }}</span>
              <span class="gl-p">{{ g.path }}</span>
              <span v-if="(g.proofs || []).length" class="gl-f">附件 {{ g.proofs.join('、') }}</span>
            </div>
            <div class="gl-note">这是起草那一次由提示词产出的清单，之后人改的、加的都不在这一份里。</div>
          </div>
          <div class="sk-head">
            <span></span>
            <span>要办成什么样（能判定）</span>
            <span>什么时候要</span>
            <span>是否必过</span>
            <span>谁给结论</span>
            <span></span>
          </div>
          <div class="sk-list">
            <div v-for="(item, i) in draft.skeleton" :key="item.key" class="sk-row">
              <div class="sk-main">
                <span class="sk-no">{{ i + 1 }}</span>
                <div class="sk-goal-cell">
                  <el-input v-model="item.goal" size="small" class="sk-goal" :style="{ width: goalWidth(item.goal) }" placeholder="一句可判定的结论" />
                  <span :class="['sk-flag', genState(item)]" :title="flagHint(item)">{{ flagText(item) }}</span>
                </div>
                <el-select v-model="item.needs" size="small" class="sk-needs">
                  <el-option v-for="n in factOptions" :key="n.key" :label="n.label" :value="n.key" />
                </el-select>
                <el-select v-model="item.gate" size="small" class="sk-gate">
                  <el-option label="必过" value="must" />
                  <el-option label="可选" value="optional" />
                </el-select>
                <span class="sk-path">{{ pathSummary(item) }}</span>
                <el-icon class="sk-del" @click="removeSkeleton(i)"><Delete /></el-icon>
              </div>
              <div
                v-if="(item.after || []).length" class="sk-after"
                :title="item.after.map(afterLabel).join('、')"
              >需等：{{ item.after.map(afterLabel).join('、') }}</div>
              <div v-if="mustProofsOf(item).length" class="sk-proof">
                附件必传：{{ mustProofsOf(item).map(proofTextOf).join('、') }}
              </div>
              <div v-if="optProofsOf(item).length" class="sk-proof opt">
                附件选填：{{ optProofsOf(item).map(proofTextOf).join('、') }}
              </div>
            </div>
            <button class="sk-add" @click="addSkeleton"><el-icon><Plus /></el-icon>加一条子事件</button>
          </div>
          <div class="c-note sk-note">
            这里只写必须办成什么；谁办、哪个先哪个后，是触发时按这一单的人和事实排的。
            <button class="inline-link" @click="tryOpen = true">挑个人试跑一下 ↗</button>
          </div>
          <div class="sk-facts">
            <span class="sf-k">可用事实</span>
            <span class="sf-base">基础 8 项</span>
            <span v-for="n in extraFacts" :key="n.key" class="sf-ex">{{ n.label }}</span>
            <span v-if="!extraFacts.length" class="sf-none">本事件没有额外事实</span>
          </div>
        </section>

        <section class="card">
          <div class="c-head">
            <i class="bn">4</i><b>这件事怎么触发</b>
            <span class="c-sub">触点与带入字段</span>
          </div>
          <div class="trig">
            <div class="trig-row"><span class="k">入口</span><span class="v">{{ draft.trigger.entry || '未填' }}</span></div>
            <div class="trig-row"><span class="k">业务事件点</span><span class="v">{{ pointLabel }}<em v-if="pointSource"> · {{ pointSource }}</em></span></div>
            <div class="trig-row top">
              <span class="k">带入字段</span>
              <div class="v pay">
                <span
                  v-for="f in payloadCands" :key="f.key"
                  :class="['pay-i', { on: isPicked(f.key), lock: f.role === 'empNo' }]"
                  :title="f.role === 'empNo' ? '取数入参：引擎拿它查员工档案，不能取消' : `${f.type || 'text'}${f.required ? ' · 必传' : ''}`"
                  @click="f.role === 'empNo' ? null : togglePayload(f)"
                >{{ f.label }}<em v-if="f.role === 'empNo'">必用</em></span>
                <span v-if="!payloadCands.length" class="none">这件事不是业务触发的，没有载荷</span>
              </div>
            </div>
            <div v-if="payloadPicked.length" class="pay-uses">
              <div v-for="f in payloadPicked" :key="f.key" class="pu-i">
                <span class="pu-k">{{ f.label }}</span>
                <el-select :model-value="f.use" size="small" class="pu-sel" @change="(v) => setUse(f.key, v)">
                  <el-option v-for="u in PAYLOAD_USE" :key="u.key" :label="u.label" :value="u.key" />
                </el-select>
              </div>
            </div>
            <div class="trig-note">
              类型、必传、可选值由事件点登记决定（业务系统注册），这里只选「用哪些、各自走到哪」。
              触发时按这一单的人取事实，事实决定长哪几条 —— 载荷只填某一格，不改变树形。
            </div>
          </div>
        </section>
      </div>

      <!-- 右：功能区。从覆盖人群里搜一个人来试跑，不是写死三个样本人。默认收起，想看得像才开 -->
      <aside v-if="tryOpen" class="pt-try">
        <div class="try-head">
          <b>试跑</b>
          <span class="c-sub">从覆盖人群里挑一个人 · 按左边定义生成</span>
          <button class="try-x" title="收起" @click="tryOpen = false">收起</button>
        </div>

        <div v-if="!picked" class="try-body">
          <el-input
            v-model="q" size="small" class="try-sch"
            placeholder="姓名 / 工号 / 门店" :prefix-icon="Search" clearable
          />
          <div class="try-cnt">样本员工里命中 {{ pool.length }} 人 · 左边条件一改，这里跟着变</div>

          <div class="try-list">
            <button v-for="p in filtered" :key="p.id" class="tp" @click="pickedId = p.id">
              <span class="tp-n">{{ p.name }}</span>
              <span class="tp-m">{{ p.job }} · {{ p.store }}</span>
              <span class="tp-t">{{ p.employType }}</span>
            </button>
            <p v-if="!filtered.length" class="try-empty">没有命中的人。改左边的条件，或换个词搜。</p>
          </div>

          <p class="try-tip">同一套提示词，换个人就换一棵树 —— 差异只来自这一单的事实。</p>
        </div>

        <template v-else>
          <div class="try-who">
            <div class="tw-l">
              <b>{{ picked.name }}</b>
              <span>{{ picked.job }} · {{ picked.store }} · {{ picked.employType }}</span>
            </div>
            <button class="tw-swap" @click="pickedId = ''">换人</button>
          </div>

          <div class="try-sum">
            走 <b>{{ curPv.tree.length }}</b> 步 · 必过 <b>{{ mustOf(curPv) }}</b> · 按事实不长 <b>{{ curPv.dropped.length }}</b> 条
          </div>

          <div class="try-tree">
            <div v-for="g in groups" :key="g.level" class="tt-g">
              <div class="tt-l">第 {{ g.level + 1 }} 步<i v-if="g.rows.length > 1">可同时办</i></div>
              <div
                v-for="row in g.rows" :key="row.id"
                :class="['tt-r', { on: row.id === selId }]"
                @click="selId = selId === row.id ? '' : row.id"
              >
                <div class="tt-t">
                  <span class="tt-goal">{{ row.goal }}</span>
                  <span :class="['tt-gate', row.gate]">{{ row.gate === 'optional' ? '可选' : '必过' }}</span>
                </div>
                <div v-if="row.id !== selId" class="tt-who">{{ row.ways[0] ? row.ways[0].who : '无路径' }}</div>
                <PreviewDetail v-if="row.id === selId" :row="row" headless />
              </div>
            </div>
          </div>

          <div class="try-foot">
            <span class="tf-k">这一单的事实</span>
            客户 {{ picked.facts.clients }} · 事项 {{ picked.facts.tasks }} · 团队 {{ picked.facts.team }} ·
            资产 {{ (picked.facts.assets || []).length }} · 现金 {{ picked.facts.cash }} · 欠款 {{ picked.facts.debt }}
            <span v-if="curPv.dropped.length" class="tf-drop">
              没长出来：{{ curPv.dropped.map((d) => shortGoal(d.key)).join('、') }}
            </span>
            <span v-if="!curPv.check.ok" class="tf-bad">生成不合格：{{ curPv.check.errors[0].text }}</span>
          </div>
        </template>
      </aside>
    </div>

    <!-- 生成原文：只在「想确认到底发给模型什么」时看，不占定义区一栏 -->
    <div v-if="tplOpen" class="src-layer" @click.self="tplOpen = false">
      <div class="src-panel">
        <header class="sp-head">
          <div class="sp-title">
            <b>生成原文</b>
            <span>触发时整段发给模型 · 口径 + 结构约束 + 子事件</span>
          </div>
          <div class="sp-act">
            <em>{{ tplLines }} 行</em>
            <button @click="copyTpl">{{ copied ? '已复制' : '复制全文' }}</button>
            <button class="sp-x" @click="tplOpen = false">关闭</button>
          </div>
        </header>
        <div class="sp-body"><pre class="tpl">{{ tpl }}</pre></div>
        <footer class="sp-foot">
          这段不是另写的文档：口径改一句、清单加一条，它跟着变 —— 页面上的和发给模型的是同一个产物。
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Delete, Plus, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getEvent, savePrompt, checks } from '../../v2/store.js'
import { previewPeople, eventPointLabel, eventPointOf, actionName } from '../../v2/seed.js'
import { staff, factsOfPerson } from '../../v2/base.js'
import { composeFor } from '../../v2/blueprint.js'
import { needsOf, pathSummary } from '../../v2/skeleton.js'
import {
  jobs, cities, stores, employTypes, layersOf, topoSort, ownerOfWay, ownerLabel,
  resolveOwner, fieldTypeLabel, headcountOf, scopeHit, receiptTextOf
} from '../../v2/model.js'
import { PAYLOAD_USE, payloadCandidatesOf, payloadPlanOf } from '../../v2/payload.js'
import { validateSkeleton } from '../../v2/validate.js'
import { renderTemplate, proofFieldsOf } from '../../v2/template.js'
import PreviewDetail from '../../components/v2/PreviewDetail.vue'

const route = useRoute()
const router = useRouter()
const key = computed(() => route.query.key || 'resign')
const ev = computed(() => getEvent(key.value))

const blank = () => ({ name: '', body: '', skeleton: [], facts: [], scope: { jobs: [], cities: [], stores: [], employTypes: [] }, trigger: {} })
const draft = ref(blank())
const snap = ref(blank())

const pick = (v) => ({
  name: v.name || '',
  body: v.body || '',
  skeleton: JSON.parse(JSON.stringify(v.skeleton || [])),
  facts: JSON.parse(JSON.stringify(v.facts || [])),
  scope: JSON.parse(JSON.stringify(v.scope || {})),
  trigger: JSON.parse(JSON.stringify(v.trigger || {}))
})

watch(ev, (v) => {
  if (!v) return
  draft.value = pick(v)
  snap.value = JSON.parse(JSON.stringify(draft.value))
}, { immediate: true })

const normalize = (x) => JSON.stringify({
  name: x.name, body: x.body, skeleton: x.skeleton, facts: x.facts, scope: x.scope, trigger: x.trigger
})
const dirty = computed(() => normalize(draft.value) !== normalize(snap.value))
const mustCount = computed(() => draft.value.skeleton.filter((s) => s.gate !== 'optional').length)
/** 覆盖人数只是估算：条件按当前组织算一遍，触发时还要按这一单的人再判 */
const estimate = computed(() => headcountOf(draft.value.scope || {}))
/* ---------------- 生成原文：骨架 → 生成时整段喂给模型的那段 ----------------
 * 不做第二个编辑面：口径在上一张卡里改，模板跟着变；这里是只读 + 可复制。
 * 与 buildGenerateMessages 用的是同一个渲染函数 —— 所见即所发。
 */
const copied = ref(false)
const tplOpen = ref(false)
/** 试跑是可选项：进页面先看定义，想看长什么样再开右栏 */
const tryOpen = ref(false)
const tpl = computed(() => renderTemplate({ ...draft.value }))
const tplLines = computed(() => tpl.value.split('\n').length)
async function copyTpl () {
  try {
    await navigator.clipboard.writeText(tpl.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 1600)
  } catch (e) {
    ElMessage.warning('浏览器不允许直接复制，手动选中复制')
  }
}

/* ---------------- 首次生成：起草那一次由提示词产出的清单 ----------------
 * 没有快照（旧数据 / 新建）时按当前清单算，标记全是「首次」—— 不假装有差异。
 */
const showFirst = ref(false)
const gen0 = computed(() => {
  const g = ev.value?.firstGen
  const items = g?.items?.length
    ? g.items
    : (ev.value?.skeleton || []).map((s) => ({ key: s.key, goal: s.goal, gate: s.gate, path: pathSummary(s), proofs: [] }))
  const map = new Map(items.map((x) => [x.key, x]))
  const added = draft.value.skeleton.filter((s) => !map.has(s.key)).length
  const edited = draft.value.skeleton.filter((s) => map.has(s.key) && map.get(s.key).goal !== s.goal).length
  return { at: g?.at || '起草时', by: g?.by || '提示词', items, added, edited }
})
const FLAG_TEXT = { first: '首次', added: '后加', edited: '改过' }
const FLAG_HINT = {
  first: '首次由提示词生成，没改过',
  added: '首次生成之后补的',
  edited: '首次生成有这一条，口径被人改过'
}
function genState (item) {
  const g = gen0.value.items.find((x) => x.key === item.key)
  if (!g) return 'added'
  return g.goal === item.goal ? 'first' : 'edited'
}
const flagText = (item) => FLAG_TEXT[genState(item)]
const flagHint = (item) => FLAG_HINT[genState(item)]
/** 输入框跟着文字走：标签才贴得住结论，不会孤零零飘到列中间 */
const goalWidth = (t) => `${Math.min(560, Math.max(190, (t || '').length * 12.6 + 28))}px`
const proofsOf = (item) => proofFieldsOf(item)
/** 必传 / 选填分开列：混在一起写「附件必传」，等于把选填说成必传 */
const mustProofsOf = (item) => proofsOf(item).filter((f) => f.required)
const optProofsOf = (item) => proofsOf(item).filter((f) => !f.required)
const proofTextOf = (f) => f.label + (f.formats ? `（${f.formats}）` : '')

/** 本事件可用的事实：基础表 + 这套提示词自己声明的扩展 */
const factOptions = computed(() => needsOf(draft.value))
const extraFacts = computed(() => draft.value.facts || [])
const pointLabel = computed(() => eventPointLabel(draft.value.trigger?.eventPoint) || '未选')
const pointSource = computed(() => (eventPointOf(draft.value.trigger?.eventPoint) || {}).source || '')

/* 载荷：候选来自事件点登记（只读），用哪些与用途由这套事件决定 */
const payloadCands = computed(() => payloadCandidatesOf(draft.value.trigger?.eventPoint || ''))
const payloadPicked = computed(() => payloadPlanOf(draft.value.trigger || {}))
const isPicked = (k) => (draft.value.trigger?.payload || []).some((p) => p.field === k)
function togglePayload (f) {
  const t = draft.value.trigger
  if (!t) return
  const list = t.payload || []
  t.payload = list.some((p) => p.field === f.key)
    ? list.filter((p) => p.field !== f.key)
    : [...list, { field: f.key, use: f.use }]
}
function setUse (k, use) {
  const t = draft.value.trigger
  if (!t) return
  t.payload = (t.payload || []).map((p) => (p.field === k ? { ...p, use } : p))
}

function save () {
  /* 发布前先按骨架校验：结论是不是可判定、等回执的必过项有没有字段。
     这些错在触发时才暴露，等于让一单跑到一半卡住 —— 定义期就该拦。 */
  const issues = validateSkeleton(draft.value)
  const errs = issues.filter((x) => x.level === 'error')
  if (errs.length) {
    ElMessage.warning(`还有 ${errs.length} 处不合规：${errs[0].text}${errs.length > 1 ? '（见清单里的红字）' : ''}`)
    return
  }
  const r = savePrompt(key.value, {
    name: draft.value.name,
    body: draft.value.body,
    skeleton: draft.value.skeleton,
    facts: draft.value.facts,
    scope: draft.value.scope,
    trigger: draft.value.trigger
  })
  snap.value = JSON.parse(JSON.stringify(draft.value))
  const warns = issues.filter((x) => x.level === 'warning').length
  ElMessage.success((r?.changed === false ? '已保存（只改了名称，不记新版本）' : '已保存，记了新版本；只影响之后触发的单') + (warns ? ` · 另有 ${warns} 处提醒` : ''))
}
function restore () {
  const v = ev.value
  if (!v) return
  draft.value = pick(v)
}
function addSkeleton () {
  draft.value.skeleton.push({
    key: `sk.${Date.now().toString(36)}`,
    goal: '',
    needs: 'always',
    gate: 'must',
    after: [],
    afterAny: [],
    paths: [{ type: 'human', role: 'hr', items: [{ id: `it.${Date.now().toString(36)}`, title: '待补事项', require: '做到什么算完成', fields: [] }] }],
    note: ''
  })
}
function removeSkeleton (i) {
  const k = draft.value.skeleton[i].key
  draft.value.skeleton.splice(i, 1)
  draft.value.skeleton.forEach((s) => {
    s.after = (s.after || []).filter((x) => x !== k)
    s.afterAny = (s.afterAny || []).filter((x) => x !== k)
  })
}
const afterLabel = (k) => (draft.value.skeleton.find((s) => s.key === k) || {}).goal || k
const shortGoal = (k) => {
  const g = (ev.value?.skeleton || []).find((s) => s.key === k)?.goal || k
  return g.replace(/^无/, '').slice(0, 10)
}

/* ---------------- 试跑：从覆盖人群里搜一个人 ----------------
 * 池子 = 员工主数据 + 两个补充样本（店长 / 城市总，主数据里没有这两个岗位的人），
 * 再按左侧「管谁」的条件过一遍 —— 搜到的就是真会被这套提示词命中的人。
 */
const q = ref('')
const pickedId = ref('')
const pool = computed(() => {
  const extra = previewPeople.filter((p) => !staff.some((s) => s.id === p.id))
  return [...staff, ...extra]
    .map((p) => (p.facts ? p : { ...p, facts: factsOfPerson(p) }))
    .filter((p) => scopeHit(draft.value.scope || {}, p))
})
const filtered = computed(() => {
  const k = q.value.trim()
  if (!k) return pool.value
  return pool.value.filter((p) => [p.name, p.id, p.job, p.store].some((v) => (v || '').includes(k)))
})
const picked = computed(() => pool.value.find((p) => p.id === pickedId.value) || null)

const curPv = computed(() => {
  const p = picked.value
  if (!p) return null
  const prompt = {
    ...(ev.value || {}),
    body: draft.value.body,
    skeleton: draft.value.skeleton,
    scope: draft.value.scope,
    trigger: draft.value.trigger
  }
  return { p, ...composeFor({ prompt, emp: p }) }
})
const mustOf = (pv) => pv.tree.filter((s) => s.gate !== 'optional').length

/**
 * 试跑要能逐条看清：目标 / 门禁 / 谁办 / 办什么 / 交什么 / 系统多久取一次 / 等谁。
 * 只给标题等于没预览 —— 差异恰恰在事项口径与取数频率上。
 */
function detailRows (pv) {
  const layerOf = layersOf(pv.tree)
  const byId = new Map(pv.tree.map((s) => [s.id, s]))
  const ctx = { store: pv.p.store, city: pv.p.city }
  return topoSort(pv.tree).map((s) => ({
    id: s.id,
    goal: s.goal,
    gate: s.gate,
    level: layerOf[s.id] || 0,
    ways: (s.ways || []).map((w) => wayView(w, ctx)),
    depIds: flatDeps(s.deps),
    deps: flatDeps(s.deps).map((id) => (byId.get(id) || {}).goal || id)
  }))
}

const rows = computed(() => (curPv.value ? detailRows(curPv.value) : []))
/** 按层分段：第几步、这一步里有几条可以同时办 */
const groups = computed(() => {
  const out = []
  rows.value.forEach((r) => {
    const last = out[out.length - 1]
    if (last && last.level === r.level) last.rows.push(r)
    else out.push({ level: r.level, rows: [r] })
  })
  return out
})
const selId = ref('')

/** deps 里「或」组是嵌套数组，摊平只为显示 */
function flatDeps (deps) {
  if (!Array.isArray(deps)) return []
  return deps.flatMap((d) => (Array.isArray(d) ? d : [d]))
}

const toFieldView = (f) => ({
  key: f.key,
  label: f.label,
  required: !!f.required,
  typeText: fieldTypeLabel(f.type) + (f.formats ? ` · ${f.formats}` : '')
})

function wayView (w, ctx) {
  if (w.type === 'human') {
    const o = ownerOfWay(w)
    const who = `${ownerLabel(o)} · ${resolveOwner(o, ctx)}`
    return {
      kind: 'human',
      kindLabel: '人给结论',
      who,
      freq: '',
      items: (w.items || []).map((itx) => ({
        title: itx.title,
        require: itx.require,
        fields: (itx.fields || []).map(toFieldView)
      }))
    }
  }
  if (w.type === 'system') {
    return {
      kind: 'system',
      kindLabel: '系统判定',
      who: checkName(w.sysKey),
      freq: `${freqText(w.fetch)} · 批次上限 ${w.fetch?.maxRuns ?? 5}`,
      items: []
    }
  }
  if (w.type === 'action') {
    return {
      kind: 'action',
      kindLabel: '系统执行',
      who: actionName(w.actionKey) + (w.targets ? ` · 目标 ${w.targets}` : ''),
      freq: '',
      items: []
    }
  }
  return {
    kind: 'external',
    kindLabel: '外部回执',
    who: w.party || '对方',
    freq: receiptTextOf(w) ? `回执：${receiptTextOf(w)}${w.writeBack ? ` · 写回 ${w.writeBack}` : ''}` : '回执字段未写',
    items: []
  }
}

const checkName = (k) => (checks.find((c) => c.key === k) || {}).name || k
function freqText (f) {
  if (!f || !f.fetchFreq) return '取数频率未配'
  if (f.fetchFreq === 'none') return '只取一次'
  const n = parseInt(f.fetchFreq, 10)
  return `每 ${n} ${/h/.test(f.fetchFreq) ? '小时' : '天'}取一次`
}
</script>

<style scoped>
.pt { display: flex; flex-direction: column; height: 100%; min-height: 0; padding: 14px 18px 0; }
.pt-empty { padding: 40px; color: #9a9496; font-size: 13px; }

.pt-head { flex: none; display: flex; align-items: center; gap: 10px; padding-bottom: 12px; }
.back { display: inline-flex; align-items: center; gap: 3px; border: 0; background: transparent; color: #8a8489; font-size: 12.5px; cursor: pointer; padding: 0; }
.back:hover { color: #a40035; }
.pt-head .sub { margin-left: 8px; font-size: 12px; font-weight: 400; color: #a3a0a1; }
/* 名称就地改：看着像标题，点进去才是输入框；只改名称不升版本 */
.name-cell { display: flex; align-items: center; gap: 6px; }
.name-input { width: 152px; }
.name-input :deep(.el-input__wrapper) { box-shadow: none; background: transparent; padding: 0 4px; }
.name-input :deep(.el-input__inner) { font-size: 17px; font-weight: 600; color: #2c2a33; }
.name-input:hover :deep(.el-input__wrapper) { box-shadow: 0 0 0 1px #e6e2ec inset; border-radius: 7px; }
.name-input :deep(.el-input__wrapper.is-focus) { box-shadow: 0 0 0 1px #d9d3e8 inset; border-radius: 7px; }
.chip { font-size: 11px; color: #6b6570; background: #f4f3f7; border-radius: 6px; padding: 1px 7px; }
.chip.ok { color: #1d7a55; background: #e8f6ef; }
.chip.off { color: #9a9496; background: #f4f3f7; }
.h-right { margin-left: auto; display: flex; align-items: center; gap: 8px; }
.dirty { font-size: 11.5px; color: #c26a00; }

/* 左定义 / 右试跑：定义占满剩下的宽度，功能区固定在一侧；收起试跑后定义区独占 */
.pt-main { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) 410px; gap: 14px; padding-bottom: 14px; }
.pt-main.no-try { grid-template-columns: minmax(0, 1fr); }
.try-on { border-color: #a40035 !important; color: #a40035 !important; }
.inline-link { border: 0; background: transparent; padding: 0; margin-left: 2px; color: #a40035; font-size: 11px; cursor: pointer; }
.pt-def { min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; padding-right: 2px; }

.card { flex: none; border: 1px solid #eceaf1; border-radius: 12px; background: #fff; overflow: hidden; }
.c-head { display: flex; align-items: baseline; gap: 8px; padding: 11px 16px; border-bottom: 1px solid #f2f0f5; background: #fbfafd; }
.bn { flex: none; font-size: 10px; font-style: normal; line-height: 16px; width: 16px; text-align: center; border-radius: 5px; background: #f1ecfd; color: #534ab7; }
.c-head b { font-size: 12.5px; color: #3c3a47; font-weight: 600; }
.c-sub { font-size: 11px; color: #a3a0a1; }
.hcnt { margin-left: auto; font-size: 10.5px; color: #8a8489; font-style: normal; }
.c-note { padding: 9px 16px 12px; font-size: 11px; color: #a3a0a1; line-height: 1.7; }

/* 1 / 适用条件 */
.scope-grid { display: grid; grid-template-columns: 62px minmax(0, 1fr); gap: 9px 12px; align-items: center; padding: 14px 16px 0; }
.scope-grid label { font-size: 11.5px; color: #8a8489; }

/* 2 / 提示词 */
.body-wrap { padding: 12px 16px 4px; }
.body-editor :deep(.el-textarea__inner) { font-family: inherit; font-size: 12.5px; line-height: 1.9; color: #3c3a47; background: #fcfcfe; border: 1px solid #f0eef4; border-radius: 9px; padding: 11px 13px; }

/* 生成原文浮层：只读整段，可复制 · 不占定义区版面 */
.src-layer { position: fixed; inset: 0; z-index: 3000; display: flex; align-items: center; justify-content: center; padding: 40px; background: rgba(28, 24, 38, 0.34); }
.src-panel { display: flex; flex-direction: column; width: min(780px, 92vw); max-height: 84vh; background: #fff; border-radius: 14px; box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18); overflow: hidden; }
.sp-head { flex: none; display: flex; align-items: center; gap: 12px; padding: 12px 18px; border-bottom: 1px solid #f2f0f5; }
.sp-title { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.sp-title b { font-size: 14px; color: #2c2a33; }
.sp-title span { font-size: 11px; color: #a3a0a1; line-height: 1.5; }
.sp-head em { font-size: 10.5px; color: #8a8489; background: #f4f3f7; border-radius: 6px; padding: 0 6px; font-style: normal; }
.sp-act { flex: none; display: flex; align-items: center; gap: 8px; }
.sp-act button { border: 1px solid #e6e2ec; background: #fff; color: #6b6570; font-size: 11.5px; border-radius: 7px; padding: 3px 10px; cursor: pointer; }
.sp-act button:hover { color: #a40035; border-color: #e0d5dc; }
.sp-x { color: #8a8489; }
.sp-body { flex: 1; min-height: 0; overflow: auto; padding: 14px 18px; }
.sp-body .tpl { max-height: none; }
.sp-foot { flex: none; padding: 10px 18px; border-top: 1px solid #f2f0f5; background: #fbfafd; font-size: 10.5px; color: #a3a0a1; }
.tpl { margin: 0; background: #fbfaff; border: 1px solid #f0eef4; border-radius: 9px; padding: 12px 14px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.5px; line-height: 1.85; color: #3c3a47; white-space: pre-wrap; word-break: break-word; }

/* 3 / 子事件：一行一条，列对齐才扫得动 */
.gen-strip { display: flex; align-items: center; gap: 8px; padding: 7px 16px; background: #fbfafd; border-bottom: 1px solid #f4f2f8; font-size: 10.5px; color: #8a8489; }
.gs-k { color: #534ab7; background: #f1ecfd; border-radius: 5px; padding: 0 6px; line-height: 16px; }
.gs-v { color: #6b6570; }
.gs-d em { font-style: normal; margin-left: 6px; color: #b06a1c; }
.gs-toggle { margin-left: auto; border: 0; background: transparent; color: #a40035; font-size: 10.5px; cursor: pointer; }
.gen-list { padding: 6px 16px 10px; border-bottom: 1px solid #f7f6fa; background: #fdfcff; }
/* 首次生成是一份对照清单：列对齐才看得出「哪条变了」，不用气泡堆在一行 */
.gl-row { display: grid; grid-template-columns: minmax(0, 1fr) 32px 86px minmax(0, 136px); gap: 8px; align-items: baseline; padding: 3px 0; font-size: 11px; color: #4a4a55; }
.gl-g { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.gl-t { justify-self: start; font-size: 10px; border-radius: 5px; padding: 0 5px; line-height: 15px; }
.gl-t.must { color: #9b2c2c; background: #fdecec; }
.gl-t.opt { color: #8a8489; background: #f4f3f7; }
.gl-p { color: #a3a0a1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.gl-f { color: #1d7a55; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.gl-note { padding-top: 4px; font-size: 10.5px; color: #b0aebe; }
.sk-goal-cell { display: flex; align-items: center; gap: 6px; min-width: 0; }
.sk-goal { flex: none; max-width: 100%; }
.sk-flag { flex: none; font-size: 9.5px; line-height: 15px; border-radius: 4px; padding: 0 4px; cursor: default; }
.sk-flag.first { color: #6b6570; background: #f2f1f5; }
.sk-flag.added { color: #1d5fa8; background: #eaf2fd; }
.sk-flag.edited { color: #b06a1c; background: #fdf1e3; }
.sk-proof { margin: 2px 34px 0; font-size: 10.5px; color: #1d7a55; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sk-proof.opt { color: #a3a0a1; }
.sk-head { display: grid; grid-template-columns: 24px minmax(0, 1fr) 118px 72px 110px 18px; gap: 8px; padding: 8px 16px 7px; font-size: 10.5px; color: #b0aebe; border-bottom: 1px solid #f4f2f8; }
.sk-note { padding: 2px 16px 6px; }
.sk-row { padding: 5px 16px 6px; border-bottom: 1px solid #f7f6fa; }
.sk-row:hover { background: #fcfbfe; }
.sk-main { display: grid; grid-template-columns: 24px minmax(0, 1fr) 118px 72px 110px 18px; gap: 8px; align-items: center; }
.sk-no { font-size: 10.5px; color: #b0aebe; text-align: left; }
.sk-goal :deep(.el-input__wrapper) { box-shadow: none; padding: 0 2px; background: transparent; }
.sk-goal :deep(.el-input__inner) { font-size: 12px; color: #3c3a47; font-weight: 500; }
.sk-goal:hover :deep(.el-input__wrapper) { box-shadow: 0 0 0 1px #e6e2ec inset; border-radius: 6px; }
.sk-needs :deep(.el-select__wrapper), .sk-gate :deep(.el-select__wrapper) { box-shadow: none; background: #f7f6fa; padding: 1px 8px; min-height: 22px; font-size: 11px; }
.sk-path { font-size: 10.5px; color: #a3a0a1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sk-del { font-size: 12px; color: #ddd9e2; cursor: pointer; }
.sk-del:hover { color: #a40035; }
.sk-after { margin: 2px 34px 0 34px; font-size: 10.5px; color: #b0aebe; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sk-add { display: flex; align-items: center; justify-content: center; gap: 4px; width: calc(100% - 32px); margin: 10px 16px 4px; padding: 7px; border: 1px dashed #dcd8e6; border-radius: 8px; background: transparent; font-size: 11.5px; color: #6b6570; cursor: pointer; }
.sk-add:hover { border-color: #b9b2d4; color: #4b3fa8; }
.sk-facts { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; padding: 8px 16px 12px; border-top: 1px dashed #f0eef4; }
.sf-k { font-size: 10.5px; color: #b0aebe; margin-right: 2px; }
.sf-base { font-size: 10px; padding: 1px 6px; border-radius: 8px; background: #f4f2f6; color: #8d8a99; }
.sf-ex { font-size: 10px; padding: 1px 6px; border-radius: 8px; background: #fbeef3; color: #a40035; }
.sf-none { font-size: 10px; color: #b0aebe; }

/* 4 / 触发 */
.trig { padding: 12px 16px 14px; display: flex; flex-direction: column; gap: 5px; }
.trig-row { display: flex; gap: 10px; font-size: 11.5px; line-height: 1.7; }
.trig-row .k { flex: none; width: 68px; color: #a3a0a1; }
.trig-row .v { color: #3c3a47; }
.trig-row .v em { font-style: normal; color: #b0aebe; }
.trig-row.top { align-items: flex-start; }
.pay { display: flex; flex-wrap: wrap; gap: 4px; }
.pay-i { font-size: 10.5px; color: #6b5bd2; background: #fff; border: 1px solid #eae6f8; border-radius: 6px; padding: 0 6px; cursor: pointer; }
.pay-i.on { color: #fff; background: #6b5bd2; border-color: #6b5bd2; }
.pay-i.lock { cursor: default; }
.pay-i em { font-style: normal; margin-left: 3px; color: #ded9f2; font-size: 9.5px; }
.pay-i:not(.on) em { color: #b0aebe; }
.pay .none { font-size: 11px; color: #b0aebe; }
.pay-uses { display: flex; flex-wrap: wrap; gap: 4px 10px; padding-left: 78px; margin-top: 3px; }
.pu-i { display: flex; align-items: center; gap: 4px; }
.pu-k { font-size: 10.5px; color: #a3a0a1; }
.pu-sel { width: 98px; }
.trig-note { margin-top: 6px; font-size: 11px; color: #a3a0a1; line-height: 1.7; }

/* 功能区 / 试跑 */
.pt-try { min-height: 0; display: flex; flex-direction: column; border: 1px solid #eceaf1; border-radius: 12px; background: #fff; overflow: hidden; }
.try-head { flex: none; display: flex; align-items: baseline; gap: 8px; padding: 11px 14px; border-bottom: 1px solid #f2f0f5; background: #fbfafd; }
.try-head b { font-size: 12.5px; color: #3c3a47; font-weight: 600; }
.try-head .c-sub { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.try-x { margin-left: auto; align-self: center; border: 1px solid #eceaf1; background: #fff; color: #8a8489; font-size: 10.5px; border-radius: 7px; padding: 2px 8px; cursor: pointer; }
.try-x:hover { color: #a40035; border-color: #e0d5dc; }
.try-body { flex: 1; min-height: 0; overflow-y: auto; padding: 12px 14px 14px; }
.try-cnt { margin-top: 8px; font-size: 10.5px; color: #a3a0a1; }
.try-list { margin-top: 8px; display: flex; flex-direction: column; gap: 4px; }
.tp { display: flex; align-items: center; gap: 8px; width: 100%; padding: 7px 9px; border: 1px solid #f0eef4; border-radius: 8px; background: #fff; cursor: pointer; text-align: left; }
.tp:hover { border-color: #d9d3e8; background: #fcfbfe; }
.tp-n { flex: none; font-size: 12.5px; font-weight: 600; color: #2c2a33; }
.tp-m { flex: 1; min-width: 0; font-size: 10.5px; color: #8a8489; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tp-t { flex: none; font-size: 9.5px; color: #8d8a99; background: #f4f2f6; border-radius: 6px; padding: 1px 6px; }
.try-empty { margin-top: 14px; font-size: 11.5px; color: #b0aebe; text-align: center; }
.try-tip { margin-top: 12px; font-size: 10.5px; color: #b0aebe; line-height: 1.7; }

.try-who { flex: none; display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-bottom: 1px solid #f2f0f5; }
.tw-l { min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.tw-l b { font-size: 13px; color: #2c2a33; }
.tw-l span { font-size: 10.5px; color: #8a8489; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tw-swap { flex: none; margin-left: auto; font-size: 10.5px; color: #6b6570; background: #fff; border: 1px solid #eceaf1; border-radius: 7px; padding: 2px 8px; cursor: pointer; }
.tw-swap:hover { border-color: #b9b2d4; color: #4b3fa8; }
.try-sum { flex: none; padding: 8px 14px; font-size: 11px; color: #6b6570; background: #fbfafd; border-bottom: 1px solid #f2f0f5; }
.try-sum b { color: #a40035; font-weight: 600; }

.try-tree { flex: 1; min-height: 0; overflow-y: auto; padding: 8px 10px 6px; }
.tt-g + .tt-g { margin-top: 4px; }
.tt-l { font-size: 10px; color: #b0aebe; margin: 4px 0 4px 2px; }
.tt-l i { font-style: normal; margin-left: 4px; color: #c3bfcf; }
.tt-r { border: 1px solid #f0eef4; border-radius: 9px; padding: 7px 9px 7px 10px; margin-bottom: 5px; cursor: pointer; background: #fff; transition: border-color .15s, box-shadow .15s; }
.tt-r:hover { border-color: #e2dff0; }
.tt-r.on { border-color: #a40035; box-shadow: 0 0 0 3px rgb(164 0 53 / .07); }
.tt-t { display: flex; align-items: flex-start; gap: 6px; }
.tt-goal { flex: 1; min-width: 0; font-size: 12px; font-weight: 600; color: #2c2a33; line-height: 1.45; }
.tt-gate { flex: none; font-size: 9.5px; line-height: 1.7; padding: 0 5px; border-radius: 4px; color: #993556; background: #fbeaf0; }
.tt-gate.optional { color: #888780; background: #f1efe8; }
.tt-who { margin-top: 3px; font-size: 10.5px; color: #8a8489; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.try-foot { flex: none; border-top: 1px dashed #f0eef4; padding: 8px 14px 10px; font-size: 10.5px; color: #a3a0a1; line-height: 1.7; }
.tf-k { margin-right: 3px; color: #b0aebe; }
.tf-drop { display: block; color: #c08a3e; }
.tf-bad { display: block; color: #a40035; }
</style>
