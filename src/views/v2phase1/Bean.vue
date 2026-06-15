<template>
  <DocShell
    :toc-items="tocItems"
    title="三、常乐豆"
    subtitle='仅<strong>全职</strong>享有，<strong>不参与应税收入</strong>；使用优先级 ① 抵公司部分 → ② 抵个人部分（最高 1200）→ ③ 转「激励补贴」入第 1 个工资条计入应税 → ④ 消费/提现'
    version="v2.1-phase1"
    date="2026-06-06"
    :breadcrumbs="breadcrumbs"
  >
    <div id="bean" class="section">
      <h2>三、常乐豆</h2>

      <div class="card" id="bean-scope">
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
              <td><strong>全职</strong>（劳动合同）</td>
              <td>✅ 有</td>
              <td>支持消费、抵扣、离职提现</td>
            </tr>
            <tr>
              <td><strong>非全日制</strong>（劳务协议）</td>
              <td>❌ 无</td>
              <td>不参与常乐豆体系</td>
            </tr>
            <tr>
              <td><strong>兼职</strong>（劳务合作）</td>
              <td>❌ 无</td>
              <td>不参与常乐豆体系</td>
            </tr>
            <tr>
              <td><strong>返聘</strong>（劳务合作-退休返聘）</td>
              <td>❌ 无</td>
              <td>不参与常乐豆体系</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card" id="bean-miniapp">
        <h3>常乐豆小程序可见范围</h3>
        <div class="note">
          <strong>常乐豆小程序中，不展示获豆明细</strong>，通过模块化薪酬<strong>只结算抵扣公积金后剩余的入账记录</strong>，以及<strong>使用这个余额产生的京东消费记录</strong>。
        </div>
      </div>

      <div class="card" id="bean-priority">
        <h3>常乐豆使用规则（优先级）</h3>
        <div class="note">
          <strong>核心规则：</strong>常乐豆<strong>优先抵扣公积金公司部分</strong>，<strong>剩余可继续抵扣公积金个人部分</strong>（最高 = 个人公积金总额，如 1200）；<strong>不抵扣社保、不抵扣商业险</strong>。
          <ol style="margin: 10px 0 0 20px; line-height: 2;">
            <li><strong>抵扣公积金公司部分</strong>：公司部分由<strong>老系统记账</strong>，<strong>不进员工工资条</strong>。若常乐豆<strong>不足</strong>，差额由<strong>公司现金补足</strong></li>
            <li><strong>抵扣公积金个人部分</strong>：最高不超过个人公积金总额（如 <strong>1200</strong>）。工资条上「代扣公积金」<strong>仍按全额显示</strong>（用于个税免税扣除）；不足部分由<strong>员工现金补差</strong></li>
            <li><strong>转「激励补贴」入第 1 个工资条</strong>：用于抵扣个人部分的常乐豆（最高 = 个人公积金总额），<strong>以「激励补贴」名义</strong>作为<strong>收入项</strong>加入<strong>第 1 个工资条</strong>，<strong>计入应税收入</strong></li>
            <li><strong>消费 / 提现</strong>：剩余可消费；<strong>离职时全额提现</strong></li>
          </ol>
          <strong style="display: block; margin-top: 8px;">⚠ 重要：</strong>工资条「代扣公积金」<strong>始终按全额显示</strong>（由老系统接口读取），与常乐豆无关。<strong>员工现金补差 = 全额 - 常乐豆代缴金额</strong>。
          <div style="margin-top: 12px; padding: 10px 12px; background: hsl(var(--muted) / 0.3); border-left: 3px solid hsl(var(--primary)); border-radius: 4px; font-size: 13px;">
            <strong>📌 边界场景：</strong>常乐豆账户存在<strong>剩余未消费豆</strong>，<strong>次月</strong>常乐豆<strong>不足抵扣公积金</strong>时，是否可以使用这笔豆？<br/>
            <strong>答：【不允许】</strong>——常乐豆<strong>不得跨月使用</strong>，仅可抵扣<strong>当月</strong>公积金。
          </div>
        </div>
      </div>

      <div class="card" id="bean-tax">
        <h3>常乐豆与应税收入</h3>
        <div class="note">
          <strong>重要说明：</strong>常乐豆<strong>不参与个税应税金额计算</strong>——常乐豆本身既不计入收入也不冲减收入。<br/><br/>
          <strong>特殊场景：常乐豆代缴公积金个人部分时</strong>，为保持工资条净到手与员工实收一致，公司会<strong>以「激励补贴」名义</strong>在第 1 个工资条中增加一笔等额收入，<strong>该「激励补贴」计入应税收入</strong>（作为 1 级收入项）——本质是公司替员工承担的公积金个人部分，<strong>属于员工的隐性收入</strong>，应当计入应税基数。
        </div>
      </div>

      <div class="card" id="bean-resign">
        <h3>离职补偿</h3>
        <div class="note">
          <strong>升级后：</strong>全职员工离职时，常乐豆账户中的<strong>未消费余额</strong>，以<strong>补偿金额</strong>发放给该员工。<br/><br/>
          <strong>生成方式：</strong>以<strong>单独的补偿工资条和付款单</strong>生成（<strong>不并入常规工资单</strong>），报税主体即为该员工的合同主体。<br/><br/>
          <strong>备注与避税：</strong>该笔费用作为<strong>补偿不需要报税</strong>，但需<strong>备注为【离职补偿】</strong>，以符合<strong>避税要求</strong>。
        </div>
      </div>

      <div class="card" id="bean-history">
        <h3>历史常乐豆处理</h3>
        <div class="note">
          <strong>历史豆清零：</strong>现有常乐豆需要进行清理，全部转化为现金提现。<br/><br/>
          <strong>提现方式：</strong>设置时间节点，在时间节点前的余额全部提现。
        </div>
      </div>

          </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../docs/components/DocShell.vue'

const tocItems = [
  { id: 'bean-scope', label: '常乐豆适用范围' },
  { id: 'bean-miniapp', label: '小程序可见范围' },
  { id: 'bean-priority', label: '使用规则（优先级）' },
  { id: 'bean-tax', label: '常乐豆与应税收入' },
  { id: 'bean-resign', label: '离职提现' },
  { id: 'bean-history', label: '历史常乐豆处理' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '产品需求v2（阶段1）', to: '/docs/product-v2-phase1' },
  { label: '三、常乐豆' }
]
</script>
