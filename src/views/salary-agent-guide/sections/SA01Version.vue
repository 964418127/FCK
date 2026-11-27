<template>
  <DocShell
    :toc-items="tocItems"
    title="一、版本信息"
    subtitle="文档身份、负责人与适用范围"
    version="v2.7"
    date="2026-11-27"
    :breadcrumbs="breadcrumbs"
  >
    <div id="sa-ver" class="section">
      <div class="section-header">
        <h2>版本信息</h2>
        <DocCopyButton section-id="sa-ver" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">项</th><th>内容</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>文档</strong></td><td>薪酬查询 Agent · 产品需求说明</td></tr>
          <tr><td><strong>归属</strong></td><td>模块化薪酬</td></tr>
          <tr><td><strong>版本</strong></td><td>v2.7</td></tr>
          <tr><td><strong>日期</strong></td><td>2026-11-27</td></tr>
          <tr><td><strong>负责人</strong></td><td><strong>Lacus7</strong></td></tr>
          <tr><td><strong>读者</strong></td><td>业务运营 / 人事 / 薪酬结算 / 研发 / 测试</td></tr>
          <tr><td><strong>范围</strong></td><td>员工对【自己】薪酬的查询与求证：岗位底账、围墙体系（通用 + 岗位差异）、应答深度分层、完整求证链、产品入口与人工出口。不含 Agent 的模型选型与入口载体、申诉受理、薪酬计算与发放</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>这份文档只写产品设计：</strong>员工能问什么、Agent 按什么口径答、什么信息永远取不到。
        数据结构与算法不进本文档；围墙规则先于一切功能 —— 本文档没有「功能清单」，只有「边界清单」。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'sa-ver', label: '一、版本信息' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '模块化薪酬', to: '/docs/salary-agent' },
  { label: '一、版本信息' }
]
</script>

<style scoped src="./doc-base.css"></style>
