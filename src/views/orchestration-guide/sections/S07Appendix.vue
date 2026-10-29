<template>
  <DocShell
    :toc-items="tocItems"
    title="七、附录：待决事项"
    subtitle="已拍板的不再挂；仍挂起的写明归属方 + 卡在哪，不擅自拍板"
    version="v0.1"
    date="2026-10-30"
    :breadcrumbs="breadcrumbs"
  >
    <div id="orch-ap-decided" class="section">
      <div class="section-header">
        <h2>7.1 已拍板（本版按此执行，不再挂起）</h2>
        <DocCopyButton section-id="orch-ap-decided" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 180px;">问题</th><th style="width: 150px;">结论</th><th>理由</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>或签（任一人审批）</strong></td><td>本版<strong>不做</strong></td><td>缺「任一人办」的承担者语义；用一条结论挂一个角色更诚实，不假装支持</td></tr>
          <tr><td><strong>驳回 / 退回修改</strong></td><td><strong>不通过即终止</strong>，要再来<strong>重新发起</strong></td><td>回边会让「这一单办完没有」永远说不清，每轮都要重判谁该办</td></tr>
          <tr><td><strong>自由画布 / 分支网关</strong></td><td>本版<strong>不做</strong></td><td>先后只用前置表达；分岔来自事实，不来自配置（见 6.3.4）</td></tr>
          <tr><td><strong>「审核」作为一种路径类型</strong></td><td><strong>取消</strong></td><td>审核 = 一条结论 + 人办路径；多一个类型就多一种写法，改一处漏一处（见 6.4.5）</td></tr>
          <tr><td><strong>一条结论挂多种兑现方式</strong></td><td><strong>不支持</strong></td><td>多条路径是「或」：系统没成功、人点一下也算达成，系统项就白做了（见 6.5.4）</td></tr>
          <tr><td><strong>取数是子事件</strong></td><td><strong>不是</strong>，也不可配置</td><td>它没有承担者、不给结论；摆上树会让人以为能被排到交接之后（见 6.2.3）</td></tr>
        </tbody>
      </table>
    </div>

    <div id="orch-ap-open" class="section">
      <div class="section-header">
        <h2>7.2 仍待决</h2>
        <DocCopyButton section-id="orch-ap-open" />
      </div>
      <p class="doc-p">下面每一条都<strong>不阻塞本版落地</strong>，但会在真实运行中冒出来；写清归属方与卡点，不在本文拍板。</p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 210px;">事项</th><th style="width: 150px;">归属方</th><th>卡在哪</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>检查条件的版本与历史批次</strong></td>
            <td>检查 Agent 侧</td>
            <td>Agent 改了判定条件后，之前出批的历史结果按哪一版解释？流程侧只看「最新批次」，但审计要能回答「当时是按什么条件判的」——条件版本化口径未对齐</td>
          </tr>
          <tr>
            <td><strong>系统项失败的转人工默认值</strong></td>
            <td>各事件定义人 + 系统项负责人</td>
            <td>重试几次、间隔多久、转给谁，目前每个事件自己填；缺一套统一默认值与兜底角色，容易出现「转给了一个没人看的角色」</td>
          </tr>
          <tr>
            <td><strong>同一事实在多个事件里的口径</strong></td>
            <td>基础事实表维护方</td>
            <td>「有欠款」在离职与调店的严格程度不同（离职要求清零、调店只要不逾期）。是否允许事件级覆盖基础事实的判断，未定</td>
          </tr>
          <tr>
            <td><strong>同一个人同时有多张单</strong></td>
            <td>待定</td>
            <td>离职与调岗同时进行时，两套子事件里同名的事实（团队、资产）由谁先办、是否互相阻塞，没有仲裁规则</td>
          </tr>
          <tr>
            <td><strong>结果字段的改名与兼容</strong></td>
            <td>研发</td>
            <td>下游按「结论 · 字段名」取值，字段改名即断。缺字段级改名映射与弃用期的约定</td>
          </tr>
          <tr>
            <td><strong>附件与签字的留存</strong></td>
            <td>法务 / 合规</td>
            <td>签字图、交接凭证要保存多久、能否导出、员工离职后如何留存，需合规口径确认</td>
          </tr>
          <tr>
            <td><strong>提示词改版后的回归</strong></td>
            <td>事件维护人 + 测试</td>
            <td>改一句提示词会改变子事件清单。当前靠人工在编辑页对照「首次 / 后加 / 改过」，缺一套「改版前后对同一批样本人生成结果差异」的对比机制</td>
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
  { id: 'orch-ap-decided', label: '7.1 已拍板' },
  { id: 'orch-ap-open', label: '7.2 仍待决' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '事件编排', to: '/docs/orchestration' },
  { label: '七、附录：待决事项' }
]
</script>

<style scoped src="./doc-base.css"></style>
