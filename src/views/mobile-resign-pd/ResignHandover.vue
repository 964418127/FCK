<template>
  <div class="pd-home">
    <div class="page-header">
      <el-icon class="back-icon" @click="goBack"><ArrowLeft /></el-icon>
      <h1>离职交接</h1>
      <span :class="['hst', overallTone]">{{ overallText }}</span>
    </div>

    <div class="content">
      <!-- 终止横幅 -->
      <div v-if="terminated" class="term-banner">
        <div class="tb-title">交接未通过 · 已终止全部流程</div>
        <div class="tb-reason">{{ inst.terminateReason || '必过节点判定不通过' }}</div>
        <div class="tb-sub">
          终止时间 {{ inst.terminatedAt }}。在途节点已全部关闭、不可再确认；已完成节点的说明与附件只读留档。
          员工仍在职，排班与接单不受影响；需人事线下处理后重新发起。
        </div>
      </div>

      <!-- 员工信息 + 模板来源 -->
      <div class="card">
        <div class="emp-head">
          <div class="avatar"><el-icon><User /></el-icon></div>
          <div class="emp-main">
            <div class="emp-name">{{ c.name }}<span class="emp-no">{{ c.staffNo }}</span></div>
            <div class="emp-sub">{{ c.job }} · {{ orgTextOf(c) }}</div>
          </div>
          <div class="prog-num">{{ prog.done }}/{{ prog.total }}</div>
        </div>
        <div class="info-row"><span>交接模板</span><b>{{ tpl.name }}（发起时快照 v{{ inst.templateVersion }}）</b></div>
        <div class="info-row"><span>交接开始</span><b>{{ inst.startedAt }}</b></div>
        <div v-if="inst.passive" class="info-row">
          <span>来源</span>
          <b>异常监控（被动离职）· 可强制解除</b>
        </div>
        <div v-if="inst.forcedRelease" class="forced-tag">人事已强制解除 · 交接转事后补录，不再阻塞</div>
      </div>

      <!-- 交接清单：平铺节点，先后只看每个节点的前置 -->
      <div class="card">
        <div class="sec-head">
          <span class="sec-title">交接清单</span>
          <span class="sec-num">{{ prog.done }}/{{ prog.total }}</span>
        </div>
        <div class="list-tip">
          没有前置的节点发起后同时开始办理、互不等待；配了前置的节点，等前置节点全部办结后才能开始办理。
        </div>
        <div v-if="!tpl.nodes.length" class="empty-line">模板里没有配置节点</div>
        <div
          v-for="(n, i) in rows"
          :key="n.id"
          :class="['node-card', nodeStateOf(inst, n.id)]"
          @click="nodeStateOf(inst, n.id) === 'running' && !isSystemNode(n) && goNode(n)"
        >
          <span class="nc-idx">{{ i + 1 }}</span>
          <div class="nc-main">
            <div class="nc-name">
              {{ n.name }}
              <span v-if="isSystemNode(n)" class="nc-sys">系统</span>
              <span :class="['nc-gate', n.gate]">{{ n.gate === 'must' ? '必过' : (isSystemNode(n) ? '软性' : '可选') }}</span>
            </div>
            <div class="nc-sub">
              <template v-if="isSystemNode(n)">
                <span :class="['nc-cycle', { run: nodeStateOf(inst, n.id) === 'checking' }]">{{ cycleTextOf(n, hasDeps(n)) }}</span>
                <span class="nc-sysrun">{{ sysRunTextOf(inst, n) }}</span>
              </template>
              <template v-else>
                负责人：{{ ownerOf(n) }}<span v-if="nodeStateOf(inst, n.id) === 'running'"> · {{ n.tasks.length }} 件待确认</span>
              </template>
            </div>
            <div v-if="hasDeps(n)" :class="['prev-tip', { waiting: nodeStateOf(inst, n.id) === 'pending' }]">
              <template v-if="nodeStateOf(inst, n.id) === 'pending'">
                等 {{ blockingText(n) }} 全部办结后才能开始办理，当前不需要任何人处理
              </template>
              <template v-else>前置：{{ depNames(n) }}</template>
            </div>
            <div v-if="isSystemNode(n) && inst.nodes[n.id]?.detail?.length" class="sys-detail">
              <div
                v-for="(d, di) in [...inst.nodes[n.id].detail].reverse()"
                :key="di" class="sd-li"
              >
                <div class="sd-top">
                  <span class="sd-at">{{ d.at }}</span>
                  <span class="sd-batch">{{ d.batch }}</span>
                  <span v-if="d.repeat" class="sd-repeat">同一批次</span>
                  <span :class="['sd-res', d.result === '通过' ? 'ok' : 'bad']">{{ d.result }}</span>
                </div>
                <span class="sd-metrics">{{ d.metrics }}</span>
              </div>
              <div class="sd-src">批次号可到系统检查执行明细页对上当批条件与逐单结果</div>
            </div>
            <div v-if="isSystemNode(n) && isSysStuck(inst, n)" class="stuck-tip">
              已取数 {{ inst.nodes[n.id].polls || inst.nodes[n.id].runs }} 次、命中 {{ inst.nodes[n.id].failBatches || inst.nodes[n.id].runs }} 个未通过批次仍无「通过」{{ n.maxRuns ? '（上限 ' + n.maxRuns + ' 个批次）' : '' }}；到上限后必过节点将终止全部流程、软性节点将放行留痕，建议人事提前线下核实。
            </div>
          </div>
          <div class="nc-actions">
            <el-button v-if="nodeStateOf(inst, n.id) === 'running' && !isSystemNode(n)" size="small" round @click.stop="urge(n)">催办</el-button>
            <span :class="['nc-st', nodeStateOf(inst, n.id)]">{{ stateLabelOf(nodeStateOf(inst, n.id)) }}</span>
          </div>
        </div>
      </div>

      <!-- 底部操作 -->
      <div v-if="!terminated && inst.passive" class="card">
        <div class="sec-head"><span class="sec-title">被动离职通道</span><span class="tag-warn">人事专用</span></div>
        <div class="passive-tip">
          解除用工不依赖交接完成：强制解除后交接清单转<strong>事后补录</strong>，门店/城市总仍需归还物品、回收账号，但不阻塞解除。
        </div>
        <el-button type="warning" plain style="width: 100%" @click="forceRelease">强制解除用工</el-button>
      </div>
    </div>

    <div v-if="canGoApprove" class="footer-bar">
      <button class="approve-btn" @click="goApprove">交接已全部完成 · 系统将自动推送离职合同</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, User } from '@element-plus/icons-vue'
import { caseOf, orgTextOf } from '../../mock/mobileResignPd.js'
import {
  handoverOf, templateOf, nodeStateOf, stateLabelOf,
  progressOf, isTerminated, canApprove, blockingDepsOf,
  ownerOf, isSystemNode, cycleTextOf, sysRunTextOf, isSysStuck,
  orderedNodes, depsOf
} from '../../mock/resignHandoverPd.js'

const route = useRoute()
const router = useRouter()

/* 本页是单笔交接进度，必须带有效 id：菜单入口在交接处理列表（mobile-resign-handover-list）；
   直进本页而无 id / id 无效 → 回列表页，不再静默落到演示单 */
if (!handoverOf(String(route.query.id || ''))) {
  router.replace({ name: 'mobile-resign-handover-list' })
}
let c = caseOf(route.query.id)
let inst0 = handoverOf(c.id)
if (!inst0) { c = caseOf('rs01'); inst0 = handoverOf('rs01') }
const inst = ref(inst0)
const tpl = templateOf(inst.value.templateId)

const rows = orderedNodes(tpl)
const hasDeps = (n) => !!(n?.deps || []).length
const depNames = (n) => depsOf(tpl, n).map(d => d.name).join('、')
const blockingText = (n) => blockingDepsOf(inst.value, n).map(d => `「${d.name}」`).join('')

const terminated = computed(() => isTerminated(inst.value))
const prog = computed(() => progressOf(inst.value))
const canGoApprove = computed(() => canApprove(c.id))


const overallText = computed(() => {
  if (terminated.value) return '已终止作废'
  if (canGoApprove.value) return '交接完成'
  return `交接中 ${prog.value.done}/${prog.value.total}`
})
const overallTone = computed(() => (terminated.value ? 'bad' : canGoApprove.value ? 'ok' : 'warn'))

const goNode = (n) => router.push({ name: 'mobile-resign-handover-node', query: { id: c.id, nodeId: n.id } })

const urge = (n) => ElMessage.success(`已提醒 ${ownerOf(n)} 处理「${n.name}」（原型演示）`)

const goApprove = () => router.push({ name: 'mobile-resign-pd-detail', query: { id: c.id } })

const forceRelease = () => {
  inst.value.forcedRelease = true
  ElMessage.success('已强制解除用工，交接清单转事后补录（原型演示）')
}

const goBack = () => router.back()
</script>

<style scoped>
.pd-home { min-height: 100vh; height: 100vh; overflow-y: auto; background: #f5f5f5; -webkit-overflow-scrolling: touch; padding-bottom: 86px; }
.page-header { display: flex; align-items: center; gap: 10px; padding: 14px 16px; background: #fff; position: sticky; top: 0; z-index: 20; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
.back-icon { font-size: 22px; color: #333; }
.page-header h1 { flex: 1; text-align: center; font-size: 17px; font-weight: 600; margin: 0; }
.hst { font-size: 11px; border-radius: 9px; padding: 2px 8px; font-weight: 500; }
.hst.warn { color: #854f0b; background: #faeeda; }
.hst.ok { color: #0f6e56; background: #e1f5ee; }
.hst.bad { color: #a32d2d; background: #fcebeb; }

.content { padding: 12px 12px 20px; }
.card { background: #fff; border-radius: 12px; padding: 14px; margin-bottom: 12px; }

.term-banner { background: #fcebeb; border: 1px solid #f7c1c1; border-radius: 12px; padding: 12px 14px; margin-bottom: 12px; }
.tb-title { font-size: 14px; font-weight: 600; color: #791f1f; }
.tb-reason { font-size: 12.5px; color: #a32d2d; margin-top: 5px; }
.tb-sub { font-size: 11px; color: #a3a0a1; line-height: 1.7; margin-top: 6px; }

.emp-head { display: flex; gap: 12px; align-items: center; padding-bottom: 12px; border-bottom: 1px solid #f5f5f5; margin-bottom: 10px; }
.avatar { width: 44px; height: 44px; border-radius: 50%; background: #f2f2f2; color: #bbb; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
.emp-main { flex: 1; }
.emp-name { font-size: 17px; font-weight: 600; color: #333; display: flex; align-items: baseline; gap: 8px; }
.emp-no { font-size: 12px; color: #999; font-weight: 400; }
.emp-sub { font-size: 12.5px; color: #888; margin-top: 4px; }
.prog-num { font-size: 18px; font-weight: 600; color: #a40035; font-variant-numeric: tabular-nums; }

.info-row { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 6px 0; font-size: 13px; }
.info-row span { color: #999; flex-shrink: 0; }
.info-row b { color: #333; font-weight: 500; text-align: right; }
.forced-tag { margin-top: 8px; font-size: 11.5px; color: #854f0b; background: #faeeda; border-radius: 8px; padding: 7px 10px; }

.sec-head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
.sec-title { font-size: 15px; font-weight: 600; color: #333; }
.sec-num { margin-left: auto; font-size: 12px; color: #a40035; font-weight: 600; font-variant-numeric: tabular-nums; }
.sec-sub { font-size: 11px; color: #a3a0a1; }
.list-tip { font-size: 11px; color: #8a8f99; background: #f7f8fa; border-radius: 8px; padding: 7px 10px; line-height: 1.65; margin-bottom: 9px; }
.tag-warn { font-size: 10.5px; color: #854f0b; background: #faeeda; border-radius: 9px; padding: 1px 7px; }
.empty-line { font-size: 12.5px; color: #a3a0a1; padding: 4px 0; }

.node-card { display: flex; align-items: flex-start; gap: 9px; border: 1px solid #ececf0; border-radius: 10px; padding: 11px 12px; margin-bottom: 8px; background: #fcfcfd; }
.node-card.running { border-color: #f4c0d1; background: #fdf3f7; cursor: pointer; }
.node-card.pending { opacity: .72; }
.node-card.checking { border-color: #bcd9ec; background: #f4fafd; }
.node-card.closed { opacity: .55; }
.nc-idx { width: 18px; height: 18px; border-radius: 50%; background: #f1efe8; color: #77756c; font-size: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
.nc-prev { color: #7f77dd; }
.prev-tip { margin-top: 6px; font-size: 11px; color: #6b6880; background: #f4f3fb; border-radius: 7px; padding: 5px 8px; line-height: 1.6; }
.prev-tip.waiting { color: #8a8f99; background: #f6f6f7; }
.nc-main { flex: 1; min-width: 0; }
.nc-name { font-size: 13.5px; font-weight: 600; color: #333; display: flex; align-items: center; gap: 6px; }
.nc-gate { font-size: 10px; font-weight: 500; border-radius: 8px; padding: 1px 7px; }
.nc-gate.must { color: #993556; background: #fbeaf0; }
.nc-gate.optional { color: #888780; background: #f1efe8; }
.nc-sub { font-size: 11.5px; color: #8a8f99; margin-top: 4px; }
.nc-cycle { color: #0b5e8a; }
.nc-cycle.run { font-weight: 500; }
.nc-sysrun { display: block; margin-top: 2px; color: #8a9aa5; font-size: 11px; }
.stuck-tip { margin-top: 6px; font-size: 11px; color: #a33b12; background: #fdf1e8; border-radius: 7px; padding: 5px 8px; line-height: 1.6; }
.sys-detail { margin-top: 6px; border-top: 1px dashed #f0f0f0; padding-top: 5px; }
.sd-li { display: flex; flex-direction: column; gap: 1px; font-size: 11px; line-height: 1.8; padding: 3px 0; }
.sd-li + .sd-li { border-top: 1px dashed #f4f4f4; }
.sd-top { display: flex; align-items: center; gap: 8px; }
.sd-at { color: #a3a0a1; flex-shrink: 0; }
.sd-batch { flex-shrink: 0; color: #534ab7; background: #eeedfe; border-radius: 6px; padding: 0 5px; font-size: 10px; font-family: ui-monospace, monospace; line-height: 1.8; }
.sd-repeat { flex-shrink: 0; color: #a3a0a1; font-size: 10px; line-height: 1.8; }
.sd-metrics { color: #666; }
.sd-res { flex-shrink: 0; font-weight: 500; }
.sd-res.ok { color: #2f7d4f; }
.sd-res.bad { color: #b03030; }
.sd-src { margin-top: 3px; font-size: 10px; color: #b3b1b8; line-height: 1.6; }
.nc-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.nc-st { font-size: 11px; border-radius: 8px; padding: 1px 8px; }
.nc-st.running { color: #993556; background: #fbeaf0; }
.nc-st.checking { color: #0b5e8a; background: #e3f1fa; }
.nc-st.done { color: #3b6d11; background: #eaf3de; }
.nc-st.rejected { color: #a32d2d; background: #fcebeb; }
.nc-st.skipped, .nc-st.waived, .nc-st.closed { color: #888780; background: #f1efe8; }
.nc-sys { font-size: 10px; font-weight: 400; color: #0b5e8a; background: #e3f1fa; border-radius: 7px; padding: 0 6px; }

.settled-row { display: flex; align-items: center; gap: 8px; padding: 7px 0; border-top: 1px dashed #f0f0f0; font-size: 12.5px; }
.settled-row:first-of-type { border-top: none; }
.ss-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.ss-dot.done { background: #639922; }
.ss-dot.rejected { background: #e24b4a; }
.ss-dot.skipped { background: #b4b2a9; }
.ss-dot.closed { background: #d3d1c7; }
.ss-name { color: #333; font-weight: 500; display: flex; align-items: center; gap: 6px; }
.ss-sys { font-size: 10px; font-weight: 400; color: #0b5e8a; background: #e3f1fa; border-radius: 7px; padding: 0 6px; }
.ss-state { font-size: 11px; border-radius: 8px; padding: 0 7px; }
.ss-state.done { color: #3b6d11; background: #eaf3de; }
.ss-state.rejected { color: #a32d2d; background: #fcebeb; }
.ss-state.skipped, .ss-state.closed { color: #888780; background: #f1efe8; }
.ss-meta { margin-left: auto; color: #a3a0a1; font-size: 11.5px; text-align: right; }

.passive-tip { font-size: 12px; color: #5f6368; line-height: 1.8; background: #faf9f9; border-radius: 10px; padding: 10px 12px; margin-bottom: 10px; }

.footer-bar { position: fixed; left: 0; right: 0; bottom: 0; display: flex; gap: 10px; padding: 10px 14px 16px; background: #fff; box-shadow: 0 -2px 12px rgba(0,0,0,.06); }
.approve-btn { flex: 1; height: 44px; border-radius: 22px; font-size: 15px; font-weight: 600; background: #a40035; color: #fff; border: none; }
</style>
