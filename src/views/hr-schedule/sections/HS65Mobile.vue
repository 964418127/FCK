<template>
  <DocShell
    :toc-items="tocItems"
    title="6.5 移动端"
    subtitle="员工在自己手机上只看两件事：我的排班、能领的班"
    version="v5.2"
    date="2026-11-17"
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
          <tr><td><strong>动作</strong></td><td>找人对换（发起换班）</td><td>请假不在排班页发起——走专门的请假模块；补位确认落在班次卡上：待你确认 + 收到，我来</td></tr>
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
          <tr><td><strong>当天名额卡</strong></td><td>班次、时间、面向谁、已占 x / N、获取方式</td><td>先到先得点一下就成；申领先登记、截止后按综合分排序（截止时刻是轮级的，页头横幅显示）</td></tr>
          <tr><td><strong>分类必选数量</strong></td><td>配了类别规则的空间：类头进度（要求 n 条 · 占 x 条 · 还差）+ 卡上「选这条」勾选 + 底部集合提交条</td><td>同类任一条都算数，勾满一起提交；额度（周 / 月）进度随勾选实时变化</td></tr>
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
          <tr><td><strong>通知</strong></td><td>排班类通知是通用通知页里的示例，不在排班页自带通知段；通知只负责告诉你，处理动作都在业务页；<strong>全部通知清单见 <router-link to="/docs/hr-schedule/6-6">6.6 通知</router-link></strong></td></tr>
          <tr><td><strong>换班请求</strong></td><td>落在「我的排班」顶部：有人想跟你换班 + 拒绝 / 同意换班——换班是关于某一天的，处理也在这一天</td></tr>
          <tr><td><strong>补位确认</strong></td><td>落在当天班次卡上：待你确认 + 收到，我来；确认后的变化由事实与通知走（见 6.4 / 6.6）</td></tr>
          <tr><td><strong>明确不做</strong></td><td>不做「浏览别的岗位班次自己挑」的入口；关闸之后个人不挑班，只能看到人事的安排</td></tr>
        </tbody>
      </table>
      <div class="note warn-note">
        <strong>关闸前后的分界：</strong>关闸前 = 个人自己领（档位或临时班次两条路）；关闸后 = 人事安排（顶班事实、通知即可）。
        跨岗位的班也走同一套「可获取」——清单里有没有圈到你、窗口开没开，决定你在手机里看到什么。
      </div>
    </div>

    <div id="hs-65-gallery" class="section">
      <div class="section-header">
        <h3>6.5.4 各岗位 × 合作性质的移动端画面全录</h3>
      </div>
      <p class="doc-p">
        业务上在排班阶段出现的<strong>每个岗位、每种合作性质、每种班次形态</strong>，员工在移动端看到的画面如下。
        每组截图就是该类人登录后真实看到的样子——研发按这些画面实现，不需要再猜「某类人打开是什么」。
      </p>

      <h4 class="h4sub">全职推拿师（门店）——直派为主，通班申领、临时加场自己领</h4>
      <DocScreens mode="phone" :images="[
        { src: mTuinaFullMine, label: '我的排班：系统排定的班 + 有一天被请假占用（划线留痕）、补位由陈晚接手' },
        { src: mTuinaFullPick, label: '可获取：通班（申领审核）+ 周六晚加场（临时班次，先到先得）' },
        { src: mApplySheet, label: '申领确认：登记不占名额，截止后按综合分排序，显示当前登记人数与自己的综合分' }
      ]" />

      <h4 class="h4sub">全职客户经理（门店）——直派为主，通班与临时加场同样可领</h4>
      <DocScreens mode="phone" :images="[
        { src: mKejingFullMine, label: '我的排班：直派班次「已排定」，卡上只有「找人换班」（请假走专门的请假模块，不在这里发起）' },
        { src: mKejingFullPick, label: '可获取：通班申领 + 临时加场抢——直派的班不出现领的入口，没被直派占的场次照常放出' }
      ]" />

      <h4 class="h4sub">非全推拿师（门店）——先到先得 + 申领混合</h4>
      <DocScreens mode="phone" :images="[
        { src: mTuinaPtPick, label: '可获取：早/晚班先到先得 + 通班申领 + 临时加场，一张卡一种拿法' },
        { src: mGrabSheet, label: '抢确认：当场生效的三条检查（不撞车 / 剩余名额），先到先得点了就成' }
      ]" />

      <h4 class="h4sub">非全推拿师（兴隆湖）——分类必选数量：A 类每天至少 1 条</h4>
      <DocScreens mode="phone" :images="[
        { src: mCatRequirePick, label: '还差的状态：A 类 0 条（要求至少 1）、每天 6–9 小时还差、周/月额度余量；卡上是「选这条」勾选按钮，底部集合提交条' },
        { src: mCatRequireSelected, label: '勾选后：A 类进度变 1 条满足要求，底部「已选 1 条 · 合计 4 小时 · 可以提交」——同类任一条都算数' }
      ]" />

      <h4 class="h4sub">非全客户经理（兴隆湖）——三档错峰累计开放</h4>
      <DocScreens mode="phone" :images="[
        { src: mKejingPtPick, label: '可获取：周期时段三档——本店非全客经先开，后面的档还没到窗口；额度进度按兴隆湖自己的算' }
      ]" />

      <h4 class="h4sub">被安排顶班的人——补位确认落在班次卡上</h4>
      <DocScreens mode="phone" :images="[
        { src: mMakeupConfirm, label: '系统补位 + 待你确认：有人请假系统按顺位找到你；「收到，我来」记回执，去不了走专门的请假模块' }
      ]" />

      <h4 class="h4sub">被发起换班的人——换班请求落在「我的排班」顶部</h4>
      <DocScreens mode="phone" :images="[
        { src: mSwapRequest, label: '换班请求：谁、拿哪天的哪个班换你哪天的哪个班；双方同意才生效，拒绝或超时两边都不动' }
      ]" />

      <h4 class="h4sub">办公区·全职产品经理——按月直派，人只收通知</h4>
      <DocScreens mode="phone" :images="[
        { src: mOfficeDirectMine, label: '我的排班：整月月历（按月排的空间整月都显示），白/晚班系统分好，没有领的入口' }
      ]" />

      <h4 class="h4sub">办公区·非全产品经理——周末班自己领</h4>
      <DocScreens mode="phone" :images="[
        { src: mOfficePtPick, label: '可获取：周末晚班先到先得；按月铺的日期条整月 30 格' }
      ]" />
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'
import DocScreens from '../../../docs/components/DocScreens.vue'
import mineShot from '../../../docs/assets/pages/m5-mine.png'
import pickShot from '../../../docs/assets/pages/m5-pick.png'
import mTuinaFullMine from '../../../docs/assets/pages/v5-m-tuina-full-mine.png'
import mTuinaFullPick from '../../../docs/assets/pages/v5-m-tuina-full-pick.png'
import mApplySheet from '../../../docs/assets/pages/v5-m-apply-sheet.png'
import mKejingFullMine from '../../../docs/assets/pages/v5-m-kejing-full-mine.png'
import mKejingFullPick from '../../../docs/assets/pages/v5-m-kejing-full-pick.png'
import mTuinaPtPick from '../../../docs/assets/pages/v5-m-tuina-pt-pick.png'
import mGrabSheet from '../../../docs/assets/pages/v5-m-grab-sheet.png'
import mCatRequirePick from '../../../docs/assets/pages/v5-m-cat-require-pick.png'
import mCatRequireSelected from '../../../docs/assets/pages/v5-m-cat-require-selected.png'
import mKejingPtPick from '../../../docs/assets/pages/v5-m-kejing-pt-pick.png'
import mMakeupConfirm from '../../../docs/assets/pages/v5-m-makeup-confirm.png'
import mSwapRequest from '../../../docs/assets/pages/v5-m-swap-request.png'
import mOfficeDirectMine from '../../../docs/assets/pages/v5-m-office-direct-mine.png'
import mOfficePtPick from '../../../docs/assets/pages/v5-m-office-pt-pick.png'

const tocItems = [
  { id: 'hs-65', label: '6.5 移动端' },
  { id: 'hs-65-mine', label: '6.5.1 我的排班' },
  { id: 'hs-65-pick', label: '6.5.2 可获取' },
  { id: 'hs-65-notice', label: '6.5.3 通知与不做' },
  { id: 'hs-65-gallery', label: '6.5.4 各岗位画面全录' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事中心', to: '/docs/hr-schedule' },
  { label: '六、功能详细说明', to: '/docs/hr-schedule/features' },
  { label: '6.5 移动端' }
]
</script>

<style scoped src="./doc-base.css"></style>
