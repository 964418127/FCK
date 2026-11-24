<template>
  <DocShell
    :toc-items="tocItems"
    title="7.4 薪酬项清单：非全日制推拿师"
    subtitle="策略「9月及以后非全收入」现行薪酬项：显示名 / 内部名 / 形式 / 应答深度——无常乐豆"
    version="v2.3"
    date="2026-11-23"
    :breadcrumbs="breadcrumbs"
  >
    <div id="sa-74-src" class="section">
      <div class="section-header">
        <h2>清单口径</h2>
        <DocCopyButton section-id="sa-74-src" />
      </div>
      <p class="doc-p">
        非全日制推拿师（合作类型「非全日制」，按周发薪）当前在用策略为
        <strong>「9月及以后非全收入」</strong>（10 月、11 月均有算薪记录；9 月工资走「9月非全收入」，两者薪酬项相同）。
        数据来自薪酬计算结果明细，形式按工资单类型区分。
        「深度」列按 6.3 的四层分层逐项标注：<span class="lv lv1">L1 求证</span>
        <span class="lv lv2">L2 结论</span>——本岗位无常乐豆形式项（无 L3 行）、无社保公积金（L4 项不在底账，整类不在场）。
      </p>
      <div class="note">
        <strong>本清单最重要的结论：</strong>非全日制推拿师的薪酬项<strong>全部是现金（工资单类型均为「工资」），没有任何常乐豆项</strong>——
        这与围墙口径互为印证：非全不缴社保公积金、不参与常乐豆（6.2 岗位差异围墙：这两类整类不在数据面）。
        深度分布也简单：订单驱动的提成与激励归 L1（可走求证链 6.4），补贴与扣款类归 L2，无 L3。
      </div>
      <div class="note">
        <strong>分组按周切分：</strong>该策略的收入 / 扣缴分组按发薪周期拆成四组——
        「（1-7）日 /（8-14）/（15-21）/（22-月底）」，每组用的薪酬项相同，下表已合并去重。
      </div>
    </div>

    <div id="sa-74-income" class="section">
      <div class="section-header">
        <h2>收入项（薪酬项）</h2>
        <DocCopyButton section-id="sa-74-income" />
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 220px;">对外显示名称</th>
            <th>内部名称</th>
            <th style="width: 90px;">形式</th>
            <th style="width: 100px;">深度</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in incomeRows" :key="row.d + row.i">
            <td>{{ row.d }}<span v-if="row.warn" class="warn-mark" title="内部名带「全职推拿师 / 兼职」字样，跨用工类型复用">⚠</span></td>
            <td class="mono">{{ row.i }}</td>
            <td><span class="form-badge cash">现金</span></td>
            <td><span class="lv" :class="'lv' + row.lv">{{ row.lv === 1 ? 'L1 求证' : 'L2 结论' }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div id="sa-74-deduct" class="section">
      <div class="section-header">
        <h2>扣缴项</h2>
        <DocCopyButton section-id="sa-74-deduct" />
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 220px;">对外显示名称</th>
            <th>内部名称</th>
            <th style="width: 90px;">形式</th>
            <th style="width: 100px;">深度</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in deductRows" :key="row.d + row.i">
            <td>{{ row.d }}<span v-if="row.warn" class="warn-mark" title="内部名带「全职推拿师 / 兼职」字样，跨用工类型复用">⚠</span></td>
            <td class="mono">{{ row.i }}</td>
            <td><span class="form-badge cash">现金</span></td>
            <td><span class="lv lv2">L2 结论</span></td>
          </tr>
        </tbody>
      </table>
      <div class="note warn-note">
        <strong>⚠ 标记的行：跨用工类型复用的内部项。</strong>非全策略里大量内部名称带「全职推拿师」或「兼职」字样
        （如 全职推拿师打赏13、兼职推拿师面试激励47），且与全日制策略共用同一批薪酬项 ID——
        「全职推拿师薪酬申请金额13」在客户经理、全日制推拿师、非全日制推拿师三个策略里都在用，
        显示名各不相同（客户经理薪酬申请 / 系统津贴 / 系统补贴）。
      </div>
    </div>

    <div id="sa-74-rule" class="section">
      <div class="section-header">
        <h2>映射注意事项</h2>
        <DocCopyButton section-id="sa-74-rule" />
      </div>
      <p class="doc-p">
        同一内部名称存在<strong>两个薪酬项 ID</strong>（如「新店订单激励」「新店回头客激励」「一类门店新人订单补贴」
        「一类门店回头客激励」「一类门店冷门时段订单补贴」各有两个 ID），在不同周期分组里分别使用——
        数据面建映射时<strong>按薪酬项 ID 对应，不能按内部名称合并</strong>。
        另：旧策略「兼职推拿师收入发放 V55 / V57」8 月以后已无算薪记录，9 月起被
        「9月非全收入」→「9月及以后非全收入」替代，未列入本清单。
      </p>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const incomeRows = [
  { d: '提成收入', i: '非全日制基础提成36', f: '现金' , lv: 1 },
  { d: '回头客激励', i: '非全回头客激励99', f: '现金' , lv: 1 },
  { d: '新店订单激励', i: '新店订单激励', f: '现金' , lv: 1 },
  { d: '新店回头客激励', i: '新店回头客激励', f: '现金' , lv: 1 },
  { d: '一类门店新人订单补贴', i: '一类门店新人订单补贴', f: '现金' , lv: 1 },
  { d: '一类门店回头客激励', i: '一类门店回头客激励', f: '现金' , lv: 1 },
  { d: '一类门店时段激励', i: '一类门店冷门时段订单补贴', f: '现金' , lv: 1 },
  { d: '打赏', i: '全职推拿师打赏13', f: '现金', warn: true , lv: 1 },
  { d: '退单补贴', i: '全职推拿师退单补贴13', f: '现金', warn: true , lv: 2 },
  { d: '顶班激励', i: '非全日制顶班收入', f: '现金' , lv: 2 },
  { d: '内部介绍', i: '兼职推拿师内部介绍激励47', f: '现金', warn: true , lv: 2 },
  { d: '知识萃取', i: '兼职推拿师知识萃取激励47', f: '现金', warn: true , lv: 2 },
  { d: '面试激励', i: '兼职推拿师面试激励47', f: '现金', warn: true , lv: 2 },
  { d: '系统补贴', i: '全职推拿师薪酬申请金额13', f: '现金', warn: true , lv: 2 },
  { d: '手动补贴', i: '全职推拿师手动津贴13', f: '现金', warn: true , lv: 2 },
]

const deductRows = [
  { d: '服务时长不足扣提成', i: '服务时长不足扣提成13', f: '现金' , lv: 2 },
  { d: '投诉扣款', i: '投诉扣款29', f: '现金' , lv: 2 },
  { d: '房间卫生未打扫扣款', i: '兼职房间卫生未打扫扣款20', f: '现金', warn: true , lv: 2 },
  { d: '离店卫生未打扫扣款', i: '兼职离店卫生打扫扣款20', f: '现金', warn: true , lv: 2 },
  { d: '服务未接待扣款', i: '兼职服务接待扣款20', f: '现金', warn: true , lv: 2 },
  { d: '系统补扣', i: '全职推拿师薪酬申请扣款13', f: '现金', warn: true , lv: 2 },
  { d: '手动补扣', i: '全职推拿师手动扣款13', f: '现金', warn: true , lv: 2 },
]

const tocItems = [
  { id: 'sa-74-src', label: '清单口径' },
  { id: 'sa-74-income', label: '收入项' },
  { id: 'sa-74-deduct', label: '扣缴项' },
  { id: 'sa-74-rule', label: '映射注意事项' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '模块化薪酬', to: '/docs/salary-agent' },
  { label: '七、附录', to: '/docs/salary-agent/appendix' },
  { label: '7.4 薪酬项清单：非全日制推拿师' }
]
</script>

<style scoped src="./doc-base.css"></style>

<style scoped>
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
.form-badge {
  display: inline-block; padding: 1px 8px; border-radius: 999px;
  font-size: 11px; font-weight: 600; line-height: 18px; white-space: nowrap;
}
.form-badge.cash { color: hsl(220 60% 40%); background: hsl(220 60% 40% / 0.1); }
.warn-mark { color: hsl(38 90% 45%); margin-left: 4px; font-weight: 700; cursor: help; }
.lv {
  display: inline-block; padding: 1px 8px; border-radius: 999px;
  font-size: 11px; font-weight: 600; line-height: 18px; white-space: nowrap;
}
.lv1 { color: hsl(150 60% 28%); background: hsl(150 60% 40% / 0.12); }
.lv2 { color: hsl(220 60% 40%); background: hsl(220 60% 40% / 0.1); }
</style>
