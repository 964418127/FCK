<template>
  <DocShell
    :toc-items="tocItems"
    title="6.2 发起与触发取数"
    subtitle="员工两步发起（申请 → 确认签字）；提交之后，引擎固定两步把「这个人」查清楚，才谈得上生成"
    version="v0.1"
    date="2026-10-30"
    :breadcrumbs="breadcrumbs"
  >
    <div id="orch-62" class="section">
      <div class="section-header">
        <h2>6.2 发起与触发取数</h2>
        <DocCopyButton section-id="orch-62" />
      </div>

      <div class="func-entry"><strong>功能入口：</strong>移动端 → 发起事项（员工侧）→ 选择要发起的事 → 两步填完提交；Web 侧同一件事由触点自动开单，不经过这个页面</div>

      <div class="note">
        <strong>本节的位置：</strong>发起是<strong>单据的起点</strong>，取数是<strong>生成的前置</strong>。
        两者都不是子事件：发起页不预告要办几项（那时还没生成），取数不上树（它没有承担者、不给结论）。
      </div>

      <h3 id="orch-62-1">6.2.1 员工发起：为什么是两步</h3>
      <p class="doc-p">
        发起页把所有要填的东西压到<strong>两屏</strong>：第一屏「申请」是他真知道的事，第二屏「确认」是他真能负责的事。
        再拆多一屏就是重复劳动，合成一屏则会出现「没看清就签了」。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 110px;">步骤</th><th style="width: 210px;">区块</th><th>内容</th></tr>
        </thead>
        <tbody>
          <tr>
            <td rowspan="4"><strong>① 申请</strong></td>
            <td><strong>我的信息</strong></td>
            <td>姓名 / 工号 / 岗位 / 门店 / 用工形式 —— <strong>全部按档案带出，只读</strong>；档案不对要先改主数据，不在这张单上改</td>
          </tr>
          <tr>
            <td><strong>事项意向</strong></td>
            <td>本事件要求员工自己填的那几格（离职为例：<strong>期望离职日期</strong>必填、<strong>离职原因</strong>多选必填、补充说明选填）</td>
          </tr>
          <tr>
            <td><strong>收款账户</strong></td>
            <td>按档案带出，可改；用于结算类事件的尾款 / 补偿到账</td>
          </tr>
          <tr>
            <td><strong>审核人</strong></td>
            <td>按这套定义的<strong>审核子事件</strong>带出（谁审、几级），<strong>只读</strong> —— 员工不改审核链，改由配置决定</td>
          </tr>
          <tr>
            <td rowspan="3"><strong>② 确认</strong></td>
            <td><strong>核对</strong></td>
            <td>把第一屏填的内容逐行复述一遍（改一处就要回第一屏改）</td>
          </tr>
          <tr>
            <td><strong>本人签字</strong></td>
            <td>手写签名；签名图随单留存，作为「他确认过这些内容」的凭证</td>
          </tr>
          <tr>
            <td><strong>同意须知</strong></td>
            <td>勾选后提交；须知内容由事件维护人写，不在代码里写死</td>
          </tr>
        </tbody>
      </table>
      <DocScreens :images="[{ src: applyShot, label: '移动端发起 · 第一步「申请」：我的信息（档案带出）→ 事项意向 → 收款账户 → 审核人（按配置带出，只读）' }]" mode="phone" />

      <h3 id="orch-62-2">6.2.2 提交之后：先校验，再取数，再生成</h3>
      <div class="chain">
        <div class="chain-node on">
          <div class="cn-t">① 生成单号</div>
          <div class="cn-d">按「前缀 + 日期 + 流水」生成，<strong>不用员工填</strong>，也不出现在表单里</div>
        </div>
        <span class="chain-arrow">→</span>
        <div class="chain-node">
          <div class="cn-t">② 载荷校验</div>
          <div class="cn-d">按登记核字段（必传 / 类型 / 未知 key），不通过即拒单并说清缺哪个（见 6.1.8）</div>
        </div>
        <span class="chain-arrow">→</span>
        <div class="chain-node">
          <div class="cn-t">③ 取数</div>
          <div class="cn-d">员工档案 + 逐人事实，两步固定（6.2.3）</div>
        </div>
        <span class="chain-arrow">→</span>
        <div class="chain-node">
          <div class="cn-t">④ 生成</div>
          <div class="cn-d">清单 × 事实 = 这一单的子事件，同时算出谁在什么时候能办（见 6.3）</div>
        </div>
        <span class="chain-arrow">→</span>
        <div class="chain-node">
          <div class="cn-t">⑤ 落在第一环</div>
          <div class="cn-d">按前置推导，没有前置的条目立刻进责任人待办</div>
        </div>
      </div>
      <div class="note">
        <strong>发起页三条边界（都是刻意的）：</strong>
        ① <strong>不预告要办几项</strong> —— 那时还没生成，说一个数就是猜的；
        ② <strong>不展示金额与积分</strong> —— 补偿、余额这类值是审核环节才补、才锁的，发起时既不该让员工看，也不该指望对岸这时就发过来；
        ③ <strong>审核链只读</strong> —— 员工能改审核人，等于他能挑谁审。
      </div>

      <h3 id="orch-62-3">6.2.3 触发取数：固定两步</h3>
      <p class="doc-p">
        取数是引擎对<strong>所有根事件</strong>天然执行的一步：拿到「谁触发了」之后，先把这个人是查清楚，再拿这个人去生成。
        它<strong>不是</strong>子事件，也不允许被配置成子事件。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">步骤</th><th style="width: 180px;">从哪取</th><th>取什么</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>① 员工档案</strong></td>
            <td>HR 员工主数据（按工号）</td>
            <td>姓名 / 岗位 / 城市 / 门店 / 用工形式 / 入职日 / 合同主体 —— 用于<strong>定位与解析责任人</strong>（店长、城市总都是按这个解析出来的）</td>
          </tr>
          <tr>
            <td><strong>② 逐人事实</strong></td>
            <td>客户 / 工单 / 资产 / 财务 / 权限等台账（按工号）</td>
            <td>在跟客户、在办事项、团队、资产、备用金、欠款、账号、客诉、是否涉补偿 —— 用于<strong>判定哪些子事件对这个人存在</strong>（见 6.3）</td>
          </tr>
        </tbody>
      </table>
      <table class="data-table">
        <thead>
          <tr><th style="width: 200px;">取数的四条边界</th><th>为什么这么定</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>不进子事件清单</strong></td><td>清单是「这件事必须交出哪些结论」；取数是生成清单的<strong>输入</strong>，本身不是一个结论</td></tr>
          <tr><td><strong>不在树上</strong></td><td>树上每一条都要有人给结论；取数没有承担者、不给结论。摆上树只会让它看起来能被排到交接之后</td></tr>
          <tr><td><strong>不可调整</strong></td><td>没人能删、跳过或改它的执行时机 —— 所以不给开关，也没有配置项</td></tr>
          <tr><td><strong>档案取不到即不成立</strong></td><td>连「这是谁」都确认不了，生成出来的子事件没有承担者；此时单子不进入流转，并向发起方回明确的失败原因</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>为什么必须放在生成之前：</strong>子事件是按「这个人有没有客户、带不带团队」长出来的。
        事实还没取回来就生成，等于树已经长完了才去查长树要用的数据 —— 结果只能是一份「按岗位猜的平均流程」。
      </div>

      <h3 id="orch-62-4">6.2.4 「取到了，只是没有」与「没取到」</h3>
      <p class="doc-p">
        两者在数据上都是一片空白，在业务上完全不同：
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">情况</th><th style="width: 210px;">系统怎么处理</th><th>给人看什么</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>取到了，值是 0 / 空</strong></td><td>照常生成，依赖该事实的子事件<strong>不长出来</strong></td><td>写清「这一单为什么没有」：如「不带客户」「无在册资产」—— 用的是该事实登记的<strong>否定说法</strong>，不是一句「不适用」</td></tr>
          <tr><td><strong>没取到（台账不可用）</strong></td><td><strong>不生成</strong>，按失败处理并回执发起方</td><td>说清是哪一步、哪个系统没响应；不写「已完成」也不写「无异常」</td></tr>
          <tr><td><strong>查到但查不到这个人</strong></td><td>返回空，<strong>不给 0</strong></td><td>金额、余额类数据必须区分「没有」与「查不到」—— 给 0 等于替他做了结论</td></tr>
        </tbody>
      </table>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'
import DocScreens from '../../../docs/components/DocScreens.vue'
import applyShot from '../../../docs/assets/pages/v2-m-apply.png'

const tocItems = [
  { id: 'orch-62-1', label: '6.2.1 员工发起：两步' },
  { id: 'orch-62-2', label: '6.2.2 提交之后做什么' },
  { id: 'orch-62-3', label: '6.2.3 触发取数：固定两步' },
  { id: 'orch-62-4', label: '6.2.4 没有 / 没取到' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '事件编排', to: '/docs/orchestration' },
  { label: '六、功能详细说明', to: '/docs/orchestration/features' },
  { label: '6.2 发起与触发取数' }
]
</script>

<style scoped src="./doc-base.css"></style>
