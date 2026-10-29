<template>
  <DocShell
    :toc-items="tocItems"
    title="6.1 事件定义（配置）"
    subtitle="一次定义：管谁、提示词怎么写、子事件清单长什么样、从哪触发、带什么进来 —— 定义期只描述「必须交出什么」，不生成任何一单"
    version="v0.1"
    date="2026-10-30"
    :breadcrumbs="breadcrumbs"
  >
    <div id="orch-61" class="section">
      <div class="section-header">
        <h2>6.1 事件定义（配置）</h2>
        <DocCopyButton section-id="orch-61" />
      </div>

      <div class="func-entry"><strong>功能入口：</strong>Web → 事件管理（列表：新建、改版、停用）→「起草新事件」或行内「编辑」→ 事件定义页（四段：管谁 / 提示词 / 子事件 / 怎么触发）</div>

      <div class="note">
        <strong>本章怎么读：</strong>6.1.1 是起草方式（怎么从一段话走到一套定义），6.1.2–6.1.8 是定义页的四段与校验。
        <strong>定义期不查人</strong>：模型能看见组织、岗位编制、角色解析与系统项目录，看不见「谁有客户、谁有欠款」——
        那些逐人数据触发后随单带进来（见 6.2.3）。这不是能力不足，是刻意的边界：定义期一旦按人假设，定义就会随人漂移。
      </div>

      <DocScreens
        :images="[
          { src: eventsShot, label: '事件管理：一行一个事件 —— 适用条件（按档案判定，人数是估算）、触点、要办的事（21 条 / 其中必过 18 条）、第几版、状态' },
          { src: promptShot, label: '事件定义页：四段竖着读下来 —— 管谁（条件）→ 提示词（口径）→ 子事件（21 条，标首次/后加/改过）→ 怎么触发' },
          { src: composeShot, label: '起草：一段话说清这件事，Agent 查事实、问缺口，确认单在对话里逐步成形；输入框上方常驻「写作样板」' }
        ]"
      />

      <h3 id="orch-61-1">6.1.1 起草：一段话 → 确认单</h3>
      <p class="doc-p">
        新建一个事件不从空白表单开始，从<strong>一段话</strong>开始：说清这件事从哪触发、对谁、分几步、必须交什么。
        Agent 读完之后做两件事 —— <strong>查事实</strong>（组织、岗位编制、角色、系统项目录有没有能对上这套说法的）与<strong>问缺口</strong>（哪一句判不出达成、哪一条没有承担者、哪个触点没登记）。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">环节</th><th style="width: 240px;">Agent 做什么</th><th>人做什么</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>读这段话</strong></td><td>复述它理解到的这件事（一句话），逐条列出它打算拆成哪些结论</td><td>看复述对不对，不对就补一句</td></tr>
          <tr><td><strong>问缺口</strong></td><td>按「必答 / 建议」两级提问，每个问题写清<strong>为什么问</strong>、可选答案是什么</td><td>选项点选或写一句；建议级可以「先不管」</td></tr>
          <tr><td><strong>出确认单</strong></td><td>给出三段：<strong>触点</strong>（从哪来、带什么进来）、<strong>人群</strong>（管谁、约多少人）、<strong>子事件</strong>（每条的结论、门禁、前置、负责人、字段）</td><td>逐段核对；有阻塞项时不能发布</td></tr>
          <tr><td><strong>定稿</strong></td><td>把确认单落成一套定义（第 1 版）</td><td>进定义页继续细改，或直接在事件管理里看到它</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>必答缺口不猜。</strong>缺口分两级：必答（不答就生成不出来，例如「谁来给这条结论」）与建议（不答也能跑，但会在运行中反复被问到，例如「这条要不要凭证」）。
        必答没答完，「确认并生成」不可点 —— 猜出来的定义比没有定义更危险，因为它看起来是完整的。
      </div>
      <p class="doc-p">
        <strong>写作样板：</strong>输入框上方常驻一份<strong>成套的提示词范例</strong>（拿一件真实的事当样本），说明口径分几段、一条结论怎么写字、什么时候必须挂附件。
        它是<strong>给人学的蓝本</strong>，不是第二份文档：可以整段插回输入框改成自己的事，删掉用不上的条目。样板与「发出去的那段话」是<strong>同一个渲染结果</strong> —— 页面上看到的，就是触发时整段发给模型的那份。
      </p>

      <h3 id="orch-61-2">6.1.2 管谁：适用范围</h3>
      <p class="doc-p">
        第一段回答「这套定义管谁」。条件按<strong>岗位</strong>（必填）+ 城市 / 门店 / 用工形式（可选）描述，多选、可叠加。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 160px;">规则</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>不是名单</strong></td><td>条件描述的是<strong>匹配规则</strong>，触发时按员工档案现场判定；界面上的人数（如「≈ 473 人」）是<strong>按当前组织估算</strong>，仅供参考，不是被预先圈定的人</td></tr>
          <tr><td><strong>越具体越优先</strong></td><td>多个事件都能匹配时（同岗位不同城市、不同用工形式），按条件的<strong>具体度</strong>取最具体的一套；具体度相同按最近修改</td></tr>
          <tr><td><strong>不设条件等于不触发</strong></td><td>没有条件的定义谁都匹配不上，界面上会明确写出「未设条件（谁都匹配不上，等于不触发）」，不留一句含糊的提示</td></tr>
          <tr><td><strong>改条件不回改在途单</strong></td><td>条件只影响之后触发的单；已经在跑的单仍按它自己那份走（见 6.3.5）</td></tr>
        </tbody>
      </table>

      <h3 id="orch-61-3">6.1.3 提示词：写什么</h3>
      <p class="doc-p">
        第二段是这件事的<strong>口径</strong>。它不是给人看的说明书，而是<strong>每次生成时整段发给模型的那段话</strong> —— 所以每一句都必须能改变生成结果，写「背景介绍」等于浪费上下文。
        一段合格的提示词通常有七块：
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">块</th><th style="width: 220px;">要回答的问题</th><th>离职的写法（示例）</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>这件事是什么</strong></td><td>从哪开始、到哪结束</td><td>员工与企业结束用工关系；从离职申请提交开始，到合同签署完成、结果广播给下游、档案归档结束</td></tr>
          <tr><td><strong>必须办成的事</strong></td><td>缺一条算不算办完</td><td>按子事件清单逐条交付，缺一条即不合格 —— 它不是「建议做的事」，是这件事的完成定义</td></tr>
          <tr><td><strong>审核怎么摆</strong></td><td>审批放在链路的哪一格</td><td>审核不是环节也不是类型：两条结论（城市总 / 人事），各配一条人办路径，意见是普通多行文本字段</td></tr>
          <tr><td><strong>按人差异怎么判断</strong></td><td>差异从哪来</td><td>差异只有来源：这一单取到的事实。有在跟客户才移交客户，带团队才交接团队，管备用金才结清现金；事实取不到就不长这一条</td></tr>
          <tr><td><strong>等对方回话怎么算完成</strong></td><td>我方等的是哪个值</td><td>签署由员工在电子签平台完成；推送成功只代表送达，不代签 —— 送达不能当签署结果用</td></tr>
          <tr><td><strong>表单怎么给</strong></td><td>负责人交什么</td><td>只收他要交的东西：凭证、清单、日期、金额、审核意见；不加「审批意见」这类空字段</td></tr>
          <tr><td><strong>不要做什么</strong></td><td>边界在哪</td><td>不代下游计算薪酬与社保；不重复审；不写不可判定的结果 ——「交接已完成」不合格，「客户资料已移交并登记接收人」才合格</td></tr>
        </tbody>
      </table>

      <h3 id="orch-61-4">6.1.4 提示词的五条结构约束</h3>
      <p class="doc-p">
        口径之外，还有五条<strong>不随事件变化</strong>的约束，直接写进发给模型的那段话里，逐条都能被校验（见 6.1.6）：
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 230px;">约束</th><th>为什么</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>一个子事件 = 一条结论 = 一个事项</strong></td><td>一条结论挂两件事，只要其中一件没办，整条卡住 —— 判不清到底办完没有</td></tr>
          <tr><td><strong>要凭证的附件必传，并写允许格式</strong></td><td>选填的凭证等于没有；不写格式，交上来打不开，等于没交</td></tr>
          <tr><td><strong>审核是一条结论 + 人办路径</strong></td><td>几级审核就几条结论，先后由前置表达；写成「离职需求审核」这种动作判不出通过与否</td></tr>
          <tr><td><strong>谁做由口径定，形状由系统校验</strong></td><td>人做的给事项字段；系统做的给判定项与取数频率，<strong>没有人工表单、没有意见框</strong></td></tr>
          <tr><td><strong>一条结论只留一种兑现方式</strong></td><td>多条路径是「或」：系统没成功、人点一下也算达成 —— 要兜底就写进这条系统项的失败出口（见 6.5.4）</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>改一句就变一次：</strong>提示词改了之后，仅<strong>内容</strong>变化才升版本（只改名称不升版）。
        版本的作用只有一个：说清「这一单是按哪一版生成的」。在途单不受影响。
      </div>

      <h3 id="orch-61-5">6.1.5 子事件清单：六列</h3>
      <p class="doc-p">
        第三段是这件事<strong>必须交出的结论清单</strong>。一行一条，六列固定：
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">列</th><th style="width: 230px;">写什么</th><th>注意</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>结论</strong></td><td>一句可判定的达成状态</td><td>不带句号、不写动作；能回答「做到没有」</td></tr>
          <tr><td><strong>什么时候要</strong></td><td>前置（需等哪几条已办结）</td><td>不写 = 触发后即可办；写了 = 全部办结后才能办</td></tr>
          <tr><td><strong>是否必过</strong></td><td>必过 / 可选</td><td>默认必过；可选只记录、仍解锁下游</td></tr>
          <tr><td><strong>谁给结论</strong></td><td>角色（人办理时）或「系统执行 / 系统判定」</td><td>写角色不写人名，触发时按组织解析到人</td></tr>
          <tr><td><strong>要交什么</strong></td><td>事项 + 字段（含附件格式）</td><td>只收办完时要说清的东西，不是「多填点没坏处」</td></tr>
          <tr><td><strong>路径</strong></td><td>人办理 / 系统判定 / 系统执行 / 外部回执</td><td>一条只留一种，不给「人工兜底」并列</td></tr>
        </tbody>
      </table>
      <p class="doc-p">
        <strong>首次生成留档：</strong>第一次由模型产出的那份清单会被留档，之后每一条都带标记 ——
        <strong>首次</strong>（第一次就有）、<strong>后加</strong>（人后来补的）、<strong>改过</strong>（首次有、后来改了口径）。
        这样能回答一个具体问题：「哪几条是提示词给的，哪几条是人补的」。人补的多了，说明提示词该改，而不是继续在清单上堆。
      </p>

      <h3 id="orch-61-6">6.1.6 发布前必过的校验</h3>
      <p class="doc-p">定义保存前跑一遍校验，<strong>错误必须改完才能发布</strong>，提醒可以带着发（会显示但不拦）：</p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 90px;">级别</th><th style="width: 240px;">检查</th><th>不通过说明什么</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>错误</strong></td><td>结论写成了动作（「审核」「交接」「处理」）</td><td>判不出达成没有，下游永远不知道这条算不算完</td></tr>
          <tr><td><strong>错误</strong></td><td>一个子事件挂了两个以上事项，或有人办路径却没写事项</td><td>前者判不清，后者办事的人不知道要交什么</td></tr>
          <tr><td><strong>错误</strong></td><td>附件字段没写允许格式</td><td>交上来打不开，等于没交</td></tr>
          <tr><td><strong>错误</strong></td><td>必过项写了外部回执，却没有回执字段</td><td>我方只能等一句「已完成」，等不到可判定的值（见 6.5.5）</td></tr>
          <tr><td><strong>错误</strong></td><td>前置指向了不存在的条目（悬空）</td><td>这一条永远不会解锁</td></tr>
          <tr><td><strong>提醒</strong></td><td>事项没有任何字段；附件是选填；审核结论没有「意见」字段</td><td>能跑，但会在办理时反复被问到</td></tr>
        </tbody>
      </table>

      <h3 id="orch-61-7">6.1.7 怎么触发：触点</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">触点类型</th><th style="width: 240px;">什么时候用</th><th>要写清什么</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>业务事件点</strong></td><td>由对岸系统在某个时刻发起（申请提交、监控告警、月度计划）</td><td>从<strong>已登记的事件点</strong>里选，不许自造；入口文案取登记里的入口</td></tr>
          <tr><td><strong>人工发起</strong></td><td>由某个角色在系统里主动开一张单</td><td>谁能发起、从哪个菜单进、第一步填什么</td></tr>
        </tbody>
      </table>
      <p class="doc-p">
        事件点由<strong>业务开发在我们的开放平台上登记</strong>，我方只读：它代表对岸承诺「在这个时刻，我会发出这些字段」。
        因此每条字段都带 <span class="mono">key</span>、类型、是否必传、可选值 —— 只有中文名不行，两边就没有能对齐的键。
        其中<strong>标为「取数入参」的那个字段（工号）是引擎要用的</strong>：拿它去取员工档案，所有根事件都必须有且只有一个。
      </p>

      <h3 id="orch-61-8">6.1.8 载荷三层：登记 / 映射 / 值</h3>
      <p class="doc-p">同一批字段会在三个地方出现，混为一谈就会出两类事故：该拒的单没拒、该填的没填。</p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 120px;">层</th><th style="width: 220px;">是什么</th><th>谁维护 / 什么时候用</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>登记</strong></td><td>对岸承诺发哪些字段：key、中文名、类型、是否必传、可选值</td><td>业务开发在开放平台注册，我方只读；定义期选事件点时带出</td></tr>
          <tr><td><strong>映射</strong></td><td>这些字段<strong>怎么用</strong>：<span class="mono">intake</span> 取数入参 / <span class="mono">show</span> 实例回看 / <span class="mono">bind</span> 预填进某个子事件</td><td>事件维护人在定义页勾选；类型、必传、可选值<strong>不在这里重写</strong>，一律由登记决定</td></tr>
          <tr><td><strong>值</strong></td><td>这一单实际带进来的内容</td><td>触发时到达；按<strong>同一条登记</strong>校验</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>触发时拒单的三种情况：</strong>缺必传字段、类型与登记不符、出现登记里没有的 key。
        拒单要说清缺哪个字段，而不是「参数错误」—— 对岸要能据此改自己的下发。<br />
        <strong>载荷只参与值，不参与结构。</strong>单据带进来的是「哪个员工、期望哪天、什么原因」，它<strong>不会</strong>改变这一单该长出哪些子事件 —— 那由事实决定（见 6.3）。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'
import DocScreens from '../../../docs/components/DocScreens.vue'
import eventsShot from '../../../docs/assets/pages/v2-events.png'
import promptShot from '../../../docs/assets/pages/v2-prompt.png'
import composeShot from '../../../docs/assets/pages/v2-compose.png'

const tocItems = [
  { id: 'orch-61-1', label: '6.1.1 起草：一段话 → 确认单' },
  { id: 'orch-61-2', label: '6.1.2 管谁：适用范围' },
  { id: 'orch-61-3', label: '6.1.3 提示词：写什么' },
  { id: 'orch-61-4', label: '6.1.4 五条结构约束' },
  { id: 'orch-61-5', label: '6.1.5 子事件清单：六列' },
  { id: 'orch-61-6', label: '6.1.6 发布前必过的校验' },
  { id: 'orch-61-7', label: '6.1.7 怎么触发：触点' },
  { id: 'orch-61-8', label: '6.1.8 载荷三层' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '事件编排', to: '/docs/orchestration' },
  { label: '六、功能详细说明', to: '/docs/orchestration/features' },
  { label: '6.1 事件定义（配置）' }
]
</script>

<style scoped src="./doc-base.css"></style>
