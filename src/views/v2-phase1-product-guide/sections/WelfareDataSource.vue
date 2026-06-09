<template>
      <div id="welfare-data-source" class="section">
        <h2>二、福利数据来源（老系统）</h2>
        <div class="note" style="background: hsl(var(--warning) / 0.08); border-left: 3px solid hsl(var(--warning)); padding: 10px 12px; margin-bottom: 16px; font-size: 13px; border-radius: 4px;">
          <strong>⚠️ 阶段1 关键裁剪：</strong>v2 完整版中独立的【员工福利保障】模块在 v2-1 阶段<strong>整体不开发</strong>。本节明确说明福利数据<strong>从哪来</strong>、<strong>不开发什么</strong>、<strong>商业险怎么处理</strong>。
        </div>

        <!-- 1. 各类型福利数据来源总览 -->
        <div class="card">
          <h3>① 各类型福利数据来源（v2-1 一览）</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>福利类型</th>
                <th>数据来源</th>
                <th>本系统使用方式</th>
                <th>对应工资条项</th>
                <th>适用对象</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>社保（全）</strong><br/>个人部分</td>
                <td><strong>老系统接口（只读）</strong></td>
                <td>每结算周期调用接口读取</td>
                <td>代扣社保（金额 = 老系统返回值）</td>
                <td>全职</td>
              </tr>
              <tr>
                <td><strong>社保（仅工伤）</strong><br/>个人部分</td>
                <td><strong>老系统接口（只读）</strong></td>
                <td>每结算周期调用接口读取</td>
                <td>—（<strong>不进入员工工资条</strong>，公司全额承担）</td>
                <td>非全日制</td>
              </tr>
              <tr>
                <td><strong>公积金</strong><br/>个人部分</td>
                <td><strong>老系统接口（只读）</strong></td>
                <td>每结算周期调用接口读取；可被常乐豆优先抵扣</td>
                <td>代扣公积金（金额 = 老系统返回值 - 常乐豆抵扣）</td>
                <td>全职</td>
              </tr>
              <tr>
                <td><strong>个税</strong></td>
                <td><strong>老系统（基础）+ 百旺服务（多轮）</strong></td>
                <td>· 全职/返聘：百旺 1 次/月<br/>· 非全日制/兼职：每周预扣 3%（系统自算）+ 月末按主体调百旺（多主体倒序）</td>
                <td>· 代扣个税（全职/返聘）<br/>· 预扣个税 + 补缴/退税（非全日制/兼职）</td>
                <td>全员</td>
              </tr>
              <tr>
                <td><strong>商业险</strong></td>
                <td><strong>默认机制（不开发配置页）</strong></td>
                <td>全员默认有 1 份商业险（后台硬编码）</td>
                <td>—（<strong>不进员工工资条</strong>，公司全额现金承担）</td>
                <td>全员</td>
              </tr>
              <tr>
                <td><strong>社保/公积金公司部分</strong></td>
                <td>—（本系统不关心）</td>
                <td>由老系统单独记账</td>
                <td>—（<strong>不进员工工资条</strong>，公司成本）</td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>关键结论：</strong>v2-1 阶段本系统<strong>只读取 2 类数据</strong>：① 社保/公积金个人部分金额（来自老系统接口） ② 商业险默认配置（硬编码）；其余福利数据（公司部分、城市基准系数、月度流水、Override 等）<strong>全部由老系统维护</strong>。
          </div>
        </div>

        <!-- 2. 老系统接口契约 -->
        <div class="card" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary));">
          <h3>② 老系统接口契约（占位，待与老系统团队对齐）</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>接口</th>
                <th>入参</th>
                <th>出参</th>
                <th>调用时机</th>
                <th>调用方</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>查询代扣社保</strong></td>
                <td>员工ID + 结算周期</td>
                <td>代扣社保金额（个人部分）</td>
                <td>step 6 应发收入计算完成后</td>
                <td>本系统（工资单计算）</td>
              </tr>
              <tr>
                <td><strong>查询代扣公积金</strong></td>
                <td>员工ID + 结算周期</td>
                <td>代扣公积金金额（个人部分）</td>
                <td>step 6 应发收入计算完成后</td>
                <td>本系统（工资单计算）</td>
              </tr>
              <tr>
                <td><strong>查询申报主体</strong></td>
                <td>员工ID</td>
                <td>合同主体（非全日制/兼职：业绩归属主体列表）</td>
                <td>入职时 + 主体变更时</td>
                <td>本系统（员工管理）</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>⚠️ 待对齐：</strong>具体接口路径、字段格式、错误码、超时策略、幂等性等需与老系统团队在开发前<strong>单独对齐</strong>。本文档仅明确<strong>调用边界与数据用途</strong>。
          </div>
        </div>

        <!-- 3. 商业险默认机制 -->
        <div class="card" style="background: hsl(var(--warning) / 0.05); border-left: 3px solid hsl(var(--warning));">
          <h3>③ 商业险默认机制</h3>
          <p>v2-1 阶段商业险<strong>不开发</strong>商业险库配置页、不做城市/险种选择、不做入职时选商业险流程。采取<strong>默认机制</strong>：</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>维度</th>
                <th>v2-1 处理方式</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>险种</td>
                <td><strong>1 份默认险种</strong></td>
                <td>具体险种/保额/保费由<strong>后端硬编码</strong>，不暴露给用户/HR</td>
              </tr>
              <tr>
                <td>适用对象</td>
                <td>全员（全职/非全日制/兼职/返聘）</td>
                <td>默认全员有 1 份商业险，无需在入职/分配时选择</td>
              </tr>
              <tr>
                <td>城市筛选</td>
                <td><strong>不筛选</strong></td>
                <td>默认险种全国适用</td>
              </tr>
              <tr>
                <td>公司部分金额</td>
                <td>公司全额现金承担</td>
                <td>由老系统/财务单独记账（<strong>不进员工工资条</strong>）</td>
              </tr>
              <tr>
                <td>员工部分金额</td>
                <td>—</td>
                <td>员工<strong>不缴</strong>，<strong>无代扣</strong></td>
              </tr>
              <tr>
                <td>是否进工资条</td>
                <td><strong>否</strong></td>
                <td>不显示任何商业险相关项（含公司部分/个人部分）</td>
              </tr>
              <tr>
                <td>是否显示在福利明细</td>
                <td><strong>否</strong></td>
                <td>v2-1 不开发福利明细页，<strong>完全不可见</strong></td>
              </tr>
              <tr>
                <td>续保提醒</td>
                <td>—</td>
                <td>v2-1 不实现，到期后由业务方手动续保</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>关键：</strong>商业险在 v2-1 阶段对员工/HR/工资条<strong>完全不可见</strong>，是<strong>后端静默处理</strong>的一项公司成本。<strong>未来升级路径</strong>：v2-2 阶段再开发商业险库配置页、入职选商业险流程、月度福利明细、续保提醒等。
          </div>
        </div>

        <!-- 4. v2-1 不开发内容 -->
        <div class="card" style="background: hsl(var(--muted) / 0.3);">
          <h3>④ v2-1 不开发内容（明确排除）</h3>
          <p>以下内容在 v2 完整版中存在，但 v2-1 阶段<strong>不开发</strong>，需明确排除：</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>v2 内容</th>
                <th>v2-1 处理</th>
                <th>理由</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>城市基准系数配置页</td>
                <td><strong>不开发</strong></td>
                <td>由老系统维护，本系统不重做</td>
              </tr>
              <tr>
                <td>员工福利保障页（岗位福利保障）</td>
                <td><strong>不开发</strong></td>
                <td>本系统不维护员工 ↔ 申报主体的福利关系</td>
              </tr>
              <tr>
                <td>Override 机制</td>
                <td><strong>不开发</strong></td>
                <td>无福利关系维护，Override 无载体</td>
              </tr>
              <tr>
                <td>社保月度流水页</td>
                <td><strong>不开发</strong></td>
                <td>由老系统维护，本系统不生成月度流水</td>
              </tr>
              <tr>
                <td>公积金月度流水页</td>
                <td><strong>不开发</strong></td>
                <td>由老系统维护，本系统不生成月度流水</td>
              </tr>
              <tr>
                <td>个税月度流水页（完整版）</td>
                <td><strong>不开发</strong></td>
                <td>由老系统维护；本系统只支持多轮调百旺</td>
              </tr>
              <tr>
                <td>3 个核心时间字段（费用产生/归属/实际缴纳月）</td>
                <td><strong>不开发</strong></td>
                <td>无月度流水，3 字段无载体</td>
              </tr>
              <tr>
                <td>feeType 分类（社保/公积金/个税/工伤/商业险）</td>
                <td><strong>不开发</strong></td>
                <td>无福利明细页，feeType 无用途</td>
              </tr>
              <tr>
                <td>滞纳金作为衍生项</td>
                <td><strong>不开发</strong></td>
                <td>由老系统处理</td>
              </tr>
              <tr>
                <td>商业险库（险种/城市/保额/保费/续保）</td>
                <td><strong>不开发</strong>，采用默认机制</td>
                <td>见上文 ③ 商业险默认机制</td>
              </tr>
              <tr>
                <td>入职时选商业险流程</td>
                <td><strong>不开发</strong></td>
                <td>默认机制下无选择</td>
              </tr>
              <tr>
                <td>保护模式选择（全额 vs 按基数）</td>
                <td><strong>不开发</strong></td>
                <td>由老系统配置</td>
              </tr>
              <tr>
                <td>调岗调薪重算福利明细</td>
                <td><strong>不开发</strong></td>
                <td>无福利明细维护</td>
              </tr>
              <tr>
                <td>离职社保/公积金转出</td>
                <td><strong>不开发</strong></td>
                <td>由老系统处理</td>
              </tr>
              <tr>
                <td>商业险续保提醒</td>
                <td><strong>不开发</strong></td>
                <td>由业务方手动续保</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 5. v2-1 仍需维护的福利相关数据 -->
        <div class="card">
          <h3>⑤ v2-1 仍需维护的福利相关数据</h3>
          <p>虽然【员工福利保障】模块整体不开发，但以下与福利相关的数据<strong>本系统必须自维护</strong>（用于工资条计算）：</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>数据</th>
                <th>维护方</th>
                <th>用途</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>员工<strong>合同主体</strong></td>
                <td>本系统（员工管理）</td>
                <td>确定发放主体、判断全职/返聘是否挂店</td>
              </tr>
              <tr>
                <td>员工<strong>业绩归属主体列表</strong>（非全日制/兼职）</td>
                <td>本系统（员工管理）</td>
                <td>确定每条工资条的发放主体、每主体独立结算</td>
              </tr>
              <tr>
                <td>员工<strong>岗位</strong>（含用工类型）</td>
                <td>本系统（员工管理）</td>
                <td>匹配薪酬模板、确定计算逻辑</td>
              </tr>
              <tr>
                <td>员工<strong>归属城市</strong></td>
                <td>本系统（员工管理）</td>
                <td>占位用，本系统不计算福利金额（老系统算）</td>
              </tr>
              <tr>
                <td>员工<strong>常乐豆余额</strong></td>
                <td>本系统（推拿之家-常乐豆账户）</td>
                <td>常乐豆抵扣规则、离职提现</td>
              </tr>
              <tr>
                <td>员工<strong>负工资余额</strong></td>
                <td>本系统（负工资账户）</td>
                <td>负工资抵扣规则、离职处理</td>
              </tr>
            </tbody>
          </table>
          <div class="note">
            <strong>关键：</strong>本系统<strong>不维护</strong>城市基准系数、社保/公积金个人/公司部分金额、商业险明细、月度流水、Override 等<strong>任何福利金额数据</strong>。所有福利金额<strong>调用老系统接口</strong>或<strong>由老系统单独记账</strong>。
          </div>
        </div>
      </div>

</template>
