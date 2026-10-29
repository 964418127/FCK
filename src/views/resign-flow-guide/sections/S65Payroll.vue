<template>
  <DocShell
    :toc-items="tocItems"
    title="6.5 一次性补偿金的计算与发放"
    subtitle="补偿金不并进「薪酬项模板」，而作为发放策略里的第三类单据：复用模块化薪酬的配置 → 计算 → 组装 → 发放 → 下游取数整条链路"
    version="v0.3"
    date="2026-10-26"
    :breadcrumbs="breadcrumbs"
  >
        <div id="rf-payroll-impl" class="section">
          <div class="section-header">
            <h2>6.5 一次性补偿金的计算与发放</h2>
            <DocCopyButton section-id="rf-payroll-impl" />
          </div>
          <div class="func-entry"><strong>功能入口：</strong>模块薪酬 → 薪酬发放策略 / 发放策略详情（<strong>新增「补偿金」分类</strong>）；产出的单据在「人员薪酬明细」中可见</div>
          <DocScreens
            :images="[
              { src: compStrategyShot, label: '发放策略详情 · 补偿金映射：取数对象 / 取数期间 / 计算触发（余额冻结后）与个税申报科目' }
            ]"
          />
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

          <h4 class="h4sub">端到端链路</h4>
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
                <div class="rfs-d">协商的一次性现金金额 + 常乐豆出口选择；这笔补偿金是否成立跟随签署状态，金额在成立后按 5 日跑批算出（见 6.4）</div>
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
                  工资薪金与 <code>【解除劳动合同一次性补偿金】</code> <strong>两个科目分别申报</strong>（见 5.4）；
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

          <h4 class="h4sub">两个新增的数据对象（数仓）</h4>
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
                <td>仅「出口选了补偿金通道」的那部分常乐豆；口径为当月抵扣后<strong>4 日晚已充进账户</strong>、并在 5 日<strong>经离职通道冻结锁定</strong>的余额（见 6.3.3）</td>
              </tr>
            </tbody>
          </table>

          <h4 class="h4sub">新增系统项：补偿金个税</h4>
          <ul class="rf-list">
            <li>它是<strong>单独的【系统项】</strong>，与社保 / 公积金 / 个税同级 —— 即<strong>不是 HR 配公式的薪酬项</strong>，走独立规则。</li>
            <li>计税口径与工资薪金的个税<strong>不同源</strong>：一次性补偿金有独立的计税规则，且落<strong>不同的个税申报科目</strong>（见 5.4）。</li>
            <li>具体算法归属<strong>薪酬 / 财税</strong>，本场景只定义「它作为一个系统项存在于补偿金单的计算中」。</li>
          </ul>

          <h4 class="h4sub">时序与触发</h4>
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
                <td>两个申报科目<strong>分别申报</strong>；补偿金单走 <code>【解除劳动合同一次性补偿金】</code>（见 5.4）</td>
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

          <h4 class="h4sub">改动点清单</h4>
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

          <h4 class="h4sub">方案对比：走模块化薪酬 vs 单独建模块</h4>
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

          <h4 class="h4sub">方案 B 的简化形态：定时链路 + 只读明细</h4>
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

          <h4 class="h4sub">这个链路覆盖到哪、漏掉什么</h4>
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

          <h4 class="h4sub">「只读明细」要松一格：三个口子不能省</h4>
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

          <h4 class="h4sub">前端形态：一张明细 + 三条状态</h4>
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

          <h4 class="h4sub">后台自动计算与人工干预的边界</h4>
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
        </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'
import DocScreens from '../../../docs/components/DocScreens.vue'
import compStrategyShot from '../../../docs/assets/pages/resign-comp-strategy.png'
const payrollImplGaps = [
  { title: '① 修正', desc: '人事录错 / 漏录金额时的修改入口 —— 离职流程已生效、单还没出或已出，分别怎么改' },
  { title: '② 重算', desc: '冻结后余额仍有变动、或个税口径调整时，对已生成的补偿金单发起重算（复用现有「发起重算」能力）' },
  { title: '③ 异常清单', desc: '取不到值的兜底：未录金额 / 常乐豆余额未冻结（或被提现提走）/ 离职签署未完成 —— 需要一份可排查的清单，而不是静默跳过' }
]

const tocItems = [
  { id: 'rf-payroll-impl', label: '6.5 一次性补偿金的计算与发放' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '离职流程', to: '/docs/resign-flow' },
  { label: '六、功能详细说明', to: '/docs/resign-flow/features' },
  { label: '6.5 一次性补偿金的计算与发放' }
]
</script>

<style scoped src="./doc-base.css"></style>
<style scoped src="./flow-parts.css"></style>
