<template>
  <DocShell
    :toc-items="tocItems"
    title="一、版本信息"
    subtitle="文档身份、负责人与适用范围"
    version="v1.0"
    date="2026-11-05"
    :breadcrumbs="breadcrumbs"
  >
    <div id="pt-ver" class="section">
      <div class="section-header">
        <h2>版本信息</h2>
        <DocCopyButton section-id="pt-ver" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">项</th><th>内容</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>文档</strong></td><td>非全客户经理 · 产品需求说明</td></tr>
          <tr><td><strong>版本</strong></td><td>v1.0（重写版；业务口径沿用原 v1.0，不追溯旧版逐次改动）</td></tr>
          <tr><td><strong>日期</strong></td><td>2026-11-05</td></tr>
          <tr><td><strong>负责人</strong></td><td><strong>Lacus7</strong></td></tr>
          <tr><td><strong>读者</strong></td><td>运营 / 门店管理 / 薪酬结算 / 研发 / 测试 / 非全客户经理（仅移动端页面部分）</td></tr>
          <tr><td><strong>范围</strong></td><td>时段需求（周期时段 / 临时时段）的配置与定时 / 手动发布、移动端承接与打卡、Web 任务跟踪、薪酬计算与看板（单价 / 保底时薪）与员工侧薪酬看板；<strong>不含</strong>全职排班规则本身、人员签约流程、税费与其他薪酬项目、工资发放</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>章节组织：</strong>按公司 PRD 模板分章 —— 一、版本信息 / 二、变更日志 / 三、文档说明 / 四、需求背景 / 五、需求范围 /
        <strong>六、功能详细说明</strong>（6.1 配置 + 6.2–6.8 链路）/ 七、附录。
        功能章节内部用 <strong>6.x.y</strong> 分「看到什么 / 能做什么 / 校验与提示」；逐页交互不单独成册。
        功能章的排序规则是<strong>配置在前、单据在后</strong> —— 6.1 的需求不配好，后面一条任务也生成不出来。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'pt-ver', label: '一、版本信息' }
]
</script>

<style scoped src="./doc-base.css"></style>
