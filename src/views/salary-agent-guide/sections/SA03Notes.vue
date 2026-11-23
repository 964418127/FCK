<template>
  <DocShell
    :toc-items="tocItems"
    title="三、文档说明"
    subtitle="跨章节共用的名词口径，先在这里定死"
    version="v1.0"
    date="2026-11-23"
    :breadcrumbs="breadcrumbs"
  >
    <div id="sa-notes" class="section">
      <div class="section-header">
        <h2>名词解释</h2>
        <DocCopyButton section-id="sa-notes" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">名词</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>Agent</strong></td><td>员工在对话里查询、求证自己薪酬的入口。员工用自然语言提问，Agent 按本文档的口径作答</td></tr>
          <tr><td><strong>薪酬政策类</strong></td><td>影响薪酬计算结果的配置信息，如保底、课次单价（客次/新客/评价单价）。同一项配置按城市、门店、人群条件命中后，落到每个员工头上是具体一个数</td></tr>
          <tr><td><strong>模块化薪酬明细</strong></td><td>员工名下完整的几份工资：每份的构成、代扣信息（代扣个税、代扣公积金、代扣社保）、发放时间和发放状态</td></tr>
          <tr><td><strong>工资条</strong></td><td>按发放主体生成的单张工资单。一名员工名下可以有多张；每张含收入组、扣缴组（业务扣款 + 代扣代缴）、发放记录</td></tr>
          <tr><td><strong>代扣代缴</strong></td><td>工资条上「代扣社保、代扣公积金、代扣个税」三项。本文档简称「代扣三类」，见 6.3 的结论式口径</td></tr>
          <tr><td><strong>业务扣款</strong></td><td>投诉扣款、退单扣款等业务产生的扣缴项，与代扣代缴相对</td></tr>
          <tr><td><strong>预扣个税 / 多退少补</strong></td><td>非全职周薪阶段按 3% 预扣个税；月最后的薪酬期真实申报个税后，对当月各期预扣多退少补</td></tr>
          <tr><td><strong>内部名称 / 显示名称</strong></td><td>薪酬项在系统内部有内部名称；工资单上对员工显示的是显示名称。Agent 只用显示名称，内部名称、策略与模板名称不进知识面（6.2）</td></tr>
          <tr><td><strong>常乐豆</strong></td><td>仅全职推拿师、全职客户经理享有的内部激励资产，与薪酬两条线、不参与应税收入；组成只给分类级汇总（不给逐条明细），计算由模块化薪酬的发放策略提供；抵扣公积金的扣减不做解释。Agent 的常乐豆口径见 6.1</td></tr>
          <tr><td><strong>现金工资单 / 常乐豆工资单</strong></td><td>薪酬计算结果按工资单类型分两种：工资（现金）与常乐豆（豆）。同一薪酬项走哪种形式由「策略 × 薪酬项」决定，不是薪酬项本身的属性——非全职推拿师现行薪酬项全部为现金、无常乐豆；各岗位现行清单见 7.2 / 7.3 / 7.4</td></tr>
          <tr><td><strong>围墙</strong></td><td>Agent 取数与作答的边界规则，共三道（6.2）。围墙裁剪发生在数据与知识喂给 Agent 之前 —— 敏感信息不是被藏起来，是不存在</td></tr>
          <tr><td><strong>人工出口</strong></td><td>员工自查后仍不服时的显式转人工路径（6.3）。Agent 不受理申诉、不改任何数据</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>用词约定：</strong>本文档只使用模块化薪酬既有名词与业务现行说法，不造新词。
        「代扣三类」是「代扣社保 / 代扣公积金 / 代扣个税」的合称，仅为行文简洁。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'sa-notes', label: '三、文档说明' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '模块化薪酬', to: '/docs/salary-agent' },
  { label: '三、文档说明' }
]
</script>

<style scoped src="./doc-base.css"></style>
