<template>
      <div id="template" class="section">
        <h2>四、岗位薪酬模板</h2>
        <div class="note" style="background: hsl(var(--primary) / 0.08); border-left: 3px solid hsl(var(--primary)); padding: 10px 12px; margin-bottom: 12px; font-size: 13px; border-radius: 4px;">
          <strong>📌 职责边界：</strong>岗位薪酬模板<strong>只管工资条项</strong>（薪酬项 + 扣缴项 + 系统项）。福利保障项（社保 / 公积金 / 商业险）已<strong>拆出</strong>到独立的【岗位福利保障】页面维护，<strong>不配置在薪酬模板中</strong>。
        </div>

        <div class="card">
          <h3>模板项类型</h3>
          <p>薪酬模板由以下类型组成（<strong>仅工资条相关项</strong>）：</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>类型</th>
                <th>说明</th>
                <th>进入薪酬计算</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>薪酬项</td>
                <td>收入类，如：计件提成、超产值奖金、保底获豆</td>
                <td>✅ 是（增加应发）</td>
              </tr>
              <tr>
                <td>扣缴项</td>
                <td>扣款类，如：投诉扣款</td>
                <td>✅ 是（减少应发）</td>
              </tr>
              <tr>
                <td>代扣社保</td>
                <td>社保扣缴（全职），员工个人部分</td>
                <td>✅ 是</td>
              </tr>
              <tr>
                <td>代扣公积金</td>
                <td>公积金扣缴（全职），员工个人部分</td>
                <td>✅ 是</td>
              </tr>
              <tr>
                <td>预扣个税</td>
                <td>第2级，每工资条计算时预扣（兼职/非全日制：每周，3%）</td>
                <td>✅ 是</td>
              </tr>
              <tr>
                <td>代扣个税</td>
                <td>月末汇算后生成退税/补缴，作为<strong>最后一条工资条</strong>的一个扣缴/收入项（<strong>不单独生成"汇算工资条"</strong>）</td>
                <td>✅ 是</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>已移除的旧版"公司成本项"：</strong>原 V1 模板中的"公司成本项"分类（商业险等）在 V2 已<strong>整体拆出</strong>，理由：
            <ul style="margin: 4px 0 0 16px; line-height: 1.8;">
              <li>社保 / 公积金 / 商业险<strong>本质是福利保障</strong>，有独立的配置维度（险种库 / 城市基准 / 续保提醒），不适合混入薪酬模板</li>
              <li>福利项<strong>不参与工资条扣款</strong>，与薪酬项的"按月计算按条分配"逻辑不同源</li>
              <li>详细配置见【<strong>岗位福利保障</strong>】独立页面</li>
            </ul>
          </div>
        </div>

        <!-- 全职模板 -->
        <div class="card">
          <h3>全职模板（劳动合同）</h3>
          <p><strong>计算周期（示例）：</strong>每月1次，N个工资条/月（示例：3个），单一主体</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>类别</th>
                <th>薪酬项</th>
                <th>类型</th>
                <th>层级</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowspan="4">薪酬项</td>
                <td>计件提成</td>
                <td>收入</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>超产值奖金</td>
                <td>收入</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>超时加班费</td>
                <td>收入</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>投诉扣款</td>
                <td>扣缴项</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>薪酬项</td>
                <td>保底获豆</td>
                <td>收入</td>
                <td>第2级</td>
              </tr>
              <tr>
                <td rowspan="3">系统项</td>
                <td>代扣社保</td>
                <td>代扣社保</td>
                <td>末级</td>
              </tr>
              <tr>
                <td>代扣公积金</td>
                <td>代扣公积金</td>
                <td>末级</td>
              </tr>
              <tr>
                <td>代扣个税</td>
                <td>代扣个税</td>
                <td>末级</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>系统项：</strong>代扣社保、代扣公积金、代扣个税（按月计算，按工资条分配）<br/>
            <strong>无预扣个税：</strong>全职个税直接使用百旺服务计算，不再预扣<br/>
            <strong>福利保障：</strong>社保（全）+ 公积金 + 商业险必选 1+ —— 在【<strong>岗位福利保障</strong>】页面独立配置
          </div>
        </div>

        <!-- 非全日制模板 -->
        <div class="card">
          <h3>非全日制模板（劳务协议）</h3>
          <p><strong>计算周期（示例）：</strong>每周1次，每主体独立结算（N个工资条可配，示例：1个）</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>类别</th>
                <th>薪酬项</th>
                <th>类型</th>
                <th>层级</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowspan="3">薪酬项</td>
                <td>计件提成</td>
                <td>收入</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>超时加班费</td>
                <td>收入</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>投诉扣款</td>
                <td>扣缴项</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>第2级</td>
                <td>个税预扣</td>
                <td>扣缴项</td>
                <td>第2级（每工资条按 3% 预扣）</td>
              </tr>
              <tr>
                <td>系统项</td>
                <td>个税退税 / 个税补缴</td>
                <td>代扣个税</td>
                <td>系统项（月末汇算，作为最后一条工资条的一项）</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>福利保障：</strong>社保（仅工伤保险）<strong>必选</strong> + 商业险<strong>可选</strong> —— 在【<strong>岗位福利保障</strong>】页面独立配置<br/>
            <strong>不进入薪酬计算：</strong>这些项由公司全额负担，<strong>不参与工资条扣款计算</strong>
          </div>
        </div>

        <!-- 兼职模板 -->
        <div class="card">
          <h3>兼职模板（劳务合作）</h3>
          <p><strong>计算周期（示例）：</strong>每周1次，每主体独立结算（N个工资条可配，示例：1个）</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>类别</th>
                <th>薪酬项</th>
                <th>类型</th>
                <th>层级</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowspan="3">薪酬项</td>
                <td>计件提成</td>
                <td>收入</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>超时加班费</td>
                <td>收入</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>投诉扣款</td>
                <td>扣缴项</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>第2级</td>
                <td>个税预扣</td>
                <td>扣缴项</td>
                <td>第2级（每工资条按 3% 预扣）</td>
              </tr>
              <tr>
                <td>系统项</td>
                <td>个税退税 / 个税补缴</td>
                <td>代扣个税</td>
                <td>系统项（月末汇算，作为最后一条工资条的一项）</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>福利保障：</strong>商业险<strong>必选 1+</strong>（公司全额）—— 在【<strong>岗位福利保障</strong>】页面独立配置<br/>
            <strong>多主体申报：</strong>按应税金额大的先报，可能跳档
          </div>
        </div>

        <!-- 返聘模板 -->
        <div class="card">
          <h3>返聘模板（劳务合作-退休返聘）</h3>
          <p><strong>计算周期（示例）：</strong>每月1次，N个工资条/月（示例：1个），单一劳务合作主体</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>类别</th>
                <th>薪酬项</th>
                <th>类型</th>
                <th>层级</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowspan="3">薪酬项</td>
                <td>计件提成</td>
                <td>收入</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>超时加班费</td>
                <td>收入</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>投诉扣款</td>
                <td>扣缴项</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>系统项</td>
                <td>代扣个税</td>
                <td>代扣个税</td>
                <td>末级（百旺服务计算）</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>福利保障：</strong>无社保（达到退休年龄不再缴纳）、无公积金、<strong>商业险必选 1+</strong> —— 在【<strong>岗位福利保障</strong>】页面独立配置<br/>
            <strong>无常乐豆：</strong>返聘员工不享有常乐豆<br/>
            <strong>无预扣个税：</strong>返聘无周薪，个税直接由百旺服务按月计算（参考全职逻辑）
          </div>
        </div>
      </div>
</template>
