<template>
  <DocShell
    :toc-items="tocItems"
    title="6.2 时段模板与班次库"
    subtitle="两个模板语义不同：班次模板引用即继承，时段模板快照实例化；混着用一定会出「改模板把门店改崩」"
    version="v3.0 基线"
    date="2026-11-12"
    :breadcrumbs="breadcrumbs"
  >
    <div id="hs-62" class="section">
      <div class="section-header">
        <h2>6.2 时段模板与班次库</h2>
        <DocCopyButton section-id="hs-62" />
      </div>
      <div class="func-entry">
        <strong>功能入口：</strong>排班策略 → 时段模板；时段详情 → 本店班次库（引用 / 自建 / 改名 / 调时间）
      </div>

      <h3 id="hs-62-1">6.2.1 班次两层：通用模板 + 本店班次库</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">层</th><th style="width: 220px;">内容</th><th style="width: 150px;">谁能改</th><th>语义</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>通用班次模板</strong></td>
            <td>全平台统一班次：早班 10–18（休 60）、晚班 14–22、通班 10–22…</td>
            <td>总部</td>
            <td><strong>引用即继承</strong>：改模板，门店已引用的班次跟着变</td>
          </tr>
          <tr>
            <td><strong>本店班次库</strong></td>
            <td>本容器实际使用的班次；可引用模板，也可自建</td>
            <td>门店</td>
            <td>门店可改名、可调时间，只影响本店</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>为什么通用班次允许「回灌」：</strong>班次要跨店比对身份——「早班」在兴隆湖和麓山必须是同一个东西，
        否则跨店顶班、跨店工时统计全部对不上。<strong>时段不允许回灌</strong>，是因为门店在实例上改过门店级参数。
      </div>

      <h3 id="hs-62-2">6.2.2 时段模板：快照式实例化</h3>
      <p class="doc-p">
        模板是一条时段「从零到可用」的完整配置骨架，只缺容器与具体日期。用模板新建时段时，
        把模板内容<strong>复制一份</strong>写进新时段，之后改模板<strong>不影响已建时段</strong>。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">模板里有</th><th>模板里没有</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>班次引用、适用星期、名额、生成节奏与视野、来源说明</td>
            <td>容器、具体日期、实例 id、申领与结算记录</td>
          </tr>
        </tbody>
      </table>

      <h3 id="hs-62-3">6.2.3 两个语义对照：别混</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">对象</th><th style="width: 170px;">改模板会怎样</th><th style="width: 200px;">为什么这样定</th><th>典型场景</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>班次</strong></td>
            <td>门店跟着变（继承）</td>
            <td>要跨店比对身份</td>
            <td>总部把早班整体提前半小时</td>
          </tr>
          <tr>
            <td><strong>时段</strong></td>
            <td>已建时段不动（快照）</td>
            <td>门店已在实例上改过参数，回灌会覆盖</td>
            <td>门店把本店名额从 6 改成 4</td>
          </tr>
        </tbody>
      </table>
      <div class="note warn-note">
        <strong>建时段的唯一硬约束：</strong>只能挂<strong>本容器已有</strong>的班次。
        想用通用班次就先「引用到本店」——这一步是门店差异化的入口，不能省。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'hs-62', label: '6.2 模板与班次库' },
  { id: 'hs-62-1', label: '6.2.1 班次两层' },
  { id: 'hs-62-2', label: '6.2.2 时段模板' },
  { id: 'hs-62-3', label: '6.2.3 两种语义' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事中心', to: '/docs/hr-schedule' },
  { label: '六、功能详细说明', to: '/docs/hr-schedule/features' },
  { label: '6.2 时段模板与班次库' }
]
</script>

<style scoped src="./doc-base.css"></style>
