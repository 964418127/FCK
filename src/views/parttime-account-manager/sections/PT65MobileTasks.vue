<template>
  <DocShell
    :toc-items="tocItems"
    title="6.5 任务承接"
    subtitle="可选择任务与我的任务两个视角；自己选中即「待到店」，他人转发来的任务需本人接受"
    version="v1.0"
    date="2026-11-11"
    :breadcrumbs="breadcrumbs"
  >
    <div id="pt-65-overview" class="section">
      <div class="section-header">
        <h2>6.5 任务承接</h2>
        <DocCopyButton section-id="pt-65" />
      </div>
      <div class="func-entry"><strong>功能入口：</strong>移动端 → 非全客户经理 → <strong>我的任务 / 可选任务</strong>（原型 <code>/mobile-parttime-tasks</code>）；通知入口 <code>/mobile-notification</code></div>

      <DocScreens
        mode="phone"
        :images="[
          { src: mTasksMineShot, label: '我的任务：三个数 + 月历 + 分组记录；待到店卡带「打卡提醒」三次节点（6.6.10）' },
          { src: mTasksOpenShot, label: '可选任务：周期与门店筛选 + 七天日期条，卡片给「剩余 / 总名额」' },
          { src: mTasksConflictShot, label: '同一天只能一段：兴隆湖 15–17 已选后，麓山 16–18 置灰并写冲突' },
          { src: mTasksCancelShot, label: '取消任务：写明「不予结算 / 无需再到店」，原因必填才能提交' },
          { src: mTasksForwardShot, label: '转发弹窗：候选人标可接替 / 不可接替，写明对方接受才转出、30 分钟未接受自动退回' },
          { src: mTasksIncomingShot, label: '待您接受：转发人 + 门店时段 + 剩余分钟；接受进待到店，拒绝退回原承接人' }
        ]"
      />
    </div>

    <div id="pt-65-entry" class="section">
      <div class="section-header">
        <h3>6.5.1 入口</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 160px;">入口</th><th>行为</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>任务通知</strong></td><td>点击<strong>打开任务列表</strong>，通知页不重复展开详情</td></tr>
          <tr><td><strong>转发邀请通知</strong></td><td>点击进<strong>我的任务</strong>，在顶部「待您接受」卡片表态</td></tr>
          <tr><td><strong>打卡提醒通知</strong></td><td>点击直接进<strong>打卡页</strong>，省掉选门店那一步（6.6.10）</td></tr>
          <tr><td><strong>应用内菜单</strong></td><td>直接进列表，默认停在「可选任务」</td></tr>
        </tbody>
      </table>
    </div>

    <div id="pt-65-struct" class="section">
      <div class="section-header">
        <h3>6.5.2 页面结构</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 140px;">区域</th><th style="width: 200px;">功能</th><th>展示边界</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>日期导航</strong></td><td>按日期 / 星期切换</td><td>方便找具体某天</td></tr>
          <tr><td><strong>可选任务</strong></td><td>看周期发布出的可接任务</td><td>只展示<strong>此刻对本人开放</strong>的（6.1.3）；排班日之前<strong>看得到接不了</strong>（6.1.4）；当天已占用的时段置灰；<strong>不展示他人信息</strong></td></tr>
          <tr><td><strong>待您接受</strong></td><td>他人转发来、还没表态的任务</td><td>只在<strong>我的任务</strong>顶部出现，有才显示；给门店、时段、还剩多少分钟，两个按钮接受 / 拒绝</td></tr>
          <tr><td><strong>我的任务</strong></td><td>已选择与执行中的任务</td><td>状态为待到店 / 已到店 / 已离店；<strong>自己选的与系统派的都直接「待到店」</strong>，只有转发来的才要接受</td></tr>
        </tbody>
      </table>
    </div>

    <div id="pt-65-select" class="section">
      <div class="section-header">
        <h3>6.5.3 先分可见、再论可接</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 90px;">关</th><th style="width: 260px;">判什么</th><th>不通过时看到什么</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>可见</strong></td><td>策略此刻已开放到第几档（6.1.3），本人是否在已开放档内</td><td><strong>什么都不显示</strong>，也不解释</td></tr>
          <tr><td><strong>可接</strong></td><td>是否到<strong>排班日</strong>（6.1.4）+ 名额 + 下表六项</td><td>卡片照常显示，按钮置灰并给<strong>具体原因</strong></td></tr>
        </tbody>
      </table>
      <p class="doc-p"><strong>可接层先到先得</strong>：一个名额只能被一人占用，选择成功即锁定。按顺序校验，任一不过即不可承接。</p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 50px;">#</th><th style="width: 170px;">校验</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td>1</td><td><strong>签约门店</strong></td><td>与<strong>门店</strong>签约，不与商圈签约；任务门店须为本人签约门店</td></tr>
          <tr><td>2</td><td><strong>剩余名额</strong></td><td>满则不可选，以服务端占用结果为准</td></tr>
          <tr><td>3</td><td><strong>时段重叠</strong></td><td>与本人已有任务重叠则不可选</td></tr>
          <tr><td>4</td><td><strong>跨店通勤缓冲</strong></td><td>相邻任务间留 30 分钟（暂定，见附录）</td></tr>
          <tr><td>5</td><td><strong>单日累计工时</strong></td><td>叠加超上限则不可选</td></tr>
          <tr><td>6</td><td><strong>服务门店数</strong></td><td>当日已达上限则不可选</td></tr>
        </tbody>
      </table>
      <h4 class="h4sub">同一天只有一条时间轴</h4>
      <table class="data-table">
        <thead>
          <tr><th style="width: 200px;">当天已有一段</th><th style="width: 200px;">再选这一段</th><th>结果</th></tr>
        </thead>
        <tbody>
          <tr><td>兴隆湖 15:00–17:00</td><td><strong>麓山</strong> 16:00–18:00</td><td><strong>不可选</strong>：时间重叠，换店不换时间</td></tr>
          <tr><td>兴隆湖 10:00–12:00</td><td>兴隆湖 11:00–13:00</td><td><strong>不可选</strong>：同店也不许重叠</td></tr>
          <tr><td>兴隆湖 10:00–12:00</td><td>麓山 12:15–14:15</td><td><strong>不可选</strong>：间隔 15 分钟，不够跨店通勤</td></tr>
          <tr><td>兴隆湖 10:00–12:00</td><td>麓山 13:00–15:00</td><td>可选：间隔 1 小时</td></tr>
          <tr><td>兴隆湖 10:00–12:00</td><td>兴隆湖 12:00–14:00</td><td>可选：<strong>同店不用留通勤</strong>，视为连续班</td></tr>
        </tbody>
      </table>
      <div class="note">
        只比<strong>时间</strong>，不看是否同商圈、同需求、同批次；已<strong>取消或转出</strong>的任务不再占用时间轴。选择成功直接进<strong>「待到店」</strong>，不再让人「确认接受」。
      </div>
    </div>

    <div id="pt-65-status" class="section">
      <div class="section-header">
        <h3>6.5.4 状态与可执行动作</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 190px;">业务状态</th><th style="width: 160px;">用户看到的文案</th><th>可执行动作</th></tr>
        </thead>
        <tbody>
          <tr><td>可选择且有名额</td><td>选择任务</td><td>选择，成功后进待到店</td></tr>
          <tr><td>本人已选择</td><td><strong>我已选择</strong></td><td>进入任务、取消或转发</td></tr>
          <tr><td>转发给我待表态</td><td><strong>待接受</strong></td><td>接受（进待到店）或拒绝（退回原承接人）</td></tr>
          <tr><td>我已发起转发</td><td>待到店 + 「已转发给 XX，等待对方接受」</td><td>撤回转发、取消任务</td></tr>
          <tr><td>名额已满</td><td>不可选择</td><td>不可操作，<strong>不显示他人信息</strong></td></tr>
          <tr><td>与已有任务交叉</td><td>不可选择</td><td>写「该时段与已有任务冲突」，不说是哪一单</td></tr>
          <tr><td>原任务已取消 / 已转移</td><td>已取消 / 已转发</td><td>只读查看</td></tr>
        </tbody>
      </table>
    </div>

    <div id="pt-65-cancel" class="section">
      <div class="section-header">
        <h3>6.5.5 取消与转发</h3>
      </div>
      <ul class="doc-ul">
        <li>取消提示<strong>只说直接结果</strong>（任务关闭、名额释放），不展示违规统计与匹配逻辑。</li>
        <li>取消后约 1 秒系统尝试安排他人，<strong>页面只展示结果</strong>，不展示匹配过程。</li>
        <li>转出后原任务保留「已转发」，原用户<strong>立即失去</strong>执行权限。</li>
      </ul>

      <h4 class="h4sub">转发要对方点头，不是单方面甩单</h4>
      <table class="data-table">
        <thead>
          <tr><th style="width: 110px;">环节</th><th style="width: 150px;">谁做</th><th>系统做什么</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>发起</strong></td><td>当前承接人</td><td>只在任务上写一条转发请求，<strong>任务仍在自己名下</strong>，随即通知对方</td></tr>
          <tr><td><strong>待接受</strong></td><td>被转发方</td><td>卡片进他的「我的任务」顶部，<strong>30 分钟内</strong>接受或拒绝；这期间任务不算他的，也不占他的时间轴</td></tr>
          <tr><td><strong>接受</strong></td><td>被转发方</td><td>原任务转「已转发」，新任务落到他名下「待到店」，通知发起人</td></tr>
          <tr><td><strong>拒绝</strong></td><td>被转发方</td><td>任务退回发起人继续执行，通知发起人；<strong>同一任务不再转给这个人</strong></td></tr>
          <tr><td><strong>超时</strong></td><td>系统</td><td>30 分钟未表态视为拒绝，任务退回发起人并通知</td></tr>
          <tr><td><strong>撤回</strong></td><td>发起人</td><td>随时可撤，任务照旧自己执行，通知对方不用再处理</td></tr>
        </tbody>
      </table>
      <table class="data-table">
        <thead>
          <tr><th style="width: 260px;">前提</th><th>不满足时</th></tr>
        </thead>
        <tbody>
          <tr><td>距任务开始 <strong>≥ 2 小时</strong></td><td>不允许转发，弹窗直接给「改走取消流程」</td></tr>
          <tr><td>任务处于 <strong>待到店</strong></td><td>已到店 / 已离店 / 已取消的任务不可转发</td></tr>
          <tr><td>接替人<strong>资格校验通过</strong></td><td>列表里标「不可接替」并置灰，拒绝过的人标「已拒绝」且不可再选</td></tr>
        </tbody>
      </table>
      <div class="note">
        自己选中的任务<strong>不设待接受</strong>：选择即承诺，多一步确认只会让名额被占着不履约。
        转发不同 —— 别人替不了你答应，所以<strong>只有转发来的任务要本人接受</strong>。
        <strong>系统派单同样不设接受环节</strong>（已拍板）：临时时段、请假接班、提前下线补人、取消后重派都是公司派活，
        <strong>只发通知、直接写「待到店」</strong>（6.3.2），不接受也不退回 —— 派单资格与范围在配置侧已经筛过。
      </div>
    </div>

    <div id="pt-65-hidden" class="section">
      <div class="section-header">
        <h3>6.5.6 明确不展示</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 230px;">不展示</th><th>原因</th></tr>
        </thead>
        <tbody>
          <tr><td>自己选中的任务「待接受」</td><td>选择即承诺，多一步确认会让名额被占着不履约（转发来的必须接受，见 6.5.5）</td></tr>
          <tr><td>违规统计与处罚提示</td><td>后台核查；摆在承接页只会劝退正常接单</td></tr>
          <tr><td>候选人员与派单原因</td><td>内部调度信息，会引发「为什么派他不派我」</td></tr>
          <tr><td>任务来源的内部关联</td><td>谁请假、谁取消属他人信息</td></tr>
          <tr><td>别人选了哪条</td><td>满即不可选，不暴露承接人</td></tr>
          <tr><td>「为什么没向我开放」</td><td>档位是门店安排，看不到就是看不到</td></tr>
        </tbody>
      </table>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'
import DocScreens from '../../../docs/components/DocScreens.vue'
import mTasksMineShot from '../../../docs/assets/pages/m-pt-tasks-mine.png'
import mTasksOpenShot from '../../../docs/assets/pages/m-pt-tasks-open.png'
import mTasksCancelShot from '../../../docs/assets/pages/m-pt-cancel.png'
import mTasksConflictShot from '../../../docs/assets/pages/m-pt-tasks-conflict.png'
import mTasksForwardShot from '../../../docs/assets/pages/m-pt-forward.png'
import mTasksIncomingShot from '../../../docs/assets/pages/m-pt-incoming.png'

const tocItems = [
  { id: 'pt-65-overview', label: '6.5 任务承接' },
  { id: 'pt-65-entry', label: '6.5.1 入口' },
  { id: 'pt-65-struct', label: '6.5.2 页面结构' },
  { id: 'pt-65-select', label: '6.5.3 可见与可接' },
  { id: 'pt-65-status', label: '6.5.4 状态与动作' },
  { id: 'pt-65-cancel', label: '6.5.5 取消与转发' },
  { id: 'pt-65-hidden', label: '6.5.6 不展示什么' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '非全客户经理', to: '/docs/parttime-account-manager' },
  { label: '六、功能详细说明', to: '/docs/parttime-account-manager/features' },
  { label: '6.5 任务承接' }
]
</script>

<style scoped src="./doc-base.css"></style>
