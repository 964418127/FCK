<template>
  <DocShell
    :toc-items="tocItems"
    title="离职流程 · 产品需求说明"
    subtitle="离职场景只处理离职本身：定实际离职日期、落地状态、把「离职事实 + 实际离职日期」交付下游。假勤出结果、薪酬按规则算，都不是我们的活。"
    version="v0.1"
    date="2026-10-19"
    :breadcrumbs="breadcrumbs"
  >
    <!-- ========== 一、版本信息 ========== -->
    <div id="rf-version" class="section">
      <div class="section-header">
        <h2>一、版本信息</h2>
        <DocCopyButton section-id="rf-version" />
      </div>
      <div class="ver-cards">
        <div class="ver-card">
          <el-icon><CollectionTag /></el-icon>
          <div><div class="vc-k">当前版本号</div><div class="vc-v">v0.1</div></div>
        </div>
        <div class="ver-card">
          <el-icon><Calendar /></el-icon>
          <div><div class="vc-k">创建日期</div><div class="vc-v">2026-10-19</div></div>
        </div>
        <div class="ver-card">
          <el-icon><User /></el-icon>
          <div><div class="vc-k">负责人</div><div class="vc-v">Lacus7</div></div>
        </div>
      </div>
    </div>

    <!-- ========== 二、变更日志 ========== -->
    <div id="rf-changelog" class="section">
      <div class="section-header">
        <h2>二、变更日志</h2>
        <DocCopyButton section-id="rf-changelog" />
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
            <td>2026-10-15</td>
            <td>v0.1</td>
            <td>
              <div class="chg-lead">首版：离职场景产品需求说明。本模块文档共三份 —— 一、产品需求说明（本文）、二、移动端功能说明、三、Web 端功能说明。本版内容：</div>
              <ol class="chg-list">
                <li>
                  <strong>全链路总览</strong>：三类岗位从<strong>发起 → 审核 → 结算锚点 → 关联系统通知（排班 / 预约订单 / 新员工关系）→ 结算 → 发放 → 财务人工计提</strong>的一张图（见 5 章末）。
                </li>
                <li>
                  <strong>需求背景与范围</strong>：现状的三个卡点、目标，以及「做什么 / 不做什么 / 分阶段」的范围界定。
                </li>
                <li>
                  <strong>员工侧「离职需求」发起</strong>：通用发起单的四区结构、三条统一口径（两步流程含总部、期望离职日期、原因枚举多选 + 补充说明）、收款账户。
                </li>
                <li>
                  <strong>处理侧「离职处理」统一处理</strong>：两个入口（主动离职 / 异常监控解除用工）、离职类型、
                  <strong>审批通过后自动执行</strong>（实际离职日期后的排班全部取消、接单权限截断）。
                </li>
                <li>
                  <strong>离职事实的后链路</strong>：离职合同签署状态机、剩余资产可见（只呈现不计算）、
                  款项出口、资产流向与税务归集（两个申报科目、最多 2 张单 / 2 次申报 / 2 笔付款）；资金流的最后一步是<strong>财务人工计提科目</strong>。
                </li>
                <li>
                  <strong>离职补偿金明细</strong>：金额范围（<strong>过去 12 个月平均收入 ×（N+1）</strong>，N+1 即唯一上限）、
                  <strong>平均工资怎么取数</strong>（门店侧取模块化薪酬的每月收入小计、总部取总部薪酬的每月实发）、
                  <strong>协商协议附件必传</strong>、录入来源（人事在离职流程内录入）、<strong>三段金额（预估 / 计算 / 发放）与差异原因</strong>、
                  补偿金成立条件与签署状态的联动。
                </li>
                <li>
                  <strong>一次性补偿金通过模块化薪酬实现的计算与发放</strong>：两个数仓数据对象、补偿金个税系统项、
                  发放策略「补偿金」分类、余额冻结后触发时序、改动点清单，以及方案 A / B 对比与 B 简化形态的评估。
                </li>
                <li>
                  <strong>下游交付与附录</strong>：下游按「离职事实 + 实际离职日期」取数（含排班取消、权限截断）；附录列待决事项。
                </li>
              </ol>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ========== 三、文档说明 ========== -->
    <div id="rf-notes" class="section">
      <div class="section-header">
        <h2>三、文档说明</h2>
        <DocCopyButton section-id="rf-notes" />
      </div>

      <h3>名词解释</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 220px;">名词</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>离职事实</strong></td><td>员工离职这一判定，由离职流程落地为状态标记。全系统<strong>只此一处产生</strong>，下游各自消费</td></tr>
          <tr><td><strong>实际离职日期</strong></td><td>审批通过后锁定、<strong>不可撤销</strong>；是下游所有结算（工资 / 假勤 / 常乐豆）的锚点</td></tr>
          <tr><td><strong>离职需求</strong></td><td>员工侧发起产生的一条待处理记录（需求编号 / 期望离职日期 / 原因 / 收款账户 / 审批链），初始状态「待审核」。它是<strong>「离职处理」的输入</strong>（见 6.1）</td></tr>
          <tr><td><strong>离职处理</strong></td><td>我们这一侧的<strong>统一处理</strong>：不论需求来自员工发起还是异常监控触发，都走同一套流程 —— 定实际离职日期、落地状态、呈现资产、录入协商金额、交付下游（见 6.2）</td></tr>
          <tr><td><strong>通用发起单</strong></td><td>员工侧发起「离职需求」的统一表单，四区：基础信息 / 离职意向 / 收款账户 / 审批链。三类人员共用同一结构，差异只在配置（见 6.1）</td></tr>
          <tr><td><strong>期望离职日期</strong></td><td>员工在发起时填写的日期；与审批人填写的<strong>实际离职日期</strong>不在同一层，不混用（见 6.1）</td></tr>
          <tr><td><strong>收款账户</strong></td><td>新员工关系里的银行卡（卡名 / 卡号 / 开户行）；发起时只读核对，<strong>处理侧默认显示</strong>。是最后工资与补偿金的收款地址</td></tr>
          <tr><td><strong>新员工关系</strong></td><td>员工主数据的归属系统，管理<strong>完整履职经历</strong>（入职、调岗、晋升、奖惩、离职）；「员工档案」只是其中一部分。离职场景的岗位、部门、门店、收款账户均从此处取，离职结果也回写此处</td></tr>
          <tr><td><strong>主动离职 / 异常监控（解除用工）</strong></td><td>两个性质不同的入口：前者有完整流程与日期；后者无流程、<strong>不走签署</strong>，日期需人事确认（见 6.2）</td></tr>
          <tr><td><strong>系统离职</strong></td><td>解除用工把员工状态<strong>标记为离职</strong>的结果。<strong>是状态事实，不等于走完了离职流程</strong>：没有发起、没有审批、没有签署；但<strong>资产处理（剩余资产 / 出口 / 补偿金）在解除确认页一并完成</strong>（见 6.2）</td></tr>
          <tr><td><strong>排班取消</strong></td><td>离职状态生效后，<strong>实际离职日期之后的排班全部取消</strong>（推拿师 / 客户经理均适用；主动离职与解除用工均执行）。由<strong>离职状态生效</strong>驱动，与签署无关（见 6.2）</td></tr>
          <tr><td><strong>剩余资产</strong></td><td>员工名下在离职时点需要处置的东西：常乐豆、负工资账户、剩余福利假额、在途协商扣缴</td></tr>
          <tr><td><strong>可提取额（常乐豆）</strong></td><td>当月负工资、公积金等抵扣完后<strong>充值进常乐豆账户的余额</strong>，在<strong>次月 5 日被冻结锁定</strong>后作为补偿金的取数，<strong>不是账面余额</strong></td></tr>
          <tr><td><strong>预估</strong></td><td>资产面板数值的统一表达口径：随他方结算实时变动，最终以薪酬实际结算为准；界面一律标「约」</td></tr>
          <tr><td><strong>款出口</strong></td><td>员工福利费从哪条通道出去（一次性补偿金 / 并入薪金）；<strong>由人事与员工协商确定</strong>（见 6.5）</td></tr>
          <tr><td><strong>协商类金额</strong></td><td>不在薪酬与福利资产自动核算范围内、由人事与员工协商确定的金额；是<strong>离职补偿金的唯一承载对象</strong></td></tr>
          <tr><td><strong>过去 12 个月平均收入</strong></td><td>补偿金的计算基数：员工离职前 12 个月的<strong>平均收入</strong>，取数自薪酬（门店侧取模块化薪酬的每月收入小计、总部取总部薪酬的每月实发），在审批页员工信息处<strong>默认显示</strong>，审批人据此判断金额是否合理（见 6.7）</td></tr>
          <tr><td><strong>N+1</strong></td><td>补偿金的上限口径：N = 在本单位工作年限，+1 = 代通知金一个月，即<strong>月均收入 ×（N+1）</strong>；<strong>N+1 就是唯一上限</strong>，不再叠单笔封顶（见 6.7）</td></tr>
          <tr><td><strong>协商协议附件</strong></td><td>补偿金金额的书面依据（协商解除 / 补偿协议）。金额 &gt; 0 时<strong>必传</strong>，与录入记录一同留档，在「离职补偿金明细」可查看（见 6.7）</td></tr>
          <tr><td><strong>负工资账户</strong></td><td>薪酬侧的负债账户；离职时<strong>只展示余额</strong>，抵扣 / 清零由薪酬按规则执行</td></tr>
          <tr><td><strong>工资薪金 / 解除劳动合同一次性补偿金</strong></td><td>两个不同的个税申报科目，申报备注分别为 <code>【工资薪金】</code> / <code>【解除劳动合同一次性补偿金】</code>（见 6.6）</td></tr>
          <tr><td><strong>补偿金单</strong></td><td>由<strong>补偿金发放策略</strong>产出的单据，分类为「补偿金」；与工资单、常乐豆单并列（见 6.8）</td></tr>
          <tr><td><strong>三段金额（预估 / 计算 / 发放）</strong></td><td>明细里一笔补偿金的三个数：签署发起时的<strong>预估</strong>（常乐豆为约数）→ 次月 5 日的<strong>计算</strong>（协商现金 + 常乐豆<strong>冻结值</strong> = 税前，再减补偿金个税；冻结值已含当月抵扣，不再二次扣，6 日报税后定稿）→ 次月 9 日的<strong>发放</strong>（到账，付款单在报税后出）。三者之差必须有<strong>原因</strong>可追（见 6.7）</td></tr>
          <tr><td><strong>补偿金成立</strong></td><td>签署完成即「协议成立」—— 说的是<strong>这笔补偿金要不要发</strong>，不是「某个金额生效」。签署时只有预估，真实金额在成立之后、次月 5 日冻结余额后跑批才算出（见 6.3）</td></tr>
          <tr><td><strong>离职补偿金发放策略</strong></td><td>HR 按岗位配置的发放策略，取「上月内离职的人」，在<strong>常乐豆余额冻结后</strong>启动计算（见 6.8）</td></tr>
          <tr><td><strong>补偿金个税（系统项）</strong></td><td>补偿金单计算中的一个<strong>系统项</strong>（非 HR 配公式的薪酬项）；计税口径与工资薪金个税不同源</td></tr>
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
          <tr><td><strong>期望离职日期</strong></td><td>员工侧发起 · 离职意向</td><td>员工填写、必填；<strong>统一命名</strong>，不再使用「最后工作日」</td></tr>
          <tr><td><strong>离职原因</strong></td><td>员工侧发起 · 离职意向</td><td>枚举多选（必填）+ 补充说明（可选）；枚举口径：工资太低 / 离家太远 / 结婚生子 / 自主创业 / 照顾家庭</td></tr>
          <tr><td><strong>收款账户</strong></td><td>员工侧发起 · 收款账户<br />移动端离职审批 · 员工信息</td><td>卡名 / 卡号 / 开户行，<strong>只读带出</strong>（来源新员工关系）；处理侧默认显示，本场景不提供修改入口</td></tr>
          <tr><td><strong>离职类型</strong></td><td>移动端离职审批 · 审批填写</td><td>主动离职（<strong>默认</strong>）/ 协商一致解除劳动合同（可选）/ 被动离职（<strong>不可选</strong>，由异常监控触发）</td></tr>
          <tr><td><strong>过去 12 个月平均收入</strong></td><td>移动端离职审批 · 员工信息</td><td>离职前 12 个月的平均收入，取数自薪酬（门店侧：模块化薪酬每月收入小计；总部：总部薪酬每月实发）；<strong>默认显示</strong>，作为补偿金上限的计算基数</td></tr>
          <tr><td><strong>补偿金金额</strong></td><td>移动端离职审批 · 补偿金卡片</td><td>默认 0；取值 <strong>0 ～ 上限</strong>，上限 = 过去 12 个月平均收入 ×（N+1）（<strong>唯一上限</strong>）；不允许负数；系统不折算</td></tr>
          <tr><td><strong>协商协议附件</strong></td><td>移动端离职审批 · 补偿金卡片<br />Web 离职补偿金明细</td><td>PDF / JPG / PNG，最多 3 个，单个 ≤ 10MB；金额 &gt; 0 时<strong>必传</strong>，不传不能提交审批；明细里可查看</td></tr>
          <tr><td><strong>补偿金备注</strong></td><td>移动端离职审批 · 补偿金卡片</td><td>自由文本，说明本笔协商类金额的构成与依据；<strong>不做结构化明细</strong></td></tr>
          <tr><td><strong>常乐豆三层余额</strong></td><td>资产面板</td><td>当前账面余额 / 待结数量 / 可提取三层分开；审批阶段均按「约」+ 预估表达，准确值要等次月 4 日晚充值进账户、5 日冻结后才锁定</td></tr>
          <tr><td><strong>负工资账户余额</strong></td><td>资产面板</td><td>只展示；不呈现抵扣过程与处置结论</td></tr>
          <tr><td><strong>剩余福利假额</strong></td><td>资产面板</td><td>假勤出结果；只呈现天数，不折算</td></tr>
          <tr><td><strong>签署状态</strong></td><td>Web 补偿金明细</td><td>跟随离职合同签署状态机：待发起签署 → 待员工签署 → 员工已签 → 签署完成（见 6.3）</td></tr>
          <tr><td><strong>补偿金成立</strong></td><td>Web 补偿金明细</td><td>由签署状态推导：<strong>签署完成 → 协议成立、进入计算</strong>；拒签 / 作废 → 已作废、不进入计算。<strong>不是「金额生效」</strong>—— 签署时只有预估，金额在成立后才算出（见 6.3 / 6.7）</td></tr>
          <tr><td><strong>款出口</strong></td><td>移动端离职审批 · 款项出口卡片</td><td>仅常乐豆参与；协商确定二选一；离职侧只记录留痕</td></tr>
          <tr><td><strong>补偿金分类</strong></td><td>发放策略详情</td><td>与「工资单 / 常乐豆单」并列的第三类；分类决定产出单据的性质，<strong>不影响发放链路</strong></td></tr>
          <tr><td><strong>补偿金单金额</strong></td><td>人员薪酬明细</td><td>来自数仓两个数据对象（协商的一次性现金 + 走补偿金通道的常乐豆余额）；<strong>不是薪酬侧算出来的</strong></td></tr>
        </tbody>
      </table>
    </div>

    <!-- ========== 四、需求背景 ========== -->
    <div id="rf-bg" class="section">
      <div class="section-header">
        <h2>四、需求背景</h2>
        <DocCopyButton section-id="rf-bg" />
      </div>

      <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary)); margin-bottom: 16px;">
        <strong>一句话现状：</strong>【解除用工】是一次「状态写入」，不是「流程编排」。它只把员工标记为离职，之后各系统<strong>被动感知</strong>这个状态各自运转 ——
        <strong>但资产处置（常乐豆余额、补偿金）没人承接</strong>，这正是本版要补齐的一环（见 6.2）。
      </div>

      <h3>现在是谁在「被动反应」</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 130px;">系统</th>
            <th style="width: 130px;">反应方式</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>工资</strong></td>
            <td>次月被动感知</td>
            <td>次月算薪时发现员工已是离职状态，但算法与在职员工完全一致。这<strong>不算 bug</strong> —— 工资计算的对象本来就是服务 / 订单的<strong>事实数据</strong>，离职与否不改变事实本身</td>
          </tr>
          <tr>
            <td><strong>任职段</strong></td>
            <td>自动截尾</td>
            <td>人员异动自动截尾旧任职段（见「人事福利 / 人员异动流程」）</td>
          </tr>
          <tr>
            <td><strong>接单权限</strong></td>
            <td>主动截断</td>
            <td>实际离职日期之后截断 —— 这是少数<strong>主动</strong>的动作</td>
          </tr>
          <tr>
            <td><strong>常乐豆</strong></td>
            <td>交付余额</td>
            <td>离职侧交付「5 日冻结锁定的余额」；这笔钱怎么出去（进补偿金 / 由常乐豆自行提现 / 清零）属常乐豆系统自己的逻辑，两条通道不并行</td>
          </tr>
        </tbody>
      </table>

      <h3>真正的缺口</h3>
      <p class="doc-p">
        缺的是<strong>一整层「员工处理态个人资产」的处置方案</strong>。人走了，他名下的东西 —— 假期余额、
        负工资账户、常乐豆、在途单据、社保关系 —— 没有任何一处主动清算，全靠「碰到了再说」。
      </p>
      <div class="note">
        <strong>本场景要补的不是「谁来算钱」，而是「谁在什么时候、把什么事实交给谁」。</strong>
        各域按自己的规则消费这份事实，离职侧不代算。
      </div>
    </div>

    <!-- ========== 五、需求范围 ========== -->
    <div id="rf-scope" class="section">
      <div class="section-header">
        <h2>五、需求范围</h2>
        <DocCopyButton section-id="rf-scope" />
      </div>

      <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary)); margin-bottom: 16px;">
        <strong>一句话定位：</strong>离职场景只做四件事 —— 承接发起 → 审批定实际离职日期 → 状态落地 + 日期锁定 → 交付「离职事实 + 实际离职日期」。其余各域按规则自行消费。
      </div>

      <h3>做什么 / 不做什么</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 90px;">归属</th>
            <th style="width: 200px;">内容</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>我们做</strong></td>
            <td>承接发起、审批、定实际离职日期、状态落地、日期锁定</td>
            <td>两个入口（主动离职 / 异常监控解除用工）统一落地为「离职事实 + 实际离职日期」</td>
          </tr>
          <tr>
            <td><strong>我们做</strong></td>
            <td>剩余资产<strong>可见</strong>、款出口<strong>选择</strong>、补偿金<strong>记录</strong>；5 日<strong>冻结</strong>常乐豆余额</td>
            <td>只取数、呈现、留痕；唯一的主动动作是 5 日<strong>冻结余额</strong>（锁住准确值，防被提走 / 被重复取用）。不结算、不折算、不清零</td>
          </tr>
          <tr>
            <td><strong>我们不做</strong></td>
            <td>假勤额度结存 / 是否超休</td>
            <td>假勤系统自己出结果</td>
          </tr>
          <tr>
            <td><strong>我们不做</strong></td>
            <td>抵扣 / 清零 / 扣缴 / 计税</td>
            <td>薪酬按自己的规则计算，我们不下发金额</td>
          </tr>
          <tr>
            <td><strong>我们不做</strong></td>
            <td>社保公积金欠款结算</td>
            <td>员工福利侧处理</td>
          </tr>
          <tr>
            <td><strong>本次不做</strong></td>
            <td>合同续签</td>
            <td>属于<strong>人员异动</strong>（合同层面续 / 改 / 止），不产生离职事实；现有系统列表里的该 Tab 不复刻（见 6.2）</td>
          </tr>
          <tr>
            <td><strong>分阶段</strong></td>
            <td>总部员工的异常监控</td>
            <td>异常来源是<strong>考勤</strong>，依赖<strong>【假勤】</strong>的需求；数据未就绪时<strong>整块不展示</strong>。阶段一只做门店侧未出勤异常（见 6.2）</td>
          </tr>
        </tbody>
      </table>

      <h3>方向是单向的</h3>
      <p class="doc-p">
        不是「离职要去清算假勤」，而是<strong>假勤消费离职事实</strong>。离职场景只交付两样：<strong>离职事实 + 实际离职日期</strong>，
        然后各域按自己的规则去消费。
      </p>

      <div class="note" style="background: hsl(0 65% 50% / 0.06); border-left: 3px solid hsl(0 65% 50%);">
        <strong>易错点（本场景曾被纠正过）：</strong>把「离职要清算假勤额度」写进来是<strong>越界</strong>。
        假勤额度怎么结、超休怎么扣，都是假勤与薪酬各自的规则，不属于离职场景的待决事项。
      </div>

      <h3 id="rf-chain">全链路总览：一次离职，从发起到入账</h3>
      <p class="doc-p">
        下面这条链路把<strong>三类岗位</strong>放到同一条时间轴上 —— 前两步因岗位而异，从「实际离职日期」这个锚点往后，
        三类人走的是同一条路，<strong>钱到账后还有最后一步：财务人工计提科目</strong>。每个方框是一个动作，左侧标<strong>这一步由谁做</strong>。
      </p>

      <div class="rf-flow-tag-legend">
        <span class="rfs-tag ours">离职模块（本场景）</span>
        <span class="rfs-tag dw">关联系统（被通知）</span>
        <span class="rfs-tag pay">薪酬 / 发放</span>
        <span class="rfs-tag tax">个税申报</span>
        <span class="rfs-tag bean">假勤（只出结果）</span>
      </div>

      <div class="chain">
        <!-- STEP 1 发起 -->
        <div class="chain-node">
          <div class="cn-rail">
            <span class="cn-no">STEP 1</span>
            <span class="cn-name">发起</span>
            <span class="cn-who">员工侧<br />移动端</span>
          </div>
          <div class="cn-body">
            <div class="cn-t">三类岗位各自发起，收敛为<strong>同一张「离职需求」</strong></div>
            <div class="persona-cols">
              <div class="persona-col">
                <div class="pct">推拿师</div>
                <div class="pcd">技法 · 等级 · 合同门店<br />→ 人事经理（2 人）审批</div>
              </div>
              <div class="persona-col">
                <div class="pct">客户经理</div>
                <div class="pcd">合同门店（仅此一行）<br />→ 城市总（1 人）审批</div>
              </div>
              <div class="persona-col">
                <div class="pct">总部</div>
                <div class="pcd">所在部门（仅此一行）<br />→ 单一审批人</div>
              </div>
            </div>
            <div class="cn-d">
              统一采集：<b>期望离职日期</b> · <b>离职原因</b>（枚举多选 + 可选补充说明） · <b>收款账户</b>（只读核对，来源新员工关系）。
              总部同样两步：申请 → 签字确认。
            </div>
          </div>
        </div>
        <div class="chain-arrow">↓</div>

        <!-- STEP 2 审核 -->
        <div class="chain-node">
          <div class="cn-rail">
            <span class="cn-no">STEP 2</span>
            <span class="cn-name">审核</span>
            <span class="cn-who">人事侧<br />移动端</span>
          </div>
          <div class="cn-body">
            <div class="cn-t">两个入口，都以<strong>「定下一个日期」</strong>收口</div>
            <div class="entry-pair">
              <div class="entry-box">
                <div class="eb-t">主动离职</div>
                <div class="eb-d">
                  审批填：离职类型 · 实际离职日期 · 离职原因 · 是否黑名单；
                  通过后发送离职协议 → 员工签署
                </div>
              </div>
              <div class="entry-box">
                <div class="eb-t">异常监控 · 解除用工</div>
                <div class="eb-d">
                  无发起、无审批、<b>不走签署</b>；人事确认的时点即为离职事实（系统离职），
                  但排班取消与权限截断<strong>照常执行</strong>
                </div>
              </div>
            </div>
            <div class="cn-d">两条入口的产物完全相同：<b>离职事实 + 实际离职日期</b>。</div>
          </div>
        </div>
        <div class="chain-arrow">↓</div>

        <!-- 结算锚点 -->
        <div class="chain-node anchor">
          <div class="cn-rail">
            <span class="cn-no">锚点</span>
            <span class="cn-name">结算点</span>
            <span class="cn-who">实际离职日期</span>
          </div>
          <div class="cn-body">
            <div class="cn-t">实际离职日期 —— 一切从这里切开</div>
            <div class="cn-d">
              工资算到这一天；排班以这一天为界取消；接单权限从这一天之后截断；
              假勤、社保、常乐豆各自按自己的规则取这个日期。三类岗位同一含义，不接受歧义。
            </div>
            <div class="chain-aside">
              <span class="ca-t">旁路取数（只读，不回写）</span>
              假勤额度结存 / 负工资账户余额 / 常乐豆三层余额 —— 只进「剩余资产」面板给人事判断，<b>不计算</b>；
              常乐豆的<b>冻结</b>不在审批这一步，而在次月 5 日<strong>按流程执行</strong>（见 6.8）。
            </div>
          </div>
        </div>
        <div class="chain-arrow">↓</div>

        <!-- STEP 3 通知 -->
        <div class="chain-node">
          <div class="cn-rail">
            <span class="cn-no">STEP 3</span>
            <span class="cn-name">通知</span>
            <span class="cn-who">关联系统<br />各自处理</span>
          </div>
          <div class="cn-body">
            <div class="cn-t">一套「离职事实 + 日期」发给三个系统，各处理自己那一环</div>
            <div class="cols-3">
              <div class="sys-box">
                <div class="sb-t"><span class="rfs-tag dw">排班</span></div>
                <div class="sb-d">
                  <b>实际离职日期之后的排班全部取消</b>，不再排给本人，也不留在门店排班表里。
                  由离职处理主动发起，不等下游发现
                </div>
              </div>
              <div class="sys-box">
                <div class="sb-t"><span class="rfs-tag dw">预约订单</span></div>
                <div class="sb-d">
                  失去接单权限 → <b>不再接新单</b>；在途预约由预约系统按规则改派 / 取消 / 通知客户。
                  <b>怎么处置不由离职决定</b>
                </div>
              </div>
              <div class="sys-box">
                <div class="sb-t"><span class="rfs-tag dw">新员工关系</span></div>
                <div class="sb-d">
                  写入离职事实与实际离职日期，员工状态置为离职；<b>完整履职经历</b>留档
                  （原有「员工档案」只是其中一部分）
                </div>
              </div>
            </div>
            <div class="cn-d">通知是单向的：我们只发事实与日期，不替下游做处置决策。</div>
          </div>
        </div>
        <div class="chain-arrow">↓</div>

        <!-- 结算节点 -->
        <div class="chain-node">
          <div class="cn-rail">
            <span class="cn-no">结算节点</span>
            <span class="cn-name">算钱</span>
            <span class="cn-who">薪酬侧<br />按各自规则</span>
          </div>
          <div class="cn-body">
            <div class="cn-t">离职模块不参与计算，只提供事实与人录金额</div>
            <ul class="chain-list">
              <li><b>最后工资</b> —— 算到实际离职日期；服务 / 订单事实数据照常计入，不因离职改变算法</li>
              <li><b>一次性补偿金</b> —— 用人事在流程内录入的协商金额（0 ～ 月均 ×（N+1），N+1 即唯一上限），后台只做取数、计税、组单</li>
              <li><b>常乐豆余额</b> —— 取 <strong>4 日晚充值进账户、5 日冻结锁定</strong>的余额（冻结之后不再变动），5 日跑批进补偿金计算</li>
              <li><b>假勤额度</b> —— <span class="rfs-tag bean">假勤</span> 出结果，薪酬按规则消费；离职侧只呈现「剩余资产」</li>
            </ul>
          </div>
        </div>
        <div class="chain-arrow">↓</div>

        <!-- 发放节点 -->
        <div class="chain-node">
          <div class="cn-rail">
            <span class="cn-no">发放节点</span>
            <span class="cn-name">出单与到账</span>
            <span class="cn-who">薪酬 → 税务<br />→ 银行</span>
          </div>
          <div class="cn-body">
            <div class="cn-t">按申报科目归集：两张单、两次申报、<strong>最多两笔付款</strong></div>
            <div class="pay-line">
              <span class="pl-item"><span class="rfs-tag pay">工资单</span><b>【工资薪金】</b></span>
              <span class="pl-op">+</span>
              <span class="pl-item"><span class="rfs-tag pay">补偿金单</span><b>【解除劳动合同一次性补偿金】</b></span>
              <span class="pl-op">→</span>
              <span class="pl-item"><span class="rfs-tag tax">个税申报</span><b>2 次</b></span>
              <span class="pl-op">→</span>
              <span class="pl-item"><span class="rfs-tag pay">付款单</span><b>≤ 2 笔 → 员工收款账户</b></span>
            </div>
            <div class="cn-d">
              <b>为什么付款单封顶 2 笔：</b>离职批次的款项只落<strong>两个申报科目</strong> —— 一个科目 → 一张单 → 一次申报 → 一笔付款；
              同科目不拆、跨科目不并（并了申报与到账就对不上，凭证 / 计提也分不开）。所以是 2 笔封顶，不随人数或月份累加。
            </div>
            <div class="cn-d">
              <b>时点顺序：</b><strong>6 日报税 → 工资单与补偿金单数据完善 → 出付款单 → 9 日到账</strong>。
              付款单在报税之后才出，不提前、也不与申报同一步。
            </div>
            <div class="cn-d">
              补偿金单不进「应发之和」等式，也不进社保 / 公积金清单；两类单据在人员薪酬明细里同月并列可查。
            </div>
          </div>
        </div>
        <div class="chain-arrow">↓</div>

        <!-- 计提节点：资金流的最后一步 -->
        <div class="chain-node">
          <div class="cn-rail">
            <span class="cn-no">计提节点</span>
            <span class="cn-name">财务入账</span>
            <span class="cn-who">财务<br />人工计提</span>
          </div>
          <div class="cn-body">
            <div class="cn-t">资金流的最后一步：<strong>财务人工计提科目</strong></div>
            <div class="cn-d">
              财务在财务系统按 <code>【解除劳动合同一次性补偿金】</code> 科目<strong>人工计提</strong> ——
              与个税申报科目一致，取数看补偿金单。
            </div>
            <div class="cn-d">
              这一步<strong>不随发薪自动产生</strong>，属财务手工做账；工资那部分的计提随工资走，不在本节点。
            </div>
          </div>
        </div>
      </div>

      <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary));">
        <strong>一句话记住位置：</strong>岗位差异只在前两步（谁能发起、谁审批、审批后动作）；第三步的日期锚点一旦落下，
        三类岗位就并到同一条结算、发放与计提链路上 —— 后面再谈「推拿师怎么算、总部怎么算」，只有金额不同，没有流程不同。
      </div>
    </div>

    <!-- ========== 六、功能详细说明 ========== -->
    <div id="rf-func" class="section">
      <div class="section-header">
        <h2>六、功能详细说明</h2>
        <DocCopyButton section-id="rf-func" />
      </div>
      <p class="doc-p">本章按功能块逐节说明；每节开头的「功能入口」对应可走查的原型页面。</p>

      <!-- ===== 6.1 离职需求发起（员工侧） ===== -->
      <div id="rf-entry" class="subsection">
        <div class="section-header">
          <h3>6.1 离职需求发起（员工侧）</h3>
          <DocCopyButton section-id="rf-entry" />
        </div>
        <div class="func-entry"><strong>功能入口：</strong>移动端 → 离职模块 → <strong>离职需求</strong>（<code>/mobile-resign-apply</code>）</div>

      <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary)); margin-bottom: 16px;">
        <strong>两侧分工：</strong>员工在这一侧<strong>发起一条「离职需求」</strong>；
        需求进入我们那一侧后，由<strong>「离职处理」统一处理</strong>（见 6.2）。
        发起侧只采集与确认，<strong>不做审批、不做结算</strong>。
      </div>

      <p class="doc-p">
        现状是<strong>三类人员各有一套发起页</strong>：客户经理与推拿师走门店侧（两步：申请离职 → 签字确认），
        总部走单页提交（发起人 → 审批人 → 抄送人）。字段口径也不统一 —— 日期一个叫「期望离职日期」、一个叫「最后工作日」；
        原因一个多选枚举、一个自由文本。本次收敛为<strong>一张通用发起单</strong>：三类人员共用同一套结构，
        差异只落在配置项上。
      </p>

      <h4 class="h4sub">四区结构</h4>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 130px;">区</th>
            <th style="width: 250px;">字段</th>
            <th style="width: 130px;">填写方式</th>
            <th>来源</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>A 员工基础信息</strong></td>
            <td>姓名 · 工号 · 岗位 / 用工类型 · 部门或门店 · 入职日期</td>
            <td>只读</td>
            <td>新员工关系</td>
          </tr>
          <tr>
            <td rowspan="2"><strong>B 离职意向</strong></td>
            <td><strong>期望离职日期</strong></td>
            <td>员工填写（必填）</td>
            <td>—</td>
          </tr>
          <tr>
            <td><strong>离职原因</strong>：枚举多选（必填）+ 补充说明（可选）</td>
            <td>员工填写</td>
            <td>—</td>
          </tr>
          <tr class="row-mech">
            <td><strong>C 收款账户</strong></td>
            <td>银行卡卡名 · 卡号 · 开户行</td>
            <td><strong>只读（核对）</strong></td>
            <td>新员工关系</td>
          </tr>
          <tr>
            <td><strong>D 审批链</strong></td>
            <td>审核人 · 抄送人</td>
            <td>系统按角色带出</td>
            <td>岗位 / 用工类型配置</td>
          </tr>
        </tbody>
      </table>

      <h4 class="h4sub">三条统一口径</h4>
      <ul class="rf-list">
        <li>
          <strong>流程统一为两步：申请离职 → 签字确认。</strong>
          总部侧原先的单页提交并进来，同样走签字确认 —— 三类人员的「离职事实」由同一套签署动作产生，
          下游消费的时点才一致。
        </li>
        <li>
          <strong>日期统一为「期望离职日期」。</strong>
          不再出现「最后工作日」这个叫法。期望日期由员工填，实际离职日期由审批人填并锁定（见 6.2），
          两者不在同一层，不混用。
        </li>
        <li>
          <strong>原因统一为「枚举多选 + 可选补充说明」。</strong>
          枚举用于统计与分析（工资太低 / 离家太远 / 结婚生子 / 自主创业 / 照顾家庭），
          补充说明承接总部原先的自由文本表达。
        </li>
      </ul>

      <h4 class="h4sub">三类人员的展示差异</h4>
      <p class="doc-p">
        结构统一，但<strong>展示的信息随岗位不同</strong>，审批链也随之不同。差异只体现在<strong>字段集</strong>上，
        <strong>不设分组标题</strong>；正式开发由新员工关系<strong>自动判断岗位</strong>，无需人工选择（原型在页头右侧留了隐蔽的切换入口）。
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 110px;">岗位</th>
            <th style="width: 260px;">岗位差异字段</th>
            <th>审批链</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>推拿师</strong></td>
            <td>技法 · 等级 · 合同门店</td>
            <td>人事经理（2 人）→ 抄送招生老师 / 技术副总 / 城市总 / 法务专员</td>
          </tr>
          <tr>
            <td><strong>客户经理</strong></td>
            <td>合同门店</td>
            <td>城市总（1 人）→ 抄送招生老师 / 法务专员</td>
          </tr>
          <tr>
            <td><strong>总部</strong></td>
            <td>所在部门（<strong>无技法、无门店</strong>）</td>
            <td>单一审批人（可更换）→ 抄送法务专员</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>精简原则：</strong>发起单只收<strong>与这笔离职相关</strong>的档案信息，不复制档案全量。
        因此客户经理不展示等级与在管会员、总部不展示职级 —— 它们不影响离职办理，也不影响下游结算。
        门店统一叫<strong>合同门店</strong>（合同主体所在门店），不用「主服务门店」这类日常经营口径。
        三类人员发起后<strong>都进入同一个「离职处理」</strong>，处理侧按岗位渲染详情（总部的字段与动作差异见 6.2）。
      </div>

      <h4 class="h4sub">收款账户（银行卡）</h4>
      <p class="doc-p">
        现状总部发起页的卡名 / 卡号 / 开户行三项<strong>均为灰底只读</strong>，说明数据已在新员工关系里 —— 发起页只是摆出来核对。
        因此通用发起单里 C 区的正确形态是<strong>引用档案 + 发起时核对</strong>，不是新增录入。
      </p>
      <ul class="rf-list">
        <li><strong>用途：</strong>最后工资与一次性补偿金的收款账户。它不是「员工填的信息」，而是<strong>钱的出口地址</strong>。</li>
        <li><strong>处理侧默认显示：</strong>人事审批页直接展示这三项，等于在批一笔钱之前先看到钱往哪打。</li>
        <li><strong>不在本场景改：</strong>卡信息以新员工关系为准；本场景只呈现与留痕，不提供修改入口（待决见附录）。</li>
      </ul>

      <h4 class="h4sub">发起后产生什么</h4>
      <ul class="rf-list">
        <li><strong>一条「离职需求」</strong>：带需求编号、期望离职日期、原因、收款账户、审批链，状态为<strong>待审核</strong>。</li>
        <li><strong>进入「离职处理」</strong>：需求在人事侧的统一列表里出现，与异常监控触发的解除用工<strong>同处一套处理流程</strong>（见 6.2）。</li>
        <li><strong>不在发起侧发生的事</strong>：实际离职日期、剩余资产、补偿金、协议签署 —— 全部归处理侧。</li>
      </ul>
    </div>

      <!-- ===== 6.2 离职处理（统一处理） ===== -->
      <div id="rf-process" class="subsection">
        <div class="section-header">
          <h3>6.2 离职处理（统一处理）</h3>
          <DocCopyButton section-id="rf-process" />
        </div>
        <div class="func-entry"><strong>功能入口：</strong>移动端 → 离职模块 → 离职列表 / 离职审批页（<code>/mobile-resign-pd</code>）</div>

      <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary)); margin-bottom: 16px;">
        <strong>一句话定位：</strong>不管需求从哪来 —— <strong>员工发起</strong>还是<strong>异常监控触发</strong> ——
        落到我们这里都是<strong>同一套「离职处理」</strong>：定实际离职日期、落地状态、呈现剩余资产、录入协商金额、交付下游。
      </div>

      <p class="doc-p">
        处理侧的入口有两个，性质不同，对额度折算与下游结算的影响完全不同，必须分开对待。
      </p>

      <h4 class="h4sub">列表结构（两个 Tab）</h4>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 130px;">Tab</th>
            <th style="width: 200px;">承载</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>主动离职</strong></td>
            <td>员工侧发起的离职需求</td>
            <td>本次处理的主线；列表按角标区分待审核 / 已离职，姓名旁标岗位（原型对照用）</td>
          </tr>
          <tr>
            <td><strong>异常监控</strong></td>
            <td>未出勤等异常触发的解除用工</td>
            <td>操作入口为「暂停用工 / 解除用工」；解除 = 系统离职，详见下方小节。<strong>分阶段可见</strong>，见下</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>只保留这两类：</strong>本模块是在<strong>重构离职</strong>，只处理「人怎么走」；
        现有系统列表里的<strong>【合同续签】Tab 不纳入本模块</strong> —— 合同续签属于<strong>人员异动</strong>（合同层面的续、改、止），
        不产生离职事实，也不进离职签署与补偿金链路，故不复刻。
      </div>

      <h4 class="h4sub">异常监控的分阶段可见性（总部员工依赖假勤）</h4>
      <p class="doc-p">
        「异常」的数据源<strong>不是同一套</strong>，这直接决定了异常监控能不能一次上全：
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 150px;">人群</th>
            <th style="width: 210px;">异常来源</th>
            <th>依赖</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>门店侧</strong><br />（推拿师 / 客户经理）</td>
            <td>连续未出勤（排班 / 接单数据可判）</td>
            <td>离职侧已有数据，<strong>阶段一即可上线</strong></td>
          </tr>
          <tr>
            <td><strong>总部员工</strong></td>
            <td><strong>考勤异常</strong></td>
            <td>依赖<strong>【假勤】</strong>的考勤异常输出 —— 涉及假勤侧需求，<strong>本期不展开</strong></td>
          </tr>
        </tbody>
      </table>
      <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary));">
        <strong>因此开发分阶段，且「提供不了就不展示」：</strong>
        <ul class="rf-list" style="margin: 8px 0 0;">
          <li><strong>阶段一：</strong>只接门店侧未出勤异常，异常监控按现有形态展示。</li>
          <li><strong>阶段二：</strong>假勤能稳定输出总部考勤异常后，再把总部人群并入同一套处理。</li>
          <li>
            <strong>关键约束：</strong>总部异常数据提供不了时，<strong>该部分整体不展示</strong> ——
            不做灰置、不做空列表、不给「暂无数据」。因为空列表会被读成「总部没有异常」，是很危险的误读。
            是否展示由<strong>数据源是否就绪</strong>判断（配置开关），不在前端写死。
          </li>
        </ul>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 120px;">入口</th>
            <th style="width: 180px;">流程形态</th>
            <th style="width: 150px;">日期语义</th>
            <th>关键差异</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>主动离职</strong></td>
            <td>有完整流程：期望离职日期 → 审批 → 实际离职日期锁定 → 发送离职协议</td>
            <td>期望日期 + 实际日期</td>
            <td>实际离职日期由审批人填写，<strong>一旦审批通过即锁定、不可撤销</strong>。它是下游结算的锚点</td>
          </tr>
          <tr>
            <td><strong>异常监控<br />（解除用工）</strong></td>
            <td>无流程入口：未出勤触发，没有申请、没有审批</td>
            <td>无日期，需人事确认</td>
            <td>「最后工作日」语义模糊，须由人事确认一个<strong>离职事实时点</strong>再交付下游；<strong>不走签署</strong>，但取消班次 / 截断权限<strong>照常执行</strong>；<strong>资产处理在解除确认页一并完成</strong>（本版补齐，见下）</td>
          </tr>
        </tbody>
      </table>

      <div class="note">
        <strong>审批与签署的衔接：</strong>主动离职在审批通过后走「发送离职协议 → 员工签署」。签署是否完成，
        决定了这笔离职的补偿金<strong>成不成立</strong>（见 6.3）—— 注意是「协议成不成立」，不是「金额生不生效」：
        签署时金额还只有预估，真实金额要到次月 5 日跑批才被算出来（见 6.7）。
      </div>

      <h4 class="h4sub">异常监控【解除用工】：只标记离职，不走签署</h4>
      <p class="doc-p">
        异常监控里的<strong>【解除用工】</strong>执行后，员工状态被标记为<strong>离职</strong>（系统离职）——
        这是一次<strong>状态写入</strong>，不是一次流程走完。它与主动离职的处理必须分清两件事：
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 200px;">维度</th>
            <th style="width: 190px;">主动离职</th>
            <th>异常监控（解除用工）</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>员工侧「离职需求」发起</td>
            <td>有</td>
            <td><strong>没有</strong>（员工不会自己发起）</td>
          </tr>
          <tr>
            <td>人事审批</td>
            <td>有（定实际离职日期、离职类型、协商金额）</td>
            <td><strong>没有</strong>；离职事实时点由人事在操作时确认</td>
          </tr>
          <tr>
            <td>离职协议签署</td>
            <td>走签署状态机（待发起 → 待员工签署 → 签署完成）</td>
            <td><strong>不走签署</strong>；6.3 的状态机对这类记录不适用，明细上也不产生待签署记录</td>
          </tr>
          <tr>
            <td>员工状态</td>
            <td>离职</td>
            <td>离职（<strong>系统离职</strong>）</td>
          </tr>
          <tr>
            <td>排班取消 / 接单权限截断</td>
            <td>审批通过后执行</td>
            <td><strong>照常执行，不因「没走流程、没签协议」而免除</strong></td>
          </tr>
        </tbody>
      </table>
      <div class="note" style="background: hsl(0 72% 51% / 0.06); border-left: 3px solid hsl(0 72% 51% / 0.6);">
        <strong>关键区分（容易漏）：</strong>「签署」只决定<strong>这笔协商类补偿金成不成立</strong>（要不要往下算）；
        「排班取消 / 接单权限截断」由<strong>离职状态生效</strong>驱动，与签署无关。
        所以解除用工虽然没有签署这一环，<strong>取消班次等动作仍然必须执行</strong> ——
        触发点是「解除用工确认、离职状态生效那一刻」，而不是「签署完成」。
        否则就会出现人已系统离职、排班还挂在门店表上的空档。
      </div>

      <h4 class="h4sub">补齐：解除用工的资产处理（只补处置，不补审批）</h4>
      <p class="doc-p">
        【解除用工】缺的是<strong>审批</strong>，不是<strong>资产处置</strong>。被解除的员工同样有常乐豆余额要处理，
        也可能有补偿金要发 —— 现状只有「标记离职」，这两件事没有入口承接。本版把它们补在<strong>解除确认页</strong>，
        与解除确认<strong>同一次提交</strong>完成：
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 150px;">环节</th>
            <th style="width: 240px;">在哪做</th>
            <th>口径</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>剩余资产</strong></td>
            <td>解除确认页 · 只读呈现</td>
            <td>与主动离职同一套面板：只呈现、不计算；可提取额在次月 4 日晚充值进账户前是约数</td>
          </tr>
          <tr>
            <td><strong>款项出口</strong></td>
            <td>解除确认页 · 人事选择</td>
            <td>常乐豆二选一（一次性补偿金 / 并入薪金），默认并入薪金；由协商结果确定</td>
          </tr>
          <tr>
            <td><strong>离职补偿金</strong></td>
            <td>解除确认页 · 人工录入</td>
            <td>同一套规则：默认 0、不允许负数、上限 = 月均 ×（N+1）；<strong>金额 &gt; 0 必须上传依据附件</strong></td>
          </tr>
          <tr>
            <td><strong>成立点</strong></td>
            <td>—</td>
            <td>不走签署，所以<strong>不产生待签署行</strong>；补偿金以<strong>解除确认提交</strong>为成立点（见 6.3）</td>
          </tr>
        </tbody>
      </table>
      <ul class="rf-list">
        <li><strong>不新增审批链。</strong>解除用工仍是「状态写入 + 资产处置」同一次提交，不引入审批节点，也不发起离职协议签署。</li>
        <li><strong>提交即锁定。</strong>出口与补偿金随解除一起生效、不可撤销；排班取消与权限截断照旧由「离职状态生效」驱动。</li>
        <li><strong>依据要留。</strong>补偿金 &gt; 0 时上传的是<strong>补偿依据</strong>（协商记录 / 解除通知），附件规则与主动离职一致，Web 离职补偿金明细可查。</li>
      </ul>

      <h4 class="h4sub">离职类型（处理侧字段）</h4>
      <p class="doc-p">
        审批填写中的<strong>离职类型</strong>标记的是<strong>这笔离职的性质</strong>，与上面的入口相互对应但不是一回事：
      </p>
      <ul class="rf-list">
        <li><strong>主动离职</strong> —— <strong>默认值</strong>。员工侧「离职需求」发起的，落到这里都是主动离职。</li>
        <li><strong>协商一致解除劳动合同</strong> —— 可选。人事与员工协商一致的解除。</li>
        <li>
          <strong>被动离职</strong> —— <strong>不可选</strong>。它由<strong>员工的异常行为触发</strong>
          （异常监控 → 解除用工），是在另一条入口产生的，不在发起与审批表单里选出来。
        </li>
      </ul>

      <h4 class="h4sub">离职状态生效后自动执行</h4>
      <p class="doc-p">
        审批通过、实际离职日期锁定那一刻，离职处理要<strong>主动</strong>发起两件事，而不是等下游「碰到了再说」：
      </p>
      <ul class="rf-list">
        <li>
          <strong>排班全部取消</strong> —— <strong>实际离职日期之后的排班全部取消</strong>，
          <strong>推拿师与客户经理均适用</strong>；既不再排给本人，也不再留在门店的排班表里。
        </li>
        <li><strong>接单权限截断</strong> —— 实际离职日期之后不能再接单。</li>
      </ul>
      <div class="note">
        <strong>两个入口都执行：</strong>主动离职以<strong>审批通过</strong>为触发点；
        异常监控的解除用工<strong>没有审批</strong>，以<strong>解除用工确认（离职状态生效）</strong>为触发点，
        取自人事确认的离职事实时点作为边界。动作清单完全一致，不能因为它「只是标记了一下状态」就不取消班次。
      </div>
      <div class="note">
        <strong>为什么必须显式写：</strong>排班是「未来」的数据 —— 人已经离职，排班却还在，
        会同时产生两个问题：<strong>客户到店无人服务</strong>、<strong>已离职员工仍被计入门店人效</strong>。
        所以取消排班不是下游的「可选反应」，而是离职处理的<strong>审批后动作</strong>。
      </div>

      <h4 class="h4sub">总部员工同样有离职详情（但字段与动作不同）</h4>
      <p class="doc-p">
        总部员工也能在发起侧提交「离职需求」，因此<strong>处理侧必须有对应的离职详情</strong>，
        不能只做门店侧的表单 —— 否则总部的需求进来就成了无法处理的孤儿单。详情页按岗位渲染，差异有三处：
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 150px;">区域</th>
            <th style="width: 250px;">门店侧（推拿师 / 客户经理）</th>
            <th>总部员工</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>员工信息</td>
            <td>合同门店（推拿师另含等级 / 技法）</td>
            <td><strong>所在部门</strong>；无技法、无门店、无等级</td>
          </tr>
          <tr>
            <td>经营指标</td>
            <td>上月产值 / 回头率 / 预约率 / 评分 / 技术评分</td>
            <td><strong>不展示</strong>（总部不承接业务，这些指标对其无意义）</td>
          </tr>
          <tr>
            <td>审批后动作</td>
            <td>取消实际离职日期后的排班 + 截断接单权限</td>
            <td>两项均<strong>不适用</strong>（总部不排班、不接单），页面上显示「不适用」<strong>而不是 0</strong></td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>为什么写「不适用」而不是「0」：</strong>「0 个排班被取消」会被读成「查过了、确实没有」，
        而总部的情况是<strong>这个动作本身不存在</strong>。两者含义不同，人事据此判断的结论也不同。
        同理，审批确认条款在总部岗位上要去掉排班与接单两条，保留日期锁定与不可撤销。
      </div>
    </div>

      <!-- ===== 6.3 离职合同签署状态机 ===== -->
      <div id="rf-fsm" class="subsection">
        <div class="section-header">
          <h3>6.3 离职合同签署状态机</h3>
          <DocCopyButton section-id="rf-fsm" />
        </div>
        <div class="func-entry"><strong>功能入口：</strong>Web → 离职 → 离职补偿金明细 · 签署状态列（<code>/resign-compensation-ledger</code>）</div>

      <div class="note">
        <strong>适用范围：</strong>只覆盖主动离职 / 协商一致解除劳动合同；<strong>异常监控【解除用工】不走签署</strong>，
        这类记录不进入状态机、明细上也不产生待签署行（见 6.2）。
        它的补偿金<strong>以「解除确认提交」为成立点</strong>，不经过「待成立 → 已成立」的翻牌。
      </div>

      <div class="note">
        <strong>签署走电子签，没有人工用印环节：</strong>发起 → 员工签署 → 电子签平台自动落章出证 → 签署完成。
        员工签完<strong>不需要再等公司盖章</strong>，所以「员工已签 → 签署完成」这一步是<strong>平台出证</strong>，不是人工审批动作 ——
        只有出证失败 / 超时才需要人工介入。
      </div>

      <h3>先拧清顺序：协议先走，金额后置</h3>
      <div class="note" style="background: hsl(0 72% 51% / 0.06); border-left: 3px solid hsl(0 72% 51% / 0.6);">
        <strong>容易写反的地方：</strong>签署那一刻，明细上只有一个<strong>预估</strong>（协商现金 + 常乐豆约数），
        <strong>并没有一个最终金额在那里等着被「生效」</strong>。
        签署成立的是<strong>这笔补偿金的协议</strong> —— 双方就「给不给、按什么构成给、走哪个出口」达成一致；
        <strong>真实金额是协议成立之后才被算出来的</strong>（次月 5 日冻结余额后跑批，6 日报税后定稿）。
        <br />
        算出来的值<strong>不需要再签一次确认</strong>，也不存在「签署让这个金额生效」这个动作 ——
        金额的定稿只跟计算与报税有关。所以正确的说法是 ——
        <strong>签署决定这笔补偿金成不成立；金额由成立之后的计算产生、报税后定稿。</strong>
      </div>

      <h3>一条补偿金的时间顺序</h3>
      <ol class="chg-list">
        <li><strong>录入协商方案</strong>：人事在离职审批里填协商现金、选常乐豆出口 —— 得到<strong>预估</strong>（现金 + 常乐豆约数），此时金额尚未确定。</li>
        <li><strong>发起签署 → 员工签署</strong>：走<strong>电子签</strong>，员工签完由平台自动落章出证，签署完成，<strong>协议成立</strong>。此刻明细上仍是预估，金额没有被改写。</li>
        <li><strong>次月 3 日 → 4 日晚</strong>：薪酬与常乐豆一起结算完，4 日晚把<strong>抵扣后的余额充值进常乐豆账户</strong> —— 钱进账户时余额就已经是准确的，不需要再等取数。</li>
        <li><strong>次月 5 日</strong>：离职通道按流程<strong>冻结</strong>这笔余额（冻结是唯一动作，不再等余额「可读」）；同日跑批取<strong>冻结值 + 协商现金</strong>、算【补偿金个税】—— 得到<strong>申报前的计算值</strong>。当月该抵扣的在 3 日已抵扣完，这里<strong>不再二次扣</strong>。</li>
        <li><strong>次月 6 日</strong>：<strong>报税</strong>（工资薪金 / 一次性补偿金两个科目分别申报）；税局返回后回写工资单与补偿金单，<strong>两张单的数据到此才完善</strong>。</li>
        <li><strong>报税之后 → 次月 9 日</strong>：数据完善才出付款单，9 日打款到账，到账金额与时间回写明细，与预估的差在此闭环。</li>
      </ol>

      <h3>正向主链路</h3>
      <div class="fsm-row">
        <template v-for="(n, i) in fsmMain" :key="n.key">
          <span :class="['fsm-node', { final: n.key === 'completed' }]">{{ n.label }}</span>
          <span v-if="i < fsmMain.length - 1" class="fsm-arrow">→</span>
        </template>
      </div>

      <h3>失败分支</h3>
      <div class="fsm-row">
        <span class="fsm-node bad">已拒签</span>
        <span class="fsm-arrow">/</span>
        <span class="fsm-node bad">已作废</span>
      </div>

      <h3>签署状态 → 补偿金成立</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 200px;">签署状态</th>
            <th style="width: 110px;">补偿金</th>
            <th>接下来会发生什么</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in fsmRows" :key="s.state">
            <td><strong>{{ s.state }}</strong></td>
            <td><span :class="['eff', s.establish]">{{ s.establishText }}</span></td>
            <td>{{ s.desc }}</td>
          </tr>
        </tbody>
      </table>

      <div class="note">
        <strong>核心口径：</strong>明细上的金额在签署阶段是<strong>挂账的预估</strong>；
        签署决定的是<strong>这笔补偿金成不成立</strong>（不成立就根本不进计算）。
        成立之后，金额按薪酬的规则在<strong>次月 5 日跑批</strong>算出来、<strong>6 日报税后定稿</strong>，<strong>9 日</strong>照常发放 ——
        两条时间线（协议线 / 算钱线）并行，签署既不提前产生金额，也不改变 5 日跑批 / 6 日报税 / 9 日发放的节奏。
      </div>
    </div>

      <!-- ===== 6.4 剩余资产可见 ===== -->
      <div id="rf-asset" class="subsection">
        <div class="section-header">
          <h3>6.4 剩余资产可见</h3>
          <DocCopyButton section-id="rf-asset" />
        </div>
        <div class="func-entry"><strong>功能入口：</strong>移动端 → 离职审批页 · 剩余资产卡片（<code>/mobile-resign-pd/detail?id=rs01</code>）</div>

      <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary)); margin-bottom: 16px;">
        <strong>一句话定位：</strong>让这笔账在离职那一步<strong>看得见</strong>。面板只取数、只呈现 —— <strong>不结算、不计算</strong>；
        真正锁住它的动作是<strong>次月 5 日冻结余额</strong>（见 6.8），不是审批时就冻。
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 150px;">资产项</th>
            <th style="width: 150px;">数据来源</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>常乐豆</strong></td>
            <td>常乐豆系统 / 薪酬结算</td>
            <td>三层分开显示：<strong>当前账面余额 / 待结数量 / 可提取</strong>。审批阶段看到的是<strong>负工资处理后的预估值</strong>（标「约」）；<strong>准确值要等次月 4 日晚充值进账户后才产生、5 日由离职通道冻结锁定</strong>。可提取额不是账面余额，冻结前也不是一个锁定的数</td>
          </tr>
          <tr>
            <td><strong>负工资账户</strong></td>
            <td>薪酬</td>
            <td><strong>只展示余额</strong>。抵扣 / 清零不在离职侧计算，也不在此呈现过程</td>
          </tr>
          <tr>
            <td><strong>剩余福利假额</strong></td>
            <td>假勤</td>
            <td>假勤出结果，离职侧只呈现天数，不折算、不结算</td>
          </tr>
          <tr>
            <td><strong>在途协商扣缴</strong></td>
            <td>薪酬扣缴协商</td>
            <td>协议总额 / 每月扣除 / 剩余未扣。离职后剩余部分如何处置<strong>待决</strong>（见附录）</td>
          </tr>
        </tbody>
      </table>

      <h3>两条表达纪律</h3>
      <ul class="rf-list">
        <li>
          <strong>常乐豆按「预估」表达，不给精确结果数的观感。</strong>
          常乐豆在离职处理阶段随结算与负工资计算实时变动，界面上数值一律标「约」并加「预估」标识，文案明写「最终以薪酬实际结算为准」。
        </li>
        <li>
          <strong>面板上的数不能直接当「能提多少」。</strong>
          人事看到「账面余额 820」时，中间还夹着一道负工资抵扣，所以必须区分<strong>当前账面余额</strong>与<strong>可提取余额</strong>；
          审批时看到的是负工资处理后的预估值，标注「约」；<strong>准确值在次月 4 日晚充值进账户后替换进来、5 日冻结锁定</strong>，在此之前显示「待次月充值后确认」。
        </li>
      </ul>

      <div class="note" style="background: hsl(0 65% 50% / 0.06); border-left: 3px solid hsl(0 65% 50%);">
        <strong>预估数据的用途声明：</strong>面板上必须让使用者知道这是<strong>预估</strong>、以薪酬实际结算为准。
        否则人事拿预估数去跟员工谈，事后数字变了就是纠纷。
      </div>
    </div>

      <!-- ===== 6.5 款项出口 ===== -->
      <div id="rf-payout" class="subsection">
        <div class="section-header">
          <h3>6.5 款项出口</h3>
          <DocCopyButton section-id="rf-payout" />
        </div>
        <div class="func-entry"><strong>功能入口：</strong>移动端 → 离职审批页 · 款项出口卡片（<code>/mobile-resign-pd/detail?id=rs01</code>）</div>

      <p class="doc-p">
        员工手里的<strong>常乐豆余额</strong>要拿回去时，从哪条通道出去是可选的。
        通道由<strong>人事与员工协商确定</strong> —— 协商结果同时决定<strong>处理金额</strong>与<strong>个税归属</strong>。
        这是离职侧提供的设计：<strong>判断权交给人，系统负责留痕</strong>。
      </p>

      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 150px;">出口</th>
            <th style="width: 110px;">默认</th>
            <th style="width: 230px;">个税申报科目</th>
            <th>申报备注（原文）</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>一次性补偿金</strong></td>
            <td>—</td>
            <td>解除劳动合同一次性补偿金</td>
            <td><code>【解除劳动合同一次性补偿金】</code></td>
          </tr>
          <tr>
            <td><strong>并入薪金</strong></td>
            <td><strong>现状默认</strong></td>
            <td>工资薪金</td>
            <td><code>【工资薪金】</code></td>
          </tr>
        </tbody>
      </table>

      <div class="note">
        <strong>两个入口都要选出口：</strong>主动离职在审批页选；异常监控【解除用工】在解除确认页选（见 6.2）——
        出口是资产处置的一部分，<strong>不因「没有审批流程」而省略</strong>。
      </div>

      <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary));">
        <strong>两个出口 = 两个个税申报科目，计税口径不同。</strong>
        选哪一个出口，决定的不是「给不给这笔钱」，而是它<strong>落进哪个申报科目</strong>、按哪套规则计税。
        <strong>出口由人事协商结果确定</strong>，不是系统自动判定。详细的流向归集见<strong>第七章</strong>。
      </div>

      <h3>三条约束</h3>
      <ul class="rf-list">
        <li><strong>出口不含福利假。</strong>出口只针对常乐豆余额；剩余福利假额不走出口。</li>
        <li><strong>时序依赖。</strong>出口提取基数 = 当月抵扣后、<strong>4 日晚充值进账户</strong>、并经 <strong>5 日冻结</strong>锁定的余额。冻结动作只发生在 5 日 —— 因此「按锁定后的余额选出口 + 冻结」这件事只能排在 <strong>5 日</strong>，审批当时只能按约数先谈。</li>
        <li><strong>计税规则不在这里定义。</strong>两条通道的钱怎么定性、怎么计税由薪酬 / 财税按规则走，离职侧只记录「选了哪个出口」。</li>
      </ul>
    </div>

      <!-- ===== 6.6 资产流向与税务归集 ===== -->
      <div id="rf-taxflow" class="subsection">
        <div class="section-header">
          <h3>6.6 资产流向与税务归集</h3>
          <DocCopyButton section-id="rf-taxflow" />
        </div>
        <div class="func-entry"><strong>功能入口：</strong>—（本节为口径与流向图，无对应页面）</div>

      <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary)); margin-bottom: 16px;">
        <strong>一句话：</strong>同一笔钱，<strong>计算时的归属</strong>与<strong>报税时的归属</strong>是两件事。
        计算归属回答「谁算这个数」，报税归属回答「这笔钱进哪个个税申报科目、怎么计税」。
        离职侧要保证的是<strong>协商结果（含出口）被完整记录</strong>，落表由薪酬 / 财税按规则执行。
      </div>

      <h3>两个申报科目：关键差异</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 230px;">个税申报科目</th>
            <th style="width: 260px;">申报备注（原文）</th>
            <th>适用款项</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>解除劳动合同一次性补偿金</strong></td>
            <td><code>【解除劳动合同一次性补偿金】</code></td>
            <td>走「一次性补偿金」出口的款项：离职补偿金（协商类）＋ 常乐豆若选此出口</td>
          </tr>
          <tr>
            <td><strong>工资薪金</strong></td>
            <td><code>【工资薪金】</code></td>
            <td>当月工资；常乐豆若选「并入薪金」</td>
          </tr>
        </tbody>
      </table>

      <h3>资产流向图：从计算归属 → 出口 → 报税归属 → 计提</h3>
      <div class="mn-flow">
        <!-- 三笔钱：来源 · 计算归属 · 出口 -->
        <div class="mn-row3">
          <div class="mn-card">
            <div class="mn-card-t">当月工资</div>
            <ul class="mn-list">
              <li>计算归属：<b>薪酬</b></li>
              <li>服务 / 订单事实数据，算法同在职</li>
              <li>出口：<b>固定 · 走薪金</b></li>
            </ul>
          </div>
          <div class="mn-card">
            <div class="mn-card-t">常乐豆余额 <span class="mn-chip">5 日冻结后</span></div>
            <ul class="mn-list">
              <li>计算归属：<b>人事协商结果</b></li>
              <li>处理金额与个税归属均由协商确定</li>
              <li>出口：<b>协商确定 · 二选一</b></li>
            </ul>
          </div>
          <div class="mn-card dark">
            <div class="mn-card-t">离职补偿金 <span class="mn-chip ghost">协商类 · 人工录入</span></div>
            <ul class="mn-list">
              <li>计算归属：<b>人事手输</b></li>
              <li>上限 = 月均 ×（N+1）（N+1 即唯一上限）</li>
              <li>出口：<b>固定 · 走补偿金</b></li>
            </ul>
          </div>
        </div>
        <div class="mn-arrows cols3"><span>↓</span><span>↓</span><span>↓</span></div>

        <!-- 归集规则横幅 -->
        <div class="mn-banner">
          <b>按申报科目归集 —— 一个科目 → 一张单 → 一次申报 → 一笔付款</b>
          <span class="mn-banner-sub">同科目不拆、跨科目不并（并了申报与到账就对不上）；最多 2 张单 / 2 次申报 / 2 笔付款</span>
        </div>
        <div class="mn-arrows single"><span>↓</span></div>

        <!-- 单据与申报科目 -->
        <div class="mn-label">单据与个税申报科目</div>
        <div class="mn-row2">
          <div class="mn-card plain">
            <div class="mn-card-t">工资单</div>
            <div class="mn-card-sub">当月工资 ＋ 常乐豆若走「并入薪金」</div>
            <div class="mn-tax salary">【工资薪金】<span>申报备注原文</span></div>
          </div>
          <div class="mn-card plain">
            <div class="mn-card-t">补偿金单</div>
            <div class="mn-card-sub">离职补偿金 ＋ 常乐豆若走「一次性补偿金」</div>
            <div class="mn-tax comp">【解除劳动合同一次性补偿金】<span>申报备注原文</span></div>
          </div>
        </div>
        <div class="mn-arrows single"><span>↓</span></div>

        <!-- 收口横幅：财务人工计提 -->
        <div class="mn-banner final">
          <b>最后一步 · 财务人工计提科目（资金流到此收口）</b>
          <span class="mn-banner-sub">补偿金单由财务按【解除劳动合同一次性补偿金】科目人工计提，与申报科目一致；不随发薪自动产生，工资部分随工资计提</span>
        </div>
      </div>

      <h3>几张单、几次个税申报</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 190px;">情形</th>
            <th style="width: 175px;">工资单</th>
            <th style="width: 175px;">补偿金单</th>
            <th>个税申报</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>有一次性补偿</strong><br />（离职补偿金 &gt; 0，或常乐豆协商走补偿金出口）</td>
            <td>1 张<br /><span class="tf-sub">工资 ＋ 常乐豆若走薪金</span></td>
            <td>1 张<br /><span class="tf-sub">离职补偿金 ＋ 常乐豆若走补偿金</span></td>
            <td><strong>2 次</strong>：工资薪金申报 ＋ 一次性补偿金申报</td>
          </tr>
          <tr>
            <td><strong>无一次性补偿</strong><br />（离职补偿金 = 0 且常乐豆走薪金或为 0）</td>
            <td>1 张</td>
            <td>0 张（不产生）</td>
            <td><strong>1 次</strong>：仅工资薪金申报</td>
          </tr>
        </tbody>
      </table>

      <div class="note" style="background: hsl(45 93% 47% / 0.08); border-left: 3px solid hsl(45 93% 47%);">
        <strong>口径说明：</strong>上表的「张数」是<strong>按个税申报科目归集</strong>得出的结论 ——
        离职这一批款项最多落进 <strong>2 个申报科目</strong>，因此最多 <strong>2 张单 / 2 次申报 / 2 笔付款</strong>。
        一个科目 → 一张单 → 一次申报 → 一笔付款，<strong>同科目不拆、跨科目不并</strong>；不随人数或月份累加。
        实际发薪是否与工资同批、是否另起一次发放，由薪酬侧的发薪批次安排决定，本场景不参与（见附录待决）。
      </div>
    </div>

      <!-- ===== 6.7 离职补偿金明细 ===== -->
      <div id="rf-comp" class="subsection">
        <div class="section-header">
          <h3>6.7 离职补偿金明细</h3>
          <DocCopyButton section-id="rf-comp" />
        </div>
        <div class="func-entry"><strong>功能入口：</strong>移动端离职审批 · 补偿金卡片 + Web 明细（<code>/resign-compensation-ledger</code>）</div>

      <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary)); margin-bottom: 16px;">
        <strong>一句话定位：</strong>承载「<strong>不在薪酬与福利资产自动核算范围内</strong>」的<strong>其他协商类金额</strong>。
        系统不猜金额，只保证「钱走哪条路、谁记的、什么状态」可追溯。
      </div>

      <h3>录入规则</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 150px;">规则</th>
            <th>内容</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>承载范围</strong></td><td>薪酬与福利资产自动核算之外的<strong>协商类</strong>金额。福利假额等自动核算项不出现在这里</td></tr>
          <tr><td><strong>录入入口</strong></td><td><strong>两个</strong>：主动离职在审批页录入（金额随签署成立）；异常监控【解除用工】在解除确认页录入（<strong>随解除确认提交成立</strong>，见 6.2）</td></tr>
          <tr><td><strong>默认值</strong></td><td><strong>0</strong></td></tr>
          <tr><td><strong>取值范围</strong></td><td><strong>0 ～ 上限</strong>：上限 = <strong>过去 12 个月平均收入 ×（N+1）</strong>（N+1 为唯一上限，不叠单笔封顶）；<strong>不允许输入负数</strong></td></tr>
          <tr><td><strong>计算方式</strong></td><td>系统<strong>不自动折算</strong>，由人事与员工协商后手工录入</td></tr>
          <tr><td><strong>附件</strong></td><td>金额 &gt; 0 时<strong>必须上传协商协议附件</strong>，否则不能提交审批（见下）</td></tr>
          <tr><td><strong>备注</strong></td><td>自由文本，用于说明本笔协商类金额的构成与依据（<strong>不做结构化明细</strong>）</td></tr>
        </tbody>
      </table>

      <h3>金额上限：过去 12 个月平均收入 ×（N+1）</h3>
      <p class="doc-p">
        审批页的员工信息里<strong>默认显示过去 12 个月平均收入</strong>，审批人不必再去翻薪酬档案 ——
        这个数就是补偿金的计算基数，上限按<strong>月均收入 ×（N+1）</strong>算，且<strong>这就是唯一的上限</strong>：
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 130px;">要素</th>
            <th>口径</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>基数</strong></td><td>员工<strong>过去 12 个月的平均收入</strong>，取数自薪酬；在审批页员工信息处默认可见（怎么取见下一节）</td></tr>
          <tr><td><strong>N</strong></td><td>在本单位工作的年限（本版按整年计）</td></tr>
          <tr><td><strong>+1</strong></td><td>代通知金一个月</td></tr>
          <tr><td><strong>上限</strong></td><td><strong>月均收入 ×（N+1）</strong>，不再叠加单笔封顶 —— 工龄越长上限越高，与协商实际可能达成的金额同向；长工龄员工不会被一个固定数字截断</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>上限是录入约束，不是推荐值</strong> —— 实际金额仍由人事在范围内按协商结果填写。
        上限只约束<strong>人事录入的协商现金</strong>；结转的常乐豆是另一笔取数（5 日冻结值），<strong>不占这个上限</strong> ——
        所以一笔补偿金单的总额可能高于协商现金本身。
      </div>

      <h3>平均工资怎么算（取数方案）</h3>
      <p class="doc-p">
        上限算得准不准，取决于「月均收入」取的是不是同一个口径。当前员工薪酬落在<strong>两套体系</strong>里，
        所以取数按人群分两条：
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 190px;">人群</th>
            <th style="width: 200px;">取数来源</th>
            <th>取的字段</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>推拿师 / 客户经理</strong><br /><span class="tf-sub">门店侧</span></td>
            <td>模块化薪酬 · 人员薪酬明细</td>
            <td><strong>每个月的「收入小计」</strong>（该行工资单的收入汇总），取离职前 12 个薪酬周期<strong>求平均</strong></td>
          </tr>
          <tr>
            <td><strong>总部员工</strong><br /><span class="tf-sub">总部侧</span></td>
            <td>总部薪酬</td>
            <td><strong>指定周期内每月的实发工资</strong>，取离职前 12 个月<strong>求平均</strong></td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>为什么要分两条：</strong>门店侧员工的薪酬已切到模块化薪酬，逐月单据在「人员薪酬明细」里直接可查；
        总部员工仍走总部薪酬体系。<strong>同一个月均收入，暂时两个取数源</strong> —— 口径必须对齐（都取「这个人当月的工资性收入」），
        否则同样工龄的两个人算出来的上限不可比。
        <br />
        门店侧的「收入小计」在这套单据里对应<strong>收入合计</strong>（扣缴前口径）；当前样本扣缴项为空，
        所以它与「应发合计」「实发金额」数值相同。若某月存在扣缴项，按哪个字段取需单独确认（见附录待决）。
      </div>
      <div class="note" style="background: hsl(45 93% 47% / 0.08); border-left: 3px solid hsl(45 93% 47%);">
        <strong>三个还没定死的边界：</strong>
        ① 入职不足 12 个月的，按实际有收入的月份均分还是按 12 个月补零；
        ② 长期无薪假 / 停职月份的月份是否计入分母；
        ③ 月均收入<strong>取不到</strong>时（异常监控入口、总部数据未同步）是阻断提交、还是提示后由人事人工核对录入。
        当前原型取第三种做兜底：取不到时<strong>不写死上限</strong>，界面提示「未取到月均收入」，由人事自行核对 ——
        但这是<strong>待决</strong>，见附录。
      </div>

      <h3>协商协议附件（填了金额就必传）</h3>
      <ul class="rf-list">
        <li>只要补偿金金额 <strong>&gt; 0</strong>，<strong>必须上传协商协议附件</strong>，否则审批提交不可用；金额为 0 时不必上传。</li>
        <li>格式 PDF / JPG / PNG，单个不超过 10MB，最多 3 个。</li>
        <li>附件是<strong>这笔金额的依据</strong>：谈成什么、谁谈的，书面留档；Web 端「离职补偿金明细」可查看与回看。</li>
        <li>附件与金额一起挂在录入记录上，后续重算 / 修正 / 稽核都以它为准，不靠口头或线下邮件补。</li>
      </ul>

      <h3>明细要回答的五件事</h3>
      <div class="rf-grid">
        <div class="rf-card" v-for="c in compKeys" :key="c.title">
          <div class="rf-card-title">{{ c.title }}</div>
          <div class="rf-card-desc">{{ c.desc }}</div>
        </div>
      </div>

      <h3>金额的三个时点：预估 → 计算 → 发放</h3>
      <p class="doc-p">
        明细里一笔补偿金<strong>不是一个数，而是三段数</strong>。因为从签协议到真正打款，中间还隔着两件会改变金额的事：
        <strong>员工可能继续上班</strong>（常乐豆余额继续变）、<strong>当月工资的负数会用常乐豆抵扣</strong>（3 日算、4 日晚充值进账户，余额即抵扣后的值）。
        所以签协议时只能给预估值，计算才是结算后的真实数，发放才是最终到账数。
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 80px;">时点</th>
            <th style="width: 180px;">什么时候</th>
            <th>金额是什么</th>
            <th style="width: 150px;">数从哪来</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>预估</strong></td>
            <td><strong>签署发起时</strong>（离职流程内录入）</td>
            <td>
              <strong>协商现金 + 常乐豆出口余额（约）</strong>。常乐豆一律标「约」，它还不是结算后的真实值 ——
              这是签协议时双方看到的数
            </td>
            <td>人事录入 + 常乐豆 / 负工资余额</td>
          </tr>
          <tr>
            <td><strong>计算</strong></td>
            <td><strong>次月 5 日</strong>（冻结后跑批）<br />→ <strong>6 日报税后定稿</strong></td>
            <td>
              <strong>协商现金 + 冻结值</strong>（冻结值已含当月负工资等抵扣，<strong>不再二次扣</strong>），
              再算<strong>【补偿金个税】</strong>，得出<strong>申报前的计算值</strong>；
              6 日报税、税局返回后回写，<strong>个税与实发在此定稿</strong>（税前 / 税 / 实发三段都留）
            </td>
            <td>数仓取数 + 薪酬计算 + 报税</td>
          </tr>
          <tr>
            <td><strong>发放</strong></td>
            <td><strong>次月 9 日</strong>（发薪日）</td>
            <td>6 日报税、两张单数据完善后才出付款单；9 日打款，<strong>到账金额与到账时间回写明细</strong>，与预估的差在此闭环</td>
            <td>付款单 / 银行回执</td>
          </tr>
        </tbody>
      </table>

      <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary));">
        <strong>为什么三段都得留（一个具体例子）：</strong>
        签署发起时，常乐豆约 <strong>300</strong> + 协商现金 <strong>1000</strong> = 预估 <strong>约 1,300</strong>；
        员工继续出勤到 10-31，11/3 结算后常乐豆为 <strong>370</strong>，其中 <strong>50 抵了当月负工资</strong>，
        11/4 晚进账户的余额 <strong>320</strong>（5 日冻结锁定）—— 税前 <strong>1,320</strong>（1000 + 320），
        补偿金个税 <strong>27</strong>，9 日实际到账 <strong>1,293</strong>，比预估<strong>少 7</strong>。
        只记一个金额的话，这 7 块既解释不了、也追溯不到为什么从 300 变成了 320；所以明细要同时留「预估 / 计算 / 发放」+ <strong>差异原因</strong>。
      </div>

      <h3>状态与成立</h3>
      <ul class="rf-list">
        <li>明细的<strong>签署状态跟随离职合同签署状态机</strong>（6.3），不独立判定。</li>
        <li><strong>签署只管「这笔补偿金成不成立」</strong>，不产生金额、也不改变 5 日跑批、6 日报税、9 日发放的节奏 —— 协议线与算钱线并行，互不替代。</li>
        <li>签署时明细上是<strong>预估</strong>；<strong>计算值在协议成立之后、次月 5 日跑批才产生</strong>，6 日报税后定稿（都是按规则算的，不需要再签一次确认）。</li>
        <li>金额的最终去向仍是<strong>薪酬按规则结算</strong>；明细只记录三段金额与差异原因，<strong>不参与计算</strong>。</li>
        <li>明细为<strong>只读视图</strong>：录入发生在离职流程内（离职审批环节人工填写），明细本身不提供新增录入。</li>
      </ul>
    </div>

      <!-- ===== 6.8 一次性补偿金的计算与发放（模块化薪酬实现） ===== -->
      <div id="rf-payroll-impl" class="subsection">
        <div class="section-header">
          <h3>6.8 一次性补偿金的计算与发放</h3>
          <DocCopyButton section-id="rf-payroll-impl" />
        </div>
        <div class="func-entry"><strong>功能入口：</strong>模块薪酬 → 薪酬发放策略 / 发放策略详情（<strong>新增「补偿金」分类</strong>）；产出的单据在「人员薪酬明细」中可见</div>

      <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary)); margin-bottom: 16px;">
        <strong>一句话定位：</strong>补偿金<strong>不并进「薪酬项模板」</strong>（不作为模板里的薪酬项参与公式计算），
        但作为发放策略里的第三类单据，<strong>分类归属默认跟随策略所属的薪酬模板</strong>；
        复用模块化薪酬的
        <strong>配置 → 计算 → 组装 → 发放 → 下游取数</strong>整条链路，产出<strong>补偿金单</strong>。
      </div>

      <p class="doc-p">
        为什么不做成「模板里的一个薪酬项」：薪酬项的定义是<strong>「模板里配 + 有公式 + 每期都出现」</strong>，
        而补偿金是<strong>「个案金额不同（无模板配置）+ 人工录入（无公式）+ 一次性（非周期）」</strong>。
        硬塞进薪酬项会撞坏「固定项 vs 动态项」的二分法、第 1 级 / 第 2 级的层级制，
        以及「所有工资条应发之和 = 员工总净工资」这条既有等式。
        模块化薪酬文档里已有同类先例：V1 的「公司成本项」（商业险等）因「与薪酬项逻辑不同源」被整体拆出。
      </p>

      <h3>端到端链路</h3>
      <p class="doc-p">
        分两段：<strong>配置段</strong>由 HR 一次性完成，<strong>运行段</strong>每月按时间节点滚动。
      </p>

      <div class="rf-flow-tag-legend">
        <span class="rfs-tag ours">本场景</span>
        <span class="rfs-tag dw">数仓</span>
        <span class="rfs-tag bean">常乐豆</span>
        <span class="rfs-tag pay">模块化薪酬</span>
        <span class="rfs-tag tax">财税 / 下游</span>
      </div>

      <div class="rf-flow">
        <div class="rf-flow-phase">配置段（功能完备后，HR 一次性配置）</div>
        <div class="rf-flow-item">
          <span class="rfs-idx">1</span>
          <div class="rfs-body">
            <div class="rfs-t">每个岗位新增「离职补偿金发放策略」 <span class="rfs-tag pay">模块化薪酬</span></div>
            <div class="rfs-d">需要<strong>对应的薪酬项</strong>（补偿金项）+ <strong>对应的发放策略</strong>；并在发放策略中<strong>新增「补偿金」分类</strong></div>
          </div>
        </div>

        <div class="rf-flow-phase" style="margin-top: 14px;">运行段（每月滚动）</div>
        <div class="rf-flow-item">
          <span class="rfs-idx">2</span>
          <div class="rfs-body">
            <div class="rfs-t">人事在离职流程录入 <span class="rfs-tag ours">本场景</span></div>
            <div class="rfs-d">协商的一次性现金金额 + 常乐豆出口选择；这笔补偿金是否成立跟随签署状态，金额在成立后按 5 日跑批算出（见 6.3）</div>
          </div>
        </div>
        <div class="rf-flow-arrow">↓</div>
        <div class="rf-flow-item">
          <span class="rfs-idx">3</span>
          <div class="rfs-body">
            <div class="rfs-t">数仓落两个数据对象 <span class="rfs-tag dw">数仓</span></div>
            <div class="rfs-d">① 协商的一次性现金　② 走补偿金通道的常乐豆余额</div>
          </div>
        </div>
        <div class="rf-flow-arrow">↓</div>
        <div class="rf-flow-item">
          <span class="rfs-idx">4</span>
          <div class="rfs-body">
            <div class="rfs-t">常乐豆余额冻结 —— <strong>次月 5 日</strong> <span class="rfs-tag bean">常乐豆</span></div>
            <div class="rfs-d">3 日算、4 日晚<strong>抵扣后的余额已充值进账户</strong>（进账户即为准确值）；5 日离职通道按流程将其<strong>冻结</strong>，数仓取<strong>冻结值</strong>。冻结之前没锁，谈的仍是约数</div>
          </div>
        </div>
        <div class="rf-flow-arrow">↓</div>
        <div class="rf-flow-item">
          <span class="rfs-idx">5</span>
          <div class="rfs-body">
            <div class="rfs-t">补偿金发放策略<strong>启动计算</strong> <span class="rfs-tag pay">模块化薪酬</span></div>
            <div class="rfs-d">取<strong>上月内离职的人</strong>，套用其岗位已配置的「离职补偿金发放策略」</div>
          </div>
        </div>
        <div class="rf-flow-arrow">↓</div>
        <div class="rf-flow-item">
          <span class="rfs-idx">6</span>
          <div class="rfs-body">
            <div class="rfs-t">取数、计税、组单 <span class="rfs-tag pay">模块化薪酬</span></div>
            <div class="rfs-d">读取两个数据对象的金额 + 计算<strong>【补偿金个税】系统项</strong> → 组装成补偿金单</div>
          </div>
        </div>
        <div class="rf-flow-arrow">↓</div>
        <div class="rf-flow-item">
          <span class="rfs-idx">7</span>
          <div class="rfs-body">
            <div class="rfs-t">产出<strong>分类为「补偿金」的单据</strong> <span class="rfs-tag pay">模块化薪酬</span></div>
            <div class="rfs-d">与工资单、常乐豆单并列，在「人员薪酬明细」中可见（同一员工同月可能同时有工资单与补偿金单）</div>
          </div>
        </div>
        <div class="rf-flow-arrow">↓</div>
        <div class="rf-flow-item">
          <span class="rfs-idx">8</span>
          <div class="rfs-body">
            <div class="rfs-t"><strong>次月 6 日</strong>：个税申报 <span class="rfs-tag tax">财税</span></div>
            <div class="rfs-d">
              工资薪金与 <code>【解除劳动合同一次性补偿金】</code> <strong>两个科目分别申报</strong>（见 6.6）；
              申报是<strong>按科目整批报</strong>，不是按人一条条报
            </div>
          </div>
        </div>
        <div class="rf-flow-arrow">↓</div>
        <div class="rf-flow-item">
          <span class="rfs-idx">9</span>
          <div class="rfs-body">
            <div class="rfs-t">报税之后：<strong>单据数据完善</strong> <span class="rfs-tag pay">模块化薪酬</span></div>
            <div class="rfs-d">
              税局返回的个税回写工资单与补偿金单 —— <strong>两张单的数据到此才齐</strong>（税前 / 个税 / 实发全字段定稿）。
              这是出付款单的<strong>前置条件</strong>：数据没完善，付款单不出
            </div>
          </div>
        </div>
        <div class="rf-flow-arrow">↓</div>
        <div class="rf-flow-item">
          <span class="rfs-idx">10</span>
          <div class="rfs-body">
            <div class="rfs-t">出付款单 → <strong>次月 9 日</strong>打款到账 <span class="rfs-tag pay">薪酬 → 银行</span></div>
            <div class="rfs-d">
              数据完善后才出付款单（付款金额以税后实发为准），按发薪批次走通知 → 确认 → 打款；
              到账金额与时间回写明细
            </div>
          </div>
        </div>
        <div class="rf-flow-arrow">↓</div>
        <div class="rf-flow-item">
          <span class="rfs-idx">11</span>
          <div class="rfs-body">
            <div class="rfs-t">财务人工计提科目 —— 资金流的最后一步 <span class="rfs-tag tax">财务</span></div>
            <div class="rfs-d">
              财务在财务系统按 <code>【解除劳动合同一次性补偿金】</code> 科目<strong>人工计提</strong>（与申报科目一致，取数看补偿金单）；
              <strong>不随发薪自动产生</strong>，属手工做账 —— 工资那部分随工资计提，不在这一步
            </div>
          </div>
        </div>
      </div>

      <h3>两个新增的数据对象（数仓）</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 50px;">#</th>
            <th style="width: 210px;">数据对象</th>
            <th style="width: 170px;">取值来源</th>
            <th style="width: 170px;">取值时点</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td><strong>协商的一次性现金</strong></td>
            <td>离职流程（人事录入）</td>
            <td>离职流程生效后</td>
            <td>即明细记录的那笔补偿金金额（协商类，默认 0；上限 = 过去 12 个月平均收入 ×（N+1），N+1 为唯一上限）</td>
          </tr>
          <tr>
            <td>2</td>
            <td><strong>走补偿金通道的常乐豆余额</strong></td>
            <td>常乐豆系统 / 薪酬结算</td>
            <td><strong>5 日余额冻结后</strong></td>
            <td>仅「出口选了补偿金通道」的那部分常乐豆；口径为当月抵扣后<strong>4 日晚已充进账户</strong>、并在 5 日<strong>经离职通道冻结锁定</strong>的余额（见 6.4）</td>
          </tr>
        </tbody>
      </table>

      <h3>新增系统项：补偿金个税</h3>
      <ul class="rf-list">
        <li>它是<strong>单独的【系统项】</strong>，与社保 / 公积金 / 个税同级 —— 即<strong>不是 HR 配公式的薪酬项</strong>，走独立规则。</li>
        <li>计税口径与工资薪金的个税<strong>不同源</strong>：一次性补偿金有独立的计税规则，且落<strong>不同的个税申报科目</strong>（见 6.6）。</li>
        <li>具体算法归属<strong>薪酬 / 财税</strong>，本场景只定义「它作为一个系统项存在于补偿金单的计算中」。</li>
      </ul>

      <h3>时序与触发</h3>
      <p class="doc-p">
        薪酬侧现有的月度节奏是：<strong>3 日算（薪酬 + 常乐豆）→ 4 日晚把抵扣后的余额充值进账户 → 5 日（在职员工自己提现 / 离职员工由离职通道冻结）→ 6 日报税 → 9 日发放</strong>。
        离职侧的补偿金挂在这条既有节奏上，<strong>不另起一套时间表</strong>。以「10 月离职」为例：
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 190px;">时点</th>
            <th style="width: 250px;">现状里发生什么（在职员工）</th>
            <th>离职侧怎么跟</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>离职当月（10 月）</strong></td>
            <td>—</td>
            <td>人事录入协商金额、选定出口；补偿金是否成立跟随签署状态</td>
          </tr>
          <tr>
            <td><strong>次月 3 日（11/3）· 算</strong></td>
            <td>薪酬 + 常乐豆<strong>一起计算</strong></td>
            <td>离职员工<strong>同批算入</strong>，不单独跑；余额尚未充进账户</td>
          </tr>
          <tr>
            <td><strong>次月 4 日晚（11/4）· 充值</strong></td>
            <td>手动充值：<strong>当月抵扣后的余额进入常乐豆账户</strong></td>
            <td>钱进账户，<strong>余额到这一步就是准确的</strong>；离职侧此时不冻结、不取数（冻结是 5 日的流程动作）</td>
          </tr>
          <tr>
            <td><strong>次月 5 日（11/5）· 分叉</strong></td>
            <td>员工<strong>自己提交提现</strong></td>
            <td>离职员工由离职通道<strong>按流程冻结</strong>这笔余额 —— 动作只有冻结，不用再等余额「可读」。
            冻结后余额不再变动，也不再走自助提现 —— 两条通道不并行</td>
          </tr>
          <tr>
            <td><strong>次月 5 日（11/5）· 跑批</strong></td>
            <td>—</td>
            <td>补偿金发放策略启动计算，取「<strong>上月内离职的人</strong>」（即 10 月离职者），常乐豆取<strong>冻结值</strong>
            → 生成分类为「补偿金」的单据，内含【补偿金个税】系统项 → 得到<strong>申报前的计算值</strong></td>
          </tr>
          <tr>
            <td><strong>次月 6 日（11/6）· 报税</strong></td>
            <td>按科目报税（【工资薪金】/【解除劳动合同一次性补偿金】）</td>
            <td>两个申报科目<strong>分别申报</strong>；补偿金单走 <code>【解除劳动合同一次性补偿金】</code>（见 6.6）</td>
          </tr>
          <tr>
            <td><strong>报税之后 · 数据完善</strong></td>
            <td>税局返回个税 → 回写单据</td>
            <td>工资单与补偿金单<strong>同步回写税后个税，两张单的数据到此才完善</strong>（税前 / 个税 / 实发定稿）；
            这是出付款单的<strong>前置条件</strong></td>
          </tr>
          <tr>
            <td><strong>数据完善后 · 出付款单</strong></td>
            <td>按发薪批次出付款单</td>
            <td>一个申报科目 → 一次申报 → 一笔付款；离职批次<strong>最多 2 笔付款</strong>，不随人数累加</td>
          </tr>
          <tr>
            <td><strong>次月 9 日（11/9）</strong></td>
            <td>发放薪资（打款）</td>
            <td>按发薪日打款，<strong>与工资同日到账</strong>；到账金额与到账时间回写明细</td>
          </tr>
          <tr>
            <td><strong>到账之后 · 财务做账</strong></td>
            <td>财务计提</td>
            <td><strong>财务人工计提科目</strong> —— 按 <code>【解除劳动合同一次性补偿金】</code> 科目人工计提（与申报科目一致），<strong>不随发薪自动产生</strong>；这是资金流的最后一步</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>关键点：</strong>补偿金的计算<strong>挂在余额冻结之后</strong> ——
        余额本身在 4 日晚进账户时就已经是准确的（当月该抵扣的都抵扣完了），但只有 5 日<strong>冻结把数锁住</strong>，才敢拿去计税、出单。
        这也是本场景唯一一个<strong>「由他人时点驱动的计算触发」</strong>。
      </div>
      <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary));">
        <strong>顺序别写反：报税（6 日）→ 数据完善 → 付款单 → 到账（9 日）。</strong>
        5 日跑批只是把单算出来，个税要等 6 日报税、税局返回结果后回写，<strong>工资单与补偿金单的数据才算完善</strong>；
        付款单是在数据完善之后才出的 —— 不是「5 日报税」，也不是「申报与付款单同一步」。
      </div>
      <div class="note" style="background: hsl(0 72% 51% / 0.06); border-left: 3px solid hsl(0 72% 51% / 0.6);">
        <strong>三个容易踩的坑：</strong>
        <br />
        ① <strong>别把 4 日晚当成冻结时点。</strong>4 日晚余额已充值进账户、且已经是准确值，但冻结按流程发生在 5 日 —— 4 日晚不冻结。
        <br />
        ② <strong>冻结必须在 5 日按流程第一时间做。</strong>5 日也是员工自己提现的日子，冻结晚一步，余额就可能已经被提走 ——
        一旦发生，这笔钱不能再进补偿金算一遍（否则同一笔领两次），只能进异常清单人工处理。
        <br />
        ③ <strong>触发挂在「冻结完成」事件上，不写死时点。</strong>该冻结而未冻结、或冻结后余额仍变动的，
        都进<strong>异常清单</strong>等补跑，不能静默漏算。
      </div>

      <h3>改动点清单</h3>
      <p class="doc-p">按「是否要改机制」分三档看：</p>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 50px;">#</th>
            <th>改动点</th>
            <th style="width: 120px;">层次</th>
            <th style="width: 130px;">性质</th>
            <th style="width: 120px;">归属</th>
          </tr>
        </thead>
        <tbody>
          <tr class="row-mech"><td>1</td><td>新增【补偿金个税】系统项</td><td>计算层</td><td><span class="mech">新增机制</span></td><td>薪酬侧</td></tr>
          <tr class="row-mech"><td>2</td><td>发放策略新增分类「补偿金」（第三类单据，与工资单 / 常乐豆单并列）</td><td>配置层</td><td><span class="mech">新增机制</span></td><td>薪酬侧</td></tr>
          <tr class="row-mech"><td>3</td><td>匹配人群支持「离职」维度字段（离职状态 / 实际离职日期）</td><td>配置层</td><td><span class="mech">新增字段</span></td><td>薪酬侧</td></tr>
          <tr class="row-mech"><td>4</td><td>计算触发支持「常乐豆余额冻结后启动」（事件驱动，不写死日期）</td><td>计算层</td><td><span class="mech">新增机制</span></td><td>薪酬侧</td></tr>
          <tr><td>5</td><td>新增「协商的一次性现金」数据对象</td><td>数仓</td><td><span class="data">新增数据</span></td><td>数仓</td></tr>
          <tr><td>6</td><td>新增「走补偿金通道的常乐豆余额」数据对象</td><td>数仓</td><td><span class="data">新增数据</span></td><td>数仓</td></tr>
          <tr><td>7</td><td>新增补偿金相关薪酬项</td><td>薪酬项配置</td><td><span class="data">新增配置</span></td><td>HR 配置</td></tr>
          <tr><td>8</td><td>单据类型枚举新增「补偿金」</td><td>单据</td><td><span class="data">新增枚举</span></td><td>薪酬侧</td></tr>
          <tr><td>9</td><td>人员薪酬明细展示补偿金单</td><td>展示层</td><td><span class="data">改展示</span></td><td>薪酬侧</td></tr>
          <tr><td>10</td><td>补偿金单的基础配置 / 薪酬项分组 / 扣缴项分组</td><td>配置层</td><td><span class="reuse">复用现有结构</span></td><td>—</td></tr>
          <tr><td>11</td><td>发放链路（通知 / 确认 / 付款单 / 打款）</td><td>发放</td><td><span class="reuse">复用</span></td><td>—</td></tr>
          <tr><td>12</td><td>下游 6 模块取数与申报科目映射</td><td>下游</td><td><span class="reuse">复用取数源</span> + 科目说明</td><td>财税</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>结论：</strong>真正需要动机制的只有 <strong>4 处</strong>（1～4）：
        一个系统项、一个发放策略分类、一个离职维度筛选字段、一个余额冻结后触发的计算入口。
        其余都是<strong>新增数据 / 枚举 / 展示</strong>。
        关键在于<strong>没有一处要改现有发薪主链路</strong> —— 工资单的计算与发放完全不受影响。
      </div>

      <h3>方案对比：走模块化薪酬 vs 单独建模块</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 170px;">维度</th>
            <th>方案 A：走模块化薪酬</th>
            <th>方案 B：单独建模块</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>对模块化薪酬的侵入</strong></td>
            <td>4 处机制改动 + 数仓 2 个对象</td>
            <td><strong>0</strong></td>
          </tr>
          <tr>
            <td><strong>单据从哪来</strong></td>
            <td>发放策略产出；与工资单同一套单据体系</td>
            <td>自建单据模型 / 编号规则 / 状态机</td>
          </tr>
          <tr>
            <td><strong>计算</strong></td>
            <td>复用计算层（含系统项扩展）</td>
            <td>自建计算（含补偿金个税）</td>
          </tr>
          <tr>
            <td><strong>发放链路</strong></td>
            <td>复用（通知 / 确认 / 付款单 / 打款）</td>
            <td>需重接；若挂在薪酬上则不算「独立」</td>
          </tr>
          <tr>
            <td><strong>下游模块取数</strong></td>
            <td><strong>零改动</strong>（这 6 个模块的取数源已是模块化薪酬）</td>
            <td>与补偿金相关的 <strong>3 个需单独接</strong>：凭证 / 个税申报 / 付款单；<br />计提本就由财务按科目<strong>人工</strong>做，两方案一致；社保清单与公积金清单<strong>不涉及补偿金</strong>，两方案都无此问题</td>
          </tr>
          <tr>
            <td><strong>明细页可见性</strong></td>
            <td>与工资单、常乐豆单并列展示</td>
            <td>看不到，需另开页面或做跨域聚合</td>
          </tr>
          <tr>
            <td><strong>员工端</strong></td>
            <td>复用确认与通知</td>
            <td>重做</td>
          </tr>
          <tr>
            <td><strong>长期维护</strong></td>
            <td>一套薪酬类单据</td>
            <td>两套并行，口径与规则容易分叉</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>代价小结：</strong>方案 A 的成本集中在「<strong>4 个机制点 + 数仓 2 个对象</strong>」；
        方案 B 表面上不侵入模块化薪酬，但把成本推给了「<strong>自建单据 + 发放链路 + 下游取数</strong>」，
        并产生<strong>长期的双轨维护</strong>。方案 B 若采用简化形态（见下），成本结构会再变一次。
      </div>

      <h3>方案 B 的简化形态：定时链路 + 只读明细</h3>
      <p class="doc-p">
        方案 B 若把全部逻辑交给<strong>后台定时任务</strong>串起来，形态会明显变轻 ——
        本质是<strong>把「配置驱动」换成「事件 + 定时驱动」</strong>，前端从「配置台」退化为「结果页」。
        简化后的链路只剩四步：
      </p>

      <div class="rf-flow">
        <div class="rf-flow-item">
          <span class="rfs-idx">1</span>
          <div class="rfs-body">
            <div class="rfs-t">从离职单据取出两个数 <span class="rfs-tag ours">本场景</span></div>
            <div class="rfs-d">协商的一次性现金 + <strong>走了补偿金通道的</strong>常乐豆余额</div>
          </div>
        </div>
        <div class="rf-flow-arrow">↓</div>
        <div class="rf-flow-item">
          <span class="rfs-idx">2</span>
          <div class="rfs-body">
            <div class="rfs-t">定时取数并合并 <span class="rfs-tag dw">后台</span></div>
            <div class="rfs-d">一次性补偿金 = 协商金额 + 常乐豆余额；触发时点仍是<strong>余额冻结后</strong>（余额 4 日晚进账户，5 日冻结、同日跑批）</div>
          </div>
        </div>
        <div class="rf-flow-arrow">↓</div>
        <div class="rf-flow-item">
          <span class="rfs-idx">3</span>
          <div class="rfs-body">
            <div class="rfs-t">按员工关系主体发起补偿金个税申报 <span class="rfs-tag tax">财税</span></div>
            <div class="rfs-d">落 <code>【解除劳动合同一次性补偿金】</code> 科目</div>
          </div>
        </div>
        <div class="rf-flow-arrow">↓</div>
        <div class="rf-flow-item">
          <span class="rfs-idx">4</span>
          <div class="rfs-body">
            <div class="rfs-t">拿到申报结果 → 生成付款单 → 打款 <span class="rfs-tag tax">财税</span></div>
          </div>
        </div>
      </div>

      <h3>这个链路覆盖到哪、漏掉什么</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 190px;">下游环节</th>
            <th style="width: 130px;">是否覆盖</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>个税申报</strong></td>
            <td><span class="reuse">覆盖</span></td>
            <td>链路第 3 步显式包含</td>
          </tr>
          <tr>
            <td><strong>付款单</strong></td>
            <td><span class="reuse">覆盖</span></td>
            <td>链路第 4 步显式包含</td>
          </tr>
          <tr class="row-mech">
            <td><strong>凭证</strong></td>
            <td><span class="mech">缺口</span></td>
            <td><strong>财务做账同样要取这笔数</strong>，但上面四步里没有任何一步承担它 —— 要么补进这条链路，要么由财务手工处理</td>
          </tr>
          <tr>
            <td><strong>计提</strong></td>
            <td><span class="reuse">不构成缺口</span></td>
            <td>计提本就由财务按 <code>【解除劳动合同一次性补偿金】</code> 科目<strong>人工</strong>完成，两方案一致，不依赖链路自动化</td>
          </tr>
          <tr>
            <td>社保清单 / 公积金清单</td>
            <td>不涉及</td>
            <td>补偿金不进这两个清单</td>
          </tr>
        </tbody>
      </table>

      <h3>「只读明细」要松一格：三个口子不能省</h3>
      <div class="rf-grid">
        <div class="rf-card">
          <div class="rf-card-title">失败出口</div>
          <div class="rf-card-desc">申报失败 / 退回、付款失败 / 部分成功，需要有重试或人工处理的入口。全自动不等于不需要人。</div>
        </div>
        <div class="rf-card">
          <div class="rf-card-title">异常清单</div>
          <div class="rf-card-desc">定时任务取不到数的那批人必须可见，否则会静默漏发：协议未成立（签署未完成）/ 常乐豆充值未到账 / 协商金额未录。</div>
        </div>
        <div class="rf-card">
          <div class="rf-card-title">修正 / 作废重出</div>
          <div class="rf-card-desc">出单后金额发现录错、或签署状态变化导致金额变动，需要一条「作废 → 重出」的路径。</div>
        </div>
      </div>

      <h3>前端形态：一张明细 + 三条状态</h3>
      <p class="doc-p">
        前端确实可以退化为<strong>一张可查询的补偿金明细</strong>，但状态不是一条，至少要三条并列：
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 160px;">字段组</th>
            <th>内容</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>身份</strong></td><td>姓名 / 工号 / 实际离职日期 / 员工关系主体</td></tr>
          <tr><td><strong>金额</strong></td><td>协商的一次性现金 + 常乐豆余额 = 一次性补偿金（含各自来源，可追溯）</td></tr>
          <tr><td><strong>数据就绪状态</strong></td><td>待齐（列出缺哪一项）/ 已齐 —— 对应上面的异常清单</td></tr>
          <tr><td><strong>申报状态</strong></td><td>待申报 / 申报中 / 申报成功 / 申报失败（含失败原因）</td></tr>
          <tr><td><strong>付款状态</strong></td><td>待生成 / 已生成 / 处理中 / 成功 / 部分成功 / 失败（含失败原因）</td></tr>
        </tbody>
      </table>

      <div class="note">
        <strong>结论：</strong>「前端只用一张明细 + 状态」这个方向成立，简化也是真实的 ——
        但要有两个前提：<strong>① 凭证的取数被补上或被明确排除（由财务手工）</strong>（计提不在此列 —— 本就由财务人工按科目做）；
        <strong>② 明细页保留异常清单与失败重试入口</strong>，不能做成纯展示。
        另外，方案 B 简化后这笔单<strong>不进模块化薪酬的单据体系</strong>，
        因此「人员薪酬明细里同月并列看到工资单与补偿金单」这个效果需要另做跨域聚合，B 方案下拿不到。
      </div>

      <div class="note" style="background: hsl(38 92% 45% / 0.08); border-left: 3px solid hsl(38 92% 45% / 0.6);">
        <strong>选型取决于一个业务问题：</strong>补偿金单是否必须与工资单进同一套薪酬单据体系？
        若必须（财务做账、明细页并列、单据口径统一）→ 选 A；
        若不必（财务侧可单独处理凭证、明细页宁可独立一张）→ B 的简化形态确实更轻。
      </div>

      <h3>后台自动计算与人工干预的边界</h3>
      <p class="doc-p">
        「系统在后台按时间节点自动算好、界面只做展示」这个方向成立，但需要保留三个口子：
      </p>
      <div class="rf-grid">
        <div class="rf-card" v-for="g in payrollImplGaps" :key="g.title">
          <div class="rf-card-title">{{ g.title }}</div>
          <div class="rf-card-desc">{{ g.desc }}</div>
        </div>
      </div>
      <div class="note" style="background: hsl(38 92% 45% / 0.08); border-left: 3px solid hsl(38 92% 45% / 0.6);">
        <strong>一条不能含糊的边界：</strong>金额<strong>不是后台算出来的</strong>。
        金额是人事在离职流程里录入的协商结果；后台只做三件事 ——
        <strong>取数（两个数据对象）+ 计税（补偿金个税系统项）+ 组单（补偿金单）</strong>。
      </div>
    </div><!-- /6.8 -->

      <!-- ===== 6.9 下游交付 ===== -->
      <div id="rf-deliver" class="subsection">
        <div class="section-header">
          <h3>6.9 下游交付</h3>
          <DocCopyButton section-id="rf-deliver" />
        </div>
        <div class="func-entry"><strong>功能入口：</strong>—（本节为交付口径，无对应页面）</div>

      <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary)); margin-bottom: 16px;">
        <strong>交付内容只有两样：</strong>「离职事实」+「实际离职日期」。不包含金额、不包含假勤结存结论。
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 150px;">消费方</th>
            <th style="width: 130px;">消费方式</th>
            <th>消费后各自做什么</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>假勤</strong></td><td>读取事实</td><td>自己出结果（额度结存、是否超休）</td></tr>
          <tr><td><strong>薪酬</strong></td><td>读取事实 + 金额</td><td>按自己的规则清算（抵扣 / 清零 / 扣缴 / 计税）</td></tr>
          <tr><td><strong>常乐豆</strong></td><td>读取事实</td><td>按自己的逻辑处理（提现 / 清零并记录清零原因）</td></tr>
          <tr class="row-mech">
            <td><strong>排班</strong></td>
            <td>读取事实</td>
            <td><strong>实际离职日期之后的排班全部取消</strong>（推拿师 / 客户经理均适用）；主动离职由审批通过时发起，<strong>解除用工同样执行</strong>（以解除确认时为界）</td>
          </tr>
          <tr><td><strong>权限</strong></td><td>读取事实</td><td>实际离职日期之后截断接单权限；<strong>解除用工同样执行</strong></td></tr>
          <tr>
            <td><strong>预约订单</strong></td>
            <td>读取事实</td>
            <td>接单权限截断后<strong>不再接新单</strong>；实际离职日期之后的在途预约由预约系统按自己的规则改派 / 取消 / 通知客户。<strong>怎么处置不由离职决定</strong>，离职侧只发事实与日期</td>
          </tr>
          <tr>
            <td><strong>新员工关系</strong></td>
            <td>写入事实</td>
            <td>写入离职事实与实际离职日期，员工状态置为离职，<strong>完整履职经历</strong>留档（原「员工档案」只是其中一部分）；后续入职、调岗、续签均以此为准</td>
          </tr>
        </tbody>
      </table>
      </div><!-- /6.8 -->
    </div><!-- /rf-func -->

    <!-- ========== 七、附录：待决事项 ========== -->
    <div id="rf-issues" class="section">
      <div class="section-header">
        <h2>七、附录：待决事项</h2>
        <DocCopyButton section-id="rf-issues" />
      </div>

      <p class="doc-p">以下事项不在本场景拍板，但必须显式挂起：写明归属方与卡点，条件成熟时回收到对应章节。
      已有结论的不再列在这里 —— 例如解除用工的资产处理（6.2）、解除用工的离职事实时点（6.2）、协商协议附件（6.7）、
      离职当月的折算口径（边界即结论，见 5 章）、签署状态与补偿金成立的联动（6.3 / 6.7）、
      签署是否需公司用印（走电子签，员工签完平台自动落章出证，见 6.3）。</p>

      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 50px;">#</th>
            <th style="width: 250px;">事项</th>
            <th style="width: 140px;">归属</th>
            <th>卡在哪</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(q, i) in openIssues" :key="i">
            <td>{{ i + 1 }}</td>
            <td><strong>{{ q.title }}</strong></td>
            <td>{{ q.owner }}</td>
            <td>{{ q.why }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../docs/components/DocShell.vue'
import DocCopyButton from '../../docs/components/DocCopyButton.vue'
import { Calendar, User, CollectionTag } from '@element-plus/icons-vue'

const tocItems = [
  { id: 'rf-version', label: '一、版本信息' },
  { id: 'rf-changelog', label: '二、变更日志' },
  { id: 'rf-notes', label: '三、文档说明' },
  { id: 'rf-bg', label: '四、需求背景' },
  { id: 'rf-scope', label: '五、需求范围' },
  { id: 'rf-chain', label: '　全链路总览' },
  { id: 'rf-func', label: '六、功能详细说明' },
  { id: 'rf-entry', label: '　6.1 离职需求发起（员工侧）' },
  { id: 'rf-process', label: '　6.2 离职处理（统一处理）' },
  { id: 'rf-fsm', label: '　6.3 离职合同签署状态机' },
  { id: 'rf-asset', label: '　6.4 剩余资产可见' },
  { id: 'rf-payout', label: '　6.5 款项出口' },
  { id: 'rf-taxflow', label: '　6.6 资产流向与税务归集' },
  { id: 'rf-comp', label: '　6.7 离职补偿金明细' },
  { id: 'rf-payroll-impl', label: '　6.8 一次性补偿金的计算与发放' },
  { id: 'rf-deliver', label: '　6.9 下游交付' },
  { id: 'rf-issues', label: '七、附录：待决事项' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '离职流程', to: '/docs/resign-flow/requirement' },
  { label: '一、产品需求说明' }
]

const fsmMain = [
  { key: 'draft', label: '待发起签署' },
  { key: 'sent', label: '待员工签署' },
  { key: 'employee_signed', label: '员工已签' },
  { key: 'completed', label: '签署完成' }
]

const fsmRows = [
  { state: '待发起签署 / 待员工签署 / 员工已签', establish: 'pending', establishText: '待成立', desc: '签署未完成，这笔补偿金还定不下来，不进入计算' },
  { state: '签署完成', establish: 'established', establishText: '已成立', desc: '协议成立，进入次月 5 日跑批；金额此时才产生，6 日报税后定稿' },
  { state: '已拒签 / 已作废', establish: 'void', establishText: '已作废', desc: '协议不成立，不进入计算，也不产生这笔钱' }
]

const compKeys = [
  { title: '① 谁输入的', desc: '输入人 + 角色（HR / 薪酬专员）+ 输入时间' },
  { title: '② 依据在哪', desc: '协商协议附件（PDF / 图片），金额 > 0 时必传，随记录留档可回看' },
  { title: '③ 预估多少', desc: '签署发起时的快照：协商现金 + 常乐豆出口（标「约」），并给出构成' },
  { title: '④ 算出来多少', desc: '次月 5 日冻结后跑批：常乐豆冻结值（已含当月抵扣）、税前、补偿金个税、实发' },
  { title: '⑤ 发了多少 / 状态', desc: '9 日到账金额与时间 + 与预估的差；状态跟随离职合同签署状态机' }
]

/* 6.8 后台自动 + 人工干预的三个口子 */
const payrollImplGaps = [
  { title: '① 修正', desc: '人事录错 / 漏录金额时的修改入口 —— 离职流程已生效、单还没出或已出，分别怎么改' },
  { title: '② 重算', desc: '冻结后余额仍有变动、或个税口径调整时，对已生成的补偿金单发起重算（复用现有「发起重算」能力）' },
  { title: '③ 异常清单', desc: '取不到值的兜底：未录金额 / 常乐豆余额未冻结（或被提现提走）/ 离职签署未完成 —— 需要一份可排查的清单，而不是静默跳过' }
]

const openIssues = [
  {
    title: '总部员工的考勤异常由谁提供、怎么判定',
    owner: '假勤',
    why: '门店侧异常（连续未出勤）离职侧就能判；总部员工的异常本质是考勤异常，数据源在假勤侧，判定口径与推送形态（阈值 / 频次 / 字段）都还没定。这条不定，异常监控就只能停在门店侧 —— 本期按「总部异常提供不了就不展示该部分」处理（见 6.2）'
  },
  {
    title: '在途协商扣缴协议遇离职时的剩余处置',
    owner: '薪酬 / 法务',
    why: '协议前提是「每月扣一点、不扣成负数」，离职后不再有「每月」——一次性扣会违背原则，清零则公司损失。本场景只提示'
  },
  {
    title: '5 日冻结与员工自助提现的先后规则',
    owner: '常乐豆 / 薪酬',
    why: '余额 4 日晚进账户、5 日才冻结，而 5 日也正是在职员工自己提交提现的日子。冻结与提现谁先执行、离职员工的提现入口是否直接关闭、已被提走的余额怎么回冲，都需常乐豆侧定义 —— 定不下来就有「同一笔钱被领两次」的风险'
  },
  {
    title: '负工资账户余额在离职时是预估还是精确数',
    owner: '薪酬',
    why: '当前按「预估」表达（与常乐豆一致），理由是随待结与当月抵扣变动；是否符合薪酬侧口径待确认'
  },
  {
    title: '一次性补偿金与工资薪金：是否同一批发薪批次',
    owner: '薪酬 / 财税',
    why: '两个申报科目 → 2 张单、2 次申报、最多 2 笔付款已定，发放日也跟 9 日发薪日；剩下的是「是否挂在同一个发薪批次下」（影响批次号与凭证归集口径），由薪酬侧安排'
  },
  {
    title: '签署未完成的补偿金，本期是否出单',
    owner: '本场景 / 离职业务 / 薪酬',
    why: '协议成立才进入计算（见 6.3），而计算挂在余额冻结后（见 6.8）。签署拖过 5 日冻结时，是转下期还是在明细上留「本期未算」并给出原因？两种都可行，但不能静默消失 —— 明细必须能看出「这笔是因为没签才没算」'
  },
  {
    title: '补偿金单是否走「员工确认」环节',
    owner: '薪酬 / 本场景',
    why: '工资单有「发放通知 → 员工确认」；补偿金单的收款人已离职，是否仍要其确认、还是由人事代确认或直接跳过确认进付款单，未定'
  },
  {
    title: '常乐豆余额冻结失败时，补偿金计算如何处理',
    owner: '薪酬 / 常乐豆',
    why: '补偿金计算挂在 5 日冻结之后。若余额取不到、冻结失败、或余额已被自助提现提走，是等待补冻结重试、本期跳过、还是按账户值先出单后补差，未定 —— 但必须落进异常清单，不能静默漏算'
  },
  {
    title: '「上月内离职的人」的取数口径',
    owner: '薪酬 / 本场景',
    why: '按实际离职日期落在上月，还是按离职流程在月内生效？月中离职、跨月补录的情形会落到不同期次'
  },
  {
    title: '月均收入的取数细节：字段口径与缺失处理',
    owner: '薪酬 / 本场景',
    why: '取数来源已定：门店侧取模块化薪酬每月「收入小计」、总部取总部薪酬每月实发（见 6.7）。但三件事没定 —— ① 门店侧「收入小计」是扣缴前的收入合计，若某月有扣缴项，是按收入合计还是按应发合计取数；② 入职不足 12 个月的，按实际有收入的月份均分、还是按 12 个月补零，无薪假月份是否计入分母；③ 月均取不到时（异常监控入口、总部数据未同步）是阻断提交、还是提示后由人事人工核对录入。原型当前按「取不到则提示、不写死上限」兜底'
  },
  {
    title: '发起时是否允许员工修改收款账户',
    owner: '本场景 / 新员工关系',
    why: '当前设计为只读核对（卡信息以新员工关系为准）。若允许发起时改卡，属于高风险操作，需二次验证与修改留痕，且要定义「改卡后什么时候生效」；不改则要提供去档案修改的引导'
  },
  {
    title: '补偿金单的凭证取数归属',
    owner: '薪酬 / 财务',
    why: '计提已明确：由财务按【解除劳动合同一次性补偿金】科目人工计提，不随发薪自动产生。凭证是否也由财务手工做、还是随模块化薪酬自动出，需财务侧确认；方案 B（含简化形态）下这条链路不带凭证'
  }
]
</script>

<style scoped>
.doc-p { font-size: 13.5px; line-height: 1.8; color: hsl(var(--foreground)); margin: 10px 0; }
.h4sub {
  font-size: 13.5px; font-weight: 600; color: hsl(var(--foreground));
  margin: 20px 0 8px; padding-left: 9px;
  border-left: 3px solid hsl(var(--primary) / 0.45);
}

/* 变更日志：有序条目 */
.chg-lead { font-size: 13px; line-height: 1.75; color: hsl(var(--foreground) / 0.78); margin-bottom: 8px; }
.chg-list { margin: 0; padding: 0; list-style: none; counter-reset: chg; }
.chg-list > li {
  counter-increment: chg;
  position: relative; padding-left: 24px;
  font-size: 13px; line-height: 1.8; color: hsl(var(--foreground) / 0.88);
}
.chg-list > li + li { margin-top: 7px; }
.chg-list > li::before {
  content: counter(chg) "、";
  position: absolute; left: 0; top: 0;
  color: hsl(var(--primary)); font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.chg-list > li strong { font-weight: 600; color: hsl(var(--foreground)); }

/* ===== 五章末：全链路总览 ===== */
.chain { margin: 16px 0 14px; }
.chain-node {
  display: grid; grid-template-columns: 108px 1fr;
  border: 1px solid hsl(var(--border)); border-radius: 12px;
  overflow: hidden; background: hsl(var(--card));
  box-shadow: 0 1px 2px hsl(0 0% 0% / 0.03);
}
.cn-rail {
  background: hsl(var(--muted) / 0.3);
  border-right: 1px solid hsl(var(--border));
  padding: 13px 12px;
  display: flex; flex-direction: column; gap: 5px;
}
.cn-no {
  align-self: flex-start;
  font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 999px; padding: 1px 8px;
}
.cn-name { font-size: 14px; font-weight: 700; line-height: 1.35; color: hsl(var(--foreground)); }
.cn-who { font-size: 11px; line-height: 1.55; color: hsl(var(--muted-foreground)); }
.cn-body { padding: 13px 16px 14px; min-width: 0; }
.cn-t { font-size: 13.5px; font-weight: 600; line-height: 1.55; color: hsl(var(--foreground)); }
.cn-d { font-size: 12.5px; line-height: 1.75; color: hsl(var(--foreground) / 0.62); margin-top: 7px; }
.cn-d b { color: hsl(var(--foreground)); font-weight: 600; }

/* 结算锚点：整块提亮 + 主色环 */
.chain-node.anchor {
  border-color: hsl(var(--primary) / 0.45);
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.06);
}
.chain-node.anchor .cn-rail { background: hsl(var(--primary) / 0.07); border-right-color: hsl(var(--primary) / 0.18); }
.chain-node.anchor .cn-no { color: #fff; background: hsl(var(--primary)); border-color: hsl(var(--primary)); }
.chain-node.anchor .cn-name { color: hsl(var(--primary)); }

/* 连接箭头：短线 + 箭头 */
.chain-arrow {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: 3px 0; color: hsl(var(--primary) / 0.4);
  font-size: 12px; line-height: 1;
}
.chain-arrow::before {
  content: ''; width: 1px; height: 10px;
  background: hsl(var(--primary) / 0.28);
}

/* 三类岗位并列 */
.persona-cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 9px; margin-top: 11px; }
.persona-col {
  border: 1px solid hsl(var(--border)); border-radius: 10px;
  background: hsl(var(--card)); overflow: hidden;
}
.pct {
  font-size: 12.5px; font-weight: 700; color: hsl(var(--foreground));
  padding: 6px 11px; background: hsl(var(--muted) / 0.42);
  border-bottom: 1px solid hsl(var(--border));
}
.pcd { font-size: 12px; line-height: 1.7; color: hsl(var(--foreground) / 0.6); padding: 8px 11px 10px; }

/* 两个入口并列 */
.entry-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin-top: 11px; }
.entry-box {
  border: 1px solid hsl(var(--border)); border-left-width: 3px; border-radius: 10px;
  background: hsl(var(--card)); overflow: hidden;
}
.entry-box:nth-child(1) { border-left-color: hsl(var(--primary) / 0.65); }
.entry-box:nth-child(2) { border-left-color: hsl(38 92% 48%); }
.eb-t {
  font-size: 12.5px; font-weight: 700; color: hsl(var(--foreground));
  padding: 6px 11px; background: hsl(var(--muted) / 0.3);
  border-bottom: 1px solid hsl(var(--border));
}
.eb-d { font-size: 12px; line-height: 1.72; color: hsl(var(--foreground) / 0.62); padding: 8px 11px 10px; }
.eb-d b { color: hsl(var(--foreground)); font-weight: 600; }

/* 三个关联系统并列 */
.cols-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 9px; margin-top: 11px; }
.sys-box {
  border: 1px solid hsl(210 70% 50% / 0.3); border-left: 3px solid hsl(210 70% 50% / 0.55);
  border-radius: 10px; background: hsl(210 70% 50% / 0.03); overflow: hidden;
}
.sb-t {
  padding: 6px 11px; background: hsl(210 70% 50% / 0.07);
  border-bottom: 1px solid hsl(210 70% 50% / 0.16);
}
.sb-d { font-size: 12px; line-height: 1.72; color: hsl(var(--foreground) / 0.62); padding: 8px 11px 10px; }
.sb-d b { color: hsl(var(--foreground)); font-weight: 600; }

/* 旁路取数 */
.chain-aside {
  margin-top: 10px; padding: 9px 12px;
  border: 1px dashed hsl(var(--primary) / 0.3); border-radius: 9px;
  background: hsl(var(--primary) / 0.03);
  font-size: 12px; line-height: 1.72; color: hsl(var(--foreground) / 0.62);
}
.chain-aside .ca-t {
  display: inline-block; margin-right: 9px; padding-right: 9px;
  border-right: 1px solid hsl(var(--border));
  font-weight: 700; color: hsl(var(--primary));
}
.chain-aside b { color: hsl(var(--foreground)); font-weight: 600; }

/* 结算条目 */
.chain-list { margin: 9px 0 0; padding-left: 20px; }
.chain-list li { font-size: 12.5px; line-height: 1.85; color: hsl(var(--foreground) / 0.62); }
.chain-list li + li { margin-top: 2px; }
.chain-list li::marker { color: hsl(var(--primary) / 0.5); }
.chain-list li b { color: hsl(var(--foreground)); font-weight: 600; }

/* 发放链路 */
.pay-line {
  display: flex; align-items: center; flex-wrap: wrap; gap: 7px;
  margin-top: 10px;
}
.pl-item {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px; color: hsl(var(--foreground));
  border: 1px solid hsl(var(--border)); border-radius: 999px;
  background: hsl(var(--card)); padding: 6px 12px;
  box-shadow: 0 1px 1px hsl(0 0% 0% / 0.03);
}
.pl-item b { font-weight: 600; }
.pl-op { font-size: 12.5px; color: hsl(var(--foreground) / 0.35); }

@media (max-width: 960px) {
  .persona-cols, .entry-pair, .cols-3 { grid-template-columns: 1fr; }
  .chain-node { grid-template-columns: 1fr; }
  .cn-rail { flex-direction: row; align-items: center; gap: 8px; border-right: none; border-bottom: 1px solid hsl(var(--border)); }
  .chain-arrow { transform: rotate(90deg); }
  .chain-arrow::before { display: none; }
}

/* 状态机节点 */
.fsm-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin: 10px 0 4px; }
.fsm-node {
  font-size: 13px; padding: 5px 14px; border-radius: 16px;
  background: hsl(var(--muted) / 0.4); border: 1px solid hsl(var(--border));
  color: hsl(var(--muted-foreground));
}
.fsm-node.final {
  background: hsl(150 45% 42% / 0.12); border-color: hsl(150 45% 42% / 0.5);
  color: hsl(150 45% 30%); font-weight: 600;
}
.fsm-node.bad { background: hsl(0 65% 50% / 0.1); border-color: hsl(0 65% 50% / 0.4); color: hsl(0 65% 45%); }
.fsm-arrow { color: hsl(var(--muted-foreground) / 0.6); }

/* 协议成立态文字 */
.eff { font-size: 12.5px; font-weight: 600; }
.eff.pending { color: hsl(38 92% 36%); }
.eff.established { color: hsl(150 45% 32%); }
.eff.void { color: hsl(var(--muted-foreground)); }

/* 无序列表 */
.rf-list { margin: 10px 0; padding-left: 20px; }
.rf-list li { font-size: 13.5px; line-height: 1.8; margin-bottom: 8px; color: hsl(var(--foreground)); }
.rf-list strong { color: hsl(var(--foreground)); }

/* 三要素卡片 */
.rf-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin: 12px 0; }
.rf-card {
  background: hsl(var(--muted) / 0.3); border: 1px solid hsl(var(--border));
  border-radius: 8px; padding: 14px 16px;
}
.rf-card-title { font-size: 14px; font-weight: 600; color: hsl(var(--primary)); margin-bottom: 6px; }
.rf-card-desc { font-size: 12.5px; line-height: 1.65; color: hsl(var(--muted-foreground)); }

/* ===== 版本信息卡 ===== */
.ver-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin: 12px 0; }
.ver-card {
  display: flex; align-items: center; gap: 12px;
  background: hsl(var(--muted) / 0.3); border: 1px solid hsl(var(--border));
  border-radius: 8px; padding: 14px 16px;
}
.ver-card .el-icon { font-size: 20px; color: hsl(var(--primary)); flex-shrink: 0; }
.vc-k { font-size: 11.5px; color: hsl(var(--muted-foreground)); margin-bottom: 2px; }
.vc-v { font-size: 14px; font-weight: 600; color: hsl(var(--foreground)); }
.vc-v.muted { color: hsl(var(--muted-foreground)); font-weight: 500; }

/* ===== 功能详细说明 · 子节 ===== */
.subsection { margin-bottom: 36px; }
.subsection:last-child { margin-bottom: 0; }
.subsection .section-header { margin-bottom: 10px; }
.subsection .section-header h3 { margin: 0; padding-bottom: 6px; border-bottom: 1px solid hsl(var(--border)); }
.func-entry {
  font-size: 12px; line-height: 1.6; color: hsl(var(--muted-foreground));
  background: hsl(var(--muted) / 0.3);
  border-left: 3px solid hsl(var(--primary) / 0.6);
  padding: 6px 10px; border-radius: 0 6px 6px 0;
  margin: 0 0 14px;
}
.func-entry strong { color: hsl(var(--foreground)); }

/* ===== 资产流向图（卡片式：来源卡 → 归集横幅 → 单据卡 → 计提横幅） ===== */
.tf-sub { display: block; font-size: 10.5px; font-weight: 400; color: hsl(var(--muted-foreground)); margin-top: 2px; }

.mn-flow { margin: 14px 0 10px; }
.mn-row3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.mn-row2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }

.mn-card {
  border: 1px solid #e9e0d1;
  border-radius: 14px;
  padding: 14px 16px;
  background: #faf6ee;
}
.mn-card-t {
  font-size: 14.5px;
  font-weight: 700;
  color: #3d3a36;
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid #ecdfc9;
}
.mn-list { margin: 0; padding-left: 16px; }
.mn-list li { font-size: 12px; line-height: 1.9; color: #857d70; }
.mn-list b { color: #a40035; font-weight: 600; }
.mn-chip {
  font-size: 10px; font-weight: 500; vertical-align: 2px;
  color: #a4762a; background: hsl(38 92% 45% / 0.14);
  border-radius: 8px; padding: 1px 7px; margin-left: 6px;
}
.mn-chip.ghost { color: #fff; background: transparent; border: 1px solid rgb(255 255 255 / 0.45); }

/* 深色来源卡（本场景的重心：离职补偿金） */
.mn-card.dark {
  background: #7d1233;
  border-color: #7d1233;
}
.mn-card.dark .mn-card-t { color: #fff; border-bottom-color: rgb(255 255 255 / 0.22); }
.mn-card.dark .mn-list li { color: rgb(255 255 255 / 0.82); }
.mn-card.dark .mn-list b { color: #ffd9e3; }

/* 中性单据卡 */
.mn-card.plain { background: hsl(var(--background)); border-color: hsl(var(--border)); }
.mn-card.plain .mn-card-t { border-bottom-color: hsl(var(--border)); }
.mn-card-sub { font-size: 11.5px; color: hsl(var(--muted-foreground)); line-height: 1.6; margin-bottom: 10px; }

/* 申报科目徽标 */
.mn-tax {
  border-radius: 9px;
  padding: 8px 10px;
  font-size: 12.5px;
  font-weight: 700;
  text-align: center;
}
.mn-tax span { display: block; font-size: 10px; font-weight: 400; margin-top: 2px; }
.mn-tax.salary { background: hsl(var(--primary) / 0.07); border: 1px solid hsl(var(--primary) / 0.3); color: hsl(var(--primary)); }
.mn-tax.comp { background: hsl(38 92% 45% / 0.13); border: 1px solid hsl(38 92% 45% / 0.45); color: hsl(30 85% 28%); }

/* 箭头与分组小标 */
.mn-arrows { display: grid; gap: 0; color: #a40035; font-size: 15px; line-height: 1.4; padding: 4px 0; text-align: center; }
.mn-arrows.cols3 { grid-template-columns: repeat(3, 1fr); }
.mn-arrows.single { grid-template-columns: 1fr; }
.mn-label { font-size: 11px; color: #b3a893; margin: 2px 0 8px; }

/* 归集 / 收口横幅 */
.mn-banner {
  border-radius: 14px;
  padding: 13px 18px;
  background: #630f28;
  color: #fff;
  text-align: center;
}
.mn-banner b { display: block; font-size: 14px; letter-spacing: 0.3px; }
.mn-banner-sub { display: block; font-size: 11.5px; line-height: 1.7; color: rgb(255 255 255 / 0.72); margin-top: 4px; }
.mn-banner.final { background: #a40035; }
.mn-banner.final .mn-banner-sub { color: rgb(255 255 255 / 0.85); }

/* ===== 6.8 端到端链路（纵向步骤） ===== */
.rf-flow { margin: 14px 0 8px; }
.rf-flow-phase {
  font-size: 12.5px; font-weight: 600; color: hsl(var(--primary));
  padding: 4px 0 8px;
}
.rf-flow-item {
  display: flex; gap: 10px; align-items: flex-start;
  background: hsl(var(--muted) / 0.22);
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  padding: 10px 12px;
}
.rf-flow-arrow {
  text-align: center; color: hsl(var(--muted-foreground) / 0.65);
  font-size: 13px; line-height: 1; padding: 4px 0;
}
.rfs-idx {
  flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%;
  background: hsl(var(--primary) / 0.12); color: hsl(var(--primary));
  font-size: 12px; font-weight: 600;
  display: inline-flex; align-items: center; justify-content: center;
}
.rfs-body { flex: 1; min-width: 0; }
.rfs-t { font-size: 13px; font-weight: 600; line-height: 1.5; color: hsl(var(--foreground)); }
.rfs-d { font-size: 12px; line-height: 1.65; color: hsl(var(--muted-foreground)); margin-top: 3px; }

.rf-flow-tag-legend { display: flex; flex-wrap: wrap; gap: 8px; margin: 4px 0 10px; }
.rfs-tag {
  font-size: 10.5px; padding: 1px 7px; border-radius: 9px;
  white-space: nowrap; vertical-align: middle;
}
.rfs-tag.ours { color: hsl(var(--primary)); background: hsl(var(--primary) / 0.1); }
.rfs-tag.dw { color: hsl(210 70% 40%); background: hsl(210 70% 50% / 0.12); }
.rfs-tag.bean { color: hsl(38 85% 32%); background: hsl(38 92% 45% / 0.14); }
.rfs-tag.pay { color: hsl(150 45% 30%); background: hsl(150 45% 42% / 0.13); }
.rfs-tag.tax { color: hsl(275 45% 42%); background: hsl(275 45% 50% / 0.12); }

/* 改动点性质标签 */
.mech {
  font-size: 11.5px; font-weight: 600; padding: 1px 7px; border-radius: 9px;
  color: hsl(0 65% 42%); background: hsl(0 65% 50% / 0.1);
}
.data {
  font-size: 11.5px; padding: 1px 7px; border-radius: 9px;
  color: hsl(210 70% 38%); background: hsl(210 70% 50% / 0.1);
}
.reuse {
  font-size: 11.5px; padding: 1px 7px; border-radius: 9px;
  color: hsl(150 40% 30%); background: hsl(150 45% 42% / 0.12);
}
tr.row-mech td { background: hsl(0 65% 50% / 0.03); }

@media (max-width: 960px) {
  .mn-row3, .mn-row2 { grid-template-columns: 1fr; }
  .mn-arrows.cols3 { grid-template-columns: 1fr; }
  .mn-arrows.cols3 span { display: none; }
  .mn-arrows.cols3::after { content: '↓'; }
}

code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  background: hsl(var(--muted) / 0.6);
  padding: 1px 5px;
  border-radius: 4px;
  color: hsl(var(--foreground));
}
</style>
