<template>
  <DocShell
    :toc-items="tocItems"
    title="6.1 查询范围与两类信息"
    subtitle="政策类答适用本人的命中值+依据；明细类答工资条原样；常乐豆只给账户级汇总"
    version="v1.1"
    date="2026-11-24"
    :breadcrumbs="breadcrumbs"
  >
    <div id="sa-61-two" class="section">
      <div class="section-header">
        <h2>员工能查的两类信息</h2>
        <DocCopyButton section-id="sa-61-two" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">类别</th><th style="width: 200px;">员工会问</th><th>Agent 答</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>薪酬政策类</strong></td>
            <td>我的保底是多少？我的客次单价是多少？</td>
            <td>适用本人的命中值 + 命中依据（城市 / 门店 / 人群哪一条）。答的是「命中后的那个数」，不摊配置表</td>
          </tr>
          <tr>
            <td><strong>模块化薪酬明细</strong></td>
            <td>我有几份工资？某份工资的构成？发了没有？</td>
            <td>工资条原样：项名 + 金额 + 所属工资单 + 发放时间 / 状态。只报数，不解释来历</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div id="sa-61-src" class="section">
      <div class="section-header">
        <h2>两类信息的取数方式</h2>
        <DocCopyButton section-id="sa-61-src" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">类别</th><th style="width: 210px;">数据来源</th><th>查询条件从哪来</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>薪酬政策类</strong></td>
            <td>通用参数的取值引擎（条件匹配 → 命中值）</td>
            <td>城市 / 门店 / 工号等条件由系统按登录人注入，员工口述的身份与归属信息一律不进引擎</td>
          </tr>
          <tr>
            <td><strong>模块化薪酬明细</strong></td>
            <td>工资条数据（已发放的）</td>
            <td>按登录人的员工编号取名下工资条，无其他取数通道</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>为什么政策类答依据：</strong>员工问的不是「保底政策是什么」，而是「适用于我的那个数是多少、依据什么来的」。
        命中依据是求证的核心 —— 员工要的不是再看一遍数字，而是「凭什么」。
      </div>
    </div>

    <div id="sa-61-bean" class="section">
      <div class="section-header">
        <h2>常乐豆：高风险围墙，只给账户级汇总</h2>
        <DocCopyButton section-id="sa-61-bean" />
      </div>
      <p class="doc-p">
        常乐豆与薪酬是两条线：常乐豆不是工资条的组成部分，也不参与应税收入。
        近期常乐豆存在劳动纠纷，公司正在推进常乐豆去明细化 —— 明细口径未定期间，Agent 对常乐豆
        <strong>一律只答账户级汇总</strong>（本月结算、可用余额、提现冻结三个数），分类及以下任何颗粒度不开放。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 230px;">员工会问</th><th>Agent 答</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>我的常乐豆账户情况？</strong></td>
            <td>账户级汇总：本月结算 X 颗、可用余额 X 颗、提现冻结 X 颗 —— 到此为止</td>
          </tr>
          <tr>
            <td><strong>本月住宿获豆是多少？某类豆为什么是这个数？</strong></td>
            <td>不答分类数字、不解释原因，只回账户级汇总（追问也只回账户级汇总，见 6.3 兜底句）</td>
          </tr>
          <tr>
            <td><strong>常乐豆怎么组成的？各类汇总？</strong></td>
            <td>不提供分类汇总与组成，只回账户级汇总</td>
          </tr>
          <tr>
            <td><strong>豆是怎么算的？</strong></td>
            <td>计算规则暂不开放（高风险期收窄），只回账户级汇总</td>
          </tr>
          <tr>
            <td><strong>常乐豆和我的工资有什么关系？</strong></td>
            <td>两条线，联动关系不在场（6.2），只答固定一句</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>为什么收这么紧：</strong>劳动纠纷背景下，Agent 的任何应答都可能被截图留存作为依据；
        在明细口径定案之前，分类与算法层面的应答只会放大争议面 —— 账户级汇总是员工核对账户本身所需的最小信息。
        <br /><strong>口径会随明细化演进：</strong>公司常乐豆去明细化落地后，按新明细口径重新评估开放颗粒度（7.1 待决，归属薪酬侧 + 产品）。
        <br /><strong>谁有常乐豆：</strong>仅全职推拿师、全职客户经理。非全职、兼职及其他岗位问起，答「该岗位不参与常乐豆」。
      </div>
    </div>

    <div id="sa-61-mul" class="section">
      <div class="section-header">
        <h2>多张工资条</h2>
        <DocCopyButton section-id="sa-61-mul" />
      </div>
      <p class="doc-p">
        一名员工名下可以有多张工资条（按发放主体、按计薪周期拆）。Agent 逐张可查、逐张可答；
        员工问「我有几份工资」时，按当期名下工资条逐张列出发放主体、计薪周期与状态。
      </p>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'sa-61-two', label: '员工能查的两类信息' },
  { id: 'sa-61-src', label: '两类信息的取数方式' },
  { id: 'sa-61-bean', label: '常乐豆：高风险围墙，只给账户级汇总' },
  { id: 'sa-61-mul', label: '多张工资条' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '模块化薪酬', to: '/docs/salary-agent' },
  { label: '六、功能详细说明' },
  { label: '6.1 查询范围与两类信息' }
]
</script>

<style scoped src="./doc-base.css"></style>
