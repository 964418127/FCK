<template>
  <DocShell
    :toc-items="tocItems"
    title="四、需求背景"
    subtitle="要解决的问题只有一个：那些会变的数字现在写在公式里，业务看不见、也改不动"
    version="v1.0"
    date="2026-11-10"
    :breadcrumbs="breadcrumbs"
  >
    <div id="gp-bg-now" class="section">
      <div class="section-header">
        <h2>现在是什么样</h2>
        <DocCopyButton section-id="gp-bg-now" />
      </div>
      <p class="doc-p">
        薪酬项公式里到处是<strong>写死的数字</strong>。一旦这个数随城市、门店、人数、客次量变化，公式就变成一串嵌套判断：
        写着费劲、看着更难，改一次价要把相关薪酬项逐个打开核对。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 200px;">现象</th><th style="width: 300px;">具体表现</th><th>造成的后果</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>价格写在公式里</strong></td><td>客次单价在不同人数档、客次档下是 4 / 4.5 / 5 / 5.5 / 6，只能靠多层条件表达</td><td>调价要改公式；改漏一处，同一月两批人算出两个价</td></tr>
          <tr><td><strong>地区差异靠人工核</strong></td><td>保底时薪有通用价、城市价、门店价三层</td><td>业务拿 Excel 维护对照表，算薪时人工查，换个人就对不上</td></tr>
          <tr><td><strong>参数只能存固定值</strong></td><td>原参数只支持一个数、一段文字、一组日期</td><td>凡是「按维度不同而不同」的数都放不进去</td></tr>
        </tbody>
      </table>
    </div>

    <div id="gp-bg-goal" class="section">
      <div class="section-header">
        <h3>要达成什么</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 220px;">目标</th><th>含义</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>数与公式分开</strong></td><td>调价 = 改参数。公式不动，所有引用它的薪酬项同时生效</td></tr>
          <tr><td><strong>业务自己维护</strong></td><td>建表、加列、录数、导入、试算都在配置页完成，不用等研发排期</td></tr>
          <tr><td><strong>一套规则覆盖全部差异</strong></td><td>层级覆盖、档位区间、多列相加，都用「条件 + 取值列」表达，不为某个场景开特例</td></tr>
          <tr><td><strong>每次取值都可解释</strong></td><td>给定条件能说清命中哪一行、取的是哪一列、值是多少</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>验收看两件事：</strong>非全的保底时薪与三项单价能<strong>完全靠参数配置出来</strong>，公式里不再有按城市 / 门店 / 档位分叉的判断；
        新增一个城市、调一次门店价，业务自己改一行格，当天就能算对。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'gp-bg-now', label: '四、需求背景' },
  { id: 'gp-bg-goal', label: '要达成什么' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '模块化薪酬', to: '/docs/general-param' },
  { label: '四、需求背景' }
]
</script>

<style scoped src="./doc-base.css"></style>
