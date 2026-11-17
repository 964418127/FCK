<template>
  <DocShell
    :toc-items="tocItems"
    title="三、文档说明"
    subtitle="跨章节共用名词 26 条 + 统一字段口径 9 条；同一名词只在这里定义一次"
    version="v3.0 基线"
    date="2026-11-12"
    :breadcrumbs="breadcrumbs"
  >
    <div id="hs-notes-term" class="section">
      <div class="section-header">
        <h2>三、文档说明</h2>
        <DocCopyButton section-id="hs-notes-term" />
      </div>

      <h3 id="hs-term">名词解释</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">名词</th><th style="width: 300px;">含义</th><th>容易混的地方</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>上班容器</strong></td><td>时段与名额的归属对象，考勤打卡也挂在它上面</td><td>不等于门店；城市、办公地点、个人也可以是容器</td></tr>
          <tr><td><strong>品牌分类</strong></td><td>门店上层的分组，也就是配置台最外层的 tab（直营品牌商场店 / 直营品牌小店）；分类清单可增、改名、删</td><td><strong>只有两层：分类 → 门店</strong>，中间没有「品牌」层；只做分组，不影响名额与获取；办公区不是门店，单独一类</td></tr>
          <tr><td><strong>容器类型</strong></td><td>门店 / 办公地点 / 城市 / 人，四类</td><td>类型决定能挂什么，不影响名额怎么分</td></tr>
          <tr><td><strong>班次</strong></td><td>一段起止时间 + 休息，如早班 10:00–18:00</td><td>班次是时间，不是岗位</td></tr>
          <tr><td><strong>班次模板</strong></td><td>全平台通用班次，跨店比对身份用</td><td><strong>引用即继承</strong>：改模板，门店班次跟着变</td></tr>
          <tr><td><strong>门店班次库</strong></td><td>本容器引用或自建的班次，可改名、可调时间</td><td>改名只影响本店，不影响通用模板</td></tr>
          <tr><td><strong>时段</strong></td><td>容器上一个可被占用的时间段，只说时间形态</td><td><strong>不含「谁能领」</strong>，那是获取规则的事</td></tr>
          <tr><td><strong>时段模板</strong></td><td>时段的完整配置骨架，不含容器与具体日期</td><td><strong>快照实例化</strong>：改模板不动已建时段</td></tr>
          <tr><td><strong>名额</strong></td><td>一条时段可被占用的位置数，物理容量</td><td>谁都超不过它，兜底也不能超</td></tr>
          <tr><td><strong>名额实例</strong></td><td>某一天、某时段的 N 个位置</td><td>生成出来的是实例，<strong>不是排班结果</strong></td></tr>
          <tr><td><strong>生成节奏</strong></td><td>什么时候铺名额：每周 / 每月 / 手动</td><td>与「开放申领」是两个时钟，别混</td></tr>
          <tr><td><strong>生成视野</strong></td><td>一次铺多久：下一批 7 天 / 两周 / 整月</td><td>视野是时段属性，与容器无关</td></tr>
          <tr><td><strong>幂等</strong></td><td>同一周期重复执行不重复铺</td><td>重跑只补差，不推翻已写结果</td></tr>
          <tr><td><strong>获取规则</strong></td><td>独立对象：谁、什么时候、按什么、拿几个、剩了怎么办</td><td>一条规则可挂多条时段；时段也可以不挂</td></tr>
          <tr><td><strong>模式</strong></td><td>系统直派 / 公布即抢 / 申领审核，三种</td><td>模式回答「谁定归属」，不回答「什么时候定」</td></tr>
          <tr><td><strong>轮</strong></td><td>规则内的一段申领期：开放 → 截止 → 结算</td><td>人群资格挂在轮上；错峰 = 轮开放时刻不同</td></tr>
          <tr><td><strong>申领截止</strong></td><td>轮关闭的时刻，之后不再收申领</td><td>截止不是「定归属」，定归属在结算</td></tr>
          <tr><td><strong>结算</strong></td><td>截止后在<strong>已申领的人</strong>里定归属</td><td>没人申领 = 无可结算，直接进余额</td></tr>
          <tr><td><strong>综合分</strong></td><td>产值 40 + 回头率 30 + 预约率 30 的加权</td><td>回头率兼作破平项；权重可配，合计须为 100</td></tr>
          <tr><td><strong>班次性质</strong></td><td>可选（要自己申）/ 必选（被安排即拥有）</td><td>必选层不能用先到先得，也不能兜成留空</td></tr>
          <tr><td><strong>余额</strong></td><td>结算后没被占掉的名额</td><td>余额不是「浪费」，是下一轮的入口</td></tr>
          <tr><td><strong>兜底序列</strong></td><td>容器内班次的有序列表，逐档吃当天剩余名额</td><td>逐档都要过时间不交叉；档满才进下一档</td></tr>
          <tr><td><strong>留待派发</strong></td><td>兜底也满了，名额挂着等运营处理</td><td>不是「留空」，是有主的待办</td></tr>
          <tr><td><strong>落空</strong></td><td>一条时段实例最终没人接</td><td>结果页要能看见落空多少，配置才有反馈</td></tr>
          <tr><td><strong>申领单</strong></td><td>人 + 时段实例 + 申领时刻 + 状态</td><td>只管「申了没、审完什么状态」，不是审批单</td></tr>
          <tr><td><strong>待审 / 被挤出</strong></td><td>申领中与被截断后的两个中间态</td><td>被挤出必须带下一步，否则链路断在人身上</td></tr>
          <tr><td><strong>怎么排上的</strong></td><td>结果行的来源说明，用人话说</td><td>审核通过 / 先到先得 / 轮转 / 直派 / 兜底到某班</td></tr>
        </tbody>
      </table>
    </div>

    <div id="hs-notes-field" class="section">
      <div class="section-header">
        <h2>字段口径</h2>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">字段</th><th style="width: 240px;">值域</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>时段.来源</strong></td><td>引用模板 / 门店自建 / 引用后改</td><td>三种都允许；引用后改只改这条时段，不回写模板</td></tr>
          <tr><td><strong>时段.生成节奏</strong></td><td>每周（含星期 + 时刻）/ 每月（含日 + 时刻）/ 手动</td><td>时刻支持跨日写法，<strong>25:00 = 次日 01:00</strong></td></tr>
          <tr><td><strong>时段.生成视野</strong></td><td>下一批 7 天 / 两周 / 整月</td><td>整月按自然月落日期，不按 30 天推</td></tr>
          <tr><td><strong>时段.名额</strong></td><td>整数</td><td>物理上限；兜底与余额再分配都不突破</td></tr>
          <tr><td><strong>规则.模式</strong></td><td>direct / grab / review</td><td>一组规则只有一个模式，多模式拆成多条规则</td></tr>
          <tr><td><strong>规则.轮</strong></td><td>人群 + 开放 + 截止 + 结算 + 审核口径</td><td>公布即抢只有开放没有截止；直派没有轮</td></tr>
          <tr><td><strong>轮.时刻锚点</strong></td><td>排班日 N 天前后 HH:MM / 生成即开放 / 每月某日</td><td>与生成节奏共用同一套时刻写法，不接受自由文本</td></tr>
          <tr><td><strong>规则.余额</strong></td><td>再开一轮 / 兜底序列 / 不管</td><td>再开一轮同样有申领期与截止；兜底序列是有序列表</td></tr>
          <tr><td><strong>申领单.状态</strong></td><td>待审 / 已得 / 被挤出 / 已取消 / 已兜底</td><td>已得与被挤出、已兜底都由结算或兜底写入，人不改</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>写文档的规矩：</strong>页面文案不许出现 direct / grab / review、锚点、幂等等配置词，
        这些只在<strong>配置页</strong>与本文档使用；员工侧一律用「怎么排上的」那句人话。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'hs-notes-term', label: '三、文档说明' },
  { id: 'hs-term', label: '名词解释' },
  { id: 'hs-notes-field', label: '字段口径' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事中心', to: '/docs/hr-schedule' },
  { label: '三、文档说明' }
]
</script>

<style scoped src="./doc-base.css"></style>
