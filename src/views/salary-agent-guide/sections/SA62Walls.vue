<template>
  <DocShell
    :toc-items="tocItems"
    title="6.2 围墙体系：通用围墙 + 岗位差异围墙"
    subtitle="通用三道对所有岗位一致；岗位差异围墙按底账定各岗位「什么不在场」"
    version="v2.4"
    date="2026-11-24"
    :breadcrumbs="breadcrumbs"
  >
    <div id="sa-62-walls" class="section">
      <div class="section-header">
        <h2>通用围墙：三道，所有岗位同一规则</h2>
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
        <br /><strong>与岗位差异围墙的分工：</strong>通用围墙回答「什么数据对谁都拿不到」；
        岗位差异围墙回答「这个岗位的数据面里有什么、没什么」——两者叠加才是完整的数据面。
      </div>
    </div>

    <div id="sa-62-post" class="section">
      <div class="section-header">
        <h2>岗位差异围墙：从底账推导「什么不在场」</h2>
        <DocCopyButton section-id="sa-62-post" />
      </div>
      <p class="doc-p">
        三个岗位的数据面不一样——不是规则宽严不同，而是<strong>底账里根本没有那些项</strong>。
        下表从附录底账（7.2 – 7.4）推导每个岗位「围墙之内有什么、围墙之外没什么」。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">岗位</th><th style="width: 250px;">数据面里有（可答）</th><th>数据面里没有（不在场）</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>全职推拿师</strong></td>
            <td>计件 / 加班 / 打赏等现金工资项与业务事实；社保 / 公积金 / 个税代扣结论；常乐豆账户级汇总</td>
            <td>社保公积金单位部分与购买单位；常乐豆分类与逐条（高风险围墙，6.3）；内部口径文档；他人数据</td>
          </tr>
          <tr>
            <td><strong>全职客户经理</strong></td>
            <td>客次提成等现金工资项与业务事实；社保 / 公积金 / 个税代扣结论；常乐豆账户级汇总</td>
            <td>同上——区别只在获豆 / 扣豆的分类集合不同（底账 7.2），不在围墙宽严</td>
          </tr>
          <tr>
            <td><strong>非全推拿师</strong></td>
            <td>提成 / 激励等现金工资项与业务事实；个税预扣与多退少补结论</td>
            <td>社保公积金整类（不缴纳，工资条里无此项）；常乐豆整类（不参与，底账无豆项）；他人数据</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>员工问起不在场的项怎么办：</strong>不是回避，是如实答「该岗位不参与 / 不缴纳」——
        非全问社保公积金，答「非全日制用工不缴纳社保和公积金」，不展开；非全问常乐豆，答「该岗位不参与常乐豆」。
        这类应答有底账背书（7.4 全部现金、无常乐豆），不是临时话术。
      </div>
    </div>

    <div id="sa-62-strip" class="section">
      <div class="section-header">
        <h2>字段裁剪清单（通用围墙的落地细则）</h2>
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
          <tr><td><strong>代扣三类的基数与计算过程</strong></td><td>只保留结论金额（6.3 结论层）</td></tr>
          <tr><td><strong>内部薪酬口径文档</strong></td><td>常乐豆抵扣规则、内部计提规则等不进 Agent 知识面</td></tr>
          <tr><td><strong>薪酬项内部名称、策略与模板名称</strong></td><td>Agent 只用工资单显示名称；内部名称暴露系统实现，且存在跨岗位复用（内部名带「推拿师」的项客户经理也在用），一律不进知识面</td></tr>
          <tr><td><strong>常乐豆的分类与逐条明细</strong></td><td>高风险围墙（近期常乐豆劳动纠纷 + 公司推进去明细化，明细口径未定）：数据面只保留账户级汇总（本月结算 / 可用余额 / 提现冻结），分类汇总、组成、逐条记录、抵扣公积金的扣减、与工资条的对应关系均不在数据面</td></tr>
          <tr><td><strong>投诉扣款的工单详情</strong></td><td>扣款结论可答（结论层），投诉单的第三方内容与处理过程不在数据面</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>保留项：</strong>员工本人的「代扣社保 / 代扣公积金 / 代扣个税」金额、收入组与业务扣款组各明细、
        发放时间与状态、脱敏后的收付款账户信息；常乐豆账户级汇总三项（高风险期口径，随明细化演进重评，见 6.3）；
        求证层所需的本人业务事实（订单、接待、卫生记录，6.4）。
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
        各岗位当前生效的薪酬项全量底账（显示名 / 内部名 / 分组 / 现金或常乐豆形式 / 应答深度）见附录：
        <router-link to="/docs/salary-agent/7-2">7.2 全日制客户经理</router-link>、
        <router-link to="/docs/salary-agent/7-3">7.3 全职推拿师</router-link>、
        <router-link to="/docs/salary-agent/7-4">7.4 非全推拿师</router-link>——围墙与分层落地时按这三份清单逐项对照。
      </p>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'sa-62-walls', label: '通用围墙：三道' },
  { id: 'sa-62-post', label: '岗位差异围墙' },
  { id: 'sa-62-strip', label: '字段裁剪清单' },
  { id: 'sa-62-map', label: '显示名称映射' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '模块化薪酬', to: '/docs/salary-agent' },
  { label: '六、功能详细说明' },
  { label: '6.2 围墙体系' }
]
</script>

<style scoped src="./doc-base.css"></style>
