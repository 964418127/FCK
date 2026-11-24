<template>
  <DocShell
    :toc-items="tocItems"
    title="八、未来扩展：多岗位接入的关键升级"
    subtitle="缺口判定两段式与按人群登记 · 推拿师 4 小时阈值 · 客户经理关联调班 · 推拿师审核两条待定路线——已讨论待细化，不进本期范围"
    version="v3.0 基线 + v5 重构"
    date="2026-11-24"
    :breadcrumbs="breadcrumbs"
  >
    <div id="hs-fu-why" class="section">
      <div class="section-header">
        <h2>8.1 这一章记什么</h2>
      </div>
      <p class="doc-p">
        排班策略在配置侧是<strong>通用设计</strong>：时段、清单、缺口规则都不区分岗位，谁进来都能配。
        但上线节奏是分批的——<strong>非全客户经理 → 全职（推拿师与客户经理）→ 非全推拿师</strong>，
        每个岗位的合作形式进来，都可能把缺口这一段按岗位再梳理一遍。
        这一章登记各批接入时要做的<strong>关键升级</strong>：方向已讨论、口径未细化，先集中记在这里；
        细化完成后再挪进对应功能章节（判定进 6.4.4，执行进 6.4.5，获取进 6.2），并同步原型。
      </p>
      <div class="note">
        <strong>为什么单独成章：</strong>这些内容动的都是缺口判定与获取审核的核心口径，直接改 6.2 / 6.4 会让现行章节写满「将来时」；
        集中登记让现行章节保持「本期怎么做」的干净口径，也让多岗位接入的待办有唯一的对账处。
      </div>
    </div>

    <div id="hs-fu-two-stage" class="section">
      <div class="section-header">
        <h2>8.2 缺口判定的两段式与按人群登记（框架）</h2>
      </div>
      <p class="doc-p">
        现行 6.4 已经定了单套口径（30 分钟门槛 + G0–G3 + 寻人顶段）。多岗位接入时，缺口这一段收敛成<strong>两段式</strong>，
        差异全部落在「按人群登记」上——岗位 × 合作形式进来，动作就是两个填空，不改架构：
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">段</th><th style="width: 320px;">答什么</th><th>按人群登记什么</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>第一段 · 求值（判定）</strong></td>
            <td>缺不缺、缺多少、补不补。事件写进来先定<strong>缺口归属</strong>：按时段清单的<strong>第 1 优先级档位</strong>判定这是哪个岗位 × 合作形式的缺口，再按该人群登记的缺口规则判一遍</td>
            <td>判定参数：剩余不足 X 小时不补（通用默认 2.5 小时，全日制推拿师 4 小时——同族规则不同参数值）；G0–G3 仍是那一套</td>
          </tr>
          <tr>
            <td><strong>第二段 · 执行（补位）</strong></td>
            <td>判定答了「要补」，按补位策略执行怎么补</td>
            <td>补位策略：通用寻人顶段（人群档位顺位 + 有效班次时段复核）<strong>/</strong> 关联调班（见 8.3）；都执行不了 → 摆缺口、人事定人（兜底，不分岗位）</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>两条既有口径在两段式里的位置：</strong>① 请假 / 报备未超 30 分钟不触发缺口判定——这是<strong>进不进判定的门槛</strong>（全局底线），不随人群变，不做成人群参数；
        ② 「剩余 = 被事件拿走的那段时长」的定义沿用不动。<br>
        <strong>多档位时段：</strong>清单里有多档人群时，缺口归属按第 1 优先级档位判；<strong>补人寻人仍按全清单顺位</strong>，兜底档位照样能被找到顶班——归属归第 1 档，补人不限于第 1 档。整班缺口（离职 / 取消挂店）走同一套归属。
      </div>
    </div>

    <div id="hs-fu-masseur-4h" class="section">
      <div class="section-header">
        <h2>8.3 全日制推拿师：剩余超 4 小时才补</h2>
      </div>
      <p class="doc-p">
        业务补充口径：全日制推拿师请假后，<strong>剩余时长超过 4 小时才执行补人</strong>（不超过 4 小时不补）。
        落在两段式的判定段——与「剩余不足 2.5 小时不补」同族，参数值 X = 4，按人群登记；补位执行不变（通用寻人顶段）。
      </p>
      <div class="note">
        <strong>待细化：</strong>① 4 小时是否像 2.5 小时（30 分钟通勤 + 2 小时补位班次）那样写明构成；
        ② 阈值按现行定义「剩余 = 被拿走的那段时长」执行，若业务本意是「缺口发生到班次结束」需在细化时翻案并同步 6.4.4 的定义。
      </div>
    </div>

    <div id="hs-fu-cm-swap" class="section">
      <div class="section-header">
        <h2>8.4 全职客户经理：关联调班</h2>
      </div>
      <p class="doc-p">
        业务补充口径：门店有 2 名及以上全职客户经理时，有人请假<strong>不走「找外人顶」</strong>，而是剩下的人调班——
        各自的原班次被覆盖（无需履约）、重新派发：
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 240px;">门店在岗</th><th>发生请假时</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>3 人</strong>（早 / 中 / 晚三班）</td><td>1 人请假 → 剩 2 人重新派发「长早班」「长晚班」</td></tr>
          <tr><td><strong>2 人</strong>（已调过一轮）</td><td>再有人请假 → 剩 1 人调成通班</td></tr>
          <tr><td><strong>1 人</strong>（或只剩 1 人）</td><td>没人可调，退回通用补人路径（缺口规则 + 寻人顶段 / 摆缺口）</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>机制定位：</strong>这是现行「班次变形」动作的<strong>定向回归</strong>（5.5 曾定「现行按缺口类型自动处理的动作不带入」，客户经理是例外），
        且与现行全职客户经理「轮转直派、余额生成通班」同源——等于把「余额生成通班」从<strong>轮间</strong>（下一轮生成时算）挪到<strong>轮内实时</strong>（请假当下就调）。
        两段式里落在执行段：补位策略的第二个值。
      </div>
      <div class="note">
        <strong>待细化：</strong>① 长早班 / 长晚班 / 通班的具体时段拼法（业务给班形梯度）；
        ② 通班超出 8 小时的工时口径（是否记加班，联动 6.8）；
        ③ 调班要不要剩余的人同意（他们班被拉长，牵 6.4.6 通知与让位的受损方向口径）；
        ④ 非全客户经理确认不适用（走事件报备 + 通用缺口规则）。
      </div>
    </div>

    <div id="hs-fu-masseur-review" class="section">
      <div class="section-header">
        <h2>8.5 全日制推拿师：审核的两条待定路线</h2>
      </div>
      <p class="doc-p">
        现行口径（见 6.2）：申领 + 综合分截断，一轮一次审核，落选周五再抢、通班兜底。
        讨论过两条优化路线，方向未定，先登记路线名；两条都会动 6.2 的轮与获取节奏模型，细化前不动 6.2 正文。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 300px;">路线</th><th>方向</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>① 排班节奏结束前多段审核</strong></td><td>获取窗口内分多段结算：每段结束审一次，没排满再开下一段——从「一轮一审」变成「窗口内多次审核」</td></tr>
          <tr><td><strong>② 让优秀的人先看看班次</strong></td><td>按综合分让靠前的人先看到班次 / 先申领，审核排序前置到看班环节</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>待补：</strong>两条路线的原始讨论细节未归档，本节按讨论表述登记路线名；细化时先补原话与取舍（动了哪段的节奏、审核排不排、落选怎么办），
        再决定挪进 6.2 的哪一节。
      </div>
    </div>

    <div id="hs-fu-checklist" class="section">
      <div class="section-header">
        <h2>8.6 接入动作清单</h2>
      </div>
      <p class="doc-p">
        每一批岗位接入时，按两段式对号入座；表里的「登记」都是配置动作，不动架构、不动已上线岗位的时段与配置。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 200px;">接入批次</th><th style="width: 260px;">判定段登记</th><th style="width: 220px;">执行段登记</th><th>其他</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>非全客户经理</strong>（已落地）</td><td>通用默认（30 分钟门槛 + 剩余不足 2.5 小时不补）</td><td>通用寻人顶段</td><td>移动端事件报备入口（6.5.1）</td></tr>
          <tr><td><strong>全职客户经理</strong></td><td>通用默认</td><td>关联调班（见 8.4）</td><td>班形梯度、工时口径待细化</td></tr>
          <tr><td><strong>全职推拿师</strong></td><td>剩余不足 4 小时不补（见 8.3）</td><td>通用寻人顶段</td><td>审核两条待定路线（见 8.5）</td></tr>
          <tr><td><strong>非全推拿师</strong></td><td>通用默认</td><td>通用寻人顶段</td><td>—</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>细化完成的挪法：</strong>判定口径进 6.4.4（规则表加人群维度）、执行口径进 6.4.5（补位策略分派）、审核节奏进 6.2；
        挪完本节对应条目标「已并入」并留指路。原型同步随细化进度走，不提前铺。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'

const tocItems = [
  { id: 'hs-fu-why', label: '8.1 这一章记什么' },
  { id: 'hs-fu-two-stage', label: '8.2 两段式与按人群登记' },
  { id: 'hs-fu-masseur-4h', label: '8.3 推拿师剩余超 4 小时才补' },
  { id: 'hs-fu-cm-swap', label: '8.4 客户经理关联调班' },
  { id: 'hs-fu-masseur-review', label: '8.5 推拿师审核两条待定路线' },
  { id: 'hs-fu-checklist', label: '8.6 接入动作清单' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事中心', to: '/docs/hr-schedule' },
  { label: '八、未来扩展：多岗位接入的关键升级' }
]
</script>

<style scoped src="./doc-base.css"></style>
