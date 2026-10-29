<template>
  <DocShell
    :toc-items="tocItems"
    title="三、文档说明"
    subtitle="只收跨章节共用的名词与跨页面统一的字段口径；单页字段与交互在对应功能章节里解释"
    version="v0.3"
    date="2026-10-26"
    :breadcrumbs="breadcrumbs"
  >
    <div id="rf-terms" class="section">
      <div class="section-header">
        <h2>名词解释</h2>
        <DocCopyButton section-id="rf-terms" />
      </div>
      <p class="doc-p">只收<strong>跨章节共用</strong>的名词；单页字段与交互在对应功能章节解释，这里不重复。</p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 220px;">名词</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>离职事实</strong></td><td>员工离职这一判定，由离职流程落地为状态标记。<strong>全系统只此一处产生</strong>，下游各自消费</td></tr>
          <tr><td><strong>实际离职日期</strong></td><td>离职需求审核确认后锁定、<strong>不可撤销</strong>；下游一切结算（工资 / 假勤 / 常乐豆）的锚点</td></tr>
          <tr><td><strong>离职需求审核</strong></td><td>发起后的<strong>第一道关口</strong>：一次确认既进入交接，也预授权「交接完成后自动推送离职合同」（见 6.3）</td></tr>
          <tr><td><strong>检查 Agent</strong></td><td>执行系统检查的独立服务：<strong>查什么、按什么条件判、多久出一批</strong>都由它管；流程只采纳批次结果（见 6.1）</td></tr>
          <tr><td><strong>批次（检查）</strong></td><td>Agent 的一次运行单位：<strong>一个检查项 × 一轮盘查</strong>；条件是批次级、结果逐单（见 6.1）</td></tr>
          <tr><td><strong>取数频率</strong></td><td>离职流程<strong>多久去取一次</strong> Agent 的最新结果（节点配置），与 Agent 的运行节奏相互独立（见 6.1）</td></tr>
          <tr><td><strong>前置节点</strong></td><td>表达先后的<strong>唯一方式</strong>：没配 = 发起后即可办；配了 = 这些前置全部办结后才能办。<strong>并行不是配出来的</strong>，是没配前置的自然结果（见 6.1）</td></tr>
          <tr><td><strong>必过 / 可选</strong></td><td>节点门禁：必过不通过 → <strong>实时终止全部流程</strong>；可选不通过只记录、仍解锁下游，且可由人事跳过（见 6.1）</td></tr>
          <tr><td><strong>已办结 / 当前可办</strong></td><td>已办结 = 完成 / 不通过 / 跳过 / 因终止关闭的统称；当前可办 = 前置已全部办结、还没出结论的节点（见 6.1）</td></tr>
          <tr><td><strong>款出口</strong></td><td>员工福利费从哪条通道出去（一次性补偿金 / 并入薪金）；<strong>由人事与员工协商确定</strong>（见 6.3.4）</td></tr>
          <tr><td><strong>协商类金额</strong></td><td>不在薪酬与福利资产自动核算范围内、由人事协商确定的金额；<strong>离职补偿金的唯一承载对象</strong></td></tr>
          <tr><td><strong>补偿金成立</strong></td><td>签署完成即<strong>协议成立</strong>——说的是这笔补偿金要不要发，<strong>不是某个金额生效</strong>；真实金额在成立后次月冻结跑批才出（见 6.4）</td></tr>
        </tbody>
      </table>
    </div>

    <div id="rf-fields" class="section">
      <div class="section-header">
        <h2>字段字典</h2>
        <DocCopyButton section-id="rf-fields" />
      </div>
      <p class="doc-p">只列<strong>跨页面统一口径</strong>的字段（命名 / 取值范围 / 格式）；其余字段见各功能章节与原型页面。</p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 190px;">字段</th><th style="width: 240px;">位置</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>期望离职日期</strong></td><td>员工侧发起 · 离职意向</td><td>员工填写、必填；<strong>统一命名</strong>，不再使用「最后工作日」</td></tr>
          <tr><td><strong>离职类型</strong></td><td>离职需求审核 · 确认填写</td><td>主动离职（<strong>默认</strong>）/ 协商一致解除劳动合同（可选）；被动离职<strong>不可选</strong>，由异常监控触发（见 6.3）</td></tr>
          <tr><td><strong>补偿金金额</strong></td><td>离职需求审核 · 补偿金卡片</td><td>取值 <strong>0 ～ 上限</strong>，上限 = 过去 12 个月平均收入 ×（N+1）；不许负数，系统不折算（见 6.3.5）</td></tr>
          <tr><td><strong>协商协议附件</strong></td><td>离职需求审核 · 补偿金卡片</td><td>PDF / JPG / PNG，最多 3 个、单个 ≤ 10MB；金额 &gt; 0 时<strong>必传</strong>（见 6.3.5）</td></tr>
          <tr><td><strong>取数频率（fetchFreq）</strong></td><td>模板 · 系统检查抽屉</td><td>间隔值 + 单位（分钟 / 小时 / 天），可设「只取一次」；<strong>与 Agent 运行节奏相互独立</strong>（见 6.1）</td></tr>
          <tr><td><strong>批次上限（maxRuns）</strong></td><td>模板 · 系统检查抽屉</td><td>只计<strong>消费到的不同未通过批次</strong>，同一批次反复取到不重复计数（见 6.1）</td></tr>
          <tr><td><strong>节点结论</strong></td><td>交接 · 节点确认</td><td>完成 / 不通过 / 跳过；逐事项给结论 + 说明 + 附件，只有该节点负责人能确认（见 6.1）</td></tr>
        </tbody>
      </table>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'rf-terms', label: '名词解释' },
  { id: 'rf-fields', label: '字段字典' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '离职流程', to: '/docs/resign-flow' },
  { label: '三、文档说明' }
]
</script>

<style scoped src="./doc-base.css"></style>
