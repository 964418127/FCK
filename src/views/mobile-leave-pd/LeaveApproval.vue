<template>
  <div class="pd-approve">
    <div class="page-header">
      <el-icon class="back-icon" @click="goBack"><ArrowLeft /></el-icon>
      <h1>假期审批</h1>
      <!-- 原型辅助：正式开发按申请人的区域 / 部门归属自动路由审批人，此处仅用于对照查看 -->
      <span
        class="persona-hint"
        :title="approver.note"
        @click="cycleApproverView"
      >{{ approver.scopeLabel }}</span>
    </div>

    <div class="content">
      <div class="filter-bar">
        <span
          v-for="s in statusOptions"
          :key="s.value"
          :class="['f-chip', { on: status === s.value }]"
          @click="status = s.value"
        >
          {{ s.label }}<i v-if="s.value === 'pending' && pendingNum" class="chip-badge">{{ pendingNum }}</i>
        </span>
      </div>

      <div class="count-text">
        共 {{ list.length }} 条<template v-if="status === 'pending'"> · 自动审核的假种不进列表，这里只有人工审批的单据</template>
      </div>

      <div v-if="list.length" class="rec-list">
        <div v-for="r in list" :key="r.id" class="rec-card" @click="open(r)">
          <div class="rec-top">
            <div class="rec-left">
              <span class="rec-name">{{ empOf(r.empId).name }}</span>
              <span class="type-tag">{{ r.typeName }}</span>
            </div>
            <span :class="['st', r.status]">{{ statusLabel(r.status) }}</span>
          </div>
          <div class="rec-meta-line">{{ empOf(r.empId).job }} · {{ empOf(r.empId).org === '总部' ? '总部' : empOf(r.empId).store }}</div>

          <div class="rec-line">
            <span class="rec-date">{{ r.date }}{{ r.dateEnd ? ' ~ ' + r.dateEnd : '' }} · {{ durationText(r) }}</span>
            <span class="rec-submitted">提交于 {{ r.submittedAt.split(' ')[0] }}</span>
          </div>

          <div v-if="r.status === 'pending' && r.proofAttached === false" class="rule-hint">
            <span class="hint-tag danger">凭证未上传</span>
          </div>

          <div v-if="r.rejectReason" class="reject-line">驳回原因：{{ r.rejectReason }}</div>
        </div>
      </div>
      <div v-else class="empty-text">该状态下没有单据</div>
    </div>

    <!-- 审批详情抽屉 -->
    <el-drawer v-model="drawer" size="88%" direction="btt" :with-header="false">
      <div v-if="d" class="detail">
        <div class="detail-head">
          <div>
            <div class="detail-title">{{ d.record.typeName }}</div>
            <div class="detail-sub">{{ d.emp.name }} · {{ d.emp.job }} · {{ d.emp.org === '总部' ? '总部' : d.emp.store }}</div>
          </div>
          <span :class="['st', d.record.status]">{{ statusLabel(d.record.status) }}</span>
        </div>

        <div class="detail-sec">申请信息</div>
        <div class="detail-rows">
          <div class="d-row"><span class="d-key">休假日期</span><span class="d-val">{{ d.record.date }}{{ d.record.dateEnd ? ' ~ ' + d.record.dateEnd : '' }}</span></div>
          <div class="d-row"><span class="d-key">时长</span><span class="d-val">{{ durationText(d.record) }}</span></div>
          <div class="d-row"><span class="d-key">提交时间</span><span class="d-val">{{ d.record.submittedAt }}</span></div>
          <div class="d-row">
            <span class="d-key">凭证</span>
            <span :class="['d-val', { 'val-danger': needProof && d.record.proofAttached === false }]">
              <template v-if="!needProof">无需凭证</template>
              <template v-else-if="d.record.proofAttached">
                已上传（{{ d.record.proofType || d.proofText }}）
                <el-button v-if="d.record.proofFile" link type="primary" size="small" @click="viewProof">查看凭证</el-button>
              </template>
              <template v-else>未上传 ⚠</template>
            </span>
          </div>
        </div>

        <div class="detail-sec">命中的审核规则</div>
        <div class="rule-box">
          <div class="rule-row">
            <span class="r-key">审批方式</span>
            <span class="r-val">
              <span :class="['mode-tag', d.values && d.values.autoApprove ? 'auto' : 'manual']">
                {{ d.values && d.values.autoApprove ? '自动审核' : '人工审核' }}
              </span>
              <i class="r-note">{{ ruleDimensionText }}</i>
            </span>
          </div>
          <div class="rule-row">
            <span class="r-key">本单审批人</span>
            <span class="r-val">{{ approverText }}</span>
          </div>
          <!-- 病假这类事出突然的假种没有「提前申请期」概念，要求为 0 时不显示该行 -->
          <div v-if="d.values && d.values.advanceDays > 0" class="rule-row">
            <span class="r-key">提前申请期</span>
            <span class="r-val">
              要求 {{ d.values.advanceDays }} 天，本次提前 {{ Math.max(d.advanceDiff, 0) }} 天
              <i :class="['r-ok', advanceOk ? 'yes' : 'no']">{{ advanceOk ? '✓ 达标' : '✗ 不达标' }}</i>
            </span>
          </div>
          <div class="rule-row">
            <span class="r-key">凭证要求</span>
            <span class="r-val">{{ d.proofText || '无' }}</span>
          </div>
        </div>

        <div class="detail-sec">余额与本次扣除</div>
        <div class="bal-list">
          <div v-for="b in d.balances" :key="b.schemeId" class="bal-row">
            <span class="bal-name">{{ b.leaveType }}</span>
            <span class="bal-nums">
              <!-- 按需假种：这里说的是员工当前要请的这单，直接显示本次扣多少 -->
              <template v-if="b.ondemand">
                <i v-if="deductText(b)" class="bal-deduct">{{ deductText(b) }}</i>
                <template v-else>按需</template>
              </template>
              <template v-else>
                {{ b.used }} / {{ b.amount }} {{ b.unit }} · 余 {{ b.remain }}
                <i v-if="deductText(b)" class="bal-deduct">{{ deductText(b) }}</i>
              </template>
            </span>
          </div>
        </div>
        <div v-if="excessLines.length" class="chain">
          <template v-for="(t, i) in excessLines" :key="i">
            <span v-if="i" class="chain-arrow">→</span>
            <span class="chain-tag excess">超出 {{ t.amount }}{{ t.unit }}<i v-if="t.note" class="tag-note">{{ t.note }}</i></span>
          </template>
        </div>

        <div v-if="d.record.rejectReason" class="reject-box">驳回原因：{{ d.record.rejectReason }}</div>

        <div v-if="d.record.status === 'pending'" class="detail-actions">
          <el-button class="act-btn reject" @click="openReject">驳回</el-button>
          <el-button class="act-btn approve" @click="doApprove">通过</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 驳回原因 -->
    <el-dialog v-model="rejectDialog" title="驳回原因（必填）" width="82%">
      <el-input
        v-model="rejectReason"
        type="textarea"
        :rows="3"
        maxlength="100"
        show-word-limit
        placeholder="写清驳回原因，员工侧可见"
      />
      <template #footer>
        <el-button @click="rejectDialog = false">取消</el-button>
        <el-button type="primary" :disabled="!rejectReason.trim()" @click="doReject">确认驳回</el-button>
      </template>
    </el-dialog>

    <!-- 查看凭证 -->
    <el-dialog v-model="proofDialog" title="查看凭证" width="82%">
      <img v-if="proofSrc" :src="proofSrc" alt="凭证材料" class="proof-img" />
      <div class="proof-tip">原型演示样张 · 正式环境支持放大 / 下载</div>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  approvers,
  currentApprover,
  cycleApprover,
  approverOfRecord,
  approvalListOf,
  pendingCount,
  approvalDetailOf,
  approveRecord,
  rejectRecord,
  empOf,
  statusLabel,
  recordStatusOptions
} from '../../mock/mobileLeavePd.js'

const router = useRouter()

/* 审批人视角：区域人事审门店岗、部门设置的审批人审总部岗；
   原型用右上角小灰字切换对照，正式开发按申请人归属自动路由 */
const approver = ref(currentApprover())
const cycleApproverView = () => {
  approver.value = cycleApprover()
}

const statusOptions = [
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已拒绝' },
  { value: 'all', label: '全部' }
]
const status = ref('pending')

/* records 是 mock 里的响应源：切换筛选时重新拉取，保证动作后列表刷新 */
const list = computed(() => approvalListOf(status.value, approver.value.id))
const pendingNum = computed(() => pendingCount(approver.value.id))

const durationText = (r) => {
  const bits = []
  if (r.days) bits.push(`${r.days} 天`)
  if (r.hours) bits.push(`${r.hours} 小时`)
  return bits.join(' / ') || '—'
}

/* 列表卡片保持干净：审批方式 / 命中维度等规则细节只在详情里看；凭证未上传例外，需要提前预警 */

/* ---------- 详情 ---------- */
const drawer = ref(false)
const d = ref(null)
const open = (r) => {
  d.value = approvalDetailOf(r)
  drawer.value = true
}

const needProof = computed(() => !!(d.value && d.value.values && d.value.values.proofTypes && d.value.values.proofTypes.length))
const advanceOk = computed(() => d.value && d.value.advanceDiff >= (d.value.values ? d.value.values.advanceDays : 0))
const ruleDimensionText = computed(() => {
  if (!d.value) return ''
  if (d.value.ruleDimension === 'store') return '命中门店差异化条目'
  if (d.value.ruleDimension === 'city') return '命中城市差异化条目'
  return '命中基础规则'
})

/* 本单按管理结构应由谁审：门店岗 → 区域人事经理；总部岗 → 部门设置指定审批人 */
const approverText = computed(() => {
  if (!d.value) return '—'
  const a = approverOfRecord(d.value.record)
  return a ? `${a.name}（${a.role} · ${a.scopeLabel}）` : '未配置'
})

/* 本次扣多少：直接标在对应假种的余额行上，不再单独铺标签 */
const deductText = (b) => {
  if (!d.value) return ''
  const lines = (d.value.record.deduction || []).filter(t => t.schemeId === b.schemeId)
  if (!lines.length) return ''
  const total = +lines.reduce((s, t) => s + t.amount, 0).toFixed(2)
  return `本次扣 ${total}${b.unit}`
}
/* 超出段（无方案挂接）仍单独提示 */
const excessLines = computed(() => (d.value ? (d.value.record.deduction || []).filter(t => !t.schemeId) : []))

/* ---------- 动作 ---------- */
const rejectDialog = ref(false)
const rejectReason = ref('')

/* 查看凭证 */
const proofDialog = ref(false)
const proofSrc = ref('')
const viewProof = () => {
  proofSrc.value = d.value.record.proofFile || ''
  proofDialog.value = true
}

const openReject = () => {
  rejectReason.value = ''
  rejectDialog.value = true
}
const doReject = async () => {
  rejectRecord(d.value.record.id, rejectReason.value.trim())
  rejectDialog.value = false
  d.value = { ...d.value, record: { ...d.value.record, status: 'rejected', rejectReason: rejectReason.value.trim() } }
  ElMessage.success('已驳回，员工侧可见原因')
}
const doApprove = async () => {
  try {
    const tip = needProof.value && d.value.record.proofAttached === false
      ? '该假种要求凭证，但员工未上传凭证。确定仍要通过吗？'
      : '通过后额度立即扣减、缺岗信号交付排班调度。确定通过吗？'
    await ElMessageBox.confirm(tip, '确认通过', {
      confirmButtonText: '确定通过',
      cancelButtonText: '再想想',
      type: 'warning'
    })
    approveRecord(d.value.record.id)
    d.value = { ...d.value, record: { ...d.value.record, status: 'approved' } }
    ElMessage.success('已通过')
  } catch (e) {
    /* 取消 */
  }
}

/* 假期审批是移动端桌面的一级入口，返回回桌面（与请假首页 / 离职处理一致） */
const goBack = () => router.push('/mobile-menu')
</script>

<style scoped>
.pd-approve { min-height: 100vh; height: 100vh; overflow-y: auto; background: #f5f5f5; -webkit-overflow-scrolling: touch; }
.page-header { display: flex; align-items: center; gap: 10px; padding: 14px 16px; background: #fff; position: sticky; top: 0; z-index: 20; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
.back-icon { font-size: 22px; color: #333; }
.page-header h1 { flex: 1; text-align: center; font-size: 17px; font-weight: 600; margin: 0; }
.content { padding: 12px; }

.card { background: #fff; border-radius: 12px; padding: 14px; margin-bottom: 12px; }
.persona-hint { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 10.5px; color: #cdc7c9; letter-spacing: .3px; padding: 2px 4px; user-select: none; }
.persona-hint:active { color: #a40035; }

.filter-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
.f-chip { font-size: 12px; padding: 5px 12px; border-radius: 14px; background: #fff; border: 1px solid #e5e7eb; color: #666; display: inline-flex; align-items: center; gap: 5px; }
.f-chip.on { color: #a40035; border-color: #a40035; background: #fff0f4; font-weight: 600; }
.chip-badge { font-style: normal; font-size: 10.5px; background: #a40035; color: #fff; border-radius: 8px; padding: 0 5px; line-height: 1.5; }
.count-text { font-size: 12px; color: #999; margin-bottom: 8px; }

.rec-list { display: flex; flex-direction: column; gap: 10px; }
.rec-card { background: #fff; border-radius: 12px; padding: 12px 14px; }
.rec-top { display: flex; align-items: center; justify-content: space-between; }
.rec-left { display: flex; align-items: center; gap: 8px; min-width: 0; }
.rec-name { font-size: 15px; font-weight: 600; color: #333; }
.rec-meta-line { font-size: 11.5px; color: #999; margin-top: 3px; }
.rec-line { display: flex; align-items: center; justify-content: space-between; margin-top: 6px; }
.type-tag { font-size: 12px; padding: 3px 10px; border-radius: 12px; background: #fff0f4; color: #a40035; border: 1px solid #f5c2d1; font-weight: 600; white-space: nowrap; }
.rec-dur { font-size: 12px; color: #a40035; font-weight: 600; }
.rec-date { font-size: 12.5px; color: #555; }
.rec-submitted { font-size: 11px; color: #bbb; }

.rule-hint { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
.hint-tag.danger { font-style: normal; font-size: 11px; padding: 2px 9px; border-radius: 10px; background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
.reject-line { margin-top: 8px; font-size: 11.5px; color: #b91c1c; }

.st { font-size: 11px; padding: 2px 8px; border-radius: 10px; white-space: nowrap; }
.st.pending { color: #b45309; background: #fef3c7; }
.st.approved { color: #15803d; background: #dcfce7; }
.st.rejected { color: #b91c1c; background: #fee2e2; }

.empty-text { font-size: 13px; color: #999; text-align: center; padding: 30px 0; }

.detail { padding: 4px 2px 10px; }
.detail-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 4px; }
.detail-title { font-size: 17px; font-weight: 600; color: #333; }
.detail-sub { font-size: 12px; color: #999; margin-top: 3px; }
.detail-sec { font-size: 13px; font-weight: 600; color: #333; margin: 15px 0 9px; }
.detail-rows { background: #fafafa; border-radius: 10px; padding: 10px 12px; }
.d-row { display: flex; align-items: center; justify-content: space-between; padding: 5px 0; }
.d-key { font-size: 13px; color: #999; }
.d-val { font-size: 13px; color: #333; }
.val-danger { color: #b91c1c; font-weight: 600; }

.rule-box { background: #fafafa; border-radius: 10px; padding: 10px 12px; }
.rule-row { display: flex; align-items: flex-start; justify-content: space-between; padding: 5px 0; gap: 12px; }
.r-key { font-size: 13px; color: #999; white-space: nowrap; }
.r-val { font-size: 12.5px; color: #333; text-align: right; }
.r-note { font-style: normal; font-size: 11px; color: #999; margin-left: 6px; }
.mode-tag { font-style: normal; font-size: 11px; padding: 1px 8px; border-radius: 10px; }
.mode-tag.auto { color: #15803d; background: #dcfce7; }
.mode-tag.manual { color: #b45309; background: #fef3c7; }
.r-ok { font-style: normal; font-size: 11px; margin-left: 4px; font-weight: 600; }
.r-ok.yes { color: #15803d; }
.r-ok.no { color: #b91c1c; }

.bal-list { display: flex; flex-direction: column; gap: 5px; margin-bottom: 10px; }
.bal-row { display: flex; align-items: center; justify-content: space-between; background: #fff; border: 1px solid #f0f0f0; border-radius: 9px; padding: 7px 12px; }
.bal-name { font-size: 12.5px; color: #444; font-weight: 600; }
.bal-nums { font-size: 12px; color: #888; }
.bal-deduct { font-style: normal; font-size: 11px; color: #a40035; background: #fff0f4; border-radius: 8px; padding: 1px 6px; margin-left: 6px; }

.chain { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; }
.chain-tag { font-size: 11px; padding: 3px 9px; border-radius: 11px; background: #fff0f4; color: #a40035; border: 1px solid #f5c2d1; }
.chain-tag.excess { background: #fef3c7; color: #b45309; border-color: #fde68a; }
.chain-arrow { font-size: 11px; color: #bbb; }
.tag-note { font-style: normal; margin-left: 4px; opacity: .75; }

.reject-box { margin-top: 14px; padding: 10px 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; font-size: 12px; color: #b91c1c; }
.detail-actions { margin-top: 18px; display: flex; gap: 10px; }
.act-btn { flex: 1; }
.act-btn.reject { color: #b91c1c; border-color: #fecaca; }
.act-btn.approve { background: #a40035; border-color: #a40035; color: #fff; }

.proof-img { width: 100%; border-radius: 8px; border: 1px solid #eee; display: block; }
.proof-tip { margin-top: 8px; font-size: 11px; color: #bbb; text-align: center; }
</style>
