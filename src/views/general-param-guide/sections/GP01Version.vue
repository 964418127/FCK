<template>
  <DocShell
    :toc-items="tocItems"
    title="一、版本信息"
    subtitle="文档身份、负责人与适用范围"
    version="v1.0"
    date="2026-11-10"
    :breadcrumbs="breadcrumbs"
  >
    <div id="gp-ver" class="section">
      <div class="section-header">
        <h2>版本信息</h2>
        <DocCopyButton section-id="gp-ver" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">项</th><th>内容</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>文档</strong></td><td>通用参数（升级）· 产品需求说明</td></tr>
          <tr><td><strong>归属</strong></td><td>模块化薪酬</td></tr>
          <tr><td><strong>版本</strong></td><td>v1.0</td></tr>
          <tr><td><strong>日期</strong></td><td>2026-11-10</td></tr>
          <tr><td><strong>负责人</strong></td><td><strong>Lacus7</strong></td></tr>
          <tr><td><strong>读者</strong></td><td>薪酬配置员 / 业务运营 / 薪酬结算 / 研发 / 测试</td></tr>
          <tr><td><strong>范围</strong></td><td>参数的建、改、启停；数据表的列与数据（含导入导出、试算）；薪酬项引用参数时怎么取值。不含薪酬项自身公式的编排、薪酬计算与发放、税率与社保口径</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>这份文档只写产品设计：</strong>配置员看到什么、能配什么、系统按什么口径取值。
        数据结构与算法不进本文档；本文只对可被业务观察到的行为负责 —— 同一张表配同一组条件，任何时候都取到同一个值。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'gp-ver', label: '一、版本信息' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '模块化薪酬', to: '/docs/general-param' },
  { label: '一、版本信息' }
]
</script>

<style scoped src="./doc-base.css"></style>
