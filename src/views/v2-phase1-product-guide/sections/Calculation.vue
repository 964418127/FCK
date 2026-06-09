<template>
      <div id="calculation" class="section">
        <h2>六、计算节点与时机</h2>

        <!-- 全职 -->
        <div class="card">
          <h3>全职（劳动合同）</h3>
          <div class="flow">
            <div class="flow-step">
              <div class="step-title">第1级计算</div>
              <div class="step-content">
                <p><strong>时机：</strong>最先</p>
                <p><strong>参与项：</strong></p>
                <ul>
                  <li>计件提成（收入）</li>
                  <li>超产值奖金（收入）</li>
                  <li>超时加班费（收入）</li>
                  <li>投诉扣款（扣缴）</li>
                </ul>
                <p><strong>产出：</strong>4项金额</p>
              </div>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <div class="step-title">第2级计算</div>
              <div class="step-content">
                <p><strong>时机：</strong>第1级完成后</p>
                <p><strong>参与项：</strong></p>
                <ul>
                  <li>保底获豆（引用第1级收入之和）</li>
                </ul>
                <p><strong>公式：</strong>max(0, 最低工资标准 - 第1级收入之和)</p>
                <p><strong>产出：</strong>保底获豆金额</p>
              </div>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <div class="step-title">系统项</div>
              <div class="step-content">
                <p><strong>时机：</strong>所有薪酬项计算后</p>
                <p><strong>参与项：</strong></p>
                <ul>
                  <li>代扣社保（<strong>老系统接口读取，个人部分</strong>）</li>
                  <li>代扣公积金（<strong>老系统接口读取，个人部分</strong>）</li>
                  <li>代扣个税（百旺服务）</li>
                </ul>
                <p><strong>说明：</strong>3项都每月只计算一次（示例），按工资条分配。<strong>公积金公司部分</strong>由老系统记账，<strong>不进员工工资条</strong>。</p>
                <p><strong>常乐豆抵扣（独立流程）：</strong>常乐豆<strong>只抵公积金公司部分</strong>，作为公司侧的独立资金流，<strong>不进入员工工资条</strong>，<strong>不影响应发计算</strong>。</p>
              </div>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <div class="step-title">负工资抵扣</div>
              <div class="step-content">
                <p><strong>时机：</strong>前序计算完成后（工资条应发 &gt; 0 且存在负工资余额）</p>
                <p><strong>优先级：</strong></p>
                <ul>
                  <li>应税收入 → 代扣社保（老系统）→ 代扣公积金（老系统）→ 代扣个税</li>
                  <li>结果 &gt; 0 → 抵扣负工资余额（min(余额, 结余)）</li>
                  <li>结果 ≤ 0 → 无负工资抵扣，负数累加到余额</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 非全日制 -->
        <div class="card">
          <h3>非全日制（劳务协议）</h3>
          <div class="flow">
            <div class="flow-step">
              <div class="step-title">第1级计算</div>
              <div class="step-content">
                <p><strong>时机：</strong>最先</p>
                <p><strong>参与项：</strong></p>
                <ul>
                  <li>计件提成（收入）</li>
                  <li>超时加班费（收入）</li>
                  <li>投诉扣款（扣缴）</li>
                </ul>
                <p><strong>产出：</strong>3项金额</p>
              </div>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <div class="step-title">第2级计算</div>
              <div class="step-content">
                <p><strong>时机：</strong>第1级完成后，随每个工资条计算</p>
                <p><strong>参与项：</strong></p>
                <ul>
                  <li>个税预扣（引用第1级收入之和）</li>
                </ul>
                <p><strong>公式：</strong>(第1级收入 - 第1级扣缴) × 3%</p>
                <p><strong>产出：</strong>预扣金额，进入当前工资条</p>
              </div>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <div class="step-title">系统项（个税汇算）</div>
              <div class="step-content">
                <p><strong>时机：</strong>月末，所有周工资条计算完成后</p>
                <p><strong>参与项：</strong></p>
                <ul>
                  <li>百旺服务（实际税额）</li>
                  <li>各周预扣个税之和</li>
                </ul>
                <p><strong>公式：</strong>实际税额 - 已预扣合计</p>
                <p><strong>产出：</strong>个税退税（收入）或个税补缴（扣缴）—— 作为<strong>最后一条工资条</strong>的一个扣缴/收入项出现，不单独生成汇算工资条</p>
              </div>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <div class="step-title">负工资抵扣</div>
              <div class="step-content">
                <p><strong>时机：</strong>每工资条计算后（应发 &gt; 0 且存在负工资余额）</p>
                <p><strong>优先级：</strong></p>
                <ul>
                  <li>应税收入 → 个税预扣 → 有剩余 → 抵扣负工资余额</li>
                  <li>结果 ≤ 0 → 无负工资抵扣</li>
                </ul>
                <p><strong>说明：</strong>非全日制无社保公积金（老系统记账），按优先级累加后判断</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 兼职 -->
        <div class="card">
          <h3>兼职（劳务合作）</h3>
          <div class="flow">
            <div class="flow-step">
              <div class="step-title">第1级计算</div>
              <div class="step-content">
                <p><strong>时机：</strong>最先</p>
                <p><strong>参与项：</strong></p>
                <ul>
                  <li>计件提成（收入）</li>
                  <li>超时加班费（收入）</li>
                  <li>投诉扣款（扣缴）</li>
                </ul>
                <p><strong>产出：</strong>3项金额</p>
              </div>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <div class="step-title">第2级计算</div>
              <div class="step-content">
                <p><strong>时机：</strong>第1级完成后，随每个工资条计算</p>
                <p><strong>参与项：</strong></p>
                <ul>
                  <li>个税预扣（引用第1级收入之和）</li>
                </ul>
                <p><strong>公式：</strong>(第1级收入 - 第1级扣缴) × 3%</p>
                <p><strong>产出：</strong>预扣金额，进入当前工资条</p>
              </div>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <div class="step-title">系统项（个税汇算）</div>
              <div class="step-content">
                <p><strong>时机：</strong>月末，所有周工资条计算完成后</p>
                <p><strong>参与项：</strong></p>
                <ul>
                  <li>百旺服务（实际税额）</li>
                  <li>各周预扣个税之和</li>
                </ul>
                <p><strong>多主体申报（1 门店 = 1 主体）：</strong>按主体应税金额倒序依次申报，可能跳档</p>
                <p><strong>产出：</strong>个税退税（收入）或个税补缴（扣缴）—— 作为<strong>最后一条工资条</strong>的一个扣缴/收入项出现，不单独生成汇算工资条</p>
              </div>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <div class="step-title">负工资抵扣</div>
              <div class="step-content">
                <p><strong>时机：</strong>每工资条计算后（应发 &gt; 0 且存在负工资余额）</p>
                <p><strong>优先级：</strong></p>
                <ul>
                  <li>应税收入 → 个税预扣 → 有剩余 → 抵扣负工资余额</li>
                  <li>结果 ≤ 0 → 无负工资抵扣</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 返聘 -->
        <div class="card">
          <h3>返聘（劳务合作-退休返聘）</h3>
          <div class="flow">
            <div class="flow-step">
              <div class="step-title">第1级计算</div>
              <div class="step-content">
                <p><strong>时机：</strong>最先</p>
                <p><strong>参与项：</strong></p>
                <ul>
                  <li>计件提成（收入）</li>
                  <li>超时加班费（收入）</li>
                  <li>投诉扣款（扣缴）</li>
                </ul>
                <p><strong>产出：</strong>3项金额</p>
              </div>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <div class="step-title">系统项（个税）</div>
              <div class="step-content">
                <p><strong>时机：</strong>所有薪酬项计算后</p>
                <p><strong>参与项：</strong></p>
                <ul>
                  <li>代扣个税（百旺服务）</li>
                </ul>
                <p><strong>说明：</strong>1项每月只计算一次（示例），按工资条分配</p>
              </div>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <div class="step-title">负工资抵扣</div>
              <div class="step-content">
                <p><strong>时机：</strong>前序计算完成后（工资条应发 &gt; 0 且存在负工资余额）</p>
                <p><strong>优先级：</strong></p>
                <ul>
                  <li>应税收入 → 代扣个税</li>
                  <li>结果 &gt; 0 → 抵扣负工资余额</li>
                  <li>结果 ≤ 0 → 无负工资抵扣，负数累加到余额</li>
                </ul>
                <p><strong>说明：</strong>返聘无社保/无公积金/无预扣</p>
              </div>
            </div>
          </div>
        </div>
      </div>

</template>
