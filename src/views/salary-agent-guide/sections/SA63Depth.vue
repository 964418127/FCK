<template>
  <DocShell
    :toc-items="tocItems"
    title="6.3 应答深度分层：每个薪酬项答到多深"
    subtitle="判据只有一条：数据可得性 × 敏感度——能还原的还原，还原不了的只报结论，敏感的只给账户级"
    version="v2.1"
    date="2026-11-24"
    :breadcrumbs="breadcrumbs"
  >
    <div id="sa-63-why" class="section">
      <div class="section-header">
        <h2>为什么需要分层</h2>
        <DocCopyButton section-id="sa-63-why" />
      </div>
      <p class="doc-p">
        员工的问题不是一个「项名」，而是一个求证：<strong>「这个数怎么来的、对不对」</strong>。
        但不是每个项都能回答到这个深度——能不能还原、还原到哪一步，取决于两件事：
        <strong>数据可得性</strong>（计算输入是否都在数据面里）和<strong>敏感度</strong>（还原过程会不会暴露不该摊的东西）。
        两件事都是客观事实，不由话术决定，所以分层是硬规则：每个薪酬项归入且只归入一层，
        归层结果标注在附录底账（7.2 – 7.4）每一行上。
      </p>
    </div>

    <div id="sa-63-criterion" class="section">
      <div class="section-header">
        <h2>归层判据</h2>
        <DocCopyButton section-id="sa-63-criterion" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 90px;">层级</th><th style="width: 250px;">判据（三条同时满足才进求证层）</th><th>答到多深</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>L1 完整求证</strong></td>
            <td>① 计算输入是员工本人可见的业务事实（自己的订单、接待、卫生记录）② 计算规则可命中为具体数值 ③ 还原过程不暴露他人数据与内部账务</td>
            <td>给事实 → 给规则命中 → 给计算过程 → 给结论判定：「15 块 = 3 单 × 5 元，正确」或「有出入，出入在…，转人工」（6.4 走完整链路）</td>
          </tr>
          <tr>
            <td><strong>L2 只答结论</strong></td>
            <td>结论在工资条上，但满足以下任一条：计算输入含内部口径 / 第三方内容（如投诉处理结果）、或项本身是人工行政动作（无计算可还原）</td>
            <td>只给项名 + 金额 + 所属工资单 + 发放时间与状态，不给基数、不给过程、不做两期变动归因</td>
          </tr>
          <tr>
            <td><strong>L3 账户级汇总</strong></td>
            <td>高风险围墙项（常乐豆）：劳动纠纷 + 去明细化推进中，任何分类与算法层面的应答都会放大争议面</td>
            <td>只给三个数：本月结算、可用余额、提现冻结；追问几层都只回固定句</td>
          </tr>
          <tr>
            <td><strong>L4 不在场</strong></td>
            <td>公司侧账务 / 该岗位不参与——数据面里根本没有</td>
            <td>社保公积金单位部分等：问也问不出；员工问起不在场的项，如实答「不参与 / 不缴纳」（6.2）</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>分层与围墙的关系：</strong>围墙（6.2）决定「数据面里有什么」，分层决定「有的部分答到多深」——
        L1 – L3 都是围墙之内的项，区别只在答的深度；L4 连数据面都没进。
        <br /><strong>不是「知道但不说」：</strong>L2 不给过程，是因为过程依赖的输入（内部口径、第三方内容）已按围墙剥掉——
        Agent 的知识里没有第二层可说，员工不会察觉到回避。
      </div>
    </div>

    <div id="sa-63-groups" class="section">
      <div class="section-header">
        <h2>按底账归层：三岗位主要项归类</h2>
        <DocCopyButton section-id="sa-63-groups" />
      </div>
      <p class="doc-p">
        下表把三个岗位底账（7.2 – 7.4）的薪酬项按组归层，<strong>逐项的精确标注以底账每一行的「深度」列为准</strong>；
        策略调整时由薪酬侧同步维护归层，Agent 不自行判断。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 140px;">岗位</th><th style="width: 130px;">深度</th><th>薪酬项组（显示名口径）</th></tr>
        </thead>
        <tbody>
          <tr><td rowspan="4"><strong>全职推拿师</strong>（7.3）</td><td><span class="lv lv1">L1 求证</span></td><td>全月计件收入、工作日 / 节假日加班收入、修脚、打赏——事实=本人订单与服务记录，规则=计件单价与加班倍数</td></tr>
          <tr><td><span class="lv lv2">L2 结论</span></td><td>手动津贴、系统津贴、退单补贴、三级合伙人等人工行政项；代扣三类；投诉扣款、系统 / 手动补扣</td></tr>
          <tr><td><span class="lv lv3">L3 账户级</span></td><td>全部常乐豆形式项：保底 / 超产值 / 营销 / 回头客 / 住房 / 接待等服务获豆类 + 各类扣豆——一律并入账户级三数</td></tr>
          <tr><td><span class="lv lv4">L4 不在场</span></td><td>社保公积金单位部分、购买单位</td></tr>
          <tr><td rowspan="4"><strong>全职客户经理</strong>（7.2）</td><td><span class="lv lv1">L1 求证</span></td><td>计件客次收入、加班客次提成——事实=本人接待记录与订单，规则=客次提成单价</td></tr>
          <tr><td><span class="lv lv2">L2 结论</span></td><td>各班次津贴与激励（新客班次 / 接待 / 卫生类激励为打扫记录驱动的，第一版按结论层答，还原待事实数据接入后重评）、代扣三类、扣缴组各扣款</td></tr>
          <tr><td><span class="lv lv3">L3 账户级</span></td><td>获豆明细分组六项（新客 / 评价 / 盘点 / 资产卫生维护 / 采购物资 / 布草洗涤）+ 物资超标扣豆——并入账户级三数</td></tr>
          <tr><td><span class="lv lv4">L4 不在场</span></td><td>社保公积金单位部分、购买单位</td></tr>
          <tr><td rowspan="3"><strong>非全推拿师</strong>（7.4）</td><td><span class="lv lv1">L1 求证</span></td><td>提成收入、回头客激励、新店订单激励等订单驱动项——事实=本人订单，规则=提成比例</td></tr>
          <tr><td><span class="lv lv2">L2 结论</span></td><td>打赏之外的补贴类（内部介绍 / 知识萃取 / 面试激励）、系统 / 手动补贴、代扣个税及各扣款</td></tr>
          <tr><td><span class="lv lv4">L4 不在场</span></td><td>社保公积金整类、常乐豆整类（底账无豆项）</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>两个要点：</strong>
        ① 形式与深度是两回事——「三级合伙人」走现金但归 L2（人工行政项），常乐豆形式项全部归 L3，不逐项讨论；
        ② 打赏在推拿师底账走现金、归 L1（事实=客户打赏记录）；同类项在不同岗位归层可以不同，一切以底账行为准。
      </div>
    </div>

    <div id="sa-63-fallback" class="section">
      <div class="section-header">
        <h2>层外问题：追问兜底</h2>
        <DocCopyButton section-id="sa-63-fallback" />
      </div>
      <p class="doc-p">
        超出所在层深度的追问，只答固定一句，不做展开。常乐豆问题无论追问几层，都只回固定句，
        不展开账户级汇总以外的任何内容：
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 250px;">问题类型</th><th>固定口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>L2 项追问过程（基数 / 税率 / 为什么变多）</strong></td><td>「该项金额以工资条为准，如有疑问请联系人事核实。」</td></tr>
          <tr><td><strong>常乐豆追问（分类汇总 / 组成 / 算法 / 为什么少）</strong></td><td>「常乐豆相关问题目前仅提供账户级汇总（本月结算 / 可用余额 / 提现冻结），明细与计算说明请以人事核实为准。」</td></tr>
          <tr><td><strong>L4 项追问（单位交了多少 / 为什么没有）</strong></td><td>按 6.2 如实答「该岗位不参与 / 不缴纳」，不展开</td></tr>
        </tbody>
      </table>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'sa-63-why', label: '为什么需要分层' },
  { id: 'sa-63-criterion', label: '归层判据' },
  { id: 'sa-63-groups', label: '按底账归层' },
  { id: 'sa-63-fallback', label: '层外问题：追问兜底' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '模块化薪酬', to: '/docs/salary-agent' },
  { label: '六、功能详细说明' },
  { label: '6.3 应答深度分层' }
]
</script>

<style scoped src="./doc-base.css"></style>

<style scoped>
.lv {
  display: inline-block; padding: 1px 8px; border-radius: 999px;
  font-size: 11px; font-weight: 600; line-height: 18px; white-space: nowrap;
}
.lv1 { color: hsl(150 60% 28%); background: hsl(150 60% 40% / 0.12); }
.lv2 { color: hsl(220 60% 40%); background: hsl(220 60% 40% / 0.1); }
.lv3 { color: hsl(38 90% 35%); background: hsl(38 90% 50% / 0.14); }
.lv4 { color: hsl(0 0% 45%); background: hsl(0 0% 50% / 0.12); }
</style>
