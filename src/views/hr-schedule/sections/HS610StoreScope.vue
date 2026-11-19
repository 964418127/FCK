<template>
  <DocShell
    :toc-items="tocItems"
    title="6.10 移除门店权限（支持非全合作）"
    subtitle="客户经理不使用门店权限：可见与可操作的门店一律取挂店范围——合作关系跟着挂店走，不走授权"
    version="v5.4"
    date="2026-11-19"
    :breadcrumbs="breadcrumbs"
  >
    <div id="hs-610" class="section">
      <div class="section-header">
        <h2>6.10 移除门店权限（支持非全合作）</h2>
        <DocCopyButton section-id="hs-610" />
      </div>
      <div class="note lead-note">
        <strong>一句话定位：</strong>客户经理（非全）<strong>不使用门店权限</strong>——凡是按人取门店清单的地方，一律取<strong>挂店范围</strong>；门店权限管的是系统能力授权，客户经理的门店可见性跟着挂店合作关系走。
      </div>
    </div>

    <div id="hs-610-scope" class="section">
      <div class="section-header">
        <h3>6.10.1 挂店范围：改造口径</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">维度</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>挂店范围是什么</strong></td><td>这个人挂靠合作、当前有效的门店集合；与门店签约、不与商圈签约（见《非全客户经理》6.5 硬约束）</td></tr>
          <tr><td><strong>范围怎么来</strong></td><td>挂店申请提交 → 审核批准 → 生效进入范围；申请审核在<strong>挂店申请管理</strong>，退出走<strong>挂店管理</strong>（含自下线）</td></tr>
          <tr><td><strong>与门店权限的差别</strong></td><td>门店权限是<strong>授权关系</strong>（谁给谁开了哪些店）；挂店范围是<strong>合作关系</strong>（人实际挂靠哪些店）——客户经理的门店取数不再读权限表</td></tr>
          <tr><td><strong>范围变化即生效</strong></td><td>挂店批准 / 退出后，各取数处下一次打开就是新范围，不做存量清理</td></tr>
        </tbody>
      </table>
    </div>

    <div id="hs-610-impact" class="section">
      <div class="section-header">
        <h3>6.10.2 影响范围（盘查清单）</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">影响面</th><th>改造口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>排班排假</strong></td><td>取<strong>挂店范围</strong>内的门店；客户经理在排班侧看到的门店不再读门店权限</td></tr>
          <tr><td><strong>门店订单</strong></td><td>取<strong>挂店范围</strong>内的门店</td></tr>
          <tr><td><strong>工作台门店</strong></td><td>取<strong>挂店范围</strong>内的门店</td></tr>
          <tr><td><strong>门店权限</strong></td><td>客户经理<strong>不使用门店权限</strong>，取<strong>挂店范围</strong>内的门店；权限模块本身不动（详见 6.10.3）</td></tr>
          <tr><td><strong>可选任务</strong></td><td>按门店筛选的候选池只出<strong>挂店范围</strong>内有任务的店；任务门店须为本人挂店，档位外照样看不到</td></tr>
          <tr><td><strong>打卡</strong></td><td>顶部门店切换的门店取自<strong>当前选中任务</strong>，任务门店须在挂店范围内；不做权限校验</td></tr>
          <tr><td><strong>薪酬看板</strong></td><td>门店切换只出<strong>挂店范围</strong>内有收入记录的门店</td></tr>
          <tr><td><strong>请假 / 事件报备</strong></td><td>发生在已排班次的门店上，班次本身就在挂店范围内，不涉及权限判断</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>盘查口径：</strong>前四条是业务给定的改造面；可选任务、打卡、薪酬看板、请假报备是按「凡按人取门店清单的地方」盘查原型补充的——判断标准只有一条：<strong>这个模块给客户经理列门店时，数据从哪张关系来</strong>。挂店范围只替换取数来源，各模块自身的筛选与展示逻辑不变。
      </div>
    </div>

    <div id="hs-610-boundary" class="section">
      <div class="section-header">
        <h3>6.10.3 边界</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">边界</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>门店权限模块不动</strong></td><td>其他角色（全职、店长等）照旧走门店权限；本改造只摘出客户经理这一类人的取数来源</td></tr>
          <tr><td><strong>只换来源不改逻辑</strong></td><td>各影响面原有的筛选、排序、展示逻辑不变；变化的只是「门店清单从哪来」</td></tr>
          <tr><td><strong>挂店退出即失效</strong></td><td>挂店自下线 / 移出后，该门店立即不在范围内；已产生的任务与记录按各自模块的既有规则处理，不在本章展开</td></tr>
        </tbody>
      </table>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'hs-610', label: '6.10 移除门店权限' },
  { id: 'hs-610-scope', label: '6.10.1 挂店范围：改造口径' },
  { id: 'hs-610-impact', label: '6.10.2 影响范围（盘查清单）' },
  { id: 'hs-610-boundary', label: '6.10.3 边界' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事中心', to: '/docs/hr-schedule' },
  { label: '六、功能详细说明', to: '/docs/hr-schedule/features' },
  { label: '6.10 移除门店权限' }
]
</script>

<style scoped src="./doc-base.css"></style>
