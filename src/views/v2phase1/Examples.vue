<template>
  <DocShell
    :toc-items="tocItems"
    title="七、计算示例"
    subtitle='全职/非全日制/兼职/返聘的典型计算场景（含常乐豆/负工资/多主体）'
    version="v2.1-phase1"
    date="2026-06-06"
    :breadcrumbs="breadcrumbs"
  >
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
          <h3 id="ex-1">全职示例 A：常乐豆<strong>充足（覆盖公司+部分个人）</strong> → 抵公司 1200，剩余抵个人 800，触发「激励补贴」800（含负工资抵扣）</h3>
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
                <tr><td>公积金<strong>公司部分</strong>（老系统记账）</td><td><strong>-1200</strong></td><td><strong>老系统记账</strong>（公司侧支出），<strong>不进员工工资条</strong>；本期<strong>由常乐豆完全抵扣</strong></td></tr>
                <tr><td>公积金<strong>个人部分</strong>（老系统接口）</td><td><strong>-1200</strong></td><td><strong>老系统接口读取</strong>（员工扣款方向）；<strong>工资条保留「代扣公积金」-1200 扣减项</strong>（按全额显示）；常乐豆代缴 800，员工<strong>现金补差 = 1200 − 800 = 400</strong></td></tr>
                <tr><td>代扣社保（老系统接口）</td><td>-800</td><td><strong>老系统接口读取</strong>，个人部分，<strong>不在常乐豆抵扣范围</strong></td></tr>
                <tr><td>代扣个税</td><td>-180</td><td>百旺按 9100 计算</td></tr>
                <tr><td><strong>常乐豆当月获豆</strong></td><td><strong>+2000</strong></td><td>资产方向（<strong>当月获得，不得跨月结转</strong>）；优先抵公司 1200；剩余 800 继续抵个人（<strong>最高 1200</strong>）；触发<strong>「激励补贴」800</strong>；正好用完</td></tr>
                <tr><td>负工资余额</td><td>-2000</td><td>历史欠款</td></tr>
              </tbody>
            </table>
            <p><strong>应税收入：</strong>(6000+2000+500+800 激励补贴) - 投诉扣款(200) = <strong>9100</strong>（社保/公积金<strong>不参与应税收入</strong>；「激励补贴」计入 1 级收入）</p>
            <p><strong>常乐豆使用（v2-1 4 步，公司+个人都覆盖的场景）：</strong></p>
            <ul class="calc-steps">
              <li>① 抵公积金<strong>公司部分</strong> 1200（老系统记账金额，<strong>不进员工工资条</strong>）→ 2000 - 1200 = <strong>剩余 800</strong></li>
              <li>② 抵公积金<strong>个人部分</strong> 800（<strong>最高 1200</strong>，剩余 800 <strong>不超出</strong>个人部分上限）→ 800 - 800 = <strong>剩余 0</strong></li>
              <li>③ 用于代缴个人部分的常乐豆 800 → 以<strong>「激励补贴」名义</strong>作为收入项加入<strong>第 1 个工资条</strong>，<strong>计入应税收入</strong></li>
              <li>④ 剩余常乐豆 0 → 不进入消费环节</li>
            </ul>
            <p><strong>N 个工资条完整组成（示例：3个，发放主体=合同主体）：</strong></p>
            <table class="data-table">
              <thead>
                <tr><th>工资条</th><th>收入项</th><th>扣缴项</th><th>动态项</th><th>应发</th><th>实发</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>工资条1（计件）</td>
                  <td>计件提成 +6000；<strong>激励补贴 +800</strong>（常乐豆代缴个人部分 800 的名义收入）</td>
                  <td>投诉扣款 -200；代扣社保 -800</td>
                  <td>负工资抵扣 -2000（应发 &gt; 0 触发）</td>
                  <td>+3800</td>
                  <td><strong>+3800</strong></td>
                </tr>
                <tr>
                  <td>工资条2（奖金）</td>
                  <td>超产值奖金 +2000；超时加班费 +500</td>
                  <td>代扣公积金 <strong>-1200</strong>（按老系统接口读取的全额显示；员工现金补差 400）</td>
                  <td>—（<strong>公司部分由常乐豆抵完，不进工资条</strong>）</td>
                  <td>+1300</td>
                  <td><strong>+1300</strong></td>
                </tr>
                <tr>
                  <td>工资条3（个税）</td>
                  <td>保底获豆 +0</td>
                  <td>代扣个税 -180</td>
                  <td>—</td>
                  <td>-180（应发 &lt; 0，负数累加）</td>
                  <td><strong>0</strong></td>
                </tr>
                <tr>
                  <td colspan="4"><strong>合计</strong></td>
                  <td colspan="2"><strong>实发 +5100，剩余负工资余额 -180</strong></td>
                </tr>
              </tbody>
            </table>
            <div class="note">
              <strong>说明：</strong>① 系统项（社保/公积金/个税）按月一次计算，按工资单配置分配到 N 个工资条（示例：3个）；<strong>社保/公积金金额来自老系统接口</strong>；② <strong>常乐豆 4 步：</strong>① 抵公司部分（不进工资条）→ ② 抵个人部分（<strong>最高 1200</strong>，<strong>不修改</strong>显示金额）→ ③ 抵掉部分<strong>以「激励补贴」名义入第 1 个工资条计入应税收入</strong> → ④ 剩余消费/提现；③ 工资条上「代扣公积金」<strong>始终按全额显示</strong>，员工<strong>现金补差 = 1200 − 常乐豆代缴 800 = 400</strong>；④ <strong>「激励补贴」金额 = 常乐豆实际抵个人部分的金额</strong>（本例 800），不超过个人公积金总额 1200；⑤ v2-1 阶段<strong>【公积金个人扣款】动态项已取消</strong>；⑥ 负工资抵扣是触发式动态项；⑦ 应发 &lt; 0 时负数累加到下次负工资余额；⑧ <strong>商业险暂不进入系统</strong>（线下购买，成本归公司，不进工资条）。
            </div>
          </div>
        </div>

        <!-- 全职示例 B -->
        <div class="card">
          <h3 id="ex-2">全职示例 B：常乐豆<strong>不足抵公司部分</strong> → 公司部分差额由公司现金补足，<strong>无剩余抵个人部分</strong>，<strong>不触发「激励补贴」</strong>（含负工资抵扣）</h3>
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
                <tr><td>公积金<strong>公司部分</strong>（老系统记账）</td><td><strong>-1200</strong></td><td><strong>老系统记账</strong>（公司侧支出），<strong>不进员工工资条</strong>；本期<strong>常乐豆仅抵 300</strong>，剩余 900 由<strong>公司现金补足</strong></td></tr>
                <tr><td>公积金<strong>个人部分</strong>（老系统接口）</td><td><strong>-1200</strong></td><td><strong>老系统接口读取</strong>（员工扣款方向）；工资条保留「代扣公积金」-1200 扣减项（按全额显示）；<strong>常乐豆已用完，无法代缴个人部分，员工现金补差 = 1200</strong></td></tr>
                <tr><td>代扣社保（老系统接口）</td><td>-800</td><td><strong>老系统接口读取</strong>，个人部分，<strong>不在常乐豆抵扣范围</strong></td></tr>
                <tr><td>代扣个税</td><td>-90</td><td>百旺按累计应税 9000 计算</td></tr>
                <tr><td><strong>常乐豆当月获豆</strong></td><td><strong>+300</strong></td><td>资产方向（<strong>当月获得，不得跨月结转</strong>）；优先抵公司部分 → 抵 300 后<strong>已用完</strong>；公司部分差额 900 由<strong>公司现金补足</strong>；无剩余抵个人部分，<strong>不触发「激励补贴」</strong></td></tr>
                <tr><td>负工资余额</td><td>-500</td><td>历史欠款</td></tr>
              </tbody>
            </table>
            <p><strong>应税收入：</strong>(1000+7000) - 投诉扣款(3000) = <strong>5000</strong>（无「激励补贴」触发；社保/公积金<strong>不参与应税收入</strong>）</p>
            <p><strong>常乐豆使用（v2-1 4 步，公司部分不足时公司现金补足）：</strong></p>
            <ul class="calc-steps">
              <li>① 抵公积金<strong>公司部分</strong> 1200（老系统记账金额）→ 常乐豆 300 <strong>全部消耗</strong>，仅抵 300；剩余 900 由<strong>公司现金补足</strong>（不进入员工工资条）</li>
              <li>② 公积金<strong>个人部分</strong> 1200 → 常乐豆<strong>已用完</strong>，<strong>不触发</strong>第 ② 步抵扣；员工<strong>现金补差 = 1200</strong>（工资条上「代扣公积金」按全额 1200 显示）</li>
              <li>③ <strong>跳过</strong>——无代缴个人部分，无「激励补贴」</li>
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
                  <td>—（常乐豆已用完，无「激励补贴」）</td>
                  <td>-2800</td>
                  <td><strong>0</strong></td>
                </tr>
                <tr>
                  <td>工资条2（奖金）</td>
                  <td>超时加班费 +0</td>
                  <td>代扣公积金 <strong>-1200</strong>（按老系统接口读取的全额显示；员工现金补差 1200）</td>
                  <td>—（<strong>公司部分差额 900 由公司现金补足，不进工资条</strong>）</td>
                  <td>-1200</td>
                  <td><strong>0</strong></td>
                </tr>
                <tr>
                  <td>工资条3（保底+个税）</td>
                  <td>保底获豆 +7000</td>
                  <td>代扣个税 -90</td>
                  <td>负工资抵扣 -4500（按可抵扣最大值：历史 500 + 工资条1 累加 2800 + 工资条2 累加 1200）</td>
                  <td>+2410</td>
                  <td><strong>+2410</strong></td>
                </tr>
                <tr>
                  <td colspan="4"><strong>合计</strong></td>
                  <td colspan="2"><strong>实发 +2410，剩余负工资余额 0</strong></td>
                </tr>
              </tbody>
            </table>
            <div class="note">
              <strong>说明：</strong>① 应发 ≤ 0 的工资条负数计入"待抵扣总额"；② <strong>常乐豆 4 步：</strong>本例常乐豆 300 抵完公司部分（仅抵 300，差额 900 公司现金补足）后已用完，<strong>无剩余抵个人部分</strong>，<strong>不触发「激励补贴」</strong>；③ 工资条上「代扣公积金」<strong>始终按全额显示</strong>，员工<strong>现金补差 = 1200</strong>（无常乐豆代缴）；④ v2-1 阶段<strong>【公积金个人扣款】动态项已取消</strong>；⑤ 工资条3 应发 &gt; 0 时按"可抵扣最大值"一次性扣除；⑥ 抵扣后剩余负工资 0；⑦ <strong>总实发 2410</strong>。
            </div>
          </div>
        </div>

        <!-- 全职示例 C：常乐豆正好够公司部分 -->
        <div class="card">
          <h3 id="ex-3">全职示例 C：常乐豆<strong>正好够抵公司部分</strong> → 公司部分 1200 全部由常乐豆抵扣，<strong>无剩余抵个人部分</strong>，<strong>不触发「激励补贴」</strong>（员工个人 1200 全自付）</h3>
          <div class="example">
            <p><strong>员工当月数据：</strong></p>
            <table class="data-table">
              <thead>
                <tr><th>项目</th><th>金额</th><th>说明</th></tr>
              </thead>
              <tbody>
                <tr><td>计件提成</td><td>+6000</td><td>第1级收入</td></tr>
                <tr><td>超产值奖金</td><td>+1500</td><td>第1级收入</td></tr>
                <tr><td>超时加班费</td><td>+500</td><td>第1级收入</td></tr>
                <tr><td>投诉扣款</td><td>-100</td><td>第1级扣缴</td></tr>
                <tr><td>保底获豆</td><td>+0</td><td>第2级收入</td></tr>
                <tr><td>公积金<strong>公司部分</strong>（老系统记账）</td><td><strong>-1200</strong></td><td><strong>老系统记账</strong>（公司侧支出），<strong>不进员工工资条</strong>；本期<strong>由常乐豆 1200 完全抵扣</strong></td></tr>
                <tr><td>公积金<strong>个人部分</strong>（老系统接口）</td><td><strong>-1200</strong></td><td><strong>老系统接口读取</strong>（员工扣款方向）；工资条保留「代扣公积金」-1200 扣减项（按全额显示）；<strong>常乐豆已用完，无法代缴个人部分，员工现金补差 = 1200</strong></td></tr>
                <tr><td>代扣社保（老系统接口）</td><td>-800</td><td><strong>老系统接口读取</strong>，个人部分，<strong>不在常乐豆抵扣范围</strong></td></tr>
                <tr><td>代扣个税</td><td>-90</td><td>百旺按应税 7900 计算</td></tr>
                <tr><td><strong>常乐豆当月获豆</strong></td><td><strong>+1200</strong></td><td>资产方向（<strong>当月获得，不得跨月结转</strong>）；优先抵公司部分 1200 → 正好用完；<strong>无剩余抵个人部分，不触发「激励补贴」</strong></td></tr>
                <tr><td>负工资余额</td><td>0</td><td>无历史欠款</td></tr>
              </tbody>
            </table>
            <p><strong>应税收入：</strong>(6000+1500+500) - 投诉扣款(100) = <strong>7900</strong>（无「激励补贴」触发；社保/公积金<strong>不参与应税收入</strong>）</p>
            <p><strong>常乐豆使用（v2-1 4 步，正好用完场景）：</strong></p>
            <ul class="calc-steps">
              <li>① 抵公积金<strong>公司部分</strong> 1200（老系统记账金额，<strong>不进员工工资条</strong>）→ 1200 - 1200 = <strong>剩余 0</strong></li>
              <li>② <strong>跳过</strong>——常乐豆已用完，无法抵个人部分；员工<strong>现金补差 = 1200</strong>（工资条上「代扣公积金」按全额 1200 显示）</li>
              <li>③ <strong>跳过</strong>——无代缴个人部分，无「激励补贴」</li>
              <li>④ 剩余常乐豆 0，不进入消费环节</li>
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
                  <td>投诉扣款 -100；代扣社保 -800</td>
                  <td>—（无「激励补贴」）</td>
                  <td>+5100</td>
                  <td><strong>+5100</strong></td>
                </tr>
                <tr>
                  <td>工资条2（奖金）</td>
                  <td>超产值奖金 +1500；超时加班费 +500</td>
                  <td>代扣公积金 <strong>-1200</strong>（按老系统接口读取的全额显示；员工现金补差 1200）</td>
                  <td>—（<strong>公司部分由常乐豆抵完，不进工资条</strong>）</td>
                  <td>+800</td>
                  <td><strong>+800</strong></td>
                </tr>
                <tr>
                  <td>工资条3（个税）</td>
                  <td>保底获豆 +0</td>
                  <td>代扣个税 -90</td>
                  <td>—</td>
                  <td>-90</td>
                  <td><strong>0</strong></td>
                </tr>
                <tr>
                  <td colspan="4"><strong>合计</strong></td>
                  <td colspan="2"><strong>实发 +5900，剩余负工资余额 -90</strong></td>
                </tr>
              </tbody>
            </table>
            <div class="note">
              <strong>说明：</strong>① <strong>常乐豆 4 步：</strong>本例常乐豆 1200 正好抵完公司部分，<strong>无剩余抵个人部分</strong>，<strong>不触发「激励补贴」</strong>；② 工资条上「代扣公积金」<strong>始终按全额显示</strong>，员工<strong>现金补差 = 1200</strong>（无任何常乐豆代缴）；③ <strong>与示例 A 的关键差异：</strong>本例常乐豆只覆盖公司部分，员工<strong>无「激励补贴」</strong>；示例 A 常乐豆覆盖公司+部分个人，员工有「激励补贴」。
            </div>
          </div>
        </div>

        <!-- 非全日制示例 -->
        <div class="card">
          <h3 id="ex-4">非全日制示例：N 周工资条（示例：4周），最后一周含汇算补缴（单主体）</h3>
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
          <h3 id="ex-5">兼职示例：多主体倒序申报（1 门店 = 1 主体），每主体最后一周含汇算补缴</h3>
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
          <h3 id="ex-6">返聘示例：单月 1 个工资条（无社保/无公积金/无常乐豆/商业险（暂不进入系统））</h3>
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
              <strong>说明：</strong>① 返聘<strong>无社保/无公积金/无常乐豆</strong>，工资条结构最简；② <strong>商业险暂不进入系统（线下购买）</strong>，<strong>不进员工工资条</strong>，由老系统/财务单独记账；③ 本例无负工资余额，无负工资抵扣；④ <strong>无个税补缴/退税</strong>（返聘无周薪，无预扣环节）。
            </div>
          </div>
        </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../docs/components/DocShell.vue'

const tocItems = [
    { id: 'ex-1', label: '全职示例 A：常乐豆<strong>充足（覆盖公司+部分个人）</strong> → 抵公司 1200，剩余抵个人 800，触发「激励补贴」800（含负工资抵扣）' },
    { id: 'ex-2', label: '全职示例 B：常乐豆<strong>不足抵公司部分</strong> → 公司部分差额由公司现金补足，<strong>无剩余抵个人部分</strong>，<strong>不触发「激励补贴」</strong>（含负工资抵扣）' },
    { id: 'ex-3', label: '全职示例 C：常乐豆<strong>正好够抵公司部分</strong> → 公司部分 1200 全部由常乐豆抵扣，<strong>无剩余抵个人部分</strong>，<strong>不触发「激励补贴」</strong>（员工个人 1200 全自付）' },
    { id: 'ex-4', label: '非全日制示例：N 周工资条（示例：4周），最后一周含汇算补缴（单主体）' },
    { id: 'ex-5', label: '兼职示例：多主体倒序申报（1 门店 = 1 主体），每主体最后一周含汇算补缴' },
    { id: 'ex-6', label: '返聘示例：单月 1 个工资条（无社保/无公积金/无常乐豆/商业险（暂不进入系统））' }
  ]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '产品需求v2（阶段1）', to: '/docs/product-v2-phase1' },
  { label: '七、计算示例' }
]
</script>
