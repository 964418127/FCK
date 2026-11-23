<template>
  <DocShell
    :toc-items="tocItems"
    title="四、需求背景"
    subtitle="核对期的人肉排查消耗：员工先自查自证，剩余升级人工"
    version="v1.0"
    date="2026-11-23"
    :breadcrumbs="breadcrumbs"
  >
    <div id="sa-bg-now" class="section">
      <div class="section-header">
        <h2>现状</h2>
        <DocCopyButton section-id="sa-bg-now" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 110px;">环节</th><th>现状</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>员工</strong></td><td>每到薪酬核对期，凭印象或怀疑对某些薪酬项提出质疑</td></tr>
          <tr><td><strong>人事</strong></td><td>逐条排查、逐条解释，同一类问题反复回答</td></tr>
          <tr><td><strong>技术</strong></td><td>配合查数、核对口径，人力被查询类需求占用</td></tr>
        </tbody>
      </table>
    </div>

    <div id="sa-bg-goal" class="section">
      <div class="section-header">
        <h2>要做的事</h2>
        <DocCopyButton section-id="sa-bg-goal" />
      </div>
      <p class="doc-p">
        做一个薪酬查询 Agent，让员工先对【自己】的薪酬自查自证：大部分质疑在员工侧就地消化，
        剩余的带着明确条目升级到人工。
      </p>
      <div class="note">
        <strong>价值排序：</strong>快速响应员工诉求在前，释放人事到技术的人力在后。
        产品话术对着员工写，不对着省人力写。
      </div>
    </div>

    <div id="sa-bg-wall" class="section">
      <div class="section-header">
        <h2>为什么围墙先行</h2>
        <DocCopyButton section-id="sa-bg-wall" />
      </div>
      <p class="doc-p">
        薪酬属保密级数据。Agent 若把内部口径摊给员工，暴露的不只是他人的数据，
        还有不能摊开的账务处理（例如公积金公司部分的抵扣来源、内部计提规则）。
        因此本文档先定围墙（6.2），再谈能答什么（6.1、6.3）——围墙规则没有例外条目。
      </p>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'sa-bg-now', label: '现状' },
  { id: 'sa-bg-goal', label: '要做的事' },
  { id: 'sa-bg-wall', label: '为什么围墙先行' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '模块化薪酬', to: '/docs/salary-agent' },
  { label: '四、需求背景' }
]
</script>

<style scoped src="./doc-base.css"></style>
