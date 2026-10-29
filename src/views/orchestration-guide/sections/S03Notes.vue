<template>
  <DocShell
    :toc-items="tocItems"
    title="三、文档说明"
    subtitle="只收跨章节共用的名词与跨页面统一的字段口径；单页字段与交互在对应功能章节里解释"
    version="v0.1"
    date="2026-10-30"
    :breadcrumbs="breadcrumbs"
  >
    <div id="orch-terms" class="section">
      <div class="section-header">
        <h2>名词解释</h2>
        <DocCopyButton section-id="orch-terms" />
      </div>
      <p class="doc-p">只收<strong>跨章节共用</strong>的名词；单页字段与交互在对应功能章节解释，这里不重复。</p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 176px;">名词</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>事件</strong></td><td>一类会反复发生的事（离职、调店、转正…）。一个事件 = <strong>一套提示词 + 一份子事件清单 + 一个触点</strong>。定义一次，之后每来一笔就生成一份实例（见 6.1）</td></tr>
          <tr><td><strong>子事件</strong></td><td>这件事里<strong>必须办成的一件具体事</strong>，用一条结论表达（如「在跟客户已交接完毕」）。审批、系统核查、对外签署都只是子事件，不是独立机制（见 6.1.5、6.4、6.5）</td></tr>
          <tr><td><strong>结论</strong></td><td>子事件的标题，必须是<strong>可判定的达成状态</strong>：能回答「做到没有」。「交接已完成」不合格，「客户资料已移交并登记接收人」合格。「离职需求审核」是动作，不合格（见 6.1.6）</td></tr>
          <tr><td><strong>兑现路径</strong></td><td>这条结论由谁做实，四类：<strong>人办理</strong>（某个角色交东西给结论）/ <strong>系统判定</strong>（取批次结果给结论、不改数据）/ <strong>系统执行</strong>（调动作改数据、拿回执）/ <strong>外部回执</strong>（对方动手、我方等）。一条子事件只留<strong>一种</strong>兑现方式（见 6.4、6.5）</td></tr>
          <tr><td><strong>门禁（必过 / 可选）</strong></td><td>必过 = 不通过就<strong>终止全部流程</strong>；可选 = 不通过只记录、仍解锁下游。门禁是子事件的属性，不是承担人的权限（见 6.4.4）</td></tr>
          <tr><td><strong>提示词</strong></td><td>这件事的口径：从哪开始、按什么事实分岔、必须交什么、不做什么。业务人员在页面上改一句就变一次，<strong>每次生成时整段发出去</strong>（见 6.1.3）</td></tr>
          <tr><td><strong>子事件清单</strong></td><td>提示词要求模型交出的那份清单，逐条写明结论、门禁、前置与负责人。<strong>它是下限不是上限</strong>：可以按岗位与这一单的事实补字段，不能删条、不能改口径（见 6.1.5）</td></tr>
          <tr><td><strong>事实</strong></td><td>判「这一条对这个人存不存在」的依据：有没有在跟客户、带不带团队、有没有资产与欠款…分两层 —— <strong>基础事实</strong>（跨事件通用）与<strong>事件专用事实</strong>（由该事件的提示词声明）。事实是<strong>查出来的</strong>，不是给人打标签（见 6.3）</td></tr>
          <tr><td><strong>取数（触发前置）</strong></td><td>所有事件触发时引擎固定执行的两步：<strong>员工档案</strong>（按工号）+ <strong>逐人事实</strong>。不进清单、不在树上、不可调整、没有开关；档案取不到，这一单不成立（见 6.2.3）</td></tr>
          <tr><td><strong>触点</strong></td><td>这张单从哪来：业务事件点（对岸系统登记「我在这个时刻会发这些字段」）或人工指定入口。触点决定单据带什么值进来（见 6.1.7）</td></tr>
          <tr><td><strong>载荷</strong></td><td>三层分清：<strong>登记</strong>（对岸承诺发什么：字段 key / 类型 / 是否必传 / 可选值）→ <strong>映射</strong>（哪些字段用于取数、哪些用于回看、哪些预填进子事件）→ <strong>值</strong>（这一单实际带进来的）。三层都按同一条登记校验（见 6.1.8）</td></tr>
          <tr><td><strong>适用范围</strong></td><td>这套提示词<strong>管谁</strong>：按岗位、城市、门店、用工形式等条件描述。<strong>不是预先圈好的名单</strong> —— 触发时按员工档案判定，界面上的人数只是估算（见 6.1.2）</td></tr>
          <tr><td><strong>实例</strong></td><td>某一笔真实发生的单据，自带一份<strong>属于它的子事件</strong>。定义改版只影响之后触发的单，在途单仍按它自己那份走（见 6.3.5）</td></tr>
          <tr><td><strong>系统判定 / 系统执行</strong></td><td>判定 = 只出结论、不改数据，靠<strong>批次结果</strong>；执行 = 调一个已登记的动作改数据，靠<strong>回执</strong>。两者都不给人按钮（见 6.5）</td></tr>
          <tr><td><strong>外部回执</strong></td><td>对方在自己的系统里动手，我方只能等。必须写清四样：<strong>谁动手</strong>、<strong>由哪个动作触发</strong>、<strong>回哪些字段</strong>、<strong>写回哪个结果字段</strong>；没写回执字段的必过项不算合格（见 6.5.5）</td></tr>
          <tr><td><strong>中期调整</strong></td><td>这一单跑到一半发现清单不对（多一条、少一条、前置不通），在这一单上改。已办结的锁住；同类调整反复出现在多张单上，说明该回定义层改提示词（见 6.6.3）</td></tr>
        </tbody>
      </table>
    </div>

    <div id="orch-fields" class="section">
      <div class="section-header">
        <h2>字段字典</h2>
        <DocCopyButton section-id="orch-fields" />
      </div>
      <p class="doc-p">只列<strong>跨页面统一口径</strong>的字段（命名 / 取值范围 / 格式）；各事件自己的业务字段见该事件的需求文档。</p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">字段</th><th style="width: 210px;">位置</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>子事件结论</strong></td><td>事件定义 · 子事件清单</td><td>一句可判定的达成状态，<strong>不带句号</strong>；不允许写成动作（「审核」「处理」「交接」）；一条子事件只有一条结论（见 6.1.6）</td></tr>
          <tr><td><strong>门禁</strong></td><td>事件定义 · 子事件清单</td><td>必过 / 可选，<strong>默认必过</strong>；必过不通过 = 终止全部流程（见 6.4.4）</td></tr>
          <tr><td><strong>前置（需等）</strong></td><td>事件定义 · 子事件清单</td><td>表达先后与并行的<strong>唯一方式</strong>：没写 = 触发后即可办；写了 = 这些前置全部办结后才能办。<strong>并行不是配出来的</strong>，是没写前置的自然结果（见 6.3.4）</td></tr>
          <tr><td><strong>负责人</strong></td><td>事件定义 · 子事件清单</td><td>写<strong>角色</strong>（店长 / 城市总 / 人事经理…），触发时按员工组织关系解析到人；确需指定人时按事实里的责任人取。<strong>负责人 = 核对并填结果的人，不是动手的人</strong>（见 6.4.2）</td></tr>
          <tr><td><strong>事项字段</strong></td><td>子事件 · 事项</td><td>八种控件：单行文本 / 多行文本 / 数值 / 日期 / 单选 / 多选 / 人员 / 附件。一个子事件只挂<strong>一个</strong>事项；字段只收办完时要说清的东西（见 6.4.3）</td></tr>
          <tr><td><strong>附件格式</strong></td><td>子事件 · 事项字段</td><td>要凭证的字段必须<strong>必传 + 写允许格式</strong>（PDF / JPG / PNG）；只提醒不写格式的，等于交上来打不开（见 6.1.6）</td></tr>
          <tr><td><strong>取数频率</strong></td><td>子事件 · 系统判定</td><td>「这单多久去取一次最新批次结果」：间隔值 + 单位，或只取一次。<strong>与检查 Agent 自己的盘查节奏相互独立</strong>（见 6.5.2）</td></tr>
          <tr><td><strong>批次上限</strong></td><td>子事件 · 系统判定</td><td>只计<strong>消费到的不同未通过批次</strong>；同一批次反复取到不重复计数（见 6.5.2）</td></tr>
          <tr><td><strong>回执字段 / 写回字段</strong></td><td>子事件 · 外部回执</td><td>回执字段 = 对方要回哪些值（key + 中文名 + 可能取值）；写回字段 = 回执写进这条结论的哪个结果字段，供下游按字段名引用（见 6.5.5）</td></tr>
          <tr><td><strong>工号（empNo）</strong></td><td>触点 · 载荷登记</td><td>登记里标为「取数入参」的那一个字段，引擎拿它去取员工档案；<strong>每个触点必须有且只有一个</strong>（见 6.1.8）</td></tr>
        </tbody>
      </table>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'orch-terms', label: '名词解释' },
  { id: 'orch-fields', label: '字段字典' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '事件编排', to: '/docs/orchestration' },
  { label: '三、文档说明' }
]
</script>

<style scoped src="./doc-base.css"></style>
