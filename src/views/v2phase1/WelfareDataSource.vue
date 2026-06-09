<template>
  <DocShell
    :toc-items="tocItems"
    title="二、福利数据来源（老系统）"
    subtitle='v2-1 阶段<strong>员工福利保障模块整体不开发</strong>：社保/公积金个人部分 ← 老系统接口只读；商业险 ← 线下购买（不进系统）'
    version="v2.1-phase1"
    date="2026-06-06"
    :breadcrumbs="breadcrumbs"
  >
    <div id="welfare-data-source" class="section">
      <h2>二、福利数据来源（老系统）</h2>
      <div class="note" style="background: hsl(var(--warning) / 0.08); border-left: 3px solid hsl(var(--warning)); padding: 10px 12px; margin-bottom: 16px; font-size: 13px; border-radius: 4px;">
        <strong>⚠️ 阶段1 关键裁剪：</strong>v2 完整版中独立的【员工福利保障】模块在 v2-1 阶段<strong>整体不开发</strong>。本节明确说明福利数据<strong>从哪来</strong>、<strong>不开发什么</strong>、<strong>商业险怎么处理</strong>。
      </div>

      <div class="card">
        <h3 id="welfare-types">① 各类型福利数据来源（v2-1 一览）</h3>
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
              <td>每结算周期调用接口读取；<strong>员工足额自付</strong>，<strong>不参与常乐豆抵扣</strong></td>
              <td>代扣公积金（金额 = 老系统返回值，<strong>个人部分</strong>）</td>
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
              <td><strong>暂不进入系统（线下购买）</strong></td>
              <td>由<strong>线下</strong>完成购买，<strong>成本归公司</strong></td>
              <td>—（<strong>不进员工工资条</strong>）</td>
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
          <strong>关键结论：</strong>v2-1 阶段本系统<strong>只读取 2 类数据</strong>：① 社保/公积金个人部分金额（来自老系统接口） ② 商业险线下购买（不进系统）；其余福利数据（公司部分、城市基准系数、月度流水、Override 等）<strong>全部由老系统维护</strong>。
        </div>
      </div>

      <div class="card" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary));" id="legacy-api">
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
              </div>

      <div class="card" style="background: hsl(var(--warning) / 0.05); border-left: 3px solid hsl(var(--warning));" id="commercial-insurance">
        <h3>③ 商业险线下购买（暂不进入系统）</h3>
        <p>v2-1 阶段商业险<strong>暂不进入新系统</strong>，由<strong>线下</strong>完成购买，<strong>成本归公司</strong>。本系统不开发商业险库配置页、不做城市/险种选择、不做入职时选商业险流程、不显示在工资条/福利明细中。</p>
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
              <td>购买方式</td>
              <td><strong>线下完成</strong></td>
              <td>由公司<strong>线下</strong>统一购买，<strong>不进新系统</strong></td>
            </tr>
            <tr>
              <td>成本承担</td>
              <td><strong>公司全额</strong></td>
              <td>成本归公司，<strong>不计入员工工资</strong>、<strong>不进员工工资条</strong></td>
            </tr>
            <tr>
              <td>员工个人部分</td>
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
              <td>v2-1 不实现，到期后由业务方线下续保</td>
            </tr>
          </tbody>
        </table>
        <div class="note">
          <strong>关键：</strong>商业险在 v2-1 阶段对员工/HR/工资条<strong>完全不可见</strong>，由<strong>线下完成购买</strong>，<strong>成本归公司</strong>。<strong>未来升级路径</strong>：v2-2 阶段再开发商业险库配置页、入职选商业险流程、月度福利明细、续保提醒等。
        </div>
      </div>

      <div class="card" style="background: hsl(var(--muted) / 0.3);" id="not-in-v21">
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
              <td><strong>不开发</strong>，<strong>线下购买</strong></td>
              <td>见上文 ③ 商业险（暂不进入系统）</td>
            </tr>
            <tr>
              <td>入职时选商业险流程</td>
              <td><strong>不开发</strong></td>
              <td>线下购买，<strong>无需选择</strong></td>
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

      <div class="card" id="v21-maintains">
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
  </DocShell>
</template>

<script setup>
import DocShell from '../../docs/components/DocShell.vue'

const tocItems = [
  { id: 'welfare-types', label: '① 各类型福利数据来源' },
  { id: 'legacy-api', label: '② 老系统接口契约' },
  { id: 'commercial-insurance', label: '③ 商业险线下购买' },
  { id: 'not-in-v21', label: '④ v2-1 不开发内容' },
  { id: 'v21-maintains', label: '⑤ v2-1 仍需维护的数据' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '产品需求v2（阶段1）', to: '/docs/product-v2-phase1' },
  { label: '二、福利数据来源' }
]
</script>
