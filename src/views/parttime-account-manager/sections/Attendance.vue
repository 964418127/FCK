<template>
  <DocShell
    :toc-items="tocItems"
    title="一、考勤打卡"
    subtitle='到店/离店<strong>顺序流程</strong>；<strong>入口弹窗</strong>选任务门店 + <strong>顶部门店切换</strong>随时切；<strong>提前 30 分钟门禁</strong>，界面不暴露具体时间数字'
    version="v0.5"
    date="2026-09-28"
    :breadcrumbs="breadcrumbs"
  >
    <!-- 一、入口与模式 -->
    <div id="entry" class="section">
      <h2>一、入口与模式</h2>
      <p style="line-height: 1.8; font-size: 13px;">
        移动端登录 → <strong>【客户经理】</strong> 分组下两个独立入口，<strong>不做 toggle 切换</strong>：
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 200px;">入口</th>
            <th>面向</th>
            <th>核心差异</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>客户经理考勤</strong></td>
            <td>全日制</td>
            <td>两块打卡区同时静态展示，无任务门店概念</td>
          </tr>
          <tr>
            <td><strong>非全客户经理打卡</strong></td>
            <td>非全日制</td>
            <td>顺序流程 + 任务门店切换 + 30 分钟门禁</td>
          </tr>
        </tbody>
      </table>
      <div class="callout" style="background: hsl(var(--primary) / 0.06); border-left: 1px solid hsl(var(--primary)); padding: 10px 12px; font-size: 13px; border-radius: 4px; margin-top: 12px;">
        <strong>📌 术语：</strong>非全端只用「<strong>打卡</strong>」，不用「考勤」。前者是到离店行为记录，后者是正式考勤管理（涉及劳动合同 / 工资核算），合规语义不同。
      </div>
    </div>

    <!-- 二、页面结构与交互流程 -->
    <div id="structure" class="section">
      <h2>二、页面结构与交互流程</h2>
      <p style="line-height: 1.8; font-size: 13px;">
        与全职能段同样布局（<strong>两块打卡区始终可见</strong>），区别在<strong>入口</strong>和<strong>状态切换机制</strong>：
      </p>
      <ol style="line-height: 1.9; font-size: 13px;">
        <li><strong>进入弹窗</strong>（任务数 ≥ 2 时挂载即弹）：底部弹出选任务卡片，列出当日所有任务，首任务带「推荐」徽章；用户必选才能进主页面</li>
        <li><strong>顶部门店切换</strong>：横向 tab 列表，当前选中态高亮；可随时切换，<strong>联动</strong>考勤地点、打卡状态分类、时间门禁</li>
        <li><strong>员工信息卡</strong>：工号/姓名、考勤日期、地点（随选中任务变）、任务时段</li>
        <li><strong>打卡卡</strong>：到店打卡块 + 离店打卡块；按顺序推进：未到店 → 已到店 → 当日已完成</li>
        <li><strong>打卡记录</strong>：月历视图（与全职能段同框架，本页不展开）</li>
      </ol>
      <div class="callout" style="background: hsl(var(--primary) / 0.06); border-left: 1px solid hsl(var(--primary)); padding: 10px 12px; font-size: 13px; border-radius: 4px; margin-top: 12px;">
        <strong>📌 与全职能段的布局差异</strong>：全日制两块打卡区<strong>同时可见</strong>且无任务门店概念；非全端<strong>同样两块都展示</strong>，但右上的打卡按钮会按当前阶段（未到店 / 已到店）切换激活态，未激活的灰底锁定。
      </div>
    </div>

    <!-- 三、入口弹窗与门店切换 -->
    <div id="entry-flow" class="section">
      <h2>三、入口弹窗与门店切换</h2>

      <h3>3.1 入口弹窗</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 200px;">场景</th>
            <th>行为</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>任务数 = 1</strong></td>
            <td><strong>直接进入主页面</strong>，自动选中该任务，不弹窗</td>
          </tr>
          <tr>
            <td><strong>任务数 ≥ 2</strong></td>
            <td>页面挂载时弹出底部弹窗，列出所有任务；按任务开始时间升序，<strong>首任务</strong>带「推荐」徽章；用户必须手动点选才能进入主页面</td>
          </tr>
        </tbody>
      </table>
      <div class="callout" style="background: hsl(var(--warning) / 0.08); border-left: 1px solid hsl(var(--warning)); padding: 10px 12px; font-size: 13px; border-radius: 4px; margin-top: 12px;">
        <strong>⚠️ 不默认选中的原因</strong>：避免系统替员工决定去哪一家顶班；多任务场景下，员工对门店位置 / 通勤成本有自主判断空间。例外：仅 1 任务时自动选中（无歧义）。
      </div>

      <h3 style="margin-top: 18px;">3.2 顶部门店切换</h3>
      <p style="line-height: 1.8; font-size: 13px;">
        进入主页面后，顶部横向 tab 始终可见，列出<strong>所有当日任务</strong>。点击切换门店会触发以下联动：
      </p>
      <ul style="line-height: 1.9; font-size: 13px;">
        <li>「员工信息·考勤地点」更新为新门店</li>
        <li>「任务时段」更新为新任务的开始-结束时间</li>
        <li>「到店打卡」按钮态重算：若新任务仍在 30 分钟门禁外，等待卡片重新显示</li>
        <li>「打卡状态」分类的参考任务时段切换</li>
      </ul>
    </div>

    <!-- 四、30 分钟提前打卡门禁 -->
    <div id="gate" class="section">
      <h2>四、30 分钟提前打卡门禁</h2>
      <p style="line-height: 1.8; font-size: 13px;">
        根据当前任务的「应当开始时间」判断打卡是否允许。切换门店后立刻重新判断；到时间点也会自动解锁。
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th>当前情况</th>
            <th>到店打卡操作区</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>已到任务应当开始的时间</td>
            <td>可以打卡（视为正常到店）</td>
          </tr>
          <tr>
            <td>任务开始前 30 分钟内</td>
            <td>可以打卡（提前打卡窗口）</td>
          </tr>
          <tr>
            <td>早于任务开始前 30 分钟</td>
            <td><strong>不能打卡</strong>，显示提示「暂不能打卡 / 请在任务开始前 30 分钟内再试」</td>
          </tr>
          <tr>
            <td>未选择任务</td>
            <td><strong>不能打卡</strong>，显示提示「请先选择今日任务」</td>
          </tr>
        </tbody>
      </table>

      <div class="callout" style="background: hsl(var(--primary) / 0.06); border-left: 1px solid hsl(var(--primary)); padding: 10px 12px; font-size: 13px; border-radius: 4px; margin-top: 12px;">
        <strong>📌 等待卡片的功能定位</strong>：不能打卡时，提示用户当前不可打卡、提示规则是什么，让用户能<strong>明确知道为什么不能操作</strong>，不再反复尝试。同时<strong>不暴露具体时间数字</strong>（如「还差 X 分钟」），避免给用户暗示而频繁刷页面查看。
      </div>

      <div class="callout" style="background: hsl(var(--warning) / 0.08); border-left: 1px solid hsl(var(--warning)); padding: 10px 12px; font-size: 13px; border-radius: 4px; margin-top: 12px;">
        <strong>⚠️ 任务时段需考虑跨店通勤</strong><br/>
        派单系统生成任务时段时，<strong>跨门店任务之间必须留出通勤缓冲</strong>（至少覆盖两家门店的预计通勤时长 + 现场交接时间）。非全端不展示通勤时间，但派单规则必须保证时段不冲突。示例：兴隆湖店 10:00-13:00 结束后，到麓山店 15:00 任务，中间 2 小时窗口 = 通勤 + 缓冲。
      </div>

      <p style="line-height: 1.8; font-size: 13px; margin-top: 8px;">
        <strong>离店打卡按钮</strong>目前没有时间门禁：用户完成到店打卡之后，离店按钮始终可点。后续若需「必须超过任务应当结束的时间才允许离店」之类的规则，单独补一个跟到店对称的门禁。
      </p>
    </div>

    <!-- 五、顺序流程状态机 -->
    <div id="state-machine" class="section">
      <h2>五、顺序流程状态机</h2>
      <p style="line-height: 1.8; font-size: 13px;">
        用户在一天中依次经历三个阶段：<strong>未到店 → 已到店 → 已离店 → 当日已完成</strong>。每一阶段对应不同的操作能力。
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 160px;">阶段</th>
            <th>到店打卡区</th>
            <th>离店打卡区</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>未到店</strong></td>
            <td>可点击打卡（或受 30 分钟门禁限制）</td>
            <td>锁定，不可点</td>
          </tr>
          <tr>
            <td><strong>已到店</strong>（点到店打卡之后）</td>
            <td>显示「已到店」状态</td>
            <td>可点击打卡</td>
          </tr>
          <tr>
            <td><strong>当日已完成</strong>（点离店打卡之后）</td>
            <td>显示「已到店」状态</td>
            <td>显示「已离店」状态</td>
          </tr>
        </tbody>
      </table>

      <h3>5.1 打卡状态分类</h3>
      <p style="line-height: 1.8; font-size: 13px;">
        系统根据实际打卡时间与任务时段的关系，自动归类：
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 160px;">维度</th>
            <th>判定</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td rowspan="2">到店</td>
            <td>实际到店时间 ≤ 任务应当开始时间</td>
            <td><strong>正常到店</strong></td>
          </tr>
          <tr>
            <td>实际到店时间 &gt; 任务应当开始时间</td>
            <td><strong style="color: hsl(var(--warning));">迟到到店</strong></td>
          </tr>
          <tr>
            <td rowspan="2">离店</td>
            <td>实际离店时间 ≥ 任务应当结束时间</td>
            <td><strong>正常离店</strong></td>
          </tr>
          <tr>
            <td>实际离店时间 &lt; 任务应当结束时间</td>
            <td><strong style="color: hsl(var(--warning));">提前离店</strong></td>
          </tr>
        </tbody>
      </table>
      <p style="line-height: 1.8; font-size: 13px; margin-top: 8px;">
        「迟到到店」「提前离店」在状态文字中以<strong>橙色</strong>警示；正常态用品牌色红。
      </p>
    </div>

    <!-- 六、显示约束 -->
    <div id="display" class="section">
      <h2>六、显示约束</h2>
      <div class="callout" style="background: hsl(var(--warning) / 0.08); border-left: 1px solid hsl(var(--warning)); padding: 10px 12px; font-size: 13px; border-radius: 4px;">
        <strong>⚠️ 非全端口不显示详细时间</strong><br/>
        按飞书 §3.5 文档：打卡记录仅后台留存，<strong>非全端口不显示详细时间</strong>。前端不直接出现小时:分钟:秒格式的数字（除任务时段本身的开始-结束时间文本外）：
        <ul style="margin: 6px 0 0 0; line-height: 1.8;">
          <li>到店/离店打卡按钮上<strong>不显示</strong>实时时间（仅按钮文案「到店打卡 / 离店打卡」）—— 与全日制下班按钮里显示当前时间的做法相反</li>
          <li>「打卡状态」文字<strong>不拼接</strong>具体时间（仅分类结果「正常到店 / 迟到到店 / 正常离店 / 提前离店」）</li>
          <li>等待卡片<strong>不显示</strong>倒计时数字（如「X 分钟后可打卡」）</li>
          <li>月历视图只有日期+状态点，无时间</li>
        </ul>
      </div>
    </div>

    <!-- 七、字段差异（与全职能段对照） -->
    <div id="diff" class="section">
      <h2>七、字段差异（与全职能段对照）</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 200px;">区块</th>
            <th>全日制</th>
            <th>非全日制</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>页头标题</td>
            <td>考勤打卡</td>
            <td>打卡</td>
          </tr>
          <tr>
            <td>打卡卡标题</td>
            <td>考勤打卡*</td>
            <td>打卡*</td>
          </tr>
          <tr>
            <td>员工信息·考勤班次</td>
            <td>通班</td>
            <td><strong>任务时段</strong>（当前选中任务的开始-结束时间）</td>
          </tr>
          <tr>
            <td>员工信息·考勤地点</td>
            <td>兴隆湖店（固定）</td>
            <td><strong>当前选中任务的门店</strong>（顶部可切换）</td>
          </tr>
          <tr>
            <td>顶部门店切换</td>
            <td>无</td>
            <td><strong>有</strong>（非全独有）</td>
          </tr>
          <tr>
            <td>入口任务选择弹窗</td>
            <td>无</td>
            <td><strong>有</strong>（任务 ≥ 2 时挂载即弹）</td>
          </tr>
          <tr>
            <td>固定打卡时间（10:00 / 22:00）</td>
            <td>显示</td>
            <td><strong>不显示</strong>（按任务时段来，无固定班次）</td>
          </tr>
          <tr>
            <td>打卡按钮上是否显示实时时间</td>
            <td>显示当前时间</td>
            <td><strong>不显示</strong>（仅按钮文案）</td>
          </tr>
          <tr>
            <td>打卡时间一栏（具体到秒）</td>
            <td>显示</td>
            <td><strong>不显示</strong>（详细时间仅后台）</td>
          </tr>
          <tr>
            <td>打卡类型 / 状态</td>
            <td>打卡类型：正常打卡</td>
            <td><strong>打卡状态</strong>：正常到店 / 迟到到店 / 正常离店 / 提前离店</td>
          </tr>
          <tr>
            <td>不能打卡时的提示卡片</td>
            <td>无</td>
            <td><strong>有</strong>（门禁未开时替换打卡操作区）</td>
          </tr>
          <tr>
            <td>更新打卡按钮</td>
            <td>显示</td>
            <td><strong>不显示</strong>（违规由后台核查）</td>
          </tr>
          <tr>
            <td>「未进入考勤范围」警示</td>
            <td>下班块下一处</td>
            <td>离店块下一处（非全独有位置）</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 八、相关模块 -->
    <div id="related" class="section">
      <h2>八、相关模块</h2>
      <ul style="line-height: 1.9; font-size: 13px;">
        <li>派单规则 / 任务生成 / 跨店通勤：见飞书《非全日制客户经理全链路业务需求文档 9.19》§3.4</li>
        <li>异常处理（违规提前离场 → 终止合作）：见飞书 §3.5</li>
        <li>薪酬核算（非全）：见飞书 §3.6.2</li>
        <li>本文档索引与背景：<router-link to="/docs/parttime-account-manager">非全客户经理</router-link></li>
      </ul>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'

const tocItems = [
  { id: 'entry', label: '入口与模式' },
  { id: 'structure', label: '页面结构与交互流程' },
  { id: 'entry-flow', label: '入口弹窗与门店切换' },
  { id: 'gate', label: '30 分钟提前打卡门禁' },
  { id: 'state-machine', label: '顺序流程状态机' },
  { id: 'display', label: '显示约束' },
  { id: 'diff', label: '字段差异' },
  { id: 'related', label: '相关模块' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '非全客户经理', to: '/docs/parttime-account-manager' },
  { label: '考勤打卡' }
]
</script>