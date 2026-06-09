<template>
      <div id="summary" class="section">
        <h2>一、整体概述</h2>

        <!-- 核心流程（8 步全链路：配置→入职→关系建立→计算→福利明细→发放） -->
        <div class="card architecture-card">
          <h2>核心流程（端到端全链路）</h2>
          <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary)); margin-bottom: 16px; font-size: 13px;">
            <strong>宏观全链路：</strong>1.定义岗位 → 2.配置岗位薪酬模板 → 3.发放策略配置 → 4.招聘入职 → 5.员工福利保障<strong>关系建立</strong> → 6.薪酬计算 → 7.员工福利保障<strong>月度明细生成 + 代扣金额确定</strong> → 8.工资条生成<br/>
            <strong>阶段划分：</strong>① 配置阶段（步骤 1-3，HR 配置规则） ② 触发阶段（步骤 4-5，入职建立员工福利关系，<strong>无月度数据</strong>） ③ 执行阶段（步骤 6-8，每结算周期：计算收入 → 生成福利明细 → 发放）
          </div>
          <div class="architecture-diagram">
            <!-- 步骤1：定义岗位 -->
            <div class="arch-layer">
              <div class="arch-layer-title">1. 定义岗位 <span style="font-size: 12px; font-weight: 400; color: hsl(var(--muted-foreground));">— HR 创建岗位基础信息</span></div>
              <div style="font-size: 13px; line-height: 1.8; text-align: left;">
                <div style="padding: 8px 10px; background: hsl(var(--background)); border-radius: 4px;">
                  <div style="font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 6px;">岗位基础属性</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); line-height: 1.8;">
                    岗位名称（如：推拿师 / 客户经理）｜ 归属部门 ｜ <strong>归属城市</strong>（决定城市基准比例）｜ 用工类型（全职 / 非全日制 / 兼职）
                  </div>
                  <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed hsl(var(--border)); font-size: 12px; color: hsl(var(--primary));">
                    <strong>关键：</strong>岗位是配置和数据的"根"，薪酬模板和福利保障都挂在岗位上
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
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground));">系统项：代扣社保、代扣公积金、代扣个税</div>
                </div>
                <div style="margin-bottom: 8px; padding: 8px 10px; background: hsl(var(--primary) / 0.05); border: 1px solid hsl(var(--primary) / 0.15); border-radius: 4px;">
                  <div style="font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 6px;">非全日制模板（劳务协议，多主体）</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); margin-bottom: 4px;">第1级：计件提成、超时加班费、投诉扣款</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); margin-bottom: 4px;">第2级：个税预扣（每条 3%）</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground));">系统项：代扣个税（月末汇算）｜公司成本：商业险（可选）</div>
                </div>
                <div style="padding: 8px 10px; background: hsl(var(--primary) / 0.08); border: 1px solid hsl(var(--primary) / 0.25); border-radius: 4px;">
                  <div style="font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 6px;">兼职模板（劳务合作，多主体）</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); margin-bottom: 4px;">第1级：计件提成、超时加班费、投诉扣款</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); margin-bottom: 4px;">第2级：个税预扣（每条 3%）</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground));">系统项：代扣个税（月末汇算，倒序申报）｜公司成本：商业险（必选）</div>
                </div>
              </div>
            </div>
            <div class="arch-arrow">↓</div>
            <!-- 步骤3：发放策略配置 -->
            <div class="arch-layer">
              <div class="arch-layer-title">3. 发放策略配置 <span style="font-size: 12px; font-weight: 400; color: hsl(var(--muted-foreground));">— 工资单定义</span></div>
              <div style="font-size: 13px; line-height: 1.8; text-align: left;">
                <div style="padding: 8px 10px; background: hsl(var(--background)); border-radius: 4px;">
                  <div style="margin-bottom: 6px;"><strong>全职</strong>：每月1次结算，月度N个工资条（示例：3个）｜<strong>单一主体</strong>｜<strong>月度申报</strong></div>
                  <div style="margin-bottom: 6px;"><strong>非全日制 / 兼职</strong>：结算周期可配（示例：周薪制，间隔 ≤15天）｜<strong>每主体独立结算</strong>｜<strong>每周预扣 3%，月末汇算</strong>｜兼职多主体倒序申报</div>
                  <div style="font-size: 12px; color: hsl(var(--primary));">
                    <strong>关键：</strong>每个发放主体（全职=合同主体，非全日制/兼职=业绩归属主体）下的工资分别发放
                  </div>
                </div>
              </div>
            </div>
            <div class="arch-arrow">↓</div>
            <!-- 步骤4：招聘入职 -->
            <div class="arch-layer">
              <div class="arch-layer-title">4. 招聘入职 <span style="font-size: 12px; font-weight: 400; color: hsl(var(--muted-foreground));">— 员工分配到岗位，触发福利关系建立</span></div>
              <div style="font-size: 13px; line-height: 1.8; text-align: left;">
                <div style="padding: 8px 10px; background: hsl(var(--background)); border-radius: 4px;">
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); line-height: 1.8;">
                    员工分配到岗位 → 岗位城市确定 → 自动绑定薪酬模板 → 触发<strong>员工福利保障关系建立</strong>（继承城市基准比例，<strong>无月度数据</strong>）
                  </div>
                  <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed hsl(var(--border)); font-size: 12px; color: hsl(var(--primary));">
                    <strong>关键：</strong>入职是体系"启动"节点——配置完成 → 入职触发福利关系绑定 → 后续每周期计算完收入后再动态生成月度明细
                  </div>
                </div>
              </div>
            </div>
            <div class="arch-arrow">↓</div>
            <!-- 步骤5：员工福利保障关系建立 -->
            <div class="arch-layer">
              <div class="arch-layer-title">5. 员工福利保障关系建立 <span style="font-size: 12px; font-weight: 400; color: hsl(var(--muted-foreground));">— 入职时绑定规则，无月度数据</span></div>
              <div style="font-size: 13px; line-height: 1.8; text-align: left;">
                <div style="padding: 8px 10px; background: hsl(var(--background)); border-radius: 4px;">
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); line-height: 1.8;">
                    入职触发：员工 ↔ 申报主体（全职=合同主体；非全日制/兼职=业绩归属主体）<br/>
                    适用 feeType：<strong>社保+公积金（全职）</strong> ｜ <strong>社保（仅工伤保险，非全日制）</strong> ｜ <strong>商业险（全职/兼职必选，非全日制可选）</strong><br/>
                    比例绑定：继承<strong>城市基准系数</strong>（按岗位城市）｜ <strong>Override 仅比例可覆盖，基数不允许</strong>
                  </div>
                  <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed hsl(var(--border)); font-size: 12px; color: hsl(var(--primary));">
                    <strong>关键：</strong>本步仅建立关系，不产生月度数据；月度明细在 step 7 按需动态生成
                  </div>
                </div>
              </div>
            </div>
            <div class="arch-arrow">↓</div>
            <!-- 步骤6：薪酬计算（仅收入，不含代扣） -->
            <div class="arch-layer">
              <div class="arch-layer-title">6. 薪酬计算 <span style="font-size: 12px; font-weight: 400; color: hsl(var(--muted-foreground));">— 计算应发收入（代扣金额在 step 7 确定）</span></div>
              <div style="font-size: 13px; line-height: 1.8; text-align: left;">
                <div style="margin-bottom: 6px; padding-left: 10px; border-left: 3px solid hsl(var(--primary));">
                  <span style="font-weight: 700;">第1级</span> <span style="font-size: 12px; color: hsl(var(--muted-foreground));">— 基础收入/扣缴：</span>计件提成、超产值奖金、超时加班费、投诉扣款
                </div>
                <div style="margin-bottom: 6px; padding-left: 10px; border-left: 3px solid hsl(var(--primary));">
                  <span style="font-weight: 700;">第2级</span> <span style="font-size: 12px; color: hsl(var(--muted-foreground));">— 补充项，依赖第1级：</span>保底获豆（全职）｜个税预扣（非全日制/兼职，每条 3%）
                </div>
                <div style="padding: 6px 10px; border-left: 3px solid hsl(var(--primary) / 0.5); background: hsl(var(--primary) / 0.05); border-radius: 4px; font-size: 13px;">
                  <span style="font-weight: 700; color: hsl(var(--primary));">输出：</span>当月<strong>应发收入合计</strong>确定 → 触发 step 7 福利明细动态生成<br/>
                  <span style="font-size: 12px; color: hsl(var(--muted-foreground));">注：代扣金额（社保/公积金/个税）在 step 7 确定，数据来源各异（福利明细 / 系统公式 / 百旺服务），step 6 仅算应发收入</span>
                </div>
              </div>
            </div>
            <div class="arch-arrow">↓</div>
            <!-- 步骤7：员工福利保障月度明细生成 + 代扣金额确定（step 6 后触发） -->
            <div class="arch-layer">
              <div class="arch-layer-title">7. 员工福利保障月度明细生成 + 代扣金额确定 <span style="font-size: 12px; font-weight: 400; color: hsl(var(--muted-foreground));">— step 6 后触发，基数 = 当月应发收入</span></div>
              <div style="font-size: 13px; line-height: 1.8; text-align: left;">
                <div style="margin-bottom: 8px; padding: 8px 10px; background: hsl(var(--background)); border-radius: 4px;">
                  <div style="font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 6px;">① 福利明细生成规则</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); line-height: 1.8;">
                    触发条件：step 6 完成，月度应发收入确定<br/>
                    基数 = <strong>当月应发收入</strong>（<strong>浮动，非固定</strong>）｜ 金额 = 基数 × 比例（含 Override）
                  </div>
                </div>
                <div style="margin-bottom: 8px; padding: 8px 10px; background: hsl(var(--primary) / 0.05); border: 1px solid hsl(var(--primary) / 0.15); border-radius: 4px;">
                  <div style="font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 6px;">② 数据落地：3 个独立流水页（按 feeType 拆分）</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); line-height: 1.8;">
                    · <strong>社保月度流水</strong>（全职）— 基数 = 当月应发收入<br/>
                    · <strong>公积金月度流水</strong>（全职）— 基数 = 当月应发收入<br/>
                    · <strong>商业险流水</strong>（全职/兼职必选 + 非全日制可选）— 按商业险库配置（成本单元可月/年，年付折算到月；公司全额，不进工资条）
                  </div>
                </div>
                <div style="margin-bottom: 8px; padding: 8px 10px; background: hsl(var(--primary) / 0.08); border: 1px solid hsl(var(--primary) / 0.2); border-radius: 4px;">
                  <div style="font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 6px;">③ 确定代扣金额：社保 + 公积金 + <strong>个税</strong> → 全部传递给 step 8</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); line-height: 1.8;">
                    · <strong>社保代扣 + 公积金代扣</strong>（全职）— 来自福利明细<br/>
                    · <strong>全职工种个税累计预扣</strong>：<strong>系统按公式</strong>（综合所得月度累计预扣法：当月应纳税所得额 × 税率 - 速算扣除数 - 累计已预扣）计算<br/>
                    · <strong>非全日制/兼职个税代扣</strong>：3% 预扣合计（系统按规则，来自 step 6 第2级）+ <strong>月末汇算</strong>（<strong>百旺服务返回</strong>实际税额 → 系统与已预扣合计比较，多退少补）
                  </div>
                </div>
                <div style="padding: 8px 10px; background: hsl(var(--muted) / 0.3); border-radius: 4px;">
                  <div style="font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 6px;">④ 条件触发</div>
                  <div style="font-size: 12px; color: hsl(var(--muted-foreground)); line-height: 1.8;">
                    · <strong>滞纳金</strong>（社保 / 公积金 / 个税）：<strong>非系统计算/生成</strong>，由申报方（社保局 / 公积金中心 / 税务局）在我方申报后返回的数据；若产生滞纳金 → 系统<strong>记录 / 导入</strong>到对应流水的原标准缴纳记录上（作为衍生项，不独立成条）<br/>
                    · <strong>个税汇算归属</strong>（非全日制/兼职月末）：补缴/退税 → 归入本月最后一条工资条
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
                  <span style="font-weight: 600;">全职工资条 1~N</span> <span style="font-size: 12px; color: hsl(var(--muted-foreground));">— 基础项 + 第2级 + <strong>福利代扣（社保/公积金）</strong> + 个税代扣（汇算后） + 负工资抵扣</span>
                </div>
                <div style="margin-bottom: 6px; padding: 6px 10px; background: hsl(var(--background)); border-radius: 4px;">
                  <span style="font-weight: 600;">非全日制/兼职周工资条 1~N</span> <span style="font-size: 12px; color: hsl(var(--muted-foreground));">— 基础项 + 个税预扣（3%）+ 负工资抵扣</span>
                </div>
                <div style="padding: 6px 10px; background: hsl(var(--primary) / 0.08); border: 1px solid hsl(var(--primary) / 0.2); border-radius: 4px;">
                  <span style="font-weight: 600;">非全日制/兼职月内最后一条工资条</span> <span style="font-size: 12px; color: hsl(var(--muted-foreground));">— 基础项 + 个税预扣 + <strong>个税补缴/退税</strong>（汇算结果作为本条工资条的一项，<strong>不单独生成汇算工资条</strong>）</span>
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
