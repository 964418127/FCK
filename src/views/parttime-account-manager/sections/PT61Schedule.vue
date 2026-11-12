<template>
  <DocShell
    :toc-items="tocItems"
    title="6.1 排班排假（配置）"
    subtitle="一条需求 = 哪家店、每周哪天、什么时段、要几个人；时段上挂一条分配策略回答「先给谁」。不指定承接人，也不发布"
    version="v1.0"
    date="2026-11-06"
    :breadcrumbs="breadcrumbs"
  >
    <div id="pt-61-overview" class="section">
      <div class="section-header">
        <h2>6.1 排班排假（配置）</h2>
        <DocCopyButton section-id="pt-61" />
      </div>
      <div class="func-entry"><strong>功能入口：</strong>Web → 非全客户经理 → <strong>排班排假</strong>（原型 <code>/parttime-task-management</code>）</div>

      <DocScreens
        :height="360"
        :images="[
          { src: ptScheduleShot, label: '排班排假：左侧门店，右侧按星期维护时段；每行给起止、名额、策略、生效期，行操作只有编辑 / 作废' },
          { src: ptScheduleDialogShot, label: '新增 / 编辑：门店只读，按星期切标签配时段，每个时段各自选策略，可复制到其他星期' }
        ]"
      />
      <div class="note">
        它是全链路<strong>唯一需求来源</strong>：这里没需求，6.2 什么都生成不出来。需求改了<strong>只影响未生成的周期</strong>，已生成任务按快照不回收。
      </div>
    </div>

    <div id="pt-61-view" class="section">
      <div class="section-header">
        <h3>6.1.1 页面结构</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">区域</th><th style="width: 250px;">展示与操作</th><th>约束</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>筛选区</strong></td><td>城市、门店、有效状态、关键字</td><td>先筛城市再筛门店；一个门店只归属一个城市</td></tr>
          <tr><td><strong>主体</strong></td><td>按星期维护每日时段，同店可多条</td><td>每天独立配，<strong>一条记录不能隐含多天</strong></td></tr>
          <tr><td><strong>操作区</strong></td><td>页头两页签：<strong>时段需求</strong>（周期 / 临时）、<strong>分配策略</strong>；含新增、编辑、作废、导入、导出</td><td>删除统一叫<strong>作废</strong>；策略是页面级页签，不挂门店下（见 6.1.3）</td></tr>
        </tbody>
      </table>
    </div>

    <div id="pt-61-fields" class="section">
      <div class="section-header">
        <h3>6.1.2 字段与校验</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">字段</th><th style="width: 230px;">业务定义</th><th>校验 / 生效规则</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>城市、门店</strong></td><td>需求归属的经营单位</td><td>来自主数据；<strong>门店只归属一个城市</strong></td></tr>
          <tr><td><strong>星期</strong></td><td>周一至周日的重复需求</td><td>必填单选；多天建多条</td></tr>
          <tr><td><strong>开始 / 结束时间</strong></td><td>该时段的计划服务时间</td><td>结束晚于开始；<strong>单段最长 4 小时</strong></td></tr>
          <tr><td><strong>名额</strong></td><td>该时段需要的人数</td><td>正整数；<strong>一个名额 = 一个任务实例</strong></td></tr>
          <tr><td><strong>分配策略</strong></td><td>这个时段每类人从什么时候起看得到</td><td>时段级属性；默认内置「本店非全客户经理」（6.1.3）</td></tr>
          <tr><td><strong>生效 / 结束日期</strong></td><td>参与生成的起止日</td><td>只影响<strong>未生成</strong>的周期；结束日期选填，不填长期有效</td></tr>
          <tr><td><strong>备注</strong></td><td>运营说明</td><td>不参与资格、发布筛选，也<strong>不作为类型依据</strong></td></tr>
          <tr><td><strong>状态</strong></td><td>有效 / 已作废</td><td>系统写作废时间；保留可查，不参与生成</td></tr>
        </tbody>
      </table>
      <div class="note warn-note">
        <strong>重叠校验：</strong>同一门店在重叠生效期内不允许配重叠时段，否则名额被重复生成。保存时拦，不留到生成环节兜底。
      </div>
    </div>

    <div id="pt-61-policy" class="section">
      <div class="section-header">
        <h3>6.1.3 分配策略</h3>
      </div>
      <p class="doc-p">
        策略是<strong>模块级</strong>规则：<strong>一条策略 = 一串档位（人群 + 开放起点）</strong>。时段引用策略，任务在 6.2 生成时做快照。
        它回答「每类人从什么时候起能看」，不回答「轮到谁」。
      </p>
      <div class="func-entry"><strong>功能入口：</strong>Web → 非全客户经理 → <strong>排班排假</strong> → 页头 <strong>分配策略</strong>（原型 <code>/parttime-task-management?tab=policies</code>）</div>

      <DocScreens
        :height="377"
        :images="[
          { src: ptPolicyShot, label: '策略库：一策略一卡，写明档位链与被引用次数；内置可编辑不可删，被引用删不掉' }
        ]"
      />
      <DocScreens
        label=""
        :height="475"
        :images="[
          { src: ptPolicyUsageShot, label: '应用时段：所有门店、所有星期的时段摊成一张表，按策略或门店筛' }
        ]"
      />

      <h4 class="h4sub">一条档位写什么</h4>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">项目</th><th>规则</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>人群</strong></td><td>三选一：<strong>本店签约非全客户经理</strong> / <strong>本店非全推拿师</strong> / <strong>本店全职推拿师</strong>；同一人群只排一档</td></tr>
          <tr><td><strong>开放起点</strong></td><td>「发布即可见」或「排班日起定时 HH:mm」；<strong>发布即可见只能放第一档</strong></td></tr>
          <tr><td><strong>顺序</strong></td><td>定时档必须一档比一档晚，否则保存即拦</td></tr>
          <tr><td><strong>累计开放</strong></td><td>起点一到<strong>长期开着</strong>，后面的档只加不撤 —— 前后档的人都可见可接，档位不轮流独占</td></tr>
          <tr><td><strong>末档之后</strong></td><td>仍没人接就停在<strong>未承接</strong>，走 6.3 补人；系统<strong>不按业绩排名自动派</strong></td></tr>
        </tbody>
      </table>
      <p class="doc-p">
        跨店非全客户经理、全职客户经理都<strong>不在候选里</strong>：前者要先另签协议，后者班次在原有排班系统排（见 6.8.1）。
      </p>

      <h4 class="h4sub">时刻怎么算</h4>
      <table class="data-table">
        <thead>
          <tr><th style="width: 160px;">起点</th><th>从哪一刻算</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>发布即可见</strong></td><td>该批的<strong>发布时刻</strong>（定时 = 周四 06:00；手动 = 点确认那一刻，见 6.2.2）</td></tr>
          <tr><td><strong>排班日起定时</strong></td><td><strong>排班日当天</strong>的 HH:mm，不从零点计时</td></tr>
          <tr><td><strong>换档</strong></td><td>下一档起点一到<strong>加上这一档</strong>，是加人不是换人</td></tr>
          <tr><td><strong>关闭</strong></td><td>时段一开始所有档一起关；已承接的不受影响</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>例：</strong>发布起非全客户经理可见 → 排班日 09:00 非全推拿师也可见 → 11:00 全职推拿师也可见。11:00 后三档<strong>同时</strong>都看得到、都能接；名额先到先得。
      </div>
      <div class="note warn-note">
        <strong>定时档必须早于时段开始</strong>，否则那一档永远接不到。保存策略与保存时段各校一次。
      </div>

      <h4 class="h4sub">可见不等于可接</h4>
      <table class="data-table">
        <thead>
          <tr><th style="width: 110px;">层</th><th style="width: 260px;">由什么决定</th><th>表现</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>可见</strong></td><td>策略此刻已开放到第几档</td><td>不在已开放档的人<strong>看不到这条任务</strong>，也不解释</td></tr>
          <tr><td><strong>可接</strong></td><td>排班日（6.1.4）+ 名额 + 6.5.3 六项校验</td><td>看得到但接不了：卡片给<strong>具体原因</strong>，按钮置灰</td></tr>
        </tbody>
      </table>

      <h4 class="h4sub">改动边界</h4>
      <table class="data-table">
        <thead>
          <tr><th style="width: 200px;">动作</th><th style="width: 240px;">影响</th><th>不影响</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>改档位 / 换时段挂的策略</strong></td><td>只影响尚未生成的周期</td><td>已生成任务按快照走</td></tr>
          <tr><td><strong>删策略</strong></td><td>仅限没被时段引用的</td><td>被引用直接拒绝，先改时段</td></tr>
        </tbody>
      </table>

      <h4 id="pt-61-exception" class="h4sub">异常补人：提前下线剩下的那段</h4>
      <p class="doc-p">
        承接人离店早于计划结束，剩下那段就是空档。补不补、补给谁按<strong>时段挂的策略</strong>走，补出来的时段是 6.3.1 第 5 类来源。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 140px;">判定</th><th style="width: 300px;">怎么算</th><th>结果</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>剩余时长</strong></td><td>计划结束 − 实际离店</td><td>≤ 0 不产生补人</td></tr>
          <tr><td><strong>可用工时</strong></td><td>剩余时长 − 通勤 <strong>30 分钟</strong>（固定不可配）</td><td>通勤不算工时</td></tr>
          <tr><td><strong>够不够补</strong></td><td>可用工时 ≥ 门槛（默认 2 小时）</td><td>够 → 建一条「提前下线补人」需求；不够 → <strong>不补</strong>，空档留记录</td></tr>
          <tr><td><strong>怎么结算</strong></td><td>原任务按离店截断</td><td>原承接人算到离店，接替人算剩余段</td></tr>
        </tbody>
      </table>
      <div class="note">
        门槛在「分配策略 → 编辑 → 异常补人」改，通勤<strong>固定 30 分钟</strong>；合起来要求剩余<strong>≥ 2 小时 30 分</strong>才派。
      </div>
      <DocScreens
        :height="367"
        :images="[
          { src: ptPolicyExceptionShot, label: '策略编辑底部：门槛可配、通勤固定 30 分钟；兜底人群决定派不出去时落到谁' }
        ]"
      />
      <table class="data-table">
        <thead>
          <tr><th style="width: 210px;">顺位</th><th style="width: 300px;">从哪些人里挑</th><th>挑不到</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>① 本店签约非全客户经理</strong></td><td>排除原承接人、时段不冲突、单日累计与门店数都过（6.5.3）；多人取<strong>最早签约</strong></td><td>自动往下走</td></tr>
          <tr><td><strong>② 兜底人群</strong>（策略里选）</td><td>默认<strong>本店全职推拿师</strong>，多人取<strong>最晚签约</strong></td><td>可改非全推拿师，或选「不补人」</td></tr>
          <tr><td><strong>③ 都挑不到</strong></td><td>—</td><td>停在<strong>待派发</strong>，运营在 6.3 点「重试派发」</td></tr>
        </tbody>
      </table>
      <div class="note warn-note">
        <strong>补人不是改任务：</strong>原任务保留「已离店」与真实离店时间，下面另挂新需求与新的承接关系，来源写<strong>提前下线补人</strong>。
      </div>
    </div>

    <div id="pt-61-claimday" class="section">
      <div class="section-header">
        <h3>6.1.4 排班日与接单时机</h3>
      </div>
      <p class="doc-p">一条班次有四个时间，文档里一律用<strong>排班日</strong>，不用「服务日」。</p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 140px;">叫法</th><th style="width: 240px;">指的是</th><th>作用</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>发布日</strong></td><td>周四 06:00</td><td>任务这一刻成立，第一档开始看得到</td></tr>
          <tr><td><strong>生效周期</strong></td><td>下周六至下下周五</td><td>这一批覆盖的 7 天</td></tr>
          <tr><td><strong>排班日</strong></td><td>这条班次所属的那一天</td><td>定时档 HH:mm 从这天算；<strong>接单也只在这天开放</strong></td></tr>
          <tr><td><strong>时段开始</strong></td><td>排班日当天 HH:mm</td><td>接单关闭、任务消失；打卡与工时从这一刻算</td></tr>
        </tbody>
      </table>

      <h4 class="h4sub">接单窗口：排班日 00:00 到时段开始</h4>
      <table class="data-table">
        <thead>
          <tr><th style="width: 220px;">时刻</th><th>员工能做什么</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>发布后 → 排班日前一天</strong></td><td><strong>只能看不能接</strong>：按钮置灰写「排班日当天可接」</td></tr>
          <tr><td><strong>排班日 00:00 起</strong></td><td>开放接单，名额先到先得</td></tr>
          <tr><td><strong>时段开始</strong></td><td>接单关闭，任务消失；再补要走 6.3</td></tr>
        </tbody>
      </table>
      <div class="note warn-note">
        <strong>两道闸都要过：</strong>档位管「此刻看不看得到」，排班日管「此刻能不能接」。档位没到的<strong>整条不出现</strong>；排班日没到的照常出现，只说明当天可接。
      </div>
    </div>

    <div id="pt-61-lifecycle" class="section">
      <div class="section-header">
        <h3>6.1.5 修改与作废的边界</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 190px;">动作</th><th style="width: 240px;">影响</th><th>不影响</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>新增需求 / 改时段 / 改名额</strong></td><td>从生效日期起参与下一期生成</td><td>当期已发布、已承接、已完成的任务</td></tr>
          <tr><td><strong>删掉某一天的时段</strong></td><td>该天不再参与生成</td><td>已生成任务不回收</td></tr>
          <tr><td><strong>作废整条需求</strong></td><td>停止参与新的定时发布</td><td>已生成或已承接的<strong>不回收、不改写</strong></td></tr>
        </tbody>
      </table>
      <p class="doc-p">承接人是按已看到的任务做安排的，后台改配置不能把任务抽走。要减人走 6.3 的取消 / 转移，并留事件。</p>
    </div>

    <div id="pt-61-import" class="section">
      <div class="section-header">
        <h3>6.1.6 导入与导出</h3>
      </div>
      <p class="doc-p">批量维护走 Excel：<strong>先下模版、填完再上传</strong>。上传先校验，有错<strong>一行都不落库</strong>。</p>
      <DocScreens
        :height="570"
        :images="[
          { src: ptScheduleImportShot, label: '导入：左下载模版、右上传；逐行报错在同一弹窗，有错不能提交' }
        ]"
      />

      <h4 class="h4sub">表结构</h4>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">列 / 行</th><th>约定</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>一行</strong></td><td>一个门店<strong>某一天的某个时段</strong>；不按工作日 / 周末分表</td></tr>
          <tr><td><strong>合并成一条需求</strong></td><td>门店编码 + 生效 + 结束日期相同的多行合并为一条，规则写在模版「填写说明」页</td></tr>
          <tr><td><strong>备注</strong></td><td>属整条需求，同组不一致直接报错</td></tr>
          <tr><td><strong>分配策略</strong></td><td>时段级，留在行上不合并；填<strong>策略名称</strong>，留空按内置策略</td></tr>
          <tr><td><strong>空行</strong></td><td>起止时间与名额都空的行忽略，模版占位行可留着</td></tr>
        </tbody>
      </table>

      <h4 class="h4sub">校验</h4>
      <table class="data-table">
        <thead>
          <tr><th style="width: 140px;">层次</th><th>要求</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>逐行</strong></td><td>门店存在、星期可识别、时间可读、名额正整数</td></tr>
          <tr><td><strong>时段</strong></td><td>与页面同一套：营业时间内、单段 ≤ 4 小时、结束晚于开始</td></tr>
          <tr><td><strong>需求</strong></td><td>结束不早于生效；与已有需求在重叠生效期内不重叠；策略名不存在或定时档晚于时段开始也整批不落库</td></tr>
          <tr><td><strong>报错</strong></td><td>提示到 <strong>Excel 行号 + 原因</strong>，最多列 6 条；有错不能提交</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>导入是新增不是覆盖</strong>，不改已有需求与已发布任务。停用需求走列表里的<strong>作废</strong>，一是留引用、二是留痕。
        <strong>导出</strong>导所选门店的完整配置，列与模版一致，改完能直接导回。
      </div>
    </div>

    <div id="pt-61-not" class="section">
      <div class="section-header">
        <h3>6.1.7 明确不做</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 260px;">不做</th><th>原因</th></tr>
        </thead>
        <tbody>
          <tr><td>长期 / 短期 / 临时类型标签</td><td>会被当成优先选取依据，本版不引入</td></tr>
          <tr><td>A / B 类排班与最低每日工时</td><td>推拿师口径，非全按名额承接套不上</td></tr>
          <tr><td>在需求上指定承接人</td><td>点名就变成派单，6.5 的选择不成立</td></tr>
          <tr><td>按业绩排名自动派</td><td>非全没有业绩口径；末档到期由 6.3 补人</td></tr>
          <tr><td>跨店非全客户经理进候选</td><td>要先另签协议，本期不做</td></tr>
          <tr><td>在需求上直接发布任务</td><td>发布是 6.2 的定时或手动动作；临时加时段走 6.3</td></tr>
        </tbody>
      </table>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'
import DocScreens from '../../../docs/components/DocScreens.vue'
import ptScheduleShot from '../../../docs/assets/pages/pt-schedule.png'
import ptScheduleDialogShot from '../../../docs/assets/pages/pt-schedule-dialog.png'
import ptScheduleImportShot from '../../../docs/assets/pages/pt-schedule-import.png'
import ptPolicyShot from '../../../docs/assets/pages/pt-policy.png'
import ptPolicyUsageShot from '../../../docs/assets/pages/pt-policy-usage.png'
import ptPolicyExceptionShot from '../../../docs/assets/pages/pt-policy-exception.png'

const tocItems = [
  { id: 'pt-61-overview', label: '6.1 排班排假' },
  { id: 'pt-61-view', label: '6.1.1 页面结构' },
  { id: 'pt-61-fields', label: '6.1.2 字段与校验' },
  { id: 'pt-61-policy', label: '6.1.3 分配策略' },
  { id: 'pt-61-claimday', label: '6.1.4 排班日与接单' },
  { id: 'pt-61-lifecycle', label: '6.1.5 修改与作废' },
  { id: 'pt-61-import', label: '6.1.6 导入与导出' },
  { id: 'pt-61-not', label: '6.1.7 明确不做' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '非全客户经理', to: '/docs/parttime-account-manager' },
  { label: '六、功能详细说明', to: '/docs/parttime-account-manager/features' },
  { label: '6.1 排班排假（配置）' }
]
</script>

<style scoped src="./doc-base.css"></style>
