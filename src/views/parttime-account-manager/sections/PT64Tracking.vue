<template>
  <DocShell
    :toc-items="tocItems"
    title="6.4 任务跟踪（Web）"
    subtitle="看最终承接人，也看这条任务怎么变成现在这样：来源、打卡、异常与完整日志"
    version="v1.0"
    date="2026-11-06"
    :breadcrumbs="breadcrumbs"
  >
    <div id="pt-64-overview" class="section">
      <div class="section-header">
        <h2>6.4 任务跟踪（Web）</h2>
        <DocCopyButton section-id="pt-64" />
      </div>
      <div class="func-entry"><strong>功能入口：</strong>Web → 非全客户经理 → <strong>任务跟踪</strong>（原型 <code>/parttime-task-tracking</code>）</div>

      <DocScreens
        :images="[
          { src: ptTrackingShot, label: '任务跟踪：顶部五项计数，每行给计划时段、实际到店与离店、在店时长、来源' },
          { src: ptTrackingLogShot, label: '明细日志：按事件追加 —— 任务生成 → 到店 10:03（迟到）→ 离店 12:01（正常）' },
          { src: ptTrackingAbnormalShot, label: '仅看异常打卡：11 条筛到 3 条，警示色标「迟到到店 / 提前离店」' }
        ]"
      />
      <div class="note">
        这一页回答三件事：现在是谁的、来没来、怎么变成现在这样。第三个只靠<strong>日志</strong>，状态字段只描述结果。
      </div>
    </div>

    <div id="pt-64-filter" class="section">
      <div class="section-header">
        <h3>6.4.1 查询条件</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">筛选项</th><th>要求</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>日期</strong></td><td>单日与日期范围</td></tr>
          <tr><td><strong>城市 / 门店</strong></td><td>城市筛门店</td></tr>
          <tr><td><strong>工号 / 姓名</strong></td><td>下拉搜索，按人员过滤</td></tr>
          <tr><td><strong>任务状态</strong></td><td>待到店、已到店、已离店、已取消、已转移、待补人</td></tr>
          <tr><td><strong>任务来源</strong></td><td>六类来源（见 6.3.1）</td></tr>
          <tr><td><strong>打卡异常</strong></td><td>未打卡、迟到到店、早退、时长不足</td></tr>
        </tbody>
      </table>
      <p class="doc-p">条件<strong>组合生效</strong>；「待补人」是状态不是来源，不混进来源筛选项。</p>
    </div>

    <div id="pt-64-list" class="section">
      <div class="section-header">
        <h3>6.4.2 列表字段</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 160px;">字段</th><th style="width: 300px;">展示内容</th><th>用途</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>任务信息</strong></td><td>任务 ID、日期、星期、计划时段、门店</td><td>定位到具体实例</td></tr>
          <tr><td><strong>当前承接人</strong></td><td>姓名、工号；无人显示<strong>待补人</strong></td><td>确认此刻谁负责</td></tr>
          <tr><td><strong>任务来源</strong></td><td>六类之一，创建后不变</td><td>区分生成路径</td></tr>
          <tr><td><strong>实际到店 / 离店</strong></td><td>移动端上报时间，记录到秒</td><td>算实际在店时长</td></tr>
          <tr><td><strong>实际在店时长</strong></td><td>离店 − 到店；无记录显示<strong>未记录</strong></td><td>供薪酬读取，本页不折金额</td></tr>
          <tr><td><strong>状态 / 异常</strong></td><td>当前状态与打卡异常标记</td><td>运营处理待办</td></tr>
          <tr><td><strong>明细日志</strong></td><td>弹窗按发生顺序展示事件</td><td>追溯生命周期</td></tr>
        </tbody>
      </table>
    </div>

    <div id="pt-64-log" class="section">
      <div class="section-header">
        <h3>6.4.3 明细日志</h3>
      </div>
      <p class="doc-p">至少记以下事件，<strong>只追加不覆盖</strong>；每条含发生时间、操作角色、操作人、事件说明、任务 ID。</p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 190px;">事件</th><th style="width: 220px;">写入方</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td>任务生成</td><td>系统调度</td><td>记录批次与快照</td></tr>
          <tr><td>承接</td><td>本人 / 系统派发</td><td>记录方式与时间</td></tr>
          <tr><td>取消</td><td>本人</td><td>同时生成待派需求</td></tr>
          <tr><td>转移</td><td>本人 / 系统</td><td>记录原与新承接人</td></tr>
          <tr><td>重派</td><td>系统调度</td><td>记录匹配结果与失败原因</td></tr>
          <tr><td>请假接班</td><td>系统调度</td><td>记录关联的全职缺岗</td></tr>
          <tr><td>到店 / 离店打卡</td><td>本人（移动端）</td><td>实际时间；离店必须在到店之后</td></tr>
        </tbody>
      </table>
      <div class="note warn-note">
        <strong>状态字段代替不了日志：</strong>「已取消」改成「已转移」再改回来，历史就没了。日志是唯一的过程证据。
      </div>
    </div>

    <div id="pt-64-exception" class="section">
      <div class="section-header">
        <h3>6.4.4 异常与实际时长</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">异常</th><th>判定</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>未打卡</strong></td><td>已过计划结束仍无到店记录</td></tr>
          <tr><td><strong>迟到到店</strong></td><td>实际到店晚于计划开始</td></tr>
          <tr><td><strong>早退</strong></td><td>实际离店早于计划结束</td></tr>
          <tr><td><strong>时长不足</strong></td><td>实际在店时长明显短于计划（阈值待运营确认，见附录）</td></tr>
        </tbody>
      </table>
      <ul class="doc-ul">
        <li>异常<strong>只标记、不处罚</strong>；是否违规由后台核查（6.6）。</li>
        <li>无打卡记录显示<strong>「未记录」而不是 0</strong>，0 会被读成「来了但零时长」。</li>
        <li>实际时长是薪酬输入之一，这里<strong>不折金额</strong>（6.7）。</li>
      </ul>
    </div>

    <div id="pt-64-bound" class="section">
      <div class="section-header">
        <h3>6.4.5 边界</h3>
      </div>
      <ul class="doc-ul">
        <li>可<strong>查看</strong>全部事件，<strong>不能覆盖</strong>历史与已完成打卡。</li>
        <li><strong>不提供</strong>改派入口：缺人走 6.3，取消与转移由本人在移动端发起。</li>
        <li><strong>不算收入</strong>：只给任务、人员、门店、实际时长，金额由 6.7 解析。</li>
      </ul>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'
import DocScreens from '../../../docs/components/DocScreens.vue'
import ptTrackingShot from '../../../docs/assets/pages/pt-tracking.png'
import ptTrackingLogShot from '../../../docs/assets/pages/pt-tracking-log.png'
import ptTrackingAbnormalShot from '../../../docs/assets/pages/pt-tracking-abnormal.png'

const tocItems = [
  { id: 'pt-64-overview', label: '6.4 任务跟踪' },
  { id: 'pt-64-filter', label: '6.4.1 查询条件' },
  { id: 'pt-64-list', label: '6.4.2 列表字段' },
  { id: 'pt-64-log', label: '6.4.3 明细日志' },
  { id: 'pt-64-exception', label: '6.4.4 异常与实际时长' },
  { id: 'pt-64-bound', label: '6.4.5 边界' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '非全客户经理', to: '/docs/parttime-account-manager' },
  { label: '六、功能详细说明', to: '/docs/parttime-account-manager/features' },
  { label: '6.4 任务跟踪（Web）' }
]
</script>

<style scoped src="./doc-base.css"></style>
