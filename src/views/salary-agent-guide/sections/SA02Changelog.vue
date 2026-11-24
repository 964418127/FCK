<template>
  <DocShell
    :toc-items="tocItems"
    title="二、变更日志"
    subtitle="v1.1 单独入口定案 + 常乐豆高风险围墙；后续同轮修订就地更新"
    version="v1.1"
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
