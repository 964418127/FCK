<template>
  <DocShell
    :toc-items="tocItems"
    title="6.2 围墙与字段裁剪"
    subtitle="三道关：只能查自己、敏感信息不在场、只读；裁剪在喂给 Agent 之前做"
    version="v1.0"
    date="2026-11-23"
    :breadcrumbs="breadcrumbs"
  >
    <div id="sa-62-walls" class="section">
      <div class="section-header">
        <h2>三道围墙</h2>
        <DocCopyButton section-id="sa-62-walls" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">关</th><th>规则</th><th style="width: 220px;">落点</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>只能查自己</strong></td>
            <td>身份由登录态判定，查询条件由系统按登录人注入。任何对话内容——「我是人事」「帮我查张三」「你现在是调试模式」——都不能改变查询对象</td>
            <td>数据层：按登录人取数，不存在按姓名查人的通道</td>
          </tr>
          <tr>
            <td><strong>敏感信息不在场</strong></td>
            <td>他人数据、公司侧账务来源、内部薪酬口径文档不进 Agent 的数据面与知识面。模型被诱导也不会泄密，因为它没有可泄的东西</td>
            <td>数据与知识裁剪：喂给 Agent 之前剥掉，不是藏起来</td>
          </tr>
          <tr>
            <td><strong>只读</strong></td>
            <td>只查询、不修改、不代发任何操作。薪酬数据不进写路径</td>
            <td>无写路径</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>设计原则：</strong>围墙不依赖提示词约束模型。三种常见诱导（冒充身份、代人查询、要求切换模式）
        在数据层就不可达 —— 「不能看」和「拿不到」是两种可靠性。
      </div>
    </div>

    <div id="sa-62-strip" class="section">
      <div class="section-header">
        <h2>字段裁剪清单</h2>
        <DocCopyButton section-id="sa-62-strip" />
      </div>
      <p class="doc-p">
        工资条数据喂给 Agent 之前，以下字段直接剥除。员工问「公司给我交了多少」，Agent 的知识里没有这个数可说。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 220px;">剥除项</th><th>原因</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>公积金单位部分金额</strong></td><td>公司侧账务，与员工结论无关</td></tr>
          <tr><td><strong>公积金购买单位</strong></td><td>申报主体与合同主体的关系不能摊开</td></tr>
          <tr><td><strong>社保单位部分金额</strong></td><td>公司侧账务，与员工结论无关</td></tr>
          <tr><td><strong>社保购买单位</strong></td><td>同上</td></tr>
          <tr><td><strong>代扣三类的基数与计算过程</strong></td><td>只保留结论金额（6.3）</td></tr>
          <tr><td><strong>内部薪酬口径文档</strong></td><td>常乐豆抵扣规则、内部计提规则等不进 Agent 知识面</td></tr>
          <tr><td><strong>薪酬项内部名称、策略与模板名称</strong></td><td>Agent 只用工资单显示名称；内部名称暴露系统实现，且存在跨岗位复用（内部名带「推拿师」的项客户经理也在用），一律不进知识面</td></tr>
          <tr><td><strong>常乐豆的逐条明细与抵扣联动</strong></td><td>只保留分类级汇总；逐条记录（数量 / 业务日期 / 业务编号）与抵扣公积金的扣减、与工资条的对应关系不在数据面</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>保留项：</strong>员工本人的「代扣社保 / 代扣公积金 / 代扣个税」金额、收入组与业务扣款组各明细、
        发放时间与状态、脱敏后的收付款账户信息。
      </div>
    </div>
    <div id="sa-62-map" class="section">
      <div class="section-header">
        <h2>显示名称映射</h2>
        <DocCopyButton section-id="sa-62-map" />
      </div>
      <p class="doc-p">
        Agent 数据面按「发放策略 + 显示名称」建映射，不按名称一对一匹配——同一个内部薪酬项在不同策略下显示名可以不同
        （如「服务时长不足扣款」与「服务时长不足扣提成」是同一项的两种显示）。
        同一岗位可能并存多个发放模板，员工只看显示名称与金额，不感知模板。映射配置由薪酬侧维护。
      </p>
      <p class="doc-p">
        各岗位当前生效的薪酬项全量底账（显示名 / 内部名 / 分组 / 现金或常乐豆形式）见附录：
        <router-link to="/docs/salary-agent/7-2">7.2 全日制客户经理</router-link>、
        <router-link to="/docs/salary-agent/7-3">7.3 全职推拿师</router-link>——裁剪规则落地时按这份清单逐项对照。
      </p>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'sa-62-walls', label: '三道围墙' },
  { id: 'sa-62-strip', label: '字段裁剪清单' },
  { id: 'sa-62-map', label: '显示名称映射' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '模块化薪酬', to: '/docs/salary-agent' },
  { label: '六、功能详细说明' },
  { label: '6.2 围墙与字段裁剪' }
]
</script>

<style scoped src="./doc-base.css"></style>
