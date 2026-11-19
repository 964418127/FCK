<template>
  <DocShell
    :toc-items="tocItems"
    title="6.8 薪酬计算与看板（支持非全合作）"
    subtitle="单价按「人数档 × 客次量档」分格，格内四级继承；保底按时薪配置，保底金额 = 打卡有效工时 × 保底时薪；员工侧看板与工资确认见 6.8.5、6.8.6"
    version="v5.4"
    date="2026-11-19"
    :breadcrumbs="breadcrumbs"
  >
    <div id="hs-68-overview" class="section">
      <div class="section-header">
        <h2>6.8 薪酬计算与看板（支持非全合作）</h2>
        <DocCopyButton section-id="hs-68" />
      </div>
      <div class="note lead-note">
        <strong>一句话定位：</strong>人事中心支持非全合作的收入能力——单价与保底的标准在这里配，员工的账在移动端看板看，工资单按周确认；非全客户经理是第一个落地的业务，<strong>有效工时来自 6.7 打卡</strong>。
      </div>
      <div class="note src-note">
        <strong>来源：</strong>本章内容并入自《非全客户经理 · 产品需求说明》6.7 薪酬计算与看板，原文见
        <router-link to="/docs/parttime-account-manager/6-7">/docs/parttime-account-manager/6-7</router-link>。
      </div>
      <div class="func-entry"><strong>功能入口：</strong>Web → 模块化薪酬 → <strong>配置规则管理 → 通用参数</strong> → 数据表（保底时薪 / 客次单价 / 新客单价 / 评价单价）</div>

      <div class="note decision-note">
        <span class="decision-tag">决议</span><strong>保底与单价的配置统一用【通用参数】的数据表（2026-11-10）</strong>
        <br />
        本模块<strong>不再自建价目与标准表</strong>，改为在通用参数里各建一张数据表；哪列当查询条件、取哪列、命中顺序都在薪酬项引用时配。
        本章讲的标准与算法不变，变的是配置载体。入口与取值规则见
        <router-link to="/docs/general-param">通用参数（升级）· 产品需求说明</router-link>。
      </div>

      <DocScreens
        label="功能页面示例 · 单价"
        :images="[
          { src: ptUnitPricesShot, label: '单价配置：左列人数档，顶部切城市 / 门店 / 员工，右侧按客次量三档列价；每格标本级或继承' },
          { src: ptPriceDialogShot, label: '编辑一行：档位已在标题锁定，只改这格三项金额；留空显示「继承 4.00」，0 是真实金额' }
        ]"
      />
      <DocScreens
        label="功能页面示例 · 保底"
        :images="[
          { src: ptGuaranteeShot, label: '收入保底：通用 25 元/时，右侧该城市门店差异额表，差异 +2 → 最终 30.00' }
        ]"
      />
      <div class="note lead-note">
        本模块<strong>只维护标准</strong>：任务生成、承接与派发不读薪酬配置；任务完成后按<strong>实际承接人、任务门店、服务时间</strong>解析单价，保底按<strong>有效工时 × 保底时薪</strong>与当周收入比较。
        这里<strong>没有</strong>结算试算与收入统计 —— 员工看板在 6.8.5。
      </div>
    </div>

    <div id="hs-68-price" class="section">
      <div class="section-header">
        <h3>6.8.1 单价配置：三个项目，先分档再四级继承</h3>
      </div>
      <p class="doc-p">
        新客、评价、客次<strong>各自独立</strong>判断继承。单价是一个<strong>格子</strong>：门店全职客户经理人数（人数档）× 门店天均客次量（客次量档），两项都来自门店主数据、页面只读。
        <strong>继承只发生在同一格内</strong>，不跨档兜底。个人配置的归属键是<strong>人员 ID + 门店 ID</strong>。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">区域</th><th style="width: 280px;">展示与操作</th><th>交互要求</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>左列配置人数</strong></td><td>默认 1 / 2 / 3 人，底部可「新增人数档」，切换后整页按该档显示</td><td>新增档从当前最高档同价起步；<strong>超过最高档按最高档取值</strong>，页面写明</td></tr>
          <tr><td><strong>通用</strong></td><td>列表首行的通用标准</td><td>兜底；<strong>始终存在、不可作废</strong></td></tr>
          <tr><td><strong>城市标准</strong></td><td>城市搜索、配置列表、新增 / 编辑 / 作废</td><td>每格显示<strong>解析金额</strong>与「本级 / 继承通用 / 继承城市」</td></tr>
          <tr><td><strong>门店标准</strong></td><td>按名称、编号搜索；列表带该店<strong>实际人数与天均客次量</strong></td><td>新增先选城市再选门店</td></tr>
          <tr><td><strong>员工标准</strong></td><td>按工号 / 姓名搜，按「人 × 门店」一条</td><td>每家门店独立展示三档金额与来源</td></tr>
        </tbody>
      </table>

      <h4 class="h4sub">字段与校验</h4>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">字段</th><th style="width: 250px;">要求</th><th>约束</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>层级与归属</strong></td><td>通用 / 城市 ID / 门店 ID / 人员 ID + 门店 ID</td><td>同层级同归属<strong>最多一条有效记录</strong></td></tr>
          <tr><td><strong>人数档</strong></td><td>默认 1 / 2 / 3 人，可新增</td><td>新增后命中该档；<strong>不按人数线性折算</strong>；档与档不互相继承</td></tr>
          <tr><td><strong>客次量档</strong></td><td>0 ~ 30、30 ~ 40、40 以上</td><td>左闭右开（30 归第二档）；末档无上限；<strong>0 次是有效事实</strong></td></tr>
          <tr><td><strong>三项单价</strong></td><td>新客 / 评价 / 客次，元 / 次</td><td>非负、最多两位小数；<strong>0 是有效覆盖</strong></td></tr>
          <tr><td><strong>留空即继承</strong></td><td>可只填有差异的项目</td><td>留空<strong>不存金额</strong>，读取沿用上一级</td></tr>
          <tr><td><strong>门店事实</strong></td><td>人数、天均客次量</td><td>门店主数据必填，页面只读，<strong>不提供手填</strong></td></tr>
        </tbody>
      </table>

      <h4 class="h4sub">逐项解析规则</h4>
      <p class="doc-p">
        先按门店事实<strong>定位格子</strong>，再对三个项目<strong>分别</strong>按 <strong>人员 × 门店 → 门店 → 城市 → 通用</strong> 取第一个有效且明确配置的金额；0 算已配置，
        某层这一格没填就继续向上，<strong>不跨格兜底</strong>。返回<strong>金额 + 来源层级</strong>。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 320px;">读取场景</th><th>新客</th><th>评价</th><th>客次</th></tr>
        </thead>
        <tbody>
          <tr><td>兴隆湖，2 人 · 天均 26 次，员工 100 有个人配置</td><td>28，个人</td><td>4，通用</td><td>15，个人</td></tr>
          <tr><td>滨江，3 人 · 天均 45 次，无个人配置</td><td>5，通用</td><td>2，通用</td><td>17，门店</td></tr>
          <tr><td>高新，4 人 · 天均 62 次（未建 4 人档，按 3 人档），城市与门店都未配</td><td>5，通用</td><td>2，通用</td><td>6，通用</td></tr>
        </tbody>
      </table>
    </div>

    <div id="hs-68-ops" class="section">
      <div class="section-header">
        <h3>6.8.2 新增、编辑与作废</h3>
      </div>
      <ol class="doc-ol">
        <li>新增城市 / 门店 / 个人配置<strong>可独立进行</strong>，不要求上级已配；一次填完三个客次量档，只填有差异的格子。</li>
        <li>编辑只改这一格：留空 = <strong>移除本级覆盖</strong>；填 0 = 真实 0 元；三项全空且该对象无其他配置时保存被拦，提示改为作废。</li>
        <li>作废只失效<strong>该对象本级</strong>，不联动下级，读取自然回落到上一级；需二次确认并保留历史。</li>
        <li><strong>历史已结算明细用当时快照</strong>，不因改价或作废重算。</li>
      </ol>
    </div>

    <div id="hs-68-guarantee" class="section">
      <div class="section-header">
        <h3>6.8.3 收入保底：三个层级，一加一覆盖</h3>
      </div>
      <p class="doc-p">
        保底按<strong>小时</strong>配置（2026-11-10 由周改小时），配的是<strong>保底时薪</strong>，金额靠有效工时折算：<strong>保底金额 = 打卡有效工时 × 保底时薪</strong>。
        通用是兜底基准；<strong>城市整值覆盖通用</strong>（不是相加）；门店只维护<strong>叠加在城市上的差异时薪</strong>。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 200px;">区域</th><th style="width: 240px;">展示与操作</th><th>交互要求</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>顶部通用配置</strong></td><td>时薪（元 / 小时）</td><td>进入即见；<strong>始终存在、不可作废</strong></td></tr>
          <tr><td><strong>左侧城市列表</strong></td><td>城市名、城市时薪、新增、搜索</td><td>只列已新增的城市，不预生成</td></tr>
          <tr><td><strong>右侧城市详情</strong></td><td>城市时薪；该城市门店差异额列表</td><td>门店行给差异时薪、最终时薪、编辑 / 作废</td></tr>
        </tbody>
      </table>

      <h4 class="h4sub">解析规则</h4>
      <table class="data-table">
        <thead>
          <tr><th style="width: 230px;">条件</th><th style="width: 130px;">城市基准</th><th style="width: 130px;">门店差异</th><th>结果（时薪）</th></tr>
        </thead>
        <tbody>
          <tr><td>城市、门店均未配</td><td>通用</td><td>0</td><td>通用时薪</td></tr>
          <tr><td>仅城市已配</td><td>城市时薪</td><td>0</td><td>城市时薪</td></tr>
          <tr><td>城市、门店均已配</td><td>城市时薪</td><td>差异额</td><td><strong>城市 + 差异</strong></td></tr>
          <tr><td>城市作废</td><td>通用</td><td>0（门店联动作废）</td><td>通用时薪</td></tr>
        </tbody>
      </table>
      <p class="doc-p">
        例：通用 25、成都 28、兴隆湖差异 2 → 兴隆湖 <strong>30 / 小时</strong>；成都未配差异的门店 28；未配城市的门店 25。
      </p>
      <ul class="doc-ul">
        <li>改通用只改通用值，<strong>已有城市金额不变</strong>。</li>
        <li>作废城市连带作废该城市有效门店差异额，此后回退通用；单独作废门店回退城市。</li>
      </ul>
    </div>

    <div id="hs-68-week" class="section">
      <div class="section-header">
        <h3>6.8.4 每周比较与补差：有效工时 × 保底时薪</h3>
      </div>
      <p class="doc-p">
        <strong>有效工时 × 保底时薪 = 保底金额</strong>，再与<strong>当周收入合计</strong>比较，差额作为<strong>保底补差</strong>随该周工资单发；每周各算一次，互不结转。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 180px;">步骤</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>1 有效工时</strong></td><td><strong>只认打卡</strong>（6.7）：每个已履约任务按「计取离店 − 计取到店」计，保留 1 位小数；按<strong>人员 × 门店 × 结算周</strong>累加。缺卡不计，取消或转移未履约不计</td></tr>
          <tr><td><strong>2 两端夹回边界</strong></td><td>到店取「打卡到店」与「计划开始」<strong>较晚者</strong>（提前打卡不计）；离店取「打卡离店」与「计划结束」<strong>较早者</strong>（晚走不加、早退按实际）</td></tr>
          <tr><td><strong>3 保底金额</strong></td><td><strong>有效工时 × 保底时薪</strong>（时薪按 6.8.3 取该人员任务所属门店）</td></tr>
          <tr><td><strong>4 当周收入合计</strong></td><td>就是<strong>六项提成</strong>：客次 + 新客 + 评价 + 房间卫生 + 厕所卫生 + 离店卫生，都来自她任务时间范围内的事实；没有底薪，也没有另一笔「任务收入」。<strong>接待激励与津贴不计入</strong></td></tr>
          <tr><td><strong>5 补差与发放</strong></td><td><strong>补差 = max(0, 保底金额 − 当周收入合计)</strong>，随该周工资单确认发放；跨店<strong>按门店主体分别归集</strong>，不混算</td></tr>
        </tbody>
      </table>
      <p class="doc-p">
        例：兴隆湖 30 / 小时、当周有效工时 21.5 → 保底 645.00；六项提成 650 → 补差 0；提成只有 600 → 补差 45.00。
      </p>
    </div>

    <div id="hs-68-board" class="section">
      <div class="section-header">
        <h3>6.8.5 非全客户经理薪酬看板（移动端）</h3>
      </div>
      <div class="func-entry"><strong>功能入口：</strong>移动端 → 客户经理 → <strong>非全客户经理薪酬</strong>（原型 <code>/mobile-parttime-am-salary</code>）</div>
      <DocScreens
        label="功能页面示例 · 三个页签"
        mode="phone"
        :height="670"
        :images="[
          { src: mAmSalaryShot, label: '日统计：今日收入 / 支出；按客次 / 新客 / 评价 / 卫生分类可筛，下面是当天接待记录' },
          { src: mAmSalaryEstimateShot, label: '预估收入：按周切工资单；收入侧逐项列，下半是扣款与个税，前 3 周「预扣」' },
          { src: mAmSalaryArrivalShot, label: '到账情况：一周一卡，六个数；未发放的实发 0，不预告计算日与发放日' }
        ]"
      />
      <p class="doc-p">
        员工只看<strong>本人、本门店</strong>的账：今天赚了多少、这周各项多少、钱到账没有。结构与全日制一致，差别在薪酬项与扣缴范围 —— 不缴社保公积金，扣缴只有个税。顶部可切门店，<strong>各店各自算账不合并</strong>。
      </p>

      <h4 class="h4sub">薪酬项与扣缴</h4>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">项目</th><th style="width: 290px;">口径</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>客次提成</strong></td><td>客次数 × 客次单价</td><td>单价按 6.8.1 四级继承</td></tr>
          <tr><td><strong>新客提成</strong></td><td>本期新客人数 × 新客单价</td><td>按客户档案判首次到店</td></tr>
          <tr><td><strong>评价提成</strong></td><td>本期有效评价数 × 评价单价</td><td>只计有效评价</td></tr>
          <tr><td><strong>接待激励</strong></td><td>本期接待次数 × 激励单价（示例 1 元 / 次，待业务确认）</td><td><strong>不计入保底比较</strong>，随周工资单发</td></tr>
          <tr><td><strong>房间 / 厕所 / 离店卫生</strong></td><td>按次数 × 门店固定标准</td><td>不参与单价继承；三项<strong>分列</strong>不合并</td></tr>
          <tr><td><strong>津贴</strong></td><td>按结算周固定金额（示例 50 元 / 周）</td><td>不与工时挂钩；<strong>不计入保底比较</strong></td></tr>
          <tr><td><strong>保底补差</strong></td><td>max(0, 有效工时 × 保底时薪 − 六项提成合计)</td><td>只与六项提成比，<strong>激励与津贴不参与</strong>；足额时为 0；与提成相加进当期收入</td></tr>
          <tr><td><strong>投诉 / 卫生打扫扣款</strong></td><td>次数 × 扣款标准（示例 50 / 20 元，待业务确认）</td><td>扣费项，不冲抵保底补差，只影响实发</td></tr>
          <tr><td><strong>个税</strong></td><td>自然月<strong>前 3 周预扣</strong>，第 4 周（22 日–月末）<strong>代扣</strong></td><td><strong>不缴社保、公积金</strong></td></tr>
          <tr><td><strong>应发 / 实发</strong></td><td>应发 = 薪酬项相加 − 扣缴；实发 = 已发放的应发</td><td>负工资抵扣无发生即 0；未发放实发为 0</td></tr>
        </tbody>
      </table>

      <h4 id="hs-68-weekly-example" class="h4sub">四周示例：10 月 · 兴隆湖店 · 一个人</h4>
      <p class="doc-p">
        按周结算、各周出单。保底时薪 30（成都 28 + 差异 2），有效工时来自打卡；单价客次 5、新客 2、评价 6、房间卫生 8、厕所卫生 5、离店卫生 6；激励 1 元 / 次、津贴 50 元 / 周（示例，待业务确认）。
      </p>
      <div class="ledger-wrap">
      <table class="data-table ledger">
        <thead>
          <tr>
            <th rowspan="2" style="width: 96px;">结算周</th>
            <th colspan="12" class="group">收入</th>
            <th colspan="3" class="group">扣款与扣缴</th>
            <th rowspan="2">实发</th>
          </tr>
          <tr>
            <th class="num">保底金额</th>
            <th class="num">客次</th>
            <th class="num">新客</th>
            <th class="num">评价</th>
            <th class="num">接待激励</th>
            <th class="num">房间卫生</th>
            <th class="num">厕所卫生</th>
            <th class="num">离店卫生</th>
            <th class="num">津贴</th>
            <th class="num">收入小计</th>
            <th class="num">保底补差</th>
            <th class="num">合计</th>
            <th class="num">投诉</th>
            <th class="num">卫生打扫扣款</th>
            <th class="num">个税（预扣 / 代扣）</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>第 1 周</strong><br><small>10.1–7 · 21.5 小时</small></td>
            <td class="num">645.00</td><td class="num">240.00</td><td class="num">14.00</td><td class="num">216.00</td><td class="num">48.00</td>
            <td class="num">72.00</td><td class="num">45.00</td><td class="num">36.00</td><td class="num">50.00</td>
            <td class="num">671.00</td><td class="num"><strong>22.00</strong></td><td class="num"><strong>743.00</strong></td>
            <td class="num">—</td><td class="num">—</td><td class="num">预扣 8.40</td>
            <td class="num"><strong>734.60</strong></td>
          </tr>
          <tr>
            <td><strong>第 2 周</strong><br><small>10.8–14 · 20 小时</small></td>
            <td class="num">600.00</td><td class="num">260.00</td><td class="num">18.00</td><td class="num">264.00</td><td class="num">52.00</td>
            <td class="num">96.00</td><td class="num">40.00</td><td class="num">36.00</td><td class="num">50.00</td>
            <td class="num">766.00</td><td class="num"><strong>0.00</strong></td><td class="num"><strong>816.00</strong></td>
            <td class="num">50.00</td><td class="num">—</td><td class="num">预扣 9.60</td>
            <td class="num"><strong>756.40</strong></td>
          </tr>
          <tr>
            <td><strong>第 3 周</strong><br><small>10.15–21 · 21.5 小时</small></td>
            <td class="num">645.00</td><td class="num">200.00</td><td class="num">10.00</td><td class="num">192.00</td><td class="num">40.00</td>
            <td class="num">72.00</td><td class="num">25.00</td><td class="num">24.00</td><td class="num">50.00</td>
            <td class="num">563.00</td><td class="num"><strong>122.00</strong></td><td class="num"><strong>735.00</strong></td>
            <td class="num">—</td><td class="num">20.00</td><td class="num">预扣 6.20</td>
            <td class="num"><strong>708.80</strong></td>
          </tr>
          <tr>
            <td><strong>第 4 周</strong><br><small>10.22–31 · 20 小时</small></td>
            <td class="num">600.00</td><td class="num">290.00</td><td class="num">20.00</td><td class="num">288.00</td><td class="num">58.00</td>
            <td class="num">104.00</td><td class="num">45.00</td><td class="num">42.00</td><td class="num">50.00</td>
            <td class="num">847.00</td><td class="num"><strong>0.00</strong></td><td class="num"><strong>897.00</strong></td>
            <td class="num">—</td><td class="num">—</td><td class="num">代扣 11.80</td>
            <td class="num">待发放</td>
          </tr>
          <tr>
            <td><strong>当月合计</strong></td>
            <td class="num">2490.00</td><td class="num">990.00</td><td class="num">62.00</td><td class="num">960.00</td><td class="num">198.00</td>
            <td class="num">344.00</td><td class="num">155.00</td><td class="num">138.00</td><td class="num">200.00</td>
            <td class="num">2847.00</td><td class="num"><strong>144.00</strong></td><td class="num"><strong>3191.00</strong></td>
            <td class="num">50.00</td><td class="num">20.00</td><td class="num">预扣 24.20<br>代扣 11.80</td>
            <td class="num"><strong>2199.80</strong></td>
          </tr>
        </tbody>
      </table>
      </div>
      <p class="doc-p">
        第 1 周：21.5 小时 → 保底 645，六项提成 623 不足 → 补差 22，加激励 48 与津贴 50，合计 743。第 2 周：提成 714 超过保底 600 → 补差 0，有 1 次投诉扣 50，实发 756.40。
      </p>
    </div>

    <div id="hs-68-notice" class="section">
      <div class="section-header">
        <h3>6.8.6 工资通知</h3>
      </div>
      <div class="func-entry"><strong>功能入口：</strong>移动端 → <strong>通知</strong>（原型 <code>/mobile-notification</code>），与任务通知同一入口，按类型区分</div>
      <p class="doc-p">
        结算周算完，系统按<strong>结算主体</strong>推一条<strong>工资确认通知</strong>；本人核对金额、勾选条款、电子签字、提交，才生成发放工作单。<strong>不确认就不进发放队列。</strong>
      </p>

      <DocScreens
        label="功能页面示例 · 通知与确认单"
        mode="phone"
        :height="746"
        :images="[
          { src: mSalaryNoticeListShot, label: '通知列表：与任务通知同一入口；一条「非全工资确认通知」带主体与状态' },
          { src: mSalaryNoticeShot, label: '确认单：抬头是结算周 + 门店；收入逐项列（带基数与核算式），扣缴段、汇总段、条款与签字' }
        ]"
      />

      <h4 class="h4sub">一条通知的边界</h4>
      <table class="data-table">
        <thead>
          <tr><th style="width: 190px;">维度</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>一条 = 谁 × 哪个主体 × 哪一周</strong></td><td>按<strong>结算主体 × 结算周</strong>推，不是按人推一条；跨店的人一周可能收到<strong>多条</strong>，各自确认（1 门店 = 1 主体）</td></tr>
          <tr><td><strong>什么时候推</strong></td><td>该周计算日算完即推（1–7 日 → 9 日，8–14 → 16 日，15–21 → 22 日，22 日–月末 → 次月 3 日），见《非全客户经理》5.4.2</td></tr>
          <tr><td><strong>谁确认</strong></td><td>被结算的<strong>本人</strong>，不接受代确认</td></tr>
          <tr><td><strong>确认后</strong></td><td>生成发放工作单，进该周出款队列；确认状态回写，看板实发从 0 变应发</td></tr>
          <tr><td><strong>不确认</strong></td><td>停在<strong>待确认</strong>不进发放；<strong>各周互不等待</strong></td></tr>
        </tbody>
      </table>

      <h4 class="h4sub">一条通知里有什么</h4>
      <table class="data-table">
        <thead>
          <tr><th style="width: 120px;">区域</th><th style="width: 230px;">显示什么</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>收入</strong></td><td>逐项列 + 小计</td><td>计件项带<strong>计件基数</strong>，保底补差带<strong>核算式</strong>（21.5 小时 × 30 元/时）让员工能自己复算；三项卫生<strong>分列</strong></td></tr>
          <tr><td><strong>扣款与扣缴</strong></td><td>投诉 / 卫生打扫扣款 + 个税 + 负工资抵扣</td><td>按次列明（无发生写 0.00，不隐藏）；前 3 周「预扣」、第 4 周「代扣」；<strong>没有社保、公积金行</strong></td></tr>
          <tr><td><strong>抬头与汇总</strong></td><td>结算周 + 门店；发薪主体、收款人、卡号、开户行、应发合计、付款状态</td><td>如「10 月第 1 周（10.01–10.07）· 兴隆湖店」；卡号取档案只读，确认前状态「待发放」</td></tr>
          <tr><td><strong>确认区</strong></td><td>两条条款 + 电子签字 + 提交</td><td>逐条勾选、签字后才可提交；条款由消息中心统一维护</td></tr>
        </tbody>
      </table>

      <h4 class="h4sub">与全职工资通知的差别</h4>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">维度</th><th>全职（推拿师）</th><th>非全客户经理</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>结算周期</strong></td><td>按月汇算</td><td><strong>按周</strong>，每周一张单</td></tr>
          <tr><td><strong>一次推几条</strong></td><td>按类型各推一条（计件 / 加班 / 补贴 / 常乐豆）</td><td><strong>一条</strong>含当期全部薪酬项</td></tr>
          <tr><td><strong>扣缴段</strong></td><td>代扣社保、投诉扣款、服务时间不足扣提成等</td><td><strong>预扣 / 代扣个税 + 负工资抵扣</strong>，无社保公积金</td></tr>
        </tbody>
      </table>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'
import DocScreens from '../../../docs/components/DocScreens.vue'
import ptUnitPricesShot from '../../../docs/assets/pages/pt-unit-prices.png'
import ptPriceDialogShot from '../../../docs/assets/pages/pt-price-dialog.png'
import ptGuaranteeShot from '../../../docs/assets/pages/pt-income-guarantee.png'
import mAmSalaryShot from '../../../docs/assets/pages/m-pt-am-salary.png'
import mAmSalaryEstimateShot from '../../../docs/assets/pages/m-pt-am-salary-estimate.png'
import mAmSalaryArrivalShot from '../../../docs/assets/pages/m-pt-am-salary-arrival.png'
import mSalaryNoticeListShot from '../../../docs/assets/pages/m-pt-salary-notice-list.png'
import mSalaryNoticeShot from '../../../docs/assets/pages/m-pt-salary-notice.png'

const tocItems = [
  { id: 'hs-68-overview', label: '6.8 薪酬计算与看板' },
  { id: 'hs-68-price', label: '6.8.1 单价配置' },
  { id: 'hs-68-ops', label: '6.8.2 新增编辑作废' },
  { id: 'hs-68-guarantee', label: '6.8.3 收入保底' },
  { id: 'hs-68-week', label: '6.8.4 每周补差' },
  { id: 'hs-68-board', label: '6.8.5 薪酬看板' },
  { id: 'hs-68-notice', label: '6.8.6 工资通知' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事中心', to: '/docs/hr-schedule' },
  { label: '六、功能详细说明', to: '/docs/hr-schedule/features' },
  { label: '6.8 薪酬计算与看板（支持非全合作）' }
]
</script>

<style scoped src="./doc-base.css"></style>
