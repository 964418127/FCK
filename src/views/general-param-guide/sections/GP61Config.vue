<template>
  <DocShell
    :toc-items="tocItems"
    title="6.1 配置参数与数据表"
    subtitle="参数列表只管名字与启停；值类型是数据表时另开一页配列与数据，配完就地试算"
    version="v1.0"
    date="2026-11-10"
    :breadcrumbs="breadcrumbs"
  >
    <div id="gp-61-overview" class="section">
      <div class="section-header">
        <h2>6.1 配置参数与数据表</h2>
        <DocCopyButton section-id="gp-61" />
      </div>
      <div class="func-entry"><strong>功能入口：</strong>Web → 配置规则管理 → <strong>通用参数</strong></div>
      <p class="doc-p">
        配置只有两件事：先在列表里建一条参数（起名、选值类型），值类型若是<strong>数据表</strong>，再进配置页填列与数据。
        简单值当场在弹窗里填完，不另开页。
      </p>
    </div>

    <div id="gp-61-list" class="section">
      <div class="section-header">
        <h3>6.1.1 参数列表</h3>
      </div>
      <p class="doc-p">
        列表只回答「有哪些参数、是什么值类型、还开着没」。点<strong>编辑</strong>按值类型走两条路：简单值开弹窗改，数据表进配置页。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">列</th><th style="width: 210px;">内容</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>配置名称</strong></td><td>参数名，如「非全保底时薪」</td><td>公式里显示的就是这个名字</td></tr>
          <tr><td><strong>值类型</strong></td><td>文本 / 数值 / 日期 / 时间 / 四类数组 / 数据表</td><td>只表示「存什么」，不显示行列数</td></tr>
          <tr><td><strong>状态</strong></td><td>启用 / 停用</td><td>与右侧开关同源，一按即变</td></tr>
          <tr><td><strong>启用 / 禁用</strong></td><td>开关</td><td>停用后引用它的地方取不到值，并有提示</td></tr>
          <tr><td><strong>操作</strong></td><td>编辑 / 删除</td><td>只有这两个动作，没有「配置数据」这类二级入口</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>停用优先于删除：</strong>要先停一阵就停用，随时能开回来；确认没有薪酬项还在引用再删除。
        删除前二次确认写明「删除后引用它的公式将取不到值」。
      </div>
      <DocScreens
        :height="330"
        :images="[
          { src: gpListShot, label: '通用参数列表：搜索只按配置名称；每行给名称、值类型、状态、启用开关与编辑 / 删除；数据表与简单值在同一清单里，靠值类型区分' }
        ]"
      />
    </div>

    <div id="gp-61-table" class="section">
      <div class="section-header">
        <h3>6.1.2 数据表配置页</h3>
      </div>
      <p class="doc-p">
        页面从上到下就是配置顺序：<strong>基础信息 → 列 → 数据 → 试算</strong>。前三块把表建出来，第四块确认系统照你理解的那样取值。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">区块</th><th style="width: 260px;">做什么</th><th>规则</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>基础信息</strong></td><td>名称可改，值类型只读为「数据表」</td><td>名称必填、≤ 40 字；改引用关系不变，只改公式里显示的名字</td></tr>
          <tr><td><strong>列</strong></td><td>一行一个列：列名 + 列类型（文本 / 数值 / 日期）</td><td>列名必填、≤ 20 字、<strong>表内不可重复</strong>；重复时输入即标红、保存再拦</td></tr>
          <tr><td><strong>数据</strong></td><td>每列一个可填格，可增删行</td><td>格子里<strong>只放数</strong>：不写表达式、不写区间、不标优先级；数值列只收纯数字</td></tr>
          <tr><td><strong>试算</strong></td><td>给一组条件，看落到哪一行、取哪一列</td><td>不产生业务数据，不影响算薪</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>列不分角色：</strong>没有「标识列 / 数据列 / 维度列」，系统也不认列名。哪些列当条件、哪列当结果、按什么顺序取，
        全部在引用它的薪酬项上配（6.2）。所以同一张表能被两个薪酬项用不同口径取数，不必建两张表。
      </div>
      <div class="note">
        <strong>导入与导出：</strong>数据多时走文件 —— 先下载模板（表头就是当前列，附一页填写说明），填完上传 Excel / CSV，
        选「覆盖当前数据」或「追加到末尾」，默认覆盖。上传后先校验，有错不允许导入，提示到「第 N 行：原因」。
        导出按当前列生成，改完可直接再导入。
        <strong>表被改乱了要整表重来，用「清空数据」</strong>：删掉全部数据行、列定义保留，需二次确认，保存后生效。
      </div>
      <DocScreens
        :height="420"
        :images="[
          { src: gpTableShot, label: '数据表配置页：基础信息只有名称与只读的值类型；列一行一个；数据区就是这张表本身，格子只放数据' }
        ]"
      />
    </div>

    <div id="gp-61-try" class="section">
      <div class="section-header">
        <h3>6.1.3 试算</h3>
      </div>
      <p class="doc-p">
        配完列与数据，在试算区给一组条件，系统按同一套规则算一遍：<strong>落到第几行、取的是哪一列、值是多少</strong>；
        相加模式给出每个分项。它回答的是「我这么配，算薪时会不会照我理解的那样取」。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">项</th><th>规则</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>条件怎么填</strong></td><td>一行一条：条件列 + 符号 + 传入的值，与薪酬项里的写法完全一致</td></tr>
          <tr><td><strong>取值列</strong></td><td>默认取最后一列、单值模式，可就地改；相加模式只可选数值列</td></tr>
          <tr><td><strong>取不到时</strong></td><td>直接说「按这些条件取不到值」，并列出传了哪些条件 —— 不猜一个数给你看</td></tr>
        </tbody>
      </table>
      <DocScreens
        :height="258"
        :images="[
          { src: gpTryShot, label: '试算：人数档 = 2、客次下限 ≤ 26、客次上限 &gt; 26 → 「生效『单价』= 5（第 4 行）」；试算只验取数口径，不改数据、不影响算薪' }
        ]"
      />
      <div class="note warn-note">
        <strong>试算不拦业务错误：</strong>同一档位出现两行、上下限写反、某城市少了门店行，这些不报错。
        系统不替业务判断价格对不对，只保证「你配什么就取什么」。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'
import DocScreens from '../../../docs/components/DocScreens.vue'
import gpListShot from '../../../docs/assets/pages/gp-list.png'
import gpTableShot from '../../../docs/assets/pages/gp-table.png'
import gpTryShot from '../../../docs/assets/pages/gp-try.png'

const tocItems = [
  { id: 'gp-61-overview', label: '6.1 配置参数与数据表' },
  { id: 'gp-61-list', label: '6.1.1 参数列表' },
  { id: 'gp-61-table', label: '6.1.2 数据表配置页' },
  { id: 'gp-61-try', label: '6.1.3 试算' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '模块化薪酬', to: '/docs/general-param' },
  { label: '六、功能详细说明', to: '/docs/general-param/features' },
  { label: '6.1 配置参数与数据表' }
]
</script>

<style scoped src="./doc-base.css"></style>
