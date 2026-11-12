<template>
  <DocShell
    :toc-items="tocItems"
    title="四、需求背景"
    subtitle="门店按时段买服务能力、缺口靠人工补位；缺的是把「需求 → 任务 → 履约」这一层系统化"
    version="v1.0"
    date="2026-11-06"
    :breadcrumbs="breadcrumbs"
  >
    <div id="pt-bg-now" class="section">
      <div class="section-header">
        <h2>四、需求背景</h2>
        <DocCopyButton section-id="pt-bg" />
      </div>

      <div class="note lead-note">
        <strong>一句话现状：</strong>门店需要的是<strong>「某个时段有几个人可用」</strong>，而不是「给某个人排一个班」。
        现有的全职排班解决不了临时与碎片时段：需求靠线下沟通、谁接了靠群里问、缺口靠临时找人、做完了没有据可查、月底收入靠人算。
      </div>

      <h3 id="pt-bg-41">4.1 门店要解决的两件事</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 190px;">问题</th><th style="width: 260px;">业务表现</th><th>为什么现在做不到</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>固定时段有人可用</strong></td>
            <td>每周末、每天饭点这类<strong>重复出现</strong>的忙时，需要稳定的补充人力</td>
            <td>全职班次是固定到人的；非全的人不一定每周都在同一家店，需求无法按「周 × 时段 × 名额」表达</td>
          </tr>
          <tr>
            <td><strong>临时缺口有人接替</strong></td>
            <td>全职请假、非全临时取消、线下突然缺人，需要在<strong>当天或次日</strong>补上</td>
            <td>没有事件驱动的临时时段对象，缺口只能靠店长挨个打电话；补上了也没有记录证明是谁接的</td>
          </tr>
        </tbody>
      </table>

      <h3 id="pt-bg-gap">4.2 缺口在哪：五件事都没有承载</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">环节</th><th style="width: 240px;">现在怎么做</th><th>缺什么</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>需求</strong></td><td>店长口头或群里说「这周六需要两个人」</td><td>没有一张可维护、可校验、可作废的需求清单</td></tr>
          <tr><td><strong>生成</strong></td><td>靠人记，或临时在群里发一遍</td><td>没有定时、幂等、可追溯的生成动作；漏一期没人知道</td></tr>
          <tr><td><strong>承接</strong></td><td>谁先回「我来」就是谁的</td><td>没有名额占用与冲突校验（时段重叠、跨店通勤、单日工时）</td></tr>
          <tr><td><strong>履约</strong></td><td>到店在群里说一声，走了也说一声</td><td>没有到离店事件，实际在店时长无从证明</td></tr>
          <tr><td><strong>兑现</strong></td><td>月底按记忆或手写表算钱</td><td>没有单价与保底的可配置标准，也没有「结算主体 = 门店」的归集口径</td></tr>
        </tbody>
      </table>

      <h3 id="pt-bg-why">4.3 为什么不能把全职班次直接搬到移动端</h3>
      <div class="duo">
        <div class="duo-card">
          <h4>全职客户经理</h4>
          <p><strong>一个固定门店 + 一个固定班次</strong>，考勤是在这个班次上做两次打卡。</p>
          <p>移动端只需展示「我的班次」和「到店 / 离店」两个按钮。</p>
        </div>
        <div class="duo-card">
          <h4>非全客户经理</h4>
          <p><strong>多门店 × 多时段 × 按名额承接</strong>，任务可能被取消、被转移，也可能一天跑两家店。</p>
          <p>移动端必须先<strong>选任务 / 选门店</strong>，再按任务时段判断能不能打卡；一个固定班次的界面套不上。</p>
        </div>
      </div>

      <h3 id="pt-bg-layer">4.4 本版要补的那一层</h3>
      <p class="doc-p">
        不是重做排班，也不是做薪资计算，而是补上<strong>「需求 → 任务 → 承接 → 履约 → 跟踪 → 结算读取」</strong>这一段：
        需求可配、任务可生成、承接有主、打卡有痕、变更可回溯、收入有标准。每一段各有一个承载对象，见第五章。
      </p>
      <div class="note">
        <strong>边界提醒：</strong>这一层<strong>不判断</strong>员工该不该被安排到某家店，也<strong>不计算</strong>最终应发工资。
        前者是运营的判断（系统只校验规则），后者是薪酬模块的职责（本模块只交付可被读取的事实与标准，见 6.7）。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'pt-bg-now', label: '四、需求背景' },
  { id: 'pt-bg-41', label: '4.1 门店要解决的两件事' },
  { id: 'pt-bg-gap', label: '4.2 缺口在哪' },
  { id: 'pt-bg-why', label: '4.3 为什么不能搬全职班次' },
  { id: 'pt-bg-layer', label: '4.4 本版要补的一层' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '非全客户经理', to: '/docs/parttime-account-manager' },
  { label: '四、需求背景' }
]
</script>

<style scoped src="./doc-base.css"></style>
