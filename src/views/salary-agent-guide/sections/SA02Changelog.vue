<template>
  <DocShell
    :toc-items="tocItems"
    title="二、变更日志"
    subtitle="v2.0 第 5、6 章整体重构：三岗位底账 + 两层围墙 + 四层应答深度 + 求证链"
    version="v2.0"
    date="2026-11-24"
    :breadcrumbs="breadcrumbs"
  >
    <div id="sa-log" class="section">
      <div class="section-header">
        <h2>变更日志</h2>
        <DocCopyButton section-id="sa-log" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 90px;">版本</th><th style="width: 110px;">日期</th><th style="width: 90px;">负责人</th><th>变更内容</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>v2.0</td>
            <td>2026-11-24</td>
            <td>Lacus7</td>
            <td>整体重构第 5、6 章：岗位覆盖落到模块化薪酬明确支持的三个岗位（全职推拿师 / 全职客户经理 / 非全推拿师），非全客户经理移入暂不开放并定「先底账后开放」纳入规则；围墙升级为两层——通用围墙三道 + 岗位差异围墙（从底账推导各岗位「什么不在场」）；新增应答深度分层（6.3）：完整求证 / 只答结论 / 账户级汇总 / 不在场四层，判据=数据可得性 × 敏感度，逐项标注进附录 7.2 – 7.4 底账（新增「深度」列）；新增完整求证链（6.4）：以「客次提成 15 块」为例走通本人业务事实 → 规则命中 → 计算过程 → 结论判定，明确求证层的数据源清单与边界（只还原已发生，试算预估仍不做）；产品入口并入人工出口成 6.5；取数通道从两类信息扩为三条（工资条 / 本人业务事实 / 政策命中值）</td>
          </tr>
          <tr>
            <td>v1.1</td>
            <td>2026-11-24</td>
            <td>Lacus7</td>
            <td>产品入口定为单独入口【薪酬咨询助手】（暂定名），新增 6.4 产品入口与使用链路；常乐豆升级为高风险围墙 —— 因劳动纠纷 + 公司推进去明细化，应答从「分类级汇总」收窄为「账户级汇总」（本月结算 / 可用余额 / 提现冻结），分类汇总、组成、计算规则一律不答；背景章补风险前提；7.1 待决新增常乐豆明细口径重评（随明细化，归属薪酬侧 + 产品）</td>
          </tr>
          <tr>
            <td>v1.0</td>
            <td>2026-11-23</td>
            <td>Lacus7</td>
            <td>首次成文：查询边界（两类信息）、岗位覆盖（推拿师 / 客户经理，全职与非全职；总部岗位暂不支持）、三道围墙与字段裁剪（含薪酬项只留显示名称、内部名称与策略模板名不进知识面）、社保/公积金/个税只答结论、非全不缴社保公积金且个税按周预扣 3% 月末多退少补、常乐豆两条线（组成只给分类级汇总、不给逐条明细；抵扣公积金不解释）、人工出口、附录 7.2/7.3/7.4 各岗位现行薪酬项清单（显示名 / 内部名 / 分组 / 现金或常乐豆，供围墙针对性设计的底账；非全推拿师全部现金、无常乐豆）</td>
          </tr>
        </tbody>
      </table>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'sa-log', label: '二、变更日志' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '模块化薪酬', to: '/docs/salary-agent' },
  { label: '二、变更日志' }
]
</script>

<style scoped src="./doc-base.css"></style>
