<template>
  <DocShell
    :toc-items="tocItems"
    title="6.5 移动端"
    subtitle="员工在自己手机上只看两件事：我的排班、能领的班"
    version="v5.0"
    date="2026-11-15"
    :breadcrumbs="breadcrumbs"
  >
    <div id="hs-65" class="section">
      <div class="section-header">
        <h2>6.5 移动端</h2>
        <DocCopyButton section-id="hs-65" />
      </div>
      <p class="doc-p">
        这一章解决<strong>员工端看到什么、能做什么</strong>。移动端只有两个页签：我的排班、可获取。
        按月排的空间（如总部办公区）整月都显示——<strong>排到哪天就显示哪天</strong>，日期范围跟着该空间这一轮的覆盖区间走。
      </p>
      <div class="func-entry">
        <strong>功能入口：</strong>移动端菜单 → 人事组 → <strong>我的排班</strong>（原型 <code>/v5/m</code>）；右上角切演示视角
      </div>

      <DocScreens
        mode="phone"
        :images="[
          { src: mineShot, label: '我的排班：月历承载整月班次，选中日看当天班次卡' },
          { src: pickShot, label: '可获取：日期条按这一轮铺（门店 7 天 / 办公区整月 30 天），能拿的直接拿' }
        ]"
      />
    </div>

    <div id="hs-65-mine" class="section">
      <div class="section-header">
        <h3>6.5.1 我的排班</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">区域</th><th style="width: 320px;">展示</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>月历</strong></td><td>这一轮覆盖的每一天，有班的日子打点；按月排的空间整月都有班</td><td>顶部统计是这一期的口径（本期班次数 / 合计工时）</td></tr>
          <tr><td><strong>当天班次卡</strong></td><td>班次名、时间、空间；「这条班怎么来的」（系统排给你的 / 自己领的）</td><td>直派的班写明「系统按规则直接排给你的，不用抢」</td></tr>
          <tr><td><strong>被占用历史</strong></td><td>这条班的哪一段时间被什么事件占用、谁来顶的</td><td>「一段时间被事件占用」的表达，不改动班次本身</td></tr>
          <tr><td><strong>动作</strong></td><td>这天我来不了（发起请假）；找人对换（发起换班）</td><td>人事安排的补位确认直接落在班次卡上：待你确认 + 去不了 / 收到，我来</td></tr>
        </tbody>
      </table>
    </div>

    <div id="hs-65-pick" class="section">
      <div class="section-header">
        <h3>6.5.2 可获取</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">区域</th><th style="width: 320px;">展示</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>日期条</strong></td><td>这一轮覆盖的每一天一格，标「n 个 / 拿不了 / 已过 / —」</td><td>门店 7 格、办公区 30 格横向滑动；选中格自动滑到视野中间</td></tr>
          <tr><td><strong>当天名额卡</strong></td><td>班次、时间、面向谁、已占 x / N、获取方式</td><td>先到先得点一下就成；申领先登记、截止后按综合分排序</td></tr>
          <tr><td><strong>当场判定</strong></td><td>成不了当场说原因</td><td>不是你的档 / 没到开放时间 / 时间重叠 / 已占满，原因前置不事后通知失败</td></tr>
          <tr><td><strong>没有可领时</strong></td><td>整轮没有开放名额时直说</td><td>直派空间显示「这里的班排完直接分给你，没有要你领的名额」</td></tr>
        </tbody>
      </table>
    </div>

    <div id="hs-65-notice" class="section">
      <div class="section-header">
        <h3>6.5.3 通知与明确不做</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 220px;">事项</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>通知</strong></td><td>排班类通知是通用通知页里的示例，不在排班页自带通知段；通知只负责告诉你，处理动作都在业务页</td></tr>
          <tr><td><strong>换班请求</strong></td><td>落在「我的排班」顶部：有人想跟你换班 + 拒绝 / 同意换班——换班是关于某一天的，处理也在这一天</td></tr>
          <tr><td><strong>补位确认</strong></td><td>落在当天班次卡上：待你确认 + 我去不了 / 收到，我来</td></tr>
          <tr><td><strong>明确不做</strong></td><td>不做「浏览别的岗位班次自己挑」的入口；关闸之后个人不挑班，只能看到人事的安排</td></tr>
        </tbody>
      </table>
      <div class="note warn-note">
        <strong>关闸前后的分界：</strong>关闸前 = 个人自己领（档位或临时班次两条路）；关闸后 = 人事安排（顶班事实、通知即可）。
        跨岗位的班也走同一套「可获取」——清单里有没有圈到你、窗口开没开，决定你在手机里看到什么。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'
import DocScreens from '../../../docs/components/DocScreens.vue'
import mineShot from '../../../docs/assets/pages/m5-mine.png'
import pickShot from '../../../docs/assets/pages/m5-pick.png'

const tocItems = [
  { id: 'hs-65', label: '6.5 移动端' },
  { id: 'hs-65-mine', label: '6.5.1 我的排班' },
  { id: 'hs-65-pick', label: '6.5.2 可获取' },
  { id: 'hs-65-notice', label: '6.5.3 通知与不做' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事中心', to: '/docs/hr-schedule' },
  { label: '六、功能详细说明', to: '/docs/hr-schedule/features' },
  { label: '6.5 移动端' }
]
</script>

<style scoped src="./doc-base.css"></style>
