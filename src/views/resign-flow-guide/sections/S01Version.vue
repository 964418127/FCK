<template>
  <DocShell
    :toc-items="tocItems"
    title="一、版本信息"
    subtitle="文档身份、负责人与适用范围"
    version="v0.3"
    date="2026-10-24"
    :breadcrumbs="breadcrumbs"
  >
    <div id="rf-ver" class="section">
      <div class="section-header">
        <h2>版本信息</h2>
        <DocCopyButton section-id="rf-ver" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">项</th><th>内容</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>文档</strong></td><td>离职流程 · 产品需求说明</td></tr>
          <tr><td><strong>版本</strong></td><td>v0.3（预研稿；对外发版前始终保持 v0.x）</td></tr>
          <tr><td><strong>日期</strong></td><td>2026-10-24</td></tr>
          <tr><td><strong>负责人</strong></td><td><strong>Lacus7</strong></td></tr>
          <tr><td><strong>读者</strong></td><td>业务（离职办理 / 人事）/ 研发 / 测试 / 薪酬与假勤侧对接方</td></tr>
          <tr><td><strong>范围</strong></td><td>员工离职需求的发起与处理、交接、签署、次月补偿金计算与发放；<strong>不含</strong>人员异动的合同续签（见 6.3.7）</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>章节组织：</strong>按公司 PRD 模板分章 —— 一、版本信息 / 二、变更日志 / 三、文档说明 / 四、需求背景 / 五、需求范围 / <strong>六、功能详细说明</strong>（6.1 配置 + 6.2–6.6 单据）/ 七、附录。
        功能章节内部用 <strong>6.x.y</strong> 分「谁在用 / 看到什么能做什么 / 校验与提示」；逐页交互不单独成册。
        功能章的排序规则是<strong>配置在前、单据在后</strong> —— 6.1 的模板与系统检查不配好，后面每一笔单都无从发起。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [{ id: 'rf-ver', label: '版本信息' }]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '离职流程', to: '/docs/resign-flow' },
  { label: '一、版本信息' }
]
</script>

<style scoped src="./doc-base.css"></style>
