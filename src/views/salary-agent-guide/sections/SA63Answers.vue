<template>
  <DocShell
    :toc-items="tocItems"
    title="6.3 回答口径与人工出口"
    subtitle="代扣三类只答结论；常乐豆追问一律固定句；非全不缴社保公积金、个税按周预扣多退少补"
    version="v1.1"
    date="2026-11-24"
    :breadcrumbs="breadcrumbs"
  >
    <div id="sa-63-three" class="section">
      <div class="section-header">
        <h2>代扣三类：只答结论，不做解释</h2>
        <DocCopyButton section-id="sa-63-three" />
      </div>
      <p class="doc-p">
        社保、公积金、个税三类代扣项，Agent 的知识里只有结论：项名、金额、所属工资单、发放时间与状态。
        不给基数、不给税率、不给计算过程、不做两个月之间的变动归因。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">能答</th><th>不能答</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>结论</strong></td>
            <td>「代扣公积金扣 1,200 元，属于 6 月第 2 期工资条，已于 7 月 9 日发放」——到此为止</td>
          </tr>
          <tr>
            <td><strong>不能答</strong></td>
            <td>基数是多少、税率怎么定、公司部分交了多少、这个月为什么比上个月多、金额是怎么算出来的</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>设计原则：</strong>不是「知道但不说」，是知识里没有更多信息可给。员工不会察觉到回避 ——
        这三类项在 Agent 里就是结论本身，没有第二层。
      </div>
    </div>

    <div id="sa-63-fallback" class="section">
      <div class="section-header">
        <h2>追问兜底</h2>
        <DocCopyButton section-id="sa-63-fallback" />
      </div>
      <p class="doc-p">
        下面两类问题只答固定一句，不做展开。常乐豆问题无论追问几层，都只回固定句，不展开账户级汇总以外的任何内容：
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 190px;">问题类型</th><th>固定口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>代扣三类追问</strong></td><td>「该项金额以工资条为准，如有疑问请联系人事核实。」</td></tr>
          <tr><td><strong>常乐豆追问（分类汇总 / 组成 / 算法 / 为什么少）</strong></td><td>「常乐豆相关问题目前仅提供账户级汇总（本月结算 / 可用余额 / 提现冻结），明细与计算说明请以人事核实为准。」</td></tr>
        </tbody>
      </table>
      <p class="doc-p">
        其余两类信息不适用兜底句：政策类答命中值与依据（6.1）；业务扣款按工资条所列原样答，原因以工资条为准。
      </p>
    </div>

    <div id="sa-63-post" class="section">
      <div class="section-header">
        <h2>岗位与用工类型的口径差异</h2>
        <DocCopyButton section-id="sa-63-post" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 190px;">岗位 / 用工类型</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>全职推拿师 / 客户经理</strong></td>
            <td>社保、公积金、个税均有代扣，按本文档结论式口径答（只给项名 + 金额 + 所属工资单 + 发放状态）</td>
          </tr>
          <tr>
            <td><strong>非全职推拿师 / 客户经理</strong></td>
            <td>不缴纳社保、公积金 —— 代扣三类里只有个税；员工问社保公积金，答「非全日制用工不缴纳社保和公积金」，不展开。非全推拿师现行薪酬项全部为现金、无常乐豆（底账见 <router-link to="/docs/salary-agent/7-4">7.4</router-link>）</td>
          </tr>
          <tr>
            <td><strong>总部岗位</strong></td>
            <td>第一版不开放查询（见五、需求范围）</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div id="sa-63-weekly" class="section">
      <div class="section-header">
        <h2>非全职的周薪与个税口径</h2>
        <DocCopyButton section-id="sa-63-weekly" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">口径</th><th>内容</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>周薪模式</strong></td><td>非全职按周出工资条，每条一个薪酬期</td></tr>
          <tr><td><strong>预扣个税</strong></td><td>周薪阶段按 3% 预扣个税</td></tr>
          <tr><td><strong>多退少补</strong></td><td>月最后的薪酬期真实申报个税后，对当月各期预扣进行多退少补</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>可答与不可答的界线：</strong>预扣比例、周薪模式、多退少补规则属于政策类口径（6.1），Agent 可答；
        对工资条已列的各期结论，可做合理化推算——如将当月各期预扣相加、与月末【代扣个税】对比，说明多退少补的差额来源。
        推算只基于工资条既有数据；基数、税档等不在场的信息（6.2）不参与推算。
      </div>
    </div>

    <div id="sa-63-escape" class="section">
      <div class="section-header">
        <h2>人工出口</h2>
        <DocCopyButton section-id="sa-63-escape" />
      </div>
      <p class="doc-p">
        员工核实后仍不服时，Agent 不受理申诉、不解释口径，只提供显式转人工路径，携带以下条目：
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">条目</th><th>内容</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>员工</strong></td><td>登录人（系统带入，不需要员工自报）</td></tr>
          <tr><td><strong>工资单编号</strong></td><td>被质疑的那张工资条</td></tr>
          <tr><td><strong>质疑项</strong></td><td>具体的收入项或扣缴项名称</td></tr>
          <tr><td><strong>已查内容</strong></td><td>Agent 已给出的金额与依据，供人事接手时对账</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>边界：</strong>人工出口是查证的终点、人事排查的起点 —— 不把冲突原样挡回给员工，
        也不在 Agent 里承诺处理结果与时限。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'sa-63-three', label: '代扣三类：只答结论' },
  { id: 'sa-63-fallback', label: '追问兜底' },
  { id: 'sa-63-post', label: '岗位与用工类型的口径差异' },
  { id: 'sa-63-weekly', label: '非全职的周薪与个税口径' },
  { id: 'sa-63-escape', label: '人工出口' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '模块化薪酬', to: '/docs/salary-agent' },
  { label: '六、功能详细说明' },
  { label: '6.3 回答口径与人工出口' }
]
</script>

<style scoped src="./doc-base.css"></style>
