<template>
  <div class="v2-phase1-guide">
    <!-- 悬浮可折叠目录 -->
    <FloatingToc :items="tocItems" />

    <!-- 文档 Hero 区 -->
    <div class="doc-hero">
      <div class="doc-hero-icon">
        <el-icon :size="28"><Document /></el-icon>
      </div>
      <div class="doc-hero-body">
        <div class="doc-hero-title-row">
          <h1 class="doc-hero-title">产品需求v2（阶段1落地版）</h1>
          <span class="doc-hero-version">v2.1-phase1</span>
          <span class="doc-hero-date">2026-06-06</span>
        </div>
        <p class="doc-hero-tip">💡 基于 v2 完整版裁剪的开发资源可控版本：模块化升级 + 常乐豆 + 负工资 + 多轮报税；福利保障数据<strong>取老系统</strong>，商业险采用<strong>默认机制</strong></p>
      </div>
      <div class="doc-hero-actions">
        <el-button @click="copyToClipboard">复制</el-button>
        <el-button type="primary" @click="exportToPdf">导出 PDF</el-button>
      </div>
    </div>

    <div class="content-section">
      <!-- 版本日志 -->
      <div id="version" class="section version-log">
        <h3>核心调整</h3>

        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 80px;">版本</th>
              <th style="width: 110px;">日期</th>
              <th style="width: 90px;">类别</th>
              <th>变更说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowspan="7"><strong>v2.1<br/>phase1</strong></td>
              <td rowspan="7">2026-06-06</td>
              <td><span style="color: hsl(var(--primary)); font-weight: 600;">新增</span></td>
              <td><strong>模块化薪酬（4 种用工类型）</strong>：劳动合同-全日制 / 劳务协议-非全日制 / 劳务合作-兼职 / 劳务合作-退休返聘；按用工类型独立岗位薪酬模板</td>
            </tr>
            <tr>
              <td><span style="color: hsl(var(--primary)); font-weight: 600;">新增</span></td>
              <td><strong>常乐豆规则（全部保留）</strong>：仅全职享有；<strong>只抵扣公积金</strong>（公司部分 + 个人部分），<strong>不抵扣社保/商业险</strong>；4 级优先级——① 抵公积金公司部分 → ② 抵公积金个人部分 → ③ 现金补扣【公积金个人扣款】 → ④ 消费；<strong>不计入应税收入</strong></td>
            </tr>
            <tr>
              <td><span style="color: hsl(var(--primary)); font-weight: 600;">新增</span></td>
              <td><strong>【公积金个人扣款】动态项</strong>：常乐豆余额不足以抵扣公积金个人部分时，从工资单<strong>现金</strong>扣减；仅全职可触发</td>
            </tr>
            <tr>
              <td><span style="color: hsl(var(--primary)); font-weight: 600;">新增</span></td>
              <td><strong>负工资模块</strong>：独立余额；工资条应发 &gt; 0 时抵扣；离职时按规则处理；负数累加到余额</td>
            </tr>
            <tr>
              <td><span style="color: hsl(var(--primary)); font-weight: 600;">新增</span></td>
              <td><strong>多轮报税逻辑</strong>：1 门店 = 1 主体；非全日制/兼职 每周预扣 3% + 月末汇算；兼职<strong>多主体倒序申报</strong>（应税大者先报，每主体 1 次调百旺，可能跳档）；补缴/退税归入该主体最后一条工资条</td>
            </tr>
            <tr>
              <td><span style="color: hsl(var(--warning)); font-weight: 600;">裁剪</span></td>
              <td><strong>福利保障数据 → 取老系统</strong>：社保（全）/ 社保（仅工伤）/ 公积金的<strong>个人部分金额</strong>通过老系统接口<strong>只读引用</strong>；新系统<strong>不维护</strong>城市基准系数、不生成月度流水、不做 Override 机制</td>
            </tr>
            <tr>
              <td><span style="color: hsl(var(--warning)); font-weight: 600;">裁剪</span></td>
              <td><strong>商业险 → 默认机制</strong>：<strong>不开发</strong>商业险库配置页、不做城市/险种选择；全员默认有 1 份商业险（具体险种后台硬编码），公司全额，<strong>不进员工工资条</strong>，<strong>不显示在福利明细</strong></td>
            </tr>
          </tbody>
        </table>

        <div class="callout" style="background: hsl(var(--warning) / 0.08); border-left: 3px solid hsl(var(--warning)); padding: 10px 12px; margin-top: 8px; font-size: 13px; border-radius: 4px;">
          <strong>⚠️ 全局说明：1 门店 = 1 主体</strong>——全职/返聘 1 个合同主体 = 入职门店（不能挂店）；非全日制/兼职 可在 N 个门店服务 → 归属 N 个主体（按门店分别结算、申报个税、发放工资）。
        </div>

        <h3>要点</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 200px;">主题</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>四种用工类型</strong></td>
              <td><strong>全职（劳动合同）</strong>、<strong>非全日制（劳务协议）</strong>、<strong>兼职（劳务合作）</strong>、<strong>返聘（劳务合作-退休返聘）</strong></td>
            </tr>
            <tr>
              <td><strong>常乐豆适用范围</strong></td>
              <td><strong>仅全职</strong>享有，<strong>不参与薪资计算</strong>（不计入应税收入），离职时余额全部提现</td>
            </tr>
            <tr>
              <td><strong>常乐豆使用优先级</strong></td>
              <td>① 抵<strong>公积金公司部分</strong> → ② 抵<strong>公积金个人部分</strong> → ③ 现金补扣【公积金个人扣款】 → ④ 消费（<strong>只抵扣公积金</strong>，不抵扣社保/商业险）</td>
            </tr>
            <tr>
              <td><strong>福利保障数据来源</strong></td>
              <td>社保/公积金个人部分 ← <strong>老系统接口（只读）</strong>；商业险 ← <strong>默认机制</strong>（后台硬编码，不进工资条）；不开发员工福利保障页</td>
            </tr>
            <tr>
              <td><strong>商业险（默认机制）</strong></td>
              <td>公司全额、<strong>不参与工资计算</strong>、<strong>不进员工工资条</strong>、<strong>不显示在福利明细</strong>；具体险种/保额/保费由后端配置</td>
            </tr>
            <tr>
              <td><strong>工资条分组</strong></td>
              <td>按<strong>发放主体</strong>分组——全职/返聘=合同主体（1个），非全日制/兼职=业绩归属主体（多）</td>
            </tr>
            <tr>
              <td><strong>多轮报税</strong></td>
              <td>非全日制/兼职：每周预扣 3% + 月末汇算（百旺）；兼职多主体倒序申报；补缴/退税归入该主体最后一条工资条，<strong>不单独生成汇算工资条</strong></td>
            </tr>
            <tr>
              <td><strong>负工资</strong></td>
              <td>工资条<strong>应发 &gt; 0</strong> 时触发抵扣；应发 ≤ 0 时负数累加到余额；<strong>不参与应税收入</strong>；离职时按规则处理</td>
            </tr>
            <tr>
              <td><strong>移动端薪酬看板</strong></td>
              <td>2 个独立看板：<strong>全职薪酬看板</strong>（3 tabs：日/月/到账，含【公积金个人扣款】+【公积金】块）vs <strong>非全日制薪酬看板</strong>（4 tabs：日/周/月/到账，4 个分类筛选 + 回头客标记 + 多门店切换）</td>
            </tr>
            <tr>
              <td><strong>通知（含门店 / 主体）</strong></td>
              <td>移动端通知列表显示<strong>门店</strong>，详情汇总显示<strong>发薪门店 + 发薪主体</strong>，让员工清楚每条通知的资金来源</td>
            </tr>
            <tr>
              <td><strong>排班</strong></td>
              <td>时长由排班环节控制，薪酬系统只做说明</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 阅读提示 -->
      <div class="section" style="margin-top: 24px;">
        <div class="card" style="background: hsl(var(--primary) / 0.08); border: 1px solid hsl(var(--primary) / 0.3);">
          <h3 style="margin-bottom: 12px; color: hsl(var(--primary));">📖 阅读提示</h3>
          <div style="font-size: 13px; line-height: 1.8;">
            本文档基于 <strong>v2 完整版</strong> 裁剪而来，仅包含阶段 1 实际要开发的内容。<br/>
            · 本文档中关于"几个工资条"、"每月N次"、"每主体1个"等具体数字<strong>均为示例</strong>，用于说明典型业务场景<br/>
            · 实际系统中，<strong>计算周期、工资单/工资条数量、薪酬项组合等均支持灵活配置</strong>——业务方可按用工类型、岗位、城市、合规要求等维度自由组合<br/>
            · 涉及<strong>老系统接口</strong>部分（社保/公积金/个税），具体接口契约待与老系统团队对齐；本文档仅明确<strong>调用边界与数据用途</strong>
          </div>
        </div>
      </div>

      <!-- 名词解释 -->
      <div id="terms" class="section" style="margin-top: 24px;">
        <div class="card" style="background: hsl(var(--muted) / 0.3);">
          <h3 style="margin-bottom: 12px;">名词解释</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 180px;">术语</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>负工资</strong></td>
                <td>员工历史结算周期欠公司的款项，记录在独立余额中，只有应发 &gt; 0 时才能抵扣</td>
              </tr>
              <tr>
                <td><strong>应税收入</strong></td>
                <td><strong>第1级收入 + 第2级收入 - 第1级扣款 - 第2级扣款（非预扣）</strong>，即提交报税的收入基数（详见「应税收入计算规则」）。注意：<strong>第2级扣款（个税预扣）不参与应税收入</strong>（预扣是<strong>真正的个税</strong>，仅用于个税汇算；预扣所在工资条已发放，不可回溯修改）</td>
              </tr>
              <tr>
                <td><strong>预扣个税</strong></td>
                <td>非全日制/兼职每周工资条预扣3%，公式 = 应税收入 × 3%，累计作为已预扣合计。预扣是<strong>税的预付</strong>，不是收入的一部分</td>
              </tr>
              <tr>
                <td><strong>代扣个税汇算</strong></td>
                <td>月末百旺服务基于<strong>累计应税收入</strong>（Σ各工资条应税收入）计算<strong>实际税额</strong>，与<strong>已预扣合计</strong>比较，多退少补；结果作为<strong>当月最后一条工资条</strong>的一个扣缴/收入项（补缴/退税）出现，不单独生成"汇算工资条"</td>
              </tr>
              <tr>
                <td><strong>社保（个人部分）</strong></td>
                <td>员工个人承担部分（养老/医疗/失业/工伤/生育）；<strong>v2-1 阶段</strong>金额由<strong>老系统接口</strong>提供，新系统<strong>只读引用</strong>作为工资条代扣项</td>
              </tr>
              <tr>
                <td><strong>公积金（个人部分）</strong></td>
                <td>员工个人承担部分；<strong>v2-1 阶段</strong>金额由<strong>老系统接口</strong>提供，新系统<strong>只读引用</strong>作为工资条代扣项；可被<strong>常乐豆</strong>优先抵扣</td>
              </tr>
              <tr>
                <td><strong>商业险（默认机制）</strong></td>
                <td>v2-1 不开发商业险库配置页、不做城市/险种选择；全员默认有 1 份商业险（具体险种/保额/保费由后端硬编码）；公司全额，<strong>不进员工工资条</strong>，<strong>不显示在福利明细</strong></td>
              </tr>
              <tr>
                <td><strong>门店</strong></td>
                <td>员工实际产生业绩的物理经营单位，<strong>1 门店 = 1 主体</strong>（详见「全局说明」）</td>
              </tr>
              <tr>
                <td><strong>合同主体</strong></td>
                <td>员工签署劳动合同/劳务协议/劳务合作的主体公司，全职/返聘员工仅 1 个合同主体（不能挂店）</td>
              </tr>
              <tr>
                <td><strong>业绩归属主体</strong></td>
                <td>员工实际产生业绩的归属门店对应的法人主体。<strong>1 门店 = 1 主体</strong>（详见「全局说明」）。全职/返聘员工 1 个合同主体（= 业绩归属主体）；非全日制/兼职可在 N 个门店服务 → 归属 N 个主体，每个主体独立结算并生成工资条</td>
              </tr>
              <tr>
                <td><strong>百旺服务</strong></td>
                <td>第三方税务服务，能根据应税收入获得应纳个税。v2-1 阶段全职/返聘 1 次/月，非全日制/兼职 N 次/月（多主体每主体 1 次，可能跳档）</td>
              </tr>
              <tr>
                <td><strong>【公积金个人扣款】</strong></td>
                <td>动态补扣项——常乐豆不足以抵扣公积金个人部分时，从工资单现金扣减；<strong>仅全职</strong>可触发（其他用工类型无公积金或无常乐豆）</td>
              </tr>
              <tr>
                <td><strong>营销折扣获豆 / 回头客补贴</strong></td>
                <td>以常乐豆形式发放，<strong>仅全职推拿师 Lv3 以下员工</strong>享有；非全日制/兼职/返聘<strong>均无任何常乐豆</strong>（与 Lv 等级无关，仅与用工类型相关）</td>
              </tr>
              <tr>
                <td><strong>负数累加</strong></td>
                <td>工资条应发为负时，负数累加到负工资余额，不交个税、不抵扣负工资</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 应税收入计算规则（正式定义） -->
      <div id="taxable-income-rule" class="section" style="margin-top: 24px;">
        <h2>应税收入计算规则（正式定义）</h2>
        <p>本节给出 v2-1 系统中"应税收入"的<strong>正式公式与边界规则</strong>，作为工资条、个税计算、汇算等所有环节的口径基准。</p>

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
            <strong>注：</strong>当前 v2-1 设计中，第 2 级扣款最典型的是"个税预扣 3%"，但若未来新增其他第 2 级扣款项（如质量扣款），<strong>默认均应纳入应税收入</strong>，<strong>唯独"个税预扣"例外排除</strong>（理由见下节）
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
                <td><strong>个税申报时不需要传</strong>，税局自动减除（不是我们的应税收入输入项）</td>
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
                <td>在职时仅可用于消费，不可提现；离职时可在<strong>常乐豆账户体系</strong>内操作提现</td>
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

      <!-- 一、整体概述 -->
      <div id="summary" class="section">
        <h2>一、整体概述</h2>

        <!-- 核心流程（9 步全链路） -->
        <div class="card architecture-card">
          <h2>核心流程（端到端全链路）</h2>
          <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary)); margin-bottom: 16px; font-size: 13px;">
            <strong>宏观全链路：</strong>1.<s>定义岗位</s> <strong>本阶段跳过（走老系统）</strong> → 2.配置岗位薪酬模板 → 3.发放策略配置 → 4.<s>招聘入职</s> <strong>本阶段跳过（走老系统）</strong> → 5.<s>员工福利保障关系建立</s> <strong>本阶段跳过</strong> → 6.薪酬计算 → 7.<s>员工福利保障月度明细生成</s> <strong>改从老系统接口读取 + 升级计算（公积金抵扣 / 多主体报税）</strong> → 8.工资条生成 → 9.工资发放（<strong>通知确认 → 付款单 → 银行打款</strong>）<br/>
            <strong>阶段划分：</strong>① 配置阶段（步骤 2-3，HR 配置规则） ② 触发阶段（步骤 1、4、5 全部走老系统） ③ 执行阶段（步骤 6-9，每结算周期：计算收入 → 老系统读取<strong>社保</strong> + 升级计算<strong>公积金抵扣（全职）</strong> / <strong>多主体倒序报税（非全日制/兼职）</strong> → 生成工资条 → <strong>通知确认 + 付款单 + 发放</strong>）
          </div>

          <div class="architecture-diagram">
            <!-- 步骤1：定义岗位（v2-1 跳过） -->
            <div class="arch-layer" style="opacity: 0.5;">
              <div class="arch-layer-title">1. ~~定义岗位~~ <span style="font-size: 12px; font-weight: 400; color: hsl(var(--warning));">— v2-1 跳过（走老系统）</span></div>
              <div style="font-size: 13px; line-height: 1.8; text-align: left;">
                <div style="padding: 8px 10px; background: hsl(var(--warning) / 0.05); border: 1px solid hsl(var(--warning) / 0.2); border-radius: 4px;">
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); line-height: 1.8;">
                    <strong>v2 完整版：</strong>HR 在新系统创建岗位基础信息（岗位名称 / 归属部门 / 归属城市 / 用工类型）<br/>
                    <strong>v2-1 阶段：</strong><span style="color: hsl(var(--warning)); font-weight: 600;">不实现</span>——薪酬计算时从<strong>老系统导入人员信息和岗位关联</strong>，本系统不重做岗位维护
                  </div>
                </div>
              </div>
            </div>
            <div class="arch-arrow">↓</div>
            <!-- 步骤2：配置岗位薪酬模板 -->
            <div class="arch-layer">
              <div class="arch-layer-title">2. 配置岗位薪酬模板 <span style="font-size: 12px; font-weight: 400; color: hsl(var(--muted-foreground));">— 薪酬项设计 + 系统项</span></div>
              <div style="font-size: 13px; line-height: 1.8; text-align: left;">
                <div style="margin-bottom: 8px; padding: 8px 10px; background: hsl(var(--background)); border-radius: 4px;">
                  <div style="font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 6px;">全职模板（劳动合同，单一主体）</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); margin-bottom: 4px;">第1级：计件提成、超产值奖金、超时加班费、投诉扣款</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); margin-bottom: 4px;">第2级：保底获豆</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground));">系统项：<strong>代扣社保（金额从老系统接口读取）</strong>｜<strong>代扣公积金（老系统读取 + 常乐豆抵扣升级：剩余部分记为【公积金个人扣款】）</strong>｜代扣个税（综合所得月度累计预扣）</div>
                </div>
                <div style="margin-bottom: 8px; padding: 8px 10px; background: hsl(var(--primary) / 0.05); border: 1px solid hsl(var(--primary) / 0.15); border-radius: 4px;">
                  <div style="font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 6px;">非全日制模板（劳务协议，多主体）</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); margin-bottom: 4px;">第1级：计件提成、超时加班费、投诉扣款</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); margin-bottom: 4px;">第2级：个税预扣（每条 3%）</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground));">系统项：代扣个税（月末汇算）｜商业险（默认机制，<strong>不进工资条</strong>）</div>
                </div>
                <div style="padding: 8px 10px; background: hsl(var(--primary) / 0.08); border: 1px solid hsl(var(--primary) / 0.25); border-radius: 4px;">
                  <div style="font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 6px;">兼职模板（劳务合作，多主体）</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); margin-bottom: 4px;">第1级：计件提成、超时加班费、投诉扣款</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); margin-bottom: 4px;">第2级：个税预扣（每条 3%）</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground));">系统项：代扣个税（月末汇算，<strong>多主体倒序申报</strong>）｜商业险（默认机制，<strong>不进工资条</strong>）</div>
                </div>
              </div>
            </div>
            <div class="arch-arrow">↓</div>
            <!-- 步骤3：发放策略配置 -->
            <div class="arch-layer">
              <div class="arch-layer-title">3. 发放策略配置 <span style="font-size: 12px; font-weight: 400; color: hsl(var(--muted-foreground));">— 工资单定义</span></div>
              <div style="font-size: 13px; line-height: 1.8; text-align: left;">
                <div style="padding: 8px 10px; background: hsl(var(--background)); border-radius: 4px;">
                  <div style="margin-bottom: 6px;"><strong>全职 / 返聘</strong>：每月1次结算，月度N个工资条（示例：3个）｜<strong>单一主体</strong>｜<strong>月度申报</strong></div>
                  <div style="margin-bottom: 6px;"><strong>非全日制 / 兼职</strong>：结算周期可配（示例：周薪制，间隔 ≤15天）｜<strong>每主体独立结算</strong>｜<strong>每周预扣 3%，月末汇算</strong>｜兼职多主体倒序申报</div>
                  <div style="font-size: 12px; color: hsl(var(--primary));">
                    <strong>关键：</strong>每个发放主体（全职/返聘=合同主体，非全日制/兼职=业绩归属主体）下的工资分别发放
                  </div>
                </div>
              </div>
            </div>
            <div class="arch-arrow">↓</div>
            <!-- 步骤4：招聘入职（v2-1 跳过） -->
            <div class="arch-layer" style="opacity: 0.5;">
              <div class="arch-layer-title">4. ~~招聘入职~~ <span style="font-size: 12px; font-weight: 400; color: hsl(var(--warning));">— v2-1 跳过（走老系统）</span></div>
              <div style="font-size: 13px; line-height: 1.8; text-align: left;">
                <div style="padding: 8px 10px; background: hsl(var(--warning) / 0.05); border: 1px solid hsl(var(--warning) / 0.2); border-radius: 4px;">
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); line-height: 1.8;">
                    <strong>v2 完整版：</strong>员工分配到岗位 → 岗位城市确定 → 自动绑定薪酬模板<br/>
                    <strong>v2-1 阶段：</strong><span style="color: hsl(var(--warning)); font-weight: 600;">不实现</span>——招聘入职环节走<strong>老系统</strong>，本系统只负责在薪酬计算时按老系统导入的人员/岗位关联自动应用模板
                  </div>
                </div>
              </div>
            </div>
            <div class="arch-arrow">↓</div>
            <!-- 步骤5：v2-1 跳过 -->
            <div class="arch-layer" style="opacity: 0.5;">
              <div class="arch-layer-title">5. ~~员工福利保障关系建立~~ <span style="font-size: 12px; font-weight: 400; color: hsl(var(--warning));">— v2-1 跳过（无福利关系维护）</span></div>
              <div style="font-size: 13px; line-height: 1.8; text-align: left;">
                <div style="padding: 8px 10px; background: hsl(var(--warning) / 0.05); border: 1px solid hsl(var(--warning) / 0.2); border-radius: 4px;">
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); line-height: 1.8;">
                    <strong>v2 完整版：</strong>入职触发员工 ↔ 申报主体关系建立（继承城市基准系数）<br/>
                    <strong>v2-1 阶段：</strong><span style="color: hsl(var(--warning)); font-weight: 600;">不实现</span>——城市基准系数由老系统维护，本系统不重做
                  </div>
                </div>
              </div>
            </div>
            <div class="arch-arrow">↓</div>
            <!-- 步骤6：薪酬计算 -->
            <div class="arch-layer">
              <div class="arch-layer-title">6. 薪酬计算 <span style="font-size: 12px; font-weight: 400; color: hsl(var(--muted-foreground));">— 计算应发收入（代扣金额在 step 7 读取老系统）</span></div>
              <div style="font-size: 13px; line-height: 1.8; text-align: left;">
                <div style="margin-bottom: 6px; padding-left: 10px; border-left: 3px solid hsl(var(--primary));">
                  <span style="font-weight: 700;">第1级</span> <span style="font-size: 12px; color: hsl(var(--muted-foreground));">— 基础收入/扣缴：</span>计件提成、超产值奖金、超时加班费、投诉扣款
                </div>
                <div style="margin-bottom: 6px; padding-left: 10px; border-left: 3px solid hsl(var(--primary));">
                  <span style="font-weight: 700;">第2级</span> <span style="font-size: 12px; color: hsl(var(--muted-foreground));">— 补充项，依赖第1级：</span>保底获豆（全职）｜个税预扣（非全日制/兼职，每条 3%）
                </div>
                <div style="padding: 6px 10px; border-left: 3px solid hsl(var(--primary) / 0.5); background: hsl(var(--primary) / 0.05); border-radius: 4px; font-size: 13px;">
                  <span style="font-weight: 700; color: hsl(var(--primary));">输出：</span>当月<strong>应发收入合计</strong>确定 → 触发 step 7 读取老系统代扣金额<br/>
                  <span style="font-size: 12px; color: hsl(var(--muted-foreground));">注：代扣金额（社保/公积金/个税）在 step 7 确定，step 6 仅算应发收入</span>
                </div>
              </div>
            </div>
            <div class="arch-arrow">↓</div>
            <!-- 步骤7：读取老系统代扣金额 + 升级计算 -->
            <div class="arch-layer" style="background: hsl(var(--warning) / 0.05); border-color: hsl(var(--warning) / 0.3);">
              <div class="arch-layer-title">7. 读取老系统代扣金额 + 升级计算 <span style="font-size: 12px; font-weight: 400; color: hsl(var(--warning));">— 替代原"福利明细生成"</span></div>
              <div style="font-size: 13px; line-height: 1.8; text-align: left;">
                <div style="margin-bottom: 8px; padding: 8px 10px; background: hsl(var(--background)); border-radius: 4px;">
                  <div style="font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 6px;">① 触发条件</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); line-height: 1.8;">
                    step 6 完成，月度应发收入确定 → 进入"代扣金额确认 + 报税升级"环节
                  </div>
                </div>
                <div style="margin-bottom: 8px; padding: 8px 10px; background: hsl(var(--warning) / 0.05); border: 1px solid hsl(var(--warning) / 0.15); border-radius: 4px;">
                  <div style="font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 6px;">② 老系统接口（只读，<span style="color: hsl(var(--warning));">不进系统计算</span>）</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); line-height: 1.8;">
                    · <strong>代扣社保</strong>（全职）— 来自老系统接口，<strong>原样透传</strong>到工资条<br/>
                    · <strong>代扣公积金</strong>（全职）— 来自老系统接口，作为<strong>基数</strong>进入③升级计算<br/>
                    · <strong>不读取</strong>社保/公积金公司部分（不进员工工资条）<br/>
                    · <strong>不读取</strong>城市基准系数、社保缴费明细、商业险明细
                  </div>
                </div>
                <div style="padding: 8px 10px; background: hsl(var(--primary) / 0.05); border: 1px solid hsl(var(--primary) / 0.2); border-radius: 4px;">
                  <div style="font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 6px;">③ 系统升级计算（<span style="color: hsl(var(--primary));">v2-1 核心新增</span>）</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); line-height: 1.8;">
                    · <strong>公积金抵扣升级</strong>（全职）：常乐豆优先抵扣公积金个人部分 → 剩余部分在工资条记为【<strong>公积金个人扣款</strong>】（与代扣公积金个人部分等同，不参与应税收入）<br/>
                    · <strong>全职工种个税累计预扣</strong>：<strong>系统按公式</strong>（综合所得月度累计预扣法：当月应纳税所得额 × 税率 - 速算扣除数 - 累计已预扣）计算<br/>
                    · <strong>非全日制 / 兼职个税</strong>：每条 3% 预扣（系统按规则，来自 step 6 第2级）+ 月末汇算（<strong>百旺服务返回</strong>实际税额 → 多退少补）<br/>
                    · <strong>兼职多主体报税升级</strong>：跨多主体的员工，<strong>按业绩归属主体倒序依次调用百旺申报</strong>（百旺 1 次仅支持 1 主体），每主体 1 次调用
                  </div>
                </div>
              </div>
            </div>
            <div class="arch-arrow">↓</div>
            <!-- 步骤8：工资条生成 -->
            <div class="arch-layer">
              <div class="arch-layer-title">8. 工资条生成 <span style="font-size: 12px; font-weight: 400; color: hsl(var(--muted-foreground));">— 全部金额就绪 → 应发 - 代扣 = 实发 → 发放</span></div>
              <div style="font-size: 13px; line-height: 1.8; text-align: left;">
                <div style="margin-bottom: 6px; padding: 6px 10px; background: hsl(var(--background)); border-radius: 4px;">
                  <span style="font-weight: 600;">全职工资条 1~N</span> <span style="font-size: 12px; color: hsl(var(--muted-foreground));">— 基础项 + 第2级 + <strong>福利代扣（社保/公积金，老系统读取）</strong> + 个税代扣（汇算后） + 负工资抵扣</span>
                </div>
                <div style="margin-bottom: 6px; padding: 6px 10px; background: hsl(var(--background)); border-radius: 4px;">
                  <span style="font-weight: 600;">非全日制/兼职周工资条 1~N</span> <span style="font-size: 12px; color: hsl(var(--muted-foreground));">— 基础项 + 个税预扣（3%）+ 负工资抵扣</span>
                </div>
                <div style="padding: 6px 10px; background: hsl(var(--primary) / 0.08); border: 1px solid hsl(var(--primary) / 0.2); border-radius: 4px;">
                  <span style="font-weight: 600;">非全日制/兼职月内最后一条工资条</span> <span style="font-size: 12px; color: hsl(var(--muted-foreground));">— 基础项 + 个税预扣 + <strong>个税补缴/退税</strong>（汇算结果作为本条工资条的一项，<strong>不单独生成汇算工资条</strong>）</span>
                </div>
              </div>
            </div>
            <div class="arch-arrow">↓</div>
            <!-- 步骤9：工资发放 -->
            <div class="arch-layer">
              <div class="arch-layer-title">9. 工资发放 <span style="font-size: 12px; font-weight: 400; color: hsl(var(--muted-foreground));">— 通知确认 → 付款单 → 银行打款</span></div>
              <div style="font-size: 13px; line-height: 1.8; text-align: left;">
                <div style="margin-bottom: 8px; padding: 8px 12px; background: hsl(var(--background)); border-radius: 4px;">
                  <span style="font-weight: 600;">① 发放通知单</span> <span style="font-size: 12px; color: hsl(var(--muted-foreground));">— 按工资单批次汇总所有工资条 → 通知员工 <strong>待确认</strong>，截止时间前员工需确认（有问题反馈 HR）；<strong>确认后次日发放</strong></span>
                </div>
                <div style="margin-bottom: 8px; padding: 8px 12px; background: hsl(var(--background)); border-radius: 4px;">
                  <span style="font-weight: 600;">② 付款单生成</span> <span style="font-size: 12px; color: hsl(var(--muted-foreground));">— 在工资单 <strong>应发金额 &gt; 0</strong> 的工资条范围内按<strong>去重维度</strong>聚合；记录字段：<strong>银行实发金额</strong>（数据完整性用），实际打款仍按实发执行</span>
                </div>
                <div style="padding: 8px 12px; background: hsl(var(--primary) / 0.08); border: 1px solid hsl(var(--primary) / 0.2); border-radius: 4px;">
                  <span style="font-weight: 600;">③ 付款单去重维度（5 字段）</span>
                </div>
                <table class="data-table" style="margin: 8px 0 8px 16px; width: calc(100% - 16px); font-size: 12px;">
                  <thead>
                    <tr>
                      <th style="width: 180px;">字段</th>
                      <th>说明</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>姓名</strong></td>
                      <td>员工姓名</td>
                    </tr>
                    <tr>
                      <td><strong>工号</strong></td>
                      <td>员工唯一编号</td>
                    </tr>
                    <tr>
                      <td><strong>工资批次</strong></td>
                      <td>工资单 / 发放通知单号</td>
                    </tr>
                    <tr>
                      <td><strong>合同主体</strong></td>
                      <td>1 门店 = 1 主体；兼职跨多门店时，<strong>每主体 1 条付款单</strong></td>
                    </tr>
                    <tr>
                      <td><strong>薪酬周期</strong></td>
                      <td><strong>自然日期范围</strong>（如 <code>2026-06-01 ~ 2026-06-30</code> / <code>2026-06-01 ~ 2026-06-07</code>），按需指定月/周/旬/半月等</td>
                    </tr>
                  </tbody>
                </table>
                <div style="padding: 8px 12px; background: hsl(var(--background)); border-radius: 4px;">
                  <span style="font-weight: 600;">④ 付款单聚合规则</span>
                </div>
                <ul style="margin: 4px 0 0 16px; font-size: 12px; line-height: 1.8;">
                  <li><strong>1 工资条 = 1 付款单单元</strong>：同一员工同主体同周期内只有 1 个工资条（业务侧控制），无需合并多条工资条</li>
                  <li><strong>应发 ≤ 0 不生成付款单</strong>：应付金额 ≤ 0 的工资条不参与付款（不发钱），例如某员工某周业绩为 0；遇特殊情况按周期正常计算，但<strong>应发 ≤ 0 时不生成付款单</strong>（不发）</li>
                  <li><strong>记录银行实发金额</strong>：付款单字段记录「银行最终实发金额」用于数据完整性核账（如手续费、银行扣减等差异），业务上仍以实发为打款金额</li>
                  <li><strong>个税补退跟随</strong>：个税汇算后的补缴 / 退税已合并到<strong>当月（当周期）最后 1 条工资条</strong>的应发金额中，<strong>不单独生成付款单</strong>，跟随后续正常付款流程</li>
                </ul>
                <div style="padding: 8px 12px; background: hsl(var(--background)); border-radius: 4px;">
                  <span style="font-weight: 600;">⑤ 典型付款单数量示例</span>
                </div>
                <table class="data-table" style="margin: 8px 0 0 16px; width: calc(100% - 16px); font-size: 12px;">
                  <thead>
                    <tr>
                      <th>用工类型</th>
                      <th>主体数</th>
                      <th>周期数</th>
                      <th>月付款单数（示例）</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>全职 / 返聘</td>
                      <td>1</td>
                      <td>1（月）</td>
                      <td><strong>1 条</strong>（如 N 个工资条中 1 条应发 &gt; 0，则只生成 1 条付款单；其余并入或不发）</td>
                    </tr>
                    <tr>
                      <td>非全日制（单店）</td>
                      <td>1</td>
                      <td>4~5（周）</td>
                      <td><strong>4~5 条</strong>（每周 1 条；应发 ≤ 0 的周不生成）</td>
                    </tr>
                    <tr>
                      <td>兼职（多店）</td>
                      <td>N（= 服务门店数）</td>
                      <td>4~5（周）</td>
                      <td><strong>N × 4~5 条</strong>（每主体每周 1 条）</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h3>计算周期</h3>
          <div class="note" style="background: hsl(var(--muted) / 0.3); margin-bottom: 12px;">
            <strong>说明：</strong>下表中的"计算周期"和"工资条数量"为典型示例，实际可通过工资单配置灵活调整（可配置日/周/旬/月等不同周期、任意数量工资条）
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>类型</th>
                <th>计算周期（示例）</th>
                <th>工资条数量（示例）</th>
                <th>个税申报</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>非全日制（劳务协议）</td>
                <td>每周1次</td>
                <td>每主体N个工资条/次（示例：1个）</td>
                <td>每周预扣3%，月末汇算</td>
              </tr>
              <tr>
                <td>兼职（劳务合作）</td>
                <td>每周1次</td>
                <td>每主体N个工资条/次（示例：1个）</td>
                <td>每周预扣3%，月末汇算，多主体（1门店=1主体）倒序申报</td>
              </tr>
              <tr>
                <td>全职（劳动合同）</td>
                <td>每月1次</td>
                <td>N个工资条/月（示例：3个）</td>
                <td>月度申报</td>
              </tr>
              <tr>
                <td>返聘（劳务合作-退休返聘）</td>
                <td>每月1次</td>
                <td>N个工资条/月（示例：1个）</td>
                <td>月度申报</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card">
          <h3>计算层级</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>层级</th>
                <th>说明</th>
                <th>计算时机</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>第1级</td>
                <td>基础收入项和扣缴项</td>
                <td>每工资条计算</td>
              </tr>
              <tr>
                <td>第2级</td>
                <td>补充项，依赖第1级结果：保底获豆（全职）/ 个税预扣（非全日制、兼职，3%）</td>
                <td>每工资条计算</td>
              </tr>
              <tr>
                <td>系统项</td>
                <td>代扣社保/公积金（老系统接口读取）、代扣个税（汇算，月度）</td>
                <td>第1/2级完成后执行，每月只计算一次（示例）</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card">
          <h3>负工资抵扣</h3>
          <p>负工资是员工在历史结算周期中欠公司的款项，记录在独立的负工资余额中。</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>项目</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>触发条件</td>
                <td>工资条应发金额 &gt; 0（只有正数才能抵扣负工资余额）</td>
              </tr>
              <tr>
                <td>抵扣来源</td>
                <td>员工独立的负工资余额</td>
              </tr>
              <tr>
                <td>抵扣优先级</td>
                <td>
                  工资条：收入 → 扣缴项 → 代扣社保（老系统） → 代扣公积金（老系统） → 代扣个税 → 有剩余 → 抵扣负工资余额<br/>
                  <span style="color: hsl(var(--muted-foreground)); font-size: 12px;">注：个税由百旺基于应税收入（第1级+第2级收入 - 第1级扣款 - 第2级扣款非预扣，详见「应税收入计算规则」）独立计算；社保/公积金个人部分、个税预扣均<strong>不参与</strong>应税收入（社保/公积金因个税申报时税局自动减除，个税预扣是真正的个税）</span>
                </td>
              </tr>
              <tr>
                <td>离职正式员工</td>
                <td>优先使用常乐豆（<strong>只抵扣公积金</strong>）：① 抵<strong>公积金公司部分</strong> → ② 抵<strong>公积金个人部分</strong> → ③ 不够时从对应工资单<strong>现金</strong>扣【公积金个人扣款】；最终剩余常乐豆全部提现</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>说明：</strong>负工资抵扣是每个工资条都可能触发的特殊项，当工资条应发 &gt; 0 且存在负工资余额时，自动生成抵扣项
          </div>
        </div>
      </div>

      <!-- 二、福利数据来源（老系统） -->
      <div id="welfare-data-source" class="section">
        <h2>二、福利数据来源（老系统）</h2>
        <div class="note" style="background: hsl(var(--warning) / 0.08); border-left: 3px solid hsl(var(--warning)); padding: 10px 12px; margin-bottom: 16px; font-size: 13px; border-radius: 4px;">
          <strong>⚠️ 阶段1 关键裁剪：</strong>v2 完整版中独立的【员工福利保障】模块在 v2-1 阶段<strong>整体不开发</strong>。本节明确说明福利数据<strong>从哪来</strong>、<strong>不开发什么</strong>、<strong>商业险怎么处理</strong>。
        </div>

        <!-- 1. 各类型福利数据来源总览 -->
        <div class="card">
          <h3>① 各类型福利数据来源（v2-1 一览）</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>福利类型</th>
                <th>数据来源</th>
                <th>本系统使用方式</th>
                <th>对应工资条项</th>
                <th>适用对象</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>社保（全）</strong><br/>个人部分</td>
                <td><strong>老系统接口（只读）</strong></td>
                <td>每结算周期调用接口读取</td>
                <td>代扣社保（金额 = 老系统返回值）</td>
                <td>全职</td>
              </tr>
              <tr>
                <td><strong>社保（仅工伤）</strong><br/>个人部分</td>
                <td><strong>老系统接口（只读）</strong></td>
                <td>每结算周期调用接口读取</td>
                <td>—（<strong>不进入员工工资条</strong>，公司全额承担）</td>
                <td>非全日制</td>
              </tr>
              <tr>
                <td><strong>公积金</strong><br/>个人部分</td>
                <td><strong>老系统接口（只读）</strong></td>
                <td>每结算周期调用接口读取；可被常乐豆优先抵扣</td>
                <td>代扣公积金（金额 = 老系统返回值 - 常乐豆抵扣）</td>
                <td>全职</td>
              </tr>
              <tr>
                <td><strong>个税</strong></td>
                <td><strong>老系统（基础）+ 百旺服务（多轮）</strong></td>
                <td>· 全职/返聘：百旺 1 次/月<br/>· 非全日制/兼职：每周预扣 3%（系统自算）+ 月末按主体调百旺（多主体倒序）</td>
                <td>· 代扣个税（全职/返聘）<br/>· 预扣个税 + 补缴/退税（非全日制/兼职）</td>
                <td>全员</td>
              </tr>
              <tr>
                <td><strong>商业险</strong></td>
                <td><strong>默认机制（不开发配置页）</strong></td>
                <td>全员默认有 1 份商业险（后台硬编码）</td>
                <td>—（<strong>不进员工工资条</strong>，公司全额现金承担）</td>
                <td>全员</td>
              </tr>
              <tr>
                <td><strong>社保/公积金公司部分</strong></td>
                <td>—（本系统不关心）</td>
                <td>由老系统单独记账</td>
                <td>—（<strong>不进员工工资条</strong>，公司成本）</td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>关键结论：</strong>v2-1 阶段本系统<strong>只读取 2 类数据</strong>：① 社保/公积金个人部分金额（来自老系统接口） ② 商业险默认配置（硬编码）；其余福利数据（公司部分、城市基准系数、月度流水、Override 等）<strong>全部由老系统维护</strong>。
          </div>
        </div>

        <!-- 2. 老系统接口契约 -->
        <div class="card" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary));">
          <h3>② 老系统接口契约（占位，待与老系统团队对齐）</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>接口</th>
                <th>入参</th>
                <th>出参</th>
                <th>调用时机</th>
                <th>调用方</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>查询代扣社保</strong></td>
                <td>员工ID + 结算周期</td>
                <td>代扣社保金额（个人部分）</td>
                <td>step 6 应发收入计算完成后</td>
                <td>本系统（工资单计算）</td>
              </tr>
              <tr>
                <td><strong>查询代扣公积金</strong></td>
                <td>员工ID + 结算周期</td>
                <td>代扣公积金金额（个人部分）</td>
                <td>step 6 应发收入计算完成后</td>
                <td>本系统（工资单计算）</td>
              </tr>
              <tr>
                <td><strong>查询申报主体</strong></td>
                <td>员工ID</td>
                <td>合同主体（非全日制/兼职：业绩归属主体列表）</td>
                <td>入职时 + 主体变更时</td>
                <td>本系统（员工管理）</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>⚠️ 待对齐：</strong>具体接口路径、字段格式、错误码、超时策略、幂等性等需与老系统团队在开发前<strong>单独对齐</strong>。本文档仅明确<strong>调用边界与数据用途</strong>。
          </div>
        </div>

        <!-- 3. 商业险默认机制 -->
        <div class="card" style="background: hsl(var(--warning) / 0.05); border-left: 3px solid hsl(var(--warning));">
          <h3>③ 商业险默认机制</h3>
          <p>v2-1 阶段商业险<strong>不开发</strong>商业险库配置页、不做城市/险种选择、不做入职时选商业险流程。采取<strong>默认机制</strong>：</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>维度</th>
                <th>v2-1 处理方式</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>险种</td>
                <td><strong>1 份默认险种</strong></td>
                <td>具体险种/保额/保费由<strong>后端硬编码</strong>，不暴露给用户/HR</td>
              </tr>
              <tr>
                <td>适用对象</td>
                <td>全员（全职/非全日制/兼职/返聘）</td>
                <td>默认全员有 1 份商业险，无需在入职/分配时选择</td>
              </tr>
              <tr>
                <td>城市筛选</td>
                <td><strong>不筛选</strong></td>
                <td>默认险种全国适用</td>
              </tr>
              <tr>
                <td>公司部分金额</td>
                <td>公司全额现金承担</td>
                <td>由老系统/财务单独记账（<strong>不进员工工资条</strong>）</td>
              </tr>
              <tr>
                <td>员工部分金额</td>
                <td>—</td>
                <td>员工<strong>不缴</strong>，<strong>无代扣</strong></td>
              </tr>
              <tr>
                <td>是否进工资条</td>
                <td><strong>否</strong></td>
                <td>不显示任何商业险相关项（含公司部分/个人部分）</td>
              </tr>
              <tr>
                <td>是否显示在福利明细</td>
                <td><strong>否</strong></td>
                <td>v2-1 不开发福利明细页，<strong>完全不可见</strong></td>
              </tr>
              <tr>
                <td>续保提醒</td>
                <td>—</td>
                <td>v2-1 不实现，到期后由业务方手动续保</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>关键：</strong>商业险在 v2-1 阶段对员工/HR/工资条<strong>完全不可见</strong>，是<strong>后端静默处理</strong>的一项公司成本。<strong>未来升级路径</strong>：v2-2 阶段再开发商业险库配置页、入职选商业险流程、月度福利明细、续保提醒等。
          </div>
        </div>

        <!-- 4. v2-1 不开发内容 -->
        <div class="card" style="background: hsl(var(--muted) / 0.3);">
          <h3>④ v2-1 不开发内容（明确排除）</h3>
          <p>以下内容在 v2 完整版中存在，但 v2-1 阶段<strong>不开发</strong>，需明确排除：</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>v2 内容</th>
                <th>v2-1 处理</th>
                <th>理由</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>城市基准系数配置页</td>
                <td><strong>不开发</strong></td>
                <td>由老系统维护，本系统不重做</td>
              </tr>
              <tr>
                <td>员工福利保障页（岗位福利保障）</td>
                <td><strong>不开发</strong></td>
                <td>本系统不维护员工 ↔ 申报主体的福利关系</td>
              </tr>
              <tr>
                <td>Override 机制</td>
                <td><strong>不开发</strong></td>
                <td>无福利关系维护，Override 无载体</td>
              </tr>
              <tr>
                <td>社保月度流水页</td>
                <td><strong>不开发</strong></td>
                <td>由老系统维护，本系统不生成月度流水</td>
              </tr>
              <tr>
                <td>公积金月度流水页</td>
                <td><strong>不开发</strong></td>
                <td>由老系统维护，本系统不生成月度流水</td>
              </tr>
              <tr>
                <td>个税月度流水页（完整版）</td>
                <td><strong>不开发</strong></td>
                <td>由老系统维护；本系统只支持多轮调百旺</td>
              </tr>
              <tr>
                <td>3 个核心时间字段（费用产生/归属/实际缴纳月）</td>
                <td><strong>不开发</strong></td>
                <td>无月度流水，3 字段无载体</td>
              </tr>
              <tr>
                <td>feeType 分类（社保/公积金/个税/工伤/商业险）</td>
                <td><strong>不开发</strong></td>
                <td>无福利明细页，feeType 无用途</td>
              </tr>
              <tr>
                <td>滞纳金作为衍生项</td>
                <td><strong>不开发</strong></td>
                <td>由老系统处理</td>
              </tr>
              <tr>
                <td>商业险库（险种/城市/保额/保费/续保）</td>
                <td><strong>不开发</strong>，采用默认机制</td>
                <td>见上文 ③ 商业险默认机制</td>
              </tr>
              <tr>
                <td>入职时选商业险流程</td>
                <td><strong>不开发</strong></td>
                <td>默认机制下无选择</td>
              </tr>
              <tr>
                <td>保护模式选择（全额 vs 按基数）</td>
                <td><strong>不开发</strong></td>
                <td>由老系统配置</td>
              </tr>
              <tr>
                <td>调岗调薪重算福利明细</td>
                <td><strong>不开发</strong></td>
                <td>无福利明细维护</td>
              </tr>
              <tr>
                <td>离职社保/公积金转出</td>
                <td><strong>不开发</strong></td>
                <td>由老系统处理</td>
              </tr>
              <tr>
                <td>商业险续保提醒</td>
                <td><strong>不开发</strong></td>
                <td>由业务方手动续保</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 5. v2-1 仍需维护的福利相关数据 -->
        <div class="card">
          <h3>⑤ v2-1 仍需维护的福利相关数据</h3>
          <p>虽然【员工福利保障】模块整体不开发，但以下与福利相关的数据<strong>本系统必须自维护</strong>（用于工资条计算）：</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>数据</th>
                <th>维护方</th>
                <th>用途</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>员工<strong>合同主体</strong></td>
                <td>本系统（员工管理）</td>
                <td>确定发放主体、判断全职/返聘是否挂店</td>
              </tr>
              <tr>
                <td>员工<strong>业绩归属主体列表</strong>（非全日制/兼职）</td>
                <td>本系统（员工管理）</td>
                <td>确定每条工资条的发放主体、每主体独立结算</td>
              </tr>
              <tr>
                <td>员工<strong>岗位</strong>（含用工类型）</td>
                <td>本系统（员工管理）</td>
                <td>匹配薪酬模板、确定计算逻辑</td>
              </tr>
              <tr>
                <td>员工<strong>归属城市</strong></td>
                <td>本系统（员工管理）</td>
                <td>占位用，本系统不计算福利金额（老系统算）</td>
              </tr>
              <tr>
                <td>员工<strong>常乐豆余额</strong></td>
                <td>本系统（推拿之家-常乐豆账户）</td>
                <td>常乐豆抵扣规则、离职提现</td>
              </tr>
              <tr>
                <td>员工<strong>负工资余额</strong></td>
                <td>本系统（负工资账户）</td>
                <td>负工资抵扣规则、离职处理</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>关键：</strong>本系统<strong>不维护</strong>城市基准系数、社保/公积金个人/公司部分金额、商业险明细、月度流水、Override 等<strong>任何福利金额数据</strong>。所有福利金额<strong>调用老系统接口</strong>或<strong>由老系统单独记账</strong>。
          </div>
        </div>
      </div>

      <!-- 三、常乐豆规则 -->
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
            <strong>核心规则：</strong>获得的常乐豆，<strong>只用于抵扣公积金</strong>（公司部分 / 个人部分），<strong>不抵扣社保、不抵扣商业险</strong>。按以下优先级顺序使用：
            <ol style="margin: 10px 0 0 20px; line-height: 2;">
              <li><strong>抵扣公积金公司部分</strong>：常乐豆优先抵扣公积金中公司承担的部分</li>
              <li><strong>抵扣公积金个人部分</strong>：常乐豆继续抵扣公积金中员工个人承担的部分</li>
              <li><strong>现金补扣【公积金个人扣款】</strong>：若常乐豆余额仍不足，从对应<strong>工资单现金</strong>部分抵扣，扣款项<strong>固定名称</strong>为【<strong>公积金个人扣款</strong>】</li>
              <li><strong>消费</strong>：若抵扣后仍有剩余，仅可用于消费，不可提现</li>
            </ol>
          </div>
        </div>

        <div class="card">
          <h3>常乐豆与应税收入</h3>
          <div class="note">
            <strong>重要说明：</strong>常乐豆<strong>不参与个税应税金额计算</strong>——无论是抵扣公司部分、抵扣个人部分、用于消费，均不计入应税收入。
          </div>
        </div>

        <div class="card">
          <h3>离职提现</h3>
          <div class="note">
            全职员工离职时，按<strong>使用规则</strong>优先完成当期福利保障的抵扣（公司部分 → 个人部分 → 现金补扣【公积金个人扣款】），<strong>最终剩余的常乐豆余额全部提现</strong>。<br/><br/>
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
          <strong>💡 v2-1 阶段变化点：</strong>常乐豆使用规则在 v2-1 阶段<strong>完全保留</strong>，未做任何裁剪。<strong>唯一变化</strong>：公积金个人部分金额从【老系统接口读取】，抵扣方向不变（公司部分 → 个人部分 → 现金补扣【公积金个人扣款】）。
        </div>
      </div>

      <!-- 四、岗位薪酬模板 -->
      <div id="template" class="section">
        <h2>四、岗位薪酬模板</h2>
        <div class="note" style="background: hsl(var(--primary) / 0.08); border-left: 3px solid hsl(var(--primary)); padding: 10px 12px; margin-bottom: 12px; font-size: 13px; border-radius: 4px;">
          <strong>📌 职责边界：</strong>岗位薪酬模板<strong>只管工资条项</strong>（薪酬项 + 扣缴项 + 系统项）。福利保障项（社保 / 公积金 / 商业险）<strong>不配置在薪酬模板中</strong>——社保/公积金个人部分金额由<strong>老系统接口</strong>读取，商业险采用<strong>默认机制</strong>。
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
                <td>社保扣缴（全职），员工个人部分；<strong>金额 = 老系统接口返回值</strong></td>
                <td>✅ 是</td>
              </tr>
              <tr>
                <td>代扣公积金</td>
                <td>公积金扣缴（全职），员工个人部分；<strong>金额 = 老系统接口返回值 - 常乐豆抵扣</strong></td>
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
            <strong>已移除的旧版"公司成本项"：</strong>原 V1 模板中的"公司成本项"分类（商业险等）在 V2 已<strong>整体拆出</strong>，v2-1 阶段<strong>不引入薪酬模板</strong>——理由：
            <ul style="margin: 4px 0 0 16px; line-height: 1.8;">
              <li>社保 / 公积金 / 商业险<strong>本质是福利保障</strong>，v2-1 由老系统/默认机制处理，不在本系统维护</li>
              <li>福利项<strong>不参与工资条扣款</strong>，与薪酬项的"按月计算按条分配"逻辑不同源</li>
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
                <td>末级（金额 = 老系统接口）</td>
              </tr>
              <tr>
                <td>代扣公积金</td>
                <td>代扣公积金</td>
                <td>末级（金额 = 老系统接口 - 常乐豆）</td>
              </tr>
              <tr>
                <td>代扣个税</td>
                <td>代扣个税</td>
                <td>末级（百旺服务）</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>系统项：</strong>代扣社保、代扣公积金、代扣个税（按月计算，按工资条分配）<br/>
            <strong>无预扣个税：</strong>全职个税直接使用百旺服务计算，不再预扣<br/>
            <strong>福利保障：</strong>社保（全）+ 公积金 <strong>从老系统接口读取个人部分金额</strong>；商业险<strong>默认机制</strong>（不进工资条）
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
            <strong>福利保障：</strong>社保（仅工伤保险）由<strong>老系统单独记账</strong>，<strong>不进入员工工资条</strong>；商业险采用<strong>默认机制</strong>（不进入工资条）<br/>
            <strong>无社保/无公积金代扣项：</strong>非全日制模板中<strong>不包含</strong>代扣社保/代扣公积金系统项——因为公司全额承担，个人不缴
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
            <strong>福利保障：</strong>商业险采用<strong>默认机制</strong>（公司全额，不进工资条）<br/>
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
            <strong>福利保障：</strong>无社保（达到退休年龄不再缴纳）、无公积金、<strong>商业险默认机制</strong>（不进工资条）<br/>
            <strong>无常乐豆：</strong>返聘员工不享有常乐豆<br/>
            <strong>无预扣个税：</strong>返聘无周薪，个税直接由百旺服务按月计算（参考全职逻辑）
          </div>
        </div>
      </div>

      <!-- 四·附录：动态薪酬项 / 扣缴项（业务流转产生，非模板固定配置） -->
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
                <td>常乐豆余额不足以抵扣公积金<strong>个人部分</strong>时（个人部分金额从老系统接口读取），从工资单<strong>现金</strong>部分扣减</td>
                <td>全职</td>
                <td>对应工资单（全职=当月任一工资条）</td>
              </tr>
              <tr>
                <td><strong>个税补缴</strong></td>
                <td>月末百旺汇算：实际税额 &gt; 已预扣合计（多退少补中的"补"）</td>
                <td>非全日制 / 兼职</td>
                <td>当月<strong>最后一条工资条</strong>的一个扣缴项（不单独生成汇算工资条）</td>
              </tr>
              <tr>
                <td><strong>个税退税</strong></td>
                <td>月末百旺汇算：实际税额 &lt; 已预扣合计（多退少补中的"退"）</td>
                <td>非全日制 / 兼职</td>
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
                  ① 无社保/无公积金/无常乐豆 + 商业险默认机制（不进工资条）→ <strong>无任何【公积金个人扣款】触发场景</strong><br/>
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
      </div>

      <!-- 五、薪酬项范围 -->
      <div id="items" class="section">
        <h2>五、薪酬项范围</h2>

        <!-- 全职 -->
        <div class="card">
          <h3>全职（劳动合同）</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>层级</th>
                <th>薪酬项</th>
                <th>类型</th>
                <th>计算公式</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowspan="4">第1级</td>
                <td>计件提成</td>
                <td>收入</td>
                <td>订单金额 × 提成比例</td>
              </tr>
              <tr>
                <td>超产值奖金</td>
                <td>收入</td>
                <td>超出部分 × 奖励比例</td>
              </tr>
              <tr>
                <td>超时加班费</td>
                <td>收入</td>
                <td>加班时长 × 单价</td>
              </tr>
              <tr>
                <td>投诉扣款</td>
                <td>扣缴项</td>
                <td>投诉次数 × 单次扣款</td>
              </tr>
              <tr>
                <td>第2级</td>
                <td>保底获豆</td>
                <td>收入</td>
                <td>max(0, 最低工资标准 - 第1级收入之和)</td>
              </tr>
              <tr>
                <td rowspan="3">系统项</td>
                <td>代扣社保</td>
                <td>代扣社保</td>
                <td><strong>老系统接口返回值</strong></td>
              </tr>
              <tr>
                <td>代扣公积金</td>
                <td>代扣公积金</td>
                <td><strong>老系统接口返回值 - 常乐豆抵扣</strong></td>
              </tr>
              <tr>
                <td>代扣个税</td>
                <td>代扣个税</td>
                <td>百旺服务</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 非全日制 -->
        <div class="card">
          <h3>非全日制（劳务协议）</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>层级</th>
                <th>薪酬项</th>
                <th>类型</th>
                <th>计算公式</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowspan="3">第1级</td>
                <td>计件提成</td>
                <td>收入</td>
                <td>订单金额 × 提成比例</td>
              </tr>
              <tr>
                <td>超时加班费</td>
                <td>收入</td>
                <td>加班时长 × 单价</td>
              </tr>
              <tr>
                <td>投诉扣款</td>
                <td>扣缴项</td>
                <td>投诉次数 × 单次扣款</td>
              </tr>
              <tr>
                <td>第2级（每工资条）</td>
                <td>个税预扣</td>
                <td>扣缴项</td>
                <td>(全部收入之和 - 全部扣缴之和) × 3%</td>
              </tr>
              <tr>
                <td>系统项（月末汇算）</td>
                <td>个税退税 / 个税补缴</td>
                <td>代扣个税</td>
                <td>百旺实际税额 - 已预扣合计</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 兼职 -->
        <div class="card">
          <h3>兼职（劳务合作）</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>层级</th>
                <th>薪酬项</th>
                <th>类型</th>
                <th>计算公式</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowspan="3">第1级</td>
                <td>计件提成</td>
                <td>收入</td>
                <td>订单金额 × 提成比例</td>
              </tr>
              <tr>
                <td>超时加班费</td>
                <td>收入</td>
                <td>加班时长 × 单价</td>
              </tr>
              <tr>
                <td>投诉扣款</td>
                <td>扣缴项</td>
                <td>投诉次数 × 单次扣款</td>
              </tr>
              <tr>
                <td>第2级（每工资条）</td>
                <td>个税预扣</td>
                <td>扣缴项</td>
                <td>(全部收入之和 - 全部扣缴之和) × 3%</td>
              </tr>
              <tr>
                <td>系统项（月末汇算）</td>
                <td>个税退税 / 个税补缴</td>
                <td>代扣个税</td>
                <td>百旺实际税额 - 已预扣合计（倒序申报）</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 返聘 -->
        <div class="card">
          <h3>返聘（劳务合作-退休返聘）</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>层级</th>
                <th>薪酬项</th>
                <th>类型</th>
                <th>计算公式</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowspan="3">第1级</td>
                <td>计件提成</td>
                <td>收入</td>
                <td>订单金额 × 提成比例</td>
              </tr>
              <tr>
                <td>超时加班费</td>
                <td>收入</td>
                <td>加班时长 × 单价</td>
              </tr>
              <tr>
                <td>投诉扣款</td>
                <td>扣缴项</td>
                <td>投诉次数 × 单次扣款</td>
              </tr>
              <tr>
                <td>系统项</td>
                <td>代扣个税</td>
                <td>代扣个税</td>
                <td>百旺服务</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 六、计算节点与时机 -->
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
                  <li>代扣社保（<strong>老系统接口读取</strong>）</li>
                  <li>代扣公积金（<strong>老系统接口读取 - 常乐豆抵扣</strong>）</li>
                  <li>代扣个税（百旺服务）</li>
                </ul>
                <p><strong>说明：</strong>3项都每月只计算一次（示例），按工资条分配</p>
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

      <!-- 七、计算示例 -->
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
          <h3>全职示例 A：常乐豆<strong>充足</strong> → 公积金个人扣款 = 0（含负工资抵扣）</h3>
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
                <tr><td>公积金<strong>个人部分</strong>（老系统接口）</td><td>600</td><td><strong>老系统接口读取</strong>；常乐豆优先抵<strong>公司部分</strong> → 再抵<strong>个人部分</strong>（本例被完全抵扣）</td></tr>
                <tr><td>代扣社保（老系统接口）</td><td>-800</td><td><strong>老系统接口读取</strong>，个人部分，<strong>不在常乐豆抵扣范围</strong></td></tr>
                <tr><td>代扣个税</td><td>-57</td><td>百旺按 8300 计算</td></tr>
                <tr><td><strong>常乐豆余额</strong></td><td><strong>2000</strong></td><td><strong>只用于抵扣公积金</strong>，本期<strong>充足</strong></td></tr>
                <tr><td>负工资余额</td><td>-2000</td><td>历史欠款</td></tr>
              </tbody>
            </table>
            <p><strong>应税收入：</strong>8500 - 投诉扣款(200) = <strong>8300</strong>（社保/公积金/常乐豆<strong>均不参与应税收入</strong>）</p>
            <p><strong>常乐豆使用（4 级优先级，公积金个人部分金额从老系统读取）：</strong></p>
            <ul class="calc-steps">
              <li>① 抵公积金<strong>公司部分</strong>（金额由老系统记账，本系统不显示） → 2000 - 公司部分 = <strong>剩余</strong></li>
              <li>② 抵公积金<strong>个人部分</strong> 600 → 继续抵扣 → <strong>完全抵完</strong></li>
              <li>③ 公积金个人部分已被完全抵扣 → <strong>【公积金个人扣款】= 0</strong>（无现金补扣）</li>
              <li>④ 剩余常乐豆 → 进入<strong>消费</strong>环节</li>
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
                  <td><s>代扣公积金 -600</s> → <strong>0</strong>（已被常乐豆完全抵扣）</td>
                  <td>—（<strong>无【公积金个人扣款】</strong>，常乐豆已抵公积金个人部分）</td>
                  <td>+2500</td>
                  <td><strong>2500</strong></td>
                </tr>
                <tr>
                  <td>工资条3（保底+个税）</td>
                  <td>保底获豆 +0</td>
                  <td>代扣个税 -57</td>
                  <td>—</td>
                  <td>-57（应发 &lt; 0，负数累加）</td>
                  <td><strong>0</strong></td>
                </tr>
                <tr>
                  <td colspan="4"><strong>合计</strong></td>
                  <td colspan="2"><strong>实发 5500，剩余负工资余额 57</strong></td>
                </tr>
              </tbody>
            </table>
            <div class="note">
              <strong>说明：</strong>① 系统项（社保/公积金/个税）按月一次计算，按工资单配置分配到 N 个工资条（示例：3个）；<strong>社保/公积金金额来自老系统接口</strong>；② <strong>常乐豆充足时</strong>：公积金个人部分 600 <strong>完全由常乐豆抵扣</strong>，工资条 2 的"代扣公积金"为 0，<strong>【公积金个人扣款】不出现</strong>（= 0）；③ 负工资抵扣是触发式动态项；④ 应发 &lt; 0 时负数累加到下次负工资余额；⑤ <strong>商业险不显示</strong>（默认机制下不进工资条）。
            </div>
          </div>
        </div>

        <!-- 全职示例 B -->
        <div class="card">
          <h3>全职示例 B：常乐豆<strong>不足</strong> → 触发【公积金个人扣款】（含负工资抵扣）</h3>
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
                <tr><td>公积金<strong>个人部分</strong>（老系统接口）</td><td>600</td><td><strong>老系统接口读取</strong>；本例常乐豆<strong>不足抵扣</strong>，触发【公积金个人扣款】</td></tr>
                <tr><td>代扣社保（老系统接口）</td><td>-800</td><td><strong>老系统接口读取</strong>，个人部分，<strong>不在常乐豆抵扣范围</strong></td></tr>
                <tr><td>代扣个税</td><td>-90</td><td>百旺按 5000 计算</td></tr>
                <tr><td><strong>常乐豆余额</strong></td><td><strong>300</strong></td><td><strong>只用于抵扣公积金</strong>，本期<strong>不足</strong></td></tr>
                <tr><td>负工资余额</td><td>-500</td><td>历史欠款</td></tr>
              </tbody>
            </table>
            <p><strong>应税收入：</strong>(1000+7000) - 投诉扣款(3000) = <strong>5000</strong></p>
            <p><strong>常乐豆使用（4 级优先级）：</strong></p>
            <ul class="calc-steps">
              <li>① 抵公积金<strong>公司部分</strong>（老系统记账金额）→ 300 &lt; 公司部分 → <strong>常乐豆用完</strong></li>
              <li>② 抵公积金<strong>个人部分</strong> 600 → 常乐豆余额=0 → <strong>不能抵</strong></li>
              <li>③ 公积金个人部分 600 <strong>未全部被常乐豆抵</strong> → 触发<strong>现金补扣【公积金个人扣款】= 600</strong>（从工资单现金扣）</li>
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
                  <td><s>代扣公积金 -600</s> → <strong>0</strong>（被常乐豆+【公积金个人扣款】完全覆盖）</td>
                  <td><strong>【公积金个人扣款】-600</strong>（常乐豆不足触发，现金补扣）</td>
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
              <strong>说明：</strong>① 应税收入 ≤ 0 时无个税；② 应发 ≤ 0 的工资条负数计入"待抵扣总额"；③ <strong>常乐豆不足时</strong>触发【公积金个人扣款】= 600 现金补扣，<strong>该动态项出现在工资条 2</strong>；④ 工资条3 应发 &gt; 0 时按"可抵扣最大值"一次性扣除；⑤ 抵扣后剩余负工资 0；⑥ <strong>总实发不变</strong>（3000+0+0 = 3010），但【公积金个人扣款】作为<strong>动态项</strong>标识了"现金补扣"语义。
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
              <strong>说明：</strong>① 每周工资条各自计算预扣个税（应税收入 × 3%）；② 月末百旺算出实际税额后，"个税补缴/退税"作为<strong>最后一个工资条</strong>的一个扣缴项出现（不单独生成汇算工资条）；③ 汇算补缴直接从最后一周实发里扣，不累积为负工资余额；④ <strong>无社保/无公积金代扣项</strong>（公司全额承担，由老系统单独记账）；⑤ <strong>无【公积金个人扣款】</strong>触发场景（无常乐豆）；⑥ <strong>商业险不显示</strong>。
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
                  <td>—（无社保/无公积金/无常乐豆，无【公积金个人扣款】）</td>
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
              <strong>说明：</strong>① 返聘<strong>无社保/无公积金/无常乐豆</strong>，工资条结构最简；② <strong>商业险采用默认机制</strong>，<strong>不进员工工资条</strong>，由老系统/财务单独记账；③ 返聘<strong>无任何【公积金个人扣款】触发场景</strong>（无常乐豆 + 无公积金个人部分 + 商业险不进工资单）；④ 本例无负工资余额，无负工资抵扣；⑤ <strong>无个税补缴/退税</strong>（返聘无周薪，无预扣环节）。
            </div>
          </div>
        </div>
      </div>

      <!-- 八、工资条组装 -->
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
            <li>工资条按<strong>发放主体</strong>分组生成：全职/返聘=合同主体（1个），非全日制/兼职=业绩归属主体（可能多个，1 门店 = 1 主体）</li>
            <li>每个发放主体独立结算、独立生成工资条</li>
            <li>所有薪酬项和系统项都会计算出值（社保/公积金<strong>从老系统接口读取</strong>）</li>
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
                <td>计件提成 + 投诉扣款(部分) + 代扣社保(部分，<strong>老系统读取</strong>)</td>
                <td>系统项按比例分配</td>
              </tr>
              <tr>
                <td>工资条2（奖金工资条）</td>
                <td>超产值奖金 + 超时加班费 + 投诉扣款(部分) + 代扣公积金(部分，<strong>老系统读取</strong>)</td>
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
            <strong>常乐豆抵扣范围：</strong>常乐豆<strong>只抵扣公积金</strong>（公司/个人部分，<strong>公司部分由老系统记账</strong>），<strong>不抵扣社保/商业险</strong>。当常乐豆余额不足以抵扣<strong>公积金个人部分</strong>时（个人部分金额从老系统读取），从对应工资单<strong>现金</strong>部分扣减，扣款项固定名称为【<strong>公积金个人扣款</strong>】（仅全职场景）<br/>
            <strong>商业险：</strong>默认机制，<strong>不进工资条</strong>，<strong>不显示</strong><br/>
            <strong>离职常乐豆：</strong>全职员工离职时，该合同主体名下的常乐豆余额全部提现
          </div>
        </div>

        <!-- 返聘工资条 -->
        <div class="card">
          <h3>返聘工资条（每月）</h3>
          <p>退休返聘人员不享有常乐豆、不交社保、不交公积金、<strong>商业险采用默认机制（不进工资条）</strong>。每月计算1次，生成N个工资条（示例：1个）：</p>
          <table class="data-table">
            <thead>
              <tr><th>工资条</th><th>包含薪酬项</th><th>说明</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>工资条（综合）</td>
                <td>计件提成 + 超时加班费 + 投诉扣款 + 代扣个税</td>
                <td><strong>无【公积金个人扣款】</strong>——返聘无常乐豆 + 无公积金个人部分，<strong>无任何触发场景</strong>；商业险<strong>默认机制（不显示）</strong></td>
              </tr>
            </tbody>
          </table>
          <div class="note" style="background: hsl(var(--muted) / 0.3);">
            <strong>说明：</strong>返聘工资单结构最简，<strong>实际可灵活配置任意数量工资条</strong>。返聘场景下无任何【公积金个人扣款】触发（无常乐豆 + 无公积金个人部分）；商业险<strong>默认机制（不进工资条）</strong>。
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
                <td>每个主体每周生成；<strong>无社保/无公积金代扣项</strong>（公司全额承担，由老系统单独记账）</td>
              </tr>
              <tr>
                <td>最后一周工资条（月末）</td>
                <td>计件提成 + 超时加班费 + 投诉扣款 + 预扣个税 + <strong>个税补缴 或 个税退税</strong>（汇算结果）</td>
                <td>
                  月末百旺汇算后，汇算结果作为<strong>最后一条工资条的一个扣缴/收入项</strong>出现<br/>
                  补缴 = 实际税额 - 已预扣合计（&gt;0 生成补缴）<br/>
                  退税 = 已预扣合计 - 实际税额（&lt;0 生成退税）<br/>
                  <strong>不单独生成"汇算工资条"</strong>；<strong>商业险不显示</strong>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="note" style="background: hsl(var(--muted) / 0.3);">
            <strong>说明：</strong>结算周期和工资条数量为典型示例，<strong>实际可灵活配置任意结算周期（日/周/旬/月）、任意数量工资条</strong>。个税汇算结果<strong>始终归属于当月最后一条工资条</strong>，不单独生成汇算工资条。商业险<strong>默认机制（不显示）</strong>。
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
            <strong>发放规则：</strong>每个发放主体（全职/返聘=合同主体，非全日制/兼职=业绩归属主体，1 门店 = 1 主体）下的工资分别发放。周薪制要求两笔工资间隔≤15天。<br/>
            <strong>汇算规则：</strong>个税汇算结果（补缴/退税）<strong>作为每门店最后一条工资条的一个扣缴/收入项</strong>出现，不单独生成"汇算工资条"。<br/>
            <strong>无社保/无公积金代扣项</strong>；<strong>商业险默认机制（不显示）</strong>。
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
                <td>常乐豆<strong>只抵扣公积金</strong>，不足以抵扣<strong>公积金个人部分</strong>时触发（个人部分金额从老系统接口读取）<br/>（社保/商业险公司部分由公司全额现金承担，<strong>不触发此动态项</strong>）</td>
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
      </div>

      <!-- 九、典型业务场景决策树 -->
      <div id="scenarios" class="section">
        <h2>九、典型业务场景决策树</h2>

        <div class="card">
          <h3>用工类型选择</h3>
          <div class="decision-tree">
            <div class="tree-node root">新员工入职配置</div>
            <div class="tree-children">
              <div class="tree-question">Q1: 每天工时 ≤ 4 小时 + 周薪制（间隔 ≤ 15 天）？</div>
              <div class="tree-children">
                <div class="tree-leaf primary">✓ 是 → 非全日制用工（劳务协议）</div>
                <div class="tree-leaf-sub">  └ <strong>社保（仅工伤保险）</strong>由老系统单独记账（公司全额，不进工资条）</div>
                <div class="tree-leaf-sub">  └ <strong>商业险默认机制</strong>（不显示）</div>
                <div class="tree-leaf-sub">  └ 多主体（1 门店 = 1 主体）：每主体独立结算，按各主体发薪</div>
                <div class="tree-leaf-sub">  └ 无常乐豆、无社保（全）、无公积金</div>
                <div class="tree-leaf muted">  ✗ 否 ↓</div>
              </div>
              <div class="tree-question">Q2: 需要社保 + 公积金？</div>
              <div class="tree-children">
                <div class="tree-leaf primary">✓ 是 → 全职用工（劳动合同）</div>
                <div class="tree-leaf-sub">  └ <strong>社保（全）+ 公积金</strong>：<strong>个人部分金额从老系统接口读取</strong>（公司部分由老系统记账）</div>
                <div class="tree-leaf-sub">  └ <strong>商业险默认机制</strong>（公司全额，不参与工资计算；不显示）</div>
                <div class="tree-leaf-sub">  └ 单一合同主体，不能挂店</div>
                <div class="tree-leaf-sub">  └ 有常乐豆（仅消费，离职时全部提现）</div>
                <div class="tree-leaf muted">  ✗ 否 ↓</div>
              </div>
              <div class="tree-question">Q3: 临时/项目制用工？</div>
              <div class="tree-children">
                <div class="tree-leaf primary">✓ 是 → 兼职用工（劳务合作）</div>
                <div class="tree-leaf-sub">  └ <strong>商业险默认机制</strong>（公司全额，不参与工资计算；不显示）</div>
                <div class="tree-leaf-sub">  └ 多主体倒序申报（应税金额大者先报，可能跳档）</div>
                <div class="tree-leaf-sub">  └ 无常乐豆、无社保、无公积金</div>
                <div class="tree-leaf muted">  ✗ 否 ↓</div>
              </div>
              <div class="tree-question">Q4: 退休返聘（已达法定退休年龄）？</div>
              <div class="tree-children">
                <div class="tree-leaf primary">✓ 是 → 返聘用工（劳务合作-退休返聘）</div>
                <div class="tree-leaf-sub">  └ <strong>商业险默认机制</strong>（公司全额，不参与工资计算；不显示）</div>
                <div class="tree-leaf-sub">  └ 单一劳务合作主体，不能挂店</div>
                <div class="tree-leaf-sub">  └ 无常乐豆、无社保（达到退休年龄不再缴纳）、无公积金</div>
                <div class="tree-leaf-sub">  └ <strong>无【公积金个人扣款】</strong>触发场景</div>
                <div class="tree-leaf muted">  ✗ 否 → 全职用工（默认）</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h3>推拿师特殊处理</h3>
          <div class="decision-tree">
            <div class="tree-node root">推拿师入职</div>
            <div class="tree-children">
              <div class="tree-question">Q: 推拿师等级 Lv？</div>
              <div class="tree-children">
                <div class="tree-leaf primary">Lv1 ~ Lv2</div>
                <div class="tree-leaf-sub">  └ 享受营销折扣获豆 + 回头客补贴（常乐豆形式）</div>
                <div class="tree-leaf-sub">  └ 可转非全日制（按非全日制规则）</div>
                <div class="tree-leaf primary">Lv3+</div>
                <div class="tree-leaf-sub">  └ <strong>不再发放</strong>营销折扣补贴 + 回头客补贴</div>
                <div class="tree-leaf-sub">  └ <strong>不接受</strong>转非全日制（保持全职）</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h3>多主体兼职场景（1 门店 = 1 主体）</h3>
          <div class="decision-tree">
            <div class="tree-node root">兼职员工在 N 个门店产生业绩</div>
            <div class="tree-children">
              <div class="tree-question">Q: 个税申报顺序？</div>
              <div class="tree-children">
                <div class="tree-leaf primary">应税金额倒序申报（大者先报）</div>
                <div class="tree-leaf-sub">  └ 每门店独立计算预扣个税（每周 3%）</div>
                <div class="tree-leaf-sub">  └ 月末百旺服务累计计算实际税额</div>
                <div class="tree-leaf-sub">  └ 申报门店 = 补缴 / 退税主体</div>
                <div class="tree-leaf-sub">  └ 每门店最后一周工资条包含汇算补缴/退税</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 十、金额流转泳道图 -->
      <div id="money-flow" class="section">
        <h2>十、金额流转泳道图</h2>

        <div class="card">
          <h3>月度金额流转全景（v2-1）</h3>
          <div class="note" style="background: hsl(var(--warning) / 0.05); border-left: 3px solid hsl(var(--warning)); margin-bottom: 16px; font-size: 13px;">
            <strong>v2-1 变化点：</strong>社保/公积金<strong>金额从老系统接口读取</strong>（图中用<strong>橙色</strong>标注），商业险<strong>默认机制不显示</strong>，<strong>无员工福利保障关系建立</strong>环节。
          </div>
          <div class="swimlane-container">
            <div class="swimlane-row">
              <div class="swimlane-lane">顾客<br/>客户</div>
              <div class="swimlane-content">
                <div class="flow-step-inline primary">支付服务费用</div>
              </div>
            </div>
            <div class="swimlane-arrow">↓</div>
            <div class="swimlane-row">
              <div class="swimlane-lane">主体公司<br/>（含门店）</div>
              <div class="swimlane-content">
                <div class="flow-step-inline">收入 → 工资单系统</div>
                <div class="flow-step-inline muted">主体公司按业绩归属归集营收</div>
              </div>
            </div>
            <div class="swimlane-arrow">↓</div>
            <div class="swimlane-row">
              <div class="swimlane-lane">工资单<br/>系统</div>
              <div class="swimlane-content">
                <div class="flow-step-inline">按员工 + 主体 + 周期 创建工资单</div>
                <div class="flow-step-inline muted">匹配薪酬模板 + 发放策略</div>
                <div class="flow-step-inline">第1级 → 第2级 → <span style="color: hsl(var(--warning)); font-weight: 600;">系统项（社保/公积金从老系统接口读取）</span> → 负工资处理（条件触发）</div>
              </div>
            </div>
            <div class="swimlane-arrow">↓</div>
            <div class="swimlane-row highlight-row">
              <div class="swimlane-lane">工资条<br/>(每员工 1~N 条)</div>
              <div class="swimlane-content">
                <div class="flow-step-inline primary">→ 员工（实发 = 收入 - 扣缴 - 代扣）</div>
                <div class="flow-step-inline">→ 第三方（代扣个税，月末汇算补退）</div>
                <div class="flow-step-inline"><span style="color: hsl(var(--warning)); font-weight: 600;">→ 第三方（代扣社保/公积金，个人部分，从老系统接口读取）</span></div>
                <div class="flow-step-inline muted">→ 主体公司（公司部分社保/公积金，由老系统记账，不进员工工资条）</div>
                <div class="flow-step-inline muted">→ 第三方（商业险，默认机制，由老系统/财务单独记账，不进员工工资条）</div>
                <div class="flow-step-inline muted">→ 负工资账户（应发 &gt; 0 时抵扣；应发 &lt; 0 时累加到余额）</div>
                <div class="flow-step-inline muted">→ 常乐豆账户（仅全职，保底获豆入账 / 离职提现）</div>
              </div>
            </div>
            <div class="swimlane-arrow">↓</div>
            <div class="swimlane-row split-row">
              <div class="swimlane-lane">员工 / 第三方<br/>收款方</div>
              <div class="swimlane-content split-content">
                <div class="split-item">
                  <div class="split-title">员工</div>
                  <div class="split-desc">实发工资（含现金 + 常乐豆）</div>
                </div>
                <div class="split-item">
                  <div class="split-title">税务局</div>
                  <div class="split-desc">代扣个税 + 汇算补退</div>
                </div>
                <div class="split-item">
                  <div class="split-title">社保局 / 公积金中心</div>
                  <div class="split-desc">个人部分（老系统接口） + 公司部分（老系统记账）</div>
                </div>
                <div class="split-item">
                  <div class="split-title">保险公司</div>
                  <div class="split-desc">商业险（默认机制，公司全额，老系统/财务记账）</div>
                </div>
                <div class="split-item">
                  <div class="split-title">百旺服务</div>
                  <div class="split-desc">第三方税务服务费</div>
                </div>
              </div>
            </div>
          </div>

          <div class="note">
            <strong>关键流转规则：</strong>
            <ul>
              <li>工资条上的"<strong>公司部分</strong>"（社保/公积金公司部分、商业险）<strong>不进入员工工资条</strong>，由老系统/财务单独记账</li>
              <li>工资条上的"<strong>代扣</strong>"是员工负担部分（社保/公积金个人部分<strong>从老系统接口读取</strong>，从实发中扣除）</li>
              <li><strong>代扣个税</strong>通过百旺服务计算：全职直接算当月（按月度应税收入），非全日制/兼职按累计应税收入（<strong>不含已预扣</strong>，否则会重复计税）算累计应纳 - 已预扣合计 = 补缴/退税</li>
              <li><strong>常乐豆</strong>仅全职员工有；发放 → 消费 → 离职提现，全链路不进工资条扣款</li>
              <li><strong>商业险</strong>采用默认机制，<strong>不进入员工工资条</strong>，<strong>不显示在福利明细</strong>（v2-1 不开发福利明细页）</li>
            </ul>
          </div>
        </div>

        <div class="card">
          <h3>典型场景：非全日制/兼职多主体月度结算（1 门店 = 1 主体）</h3>
          <div class="swimlane-container">
            <div class="swimlane-row">
              <div class="swimlane-lane">门店A</div>
              <div class="swimlane-content">
                <div class="flow-step-inline">每周计件 + 加班 - 投诉 → 预扣个税（3%×4周）</div>
                <div class="flow-step-inline muted">门店A 业绩归集 → 门店A 主体</div>
              </div>
            </div>
            <div class="swimlane-arrow">↓</div>
            <div class="swimlane-row">
              <div class="swimlane-lane">门店B</div>
              <div class="swimlane-content">
                <div class="flow-step-inline">每周计件 + 加班 → 预扣个税（3%×4周）</div>
                <div class="flow-step-inline muted">门店B 业绩归集 → 门店B 主体</div>
              </div>
            </div>
            <div class="swimlane-arrow">↓ 月末 ↓</div>
            <div class="swimlane-row highlight-row">
              <div class="swimlane-lane">百旺服务<br/>(倒序申报)</div>
              <div class="swimlane-content">
                <div class="flow-step-inline">门店A（应税 22400）先申报 → 计算应纳 1800 → 补缴 = 1800 - 672 = 1128</div>
                <div class="flow-step-inline">门店B（应税 12600）后申报 → 可能跳档 → 计算应纳 1200 → 补缴 = 1200 - 378 = 822</div>
              </div>
            </div>
            <div class="swimlane-arrow">↓</div>
            <div class="swimlane-row split-row">
              <div class="swimlane-lane">员工工资条<br/>(每门店最后一周)</div>
              <div class="swimlane-content split-content">
                <div class="split-item">
                  <div class="split-title">门店A 第4周</div>
                  <div class="split-desc">含 -177（预扣） + -1128（补缴）</div>
                </div>
                <div class="split-item">
                  <div class="split-title">门店B 第4周</div>
                  <div class="split-desc">含 -108（预扣） + -822（补缴）</div>
                </div>
              </div>
            </div>
          </div>
          <div class="note">
            <strong>说明：</strong>每门店独立结算，<strong>不抵扣</strong>；门店A 补缴从门店A 最后一周实发扣；门店B 补缴从门店B 最后一周实发扣。
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { ElMessage } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import FloatingToc from '../components/FloatingToc.vue'

// ===== 悬浮目录 =====
const tocItems = [
  { id: 'version', label: '版本日志' },
  { id: 'terms', label: '名词解释' },
  { id: 'taxable-income-rule', label: '应税收入计算规则' },
  { id: 'summary', label: '一、整体概述' },
  { id: 'welfare-data-source', label: '二、福利数据来源（老系统）' },
  { id: 'bean', label: '三、常乐豆规则' },
  { id: 'template', label: '四、岗位薪酬模板' },
  { id: 'dynamic-items', label: '四·附录：动态薪酬项 / 扣缴项' },
  { id: 'items', label: '五、薪酬项范围' },
  { id: 'calculation', label: '六、计算节点与时机' },
  { id: 'examples', label: '七、计算示例' },
  { id: 'payroll', label: '八、工资条组装' },
  { id: 'scenarios', label: '九、典型业务场景决策树' },
  { id: 'money-flow', label: '十、金额流转泳道图' }
]

const copyToClipboard = async () => {
  const element = document.querySelector('.content-section')
  if (!element) {
    ElMessage.error('复制失败：未找到内容区域')
    return
  }
  try {
    const htmlContent = element.innerHTML
    const textContent = element.innerText
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const clipboardItem = new ClipboardItem({
      'text/html': blob,
      'text/plain': new Blob([textContent], { type: 'text/plain' })
    })
    await navigator.clipboard.write([clipboardItem])
    ElMessage.success('已复制到剪贴板，可直接粘贴到飞书')
  } catch (error) {
    try {
      await navigator.clipboard.writeText(element.innerText)
      ElMessage.success('已复制纯文本到剪贴板（部分格式可能丢失）')
    } catch {
      ElMessage.error('复制失败，请手动选择内容复制')
    }
  }
}

const exportToPdf = async () => {
  const element = document.querySelector('.content-section')
  if (!element) {
    ElMessage.error('导出失败：未找到内容区域')
    return
  }
  try {
    const canvas = await html2canvas(element, { scale: 2, useCORS: true })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 190
    const pageHeight = 277
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 10

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }
    pdf.save('V2阶段1产品说明.pdf')
    ElMessage.success('PDF 导出成功')
  } catch (error) {
    ElMessage.error('导出失败，请重试')
    console.error(error)
  }
}
</script>

<style scoped>
.v2-phase1-guide { padding: 0; max-width: 1400px; margin: 0 auto; }

/* ===== 文档 Hero 区 ===== */
.doc-hero {
  background: linear-gradient(135deg, hsl(var(--primary) / 0.06) 0%, hsl(var(--primary) / 0.02) 100%);
  border: 1px solid hsl(var(--primary) / 0.12);
  border-radius: 12px;
  padding: 24px 28px;
  margin: 20px 0 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  overflow: hidden;
}

.doc-hero::before {
  content: '';
  position: absolute;
  top: -80px;
  right: -80px;
  width: 240px;
  height: 240px;
  background: radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 65%);
  pointer-events: none;
}

.doc-hero-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-hover)) 100%);
  color: hsl(var(--primary-foreground));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px hsl(var(--primary) / 0.25);
  z-index: 1;
}

.doc-hero-body {
  flex: 1;
  min-width: 0;
  z-index: 1;
}

.doc-hero-title-row {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;
}

.doc-hero-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: hsl(var(--foreground));
  line-height: 1.2;
}

.doc-hero-version {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  font-size: 12px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 10px;
  white-space: nowrap;
}

.doc-hero-date {
  color: hsl(var(--muted-foreground));
  font-size: 13px;
  white-space: nowrap;
}

.doc-hero-tip {
  margin: 0;
  color: hsl(var(--muted-foreground));
  font-size: 14px;
  line-height: 1.5;
}

.doc-hero-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  z-index: 1;
  align-self: flex-start;
}

.content-section {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  padding: 24px 28px;
}

.section {
  margin-bottom: 40px;
}

.section h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid hsl(var(--primary));
}

.section h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 20px 0 12px 0;
  color: hsl(var(--foreground));
}

.callout { line-height: 1.6; }
.callout strong { color: hsl(var(--warning)); }

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  margin: 12px 0;
}

.data-table th,
.data-table td {
  border: 1px solid hsl(var(--border));
  padding: 8px 12px;
  text-align: left;
  vertical-align: top;
}

.data-table th {
  background: hsl(var(--muted) / 0.5);
  font-weight: 600;
  color: hsl(var(--foreground));
}

.card {
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  padding: 16px 20px;
  margin: 12px 0;
  background: hsl(var(--background));
}

.note {
  background: hsl(var(--muted) / 0.3);
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 13px;
  line-height: 1.7;
  margin: 8px 0;
}

/* ===== 8 步全链路架构图 ===== */
.architecture-card h2 {
  margin: 0 0 16px 0;
  font-size: 18px;
  border-bottom: none;
  padding-bottom: 0;
}

.architecture-diagram {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 0;
}

.arch-layer {
  width: 100%;
  max-width: 700px;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.arch-layer-title {
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin-bottom: 8px;
}

.arch-arrow {
  font-size: 20px;
  color: hsl(var(--muted-foreground));
  line-height: 1;
}

/* ===== 计算节点流程图 ===== */
.flow {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 16px 0;
  overflow-x: auto;
}

.flow-step {
  flex: 1;
  min-width: 180px;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  padding: 16px;
}

.flow-step .step-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
  color: hsl(var(--primary));
}

.flow-step .step-content {
  font-size: 13px;
  line-height: 1.7;
  color: hsl(var(--foreground));
}

.flow-step .step-content p { margin: 4px 0; }
.flow-step .step-content ul { margin: 6px 0; padding-left: 16px; }
.flow-step .step-content li { margin: 2px 0; }
.flow-step .step-content strong { color: hsl(var(--foreground)); }
.flow-step .step-content em { color: hsl(var(--muted-foreground)); font-style: normal; }

.flow-arrow {
  font-size: 24px;
  color: hsl(var(--muted-foreground));
  line-height: 80px;
  flex-shrink: 0;
}

.feature-list {
  margin: 12px 0;
  padding-left: 20px;
}

.feature-list li {
  margin-bottom: 8px;
}

.example {
  font-size: 14px;
}

.calc-steps {
  margin: 12px 0;
  padding-left: 20px;
}

.calc-steps li {
  margin-bottom: 6px;
}

.highlight {
  color: hsl(var(--primary));
  font-weight: 600;
}

/* 决策树 */
.decision-tree {
  font-size: 14px;
  line-height: 1.8;
}

.tree-node {
  display: inline-block;
  background: hsl(var(--muted) / 0.3);
  border-radius: 6px;
  padding: 8px 14px;
  font-weight: 500;
  margin: 4px 0;
}

.tree-node.root {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  font-weight: 600;
  font-size: 15px;
  border-radius: 8px;
}

.tree-children {
  margin-left: 20px;
  border-left: 2px dashed hsl(var(--border));
  padding-left: 16px;
  margin-top: 8px;
  margin-bottom: 8px;
}

.tree-question {
  color: hsl(var(--foreground));
  font-style: italic;
  font-weight: 500;
  margin: 10px 0 6px 0;
  font-size: 14px;
}

.tree-question::before {
  content: '◆ ';
  color: hsl(var(--primary));
  font-style: normal;
}

.tree-leaf {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
  padding: 6px 12px;
  margin: 4px 0;
  display: inline-block;
  font-size: 13px;
}

.tree-leaf.primary {
  background: hsl(var(--primary) / 0.1);
  border-color: hsl(var(--primary));
  color: hsl(var(--primary));
  font-weight: 600;
}

.tree-leaf.muted {
  color: hsl(var(--muted-foreground));
  font-style: italic;
}

.tree-leaf-sub {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  padding: 2px 0;
  display: block;
}

/* 泳道图 */
.swimlane-container {
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  overflow: hidden;
  margin: 16px 0;
}

.swimlane-row {
  display: flex;
  border-bottom: 1px solid hsl(var(--border));
}

.swimlane-row:last-child {
  border-bottom: none;
}

.swimlane-row.highlight-row {
  background: hsl(var(--primary) / 0.05);
}

.swimlane-row.split-row {
  background: hsl(var(--muted) / 0.3);
}

.swimlane-lane {
  width: 100px;
  flex-shrink: 0;
  background: hsl(var(--primary) / 0.1);
  padding: 16px 8px;
  text-align: center;
  font-weight: 600;
  font-size: 13px;
  border-right: 1px solid hsl(var(--border));
  display: flex;
  align-items: center;
  justify-content: center;
}

.swimlane-content {
  flex: 1;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.swimlane-arrow {
  text-align: center;
  font-size: 18px;
  color: hsl(var(--muted-foreground));
  padding: 4px 0;
  background: hsl(var(--muted) / 0.2);
}

.flow-step-inline {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 13px;
  display: inline-block;
  align-self: flex-start;
}

.flow-step-inline.primary {
  background: hsl(var(--primary) / 0.15);
  border-color: hsl(var(--primary));
  color: hsl(var(--primary));
  font-weight: 600;
}

.flow-step-inline.muted {
  color: hsl(var(--muted-foreground));
  background: transparent;
  border-style: dashed;
}

.split-content {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 8px;
}

.split-item {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
  padding: 8px 12px;
}

.split-title {
  font-weight: 600;
  font-size: 13px;
  color: hsl(var(--primary));
  margin-bottom: 2px;
}

.split-desc {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  line-height: 1.5;
}
</style>
