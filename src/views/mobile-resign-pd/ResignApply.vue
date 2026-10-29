<template>
  <div class="pd-home">
    <div class="page-header">
      <el-icon class="back-icon" @click="goBack"><ArrowLeft /></el-icon>
      <h1>离职需求</h1>
      <!-- 原型辅助：正式开发按新员工关系自动判断岗位，此处仅用于对照查看 -->
      <span
        v-if="!submitted"
        class="persona-hint"
        title="原型演示：切换岗位视角（正式开发按档案自动判断）"
        @click="cyclePersona"
      >{{ preset.label }}</span>
    </div>

    <!-- 提交成功 -->
    <div v-if="submitted" class="content">
      <div class="card done-card">
        <div class="done-icon"><el-icon><Select /></el-icon></div>
        <div class="done-title">离职需求已提交</div>
        <div class="done-sub">需求编号 {{ reqNo }}</div>
      </div>

      <div class="card">
        <div class="sec-head"><span class="sec-title">处理进度</span></div>
        <div class="info-row"><span>当前状态</span><b class="waiting">待审核</b></div>
        <div class="info-row">
          <span>审核人</span>
          <b>{{ preset.reviewers.map(r => r.name + '（' + r.role + '）').join('、') }}</b>
        </div>
        <div class="info-row">
          <span>交接</span>
          <b>审核通过后，按模板生成清单</b>
        </div>
        <div class="info-row"><span>期望离职日期</span><b>{{ form.expectLeaveDate }}</b></div>
      </div>

      <div class="card">
        <div class="sec-head"><span class="sec-title">接下来</span></div>
        <div class="next-item"><span class="nx-no">1</span><span>人事确认：核对信息、确定实际离职日期与补偿金等处理事项；不通过会作废并通知你</span></div>
        <div class="next-item"><span class="nx-no">2</span><span>进入交接：门店、财务、直属上级等按模板节点逐项确认</span></div>
        <div class="next-item"><span class="nx-no">3</span><span>交接全部完成后，系统自动向你发出离职合同（无需人工再操作）</span></div>
        <div class="next-item"><span class="nx-no">4</span><span>你在线签署离职合同</span></div>
        <div class="next-item"><span class="nx-no">5</span><span>离职当月的剩余权益由人事与你协商处理</span></div>
      </div>

      <div class="footer-bar">
        <button class="approve-btn" @click="backToHome">返回</button>
      </div>
    </div>

    <template v-else>
      <div class="content">
        <!-- 步骤条：与处理侧同一套大环节，最后一步都是推送离职合同（本页处于第 1 段） -->
        <div class="steps card">
          <div class="step on">
            <span class="step-no">1</span>
            <span class="step-text">申请</span>
          </div>
          <div class="step-line"></div>
          <div class="step">
            <span class="step-no">2</span>
            <span class="step-text">审核</span>
          </div>
          <div class="step-line"></div>
          <div class="step">
            <span class="step-no">3</span>
            <span class="step-text">交接</span>
          </div>
          <div class="step-line"></div>
          <div class="step">
            <span class="step-no">4</span>
            <span class="step-text">签署离职合同</span>
          </div>
        </div>

        <!-- ================= 第一步 ================= -->
        <template v-if="step === 1">
          <!-- A 我的信息 -->
          <div class="card">
            <div class="sec-head">
              <span class="sec-title">我的信息</span>
              <span class="tag-readonly">档案带出</span>
            </div>
            <div class="info-row"><span>姓名</span><b>{{ preset.applicant.name }}</b></div>
            <div class="info-row"><span>工号</span><b>{{ preset.applicant.staffNo }}</b></div>
            <div class="info-row"><span>岗位</span><b>{{ preset.applicant.job }}</b></div>
            <div class="info-row"><span>用工类型</span><b>{{ preset.applicant.employType }}</b></div>
            <div class="info-row"><span>入职日期</span><b>{{ preset.applicant.hireDate }}</b></div>

            <div class="diff-sep"></div>
            <div v-for="r in preset.diffRows" :key="r.k" class="info-row diff">
              <span>{{ r.k }}</span><b>{{ r.v }}</b>
            </div>
          </div>

          <!-- B 离职意向 -->
          <div class="card">
            <div class="sec-head">
              <span class="sec-title">离职意向</span>
              <span class="tag-ours">需填写</span>
            </div>

            <div class="field">
              <label>期望离职日期 <i class="req">*</i></label>
              <el-date-picker
                v-model="form.expectLeaveDate"
                type="date"
                placeholder="请选择期望的最后工作日"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </div>

            <div class="field">
              <label>离职原因 <i class="req">*</i><span class="label-tip">可多选</span></label>
              <div class="reason-grid">
                <span
                  v-for="r in resignReasons"
                  :key="r"
                  :class="['reason-chip', { on: form.reasons.includes(r) }]"
                  @click="toggleReason(r)"
                >{{ r }}</span>
              </div>
            </div>

            <div class="field">
              <label>补充说明 <span class="label-tip">选填</span></label>
              <el-input
                v-model="form.note"
                type="textarea"
                :rows="3"
                maxlength="200"
                show-word-limit
                placeholder="可补充具体情况"
              />
            </div>
          </div>

          <!-- C 收款账户 -->
          <div class="card">
            <div class="sec-head">
              <span class="sec-title">收款账户</span>
              <span class="tag-readonly">档案带出</span>
            </div>
            <div class="info-row"><span>银行卡户名</span><b>{{ preset.bank.holder }}</b></div>
            <div class="info-row"><span>银行卡卡号</span><b class="card-no">{{ preset.bank.cardNo }}</b></div>
            <div class="info-row"><span>开户行</span><b>{{ preset.bank.bankName }}</b></div>
            <div class="field-hint">最后工资与补偿金将打入此账户；若信息有误，请先到新员工关系更新。</div>
          </div>

          <!-- D 离职需求审核（复用模板配置的审核链） -->
          <div class="card">
            <div class="sec-head">
              <span class="sec-title">离职需求审核</span>
              <span class="tag-readonly">按配置带出</span>
            </div>
            <div class="flow-line">
              <div class="flow-node me">
                <span class="fn-role">发起人</span>
                <span class="fn-name">{{ preset.applicant.name }}</span>
              </div>
              <span class="fn-arrow">→</span>
              <div v-for="r in preset.reviewers" :key="r.name + r.role" class="flow-node">
                <span class="fn-role">审核人 · {{ r.role }}</span>
                <span class="fn-name">{{ r.name }}</span>
              </div>
            </div>
            <div class="field-hint">提交后先由审核人判断是否进入交接流程；不通过将作废并通知你。</div>
          </div>

          <!-- E 离职交接（按岗位带出的模板） -->
          <div class="card">
            <div class="sec-head">
              <span class="sec-title">离职交接</span>
              <span class="tag-readonly">按岗位带出</span>
            </div>

            <template v-if="handoverTpl">
              <div class="ho-tpl">
                {{ handoverTpl.name }}
                <span class="ho-ver">{{ handoverTpl.version }}</span>
              </div>
              <div v-for="(n, i) in handoverTpl.nodes" :key="n.id" class="ho-row">
                <span class="ho-no">{{ i + 1 }}</span>
                <span class="ho-name">{{ n.name }}</span>
                <span class="ho-role">{{ roleLabel(n.role) }}</span>
                <span :class="['ho-gate', n.gate]">{{ gateLabels[n.gate] }}</span>
              </div>
              <div class="field-hint">
                交接全部完成后才会进入人事审核；负责人确认时会填写说明并上传证据附件，你可以在这里看到进度。
              </div>
            </template>
            <div v-else class="field-warn">
              你所在的岗位暂未命中交接流程模板：仍可正常提交，人事确认后系统将自动推送离职合同（不经交接），并提醒人事补配模板。
            </div>
          </div>
        </template>

        <!-- ================= 第二步 ================= -->
        <template v-else>
          <div class="card">
            <div class="sec-head"><span class="sec-title">确认离职需求</span></div>
            <div class="info-row"><span>期望离职日期</span><b>{{ form.expectLeaveDate }}</b></div>
            <div class="info-row">
              <span>离职原因</span>
              <b class="wrap">{{ form.reasons.join('、') }}</b>
            </div>
            <div v-if="form.note" class="info-row">
              <span>补充说明</span>
              <b class="wrap">{{ form.note }}</b>
            </div>
            <div class="info-row"><span>收款账户</span><b class="card-no">{{ preset.bank.bankName }} {{ tailNo }}</b></div>
            <div class="info-row">
              <span>审核人</span>
              <b class="wrap">{{ preset.reviewers.map(r => r.name).join('、') }}</b>
            </div>
          </div>

          <div class="card">
            <div class="sec-head">
              <span class="sec-title">本人签字</span>
              <span class="tag-ours">待确认</span>
            </div>
            <div class="sign-box" :class="{ signed }" @click="sign">
              <span v-if="!signed" class="sign-placeholder">点击此处签名</span>
              <span v-else class="sign-name">{{ applicant.name }}</span>
            </div>
            <div class="field-hint">签名代表你确认以上信息真实、无误。</div>

            <div class="agree-row" @click="agreed = !agreed">
              <span :class="['cbox', { on: agreed }]">
                <el-icon v-if="agreed"><Select /></el-icon>
              </span>
              <span class="agree-text">我已阅读并同意《离职办理须知》，确认以上信息无误</span>
            </div>
          </div>

          <div class="card note-card">
            <div class="sec-head"><span class="sec-title">提交后</span></div>
            <div class="note-li">· 先由审核人判断是否进入交接流程；不通过将作废并通知你</div>
            <div class="note-li">· 进入交接后，负责人按模板节点逐项确认</div>
            <div class="note-li">· 交接全部完成后，系统自动向你发出离职合同，在线签署即可</div>
            <div class="note-li">· 离职当月的剩余权益由人事与你协商处理</div>
          </div>
        </template>
      </div>

      <div class="footer-bar">
        <button v-if="step === 2" class="reject-btn" @click="step = 1">返回修改</button>
        <button v-if="step === 1" class="approve-btn" :disabled="!canNext" @click="nextStep">下一步</button>
        <button v-else class="approve-btn" :disabled="!canSubmit" @click="submit">提交离职需求</button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Select } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { personaPresets, resignReasons } from '../../mock/mobileResignPd.js'
import { matchTemplate, roleLabel, gateLabels } from '../../mock/resignHandoverPd.js'

const router = useRouter()

const persona = ref('therapist')
const personaKeys = Object.keys(personaPresets)
const preset = computed(() => personaPresets[persona.value])
// 原型辅助：依次切换岗位视角，正式开发由新员工关系自动判断岗位
const cyclePersona = () => {
  const i = personaKeys.indexOf(persona.value)
  persona.value = personaKeys[(i + 1) % personaKeys.length]
}

const route = useRoute()
/* 文档截图演示：?step=2 直达签字确认；?submitted=1 直达提交后的进度 */
const step = ref(Number(route.query.step) === 2 ? 2 : 1)
const submitted = ref(route.query.submitted === '1')
const reqNo = ref(route.query.submitted === '1' ? 'RQ202610230001' : '')

/* 交接模板按岗位 / 门店 / 用工形式匹配：正式开发从档案带出，原型跟随当前视角 */
const handoverTpl = computed(() => matchTemplate({
  job: preset.value.applicant.job,
  store: preset.value.applicant.org,
  employType: preset.value.applicant.employType
}))

const form = reactive({
  expectLeaveDate: '',
  reasons: [],
  note: ''
})

const agreed = ref(false)
const signed = ref(false)

const toggleReason = (r) => {
  const i = form.reasons.indexOf(r)
  if (i > -1) form.reasons.splice(i, 1)
  else form.reasons.push(r)
}

const tailNo = computed(() => {
  const raw = preset.value.bank.cardNo.replace(/\s/g, '')
  return '**** ' + raw.slice(-4)
})

const canNext = computed(() => !!form.expectLeaveDate && form.reasons.length > 0)
const canSubmit = computed(() => agreed.value && signed.value)

const nextStep = () => {
  if (!canNext.value) {
    ElMessage.warning('请填写期望离职日期与离职原因')
    return
  }
  step.value = 2
}

const sign = () => {
  signed.value = true
  ElMessage.success('已签名（原型演示）')
}

const submit = () => {
  if (!canSubmit.value) return
  reqNo.value = 'RQ' + '20261019' + '001'
  submitted.value = true
  ElMessage.success('离职需求已提交，待审核')
}

const backToHome = () => router.push({ name: 'mobile-resign-pd' })
const goBack = () => router.back()
</script>

<style scoped>
.pd-home { min-height: 100vh; height: 100vh; overflow-y: auto; background: #f5f5f5; -webkit-overflow-scrolling: touch; padding-bottom: 76px; }
.page-header { display: flex; align-items: center; gap: 10px; padding: 14px 16px; background: #fff; position: sticky; top: 0; z-index: 20; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
.back-icon { font-size: 22px; color: #333; }
.page-header h1 { flex: 1; text-align: center; font-size: 17px; font-weight: 600; margin: 0; }
.pd-tag { font-size: 11px; color: #a40035; border: 1px solid #a40035; border-radius: 10px; padding: 1px 7px; }

.content { padding: 12px 12px 20px; }
.card { background: #fff; border-radius: 12px; padding: 14px; margin-bottom: 12px; }

.persona-hint { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 10.5px; color: #cdc7c9; letter-spacing: .3px; padding: 2px 4px; user-select: none; }
.persona-hint:active { color: #a40035; }

.diff-sep { height: 0; margin: 8px 0 2px; border-top: 1px dashed #eceaec; }
.info-row.diff span { color: #8a8586; }

.steps { display: flex; align-items: center; gap: 5px; padding: 14px 12px; }.step { display: flex; align-items: center; gap: 4px; }
.step-no { flex-shrink: 0; width: 18px; height: 18px; border-radius: 50%; background: #d8d4d5; color: #fff; font-size: 10.5px; display: flex; align-items: center; justify-content: center; }
.step.on .step-no { background: #a40035; }
.step-text { font-size: 12px; color: #999; white-space: nowrap; }
.step.on .step-text { color: #a40035; font-weight: 600; }
.step-line { flex: 1; min-width: 8px; height: 1.5px; background: #e6e2e3; }
.step-line.on { background: #a40035; }

.sec-head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.sec-title { font-size: 15px; font-weight: 600; color: #333; }
.tag-readonly, .tag-ours { font-size: 10.5px; padding: 1px 7px; border-radius: 9px; }
.tag-readonly { color: #6b7280; background: #f3f4f6; }
.tag-ours { color: #a40035; background: #fdeef2; }

.info-row { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 7px 0; font-size: 13px; }
.info-row span { color: #999; flex-shrink: 0; }
.info-row b { color: #333; font-weight: 500; text-align: right; }
.info-row b.wrap { line-height: 1.6; }
.card-no { font-family: ui-monospace, Menlo, Consolas, monospace; letter-spacing: 0.3px; font-size: 12.5px !important; }

.field { margin-bottom: 16px; }
.field:last-child { margin-bottom: 0; }
.field > label { display: block; font-size: 13px; font-weight: 500; color: #333; margin-bottom: 8px; }
.req { color: #a40035; font-style: normal; }
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
.cc-row { display: flex; gap: 8px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #f5f5f5; }
.cc-k { font-size: 12px; color: #999; flex-shrink: 0; }
.cc-v { font-size: 12px; color: #666; line-height: 1.6; }

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

.ho-tpl { font-size: 13px; font-weight: 600; color: #333; display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.ho-ver { font-size: 10px; font-weight: 400; color: #999; border: 1px solid #eceaec; border-radius: 8px; padding: 0 5px; }
.ho-row { display: flex; align-items: center; gap: 7px; padding: 6px 0; border-top: 1px dashed #f2f0f1; font-size: 12.5px; }
.ho-row:first-of-type { border-top: none; }
.ho-no { width: 15px; height: 15px; border-radius: 4px; background: #f5f5f5; color: #999; font-size: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ho-name { flex: 1; color: #333; min-width: 0; }
.ho-role { font-size: 11px; color: #999; flex-shrink: 0; }
.ho-gate { font-size: 10px; padding: 0 6px; border-radius: 8px; flex-shrink: 0; }
.ho-gate.must { color: #a40035; background: #fff0f4; border: 1px solid #f2ccd8; }
.ho-gate.optional { color: #8a8586; background: #f5f5f5; border: 1px solid #e6e2e3; }

.footer-bar { position: fixed; left: 0; right: 0; bottom: 0; display: flex; gap: 10px; padding: 10px 14px 16px; background: #fff; box-shadow: 0 -2px 12px rgba(0,0,0,.06); }
.reject-btn, .approve-btn { flex: 1; height: 44px; border-radius: 22px; font-size: 15px; font-weight: 600; }
.reject-btn { background: #f0edee; color: #666; border: none; }
.approve-btn { background: #a40035; color: #fff; border: none; }
.approve-btn:disabled { background: #e3ccd3; }
</style>
