<template>
  <DocShell
    :toc-items="tocItems"
    title="四、需求背景"
    subtitle="解除用工现在只是一次状态写入：下游各自被动反应，没人承接资产处置（常乐豆余额、补偿金）"
    version="v0.3"
    date="2026-10-26"
    :breadcrumbs="breadcrumbs"
  >
    <div id="rf-bg-now" class="section">
      <div class="section-header">
        <h2>四、需求背景</h2>
        <DocCopyButton section-id="rf-bg" />
      </div>

      <div class="note lead-note">
        <strong>一句话现状：</strong>【解除用工】是一次「状态写入」，不是「流程编排」。它只把员工标记为离职，之后各系统<strong>被动感知</strong>这个状态各自运转 ——
        <strong>但资产处置（常乐豆余额、补偿金）没人承接</strong>，这正是本版要补齐的一环（见 6.3）。
      </div>

      <h3>4.1 现在是谁在「被动反应」</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 130px;">系统</th>
            <th style="width: 130px;">反应方式</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>工资</strong></td>
            <td>次月被动感知</td>
            <td>次月算薪时发现员工已是离职状态，但算法与在职员工完全一致。这<strong>不算 bug</strong> —— 工资计算的对象本来就是服务 / 订单的<strong>事实数据</strong>，离职与否不改变事实本身</td>
          </tr>
          <tr>
            <td><strong>任职段</strong></td>
            <td>自动截尾</td>
            <td>人员异动自动截尾旧任职段（见「人事福利 / 人员异动流程」）</td>
          </tr>
          <tr>
            <td><strong>接单权限</strong></td>
            <td>主动截断</td>
            <td>实际离职日期之后截断 —— 这是少数<strong>主动</strong>的动作</td>
          </tr>
          <tr>
            <td><strong>常乐豆</strong></td>
            <td>交付余额</td>
            <td>离职侧交付「5 日冻结锁定的余额」；这笔钱怎么出去（进补偿金 / 由常乐豆自行提现 / 清零）属常乐豆系统自己的逻辑，两条通道不并行</td>
          </tr>
        </tbody>
      </table>

      <h3 id="rf-bg-gap">4.2 真正的缺口</h3>
      <p class="doc-p">
        缺的是<strong>一整层「员工处理态个人资产」的处置方案</strong>。人走了，他名下的东西 —— 假期余额、
        负工资账户、常乐豆、在途单据、社保关系 —— 没有任何一处主动清算，全靠「碰到了再说」。
      </p>
      <div class="note">
        <strong>本场景要补的不是「谁来算钱」，而是「谁在什么时候、把什么事实交给谁」。</strong>
        各域按自己的规则消费这份事实，离职侧不代算。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'rf-bg-now', label: '4.1 现在是谁在「被动反应」' },
  { id: 'rf-bg-gap', label: '4.2 真正的缺口' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '离职流程', to: '/docs/resign-flow' },
  { label: '四、需求背景' }
]
</script>

<style scoped src="./doc-base.css"></style>
