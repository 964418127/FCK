<template>
  <DocShell
    :toc-items="tocItems"
    title="6.3 临时时段（取消 / 请假 / 手动 / 转移）"
    subtitle="周期发布之外的五类时段：派单即生效，没有接受环节；派不满留在运营侧重试，不覆盖原任务"
    version="v1.0"
    date="2026-11-06"
    :breadcrumbs="breadcrumbs"
  >
    <div id="pt-63-overview" class="section">
      <div class="section-header">
        <h2>6.3 临时时段（取消 / 请假 / 手动 / 转移）</h2>
        <DocCopyButton section-id="pt-63" />
      </div>
      <div class="func-entry"><strong>功能入口：</strong>Web → 非全客户经理 → 排班排假 → <strong>时段需求 → 临时时段</strong>（原型 <code>/parttime-task-management</code> 第二个子页签）；取消与转移在移动端发起（见 6.5）</div>

      <DocScreens
        :height="820"
        :images="[
          { src: ptBackfillDialogShot, label: '发布临时时段（自动派）：先按资格筛出可被派的人，再取签约最早的一位' },
          { src: ptBackfillPickedShot, label: '发布临时时段（指定人员）：点名两人，人数自动变 2；派不出去不换人' }
        ]"
      />
      <DocScreens
        :height="440"
        :images="[{ src: ptBackfillShot, label: '临时时段列表：「派单范围」列写明自动派还是指定 2 人，缺口留「重试派发」' }]"
      />
    </div>

    <div id="pt-63-sources" class="section">
      <div class="section-header">
        <h3>6.3.1 五类来源，同一个原则</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">来源</th><th style="width: 240px;">什么触发的</th><th style="width: 190px;">产生什么</th><th>原任务</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>取消后重派</strong></td><td>已承接任务被本人取消</td><td>同店同日同段的待派需求</td><td>保留为「已取消」</td></tr>
          <tr><td><strong>请假接班生成</strong></td><td>全职客户经理请假形成缺岗</td><td>按缺岗拆段后的接班时段</td><td>不适用（属全职排班）</td></tr>
          <tr><td><strong>运营临时时段</strong></td><td>运营线下确认要加人</td><td>立即生效的时段需求</td><td>不要求有被替换的人</td></tr>
          <tr><td><strong>已生成任务被转移</strong></td><td>承接人无法履约，转交他人</td><td>新的承接关系</td><td>保留为「已转移」</td></tr>
          <tr><td><strong>提前下线补人</strong></td><td>到店后提前离店，剩余扣掉通勤仍够门槛（6.1.3）</td><td>离店到计划结束的<strong>剩余段</strong></td><td>保留为「已离店」，按离店截断结算</td></tr>
        </tbody>
      </table>
      <div class="note lead-note">
        <strong>共同原则：</strong>缺口是<strong>新对象</strong>，不是把原任务改个状态；原任务、原承接关系、触发原因都留着，否则跟踪页答不了「这个名额原来是谁的」。
      </div>
    </div>

    <div id="pt-63-dispatch" class="section">
      <div class="section-header">
        <h3>6.3.2 派单：发出去就是他的任务，没有「待接受」</h3>
      </div>
      <p class="doc-p">
        临时时段不走可选池、不发邀请：需求一建立就<strong>立即</strong>在派单范围里挑人，直接写成「待到店」。派单范围两种：默认<strong>本店签约非全客户经理按顺序找</strong>，或<strong>点名指定人员</strong>。
        系统派单<strong>只发通知、不设接受环节</strong>（已拍板，含请假接班与提前下线补人）：派不出去留在运营侧重试，不存在「对方不点接受」这条路；要对方点头的只有同事之间的转发（6.5.5）。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 110px;">步骤</th><th style="width: 300px;">系统做什么</th><th>结果</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>1 建需求</strong></td><td>记门店、日期、时段、<strong>派单范围</strong>、需求人数、来源</td><td>状态<strong>待派发</strong></td></tr>
          <tr><td><strong>2 选人</strong></td><td>只在范围内，按 6.5.3 资格筛出可被派的人：签约门店、时段不冲突、跨店 30 分钟、单日 ≤ 4 小时、服务门店 ≤ 6 家</td><td>自动范围取<strong>最早签约</strong>第一位；指定范围取名单里第一位可被派的</td></tr>
          <tr><td><strong>3 派中</strong></td><td>写入承接关系</td><td><strong>待到店</strong>，本人收到通知</td></tr>
          <tr><td><strong>4 派不满</strong></td><td>无可派的人 / 名单里的人都接不了</td><td>停在<strong>待派发 / 部分派发</strong>，运营重试或改派</td></tr>
        </tbody>
      </table>
      <div class="note warn-note">
        <strong>点名了就只派点名的人：</strong>名单里有人交叉冲突或超工时，<strong>不顺手换人</strong>，需求留待派发并写明原因。
        <strong>唯一例外是提前下线补人</strong>：本店非全都派不出去时，按策略兜底落到<strong>本店全职推拿师（最晚签约）</strong>—— 系统指派，不给推拿师开承接端。
      </div>
      <ul class="doc-ul">
        <li>自动模式<strong>不做评分排序</strong>：没有距离、履约、偏好权重，资格筛完按签约先后取第一位。</li>
        <li>临时时段<strong>不分档</strong>；候选永远是本店签约非全客户经理，名单里不带跨店的人、不带推拿师。</li>
        <li>派中的任务本人可取消、可转移，取消后重新产生待派需求（6.3.3）。</li>
        <li><strong>不做超时转派</strong>：开始后仍没人来，按打卡事实记录（未记录 / 迟到），不自动补人。</li>
      </ul>
    </div>

    <div id="pt-63-cancel" class="section">
      <div class="section-header">
        <h3>6.3.3 取消后重派</h3>
      </div>
      <ol class="doc-ol">
        <li>本人取消 → 原任务保留为<strong>已取消</strong>，同店同日同段产生<strong>待派</strong>需求，名额为接替人保留，原承接人排除。</li>
        <li>系统<strong>立即尝试匹配</strong>其他符合条件的人（条件同 6.3.2）。</li>
        <li>成功 → 建立新承接关系并推送；失败 → 留 Web 列表<strong>待派发</strong>，运营重试。</li>
      </ol>
    </div>

    <div id="pt-63-leave" class="section">
      <div class="section-header">
        <h3>6.3.4 请假接班生成</h3>
      </div>
      <p class="doc-p">按全职排班的<strong>实际缺岗时段</strong>生成，<strong>每段不超过 4 小时</strong>，逐段独立派发与校验。</p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 200px;">缺岗时段</th><th>拆段结果</th></tr>
        </thead>
        <tbody>
          <tr><td>10:00 – 22:00</td><td>10–14、14–18、18–22（三段）</td></tr>
          <tr><td>10:00 – 13:00</td><td>不拆（不足 4 小时）</td></tr>
        </tbody>
      </table>
      <ul class="doc-ul">
        <li>每段<strong>单独校验</strong>接替人的累计工时与时段冲突。</li>
        <li>请假人、缺岗来源、各段接替结果<strong>只在 Web 展示</strong>；移动端只看到「派给我的任务」。</li>
        <li>与取消重派的区别：来源不同，且接班时段<strong>没有原非全任务</strong>可回溯，关联对象是全职缺岗。</li>
      </ul>
    </div>

    <div id="pt-63-manual" class="section">
      <div class="section-header">
        <h3>6.3.5 运营发布临时时段</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 140px;">字段</th><th style="width: 240px;">要求</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>门店</strong></td><td>必填</td><td>来自门店主数据</td></tr>
          <tr><td><strong>日期</strong></td><td>必填</td><td>今天或未来</td></tr>
          <tr><td><strong>时段</strong></td><td>必填，单段 ≤ 4 小时</td><td>营业时间内、结束晚于开始、结束在未来</td></tr>
          <tr><td><strong>需求人数</strong></td><td>正整数；<strong>指定人员时 = 选中人数</strong>，自动带出不可改</td><td>按人数逐个派单</td></tr>
          <tr><td><strong>派单范围</strong></td><td>二选一：<strong>本店签约非全客户经理</strong>（默认）/ <strong>指定人员</strong></td><td>指定人员从本店签约非全里多选，不满足资格的置灰并写原因</td></tr>
          <tr><td><strong>备注</strong></td><td>选填</td><td>运营可见，不影响资格</td></tr>
        </tbody>
      </table>
      <ul class="doc-ul">
        <li>发布后<strong>立即生效并派单</strong>，不等周四。</li>
        <li><strong>不要求</strong>填请假人或原班次 —— 处理的就是「线下发现缺人」。</li>
        <li>同店同日<strong>完全相同起止时间</strong>只允许一条有效需求。</li>
        <li>列表展示派单范围、需求人数、已派人数与人员；不足时保留待派发 / 部分派发，可重试。</li>
      </ul>
    </div>

    <div id="pt-63-transfer" class="section">
      <div class="section-header">
        <h3>6.3.6 任务转移</h3>
      </div>
      <p class="doc-p">
        转移<strong>不重新定义需求</strong>：门店、日期、时段、名额都不变，只换承接关系。原任务保留「已转移」，原承接人<strong>立即失去</strong>到店 / 离店能力。
        页面不出现「换班」—— 换班暗示对调，这里是单向交接。
      </p>
    </div>

    <div id="pt-63-status" class="section">
      <div class="section-header">
        <h3>6.3.7 需求状态与重试</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">状态</th><th style="width: 250px;">含义</th><th>允许操作</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>待派发</strong></td><td>已建立，尚无承接人</td><td>查看原因、重试派发</td></tr>
          <tr><td><strong>部分派发</strong></td><td>部分名额已承接</td><td>补齐剩余名额</td></tr>
          <tr><td><strong>已派发</strong></td><td>全部名额已承接</td><td>查看任务关系</td></tr>
        </tbody>
      </table>
      <ul class="doc-ul">
        <li>没有「派发失败」状态：派不出去停在<strong>待派发</strong>，给一句可读原因 +「重试派发」。</li>
        <li>重试<strong>不动</strong>已建立的承接关系，只补剩余名额；同一人不会因重试被派第二次。</li>
        <li>重试仍不满，说明当下确实没人能接：调时段或线下协调，系统不硬塞。</li>
      </ul>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'
import DocScreens from '../../../docs/components/DocScreens.vue'
import ptBackfillShot from '../../../docs/assets/pages/pt-backfill.png'
import ptBackfillDialogShot from '../../../docs/assets/pages/pt-backfill-dialog.png'
import ptBackfillPickedShot from '../../../docs/assets/pages/pt-backfill-picked.png'

const tocItems = [
  { id: 'pt-63-overview', label: '6.3 临时时段' },
  { id: 'pt-63-sources', label: '6.3.1 五类来源' },
  { id: 'pt-63-dispatch', label: '6.3.2 派单' },
  { id: 'pt-63-cancel', label: '6.3.3 取消后重派' },
  { id: 'pt-63-leave', label: '6.3.4 请假接班' },
  { id: 'pt-63-manual', label: '6.3.5 运营发布' },
  { id: 'pt-63-transfer', label: '6.3.6 任务转移' },
  { id: 'pt-63-status', label: '6.3.7 状态与重试' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '非全客户经理', to: '/docs/parttime-account-manager' },
  { label: '六、功能详细说明', to: '/docs/parttime-account-manager/features' },
  { label: '6.3 临时时段' }
]
</script>

<style scoped src="./doc-base.css"></style>
