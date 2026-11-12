<template>
  <DocShell
    :toc-items="tocItems"
    title="三、文档说明"
    subtitle="只收跨章节共用的名词与跨页面统一的字段口径；单页字段与交互在对应功能章节里解释"
    version="v1.0"
    date="2026-11-06"
    :breadcrumbs="breadcrumbs"
  >
    <div id="pt-terms" class="section">
      <div class="section-header">
        <h2>名词解释</h2>
        <DocCopyButton section-id="pt-terms" />
      </div>
      <p class="doc-p">只收<strong>跨章节共用</strong>的名词；单页字段在对应功能章节解释，这里不重复。</p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 190px;">名词</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>时段需求</strong></td><td>门店对<strong>某个星期、某个时段、需要几个人</strong>的重复性规则，不是一条可执行任务。分两类：<strong>周期时段</strong>（按星期重复，随定时发布生成任务，见 6.1、6.2）与<strong>临时时段</strong>（一次性加人，运营直接发布，见 6.3）。生命周期：建立 → 修改 → 作废</td></tr>
          <tr><td><strong>任务实例</strong></td><td>某个<strong>具体日期、门店、时段的一个名额</strong>。一个名额 = 一个任务实例；同一名额不能被两人同时承接（见 6.2）</td></tr>
          <tr><td><strong>班次任务</strong></td><td>客户经理岗的一个<strong>排班时段</strong>。业务口语里的「顶班」就是它，<strong>不是独立的任务类型</strong>；来源见六类任务来源：周期时段生成、临时时段，以及提前下线后补出来的<strong>剩余段</strong>（见 6.2、6.3）</td></tr>
          <tr><td><strong>分配策略</strong></td><td>挂在<strong>时段</strong>上的一条规则：一串档位决定每类人<strong>从哪个时刻起</strong>看得到这条班次。策略本身是<strong>模块级</strong>对象、不归属门店，在排班排假页头的「分配策略」页签维护；任务生成时按当时的策略做快照（见 6.1.3）</td></tr>
          <tr><td><strong>排班日</strong></td><td>这条班次<strong>所属的那一天</strong>，也是<strong>唯一能做接受操作的日期</strong>：00:00 起开放接单，时段开始即关闭。定时档的 <code>HH:mm</code> 也从这天算（见 6.1.4）</td></tr>
          <tr><td><strong>档位</strong></td><td>策略里的一步：<strong>人群 + 开放起点</strong>。人群三选一 —— 本店签约非全客户经理 / 本店非全推拿师 / 本店全职推拿师；开放起点是「发布即可见」或「排班日起 HH:mm」。所有档都开放后仍没人接，任务停在未承接，由临时时段补人</td></tr>
          <tr><td><strong>累计开放</strong></td><td>档位的开放方式：某档起点一到就<strong>长期开着</strong>，后面的档到点只<strong>加上去</strong>、不关前面的档 —— 配置多个角色时<strong>前后档的人都可见可接</strong>（最大范围），不是「换一档关一档」；档位只决定「从什么时候起能看」，名额仍先到先得（见 6.1.3）</td></tr>
          <tr><td><strong>手动发布</strong></td><td>定时发布之外的发布动作：可<strong>全部门店或多选门店</strong>，批次只能选<strong>未来两周内</strong>的周四批；该批已发布时按当前需求<strong>覆盖</strong> —— 已被承接的任务保持原安排，未被承接的名额重新生成（见 6.2.2）</td></tr>
          <tr><td><strong>任务事件</strong></td><td>任务为什么变成现在这个状态：生成、承接、取消、转移、重派、请假接班、到店、离店。<strong>只追加，不覆盖</strong>（见 6.4）</td></tr>
          <tr><td><strong>时段交叉</strong></td><td>同一天两条任务在<strong>时间上重叠</strong>。判断只看时间，不看是不是同一家店：在 A 店选了 15:00–17:00，B 店的 16:00–18:00 同样不可选；不重叠但<strong>跨店间隔不足 30 分钟</strong>也不行。校验对象是本人当天<strong>全部有效任务</strong>，取消或转出的不再占用（见 6.5.3）</td></tr>
          <tr><td><strong>名额</strong></td><td>某门店某时段需要的人数。需求上的名额决定生成几个任务实例；取消后该名额为接替人保留（见 6.1、6.3）</td></tr>
          <tr><td><strong>发布批次</strong></td><td>发布的一次运行单位：一个目标周期 × 一次执行，方式分<strong>定时发布 / 手动发布 / 手动发布（覆盖）</strong>。批次记录读取需求数、生成成功数、跳过数与失败数；覆盖就地更新那一期，不追加新行（见 6.2）</td></tr>
          <tr><td><strong>六类任务来源</strong></td><td>排班生成、取消后重派、请假接班生成、临时时段、已生成任务被转移、<strong>提前下线补人</strong>。来源创建后<strong>不因后续打卡或状态变化而改写</strong></td></tr>
          <tr><td><strong>提前下线补人</strong></td><td>承接人<strong>已到店</strong>、但离店早于计划结束，把「离店时刻 → 计划结束」这<strong>剩余一段</strong>另行派人的动作。扣掉通勤后可用工时够门槛才补，不够就留空档；原任务按实际离店截断。判定与门槛挂在时段策略的<strong>异常补人</strong>配置里（见 6.1.3、6.3.1）</td></tr>
          <tr><td><strong>当前承接人</strong></td><td>当前实际负责执行该任务的人，<strong>不等同于任务最初的承接人或创建人</strong>；取消、转移后原承接关系保留（见 6.3）</td></tr>
          <tr><td><strong>明细日志</strong></td><td>按发生时间记录任务全部事件的列表：发生时间、操作角色、操作人、事件说明、关联任务 ID（见 6.4）</td></tr>
          <tr><td><strong>实际在店时长</strong></td><td>实际到店与离店之间的时长，由移动端上报的打卡事件计算，Web 展示，供薪酬读取（见 6.4）</td></tr>
          <tr><td><strong>保底时薪</strong></td><td>某人员在某门店的<strong>保底时薪标准</strong>（元 / 小时）：通用值 → 城市覆盖 → 门店差异额叠加；实际<strong>保底金额 = 打卡有效工时 × 保底时薪</strong>，与当周收入合计比较后出保底补差（见 6.7.4）</td></tr>
          <tr><td><strong>配置人数</strong></td><td>门店<strong>配置的全职客户经理人数</strong>，来自门店主数据，不是页面上填的。单价按该人数分档：默认 1 / 2 / 3 人，<strong>可按需新增档</strong>（如 4 人店单独一档），未新增时<strong>超出最高档取最高档</strong>（见 6.7）</td></tr>
          <tr><td><strong>客次量档</strong></td><td>门店<strong>天均客次量</strong>的分档：0 ~ 30 次、30 ~ 40 次、40 次以上；区间左闭右开，末档不设上限，<strong>0 次是有效事实</strong>（见 6.7）</td></tr>
          <tr><td><strong>单价解析</strong></td><td>先按门店事实定位<strong>格子</strong>（人数档 × 客次量档），再对新客、评价、客次<strong>分别</strong>按「个人 × 门店 → 门店 → 城市 → 通用」取第一个有效且已配置的金额，返回金额与来源层级；<strong>继承只在同一格内发生</strong>，不跨档兜底（见 6.7）</td></tr>
          <tr><td><strong>结算主体</strong></td><td><strong>1 门店 = 1 结算主体</strong>。人员可服务多家门店，收入与保底<strong>按人员 × 门店分别归集</strong>，不跨店合并（见 6.7）</td></tr>
          <tr><td><strong>工资确认通知</strong></td><td>某结算周、某门店主体的工资单算完后推给本人的确认单：<strong>分主体、分门店主体各推各的</strong>；本人确认后生成发放工作单，<strong>未确认不进入发放</strong>（见 5.4.2、6.7.6）</td></tr>
          <tr><td><strong>发放策略</strong></td><td>按<strong>结算周所在日期段</strong>定计算日与发放日：1–7 日 → 9 日算 16 日发；8–14 日 → 16 日算 23 日发；15–21 日 → 22 日算次月 2 日发；22 日–月末 → 次月 3 日算次月 9 日发。各周<strong>互不等待</strong>（见 5.4.2）</td></tr>
          <tr><td><strong>预扣个税 / 代扣个税</strong></td><td>按周发放才有的分法：自然月<strong>前 3 周</strong>当月累计应纳税额还不成立，工资单上的扣缴项记<strong>预扣个税</strong>；<strong>第 4 周（22 日–月末，该月最后一个结算周）</strong>按当月累计做实际扣缴，记<strong>代扣个税</strong>。非全不缴社保、公积金（见 6.7.5）</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>用词约定：</strong>非全端一律用「<strong>打卡</strong>」，不用「考勤」。前者是到离店行为记录，后者是正式考勤管理（涉及劳动合同与工资核算），合规语义不同（见 6.6）。
      </div>
    </div>

    <div id="pt-fields" class="section">
      <div class="section-header">
        <h2>字段字典</h2>
        <DocCopyButton section-id="pt-fields" />
      </div>
      <p class="doc-p">只列<strong>跨页面统一口径</strong>的字段（命名 / 取值范围 / 格式）；其余字段见各功能章节。</p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 190px;">字段</th><th style="width: 220px;">位置</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>任务 ID</strong></td><td>任务实例 · 跟踪 · 日志</td><td>任务实例的<strong>唯一标识</strong>；取消、转移后的关联任务通过它回溯原任务</td></tr>
          <tr><td><strong>来源</strong></td><td>任务实例</td><td>取值只有六类（见名词解释）；<strong>创建后不因打卡或状态变化而改写</strong></td></tr>
          <tr><td><strong>快照</strong></td><td>任务实例</td><td>生成时冻结门店、日期、星期、时段、名额、备注与批次；后续改需求<strong>不回流到已生成任务</strong>（见 6.2）</td></tr>
          <tr><td><strong>任务状态</strong></td><td>移动端 · 跟踪</td><td>待到店 / 已到店 / 已离店 / 已取消 / 已转移 / 待补人；<strong>待接受</strong>只出现在转发请求上，自己选的与系统派的都直接「待到店」（见 6.5.5、6.3.2）</td></tr>
          <tr><td><strong>服务时段</strong></td><td>需求 · 任务 · 打卡门禁</td><td>开始早于结束；<strong>单段最长 4 小时</strong>；请假接班按同一上限拆段（见 6.3）</td></tr>
          <tr><td><strong>金额</strong></td><td>单价 · 保底</td><td>人民币元；非负数，最多两位小数；<strong>0 是有效覆盖值</strong>，不等于未配置（见 6.7）</td></tr>
          <tr><td><strong>有效工时</strong></td><td>打卡 · 保底核算</td><td>按「计取离店时刻 − 计取到店时刻」计，单位小时、<strong>保留 1 位小数</strong>（如 21.5）；到店时刻取「打卡到店 vs 计划开始」<strong>较晚者</strong>（提前打卡不计），离店时刻取「打卡离店 vs 计划结束」<strong>较早者</strong>（晚走按计划结束计、早退按实际打卡计）；按人员 × 门店 × 结算周累加，缺任一打卡的时段不计（见 6.7.4）</td></tr>
          <tr><td><strong>解析金额 / 本级配置</strong></td><td>单价配置页</td><td>页面同时显示<strong>最终取到的金额</strong>与<strong>来源层级</strong>（本级 / 继承门店 / 继承城市 / 继承通用）；不能把继承值误存成本级金额（见 6.7）</td></tr>
          <tr><td><strong>人数档 / 客次量档</strong></td><td>单价配置 · 结算</td><td>单价的配置坐标：人数档默认 1 / 2 / 3 人、可新增（未新增时超出最高档取最高档），客次量档 0~30 / 30~40 / 40 以上；两档都由门店事实决定，页面只读（见 6.7）</td></tr>
          <tr><td><strong>作废</strong></td><td>需求 · 单价 · 保底</td><td>不是物理删除：保留原值、状态与作废时间；同一归属再次配置另建一条有效记录，历史结算引用的旧版本不被改写</td></tr>
        </tbody>
      </table>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'pt-terms', label: '三、文档说明 · 名词解释' },
  { id: 'pt-fields', label: '三、文档说明 · 字段字典' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '非全客户经理', to: '/docs/parttime-account-manager' },
  { label: '三、文档说明' }
]
</script>

<style scoped src="./doc-base.css"></style>
