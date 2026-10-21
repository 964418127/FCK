<template>
  <div class="cl-page">
    <div class="page-header">
      <div class="header-main">
        <h1>离职补偿金明细</h1>
      </div>
      <span class="readonly-tip">只读明细 · 录入在离职流程内完成</span>
    </div>

    <!-- 金额三段：预估 → 计算 → 发放 -->
    <div class="stage-strip">
      <div class="stage-lead">
        <span class="sl-t">一笔补偿金的三个时点</span>
        <span class="sl-d">协议先走、金额后置：签署时只有预估值，签完才进入次月 5 日 —— 当天按流程冻结余额、再跑批算出实际金额。员工继续上班、期间扣款，都会让最终金额变化，所以三段都要留痕</span>
      </div>
      <div class="stage-flow">
        <template v-for="(s, i) in amountStages" :key="s.key">
          <div class="stage-node" :class="s.key">
            <div class="sn-head">
              <span class="sn-label">{{ s.label }}</span>
              <span class="sn-when">{{ s.when }}</span>
            </div>
            <div class="sn-desc">{{ s.desc }}</div>
          </div>
          <span v-if="i < amountStages.length - 1" class="sn-arrow">→</span>
        </template>
      </div>
    </div>

    <!-- 签署状态图例 -->
    <div class="rule-strip">
      <div class="fsm-block">
        <div class="fsm-head">
          <span class="fsm-title">离职合同签署状态（决定这笔补偿金成不成立、要不要往下算；不改变 5 日计算 / 9 日发放的节奏）</span>
        </div>
        <div class="fsm-row">
          <template v-for="(k, i) in contractFlowSteps" :key="k">
            <span :class="['fsm-node', { final: k === 'completed' }]">{{ contractFlowMeta[k].label }}</span>
            <span v-if="i < contractFlowSteps.length - 1" class="fsm-arrow">→</span>
          </template>
        </div>
        <div class="fsm-branch">
          <span class="fsm-branch-key">驳回 / 撤销</span>
          <span class="fsm-arrow">→</span>
          <span class="fsm-node bad">已拒签</span>
          <span class="fsm-node bad">已作废</span>
        </div>
      </div>
    </div>

    <!-- 统计（按阶段） -->
    <div class="stat-row">
      <div v-for="s in stats" :key="s.key" :class="['stat-card', s.key]">
        <div class="stat-label">
          <span :class="['dot', s.key]"></span>{{ s.label }}
        </div>
        <div class="stat-amount">¥ {{ fmt(s.amount) }}</div>
        <div class="stat-count">{{ s.count }} 笔</div>
      </div>
    </div>

    <!-- 录入记录 -->
    <div class="section-card">
      <div class="card-header">
        <span class="card-title">录入记录</span>
        <div class="toolbar">
          <el-input
            v-model="keyword"
            placeholder="按姓名 / 工号 / 输入人搜索"
            clearable
            :prefix-icon="Search"
            style="width: 240px"
          />
          <el-select v-model="stateFilter" placeholder="全部签署状态" clearable style="width: 170px">
            <el-option label="全部签署状态" value="" />
            <el-option v-for="(m, k) in contractFlowMeta" :key="k" :label="m.label" :value="k" />
          </el-select>
        </div>
      </div>

      <el-table :data="rows" size="small" class="cl-table" row-key="id">
        <!-- 展开：三段构成 -->
        <el-table-column type="expand" width="36">
          <template #default="{ row }">
            <div class="ex">
              <div class="ex-cols">
                <!-- 预估 -->
                <div class="ex-col">
                  <div class="ex-h">
                    <span>预估 · 签署发起</span>
                    <em>{{ shortAt(row.estimate.at) }}</em>
                  </div>
                  <div class="ex-line"><span>协商现金</span><b>¥ {{ fmt(row.estimate.cash) }}</b></div>
                  <div class="ex-line"><span>常乐豆出口（约）</span><b>¥ {{ fmt(row.estimate.bean) }}</b></div>
                  <div class="ex-line total"><span>预估合计</span><b>¥ {{ fmt(estimateTotal(row)) }}</b></div>
                </div>

                <!-- 计算 -->
                <div class="ex-col">
                  <div class="ex-h">
                    <span>计算 · 次月 5 日</span>
                    <em>{{ row.settle ? shortAt(row.settle.at) : '待跑批' }}</em>
                  </div>
                  <template v-if="row.settle">
                    <div class="ex-line"><span>协商现金</span><b>¥ {{ fmt(row.settle.cash) }}</b></div>
                    <div class="ex-line"><span>常乐豆（5 日冻结值）</span><b>¥ {{ fmt(row.settle.bean) }}</b></div>
                    <div v-if="row.settle.settledDeduct" class="ex-line sub">
                      <span>└ 其中当月负工资抵扣（3 日结算内）</span>
                      <b class="minus">−¥ {{ fmt(row.settle.settledDeduct) }}</b>
                    </div>
                    <div class="ex-line"><span>税前</span><b>¥ {{ fmt(settleGross(row)) }}</b></div>
                    <div class="ex-line"><span>补偿金个税</span><b :class="{ minus: row.settle.tax }">−¥ {{ fmt(row.settle.tax) }}</b></div>
                    <div class="ex-line total"><span>实发</span><b>¥ {{ fmt(settleNet(row)) }}</b></div>
                  </template>
                  <div v-else class="ex-empty">尚未到计算日，金额仍是预估值</div>
                </div>

                <!-- 发放 -->
                <div class="ex-col">
                  <div class="ex-h">
                    <span>发放 · 次月 9 日</span>
                    <em>{{ row.payout ? shortAt(row.payout.at) : '未发放' }}</em>
                  </div>
                  <template v-if="row.payout">
                    <div class="ex-line"><span>到账金额</span><b>¥ {{ fmt(row.payout.amount) }}</b></div>
                    <div class="ex-line"><span>状态</span><b>已到账</b></div>
                    <div class="ex-line total">
                      <span>与预估差</span>
                      <b :class="deltaTone(deltaOf(row))">{{ signed(deltaOf(row)) }}</b>
                    </div>
                  </template>
                  <div v-else-if="row.settle" class="ex-empty">已算好实发 ¥{{ fmt(settleNet(row)) }}，等 9 日打款</div>
                  <div v-else class="ex-empty">未到发放环节</div>
                </div>
              </div>

              <div v-if="row.settle" class="ex-reason">
                <span class="ex-reason-k">差异原因</span>{{ row.settle.reason }}
              </div>
              <div class="ex-meta">
                <span>录入：{{ row.operator }}（{{ row.operatorRole }}）· {{ row.inputAt }}</span>
                <span>关联：{{ row.resignCaseTitle }}（{{ row.resignCaseId }}）· 实际离职 {{ row.leaveDate }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="员工" min-width="150" fixed>
          <template #default="{ row }">
            <div class="emp-name">{{ row.employee }}</div>
            <div class="emp-sub">{{ row.staffNo }} · {{ row.job }}</div>
          </template>
        </el-table-column>

        <el-table-column label="预估 · 签署发起" width="180">
          <template #default="{ row }">
            <div class="amt">¥ {{ fmt(estimateTotal(row)) }}</div>
            <div class="amt-sub">现金 {{ fmt(row.estimate.cash) }} · 常乐豆 约{{ fmt(row.estimate.bean) }}</div>
            <div class="amt-time">{{ shortAt(row.estimate.at) }}</div>
          </template>
        </el-table-column>

        <el-table-column label="计算 · 次月 5 日" width="180">
          <template #default="{ row }">
            <template v-if="row.settle">
              <div class="amt">¥ {{ fmt(settleNet(row)) }}</div>
              <div class="amt-sub">税前 {{ fmt(settleGross(row)) }} · 个税 {{ fmt(row.settle.tax) }}</div>
              <div class="amt-time">{{ shortAt(row.settle.at) }}</div>
            </template>
            <template v-else>
              <div class="amt-pending">待计算</div>
              <div class="amt-sub">5 日跑批 · 6 日报税定稿</div>
            </template>
          </template>
        </el-table-column>

        <el-table-column label="发放 · 次月 9 日" width="180">
          <template #default="{ row }">
            <template v-if="row.payout">
              <div class="amt">¥ {{ fmt(row.payout.amount) }}</div>
              <div class="amt-sub">已到账</div>
              <div class="amt-time">{{ shortAt(row.payout.at) }}</div>
            </template>
            <template v-else-if="row.settle">
              <div class="amt-pending">待发放</div>
              <div class="amt-sub">实发 ¥{{ fmt(settleNet(row)) }} · 计划 {{ planPayText(row) }}</div>
            </template>
            <template v-else>
              <div class="amt-pending">—</div>
              <div class="amt-sub">未到发放环节</div>
            </template>
          </template>
        </el-table-column>

        <el-table-column label="预估 → 实际" width="120">
          <template #default="{ row }">
            <template v-if="deltaOf(row) !== null">
              <span :class="['delta', deltaTone(deltaOf(row))]">{{ signed(deltaOf(row)) }}</span>
            </template>
            <span v-else class="delta none">—</span>
          </template>
        </el-table-column>

        <el-table-column label="签署状态 / 补偿金成立" width="165">
          <template #default="{ row }">
            <el-tag :type="contractFlowMeta[row.contractState].tag" effect="light" size="small">
              {{ contractFlowMeta[row.contractState].label }}
            </el-tag>
            <div class="st-desc">
              协议 · <span :class="['eff', establishOf(row)]">{{ establishMeta[establishOf(row)].label }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="协商协议" width="160">
          <template #default="{ row }">
            <div v-if="row.agreement" class="att" :title="row.agreement.name" @click="openFile(row)">
              <el-icon><Paperclip /></el-icon>
              <span class="att-name">{{ row.agreement.name }}</span>
            </div>
            <span v-else class="att-none">—</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="76" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="open(row)">查看</el-button>
          </template>
        </el-table-column>

        <template #empty>
          <div class="empty">没有匹配的录入记录</div>
        </template>
      </el-table>
    </div>

    <!-- 明细抽屉 -->
    <el-drawer v-model="drawer" title="补偿金明细" size="480px">
      <div v-if="current" class="detail">
        <div class="d-emp">
          <div class="d-emp-name">{{ current.employee }} <span class="d-emp-job">{{ current.job }}</span></div>
          <div class="d-emp-sub">{{ current.staffNo }} · {{ current.store }}</div>
        </div>

        <!-- 三段金额时间线 -->
        <div class="d-timeline">
          <div v-for="(s, i) in amountStages" :key="s.key" class="tl-item" :class="s.key">
            <div class="tl-rail">
              <span class="tl-dot"></span>
              <span v-if="i < amountStages.length - 1" class="tl-line"></span>
            </div>
            <div class="tl-body">
              <div class="tl-head">
                <span class="tl-label">{{ s.label }}</span>
                <span class="tl-when">{{ stageWhen(current, s.key) }}</span>
              </div>

              <!-- 预估 -->
              <template v-if="s.key === 'estimate'">
                <div class="tl-amount">¥ {{ fmt(estimateTotal(current)) }}</div>
                <div class="tl-rows">
                  <div class="tl-row"><span>协商现金</span><b>¥ {{ fmt(current.estimate.cash) }}</b></div>
                  <div class="tl-row"><span>常乐豆出口（约）</span><b>¥ {{ fmt(current.estimate.bean) }}</b></div>
                </div>
              </template>

              <!-- 计算 -->
              <template v-else-if="s.key === 'settle'">
                <template v-if="current.settle">
                  <div class="tl-amount">¥ {{ fmt(settleNet(current)) }}</div>
                  <div class="tl-rows">
                    <div class="tl-row"><span>协商现金</span><b>¥ {{ fmt(current.settle.cash) }}</b></div>
                    <div class="tl-row"><span>常乐豆（5 日冻结值）</span><b>¥ {{ fmt(current.settle.bean) }}</b></div>
                    <div v-if="current.settle.settledDeduct" class="tl-row sub">
                      <span>└ 其中当月负工资抵扣（3 日结算内）</span>
                      <b class="minus">−¥ {{ fmt(current.settle.settledDeduct) }}</b>
                    </div>
                    <div class="tl-row"><span>补偿金个税</span><b :class="{ minus: current.settle.tax }">−¥ {{ fmt(current.settle.tax) }}</b></div>
                  </div>
                </template>
                <div v-else class="tl-empty">尚未到计算日，金额仍是预估值</div>
              </template>

              <!-- 发放 -->
              <template v-else>
                <template v-if="current.payout">
                  <div class="tl-amount">¥ {{ fmt(current.payout.amount) }}</div>
                  <div class="tl-rows">
                    <div class="tl-row"><span>状态</span><b>已到账</b></div>
                    <div class="tl-row"><span>与预估差</span><b :class="deltaTone(deltaOf(current))">{{ signed(deltaOf(current)) }}</b></div>
                  </div>
                </template>
                <div v-else-if="current.settle" class="tl-empty">已算好实发 ¥{{ fmt(settleNet(current)) }}，等 9 日打款</div>
                <div v-else class="tl-empty">未到发放环节</div>
              </template>
            </div>
          </div>
        </div>

        <div v-if="current.settle" class="d-reason">
          <span class="d-reason-k">差异原因</span>{{ current.settle.reason }}
        </div>

        <div class="d-sep"></div>

        <div class="d-row"><span class="d-key">录入单号</span><span class="d-val mono">{{ current.id }}</span></div>
        <div class="d-row"><span class="d-key">录入人</span><span class="d-val">{{ current.operator }}（{{ current.operatorRole }}）</span></div>
        <div class="d-row"><span class="d-key">录入时间</span><span class="d-val">{{ current.inputAt }}</span></div>
        <div class="d-row"><span class="d-key">实际离职日期</span><span class="d-val">{{ current.leaveDate }}</span></div>
        <div class="d-row"><span class="d-key">关联离职单</span><span class="d-val">{{ current.resignCaseTitle }}</span></div>
        <div class="d-row">
          <span class="d-key">签署状态</span>
          <el-tag :type="contractFlowMeta[current.contractState].tag" effect="light" size="small">
            {{ contractFlowMeta[current.contractState].label }}
          </el-tag>
        </div>
        <div class="d-row">
          <span class="d-key">补偿金成立</span>
          <el-tag :type="establishMeta[establishOf(current)].tag" effect="plain" size="small">
            {{ establishMeta[establishOf(current)].label }}
          </el-tag>
        </div>

        <div class="d-block">
          <div class="d-key">协商协议附件</div>
          <div v-if="current.agreement" class="d-att" @click="openFile(current)">
            <el-icon class="d-att-icon"><Paperclip /></el-icon>
            <div class="d-att-main">
              <div class="d-att-name">{{ current.agreement.name }}</div>
              <div class="d-att-meta">{{ current.agreement.size }} · {{ current.agreement.uploader }} 于 {{ shortAt(current.agreement.at) }} 上传</div>
            </div>
            <span class="d-att-view">查看</span>
          </div>
          <div v-else class="d-note">未上传</div>
        </div>

        <div class="d-block">
          <div class="d-key">备注（协商说明）</div>
          <div class="d-note">{{ current.note }}</div>
        </div>

        <div class="d-tip">
          <p class="tip-p">{{ contractFlowMeta[current.contractState].desc }}</p>
          <p class="tip-p">{{ establishMeta[establishOf(current)].desc }}</p>
          <p class="tip-p">签署回答的是「这笔补偿金成不成立」，不是「金额生不生效」—— 签署时金额还只是预估，实际金额在协议成立之后、次月 5 日冻结余额后跑批才算出来。6 日报税后工资单与补偿金单回写税后个税、数据完善，之后才出付款单，9 日打款到账。</p>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Paperclip, Search } from '@element-plus/icons-vue'
import {
  amountStages,
  compensationEntries,
  contractFlowMeta,
  contractFlowSteps,
  deltaOf,
  establishMeta,
  establishOf,
  estimateTotal,
  settleGross,
  settleNet,
  statsOf
} from '../../mock/resignCompensationPd.js'

const keyword = ref('')
const stateFilter = ref('')
const drawer = ref(false)
const current = ref(null)

const stats = statsOf()

const rows = computed(() => {
  const k = keyword.value.trim()
  return compensationEntries.filter(e => {
    const hitK = !k || e.employee.includes(k) || e.staffNo.includes(k) || e.operator.includes(k)
    const hitS = !stateFilter.value || e.contractState === stateFilter.value
    return hitK && hitS
  })
})

const fmt = (n) => Number(n || 0).toLocaleString('zh-CN')
const signed = (n) => (n === null ? '—' : `${n > 0 ? '+' : n < 0 ? '−' : ''}¥ ${fmt(Math.abs(n))}`)
const deltaTone = (n) => (n === null ? '' : n > 0 ? 'plus' : n < 0 ? 'minus' : 'flat')
const shortAt = (at) => (at ? at.slice(5, 16) : '—')
/** 发放计划日：计算月的 9 号 */
const planPayText = (row) => (row.settle ? `${row.settle.at.slice(5, 7)}-09` : '次月 9 日')

const stageWhen = (row, key) => {
  if (key === 'estimate') return row.estimate?.at ? shortAt(row.estimate.at) : '—'
  if (key === 'settle') return row.settle ? shortAt(row.settle.at) : '次月 5 日（未到）'
  return row.payout ? shortAt(row.payout.at) : '次月 9 日（未到）'
}

const open = (row) => {
  current.value = row
  drawer.value = true
}

const openFile = (row) => {
  ElMessage.info(`原型演示：打开「${row.agreement.name}」（附件预览）`)
}
</script>

<style scoped>
.cl-page { padding: 0; }
.page-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
.header-main { display: flex; align-items: center; gap: 10px; }
.header-main h1 { font-size: 22px; font-weight: 600; margin: 0; color: hsl(var(--foreground)); }
.readonly-tip { font-size: 12px; color: hsl(var(--muted-foreground)); }

/* 金额三段条 */
.stage-strip {
  padding: 14px 16px; margin-bottom: 14px;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
}
.stage-lead { display: flex; align-items: baseline; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
.sl-t { font-size: 13px; font-weight: 600; color: hsl(var(--foreground)); }
.sl-d { font-size: 12px; color: hsl(var(--muted-foreground)); }
.stage-flow { display: flex; align-items: stretch; gap: 10px; }
.stage-node {
  flex: 1; min-width: 0;
  border: 1px solid hsl(var(--border)); border-radius: 10px;
  padding: 10px 12px; background: hsl(var(--muted) / 0.22);
}
.stage-node.estimate { border-left: 3px solid hsl(38 92% 48%); }
.stage-node.settle { border-left: 3px solid hsl(210 70% 52%); }
.stage-node.payout { border-left: 3px solid hsl(150 45% 42%); }
.sn-head { display: flex; align-items: baseline; gap: 8px; }
.sn-label { font-size: 13px; font-weight: 600; color: hsl(var(--foreground)); }
.sn-when { font-size: 11px; color: hsl(var(--muted-foreground)); }
.sn-desc { font-size: 11.5px; line-height: 1.65; color: hsl(var(--muted-foreground)); margin-top: 5px; }
.sn-arrow { align-self: center; color: hsl(var(--muted-foreground) / 0.5); font-size: 13px; }

/* 签署状态图例 */
.rule-strip {
  padding: 14px 16px; margin-bottom: 14px;
  background: hsl(var(--muted) / 0.35);
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
}
.fsm-head { display: flex; align-items: center; gap: 8px; margin-bottom: 11px; }
.fsm-title { font-size: 12.5px; font-weight: 500; color: hsl(var(--foreground)); }
.fsm-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.fsm-node {
  font-size: 12px; padding: 3px 11px; border-radius: 14px;
  background: hsl(var(--background)); border: 1px solid hsl(var(--border));
  color: hsl(var(--muted-foreground));
}
.fsm-node.final {
  background: hsl(150 45% 42% / 0.12); border-color: hsl(150 45% 42% / 0.5);
  color: hsl(150 45% 30%); font-weight: 600;
}
.fsm-node.bad { background: hsl(0 65% 50% / 0.1); border-color: hsl(0 65% 50% / 0.4); color: hsl(0 65% 45%); }
.fsm-arrow { color: hsl(var(--muted-foreground) / 0.6); font-size: 12px; }
.fsm-branch { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 9px; }
.fsm-branch-key { font-size: 12px; color: hsl(var(--muted-foreground)); }

/* 统计 */
.stat-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 14px; }
.stat-card {
  background: hsl(var(--background)); border: 1px solid hsl(var(--border));
  border-radius: 10px; padding: 14px 16px;
}
.stat-label { display: flex; align-items: center; gap: 7px; font-size: 12.5px; color: hsl(var(--muted-foreground)); }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot.estimate { background: hsl(38 92% 50%); }
.dot.settled { background: hsl(210 70% 52%); }
.dot.paid { background: hsl(150 45% 42%); }
.dot.void { background: hsl(220 12% 62%); }
.stat-amount { font-size: 22px; font-weight: 600; color: hsl(var(--foreground)); margin: 8px 0 3px; font-variant-numeric: tabular-nums; }
.stat-count { font-size: 12px; color: hsl(var(--muted-foreground)); }

/* 表格区 */
.section-card { background: hsl(var(--background)); border: 1px solid hsl(var(--border)); border-radius: 10px; padding: 16px 18px; }
.card-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid hsl(var(--border)); }
.card-title { font-size: 15px; font-weight: 500; color: hsl(var(--foreground)); }
.toolbar { display: flex; align-items: center; gap: 10px; }

.emp-name { font-size: 13.5px; font-weight: 500; color: hsl(var(--foreground)); }
.emp-sub { font-size: 11.5px; color: hsl(var(--muted-foreground)); margin-top: 2px; }
.amt { font-size: 14px; font-weight: 600; color: hsl(var(--foreground)); font-variant-numeric: tabular-nums; }
.amt-sub { font-size: 11px; color: hsl(var(--muted-foreground)); margin-top: 2px; }
.amt-time { font-size: 10.5px; color: hsl(var(--muted-foreground) / 0.8); margin-top: 2px; }
.amt-pending { font-size: 13px; color: hsl(var(--muted-foreground)); }
.delta { font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }
.delta.plus { color: hsl(210 70% 45%); }
.delta.minus { color: hsl(28 85% 45%); }
.delta.flat { color: hsl(var(--muted-foreground)); }
.delta.none { color: hsl(var(--muted-foreground) / 0.6); font-weight: 400; }
.st-desc { font-size: 11.5px; color: hsl(var(--muted-foreground)); margin-top: 5px; }

/* 协商协议附件 */
.att {
  display: inline-flex; align-items: center; gap: 5px;
  max-width: 100%; cursor: pointer;
  font-size: 11.5px; color: hsl(var(--primary));
}
.att .el-icon { flex-shrink: 0; font-size: 13px; }
.att-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.att:hover .att-name { text-decoration: underline; }
.att-none { font-size: 12px; color: hsl(var(--muted-foreground)); }
.d-att {
  display: flex; align-items: center; gap: 9px;
  margin-top: 7px; padding: 9px 11px; cursor: pointer;
  background: hsl(var(--muted) / 0.35); border: 1px solid hsl(var(--border)); border-radius: 8px;
}
.d-att:hover { border-color: hsl(var(--primary) / 0.45); }
.d-att-icon { font-size: 16px; color: hsl(var(--primary)); flex-shrink: 0; }
.d-att-main { flex: 1; min-width: 0; }
.d-att-name { font-size: 12.5px; color: hsl(var(--foreground)); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.d-att-meta { font-size: 10.5px; color: hsl(var(--muted-foreground)); margin-top: 2px; }
.d-att-view { font-size: 11.5px; color: hsl(var(--primary)); flex-shrink: 0; }
.eff.pending { color: hsl(38 92% 36%); font-weight: 500; }
.eff.established { color: hsl(150 45% 30%); font-weight: 500; }
.eff.void { color: hsl(var(--muted-foreground)); }
.empty { font-size: 13px; color: hsl(var(--muted-foreground)); padding: 24px 0; }

/* 展开区 */
.ex { padding: 6px 16px 12px 46px; }
.ex-cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.ex-col {
  background: hsl(var(--muted) / 0.2); border: 1px solid hsl(var(--border));
  border-radius: 8px; padding: 10px 12px;
}
.ex-h {
  display: flex; align-items: baseline; justify-content: space-between; gap: 8px;
  font-size: 12px; font-weight: 600; color: hsl(var(--foreground));
  padding-bottom: 7px; margin-bottom: 6px; border-bottom: 1px dashed hsl(var(--border));
}
.ex-h em { font-style: normal; font-size: 10.5px; font-weight: 400; color: hsl(var(--muted-foreground)); }
.ex-line { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; padding: 2px 0; font-size: 11.5px; color: hsl(var(--muted-foreground)); }
.ex-line b { color: hsl(var(--foreground)); font-weight: 500; font-variant-numeric: tabular-nums; }
.ex-line.total { margin-top: 6px; padding-top: 6px; border-top: 1px dashed hsl(var(--border)); font-size: 12px; }
.ex-line.total b { font-weight: 600; color: hsl(var(--primary)); }
.ex-line b.minus { color: hsl(28 85% 45%); }
.ex-line.total b.minus { color: hsl(28 85% 45%); }
.ex-line.total b.plus { color: hsl(210 70% 45%); }
.ex-line.total b.flat { color: hsl(var(--muted-foreground)); }
.ex-line.sub { padding-left: 8px; font-size: 10.5px; opacity: 0.75; }
.ex-empty { font-size: 11.5px; color: hsl(var(--muted-foreground)); line-height: 1.7; padding: 6px 0; }
.ex-reason {
  margin-top: 10px; padding: 8px 11px; border-radius: 8px;
  background: hsl(38 92% 48% / 0.07); border: 1px solid hsl(38 92% 48% / 0.25);
  font-size: 11.5px; line-height: 1.7; color: hsl(var(--foreground));
}
.ex-reason-k { font-weight: 600; margin-right: 8px; color: hsl(28 85% 42%); }
.ex-meta { display: flex; flex-wrap: wrap; gap: 18px; margin-top: 9px; font-size: 11px; color: hsl(var(--muted-foreground)); }

/* 抽屉明细 */
.detail { display: flex; flex-direction: column; }
.d-emp { padding-bottom: 12px; }
.d-emp-name { font-size: 16px; font-weight: 600; color: hsl(var(--foreground)); }
.d-emp-job { font-size: 12px; font-weight: 400; color: hsl(var(--muted-foreground)); margin-left: 6px; }
.d-emp-sub { font-size: 12px; color: hsl(var(--muted-foreground)); margin-top: 3px; }

.d-timeline { padding: 4px 0 2px; }
.tl-item { display: flex; gap: 10px; }
.tl-rail { display: flex; flex-direction: column; align-items: center; width: 12px; flex-shrink: 0; padding-top: 5px; }
.tl-dot { width: 9px; height: 9px; border-radius: 50%; background: hsl(var(--muted-foreground) / 0.35); }
.tl-item.estimate .tl-dot { background: hsl(38 92% 50%); }
.tl-item.settle .tl-dot { background: hsl(210 70% 52%); }
.tl-item.payout .tl-dot { background: hsl(150 45% 42%); }
.tl-line { flex: 1; width: 1px; background: hsl(var(--border)); margin: 4px 0; }
.tl-body { flex: 1; min-width: 0; padding-bottom: 14px; }
.tl-head { display: flex; align-items: baseline; gap: 8px; }
.tl-label { font-size: 12.5px; font-weight: 600; color: hsl(var(--foreground)); }
.tl-when { font-size: 11px; color: hsl(var(--muted-foreground)); }
.tl-amount { font-size: 19px; font-weight: 600; color: hsl(var(--foreground)); margin: 4px 0 4px; font-variant-numeric: tabular-nums; }
.tl-rows { display: flex; flex-direction: column; gap: 2px; }
.tl-row { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; font-size: 11.5px; color: hsl(var(--muted-foreground)); }
.tl-row b { color: hsl(var(--foreground)); font-weight: 500; font-variant-numeric: tabular-nums; }
.tl-row b.minus { color: hsl(28 85% 45%); }
.tl-row b.plus { color: hsl(210 70% 45%); }
.tl-row b.flat { color: hsl(var(--muted-foreground)); }
.tl-row.sub { padding-left: 8px; font-size: 10.5px; opacity: 0.75; }
.tl-empty { font-size: 11.5px; color: hsl(var(--muted-foreground)); line-height: 1.7; padding: 4px 0; }

.d-reason {
  margin-top: 2px; padding: 9px 11px; border-radius: 8px;
  background: hsl(38 92% 48% / 0.07); border: 1px solid hsl(38 92% 48% / 0.25);
  font-size: 12px; line-height: 1.7; color: hsl(var(--foreground));
}
.d-reason-k { font-weight: 600; margin-right: 8px; color: hsl(28 85% 42%); }

.d-row { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 6px 0; }
.d-key { font-size: 12.5px; color: hsl(var(--muted-foreground)); flex-shrink: 0; }
.d-val { font-size: 12.5px; color: hsl(var(--foreground)); text-align: right; }
.d-val.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
.d-block { padding: 6px 0; }
.d-note {
  font-size: 12.5px; line-height: 1.7; color: hsl(var(--foreground));
  background: hsl(var(--muted) / 0.4); border-radius: 8px; padding: 9px 11px; margin-top: 7px;
}
.d-sep { height: 1px; background: hsl(var(--border)); margin: 12px 0; }
.d-tip {
  font-size: 12px; line-height: 1.65; color: hsl(var(--muted-foreground));
  background: hsl(var(--muted) / 0.35); border-radius: 8px; padding: 9px 11px; margin-top: 12px;
}
.tip-p { margin: 0 0 4px; }
.tip-p:last-child { margin-bottom: 0; }
</style>
