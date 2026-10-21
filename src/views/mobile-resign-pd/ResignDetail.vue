<template>
  <div class="pd-home">
    <div class="page-header">
      <el-icon class="back-icon" @click="goBack"><ArrowLeft /></el-icon>
      <h1>离职申请详情</h1>
    </div>

    <div class="content">
      <!-- 流程条 -->
      <div class="steps card">
        <div class="step on">
          <span class="step-no">1</span>
          <span class="step-text">离职审批</span>
        </div>
        <div class="step-line" :class="{ on: stepDone }"></div>
        <div class="step" :class="{ on: stepDone }">
          <span class="step-no">2</span>
          <span class="step-text">意见填写</span>
        </div>
      </div>

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

        <!-- 补偿金计算基数（审批决策要用，默认可见） -->
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
      <div class="card">
        <div class="sec-head">
          <span class="sec-title">剩余资产</span>
          <span class="tag-readonly">只读呈现</span>
        </div>
        <AssetSnapshot :snap="snap" />
      </div>

      <!-- ============ 款项出口（本场景新增） ============ -->
      <div class="card">
        <div class="sec-head">
          <span class="sec-title">款项出口</span>
          <span class="tag-ours">本流程提供</span>
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
      <div class="card">
        <div class="sec-head">
          <span class="sec-title">离职补偿金</span>
          <span class="tag-manual">人工录入</span>
        </div>

        <div class="field">
          <label>补偿金金额（元）</label>
          <el-input-number
            v-model="compensation.amount"
            :min="0"
            :max="limit ? limit.cap : undefined"
            :precision="2"
            :step="100"
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
            <el-button size="small" :icon="Upload">选择文件</el-button>
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
            placeholder="说明本笔协商类金额的构成与依据"
          />
        </div>
      </div>

      <!-- ============ 审批填写 ============ -->
      <div class="card">
        <div class="sec-head"><span class="sec-title">审批填写</span></div>

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
          <div class="field-hint">一旦审批通过，该日期将被锁定、无法更改。</div>
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
      </div>

      <!-- 审批确认 -->
      <div class="card">
        <div class="sec-head"><span class="sec-title">审批确认</span></div>

        <div class="impact-block">
          <div class="impact-title">审批通过后自动执行</div>
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
      </div>

      <div class="disabled-note" v-if="!canSubmit">
        提交条件：选择实际离职日期 + 输入「确认」{{ snap.bean.settled ? '' : ' + 等待负工资结算完成' }}{{ needAgreement && !agreementFiles.length ? ' + 上传协商协议附件' : '' }}
      </div>
    </div>

    <!-- 底部操作条 -->
    <div class="footer-bar">
      <button class="reject-btn" @click="reject">拒绝</button>
      <button class="approve-btn" :disabled="!canSubmit" @click="approve">同意，并发送离职协议</button>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, User, ArrowDown, ArrowUp, Upload } from '@element-plus/icons-vue'
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
  approveClausesHq
} from '../../mock/mobileResignPd.js'
import AssetSnapshot from './AssetSnapshot.vue'

const route = useRoute()
const router = useRouter()

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

const stepDone = ref(false)
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

const fmt = (n) => Number(n || 0).toLocaleString('zh-CN')

const pickChannel = (it, v) => {
  it.channel = v
  const label = payoutChannels.find(x => x.value === v).label
  ElMessage.success(`「${it.name}」出口改为：${label}`)
}

const canSubmit = computed(() =>
  !!actualLeaveDate.value &&
  confirmText.value.trim() === '确认' &&
  snap.bean.settled &&
  !(needAgreement.value && agreementFiles.value.length === 0)
)

const reject = () => {
  ElMessage.info('已拒绝该离职申请（原型演示）')
  router.back()
}

const approve = () => {
  stepDone.value = true
  ElMessage.success('已同意，并发送离职协议（原型演示）')
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

.steps { display: flex; align-items: center; gap: 8px; padding: 14px 18px; }
.step { display: flex; align-items: center; gap: 6px; }
.step-no { width: 20px; height: 20px; border-radius: 50%; background: #d8d4d5; color: #fff; font-size: 11px; display: flex; align-items: center; justify-content: center; }
.step.on .step-no { background: #a40035; }
.step-text { font-size: 13px; color: #999; }
.step.on .step-text { color: #a40035; font-weight: 600; }
.step-line { flex: 1; height: 1.5px; background: #e6e2e3; }
.step-line.on { background: #a40035; }

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
</style>
