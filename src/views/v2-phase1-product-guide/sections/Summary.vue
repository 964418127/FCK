<template>
      <div id="summary" class="section">
        <h2>一、整体概述</h2>

        <!-- 核心流程（9 步全链路） -->
        <div class="card architecture-card">
          <h2>核心流程（端到端全链路）</h2>
          <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary)); margin-bottom: 16px; font-size: 13px;">
            <strong>宏观全链路：</strong>1.<s>定义岗位</s> <strong>本阶段跳过（走老系统）</strong> → 2.配置岗位薪酬模板 → 3.发放策略配置 → 4.<s>招聘入职</s> <strong>本阶段跳过（走老系统）</strong> → 5.<s>员工福利保障关系建立</s> <strong>本阶段跳过</strong> → 6.薪酬计算 → 7.<s>员工福利保障月度明细生成</s> <strong>改从老系统接口读取 + 升级计算（公积金抵扣 / 多主体报税）</strong> → 8.工资条生成 → 9.工资发放（<strong>通知确认 → 付款单 → 银行打款</strong>）<br/>
            <strong>阶段划分：</strong>① 配置阶段（步骤 2-3，HR 配置规则） ② 触发阶段（步骤 1、4、5 全部走老系统） ③ 执行阶段（步骤 6-9，每结算周期：计算收入 → 老系统读取<strong>社保</strong> + 升级计算<strong>公积金抵扣（全职）</strong> / <strong>多主体倒序报税（非全日制/兼职）</strong> → 生成工资条 → <strong>通知确认 + 付款单 + 发放</strong>）
          </div>

          <div class="architecture-diagram">
            <!-- 步骤1：定义岗位（v2-1 跳过） -->
            <div class="arch-layer" style="opacity: 0.5;">
              <div class="arch-layer-title">1. ~~定义岗位~~ <span style="font-size: 12px; font-weight: 400; color: hsl(var(--warning));">— v2-1 跳过（走老系统）</span></div>
              <div style="font-size: 13px; line-height: 1.8; text-align: left;">
                <div style="padding: 8px 10px; background: hsl(var(--warning) / 0.05); border: 1px solid hsl(var(--warning) / 0.2); border-radius: 4px;">
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); line-height: 1.8;">
                    <strong>v2 完整版：</strong>HR 在新系统创建岗位基础信息（岗位名称 / 归属部门 / 归属城市 / 用工类型）<br/>
                    <strong>v2-1 阶段：</strong><span style="color: hsl(var(--warning)); font-weight: 600;">不实现</span>——薪酬计算时从<strong>老系统导入人员信息和岗位关联</strong>，本系统不重做岗位维护
                  </div>
                </div>
              </div>
            </div>
            <div class="arch-arrow">↓</div>
            <!-- 步骤2：配置岗位薪酬模板 -->
            <div class="arch-layer">
              <div class="arch-layer-title">2. 配置岗位薪酬模板 <span style="font-size: 12px; font-weight: 400; color: hsl(var(--muted-foreground));">— 薪酬项设计 + 系统项</span></div>
              <div style="font-size: 13px; line-height: 1.8; text-align: left;">
                <div style="margin-bottom: 8px; padding: 8px 10px; background: hsl(var(--background)); border-radius: 4px;">
                  <div style="font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 6px;">全职模板（劳动合同，单一主体）</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); margin-bottom: 4px;">第1级：计件提成、超产值奖金、超时加班费、投诉扣款</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); margin-bottom: 4px;">第2级：保底获豆</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground));">系统项：<strong>代扣社保（金额从老系统接口读取）</strong>｜<strong>代扣公积金（老系统读取 + 常乐豆抵扣升级：剩余部分记为【公积金个人扣款】）</strong>｜代扣个税（综合所得月度累计预扣）</div>
                </div>
                <div style="margin-bottom: 8px; padding: 8px 10px; background: hsl(var(--primary) / 0.05); border: 1px solid hsl(var(--primary) / 0.15); border-radius: 4px;">
                  <div style="font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 6px;">非全日制模板（劳务协议，多主体）</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); margin-bottom: 4px;">第1级：计件提成、超时加班费、投诉扣款</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); margin-bottom: 4px;">第2级：个税预扣（每条 3%）</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground));">系统项：代扣个税（月末汇算）｜商业险（默认机制，<strong>不进工资条</strong>）</div>
                </div>
                <div style="padding: 8px 10px; background: hsl(var(--primary) / 0.08); border: 1px solid hsl(var(--primary) / 0.25); border-radius: 4px;">
                  <div style="font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 6px;">兼职模板（劳务合作，多主体）</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); margin-bottom: 4px;">第1级：计件提成、超时加班费、投诉扣款</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); margin-bottom: 4px;">第2级：个税预扣（每条 3%）</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground));">系统项：代扣个税（月末汇算，<strong>多主体倒序申报</strong>）｜商业险（默认机制，<strong>不进工资条</strong>）</div>
                </div>
              </div>
            </div>
            <div class="arch-arrow">↓</div>
            <!-- 步骤3：发放策略配置 -->
            <div class="arch-layer">
              <div class="arch-layer-title">3. 发放策略配置 <span style="font-size: 12px; font-weight: 400; color: hsl(var(--muted-foreground));">— 工资单定义</span></div>
              <div style="font-size: 13px; line-height: 1.8; text-align: left;">
                <div style="padding: 8px 10px; background: hsl(var(--background)); border-radius: 4px;">
                  <div style="margin-bottom: 6px;"><strong>全职 / 返聘</strong>：每月1次结算，月度N个工资条（示例：3个）｜<strong>单一主体</strong>｜<strong>月度申报</strong></div>
                  <div style="margin-bottom: 6px;"><strong>非全日制 / 兼职</strong>：结算周期可配（示例：周薪制，间隔 ≤15天）｜<strong>每主体独立结算</strong>｜<strong>每周预扣 3%，月末汇算</strong>｜兼职多主体倒序申报</div>
                  <div style="font-size: 12px; color: hsl(var(--primary));">
                    <strong>关键：</strong>每个发放主体（全职/返聘=合同主体，非全日制/兼职=业绩归属主体）下的工资分别发放
                  </div>
                </div>
              </div>
            </div>
            <div class="arch-arrow">↓</div>
            <!-- 步骤4：招聘入职（v2-1 跳过） -->
            <div class="arch-layer" style="opacity: 0.5;">
              <div class="arch-layer-title">4. ~~招聘入职~~ <span style="font-size: 12px; font-weight: 400; color: hsl(var(--warning));">— v2-1 跳过（走老系统）</span></div>
              <div style="font-size: 13px; line-height: 1.8; text-align: left;">
                <div style="padding: 8px 10px; background: hsl(var(--warning) / 0.05); border: 1px solid hsl(var(--warning) / 0.2); border-radius: 4px;">
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); line-height: 1.8;">
                    <strong>v2 完整版：</strong>员工分配到岗位 → 岗位城市确定 → 自动绑定薪酬模板<br/>
                    <strong>v2-1 阶段：</strong><span style="color: hsl(var(--warning)); font-weight: 600;">不实现</span>——招聘入职环节走<strong>老系统</strong>，本系统只负责在薪酬计算时按老系统导入的人员/岗位关联自动应用模板
                  </div>
                </div>
              </div>
            </div>
            <div class="arch-arrow">↓</div>
            <!-- 步骤5：v2-1 跳过 -->
            <div class="arch-layer" style="opacity: 0.5;">
              <div class="arch-layer-title">5. ~~员工福利保障关系建立~~ <span style="font-size: 12px; font-weight: 400; color: hsl(var(--warning));">— v2-1 跳过（无福利关系维护）</span></div>
              <div style="font-size: 13px; line-height: 1.8; text-align: left;">
                <div style="padding: 8px 10px; background: hsl(var(--warning) / 0.05); border: 1px solid hsl(var(--warning) / 0.2); border-radius: 4px;">
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); line-height: 1.8;">
                    <strong>v2 完整版：</strong>入职触发员工 ↔ 申报主体关系建立（继承城市基准系数）<br/>
                    <strong>v2-1 阶段：</strong><span style="color: hsl(var(--warning)); font-weight: 600;">不实现</span>——城市基准系数由老系统维护，本系统不重做
                  </div>
                </div>
              </div>
            </div>
            <div class="arch-arrow">↓</div>
            <!-- 步骤6：薪酬计算 -->
            <div class="arch-layer">
              <div class="arch-layer-title">6. 薪酬计算 <span style="font-size: 12px; font-weight: 400; color: hsl(var(--muted-foreground));">— 计算应发收入（代扣金额在 step 7 读取老系统）</span></div>
              <div style="font-size: 13px; line-height: 1.8; text-align: left;">
                <div style="margin-bottom: 6px; padding-left: 10px; border-left: 3px solid hsl(var(--primary));">
                  <span style="font-weight: 700;">第1级</span> <span style="font-size: 12px; color: hsl(var(--muted-foreground));">— 基础收入/扣缴：</span>计件提成、超产值奖金、超时加班费、投诉扣款
                </div>
                <div style="margin-bottom: 6px; padding-left: 10px; border-left: 3px solid hsl(var(--primary));">
                  <span style="font-weight: 700;">第2级</span> <span style="font-size: 12px; color: hsl(var(--muted-foreground));">— 补充项，依赖第1级：</span>保底获豆（全职）｜个税预扣（非全日制/兼职，每条 3%）
                </div>
                <div style="padding: 6px 10px; border-left: 3px solid hsl(var(--primary) / 0.5); background: hsl(var(--primary) / 0.05); border-radius: 4px; font-size: 13px;">
                  <span style="font-weight: 700; color: hsl(var(--primary));">输出：</span>当月<strong>应发收入合计</strong>确定 → 触发 step 7 读取老系统代扣金额<br/>
                  <span style="font-size: 12px; color: hsl(var(--muted-foreground));">注：代扣金额（社保/公积金/个税）在 step 7 确定，step 6 仅算应发收入</span>
                </div>
              </div>
            </div>
            <div class="arch-arrow">↓</div>
            <!-- 步骤7：读取老系统代扣金额 + 升级计算 -->
            <div class="arch-layer" style="background: hsl(var(--warning) / 0.05); border-color: hsl(var(--warning) / 0.3);">
              <div class="arch-layer-title">7. 读取老系统代扣金额 + 升级计算 <span style="font-size: 12px; font-weight: 400; color: hsl(var(--warning));">— 替代原"福利明细生成"</span></div>
              <div style="font-size: 13px; line-height: 1.8; text-align: left;">
                <div style="margin-bottom: 8px; padding: 8px 10px; background: hsl(var(--background)); border-radius: 4px;">
                  <div style="font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 6px;">① 触发条件</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); line-height: 1.8;">
                    step 6 完成，月度应发收入确定 → 进入"代扣金额确认 + 报税升级"环节
                  </div>
                </div>
                <div style="margin-bottom: 8px; padding: 8px 10px; background: hsl(var(--warning) / 0.05); border: 1px solid hsl(var(--warning) / 0.15); border-radius: 4px;">
                  <div style="font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 6px;">② 老系统接口（只读，<span style="color: hsl(var(--warning));">不进系统计算</span>）</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); line-height: 1.8;">
                    · <strong>代扣社保</strong>（全职）— 来自老系统接口，<strong>原样透传</strong>到工资条<br/>
                    · <strong>代扣公积金</strong>（全职）— 来自老系统接口，作为<strong>基数</strong>进入③升级计算<br/>
                    · <strong>不读取</strong>社保/公积金公司部分（不进员工工资条）<br/>
                    · <strong>不读取</strong>城市基准系数、社保缴费明细、商业险明细
                  </div>
                </div>
                <div style="padding: 8px 10px; background: hsl(var(--primary) / 0.05); border: 1px solid hsl(var(--primary) / 0.2); border-radius: 4px;">
                  <div style="font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 6px;">③ 系统升级计算（<span style="color: hsl(var(--primary));">v2-1 核心新增</span>）</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); line-height: 1.8;">
                    · <strong>公积金抵扣升级</strong>（全职）：常乐豆优先抵扣公积金个人部分 → 剩余部分在工资条记为【<strong>公积金个人扣款</strong>】（与代扣公积金个人部分等同，不参与应税收入）<br/>
                    · <strong>全职工种个税累计预扣</strong>：<strong>系统按公式</strong>（综合所得月度累计预扣法：当月应纳税所得额 × 税率 - 速算扣除数 - 累计已预扣）计算<br/>
                    · <strong>非全日制 / 兼职个税</strong>：每条 3% 预扣（系统按规则，来自 step 6 第2级）+ 月末汇算（<strong>百旺服务返回</strong>实际税额 → 多退少补）<br/>
                    · <strong>兼职多主体报税升级</strong>：跨多主体的员工，<strong>按业绩归属主体倒序依次调用百旺申报</strong>（百旺 1 次仅支持 1 主体），每主体 1 次调用
                  </div>
                </div>
              </div>
            </div>
            <div class="arch-arrow">↓</div>
            <!-- 步骤8：工资条生成 -->
            <div class="arch-layer">
              <div class="arch-layer-title">8. 工资条生成 <span style="font-size: 12px; font-weight: 400; color: hsl(var(--muted-foreground));">— 全部金额就绪 → 应发 - 代扣 = 实发 → 发放</span></div>
              <div style="font-size: 13px; line-height: 1.8; text-align: left;">
                <div style="margin-bottom: 6px; padding: 6px 10px; background: hsl(var(--background)); border-radius: 4px;">
                  <span style="font-weight: 600;">全职工资条 1~N</span> <span style="font-size: 12px; color: hsl(var(--muted-foreground));">— 基础项 + 第2级 + <strong>福利代扣（社保/公积金，老系统读取）</strong> + 个税代扣（汇算后） + 负工资抵扣</span>
                </div>
                <div style="margin-bottom: 6px; padding: 6px 10px; background: hsl(var(--background)); border-radius: 4px;">
                  <span style="font-weight: 600;">非全日制/兼职周工资条 1~N</span> <span style="font-size: 12px; color: hsl(var(--muted-foreground));">— 基础项 + 个税预扣（3%）+ 负工资抵扣</span>
                </div>
                <div style="padding: 6px 10px; background: hsl(var(--primary) / 0.08); border: 1px solid hsl(var(--primary) / 0.2); border-radius: 4px;">
                  <span style="font-weight: 600;">非全日制/兼职月内最后一条工资条</span> <span style="font-size: 12px; color: hsl(var(--muted-foreground));">— 基础项 + 个税预扣 + <strong>个税补缴/退税</strong>（汇算结果作为本条工资条的一项，<strong>不单独生成汇算工资条</strong>）</span>
                </div>
              </div>
            </div>
            <div class="arch-arrow">↓</div>
            <!-- 步骤9：工资发放 -->
            <div class="arch-layer">
              <div class="arch-layer-title">9. 工资发放 <span style="font-size: 12px; font-weight: 400; color: hsl(var(--muted-foreground));">— 通知确认 → 付款单 → 银行打款</span></div>
              <div style="font-size: 13px; line-height: 1.8; text-align: left;">
                <div style="margin-bottom: 8px; padding: 8px 12px; background: hsl(var(--background)); border-radius: 4px;">
                  <span style="font-weight: 600;">① 发放通知单</span> <span style="font-size: 12px; color: hsl(var(--muted-foreground));">— 按工资单批次汇总所有工资条 → 通知员工 <strong>待确认</strong>，截止时间前员工需确认（有问题反馈 HR）；<strong>确认后次日发放</strong></span>
                </div>
                <div style="margin-bottom: 8px; padding: 8px 12px; background: hsl(var(--background)); border-radius: 4px;">
                  <span style="font-weight: 600;">② 付款单生成</span> <span style="font-size: 12px; color: hsl(var(--muted-foreground));">— 在工资单 <strong>应发金额 &gt; 0</strong> 的工资条范围内按<strong>去重维度</strong>聚合；记录字段：<strong>银行实发金额</strong>（数据完整性用），实际打款仍按实发执行</span>
                </div>
                <div style="padding: 8px 12px; background: hsl(var(--primary) / 0.08); border: 1px solid hsl(var(--primary) / 0.2); border-radius: 4px;">
                  <span style="font-weight: 600;">③ 付款单去重维度（5 字段）</span>
                </div>
                <table class="data-table" style="margin: 8px 0 8px 16px; width: calc(100% - 16px); font-size: 12px;">
                  <thead>
                    <tr>
                      <th style="width: 180px;">字段</th>
                      <th>说明</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>姓名</strong></td>
                      <td>员工姓名</td>
                    </tr>
                    <tr>
                      <td><strong>工号</strong></td>
                      <td>员工唯一编号</td>
                    </tr>
                    <tr>
                      <td><strong>工资批次</strong></td>
                      <td>工资单 / 发放通知单号</td>
                    </tr>
                    <tr>
                      <td><strong>合同主体</strong></td>
                      <td>1 门店 = 1 主体；兼职跨多门店时，<strong>每主体 1 条付款单</strong></td>
                    </tr>
                    <tr>
                      <td><strong>薪酬周期</strong></td>
                      <td><strong>自然日期范围</strong>（如 <code>2026-06-01 ~ 2026-06-30</code> / <code>2026-06-01 ~ 2026-06-07</code>），按需指定月/周/旬/半月等</td>
                    </tr>
                  </tbody>
                </table>
                <div style="padding: 8px 12px; background: hsl(var(--background)); border-radius: 4px;">
                  <span style="font-weight: 600;">④ 付款单聚合规则</span>
                </div>
                <ul style="margin: 4px 0 0 16px; font-size: 12px; line-height: 1.8;">
                  <li><strong>1 工资条 = 1 付款单单元</strong>：同一员工同主体同周期内只有 1 个工资条（业务侧控制），无需合并多条工资条</li>
                  <li><strong>应发 ≤ 0 不生成付款单</strong>：应付金额 ≤ 0 的工资条不参与付款（不发钱），例如某员工某周业绩为 0；遇特殊情况按周期正常计算，但<strong>应发 ≤ 0 时不生成付款单</strong>（不发）</li>
                  <li><strong>记录银行实发金额</strong>：付款单字段记录「银行最终实发金额」用于数据完整性核账（如手续费、银行扣减等差异），业务上仍以实发为打款金额</li>
                  <li><strong>个税补退跟随</strong>：个税汇算后的补缴 / 退税已合并到<strong>当月（当周期）最后 1 条工资条</strong>的应发金额中，<strong>不单独生成付款单</strong>，跟随后续正常付款流程</li>
                </ul>
                <div style="padding: 8px 12px; background: hsl(var(--background)); border-radius: 4px;">
                  <span style="font-weight: 600;">⑤ 典型付款单数量示例</span>
                </div>
                <table class="data-table" style="margin: 8px 0 0 16px; width: calc(100% - 16px); font-size: 12px;">
                  <thead>
                    <tr>
                      <th>用工类型</th>
                      <th>主体数</th>
                      <th>周期数</th>
                      <th>月付款单数（示例）</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>全职 / 返聘</td>
                      <td>1</td>
                      <td>1（月）</td>
                      <td><strong>1 条</strong>（如 N 个工资条中 1 条应发 &gt; 0，则只生成 1 条付款单；其余并入或不发）</td>
                    </tr>
                    <tr>
                      <td>非全日制（单店）</td>
                      <td>1</td>
                      <td>4~5（周）</td>
                      <td><strong>4~5 条</strong>（每周 1 条；应发 ≤ 0 的周不生成）</td>
                    </tr>
                    <tr>
                      <td>兼职（多店）</td>
                      <td>N（= 服务门店数）</td>
                      <td>4~5（周）</td>
                      <td><strong>N × 4~5 条</strong>（每主体每周 1 条）</td>
                    </tr>
                  </tbody>
                </table>
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
              <tr>
                <td>返聘（劳务合作-退休返聘）</td>
                <td>每月1次</td>
                <td>N个工资条/月（示例：1个）</td>
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
                <td>代扣社保/公积金（老系统接口读取）、代扣个税（汇算，月度）</td>
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
                  工资条：收入 → 扣缴项 → 代扣社保（老系统） → 代扣公积金（老系统） → 代扣个税 → 有剩余 → 抵扣负工资余额<br/>
                  <span style="color: hsl(var(--muted-foreground)); font-size: 12px;">注：个税由百旺基于应税收入（第1级+第2级收入 - 第1级扣款 - 第2级扣款非预扣，详见「应税收入计算规则」）独立计算；社保/公积金个人部分、个税预扣均<strong>不参与</strong>应税收入（社保/公积金因个税申报时税局自动减除，个税预扣是真正的个税）</span>
                </td>
              </tr>
              <tr>
                <td>离职正式员工</td>
                <td>优先使用常乐豆（<strong>只抵扣公积金</strong>）：① 抵<strong>公积金公司部分</strong> → ② 抵<strong>公积金个人部分</strong> → ③ 不够时从对应工资单<strong>现金</strong>扣【公积金个人扣款】；最终剩余常乐豆全部提现</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>说明：</strong>负工资抵扣是每个工资条都可能触发的特殊项，当工资条应发 &gt; 0 且存在负工资余额时，自动生成抵扣项
          </div>
        </div>
      </div>

</template>
