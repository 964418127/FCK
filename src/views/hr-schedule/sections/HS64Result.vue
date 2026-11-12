<template>
  <DocShell
    :toc-items="tocItems"
    title="6.4 排班结果"
    subtitle="唯一记录口：审核通过一条、兜底安排一条，都写既有结果表；带「怎么排上的」与落空余量"
    version="v3.0 基线"
    date="2026-11-12"
    :breadcrumbs="breadcrumbs"
  >
    <div id="hs-64" class="section">
      <div class="section-header">
        <h2>6.4 排班结果</h2>
        <DocCopyButton section-id="hs-64" />
      </div>
      <div class="func-entry">
        <strong>功能入口：</strong>排班策略 → 排班结果（按容器、范围筛选；可只看兜底）
      </div>

      <h3 id="hs-64-1">6.4.1 只有一张表，没有审核单</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">发生什么</th><th style="width: 200px;">写在哪</th><th>为什么</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>审核通过</strong></td><td>排班结果表新增一条</td><td>审核不是节点，是一条结论</td></tr>
          <tr><td><strong>兜底安排</strong></td><td>排班结果表新增一条，来源=兜底</td><td>兜底也是结论，不是补偿记录</td></tr>
          <tr><td><strong>申领被挤出</strong></td><td>申领单状态变化</td><td>申领单只管状态，不进结果表</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>本期不改结果表结构：</strong>新增的只有「怎么排上的」这一列来源说明；
        其余字段沿用既有表，下游读取方式不变。
      </div>

      <h3 id="hs-64-2">6.4.2 一行结果要有哪些信息</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 140px;">字段</th><th style="width: 240px;">示例</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>日期 / 容器 / 时段</strong></td><td>11-16 · 兴隆湖店 · 早班 10–18</td><td>时段取快照，事后改配置不影响历史</td></tr>
          <tr><td><strong>人员 / 人群</strong></td><td>蓝田 · 全职推拿师</td><td>人群取申领那一刻的资格</td></tr>
          <tr><td><strong>怎么排上的</strong></td><td>审核通过 / 先到先得自领 / 轮转排定 / 系统直派 / 兜底·晚班</td><td><strong>只写人话</strong>，不出现模式名与锚点</td></tr>
          <tr><td><strong>审核依据</strong></td><td>综合分 82（产值 40 / 回头 30 / 预约 30）</td><td>只有审核来源才带，便于解释为什么是他</td></tr>
        </tbody>
      </table>

      <h3 id="hs-64-3">6.4.3 落空与余额要看得见</h3>
      <p class="doc-p">
        结果页底部必须显示本批<strong>落空多少名额</strong>。配置对不对，最后就靠这个数字反馈——
        落空持续偏高说明名额给多了或规则太紧，需要回头改时段或改轮。
      </p>
      <div class="note warn-note">
        <strong>不要做「试算」：</strong>配置时不知道会来多少人，算出来的数字是假的；
        想验证就把规则跑一遍看结果表，而不是造一个预估值。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'hs-64', label: '6.4 排班结果' },
  { id: 'hs-64-1', label: '6.4.1 唯一记录口' },
  { id: 'hs-64-2', label: '6.4.2 结果字段' },
  { id: 'hs-64-3', label: '6.4.3 落空可见' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事中心', to: '/docs/hr-schedule' },
  { label: '六、功能详细说明', to: '/docs/hr-schedule/features' },
  { label: '6.4 排班结果' }
]
</script>

<style scoped src="./doc-base.css"></style>
