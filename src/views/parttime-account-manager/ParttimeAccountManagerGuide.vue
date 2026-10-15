<template>
  <DocShell :toc-items="tocItems" title="非全客户经理任务体系" subtitle="非全客户经理从需求配置、任务生成、移动端承接到运营跟踪的业务宣讲与产品需求总览" version="v1.0" date="2026-09-29" :breadcrumbs="breadcrumbs">
    <div class="section chapter-nav">
      <h2>章节导航</h2>
      <p class="chapter-nav-tip">本文档说明业务全局口径；页面字段、交互和接口约束进入对应功能章节。</p>
      <div class="chapter-grid"><router-link v-for="ch in chapterNav" :key="ch.path" :to="ch.path" class="chapter-card"><div class="chapter-card-index">{{ ch.order }}</div><div class="chapter-card-body"><div class="chapter-card-title">{{ ch.title }}</div><div class="chapter-card-desc">{{ ch.subtitle }}</div></div><div class="chapter-card-arrow">→</div></router-link></div>
    </div>

    <div id="positioning" class="section">
      <h2>一、业务定位</h2>
      <div class="card"><p>非全客户经理是门店按时段补充服务能力的一类用工安排。它解决的是<strong>固定时段有人可用</strong>和<strong>临时缺口有人接替</strong>，不是把全职客户经理的班次直接搬到移动端。</p><div class="callout"><strong>系统边界：</strong>Web 端管理需求和运营结果；移动端只处理本人任务和打卡；定时发布、名额控制、取消重派和请假接班属于系统调度能力。</div></div>
      <table class="data-table"><thead><tr><th>业务问题</th><th>系统回答</th><th>最终结果</th></tr></thead><tbody><tr><td>门店每周哪些时间需要人</td><td>排班排假按门店、星期、时段和名额维护需求</td><td>可用于生成任务的有效需求</td></tr><tr><td>固定周期如何产生任务</td><td>每周四 10:00 由定时任务生成下周六至下下周五的 7 天任务</td><td>移动端可选任务</td></tr><tr><td>临时缺口如何补人</td><td>取消后重派、请假接班生成、临时手动发布</td><td>带来源和关联关系的补人任务</td></tr><tr><td>运营如何确认是否完成</td><td>任务跟踪按人员、门店、来源和打卡事件查看</td><td>当前承接人、实际时长和完整日志</td></tr></tbody></table>
    </div>

    <div id="version" class="section version-log">
      <h2>二、版本范围与核心调整</h2>
      <table class="data-table"><thead><tr><th style="width:90px">版本</th><th style="width:110px">日期</th><th style="width:90px">类别</th><th>调整内容</th></tr></thead><tbody>
        <tr><td rowspan="6"><strong>v1.0</strong></td><td rowspan="6">2026-09-29</td><td><span class="tag primary">新增</span></td><td><strong>任务全链路</strong>：统一描述需求配置、排班生成、任务承接、打卡和运营跟踪。</td></tr>
        <tr><td><span class="tag primary">新增</span></td><td><strong>五类任务来源</strong>：排班生成、取消后重派、请假接班生成、临时手动发布、已生成任务被转移。</td></tr>
        <tr><td><span class="tag primary">新增</span></td><td><strong>任务发布独立化</strong>：发布是后台定时任务，运营页面只查看批次、结果和失败重试。</td></tr>
        <tr><td><span class="tag warning">约束</span></td><td><strong>移动端用户口径</strong>：选择成功直接进入“待到店”，不展示“待接受”、违规统计、强制派单和人员筛选规则。</td></tr>
        <tr><td><span class="tag primary">新增</span></td><td><strong>生命周期追踪</strong>：取消、转移和重派不覆盖原任务，通过关联 ID 和明细日志完整回溯。</td></tr>
        <tr><td><span class="tag warning">约束</span></td><td><strong>配置变更边界</strong>：排班需求作废只影响尚未生成的未来周期，已生成任务保存生成时快照。</td></tr>
      </tbody></table>
      <div class="callout warning"><strong>范围边界：</strong>本版本不定义全职排班规则本身和人员签约流程。非全客户经理的月度保底比较规则见“功能模块与产品需求”的收入配置章节；税费、其他薪酬项目及工资发放仍遵循薪酬模块规则。</div>
    </div>

    <div id="full-flow" class="section">
      <h2>三、全局业务流程：三层对象、三条入口</h2>
      <div class="callout"><strong>先看全局：</strong>业务不是“配置后统一派单”。系统先接收三类需求入口，再生成任务实例；任务实例进入不同的承接方式；执行完成后才进入运营跟踪和收入读取。</div>
      <h3>3.1 三层业务对象</h3>
      <table class="data-table"><thead><tr><th>对象层</th><th>它回答什么问题</th><th>生命周期</th></tr></thead><tbody><tr><td><strong>任务需求</strong></td><td>门店什么时候需要几个人，或者出现了什么缺口</td><td>建立、修改、作废</td></tr><tr><td><strong>任务实例</strong></td><td>具体哪一天、哪家店、哪个时段的一个名额</td><td>生成、可选/派发、取消/转移、完成</td></tr><tr><td><strong>任务事件</strong></td><td>任务为什么变成现在的状态</td><td>生成、承接、取消、转移、重派、打卡，持续追加</td></tr></tbody></table>
      <h3>3.2 三条任务入口</h3>
      <div class="entry-grid"><div><b>周期需求入口</b><span>门店排班排假配置</span><small>每周四 10:00 生成未来 7 天</small></div><div><b>业务事件入口</b><span>全职请假 / 非全取消</span><small>发生事件后即时产生接班或重派需求</small></div><div><b>运营临时入口</b><span>线下临时补人</span><small>运营直接填写门店、时段和人数</small></div></div>
      <h3>3.3 从入口到结果：分支流程图</h3>
      <div class="business-flow" aria-label="非全客户经理任务全局业务流程">
        <div class="flow-node flow-root">产生一个需要非全客户经理承接的时段</div>
        <div class="flow-stem"></div>
        <div class="flow-branches">
          <div class="flow-branch"><div class="flow-node source">周期需求</div><div class="flow-caption">门店排班排假配置</div><div class="flow-arrow">↓</div><div class="flow-node">每周四 10:00 生成未来 7 天</div></div>
          <div class="flow-branch"><div class="flow-node source">请假缺岗</div><div class="flow-caption">全职客户经理请假</div><div class="flow-arrow">↓</div><div class="flow-node">拆分为最多 4 小时接班段</div></div>
          <div class="flow-branch"><div class="flow-node source">取消缺口</div><div class="flow-caption">非全已承接任务取消</div><div class="flow-arrow">↓</div><div class="flow-node">原任务保留，创建重派需求</div></div>
          <div class="flow-branch"><div class="flow-node source">临时需求</div><div class="flow-caption">运营线下直接补人</div><div class="flow-arrow">↓</div><div class="flow-node">填写门店、时段和人数</div></div>
        </div>
        <div class="flow-merge"></div>
        <div class="flow-node flow-task">生成任务实例：一个名额 = 一个任务<br><small>保存来源、计划时段、门店和关联任务 ID</small></div>
        <div class="flow-stem"></div>
        <div class="flow-branches two">
          <div class="flow-branch"><div class="flow-node route">周期任务</div><div class="flow-caption">进入可选任务</div><div class="flow-arrow">↓</div><div class="flow-node">客户经理自行选择<br><small>先到先得，成功后待到店</small></div></div>
          <div class="flow-branch"><div class="flow-node route">事件/临时任务</div><div class="flow-caption">进入派发流程</div><div class="flow-arrow">↓</div><div class="flow-node">系统匹配或运营重试<br><small>建立当前承接关系</small></div></div>
        </div>
        <div class="flow-merge"></div>
        <div class="flow-node flow-common">待到店</div><div class="flow-stem"></div>
        <div class="flow-branches three">
          <div class="flow-branch"><div class="flow-node action">正常履约</div><div class="flow-caption">到店 → 离店</div></div>
          <div class="flow-branch"><div class="flow-node action">取消</div><div class="flow-caption">原任务结束 → 取消后重派</div></div>
          <div class="flow-branch"><div class="flow-node action">转移</div><div class="flow-caption">原任务结束 → 新承接人接替</div></div>
        </div>
        <div class="flow-merge"></div>
        <div class="flow-node flow-end">Web 任务跟踪 → 实际时长 → 收入读取</div>
      </div>
      <p class="flow-note"><strong>读图规则：</strong>上半部分回答“任务为什么产生”，中间回答“谁以什么方式承接”，下半部分回答“承接后如何结束”。取消和转移会产生新的后续关系，但不会抹掉原任务。</p>
      <table class="data-table"><thead><tr><th>阶段</th><th>统一处理</th><th>必须保留的信息</th></tr></thead><tbody><tr><td>需求进入</td><td>识别是周期需求、业务事件还是人工临时需求</td><td>来源、触发人/事件、门店和时段</td></tr><tr><td>任务生成</td><td>将需求拆成一个个名额对应的任务实例</td><td>任务 ID、批次/关联 ID、计划时段快照</td></tr><tr><td>承接派发</td><td>周期任务进入可选列表；接班/补人任务进入匹配或通知</td><td>当前承接人、承接方式、承接时间</td></tr><tr><td>任务变更</td><td>取消释放缺口，转移变更承接关系，不能覆盖原任务</td><td>原任务、后续任务、事件原因</td></tr><tr><td>执行结算</td><td>打卡追加事件，跟踪页汇总，薪酬模块读取完成任务</td><td>实际到离店、实际时长和完整日志</td></tr></tbody></table>
    </div>

    <div id="sources" class="section">
      <h2>四、不同场景的业务分叉</h2>
      <table class="data-table"><thead><tr><th>场景</th><th>起点</th><th>任务怎么来</th><th>怎么承接</th><th>原任务是否存在</th></tr></thead><tbody><tr><td><strong>固定周期任务</strong></td><td>门店已配置重复时段</td><td>周四 10:00 按需求展开</td><td>移动端可选，先到先得</td><td>无，首次生成</td></tr><tr><td><strong>全职请假接班</strong></td><td>全职排班中出现请假缺岗</td><td>缺岗按最多 4 小时拆分，生成接班任务</td><td>系统派发/通知承接</td><td>有全职缺岗关联，但不是替换非全任务</td></tr><tr><td><strong>非全取消重派</strong></td><td>已承接的非全任务被取消</td><td>同一门店、日期、时段产生重派需求</td><td>其他人员承接</td><td>原非全任务保留为已取消</td></tr><tr><td><strong>运营临时发布</strong></td><td>线下确认需要补人</td><td>运营直接创建任务需求并发布</td><td>按发布规则匹配/通知</td><td>不要求存在被替换的人</td></tr><tr><td><strong>任务转移</strong></td><td>当前承接人无法履约</td><td>不重新定义需求，只变更承接关系</td><td>新人员接替</td><td>原任务保留为已转移</td></tr></tbody></table>
      <div class="decision-tree"><div class="tree-node root">门店出现一个待履约时段</div><div class="tree-children"><div class="tree-question">是固定重复需求吗？</div><div class="tree-leaf primary">是 → 排班生成 → 可选任务 → 客户经理选择</div><div class="tree-question">是全职请假造成的缺岗吗？</div><div class="tree-leaf primary">是 → 请假接班生成 → 拆分时段 → 系统派发</div><div class="tree-question">是已承接任务被取消吗？</div><div class="tree-leaf primary">是 → 取消后重派 → 原任务保留 → 其他人员承接</div><div class="tree-question">是运营线下确认的临时需求吗？</div><div class="tree-leaf primary">是 → 临时手动发布 → 任务派发</div><div class="tree-question">是当前承接人转交吗？</div><div class="tree-leaf primary">是 → 已生成任务被转移 → 原任务保留 → 新承接人执行</div></div></div>
    </div>

    <div id="rules" class="section">
      <h2>五、贯穿全流程的业务规则</h2>
      <table class="data-table"><thead><tr><th style="width:190px">规则主题</th><th>统一口径</th></tr></thead><tbody><tr><td><strong>定时发布周期</strong></td><td>每周四上午 10:00 生成下周六至下下周五，共 7 天；同一周期幂等执行。</td></tr><tr><td><strong>时段名额</strong></td><td>一个名额对应一个任务实例；同一名额不能被两人同时承接。</td></tr><tr><td><strong>任务历史</strong></td><td>取消、转移、重派都追加事件和关联任务，不覆盖原任务。</td></tr><tr><td><strong>配置生效</strong></td><td>作废或修改只影响尚未生成的未来任务；已生成任务使用快照。</td></tr><tr><td><strong>用户侧展示</strong></td><td>移动端只展示本人任务、任务状态和可执行动作，不展示内部调度原因。</td></tr><tr><td><strong>打卡顺序</strong></td><td>任务开始前 30 分钟进入到店窗口；到店成功后才能离店；实际时间在 Web 留存。</td></tr><tr><td><strong>请假接班</strong></td><td>全职缺岗长时段拆分为最多 4 小时一段，分别建立接班任务。</td></tr></tbody></table>
    </div>

    <div id="modules" class="section">
      <h2>六、功能模块边界</h2>
      <table class="data-table"><thead><tr><th>模块</th><th>核心职责</th><th>详细文档</th></tr></thead><tbody><tr><td>考勤打卡</td><td>移动端门店选择、到店/离店顺序、时间门禁和字段展示</td><td><router-link to="/docs/parttime-account-manager/attendance">进入章节</router-link></td></tr><tr><td>功能模块</td><td>Web 页面、移动端任务列表、权限、数据契约和验收项</td><td><router-link to="/docs/parttime-account-manager/functions">进入章节</router-link></td></tr></tbody></table>
    </div>

    <div id="reading" class="section"><div class="card reading-tip"><h2>七、阅读与交付说明</h2><p>本文档用于业务宣讲和范围确认；详细页面章节用于产品评审和开发交付。页面字段属于界面契约，来源和关联 ID 属于数据契约，验收标准用于测试和上线检查。</p><ul><li>业务人员重点阅读：业务定位、全流程、任务来源与全局规则。</li><li>产品和设计人员重点阅读：功能模块、移动端展示边界和页面操作。</li><li>开发和测试人员重点阅读：全链路数据契约、权限矩阵和验收标准。</li></ul></div></div>

    <div id="terms" class="section"><h2>八、名词解释</h2><table class="data-table"><thead><tr><th style="width:180px">术语</th><th>定义</th></tr></thead><tbody><tr><td><strong>任务需求</strong></td><td>门店对某个星期、时间段和人数的重复性需求规则。</td></tr><tr><td><strong>任务实例</strong></td><td>某个具体日期、门店和时段的可执行任务，包含来源和当前承接关系。</td></tr><tr><td><strong>排班生成</strong></td><td>定时任务根据有效需求展开固定周期任务的来源名称。</td></tr><tr><td><strong>取消后重派</strong></td><td>原承接人取消后，系统为同一需求建立新的接替派发关系。</td></tr><tr><td><strong>请假接班生成</strong></td><td>全职客户经理请假形成缺岗后，系统拆分并生成接班任务。</td></tr><tr><td><strong>明细日志</strong></td><td>按发生时间记录任务生成、承接、取消、转移、重派和打卡的事件列表。</td></tr><tr><td><strong>当前承接人</strong></td><td>当前实际负责执行该任务的人；不等同于任务最初的创建人。</td></tr></tbody></table></div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../docs/components/DocShell.vue'
const chapterNav = [
  { order: '一', title: '考勤打卡', subtitle: '门店切换、顺序打卡、30 分钟门禁和字段边界', path: '/docs/parttime-account-manager/attendance' },
      { order: '二', title: '功能模块', subtitle: 'Web 与移动端页面、权限、字段、规则和验收标准', path: '/docs/parttime-account-manager/functions' }
]
const tocItems = [
      { id: 'positioning', label: '业务定位' }, { id: 'version', label: '版本范围' }, { id: 'full-flow', label: '全流程总览' },
  { id: 'sources', label: '任务来源' }, { id: 'rules', label: '全局规则' }, { id: 'modules', label: '功能模块' },
  { id: 'reading', label: '交付说明' }, { id: 'terms', label: '名词解释' }
]
const breadcrumbs = [{ label: '文档中心', to: '/docs' }, { label: '非全客户经理' }]
</script>

<style scoped>
.section p, .section li { font-size: 13px; line-height: 1.8; }
.card { padding: 18px 20px; border: 1px solid #ebeef5; border-radius: 6px; background: #fff; }.card h2 { margin-top: 0; }
.entry-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 14px 0 18px; }.entry-grid div { padding: 14px; border: 1px solid #ebeef5; border-radius: 6px; background: #fff; }.entry-grid b, .entry-grid span, .entry-grid small { display: block; }.entry-grid b { color: hsl(var(--primary)); }.entry-grid span { margin-top: 6px; font-size: 13px; }.entry-grid small { margin-top: 8px; color: hsl(var(--muted-foreground)); font-size: 12px; line-height: 1.6; }
.business-flow { margin: 14px 0 8px; padding: 20px 16px; border: 1px solid #f0d6df; border-radius: 6px; background: linear-gradient(180deg, #fffafa 0%, #fff 100%); text-align: center; }.flow-node { display: inline-flex; align-items: center; justify-content: center; min-height: 42px; padding: 8px 12px; border: 1px solid #dfe5ee; border-radius: 5px; background: #fff; font-size: 13px; line-height: 1.45; }.flow-node small { color: #7d8796; font-size: 11px; }.flow-root, .flow-task, .flow-common, .flow-end { border-color: #b4003b; color: #8f0031; font-weight: 600; background: #fff5f7; }.flow-stem { width: 2px; height: 18px; margin: 0 auto; background: #c7ced8; }.flow-branches { position: relative; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; padding-top: 18px; }.flow-branches::before { content: ''; position: absolute; top: 0; left: 12.5%; right: 12.5%; height: 1px; background: #c7ced8; }.flow-branch { position: relative; display: flex; flex-direction: column; align-items: center; gap: 6px; }.flow-branch::before { content: ''; position: absolute; top: -18px; width: 1px; height: 18px; background: #c7ced8; }.flow-caption { color: #7d8796; font-size: 11px; line-height: 1.4; }.flow-arrow { color: #b4003b; font-size: 18px; line-height: 1; }.flow-node.source { border-color: #d7a1b3; color: #9d174c; font-weight: 600; }.flow-node.route { border-color: #bfd1e6; color: #315b86; font-weight: 600; background: #f6faff; }.flow-node.action { border-color: #e2d2aa; color: #866114; background: #fffcf2; }.flow-branches.two { grid-template-columns: repeat(2, minmax(180px, 300px)); justify-content: center; }.flow-branches.three { grid-template-columns: repeat(3, minmax(150px, 240px)); justify-content: center; }.flow-merge { width: 50%; height: 18px; margin: 0 auto; border-right: 1px solid #c7ced8; border-bottom: 1px solid #c7ced8; border-left: 1px solid #c7ced8; border-radius: 0 0 5px 5px; }.flow-note { margin-top: 10px; color: #667085; font-size: 12px !important; }
.chapter-nav h2 { font-size: 20px; font-weight: 600; margin: 0 0 8px; padding-bottom: 8px; border-bottom: 2px solid hsl(var(--primary)); }.chapter-nav-tip { color: hsl(var(--muted-foreground)); font-size: 13px; margin: 0 0 16px; }.chapter-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }.chapter-card { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border: 1px solid hsl(var(--border)); border-radius: 8px; background: hsl(var(--background)); text-decoration: none; color: inherit; transition: all .15s ease; }.chapter-card:hover { border-color: hsl(var(--primary)); background: hsl(var(--primary) / .04); transform: translateY(-1px); box-shadow: 0 4px 12px hsl(var(--primary) / .1); }.chapter-card-index { width: 36px; height: 36px; border-radius: 8px; background: hsl(var(--primary) / .1); color: hsl(var(--primary)); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; flex-shrink: 0; }.chapter-card-body { flex: 1; min-width: 0; }.chapter-card-title { font-weight: 600; font-size: 14px; margin-bottom: 2px; }.chapter-card-desc { font-size: 12px; color: hsl(var(--muted-foreground)); line-height: 1.4; }.chapter-card-arrow { color: hsl(var(--muted-foreground)); font-size: 18px; flex-shrink: 0; }.callout { padding: 10px 12px; margin-top: 12px; border-left: 1px solid hsl(var(--primary)); background: hsl(var(--primary) / .06); font-size: 13px; line-height: 1.7; }.callout.warning { border-left-color: hsl(var(--warning)); background: hsl(var(--warning) / .08); }.tag { font-weight: 600; }.tag.primary { color: hsl(var(--primary)); }.tag.warning { color: hsl(var(--warning)); }.main-flow { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 16px; margin: 12px 0 18px; background: hsl(var(--primary) / .05); border: 1px solid hsl(var(--primary) / .16); border-radius: 5px; font-size: 12px; }.main-flow span { padding: 9px 10px; background: #fff; border: 1px solid #ebeef5; border-radius: 4px; }.main-flow b { color: hsl(var(--primary)); }.decision-tree { padding: 18px; border: 1px solid #ebeef5; border-radius: 6px; background: #fff; }.tree-node, .tree-question, .tree-leaf, .tree-leaf-sub { font-size: 13px; line-height: 1.7; }.tree-node { display: inline-block; padding: 9px 14px; border-radius: 4px; background: hsl(var(--primary) / .1); color: hsl(var(--primary)); font-weight: 600; }.tree-children { margin: 10px 0 0 20px; padding-left: 16px; border-left: 2px solid hsl(var(--border)); }.tree-question { margin-top: 10px; font-weight: 600; }.tree-leaf { margin-top: 6px; padding: 5px 8px; }.tree-leaf.primary { color: hsl(var(--primary)); font-weight: 600; }.tree-leaf-sub { margin-left: 16px; color: hsl(var(--muted-foreground)); }.reading-tip { background: hsl(var(--primary) / .06); border-color: hsl(var(--primary) / .25); }
@media (max-width: 700px) { .main-flow { display: grid; grid-template-columns: 1fr; text-align: center; }.main-flow b { transform: rotate(90deg); }.tree-children { margin-left: 6px; } }
@media (max-width: 700px) { .entry-grid { grid-template-columns: 1fr; }.business-flow { padding: 14px 8px; }.flow-branches, .flow-branches.two, .flow-branches.three { grid-template-columns: 1fr; gap: 10px; }.flow-branches::before, .flow-branch::before, .flow-merge { display: none; }.flow-branches .flow-branch:not(:last-child)::after { content: '↓'; color: #b4003b; font-size: 18px; margin-top: 2px; }.flow-branches .flow-arrow { display: none; } }
</style>
