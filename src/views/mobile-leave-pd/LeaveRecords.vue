<template>
  <div class="pd-records">
    <div class="page-header">
      <el-icon class="back-icon" @click="goBack"><ArrowLeft /></el-icon>
      <h1>休假记录</h1>
    </div>

    <div class="content">
      <div class="card who">
        <span class="who-name">{{ emp.name }}</span>
        <span class="who-meta">{{ emp.job }}</span>
        <span class="who-meta">{{ emp.store }}</span>
        <span class="who-meta">{{ emp.staffNo }}</span>
      </div>

      <div class="filter-bar">
        <span
          v-for="s in statusOptions"
          :key="s.value"
          :class="['f-chip', { on: status === s.value }]"
          @click="status = s.value"
        >
          {{ s.label }}
        </span>
      </div>

      <div class="count-text">共 {{ list.length }} 条</div>

      <div v-if="list.length" class="rec-list">
        <div v-for="r in list" :key="r.id" class="rec-card" @click="open(r)">
          <div class="rec-top">
            <div class="rec-left">
              <span class="rec-type">{{ r.typeName }}</span>
            </div>
            <span :class="['st', r.status]">{{ statusLabel(r.status) }}</span>
          </div>

          <div class="rec-line">
            <span class="rec-date">{{ r.date }}{{ r.dateEnd ? ' ~ ' + r.dateEnd : '' }}</span>
            <span class="rec-dur">{{ durationText(r) }}</span>
          </div>

          <div class="chain">
            <template v-for="(d, i) in r.deduction" :key="i">
              <span v-if="i" class="chain-arrow">→</span>
              <span :class="['chain-tag', { excess: !d.schemeId }]">
                {{ d.schemeId ? d.schemeName.split(' · ')[0] : '超出' }} {{ d.amount }}{{ d.unit }}
              </span>
            </template>
          </div>
        </div>
      </div>
      <div v-else class="empty-text">该状态下没有记录</div>
    </div>

    <!-- 详情抽屉 -->
    <el-drawer v-model="drawer" size="86%" direction="btt" :with-header="false">
      <div v-if="current" class="detail">
        <div class="detail-head">
          <span class="detail-title">{{ current.typeName }}</span>
          <span :class="['st', current.status]">{{ statusLabel(current.status) }}</span>
        </div>

        <div class="detail-rows">
          <div class="d-row"><span class="d-key">休假日期</span><span class="d-val">{{ current.date }}{{ current.dateEnd ? ' ~ ' + current.dateEnd : '' }}</span></div>
          <div class="d-row"><span class="d-key">时长</span><span class="d-val">{{ durationText(current) }}</span></div>
          <div class="d-row"><span class="d-key">提交时间</span><span class="d-val">{{ current.submittedAt }}</span></div>
        </div>

        <div class="detail-sec">扣减明细</div>
        <div class="chain big">
          <template v-for="(d, i) in current.deduction" :key="i">
            <span v-if="i" class="chain-arrow">→</span>
            <span :class="['chain-tag', { excess: !d.schemeId }]">
              {{ d.schemeName.split(' · ')[0] }} {{ d.amount }}{{ d.unit }}<i v-if="d.note" class="tag-note">{{ d.note }}</i>
            </span>
          </template>
        </div>

        <div class="detail-sec">审批流转</div>
        <div class="flow-list">
          <div v-for="(n, i) in flow" :key="i" class="flow-node">
            <span class="flow-dot" :class="n.status"></span>
            <div class="flow-main">
              <div class="flow-head">
                <span class="flow-title">{{ n.people.join('、') }}</span>
                <span :class="['flow-st', n.status]">{{ flowLabel(n.status) }}</span>
              </div>
              <i v-if="n.mode === 'any'" class="flow-mode">同节点多人 · 任一人处理</i>
            </div>
          </div>
        </div>

        <div v-if="current.rejectReason" class="reject-box">拒绝原因：{{ current.rejectReason }}</div>

        <div v-if="canWithdraw" class="detail-actions">
          <el-button class="wd-btn" @click="withdraw">撤假</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  currentEmployee,
  recordsOf,
  statusLabel,
  recordStatusOptions,
  approvalFlowOf,
  setCurrentEmpId
} from '../../mock/mobileLeavePd.js'

const router = useRouter()
const route = useRoute()
const emp = currentEmployee()
setCurrentEmpId(emp.id)

const statusOptions = recordStatusOptions
const status = ref('all')

const all = ref(recordsOf(emp.id, 'all'))
const list = computed(() =>
  status.value === 'all' ? all.value : all.value.filter(r => r.status === status.value)
)

const durationText = (r) => {
  const bits = []
  if (r.days) bits.push(`${r.days} 天`)
  if (r.hours) bits.push(`${r.hours} 小时`)
  return bits.join(' / ') || '—'
}

const drawer = ref(false)
const current = ref(null)
const open = (r) => {
  current.value = r
  drawer.value = true
}

/* 审批流转：谁审、几个节点、同节点多人 */
const flow = computed(() => (current.value ? approvalFlowOf(current.value) : []))
const flowLabel = (s) => ({ done: '已通过', current: '处理中', waiting: '未开始', rejected: '已驳回' }[s] || s)
const canWithdraw = computed(() => current.value && ['pending', 'approved'].includes(current.value.status))

const withdraw = async () => {
  try {
    await ElMessageBox.confirm('撤假后该次休假作废，已扣额度会退回。确定撤假吗？', '确认撤假', {
      confirmButtonText: '确定撤假',
      cancelButtonText: '再想想',
      type: 'warning'
    })
    const hit = all.value.find(r => r.id === current.value.id)
    if (hit) hit.status = 'withdrawn'
    current.value = { ...current.value, status: 'withdrawn' }
    ElMessage.success('已撤假')
    drawer.value = false
  } catch (e) {
    /* 取消 */
  }
}

const goBack = () => router.push({ name: 'mobile-leave-pd' })
</script>

<style scoped>
.pd-records { min-height: 100vh; height: 100vh; overflow-y: auto; background: #f5f5f5; -webkit-overflow-scrolling: touch; }
.page-header { display: flex; align-items: center; gap: 10px; padding: 14px 16px; background: #fff; position: sticky; top: 0; z-index: 20; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
.back-icon { font-size: 22px; color: #333; }
.page-header h1 { flex: 1; text-align: center; font-size: 17px; font-weight: 600; margin: 0; }
.pd-tag { font-size: 11px; color: #a40035; border: 1px solid #a40035; border-radius: 10px; padding: 1px 7px; }
.content { padding: 12px; }

.card { background: #fff; border-radius: 12px; padding: 14px; margin-bottom: 12px; }
.who { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 10px 14px; }
.who-name { font-size: 15px; font-weight: 600; color: #333; }
.who-meta { font-size: 12px; color: #999; }

.filter-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
.f-chip { font-size: 12px; padding: 5px 12px; border-radius: 14px; background: #fff; border: 1px solid #e5e7eb; color: #666; }
.f-chip.on { color: #a40035; border-color: #a40035; background: #fff0f4; font-weight: 600; }
.count-text { font-size: 12px; color: #999; margin-bottom: 8px; }

.rec-list { display: flex; flex-direction: column; gap: 10px; }
.rec-card { background: #fff; border-radius: 12px; padding: 12px 14px; }
.rec-top { display: flex; align-items: center; justify-content: space-between; }
.rec-left { display: flex; align-items: baseline; gap: 8px; }
.rec-type { font-size: 15px; font-weight: 600; color: #333; }
.rec-channel { font-size: 11px; color: #999; }
.rec-line { display: flex; align-items: center; justify-content: space-between; margin-top: 6px; }
.rec-date { font-size: 13px; color: #555; }
.rec-dur { font-size: 12px; color: #a40035; font-weight: 600; }
.chain { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; margin-top: 10px; }
.chain.big { margin-top: 0; }
.chain-tag { font-size: 11px; padding: 3px 9px; border-radius: 11px; background: #fff0f4; color: #a40035; border: 1px solid #f5c2d1; }
.chain-tag.excess { background: #fef3c7; color: #b45309; border-color: #fde68a; }
.chain-arrow { font-size: 11px; color: #bbb; }
.tag-note { font-style: normal; margin-left: 4px; opacity: .75; }

.st { font-size: 11px; padding: 2px 8px; border-radius: 10px; white-space: nowrap; }
.st.pending { color: #b45309; background: #fef3c7; }
.st.approved { color: #15803d; background: #dcfce7; }
.st.rejected { color: #b91c1c; background: #fee2e2; }
.st.withdrawn { color: #6b7280; background: #f3f4f6; }

.empty-text { font-size: 13px; color: #999; text-align: center; padding: 30px 0; }

.detail { padding: 4px 2px 10px; }
.detail-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.detail-title { font-size: 17px; font-weight: 600; color: #333; }
.detail-rows { background: #fafafa; border-radius: 10px; padding: 10px 12px; }
.d-row { display: flex; align-items: center; justify-content: space-between; padding: 5px 0; }
.d-key { font-size: 13px; color: #999; }
.d-val { font-size: 13px; color: #333; }
.detail-sec { font-size: 13px; font-weight: 600; color: #333; margin: 16px 0 10px; }

/* 审批流转 */
.flow-list { display: flex; flex-direction: column; gap: 10px; }
.flow-node { display: flex; align-items: flex-start; gap: 10px; }
.flow-dot { width: 9px; height: 9px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; background: #e5e7eb; }
.flow-dot.done { background: #15803d; }
.flow-dot.current { background: #b45309; box-shadow: 0 0 0 3px #fef3c7; }
.flow-dot.rejected { background: #b91c1c; }
.flow-main { flex: 1; min-width: 0; }
.flow-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.flow-title { font-size: 13px; font-weight: 600; color: #333; }
.flow-st { font-size: 11px; padding: 1px 8px; border-radius: 10px; white-space: nowrap; }
.flow-st.done { color: #15803d; background: #dcfce7; }
.flow-st.current { color: #b45309; background: #fef3c7; }
.flow-st.waiting { color: #9ca3af; background: #f3f4f6; }
.flow-st.rejected { color: #b91c1c; background: #fee2e2; }
.flow-people { font-size: 12px; color: #888; margin-top: 3px; line-height: 1.6; }
.flow-mode { font-style: normal; font-size: 10.5px; color: #a40035; background: #fff0f4; border-radius: 8px; padding: 0 6px; margin-left: 6px; }
.reject-box { margin-top: 14px; padding: 10px 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; font-size: 12px; color: #b91c1c; }
.detail-actions { margin-top: 18px; }
.wd-btn { width: 100%; color: #a40035; border-color: #f5c2d1; }
</style>
