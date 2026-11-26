<template>
  <DocShell
    :toc-items="tocItems"
    title="6.4 变化与求值"
    subtitle="关闸之后的偏差写一条事实、重算一次、事实表留痕，不回头改历史"
    version="v5.5"
    date="2026-11-26"
    :breadcrumbs="breadcrumbs"
  >
    <div id="hs-64" class="section">
      <div class="section-header">
        <h2>6.4 变化与求值</h2>
        <DocCopyButton section-id="hs-64" />
      </div>
      <p class="doc-p">
        这一章解决<strong>排完之后出偏差怎么办</strong>：关闸以后班次已经落到人头上，再出变化不能改班次配置、也不能手工改结果表，
        只能<strong>写一条事实</strong>。事实一旦写入，系统重算一次——每条事实就是这一次重算的留痕，留痕由事实表承载，页面不另列版本时间线。
      </p>
      <div class="func-entry">
        <strong>功能入口：</strong>排班策略 v5（原型 <code>/schedule-v5</code>）→ <strong>事实记录</strong>
        （全员时间轴矩阵 / 事实表：共用选中轮（最近 4 轮窗口），支持搜索与分页）
      </div>

      <DocScreens
        :height="420"
        :images="[
          { src: factsShot, label: '事实记录：最近 4 轮窗口 tab（页首统一约束）+ 全员时间轴矩阵（蓝=班次·橙斜纹=被占用·绿=顶班）+ 事实表（跟随选中轮 · 搜索 + 分页）' }
        ]"
      />
    </div>

    <div id="hs-64-timeline" class="section">
      <div class="section-header">
        <h3>6.4.1 全员时间轴矩阵</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 140px;">元素</th><th style="width: 300px;">画什么</th><th>读法</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>行 = 人</strong></td><td>这个空间这一轮涉及的所有人</td><td>一眼看出谁哪天有班、谁空着</td></tr>
          <tr><td><strong>列 = 选中轮的日子</strong></td><td>格子里画时间条；矩阵上方有轮次 tab，在窗口内切轮回查</td><td>蓝 = 班次；橙斜纹 = 被事件占用；绿 = 顶上的班；黄 = 换班对调来的</td></tr>
          <tr><td><strong>悬浮格子</strong></td><td>格子旁出当天单轴小卡，不撑开页面</td><td>班次 / 事实 / 补位三条带怎么叠出来的；卡上「相关的人」可切换</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>轮次窗口（事实记录页的统一约束，在页签最顶部）：</strong>事实记录展示<strong>最近 4 轮</strong>——已结束 / 执行中 / 已截止 · 待开始；
        <strong>全员时间轴矩阵与事实表共用同一个选中轮</strong>：矩阵铺这轮的日子、事实表列这轮的事实，搜关键字也在这一轮内过滤（结果页回答「这一轮怎么排的」，事实页回答「这一轮发生了什么变化」）。
        <strong>申领中的轮不进窗口</strong>：还没翻轮、没有班次和占位，事实无处可挂；
        日期落在更远未来的事实（如离职生效日在还没发布的轮里），等那一轮发布后切轮查看。
      </div>
    </div>

    <div id="hs-64-facts" class="section">
      <div class="section-header">
        <h3>6.4.2 五类事实</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 90px;">事实</th><th style="width: 280px;">发生什么</th><th>系统怎么处理</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>请假</strong></td><td>人的一段班次时间来不了；可整班也可只请几小时</td><td>按这条班次的缺口规则重算（见 6.4.4）：只请一段也走缺口规则，顶班人只顶被拿走的那一段；拿走的一段未超 30 分钟只记占用、不触发缺口判定</td></tr>
          <tr><td><strong>顶班</strong></td><td>人事安排另一个人来顶这个班</td><td>经营性安排，通知即可、不需对方同意；顶上后「待人事处理」自动销</td></tr>
          <tr><td><strong>换班</strong></td><td>两个人各拿自己的一天班次对调，同岗位对等</td><td>两条班次同时生效地对调，各自留变动历史；请求由对方在移动端答复。<strong>等待期 30 分钟</strong>：从发起算起，对方没拒绝也没同意，到点自动失效、两边都不动。谁能参与换班：只有这条班次允许获取的人群（清单档位里、按优先级开放的那批人）——档位外的人不出现在换班候选里，发起方选不到，对方也收不到请求</td></tr>
          <tr><td><strong>离职</strong></td><td>人离店，从某天起不再来</td><td>只交付事实与实际离职日期；后续班次标记被覆盖，<strong>不找人顶</strong>（补人由招聘侧处理）</td></tr>
          <tr><td><strong>取消挂店</strong></td><td>人与门店的挂店合作终止，不再合作（见 <router-link to="/docs/hr-schedule/6-10">6.10</router-link>）</td><td>效果同离职：该店后续班次标记被覆盖、无法履约原班次计划，<strong>不找人顶</strong>（补人由挂店与招聘侧处理）；只覆盖这个人<strong>在这家店</strong>的班次，其他门店班次不动</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>事实从哪来（来源边界）：</strong>五类事实各归各的发起模块，排班只收事实、做重算——
        <strong>请假</strong>在专门的请假模块提交（排班页不设请假入口，补位确认后去不了同样在请假模块提交）；
        <strong>换班</strong>由员工在移动端「我的排班」发起；<strong>顶班</strong>由人事在配置台安排；<strong>离职</strong>由离职流程交付；<strong>取消挂店</strong>由挂店管理交付（自下线 / 移出）。
        业务侧的事件清单见 <router-link to="/docs/hr-schedule/6-4">6.4.3 事件记录</router-link>。
      </div>
      <div class="note">
        <strong>表达口径：</strong>一切变化都描述为「一段时间被一个事件占用」——不修改个人已获得的班次本身，
        班次上的变化都是占用了它的一部分或全部。
      </div>
    </div>

    <div id="hs-64-events" class="section">
      <div class="section-header">
        <h3>6.4.3 事件记录（本期收录）</h3>
      </div>
      <p class="doc-p">
        事件记录是<strong>业务侧发生了什么</strong>的清单：事件进来先落记录，能落到「一段时间被占用」的写成事实、进求值；
        记录类的只留痕、不触发重算。本期先收录下面这几类，<strong>清单开放，后续随业务补充</strong>。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">事件</th><th style="width: 250px;">记录什么</th><th>进求值怎么走</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>打卡</strong></td><td>上下班：班次的到岗与离岗记录，上下班成对出有效工时（见 6.7 / 6.8）</td><td>履约证明，只留痕；不占用班次、不触发重算</td></tr>
          <tr><td><strong>请假 / 事件报备</strong></td><td>人一段时间来不了；请假撤销把这条事实失效、班次恢复</td><td>写请假事实，按缺口规则重算（见 6.4.4）；拿走的一段未超 30 分钟只记占用、不触发缺口判定</td></tr>
          <tr><td><strong>订单</strong></td><td>订单成交与取消订单</td><td>客量变化，动的是时段需求（名额侧），不占用个人班次</td></tr>
          <tr><td><strong>预约订单</strong></td><td>预定订单与取消预定订单</td><td>未来客量变化，影响后续时段的需求安排</td></tr>
          <tr><td><strong>培训</strong></td><td>培训占用的时段</td><td>证明该时段无法履约，写占用事实、走缺口规则重算</td></tr>
          <tr><td><strong>离职</strong></td><td>人离店，从某天起不再来</td><td>写离职事实：已排班次标记被覆盖、不找人顶；离职事件同时是班次无法履约的证明</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>事件与事实的分工：</strong>事件是业务侧发生了什么，事实是排班侧怎么响应——同一个事件落到不同人头上就是不同的事实条数；
        事件记录只管把「发生了什么」记全，判断与执行仍按 6.4.5 求值与留痕走。
      </div>
    </div>

    <div id="hs-64-gap" class="section">
      <div class="section-header">
        <h3>6.4.4 缺口规则：缺人之后怎么判</h3>
      </div>
      <DocScreens
        :height="360"
        :images="[
          { src: gapShot, label: '缺口规则页：四条规则（G0 不补充 + G1–G3），缺口按这一轮日期段取，判据用每条班次自己选的规则' }
        ]"
      />
      <table class="data-table">
        <thead>
          <tr><th style="width: 240px;">规则</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>G0 不补充</strong></td><td>缺了也不动，留给门店现场；发知情通知给人事经理（见 6.6）</td></tr>
          <tr><td><strong>G1 补齐名额</strong></td><td>缺几个补几个，不看还剩多久</td></tr>
          <tr><td><strong>G2 补齐名额 · 剩余不足 2.5 小时不补</strong></td><td>「剩余」= 被事件拿走的那段时长；不足 2.5 小时不叫人，记成没补上。2.5 小时 = 30 分钟通勤 + 2 小时补位班次时长——补位人要赶来顶班，被拿走的段留不出这个长度就不值当</td></tr>
          <tr><td><strong>G3 按当下经营预测</strong></td><td>引用算法服务「实时经营需求」重算这段现在要几个人，够就不补</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>判定与执行的分工：</strong>事件写进来时求值器已经按这条时段选的规则判过一次并执行（找到人自动补位，找不到发「待人事处理」）；
        结果层缺口视图的结论列就是这次判定的结果——<strong>「该补几人」是结论不是操作</strong>，定人在矩阵或时间轴点缺口，补位也可能由求值自动完成。
      </div>
      <div class="note">
        <strong>边界：</strong>缺口规则只管<strong>排班确定之后因事件缺人</strong>（请假、离职这类）；
        加场名额没人抢不算缺口，获取段没排满也不算——结果层手动补人即可。
        请假 / 事件报备拿走的一段<strong>未超过 30 分钟</strong>的，只记占用事实、<strong>不触发缺口判定</strong>——不足半小时的缺席不摆缺口、不寻人、不发缺口通知。
        未来支持更多岗位时的缺口策略升级（缺口归属按清单第 1 优先级档位、判定参数与补位策略按人群登记）登记在 <router-link to="/docs/hr-schedule/future">八、未来扩展</router-link>。
      </div>
    </div>

    <div id="hs-64-solve" class="section">
      <div class="section-header">
        <h3>6.4.5 求值与留痕</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 160px;">步骤</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>写一条事实</strong></td><td>请假 / 顶班 / 换班 / 离职 / 取消挂店各写各的，一条事实一个事项</td></tr>
          <tr><td><strong>重算一次（缺口寻人）</strong></td><td>从该时段配置的人群档位里找人——这一步<strong>不限制人数</strong>（名额是获取段的事，缺口本身就有限），对应档位找到人即可；找到后<strong>用这个人现有的有效班次时段复核</strong>：是否交叉、非全是否超过每天 / 每周工时上限。复核基数 = 有效班次时段——被请假 / 离职 / 取消挂店等履约事件占用的时段不计入；复核通过才补位并通知，复核不过或没人则时段留空</td></tr>
          <tr><td><strong>留痕</strong></td><td>每条事实就是一次重算的留痕（发生时间 + 影响的班次 + 结果），事实表即留痕，页面不另列解版本时间线</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>求值没人顶的收口：</strong>发一条「待处理」给门店人事（结果层缺口清单出待办条）——时段留空 + 请假人 + 顺位里没有合适的人，
        人事安排顶班后待办自动销。系统只判定与执行，<strong>兜底决策归人</strong>。
      </div>
    </div>

    <div id="hs-64-notice" class="section">
      <div class="section-header">
        <h3>6.4.6 通知与让位</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 200px;">方向</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>受益方向</strong></td><td>补人、多拿一个班：通知即可</td></tr>
          <tr><td><strong>受损方向</strong></td><td>顶掉已经到手的东西：必须通知</td></tr>
        </tbody>
      </table>
      <div class="note">
        员工侧通知<strong>统一走通用通知页</strong>（通知模块是通用的，排班不自带通知页）；
        处理动作都在业务页：补位确认落在班次卡上，换班答复落在「我的排班」里。全部通知清单见 <router-link to="/docs/hr-schedule/6-6">6.6 通知</router-link>。
      </div>
    </div>

    <div id="hs-64-sys" class="section">
      <div class="section-header">
        <h3>6.4.7 对周边系统的支持</h3>
      </div>
      <p class="doc-p">
        取消挂店这类变化，源头在周边系统（如挂店管理）。周边系统<strong>不自己改班次</strong>，而是<strong>调用排班新增「取消挂店」事件</strong>；
        排班是班次的唯一记录口，收到调用后、新增事件前，<strong>按岗位主动核查一次</strong>——核查通过才新增事件，把已存在的班次标记为无法履约（见 6.4.2、6.4.4）。
        对周边系统来说只有一件事：调用排班新增事件；核查、标记、重算都发生在排班内。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 220px;">调用新增「取消挂店」事件 · 岗位</th><th>排班新增事件前的主动核查</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>客户经理</strong>（全职 / 非全）</td><td>无需核查，直接新增事件，该店已排班次标记为无法履约</td></tr>
          <tr><td><strong>推拿师</strong>（全职 / 非全）</td><td>排班<strong>主动核查订单</strong>：存在订单时<strong>不允许新增事件</strong>（取消挂店不生效，调用方收到拒绝与原因）；无订单才放行</td></tr>
          <tr><td><strong>其他岗位</strong></td><td>核查规则待该岗位接入排班时补充</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>边界：</strong>核查是排班收到调用后<strong>主动做一次</strong>，不要求周边系统先查一遍；核查不通过就没有事件，也没有班次标记；
        核查规则按岗位增量维护，新岗位接入排班时在本节补它自己的规则，不追溯已接入岗位。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'
import DocScreens from '../../../docs/components/DocScreens.vue'
import factsShot from '../../../docs/assets/pages/v5-facts.png'
import gapShot from '../../../docs/assets/pages/v5-gap.png'

const tocItems = [
  { id: 'hs-64', label: '6.4 变化与求值' },
  { id: 'hs-64-timeline', label: '6.4.1 全员时间轴矩阵' },
  { id: 'hs-64-facts', label: '6.4.2 五类事实' },
  { id: 'hs-64-events', label: '6.4.3 事件记录（本期收录）' },
  { id: 'hs-64-gap', label: '6.4.4 缺口规则' },
  { id: 'hs-64-solve', label: '6.4.5 求值与留痕' },
  { id: 'hs-64-notice', label: '6.4.6 通知与让位' },
  { id: 'hs-64-sys', label: '6.4.7 对周边系统的支持' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事中心', to: '/docs/hr-schedule' },
  { label: '六、功能详细说明', to: '/docs/hr-schedule/features' },
  { label: '6.4 变化与求值' }
]
</script>

<style scoped src="./doc-base.css"></style>
