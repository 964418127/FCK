<template>
  <DocShell
    :toc-items="tocItems"
    title="6.2 在薪酬项里使用"
    subtitle="插入参数时配两件事：取哪一列、用哪些条件查；条件按「条件列 → 符号 → 传入的值」读"
    version="v1.0"
    date="2026-11-10"
    :breadcrumbs="breadcrumbs"
  >
    <div id="gp-62-overview" class="section">
      <div class="section-header">
        <h2>6.2 在薪酬项里使用</h2>
        <DocCopyButton section-id="gp-62" />
      </div>
      <div class="func-entry"><strong>功能入口：</strong>Web → 模块化薪酬 → 薪酬项配置 → 编辑薪酬项 → 计算公式旁 <strong>通用参数</strong> → 选择一个参数 → 配取值与条件 → 插入参数</div>
      <p class="doc-p">
        弹窗里只有两块：上面是<strong>取值函数</strong>（取哪一列、要不要相加），下面是<strong>查询条件</strong>（拿什么去查这张表）。
        配好点<strong>插入参数</strong>，公式里就多出一段<strong>表名.列名</strong>（如 <code>非全保底时薪.时薪</code>，多列相加写成 <code>非全客次单价.单价+补贴</code>）。
        插入后的样子、以及怎么改怎么删，见 6.2.4。
      </p>
      <DocScreens
        :height="430"
        :images="[
          { src: gpQuoteShot, label: '插入通用参数：选择参数后只列数据表；取值函数选「取 1 列」或多列相加；查询条件按条件列、符号、传入的值逐行添加' }
        ]"
      />
    </div>

    <div id="gp-62-value" class="section">
      <div class="section-header">
        <h3>6.2.1 取值函数：取哪一列</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">模式</th><th style="width: 300px;">规则</th><th>什么时候用</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>取 1 列</strong></td><td>按选择顺序，<strong>第一个取到值的列生效</strong>；显式写的 0 也算值，命中即止；一列都没取到就是取不到值，<strong>不按 0 计</strong></td><td>最常见。如客次单价只取「单价」这一列</td></tr>
          <tr><td><strong>取多列相加</strong></td><td>只可选数值列；各列分别取第一个取到值的，再相加；某列取不到按 0</td><td>需要两份数叠加，如城市基准 + 门店差异额</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>取值列与条件列是两回事：</strong>取值列不参与命中判定。同一列可以在这次引用里当条件、在另一次引用里当取值。
      </div>
    </div>

    <div id="gp-62-cond" class="section">
      <div class="section-header">
        <h3>6.2.2 查询条件：拿什么去查</h3>
      </div>
      <p class="doc-p">
        一条条件读作「<strong>表里这一列的值 与 传入的值 比较</strong>」，例：客次下限 ≤ 当月客次。
        条件按需添加，不配就没有 —— 不配条件的列，表里该列有值的行都不会参与。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">项</th><th>规则</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>符号</strong></td><td>等于 / 不等于 / 大于 / 大于等于 / 小于 / 小于等于 六种；<strong>文本列只给等于、不等于</strong></td></tr>
          <tr><td><strong>传入的值</strong></td><td>选一个上下文事实（城市、门店、门店人数、工号、当月客次……），算薪时按这笔的实际值代入，不是手填常量</td></tr>
          <tr><td><strong>区间怎么写</strong></td><td>不写进格子。用两列配两条条件：<strong>客次下限 ≤ 当月客次</strong> + <strong>客次上限 &gt; 当月客次</strong>；上限留空 = 无上限</td></tr>
          <tr><td><strong>配了条件但没传值</strong></td><td>该行不参与，直接取不到值 —— 不按行序凑一个数</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>为什么区间不用「≥40」「30-39」写进格子：</strong>这类写法在 29.9、39.5 这种小数上会落进缝里取不到，
        写在文本列上直接失效，写错一个符号整表静默错价。<strong>格子只放边界数字，比较交给条件</strong>，就没这些问题。
      </div>
    </div>

    <div id="gp-62-hit" class="section">
      <div class="section-header">
        <h3>6.2.3 命中与兜底</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 190px;">规则</th><th>含义</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>有值就要覆盖</strong></td><td>行里这一列填了值，就必须配了对应条件、传了值并比得过，否则该行不参与。只传城市时，填了门店的行不会被错拿</td></tr>
          <tr><td><strong>留空不约束</strong></td><td>行里这一列空着 = 对这项不设要求，任何查询都能比到它</td></tr>
          <tr><td><strong>越具体越优先</strong></td><td>命中多行时，条件填得更具体的那行先取（填 3 格优先于填 2 格）；同样具体按表里行序</td></tr>
          <tr><td><strong>兜底行</strong></td><td>更具体的行都没命中，才用条件列全空的那一行（通用行）。没有兜底行就取不到值</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>这就是「门店价盖过城市价、城市价盖过通用价」的全部来源</strong>，不需要另外配优先级。
        取不到时，引用处提示「按这些条件取不到值」，不静默按 0 参与计算。
      </div>
    </div>

    <div id="gp-62-applied" class="section">
      <div class="section-header">
        <h3>6.2.4 插入之后：公式里的引用与卡片</h3>
      </div>
      <p class="doc-p">
        插入完，公式框里多出一段「<strong>表名.列名</strong>」，公式下方多出一张<strong>引用卡片</strong>（显示「表名 · 取值列」）。
        卡片是这条引用在薪酬项上唯一的管理入口，公式里那串文字不用手改。
      </p>
      <DocScreens
        :height="298"
        :images="[
          { src: gpAppliedShot, label: '插入后的样子：公式末尾出现「非全保底时薪.时薪」，下方一张引用卡片「非全保底时薪 · 时薪」，右侧修改 / 移除' }
        ]"
      />
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">动作</th><th>结果</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>插入的内容</strong></td><td>只插入引用本身（表名.列名），<strong>不带运算符</strong>。接在公式末尾，前面的 <code>+</code>、<code>-</code> 或括号由配置者自己补</td></tr>
          <tr><td><strong>点卡片 / 修改</strong></td><td>回填这次配置（参数、取值函数、查询条件）再改；确认后公式里的文字按新的表名与列名同步替换，不会留下旧写法</td></tr>
          <tr><td><strong>点移除</strong></td><td>卡片消失，<strong>公式里对应的那段文字一起删掉</strong>，并提示「已移除，公式里对应的文字也删掉了」—— 不留悬空引用</td></tr>
          <tr><td><strong>一条公式引用多次</strong></td><td>可以。每次插入各自一张卡片、各自一套条件（如两列分两次取），互不影响</td></tr>
          <tr><td><strong>参数被删除</strong></td><td>卡片显示「（参数已删除）」，算薪时取不到值；需改引到别的参数或移除</td></tr>
          <tr><td><strong>参数被停用</strong></td><td>卡片照常显示，但算薪取数时报「参数已停用，取不到值」；停用期间不参与计算</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>卡片上不写取值口径：</strong>取哪一列、按哪些条件、命中谁，都在卡片点开后的弹窗里看与改。
        卡片只承担一件事 —— 让配置者知道这条公式引用了哪个参数、哪几列。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'
import DocScreens from '../../../docs/components/DocScreens.vue'
import gpQuoteShot from '../../../docs/assets/pages/gp-quote-dialog.png'
import gpAppliedShot from '../../../docs/assets/pages/gp-quote-applied.png'

const tocItems = [
  { id: 'gp-62-overview', label: '6.2 在薪酬项里使用' },
  { id: 'gp-62-value', label: '6.2.1 取值函数' },
  { id: 'gp-62-cond', label: '6.2.2 查询条件' },
  { id: 'gp-62-hit', label: '6.2.3 命中与兜底' },
  { id: 'gp-62-applied', label: '6.2.4 插入之后' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '模块化薪酬', to: '/docs/general-param' },
  { label: '六、功能详细说明', to: '/docs/general-param/features' },
  { label: '6.2 在薪酬项里使用' }
]
</script>

<style scoped src="./doc-base.css"></style>
