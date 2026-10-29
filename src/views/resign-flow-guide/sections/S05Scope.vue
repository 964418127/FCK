<template>
  <DocShell
    :toc-items="tocItems"
    title="五、需求范围"
    subtitle="离职场景只做四件事：承接发起 → 定实际离职日期 → 状态落地 + 日期锁定 → 交付「离职事实 + 实际离职日期」"
    version="v0.3"
    date="2026-10-26"
    :breadcrumbs="breadcrumbs"
  >
    <!-- 5.1 做什么 / 不做什么 -->
    <div id="rf-scope-51" class="section">
      <div class="section-header">
        <h2>五、需求范围</h2>
        <DocCopyButton section-id="rf-scope" />
      </div>

      <div class="note lead-note">
        <strong>一句话定位：</strong>离职场景只做四件事 —— 承接发起 → 离职需求审核定实际离职日期 → 状态落地 + 日期锁定 → 交付「离职事实 + 实际离职日期」。其余各域按规则自行消费。
      </div>

      <h3>5.1 做什么 / 不做什么</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 90px;">归属</th>
            <th style="width: 200px;">内容</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>我们做</strong></td>
            <td>承接发起、审核、定实际离职日期、状态落地、日期锁定</td>
            <td>两个入口（主动离职 / 异常监控解除用工）统一落地为「离职事实 + 实际离职日期」</td>
          </tr>
          <tr>
            <td><strong>我们做</strong></td>
            <td><strong>离职交接的配置与推进</strong></td>
            <td>按岗位配置<strong>离职流程模板</strong>（平铺节点 + 前置节点编排 + 门禁），发起时快照生成清单，负责人逐节点确认；<strong>交接全部办结后自动推送离职合同</strong>。我们只承载确认与留痕，<strong>不判断交接动作实际做没做</strong>（见 6.1）</td>
          </tr>
          <tr>
            <td><strong>我们做</strong></td>
            <td>剩余资产<strong>可见</strong>、款出口<strong>选择</strong>、补偿金<strong>记录</strong>；5 日<strong>冻结</strong>常乐豆余额</td>
            <td>只取数、呈现、留痕；唯一的主动动作是 5 日<strong>冻结余额</strong>（锁住准确值，防被提走 / 被重复取用）。不结算、不折算、不清零</td>
          </tr>
          <tr>
            <td><strong>我们不做</strong></td>
            <td>交接动作本身（客户资料移交、物品归还、账号回收等）</td>
            <td>在系统外完成，系统只记录「谁确认了、何时、说明了什么、附了什么」；也不做通用流程引擎 / 统一待办中心，编排只到「节点 + 前置节点」一层（并行 / 汇合 / 分叉都由前置表达，不做自由画布）</td>
          </tr>
          <tr>
            <td><strong>我们不做</strong></td>
            <td>假勤额度结存 / 是否超休</td>
            <td>假勤系统自己出结果</td>
          </tr>
          <tr>
            <td><strong>我们不做</strong></td>
            <td>抵扣 / 清零 / 扣缴 / 计税</td>
            <td>薪酬按自己的规则计算，我们不下发金额</td>
          </tr>
          <tr>
            <td><strong>我们不做</strong></td>
            <td>社保公积金欠款结算</td>
            <td>员工福利侧处理</td>
          </tr>
          <tr>
            <td><strong>本次不做</strong></td>
            <td>合同续签</td>
            <td>属于<strong>人员异动</strong>（合同层面续 / 改 / 止），不产生离职事实；现有系统列表里的该 Tab 不复刻（见 6.3.7）</td>
          </tr>
          <tr>
            <td><strong>分阶段</strong></td>
            <td>总部员工的异常监控</td>
            <td>异常来源是<strong>考勤</strong>，依赖<strong>【假勤】</strong>的需求；数据未就绪时<strong>整块不展示</strong>。阶段一只做门店侧未出勤异常（见 6.3.1）</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 5.2 方向是单向的 -->
    <div id="rf-scope-52" class="section">
      <div class="section-header">
        <h2>5.2 方向是单向的</h2>
      </div>
      <p class="doc-p">
        不是「离职要去清算假勤」，而是<strong>假勤消费离职事实</strong>。离职场景只交付两样：<strong>离职事实 + 实际离职日期</strong>，
        然后各域按自己的规则去消费。
      </p>
      <div class="note warn-note">
        <strong>易错点（本场景曾被纠正过）：</strong>把「离职要清算假勤额度」写进来是<strong>越界</strong>。
        假勤额度怎么结、超休怎么扣，都是假勤与薪酬各自的规则，不属于离职场景的待决事项。
      </div>
    </div>

    <!-- 5.3 全链路总览 -->
    <div id="rf-chain" class="section">
      <div class="section-header">
        <h2>5.3 全链路总览：一次离职，从发起到入账</h2>
      </div>
      <p class="doc-p">
        下面这条链路把<strong>三类岗位</strong>放到同一条时间轴上 —— 前几步因岗位而异（发起、审核、按岗位交接），从「实际离职日期」这个锚点往后，
        三类人走的是同一条路，<strong>钱到账后还有最后一步：财务人工计提科目</strong>。每个方框是一个动作，左侧标<strong>这一步由谁做</strong>。
      </p>
      <ChainOverview />
      <div class="note lead-note">
        <strong>一句话记住位置：</strong>岗位差异只在前四步（谁能发起、审核链是谁、按哪套模板交接、合同何时推送）；
        实际离职日期在<strong>离职需求审核确认时锁定</strong>（排班取消与接单截断随之生效），锚点一旦落下，
        三类岗位就并到同一条结算、发放与计提链路上 —— 后面再谈「推拿师怎么算、总部怎么算」，只有金额不同，没有流程不同。
      </div>
    </div>

    <!-- 5.4 资产流向与税务归集 -->
    <div id="rf-moneyflow" class="section">
      <div class="section-header">
        <h2>5.4 资产流向与税务归集</h2>
        <DocCopyButton section-id="rf-moneyflow" />
      </div>
      <p class="doc-p">
        5.3 讲的是<strong>谁在什么时候做什么</strong>；这一节接着讲<strong>这笔钱最后落到哪个科目</strong>。
        本节<strong>没有对应页面</strong> —— 出口在审核页与解除确认页选（见 6.3.4），单据与计算在发放策略里配（见 6.5）。
      </p>

      <div class="note lead-note">
        <strong>一句话：</strong>同一笔钱，<strong>计算时的归属</strong>与<strong>报税时的归属</strong>是两件事。
        计算归属回答「谁算这个数」，报税归属回答「这笔钱进哪个个税申报科目、怎么计税」。
        离职侧要保证的是<strong>协商结果（含出口）被完整记录</strong>，落表由薪酬 / 财税按规则执行。
      </div>

      <h4 class="h4sub">两个申报科目：关键差异</h4>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 230px;">个税申报科目</th>
            <th style="width: 260px;">申报备注（原文）</th>
            <th>适用款项</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>解除劳动合同一次性补偿金</strong></td>
            <td><code>【解除劳动合同一次性补偿金】</code></td>
            <td>走「一次性补偿金」出口的款项：离职补偿金（协商类）＋ 常乐豆若选此出口</td>
          </tr>
          <tr>
            <td><strong>工资薪金</strong></td>
            <td><code>【工资薪金】</code></td>
            <td>当月工资；常乐豆若选「并入薪金」</td>
          </tr>
        </tbody>
      </table>

      <h4 class="h4sub">资产流向图：从计算归属 → 出口 → 报税归属 → 计提</h4>
      <div class="mn-flow">
        <!-- 三笔钱：来源 · 计算归属 · 出口 -->
        <div class="mn-row3">
          <div class="mn-card">
            <div class="mn-card-t">当月工资</div>
            <ul class="mn-list">
              <li>计算归属：<b>薪酬</b></li>
              <li>服务 / 订单事实数据，算法同在职</li>
              <li>出口：<b>固定 · 走薪金</b></li>
            </ul>
          </div>
          <div class="mn-card">
            <div class="mn-card-t">常乐豆余额 <span class="mn-chip">5 日冻结后</span></div>
            <ul class="mn-list">
              <li>计算归属：<b>人事协商结果</b></li>
              <li>处理金额与个税归属均由协商确定</li>
              <li>出口：<b>协商确定 · 二选一</b></li>
            </ul>
          </div>
          <div class="mn-card dark">
            <div class="mn-card-t">离职补偿金 <span class="mn-chip ghost">协商类 · 人工录入</span></div>
            <ul class="mn-list">
              <li>计算归属：<b>人事手输</b></li>
              <li>上限 = 月均 ×（N+1）（N+1 即唯一上限）</li>
              <li>出口：<b>固定 · 走补偿金</b></li>
            </ul>
          </div>
        </div>
        <div class="mn-arrows cols3"><span>↓</span><span>↓</span><span>↓</span></div>

        <!-- 归集规则横幅 -->
        <div class="mn-banner">
          <b>按申报科目归集 —— 一个科目 → 一张单 → 一次申报 → 一笔付款</b>
          <span class="mn-banner-sub">同科目不拆、跨科目不并（并了申报与到账就对不上）；最多 2 张单 / 2 次申报 / 2 笔付款</span>
        </div>
        <div class="mn-arrows single"><span>↓</span></div>

        <!-- 单据与申报科目 -->
        <div class="mn-label">单据与个税申报科目</div>
        <div class="mn-row2">
          <div class="mn-card plain">
            <div class="mn-card-t">工资单</div>
            <div class="mn-card-sub">当月工资 ＋ 常乐豆若走「并入薪金」</div>
            <div class="mn-tax salary">【工资薪金】<span>申报备注原文</span></div>
          </div>
          <div class="mn-card plain">
            <div class="mn-card-t">补偿金单</div>
            <div class="mn-card-sub">离职补偿金 ＋ 常乐豆若走「一次性补偿金」</div>
            <div class="mn-tax comp">【解除劳动合同一次性补偿金】<span>申报备注原文</span></div>
          </div>
        </div>
        <div class="mn-arrows single"><span>↓</span></div>

        <!-- 收口横幅：财务人工计提 -->
        <div class="mn-banner final">
          <b>最后一步 · 财务人工计提科目（资金流到此收口）</b>
          <span class="mn-banner-sub">补偿金单由财务按【解除劳动合同一次性补偿金】科目人工计提，与申报科目一致；不随发薪自动产生，工资部分随工资计提</span>
        </div>
      </div>

      <h4 class="h4sub">几张单、几次个税申报</h4>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 190px;">情形</th>
            <th style="width: 175px;">工资单</th>
            <th style="width: 175px;">补偿金单</th>
            <th>个税申报</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>有一次性补偿</strong><br />（离职补偿金 &gt; 0，或常乐豆协商走补偿金出口）</td>
            <td>1 张<br /><span class="tf-sub">工资 ＋ 常乐豆若走薪金</span></td>
            <td>1 张<br /><span class="tf-sub">离职补偿金 ＋ 常乐豆若走补偿金</span></td>
            <td><strong>2 次</strong>：工资薪金申报 ＋ 一次性补偿金申报</td>
          </tr>
          <tr>
            <td><strong>无一次性补偿</strong><br />（离职补偿金 = 0 且常乐豆走薪金或为 0）</td>
            <td>1 张</td>
            <td>0 张（不产生）</td>
            <td><strong>1 次</strong>：仅工资薪金申报</td>
          </tr>
        </tbody>
      </table>

      <div class="note">
        <strong>口径说明：</strong>上表的「张数」是<strong>按个税申报科目归集</strong>得出的结论 ——
        离职这一批款项最多落进 <strong>2 个申报科目</strong>，因此最多 <strong>2 张单 / 2 次申报 / 2 笔付款</strong>。
        一个科目 → 一张单 → 一次申报 → 一笔付款，<strong>同科目不拆、跨科目不并</strong>；不随人数或月份累加。
        实际发薪是否与工资同批、是否另起一次发放，由薪酬侧的发薪批次安排决定，本场景不参与（见附录待决）。
      </div>
    </div>

    <!-- 5.5 检查 Agent 运行结构 -->
    <div id="rf-agent" class="section">
      <div class="section-header">
        <h2>5.5 系统检查 · 检查 Agent 运行结构</h2>
      </div>
      <p class="doc-p">
        系统检查的判定<strong>不写死在交接流程代码里</strong>：流程侧只做薄字典，条件管理、运行调度、取数与判定都在<strong>检查 Agent</strong> 侧，
        交接流程节点只采纳它的批次结果。其中<strong>两层频率</strong>要分清：<strong>Agent 运行节奏</strong>（多久盘查一轮）由 Agent 自己配置；
        <strong>取数频率</strong>（流程多久取一次结果值）配在模板节点上。
      </p>
      <DocFigure :src="agentFlowImg" title="系统检查 · 检查 Agent 运行结构" note="两层频率 / 批次反馈报文 / Agent 执行日志溯源" default-open />
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'
import DocFigure from '../../../docs/components/DocFigure.vue'
import ChainOverview from './parts/ChainOverview.vue'
import agentFlowImg from '../../../docs/assets/diagrams/system-check-agent.svg'

const tocItems = [
  { id: 'rf-scope-51', label: '5.1 做什么 / 不做什么' },
  { id: 'rf-scope-52', label: '5.2 方向是单向的' },
  { id: 'rf-chain', label: '5.3 全链路总览' },
  { id: 'rf-moneyflow', label: '5.4 资产流向与税务归集' },
  { id: 'rf-agent', label: '5.5 检查 Agent 运行结构' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '离职流程', to: '/docs/resign-flow' },
  { label: '五、需求范围' }
]
</script>

<style scoped src="./doc-base.css"></style>
<style scoped src="./flow-parts.css"></style>

<style scoped>
.lead-note {
  background: hsl(var(--primary) / 0.05);
  border-left: 3px solid hsl(var(--primary));
  margin-bottom: 16px;
}
.warn-note {
  background: hsl(0 65% 50% / 0.06);
  border-left: 3px solid hsl(0 65% 50%);
}
</style>
