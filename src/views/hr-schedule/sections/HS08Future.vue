<template>
  <DocShell
    :toc-items="tocItems"
    title="八、未来扩展：多岗位接入的关键升级"
    subtitle="缺口判定两段式与按人群登记 · 推拿师 4 小时阈值 · 客户经理关联调班 · 推拿师审核两条待定路线——已讨论待细化，不进本期范围"
    version="v3.0 基线 + v5 重构"
    date="2026-11-24"
    :breadcrumbs="breadcrumbs"
  >
    <div id="hs-fu-why" class="section">
      <div class="section-header">
        <h2>8.1 这一章记什么</h2>
      </div>
      <p class="doc-p">
        配置侧是通用设计，上线节奏分批（非全客户经理 → 全职推拿师与客户经理 → 非全推拿师）。
        每批进来的关键升级先在这里集中登记，细化完成再挪进功能章节：
      </p>
      <svg viewBox="0 0 680 78" class="arch-svg" role="img" aria-label="本章内容的流转：方向已讨论 → 本章暂存 → 细化完成 → 挪进功能章节">
        <rect x="8" y="20" width="148" height="36" rx="9" class="ac-chip" />
        <text x="82" y="42" text-anchor="middle" class="ac-t-strong">方向已讨论</text>
        <path d="M160 33 L170 33 L165 41 Z" class="ac-arrow" />
        <rect x="176" y="20" width="148" height="36" rx="9" class="ac-box-new" />
        <text x="250" y="42" text-anchor="middle" class="ac-t-strong">本章暂存</text>
        <path d="M328 33 L338 33 L333 41 Z" class="ac-arrow" />
        <rect x="344" y="20" width="148" height="36" rx="9" class="ac-chip" />
        <text x="418" y="42" text-anchor="middle" class="ac-t-strong">细化完成</text>
        <path d="M496 33 L506 33 L501 41 Z" class="ac-arrow" />
        <rect x="512" y="20" width="148" height="36" rx="9" class="ac-chip" />
        <text x="586" y="42" text-anchor="middle" class="ac-t-strong">挪进功能章节</text>
        <text x="340" y="70" text-anchor="middle" class="ac-t-note">判定进 6.4.4 · 执行进 6.4.5 · 获取审核进 6.2；原型随细化进度走</text>
      </svg>
      <p class="arch-cap">现行章节保持「本期怎么做」的干净口径，多岗位接入的待办在这里对账。</p>
    </div>

    <div id="hs-fu-two-stage" class="section">
      <div class="section-header">
        <h2>8.2 缺口判定的两段式与按人群登记（框架）</h2>
      </div>
      <p class="doc-p">缺口这一段收敛成两段式，岗位差异全部落在「按人群登记」上——每个岗位合作形式进来就是两个填空，不动架构：</p>
      <svg viewBox="0 0 680 404" class="arch-svg" role="img"
           aria-label="缺口判定两段式：事件进来先判定（30分钟门槛、缺口归属、人群规则），再执行（按人群登记的补位策略），底部是四个人群的登记条">
        <rect x="240" y="8" width="200" height="30" rx="15" class="ac-chip" />
        <text x="340" y="27" text-anchor="middle" class="ac-t-strong">事件进来（请假 / 离职 / 取消挂店）</text>
        <path d="M335 40 L345 40 L340 48 Z" class="ac-arrow" />

        <rect x="16" y="52" width="648" height="122" rx="10" class="ac-box-new" />
        <text x="32" y="76" class="ac-t-strong">第一段 · 判定（求值）</text>
        <text x="648" y="76" text-anchor="end" class="ac-t-note">答：缺不缺 · 缺多少 · 补不补</text>
        <rect x="32" y="96" width="196" height="60" rx="6" class="ac-cell" />
        <text x="130" y="118" text-anchor="middle" class="ac-t-strong">① 30 分钟门槛</text>
        <text x="130" y="138" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">全局底线 · 未超不进判定</text>
        <path d="M233 121 L233 131 L241 126 Z" class="ac-arrow" />
        <rect x="244" y="96" width="196" height="60" rx="6" class="ac-cell" />
        <text x="342" y="118" text-anchor="middle" class="ac-t-strong">② 缺口归属</text>
        <text x="342" y="136" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">清单第 1 优先级档位决定</text>
        <text x="342" y="150" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">这是谁的缺口（岗位×合作形式）</text>
        <path d="M445 121 L445 131 L453 126 Z" class="ac-arrow" />
        <rect x="456" y="96" width="192" height="60" rx="6" class="ac-cell" />
        <text x="552" y="118" text-anchor="middle" class="ac-t-strong">③ 人群规则判定</text>
        <text x="552" y="136" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">G0–G3 那一套不变</text>
        <text x="552" y="150" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">剩余 &lt; X 小时不补</text>
        <path d="M335 176 L345 176 L340 184 Z" class="ac-arrow" />
        <text x="354" y="185" class="ac-t-note">判定结论：要补 n 人（不补 / 无缺口到此结束）</text>

        <rect x="16" y="188" width="648" height="134" rx="10" class="ac-box-new" />
        <text x="32" y="212" class="ac-t-strong">第二段 · 执行（补位）</text>
        <text x="648" y="212" text-anchor="end" class="ac-t-note">答：怎么补 · 按人群登记的补位策略</text>
        <rect x="32" y="222" width="302" height="52" rx="6" class="ac-cell" />
        <text x="183" y="242" text-anchor="middle" class="ac-t-strong">① 寻人顶段（通用）</text>
        <text x="183" y="260" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">清单档位顺位找人 · 有效班次时段复核 · 只顶被拿走那段</text>
        <rect x="350" y="222" width="298" height="52" rx="6" class="ac-cell" />
        <text x="499" y="242" text-anchor="middle" class="ac-t-strong">② 关联调班（全职客户经理）</text>
        <text x="499" y="260" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">剩下的人覆盖原班次 · 重新派发班形（见 8.4）</text>
        <rect x="32" y="284" width="616" height="26" rx="6" class="ac-cell-warn" />
        <text x="340" y="301" text-anchor="middle" class="ac-t-warn">① ② 都执行不了 → 摆缺口，人事定人（兜底 · 不分岗位）</text>
        <path d="M335 324 L345 324 L340 332 Z" class="ac-arrow" />

        <text x="16" y="350" class="ac-t-strong">按人群登记（每人群断两条：X 阈值 + 补位策略）</text>
        <rect x="16" y="358" width="154" height="44" rx="6" class="ac-cell" />
        <text x="93" y="376" text-anchor="middle" class="ac-t-strong">非全客户经理</text>
        <text x="93" y="392" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">已上线 · X=2.5 · 寻人顶段</text>
        <rect x="179" y="358" width="154" height="44" rx="6" class="ac-cell-warn" />
        <text x="256" y="376" text-anchor="middle" class="ac-t-warn">全职客户经理 ★</text>
        <text x="256" y="392" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">X=2.5 · 关联调班</text>
        <rect x="342" y="358" width="154" height="44" rx="6" class="ac-cell-warn" />
        <text x="419" y="376" text-anchor="middle" class="ac-t-warn">全职推拿师 ★</text>
        <text x="419" y="392" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">X=4 · 寻人顶段</text>
        <rect x="505" y="358" width="154" height="44" rx="6" class="ac-cell" />
        <text x="582" y="376" text-anchor="middle" class="ac-t-strong">非全推拿师</text>
        <text x="582" y="392" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">X=2.5 · 寻人顶段</text>
      </svg>
      <p class="arch-cap">★ = 该人群的登记点与通用默认不同。未登记的人群回落通用默认；30 分钟门槛是全局底线，不做成人群参数。</p>
      <div class="note">
        <strong>多档位时段：</strong>缺口归属按清单第 1 优先级档位判，补人寻人仍按全清单顺位——归属归第 1 档，补人不限于第 1 档；整班缺口（离职 / 取消挂店）走同一套归属。「剩余 = 被事件拿走的那段时长」的定义沿用。
      </div>
    </div>

    <div id="hs-fu-masseur-4h" class="section">
      <div class="section-header">
        <h2>8.3 全日制推拿师：剩余超 4 小时才补</h2>
      </div>
      <p class="doc-p">落在判定段，与通用默认同族、只是参数值不同；执行段不变（寻人顶段）：</p>
      <svg viewBox="0 0 680 96" class="arch-svg" role="img" aria-label="阈值对比：通用默认 X=2.5 小时，全日制推拿师 X=4 小时">
        <text x="170" y="36" text-anchor="end" class="ac-t-strong">通用默认 X=2.5</text>
        <rect x="180" y="18" width="250" height="26" rx="6" class="ac-cell" />
        <text x="192" y="36" class="ac-t-note" style="font-size: 10px;">构成已定：30 分钟通勤 + 2 小时补位班次</text>
        <text x="170" y="76" text-anchor="end" class="ac-t-strong">全职推拿师 X=4</text>
        <rect x="180" y="58" width="400" height="26" rx="6" class="ac-cell-warn" />
        <text x="192" y="76" class="ac-t-note" style="font-size: 10px;">构成待业务细化（比如 30 分钟通勤 + 3.5 小时班）</text>
        <text x="596" y="76" class="ac-t-note" style="font-size: 10px;">← 阈值更长</text>
      </svg>
      <div class="note">
        <strong>待细化：</strong>① 4 小时的构成是否像 2.5 一样写明；② 阈值按现行定义「剩余 = 被拿走的那段时长」执行，若业务本意是「缺口发生到班次结束」，细化时翻案并同步 6.4.4。
      </div>
    </div>

    <div id="hs-fu-cm-swap" class="section">
      <div class="section-header">
        <h2>8.4 全职客户经理：关联调班</h2>
      </div>
      <p class="doc-p">门店有 2 名及以上全职客户经理时，有人请假不找外人顶，剩下的人调班——班形随人数递进：</p>
      <svg viewBox="0 0 680 190" class="arch-svg" role="img"
           aria-label="关联调班班形递进：3人早中晚 → 1人请假剩2人长早加长晚 → 再请假剩1人通班 → 没人可调退回通用补人">
        <rect x="8" y="44" width="136" height="100" rx="8" class="ac-cell" />
        <text x="76" y="66" text-anchor="middle" class="ac-t-strong">3 人在岗</text>
        <rect x="18" y="76" width="38" height="24" rx="6" class="ac-chip" />
        <text x="37" y="92" text-anchor="middle" class="ac-t-strong">早</text>
        <rect x="61" y="76" width="38" height="24" rx="6" class="ac-chip" />
        <text x="80" y="92" text-anchor="middle" class="ac-t-strong">中</text>
        <rect x="104" y="76" width="38" height="24" rx="6" class="ac-chip" />
        <text x="123" y="92" text-anchor="middle" class="ac-t-strong">晚</text>
        <text x="76" y="120" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">早 / 中 / 晚三个班</text>
        <text x="163" y="82" text-anchor="middle" class="ac-t-note">1 人请假</text>
        <path d="M148 94 L175 94 L168 88 L168 100 Z" class="ac-arrow" />
        <rect x="183" y="44" width="136" height="100" rx="8" class="ac-cell" />
        <text x="251" y="66" text-anchor="middle" class="ac-t-strong">剩 2 人</text>
        <rect x="193" y="76" width="57" height="24" rx="6" class="ac-chip" />
        <text x="221" y="92" text-anchor="middle" class="ac-t-strong">长早</text>
        <rect x="254" y="76" width="57" height="24" rx="6" class="ac-chip" />
        <text x="282" y="92" text-anchor="middle" class="ac-t-strong">长晚</text>
        <text x="251" y="120" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">原班次覆盖 · 重新派发</text>
        <text x="337" y="82" text-anchor="middle" class="ac-t-note">再请假</text>
        <path d="M322 94 L349 94 L342 88 L342 100 Z" class="ac-arrow" />
        <rect x="357" y="44" width="136" height="100" rx="8" class="ac-cell" />
        <text x="425" y="66" text-anchor="middle" class="ac-t-strong">剩 1 人</text>
        <rect x="387" y="76" width="76" height="24" rx="6" class="ac-chip" />
        <text x="425" y="92" text-anchor="middle" class="ac-t-strong">通班</text>
        <text x="425" y="120" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">一人覆盖全天</text>
        <text x="511" y="82" text-anchor="middle" class="ac-t-note">再请假</text>
        <path d="M496 94 L523 94 L516 88 L516 100 Z" class="ac-arrow" />
        <rect x="532" y="44" width="136" height="100" rx="8" class="ac-cell-warn" />
        <text x="600" y="66" text-anchor="middle" class="ac-t-warn">没人可调</text>
        <text x="600" y="90" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">退回通用补人路径</text>
        <text x="600" y="106" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">缺口规则判 →</text>
        <text x="600" y="120" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">寻人顶段 / 摆缺口</text>
      </svg>
      <p class="arch-cap">班形随人数递进：3 人 → 长早 + 长晚 → 通班；班次被覆盖的人「无需履约」原班次。班形拼法待业务给梯度。</p>
      <div class="note">
        <strong>机制定位：</strong>现行「班次变形」动作的定向回归（5.5 定过「按缺口类型自动处理的动作不带入」，客户经理是例外），与全职客户经理「轮转直派、余额生成通班」同源——把「余额生成通班」从轮间挪到轮内实时。两段式里落在执行段：补位策略的第二个值。<br>
        <strong>待细化：</strong>① 长早 / 长晚 / 通班的时段拼法；② 通班超 8 小时的工时口径（联动 6.8）；③ 要不要剩余的人同意（牵 6.4.6 受损方向口径）；④ 非全客户经理确认不适用。
      </div>
    </div>

    <div id="hs-fu-masseur-review" class="section">
      <div class="section-header">
        <h2>8.5 全日制推拿师：审核的两条待定路线</h2>
      </div>
      <p class="doc-p">现行是「一轮一审」（申领 + 综合分截断，落选周五再抢、通班兜底）；两条路线动的都是获取节奏：</p>
      <svg viewBox="0 0 680 276" class="arch-svg" role="img"
           aria-label="审核节奏对比：现行获取窗口结束审一次；路线一窗口内分段各审一次没满继续；路线二按档位先让优秀的人看班申领">
        <text x="8" y="36" class="ac-t-strong">现行 · 一轮一审</text>
        <rect x="160" y="44" width="504" height="36" rx="8" class="ac-chip" />
        <text x="176" y="66" class="ac-t">获取窗口（一轮）</text>
        <circle cx="640" cy="62" r="13" class="ac-num" />
        <text x="640" y="66" text-anchor="middle" class="ac-t-num">审</text>
        <text x="160" y="98" class="ac-t-note">窗口截止审一次 · 落选周五再抢 · 通班兜底</text>

        <text x="8" y="118" class="ac-t-strong">路线① · 多段审核</text>
        <rect x="160" y="126" width="160" height="36" rx="8" class="ac-cell" />
        <text x="240" y="148" text-anchor="middle" class="ac-t-strong">第一段</text>
        <rect x="332" y="126" width="160" height="36" rx="8" class="ac-cell" />
        <text x="412" y="148" text-anchor="middle" class="ac-t-strong">第二段</text>
        <rect x="504" y="126" width="160" height="36" rx="8" class="ac-cell" />
        <text x="584" y="148" text-anchor="middle" class="ac-t-strong">第三段</text>
        <circle cx="326" cy="144" r="12" class="ac-num" />
        <text x="326" y="148" text-anchor="middle" class="ac-t-num" style="font-size: 9px;">审</text>
        <circle cx="498" cy="144" r="12" class="ac-num" />
        <text x="498" y="148" text-anchor="middle" class="ac-t-num" style="font-size: 9px;">审</text>
        <circle cx="658" cy="144" r="12" class="ac-num" />
        <text x="658" y="148" text-anchor="middle" class="ac-t-num" style="font-size: 9px;">审</text>
        <text x="160" y="180" class="ac-t-note">窗口内每段截止审一次 · 没排满再开下一段</text>

        <text x="8" y="200" class="ac-t-strong">路线② · 优秀先看</text>
        <rect x="160" y="208" width="168" height="36" rx="8" style="fill: hsl(var(--primary) / 0.14); stroke: hsl(var(--primary) / 0.4);" />
        <text x="244" y="230" text-anchor="middle" class="ac-t-strong">第 1 档 · 先看先选</text>
        <rect x="332" y="208" width="160" height="36" rx="8" style="fill: hsl(var(--primary) / 0.07); stroke: hsl(var(--primary) / 0.25);" />
        <text x="412" y="230" text-anchor="middle" class="ac-t-strong">第 2 档</text>
        <rect x="496" y="208" width="168" height="36" rx="8" class="ac-chip" />
        <text x="580" y="230" text-anchor="middle" class="ac-t-strong">第 3 档 · 兜底</text>
        <text x="160" y="262" class="ac-t-note">按综合分排序，靠前的人先看到班次、先申领 · 再开下一档</text>
      </svg>
      <div class="note">
        <strong>待补：</strong>两条路线的原始讨论细节未归档，本节按讨论表述登记路线名；细化时先补原话与取舍，再决定挪进 6.2 的哪一节。
      </div>
    </div>

    <div id="hs-fu-checklist" class="section">
      <div class="section-header">
        <h2>8.6 接入动作清单</h2>
      </div>
      <p class="doc-p">每一批岗位接入按两段式对号入座——登记都是配置动作，不动架构、不动已上线岗位的时段与配置：</p>
      <svg viewBox="0 0 680 252" class="arch-svg" role="img"
           aria-label="接入批次登记矩阵：四批岗位各自的判定段阈值与执行段补位策略，星标为变化点">
        <text x="16" y="18" class="ac-t-note">接入批次</text>
        <text x="160" y="18" class="ac-t-note">判定段登记（X 阈值）</text>
        <text x="344" y="18" class="ac-t-note">执行段登记（补位策略）</text>
        <text x="506" y="18" class="ac-t-note">其他</text>

        <rect x="16" y="28" width="136" height="40" rx="6" class="ac-chip" />
        <text x="84" y="46" text-anchor="middle" class="ac-t-strong">非全客户经理</text>
        <text x="84" y="60" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">已上线</text>
        <rect x="160" y="28" width="176" height="40" rx="6" class="ac-cell" />
        <text x="248" y="52" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">通用默认 X=2.5</text>
        <rect x="344" y="28" width="154" height="40" rx="6" class="ac-cell" />
        <text x="421" y="52" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">寻人顶段</text>
        <rect x="506" y="28" width="158" height="40" rx="6" class="ac-cell" />
        <text x="585" y="52" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">事件报备入口已上线</text>

        <rect x="16" y="76" width="136" height="40" rx="6" class="ac-chip" />
        <text x="84" y="100" text-anchor="middle" class="ac-t-strong">全职客户经理</text>
        <rect x="160" y="76" width="176" height="40" rx="6" class="ac-cell" />
        <text x="248" y="100" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">通用默认 X=2.5</text>
        <rect x="344" y="76" width="154" height="40" rx="6" class="ac-cell-warn" />
        <text x="421" y="100" text-anchor="middle" class="ac-t-warn" style="font-size: 10px;">关联调班 ★</text>
        <rect x="506" y="76" width="158" height="40" rx="6" class="ac-cell" />
        <text x="585" y="94" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">班形 / 工时 / 同意</text>
        <text x="585" y="108" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">待细化（8.4）</text>

        <rect x="16" y="124" width="136" height="40" rx="6" class="ac-chip" />
        <text x="84" y="148" text-anchor="middle" class="ac-t-strong">全职推拿师</text>
        <rect x="160" y="124" width="176" height="40" rx="6" class="ac-cell-warn" />
        <text x="248" y="148" text-anchor="middle" class="ac-t-warn" style="font-size: 10px;">X=4 · 超过才补 ★</text>
        <rect x="344" y="124" width="154" height="40" rx="6" class="ac-cell" />
        <text x="421" y="148" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">寻人顶段</text>
        <rect x="506" y="124" width="158" height="40" rx="6" class="ac-cell" />
        <text x="585" y="142" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">审核两条待定路线</text>
        <text x="585" y="156" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">（8.5）</text>

        <rect x="16" y="172" width="136" height="40" rx="6" class="ac-chip" />
        <text x="84" y="196" text-anchor="middle" class="ac-t-strong">非全推拿师</text>
        <rect x="160" y="172" width="176" height="40" rx="6" class="ac-cell" />
        <text x="248" y="196" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">通用默认 X=2.5</text>
        <rect x="344" y="172" width="154" height="40" rx="6" class="ac-cell" />
        <text x="421" y="196" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">寻人顶段</text>
        <rect x="506" y="172" width="158" height="40" rx="6" class="ac-cell" />
        <text x="585" y="196" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">—</text>
        <text x="16" y="236" class="ac-t-note">★ = 该批接入时的登记点变化；其余格子沿用通用默认，与 8.2 登记条对应</text>
      </svg>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'

const tocItems = [
  { id: 'hs-fu-why', label: '8.1 这一章记什么' },
  { id: 'hs-fu-two-stage', label: '8.2 两段式与按人群登记' },
  { id: 'hs-fu-masseur-4h', label: '8.3 推拿师剩余超 4 小时才补' },
  { id: 'hs-fu-cm-swap', label: '8.4 客户经理关联调班' },
  { id: 'hs-fu-masseur-review', label: '8.5 推拿师审核两条待定路线' },
  { id: 'hs-fu-checklist', label: '8.6 接入动作清单' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事中心', to: '/docs/hr-schedule' },
  { label: '八、未来扩展：多岗位接入的关键升级' }
]
</script>

<style scoped src="./doc-base.css"></style>
