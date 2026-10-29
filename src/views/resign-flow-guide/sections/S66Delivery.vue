<template>
  <DocShell
    :toc-items="tocItems"
    title="6.6 下游交付"
    subtitle="交付内容只有两样：「离职事实」+「实际离职日期」—— 不含金额、不含假勤结存结论；各域按自己的规则消费"
    version="v0.3"
    date="2026-10-26"
    :breadcrumbs="breadcrumbs"
  >
        <div id="rf-deliver" class="section">
          <div class="section-header">
            <h2>6.6 下游交付</h2>
            <DocCopyButton section-id="rf-deliver" />
          </div>
          <div class="func-entry"><strong>功能入口：</strong>—（本节为交付口径，无对应页面）</div>
          <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary)); margin-bottom: 16px;">
            <strong>交付内容只有两样：</strong>「离职事实」+「实际离职日期」。不包含金额、不包含假勤结存结论。
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 150px;">消费方</th>
                <th style="width: 130px;">消费方式</th>
                <th>消费后各自做什么</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><strong>假勤</strong></td><td>读取事实</td><td>自己出结果（额度结存、是否超休）</td></tr>
              <tr><td><strong>薪酬</strong></td><td>读取事实 + 金额</td><td>按自己的规则清算（抵扣 / 清零 / 扣缴 / 计税）</td></tr>
              <tr><td><strong>常乐豆</strong></td><td>读取事实</td><td>按自己的逻辑处理（提现 / 清零并记录清零原因）</td></tr>
              <tr class="row-mech">
                <td><strong>排班</strong></td>
                <td>读取事实</td>
                <td><strong>实际离职日期之后的排班全部取消</strong>（推拿师 / 客户经理均适用）；主动离职由审核确认时发起，<strong>解除用工同样执行</strong>（以解除确认时为界）</td>
              </tr>
              <tr><td><strong>权限</strong></td><td>读取事实</td><td>实际离职日期之后截断接单权限；<strong>解除用工同样执行</strong></td></tr>
              <tr>
                <td><strong>预约订单</strong></td>
                <td>读取事实</td>
                <td>接单权限截断后<strong>不再接新单</strong>；实际离职日期之后的在途预约由预约系统按自己的规则改派 / 取消 / 通知客户。<strong>怎么处置不由离职决定</strong>，离职侧只发事实与日期</td>
              </tr>
              <tr>
                <td><strong>新员工关系</strong></td>
                <td>写入事实</td>
                <td>写入离职事实与实际离职日期，员工状态置为离职，<strong>完整履职经历</strong>留档（原「员工档案」只是其中一部分）；后续入职、调岗、续签均以此为准</td>
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
  { id: 'rf-deliver', label: '6.6 下游交付' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '离职流程', to: '/docs/resign-flow' },
  { label: '六、功能详细说明', to: '/docs/resign-flow/features' },
  { label: '6.6 下游交付' }
]
</script>

<style scoped src="./doc-base.css"></style>
<style scoped src="./flow-parts.css"></style>
