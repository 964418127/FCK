<template>
  <DocShell
    :toc-items="tocItems"
    title="6.3 离职处理与审核"
    subtitle="不管需求从员工发起还是异常监控触发，落到处理侧都是同一套「离职处理」：定日期、落状态、看资产、录协商金额、交付下游"
    version="v0.3"
    date="2026-10-26"
    :breadcrumbs="breadcrumbs"
  >
    <div class="section">
      <div class="section-header">
        <h2>6.3 离职处理与审核</h2>
        <DocCopyButton section-id="rf-62" />
      </div>
      <div class="func-entry"><strong>功能入口：</strong>移动端 → 离职模块 → <strong>离职处理</strong>（列表 <code>/mobile-resign-pd</code>）→ 点卡片进审核页</div>
      <DocScreens
        mode="phone"
        :images="[
          { src: mHomeShot, label: '统一列表：主动离职 / 异常监控两个 Tab，两类来源同一套处理' },
          { src: mDetailShot, label: '离职需求审核（确认前）：员工信息 + 月均收入（N+1 上限）+ 收款账户' },
          { src: mReleaseShot, label: '系统离职 · 解除确认：同一页完成资产 / 出口 / 补偿金' }
        ]"
      />
      <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary));">
        <strong>一次确认两个效果：</strong>审核人按模板审核链确认时，<strong>原审批的全部内容一次定稿</strong>
        （基础信息 / 离职类型 / 实际离职日期 / 补偿金 / 常乐豆出口）——
        ①<strong>进入交接流程</strong>；②<strong>预授权交接完成后系统自动推送离职合同</strong>（不再有「确认发出」）。
        实际离职日期在确认时锁定，<strong>排班取消与接单截断随之生效</strong>，不等交接走完。
      </div>
    </div>

    <div id="rf-62-list" class="section">
      <div class="section-header">
        <h3>6.3.1 处理列表（两个 Tab）</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 120px;">Tab</th><th style="width: 230px;">卡片信息</th><th style="width: 120px;">角标</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>主动离职</strong></td>
            <td>姓名 + 岗位标签 + 状态字、岗龄、岗位 · 合同门店 / 所在部门、申请日期</td>
            <td>待审核 / 已办结</td>
            <td>点卡片进入<strong>离职需求审核</strong>（6.3.2）</td>
          </tr>
          <tr>
            <td><strong>异常监控</strong></td>
            <td>姓名 + 工号 + 岗位、年龄性别工龄评分、合同门店、用工状态、未出勤天数</td>
            <td>未处理</td>
            <td>「暂停用工」只标记状态；「解除用工」进解除确认页（6.3.6）</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>角标与状态字不是一回事：</strong>角标是<strong>单据状态</strong>（这笔离职办到哪一步），状态字是<strong>员工状态</strong>（在职 / 已离职）。
        两者并列显示，避免把「流程没走完」误读成「人还在职」。
      </div>
      <h4 class="h4sub">搜索与筛选</h4>
      <p class="doc-p">顶部搜索框按<strong>姓名或工号</strong>过滤，只对当前 Tab 生效；无匹配时显示「没有匹配的离职申请 / 异常项」。</p>

      <h4 class="h4sub">异常监控的分阶段可见性</h4>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">人群</th><th style="width: 210px;">异常来源</th><th>依赖与上线节奏</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>门店侧</strong>（推拿师 / 客户经理）</td><td>连续未出勤（排班 / 接单数据可判）</td><td>离职侧已有数据，<strong>阶段一即可上线</strong></td></tr>
          <tr><td><strong>总部员工</strong></td><td><strong>考勤异常</strong></td><td>依赖假勤的考勤异常输出，<strong>阶段二</strong>并入</td></tr>
        </tbody>
      </table>
      <div class="note" style="background: hsl(0 72% 51% / 0.06); border-left: 3px solid hsl(0 72% 51% / 0.6);">
        <strong>提供不了就不展示：</strong>总部异常数据不可用时，该部分<strong>整体不展示</strong> —— 不做灰置、不做空列表、不给「暂无数据」。
        空列表会被读成「总部没有异常」，是很危险的误读。是否展示由<strong>数据源是否就绪</strong>判断（配置开关），不在前端写死。
      </div>
    </div>

    <div id="rf-62-review" class="section">
      <div class="section-header">
        <h3>6.3.2 离职需求审核（一次定稿）</h3>
      </div>
      <h4 class="h4sub">区域顺序</h4>
      <table class="data-table">
        <thead>
          <tr><th style="width: 50px;">序</th><th style="width: 170px;">区域</th><th>内容与规则</th></tr>
        </thead>
        <tbody>
          <tr><td>1</td><td>流程条</td><td><strong>离职需求审核 → 交接 → 发合同 · 签署</strong>三段态，当前段高亮</td></tr>
          <tr><td>2</td><td>员工头部 + 申请信息</td><td>姓名 / 工号 / 岗位标签 / 岗位 · 合同门店；申请时间、期望离职日期、离职原因</td></tr>
          <tr><td>3</td><td>员工信息（可收拢）</td><td>摘要行（年龄 / 工龄 / 等级 / 社保）+ <strong>过去 12 个月平均收入</strong>（补偿金计算基数，默认可见）+ <strong>收款账户默认显示</strong></td></tr>
          <tr><td>4</td><td>剩余资产</td><td>只读呈现，数值一律带「约」（口径见 6.3.3）</td></tr>
          <tr><td>5</td><td>款项出口</td><td>逐条款项选通道，默认并入薪金（规则见 6.3.4）</td></tr>
          <tr><td>6</td><td>离职补偿金</td><td>人工录入金额 + 备注；金额 &gt; 0 必须上传协商协议（规则与上限见 6.3.5）</td></tr>
          <tr><td>7</td><td>审核确认填写</td><td>离职类型、实际离职日期、离职原因、是否黑名单</td></tr>
          <tr><td>8</td><td>确认进入交接</td><td>确认后自动执行的影响面 + 条款 + 输入「确认」</td></tr>
          <tr><td>9</td><td>确认后形态</td><td>本页转<strong>只读</strong>：审核结果卡（离职类型 / 实际离职日期 / 补偿金与附件数）+ 状态条（交接中「交接完成自动发出离职合同」/ 已完成「已自动发出待员工签署」）</td></tr>
        </tbody>
      </table>

      <h4 class="h4sub">审核确认字段</h4>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">字段</th><th style="width: 160px;">控件</th><th>规则</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>离职类型</strong></td><td>单选</td><td>主动离职（<strong>默认</strong>）/ 协商一致解除劳动合同；被动离职<strong>置灰不可选</strong>（由异常监控触发）</td></tr>
          <tr><td><strong>实际离职日期</strong></td><td>日期选择器</td><td>必填；<strong>确认即锁定、不可更改</strong>，是下游所有结算的锚点</td></tr>
          <tr><td><strong>离职原因</strong></td><td>复选</td><td>可多选，默认带出员工发起时填的原因，人事可调整</td></tr>
          <tr><td><strong>是否黑名单</strong></td><td>单选（是 / 否）</td><td>默认否</td></tr>
        </tbody>
      </table>

      <h4 class="h4sub">按钮与提交条件</h4>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">按钮</th><th>可点条件 / 结果</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>作废</strong></td><td>确认前随时可点；单据作废并通知员工</td></tr>
          <tr>
            <td><strong>确认进入交接</strong></td>
            <td>已选<strong>实际离职日期</strong> 且 已输入「<strong>确认</strong>」 且 该员工<strong>负工资结算已完成</strong> 且（填了补偿金时）<strong>附件已上传</strong>；缺一即置灰，底部提示还缺哪一项</td>
          </tr>
        </tbody>
      </table>

      <h4 class="h4sub">确认后自动执行（按岗位呈现）</h4>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">动作</th><th style="width: 240px;">门店侧（推拿师 / 客户经理）</th><th>总部员工</th></tr>
        </thead>
        <tbody>
          <tr><td>排班取消</td><td>实际离职日期后的排班<strong>全部取消</strong></td><td>不适用（总部岗位不排班）</td></tr>
          <tr><td>接单权限</td><td>实际离职日期后<strong>截断</strong></td><td>不适用（总部岗位不接单）</td></tr>
        </tbody>
      </table>
      <div class="note">
        总部显示<strong>「不适用」而不是「0」</strong>：0 会被读成「查过了，确实没有」，而总部是这两个动作本身不存在。
        确认条款也跟着变 —— 总部版本去掉排班与接单两条，只留日期锁定与不可撤销。
      </div>
    </div>

    <div id="rf-62-assets" class="section">
      <div class="section-header">
        <h3>6.3.3 剩余资产：只读呈现</h3>
      </div>
      <DocScreens
        mode="phone"
        :images="[
          { src: mAssetsShot, label: '剩余资产卡片：只读呈现，来源逐项标注（常乐豆 / 负工资 / 假勤额度）' }
        ]"
      />
      <div class="note lead-note">
        <strong>一句话定位：</strong>让这笔账在审核这一步<strong>看得见</strong>。面板只取数、只呈现 —— <strong>不结算、不计算</strong>；
        真正锁住它的动作是<strong>次月 5 日冻结余额</strong>（见 6.5），不是审核时就冻。
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 150px;">资产项</th>
            <th style="width: 150px;">数据来源</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>常乐豆</strong></td>
            <td>常乐豆系统 / 薪酬结算</td>
            <td>三层分开显示：<strong>当前账面余额 / 待结数量 / 可提取</strong>。审核阶段看到的是<strong>负工资处理后的预估值</strong>（标「约」）；<strong>准确值要等次月 4 日晚充值进账户后才产生、5 日由离职通道冻结锁定</strong>。可提取额不是账面余额，冻结前也不是一个锁定的数</td>
          </tr>
          <tr>
            <td><strong>负工资账户</strong></td>
            <td>薪酬</td>
            <td><strong>只展示余额</strong>。抵扣 / 清零不在离职侧计算，也不在此呈现过程</td>
          </tr>
          <tr>
            <td><strong>剩余福利假额</strong></td>
            <td>假勤</td>
            <td>假勤出结果，离职侧只呈现天数，不折算、不结算</td>
          </tr>
          <tr>
            <td><strong>在途协商扣缴</strong></td>
            <td>薪酬扣缴协商</td>
            <td>协议总额 / 每月扣除 / 剩余未扣。离职后剩余部分如何处置<strong>待决</strong>（见附录）</td>
          </tr>
        </tbody>
      </table>

      <h4 class="h4sub">两条表达纪律</h4>
      <ul class="rf-list">
        <li>
          <strong>常乐豆按「预估」表达，不给精确结果数的观感。</strong>
          常乐豆在离职处理阶段随结算与负工资计算实时变动，界面上数值一律标「约」并加「预估」标识，文案明写「最终以薪酬实际结算为准」。
        </li>
        <li>
          <strong>面板上的数不能直接当「能提多少」。</strong>
          人事看到「账面余额 820」时，中间还夹着一道负工资抵扣，所以必须区分<strong>当前账面余额</strong>与<strong>可提取余额</strong>；
          审核时看到的是负工资处理后的预估值，标注「约」；<strong>准确值在次月 4 日晚充值进账户后替换进来、5 日冻结锁定</strong>，在此之前显示「待次月充值后确认」。
        </li>
      </ul>

      <div class="note warn-note">
        <strong>预估数据的用途声明：</strong>面板上必须让使用者知道这是<strong>预估</strong>、以薪酬实际结算为准。
        否则人事拿预估数去跟员工谈，事后数字变了就是纠纷。
      </div>
    </div>

    <div id="rf-62-payout" class="section">
      <div class="section-header">
        <h3>6.3.4 款项出口：协商二选一</h3>
      </div>
      <DocScreens
        mode="phone"
        :images="[
          { src: mPayoutShot, label: '款项出口卡片：一次性补偿金 / 并入薪金二选一，选择即选个税申报科目' }
        ]"
      />
      <p class="doc-p">
        员工手里的<strong>常乐豆余额</strong>要拿回去时，从哪条通道出去是可选的。
        通道由<strong>人事与员工协商确定</strong> —— 协商结果同时决定<strong>处理金额</strong>与<strong>个税归属</strong>。
        这是离职侧提供的设计：<strong>判断权交给人，系统负责留痕</strong>。
      </p>

      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 150px;">出口</th>
            <th style="width: 110px;">默认</th>
            <th style="width: 230px;">个税申报科目</th>
            <th>申报备注（原文）</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>一次性补偿金</strong></td>
            <td>—</td>
            <td>解除劳动合同一次性补偿金</td>
            <td><code>【解除劳动合同一次性补偿金】</code></td>
          </tr>
          <tr>
            <td><strong>并入薪金</strong></td>
            <td><strong>现状默认</strong></td>
            <td>工资薪金</td>
            <td><code>【工资薪金】</code></td>
          </tr>
        </tbody>
      </table>

      <div class="note">
        <strong>两个入口都要选出口：</strong>主动离职在审核页选；异常监控【解除用工】在解除确认页选（见 6.3.6）——
        出口是资产处置的一部分，<strong>不因「没有审批流程」而省略</strong>。
      </div>

      <div class="note lead-note">
        <strong>两个出口 = 两个个税申报科目，计税口径不同。</strong>
        选哪一个出口，决定的不是「给不给这笔钱」，而是它<strong>落进哪个申报科目</strong>、按哪套规则计税。
        <strong>出口由人事协商结果确定</strong>，不是系统自动判定。钱的流向与归集见 <router-link to="/docs/resign-flow/scope">5.4 资产流向与税务归集</router-link>。
      </div>

      <h4 class="h4sub">三条约束</h4>
      <ul class="rf-list">
        <li><strong>出口不含福利假。</strong>出口只针对常乐豆余额；剩余福利假额不走出口。</li>
        <li><strong>时序依赖。</strong>出口提取基数 = 当月抵扣后、<strong>4 日晚充值进账户</strong>、并经 <strong>5 日冻结</strong>锁定的余额。冻结动作只发生在 5 日 —— 因此「按锁定后的余额选出口 + 冻结」这件事只能排在 <strong>5 日</strong>，审核当时只能按约数先谈。</li>
        <li><strong>计税规则不在这里定义。</strong>两条通道的钱怎么定性、怎么计税由薪酬 / 财税按规则走，离职侧只记录「选了哪个出口」。</li>
      </ul>
    </div>

    <div id="rf-62-comp" class="section">
      <div class="section-header">
        <h3>6.3.5 离职补偿金：只录入，不算钱</h3>
      </div>
      <DocScreens
        mode="phone"
        :images="[
          { src: mCompShot, label: '补偿金卡片：金额（上限 N+1）+ 协商协议附件（必传校验），录的是预估' }
        ]"
      />
      <div class="note lead-note">
        <strong>一句话定位：</strong>承载「<strong>不在薪酬与福利资产自动核算范围内</strong>」的<strong>其他协商类金额</strong>。
        系统不猜金额，只保证「钱走哪条路、谁记的、什么状态」可追溯；<strong>这一页产出的是预估</strong>，
        金额怎么变成真实值、怎么发放，见 6.4 与 6.5。
      </div>

      <h4 class="h4sub">录入规则</h4>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 150px;">规则</th>
            <th>内容</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>承载范围</strong></td><td>薪酬与福利资产自动核算之外的<strong>协商类</strong>金额。福利假额等自动核算项不出现在这里</td></tr>
          <tr><td><strong>录入入口</strong></td><td><strong>两个</strong>：主动离职在审核页录入（金额随签署成立）；异常监控【解除用工】在解除确认页录入（<strong>随解除确认提交成立</strong>，见 6.3.6）</td></tr>
          <tr><td><strong>默认值</strong></td><td><strong>0</strong></td></tr>
          <tr><td><strong>取值范围</strong></td><td><strong>0 ～ 上限</strong>：上限 = <strong>过去 12 个月平均收入 ×（N+1）</strong>（N+1 为唯一上限，不叠单笔封顶）；<strong>不允许输入负数</strong></td></tr>
          <tr><td><strong>计算方式</strong></td><td>系统<strong>不自动折算</strong>，由人事与员工协商后手工录入</td></tr>
          <tr><td><strong>附件</strong></td><td>金额 &gt; 0 时<strong>必须上传协商协议附件</strong>，否则不能提交确认（见下）</td></tr>
          <tr><td><strong>备注</strong></td><td>自由文本，用于说明本笔协商类金额的构成与依据（<strong>不做结构化明细</strong>）</td></tr>
        </tbody>
      </table>

      <h4 class="h4sub">金额上限：过去 12 个月平均收入 ×（N+1）</h4>
      <p class="doc-p">
        审核页的员工信息里<strong>默认显示过去 12 个月平均收入</strong>，审核人不必再去翻薪酬档案 ——
        这个数就是补偿金的计算基数，上限按<strong>月均收入 ×（N+1）</strong>算，且<strong>这就是唯一的上限</strong>：
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 130px;">要素</th>
            <th>口径</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>基数</strong></td><td>员工<strong>过去 12 个月的平均收入</strong>，取数自薪酬；在审核页员工信息处默认可见（怎么取见下）</td></tr>
          <tr><td><strong>N</strong></td><td>在本单位工作的年限（本版按整年计）</td></tr>
          <tr><td><strong>+1</strong></td><td>代通知金一个月</td></tr>
          <tr><td><strong>上限</strong></td><td><strong>月均收入 ×（N+1）</strong>，不再叠加单笔封顶 —— 工龄越长上限越高，与协商实际可能达成的金额同向；长工龄员工不会被一个固定数字截断</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>上限是录入约束，不是推荐值</strong> —— 实际金额仍由人事在范围内按协商结果填写。
        上限只约束<strong>人事录入的协商现金</strong>；结转的常乐豆是另一笔取数（5 日冻结值），<strong>不占这个上限</strong> ——
        所以一笔补偿金单的总额可能高于协商现金本身。
      </div>

      <h4 class="h4sub">平均工资怎么算（取数方案）</h4>
      <p class="doc-p">
        上限算得准不准，取决于「月均收入」取的是不是同一个口径。当前员工薪酬落在<strong>两套体系</strong>里，
        所以取数按人群分两条：
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 190px;">人群</th>
            <th style="width: 200px;">取数来源</th>
            <th>取的字段</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>推拿师 / 客户经理</strong><br /><span class="tf-sub">门店侧</span></td>
            <td>模块化薪酬 · 人员薪酬明细</td>
            <td><strong>每个月的「收入小计」</strong>（该行工资单的收入汇总），取离职前 12 个薪酬周期<strong>求平均</strong></td>
          </tr>
          <tr>
            <td><strong>总部员工</strong><br /><span class="tf-sub">总部侧</span></td>
            <td>总部薪酬</td>
            <td><strong>指定周期内每月的实发工资</strong>，取离职前 12 个月<strong>求平均</strong></td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>为什么要分两条：</strong>门店侧员工的薪酬已切到模块化薪酬，逐月单据在「人员薪酬明细」里直接可查；
        总部员工仍走总部薪酬体系。<strong>同一个月均收入，暂时两个取数源</strong> —— 口径必须对齐（都取「这个人当月的工资性收入」），
        否则同样工龄的两个人算出来的上限不可比。
      </div>
      <div class="note" style="background: hsl(45 93% 47% / 0.08); border-left: 3px solid hsl(45 93% 47%);">
        <strong>三个边界仍待决：</strong>入职不足 12 个月怎么均分、无薪假月份是否计入分母、月均取不到时阻断提交还是人工兜底 ——
        写法与归属见附录，不在本节拍板。当前原型取第三种做兜底：取不到时<strong>不写死上限</strong>，界面提示「未取到月均收入」，由人事自行核对。
      </div>

      <h4 class="h4sub">协商协议附件（填了金额就必传）</h4>
      <ul class="rf-list">
        <li>只要补偿金金额 <strong>&gt; 0</strong>，<strong>必须上传协商协议附件</strong>，否则确认提交不可用；金额为 0 时不必上传。</li>
        <li>格式 PDF / JPG / PNG，单个不超过 10MB，最多 3 个。</li>
        <li>附件是<strong>这笔金额的依据</strong>：谈成什么、谁谈的，书面留档；Web 端「离职补偿金明细」可查看与回看（见 6.4）。</li>
        <li>附件与金额一起挂在录入记录上，后续重算 / 修正 / 稽核都以它为准，不靠口头或线下邮件补。</li>
      </ul>
    </div>

    <div id="rf-62-release" class="section">
      <div class="section-header">
        <h3>6.3.6 解除用工（异常监控）：只标记离职，不走签署</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 200px;">维度</th><th style="width: 200px;">主动离职</th><th>异常监控（解除用工）</th></tr>
        </thead>
        <tbody>
          <tr><td>员工侧发起</td><td>有（6.2）</td><td><strong>没有</strong>（员工不会自己发起）</td></tr>
          <tr><td>离职需求审核</td><td>有（定实际离职日期 / 类型 / 协商金额）</td><td><strong>没有</strong>；离职事实时点由人事在操作时确认</td></tr>
          <tr><td>离职协议签署</td><td>走签署状态机（见 6.4）</td><td><strong>不走签署</strong>；明细不产生待签署记录，<strong>以本次提交为补偿金成立点</strong></td></tr>
          <tr><td>员工状态</td><td>离职</td><td>离职（<strong>系统离职</strong>）</td></tr>
          <tr><td>排班取消 / 接单截断</td><td>审核确认后执行</td><td><strong>照常执行</strong>，不因「没走流程、没签协议」而免除</td></tr>
        </tbody>
      </table>
      <div class="note" style="background: hsl(0 72% 51% / 0.06); border-left: 3px solid hsl(0 72% 51% / 0.6);">
        <strong>容易漏的一点：</strong>「签署」只决定<strong>这笔协商类补偿金成不成立</strong>；
        「排班取消 / 接单权限截断」由<strong>离职状态生效</strong>驱动，与签署无关。触发点是解除确认、状态生效那一刻 ——
        否则会出现人已系统离职、排班还挂在门店表上的空档。
      </div>

      <h4 class="h4sub">页面内容（解除确认页）</h4>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">区域</th><th>内容与规则</th></tr>
        </thead>
        <tbody>
          <tr><td>员工头部 / 信息</td><td>姓名工号、年龄性别工龄评分、岗位 · 等级 · 技法；<strong>离职类型：被动离职</strong>、<strong>离职方式：系统离职</strong>、合同门店、用工状态、监控开始</td></tr>
          <tr><td>异常提示</td><td>未出勤 N 天</td></tr>
          <tr><td>收款账户 / 剩余资产</td><td>均只读，形态与审核页一致</td></tr>
          <tr><td>款项出口</td><td>常乐豆二选一，默认并入薪金（规则见 6.3.4）；<strong>本入口同样要处置资产</strong>，不因「无审批」省略</td></tr>
          <tr><td>离职补偿金</td><td>默认 0、不许负数、上限 = 月均 ×（N+1）；金额 &gt; 0 必传依据附件 + 备注（口径见 6.3.5）</td></tr>
          <tr><td>解除确认</td><td>离职事实时点（必填）、解除原因说明、5 条条款、输入「确认」</td></tr>
        </tbody>
      </table>

      <h4 class="h4sub">条款与按钮</h4>
      <ul class="rf-list">
        <li>解除后员工状态标记为离职（系统离职），<strong>不再发起离职协议签署</strong>。</li>
        <li>解除后该时点之后的<strong>排班全部取消</strong>，员工失去接单权限。</li>
        <li><strong>资产随本次提交一并处置</strong>：款项出口与补偿金同时生效，补偿金进入次月 5 日冻结后的跑批。</li>
        <li>此操作<strong>不可撤销</strong>（出口与补偿金请在提交前确认）。</li>
      </ul>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">按钮</th><th>可点条件 / 结果</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>暂停用工</strong></td><td>随时可点；只标记状态，不解除</td></tr>
          <tr><td><strong>解除用工</strong></td><td>已选<strong>离职事实时点</strong> 且 已输入「确认」；若补偿金 &gt; 0，还需<strong>已上传依据附件</strong></td></tr>
        </tbody>
      </table>
    </div>

    <div id="rf-62-edge" class="section">
      <div class="section-header">
        <h3>6.3.7 边界</h3>
      </div>
      <div class="note">
        <strong>只保留这两类入口：</strong>本模块在重构离职，只处理「人怎么走」。
        列表里的<strong>【合同续签】不纳入本模块</strong> —— 合同续签属于<strong>人员异动</strong>（合同层面的续、改、止），
        不产生离职事实，也不进签署与补偿金链路。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'
import DocScreens from '../../../docs/components/DocScreens.vue'
import mHomeShot from '../../../docs/assets/pages/m-resign-home.png'
import mDetailShot from '../../../docs/assets/pages/m-resign-detail.png'
import mReleaseShot from '../../../docs/assets/pages/m-resign-release.png'
import mAssetsShot from '../../../docs/assets/pages/m-resign-detail-assets.png'
import mPayoutShot from '../../../docs/assets/pages/m-resign-detail-payout.png'
import mCompShot from '../../../docs/assets/pages/m-resign-detail-comp.png'

const tocItems = [
  { id: 'rf-62-list', label: '6.3.1 处理列表（两个 Tab）' },
  { id: 'rf-62-review', label: '6.3.2 离职需求审核（一次定稿）' },
  { id: 'rf-62-assets', label: '6.3.3 剩余资产' },
  { id: 'rf-62-payout', label: '6.3.4 款项出口' },
  { id: 'rf-62-comp', label: '6.3.5 离职补偿金（录入）' },
  { id: 'rf-62-release', label: '6.3.6 解除用工' },
  { id: 'rf-62-edge', label: '6.3.7 边界' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '离职流程', to: '/docs/resign-flow' },
  { label: '六、功能详细说明', to: '/docs/resign-flow/features' },
  { label: '6.3 离职处理与审核' }
]
</script>

<style scoped src="./doc-base.css"></style>

<style scoped>
.lead-note {
  background: hsl(var(--primary) / 0.05);
  border-left: 3px solid hsl(var(--primary));
}
.warn-note {
  background: hsl(0 65% 50% / 0.06);
  border-left: 3px solid hsl(0 65% 50%);
}
</style>
