<template>
  <DocShell
    :toc-items="tocItems"
    title="6.1 离职交接（配置 + 执行）"
    subtitle="上线前先配：模板 + 审核链 + 节点 + 系统检查；之后每笔单按发起时的快照生成交接清单，逐节点确认、全部办结自动推送离职合同 —— 我们只承载确认与留痕"
    version="v0.3"
    date="2026-10-26"
    :breadcrumbs="breadcrumbs"
  >
        <div id="rf-handover" class="section">
          <div class="section-header">
            <h2>6.1 离职交接（配置 + 执行）</h2>
            <DocCopyButton section-id="rf-handover" />
          </div>
          <div class="func-entry"><strong>功能入口：</strong>Web → 离职 → 离职流程模板；移动端 → 离职模块 → 交接处理（列表进列表，单笔进度从离职处理列表或列表页对应单据进入）</div>

          <div class="note">
            <strong>本章怎么读：</strong>分两段 ——
            <strong>6.1.1–6.1.3 是上线前的一次性配置</strong>（模板 / 审核链 / 节点 / 系统检查项），配错会传导到后面每一笔单；
            <strong>6.1.4–6.1.7 是运行期</strong>（发起时快照生成清单、逐节点确认、门禁与终止）。
            本章排在第六章最前，就是因为<strong>先有配置，才有单据</strong>。
          </div>
          <DocScreens
            :images="[
              { src: tplTimelineShot, label: '交接流程编排页：第 1 步「适用范围与审核人」+ 第 2 步「交接流程编排」（时间线按前置自动排布，系统检查节点标「系统」，尾部 = 推送离职合同）' },
              { src: tplListShot, label: '模板列表：行操作「编排 / 复制 / 停用」，新建流程从空白时间线开始' },
              { src: tplChecksShot, label: '系统检查项列表页：通过 / 软性 / 未通过三段结果域（最新镜像）+ 最近执行（点进执行明细页）+ 被引用模板（只读）' },
              { src: tplRunsShot, label: '系统检查执行明细页：Agent 执行日志 —— 左列批次（批次号 / 执行时间 / 条件版本），右侧当批条件快照 + 逐单结果（员工姓名 / 工号 / 岗位 + 判定 + 指标原值）；顶部支持按员工跨批次查询' },
              { src: tplSysNodeShot, label: '系统检查节点抽屉：检查项枚举（最新镜像）/ 门禁 / 前置 / 取数频率（间隔值 + 单位）/ 批次上限（只计消费到的不同未通过批次）' }
            ]"
          />
          <p class="doc-p">
            员工提交离职需求并经离职需求审核确认后，进入一段<strong>按岗位配置的交接流程</strong>：系统按员工岗位匹配一套<strong>离职流程模板</strong>，
            生成这笔单据自己的<strong>交接清单</strong>；各节点负责人逐项确认（结论 + 说明 + 证据附件），<strong>全部办结后自动推送离职合同</strong>。
            这段是 v0.2 按业务反馈新增的，只承载<strong>确认与留痕</strong> —— 交接动作本身（客户资料移交、物品归还、账号回收）都在系统外完成，
            我们<strong>不判断事情做没做</strong>。
          </p>

          <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary)); margin-bottom: 14px;">
            <strong>链路位置：</strong>发起 → <strong>离职需求审核</strong>（6.3，一次定稿）→ <strong>交接（本节）</strong> → <strong>自动推送离职合同</strong>（6.4）→ 次月金额（6.4 / 6.5）。
            交接全部办结后系统<strong>自动推送离职合同</strong>，无需再次确认；实际离职日期在审核确认时已锁定，排班取消与接单截断随之生效 ——
            <strong>交接流程不动员工在任何系统中的状态</strong>。
          </div>


          <h3 id="rf-hd-tpl">6.1.1 配置层：离职流程模板</h3>
          <table class="data-table">
            <thead>
              <tr><th style="width: 170px;">配置对象</th><th>字段</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>模板</strong></td><td>名称、状态（启用 / 停用）、版本、<strong>第 1 步「适用范围与审核人」</strong>、<strong>第 2 步「交接流程编排」</strong>（节点清单）。停用不影响在途单（发起时快照版本）</td></tr>
              <tr><td><strong>适用范围与审核人（第 1 步）</strong></td><td>编排页把模板配置分为两步，<strong>第 1 步先划清这条流程管谁、由谁审核</strong>：适用条件（岗位必选 + 城市 / 门店 / 用工形式可选）+ <strong>离职需求审核链</strong>。未设适用岗位的空流程会高亮引导先完成第 1 步，再进入第 2 步编排</td></tr>
              <tr><td><strong>审核链（离职需求审核）</strong></td><td>1~3 级，每级 = 角色（部门上级 / 人事专员 / 人事经理 / 城市总 / 总经理）+ <strong>人员多选</strong>（候选按角色带出；留空 = 按组织关系自动解析，如「部门上级」固定解析）。<strong>逐级办结后员工才进入交接流程</strong>。一个管理维度（岗位 + 城市 / 门店组合）配一条流程；同岗位不同城市要不同审核链（如成都的调理师先人事经理、再城市总）就另配更具体的模板，发起时按「越具体越优先」命中</td></tr>
              <tr><td><strong>通过方式（或签 / 会签）</strong></td><td>一级选了 <strong>≥ 2 人</strong>时出现：默认<strong>任一人通过即可（或签）</strong>——同角色多人互为备份；需共同确认时切<strong>全部通过（会签）</strong>。按级配置、无全局开关；单人时等价或签</td></tr>
              <tr><td><strong>适用条件</strong></td><td>岗位（必选，多选）+ 城市 / 门店 / 用工形式（可选，多重约束）。匹配<strong>越具体越优先</strong>（岗位+门店+用工 &gt; 岗位+城市 &gt; 仅岗位），同具体度取最近修改；<strong>未被任何模板命中时不拦截发起</strong>——人事确认后系统自动推送离职合同（不经交接），同时提醒人事补配模板</td></tr>
              <tr><td><strong>节点清单</strong></td><td>模板就是一张<strong>平铺的节点清单</strong>：<strong>没有阶段、没有分组</strong>，先后关系只由每个节点的<strong>前置节点</strong>决定，跟节点在列表里的上下位置无关（页面按前置层级排序只是为了阅读顺序）。业务配置时<strong>不需要理解流程图</strong>——每行都写明「发起后即可开始办理」或「等某某办结后才能开始办理」，谁等谁一眼可见</td></tr>
              <tr><td><strong>前置节点</strong></td><td>每个节点的多选字段，<strong>并行与先后都从它派生</strong>：<strong>没配前置 = 发起后即可开始办理</strong>，和所有没配前置的节点同时进行、互相不等待；<strong>配了前置 = 这些前置全部到终态（完成 / 不通过 / 跳过）后才能开始办理</strong>。一个节点可以等多个前置（汇合），也可以被多个节点同时等待（分叉）。候选里自动排除会成环的节点，保存前再做一次<strong>环校验</strong>；删除节点时，等它的节点的前置会被一并去掉并提示</td></tr>
              <tr><td><strong>节点</strong></td><td>清单里的一个步骤，两种类型：<strong>人工确认节点</strong>（名称、负责人角色、门禁必过 / 可选、待办事项 1..n）与<strong>系统检查节点</strong>（从公共枚举选检查项 + 门禁 + 取数频率 + 批次上限）</td></tr>
              <tr><td><strong>节点负责人</strong></td><td>配置<strong>角色</strong>（城市总 / 店长 / 人事经理 / 财务 / IT…），发起时按员工组织关系<strong>自动解析到人</strong>；允许指定到人覆盖。同一负责人出现在多个可办节点时<strong>合并为一条待办</strong></td></tr>
              <tr><td><strong>待办事项</strong></td><td>事项名称 + 办理要求 + 证据附件要求（无需 / 可选 / 必传 + 数量上限 1..5，格式固定 PDF / JPG / PNG）</td></tr>
              <tr><td><strong>系统检查节点</strong></td><td><strong>公共枚举、由检查 Agent 执行</strong>；添加节点时选「系统检查」类型从枚举中引用一条，可调整<strong>门禁（必过 / 软性只需结果）、前置节点、取数频率、批次上限</strong>；<strong>Agent 的运行节奏（多久盘查一轮、什么时候出新批次）由它自身配置，不在模板上</strong>；同一模板内每个检查项只能出现一次（枚举清单见下）</td></tr>
              <tr><td><strong>取数频率与批次上限</strong></td><td><strong>取数频率归流程侧</strong>：配在模板节点上，是「<strong>离职流程多久去取一次结果值</strong>」（间隔值 + 单位 / 只取一次），<strong>与 Agent 的运行节奏相互独立</strong>。<strong>批次上限</strong>是终止 / 放行的阈值——只计<strong>消费到的不同未通过批次</strong>（同一批次反复取到不重复计数，避免取数比出批快时误判超时）；节点由前置决定何时开始消费该检查项的结果，激活后先采纳该单最新的批次结果，之后的批次结果继续流入直至终态</td></tr>
            </tbody>
          </table>

          <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary)); margin-bottom: 14px;">
            <strong>未命中模板的兜底口径：</strong>员工发起时若<strong>未被任何交接流程模板命中</strong>（新岗位上线、模板未配置等），<strong>不拦截发起</strong>——
            单据照常进入人事确认；人事确认（离职类型 / 实际离职日期 / 补偿金与常乐豆出口等一次定稿）后，因无交接清单可走，
            系统即<strong>自动触发按当前流程推送离职合同</strong>，员工照常在线签署；同时向人事发出<strong>补配模板提醒</strong>，补配后该岗位的后续发起恢复正常匹配。
            换言之：交接流程只是链路中的<strong>可选门禁段</strong>，「人事确认 → 自动推送合同」这条主干不依赖它存在。
          </div>
          <p class="doc-p">
            预置模板示例（「→」= 前置关系；没写「→」的节点都是发起后即可开始办理、同时并行）——
            <strong>「普通员工通用离职」</strong>共 9 个节点：
            客户与物品交接 ∥ 工作交接 ∥ 欠款与借款结清 ∥ <em>负债检查（系统，发起后即开始取数，每 1 天取一次）</em>
            → <em>资产归还检查（系统，→ 客户与物品交接，办结后开始取数，每 1 天取一次）</em>
            → 账号与权限回收（→ 工作交接 + 资产归还检查，<strong>两个前置汇合</strong>）
            → <em>客诉纠纷检查（系统，软性，→ 客户与物品交接，每 2 小时取一次、最多 5 个未通过批次）</em>
            → 离职面谈确认（→ 欠款结清 + 账号回收 + 客诉检查 + 负债检查，<strong>收口节点</strong>）
            → <em>考勤异常检查（系统，→ 面谈确认，每 12 小时取一次）</em>。
            <strong>「城市总离职流程」</strong>：团队与门店交接 ∥ 门店账务与备用金 ∥ 客诉检查（系统）→ 资产归还检查（→ 团队交接）→ 系统权限回收（→ 账务核对 + 资产归还检查，<strong>账务核对完才收权限</strong>）→ 团队档案移交（→ 团队交接）→ 总经理面谈（收口）。
            配置界面为<strong>平铺节点列表</strong>：每行标序号、开始时机（绿色「发起后即可开始办理」/ 紫色「等某某办结后才能开始办理」）与后续节点，每行可<strong>「加后续节点」</strong>（预置以它为前置）；右侧<strong>结构预览</strong>按前置层级纵向排列——同层横排 = 互不等待，下一层 = 各自等自己的前置。
          </p>

          <h3 id="rf-hd-check">6.1.2 系统检查节点（公共枚举 · 检查 Agent 执行）</h3>
          <p class="doc-p">
            有些交接事项<strong>系统自己就能追踪到结果</strong>，不需要再找一个人来确认 —— 这些做成<strong>系统检查节点</strong>：
            检查项是<strong>公共枚举</strong>（跨模板复用），业务在模板里通过「添加节点 → 系统检查」引用一条，
            <strong>检查项的结果域条件由检查 Agent 侧管理</strong>（相关人员对话式配置、测试验证通过后上线），模板里不定义、也改不了。
            节点激活的时机与人工节点同一条规则——<strong>只看前置节点</strong>：没配前置 = 发起后即激活；配了前置 = 前置全部办结后激活。
            激活后节点开始<strong>采纳检查 Agent 的批次结果</strong>：自动落结论、无需人工确认，结论只有「完成 / 不通过」。
            <strong>同样分门禁</strong>：必过项不通过 → 终止全部流程；软性项只记录结果、不阻塞放行。
            首批枚举如下（数据源归各归属系统；<strong>结果域条件的最新生效版本由检查 Agent 反馈、在系统检查项列表页镜像展示</strong>）：
          </p>
          <table class="data-table">
            <thead>
              <tr><th style="width: 140px;">检查项</th><th style="width: 110px;">数据源</th><th style="width: 270px;">通过（期望结果）</th><th>软性（差异区间，支持多条件「且 / 或」）</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>负债检查</strong></td><td>财务模块</td><td>未结清借款 + 欠款 + 备用金缺口 合计 = 0（三条件 <strong>且</strong>）</td><td>-100 ≤ 合计 &lt; 0</td></tr>
              <tr><td><strong>客诉纠纷检查</strong></td><td>客诉工单</td><td>近 30 天待处理工单 = 0</td><td>待处理 ≤ 2 件</td></tr>
              <tr><td><strong>资产归还检查</strong></td><td>资产台账</td><td>应归还资产未销账 = 0 件</td><td>未销账 ≤ 1 件</td></tr>
              <tr><td><strong>在途排班检查</strong></td><td>排班系统</td><td>期望离职日期后在途班次 = 0</td><td>在途班次 ≤ 1 <strong>且</strong> 均可调休替</td></tr>
              <tr><td><strong>常乐豆余额检查</strong></td><td>常乐豆</td><td>账面余额已冻结且待结 = 0</td><td>未定义软性区间（不支持软性门禁）</td></tr>
              <tr><td><strong>考勤异常检查</strong></td><td>假勤模块</td><td>未处理异常 = 0 条</td><td>排班差异 &lt; 10% <strong>或</strong> 打卡差异 &lt; 5%（多条件 · 或）</td></tr>
            </tbody>
          </table>
          <p class="doc-p">
            两者都不命中即为<strong>未通过</strong>，由检查 Agent 下一批次继续盘查。
            检查项的<strong>当前生效条件</strong>由检查 Agent 反馈、在<strong>系统检查项列表页</strong>（Web → 离职 → 系统检查项，<code>/resign-system-checks</code>）镜像展示：
            三段定义（<strong>最新一次批次反馈的生效版本</strong>，含配置人与上线时间）+ 被引用的模板；
            编排页的系统节点卡片悬浮也能看定义 —— 条件由 Agent 侧管理，流程侧只读引用。
          </p>
          <DocFigure :src="verdictImg" title="结果域与取数闭环：一个批次的判定怎么落" note="通过立即办结 / 软性按门禁处理 / 未通过进下一批；到批次上限的两种终态。取数异常单独重试、不算未通过。" default-open />
          <p class="doc-p">
            例：客诉检查「待处理工单 = 0」必过 —— 第 1 批剩 2 件（未通过）→ 第 2 批归 0 → <strong>当场办结</strong>，本单共命中 2 个未通过批次即停；
            必过项临上限时交接页会先提示人事线下核实，但<strong>是否终止由上限规则说了算，不靠人盯</strong>。
          </p>
          <p class="doc-p">
            运行中的系统检查在交接页显示<strong>「检查中：已取 N 次 / 命中 M 个未通过批次」</strong>与最近一次判定内容，每条检查明细携带批次号可溯源。
          </p>

          <h3 id="rf-hd-agent">6.1.3 检查 Agent：运行机制与数据结果模式</h3>
          <p class="doc-p">
            运行结构见 <strong>5.5 节结构图</strong>。一句话分工：我们管「<strong>查不出来怎么办</strong>」，Agent 管「<strong>查什么、按什么条件判、条件怎么演进</strong>」。
          </p>
          <DocFigure :src="cadenceImg" title="两层频率：Agent 运行节奏 vs 流程取数频率" note="出批与取数是两条互不绑架的时间线：节奏归 Agent、取数归节点；批次上限只认消费到的不同未通过批次。" default-open />
          <p class="doc-p">
            <strong>由此产生的一条硬规则</strong>：批次上限计「<strong>消费到的不同未通过批次</strong>」，不按取数动作次数——
            同一批次的结果反复取到不重复计数，取数与出批的差值（白等）在交接页显式标出。
          </p>
          <p class="doc-p">
            <strong>数据结果模式（批次反馈报文）</strong>：每批一条 —— 批次头（批次号 / 执行时间 / <strong>当批条件快照</strong>：通过与软性两组）+
            逐单结果（判定 / <strong>指标原值</strong> / 命中条件或差距）。条件的批次快照随结果落库：同一笔单跨批次期间标准被调整时，每批各留各的痕、不互相覆盖。
          </p>
          <table class="data-table">
            <thead>
              <tr><th style="width: 190px;">溯源链（任何一次判断都能查到依据）</th><th>路径</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>节点某次判断 → 当时的结果值与条件</strong></td>
                <td>交接进度页节点的检查明细（时间 / 指标 / 结果，<strong>每条携带批次号</strong>）→ 按批次号到<strong>系统检查执行明细页</strong>：
                  该批次执行的条件快照 + 逐单结果值。被流程节点使用的那次判断，<strong>当时取到什么值、按什么条件判的</strong>，两级页面即可查全</td>
              </tr>
              <tr>
                <td><strong>条件版本 → 配置依据</strong></td>
                <td>执行明细页中的条件版本关联<strong>配置人与上线时间</strong>（人员对话式配置、测试验证后上线），配置过程留档在 Agent 侧；按员工姓名 / 工号查询时，每条记录同时带出该员工信息与<strong>当时使用的条件</strong></td>
              </tr>
            </tbody>
          </table>

          <h3 id="rf-hd-inst">6.1.4 实例层：这笔单的交接清单</h3>
          <p class="doc-p">
            发起时按模板<strong>快照版本</strong>生成（界面明示「发起时快照 vN」）：<strong>已发起的单据始终按当时的模板走完流程</strong>，
            模板改动不回流；<strong>要么走完、要么终止后以新版模板重新发起</strong>，不存在在途单中途换版本。
            界面为<strong>与配置层同构的平铺节点列表</strong>（带序号、开始时机写在每行上），节点逐行列结论：
          </p>
          <table class="data-table">
            <thead>
              <tr><th style="width: 170px;">元素</th><th>说明</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>节点行</strong></td><td>序号 + 节点名 + 门禁 + 负责人 + 实时结论（当前可办 / 检查中 / 已完成 / 不通过 / 已跳过 / 因终止关闭）；「当前可办」的人工节点可点入确认页，可催办；系统节点标「系统」角标，显示运行摘要（检查中：<strong>已取 N 次 / 命中 M 个未通过批次</strong>、最近判定内容；取数与出批不一致时标出「同一批次」，明细每条带批次号可溯源）</td></tr>
              <tr><td><strong>前置提示</strong></td><td>配了前置的节点在卡片内写明前置清单：已满足显示「前置：某某、某某」；还没满足显示「未开始」并提示「等某某办结后才能开始办理，当前不需要任何人处理」——把「没轮到」和「拖着没办」区分开，避免误催办</td></tr>
            </tbody>
          </table>
          <p class="doc-p">
            负责人在节点确认页<strong>逐事项</strong>给结论：已完成 / 未完成 + 说明（必填）+ 证据附件（按要求上传）。
            <strong>只有该节点负责人能确认</strong>；人事与员工只看进度。
          </p>
          <p class="doc-p">
            负责人的入口是移动端<strong>交接处理列表</strong>（<code>/mobile-resign-handover/list</code>）：
            打开即见<strong>自己的交接记录</strong>（搜索 + 状态筛选）——<strong>待处理</strong>只出现<strong>轮到他办理</strong>的节点（前置已全部办结、当前可办），
            点卡片直达节点确认页；<strong>已处理</strong>保留他办结过的节点记录（结论 + 办结时间 + 确认人），<strong>只读留痕、不再提供处理动作</strong>。
            还没轮到的节点不会出现在这里，也不会催到他头上。
          </p>

          <h3 id="rf-hd-gate">6.1.5 门禁与终止</h3>
          <table class="data-table">
            <thead>
              <tr><th style="width: 130px;">门禁</th><th style="width: 230px;">不通过</th><th>未处理 / 超时</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>必过（must）</strong></td>
                <td><strong>实时终止全部流程</strong>（不等其他并行节点出结论）：在途节点全部转「因终止关闭」、未开始的不生成待办；<strong>单据作废、需重新发起</strong>。不允许跳过</td>
                <td rowspan="2">未处理只是等待 —— <strong>只催办</strong>；超时只<strong>升级提醒人事</strong>，由人决定催、换人还是终止。<strong>系统不自动终止</strong>：负责人休假一周不应把员工的离职流程判死</td>
              </tr>
              <tr>
                <td><strong>可选（optional）</strong></td>
                <td>只记录、<strong>仍解锁下游</strong>；未处理时可由<strong>人事</strong>标记「跳过」并填原因（负责人无跳过权，放过权留在管理部门）</td>
              </tr>
            </tbody>
          </table>
          <p class="doc-p">
            两条配套口径：<strong>节点「完成」的前提</strong> = 节点内所有必做事项已确认 + 必传附件齐全（系统检查节点由系统自动判定）；
            <strong>交接完成的判定</strong> = 清单里<strong>所有节点都到终态</strong>（不是「所有前置都办了」——
            「可选」节点不通过仍解锁下游，但下游办结、它自己没到终态，交接就不算完成），全部到终态才自动推送离职合同。
          </p>
          <div class="note" style="background: hsl(0 65% 50% / 0.06); border-left: 3px solid hsl(0 65% 50%); margin-bottom: 14px;">
            <strong>终止不等于审核驳回：</strong>员工仍在职，排班不取消、接单不截断、日期不锁。终止页列出<strong>已完成清单</strong>（谁、何时、附了什么），
            重新发起时允许人事<strong>勾选沿用这些证据</strong> —— 必过节点压在靠后的汇合点才判不通过时，前面的人不该把同样的照片再传一遍。
          </div>

          <h3 id="rf-hd-offboard">6.1.6 被动离职（解除用工）</h3>
          <p class="doc-p">
            异常监控触发的解除用工<strong>走同一套模板生成清单</strong>（门店 / 财务仍要归还物品、回收账号），但<strong>不阻塞解除</strong>：
            交接未完成时人事可勾选「强制解除」并填写原因，解除后清单转<strong>事后补录</strong>、不再卡住用工关系，已确认的说明与附件只读留档。
          </p>

          <h3 id="rf-hd-walk">6.1.7 原型走查路径</h3>
          <ul class="doc-ul">
            <li>配置层 · 交接流程编排（主入口）：<code>/resign-flow-template</code> 列表 → 行操作「<strong>编排</strong>」进入<strong>交接流程编排页</strong>（时间线模式）：第 1 步「适用范围与审核人」（适用条件 + 审核链，多人或签 / 会签）→ 第 2 步「交接流程编排」（时间线自动按前置排布，位置即先后；点卡片改「开始时机」，+人工节点 / +系统检查在此）。「列表视图」保留为辅助查看，画布入口已隐藏</li>
            <li>系统检查抽屉（检查项 / 门禁 / 前置 / 取数频率 / 批次上限）：编排页 → 点「资产归还检查」节点卡片打开抽屉（等「客户与物品交接」办结后每天取一次数的必过检查）</li>
            <li>系统检查项定义总览：<code>/resign-system-checks</code>（通过 / 软性 / 未通过三段定义 + 被引用模板，只读）</li>
            <li>系统检查执行明细页（Agent 执行日志）：系统检查项列表 → 点任一行「最近执行」进入（批次浏览 + 当批条件快照与逐单结果 + 按员工姓名 / 工号跨批次查询）</li>
            <li>交接处理列表（负责人待办）：<code>/mobile-resign-handover/list</code>（只列本人负责、当前可办的节点，点卡片直达节点确认页）</li>
            <li>交接进行中（无前置节点已可办、资产检查在跑、收口节点未开始）：交接处理 → 状态「进行中」的任一单据</li>
            <li>取数闭环样例（工单 2 件未通过 → 下一批归 0 通过）：交接处理 → 选一笔客诉检查在跑的单据（系统检查明细倒序可见每次时间 / 批次号 / 指标 / 结果）</li>
            <li>前置卡住（资产检查取数至批次上限 → 必过终止前提示人工介入）：交接处理 → 选一笔资产检查接近批次上限的单据</li>
            <li>审核确认 → 交接完成自动推送合同：离职需求审核页确认任一笔待审核单据（确认后状态条「已自动发出待员工签署」）</li>
            <li>必过不通过 → 终止作废：离职处理列表筛选「已作废」</li>
            <li>被动离职强制解除：离职处理 → 异常监控 Tab → 卡片上的「解除用工」</li>
          </ul>
        </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'
import DocScreens from '../../../docs/components/DocScreens.vue'
import DocFigure from '../../../docs/components/DocFigure.vue'
import tplTimelineShot from '../../../docs/assets/pages/resign-flow-template-timeline.png'
import tplListShot from '../../../docs/assets/pages/resign-flow-template-list.png'
import tplChecksShot from '../../../docs/assets/pages/resign-system-checks.png'
import tplRunsShot from '../../../docs/assets/pages/resign-system-check-runs.png'
import tplSysNodeShot from '../../../docs/assets/pages/resign-flow-template-sysnode.png'
import verdictImg from '../../../docs/assets/diagrams/system-check-verdict.svg'
import cadenceImg from '../../../docs/assets/diagrams/system-check-cadence.svg'

const tocItems = [
  { id: 'rf-handover', label: '6.1 离职交接（概述）' },
  { id: 'rf-hd-tpl', label: '6.1.1 配置层：模板' },
  { id: 'rf-hd-check', label: '6.1.2 系统检查节点' },
  { id: 'rf-hd-agent', label: '6.1.3 检查 Agent 运行机制' },
  { id: 'rf-hd-inst', label: '6.1.4 实例层：交接清单' },
  { id: 'rf-hd-gate', label: '6.1.5 门禁与终止' },
  { id: 'rf-hd-offboard', label: '6.1.6 被动离职' },
  { id: 'rf-hd-walk', label: '6.1.7 原型走查路径' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '离职流程', to: '/docs/resign-flow' },
  { label: '六、功能详细说明', to: '/docs/resign-flow/features' },
  { label: '6.1 离职交接' }
]
</script>

<style scoped src="./doc-base.css"></style>
<style scoped src="./flow-parts.css"></style>
