<template>
  <DocShell
    :toc-items="tocItems"
    title="6.1 时段与清单"
    subtitle="一个空间里的钟点怎么配出来：时段说时间与几个位，清单说谁能来、怎么来"
    version="v5.0"
    date="2026-11-15"
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
        班次卡上点「编辑」展开配置表单
      </div>

      <DocScreens
        :height="360"
        :images="[
          { src: slotEditShot, label: '班次编辑：上方班次信息（名称 / 起止 / 出勤日 / 名额来源），下方清单逐档配「谁 / 方式 / 开放窗口 / 上限」' },
          { src: slotListShot, label: '按班次视图：一条班次一张卡，卡面直接能看到清单每档的关键信息' }
        ]"
      />
      <div class="note">
        <strong>决议：一条班次只装一份名额需求。</strong>名额归属于岗位需求，不归属于门店的钟点——
        两个岗位同一钟点各要 1 人，就配两条班次（现状业务本来就是在两个排班模块里各配各的），不合并后用档位切份额。
      </div>
    </div>

    <div id="hs-61-view" class="section">
      <div class="section-header">
        <h3>6.1.1 两条查看视图</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">视图</th><th style="width: 280px;">看到什么</th><th>什么时候用</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>按班次</strong></td><td>一条班次一张卡：起止、出勤日、名额来源、清单各档；卡上「编辑 / 复制 / 删除」</td><td>改一条班次的配置</td></tr>
          <tr><td><strong>按周期</strong></td><td>按这一轮覆盖的每一天展开：每天列出当天开哪些班、各占几个名额</td><td>核对某一天到底排了多少班</td></tr>
        </tbody>
      </table>
      <div class="note">
        周期视图与矩阵的日期范围<strong>跟着该空间这一轮的覆盖区间走</strong>：门店按周铺 7 天，办公区按月铺整月——排到哪天就显示哪天。
      </div>
    </div>

    <div id="hs-61-slot" class="section">
      <div class="section-header">
        <h3>6.1.2 班次：时间与名额</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">字段</th><th style="width: 240px;">取值</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>名称</strong></td><td>早班 / 中班 / 晚班 / 通班</td><td>沿用业务现行班次名，不造新名</td></tr>
          <tr><td><strong>起止时间</strong></td><td>当天时刻，止晚于起</td><td>只记这一班是多少时间；超时记加班、上限校验在获取端背后算（见 6.1.5 不做）</td></tr>
          <tr><td><strong>出勤日</strong></td><td>全周或指定几天</td><td>同一店同名的班可以只排部分天（如周末晚班只排周六日）</td></tr>
          <tr><td><strong>名额来源</strong></td><td>人工给定 / 算法服务</td><td>算法服务在配置台顶部「算法服务」页登记，见 6.1.4</td></tr>
          <tr><td><strong>名额上限</strong></td><td>整数区间</td><td>算法服务算出的名额不会超出这个区间；人工给定的名额就在区间内取值</td></tr>
          <tr><td><strong>逐日名额</strong></td><td>单日加减</td><td>只改那一天的数，不动班次配置（临时加名额用临时班次，见 6.1.4）</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>名额显示口径：</strong>一律「已占 x / N」容量口径，N 是这一天该班的名额数，x 是已经被占掉的数。
      </div>
    </div>

    <div id="hs-61-list" class="section">
      <div class="section-header">
        <h3>6.1.3 清单：谁能来、怎么来</h3>
      </div>
      <p class="doc-p">
        清单是班次下面的一串<strong>有序档位</strong>：排在前面的人先有机会，轮到后面的人时前面的档已经走完。
        每一档四个字段：
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 110px;">字段</th><th style="width: 300px;">取值</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>谁</strong></td><td>范围（本店 / 附近 n km）· 合作性质（全职 / 非全）· 人员标签（在职 / 试用 / 储备）· 岗位</td><td>圈人条件；「在职」含试用、把储备挡在外面，要放储备进来才显式改</td></tr>
          <tr><td><strong>方式</strong></td><td>直派轮转 / 先到先得 / 申领审核</td><td>三种都是系统枚举的服务能力（见 6.2）</td></tr>
          <tr><td><strong>开放窗口</strong></td><td>锚点（发布 / 发布后推 n 天 / 发布后第几周几 / 开班前后 n 天）+ 时刻</td><td>配置用锚点+偏移，页面上<strong>落成具体日期时间</strong>（如「11-14 09:00 开（开班前 1 天）」）</td></tr>
          <tr><td><strong>上限</strong></td><td>整数，≤ 该班名额数</td><td>这一档最多占几个名额；留出来的给后面的档</td></tr>
        </tbody>
      </table>
      <div class="note warn-note">
        <strong>可见 ≠ 可拿：</strong>档位开着只是「看得到」，能不能领由系统当场判定并给出原因（时间冲突、不是你的档、窗口没到等，见 6.2.3）。
      </div>
    </div>

    <div id="hs-61-service" class="section">
      <div class="section-header">
        <h3>6.1.4 名额来源与临时班次</h3>
      </div>
      <h4 class="h4sub">算法服务（登记一项，班次引用）</h4>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">服务</th><th style="width: 220px;">输入</th><th>算法</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>按在岗人数</strong></td><td>人事在册状态</td><td>全员到岗基数 2 人，缺勤 1 人减 1</td></tr>
          <tr><td><strong>按签约人数</strong></td><td>合作类型与签约数</td><td>签约非全 ÷ 2 向上取整</td></tr>
          <tr><td><strong>按业务量</strong></td><td>业务系统预约量</td><td>每 6 单 1 人，最少 1</td></tr>
        </tbody>
      </table>
      <div class="note">
        名额来源决定「这一班要几个人」由谁定；人工给定就是配置里直接写数，算法服务就是登记好的能力按输入算数。
        服务必须先登记才能被班次引用（登记时校验输入、算法、输出齐备）。
      </div>
      <h4 class="h4sub">临时班次</h4>
      <p class="doc-p">
        特殊情况下当天新增名额：不进周期配置、只改那一天，<strong>立即生效</strong>。周期班次与临时班次在页面上是两个入口，互不混用。
      </p>
    </div>

    <div id="hs-61-check" class="section">
      <div class="section-header">
        <h3>6.1.5 校验与明确不做</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 220px;">校验</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>窗口顺序</strong></td><td>后面的档不能比前面的档先开放（都按这一轮第一天落成具体时刻比较）</td></tr>
          <tr><td><strong>档位上限</strong></td><td>每档上限相加不超过该班名额数</td></tr>
          <tr><td><strong>两个入口</strong></td><td>同空间时间重叠且人群写重的两条班次，只查「先到先得 / 申领审核」类——直派不算入口（系统分人时自己挡时间冲突）</td></tr>
          <tr><td><strong>生效时机</strong></td><td>配置改动保存后下一轮生效；当前轮按已生成的快照跑完，不热改</td></tr>
        </tbody>
      </table>
      <div class="note warn-note">
        <strong>明确不做：</strong>① 工时上限不在排班里配——排班只记班次起止，能否接与加班由获取端背后的工时规则算；
        ② 不做「一条班次按岗位拆名额」——拆成两条班次；③ 实例级覆盖（只改某周某天的配置）挂起未做，见附录。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'
import DocScreens from '../../../docs/components/DocScreens.vue'
import slotEditShot from '../../../docs/assets/pages/v5-slots.png'
import slotListShot from '../../../docs/assets/pages/v5-list.png'

const tocItems = [
  { id: 'hs-61', label: '6.1 时段与清单' },
  { id: 'hs-61-view', label: '6.1.1 查看视图' },
  { id: 'hs-61-slot', label: '6.1.2 班次：时间与名额' },
  { id: 'hs-61-list', label: '6.1.3 清单：谁能来' },
  { id: 'hs-61-service', label: '6.1.4 名额来源' },
  { id: 'hs-61-check', label: '6.1.5 校验与不做' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事中心', to: '/docs/hr-schedule' },
  { label: '六、功能详细说明', to: '/docs/hr-schedule/features' },
  { label: '6.1 时段与清单' }
]
</script>

<style scoped src="./doc-base.css"></style>
