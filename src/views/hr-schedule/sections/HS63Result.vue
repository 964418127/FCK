<template>
  <DocShell
    :toc-items="tocItems"
    title="6.3 排班结果"
    subtitle="谁哪天上了哪个班，只从这一张表读；附带占用矩阵、逐日名额与缺口入口"
    version="v5.0"
    date="2026-11-15"
    :breadcrumbs="breadcrumbs"
  >
    <div id="hs-63" class="section">
      <div class="section-header">
        <h2>6.3 排班结果</h2>
        <DocCopyButton section-id="hs-63" />
      </div>
      <p class="doc-p">
        这一章解决<strong>结果从哪里读</strong>：不管人是被系统派的、自己领的、审核排上的还是被安排顶班的，
        最终都写成同一条记录。任何系统或页面要问「谁哪天在哪个班」，都从这张表读，不另立第二份。
      </p>
      <div class="func-entry">
        <strong>功能入口：</strong>排班策略 v5（原型 <code>/schedule-v5</code>）→ <strong>轮与结果</strong>（占用矩阵 / 排班结果 / 申领登记三块）
      </div>

      <DocScreens
        :height="360"
        :images="[
          { src: roundShot, label: '轮与结果：占用矩阵（行=班次、列=这一轮每一天）+ 排班结果表（唯一记录口）+ 申领登记' }
        ]"
      />
    </div>

    <div id="hs-63-rows" class="section">
      <div class="section-header">
        <h3>6.3.1 排班结果表：唯一记录口</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">字段</th><th style="width: 300px;">取值</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>日期 · 班次 · 人</strong></td><td>哪天、哪条班次、谁</td><td>一条记录 = 一个人占一条班次的一天</td></tr>
          <tr><td><strong>怎么排上的</strong></td><td>直派 · 第 n 档 / 抢 · 第 n 档 / 申领 · 排上（综合分 x） / 顶班 / 顶班 · 补位</td><td>来源跟着动作走，读表的人不用猜</td></tr>
          <tr><td><strong>状态</strong></td><td>有效 / 被覆盖</td><td>被事实覆盖后原记录保留、标记状态，痕迹不删（见 6.4）</td></tr>
          <tr><td><strong>变动历史</strong></td><td>逐条记录发生了什么</td><td>原计划 → 被什么覆盖 → 谁来补位，全程可回看</td></tr>
        </tbody>
      </table>
      <div class="note">
        直派到点分人与申领截止结算<strong>自动写表</strong>；人事不在这张表上手工改人——要改走事实（换班 / 顶班）。
      </div>
    </div>

    <div id="hs-63-matrix" class="section">
      <div class="section-header">
        <h3>6.3.2 占用矩阵与逐日名额</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">区块</th><th style="width: 300px;">展示</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>占用矩阵</strong></td><td>行 = 班次，列 = 这一轮覆盖的每一天；每格「已占 x / N」</td><td>N 是当天名额数；空格 = 班次当天不出勤</td></tr>
          <tr><td><strong>逐日名额</strong></td><td>班次编辑里每一天的名额数，可单日加减</td><td>只改那一天，不动班次配置</td></tr>
          <tr><td><strong>缺口</strong></td><td>有效名额没占满的班次 + 日期</td><td>缺口不自动补人；补人走 6.4 的顶班或临时班次</td></tr>
        </tbody>
      </table>
      <div class="note">
        矩阵列数跟空间轮走：门店 7 列、办公区 30 列（横向滚动）。「排了多少天就显示多少天」，不写死展示范围。
      </div>
    </div>

    <div id="hs-63-apply" class="section">
      <div class="section-header">
        <h3>6.3.3 申领登记</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">项目</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>登记内容</strong></td><td>按「班次 × 日期」分组，组内按综合分从高到低排</td></tr>
          <tr><td><strong>预排标记</strong></td><td>截止后会排上的前 N 名先标出来；<strong>人事只看不审批</strong>，截止系统自动结算</td></tr>
          <tr><td><strong>落选</strong></td><td>截止结算后写明落选原因（综合分不够 / 时间冲突被跳过），人可等下一轮</td></tr>
        </tbody>
      </table>
      <div class="note warn-note">
        <strong>明确不做：</strong>不在结果表上直接改人或删人；个人时间线与被占用历史在 6.4 的事实记录页看，结果表只负责「现在谁在哪个班」。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'
import DocScreens from '../../../docs/components/DocScreens.vue'
import roundShot from '../../../docs/assets/pages/v5-round.png'

const tocItems = [
  { id: 'hs-63', label: '6.3 排班结果' },
  { id: 'hs-63-rows', label: '6.3.1 唯一记录口' },
  { id: 'hs-63-matrix', label: '6.3.2 矩阵与逐日名额' },
  { id: 'hs-63-apply', label: '6.3.3 申领登记' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事中心', to: '/docs/hr-schedule' },
  { label: '六、功能详细说明', to: '/docs/hr-schedule/features' },
  { label: '6.3 排班结果' }
]
</script>

<style scoped src="./doc-base.css"></style>
