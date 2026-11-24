<template>
  <DocShell
    :toc-items="tocItems"
    title="五、需求范围"
    subtitle="一句话：只做「查与证」——行为侧答到多深，支撑侧数据从哪来"
    version="v2.2"
    date="2026-11-24"
    :breadcrumbs="breadcrumbs"
  >
    <div id="sa-scope-lead" class="section">
      <div class="section-header">
        <h2>五、需求范围</h2>
        <DocCopyButton section-id="sa-scope-lead" />
      </div>
      <div class="note lead-note">
        <strong>一句话定位：</strong>Agent 只做「查与证」——员工对自己名下已发放的工资条、适用本人的政策值
        和产生这些数字的业务事实先自查自证。员工问的从来不是一个「项名」，而是<strong>「这个数怎么来的、对不对」</strong>；
        能答到多深由应答深度分层决定（6.3），分层由数据可得性与敏感度决定，不由话术决定。
        求证后仍不服的，走显式人工出口。改数据、试算、查别人，通通不在范围内。
        <br /><br />
        本章两条线一起讲：<strong>行为侧</strong>（员工怎么问、Agent 按什么深度答）与
        <strong>支撑侧</strong>（Agent 的知识面由哪些数据实体组成、怎么加工、谁维护）——
        行为侧的每一步，都要落到支撑侧的一个实体上，没有「凭空算」这一步。
      </div>
    </div>

    <div id="sa-scope-map" class="section">
      <div class="section-header">
        <h2>5.1 一张图看范围：行为侧与支撑侧</h2>
        <DocCopyButton section-id="sa-scope-map" />
      </div>
      <p class="doc-p">
        上排是<strong>行为侧</strong>：一条提问从左到右走三步——提问 → 身份判定 → 定位薪酬项、按应答深度作答。
        下排是<strong>支撑侧</strong>：Agent 的知识面由五个数据实体组成，全部被两层围墙包住（6.2）——
        数据面里没有的东西，任何话术都问不出来。
      </p>
      <svg viewBox="0 0 680 470" class="doc-svg" role="img" aria-label="薪酬查询 Agent 范围总览：行为侧（员工提问、身份判定、按深度作答、人工出口）与支撑侧（工资条快照、政策参数命中值、政策资料仓库、本人业务事实、常乐豆账户级汇总五个数据实体，围墙之内）上下对齐">
        <title>范围总览：行为侧与支撑侧</title>
        <defs>
          <marker id="saArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#888780" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </marker>
        </defs>

        <!-- 行为侧 -->
        <text x="30" y="20" font-size="12" font-weight="600" fill="#0C447C">行为侧：一条提问怎么被处理</text>
        <rect x="30" y="32" width="150" height="64" rx="10" fill="#F1EFE8" stroke="#888780" stroke-width="0.5"/>
        <text x="105" y="56" text-anchor="middle" font-size="13" font-weight="500" fill="#2C2C2A">员工提问</text>
        <text x="105" y="72" text-anchor="middle" font-size="10.5" fill="#888780">「3 号客次提成为什么是 15 块」</text>
        <text x="105" y="86" text-anchor="middle" font-size="10.5" fill="#888780">「我的保底是多少」</text>

        <line x1="182" y1="64" x2="202" y2="64" stroke="#888780" stroke-width="1" fill="none" marker-end="url(#saArr)"/>

        <rect x="208" y="32" width="160" height="64" rx="10" fill="#E6F1FB" stroke="#185FA5" stroke-width="0.5"/>
        <text x="288" y="54" text-anchor="middle" font-size="13" font-weight="500" fill="#0C447C">① 身份判定</text>
        <text x="288" y="70" text-anchor="middle" font-size="10.5" fill="#185FA5">登录态说了算</text>
        <text x="288" y="84" text-anchor="middle" font-size="10.5" fill="#185FA5">对话改不了查询对象</text>

        <line x1="370" y1="64" x2="390" y2="64" stroke="#888780" stroke-width="1" fill="none" marker-end="url(#saArr)"/>

        <rect x="396" y="32" width="254" height="64" rx="10" fill="#EAF3DE" stroke="#3B6D11" stroke-width="0.5"/>
        <text x="523" y="52" text-anchor="middle" font-size="13" font-weight="500" fill="#27500A">② 定位薪酬项 · 按深度作答</text>
        <text x="523" y="68" text-anchor="middle" font-size="10.5" fill="#3B6D11">求证层还原事实→规则→计算 · 结论层只报数</text>
        <text x="523" y="82" text-anchor="middle" font-size="10.5" fill="#3B6D11">账户级层只给三数 · 层外追问固定兜底句</text>

        <!-- 支撑侧 -->
        <text x="30" y="130" font-size="12" font-weight="600" fill="#712B13">支撑侧：Agent 的知识面（5.2）—— 两层围墙之内（6.2）</text>
        <rect x="30" y="140" width="620" height="186" rx="14" fill="#FAECE7" stroke="#993C1D" stroke-width="1" stroke-dasharray="7 4"/>
        <rect x="48" y="158" width="114" height="72" rx="9" fill="#FFFFFF" stroke="#993C1D" stroke-width="0.5"/>
        <text x="105" y="180" text-anchor="middle" font-size="11.5" font-weight="500" fill="#712B13">工资条快照</text>
        <text x="105" y="196" text-anchor="middle" font-size="10" fill="#993C1D">已发放 · 本人名下</text>
        <text x="105" y="210" text-anchor="middle" font-size="10" fill="#993C1D">敏感字段喂前剥除</text>
        <rect x="172" y="158" width="114" height="72" rx="9" fill="#FFFFFF" stroke="#993C1D" stroke-width="0.5"/>
        <text x="229" y="180" text-anchor="middle" font-size="11.5" font-weight="500" fill="#712B13">政策参数命中值</text>
        <text x="229" y="196" text-anchor="middle" font-size="10" fill="#993C1D">保底 · 单价 · 档位</text>
        <text x="229" y="210" text-anchor="middle" font-size="10" fill="#993C1D">系统注入 · 不可改</text>
        <rect x="296" y="158" width="114" height="72" rx="9" fill="#FFFFFF" stroke="#993C1D" stroke-width="0.8"/>
        <text x="353" y="180" text-anchor="middle" font-size="11.5" font-weight="500" fill="#712B13">政策资料仓库</text>
        <text x="353" y="196" text-anchor="middle" font-size="10" fill="#993C1D">政策文案 · 规则说明</text>
        <text x="353" y="210" text-anchor="middle" font-size="10" fill="#A32D2D">支持维护更新</text>
        <rect x="420" y="158" width="114" height="72" rx="9" fill="#FFFFFF" stroke="#993C1D" stroke-width="0.5"/>
        <text x="477" y="180" text-anchor="middle" font-size="11.5" font-weight="500" fill="#712B13">本人业务事实</text>
        <text x="477" y="196" text-anchor="middle" font-size="10" fill="#993C1D">排班 · 出勤 · 订单</text>
        <text x="477" y="210" text-anchor="middle" font-size="10" fill="#993C1D">按岗位罗列（5.3）</text>
        <rect x="544" y="158" width="88" height="72" rx="9" fill="#FFFFFF" stroke="#993C1D" stroke-width="0.5"/>
        <text x="588" y="180" text-anchor="middle" font-size="11.5" font-weight="500" fill="#712B13">常乐豆账户</text>
        <text x="588" y="196" text-anchor="middle" font-size="10" fill="#993C1D">只导出三数</text>
        <text x="588" y="210" text-anchor="middle" font-size="10" fill="#993C1D">分类不导出</text>

        <text x="340" y="254" text-anchor="middle" font-size="10.5" fill="#993C1D">通用围墙：别人的数据不在场 · 敏感解释不在场 · 只读无写路径</text>
        <text x="340" y="270" text-anchor="middle" font-size="10.5" fill="#993C1D">岗位差异围墙：按底账（7.2–7.4）逐项定每个岗位「什么不在场」</text>
        <text x="340" y="292" text-anchor="middle" font-size="10.5" fill="#712B13">底账（107 项 · 逐项标深度）+ 应答规则（四层口径与兜底句）一起构成知识面</text>

        <!-- 支撑 → 行为 -->
        <line x1="523" y1="326" x2="523" y2="100" stroke="#888780" stroke-width="1" fill="none" stroke-dasharray="4 3" marker-end="url(#saArr)"/>
        <text x="536" y="118" font-size="10.5" fill="#888780">答案只能来自这里 ↑</text>

        <!-- 人工出口 -->
        <line x1="340" y1="326" x2="340" y2="352" stroke="#888780" stroke-width="1" fill="none" marker-end="url(#saArr)"/>
        <text x="356" y="344" font-size="10.5" fill="#888780">求证后仍不服</text>

        <rect x="220" y="356" width="240" height="60" rx="10" fill="#FAEEDA" stroke="#854F0B" stroke-width="0.5"/>
        <text x="340" y="378" text-anchor="middle" font-size="13" font-weight="500" fill="#633806">④ 人工出口（显式转人工）</text>
        <text x="340" y="396" text-anchor="middle" font-size="10.5" fill="#854F0B">携带员工 / 工资单编号 / 质疑项 / 已查内容</text>
        <text x="340" y="410" text-anchor="middle" font-size="10.5" fill="#854F0B">Agent 不受理申诉 · 不承诺时限</text>
      </svg>
      <p class="arch-cap">
        链路上没有「凭空算」这一步：Agent 不做试算、不做预估，回答的一切数字都从支撑侧五个实体里读出来——
        求证层能还原计算，是因为事实与规则都在知识面里（6.4），不是 Agent 会自己算。
      </p>
    </div>

    <div id="sa-scope-data" class="section">
      <div class="section-header">
        <h2>5.2 支撑侧：数据从哪来、谁维护</h2>
        <DocCopyButton section-id="sa-scope-data" />
      </div>
      <p class="doc-p">
        行为侧的每一条规则（围墙、深度分层、求证链），落到研发手里都是下面这张表的一行——
        <strong>每类数据从哪来、喂给 Agent 之前做什么加工、多久更新、谁维护</strong>。
        系统落地名以研发确认为准，这里先按业务说法写。
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 130px;">数据实体</th>
            <th style="width: 190px;">来源</th>
            <th>喂给 Agent 前的加工</th>
            <th style="width: 120px;">更新时机</th>
            <th style="width: 100px;">维护方</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>工资条快照</strong></td>
            <td>模块化薪酬计算结果（已发放的工资单）</td>
            <td>敏感字段喂之前剥除（6.2）；薪酬项只留显示名称，内部名称与策略模板名不进知识面</td>
            <td>随算薪 / 发放更新</td>
            <td>薪酬侧</td>
          </tr>
          <tr>
            <td><strong>政策参数命中值</strong></td>
            <td>通用参数配置（取值契约：条件查询、命中取值）</td>
            <td>系统按本人条件注入命中值与依据，员工对话不可改变查询条件</td>
            <td>配置变更即更新</td>
            <td>薪酬侧（配置规则管理）</td>
          </tr>
          <tr>
            <td><strong>政策资料仓库</strong></td>
            <td>政策文件与规则文案：如住宿获豆政策、客次提成规则说明、补贴说明等</td>
            <td>每条挂显示名薪酬项；敏感段落<strong>在维护侧就不进仓库</strong>（如常乐豆相关操作说明，不在场不是藏着）</td>
            <td><strong>维护更新即生效</strong></td>
            <td>薪酬侧（提供维护功能）</td>
          </tr>
          <tr>
            <td><strong>本人业务事实</strong></td>
            <td>订单实付金额、接待 / 班次记录、卫生检查记录等业务系统数据</td>
            <td>只取本人名下；接入清单按 5.3 表 A 与底账 L1 项逐项确认（排班、请假、出勤、订单、评价、新客 / 回头客、门店任务、卫生检查）</td>
            <td>随业务系统产生</td>
            <td>研发接入</td>
          </tr>
          <tr>
            <td><strong>常乐豆账户级汇总</strong></td>
            <td>常乐豆账户</td>
            <td>只导出三个数（本月结算 / 可用余额 / 提现冻结）；分类及以下颗粒度不导出，与工资条联动不在场</td>
            <td>随账户结算更新</td>
            <td>薪酬侧</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>Agent 知识面的完整组成：</strong>上表五个数据实体 + 岗位底账（7.2–7.4，107 项逐项标注形式与应答深度）
        + 应答规则（四层口径与兜底句）。<strong>不在知识面里的</strong>：员工与 Agent 的对话历史、任何他人数据、
        内部名称与策略模板名、社保公积金个税的解释口径。
      </div>

      <div id="sa-scope-repo" class="subsection">
        <h3>政策资料仓库：要的不是静态文件，是可维护的功能</h3>
        <p class="doc-p">
          政策类回答不能只靠参数命中值——「住宿获豆怎么算」「客次提成的规则是什么」这类问题，
          需要政策说明文案辅助解读。所以支撑侧明确一个实体：<strong>政策资料仓库</strong>，并且它是带维护功能的：
        </p>
        <table class="data-table">
          <thead>
            <tr><th style="width: 150px;">要点</th><th>口径</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>存什么</strong></td><td>各薪酬项的政策说明与规则文案，按显示名薪酬项挂载；一类一档（如「住宿获豆政策」「计件客次收入规则」）</td></tr>
            <tr><td><strong>维护功能</strong></td><td>提供维护更新功能：新增 / 更新 / 停用——政策变了改仓库，不是改代码、不是重训模型；仓库内容与发布由薪酬侧负责，维护界面由研发实现</td></tr>
            <tr><td><strong>生效方式</strong></td><td>维护更新即重新进入知识面；历史版本留痕——应答里的「命中依据」引用当前生效版本</td></tr>
            <tr><td><strong>裁剪关同样适用</strong></td><td>敏感段落（常乐豆相关操作说明、内部账务口径）在维护侧就不进仓库——围墙第二道「不在场」对政策资料同样生效，政策解读只解读员工应知部分</td></tr>
          </tbody>
        </table>
        <div class="note">
          <strong>为什么强调可维护：</strong>薪酬策略与政策会持续演进（模板切换、单价调整、新激励上线），
          若政策文案是一次性喂入的静态资料，每次演进都要研发重新处理——维护功能把「政策更新」从研发动作
          变成薪酬侧的日常动作，这也是 Agent 能长期答对政策类问题的前提。
        </div>
      </div>
    </div>

    <div id="sa-scope-facts" class="section">
      <div class="section-header">
        <h2>5.3 业务事实与标准值：按岗位罗列</h2>
        <DocCopyButton section-id="sa-scope-facts" />
      </div>
      <p class="doc-p">
        求证链靠两样东西拼起来：<strong>本人发生了什么</strong>（业务事实——随业务系统产生、只取本人名下）
        与<strong>规则怎么说</strong>（标准与单价——来自政策参数命中值）。只说「订单」远远不够，
        下面两张表按岗位把数据罗列全，研发照此清单确认接入。
      </p>
      <h3 class="fact-h">表 A · 业务事实（本人发生）</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 170px;">数据</th>
            <th style="width: 105px;">推拿师·全职</th>
            <th style="width: 105px;">客户经理·全职</th>
            <th style="width: 105px;">推拿师·非全</th>
            <th>求证用途</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>排班与班次记录</strong></td><td class="yes">取</td><td class="yes">取</td><td class="yes">取（接单时段）</td><td>出勤、顶班、时段类还原</td></tr>
          <tr><td><strong>请假记录</strong></td><td class="yes">取</td><td class="yes">取</td><td class="yes">取</td><td>缺勤 / 扣款类核对</td></tr>
          <tr><td><strong>出勤打卡</strong></td><td class="yes">取</td><td class="yes">取</td><td class="yes">取</td><td>工时与加班核算</td></tr>
          <tr><td><strong>订单与实付金额</strong></td><td class="yes">取</td><td class="yes">取</td><td class="yes">取</td><td>计件 / 提成还原的主事实</td></tr>
          <tr><td><strong>评价 · 新客 · 回头客记录</strong></td><td class="yes">取</td><td class="no">—</td><td class="yes">取</td><td>激励类还原（围绕订单产生）</td></tr>
          <tr><td><strong>门店任务完成记录</strong></td><td class="no">—</td><td class="yes">取</td><td class="no">—</td><td>任务激励核对</td></tr>
          <tr><td><strong>卫生检查记录</strong></td><td class="yes">取</td><td class="no">—</td><td class="no">—</td><td>卫生激励 / 扣款（L2，接入后可升 L1，6.4）</td></tr>
        </tbody>
      </table>
      <h3 class="fact-h">表 B · 标准与单价（政策命中值，非业务事实）</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 190px;">标准 / 单价</th><th style="width: 190px;">适用岗位</th><th>求证链用途</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>保底标准与保底月份</strong></td><td>推拿师（全职 / 非全）</td><td>保底类收入的还原依据</td></tr>
          <tr><td><strong>超产值标准</strong></td><td>推拿师 · 全职</td><td>超产值获豆 / 超产计算的还原依据</td></tr>
          <tr><td><strong>评价单价</strong></td><td>推拿师</td><td>评价激励的还原依据</td></tr>
          <tr><td><strong>客次提成单价</strong></td><td>客户经理 · 全职</td><td>计件客次收入的还原依据（L1）</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>两类数据的分工：</strong>表 A 是「发生了多少」（本人业务事实，5.2 第四行），表 B 是「按什么规则算」
        （政策参数命中值，5.2 第二行）——求证链 STEP 03 取表 A、STEP 04 取表 B，两者拼一起才算得回那个数（5.4）。
        表 A 的接入清单（哪些表、哪些字段）由研发按本节清单与底账 L1 项逐项确认；表 B 挂显示名薪酬项，由薪酬侧配置维护。
      </div>
    </div>

    <div id="sa-scope-scenario" class="section">
      <div class="section-header">
        <h2>5.4 一个场景走到底：客次提成 15 块</h2>
        <DocCopyButton section-id="sa-scope-scenario" />
      </div>
      <p class="doc-p">
        把最常见的质疑走一遍全程，看行为侧每一步踩在支撑侧哪个实体上
        （以全职客户经理的「计件客次收入」为例，底账 7.2 标注 L1 求证层；四步求证链的细化口径见 6.4）。
        卡片颜色即数据源类别：<span class="lg lg-a">入口与定位</span> <span class="lg lg-b">业务事实</span>
        <span class="lg lg-c">政策依据</span> <span class="lg lg-d">组装（关键步）</span>
      </p>
      <div class="steps">
        <div class="step-card st-a">
          <div class="step-head"><span class="step-no">1</span><span class="step-t">进入即锁定本人</span></div>
          <div class="step-d">从【薪酬咨询助手】进入（暂定名），登录态带入——查询对象不可选、不可改（6.5）。</div>
          <div class="step-src">背后数据源：登录态 / 员工档案（岗位归属）</div>
        </div>
        <div class="step-card st-a">
          <div class="step-head"><span class="step-no">2</span><span class="step-t">定位薪酬项</span></div>
          <div class="step-d">提问解析到显示名「计件客次收入」+ 业务日期 3 号；查底账确认该项为 L1 求证层。</div>
          <div class="step-src">背后数据源：岗位底账（7.2，含深度标注）</div>
        </div>
        <div class="step-card st-b">
          <div class="step-head"><span class="step-no">3</span><span class="step-t">取业务事实</span></div>
          <div class="step-d">读本人 3 号的客次记录与订单实付金额——员工本人经历过，给本人看不构成泄露（清单见 5.3 表 A）。</div>
          <div class="step-src">背后数据源：本人业务事实（本人名下过滤）</div>
        </div>
        <div class="step-card st-c">
          <div class="step-head"><span class="step-no">4</span><span class="step-t">取政策依据</span></div>
          <div class="step-d">命中客次提成单价 + 规则说明文案——「为什么是 5 元」的依据带出处（清单见 5.3 表 B）。</div>
          <div class="step-src">背后数据源：政策参数命中值 + 政策资料仓库</div>
        </div>
        <div class="step-card st-d">
          <span class="step-key">关键步</span>
          <div class="step-head"><span class="step-no">5</span><span class="step-t">组装计算还原</span></div>
          <div class="step-d">把事实、规则、算式连成应答：3 客次 × 5 元 = 15 元——数字全部来自前三步，Agent 不自带。</div>
          <div class="step-src">背后数据源：STEP 03 + 04 拼装（无新增数据源）</div>
        </div>
        <div class="step-card st-a">
          <div class="step-head"><span class="step-no">6</span><span class="step-t">结论判定</span></div>
          <div class="step-d">一致 → 就地证完；有出入 → 如实报差异转人工，携带已查内容，不评对错、不下结论。</div>
          <div class="step-src">背后数据源：人工出口条目（6.5）</div>
        </div>
      </div>
      <p class="arch-cap">
        同一条链路换个数据源就走别的层：常乐豆问题走到 STEP 02 就换成「账户级三数」（STEP 03–05 不执行），
        代扣三类走到 STEP 04 后直接报结论——这就是「按深度分层作答」在场景里的样子。
      </p>
    </div>

    <div id="sa-scope-do" class="section">
      <div class="section-header">
        <h2>5.5 做与不做</h2>
        <DocCopyButton section-id="sa-scope-do" />
      </div>
      <div class="chain">
        <div class="chain-node on">
          <div class="cn-t">从【薪酬咨询助手】进入</div>
          <div class="cn-d">单独入口（暂定名），登录态带入即锁定本人 —— 查询对象不可选、不可改（6.5）</div>
        </div>
        <div class="chain-arrow">→</div>
        <div class="chain-node on">
          <div class="cn-t">按岗位底账定位薪酬项</div>
          <div class="cn-d">三个岗位各有现行薪酬项集合（7.2–7.4）：工资条、业务事实、政策命中值都按本人名下取</div>
        </div>
        <div class="chain-arrow">→</div>
        <div class="chain-node on">
          <div class="cn-t">按应答深度分层作答</div>
          <div class="cn-d">求证层还原「事实→规则→计算」；结论层只报数；账户级层只给三数；层外一律兜底句（6.3 / 6.4）</div>
        </div>
        <div class="chain-arrow">→</div>
        <div class="chain-node">
          <div class="cn-t">显式转人工</div>
          <div class="cn-d">核实后仍不服（含求证后真有出入），带明确条目升级；Agent 到此为止，不受理申诉</div>
        </div>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 220px;">做</th><th>口径</th><th style="width: 110px;">详见</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>按岗位底账确定查询范围</strong></td><td>三个岗位（全职推拿师 / 全职客户经理 / 非全推拿师）各按现行薪酬项集合确定能查什么，底账见 7.2–7.4</td><td>6.1</td></tr>
          <tr><td><strong>两层围墙裁出数据面</strong></td><td>通用围墙三道对所有岗位一致；岗位差异围墙按底账定各岗位「什么不在场」</td><td>6.2</td></tr>
          <tr><td><strong>按应答深度分层作答</strong></td><td>每个薪酬项归入四层之一：完整求证 / 只答结论 / 账户级汇总 / 不在场；求证层的还原链路见 6.4</td><td>6.3</td></tr>
          <tr><td><strong>支撑侧五实体建设与维护</strong></td><td>工资条快照、政策参数命中值、政策资料仓库（含维护更新功能）、本人业务事实接入（按 5.3 表 A 清单）、常乐豆账户级汇总——见 5.2 数据源清单</td><td>5.2 / 5.3</td></tr>
          <tr><td><strong>显式转人工</strong></td><td>核实后仍不服，携带明确条目走人工出口（6.5）</td><td>6.5</td></tr>
        </tbody>
      </table>
      <table class="data-table" style="margin-top: 18px;">
        <thead>
          <tr><th style="width: 220px;">不做</th><th>原因</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>查任何他人信息</strong></td><td>围墙第一道：按姓名、按岗位、按门店查别人一律不可达，且对话内容不能改变查询对象（6.2）</td></tr>
          <tr><td><strong>修改 / 代发操作</strong></td><td>围墙第三道只读：薪酬数据不进写路径</td></tr>
          <tr><td><strong>试算与预估</strong></td><td>试算会引出「为什么没发这么多」的新问题，不开放。注意界线：对<strong>已发放</strong>薪酬项还原计算过程是求证（6.4），对未发生的薪酬做预估才是试算——前者做，后者不做</td></tr>
          <tr><td><strong>在途工资单</strong></td><td>只答已发放的；生成中、未发放的工资单一律不在数据面</td></tr>
          <tr><td><strong>受理申诉</strong></td><td>Agent 只查证；申诉走人工出口，由人事承接</td></tr>
        </tbody>
      </table>
    </div>

    <div id="sa-scope-people" class="section">
      <div class="section-header">
        <h2>5.6 岗位覆盖：三个岗位可查，圈外待纳入</h2>
        <DocCopyButton section-id="sa-scope-people" />
      </div>
      <p class="doc-p">
        模块化薪酬明确支持的三个岗位进第一版：<strong>全职推拿师、全职客户经理、非全推拿师</strong>——
        各有现行薪酬项底账（7.2–7.4），围墙与应答深度按底账逐项落地。
        底账差异就是围墙差异：全职有常乐豆、社保公积金齐；非全纯现金、不缴社保公积金、个税按周预扣。
      </p>
      <svg viewBox="0 0 680 240" class="doc-svg" role="img" aria-label="岗位覆盖：全职推拿师、全职客户经理、非全推拿师三个岗位可查；非全客户经理与总部岗位暂不开放">
        <title>岗位覆盖</title>
        <rect x="24" y="26" width="208" height="104" rx="10" fill="#E6F1FB" stroke="#185FA5" stroke-width="0.5"/>
        <text x="128" y="52" text-anchor="middle" font-size="13" font-weight="500" fill="#0C447C">推拿师 · 全职</text>
        <text x="128" y="72" text-anchor="middle" font-size="11" fill="#185FA5">三模板并存 · 有常乐豆</text>
        <text x="128" y="88" text-anchor="middle" font-size="11" fill="#185FA5">社保 · 公积金 · 个税均有代扣</text>
        <text x="128" y="110" text-anchor="middle" font-size="11" fill="#3B6D11">底账 7.3（含深度标注）</text>
        <rect x="236" y="26" width="208" height="104" rx="10" fill="#E6F1FB" stroke="#185FA5" stroke-width="0.5"/>
        <text x="340" y="52" text-anchor="middle" font-size="13" font-weight="500" fill="#0C447C">客户经理 · 全职</text>
        <text x="340" y="72" text-anchor="middle" font-size="11" fill="#185FA5">单一策略 · 获豆分细 + 扣豆一项</text>
        <text x="340" y="88" text-anchor="middle" font-size="11" fill="#185FA5">社保 · 公积金 · 个税均有代扣</text>
        <text x="340" y="110" text-anchor="middle" font-size="11" fill="#3B6D11">底账 7.2（含深度标注）</text>
        <rect x="448" y="26" width="208" height="104" rx="10" fill="#EAF3DE" stroke="#3B6D11" stroke-width="0.5"/>
        <text x="552" y="52" text-anchor="middle" font-size="13" font-weight="500" fill="#27500A">推拿师 · 非全</text>
        <text x="552" y="72" text-anchor="middle" font-size="11" fill="#3B6D11">周薪模式 · 预扣个税 3% · 月末多退少补</text>
        <text x="552" y="88" text-anchor="middle" font-size="11" fill="#3B6D11">薪酬项全部现金 · 无社保公积金</text>
        <text x="552" y="110" text-anchor="middle" font-size="11" fill="#3B6D11">底账 7.4（含深度标注）</text>
        <rect x="24" y="142" width="312" height="42" rx="10" fill="#F4F4F0" stroke="#888780" stroke-width="0.8" stroke-dasharray="5 3"/>
        <text x="180" y="160" text-anchor="middle" font-size="12" font-weight="500" fill="#5F5E5A">客户经理 · 非全 —— 暂不开放</text>
        <text x="180" y="176" text-anchor="middle" font-size="11" fill="#888780">第一版覆盖三岗位；后续纳入时补底账再开口径</text>
        <rect x="352" y="142" width="304" height="42" rx="10" fill="#F4F4F0" stroke="#888780" stroke-width="0.8" stroke-dasharray="5 3"/>
        <text x="504" y="160" text-anchor="middle" font-size="12" font-weight="500" fill="#5F5E5A">总部岗位 —— 第一版不开放</text>
        <text x="504" y="176" text-anchor="middle" font-size="11" fill="#888780">待模块化薪酬覆盖后再纳入</text>
        <text x="340" y="212" text-anchor="middle" font-size="11" fill="#888780">纳入新岗位的前提：先有该岗位现行薪酬项底账，围墙与应答深度逐项对照后再开放</text>
      </svg>
      <table class="data-table">
        <thead>
          <tr><th style="width: 220px;">岗位</th><th style="width: 130px;">第一版</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>推拿师 · 全职</strong></td><td>可查</td><td>三模板并存，员工不感知模板；底账 7.3</td></tr>
          <tr><td><strong>客户经理 · 全职</strong></td><td>可查</td><td>策略「客户经理收入 V69」；底账 7.2</td></tr>
          <tr><td><strong>推拿师 · 非全</strong></td><td>可查</td><td>周薪模式，不缴社保公积金、无常乐豆；底账 7.4</td></tr>
          <tr><td><strong>客户经理 · 非全</strong></td><td>暂不开放</td><td>第一版覆盖上述三岗位；纳入前提是先补该岗位现行薪酬项底账，围墙与应答深度逐项对照后开放</td></tr>
          <tr><td><strong>总部岗位</strong></td><td>暂不支持</td><td>薪酬查询第一版不开放，待模块化薪酬覆盖后再纳入</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>覆盖不是拍脑袋，是底账撑的：</strong>三份底账合计 <strong>107 项</strong>现行薪酬项
        （全职客户经理 41 / 全职推拿师 44 / 非全推拿师 22，推拿师含三模板并存项），
        逐项标注现金或常乐豆形式与应答深度（L1–L4）——能查什么、答到多深，每一项都有出处。
        <br /><strong>纳入规则一句话：</strong>先底账、后开放——没有现行薪酬项清单的岗位不进第一版；这也是以后任何一个新岗位
        （非全客户经理、总部岗位）接入的唯一路径。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'sa-scope-lead', label: '五、需求范围' },
  { id: 'sa-scope-map', label: '5.1 行为侧与支撑侧' },
  { id: 'sa-scope-data', label: '5.2 支撑侧：数据从哪来' },
  { id: 'sa-scope-facts', label: '5.3 业务事实与标准值' },
  { id: 'sa-scope-scenario', label: '5.4 一个场景走到底' },
  { id: 'sa-scope-do', label: '5.5 做与不做' },
  { id: 'sa-scope-people', label: '5.6 岗位覆盖' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '模块化薪酬', to: '/docs/salary-agent' },
  { label: '五、需求范围' }
]
</script>

<style scoped src="./doc-base.css"></style>

<style scoped>
.doc-svg { width: 100%; height: auto; display: block; margin: 4px 0 8px; }
.arch-cap { font-size: 12px; color: #6a6a75; margin: 8px 0 0; line-height: 1.6; }
.subsection { margin-top: 20px; }
.subsection h3 { font-size: 15px; font-weight: 600; color: #2c2c2a; margin: 0 0 8px; }
.steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 14px 0 8px; }
.step-card {
  background: #fbfbfa; border: 1px solid #e3e6ea; border-top: 3px solid #888780;
  border-radius: 10px; padding: 12px 14px; display: flex; flex-direction: column; gap: 7px;
  position: relative;
}
.step-card.st-a { border-top-color: #185fa5; }
.step-card.st-b { border-top-color: #3b6d11; }
.step-card.st-c { border-top-color: #854f0b; }
.step-card.st-d {
  border-top-color: #993c1d; border-color: #993c1d;
  background: #fdf4f0; box-shadow: 0 2px 10px hsl(18 55% 45% / 0.14);
}
.step-head { display: flex; align-items: center; gap: 8px; }
.step-no {
  flex: 0 0 auto; width: 24px; height: 24px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: #fff;
}
.st-a .step-no { background: #185fa5; }
.st-b .step-no { background: #3b6d11; }
.st-c .step-no { background: #854f0b; }
.st-d .step-no { background: #993c1d; }
.step-t { font-size: 13.5px; font-weight: 600; color: #2c2c2a; }
.step-d { font-size: 12px; color: #5f5e5a; line-height: 1.6; }
.step-src {
  font-size: 11.5px; font-weight: 500; color: #5f5e5a;
  background: #f1f0ec; border-radius: 5px; padding: 4px 8px;
  line-height: 1.5; margin-top: auto;
}
.st-d .step-src { color: #712b13; background: hsl(18 60% 92%); }
.step-key {
  position: absolute; top: -11px; right: 10px;
  font-size: 11px; font-weight: 700; color: #fff;
  background: #993c1d; border-radius: 999px; padding: 2px 10px;
}
.lg { display: inline-block; font-size: 11px; font-weight: 600; border-radius: 999px; padding: 1px 9px; }
.lg-a { color: #185fa5; background: hsl(210 65% 92%); }
.lg-b { color: #3b6d11; background: hsl(90 45% 90%); }
.lg-c { color: #854f0b; background: hsl(38 70% 90%); }
.lg-d { color: #993c1d; background: hsl(18 60% 91%); }
.fact-h { font-size: 14px; font-weight: 600; color: #2c2c2a; margin: 18px 0 8px; }
td.yes { color: #3b6d11; font-weight: 600; text-align: center; }
td.no { color: #b0aca3; text-align: center; }
@media (max-width: 900px) { .steps { grid-template-columns: 1fr 1fr; } }
</style>
