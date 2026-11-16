<template>
  <DocShell
    :toc-items="tocItems"
    title="6.2 轮与获取"
    subtitle="轮把清单切成一段窗口：等系统派、自己点、提交申领，只有这三种动作"
    version="v5.2"
    date="2026-11-17"
    :breadcrumbs="breadcrumbs"
  >
    <div id="hs-62" class="section">
      <div class="section-header">
        <h2>6.2 轮与获取</h2>
        <DocCopyButton section-id="hs-62" />
      </div>
      <p class="doc-p">
        这一章解决<strong>名额怎么落到人头上</strong>：轮是发布出来的一个时段（铺哪几天、什么时候开放、什么时候截止），
        6.1 配好的清单在每一轮里被逐档执行。员工的动作只有三种：等系统派、自己点、提交申领。
      </p>
      <div class="func-entry">
        <strong>功能入口：</strong>排班策略 v5（原型 <code>/schedule-v5</code>）→ <strong>轮与结果</strong>；
        排班节奏在「时段与清单」页头的折叠条里改（轮跟空间走，每个空间一套节奏）
      </div>
    </div>

    <div id="hs-62-rhythm" class="section">
      <div class="section-header">
        <h3>6.2.1 排班节奏：业务周</h3>
      </div>
      <DocScreens
        :height="420"
        :images="[
          { src: rhythmShot, label: '节奏折叠条：周期类型四选，业务周三行参数配完直接落成下一轮的具体日期时间' }
        ]"
      />
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">参数</th><th style="width: 280px;">定义</th><th>现行口径（门店）</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>循环周期</strong></td><td>周期类型四选：业务周 / 自然周 / 自然月 / 业务自定义；业务周 = 每周几为起点</td><td>业务周，周一起</td></tr>
          <tr><td><strong>发布</strong></td><td>每周几什么时间发布，发布的是<strong>几个业务周之后的那期</strong></td><td>周四 06:00，发布下下周那期</td></tr>
          <tr><td><strong>申领截止</strong></td><td>发布后 n 天的时刻</td><td>发布后 2 天 20:00（周六）</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>两条口径：</strong>① 每次触发生成的都是「下一个还没排的周期」，一期接一期连续铺，不跳期；
        ② <strong>发布 ≠ 生效</strong>——周四发布的班是下下周才用的，发布当天窗口打开让人选，到那一周才生效使用。
        页面上配置落成具体日期时间（如「下一轮 11/19 06:00 生成 · 铺 11/30–12/6」），研发与业务看到同一句话。
      </div>
    </div>

    <div id="hs-62-round" class="section">
      <div class="section-header">
        <h3>6.2.2 轮的三个时刻与四态并存</h3>
      </div>
      <DocScreens
        :height="420"
        :images="[
          { src: roundShot, label: '轮与结果：顶部轮条四态并存（已结束 / 执行中 / 已截止待开始 / 申领中）+ 空间时间轴' }
        ]"
      />
      <table class="data-table">
        <thead>
          <tr><th style="width: 120px;">时刻</th><th style="width: 260px;">发生什么</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>发布</strong></td><td>按节奏定时生成，铺出这一轮的班次与名额快照</td><td>配置改动从下一轮起生效；当前轮快照不变</td></tr>
          <tr><td><strong>开放</strong></td><td>清单逐档按各自的开放窗口放开</td><td>分档开放就是「错峰」：不同的人在不同时刻看同一个班</td></tr>
          <tr><td><strong>关闸</strong></td><td>申领类 = 申领截止；抢类 = 班次开班（时段开始即关，现行口径定为规则）</td><td>关闸是变化段的起点：关闸前的缺席属获取段，关闸后的偏差走事实（见 6.4）</td></tr>
        </tbody>
      </table>
      <div class="note">
        多轮并存是常态：上一轮在执行中、这一轮已截止待开始、下一轮正在申领——互不干扰，切换查看即可。
      </div>
    </div>

    <div id="hs-62-ways" class="section">
      <div class="section-header">
        <h3>6.2.3 三种获取方式</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 120px;">方式</th><th style="width: 320px;">执行口径</th><th>员工看到什么</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>直派轮转</strong></td><td>到点系统直接分人，分人时刻 = 该档窗口开放时刻；轮换次序按轮顺延；重跑不重复分</td><td>「系统按规则直接排给你的，不用抢」；名额被占前不出现可领入口</td></tr>
          <tr><td><strong>先到先得</strong></td><td>窗口内自己点，点一下就成；成不了当场说原因</td><td>「抢」按钮 + 已占 x / N；冲突当场报原因</td></tr>
          <tr><td><strong>申领审核</strong></td><td>窗口内提交申领，截止后按综合分排序截断；落空的写明落选原因</td><td>「申领」登记 + 截止时刻；结果在排班结果里看</td></tr>
        </tbody>
      </table>
    </div>

    <div id="hs-62-gate" class="section">
      <div class="section-header">
        <h3>6.2.4 可见 ≠ 可拿：当场判定</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 180px;">判定</th><th>原因话术</th></tr>
        </thead>
        <tbody>
          <tr><td>不是这一档的人</td><td>「这一档不是你的档」</td></tr>
          <tr><td>窗口没到 / 已过</td><td>「还没到开放时间」/「已过」</td></tr>
          <tr><td>时间冲突</td><td>「与你的另一段时间重叠」；首尾相接可以接</td></tr>
          <tr><td>名额没了</td><td>「已占满」</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>冲突只查时段重叠</strong>（同一天两条班时间撞上，首尾相接不算）；工时上限不在排班里判——
        全职超限记加班、非全超限排不了，由获取端背后的工时规则算。
      </div>
    </div>

    <div id="hs-62-balance" class="section">
      <div class="section-header">
        <h3>6.2.5 名额没占满：三条去向</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 160px;">去向</th><th style="width: 320px;">怎么走</th><th>什么时候用</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>再开一轮</strong></td><td>改配置（加档、放宽人群），下一轮生效</td><td>结构性的余量：配法本身不对</td></tr>
          <tr><td><strong>兜底序列</strong></td><td>同一天最后开放的班次（通班）把前面落空的人收进去；直派到点执行</td><td>跨班次的兜底：早 / 晚没排上的人进通班</td></tr>
          <tr><td><strong>不管</strong></td><td>余量留给下一轮，或人事当场补（临时班次）</td><td>偶发余量，不值得为它改配置</td></tr>
        </tbody>
      </table>
      <div class="note warn-note">
        <strong>关闸这条线要划清：</strong>关闸前有人缺席 = 名额本来就没人占，走获取段重新放开即可，不产生事件；
        关闸后有人来不了 = 名额已经落到人头上，走变化段写事实（见 6.4）。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'
import DocScreens from '../../../docs/components/DocScreens.vue'
import rhythmShot from '../../../docs/assets/pages/v5-rhythm.png'
import roundShot from '../../../docs/assets/pages/v5-round.png'

const tocItems = [
  { id: 'hs-62', label: '6.2 轮与获取' },
  { id: 'hs-62-rhythm', label: '6.2.1 排班节奏' },
  { id: 'hs-62-round', label: '6.2.2 轮的三个时刻' },
  { id: 'hs-62-ways', label: '6.2.3 三种获取方式' },
  { id: 'hs-62-gate', label: '6.2.4 可见≠可拿' },
  { id: 'hs-62-balance', label: '6.2.5 名额没占满' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事中心', to: '/docs/hr-schedule' },
  { label: '六、功能详细说明', to: '/docs/hr-schedule/features' },
  { label: '6.2 轮与获取' }
]
</script>

<style scoped src="./doc-base.css"></style>
