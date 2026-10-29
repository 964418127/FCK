<template>
  <DocShell
    :toc-items="tocItems"
    title="二、变更日志"
    subtitle="同一轮预研只保留一条日志：改动就地更新，不追加历史条目"
    version="v0.3"
    date="2026-10-24"
    :breadcrumbs="breadcrumbs"
  >
    <div id="rf-chg" class="section">
      <div class="section-header">
        <h2>变更日志</h2>
        <DocCopyButton section-id="rf-chg" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 110px;">日期</th><th style="width: 80px;">版本</th><th>变更</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>2026-10-24</td>
            <td>v0.3</td>
            <td>
              <div class="chg-lead">预研版持续修订（对外发版前保持单条日志）。</div>
              <ol class="chg-list">
                <li><strong>链路模型</strong>：发起 → 离职需求审核（一次确认定稿）→ 交接 → 交接完成自动推送离职合同 → 签署。审核确认含原审批全部内容，一次动作两个效果。</li>
                <li><strong>离职需求审核</strong>：审核人由模板配置（1~3 级、每级可多人、或签 / 会签），逐级办结后进入交接。</li>
                <li><strong>交接</strong>：模板一张平铺节点清单，先后只由前置节点决定；节点分必过 / 可选，必过不通过实时终止全部流程。</li>
                <li><strong>系统检查节点</strong>：条件主权归检查 Agent（人员对话式配置、测试后上线）；流程侧只配门禁 / 前置 / 取数频率 / 批次上限，批次上限只计消费到的不同未通过批次。</li>
                <li><strong>补偿金</strong>：走模块化薪酬的第三类单据，签署成立后次月 5 日跑批计算、9 日发放；上限 = 月均 ×（N+1）。</li>
                <li><strong>文档结构</strong>：原「产品需求说明 + 移动端功能说明 + Web 端功能说明」三份合并为本文一份，按模板章节分页；同一规则只在一处定义。</li>
              </ol>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [{ id: 'rf-chg', label: '变更日志' }]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '离职流程', to: '/docs/resign-flow' },
  { label: '二、变更日志' }
]
</script>

<style scoped src="./doc-base.css"></style>

<style scoped>
.chg-lead { font-size: 13px; line-height: 1.75; color: hsl(var(--foreground) / 0.78); margin-bottom: 8px; }
.chg-list { margin: 0; padding: 0; list-style: none; counter-reset: chg; }
.chg-list > li {
  counter-increment: chg; position: relative; padding-left: 24px;
  font-size: 13px; line-height: 1.8; color: hsl(var(--foreground) / 0.88);
}
.chg-list > li + li { margin-top: 7px; }
.chg-list > li::before {
  content: counter(chg) "、"; position: absolute; left: 0; top: 0;
  color: hsl(var(--primary)); font-weight: 600; font-variant-numeric: tabular-nums;
}
.chg-list > li strong { font-weight: 600; color: hsl(var(--foreground)); }
</style>
