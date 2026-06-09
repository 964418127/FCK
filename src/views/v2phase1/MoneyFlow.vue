<template>
  <DocShell
    :toc-items="tocItems"
    title="十、金额流转泳道图"
    subtitle='月度结算全链路金额流转（公司 ↔ 门店 ↔ 员工）'
    version="v2.1-phase1"
    date="2026-06-06"
    :breadcrumbs="breadcrumbs"
  >
    <div id="money-flow" class="section">
      <h2>十、金额流转泳道图</h2>
        <div class="card">
          <h3 id="money-1">月度金额流转全景（v2-1）</h3>
          <div class="note" style="background: hsl(var(--warning) / 0.05); border-left: 3px solid hsl(var(--warning)); margin-bottom: 16px; font-size: 13px;">
            <strong>v2-1 变化点：</strong>社保/公积金<strong>金额从老系统接口读取</strong>（图中用<strong>橙色</strong>标注），商业险<strong>暂不进入系统（线下购买）</strong>，<strong>无员工福利保障关系建立</strong>环节。
          </div>
          <div class="swimlane-container">
            <div class="swimlane-row">
              <div class="swimlane-lane">顾客<br/>客户</div>
              <div class="swimlane-content">
                <div class="flow-step-inline primary">支付服务费用</div>
              </div>
            </div>
            <div class="swimlane-arrow">↓</div>
            <div class="swimlane-row">
              <div class="swimlane-lane">主体公司<br/>（含门店）</div>
              <div class="swimlane-content">
                <div class="flow-step-inline">收入 → 工资单系统</div>
                <div class="flow-step-inline muted">主体公司按业绩归属归集营收</div>
              </div>
            </div>
            <div class="swimlane-arrow">↓</div>
            <div class="swimlane-row">
              <div class="swimlane-lane">工资单<br/>系统</div>
              <div class="swimlane-content">
                <div class="flow-step-inline">按员工 + 主体 + 周期 创建工资单</div>
                <div class="flow-step-inline muted">匹配薪酬模板 + 发放策略</div>
                <div class="flow-step-inline">第1级 → 第2级 → <span style="color: hsl(var(--warning)); font-weight: 600;">系统项（社保/公积金从老系统接口读取）</span> → 负工资处理（条件触发）</div>
              </div>
            </div>
            <div class="swimlane-arrow">↓</div>
            <div class="swimlane-row highlight-row">
              <div class="swimlane-lane">工资条<br/>(每员工 1~N 条)</div>
              <div class="swimlane-content">
                <div class="flow-step-inline primary">→ 员工（实发 = 收入 - 扣缴 - 代扣）</div>
                <div class="flow-step-inline">→ 第三方（代扣个税，月末汇算补退）</div>
                <div class="flow-step-inline"><span style="color: hsl(var(--warning)); font-weight: 600;">→ 第三方（代扣社保/公积金，个人部分，从老系统接口读取）</span></div>
                <div class="flow-step-inline muted">→ 主体公司（公司部分社保/公积金，由老系统记账，不进员工工资条）</div>
                <div class="flow-step-inline muted">→ 第三方（商业险，<strong>暂不进入系统</strong>，由线下购买，成本归公司）</div>
                <div class="flow-step-inline muted">→ 负工资账户（应发 &gt; 0 时抵扣；应发 &lt; 0 时累加到余额）</div>
                <div class="flow-step-inline muted">→ 常乐豆账户（仅全职，保底获豆入账 / 离职提现）</div>
              </div>
            </div>
            <div class="swimlane-arrow">↓</div>
            <div class="swimlane-row split-row">
              <div class="swimlane-lane">员工 / 第三方<br/>收款方</div>
              <div class="swimlane-content split-content">
                <div class="split-item">
                  <div class="split-title">员工</div>
                  <div class="split-desc">实发工资（含现金 + 常乐豆）</div>
                </div>
                <div class="split-item">
                  <div class="split-title">税务局</div>
                  <div class="split-desc">代扣个税 + 汇算补退</div>
                </div>
                <div class="split-item">
                  <div class="split-title">社保局 / 公积金中心</div>
                  <div class="split-desc">个人部分（老系统接口） + 公司部分（老系统记账）</div>
                </div>
                <div class="split-item">
                  <div class="split-title">保险公司</div>
                  <div class="split-desc">商业险（<strong>暂不进入系统</strong>，线下购买，成本归公司）</div>
                </div>
                <div class="split-item">
                  <div class="split-title">百旺服务</div>
                  <div class="split-desc">第三方税务服务费</div>
                </div>
              </div>
            </div>
          </div>

          <div class="note">
            <strong>关键流转规则：</strong>
            <ul>
              <li>工资条上的"<strong>公司部分</strong>"（社保/公积金公司部分、商业险）<strong>不进入员工工资条</strong>，由老系统/财务单独记账</li>
              <li>工资条上的"<strong>代扣</strong>"是员工负担部分（社保/公积金个人部分<strong>从老系统接口读取</strong>，从实发中扣除）</li>
              <li><strong>代扣个税</strong>通过百旺服务计算：全职直接算当月（按月度应税收入），非全日制/兼职按累计应税收入（<strong>不含已预扣</strong>，否则会重复计税）算累计应纳 - 已预扣合计 = 补缴/退税</li>
              <li><strong>常乐豆</strong>仅全职员工有；发放 → 消费 → 离职提现，全链路不进工资条扣款</li>
              <li><strong>商业险</strong>暂不进入系统（线下购买，成本归公司），<strong>不进入员工工资条</strong>，<strong>不显示在福利明细</strong>（v2-1 不开发福利明细页）</li>
            </ul>
          </div>
        </div>

        <div class="card">
          <h3 id="money-2">典型场景：非全日制/兼职多主体月度结算（1 门店 = 1 主体）</h3>
          <div class="swimlane-container">
            <div class="swimlane-row">
              <div class="swimlane-lane">门店A</div>
              <div class="swimlane-content">
                <div class="flow-step-inline">每周计件 + 加班 - 投诉 → 预扣个税（3%×4周）</div>
                <div class="flow-step-inline muted">门店A 业绩归集 → 门店A 主体</div>
              </div>
            </div>
            <div class="swimlane-arrow">↓</div>
            <div class="swimlane-row">
              <div class="swimlane-lane">门店B</div>
              <div class="swimlane-content">
                <div class="flow-step-inline">每周计件 + 加班 → 预扣个税（3%×4周）</div>
                <div class="flow-step-inline muted">门店B 业绩归集 → 门店B 主体</div>
              </div>
            </div>
            <div class="swimlane-arrow">↓ 月末 ↓</div>
            <div class="swimlane-row highlight-row">
              <div class="swimlane-lane">百旺服务<br/>(倒序申报)</div>
              <div class="swimlane-content">
                <div class="flow-step-inline">门店A（应税 22400）先申报 → 计算应纳 1800 → 补缴 = 1800 - 672 = 1128</div>
                <div class="flow-step-inline">门店B（应税 12600）后申报 → 可能跳档 → 计算应纳 1200 → 补缴 = 1200 - 378 = 822</div>
              </div>
            </div>
            <div class="swimlane-arrow">↓</div>
            <div class="swimlane-row split-row">
              <div class="swimlane-lane">员工工资条<br/>(每门店最后一周)</div>
              <div class="swimlane-content split-content">
                <div class="split-item">
                  <div class="split-title">门店A 第4周</div>
                  <div class="split-desc">含 -177（预扣） + -1128（补缴）</div>
                </div>
                <div class="split-item">
                  <div class="split-title">门店B 第4周</div>
                  <div class="split-desc">含 -108（预扣） + -822（补缴）</div>
                </div>
              </div>
            </div>
          </div>
          <div class="note">
            <strong>说明：</strong>每门店独立结算，<strong>不抵扣</strong>；门店A 补缴从门店A 最后一周实发扣；门店B 补缴从门店B 最后一周实发扣。
          </div>
        </div>

    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../docs/components/DocShell.vue'

const tocItems = [
    { id: 'money-1', label: '月度金额流转全景（v2-1）' },
    { id: 'money-2', label: '典型场景：非全日制/兼职多主体月度结算（1 门店 = 1 主体）' }
  ]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '产品需求v2（阶段1）', to: '/docs/product-v2-phase1' },
  { label: '十、金额流转泳道图' }
]
</script>
