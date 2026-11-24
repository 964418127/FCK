<template>
  <DocShell
    :toc-items="tocItems"
    title="五、需求范围"
    subtitle="一句话：只做「查与证」——三个岗位、两层数据面、四层应答深度、一条人工出口"
    version="v2.0"
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
      </div>
    </div>

    <div id="sa-scope-map" class="section">
      <div class="section-header">
        <h2>5.1 一张图看范围：一次提问怎么被处理</h2>
        <DocCopyButton section-id="sa-scope-map" />
      </div>
      <p class="doc-p">
        一条提问从左到右走四步：<strong>提问 → 身份判定 → 定位薪酬项、按应答深度作答 →（不服）转人工</strong>。
        回答能给出什么，完全取决于下方被围墙包住的数据面——数据面里没有的东西，任何话术都问不出来。
      </p>
      <svg viewBox="0 0 680 396" class="doc-svg" role="img" aria-label="薪酬查询 Agent 范围总览：员工提问经身份判定后定位到具体薪酬项，按四层应答深度作答，答案只来自通用围墙与岗位差异围墙之内的裁剪数据面；求证后仍不服走人工出口">
        <title>范围总览：一次提问的处理链路</title>
        <defs>
          <marker id="saArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#888780" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </marker>
        </defs>

        <rect x="30" y="24" width="150" height="72" rx="10" fill="#F1EFE8" stroke="#888780" stroke-width="0.5"/>
        <text x="105" y="50" text-anchor="middle" font-size="13" font-weight="500" fill="#2C2C2A">员工提问</text>
        <text x="105" y="68" text-anchor="middle" font-size="11" fill="#888780">「我的保底是多少」</text>
        <text x="105" y="84" text-anchor="middle" font-size="11" fill="#888780">「3 号客次提成为什么是 15 块」</text>

        <line x1="182" y1="60" x2="202" y2="60" stroke="#888780" stroke-width="1" fill="none" marker-end="url(#saArr)"/>

        <rect x="208" y="24" width="160" height="72" rx="10" fill="#E6F1FB" stroke="#185FA5" stroke-width="0.5"/>
        <text x="288" y="46" text-anchor="middle" font-size="13" font-weight="500" fill="#0C447C">① 身份判定</text>
        <text x="288" y="64" text-anchor="middle" font-size="11" fill="#185FA5">登录态说了算</text>
        <text x="288" y="80" text-anchor="middle" font-size="11" fill="#185FA5">对话改不了查询对象</text>

        <line x1="370" y1="60" x2="390" y2="60" stroke="#888780" stroke-width="1" fill="none" marker-end="url(#saArr)"/>

        <rect x="396" y="24" width="254" height="72" rx="10" fill="#EAF3DE" stroke="#3B6D11" stroke-width="0.5"/>
        <text x="523" y="44" text-anchor="middle" font-size="13" font-weight="500" fill="#27500A">③ 定位薪酬项 · 按深度作答</text>
        <text x="523" y="62" text-anchor="middle" font-size="11" fill="#3B6D11">求证层还原事实→规则→计算 · 结论层只报数</text>
        <text x="523" y="78" text-anchor="middle" font-size="11" fill="#3B6D11">账户级层只给三数 · 追问固定兜底句</text>

        <path d="M316 100 L316 128" fill="none" stroke="#5F5E5A" stroke-width="1.2" marker-end="url(#saArr)"/>
        <text x="330" y="118" font-size="11" fill="#888780">答案只能来自这里 ↓</text>

        <!-- 数据面：两层围墙 -->
        <rect x="30" y="132" width="620" height="140" rx="14" fill="#FAECE7" stroke="#993C1D" stroke-width="1" stroke-dasharray="7 4"/>
        <text x="52" y="156" font-size="12" font-weight="600" fill="#712B13">② 数据面 —— 两层围墙之内（6.2）：通用围墙 + 岗位差异围墙</text>
        <rect x="52" y="168" width="286" height="56" rx="9" fill="#FFFFFF" stroke="#993C1D" stroke-width="0.5"/>
        <text x="195" y="188" text-anchor="middle" font-size="12" font-weight="500" fill="#712B13">工资条（已发放 · 本人名下）</text>
        <text x="195" y="204" text-anchor="middle" font-size="11" fill="#993C1D">构成 · 代扣 · 发放时间与状态</text>
        <text x="195" y="218" text-anchor="middle" font-size="11" fill="#993C1D">敏感字段喂之前剥掉（6.2）</text>
        <rect x="354" y="168" width="274" height="56" rx="9" fill="#FFFFFF" stroke="#993C1D" stroke-width="0.5"/>
        <text x="491" y="188" text-anchor="middle" font-size="12" font-weight="500" fill="#712B13">本人业务事实 + 政策命中值</text>
        <text x="491" y="204" text-anchor="middle" font-size="11" fill="#993C1D">订单实付 · 接待记录 · 保底与单价</text>
        <text x="491" y="218" text-anchor="middle" font-size="11" fill="#993C1D">求证层的数据源（6.4）</text>
        <text x="340" y="246" text-anchor="middle" font-size="11" fill="#993C1D">通用围墙：别人的数据不在场 · 敏感解释不在场 · 只读无写路径</text>
        <text x="340" y="262" text-anchor="middle" font-size="11" fill="#993C1D">岗位差异围墙：按底账（7.2–7.4）逐项定每个岗位「什么不在场」</text>

        <path d="M523 100 L523 128" fill="none" stroke="#5F5E5A" stroke-width="1.2" marker-end="url(#saArr)"/>

        <line x1="340" y1="276" x2="340" y2="296" stroke="#888780" stroke-width="1" fill="none" marker-end="url(#saArr)"/>
        <text x="356" y="290" font-size="11" fill="#888780">求证后仍不服</text>

        <rect x="220" y="300" width="240" height="60" rx="10" fill="#FAEEDA" stroke="#854F0B" stroke-width="0.5"/>
        <text x="340" y="322" text-anchor="middle" font-size="13" font-weight="500" fill="#633806">④ 人工出口（显式转人工）</text>
        <text x="340" y="340" text-anchor="middle" font-size="11" fill="#854F0B">携带员工 / 工资单编号 / 质疑项 / 已查内容</text>
        <text x="340" y="355" text-anchor="middle" font-size="11" fill="#854F0B">Agent 不受理申诉 · 不承诺时限</text>
      </svg>
      <p class="arch-cap">
        链路上没有「凭空算」这一步：Agent 不做试算、不做预估，回答的一切数字都从数据面里读出来——
        求证层能还原计算，是因为事实与规则都在数据面里（6.4），不是 Agent 会自己算。
      </p>
    </div>

    <div id="sa-scope-do" class="section">
      <div class="section-header">
        <h2>5.2 做：四件事，各挂一章</h2>
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
          <tr><th style="width: 220px;">事项</th><th>口径</th><th style="width: 110px;">详见</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>按岗位底账确定查询范围</strong></td><td>三个岗位（全职推拿师 / 全职客户经理 / 非全推拿师）各按现行薪酬项集合确定能查什么，底账见 7.2–7.4</td><td>6.1</td></tr>
          <tr><td><strong>两层围墙裁出数据面</strong></td><td>通用围墙三道对所有岗位一致；岗位差异围墙按底账定各岗位「什么不在场」</td><td>6.2</td></tr>
          <tr><td><strong>按应答深度分层作答</strong></td><td>每个薪酬项归入四层之一：完整求证 / 只答结论 / 账户级汇总 / 不在场；求证层的还原链路见 6.4</td><td>6.3</td></tr>
          <tr><td><strong>显式转人工</strong></td><td>核实后仍不服，携带明确条目走人工出口（6.5）</td><td>6.5</td></tr>
        </tbody>
      </table>
    </div>

    <div id="sa-scope-not" class="section">
      <div class="section-header">
        <h2>5.3 不做：五件事，全在围墙之外</h2>
        <DocCopyButton section-id="sa-scope-not" />
      </div>
      <p class="doc-p">
        左边是围墙之内 Agent 能看见的，右边是五个「不做」——每个都标了它被哪道墙挡住：不是规则不让，
        而是<strong>数据面里根本不存在</strong>。
      </p>
      <div class="arch-diff">
        <div class="arch-col">
          <div class="arch-head after">围墙之内 · 在场</div>
          <svg viewBox="0 0 560 208" class="arch-svg" role="img" aria-label="围墙之内：本人工资条、业务事实与政策命中值、应答深度分层、人工出口四项在场">
            <rect x="8" y="8" width="544" height="192" rx="12" fill="#EAF3DE" stroke="#3B6D11" stroke-width="1" stroke-dasharray="7 4"/>
            <text x="280" y="34" text-anchor="middle" font-size="12" font-weight="600" fill="#27500A">数据面里有的，才答得出</text>
            <rect x="30" y="48" width="240" height="56" rx="8" fill="#FFFFFF" stroke="#97C459" stroke-width="0.5"/>
            <text x="150" y="72" text-anchor="middle" font-size="12" font-weight="500" fill="#27500A">本人已发放工资条</text>
            <text x="150" y="90" text-anchor="middle" font-size="11" fill="#3B6D11">敏感字段喂之前剥掉</text>
            <rect x="290" y="48" width="240" height="56" rx="8" fill="#FFFFFF" stroke="#97C459" stroke-width="0.5"/>
            <text x="410" y="72" text-anchor="middle" font-size="12" font-weight="500" fill="#27500A">本人业务事实 + 政策命中值</text>
            <text x="410" y="90" text-anchor="middle" font-size="11" fill="#3B6D11">订单实付 · 接待记录 · 命中依据</text>
            <rect x="30" y="116" width="240" height="56" rx="8" fill="#FFFFFF" stroke="#97C459" stroke-width="0.5"/>
            <text x="150" y="140" text-anchor="middle" font-size="12" font-weight="500" fill="#27500A">应答深度分层与兜底句</text>
            <text x="150" y="158" text-anchor="middle" font-size="11" fill="#3B6D11">四层 · 逐项见底账标注</text>
            <rect x="290" y="116" width="240" height="56" rx="8" fill="#FFFFFF" stroke="#97C459" stroke-width="0.5"/>
            <text x="410" y="140" text-anchor="middle" font-size="12" font-weight="500" fill="#27500A">人工出口（只转交）</text>
            <text x="410" y="158" text-anchor="middle" font-size="11" fill="#3B6D11">带条目升级，不受理申诉</text>
          </svg>
          <p class="arch-cap">四件事都在围墙之内完成：能答什么由数据面决定，不由话术决定。</p>
        </div>
        <div class="arch-col">
          <div class="arch-head before">围墙之外 · 不在场</div>
          <svg viewBox="0 0 560 208" class="arch-svg" role="img" aria-label="围墙之外五个不做：查他人、改数据、试算预估、在途工资单、受理申诉，各标注被哪道墙挡住">
            <rect x="8" y="8" width="544" height="192" rx="12" fill="#F4F4F0" stroke="#888780" stroke-width="1" stroke-dasharray="4 3"/>
            <text x="280" y="34" text-anchor="middle" font-size="12" font-weight="600" fill="#712B13">数据面里没有的，问不出来</text>
            <rect x="30" y="48" width="240" height="42" rx="8" fill="#FCEBEB" stroke="#E24B4A" stroke-width="0.5"/>
            <text x="150" y="66" text-anchor="middle" font-size="12" font-weight="500" fill="#791F1F">查任何他人信息</text>
            <text x="150" y="82" text-anchor="middle" font-size="11" fill="#A32D2D">墙① 只能查自己 · 墙② 不在场</text>
            <rect x="290" y="48" width="240" height="42" rx="8" fill="#FCEBEB" stroke="#E24B4A" stroke-width="0.5"/>
            <text x="410" y="66" text-anchor="middle" font-size="12" font-weight="500" fill="#791F1F">修改 / 代发操作</text>
            <text x="410" y="82" text-anchor="middle" font-size="11" fill="#A32D2D">墙③ 只读：不进写路径</text>
            <rect x="30" y="102" width="240" height="42" rx="8" fill="#FCEBEB" stroke="#E24B4A" stroke-width="0.5"/>
            <text x="150" y="120" text-anchor="middle" font-size="12" font-weight="500" fill="#791F1F">试算与预估</text>
            <text x="150" y="136" text-anchor="middle" font-size="11" fill="#A32D2D">只还原已发生的（6.4），不算未来的</text>
            <rect x="290" y="102" width="240" height="42" rx="8" fill="#FCEBEB" stroke="#E24B4A" stroke-width="0.5"/>
            <text x="410" y="120" text-anchor="middle" font-size="12" font-weight="500" fill="#791F1F">在途工资单</text>
            <text x="410" y="136" text-anchor="middle" font-size="11" fill="#A32D2D">只入已发放 · 生成中不在场</text>
            <rect x="160" y="156" width="240" height="36" rx="8" fill="#FCEBEB" stroke="#E24B4A" stroke-width="0.5"/>
            <text x="280" y="172" text-anchor="middle" font-size="12" font-weight="500" fill="#791F1F">受理申诉</text>
            <text x="280" y="186" text-anchor="middle" font-size="11" fill="#A32D2D">口径边界：申诉归人工出口承接</text>
          </svg>
          <p class="arch-cap">五个「不做」不靠话术拦截：试算、在途单、他人数据在数据面里不存在，写路径不存在，申诉只在口径上不收。</p>
        </div>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 220px;">事项</th><th>原因</th></tr>
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
        <strong>纳入规则一句话：</strong>先底账、后开放——没有现行薪酬项清单的岗位不进第一版；这也是以后任何一个新岗位
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
  { id: 'sa-scope-map', label: '5.1 一张图看范围' },
  { id: 'sa-scope-do', label: '5.2 做' },
  { id: 'sa-scope-not', label: '5.3 不做' },
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
.arch-diff { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 12px 0 6px; }
.arch-col { border: 1px solid #e3e6ea; border-radius: 10px; padding: 12px; background: #fbfbfa; }
.arch-head { font-size: 13px; font-weight: 600; margin-bottom: 8px; padding: 7px 10px; border-radius: 6px; }
.arch-head.before { background: #fbeceb; color: #791f1f; }
.arch-head.after { background: #eaf3de; color: #27500a; }
.arch-svg { width: 100%; height: auto; display: block; }
.arch-cap { font-size: 12px; color: #6a6a75; margin: 8px 0 0; line-height: 1.6; }
</style>
