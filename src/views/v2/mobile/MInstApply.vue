<!--
  移动端 · 发起一件事
  表单按 v1 离职需求发起页（mobile-resign-pd/ResignApply.vue）的**发起端**抄，不抄审核端：
  第一步「申请」= 我的信息（档案带出）→ 离职意向（需填写）→ 收款账户（档案带出）
    → 离职需求审核（审核链按配置带出）→ 提交后（只说下一步会发生什么）；
  第二步「确认」= 核对 + 本人签字 + 同意须知；提交后回到成功页。
  两条边界：这单要办几项、常乐豆与补偿的数，都是**提交后**才有的 —— 发起页不预告、不展示；
  常乐豆的款项出口、实际离职日期由审核人在「离职需求审核」里补，不在这里填。
-->
<template>
  <div class="m-page">
    <div class="page-header">
      <el-icon class="back-icon" @click="back"><ArrowLeft /></el-icon>
      <h1>{{ title }}</h1>
      <!-- 原型辅助：正式开发就是登录账号，不需要切换；这里只用于演示不同员工视角 -->
      <span class="persona-hint" title="原型演示：切换员工视角（正式开发为登录账号，无需切换）" @click="cyclePersona">{{ me?.name }}</span>
    </div>

    <!-- 提交成功 -->
    <div v-if="submitted" class="content">
      <div class="card done-card">
        <div class="done-icon"><el-icon><Select /></el-icon></div>
        <div class="done-title">{{ ev?.name }}已提交</div>
        <div class="done-sub">单号 {{ doneInst?.code }}</div>
      </div>
      <div class="card">
        <div class="sec-head"><span class="sec-title">处理进度</span></div>
        <div class="info-row"><span>当前状态</span><b class="waiting">等{{ firstOwner }}办第一项</b></div>
        <div class="info-row"><span>共几项</span><b>该办 {{ subCount }} 条，其中必须完成 {{ mustCount }} 条</b></div>
        <div class="info-row" v-if="form.expectDate"><span>期望离职日期</span><b>{{ form.expectDate }}</b></div>
      </div>
      <div class="card">
        <div class="sec-head"><span class="sec-title">接下来</span></div>
        <div v-for="(s, i) in nextList" :key="s.id" class="next-item">
          <span class="nx-no">{{ i + 1 }}</span>
          <span>{{ s.goal }}（{{ ownerTextOf(s) }}）</span>
        </div>
      </div>
      <div class="footer-bar">
        <button class="approve-btn" @click="back">返回</button>
      </div>
    </div>

    <template v-else>
      <div class="content">
        <!-- 选一件事 -->
        <template v-if="!picked">
          <!-- 我的信息：档案带出，跟着发起人一起进这一单 -->
          <div class="card">
            <div class="sec-head">
              <span class="sec-title">我的信息</span>
              <span class="tag-readonly">档案带出</span>
            </div>
            <div class="info-row"><span>姓名</span><b>{{ emp.name }}</b></div>
            <div class="info-row"><span>工号</span><b>{{ emp.empNo || emp.id }}</b></div>
            <div class="info-row"><span>岗位</span><b>{{ emp.job }}</b></div>
            <div class="info-row"><span>用工类型</span><b>{{ emp.employType }}</b></div>
            <div class="info-row" v-if="emp.onboardAt"><span>入职日期</span><b>{{ emp.onboardAt }}</b></div>
            <div class="info-row" v-if="emp.store"><span>门店</span><b>{{ [emp.city, emp.store].filter(Boolean).join(' · ') }}</b></div>
          </div>

          <div class="sec-t">你能发起的事</div>
          <div v-for="e in events" :key="e.key" :class="['ev-card']" @click="pick(e)">
            <div class="ev-top"><span class="ev-name">{{ e.name }}</span></div>
            <div class="ev-desc">{{ e.desc }}</div>
            <div class="ev-entry">{{ e.trigger?.entry || '' }}</div>
          </div>
          <div v-if="!events.length" class="empty-text">当前没有你能发起的事项</div>
        </template>

        <template v-else>
          <!-- ============ 第一步：申请 ============ -->
          <template v-if="step === 1">
          <!-- 步骤条：与处理侧同一套大环节（v1 同款，只对离职这一件显示） -->
          <div v-if="picked === 'resign'" class="steps card">
            <div class="step on"><span class="step-no">1</span><span class="step-text">申请</span></div>
            <div class="step-line"></div>
            <div class="step"><span class="step-no">2</span><span class="step-text">审核</span></div>
            <div class="step-line"></div>
            <div class="step"><span class="step-no">3</span><span class="step-text">交接</span></div>
            <div class="step-line"></div>
            <div class="step"><span class="step-no">4</span><span class="step-text">签署离职合同</span></div>
          </div>

          <!-- A 离职意向（需填写）：字段与类型来自触点登记 -->
          <div class="card">
            <div class="sec-head">
              <span class="sec-title">离职意向</span>
              <span class="tag-ours">需填写</span>
            </div>
            <div v-for="p in formFields" :key="p.field" class="field">
              <label>{{ p.label }}<i v-if="p.required">*</i><span v-if="p.type === 'multi'" class="label-tip">可多选</span><span v-else-if="!p.required" class="label-tip">选填</span></label>
              <el-date-picker
                v-if="p.type === 'date'"
                v-model="form[p.field]" type="date" value-format="YYYY-MM-DD" placeholder="请选择期望的最后工作日" style="width: 100%"
              />
              <div v-else-if="p.type === 'multi'" class="reason-grid">
                <span
                  v-for="o in p.options || []" :key="o"
                  :class="['reason-chip', { on: (form[p.field] || []).includes(o) }]"
                  @click="toggleMulti(p.field, o)"
                >{{ o }}</span>
              </div>
              <el-input
                v-else-if="p.long"
                v-model="form[p.field]" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="可补充具体情况"
              />
              <el-select v-else-if="p.type === 'enum'" v-model="form[p.field]" placeholder="请选择" style="width: 100%">
                <el-option v-for="o in p.options || []" :key="o" :label="o" :value="o" />
              </el-select>
              <el-input v-else v-model="form[p.field]" :placeholder="p.placeholder || `填 ${p.label}`" />
              <div v-if="p.note" class="field-hint">{{ p.note }}</div>
            </div>
          </div>

          <!-- B 收款账户：档案带出，只读 -->
          <div class="card">
            <div class="sec-head">
              <span class="sec-title">收款账户</span>
              <span class="tag-readonly">档案带出</span>
            </div>
            <div class="info-row"><span>银行卡户名</span><b>{{ bank.holder || '—' }}</b></div>
            <div class="info-row"><span>银行卡卡号</span><b class="card-no">{{ bank.cardNo || '—' }}</b></div>
            <div class="info-row"><span>开户行</span><b>{{ bank.bankName || '—' }}</b></div>
            <div class="field-hint">最后工资与补偿金将打入此账户；若信息有误，请先到新员工关系更新。</div>
          </div>

          <!-- C 离职需求审核：审核链按配置带出（不是这单的生成结果） -->
          <div v-if="reviewers.length" class="card">
            <div class="sec-head">
              <span class="sec-title">离职需求审核</span>
              <span class="tag-readonly">按配置带出</span>
            </div>
            <div class="flow-line">
              <div class="flow-node me">
                <span class="fn-role">发起人</span>
                <span class="fn-name">{{ me.name }}</span>
              </div>
              <span class="fn-arrow">→</span>
              <div class="flow-node">
                <span class="fn-role">审核人</span>
                <span class="fn-name">{{ reviewers.join('、') }}</span>
              </div>
            </div>
            <div class="field-hint">提交后先由审核人核对；不通过将作废并通知你。</div>
          </div>

          </template>

          <!-- ============ 第二步：确认 ============ -->
          <template v-else>
            <div class="card">
              <div class="sec-head"><span class="sec-title">确认{{ ev?.name }}</span></div>
              <div v-for="p in formFields" :key="p.field" class="info-row">
                <span>{{ p.label }}</span><b class="wrap">{{ shown(p) || '—' }}</b>
              </div>
              <div class="info-row"><span>收款账户</span><b class="card-no">{{ bank.bankName }} {{ tailNo }}</b></div>
              <div v-if="reviewers.length" class="info-row"><span>审核人</span><b class="wrap">{{ reviewers.join('、') }}</b></div>
            </div>

            <div class="card">
              <div class="sec-head">
                <span class="sec-title">本人签字</span>
                <span class="tag-ours">待确认</span>
              </div>
              <div class="sign-box" :class="{ signed }" @click="sign">
                <span v-if="!signed" class="sign-placeholder">点击此处签名</span>
                <span v-else class="sign-name">{{ me.name }}</span>
              </div>
              <div class="field-hint">签名代表你确认以上信息真实、无误。</div>
              <div class="agree-row" @click="agreed = !agreed">
                <span :class="['cbox', { on: agreed }]"><el-icon v-if="agreed"><Select /></el-icon></span>
                <span class="agree-text">我已阅读并同意《离职办理须知》，确认以上信息无误</span>
              </div>
            </div>
          </template>

          <!-- 提交后：只说大致流程，不写细节（细节由定义层定，会变） -->
          <div class="card note-card">
            <div class="sec-head"><span class="sec-title">提交后</span></div>
            <div class="note-li">· 按这单的流程逐环办理，每一环谁在办、办到哪，在「事项办理」里随时能看</div>
          </div>

          <div v-if="step === 1 && missing.length" class="need-hint">还差：{{ missing.join('、') }}</div>
        </template>
      </div>

      <div class="footer-bar" v-if="picked">
        <button v-if="step === 2" class="reject-btn" @click="step = 1">返回修改</button>
        <button v-if="step === 1" class="approve-btn" :disabled="!canNext" @click="nextStep">下一步</button>
        <button v-else class="approve-btn" :disabled="!canSubmit" @click="submit">{{ picked === 'resign' ? '提交离职需求' : '提交' }}</button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Select } from '@element-plus/icons-vue'
import { v2state, createInstance, getEvent, setMe, resolveForEvent, resolveForInstance } from '../../../v2/store.js'
import { staff, ledgerOf } from '../../../v2/base.js'
import { runIntake } from '../../../v2/intake.js'
import { payloadPlanOf, payloadDefaultsOf, checkPayload, payloadTextOf } from '../../../v2/payload.js'
import { scopeHit, resolveOwner, ownerOfWay, ownerLabel, topoSort } from '../../../v2/model.js'
import { identitiesOf } from '../../../v2/instance.js'

const router = useRouter()
/** 当前登录员工：发起人的事实随单进实例，之后再查都按这一单的人 */
const me = computed(() => v2state.me || staff[0])

/** 档案：这一单的「我是谁」由引擎在生成之前取回，页面直接用那一份 */
const intake = computed(() => runIntake({ emp: me.value }))
const emp = computed(() => intake.value.emp || me.value || {})

/** 已上线的事件 —— 员工能发起什么由适用范围决定，页面上不解释范围本身 */
const activeEvents = computed(() => v2state.events.filter((e) => e.status === 'active' && e.currentVersion))
const events = computed(() => activeEvents.value.filter((e) => scopeHit(e.scope || {}, me.value)))

/**
 * 原型辅助：可切换的视角 = 全部员工 + 实例里出现过的处理人（如财务专员，演示「没有可发起事项」的状态）。
 * 顺序按演示意图排：能发起事件的人在前，轮换第一下就能看到完整表单；发不了的排在后面，用来看空态。
 */
const personaPool = computed(() => {
  const extra = identitiesOf(v2state.instances, (inst) => resolveForInstance(inst).tree)
    .filter((p) => p.name && !staff.some((s) => s.name === p.name))
  const all = [...staff, ...extra]
  const canGo = (p) => activeEvents.value.some((e) => scopeHit(e.scope || {}, p))
  return [...all.filter(canGo), ...all.filter((p) => !canGo(p))]
})
const cyclePersona = () => {
  const pool = personaPool.value
  if (!pool.length) return
  const i = pool.findIndex((p) => p.name === me.value?.name)
  setMe(pool[(i + 1) % pool.length] || null)
}
const picked = ref('')
const ev = computed(() => (picked.value ? getEvent(picked.value) : null))
const title = computed(() => (!picked.value ? '发起事项' : picked.value === 'resign' ? '离职需求' : `${ev.value?.name || ''}申请`))

const step = ref(1)
const agreed = ref(false)
const signed = ref(false)
const submitted = ref(false)
const doneInst = ref(null)

const form = reactive({})

/** 载荷字段：类型 / 必传 / 可选值全部来自触点登记；取数入参（工号）与只回看的台账格不进表单 */
const plan = computed(() => payloadPlanOf(ev.value?.trigger || {}))
const formFields = computed(() => plan.value.filter((f) => f.use !== 'intake' && !f.auto && (f.use === 'bind' || f.required) && !f.fromStaff))

/** 收款账户：档案带出，只读 */
const bank = computed(() => ledgerOf(me.value).bank || {})
const tailNo = computed(() => {
  const raw = String(bank.value.cardNo || '').replace(/\s/g, '')
  return raw ? `**** ${raw.slice(-4)}` : '—'
})

/** 取数之后才知道这一单会长几步 —— 预览和真实触发走同一个函数 */
const preview = computed(() => {
  const e = ev.value
  if (!e) return { tree: [], dropped: [] }
  return resolveForEvent(e, intake.value.emp)
})
const tree = computed(() => preview.value.tree)
const sorted = computed(() => topoSort(tree.value))
const subCount = computed(() => tree.value.length)
const mustCount = computed(() => tree.value.filter((s) => s.gate === 'must').length)
const nextList = computed(() => sorted.value.slice(0, 4))

/** 谁办：人办的写人，系统 / 外部就写系统 / 对方 */
const ownerTextOf = (s) => {
  const w = (s.ways || []).find((x) => x.type === 'human')
  if (!w) return (s.ways || []).some((x) => x.type === 'external') ? '对方系统' : '系统'
  const o = ownerOfWay(w)
  return `${resolveOwner(o, { store: me.value.store, city: me.value.city })}`
}
const firstGoal = computed(() => sorted.value[0]?.goal || '（未编排）')
const firstOwner = computed(() => (sorted.value[0] ? ownerTextOf(sorted.value[0]) : '系统'))

/**
 * 审核人 = 树里「审核通过」那几条结论的负责人，按先后去重。
 * 审核不是一种类型，所以这里按结论命名认（契约要求 goal 写成「已××通过」）；
 * 一条也没认出来就退回第一环的人办负责人，不至于空着。
 */
const reviewers = computed(() => {
  const names = sorted.value
    .filter((x) => /审核通过|审批通过/.test(x.goal || ''))
    .map((x) => {
      const w = (x.ways || []).find((y) => y.type === 'human')
      return w ? resolveOwner(ownerOfWay(w), { store: me.value.store, city: me.value.city }) : ''
    })
    .filter(Boolean)
  const uniq = [...new Set(names)]
  if (uniq.length) return uniq
  const s = sorted.value.find((x) => (x.ways || []).some((w) => w.type === 'human'))
  const w = s && (s.ways || []).find((x) => x.type === 'human')
  const name = w ? resolveOwner(ownerOfWay(w), { store: me.value.store, city: me.value.city }) : ''
  return name ? [name] : []
})

/* 确认页的值怎么显示：有就照它显示，没有就说清是「没有」而不是空着 */
const hasVal = (f) => {
  const v = form[f.field]
  if (Array.isArray(v)) return v.length > 0
  return !(v === undefined || v === null || String(v).trim() === '')
}
const shown = (f) => (hasVal(f) ? payloadTextOf(f, form[f.field]) : f.zeroLabel || '—')

const toggleMulti = (field, o) => {
  if (!Array.isArray(form[field])) form[field] = []
  const i = form[field].indexOf(o)
  if (i > -1) form[field].splice(i, 1)
  else form[field].push(o)
}

/** 第一步要填完的：登记里必传、且不是系统自动生成的 */
const missing = computed(() => formFields.value.filter((f) => f.required && !hasVal(f)).map((f) => f.label))
const canNext = computed(() => missing.value.length === 0)

const check = computed(() => checkPayload(ev.value?.trigger || {}, { ...form, applyNo: form.applyNo || 'AUTO' }))
const canSubmit = computed(() => !!ev.value && step.value === 2 && check.value.ok && agreed.value && signed.value)

function pick (e) {
  Object.keys(form).forEach((k) => delete form[k])
  // 能自动带的先带上：工号取登录身份、日期按登记默认值、台账数按工号取
  Object.assign(form, payloadDefaultsOf(e.trigger, me.value))
  picked.value = e.key
  step.value = 1
  agreed.value = false
  signed.value = false
}

/** 申请单号提交时生成：RQ + 日期 + 流水，员工不填 */
function genApplyNo () {
  const d = new Date()
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const seq = String((v2state.instances || []).length + 1).padStart(3, '0')
  return `RQ${ymd}${seq}`
}

function nextStep () {
  if (!canNext.value) {
    ElMessage.warning(`还差：${missing.value.join('、')}`)
    return
  }
  form.applyNo = genApplyNo()
  step.value = 2
}

const sign = () => {
  signed.value = true
  ElMessage.success('已签名')
}

function submit () {
  if (!canSubmit.value) return
  const inst = createInstance({ eventKey: picked.value, emp: me.value, payload: { ...form } })
  if (!inst) {
    ElMessage.error('这件事还没配提示词，触发不了')
    return
  }
  if (inst.refused) {
    ElMessage.error(`没有触发：${inst.why}`)
    return
  }
  doneInst.value = inst
  submitted.value = true
}

/** 返回：先退本页的层级（确认 → 申请 → 选事），到底了才回移动端菜单 */
function back () {
  if (submitted.value) return router.push({ name: 'v2-m-instances' })
  if (step.value === 2) { step.value = 1; return }
  if (picked.value) {
    Object.keys(form).forEach((k) => delete form[k])
    picked.value = ''
    step.value = 1
    agreed.value = false
    signed.value = false
    return
  }
  router.push('/mobile-menu')
}
</script>

<style scoped>
.m-page { min-height: 100vh; height: 100vh; overflow-y: auto; background: #f5f5f5; -webkit-overflow-scrolling: touch; padding-bottom: 76px; }
.page-header { display: flex; align-items: center; gap: 10px; padding: 14px 16px; background: #fff; position: sticky; top: 0; z-index: 20; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
.back-icon { font-size: 22px; color: #333; }
.page-header h1 { flex: 1; text-align: center; font-size: 17px; font-weight: 600; margin: 0; }
.hd-sp { width: 22px; }
.persona-hint { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 10.5px; color: #cdc7c9; letter-spacing: .3px; padding: 2px 4px; user-select: none; }
.persona-hint:active { color: #a40035; }

.content { padding: 12px 12px 20px; }
.card { background: #fff; border-radius: 12px; padding: 14px; margin-bottom: 12px; }

.sec-head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.sec-title { font-size: 15px; font-weight: 600; color: #333; }
.tag-readonly, .tag-ours { font-size: 10.5px; padding: 1px 7px; border-radius: 9px; }
.tag-readonly { color: #6b7280; background: #f3f4f6; }
.tag-ours { color: #a40035; background: #fdeef2; }

.info-row { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 7px 0; font-size: 13px; }
.info-row span { color: #999; flex-shrink: 0; }
.info-row b { color: #333; font-weight: 500; text-align: right; line-height: 1.5; }
.info-row b.wrap { line-height: 1.6; }
.info-row b.dim { color: #b9b3b5; font-weight: 400; }
.info-row b.link-v a { color: #a40035; text-decoration: underline; text-underline-offset: 2px; }
.card-no { font-family: ui-monospace, Menlo, Consolas, monospace; letter-spacing: 0.3px; font-size: 12.5px !important; }

.sec-t { font-size: 12px; color: #a3a0a1; margin: 14px 2px 8px; }

.steps { display: flex; align-items: center; gap: 5px; padding: 14px 12px; }
.step { display: flex; align-items: center; gap: 4px; }
.step-no { flex-shrink: 0; width: 18px; height: 18px; border-radius: 50%; background: #d8d4d5; color: #fff; font-size: 10.5px; display: flex; align-items: center; justify-content: center; }
.step.on .step-no { background: #a40035; }
.step-text { font-size: 12px; color: #999; white-space: nowrap; }
.step.on .step-text { color: #a40035; font-weight: 600; }
.step-line { flex: 1; min-width: 8px; height: 1.5px; background: #e6e2e3; }

.field { margin-bottom: 16px; }
.field:last-child { margin-bottom: 0; }
.field > label { display: block; font-size: 13px; font-weight: 500; color: #333; margin-bottom: 8px; }
.field label i { font-style: normal; color: #a40035; margin-left: 2px; }
.label-tip { font-size: 11px; color: #b0aaac; font-weight: 400; margin-left: 6px; }
.field-hint { font-size: 11px; color: #a3a0a1; margin-top: 8px; line-height: 1.6; }

.reason-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.reason-chip { font-size: 12.5px; color: #666; background: #f6f5f5; border: 1px solid transparent; border-radius: 15px; padding: 6px 14px; }
.reason-chip.on { color: #a40035; background: #fdeef2; border-color: #e7bcc9; font-weight: 500; }

.flow-line { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.flow-node { display: flex; flex-direction: column; align-items: center; gap: 2px; background: #f7f6f6; border-radius: 8px; padding: 6px 10px; }
.flow-node.me { background: #fdeef2; }
.fn-role { font-size: 10.5px; color: #a09a9b; }
.fn-name { font-size: 12.5px; color: #333; font-weight: 500; }
.fn-arrow { color: #ccc; font-size: 12px; }

.sign-box { height: 96px; border: 1px dashed #d9d4d5; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: #fafafa; }
.sign-box.signed { border-style: solid; border-color: #e7bcc9; background: #fdf7f9; }
.sign-placeholder { font-size: 12.5px; color: #b0aaac; }
.sign-name { font-size: 26px; color: #a40035; font-family: 'STKaiti', 'Kaiti SC', serif; letter-spacing: 3px; }

.agree-row { display: flex; gap: 8px; align-items: flex-start; margin-top: 14px; }
.cbox { width: 16px; height: 16px; border-radius: 4px; border: 1px solid #ccc; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #fff; margin-top: 1px; }
.cbox.on { background: #a40035; border-color: #a40035; }
.agree-text { font-size: 12px; color: #666; line-height: 1.6; }

.note-card { background: #fafafa; }
.note-li { font-size: 12px; color: #888; line-height: 1.9; }

.done-card { text-align: center; padding: 26px 14px; }
.done-icon { width: 52px; height: 52px; border-radius: 50%; background: #e8f5ec; color: #1a9b52; display: flex; align-items: center; justify-content: center; font-size: 26px; margin: 0 auto 12px; }
.done-title { font-size: 16px; font-weight: 600; color: #333; }
.done-sub { font-size: 12px; color: #999; margin-top: 6px; }
.waiting { color: #b45309 !important; }
.next-item { display: flex; gap: 8px; font-size: 12.5px; color: #666; line-height: 1.9; }
.nx-no { width: 16px; height: 16px; border-radius: 50%; background: #f0edee; color: #888; font-size: 10.5px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 4px; }

.ev-card { position: relative; background: #fff; border: 1px solid #eee9eb; border-radius: 12px; padding: 13px 14px; margin-bottom: 9px; }
.ev-top { display: flex; align-items: baseline; gap: 8px; }
.ev-name { font-size: 15.5px; font-weight: 600; color: #333; }
.ev-desc { font-size: 12px; color: #8a8586; line-height: 1.65; margin-top: 5px; }
.ev-entry { margin-top: 7px; font-size: 11.5px; color: #a40035; }

.need-hint { margin: 0 2px 8px; font-size: 11.5px; color: #b45309; }
.footer-bar { position: fixed; left: 0; right: 0; bottom: 0; display: flex; gap: 10px; padding: 10px 14px 16px; background: #fff; box-shadow: 0 -2px 12px rgba(0,0,0,.06); }
.reject-btn, .approve-btn { flex: 1; height: 44px; border-radius: 22px; font-size: 15px; font-weight: 600; }
.reject-btn { background: #f0edee; color: #666; border: none; }
.approve-btn { background: #a40035; color: #fff; border: none; }
.approve-btn:disabled { background: #e3ccd3; }

.empty-text { font-size: 12.5px; color: #a3a0a1; padding: 20px 2px; text-align: center; }
</style>
