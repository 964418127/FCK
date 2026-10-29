<template>
  <DocShell
    :toc-items="tocItems"
    title="6.6 进度、调整与交付"
    subtitle="一单走到哪、哪些还能改、改了什么要回到定义层；交付只交事实与结果字段"
    version="v0.1"
    date="2026-10-30"
    :breadcrumbs="breadcrumbs"
  >
    <div id="orch-66" class="section">
      <div class="section-header">
        <h2>6.6 进度、调整与交付</h2>
        <DocCopyButton section-id="orch-66" />
      </div>

      <div class="func-entry"><strong>功能入口：</strong>Web → 事件数据（所有单一张表）→ 点开一单 → 子事件画布（这一单的流程）+ 右侧抽屉（选中那一条的明细）；移动端 → 事项办理 → 点开一笔看「过程与结果」</div>

      <h3 id="orch-66-1">6.6.1 一单的状态</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">单据状态</th><th style="width: 220px;">什么时候是它</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>生成中</strong></td><td>已触发、取数完成、子事件正在落库</td><td>通常只存在几秒；失败要留失败原因，不留在「生成中」</td></tr>
          <tr><td><strong>流转中</strong></td><td>还有未办结的子事件</td><td>绝大多数时间都在这里</td></tr>
          <tr><td><strong>已办结</strong></td><td>全部必过项办结（可选项按各自结论收尾）</td><td>结果字段可以被下游引用</td></tr>
          <tr><td><strong>已终止</strong></td><td>任一必过项不通过</td><td>未办的一并关闭；终止原因留在那一环</td></tr>
        </tbody>
      </table>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">子事件状态</th><th>含义</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>等待前置</strong></td><td>前置没全部办结，还轮不到它</td></tr>
          <tr><td><strong>当前可办</strong></td><td>前置已满足，在责任人待办里</td></tr>
          <tr><td><strong>待取数 / 系统核验中</strong></td><td>系统判定项在等批次结果，或正在取</td></tr>
          <tr><td><strong>等回执</strong></td><td>外部回执项，等对方动手</td></tr>
          <tr><td><strong>已办结</strong></td><td>完成 / 不通过 / 跳过 / 因终止关闭 —— 统称已办结，<strong>只有完成才算达成</strong></td></tr>
        </tbody>
      </table>

      <h3 id="orch-66-2">6.6.2 看进度用画布，不用清单</h3>
      <p class="doc-p">
        一单的子事件之间有前置关系，清单是<strong>线性的</strong>，画布是<strong>分层的</strong>。
        用清单看进度，人会误以为「第 3 条卡住 = 后面全停」；实际上只有真正以它为前置的那几条在等。
      </p>
      <DocScreens
        :images="[
          { src: treeShot, label: '子事件画布：横列 = 层（第 1 步、第 2 步…），卡片 = 一条结论（负责人 + 状态 + 已办结几条前置），曲线 = 前置关系；顶部写清取数结果与「该办 16 条 · 这单不需要 5 条」' },
          { src: instancesShot, label: '事件数据：所有单一张表 —— 单号、员工、触点、进度、状态；点进去看这一单的画布与记录' }
        ]"
      />
      <table class="data-table">
        <thead>
          <tr><th style="width: 180px;">画布上能看出的三件事</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>现在卡在哪</strong></td><td>「当前可办」的卡片有几张、分别谁负责；「在等系统 / 对方」的写清在等什么</td></tr>
          <tr><td><strong>后面还有多少</strong></td><td>卡片上写「等 1 条办结 / 等 4 条办结」，一眼能看出这一条被几条前置卡住</td></tr>
          <tr><td><strong>为什么这一单少了某条</strong></td><td>顶部写「该办 N 条 · 这单不需要 M 条」，具体是哪几条、因为什么，在明细里逐条列事实的否定说法</td></tr>
        </tbody>
      </table>

      <h3 id="orch-66-3">6.6.3 中期调整：在这一单上改</h3>
      <p class="doc-p">
        生成之后才发现的偏差（这一单确实还多一件东西要交、前置写反了、某条这一单不适用），在<strong>这一单</strong>上改，
        不回定义层改：定义层的改动会波及所有新单。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">能改什么</th><th style="width: 230px;">怎么改</th><th>限制</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>加一条</strong></td><td>从定义里挑一条没长出来的补上，或写一条这一单专用的</td><td>要挂到已有条目上（选前置），否则它会立刻进某人待办</td></tr>
          <tr><td><strong>删一条</strong></td><td>确认这一单确实不需要</td><td><strong>已办结的锁住</strong>，不能删也不能改；删了要摘掉<strong>等它的前置</strong>，不能留悬空</td></tr>
          <tr><td><strong>改前置</strong></td><td>加/减前置，让这一条早一点或晚一点开始</td><td>不能改成环；画布上点连线即可断开</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>调整会留痕，但不拦流程。</strong>每次调整记录「谁、什么时候、改了什么」，用来回答「为什么这一单和同岗位的另一单不一样」。<br />
        <strong>同类调整跨多张单反复出现，说明缺的不是这一单的例外，而是定义层的口径：</strong>
        要么清单少了这一条，要么某条事实判断错了，要么提示词没写清。这时该回<router-link to="/docs/orchestration/6-1">6.1</router-link>改定义，而不是继续逐单修补。
      </div>

      <h3 id="orch-66-4">6.6.4 交付：只交事实，不代算</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 190px;">交付什么</th><th style="width: 240px;">形状</th><th>谁消费</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>这件事发生了</strong></td><td>事件 + 员工 + 单号 + 办结时间</td><td>所有需要知道「这个人状态变了」的系统</td></tr>
          <tr><td><strong>关键日期</strong></td><td>如实际离职日期（审核环节定稿、不可撤销）</td><td>薪酬（算到哪天）、假勤（额度截断）、排班（取消未开始班次）</td></tr>
          <tr><td><strong>结果字段</strong></td><td>审核/办理环节填下的可核对值（款项出口、补偿金额、签署状态…）</td><td>需要这些值做自己那一段计算的系统</td></tr>
          <tr><td><strong>凭证索引</strong></td><td>附件与签字的存在与位置（不复制内容）</td><td>事后审计、争议处理</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>不交付「结论性判断」：</strong>不写「应发多少」、不写「社保该缴到几月」、不写「假期还剩几天」。
        那是下游按自己的规则算的；我们算了，下游再算一遍，两个数不一样时没人知道该信哪个。
      </div>

      <h3 id="orch-66-5">6.6.5 交付之后：回执与失败</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 190px;">情形</th><th>处理</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>下游已收到</strong></td><td>记回执（谁收到、什么时候），这条交付类子事件办结</td></tr>
          <tr><td><strong>下游超时未收到</strong></td><td>按这条系统项的重试上限重试；仍失败 → <strong>转人工</strong>跟进，不静默失败</td></tr>
          <tr><td><strong>下游处理失败</strong></td><td>下游自己的失败留在下游，回执里带上失败原因；<strong>不因下游失败而回滚这一单</strong>（事实已经发生）</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>一句边界：</strong>我们把「这个人已经从哪天起不在这里了」这件事交出去，各域按自己的规则落地。
        谁算错了钱，回不到这张单上 —— 但能不能拿出「他确实从那天起离职、这个值是谁在哪一步填的」，是这张单的责任。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'
import DocScreens from '../../../docs/components/DocScreens.vue'
import treeShot from '../../../docs/assets/pages/v2-inst-tree.png'
import instancesShot from '../../../docs/assets/pages/v2-instances.png'

const tocItems = [
  { id: 'orch-66-1', label: '6.6.1 一单的状态' },
  { id: 'orch-66-2', label: '6.6.2 看进度用画布' },
  { id: 'orch-66-3', label: '6.6.3 中期调整' },
  { id: 'orch-66-4', label: '6.6.4 交付：只交事实' },
  { id: 'orch-66-5', label: '6.6.5 交付之后' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '事件编排', to: '/docs/orchestration' },
  { label: '六、功能详细说明', to: '/docs/orchestration/features' },
  { label: '6.6 进度、调整与交付' }
]
</script>

<style scoped src="./doc-base.css"></style>
