<template>
  <DocShell
    :toc-items="tocItems"
    title="6.4 办理"
    subtitle="轮到谁、这一环交什么、结论怎么给；审核就是其中一条结论，不是另一套机制"
    version="v0.1"
    date="2026-10-30"
    :breadcrumbs="breadcrumbs"
  >
    <div id="orch-64" class="section">
      <div class="section-header">
        <h2>6.4 办理</h2>
        <DocCopyButton section-id="orch-64" />
      </div>

      <div class="func-entry"><strong>功能入口：</strong>移动端 → 事项办理（列表，按「轮到我 / 流转中 / 已办结」筛选）→ 点开一笔 → 这一环的办理页</div>

      <div class="note">
        <strong>本节只讲「人办」这一类路径。</strong>系统判定与系统执行没有办理页，也不给人按钮（见 6.5）；
        外部回执只有「等」与「收到回执」，同样没有办理页（见 6.5.5）。
      </div>

      <h3 id="orch-64-1">6.4.1 列表：按「轮到谁」分，不按单据状态分</h3>
      <p class="doc-p">
        处理人不关心这张单是「处理中」还是「待审核」，他关心<strong>现在是不是轮到我</strong>。所以列表的第一层筛选是：
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 120px;">筛选</th><th style="width: 240px;">含义</th><th>典型用法</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>轮到我</strong></td><td>前置已满足、且负责人解析到我本人的子事件</td><td>每天进来先看这一栏，办完就走</td></tr>
          <tr><td><strong>流转中</strong></td><td>这一单还在跑，但当前不在我手上（在别人手上、在等系统、在等回执）</td><td>看自己关心的人走到哪了</td></tr>
          <tr><td><strong>已办结</strong></td><td>这一单已结束（全部办结，或因必过项不通过而终止）</td><td>回查历史与凭证</td></tr>
        </tbody>
      </table>
      <p class="doc-p">
        卡片上给四件事：<strong>事件名 + 单号</strong>、<strong>员工（姓名 · 岗位 · 门店）</strong>、
        <strong>当前这一环</strong>（谁的哪条结论）、<strong>进度</strong>（已办 / 总数）。不在这里展开子事件列表 —— 那是点进去看的事。
      </p>
      <DocScreens :images="[{ src: listShot, label: '事项办理列表：按「轮到谁」筛选；卡片写清事件、员工、当前这一环（财务专员 周芸 · 欠款与借款已结清）与进度（2/16）' }]" mode="phone" />

      <h3 id="orch-64-2">6.4.2 谁看到谁办：负责人是「核对并填结果的人」</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 180px;">规则</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>负责人 ≠ 动手的人</strong></td><td>负责人是这条结论<strong>核对并填结果</strong>的人。谁动手写在事项的完成口径里（如「员工本人交还工服，店长逐项核对」），不占字段</td></tr>
          <tr><td><strong>写角色，不写人名</strong></td><td>定义期写「店长 / 城市总 / 人事经理」；触发时按员工档案<strong>解析到这个人</strong>，同一角色的人不能互相顶替（否则「谁确认的」没有意义）</td></tr>
          <tr><td><strong>确需指定人</strong></td><td>由事实里的责任人取（如「直属上级」），而不是在定义里硬写某个名字</td></tr>
          <tr><td><strong>看不到就写明原因</strong></td><td>不在我手上的，办理页显示「这一环在别人手上 · 直属上级 钱伟」，<strong>点名到人</strong>，不写「暂无权限」</td></tr>
        </tbody>
      </table>

      <h3 id="orch-64-3">6.4.3 这一环交什么：事项与字段</h3>
      <DocScreens :images="[{ src: detailShot, label: '办理页上半：轮到你了 · 欠款与借款已结清（必过）· 财务专员 周芸；事项「借款 / 欠款核对」下四类字段（数值 / 日期 / 附件 / 多行文本）与两个结论按钮' }]" mode="phone" />
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">控件</th><th style="width: 220px;">用来收什么</th><th>注意</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>单行文本</strong></td><td>编号、接收人姓名、一句话说明</td><td>不要拿来收长段理由</td></tr>
          <tr><td><strong>多行文本</strong></td><td>审核意见、办理说明、情况描述</td><td>审核意见就是这一种，不另设「审批意见」专用控件</td></tr>
          <tr><td><strong>数值</strong></td><td>金额、数量、欠款额</td><td>单位写在字段名里（「欠款金额（元）」），不靠人猜</td></tr>
          <tr><td><strong>日期</strong></td><td>实际日期、计划还款日</td><td>空着就不许提交（必传时）</td></tr>
          <tr><td><strong>单选 / 多选</strong></td><td>从固定选项里选（原因、类型、出口）</td><td>选项由定义固定；<strong>多选的预填值是数组</strong>，回看时要摊成「工资太低、离家太远」</td></tr>
          <tr><td><strong>人员</strong></td><td>接收人、监交人</td><td>从花名册选，不手打名字</td></tr>
          <tr><td><strong>附件</strong></td><td>凭证、清单、协议</td><td>必传的写清允许格式（PDF / JPG / PNG）；只收「办完要说清」的凭证</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>预填的两句话要分开：</strong>从申请单带过来的值写「已按申请单填好，可改」；
        因为定义了默认值而填好的写「已按默认值填好」。两句话混用，办理人就会以为「这是员工填的」，于是不再核对。
      </div>

      <h3 id="orch-64-4">6.4.4 结论与门禁：只有两个按钮</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">动作</th><th style="width: 230px;">发生什么</th><th>边界</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>通过并办结</strong></td>
            <td>这条子事件记为已办结，解锁以它为前置的下游；系统项随即开始取数</td>
            <td>必传字段没填、必传附件没传，按钮不生效并逐项标红</td>
          </tr>
          <tr>
            <td><strong>不通过</strong></td>
            <td>必过项：<strong>终止全部流程</strong>，未办的一并关闭；可选：只记录，仍解锁下游</td>
            <td>不通过要写原因（办理说明必填），因为它是终止的唯一依据</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>没有「驳回」「退回修改」，也没有回边。</strong>这是刻意的：一旦允许退回，同一张单会在两个节点之间反复，
        「这一单到底办完没有」永远说不清，且每一轮都要重新判断谁该办。<br />
        <strong>要再来一次，就重新发起</strong> —— 新单、新单号、新的一轮事实。上一张单的终止原因留在它自己身上，不被覆盖。
      </div>

      <h3 id="orch-64-5">6.4.5 审核：一条结论 + 人办路径</h3>
      <p class="doc-p">
        传统审批在这里不需要单独的节点类型，也不需要「审核」这种特殊路径：
        <strong>它就是一条结论</strong>（「城市总已审核通过」）<strong>配一条人办路径</strong> —— 负责人就是审核人，
        审核意见只是事项里的一个<strong>多行文本字段</strong>。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">问题</th><th>本版口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>两级审核怎么写</strong></td><td>两条结论：<strong>城市总已审核通过</strong> → <strong>人事已审核通过</strong>，后者前置写前者。几级就几条，不合成一条「几级审核」</td></tr>
          <tr><td><strong>会签怎么写</strong></td><td>几条结论共用同一前置、都必过 —— 全都过了下游才动，这就是会签</td></tr>
          <tr><td><strong>或签（任一人）</strong></td><td><strong>本版不支持。</strong>没有「任一人办」的承担者语义，不假装支持：要么一个角色一个人，要么指定到人</td></tr>
          <tr><td><strong>驳回</strong></td><td>不通过即终止全部流程（见 6.4.4）；要重新走，重新发起</td></tr>
          <tr><td><strong>审核人看什么</strong></td><td>申请单带过来的值（期望日期、原因等）<strong>预填可改</strong>；审核这一环才产生的值（实际日期、款项出口）在这里第一次填</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>为什么不给「审核」单独一种类型：</strong>一旦有了这个类型，同一个环节就会同时出现「审核节点」和「审核通过的结论」两种写法，
        改一处漏一处；而它真正需要的能力（谁审、几级、看什么、给什么结论）用「结论 + 人办 + 前置」已经全部表达得出来。
      </div>

      <h3 id="orch-64-6">6.4.6 提交之后的联动</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 190px;">联动</th><th>结果</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>解锁下游</strong></td><td>以这条为前置的子事件<strong>全部前置都办结</strong>后，才进责任人待办；只满足一条不算</td></tr>
          <tr><td><strong>唤醒系统项</strong></td><td>前置一满足，系统判定项立刻去取一次<strong>该单最新的批次结果</strong>，之后按取数频率继续取（见 6.5.2）</td></tr>
          <tr><td><strong>推进整体状态</strong></td><td>全部必过项办结 → 这一单<strong>已办结</strong>，结果字段可被下游引用；任何必过项不通过 → <strong>已终止</strong></td></tr>
          <tr><td><strong>留痕</strong></td><td>每条结论记录：结论、经办人、时间、字段值、附件数、办理说明 —— 事后回查不依赖任何人回忆</td></tr>
        </tbody>
      </table>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'
import DocScreens from '../../../docs/components/DocScreens.vue'
import listShot from '../../../docs/assets/pages/v2-m-list.png'
import detailShot from '../../../docs/assets/pages/v2-m-detail.png'

const tocItems = [
  { id: 'orch-64-1', label: '6.4.1 列表：按轮到谁分' },
  { id: 'orch-64-2', label: '6.4.2 谁看到谁办' },
  { id: 'orch-64-3', label: '6.4.3 事项与字段' },
  { id: 'orch-64-4', label: '6.4.4 结论与门禁' },
  { id: 'orch-64-5', label: '6.4.5 审核：一条结论' },
  { id: 'orch-64-6', label: '6.4.6 提交后的联动' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '事件编排', to: '/docs/orchestration' },
  { label: '六、功能详细说明', to: '/docs/orchestration/features' },
  { label: '6.4 办理' }
]
</script>

<style scoped src="./doc-base.css"></style>
