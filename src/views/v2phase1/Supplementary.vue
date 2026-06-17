<template>
  <DocShell
    :toc-items="tocItems"
    title="十一、补充需求"
    subtitle='v2-1 阶段新增的补丁需求：模块化薪酬重算 / 离职员工常乐豆处理'
    version="v2.1-phase1"
    date="2026-06-16"
    :breadcrumbs="breadcrumbs"
  >
    <div id="supplementary" class="section">
      <h2>十一、补充需求</h2>
      <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary)); margin-bottom: 16px; font-size: 13px;">
        <strong>本章定位：</strong>v2-1 阶段在主体功能（章节一~十）定稿后新增的补丁需求，包含<strong>模块化薪酬重算与测试</strong>、<strong>离职员工常乐豆相关文案与定时任务</strong>两类调整。
      </div>

      <div class="card">
        <h3 id="sup-1">模块化薪酬重算和测试（按合作主体处理）</h3>
        <p>v2-1 阶段<strong>模块化薪酬</strong>（参见「四、岗位薪酬模板 + 动态项」「五、薪酬项范围」「六、计算节点与时机」）上线后，<strong>重算流程</strong>与<strong>测试场景</strong>需同步按<strong>合作主体（1 门店 = 1 主体）</strong>维度处理数据结果，确保非全日制/兼职<strong>跨多主体</strong>员工的薪酬分主体隔离、互不串扰。</p>

        <table class="data-table" style="margin-top: 12px;">
          <thead>
            <tr>
              <th style="width: 180px;">项目</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>重算范围</strong></td>
              <td>单条工资单 / 单个员工 / 单个周期内的全部工资条</td>
            </tr>
            <tr>
              <td><strong>重算单位（关键）</strong></td>
              <td><strong>按合作主体</strong>隔离重算——1 员工跨 N 个门店 = N 个主体，每个主体独立触发一次重算任务，结果按主体分别落库（<strong>不跨主体合并</strong>）</td>
            </tr>
            <tr>
              <td><strong>数据来源</strong></td>
              <td>· <strong>业绩数据</strong>：按业绩归属门店（= 业绩归属主体）取数<br/>· <strong>代扣社保 / 公积金</strong>：从<strong>老系统接口</strong>读取（仅全职 / 返聘）<br/>· <strong>个税</strong>：调<strong>百旺服务</strong>计算（全职 1 次/月；非全日制/兼职按主体倒序申报，每主体 1 次）</td>
            </tr>
            <tr>
              <td><strong>重算流程</strong></td>
              <td>
                ① <strong>第 1 级</strong>（计件提成 / 超产值奖金 / 超时加班费 / 投诉扣款）按主体归集业绩<br/>
                ② <strong>第 2 级</strong>（保底获豆 / 个税预扣）依赖第 1 级结果按主体计算<br/>
                ③ <strong>系统项</strong>：社保 / 公积金（老系统读取）按主体入账；个税（非全日制/兼职）按主体调用百旺<br/>
                ④ <strong>负工资抵扣</strong>：工资条应发 &gt; 0 时按<strong>员工级</strong>负工资余额抵扣（与主体无关）<br/>
                ⑤ 生成该主体下的<strong>工资条</strong>（1 条或多条）→ 应发 / 实发<br/>
                ⑥ 重算完成后<strong>按主体覆盖</strong>原数据（同一工资单同一周期同一主体）
              </td>
            </tr>
            <tr>
              <td><strong>测试场景</strong></td>
              <td>
                · <strong>全职（单主体）</strong>：1 主体 1 周期 N 条工资条（含负工资 / 常乐豆代缴公积金个人部分 / 激励补贴）<br/>
                · <strong>非全日制（多主体）</strong>：1 员工跨 N 门店 = N 主体，每主体独立结算 + 独立预扣（每周 3%）+ 月末每主体独立汇算<br/>
                · <strong>兼职（多主体，倒序申报）</strong>：应税金额大者先报，每主体 1 次调百旺，<strong>验证跳档与补缴 / 退税归属到正确主体最后一条工资条</strong><br/>
                · <strong>返聘（单主体）</strong>：1 主体 1 周期，无社保 / 公积金 / 常乐豆<br/>
                · <strong>混合：同员工多合作模式</strong>（如主职全职 + 兼职挂店）——各合作模式按各自主体分别重算，<strong>不合并</strong>
              </td>
            </tr>
            <tr>
              <td><strong>数据结果验证点</strong></td>
              <td>
                ① 同一主体内<strong>所有工资条金额合计</strong> = 该主体应发合计<br/>
                ② <strong>跨主体不串扰</strong>：A 主体工资条不包含 B 主体业绩；A 主体预扣个税不计入 B 主体<br/>
                ③ <strong>个税汇算补退归属</strong>：补缴 / 退税仅出现在<strong>该主体当月最后一条工资条</strong>，不单独生成汇算工资条<br/>
                ④ <strong>应税收入</strong>按主体聚合后符合公式（详见「应税收入计算规则」）<br/>
                ⑤ 重算前后<strong>付款单去重 6 字段</strong>（姓名 / 工号 / 工资批次 / 合同主体 / 合作模式 / 薪酬周期）一致 → 付款单数量正确
              </td>
            </tr>
            <tr>
              <td><strong>约束</strong></td>
              <td>· 重算<strong>不修改</strong>已发放工资条（仅作用于未发放或强制重算场景）<br/>· 重算<strong>不触发</strong>付款单自动重新生成（付款单独立管理）<br/>· 重算结果按主体落库后，<strong>同时记录</strong>「重算前金额 / 重算后金额 / 差异」用于审计追溯</td>
            </tr>
          </tbody>
        </table>

        <div class="note" style="background: hsl(var(--warning) / 0.05); border-left: 3px solid hsl(var(--warning)); margin-top: 12px; font-size: 13px;">
          <strong>关键：</strong>模块化薪酬的<strong>合作主体维度</strong>贯穿重算、计算、报税、发放全链路——<strong>1 员工跨 N 门店 = N 个独立计算 / 申报 / 发放单位</strong>，测试用例必须<strong>按主体拆分</strong>断言，<strong>不可</strong>用合并后的总金额反推主体间分配正确性。
        </div>
      </div>

      <div class="card">
        <h3 id="sup-2">离职员工：常乐豆相关文案与定时任务调整</h3>
        <div class="note" style="background: hsl(var(--muted) / 0.3); margin-bottom: 12px; font-size: 13px;">
          <strong>背景：</strong>常乐豆<strong>仅全职员工</strong>享有；离职时按规则处理（消费 / 提现 / 离职补偿等，详见「三、常乐豆」）。本次补丁对离职环节的<strong>短信 / 通话文案</strong>与<strong>常乐豆发放定时任务</strong>做精简处理。
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 80px;">编号</th>
              <th style="width: 200px;">调整项</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>a</td>
              <td><strong>离职短信 / 通话内容</strong>移除提醒常乐豆提现文案</td>
              <td>
                · <strong>原状：</strong>离职通知短信 / 通话话术中包含「离职后请及时提现常乐豆余额」等<strong>提现提醒</strong>文案<br/>
                · <strong>本次调整：</strong><strong>移除</strong>该提醒文案——离职环节不再主动提示员工提现常乐豆<br/>
                · <strong>保留：</strong>常乐豆账户体系内的<strong>提现功能本身仍可用</strong>（员工自行操作），仅<strong>取消主动外呼 / 短信提醒</strong><br/>
                · <strong>原因：</strong>避免在离职节点给员工带来额外打扰；常乐豆提现规则及入口已在员工自助端（App / 账户体系）常态化展示，无需在离职通知中再次强调
              </td>
            </tr>
            <tr>
              <td>b</td>
              <td><strong>离职人员</strong>常乐豆发放定时任务关闭</td>
              <td>
                · <strong>原状：</strong>存在<strong>定时任务</strong>定期扫描员工并<strong>发放常乐豆</strong>（如：营销折扣获豆 / 回头客补贴 / 保底获豆等）<br/>
                · <strong>本次调整：</strong><strong>离职状态员工</strong>（员工状态 = 离职）<strong>不再触发</strong>常乐豆发放定时任务——任务执行时<strong>过滤掉</strong>已离职员工<br/>
                · <strong>保留：</strong>在职员工的常乐豆发放定时任务<strong>正常运行</strong>不受影响<br/>
                · <strong>数据影响：</strong>离职员工离职日及之后<strong>不再产生</strong>任何常乐豆入账（保底获豆 / 营销折扣获豆 / 回头客补贴等<strong>全部停发</strong>）；离职日<strong>之前</strong>已生成的常乐豆仍按既有规则处理（消费 / 提现 / 离职补偿）
              </td>
            </tr>
          </tbody>
        </table>

        <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary)); margin-top: 12px; font-size: 13px;">
          <strong>实施要点：</strong><br/>
          · <strong>a 项（文案）</strong>涉及短信模板配置 + 通话话术手册，<strong>仅修改模板 / 话术</strong>，不动系统逻辑<br/>
          · <strong>b 项（定时任务）</strong>需在定时任务调度逻辑中<strong>增加「员工在职状态」过滤条件</strong>，任务执行时<strong>排除离职员工</strong>；建议同时<strong>记录过滤日志</strong>（被过滤的员工数 / 员工编号），便于审计追溯<br/>
          · 两项调整均<strong>仅作用于 v2-1 阶段</strong>已生效的范围，与现有常乐豆 4 步规则（抵公司部分 → 抵个人部分 → 转「激励补贴」入第 1 个工资条 → 剩余消费 / 提现）<strong>无冲突</strong>
        </div>
      </div>

    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../docs/components/DocShell.vue'

const tocItems = [
    { id: 'sup-1', label: '模块化薪酬重算和测试（按合作主体处理）' },
    { id: 'sup-2', label: '离职员工：常乐豆相关文案与定时任务调整' }
  ]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '产品需求v2（阶段1）', to: '/docs/product-v2-phase1' },
  { label: '十一、补充需求' }
]
</script>
