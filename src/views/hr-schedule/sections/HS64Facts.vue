<template>
  <DocShell
    :toc-items="tocItems"
    title="6.4 变化与求值"
    subtitle="关闸之后的偏差写一条事实、重算一次、留一个解版本，不回头改历史"
    version="v5.0"
    date="2026-11-15"
    :breadcrumbs="breadcrumbs"
  >
    <div id="hs-64" class="section">
      <div class="section-header">
        <h2>6.4 变化与求值</h2>
        <DocCopyButton section-id="hs-64" />
      </div>
      <p class="doc-p">
        这一章解决<strong>排完之后出偏差怎么办</strong>：关闸以后班次已经落到人头上，再出变化不能改班次配置、也不能手工改结果表，
        只能<strong>写一条事实</strong>。事实一旦写入，系统重算一次得到新的解，旧解留档——
        历史上的每一版都能回看，但任何一版都不被回头修改。
      </p>
      <div class="func-entry">
        <strong>功能入口：</strong>排班策略 v5（原型 <code>/schedule-v5</code>）→ <strong>事实记录</strong>
        （个人时间线 / 待人事处理 / 事实表 / 解版本时间线）
      </div>

      <DocScreens
        :height="380"
        :images="[
          { src: factsShot, label: '事实记录：个人时间线（班次 / 事实 / 补位三条带）+ 待人事处理待办 + 事实表 + 解版本时间线' }
        ]"
      />
    </div>

    <div id="hs-64-facts" class="section">
      <div class="section-header">
        <h3>6.4.1 四类事实</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 90px;">事实</th><th style="width: 300px;">发生什么</th><th>系统怎么处理</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>请假</strong></td><td>人的一段班次时间来不了；可整班也可只请几小时</td><td>整班：时间被占用，名额腾出、按清单顺位找人顶；顶不上发待处理给门店人事。部分时段（如 1 小时）：只占用、不释放、不补人</td></tr>
          <tr><td><strong>顶班</strong></td><td>人事安排另一个人来顶这个班</td><td>经营性安排，通知即可、不需对方同意；顶上后「待人事处理」自动销</td></tr>
          <tr><td><strong>换班</strong></td><td>两个人各拿自己的一天班次对调，同岗位对等</td><td>两条班次同时生效地对调，各自留变动历史；换班请求由对方在移动端答复</td></tr>
          <tr><td><strong>离职</strong></td><td>人离店，从某天起不再来</td><td>只交付事实与实际离职日期；后续班次标记被覆盖，<strong>不找人顶</strong>（补人由招聘侧处理）</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>表达口径：</strong>一切变化都描述为「一段时间被一个事件占用」——不修改个人已获得的班次本身，
        班次上的变化都是占用了它的一部分或全部。
      </div>
    </div>

    <div id="hs-64-timeline" class="section">
      <div class="section-header">
        <h3>6.4.2 个人时间线</h3>
      </div>
      <p class="doc-p">
        横轴是<strong>个人一天的时间</strong>，纵向看三样东西怎么叠出来的：
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">条带</th><th style="width: 300px;">画什么</th><th>读法</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>班次</strong></td><td>这天获取到的班次占住的时间</td><td>第一件事是获取班次占住时间；被占用的段直接在蓝条上标出来</td></tr>
          <tr><td><strong>事实</strong></td><td>哪条事实、谁在什么时候提交、占哪段区间</td><td>提交时刻与占用区间分开写（如「请假 · 11-13 09:12 提交」+「早班整班被占用」）</td></tr>
          <tr><td><strong>补位</strong></td><td>谁来顶的、顶的是哪段</td><td>补位段与原班次并排，看得出「洞被谁弥补了」</td></tr>
        </tbody>
      </table>
    </div>

    <div id="hs-64-solve" class="section">
      <div class="section-header">
        <h3>6.4.3 求值与解版本</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 160px;">步骤</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>写一条事实</strong></td><td>请假 / 顶班 / 换班 / 离职各写各的，一条事实一个事项</td></tr>
          <tr><td><strong>重算一次</strong></td><td>按清单顺位找有空、没冲突的人顶；找得到直接补位并通知，找不到时段留空</td></tr>
          <tr><td><strong>留一个解版本</strong></td><td>每次求值生成一个新版本号 + 变更说明；版本按时间排，只能追加不能改</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>求值没人顶的收口：</strong>发一条「待处理」给门店人事（配置台事实记录页出待办条）——时段留空 + 请假人 + 顺位里没有合适的人，
        人事安排顶班后待办自动销。系统只判定与执行，<strong>兜底决策归人</strong>。
      </div>
    </div>

    <div id="hs-64-notice" class="section">
      <div class="section-header">
        <h3>6.4.4 通知与让位</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 220px;">方向</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>受益方向</strong></td><td>补人、多拿一个班：通知即可</td></tr>
          <tr><td><strong>受损方向</strong></td><td>顶掉已经到手的东西：必须通知 + 补偿；临近开始时间的让位需对方同意</td></tr>
        </tbody>
      </table>
      <div class="note">
        员工侧的通知<strong>统一走通用通知页</strong>（通知模块是通用的，排班不自带通知页）；
        但处理动作都在业务页：补位确认落在班次卡上，换班答复落在「我的排班」里，通知本身只负责告诉你。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'
import DocScreens from '../../../docs/components/DocScreens.vue'
import factsShot from '../../../docs/assets/pages/v5-facts.png'

const tocItems = [
  { id: 'hs-64', label: '6.4 变化与求值' },
  { id: 'hs-64-facts', label: '6.4.1 四类事实' },
  { id: 'hs-64-timeline', label: '6.4.2 个人时间线' },
  { id: 'hs-64-solve', label: '6.4.3 求值与解版本' },
  { id: 'hs-64-notice', label: '6.4.4 通知与让位' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事中心', to: '/docs/hr-schedule' },
  { label: '六、功能详细说明', to: '/docs/hr-schedule/features' },
  { label: '6.4 变化与求值' }
]
</script>

<style scoped src="./doc-base.css"></style>
