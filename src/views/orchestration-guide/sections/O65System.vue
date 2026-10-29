<template>
  <DocShell
    :toc-items="tocItems"
    title="6.5 系统判定与系统执行"
    subtitle="判定看批次，执行看回执；取数频率归节点，结果按字段被下游引用 —— 都没人按钮"
    version="v0.1"
    date="2026-10-30"
    :breadcrumbs="breadcrumbs"
  >
    <div id="orch-65" class="section">
      <div class="section-header">
        <h2>6.5 系统判定与系统执行</h2>
        <DocCopyButton section-id="orch-65" />
      </div>

      <div class="func-entry"><strong>功能入口：</strong>Web → 系统项（判定项 / 执行项目录与状态）→ 事件定义页的子事件里引用；办结情况在「事件数据」与该单的办理页展示，<strong>处理人侧只有只读视图</strong></div>

      <h3 id="orch-65-1">6.5.1 两类系统项，别混</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 120px;">类型</th><th style="width: 200px;">它做什么</th><th style="width: 190px;">凭什么算完成</th><th>失败会怎样</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>系统判定</strong></td>
            <td>去查一个已经登记好的检查项，<strong>只出结论、不改任何数据</strong></td>
            <td><strong>批次结果</strong>：某个批次里这个人被判为通过 / 未通过</td>
            <td>继续取下一批，直到<strong>批次上限</strong>用完 → 按门禁处理</td>
          </tr>
          <tr>
            <td><strong>系统执行</strong></td>
            <td>调一个已登记的动作<strong>改数据</strong>（撤权限、推合同、广播结果、归档…）</td>
            <td><strong>回执</strong>：动作是否执行成功、影响谁、回了什么</td>
            <td>重试到次数上限 → 转人工（写进这条系统项的失败出口）</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>判定的条件不归我们配。</strong>「负债多少算未结清」「客诉什么状态算未完结」由<strong>检查 Agent</strong> 自己定义（人员对话式配置、测试后上线）；
        流程侧只配四件事：<strong>门禁、前置、取数频率、批次上限</strong>。这条边界不清，流程就会变成第二个规则引擎。
      </div>

      <h3 id="orch-65-2">6.5.2 判定：两层频率，别混为一谈</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 190px;">频率</th><th style="width: 200px;">归谁</th><th>含义</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>Agent 运行节奏</strong></td><td>检查 Agent 自己</td><td>它多久盘查一轮、什么时候出新批次 —— <strong>不在事件定义里，也不该在这里配</strong></td></tr>
          <tr><td><strong>取数频率</strong></td><td>这条子事件（节点）</td><td>这一单多久去取一次<strong>最新批次结果</strong>（间隔值 + 单位，或只取一次）。取数快于出批，会反复取到同一批</td></tr>
          <tr><td><strong>批次上限</strong></td><td>这条子事件（节点）</td><td>最多消费几个<strong>不同的未通过批次</strong> —— 到上限仍未通过，就按门禁处置</td></tr>
        </tbody>
      </table>
      <p class="doc-p">
        <strong>为什么只计「消费到的不同未通过批次」：</strong>如果按「取了几次」算次数，取数比出批快时，
        同一个批次会被取到好几次，节点很快「超时」—— 判的不是事实，是轮询次数。
        <strong>必须按批次算</strong>：同一批次反复取到不重复计数，只换批次才 +1。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 190px;">节点激活时</th><th>做什么</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>前置刚满足</strong></td><td>立刻取一次<strong>该单最新的批次结果</strong> —— 不空转到下一个取数周期</td></tr>
          <tr><td><strong>已经有结论</strong></td><td>如果最新批次里这个人已通过，直接办结，不再继续取</td></tr>
          <tr><td><strong>未通过</strong></td><td>记一次未通过批次，按取数频率继续；到批次上限仍不过 → 必过项<strong>终止全部流程</strong>，可选项<strong>只记录并解锁下游</strong></td></tr>
        </tbody>
      </table>

      <h3 id="orch-65-3">6.5.3 判定结果的界面口径</h3>
      <DocScreens :images="[{ src: systemShot, label: '办理页「在等系统 / 对方」段：每条系统项写清判定项、取数频率、当前指标原值、已取几次 / 消费几个未通过批次 / 下次取数时间' }]" mode="phone" />
      <p class="doc-p">
        系统项<strong>没有办理按钮</strong>，所以界面上必须把「它在干什么」讲清楚，否则责任人只会觉得「卡住了」：
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 190px;">要显示</th><th>示例</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>在等什么</strong></td><td>资产台账核销中：工服 1 件待销账</td></tr>
          <tr><td><strong>取了几次、消费了几个未通过批次</strong></td><td>已取 3 次 · 消费 2 个未通过批次 · 下次 2026-10-18 09:00</td></tr>
          <tr><td><strong>还能等多久</strong></td><td>批次上限 5，已用 2 —— 也就是「再等 3 批」</td></tr>
          <tr><td><strong>超限之后会怎样</strong></td><td>必过项：到上限仍未通过将终止全部流程；可选项：记录后继续</td></tr>
        </tbody>
      </table>

      <h3 id="orch-65-4">6.5.4 执行：对谁执行、失败怎么办</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">配置</th><th style="width: 230px;">取值</th><th>例子</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>执行对象</strong></td><td>整单执行一次 / 对事实里的目标逐个执行</td><td>广播结果：整单一次；撤权限：对这个人名下的每个账号逐个撤</td></tr>
          <tr><td><strong>失败重试</strong></td><td>次数上限 + 间隔</td><td>推合同失败重试 3 次，每次间隔 10 分钟</td></tr>
          <tr><td><strong>失败出口</strong></td><td>重试用完仍未成功 → <strong>转人工</strong>，由指定角色接手</td><td>「推送合同 3 次失败，转人事手动推送」—— 不是静默失败，也不是自动判通过</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>一条结论只留一种兑现方式。</strong>不要让「系统执行」再并一条「人工确认通过」的路径 ——
        多条路径是「或」关系，等于系统没成功、人点一下也算达成，系统项就白做了。要兜底，写进<strong>失败出口</strong>。
      </div>

      <h3 id="orch-65-5">6.5.5 外部回执：四样必须写清</h3>
      <p class="doc-p">
        对方在自己的系统里动手（员工在电子签平台签署、第三方在外部平台确认），我方只能等。这条路径必须写清四样，缺一样就不合格：
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">要素</th><th style="width: 230px;">写什么</th><th>离职签署的实例</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>谁动手</strong></td><td>回执方</td><td>电子签平台</td></tr>
          <tr><td><strong>由哪个动作触发</strong></td><td>我方先把什么送过去</td><td>推送电子合同（送达后才可能签）</td></tr>
          <tr><td><strong>回哪些字段</strong></td><td>回执字段清单：名字 + 可能取值</td><td>员工签署状态（已签署 / 已拒签 / 待签署）、签署时间、外部单号</td></tr>
          <tr><td><strong>写回哪个结果字段</strong></td><td>落在这条结论的哪个字段上，供下游引用</td><td><span class="mono">signState</span></td></tr>
          <tr><td><strong>多久没回算超时</strong></td><td>超时后转人工跟进</td><td>7 天</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>动作回执只证明「送达」，不证明「签了」。</strong>
        「推送电子合同成功」是一个系统执行的回执；「员工签署完成」是另一条外部回执的子事件。
        两者合并，就会出现「合同推送成功 = 签署完成」的假结论 —— 这是最容易犯、也最难发现的一类错。
      </div>

      <h3 id="orch-65-6">6.5.6 结果被下游引用：按「结论 · 字段」取值</h3>
      <p class="doc-p">
        上游子事件办结时填下的值，下游系统项可以直接引用，不必再让人填一遍。引用写法是<strong>「结果：某条结论 · 某字段」</strong>：
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 230px;">引用写法</th><th>含义</th></tr>
        </thead>
        <tbody>
          <tr><td><span class="mono">结果：人事已审核通过 · 款项出口</span></td><td>取那条已办结记录里<strong>字段名为「款项出口」</strong>的值</td></tr>
          <tr><td><span class="mono">结果：城市总已审核通过 · 实际离职日期</span></td><td>同一个字段可能被多条下游引用，取值只认<strong>已办结</strong>的那条</td></tr>
        </tbody>
      </table>
      <table class="data-table">
        <thead>
          <tr><th style="width: 210px;">取不到值怎么办</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>那条还没办结</strong></td><td>前置保证它已经办结；若因中期调整删掉了它，引用视为<strong>缺失</strong>，按失败处理并说明</td></tr>
          <tr><td><strong>字段为空</strong></td><td>按空值执行，并在回执里写明「按空值执行」—— <strong>不装知道</strong>，不猜一个默认值</td></tr>
          <tr><td><strong>值类型不符</strong></td><td>拒绝执行并报错；不做隐式转换（「并入薪金」不能变成金额）</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>下游拿到的必须是「事实」，不是「判断」。</strong>
        我们交付的是「他的离职结果是什么、从哪天起、钱从哪个出口走」这类可核对的值；
        下游拿这些值去算自己的东西（薪酬算个税、假勤截断额度），<strong>我们不算</strong>（见 6.6.4）。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'
import DocScreens from '../../../docs/components/DocScreens.vue'
import systemShot from '../../../docs/assets/pages/v2-m-system.png'

const tocItems = [
  { id: 'orch-65-1', label: '6.5.1 两类系统项' },
  { id: 'orch-65-2', label: '6.5.2 判定：两层频率' },
  { id: 'orch-65-3', label: '6.5.3 结果的界面口径' },
  { id: 'orch-65-4', label: '6.5.4 执行：失败怎么办' },
  { id: 'orch-65-5', label: '6.5.5 外部回执四样' },
  { id: 'orch-65-6', label: '6.5.6 结果被下游引用' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '事件编排', to: '/docs/orchestration' },
  { label: '六、功能详细说明', to: '/docs/orchestration/features' },
  { label: '6.5 系统判定与系统执行' }
]
</script>

<style scoped src="./doc-base.css"></style>
