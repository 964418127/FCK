<template>
  <DocShell
    :toc-items="tocItems"
    title="二、变更日志"
    subtitle="同一轮预研只保留一条日志：改动就地更新，不追加历史条目"
    version="v0.1"
    date="2026-10-30"
    :breadcrumbs="breadcrumbs"
  >
    <div id="orch-chg" class="section">
      <div class="section-header">
        <h2>变更日志</h2>
        <DocCopyButton section-id="orch-chg" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 110px;">日期</th><th style="width: 80px;">版本</th><th>变更</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>2026-10-30</td>
            <td>v0.1</td>
            <td>
              <div class="chg-lead">首版：把「一件事」从流程图改写成<strong>提示词 + 子事件清单</strong>，并给出触发后按事实生成的规则。</div>
              <ol class="chg-list">
                <li><strong>模型</strong>：一件事 = 一套提示词 + 一份子事件清单 + 一个触点；<strong>定义期不生成树</strong>，触发后按这一单的人与事实生成子事件。同清单 + 同事实 = 同一份子事件，不靠人再判一遍。</li>
                <li><strong>子事件</strong>：一条子事件 = 一条<strong>可判定的结论</strong> + 一条兑现路径（人办理 / 系统判定 / 系统执行 / 外部回执）+ 门禁（必过 / 可选）。位次不写死，由「前置」推导。</li>
                <li><strong>差异只来自事实</strong>：在跟客户才交接客户，带团队才交接团队，管备用金才结清现金。事实取不到，那一条不长出来，也不许补一条空的凑齐流程。</li>
                <li><strong>审核不是类型，是一条结论</strong>：几级审核就几条结论，先后由前置表达（离职 = 城市总 → 人事）；审核意见是事项里的一个多行文本字段。<strong>不支持或签</strong>；<strong>驳回即终止，重新发起</strong>。</li>
                <li><strong>系统项</strong>：判定看批次（条件归检查 Agent，流程侧只配门禁 / 前置 / 取数频率 / 批次上限）；执行看回执（谁动手、由哪个动作触发、回哪些字段、写回哪个结果字段）。</li>
                <li><strong>载荷三层分清</strong>：登记（对岸承诺发什么）/ 映射（带入哪些、怎么用）/ 值（这一单实际带进来的），触发时按<strong>同一条登记</strong>校验，缺必传或对不上就拒单。</li>
                <li><strong>文档结构</strong>：只写这一层（定义 → 生成 → 办理 → 系统项 → 进度与交付）；业务口径留在各场景自己的需求文档里，不在本文复述。</li>
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

const tocItems = [{ id: 'orch-chg', label: '变更日志' }]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '事件编排', to: '/docs/orchestration' },
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
