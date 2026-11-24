<template>
  <DocShell
    :toc-items="tocItems"
    title="7.1 待决事项"
    subtitle="不在本轮拍板但必须挂起的条目：归属方 + 卡在哪"
    version="v1.1"
    date="2026-11-24"
    :breadcrumbs="breadcrumbs"
  >
    <div id="sa-app" class="section">
      <div class="section-header">
        <h2>待决事项</h2>
        <DocCopyButton section-id="sa-app" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 200px;">条目</th><th>卡在哪</th><th style="width: 130px;">归属</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>入口名称与载体</strong></td>
            <td>入口形态已定（单独入口，暂定名【薪酬咨询助手】，见 6.4）；待决的是载体选型（企业微信 / 员工端小程序 / App）与对外名称，取决于渠道规划与登录态打通方式</td>
            <td>技术 + 渠道</td>
          </tr>
          <tr>
            <td><strong>常乐豆明细口径重评</strong></td>
            <td>公司常乐豆去明细化落地后，按新明细口径重新评估 Agent 的开放颗粒度（现行为账户级汇总，6.1）；在明细化定案前不承诺任何明细</td>
            <td>薪酬侧 + 产品</td>
          </tr>
          <tr>
            <td><strong>代扣金额的数据对接</strong></td>
            <td>老系统接口返回的代扣金额，同步到裁剪后数据面的方式与时效</td>
            <td>技术</td>
          </tr>
          <tr>
            <td><strong>人工出口的承接形式</strong></td>
            <td>转人工后走工单还是人事群承接，取决于人事现有的排查受理流程</td>
            <td>人事</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>说明：</strong>本文档正文里的口径均已定案；仅上表三项因依赖外部条件（渠道规划、老系统、人事流程）
        挂起，定案后迁入对应章节。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'sa-app', label: '7.1 待决事项' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '模块化薪酬', to: '/docs/salary-agent' },
  { label: '七、附录', to: '/docs/salary-agent/appendix' },
  { label: '7.1 待决事项' }
]
</script>

<style scoped src="./doc-base.css"></style>
