<template>
  <DocShell
    :toc-items="tocItems"
    title="七、附录：已拍板与待决"
    subtitle="六条已拍板口径（不再重议）+ 八条挂起事项（归属方 + 卡在哪）"
    version="v3.0 基线"
    date="2026-11-12"
    :breadcrumbs="breadcrumbs"
  >
    <div id="hs-apx-decided" class="section">
      <div class="section-header">
        <h2>7.1 已拍板（2026-11-12）</h2>
        <DocCopyButton section-id="hs-apx-decided" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 40px;">#</th><th style="width: 200px;">结论</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td>1</td><td><strong>时段与获取规则解耦</strong></td><td>规则是独立对象，一条可挂多条时段，时段也可以不挂；同一条时段在不同门店可挂不同规则</td></tr>
          <tr><td>2</td><td><strong>层改为轮</strong></td><td>轮 = 开放 → 截止 → 结算；人群资格挂轮上；错峰 = 多轮开放时刻不同，前轮开着不被后轮关闭</td></tr>
          <tr><td>3</td><td><strong>审核通过即结果</strong></td><td>唯一记录口是既有排班结果表；不设审核单、不设审批流</td></tr>
          <tr><td>4</td><td><strong>余额三条去向</strong></td><td>再开一轮 / 兜底序列 / 不管；再开一轮的候选池是该人群<strong>零结果者</strong>（含从没申领的）</td></tr>
          <tr><td>5</td><td><strong>兜底边界</strong></td><td>逐档吃已有名额、逐档过时间不交叉、不突破名额上限；兜底是人群级义务，不是申领补偿</td></tr>
          <tr><td>6</td><td><strong>结果表不改结构</strong></td><td>只增加「怎么排上的」来源说明，下游读取方式不变</td></tr>
        </tbody>
      </table>
    </div>

    <div id="hs-apx-open" class="section">
      <div class="section-header">
        <h2>7.2 待决事项</h2>
      </div>
      <p class="doc-p">
        以下八条本版<strong>不擅自拍板</strong>：正文按现状写、原型按演示口径跑，等对应归属方给结论后再改。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 40px;">#</th><th style="width: 190px;">事项</th><th style="width: 230px;">卡在哪</th><th>归属方</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td><strong>必选时段分不完怎么办</strong></td>
            <td>非全推拿师的必选早 / 晚班如果没人接，是兜到常规班、还是留空、还是转派单</td>
            <td>运营 / 排班负责人</td>
          </tr>
          <tr>
            <td>2</td>
            <td><strong>审核要不要绝对门槛</strong></td>
            <td>现在只有「排序取前 N」，没有「低于 X 分不通过」；加了之后名额不足流入下一层还是留空</td>
            <td>运营</td>
          </tr>
          <tr>
            <td>3</td>
            <td><strong>业绩考核窗口</strong></td>
            <td>综合分取哪一段时间的业绩：上一周期已发布区间 / 自然月 / 近 30 天</td>
            <td>薪酬 + 运营</td>
          </tr>
          <tr>
            <td>4</td>
            <td><strong>名额算法的结构化</strong></td>
            <td>「按业绩生成名额」目前只有一个标签，公式与基数（按门店还是按人）没有落成字段</td>
            <td>业务</td>
          </tr>
          <tr>
            <td>5</td>
            <td><strong>并行轮的剩余可见口径</strong></td>
            <td>两轮同时开着时，前一轮的人能不能看到后一轮的剩余名额</td>
            <td>产品</td>
          </tr>
          <tr>
            <td>6</td>
            <td><strong>承办资格以哪一刻为准</strong></td>
            <td>申领时的岗位资格、还是结算时的岗位资格；人中途调店怎么算</td>
            <td>产品 + 研发</td>
          </tr>
          <tr>
            <td>7</td>
            <td><strong>抢的窗口最短多久</strong></td>
            <td>先到先得的档窗口能开多短：过短等于没有机会看，过长占着名额等人挑</td>
            <td>运营</td>
          </tr>
          <tr>
            <td>8</td>
            <td><strong>抢的关闸时刻</strong></td>
            <td>先到先得什么时候关：默认沿用现行「时段开始即关」，是否可配到档位规则上待确认；员工侧在关闸规则确认前不断言「几点前都能拿」</td>
            <td>运营</td>
          </tr>
          <tr>
            <td>9</td>
            <td><strong>顶别人到手的班怎么谈</strong></td>
            <td>顶别人已到手的班要提前多久说；要顶的段能不能嵌进顶班人自己的班（一人同段只支持一个占用）</td>
            <td>运营 + 排班负责人</td>
          </tr>
        </tbody>
      </table>
      <div class="note decision-note">
        <span class="decision-tag">怎么用</span>
        评审时逐条问归属方要结论；结论一落，改<strong>对应章节正文</strong>并补一条变更日志，
        不在这里打补丁。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'hs-apx-decided', label: '7.1 已拍板' },
  { id: 'hs-apx-open', label: '7.2 待决事项' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事中心', to: '/docs/hr-schedule' },
  { label: '七、附录' }
]
</script>

<style scoped src="./doc-base.css"></style>
