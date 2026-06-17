<template>
  <DocShell
    :toc-items="tocItems"
    title="八、工资条组装"
    subtitle='按主体分组的工资条结构与组装示例'
    version="v2.1-phase1"
    date="2026-06-06"
    :breadcrumbs="breadcrumbs"
  >
    <div id="payroll" class="section">
      <h2>八、工资条组装</h2>
        <div class="card" style="background: hsl(var(--primary) / 0.08); border: 1px solid hsl(var(--primary) / 0.3);">
          <div style="font-size: 13px; line-height: 1.8;">
            <strong>说明：</strong>本节展示的工资条数量和分配方式为典型示例，<strong>实际系统支持灵活配置任意数量工资条、任意薪酬项分配方式</strong>，业务方可根据用工类型、岗位特点、合规要求等自由组合。
          </div>
        </div>

        <div class="card">
          <h3 id="payroll-1">核心原则</h3>
          <ul class="feature-list">
            <li>工资条按<strong>发放主体</strong>分组生成：全职/返聘=合同主体（1个），非全日制/兼职=业绩归属主体（可能多个，1 门店 = 1 主体）</li>
            <li>每个发放主体独立结算、独立生成工资条</li>
            <li>所有薪酬项和系统项都会计算出值（社保/公积金<strong>从老系统接口读取</strong>）</li>
            <li>业务侧通过工资单配置，决定哪些项进入哪个工资条</li>
            <li>无论怎么分配，所有工资条应发之和 = 员工总净工资</li>
            <li>系统项（社保/公积金/个税）按月计算，按工资条分配</li>
            <li><strong>预扣个税</strong>可在多个工资条中出现（最后一条工资条<strong>不显示【个税预扣】</strong>，最后一周的预扣内部计算但不计入扣缴项）</li>
            <li><strong>代扣个税（汇算）</strong>只能出现在<strong>1 个工资条</strong>中：作为<strong>当月最后一条工资条</strong>的一个扣缴项（百旺实际税），配套同条工资条的<strong>【预扣合计】（收入项，=前 N-1 周已扣预扣合计"加回"）</strong>，<strong>不单独生成"汇算工资条"</strong></li>
            <li><strong>负工资抵扣</strong>每个工资条都可能触发（应发 &gt; 0 且存在负工资余额时）</li>
          </ul>
        </div>

        <!-- 全职工资条 -->
        <div class="card">
          <h3 id="payroll-2">全职工资条（每月）</h3>
          <p>每月计算1次（示例），每次生成N个工资条（示例：3个）：</p>
          <table class="data-table">
            <thead>
              <tr><th>工资条</th><th>包含薪酬项</th><th>说明</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>工资条1（计件工资条）</td>
                <td>计件提成 + <strong>激励补贴</strong>（常乐豆代缴公积金个人部分的名义收入，<strong>仅全职</strong>） + 投诉扣款(部分) + 代扣社保(部分，<strong>老系统读取</strong>)</td>
                <td>系统项按比例分配；<strong>「激励补贴」默认进第 1 个工资条</strong>，便于与「代扣公积金」在同一工资条中体现</td>
              </tr>
              <tr>
                <td>工资条2（奖金工资条）</td>
                <td>超产值奖金 + 超时加班费 + 投诉扣款(部分) + 代扣公积金(部分，<strong>老系统读取</strong>)</td>
                <td>系统项按比例分配</td>
              </tr>
              <tr>
                <td>工资条3（保底+个税）</td>
                <td>保底获豆 + 代扣个税 + 代扣公积金（<strong>个人部分</strong>，老系统读取）</td>
                <td>代扣个税由百旺服务计算；代扣公积金为员工<strong>个人部分</strong>，由员工<strong>足额自付</strong>，<strong>与常乐豆无关</strong></td>
              </tr>
            </tbody>
          </table>
          <div class="note" style="background: hsl(var(--muted) / 0.3);">
            <strong>说明：</strong>以上3个工资条为典型示例配置，<strong>实际工资单可灵活配置任意数量工资条、任意薪酬项分配方式</strong>。
          </div>
          <div class="note">
            <strong>验证：</strong>5000 + 1843 + 0 = 6843（总净工资）✅<br/>
            <strong>常乐豆抵扣范围：</strong>常乐豆<strong>优先抵扣公积金公司部分</strong>（<strong>公司部分由老系统记账</strong>，<strong>不进员工工资条</strong>）；<strong>剩余可继续抵扣公积金个人部分</strong>（不足部分由<strong>员工现金补差</strong>，<strong>不修改</strong>工资条上「代扣公积金」显示金额）。<strong>不抵扣社保/商业险</strong>。<br/>
            <strong>「激励补贴」项（仅全职）：</strong>当常乐豆代缴了部分个人公积金时，公司<strong>以「激励补贴」名义</strong>在<strong>第 1 个工资条</strong>增加等额收入，<strong>计入应税收入</strong>——保持工资条净到手与员工实收一致<br/>
            <strong>商业险：</strong>暂不进入系统（线下购买，成本归公司），<strong>不进工资条</strong>，<strong>不显示</strong><br/>
            <strong>离职常乐豆：</strong>全职员工离职时，该合同主体名下的常乐豆余额全部提现
          </div>
        </div>

        <!-- 返聘工资条 -->
        <div class="card">
          <h3 id="payroll-3">返聘工资条（每月）</h3>
          <p>退休返聘人员不享有常乐豆、不交社保、不交公积金、<strong>商业险暂不进入系统（线下购买）（不进工资条）</strong>。每月计算1次，生成N个工资条（示例：1个）：</p>
          <table class="data-table">
            <thead>
              <tr><th>工资条</th><th>包含薪酬项</th><th>说明</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>工资条（综合）</td>
                <td>计件提成 + 超时加班费 + 投诉扣款 + 代扣个税</td>
                <td>返聘<strong>无常乐豆</strong>，<strong>无公积金代扣</strong>（<strong>无个人部分</strong>，达到退休年龄不再缴纳）；商业险<strong>暂不进入系统（不显示）</strong></td>
              </tr>
            </tbody>
          </table>
          <div class="note" style="background: hsl(var(--muted) / 0.3);">
            <strong>说明：</strong>返聘工资单结构最简，<strong>实际可灵活配置任意数量工资条</strong>。返聘场景下<strong>无常乐豆</strong>、<strong>无公积金代扣</strong>（达到退休年龄不再缴纳）；商业险<strong>暂不进入系统（不进工资条）</strong>。
          </div>
        </div>

        <!-- 非全日制/兼职工资条 -->
        <div class="card">
          <h3 id="payroll-4">非全日制/兼职工资条（每周）</h3>
          <p>每周计算1次（示例），每个主体生成N个工资条（示例：1个）：</p>
          <table class="data-table">
            <thead>
              <tr><th>工资条</th><th>包含薪酬项</th><th>说明</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>周工资条（普通）</td>
                <td>计件提成 + 超时加班费 + 投诉扣款 + 预扣个税</td>
                <td>每个主体每周生成；<strong>无社保/无公积金代扣项</strong>（公司全额承担，由老系统单独记账）</td>
              </tr>
              <tr>
                <td>最后一周工资条（月末）</td>
                <td>计件提成 + 超时加班费 + 投诉扣款 + <strong>预扣合计</strong>（收入项，=前 N-1 周已扣预扣合计"加回"） + <strong>代扣个税</strong>（扣缴项，=百旺实际税）</td>
                <td>
                  月末百旺汇算后，<strong>最后一条工资条不再显示【个税预扣】</strong>（最后一周的预扣内部计算但不计入扣缴项，避免与【代扣个税】重复扣减），改显示<strong>【预扣合计】（收入项，"加回"前 N-1 周已预扣的个税）+【代扣个税】（扣缴项，实际税）</strong><br/>
                  <strong>不单独生成"汇算工资条"</strong>；<strong>商业险不显示</strong>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="note" style="background: hsl(var(--muted) / 0.3);">
            <strong>说明：</strong>结算周期和工资条数量为典型示例，<strong>实际可灵活配置任意结算周期（日/周/旬/月）、任意数量工资条</strong>。个税汇算结果<strong>始终归属于当月最后一条工资条</strong>，不单独生成汇算工资条。商业险<strong>暂不进入系统（不显示）</strong>。
          </div>
        </div>

        <div class="card">
          <h3 id="payroll-5">负工资抵扣示例（负数累加，无个税抵扣）</h3>
          <p><strong>场景：</strong>某员工存在负工资余额 -500，收入项合计800，投诉扣款1000：</p>
          <table class="data-table">
            <thead>
              <tr><th>项目</th><th>金额</th></tr>
            </thead>
            <tbody>
              <tr><td>收入项合计</td><td>+800</td></tr>
              <tr><td>投诉扣款</td><td>-1000</td></tr>
              <tr><td>代扣社保（全职，<strong>老系统接口</strong>）</td><td>-200</td></tr>
              <tr><td>代扣公积金（全职，<strong>老系统接口</strong>）</td><td>-200</td></tr>
              <tr><td>负工资余额</td><td>-500</td></tr>
            </tbody>
          </table>
          <p><strong>计算顺序：</strong></p>
          <ul class="calc-steps">
            <li>应税收入 = 800 - 1000 = <strong>-200</strong>（≤ 0，无应税收入）</li>
            <li>应税收入 ≤ 0，<strong>不交个税</strong></li>
            <li>工资条应发 = 800 - 1000 - 200 - 200 = <strong>-600</strong></li>
            <li>应发 ≤ 0，<strong>不抵扣负工资</strong></li>
          </ul>
          <p><strong>实际抵扣后工资条：</strong></p>
          <ul>
            <li>收入：+800</li>
            <li>投诉扣款：-1000</li>
            <li>代扣社保（老系统接口）：-200</li>
            <li>代扣公积金（老系统接口）：-200</li>
            <li>代扣个税：<strong>0</strong>（无应税收入，不扣）</li>
            <li>负工资抵扣：<strong>0</strong></li>
            <li><strong>应发：-600</strong>（负数累计，负工资余额增加500→1100）</li>
          </ul>
          <div class="note">
            <strong>说明：</strong>当扣完收入、扣缴项、社保、公积金后累计为负数时：①不再扣个税（无应税收入）；②无法抵扣负工资；③负数累加到负工资余额中。
          </div>
        </div>

        <div class="card">
          <h3 id="payroll-6">多主体工资条示例（兼职）</h3>
          <p><strong>员工当月在M个门店的数据（示例：2个）：</strong></p>
          <p>每个门店独立结算，生成各自的工资条：</p>
          <table class="data-table">
            <thead>
              <tr><th>门店</th><th>工资条</th><th>包含项</th><th>金额</th></tr>
            </thead>
            <tbody>
              <tr>
                <td rowspan="4">门店A</td>
                <td>周工资条1</td>
                <td>计件+加班+预扣个税</td>
                <td>+5300 - 156</td>
              </tr>
              <tr>
                <td>周工资条2</td>
                <td>计件+加班+预扣个税</td>
                <td>+4900 - 147</td>
              </tr>
              <tr>
                <td>周工资条3</td>
                <td>计件+加班+预扣个税</td>
                <td>+6300 - 189</td>
              </tr>
              <tr>
                <td>周工资条4（含汇算）</td>
                <td>计件+加班+<strong>预扣合计</strong>（收入项，=门店A 前 N-1 周已扣预扣合计） + <strong>代扣个税</strong>（扣缴项，=百旺实际税）</td>
                <td>+5900 + 495 - 1800</td>
              </tr>
              <tr>
                <td rowspan="4">门店B</td>
                <td>周工资条1</td>
                <td>计件+加班+预扣个税</td>
                <td>+3000 - 90</td>
              </tr>
              <tr>
                <td>周工资条2</td>
                <td>计件+加班+预扣个税</td>
                <td>+2800 - 84</td>
              </tr>
              <tr>
                <td>周工资条3</td>
                <td>计件+加班+预扣个税</td>
                <td>+3200 - 96</td>
              </tr>
              <tr>
                <td>周工资条4（含汇算）</td>
                <td>计件+加班+<strong>预扣合计</strong>（收入项，=门店B 前 N-1 周已扣预扣合计） + <strong>代扣个税</strong>（扣缴项，=百旺实际税）</td>
                <td>+3600 + 270 - 1200</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>发放规则：</strong>每个发放主体（全职/返聘=合同主体，非全日制/兼职=业绩归属主体，1 门店 = 1 主体）下的工资分别发放。周薪制要求两笔工资间隔≤15天。<br/>
            <strong>汇算规则（加回 + 扣实际税 模型）：</strong>每门店<strong>最后一条工资条不再显示【个税预扣】</strong>（最后一周预扣内部计算但不计入扣缴项），改为显示<strong>【预扣合计】（收入项，=该门店前 N-1 周已扣预扣合计"加回"）+【代扣个税】（扣缴项，=百旺该门店实际税）</strong>，不单独生成"汇算工资条"。<br/>
            <strong>无社保/无公积金代扣项</strong>；<strong>商业险（暂不进入系统）（不显示）</strong>。
          </div>
        </div>

        <!-- 动态项在工资条上的位置速查 -->
        <div class="card" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary));">
          <h3 id="payroll-7">动态项在工资条上的位置速查</h3>
          <p>汇总上述示例涉及的<strong>触发式动态项</strong>在工资条中出现的位置与条件（与【四·附录：动态薪酬项】对应）：</p>
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 200px;">动态项</th>
                <th>工资条上的位置</th>
                <th>触发条件</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>预扣合计</strong></td>
                <td>非全日制/兼职 / 多主体：<strong>每主体当月最后一条工资条</strong>（<strong>收入项</strong>）</td>
                <td>月末百旺汇算时生成：= 前 N-1 周已扣【个税预扣】合计（"加回"已预扣的个税，配合【代扣个税】呈现当月真实税负）</td>
              </tr>
              <tr>
                <td><strong>代扣个税</strong>（汇算实际税）</td>
                <td>非全日制/兼职 / 多主体：<strong>每主体当月最后一条工资条</strong>（<strong>扣缴项</strong>）</td>
                <td>月末百旺汇算：百旺按当月累计应税收入算出的<strong>实际税额</strong></td>
              </tr>
              <tr>
                <td><strong>负工资抵扣</strong></td>
                <td><strong>任意可触发的工资条</strong>（可叠加多条）</td>
                <td>工资条<strong>应发 &gt; 0</strong> 且员工存在<strong>负工资余额</strong>时触发</td>
              </tr>
              <tr>
                <td><strong>激励补贴</strong>（常乐豆代缴公积金个人部分的名义收入）</td>
                <td><strong>全职 / 第 1 个工资条</strong>（计件工资条）</td>
                <td>常乐豆<strong>抵完公司部分后，剩余继续抵个人部分</strong>且实际抵掉金额 &gt; 0 时触发；金额 = 常乐豆代缴个人部分金额</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>核心原则：</strong>动态项<strong>不固定配置在模板中</strong>，是业务执行/计算流转过程中按条件产生的扣缴/收入项。<strong>不参与应税收入计算</strong>（<strong>例外：激励补贴计入应税收入</strong>，作为 1 级收入项）。
          </div>
        </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../docs/components/DocShell.vue'

const tocItems = [
    { id: 'payroll-1', label: '核心原则' },
    { id: 'payroll-2', label: '全职工资条（每月）' },
    { id: 'payroll-3', label: '返聘工资条（每月）' },
    { id: 'payroll-4', label: '非全日制/兼职工资条（每周）' },
    { id: 'payroll-5', label: '负工资抵扣示例（负数累加，无个税抵扣）' },
    { id: 'payroll-6', label: '多主体工资条示例（兼职）' },
    { id: 'payroll-7', label: '动态项在工资条上的位置速查' }
  ]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '产品需求v2（阶段1）', to: '/docs/product-v2-phase1' },
  { label: '八、工资条组装' }
]
</script>
