<template>
  <DocShell
    :toc-items="tocItems"
    title="6.1 容器与时段"
    subtitle="时段只描述时间形态：班次、适用星期、名额、生成节奏；它不说「谁能领」"
    version="v3.0 基线"
    date="2026-11-12"
    :breadcrumbs="breadcrumbs"
  >
    <div id="hs-61" class="section">
      <div class="section-header">
        <h2>6.1 容器与时段</h2>
        <DocCopyButton section-id="hs-61" />
      </div>
      <div class="func-entry">
        <strong>功能入口：</strong>排班策略 → 时段（左侧按容器选，右侧按星期看时段表）
      </div>

      <h3 id="hs-61-1">6.1.1 容器：时段属于谁</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">容器类型</th><th style="width: 240px;">典型对象</th><th>为什么要分类型</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>门店</strong></td><td>兴隆湖店、麓山店</td><td>按营业时间展开班次；名额跟本店签约人数挂钩</td></tr>
          <tr><td><strong>办公地点</strong></td><td>总部办公区</td><td>行政班一次铺整月，与营业时间无关</td></tr>
          <tr><td><strong>城市</strong></td><td>长沙</td><td>城市级机动岗位（跨店驻场）</td></tr>
          <tr><td><strong>人</strong></td><td>单个管理者</td><td>一对一值班，名额恒为 1</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>打卡考勤挂在容器上，不挂在时段上：</strong>人是在某个地点打的卡，不是在某个时段里打的卡。
        本期只保留这个挂载点，打卡功能本身不做。
      </div>

      <h3 id="hs-61-2">6.1.2 时段有哪些字段</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 140px;">字段</th><th style="width: 200px;">取值</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>所属容器</strong></td><td>必填</td><td>建完不可改容器，只能新建</td></tr>
          <tr><td><strong>班次</strong></td><td>必须取自本容器班次库</td><td>本店没有就先生成或自建（见 6.2）</td></tr>
          <tr><td><strong>名称</strong></td><td>默认跟随班次名</td><td>门店可改名，通用班次名不变</td></tr>
          <tr><td><strong>适用星期</strong></td><td>每天 / 工作日 / 指定几天</td><td>决定铺哪些日期，周末不铺就不生成</td></tr>
          <tr><td><strong>名额</strong></td><td>整数</td><td>物理上限，兜底与余额再分配都不突破</td></tr>
          <tr><td><strong>生成节奏</strong></td><td>每周 / 每月 / 手动</td><td>含星期或日、含时刻；时刻支持跨日写法</td></tr>
          <tr><td><strong>生成视野</strong></td><td>下一批 7 天 / 两周 / 整月</td><td>整月按自然月落日期</td></tr>
          <tr><td><strong>来源标记</strong></td><td>引用模板 / 门店自建 / 引用后改</td><td>只作展示与追溯，不参与计算</td></tr>
        </tbody>
      </table>
      <div class="note warn-note">
        <strong>时段里没有的东西：</strong>没有「谁能领」、没有「谁先领」、没有顺位、没有兜底。
        这些全部在<router-link to="/docs/hr-schedule/6-3">6.3 获取规则</router-link>里，一条规则可以挂多条时段。
      </div>

      <h3 id="hs-61-3">6.1.3 生成：铺的是名额实例，不是排班结果</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">要点</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>铺什么</strong></td><td>按视野把「某天 × 某时段 × N 个名额」铺成实例，此时<strong>还没有人</strong></td></tr>
          <tr><td><strong>什么时候铺</strong></td><td>每周四 06:00 铺下一批；每月 25 日 09:00 铺下月整月；也可手动</td></tr>
          <tr><td><strong>幂等</strong></td><td>同一周期重跑不重复铺，只补差</td></tr>
          <tr><td><strong>与开放的关系</strong></td><td>铺出来 ≠ 能申领；能不能申领看规则里的轮开放到没到</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>一句话：</strong>生成时钟与开放时钟是两个钟。先铺后开，铺了不一定马上能申——
        这就是「错峰可见」能配出来的原因。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'hs-61', label: '6.1 容器与时段' },
  { id: 'hs-61-1', label: '6.1.1 容器' },
  { id: 'hs-61-2', label: '6.1.2 时段字段' },
  { id: 'hs-61-3', label: '6.1.3 生成' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事中心', to: '/docs/hr-schedule' },
  { label: '六、功能详细说明', to: '/docs/hr-schedule/features' },
  { label: '6.1 容器与时段' }
]
</script>

<style scoped src="./doc-base.css"></style>
