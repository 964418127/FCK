<template>
      <div id="version" class="section version-log">
        <h3>核心调整</h3>

        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 80px;">版本</th>
              <th style="width: 110px;">日期</th>
              <th style="width: 90px;">类别</th>
              <th>变更说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowspan="8"><strong>v2.1</strong></td>
              <td rowspan="8">2026-06-05</td>
              <td><span style="color: hsl(var(--primary)); font-weight: 600;">新增</span></td>
              <td><strong>返聘用工类型</strong>：第 4 种用工类型——<strong>劳务合作-退休返聘</strong>；无社保 / 无公积金 / 无常乐豆；商业险必选；单一劳务合作主体，不能挂店；月度结算，1 个工资条/月</td>
            </tr>
            <tr>
              <td><span style="color: hsl(var(--primary)); font-weight: 600;">新增</span></td>
              <td><strong>常乐豆使用规则</strong>：<strong>只抵扣公积金</strong>（公司部分 + 个人部分），不抵扣社保 / 商业险；4 级优先级——① 抵公积金公司部分 → ② 抵公积金个人部分 → ③ 现金补扣【公积金个人扣款】→ ④ 消费；常乐豆<strong>不计入应税收入</strong></td>
            </tr>
            <tr>
              <td><span style="color: hsl(var(--primary)); font-weight: 600;">新增</span></td>
              <td><strong>【公积金个人扣款】</strong>：动态补扣项——常乐豆不足以抵扣公积金个人部分时，从工资单现金扣减；全职 / 返聘工资单均可出现</td>
            </tr>
            <tr>
              <td><span style="color: hsl(var(--warning)); font-weight: 600;">升级</span></td>
              <td><strong>非全日制薪酬看板</strong>（移动端）：4 tabs（日统计 / 周统计 / 月统计 / 到账情况）；顶部收入 / 支出并列数字；4 个分类筛选（全部 / 基础提成 / 内部介绍 / <strong>回头客奖励</strong>）；订单列表<strong>回头客</strong>标记；订单详情显示<strong>回头客激励</strong>；支持门店切换；4 张周卡</td>
            </tr>
            <tr>
              <td><span style="color: hsl(var(--warning)); font-weight: 600;">升级</span></td>
              <td><strong>人员薪酬明细</strong>（web 端，模块薪酬菜单）：筛选（工号 / 姓名 / 岗位 / 城市 / 门店 / 起止日期 / 计算日期）+ 表格（人才ID / 城市 / 门店 / 工号 / 姓名 / 岗位 / 合作类型 / 工资单 / 收入小计 / 常乐豆结算单 / 常乐豆小计 / 合计 / 薪酬周期 / 计算时间 / 操作）；跨周期跨主体跨薪酬项的<strong>总览视图</strong></td>
            </tr>
            <tr>
              <td><span style="color: hsl(var(--warning)); font-weight: 600;">升级</span></td>
              <td><strong>移动端通知</strong>：通知列表显示<strong>门店</strong>；详情汇总显示<strong>发薪门店 / 发薪主体</strong>；列表 / 详情支持上下滚动</td>
            </tr>
            <tr>
              <td><span style="color: hsl(var(--warning)); font-weight: 600;">升级</span></td>
              <td><strong>全职薪酬看板</strong>（移动端）：3 tabs（日统计 / 月统计 / 到账情况）；月统计支出含【<strong>公积金个人扣款</strong>】；月统计含【<strong>公积金</strong>】块（公司对员工的补助金额，员工总缴额 = 个人扣款 + 公司补助）；隐藏门店选择器</td>
            </tr>
            <tr>
              <td><span style="color: hsl(var(--warning)); font-weight: 600;">升级</span></td>
              <td><strong>岗位薪酬模板</strong>：<strong>4 种合作模式</strong>——<strong>劳动合同-全日制</strong>、<strong>劳动合同-非全日制</strong>、<strong>劳务合作-返聘</strong>、<strong>劳务合作-兼职</strong></td>
            </tr>
            <tr>
              <td rowspan="9"><strong>v2.0</strong></td>
              <td rowspan="9">2026-06-01</td>
              <td><span style="color: hsl(var(--primary)); font-weight: 600;">新增</span></td>
              <td><strong>城市基准系数</strong>：HR 维护各城市的<strong>社保（全）/ 社保（仅工伤）/ 公积金</strong>法定比例；<strong>无固定基数</strong>，基数 = 每月实际应发收入（浮动）</td>
            </tr>
            <tr>
              <td><span style="color: hsl(var(--primary)); font-weight: 600;">新增</span></td>
              <td><strong>商业险</strong>：通用险种库（当前主用雇主险，可扩展意外险、医疗补充险等）；HR 维护险种名称 / 适用城市 / 保险公司 / 保额 / 保费 / 成本单元（月或年）/ 生效-到期+续保提醒；入职时<strong>必选 1+</strong>（非全日制可选）；公司全额，<strong>不参与工资计算</strong></td>
            </tr>
            <tr>
              <td><span style="color: hsl(var(--primary)); font-weight: 600;">新增</span></td>
              <td><strong>员工福利保障</strong>：入职触发员工 ↔ 申报主体关系建立（<strong>无月度数据</strong>），比例继承城市基准系数；月度明细按需动态生成</td>
            </tr>
            <tr>
              <td><span style="color: hsl(var(--primary)); font-weight: 600;">新增</span></td>
              <td><strong>社保 / 公积金 / 个税</strong>：3 个独立月度流水页，按申报主体拆分；含正常 / 补缴 / 退缴 / 滞纳金子类型；非全日制 / 兼职<strong>无公积金</strong></td>
            </tr>
            <tr>
              <td><span style="color: hsl(var(--primary)); font-weight: 600;">新增</span></td>
              <td><strong>负工资</strong>：独立余额记录，应发 &gt; 0 时才能抵扣，离职时按规则处理</td>
            </tr>
            <tr>
              <td><span style="color: hsl(var(--warning)); font-weight: 600;">升级</span></td>
              <td><strong>薪酬项配置</strong>：<strong>第 1 级 / 第 2 级 / 系统项 / 公司成本</strong>四层结构；支持负工资抵扣、常乐豆等动态项；支持 Override 比例</td>
            </tr>
            <tr>
              <td><span style="color: hsl(var(--warning)); font-weight: 600;">升级</span></td>
              <td><strong>岗位薪酬模板</strong>：按<strong>用工类型</strong>分模板——全职（劳动合同，单一主体）、非全日制（劳务协议，多主体）、兼职 / 返聘（劳务合作）</td>
            </tr>
            <tr>
              <td><span style="color: hsl(var(--warning)); font-weight: 600;">升级</span></td>
              <td><strong>薪酬发放策略</strong>：<strong>发放周期 × 发放主体</strong>二维配置；全职 / 返聘按合同主体月度；非全日制 / 兼职按业绩归属主体周薪制（间隔 ≤ 15 天）</td>
            </tr>
            <tr>
              <td><span style="color: hsl(var(--warning)); font-weight: 600;">升级</span></td>
              <td><strong>人员薪酬明细</strong>：<strong>8 步全链路</strong>（配置 → 入职 → 关系建立 → 计算 → 福利明细 → 发放）；支持"金额流转泳道图"</td>
            </tr>
          </tbody>
        </table>

        <div class="callout" style="background: hsl(var(--warning) / 0.08); border-left: 3px solid hsl(var(--warning)); padding: 10px 12px; margin-top: 8px; font-size: 13px; border-radius: 4px;">
          <strong>⚠️ 全局说明：1 门店 = 1 主体</strong>——全职/返聘 1 个合同主体 = 入职门店（不能挂店）；非全日制/兼职 可在 N 个门店服务 → 归属 N 个主体（按门店分别结算、申报个税、发放工资）。
        </div>

        <h3>要点</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 200px;">主题</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>四种用工类型</strong></td>
              <td><strong>全职（劳动合同）</strong>、<strong>非全日制（劳务协议）</strong>、<strong>兼职（劳务合作）</strong>、<strong>返聘（劳务合作-退休返聘）</strong></td>
            </tr>
            <tr>
              <td><strong>常乐豆适用范围</strong></td>
              <td><strong>仅全职</strong>享有，<strong>不参与薪资计算</strong>（不计入应税收入），离职时余额全部提现</td>
            </tr>
            <tr>
              <td><strong>常乐豆使用优先级</strong></td>
              <td>① 抵<strong>公积金公司部分</strong> → ② 抵<strong>公积金个人部分</strong> → ③ 现金补扣【公积金个人扣款】 → ④ 消费（<strong>只抵扣公积金</strong>，不抵扣社保/商业险）</td>
            </tr>
            <tr>
              <td><strong>社保 / 商业险</strong></td>
              <td>非全日制<strong>社保（仅工伤）必买</strong>，无"雇主险代替"；商业险<strong>全员走商业险库</strong>，全职/兼职/返聘<strong>必选</strong>，非全日制<strong>可选</strong></td>
            </tr>
            <tr>
              <td><strong>商业险</strong></td>
              <td>公司全额、<strong>不参与工资计算</strong>；成本单元可月/年，支持续保和到期提醒</td>
            </tr>
            <tr>
              <td><strong>工资条分组</strong></td>
              <td>按<strong>发放主体</strong>分组——全职/返聘=合同主体（1个），非全日制/兼职=业绩归属主体（多）</td>
            </tr>
            <tr>
              <td><strong>移动端薪酬看板</strong></td>
              <td>2 个独立看板：<strong>全职薪酬看板</strong>（3 tabs：日/月/到账，含【公积金个人扣款】+【公积金】块）vs <strong>非全日制薪酬看板</strong>（4 tabs：日/周/月/到账，4 个分类筛选 + 回头客标记 + 多门店切换）</td>
            </tr>
            <tr>
              <td><strong>通知（含门店 / 主体）</strong></td>
              <td>移动端通知列表显示<strong>门店</strong>，详情汇总显示<strong>发薪门店 + 发薪主体</strong>，让员工清楚每条通知的资金来源</td>
            </tr>
            <tr>
              <td><strong>排班</strong></td>
              <td>时长由排班环节控制，薪酬系统只做说明</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 目录 -->
      <div class="toc">
        <h2>目录</h2>
        <ul>
          <li><a href="#version">版本日志</a></li>
          <li><a href="#terms">名词解释</a></li>
          <li><a href="#taxable-income-rule">应税收入计算规则</a></li>
          <li><a href="#summary">一、整体概述</a></li>
          <li><a href="#welfare">二、员工福利保障配置</a></li>
          <li><a href="#bean">三、常乐豆规则</a></li>
          <li><a href="#template">四、岗位薪酬模板</a></li>
          <li><a href="#dynamic-items">四·附录：动态薪酬项 / 扣缴项</a></li>
          <li><a href="#items">五、薪酬项范围</a></li>
          <li><a href="#calculation">六、计算节点与时机</a></li>
          <li><a href="#examples">七、计算示例</a></li>
          <li><a href="#payroll">八、工资条组装</a></li>
          <li><a href="#scenarios">九、典型业务场景决策树</a></li>
          <li><a href="#money-flow">十、金额流转泳道图</a></li>
        </ul>
      </div>

      <!-- 阅读提示 -->
      <div class="section" style="margin-top: 24px;">
        <div class="card" style="background: hsl(var(--primary) / 0.08); border: 1px solid hsl(var(--primary) / 0.3);">
          <h3 style="margin-bottom: 12px; color: hsl(var(--primary));">📖 阅读提示</h3>
          <div style="font-size: 13px; line-height: 1.8;">
            本文档中关于"几个工资条"、"每月N次"、"每主体1个"等具体数字<strong>均为示例</strong>，用于说明典型业务场景。<br/>
            实际系统中，<strong>计算周期、工资单/工资条数量、薪酬项组合等均支持灵活配置</strong>——业务方可按用工类型、岗位、城市、合规要求等维度自由组合，无需受本文档示例约束。
          </div>
        </div>
      </div>

      <!-- 名词解释 -->
      <div id="terms" class="section" style="margin-top: 24px;">
        <div class="card" style="background: hsl(var(--muted) / 0.3);">
          <h3 style="margin-bottom: 12px;">名词解释</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 180px;">术语</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>负工资</strong></td>
                <td>员工历史结算周期欠公司的款项，记录在独立余额中，只有应发 &gt; 0 时才能抵扣</td>
              </tr>
              <tr>
                <td><strong>应税收入</strong></td>
                <td><strong>第1级收入 + 第2级收入 - 第1级扣款 - 第2级扣款（非预扣）</strong>，即提交报税的收入基数（详见下方「应税收入计算规则」）。注意：<strong>第2级扣款（个税预扣）不参与应税收入</strong>（预扣是<strong>真正的个税</strong>，仅用于个税汇算；预扣所在工资条已发放，不可回溯修改）</td>
              </tr>
              <tr>
                <td><strong>预扣个税</strong></td>
                <td>非全日制/兼职每周工资条预扣3%，公式 = 应税收入 × 3%，累计作为已预扣合计。预扣是<strong>税的预付</strong>，不是收入的一部分</td>
              </tr>
              <tr>
                <td><strong>代扣个税汇算</strong></td>
                <td>月末百旺服务基于<strong>累计应税收入</strong>（Σ各工资条应税收入）计算<strong>实际税额</strong>，与<strong>已预扣合计</strong>比较，多退少补；结果作为<strong>当月最后一条工资条</strong>的一个扣缴/收入项（补缴/退税）出现，不单独生成"汇算工资条"</td>
              </tr>
              <tr>
                <td><strong>社保（全）</strong></td>
                <td>五险（养老 / 医疗 / 失业 / 工伤 / 生育），<strong>全职</strong>足额缴纳，按每月实际收入（浮动基数）</td>
              </tr>
              <tr>
                <td><strong>社保（仅工伤保险）</strong></td>
                <td><strong>非全日制</strong>必须购买；工伤保险是社保五险之一，<strong>非独立险种</strong>，非全日制员工仅交工伤这一项</td>
              </tr>
              <tr>
                <td><strong>商业险</strong></td>
                <td>员工福利保障分组下的<strong>通用险种库</strong>（当前主用为雇主险，未来可扩展到意外险、医疗补充险等）；HR 维护"险种名称 / 适用城市（<strong>城市专属或全国通用</strong>）/ 保险公司 / 保额 / 保费 / <strong>成本单元（月或年）</strong> / <strong>生效-到期日期 + 续保提醒</strong>"；<strong>入职时办理入职人员必选 1 个或多个</strong>（非全日制可选）；公司全额，<strong>不参与员工工资计算</strong></td>
              </tr>
              <tr>
                <td><strong>城市基准系数</strong></td>
                <td>配置各城市<strong>社保（全）/ 社保（仅工伤保险）/ 公积金</strong>的基数和比例，<strong>不再包含商业险</strong>（商业险在商业险模块独立维护）；用于生成员工福利保障明细</td>
              </tr>
              <tr>
                <td><strong>门店</strong></td>
                <td>员工实际产生业绩的物理经营单位，<strong>1 门店 = 1 主体</strong>（详见「全局说明」）</td>
              </tr>
              <tr>
                <td><strong>合同主体</strong></td>
                <td>员工签署劳动合同/劳务协议/劳务合作的主体公司，全职员工仅 1 个合同主体（不能挂店）</td>
              </tr>
              <tr>
                <td><strong>业绩归属主体</strong></td>
                <td>员工实际产生业绩的归属门店对应的法人主体。<strong>1 门店 = 1 主体</strong>（详见「全局说明」）。全职员工 1 个合同主体（= 业绩归属主体）；非全日制/兼职可在 N 个门店服务 → 归属 N 个主体，每个主体独立结算并生成工资条</td>
              </tr>
              <tr>
                <td><strong>百旺服务</strong></td>
                <td>第三方税务服务，能根据应税收入获得应纳个税</td>
              </tr>
              <tr>
                <td><strong>营销折扣获豆 / 回头客补贴</strong></td>
                <td>以常乐豆形式发放，<strong>仅全职推拿师 Lv3 以下员工</strong>享有；非全日制/兼职/返聘<strong>均无任何常乐豆</strong>（与 Lv 等级无关，仅与用工类型相关）</td>
              </tr>
              <tr>
                <td><strong>负数累加</strong></td>
                <td>工资条应发为负时，负数累加到负工资余额，不交个税、不抵扣负工资</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 应税收入计算规则（正式定义） -->
</template>
