<template>
  <DocShell
    :toc-items="tocItems"
    title="五、需求范围"
    subtitle="只做一件事：把一类事定义成「提示词 + 子事件清单」，并保证每一笔单按这个人、这件事的事实长成该长的那样"
    version="v0.1"
    date="2026-10-30"
    :breadcrumbs="breadcrumbs"
  >
    <!-- 5.1 做什么 / 不做什么 -->
    <div id="orch-scope-51" class="section">
      <div class="section-header">
        <h2>五、需求范围</h2>
        <DocCopyButton section-id="orch-scope" />
      </div>

      <div class="note lead-note">
        <strong>一句话定位：</strong>把「一类事」定义成<strong>一套提示词 + 一份子事件清单 + 一个触点</strong>，
        触发时查这个人的事实，生成这一单<strong>该有的那些子事件</strong>；办完、判完、签完，把结论与事实交给下游。
      </div>

      <h3>5.1 做什么 / 不做什么</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 90px;">归属</th>
            <th style="width: 210px;">内容</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>我们做</strong></td>
            <td>一件事的<strong>定义</strong>：适用范围、提示词、子事件清单、触点与载荷</td>
            <td>定义期只描述「这件事必须交出什么、对谁存在、从哪触发」，<strong>不生成任何一单</strong>（见 6.1）</td>
          </tr>
          <tr>
            <td><strong>我们做</strong></td>
            <td>触发时<strong>取数</strong>与按事实<strong>生成子事件</strong></td>
            <td>固定两步取数（档案 / 事实）由引擎执行；生成结果<strong>确定性</strong> —— 同一份清单 + 同一份事实，出同一份子事件，不靠模型即兴发挥（见 6.2、6.3）</td>
          </tr>
          <tr>
            <td><strong>我们做</strong></td>
            <td>办理、结论留痕、门禁与终止</td>
            <td>责任人在移动端逐项交东西给结论；<strong>我们只承载「谁确认了、交了什么」</strong>，不判断事情实际做没做（见 6.4）</td>
          </tr>
          <tr>
            <td><strong>我们做</strong></td>
            <td><strong>系统项</strong>的接入：判定取批次、执行取回执</td>
            <td>流程侧只配<strong>门禁 / 前置 / 取数频率 / 批次上限 / 回执字段</strong>；判什么、按什么条件判归检查 Agent（见 6.5）</td>
          </tr>
          <tr>
            <td><strong>我们做</strong></td>
            <td>进度可见、中期调整可控、结果可交付</td>
            <td>一单自带它的子事件，改版不影响在途单；结果按「结论 · 字段」被下游引用。<strong>只交付事实与结果，不代下游计算</strong>（见 6.6）</td>
          </tr>
          <tr>
            <td><strong>我们不做</strong></td>
            <td>通用流程引擎 / 自由画布 / 分支网关</td>
            <td>先后只用「前置」表达；并列与汇合都由前置派生。<strong>不做条件分支节点</strong>：分岔来自事实，不来自配置（见 6.3.4）</td>
          </tr>
          <tr>
            <td><strong>我们不做</strong></td>
            <td>或签（任一人审批）与驳回回退</td>
            <td>同一角色多人互为备份的场景不在本版；<strong>必过不通过 = 终止全部流程</strong>，要再来一次就<strong>重新发起</strong>（见 6.4.4）</td>
          </tr>
          <tr>
            <td><strong>我们不做</strong></td>
            <td>薪酬 / 社保 / 假勤额度的计算</td>
            <td>各域按自己的规则消费我们交付的事实，我们不下发金额（见 6.6.4）</td>
          </tr>
          <tr>
            <td><strong>我们不做</strong></td>
            <td>系统检查项的判定条件、检查 Agent 的盘查节奏</td>
            <td>那属于检查 Agent 自己的配置；我们只在节点上声明<strong>多久取一次</strong>与<strong>取到第几个未通过批次为止</strong>（见 6.5.2）</td>
          </tr>
          <tr>
            <td><strong>我们不做</strong></td>
            <td>各场景自己的业务字段口径</td>
            <td>例如补偿金上限、常乐豆出口，写在<router-link to="/docs/resign-flow">该场景的需求文档</router-link>里；本文只提供承载它们的字段能力</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 5.2 定义期 / 实例期 -->
    <div id="orch-scope-52" class="section">
      <div class="section-header">
        <h2>5.2 两段：定义期 / 实例期</h2>
        <DocCopyButton section-id="orch-scope-52" />
      </div>
      <p class="doc-p">
        本版最重要的一条分层：<strong>定义期不生成树</strong>。定义只写「必须交出什么」；
        具体某一单长什么样，要等到触发、取到这个人的事实之后才知道。
      </p>
      <div class="duo">
        <div class="duo-card">
          <h4>定义期（一次）</h4>
          <p><strong>产出：</strong>一套提示词 + 一份子事件清单 + 适用范围 + 触点。</p>
          <p><strong>能看到：</strong>组织、岗位编制、角色解析、系统项目录 —— 全都是<strong>与具体人无关</strong>的东西。</p>
          <p><strong>看不到：</strong>谁有客户、谁带团队、谁有欠款。这些逐人数据触发后才有，定义期<strong>不假设</strong>。</p>
          <p class="duo-k">改动影响：只影响之后触发的单，在途单按它自己那一份走（见 6.3.5）。</p>
        </div>
        <div class="duo-card">
          <h4>实例期（每一单）</h4>
          <p><strong>产出：</strong>这一单自己的子事件（含前置、负责人、事项字段、系统项与回执）。</p>
          <p><strong>谁在动：</strong>责任人办、系统判、对方回执；人事可以在这一单上做<strong>中期调整</strong>。</p>
          <p><strong>边界：</strong>已办结的锁住；同类调整反复出现，说明该回定义层改提示词，而不是逐单修补。</p>
          <p class="duo-k">状态口径：等待前置 / 当前可办 / 已办结 / 终止（见 6.6.2）。</p>
        </div>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">维度</th><th style="width: 300px;">定义期</th><th>实例期</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>何时发生</strong></td><td>上线前一次，之后按改版节奏</td><td>每触发一笔就有一次</td></tr>
          <tr><td><strong>数量</strong></td><td>一个事件一套</td><td>一笔单一套，互相独立</td></tr>
          <tr><td><strong>谁能改</strong></td><td>事件维护人（改提示词、改清单）</td><td>这一单的办理人（办结自己那一环）、人事（中期调整）</td></tr>
          <tr><td><strong>改动的后果</strong></td><td>只影响之后触发的单</td><td>只影响这一单，不影响同事件的其它单</td></tr>
          <tr><td><strong>判断依据</strong></td><td>与具体人无关的组织事实</td><td>这一个员工的档案与逐人事实</td></tr>
        </tbody>
      </table>
    </div>

    <!-- 5.3 一单的链路 -->
    <div id="orch-scope-53" class="section">
      <div class="section-header">
        <h2>5.3 一单的完整链路</h2>
        <DocCopyButton section-id="orch-scope-53" />
      </div>
      <div class="chain">
        <div class="chain-node on">
          <div class="cn-t">起草</div>
          <div class="cn-d">一段话说清这件事，Agent 查事实、问缺口，给出确认单（6.1.1）</div>
        </div>
        <span class="chain-arrow">→</span>
        <div class="chain-node">
          <div class="cn-t">定义</div>
          <div class="cn-d">四段定稿：管谁 / 提示词 / 子事件清单 / 怎么触发（6.1.2–6.1.8）</div>
        </div>
        <span class="chain-arrow">→</span>
        <div class="chain-node">
          <div class="cn-t">触发</div>
          <div class="cn-d">触点来单，载荷按登记校验，引擎固定两步取数（6.2）</div>
        </div>
        <span class="chain-arrow">→</span>
        <div class="chain-node">
          <div class="cn-t">生成</div>
          <div class="cn-d">清单 × 事实 = 这一单的子事件，位次由前置推导（6.3）</div>
        </div>
        <span class="chain-arrow">→</span>
        <div class="chain-node">
          <div class="cn-t">办 / 判 / 等</div>
          <div class="cn-d">人办给结论；系统判定、系统执行；对方回执（6.4、6.5）</div>
        </div>
        <span class="chain-arrow">→</span>
        <div class="chain-node">
          <div class="cn-t">交付</div>
          <div class="cn-d">事实 + 结果字段交给下游，各域自行消费（6.6.4）</div>
        </div>
      </div>
      <div class="note">
        <strong>链路只走一遍，不回到起点。</strong>必过子事件不通过就终止全部流程；要再办一次，是一条新单。
        这也是本版不支持「驳回 / 退回修改」的原因：回边会让「这一单到底办完没有」永远说不清（见 6.4.4）。
      </div>
    </div>

    <!-- 5.4 一条子事件的六件事 -->
    <div id="orch-scope-54" class="section">
      <div class="section-header">
        <h2>5.4 一条子事件要说清六件事</h2>
        <DocCopyButton section-id="orch-scope-54" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 140px;">要素</th><th style="width: 250px;">回答什么</th><th>示例（离职）</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>结论</strong></td><td>办成什么样才算完</td><td>在跟客户已交接完毕</td></tr>
          <tr><td><strong>门禁</strong></td><td>不通过会怎样</td><td>必过：不通过 = 终止全部流程</td></tr>
          <tr><td><strong>前置</strong></td><td>什么时候才能开始办</td><td>需等：人事已审核通过</td></tr>
          <tr><td><strong>谁给结论</strong></td><td>谁核对、谁填结果</td><td>店长（按员工所在门店解析到人）</td></tr>
          <tr><td><strong>要交什么</strong></td><td>交什么才能给这个结论</td><td>客户姓名、接收人（人员）、移交清单（附件 · 必传 · PDF / JPG / PNG）</td></tr>
          <tr><td><strong>结果字段</strong></td><td>下游要用的值放在哪</td><td>审核环节的「款项出口」「实际离职日期」，被系统执行项按字段名引用（见 6.5.6）</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>六件事缺哪一条都会露馅：</strong>没有结论 → 判不出办完没有；没有门禁 → 不通过也能往下走；
        没有前置 → 该等的没等；没有负责人 → 没人能办；没有说话内容 → 交上来的是空白；
        没有结果字段 → 下游只能再问一次。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'orch-scope-51', label: '5.1 做什么 / 不做什么' },
  { id: 'orch-scope-52', label: '5.2 定义期 / 实例期' },
  { id: 'orch-scope-53', label: '5.3 一单的完整链路' },
  { id: 'orch-scope-54', label: '5.4 一条子事件的六件事' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '事件编排', to: '/docs/orchestration' },
  { label: '五、需求范围' }
]
</script>

<style scoped src="./doc-base.css"></style>
