<template>
  <DocShell
    :toc-items="tocItems"
    title="6.3 排班结果"
    subtitle="谁哪天上了哪个班，只从这一张表读；时间轴看现场、矩阵看名额、缺口看异常"
    version="v5.2"
    date="2026-11-17"
    :breadcrumbs="breadcrumbs"
  >
    <div id="hs-63" class="section">
      <div class="section-header">
        <h2>6.3 排班结果</h2>
        <DocCopyButton section-id="hs-63" />
      </div>
      <p class="doc-p">
        这一章解决<strong>结果从哪里读</strong>：不管人是被系统派的、自己领的、审核排上的还是被安排顶班的，
        最终都写成同一条记录。任何系统或页面要问「谁哪天在哪个班」，都从这张表读，不另立第二份。
      </p>
      <div class="func-entry">
        <strong>功能入口：</strong>排班策略 v5（原型 <code>/schedule-v5</code>）→ <strong>轮与结果</strong>
        （三个视图：空间时间轴 / 占用矩阵 / 缺口；下方申领登记 + 排班结果表）
      </div>
    </div>

    <div id="hs-63-views" class="section">
      <div class="section-header">
        <h3>6.3.1 三个视图</h3>
      </div>
      <DocScreens
        :height="420"
        :images="[
          { src: axisShot, label: '空间时间轴（默认）：横轴时间、纵轴班次，每格显示谁在、哪个班还缺人' },
          { src: gridShot, label: '占用矩阵：行=班次、列=这一轮每一天，每格「已占 x / N」+ 在班的人；点空格直接定人' },
          { src: gapViewShot, label: '缺口：只看排班确定后因事件缺人的缺口，一行一条带规则与结论；点一行看缺口规则逐条各判一次' }
        ]"
      />
      <table class="data-table">
        <thead>
          <tr><th style="width: 140px;">视图</th><th style="width: 300px;">看什么</th><th>什么时候用</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>空间时间轴</strong></td><td>横轴这一轮每一天的时刻，纵轴班次；格子放人名条，缺人的班红字「还缺 n 人 · 定人」（点开定人，见 6.3.4）</td><td>看一天现场怎么运转</td></tr>
          <tr><td><strong>占用矩阵</strong></td><td>行 = 班次，列 = 这一轮每一天；每格「已占 x / N」</td><td>核对名额占用进度</td></tr>
          <tr><td><strong>缺口</strong></td><td>有效名额没占满的班次 + 日期，附缺口规则名</td><td>找异常：哪些班缺人、要不要处理</td></tr>
        </tbody>
      </table>
      <div class="note">
        日期范围跟着该空间这一轮的覆盖区间走：门店 7 天、办公区整月——排到哪天就显示哪天。
      </div>
    </div>

    <div id="hs-63-rows" class="section">
      <div class="section-header">
        <h3>6.3.2 排班结果表：唯一记录口</h3>
      </div>
      <DocScreens
        :height="300"
        :images="[
          { src: tableShot, label: '排班结果表：一条记录=一个人占一条班次的一天，「怎么排上的」跟着动作走；下方申领登记标出截止后会排上的名次' }
        ]"
      />
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">字段</th><th style="width: 300px;">取值</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>日期 · 班次 · 人</strong></td><td>哪天、哪条班次、谁</td><td>一条记录 = 一个人占一条班次的一天</td></tr>
          <tr><td><strong>怎么排上的</strong></td><td>直派 · 第 n 档 / 抢 · 第 n 档 / 申领 · 排上（综合分 x）/ 顶班 / 换班</td><td>来源跟着动作走，读表不用猜</td></tr>
          <tr><td><strong>状态</strong></td><td>有效 / 被覆盖</td><td>被事实覆盖后原记录保留、标记状态，痕迹不删</td></tr>
          <tr><td><strong>变动历史</strong></td><td>逐条记录发生了什么</td><td>原计划 → 被什么覆盖 → 谁来顶，全程可回看</td></tr>
        </tbody>
      </table>
      <div class="note">
        直派到点分人与申领截止结算<strong>自动写表</strong>；人事不在这张表上手工改人——要改走事实（换班 / 顶班）。
      </div>
    </div>

    <div id="hs-63-apply" class="section">
      <div class="section-header">
        <h3>6.3.3 申领登记</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">项目</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>登记内容</strong></td><td>按「班次 × 日期」分组，组内按综合分从高到低排</td></tr>
          <tr><td><strong>预排标记</strong></td><td>截止后会排上的前 N 名先标出来；<strong>人事只看不审批</strong>，截止系统自动结算</td></tr>
          <tr><td><strong>落选</strong></td><td>截止结算后写明落选原因（综合分不够 / 时间冲突被跳过），人可等下一轮</td></tr>
        </tbody>
      </table>
      <div class="note warn-note">
        <strong>明确不做：</strong>不在结果表上直接改人或删人；个人时间线与被占用历史在 6.4 的事实记录页看，结果表只负责「现在谁在哪个班」。
      </div>
    </div>

    <div id="hs-63-appoint" class="section">
      <div class="section-header">
        <h3>6.3.4 定人：结果层补人</h3>
      </div>
      <DocScreens
        :height="320"
        :images="[
          { src: appointShot, label: '定人弹层：缺口横幅带来源与余量，候选只列符合这一档、当时没班、时间不撞的人；还缺几个选几个' }
        ]"
      />
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">入口</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>空间时间轴 / 占用矩阵</strong></td><td>缺口格红字「还缺 n 人 · 定人」，点开就是定人弹层（时段和日期已带好）</td></tr>
          <tr><td><strong>缺口视图</strong></td><td>轮里名额没人拿满不算缺口规则管的事，直接在这里定人</td></tr>
          <tr><td><strong>临时班次（配置台）</strong></td><td>「这一天要几个人」保存后不选人，提示「去结果里定人」</td></tr>
          <tr><td><strong>人事通知</strong></td><td>缺口通知卡上「处理：定人」，点开同一个弹层，时段日期已带好</td></tr>
        </tbody>
      </table>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">弹层内容</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>缺口横幅</strong></td><td>日期 · 班次 · 时间 + 来源（周期时段 / 临时班次）+ 名额 n、已定 x、还缺 y</td></tr>
          <tr><td><strong>为什么缺</strong></td><td>这一轮还在选班次（缺的位一般等截止后补）/ 获取段排完还缺人 / 临时加的名额还没人占</td></tr>
          <tr><td><strong>候选</strong></td><td>只列<strong>符合这一档人群、当时没班、时间不撞</strong>的人，带岗位与合作性质标签；还缺几个名额就选几个，没有候选写明原因</td></tr>
          <tr><td><strong>确认安排</strong></td><td>逐个落占位进结果表（来源标人事定人）；定满后名额封口，别人进不来</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>边界：</strong>定人是结果层动作，不走缺口规则——缺口规则只管「排班确定之后因事件缺人」（6.4）；轮里名额没人拿满、临时班次还没定人，都在这里手动定。
      </div>
    </div>

    <div id="hs-63-me" class="section">
      <div class="section-header">
        <h3>6.3.5 个人查询：以人看班</h3>
      </div>
      <p class="doc-p">
        6.3.1 的三个视图都是<strong>空间维度</strong>——这家店、这条时段上有哪几个人。人事另一种问法是
        「<strong>这个人都有哪些班</strong>」「给TA加的班跟已有的撞不撞」：个人查询把方向反过来，
        以一个人为主语，按天铺出TA<strong>在当前空间已有的全部排班</strong>（已经过期的不用显示）。
      </p>
      <div class="func-entry">
        <strong>功能入口：</strong>排班策略 v5 → 主页签 <strong>个人查询</strong>（事实记录之后）→ 选一个人
      </div>

      <DocScreens
        :height="420"
        :images="[
          { src: meShot, label: '个人查询：蓝田已有的班按天时间轴；11-24 整条被请假占用（红字明细写明陈晚顶上）、11-26 只占 10:00–11:00 其余照常' },
          { src: meHoverShot, label: '悬浮 11-24：旁边出这天的明细卡——班次 / 事实 / 补位三行（请假橙斜纹、陈晚顶上绿带），与 6.4.1 悬浮卡同一张卡' }
        ]"
      />
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">区域</th><th style="width: 320px;">展示</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>人选择</strong></td><td>本空间人员下拉（工号 + 姓名 · 岗位 + 合作性质，如「E-107 蓝田 · 全职 · 推拿师」），选人后按天出TA已有的全部班（已过期的不用显示）</td><td>数据来自排班结果表（唯一记录口）按人过滤，不新造口径</td></tr>
          <tr><td><strong>按天时间轴</strong><br>（无法履约的明细）</td><td>每行一天：钟点轴上班次带（蓝 = 自己的班 / 顶上班，橙斜纹 = 被事件占用的段，换出的班标换给谁）；<strong>悬浮某一天</strong>，旁边出这天的明细卡——班次 / 事实 / 补位三行，与 6.4.1 悬浮卡同一张卡</td><td>整条占用的班在带子上直接标「时间被请假占用」；红字写当天无法履约的明细</td></tr>
          <tr><td><strong>明细行</strong></td><td>有占用的日子，行下红字写清楚：被哪条事实占用、谁来顶（整条 / 只顶某段、其余照常）</td><td>这是「无法履约」的明细表达——班还挂在名字上，但哪段不能去、谁在履约，一目了然</td></tr>
          <tr><td><strong>统计</strong></td><td>共 n 条班 · 合计 x 小时 · 无法履约 y 条</td><td>工时按班次带实际区间算（只顶一段按段算）；口径是全部已有的班，不是某一期</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>边界：</strong>个人查询只读——看与解释，不在这里改班；补人走 6.3.4 定人，变化走 6.4 事实。
        员工在自己手机上看到的「我的排班」（6.5.1）与这里是同一份数据的两个视角。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'
import DocScreens from '../../../docs/components/DocScreens.vue'
import axisShot from '../../../docs/assets/pages/v5-round.png'
import gridShot from '../../../docs/assets/pages/v5-grid.png'
import gapViewShot from '../../../docs/assets/pages/v5-gapview.png'
import tableShot from '../../../docs/assets/pages/v5-run-table.png'
import appointShot from '../../../docs/assets/pages/v5-appoint.png'
import meShot from '../../../docs/assets/pages/v5-me.png'
import meHoverShot from '../../../docs/assets/pages/v5-me-hover.png'

const tocItems = [
  { id: 'hs-63', label: '6.3 排班结果' },
  { id: 'hs-63-views', label: '6.3.1 三个视图' },
  { id: 'hs-63-rows', label: '6.3.2 唯一记录口' },
  { id: 'hs-63-apply', label: '6.3.3 申领登记' },
  { id: 'hs-63-appoint', label: '6.3.4 定人' },
  { id: 'hs-63-me', label: '6.3.5 个人查询' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事中心', to: '/docs/hr-schedule' },
  { label: '六、功能详细说明', to: '/docs/hr-schedule/features' },
  { label: '6.3 排班结果' }
]
</script>

<style scoped src="./doc-base.css"></style>
