<template>
  <div class="pd-home">
    <div class="page-header">
      <el-icon class="back-icon" @click="goBack"><ArrowLeft /></el-icon>
      <h1>离职需求审核</h1>
    </div>

    <div class="content">
      <!-- 流程条：与员工侧同一套大环节，最后一步都是推送离职合同 -->
      <div class="steps card">
        <div class="step on">
          <span class="step-no">1</span>
          <span class="step-text">申请</span>
        </div>
        <div class="step-line on"></div>
        <div class="step on">
          <span class="step-no">2</span>
          <span class="step-text">审核</span>
        </div>
        <div class="step-line" :class="{ on: admState === 'approved' }"></div>
        <div class="step" :class="{ on: admState === 'approved' }">
          <span class="step-no">3</span>
          <span class="step-text">交接</span>
        </div>
        <div class="step-line" :class="{ on: gate.passed }"></div>
        <div class="step" :class="{ on: gate.passed }">
          <span class="step-no">4</span>
          <span class="step-text">签署离职合同</span>
        </div>
      </div>

      <!-- ============ 待审核：离职需求审核（审核人 = 模板配置的审核链） ============ -->
      <template v-if="admState === 'pending'">
        <div class="card">
          <div class="sec-head">
            <span class="sec-title">离职需求审核</span>
            <span class="tag-manual">判断是否进入交接</span>
          </div>
          <div class="info-row"><span>发起时间</span><b>{{ c.appliedAt }}</b></div>
          <div class="info-row"><span>期望离职日期</span><b>{{ c.expectLeaveDate }}</b></div>
          <div class="info-row"><span>离职原因</span><b>{{ c.reason }}</b></div>
          <div class="info-row">
            <span>审核人</span>
            <b class="wrap">{{ reviewers.map(r => r.name + '（' + r.role + '）').join('、') }}</b>
          </div>
          <div class="field-hint">
            核对下方信息、选择实际离职日期后「确认进入交接」，处理信息就此定稿；交接全部完成后，系统将自动向员工发出离职合同。不通过则本单作废并通知员工重新发起。
          </div>
        </div>
      </template>

      <template v-else>
        <!-- 交接门禁 -->
        <div :class="['gate-strip', gateTone]" @click="gotoHandover">
          <div class="gs-main">
            <div class="gs-title">
              {{ gateTitle }}
              <span class="gs-progress">{{ gateProgress }}</span>
            </div>
            <div class="gs-note">{{ gateNote }}</div>
          </div>
          <span class="gs-go">查看 ›</span>
        </div>

        <!-- 合同自动发出状态条 -->
        <div :class="['auto-strip', gate.passed ? 'ok' : 'warn']">
          <span class="as-k">离职合同</span>
          <span class="as-v">
            {{ gate.passed ? '交接已全部完成，离职合同已自动发出，待员工在线签署' : '处理信息已确认定稿；交接全部完成后系统自动发出，无需人工再操作' }}
          </span>
        </div>
      </template>

      <!-- 员工头部 + 申请信息 -->
      <div class="card">
        <div class="emp-head">
          <div class="avatar"><el-icon><User /></el-icon></div>
          <div class="emp-main">
            <div class="emp-name">
              {{ c.name }}
              <span class="emp-no">{{ c.staffNo }}</span>
              <span class="persona-chip">{{ personaLabelOf(c) }}</span>
            </div>
            <div class="emp-sub">{{ c.gender }} | {{ c.job }} · {{ orgTextOf(c) }}</div>
          </div>
        </div>
        <div class="info-list">
          <div class="info-row"><span>申请时间</span><b>{{ c.appliedAt }}</b></div>
          <div class="info-row"><span>期望离职日期</span><b>{{ c.expectLeaveDate }} 00:00:00</b></div>
          <div class="info-row"><span>离职原因</span><b>{{ c.reason }}</b></div>
        </div>
      </div>

      <!-- 员工信息（收拢，展开才看明细） -->
      <div class="card">
        <div class="sec-head clickable" @click="empExpanded = !empExpanded">
          <span class="sec-title">员工信息</span>
          <span class="expand-toggle">
            {{ empExpanded ? '收起' : '展开明细' }}
            <el-icon><ArrowUp v-if="empExpanded" /><ArrowDown v-else /></el-icon>
          </span>
        </div>
        <div class="emp-summary">
          <span>{{ c.age }}岁</span>
          <em>·</em>
          <span>工龄 {{ c.tenureYears }} 年</span>
          <template v-if="persona === 'therapist'">
            <em>·</em>
            <span>等级 {{ c.level }}</span>
          </template>
          <em>·</em>
          <span>{{ c.hasSocialInsurance ? '已购社保' : '未购社保' }}</span>
        </div>

        <!-- 补偿金计算基数（发出合同前要用，默认可见） -->
        <div v-if="limit" class="income-strip">
          <div class="is-main">
            <span class="is-k">过去 12 个月平均收入</span>
            <b class="is-v">¥ {{ fmt(limit.avg) }}</b>
          </div>
          <div class="is-sub">
            一次性补偿金上限 <b>¥{{ fmt(limit.cap) }}</b>（月均 ¥{{ fmt(limit.avg) }} ×（N+1））
          </div>
        </div>

        <!-- 收款账户（默认显示，来源新员工关系） -->
        <div class="bank-strip">
          <div class="bank-k">收款账户<em>新员工关系</em></div>
          <div class="info-row"><span>户名</span><b>{{ bank.holder }}</b></div>
          <div class="info-row"><span>卡号</span><b class="card-no">{{ bank.cardNo }}</b></div>
          <div class="info-row"><span>开户行</span><b>{{ bank.bankName }}</b></div>
        </div>

        <div v-show="empExpanded" class="info-list">
          <div class="info-row"><span>年龄</span><b>{{ c.age }}</b></div>
          <div class="info-row"><span>工龄</span><b>{{ c.tenureYears }}</b></div>
          <div v-for="r in empRows" :key="r.k" class="info-row"><span>{{ r.k }}</span><b>{{ r.v }}</b></div>
          <template v-if="storeSide">
            <div class="info-row"><span>上月产值</span><b>{{ c.lastMonth.output }}</b></div>
            <div class="info-row"><span>上月回头率</span><b>{{ c.lastMonth.revisitRate }}</b></div>
            <div class="info-row"><span>上月预约率</span><b>{{ c.lastMonth.bookingRate }}</b></div>
            <div class="info-row"><span>上月评分</span><b>{{ c.lastMonth.score }}</b></div>
            <div class="info-row"><span>上月技术评分</span><b>{{ c.lastMonth.techScore }}</b></div>
          </template>
          <div class="info-row"><span>是否购买社保</span><b>{{ c.hasSocialInsurance ? '是' : '否' }}</b></div>
        </div>
      </div>

      <!-- ============ 剩余资产可见（本场景新增 · 只读呈现） ============ -->
      <div class="card" data-anchor="assets">
        <div class="sec-head">
          <span class="sec-title">剩余资产</span>
          <span class="tag-readonly">只读呈现</span>
        </div>
        <AssetSnapshot :snap="snap" />
      </div>

      <!-- ============ 款项出口（本场景新增） ============ -->
      <div class="card" data-anchor="payout">
        <div class="sec-head">
          <span class="sec-title">款项出口</span>
          <span :class="confirming ? 'tag-ours' : 'tag-readonly'">{{ confirming ? '确认时定稿' : '已确认定稿' }}</span>
        </div>

        <div v-for="it in items" :key="it.id" class="payout-item">
          <div class="pi-head">
            <span class="pi-name">{{ it.name }}</span>
            <span class="pi-amount">
              {{ it.amount === null ? it.unitText : (it.estimate ? '约 ¥ ' + it.amount : '¥ ' + it.amount) }}
            </span>
          </div>
          <div class="pi-note">{{ it.note }}</div>
          <div class="pi-channels">
            <div
              v-for="ch in payoutChannels"
              :key="ch.value"
              :class="['chan', { on: it.channel === ch.value }]"
              @click="pickChannel(it, ch.value)"
            >
              <span class="chan-label">{{ ch.label }}</span>
              <span class="chan-tax">{{ ch.tax }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ============ 离职补偿金录入（本场景新增） ============ -->
      <div class="card" data-anchor="comp">
        <div class="sec-head">
          <span class="sec-title">离职补偿金</span>
          <span :class="confirming ? 'tag-manual' : 'tag-readonly'">{{ confirming ? '人工录入' : '已确认定稿' }}</span>
        </div>

        <div class="field">
          <label>补偿金金额（元）</label>
          <el-input-number
            v-model="compensation.amount"
            :min="0"
            :max="limit ? limit.cap : undefined"
            :precision="2"
            :step="100"
            :disabled="!confirming"
            controls-position="right"
            style="width: 100%"
          />
          <div v-if="limit" class="field-hint">
            上限 <b>¥{{ fmt(limit.cap) }}</b>（月均 ¥{{ fmt(limit.avg) }} ×（N+1））。不允许输入负数。
          </div>
          <div v-else class="field-hint">
            上限按月均收入 ×（N+1）计算；本单未取到该员工的月均收入，请按协商结果录入并人工核对。不允许输入负数。
          </div>
          <div class="field-hint">这一笔是协商现金；与走补偿金通道的常乐豆合并后，即为签署时的<strong>预估金额</strong>（常乐豆按约数），最终金额以次月 5 日冻结余额后跑批、6 日报税后定稿为准。</div>
        </div>

        <div class="field">
          <label>
            协商协议附件
            <span v-if="needAgreement" class="req-chip">必传</span>
          </label>
          <el-upload
            v-model:file-list="agreementFiles"
            class="agreement-upload"
            :auto-upload="false"
            :limit="3"
            accept=".pdf,.jpg,.jpeg,.png"
          >
            <el-button size="small" :icon="Upload" :disabled="!confirming">选择文件</el-button>
          </el-upload>
          <div class="field-hint">
            PDF / JPG / PNG。填了补偿金金额就必须上传，作为这笔金额的依据留档（Web 端离职补偿金明细可查）。
          </div>
          <div v-if="needAgreement && !agreementFiles.length" class="field-warn">
            已填补偿金，请上传协商协议后再提交。
          </div>
        </div>

        <div class="field">
          <label>备注</label>
          <el-input
            v-model="compensation.note"
            type="textarea"
            :rows="3"
            :disabled="!confirming"
            placeholder="说明本笔协商类金额的构成与依据"
          />
        </div>
      </div>

      <!-- ============ 离职合同模板（附件预览；正本不在审核环节展示，交接完成后系统自动推送） ============ -->
      <div class="card" data-anchor="contract">
        <div class="sec-head">
          <span class="sec-title">离职合同模板</span>
          <span class="tag-readonly">附件预览</span>
        </div>
        <div class="att-row" @click="tplPreview = true">
          <el-icon class="att-icon"><Document /></el-icon>
          <span class="att-name">离职合同模板（标准版）v3.2.pdf</span>
          <span class="att-view">预览</span>
        </div>
        <div class="field-hint">合同正本不在审核环节展示；交接全部完成后由系统自动推送给员工在线签署。</div>
      </div>

      <!-- ============ 审核处理（待审核时填写，原审批内容一次定稿） ============ -->
      <div v-if="confirming" class="card" data-anchor="approve">
        <div class="sec-head">
          <span class="sec-title">确认处理</span>
          <span class="tag-manual">确认时定稿 · 交接后自动发合同</span>
        </div>

        <div class="field">
          <label>离职类型</label>
          <el-radio-group v-model="resignType">
            <el-radio v-for="t in resignTypes" :key="t.value" :value="t.value" :disabled="t.disabled">{{ t.label }}</el-radio>
          </el-radio-group>
          <div class="field-hint">被动离职由异常监控触发（解除用工），不在此选择。</div>
        </div>

        <div class="field">
          <label>实际离职日期</label>
          <el-date-picker v-model="actualLeaveDate" type="date" placeholder="请选择" style="width: 100%" />
          <div class="field-hint">确认后锁定；该日期之后的排班取消、接单截断随确认即刻生效。</div>
        </div>

        <div class="field">
          <label>离职原因（可多选）</label>
          <el-checkbox-group v-model="reasons">
            <el-checkbox v-for="r in resignReasons" :key="r" :label="r" :value="r">{{ r }}</el-checkbox>
          </el-checkbox-group>
        </div>

        <div class="field row-field">
          <label>是否黑名单</label>
          <el-radio-group v-model="blacklist">
            <el-radio :value="true">是</el-radio>
            <el-radio :value="false">否</el-radio>
          </el-radio-group>
        </div>

        <div class="impact-block">
          <div class="impact-title">确认后自动执行</div>
          <div class="impact-row">
            <span>排班取消</span>
            <b v-if="storeSide" class="danger">实际离职日期后的 {{ schedCount }} 个排班全部取消</b>
            <b v-else class="muted">不适用（总部岗位不排班）</b>
          </div>
          <div class="impact-row">
            <span>接单权限</span>
            <b v-if="storeSide">实际离职日期后截断</b>
            <b v-else class="muted">不适用（总部岗位不接单）</b>
          </div>
        </div>

        <ul class="clause-list">
          <li v-for="(cl, i) in clauses" :key="i">{{ cl }}</li>
        </ul>
        <div class="clause-tip">请确认您已理解并接受上述条款。如确定，请在下方手动输入「确认」后进行提交。</div>
        <el-input v-model="confirmText" placeholder="请输入「确认」" />

        <div v-if="!canConfirm" class="disabled-note" style="margin-top: 10px">
          提交条件：选择实际离职日期 + 输入「确认」{{ snap.bean.settled ? '' : ' + 等待余额结算完成' }}{{ needAgreement && !agreementFiles.length ? ' + 上传协商协议附件' : '' }}
        </div>
      </div>

      <!-- ============ 人事确认结果（确认后只读） ============ -->
      <div v-else class="card" data-anchor="approve">
        <div class="sec-head">
          <span class="sec-title">人事确认结果</span>
          <span class="tag-readonly">确认时定稿</span>
        </div>
        <div class="info-row"><span>离职类型</span><b>{{ resignTypeLabel }}</b></div>
        <div class="info-row"><span>实际离职日期</span><b>{{ fmtDate(confirmed.date) }}</b></div>
        <div class="info-row"><span>离职原因</span><b class="wrap">{{ (confirmed.reasons || []).join('、') || '—' }}</b></div>
        <div class="info-row"><span>是否黑名单</span><b>{{ confirmed.blacklist ? '是' : '否' }}</b></div>
        <div class="info-row">
          <span>一次性补偿金</span>
          <b>¥ {{ fmt(confirmed.comp ?? 0) }}{{ confirmed.compFiles ? '（协商协议附件 ' + confirmed.compFiles + ' 份）' : '' }}</b>
        </div>
      </div>
    </div>

    <!-- 底部操作条：待审核 = 作废 / 确认进入交接；确认后无操作（交接完成自动发合同） -->
    <div v-if="admState === 'pending'" class="footer-bar">
      <button class="reject-btn" @click="admitReject">作废并通知员工</button>
      <button class="approve-btn" :disabled="!canConfirm" @click="admitApprove">确认进入交接</button>
    </div>

    <!-- 离职合同模板附件预览 -->
    <el-dialog v-model="tplPreview" title="附件预览 · 离职合同模板（标准版）v3.2" width="86%">
      <div class="tpl-doc">
        <p class="td-title">劳动合同解除协议（模板）</p>
        <p class="td-p">甲方：__________（用人单位）　乙方：__________（员工）</p>
        <p class="td-p">一、双方于 ____ 年 __ 月 __ 日解除劳动关系，乙方最后工作日为 ____ 年 __ 月 __ 日。</p>
        <p class="td-p">二、工资、社保公积金结算至最后工作日；一次性补偿金（如有）按协商约定支付。</p>
        <p class="td-p">三、双方确认已办结工作交接、资产归还与账务结清事项。</p>
        <p class="td-p">四、本协议一式两份，自双方签署之日起生效。</p>
        <p class="td-note">（模板正文节选示意 · 原型演示）</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, User, ArrowDown, ArrowUp, Upload, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  caseOf,
  assetSnapshotOf,
  bankAccountOf,
  payoutChannels,
  payoutItemsOf,
  resignReasons,
  resignTypes,
  defaultResignType,
  personaLabelOf,
  personaOf,
  isStoreSide,
  orgTextOf,
  empRowsOf,
  scheduleCountOf,
  compLimitOf,
  approveClauses,
  approveClausesHq,
  admissionOf,
  admissionReviewersOf
} from '../../mock/mobileResignPd.js'
import AssetSnapshot from './AssetSnapshot.vue'
import { gateStatusOf, progressOf, blockerOf, roleLabel } from '../../mock/resignHandoverPd.js'

const route = useRoute()
const router = useRouter()

/* 文档截图演示：?anchor=assets|payout|comp|approve 定位到对应卡片 */
onMounted(() => {
  const anchor = route.query.anchor
  if (!anchor) return
  requestAnimationFrame(() => {
    const el = document.querySelector(`[data-anchor="${anchor}"]`)
    if (el) el.scrollIntoView({ block: 'start' })
  })
})

const c = caseOf(route.query.id)
const snap = assetSnapshotOf(c)
const bank = bankAccountOf(c)
const persona = personaOf(c)
const storeSide = isStoreSide(c)
const empRows = empRowsOf(c)
const schedCount = scheduleCountOf(c)
const limit = compLimitOf(c)
const clauses = storeSide ? approveClauses : approveClausesHq
const items = reactive(payoutItemsOf(c).map(it => ({ ...it })))

/* 离职需求审核 = 原审批内容一次定稿：确认进入交接，同时预授权「交接完成后自动发出离职合同」 */
const admState = ref(admissionOf(c))
const confirming = computed(() => admState.value === 'pending')
const reviewers = admissionReviewersOf(c)
/* 离职合同模板附件预览 */
const tplPreview = ref(false)

const empExpanded = ref(false)
const actualLeaveDate = ref(null)
const reasons = ref(c.reason ? [c.reason] : [])
const resignType = ref(defaultResignType)
const blacklist = ref(false)
const confirmText = ref('')
const agreementFiles = ref([])

const compensation = reactive({
  amount: 0,
  note: ''
})

/** 填了补偿金就必须上传协商协议（金额的依据要留档） */
const needAgreement = computed(() => compensation.amount > 0)

/* 确认后定稿的处理结果（只读回显） */
const confirmed = ref(c.confirmed || {})
const resignTypeLabel = computed(() =>
  (resignTypes.find(t => t.value === confirmed.value.type) || {}).label || '—'
)

const fmt = (n) => Number(n || 0).toLocaleString('zh-CN')
const fmtDate = (d) => (d ? String(d).slice(0, 10) : '—')

const pickChannel = (it, v) => {
  if (!confirming.value) return
  it.channel = v
  const label = payoutChannels.find(x => x.value === v).label
  ElMessage.success(`「${it.name}」出口改为：${label}`)
}

/* 交接门禁：确认后交接是唯一剩余动作，走完即自动发合同 */
const gateStatus = gateStatusOf(c.id)
const gate = computed(() => ({ passed: gateStatus === 'passed' }))
const gateProgress = computed(() => progressOf(c.id).text)
const gateTone = computed(() => ({
  passed: 'ok', running: 'warn', terminated: 'danger', 'not-started': 'muted'
}[gateStatus]))
const gateTitle = computed(() => ({
  passed: '交接已全部完成',
  running: '交接未完成',
  terminated: '交接未通过，单据已作废',
  'not-started': '交接未开始'
}[gateStatus]))
const gateNote = computed(() => {
  if (gateStatus === 'passed') return '交接已全部完成，离职合同已自动发出，等待员工在线签署。'
  if (gateStatus === 'terminated') return '本单已终止、合同不会发出。需人事处理员工欠款等遗留问题后重新发起。'
  if (gateStatus === 'not-started') return '交接清单已按模板生成（原型演示数据未含本单明细）。'
  const b = blockerOf(c.id)
  return b ? `当前卡在 ${b.owner}（${b.roleLabel}）的「${b.nodeName}」；交接全部完成后系统将自动发出离职合同。` : '等待负责人处理'
})
const gotoHandover = () => router.push({ name: 'mobile-resign-handover', query: { id: c.id } })

/* 确认条件：只看处理信息本身（交接在确认之后才走，不参与门禁） */
const canConfirm = computed(() =>
  !!actualLeaveDate.value &&
  confirmText.value.trim() === '确认' &&
  snap.bean.settled &&
  !(needAgreement.value && agreementFiles.value.length === 0)
)

const admitApprove = () => {
  if (!canConfirm.value) return
  confirmed.value = {
    type: resignType.value,
    date: actualLeaveDate.value,
    reasons: [...reasons.value],
    blacklist: blacklist.value,
    comp: compensation.amount,
    compFiles: agreementFiles.value.length
  }
  c.confirmed = confirmed.value
  c.admission = 'approved'
  admState.value = 'approved'
  ElMessage.success('已确认进入交接；交接全部完成后将自动发出离职合同（原型演示）')
}

const admitReject = () => {
  c.admission = 'rejected'
  c.status = 'void'
  ElMessage.info('本单已作废，已通知员工重新发起（原型演示）')
  setTimeout(() => router.push({ name: 'mobile-resign-pd' }), 1200)
}

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

.steps { display: flex; align-items: center; gap: 5px; padding: 14px 12px; }
.step { display: flex; align-items: center; gap: 4px; }
.step-no { flex-shrink: 0; width: 18px; height: 18px; border-radius: 50%; background: #d8d4d5; color: #fff; font-size: 10.5px; display: flex; align-items: center; justify-content: center; }
.step.on .step-no { background: #a40035; }
.step-text { font-size: 12px; color: #999; white-space: nowrap; }
.step.on .step-text { color: #a40035; font-weight: 600; }
.step-line { flex: 1; min-width: 8px; height: 1.5px; background: #e6e2e3; }
.step-line.on { background: #a40035; }

.gate-strip { display: flex; align-items: center; gap: 10px; border-radius: 12px; padding: 12px 14px; margin-bottom: 12px; border: 1px solid; }
.gate-strip.ok { background: #f2faf4; border-color: #c9e6ce; }
.gate-strip.warn { background: #fff8ec; border-color: #f3d9a8; }
.gate-strip.danger { background: #fdf0f0; border-color: #f0c8c8; }
.gate-strip.muted { background: #f5f5f5; border-color: #e6e2e3; }
.gs-main { flex: 1; min-width: 0; }
.gs-title { font-size: 13.5px; font-weight: 600; color: #333; display: flex; align-items: baseline; gap: 8px; }
.gs-progress { font-size: 11.5px; color: #888; font-weight: 400; }
.gs-note { font-size: 11.5px; color: #777; line-height: 1.6; margin-top: 4px; }
.gs-go { flex-shrink: 0; font-size: 12px; color: #a40035; }

.emp-head { display: flex; gap: 12px; align-items: center; padding-bottom: 12px; border-bottom: 1px solid #f5f5f5; margin-bottom: 10px; }
.avatar { width: 44px; height: 44px; border-radius: 50%; background: #f2f2f2; color: #bbb; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
.emp-main { flex: 1; }
.emp-name { font-size: 17px; font-weight: 600; color: #333; display: flex; align-items: baseline; gap: 8px; }
.emp-no { font-size: 12px; color: #999; font-weight: 400; }
.emp-sub { font-size: 12.5px; color: #888; margin-top: 4px; }
.persona-chip { font-size: 10.5px; font-weight: 500; color: #a40035; background: #fdeef2; border-radius: 9px; padding: 1px 7px; }

.info-list { display: flex; flex-direction: column; }
.info-row { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 7px 0; font-size: 13px; }
.info-row span { color: #999; flex-shrink: 0; }
.info-row b { color: #333; font-weight: 500; text-align: right; }
.card-no { font-family: ui-monospace, Menlo, Consolas, monospace; letter-spacing: 0.3px; font-size: 12.5px !important; }

.sec-head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.sec-head.clickable { cursor: pointer; }
.expand-toggle { margin-left: auto; display: inline-flex; align-items: center; gap: 2px; font-size: 12px; color: #a40035; }
.expand-toggle .el-icon { font-size: 13px; }
.emp-summary { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; font-size: 12.5px; color: #666; }
.emp-summary em { font-style: normal; color: #d9d4d5; }
.emp-summary + .info-list { margin-top: 10px; padding-top: 10px; border-top: 1px solid #f5f5f5; }

.income-strip { margin-top: 10px; padding: 9px 11px; background: #faf7f8; border-radius: 10px; }
.is-main { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
.is-k { font-size: 12px; color: #8a8586; }
.is-v { font-size: 15px; font-weight: 600; color: #a40035; font-variant-numeric: tabular-nums; }
.is-sub { font-size: 10.5px; color: #a3a0a1; line-height: 1.6; margin-top: 3px; }
.is-sub b { color: #a40035; font-weight: 600; }

.bank-strip { margin-top: 10px; padding-top: 10px; border-top: 1px dashed #eceaec; }
.bank-k { font-size: 12px; font-weight: 500; color: #888; margin-bottom: 2px; display: flex; align-items: center; gap: 6px; }
.bank-k em { font-style: normal; font-size: 10.5px; font-weight: 400; color: #b0aaac; background: #f3f4f6; border-radius: 8px; padding: 1px 7px; }
.sec-title { font-size: 15px; font-weight: 600; color: #333; }
.tag-readonly, .tag-ours, .tag-manual { font-size: 10.5px; padding: 1px 7px; border-radius: 9px; }
.tag-readonly { color: #6b7280; background: #f3f4f6; }
.tag-ours { color: #a40035; background: #fff0f4; border: 1px solid #f2ccd8; }
.tag-manual { color: #b45309; background: #fef3c7; }

.payout-item { border-top: 1px solid #f5f5f5; padding-top: 12px; margin-top: 12px; }
.payout-item:first-of-type { border-top: none; margin-top: 0; padding-top: 0; }
.pi-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
.pi-name { font-size: 13.5px; font-weight: 600; color: #333; }
.pi-amount { font-size: 13px; color: #a40035; font-weight: 600; }
.pi-note { font-size: 11px; color: #a3a0a1; line-height: 1.6; margin: 5px 0 8px; }
.pi-channels { display: flex; gap: 8px; }
.chan { flex: 1; border: 1px solid #e8e8e8; border-radius: 10px; padding: 9px 10px; background: #fafafa; }
.chan.on { border-color: #a40035; background: #fff5f7; }
.chan-label { display: block; font-size: 12.5px; font-weight: 600; color: #333; }
.chan.on .chan-label { color: #a40035; }
.chan-tax { display: block; font-size: 10.5px; color: #a3a0a1; margin-top: 3px; line-height: 1.5; }

.field { margin-bottom: 14px; }
.field:last-child { margin-bottom: 0; }
.field > label { display: block; font-size: 13px; font-weight: 500; color: #333; margin-bottom: 8px; }
.field-hint { font-size: 11px; color: #a3a0a1; margin-top: 6px; }
.field-hint b { color: #a40035; font-weight: 600; }

/* 离职合同模板附件行 */
.att-row { display: flex; align-items: center; gap: 8px; background: #f8f7fa; border: 1px solid #ececf0; border-radius: 10px; padding: 10px 12px; cursor: pointer; }
.att-icon { color: #a40035; font-size: 18px; }
.att-name { flex: 1; font-size: 12.5px; color: #40434a; }
.att-view { flex-shrink: 0; font-size: 12px; color: #a40035; font-weight: 600; }
.tpl-doc { padding: 2px 4px; }
.td-title { font-size: 14px; font-weight: 600; text-align: center; margin: 0 0 12px; }
.td-p { font-size: 12.5px; line-height: 1.9; color: #40434a; margin: 0; }
.td-note { font-size: 11px; color: #a3a0a1; margin-top: 12px; text-align: right; }
.req-chip { font-size: 10px; font-weight: 500; color: #b91c1c; background: #fdecec; border-radius: 8px; padding: 1px 6px; margin-left: 4px; }
.field-warn { font-size: 11px; color: #b45309; margin-top: 6px; }
.agreement-upload { margin-top: 2px; }
.row-field { display: flex; align-items: center; justify-content: space-between; }
.row-field > label { margin-bottom: 0; }

.impact-block { background: #faf9f9; border-radius: 10px; padding: 10px 12px; margin-bottom: 14px; }
.impact-title { font-size: 12px; font-weight: 500; color: #888; margin-bottom: 4px; }
.impact-row { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; padding: 4px 0; font-size: 12.5px; }
.impact-row span { color: #999; flex-shrink: 0; }
.impact-row b { color: #333; font-weight: 500; text-align: right; }
.impact-row b.danger { color: #b91c1c; }
.impact-row b.muted { color: #a3a0a1; font-weight: 400; }

.clause-list { margin: 0; padding-left: 18px; }
.clause-list li { font-size: 12.5px; color: #666; line-height: 1.9; }
.clause-tip { font-size: 11.5px; color: #a3a0a1; line-height: 1.6; margin: 10px 0; }

.disabled-note { font-size: 11.5px; color: #b45309; background: #fef7ec; border-radius: 8px; padding: 9px 12px; }

.footer-bar { position: fixed; left: 0; right: 0; bottom: 0; display: flex; gap: 10px; padding: 10px 14px 16px; background: #fff; box-shadow: 0 -2px 12px rgba(0,0,0,.06); }
.reject-btn, .approve-btn { flex: 1; height: 44px; border-radius: 22px; font-size: 15px; font-weight: 600; }
.reject-btn { background: #f0edee; color: #666; border: none; }
.approve-btn { background: #a40035; color: #fff; border: none; }
.approve-btn:disabled { background: #e3ccd3; }

.adm-actions { display: flex; gap: 10px; margin-top: 14px; }
.adm-actions .reject-btn, .adm-actions .approve-btn { height: 42px; font-size: 14px; }
.row-src { font-style: normal; display: block; font-size: 10.5px; color: #b0aaac; font-weight: 400; margin-top: 1px; }
</style>
