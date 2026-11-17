<template>
  <DocShell
    :toc-items="tocItems"
    title="6.1 时段与清单"
    subtitle="一个空间的班怎么配出来：班次说时间与几个位，清单说谁能来、怎么来"
    version="v5.2"
    date="2026-11-17"
    :breadcrumbs="breadcrumbs"
  >
    <div id="hs-61" class="section">
      <div class="section-header">
        <h2>6.1 时段与清单</h2>
        <DocCopyButton section-id="hs-61" />
      </div>
      <p class="doc-p">
        这一章解决<strong>配置台怎么把一个空间的班配出来</strong>：先有一条班次（几点到几点、哪几天、要几个人），
        再在班次下面挂一份获取清单（每一档开放给谁、用什么方式、什么时候开放）。不解决怎么分给人（见 6.2），也不解决分完之后的变化（见 6.4）。
      </p>
      <div class="func-entry">
        <strong>功能入口：</strong>排班策略 v5（原型 <code>/schedule-v5</code>）→ 左侧选空间 → <strong>时段与清单</strong>；
        页签三块：周期时段 / 临时班次 / 申领规则；横向配置（缺口规则、算法服务）在顶部一级导航
      </div>

      <DocScreens
        :height="360"
        :images="[
          { src: slotCycleShot, label: '按周期：节奏条铺出每一天，每天一张卡列出当天班次与名额来源' },
          { src: slotListShot, label: '按班次：一条班次一张卡，清单档位的关键信息直接摆在卡面上' }
        ]"
      />
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">视图</th><th style="width: 300px;">是什么</th><th>什么时候用</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>按周期</strong></td><td>节奏铺出的每一天一列：当天会跑的班次（周期班次按星期几 + 临时班次按日期）、名额数；点班次照常进编辑抽屉</td><td>配置人员按「一天怎么干活」的视角配班</td></tr>
          <tr><td><strong>按班次</strong></td><td>一条班次一张卡，清单档位、工时制度直接摆在卡面上，带编辑 / 复制 / 删除</td><td>按班次对象逐条配置、批量看后果</td></tr>
        </tbody>
      </table>
      <DocScreens
        :height="300"
        :images="[
          { src: copyDayShot, label: '复制到…：源天覆盖式复制，勾选目标星期，先看「将加上 / 将移出」预览再覆盖应用' }
        ]"
      />
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">复制到…</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>用法</strong></td><td>先配好一天，再把这一天复制 / 覆盖到其他天——按周期视图每天列右上角「复制到…」</td></tr>
          <tr><td><strong>覆盖式</strong></td><td>目标天会变得和源天一样；班次按星期几定义，复制落在每周的同一天</td></tr>
          <tr><td><strong>加减预览</strong></td><td>确认前先列「将加上：早班 → 周二…」「将移出：…」，看清增减再「覆盖应用」</td></tr>
          <tr><td><strong>空天</strong></td><td>没有班次的天显示「这天没有班次」，同样可以作为源天或目标天参与复制</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>决议：一条班次只装一份名额需求。</strong>名额归属于岗位需求，不归属于门店的钟点——
        两个岗位同一钟点各要 1 人，就配两条班次（现状业务本来就是在两个排班模块里各配各的），不合并后用档位切份额。
      </div>
    </div>

    <div id="hs-61-slot" class="section">
      <div class="section-header">
        <h3>6.1.1 班次：时间与名额</h3>
      </div>
      <DocScreens
        :height="460"
        :images="[
          { src: slotEditShot, label: '班次编辑抽屉：上方时间与名额，下方清单逐档配置，底部动作区右侧可直接废弃这个班次' },
          { src: slotDiscardShot, label: '废弃确认：写明从下一轮起不再生成、本轮已生成的班次与申领一起清掉' }
        ]"
      />
      <table class="data-table">
        <thead>
          <tr><th style="width: 120px;">字段</th><th style="width: 240px;">取值</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>名称</strong></td><td>早班 / 晚班 / 通班等</td><td>沿用业务现行班次名，不造新名</td></tr>
          <tr><td><strong>起止时间</strong></td><td>时刻控件，10 分钟颗粒</td><td>只记这一班是多少时间；超时记加班、上限校验由获取端算</td></tr>
          <tr><td><strong>出勤日</strong></td><td>全周或指定几天</td><td>同一店同名的班可以只排部分天</td></tr>
          <tr><td><strong>名额来源</strong></td><td>人工给定 / 挂算法服务</td><td>算法服务在顶部「算法服务」页登记（见 6.1.3）</td></tr>
          <tr><td><strong>名额数</strong></td><td>整数</td><td>页面一律「已占 x / N」容量口径</td></tr>
          <tr><td><strong>单日名额</strong></td><td>按周期视图逐日加减</td><td>只改那一天的数，不动班次配置</td></tr>
          <tr><td><strong>缺口规则</strong></td><td>每条班次选一条</td><td>只管排班确定后因事件缺人怎么判（见 6.4.3）</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>生效时机：</strong>周期时段是模板——保存后从下一轮起生效，当前轮按已生成快照跑，不热改。
      </div>
    </div>

    <div id="hs-61-list" class="section">
      <div class="section-header">
        <h3>6.1.2 清单：谁能来、怎么来</h3>
      </div>
      <p class="doc-p">
        清单是班次下面的一串<strong>有序档位</strong>：排在前面的档先开放、先挑名额，后面的档接着；每一档四个字段：
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 110px;">字段</th><th style="width: 300px;">取值</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>谁</strong></td><td>范围（本店 / 附近 n km）· 合作性质（全职 / 非全）· 岗位</td><td>圈人条件；在职含试用、挡储备</td></tr>
          <tr><td><strong>方式</strong></td><td>直派轮转 / 先到先得 / 申领审核</td><td>三种系统枚举能力（见 6.2.2）</td></tr>
          <tr><td><strong>开放窗口</strong></td><td>锚点（发布 / 每周几 / 开班前 n 天）+ 时刻</td><td>页面落成具体日期时间</td></tr>
          <tr><td><strong>上限</strong></td><td>整数，≤ 该班名额数</td><td>这一档最多占几个，留出的给后面的档</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>档位的人群是优先级，不是份额划分。</strong>各档「谁」圈出来的是候选人群的<strong>合集</strong>——同一个人可以同时落在多档；
        档位顺序只决定优先级：前面的档先挑，占不完的名额后面的档接着挑。目的是<strong>让尽量多的人上到班</strong>。
      </div>
      <div class="note warn-note">
        <strong>可见 ≠ 可拿：</strong>档位开着只是「看得到」，能不能领由系统当场判定并给出原因（见 6.2.3）。
      </div>
      <div class="note">
        <strong>保存校验：</strong>① 窗口顺序——后面的档不能比前面的档先开放；② 档位上限相加不超过该班名额数；
        ③ 两个入口——同空间时间重叠且人群写重的两条班次，只查「先到先得 / 申领审核」类（直派不算入口，系统分人时自己挡时间冲突）。
      </div>
      <div class="note">
        <strong>删除 / 废弃一律二次确认：</strong>删除入口两处——「按班次」列表卡上的删除（可批量看后果）和编辑抽屉底部的「废弃这个班次」（改到一半直接废弃，不用回列表找卡）。后果一致：从下一轮起不再生成，这一轮已生成的班次与已登记的申领一起清掉，弹确认写明条数，确认才执行。临时班次（这一天的加场名额一起消失）、申领规则（删了恢复直接放行）、类别（被规则引用的删了规则改管全部时段）同理。
      </div>
    </div>

    <div id="hs-61-service" class="section">
      <div class="section-header">
        <h3>6.1.3 算法服务：两类，先登记后引用</h3>
      </div>
      <DocScreens
        :height="360"
        :images="[
          { src: algoShot, label: '算法服务页：名额来源类与缺口判定类分开列，登记时校验输入、算法、输出齐备' }
        ]"
      />
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">类</th><th style="width: 200px;">服务</th><th>算法</th></tr>
        </thead>
        <tbody>
          <tr><td rowspan="4"><strong>名额来源</strong><br>（算这一班要几个人）</td><td>按在岗人数</td><td>全员到岗基数 2 人，缺勤 1 人减 1</td></tr>
          <tr><td>按签约人数</td><td>签约非全 ÷ 2 向上取整</td></tr>
          <tr><td>按业务量（推拿师）</td><td>每 6 单 1 人，最少 1</td></tr>
          <tr><td>按业务量（客户经理）</td><td>每 8 单 1 人，最少 1</td></tr>
          <tr><td><strong>缺口判定</strong><br>（算现在还差几个人）</td><td>实时经营需求</td><td>岗位、合作形式、空间、时段、实时数据都是<strong>调用时传入</strong>的——各店各岗分开动态算，不拉通一个数</td></tr>
        </tbody>
      </table>
      <div class="note">
        名额来源类决定「这一班要几个人」由谁定；缺口判定类（G3 引用）决定「这段现在还差几个人」。
        服务必须先登记才能被班次引用。
      </div>
    </div>

    <div id="hs-61-tmp" class="section">
      <div class="section-header">
        <h3>6.1.4 临时班次：当天新增，立即生效</h3>
      </div>
      <DocScreens
        :height="300"
        :images="[
          { src: slotTmpShot, label: '临时班次列表：不进周期配置、只改那一天，删除有二次确认' },
          { src: slotTmpEditShot, label: '新增临时班次抽屉：日期 / 起止 / 名额 / 缺口规则，保存并开放立即生效' }
        ]"
      />
      <p class="doc-p">
        特殊情况下当天新增名额：不进周期配置、只改那一天，<strong>立即生效</strong>。周期时段与临时班次是两个入口，互不混用——
        周期改配置等下一轮，临时当天就要人。
      </p>
    </div>

    <div id="hs-61-rule" class="section">
      <div class="section-header">
        <h3>6.1.5 申领规则：挂人群的门槛</h3>
      </div>
      <DocScreens
        :height="320"
        :images="[
          { src: slotRuleShot, label: '申领规则（兴隆湖）：类别 A / B，规则挂人群不挂时段' },
          { src: ruleEditShot, label: '编辑规则抽屉：名称 / 管谁 / 管哪一类 / 计量（条数、分钟）+ 下限上限' },
          { src: catDlgShot, label: '管理类别：空间的字典，增 / 改名 / 删（被引用的类别删除要过确认）' }
        ]"
      />
      <table class="data-table">
        <thead>
          <tr><th style="width: 160px;">要点</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>挂谁</strong></td><td>规则挂「人群」，不挂时段；没配规则的人直接放行</td></tr>
          <tr><td><strong>计量</strong></td><td>条数 / 分钟两种，配下限与上限；按这一天合计，不跨天累加</td></tr>
          <tr><td><strong>类别</strong></td><td>类别是空间的字典（如 A 类 / B 类）；规则可管某一类或全部，<strong>类下任一条都算数</strong>（名额满了可换同类另一条）</td></tr>
          <tr><td><strong>工时制度</strong></td><td>每空间一份非全周 / 月工时上限，行内编辑；没配的空间非全不受额度限制</td></tr>
          <tr><td><strong>生效</strong></td><td>改了立即生效，正式生效下一轮</td></tr>
        </tbody>
      </table>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'
import DocScreens from '../../../docs/components/DocScreens.vue'
import slotCycleShot from '../../../docs/assets/pages/v5-slots.png'
import slotListShot from '../../../docs/assets/pages/v5-slot-list.png'
import copyDayShot from '../../../docs/assets/pages/v5-copy-day.png'
import slotEditShot from '../../../docs/assets/pages/v5-slot-edit.png'
import slotDiscardShot from '../../../docs/assets/pages/v5-slot-discard.png'
import algoShot from '../../../docs/assets/pages/v5-algo.png'
import slotTmpShot from '../../../docs/assets/pages/v5-slot-tmp.png'
import slotTmpEditShot from '../../../docs/assets/pages/v5-temp-edit.png'
import slotRuleShot from '../../../docs/assets/pages/v5-slot-rule.png'
import ruleEditShot from '../../../docs/assets/pages/v5-rule-edit.png'
import catDlgShot from '../../../docs/assets/pages/v5-cat-dlg.png'

const tocItems = [
  { id: 'hs-61', label: '6.1 时段与清单' },
  { id: 'hs-61-slot', label: '6.1.1 班次：时间与名额' },
  { id: 'hs-61-list', label: '6.1.2 清单：谁能来' },
  { id: 'hs-61-service', label: '6.1.3 算法服务' },
  { id: 'hs-61-tmp', label: '6.1.4 临时班次' },
  { id: 'hs-61-rule', label: '6.1.5 申领规则' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事中心', to: '/docs/hr-schedule' },
  { label: '六、功能详细说明', to: '/docs/hr-schedule/features' },
  { label: '6.1 时段与清单' }
]
</script>

<style scoped src="./doc-base.css"></style>
