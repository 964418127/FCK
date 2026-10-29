<template>
  <DocShell
    :toc-items="tocItems"
    title="四、需求背景"
    subtitle="每来一类事就重画一遍流程；同岗位不同人的差异，靠人在图上加分支、靠经办人自己记"
    version="v0.1"
    date="2026-10-30"
    :breadcrumbs="breadcrumbs"
  >
    <div id="orch-bg-now" class="section">
      <div class="section-header">
        <h2>四、需求背景</h2>
        <DocCopyButton section-id="orch-bg" />
      </div>

      <div class="note lead-note">
        <strong>一句话现状：</strong>过去配一件事，产出物是一张<strong>流程图</strong>：谁在什么时候做什么、走哪条分支、谁审批。
        图能回答「谁来办」，回答不了「这件事到底要交出什么」—— 于是「办完了没有」只能靠人记、靠事后追。
      </div>

      <h3>4.1 现在配一件事要付出什么</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">环节</th><th style="width: 190px;">现在的做法</th><th>代价</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>画流程</strong></td>
            <td>每来一类事，重新画一遍节点与连线</td>
            <td>同类事之间没有可复用的定义；画的人得同时懂业务与画法，换一个人接手要重新问一遍</td>
          </tr>
          <tr>
            <td><strong>表达差异</strong></td>
            <td>同一个岗位，有没有客户、带不带团队、有没有资产，靠图上<strong>加分支</strong>或靠经办人自己判断</td>
            <td>分支是<strong>预先枚举</strong>的：真实世界里「这个人有没有欠款」不是画图时能知道的事，图上只能写「视情况」</td>
          </tr>
          <tr>
            <td><strong>说清标准</strong></td>
            <td>节点写「交接完成」「审核通过」，细则写在文档里</td>
            <td>节点名是<strong>动作</strong>，判不出达成没有；同一句「交接完成」在两个人心里是两个意思</td>
          </tr>
          <tr>
            <td><strong>改一版</strong></td>
            <td>流程图、审批链配置、Word 说明三处各改一遍</td>
            <td>改一处漏两处；在途单按哪一版走说不清</td>
          </tr>
        </tbody>
      </table>

      <h3 id="orch-bg-gap">4.2 真正的缺口：缺一层「以事实为输入、以结论为输出」的定义</h3>
      <p class="doc-p">
        流程图的表达对象是<strong>动作与顺序</strong>；我们真正需要的表达对象是<strong>这件事必须交出哪些结论，以及哪些结论对这个人存在</strong>。
        这两件事的形状不同：前者要预先知道所有分支，后者只需要知道<strong>去哪查事实</strong>。
      </p>
      <div class="duo">
        <div class="duo-card">
          <h4>流程图的写法</h4>
          <p>「第 3 步：视情况判断员工是否有在跟客户；有则进入第 3.1 步客户交接，无则跳过。」</p>
          <p class="duo-k">问题：图上就多了一个「判断」节点 —— 谁来判、按什么判、判错了谁负责，都没有着落。</p>
        </div>
        <div class="duo-card">
          <h4>本文的写法</h4>
          <p>「在跟客户已交接完毕 —— 这条结论对<strong>有在跟客户的人</strong>存在。」</p>
          <p class="duo-k">事实由引擎去查（触发前置取数）；查不到在跟客户，这条<strong>根本不长出来</strong>，也就不需要谁去「判断」。</p>
        </div>
      </div>
      <div class="note">
        <strong>本场景要补的不是「谁来办」，而是「这件事必须交出什么、对谁存在、由谁给结论」。</strong>
        前后的先后关系仍然要有，但只用一种方式表达：<strong>前置</strong>。不画自由画布，不做分支网关 ——
        分岔来自事实，不来自配置。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'orch-bg-now', label: '4.1 现在配一件事要付出什么' },
  { id: 'orch-bg-gap', label: '4.2 真正的缺口' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '事件编排', to: '/docs/orchestration' },
  { label: '四、需求背景' }
]
</script>

<style scoped src="./doc-base.css"></style>
