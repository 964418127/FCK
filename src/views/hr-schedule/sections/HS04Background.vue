<template>
  <DocShell
    :toc-items="tocItems"
    title="四、需求背景"
    subtitle="四个岗位四套排法，功能并不缺；缺的是把「时段」与「谁有资格占」分成两个对象"
    version="v3.0 基线"
    date="2026-11-12"
    :breadcrumbs="breadcrumbs"
  >
    <div id="hs-bg" class="section">
      <div class="section-header">
        <h2>四、需求背景</h2>
        <DocCopyButton section-id="hs-bg" />
      </div>

      <h3 id="hs-bg-1">4.1 现在的做法：一条策略配一个岗位</h3>
      <p class="doc-p">
        现行「排班策略」用十个槽位（人群 / 范围 / 生成计划 / 班次 / 名额规则 / 承接顺位 / 优先级 / 缺口响应 / 兜底 / 工时）
        把排班配出来，四个岗位各存一条。岗位本身不是分支，只是参数取值——这层抽象是对的，问题是
        <strong>「一个时段」和「谁先占这个时段」被写进了同一条策略里</strong>。
      </p>

      <h3 id="hs-bg-2">4.2 由此产生的五个卡点</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 190px;">卡点</th><th style="width: 300px;">具体表现</th><th>为什么要改</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>时段与资格长在一起</strong></td>
            <td>同一条「早班 10:00–18:00」，A 店走审核、B 店走先到先得，要配两遍</td>
            <td>门店级差异只能靠复制策略，改一处漏一处</td>
          </tr>
          <tr>
            <td><strong>层没有时间边界</strong></td>
            <td>「周六 22:00 截止申领」配不出来——只有开放时刻，没有截止</td>
            <td>审核这件事本质上要「先收人、再定人」，没有截止就退化成先到先得</td>
          </tr>
          <tr>
            <td><strong>余额靠定时硬凑</strong></td>
            <td>第二轮申领写死「周五 00:00 再开」，与第一轮什么时候结算完无关</td>
            <td>余额应该是<strong>结算完成事件</strong>驱动的，不是星期几驱动的</td>
          </tr>
          <tr>
            <td><strong>兜底只有一个动作名</strong></td>
            <td>「生成通班」是个名字，配不出「先把晚班排完，晚班满了才兜到通班」</td>
            <td>物理容量有限，兜底必须逐档吃已有名额，不能凭空造</td>
          </tr>
          <tr>
            <td><strong>门店自建空间不足</strong></td>
            <td>门店想改班次名称（都叫早班、各地不同）、想调时段，只能整条复制</td>
            <td>名称与时间属门店，规则属总部，两者变更频率完全不同</td>
          </tr>
        </tbody>
      </table>

      <div class="note lead-note">
        <strong>结论：</strong>这不是「再补几个功能」的问题，而是<strong>对象没分对</strong>。
        时段是<strong>事实</strong>（几点到几点、几个位置），获取规则是<strong>策略</strong>（谁先、按什么、剩了怎么办）；
        两者的变更频率、归属方、复用范围都不一样，硬塞在一个对象里，任何一边变化都会拽着另一边改。
      </div>
    </div>

    <div id="hs-bg-goal" class="section">
      <div class="section-header">
        <h2>4.3 这次要解决的三件事</h2>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">目标</th><th>达成标准</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>一套时段覆盖四岗位</strong></td>
            <td>四个岗位的排班不再各配一条策略，同一批时段对象上挂不同的获取规则</td>
          </tr>
          <tr>
            <td><strong>审核能真的「截止后结算」</strong></td>
            <td>轮有开放、截止、结算三个时刻；截止前只收申领，截止后在申领人里按业绩定归属</td>
          </tr>
          <tr>
            <td><strong>余额有明确去处</strong></td>
            <td>再开一轮 / 兜底序列 / 不管，三条路都配得出来，且都遵守名额上限与时间不交叉</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>不在目标内：</strong>考勤打卡、排班结果表的结构改造、加班认定与薪酬计算。
        本期只保证「谁能占哪个时段」这件事被正确决定并写入既有结果表。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'hs-bg', label: '四、需求背景' },
  { id: 'hs-bg-1', label: '4.1 现行做法' },
  { id: 'hs-bg-2', label: '4.2 五个卡点' },
  { id: 'hs-bg-goal', label: '4.3 三个目标' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事中心', to: '/docs/hr-schedule' },
  { label: '四、需求背景' }
]
</script>

<style scoped src="./doc-base.css"></style>
