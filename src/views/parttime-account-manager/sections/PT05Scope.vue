<template>
  <DocShell
    :toc-items="tocItems"
    title="五、需求范围"
    subtitle="只做六件事：配需求 → 定时生成 → 事件 / 临时时段 → 移动端承接与打卡 → Web 跟踪 → 交付可被薪酬读取的标准与事实；5.4.2 给出从领任务到收薪的端到端流程"
    version="v1.0"
    date="2026-11-06"
    :breadcrumbs="breadcrumbs"
  >
    <div id="pt-scope-51" class="section">
      <div class="section-header">
        <h2>五、需求范围</h2>
        <DocCopyButton section-id="pt-scope" />
      </div>

      <div class="note lead-note">
        <strong>一句话定位：</strong>门店按「周 × 时段 × 名额」提需求，系统把它变成一个个可承接的任务，
        承接人履约留痕，运营能回溯，薪酬按门店主体读取单价与保底。<strong>只管这一段，不代下游算钱。</strong>
      </div>

      <h3 id="pt-scope-51-1">5.1 做什么 / 不做什么</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 90px;">归属</th><th style="width: 230px;">内容</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>我们做</strong></td>
            <td><strong>排班排假</strong>：按城市、门店、星期、时段、名额维护重复需求</td>
            <td>一条需求是「每周要几个人」，不是具体任务；不再区分长期 / 短期类型，备注不参与选取资格（见 6.1）</td>
          </tr>
          <tr>
            <td><strong>我们做</strong></td>
            <td><strong>定时生成 + 手动发布与任务实例</strong></td>
            <td>每周四 06:00 生成下一批（n+1）即下周六至下下周五共 7 天，上线首周另补一次当周批；运营也可手动发布（全部门店或多选，批次限未来两周，已发布即覆盖）；一个名额 = 一个任务；定时幂等、留快照（见 6.2）</td>
          </tr>
          <tr>
            <td><strong>我们做</strong></td>
            <td><strong>五类临时时段</strong>：取消后重派、请假接班生成、运营发布、任务转移、提前下线补人</td>
            <td>共同原则是<strong>不覆盖原任务</strong>，只追加关联任务与事件；已承接任务的取消与转移都必须可回溯（见 6.3）</td>
          </tr>
          <tr>
            <td><strong>我们做</strong></td>
            <td><strong>移动端承接与打卡</strong></td>
            <td>可选任务先到先得，选择成功即「待到店」；打卡按顺序推进并受 1 小时门禁约束；界面不展示具体打卡时间（见 6.5、6.6）</td>
          </tr>
          <tr>
            <td><strong>我们做</strong></td>
            <td><strong>Web 任务跟踪</strong></td>
            <td>按人员、门店、来源、状态与打卡异常查看当前承接人、实际到离店与完整日志（见 6.4）</td>
          </tr>
          <tr>
            <td><strong>我们做</strong></td>
            <td><strong>收入标准</strong>：三项单价（按人数档 × 客次量档）+ 保底时薪</td>
            <td>只维护标准与解析规则，返回金额与来源层级；<strong>页面不做结算试算</strong>，实际金额由薪酬按事实计算（见 6.7）</td>
          </tr>
          <tr>
            <td><strong>我们不做</strong></td>
            <td>全职排班规则本身</td>
            <td>全职班次怎么排、怎么换班不属本模块；本模块只在请假形成缺岗时<strong>产生接班需求</strong></td>
          </tr>
          <tr>
            <td><strong>我们不做</strong></td>
            <td>人员签约流程与劳动关系管理</td>
            <td>谁是非全客户经理、能服务哪些门店，由人员与合同侧决定，这里只读取</td>
          </tr>
          <tr>
            <td><strong>我们不做</strong></td>
            <td>税费、其他薪酬项目、工资发放</td>
            <td>卫生费等其他收入项由对应薪酬项目提供；按周结薪与发放节奏归薪酬，本模块只保证任务事实与标准可被读取</td>
          </tr>
          <tr>
            <td><strong>本次不做</strong></td>
            <td>移动端违规统计、强制派单、候选人员展示</td>
            <td>违规由后台核查；派单失败留在 Web 由运营处理。<strong>移动端不展示内部调度原因</strong>（见 6.5）</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div id="pt-scope-object" class="section">
      <div class="section-header">
        <h2>5.2 三层业务对象：需求、实例、事件不是一回事</h2>
      </div>
      <p class="doc-p">
        业务不是「配置完就统一派单」，而是三层对象各管一段。<strong>需求是规则，实例是名额，事件是过程</strong>——
        三个层级混着说，就会得出「改需求会改掉已生成任务」这种错误结论。
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 130px;">对象层</th>
            <th style="width: 230px;">它回答什么问题</th>
            <th style="width: 260px;">关键属性</th>
            <th>生命周期</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>时段需求</strong></td>
            <td>门店什么时候需要几个人，或者出现了什么缺口</td>
            <td>城市、门店、星期、时段、名额、生效区间、备注</td>
            <td>建立 → 修改 → 作废；<strong>只影响尚未生成的未来周期</strong></td>
          </tr>
          <tr>
            <td><strong>任务实例</strong></td>
            <td>具体哪一天、哪家店、哪个时段的一个名额</td>
            <td>任务 ID、计划时段快照、来源、批次 / 关联任务 ID、当前承接人</td>
            <td>生成 → 可选 / 派发 → 取消 / 转移 → 完成</td>
          </tr>
          <tr>
            <td><strong>任务事件</strong></td>
            <td>这条任务为什么变成现在的状态</td>
            <td>发生时间、事件类型、操作人或系统、变更前后值</td>
            <td>生成、承接、取消、转移、重派、打卡，<strong>持续追加，不改写历史</strong></td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>三层的关系：</strong>一条需求在每个周期展开成 N 个名额，每个名额是一条任务，每条任务在生命周期里累积若干条事件。
        「一个名额 = 一个任务」是这三层的换算基准——名额满了就是满了，不存在两个人共用一个名额。
      </div>
    </div>

    <div id="pt-scope-source" class="section">
      <div class="section-header">
        <h2>5.3 六类任务来源：需求不会只有一种入口</h2>
      </div>

      <h4 class="h4sub">5.3.1 三条入口，对应六类来源</h4>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">入口</th><th style="width: 210px;">谁触发</th><th style="width: 220px;">产生什么</th><th>时间特征</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>周期时段</strong></td><td>门店排班排假配置</td><td>7 天的可选任务（排班生成）</td><td>每周四 06:00 固定生成，可预期</td></tr>
          <tr><td><strong>业务事件</strong></td><td>全职请假 / 非全取消</td><td>接班任务或重派需求</td><td>事件发生即时产生，不等下一期</td></tr>
          <tr><td><strong>运营临时</strong></td><td>运营线下确认加人</td><td>发布的临时时段（立即生效）</td><td>随时，不要求存在被替换的人</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>为什么入口要分：</strong>入口决定<strong>来源字段</strong>与<strong>承接方式</strong>——周期任务进可选列表让人自己选，
        事件与临时时段进派单；两者在跟踪页必须能分清，否则运营没法回答「这个人是被派的还是自己抢的」。
        入口三项，展开来源是<strong>六类</strong>：转移是入口之外的一种承接变更，提前下线补人是业务事件里「人已经到店、只是没干完」的那一种，各自只换来源字段与承接方式，不重新定义需求。
      </div>

      <h4 class="h4sub">5.3.2 六类来源的差别只有三件事：任务怎么来、怎么承接、原任务还在不在</h4>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 150px;">场景</th>
            <th style="width: 190px;">起点</th>
            <th style="width: 240px;">任务怎么来</th>
            <th style="width: 170px;">怎么承接</th>
            <th>原任务是否存在</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>固定周期任务</strong></td>
            <td>门店已配置重复时段</td>
            <td>周四 06:00 按需求展开（6.2）</td>
            <td>移动端可选，先到先得</td>
            <td>无，首次生成</td>
          </tr>
          <tr>
            <td><strong>全职请假接班</strong></td>
            <td>全职排班中出现请假缺岗</td>
            <td>缺岗按最多 4 小时拆分，生成接班任务（6.3）</td>
            <td>系统派发 / 通知承接</td>
            <td>有全职缺岗关联，但不替换任何非全任务</td>
          </tr>
          <tr>
            <td><strong>非全取消重派</strong></td>
            <td>已承接的非全任务被取消</td>
            <td>同一门店、日期、时段产生重派需求（6.3）</td>
            <td>其他人员承接</td>
            <td>原非全任务保留为<strong>已取消</strong></td>
          </tr>
          <tr>
            <td><strong>运营发布临时时段</strong></td>
            <td>线下确认需要加人</td>
            <td>运营直接发布一个时段需求（6.3）</td>
            <td>按条件派单</td>
            <td>不要求存在被替换的人</td>
          </tr>
          <tr>
            <td><strong>任务转移</strong></td>
            <td>当前承接人无法履约</td>
            <td>不重新定义需求，只变更承接关系（6.3）</td>
            <td>新人员接替</td>
            <td>原任务保留为<strong>已转移</strong></td>
          </tr>
          <tr>
            <td><strong>提前下线补人</strong></td>
            <td>承接人到店后提前离店，剩余时段扣掉通勤仍够门槛</td>
            <td>从离店时刻到计划结束，建一条剩余时段需求（6.1.3、6.3）</td>
            <td>派单：本店非全客户经理 → 本店全职推拿师（最晚签约）</td>
            <td>原任务保留为<strong>已离店</strong>，按实际离店截断结算</td>
          </tr>
        </tbody>
      </table>

      <h4 class="h4sub">5.3.3 判断顺序：门店出现一个待履约时段时，按这个次序定性</h4>
      <ol class="doc-ol">
        <li>是门店已配置的<strong>固定重复需求</strong>吗？→ 排班生成 → 进可选任务 → 客户经理自己选</li>
        <li>是<strong>全职请假</strong>造成的缺岗吗？→ 请假接班生成 → 按段拆分 → 系统派发</li>
        <li>是<strong>已承接任务被取消</strong>吗？→ 取消后重派 → 原任务保留 → 其他人员承接</li>
        <li>是运营<strong>线下确认的临时缺口</strong>吗？→ 运营发布临时时段 → 按条件派单</li>
        <li>是<strong>当前承接人转交</strong>吗？→ 任务转移 → 原任务保留 → 新承接人执行</li>
        <li>是<strong>已经到店的人提前离店</strong>吗？→ 提前下线补人 → 剩余时段扣掉通勤够门槛才补 → 原任务按离店截断</li>
      </ol>
      <div class="note warn-note">
        <strong>顺序不能乱：</strong>同一个时段可能同时满足「周期需求」和「有人取消」，先定性成哪一类，决定的是<strong>来源字段与后续关联关系</strong>。
        定性错了，跟踪页就查不出这条任务是补谁的、从哪来的。
      </div>
    </div>

    <div id="pt-scope-chain" class="section">
      <div class="section-header">
        <h2>5.4 分支流程图：一个时段怎么变成一条任务，再怎么结束</h2>
      </div>
      <p class="doc-p">
        把 5.3 的六类来源画在同一张图上：<strong>第 ① 段回答「任务为什么产生」，第 ② 段是合流点，第 ③ 段回答「谁以什么方式承接」，第 ④ 段回答「承接后怎么结束」</strong>。
        三条入口在「生成任务实例」这一步合流，之后的对象、状态与事件完全一致。
      </p>
      <DocFigure :src="taskBranchImg" title="分支流程 · 一个时段怎么变成一条任务、再怎么结束" note="六类来源 → 生成即快照 → 两种承接 → 四种去向；取消、转移与提前下线都只追加关联任务" default-open />
      <p class="flow-note">
        <strong>读图规则：</strong>取消和转移会生成新的关联任务，但<strong>不会抹掉原任务</strong>；
        用户侧只看得到「可选任务 / 我的任务 / 到店 / 离店」，<strong>来源、批次、关联任务与失败原因</strong>都留在 Web，移动端不解释调度过程。
      </p>
      <p class="flow-note">
        <strong>第 ③ 段还有一个隐藏条件：给谁看。</strong>可选池不是「所有人都看得到」——
        每个时段挂一条<strong>分配策略</strong>，任务继承它，按档位<strong>累计开放</strong>（见 6.1.3）：
        某档的开放起点一到就长期开着，配置了多个角色时<strong>前后档的人都可见可接</strong>（最大范围），不是「换一档关一档」；
        已开放的档也要等到<strong>排班日当天</strong>才接得下来（见 6.1.4）。
        所以图上「承接自选」这一支，实际是「所有已开放档的人群里、在排班日当天，先到先得」。
      </p>

      <h4 class="h4sub">5.4.1 五个阶段：每段统一做什么、什么信息在任何阶段都不许丢</h4>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">阶段</th><th style="width: 300px;">统一处理</th><th>任何阶段都不能丢的信息</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>需求进入</strong></td>
            <td>识别是周期需求、业务事件还是人工临时需求</td>
            <td>来源、触发人 / 触发事件、门店与时段</td>
          </tr>
          <tr>
            <td><strong>任务生成</strong></td>
            <td>把需求拆成一个个名额对应的任务实例，并继承时段上的分配策略</td>
            <td>任务 ID、批次 / 关联 ID、计划时段快照、策略快照</td>
          </tr>
          <tr>
            <td><strong>承接派发</strong></td>
            <td>周期任务进可选列表；接班 / 临时时段任务进派单</td>
            <td>当前承接人、承接方式、承接时间</td>
          </tr>
          <tr>
            <td><strong>任务变更</strong></td>
            <td>取消释放缺口，转移变更承接关系，都不能覆盖原任务</td>
            <td>原任务、后续任务、事件原因</td>
          </tr>
          <tr>
            <td><strong>执行结算</strong></td>
            <td>打卡追加事件，跟踪页汇总，薪酬模块读取已完成任务</td>
            <td>实际到离店时间、实际时长、完整日志</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>怎么用这张表：</strong>评审时逐阶段问「这一列的信息在不在」——缺任何一项，后面的阶段就只能靠猜。
        字段级清单（十个对象、每项必填）见 <router-link to="/docs/parttime-account-manager/6-8">6.8 权限与数据契约</router-link>，此处不重复列字段。
      </div>

      <h4 class="h4sub">5.4.2 端到端全流程：从领任务到收到薪酬</h4>
      <p class="doc-p">
        把 5.4 的任务链路接到 6.7.5 的薪酬看板，就是一名非全客户经理的完整闭环：
        <strong>领任务 → 打卡 → 完成每日任务 → 日统计当天出数 → 按周结算 → 确认工资 → 按发放策略到账</strong>。
        领任务分两条路（周期任务自己选、补充型临时任务走派单），之后的打卡、计薪、结算与发放完全一致。
      </p>
      <DocFigure :src="payFlowImg" title="非全客户经理 · 从领任务到收到薪酬全流程" note="两条来源 → 打卡计薪 → 按周结算 → 工资确认 → 按发放策略到账" default-open />

      <h4 class="h4sub">发放策略：按结算周所在日期段定计算日与发放日</h4>
      <table class="data-table">
        <thead>
          <tr><th style="width: 200px;">结算周日期段</th><th style="width: 180px;">计算日</th><th>发放日</th></tr>
        </thead>
        <tbody>
          <tr><td>1 – 7 日</td><td>当月 9 日</td><td>当月 16 日</td></tr>
          <tr><td>8 – 14 日</td><td>当月 16 日</td><td>当月 23 日</td></tr>
          <tr><td>15 – 21 日</td><td>当月 22 日</td><td>次月 2 日</td></tr>
          <tr><td>22 日 – 月末</td><td>次月 3 日</td><td>次月 9 日</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>对照示例（2026-11）：</strong>11 月第 1 周（1 – 7 日）目前正在执行，预计 11 月 9 日计算、11 月 16 日发放；
        10 月第 3 周（15 – 21 日）按 11 月 2 日发放、第 4 周（22 – 31 日）按 11 月 9 日发放。
        计算日先出工资单并推<strong>工资确认通知</strong>（一条 = 一个结算主体 × 一个结算周，内容与确认动作见 6.7.6），发放日只对<strong>已确认的工作单</strong>出款；各周按各自策略发放，<strong>互不等待</strong>。
      </div>
      <div class="note warn-note">
        <strong>边界：</strong>本模块只负责把<strong>事实与标准</strong>交付到「可计薪」（任务、打卡、单价与保底配置），
        结算、确认通知与发放由薪酬侧执行；此处的全流程图用于交代「钱怎么到员工手里」，各环节的实现不在本模块。
      </div>
    </div>

    <div id="pt-scope-role" class="section">
      <div class="section-header">
        <h2>5.5 四类角色各管一段</h2>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">角色</th><th style="width: 240px;">职责</th><th>不做什么</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>运营 / 门店管理</strong></td><td>配需求、看发布结果、处理派不出去的临时时段、在跟踪页核对异常</td><td>不覆盖历史事件与已完成打卡，不能绕过需求规则直接改已生成任务</td></tr>
          <tr><td><strong>非全客户经理</strong></td><td>选任务、取消、转移、到店、离店</td><td>看不到他人信息、违规统计、强制派单与内部来源关系</td></tr>
          <tr><td><strong>管理人员</strong></td><td>查看全量任务与配置，按权限维护收入标准与处理异常</td><td>不能改写承接关系，也不能改写已完成结算引用的配置版本</td></tr>
          <tr><td><strong>系统调度</strong></td><td>定时生成、名额占用、取消后重派、请假接班拆段</td><td>不作为用户身份出现在移动端；失败不硬塞，留在待派发</td></tr>
        </tbody>
      </table>
    </div>

    <div id="pt-scope-rules" class="section">
      <div class="section-header">
        <h2>5.6 全流程不变式：八条判定标准</h2>
      </div>
      <p class="doc-p">
        下面八条不是某个页面的做法，而是<strong>判定对错的标准</strong>：任何一章的设计与此冲突，改章不改约定。
        每条只写一句口径，细节落在对应功能章。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">约定</th><th>一句话口径</th><th style="width: 120px;">详见</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>生成存快照</strong></td>
            <td>改需求、改配置都不回流到已生成任务；任务带着生成那一刻的门店、时段与名额</td>
            <td>6.2、6.1</td>
          </tr>
          <tr>
            <td><strong>变更只追加</strong></td>
            <td>取消、转移、重派都追加事件与关联任务，原任务与关联 ID 永久保留</td>
            <td>6.3、6.4</td>
          </tr>
          <tr>
            <td><strong>按门店归集</strong></td>
            <td>收入按人员 × 门店归集，1 门店 = 1 结算主体，不跨店合并保底</td>
            <td>6.7</td>
          </tr>
          <tr>
            <td><strong>定时发布周期</strong></td>
            <td>每周四 06:00 生成下一批（n+1）即下周六至下下周五共 7 天；上线首周另补一次当周批；同一周期幂等执行，重跑不重复生成</td>
            <td>6.2</td>
          </tr>
          <tr>
            <td><strong>名额独占</strong></td>
            <td>一个名额对应一个任务实例，同一名额不能被两人同时承接</td>
            <td>6.2、6.5</td>
          </tr>
          <tr>
            <td><strong>配置生效边界</strong></td>
            <td>作废或修改只影响尚未生成的未来周期，已生成任务用快照</td>
            <td>6.1、6.2</td>
          </tr>
          <tr>
            <td><strong>用户侧展示边界</strong></td>
            <td>移动端只展示本人任务、状态与可执行动作，不展示内部调度原因与他人信息</td>
            <td>6.5、6.6</td>
          </tr>
          <tr>
            <td><strong>打卡顺序与门禁</strong></td>
            <td>开始前 1 小时进入到店窗口；到店成功后才能离店；实际时间在 Web 留存</td>
            <td>6.6</td>
          </tr>
        </tbody>
      </table>
      <div class="note lead-note">
        <strong>请假接班拆段</strong>也属不变式，但它的边界（每段 ≤ 4 小时与单日累计 ≤ 4 小时是否并存）尚待运营拍板，
        暂按现状写在 6.3 并挂到 <router-link to="/docs/parttime-account-manager/appendix">七、附录</router-link>，不在此固化。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'
import DocFigure from '../../../docs/components/DocFigure.vue'
import payFlowImg from '../../../docs/assets/diagrams/parttime-pay-full-flow.svg'
import taskBranchImg from '../../../docs/assets/diagrams/parttime-task-branch.svg'

const tocItems = [
  { id: 'pt-scope-51', label: '五、需求范围' },
  { id: 'pt-scope-51-1', label: '5.1 做什么 / 不做什么' },
  { id: 'pt-scope-object', label: '5.2 三层业务对象' },
  { id: 'pt-scope-source', label: '5.3 六类任务来源' },
  { id: 'pt-scope-chain', label: '5.4 分支图与全流程' },
  { id: 'pt-scope-role', label: '5.5 四类角色' },
  { id: 'pt-scope-rules', label: '5.6 全流程不变式' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '非全客户经理', to: '/docs/parttime-account-manager' },
  { label: '五、需求范围' }
]
</script>

<style scoped src="./doc-base.css"></style>
