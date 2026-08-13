<template>
  <DocShell
    :toc-items="tocItems"
    title="二、产品需求说明"
    subtitle='按用户视角描述模块功能 + 业务规则 + 边界场景 + 对外契约 + 不允许怎么改'
    version="v1.0"
    date="2026-08-13"
    :breadcrumbs="breadcrumbs"
  >
    <div id="overview" class="section">
      <h2>二、产品需求说明</h2>

      <div class="card" id="goal">
        <h3>1. 模块目标</h3>
        <p style="font-size: 13px; line-height: 1.8;">
          本模块作为<strong>HR 人事模块</strong>与<strong>薪酬计算模块</strong>之间的桥梁（中间产物即本模块维护的【人员薪酬规划】）：HR 人事模块按日把人员任职变动（换签主体 / 换合作方式 / 换岗位 / 离职）汇入本模块，本模块负责把"任职事实"翻译为"薪酬规划"，让薪酬计算能拿到正确的人员 × 模板 × 时间区间挂接关系。
        </p>
        <div class="callout" style="background: hsl(var(--primary) / 0.06); border-left: 3px solid hsl(var(--primary)); padding: 10px 12px; margin-top: 8px; font-size: 13px; border-radius: 4px;">
          <strong>📌 核心定位</strong>：本模块不重新发明 HR 人事模块，也不维护人员基础信息；只消费 HR 异动结论 + 协调薪酬专员补全新关系的薪酬模板，最终输出可被薪酬计算模块直接消费的【人员薪酬规划】数据。
        </div>
      </div>

      <div class="card" id="functions">
        <h3>2. 核心功能</h3>
        <p style="font-size: 13px; line-height: 1.8;">从用户视角，本模块提供以下能力：</p>

        <h4 style="margin-top: 14px; font-size: 14px;">对 HR 人事模块</h4>
        <ul style="font-size: 13px; line-height: 1.8; padding-left: 24px;">
          <li><strong>被动接收异动</strong>：每日汇入的异动事实落库即处理，HR 不需要做任何额外触发动作</li>
          <li><strong>事实回执可查</strong>：HR 报过来的每条异动，薪酬专员可以在页面里看到"是否已被本系统正确接收并反映到规划"（截尾状态列）</li>
        </ul>

        <h4 style="margin-top: 14px; font-size: 14px;">对薪酬专员</h4>
        <ul style="font-size: 13px; line-height: 1.8; padding-left: 24px;">
          <li><strong>查看异动结束（Tab 1）</strong>：集中浏览所有"旧关系结束"的异动事实，包括离职能处理的特殊类型；支持按姓名 / 异动类型筛选，可点详情查看完整字段</li>
          <li><strong>确认新关系（Tab 2）</strong>：对需要挂接薪酬模板的新关系，逐条或批量挑模板后确认写入规划；起止时间由 HR 决定，薪酬专员不能改</li>
          <li><strong>批量操作</strong>：多条同岗位异动可一次挑模板、一次确认；不同岗位的异动拒绝混批</li>
          <li><strong>同步异常兜底</strong>：HR 异动落库但本系统规划里找不到对应 active 记录时，控制台输出排查线索（业务用户无需关心）</li>
        </ul>

        <h4 style="margin-top: 14px; font-size: 14px;">对薪酬计算模块</h4>
        <ul style="font-size: 13px; line-height: 1.8; padding-left: 24px;">
          <li><strong>提供人员任职段数据</strong>：【人员薪酬规划】里每个人有完整的"在什么时间范围 / 什么主体 / 什么门店 / 什么合作方式 / 什么岗位 / 按什么薪酬模板计酬"的任职段记录</li>
          <li><strong>任职段自然分段</strong>：一个人因异动产生的多条历史任职段按时间顺序排列；薪酬计算按当前日期匹配生效中的那段</li>
        </ul>
      </div>

      <div class="card" id="modules">
        <h3>3. 页面模块拆分</h3>
        <p style="font-size: 13px; line-height: 1.8;">本模块对应一个独立页面 <code>/personnel-change-processing</code>，由两个 Tab 组成，分别承担"异动结束查看"和"新关系确认"两类用户动作：</p>

        <h4 style="margin-top: 16px; font-size: 14px;">3.1 模块：异动结束（查看）—— Tab 1</h4>

        <h5 style="margin-top: 10px; font-size: 13px; color: hsl(var(--primary));">查询支持</h5>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 160px;">筛选维度</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>关键字搜索</strong></td>
              <td>按<strong>姓名</strong>或<strong>人才 ID</strong>模糊匹配</td>
            </tr>
            <tr>
              <td><strong>异动类型</strong></td>
              <td>下拉筛选项：换签主体 / 换合作方式 / 换岗位 / 离职（含全部四种类型）</td>
            </tr>
            <tr>
              <td><strong>同步日期</strong></td>
              <td>列表默认按<strong>同步日期倒序</strong>展示；如需按日期区间筛选，后续版本扩展</td>
            </tr>
          </tbody>
        </table>

        <h5 style="margin-top: 12px; font-size: 13px; color: hsl(var(--primary));">列表展示字段</h5>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 160px;">字段列</th>
              <th>展示内容</th>
              <th style="width: 200px;">视觉处理</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>同步日期</td>
              <td>HR 人事模块报告的异动同步日期</td>
              <td>YYYY-MM-DD</td>
            </tr>
            <tr>
              <td>异动 ID</td>
              <td>HR 人事模块分配的异动唯一 ID</td>
              <td>等宽字体</td>
            </tr>
            <tr>
              <td>姓名 / 人才 ID</td>
              <td>本系统只读引用 HR 数据</td>
              <td>普通文本</td>
            </tr>
            <tr>
              <td>异动类型</td>
              <td>换签主体 / 换合作方式 / 换岗位 / 离职</td>
              <td>Badge 颜色：换签主体蓝、换合作方式橙、换岗位绿、离职红</td>
            </tr>
            <tr>
              <td>结束什么关系</td>
              <td>旧任职四要素：主体 / 合作方式 / 岗位门店 / 失效时间</td>
              <td>紧凑分组展示，关键字段（如失效时间）高亮</td>
            </tr>
            <tr>
              <td>同步状态</td>
              <td>自动步是否已截尾本系统对应的 active 任职段</td>
              <td><strong>永远显示「✓ 已写入」绿色 tag</strong>（业务上必然命中，未匹配由开发者排查，不暴露给业务用户）</td>
            </tr>
            <tr>
              <td>对应新关系</td>
              <td>本条异动对应的"新关系确认"状态</td>
              <td>Badge：<strong style="color: hsl(var(--success));">已确认</strong>绿 / <strong style="color: hsl(var(--success));">无需确认</strong>绿（离职）/ <strong style="color: hsl(var(--warning));">待确认</strong>橙</td>
            </tr>
            <tr>
              <td>操作</td>
              <td>「详情」链接</td>
              <td>点击打开详情弹窗</td>
            </tr>
          </tbody>
        </table>

        <h5 style="margin-top: 12px; font-size: 13px; color: hsl(var(--primary));">后续操作</h5>
        <ul style="font-size: 13px; line-height: 1.8; padding-left: 24px;">
          <li><strong>查看详情</strong>：点击「详情」打开弹窗，展示该异动的完整信息——同步日期 / 异动 ID / 人员 / 旧任职四要素 / 旧结束时间 / 新任职四要素 / 新起止时间 / 自动步截尾状态说明 / 确认时间（如已确认）/ 已写入的模板（如已确认）</li>
          <li><strong>无编辑操作</strong>：Tab 1 是只读视图，不允许薪酬专员修改任何字段</li>
          <li><strong>Tab 切换</strong>：点击顶部 Tab 切到「Tab 2 新关系确认」继续操作待确认项</li>
        </ul>

        <h4 style="margin-top: 24px; font-size: 14px;">3.2 模块：新关系确认 —— Tab 2</h4>

        <h5 style="margin-top: 10px; font-size: 13px; color: hsl(var(--warning));">查询支持</h5>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 160px;">筛选维度</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>关键字搜索</strong></td>
              <td>按<strong>姓名</strong>或<strong>人才 ID</strong>模糊匹配</td>
            </tr>
            <tr>
              <td><strong>新岗位</strong></td>
              <td>下拉筛选项：客户经理 / 推拿师 / 调理师 / 理疗师 等；用于隔离不同岗位的待办</td>
            </tr>
            <tr>
              <td><strong>异动类型</strong></td>
              <td>下拉筛选项：换签主体 / 换合作方式 / 换岗位（<strong>离职自动从列表中过滤掉</strong>，因为没有新关系可确认）</td>
            </tr>
          </tbody>
        </table>

        <h5 style="margin-top: 12px; font-size: 13px; color: hsl(var(--warning));">列表展示字段</h5>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 160px;">字段列</th>
              <th>展示内容</th>
              <th style="width: 200px;">视觉处理</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>多选框</td>
              <td>用于多选以触发批量确认</td>
              <td>列表左侧复选框</td>
            </tr>
            <tr>
              <td>异动 ID</td>
              <td>HR 人事模块分配的异动唯一 ID</td>
              <td>等宽字体</td>
            </tr>
            <tr>
              <td>姓名</td>
              <td>本系统只读引用 HR 数据</td>
              <td>普通文本</td>
            </tr>
            <tr>
              <td>异动类型</td>
              <td>换签主体 / 换合作方式 / 换岗位</td>
              <td>Badge 颜色同 Tab 1</td>
            </tr>
            <tr>
              <td>新岗位</td>
              <td>HR 给定的新岗位</td>
              <td>Badge：与旧岗位不同时为橙色 warning（提示跨岗位变化），相同时为蓝色 info</td>
            </tr>
            <tr>
              <td>新任职</td>
              <td>新任职四要素：主体 / 合作方式 / 门店</td>
              <td>紧凑分组展示</td>
            </tr>
            <tr>
              <td>起止时间</td>
              <td>HR 给定的新关系起始 / 结束时间</td>
              <td>只读展示，<strong>不可编辑</strong>；结束时间为「在任」标记时显示「至今」</td>
            </tr>
            <tr>
              <td>岗位薪酬模板 <span style="color: hsl(var(--danger));">*</span></td>
              <td>行内下拉选择器，薪酬专员<strong>必填</strong>——按当前行的<strong>新岗位</strong>过滤可选模板池</td>
              <td>占位文案「挑一个模板」；未选时确认按钮 disabled</td>
            </tr>
            <tr>
              <td>操作</td>
              <td>「确认」按钮</td>
              <td>行级确认（单条）；顶部另有「批量确认」按钮</td>
            </tr>
          </tbody>
        </table>

        <h5 style="margin-top: 12px; font-size: 13px; color: hsl(var(--warning));">后续操作</h5>
        <ul style="font-size: 13px; line-height: 1.8; padding-left: 24px;">
          <li><strong>单条确认</strong>：行内 template 选择器挑好模板 → 点击行尾「确认」按钮 → 异动 <code>status</code> 变为「已确认」，从 Tab 2 列表移除；新任职段写入【人员薪酬规划】</li>
          <li><strong>批量确认</strong>：勾选多行（必须<strong>同岗位</strong>）→ 顶部「批量确认」按钮 → 弹窗确认 → 逐条触发单条确认逻辑
            <ul style="margin-top: 6px;">
              <li>选中行跨岗位时弹窗提示"批量确认要求所有选中行岗位一致"，拒掉执行</li>
              <li>任一行未选模板时弹窗提示"存在未选模板的行"，拒掉执行</li>
            </ul>
          </li>
          <li><strong>行内挑模板过滤</strong>：行内下拉只展示当前行<strong>新岗位</strong>对应的模板池，避免错挂</li>
          <li><strong>起止时间只读</strong>：HR 已给定的起止时间在 Tab 2 全程不可编辑，由薪酬专员承担"模板挂得对不对"的判断</li>
          <li><strong>提交后状态变化</strong>：确认成功的异动从 Tab 2 消失，但仍在 Tab 1「已确认」列表中可追溯</li>
        </ul>
      </div>

      <div class="card" id="rules">
        <h3>4. 业务规则</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 220px;">规则</th>
              <th>说明</th>
              <th style="width: 200px;">违反后果</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>旧关系结束：系统自动</strong></td>
              <td>HR 报告旧关系在 X 日结束 → 本系统自动把对应 active 任职段的失效时间改为 X 日；薪酬专员不能"纠正"这个时间</td>
              <td>破坏与 HR 人事模块的事实一致性，跨模块对账失败</td>
            </tr>
            <tr>
              <td><strong>新关系起止：只读采用 HR 给定</strong></td>
              <td>新关系的起始 / 结束时间由 HR 决定并随异动汇入；薪酬专员在手动步中只能挑模板，不能调整起止</td>
              <td>与 HR 合同信息脱钩，可能出现合同期内未计酬或合同外计酬</td>
            </tr>
            <tr>
              <td><strong>新关系模板：薪酬专员挑</strong></td>
              <td>每条新关系必须挂接一个岗位薪酬模板；模板必须与新关系岗位匹配（不同岗位对应不同模板池）</td>
              <td>未挂模板或错挂模板会导致该任职段薪酬计算失效</td>
            </tr>
            <tr>
              <td><strong>离职：仅结束，无新关系</strong></td>
              <td>离职异动只有"旧关系结束"一步，没有"新关系确认"；不在「Tab 2 新关系确认」出现</td>
              <td>薪酬专员误以为有"新关系"要确认，做无用功</td>
            </tr>
            <tr>
              <td><strong>批量确认：同岗位</strong></td>
              <td>批量确认要求所有选中行的新岗位一致；不一致时弹窗提示拒掉</td>
              <td>混批跨岗位模板体系产生无效配置</td>
            </tr>
            <tr>
              <td><strong>自动步必然命中</strong></td>
              <td>HR 报过来的每条异动必能在【人员薪酬规划】里找到对应 active 任职段；未匹配属数据不一致边界态，由开发者排查，业务用户无须处理</td>
              <td>异动无法在本系统落地，薪酬错乱</td>
            </tr>
            <tr>
              <td><strong>HR 异动时间差不强求配对</strong></td>
              <td>"先结束、后开始"两条异动可能不同步到达；本系统分别处理，各自独立推进状态机</td>
              <td>误以为必须等配对才能处理会卡住整个流程</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card" id="boundary">
        <h3>5. 边界场景</h3>

        <h4 style="margin-top: 12px; font-size: 14px;">场景 A：HR 异动时间差（先结束、后开始不同步）</h4>
        <p style="font-size: 13px; line-height: 1.7;">换合作方式时，HR 人事模块可能先批完结束流程，过几小时才批完开始流程。两条异动分别到达本系统时，各自独立推进：</p>
        <ul style="font-size: 13px; line-height: 1.8; padding-left: 24px;">
          <li>结束异动先到 → 自动步截尾旧任职段；进入 Tab 2「待确认」</li>
          <li>开始异动后到 → 自动步截尾上一条（因已先被截尾，no-op）；进入 Tab 2「待确认」</li>
          <li>薪酬专员分别对两条做手动确认</li>
        </ul>

        <h4 style="margin-top: 16px; font-size: 14px;">场景 B：换签主体（主体变更，门店可能变）</h4>
        <p style="font-size: 13px; line-height: 1.7;">如某人从「主体 A 上海徐汇店」换到「主体 B 深圳南山店」。自动步按 HR 报告的"原主体门店"匹配本系统的旧任职段，新关系则按 HR 报告的"新主体门店"继承。</p>
        <div class="callout" style="background: hsl(var(--warning) / 0.08); border-left: 3px solid hsl(var(--warning)); padding: 10px 12px; margin-top: 8px; font-size: 13px; border-radius: 4px;">
          <strong>⚠️ 已知风险</strong>：HR 人事模块记录的"原主体门店"与本系统规划里旧任职段的门店不一致时，自动步会找不到匹配项。生产环境必须<strong>提前</strong>保证 HR / 规划两边"门店"字段同步，否则需要走数据修复流程。
        </div>

        <h4 style="margin-top: 16px; font-size: 14px;">场景 C：换岗位（岗位变更）</h4>
        <p style="font-size: 13px; line-height: 1.7;">如曹娜娜从「客户经理」换到「推拿师」。主体 / 合作方式不变，岗位必变。新任职段的岗位直接取 HR 给定的新岗位，其余字段（门店 / 城市 / 岗位分类）从旧任职段继承。</p>

        <h4 style="margin-top: 16px; font-size: 14px;">场景 D：离职</h4>
        <p style="font-size: 13px; line-height: 1.7;">离职异动不携带任何"新任职"信息。本系统处理：</p>
        <ul style="font-size: 13px; line-height: 1.8; padding-left: 24px;">
          <li>自动步截尾对应 active 任职段（业务上必然命中，因为离职人员必然有当前在挂的任职）</li>
          <li>不进入 Tab 2（无新关系可确认）</li>
          <li>UI 标记：异动类型红色「离职」+ 对应新关系绿色「无需确认」+ 同步状态绿色「✓ 已写入」</li>
        </ul>
      </div>

      <div class="card" id="contract">
        <h3>6. 对外契约</h3>

        <h4 style="margin-top: 12px; font-size: 14px;">输入：HR 人事模块每日汇入的异动</h4>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 200px;">信息类别</th>
              <th>HR 应提供什么</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>人员身份</strong></td>
              <td>人员 ID、姓名（用于在本系统内查找 / 展示）</td>
            </tr>
            <tr>
              <td><strong>异动类型</strong></td>
              <td>换签主体 / 换合作方式 / 换岗位 / 离职</td>
            </tr>
            <tr>
              <td><strong>旧任职四要素</strong></td>
              <td>旧主体 / 旧合作方式 / 旧岗位 / 旧门店（用于在本系统规划里找到对应 active 任职段）</td>
            </tr>
            <tr>
              <td><strong>旧关系结束时间</strong></td>
              <td>精确到日（用于截尾本系统规划里旧任职段的失效时间）</td>
            </tr>
            <tr>
              <td><strong>新任职四要素</strong></td>
              <td>新主体 / 新合作方式 / 新岗位 / 新门店（离职时为空）</td>
            </tr>
            <tr>
              <td><strong>新关系起止时间</strong></td>
              <td>精确到日（用于写入本系统规划里新任职段的有效期；离职时为空）</td>
            </tr>
          </tbody>
        </table>

        <h4 style="margin-top: 16px; font-size: 14px;">输出：【人员薪酬规划】</h4>
        <p style="font-size: 13px; line-height: 1.7;">本模块产出【人员薪酬规划】数据，作为薪酬计算模块的输入。每条任职段包含：</p>
        <ul style="font-size: 13px; line-height: 1.8; padding-left: 24px;">
          <li><strong>人员</strong>：姓名、人才 ID</li>
          <li><strong>任职四要素</strong>：主体、合作方式、岗位、门店</li>
          <li><strong>岗位薪酬模板</strong>：薪酬专员在 Tab 2 挑选的模板名</li>
          <li><strong>有效期</strong>：起始时间 ~ 结束时间；结束时间为「在任」标记时表示当前生效中</li>
          <li><strong>数据来源</strong>：可溯源到产生本任职段的 HR 异动 ID</li>
        </ul>

        <h4 style="margin-top: 16px; font-size: 14px;">本模块<strong>不</strong>负责什么</h4>
        <ul style="font-size: 13px; line-height: 1.8; padding-left: 24px;">
          <li><strong>不维护人员基础信息</strong>：姓名、ID、入职时间等都在 HR 人事模块，本模块只读消费</li>
          <li><strong>不反向写回 HR 人事模块</strong>：本模块的所有操作只影响本模块维护的【人员薪酬规划】，不会通知 HR 人事模块或修改其数据</li>
          <li><strong>不计算薪酬</strong>：本模块只产出"挂接关系 + 有效期"，实际薪酬金额计算由薪酬计算模块按模板规则完成</li>
          <li><strong>不维护薪酬模板</strong>：模板定义由【岗位模板列表】模块管理，本模块只引用模板名</li>
          <li><strong>不处理社保 / 公积金 / 商业险</strong>：福利保障数据按 V2 阶段1规范从老系统接口只读引用，本模块不涉及</li>
        </ul>
      </div>

      <div class="card" id="donts">
        <h3>7. 不允许怎么改</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 60px;">#</th>
              <th>禁止项</th>
              <th>原因</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>允许薪酬专员修改旧关系结束时间</td>
              <td>破坏与 HR 人事模块的事实一致性</td>
            </tr>
            <tr>
              <td>2</td>
              <td>允许薪酬专员修改新关系起止时间</td>
              <td>与 HR 合同信息脱钩</td>
            </tr>
            <tr>
              <td>3</td>
              <td>手动确认时再次触发"自动步"</td>
              <td>自动步已在异动落库时完成；重复执行会破坏已正确的记录</td>
            </tr>
            <tr>
              <td>4</td>
              <td>把离职异动塞进 Tab 2 让薪酬专员确认</td>
              <td>离职没有新关系，薪酬专员无可操作内容</td>
            </tr>
            <tr>
              <td>5</td>
              <td>把"自动步"改为需要薪酬专员手动触发</td>
              <td>自动步表达的是"如实反映 HR 异动事实"，是同步动作而非业务决策</td>
            </tr>
            <tr>
              <td>6</td>
              <td>把"HR 异动时间差"的两两条异动强求配对处理</td>
              <td>HR 人事模块不保证配对到达；本模块必须能独立处理单条</td>
            </tr>
            <tr>
              <td>7</td>
              <td>让自动步对"未匹配"静默 no-op 而不告警</td>
              <td>数据不一致会无声扩散，到下游薪酬计算模块才暴露（已经晚了）</td>
            </tr>
            <tr>
              <td>8</td>
              <td>把"自动步未匹配"状态暴露给业务用户</td>
              <td>业务用户面对无法处理的"未匹配"状态会无所适从；排查责任在开发者不在薪酬专员</td>
            </tr>
            <tr>
              <td>9</td>
              <td>允许批量确认跨岗位的异动</td>
              <td>不同岗位对应不同模板体系，混批产生无效配置</td>
            </tr>
            <tr>
              <td>10</td>
              <td>把"未挂模板"或"挂错模板"作为合法状态保留</td>
              <td>这种状态会导致该任职段薪酬计算失效，必须在 Tab 2 强制补齐</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'

const tocItems = [
  { id: 'goal', label: '1. 模块目标' },
  { id: 'functions', label: '2. 核心功能' },
  { id: 'modules', label: '3. 页面模块拆分' },
  { id: 'rules', label: '4. 业务规则' },
  { id: 'boundary', label: '5. 边界场景' },
  { id: 'contract', label: '6. 对外契约' },
  { id: 'donts', label: '7. 不允许怎么改' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事福利', to: '/docs/personnel-change-flow' },
  { label: '人员异动流程', to: '/docs/personnel-change-flow' },
  { label: '二、产品需求说明' }
]
</script>
