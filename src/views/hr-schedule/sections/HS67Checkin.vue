<template>
  <DocShell
    :toc-items="tocItems"
    title="6.7 打卡（支持非全合作）"
    subtitle="人事中心提供打卡通用能力，非全客户经理是第一个落地的业务：入口选门店、1 小时门禁、到店后才能离店；界面不出现具体打卡时间"
    version="v5.4"
    date="2026-11-18"
    :breadcrumbs="breadcrumbs"
  >
    <div id="hs-67" class="section">
      <div class="section-header">
        <h2>6.7 打卡（支持非全合作）</h2>
        <DocCopyButton section-id="hs-67" />
      </div>
      <div class="note lead-note">
        <strong>一句话定位：</strong>人事中心是通用设计，第一个要上的业务是非全客户经理——非全按工时结算，工时来自打卡，所以把打卡能力并入本章；这一节说清人事中心提供什么、非全客户经理怎么落。
      </div>
      <div class="note src-note">
        <strong>来源：</strong>本章内容并入自《非全客户经理 · 产品需求说明》6.6 到店打卡，原文见
        <router-link to="/docs/parttime-account-manager/6-6">/docs/parttime-account-manager/6-6</router-link>。
      </div>
      <DocScreens
        mode="phone"
        :images="[
          { src: mAttendanceShot, label: '打卡页：门店带任务与时段，日期、地点、时段取自任务不可改；未到时间整块提示，不露倒计时' },
          { src: mAttendanceLeaveShot, label: '顺序打卡：到店未完成时，「离店打卡」始终锁住为「待到店打卡」' },
          { src: mAttendanceRecordsShot, label: '打卡记录：月历只有日期与状态点，图例分未打卡 / 正常 / 异常；不出现具体打卡时间' },
          { src: mAttendanceEmptyShot, label: '当日无任务：不进打卡流程，整页只有标题 + 一句话 + 「去看可选任务」' },
          { src: mAttendanceOfflineShot, label: '提前下线：标「提前离店」，只说一句结果，不显示派给了谁' }
        ]"
      />
      <div class="note warn-note">
        <strong>用词：</strong>非全端只用「<strong>打卡</strong>」，不用「考勤」；字段同理——打卡日期 / 打卡地点 / 打卡范围。
      </div>
    </div>

    <div id="hs-67-pos" class="section">
      <div class="section-header">
        <h3>6.7.1 打卡在人事中心的位置</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">维度</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>归属</strong></td><td>挂在上班容器上，与时段、名额同源</td></tr>
          <tr><td><strong>记录口</strong></td><td>打卡明细仍在既有考勤，不进排班结果表</td></tr>
          <tr><td><strong>用途</strong></td><td>给薪酬出有效工时，给补人出触发</td></tr>
          <tr><td><strong>本期范围</strong></td><td>通用设计，先接非全客户经理一个业务</td></tr>
        </tbody>
      </table>
    </div>

    <div id="hs-67-entry" class="section">
      <div class="section-header">
        <h3>6.7.2 两个独立入口，不做切换</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 200px;">入口</th><th style="width: 110px;">面向</th><th>核心差异</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>客户经理考勤</strong></td><td>全日制</td><td>两块打卡区静态展示，无任务门店概念，固定班次</td></tr>
          <tr><td><strong>非全客户经理打卡</strong></td><td>非全日制</td><td>顺序流程 + 任务门店切换 + 1 小时门禁；班次来自<strong>当前选中任务</strong></td></tr>
        </tbody>
      </table>
      <p class="doc-p">两个入口并列挂在【客户经理】下，<strong>不做 toggle</strong>——两套状态机不同，合在一页会互相污染。</p>
    </div>

    <div id="hs-67-popup" class="section">
      <div class="section-header">
        <h3>6.7.3 入口弹窗：先选今天在哪个店</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">场景</th><th>行为</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>当日任务 = 1</strong></td><td>直接进主页面，自动选中，不弹窗</td></tr>
          <tr><td><strong>当日任务 ≥ 2</strong></td><td>挂载即弹底部选择卡，按开始时间升序，首任务带「推荐」；<strong>必须手动点选</strong>才能进入</td></tr>
          <tr><td><strong>当日无任务</strong></td><td><strong>不进打卡流程</strong>：空态页「今日没有任务安排」+「去看可选任务」；不展示员工信息卡与打卡区</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>为什么不默认选中：</strong>多任务时默认选中等于替员工决定去哪家店；只有 1 个任务时才自动选中，因为没有歧义。
      </div>
    </div>

    <div id="hs-67-switch" class="section">
      <div class="section-header">
        <h3>6.7.4 顶部门店切换</h3>
      </div>
      <p class="doc-p">进入主页面后顶部 tab 始终可见，列出<strong>当日全部任务</strong>。切换门店联动四项：</p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 200px;">联动项</th><th>变化</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>打卡地点</strong></td><td>更新为新任务门店</td></tr>
          <tr><td><strong>任务时段</strong></td><td>更新为新任务的起止时间</td></tr>
          <tr><td><strong>到店按钮态</strong></td><td>按新任务<strong>重新判门禁</strong>，仍在 1 小时外就回到等待卡片</td></tr>
          <tr><td><strong>打卡状态分类</strong></td><td>基准切为新任务的计划时段</td></tr>
        </tbody>
      </table>
    </div>

    <div id="hs-67-gate" class="section">
      <div class="section-header">
        <h3>6.7.5 1 小时提前打卡门禁</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 220px;">当前情况</th><th>到店打卡操作区</th></tr>
        </thead>
        <tbody>
          <tr><td>已到计划开始时间</td><td>可打卡（正常到店）</td></tr>
          <tr><td>开始前 1 小时内</td><td>可打卡（提前窗口）</td></tr>
          <tr><td>早于开始前 1 小时</td><td><strong>不可打卡</strong>：「暂不能打卡 / 请在任务开始前 1 小时内再试」</td></tr>
          <tr><td>弹窗已弹出、尚未点选</td><td><strong>不可打卡</strong>：「请先选择今日任务」，选完即消失</td></tr>
          <tr><td>当日无任务</td><td><strong>不进打卡页</strong>，页面没有打卡按钮</td></tr>
        </tbody>
      </table>
      <ul class="doc-ul">
        <li>切换门店<strong>立即重算</strong>，到点自动解锁。</li>
        <li>等待卡片<strong>不显示倒计时</strong>，否则会让人反复刷页面。</li>
        <li>离店按钮<strong>不设时间门禁</strong>，到店成功后始终可点。</li>
      </ul>
    </div>

    <div id="hs-67-state" class="section">
      <div class="section-header">
        <h3>6.7.6 顺序状态机</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">阶段</th><th>到店区</th><th>离店区</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>未到店</strong></td><td>可点（或受门禁限制）</td><td>锁定</td></tr>
          <tr><td><strong>已到店</strong></td><td>显示「已到店」</td><td>可点</td></tr>
          <tr><td><strong>当日已完成</strong></td><td>显示「已到店」</td><td>显示「已离店」</td></tr>
        </tbody>
      </table>
      <p class="doc-p"><strong>没到店不能离店</strong>是强制顺序：实际在店时长依赖两个事件成对且有序。</p>
    </div>

    <div id="hs-67-classify" class="section">
      <div class="section-header">
        <h3>6.7.7 打卡状态分类</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 110px;">维度</th><th style="width: 300px;">判定</th><th>状态</th></tr>
        </thead>
        <tbody>
          <tr><td rowspan="2"><strong>到店</strong></td><td>实际到店 ≤ 计划开始</td><td>正常到店</td></tr>
          <tr><td>实际到店 &gt; 计划开始</td><td><strong class="tag-must">迟到到店</strong></td></tr>
          <tr><td rowspan="2"><strong>离店</strong></td><td>实际离店 ≥ 计划结束</td><td>正常离店</td></tr>
          <tr><td>实际离店 &lt; 计划结束</td><td><strong class="tag-must">提前离店</strong></td></tr>
        </tbody>
      </table>
      <p class="doc-p">异常用警示色、正常用品牌色；<strong>只做标记</strong>，是否违规由后台核查。</p>
      <div class="note">
        <strong>提前离店不只是标记：</strong>提交那一刻系统按策略判一次剩余段还值不值得再派人——够门槛就建补人需求并派单，不够就不补。员工侧只看到结果一句话。
      </div>
    </div>

    <div id="hs-67-display" class="section">
      <div class="section-header">
        <h3>6.7.8 显示约束：不出现具体打卡时间</h3>
      </div>
      <div class="note warn-note">
        <strong>非全端不显示详细时间</strong>，打卡记录仅后台留存。除任务时段本身的「开始–结束」外，前端不出现时:分:秒。
      </div>
      <ul class="doc-ul">
        <li>按钮上<strong>不显示实时时间</strong>，只有「到店打卡 / 离店打卡」。</li>
        <li>「打卡状态」<strong>不拼时间</strong>，只给分类结果；等待卡片不显示倒计时。</li>
        <li>月历只有日期与状态点。</li>
      </ul>
    </div>

    <div id="hs-67-diff" class="section">
      <div class="section-header">
        <h3>6.7.9 与全日制字段差异</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 210px;">区块</th><th style="width: 190px;">全日制</th><th>非全日制</th></tr>
        </thead>
        <tbody>
          <tr><td>页头 / 打卡卡标题</td><td>考勤打卡</td><td><strong>打卡</strong></td></tr>
          <tr><td>员工信息 · 班次</td><td>通班</td><td><strong>任务时段</strong>（当前选中任务）</td></tr>
          <tr><td>员工信息 · 地点</td><td>考勤地点：门店固定</td><td><strong>打卡地点</strong>：当前任务门店（可切换）</td></tr>
          <tr><td>顶部门店切换</td><td>无</td><td><strong>有</strong></td></tr>
          <tr><td>入口任务选择弹窗</td><td>无</td><td><strong>有</strong>（任务 ≥ 2 时弹）</td></tr>
          <tr><td>固定打卡时间（10:00 / 22:00）</td><td>显示</td><td><strong>不显示</strong></td></tr>
          <tr><td>按钮上实时时间</td><td>显示</td><td><strong>不显示</strong></td></tr>
          <tr><td>打卡时间一栏（到秒）</td><td>显示</td><td><strong>不显示</strong>（仅后台）</td></tr>
          <tr><td>打卡类型 / 状态</td><td>打卡类型：正常打卡</td><td><strong>打卡状态</strong>：正常 / 迟到到店、正常 / 提前离店</td></tr>
          <tr><td>不能打卡时的提示卡</td><td>无</td><td><strong>有</strong></td></tr>
          <tr><td>更新打卡按钮</td><td>显示</td><td><strong>不显示</strong>（违规由后台核查）</td></tr>
        </tbody>
      </table>
    </div>

    <div id="hs-67-commute" class="section">
      <div class="section-header">
        <h3>6.7.10 跨店通勤：派单侧的责任</h3>
      </div>
      <p class="doc-p">
        非全端<strong>不展示</strong>通勤时间，但派单与选择校验必须留出缓冲。缓冲暂按 <strong>30 分钟</strong>统一兜底，尚未接入门店间隔时间库。
      </p>
    </div>

    <div id="hs-67-remind" class="section">
      <div class="section-header">
        <h3>6.7.11 打卡提醒</h3>
      </div>
      <p class="doc-p">开始前<strong>定时推 3 次</strong>，第一次正好是打卡窗口开放的时刻，后两次催办。定死不配。</p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">时点</th><th style="width: 150px;">为什么是这时</th><th>推送内容</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>开始前 1 小时</strong></td><td>打卡窗口刚开（6.7.5）</td><td rowspan="3">门店 + 日期 + 时段 + 还有多久开始，一句「请到店后打卡」</td></tr>
          <tr><td><strong>开始前 30 分钟</strong></td><td>该出门了</td></tr>
          <tr><td><strong>开始前 5 分钟</strong></td><td>还没打卡，最后提醒</td></tr>
        </tbody>
      </table>
      <table class="data-table">
        <thead>
          <tr><th style="width: 220px;">情况</th><th>是否提醒</th></tr>
        </thead>
        <tbody>
          <tr><td>待到店、未到店</td><td><strong>提醒</strong>，三个时点各一次</td></tr>
          <tr><td>已到店</td><td>不再提醒（后面的节点直接跳过）</td></tr>
          <tr><td>已取消 / 已转发</td><td>不提醒</td></tr>
          <tr><td>转发来的任务还没接受</td><td>不提醒——还不是他的任务</td></tr>
          <tr><td>任务已开始</td><td>不补发，交给跟踪页的异常呈现</td></tr>
        </tbody>
      </table>
      <div class="note">
        同一条任务积压多个时点只补<strong>最近一次</strong>，不会三条一起轰；通知点开直接进打卡页。
        任务卡上只写<strong>相对时间</strong>（「开始前 1 小时 · 30 分钟 · 5 分钟」），不写具体时:分，与 6.7.8 的显示约束一致。
      </div>
    </div>

    <div id="hs-67-link" class="section">
      <div class="section-header">
        <h3>6.7.12 与排班、薪酬的衔接</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 200px;">流向</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>排班 → 打卡</strong></td><td>结果表给门店、时段</td></tr>
          <tr><td><strong>打卡 → 薪酬</strong></td><td>有效工时 × 保底时薪</td></tr>
          <tr><td><strong>提前离店 → 补人</strong></td><td>够门槛才找人顶，见 6.4</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>边界：</strong>人事中心本期提供打卡能力与挂载点；打卡明细、工时计算规则仍在既有考勤与薪酬系统，不在本需求内新增。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'
import DocScreens from '../../../docs/components/DocScreens.vue'
import mAttendanceShot from '../../../docs/assets/pages/m-pt-attendance.png'
import mAttendanceLeaveShot from '../../../docs/assets/pages/m-pt-attendance-leave.png'
import mAttendanceRecordsShot from '../../../docs/assets/pages/m-pt-attendance-records.png'
import mAttendanceEmptyShot from '../../../docs/assets/pages/m-pt-attendance-empty.png'
import mAttendanceOfflineShot from '../../../docs/assets/pages/m-pt-attendance-offline.png'

const tocItems = [
  { id: 'hs-67', label: '6.7 打卡（支持非全合作）' },
  { id: 'hs-67-pos', label: '6.7.1 在人事中心的位置' },
  { id: 'hs-67-entry', label: '6.7.2 两个独立入口' },
  { id: 'hs-67-popup', label: '6.7.3 入口弹窗' },
  { id: 'hs-67-switch', label: '6.7.4 门店切换' },
  { id: 'hs-67-gate', label: '6.7.5 1 小时门禁' },
  { id: 'hs-67-state', label: '6.7.6 顺序状态机' },
  { id: 'hs-67-classify', label: '6.7.7 打卡状态分类' },
  { id: 'hs-67-display', label: '6.7.8 显示约束' },
  { id: 'hs-67-diff', label: '6.7.9 与全日制差异' },
  { id: 'hs-67-commute', label: '6.7.10 跨店通勤' },
  { id: 'hs-67-remind', label: '6.7.11 打卡提醒' },
  { id: 'hs-67-link', label: '6.7.12 与排班、薪酬的衔接' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事中心', to: '/docs/hr-schedule' },
  { label: '六、功能详细说明', to: '/docs/hr-schedule/features' },
  { label: '6.7 打卡（支持非全合作）' }
]
</script>

<style scoped src="./doc-base.css"></style>
