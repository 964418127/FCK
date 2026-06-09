<template>
      <div id="bean" class="section">
        <h2>三、常乐豆规则</h2>

        <div class="card">
          <h3>常乐豆适用范围</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>类型</th>
                <th>常乐豆</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>全职</strong>（劳动合同）</td>
                <td>✅ 有</td>
                <td>支持消费、抵扣、离职提现</td>
              </tr>
              <tr>
                <td><strong>非全日制</strong>（劳务协议）</td>
                <td>❌ 无</td>
                <td>不参与常乐豆体系</td>
              </tr>
              <tr>
                <td><strong>兼职</strong>（劳务合作）</td>
                <td>❌ 无</td>
                <td>不参与常乐豆体系</td>
              </tr>
              <tr>
                <td><strong>返聘</strong>（劳务合作-退休返聘）</td>
                <td>❌ 无</td>
                <td>不参与常乐豆体系</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card">
          <h3>常乐豆使用规则（优先级）</h3>
          <div class="note">
            <strong>核心规则：</strong>获得的常乐豆，<strong>只用于抵扣公积金公司部分</strong>，<strong>不抵扣公积金个人部分、不抵扣社保、不抵扣商业险</strong>。使用顺序：
            <ol style="margin: 10px 0 0 20px; line-height: 2;">
              <li><strong>抵扣公积金公司部分</strong>：常乐豆优先抵扣公积金中公司承担的部分（<strong>公司部分金额由老系统记账</strong>，不进入员工工资条）</li>
              <li><strong>消费 / 提现</strong>：若抵扣后仍有剩余，<strong>在职时仅可用于消费</strong>；<strong>离职时全额提现</strong></li>
            </ol>
            <strong style="display: block; margin-top: 8px;">⚠ 重要：</strong>公积金<strong>个人部分</strong>由<strong>员工足额自行交纳</strong>，与常乐豆无关——工资条上保留<strong>「代扣公积金」</strong>扣减项（员工个人部分金额由老系统接口读取）。
          </div>
        </div>

        <div class="card">
          <h3>常乐豆与应税收入</h3>
          <div class="note">
            <strong>重要说明：</strong>常乐豆<strong>不参与个税应税金额计算</strong>——无论是抵扣公司部分、用于消费、提现，均不计入应税收入。
          </div>
        </div>

        <div class="card">
          <h3>离职提现</h3>
          <div class="note">
            全职员工离职时，按<strong>使用规则</strong>优先完成当期福利保障的抵扣（<strong>仅公司部分</strong>），<strong>最终剩余的常乐豆余额全部提现</strong>。<br/><br/>
            <strong>提现功能：</strong>将在<strong>推拿之家-常乐豆账户体系</strong>提供提现入口，提现报税主体即为该员工的合同主体。
          </div>
        </div>

        <div class="card">
          <h3>历史常乐豆处理</h3>
          <div class="note">
            <strong>历史豆清零：</strong>现有常乐豆需要进行清理，全部转化为现金提现。<br/><br/>
            <strong>提现方式：</strong>设置时间节点，在时间节点前的余额全部提现。
          </div>
        </div>

        <div class="callout" style="background: hsl(var(--primary) / 0.08); border-left: 3px solid hsl(var(--primary)); padding: 10px 12px; margin-top: 8px; font-size: 13px; border-radius: 4px;">
          <strong>💡 v2-1 阶段变化点：</strong>常乐豆使用规则在 v2-1 阶段<strong>做了关键简化</strong>——从原 4 步优先级（公司部分 → 个人部分 → 现金补扣【公积金个人扣款】 → 消费）<strong>简化为 1 步</strong>：<strong>只抵扣公积金公司部分</strong>。<strong>【公积金个人扣款】动态项随之取消</strong>，员工个人部分由<strong>足额自行交纳</strong>（工资条上保留「代扣公积金」项）。
        </div>
      </div>

</template>
