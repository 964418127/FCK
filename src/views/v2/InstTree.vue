<template>
  <div class="it-page">
    <template v-if="!inst">
      <div class="empty">
        <p>没找到这一单。</p>
        <el-button size="small" @click="toWalk">回事件数据</el-button>
      </div>
    </template>

    <template v-else>
      <div class="topbar">
        <el-button link size="small" :icon="Back" @click="toWalk">事件数据</el-button>
        <h1>{{ inst.code }}</h1>
        <span :class="['st-chip', inst.state]">{{ instStateLabel(inst.state) }}</span>
        <span class="who">{{ inst.emp.name }} · {{ inst.emp.job }} · {{ inst.emp.store }}</span>
        <span class="spacer" />
        <span class="gen">{{ genText }}</span>
        <el-button size="small" @click="toDetail">看进度</el-button>
      </div>

      <div v-if="inst.intake" class="intake">
        <span class="ik-k">取数</span>
        <span v-for="s in inst.intake.steps" :key="s.key" :class="['ik-i', { bad: !s.ok }]">
          {{ s.label }}<em>{{ s.query }}</em>{{ s.result }}
        </span>
      </div>

      <div class="body">
        <!-- 左：这一单的流程画布 -->
        <section class="col-flow">
          <div class="c-head">
            <b>这一单的子事件</b>
            <span class="c-sub">点卡片改 · 点连线断开前置</span>
            <em>{{ tree.length }} 条 · 必过 {{ mustCount }}</em>
            <button class="head-add" @click="addSub">+ 加一条</button>
          </div>

          <div class="flow-box">
            <FlowBoard
              :nodes="flowNodes"
              :start-label="`${inst.emp.name} 提出申请`"
              :selected="selId"
              :card-width="216"
              :gap-x="50"
              editable
              @pick="select"
              @unlink="onUnlink"
            />
          </div>
        </section>
      </div>

      <!-- 右：选中条目（抽屉，浮在画布上；画布仍可继续点别的卡） -->
      <el-drawer
        v-model="detOpen"
        class="it-drawer"
        size="474px"
        :with-header="false"
        :modal="false"
        :lock-scroll="false"
        :before-close="tryClose"
      >
        <section v-if="draft" class="col-det">
          <div class="d-head">
            <span class="d-no">{{ noOf(selId) }}</span>
            <el-input v-model="draft.goal" :disabled="isLocked" class="d-goal" placeholder="一句可判定的结论" />
            <el-select v-model="draft.gate" :disabled="isLocked" class="d-gate">
              <el-option label="必过" value="must" />
              <el-option label="可选" value="optional" />
            </el-select>
            <span :class="['d-state', st.state]">{{ stateLabel(st.state) }}</span>
            <button class="d-x" title="收起（Esc）" @click="closeDet"><el-icon><Close /></el-icon></button>
          </div>

          <div v-if="isLocked" class="lock-strip">
            这一环已经办结（{{ st.by || '—' }} {{ st.at || '' }}），结论、门禁、前置与事项都锁住，只能改说明
          </div>

          <div class="d-sec">
            <div class="ds-t">前置 <em>全办结才轮得到它；不选就是没有前置</em></div>
            <el-select
              v-model="draft.deps"
              multiple
              size="small"
              :disabled="isLocked"
              placeholder="不选 = 没有前置"
              class="d-deps"
            >
              <el-option v-for="o in depOptions" :key="o.id" :label="`${noOf(o.id)}　${o.goal}`" :value="o.id" />
            </el-select>
          </div>

          <div class="d-sec">
            <div class="ds-t">兑现路径 <em>一条结论可以有几条路，谁先给出终局结论就以谁为准</em></div>

            <div v-for="(w, wi) in draft.ways" :key="wi" class="way" :class="w.type">
              <div class="w-head">
                <span class="w-tag">{{ wayTypeLabel(w.type) }}</span>
                <span v-if="w.type === 'human'" class="w-sub">{{ ownerLabel(w.owner) }} → {{ resolveOwner(w.owner, where) || '解析不到人' }}</span>
                <span v-else-if="w.type === 'system'" class="w-sub">{{ checkName(w.sysKey) }} · {{ freqText(w.fetch) }} · 上限 {{ w.fetch?.maxRuns || 5 }} 个未通过批次</span>
                <span v-else-if="w.type === 'action'" class="w-sub">{{ actionName(w.actionKey) || '未选动作' }} · {{ w.targets || '整单' }}</span>
                <span v-else class="w-sub">{{ w.party || '未写对方' }} · 等 {{ w.receipt || '回执' }}</span>
                <span class="spacer" />
                <el-icon v-if="!isLocked" class="w-del" @click="dropWay(wi)"><Delete /></el-icon>
              </div>

              <!-- 人给结论 -->
              <template v-if="w.type === 'human'">
                <div class="w-row">
                  <span class="wr-k">负责人</span>
                  <el-select v-model="w.owner.kind" size="small" class="wr-k2" :disabled="isLocked">
                    <el-option label="按角色" value="role" />
                    <el-option label="指定人" value="person" />
                  </el-select>
                  <el-select v-if="w.owner.kind === 'role'" v-model="w.owner.role" size="small" class="wr-v" :disabled="isLocked">
                    <el-option v-for="r in roles" :key="r.key" :label="r.label" :value="r.key" />
                  </el-select>
                  <el-select v-else v-model="w.owner.name" size="small" class="wr-v" :disabled="isLocked" filterable allow-create>
                    <el-option v-for="n in OWNER_NAME_OPTIONS" :key="n" :label="n" :value="n" />
                  </el-select>
                  <span class="wr-hint">核对并填结果的人；动手的人写进事项的完成口径</span>
                </div>

                <div v-for="(it, ii) in w.items" :key="it.id" class="item">
                  <div class="i-head">
                    <el-input v-model="it.title" size="small" class="i-title" :disabled="isLocked" placeholder="事项名" />
                    <el-icon v-if="!isLocked" class="i-del" @click="dropItem(w, ii)"><Delete /></el-icon>
                  </div>
                  <el-input
                    v-model="it.require"
                    type="textarea"
                    :rows="2"
                    size="small"
                    :disabled="isLocked"
                    placeholder="做到什么算完成（谁动手写在这里）"
                    class="i-req"
                  />
                  <div class="flds">
                    <div v-for="f in it.fields" :key="f.key" class="fld">
                      <el-input v-model="f.label" size="small" class="f-label" :disabled="isLocked" placeholder="字段名" />
                      <el-select v-model="f.type" size="small" class="f-type" :disabled="isLocked">
                        <el-option v-for="t in FIELD_TYPES" :key="t.key" :label="t.label" :value="t.key" />
                      </el-select>
                      <el-checkbox v-model="f.required" size="small" :disabled="isLocked">必传</el-checkbox>
                      <el-icon v-if="!isLocked" class="f-del" @click="dropField(it, f.key)"><Delete /></el-icon>
                    </div>
                    <button v-if="!isLocked" class="f-add" @click="pushField(it)">+ 字段</button>
                  </div>
                </div>
                <button v-if="!isLocked" class="i-add" @click="pushItem(w)">+ 事项</button>
              </template>

              <!-- 系统判定 -->
              <template v-else-if="w.type === 'system'">
                <div class="w-row">
                  <span class="wr-k">判定项</span>
                  <el-select v-model="w.sysKey" size="small" class="wr-v" :disabled="isLocked">
                    <el-option v-for="c in checks" :key="c.key" :label="`${c.name}（${c.source}）`" :value="c.key" />
                  </el-select>
                </div>
                <div class="w-row">
                  <span class="wr-k">取数频率</span>
                  <el-select v-model="w.fetch.fetchFreq" size="small" class="wr-v" :disabled="isLocked">
                    <el-option label="每小时" value="1h" />
                    <el-option label="每 2 小时" value="2h" />
                    <el-option label="每 12 小时" value="12h" />
                    <el-option label="每天" value="1d" />
                    <el-option label="只取一次" value="none" />
                  </el-select>
                  <span class="wr-hint">这一单多久去取一次结果；检查方多久出一批不归这里管</span>
                </div>
                <div class="w-row">
                  <span class="wr-k">批次上限</span>
                  <el-input-number v-model="w.fetch.maxRuns" :min="1" :max="20" size="small" :disabled="isLocked" />
                  <span class="wr-hint">只计消费到的不同未通过批次，通过即停</span>
                </div>
              </template>

              <!-- 系统执行 -->
              <template v-else-if="w.type === 'action'">
                <div class="w-row">
                  <span class="wr-k">动作</span>
                  <el-select v-model="w.actionKey" size="small" class="wr-v" :disabled="isLocked">
                    <el-option v-for="a in actionList" :key="a.key" :label="`${a.name}（${a.source}）`" :value="a.key" />
                  </el-select>
                </div>
                <div class="w-row">
                  <span class="wr-k">执行目标</span>
                  <el-input v-model="w.targets" size="small" class="wr-v" :disabled="isLocked" placeholder="逐目标执行，拿逐目标回执" />
                </div>
              </template>

              <!-- 外部回执 -->
              <template v-else>
                <div class="w-row">
                  <span class="wr-k">对方</span>
                  <el-input v-model="w.party" size="small" class="wr-v" :disabled="isLocked" placeholder="对方的人要动手，我方只能等" />
                </div>
                <div class="w-row">
                  <span class="wr-k">回执</span>
                  <span class="wr-v wr-ro">{{ receiptTextOf(w) || '还没约定回执字段' }}</span>
                </div>
                <div class="w-row" v-if="receiptFieldsOf(w).length">
                  <span class="wr-k">写回</span>
                  <span class="wr-v wr-ro">{{ w.writeBack || '没说写回哪个字段' }}</span>
                </div>
              </template>
            </div>

            <div v-if="!isLocked && addableWays.length" class="way-add">
              <span class="wa-k">还能加</span>
              <button v-for="t in addableWays" :key="t.key" class="wa-b" @click="pushWay(t.key)">+ {{ t.label }}</button>
            </div>
          </div>

          <div class="d-acts">
            <el-button type="primary" size="small" :disabled="!dirty" @click="save">保存这条</el-button>
            <el-button size="small" :disabled="isLocked" @click="drop">删掉这条</el-button>
            <span v-if="dirty" class="dirty">有未保存改动</span>
            <span v-else class="clean">{{ isLocked ? '已办结 · 只读' : '无改动' }}</span>
          </div>

          <div v-if="(inst.adjusts || []).length" class="adj">
            <div class="aj-t">
              调整留痕
              <em>{{ inst.adjusts.length }} 次 · 只记录，不影响流程推进</em>
            </div>
            <div v-for="(a, ai) in inst.adjusts.slice(0, 6)" :key="ai" class="aj-i">
              <span class="aj-at">{{ a.at }}</span>
              <span class="aj-by">{{ a.by }}</span>
              <span class="aj-tx">{{ a.text }}</span>
            </div>
          </div>

          <div v-if="repeatHints.length" class="repeat">
            <span class="rp-k">值得回定义层看看</span>
            <span v-for="(h, hi) in repeatHints" :key="hi" class="rp-i">「{{ h.g }}」这类调整已出现 {{ h.n }} 次</span>
            <span class="rp-t">同样的改动反复手调，说明缺的是子事件条目或事实，不是这一单的例外</span>
          </div>
        </section>
      </el-drawer>
    </template>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Back, Close, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  v2state, getInstance, checks, actionList, addInstanceSub, removeInstanceSub,
  updateInstanceSub, subLocked
} from '../../v2/store.js'
import {
  layersOf, flatDeps, stateLabel, roles, FIELD_TYPES, WAY_TYPES, wayTypeLabel,
  ownerLabel, resolveOwner, ownerOfWay, makeItem, makeField, makeWay, clone,
  OWNER_NAME_OPTIONS, receiptTextOf, receiptFieldsOf
} from '../../v2/model.js'
import { actionName } from '../../v2/seed.js'
import { instStateLabel } from '../../v2/instance.js'
import { genSummary } from '../../v2/blueprint.js'
import FlowBoard from '../../components/v2/FlowBoard.vue'

const route = useRoute()
const router = useRouter()

const inst = computed(() => (route.query.id ? getInstance(route.query.id) : null))
const tree = computed(() => inst.value?.tree || [])
const layers = computed(() => layersOf(tree.value))
/** 层内顺序按原树顺序，层与层按层号 */
const groups = computed(() => {
  const out = []
  tree.value.forEach((s) => {
    const lv = layers.value[s.id] ?? 0
    let g = out.find((x) => x.lv === lv)
    if (!g) { g = { lv, items: [] }; out.push(g) }
    g.items.push(s)
  })
  return out.sort((a, b) => a.lv - b.lv)
})
const orderIndex = computed(() => {
  const m = {}
  let i = 0
  groups.value.forEach((g) => g.items.forEach((s) => { m[s.id] = ++i }))
  return m
})
const noOf = (id) => String(orderIndex.value[id] || 0).padStart(2, '0')
const mustCount = computed(() => tree.value.filter((s) => s.gate !== 'optional').length)
const where = computed(() => ({ store: inst.value?.emp?.store, city: inst.value?.emp?.city }))
const genText = computed(() => {
  const g = inst.value?.gen
  const adj = (inst.value?.adjusts || []).length
  return `${g ? genSummary(g) : '—'}${adj ? ` · 调整 ${adj} 次` : ''}`
})

/* ---------------- 选中与草稿 ---------------- */

const selId = ref('')
const draft = ref(null)
const detOpen = ref(false)
/** 用户主动收起过 → 别再自动替他选第一条，否则收起后又亮回来 */
const closedByUser = ref(false)
const st = computed(() => inst.value?.subs?.[selId.value] || { state: 'pending', records: {} })
const isLocked = computed(() => (inst.value ? subLocked(inst.value, selId.value) : false))

const origin = computed(() => tree.value.find((s) => s.id === selId.value) || null)
const dirty = computed(() => !!draft.value && JSON.stringify(draft.value) !== JSON.stringify(origin.value))

function select (id) {
  closedByUser.value = false
  if (dirty.value && id !== selId.value) {
    // 切走会丢掉未保存的改动，先确认
    ElMessageBox.confirm('这条还没保存，切换会丢掉改动。继续？', '未保存', {
      confirmButtonText: '丢掉并切换', cancelButtonText: '留在这条', type: 'warning'
    }).then(() => {
      selId.value = id
      detOpen.value = true
    }).catch(() => {})
    return
  }
  selId.value = id
  detOpen.value = true
}

/**
 * 收起抽屉：有未保存改动先问一句。
 * 三条路都走这里（右上角 ×、Esc、点画布空白），免得留个改了一半的草稿。
 */
function closeDet () {
  if (dirty.value) {
    ElMessageBox.confirm('这条还没保存，收起会丢掉改动。继续？', '未保存', {
      confirmButtonText: '丢掉并收起', cancelButtonText: '留在这条', type: 'warning'
    }).then(doClose).catch(() => {})
    return
  }
  doClose()
}

function doClose () {
  detOpen.value = false
  closedByUser.value = true
  selId.value = ''
  draft.value = null
}

/** el-drawer 自己触发的关闭（Esc 等）也过一遍同样的确认 */
function tryClose (done) {
  if (dirty.value) {
    ElMessageBox.confirm('这条还没保存，收起会丢掉改动。继续？', '未保存', {
      confirmButtonText: '丢掉并收起', cancelButtonText: '留在这条', type: 'warning'
    }).then(() => { done(); doClose() }).catch(() => {})
    return
  }
  done()
  doClose()
}

function loadDraft () {
  const s = tree.value.find((x) => x.id === selId.value)
  draft.value = s
    ? clone({ ...s, deps: flatDeps(s.deps || []).filter((d, i, a) => a.indexOf(d) === i) })
    : null
}

watch([inst, selId], () => {
  if (inst.value && !selId.value && !closedByUser.value) {
    const want = route.query.sub && tree.value.some((s) => s.id === route.query.sub) ? route.query.sub : ''
    if (want) { selId.value = want; return }
    if (tree.value.length) { selId.value = tree.value[0].id; return }
  }
  loadDraft()
}, { immediate: true })

/** 换一笔实例：选中重置，避免沿用上一单的节点 */
watch(() => route.query.id, () => { selId.value = '' })

/** 原来的前置里带「或」组时，这里一改就会按「且」保存 —— 先说明白 */
const hadOrGroup = computed(() => (origin.value?.deps || []).some((d) => Array.isArray(d)))

const depOptions = computed(() => tree.value.filter((s) => s.id !== selId.value))
/**
 * 能往上加的路径类型：不给「审核」这一项 ——
 * 审核在这里不是一种兑现方式，就是人给结论；多一个类型只会让同一步出现两种说法。
 * 已有的 review 路径照常显示、照常能删（旧树里可能带）。
 */
const ADDABLE_TYPES = ['human', 'system', 'action', 'external']
const addableWays = computed(() => {
  const have = new Set((draft.value?.ways || []).map((w) => w.type))
  return WAY_TYPES.filter((t) => ADDABLE_TYPES.includes(t.key) && !have.has(t.key))
})

/* ---------------- 改 ---------------- */

function save () {
  if (!draft.value) return
  if (hadOrGroup.value && (draft.value.deps || []).join() !== flatDeps(origin.value?.deps || []).join()) {
    ElMessage.warning('这条原来带「或」组前置，这里只能按「且」保存；要用或组得回子事件定义改')
  }
  const r = updateInstanceSub(inst.value.id, selId.value, draft.value)
  if (r?.refused) { ElMessage.warning(r.why); return }
  loadDraft()
  ElMessage.success('改了，记了一笔留痕；只影响这一单')
}

async function drop () {
  try {
    await ElMessageBox.confirm('删掉这一条？指向它的前置会一起摘掉，不留悬空。', '删掉子事件', {
      confirmButtonText: '删掉', cancelButtonText: '取消', type: 'warning'
    })
  } catch (e) { return }
  const r = removeInstanceSub(inst.value.id, selId.value)
  if (r?.refused) { ElMessage.warning(r.why); return }
  selId.value = ''
  const first = tree.value[0]
  if (first) selId.value = first.id
  ElMessage.success('删了，记了一笔留痕')
}

async function addSub () {
  try {
    const { value } = await ElMessageBox.prompt('这条要交付什么结论？（一句可判定的）', '加一条结论', {
      confirmButtonText: '加上', cancelButtonText: '取消', inputPlaceholder: '例如：门店钥匙已交回并登记'
    })
    const sub = addInstanceSub(inst.value.id, { goal: value })
    if (sub) { selId.value = sub.id; detOpen.value = true }
    ElMessage.success('加上了；默认没有前置，现在就能办')
  } catch (e) { /* 取消 */ }
}

/* 路径 / 事项 / 字段：直接改草稿 */

function pushWay (type) {
  draft.value.ways = draft.value.ways || []
  draft.value.ways.push(makeWay(type))
}
function dropWay (i) {
  draft.value.ways.splice(i, 1)
}
function pushItem (w) {
  w.items = w.items || []
  w.items.push(makeItem({ fields: [] }))
}
function dropItem (w, i) {
  w.items.splice(i, 1)
}
function pushField (it) {
  it.fields = it.fields || []
  it.fields.push(makeField({ label: '' }))
}
function dropField (it, key) {
  it.fields = (it.fields || []).filter((f) => f.key !== key)
}

/* ---------------- 展示 ---------------- */

const stOf = (id) => inst.value?.subs?.[id] || { state: 'pending', records: {} }
const locked = (id) => (inst.value ? subLocked(inst.value, id) : false)

/** 画布卡片：什么结论 / 谁办 / 关键一行；状态与锁直接画在卡上 */
const flowNodes = computed(() => tree.value.map((s) => {
  const st = stOf(s.id)
  const ds = flatDeps(s.deps || [])
  const sysW = (s.ways || []).find((w) => w.type === 'system')
  const onlySys = (s.ways || []).length === 1 && sysW
  return {
    id: s.id,
    title: s.goal,
    gate: s.gate,
    who: ownerText(s),
    foot: ds.length ? `等 ${ds.length} 条办结` : (onlySys ? freqText(sysW.fetch) : ''),
    footTone: ds.length ? 'mute' : 'info',
    kind: onlySys ? 'system' : '',
    deps: ds,
    state: st.state,
    stateLabel: st.state === 'pending' ? '' : stateLabel(st.state),
    locked: locked(s.id),
    added: !!s.addedAt
  }
}))

/** 点连线 = 断开这个前置；已办结的不动（它是事实） */
function onUnlink ({ from, to }) {
  const s = tree.value.find((x) => x.id === to)
  if (!s) return
  if (locked(to)) { ElMessage.warning('这一环已经办结，是事实，前置不能改'); return }
  const next = clone({ ...s, deps: flatDeps(s.deps || []).filter((d) => d !== from) })
  const r = updateInstanceSub(inst.value.id, to, next)
  if (r?.refused) { ElMessage.warning(r.why); return }
  if (selId.value === to) loadDraft()
  ElMessage.success(`已断开：这一条不再等「${(tree.value.find((x) => x.id === from) || {}).goal || from}」`)
}
const checkName = (k) => (checks.find((c) => c.key === k) || {}).name || '未选判定项'
const freqText = (f) => (!f ? '未配' : f.fetchFreq === 'none' ? '只取一次' : `每 ${String(f.fetchFreq).replace('h', ' 小时').replace('d', ' 天')}`)

function ownerText (s) {
  const w = (s.ways || []).find((x) => x.type === 'human')
  if (!w) return (s.ways || []).map((x) => wayTypeLabel(x.type)).join(' / ') || '无路径'
  const o = ownerOfWay(w)
  const name = resolveOwner(o, where.value)
  return `${ownerLabel(o)}${name ? ' ' + name : '（解析不到人）'}`
}

/** 同类调整反复出现：跨单统计「加一条「X」」 */
const repeatHints = computed(() => {
  const count = {}
  v2state.instances.forEach((i) => {
    (i.adjusts || []).forEach((a) => {
      const m = /^加一条「(.+?)」/.exec(a.text || '')
      if (m) count[m[1]] = (count[m[1]] || 0) + 1
    })
  })
  return Object.entries(count).filter(([, n]) => n >= 2).map(([g, n]) => ({ g, n })).slice(0, 3)
})

function toWalk () {
  router.push({ name: 'v2-instances' })
}
function toDetail () {
  router.push({ name: 'v2-instances', query: { id: inst.value.id } })
}

/** 抽屉没有自带 header，Esc 就成了唯一不靠鼠标的退出方式；顺手也兜住 */
function onKey (e) {
  if (e.key === 'Escape' && detOpen.value) {
    e.stopPropagation()
    closeDet()
  }
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.it-page { padding: 16px 20px 24px; height: 100%; display: flex; flex-direction: column; min-height: 0; }
.empty { padding: 60px 0; text-align: center; color: #8a8f99; }

.topbar { display: flex; align-items: center; gap: 10px; flex: none; margin-bottom: 10px; }
.topbar h1 { margin: 0; font-size: 17px; }
.spacer { flex: 1; }
.who { font-size: 12px; color: #6a6a75; }
.gen { font-size: 11.5px; color: #a3a0a1; }
.st-chip { font-size: 11px; border-radius: 8px; padding: 1px 7px; }
.st-chip.done { color: #0f6e56; background: #e1f5ee; }
.st-chip.running { color: #534ab7; background: #eeedfe; }
.st-chip.terminated { color: #b23b3b; background: #fdecec; }

.hint { display: flex; gap: 10px; align-items: flex-start; background: #fdf6f8; border: 1px solid #f6e3ea; border-radius: 10px; padding: 9px 13px; margin-bottom: 12px; flex: none; }
.h-k { flex: none; font-size: 11.5px; font-weight: 600; color: #a40035; background: #fbe9f0; border-radius: 7px; padding: 2px 8px; }
.h-t { font-size: 12px; color: #6a6a75; line-height: 1.7; }
.h-t b { color: #a40035; font-weight: 600; }

.intake { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; background: #f6f6f9; border: 1px dashed #e4e4ec; border-radius: 10px; padding: 7px 13px; margin-bottom: 12px; flex: none; font-size: 11.5px; color: #5b5966; }
.ik-k { font-weight: 600; color: #7a7787; }
.ik-i em { font-style: normal; font-size: 10.5px; color: #a8a6b4; margin: 0 5px; }
.ik-i.bad, .ik-i.bad em { color: #c45656; }
.ik-n { margin-left: auto; font-size: 10.5px; color: #b8b6c2; }

/* 左侧画布铺满；编辑区是浮在右边的抽屉 */
.body { flex: 1; min-height: 0; display: flex; }

/* 左栏：流程画布 */
.col-flow { flex: 1; min-width: 0; display: flex; flex-direction: column; min-height: 0; background: #fff; border: 1px solid #ececf0; border-radius: 12px; overflow: hidden; }
.c-head { flex: none; display: flex; align-items: center; gap: 8px; padding: 11px 14px 9px; border-bottom: 1px solid #f2f1f5; }
.c-head b { font-size: 13px; color: #2b2b33; }
.c-sub { font-size: 11px; color: #a3a0a1; }
.c-head em { margin-left: auto; font-style: normal; font-size: 11px; color: #a40035; }
.head-add { flex: none; font-size: 11.5px; color: #a40035; background: #fdf6f8; border: 1px solid #f0d5e1; border-radius: 8px; padding: 3px 9px; cursor: pointer; }
.head-add:hover { background: #fbe9f0; }
.flow-box { flex: 1; min-height: 0; }

/* 右栏 */
.col-det { height: 100%; overflow-y: auto; box-sizing: border-box; background: #fff; padding: 0 18px 20px; }
/* 头部自己粘住：抽屉没有 title 栏，滚下去也得能一眼看到结论、状态和收起键 */
.d-head { position: sticky; top: 0; z-index: 3; background: #fff; display: flex; align-items: center; gap: 8px; padding: 13px 0 9px; border-bottom: 1px solid #f4f3f7; margin-bottom: 2px; }
.d-x { flex: none; display: grid; place-items: center; width: 24px; height: 24px; border: 0; border-radius: 7px; background: #f6f5f9; color: #8a8489; cursor: pointer; }
.d-x:hover { background: #f0eef4; color: #2b2b33; }
.d-x .el-icon { font-size: 13px; }
.d-no { font-family: ui-monospace, monospace; font-size: 11px; color: #c3c1cb; }
.d-goal { flex: 1; }
.d-goal :deep(.el-input__wrapper) { box-shadow: none; padding: 2px 8px; }
.d-goal :deep(.el-input__inner) { font-size: 14px; font-weight: 500; color: #2b2b33; }
.d-gate { width: 82px; }
.d-state { font-size: 10.5px; border-radius: 6px; padding: 1px 7px; color: #a3a0a1; background: #f2f1f5; }
.d-state.done { color: #0f6e56; background: #e1f5ee; }
.d-state.running { color: #534ab7; background: #eeedfe; }
.d-state.checking { color: #9a6b00; background: #fdf6e7; }
.d-state.rejected { color: #b23b3b; background: #fdecec; }

.lock-strip { margin-top: 9px; font-size: 11.5px; color: #8a6a00; background: #fdf6e7; border-radius: 8px; padding: 6px 10px; }

.d-sec { margin-top: 14px; border-top: 1px dashed #f0eef4; padding-top: 11px; }
.ds-t { font-size: 12px; font-weight: 600; color: #4a4750; margin-bottom: 7px; }
.ds-t em { font-style: normal; font-weight: 400; font-size: 10.5px; color: #b0aebe; margin-left: 6px; }
.d-deps { width: 100%; }

.way { border: 1px solid #f0eef4; border-radius: 10px; padding: 9px 11px 10px; margin-bottom: 8px; }
.way.human { border-color: #e7e4f8; background: #fcfbff; }
.way.system { border-color: #e0f0ea; background: #fbfefd; }
.way.action { border-color: #e3edf8; background: #fbfdff; }
.way.external { border-color: #f6ecd8; background: #fffdf8; }
.w-head { display: flex; align-items: center; gap: 7px; margin-bottom: 7px; }
.w-tag { font-size: 10.5px; border-radius: 6px; padding: 1px 7px; color: #534ab7; background: #eeedfe; }
.way.system .w-tag { color: #0f6e56; background: #e1f5ee; }
.way.action .w-tag { color: #2f6fa8; background: #e8f1fa; }
.way.external .w-tag { color: #9a6b00; background: #fdf6e7; }
.w-sub { font-size: 11px; color: #8a8f99; }
.w-del { font-size: 13px; color: #c3c1cb; cursor: pointer; }
.w-del:hover { color: #b23b3b; }
.w-row { display: flex; align-items: center; gap: 8px; margin-top: 6px; flex-wrap: wrap; }
.wr-k { flex: none; width: 58px; font-size: 11px; color: #a3a0a1; }
.wr-k2 { width: 88px; }
.wr-v { width: 210px; }
/* 回执字段是对方平台的契约，实例期只读：能在这一单改的就不是约定了 */
.wr-ro { width: 210px; font-size: 11.5px; color: #6b6570; line-height: 1.5; }
.wr-hint { font-size: 10px; color: #b8b6c0; flex: 1; min-width: 120px; }

.item { margin-top: 8px; border-top: 1px dashed #f2f1f5; padding-top: 8px; }
.i-head { display: flex; align-items: center; gap: 6px; }
.i-title { flex: 1; }
.i-title :deep(.el-input__inner) { font-size: 12px; }
.i-del { font-size: 12px; color: #c3c1cb; cursor: pointer; }
.i-del:hover { color: #b23b3b; }
.i-req { margin-top: 5px; }
.i-req :deep(.el-textarea__inner) { font-size: 11.5px; color: #5f6368; }
.flds { margin-top: 6px; display: flex; flex-direction: column; gap: 4px; }
.fld { display: flex; align-items: center; gap: 6px; }
.f-label { width: 132px; }
.f-label :deep(.el-input__inner) { font-size: 11px; }
.f-type { width: 96px; }
.fld :deep(.el-checkbox__label) { font-size: 10.5px; }
.f-del { font-size: 11px; color: #d5d3dc; cursor: pointer; }
.f-del:hover { color: #b23b3b; }
.f-add, .i-add, .wa-b { font-size: 10.5px; color: #a40035; background: none; border: none; cursor: pointer; padding: 2px 0; }
.f-add { align-self: flex-start; }
.i-add { margin-top: 6px; }
.way-add { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
.wa-k { font-size: 10.5px; color: #b0aebe; }
.wa-b { background: #f7f6fa; border-radius: 6px; padding: 2px 8px; }

.d-acts { display: flex; align-items: center; gap: 8px; margin-top: 14px; padding-top: 12px; border-top: 1px solid #f2f1f5; }
.dirty { font-size: 11px; color: #d89b2a; }
.clean { font-size: 11px; color: #b8b6c0; }

.adj { margin-top: 14px; background: #faf9fc; border-radius: 10px; padding: 9px 12px; }
.aj-t { font-size: 11.5px; font-weight: 600; color: #4a4750; margin-bottom: 5px; }
.aj-t em { font-style: normal; font-weight: 400; font-size: 10.5px; color: #b0aebe; margin-left: 6px; }
.aj-i { display: flex; gap: 8px; font-size: 10.5px; color: #6a6a75; line-height: 1.9; }
.aj-at { flex: none; color: #b0aebe; font-family: ui-monospace, monospace; }
.aj-by { flex: none; color: #8a8f99; }

.repeat { margin-top: 10px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; background: #fdf6e7; border-radius: 10px; padding: 8px 12px; }
.rp-k { font-size: 10.5px; font-weight: 600; color: #9a6b00; }
.rp-i { font-size: 10.5px; color: #6a6a75; }
.rp-t { font-size: 10.5px; color: #a3a0a1; }
</style>

<style>
/* 抽屉挂在 body 上，scoped 够不到，只能写全局 */
.it-drawer .el-drawer__body { padding: 0; }
.it-drawer .el-drawer__header { display: none; }
.it-drawer .el-drawer { border-left: 1px solid #ececf0; box-shadow: -6px 0 24px rgb(44 42 51 / .08); }
</style>
