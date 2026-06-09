<template>
      <div id="payroll" class="section">
        <h2>八、工资条组装</h2>
        <div class="card" style="background: hsl(var(--primary) / 0.08); border: 1px solid hsl(var(--primary) / 0.3);">
          <div style="font-size: 13px; line-height: 1.8;">
            <strong>说明：</strong>本节展示的工资条数量和分配方式为典型示例，<strong>实际系统支持灵活配置任意数量工资条、任意薪酬项分配方式</strong>，业务方可根据用工类型、岗位特点、合规要求等自由组合。
          </div>
        </div>

        <div class="card">
          <h3>核心原则</h3>
          <ul class="feature-list">
            <li>工资条按<strong>发放主体</strong>分组生成：全职=合同主体（1个），非全日制/兼职=业绩归属主体（可能多个，1 门店 = 1 主体）</li>
            <li>每个发放主体独立结算、独立生成工资条</li>
            <li>所有薪酬项和系统项都会计算出值</li>
            <li>业务侧通过工资单配置，决定哪些项进入哪个工资条</li>
            <li>无论怎么分配，所有工资条应发之和 = 员工总净工资</li>
            <li>系统项（社保/公积金/个税）按月计算，按工资条分配</li>
            <li><strong>预扣个税</strong>可在多个工资条中出现，每个工资条各自计算</li>
            <li><strong>代扣个税（汇算）</strong>只能出现在<strong>1 个工资条</strong>中：作为<strong>当月最后一条工资条</strong>的一个扣缴/收入项（补缴/退税），<strong>不单独生成"汇算工资条"</strong></li>
            <li><strong>负工资抵扣</strong>每个工资条都可能触发（应发 &gt; 0 且存在负工资余额时）</li>
          </ul>
        </div>

        <!-- 全职工资条 -->
        <div class="card">
          <h3>全职工资条（每月）</h3>
          <p>每月计算1次（示例），每次生成N个工资条（示例：3个）：</p>
          <table class="data-table">
            <thead>
              <tr><th>工资条</th><th>包含薪酬项</th><th>说明</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>工资条1（计件工资条）</td>
                <td>计件提成 + 投诉扣款(部分) + 代扣社保(部分)</td>
                <td>系统项按比例分配</td>
              </tr>
              <tr>
                <td>工资条2（奖金工资条）</td>
                <td>超产值奖金 + 超时加班费 + 投诉扣款(部分) + 代扣公积金(部分)</td>
                <td>系统项按比例分配</td>
              </tr>
              <tr>
                <td>工资条3（常乐豆工资条）</td>
                <td>保底获豆 + 代扣个税 + <strong>【公积金个人扣款】</strong>（公积金个人部分常乐豆不足时）</td>
                <td>代扣个税由百旺服务计算；【公积金个人扣款】为常乐豆<strong>仅抵扣公积金</strong>（公司/个人部分）后仍不足时的固定名称补扣项</td>
              </tr>
            </tbody>
          </table>
          <div class="note" style="background: hsl(var(--muted) / 0.3);">
            <strong>说明：</strong>以上3个工资条为典型示例配置，<strong>实际工资单可灵活配置任意数量工资条、任意薪酬项分配方式</strong>。
          </div>
          <div class="note">
            <strong>验证：</strong>5000 + 1843 + 0 = 6843（总净工资）✅<br/>
            <strong>常乐豆抵扣范围：</strong>常乐豆<strong>只抵扣公积金</strong>（公司/个人部分），<strong>不抵扣社保/商业险</strong>。当常乐豆余额不足以抵扣<strong>公积金个人部分</strong>时，从对应工资单<strong>现金</strong>部分扣减，扣款项固定名称为【<strong>公积金个人扣款</strong>】（仅全职场景）<br/>
            <strong>离职常乐豆：</strong>全职员工离职时，该合同主体名下的常乐豆余额全部提现
          </div>
        </div>

        <!-- 返聘工资条 -->
        <div class="card">
          <h3>返聘工资条（每月）</h3>
          <p>退休返聘人员不享有常乐豆、不交社保、不交公积金，但<strong>商业险必选</strong>（公司全额现金承担，不进员工工资条）。每月计算1次，生成N个工资条（示例：1个）：</p>
          <table class="data-table">
            <thead>
              <tr><th>工资条</th><th>包含薪酬项</th><th>说明</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>工资条（综合）</td>
                <td>计件提成 + 超时加班费 + 投诉扣款 + 代扣个税</td>
                <td><strong>无【公积金个人扣款】</strong>——返聘无常乐豆 + 无公积金个人部分，<strong>无任何触发场景</strong>；商业险公司部分由公司全额现金承担，不进员工工资条</td>
              </tr>
            </tbody>
          </table>
          <div class="note" style="background: hsl(var(--muted) / 0.3);">
            <strong>说明：</strong>返聘工资单结构最简，<strong>实际可灵活配置任意数量工资条</strong>。返聘场景下无任何【公积金个人扣款】触发（无常乐豆 + 无公积金个人部分）；商业险公司部分<strong>100% 公司全额承担</strong>，不进员工工资条。
          </div>
        </div>

        <!-- 非全日制/兼职工资条 -->
        <div class="card">
          <h3>非全日制/兼职工资条（每周）</h3>
          <p>每周计算1次（示例），每个主体生成N个工资条（示例：1个）：</p>
          <table class="data-table">
            <thead>
              <tr><th>工资条</th><th>包含薪酬项</th><th>说明</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>周工资条（普通）</td>
                <td>计件提成 + 超时加班费 + 投诉扣款 + 预扣个税</td>
                <td>每个主体每周生成</td>
              </tr>
              <tr>
                <td>最后一周工资条（月末）</td>
                <td>计件提成 + 超时加班费 + 投诉扣款 + 预扣个税 + <strong>个税补缴 或 个税退税</strong>（汇算结果）</td>
                <td>
                  月末百旺汇算后，汇算结果作为<strong>最后一条工资条的一个扣缴/收入项</strong>出现<br/>
                  补缴 = 实际税额 - 已预扣合计（&gt;0 生成补缴）<br/>
                  退税 = 已预扣合计 - 实际税额（&lt;0 生成退税）<br/>
                  <strong>不单独生成"汇算工资条"</strong>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="note" style="background: hsl(var(--muted) / 0.3);">
            <strong>说明：</strong>结算周期和工资条数量为典型示例，<strong>实际可灵活配置任意结算周期（日/周/旬/月）、任意数量工资条</strong>。个税汇算结果<strong>始终归属于当月最后一条工资条</strong>，不单独生成汇算工资条。
          </div>
        </div>

        <div class="card">
          <h3>负工资抵扣示例（负数累加，无个税抵扣）</h3>
          <p><strong>场景：</strong>某员工存在负工资余额 -500，收入项合计800，投诉扣款1000：</p>
          <table class="data-table">
            <thead>
              <tr><th>项目</th><th>金额</th></tr>
            </thead>
            <tbody>
              <tr><td>收入项合计</td><td>+800</td></tr>
              <tr><td>投诉扣款</td><td>-1000</td></tr>
              <tr><td>代扣社保（全职）</td><td>-200</td></tr>
              <tr><td>代扣公积金（全职）</td><td>-200</td></tr>
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
            <li>代扣社保：-200</li>
            <li>代扣公积金：-200</li>
            <li>代扣个税：<strong>0</strong>（无应税收入，不扣）</li>
            <li>负工资抵扣：<strong>0</strong></li>
            <li><strong>应发：-600</strong>（负数累计，负工资余额增加500→1100）</li>
          </ul>
          <div class="note">
            <strong>说明：</strong>当扣完收入、扣缴项、社保、公积金后累计为负数时：①不再扣个税（无应税收入）；②无法抵扣负工资；③负数累加到负工资余额中。
          </div>
        </div>

        <div class="card">
          <h3>多主体工资条示例（兼职）</h3>
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
                <td>计件+加班+预扣个税 + <strong>个税补缴</strong>（门店A 倒序申报补缴，作为本条工资条的一项）</td>
                <td>+5900 - 177 - 1128</td>
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
                <td>计件+加班+预扣个税 + <strong>个税补缴</strong>（门店B 倒序申报补缴，作为本条工资条的一项，可能跳档）</td>
                <td>+3600 - 108 - 822</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>发放规则：</strong>每个发放主体（全职=合同主体，非全日制/兼职=业绩归属主体，1 门店 = 1 主体）下的工资分别发放。周薪制要求两笔工资间隔≤15天。<br/>
            <strong>汇算规则：</strong>个税汇算结果（补缴/退税）<strong>作为每门店最后一条工资条的一个扣缴/收入项</strong>出现，不单独生成"汇算工资条"。
          </div>
        </div>

        <!-- 动态项在工资条上的位置速查 -->
        <div class="card" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary));">
          <h3>动态项在工资条上的位置速查</h3>
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
                <td><strong>【公积金个人扣款】</strong></td>
                <td>仅<strong>全职</strong>工资条3（常乐豆工资条）<br/><em>返聘：无此动态项（无常乐豆 + 无公积金个人部分）</em></td>
                <td>常乐豆<strong>只抵扣公积金</strong>，不足以抵扣<strong>公积金个人部分</strong>时触发<br/>（社保/商业险公司部分由公司全额现金承担，<strong>不触发此动态项</strong>）</td>
              </tr>
              <tr>
                <td><strong>个税补缴</strong></td>
                <td>非全日制/兼职 / 多主体：<strong>每主体当月最后一条工资条</strong></td>
                <td>月末百旺汇算：实际税额 &gt; 已预扣合计</td>
              </tr>
              <tr>
                <td><strong>个税退税</strong></td>
                <td>非全日制/兼职 / 多主体：<strong>每主体当月最后一条工资条</strong></td>
                <td>月末百旺汇算：实际税额 &lt; 已预扣合计</td>
              </tr>
              <tr>
                <td><strong>负工资抵扣</strong></td>
                <td><strong>任意可触发的工资条</strong>（可叠加多条）</td>
                <td>工资条<strong>应发 &gt; 0</strong> 且员工存在<strong>负工资余额</strong>时触发</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>核心原则：</strong>动态项<strong>不固定配置在模板中</strong>，是业务执行/计算流转过程中按条件产生的扣缴/收入项。<strong>不参与应税收入计算</strong>。
          </div>
        </div>
</template>
