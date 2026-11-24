<template>
  <DocShell
    :toc-items="tocItems"
    title="五、需求范围"
    subtitle="现状四张考卷 + 通用设计四阶段：定义 / 获取 / 变化 / 结果写入（本期不动）"
    version="v3.10 四阶段口径：前三段本期做，结果写入不动"
    date="2026-11-17"
    :breadcrumbs="breadcrumbs"
  >
    <div id="hs-scope" class="section">
      <div class="section-header">
        <h2>五、需求范围</h2>
        <DocCopyButton section-id="hs-scope" />
      </div>
      <div class="note lead-note">
        <strong>一句话定位：</strong>现行的四个岗位就是四张考卷；通用设计把「名额从哪来、谁能拿」
        和「拿完之后来不了怎么办」拆成四个阶段——定义、获取、变化、排班结果写入；
        本期做前三段，结果写入沿用既有排班结果表不动（相关模块核查薪酬有效时段，要结合事件一起看）。
      </div>
    </div>

    <div id="hs-scope-now" class="section">
      <div class="section-header">
        <h2>5.1 现状：四张考卷</h2>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 110px;">岗位</th>
            <th style="width: 130px;">发布</th>
            <th style="width: 160px;">名额怎么算</th>
            <th>谁能拿 · 怎么拿</th>
            <th style="width: 150px;">兜底</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>全职客户经理</strong></td>
            <td>周四 06:00 铺下周</td>
            <td>按人数组合出早中晚全天</td>
            <td>① 轮转直派 ② 储备补位 ③ 非全抢 ④ 同城抢</td>
            <td>生成通班</td>
          </tr>
          <tr>
            <td><strong>全职推拿师</strong></td>
            <td>周四 06:00 铺下周</td>
            <td>按天均业务量，1–3</td>
            <td>本店申领，截止按综合分排；落选周五再抢</td>
            <td>生成通班</td>
          </tr>
          <tr>
            <td><strong>非全客户经理</strong></td>
            <td>周四 06:00，可手动补</td>
            <td>时段固定，0–6</td>
            <td>三档分先后接单：非全客经 → 非全推拿 → 全职推拿</td>
            <td>转临时时段</td>
          </tr>
          <tr>
            <td><strong>非全推拿师</strong></td>
            <td>手动发布</td>
            <td>签约人数 ÷ 2</td>
            <td>仅本店非全，先到先得，早晚必选</td>
            <td>待定（<router-link to="/docs/hr-schedule/appendix">附录</router-link>）</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>边界：</strong>做到「谁来占」为止——打卡只留挂载点；结果写进既有排班结果表；
        加班算钱是薪酬的事；谁是本店非全、谁有资格，只读人员侧，不在这里定。
      </div>
    </div>

    <div id="hs-scope-stages" class="section">
      <div class="section-header">
        <h2>5.2 通用设计：四个阶段（本期做前三段）</h2>
      </div>
      <svg viewBox="0 0 680 128" class="doc-svg" role="img" aria-label="通用设计四个阶段：定义、获取、变化、排班结果写入；前三段本期做，第四段本期不动">
        <title>通用设计四阶段</title>
        <defs>
          <marker id="stArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#888780" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </marker>
        </defs>
        <rect x="30" y="44" width="140" height="64" rx="10" fill="#E6F1FB" stroke="#185FA5" stroke-width="0.5"/>
        <text x="100" y="70" text-anchor="middle" font-size="14" font-weight="500" fill="#0C447C">① 定义</text>
        <text x="100" y="92" text-anchor="middle" font-size="12" fill="#185FA5">时段 · 名额 · 清单</text>
        <line x1="172" y1="76" x2="188" y2="76" stroke="#888780" stroke-width="1" fill="none" marker-end="url(#stArr)"/>
        <rect x="192" y="44" width="140" height="64" rx="10" fill="#EAF3DE" stroke="#3B6D11" stroke-width="0.5"/>
        <text x="262" y="70" text-anchor="middle" font-size="14" font-weight="500" fill="#27500A">② 获取</text>
        <text x="262" y="92" text-anchor="middle" font-size="12" fill="#3B6D11">窗口内三种拿法</text>
        <line x1="334" y1="76" x2="350" y2="76" stroke="#888780" stroke-width="1" fill="none" marker-end="url(#stArr)"/>
        <rect x="354" y="44" width="140" height="64" rx="10" fill="#FAEEDA" stroke="#854F0B" stroke-width="0.5"/>
        <text x="424" y="70" text-anchor="middle" font-size="14" font-weight="500" fill="#633806">③ 变化</text>
        <text x="424" y="92" text-anchor="middle" font-size="12" fill="#854F0B">事实 → 结果重算</text>
        <line x1="496" y1="76" x2="512" y2="76" stroke="#888780" stroke-width="1" fill="none" marker-end="url(#stArr)"/>
        <rect x="516" y="44" width="140" height="64" rx="10" fill="#F4F4F0" stroke="#888780" stroke-width="0.8" stroke-dasharray="5 3"/>
        <text x="586" y="70" text-anchor="middle" font-size="14" font-weight="500" fill="#5F5E5A">④ 排班结果写入</text>
        <text x="586" y="92" text-anchor="middle" font-size="12" fill="#888780">本期不动</text>
      </svg>
      <div class="note">
        <strong>名额是容量不是库存</strong>——这一条贯穿前三段，是三段能拼成一张卷子的前提。
        <strong>第 ④ 段本期不动：</strong>结果写入沿用既有排班结果表；相关模块核查薪酬有效时段，要结合事件（事实）一起看。
      </div>

      <h4 class="h4sub">四阶段总图：前三段内部的关键结论</h4>
      <svg viewBox="0 0 680 724" class="doc-svg" role="img" aria-label="排班通用化重构业务结构总图：定义、获取、变化三阶段的结构与要点">
        <title>三阶段业务结构总图</title>
        <defs>
          <marker id="ovArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#888780" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </marker>
        </defs>

        <rect x="40" y="66" width="600" height="232" rx="16" fill="#F1EFE8" stroke="#D3D1C7" stroke-width="0.5"/>
        <text x="60" y="90" font-size="13" font-weight="500" fill="#0C447C">阶段一 · 定义 — 时段 · 名额 · 清单（无人参与）</text>

        <text x="115" y="106" text-anchor="middle" font-size="11" fill="#0F6E56">名额来源</text>
        <rect x="60" y="112" width="110" height="30" rx="8" fill="#E1F5EE" stroke="#0F6E56" stroke-width="0.5"/>
        <text x="115" y="127" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#085041">人工给定</text>
        <path d="M115 142 L115 152" fill="none" stroke="#5F5E5A" stroke-width="1.2" marker-end="url(#ovArr)"/>
        <rect x="60" y="152" width="110" height="48" rx="8" fill="#E1F5EE" stroke="#0F6E56" stroke-width="0.5"/>
        <text x="115" y="170" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#085041">算法服务</text>
        <text x="115" y="186" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#0F6E56">可枚举 · 只登记</text>
        <path d="M115 200 L115 210" fill="none" stroke="#5F5E5A" stroke-width="1.2" marker-end="url(#ovArr)"/>
        <rect x="60" y="210" width="110" height="30" rx="8" fill="#E1F5EE" stroke="#0F6E56" stroke-width="0.5"/>
        <text x="115" y="225" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#085041">钳制 · 快照</text>
        <path d="M170 225 L196 225" fill="none" stroke="#5F5E5A" stroke-width="1.2" marker-end="url(#ovArr)"/>

        <rect x="200" y="112" width="420" height="134" rx="10" fill="#E6F1FB" stroke="#185FA5" stroke-width="0.5"/>
        <text x="220" y="132" font-size="13" font-weight="500" fill="#0C447C">时段（归空间 · 不归岗位）</text>
        <rect x="220" y="144" width="110" height="30" rx="8" fill="#B5D4F4" stroke="#185FA5" stroke-width="0.5"/>
        <text x="275" y="159" text-anchor="middle" dominant-baseline="central" font-size="12" fill="#0C447C">日期 + 起止</text>
        <rect x="338" y="144" width="126" height="44" rx="8" fill="#B5D4F4" stroke="#185FA5" stroke-width="0.5"/>
        <text x="401" y="162" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#0C447C">名额 N</text>
        <text x="401" y="177" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#185FA5">容量 · 不是库存</text>
        <rect x="472" y="144" width="128" height="44" rx="8" fill="#B5D4F4" stroke="#185FA5" stroke-width="0.5"/>
        <text x="536" y="162" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#0C447C">有序清单</text>
        <text x="536" y="177" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#185FA5">谁·方式·窗口·上限</text>
        <text x="220" y="196" font-size="11" fill="#185FA5">不可互替的岗位 =</text>
        <text x="220" y="212" font-size="11" fill="#185FA5">开两个时间重合的时段</text>
        <text x="536" y="196" text-anchor="middle" font-size="11" fill="#185FA5">各行开放时刻不同</text>
        <text x="536" y="212" text-anchor="middle" font-size="11" fill="#185FA5">A 先挑 · B 隔会儿加入</text>
        <text x="220" y="234" font-size="11" fill="#185FA5">名额是容量：N 从头到尾不变，不回池、不减一</text>

        <path d="M340 298 L340 314" fill="none" stroke="#5F5E5A" stroke-width="1.2" marker-end="url(#ovArr)"/>

        <rect x="40" y="314" width="600" height="190" rx="16" fill="#F1EFE8" stroke="#D3D1C7" stroke-width="0.5"/>
        <text x="60" y="336" font-size="13" font-weight="500" fill="#085041">阶段二 · 获取 — 轮</text>

        <rect x="60" y="350" width="240" height="48" rx="8" fill="#E1F5EE" stroke="#0F6E56" stroke-width="0.5"/>
        <text x="180" y="368" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#085041">轮</text>
        <text x="180" y="384" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#0F6E56">清单切到第 k 档的一段窗口</text>
        <rect x="60" y="410" width="240" height="62" rx="8" fill="#E1F5EE" stroke="#0F6E56" stroke-width="0.5"/>
        <text x="180" y="428" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#085041">轮的四个参数（各自取值）</text>
        <text x="180" y="444" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#0F6E56">周期粒度 · 发布时点 · 覆盖跨度</text>
        <text x="180" y="458" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#0F6E56">获取窗口逐行逐轮配置</text>

        <rect x="320" y="350" width="90" height="32" rx="8" fill="#EEEDFE" stroke="#534AB7" stroke-width="0.5"/>
        <text x="365" y="366" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#3C3489">直派轮转</text>
        <rect x="418" y="350" width="92" height="32" rx="8" fill="#EEEDFE" stroke="#534AB7" stroke-width="0.5"/>
        <text x="464" y="366" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#3C3489">申领审核</text>
        <rect x="518" y="350" width="92" height="32" rx="8" fill="#EEEDFE" stroke="#534AB7" stroke-width="0.5"/>
        <text x="564" y="366" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#3C3489">抢</text>
        <text x="365" y="394" text-anchor="middle" font-size="11" fill="#534AB7">指定的人轮着来</text>
        <text x="464" y="394" text-anchor="middle" font-size="11" fill="#534AB7">截止后按综合分</text>
        <text x="464" y="408" text-anchor="middle" font-size="11" fill="#534AB7">排序截断</text>
        <text x="564" y="394" text-anchor="middle" font-size="11" fill="#534AB7">先到先得</text>

        <rect x="320" y="424" width="290" height="56" rx="8" fill="#FAEEDA" stroke="#854F0B" stroke-width="0.5"/>
        <text x="465" y="442" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#633806">关闸</text>
        <text x="465" y="457" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#854F0B">时刻 = 获取方式的函数 · 挂规则上</text>
        <text x="465" y="471" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#854F0B">轮不携带人群属性</text>

        <text x="340" y="496" text-anchor="middle" font-size="12" font-weight="500" fill="#085041">锚点：获取段结束 = 名额给了就是给了</text>

        <path d="M340 504 L340 520" fill="none" stroke="#5F5E5A" stroke-width="1.2" marker-end="url(#ovArr)"/>

        <rect x="40" y="520" width="600" height="186" rx="16" fill="#F1EFE8" stroke="#D3D1C7" stroke-width="0.5"/>
        <text x="60" y="542" font-size="13" font-weight="500" fill="#712B13">阶段三 · 变化 — 事实 → 结果重算</text>

        <rect x="60" y="556" width="126" height="56" rx="8" fill="#FAECE7" stroke="#993C1D" stroke-width="0.5"/>
        <text x="123" y="576" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#712B13">请假</text>
        <text x="123" y="592" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#993C1D">临时缺席</text>
        <rect x="194" y="556" width="126" height="56" rx="8" fill="#FAECE7" stroke="#993C1D" stroke-width="0.5"/>
        <text x="257" y="576" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#712B13">顶班</text>
        <text x="257" y="592" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#993C1D">经营性 · 不需同意</text>
        <rect x="328" y="556" width="126" height="56" rx="8" fill="#FAECE7" stroke="#993C1D" stroke-width="0.5"/>
        <text x="391" y="576" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#712B13">换班</text>
        <text x="391" y="592" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#993C1D">对价 · 需对方同意</text>
        <rect x="462" y="556" width="150" height="56" rx="8" fill="#FAECE7" stroke="#993C1D" stroke-width="0.5"/>
        <text x="537" y="574" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#712B13">离职</text>
        <text x="537" y="590" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#993C1D">离职 · 长期假 · 调岗</text>
        <text x="537" y="604" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#993C1D">不找人 · 人直接出结果</text>

        <path d="M123 612 L123 624 L537 624 L537 612" fill="none" stroke="#888780" stroke-width="1"/>
        <path d="M340 624 L340 636" fill="none" stroke="#5F5E5A" stroke-width="1.2" marker-end="url(#ovArr)"/>

        <rect x="290" y="636" width="100" height="34" rx="8" fill="#EAF3DE" stroke="#3B6D11" stroke-width="0.5"/>
        <text x="340" y="653" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#27500A">结果重算</text>
        <path d="M390 653 L406 653" fill="none" stroke="#5F5E5A" stroke-width="1.2" marker-end="url(#ovArr)"/>
        <rect x="406" y="630" width="180" height="50" rx="8" fill="#EAF3DE" stroke="#3B6D11" stroke-width="0.5"/>
        <text x="496" y="648" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#27500A">留一条记录</text>
        <text x="496" y="664" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#3B6D11">只覆盖 · 不回滚 · 留痕</text>

        <text x="340" y="694" text-anchor="middle" font-size="11" fill="#888780">关闸前缺席属获取段 · 关闸后才归变化段</text>
      </svg>
      <p class="arch-cap">总图先给全貌：前三段各自的关键结论在 5.3–5.5 分头展开，四张考卷怎么落进三段见 5.6；第 ④ 段排班结果写入本期不动，结果表结构、打卡与薪酬消费侧都不在本期范围。</p>

      <h4 class="h4sub">现状 vs 通用设计：左边各配各的，右边共用一套</h4>
      <p class="doc-p">
        左边是现在：<strong>一个岗位 = 一条策略</strong>，生成节奏、班次名额、顺位人群、余额兜底全焊在同一条里，
        四个岗位就抄四遍。右边是通用设计：同样这四件事摊成四层，四个岗位共用同一套层，只换挂载关系。
      </p>
      <div class="arch-diff">
        <div class="arch-col">
          <div class="arch-head before">现在 · 一个岗位一条策略，取值互不相同</div>
          <svg viewBox="0 0 560 300" class="arch-svg" role="img"
               aria-label="现行架构：四个岗位各一行，每行是生成节奏、班次名额、顺位人群、余额兜底的真实取值，四行互不相同且互不共享">
            <text x="88" y="52" class="ac-t-note">生成节奏</text>
            <text x="206" y="52" class="ac-t-note">班次与名额</text>
            <text x="324" y="52" class="ac-t-note">顺位与人群</text>
            <text x="442" y="52" class="ac-t-note">余额兜底</text>
            <g v-for="(r, ri) in nowRows" :key="r.who[1]">
              <text x="80" :y="81 + ri * 52" text-anchor="end" class="ac-t-strong">{{ r.who[0] }}</text>
              <text x="80" :y="96 + ri * 52" text-anchor="end" class="ac-t-strong">{{ r.who[1] }}</text>
              <g v-for="(c, j) in r.cells" :key="j">
                <rect :x="88 + j * 118" :y="66 + ri * 52" width="112" height="38" rx="6"
                      :class="c[2] ? 'ac-cell-warn' : 'ac-cell'" />
                <text :x="144 + j * 118" :y="80 + ri * 52" text-anchor="middle"
                      :class="c[2] ? 'ac-t-warn' : 'ac-t'">{{ c[0] }}</text>
                <text v-if="c[1]" :x="144 + j * 118" :y="95 + ri * 52" text-anchor="middle" class="ac-t">{{ c[1] }}</text>
              </g>
            </g>
            <text x="324" y="288" text-anchor="middle" class="ac-t-note">同一件事四个岗位各配各的：改顺位要改四处，换门店要复制四条</text>
          </svg>
          <p class="arch-cap">每行是一个岗位的真实取值——差异看得见，但都被焊死在各自的策略里。</p>
        </div>

        <div class="arch-col">
          <div class="arch-head after">通用设计 · 四层，四岗共用</div>
          <svg viewBox="0 0 560 292" class="arch-svg" role="img"
               aria-label="通用设计架构：容器、时段、获取规则、排班结果四层横切，四个岗位共用同一套层">
            <g v-for="(l, li) in newLayers" :key="l.t">
              <rect x="6" :y="4 + li * 54" width="548" height="44" rx="9" class="ac-box-new" />
              <circle cx="26" :cy="26 + li * 54" r="9" class="ac-num" />
              <text x="26" :y="29.5 + li * 54" text-anchor="middle" class="ac-t-num">{{ li + 1 }}</text>
              <text x="44" :y="22 + li * 54" class="ac-t-strong">{{ l.t }}</text>
              <text x="44" :y="39 + li * 54" class="ac-t">{{ l.d }}</text>
              <path :d="`M280 ${50 + li * 54} l4 5 l-8 0 z`" class="ac-arrow" v-if="li < 3" />
            </g>
            <text x="280" y="244" text-anchor="middle" class="ac-t-note">↓ 四个岗位落在同一套层上，只换挂载关系</text>
            <g v-for="(p, pi) in newPeople" :key="p">
              <rect :x="11 + pi * 136" y="252" width="130" height="24" rx="12" class="ac-chip" />
              <text :x="76 + pi * 136" y="268" text-anchor="middle" class="ac-t">{{ p }}</text>
            </g>
          </svg>
          <p class="arch-cap">四层各管一件事，四个岗位共用；换岗位只换挂载关系，不动层本身。</p>
        </div>
      </div>
    </div>

    <div id="hs-scope-define" class="section">
      <div class="section-header">
        <h2>5.3 定义段要点：名额从哪来，时段归谁</h2>
      </div>
      <ul class="pt-list">
        <li><strong>名额是容量不是库存。</strong>N 说的是这段同时能上几个人：人来占、人走空，N 从头到尾不动，没有回池。</li>
        <li><strong>时段归空间，不归岗位。</strong>时段只声明日期、起止、几个位；谁能来由有序清单说（谁 · 怎么拿 · 何时开）。
          能互替的进同一清单按顺位挑；不能互替的开两个时段——这就是时段允许重叠的用途。</li>
        <li><strong>临时时段 = 特殊情况下的新增名额</strong>，改的是那一天的容量，不进周期安排；
          兜底永远指向某个已有班次，通班只是个班次名。</li>
        <li><strong>排班节奏：业务周是主表达，自然月 / 业务自定义同机制：</strong>业务周三个参数说完——每周几为起点、每周几什么时间发布、发布的是几个业务周之后的那期（<b>提前 2 个业务周 = 发布的是下下周期的班</b>：当天发布、窗口内选择，到那一周才生效使用）。自然月 / 业务自定义仍是「锚点 + 相对起点偏移」同一套换算。任意时刻多期并存（在跑的、已截止待开始的、正在选的），是发布提前的自然结果。</li>
        <li><strong>配置人员按天干活，不是按班次：</strong>时段与清单提供「按班次 / 按周期」两个视图。按周期展示节奏铺下来的每一天——先配好一天，再把这一天复制 / 覆盖到其他天；覆盖式应用前先看加减预览（源天没有的班次会从目标天移出）。班次按星期几定义，复制落在每周的同一天。</li>
        <li><strong>算法服务是公共的：</strong>登记在配置台顶部「算法服务」页，不挂在某个空间下；算法系统固定提供、只登记使用，登记的是「读什么数、怎么算、版本号」。两类算法不一样：<b>名额来源类</b>（按在岗人数 / 按签约人数 / 按业务量）的人群（合作形式 × 岗位）写死在登记里——同一条算法按不同人群算出的不是一个数；<b>缺口判定类</b>（实时经营需求）是计算传参——岗位、合作形式、空间、时段、实时数据由调用时传入，各店各岗分开动态算，不是拉通一个数。各空间的时段在名额来源或缺口规则里挂它，一项服务可以被多个时段、多个空间同时引用。</li>
      </ul>
      <svg viewBox="0 0 680 302" class="doc-svg" role="img" aria-label="名额来源：人工给定是一个值，算法服务是可枚举清单">
        <title>名额来源：一个人工值，一张可枚举的服务清单</title>
        <defs>
          <marker id="nsArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#b4b2a9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </marker>
        </defs>
        <rect x="40" y="32" width="180" height="84" rx="10" fill="#FAEEDA" stroke="#854F0B" stroke-width="0.5"/>
        <text x="56" y="54" font-size="13" font-weight="500" fill="#633806">人工给定</text>
        <text x="56" y="76" font-size="12" fill="#854F0B">店长 / 人事直接填数</text>
        <text x="56" y="94" font-size="12" fill="#854F0B">清单第一项 · 无输入</text>
        <rect x="248" y="32" width="392" height="84" rx="10" fill="#E6F1FB" stroke="#185FA5" stroke-width="0.5"/>
        <text x="264" y="54" font-size="13" font-weight="500" fill="#0C447C">算法服务清单 · 当前登记 5 项</text>
        <rect x="260" y="62" width="88" height="42" rx="6" fill="#F3F8FD" stroke="#85B7EB" stroke-width="0.5"/>
        <text x="304" y="80" text-anchor="middle" font-size="12" fill="#0C447C">按在岗人数</text>
        <text x="304" y="96" text-anchor="middle" font-size="11" fill="#185FA5">读人事状态</text>
        <rect x="354" y="62" width="88" height="42" rx="6" fill="#F3F8FD" stroke="#85B7EB" stroke-width="0.5"/>
        <text x="398" y="80" text-anchor="middle" font-size="12" fill="#0C447C">按签约人数</text>
        <text x="398" y="96" text-anchor="middle" font-size="11" fill="#185FA5">读合作类型</text>
        <rect x="448" y="62" width="88" height="42" rx="6" fill="#F3F8FD" stroke="#85B7EB" stroke-width="0.5"/>
        <text x="492" y="80" text-anchor="middle" font-size="12" fill="#0C447C">按业务量</text>
        <text x="492" y="96" text-anchor="middle" font-size="11" fill="#185FA5">读业务系统</text>
        <rect x="542" y="62" width="92" height="42" rx="6" fill="#FAEEDA" stroke="#C58A2E" stroke-width="0.5"/>
        <text x="588" y="78" text-anchor="middle" font-size="11" fill="#633806">实时经营需求</text>
        <text x="588" y="94" text-anchor="middle" font-size="10" fill="#854F0B">计算传参 · G3 在用</text>
        <line x1="130" y1="116" x2="130" y2="140" stroke="#b4b2a9" stroke-width="1" fill="none" marker-end="url(#nsArr)"/>
        <line x1="444" y1="116" x2="444" y2="140" stroke="#b4b2a9" stroke-width="1" fill="none" marker-end="url(#nsArr)"/>
        <rect x="40" y="144" width="600" height="46" rx="10" fill="#EAF3DE" stroke="#3B6D11" stroke-width="0.5"/>
        <text x="340" y="164" text-anchor="middle" font-size="13" font-weight="500" fill="#27500A">名额 = 人工填的数，或某个服务算出的建议值 · 二选一</text>
        <text x="340" y="181" text-anchor="middle" font-size="12" fill="#3B6D11">算法只登记不实现；供数统一到时段级，A 时段挂算法一、B 时段挂算法二是合法配置</text>
        <line x1="340" y1="190" x2="340" y2="210" stroke="#b4b2a9" stroke-width="1" fill="none" marker-end="url(#nsArr)"/>
        <rect x="40" y="214" width="176" height="44" rx="8" fill="#f4f4f0" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="128" y="233" text-anchor="middle" font-size="12" font-weight="500" fill="#444441">钳制上下限</text>
        <text x="128" y="249" text-anchor="middle" font-size="11" fill="#888780">算法也不许越界</text>
        <line x1="216" y1="236" x2="232" y2="236" stroke="#b4b2a9" stroke-width="1" fill="none" marker-end="url(#nsArr)"/>
        <rect x="236" y="214" width="176" height="44" rx="8" fill="#f4f4f0" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="324" y="233" text-anchor="middle" font-size="12" font-weight="500" fill="#444441">快照</text>
        <text x="324" y="249" text-anchor="middle" font-size="11" fill="#888780">开轮那一刻取一次</text>
        <line x1="412" y1="236" x2="428" y2="236" stroke="#b4b2a9" stroke-width="1" fill="none" marker-end="url(#nsArr)"/>
        <rect x="432" y="214" width="208" height="44" rx="8" fill="#f4f4f0" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="536" y="233" text-anchor="middle" font-size="12" font-weight="500" fill="#444441">本轮名额 N</text>
        <text x="536" y="249" text-anchor="middle" font-size="11" fill="#888780">整轮不再变</text>
        <text x="40" y="284" font-size="12" fill="#6a6a75">新增一个算法 = 登记一项服务，不改结构；每个服务要说清读什么数、怎么算，带版本号</text>
      </svg>

      <h4 class="h4sub">名额算两次：开轮时冻结一个数，缺口发生时按规则再算</h4>
      <svg viewBox="0 0 680 232" class="doc-svg" role="img" aria-label="名额算两次：开轮时算出名额 N 冻结快照；缺口发生时只有缺口规则要用的数，才再算一次">
        <title>名额算两次</title>
        <defs>
          <marker id="twArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#888780" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </marker>
        </defs>
        <text x="40" y="26" font-size="13" font-weight="600" fill="#0c447c">第一次 · 开轮时：算出名额就冻结</text>
        <rect x="40" y="38" width="170" height="56" rx="8" fill="#e1f5ee" stroke="#0f6e56" stroke-width="0.5"/>
        <text x="125" y="60" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#085041">名额来源</text>
        <text x="125" y="80" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#0f6e56">人工给定 · 算法服务</text>
        <line x1="212" y1="66" x2="230" y2="66" stroke="#888780" stroke-width="1" fill="none" marker-end="url(#twArr)"/>
        <rect x="236" y="38" width="180" height="56" rx="8" fill="#e1f5ee" stroke="#0f6e56" stroke-width="0.5"/>
        <text x="326" y="60" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#085041">算出这段要几个人</text>
        <text x="326" y="80" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#0f6e56">名额 N · 容量不是库存</text>
        <line x1="418" y1="66" x2="436" y2="66" stroke="#888780" stroke-width="1" fill="none" marker-end="url(#twArr)"/>
        <rect x="442" y="38" width="198" height="56" rx="8" fill="#eaf3de" stroke="#3b6d11" stroke-width="0.5"/>
        <text x="541" y="60" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#27500a">冻结快照</text>
        <text x="541" y="80" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#3b6d11">抢 · 申领 · 兜底都用这一个数</text>

        <text x="40" y="128" font-size="13" font-weight="600" fill="#633806">第二次 · 缺口发生时：缺口规则要用，才再算</text>
        <rect x="40" y="140" width="600" height="56" rx="8" fill="#faeeda" stroke="#854f0b" stroke-width="0.5"/>
        <text x="340" y="162" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="500" fill="#633806">「按当下预测」这条缺口规则，用算法服务再算一次「现在这段要几个人」</text>
        <text x="340" y="181" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#854f0b">减去实际在位 = 现在的缺口；其余三条缺口规则直接用冻结的 N，不用再算</text>
        <text x="40" y="222" font-size="12" fill="#6a6a75">两次算的都是同一段时间的容量；第二次只回答「缺几个」，不改第一次冻结的名额</text>
      </svg>
      <p class="arch-cap">名额算两次：开轮时冻结一个数管整轮；缺口发生时只有缺口规则要用的数，才再算一次。</p>
    </div>

    <div id="hs-scope-acquire" class="section">
      <div class="section-header">
        <h2>5.4 获取段要点：窗口内怎么拿</h2>
      </div>
      <ul class="pt-list">
        <li><strong>就三种拿法：</strong>直派（系统直接排）/ 抢（点了就成，成不了当场说原因）/ 申领审核（截止按综合分排，落选周五再抢）。</li>
        <li><strong>档位里的「谁」是三个条件组合：</strong>范围（默认本店；往外放写「附近 N 公里」，不用「同城」这种粗旷说法）+ 合作性质（全职 / 非全 / 不限）+ 岗位（不限 / 从岗位字典里选，不写死在某几个岗位）。像圈人的搜索条件一样组合，圈出来的才是这一档的候选人群；圈进来还要过资格和冲突检查才真能拿。</li>
        <li><strong>轮 = 在清单上开的一段窗口。</strong>每轮配：切到第几档、开放、截止。窗口逐行配，位占满即关；截止之后位再空，也只能安排人顶，人拿不了。</li>
        <li><strong>兜底 = 同一天排在最后开放的班次 + 直派到点执行。</strong>把收尾班次（现行叫通班）的窗口排在同一天其他班次之后：前面没排上班的人到这时还空着手，这个班次一开就把他们收进去；已经排到班的人时段重叠排不了，不会重复占位。直派分人的时刻 = 那一档窗口开放的时刻——发布即开的档两个时刻重合，晚开的档等窗口开了才分人。兜底班次就是普通班次，名额、人群、方式全按现有档位配置，不设单独的兜底机制；收尾班次也满员时仍会有人落空，由人事当场安排。</li>
        <li><strong>开放窗口 = 锚点 + 偏移，展示成具体日期时间。</strong>锚点选「发布时刻 / 发布后的某个星期几 / 开班日」，再配天数和时刻；界面上不摆抽象参数，配置完直接显示落成的日期时间（如「11-13 06:00 开（发布后的周五）」「11-15 20:00 开（开班前 1 天）」）。现行的三种窗口——发布即开、周五 06:00 开、开班前一天 20:00 开——都是这套参数的组合，不写死。</li>
        <li><strong>冲突跟着动作查：</strong>直派分人的时候、接单的时候、审核排的时候、找人顶的时候。查的是时段撞不撞、跨店间隔够不够。</li>
        <li><strong>工时上限：规则由排班提供，检查在获取侧。</strong>排班只记一个班从几点到几点；选定班次时段后由获取侧复核——非全查每天与每周工时上限（超限拿不到班次），全职不查、超出部分计为加班。业务口径：非全在一家门店一天 4 小时、一周 24 小时；全职正常上班 8 小时。</li>
      </ul>
      <svg viewBox="0 0 680 322" class="doc-svg" role="img" aria-label="一条有序清单，三档错峰开放，收尾班次挂最后，四个时刻查冲突">
        <title>获取段：一条清单 × 错峰窗口</title>
        <defs>
          <marker id="acArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#888780" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </marker>
        </defs>
        <text x="210" y="30" font-size="11" fill="#888780">周四 06:00 发布</text>
        <line x1="600" y1="40" x2="600" y2="150" stroke="#B4B2A9" stroke-width="1" stroke-dasharray="4 3"/>
        <text x="600" y="166" text-anchor="middle" font-size="11" fill="#888780">开班</text>

        <text x="40" y="64" font-size="12" font-weight="500" fill="#2C2C2A">① 本店全职 · 直派</text>
        <rect x="210" y="52" width="380" height="18" rx="4" fill="#E6F1FB" stroke="#85B7EB" stroke-width="0.5"/>
        <text x="400" y="65" text-anchor="middle" font-size="11" fill="#0C447C">到点直派，不用抢</text>

        <text x="40" y="104" font-size="12" font-weight="500" fill="#2C2C2A">② 本店非全 · 抢</text>
        <rect x="300" y="92" width="290" height="18" rx="4" fill="#EAF3DE" stroke="#97C459" stroke-width="0.5"/>
        <text x="445" y="105" text-anchor="middle" font-size="11" fill="#27500A">周五 06:00 开</text>

        <text x="40" y="144" font-size="12" font-weight="500" fill="#2C2C2A">③ 附近 5km · 推拿师 · 抢</text>
        <rect x="430" y="132" width="160" height="18" rx="4" fill="#EAF3DE" stroke="#97C459" stroke-width="0.5"/>
        <text x="510" y="145" text-anchor="middle" font-size="11" fill="#27500A">开班前一天开</text>

        <text x="40" y="196" font-size="12" fill="#6a6a75">错峰累计开放：先开的挑剩的，后开的接着挑；排在最后的收尾班次（通班）就是兜底；k 不动再加一轮，就是「落选周五再抢」</text>

        <rect x="40" y="212" width="600" height="56" rx="10" fill="#FAEEDA" stroke="#854F0B" stroke-width="0.5"/>
        <text x="340" y="236" text-anchor="middle" font-size="13" font-weight="500" fill="#633806">冲突跟着动作查</text>
        <text x="340" y="256" text-anchor="middle" font-size="12" fill="#854F0B">直派分人查 · 接单查 · 审核排查 · 找人顶查</text>
        <text x="40" y="296" font-size="12" fill="#6a6a75">查什么：时段撞不撞、跨店间隔够不够；工时上限规则由排班提供——非全日 / 周上限在获取侧复核，超限拿不到班次</text>
      </svg>
    </div>

    <div id="hs-scope-change" class="section">
      <div class="section-header">
        <h2>5.5 变化段要点：请假之后</h2>
      </div>

      <h4 class="h4sub">变化段三步：写事实 → 重算 → 缺口规则</h4>
      <svg viewBox="0 0 680 192" class="doc-svg" role="img" aria-label="变化段三步：写事实、按事实重算、按缺口规则决定补不补；缺口发生即发人事通知">
        <title>变化段三步</title>
        <defs>
          <marker id="csArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#888780" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </marker>
        </defs>
        <rect x="40" y="30" width="180" height="76" rx="10" fill="#faece7" stroke="#993c1d" stroke-width="0.5"/>
        <text x="130" y="52" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="500" fill="#712b13">① 写事实</text>
        <text x="130" y="76" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#993c1d">请假 · 顶班 · 换班 · 离职</text>
        <text x="130" y="92" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#993c1d">只声明区间与发起方</text>
        <line x1="222" y1="68" x2="240" y2="68" stroke="#888780" stroke-width="1" fill="none" marker-end="url(#csArr)"/>
        <rect x="246" y="30" width="180" height="76" rx="10" fill="#faeeda" stroke="#854f0b" stroke-width="0.5"/>
        <text x="336" y="52" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="500" fill="#633806">② 重算</text>
        <text x="336" y="76" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#854f0b">事实落进结果，留一条记录</text>
        <text x="336" y="92" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#854f0b">被拿掉的那段少了人</text>
        <line x1="428" y1="68" x2="446" y2="68" stroke="#888780" stroke-width="1" fill="none" marker-end="url(#csArr)"/>
        <rect x="452" y="30" width="188" height="76" rx="10" fill="#faeeda" stroke="#854f0b" stroke-width="0.5"/>
        <text x="546" y="52" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="500" fill="#633806">③ 缺口规则</text>
        <text x="546" y="76" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#854f0b">要不要补，缺口规则已答（G0–G3）</text>
        <text x="546" y="92" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#854f0b">要补就摆出缺口，人事定人</text>
        <text x="340" y="140" text-anchor="middle" font-size="12" fill="#6a6a75">关闸前缺席属获取段（不在候选、申请作废）· 关闸后才进这三步</text>
        <line x1="40" y1="154" x2="640" y2="154" stroke="#d9d5d0" stroke-width="0.5" stroke-dasharray="4 3"/>
        <text x="340" y="176" text-anchor="middle" font-size="12" font-weight="500" fill="#712b13">缺口发生就是异常：设了「不补充」的、要补还没补上的，都给对应的人事经理发一条缺口通知</text>
      </svg>
      <p class="arch-cap">变化段永远走这三步：事实只声明区间，重算后是缺口规则在答补不补；两种异常都发人事经理缺口通知。</p>

      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 150px;">事实</th>
            <th style="width: 120px;">谁发起</th>
            <th>结果</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>请假</strong></td><td>员工</td><td>被拿掉的那段少了人，按班次声明的缺口规则处理；要补由人事定人</td></tr>
          <tr><td><strong>顶班</strong></td><td>人事</td><td>名额限定到这一个人，别人进不来</td></tr>
          <tr><td><strong>换班</strong></td><td>员工双方</td><td>两条互相指向的事实，同时生效、同时撤销</td></tr>
          <tr><td><strong>离职</strong>（含长期假 / 调岗这一类资格退出）</td><td>离职流程模块写入</td><td>不找人，这个人直接从结果里消失；排班不提供登记入口，只承接结果。员工可见可选的班次，兜底选人时只挑状态在线、可排班的人</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>三条关键说明：</strong>① 结果跟着重算，每次变化留一条记录（能回答「那天当时排的是谁」），班次本身不做状态变更；
        ② 顶别人已经到手的班，要他点头；受益方向（顶班的、被补的）通知即可；
        ③ 被拿掉的那段少了人，排班不自动找人：缺口规则判完要补时，系统把缺口摆出来（结果层缺口清单），人事在这里定人；人事直接安排的，是再写一条顶班事实、又一次重算。
      </div>

      <div class="note">
        <strong>现行「按缺口类型自动处理」的动作不带入 v5：</strong>班次变形、人群补位、重开自选窗口、转临时时段这四类动作，
        v5 不再按缺口类型自动触发——要不要补由缺口规则答（见下），要补就摆出缺口由人事定人；特殊情况的加位走临时时段（定义段能力）。
        事实的写入需要业务事件系统同步改造：一条事实只声明区间与发起方，排班按事实重算、留痕、通知，不自己起动作。
      </div>

      <div class="note">
        <strong>缺口规则只管一件事：排班确定后，因事件缺了人。</strong>获取段没排满（名额 3 个只有 2 个人拿）不算缺口，结果层手动补人即可。
        缺口发生时按班次上声明的规则处理，一共四条：不补充（缺人也不补，留给门店现场安排）/ 补齐名额 / 剩余不足 2.5 小时不补（2.5 小时 = 30 分钟通勤 + 2 小时补位班次时长，被拿走的段留不出这个长度就不叫人）/ 按当下预测再算（引用算法服务里登记的「实时经营需求」；这条算法是计算传参——岗位、合作形式、时段、实时数据由调用传入，各店各岗分开算）。
        请假 / 报备拿走的一段未超过 30 分钟的，不触发缺口判定——只记占用事实，不摆缺口、不寻人。
        「不补充」是显式的选项，不是没有配置。缺口发生就是异常：无论规则答的是补还是不补，系统都给对应的人事经理发一条缺口通知——
        设了不补充的让人事知情（缺的人留门店现场安排），要补还没补上的等人事来定（人事写顶班事实后，待处理通知自动销掉）。
      </div>

      <h4 class="h4sub">一条班次被请假切开：只有被拿走的段是缺口</h4>
      <svg viewBox="0 0 680 262" class="doc-svg" role="img" aria-label="一条 4 小时班次被请假切开的三种情况：整班请、只请 1 小时、上 1 小时后请 1 小时">
        <title>结果时间切分：被事件拿走的段才是缺口</title>
        <defs>
          <pattern id="gtHatch" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="#fdf3e6"/>
            <line x1="0" y1="0" x2="0" y2="6" stroke="#ef9f27" stroke-width="1.5"/>
          </pattern>
        </defs>
        <text x="200" y="24" text-anchor="middle" font-size="11" fill="#888780">12:00</text>
        <text x="300" y="24" text-anchor="middle" font-size="11" fill="#888780">13:00</text>
        <text x="400" y="24" text-anchor="middle" font-size="11" fill="#888780">14:00</text>
        <text x="500" y="24" text-anchor="middle" font-size="11" fill="#888780">15:00</text>
        <text x="600" y="24" text-anchor="middle" font-size="11" fill="#888780">16:00</text>
        <line x1="200" y1="30" x2="200" y2="188" stroke="#e8e4e1" stroke-width="0.5"/>
        <line x1="300" y1="30" x2="300" y2="188" stroke="#e8e4e1" stroke-width="0.5"/>
        <line x1="400" y1="30" x2="400" y2="188" stroke="#e8e4e1" stroke-width="0.5"/>
        <line x1="500" y1="30" x2="500" y2="188" stroke="#e8e4e1" stroke-width="0.5"/>
        <line x1="600" y1="30" x2="600" y2="188" stroke="#e8e4e1" stroke-width="0.5"/>

        <text x="40" y="52" font-size="12" font-weight="500" fill="#2c2c2a">切法一</text>
        <text x="40" y="68" font-size="11" fill="#888780">整班请</text>
        <rect x="200" y="44" width="400" height="34" rx="5" fill="url(#gtHatch)" stroke="#c58a2e" stroke-width="0.8"/>
        <text x="400" y="61" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#633806">4 小时全被事件拿走 · 整段缺口，按班次声明的缺口规则处理</text>

        <text x="40" y="102" font-size="12" font-weight="500" fill="#2c2c2a">切法二</text>
        <text x="40" y="118" font-size="11" fill="#888780">只请 1 小时</text>
        <rect x="200" y="94" width="100" height="34" rx="5" fill="#f2f6fb" stroke="#9dbede" stroke-width="0.8"/>
        <text x="250" y="111" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#0c447c">归原人</text>
        <rect x="300" y="94" width="100" height="34" rx="5" fill="url(#gtHatch)" stroke="#c58a2e" stroke-width="0.8"/>
        <text x="350" y="111" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#633806">缺口</text>
        <rect x="400" y="94" width="200" height="34" rx="5" fill="#f2f6fb" stroke="#9dbede" stroke-width="0.8"/>
        <text x="500" y="111" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#0c447c">没被事件碰到 · 归原人</text>

        <text x="40" y="152" font-size="12" font-weight="500" fill="#2c2c2a">切法三</text>
        <text x="40" y="168" font-size="11" fill="#888780">上 1 小时后请 1 小时</text>
        <rect x="200" y="144" width="100" height="34" rx="5" fill="#eaf7f0" stroke="#9fd0bd" stroke-width="0.8"/>
        <text x="250" y="161" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#04342c">已上 · 履约</text>
        <rect x="300" y="144" width="100" height="34" rx="5" fill="url(#gtHatch)" stroke="#c58a2e" stroke-width="0.8"/>
        <text x="350" y="161" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#633806">缺口</text>
        <rect x="400" y="144" width="200" height="34" rx="5" fill="#f2f6fb" stroke="#9dbede" stroke-width="0.8"/>
        <text x="500" y="161" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#0c447c">剩 2 小时 · 仍归原人</text>

        <text x="40" y="214" font-size="12" fill="#6a6a75">作业面 = 被事件拿走的那段；没被事件碰到的班次时间，仍归原来的人履约</text>
        <text x="40" y="236" font-size="12" fill="#6a6a75">被拿走的段少人 → 要不要补、怎么补，缺口规则已答（G0–G3），排班不自动找人</text>
      </svg>
      <p class="arch-cap">三种切法共用同一条界线：事件只拿走声明的那一段，没被碰到的班次时间还是原来的人的；拿走的一段未超 30 分钟只记占用、不触发缺口判定。</p>

      <h4 class="h4sub">一个人的时间线：班次条、事实条、补位条各自是独立区间</h4>
      <svg class="v5-tl" viewBox="0 0 680 386" role="img" aria-label="A 的时间线：撤销休假没有改动任何一条班次">
        <defs>
          <pattern id="tfHatch" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" class="tf-h-bg" />
            <line x1="0" y1="0" x2="0" y2="6" class="tf-h-ln" />
          </pattern>
        </defs>
        <text class="tf-title" x="40" y="22">① 覆盖中 · 11-15 之前的解</text>
        <text class="tf-day" x="206" y="42">11-16 周一</text>
        <text class="tf-day" x="378" y="42">11-17 周二</text>
        <text class="tf-day" x="550" y="42">11-18 周三</text>
        <line class="tf-grid" x1="120" y1="50" x2="120" y2="350" />
        <line class="tf-grid" x1="292" y1="50" x2="292" y2="350" />
        <line class="tf-grid" x1="464" y1="50" x2="464" y2="350" />
        <line class="tf-grid" x1="636" y1="50" x2="636" y2="350" />
        <text class="tf-row" x="112" y="75">A · 班次</text>
        <rect class="tf-shift" x="122" y="58" width="111" height="34" rx="5" />
        <text class="tf-t tf-shift-t" x="178" y="75">早班 10–18</text>
        <rect class="tf-shift" x="351" y="58" width="111" height="34" rx="5" />
        <text class="tf-t tf-shift-t" x="406" y="75">晚班 14–22</text>
        <rect class="tf-shift" x="466" y="58" width="111" height="34" rx="5" />
        <text class="tf-t tf-shift-t" x="522" y="75">早班 10–18</text>
        <text class="tf-row tf-fact-row" x="112" y="117">事实 · 休假</text>
        <rect class="tf-fact" x="122" y="100" width="168" height="34" rx="5" />
        <text class="tf-t tf-fact-t" x="206" y="117">休假，占据 11-16 全天</text>
        <text class="tf-row tf-mk-row" x="112" y="159">D · 补位</text>
        <rect class="tf-makeup" x="122" y="142" width="111" height="34" rx="5" />
        <text class="tf-t tf-mk-t" x="178" y="159">补进早班</text>
        <line class="tf-split" x1="40" y1="196" x2="640" y2="196" />
        <text class="tf-title" x="40" y="216">② 撤销后 · 11-15 09:12 A 撤回休假</text>
        <text class="tf-row" x="112" y="249">A · 班次</text>
        <rect class="tf-shift" x="122" y="232" width="111" height="34" rx="5" />
        <text class="tf-t tf-shift-t" x="178" y="249">早班 10–18</text>
        <rect class="tf-shift" x="351" y="232" width="111" height="34" rx="5" />
        <text class="tf-t tf-shift-t" x="406" y="249">晚班 14–22</text>
        <rect class="tf-shift" x="466" y="232" width="111" height="34" rx="5" />
        <text class="tf-t tf-shift-t" x="522" y="249">早班 10–18</text>
        <text class="tf-row" x="112" y="291">事实 · 已撤销</text>
        <rect class="tf-dead" x="122" y="274" width="168" height="34" rx="5" />
        <text class="tf-t tf-dead-t" x="206" y="291">区间截短，记录不删</text>
        <text class="tf-row" x="112" y="333">D · 已让位</text>
        <rect class="tf-dead" x="122" y="316" width="111" height="34" rx="5" />
        <text class="tf-t tf-dead-t" x="178" y="333">已让位</text>
        <text class="tf-cap" x="40" y="366">两段的 A 泳道完全一致 —— 撤销休假没有改动任何一条班次</text>
      </svg>
      <p class="arch-cap">
        班次条与事实条画在同一根轴上但互不改动：事实只声明区间，补位是另一个人的新区间；撤销 = 截短事实区间，结果自己变回来。
      </p>

      <h4 class="h4sub">设计参考 · 统一时间管理体系</h4>
      <p class="doc-p">
        时间维度的分层思路参考下方「统一时间管理体系」：<strong>排班只 owning 时间轴 + 排班层</strong>（哪天哪班、几个名额、谁占着）；
        用工基数层（哪天默认该上班）归假勤的出勤方案；考勤组与打卡归考勤；订单、培训、会议等由各自业务系统写。
        变化段的五类事实（请假 / 顶班 / 换班 / 离职 / 取消挂店）写进业务事件层，排班按事实重算、留解版本——<strong>事实只声明区间，不改班次本身</strong>。
        时间线真正被消费是在几个动作上：员工领班、申领排序、找人顶班，三处都要拿时段到时间轴上做重叠校验（见 6.2.3、6.4.4）。
      </p>
      <DocFigure
        :src="timeSystemImg"
        title="统一时间管理体系 · 分层设计参考"
        note="时间轴唯一；用工基数层定「哪天该上班」，排班层定「谁上哪个班」，其上各层由对应系统各自 owning"
      />
    </div>

    <div id="hs-scope-cover" class="section">
      <div class="section-header">
        <h2>5.6 拿现状对卷</h2>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 120px;">现行</th>
            <th>定义段怎么落</th>
            <th>获取段怎么落</th>
            <th>变化段怎么落</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>全职客户经理</strong></td>
            <td>人数组合算名额，通班是一个班次</td>
            <td>单轮直派 + 两档抢</td>
            <td>缺口按班次声明的规则处理，要补摆出缺口、人事定人；补不到的走通班兜底</td>
          </tr>
          <tr>
            <td><strong>全职推拿师</strong></td>
            <td>业务量算名额</td>
            <td>单轮申领审核，落选再加一轮（k 不动）</td>
            <td>落选 → 周五再抢</td>
          </tr>
          <tr>
            <td><strong>非全客户经理</strong></td>
            <td>时段固定名额</td>
            <td>三轮逐档开放接单</td>
            <td>没人接 → 转临时时段补容量（获取段没排满不算缺口）</td>
          </tr>
          <tr>
            <td><strong>非全推拿师</strong></td>
            <td>签约 ÷ 2</td>
            <td>单轮抢，必选早晚</td>
            <td>必选段补不到人怎么处理，待定</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>结论：</strong>四套全部落进三段，没有结构性缺口。
        待业务拍板的只剩三件，都挂<router-link to="/docs/hr-schedule/appendix">附录</router-link>：
        抢的窗口最短多久；非全推拿必选段补不到人怎么处理；顶别人已到手的班要提前多久说。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'
import DocFigure from '../../../docs/components/DocFigure.vue'
import timeSystemImg from '../../../docs/assets/unified-time-system.png'

const tocItems = [
  { id: 'hs-scope', label: '五、需求范围' },
  { id: 'hs-scope-now', label: '5.1 现状：四张考卷' },
  { id: 'hs-scope-stages', label: '5.2 通用设计四阶段' },
  { id: 'hs-scope-define', label: '5.3 定义段要点' },
  { id: 'hs-scope-acquire', label: '5.4 获取段要点' },
  { id: 'hs-scope-change', label: '5.5 变化段要点' },
  { id: 'hs-scope-cover', label: '5.6 拿现状对卷' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事中心', to: '/docs/hr-schedule' },
  { label: '五、需求范围' }
]

/* 5.2 对比图：上为现行四行真实取值（一格两行小字），下为通用设计四层横切 */
const nowRows = [
  {
    who: ['全职', '客户经理'],
    cells: [
      ['周四 06:00', '铺下周 7 天'],
      ['早/晚/中/全天', '名额=人数组合'],
      ['① 轮转直派 ② 储备', '③ 非全自抢 ④ 同城'],
      ['生成通班', '']
    ]
  },
  {
    who: ['全职', '推拿师'],
    cells: [
      ['周四 06:00', '铺下周 7 天'],
      ['早 / 晚班', '名额=天均分钟'],
      ['① 申领+综合分截断', '② 同城 · 1 天前'],
      ['落选周五再抢', '→ 生成通班']
    ]
  },
  {
    who: ['非全', '客户经理'],
    cells: [
      ['周四 06:00', '可手动补'],
      ['周期 + 临时时段', '名额固定 0–6'],
      ['三档累计开放', '非全→非推→全推'],
      ['转临时时段', '或留待派发']
    ]
  },
  {
    who: ['非全', '推拿师'],
    cells: [
      ['手动发布', ''],
      ['必选早/晚+常规', '名额=签约 ÷2'],
      ['仅本店非全', '先到先得'],
      ['待定', '', true]
    ]
  }
]
const newLayers = [
  { t: '容器', d: '门店 / 办公地点 / 城市 / 人 —— 时段属于谁，打卡考勤挂在这' },
  { t: '时段', d: '班次 · 星期 · 名额 · 生成节奏，只说时间形态，不说谁能领' },
  { t: '获取规则', d: '谁、什么时候、按什么、拿几个、剩了怎么办' },
  { t: '排班结果', d: '唯一记录口，带「怎么排上的」' }
]
const newPeople = ['全职推拿师', '非全推拿师', '全职客户经理', '非全客户经理']
</script>

<style scoped src="./doc-base.css"></style>

<style scoped>
.pt-list { margin: 10px 0 14px; padding-left: 20px; }
.pt-list li { font-size: 13px; line-height: 1.7; color: #2c2c2a; margin-bottom: 8px; }
.pt-list li strong { font-weight: 600; }
.doc-svg { width: 100%; height: auto; display: block; margin: 4px 0 8px; }

/* 5.2 对比图（左右两栏） */
.arch-diff { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 12px 0 6px; }
.arch-col { border: 1px solid #e3e6ea; border-radius: 10px; padding: 12px; background: #fbfbfa; }
.arch-head { font-size: 13px; font-weight: 600; margin-bottom: 8px; padding: 7px 10px; border-radius: 6px; }
.arch-head.before { background: #fbeceb; color: #791f1f; }
.arch-head.after { background: #eaf3de; color: #27500a; }
.arch-svg { width: 100%; height: auto; display: block; }
.arch-cap { font-size: 12px; color: #6a6a75; margin: 8px 0 0; line-height: 1.6; }
.ac-t { font-size: 11px; fill: #444441; }
.ac-t-strong { font-size: 12px; font-weight: 600; fill: #2c2c2a; }
.ac-t-note { font-size: 11px; fill: #888780; }
.ac-t-warn { font-size: 11px; fill: #a32d2d; }
.ac-cell { fill: #f4f4f0; stroke: #c8cbcf; stroke-width: 0.5; }
.ac-cell-warn { fill: #fcebeb; stroke: #e24b4a; stroke-width: 0.5; }
.ac-box-new { fill: #eaf3de; stroke: #97c459; stroke-width: 0.5; }
.ac-num { fill: #3b6d11; }
.ac-t-num { font-size: 11px; font-weight: 600; fill: #ffffff; }
.ac-arrow { fill: #b4b2a9; }
.ac-chip { fill: #eef3fb; stroke: #9dbede; stroke-width: 0.5; }

/* 5.5 时间线：班次条 / 事实条 / 补位条画在同一根轴上 */
.v5-tl { width: 100%; height: auto; display: block; margin: 12px 0 0; }
.tf-title { font-size: 13px; font-weight: 600; fill: #2c2c2a; }
.tf-day { font-size: 12px; fill: #6a6a75; }
.tf-grid { stroke: #e8e4e1; stroke-width: 0.5; }
.tf-row { font-size: 12px; fill: #185fa5; text-anchor: end; }
.tf-fact-row { fill: #854f0b; }
.tf-mk-row { fill: #0f6e56; }
.tf-t { font-size: 11px; text-anchor: middle; dominant-baseline: central; }
.tf-shift { fill: #f2f6fb; stroke: #9dbede; }
.tf-shift-t { fill: #0c447c; }
.tf-fact { fill: url(#tfHatch); stroke: #c58a2e; }
.tf-h-bg { fill: #fdf3e6; }
.tf-h-ln { stroke: #ef9f27; stroke-width: 1.5; }
.tf-fact-t { fill: #633806; }
.tf-makeup { fill: #eaf7f0; stroke: #9fd0bd; }
.tf-mk-t { fill: #04342c; }
.tf-dead { fill: #f1efe8; stroke: #888780; stroke-dasharray: 4 3; }
.tf-dead-t { fill: #5f5e5a; }
.tf-split { stroke: #d9d5d0; stroke-width: 0.5; stroke-dasharray: 4 3; }
.tf-cap { font-size: 12px; fill: #6a6a75; }
</style>
