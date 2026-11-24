<template>
  <DocShell
    :toc-items="tocItems"
    title="6.3 应答深度分层与公式开放度"
    subtitle="四层归层（数据可得性 × 敏感度）+ 76 项现金薪酬项逐项定「允不允许查公式」"
    version="v2.6"
    date="2026-11-24"
    :breadcrumbs="breadcrumbs"
  >
    <div id="sa-63-why" class="section">
      <div class="section-header">
        <h2>为什么需要分层</h2>
        <DocCopyButton section-id="sa-63-why" />
      </div>
      <p class="doc-p">
        员工的问题不是一个「项名」，而是一个求证：<strong>「这个数怎么来的、对不对」</strong>。
        但不是每个项都能回答到这个深度——能不能还原、还原到哪一步，取决于两件事：
        <strong>数据可得性</strong>（计算输入是否都在数据面里）和<strong>敏感度</strong>（还原过程会不会暴露不该摊的东西）。
        两件事都是客观事实，不由话术决定，所以分层是硬规则：每个薪酬项归入且只归入一层，
        归层结果标注在附录底账（7.2 – 7.4）每一行上。
      </p>
    </div>

    <div id="sa-63-criterion" class="section">
      <div class="section-header">
        <h2>归层判据</h2>
        <DocCopyButton section-id="sa-63-criterion" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 90px;">层级</th><th style="width: 250px;">判据（三条同时满足才进求证层）</th><th>答到多深</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>L1 完整求证</strong></td>
            <td>① 计算输入是员工本人可见的业务事实（自己的订单、接待、卫生记录）② 计算规则可命中为具体数值 ③ 还原过程不暴露他人数据与内部账务</td>
            <td>给事实 → 给规则命中 → 给计算过程 → 给结论判定：「15 块 = 3 单 × 5 元，正确」或「有出入，出入在…，转人工」（6.4 走完整链路）</td>
          </tr>
          <tr>
            <td><strong>L2 只答结论</strong></td>
            <td>结论在工资条上，但满足以下任一条：计算输入含内部口径 / 第三方内容（如投诉处理结果）、或项本身是人工行政动作（无计算可还原）</td>
            <td>只给项名 + 金额 + 所属工资单 + 发放时间与状态，不给基数、不给过程、不做两期变动归因</td>
          </tr>
          <tr>
            <td><strong>L3 账户级汇总</strong></td>
            <td>高风险围墙项（常乐豆）：劳动纠纷 + 去明细化推进中，任何分类与算法层面的应答都会放大争议面</td>
            <td>只给三个数：本月结算、可用余额、提现冻结；追问几层都只回固定句</td>
          </tr>
          <tr>
            <td><strong>L4 不在场</strong></td>
            <td>公司侧账务 / 该岗位不参与——数据面里根本没有</td>
            <td>社保公积金单位部分等：问也问不出；员工问起不在场的项，如实答「不参与 / 不缴纳」（6.2）</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>分层与围墙的关系：</strong>围墙（6.2）决定「数据面里有什么」，分层决定「有的部分答到多深」——
        L1 – L3 都是围墙之内的项，区别只在答的深度；L4 连数据面都没进。
        <br /><strong>不是「知道但不说」：</strong>L2 不给过程，是因为过程依赖的输入（内部口径、第三方内容）已按围墙剥掉——
        Agent 的知识里没有第二层可说，员工不会察觉到回避。
      </div>
    </div>

    <div id="sa-63-groups" class="section">
      <div class="section-header">
        <h2>按底账归层：三岗位主要项归类</h2>
        <DocCopyButton section-id="sa-63-groups" />
      </div>
      <p class="doc-p">
        下表把三个岗位底账（7.2 – 7.4）的薪酬项按组归层，<strong>逐项的精确标注以底账每一行的「深度」列为准</strong>；
        策略调整时由薪酬侧同步维护归层，Agent 不自行判断。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 140px;">岗位</th><th style="width: 130px;">深度</th><th>薪酬项组（显示名口径）</th></tr>
        </thead>
        <tbody>
          <tr><td rowspan="4"><strong>全职推拿师</strong>（7.3）</td><td><span class="lv lv1">L1 求证</span></td><td>全月计件收入、工作日 / 节假日加班收入、修脚、打赏——事实=本人订单与服务记录，规则=计件单价与加班倍数</td></tr>
          <tr><td><span class="lv lv2">L2 结论</span></td><td>手动津贴、系统津贴、退单补贴、三级合伙人等人工行政项；代扣三类；投诉扣款、系统 / 手动补扣</td></tr>
          <tr><td><span class="lv lv3">L3 账户级</span></td><td>全部常乐豆形式项：保底 / 超产值 / 营销 / 回头客 / 住房 / 接待等服务获豆类 + 各类扣豆——一律并入账户级三数</td></tr>
          <tr><td><span class="lv lv4">L4 不在场</span></td><td>社保公积金单位部分、购买单位</td></tr>
          <tr><td rowspan="4"><strong>全职客户经理</strong>（7.2）</td><td><span class="lv lv1">L1 求证</span></td><td>计件客次收入、加班客次提成——事实=本人接待记录与订单，规则=客次提成单价</td></tr>
          <tr><td><span class="lv lv2">L2 结论</span></td><td>各班次津贴与激励（新客班次 / 接待 / 卫生类激励由打扫记录驱动，事实已列入 6.1 表 A，升 L1 待薪酬侧确认）、代扣三类、扣缴组各扣款</td></tr>
          <tr><td><span class="lv lv3">L3 账户级</span></td><td>获豆明细分组六项（新客 / 评价 / 盘点 / 资产卫生维护 / 采购物资 / 布草洗涤）+ 物资超标扣豆——并入账户级三数</td></tr>
          <tr><td><span class="lv lv4">L4 不在场</span></td><td>社保公积金单位部分、购买单位</td></tr>
          <tr><td rowspan="3"><strong>非全推拿师</strong>（7.4）</td><td><span class="lv lv1">L1 求证</span></td><td>提成收入、回头客激励、新店订单激励等订单驱动项——事实=本人订单，规则=提成比例</td></tr>
          <tr><td><span class="lv lv2">L2 结论</span></td><td>打赏之外的补贴类（内部介绍 / 知识萃取 / 面试激励）、系统 / 手动补贴、代扣个税及各扣款</td></tr>
          <tr><td><span class="lv lv4">L4 不在场</span></td><td>社保公积金整类、常乐豆整类（底账无豆项）</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>两个要点：</strong>
        ① 形式与深度是两回事——「三级合伙人」走现金但归 L2（人工行政项），常乐豆形式项全部归 L3，不逐项讨论；
        ② 打赏在推拿师底账走现金、归 L1（事实=客户打赏记录）；同类项在不同岗位归层可以不同，一切以底账行为准。
      </div>
    </div>

    <div id="sa-63-formula" class="section">
      <div class="section-header">
        <h2>计算公式开放度：哪些项允许查真实公式</h2>
        <DocCopyButton section-id="sa-63-formula" />
      </div>
      <h3 class="fact-h">三档定义</h3>
      <p class="doc-p">
        模块化薪酬里每个薪酬项都有真实计算公式。要不要对员工展开公式，本质上是一个<strong>求证深度</strong>问题：
        展开到什么层，取决于公式里有没有「不该摊给员工的东西」。规则定三档、实际分四种标法
        （B 档再拆「能讲规则」与「无规则只报数」两种），与上一节的深度分层一一对应：
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">公式档位</th><th style="width: 150px;">对应深度</th><th>能给出什么</th><th>典型项</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="lg lg-b">A 完整公式</span></td>
            <td>L1 完整求证</td>
            <td>算式全展开：本人事实（数量）× 命中单价 / 标准 = 金额，参数逐个带值带依据</td>
            <td>计件、客次提成、加班、修脚、打赏等订单直接驱动的项</td>
          </tr>
          <tr>
            <td><span class="lg lg-a">B 仅口径</span></td>
            <td>L2 只答结论</td>
            <td>讲清「按什么规则计、挂在哪个标准上」，<strong>不给完整算式与参数组合</strong>；金额照报</td>
            <td>班次津贴、各类激励、有明确规则的扣款、代扣三类（社保 / 公积金 / 个税）</td>
          </tr>
          <tr>
            <td><span class="lg lg-a">B 只报数</span></td>
            <td>L2 只答结论</td>
            <td><strong>没有规则可讲的项</strong>（人事手动调整、系统申请、申诉处理）：据实报金额与所属工资单，转人事说明缘由</td>
            <td>手动 / 系统津贴与扣款、薪酬申请、各类申诉扣回、投诉扣款</td>
          </tr>
          <tr>
            <td><span class="lg lg-c">C 不开放</span></td>
            <td>L3 账户级 / L4 不在场</td>
            <td>只给账户级三数或整项不在场——公式、分类、组成都不展开</td>
            <td>全部常乐豆形式项、公积金单位部分等</td>
          </tr>
        </tbody>
      </table>
      <p class="doc-p">
        <strong>展开公式的三条红线</strong>（任一条踩到，该项只能落 B 档）：
        ① 公式里出现他人数据（同店排名、团队分摊）② 出现内部账务或策略 / 模板名
        ③ 出现不可对员工解释的内部系数。公式只允许由<strong>「本人业务事实 × 命中参数」</strong>构成。
      </p>
      <h3 class="fact-h">C-1 · 逐项清单：非常乐豆的现金薪酬项，逐项定「允不允许查公式」</h3>
      <p class="doc-p">
        三份底账合计 <strong>107 项</strong>薪酬项：<strong>常乐豆形式 31 项一律不开放</strong>（L3，只给账户级三数，见上），
        剩下 <strong>76 项现金项</strong>逐项列在下面三张表里——研发和实施照这张表就能配「哪些能展开算式、哪些只给口径、哪些只报数」，
        不需要再回来问。判定沿用上面的 A / B 两档（现金项都会实际发放，金额必须给，所以不设 C 档）。
      </p>

      <h4 class="fml-cap">C-1.1 全职客户经理 · 现金 34 项</h4>
      <table class="data-table fml-table">
        <thead>
          <tr><th style="width: 230px;">薪酬项（显示名）</th><th style="width: 160px;">是否允许查公式</th><th>员工能拿到的答复</th></tr>
        </thead>
        <tbody>
          <tr class="grp"><td colspan="3">收入 · 计件（1 项）</td></tr>
          <tr><td><strong>计件客次收入</strong></td><td><span class="lg lg-b">允许 · 完整公式</span></td><td>本人客次数 × 客次提成单价 = 金额，单价带命中依据（6.4 的示例项）</td></tr>
          <tr class="grp"><td colspan="3">收入 · 加班工资（4 项）</td></tr>
          <tr><td><strong>加班客次提成</strong></td><td><span class="lg lg-b">允许 · 完整公式</span></td><td>本人加班客次 × 加班客次单价 = 金额</td></tr>
          <tr><td><strong>加班收入</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>加班 2 小时津贴，按次计固定额——讲清按什么标准、报金额，不展开算式</td></tr>
          <tr><td><strong>加班排顶班收入</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>顶班加班津贴，讲标准、报金额</td></tr>
          <tr><td><strong>顶班保底收入</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>顶班保底津贴，讲标准、报金额</td></tr>
          <tr class="grp"><td colspan="3">收入 · 激励补贴（17 项）</td></tr>
          <tr><td><strong>保底金额</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>讲清按保底标准与当月计件取高 / 补差的口径；<strong>不展开与同店他人的比较过程</strong></td></tr>
          <tr><td><strong>客次班次津贴</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>班次津贴标准（按班次或客次档），报金额不展开</td></tr>
          <tr><td><strong>新客班次津贴</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>新客班次津贴标准，报金额不展开</td></tr>
          <tr><td><strong>住房激励</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>住房激励标准（按岗 / 按城市差异），报金额不展开</td></tr>
          <tr><td><strong>试岗补贴</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>试岗期补贴标准，报金额不展开</td></tr>
          <tr><td><strong>内部介绍激励</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>按介绍入职与在职期限的口径讲清，报金额不展开（被介绍人信息不在场）</td></tr>
          <tr><td><strong>接待激励</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>接待班次激励标准，报金额不展开</td></tr>
          <tr><td><strong>房间卫生打扫激励</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>按打扫记录口径讲清，报金额不展开（升 L1 待薪酬侧确认，见上）</td></tr>
          <tr><td><strong>卫生间打扫激励</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>同上（升 L1 待薪酬侧确认）</td></tr>
          <tr><td><strong>卫生检查激励</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>按检查结果口径讲清，报金额不展开（升 L1 待薪酬侧确认）</td></tr>
          <tr><td><strong>培训出勤30天激励</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>培训出勤满 30 天激励标准，报金额不展开</td></tr>
          <tr><td><strong>培训出勤90天激励</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>培训出勤满 90 天激励标准，报金额不展开</td></tr>
          <tr><td><strong>绵阳培训出勤30天激励</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>绵阳培训出勤激励标准，报金额不展开</td></tr>
          <tr><td><strong>绵阳面试通过激励</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>面试通过激励标准，报金额不展开</td></tr>
          <tr><td><strong>三级合伙人激励</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td><strong>内部名带「获豆」但走现金</strong>：按合伙人激励口径讲清，报金额不展开</td></tr>
          <tr><td><strong>客户经理手动津贴</strong></td><td><span class="lg lg-a">不允许 · 只报数</span></td><td>人事人工调整项，<strong>无规则可讲</strong>：据实报金额 + 由人事说明缘由</td></tr>
          <tr><td><strong>客户经理薪酬申请</strong></td><td><span class="lg lg-a">不允许 · 只报数</span></td><td>人事申请类调整项，无规则可讲：据实报金额 + 转人事</td></tr>
          <tr class="grp"><td colspan="3">扣缴（12 项）</td></tr>
          <tr><td><strong>考勤扣款</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>按考勤规则讲清触发条件，报金额不展开</td></tr>
          <tr><td><strong>出勤不达标扣款</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>按出勤达标口径讲清，报金额不展开</td></tr>
          <tr><td><strong>手动扣款</strong></td><td><span class="lg lg-a">不允许 · 只报数</span></td><td>人事人工扣款项，无规则可讲：据实报金额 + 转人事</td></tr>
          <tr><td><strong>系统扣款</strong></td><td><span class="lg lg-a">不允许 · 只报数</span></td><td>系统申请类扣款项，无规则可讲：据实报金额 + 转人事</td></tr>
          <tr><td><strong>投诉扣款</strong></td><td><span class="lg lg-a">不允许 · 只报数</span></td><td>只核<strong>本人名下有无、金额多少</strong>；投诉内容与处理判定过程不在场（6.1 表 A）</td></tr>
          <tr><td><strong>房间卫生未打扫扣款</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>按未打扫记录口径讲清，报金额不展开（升 L1 待确认）</td></tr>
          <tr><td><strong>卫生间卫生未打扫扣款</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>同上（升 L1 待确认）</td></tr>
          <tr><td><strong>卫生检查扣款</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>按检查结果口径讲清，报金额不展开（升 L1 待确认）</td></tr>
          <tr><td><strong>未点离店扣款</strong></td><td><span class="lg lg-a">不允许 · 只报数</span></td><td>按是否点离店的事实讲清有无，金额照报，不展开判定过程</td></tr>
          <tr><td><strong>房间打扫卫生申诉扣回</strong></td><td><span class="lg lg-a">不允许 · 只报数</span></td><td>申诉过程不在场：只报扣回金额与关联月份，转人事</td></tr>
          <tr><td><strong>接待申诉扣回</strong></td><td><span class="lg lg-a">不允许 · 只报数</span></td><td>申诉过程不在场：只报扣回金额，转人事</td></tr>
          <tr><td><strong>评价回访超时未处理扣款</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>按回访时限口径讲清，报金额不展开</td></tr>
        </tbody>
      </table>

      <h4 class="fml-cap">C-1.2 全职推拿师 · 现金 14 项（三模板同显示名合并）</h4>
      <table class="data-table fml-table">
        <thead>
          <tr><th style="width: 230px;">薪酬项（显示名）</th><th style="width: 160px;">是否允许查公式</th><th>员工能拿到的答复</th></tr>
        </thead>
        <tbody>
          <tr class="grp"><td colspan="3">收入（10 项）</td></tr>
          <tr><td><strong>全月计件收入</strong></td><td><span class="lg lg-b">允许 · 完整公式</span></td><td>本人计件项目量 × 对应提成单价 = 金额；三模板并存，员工不感知模板（公式里不出现模板名）</td></tr>
          <tr><td><strong>工作日加班收入</strong></td><td><span class="lg lg-b">允许 · 完整公式</span></td><td>本人工作日加班客次 / 工时 × 加班单价 = 金额</td></tr>
          <tr><td><strong>节假日收入</strong></td><td><span class="lg lg-b">允许 · 完整公式</span></td><td>本人节假日客次 × 节假日单价 = 金额</td></tr>
          <tr><td><strong>节假日加班收入</strong></td><td><span class="lg lg-b">允许 · 完整公式</span></td><td>本人节假日加班客次 × 单价 = 金额</td></tr>
          <tr><td><strong>修脚</strong></td><td><span class="lg lg-b">允许 · 完整公式</span></td><td>本人修脚客次 × 修脚单价 = 金额</td></tr>
          <tr><td><strong>打赏</strong></td><td><span class="lg lg-b">允许 · 完整公式</span></td><td>本人打赏金额合计（逐笔来自订单，只汇本人）</td></tr>
          <tr><td><strong>退单补贴</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>按退单补贴规则讲清，报金额不展开</td></tr>
          <tr><td><strong>手动津贴</strong></td><td><span class="lg lg-a">不允许 · 只报数</span></td><td>人事人工调整项，无规则可讲：据实报金额 + 转人事</td></tr>
          <tr><td><strong>系统津贴</strong></td><td><span class="lg lg-a">不允许 · 只报数</span></td><td>系统申请类调整项，无规则可讲：据实报金额 + 转人事</td></tr>
          <tr><td><strong>三级合伙人</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>内部名带「获豆」但走现金：按合伙人激励口径讲清，报金额不展开</td></tr>
          <tr class="grp"><td colspan="3">扣缴（4 项）</td></tr>
          <tr><td><strong>系统补扣</strong></td><td><span class="lg lg-a">不允许 · 只报数</span></td><td>系统申请类扣款项，无规则可讲：据实报金额 + 转人事</td></tr>
          <tr><td><strong>手动补扣</strong></td><td><span class="lg lg-a">不允许 · 只报数</span></td><td>人事人工扣款项，无规则可讲：据实报金额 + 转人事</td></tr>
          <tr><td><strong>投诉扣款</strong></td><td><span class="lg lg-a">不允许 · 只报数</span></td><td>只核本人名下有无、金额多少；投诉内容与判定过程不在场</td></tr>
          <tr><td><strong>服务时长不足扣提成</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>讲清「服务时长不足触发按比例扣提成」的口径与比例档位，报金额不展开</td></tr>
        </tbody>
      </table>

      <h4 class="fml-cap">C-1.3 非全推拿师 · 现金 22 项</h4>
      <table class="data-table fml-table">
        <thead>
          <tr><th style="width: 230px;">薪酬项（显示名）</th><th style="width: 160px;">是否允许查公式</th><th>员工能拿到的答复</th></tr>
        </thead>
        <tbody>
          <tr class="grp"><td colspan="3">收入（15 项）</td></tr>
          <tr><td><strong>提成收入</strong></td><td><span class="lg lg-b">允许 · 完整公式</span></td><td>本人订单实付金额 × 提成比例 = 金额（逐单只算本人）</td></tr>
          <tr><td><strong>回头客激励</strong></td><td><span class="lg lg-b">允许 · 完整公式</span></td><td>本人回头客订单数 × 激励单价 = 金额</td></tr>
          <tr><td><strong>新店订单激励</strong></td><td><span class="lg lg-b">允许 · 完整公式</span></td><td>本人在新店订单数 × 激励单价 = 金额</td></tr>
          <tr><td><strong>新店回头客激励</strong></td><td><span class="lg lg-b">允许 · 完整公式</span></td><td>本人新店回头客订单数 × 激励单价 = 金额</td></tr>
          <tr><td><strong>一类门店新人订单补贴</strong></td><td><span class="lg lg-b">允许 · 完整公式</span></td><td>本人一类门店新人订单数 × 单价 = 金额</td></tr>
          <tr><td><strong>一类门店回头客激励</strong></td><td><span class="lg lg-b">允许 · 完整公式</span></td><td>本人一类门店回头客订单数 × 单价 = 金额</td></tr>
          <tr><td><strong>一类门店时段激励</strong></td><td><span class="lg lg-b">允许 · 完整公式</span></td><td>本人冷门时段订单数 × 单价 = 金额</td></tr>
          <tr><td><strong>打赏</strong></td><td><span class="lg lg-b">允许 · 完整公式</span></td><td>本人打赏金额合计</td></tr>
          <tr><td><strong>退单补贴</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>按退单补贴规则讲清，报金额不展开</td></tr>
          <tr><td><strong>顶班激励</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>顶班激励标准，报金额不展开</td></tr>
          <tr><td><strong>内部介绍</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>按介绍入职与在职期限口径讲清（被介绍人信息不在场）</td></tr>
          <tr><td><strong>知识萃取</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>按知识萃取规则讲清，报金额不展开</td></tr>
          <tr><td><strong>面试激励</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>面试激励标准，报金额不展开</td></tr>
          <tr><td><strong>系统补贴</strong></td><td><span class="lg lg-a">不允许 · 只报数</span></td><td>系统申请类调整项，无规则可讲：据实报金额 + 转人事</td></tr>
          <tr><td><strong>手动补贴</strong></td><td><span class="lg lg-a">不允许 · 只报数</span></td><td>人事人工调整项，无规则可讲：据实报金额 + 转人事</td></tr>
          <tr class="grp"><td colspan="3">扣缴（7 项）</td></tr>
          <tr><td><strong>服务时长不足扣提成</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>讲清触发口径与比例档位，报金额不展开</td></tr>
          <tr><td><strong>投诉扣款</strong></td><td><span class="lg lg-a">不允许 · 只报数</span></td><td>只核本人名下有无、金额多少；投诉内容与判定过程不在场</td></tr>
          <tr><td><strong>房间卫生未打扫扣款</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>按未打扫记录口径讲清，报金额不展开</td></tr>
          <tr><td><strong>离店卫生未打扫扣款</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>同上</td></tr>
          <tr><td><strong>服务未接待扣款</strong></td><td><span class="lg lg-a">不允许 · 仅口径</span></td><td>按服务接待记录口径讲清，报金额不展开</td></tr>
          <tr><td><strong>系统补扣</strong></td><td><span class="lg lg-a">不允许 · 只报数</span></td><td>系统申请类扣款项，无规则可讲：据实报金额 + 转人事</td></tr>
          <tr><td><strong>手动补扣</strong></td><td><span class="lg lg-a">不允许 · 只报数</span></td><td>人事人工扣款项，无规则可讲：据实报金额 + 转人事</td></tr>
        </tbody>
      </table>
      <p class="doc-p">
        <strong>口径统计（供研发核对接入范围）：</strong>
        允许完整公式 <strong>16 项</strong>（客户经理 2 · 全职推拿师 6 · 非全推拿师 8）；
        仅口径 <strong>36 项</strong>（客户经理 24 · 全职推拿师 3 · 非全 9）；
        只报数（人事人工 / 系统申请 / 申诉类）<strong>18 项</strong>（客户经理 8 · 全职推拿师 5 · 非全 5）；
        常乐豆不开放 <strong>31 项</strong>。以上按<strong>显示名</strong>计 101 项；
        底账按行计 107 项，差 6 行是全职推拿师三个模板下同一显示名的重复行（20 行现金并为 14 个显示名）。
      </p>

      <div class="note">
        <strong>公式以薪酬计算引擎的现行配置为准：</strong>C-1 逐项表定的是每一项「能不能查公式」的结论，
        具体参数值与依据由命中值给出（表 B）；<strong>公式里不出现策略名、模板名与内部系数</strong>——
        员工看到的是「你的 3 客次 × 5 元」，不是「基础提成 24 V7 的算法」。
        <br />B 档项问公式，统一回口径句 +「具体算法以薪酬规则为准」；C 档项问公式，走 6.5 的常乐豆兜底句。
      </div>
    </div>

    <div id="sa-63-fallback" class="section">
      <div class="section-header">
        <h2>层外问题：追问兜底</h2>
        <DocCopyButton section-id="sa-63-fallback" />
      </div>
      <p class="doc-p">
        超出所在层深度的追问，只答固定一句，不做展开。常乐豆问题无论追问几层，都只回固定句，
        不展开账户级汇总以外的任何内容：
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 250px;">问题类型</th><th>固定口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>L2 项追问过程（基数 / 税率 / 为什么变多）</strong></td><td>「该项金额以工资条为准，如有疑问请联系人事核实。」</td></tr>
          <tr><td><strong>常乐豆追问（分类汇总 / 组成 / 算法 / 为什么少）</strong></td><td>「常乐豆相关问题目前仅提供账户级汇总（本月结算 / 可用余额 / 提现冻结），明细与计算说明请以人事核实为准。」</td></tr>
          <tr><td><strong>L4 项追问（单位交了多少 / 为什么没有）</strong></td><td>按 6.2 如实答「该岗位不参与 / 不缴纳」，不展开</td></tr>
        </tbody>
      </table>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'sa-63-why', label: '为什么需要分层' },
  { id: 'sa-63-criterion', label: '归层判据' },
  { id: 'sa-63-groups', label: '按底账归层' },
  { id: 'sa-63-formula', label: '公式开放度逐项' },
  { id: 'sa-63-fallback', label: '层外问题：追问兜底' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '模块化薪酬', to: '/docs/salary-agent' },
  { label: '六、功能详细说明' },
  { label: '6.3 应答深度分层' }
]
</script>

<style scoped src="./doc-base.css"></style>

<style scoped>
.lv {
  display: inline-block; padding: 1px 8px; border-radius: 999px;
  font-size: 11px; font-weight: 600; line-height: 18px; white-space: nowrap;
}
.lv1 { color: hsl(150 60% 28%); background: hsl(150 60% 40% / 0.12); }
.lv2 { color: hsl(220 60% 40%); background: hsl(220 60% 40% / 0.1); }
.lv3 { color: hsl(38 90% 35%); background: hsl(38 90% 50% / 0.14); }
.lv4 { color: hsl(0 0% 45%); background: hsl(0 0% 50% / 0.12); }
.lg { display: inline-block; font-size: 11px; font-weight: 600; border-radius: 999px; padding: 1px 9px; }
.lg-a { color: #185fa5; background: hsl(210 65% 92%); }
.lg-b { color: #3b6d11; background: hsl(90 45% 90%); }
.lg-c { color: #854f0b; background: hsl(38 70% 90%); }
.lg-d { color: #993c1d; background: hsl(18 60% 91%); }
.fact-h { font-size: 14px; font-weight: 600; color: #2c2c2a; margin: 22px 0 8px; }
.fml-cap { font-size: 13px; font-weight: 600; color: #5f5e5a; margin: 20px 0 8px; padding-left: 9px; border-left: 3px solid #993c1d; }
.fml-table { font-size: 12.5px; }
.fml-table th { font-size: 12px; }
.fml-table td { padding: 6px 10px; line-height: 1.5; }
.fml-table tr.grp td {
  background: #f4f2ec; font-size: 11.5px; font-weight: 700; color: #5f5e5a;
  letter-spacing: 0.02em; padding: 5px 10px;
}
</style>
