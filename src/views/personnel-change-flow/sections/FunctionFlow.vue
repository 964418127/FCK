<template>
  <DocShell
    :toc-items="tocItems"
    title="一、功能流程说明"
    subtitle='端到端数据流 + 自动步（截尾旧关系）+ 手动步（确认新关系）+ 状态机 + UI 交互时序'
    version="v1.0"
    date="2026-08-13"
    :breadcrumbs="breadcrumbs"
  >
    <div id="overview" class="section">
      <h2>一、功能流程说明</h2>

      <div class="card" id="end-to-end">
        <h3>1. 端到端数据流</h3>
        <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary)); margin-bottom: 16px; font-size: 13px;">
          <strong>全链路总览：</strong>HR 人事模块按日汇入异动结论 → 本系统异动列表 → <strong>自动步</strong>截尾旧记录 → <strong>手动步</strong>确认新关系挂模板 → 写入【人员薪酬规划】→ 作为后续薪酬计算的输入
        </div>

        <div style="background: hsl(var(--background)); border-radius: 8px; border: 1px solid hsl(var(--border)); padding: 24px; overflow-x: auto;">
          <svg viewBox="0 0 720 520" style="display: block; margin: 0 auto; max-width: 100%; height: auto; min-width: 640px;" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <marker id="arrow-primary" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                <polygon points="0 0, 10 4, 0 8" fill="hsl(var(--primary))" />
              </marker>
              <marker id="arrow-success" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                <polygon points="0 0, 10 4, 0 8" fill="hsl(var(--success))" />
              </marker>
              <marker id="arrow-warning" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                <polygon points="0 0, 10 4, 0 8" fill="hsl(var(--warning))" />
              </marker>
            </defs>

            <!-- 顶部：其他模块 -->
            <g>
              <rect x="40" y="20" width="170" height="56" rx="10" fill="hsl(var(--muted) / 0.5)" stroke="hsl(var(--border))" stroke-width="1.5" />
              <text x="125" y="44" text-anchor="middle" font-size="14" font-weight="600" fill="hsl(var(--foreground))" font-family="-apple-system, BlinkMacSystemFont, sans-serif">HR 人事模块</text>
              <text x="125" y="62" text-anchor="middle" font-size="11" fill="hsl(var(--muted-foreground))" font-family="-apple-system, BlinkMacSystemFont, sans-serif">（人事模块 · 任职事实主数据）</text>

              <rect x="510" y="20" width="170" height="56" rx="10" fill="hsl(var(--muted) / 0.5)" stroke="hsl(var(--border))" stroke-width="1.5" />
              <text x="595" y="44" text-anchor="middle" font-size="14" font-weight="600" fill="hsl(var(--foreground))" font-family="-apple-system, BlinkMacSystemFont, sans-serif">薪酬计算模块</text>
              <text x="595" y="62" text-anchor="middle" font-size="11" fill="hsl(var(--muted-foreground))" font-family="-apple-system, BlinkMacSystemFont, sans-serif">（下游模块 · 读取规划）</text>

              <path d="M 125 76 L 125 130" fill="none" stroke="hsl(var(--primary))" stroke-width="2" marker-end="url(#arrow-primary)" />
              <text x="132" y="108" font-size="11" fill="hsl(var(--muted-foreground))" font-family="-apple-system, BlinkMacSystemFont, sans-serif">每日汇入</text>

              <path d="M 595 400 L 595 76" fill="none" stroke="hsl(var(--primary))" stroke-width="2" marker-end="url(#arrow-primary)" />
              <text x="602" y="240" font-size="11" fill="hsl(var(--muted-foreground))" font-family="-apple-system, BlinkMacSystemFont, sans-serif">作为输入</text>
            </g>

            <!-- 中部：本系统 -->
            <g>
              <rect x="20" y="140" width="680" height="240" rx="14" fill="hsl(var(--primary) / 0.04)" stroke="hsl(var(--primary) / 0.25)" stroke-width="1.5" stroke-dasharray="6 4" />
              <text x="40" y="166" font-size="13" font-weight="600" fill="hsl(var(--primary))" font-family="-apple-system, BlinkMacSystemFont, sans-serif">本系统：人员异动处理</text>

              <rect x="50" y="180" width="120" height="56" rx="8" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1.5" />
              <text x="110" y="204" text-anchor="middle" font-size="13" font-weight="600" fill="hsl(var(--foreground))" font-family="-apple-system, BlinkMacSystemFont, sans-serif">异动列表</text>
              <text x="110" y="222" text-anchor="middle" font-size="10" fill="hsl(var(--muted-foreground))" font-family="-apple-system, BlinkMacSystemFont, sans-serif">HR 同步落地</text>

              <rect x="220" y="180" width="160" height="56" rx="8" fill="hsl(var(--success) / 0.08)" stroke="hsl(var(--success) / 0.5)" stroke-width="1.5" />
              <text x="300" y="204" text-anchor="middle" font-size="13" font-weight="600" fill="hsl(var(--success))" font-family="-apple-system, BlinkMacSystemFont, sans-serif">自动步</text>
              <text x="300" y="222" text-anchor="middle" font-size="10" fill="hsl(var(--muted-foreground))" font-family="-apple-system, BlinkMacSystemFont, sans-serif">截尾旧记录</text>

              <rect x="430" y="180" width="160" height="56" rx="8" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1.5" />
              <text x="510" y="204" text-anchor="middle" font-size="13" font-weight="600" fill="hsl(var(--foreground))" font-family="-apple-system, BlinkMacSystemFont, sans-serif">旧记录更新</text>
              <text x="510" y="222" text-anchor="middle" font-size="10" fill="hsl(var(--muted-foreground))" font-family="-apple-system, BlinkMacSystemFont, sans-serif">失效时间改写</text>

              <rect x="50" y="290" width="120" height="56" rx="8" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1.5" />
              <text x="110" y="314" text-anchor="middle" font-size="13" font-weight="600" fill="hsl(var(--foreground))" font-family="-apple-system, BlinkMacSystemFont, sans-serif">待确认列表</text>
              <text x="110" y="332" text-anchor="middle" font-size="10" fill="hsl(var(--muted-foreground))" font-family="-apple-system, BlinkMacSystemFont, sans-serif">薪酬专员介入</text>

              <rect x="220" y="290" width="160" height="56" rx="8" fill="hsl(var(--warning) / 0.08)" stroke="hsl(var(--warning) / 0.5)" stroke-width="1.5" />
              <text x="300" y="314" text-anchor="middle" font-size="13" font-weight="600" fill="hsl(var(--warning))" font-family="-apple-system, BlinkMacSystemFont, sans-serif">手动步</text>
              <text x="300" y="332" text-anchor="middle" font-size="10" fill="hsl(var(--muted-foreground))" font-family="-apple-system, BlinkMacSystemFont, sans-serif">挑模板 + 确认</text>

              <rect x="430" y="290" width="160" height="56" rx="8" fill="hsl(var(--background))" stroke="hsl(var(--border))" stroke-width="1.5" />
              <text x="510" y="314" text-anchor="middle" font-size="13" font-weight="600" fill="hsl(var(--foreground))" font-family="-apple-system, BlinkMacSystemFont, sans-serif">新记录写入</text>
              <text x="510" y="332" text-anchor="middle" font-size="10" fill="hsl(var(--muted-foreground))" font-family="-apple-system, BlinkMacSystemFont, sans-serif">起止时间采用</text>

              <line x1="170" y1="208" x2="220" y2="208" stroke="hsl(var(--success))" stroke-width="2" marker-end="url(#arrow-success)" />
              <line x1="380" y1="208" x2="430" y2="208" stroke="hsl(var(--success))" stroke-width="2" marker-end="url(#arrow-success)" />

              <path d="M 110 236 L 110 290" fill="none" stroke="hsl(var(--warning))" stroke-width="2" marker-end="url(#arrow-warning)" />
              <line x1="170" y1="318" x2="220" y2="318" stroke="hsl(var(--warning))" stroke-width="2" marker-end="url(#arrow-warning)" />
              <line x1="380" y1="318" x2="430" y2="318" stroke="hsl(var(--warning))" stroke-width="2" marker-end="url(#arrow-warning)" />
            </g>

            <!-- 底部：核心产物 -->
            <g>
              <rect x="270" y="420" width="180" height="56" rx="10" fill="hsl(var(--primary) / 0.1)" stroke="hsl(var(--primary) / 0.4)" stroke-width="1.5" />
              <text x="360" y="444" text-anchor="middle" font-size="14" font-weight="600" fill="hsl(var(--primary))" font-family="-apple-system, BlinkMacSystemFont, sans-serif">人员薪酬规划</text>
              <text x="360" y="462" text-anchor="middle" font-size="11" fill="hsl(var(--muted-foreground))" font-family="-apple-system, BlinkMacSystemFont, sans-serif">本系统核心产物</text>

              <path d="M 510 236 L 510 290 L 510 380 L 450 380 L 360 380 L 360 420" fill="none" stroke="hsl(var(--primary))" stroke-width="2" stroke-dasharray="4 3" marker-end="url(#arrow-primary)" />
              <line x1="510" y1="346" x2="510" y2="395" stroke="hsl(var(--primary))" stroke-width="2" marker-end="url(#arrow-primary)" />
            </g>
          </svg>

          <div style="margin-top: 12px; font-size: 12px; color: hsl(var(--muted-foreground)); line-height: 1.6;">
            <strong>图例：</strong>
            <span style="display: inline-block; padding: 2px 8px; background: hsl(var(--success) / 0.1); border: 1px solid hsl(var(--success) / 0.3); border-radius: 4px; margin: 0 4px; color: hsl(var(--success)); font-weight: 600;">自动步</span>
            <span>系统自动处理，无须人工介入</span>
            <span style="margin-left: 12px; display: inline-block; padding: 2px 8px; background: hsl(var(--warning) / 0.1); border: 1px solid hsl(var(--warning) / 0.3); border-radius: 4px; margin: 0 4px; color: hsl(var(--warning)); font-weight: 600;">手动步</span>
            <span>薪酬专员介入</span>
          </div>
        </div>

        <table class="data-table" style="margin-top: 12px;">
          <thead>
            <tr>
              <th style="width: 130px;">阶段</th>
              <th>动作</th>
              <th style="width: 120px;">执行方</th>
              <th style="width: 120px;">触发时机</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>HR 同步</strong></td>
              <td>HR 人事模块按日把异动结论（入职 / 换签主体 / 换合作方式 / 换岗位 / 离职）推送到本模块异动列表</td>
              <td>HR 人事模块</td>
              <td>每日定时</td>
            </tr>
            <tr>
              <td><strong>自动步</strong></td>
              <td>非入职异动落库即把对应"在任"任职段的失效时间改为 HR 给定的旧结束时间；<strong>入职类型 no-op</strong>（无旧关系）</td>
              <td>系统（无人工）</td>
              <td>异动入列表时</td>
            </tr>
            <tr>
              <td><strong>手动步</strong></td>
              <td>薪酬专员在「Tab 2 新关系确认」挑选岗位薪酬模板，点击确认写入新规划记录（入职类型写首段，换签/换合作/换岗写续段）</td>
              <td>薪酬专员</td>
              <td>Tab 2 操作</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card" id="auto-step">
        <h3>2. 自动步（旧关系结束）</h3>
        <div class="note">
          <strong>触发时机：</strong>异动落库即触发（init 阶段 + simulateSync 推送新异动时）。
          <strong>执行函数：</strong><code>autoApplyEndOfOldRelation(change)</code>，模块级函数，跨组件共享。
        </div>

        <h4 style="margin-top: 12px; font-size: 14px;">匹配规则（五要素）</h4>
        <p style="font-size: 13px; line-height: 1.7;">仅适用于「换签主体 / 换合作方式 / 换岗位 / 离职」四种类型。在【人员薪酬规划】里查找同时满足以下全部条件的"当前在任"任职段：</p>
        <ul style="font-size: 13px; line-height: 1.8; padding-left: 24px;">
          <li>同一人员</li>
          <li>同一岗位</li>
          <li>同一合作方式</li>
          <li>同一主体</li>
          <li>同一门店</li>
        </ul>
        <div class="note" style="margin-top: 8px;">
          <strong>入职类型特例：</strong>新员工没有旧任职段可截尾，自动步函数在检测到 <code>changeType === '入职'</code> 时<strong>直接返回</strong>（不查规划、不打 warn）。<code>inheritedFields</code> 置空；手动步依然按 HR 给的「新任职四要素」+ 起止时间初始化首段任职段。
        </div>

        <h4 style="margin-top: 12px; font-size: 14px;">截尾动作</h4>
        <p style="font-size: 13px; line-height: 1.7;">找到匹配的"在任"任职段后，把它的失效时间从"在任"标记改为 HR 报告的旧关系结束时间。UI 上展示：原"至今"变更为具体日期。</p>

        <h4 style="margin-top: 12px; font-size: 14px;">不变量与异常处理</h4>
        <div class="callout" style="background: hsl(var(--warning) / 0.08); border-left: 3px solid hsl(var(--warning)); padding: 10px 12px; font-size: 13px; border-radius: 4px;">
          <strong>⚠️ 业务不变量</strong>：HR 报过来的<strong>非入职</strong>异动必能在规划里找到对应 active 旧记录。出现未匹配属数据不一致边界态。
          <strong>UI 兜底</strong>：始终显示「✓ 已写入」绿色 tag，不暴露给业务用户。
          <strong>排查线索</strong>：控制台 <code>console.warn</code> 输出该异动的唯一标识、人员姓名、旧任职五要素 + 旧结束时间，由开发者定位 HR / 规划两边数据脱钩问题。
          <strong>入职豁免</strong>：入职类型必 no-op，<strong>不视为边界态</strong>，不打 warn。
        </div>

        <h4 style="margin-top: 12px; font-size: 14px;">新关系继承自旧任职段的信息</h4>
        <p style="font-size: 13px; line-height: 1.7;">对「换签主体 / 换合作方式 / 换岗位」自动步匹配成功后，会把旧任职段的部分信息"带过来"，供手动步在写入新任职段时直接复用，避免重复维护：</p>
        <ul style="font-size: 13px; line-height: 1.8; padding-left: 24px;">
          <li>岗位的城市归属</li>
          <li>任职门店</li>
          <li>岗位归属分类（业务 / 职能等）</li>
        </ul>
        <div class="note" style="margin-top: 8px;">
          <strong>注意：</strong>新关系的<strong>岗位本身</strong>不会从旧任职段继承——如果本条异动是换岗，新任职段的岗位必须取 HR 报告的<strong>新岗位</strong>（曹娜娜从客户经理换到推拿师，新任职段的岗位就是"推拿师"）。
          <strong>入职类型无旧任职段</strong>，以上三项继承字段均置空，由 HR 在异动里直接给出。
        </div>
      </div>

      <div class="card" id="manual-step">
        <h3>3. 手动步（新关系确认）</h3>

        <h4 style="margin-top: 12px; font-size: 14px;">触发时机</h4>
        <p style="font-size: 13px; line-height: 1.7;">薪酬专员在「Tab 2 新关系确认」选中行内模板下拉框，点击行尾「确认」按钮；或勾选多行后点击顶部「批量确认」按钮。</p>
        <div class="callout" style="background: hsl(var(--warning) / 0.08); border-left: 3px solid hsl(var(--warning)); padding: 10px 12px; font-size: 13px; border-radius: 4px;">
          <strong>⚠️ 手动步只负责写新任职段</strong>。旧关系的截尾已在自动步处理，手动步不会再触发；旧关系和新任职段是<strong>两个独立动作</strong>，不是一条流程的两段。
        </div>

        <h4 style="margin-top: 16px; font-size: 14px;">薪酬专员提供什么</h4>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 180px;">内容</th>
              <th>必填？</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>岗位薪酬模板</strong></td>
              <td>必填</td>
              <td>薪酬专员<strong>唯一</strong>需要主动决策的输入；从行内下拉框挑选，下拉选项已按"新岗位"过滤（不同岗位的模板池不互通）</td>
            </tr>
          </tbody>
        </table>

        <h4 style="margin-top: 16px; font-size: 14px;">薪酬专员<strong>不</strong>需要也不允许提供什么</h4>
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 220px;">内容</th>
              <th>由谁决定</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>新关系起始时间</td>
              <td>HR</td>
              <td>Tab 2 列表里<strong>只读展示</strong>，由 HR 随异动汇入决定；薪酬专员不能改</td>
            </tr>
            <tr>
              <td>新关系结束时间</td>
              <td>HR</td>
              <td>HR 报告有则采用，无则视为「在任」（UI 显示「至今」）；薪酬专员不能改</td>
            </tr>
            <tr>
              <td>新关系的主体 / 合作方式 / 门店</td>
              <td>HR</td>
              <td>Tab 2 列表里只读展示，由 HR 报告</td>
            </tr>
            <tr>
              <td>新关系的人员（姓名 / 人才 ID）</td>
              <td>HR</td>
              <td>HR 报告，本系统只读引用</td>
            </tr>
          </tbody>
        </table>

        <h4 style="margin-top: 16px; font-size: 14px;">系统自动填充的新任职段信息</h4>
        <p style="font-size: 13px; line-height: 1.7;">薪酬专员提交确认后，系统会把以下信息自动组装成一条新任职段写入【人员薪酬规划】：</p>
        <ul style="font-size: 13px; line-height: 1.8; padding-left: 24px;">
          <li><strong>任职四要素</strong>：主体、合作方式、岗位、门店——其中<strong>岗位</strong>取 HR 报告的新岗位（换岗场景下必须用新岗位，不是旧岗位），其余取 HR 报告的新值</li>
          <li><strong>岗位的归属信息</strong>：城市归属、岗位分类等——<strong>非入职</strong>类型从<strong>旧任职段继承</strong>（同一个人换岗通常只是岗位变，城市 / 分类不变）；<strong>入职</strong>类型无旧任职段，归属信息由 HR 在异动里直接给出（如未给出则置空）</li>
          <li><strong>岗位薪酬模板</strong>：薪酬专员刚选的模板</li>
          <li><strong>有效期</strong>：起始时间取 HR 给的起始日；结束时间取 HR 给的结束日（无则视为在任）</li>
          <li><strong>数据来源溯源</strong>：记录本任职段由哪条 HR 异动产生，便于跨表追溯</li>
        </ul>

        <h4 style="margin-top: 16px; font-size: 14px;">批量确认约束</h4>
        <div class="callout" style="background: hsl(var(--primary) / 0.06); border-left: 3px solid hsl(var(--primary)); padding: 10px 12px; font-size: 13px; border-radius: 4px;">
          <strong>📌 强制约束</strong>：选中行的<strong>新岗位必须一致</strong>才允许批量确认。原因：不同岗位对应不同模板体系（客户经理 / 推拿师 / 调理师 各有独立模板池），混批没有意义。如不一致，弹窗提示并拒掉。此外，任一行未选模板也拒掉执行。
        </div>

        <h4 style="margin-top: 16px; font-size: 14px;">提交后的状态变化</h4>
        <ul style="font-size: 13px; line-height: 1.8; padding-left: 24px;">
          <li>本异动从「Tab 2 新关系确认」列表中<strong>消失</strong>（已确认的不再显示）</li>
          <li>本异动在「Tab 1 异动结束（查看）」中的「对应新关系」列变为绿色「已确认」</li>
          <li>新任职段已写入【人员薪酬规划】，可被薪酬计算模块消费</li>
          <li>批量确认时任一行提交失败不影响已成功的行（按成功数计数）</li>
        </ul>
      </div>

      <div class="card" id="state-machine">
        <h3>4. 异动状态机</h3>
        <div style="padding: 16px; background: hsl(var(--background)); border-radius: 6px; border: 1px solid hsl(var(--border)); font-family: -apple-system, BlinkMacSystemFont, monospace; font-size: 13px; line-height: 2;">
          <div>HR 异动落库</div>
          <div style="padding-left: 24px; color: hsl(var(--muted-foreground));">│</div>
          <div style="padding-left: 24px;">├── 异动类型 = 入职</div>
          <div style="padding-left: 56px;">▼</div>
          <div style="padding-left: 56px;">┌──────────────┐</div>
          <div style="padding-left: 56px;">│  status = 待确认 │ ─── 薪酬专员手动确认 ──▶ ┌────────────┐</div>
          <div style="padding-left: 56px;">│ Tab 1 + Tab 2 显示│                                │ status = 已确认│</div>
          <div style="padding-left: 56px;">│ 「结束什么关系」│                                │ Tab 1 显示    │</div>
          <div style="padding-left: 56px;">│ 列展示「无旧关系」│                              │ 任职段写入规划 │</div>
          <div style="padding-left: 56px;">└──────────────┘                                  └────────────┘</div>
          <div style="padding-left: 24px; color: hsl(var(--muted-foreground));">│</div>
          <div style="padding-left: 24px;">├── 异动类型 ∈ {换签主体, 换合作方式, 换岗位}</div>
          <div style="padding-left: 56px;">▼</div>
          <div style="padding-left: 56px;">┌──────────────┐</div>
          <div style="padding-left: 56px;">│  status = 待确认 │ ─── 薪酬专员手动确认 ──▶ ┌────────────┐</div>
          <div style="padding-left: 56px;">│ Tab 2 显示    │                                  │ status = 已确认│</div>
          <div style="padding-left: 56px;">└──────────────┘                                  │ Tab 1 显示    │</div>
          <div style="padding-left: 80px;">└────────────┘</div>
          <div style="padding-left: 24px; color: hsl(var(--muted-foreground));">│</div>
          <div style="padding-left: 24px;">└── 异动类型 = 离职</div>
          <div style="padding-left: 56px;">▼</div>
          <div style="padding-left: 56px;">┌────────────┐</div>
          <div style="padding-left: 56px;">│ status = 已结束│ （不进 Tab 2，UI 标红色「离职」+ 绿色「无需确认」）</div>
          <div style="padding-left: 56px;">└────────────┘</div>
        </div>

        <table class="data-table" style="margin-top: 12px;">
          <thead>
            <tr>
              <th style="width: 130px;">status</th>
              <th>进入路径</th>
              <th>UI 出现位置</th>
              <th>后续动作</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong style="color: hsl(var(--warning));">待确认</strong></td>
              <td>HR 同步换签/换合作方式/换岗位/入职异动</td>
              <td>Tab 1 + Tab 2（入职、换签、换合作方式、换岗）</td>
              <td>薪酬专员手动确认 → 已确认</td>
            </tr>
            <tr>
              <td><strong style="color: hsl(var(--success));">已确认</strong></td>
              <td>薪酬专员手动确认成功</td>
              <td>Tab 1（同步状态显示「✓ 已写入」）</td>
              <td>流程结束；新任职段写入规划</td>
            </tr>
            <tr>
              <td><strong style="color: hsl(var(--danger));">已结束</strong></td>
              <td>HR 同步离职异动</td>
              <td>Tab 1（红色「离职」+ 绿色「无需确认」）</td>
              <td>流程结束</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card" id="ui-flow">
        <h3>5. UI 交互时序</h3>

        <h4 style="margin-top: 12px; font-size: 14px;">Tab 1 异动结束（查看）—— 只读</h4>
        <ol style="font-size: 13px; line-height: 1.8; padding-left: 24px;">
          <li>页面打开：自动加载 <code>changeList</code>，对所有<strong>非入职</strong>异动执行 <code>autoApplyEndOfOldRelation</code>（业务上必然命中）；<strong>入职类型 no-op</strong></li>
          <li>列表展示：同步日期 / 异动ID / 姓名 / 人才ID / 异动类型 badge / 结束什么关系（入职显示「— 新入职，无旧关系可结束 —」）/ 同步状态 / 对应新关系 / 详情按钮</li>
          <li>筛选器：搜索（姓名 / 人才ID）、异动类型（含「入职」「离职」等 5 种）、无</li>
          <li>详情弹窗：完整字段 + 同步状态说明 + 已写入模板（如已确认）；入职类型只展示「新任职四要素」+ 起止时间，旧字段整块隐藏</li>
        </ol>

        <h4 style="margin-top: 12px; font-size: 14px;">Tab 2 新关系确认 —— 交互式</h4>
        <ol style="font-size: 13px; line-height: 1.8; padding-left: 24px;">
          <li>页面打开：自动过滤 <code>status = '待确认'</code> 的异动（离职 / 已确认自动隐藏；<strong>入职类型显示在 Tab 2</strong>，等薪酬专员挂模板初始化首段）</li>
          <li>列表展示：异动ID / 姓名 / 异动类型 / 新岗位 badge / 新任职 / 起止时间（HR 提供）/ <strong>岗位薪酬模板行内选择器</strong> / 单击「确认」</li>
          <li>筛选器：搜索、新岗位（按新岗位过滤）、异动类型（含「入职」）</li>
          <li>批量操作：勾选多行 → 顶部「批量确认」按钮（按「同岗位一致」强约束，详见上方手动步章节）</li>
          <li>确认成功：异动 <code>status</code> 变 '已确认'，从 Tab 2 列表移除；<strong>入职类型写首段，换签/换合作/换岗写续段</strong></li>
        </ol>

        <div class="note" style="margin-top: 12px;">
          <strong>同步 HR 异动</strong>按钮（首页「人员岗位薪酬规划 Tab 1」顶部）：触发 <code>simulateSync()</code>，演示 HR 推新异动过来。实际生产环境由 HR 人事模块定时调用接口，本模块被动接收。
        </div>
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'

const tocItems = [
  { id: 'end-to-end', label: '1. 端到端数据流' },
  { id: 'auto-step', label: '2. 自动步（旧关系结束）' },
  { id: 'manual-step', label: '3. 手动步（新关系确认）' },
  { id: 'state-machine', label: '4. 异动状态机' },
  { id: 'ui-flow', label: '5. UI 交互时序' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事福利', to: '/docs/personnel-change-flow' },
  { label: '人员异动流程', to: '/docs/personnel-change-flow' },
  { label: '一、功能流程说明' }
]
</script>
