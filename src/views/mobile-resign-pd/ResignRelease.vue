<template>
  <div class="pd-home">
    <div class="page-header">
      <el-icon class="back-icon" @click="goBack"><ArrowLeft /></el-icon>
      <h1>解除用工</h1>
    </div>

    <div class="content">
      <!-- 员工信息 -->
      <div class="card">
        <div class="emp-head">
          <div class="avatar"><el-icon><User /></el-icon></div>
          <div class="emp-main">
            <div class="emp-name">
              {{ c.name }}
              <span class="emp-no">{{ c.staffNo }}</span>
            </div>
            <div class="emp-sub">{{ c.age }}岁 | {{ c.gender }} | 工龄：{{ c.tenureYears }} 年 | 评分：{{ c.score }}</div>
            <div class="emp-sub">{{ c.job }} · {{ c.level }} · 技法 {{ c.technique }}</div>
          </div>
        </div>
        <div class="info-list">
          <div class="info-row"><span>离职类型</span><b>被动离职（异常监控触发）</b></div>
          <div class="info-row"><span>离职方式</span><b>系统离职（不走离职协议签署）</b></div>
          <div class="info-row"><span>合同门店</span><b>{{ c.store }}</b></div>
          <div class="info-row"><span>用工状态</span><b>{{ c.workState }}</b></div>
          <div class="info-row"><span>手机号</span><b>{{ c.phone }}</b></div>
          <div class="info-row"><span>监控开始</span><b>{{ c.monitorSince }}</b></div>
        </div>
        <div class="alert-row">未出勤{{ c.absentDays }}天</div>
      </div>

      <!-- 收款账户（只读，来源新员工关系） -->
      <div class="card">
        <div class="sec-head">
          <span class="sec-title">收款账户</span>
          <span class="tag-readonly">新员工关系</span>
        </div>
        <div class="info-row"><span>银行卡户名</span><b>{{ bank.holder }}</b></div>
        <div class="info-row"><span>银行卡卡号</span><b class="card-no">{{ bank.cardNo }}</b></div>
        <div class="info-row"><span>开户行</span><b>{{ bank.bankName }}</b></div>
      </div>

      <!-- 剩余资产（只读） -->
      <div class="card">
        <div class="sec-head">
          <span class="sec-title">剩余资产</span>
          <span class="tag-readonly">只读呈现</span>
        </div>
        <AssetSnapshot :snap="snap" />
      </div>

      <!-- 款项出口（补齐：本入口同样要处置资产） -->
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

      <!-- 离职补偿金（补齐：无审批入口，补偿金随解除确认一起提交） -->
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
          <div v-else class="field-hint">上限按月均收入 ×（N+1）计算；本单未取到该员工的月均收入，请按协商结果录入并人工核对。不允许输入负数。</div>
          <div class="field-hint">
            本入口<strong>不走离职协议签署</strong>：补偿金以<strong>本次解除确认提交</strong>为成立点，
            提交后进入次月 5 日余额冻结后的跑批，6 日报税后定稿；常乐豆按约数参与预估。
          </div>
        </div>

        <div class="field">
          <label>
            协商协议 / 补偿依据附件
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
            已填补偿金，请上传依据附件后再提交。
          </div>
        </div>

        <div class="field">
          <label>备注</label>
          <el-input
            v-model="compensation.note"
            type="textarea"
            :rows="3"
            placeholder="说明本笔金额的构成与依据（例：协商一致解除，补偿 N+1）"
          />
        </div>
      </div>

      <!-- 交接清单：被动离职也生成，但不阻塞解除 -->
      <div class="card">
        <div class="sec-head">
          <span class="sec-title">交接清单</span>
          <span class="tag-readonly">事后补录</span>
        </div>
        <div class="info-row"><span>套用模板</span><b>{{ hView ? hView.templateName : '未配置模板' }}</b></div>
        <div class="info-row"><span>进度</span><b>{{ hView ? hView.progress.text : '—' }}</b></div>
        <div class="aft-note">
          被动离职没有发起与审批，交接清单按岗位模板直接生成，<b>不阻塞解除</b>：
          人事可强制解除，清单转「事后补录」，由门店与财务在解除后补齐确认与证据。
        </div>
        <button class="link-btn" @click="gotoHandover">查看交接清单 ›</button>
      </div>

      <!-- 解除填写 -->
      <div class="card">
        <div class="sec-head"><span class="sec-title">解除确认</span></div>

        <div class="field">
          <label>离职事实时点</label>
          <el-date-picker v-model="leaveAt" type="date" placeholder="请选择" style="width: 100%" />
          <div class="field-hint">本入口无期望离职日期，需人事确认。</div>
        </div>

        <div class="field">
          <label>解除原因说明</label>
          <el-input v-model="remark" type="textarea" :rows="3" placeholder="例：连续未出勤 3 天，电话联系未果，按异常监控流程解除用工" />
        </div>

        <div class="field force-block">
          <div class="force-head" @click="force = !force">
            <span :class="['cbox', { on: force }]">
              <el-icon v-if="force"><Select /></el-icon>
            </span>
            <span class="force-text">强制解除（交接未完成时由人事确认）</span>
          </div>
          <el-input
            v-if="force"
            v-model="forceReason"
            type="textarea"
            :rows="2"
            placeholder="必填：说明为何不等交接完成，如「员工失联，门店已代管客户」"
          />
          <div class="field-hint">
            {{ force ? '强制解除后交接清单转事后补录：门店、财务仍要补齐确认，但不再卡住用工关系。' : '不勾选时，交接必须全部完成才能解除。' }}
          </div>
        </div>

        <ul class="clause-list">
          <li>解除后员工状态标记为离职（系统离职），不再发起离职协议签署。</li>
          <li>解除后，该时点之后的排班将全部取消（推拿师 / 客户经理均适用）。</li>
          <li>解除后员工失去接单权限。</li>
          <li><strong>资产随本次提交一并处置</strong>：款项出口与本页录入的补偿金同时生效；补偿金不走签署，<strong>以本次提交为成立点</strong>，进入次月 5 日冻结后的跑批。</li>
          <li>交接清单按岗位模板生成；强制解除时转事后补录，<strong>已确认的说明与附件只读留档</strong>。</li>
          <li>此操作不可撤销（出口与补偿金请在提交前确认）。</li>
        </ul>
        <div class="clause-tip">请确认已理解上述条款。如确定，请输入「确认」后提交。</div>
        <el-input v-model="confirmText" placeholder="请输入「确认」" />
      </div>
      <div class="disabled-note" v-if="!canSubmit">
        提交条件：确认离职事实时点 + 输入「确认」{{ needAgreement && !agreementFiles.length ? ' + 上传补偿依据附件' : '' }}{{ (handoverPassed || (force && forceReason.trim())) ? '' : ' + 勾选强制解除并填写原因' }}
      </div>
    </div>

    <div class="footer-bar">
      <button class="ghost-btn" @click="pause">暂停用工</button>
      <button class="solid-btn" :disabled="!canSubmit" @click="release">解除用工</button>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, User, Upload, Select } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  caseOf,
  assetSnapshotOf,
  bankAccountOf,
  payoutChannels,
  payoutItemsOf,
  compLimitOf
} from '../../mock/mobileResignPd.js'
import { handoverViewOf, canApprove } from '../../mock/resignHandoverPd.js'
import AssetSnapshot from './AssetSnapshot.vue'

const route = useRoute()
const router = useRouter()

const c = caseOf(route.query.id || 'rs11')
const snap = assetSnapshotOf(c)
const bank = bankAccountOf(c)
const limit = compLimitOf(c)
const items = reactive(payoutItemsOf(c).map(it => ({ ...it })))
const hView = handoverViewOf(c.id)
const handoverPassed = canApprove(c.id)

const leaveAt = ref(null)
const remark = ref('')
const confirmText = ref('')
const agreementFiles = ref([])
const force = ref(!handoverPassed)
const forceReason = ref('')

const compensation = reactive({
  amount: 0,
  note: ''
})

/** 填了补偿金就必须上传依据附件（金额的依据要留档） */
const needAgreement = computed(() => compensation.amount > 0)

const fmt = (n) => Number(n || 0).toLocaleString('zh-CN')

const pickChannel = (it, v) => {
  it.channel = v
  const label = payoutChannels.find(x => x.value === v).label
  ElMessage.success(`「${it.name}」出口改为：${label}`)
}

const canSubmit = computed(() =>
  !!leaveAt.value &&
  confirmText.value.trim() === '确认' &&
  !(needAgreement.value && agreementFiles.value.length === 0) &&
  (handoverPassed || (force.value && forceReason.value.trim()))
)

const gotoHandover = () => router.push({ name: 'mobile-resign-handover', query: { id: c.id } })

const pause = () => ElMessage.warning(`「${c.name}」已标记暂停用工（原型演示，不写库）`)
const release = () => {
  ElMessage.success('已解除用工：状态置为离职，资产处理（出口 / 补偿金）随本次提交留痕（原型演示）')
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

.emp-head { display: flex; gap: 12px; align-items: center; padding-bottom: 12px; border-bottom: 1px solid #f5f5f5; margin-bottom: 10px; }
.avatar { width: 44px; height: 44px; border-radius: 50%; background: #f2f2f2; color: #bbb; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
.emp-main { flex: 1; min-width: 0; }
.emp-name { font-size: 17px; font-weight: 600; color: #333; display: flex; align-items: baseline; gap: 8px; }
.emp-no { font-size: 12px; color: #999; font-weight: 400; }
.emp-sub { font-size: 12px; color: #888; margin-top: 4px; line-height: 1.5; }

.info-list { display: flex; flex-direction: column; }
.info-row { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 7px 0; font-size: 13px; }
.info-row span { color: #999; flex-shrink: 0; }
.info-row b { color: #333; font-weight: 500; text-align: right; }
.card-no { font-family: ui-monospace, Menlo, Consolas, monospace; letter-spacing: 0.3px; font-size: 12.5px !important; }
.alert-row { margin-top: 10px; font-size: 12.5px; color: #b45309; background: #fef7ec; border-radius: 8px; padding: 8px 10px; }

.sec-head { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.sec-title { font-size: 15px; font-weight: 600; color: #333; }
.tag-readonly { font-size: 10.5px; padding: 1px 7px; border-radius: 9px; }
.tag-readonly { color: #6b7280; background: #f3f4f6; }
.tag-ours, .tag-manual { font-size: 10.5px; padding: 1px 7px; border-radius: 9px; }
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

.field-hint b { color: #a40035; font-weight: 600; }
.req-chip { font-size: 10px; font-weight: 500; color: #b91c1c; background: #fdecec; border-radius: 8px; padding: 1px 6px; margin-left: 4px; }
.field-warn { font-size: 11px; color: #b45309; margin-top: 6px; }
.agreement-upload { margin-top: 2px; }

.disabled-note { font-size: 11.5px; color: #b45309; background: #fef7ec; border-radius: 8px; padding: 9px 12px; margin-bottom: 4px; }

.field { margin-bottom: 14px; }
.field > label { display: block; font-size: 13px; font-weight: 500; color: #333; margin-bottom: 8px; }
.field-hint { font-size: 11px; color: #a3a0a1; margin-top: 6px; line-height: 1.6; }

.clause-list { margin: 0 0 0; padding-left: 18px; }
.clause-list li { font-size: 12.5px; color: #666; line-height: 1.9; }
.clause-tip { font-size: 11.5px; color: #a3a0a1; line-height: 1.6; margin: 10px 0; }

.aft-note { font-size: 11.5px; color: #8a8586; line-height: 1.7; background: #fafafa; border-radius: 8px; padding: 9px 11px; margin-top: 8px; }
.aft-note b { color: #a40035; font-weight: 600; }
.link-btn { margin-top: 10px; width: 100%; height: 34px; border-radius: 17px; border: 1px solid #f2ccd8; background: #fffafb; color: #a40035; font-size: 12.5px; }

.force-block { background: #faf9f9; border-radius: 10px; padding: 10px 12px; }
.force-head { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.cbox { width: 17px; height: 17px; border-radius: 4px; border: 1px solid #d9d4d5; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #fff; background: #fff; }
.cbox.on { background: #a40035; border-color: #a40035; }
.force-text { font-size: 12.5px; color: #333; }

.footer-bar { position: fixed; left: 0; right: 0; bottom: 0; display: flex; gap: 10px; padding: 10px 14px 16px; background: #fff; box-shadow: 0 -2px 12px rgba(0,0,0,.06); }
.ghost-btn, .solid-btn { flex: 1; height: 44px; border-radius: 22px; font-size: 15px; font-weight: 600; }
.ghost-btn { background: #f0edee; color: #666; border: none; }
.solid-btn { background: #a40035; color: #fff; border: none; }
.solid-btn:disabled { background: #e3ccd3; }
</style>
