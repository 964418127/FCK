<template>
  <DocShell
    :toc-items="tocItems"
    title="6.1 查询范围与两类信息"
    subtitle="政策类答适用本人的命中值+依据；明细类答工资条原样"
    version="v1.0"
    date="2026-11-23"
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
        <h2>常乐豆：两条线，组成可查</h2>
        <DocCopyButton section-id="sa-61-bean" />
      </div>
      <p class="doc-p">
        常乐豆与薪酬是两条线：常乐豆不是工资条的组成部分，也不参与应税收入。
        员工查薪酬时，Agent 不把常乐豆算进任何收入或扣缴项；查常乐豆时，也不把它混进工资条。
        组成汇总的来源是模块化薪酬计算结果里的「获豆明细」「扣豆」分组——与工资同一套计算结果，对外仍按两条线呈现。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 230px;">员工会问</th><th>Agent 答</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>我的常乐豆是怎么组成的？</strong></td>
            <td>可查：本月合计、各分类的获豆 / 扣豆汇总（分类因岗位而异）——<strong>只给分类级汇总，不给分类下的逐条明细</strong>（每条的数量 / 业务日期 / 业务编号不在 Agent 数据面）</td>
          </tr>
          <tr>
            <td><strong>某一类豆是怎么算的？</strong></td>
            <td>分类的计算规则由模块化薪酬的发放策略提供，属于政策类口径，按本页政策类方式答（适用本人的命中值 + 依据）</td>
          </tr>
          <tr>
            <td><strong>常乐豆抵扣公积金的部分呢？</strong></td>
            <td>不可答：抵扣扣减现行即无备注、无说明，Agent 不做解释，只答固定一句（见 6.3 追问兜底）</td>
          </tr>
          <tr>
            <td><strong>常乐豆和我的工资有什么关系？</strong></td>
            <td>联动关系不在场（6.2），只答固定一句</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>为什么只给汇总：</strong>分类汇总已够员工核对自己的常乐豆组成；
        逐条明细能对回具体业务动作，第一版不开放——员工要逐条，引导去自助明细查询。
        <br /><strong>谁有常乐豆：</strong>仅全职推拿师、全职客户经理。非全职、兼职及其他岗位问起，答「该岗位不参与常乐豆」。
        <br /><strong>为什么抵扣不解释：</strong>抵扣公积金的扣减在现行规则里就不做过多解释（扣减类型和数量无备注无说明）——
        Agent 沿用同一条边界，系统里没有的解释，Agent 也不编。
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
  { id: 'sa-61-bean', label: '常乐豆：两条线，组成只给汇总' },
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
