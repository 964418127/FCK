<template>
  <DocShell
    :toc-items="tocItems"
    title="八、未来扩展：多岗位接入的关键升级"
    subtitle="以上线动作为轴：每上一批岗位，推导对应预升级——非全客户经理（研发中）→ 全职客户经理 → 全职推拿师 → 非全推拿师"
    version="v3.0 基线 + v5 重构"
    date="2026-11-24"
    :breadcrumbs="breadcrumbs"
  >
    <div id="hs-fu-why" class="section">
      <div class="section-header">
        <h2>8.1 这一章怎么读</h2>
      </div>
      <p class="doc-p">
        这一章<strong>不是需求</strong>，是一张升级地图：通用排班系统先上线<strong>非全客户经理（目前还在研发阶段）</strong>，
        之后每上一批岗位，都用同一套框架推导出这批需要的预升级内容——细化完成前不进功能章节：
      </p>
      <svg viewBox="0 0 680 78" class="arch-svg" role="img" aria-label="本章的推导方式：上线一批岗位 → 推导预升级 → 细化完成 → 挪进功能章节">
        <rect x="8" y="20" width="148" height="36" rx="9" class="ac-box-new" />
        <text x="82" y="42" text-anchor="middle" class="ac-t-strong">上线一批岗位</text>
        <path d="M160 33 L170 33 L165 41 Z" class="ac-arrow" />
        <rect x="176" y="20" width="148" height="36" rx="9" class="ac-box-new" />
        <text x="250" y="42" text-anchor="middle" class="ac-t-strong">推导预升级（本章）</text>
        <path d="M328 33 L338 33 L333 41 Z" class="ac-arrow" />
        <rect x="344" y="20" width="148" height="36" rx="9" class="ac-chip" />
        <text x="418" y="42" text-anchor="middle" class="ac-t-strong">细化完成</text>
        <path d="M496 33 L506 33 L501 41 Z" class="ac-arrow" />
        <rect x="512" y="20" width="148" height="36" rx="9" class="ac-chip" />
        <text x="586" y="42" text-anchor="middle" class="ac-t-strong">挪进功能章节</text>
        <text x="340" y="70" text-anchor="middle" class="ac-t-note">判定进 6.4.4 · 执行进 6.4.5 · 获取审核进 6.2；原型随细化进度走</text>
      </svg>
      <p class="arch-cap">上线是推导的起点：每一节先写「这批上线什么」，再写「上线前要预升级什么」。</p>
    </div>

    <div id="hs-fu-frame" class="section">
      <div class="section-header">
        <h2>8.2 推导框架：缺口两段式 + 按人群登记</h2>
      </div>
      <p class="doc-p">推导用的框架只有一张图：缺口收敛成两段式，岗位差异全部落在「按人群登记」上——每批上线就是两个填空：</p>
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
        <text x="93" y="392" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">研发中 · X=2.5 · 寻人顶段</text>
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

    <div id="hs-fu-batch1" class="section">
      <div class="section-header">
        <h2>8.3 第一批 · 非全客户经理（研发阶段）</h2>
      </div>
      <p class="doc-p">
        <strong>上线动作：</strong>通用排班系统先上非全客户经理——目前还在研发阶段。
        这一批没有预升级：上线动作本身就是对通用设计的第一次验证，缺口判定、补位执行全部走通用默认。
      </p>
      <svg viewBox="0 0 680 92" class="arch-svg" role="img" aria-label="第一批上线：上线动作直接由通用设计承载，三项通用能力随批生效">
        <rect x="8" y="26" width="160" height="40" rx="9" class="ac-box-new" />
        <text x="88" y="44" text-anchor="middle" class="ac-t-strong">上线动作</text>
        <text x="88" y="58" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">非全客户经理进通用排班</text>
        <path d="M173 41 L173 51 L181 46 Z" class="ac-arrow" />
        <rect x="188" y="26" width="150" height="40" rx="6" class="ac-cell" />
        <text x="263" y="44" text-anchor="middle" class="ac-t-strong">判定走默认</text>
        <text x="263" y="58" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">门槛 30 分钟 · X=2.5</text>
        <rect x="350" y="26" width="150" height="40" rx="6" class="ac-cell" />
        <text x="425" y="44" text-anchor="middle" class="ac-t-strong">执行走默认</text>
        <text x="425" y="58" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">寻人顶段 · 摆缺口兜底</text>
        <rect x="512" y="26" width="152" height="40" rx="6" class="ac-cell" />
        <text x="588" y="44" text-anchor="middle" class="ac-t-strong">报备入口</text>
        <text x="588" y="58" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">事件报备已落 6.5.1</text>
        <text x="340" y="84" text-anchor="middle" class="ac-t-note">上线即验证：时段 / 清单 / 缺口规则在真实岗位上跑通，是后面三批推导的基线</text>
      </svg>
    </div>

    <div id="hs-fu-batch2" class="section">
      <div class="section-header">
        <h2>8.4 第二批 · 全职客户经理</h2>
      </div>
      <p class="doc-p">
        <strong>上线动作：</strong>全职客户经理进入通用排班。
        <strong>预升级（执行段）：</strong>补位策略登记第二个值「关联调班」——门店有 2 名及以上时，有人请假不找外人顶，剩下的人调班，班形随人数递进：
      </p>
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
      <p class="arch-cap">班次被覆盖的人「无需履约」原班次；判定段不升级（仍走通用默认 X=2.5）。</p>
      <div class="note">
        <strong>机制定位：</strong>现行「班次变形」动作的定向回归（5.5 定过「按缺口类型自动处理的动作不带入」，客户经理是例外），与全职客户经理「轮转直派、余额生成通班」同源——把「余额生成通班」从轮间挪到轮内实时。<br>
        <strong>上线前待细化：</strong>① 长早 / 长晚 / 通班的时段拼法；② 通班超 8 小时的工时口径（联动 6.8）；③ 要不要剩余的人同意（牵 6.4.6 受损方向口径）；④ 非全客户经理确认不适用。
      </div>
    </div>

    <div id="hs-fu-batch3" class="section">
      <div class="section-header">
        <h2>8.5 第三批 · 全职推拿师</h2>
      </div>
      <p class="doc-p">
        <strong>上线动作：</strong>全职推拿师进入通用排班。
        <strong>预升级有两处：</strong>判定段阈值 X=4；获取段的审核节奏两条待定路线（动 6.2）。
      </p>
      <svg viewBox="0 0 680 96" class="arch-svg" role="img" aria-label="阈值对比：通用默认 X=2.5 小时，全日制推拿师 X=4 小时">
        <text x="170" y="36" text-anchor="end" class="ac-t-strong">判定段 X=2.5</text>
        <rect x="180" y="18" width="250" height="26" rx="6" class="ac-cell" />
        <text x="192" y="36" class="ac-t-note" style="font-size: 10px;">通用默认，构成已定：30 分钟通勤 + 2 小时补位班次</text>
        <text x="170" y="76" text-anchor="end" class="ac-t-strong">推拿师 X=4 ★</text>
        <rect x="180" y="58" width="400" height="26" rx="6" class="ac-cell-warn" />
        <text x="192" y="76" class="ac-t-note" style="font-size: 10px;">业务口径：剩余超 4 小时才补；构成待细化（比如 30 分钟通勤 + 3.5 小时班）</text>
        <text x="596" y="76" class="ac-t-note" style="font-size: 10px;">← 阈值更长</text>
      </svg>
      <p class="doc-p" style="margin-top: 14px;">获取段的审核节奏，现行「一轮一审」之外登记两条待定路线（细化前不动 6.2 正文）：</p>
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
        <strong>上线前待细化：</strong>① X=4 的构成是否像 2.5 一样写明；② 「剩余 = 被拿走的那段时长」沿用，若业务本意是「缺口发生到班次结束」需翻案并同步 6.4.4；
        ③ 两条审核路线的原始讨论细节未归档，细化时先补原话与取舍，再决定挪进 6.2 的哪一节。
      </div>
    </div>

    <div id="hs-fu-batch4" class="section">
      <div class="section-header">
        <h2>8.6 第四批 · 非全推拿师</h2>
      </div>
      <p class="doc-p">
        <strong>上线动作：</strong>非全推拿师进入通用排班。
        <strong>预升级：</strong>暂无——判定段走通用默认（X=2.5）、执行段走寻人顶段。
        唯一要留意的是非全的日 / 周工时上限已在获取侧复核（6.4.5），缺口复核沿用同一套；若上线时业务提出按门店再梳理缺口规则，再回到 8.2 框架对号入座。
      </p>
    </div>

    <div id="hs-fu-map" class="section">
      <div class="section-header">
        <h2>8.7 升级地图总表</h2>
      </div>
      <p class="doc-p">四批岗位按上线先后排在一张图里，★ 是每批上线前要动的登记点：</p>
      <svg viewBox="0 0 680 252" class="arch-svg" role="img"
           aria-label="升级地图：四批岗位按上线先后排列，各自的判定段阈值、执行段补位策略与其他预升级，星标为变化点">
        <text x="16" y="18" class="ac-t-note">上线批次</text>
        <text x="160" y="18" class="ac-t-note">判定段登记（X 阈值）</text>
        <text x="344" y="18" class="ac-t-note">执行段登记（补位策略）</text>
        <text x="506" y="18" class="ac-t-note">其他预升级</text>

        <rect x="16" y="28" width="136" height="40" rx="6" class="ac-chip" />
        <text x="84" y="46" text-anchor="middle" class="ac-t-strong">非全客户经理</text>
        <text x="84" y="60" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">研发阶段 · 第一批</text>
        <rect x="160" y="28" width="176" height="40" rx="6" class="ac-cell" />
        <text x="248" y="52" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">通用默认 X=2.5</text>
        <rect x="344" y="28" width="154" height="40" rx="6" class="ac-cell" />
        <text x="421" y="52" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">寻人顶段</text>
        <rect x="506" y="28" width="158" height="40" rx="6" class="ac-cell" />
        <text x="585" y="52" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">无 · 事件报备已落 6.5.1</text>

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
        <text x="585" y="156" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">（8.5 · 动 6.2）</text>

        <rect x="16" y="172" width="136" height="40" rx="6" class="ac-chip" />
        <text x="84" y="196" text-anchor="middle" class="ac-t-strong">非全推拿师</text>
        <rect x="160" y="172" width="176" height="40" rx="6" class="ac-cell" />
        <text x="248" y="196" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">通用默认 X=2.5</text>
        <rect x="344" y="172" width="154" height="40" rx="6" class="ac-cell" />
        <text x="421" y="196" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">寻人顶段</text>
        <rect x="506" y="172" width="158" height="40" rx="6" class="ac-cell" />
        <text x="585" y="196" text-anchor="middle" class="ac-t-note" style="font-size: 10px;">无</text>
        <text x="16" y="236" class="ac-t-note">★ = 该批上线前的登记点变化；其余格子沿用通用默认，与 8.2 登记条对应</text>
      </svg>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'

const tocItems = [
  { id: 'hs-fu-why', label: '8.1 这一章怎么读' },
  { id: 'hs-fu-frame', label: '8.2 推导框架：两段式与人群登记' },
  { id: 'hs-fu-batch1', label: '8.3 第一批 · 非全客户经理（研发中）' },
  { id: 'hs-fu-batch2', label: '8.4 第二批 · 全职客户经理' },
  { id: 'hs-fu-batch3', label: '8.5 第三批 · 全职推拿师' },
  { id: 'hs-fu-batch4', label: '8.6 第四批 · 非全推拿师' },
  { id: 'hs-fu-map', label: '8.7 升级地图总表' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事中心', to: '/docs/hr-schedule' },
  { label: '八、未来扩展：多岗位接入的关键升级' }
]
</script>

<style scoped src="./doc-base.css"></style>
