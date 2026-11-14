<template>
  <DocShell
    :toc-items="tocItems"
    title="6.5 移动端选班"
    subtitle="一套壳按资格过滤，不按岗位分入口；待审与被挤出必须各有下一步，否则链路断在人身上"
    version="v3.0 基线"
    date="2026-11-12"
    :breadcrumbs="breadcrumbs"
  >
    <div id="hs-65" class="section">
      <div class="section-header">
        <h2>6.5 移动端选班</h2>
        <DocCopyButton section-id="hs-65" />
      </div>
      <div class="func-entry">
        <strong>功能入口：</strong>移动端菜单 → 人事组「我的排班」；右上角可低调切换查看视角（演示用）
      </div>

      <h3 id="hs-65-1">6.5.1 三个页签，一套壳</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">页签</th><th style="width: 280px;">显示什么</th><th>不显示什么</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>可选班次</strong></td>
            <td>对她已开放的时段：日期、门店、时间与净工时、已申与剩余名额、截止说明</td>
            <td>没开放的时段完全不出现，<strong>不做灰掉展示</strong></td>
          </tr>
          <tr>
            <td><strong>我的排班</strong></td>
            <td>已得结果 + 怎么排上的 + 待审提示条</td>
            <td>他人排班、内部调度原因</td>
          </tr>
          <tr>
            <td><strong>通知</strong></td>
            <td>已安排、兜底安排、没排上三类</td>
            <td>不解释「为什么没轮到你」的算法细节</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>为什么不分岗位入口：</strong>资格命中与否本来就是规则算出来的结果。
        按岗位做四套壳，等于把规则判断搬到客户端，两边口径一定会分叉。
      </div>

      <h3 id="hs-65-2">6.5.2 申领要当场校验三件事</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">校验</th><th>不通过时</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>时间不交叉</strong></td><td>置灰并写「该时段与已有任务冲突」；跨店间隔不足 30 分钟同样冲突</td></tr>
          <tr><td><strong>单日工时上限</strong></td><td>置灰并写超出多少小时</td></tr>
          <tr><td><strong>名额余量</strong></td><td>已申满则按钮变为「已满」，不让人白点</td></tr>
        </tbody>
      </table>

      <h3 id="hs-65-3">6.5.3 三个状态都不能是死路</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">状态</th><th style="width: 260px;">页面必须给出</th><th>下一步</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>待审</strong></td><td>截止时间 + 审核口径（按业绩排序，不是先到先得）</td><td>截止后自动出结果，无需操作</td></tr>
          <tr><td><strong>被挤出</strong></td><td>明确告知没排上 + 余额已再开放 / 已转兜底</td><td>可再申一轮，或等兜底通知</td></tr>
          <tr><td><strong>兜底安排</strong></td><td>排到哪个班次（可能不是她申的那个）+ 时间</td><td>只通知，不接受拒绝</td></tr>
        </tbody>
      </table>
      <div class="note warn-note">
        <strong>最常见的错法：</strong>只写「未中选」三个字就结束。人不知道还能不能再申、也不知道会不会被自动安排，
        第二天就会出现「我以为没班」的争议。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'hs-65', label: '6.5 移动端选班' },
  { id: 'hs-65-1', label: '6.5.1 三个页签' },
  { id: 'hs-65-2', label: '6.5.2 申领校验' },
  { id: 'hs-65-3', label: '6.5.3 三个状态' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事中心', to: '/docs/hr-schedule' },
  { label: '六、功能详细说明', to: '/docs/hr-schedule/features' },
  { label: '6.5 移动端选班' }
]
</script>

<style scoped src="./doc-base.css"></style>
