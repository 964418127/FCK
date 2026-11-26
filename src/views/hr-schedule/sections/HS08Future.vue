<template>
  <DocShell
    :toc-items="tocItems"
    title="八、未来扩展：多岗位接入的关键升级"
    subtitle="以上线岗位为轴：通用化设计已定，每上一批岗位、迭代支持对应内容——非全客户经理（研发中）→ 全职客户经理 → 全职推拿师 → 非全推拿师；另记跨批次通用迭代：发布与周期变更"
    version="v3.0 基线 + v5 重构"
    date="2026-11-26"
    :breadcrumbs="breadcrumbs"
  >
    <div id="hs-fu-why" class="section">
      <div class="section-header">
        <h2>8.1 这一章怎么读</h2>
      </div>
      <p class="doc-p">
        本章<strong>不是需求</strong>。功能都是<strong>通用化设计</strong>——配置侧不分岗位，谁进来都能配；
        岗位按批次上线，每上一批，就推导出这批要<strong>迭代支持</strong>什么。细化完成前不进功能章节：
      </p>
      <svg viewBox="0 0 680 100" class="doc-svg" role="img" aria-label="本章的推导方式：通用设计一套，岗位分批上线，上线时迭代支持，细化后挪进功能章节">
        <title>上线推导链</title>
        <defs>
          <marker id="u8a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#888780" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </marker>
        </defs>
        <rect x="40" y="24" width="140" height="48" rx="10" fill="#eaf3de" stroke="#3b6d11" stroke-width="0.5"/>
        <text x="110" y="44" text-anchor="middle" font-size="12" font-weight="500" fill="#27500a">通用设计 · 一套</text>
        <text x="110" y="62" text-anchor="middle" font-size="10" fill="#3b6d11">配置侧不分岗位</text>
        <line x1="182" y1="48" x2="198" y2="48" stroke="#888780" stroke-width="1" fill="none" marker-end="url(#u8a)"/>
        <rect x="200" y="24" width="140" height="48" rx="10" fill="#e6f1fb" stroke="#85b7eb" stroke-width="0.5"/>
        <text x="270" y="44" text-anchor="middle" font-size="12" font-weight="500" fill="#0c447c">岗位分批上线</text>
        <text x="270" y="62" text-anchor="middle" font-size="10" fill="#185fa5">先非全客经（研发中）</text>
        <line x1="342" y1="48" x2="358" y2="48" stroke="#888780" stroke-width="1" fill="none" marker-end="url(#u8a)"/>
        <rect x="360" y="24" width="140" height="48" rx="10" fill="#faeeda" stroke="#854f0b" stroke-width="0.5"/>
        <text x="430" y="44" text-anchor="middle" font-size="12" font-weight="500" fill="#633806">上线时迭代支持</text>
        <text x="430" y="62" text-anchor="middle" font-size="10" fill="#854f0b">按框架推导这批要重构的</text>
        <line x1="502" y1="48" x2="518" y2="48" stroke="#888780" stroke-width="1" fill="none" marker-end="url(#u8a)"/>
        <rect x="520" y="24" width="140" height="48" rx="10" fill="#f4f4f0" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="590" y="44" text-anchor="middle" font-size="12" font-weight="500" fill="#444441">细化后挪功能章节</text>
        <text x="590" y="62" text-anchor="middle" font-size="10" fill="#888780">6.2 / 6.4 · 原型同步</text>
        <text x="40" y="92" font-size="12" fill="#6a6a75">每节先说上线什么岗位，再说对应迭代支持什么；上线是推导的起点，不是本期的开发范围</text>
      </svg>
    </div>

    <div id="hs-fu-frame" class="section">
      <div class="section-header">
        <h2>8.2 推导框架：缺口两段式 + 按人群登记</h2>
      </div>
      <p class="doc-p">
        推导用的框架只有一张图：缺口收敛成<strong>两段式</strong>，岗位差异全部落在「按人群登记」上——
        每批上线就是两个填空（判定段填 X 阈值、执行段选补位策略），不动架构：
      </p>
      <svg viewBox="0 0 680 408" class="doc-svg" role="img"
           aria-label="缺口判定两段式：事件进来先判定（30分钟门槛、缺口归属、人群规则），再执行（寻人顶段或关联调班），底部按人群登记阈值与补位策略">
        <title>缺口两段式与按人群登记</title>
        <defs>
          <marker id="u8b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#888780" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </marker>
        </defs>
        <rect x="200" y="8" width="280" height="34" rx="8" fill="#faece7" stroke="#993c1d" stroke-width="0.5"/>
        <text x="340" y="29" text-anchor="middle" font-size="13" font-weight="500" fill="#712b13">事件进来：请假 · 离职 · 取消挂店</text>
        <line x1="340" y1="42" x2="340" y2="56" stroke="#888780" stroke-width="1" fill="none" marker-end="url(#u8b)"/>

        <rect x="40" y="60" width="600" height="100" rx="10" fill="#faeeda" stroke="#854f0b" stroke-width="0.5"/>
        <text x="56" y="82" font-size="13" font-weight="500" fill="#633806">第一段 · 判定（求值）</text>
        <text x="624" y="82" text-anchor="end" font-size="11" fill="#854f0b">答：缺不缺 · 缺多少 · 补不补</text>
        <rect x="56" y="92" width="176" height="52" rx="8" fill="#f4f4f0" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="144" y="112" text-anchor="middle" font-size="12" font-weight="500" fill="#444441">① 30 分钟门槛</text>
        <text x="144" y="130" text-anchor="middle" font-size="10" fill="#888780">全局底线 · 未超不进判定</text>
        <line x1="234" y1="118" x2="248" y2="118" stroke="#888780" stroke-width="1" fill="none" marker-end="url(#u8b)"/>
        <rect x="252" y="92" width="176" height="52" rx="8" fill="#f4f4f0" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="340" y="112" text-anchor="middle" font-size="12" font-weight="500" fill="#444441">② 缺口归属</text>
        <text x="340" y="130" text-anchor="middle" font-size="10" fill="#888780">清单第 1 优先级档位 · 岗位×合作形式</text>
        <line x1="430" y1="118" x2="444" y2="118" stroke="#888780" stroke-width="1" fill="none" marker-end="url(#u8b)"/>
        <rect x="448" y="92" width="176" height="52" rx="8" fill="#f4f4f0" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="536" y="112" text-anchor="middle" font-size="12" font-weight="500" fill="#444441">③ 人群规则判定</text>
        <text x="536" y="130" text-anchor="middle" font-size="10" fill="#888780">G0–G3 · 剩余 &lt; X 小时不补</text>
        <line x1="340" y1="160" x2="340" y2="174" stroke="#888780" stroke-width="1" fill="none" marker-end="url(#u8b)"/>
        <text x="352" y="172" font-size="11" fill="#6a6a75">判定结论：要补 n 人（不补 / 无缺口到此结束）</text>

        <rect x="40" y="178" width="600" height="140" rx="10" fill="#e6f1fb" stroke="#185fa5" stroke-width="0.5"/>
        <text x="56" y="200" font-size="13" font-weight="500" fill="#0c447c">第二段 · 执行（补位）</text>
        <text x="624" y="200" text-anchor="end" font-size="11" fill="#185fa5">答：怎么补 · 按人群登记的补位策略</text>
        <rect x="56" y="210" width="280" height="52" rx="8" fill="#e1f5ee" stroke="#0f6e56" stroke-width="0.5"/>
        <text x="196" y="230" text-anchor="middle" font-size="12" font-weight="500" fill="#085041">① 寻人顶段（通用）</text>
        <text x="196" y="248" text-anchor="middle" font-size="10" fill="#0f6e56">清单档位顺位找人 · 有效班次时段复核 · 只顶被拿走那段</text>
        <rect x="344" y="210" width="280" height="52" rx="8" fill="#faeeda" stroke="#c58a2e" stroke-width="0.5"/>
        <text x="484" y="230" text-anchor="middle" font-size="12" font-weight="500" fill="#633806">② 关联调班（全职客户经理）</text>
        <text x="484" y="248" text-anchor="middle" font-size="10" fill="#854f0b">剩下的人覆盖原班次 · 重新派发班形（见 8.4）</text>
        <rect x="56" y="272" width="568" height="26" rx="6" fill="#faece7" stroke="#993c1d" stroke-width="0.5"/>
        <text x="340" y="289" text-anchor="middle" font-size="11" fill="#712b13">① ② 都执行不了 → 摆缺口，人事定人（兜底 · 不分岗位）</text>

        <text x="40" y="344" font-size="12" fill="#6a6a75">按人群登记：每人群断两条——判定段 X 阈值 + 执行段补位策略；未登记的人群回落通用默认</text>
        <rect x="40" y="354" width="150" height="48" rx="8" fill="#f4f4f0" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="115" y="374" text-anchor="middle" font-size="11" font-weight="500" fill="#444441">非全客户经理</text>
        <text x="115" y="391" text-anchor="middle" font-size="10" fill="#888780">研发中 · X=2.5 · 寻人顶段</text>
        <rect x="200" y="354" width="150" height="48" rx="8" fill="#faeeda" stroke="#c58a2e" stroke-width="0.5"/>
        <text x="275" y="374" text-anchor="middle" font-size="11" font-weight="500" fill="#633806">全职客户经理 ★</text>
        <text x="275" y="391" text-anchor="middle" font-size="10" fill="#854f0b">X=2.5 · 关联调班</text>
        <rect x="360" y="354" width="150" height="48" rx="8" fill="#faeeda" stroke="#c58a2e" stroke-width="0.5"/>
        <text x="435" y="374" text-anchor="middle" font-size="11" font-weight="500" fill="#633806">全职推拿师 ★</text>
        <text x="435" y="391" text-anchor="middle" font-size="10" fill="#854f0b">X=4 · 寻人顶段</text>
        <rect x="520" y="354" width="150" height="48" rx="8" fill="#f4f4f0" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="595" y="374" text-anchor="middle" font-size="11" font-weight="500" fill="#444441">非全推拿师</text>
        <text x="595" y="391" text-anchor="middle" font-size="10" fill="#888780">X=2.5 · 寻人顶段</text>
      </svg>
      <p class="arch-cap">★ = 该人群上线时的登记点与通用默认不同。30 分钟门槛是全局底线，不做成人群参数；「剩余 = 被事件拿走的那段时长」沿用。</p>
      <div class="note">
        <strong>多档位时段：</strong>缺口归属按清单第 1 优先级档位判，补人寻人仍按全清单顺位——归属归第 1 档，补人不限于第 1 档；整班缺口（离职 / 取消挂店）走同一套归属。
      </div>
    </div>

    <div id="hs-fu-batch1" class="section">
      <div class="section-header">
        <h2>8.3 上线非全客户经理（研发阶段）：通用设计直接承载</h2>
      </div>
      <p class="doc-p">
        <strong>上线岗位：</strong>非全客户经理（研发阶段 · 第一批）。这一批<strong>没有要重构的内容</strong>——
        判定、执行、报备全走通用默认，上线动作本身就是通用设计的第一次真岗验证。
      </p>
      <svg viewBox="0 0 680 158" class="doc-svg" role="img" aria-label="第一批上线：非全客户经理由通用设计直接承载，判定执行走默认，事件报备入口随批生效">
        <title>第一批：通用设计直接承载</title>
        <defs>
          <marker id="u8c" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#888780" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </marker>
        </defs>
        <rect x="40" y="24" width="180" height="76" rx="10" fill="#e6f1fb" stroke="#185fa5" stroke-width="0.5"/>
        <text x="130" y="48" text-anchor="middle" font-size="13" font-weight="500" fill="#0c447c">上线岗位</text>
        <text x="130" y="70" text-anchor="middle" font-size="12" font-weight="500" fill="#0c447c">非全客户经理</text>
        <text x="130" y="88" text-anchor="middle" font-size="10" fill="#185fa5">研发阶段 · 第一批</text>
        <line x1="222" y1="62" x2="240" y2="62" stroke="#888780" stroke-width="1" fill="none" marker-end="url(#u8c)"/>
        <rect x="246" y="24" width="122" height="76" rx="10" fill="#e1f5ee" stroke="#0f6e56" stroke-width="0.5"/>
        <text x="307" y="52" text-anchor="middle" font-size="12" font-weight="500" fill="#085041">判定走默认</text>
        <text x="307" y="72" text-anchor="middle" font-size="10" fill="#0f6e56">门槛 30 分钟</text>
        <text x="307" y="88" text-anchor="middle" font-size="10" fill="#0f6e56">X=2.5 · G0–G3</text>
        <rect x="376" y="24" width="122" height="76" rx="10" fill="#e1f5ee" stroke="#0f6e56" stroke-width="0.5"/>
        <text x="437" y="52" text-anchor="middle" font-size="12" font-weight="500" fill="#085041">执行走默认</text>
        <text x="437" y="72" text-anchor="middle" font-size="10" fill="#0f6e56">寻人顶段</text>
        <text x="437" y="88" text-anchor="middle" font-size="10" fill="#0f6e56">摆缺口兜底</text>
        <rect x="506" y="24" width="134" height="76" rx="10" fill="#f4f4f0" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="573" y="52" text-anchor="middle" font-size="12" font-weight="500" fill="#444441">事件报备</text>
        <text x="573" y="72" text-anchor="middle" font-size="10" fill="#888780">移动端入口</text>
        <text x="573" y="88" text-anchor="middle" font-size="10" fill="#888780">已落 6.5.1</text>
        <rect x="40" y="118" width="600" height="30" rx="8" fill="#eaf3de" stroke="#3b6d11" stroke-width="0.5"/>
        <text x="340" y="137" text-anchor="middle" font-size="11" fill="#27500a">迭代支持：无——通用设计第一次在真实岗位跑通，是后三批推导的基线</text>
      </svg>
    </div>

    <div id="hs-fu-batch2" class="section">
      <div class="section-header">
        <h2>8.4 上线全职客户经理：迭代支持「关联调班」</h2>
      </div>
      <p class="doc-p">
        <strong>上线岗位：</strong>全职客户经理。<strong>迭代支持（执行段）：</strong>补位策略登记第二个值「关联调班」——
        门店有 2 名及以上时，有人请假不找外人顶，剩下的人调班，班形随人数递进；判定段不动（仍走通用默认 X=2.5）。
      </p>
      <svg viewBox="0 0 680 200" class="doc-svg" role="img"
           aria-label="关联调班班形递进：3人早中晚 → 1人请假剩2人长早加长晚 → 再请假剩1人通班 → 没人可调退回通用补人">
        <title>关联调班：班形随人数递进</title>
        <defs>
          <marker id="u8d" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#888780" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </marker>
        </defs>
        <rect x="40" y="44" width="136" height="96" rx="10" fill="#e1f5ee" stroke="#0f6e56" stroke-width="0.5"/>
        <text x="108" y="66" text-anchor="middle" font-size="12" font-weight="500" fill="#085041">3 人在岗</text>
        <rect x="50" y="76" width="34" height="24" rx="6" fill="#ffffff" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="67" y="92" text-anchor="middle" font-size="11" fill="#444441">早</text>
        <rect x="89" y="76" width="34" height="24" rx="6" fill="#ffffff" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="106" y="92" text-anchor="middle" font-size="11" fill="#444441">中</text>
        <rect x="128" y="76" width="34" height="24" rx="6" fill="#ffffff" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="145" y="92" text-anchor="middle" font-size="11" fill="#444441">晚</text>
        <text x="108" y="124" text-anchor="middle" font-size="10" fill="#0f6e56">早 / 中 / 晚三个班</text>
        <text x="187" y="80" text-anchor="middle" font-size="11" fill="#6a6a75">1 人请假</text>
        <line x1="178" y1="92" x2="195" y2="92" stroke="#888780" stroke-width="1" fill="none" marker-end="url(#u8d)"/>
        <rect x="199" y="44" width="136" height="96" rx="10" fill="#e1f5ee" stroke="#0f6e56" stroke-width="0.5"/>
        <text x="267" y="66" text-anchor="middle" font-size="12" font-weight="500" fill="#085041">剩 2 人</text>
        <rect x="209" y="76" width="57" height="24" rx="6" fill="#ffffff" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="237" y="92" text-anchor="middle" font-size="11" fill="#444441">长早</text>
        <rect x="271" y="76" width="57" height="24" rx="6" fill="#ffffff" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="299" y="92" text-anchor="middle" font-size="11" fill="#444441">长晚</text>
        <text x="267" y="124" text-anchor="middle" font-size="10" fill="#0f6e56">原班次覆盖 · 重新派发</text>
        <text x="346" y="80" text-anchor="middle" font-size="11" fill="#6a6a75">再请假</text>
        <line x1="337" y1="92" x2="354" y2="92" stroke="#888780" stroke-width="1" fill="none" marker-end="url(#u8d)"/>
        <rect x="358" y="44" width="136" height="96" rx="10" fill="#e1f5ee" stroke="#0f6e56" stroke-width="0.5"/>
        <text x="426" y="66" text-anchor="middle" font-size="12" font-weight="500" fill="#085041">剩 1 人</text>
        <rect x="388" y="76" width="76" height="24" rx="6" fill="#ffffff" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="426" y="92" text-anchor="middle" font-size="11" fill="#444441">通班</text>
        <text x="426" y="124" text-anchor="middle" font-size="10" fill="#0f6e56">一人覆盖全天</text>
        <text x="505" y="80" text-anchor="middle" font-size="11" fill="#6a6a75">再请假</text>
        <line x1="496" y1="92" x2="513" y2="92" stroke="#888780" stroke-width="1" fill="none" marker-end="url(#u8d)"/>
        <rect x="517" y="44" width="136" height="96" rx="10" fill="#faece7" stroke="#993c1d" stroke-width="0.5"/>
        <text x="585" y="66" text-anchor="middle" font-size="12" font-weight="500" fill="#712b13">没人可调</text>
        <text x="585" y="90" text-anchor="middle" font-size="10" fill="#993c1d">退回通用补人路径</text>
        <text x="585" y="108" text-anchor="middle" font-size="10" fill="#993c1d">缺口规则判 →</text>
        <text x="585" y="124" text-anchor="middle" font-size="10" fill="#993c1d">寻人顶段 / 摆缺口</text>
        <text x="40" y="176" font-size="12" fill="#6a6a75">班次被覆盖的人「无需履约」原班次；班形拼法待业务给梯度（上线前细化）</text>
      </svg>
      <div class="note">
        <strong>机制定位：</strong>现行「班次变形」动作的定向回归（5.5 定过「按缺口类型自动处理的动作不带入」，客户经理是例外），与全职客户经理「轮转直派、余额生成通班」同源——把「余额生成通班」从轮间挪到轮内实时。<br>
        <strong>上线前待细化：</strong>① 长早 / 长晚 / 通班的时段拼法；② 通班超 8 小时的工时口径（联动 6.8）；③ 要不要剩余的人同意（牵 6.4.6 受损方向口径）；④ 非全客户经理确认不适用。
      </div>
    </div>

    <div id="hs-fu-batch3" class="section">
      <div class="section-header">
        <h2>8.5 上线全职推拿师：迭代支持「X=4」与「审核两条路线」</h2>
      </div>
      <p class="doc-p">
        <strong>上线岗位：</strong>全职推拿师。<strong>迭代支持两处：</strong>判定段阈值 X=4（与通用默认同族、只是参数值不同，执行段不变）；
        获取段的审核节奏两条待定路线（动 6.2，细化前不动正文）。
      </p>
      <svg viewBox="0 0 680 110" class="doc-svg" role="img" aria-label="阈值对比：通用默认 X=2.5 小时构成已定；全职推拿师 X=4 小时构成待细化">
        <title>判定段阈值对比</title>
        <text x="170" y="38" text-anchor="end" font-size="12" font-weight="500" fill="#444441">通用默认</text>
        <rect x="180" y="20" width="250" height="28" rx="6" fill="#f4f4f0" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="192" y="38" font-size="10" fill="#888780">X=2.5：30 分钟通勤 + 2 小时补位班次（构成已定）</text>
        <text x="170" y="78" text-anchor="end" font-size="12" font-weight="500" fill="#633806">全职推拿师</text>
        <rect x="180" y="60" width="400" height="28" rx="6" fill="#faeeda" stroke="#c58a2e" stroke-width="0.5"/>
        <text x="192" y="78" font-size="10" fill="#854f0b">X=4：剩余超 4 小时才补；构成待细化（如 30 分钟通勤 + 3.5 小时班）</text>
        <text x="590" y="78" font-size="10" fill="#854f0b">← 阈值更长</text>
      </svg>
      <h4 class="h4sub">获取段：审核节奏两条待定路线</h4>
      <svg viewBox="0 0 680 290" class="doc-svg" role="img"
           aria-label="审核节奏对比：现行获取窗口结束审一次；路线一窗口内分段各审一次没满继续；路线二按档位先让优秀的人看班申领">
        <title>审核节奏：现行与两条待定路线</title>
        <text x="40" y="64" font-size="12" font-weight="500" fill="#2c2c2a">现行 · 一轮一审</text>
        <rect x="210" y="48" width="430" height="26" rx="5" fill="#e6f1fb" stroke="#85b7eb" stroke-width="0.5"/>
        <text x="222" y="65" font-size="11" fill="#0c447c">获取窗口（一轮）</text>
        <circle cx="620" cy="61" r="13" fill="#faeeda" stroke="#c58a2e" stroke-width="0.5"/>
        <text x="620" y="65" text-anchor="middle" font-size="11" fill="#633806">审</text>
        <text x="210" y="92" font-size="11" fill="#6a6a75">窗口截止审一次 · 落选周五再抢 · 通班兜底</text>

        <text x="40" y="136" font-size="12" font-weight="500" fill="#2c2c2a">路线① · 多段审核</text>
        <rect x="210" y="120" width="136" height="26" rx="5" fill="#eaf3de" stroke="#97c459" stroke-width="0.5"/>
        <text x="278" y="137" text-anchor="middle" font-size="11" fill="#27500a">第一段</text>
        <rect x="352" y="120" width="136" height="26" rx="5" fill="#eaf3de" stroke="#97c459" stroke-width="0.5"/>
        <text x="420" y="137" text-anchor="middle" font-size="11" fill="#27500a">第二段</text>
        <rect x="494" y="120" width="136" height="26" rx="5" fill="#eaf3de" stroke="#97c459" stroke-width="0.5"/>
        <text x="562" y="137" text-anchor="middle" font-size="11" fill="#27500a">第三段</text>
        <circle cx="352" cy="133" r="11" fill="#faeeda" stroke="#c58a2e" stroke-width="0.5"/>
        <text x="352" y="137" text-anchor="middle" font-size="9" fill="#633806">审</text>
        <circle cx="494" cy="133" r="11" fill="#faeeda" stroke="#c58a2e" stroke-width="0.5"/>
        <text x="494" y="137" text-anchor="middle" font-size="9" fill="#633806">审</text>
        <circle cx="630" cy="133" r="11" fill="#faeeda" stroke="#c58a2e" stroke-width="0.5"/>
        <text x="630" y="137" text-anchor="middle" font-size="9" fill="#633806">审</text>
        <text x="210" y="164" font-size="11" fill="#6a6a75">窗口内每段截止审一次 · 没排满再开下一段</text>

        <text x="40" y="208" font-size="12" font-weight="500" fill="#2c2c2a">路线② · 优秀先看</text>
        <rect x="210" y="192" width="142" height="26" rx="5" fill="#eaf3de" stroke="#3b6d11" stroke-width="0.5"/>
        <text x="281" y="209" text-anchor="middle" font-size="10" fill="#27500a">第 1 档 · 先看先选</text>
        <rect x="356" y="192" width="136" height="26" rx="5" fill="#eaf3de" stroke="#97c459" stroke-width="0.5"/>
        <text x="424" y="209" text-anchor="middle" font-size="10" fill="#27500a">第 2 档</text>
        <rect x="496" y="192" width="134" height="26" rx="5" fill="#f4f4f0" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="563" y="209" text-anchor="middle" font-size="10" fill="#888780">第 3 档 · 兜底</text>
        <text x="210" y="236" font-size="11" fill="#6a6a75">按综合分排序，靠前的人先看到班次、先申领 · 再开下一档</text>

        <text x="40" y="272" font-size="12" fill="#6a6a75">两条都会动 6.2 的轮与获取节奏模型；原始讨论细节未归档，细化时先补原话与取舍</text>
      </svg>
      <div class="note">
        <strong>上线前待细化：</strong>① X=4 的构成是否像 2.5 一样写明；② 「剩余 = 被拿走的那段时长」沿用，若业务本意是「缺口发生到班次结束」需翻案并同步 6.4.4；③ 两条审核路线细化时先补原话与取舍，再决定挪进 6.2 的哪一节。
      </div>
    </div>

    <div id="hs-fu-batch4" class="section">
      <div class="section-header">
        <h2>8.6 上线非全推拿师：暂无迭代</h2>
      </div>
      <p class="doc-p">
        <strong>上线岗位：</strong>非全推拿师。<strong>迭代支持：</strong>暂无——判定段走通用默认（X=2.5）、执行段走寻人顶段。
        非全的日 / 周工时上限已在获取侧复核（6.4.5），缺口复核沿用同一套；若上线时业务提出按门店再梳理缺口规则，再回到 8.2 框架对号入座。
      </p>
    </div>

    <div id="hs-fu-release" class="section">
      <div class="section-header">
        <h2>8.7 发布与周期变更：跨批次的通用迭代</h2>
      </div>
      <p class="doc-p">
        这两条<strong>不属于任何单一批次</strong>——节奏模块随第一批上线就会被碰到，先记作跨批次储备：
        一是发布要不要给操作人员留维护窗口（可见层与数据层是两个阶段）；二是周期变更撞上已发周期怎么处理。
      </p>
      <h4 class="h4sub">发布停留期：可见层（现行）与数据层（待建）是两个阶段</h4>
      <svg viewBox="0 0 680 250" class="doc-svg" role="img"
           aria-label="发布两阶段对比：现行可见层——发布即跑副作用、各档发布后推到点才可见；迭代数据层——发布只生成草稿、停留期内可重新生成、确认开放才跑副作用">
        <title>发布停留期：两个阶段</title>
        <defs>
          <marker id="u8e" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#888780" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </marker>
        </defs>
        <text x="40" y="30" font-size="12" font-weight="500" fill="#0c447c">现行 · 可见层控制（已支持）</text>
        <rect x="40" y="40" width="180" height="56" rx="10" fill="#faece7" stroke="#993c1d" stroke-width="0.5"/>
        <text x="130" y="62" text-anchor="middle" font-size="12" font-weight="500" fill="#712b13">发布</text>
        <text x="130" y="80" text-anchor="middle" font-size="10" fill="#993c1d">副作用即跑：直派执行 · 占位落库</text>
        <line x1="222" y1="68" x2="238" y2="68" stroke="#888780" stroke-width="1" fill="none" marker-end="url(#u8e)"/>
        <rect x="242" y="40" width="180" height="56" rx="10" fill="#f4f4f0" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="332" y="62" text-anchor="middle" font-size="12" font-weight="500" fill="#444441">各档「发布后推」</text>
        <text x="332" y="80" text-anchor="middle" font-size="10" fill="#888780">到点才可见 · 数据其实已生效</text>
        <line x1="424" y1="68" x2="440" y2="68" stroke="#888780" stroke-width="1" fill="none" marker-end="url(#u8e)"/>
        <rect x="444" y="40" width="180" height="56" rx="10" fill="#eaf3de" stroke="#3b6d11" stroke-width="0.5"/>
        <text x="534" y="62" text-anchor="middle" font-size="12" font-weight="500" fill="#27500a">员工可见</text>
        <text x="534" y="80" text-anchor="middle" font-size="10" fill="#3b6d11">开抢 / 申领从这里起算</text>
        <text x="40" y="116" font-size="11" fill="#6a6a75">停留效果间接实现——但没有重新生成入口，想推翻时副作用已跑，撤回有成本</text>

        <text x="40" y="150" font-size="12" font-weight="500" fill="#633806">迭代 · 数据层闸门（待建）</text>
        <rect x="40" y="160" width="180" height="56" rx="10" fill="#faece7" stroke="#993c1d" stroke-width="0.5"/>
        <text x="130" y="182" text-anchor="middle" font-size="12" font-weight="500" fill="#712b13">发布 · 只生成草稿</text>
        <text x="130" y="200" text-anchor="middle" font-size="10" fill="#993c1d">快照待确认 · 无副作用</text>
        <line x1="222" y1="188" x2="238" y2="188" stroke="#888780" stroke-width="1" fill="none" marker-end="url(#u8e)"/>
        <rect x="242" y="160" width="180" height="56" rx="10" fill="#faeeda" stroke="#c58a2e" stroke-width="0.5"/>
        <text x="332" y="182" text-anchor="middle" font-size="12" font-weight="500" fill="#633806">停留期（轮级参数）</text>
        <text x="332" y="200" text-anchor="middle" font-size="10" fill="#854f0b">重新生成 · 或立即开放 · 默认 0</text>
        <line x1="424" y1="188" x2="440" y2="188" stroke="#888780" stroke-width="1" fill="none" marker-end="url(#u8e)"/>
        <rect x="444" y="160" width="180" height="56" rx="10" fill="#e6f1fb" stroke="#185fa5" stroke-width="0.5"/>
        <text x="534" y="182" text-anchor="middle" font-size="12" font-weight="500" fill="#0c447c">确认开放</text>
        <text x="534" y="200" text-anchor="middle" font-size="10" fill="#185fa5">此刻才跑占位与直派 · 员工可见</text>
        <text x="40" y="236" font-size="11" fill="#6a6a75">两阶段不是二选一：稳定节奏先用「发布后推」扛，需要操作干预窗口再上数据层</text>
      </svg>
      <p class="arch-cap">数据层方案里停留期内重新生成零成本（没人看见、没副作用）；「立即生成」同时就是提前发布入口，节奏时刻照常算下一轮。</p>

      <h4 class="h4sub">周期变更撞上已发周期：按「期」预检与决策，不做日级切分</h4>
      <svg viewBox="0 0 680 430" class="doc-svg" role="img"
           aria-label="周期变更冲突处理：生成前逐期预检，冲突期一次决策——覆盖、保留、拦截；生效线以下的日子一律不动；日级空段走临时班次兜底">
        <title>周期变更冲突处理</title>
        <defs>
          <marker id="u8f" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#888780" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </marker>
        </defs>
        <rect x="180" y="8" width="320" height="32" rx="8" fill="#faece7" stroke="#993c1d" stroke-width="0.5"/>
        <text x="340" y="28" text-anchor="middle" font-size="12" font-weight="500" fill="#712b13">周期变更：长度 / 锚点改动 · 手动提前发布</text>
        <line x1="340" y1="40" x2="340" y2="54" stroke="#888780" stroke-width="1" fill="none" marker-end="url(#u8f)"/>

        <rect x="140" y="58" width="400" height="38" rx="8" fill="#e6f1fb" stroke="#185fa5" stroke-width="0.5"/>
        <text x="340" y="82" text-anchor="middle" font-size="12" font-weight="500" fill="#0c447c">生成前预检：新周期未来各期 vs 已发周期，逐期比对</text>
        <line x1="340" y1="96" x2="340" y2="110" stroke="#888780" stroke-width="1" fill="none" marker-end="url(#u8f)"/>

        <rect x="40" y="114" width="196" height="44" rx="8" fill="#eaf3de" stroke="#3b6d11" stroke-width="0.5"/>
        <text x="138" y="132" text-anchor="middle" font-size="12" font-weight="500" fill="#27500a">不冲突</text>
        <text x="138" y="148" text-anchor="middle" font-size="10" fill="#3b6d11">正常生成（现行逻辑）</text>
        <rect x="244" y="114" width="196" height="44" rx="8" fill="#faeeda" stroke="#c58a2e" stroke-width="0.5"/>
        <text x="342" y="132" text-anchor="middle" font-size="12" font-weight="500" fill="#633806">完全重叠 → 进决策</text>
        <text x="342" y="148" text-anchor="middle" font-size="10" fill="#854f0b">整期撞上已发轮</text>
        <rect x="448" y="114" width="196" height="44" rx="8" fill="#faeeda" stroke="#c58a2e" stroke-width="0.5"/>
        <text x="546" y="132" text-anchor="middle" font-size="12" font-weight="500" fill="#633806">部分重叠 → 进决策</text>
        <text x="546" y="148" text-anchor="middle" font-size="10" fill="#854f0b">期中段撞上 · 尾巴留空段</text>
        <line x1="342" y1="158" x2="342" y2="172" stroke="#888780" stroke-width="1" fill="none" marker-end="url(#u8f)"/>
        <line x1="546" y1="158" x2="546" y2="166" stroke="#888780" stroke-width="1" fill="none"/>
        <path d="M546 166 Q 546 172 540 172 L 348 172" stroke="#888780" stroke-width="1" fill="none" marker-end="url(#u8f)"/>

        <rect x="40" y="176" width="604" height="118" rx="10" fill="#faeeda" stroke="#854f0b" stroke-width="0.5"/>
        <text x="56" y="198" font-size="13" font-weight="500" fill="#633806">一次决策 · 作用于本次全部冲突期（弹层带期清单：选班已完成 / 窗口进行中 / 未开放）</text>
        <rect x="56" y="210" width="188" height="68" rx="8" fill="#ffffff" stroke="#993c1d" stroke-width="0.5"/>
        <text x="150" y="230" text-anchor="middle" font-size="12" font-weight="500" fill="#712b13">a · 覆盖</text>
        <text x="150" y="246" text-anchor="middle" font-size="10" fill="#993c1d">生效线前重生成 · 原班次失效</text>
        <text x="150" y="260" text-anchor="middle" font-size="10" fill="#993c1d">员工重新参与选班</text>
        <rect x="252" y="210" width="188" height="68" rx="8" fill="#ffffff" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="346" y="230" text-anchor="middle" font-size="12" font-weight="500" fill="#444441">b · 保留</text>
        <text x="346" y="246" text-anchor="middle" font-size="10" fill="#888780">跳过该期 · 从下一期顺延</text>
        <text x="346" y="260" text-anchor="middle" font-size="10" fill="#888780">已完成的选班不受扰</text>
        <rect x="448" y="210" width="188" height="68" rx="8" fill="#ffffff" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="542" y="230" text-anchor="middle" font-size="12" font-weight="500" fill="#444441">c · 拦截</text>
        <text x="542" y="246" text-anchor="middle" font-size="10" fill="#888780">取消本次生成</text>
        <text x="542" y="260" text-anchor="middle" font-size="10" fill="#888780">先处理已发轮再来</text>

        <rect x="40" y="306" width="604" height="28" rx="8" fill="#faece7" stroke="#993c1d" stroke-width="0.5"/>
        <text x="342" y="324" text-anchor="middle" font-size="11" fill="#712b13">硬边界 · 生效线：已生效（已履约）的日子一律不动——覆盖只到生效线为止，横跨生效线的期要切段处理</text>

        <rect x="40" y="344" width="604" height="28" rx="8" fill="#eaf3de" stroke="#3b6d11" stroke-width="0.5"/>
        <text x="342" y="362" text-anchor="middle" font-size="11" fill="#27500a">日级空段（如周五到周日）→ 临时班次人工兜底 · 既有机制 · 不进周期引擎</text>

        <text x="40" y="402" font-size="12" fill="#6a6a75">粒度按「期」不按「天」：一期之内不拆两套窗口 / 快照 / 截止——这就是不做日级切分的理由；期三态 × 窗口三态，行为可穷举</text>
      </svg>
      <div class="note">
        <strong>上线前待细化：</strong>① a 覆盖后重开窗口的截止算法（沿用原截止 / 从覆盖时刻重起）；② a 的批量失效事实与全员重选通知口径（进 6.6 通知清单）；③ 停留期按时长还是按到点时刻、谁有权重新生成与提前发布、操作是否留痕；④ 数据层闸门与 6.2.2「三个时刻」表的合并方式（发布 → 开放 → 截止 → 生效）。
      </div>
    </div>

    <div id="hs-fu-map" class="section">
      <div class="section-header">
        <h2>8.8 上线节奏总图</h2>
      </div>
      <p class="doc-p">四批岗位按上线先后排在一张图里，★ 是该批上线时要迭代支持的登记点：</p>
      <svg viewBox="0 0 680 290" class="doc-svg" role="img"
           aria-label="上线节奏总图：四批岗位按先后排列，各自的判定段阈值、执行段补位策略与其他迭代支持，星标为变化点">
        <title>上线节奏 × 迭代支持总图</title>
        <text x="40" y="22" font-size="11" fill="#888780">上线批次</text>
        <text x="190" y="22" font-size="11" fill="#888780">判定段（X 阈值）</text>
        <text x="368" y="22" font-size="11" fill="#888780">执行段（补位策略）</text>
        <text x="526" y="22" font-size="11" fill="#888780">其他迭代支持</text>

        <rect x="40" y="34" width="140" height="40" rx="8" fill="#e6f1fb" stroke="#85b7eb" stroke-width="0.5"/>
        <text x="110" y="52" text-anchor="middle" font-size="11" font-weight="500" fill="#0c447c">非全客户经理</text>
        <text x="110" y="66" text-anchor="middle" font-size="10" fill="#185fa5">研发阶段</text>
        <rect x="190" y="34" width="170" height="40" rx="8" fill="#f4f4f0" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="275" y="58" text-anchor="middle" font-size="10" fill="#888780">通用默认 X=2.5</text>
        <rect x="368" y="34" width="150" height="40" rx="8" fill="#f4f4f0" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="443" y="58" text-anchor="middle" font-size="10" fill="#888780">寻人顶段</text>
        <rect x="526" y="34" width="114" height="40" rx="8" fill="#f4f4f0" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="583" y="58" text-anchor="middle" font-size="10" fill="#888780">无</text>

        <rect x="40" y="86" width="140" height="40" rx="8" fill="#f4f4f0" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="110" y="110" text-anchor="middle" font-size="11" font-weight="500" fill="#444441">全职客户经理</text>
        <rect x="190" y="86" width="170" height="40" rx="8" fill="#f4f4f0" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="275" y="110" text-anchor="middle" font-size="10" fill="#888780">通用默认 X=2.5</text>
        <rect x="368" y="86" width="150" height="40" rx="8" fill="#faeeda" stroke="#c58a2e" stroke-width="0.5"/>
        <text x="443" y="110" text-anchor="middle" font-size="10" fill="#633806">关联调班 ★</text>
        <rect x="526" y="86" width="114" height="40" rx="8" fill="#f4f4f0" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="583" y="104" text-anchor="middle" font-size="10" fill="#888780">班形 / 工时 / 同意</text>
        <text x="583" y="118" text-anchor="middle" font-size="10" fill="#888780">待细化</text>

        <rect x="40" y="138" width="140" height="40" rx="8" fill="#f4f4f0" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="110" y="162" text-anchor="middle" font-size="11" font-weight="500" fill="#444441">全职推拿师</text>
        <rect x="190" y="138" width="170" height="40" rx="8" fill="#faeeda" stroke="#c58a2e" stroke-width="0.5"/>
        <text x="275" y="162" text-anchor="middle" font-size="10" fill="#633806">X=4 · 超过才补 ★</text>
        <rect x="368" y="138" width="150" height="40" rx="8" fill="#f4f4f0" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="443" y="162" text-anchor="middle" font-size="10" fill="#888780">寻人顶段</text>
        <rect x="526" y="138" width="114" height="40" rx="8" fill="#f4f4f0" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="583" y="156" text-anchor="middle" font-size="10" fill="#888780">审核两条路线</text>
        <text x="583" y="170" text-anchor="middle" font-size="10" fill="#888780">（8.5）</text>

        <rect x="40" y="190" width="140" height="40" rx="8" fill="#f4f4f0" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="110" y="214" text-anchor="middle" font-size="11" font-weight="500" fill="#444441">非全推拿师</text>
        <rect x="190" y="190" width="170" height="40" rx="8" fill="#f4f4f0" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="275" y="214" text-anchor="middle" font-size="10" fill="#888780">通用默认 X=2.5</text>
        <rect x="368" y="190" width="150" height="40" rx="8" fill="#f4f4f0" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="443" y="214" text-anchor="middle" font-size="10" fill="#888780">寻人顶段</text>
        <rect x="526" y="190" width="114" height="40" rx="8" fill="#f4f4f0" stroke="#c8cbcf" stroke-width="0.5"/>
        <text x="583" y="214" text-anchor="middle" font-size="10" fill="#888780">无</text>

        <rect x="40" y="246" width="600" height="30" rx="8" fill="#eaf3de" stroke="#3b6d11" stroke-width="0.5"/>
        <text x="340" y="265" text-anchor="middle" font-size="11" fill="#27500a">★ = 该批上线时要迭代支持的登记点；其余沿用通用默认——功能是通用化设计，岗位上线时迭代支持</text>
      </svg>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'

const tocItems = [
  { id: 'hs-fu-why', label: '8.1 这一章怎么读' },
  { id: 'hs-fu-frame', label: '8.2 推导框架：两段式与人群登记' },
  { id: 'hs-fu-batch1', label: '8.3 上线非全客户经理：通用直接承载' },
  { id: 'hs-fu-batch2', label: '8.4 上线全职客户经理：关联调班' },
  { id: 'hs-fu-batch3', label: '8.5 上线全职推拿师：X=4 与审核路线' },
  { id: 'hs-fu-batch4', label: '8.6 上线非全推拿师：暂无迭代' },
  { id: 'hs-fu-release', label: '8.7 发布与周期变更：跨批次迭代' },
  { id: 'hs-fu-map', label: '8.8 上线节奏总图' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事中心', to: '/docs/hr-schedule' },
  { label: '八、未来扩展：多岗位接入的关键升级' }
]
</script>

<style scoped src="./doc-base.css"></style>
