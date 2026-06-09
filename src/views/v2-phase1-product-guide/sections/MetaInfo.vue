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
              <td rowspan="6"><strong>v2.1<br/>phase1</strong></td>
              <td rowspan="6">2026-06-06</td>
              <td><span style="color: hsl(var(--primary)); font-weight: 600;">新增</span></td>
              <td><strong>模块化薪酬（4 种用工类型）</strong>：劳动合同-全日制 / 劳务协议-非全日制 / 劳务合作-兼职 / 劳务合作-退休返聘；按用工类型独立岗位薪酬模板</td>
            </tr>
            <tr>
              <td><span style="color: hsl(var(--primary)); font-weight: 600;">新增</span></td>
              <td><strong>常乐豆规则（简化）</strong>：仅全职享有；<strong>只抵扣公积金公司部分</strong>，<strong>不抵扣公积金个人部分/社保/商业险</strong>；使用顺序——① 抵公积金公司部分 → ② 剩余可消费/离职提现；<strong>不计入应税收入</strong></td>
            </tr>
            <tr>
              <td><span style="color: hsl(var(--warning)); font-weight: 600;">裁剪</span></td>
              <td><strong>【公积金个人扣款】动态项取消</strong>：v2-1 阶段员工<strong>个人部分足额自付</strong>，工资条保留「代扣公积金」扣减项，<strong>不依赖常乐豆抵扣</strong></td>
            </tr>
            <tr>
              <td><span style="color: hsl(var(--primary)); font-weight: 600;">新增</span></td>
              <td><strong>负工资模块</strong>：独立余额；工资条应发 &gt; 0 时抵扣；离职时按规则处理；负数累加到余额</td>
            </tr>
            <tr>
              <td><span style="color: hsl(var(--primary)); font-weight: 600;">新增</span></td>
              <td><strong>多轮报税逻辑</strong>：1 门店 = 1 主体；非全日制/兼职 每周预扣 3% + 月末汇算；兼职<strong>多主体倒序申报</strong>（应税大者先报，每主体 1 次调百旺，可能跳档）；补缴/退税归入该主体最后一条工资条</td>
            </tr>
            <tr>
              <td><span style="color: hsl(var(--warning)); font-weight: 600;">裁剪</span></td>
              <td><strong>福利保障数据 → 取老系统</strong>：社保（全）/ 社保（仅工伤）/ 公积金的<strong>个人部分金额</strong>通过老系统接口<strong>只读引用</strong>；新系统<strong>不维护</strong>城市基准系数、不生成月度流水、不做 Override 机制</td>
            </tr>
            <tr>
              <td><span style="color: hsl(var(--warning)); font-weight: 600;">裁剪</span></td>
              <td><strong>商业险 → 默认机制</strong>：<strong>不开发</strong>商业险库配置页、不做城市/险种选择；全员默认有 1 份商业险（具体险种后台硬编码），公司全额，<strong>不进员工工资条</strong>，<strong>不显示在福利明细</strong></td>
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
              <td>① 抵<strong>公积金公司部分</strong> → ② 剩余可消费 / 离职提现（<strong>只抵扣公积金公司部分</strong>，不抵扣公积金个人部分/社保/商业险）</td>
            </tr>
            <tr>
              <td><strong>福利保障数据来源</strong></td>
              <td>社保/公积金个人部分 ← <strong>老系统接口（只读）</strong>；商业险 ← <strong>默认机制</strong>（后台硬编码，不进工资条）；不开发员工福利保障页</td>
            </tr>
            <tr>
              <td><strong>商业险（默认机制）</strong></td>
              <td>公司全额、<strong>不参与工资计算</strong>、<strong>不进员工工资条</strong>、<strong>不显示在福利明细</strong>；具体险种/保额/保费由后端配置</td>
            </tr>
            <tr>
              <td><strong>工资条分组</strong></td>
              <td>按<strong>发放主体</strong>分组——全职/返聘=合同主体（1个），非全日制/兼职=业绩归属主体（多）</td>
            </tr>
            <tr>
              <td><strong>多轮报税</strong></td>
              <td>非全日制/兼职：每周预扣 3% + 月末汇算（百旺）；兼职多主体倒序申报；补缴/退税归入该主体最后一条工资条，<strong>不单独生成汇算工资条</strong></td>
            </tr>
            <tr>
              <td><strong>负工资</strong></td>
              <td>工资条<strong>应发 &gt; 0</strong> 时触发抵扣；应发 ≤ 0 时负数累加到余额；<strong>不参与应税收入</strong>；离职时按规则处理</td>
            </tr>
            <tr>
              <td><strong>移动端薪酬看板</strong></td>
              <td>2 个独立看板：<strong>全职薪酬看板</strong>（3 tabs：日/月/到账，月支出含<strong>公积金个人扣款（员工足额自付部分）</strong>）vs <strong>非全日制薪酬看板</strong>（4 tabs：日/周/月/到账，4 个分类筛选 + 回头客标记 + 多门店切换）</td>
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

      <!-- 阅读提示 -->
      <div class="section" style="margin-top: 24px;">
        <div class="card" style="background: hsl(var(--primary) / 0.08); border: 1px solid hsl(var(--primary) / 0.3);">
          <h3 style="margin-bottom: 12px; color: hsl(var(--primary));">📖 阅读提示</h3>
          <div style="font-size: 13px; line-height: 1.8;">
            本文档基于 <strong>v2 完整版</strong> 裁剪而来，仅包含阶段 1 实际要开发的内容。<br/>
            · 本文档中关于"几个工资条"、"每月N次"、"每主体1个"等具体数字<strong>均为示例</strong>，用于说明典型业务场景<br/>
            · 实际系统中，<strong>计算周期、工资单/工资条数量、薪酬项组合等均支持灵活配置</strong>——业务方可按用工类型、岗位、城市、合规要求等维度自由组合<br/>
            · 涉及<strong>老系统接口</strong>部分（社保/公积金/个税），具体接口契约待与老系统团队对齐；本文档仅明确<strong>调用边界与数据用途</strong>
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
                <td><strong>第1级收入 + 第2级收入 - 第1级扣款 - 第2级扣款（非预扣）</strong>，即提交报税的收入基数（详见「应税收入计算规则」）。注意：<strong>第2级扣款（个税预扣）不参与应税收入</strong>（预扣是<strong>真正的个税</strong>，仅用于个税汇算；预扣所在工资条已发放，不可回溯修改）</td>
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
                <td><strong>社保（个人部分）</strong></td>
                <td>员工个人承担部分（养老/医疗/失业/工伤/生育）；<strong>v2-1 阶段</strong>金额由<strong>老系统接口</strong>提供，新系统<strong>只读引用</strong>作为工资条代扣项</td>
              </tr>
              <tr>
                <td><strong>公积金（个人部分）</strong></td>
                <td>员工个人承担部分；<strong>v2-1 阶段</strong>金额由<strong>老系统接口</strong>提供，新系统<strong>只读引用</strong>作为工资条代扣项；<strong>员工足额自付</strong>，<strong>不依赖常乐豆</strong></td>
              </tr>
              <tr>
                <td><strong>商业险（默认机制）</strong></td>
                <td>v2-1 不开发商业险库配置页、不做城市/险种选择；全员默认有 1 份商业险（具体险种/保额/保费由后端硬编码）；公司全额，<strong>不进员工工资条</strong>，<strong>不显示在福利明细</strong></td>
              </tr>
              <tr>
                <td><strong>门店</strong></td>
                <td>员工实际产生业绩的物理经营单位，<strong>1 门店 = 1 主体</strong>（详见「全局说明」）</td>
              </tr>
              <tr>
                <td><strong>合同主体</strong></td>
                <td>员工签署劳动合同/劳务协议/劳务合作的主体公司，全职/返聘员工仅 1 个合同主体（不能挂店）</td>
              </tr>
              <tr>
                <td><strong>业绩归属主体</strong></td>
                <td>员工实际产生业绩的归属门店对应的法人主体。<strong>1 门店 = 1 主体</strong>（详见「全局说明」）。全职/返聘员工 1 个合同主体（= 业绩归属主体）；非全日制/兼职可在 N 个门店服务 → 归属 N 个主体，每个主体独立结算并生成工资条</td>
              </tr>
              <tr>
                <td><strong>百旺服务</strong></td>
                <td>第三方税务服务，能根据应税收入获得应纳个税。v2-1 阶段全职/返聘 1 次/月，非全日制/兼职 N 次/月（多主体每主体 1 次，可能跳档）</td>
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
