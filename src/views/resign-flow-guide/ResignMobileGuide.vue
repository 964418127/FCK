<template>
  <DocShell
    :toc-items="tocItems"
    title="离职流程 · 移动端功能说明"
    subtitle="逐页说明移动端能做什么、每一栏填什么、什么条件下按钮可点。对应原型页面：离职需求（员工侧）/ 离职处理列表 / 离职申请详情 / 解除用工。"
    version="v0.1"
    date="2026-10-20"
    :breadcrumbs="breadcrumbs"
  >
    <!-- ========== 一、文档信息 ========== -->
    <div id="rm-info" class="section">
      <div class="section-header">
        <h2>一、文档信息</h2>
        <DocCopyButton section-id="rm-info" />
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 150px;">项</th>
            <th>内容</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>文档名称</td><td>离职流程 · 移动端功能说明</td></tr>
          <tr><td>适用端</td><td>移动端（企业微信工作台 → 离职模块）</td></tr>
          <tr><td>配套文档</td><td>一、产品需求说明（为什么这么设计）；三、Web 端功能说明（Web 侧能做什么、后台要配什么）</td></tr>
          <tr><td>负责人</td><td>Lacus7</td></tr>
          <tr><td>版本</td><td>v0.1</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>本文件的定位：</strong>只讲<strong>界面怎么用</strong> —— 页面、字段、控件、按钮可用条件、提示文案。
        「为什么这么设计」「口径怎么定的」不在这里展开，一律回到<strong>产品需求说明</strong>对应小节。
      </div>
    </div>

    <!-- ========== 二、页面清单 ========== -->
    <div id="rm-pages" class="section">
      <div class="section-header">
        <h2>二、页面清单</h2>
        <DocCopyButton section-id="rm-pages" />
      </div>
      <p class="doc-p">移动端共 4 个页面，分属两侧：员工自己发起，人事统一处理。</p>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 170px;">页面</th>
            <th style="width: 120px;">侧 / 使用人</th>
            <th style="width: 200px;">路由</th>
            <th>用途</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>离职需求</strong></td>
            <td>员工侧 · 员工本人</td>
            <td><code>/mobile-resign-apply</code></td>
            <td>发起一笔离职需求：填期望离职日期与原因、核对收款账户、签字确认</td>
          </tr>
          <tr>
            <td><strong>离职处理（列表）</strong></td>
            <td>处理侧 · 人事</td>
            <td><code>/mobile-resign-pd</code></td>
            <td>两个 Tab 收口所有待办：主动离职 / 异常监控</td>
          </tr>
          <tr>
            <td><strong>离职申请详情</strong></td>
            <td>处理侧 · 人事</td>
            <td><code>/mobile-resign-pd/detail?id=</code></td>
            <td>审批一笔离职：看员工与资产、选出口、录补偿金、定实际离职日期</td>
          </tr>
          <tr>
            <td><strong>解除用工</strong></td>
            <td>处理侧 · 人事</td>
            <td><code>/mobile-resign-pd/release?id=</code></td>
            <td>异常监控对象的处理：看资产、选出口、录补偿金，确认离职事实时点后解除用工（系统离职）</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ========== 三、离职需求（员工侧） ========== -->
    <div id="rm-apply" class="section">
      <div class="section-header">
        <h2>三、离职需求（员工侧发起）</h2>
        <DocCopyButton section-id="rm-apply" />
      </div>
      <div class="func-entry"><strong>功能入口：</strong>移动端 → 离职模块 → 离职需求（<code>/mobile-resign-apply</code>）</div>

      <h3>页面结构</h3>
      <p class="doc-p">两步走完，第三步是结果页（只读）。步骤条常驻在页面顶部，当前步高亮。</p>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 110px;">步骤</th>
            <th style="width: 160px;">页面内容</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>1 申请离职</strong></td><td>我的信息 / 离职意向 / 收款账户 / 审批流程</td><td>四个区块自上而下；「我的信息」与「收款账户」只读带出，「离职意向」由员工填写</td></tr>
          <tr><td><strong>2 签字确认</strong></td><td>确认离职需求 / 本人签字 / 提交后</td><td>把第一步填的内容汇总成一张确认卡，签名并勾选须知后才能提交</td></tr>
          <tr><td><strong>结果页</strong></td><td>提交成功 / 处理进度 / 接下来</td><td>显示需求编号与「待审核」，并告知后续三步</td></tr>
        </tbody>
      </table>

      <h3>字段与控件</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 120px;">区块</th>
            <th style="width: 160px;">字段</th>
            <th style="width: 150px;">控件 / 形态</th>
            <th style="width: 80px;">必填</th>
            <th>口径</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td rowspan="6"><strong>我的信息</strong></td>
            <td>姓名 / 工号 / 岗位 / 用工类型 / 入职日期</td>
            <td>只读文本</td>
            <td>—</td>
            <td>新员工关系带出，员工不能改</td>
          </tr>
          <tr>
            <td>技法 / 等级 / 合同门店<br />（推拿师）</td>
            <td rowspan="3">只读文本，按岗位渲染</td>
            <td>—</td>
            <td>随岗位自动判断，不设分组标题</td>
          </tr>
          <tr>
            <td>合同门店（客户经理）</td>
            <td>—</td>
            <td>客户经理不带等级、不带在管会员</td>
          </tr>
          <tr>
            <td>所在部门（总部）</td>
            <td>—</td>
            <td>总部无技法、无门店、无等级</td>
          </tr>
          <tr>
            <td>期望离职日期</td>
            <td>日期选择器</td>
            <td>必填</td>
            <td>员工自己填的「希望哪天走」，与审批时定的<strong>实际离职日期</strong>不是一回事</td>
          </tr>
          <tr>
            <td>离职原因 / 补充说明</td>
            <td>标签多选 + 多行文本（200 字）</td>
            <td>原因必填<br />说明选填</td>
            <td>原因枚举：工资太低 / 离家太远 / 结婚生子 / 自主创业 / 照顾家庭</td>
          </tr>
          <tr>
            <td><strong>收款账户</strong></td>
            <td>银行卡户名 / 卡号 / 开户行</td>
            <td>只读文本</td>
            <td>—</td>
            <td>来源新员工关系；本页不提供改卡入口，提示去档案更新</td>
          </tr>
          <tr>
            <td><strong>审批流程</strong></td>
            <td>发起人 → 审核人 → 抄送</td>
            <td>只读流程节点</td>
            <td>—</td>
            <td>按岗位自动带出：推拿师走人事经理（2 人）、客户经理走城市总（1 人）、总部走单一审批人</td>
          </tr>
          <tr>
            <td><strong>签字确认</strong></td>
            <td>签名 / 同意须知</td>
            <td>签名框 + 勾选框</td>
            <td>均必填</td>
            <td>签名代表确认信息真实无误；未勾选不能提交</td>
          </tr>
        </tbody>
      </table>

      <h3>按钮与可用条件</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 150px;">按钮</th>
            <th style="width: 120px;">位置</th>
            <th>可点条件</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>下一步</strong></td><td>底部操作条（第一步）</td><td>已选<strong>期望离职日期</strong> 且 <strong>离职原因至少选 1 项</strong>；否则置灰</td></tr>
          <tr><td><strong>返回修改</strong></td><td>底部操作条（第二步）</td><td>随时可点，回到第一步，已填内容保留</td></tr>
          <tr><td><strong>提交离职需求</strong></td><td>底部操作条（第二步）</td><td>已<strong>签名</strong> 且 已<strong>勾选同意须知</strong>；否则置灰</td></tr>
        </tbody>
      </table>

      <h3>提交后</h3>
      <ul class="rf-list">
        <li>生成一条<strong>需求编号</strong>（例：RQ20261019001），状态置为<strong>待审核</strong>。</li>
        <li>需求进入人事的「离职处理 → 主动离职」列表；审核中员工不可修改。</li>
        <li>审批通过后，人事确定<strong>实际离职日期</strong>并另行发起离职协议签署。</li>
        <li>离职当月的剩余权益（常乐豆、福利假额等）由人事与员工协商处理，不在本页填写。</li>
      </ul>
    </div>

    <!-- ========== 四、离职处理（列表） ========== -->
    <div id="rm-list" class="section">
      <div class="section-header">
        <h2>四、离职处理（人事列表）</h2>
        <DocCopyButton section-id="rm-list" />
      </div>
      <div class="func-entry"><strong>功能入口：</strong>移动端 → 离职模块 → 离职处理（<code>/mobile-resign-pd</code>）</div>

      <h3>两个 Tab</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 120px;">Tab</th>
            <th style="width: 190px;">卡片信息</th>
            <th style="width: 130px;">角标</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>主动离职</strong><br /><span class="mini">带待办数</span></td>
            <td>姓名 + 岗位标签 + 状态字、岗龄、岗位 · 合同门店 / 所在部门、申请日期</td>
            <td>待审核 / 已办结</td>
            <td>点卡片进入<strong>离职申请详情</strong></td>
          </tr>
          <tr>
            <td><strong>异常监控</strong><br /><span class="mini">带未处理数</span></td>
            <td>姓名 + 工号 + 岗位 + 岗位标签、年龄性别工龄评分、合同门店、用工状态、手机号、未出勤天数</td>
            <td>未处理</td>
            <td>「暂停用工」标记状态；「解除用工」进入解除页；底部「新增异常监控」</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>角标与状态字不是一回事：</strong>角标是<strong>单据状态</strong>（这笔离职办到哪一步），
        状态字是<strong>员工状态</strong>（在职 / 已离职）。两者并列显示，避免把「流程没走完」误读成「人还在职」。
      </div>

      <h3>搜索</h3>
      <p class="doc-p">顶部搜索框按<strong>姓名或工号</strong>过滤，对当前 Tab 生效；无匹配时显示「没有匹配的离职申请 / 异常项」。</p>
    </div>

    <!-- ========== 五、离职申请详情（审批） ========== -->
    <div id="rm-detail" class="section">
      <div class="section-header">
        <h2>五、离职申请详情（审批）</h2>
        <DocCopyButton section-id="rm-detail" />
      </div>
      <div class="func-entry"><strong>功能入口：</strong>离职处理列表 → 点任一条主动离职卡片（<code>/mobile-resign-pd/detail?id=rs01</code>）</div>

      <h3>区域顺序</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 60px;">序</th>
            <th style="width: 170px;">区域</th>
            <th>内容与规则</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>1</td><td>流程条</td><td>离职审批 → 意见填写，两步态</td></tr>
          <tr><td>2</td><td>员工头部 + 申请信息</td><td>姓名 / 工号 / 岗位标签 / 岗位 · 合同门店；申请时间、期望离职日期、离职原因</td></tr>
          <tr><td>3</td><td>员工信息（可收拢）</td><td>摘要行（年龄 / 工龄 / 等级 / 社保）+ <strong>过去 12 个月平均收入</strong>（补偿金的计算基数，默认可见）+ <strong>收款账户默认显示</strong>；点「展开明细」看完整档案字段</td></tr>
          <tr><td>4</td><td>剩余资产</td><td>只读呈现：常乐豆三层余额、负工资账户余额、剩余福利假额、在途协商扣缴；数值一律带「约」</td></tr>
          <tr><td>5</td><td>款项出口</td><td>逐条款项选通道：一次性补偿金 / 并入薪金（默认并入薪金）</td></tr>
          <tr><td>6</td><td>离职补偿金</td><td>人工录入金额：默认 0，上限 = <strong>过去 12 个月平均收入 ×（N+1）</strong>（唯一上限，不叠封顶），不允许负数 + 自由文本备注；金额 &gt; 0 时<strong>必须上传协商协议附件</strong>。<strong>这里录的是「预估」</strong>：常乐豆出口按约数参与，最终以次月 5 日冻结余额后跑批的计算值为准</td></tr>
          <tr><td>7</td><td>审批填写</td><td>离职类型、实际离职日期、离职原因（多选）、是否黑名单</td></tr>
          <tr><td>8</td><td>审批确认</td><td>审批后自动执行的影响面 + 条款 + 输入「确认」</td></tr>
        </tbody>
      </table>

      <h3>审批填写字段</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 140px;">字段</th>
            <th style="width: 170px;">控件</th>
            <th>规则</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>离职类型</strong></td>
            <td>单选</td>
            <td>主动离职（<strong>默认</strong>）/ 协商一致解除劳动合同 / 被动离职（<strong>置灰不可选</strong>，由异常监控触发）</td>
          </tr>
          <tr>
            <td><strong>实际离职日期</strong></td>
            <td>日期选择器</td>
            <td>必填；<strong>一旦审批通过即锁定、不可更改</strong>，是下游所有结算的锚点</td>
          </tr>
          <tr>
            <td><strong>离职原因</strong></td>
            <td>复选</td>
            <td>可多选，默认带出员工发起时填的原因，人事可调整</td>
          </tr>
          <tr>
            <td><strong>是否黑名单</strong></td>
            <td>单选（是 / 否）</td>
            <td>默认否</td>
          </tr>
        </tbody>
      </table>

      <h3>补偿金录入的三条硬约束</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 140px;">约束</th>
            <th>规则与页面表现</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>金额上限</strong></td>
            <td>上限 = <strong>过去 12 个月平均收入 ×（N+1）</strong>（唯一上限）；输入框按 <code>:max</code> 限制，下方提示写明「月均收入 ×（N+1）＝ 上限」的算式；未取到月均收入时不写死上限，提示人工核对</td>
          </tr>
          <tr>
            <td><strong>协商协议附件</strong></td>
            <td>金额 &gt; 0 时<strong>必传</strong>（PDF / JPG / PNG，单个 ≤ 10MB，最多 3 个）；未上传时提交按钮不可用，并在卡片内提示「请上传协商协议后再提交」</td>
          </tr>
          <tr>
            <td><strong>提交条件</strong></td>
            <td>实际离职日期 + 输入「确认」+ 负工资结算完成 + （填了补偿金时）附件已上传，四个条件同时满足才可提交</td>
          </tr>
        </tbody>
      </table>

      <h3>审批后自动执行（按岗位呈现）</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 140px;">动作</th>
            <th style="width: 240px;">门店侧（推拿师 / 客户经理）</th>
            <th>总部员工</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>排班取消</td>
            <td>「实际离职日期后的 <strong>N</strong> 个排班全部取消」</td>
            <td>不适用（总部岗位不排班）</td>
          </tr>
          <tr>
            <td>接单权限</td>
            <td>「实际离职日期后截断」</td>
            <td>不适用（总部岗位不接单）</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        总部员工显示<strong>「不适用」而不是「0」</strong>：0 会被读成「查过了，确实没有」，而总部是这两个动作本身不存在。
        对应的确认条款也随岗位变化 —— 总部版本去掉排班与接单两条，只留日期锁定与不可撤销。
      </div>

      <h3>按钮与提交条件</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 190px;">按钮</th>
            <th>可点条件</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>拒绝</strong></td><td>随时可点，退回该离职申请</td></tr>
          <tr>
            <td><strong>同意，并发送离职协议</strong></td>
            <td>已选<strong>实际离职日期</strong> 且 已输入「<strong>确认</strong>」 且 该员工的<strong>负工资结算已完成</strong>；三项缺一即置灰</td>
          </tr>
        </tbody>
      </table>
      <p class="doc-p">
        置灰时页面底部给出一条提示，说明还缺哪一项（例：提交条件：选择实际离职日期 + 输入「确认」 + 等待负工资结算完成）。
      </p>
    </div>

    <!-- ========== 六、解除用工 ========== -->
    <div id="rm-release" class="section">
      <div class="section-header">
        <h2>六、解除用工（异常监控）</h2>
        <DocCopyButton section-id="rm-release" />
      </div>
      <div class="func-entry"><strong>功能入口：</strong>离职处理 → 异常监控 Tab → 卡片上的「解除用工」（<code>/mobile-resign-pd/release?id=rs11</code>）</div>

      <h3>页面内容</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 170px;">区域</th>
            <th>内容与规则</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>员工头部</td>
            <td>姓名 / 工号、年龄性别工龄评分、岗位 · 等级 · 技法</td>
          </tr>
          <tr>
            <td>员工信息</td>
            <td><strong>离职类型：被动离职（异常监控触发）</strong>、<strong>离职方式：系统离职（不走离职协议签署）</strong>、合同门店、用工状态、手机号、监控开始</td>
          </tr>
          <tr>
            <td>异常提示</td>
            <td>未出勤 N 天</td>
          </tr>
          <tr>
            <td>收款账户 / 剩余资产</td>
            <td>均只读，形态与审批页一致</td>
          </tr>
          <tr>
            <td>款项出口</td>
            <td>常乐豆二选一（一次性补偿金 / 并入薪金），默认并入薪金；<strong>本入口同样要处置资产</strong>，不因「无审批」省略</td>
          </tr>
          <tr>
            <td>离职补偿金</td>
            <td>人工录入：默认 0、不允许负数、上限 = 月均 ×（N+1）（唯一上限）；<strong>金额 &gt; 0 必须上传依据附件</strong>（PDF / JPG / PNG，最多 3 个）+ 备注。<strong>不走签署，以本次提交为成立点</strong></td>
          </tr>
          <tr>
            <td>解除确认</td>
            <td>离职事实时点（日期，必填）、解除原因说明（多行文本）、5 条条款、输入「确认」</td>
          </tr>
        </tbody>
      </table>

      <h3>条款</h3>
      <ul class="rf-list">
        <li>解除后员工状态标记为离职（系统离职），<strong>不再发起离职协议签署</strong>。</li>
        <li>解除后，该时点之后的<strong>排班将全部取消</strong>（推拿师 / 客户经理均适用）。</li>
        <li>解除后员工失去接单权限。</li>
        <li><strong>资产随本次提交一并处置</strong>：款项出口与补偿金同时生效；补偿金不走签署，以本次提交为成立点，进入次月 5 日冻结后的跑批。</li>
        <li>此操作不可撤销（出口与补偿金请在提交前确认）。</li>
      </ul>

      <h3>按钮与可用条件</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 140px;">按钮</th>
            <th>可点条件 / 结果</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>暂停用工</strong></td><td>随时可点；只标记状态，不解除</td></tr>
          <tr><td><strong>解除用工</strong></td><td>已选<strong>离职事实时点</strong> 且 已输入「<strong>确认</strong>」；若补偿金 &gt; 0，还需<strong>已上传依据附件</strong>；否则置灰</td></tr>
        </tbody>
      </table>
    </div>

    <!-- ========== 七、通用交互与提示 ========== -->
    <div id="rm-common" class="section">
      <div class="section-header">
        <h2>七、通用交互与提示</h2>
        <DocCopyButton section-id="rm-common" />
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 170px;">场景</th>
            <th>规则</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>只读 vs 需填写</td>
            <td>区块标题右侧用小标签区分：<strong>档案带出</strong> / <strong>自动带出</strong>（灰）= 只读；<strong>需填写</strong> / <strong>本流程提供</strong>（红）= 本页要操作</td>
          </tr>
          <tr>
            <td>金额一律「预估」</td>
            <td>剩余资产里的数会随他方结算变动，界面统一带「约」并标预估，不呈现为确定结论</td>
          </tr>
          <tr>
            <td>不可逆操作</td>
            <td>审批通过、解除用工都会<strong>二次确认</strong>（手工输入「确认」），并在条款里写明「此操作不可撤销」</td>
          </tr>
          <tr>
            <td>数据来源</td>
            <td>收款账户、员工基础信息、剩余资产均<strong>取数呈现</strong>，离职侧不维护这些数据，也不提供修改入口</td>
          </tr>
          <tr>
            <td>空状态</td>
            <td>列表无数据显示居中文案；不展示「0 条 / 暂无异常」这类容易被误读为结论的措辞</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ========== 八、与需求文档的对应 ========== -->
    <div id="rm-map" class="section">
      <div class="section-header">
        <h2>八、与需求文档的对应关系</h2>
        <DocCopyButton section-id="rm-map" />
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 220px;">本文页面</th>
            <th>对应需求说明章节</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>三、离职需求（员工侧）</td><td>6.1 离职需求发起（员工侧）</td></tr>
          <tr><td>四、离职处理（列表）</td><td>6.2 离职处理（统一处理）</td></tr>
          <tr><td>五、离职申请详情 · 剩余资产</td><td>6.4 剩余资产可见</td></tr>
          <tr><td>五、离职申请详情 · 款项出口</td><td>6.5 款项出口</td></tr>
          <tr><td>五、离职申请详情 · 补偿金录入</td><td>6.7 离职补偿金明细（录入在流程内）</td></tr>
          <tr><td>六、解除用工</td><td>6.2 离职处理 · 异常监控小节 / 6.3 状态机适用范围</td></tr>
        </tbody>
      </table>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../docs/components/DocShell.vue'
import DocCopyButton from '../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'rm-info', label: '一、文档信息' },
  { id: 'rm-pages', label: '二、页面清单' },
  { id: 'rm-apply', label: '三、离职需求（员工侧发起）' },
  { id: 'rm-list', label: '四、离职处理（人事列表）' },
  { id: 'rm-detail', label: '五、离职申请详情（审批）' },
  { id: 'rm-release', label: '六、解除用工（异常监控）' },
  { id: 'rm-common', label: '七、通用交互与提示' },
  { id: 'rm-map', label: '八、与需求文档的对应关系' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '离职流程', to: '/docs/resign-flow/requirement' },
  { label: '二、移动端功能说明' }
]
</script>

<style scoped>
.doc-p { font-size: 13.5px; line-height: 1.8; color: hsl(var(--foreground)); margin: 10px 0; }
.rf-list { margin: 10px 0; padding-left: 20px; }
.rf-list li { font-size: 13.5px; line-height: 1.9; margin-bottom: 4px; color: hsl(var(--foreground)); }
.func-entry {
  font-size: 12.5px; color: hsl(var(--muted-foreground));
  background: hsl(var(--muted) / 0.35);
  border-radius: 6px; padding: 8px 12px; margin: 10px 0 16px;
}
.func-entry code { font-size: 12px; }
.mini { font-size: 11px; color: hsl(var(--muted-foreground)); font-weight: 400; }
code {
  background: hsl(var(--muted) / 0.6);
  border-radius: 4px; padding: 1px 5px;
  font-family: ui-monospace, Menlo, Consolas, monospace;
}
</style>
