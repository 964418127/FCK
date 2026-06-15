<template>
  <DocShell
    :toc-items="tocItems"
    title="十一、财务计提凭证"
    subtitle='工资单确认/发放时按会计科目自动生成的计提凭证 + 与各模块（工资/社保/公积金/常乐豆/离职补偿）的科目映射'
    version="v2"
    date="2026-06-11"
    :breadcrumbs="breadcrumbs"
  >
    <div id="financial-voucher" class="section">
      <h2>十一、财务计提凭证</h2>

      <div class="card" style="background: hsl(var(--primary) / 0.08); border: 1px solid hsl(var(--primary) / 0.3);">
        <div style="font-size: 13px; line-height: 1.8;">
          <strong>说明：</strong>本章用于描述 <strong>财务计提凭证</strong>——即在工资单确认/发放时，由系统按会计科目规则自动生成的计提凭证（应付工资、社保/公积金公司部分、个税代扣等），用于对接财务总账系统。
          <br/><br/>
          <strong>本章节内容待补充：</strong>凭证生成时机、科目映射规则、与各模块（工资/社保/公积金/常乐豆/离职补偿）的对应关系、跨主体凭证拆分、传递至总账系统的接口形态等。
        </div>
      </div>

      <div class="card" id="fv-scope">
        <h3>章节占位</h3>
        <div class="note">
          <strong>📌 内容范围（待细化）：</strong>
          <ol style="margin: 8px 0 0 20px; line-height: 1.9;">
            <li><strong>计提凭证触发节点</strong>——工资单确认后 / 工资发放时 / 月末关账时</li>
            <li><strong>凭证科目映射</strong>——应付工资、社保（公司/个人）、公积金（公司/个人）、个税代扣、常乐豆抵扣、离职补偿、激励补贴等</li>
            <li><strong>跨主体拆分</strong>——1 个工资单涉及多主体时凭证按主体拆分；多主体场景的报税/计提顺序</li>
            <li><strong>对接财务系统</strong>——凭证格式（用友 / 金蝶 / 自建）、传递方式、失败回滚</li>
            <li><strong>与 v2-1 阶段的差异</strong>——常乐豆抵扣、激励补贴、离职补偿等新增项的凭证处理</li>
          </ol>
        </div>
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'

const tocItems = [
  { id: 'fv-scope', label: '章节占位 / 内容范围' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '产品需求v2', to: '/docs/product-v2' },
  { label: '十一、财务计提凭证' }
]
</script>
