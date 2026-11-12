<template>
  <DocShell
    :toc-items="tocItems"
    title="6.3 获取规则（模式 / 轮 / 余额）"
    subtitle="规则是独立对象：一条规则可挂多条时段，时段也可以先不挂；三种模式 + 三个时刻 + 三条余额去向"
    version="v3.0 基线"
    date="2026-11-12"
    :breadcrumbs="breadcrumbs"
  >
    <div id="hs-63" class="section">
      <div class="section-header">
        <h2>6.3 获取规则</h2>
        <DocCopyButton section-id="hs-63" />
      </div>
      <div class="func-entry">
        <strong>功能入口：</strong>排班策略 → 获取规则（卡片看概要，点开抽屉改模式与余额，改完结果页即时重算）
      </div>

      <h3 id="hs-63-1">6.3.1 规则与时段是挂载关系，不是包含关系</h3>
      <ul class="doc-ul">
        <li><strong>一条规则可挂多条时段</strong>——「两轮审核 + 兜底到晚班再通班」配一次，早班、中班、晚班都能用。</li>
        <li><strong>一条时段只挂一条规则</strong>——要两种领法就拆两条时段，不在一处堆条件。</li>
        <li><strong>时段可以不挂规则</strong>——不对外发布的时段（兜底承接用的通班）不配规则，只被兜底序列引用。</li>
      </ul>

      <h3 id="hs-63-2">6.3.2 模式与轮</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">模式</th><th style="width: 210px;">要配什么</th><th style="width: 220px;">页面表现</th><th>校验</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>系统直派</strong></td>
            <td>人群 + 指派依据（轮转 / 缺口 / 指名）</td>
            <td>没有申领入口，移动端只收通知</td>
            <td>无轮，不可配份额与截止</td>
          </tr>
          <tr>
            <td><strong>公布即抢</strong></td>
            <td>1 轮：人群 + 开放时刻 + 领取上限</td>
            <td>移动端申领即成功，没有「待审」</td>
            <td>不可配截止；必须过时间不交叉</td>
          </tr>
          <tr>
            <td><strong>申领审核</strong></td>
            <td>1..N 轮：人群 + 开放 + 截止 + 审核口径（综合分权重）</td>
            <td>申领后是「待审」，显示截止时间与口径</td>
            <td>权重合计必须 100；截止必须晚于开放</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>错峰怎么配：</strong>不是加机制，是<strong>多轮、各有各的开放时刻</strong>。
        「本店非全发布即可见 → 非全推拿师 3 天前 → 全职推拿师 1 天前」就是三条轮，前面的轮开着不会被后面的轮关掉。
      </div>

      <h3 id="hs-63-3">6.3.3 余额与兜底</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">余额去向</th><th style="width: 260px;">要配什么</th><th>触发</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>再开一轮</strong></td><td>新轮的开放与截止（同一套锚点）+ 候选池=该人群零结果者</td><td>上一轮结算完成即触发</td></tr>
          <tr><td><strong>兜底序列</strong></td><td>本容器内的时段，<strong>有序</strong>排列，逐档吃当天剩余名额</td><td>全部轮结算后执行一次</td></tr>
          <tr><td><strong>不管</strong></td><td>无</td><td>不产生动作，结果页记落空</td></tr>
        </tbody>
      </table>
      <div class="note warn-note">
        <strong>四条不可越过的边界：</strong>
        ① 兜底只吃<strong>已有时段</strong>的剩余名额，不新建时段；
        ② 每档都要过时间不交叉，重叠就跳过进下一档；
        ③ 不突破时段名额上限；
        ④ 必选档不能用先到先得，也不能兜成留空。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'hs-63', label: '6.3 获取规则' },
  { id: 'hs-63-1', label: '6.3.1 挂载关系' },
  { id: 'hs-63-2', label: '6.3.2 模式与轮' },
  { id: 'hs-63-3', label: '6.3.3 余额与兜底' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事中心', to: '/docs/hr-schedule' },
  { label: '六、功能详细说明', to: '/docs/hr-schedule/features' },
  { label: '6.3 获取规则' }
]
</script>

<style scoped src="./doc-base.css"></style>
