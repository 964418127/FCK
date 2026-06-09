<template>
      <div id="dynamic-items" class="section">
        <h2>四·附录：动态薪酬项 / 扣缴项（业务流转产生）</h2>
        <div class="note" style="background: hsl(var(--primary) / 0.08); border-left: 3px solid hsl(var(--primary)); padding: 10px 12px; margin-bottom: 12px; font-size: 13px; border-radius: 4px;">
          <strong>📌 与"模板固定项"的区别：</strong>上一节【岗位薪酬模板】列出的薪酬项 / 扣缴项是<strong>HR 预先在模板中配置</strong>的。本节列出的项是<strong>在业务执行/计算流转过程中，按条件动态产生</strong>的——<strong>不固定配置在模板中</strong>，而是<strong>触发式动态项</strong>。
        </div>

        <!-- 1. 触发条件表 -->
        <div class="card">
          <h3>① 动态项全景</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 180px;">动态项</th>
                <th style="width: 220px;">触发条件 / 业务环节</th>
                <th>适用用工类型</th>
                <th>出现位置</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>【公积金个人扣款】</strong></td>
                <td>常乐豆余额不足以抵扣社保/公积金<strong>个人部分</strong>时，从工资单<strong>现金</strong>部分扣减</td>
                <td>全职 / 返聘</td>
                <td>对应工资单（全职=当月任一工资条；返聘=当月工资条）</td>
              </tr>
              <tr>
                <td><strong>个税补缴</strong></td>
                <td>月末百旺汇算：实际税额 &gt; 已预扣合计（多退少补中的"补"）</td>
                <td>非全日制 / 兼职 / 返聘</td>
                <td>当月<strong>最后一条工资条</strong>的一个扣缴项（不单独生成汇算工资条）</td>
              </tr>
              <tr>
                <td><strong>个税退税</strong></td>
                <td>月末百旺汇算：实际税额 &lt; 已预扣合计（多退少补中的"退"）</td>
                <td>非全日制 / 兼职 / 返聘</td>
                <td>当月<strong>最后一条工资条</strong>的一个收入项（不单独生成汇算工资条）</td>
              </tr>
              <tr>
                <td><strong>负工资抵扣</strong></td>
                <td>工资条<strong>应发 &gt; 0</strong> 且员工存在<strong>负工资余额</strong>时触发</td>
                <td>全职 / 非全日制 / 兼职 / 返聘（所有类型）</td>
                <td>任意可触发的工资条（<strong>可叠加多条</strong>）</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 2. 按合作模式 / 业务环节分述 -->
        <div class="card">
          <h3>② 各合作模式下的动态项分布</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 110px;">用工类型</th>
                <th>可能产生的动态项</th>
                <th>业务环节</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>全职</strong></td>
                <td>
                  · 【<strong>公积金个人扣款</strong>】（常乐豆不足时）<br/>
                  · <strong>负工资抵扣</strong>（应发 &gt; 0 且有余额时）<br/>
                  · <em>无个税补缴/退税</em>（个税直接由百旺按月计算，不预扣）
                </td>
                <td>
                  ① 工资单组装 → 常乐豆抵扣（公司 → 个人）→ 现金补扣【公积金个人扣款】<br/>
                  ② 工资条应发计算 → 应发 &gt; 0 触发负工资抵扣
                </td>
              </tr>
              <tr>
                <td><strong>非全日制</strong></td>
                <td>
                  · <strong>个税补缴</strong> 或 <strong>个税退税</strong>（月末汇算）<br/>
                  · <strong>负工资抵扣</strong>（应发 &gt; 0 且有余额时）<br/>
                  · <em>无【公积金个人扣款】</em>（无常乐豆）
                </td>
                <td>
                  ① 每周预扣个税 → 累计已预扣合计<br/>
                  ② 月末百旺汇算 → 实际税额 vs 已预扣合计 → 补缴/退税 → 附加到当月最后一条工资条<br/>
                  ③ 工资条应发 &gt; 0 触发负工资抵扣
                </td>
              </tr>
              <tr>
                <td><strong>兼职</strong></td>
                <td>
                  · <strong>个税补缴</strong> 或 <strong>个税退税</strong>（月末多主体倒序汇算）<br/>
                  · <strong>负工资抵扣</strong>（每主体独立）<br/>
                  · <em>无【公积金个人扣款】</em>
                </td>
                <td>
                  ① 每周每主体预扣个税<br/>
                  ② 月末按主体应税倒序申报 → 每主体 1 次百旺调用 → 每主体 1 个补缴/退税 → 附加到该主体最后一条工资条<br/>
                  ③ 每主体工资条应发 &gt; 0 触发负工资抵扣（<strong>每主体独立</strong>，不跨主体）
                </td>
              </tr>
              <tr>
                <td><strong>返聘</strong></td>
                <td>
                  · <em>无【公积金个人扣款】</em>（无常乐豆 + 无公积金个人部分，<strong>无任何触发场景</strong>）<br/>
                  · <strong>负工资抵扣</strong>（应发 &gt; 0 且有余额时）<br/>
                  · <em>无个税补缴/退税</em>（无周薪无预扣）
                </td>
                <td>
                  ① 无社保/无公积金/无常乐豆 + 商业险公司部分由公司全额现金承担（不进工资条）→ <strong>无任何【公积金个人扣款】触发场景</strong><br/>
                  ② 工资条应发 &gt; 0 触发负工资抵扣
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 3. 与"模板固定项"的协同 -->
        <div class="card" style="background: hsl(var(--warning) / 0.05);">
          <h3>③ 与"模板固定项"的协同关系</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 200px;">维度</th>
                <th>模板固定项（薪酬模板配置）</th>
                <th>动态项（业务流转产生）</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>配置位置</td>
                <td>【岗位薪酬模板】</td>
                <td><strong>无模板配置</strong>，由系统在计算时按规则产生</td>
              </tr>
              <tr>
                <td>名称</td>
                <td>HR 自定义（如：投诉扣款、计件提成）</td>
                <td><strong>系统固定名称</strong>（如：【公积金个人扣款】、负工资抵扣、个税补缴/退税）</td>
              </tr>
              <tr>
                <td>出现时机</td>
                <td>每条工资条都出现（按层级计算）</td>
                <td><strong>触发式</strong>（条件满足才出现）</td>
              </tr>
              <tr>
                <td>是否影响应税收入</td>
                <td>第 1 级 + 第 2 级（非预扣）→ 计入应税收入<br/>预扣个税 → 不计入</td>
                <td>
                  · 【公积金个人扣款】→ <strong>不计入</strong>（与代扣公积金个人部分等同）<br/>
                  · 负工资抵扣 → <strong>不计入</strong>（动态项，不是收入）<br/>
                  · 个税补缴/退税 → <strong>不计入</strong>（个税汇算结果）
                </td>
              </tr>
              <tr>
                <td>与应发的关系</td>
                <td>直接参与应发计算（+/- 应发）</td>
                <td>
                  · 【公积金个人扣款】→ 减少应发（扣缴项）<br/>
                  · 负工资抵扣 → 减少应发（触发时抵扣）<br/>
                  · 个税补缴 → 减少应发 ｜ 个税退税 → 增加应发
                </td>
              </tr>
            </tbody>
          </table>
        </div>
</template>
