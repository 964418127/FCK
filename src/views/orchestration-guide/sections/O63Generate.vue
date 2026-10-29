<template>
  <DocShell
    :toc-items="tocItems"
    title="6.3 子事件生成"
    subtitle="清单 × 事实 = 这一单要办的事；差异只来自事实，不来自谁更会写提示词"
    version="v0.1"
    date="2026-10-30"
    :breadcrumbs="breadcrumbs"
  >
    <div id="orch-63" class="section">
      <div class="section-header">
        <h2>6.3 子事件生成</h2>
        <DocCopyButton section-id="orch-63" />
      </div>

      <div class="note lead-note">
        <strong>一句话：</strong>生成 = <strong>定义期那份清单</strong> × <strong>这一单取回的事实</strong>。
        同一份清单 + 同一份事实，无论什么时候、由谁触发，出来的子事件<strong>完全一样</strong> —— 它不是「再让模型想一遍」。
      </div>

      <h3 id="orch-63-1">6.3.1 模型只在定义期参与一次</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">阶段</th><th style="width: 210px;">谁在决定</th><th>为什么这么分工</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>定义期</strong></td>
            <td>模型（起草）+ 人（审口径与清单）</td>
            <td>把一句业务话拆成「必须交出的结论」是模型擅长的；但拆得对不对必须有人审，所以清单是<strong>人确认过的产物</strong>，不是运行时临时产出</td>
          </tr>
          <tr>
            <td><strong>实例期</strong></td>
            <td>确定性规则（清单 × 事实）</td>
            <td>同一件事在两个人身上长出两份不同的清单，必须能解释<strong>为什么不同</strong>；差异只能来自事实，否则就是随机</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>为什么坚持确定性：</strong>一旦运行时靠模型即兴决定「这个人要不要交接客户」，
        同一件事就会出现「上次有这个环节、这次没有」的情况，且<strong>没有任何人能看到它为什么没长</strong>。
        确定性生成的每一条、每一条的缺席，都能追到一个具体事实值。
      </div>

      <h3 id="orch-63-2">6.3.2 事实两层：基础事实与事件专用事实</h3>
      <p class="doc-p">
        判断「这一条对这个人存不存在」依靠事实。事实分两层，<strong>不能混在一张表里</strong>：
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">层</th><th style="width: 250px;">有哪些</th><th>为什么放这一层</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>基础事实</strong></td>
            <td>人人都有（不需要事实）· 在跟客户 · 在办事项 · 带团队 · 有资产 · 备用金 · 有欠款 · 有账号</td>
            <td>这些事实在<strong>任何一件事里</strong>口径都一样，可以共用一张表</td>
          </tr>
          <tr>
            <td><strong>事件专用事实</strong></td>
            <td>离职为例：持有 AACB · 有客诉 · 需补偿</td>
            <td>只对这件事成立的判断（换一件事就没有「需补偿」）。<strong>由该事件的提示词自己声明</strong>，不往基础表里塞</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>为什么要拦：</strong>清单里用了某条事实、提示词却没声明它，说明这段提示词是<strong>抄来的</strong>（口径还是别人的），
        或者写的人以为基础表里有。发布前直接拦下（<span class="mono">NEEDS_UNKNOWN</span>），不给「先跑起来看看」的机会 ——
        跑起来只会得到一棵按岗位猜的树。
      </div>

      <h3 id="orch-63-3">6.3.3 三条生成规则</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 190px;">规则</th><th style="width: 230px;">做法</th><th>反例（会被拦下）</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>① 命中即长</strong></td>
            <td>该条声明的事实为真 → 生成这一条；为假 → 不生成</td>
            <td>「在跟客户才移交客户」这条写成「人人都有」，于是不带客户的人也被要求交客户名单</td>
          </tr>
          <tr>
            <td><strong>② 必过缺项 = 不合格</strong></td>
            <td>该长却没长（或长出来了但清单里没有）→ 判<strong>不合格</strong>，明确报哪一条</td>
            <td>树里少了「离职合同已完成签署」，整单仍被当作办完 —— 这正是「办完没有」说不清的根源</td>
          </tr>
          <tr>
            <td><strong>③ 不适用却生成 = 提醒</strong></td>
            <td>事实为假却生成了这一条 → 只提醒，不拦</td>
            <td>给一个无欠款的人生成「欠款与借款已结清」，办的人只能勾「不适用」，等于多一次无意义确认</td>
          </tr>
        </tbody>
      </table>
      <p class="doc-p">
        <strong>不许按岗位想象事实。</strong>同岗位两个人的资产、欠款、团队都可能不同 ——
        事实只能从台账取，不能用「推拿师一般都有 AACB」这类经验补。<strong>事实取不到就不长这一条，也不许补一条空的凑齐流程。</strong>
      </p>

      <h3 id="orch-63-4">6.3.4 位次：只由前置推导</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">情形</th><th>结果</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>没写前置</strong></td><td>触发后即可办，和所有没写前置的条目<strong>同时开始</strong>、互相不等待（并行是「没写」的自然结果，不需要配）</td></tr>
          <tr><td><strong>写了前置</strong></td><td>这些前置<strong>全部办结</strong>后才能开始办（汇合）；一条可以被多条同时等待（分叉）</td></tr>
          <tr><td><strong>前置写了「或」组</strong></td><td>组内任一条办结即可开始（例如「物品归还」或「AACB 交还」任一完成就够）</td></tr>
          <tr><td><strong>前置指向的那条被裁掉</strong></td><td>生成时<strong>跳过它</strong> —— 不该长的条目不会成为别人的枷锁（否则一个不带团队的人，会卡在「团队已交接」上永远不动）</td></tr>
          <tr><td><strong>层号</strong></td><td>不落库、不手填，由前置关系<strong>算出来</strong>（拓扑排序）；列表按层排只是阅读顺序，不代表时序</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>为什么不做画布：</strong>画布允许人画出「分叉再汇合」的任意形状，也允许画出环。
        前置 + 拓扑已经能表达先后、并行、汇合与或组，而且<strong>画不出环</strong>（生成前有环校验）。少一种画法，少一类事故。
      </div>

      <h3 id="orch-63-5">6.3.5 每一单自带一份，不随定义变</h3>
      <p class="doc-p">
        生成完成后，这一单<strong>保存自己那份子事件</strong>（含每条的前置、负责人、字段），并记录生成时<strong>长了哪些、裁掉哪些</strong>。
        之后定义改版，只有<strong>之后触发</strong>的单用新版。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 190px;">场景</th><th>结果</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>定义改了清单</strong></td><td>在途单不受影响：它按自己那份走完，事后能说清「这一单是按第几版生成的」</td></tr>
          <tr><td><strong>在途单要加一条</strong></td><td>在这一单上做<strong>中期调整</strong>（见 6.6.3），不从定义层推 —— 定义层的改动会波及所有新单</td></tr>
          <tr><td><strong>同一条被裁掉</strong></td><td>在这一单上留痕「为什么没有」：写的是事实的否定说法（不带客户 / 无在册资产），不是一句「不适用」</td></tr>
        </tbody>
      </table>

      <h3 id="orch-63-6">6.3.6 同一套定义，三个人长出三棵树</h3>
      <p class="doc-p">
        下面三个人用<strong>同一套</strong>离职定义（清单 21 条、必过 18 条），差别只在取回的事实。这才是「定义一次、按人生成」的实际形状：
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 150px;">人</th>
            <th style="width: 210px;">取回的关键事实</th>
            <th style="width: 120px;">这一单子事件</th>
            <th>没有被生成（为什么）</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>张三</strong><br /><span class="mono">推拿师</span></td>
            <td>在跟客户 4 · 在办事项 2 · 资产含 AACB · 欠款 320 · 账号 4 个</td>
            <td><strong>18 条</strong><br /><span class="tag-opt">裁掉 3</span></td>
            <td>团队与在管门店已交接（不带团队）· 备用金与收银现金已结清（不保管备用金）· 补偿金金额与协议已确认（不涉补偿）</td>
          </tr>
          <tr>
            <td><strong>刘丹</strong><br /><span class="mono">店长</span></td>
            <td>在跟客户 3 · 带团队 5 人 · 备用金 2000 · 无欠款 · 无 AACB</td>
            <td><strong>17 条</strong><br /><span class="tag-opt">裁掉 4</span></td>
            <td>AACB 已交还并验收（名下无 AACB）· 欠款与借款已结清、财务台账侧无未结清负债（无欠款）· 补偿金…（不涉补偿）</td>
          </tr>
          <tr>
            <td><strong>杨春燕</strong><br /><span class="mono">城市总</span></td>
            <td>不带客户 · 带团队 9 人 · 无资产异常 · 无欠款 · 无客诉 · 涉补偿</td>
            <td><strong>15 条</strong><br /><span class="tag-opt">裁掉 6</span></td>
            <td>在跟客户已交接完毕 · AACB 已交还并验收 · 备用金… · 欠款与借款、财务台账负债 · 无未完结客诉与纠纷</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>这张表就是本版的核心论据：</strong>同一套提示词，三个人相差 3 条子事件 ——
        不是谁写了两份流程，也不是谁在图上加了分支，而是<strong>事实不同</strong>。
        而且每一条「没有」都能指名道姓说清是哪个事实为假，不需要人去解释。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'orch-63-1', label: '6.3.1 模型只参与一次' },
  { id: 'orch-63-2', label: '6.3.2 事实两层' },
  { id: 'orch-63-3', label: '6.3.3 三条生成规则' },
  { id: 'orch-63-4', label: '6.3.4 位次由前置推导' },
  { id: 'orch-63-5', label: '6.3.5 每一单自带一份' },
  { id: 'orch-63-6', label: '6.3.6 三个人、三棵树' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '事件编排', to: '/docs/orchestration' },
  { label: '六、功能详细说明', to: '/docs/orchestration/features' },
  { label: '6.3 子事件生成' }
]
</script>

<style scoped src="./doc-base.css"></style>
