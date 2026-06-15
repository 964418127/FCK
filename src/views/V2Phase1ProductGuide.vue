<template>
  <DocShell
    :toc-items="tocItems"
    title="产品需求v2（阶段1落地版）"
    subtitle='💡 基于 v2 完整版裁剪的开发资源可控版本：模块化升级 + 常乐豆 + 负工资 + 多轮报税；福利保障数据<strong>取老系统</strong>，商业险<strong>暂不进入系统（线下购买，成本归公司）</strong>'
    version="v2.1-phase1"
    date="2026-06-06"
    :breadcrumbs="breadcrumbs"
  >
    <!-- V2 阶段1 功能架构脑图（精简版） -->
    <MindmapHero :tree="v2Phase1Tree" />

    <!-- 章节导航（首页独有） -->
    <div class="section chapter-nav">
      <h2>📚 章节导航</h2>
      <p class="chapter-nav-tip">点击卡片进入对应章节；每个章节都可独立复制、分享、定位。</p>
      <div class="chapter-grid">
        <router-link
          v-for="ch in chapterNav"
          :key="ch.path"
          :to="ch.path"
          class="chapter-card"
        >
          <div class="chapter-card-index">{{ ch.order }}</div>
          <div class="chapter-card-body">
            <div class="chapter-card-title">{{ ch.title }}</div>
            <div class="chapter-card-desc">{{ ch.subtitle }}</div>
          </div>
          <div class="chapter-card-arrow">→</div>
        </router-link>
      </div>
    </div>

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
            <td rowspan="8"><strong>v2.1<br/>phase1</strong></td>
            <td rowspan="8">2026-06-06</td>
            <td><span style="color: hsl(var(--primary)); font-weight: 600;">新增</span></td>
            <td><strong>模块化薪酬（4 种用工类型）</strong>：劳动合同-全日制 / 劳务协议-非全日制 / 劳务合作-兼职 / 劳务合作-退休返聘；按用工类型独立岗位薪酬模板</td>
          </tr>
          <tr>
            <td><span style="color: hsl(var(--primary)); font-weight: 600;">新增</span></td>
            <td><strong>常乐豆规则（4 步）</strong>：仅全职享有；<strong>优先抵扣公积金公司部分</strong>；<strong>剩余可继续抵扣公积金个人部分</strong>（<strong>最高不超过个人公积金总额</strong>，不足由<strong>员工现金补差</strong>，工资条「代扣公积金」<strong>仍按全额</strong>显示）；用于代缴个人部分的常乐豆<strong>以「激励补贴」名义入第 1 个工资条</strong>，<strong>计入应税收入</strong>（作为 1 级收入项）；<strong>不抵扣社保/商业险</strong>；<strong>常乐豆本身不计入应税收入</strong></td>
          </tr>
          <tr>
            <td><span style="color: hsl(var(--primary)); font-weight: 600;">新增</span></td>
            <td><strong>【激励补贴】动态项</strong>（常乐豆代缴公积金个人部分时的名义收入，<strong>仅全职</strong>）：<strong>触发条件</strong>——常乐豆优先抵公司部分后，剩余继续抵个人部分且实际抵掉金额 &gt; 0；<strong>金额</strong>= 常乐豆实际抵个人部分的金额（最高不超过个人公积金总额，如 1200）；<strong>位置</strong>——<strong>第 1 个工资条</strong>的一个收入项；工资条上「代扣公积金」<strong>按老系统接口读取的全额显示</strong>（不动态计算扣除金额），员工<strong>现金补差 = 全额 − 常乐豆代缴金额</strong>；<strong>计入应税收入</strong>（作为 1 级收入项），保持工资条净到手 = 员工实收</td>
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
            <td><span style="color: hsl(var(--warning)); font-weight: 600;">过渡</span></td>
            <td><strong>福利保障数据 → 取老系统</strong>：社保（全）/ 社保（仅工伤）/ 公积金的<strong>个人部分金额</strong>通过老系统接口<strong>只读引用</strong>；新系统<strong>不维护</strong>城市基准系数、不生成月度流水、不做 Override 机制。<br/>
              <strong>商业险</strong>：由<strong>线下</strong>完成购买，<strong>成本归公司</strong>（不在新系统中做配置、记账、显示）。<strong>商业险</strong>：如果非全日制员工无法单独购买工伤险，则由<strong>雇主险</strong>兜底（线下处理）。</td>
          </tr>
          <tr>
            <td><span style="color: hsl(var(--warning)); font-weight: 600;">升级</span></td>
            <td><strong>关联模块数据源切换</strong>：6 个下游模块（<strong>付款单、凭证生成、计提生成、个税申报、社保清单、公积金</strong>）底层取值统一从「业绩表」切换为「<strong>模块化薪酬</strong>」</td>
          </tr>
        </tbody>
      </table>

      <div class="callout" style="background: hsl(var(--warning) / 0.08); border-left: 3px solid hsl(var(--warning)); padding: 10px 12px; margin-top: 8px; font-size: 13px; border-radius: 4px;">
        <strong>⚠️ 全局说明：1 门店 = 1 主体</strong><br/>
        <strong>① 门店与主体的对应关系：</strong>1 门店 = 1 主体，主体为门店对应的法人单位<br/>
        <strong>② 全职 / 返聘：</strong>1 个合同主体 = 入职门店（不允许挂店）。若隐瞒挂店事实则薪酬计算时统计该员工全部门店业绩，但发薪时仅使用主服务门店的主体<br/>
        <strong>③ 非全日制 / 兼职：</strong>允许通过签署挂店协议与多家门店的主体建立合作关系；计算薪酬和发放薪资时，以各主体为单位<strong>隔离</strong>进行（按门店分别结算、申报个税、发放工资）
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
            <td><strong>全职（劳动合同）</strong>、<strong>非全日制（劳动合同）</strong>、<strong>兼职（劳务合作）</strong>、<strong>返聘（劳务合作-退休返聘）</strong></td>
          </tr>
          <tr>
            <td><strong>常乐豆适用范围</strong></td>
            <td><strong>仅全职</strong>享有，<strong>不参与薪资计算</strong>（不计入应税收入），离职时余额全部提现</td>
          </tr>
          <tr>
            <td><strong>常乐豆使用优先级</strong></td>
            <td>① 抵<strong>公积金公司部分</strong><br/>② 抵<strong>公积金个人部分</strong>（不足员工现金补差，「代扣公积金」按全额显示）<br/>③ 用于代缴个人部分的常乐豆<strong>以「激励补贴」名义入第 1 个工资条，计入应税收入</strong><br/>④ 剩余可消费 / 离职提现（<strong>不抵扣社保/商业险</strong>）</td>
          </tr>
          <tr>
            <td><strong>福利保障数据来源</strong></td>
            <td>社保/公积金个人部分 ← <strong>老系统接口（只读）</strong>；商业险 ← <strong>暂不进入系统（线下购买，成本归公司）</strong>；不开发员工福利保障页</td>
          </tr>
          <tr>
            <td><strong>商业险（线下购买）</strong></td>
            <td><strong>线下完成购买</strong>，<strong>成本归公司</strong>；<strong>不参与工资计算</strong>、<strong>不进员工工资条</strong>、<strong>不显示在福利明细</strong></td>
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
            <td><strong>全职薪酬看板</strong>：3 tabs（日/月/到账），月支出含<strong>代扣公积金（员工足额自付部分）</strong><br/><strong>非全日制薪酬看板</strong>：4 tabs（日/周/月/到账），4 个分类筛选 + 回头客标记 + 多门店切换</td>
          </tr>
          <tr>
            <td><strong>通知（含门店 / 主体）</strong></td>
            <td>移动端通知列表显示<strong>主体</strong>，详情汇总显示<strong>主体名称</strong>，让员工清楚每条通知的资金来源</td>
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
              <td><strong>第1级收入 + 第2级收入 - 第1级扣款 - 第2级扣款（非预扣）</strong>，即提交报税的收入基数（详见「应税收入计算规则」）。<strong>常乐豆本身不计入应税收入</strong>；当常乐豆代缴公积金个人部分时，公司以<strong>「激励补贴」名义</strong>在第 1 个工资条增加等额收入，<strong>作为 1 级收入项计入应税收入</strong>。注意：<strong>第2级扣款（个税预扣）不参与应税收入</strong>（预扣是<strong>真正的个税</strong>，仅用于个税汇算；预扣所在工资条已发放，不可回溯修改）</td>
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
              <td>员工个人承担部分；<strong>v2-1 阶段</strong>金额由<strong>老系统接口</strong>提供，新系统<strong>只读引用</strong>作为工资条代扣项；<strong>员工足额自付</strong>，<strong>不依赖常乐豆</strong></td>
            </tr>
            <tr>
              <td><strong>商业险（线下购买）</strong></td>
              <td>v2-1 商业险<strong>暂不进入系统</strong>，由<strong>线下</strong>完成购买，<strong>成本归公司</strong>；<strong>不进员工工资条</strong>，<strong>不显示在福利明细</strong></td>
            </tr>
            <tr>
              <td><strong>门店</strong></td>
              <td>员工实际产生业绩的物理经营单位，<strong>1 门店 = 1 主体</strong>（详见「全局说明」）</td>
            </tr>
            <tr>
              <td><strong>合同主体</strong></td>
              <td>员工签署劳动合同/劳务协议/劳务合作的主体公司；全职/返聘员工仅 1 个合同主体（是否允许挂店待确认）</td>
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
      <div class="section-header">
        <h2 style="margin: 0;">应税收入计算规则（正式定义）</h2>
        <DocCopyButton section-id="taxable-income-rule" />
      </div>
      <p>本节给出 v2-1 系统中"应税收入"的<strong>正式公式与边界规则</strong>，作为工资条、个税计算、汇算等所有环节的口径基准。</p>

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

      <div class="card" style="background: hsl(var(--warning) / 0.05);">
        <h3>④ 边界规则</h3>
        <p>应税收入 ≤ 0 时，<strong>该工资条个税 = 0</strong>（不交税）；同时不触发负工资抵扣（应发也需 ≤ 0 才不抵扣）。</p>
      </div>

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

      <div class="card" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary));">
        <h3>⑥ 常乐豆与公积金 / 工资单的关系（关键认知）</h3>
        <p>常乐豆<strong>仅全职</strong>享有，<strong>优先抵扣公积金公司部分</strong>，<strong>剩余可继续抵扣公积金个人部分</strong>（不足部分由员工现金补差），<strong>不抵扣社保、不抵扣商业险</strong>。<strong>常乐豆本身不计入应税收入</strong>。公积金<strong>个人部分</strong>在工资条上按<strong>全额</strong>显示，金额由<strong>老系统接口读取</strong>；当常乐豆代缴了部分个人公积金时，公司会以<strong>「激励补贴」或类似名义</strong>在<strong>第 1 个工资条</strong>中增加等额收入，<strong>该「激励补贴」计入应税收入</strong>（作为 1 级收入项）。</p>
        <table class="data-table">
          <thead>
            <tr><th style="width: 200px;">场景</th><th>处理方式</th><th>对应应税收入计算</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>常乐豆优先抵扣公积金公司部分</strong></td>
              <td>抵<strong>公积金公司部分</strong>（公司部分由老系统记账，<strong>不进员工工资条</strong>）</td>
              <td>常乐豆<strong>不参与应税收入</strong>（既不计入收入，也不冲减收入）</td>
            </tr>
            <tr>
              <td><strong>常乐豆剩余继续抵扣公积金个人部分</strong></td>
              <td>① 抵<strong>公积金个人部分</strong>（<strong>最高不超过个人公积金总额</strong>，如 1200；<strong>不修改</strong>工资条上「代扣公积金」显示金额，仍按<strong>全额</strong>显示）<br/>② 抵掉的部分<strong>以「激励补贴」名义</strong>作为收入项加入<strong>第 1 个工资条</strong><br/>③ 不足部分由<strong>员工现金补差</strong>（= 1200 − 常乐豆代缴金额）</td>
              <td><strong>「激励补贴」计入应税收入</strong>（作为 1 级收入项；金额 = 常乐豆实际抵个人部分的金额，最高 1200）</td>
            </tr>
            <tr>
              <td><strong>常乐豆有剩余</strong>（仅全职）</td>
              <td>在职时仅可用于消费，不可提现；离职时可在<strong>常乐豆账户体系</strong>内操作提现</td>
              <td>消费/提现均<strong>不参与应税收入</strong></td>
            </tr>
            <tr>
              <td><strong>社保 / 商业险</strong>（不在常乐豆抵扣范围）</td>
              <td>· 社保公司部分 + 商业险公司部分：<strong>公司全额现金承担</strong>（不进员工工资条）<br/>· 社保个人部分：通过<strong>代扣社保</strong>从工资单现金扣减</td>
              <td>· 公司部分：<strong>不参与应税收入</strong>（不进入员工工资条）<br/>· 社保个人部分：作为<strong>扣缴项</strong>，<strong>不参与应税收入</strong></td>
            </tr>
          </tbody>
        </table>
        <div class="note" style="background: hsl(var(--warning) / 0.1); border-left: 3px solid hsl(var(--warning)); margin-top: 8px;">
          <strong>⚠ 关键：</strong>① 常乐豆<strong>本身</strong>不计入应税收入；② 当常乐豆代缴公积金个人部分时，<strong>「激励补贴」名义等额收入计入应税收入</strong>——本质是公司替员工承担的公积金个人部分，属于员工的隐性收入，应当计入应税基数；③ 工资条上「代扣公积金」<strong>始终按全额显示</strong>，与常乐豆无关；④ <strong>「激励补贴」默认进第 1 个工资条</strong>，便于与「代扣公积金」在同一工资条中体现。
        </div>
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import MindmapHero from '../docs/mindmap/MindmapHero.vue'
import { v2Phase1Tree } from '../docs/mindmap/trees/v2-phase1.js'
import DocShell from '../docs/components/DocShell.vue'
import DocCopyButton from '../docs/components/DocCopyButton.vue'
import { v2phase1Chapters } from '../docs/chapters.js'

// 章节导航（首页独有，指向各子页；数据源与左侧菜单共用 chapters.js）
const chapterNav = v2phase1Chapters.map(ch => ({
  order: ch.order,
  title: ch.title,
  subtitle: ch.subtitle,
  path: ch.path
}))

// 首页内页内目录
const tocItems = [
  { id: 'version', label: '版本日志' },
  { id: 'terms', label: '名词解释' },
  { id: 'taxable-income-rule', label: '应税收入计算规则' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '产品需求v2（阶段1）' }
]
</script>

<style scoped>
/* 章节导航卡片网格（首页独有） */
.chapter-nav h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid hsl(var(--primary));
}
.chapter-nav-tip {
  color: hsl(var(--muted-foreground));
  font-size: 13px;
  margin: 0 0 16px 0;
}
.chapter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}
.chapter-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  background: hsl(var(--background));
  text-decoration: none;
  color: inherit;
  transition: all 0.15s ease;
}
.chapter-card:hover {
  border-color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.04);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px hsl(var(--primary) / 0.1);
}
.chapter-card-index {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
}
.chapter-card-body { flex: 1; min-width: 0; }
.chapter-card-title {
  font-weight: 600;
  font-size: 14px;
  color: hsl(var(--foreground));
  margin-bottom: 2px;
}
.chapter-card-desc {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  line-height: 1.4;
}
.chapter-card-arrow {
  color: hsl(var(--muted-foreground));
  font-size: 18px;
  flex-shrink: 0;
  transition: transform 0.15s ease;
}
.chapter-card:hover .chapter-card-arrow {
  color: hsl(var(--primary));
  transform: translateX(2px);
}
</style>
