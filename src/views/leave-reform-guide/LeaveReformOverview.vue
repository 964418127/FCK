<template>
  <DocShell
    :toc-items="tocItems"
    title="假勤重构 · 产品需求说明"
    subtitle="假勤只负责「谁在哪段时间被占了、这段占用合不合规」。事实只出一次、状态一变主动通知；钱怎么算、社保怎么处理，都是下游自己的活。"
    version="v1.0"
    date="2026-10-22"
    :breadcrumbs="breadcrumbs"
  >
    <!-- ========== 一、版本信息 ========== -->
    <div id="lr-version" class="section">
      <div class="section-header">
        <h2>一、版本信息</h2>
        <DocCopyButton section-id="lr-version" />
      </div>
      <div class="ver-cards">
        <div class="ver-card">
          <el-icon><CollectionTag /></el-icon>
          <div><div class="vc-k">当前版本号</div><div class="vc-v">v1.0</div></div>
        </div>
        <div class="ver-card">
          <el-icon><Calendar /></el-icon>
          <div><div class="vc-k">创建日期</div><div class="vc-v">2026-10-22</div></div>
        </div>
        <div class="ver-card">
          <el-icon><User /></el-icon>
          <div><div class="vc-k">负责人</div><div class="vc-v">Lacus7</div></div>
        </div>
      </div>
    </div>

    <!-- ========== 二、变更日志 ========== -->
    <div id="lr-changelog" class="section">
      <div class="section-header">
        <h2>二、变更日志</h2>
        <DocCopyButton section-id="lr-changelog" />
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 120px;">日期</th>
            <th style="width: 90px;">版本</th>
            <th>变更</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>2026-10-22</td>
            <td>v1.0</td>
            <td>首次成稿：需求背景、需求范围（边界与周边系统 / 内部各模块 / 请假全链路）、功能详细说明（9 节，含功能入口）、待决事项（17 项）。</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ========== 三、文档说明 ========== -->
    <div id="lr-notes" class="section">
      <div class="section-header">
        <h2>三、文档说明</h2>
        <DocCopyButton section-id="lr-notes" />
      </div>

      <h3>名词解释</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 210px;">名词</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>假勤</td><td>占用与合规判定域：只管「谁在哪段时间被占了、这段占用合不合规」，出事实与结论；不出金额、不定班次、不管社保处置。</td></tr>
          <tr><td>假期类型（假种）</td><td>定性层：这个假「是什么」——类别（法定 / 公司）、是否排他、启用状态、适用岗位（全岗位 / 指定岗位）。</td></tr>
          <tr><td>假期额度方案</td><td>定值层：这个假「有多少」——四档计量（周期发放 / 周期上限 / 按次上限 / 按需）+ 标准值 + 差异化条目。</td></tr>
          <tr><td>出勤方案</td><td>日历口径：哪天默认该上班（周基础模式 + 法定节假日解读 + 特殊日）；不是班次计划，不生成名额。</td></tr>
          <tr><td>岗位假勤方案</td><td>枢纽：岗位 × 四类配置（字典 / 额度 / 审核 / 出勤）的装配点，自己不定任何值。</td></tr>
          <tr><td>考勤组</td><td>比对口径配置：比几层、比哪些；计划层基准是出勤方案，实际层事实来自打卡。</td></tr>
          <tr><td>缺岗信号</td><td>请假通过后系统产出的缺人事实（日期 / 门店 / 岗位 / 班次段 / 缺人数），交付排班调度，不是申请人填的字段。</td></tr>
          <tr><td>占位事件</td><td>假勤写入「员工时间线」业务事件层的排他占位，用于冲突读取与全局时间视图。</td></tr>
          <tr><td>长假结论</td><td>连续时长超过阈值的假种综合结论，供新员工关系系统处置社保公积金个人部分。</td></tr>
          <tr><td>差异化条目</td><td>按城市 / 门店覆盖标准值的条目，只改数值；门店优先、命中即停；岗位不参与差异化。</td></tr>
          <tr><td>或签</td><td>同一审批节点配置多人，任一人处理即可流转到下一节点。</td></tr>
          <tr><td>排班排假</td><td>现有系统：班次计划与名额的 owner；假勤的出勤方案对它是约束输入。</td></tr>
          <tr><td>员工时间线</td><td>统一时间管理体系：用工基线 → 排班 / 考勤组 → 业务事件层 → 外部事件层 → 记录层；假勤占位事件写入业务事件层。</td></tr>
          <tr><td>新员工关系系统</td><td>接收长假结论处置社保公积金个人部分；靠「是否考勤 / 是否有订单」排查异常员工，缺假期输入会误判。</td></tr>
        </tbody>
      </table>

      <h3>字段字典</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 190px;">字段</th>
            <th style="width: 240px;">位置</th>
            <th>口径</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>计量方式</strong></td><td>假期额度方案</td><td>四选一：周期发放（预发、可按剩余额度比例结转）/ 周期上限（不预发、封顶，系统折算）/ 按次上限（不预发、每次封顶 + 有效期）/ 按需（不设值，如病假按医疗期核定）。</td></tr>
          <tr><td><strong>额度来源</strong></td><td>假期类型字典</td><td>方案定值 / 系统折算两种；系统折算读方案库的周期上限（如临时假 16 时/月），历史存量不在本系统处理。</td></tr>
          <tr><td><strong>适用性</strong></td><td>假期类型字典</td><td>全岗位 / 指定岗位清单；决定移动端申请页能不能看到这个假种。</td></tr>
          <tr><td><strong>是否排他</strong></td><td>假期类型字典</td><td>写入员工时间线业务事件层时的排他占位声明。</td></tr>
          <tr><td><strong>凭证要求</strong></td><td>假期审核规则</td><td>枚举多选：医疗诊断证明 / 结婚证 / 出生证明 / 生育相关证明 / 其他；不勾选 = 无需凭证。丧假不设凭证（死亡证明无法事先取得）。</td></tr>
          <tr><td><strong>提前申请期</strong></td><td>假期审核规则</td><td>单位天；0 = 无要求，界面不显示该行（病假事出突然，不体现「提前 N 天」）。</td></tr>
          <tr><td><strong>审核方式</strong></td><td>假期审核规则</td><td>自动 / 人工；自动审核单据不进审批列表。</td></tr>
          <tr><td><strong>差异化条目</strong></td><td>假期额度方案 · 假期审核规则</td><td>仅城市 / 门店，只改数值；门店优先、命中即停；岗位不参与差异化。</td></tr>
          <tr><td><strong>结转下期</strong></td><td>假期额度方案</td><td>周期发放 / 周期上限可配：期末剩余额度 × 比例带入下一周期（0 = 不结转、100 = 全额结转）；与本期发放或折算合计后受「获取上限」封顶。按次上限 / 按需不结转。</td></tr>
          <tr><td><strong>补缺路径</strong></td><td>岗位假勤方案</td><td>接班任务 / 改班次 / 无缺岗 三选一；决定请假生效后缺岗信号的去向。</td></tr>
          <tr><td><strong>扣减记录</strong></td><td>移动端休假记录</td><td>通过的额度段逐条落在方案上，「已用」由记录自动汇总。</td></tr>
        </tbody>
      </table>
    </div>

    <!-- ========== 四、需求背景 ========== -->
    <div id="lr-bg" class="section">
      <div class="section-header">
        <h2>四、需求背景</h2>
        <DocCopyButton section-id="lr-bg" />
      </div>

      <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary)); margin-bottom: 14px;">
        <strong>一句话现状：</strong>当前的请假能力<strong>各自分离</strong>——班次假、临时假、特殊情况请假各管一段，谁请的、为什么请、请多久，没有一处能给出完整结论。
      </div>

      <div class="lr-key-point">
        <div class="kp-tag">最要紧的一件事</div>
        <div class="kp-title">员工请了长假，周边系统全部「失明」</div>
        <p class="doc-p" style="margin: 0;">
          员工通过「特殊情况请假」离岗，请假系统里只有一条孤立的记录——<strong>为什么请、是不是无薪长假、预计到什么时候</strong>，都没有结论，也不会通知任何人。
          于是<strong>新员工关系系统不知道该不该继续缴社保公积金</strong>，<strong>薪酬不知道这段时间该怎么算</strong>——根因就是缺一个统一的「假期事实 + 长假结论」出口。
        </p>
      </div>

      <div class="lr-impact">
        <div class="lr-impact-card">
          <div class="ip-sys">新员工关系系统</div>
          <div class="ip-body">不清楚员工状态，社保、公积金续缴与停缴没有判断依据。而且它的主动排查靠「是否考勤、是否有订单」自动判定——<strong>假期不是输入条件</strong>，请长假的人会被误判为异常，排查结果不可信。</div>
        </div>
        <div class="lr-impact-card">
          <div class="ip-sys">薪酬</div>
          <div class="ip-body">无法准确计算工资，只能按「<strong>是否有订单 + 扣款</strong>」做基础计算；长假期间算不算缺勤、按什么口径折算，没有上游结论可依。</div>
        </div>
        <div class="lr-impact-card">
          <div class="ip-sys">社保 / 公积金</div>
          <div class="ip-body">个人部分扣缴、公司部分处理方式没有上游结论可依，只能挂账等待。</div>
        </div>
      </div>

      <div class="note">
        <strong>本方案要补的就是这个出口：</strong>假勤统一出事实与结论，状态一变<strong>主动通知</strong>周边系统，让社保、公积金、薪酬第一时间知道这个人处于什么状态、该怎么处理。
      </div>
    </div>

    <!-- ========== 五、需求范围 ========== -->
    <div id="lr-scope" class="section">
      <div class="section-header">
        <h2>五、需求范围</h2>
        <DocCopyButton section-id="lr-scope" />
      </div>
      <p class="doc-p">核心就两个方面：对外，<strong>划清假勤系统的边界、定死与周边系统的关系</strong>；对内，<strong>理清各模块之间的关系</strong>。</p>

      <!-- 5.1 边界与周边系统关系 -->
      <div class="card" id="lr-scope-boundary">
        <h3>5.1 假勤系统的边界 · 与周边系统的关系</h3>
        <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 1px solid hsl(var(--primary)); margin-bottom: 14px; font-size: 13px;">
          <strong>边界一句话：</strong>假勤只管「<strong>谁被占了 + 占得合不合规</strong>」，出事实与结论；<strong>不出金额、不定班次、不管社保处置</strong>。状态一变主动通知，谁订阅谁消费。
        </div>

        <p class="doc-p" style="margin-bottom: 10px;">
          按<strong>假勤内部模块</strong>逐个列出关联系统，<strong>以下清单已逐项确认</strong>。逐系统契约与时序细节在后文功能详细说明中展开。
        </p>

        <div class="lr-cf">
          <div class="lr-cf-row">
            <div class="lr-cf-mod">出勤方案</div>
            <div class="lr-cf-line"></div>
            <div class="lr-cf-chips">
              <span class="lr-chip green">排班排假 <span class="dim">（我方方案 = 它的约束输入）</span></span>
            </div>
          </div>
          <div class="lr-cf-row">
            <div class="lr-cf-mod">请假执行<br/>假期生效</div>
            <div class="lr-cf-line"></div>
            <div class="lr-cf-chips">
              <span class="lr-chip green">员工时间线 <span class="dim">（写入占位 / 读取冲突）</span></span>
              <span class="lr-chip green">排班排假 <span class="dim">（缺岗信号）</span></span>
              <span class="lr-chip green">薪酬 <span class="dim">（缺勤事实）</span></span>
              <span class="lr-chip green">订单 / 预约 <span class="dim">（改派取消）</span></span>
              <span class="lr-chip green">消息中心 <span class="dim">（提醒）</span></span>
            </div>
          </div>
          <div class="lr-cf-row">
            <div class="lr-cf-mod">长假</div>
            <div class="lr-cf-line"></div>
            <div class="lr-cf-chips">
              <span class="lr-chip green">新员工关系系统 <span class="dim">（长假结论 → 社保公积金个人部分处置）</span></span>
            </div>
          </div>
          <div class="lr-cf-row">
            <div class="lr-cf-mod">考勤比对</div>
            <div class="lr-cf-line"></div>
            <div class="lr-cf-chips">
              <span class="lr-chip green">考勤组 <span class="dim">（实际层事实）</span></span>
              <span class="lr-chip green">排班排假 <span class="dim">（计划层，只读）</span></span>
            </div>
          </div>
          <div class="lr-cf-row">
            <div class="lr-cf-mod">离职联动</div>
            <div class="lr-cf-line"></div>
            <div class="lr-cf-chips">
              <span class="lr-chip green">离职流程 <span class="dim">（状态生效 → 取消班次 / 截断接单）</span></span>
              <span class="lr-chip green">新员工关系系统 <span class="dim">（员工离职时间，日期锁定时、不经假勤）</span></span>
            </div>
          </div>
          <div class="lr-cf-row">
            <div class="lr-cf-mod">假期类型字典</div>
            <div class="lr-cf-line"></div>
            <div class="lr-cf-chips">
              <span class="lr-chip green">模块化薪酬 <span class="dim">（带薪性 / 比例按假种映射）</span></span>
            </div>
          </div>
        </div>

        <div class="note" style="margin-top: 10px;">
          <strong>关于「员工时间线」：</strong>它是统一时间管理体系——时间轴<strong>核心唯一</strong>，自上而下分层：用工基线（合同工时 / 法定工时，加班延时额外）→ 排班 / 考勤组（基础排班 + 例外排班）→ 业务事件层（订单 · 会议 · 培训 · 调薪 · 弹性事假 · 日程…，按类型特点生成）→ 外部事件层（合作 · 培训 · 学习认证 · 面试）→ 记录层。假勤的<strong>排他占位事件写入业务事件层</strong>；长假结论、特殊状态事件落在记录层。
        </div>
      </div>

      <!-- 5.1b 范围声明：调休 / 补休 -->
      <div class="lr-decl">
        <span class="lr-decl-tag">范围声明</span>
        <span class="lr-decl-body">
          本期<strong>不含「调休 / 补休」</strong>两类假种，已暂时移出假期类型字典。原因：这两类假的额度来自<strong>加班折算</strong>，要接进来前提是先有<strong>「加班申请」模块</strong>——加班事实从哪来、折算规则归谁定，都挂在它身上。本期边界内没有加班模块，所以先不收；后续若立项「加班申请」，这两个假种再随它一起加回。
        </span>
      </div>

      <!-- 5.1c 缺口声明：移动端假期审批 -->
      <div class="lr-decl">
        <span class="lr-decl-tag">缺口声明</span>
        <span class="lr-decl-body">
          移动端现状<strong>只有员工侧的申请与记录</strong>，缺<strong>「假期审批」</strong>——审核规则里配的「人工审批」没有任何处理端，规则落不了地（自动审核不需要人，人工审批必须有入口）。本期由<strong>人事 / 总部（架构上游）</strong>补审批处理端：待审列表 → 单据详情（申请信息 + 余额与扣减试算 + 命中的审核规则）→ 通过 / 驳回（驳回必填原因）。另有一处缺口：申请侧身份目前只覆盖门店岗（推拿师 / 客户经理），<strong>总部岗位没有申请身份</strong>，本期一并补齐。
        </span>
      </div>

      <!-- 5.2 内部模块关系 -->
      <div class="card" id="lr-scope-modules">
        <h3>5.2 假勤系统内部各模块的关系</h3>
        <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 1px solid hsl(var(--primary)); margin-bottom: 14px; font-size: 13px;">
          <strong>一句话：</strong>数据<strong>单向流动</strong>——配置 → 枢纽 → 只读消费，<strong>不存在结果页反写配置的路径</strong>。下面按三层自上而下看。
        </div>

        <div class="lr-layers">
          <!-- 第一层：配置层 -->
          <div class="lr-layer">
            <div class="lr-layer-head">
              <span class="lh-name">配置层</span>
              <span class="lh-desc">把「假是什么 / 有多少 / 怎么批 / 哪天该上班」分四处定清楚，互相不越界</span>
            </div>
            <div class="lr-layer-cards cols-4">
              <div class="lr-mod-card">
                <div class="mc-name">假期类型字典</div>
                <div class="mc-role">定性 · 这个假种「是什么」</div>
                <div class="mc-line">→ 额度方案 / 审核规则按假种引用</div>
                <div class="mc-line">→ 模块化薪酬：带薪性 / 比例映射</div>
                <div class="mc-no">不做：额度值 / 单位 / 凭证 / 带薪</div>
              </div>
              <div class="lr-mod-card">
                <div class="mc-name">假期额度方案</div>
                <div class="mc-role">定值 · 这个假种「有多少」</div>
                <div class="mc-line">→ 挂到岗位假勤方案</div>
                <div class="mc-line">→ 假期盘点：余额只读</div>
                <div class="mc-no">不做：审批流程、日历口径</div>
              </div>
              <div class="lr-mod-card">
                <div class="mc-name">假期审核规则</div>
                <div class="mc-role">定流程 · 这个假种「怎么批」</div>
                <div class="mc-line">→ 挂到岗位假勤方案</div>
                <div class="mc-line">→ 与岗位审批方式取严合并</div>
                <div class="mc-no">不做：额度值（值与流程分离）</div>
              </div>
              <div class="lr-mod-card">
                <div class="mc-name">出勤方案</div>
                <div class="mc-role">定日历 · 哪天默认该上班</div>
                <div class="mc-line">→ 排班排假：约束输入</div>
                <div class="mc-line">→ 考勤比对：计划基准</div>
                <div class="mc-no">不做：排班 / 班次 / 名额</div>
              </div>
            </div>
          </div>

          <div class="lr-flow-arrow"><span>四个配置页按岗位挂接</span></div>

          <!-- 第二层：枢纽层 -->
          <div class="lr-layer">
            <div class="lr-layer-head">
              <span class="lh-name">枢纽层</span>
              <span class="lh-desc">岗位 × 四类配置的装配点</span>
            </div>
            <div class="lr-hub-card">
              <div class="hub-main">
                <div class="hub-name">岗位假勤方案</div>
                <div class="hub-role">枢纽 · 上游四个配置页，下游全部只读页 + 请假执行</div>
              </div>
              <div class="hub-chips">
                <span class="lr-chip blue">引用 · 字典 / 额度 / 审核 / 出勤</span>
                <span class="lr-chip green">交付 · 只读页 + 请假执行</span>
                <span class="lr-chip gray">不做 · 自己不定任何值（岗位侧只读，由方案反查）</span>
              </div>
            </div>
          </div>

          <div class="lr-flow-arrow"><span>只读消费 · 不反写</span></div>

          <!-- 第三层：消费层 -->
          <div class="lr-layer">
            <div class="lr-layer-head">
              <span class="lh-name">消费层</span>
              <span class="lh-desc">只读呈现与比对，不回改任何配置</span>
            </div>
            <div class="lr-layer-cards cols-3">
              <div class="lr-mod-card">
                <div class="mc-name">假期盘点</div>
                <div class="mc-role">只读 · 余额与明细</div>
                <div class="mc-line">← 字典系统折算合成 + 额度方案解档</div>
                <div class="mc-no">不做：改任何配置与余额</div>
              </div>
              <div class="lr-mod-card">
                <div class="mc-name">考勤组</div>
                <div class="mc-role">定口径 · 比几层、比哪些</div>
                <div class="mc-line">← 出勤方案（计划层）+ 排班排假 + 考勤组（实际层事实）</div>
                <div class="mc-line">→ 异常事实交付薪酬</div>
                <div class="mc-no">不做：异常的后续处置</div>
              </div>
              <div class="lr-mod-card">
                <div class="mc-name">岗位列表</div>
                <div class="mc-role">只读 · 岗位主数据</div>
                <div class="mc-line">→ 全部配置页「适用岗位」唯一数据源</div>
                <div class="mc-no">不做：维护任何假勤属性</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 5.3 请假全链路 -->
      <div class="card" id="lr-scope-chain">
        <h3>5.3 请假全链路</h3>
        <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 1px solid hsl(var(--primary)); margin-bottom: 14px; font-size: 13px;">
          <strong>一句话：</strong>配置装配生效 → 员工申请 → 合规判定与审批 → 休假生效扣减 → 状态一变主动通知。下面按发生顺序自上而下走一遍。
        </div>

        <div class="lr-chain">
          <div class="lr-step">
            <div class="step-no">1</div>
            <div class="lr-step-main">
              <div class="lr-step-title">配置就绪</div>
              <div class="lr-step-body">假期类型<strong>定性</strong> → 额度方案<strong>定值</strong> → 审核规则<strong>定流程</strong> → 出勤方案<strong>定日历</strong>；四类配置在「岗位假勤方案」按岗位装配生效，岗位自己不定任何值。</div>
            </div>
          </div>
          <div class="lr-step">
            <div class="step-no">2</div>
            <div class="lr-step-main">
              <div class="lr-step-title">员工申请</div>
              <div class="lr-step-body">移动端只展示<strong>该岗位适用的假种</strong>；选完假种立即看到当前余额（额度型给「X 天/周期」，按需型提示按需申请）；再按假种口径填写休假字段（班次假选班次、时段假填起止、按次假限天数）。</div>
            </div>
          </div>
          <div class="lr-step">
            <div class="step-no">3</div>
            <div class="lr-step-main">
              <div class="lr-step-title">合规判定</div>
              <div class="lr-step-body">命中该假种的审核规则：<strong>凭证校验</strong>（无凭证要求的类型直接跳过）→ <strong>提前申请期校验</strong>（无要求的不校验、界面也不显示）→ <strong>自动审核直接生效</strong> / 人工审批进入审批流。</div>
            </div>
          </div>
          <div class="lr-step">
            <div class="step-no">4</div>
            <div class="lr-step-main">
              <div class="lr-step-title">审批流转</div>
              <div class="lr-step-body">门店岗按<strong>岗类分流</strong>：推拿师、客户经理各自对应 1 级人事节点；总部按<strong>部门设置的审批人</strong>审批，允许多级、同节点可配置多人<strong>或签</strong>（任一人处理即流转）。驳回必填原因。</div>
            </div>
          </div>
          <div class="lr-step">
            <div class="step-no">5</div>
            <div class="lr-step-main">
              <div class="lr-step-title">休假生效</div>
              <div class="lr-step-body">三件事同时发生：<strong>额度扣减</strong>（逐段落在方案上，「已用」由记录自动汇总）· <strong>排他占位事件写入员工时间线</strong>业务事件层（供冲突读取与全局时间视图）· <strong>缺岗信号交付排班调度</strong>（日期 / 门店 / 岗位 / 班次段 / 缺人数）。</div>
            </div>
          </div>
          <div class="lr-step">
            <div class="step-no">6</div>
            <div class="lr-step-main">
              <div class="lr-step-title">主动通知</div>
              <div class="lr-step-body">状态一变主动通知订阅方：<strong>薪酬</strong>（缺勤事实，怎么折算它自己算）· <strong>消息中心</strong>（员工与审批人提醒）· <strong>订单 / 预约</strong>（改派取消）。假勤只出事实，不代下游计算。</div>
            </div>
          </div>
          <div class="lr-step">
            <div class="step-no">7</div>
            <div class="lr-step-main">
              <div class="lr-step-title">长假结论</div>
              <div class="lr-step-body">连续时长超过阈值的假种，出<strong>长假综合结论</strong>交新员工关系系统——它据此处置社保公积金个人部分；没有这个输入，它靠「是否考勤 / 是否有订单」排查会把长假员工误判为异常。</div>
            </div>
          </div>
          <div class="lr-step">
            <div class="step-no">8</div>
            <div class="lr-step-main">
              <div class="lr-step-title">离职联动</div>
              <div class="lr-step-body">员工离职时间由<strong>离职流程在日期锁定时直接通知新员工关系系统</strong>（迎新触达终止 / 转离职关怀），不经假勤；离职生效后假勤侧取消后续班次、截断接单。</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== 六、功能详细说明 ========== -->
    <div id="lr-func" class="section">
      <div class="section-header">
        <h2>六、功能详细说明</h2>
        <DocCopyButton section-id="lr-func" />
      </div>
      <p class="doc-p">本章按功能块逐节说明；每节开头的「功能入口」对应可走查的原型页面。</p>

      <!-- ===== 6.1 假期类型 ===== -->
      <div id="lr-func-1" class="subsection">
        <div class="section-header">
          <h3>6.1 假期类型</h3>
          <DocCopyButton section-id="lr-func-1" />
        </div>
        <div class="func-entry"><strong>功能入口：</strong>Web 后台 → 假勤管理 → <strong>假期类型</strong>（<code>/leave-type-dictionary</code>）</div>
        <DocScreens
          :images="[
            { src: typeDictShot, label: '假期类型字典：只定性（类别 / 排他 / 启用 / 适用性），额度与凭证在别处' }
          ]"
        />

        <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary)); margin-bottom: 16px;">
          <strong>一句话定位：</strong>字典只做<strong>定性</strong>——这个假种「是什么」。类别、是否排他、启用状态、适用性；<strong>有多少（额度）、怎么批（审核）、带不带薪（薪酬）都不在这里</strong>。
        </div>

        <p class="doc-p">
          现状是假种口径<strong>散落在各处</strong>：有的挂在班次规则里、有的写在临时假说明里，谁适用、谁排他，没有一处统一答案。
          本次收敛为<strong>一份假种字典</strong>：全系统唯一一份「假是什么」的定义，额度方案、审核规则、移动端申请页都从这里取。
        </p>

        <h4 class="h4sub">字典管什么</h4>
        <table class="data-table">
          <thead>
            <tr><th style="width: 120px;">维度</th><th style="width: 220px;">取值</th><th>说明</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>类别</strong></td><td>法定 / 公司</td><td>法定假种（婚假、产假等）口径跟随法规；公司假种（事假等）口径公司自定</td></tr>
            <tr><td><strong>是否排他</strong></td><td>是 / 否</td><td>写入员工时间线时的占位声明：排他占位期间不接受其他业务占用</td></tr>
            <tr><td><strong>启用状态</strong></td><td>启用 / 停用</td><td>停用的假种不再出现在任何配置页与申请页</td></tr>
            <tr><td><strong>适用性</strong></td><td>全岗位 / 指定岗位</td><td>指定岗位需勾选岗位清单；决定移动端申请页能不能看到这个假种</td></tr>
            <tr><td><strong>额度来源</strong></td><td>方案定值 / 系统折算</td><td>方案定值 = 值在假期额度方案里配；系统折算 = 读方案库的周期上限（如临时假 16 时/月），历史已折算的存量不在本系统处理</td></tr>
          </tbody>
        </table>

        <div class="note">
          <strong>不做什么：</strong>额度值、单位、凭证要求、带薪比例都不在字典——分别在假期额度方案、假期审核规则、模块化薪酬（带薪性 / 比例按假种映射，<strong>假种不持有薪酬口径</strong>，假勤只交付「时长 + 假种」）。调休 / 补休本期移出字典，原因见第 5 章范围声明与待决 8.14。
        </div>
      </div>

      <!-- ===== 6.2 假期额度方案 ===== -->
      <div id="lr-func-2" class="subsection">
        <div class="section-header">
          <h3>6.2 假期额度方案</h3>
          <DocCopyButton section-id="lr-func-2" />
        </div>
        <div class="func-entry"><strong>功能入口：</strong>Web 后台 → 假勤管理 → <strong>假期额度方案</strong>（<code>/leave-wm-quota</code>）</div>

        <DocScreens
          :images="[
            { src: quotaListShot, label: '方案库：每个假种一份方案（标准值 / 差异化 / 结转一眼可见）' },
            { src: quotaDrawerShot, label: '方案配置抽屉（以年假为例：计量方式 / 结转比例 / 获取上限 / 差异化条目）' }
          ]"
        />

        <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary)); margin-bottom: 16px;">
          <strong>一句话定位：</strong>定值层——这个假种「有多少」。方案三块独立：<strong>适用岗位 + 标准值 + 差异化条目</strong>；计量方式四选一。
        </div>

        <h4 class="h4sub">计量四档</h4>
        <table class="data-table">
          <thead>
            <tr><th style="width: 110px;">计量档</th><th style="width: 300px;">发放方式</th><th>典型假种</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>周期发放</strong></td><td>按周期预发，可按「期末剩余 × 比例」结转下期</td><td>年假等可预发的假种</td></tr>
            <tr><td><strong>周期上限</strong></td><td>不预发、封顶控制；由系统按假种逐期折算合成余额。上限同样支持按城市 / 门店差异化</td><td>临时假（16 时/月）、特殊情况请假（兜底通道）</td></tr>
            <tr><td><strong>按次上限</strong></td><td>不预发；每次申请封顶，并限定自事件起的有效期</td><td>婚假（一次性、限期使用）</td></tr>
            <tr><td><strong>按需</strong></td><td>不设额度值，按需申请、按规则核定</td><td>病假（按医疗期核定）</td></tr>
          </tbody>
        </table>

        <h4 class="h4sub">方案的三块结构</h4>
        <ul class="lr-list">
          <li>
            <strong>适用岗位：</strong>勾选岗位清单。岗位侧不再单独维护假种清单，由方案反查——岗位决定「<strong>有没有</strong>」这个假。
          </li>
          <li>
            <strong>标准值：</strong>该假种的统一额度口径；按需档无标准值，界面显示「按需」。
          </li>
          <li>
            <strong>差异化条目：</strong>按城市 / 门店覆盖方案里的那个数值——周期发放改<strong>标准额度</strong>、周期上限改<strong>获取上限</strong>、按次上限改<strong>每次上限</strong>，<strong>只改数值</strong>；门店优先、命中即停——地域决定「<strong>值多少</strong>」。按需档没有数值，不参与差异化。
          </li>
          <li>
            <strong>结转比例：</strong>周期发放与周期上限两档可配，填<strong>比例</strong>——周期结束时按「<strong>剩余额度 × 比例</strong>」带入下一周期作为下期额度的来源之一（0 = 不结转，100 = 全额结转），其余作废；按次 / 按需档不结转。
          </li>
          <li>
            <strong>获取上限：</strong>本期可得的封顶值。上限档（如临时假 16 小时/月）的上限就是方案里的那个数；周期发放档可选填——<strong>发放 + 结转</strong> 合计超过时按上限生效（如 8 天 + 结转 4 天 = 12 天，上限 10 天 → 生效 10 天）。
          </li>
        </ul>

        <div class="note">
          <strong>差异化不含岗位：</strong>岗位横跨多城市，塞进差异化会自相矛盾，所以「岗位决定有没有、地域决定值多少」两件事分开。
          个人 / 职级 / 用工形式 / 司龄 / 合同主体差异化本期不做，按人走「系统折算」（待决 8.16）；
          城市与门店同时命中取哪条待定——现取门店，原型可切「取最优」对比（待决 8.15）。
        </div>
      </div>

      <!-- ===== 6.3 假期审核规则 ===== -->
      <div id="lr-func-3" class="subsection">
        <div class="section-header">
          <h3>6.3 假期审核规则</h3>
          <DocCopyButton section-id="lr-func-3" />
        </div>
        <div class="func-entry"><strong>功能入口：</strong>Web 后台 → 假勤管理 → <strong>假期审核规则</strong>（<code>/leave-audit-consequence</code>）</div>
        <DocScreens
          :images="[
            { src: auditRulesShot, label: '假期审核规则：每个假种的凭证要求 / 提前申请期 / 审核方式 + 城市 / 门店差异化' }
          ]"
        />

        <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary)); margin-bottom: 16px;">
          <strong>一句话定位：</strong>定流程——这个假种「怎么批」。每个假种<strong>三项基础规则</strong> + 可选差异化条目；与岗位审批方式<strong>合并取严</strong>。
        </div>

        <h4 class="h4sub">基础三项</h4>
        <table class="data-table">
          <thead>
            <tr><th style="width: 130px;">规则项</th><th>口径</th><th style="width: 280px;">特例</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>凭证要求</strong></td>
              <td>枚举多选（医疗诊断证明 / 结婚证 / 出生证明 / 生育相关证明 / 其他）；不勾选 = 无需凭证</td>
              <td>丧假<strong>不设凭证</strong>——死亡证明无法事先取得</td>
            </tr>
            <tr>
              <td><strong>提前申请期</strong></td>
              <td>单位天；申请日期需早于休假开始 N 天，否则不允许提交</td>
              <td>病假<strong>无提前申请期概念</strong>——事出突然；无要求时界面不显示该行</td>
            </tr>
            <tr>
              <td><strong>审核方式</strong></td>
              <td>自动 / 人工；自动审核直接生效，单据不进审批列表</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>

        <h4 class="h4sub">差异化条目</h4>
        <ul class="lr-list">
          <li>仅<strong>城市 / 门店</strong>两个维度；<strong>默认继承基础值，改哪项覆盖哪项</strong>——不设「是否覆盖」勾选，改动即覆盖。</li>
          <li>门店优先、命中即停；与额度方案的差异化同口径（见 6.2）。</li>
        </ul>

        <div class="note">
          <strong>合并取严：</strong>假种审核规则与岗位侧的审批方式合并时<strong>取严</strong>——任一方要求人工，最终即按人工；岗位「混合」不参与投票。
        </div>
      </div>

      <!-- ===== 6.4 出勤方案 ===== -->
      <div id="lr-func-4" class="subsection">
        <div class="section-header">
          <h3>6.4 出勤方案</h3>
          <DocCopyButton section-id="lr-func-4" />
        </div>
        <div class="func-entry"><strong>功能入口：</strong>Web 后台 → 假勤管理 → <strong>出勤方案</strong>（<code>/leave-wm-scheme</code>）</div>
        <DocScreens
          :images="[
            { src: schemeShot, label: '出勤方案：日历口径（周基础模式 + 法定节假日解读 + 特殊日），不排班次' }
          ]"
        />

        <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary)); margin-bottom: 16px;">
          <strong>一句话定位：</strong>日历口径——哪天默认该上班。周基础模式 + 法定节假日解读 + 特殊日。
        </div>

        <ul class="lr-list">
          <li><strong>只回答「哪天默认该上班」：</strong>每周基础出勤日 + 法定节假日的解读 + 公司特殊日（如统一调休上班日）。</li>
          <li><strong>对排班排假是约束输入：</strong>排班岗具体哪天上哪个班次，由现有<strong>排班排假系统</strong>决定——它是班次计划与名额的 owner，出勤方案不越位。</li>
          <li><strong>对不排班岗是考勤比对的计划基准：</strong>没有班次计划的岗位，比对就用出勤方案判断该不该出勤（见 6.6）。</li>
        </ul>

        <div class="note">
          <strong>不做什么：</strong>不排班、不定班次、不生成名额——出勤方案是<strong>日历口径，不是班次计划</strong>。
        </div>

        <h4 class="h4sub">设计参考 · 统一时间管理体系</h4>
        <p style="font-size: 13px; color: hsl(var(--foreground)); line-height: 1.8; margin: 0 0 10px;">
          时间维度的分层思路参考下方「统一时间管理体系」：出勤方案只 owning <strong>时间轴 + 用工基数层</strong>（哪天默认该上班），
          考勤组 / 排班层与业务事件层归现有排班排假与业务系统（详见 6.6 与 5.1 边界）。
          时间线本体在<strong>员工请假提交（6.8）与审批（6.9）</strong>时才真正被消费——两处都要拿申请时段到时间轴上做校验。
        </p>
        <DocFigure
          :src="timeSystemImg"
          title="统一时间管理体系 · 分层设计参考"
          note="时间轴唯一；用工基数层定「哪天该上班」，其上各层由对应系统各自 owning"
        />
      </div>

      <!-- ===== 6.5 岗位假勤方案 ===== -->
      <div id="lr-func-5" class="subsection">
        <div class="section-header">
          <h3>6.5 岗位假勤方案</h3>
          <DocCopyButton section-id="lr-func-5" />
        </div>
        <div class="func-entry"><strong>功能入口：</strong>Web 后台 → 假勤管理 → <strong>岗位假勤方案</strong>（<code>/leave-wm-work-mode</code>）</div>
        <DocScreens
          :images="[
            { src: workModeShot, label: '岗位假勤方案（枢纽页）：按岗位装配出勤 / 额度 / 考勤 / 打卡，右侧日历预览' }
          ]"
        />

        <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary)); margin-bottom: 16px;">
          <strong>一句话定位：</strong>枢纽——岗位 × 四类配置（字典 / 额度 / 审核 / 出勤）的装配点，<strong>自己不定任何值</strong>。
        </div>

        <h4 class="h4sub">两个视图</h4>
        <ul class="lr-list">
          <li><strong>按岗位：</strong>单个岗位看装配了哪四类配置，进入后逐项引用。</li>
          <li><strong>矩阵：</strong>所有岗位 × 四类配置横向铺开，一眼看出哪个岗位缺哪类配置。</li>
        </ul>

        <h4 class="h4sub">装配关系</h4>
        <table class="data-table">
          <thead>
            <tr><th style="width: 110px;">方向</th><th style="width: 320px;">对象</th><th>关系</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>上游</strong></td><td>假期类型字典 · 额度方案 · 审核规则 · 出勤方案</td><td>按岗位引用；引用后配置改动即生效</td></tr>
            <tr><td><strong>下游</strong></td><td>假期盘点 · 考勤比对 · 移动端请假执行</td><td>只读消费，<strong>不存在下游反写配置的路径</strong></td></tr>
          </tbody>
        </table>

        <h4 class="h4sub">补缺路径</h4>
        <p class="doc-p">
          每个岗位声明请假生效后缺人怎么补：<strong>接班任务</strong>（同岗位任务交接）/ <strong>改班次</strong>（调整班次安排）/ <strong>无缺岗</strong>（不产生缺岗信号）。
          它决定<strong>缺岗信号的去向</strong>——「无缺岗」的岗位请假通过后不向排班调度发缺岗信号。
        </p>

        <div class="note">
          <strong>岗位侧只读：</strong>岗位不维护假种清单与额度值——由方案的适用岗位反查；岗位上看到的额度、审核、出勤配置都是引用结果，改动要回对应配置页。
        </div>
      </div>

      <!-- ===== 6.6 考勤组 ===== -->
      <div id="lr-func-6" class="subsection">
        <div class="section-header">
          <h3>6.6 考勤组</h3>
          <DocCopyButton section-id="lr-func-6" />
        </div>
        <div class="func-entry"><strong>功能入口：</strong>Web 后台 → 假勤管理 → <strong>考勤组</strong>（<code>/leave-wm-attendance</code>）</div>
        <DocScreens
          :images="[
            { src: attendanceShot, label: '考勤组：比对范围与打卡方式配置' }
          ]"
        />

        <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary)); margin-bottom: 16px;">
          <strong>一句话定位：</strong>比对口径——比几层、比哪些。
        </div>

        <ul class="lr-list">
          <li><strong>计划层基准：</strong>出勤方案（哪天默认该上班）；有班次计划的岗位读排班排假（只读）。</li>
          <li><strong>实际层事实：</strong>来自打卡记录。</li>
          <li><strong>产出：</strong>异常事实（迟到 / 缺勤 / 缺卡）交付薪酬；<strong>后续处置不在假勤边界内</strong>。</li>
        </ul>
      </div>

      <!-- ===== 6.7 假期盘点 ===== -->
      <div id="lr-func-7" class="subsection">
        <div class="section-header">
          <h3>6.7 假期盘点</h3>
          <DocCopyButton section-id="lr-func-7" />
        </div>
        <div class="func-entry"><strong>功能入口：</strong>Web 后台 → 假勤管理 → <strong>假期盘点</strong>（<code>/leave-wm-ledger</code>）</div>
        <DocScreens
          :images="[
            { src: ledgerShot, label: '假期盘点：余额 / 获取明细 / 变动三页签，结转与上限截断可逐条解释' }
          ]"
        />

        <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary)); margin-bottom: 16px;">
          <strong>一句话定位：</strong>只读——余额与明细的统一出口。
        </div>

        <ul class="lr-list">
          <li><strong>余额合成：</strong>系统折算部分按字典的周期上限合成 + 额度方案解档；周期上限方案不重复并入。</li>
          <li><strong>三个页签：</strong>余额盘点（每人每假种一行）· <strong>获取明细</strong>（发放 / 折算 / 结转的流水）· 使用明细（申请与扣减链路）。</li>
          <li><strong>额度 = 本期获取：</strong>发放（周期预发、按城市 / 门店解档）或折算（系统折算假种）+ <strong>上期结转</strong>（上期剩余 × 方案结转比例）− <strong>上限截断</strong>（合计超过获取上限的部分）；员工抽屉里每个假种卡片都带一行「获取」。</li>
          <li><strong>按需假种：</strong>不显示余额，只显示「按需」（如病假按医疗期核定，没有可盘点的数）。</li>
          <li><strong>不提供任何改数入口：</strong>与配置层没有反写路径；余额异常要回配置与记录层排查。</li>
        </ul>
      </div>

      <!-- ===== 6.8 移动端 · 员工请假 ===== -->
      <div id="lr-func-8" class="subsection">
        <div class="section-header">
          <h3>6.8 移动端 · 员工请假</h3>
          <DocCopyButton section-id="lr-func-8" />
        </div>
        <div class="func-entry"><strong>功能入口：</strong>移动端 → 假勤桌面 → <strong>请假</strong>（<code>/mobile-leave-pd/apply</code>）</div>
        <DocScreens
          mode="phone"
          :images="[
            { src: mLeaveApplyShot, label: '员工请假提交：提交时做一次额度 / 校验时间线验证（见 6.8）' },
            { src: mLeaveApprovalShot, label: '假期审批：审批时做第二次时间线验证（见 6.9）' }
          ]"
        />

        <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary)); margin-bottom: 16px;">
          <strong>一句话定位：</strong>员工侧申请入口——只展示该岗位适用的假种，选完假种即见当前余额。
        </div>

        <p class="doc-p">
          现状只有门店岗有申请身份，<strong>总部岗位没有入口</strong>；本期一并补齐。申请页的信息按「先选类型、再看余额、再填休假、最后确认占用」的顺序分区，
          静态口径跟假种走、动态计算单独成卡，不混排。
        </p>

        <h4 class="h4sub">申请页的信息分区</h4>
        <table class="data-table">
          <thead>
            <tr><th style="width: 120px;">区</th><th style="width: 280px;">内容</th><th>说明</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>假种选择</strong></td>
              <td>下拉选择，按假种类别分组</td>
              <td>只显示该岗位适用、已启用的假种；不铺开平铺</td>
            </tr>
            <tr>
              <td><strong>类型简况</strong></td>
              <td>额度 · 已用 · 剩余</td>
              <td>选完假种立即显示；额度口语化表达（如 <strong>4 天/月</strong>）；按需假种提示「按需申请 · 按医疗期核定 · 人工审核」</td>
            </tr>
            <tr>
              <td><strong>休假填写</strong></td>
              <td>按假种口径的字段</td>
              <td>四种口径见下表</td>
            </tr>
            <tr>
              <td><strong>本次占用</strong></td>
              <td>本次休假 / 余额所剩 / 实际扣除</td>
              <td>单独成卡；只放动态计算，不混后台静态规则</td>
            </tr>
          </tbody>
        </table>

        <h4 class="h4sub">四种填写口径</h4>
        <table class="data-table">
          <thead>
            <tr><th style="width: 120px;">口径</th><th style="width: 280px;">填写字段</th><th>适用</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>班次假</strong></td><td>单日 + 班次</td><td>按天休且占具体班次的假种</td></tr>
            <tr><td><strong>时段假</strong></td><td>起止时间（同一天内）</td><td>按小时计的假种</td></tr>
            <tr><td><strong>按次假</strong></td><td>使用天数（上限 = 当前剩余）</td><td>一次性事件假（婚假等）</td></tr>
            <tr><td><strong>区间假</strong></td><td>起止日期</td><td>按日期区间休的假种</td></tr>
          </tbody>
        </table>

        <h4 class="h4sub">校验与提交</h4>
        <ul class="lr-list">
          <li><strong>额度型超额禁止提交</strong>——没有「超出折薪」通道，超额只能改天数或换假种。</li>
          <li>
            <strong>时间线校验（第一次）：</strong>提交前把申请时段放到「统一时间管理体系」的时间轴上过一遍——
            休假日期是否落在出勤方案的应勤日（用工基数层）、是否与已排班次 / 已有业务事件（会议 / 培训 / 调整）冲突、
            是否撞上外部事件层（培训 / 学习认证等占用）。校验不通过的时段<strong>拦截提交</strong>并标出冲突层。
          </li>
          <li>提交后单据进入审批流；申请详情可见<strong>审批人（名 · 岗位）</strong>与审批流转状态。</li>
        </ul>
      </div>

      <!-- ===== 6.9 移动端 · 假期审批 ===== -->
      <div id="lr-func-9" class="subsection">
        <div class="section-header">
          <h3>6.9 移动端 · 假期审批</h3>
          <DocCopyButton section-id="lr-func-9" />
        </div>
        <div class="func-entry"><strong>功能入口：</strong>移动端 → 假勤桌面 → <strong>假期审批</strong>（<code>/mobile-leave-pd/approval</code>）</div>
        <DocScreens
          mode="phone"
          :images="[
            { src: mLeaveApprovalShot, label: '假期审批列表：只列人工审批单据，自动审核假种不进入' }
          ]"
        />

        <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary)); margin-bottom: 16px;">
          <strong>一句话定位：</strong>人事 / 总部侧处理端——审核规则里「人工审批」的落地入口。<strong>本期补齐的缺口</strong>：此前移动端只有员工申请，人工审批没有处理端，规则落不了地。
        </div>

        <h4 class="h4sub">审批人怎么分派</h4>
        <table class="data-table">
          <thead>
            <tr><th style="width: 120px;">人群</th><th style="width: 240px;">节点</th><th>说明</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>推拿师</strong></td>
              <td>1 级 · 岗位人事经理</td>
              <td rowspan="2">门店岗按<strong>岗类分流</strong>：各岗类对应自己的人事经理，互不交叉</td>
            </tr>
            <tr>
              <td><strong>客户经理</strong></td>
              <td>1 级 · 岗位人事经理</td>
            </tr>
            <tr>
              <td><strong>总部</strong></td>
              <td>按部门设置，允许多级</td>
              <td>部门审批（同节点可配置多人<strong>或签</strong>——任一人处理即流转）→ 可接人事复核；节点链的配置归属见待决 8.17</td>
            </tr>
          </tbody>
        </table>

        <h4 class="h4sub">单据详情有什么</h4>
        <ul class="lr-list">
          <li><strong>申请信息：</strong>休假字段 + 凭证（可查看员工上传的证明材料）。</li>
          <li><strong>余额与本次扣除：</strong>本单占用多少、扣哪个方案的哪一段。</li>
          <li><strong>命中的审核规则：</strong>审批方式、本单审批人；提前申请期仅在有要求时显示（病假不显示）。</li>
          <li>
            <strong>时间线校验（第二次）：</strong>审批动作执行前对申请时段<strong>重新过一遍时间轴</strong>——
            提交到审批之间隔了真实时间，排班可能改过、新的业务事件可能落进了休假时段，提交时的校验结果不能直接沿用。
            二次校验不通过时，通过按钮置灰并提示冲突点，审批人只能驳回或让员工撤回重提。
          </li>
        </ul>

        <div class="note">
          <strong>动作只有两个：</strong>通过 / 驳回，驳回必填原因。审批通过后按全链路生效——额度扣减、占位事件、缺岗信号（见 5.3）。
        </div>
      </div>
    </div>

    <!-- ========== 七、附录：待决事项 ========== -->
    <div id="lr-open" class="section">
      <div class="section-header">
        <h2>七、附录：待决事项</h2>
        <DocCopyButton section-id="lr-open" />
      </div>
      <p class="doc-p">以下事项显式挂起，<strong>不擅自拍板</strong>；每项写明归属方与卡点。</p>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 64px;">序号</th>
            <th style="width: 190px;">事项</th>
            <th>说明</th>
            <th style="width: 150px;">归属方</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>8.1</td><td>时间线粒度</td><td>天 / 半天 / 时刻区间——决定「通班 + 早半天假」能否表达。</td><td>人事组</td></tr>
          <tr><td>8.2</td><td>审批中间态是否上时间线</td><td>乐观占位（提交即占）vs 悲观占位（批准才占）。</td><td>人事组 + 假勤</td></tr>
          <tr><td>8.3</td><td>排他性判定方</td><td>时间线侧的事件类型字典 vs 我们写入时声明的排他标记。</td><td>人事组</td></tr>
          <tr><td>8.4</td><td>冲突解决权归属</td><td>只返回冲突 vs 可触发顶班 / 调班。</td><td>人事组 + 排班</td></tr>
          <tr><td>8.5</td><td>业绩折算公式归属</td><td>沿用现有模块 vs 本次重定义。</td><td>业务 + 额度模块</td></tr>
          <tr><td>8.6</td><td>业务周期粒度</td><td>周 / 月 / 自定义——决定名额生成器设计。</td><td>业务</td></tr>
          <tr><td>8.7</td><td>配置改动是否追溯</td><td>当月生效 / 次月生效 / 人工指定生效期。</td><td>业务 + 假勤</td></tr>
          <tr><td>8.8</td><td>「固定假」判定粒度</td><td>挂在额度来源（配置型额度）vs 挂在假种字典。</td><td>假勤</td></tr>
          <tr><td>8.9</td><td>请长假阈值</td><td>多少天以上认定为长假并触发福利侧结论。</td><td>业务 + 员工福利</td></tr>
          <tr><td>8.10</td><td>覆盖方向是否单向收紧</td><td>建议锁定为只能收紧，防止规则矩阵碎片化。</td><td>业务</td></tr>
          <tr><td>8.11</td><td>各外部能力的可改性</td><td>可要求加字段 / 接口 vs 只能读其现有输出。</td><td>待与各方确认</td></tr>
          <tr><td>8.12</td><td>外部能力输出的冻结时机与快照口径</td><td>额度、名额的历史值如何冻结。</td><td>额度模块 + 排班系统</td></tr>
          <tr><td>8.13</td><td>可配参数的配置入口归属</td><td>哪些参数在对方系统里配，我们是否需在文档中指引。</td><td>假勤 + 各方</td></tr>
          <tr><td>8.14</td><td>调休 / 补休接入</td><td>两类假种额度来自加班折算，接入前提是「加班申请」模块立项——加班事实来源、折算规则归属都挂在它身上。</td><td>假勤 + 业务</td></tr>
          <tr><td>8.15</td><td>城市 / 门店差异化同时命中</td><td>同时命中取哪条（现取门店；原型可切「取最优」对比）；优先级能否调整待确认。</td><td>业务</td></tr>
          <tr><td>8.16</td><td>个人维度差异化</td><td>个人 / 职级 / 用工形式 / 司龄 / 合同主体差异化本期不做，按人走「系统折算」；后续是否立项待定。</td><td>业务</td></tr>
          <tr><td>8.17</td><td>总部审批节点链配置归属</td><td>总部多级审批的部门审批人配置入口与维护方（部门设置 vs 人事后台）。</td><td>人事组 + 假勤</td></tr>
        </tbody>
      </table>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../docs/components/DocShell.vue'
import DocCopyButton from '../../docs/components/DocCopyButton.vue'
import DocFigure from '../../docs/components/DocFigure.vue'
import DocScreens from '../../docs/components/DocScreens.vue'
import { Calendar, User, CollectionTag } from '@element-plus/icons-vue'
import timeSystemImg from '../../docs/assets/unified-time-system.png'
import quotaListShot from '../../docs/assets/pages/wm-quota-library.png'
import quotaDrawerShot from '../../docs/assets/pages/wm-quota-drawer.png'
import typeDictShot from '../../docs/assets/pages/wm-type-dict.png'
import auditRulesShot from '../../docs/assets/pages/wm-audit-rules.png'
import schemeShot from '../../docs/assets/pages/wm-scheme.png'
import workModeShot from '../../docs/assets/pages/wm-work-mode.png'
import attendanceShot from '../../docs/assets/pages/wm-attendance.png'
import ledgerShot from '../../docs/assets/pages/wm-ledger.png'
import mLeaveApplyShot from '../../docs/assets/pages/m-leave-apply.png'
import mLeaveApprovalShot from '../../docs/assets/pages/m-leave-approval.png'

const tocItems = [
  { id: 'lr-version', label: '一、版本信息' },
  { id: 'lr-changelog', label: '二、变更日志' },
  { id: 'lr-notes', label: '三、文档说明' },
  { id: 'lr-bg', label: '四、需求背景' },
  { id: 'lr-scope', label: '五、需求范围' },
  { id: 'lr-scope-boundary', label: '　5.1 边界与周边系统' },
  { id: 'lr-scope-modules', label: '　5.2 内部各模块的关系' },
  { id: 'lr-scope-chain', label: '　5.3 请假全链路' },
  { id: 'lr-func', label: '六、功能详细说明' },
  { id: 'lr-func-1', label: '　6.1 假期类型' },
  { id: 'lr-func-2', label: '　6.2 假期额度方案' },
  { id: 'lr-func-3', label: '　6.3 假期审核规则' },
  { id: 'lr-func-4', label: '　6.4 出勤方案' },
  { id: 'lr-func-5', label: '　6.5 岗位假勤方案' },
  { id: 'lr-func-6', label: '　6.6 考勤组' },
  { id: 'lr-func-7', label: '　6.7 假期盘点' },
  { id: 'lr-func-8', label: '　6.8 移动端 · 员工请假' },
  { id: 'lr-func-9', label: '　6.9 移动端 · 假期审批' },
  { id: 'lr-open', label: '七、附录：待决事项' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '假勤管理', to: '/docs/leave-reform/overview' },
  { label: '产品需求说明' }
]
</script>

<style scoped>
/* 版本信息卡 */
.ver-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin: 12px 0; }
.ver-card {
  display: flex; align-items: center; gap: 12px;
  background: hsl(var(--muted) / 0.3); border: 1px solid hsl(var(--border));
  border-radius: 8px; padding: 14px 16px;
}
.ver-card .el-icon { font-size: 20px; color: hsl(var(--primary)); flex-shrink: 0; }
.vc-k { font-size: 11.5px; color: hsl(var(--muted-foreground)); margin-bottom: 2px; }
.vc-v { font-size: 14px; font-weight: 600; color: hsl(var(--foreground)); }

/* 空占位行 */
.lr-empty-row td {
  text-align: center;
  color: hsl(var(--muted-foreground) / 0.7);
  font-size: 12px;
  padding: 14px 0;
}

/* 列表 */
.lr-list { margin: 10px 0; padding-left: 20px; }
.lr-list li { font-size: 13.5px; line-height: 1.8; margin-bottom: 8px; color: hsl(var(--foreground)); }

/* 模块 × 关联系统确认图 */
.lr-cf { display: flex; flex-direction: column; gap: 10px; margin: 12px 0; }
.lr-cf-row { display: flex; align-items: stretch; }
.lr-cf-mod {
  flex: 0 0 168px;
  background: #EEEDFE; border: 1px solid #534AB7; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 500; color: #26215C;
  padding: 10px 8px; text-align: center; line-height: 1.5;
}
.lr-cf-line { flex: 0 0 34px; align-self: center; height: 1px; background: hsl(var(--border)); }
.lr-cf-chips { flex: 1; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.lr-chip { font-size: 12px; padding: 5px 10px; border-radius: 8px; line-height: 1.6; }
.lr-chip .dim { opacity: 0.75; }
.lr-chip.green { background: #EAF3DE; border: 1px solid #3B6D11; color: #173404; }
.lr-chip.blue { background: #E6F1FB; border: 1px solid #185FA5; color: #042C53; }
.lr-chip.gray { background: #F1EFE8; border: 1px solid #888780; color: #444441; }
.lr-mod-sub { font-size: 10.5px; font-weight: 400; color: #534AB7; opacity: 0.85; }

/* 范围声明（调休 / 补休）：红色主题 + 虚线 */
.lr-decl {
  display: flex; align-items: flex-start; gap: 10px;
  background: hsl(var(--destructive) / 0.04);
  border: 1px dashed hsl(var(--destructive) / 0.55);
  border-left: 4px solid hsl(var(--destructive));
  border-radius: 8px; padding: 12px 16px; margin: 14px 0;
}
.lr-decl-tag {
  flex-shrink: 0; font-size: 11px; font-weight: 600; letter-spacing: 0.5px;
  color: hsl(var(--destructive)); background: hsl(var(--destructive) / 0.1);
  border: 1px dashed hsl(var(--destructive) / 0.5);
  padding: 1px 10px; border-radius: 10px; margin-top: 2px;
}
.lr-decl-body { font-size: 13px; line-height: 1.8; color: hsl(var(--foreground)); }
.lr-decl-body strong { color: hsl(var(--destructive)); }

/* 需求背景 · 重点卡 */
.lr-key-point {
  background: #FDF3E4; border: 1px solid #C77700; border-left: 4px solid #C77700;
  border-radius: 8px; padding: 14px 16px; margin: 14px 0;
}
.kp-tag {
  display: inline-block; font-size: 11px; font-weight: 600; letter-spacing: 0.5px;
  color: #8A5300; background: #F8E3BE; border: 1px solid #C77700;
  padding: 1px 10px; border-radius: 10px; margin-bottom: 8px;
}
.kp-title { font-size: 15px; font-weight: 600; color: #5C3A00; margin-bottom: 6px; }
.lr-key-point .doc-p { color: #5C3A00; }

/* 需求背景 · 影响面三卡 */.lr-impact { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 12px 0; }
.lr-impact-card {
  background: hsl(var(--muted) / 0.3); border: 1px solid hsl(var(--border));
  border-radius: 8px; padding: 12px 14px;
}
.ip-sys { font-size: 13px; font-weight: 600; color: hsl(var(--primary)); margin-bottom: 6px; }
.ip-body { font-size: 12.5px; line-height: 1.7; color: hsl(var(--foreground)); }

/* 5.2 分层结构 */
.lr-layers { display: flex; flex-direction: column; margin: 12px 0; }
.lr-layer-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 8px; }
.lh-name {
  font-size: 13px; font-weight: 600; color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.08); border: 1px solid hsl(var(--primary) / 0.35);
  padding: 1px 10px; border-radius: 6px; white-space: nowrap;
}
.lh-desc { font-size: 12px; color: hsl(var(--muted-foreground)); }
.lr-layer-cards { display: grid; gap: 10px; }
.lr-layer-cards.cols-4 { grid-template-columns: repeat(4, 1fr); }
.lr-layer-cards.cols-3 { grid-template-columns: repeat(3, 1fr); }
.lr-mod-card {
  background: hsl(var(--muted) / 0.3); border: 1px solid hsl(var(--border));
  border-radius: 8px; padding: 12px 13px;
}
.mc-name { font-size: 13.5px; font-weight: 600; color: hsl(var(--foreground)); }
.mc-role { font-size: 11px; color: hsl(var(--primary)); margin: 3px 0 8px; }
.mc-line { font-size: 11.5px; line-height: 1.7; color: hsl(var(--muted-foreground)); }
.mc-no {
  font-size: 11.5px; line-height: 1.7; color: #6E6D66; margin-top: 6px;
  padding-top: 6px; border-top: 1px dashed hsl(var(--border));
}
.lr-flow-arrow {
  text-align: center; font-size: 12px; color: hsl(var(--muted-foreground));
  padding: 4px 0; position: relative;
}
.lr-flow-arrow::before, .lr-flow-arrow::after {
  content: ''; position: absolute; top: 50%; width: 0; height: 0;
  border-left: 4px solid transparent; border-right: 4px solid transparent;
  border-top: 6px solid hsl(var(--muted-foreground) / 0.6);
}
.lr-flow-arrow::before { left: calc(50% - 60px); }
.lr-flow-arrow::after { right: calc(50% - 60px); }
.lr-hub-card {
  background: #EEEDFE; border: 1.5px solid #534AB7; border-radius: 10px;
  padding: 14px 16px; display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
}
.hub-name { font-size: 15px; font-weight: 700; color: #26215C; }
.hub-role { font-size: 12px; color: #534AB7; margin-top: 3px; }
.hub-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-left: auto; }

/* 5.3 全链路 · 纵向步骤 */
.lr-chain { display: flex; flex-direction: column; margin: 12px 0; }
.lr-step { display: flex; gap: 12px; position: relative; padding-bottom: 16px; }
.lr-step:last-child { padding-bottom: 0; }
.lr-step::before {
  content: ''; position: absolute; left: 13px; top: 30px; bottom: 2px;
  width: 2px; background: hsl(var(--border));
}
.lr-step:last-child::before { display: none; }
.step-no {
  flex: 0 0 28px; height: 28px; border-radius: 50%;
  background: hsl(var(--primary) / 0.08); border: 1px solid hsl(var(--primary) / 0.4);
  color: hsl(var(--primary)); font-size: 13px; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
  position: relative; z-index: 1;
}
.lr-step-main { flex: 1; min-width: 0; }
.lr-step-title { font-size: 13.5px; font-weight: 600; color: hsl(var(--foreground)); line-height: 28px; }
.lr-step-body { font-size: 12.5px; line-height: 1.75; color: hsl(var(--muted-foreground)); margin-top: 2px; }
.lr-step-body strong { color: hsl(var(--foreground)); font-weight: 500; }

/* 功能详细说明 · 功能入口（置顶，同离职 PRD 口径） */
.func-entry { font-size: 13px; color: hsl(var(--muted-foreground)); margin: 0 0 14px; }
.func-entry strong { color: hsl(var(--foreground)); }
.func-entry code {
  background: hsl(var(--muted) / 0.5); border: 1px solid hsl(var(--border));
  border-radius: 4px; padding: 1px 6px; font-size: 12px; color: hsl(var(--primary));
}

/* 小节内子标题 */
.h4sub { font-size: 13.5px; font-weight: 600; margin: 18px 0 8px; color: hsl(var(--foreground)); }

@media (max-width: 720px) {
  .lr-cf-row { flex-direction: column; gap: 6px; }
  .lr-cf-line { display: none; }
  .lr-impact { grid-template-columns: 1fr; }
  .lr-layer-cards.cols-4, .lr-layer-cards.cols-3 { grid-template-columns: 1fr; }
  .lr-flow-arrow::before, .lr-flow-arrow::after { display: none; }
  .hub-chips { margin-left: 0; }
}
</style>
