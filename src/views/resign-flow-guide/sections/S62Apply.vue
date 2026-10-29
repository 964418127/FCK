<template>
  <DocShell
    :toc-items="tocItems"
    title="6.2 离职需求发起"
    subtitle="员工侧把「我要离职」变成一条可被处理的离职需求：两步填报 + 签字确认，提交后只等审核，不在这一侧做审核与结算"
    version="v0.3"
    date="2026-10-26"
    :breadcrumbs="breadcrumbs"
  >
    <div class="section">
      <div class="section-header">
        <h2>6.2 离职需求发起</h2>
        <DocCopyButton section-id="rf-61" />
      </div>
      <div class="func-entry"><strong>功能入口：</strong>移动端 → 离职模块 → <strong>离职需求</strong>（原型 <code>/mobile-resign-apply</code>）</div>
      <DocScreens
        mode="phone"
        :images="[
          { src: mApplyShot, label: '第一步：我的信息（档案带出只读）+ 离职意向（日期 / 原因多选）' },
          { src: mApplySignShot, label: '第二步：签字确认，提交后进入「离职处理」' }
        ]"
      />
      <div class="note">
        <strong>两侧分工：</strong>员工在这一侧<strong>发起一条「离职需求」</strong>；需求进入处理侧后先经<strong>离职需求审核</strong>（见 6.3），
        确认后进入按岗位的<strong>交接流程</strong>（见 6.1），交接全部完成<strong>系统自动推送离职合同</strong>。
        发起侧只采集与确认，<strong>不做审核、不做结算</strong>。
      </div>
    </div>

    <div id="rf-61-fill" class="section">
      <div class="section-header">
        <h3>6.2.1 员工填报（移动端 · 两步 + 结果页）</h3>
      </div>
      <p class="doc-p">结构统一为一张通用发起单，三类人员共用；差异只落在<strong>字段集</strong>与<strong>审核链</strong>上（见 6.2.4）。</p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 120px;">步骤</th><th style="width: 190px;">页面内容</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>1 申请离职</strong></td><td>我的信息 / 离职意向 / 收款账户 / 审核链</td><td>四个区块自上而下；「我的信息」与「收款账户」只读带出，「离职意向」由员工填写</td></tr>
          <tr><td><strong>2 签字确认</strong></td><td>确认卡 / 本人签字 / 提交后说明</td><td>第一步填的内容汇总成一张确认卡；签名 + 勾选《离职办理须知》后才能提交</td></tr>
          <tr><td><strong>结果页</strong></td><td>需求编号 / 待审核 / 接下来三步</td><td>只读，告知审核、交接、签署的先后</td></tr>
        </tbody>
      </table>

      <h4 class="h4sub">字段与控件</h4>
      <table class="data-table">
        <thead>
          <tr><th style="width: 120px;">区块</th><th style="width: 200px;">字段</th><th style="width: 150px;">控件 / 形态</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr>
            <td rowspan="2"><strong>我的信息</strong></td>
            <td>姓名 / 工号 / 岗位 / 用工类型 / 入职日期</td>
            <td>只读文本</td>
            <td>新员工关系带出，员工不能改</td>
          </tr>
          <tr>
            <td>技法 · 等级 · 合同门店（推拿师）<br />合同门店（客户经理）<br />所在部门（总部）</td>
            <td>只读文本，<strong>按岗位渲染</strong></td>
            <td>随岗位自动判断，不设分组标题；门店统一叫「合同门店」</td>
          </tr>
          <tr>
            <td><strong>离职意向</strong></td>
            <td>期望离职日期 / 离职原因 + 补充说明</td>
            <td>日期选择器 + 标签多选 + 多行文本（200 字）</td>
            <td>日期必填；原因<strong>至少选 1 项</strong>，说明选填。期望日期是员工想哪天走，与审核时定的实际离职日期不是一回事</td>
          </tr>
          <tr>
            <td><strong>收款账户</strong></td>
            <td>银行卡户名 / 卡号 / 开户行</td>
            <td>只读文本</td>
            <td>来源新员工关系；本页不提供改卡入口，提示去档案更新</td>
          </tr>
          <tr>
            <td><strong>审核链</strong></td>
            <td>审核链（逐级展示）</td>
            <td>只读流程节点</td>
            <td>按离职流程模板的<strong>离职需求审核</strong>配置带出（1~3 级、多人或签 / 会签，见 6.1）</td>
          </tr>
          <tr>
            <td><strong>签字</strong></td>
            <td>签名 / 同意须知</td>
            <td>签名框 + 勾选框</td>
            <td>均必填；签名代表确认信息真实无误</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div id="rf-61-check" class="section">
      <div class="section-header">
        <h3>6.2.2 校验与提示</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">按钮</th><th style="width: 170px;">位置</th><th>可点条件（缺一即置灰）</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>下一步</strong></td><td>底部操作条（第一步）</td><td>已选<strong>期望离职日期</strong> 且 <strong>离职原因至少 1 项</strong></td></tr>
          <tr><td><strong>返回修改</strong></td><td>底部操作条（第二步）</td><td>随时可点；回到第一步，已填内容保留</td></tr>
          <tr><td><strong>提交离职需求</strong></td><td>底部操作条（第二步）</td><td>已<strong>签名</strong> 且 已<strong>勾选同意须知</strong></td></tr>
        </tbody>
      </table>
      <p class="doc-p">置灰时底部提示说明还缺什么（例：<em>请选择期望离职日期并至少选择一项离职原因</em>）；提交中禁止重复点击，成功后跳结果页。</p>
    </div>

    <div id="rf-61-after" class="section">
      <div class="section-header">
        <h3>6.2.3 提交后系统做什么</h3>
      </div>
      <ul class="rf-list">
        <li>生成一条<strong>需求编号</strong>（例：RQ20261019001），状态置为<strong>待审核</strong>，员工侧不可再改。</li>
        <li>需求出现在人事的<strong>离职处理 → 主动离职</strong>列表（见 6.3.1），审核人按模板审核链逐级确认。</li>
        <li>审核确认后：实际离职日期锁定、排班取消与接单截断<strong>即时生效</strong>，单据进入<strong>交接流程</strong>（见 6.1）。</li>
        <li>交接全部办结后<strong>系统自动推送离职合同</strong>（见 6.4），员工在线签署；离职当月剩余权益由人事与员工协商，不在本页填写。</li>
      </ul>
    </div>

    <div id="rf-61-people" class="section">
      <div class="section-header">
        <h3>6.2.4 三类人员的差异</h3>
      </div>
      <p class="doc-p">
        结构统一，但<strong>展示的信息随岗位不同</strong>，审核链也随之不同。差异只体现在<strong>字段集</strong>上，<strong>不设分组标题</strong>；
        正式开发由新员工关系<strong>自动判断岗位</strong>，无需人工选择。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 110px;">岗位</th><th style="width: 250px;">岗位差异字段</th><th>审核链（模板配置示例）</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>推拿师</strong></td>
            <td>技法 · 等级 · 合同门店</td>
            <td>1 级人事经理，按城市指定到人（成都另配「人事经理 → 城市总」两级模板，越具体越优先命中）；抄送招生老师 / 技术副总 / 城市总 / 法务专员</td>
          </tr>
          <tr>
            <td><strong>客户经理</strong></td>
            <td>合同门店</td>
            <td>1 级人事经理（同上）；抄送招生老师 / 法务专员</td>
          </tr>
          <tr>
            <td><strong>总部</strong></td>
            <td>所在部门（<strong>无技法、无门店</strong>）</td>
            <td>两级模板示例：部门上级（按组织解析）→ 人事经理；抄送法务专员</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>精简原则：</strong>发起单只收<strong>与这笔离职相关</strong>的档案信息，不复制档案全量 ——
        客户经理不展示等级与在管会员、总部不展示职级，它们不影响离职办理，也不影响下游结算。
      </div>
    </div>

    <div id="rf-61-rule" class="section">
      <div class="section-header">
        <h3>6.2.5 统一口径与发起侧边界</h3>
      </div>
      <h4 class="h4sub">三条统一口径</h4>
      <ul class="rf-list">
        <li><strong>流程统一为两步：申请离职 → 签字确认。</strong>总部原先的单页提交并进来，同样走签字确认 —— 三类人员的「离职事实」由同一套签署动作产生，下游消费的时点才一致。</li>
        <li><strong>日期统一为「期望离职日期」。</strong>不再出现「最后工作日」；期望日期由员工填，实际离职日期由审核人填并锁定（见 6.3），两者不在同一层。</li>
        <li><strong>原因统一为「枚举多选 + 可选补充说明」。</strong>枚举（工资太低 / 离家太远 / 结婚生子 / 自主创业 / 照顾家庭）用于统计分析，补充说明承接自由文本表达。</li>
      </ul>
      <h4 class="h4sub">收款账户：引用档案，不在本页改</h4>
      <ul class="rf-list">
        <li><strong>用途：</strong>最后工资与一次性补偿金的收款账户 —— 它不是「员工填的信息」，而是<strong>钱的出口地址</strong>。</li>
        <li><strong>处理侧默认显示：</strong>人事审核页直接展示这三项，等于在批一笔钱之前先看到钱往哪打（见 6.3.2）。</li>
        <li><strong>不在本场景改：</strong>卡信息以新员工关系为准；本场景只呈现与留痕，不提供修改入口。</li>
      </ul>
      <h4 class="h4sub">发起侧不做什么</h4>
      <table class="data-table">
        <thead>
          <tr><th style="width: 200px;">不做的事</th><th>归谁</th></tr>
        </thead>
        <tbody>
          <tr><td>审核、驳回、作废</td><td>处理侧 · 离职需求审核（6.3.2）</td></tr>
          <tr><td>实际离职日期、离职类型、黑名单</td><td>处理侧 · 离职需求审核确认（6.3.2）</td></tr>
          <tr><td>剩余资产、款项出口、补偿金与协议</td><td>处理侧 · 6.3.3 / 6.3.4 / 6.3.5</td></tr>
        </tbody>
      </table>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'
import DocScreens from '../../../docs/components/DocScreens.vue'
import mApplyShot from '../../../docs/assets/pages/m-resign-apply.png'
import mApplySignShot from '../../../docs/assets/pages/m-resign-apply-sign.png'

const tocItems = [
  { id: 'rf-61-fill', label: '6.2.1 员工填报（两步 + 结果页）' },
  { id: 'rf-61-check', label: '6.2.2 校验与提示' },
  { id: 'rf-61-after', label: '6.2.3 提交后系统做什么' },
  { id: 'rf-61-people', label: '6.2.4 三类人员的差异' },
  { id: 'rf-61-rule', label: '6.2.5 统一口径与边界' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '离职流程', to: '/docs/resign-flow' },
  { label: '六、功能详细说明', to: '/docs/resign-flow/features' },
  { label: '6.2 离职需求发起' }
]
</script>

<style scoped src="./doc-base.css"></style>
