<template>
  <div class="v2-guide">
    <div class="page-header">
      <div class="page-header-left">
        <h1>产品需求v2</h1>
        <p class="tip">💡 说明不同用工形式下，员工入职合作、福利保障配置、薪酬计算与发放的全流程</p>
      </div>
      <div class="page-header-right">
        <el-button @click="copyToClipboard">复制</el-button>
        <el-button type="primary" @click="exportToPdf">导出 PDF</el-button>
      </div>
    </div>

    <div class="content-section">
      <!-- 版本日志 -->
      <div id="version" class="section version-log">
        <div class="version-info">
          <span class="version-tag">v2.0</span>
          <span class="version-date">2026-06-01</span>
        </div>
        <h3>核心调整</h3>
        <ul>
          <li><strong>新增非全日制用工类型</strong>：每天每店≤4小时，周薪制（间隔≤15天），工伤险必须购买</li>
          <li><strong>常乐豆调整</strong>：仅支持消费，离职时余额全部提现；历史豆清零提现</li>
          <li><strong>全职社保足额缴纳</strong>：按入职首月实际薪酬申报基数</li>
          <li><strong>发放主体按合作模式区分</strong>：全职走合同主体（单一主体），非全日制/兼职走业绩归属主体（多主体，1 个门店 = 1 个主体）</li>
          <li><strong>兼职个税多主体申报</strong>（1 门店 = 1 主体）：支持应税金额倒序依次申报，可能跳档</li>
          <li><strong>非全日制/兼职无常乐豆</strong>：常乐豆仅限全职员工</li>
          <li><strong>营销折扣获豆 / 回头客补贴：仅全职 Lv3 以下员工享有的常乐豆项</strong>；非全日制/兼职无任何常乐豆</li>
        </ul>
        <h3>要点</h3>
        <ul class="conclusions">
          <li>三种用工类型：<strong>全职（劳动合同）</strong>、<strong>非全日制（劳务协议）</strong>、<strong>兼职（劳务合作）</strong></li>
          <li>常乐豆<strong>仅消费</strong>，不参与薪资计算，离职时提现</li>
          <li>非全日制<strong>工伤险必须购买</strong>，可使用雇主险代替</li>
          <li>工资条按<strong>发放主体</strong>分组生成——全职=合同主体（1个），非全日制/兼职=业绩归属主体（1 门店 = 1 主体，可能多个）</li>
          <li>排班时长由排班环节控制，薪酬系统只做说明</li>
        </ul>
      </div>

      <!-- 目录 -->
      <div class="toc">
        <h2>目录</h2>
        <ul>
          <li><a href="#version">版本日志</a></li>
          <li><a href="#terms">名词解释</a></li>
          <li><a href="#summary">一、整体概述</a></li>
          <li><a href="#welfare">二、员工福利保障配置</a></li>
          <li><a href="#bean">三、常乐豆规则</a></li>
          <li><a href="#template">四、岗位薪酬模板</a></li>
          <li><a href="#items">五、薪酬项范围</a></li>
          <li><a href="#calculation">六、计算节点与时机</a></li>
          <li><a href="#examples">七、计算示例</a></li>
          <li><a href="#payroll">八、工资条组装</a></li>
          <li><a href="#scenarios">九、典型业务场景决策树</a></li>
          <li><a href="#state-machine">十、工资条生命周期状态机</a></li>
          <li><a href="#money-flow">十一、金额流转泳道图</a></li>
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
          <div style="font-size: 13px; line-height: 1.8;">
            <div style="margin-bottom: 8px;"><strong>负工资</strong>：员工历史结算周期欠公司的款项，记录在独立余额中，只有应发 &gt; 0 时才能抵扣</div>
            <div style="margin-bottom: 8px;"><strong>应税收入</strong>：薪酬项 - 扣缴项（如投诉扣款），即提交报税的收入基数，社保/公积金不减除</div>
            <div style="margin-bottom: 8px;"><strong>预扣个税</strong>：兼职/非全日制每周工资条预扣3%，公式 = 应税收入 × 3%，累计作为已预扣合计</div>
            <div style="margin-bottom: 8px;"><strong>代扣个税汇算</strong>：月末百旺服务基于应税收入计算实际税额，与已预扣合计比较，多退少补；结果作为<strong>当月最后一条工资条</strong>的一个扣缴/收入项（补缴/退税）出现，不单独生成"汇算工资条"</div>
            <div style="margin-bottom: 8px;"><strong>工伤险</strong>：非全日制必须购买的商业保险，若城市不支持单独购买则用雇主险代替</div>
            <div style="margin-bottom: 8px;"><strong>雇主险</strong>：由公司全额负担的商业保险，独立于社保之外，兼职必须购买</div>
            <div style="margin-bottom: 8px;"><strong>城市基准系数</strong>：配置各城市社保、公积金、工伤险、雇主险的基数和比例，用于生成员工福利保障明细</div>
            <div style="margin-bottom: 8px;"><strong>合同主体</strong>：员工签署劳动合同/劳务协议/劳务合作的主体公司，全职员工仅 1 个合同主体（不能挂店）</div>
            <div style="margin-bottom: 8px;"><strong>业绩归属主体</strong>：员工实际产生业绩的归属门店对应的法人主体，<strong>1 个门店 = 1 个法人主体</strong>。非全日制/兼职可在多个门店服务，每个门店（主体）独立结算并生成工资条</div>
            <div style="margin-bottom: 8px;"><strong>百旺服务</strong>：第三方税务服务，能根据应税收入获得应纳个税</div>
            <div style="margin-bottom: 8px;"><strong>营销折扣获豆 / 回头客补贴</strong>：以常乐豆形式发放，仅全职推拿师 Lv3 以下员工享有；非全日制/兼职无任何常乐豆</div>
            <div><strong>负数累加</strong>：工资条应发为负时，负数累加到负工资余额，不交个税、不抵扣负工资</div>
          </div>
        </div>
      </div>

      <!-- 一、整体概述 -->
      <div id="summary" class="section">
        <h2>一、整体概述</h2>

        <!-- 核心流程 -->
        <div class="card architecture-card">
          <h2>核心流程</h2>
          <div class="architecture-diagram">
            <!-- 步骤1：薪酬项配置 -->
            <div class="arch-layer">
              <div class="arch-layer-title">1. 薪酬项配置</div>
              <div style="font-size: 13px; line-height: 1.8; text-align: left;">
                <!-- 全职模板 -->
                <div style="margin-bottom: 12px; padding: 8px 10px; background: hsl(var(--background)); border-radius: 4px;">
                  <div style="font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 6px;">全职模板（劳动合同）</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); margin-bottom: 6px;">每月N个工资条（示例：3个），单一主体</div>
                  <div style="margin-bottom: 4px;">
                    <span style="font-size: 12px; color: hsl(var(--muted-foreground));">第1级：</span>
                    <span class="arch-item" style="margin: 2px;">计件提成</span>
                    <span class="arch-item" style="margin: 2px;">超产值奖金</span>
                    <span class="arch-item" style="margin: 2px;">超时加班费</span>
                    <span class="arch-item" style="margin: 2px;">投诉扣款</span>
                  </div>
                  <div style="margin-bottom: 4px;">
                    <span style="font-size: 12px; color: hsl(var(--muted-foreground));">第2级：</span>
                    <span class="arch-item highlight" style="margin: 2px;">保底获豆</span>
                  </div>
                  <div>
                    <span style="font-size: 12px; color: hsl(var(--muted-foreground));">系统项：</span>
                    <span class="arch-item" style="margin: 2px; background: hsl(var(--muted-foreground) / 0.15);">代扣社保</span>
                    <span class="arch-item" style="margin: 2px; background: hsl(var(--muted-foreground) / 0.15);">代扣公积金</span>
                    <span class="arch-item" style="margin: 2px; background: hsl(var(--muted-foreground) / 0.15);">代扣个税</span>
                  </div>
                </div>
                <!-- 非全日制模板 -->
                <div style="margin-bottom: 12px; padding: 8px 10px; background: hsl(var(--primary) / 0.05); border: 1px solid hsl(var(--primary) / 0.15); border-radius: 4px;">
                  <div style="font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 6px;">非全日制模板（劳务协议）</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); margin-bottom: 6px;">结算周期可配（示例：周薪制），每主体独立结算，多主体</div>
                  <div style="margin-bottom: 4px;">
                    <span style="font-size: 12px; color: hsl(var(--muted-foreground));">第1级：</span>
                    <span class="arch-item" style="margin: 2px;">计件提成</span>
                    <span class="arch-item" style="margin: 2px;">超时加班费</span>
                    <span class="arch-item" style="margin: 2px;">投诉扣款</span>
                  </div>
                  <div style="margin-bottom: 4px;">
                    <span style="font-size: 12px; color: hsl(var(--muted-foreground));">第2级：</span>
                    <span class="arch-item highlight" style="margin: 2px;">个税预扣（3%）</span>
                  </div>
                  <div style="margin-bottom: 4px;">
                    <span style="font-size: 12px; color: hsl(var(--muted-foreground));">系统项：</span>
                    <span class="arch-item" style="margin: 2px; background: hsl(var(--muted-foreground) / 0.15);">代扣个税</span>
                    <span style="font-size: 11px; color: hsl(var(--muted-foreground)); margin-left: 4px;">（月末汇算，作为最后一条工资条的一项）</span>
                  </div>
                  <div>
                    <span style="font-size: 12px; color: hsl(var(--muted-foreground));">公司成本项：</span>
                    <span class="arch-item highlight" style="margin: 2px;">工伤险</span>
                  </div>
                </div>
                <!-- 兼职模板 -->
                <div style="padding: 8px 10px; background: hsl(var(--primary) / 0.08); border: 1px solid hsl(var(--primary) / 0.25); border-radius: 4px;">
                  <div style="font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 6px;">兼职模板（劳务合作）</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); margin-bottom: 6px;">结算周期可配（示例：周薪制），每主体独立结算，多主体</div>
                  <div style="margin-bottom: 4px;">
                    <span style="font-size: 12px; color: hsl(var(--muted-foreground));">第1级：</span>
                    <span class="arch-item" style="margin: 2px;">计件提成</span>
                    <span class="arch-item" style="margin: 2px;">超时加班费</span>
                    <span class="arch-item" style="margin: 2px;">投诉扣款</span>
                  </div>
                  <div style="margin-bottom: 4px;">
                    <span style="font-size: 12px; color: hsl(var(--muted-foreground));">第2级：</span>
                    <span class="arch-item highlight" style="margin: 2px;">个税预扣（3%）</span>
                  </div>
                  <div style="margin-bottom: 4px;">
                    <span style="font-size: 12px; color: hsl(var(--muted-foreground));">系统项：</span>
                    <span class="arch-item" style="margin: 2px; background: hsl(var(--muted-foreground) / 0.15);">代扣个税</span>
                    <span style="font-size: 11px; color: hsl(var(--muted-foreground)); margin-left: 4px;">（月末汇算，作为最后一条工资条的一项）</span>
                  </div>
                  <div>
                    <span style="font-size: 12px; color: hsl(var(--muted-foreground));">公司成本项：</span>
                    <span class="arch-item" style="margin: 2px;">雇主险</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="arch-arrow">↓</div>
            <!-- 步骤2：发放策略/工资单 -->
            <div class="arch-layer">
              <div class="arch-layer-title">2. 发放策略（工资单定义）</div>
              <div style="font-size: 13px; line-height: 1.8; text-align: left;">
                <div style="margin-bottom: 10px;">
                  <span style="font-weight: 600; color: hsl(var(--foreground));">全职</span>
                  <span style="color: hsl(var(--muted-foreground)); font-size: 12px;">（劳动合同，每月N个工资条（示例：3个），单一主体）</span>
                  <div style="margin-top: 4px; font-size: 12px; color: hsl(var(--muted-foreground));">
                    工资条1：计件提成 + 投诉扣款 + 代扣社保　｜　工资条2：超产值奖金 + 超时加班费 + 代扣公积金 + 代扣个税　｜　工资条3：保底获豆
                  </div>
                </div>
                <div style="margin-bottom: 10px;">
                  <span style="font-weight: 600; color: hsl(var(--foreground));">非全日制</span>
                  <span style="color: hsl(var(--muted-foreground)); font-size: 12px;">（劳务协议，结算周期可配（示例：周薪制），多主体）</span>
                  <div style="margin-top: 4px; font-size: 12px; color: hsl(var(--muted-foreground));">
                    每个主体每结算周期生成N个工资条（示例：1个/周）：计件提成 + 超时加班费 + 投诉扣款 + <strong>预扣个税（第2级）</strong>；最后一条工资条额外包含<strong>个税补缴 / 个税退税</strong>（系统项汇算结果）
                  </div>
                  <div style="margin-top: 4px; font-size: 12px; color: hsl(var(--primary));">
                    业绩归属主体：当前服务门店｜合同主体：员工签署劳务协议的主体
                  </div>
                </div>
                <div>
                  <span style="font-weight: 600; color: hsl(var(--foreground));">兼职</span>
                  <span style="color: hsl(var(--muted-foreground)); font-size: 12px;">（劳务合作，结算周期可配（示例：周薪制），多主体，应税金额倒序报税）</span>
                  <div style="margin-top: 4px; font-size: 12px; color: hsl(var(--muted-foreground));">
                    每个主体每结算周期生成N个工资条（示例：1个/周）：计件提成 + 超时加班费 + 投诉扣款 + <strong>预扣个税（第2级）</strong>；最后一条工资条额外包含<strong>个税补缴 / 个税退税</strong>（系统项汇算结果）
                  </div>
                  <div style="margin-top: 4px; font-size: 12px; color: hsl(var(--primary));">
                    业绩归属主体：当前服务门店｜合同主体：员工签署劳务协议的主体
                  </div>
                </div>
              </div>
            </div>
            <div class="arch-arrow">↓</div>
            <!-- 步骤3：计算节点 -->
            <div class="arch-layer">
              <div class="arch-layer-title">3. 计算节点（按层级顺序）</div>
              <div style="font-size: 14px; line-height: 2; text-align: left;">
                <div style="margin-bottom: 8px; padding-left: 12px; border-left: 3px solid hsl(var(--primary));">
                  <span style="font-weight: 700; color: hsl(var(--foreground));">第1级计算</span>
                  <span style="color: hsl(var(--muted-foreground)); font-size: 13px;"> — 基础收入/扣缴，每工资条计算</span>
                  <div style="margin-top: 4px; font-size: 13px;">计件提成、超产值奖金、超时加班费、投诉扣款</div>
                </div>
                <div style="margin-bottom: 8px; padding-left: 12px; border-left: 3px solid hsl(var(--primary));">
                  <span style="font-weight: 700; color: hsl(var(--foreground));">第2级计算</span>
                  <span style="color: hsl(var(--muted-foreground)); font-size: 13px;"> — 补充项，依赖第1级，每工资条计算</span>
                  <div style="margin-top: 4px; font-size: 13px;">保底获豆（全职）｜<strong>个税预扣</strong>（非全日制/兼职，每工资条按 3% 预扣）</div>
                </div>
                <div style="margin-bottom: 8px; padding-left: 12px; border-left: 3px solid hsl(var(--muted-foreground));">
                  <span style="font-weight: 700; color: hsl(var(--foreground));">系统项</span>
                  <span style="color: hsl(var(--muted-foreground)); font-size: 13px;"> — 第1/2级计算完成后执行，每月只计算一次（示例）</span>
                  <div style="margin-top: 4px; font-size: 13px;">代扣社保、代扣公积金（全职）、代扣个税（全职/非全日制/兼职，月末汇算）</div>
                </div>
                <div style="padding-left: 12px; border-left: 3px solid hsl(var(--primary) / 0.5); background: hsl(var(--primary) / 0.05); border-radius: 4px; padding: 8px 12px;">
                  <span style="font-weight: 700; color: hsl(var(--primary));">条件触发（计算后加入工资条）</span>
                  <div style="font-size: 13px; margin-top: 4px;">
                    <span style="color: hsl(var(--foreground));">代扣个税汇算</span>
                    <span style="color: hsl(var(--muted-foreground));">（月末） → 作为<strong>最后一个工资条</strong>的一个扣缴/收入项出现：</span>
                    <span style="color: hsl(var(--primary)); font-weight: 600;">个税补缴</span>
                    <span style="color: hsl(var(--muted-foreground));">（少缴）或</span>
                    <span style="color: hsl(var(--primary)); font-weight: 600;">个税退税</span>
                    <span style="color: hsl(var(--muted-foreground));">（多缴）</span>
                  </div>
                  <div style="font-size: 13px; margin-top: 4px;">
                    <span style="color: hsl(var(--foreground));">负工资抵扣</span>
                    <span style="color: hsl(var(--muted-foreground));"> → 工资条加入</span>
                    <span style="color: hsl(var(--primary)); font-weight: 600;">负工资抵扣</span>
                    <span style="color: hsl(var(--muted-foreground));">（扣减负工资余额）</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="arch-arrow">↓</div>
            <!-- 步骤4：工资条生成 -->
            <div class="arch-layer">
              <div class="arch-layer-title">4. 工资条生成（完整组成）</div>
              <div style="font-size: 12px; line-height: 2; text-align: left;">
                <div style="margin-bottom: 8px; padding: 6px 10px; background: hsl(var(--background)); border-radius: 4px;">
                  <span style="font-weight: 600;">全职工资条1~N（示例：1~3）</span>
                  <span style="color: hsl(var(--muted-foreground));"> — 基础项 + 第2级 + 系统项</span>
                  <div style="margin-top: 2px;">计件提成/超产值奖金/超时加班费 + 投诉扣款 + <strong>保底获豆</strong>（第2级）+ 代扣社保/公积金/个税（系统项）</div>
                  <div style="margin-top: 2px; color: hsl(var(--primary);">→ 条件触发：负工资抵扣（应发 &gt; 0 且有余额时）</div>
                </div>
                <div style="margin-bottom: 8px; padding: 6px 10px; background: hsl(var(--background)); border-radius: 4px;">
                  <span style="font-weight: 600;">非全日制/兼职周工资条1~N（示例：1~3）</span>
                  <span style="color: hsl(var(--muted-foreground));"> — 基础项 + 第2级</span>
                  <div style="margin-top: 2px;">计件提成 + 超时加班费 + 投诉扣款 + <strong>个税预扣</strong>（第2级，每条 3%）</div>
                  <div style="margin-top: 2px; color: hsl(var(--primary);">→ 条件触发：负工资抵扣（应发 &gt; 0 且有余额时）</div>
                </div>
                <div style="padding: 6px 10px; background: hsl(var(--primary) / 0.08); border: 1px solid hsl(var(--primary) / 0.2); border-radius: 4px;">
                  <span style="font-weight: 600;">非全日制/兼职月内最后一条工资条（示例：周工资条4）</span>
                  <span style="color: hsl(var(--muted-foreground));"> — 基础项 + 汇算结果</span>
                  <div style="margin-top: 2px;">计件提成 + 超时加班费 + 投诉扣款 + <strong>个税预扣</strong> + <strong>个税补缴 / 个税退税</strong>（汇算结果作为本条工资条的一项）</div>
                  <div style="margin-top: 2px; color: hsl(var(--primary);">→ 汇算结果不单独生成"汇算工资条"，直接归属于当月最后一条工资条</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h3>计算周期</h3>
          <div class="note" style="background: hsl(var(--muted) / 0.3); margin-bottom: 12px;">
            <strong>说明：</strong>下表中的"计算周期"和"工资条数量"为典型示例，实际可通过工资单配置灵活调整（可配置日/周/旬/月等不同周期、任意数量工资条）
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>类型</th>
                <th>计算周期（示例）</th>
                <th>工资条数量（示例）</th>
                <th>个税申报</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>非全日制（劳务协议）</td>
                <td>每周1次</td>
                <td>每主体N个工资条/次（示例：1个）</td>
                <td>每周预扣3%，月末汇算</td>
              </tr>
              <tr>
                <td>兼职（劳务合作）</td>
                <td>每周1次</td>
                <td>每主体N个工资条/次（示例：1个）</td>
                <td>每周预扣3%，月末汇算，多主体（1门店=1主体）倒序申报</td>
              </tr>
              <tr>
                <td>全职（劳动合同）</td>
                <td>每月1次</td>
                <td>N个工资条/月（示例：3个）</td>
                <td>月度申报</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card">
          <h3>计算层级</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>层级</th>
                <th>说明</th>
                <th>计算时机</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>第1级</td>
                <td>基础收入项和扣缴项</td>
                <td>每工资条计算</td>
              </tr>
              <tr>
                <td>第2级</td>
                <td>补充项，依赖第1级结果：保底获豆（全职）/ 个税预扣（非全日制、兼职，3%）</td>
                <td>每工资条计算</td>
              </tr>
              <tr>
                <td>系统项</td>
                <td>代扣社保、代扣公积金（全职）、代扣个税（汇算，月度）</td>
                <td>第1/2级完成后执行，每月只计算一次（示例）</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card">
          <h3>负工资抵扣</h3>
          <p>负工资是员工在历史结算周期中欠公司的款项，记录在独立的负工资余额中。</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>项目</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>触发条件</td>
                <td>工资条应发金额 &gt; 0（只有正数才能抵扣负工资余额）</td>
              </tr>
              <tr>
                <td>抵扣来源</td>
                <td>员工独立的负工资余额</td>
              </tr>
              <tr>
                <td>抵扣优先级</td>
                <td>
                  工资条：收入 → 扣缴项 → 代扣社保 → 代扣公积金 → 代扣个税 → 有剩余 → 抵扣负工资余额<br/>
                  <span style="color: hsl(var(--muted-foreground)); font-size: 12px;">注：个税由百旺基于应税收入（收入-扣缴项）独立计算，社保/公积金不减除</span>
                </td>
              </tr>
              <tr>
                <td>离职正式员工</td>
                <td>若现金工资条不够扣，还从常乐豆继续扣除（尽最大努力抵扣）</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>说明：</strong>负工资抵扣是每个工资条都可能触发的特殊项，当工资条应发 &gt; 0 且存在负工资余额时，自动生成抵扣项
          </div>
        </div>
      </div>

      <!-- 二、员工福利保障配置 -->
      <div id="welfare" class="section">
        <h2>二、员工福利保障配置</h2>

        <div class="card">
          <h3>各类型福利保障配置</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>类型</th>
                <th>社保</th>
                <th>公积金</th>
                <th>工伤险</th>
                <th>雇主险</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>全职</strong></td>
                <td>足额缴纳（按实际薪酬申报基数）</td>
                <td>足额缴纳（按实际薪酬申报基数）</td>
                <td>无</td>
                <td>无</td>
              </tr>
              <tr>
                <td><strong>非全日制</strong></td>
                <td>不交社保</td>
                <td>不交公积金</td>
                <td><strong>必须购买</strong>（独立项，雇主险代替）</td>
                <td>独立（公司全额负担）</td>
              </tr>
              <tr>
                <td><strong>兼职</strong></td>
                <td>不交社保</td>
                <td>不交公积金</td>
                <td>不强制</td>
                <td>必须购买（公司全额负担）</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card">
          <h3>雇主险</h3>
          <p>由公司全额负担的商业保险，独立于社保体系之外：</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>保障类型</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>全职</td>
                <td>公司全额负担，保障员工工作安全</td>
              </tr>
              <tr>
                <td>非全日制</td>
                <td>公司全额负担，当工伤险无法单独购买时，可使用雇主险代替</td>
              </tr>
              <tr>
                <td>兼职</td>
                <td>公司全额负担，建议购买</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card">
          <h3>非全日制工伤险说明</h3>
          <div class="note">
            <strong>必须购买：</strong>非全日制用工必须购买工伤保险。<br/><br/>
            <strong>替代方案：</strong>如果部分城市不支持单独购买工伤保险，在功能上支持使用雇主险代替。<br/><br/>
            <strong>独立性：</strong>工伤险和雇主险都是独立于社保之外的独立保障项目，不包含在社保体系中。
          </div>
        </div>

        <div class="card">
          <h3>社保申报基数</h3>
          <div class="note">
            <strong>全职社保：</strong>按入职首月实际薪酬（即当月应发总和）作为申报基数，非最低工资标准。<br/><br/>
            <strong>推拿师特殊说明：</strong>全职推拿师 Lv3 及以上员工不再发放营销折扣补贴、回头客补贴。
          </div>
        </div>

        <div class="card">
          <h3>保障明细生成时机</h3>
          <p>员工福利保障明细由以下事件触发，按用工类型分别处理：</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>触发事件</th>
                <th>触发时机</th>
                <th>明细内容</th>
                <th>影响范围</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>员工入职</td>
                <td>入职当日</td>
                <td>生成首月社保/公积金申报基数（= 入职首月实际薪酬）；生成工伤险/雇主险配置</td>
                <td>全职 / 非全日制 / 兼职</td>
              </tr>
              <tr>
                <td>月度结算</td>
                <td>每月末</td>
                <td>生成当月社保/公积金明细（按城市基准系数）</td>
                <td>全职</td>
              </tr>
              <tr>
                <td>周/月度结算</td>
                <td>每周 / 每月末</td>
                <td>生成工伤险/雇主险明细（按城市标准基数）</td>
                <td>非全日制 / 兼职</td>
              </tr>
              <tr>
                <td>调岗调薪</td>
                <td>调整生效日</td>
                <td>重新计算社保/公积金申报基数</td>
                <td>全职</td>
              </tr>
              <tr>
                <td>城市 / 政策变更</td>
                <td>城市生效日</td>
                <td>重新拉取城市基准系数配置</td>
                <td>全职 / 非全日制 / 兼职</td>
              </tr>
              <tr>
                <td>员工离职</td>
                <td>离职当日</td>
                <td>社保/公积金转出；工伤险/雇主险到期</td>
                <td>全职 / 非全日制 / 兼职</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>说明：</strong>保障明细记录到「员工福利保障」模块，<strong>独立于工资条</strong>，仅用于公司成本统计与员工保障查询。其中：
            <ul>
              <li><strong>社保/公积金 个人部分</strong> → <strong>参与</strong>工资条扣款（作为代扣社保/公积金从员工实发中扣除）</li>
              <li><strong>社保/公积金 公司部分</strong> → 不参与工资条扣款，归入公司成本</li>
              <li><strong>工伤险 / 雇主险</strong> → 不参与工资条扣款，公司全额负担，归入公司成本</li>
            </ul>
          </div>
        </div>

        <div class="card">
          <h3>全额交纳 vs 按基数交纳</h3>
          <p>根据城市基准系数配置，每种保障类型可选择以下交纳模式：</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>模式</th>
                <th>适用类型</th>
                <th>计算公式</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>全额交纳</strong></td>
                <td>社保 / 公积金（全职）</td>
                <td>实际薪酬 × 比例</td>
                <td>无下限，按实际工资计算；高薪酬高保障</td>
              </tr>
              <tr>
                <td><strong>按基数交纳</strong></td>
                <td>社保 / 公积金（全职）</td>
                <td>城市标准基数 × 比例（与实际薪酬无关）</td>
                <td>有标准基数限制；统一标准，便于合规</td>
              </tr>
              <tr>
                <td>按基数交纳</td>
                <td>工伤险 / 雇主险</td>
                <td>城市标准基数 × 比例</td>
                <td>公司全额负担，与员工实际薪酬无关</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>典型配置（示例）：</strong>
            <ul>
              <li>北京社保全额：5000 元 × 16.5%（公司）+ 8.5%（个人）</li>
              <li>北京社保按基数：8000 元 × 16.5%（公司）+ 8.5%（个人）</li>
              <li>北京工伤险：5000 元 × 0.8%（公司全额，个人不缴）</li>
              <li>北京雇主险：5000 元 × 1.5%（公司全额，个人不缴）</li>
            </ul>
            以上为示例数字，实际以城市基准系数配置为准。
          </div>
        </div>

        <div class="card">
          <h3>保障模式选择决策</h3>
          <div class="decision-tree">
            <div class="tree-node root">员工福利保障配置</div>
            <div class="tree-children">
              <div class="tree-question">Q: 用工类型？</div>
              <div class="tree-children">
                <div class="tree-leaf primary">全职 → 社保 + 公积金（按城市基准系数）</div>
                <div class="tree-leaf-sub">  └ 默认 <strong>全额交纳</strong>（按入职首月实际薪酬）</div>
                <div class="tree-leaf-sub">  └ 特殊政策可配置为 <strong>按基数交纳</strong>（有最低限制）</div>
                <div class="tree-leaf primary">非全日制 → 工伤险（必须）</div>
                <div class="tree-leaf-sub">  └ <strong>按基数交纳</strong>（公司全额，与实际薪酬无关）</div>
                <div class="tree-leaf-sub">  └ 城市不支持单独购买时 → <strong>雇主险代替</strong></div>
                <div class="tree-leaf primary">兼职 → 雇主险（必须）</div>
                <div class="tree-leaf-sub">  └ <strong>按基数交纳</strong>（公司全额，与实际薪酬无关）</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h3>数据源与获取时机</h3>
          <p>员工福利保障明细的"数据源"和"获取时机"决定了明细的生成规则：</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>数据项</th>
                <th>数据源</th>
                <th>获取时机</th>
                <th>触发主体</th>
                <th>多主体支持</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>社保 / 公积金 / 工伤险 / 雇主险</td>
                <td><strong>城市基准系数</strong>（config 表）</td>
                <td>员工入职 / 城市变更 / 政策调整</td>
                <td>HR / 系统配置</td>
                <td>否（1 个员工 1 个城市 1 套系数）</td>
              </tr>
              <tr>
                <td>代扣个税（全职）</td>
                <td><strong>百旺服务</strong>（第三方税务 API）</td>
                <td>月末（结算周期结束后）</td>
                <td>百旺服务调用</td>
                <td>否（1 个员工 1 个合同主体）</td>
              </tr>
              <tr>
                <td>代扣个税（非全日制 / 兼职）</td>
                <td>百旺服务（按累计应税收入计算）+ 系统倒序申报</td>
                <td>月末（所有门店周工资条生成后）</td>
                <td>百旺服务调用 + 系统分配</td>
                <td><strong>是</strong>（按申报主体 N 个；<strong>1 个门店 = 1 个主体</strong>，无同主体多门店）</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card">
          <h3>交纳模式变更的影响</h3>
          <p>城市基准系数中每种保障类型的"交纳模式"（全额 / 按基数）可独立配置。模式变更会触发保障明细重算：</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>模式变更场景</th>
                <th>触发时机</th>
                <th>影响范围</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>城市政策调整（如社保局变更基数下限 / 调整比例）</td>
                <td>政策生效日</td>
                <td>该城市所有员工</td>
              </tr>
              <tr>
                <td>城市基准系数配置变更（HR 调整 mode / 基数 / 比例）</td>
                <td>配置生效日</td>
                <td>该城市所有员工</td>
              </tr>
              <tr>
                <td>员工城市变更（调店）</td>
                <td>城市生效日</td>
                <td>该员工</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>关键说明：</strong>
            <ul>
              <li>全职社保的<strong>申报基数</strong>一旦确定（入职首月实际薪酬）后，原则上 1 年内不变（除非调岗调薪或政策调整）</li>
              <li>城市基准系数中的<strong>城市标准基数</strong>（按基数交纳用）由城市政策决定，按城市配置周期生效</li>
              <li>模式变更只影响<strong>后续月份</strong>的明细，已生成的过往明细不回溯重算</li>
            </ul>
          </div>
        </div>

        <div class="card">
          <h3>非全日制 / 兼职多主体个税汇总（倒序申报）</h3>
          <p>非全日制 / 兼职员工在 N 个门店产生业绩时，个税按"跨主体累计算税 + 倒序申报"规则处理：</p>

          <div class="decision-tree">
            <div class="tree-node root">月末所有门店周工资条生成完毕</div>
            <div class="tree-children">
              <div class="tree-question">Step 1: 系统汇总所有申报主体的应税收入</div>
              <div class="tree-leaf-sub">  └ <strong>1 个门店 = 1 个申报主体</strong>（无同主体多门店）</div>
              <div class="tree-leaf-sub">  └ 每主体应税收入 = 该门店（主体）下该月（门店总收入 - 门店总扣缴）之和</div>
              <div class="tree-leaf-sub">  └ <strong>合计累计应税收入</strong> = Σ 各主体应税收入（跨主体累加）</div>

              <div class="tree-question">Step 2: 调用百旺服务（1 次调用，跨主体）</div>
              <div class="tree-leaf-sub">  └ 传入该员工当月<strong>所有申报主体</strong>的应税收入明细</div>
              <div class="tree-leaf-sub">  └ 百旺按累计预扣预缴表计算 <strong>累计应纳个税</strong></div>
              <div class="tree-leaf-sub">  └ 返回：累计应纳个税总额（不含已预扣）</div>

              <div class="tree-question">Step 3: 系统侧计算补缴 / 退税</div>
              <div class="tree-leaf-sub">  └ 补缴 / 退税总额 = 累计应纳个税 - 已预扣合计（各主体预扣之和）</div>
              <div class="tree-leaf-sub">  └ &gt; 0 → 补缴 ｜ &lt; 0 → 退税</div>

              <div class="tree-question">Step 4: 按倒序申报逻辑分配到各主体（1 门店 = 1 主体）</div>
              <div class="tree-leaf-sub">  └ 按<strong>主体应税金额从大到小</strong>排序</div>
              <div class="tree-leaf-sub">  └ 高应税主体 <strong>先申报</strong> → 累计基数高 → 该主体扣税多（避免后申报时大额补缴）</div>
              <div class="tree-leaf-sub">  └ 低应税主体 <strong>后申报</strong> → 按补差计算 → 该主体补缴少（避免大额补缴导致工资条无法发放）</div>
              <div class="tree-leaf-sub">  └ <strong>每主体补缴 / 退税 = 累计应纳个税 − 前面已申报所有主体累计税额</strong></div>
              <div class="tree-leaf-sub">  └ 可能跳档：后申报主体补缴额因累进税率跳档而突变</div>

              <div class="tree-question">Step 5: 写入各主体最后一周工资条</div>
              <div class="tree-leaf-sub">  └ 每主体的补缴 / 退税 <strong>作为该主体最后一周工资条的一个扣缴 / 收入项</strong>出现</div>
              <div class="tree-leaf-sub">  └ 不单独生成汇算工资条</div>
            </div>
          </div>

          <div class="note">
            <strong>重要说明（多主体个税）：</strong>
            <ul>
              <li><strong>1 个门店 = 1 个申报主体</strong>，不存在"同主体多门店"合并后再申报的场景</li>
              <li>百旺服务的调用是<strong>1 次</strong>，传入<strong>该员工当月所有申报主体</strong>的应税收入，不是按主体分别调用</li>
              <li>"倒序申报"是<strong>系统侧处理逻辑</strong>，不是百旺直接返回的——百旺只算累计应纳个税</li>
              <li>每主体独立结算，补缴 / 退税归属该主体，<strong>不与其他主体互抵</strong></li>
              <li>补缴 / 退税从该主体最后一周工资条实发中扣 / 加，<strong>不累积为负工资余额</strong></li>
              <li><strong>倒序申报的业务目的：</strong>累进税率下"高累进段先填满"，使每张工资条的"代扣个税"分布均匀，避免单主体出现大额补缴 / 退税影响工资发放</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 三、常乐豆规则 -->
      <div id="bean" class="section">
        <h2>三、常乐豆规则</h2>

        <div class="card">
          <h3>常乐豆适用范围</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>类型</th>
                <th>常乐豆</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>全职</strong></td>
                <td>有</td>
                <td>仅支持消费，离职时余额全部提现</td>
              </tr>
              <tr>
                <td><strong>非全日制</strong></td>
                <td>无</td>
                <td>不参与常乐豆体系</td>
              </tr>
              <tr>
                <td><strong>兼职</strong></td>
                <td>无</td>
                <td>不参与常乐豆体系</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card">
          <h3>常乐豆不参与薪资计算</h3>
          <div class="note">
            <strong>重要说明：</strong>常乐豆不参与个税应税金额计算。<br/><br/>
            全职员工离职时，该合同主体名下的常乐豆余额全部提现。提现报税主体即为该员工的合同主体。
          </div>
        </div>

        <div class="card">
          <h3>历史常乐豆处理</h3>
          <div class="note">
            <strong>历史豆清零：</strong>现有常乐豆需要进行清理，全部转化为现金提现。<br/><br/>
            <strong>提现方式：</strong>设置时间节点，在时间节点前的余额全部提现。
          </div>
        </div>
      </div>

      <!-- 四、岗位薪酬模板 -->
      <div id="template" class="section">
        <h2>四、岗位薪酬模板</h2>

        <div class="card">
          <h3>模板项类型</h3>
          <p>薪酬模板由以下类型组成：</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>类型</th>
                <th>说明</th>
                <th>进入薪酬计算</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>薪酬项</td>
                <td>收入类，如：计件提成、超产值奖金、保底获豆</td>
                <td>✅ 是（增加应发）</td>
              </tr>
              <tr>
                <td>扣缴项</td>
                <td>扣款类，如：投诉扣款</td>
                <td>✅ 是（减少应发）</td>
              </tr>
              <tr>
                <td>代扣社保</td>
                <td>社保扣缴（全职），员工个人部分</td>
                <td>✅ 是</td>
              </tr>
              <tr>
                <td>代扣公积金</td>
                <td>公积金扣缴（全职），员工个人部分</td>
                <td>✅ 是</td>
              </tr>
              <tr>
                <td>预扣个税</td>
                <td>第2级，每工资条计算时预扣（兼职/非全日制：每周，3%）</td>
                <td>✅ 是</td>
              </tr>
              <tr>
                <td>代扣个税</td>
                <td>月末汇算后生成退税/补缴，作为<strong>最后一条工资条</strong>的一个扣缴/收入项（<strong>不单独生成"汇算工资条"</strong>）</td>
                <td>✅ 是</td>
              </tr>
              <tr>
                <td><strong>公司成本项</strong>（新增）</td>
                <td>工伤险、雇主险等公司负担费用，<strong>不进入工资条扣款</strong></td>
                <td>❌ 否（成本统计用）</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card">
          <h3>公司成本项配置</h3>
          <div class="note">
            <strong>设计说明：</strong>公司成本项配置在岗位薪酬模板中，但：<br/>
            1. 不进入薪酬计算代扣逻辑<br/>
            2. 不参与工资条组装的扣款<br/>
            3. 但需要在员工福利保障明细中记录（用于成本统计）<br/><br/>
            <strong>灵活配置：</strong>不同城市、不同用工类型可以配置不同的公司成本项组合
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>用工类型</th>
                <th>公司成本项</th>
                <th>配置说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>全职</td>
                <td>无</td>
                <td>已交社保，无需工伤险/雇主险</td>
              </tr>
              <tr>
                <td>非全日制</td>
                <td>工伤险</td>
                <td>必须购买，若城市不支持单独购买则用雇主险代替</td>
              </tr>
              <tr>
                <td>兼职</td>
                <td>雇主险</td>
                <td>建议购买</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 全职模板 -->
        <div class="card">
          <h3>全职模板（劳动合同）</h3>
          <p><strong>计算周期（示例）：</strong>每月1次，N个工资条/月（示例：3个），单一主体</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>类别</th>
                <th>薪酬项</th>
                <th>类型</th>
                <th>层级</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowspan="4">薪酬项</td>
                <td>计件提成</td>
                <td>收入</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>超产值奖金</td>
                <td>收入</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>超时加班费</td>
                <td>收入</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>投诉扣款</td>
                <td>扣缴项</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>薪酬项</td>
                <td>保底获豆</td>
                <td>收入</td>
                <td>第2级</td>
              </tr>
              <tr>
                <td rowspan="3">系统项</td>
                <td>代扣社保</td>
                <td>代扣社保</td>
                <td>末级</td>
              </tr>
              <tr>
                <td>代扣公积金</td>
                <td>代扣公积金</td>
                <td>末级</td>
              </tr>
              <tr>
                <td>代扣个税</td>
                <td>代扣个税</td>
                <td>末级</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>系统项：</strong>代扣社保、代扣公积金、代扣个税（按月计算，按工资条分配）<br/>
            <strong>无预扣个税：</strong>全职个税直接使用百旺服务计算，不再预扣<br/>
            <strong>公司成本项：</strong>无（已交社保，无需工伤险/雇主险）
          </div>
        </div>

        <!-- 非全日制模板 -->
        <div class="card">
          <h3>非全日制模板（劳务协议）</h3>
          <p><strong>计算周期（示例）：</strong>每周1次，每主体独立结算（N个工资条可配，示例：1个）</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>类别</th>
                <th>薪酬项</th>
                <th>类型</th>
                <th>层级</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowspan="3">薪酬项</td>
                <td>计件提成</td>
                <td>收入</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>超时加班费</td>
                <td>收入</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>投诉扣款</td>
                <td>扣缴项</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>第2级</td>
                <td>个税预扣</td>
                <td>扣缴项</td>
                <td>第2级（每工资条按 3% 预扣）</td>
              </tr>
              <tr>
                <td>系统项</td>
                <td>个税退税 / 个税补缴</td>
                <td>代扣个税</td>
                <td>系统项（月末汇算，作为最后一条工资条的一项）</td>
              </tr>
              <tr>
                <td rowspan="2">公司成本项</td>
                <td>工伤险</td>
                <td>公司成本</td>
                <td>必须购买</td>
              </tr>
              <tr>
                <td>雇主险（代替工伤险）</td>
                <td>公司成本</td>
                <td>城市不支持单独购买时</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>公司成本项：</strong>工伤险（必须）+ 雇主险（若城市不支持单独购买工伤险则用雇主险代替）<br/>
            <strong>不进入薪酬计算：</strong>这些项由公司全额负担，不参与工资条扣款计算<br/>
            <strong>灵活配置：</strong>可根据城市政策不同，配置不同的公司成本项组合
          </div>
        </div>

        <!-- 兼职模板 -->
        <div class="card">
          <h3>兼职模板（劳务合作）</h3>
          <p><strong>计算周期（示例）：</strong>每周1次，每主体独立结算（N个工资条可配，示例：1个）</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>类别</th>
                <th>薪酬项</th>
                <th>类型</th>
                <th>层级</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowspan="3">薪酬项</td>
                <td>计件提成</td>
                <td>收入</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>超时加班费</td>
                <td>收入</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>投诉扣款</td>
                <td>扣缴项</td>
                <td>第1级</td>
              </tr>
              <tr>
                <td>第2级</td>
                <td>个税预扣</td>
                <td>扣缴项</td>
                <td>第2级（每工资条按 3% 预扣）</td>
              </tr>
              <tr>
                <td>系统项</td>
                <td>个税退税 / 个税补缴</td>
                <td>代扣个税</td>
                <td>系统项（月末汇算，作为最后一条工资条的一项）</td>
              </tr>
              <tr>
                <td>公司成本项</td>
                <td>雇主险</td>
                <td>公司成本</td>
                <td>建议购买</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>公司成本项：</strong>雇主险（公司全额负担，建议购买）<br/>
            <strong>不进入薪酬计算：</strong>不参与工资条扣款计算<br/>
            <strong>多主体申报：</strong>按应税金额大的先报，可能跳档
          </div>
        </div>
      </div>

            <div id="items" class="section">
        <h2>五、薪酬项范围</h2>

        <!-- 全职 -->
        <div class="card">
          <h3>全职（劳动合同）</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>层级</th>
                <th>薪酬项</th>
                <th>类型</th>
                <th>计算公式</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowspan="4">第1级</td>
                <td>计件提成</td>
                <td>收入</td>
                <td>订单金额 × 提成比例</td>
              </tr>
              <tr>
                <td>超产值奖金</td>
                <td>收入</td>
                <td>超出部分 × 奖励比例</td>
              </tr>
              <tr>
                <td>超时加班费</td>
                <td>收入</td>
                <td>加班时长 × 单价</td>
              </tr>
              <tr>
                <td>投诉扣款</td>
                <td>扣缴项</td>
                <td>投诉次数 × 单次扣款</td>
              </tr>
              <tr>
                <td>第2级</td>
                <td>保底获豆</td>
                <td>收入</td>
                <td>max(0, 最低工资标准 - 第1级收入之和)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 非全日制 -->
        <div class="card">
          <h3>非全日制（劳务协议）</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>层级</th>
                <th>薪酬项</th>
                <th>类型</th>
                <th>计算公式</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowspan="3">第1级</td>
                <td>计件提成</td>
                <td>收入</td>
                <td>订单金额 × 提成比例</td>
              </tr>
              <tr>
                <td>超时加班费</td>
                <td>收入</td>
                <td>加班时长 × 单价</td>
              </tr>
              <tr>
                <td>投诉扣款</td>
                <td>扣缴项</td>
                <td>投诉次数 × 单次扣款</td>
              </tr>
              <tr>
                <td>第2级（每工资条）</td>
                <td>个税预扣</td>
                <td>扣缴项</td>
                <td>(全部收入之和 - 全部扣缴之和) × 3%</td>
              </tr>
              <tr>
                <td>系统项（月末汇算）</td>
                <td>个税退税 / 个税补缴</td>
                <td>代扣个税</td>
                <td>百旺实际税额 - 已预扣合计</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 兼职 -->
        <div class="card">
          <h3>兼职（劳务合作）</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>层级</th>
                <th>薪酬项</th>
                <th>类型</th>
                <th>计算公式</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowspan="3">第1级</td>
                <td>计件提成</td>
                <td>收入</td>
                <td>订单金额 × 提成比例</td>
              </tr>
              <tr>
                <td>超时加班费</td>
                <td>收入</td>
                <td>加班时长 × 单价</td>
              </tr>
              <tr>
                <td>投诉扣款</td>
                <td>扣缴项</td>
                <td>投诉次数 × 单次扣款</td>
              </tr>
              <tr>
                <td>第2级（每工资条）</td>
                <td>个税预扣</td>
                <td>扣缴项</td>
                <td>(全部收入之和 - 全部扣缴之和) × 3%</td>
              </tr>
              <tr>
                <td>系统项（月末汇算）</td>
                <td>个税退税 / 个税补缴</td>
                <td>代扣个税</td>
                <td>百旺实际税额 - 已预扣合计（倒序申报）</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 六、计算节点与时机 -->
      <div id="calculation" class="section">
        <h2>六、计算节点与时机</h2>

        <!-- 全职 -->
        <div class="card">
          <h3>全职（劳动合同）</h3>
          <div class="flow">
            <div class="flow-step">
              <div class="step-title">第1级计算</div>
              <div class="step-content">
                <p><strong>时机：</strong>最先</p>
                <p><strong>参与项：</strong></p>
                <ul>
                  <li>计件提成（收入）</li>
                  <li>超产值奖金（收入）</li>
                  <li>超时加班费（收入）</li>
                  <li>投诉扣款（扣缴）</li>
                </ul>
                <p><strong>产出：</strong>4项金额</p>
              </div>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <div class="step-title">第2级计算</div>
              <div class="step-content">
                <p><strong>时机：</strong>第1级完成后</p>
                <p><strong>参与项：</strong></p>
                <ul>
                  <li>保底获豆（引用第1级收入之和）</li>
                </ul>
                <p><strong>公式：</strong>max(0, 最低工资标准 - 第1级收入之和)</p>
                <p><strong>产出：</strong>保底获豆金额</p>
              </div>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <div class="step-title">系统项</div>
              <div class="step-content">
                <p><strong>时机：</strong>所有薪酬项计算后</p>
                <p><strong>参与项：</strong></p>
                <ul>
                  <li>代扣社保</li>
                  <li>代扣公积金</li>
                  <li>代扣个税（百旺服务）</li>
                </ul>
                <p><strong>说明：</strong>3项都每月只计算一次（示例），按工资条分配</p>
              </div>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <div class="step-title">负工资抵扣</div>
              <div class="step-content">
                <p><strong>时机：</strong>前序计算完成后（工资条应发 &gt; 0 且存在负工资余额）</p>
                <p><strong>优先级：</strong></p>
                <ul>
                  <li>收入 - 扣缴项 → 代扣社保 → 代扣公积金 → 代扣个税</li>
                  <li>结果 &gt; 0 → 抵扣负工资余额（min(余额, 结余)）</li>
                  <li>结果 ≤ 0 → 无负工资抵扣，负数累加到余额</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 非全日制 -->
        <div class="card">
          <h3>非全日制（劳务协议）</h3>
          <div class="flow">
            <div class="flow-step">
              <div class="step-title">第1级计算</div>
              <div class="step-content">
                <p><strong>时机：</strong>最先</p>
                <p><strong>参与项：</strong></p>
                <ul>
                  <li>计件提成（收入）</li>
                  <li>超时加班费（收入）</li>
                  <li>投诉扣款（扣缴）</li>
                </ul>
                <p><strong>产出：</strong>3项金额</p>
              </div>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <div class="step-title">第2级计算</div>
              <div class="step-content">
                <p><strong>时机：</strong>第1级完成后，随每个工资条计算</p>
                <p><strong>参与项：</strong></p>
                <ul>
                  <li>个税预扣（引用第1级收入之和）</li>
                </ul>
                <p><strong>公式：</strong>(第1级收入 - 第1级扣缴) × 3%</p>
                <p><strong>产出：</strong>预扣金额，进入当前工资条</p>
              </div>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <div class="step-title">系统项（个税汇算）</div>
              <div class="step-content">
                <p><strong>时机：</strong>月末，所有周工资条计算完成后</p>
                <p><strong>参与项：</strong></p>
                <ul>
                  <li>百旺服务（实际税额）</li>
                  <li>各周预扣个税之和</li>
                </ul>
                <p><strong>公式：</strong>实际税额 - 已预扣合计</p>
                <p><strong>产出：</strong>个税退税（收入）或个税补缴（扣缴）—— 作为<strong>最后一条工资条</strong>的一个扣缴/收入项出现，不单独生成汇算工资条</p>
              </div>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <div class="step-title">负工资抵扣</div>
              <div class="step-content">
                <p><strong>时机：</strong>每工资条计算后（应发 &gt; 0 且存在负工资余额）</p>
                <p><strong>优先级：</strong></p>
                <ul>
                  <li>收入 - 扣缴项 → 个税预扣 → 有剩余 → 抵扣负工资余额</li>
                  <li>结果 ≤ 0 → 无负工资抵扣</li>
                </ul>
                <p><strong>说明：</strong>非全日制无社保公积金，按优先级累加后判断</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 兼职 -->
        <div class="card">
          <h3>兼职（劳务合作）</h3>
          <div class="flow">
            <div class="flow-step">
              <div class="step-title">第1级计算</div>
              <div class="step-content">
                <p><strong>时机：</strong>最先</p>
                <p><strong>参与项：</strong></p>
                <ul>
                  <li>计件提成（收入）</li>
                  <li>超时加班费（收入）</li>
                  <li>投诉扣款（扣缴）</li>
                </ul>
                <p><strong>产出：</strong>3项金额</p>
              </div>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <div class="step-title">第2级计算</div>
              <div class="step-content">
                <p><strong>时机：</strong>第1级完成后，随每个工资条计算</p>
                <p><strong>参与项：</strong></p>
                <ul>
                  <li>个税预扣（引用第1级收入之和）</li>
                </ul>
                <p><strong>公式：</strong>(第1级收入 - 第1级扣缴) × 3%</p>
                <p><strong>产出：</strong>预扣金额，进入当前工资条</p>
              </div>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <div class="step-title">系统项（个税汇算）</div>
              <div class="step-content">
                <p><strong>时机：</strong>月末，所有周工资条计算完成后</p>
                <p><strong>参与项：</strong></p>
                <ul>
                  <li>百旺服务（实际税额）</li>
                  <li>各周预扣个税之和</li>
                </ul>
                <p><strong>多主体申报（1 门店 = 1 主体）：</strong>按主体应税金额倒序依次申报，可能跳档</p>
                <p><strong>产出：</strong>个税退税（收入）或个税补缴（扣缴）—— 作为<strong>最后一条工资条</strong>的一个扣缴/收入项出现，不单独生成汇算工资条</p>
              </div>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <div class="step-title">负工资抵扣</div>
              <div class="step-content">
                <p><strong>时机：</strong>每工资条计算后（应发 &gt; 0 且存在负工资余额）</p>
                <p><strong>优先级：</strong></p>
                <ul>
                  <li>收入 - 扣缴项 → 个税预扣 → 有剩余 → 抵扣负工资余额</li>
                  <li>结果 ≤ 0 → 无负工资抵扣</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 七、计算示例 -->
      <div id="examples" class="section">
        <h2>七、计算示例</h2>
        <div class="card" style="background: hsl(var(--primary) / 0.08); border: 1px solid hsl(var(--primary) / 0.3);">
          <div style="font-size: 13px; line-height: 1.8;">
            <strong>说明：</strong>以下示例中的薪酬项、金额、计算结果、工资条数量、门店数等均<strong>为典型业务场景下的示例</strong>，用于演示计算逻辑。实际业务中，<strong>所有数字、项数、分配方式均可灵活配置</strong>。
          </div>
        </div>

        <!-- 全职示例 A -->
        <div class="card">
          <h3>全职示例 A：单月 N 个工资条完整组成（含负工资抵扣）— 示例配置</h3>
          <div class="example">
            <p><strong>员工当月数据：</strong></p>
            <table class="data-table">
              <thead>
                <tr><th>项目</th><th>金额</th><th>说明</th></tr>
              </thead>
              <tbody>
                <tr><td>计件提成</td><td>+6000</td><td>第1级收入</td></tr>
                <tr><td>超产值奖金</td><td>+2000</td><td>第1级收入</td></tr>
                <tr><td>超时加班费</td><td>+500</td><td>第1级收入</td></tr>
                <tr><td>投诉扣款</td><td>-200</td><td>第1级扣缴</td></tr>
                <tr><td>保底获豆</td><td>+0</td><td>第2级收入（第1级已超最低工资）</td></tr>
                <tr><td>代扣社保</td><td>-800</td><td>系统项（按实际薪酬基数）</td></tr>
                <tr><td>代扣公积金</td><td>-600</td><td>系统项（按实际薪酬基数）</td></tr>
                <tr><td>代扣个税</td><td>-57</td><td>系统项（百旺按 8300 计算）</td></tr>
                <tr><td>负工资余额</td><td>-2000</td><td>历史欠款</td></tr>
              </tbody>
            </table>
            <p><strong>应税收入：</strong>8500 - 投诉扣款(200) = <strong>8300</strong>（社保/公积金不减除）</p>
            <p><strong>N 个工资条完整组成（示例：3个，发放主体=合同主体）：</strong></p>
            <table class="data-table">
              <thead>
                <tr><th>工资条</th><th>收入项</th><th>扣缴项</th><th>动态项</th><th>应发</th><th>实发</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>工资条1（计件）</td>
                  <td>计件提成 +6000</td>
                  <td>投诉扣款 -200；代扣社保 -800</td>
                  <td>负工资抵扣 -2000（应发 &gt; 0 触发）</td>
                  <td>+3000</td>
                  <td><strong>3000</strong></td>
                </tr>
                <tr>
                  <td>工资条2（奖金）</td>
                  <td>超产值奖金 +2000；超时加班费 +500</td>
                  <td>代扣公积金 -600</td>
                  <td>—（无负工资余额）</td>
                  <td>+1900</td>
                  <td><strong>1900</strong></td>
                </tr>
                <tr>
                  <td>工资条3（保底+个税）</td>
                  <td>保底获豆 +0</td>
                  <td>代扣个税 -57</td>
                  <td>—</td>
                  <td>-57（应发 &lt; 0，负数累加）</td>
                  <td><strong>0</strong></td>
                </tr>
                <tr>
                  <td colspan="4"><strong>合计</strong></td>
                  <td colspan="2"><strong>实发 4900，剩余负工资余额 57</strong></td>
                </tr>
              </tbody>
            </table>
            <div class="note">
              <strong>说明：</strong>① 系统项（社保/公积金/个税）按月一次计算，按工资单配置分配到 N 个工资条（示例：3个）；② 负工资抵扣是触发式动态项（应发 &gt; 0 且有负工资余额时才出现），可叠加多条；③ 应发 &lt; 0 时负数累加到下次负工资余额。
            </div>
          </div>
        </div>

        <!-- 全职示例 B -->
        <div class="card">
          <h3>全职示例 B：单月 N 个工资条完整组成（负工资汇总后按可抵扣最大值扣）— 示例配置</h3>
          <div class="example">
            <p><strong>员工当月数据：</strong></p>
            <table class="data-table">
              <thead>
                <tr><th>项目</th><th>金额</th><th>说明</th></tr>
              </thead>
              <tbody>
                <tr><td>计件提成</td><td>+1000</td><td>第1级收入（本月业绩差）</td></tr>
                <tr><td>超时加班费</td><td>+0</td><td>第1级收入</td></tr>
                <tr><td>投诉扣款</td><td>-3000</td><td>第1级扣缴（大额扣款）</td></tr>
                <tr><td>保底获豆</td><td>+7000</td><td>第2级收入（最低工资8000 - 第1级1000）</td></tr>
                <tr><td>代扣社保</td><td>-800</td><td>系统项</td></tr>
                <tr><td>代扣公积金</td><td>-600</td><td>系统项</td></tr>
                <tr><td>代扣个税</td><td>-90</td><td>系统项（百旺按 5000 计算）</td></tr>
                <tr><td>负工资余额</td><td>-500</td><td>历史欠款</td></tr>
              </tbody>
            </table>
            <p><strong>应税收入：</strong>(1000+7000) - 投诉扣款(3000) = <strong>5000</strong></p>
            <p><strong>N 个工资条完整组成（示例：3个，发放主体=合同主体）：</strong></p>
            <table class="data-table">
              <thead>
                <tr><th>工资条</th><th>收入项</th><th>扣缴项</th><th>动态项</th><th>应发</th><th>实发</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>工资条1（计件）</td>
                  <td>计件提成 +1000</td>
                  <td>投诉扣款 -3000；代扣社保 -800</td>
                  <td>—（应税收入 ≤ 0，无个税）</td>
                  <td>-2800</td>
                  <td><strong>0</strong></td>
                </tr>
                <tr>
                  <td>工资条2（奖金）</td>
                  <td>超时加班费 +0</td>
                  <td>代扣公积金 -600</td>
                  <td>—</td>
                  <td>-600</td>
                  <td><strong>0</strong></td>
                </tr>
                <tr>
                  <td>工资条3（保底+个税）</td>
                  <td>保底获豆 +7000</td>
                  <td>代扣个税 -90</td>
                  <td>负工资抵扣 -3900（按可抵扣最大值 = 历史 500 + 本月新增 2800+600）</td>
                  <td>+3010</td>
                  <td><strong>3010</strong></td>
                </tr>
                <tr>
                  <td colspan="4"><strong>合计</strong></td>
                  <td colspan="2"><strong>实发 3010，剩余负工资余额 0</strong></td>
                </tr>
              </tbody>
            </table>
            <div class="note">
              <strong>说明：</strong>① 应税收入 ≤ 0 时无个税（工资条 1/2 不扣个税）；② 应发 ≤ 0 的工资条负数计入"待抵扣总额"；③ 工资条3 应发 &gt; 0 时按"可抵扣最大值"一次性扣除——min(应发, 历史负工资 + 本月新产生负数) = min(6410, 500+2800+600) = 3900；④ 抵扣后剩余负工资 0。
            </div>
          </div>
        </div>

        <!-- 非全日制/兼职示例 A：4 周工资条，最后一周含汇算补缴 -->
        <div class="card">
          <h3>非全日制/兼职示例 A：N 周工资条（示例：4周），最后一周含汇算补缴（单主体）</h3>
          <div class="example">
            <p><strong>员工当月 N 周数据（示例：4周，单主体=1 个门店）：</strong></p>
            <table class="data-table">
              <thead>
                <tr><th>周次</th><th>计件提成</th><th>超时加班费</th><th>投诉扣款</th><th>预扣个税（3%）</th></tr>
              </thead>
              <tbody>
                <tr><td>第1周</td><td>+5000</td><td>+300</td><td>-100</td><td>(5000+300-100)×3%=156</td></tr>
                <tr><td>第2周</td><td>+4500</td><td>+400</td><td>0</td><td>(4500+400-0)×3%=147</td></tr>
                <tr><td>第3周</td><td>+6000</td><td>+500</td><td>-200</td><td>(6000+500-200)×3%=189</td></tr>
                <tr><td>第4周</td><td>+5500</td><td>+400</td><td>0</td><td>(5500+400-0)×3%=177</td></tr>
                <tr><td colspan="2"><strong>当月合计</strong></td><td colspan="2">应税收入 <strong>22300</strong></td><td>已预扣合计 <strong>669</strong></td></tr>
              </tbody>
            </table>
            <p><strong>月末汇算：</strong>百旺实际税额 = <strong>900</strong>，补缴 = 900 - 669 = <strong>231</strong>（&gt;0，生成个税补缴）</p>
            <p><strong>每周工资条完整组成（发放主体=各业绩归属主体，1 门店 = 1 主体）：</strong></p>
            <table class="data-table">
              <thead>
                <tr><th>工资条</th><th>收入项</th><th>扣缴项</th><th>应发</th><th>实发</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>周工资条1</td>
                  <td>计件提成 +5000；超时加班费 +300</td>
                  <td>投诉扣款 -100；预扣个税 -156</td>
                  <td>+5044</td>
                  <td><strong>5044</strong></td>
                </tr>
                <tr>
                  <td>周工资条2</td>
                  <td>计件提成 +4500；超时加班费 +400</td>
                  <td>预扣个税 -147</td>
                  <td>+4753</td>
                  <td><strong>4753</strong></td>
                </tr>
                <tr>
                  <td>周工资条3</td>
                  <td>计件提成 +6000；超时加班费 +500</td>
                  <td>投诉扣款 -200；预扣个税 -189</td>
                  <td>+6111</td>
                  <td><strong>6111</strong></td>
                </tr>
                <tr>
                  <td>周工资条4（含汇算）</td>
                  <td>计件提成 +5500；超时加班费 +400</td>
                  <td>预扣个税 -177；个税补缴 -231（百旺汇算结果）</td>
                  <td>+5492</td>
                  <td><strong>5492</strong></td>
                </tr>
                <tr>
                  <td colspan="3"><strong>当月合计</strong></td>
                  <td colspan="2"><strong>实发 21400</strong></td>
                </tr>
              </tbody>
            </table>
            <div class="note">
              <strong>说明：</strong>① 每周工资条各自计算预扣个税（应税收入 × 3%），可累加到多个工资条上；② 月末百旺算出实际税额后，"个税补缴/退税"作为<strong>最后一个工资条</strong>的一个扣缴项出现（示例配置为最后一周第4周），不单独生成汇算工资条；③ 代扣个税（百旺计算的汇算结果）系统项全月只在最后一周工资条上出现 1 次；④ 汇算补缴直接从最后一周实发里扣，不累积为负工资余额。
            </div>
          </div>
        </div>

        <!-- 兼职示例 B：多主体倒序申报（1 门店 = 1 主体），每主体最后一周含汇算补缴 -->
        <div class="card">
          <h3>兼职示例 B：多主体倒序申报（1 门店 = 1 主体），每主体最后一周含汇算补缴</h3>
          <div class="example">
            <p><strong>员工当月在 N 个主体（门店）的数据（示例：2个，1 门店 = 1 主体）：</strong></p>
            <table class="data-table">
              <thead>
                <tr><th>主体（门店）</th><th>周次</th><th>应税收入</th><th>预扣个税</th></tr>
              </thead>
              <tbody>
                <tr><td rowspan="4">门店A</td><td>第1周</td><td>+5300</td><td>159</td></tr>
                <tr><td>第2周</td><td>+4900</td><td>147</td></tr>
                <tr><td>第3周</td><td>+6300</td><td>189</td></tr>
                <tr><td>第4周</td><td>+5900</td><td>177</td></tr>
                <tr><td colspan="2">门店A 小计</td><td>+22400</td><td>672</td></tr>
                <tr><td rowspan="4">门店B</td><td>第1周</td><td>+3000</td><td>90</td></tr>
                <tr><td>第2周</td><td>+2800</td><td>84</td></tr>
                <tr><td>第3周</td><td>+3200</td><td>96</td></tr>
                <tr><td>第4周</td><td>+3600</td><td>108</td></tr>
                <tr><td colspan="2">门店B 小计</td><td>+12600</td><td>378</td></tr>
              </tbody>
            </table>
            <p><strong>申报顺序（倒序，应税金额大的先报，可能跳档）：</strong></p>
            <ul class="calc-steps">
              <li>门店A（应税 22400）先申报 → 百旺计算税额 <strong>1800</strong>，该店补缴 = 1800 - 672 = <strong>1128</strong></li>
              <li>门店B（应税 12600）后申报 → 可能跳档，百旺计算税额 <strong>1200</strong>，该店补缴 = 1200 - 378 = <strong>822</strong></li>
            </ul>
            <p><strong>每主体（门店）每周工资条完整组成（发放主体=各自主体）：</strong></p>
            <table class="data-table">
              <thead>
                <tr><th>门店</th><th>工资条</th><th>收入项</th><th>扣缴项</th><th>应发</th><th>实发</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td rowspan="4">门店A</td>
                  <td>周工资条1</td>
                  <td>计件提成 +5000；加班 +300</td>
                  <td>投诉扣款 -100；预扣个税 -159</td>
                  <td>+5041</td>
                  <td><strong>5041</strong></td>
                </tr>
                <tr>
                  <td>周工资条2</td>
                  <td>计件提成 +4500；加班 +400</td>
                  <td>预扣个税 -147</td>
                  <td>+4753</td>
                  <td><strong>4753</strong></td>
                </tr>
                <tr>
                  <td>周工资条3</td>
                  <td>计件提成 +6000；加班 +300</td>
                  <td>投诉扣款 -100；预扣个税 -189</td>
                  <td>+6011</td>
                  <td><strong>6011</strong></td>
                </tr>
                <tr>
                  <td>周工资条4（含汇算）</td>
                  <td>计件提成 +5500；加班 +400</td>
                  <td>预扣个税 -177；个税补缴 -1128（门店A 倒序申报补缴）</td>
                  <td>+4595</td>
                  <td><strong>4595</strong></td>
                </tr>
                <tr>
                  <td colspan="3">门店A 小计</td>
                  <td colspan="2"><strong>实发 20400</strong></td>
                </tr>
                <tr>
                  <td rowspan="4">门店B</td>
                  <td>周工资条1</td>
                  <td>计件提成 +3000；加班 +0</td>
                  <td>预扣个税 -90</td>
                  <td>+2910</td>
                  <td><strong>2910</strong></td>
                </tr>
                <tr>
                  <td>周工资条2</td>
                  <td>计件提成 +2800；加班 +0</td>
                  <td>预扣个税 -84</td>
                  <td>+2716</td>
                  <td><strong>2716</strong></td>
                </tr>
                <tr>
                  <td>周工资条3</td>
                  <td>计件提成 +3200；加班 +0</td>
                  <td>预扣个税 -96</td>
                  <td>+3104</td>
                  <td><strong>3104</strong></td>
                </tr>
                <tr>
                  <td>周工资条4（含汇算）</td>
                  <td>计件提成 +3600；加班 +0</td>
                  <td>预扣个税 -108；个税补缴 -822（门店B 倒序申报补缴）</td>
                  <td>+2670</td>
                  <td><strong>2670</strong></td>
                </tr>
                <tr>
                  <td colspan="3">门店B 小计</td>
                  <td colspan="2"><strong>实发 11400</strong></td>
                </tr>
                <tr>
                  <td colspan="3"><strong>当月总计（N 个主体合计，示例：2个）</strong></td>
                  <td colspan="2"><strong>实发 31800</strong></td>
                </tr>
              </tbody>
            </table>
            <div class="note">
              <strong>说明：</strong>① <strong>1 个门店 = 1 个主体</strong>，多主体（多门店）下每主体独立生成 N 个周工资条（示例：4个），最后一周含汇算补缴；② 申报顺序按主体应税金额倒序（应税大者先报），可能跳档；③ 汇算补缴作为每主体最后一个工资条的扣缴项出现（不单独生成汇算工资条）；④ 每主体的补缴从该主体最后一周实发里扣，不累积为负工资余额；⑤ 同一员工在不同主体的工资独立发放、互不抵扣。
            </div>
          </div>
        </div>
      </div>

      <!-- 八、工资条组装 -->
      <div id="payroll" class="section">
        <h2>八、工资条组装</h2>
        <div class="card" style="background: hsl(var(--primary) / 0.08); border: 1px solid hsl(var(--primary) / 0.3);">
          <div style="font-size: 13px; line-height: 1.8;">
            <strong>说明：</strong>本节展示的工资条数量和分配方式为典型示例，<strong>实际系统支持灵活配置任意数量工资条、任意薪酬项分配方式</strong>，业务方可根据用工类型、岗位特点、合规要求等自由组合。
          </div>
        </div>

        <div class="card">
          <h3>核心原则</h3>
          <ul class="feature-list">
            <li>工资条按<strong>发放主体</strong>分组生成：全职=合同主体（1个），非全日制/兼职=业绩归属主体（可能多个，1 门店 = 1 主体）</li>
            <li>每个发放主体独立结算、独立生成工资条</li>
            <li>所有薪酬项和系统项都会计算出值</li>
            <li>业务侧通过工资单配置，决定哪些项进入哪个工资条</li>
            <li>无论怎么分配，所有工资条应发之和 = 员工总净工资</li>
            <li>系统项（社保/公积金/个税）按月计算，按工资条分配</li>
            <li><strong>预扣个税</strong>可在多个工资条中出现，每个工资条各自计算</li>
            <li><strong>代扣个税（汇算）</strong>只能出现在<strong>1 个工资条</strong>中：作为<strong>当月最后一条工资条</strong>的一个扣缴/收入项（补缴/退税），<strong>不单独生成"汇算工资条"</strong></li>
            <li><strong>负工资抵扣</strong>每个工资条都可能触发（应发 &gt; 0 且存在负工资余额时）</li>
          </ul>
        </div>

        <!-- 全职工资条 -->
        <div class="card">
          <h3>全职工资条（每月）</h3>
          <p>每月计算1次（示例），每次生成N个工资条（示例：3个）：</p>
          <table class="data-table">
            <thead>
              <tr><th>工资条</th><th>包含薪酬项</th><th>说明</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>工资条1（计件工资条）</td>
                <td>计件提成 + 投诉扣款(部分) + 代扣社保(部分)</td>
                <td>系统项按比例分配</td>
              </tr>
              <tr>
                <td>工资条2（奖金工资条）</td>
                <td>超产值奖金 + 超时加班费 + 投诉扣款(部分) + 代扣公积金(部分)</td>
                <td>系统项按比例分配</td>
              </tr>
              <tr>
                <td>工资条3（常乐豆工资条）</td>
                <td>保底获豆 + 代扣个税</td>
                <td>代扣个税由百旺服务计算</td>
              </tr>
            </tbody>
          </table>
          <div class="note" style="background: hsl(var(--muted) / 0.3);">
            <strong>说明：</strong>以上3个工资条为典型示例配置，<strong>实际工资单可灵活配置任意数量工资条、任意薪酬项分配方式</strong>。
          </div>
          <div class="note">
            <strong>验证：</strong>5000 + 1843 + 0 = 6843（总净工资）✅<br/>
            <strong>离职常乐豆：</strong>全职员工离职时，该合同主体名下的常乐豆余额全部提现
          </div>
        </div>

        <!-- 非全日制/兼职工资条 -->
        <div class="card">
          <h3>非全日制/兼职工资条（每周）</h3>
          <p>每周计算1次（示例），每个主体生成N个工资条（示例：1个）：</p>
          <table class="data-table">
            <thead>
              <tr><th>工资条</th><th>包含薪酬项</th><th>说明</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>周工资条（普通）</td>
                <td>计件提成 + 超时加班费 + 投诉扣款 + 预扣个税</td>
                <td>每个主体每周生成</td>
              </tr>
              <tr>
                <td>最后一周工资条（月末）</td>
                <td>计件提成 + 超时加班费 + 投诉扣款 + 预扣个税 + <strong>个税补缴 或 个税退税</strong>（汇算结果）</td>
                <td>
                  月末百旺汇算后，汇算结果作为<strong>最后一条工资条的一个扣缴/收入项</strong>出现<br/>
                  补缴 = 实际税额 - 已预扣合计（&gt;0 生成补缴）<br/>
                  退税 = 已预扣合计 - 实际税额（&lt;0 生成退税）<br/>
                  <strong>不单独生成"汇算工资条"</strong>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="note" style="background: hsl(var(--muted) / 0.3);">
            <strong>说明：</strong>结算周期和工资条数量为典型示例，<strong>实际可灵活配置任意结算周期（日/周/旬/月）、任意数量工资条</strong>。个税汇算结果<strong>始终归属于当月最后一条工资条</strong>，不单独生成汇算工资条。
          </div>
        </div>

        <div class="card">
          <h3>负工资抵扣示例（负数累加，无个税抵扣）</h3>
          <p><strong>场景：</strong>某员工存在负工资余额 -500，收入项合计800，投诉扣款1000：</p>
          <table class="data-table">
            <thead>
              <tr><th>项目</th><th>金额</th></tr>
            </thead>
            <tbody>
              <tr><td>收入项合计</td><td>+800</td></tr>
              <tr><td>投诉扣款</td><td>-1000</td></tr>
              <tr><td>代扣社保（全职）</td><td>-200</td></tr>
              <tr><td>代扣公积金（全职）</td><td>-200</td></tr>
              <tr><td>负工资余额</td><td>-500</td></tr>
            </tbody>
          </table>
          <p><strong>计算顺序：</strong></p>
          <ul class="calc-steps">
            <li>应税收入 = 800 - 1000 = <strong>-200</strong>（≤ 0，无应税收入）</li>
            <li>应税收入 ≤ 0，<strong>不交个税</strong></li>
            <li>工资条应发 = 800 - 1000 - 200 - 200 = <strong>-600</strong></li>
            <li>应发 ≤ 0，<strong>不抵扣负工资</strong></li>
          </ul>
          <p><strong>实际抵扣后工资条：</strong></p>
          <ul>
            <li>收入：+800</li>
            <li>投诉扣款：-1000</li>
            <li>代扣社保：-200</li>
            <li>代扣公积金：-200</li>
            <li>代扣个税：<strong>0</strong>（无应税收入，不扣）</li>
            <li>负工资抵扣：<strong>0</strong></li>
            <li><strong>应发：-600</strong>（负数累计，负工资余额增加500→1100）</li>
          </ul>
          <div class="note">
            <strong>说明：</strong>当扣完收入、扣缴项、社保、公积金后累计为负数时：①不再扣个税（无应税收入）；②无法抵扣负工资；③负数累加到负工资余额中。
          </div>
        </div>

        <div class="card">
          <h3>多主体工资条示例（兼职）</h3>
          <p><strong>员工当月在M个门店的数据（示例：2个）：</strong></p>
          <p>每个门店独立结算，生成各自的工资条：</p>
          <table class="data-table">
            <thead>
              <tr><th>门店</th><th>工资条</th><th>包含项</th><th>金额</th></tr>
            </thead>
            <tbody>
              <tr>
                <td rowspan="4">门店A</td>
                <td>周工资条1</td>
                <td>计件+加班+预扣个税</td>
                <td>+5300 - 156</td>
              </tr>
              <tr>
                <td>周工资条2</td>
                <td>计件+加班+预扣个税</td>
                <td>+4900 - 147</td>
              </tr>
              <tr>
                <td>周工资条3</td>
                <td>计件+加班+预扣个税</td>
                <td>+6300 - 189</td>
              </tr>
              <tr>
                <td>周工资条4（含汇算）</td>
                <td>计件+加班+预扣个税 + <strong>个税补缴</strong>（门店A 倒序申报补缴，作为本条工资条的一项）</td>
                <td>+5900 - 177 - 1128</td>
              </tr>
              <tr>
                <td rowspan="4">门店B</td>
                <td>周工资条1</td>
                <td>计件+加班+预扣个税</td>
                <td>+3000 - 90</td>
              </tr>
              <tr>
                <td>周工资条2</td>
                <td>计件+加班+预扣个税</td>
                <td>+2800 - 84</td>
              </tr>
              <tr>
                <td>周工资条3</td>
                <td>计件+加班+预扣个税</td>
                <td>+3200 - 96</td>
              </tr>
              <tr>
                <td>周工资条4（含汇算）</td>
                <td>计件+加班+预扣个税 + <strong>个税补缴</strong>（门店B 倒序申报补缴，作为本条工资条的一项，可能跳档）</td>
                <td>+3600 - 108 - 822</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>发放规则：</strong>每个发放主体（全职=合同主体，非全日制/兼职=业绩归属主体，1 门店 = 1 主体）下的工资分别发放。周薪制要求两笔工资间隔≤15天。<br/>
            <strong>汇算规则：</strong>个税汇算结果（补缴/退税）<strong>作为每门店最后一条工资条的一个扣缴/收入项</strong>出现，不单独生成"汇算工资条"。
          </div>
        </div>
      </div>

      <!-- 十一、金额流转泳道图 -->
      <div id="money-flow" class="section">
        <h2>十一、金额流转泳道图</h2>

        <div class="card">
          <h3>月度金额流转全景</h3>
          <div class="swimlane-container">
            <div class="swimlane-row">
              <div class="swimlane-lane">顾客<br/>客户</div>
              <div class="swimlane-content">
                <div class="flow-step-inline primary">支付服务费用</div>
              </div>
            </div>
            <div class="swimlane-arrow">↓</div>
            <div class="swimlane-row">
              <div class="swimlane-lane">主体公司<br/>（含门店）</div>
              <div class="swimlane-content">
                <div class="flow-step-inline">收入 → 工资单系统</div>
                <div class="flow-step-inline muted">主体公司按业绩归属归集营收</div>
              </div>
            </div>
            <div class="swimlane-arrow">↓</div>
            <div class="swimlane-row">
              <div class="swimlane-lane">工资单<br/>系统</div>
              <div class="swimlane-content">
                <div class="flow-step-inline">按员工 + 主体 + 周期 创建工资单</div>
                <div class="flow-step-inline muted">匹配薪酬模板 + 发放策略 + 城市基准系数</div>
                <div class="flow-step-inline">第1级 → 第2级 → 系统项 → 条件触发</div>
              </div>
            </div>
            <div class="swimlane-arrow">↓</div>
            <div class="swimlane-row highlight-row">
              <div class="swimlane-lane">工资条<br/>(每员工 1~N 条)</div>
              <div class="swimlane-content">
                <div class="flow-step-inline primary">→ 员工（实发 = 收入 - 扣缴 - 代扣）</div>
                <div class="flow-step-inline">→ 第三方（代扣个税，月末汇算补退）</div>
                <div class="flow-step-inline">→ 第三方（代扣社保/公积金，个人部分）</div>
                <div class="flow-step-inline">→ 主体公司（公司部分社保/公积金，进公司成本）</div>
                <div class="flow-step-inline">→ 第三方（工伤险/雇主险，公司全额，进公司成本）</div>
                <div class="flow-step-inline muted">→ 负工资账户（应发 > 0 时抵扣；应发 < 0 时累加到余额）</div>
                <div class="flow-step-inline muted">→ 常乐豆账户（仅全职，保底获豆入账 / 离职提现）</div>
              </div>
            </div>
            <div class="swimlane-arrow">↓</div>
            <div class="swimlane-row split-row">
              <div class="swimlane-lane">员工 / 第三方<br/>收款方</div>
              <div class="swimlane-content split-content">
                <div class="split-item">
                  <div class="split-title">员工</div>
                  <div class="split-desc">实发工资（含现金 + 常乐豆）</div>
                </div>
                <div class="split-item">
                  <div class="split-title">税务局</div>
                  <div class="split-desc">代扣个税 + 汇算补退</div>
                </div>
                <div class="split-item">
                  <div class="split-title">社保局 / 公积金中心</div>
                  <div class="split-desc">个人 + 公司部分（合并代缴）</div>
                </div>
                <div class="split-item">
                  <div class="split-title">保险公司</div>
                  <div class="split-desc">工伤险 / 雇主险（公司全额）</div>
                </div>
                <div class="split-item">
                  <div class="split-title">百旺服务</div>
                  <div class="split-desc">第三方税务服务费</div>
                </div>
              </div>
            </div>
          </div>

          <div class="note">
            <strong>关键流转规则：</strong>
            <ul>
              <li>工资条上的"<strong>公司部分</strong>"（社保/公积金公司部分、工伤险、雇主险）<strong>不进入员工工资条</strong>，仅记录到公司成本</li>
              <li>工资条上的"<strong>代扣</strong>"是员工负担部分，从实发中扣除</li>
              <li><strong>代扣个税</strong>通过百旺服务计算：全职直接算当月，非全日制/兼职按累计应税收入算累计应纳 - 已预扣合计 = 补缴/退税</li>
              <li><strong>常乐豆</strong>仅全职员工有；发放 → 消费 → 离职提现，全链路不进工资条扣款</li>
            </ul>
          </div>
        </div>

        <div class="card">
          <h3>典型场景：非全日制/兼职多主体月度结算（1 门店 = 1 主体）</h3>
          <div class="swimlane-container">
            <div class="swimlane-row">
              <div class="swimlane-lane">门店A</div>
              <div class="swimlane-content">
                <div class="flow-step-inline">每周计件 + 加班 - 投诉 → 预扣个税（3%×4周）</div>
                <div class="flow-step-inline muted">门店A 业绩归集 → 门店A 主体</div>
              </div>
            </div>
            <div class="swimlane-arrow">↓</div>
            <div class="swimlane-row">
              <div class="swimlane-lane">门店B</div>
              <div class="swimlane-content">
                <div class="flow-step-inline">每周计件 + 加班 → 预扣个税（3%×4周）</div>
                <div class="flow-step-inline muted">门店B 业绩归集 → 门店B 主体</div>
              </div>
            </div>
            <div class="swimlane-arrow">↓ 月末 ↓</div>
            <div class="swimlane-row highlight-row">
              <div class="swimlane-lane">百旺服务<br/>(倒序申报)</div>
              <div class="swimlane-content">
                <div class="flow-step-inline">门店A（应税 22400）先申报 → 计算应纳 1800 → 补缴 = 1800 - 672 = 1128</div>
                <div class="flow-step-inline">门店B（应税 12600）后申报 → 可能跳档 → 计算应纳 1200 → 补缴 = 1200 - 378 = 822</div>
              </div>
            </div>
            <div class="swimlane-arrow">↓</div>
            <div class="swimlane-row split-row">
              <div class="swimlane-lane">员工工资条<br/>(每门店最后一周)</div>
              <div class="swimlane-content split-content">
                <div class="split-item">
                  <div class="split-title">门店A 第4周</div>
                  <div class="split-desc">含 -177（预扣） + -1128（补缴）</div>
                </div>
                <div class="split-item">
                  <div class="split-title">门店B 第4周</div>
                  <div class="split-desc">含 -108（预扣） + -822（补缴）</div>
                </div>
              </div>
            </div>
          </div>
          <div class="note">
            <strong>说明：</strong>每门店独立结算，<strong>不抵扣</strong>；门店A 补缴从门店A 最后一周实发扣；门店B 补缴从门店B 最后一周实发扣。
          </div>
        </div>
      </div>

      <!-- 十、工资条生命周期状态机 -->
      <div id="state-machine" class="section">
        <h2>十、工资条生命周期状态机</h2>

        <div class="card">
          <h3>状态定义</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>状态</th>
                <th>状态码</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>草稿</strong></td>
                <td><code>DRAFT</code></td>
                <td>工资条创建后未计算状态，可被修改</td>
              </tr>
              <tr>
                <td><strong>已计算</strong></td>
                <td><code>CALCULATED</code></td>
                <td>系统已完成第1级→第2级→系统项计算，未提交业务确认</td>
              </tr>
              <tr>
                <td><strong>待确认</strong></td>
                <td><code>PENDING_CONFIRM</code></td>
                <td>已提交，等待业务方/HR 审核</td>
              </tr>
              <tr>
                <td><strong>已确认</strong></td>
                <td><code>CONFIRMED</code></td>
                <td>业务方已确认，金额锁定</td>
              </tr>
              <tr>
                <td><strong>已发放</strong></td>
                <td><code>PAID</code></td>
                <td>工资已转账给员工，社保/公积金/个税/工伤险/雇主险已代缴</td>
              </tr>
              <tr>
                <td><strong>已撤回</strong></td>
                <td><code>REVOKED</code></td>
                <td>因计算错误或个税申报问题被撤回，可重新发起</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card">
          <h3>状态流转图</h3>
          <div class="state-machine">
            <div class="state-node initial">草稿<br/><small>DRAFT</small></div>
            <div class="state-arrow">→</div>
            <div class="state-node">已计算<br/><small>CALCULATED</small></div>
            <div class="state-arrow">→</div>
            <div class="state-node">待确认<br/><small>PENDING_CONFIRM</small></div>
            <div class="state-arrow">→</div>
            <div class="state-node">已确认<br/><small>CONFIRMED</small></div>
            <div class="state-arrow">→</div>
            <div class="state-node terminal">已发放<br/><small>PAID</small></div>
          </div>
          <div class="state-machine secondary">
            <div class="state-node error">已撤回<br/><small>REVOKED</small></div>
            <div class="state-arrow">→</div>
            <div class="state-node initial">草稿<br/><small>（重新计算）</small></div>
          </div>

          <div class="note">
            <strong>状态流转规则：</strong>
            <ul>
              <li><strong>正向流程</strong>：草稿 → 已计算 → 待确认 → 已确认 → 已发放</li>
              <li><strong>驳回</strong>：待确认 → 草稿（业务方驳回，可修改后重新提交）</li>
              <li><strong>重算</strong>：已确认 → 已撤回 → 草稿（发起重算任务，已发个税/社保需作废原申报）</li>
              <li><strong>撤回</strong>：已发放 → 已撤回（异常情况，作废已发记录）</li>
            </ul>
          </div>
        </div>

        <div class="card">
          <h3>关键状态变更触发条件</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>状态变更</th>
                <th>触发条件</th>
                <th>副作用</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>草稿 → 已计算</td>
                <td>系统完成所有薪酬项 + 系统项计算</td>
                <td>写入各项金额、应发、实发、负工资余额变化</td>
              </tr>
              <tr>
                <td>已计算 → 待确认</td>
                <td>HR 提交审核</td>
                <td>锁定金额，禁止外部修改</td>
              </tr>
              <tr>
                <td>待确认 → 已确认</td>
                <td>业务方/HR 确认通过</td>
                <td>生成银行转账指令 + 第三方缴费指令</td>
              </tr>
              <tr>
                <td>已确认 → 已发放</td>
                <td>银行转账成功 + 第三方缴费回执</td>
                <td>更新常乐豆账户、负工资账户、个税申报记录</td>
              </tr>
              <tr>
                <td>已确认 → 已撤回</td>
                <td>重算任务 / 个税申报失败 / 投诉申诉</td>
                <td>作废原转账、作废原个税申报、重置账户</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 九、典型业务场景决策树 -->
      <div id="scenarios" class="section">
        <h2>九、典型业务场景决策树</h2>

        <div class="card">
          <h3>用工类型选择</h3>
          <div class="decision-tree">
            <div class="tree-node root">新员工入职配置</div>
            <div class="tree-children">
              <div class="tree-question">Q1: 每天工时 ≤ 4 小时 + 周薪制（间隔 ≤ 15 天）？</div>
              <div class="tree-children">
                <div class="tree-leaf primary">✓ 是 → 非全日制用工（劳务协议）</div>
                <div class="tree-leaf-sub">  └ 工伤险（必须；城市不支持单独购买时用雇主险代替）</div>
                <div class="tree-leaf-sub">  └ 多主体（1 门店 = 1 主体）：每主体独立结算，按各主体发薪</div>
                <div class="tree-leaf-sub">  └ 无常乐豆、无社保、无公积金</div>
                <div class="tree-leaf muted">  ✗ 否 ↓</div>
              </div>
              <div class="tree-question">Q2: 需要社保 + 公积金？</div>
              <div class="tree-children">
                <div class="tree-leaf primary">✓ 是 → 全职用工（劳动合同）</div>
                <div class="tree-leaf-sub">  └ 社保 + 公积金（按入职首月实际薪酬申报）</div>
                <div class="tree-leaf-sub">  └ 单一合同主体，不能挂店</div>
                <div class="tree-leaf-sub">  └ 有常乐豆（仅消费，离职时全部提现）</div>
                <div class="tree-leaf muted">  ✗ 否 ↓</div>
              </div>
              <div class="tree-question">Q3: 临时/项目制用工？</div>
              <div class="tree-children">
                <div class="tree-leaf primary">✓ 是 → 兼职用工（劳务合作）</div>
                <div class="tree-leaf-sub">  └ 雇主险（公司全额）</div>
                <div class="tree-leaf-sub">  └ 多主体倒序申报（应税金额大者先报，可能跳档）</div>
                <div class="tree-leaf-sub">  └ 无常乐豆、无社保、无公积金</div>
                <div class="tree-leaf muted">  ✗ 否 → 全职用工（默认）</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h3>推拿师特殊处理</h3>
          <div class="decision-tree">
            <div class="tree-node root">推拿师入职</div>
            <div class="tree-children">
              <div class="tree-question">Q: 推拿师等级 Lv？</div>
              <div class="tree-children">
                <div class="tree-leaf primary">Lv1 ~ Lv2</div>
                <div class="tree-leaf-sub">  └ 享受营销折扣获豆 + 回头客补贴（常乐豆形式）</div>
                <div class="tree-leaf-sub">  └ 可转非全日制（按非全日制规则）</div>
                <div class="tree-leaf primary">Lv3+</div>
                <div class="tree-leaf-sub">  └ <strong>不再发放</strong>营销折扣补贴 + 回头客补贴</div>
                <div class="tree-leaf-sub">  └ <strong>不接受</strong>转非全日制（保持全职）</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h3>多主体兼职场景（1 门店 = 1 主体）</h3>
          <div class="decision-tree">
            <div class="tree-node root">兼职员工在 N 个门店产生业绩</div>
            <div class="tree-children">
              <div class="tree-question">Q: 个税申报顺序？</div>
              <div class="tree-children">
                <div class="tree-leaf primary">应税金额倒序申报（大者先报）</div>
                <div class="tree-leaf-sub">  └ 每门店独立计算预扣个税（每周 3%）</div>
                <div class="tree-leaf-sub">  └ 月末百旺服务累计计算实际税额</div>
                <div class="tree-leaf-sub">  └ 申报门店 = 补缴 / 退税主体</div>
                <div class="tree-leaf-sub">  └ 每门店最后一周工资条包含汇算补缴/退税</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { ElMessage } from 'element-plus'

const copyToClipboard = async () => {
  const element = document.querySelector('.content-section')
  if (!element) {
    ElMessage.error('复制失败：未找到内容区域')
    return
  }
  try {
    const htmlContent = element.innerHTML
    const textContent = element.innerText
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const clipboardItem = new ClipboardItem({
      'text/html': blob,
      'text/plain': new Blob([textContent], { type: 'text/plain' })
    })
    await navigator.clipboard.write([clipboardItem])
    ElMessage.success('已复制到剪贴板，可直接粘贴到飞书')
  } catch (error) {
    try {
      await navigator.clipboard.writeText(element.innerText)
      ElMessage.success('已复制纯文本到剪贴板（部分格式可能丢失）')
    } catch {
      ElMessage.error('复制失败，请手动选择内容复制')
    }
  }
}

const exportToPdf = async () => {
  const element = document.querySelector('.content-section')
  if (!element) {
    ElMessage.error('导出失败：未找到内容区域')
    return
  }
  try {
    const canvas = await html2canvas(element, { scale: 2, useCORS: true })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 190
    const pageHeight = 277
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 10

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }
    pdf.save('V2产品说明.pdf')
    ElMessage.success('PDF 导出成功')
  } catch (error) {
    ElMessage.error('导出失败，请重试')
    console.error(error)
  }
}
</script>

<style scoped>
.v2-guide {
  padding: 0;
}

.page-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.page-header-left {
  flex: 1;
}

.page-header-right {
  flex-shrink: 0;
  margin-left: 20px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: hsl(var(--foreground));
}

.page-header .tip {
  color: hsl(var(--muted-foreground));
  font-size: 14px;
  margin: 0;
}

.content-section {
  background: hsl(var(--background));
  border-radius: 8px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.section {
  margin-bottom: 40px;
}

.section h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid hsl(var(--primary));
}

.card {
  background: hsl(var(--muted) / 0.3);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
}

.card h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.version-log {
  background: linear-gradient(135deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--primary) / 0.03) 100%);
  border: 1px solid hsl(var(--primary) / 0.2);
}

.version-log h2 {
  margin: 0 0 12px 0;
  font-size: 18px;
  border-bottom: none;
  padding-bottom: 0;
}

.version-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.version-tag {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
}

.version-date {
  color: hsl(var(--muted-foreground));
  font-size: 13px;
}

.version-log h3 {
  font-size: 14px;
  font-weight: 600;
  margin: 16px 0 8px 0;
  color: hsl(var(--primary));
}

.version-log ul {
  margin: 0;
  padding-left: 20px;
}

.version-log li {
  margin-bottom: 6px;
  font-size: 14px;
  line-height: 1.5;
}

.conclusions {
  color: hsl(var(--foreground));
}

.conclusions li strong {
  color: hsl(var(--primary));
}

.architecture-card h2 {
  margin: 0 0 16px 0;
  font-size: 18px;
  border-bottom: none;
  padding-bottom: 0;
}

.architecture-diagram {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 0;
}

.arch-layer {
  width: 100%;
  max-width: 700px;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.arch-layer-title {
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin-bottom: 8px;
}

.arch-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-start;
}

.arch-item {
  padding: 6px 12px;
  background: hsl(var(--muted));
  border-radius: 4px;
  font-size: 13px;
  color: hsl(var(--foreground));
}

.arch-item.highlight {
  background: hsl(var(--primary) / 0.15);
  color: hsl(var(--primary));
  font-weight: 500;
}

.arch-arrow {
  font-size: 20px;
  color: hsl(var(--muted-foreground));
  line-height: 1;
}

.toc {
  background: hsl(var(--muted) / 0.3);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.toc h2 {
  margin: 0 0 12px 0;
  font-size: 18px;
}

.toc ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc li {
  margin-bottom: 8px;
}

.toc a {
  color: hsl(var(--primary));
  text-decoration: none;
}

.toc a:hover {
  text-decoration: underline;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  font-size: 14px;
}

.data-table th,
.data-table td {
  border: 1px solid hsl(var(--border));
  padding: 10px 12px;
  text-align: left;
}

.data-table th {
  background: hsl(var(--muted));
  font-weight: 600;
}

.note {
  margin-top: 12px;
  padding: 12px;
  background: hsl(var(--primary) / 0.1);
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.6;
}

.feature-list {
  margin: 12px 0;
  padding-left: 20px;
}

.feature-list li {
  margin-bottom: 8px;
}

.flow {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 16px 0;
  overflow-x: auto;
}

.flow-step {
  flex: 1;
  min-width: 180px;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  padding: 16px;
}

.flow-step .step-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
  color: hsl(var(--primary));
}

.flow-step .step-content {
  font-size: 13px;
}

.flow-step .step-content p {
  margin: 4px 0;
}

.flow-step .step-content ul {
  margin: 8px 0;
  padding-left: 16px;
}

.flow-step .step-content li {
  margin-bottom: 4px;
}

.flow-arrow {
  font-size: 24px;
  color: hsl(var(--muted-foreground));
  line-height: 80px;
  flex-shrink: 0;
}

.example {
  font-size: 14px;
}

.calc-steps {
  margin: 12px 0;
  padding-left: 20px;
}

.calc-steps li {
  margin-bottom: 6px;
}

.highlight {
  color: hsl(var(--primary));
  font-weight: 600;
}

/* 决策树 */
.decision-tree {
  font-size: 14px;
  line-height: 1.8;
}

.tree-node {
  display: inline-block;
  background: hsl(var(--muted) / 0.3);
  border-radius: 6px;
  padding: 8px 14px;
  font-weight: 500;
  margin: 4px 0;
}

.tree-node.root {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  font-weight: 600;
  font-size: 15px;
  border-radius: 8px;
}

.tree-children {
  margin-left: 20px;
  border-left: 2px dashed hsl(var(--border));
  padding-left: 16px;
  margin-top: 8px;
  margin-bottom: 8px;
}

.tree-question {
  color: hsl(var(--foreground));
  font-style: italic;
  font-weight: 500;
  margin: 10px 0 6px 0;
  font-size: 14px;
}

.tree-question::before {
  content: '◆ ';
  color: hsl(var(--primary));
  font-style: normal;
}

.tree-leaf {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
  padding: 6px 12px;
  margin: 4px 0;
  display: inline-block;
  font-size: 13px;
}

.tree-leaf.primary {
  background: hsl(var(--primary) / 0.1);
  border-color: hsl(var(--primary));
  color: hsl(var(--primary));
  font-weight: 600;
}

.tree-leaf.muted {
  color: hsl(var(--muted-foreground));
  font-style: italic;
}

.tree-leaf-sub {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  padding: 2px 0;
  display: block;
}

/* 状态机 */
.state-machine {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 20px 0;
}

.state-machine.secondary {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed hsl(var(--border));
}

.state-node {
  background: hsl(var(--background));
  border: 2px solid hsl(var(--primary));
  border-radius: 10px;
  padding: 14px 20px;
  text-align: center;
  min-width: 110px;
  font-weight: 600;
  font-size: 14px;
  box-shadow: var(--shadow-sm);
}

.state-node small {
  display: block;
  font-weight: 400;
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  margin-top: 2px;
  font-family: monospace;
}

.state-node.initial {
  background: hsl(var(--primary) / 0.1);
  border-color: hsl(var(--primary));
}

.state-node.terminal {
  background: hsl(var(--success) / 0.1);
  border-color: hsl(var(--success));
  color: hsl(var(--success));
}

.state-node.error {
  background: hsl(var(--destructive) / 0.1);
  border-color: hsl(var(--destructive));
  color: hsl(var(--destructive));
}

.state-arrow {
  color: hsl(var(--muted-foreground));
  font-size: 20px;
  font-weight: 700;
}

/* ER 图 */
.er-diagram {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
  padding: 8px 0;
}

.er-entity {
  background: hsl(var(--background));
  border: 2px solid hsl(var(--primary));
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.er-entity-name {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  padding: 8px 12px;
  font-weight: 600;
  text-align: center;
  font-size: 14px;
}

.er-entity-fields {
  padding: 8px 12px;
  font-size: 12px;
  line-height: 1.6;
}

.er-entity-fields .pk {
  color: hsl(var(--primary));
  font-weight: 600;
}

.er-entity-fields div {
  padding: 1px 0;
  font-family: monospace;
  color: hsl(var(--foreground));
}

/* 泳道图 */
.swimlane-container {
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  overflow: hidden;
  margin: 16px 0;
}

.swimlane-row {
  display: flex;
  border-bottom: 1px solid hsl(var(--border));
}

.swimlane-row:last-child {
  border-bottom: none;
}

.swimlane-row.highlight-row {
  background: hsl(var(--primary) / 0.05);
}

.swimlane-row.split-row {
  background: hsl(var(--muted) / 0.3);
}

.swimlane-lane {
  width: 100px;
  flex-shrink: 0;
  background: hsl(var(--primary) / 0.1);
  padding: 16px 8px;
  text-align: center;
  font-weight: 600;
  font-size: 13px;
  border-right: 1px solid hsl(var(--border));
  display: flex;
  align-items: center;
  justify-content: center;
}

.swimlane-content {
  flex: 1;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.swimlane-arrow {
  text-align: center;
  font-size: 18px;
  color: hsl(var(--muted-foreground));
  padding: 4px 0;
  background: hsl(var(--muted) / 0.2);
}

.flow-step-inline {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 13px;
  display: inline-block;
  align-self: flex-start;
}

.flow-step-inline.primary {
  background: hsl(var(--primary) / 0.15);
  border-color: hsl(var(--primary));
  color: hsl(var(--primary));
  font-weight: 600;
}

.flow-step-inline.muted {
  color: hsl(var(--muted-foreground));
  background: transparent;
  border-style: dashed;
}

.split-content {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 8px;
}

.split-item {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
  padding: 8px 12px;
}

.split-title {
  font-weight: 600;
  font-size: 13px;
  color: hsl(var(--primary));
  margin-bottom: 2px;
}

.split-desc {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  line-height: 1.5;
}

.data-table code {
  background: hsl(var(--muted) / 0.5);
  padding: 1px 6px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 12px;
  color: hsl(var(--primary));
}
</style>