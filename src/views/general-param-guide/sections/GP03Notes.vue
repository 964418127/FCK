<template>
  <DocShell
    :toc-items="tocItems"
    title="三、文档说明"
    subtitle="本模块共用的名词与字段口径先在这里定死，其余章节只引用"
    version="v1.0"
    date="2026-11-10"
    :breadcrumbs="breadcrumbs"
  >
    <div id="gp-notes-terms" class="section">
      <div class="section-header">
        <h2>名词解释</h2>
        <DocCopyButton section-id="gp-notes-terms" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">名词</th><th>含义</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>通用参数</strong></td><td>一条<strong>有名字的值</strong>，被薪酬项公式引用。它的用处是「数会变，公式不用改」</td></tr>
          <tr><td><strong>值类型</strong></td><td>参数存什么。八类<strong>简单值</strong>（文本 / 数值 / 日期 / 时间 / 四类数组）与一类<strong>数据表</strong></td></tr>
          <tr><td><strong>数据表</strong></td><td>一张二维表：若干列 + 若干行，用来存「按城市、门店、人数、客次不同而不同」的一批数</td></tr>
          <tr><td><strong>列</strong></td><td>只有<strong>列名</strong>与<strong>列类型</strong>（文本 / 数值 / 日期）。列<strong>没有角色之分</strong>，系统不认哪列是条件、哪列是结果</td></tr>
          <tr><td><strong>条件列</strong></td><td>被拿来<strong>查</strong>的列。哪一列当条件由引用处声明，不写在表里</td></tr>
          <tr><td><strong>取值列</strong></td><td>被拿来<strong>取</strong>的列。同样在引用处声明，一张表可以在这处取单价、在那处取成本价</td></tr>
          <tr><td><strong>查询条件</strong></td><td>一条「<strong>条件列 + 符号 + 传入的值</strong>」，如「客次下限 ≤ 当月客次」。它描述的是这次怎么查，不是数据</td></tr>
          <tr><td><strong>传入的值</strong></td><td>参与比较的上下文事实，如城市、门店人数、当月客次、员工工号；来自算这一笔时的实际数据，不是一个手填常量</td></tr>
          <tr><td><strong>取值函数</strong></td><td>引用处的一组配置：<strong>取哪一列（或哪几列相加）+ 用哪些条件查</strong>。一个参数可被多个薪酬项各配一套</td></tr>
          <tr><td><strong>兜底行</strong></td><td>条件列<strong>全部留空</strong>的那一行（通用行）。越具体的行都没命中时才用它</td></tr>
        </tbody>
      </table>
    </div>

    <div id="gp-notes-fields" class="section">
      <div class="section-header">
        <h3>字段口径</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">项</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>配置名称</strong></td><td>必填、≤ 40 字；公式里显示的就是这个名字。建议带业务前缀（如「非全 · 客次单价」），重名不拦但容易配错</td></tr>
          <tr><td><strong>值类型</strong></td><td>建好之后<strong>不可改</strong>。要换类型就新建一个，把引用改过去，再停用旧的</td></tr>
          <tr><td><strong>列名</strong></td><td>必填、≤ 20 字、<strong>表内不可重复</strong>；引用处按列名找列，改名等于换列</td></tr>
          <tr><td><strong>留空</strong></td><td>格子里没填。条件列留空 = 这一行对这项<strong>不设要求</strong>；取值列留空 = 这里没数，继续往下找。留空<strong>不是 0</strong></td></tr>
          <tr><td><strong>取不到值</strong></td><td>取值列在命中行里都没有数时，按「取不到值」提示，不拿 0 冒充；相加模式里某一列取不到，才按 0 计。参数停用或被删除，引用处同样取不到值</td></tr>
          <tr><td><strong>已算工资</strong></td><td>改数据、改配置都<strong>只影响之后开始的算薪</strong>；已算出的结果不追溯</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>为什么列不分角色：</strong>一旦在表上标了「这列是条件、那列是结果」，同一张表就只能服务一种查法。
        把角色留在引用处，一份数据可以被多个薪酬项按不同口径取，改配置也不用动数据。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'gp-notes-terms', label: '三、文档说明' },
  { id: 'gp-notes-fields', label: '字段口径' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '模块化薪酬', to: '/docs/general-param' },
  { label: '三、文档说明' }
]
</script>

<style scoped src="./doc-base.css"></style>
