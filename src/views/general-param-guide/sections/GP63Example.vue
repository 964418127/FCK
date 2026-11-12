<template>
  <DocShell
    :toc-items="tocItems"
    title="6.3 示例说明"
    subtitle="保底时薪一张覆盖表；客次 / 新客 / 评价单价各一张同构表"
    version="v1.0"
    date="2026-11-10"
    :breadcrumbs="breadcrumbs"
  >
    <div id="gp-63-overview" class="section">
      <div class="section-header">
        <h2>6.3 示例说明</h2>
        <DocCopyButton section-id="gp-63-overview" />
      </div>
      <p class="doc-p">
        两个例子都用非全客户经理的真实口径：一个演示三层覆盖，一个演示档位区间加门店与个人差异。
        两张表都配好后，薪酬项公式里只剩一句取值，不再有按城市 / 门店 / 档位分叉的判断。
      </p>
    </div>

    <div id="gp-63-case1" class="section">
      <div class="section-header">
        <h3>6.3.1 例一：非全保底时薪（通用 → 城市 → 门店）</h3>
      </div>
      <p class="doc-p">
        三列、七行。通用行两列条件都留空，任何查询都先能比到它；城市行只填城市；门店行城市与门店都填。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">城市</th><th style="width: 130px;">门店</th><th style="width: 100px;">时薪</th><th>这一行在说什么</th></tr>
        </thead>
        <tbody>
          <tr><td></td><td></td><td><strong>25</strong></td><td>通用价：没匹配到更具体的就按它</td></tr>
          <tr><td>成都</td><td></td><td><strong>28</strong></td><td>成都所有门店的基准</td></tr>
          <tr><td>杭州</td><td></td><td><strong>30</strong></td><td>同上</td></tr>
          <tr><td>北京</td><td></td><td><strong>32</strong></td><td>同上</td></tr>
          <tr><td>成都</td><td>兴隆湖店</td><td><strong>30</strong></td><td>在成都基准上加 2</td></tr>
          <tr><td>成都</td><td>麓山店</td><td><strong>29</strong></td><td>在成都基准上加 1</td></tr>
          <tr><td>杭州</td><td>西湖店</td><td><strong>33</strong></td><td>在杭州基准上加 3</td></tr>
        </tbody>
      </table>
      <p class="doc-p"><strong>薪酬项里怎么配：</strong>取 1 列「时薪」，加两条条件 —— <code>城市 = 门店所在城市</code>、<code>门店 = 员工所属门店</code>。</p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 220px;">算这一笔的人</th><th style="width: 240px;">命中哪一行</th><th>取到的时薪</th></tr>
        </thead>
        <tbody>
          <tr><td>成都 · 兴隆湖店</td><td>成都 / 兴隆湖店</td><td><strong>30</strong>（门店行盖过城市行）</td></tr>
          <tr><td>成都 · 天府三街店</td><td>成都 / 空</td><td><strong>28</strong>（门店行没命中，用城市行）</td></tr>
          <tr><td>重庆 · 观音桥店</td><td>全空（通用行）</td><td><strong>25</strong>（城市行也没命中，用兜底行）</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>门店行存的是最终值，不是差额。</strong>改城市价时要顺手核对这个城市下的门店行；
        如果想改成「城市基准 + 门店差额」两表相加，取多列相加即可实现，但那要多维护一张表，见附录第 2 条。
      </div>
    </div>

    <div id="gp-63-case2" class="section">
      <div class="section-header">
        <h3>6.3.2 例二：非全客次单价（人数档 × 客次档）</h3>
      </div>
      <p class="doc-p">
        七列：城市 / 门店 / 工号 / 人数档 / 客次下限 / 客次上限 / 单价。通用部分按 <strong>3 个人数档 × 3 个客次档</strong> 铺满，
        城市、门店、工号只在有差异时加行 —— 加得越具体，优先级越高。下表只列 2 人店与它的差异行：
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 100px;">城市</th><th style="width: 110px;">门店</th><th style="width: 80px;">工号</th><th style="width: 80px;">人数档</th><th style="width: 100px;">客次下限</th><th style="width: 100px;">客次上限</th><th>单价</th></tr>
        </thead>
        <tbody>
          <tr><td></td><td></td><td></td><td>2</td><td>0</td><td>30</td><td><strong>5</strong></td></tr>
          <tr><td></td><td></td><td></td><td>2</td><td>30</td><td>40</td><td><strong>5.5</strong></td></tr>
          <tr><td></td><td></td><td></td><td>2</td><td>40</td><td>（空 = 无上限）</td><td><strong>6</strong></td></tr>
          <tr><td>成都</td><td></td><td></td><td>2</td><td>0</td><td>30</td><td><strong>5.5</strong></td></tr>
          <tr><td>成都</td><td>兴隆湖店</td><td></td><td>2</td><td>0</td><td>30</td><td><strong>6</strong></td></tr>
          <tr><td>成都</td><td>兴隆湖店</td><td>E100</td><td>2</td><td>0</td><td>30</td><td><strong>7</strong></td></tr>
          <tr><td>成都</td><td>兴隆湖店</td><td>E009</td><td>2</td><td>0</td><td>30</td><td><strong>0</strong></td></tr>
        </tbody>
      </table>
      <p class="doc-p">
        <strong>薪酬项里怎么配：</strong>取 1 列「单价」，五条条件 —— <code>人数档 = 门店非全在岗人数</code>、
        <code>客次下限 ≤ 当月客次</code>、<code>客次上限 &gt; 当月客次</code>、<code>城市 = 门店所在城市</code>、<code>门店 = 员工所属门店</code>；
        需要按个人给价时再加 <code>工号 = 员工工号</code>。表里没填的格不约束，所以不必担心某几行没写城市。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 250px;">算这一笔</th><th style="width: 260px;">命中哪一行</th><th>取到的单价</th></tr>
        </thead>
        <tbody>
          <tr><td>杭州某店 · 2 人店 · 客次 26</td><td>2 / 0–30（通用格）</td><td><strong>5</strong></td></tr>
          <tr><td>杭州某店 · 2 人店 · 客次 30</td><td>2 / 30–40（下限含、上限不含）</td><td><strong>5.5</strong></td></tr>
          <tr><td>成都某店 · 2 人店 · 客次 45</td><td>2 / 40 以上（通用格）</td><td><strong>6</strong></td></tr>
          <tr><td>成都 · 兴隆湖店 · 2 人店 · 客次 20 · 工号 E100</td><td>成都 / 兴隆湖店 / E100</td><td><strong>7</strong>（个人行盖过门店行）</td></tr>
          <tr><td>同上，工号 E009</td><td>成都 / 兴隆湖店 / E009</td><td><strong>0</strong>（显式 0 是值，命中即止，不再往上找 6）</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>三个单价是同一套结构的三张表。</strong>新客单价、评价单价与客次单价列一样、配法一样，各建一张、各自维护，
        改一张不影响另外两张。
      </div>
    </div>

    <div id="gp-63-simple" class="section">
      <div class="section-header">
        <h3>6.3.3 什么时候不用数据表</h3>
      </div>
      <p class="doc-p">
        一个数就够、不随城市门店变的，用<strong>简单值</strong>就行：面试通过单价 200、知识萃取单价 80、
        房间卫生未打扫扣 20。简单值在弹窗里直接填，公式里取到就是它，没有查询条件。
      </p>
      <div class="note">
        <strong>判断标准：</strong>「这个数会不会因为城市、门店、人数、档位不同而不同」。会 → 数据表；不会 → 简单值。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'gp-63-overview', label: '6.3 示例说明' },
  { id: 'gp-63-case1', label: '6.3.1 保底时薪' },
  { id: 'gp-63-case2', label: '6.3.2 客次单价' },
  { id: 'gp-63-simple', label: '6.3.3 何时用简单值' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '模块化薪酬', to: '/docs/general-param' },
  { label: '六、功能详细说明', to: '/docs/general-param/features' },
  { label: '6.3 示例说明' }
]
</script>

<style scoped src="./doc-base.css"></style>
