<template>
  <DocShell
    :toc-items="tocItems"
    title="五、需求范围"
    subtitle="宏观设计：做哪几件事、边界在哪、覆盖哪些岗位——明细按归属落在第 6 章"
    version="v2.6"
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
        求证后仍不服的，走显式人工出口。改数据、查别人，通通不在范围内。
        <br /><br />
        本章只讲<strong>宏观设计</strong>：做哪几件事、边界在哪、覆盖哪些岗位。
        明细不在这里堆——按归属落在第 6 章：支撑侧五实体的来源加工与本人业务事实清单在 <strong>6.1</strong>，
        计算公式开放度的逐项判定在 <strong>6.3</strong>，求证链的场景走位在 <strong>6.4</strong>。
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
        <text x="30" y="130" font-size="12" font-weight="600" fill="#712B13">支撑侧：Agent 的知识面（5.2）—— 两层围墙之内（6.2），明细见 6.1</text>
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
        <text x="477" y="196" text-anchor="middle" font-size="10" fill="#993C1D">排班 · 出勤 · 订单 · 卫生</text>
        <text x="477" y="210" text-anchor="middle" font-size="10" fill="#993C1D">按岗位罗列（6.1）</text>
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
        链路上没有「凭空算」这一步：Agent 不做未来月份试算，回答的一切数字都从支撑侧五个实体里读出来——
        算薪前的本月预估也来自业务事实累计与现行单价的读数（6.1），不是 Agent 会自己算。
      </p>
    </div>

    <div id="sa-scope-support" class="section">
      <div class="section-header">
        <h2>5.2 支撑侧：五个数据实体</h2>
        <DocCopyButton section-id="sa-scope-support" />
      </div>
      <p class="doc-p">
        支撑侧就是 Agent 的知识面：能答什么取决于这五个实体里有什么，答不了什么取决于哪个实体里没有。
        每个实体的来源、喂给 Agent 前的加工、更新时机与维护方，以及本人业务事实的逐岗位清单，都在 <strong>6.1</strong> 展开。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 190px;">数据实体</th><th style="width: 290px;">一句话</th><th>明细与判定</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>工资条快照</strong></td><td>已发放、本人名下的工资单：构成、代扣、发放时间与状态</td><td>数据源清单见 6.1</td></tr>
          <tr><td><strong>政策参数命中值</strong></td><td>按本人条件命中的保底、单价、比例——带命中依据</td><td>数据源清单见 6.1</td></tr>
          <tr><td><strong>政策资料仓库</strong></td><td>政策与规则文案，按显示名薪酬项挂载，<strong>支持维护更新</strong></td><td>存什么、怎么维护见 6.1</td></tr>
          <tr><td><strong>本人业务事实</strong></td><td>排班、出勤、订单、评价、卫生、投诉等本人记录（只取本人名下）</td><td>三岗位逐项清单见 6.1 表 A</td></tr>
          <tr><td><strong>常乐豆账户级汇总</strong></td><td>只导出三个汇总数，分类及以下不导出</td><td>按 L3 作答，见 6.3</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>知识面的完整组成：</strong>上表五个实体 + 岗位底账（7.2–7.4，107 项逐项标注形式与应答深度）+ 应答规则（四层口径与兜底句）。
        <strong>不在知识面里的</strong>：员工与 Agent 的对话历史、任何他人数据、内部名称与策略模板名、社保公积金个税的解释口径。
        <br /><strong>没有「凭空算」这一步：</strong>行为侧每条规则落地时都踩在某个实体上——求证链的四步各有数据源（6.4），
        围墙的每一道裁掉的都是某个实体里的某一类字段（6.2）。
      </div>
    </div>

    <div id="sa-scope-do" class="section">
      <div class="section-header">
        <h2>5.3 做与不做</h2>
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
          <tr><td><strong>支撑侧五实体建设与维护</strong></td><td>工资条快照、政策参数命中值、政策资料仓库（含维护更新功能）、本人业务事实接入（按 6.1 表 A 清单）、常乐豆账户级汇总——见 6.1 数据源清单</td><td>5.2 / 6.1</td></tr>
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
          <tr><td><strong>试算与预估</strong></td><td>界线按时间划：算薪前的<strong>本月</strong>业务累计按预估口径露出（非结论性、必带「以工资结算为准」标注，6.1）；未来月份业务未发生，试算不做；对<strong>已发放</strong>薪酬项还原计算过程是求证（6.4），照做</td></tr>
          <tr><td><strong>在途工资单</strong></td><td>只答已发放的；生成中、未发放的工资单一律不在数据面</td></tr>
          <tr><td><strong>受理申诉</strong></td><td>Agent 只查证；申诉走人工出口，由人事承接</td></tr>
        </tbody>
      </table>
    </div>

    <div id="sa-scope-people" class="section">
      <div class="section-header">
        <h2>5.4 岗位覆盖：三个岗位可查，圈外待纳入</h2>
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
  { id: 'sa-scope-support', label: '5.2 支撑侧：五个数据实体' },
  { id: 'sa-scope-do', label: '5.3 做与不做' },
  { id: 'sa-scope-people', label: '5.4 岗位覆盖' }
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

</style>
