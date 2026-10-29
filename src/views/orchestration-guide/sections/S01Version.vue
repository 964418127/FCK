<template>
  <DocShell
    :toc-items="tocItems"
    title="一、版本信息"
    subtitle="文档身份、负责人与适用范围"
    version="v0.1"
    date="2026-10-30"
    :breadcrumbs="breadcrumbs"
  >
    <div id="orch-ver" class="section">
      <div class="section-header">
        <h2>版本信息</h2>
        <DocCopyButton section-id="orch-ver" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">项</th><th>内容</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>文档</strong></td><td>事件编排 · 产品需求说明</td></tr>
          <tr><td><strong>版本</strong></td><td>v0.1（预研稿；对外发版前始终保持 v0.x）</td></tr>
          <tr><td><strong>日期</strong></td><td>2026-10-30</td></tr>
          <tr><td><strong>负责人</strong></td><td><strong>Lacus7</strong></td></tr>
          <tr><td><strong>读者</strong></td><td>业务（人事 / 城市总 / 店长 / 财务 / IT）/ 研发 / 测试 / 各对岸系统（员工自助端、检查 Agent、电子签、薪酬与假勤）</td></tr>
          <tr><td><strong>范围</strong></td><td>一件事怎么<strong>定义</strong>（管谁、提示词、子事件清单、触点）、触发后怎么<strong>生成</strong>这一单的子事件、怎么<strong>办</strong>、系统怎么<strong>判</strong>与<strong>执行</strong>、进度怎么<strong>看</strong>与<strong>调</strong>、最后怎么<strong>交</strong>给下游。<strong>不含</strong>薪酬与社保的计算口径（见「模块化薪酬」）、系统检查项的判定条件（归检查 Agent）、具体业务系统的内部处理</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>章节组织：</strong>按公司 PRD 模板分章 —— 一、版本信息 / 二、变更日志 / 三、文档说明 / 四、需求背景 / 五、需求范围 / <strong>六、功能详细说明</strong>（6.1 事件定义 + 6.2–6.6 一单的时间线）/ 七、附录。
        功能章节内部用 <strong>6.x.y</strong> 分「谁在用 / 看到什么能做什么 / 校验与提示」；逐页交互不单独成册。
        功能章的排序规则是<strong>定义在前、单据在后</strong> —— 6.1 那套提示词与子事件清单没定下来，后面每一单都无从发起。
      </div>
      <div class="note">
        <strong>与其他文档的关系：</strong>本文只讲「一类事怎么被编排成可办的子事件」这一层。
        具体某件事的业务口径（例如离职的补偿金怎么算、常乐豆怎么处理）仍写在那件事自己的需求文档里（如<router-link to="/docs/resign-flow">离职流程 · 产品需求说明</router-link>）；
        本文用「离职」作贯穿示例，是为了让抽象规则有一处可核对的具体形状，<strong>不重复定义离职的业务规则</strong>。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [{ id: 'orch-ver', label: '版本信息' }]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '事件编排', to: '/docs/orchestration' },
  { label: '一、版本信息' }
]
</script>

<style scoped src="./doc-base.css"></style>
