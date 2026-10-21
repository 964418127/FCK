<template>
  <DocShell
    :toc-items="tocItems"
    title="离职流程 · Web 端功能说明"
    subtitle="Web 侧由两部分组成：离职补偿金明细（看金额、跟状态）与模块化薪酬侧的配置（新增「补偿金」这一类单据，让它能算、能出单、能进薪酬明细）。先讲功能范围，再按配置顺序逐项写。"
    version="v0.1"
    date="2026-10-20"
    :breadcrumbs="breadcrumbs"
  >
    <!-- ========== 一、文档信息 ========== -->
    <div id="rp-info" class="section">
      <div class="section-header">
        <h2>一、文档信息</h2>
        <DocCopyButton section-id="rp-info" />
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 150px;">项</th>
            <th>内容</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>文档名称</td><td>离职流程 · Web 端功能说明</td></tr>
          <tr><td>适用端</td><td>Web 后台（离职模块 + 模块化薪酬）</td></tr>
          <tr><td>配套文档</td><td>一、产品需求说明（6.7 / 6.8 讲清为什么这么接）；二、移动端功能说明（金额从哪来）</td></tr>
          <tr><td>负责人</td><td>Lacus7</td></tr>
          <tr><td>版本</td><td>v0.1</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>先说清边界：</strong>补偿金的<strong>金额不是后台算出来的</strong> —— 人事在离职流程里协商后录入。
        后台这一侧只负责三件事：<strong>取数、计税、组单</strong>。所以本文的「配置」都围绕这三件事，不涉及任何金额规则的人工维护。
      </div>
    </div>

    <!-- ========== 二、配置总览 ========== -->
    <div id="rp-overview" class="section">
      <div class="section-header">
        <h2>二、Web 侧功能与配置总览</h2>
        <DocCopyButton section-id="rp-overview" />
      </div>
      <p class="doc-p">
        Web 侧只有两块：一是<strong>离职补偿金明细</strong>（人事与财务看金额、跟状态，只读）；二是<strong>模块化薪酬侧的配置</strong>，
        让补偿金能算、能出单、能进薪酬明细。配置全貌如下 —— <strong>4 项是机制改动</strong>（必须改代码 / 结构），
        其余是新增数据、枚举与展示，不动现有发薪主链路。
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 60px;">序</th>
            <th style="width: 170px;">所在系统 / 页面</th>
            <th style="width: 220px;">配置项</th>
            <th style="width: 110px;">性质</th>
            <th>影响</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>模块化薪酬 · 薪酬单据</td>
            <td>单据类型枚举新增「<strong>补偿金</strong>」</td>
            <td><span class="tag-data">新增枚举</span></td>
            <td>让系统能产出一种与工资单、常乐豆单并列的第三类单据</td>
          </tr>
          <tr>
            <td>2</td>
            <td>模块化薪酬 · 薪酬项配置</td>
            <td>新增【<strong>补偿金个税</strong>】<strong>系统项</strong></td>
            <td><span class="tag-mech">新增机制</span></td>
            <td>补偿金按自己的口径计税，与工资薪金个税不同源</td>
          </tr>
          <tr>
            <td>3</td>
            <td>模块化薪酬 · 薪酬项配置</td>
            <td>新增补偿金相关<strong>薪酬项</strong></td>
            <td><span class="tag-data">新增配置</span></td>
            <td>HR 按需配，决定补偿金单上展示哪些款项行</td>
          </tr>
          <tr>
            <td>4</td>
            <td>模块化薪酬 · 发放策略详情</td>
            <td>新增「<strong>补偿金</strong>」分类（第三类映射）</td>
            <td><span class="tag-mech">新增机制</span></td>
            <td>与「工资单映射 / 常乐豆映射」并列；补偿金<strong>默认跟随策略所属的薪酬模板</strong>、不进「应发之和」等式</td>
          </tr>
          <tr>
            <td>5</td>
            <td>模块化薪酬 · 发放策略 · 匹配人群</td>
            <td>新增「<strong>离职</strong>」维度字段（离职状态 / 实际离职日期）</td>
            <td><span class="tag-mech">新增字段</span></td>
            <td>策略据此取「上月内离职的人」</td>
          </tr>
          <tr>
            <td>6</td>
            <td>模块化薪酬 · 发放策略</td>
            <td>计算触发支持「<strong>常乐豆余额冻结后</strong>启动」</td>
            <td><span class="tag-mech">新增机制</span></td>
            <td>补偿金里的常乐豆取<strong>4 日晚已充进账户的余额</strong>，5 日<strong>冻结把数锁住</strong>后才用于计税出单；5 日冻结后跑批</td>
          </tr>
          <tr>
            <td>7</td>
            <td>模块化薪酬 · 人员薪酬明细</td>
            <td>展示<strong>补偿金单</strong></td>
            <td><span class="tag-data">改展示</span></td>
            <td>同月能与工资单并列看到两笔（离职员工）</td>
          </tr>
          <tr>
            <td>8</td>
            <td>离职模块 · 离职补偿金明细</td>
            <td>无需配置（只读）</td>
            <td><span class="tag-reuse">复用</span></td>
            <td>仅展示与留痕；录入发生在移动端离职流程内</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>不动什么：</strong>现有发薪主链路（工资单的组装、确认、发放）不改；
        补偿金<strong>不进社保清单、不进公积金清单</strong>；也不参与工资单的「应发之和 = 总净工资」这条等式。
      </div>
    </div>

    <!-- ========== 三、离职补偿金明细 ========== -->
    <div id="rp-ledger" class="section">
      <div class="section-header">
        <h2>三、离职补偿金明细（Web · 只读）</h2>
        <DocCopyButton section-id="rp-ledger" />
      </div>
      <div class="func-entry"><strong>功能入口：</strong>Web → 离职 → 离职补偿金明细（<code>/resign-compensation-ledger</code>）</div>

      <h3>它能做什么 / 不能做什么</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 120px;">能力</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>能看</td><td>谁录入、<strong>协商协议附件</strong>、<strong>三段金额</strong>（预估 / 计算 / 发放）、差异与原因、关联哪张离职单、签署状态与<strong>补偿金是否成立</strong></td></tr>
          <tr><td>能筛</td><td>按姓名 / 工号 / 输入人搜索；按签署状态过滤</td></tr>
          <tr><td><strong>不能新增</strong></td><td>录入入口只在移动端离职流程内；明细<strong>不提供新增按钮</strong>，避免两处可改</td></tr>
          <tr><td><strong>不能计算</strong></td><td>金额是人事填的、计算由薪酬跑；明细不折算、不重算；<strong>冻结也不在明细里</strong>（冻结是离职流程 5 日的动作）</td></tr>
        </tbody>
      </table>

      <h3>页面结构</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 150px;">区域</th>
            <th>内容</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>金额三段条</td><td>预估（签署发起）→ 计算（次月 5 日冻结余额后跑批、6 日报税后定稿）→ 发放（次月 9 日），每个时点一句口径说明</td></tr>
          <tr><td>签署状态图例</td><td>待发起签署 → 待员工签署 → 员工已签 → 签署完成；分支：已拒签 / 已作废</td></tr>
          <tr><td>统计卡（4 张）</td><td>按<strong>金额阶段</strong>汇总：预估中 / 已计算待发 / 已发放 / 已作废</td></tr>
          <tr><td>录入记录表</td><td>员工（工号 · 岗位）、<strong>预估</strong>（金额 + 现金/常乐豆构成 + 时间）、<strong>计算</strong>（实发 + 税前/个税 + 时间）、<strong>发放</strong>（到账 + 时间）、<strong>预估 → 实际差异</strong>、签署状态 / 补偿金成立、<strong>协商协议</strong>（文件名，点击查看）、查看</td></tr>
          <tr><td>展开行</td><td>三列并排：预估构成 / 计算构成（现金、常乐豆冻结值（已含当月抵扣）、税前、个税、实发）/ 发放（到账、与预估差）；下方一行<strong>差异原因</strong> + 录入人与关联离职单</td></tr>
          <tr><td>明细抽屉</td><td>纵向时间线走一遍三段金额 + 差异原因 + <strong>协商协议附件</strong>（文件名 / 大小 / 上传人与时间，可查看）+ 录入单号 / 录入人 / 实际离职日期 / 关联单 / 签署状态 / 备注</td></tr>
        </tbody>
      </table>

      <h3>协商协议附件：金额的依据</h3>
      <p class="doc-p">
        补偿金金额是谈出来的，必须有一份书面依据。移动端录入时<strong>金额 &gt; 0 就必须上传协商协议</strong>，
        明细把附件挂回同一条记录 —— 人事、财务、稽核看到金额时直接点开看依据，不用再翻邮件或共享盘。
      </p>
      <ul class="rf-list">
        <li><strong>必传条件</strong>：金额 &gt; 0；金额为 0 时不需要。</li>
        <li><strong>格式与大小</strong>：PDF / JPG / PNG，单个 ≤ 10MB，最多 3 个。</li>
        <li><strong>列表</strong>：文件名可直接点击查看（原型为提示）；<strong>抽屉</strong>里另附大小、上传人、上传时间。</li>
        <li>附件<strong>不能在明细里替换</strong> —— 明细只读，要换得回离职流程重走审批，保证「金额与依据一起变」。</li>
      </ul>

      <h3>金额上限按人算：月均 ×（N+1）</h3>
      <p class="doc-p">
        录入上限按人算：<strong>过去 12 个月平均收入 ×（N+1）</strong>，这就是唯一上限，不再叠单笔封顶。
        审批页员工信息里默认显示这个月均收入，审批人当场就能判断金额是否在合理范围（口径见需求文档 6.7）。
        月均收入门店侧取模块化薪酬的<strong>每月收入小计</strong>、总部取总部薪酬的<strong>每月实发</strong> —— 两套体系，一个口径。
      </p>

      <h3>三段金额各是什么</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 80px;">时点</th>
            <th style="width: 150px;">什么时候</th>
            <th>金额</th>
            <th style="width: 190px;">为什么会与上一段不同</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>预估</strong></td>
            <td>签署发起时</td>
            <td>协商现金 + 常乐豆出口（标「约」）</td>
            <td>此段只是快照，常乐豆余额还没被冻结锁定</td>
          </tr>
          <tr>
            <td><strong>计算</strong></td>
            <td>次月 5 日（冻结后跑批）<br />6 日报税后定稿</td>
            <td>协商现金 + 常乐豆<strong>冻结值</strong> = 税前；税前 − 【补偿金个税】 = <strong>实发</strong>（报税前的计算值，6 日报税回写后定稿）</td>
            <td>员工<strong>继续上班</strong>（常乐豆变多）、当月工资的负数<strong>已在 3 日结算时用常乐豆抵扣</strong>（冻结值即抵扣后，不再二次扣）</td>
          </tr>
          <tr>
            <td><strong>发放</strong></td>
            <td>次月 9 日</td>
            <td>实发金额到账，回写到账时间（付款单在 6 日报税、数据完善后出）</td>
            <td>正常应与计算一致；不一致（部分成功 / 退回）需在异常清单里追</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        差异<strong>不要求人事确认</strong>，但必须<strong>有原因可读</strong>：计算段落的是「常乐豆 300 → 370，其中 50 抵当月负工资、进账户 320；补偿金个税 27」这种一句话说明，
        明细直接展示，不做二次计算。
      </div>

      <h3>签署决定的是「成不成立」，不是「金额生效」</h3>
      <div class="note" style="background: hsl(0 72% 51% / 0.06); border-left: 3px solid hsl(0 72% 51% / 0.6);">
        <strong>顺序要拧清：协议先走，金额后置。</strong>
        签署那一刻明细上只有<strong>预估</strong>（协商现金 + 常乐豆约数），并没有最终金额可「生效」；
        真实金额是协议成立之后、<strong>次月 5 日</strong>冻结余额后跑批才被算出来的（6 日报税后定稿）。
        算出来的值<strong>按规则产生</strong>，不需要再签一次。
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 240px;">签署状态</th>
            <th style="width: 110px;">补偿金</th>
            <th>含义</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>待发起签署 / 待员工签署 / 员工已签</td><td>待成立</td><td>这笔补偿金还定不下来，不进入计算</td></tr>
          <tr><td>签署完成</td><td><strong>已成立</strong></td><td>协议成立，进入次月 5 日跑批（金额此时才产生）</td></tr>
          <tr><td>已拒签 / 已作废</td><td>已作废</td><td>协议不成立，不进入计算，也不产生这笔钱</td></tr>
        </tbody>
      </table>
      <div class="note">
        明细上的金额在签署阶段是<strong>挂账的预估</strong>；签署回答的是「这笔钱做不做」，
        <strong>不产生金额、也不改变计算与发放的节奏</strong>（次月 5 日跑批、6 日报税后定稿、次月 9 日发）。
        另：异常监控的【解除用工】不走签署，因此<strong>不会在明细上产生待签署行</strong>；
        它的出口与补偿金在<strong>解除确认页</strong>一并录入，补偿金<strong>随解除确认提交即成立</strong>（见产品需求说明 6.2）。
      </div>
    </div>

    <!-- ========== 四、模块化薪酬侧配置 ========== -->
    <div id="rp-payroll" class="section">
      <div class="section-header">
        <h2>四、模块化薪酬侧配置（逐项）</h2>
        <DocCopyButton section-id="rp-payroll" />
      </div>
      <p class="doc-p">
        补偿金要通过模块化薪酬发出去，本质是<strong>在既有四层里各加一格</strong>：配置层加一个分类、计算层加一个系统项、
        结算层多一种单据、展示层多一列数据。下面按<strong>先结构、后配置</strong>的顺序写。
      </p>

      <h4 class="h4sub">4.1 单据类型枚举：新增「补偿金」</h4>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 160px;">项</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>配置位置</td><td>薪酬单据 · 单据类型枚举</td></tr>
          <tr><td>新增值</td><td><code>补偿金</code>（与「工资单」「常乐豆单」同级）</td></tr>
          <tr><td>作用</td><td>决定产出单据的性质；决定人员薪酬明细里按哪一类归集与展示</td></tr>
          <tr><td>不影响的</td><td>不影响发放链路 —— 出单之后的确认、发放、付款单走同一套</td></tr>
        </tbody>
      </table>

      <h4 class="h4sub">4.2 薪酬项：【补偿金个税】系统项 + 补偿金薪酬项</h4>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 160px;">项</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>【补偿金个税】</td><td><strong>系统项</strong>，由系统按补偿金口径计算，<strong>不由 HR 配公式</strong>；它替代了工资单里「工资薪金个税」的位置</td></tr>
          <tr><td>补偿金薪酬项</td><td>HR 按需新增，用于组成补偿金单的款项行（如协商一次性现金、走补偿金通道的常乐豆余额）</td></tr>
          <tr><td>分组</td><td>沿用现有的「薪酬项分组 / 扣缴项分组」结构，不新造一套</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>口径提醒：</strong>补偿金个税与工资薪金个税是<strong>两个不同的申报科目</strong>
        （申报备注分别为 <code>【解除劳动合同一次性补偿金】</code> 与 <code>【工资薪金】</code>）。
        所以必须各自独立成一个系统项，不能共用一个。
      </div>

      <h4 class="h4sub">4.3 发放策略详情：新增「补偿金」分类</h4>
      <p class="doc-p">
        发放策略详情当前有两个分类 Tab：<strong>工资单映射</strong> / <strong>常乐豆映射</strong>。补偿金要加成第三个：
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 150px;">项</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>新增 Tab</td><td><strong>补偿金映射</strong>，与另外两个并列，结构一致（映射展示名称 / 薪酬项类型 / 薪酬项名称 / 支付形式 / 来源）</td></tr>
          <tr><td>是否挂模板</td><td><strong>默认跟随薪酬模板</strong> —— 补偿金分类挂在策略所属的岗位薪酬模板下（详情页展示模板名），跟随模板的增删与生效；只是它的款项组成固定两项（协商现金 + 结转常乐豆），不从模板公式计算</td></tr>
          <tr><td>是否进等式</td><td><strong>不进</strong>「应发之和 = 总净工资」；补偿金单独立成一张单</td></tr>
          <tr><td>为什么单独一类</td><td>单独的原因是<strong>单据形态</strong>（独立申报科目、独立取数时点），不是脱离模板 —— 分类归属默认跟随策略的薪酬模板，但不能硬塞进工资单映射</td></tr>
        </tbody>
      </table>

      <h4 class="h4sub">4.4 发放策略 · 匹配人群：新增「离职」维度</h4>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 160px;">项</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>新增字段</td><td><strong>离职状态</strong>、<strong>实际离职日期</strong></td></tr>
          <tr><td>用途</td><td>策略据此取「<strong>上月内离职的人</strong>」作为补偿金单的计算人群</td></tr>
          <tr><td>字段来源</td><td>离职侧交付的「离职事实 + 实际离职日期」，薪酬侧只读消费</td></tr>
        </tbody>
      </table>

      <h4 class="h4sub">4.5 计算触发：5 日冻结余额后启动</h4>
      <ul class="rf-list">
        <li>补偿金里有一笔是<strong>走补偿金通道的常乐豆余额</strong>，必须取<strong>冻结后的余额</strong> —— 冻结之前没锁，谈的只是一个约数。</li>
        <li>现状节奏是 <strong>3 日算（薪酬 + 常乐豆）→ 4 日晚把抵扣后的余额充值进账户 → 5 日（在职提现 / 离职冻结）→ 6 日报税 → 9 日发放</strong>。
        <strong>4 日晚钱进账户时，余额就已经是准确的</strong>，不需要再等一天取数。</li>
        <li>5 日对<strong>在职员工</strong>是「自己提交提现」；对<strong>离职员工</strong>是「按流程<strong>冻结</strong>这笔余额」——
        同一时点、两种动作，冻结本身是唯一动作。冻结之后余额不再变动，补偿金按<strong>冻结值</strong>跑批。</li>
        <li>因此计算触发挂在<strong>「余额冻结完成」事件</strong>上（5 日），不是审批通过就跑，也不写死凌晨时点；
        该冻结未冻结的进<strong>异常清单</strong>等补跑。</li>
        <li>计算完成后产出补偿金单（申报前的计算值）。<strong>顺序是 6 日报税 → 工资单与补偿金单数据完善 → 出付款单 → 9 日到账</strong>；
        付款单在报税之后才出，不能提前。</li>
      </ul>

      <h4 class="h4sub">4.6 人员薪酬明细：展示补偿金单</h4>
      <p class="doc-p">
        人员薪酬明细当前已是「工资单 + 常乐豆单」多单并列形态，补偿金单是自然的<strong>第三种</strong>。
        离职员工在离职当月应能看到<strong>两笔并列</strong>：一笔工资单、一笔补偿金单。
      </p>
    </div>

    <!-- ========== 五、配置顺序 ========== -->
    <div id="rp-order" class="section">
      <div class="section-header">
        <h2>五、配置顺序与依赖</h2>
        <DocCopyButton section-id="rp-order" />
      </div>
      <p class="doc-p">后面依赖前面的产出，顺序不能颠倒：</p>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 70px;">步骤</th>
            <th style="width: 230px;">做什么</th>
            <th>为什么必须在这步</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>1</td><td>单据类型枚举加「补偿金」</td><td>后面所有配置都要引用这个类型</td></tr>
          <tr><td>2</td><td>薪酬项配置加【补偿金个税】系统项与补偿金薪酬项</td><td>映射与组成要挑得到项，没有项就配不了映射</td></tr>
          <tr><td>3</td><td>发放策略新增「补偿金映射」分类</td><td>有了分类才能装第 2 步配的项</td></tr>
          <tr><td>4</td><td>匹配人群加「离职」维度</td><td>决定这笔单<b>发给谁</b>，与映射是两件事，可并行但都要有</td></tr>
          <tr><td>5</td><td>计算触发挂到「常乐豆余额冻结」</td><td>触发条件依赖 5 日冻结事件，放最后接</td></tr>
          <tr><td>6</td><td>人员薪酬明细放开补偿金单展示</td><td>前面都通了，才看得到数据</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>验证口径：</strong>配完后拿一个上月离职的员工跑一遍，应能同时看到补偿金单与工资单两张单，
        且补偿金<strong>不出现在社保 / 公积金清单</strong>里，也不改变工资单的实发合计。
      </div>
    </div>

    <!-- ========== 六、校验与常见错误 ========== -->
    <div id="rp-check" class="section">
      <div class="section-header">
        <h2>六、校验与常见错误</h2>
        <DocCopyButton section-id="rp-check" />
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 230px;">现象</th>
            <th style="width: 240px;">原因</th>
            <th>处理</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>算出来是 0，但人确实离职了</td>
            <td>离职单未生效 / 协议未成立（签署未完成）/ 实际离职日期不在上个周期内</td>
            <td>核对离职状态与日期；落在别的期次属正常，改期次重取</td>
          </tr>
          <tr>
            <td>常乐豆那部分金额对不上</td>
            <td>取值时点早于 5 日冻结，余额尚未锁定</td>
            <td>等 5 日冻结后重算，不要手工补差</td>
          </tr>
          <tr>
            <td>补偿金单里金额为 0</td>
            <td>人事未录入协商金额（默认为 0）</td>
            <td>回离职流程补录；后台不代填</td>
          </tr>
          <tr>
            <td>明细上有挂账但一直「待成立」</td>
            <td>离职协议签署未完成</td>
            <td>催签署；签署完成后状态自动翻牌为「已成立」，下一期进入计算</td>
          </tr>
          <tr>
            <td>人员薪酬明细里看不到补偿金单</td>
            <td>单据类型未加、或明细未放开该类展示</td>
            <td>按第五章顺序回查第 1、6 步</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>后台必须留的三个口子（配置之外的能力要求）：</strong>
        <strong>修正</strong>（录错金额怎么改）、<strong>重算</strong>（冻结后余额有变动、个税口径调整）、
        <strong>异常清单</strong>（未录金额 / 余额未冻结 / 签署未完成，要能排查，不能静默跳过）。
      </div>
    </div>

    <!-- ========== 七、责任分工 ========== -->
    <div id="rp-owner" class="section">
      <div class="section-header">
        <h2>七、责任分工</h2>
        <DocCopyButton section-id="rp-owner" />
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 190px;">角色</th>
            <th>负责</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>人事</strong></td><td>在离职流程里录协商金额与备注、选款项出口；签署推进</td></tr>
          <tr><td><strong>薪酬专员 / HR 配置</strong></td><td>薪酬项、发放策略的「补偿金映射」与匹配人群</td></tr>
          <tr><td><strong>薪酬 / 财税</strong></td><td>补偿金个税口径、申报科目与批次安排</td></tr>
          <tr><td><strong>本场景（离职）</strong></td><td>只交付「离职事实 + 实际离职日期」与协商金额；不参与计算与出单</td></tr>
          <tr><td><strong>财务</strong></td><td><strong>人工计提科目</strong> —— 按【解除劳动合同一次性补偿金】科目人工计提（与申报科目一致，不随发薪自动产生）；凭证取数需在选型时确认覆盖方式</td></tr>
        </tbody>
      </table>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../docs/components/DocShell.vue'
import DocCopyButton from '../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'rp-info', label: '一、文档信息' },
  { id: 'rp-overview', label: '二、配置总览' },
  { id: 'rp-ledger', label: '三、离职补偿金明细' },
  { id: 'rp-payroll', label: '四、模块化薪酬侧配置' },
  { id: 'rp-order', label: '五、配置顺序与依赖' },
  { id: 'rp-check', label: '六、校验与常见错误' },
  { id: 'rp-owner', label: '七、责任分工' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '离职流程', to: '/docs/resign-flow/requirement' },
  { label: '三、Web 端功能说明' }
]
</script>

<style scoped>
.doc-p { font-size: 13.5px; line-height: 1.8; color: hsl(var(--foreground)); margin: 10px 0; }
.rf-list { margin: 10px 0; padding-left: 20px; }
.rf-list li { font-size: 13.5px; line-height: 1.9; margin-bottom: 4px; color: hsl(var(--foreground)); }
.func-entry {
  font-size: 12.5px; color: hsl(var(--muted-foreground));
  background: hsl(var(--muted) / 0.35);
  border-radius: 6px; padding: 8px 12px; margin: 10px 0 16px;
}
.h4sub {
  font-size: 13.5px; font-weight: 600; color: hsl(var(--foreground));
  margin: 20px 0 8px; padding-left: 9px;
  border-left: 3px solid hsl(var(--primary) / 0.45);
}
.tag-mech, .tag-data, .tag-reuse {
  font-size: 11.5px; padding: 1px 7px; border-radius: 9px; white-space: nowrap;
}
.tag-mech { color: hsl(0 65% 40%); background: hsl(0 65% 50% / 0.1); }
.tag-data { color: hsl(210 70% 38%); background: hsl(210 70% 50% / 0.1); }
.tag-reuse { color: hsl(150 40% 30%); background: hsl(150 45% 42% / 0.12); }
code {
  background: hsl(var(--muted) / 0.6);
  border-radius: 4px; padding: 1px 5px;
  font-family: ui-monospace, Menlo, Consolas, monospace;
}
</style>
