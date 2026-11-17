<template>
  <DocShell
    :toc-items="tocItems"
    title="6.6 通知"
    subtitle="排班会发出哪些系统通知，一张清单说全：发给员工的、发给人事经理的"
    version="v5.2"
    date="2026-11-17"
    :breadcrumbs="breadcrumbs"
  >
    <div id="hs-66" class="section">
      <div class="section-header">
        <h2>6.6 通知</h2>
        <DocCopyButton section-id="hs-66" />
      </div>
      <div class="note lead-note">
        <strong>一句话定位：</strong>排班会发出哪些系统通知，这一节一张清单说全——已有的照原型列，新增的写明触发条件，后续迭代按这张清单对照，不漏功能。
      </div>
      <p class="doc-p">
        两条总原则：<strong>通知只负责告诉你，处理动作都在业务页</strong>（补位确认在班次卡上、待处理在结果层缺口清单里、换班在「我的排班」当天）；
        <strong>成不成当场说</strong>——抢、申领成不了当场说原因，不事后通知失败。
      </p>
    </div>

    <div id="hs-66-emp" class="section">
      <div class="section-header">
        <h3>6.6.1 发给员工的（移动端已上线）</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">通知</th><th style="width: 210px;">什么时候发</th><th>内容与去处</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>补位通知</strong></td>
            <td>有人请假、系统在清单里找到了有空、没冲突的人</td>
            <td>「某天某班次需要你顶上」，附谁几点提交了请假、你是哪一档里当时有空的人；处理在「我的排班」当天班次卡（待你确认：收到，我来）</td>
          </tr>
          <tr>
            <td><strong>排班安排</strong></td>
            <td>人事写了顶班事实，把某条班安排给这个人</td>
            <td>「某天某班次」+「经营性安排，不需你同意；如有实际困难联系门店人事」；通知即可，不需回复动作</td>
          </tr>
          <tr>
            <td><strong>换班请求</strong></td>
            <td>有人发起「找人对换」并选定了对家</td>
            <td>对家在「我的排班」顶部看到「有人想跟你换班」+ 拒绝 / 同意换班；等待期 30 分钟，没答复到点自动失效；同意 = 两条事实同时生效，拒绝不变动</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div id="hs-66-hr" class="section">
      <div class="section-header">
        <h3>6.6.2 发给人事经理的（缺口系统通知）</h3>
      </div>
      <p class="doc-p">
        缺口发生就是异常：缺口规则只答「要不要补」，<strong>无论答的是补还是不补，缺口都要让对应的人事经理知道</strong>。
        两种触发，都发到空间对应的人事经理：
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">触发</th><th style="width: 210px;">什么时候发</th><th>内容与去处</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>设了「不补充」</strong></td>
            <td>这条班次的缺口规则是 G0，缺口发生后不找人</td>
            <td>「某天某班次设了不补充」：缺的人不安排顶班，留门店现场；让人事知情，留意现场</td>
          </tr>
          <tr>
            <td><strong>要补还没补上</strong></td>
            <td>缺口要补（G1–G3），但重算后没有找到能顶的人，时段留空</td>
            <td>「某天某班次没人能顶」待处理：人事在结果层缺口清单里定人；写顶班事实顶上之后，这条待处理<strong>自动销掉</strong>，不重复打扰</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>边界：</strong>获取段没排满不算缺口，不发缺口通知（结果层手动补人即可）；
        关闸前的缺席也属获取段，不发。缺口通知只在关闸后、事实重算摆出缺口时发。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'hs-66', label: '6.6 通知' },
  { id: 'hs-66-emp', label: '6.6.1 发给员工的' },
  { id: 'hs-66-hr', label: '6.6.2 发给人事经理的' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事中心', to: '/docs/hr-schedule' },
  { label: '六、功能详细说明', to: '/docs/hr-schedule/features' },
  { label: '6.6 通知' }
]
</script>

<style scoped src="./doc-base.css"></style>
