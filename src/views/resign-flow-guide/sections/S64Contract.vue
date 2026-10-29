<template>
  <DocShell
    :toc-items="tocItems"
    title="6.4 签署与补偿金明细"
    subtitle="签署决定这笔补偿金成不成立；金额由成立之后的计算产生、报税后定稿 —— 明细记录三段金额（预估 → 计算 → 发放）与差异"
    version="v0.3"
    date="2026-10-26"
    :breadcrumbs="breadcrumbs"
  >
    <div id="rf-fsm" class="section">
      <div class="section-header">
        <h2>6.4 签署与补偿金明细</h2>
        <DocCopyButton section-id="rf-fsm" />
      </div>
      <div class="func-entry"><strong>功能入口：</strong>Web → 离职 → 离职补偿金明细 · 签署状态列（<code>/resign-compensation-ledger</code>）</div>
      <DocScreens
        :images="[
          { src: compLedgerShot, label: '离职补偿金明细：顶部即签署状态机（待发起 → 待员工签署 → 员工已签 → 签署完成）' },
          { src: compDrawerShot, label: '单笔明细：签署状态与「补偿金成立」联动展示（待员工签署 → 待成立）' }
        ]"
      />

      <h3>6.4.1 签署状态机</h3>
      <h4 class="h4sub">适用范围与签署方式</h4>
      <div class="note">
        <strong>适用范围：</strong>只覆盖主动离职 / 协商一致解除劳动合同；<strong>异常监控【解除用工】不走签署</strong>，
        这类记录不进入状态机、明细上也不产生待签署行（见 6.3.6）。
        它的补偿金<strong>以「解除确认提交」为成立点</strong>，不经过「待成立 → 已成立」的翻牌。
      </div>
      <div class="note">
        <strong>签署走电子签，没有人工用印环节：</strong>发起 → 员工签署 → 电子签平台自动落章出证 → 签署完成。
        员工签完<strong>不需要再等公司盖章</strong>，所以「员工已签 → 签署完成」这一步是<strong>平台出证</strong>，不是人工审批动作 ——
        只有出证失败 / 超时才需要人工介入。
      </div>

      <h4 class="h4sub">正向主链路</h4>
      <div class="fsm-row">
        <template v-for="(n, i) in fsmMain" :key="n.key">
          <span :class="['fsm-node', { final: n.key === 'completed' }]">{{ n.label }}</span>
          <span v-if="i < fsmMain.length - 1" class="fsm-arrow">→</span>
        </template>
      </div>

      <h4 class="h4sub">失败分支</h4>
      <div class="fsm-row">
        <span class="fsm-node bad">已拒签</span>
        <span class="fsm-arrow">/</span>
        <span class="fsm-node bad">已作废</span>
      </div>

      <h4 class="h4sub">签署状态 → 补偿金成立</h4>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 200px;">签署状态</th>
            <th style="width: 110px;">补偿金</th>
            <th>接下来会发生什么</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in fsmRows" :key="s.state">
            <td><strong>{{ s.state }}</strong></td>
            <td><span :class="['eff', s.establish]">{{ s.establishText }}</span></td>
            <td>{{ s.desc }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div id="rf-amount" class="section">
      <div class="section-header">
        <h3>6.4.2 时间顺序与三段金额</h3>
      </div>
      <div class="note warn-note">
        <strong>容易写反的地方：</strong>签署那一刻，明细上只有一个<strong>预估</strong>（协商现金 + 常乐豆约数），
        <strong>并没有一个最终金额在那里等着被「生效」</strong>。
        签署成立的是<strong>这笔补偿金的协议</strong> —— 双方就「给不给、按什么构成给、走哪个出口」达成一致；
        <strong>真实金额是协议成立之后才被算出来的</strong>（次月 5 日冻结余额后跑批，6 日报税后定稿）。
        <br />
        算出来的值<strong>不需要再签一次确认</strong>，也不存在「签署让这个金额生效」这个动作 ——
        金额的定稿只跟计算与报税有关。所以正确的说法是 ——
        <strong>签署决定这笔补偿金成不成立；金额由成立之后的计算产生、报税后定稿。</strong>
      </div>

      <h4 class="h4sub">一条补偿金的时间顺序</h4>
      <ol class="chg-list">
        <li><strong>录入协商方案</strong>：人事在离职需求审核里填协商现金、选常乐豆出口 —— 得到<strong>预估</strong>（现金 + 常乐豆约数），此时金额尚未确定（录入规则见 6.3.5）。</li>
        <li><strong>发起签署 → 员工签署</strong>：走<strong>电子签</strong>，员工签完由平台自动落章出证，签署完成，<strong>协议成立</strong>。此刻明细上仍是预估，金额没有被改写。</li>
        <li><strong>次月 3 日 → 4 日晚</strong>：薪酬与常乐豆一起结算完，4 日晚把<strong>抵扣后的余额充值进常乐豆账户</strong> —— 钱进账户时余额就已经是准确的，不需要再等取数。</li>
        <li><strong>次月 5 日</strong>：离职通道按流程<strong>冻结</strong>这笔余额（冻结是唯一动作，不再等余额「可读」）；同日跑批取<strong>冻结值 + 协商现金</strong>、算【补偿金个税】—— 得到<strong>申报前的计算值</strong>。当月该抵扣的在 3 日已抵扣完，这里<strong>不再二次扣</strong>。</li>
        <li><strong>次月 6 日</strong>：<strong>报税</strong>（工资薪金 / 一次性补偿金两个科目分别申报）；税局返回后回写工资单与补偿金单，<strong>两张单的数据到此才完善</strong>。</li>
        <li><strong>报税之后 → 次月 9 日</strong>：数据完善才出付款单，9 日打款到账，到账金额与时间回写明细，与预估的差在此闭环。</li>
      </ol>

      <h4 class="h4sub">金额的三个时点：预估 → 计算 → 发放</h4>
      <p class="doc-p">
        同一条时间线上，金额有<strong>三种形态</strong>：因为从签协议到真正打款，中间还隔着两件会改变金额的事 ——
        <strong>员工可能继续上班</strong>（常乐豆余额继续变）、<strong>当月工资的负数会用常乐豆抵扣</strong>（3 日算、4 日晚充值进账户，余额即抵扣后的值）。
        所以签协议时只能给预估值，计算才是结算后的真实数，发放才是最终到账数。
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 80px;">时点</th>
            <th style="width: 180px;">什么时候</th>
            <th>金额是什么</th>
            <th style="width: 150px;">数从哪来</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>预估</strong></td>
            <td><strong>签署发起时</strong>（离职流程内录入）</td>
            <td>
              <strong>协商现金 + 常乐豆出口余额（约）</strong>。常乐豆一律标「约」，它还不是结算后的真实值 ——
              这是签协议时双方看到的数
            </td>
            <td>人事录入 + 常乐豆 / 负工资余额</td>
          </tr>
          <tr>
            <td><strong>计算</strong></td>
            <td><strong>次月 5 日</strong>（冻结后跑批）<br />→ <strong>6 日报税后定稿</strong></td>
            <td>
              <strong>协商现金 + 冻结值</strong>（冻结值已含当月负工资等抵扣，<strong>不再二次扣</strong>），
              再算<strong>【补偿金个税】</strong>，得出<strong>申报前的计算值</strong>；
              6 日报税、税局返回后回写，<strong>个税与实发在此定稿</strong>（税前 / 税 / 实发三段都留）
            </td>
            <td>数仓取数 + 薪酬计算 + 报税</td>
          </tr>
          <tr>
            <td><strong>发放</strong></td>
            <td><strong>次月 9 日</strong>（发薪日）</td>
            <td>6 日报税、两张单数据完善后才出付款单；9 日打款，<strong>到账金额与到账时间回写明细</strong>，与预估的差在此闭环</td>
            <td>付款单 / 银行回执</td>
          </tr>
        </tbody>
      </table>

      <div class="note" style="background: hsl(var(--primary) / 0.05); border-left: 3px solid hsl(var(--primary));">
        <strong>为什么三段都得留（一个具体例子）：</strong>
        签署发起时，常乐豆约 <strong>300</strong> + 协商现金 <strong>1000</strong> = 预估 <strong>约 1,300</strong>；
        员工继续出勤到 10-31，11/3 结算后常乐豆为 <strong>370</strong>，其中 <strong>50 抵了当月负工资</strong>，
        11/4 晚进账户的余额 <strong>320</strong>（5 日冻结锁定）—— 税前 <strong>1,320</strong>（1000 + 320），
        补偿金个税 <strong>27</strong>，9 日实际到账 <strong>1,293</strong>，比预估<strong>少 7</strong>。
        只记一个金额的话，这 7 块既解释不了、也追溯不到为什么从 300 变成了 320；所以明细要同时留「预估 / 计算 / 发放」+ <strong>差异原因</strong>。
      </div>
    </div>

    <div id="rf-detail" class="section">
      <div class="section-header">
        <h3>6.4.3 明细要回答的五件事</h3>
      </div>
      <p class="doc-p">
        明细页是<strong>只读账本</strong>：录入发生在离职流程内（见 6.3.5），这里只负责让每一笔钱「谁记的、凭什么、算了多少、发了多少、算不算数」都能被追问。
      </p>
      <div class="rf-grid">
        <div class="rf-card" v-for="c in compKeys" :key="c.title">
          <div class="rf-card-title">{{ c.title }}</div>
          <div class="rf-card-desc">{{ c.desc }}</div>
        </div>
      </div>

      <h4 class="h4sub">状态与成立</h4>
      <ul class="rf-list">
        <li>明细的<strong>签署状态跟随上面这台状态机</strong>（6.4.1），不独立判定。</li>
        <li><strong>签署只管「这笔补偿金成不成立」</strong>，不产生金额、也不改变 5 日跑批、6 日报税、9 日发放的节奏 —— 协议线与算钱线并行，互不替代。</li>
        <li>签署时明细上是<strong>预估</strong>；<strong>计算值在协议成立之后、次月 5 日跑批才产生</strong>，6 日报税后定稿（都是按规则算的，不需要再签一次确认）。</li>
        <li>金额的最终去向仍是<strong>薪酬按规则结算</strong>（实现见 6.5）；明细只记录三段金额与差异原因，<strong>不参与计算</strong>。</li>
        <li>明细为<strong>只读视图</strong>：录入发生在离职流程内（离职需求审核环节人工填写），明细本身不提供新增录入。</li>
      </ul>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'
import DocScreens from '../../../docs/components/DocScreens.vue'
import compLedgerShot from '../../../docs/assets/pages/resign-comp-ledger.png'
import compDrawerShot from '../../../docs/assets/pages/resign-comp-drawer.png'

const fsmMain = [
  { key: 'draft', label: '待发起签署' },
  { key: 'sent', label: '待员工签署' },
  { key: 'employee_signed', label: '员工已签' },
  { key: 'completed', label: '签署完成' }
]

const fsmRows = [
  { state: '待发起签署 / 待员工签署 / 员工已签', establish: 'pending', establishText: '待成立', desc: '签署未完成，这笔补偿金还定不下来，不进入计算' },
  { state: '签署完成', establish: 'established', establishText: '已成立', desc: '协议成立，进入次月 5 日跑批；金额此时才产生，6 日报税后定稿' },
  { state: '已拒签 / 已作废', establish: 'void', establishText: '已作废', desc: '协议不成立，不进入计算，也不产生这笔钱' }
]

const compKeys = [
  { title: '① 谁输入的', desc: '输入人 + 角色（HR / 薪酬专员）+ 输入时间' },
  { title: '② 依据在哪', desc: '协商协议附件（PDF / 图片），金额 > 0 时必传，随记录留档可回看' },
  { title: '③ 预估多少', desc: '签署发起时的快照：协商现金 + 常乐豆出口（标「约」），并给出构成' },
  { title: '④ 算出来多少', desc: '次月 5 日冻结后跑批：常乐豆冻结值（已含当月抵扣）、税前、补偿金个税、实发' },
  { title: '⑤ 发了多少 / 状态', desc: '9 日到账金额与时间 + 与预估的差；状态跟随离职合同签署状态机' }
]

const tocItems = [
  { id: 'rf-fsm', label: '6.4.1 签署状态机' },
  { id: 'rf-amount', label: '6.4.2 时间顺序与三段金额' },
  { id: 'rf-detail', label: '6.4.3 明细要回答的五件事' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '离职流程', to: '/docs/resign-flow' },
  { label: '六、功能详细说明', to: '/docs/resign-flow/features' },
  { label: '6.4 签署与补偿金明细' }
]
</script>

<style scoped src="./doc-base.css"></style>
<style scoped src="./flow-parts.css"></style>

<style scoped>
.warn-note {
  background: hsl(0 72% 51% / 0.06);
  border-left: 3px solid hsl(0 72% 51% / 0.6);
}
</style>
