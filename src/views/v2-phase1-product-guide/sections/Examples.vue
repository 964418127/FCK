<template>
      <div id="examples" class="section">
        <h2>七、计算示例</h2>
        <div class="card" style="background: hsl(var(--primary) / 0.08); border: 1px solid hsl(var(--primary) / 0.3);">
          <div style="font-size: 13px; line-height: 1.8;">
            <strong>说明：</strong>以下示例中的薪酬项、金额、计算结果、工资条数量、门店数等均<strong>为典型业务场景下的示例</strong>，用于演示计算逻辑。实际业务中，<strong>所有数字、项数、分配方式均可灵活配置</strong>。<br/>
            <strong>v2-1 特别说明：</strong>示例中的"代扣社保"、"代扣公积金"金额<strong>由老系统接口读取</strong>，本文档以"代扣社保 = X"形式表达，<strong>不代表本系统自己计算</strong>。
          </div>
        </div>

        <!-- 全职示例 A -->
        <div class="card">
          <h3>全职示例 A：常乐豆<strong>充足</strong> → 公司部分完全被常乐豆抵扣，个人部分员工自付（含负工资抵扣）</h3>
          <div class="example">
            <p><strong>员工当月数据：</strong></p>
            <table class="data-table">
              <thead>
                <tr><th>项目</th><th>金额</th><th>说明</th></tr>
              </thead>
              <tbody>
                <tr><td>计件提成</td><td>+6000</td><td>第1级收入</td></tr>
                <tr><td>超产值奖金</td><td>+2000</td><td>第1级收入</td></tr>
                <tr><td>超时加班费</td><td>+500</td><td>第1级收入</td></tr>
                <tr><td>投诉扣款</td><td>-200</td><td>第1级扣缴</td></tr>
                <tr><td>保底获豆</td><td>+0</td><td>第2级收入（第1级已超最低工资）</td></tr>
                <tr><td>公积金<strong>公司部分</strong>（老系统记账）</td><td>1200</td><td><strong>老系统记账</strong>，<strong>不进员工工资条</strong>；本期<strong>由常乐豆完全抵扣</strong></td></tr>
                <tr><td>公积金<strong>个人部分</strong>（老系统接口）</td><td>600</td><td><strong>老系统接口读取</strong>；<strong>员工足额自付</strong>，工资条保留「代扣公积金」扣减项，<strong>与常乐豆无关</strong></td></tr>
                <tr><td>代扣社保（老系统接口）</td><td>-800</td><td><strong>老系统接口读取</strong>，个人部分，<strong>不在常乐豆抵扣范围</strong></td></tr>
                <tr><td>代扣个税</td><td>-57</td><td>百旺按 8300 计算</td></tr>
                <tr><td><strong>常乐豆余额</strong></td><td><strong>2000</strong></td><td><strong>只用于抵扣公积金公司部分</strong>，本期<strong>充足</strong>（抵完 1200 后剩余 800 可消费/提现）</td></tr>
                <tr><td>负工资余额</td><td>-2000</td><td>历史欠款</td></tr>
              </tbody>
            </table>
            <p><strong>应税收入：</strong>8500 - 投诉扣款(200) = <strong>8300</strong>（社保/公积金/常乐豆<strong>均不参与应税收入</strong>）</p>
            <p><strong>常乐豆使用（v2-1 简化：1 步）：</strong></p>
            <ul class="calc-steps">
              <li>① 抵公积金<strong>公司部分</strong> 1200（老系统记账金额，<strong>不进员工工资条</strong>）→ 2000 - 1200 = <strong>剩余 800</strong></li>
              <li>② 公积金<strong>个人部分</strong> 600 <strong>不参与常乐豆抵扣</strong>，由员工<strong>足额自付</strong>（工资条上「代扣公积金」照常扣 600）</li>
              <li>③ 剩余常乐豆 800 → 进入<strong>消费</strong>环节</li>
            </ul>
            <p><strong>N 个工资条完整组成（示例：3个，发放主体=合同主体）：</strong></p>
            <table class="data-table">
              <thead>
                <tr><th>工资条</th><th>收入项</th><th>扣缴项</th><th>动态项</th><th>应发</th><th>实发</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>工资条1（计件）</td>
                  <td>计件提成 +6000</td>
                  <td>投诉扣款 -200；代扣社保 -800</td>
                  <td>负工资抵扣 -2000（应发 &gt; 0 触发）</td>
                  <td>+3000</td>
                  <td><strong>3000</strong></td>
                </tr>
                <tr>
                  <td>工资条2（奖金）</td>
                  <td>超产值奖金 +2000；超时加班费 +500</td>
                  <td>代扣公积金 <strong>-600</strong>（员工足额自付）</td>
                  <td>—（<strong>公司部分由常乐豆抵完，不进工资条</strong>）</td>
                  <td>+1900</td>
                  <td><strong>1900</strong></td>
                </tr>
                <tr>
                  <td>工资条3（个税）</td>
                  <td>保底获豆 +0</td>
                  <td>代扣个税 -57</td>
                  <td>—</td>
                  <td>-57（应发 &lt; 0，负数累加）</td>
                  <td><strong>0</strong></td>
                </tr>
                <tr>
                  <td colspan="4"><strong>合计</strong></td>
                  <td colspan="2"><strong>实发 4900，剩余负工资余额 57</strong></td>
                </tr>
              </tbody>
            </table>
            <div class="note">
              <strong>说明：</strong>① 系统项（社保/公积金/个税）按月一次计算，按工资单配置分配到 N 个工资条（示例：3个）；<strong>社保/公积金金额来自老系统接口</strong>；② <strong>常乐豆只抵公积金公司部分</strong>（不进工资条），<strong>公积金个人部分由员工足额自付</strong>，工资条保留「代扣公积金」600（与常乐豆无关）；③ v2-1 阶段<strong>【公积金个人扣款】动态项已取消</strong>；④ 负工资抵扣是触发式动态项；⑤ 应发 &lt; 0 时负数累加到下次负工资余额；⑥ <strong>商业险不显示</strong>（默认机制下不进工资条）。
            </div>
          </div>
        </div>

        <!-- 全职示例 B -->
        <div class="card">
          <h3>全职示例 B：常乐豆<strong>不足</strong> → 公司部分由公司现金补足，个人部分员工自付（含负工资抵扣）</h3>
          <div class="example">
            <p><strong>员工当月数据：</strong></p>
            <table class="data-table">
              <thead>
                <tr><th>项目</th><th>金额</th><th>说明</th></tr>
              </thead>
              <tbody>
                <tr><td>计件提成</td><td>+1000</td><td>第1级收入（本月业绩差）</td></tr>
                <tr><td>超时加班费</td><td>+0</td><td>第1级收入</td></tr>
                <tr><td>投诉扣款</td><td>-3000</td><td>第1级扣缴（大额扣款）</td></tr>
                <tr><td>保底获豆</td><td>+7000</td><td>第2级收入（最低工资8000 - 第1级1000）</td></tr>
                <tr><td>公积金<strong>公司部分</strong>（老系统记账）</td><td>1000</td><td><strong>老系统记账</strong>，<strong>不进员工工资条</strong>；本期<strong>常乐豆仅抵 300</strong>，剩余 700 由<strong>公司现金补足</strong></td></tr>
                <tr><td>公积金<strong>个人部分</strong>（老系统接口）</td><td>600</td><td><strong>老系统接口读取</strong>；<strong>员工足额自付</strong>，工资条保留「代扣公积金」扣减项，<strong>与常乐豆无关</strong></td></tr>
                <tr><td>代扣社保（老系统接口）</td><td>-800</td><td><strong>老系统接口读取</strong>，个人部分，<strong>不在常乐豆抵扣范围</strong></td></tr>
                <tr><td>代扣个税</td><td>-90</td><td>百旺按 5000 计算</td></tr>
                <tr><td><strong>常乐豆余额</strong></td><td><strong>300</strong></td><td><strong>只用于抵扣公积金公司部分</strong>，本期<strong>不足</strong>（公司部分 1000 仅抵 300）</td></tr>
                <tr><td>负工资余额</td><td>-500</td><td>历史欠款</td></tr>
              </tbody>
            </table>
            <p><strong>应税收入：</strong>(1000+7000) - 投诉扣款(3000) = <strong>5000</strong></p>
            <p><strong>常乐豆使用（v2-1 简化：1 步，公司部分不足时公司现金补足）：</strong></p>
            <ul class="calc-steps">
              <li>① 抵公积金<strong>公司部分</strong> 1000（老系统记账金额）→ 常乐豆 300 <strong>全部消耗</strong>，仅抵 300</li>
              <li>② 公司部分剩余 700 → 由<strong>公司现金补足</strong>（不进入员工工资条）</li>
              <li>③ 公积金<strong>个人部分</strong> 600 <strong>不参与常乐豆抵扣</strong>，由员工<strong>足额自付</strong>（工资条上「代扣公积金」照常扣 600）</li>
              <li>④ 常乐豆已用完，不进入消费环节</li>
            </ul>
            <p><strong>N 个工资条完整组成（示例：3个，发放主体=合同主体）：</strong></p>
            <table class="data-table">
              <thead>
                <tr><th>工资条</th><th>收入项</th><th>扣缴项</th><th>动态项</th><th>应发</th><th>实发</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>工资条1（计件）</td>
                  <td>计件提成 +1000</td>
                  <td>投诉扣款 -3000；代扣社保 -800</td>
                  <td>—（应税收入 ≤ 0，无个税）</td>
                  <td>-2800</td>
                  <td><strong>0</strong></td>
                </tr>
                <tr>
                  <td>工资条2（奖金）</td>
                  <td>超时加班费 +0</td>
                  <td>代扣公积金 <strong>-600</strong>（员工足额自付）</td>
                  <td>—（<strong>公司部分差额 700 由公司现金补足，不进工资条</strong>）</td>
                  <td>-600</td>
                  <td><strong>0</strong></td>
                </tr>
                <tr>
                  <td>工资条3（保底+个税）</td>
                  <td>保底获豆 +7000</td>
                  <td>代扣个税 -90</td>
                  <td>负工资抵扣 -3900（按可抵扣最大值）</td>
                  <td>+3010</td>
                  <td><strong>3010</strong></td>
                </tr>
                <tr>
                  <td colspan="4"><strong>合计</strong></td>
                  <td colspan="2"><strong>实发 3010，剩余负工资余额 0</strong></td>
                </tr>
              </tbody>
            </table>
            <div class="note">
              <strong>说明：</strong>① 应税收入 ≤ 0 时无个税；② 应发 ≤ 0 的工资条负数计入"待抵扣总额"；③ <strong>常乐豆只抵公司部分</strong>，不足时由<strong>公司现金补足</strong>（不进入员工工资条）；<strong>个人部分 600 由员工足额自付</strong>，体现在工资条 2 的「代扣公积金 -600」扣缴项里；④ v2-1 阶段<strong>【公积金个人扣款】动态项已取消</strong>；⑤ 工资条3 应发 &gt; 0 时按"可抵扣最大值"一次性扣除；⑥ 抵扣后剩余负工资 0；⑦ <strong>总实发</strong>与旧规则相同（3010），但工资条结构更清晰——公积金扣减全部走"代扣公积金"扣缴项。
            </div>
          </div>
        </div>

        <!-- 非全日制示例 -->
        <div class="card">
          <h3>非全日制示例：N 周工资条（示例：4周），最后一周含汇算补缴（单主体）</h3>
          <div class="example">
            <p><strong>员工当月 N 周数据（示例：4周，单主体=1 个门店）：</strong></p>
            <table class="data-table">
              <thead>
                <tr><th>周次</th><th>计件提成</th><th>超时加班费</th><th>投诉扣款</th><th>预扣个税（3%）</th></tr>
              </thead>
              <tbody>
                <tr><td>第1周</td><td>+5000</td><td>+300</td><td>-100</td><td>(5000+300-100)×3%=156</td></tr>
                <tr><td>第2周</td><td>+4500</td><td>+400</td><td>0</td><td>(4500+400-0)×3%=147</td></tr>
                <tr><td>第3周</td><td>+6000</td><td>+500</td><td>-200</td><td>(6000+500-200)×3%=189</td></tr>
                <tr><td>第4周</td><td>+5500</td><td>+400</td><td>0</td><td>(5500+400-0)×3%=177</td></tr>
                <tr><td colspan="2"><strong>当月合计</strong></td><td colspan="2">应税收入 <strong>22300</strong></td><td>已预扣合计 <strong>669</strong></td></tr>
              </tbody>
            </table>
            <p><strong>月末汇算：</strong>百旺实际税额 = <strong>900</strong>，补缴 = 900 - 669 = <strong>231</strong>（&gt;0，生成个税补缴）</p>
            <p><strong>每周工资条完整组成（发放主体=各业绩归属主体，1 门店 = 1 主体）：</strong></p>
            <table class="data-table">
              <thead>
                <tr><th>工资条</th><th>收入项</th><th>扣缴项</th><th>应发</th><th>实发</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>周工资条1</td>
                  <td>计件提成 +5000；超时加班费 +300</td>
                  <td>投诉扣款 -100；预扣个税 -156</td>
                  <td>+5044</td>
                  <td><strong>5044</strong></td>
                </tr>
                <tr>
                  <td>周工资条2</td>
                  <td>计件提成 +4500；超时加班费 +400</td>
                  <td>预扣个税 -147</td>
                  <td>+4753</td>
                  <td><strong>4753</strong></td>
                </tr>
                <tr>
                  <td>周工资条3</td>
                  <td>计件提成 +6000；超时加班费 +500</td>
                  <td>投诉扣款 -200；预扣个税 -189</td>
                  <td>+6111</td>
                  <td><strong>6111</strong></td>
                </tr>
                <tr>
                  <td>周工资条4（含汇算）</td>
                  <td>计件提成 +5500；超时加班费 +400</td>
                  <td>预扣个税 -177；个税补缴 -231（百旺汇算结果）</td>
                  <td>+5492</td>
                  <td><strong>5492</strong></td>
                </tr>
                <tr>
                  <td colspan="3"><strong>当月合计</strong></td>
                  <td colspan="2"><strong>实发 21400</strong></td>
                </tr>
              </tbody>
            </table>
            <div class="note">
              <strong>说明：</strong>① 每周工资条各自计算预扣个税（应税收入 × 3%）；② 月末百旺算出实际税额后，"个税补缴/退税"作为<strong>最后一个工资条</strong>的一个扣缴项出现（不单独生成汇算工资条）；③ 汇算补缴直接从最后一周实发里扣，不累积为负工资余额；④ <strong>无社保/无公积金代扣项</strong>（公司全额承担，由老系统单独记账）；⑤ <strong>商业险不显示</strong>。
            </div>
          </div>
        </div>

        <!-- 兼职示例：多主体倒序申报 -->
        <div class="card">
          <h3>兼职示例：多主体倒序申报（1 门店 = 1 主体），每主体最后一周含汇算补缴</h3>
          <div class="example">
            <p><strong>员工当月在 N 个主体（门店）的数据（示例：2个，1 门店 = 1 主体）：</strong></p>
            <table class="data-table">
              <thead>
                <tr><th>主体（门店）</th><th>周次</th><th>应税收入</th><th>预扣个税</th></tr>
              </thead>
              <tbody>
                <tr><td rowspan="4">门店A</td><td>第1周</td><td>+5300</td><td>159</td></tr>
                <tr><td>第2周</td><td>+4900</td><td>147</td></tr>
                <tr><td>第3周</td><td>+6300</td><td>189</td></tr>
                <tr><td>第4周</td><td>+5900</td><td>177</td></tr>
                <tr><td colspan="2">门店A 小计</td><td>+22400</td><td>672</td></tr>
                <tr><td rowspan="4">门店B</td><td>第1周</td><td>+3000</td><td>90</td></tr>
                <tr><td>第2周</td><td>+2800</td><td>84</td></tr>
                <tr><td>第3周</td><td>+3200</td><td>96</td></tr>
                <tr><td>第4周</td><td>+3600</td><td>108</td></tr>
                <tr><td colspan="2">门店B 小计</td><td>+12600</td><td>378</td></tr>
              </tbody>
            </table>
            <p><strong>申报顺序（倒序，应税金额大的先报，每主体 1 次调用百旺，可能跳档）：</strong></p>
            <ul class="calc-steps">
              <li>门店A（应税 22400）先申报 → 百旺调用 1 次，传入应税 <strong>22400</strong>（截至门店A 的累计）→ 返回 累计应纳个税 <strong>1800</strong> → 门店A 补缴 = 1800 - 672 = <strong>1128</strong></li>
              <li>门店B（应税 12600）后申报 → 百旺调用 1 次，传入应税 <strong>35000</strong>（= 22400 + 12600 累计至门店B）→ 返回 累计应纳个税 <strong>3000</strong>（A+B 累计）→ 门店B 补缴 = 3000 - 1800 - 378 = <strong>822</strong></li>
            </ul>
            <p><strong>每主体（门店）每周工资条完整组成（发放主体=各自主体）：</strong></p>
            <table class="data-table">
              <thead>
                <tr><th>门店</th><th>工资条</th><th>收入项</th><th>扣缴项</th><th>应发</th><th>实发</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td rowspan="4">门店A</td>
                  <td>周工资条1</td>
                  <td>计件提成 +5000；加班 +300</td>
                  <td>投诉扣款 -100；预扣个税 -159</td>
                  <td>+5041</td>
                  <td><strong>5041</strong></td>
                </tr>
                <tr>
                  <td>周工资条2</td>
                  <td>计件提成 +4500；加班 +400</td>
                  <td>预扣个税 -147</td>
                  <td>+4753</td>
                  <td><strong>4753</strong></td>
                </tr>
                <tr>
                  <td>周工资条3</td>
                  <td>计件提成 +6000；加班 +300</td>
                  <td>投诉扣款 -100；预扣个税 -189</td>
                  <td>+6011</td>
                  <td><strong>6011</strong></td>
                </tr>
                <tr>
                  <td>周工资条4（含汇算）</td>
                  <td>计件提成 +5500；加班 +400</td>
                  <td>预扣个税 -177；个税补缴 -1128（门店A 倒序申报补缴）</td>
                  <td>+4595</td>
                  <td><strong>4595</strong></td>
                </tr>
                <tr>
                  <td colspan="3">门店A 小计</td>
                  <td colspan="2"><strong>实发 20400</strong></td>
                </tr>
                <tr>
                  <td rowspan="4">门店B</td>
                  <td>周工资条1</td>
                  <td>计件提成 +3000；加班 +0</td>
                  <td>预扣个税 -90</td>
                  <td>+2910</td>
                  <td><strong>2910</strong></td>
                </tr>
                <tr>
                  <td>周工资条2</td>
                  <td>计件提成 +2800；加班 +0</td>
                  <td>预扣个税 -84</td>
                  <td>+2716</td>
                  <td><strong>2716</strong></td>
                </tr>
                <tr>
                  <td>周工资条3</td>
                  <td>计件提成 +3200；加班 +0</td>
                  <td>预扣个税 -96</td>
                  <td>+3104</td>
                  <td><strong>3104</strong></td>
                </tr>
                <tr>
                  <td>周工资条4（含汇算）</td>
                  <td>计件提成 +3600；加班 +0</td>
                  <td>预扣个税 -108；个税补缴 -822（门店B 倒序申报补缴）</td>
                  <td>+2670</td>
                  <td><strong>2670</strong></td>
                </tr>
                <tr>
                  <td colspan="3">门店B 小计</td>
                  <td colspan="2"><strong>实发 11400</strong></td>
                </tr>
                <tr>
                  <td colspan="3"><strong>当月总计（N 个主体合计，示例：2个）</strong></td>
                  <td colspan="2"><strong>实发 31800</strong></td>
                </tr>
              </tbody>
            </table>
            <div class="note">
              <strong>说明：</strong>① <strong>1 个门店 = 1 个主体</strong>，多主体（多门店）下每主体独立生成 N 个周工资条（示例：4个），最后一周含汇算补缴；② 申报顺序按主体应税金额倒序（应税大者先报），每主体<strong>调用百旺 1 次</strong>，传入"截至本主体"的累计应税收入（实现累进税逐级累加），可能跳档；③ 汇算补缴作为每主体最后一个工资条的扣缴项出现（不单独生成汇算工资条）；④ 每主体的补缴从该主体最后一周实发里扣，不累积为负工资余额；⑤ 同一员工在不同主体的工资独立发放、互不抵扣；⑥ <strong>无社保/无公积金代扣项</strong>（兼职无社保/公积金）；⑦ <strong>商业险不显示</strong>。
            </div>
          </div>
        </div>

        <!-- 返聘示例 -->
        <div class="card">
          <h3>返聘示例：单月 1 个工资条（无社保/无公积金/无常乐豆/商业险默认机制）</h3>
          <div class="example">
            <p><strong>员工当月数据：</strong></p>
            <table class="data-table">
              <thead>
                <tr><th>项目</th><th>金额</th><th>说明</th></tr>
              </thead>
              <tbody>
                <tr><td>计件提成</td><td>+4000</td><td>第1级收入</td></tr>
                <tr><td>超时加班费</td><td>+200</td><td>第1级收入</td></tr>
                <tr><td>投诉扣款</td><td>-50</td><td>第1级扣缴</td></tr>
                <tr><td>代扣个税</td><td>-30</td><td>百旺按 4150 计算</td></tr>
                <tr><td>负工资余额</td><td>0</td><td>无历史欠款</td></tr>
              </tbody>
            </table>
            <p><strong>应税收入：</strong>(4000+200) - 50 = <strong>4150</strong>（无社保/无公积金/无商业险显示）</p>
            <p><strong>1 个工资条完整组成（发放主体=劳务合作主体，N=1）：</strong></p>
            <table class="data-table">
              <thead>
                <tr><th>工资条</th><th>收入项</th><th>扣缴项</th><th>动态项</th><th>应发</th><th>实发</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>工资条（综合）</td>
                  <td>计件提成 +4000；超时加班费 +200</td>
                  <td>投诉扣款 -50；代扣个税 -30</td>
                  <td>—（无社保/无公积金/无常乐豆）</td>
                  <td>+4120</td>
                  <td><strong>4120</strong></td>
                </tr>
                <tr>
                  <td colspan="4"><strong>合计</strong></td>
                  <td colspan="2"><strong>实发 4120</strong></td>
                </tr>
              </tbody>
            </table>
            <div class="note">
              <strong>说明：</strong>① 返聘<strong>无社保/无公积金/无常乐豆</strong>，工资条结构最简；② <strong>商业险采用默认机制</strong>，<strong>不进员工工资条</strong>，由老系统/财务单独记账；③ 本例无负工资余额，无负工资抵扣；④ <strong>无个税补缴/退税</strong>（返聘无周薪，无预扣环节）。
            </div>
          </div>
        </div>
      </div>

</template>
