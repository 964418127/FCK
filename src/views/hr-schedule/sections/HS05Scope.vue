<template>
  <DocShell
    :toc-items="tocItems"
    title="五、需求范围"
    subtitle="先看现在怎么排（四岗位）与三个结构性空洞，再并排比一比：一条策略装四件事 vs 四层各管一件事"
    version="v3.0 基线"
    date="2026-11-12"
    :breadcrumbs="breadcrumbs"
  >
    <div id="hs-scope" class="section">
      <div class="section-header">
        <h2>五、需求范围</h2>
        <DocCopyButton section-id="hs-scope" />
      </div>

      <div class="note lead-note">
        <strong>一句话定位：</strong>把「一个容器上有哪些时段」和「谁在什么时候、按什么、拿几个这些时段的名额」
        拆成两个对象，让一套时段覆盖四个岗位；结果照旧写进既有排班结果表。
      </div>

      <h3 id="hs-scope-51">5.1 做什么 / 不做什么</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 90px;">归属</th><th style="width: 230px;">内容</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>我们做</strong></td><td>上班容器与时段</td><td>时段只说时间形态：班次、适用星期、名额、生成节奏（见 6.1）</td></tr>
          <tr><td><strong>我们做</strong></td><td>时段模板与门店班次库</td><td>通用模板 + 门店改名调时间 + 引用即继承 / 快照实例化两套语义（见 6.2）</td></tr>
          <tr><td><strong>我们做</strong></td><td>获取规则</td><td>三种模式、轮的三个时刻、余额三条去向；一条规则可挂多条时段（见 6.3）</td></tr>
          <tr><td><strong>我们做</strong></td><td>排班结果</td><td>审核通过、兜底安排都写既有结果表，带「怎么排上的」（见 6.4）</td></tr>
          <tr><td><strong>我们做</strong></td><td>移动端选班</td><td>可选班次 / 我的排班 / 通知，一套壳按资格过滤（见 6.5）</td></tr>
          <tr><td><strong>我们不做</strong></td><td>考勤打卡</td><td>只留挂载点（挂在容器上），本期不实现</td></tr>
          <tr><td><strong>我们不做</strong></td><td>排班结果表的结构改造</td><td>结果直接写入，重构范围只到「谁来占」为止</td></tr>
          <tr><td><strong>我们不做</strong></td><td>加班认定与薪酬计算</td><td>兜到通班多出的工时怎么算钱，属下游</td></tr>
          <tr><td><strong>我们不做</strong></td><td>人员签约与劳动关系</td><td>谁是本店非全、谁有资格，由人员侧决定，这里只读</td></tr>
        </tbody>
      </table>
    </div>

    <div id="hs-scope-now" class="section">
      <div class="section-header">
        <h2>5.2 现行排班现状：四个岗位，四套配法</h2>
      </div>
      <p class="doc-p">
        四个岗位在今天不是四个版本，而是<strong>同一套槽位的四组取值</strong>。差异集中在三件事：
        名额怎么算、顺位怎么排、余额往哪去。
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 110px;">岗位</th>
            <th style="width: 130px;">生成</th>
            <th style="width: 200px;">班次与名额</th>
            <th>谁定归属（顺位）</th>
            <th style="width: 130px;">没人接</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>全职<br>客户经理</strong></td>
            <td>周四 06:00 铺下周</td>
            <td>早 / 晚 / 中 / 全天班；名额按本店人数组合（1 人只开全天，2 人早晚，3 人早中晚）</td>
            <td>
              ① 本店全职·按上周倒班轮转指派 ② 储备·缺口才补 ③ 本店非全·先到先得 ④ 同城同岗·排班日 1 天前
            </td>
            <td>生成通班</td>
          </tr>
          <tr>
            <td><strong>全职<br>推拿师</strong></td>
            <td>周四 06:00 铺下周</td>
            <td>早 / 晚班；名额按门店天均分钟数（420 分钟 1 个、600 分钟 2 个，钳 1–3）</td>
            <td>
              ① 本店全职·<strong>申领 + 综合分排序截断</strong>（产值 40 / 回头 30 / 预约 30）② 同城同岗·排班日 1 天前
            </td>
            <td>落选周五再抢 → 生成通班</td>
          </tr>
          <tr>
            <td><strong>非全<br>客户经理</strong></td>
            <td>周四 06:00（可手动）</td>
            <td>周期 / 临时时段；名额按时段固定，钳 0–6</td>
            <td>
              三档<strong>累计开放</strong>：① 本店非全·发布即可见 ② 本店非全推拿师·排班日 3 天前 ③ 本店全职推拿师·排班日 1 天前
            </td>
            <td>转临时时段（最早签约自动派）或留待派发</td>
          </tr>
          <tr>
            <td><strong>非全<br>推拿师</strong></td>
            <td>手动</td>
            <td>必选早 10–14 / 必选晚 18–22 / 常规 14–18；名额 = 签约非全 ÷2 向上取整，钳 0–4</td>
            <td>只一档：本店非全推拿师，发布即可见，先到先得</td>
            <td><strong>待定</strong></td>
          </tr>
        </tbody>
      </table>

      <h4 class="h4sub">四条共性：看着不一样，其实骨架相同</h4>
      <ul class="doc-ul">
        <li><strong>发出去的是名额，不是排班</strong>——四岗都先按生成节奏铺出名额，再靠顺位把名额消耗掉。</li>
        <li><strong>名额都不是拍脑袋</strong>——人数组合、门店业务量阈值、签约人数比例、时段固定数，四种算法各用一次。</li>
        <li><strong>顺位是同一个模板</strong>——本店本岗 → 储备 → 本店他岗 → 同城同岗，且<strong>越靠后开放越晚</strong>。</li>
        <li><strong>兜底只有两种动作</strong>——全职两岗「生成通班」，非全两岗「转临时时段 / 留待派发」。</li>
      </ul>
      <div class="note">
        <strong>唯一的特殊档：</strong>四岗里只有<strong>全职推拿师</strong>走审核（申领 + 综合分截断）；
        <strong>全职客户经理</strong>是唯一不申领的（系统轮转直派）。这两个「唯一」正好是 v3 要保住的两端。
      </div>
    </div>

    <div id="hs-scope-gap" class="section">
      <div class="section-header">
        <h2>5.3 现行做法的三个结构性空洞</h2>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">空洞</th><th style="width: 260px;">现在长什么样</th><th>为什么必须补</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>没有「申领截止」</strong></td>
            <td>全职推拿师的审核只有「发布即可见」，没有说什么时候收人、什么时候定人</td>
            <td>没有截止，审核就退化成「边申边定」，等于先到先得</td>
          </tr>
          <tr>
            <td><strong>余额靠定时硬凑</strong></td>
            <td>第二轮写成「周五可再抢」，与第一轮何时结算完无关</td>
            <td>结算是事件，不是星期几；定时驱动会出现「还没结算就开第二轮」</td>
          </tr>
          <tr>
            <td><strong>兜底不能跨时段</strong></td>
            <td>兜底只有一个动作名「生成通班」，无法表达「先晚班、再通班」</td>
            <td>兜底必须吃<strong>本容器已有时段</strong>的剩余名额，且逐档过时间不交叉</td>
          </tr>
        </tbody>
      </table>
      <div class="note warn-note">
        <strong>还有一个口子没堵：</strong>非全推拿师的「没人接」至今是<strong>待定</strong>，
        必选时段分不完怎么办没有结论——这条挂在<router-link to="/docs/hr-schedule/appendix">七、附录</router-link>，本版不擅自补。
      </div>
    </div>

    <div id="hs-scope-arch" class="section">
      <div class="section-header">
        <h2>5.4 架构对比：一条策略装四件事 → 四层各管一件事</h2>
      </div>
      <p class="doc-p">
        上面是现在：<strong>一个岗位 = 一条策略</strong>，四个岗位的生成、名额、顺位、兜底各配各的、互不共享。
        下面是 v3：同样这四件事摊成四层，四个岗位共用同一套层，只换挂载关系。
      </p>

      <div class="arch-diff">
        <!-- 现行：四行矩阵，格子填真实取值 -->
        <div class="arch-col">
          <div class="arch-head before">现在 · 一个岗位一条策略，取值互不相同</div>
          <svg viewBox="0 0 560 300" class="arch-svg" role="img"
               aria-label="现行架构：四个岗位各一行，每行是生成节奏、班次名额、顺位人群、余额兜底的真实取值，四行互不相同且互不共享">
            <text x="88" y="52" class="ac-t-note">生成节奏</text>
            <text x="206" y="52" class="ac-t-note">班次与名额</text>
            <text x="324" y="52" class="ac-t-note">顺位与人群</text>
            <text x="442" y="52" class="ac-t-note">余额兜底</text>
            <g v-for="(r, i) in nowRows" :key="r.who[1]">
              <rect x="4" :y="60 + i * 52" width="552" height="50" rx="9" class="ac-box-old" />
              <text x="80" :y="81 + i * 52" text-anchor="end" class="ac-t-strong">{{ r.who[0] }}</text>
              <text x="80" :y="96 + i * 52" text-anchor="end" class="ac-t-strong">{{ r.who[1] }}</text>
              <g v-for="(c, j) in r.cells" :key="j">
                <rect :x="88 + j * 118" :y="66 + i * 52" width="112" height="38" rx="6"
                      :class="c[2] ? 'ac-cell-warn' : 'ac-cell'" />
                <text :x="144 + j * 118" :y="80 + i * 52" text-anchor="middle"
                      :class="c[2] ? 'ac-t-warn' : 'ac-t'">{{ c[0] }}</text>
                <text v-if="c[1]" :x="144 + j * 118" :y="95 + i * 52" text-anchor="middle" class="ac-t">{{ c[1] }}</text>
              </g>
            </g>
            <text x="324" y="288" text-anchor="middle" class="ac-t-note">同一件事四个岗位各配各的：改顺位要改四处，换门店要复制四条</text>
          </svg>
          <p class="arch-cap">每行是一个岗位的真实取值——差异看得见，但都被焊死在各自的策略里。</p>
        </div>

        <!-- v3：全宽四层横切 -->
        <div class="arch-col">
          <div class="arch-head after">v3 · 四层，四岗共用</div>
          <svg viewBox="0 0 560 292" class="arch-svg" role="img"
               aria-label="v3 架构：容器、时段、获取规则、排班结果四层横切，四个岗位共用同一套层">
            <g v-for="(l, i) in newLayers" :key="l.t">
              <rect x="6" :y="4 + i * 54" width="548" height="44" rx="9" class="ac-box-new" />
              <circle cx="26" :cy="26 + i * 54" r="9" class="ac-num" />
              <text x="26" :y="29.5 + i * 54" text-anchor="middle" class="ac-t-num">{{ i + 1 }}</text>
              <text x="44" :y="22 + i * 54" class="ac-t-strong">{{ l.t }}</text>
              <text x="44" :y="39 + i * 54" class="ac-t">{{ l.d }}</text>
              <path :d="`M280 ${50 + i * 54} l4 5 l-8 0 z`" class="ac-arrow" v-if="i < 3" />
            </g>
            <text x="280" y="244" text-anchor="middle" class="ac-t-note">↓ 四个岗位落在同一套层上，只换挂载关系</text>
            <g v-for="(p, i) in newPeople" :key="p">
              <rect :x="11 + i * 136" y="252" width="130" height="24" rx="12" class="ac-chip" />
              <text :x="76 + i * 136" y="268" text-anchor="middle" class="ac-t">{{ p }}</text>
            </g>
          </svg>
          <p class="arch-cap">四层各管一件事，四个岗位共用；换岗位只换挂载关系，不动层本身。</p>
        </div>
      </div>

      <h4 class="h4sub">同一件事，从哪儿搬到了哪儿</h4>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">这件事</th><th style="width: 270px;">现在混在哪</th><th>v3 归到哪一层</th></tr>
        </thead>
        <tbody>
          <tr><td>多久铺一次、铺多远</td><td>策略里的发布规则，四岗各写一遍</td><td><strong>时段</strong>·生成节奏（周四 06:00 / 每月 25 日）</td></tr>
          <tr><td>什么时间、有几个位置</td><td>策略里的班次与名额，算法四岗各一套</td><td><strong>时段</strong>·只描述时间形态，名额数是容量上限</td></tr>
          <tr><td>谁先领、按什么定、拿几个</td><td>策略里的优先级串，审核与自抢混写</td><td><strong>获取规则</strong>·模式 + 轮 + 余额，可挂多条时段</td></tr>
          <tr><td>没人接怎么办</td><td>策略里的兜底动作名，不能跨时段</td><td><strong>获取规则</strong>·兜底序列，逐档吃目标时段余量</td></tr>
          <tr><td>谁最终占了这一天</td><td>系统另写一张结果</td><td><strong>排班结果表</strong>·唯一记录口，带「怎么排上的」</td></tr>
        </tbody>
      </table>
      <div class="note lead-note">
        <strong>对比的落点：</strong>左边四列之所以要抄四遍，不是业务复杂，是<strong>一条策略同时回答四个问题</strong>；
        拆层之后「同一件事只有一个地方可改」，四岗位的差异退化成<strong>挂哪条规则</strong>，而不是各写一套。
      </div>
    </div>

    <div id="hs-scope-frame" class="section">
      <div class="section-header">
        <h2>5.5 重构框架：四层对象</h2>
      </div>
      <p class="doc-p">
        把原来一条策略里的东西拆成四层，每层只回答一个问题，且<strong>变更频率不同</strong>——
        越往下越稳定，越往上越常改。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 110px;">层</th><th style="width: 240px;">回答什么问题</th><th style="width: 220px;">关键内容</th><th>不做什么</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>① 容器</strong></td>
            <td>这批时段属于谁</td>
            <td>门店 / 办公地点 / 城市 / 人；打卡考勤挂在这里</td>
            <td>不定时间、不定名额</td>
          </tr>
          <tr>
            <td><strong>② 时段</strong></td>
            <td>什么时间、有几个位置、多久铺一次</td>
            <td>班次、适用星期、名额、生成节奏与视野、来源标记</td>
            <td><strong>不说「谁能领」</strong>，也不说谁先谁后</td>
          </tr>
          <tr>
            <td><strong>③ 获取规则</strong></td>
            <td>谁、什么时候、按什么、拿几个、剩了怎么办</td>
            <td>模式、轮（人群 + 开放 + 截止 + 结算）、余额去向、兜底序列</td>
            <td>不改名额上限，不新建时段</td>
          </tr>
          <tr>
            <td><strong>④ 排班结果</strong></td>
            <td>谁最终占了这一天这个位置</td>
            <td>既有结果表；带来源（审核 / 自领 / 轮转 / 直派 / 兜底）</td>
            <td>不设审核单、不设审批流</td>
          </tr>
        </tbody>
      </table>

      <h4 class="h4sub">解耦之后得到的三件事</h4>
      <div class="duo">
        <div class="duo-card">
          <h4>同一条时段，两种领法</h4>
          <p>A 店走申领审核、B 店走先到先得，<strong>时段不用复制两份</strong>，只挂不同规则。</p>
          <p>门店改班次时间只动时段层，规则不受影响。</p>
        </div>
        <div class="duo-card">
          <h4>一套规则，挂多条时段</h4>
          <p>「两轮审核 + 兜底到晚班再通班」只要配一次，可以挂到早班、中班、晚班。</p>
          <p>规则可存模板复用，换门店只换挂载关系。</p>
        </div>
        <div class="duo-card">
          <h4>门店差异不复制策略</h4>
          <p>班次名称与时间属门店（本店班次库），人群与顺位属总部（获取规则）。</p>
          <p>两边各改各的，不会互相拽着动。</p>
        </div>
      </div>
    </div>

    <div id="hs-scope-mode" class="section">
      <div class="section-header">
        <h2>5.6 三种获取模式：只有三类，且只回答「谁定归属」</h2>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">模式</th><th style="width: 120px;">有几轮</th><th style="width: 260px;">谁定归属</th><th>本版对应岗位</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>系统直派</strong></td>
            <td>没有轮</td>
            <td>系统按轮转 / 缺口 / 点名直接安排，被安排即拥有</td>
            <td>全职客户经理（轮转）、储备补位、临时时段指定到人</td>
          </tr>
          <tr>
            <td><strong>公布即抢</strong></td>
            <td>1 轮 · 即时</td>
            <td>符合条件（含时间不交叉、单日上限）立刻获得</td>
            <td>非全客户经理三档、非全推拿师全部、全职推拿师的同城余量</td>
          </tr>
          <tr>
            <td><strong>申领审核</strong></td>
            <td>1..N 轮 · 截止结算</td>
            <td>截止后在<strong>已申领的人</strong>里按综合分排序，截断到名额数</td>
            <td>全职推拿师本店档</td>
          </tr>
        </tbody>
      </table>

      <h4 class="h4sub">轮的三个时刻：这是「审核」能成立的前提</h4>
      <p class="doc-p">
        一个轮 = 一段申领期 + 一次结算。三个时刻都配在轮上，人群资格也配在轮上——
        于是「岗位 A 8 点见、B 11 点见」不需要额外机制，只是<strong>两轮的开放时刻不同</strong>。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 110px;">时刻</th><th style="width: 300px;">配什么</th><th>以「周六早班」为例</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>开放</strong></td><td>锚点 + 时刻（支持跨日写法，25:00 = 次日 01:00）</td><td>排班日 4 天前 06:00，即周二 06:00</td></tr>
          <tr><td><strong>截止</strong></td><td>同一套锚点 + 时刻</td><td>排班日 1 天前 22:00，即周五 22:00</td></tr>
          <tr><td><strong>结算</strong></td><td>截止即结算 / 延迟若干小时统一出</td><td>周五 22:00 截止后在申领人里排序取 6</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>三条硬口径：</strong>① 截止不等于结算，定归属在结算那一步；
        ② 截止后不再收申领，也不改已提交的申领；
        ③ 公布即抢没有截止，所以也没有「待审」这个态。
      </div>
    </div>

    <div id="hs-scope-balance" class="section">
      <div class="section-header">
        <h2>5.7 余额的三条去向与兜底序列</h2>
      </div>
      <p class="doc-p">
        结算完没被占掉的名额，只有三条路可走。<strong>再开一轮</strong>回答「让人自己再来」，
        <strong>兜底序列</strong>回答「没人来怎么办」，<strong>不管</strong>回答「允许留空」。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">去向</th><th style="width: 240px;">怎么走</th><th style="width: 200px;">候选池是谁</th><th>由谁触发</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>再开一轮</strong></td>
            <td>新开一段申领期，同样有开放、截止与结算</td>
            <td>该人群里<strong>还没有任何结果</strong>的人（含从没申领的）</td>
            <td>上一轮结算完成即触发，不看星期几</td>
          </tr>
          <tr>
            <td><strong>兜底序列</strong></td>
            <td>按容器内班次顺序，逐档吃<strong>该时段当天剩余名额</strong></td>
            <td>全部轮次结算后、该人群里仍零结果的人</td>
            <td>最后一轮结算完成后执行一次</td>
          </tr>
          <tr>
            <td><strong>不管</strong></td>
            <td>名额留空，结果页记落空</td>
            <td>—</td>
            <td>配置即生效，不产生动作</td>
          </tr>
        </tbody>
      </table>

      <h4 class="h4sub">兜底序列怎么执行：以「先晚班、再通班」为例</h4>
      <div class="chain">
        <div class="chain-node on">
          <div class="cn-t">早班 6 名额</div>
          <div class="cn-d">8 人申领，审核取前 6，2 人落空</div>
        </div>
        <div class="chain-arrow">→</div>
        <div class="chain-node">
          <div class="cn-t">晚班余 1</div>
          <div class="cn-d">先吃满它，第 1 个落空的人排到晚班</div>
        </div>
        <div class="chain-arrow">→</div>
        <div class="chain-node">
          <div class="cn-t">通班余 2</div>
          <div class="cn-d">晚班满员才进这一档，第 2 个人排到通班</div>
        </div>
        <div class="chain-arrow">→</div>
        <div class="chain-node">
          <div class="cn-t">还满则留待派发</div>
          <div class="cn-d">不突破名额，交给运营处理</div>
        </div>
      </div>
      <div class="note warn-note">
        <strong>逐档要过时间不交叉：</strong>晚班 14–22 的人兜到通班 10–22 会重叠，这一档直接跳过，进下一档。
        兜底只吃已有名额，<strong>不新建时段</strong>——否则会绕过生成节奏与容量。
      </div>
    </div>

    <div id="hs-scope-e2e" class="section">
      <div class="section-header">
        <h2>5.8 端到端：一条早班是怎么排完的</h2>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">时点</th><th style="width: 320px;">发生什么</th><th>记在哪</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>上周四 06:00</strong></td>
            <td>按生成节奏铺出下周 7 天 × 每天 6 个早班名额</td>
            <td>名额实例</td>
          </tr>
          <tr>
            <td><strong>周二 06:00</strong></td>
            <td>第一轮开放，本店全职推拿师可申领；此时不判归属</td>
            <td>申领单·待审</td>
          </tr>
          <tr>
            <td><strong>周五 22:00</strong></td>
            <td>申领截止；在已申领的人里按综合分取前 6，2 人被挤出</td>
            <td>排班结果 6 条 + 申领单状态</td>
          </tr>
          <tr>
            <td><strong>结算完成即</strong></td>
            <td>开第二轮：该人群里还没有结果的人自己再申（含从没申过的）</td>
            <td>新的申领单</td>
          </tr>
          <tr>
            <td><strong>第二轮结算后</strong></td>
            <td>仍零结果的人进兜底序列：先吃晚班余量，晚班满再进通班</td>
            <td>排班结果（来源=兜底）</td>
          </tr>
          <tr>
            <td><strong>兜底后</strong></td>
            <td>还排不上的名额记落空，留待派发</td>
            <td>结果页落空行</td>
          </tr>
        </tbody>
      </table>
      <div class="note lead-note">
        <strong>唯一记录口：</strong>审核通过一条、兜底安排一条，都写<strong>既有排班结果表</strong>。
        不设审核单、不设审批流——「审核」不是节点，是一条结论。
      </div>
    </div>

    <div id="hs-scope-role" class="section">
      <div class="section-header">
        <h2>5.9 四类角色与本期边界</h2>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">角色</th><th style="width: 260px;">职责</th><th>不做什么</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>总部运营</strong></td><td>维护时段模板、获取规则与兜底序列</td><td>不改门店班次名称与时间</td></tr>
          <tr><td><strong>门店管理</strong></td><td>建本店时段、改本店班次名称与时间、挂哪条规则</td><td>不改总部规则里的人群与顺位</td></tr>
          <tr><td><strong>员工</strong></td><td>申领、看我的排班、收通知</td><td>看不到他人申领、看不到内部调度原因</td></tr>
          <tr><td><strong>系统</strong></td><td>按节奏铺名额、到点开关轮、截止结算、兜底</td><td>不猜业务意图，配不出来的就不做</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>本期边界：</strong>结果写进既有表就结束，后续的打卡、工时、加班与算钱都不在这一层。
        这条边界不是省事，是<strong>把「谁占了这个时段」和「占了之后值多少钱」分开</strong>，
        否则任何计薪口径调整都会倒逼排班改结构。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

/* 5.4 对比图：上为现行四行真实取值（一格两行小字），下为 v3 四层横切 */
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
  { t: '获取规则', d: '模式（直派 / 即抢 / 审核）· 轮（开放→截止→结算）· 余额去向' },
  { t: '排班结果', d: '唯一记录口，带「怎么排上的」' }
]
const newPeople = ['全职推拿师', '非全推拿师', '全职客户经理', '非全客户经理']

const tocItems = [
  { id: 'hs-scope', label: '五、需求范围' },
  { id: 'hs-scope-51', label: '5.1 做什么 / 不做什么' },
  { id: 'hs-scope-now', label: '5.2 现行四岗位现状' },
  { id: 'hs-scope-gap', label: '5.3 三个结构性空洞' },
  { id: 'hs-scope-arch', label: '5.4 架构对比：现在 vs v3' },
  { id: 'hs-scope-frame', label: '5.5 重构框架四层' },
  { id: 'hs-scope-mode', label: '5.6 三种模式与轮' },
  { id: 'hs-scope-balance', label: '5.7 余额与兜底序列' },
  { id: 'hs-scope-e2e', label: '5.8 端到端时序' },
  { id: 'hs-scope-role', label: '5.9 角色与边界' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事中心', to: '/docs/hr-schedule' },
  { label: '五、需求范围' }
]
</script>

<style scoped src="./doc-base.css"></style>
