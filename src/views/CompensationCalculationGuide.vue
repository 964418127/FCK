<template>
  <div class="compensation-guide">
    <div class="page-header">
      <div class="page-header-left">
        <h1>产品需求说明</h1>
        <p class="tip">💡 详细说明全职/兼职的薪酬项配置、计算节点、工资条组装流程</p>
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
          <span class="version-tag">v1.2</span>
          <span class="version-date">2026-05-22</span>
        </div>
        <h3>核心调整</h3>
        <ul>
          <li><strong>新增薪酬项计算层级</strong>：第1级（基础收入/扣缴）、第2级（依赖第1级的补充项）、系统项（按月计算）</li>
          <li><strong>支持兼职个税预扣+汇算模式</strong>：每周预扣3%，月末百旺服务计算实际税额，多退少补</li>
          <li><strong>新增负工资抵扣规则</strong>：触发条件、抵扣优先级、负数累加机制</li>
          <li><strong>统一全职/兼职计算模型</strong>：分层计算，统一负工资处理</li>
        </ul>
        <h3>岗位薪酬模板</h3>
        <ul class="key-points">
          <li>组成：<strong>自定义薪酬项</strong>（第1/2级）+ <strong>系统项</strong>（预扣、个税、社保、公积金）+ <strong>默认动态部分</strong>（负工资抵扣、个税补退）</li>
          <li>系统项（社保/公积金/个税）按月计算，按工资条分配</li>
        </ul>
        <h3>要点</h3>
        <ul class="conclusions">
          <li>负工资是历史欠款，<strong>抵扣优先级最低</strong>（在所有收入和系统项之后）</li>
          <li>兼职个税采用<strong>预扣+汇算</strong>模式，而非直接计算</li>
          <li>收入不足导致负数时，<strong>不交个税、不抵扣负工资</strong>，负数累加到余额</li>
          <li>离职正式员工工资条不够扣时，<strong>从常乐豆继续扣除</strong></li>
        </ul>
      </div>

      <!-- 目录 -->
      <div class="toc">
        <h2>目录</h2>
        <ul>
          <li><a href="#version">版本日志</a></li>
          <li><a href="#terms">名词解释</a></li>
          <li><a href="#summary">一、整体概述</a></li>
          <li><a href="#template">二、岗位薪酬模板</a></li>
          <li><a href="#items">四、薪酬项范围</a></li>
          <li><a href="#calculation">五、计算节点与时机</a></li>
          <li><a href="#examples">六、计算示例</a></li>
          <li><a href="#payroll">七、工资条组装</a></li>
        </ul>
      </div>

      <!-- 名词解释 -->
      <div id="terms" class="section" style="margin-top: 24px;">
        <div class="card" style="background: hsl(var(--muted) / 0.3);">
          <h3 style="margin-bottom: 12px;">名词解释</h3>
          <div style="font-size: 13px; line-height: 1.8;">
            <div style="margin-bottom: 8px;"><strong>负工资</strong>：员工历史结算周期欠公司的款项，记录在独立余额中，只有应发 &gt; 0 时才能抵扣</div>
            <div style="margin-bottom: 8px;"><strong>应税收入</strong>：薪酬项 - 扣缴项（如投诉扣款），即提交报税的收入基数，社保/公积金不减除</div>
            <div style="margin-bottom: 8px;"><strong>预扣个税</strong>：兼职每周工资条预扣3%，公式 = 应税收入 × 3%，累计作为已预扣合计</div>
            <div style="margin-bottom: 8px;"><strong>代扣个税汇算</strong>：月末百旺服务基于应税收入计算实际税额，与已预扣合计比较，多退少补</div>
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
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); margin-bottom: 6px;">3个工资条/月</div>
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
                <!-- 兼职模板 -->
                <div style="padding: 8px 10px; background: hsl(var(--primary) / 0.05); border: 1px solid hsl(var(--primary) / 0.15); border-radius: 4px;">
                  <div style="font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 6px;">兼职模板（劳务合作）</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); margin-bottom: 6px;">4个周工资条/月 + 汇算调整</div>
                  <div style="margin-bottom: 4px;">
                    <span style="font-size: 12px; color: hsl(var(--muted-foreground));">第1级：</span>
                    <span class="arch-item" style="margin: 2px;">计件提成</span>
                    <span class="arch-item" style="margin: 2px;">超产值奖金</span>
                    <span class="arch-item" style="margin: 2px;">超时加班费</span>
                    <span class="arch-item" style="margin: 2px;">投诉扣款</span>
                  </div>
                  <div style="margin-bottom: 4px;">
                    <span style="font-size: 12px; color: hsl(var(--muted-foreground));">系统项：</span>
                    <span class="arch-item highlight" style="margin: 2px;">个税预扣</span>
                    <span class="arch-item" style="margin: 2px; background: hsl(var(--muted-foreground) / 0.15);">代扣个税</span>
                    <span style="font-size: 11px; color: hsl(var(--muted-foreground)); margin-left: 4px;">（月末触发汇算）</span>
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
                  <span style="color: hsl(var(--muted-foreground)); font-size: 12px;">（劳动合同，每月3个工资条）</span>
                  <div style="margin-top: 4px; font-size: 12px; color: hsl(var(--muted-foreground));">
                    工资条1：计件提成 + 投诉扣款 + 代扣社保　｜　工资条2：超产值奖金 + 超时加班费 + 代扣公积金 + 代扣个税　｜　工资条3：保底获豆
                  </div>
                </div>
                <div>
                  <span style="font-weight: 600; color: hsl(var(--foreground));">兼职</span>
                  <span style="color: hsl(var(--muted-foreground)); font-size: 12px;">（劳务合作，每月4个周工资条）</span>
                  <div style="margin-top: 4px; font-size: 12px; color: hsl(var(--muted-foreground));">
                    周工资条1~4：计件提成 + 超产值奖金 + 超时加班费 + 投诉扣款
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
                  <span style="color: hsl(var(--muted-foreground)); font-size: 13px;"> — 补充收入项，依赖第1级</span>
                  <div style="margin-top: 4px; font-size: 13px;">保底获豆（全职）</div>
                </div>
                <div style="margin-bottom: 8px; padding-left: 12px; border-left: 3px solid hsl(var(--muted-foreground));">
                  <span style="font-weight: 700; color: hsl(var(--foreground));">系统项</span>
                  <span style="color: hsl(var(--muted-foreground)); font-size: 13px;"> — 第1/2级计算完成后执行，每月只计算一次</span>
                  <div style="margin-top: 4px; font-size: 13px;">代扣社保、代扣公积金、代扣个税、<strong>个税预扣</strong>（兼职）</div>
                </div>
                <div style="padding-left: 12px; border-left: 3px solid hsl(var(--primary) / 0.5); background: hsl(var(--primary) / 0.05); border-radius: 4px; padding: 8px 12px;">
                  <span style="font-weight: 700; color: hsl(var(--primary));">条件触发（计算后加入工资条）</span>
                  <div style="font-size: 13px; margin-top: 4px;">
                    <span style="color: hsl(var(--foreground);">代扣个税</span>
                    <span style="color: hsl(var(--muted-foreground));">（月末汇算） → 工资条加入</span>
                    <span style="color: hsl(var(--primary); font-weight: 600;">个税补缴</span>
                    <span style="color: hsl(--muted-foreground);">（少缴）或</span>
                    <span style="color: hsl(var(--primary); font-weight: 600;">个税退税</span>
                    <span style="color: hsl(--muted-foreground);">（多缴）</span>
                  </div>
                  <div style="font-size: 13px; margin-top: 4px;">
                    <span style="color: hsl(var(--foreground);">负工资抵扣</span>
                    <span style="color: hsl(--muted-foreground);"> → 工资条加入</span>
                    <span style="color: hsl(var(--primary); font-weight: 600;">负工资抵扣</span>
                    <span style="color: hsl(--muted-foreground);">（扣减负工资余额）</span>
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
                  <span style="font-weight: 600;">全职工资条1~3</span>
                  <span style="color: hsl(var(--muted-foreground));"> — 基础项 + 系统项</span>
                  <div style="margin-top: 2px;">计件提成/超产值奖金/超时加班费 + 投诉扣款 + 代扣社保/公积金/个税</div>
                  <div style="margin-top: 2px; color: hsl(var(--primary);">→ 条件触发：负工资抵扣（应发 &gt; 0 且有余额时）</div>
                </div>
                <div style="margin-bottom: 8px; padding: 6px 10px; background: hsl(var(--background)); border-radius: 4px;">
                  <span style="font-weight: 600;">兼职周工资条1~3</span>
                  <span style="color: hsl(var(--muted-foreground));"> — 基础项</span>
                  <div style="margin-top: 2px;">计件提成 + 超产值奖金 + 超时加班费 + 投诉扣款</div>
                  <div style="margin-top: 2px; color: hsl(var(--primary);">→ 计算后加入：个税预扣（系统项）、负工资抵扣（触发时）</div>
                </div>
                <div style="padding: 6px 10px; background: hsl(var(--primary) / 0.08); border: 1px solid hsl(var(--primary) / 0.2); border-radius: 4px;">
                  <span style="font-weight: 600;">兼职周工资条4（最后一周）</span>
                  <span style="color: hsl(var(--muted-foreground));"> — 基础项</span>
                  <div style="margin-top: 2px;">计件提成 + 超产值奖金 + 超时加班费 + 投诉扣款</div>
                  <div style="margin-top: 2px; color: hsl(var(--primary);">→ 计算后加入：个税预扣（系统项）、代扣个税计算、负工资抵扣（触发时）</div>
                </div>
                <div style="padding: 6px 10px; background: hsl(var(--primary) / 0.08); border: 1px solid hsl(var(--primary) / 0.2); border-radius: 4px; margin-top: 4px;">
                  <span style="font-weight: 600;">兼职个税汇算（月末）</span>
                  <span style="color: hsl(var(--muted-foreground));"> — 代扣个税（汇算结果）</span>
                  <div style="margin-top: 2px; color: hsl(var(--primary);">→ 工资条加入：<strong>个税补缴</strong>（少缴）或<strong>个税退税</strong>（多缴）</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h3>计算周期</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>类型</th>
                <th>计算周期</th>
                <th>工资条数量</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>兼职（劳务合作）</td>
                <td>每周1次</td>
                <td>1个工资条/次</td>
              </tr>
              <tr>
                <td>全职（劳动合同）</td>
                <td>每月1次</td>
                <td>3个工资条/月</td>
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
                <td>补充收入项，依赖第1级结果（如保底获豆）</td>
                <td>每工资条计算</td>
              </tr>
              <tr>
                <td>系统项</td>
                <td>代扣社保、代扣公积金（全职）、个税预扣、代扣个税汇算（兼职）</td>
                <td>第1/2级完成后执行，每月只计算一次</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="card">
          <h3>负工资抵扣</h3>
          <p>负工资是员工/兼职在历史结算周期中欠公司的款项，记录在独立的负工资余额中。</p>
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

      <!-- 二、岗位薪酬模板 -->
      <div id="template" class="section">
        <h2>二、岗位薪酬模板</h2>
        <div class="card">
          <h3>模板项类型</h3>
          <p>薪酬模板由以下类型组成：</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>类型</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>薪酬项</td>
                <td>收入类，如：计件提成、超产值奖金、保底获豆</td>
              </tr>
              <tr>
                <td>扣缴项</td>
                <td>扣款类，如：投诉扣款</td>
              </tr>
              <tr>
                <td>代扣社保</td>
                <td>社保扣缴（全职）</td>
              </tr>
              <tr>
                <td>代扣公积金</td>
                <td>公积金扣缴（全职）</td>
              </tr>
              <tr>
                <td>预扣个税</td>
                <td>系统项，每次工资条计算时预扣（兼职：每周；全职：按规则）</td>
              </tr>
              <tr>
                <td>代扣个税</td>
                <td>月末汇算后生成退税/补缴，作为汇算结果载体（仅1个工资条）</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 兼职模板 -->
        <div class="card">
          <h3>兼职模板（劳务合作）</h3>
          <p><strong>计算周期：</strong>每周1次，1个工资条/次</p>
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
                <td>个税预扣</td>
                <td>预扣个税</td>
                <td>系统项（随工资条计算）</td>
              </tr>
              <tr>
                <td>汇算结果</td>
                <td>个税退税 / 个税补缴</td>
                <td>代扣个税</td>
                <td>系统项（月末汇算）</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>系统项：</strong>只有代扣个税（无社保、无公积金）<br/><br/>
            <strong>预扣个税：</strong>在每个工资条中预扣，公式 = (全部收入之和 - 全部扣缴之和) × 3%<br/>
            &nbsp;&nbsp;&nbsp;- 全部收入 = 第1级收入 + 第2级收入（如有）<br/>
            &nbsp;&nbsp;&nbsp;- 全部扣缴 = 第1级扣缴 + 第2级扣缴（如有）<br/>
            &nbsp;&nbsp;&nbsp;- 每周独立计算，每个工资条各自生成预扣金额<br/>
            &nbsp;&nbsp;&nbsp;- 预扣金额累计，记为"已预扣合计"<br/><br/>
            <strong>代扣个税（多退少补）：</strong>仅出现在月末汇算工资条中<br/>
            &nbsp;&nbsp;&nbsp;- 百旺服务根据当月总收入计算实际应缴税额<br/>
            &nbsp;&nbsp;&nbsp;- 差值 = 实际税额 - 已预扣合计<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;› 若差值 &gt; 0（少缴）：生成<strong>个税补缴</strong>（扣缴项，负值）<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;› 若差值 &lt; 0（多缴）：生成<strong>个税退税</strong>（收入项，正值）<br/>
            &nbsp;&nbsp;&nbsp;- 汇算工资条中只会出现其中一项，由计算结果决定<br/>
            &nbsp;&nbsp;&nbsp;- 代扣个税本身仅作为汇算结果载体，实际金额由百旺服务决定
          </div>
        </div>

        <!-- 全职模板 -->
        <div class="card">
          <h3>全职模板（劳动合同）</h3>
          <p><strong>计算周期：</strong>每月1次，3个工资条/月</p>
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
                <td>固定</td>
              </tr>
              <tr>
                <td>代扣公积金</td>
                <td>代扣公积金</td>
                <td>固定</td>
              </tr>
              <tr>
                <td>代扣个税</td>
                <td>代扣个税</td>
                <td>固定</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>系统项：</strong>代扣社保、代扣公积金、代扣个税（按月计算，按工资条分配）<br/>
            <strong>无预扣个税：</strong>全职个税直接使用百旺服务计算，不再预扣
          </div>
        </div>
      </div>

      <!-- 三、工资条组成 -->
      <div id="payslips" class="section">
        <h2>三、工资条组成</h2>
        <div class="note" style="margin-bottom: 16px;">
          <strong>说明：</strong>以下为示例展示，业务侧通过工资单配置决定实际薪酬项分配
        </div>

        <!-- 兼职工资条 -->
        <div class="card">
          <h3>兼职工资条（每周）</h3>
          <p>每周计算1次，每次生成1个工资条：</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>工资条</th>
                <th>包含薪酬项</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>周工资条</td>
                <td>计件提成 + 超产值奖金 + 超时加班费 + 投诉扣款 + 预扣个税</td>
                <td>预扣个税 = (收入 - 扣缴项) × 3%</td>
              </tr>
            </tbody>
          </table>
          <p><strong>月末生成汇算工资条：</strong></p>
          <table class="data-table">
            <thead>
              <tr>
                <th>工资条</th>
                <th>包含薪酬项</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>汇算工资条</td>
                <td>个税退税 或 个税补缴</td>
                <td>
                  实际税额由百旺服务计算<br/>
                  补缴 = 实际税额 - 已预扣合计（&gt;0 生成补缴）<br/>
                  退税 = 已预扣合计 - 实际税额（&lt;0 生成退税）
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 全职工资条 -->
        <div class="card">
          <h3>全职工资条（每月）</h3>
          <p>每月计算1次，每次生成3个工资条：</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>工资条</th>
                <th>包含薪酬项</th>
                <th>说明</th>
              </tr>
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
          <div class="note">业务侧通过工资单配置决定薪酬项分配到哪个工资条</div>
        </div>
      </div>

      <!-- 四、薪酬项范围 -->
      <div id="items" class="section">
        <h2>四、薪酬项范围</h2>

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
                <td>系统项（随工资条）</td>
                <td>个税预扣</td>
                <td>预扣个税</td>
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
      </div>

      <!-- 五、计算节点与时机 -->
      <div id="calculation" class="section">
        <h2>五、计算节点与时机</h2>

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
                  <li>超产值奖金（收入）</li>
                  <li>超时加班费（收入）</li>
                  <li>投诉扣款（扣缴）</li>
                </ul>
                <p><strong>产出：</strong>4项金额</p>
              </div>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <div class="step-title">系统项（个税预扣）</div>
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
                <p><strong>产出：</strong>个税退税（收入）或个税补缴（扣缴）</p>
                <p><strong>载体：</strong>汇算工资条</p>
              </div>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-step">
              <div class="step-title">负工资抵扣</div>
              <div class="step-content">
                <p><strong>时机：</strong>每工资条计算后（应发 &gt; 0 且存在负工资余额）</p>
                <p><strong>优先级：</strong></p>
                <ul>
                  <li>收入 - 扣缴项 → 代扣个税 → 有剩余 → 抵扣负工资余额</li>
                  <li>结果 ≤ 0 → 无负工资抵扣</li>
                </ul>
                <p><strong>说明：</strong>兼职无社保公积金，按优先级累加后判断</p>
              </div>
            </div>
          </div>
        </div>

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
                <p><strong>说明：</strong>3项都每月只计算一次，按工资条分配</p>
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
                <p><strong>说明：</strong>若应税收入 ≤ 0，百旺不计算个税；若工资条应发 ≤ 0，无法抵扣负工资</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 六、计算示例 -->
      <div id="examples" class="section">
        <h2>六、计算示例</h2>

        <!-- 兼职示例 -->
        <div class="card">
          <h3>兼职示例（单周工资条 + 月末汇算）</h3>
          <div class="example">
            <p><strong>员工当月4周数据：</strong></p>
            <table class="data-table">
              <thead>
                <tr><th>周次</th><th>计件提成</th><th>超产值奖金</th><th>超时加班费</th><th>投诉扣款</th><th>预扣个税</th></tr>
              </thead>
              <tbody>
                <tr><td>第1周</td><td>+5000</td><td>+1500</td><td>+300</td><td>-100</td><td>(5000+1500+300-100)×3%=201</td></tr>
                <tr><td>第2周</td><td>+4500</td><td>+2000</td><td>+400</td><td>0</td><td>(4500+2000+400-0)×3%=207</td></tr>
                <tr><td>第3周</td><td>+6000</td><td>+1800</td><td>+500</td><td>-200</td><td>(6000+1800+500-200)×3%=243</td></tr>
                <tr><td>第4周</td><td>+5500</td><td>+2200</td><td>+400</td><td>0</td><td>(5500+2200+400-0)×3%=243</td></tr>
              </tbody>
            </table>
            <p><strong>月末汇算：</strong></p>
            <ul class="calc-steps">
              <li>已预扣合计 = 201 + 207 + 243 + 243 = <strong>894</strong></li>
              <li>百旺实际税额 = <strong>1200</strong></li>
              <li>补缴 = 1200 - 894 = <strong>306</strong>（&gt;0，生成个税补缴）</li>
            </ul>
            <p><strong>汇算工资条：个税补缴 = -306</strong></p>
          </div>
        </div>

        <!-- 全职示例 -->
        <div class="card">
          <h3>全职示例（单月全部工资条汇总，含负工资抵扣）</h3>
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
                <tr><td>保底获豆</td><td>+0</td><td>第2级收入（第1级收入超过最低工资标准）</td></tr>
                <tr><td>代扣社保</td><td>-800</td><td>系统项</td></tr>
                <tr><td>代扣公积金</td><td>-600</td><td>系统项</td></tr>
                <tr><td>代扣个税</td><td>-57</td><td>系统项（百旺计算）</td></tr>
                <tr><td>负工资余额</td><td>-2000</td><td>历史欠款</td></tr>
              </tbody>
            </table>
            <p><strong>计算顺序：</strong></p>
            <ul class="calc-steps">
              <li>收入合计 = 6000 + 2000 + 500 = <strong>8500</strong></li>
              <li>应税收入 = 8500 - 投诉扣款(200) = <strong>8300</strong>（报税基数，社保/公积金不减除）</li>
              <li>百旺计算代扣个税 = <strong>57</strong>（基于8300计算）</li>
              <li>工资条扣款：代扣社保(800) + 代扣公积金(600) + 代扣个税(57)</li>
              <li>工资条应发 = 8500 - 200 - 800 - 600 - 57 = <strong>6843</strong></li>
              <li>6843 > 0，可抵扣负工资：min(6843, 2000) = <strong>2000</strong></li>
            </ul>
            <p><strong>结果：</strong></p>
            <ul>
              <li>实发金额 = 6843 - 2000 = <strong>4843</strong></li>
              <li>剩余负工资余额 = 2000 - 2000 = <strong>0</strong></li>
            </ul>
          </div>
        </div>

        <!-- 全职示例：收入不足场景 -->
        <div class="card">
          <h3>全职示例（收入不足，负数累加，无个税）</h3>
          <div class="example">
            <p><strong>员工当月数据：</strong></p>
            <table class="data-table">
              <thead>
                <tr><th>项目</th><th>金额</th><th>说明</th></tr>
              </thead>
              <tbody>
                <tr><td>计件提成</td><td>+1000</td><td>第1级收入（本月业绩差）</td></tr>
                <tr><td>超产值奖金</td><td>+0</td><td>第1级收入</td></tr>
                <tr><td>超时加班费</td><td>+0</td><td>第1级收入</td></tr>
                <tr><td>投诉扣款</td><td>-3000</td><td>第1级扣缴（大额扣款）</td></tr>
                <tr><td>保底获豆</td><td>+7000</td><td>第2级收入（最低工资标准8000 - 第1级收入1000）</td></tr>
                <tr><td>代扣社保</td><td>-800</td><td>系统项</td></tr>
                <tr><td>代扣公积金</td><td>-600</td><td>系统项</td></tr>
                <tr><td>负工资余额</td><td>-500</td><td>历史欠款</td></tr>
              </tbody>
            </table>
            <p><strong>计算顺序：</strong></p>
            <ul class="calc-steps">
              <li>第1级收入 = 1000 + 0 + 0 = <strong>1000</strong></li>
              <li>第2级收入 = 保底获豆 = <strong>7000</strong>（最低工资标准8000 - 第1级收入1000）</li>
              <li>收入合计 = 1000 + 7000 = <strong>8000</strong></li>
              <li>应税收入 = 8000 - 投诉扣款(3000) = <strong>5000</strong>（报税基数）</li>
              <li>百旺计算代扣个税 = <strong>90</strong>（基于5000计算）</li>
              <li>工资条扣款：代扣社保(800) + 代扣公积金(600) + 代扣个税(90)</li>
              <li>工资条应发 = 8000 - 3000 - 800 - 600 - 90 = <strong>3510</strong></li>
              <li>3510 > 0，可抵扣负工资：min(3510, 500) = <strong>500</strong></li>
            </ul>
            <p><strong>结果：</strong></p>
            <ul>
              <li>实发金额 = 3510 - 500 = <strong>3010</strong></li>
              <li>剩余负工资余额 = 500 - 500 = <strong>0</strong></li>
            </ul>
            <div class="note">
              <strong>说明：</strong>当应税收入（收入-扣缴项）≤ 0时，无个税；当工资条应发 ≤ 0时，无法抵扣负工资。负数累加到负工资余额中。
            </div>
          </div>
        </div>
      </div>

      <!-- 七、工资条组装 -->
      <div id="payroll" class="section">
        <h2>七、工资条组装</h2>
        <div class="card">
          <h3>核心原则</h3>
          <ul class="feature-list">
            <li>所有薪酬项和系统项都会计算出值</li>
            <li>业务侧通过工资单配置，决定哪些项进入哪个工资条</li>
            <li>无论怎么分配，所有工资条应发之和 = 员工总净工资</li>
            <li>系统项（社保/公积金/个税）按月计算，按工资条分配</li>
            <li><strong>预扣个税</strong>可在多个工资条中出现，每个工资条各自计算</li>
            <li><strong>代扣个税</strong>只能出现在1个工资条中，作为汇算结果（退税/补缴）的载体</li>
            <li><strong>负工资抵扣</strong>每个工资条都可能触发（应发 &gt; 0 且存在负工资余额时）</li>
          </ul>
        </div>

        <div class="card">
          <h3>多工资条示例（全职）</h3>
          <p><strong>员工当月总收入：</strong></p>
          <ul>
            <li>第1级收入：计件提成(6000) + 超产值奖金(2000) + 超时加班费(500) = 8500</li>
            <li>第1级扣缴：投诉扣款(200)</li>
            <li>第2级收入：保底获豆(0)</li>
            <li>代扣社保：800</li>
            <li>代扣公积金：600</li>
            <li>代扣个税：57</li>
          </ul>
          <p><strong>总净工资 = 8500 - 200 - 800 - 600 - 57 = 6843</strong></p>

          <table class="data-table">
            <thead>
              <tr><th>工资条</th><th>包含项</th><th>收入</th><th>扣缴</th><th>应发</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>工资条1（计件）</td>
                <td>计件提成 + 投诉扣款(200) + 代扣社保(800)</td>
                <td>6000</td>
                <td>200 + 800 = 1000</td>
                <td><strong>5000</strong></td>
              </tr>
              <tr>
                <td>工资条2（奖金）</td>
                <td>超产值奖金 + 超时加班费 + 代扣公积金(600) + 代扣个税(57)</td>
                <td>2000 + 500 = 2500</td>
                <td>600 + 57 = 657</td>
                <td><strong>1843</strong></td>
              </tr>
              <tr>
                <td>工资条3（常乐豆）</td>
                <td>保底获豆</td>
                <td>0</td>
                <td>0</td>
                <td><strong>0</strong></td>
              </tr>
            </tbody>
          </table>
          <p><strong>验证：5000 + 1843 + 0 = 6843 ✅</strong></p>
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
              <tr><td>代扣社保</td><td>-200</td></tr>
              <tr><td>代扣公积金</td><td>-200</td></tr>
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
    // 获取 HTML 内容
    const htmlContent = element.innerHTML
    // 获取纯文本内容（作为备用）
    const textContent = element.innerText

    // 使用 Clipboard API 复制富文本
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const clipboardItem = new ClipboardItem({
      'text/html': blob,
      'text/plain': new Blob([textContent], { type: 'text/plain' })
    })
    await navigator.clipboard.write([clipboardItem])
    ElMessage.success('已复制到剪贴板，可直接粘贴到飞书')
  } catch (error) {
    // 如果富文本复制失败，尝试纯文本复制
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
    pdf.save('产品需求说明.pdf')
    ElMessage.success('PDF 导出成功')
  } catch (error) {
    ElMessage.error('导出失败，请重试')
    console.error(error)
  }
}
</script>

<style scoped>
.compensation-guide {
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

.key-points {
  color: hsl(var(--foreground));
}

.core-concepts {
  color: hsl(var(--foreground));
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
  max-width: 600px;
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

.arch-desc {
  margin-top: 8px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
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
}

.flow-step {
  flex: 1;
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
</style>
