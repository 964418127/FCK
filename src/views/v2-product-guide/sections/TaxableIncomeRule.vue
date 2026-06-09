<template>
      <div id="taxable-income-rule" class="section" style="margin-top: 24px;">
        <h2>应税收入计算规则（正式定义）</h2>
        <p>本节给出 V2 系统中"应税收入"的<strong>正式公式与边界规则</strong>，作为工资条、个税计算、汇算等所有环节的口径基准。</p>

        <!-- 1. 公式 -->
        <div class="card" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary));">
          <h3>① 公式（per record / per payslip）</h3>
          <p style="font-size: 18px; font-weight: 600; color: hsl(var(--primary)); margin: 8px 0;">
            应税收入 = 第1级收入 + 第2级收入 - 第1级扣款 - 第2级扣款（非预扣）
          </p>
          <p style="font-size: 12px; color: hsl(var(--muted-foreground));">
            <strong>主体级别聚合（每主体应税收入）：</strong>该主体下所有工资条的 应税收入 之和 = Σ 各工资条（该主体第1级收入 + 第2级收入 - 第1级扣款 - 该主体第2级扣款（非预扣））
          </p>
          <p style="font-size: 12px; color: hsl(var(--muted-foreground));">
            <strong>员工月度累计：</strong>累计应税收入 = Σ 当月所有工资条的应税收入
          </p>
        </div>

        <!-- 2. 包含项 -->
        <div class="card">
          <h3>② 计入应税收入</h3>
          <table class="data-table">
            <thead><tr><th>层级</th><th>项目</th><th>说明</th></tr></thead>
            <tbody>
              <tr><td>第1级收入</td><td>计件提成 / 超产值奖金 / 超时加班费</td><td>基础业务收入</td></tr>
              <tr><td>第2级收入</td><td>保底获豆（全职）</td><td>最低工资差额补贴</td></tr>
              <tr><td>第1级扣款</td><td>投诉扣款</td><td>基础业务扣款</td></tr>
              <tr><td>第2级扣款（非预扣）</td><td>其他第2级扣款（如：质量扣款 / 设备损耗扣款 等非预扣类）</td><td>第2级中<strong>除个税预扣外</strong>的所有扣款</td></tr>
            </tbody>
          </table>
          <p style="font-size: 12px; color: hsl(var(--muted-foreground)); margin-top: 8px;">
            <strong>注：</strong>当前 V2 设计中，第 2 级扣款最典型的是"个税预扣 3%"，但若未来新增其他第 2 级扣款项（如质量扣款），<strong>默认均应纳入应税收入</strong>，<strong>唯独"个税预扣"例外排除</strong>（理由见下节）
          </p>
        </div>

        <!-- 3. 不计入项 -->
        <div class="card" style="background: hsl(var(--muted) / 0.3);">
          <h3>③ 不计入应税收入（关键）</h3>
          <table class="data-table">
            <thead><tr><th>类别</th><th>项目</th><th>不参与的理由</th></tr></thead>
            <tbody>
              <tr>
                <td><strong>第2级扣款（预扣）</strong></td>
                <td>个税预扣 3%（非全日制/兼职每条）</td>
                <td>是<strong>真正的个税</strong>，仅用于个税汇算，不应作为应税收入基数。预扣所在工资条<strong>已发放</strong>，不可回溯修改应税收入</td>
              </tr>
              <tr>
                <td>系统项</td>
                <td>代扣社保（个人部分）/ 代扣公积金（个人部分）</td>
                <td><strong>个税申报时不需要传，税局自动减除</strong>（不是我们的应税收入输入项）</td>
              </tr>
              <tr>
                <td>衍生项</td>
                <td>负工资抵扣</td>
                <td>工资条上的<strong>动态项</strong>，不是收入</td>
              </tr>
              <tr>
                <td>公司部分</td>
                <td>社保/公积金公司部分 / 商业险</td>
                <td>仅记<strong>公司成本</strong>，不进员工工资条</td>
              </tr>
              <tr>
                <td>常乐豆</td>
                <td>营销折扣获豆 / 回头客补贴</td>
                <td>不<strong>进工资条</strong>，独立福利机制；用于抵扣公司/个人部分、消费、提现均<strong>不参与应税收入</strong></td>
              </tr>
            </tbody>
          </table>
          <div class="note" style="background: hsl(var(--warning) / 0.1); border-left: 3px solid hsl(var(--warning));">
            <strong>⚠ 重点：为什么"个税预扣"和"社保/公积金"都不能进应税收入？</strong><br/>
            · <strong>预扣（个税）：</strong>是<strong>真正的个税</strong>（税基 = 应税收入，税 = 预扣金额），仅用于月末个税汇算；预扣所在工资条已发放，不可回溯<br/>
            · <strong>社保/公积金个人部分：</strong>个税申报时<strong>不需要传</strong>，税局会在税基计算中<strong>自动减除</strong>，所以也不进入应税收入公式<br/>
            · <strong>共同后果：</strong>把这两类塞回应税收入会导致重复计税
          </div>
        </div>

        <!-- 4. 边界规则 -->
        <div class="card" style="background: hsl(var(--warning) / 0.05);">
          <h3>④ 边界规则</h3>
          <p>应税收入 ≤ 0 时，<strong>该工资条个税 = 0</strong>（不交税）；同时不触发负工资抵扣（应发也需 ≤ 0 才不抵扣）。</p>
        </div>

        <!-- 5. 派生公式 -->
        <div class="card">
          <h3>⑤ 派生公式（与个税相关，但不在应税收入基数内）</h3>
          <table class="data-table">
            <thead><tr><th>项目</th><th>公式</th><th>时机 / 适用范围</th></tr></thead>
            <tbody>
              <tr>
                <td>预扣个税（per record）</td>
                <td>= 应税收入 × 3%</td>
                <td>非全日制/兼职每条工资条</td>
              </tr>
              <tr>
                <td>实际个税（全职月度）</td>
                <td>= 百旺服务(月度应税收入)</td>
                <td>月末，一次性计算</td>
              </tr>
              <tr>
                <td>实际个税（非全日制/兼职汇算）</td>
                <td>= 百旺服务(累计应税收入)</td>
                <td>月末（所有门店周工资条生成后）</td>
              </tr>
              <tr>
                <td>补缴 / 退税</td>
                <td>= 实际个税 - 已预扣合计<br/>&gt; 0 → 补缴 ｜ &lt; 0 → 退税</td>
                <td>附加到当月<strong>最后一条</strong>工资条（不单独生成汇算工资条）</td>
              </tr>
              <tr>
                <td>工资条应发</td>
                <td>= 应税收入 - 社保代扣 - 公积金代扣 - 个税代扣</td>
                <td>每条工资条</td>
              </tr>
              <tr>
                <td>工资条实发</td>
                <td>= 应发 - 负工资抵扣（仅当应发 &gt; 0 且有余额时）</td>
                <td>每条工资条</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 6. 常乐豆与公积金的认知补充 -->
        <div class="card" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary));">
          <h3>⑥ 常乐豆与公积金 / 工资单的关系（关键认知）</h3>
          <p>常乐豆<strong>仅全职</strong>享有，<strong>只用于抵扣公积金</strong>（公司部分 / 个人部分），<strong>不抵扣社保、不抵扣商业险</strong>。<strong>不计入应税收入</strong>。当常乐豆余额不足以抵扣公积金<strong>个人部分</strong>时，需要从对应<strong>工资单现金</strong>中补扣，扣款项的<strong>固定名称</strong>为【<strong>公积金个人扣款</strong>】。</p>
          <table class="data-table">
            <thead>
              <tr><th style="width: 200px;">场景</th><th>处理方式</th><th>对应应税收入计算</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>常乐豆优先抵扣（仅公积金）</strong></td>
                <td>① 抵<strong>公积金公司部分</strong> → ② 抵<strong>公积金个人部分</strong><br/>（<strong>不抵扣</strong>社保公司部分、社保个人部分、商业险公司部分）</td>
                <td>常乐豆<strong>不参与应税收入</strong>（既不计入收入，也不冲减收入）</td>
              </tr>
              <tr>
                <td><strong>常乐豆不足</strong>（公积金个人部分）→ 工资单现金补扣</td>
                <td>从对应工资单现金部分扣减【<strong>公积金个人扣款</strong>】</td>
                <td>【公积金个人扣款】作为<strong>扣缴项</strong>，<strong>不参与应税收入</strong>（与代扣公积金个人部分逻辑一致）</td>
              </tr>
              <tr>
                <td><strong>常乐豆有剩余</strong>（仅全职）</td>
                <td>仅可用于消费，不可提现；离职时剩余余额全部提现</td>
                <td>消费/提现均<strong>不参与应税收入</strong></td>
              </tr>
              <tr>
                <td><strong>社保 / 商业险</strong>（不在常乐豆抵扣范围）</td>
                <td>· 社保公司部分 + 商业险公司部分：<strong>公司全额现金承担</strong>（不进员工工资条）<br/>· 社保个人部分：通过<strong>代扣社保</strong>从工资单现金扣减（与代扣公积金逻辑同，但名称独立）</td>
                <td>· 公司部分：<strong>不参与应税收入</strong>（不进入员工工资条）<br/>· 社保个人部分：作为<strong>扣缴项</strong>，<strong>不参与应税收入</strong></td>
              </tr>
              <tr>
                <td><strong>返聘工资单</strong>（无常乐豆/无社保/无公积金）</td>
                <td>无【公积金个人扣款】触发场景（无常乐豆+无公积金）<br/>商业险公司部分公司全额现金承担</td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
          <div class="note" style="background: hsl(var(--warning) / 0.1); border-left: 3px solid hsl(var(--warning)); margin-top: 8px;">
            <strong>⚠ 关键：</strong>【公积金个人扣款】<strong>仅是工资单上的一个固定名称扣缴项</strong>，其本质与"代扣公积金个人部分"等同——都属于"个税申报时税局自动减除"项，<strong>不进入应税收入公式</strong>。换言之：<strong>应税收入公式不受常乐豆抵扣行为影响</strong>，常乐豆只是改变"工资单的现金流出方向"（且只针对公积金）。
          </div>
        </div>
      </div>
</template>
