<template>
  <DocShell
    :toc-items="tocItems"
    title="7.3 薪酬项清单：全职推拿师"
    subtitle="三个模板合并的现行薪酬项：显示名 / 内部名 / 模板 / 形式 / 应答深度"
    version="v2.3"
    date="2026-11-24"
    :breadcrumbs="breadcrumbs"
  >
    <div id="sa-73-src" class="section">
      <div class="section-header">
        <h2>清单口径</h2>
        <DocCopyButton section-id="sa-73-src" />
      </div>
      <p class="doc-p">
        数据来自薪酬计算结果明细，取 <strong>2026 年 10 月（最近完整算薪月）以来正在生效的策略</strong>。
        全职推拿师三个模板并存：<strong>「全日制超产值获豆 V8」（获豆 / 收入主模板）、「全日制基础提成20 V6」、「全日制基础提成24 V7」</strong>，
        同一员工按生效模板出数——<strong>员工不感知模板</strong>，Agent 对员工只呈现显示名称与金额（6.2）。
        形式按工资单类型区分：<strong>现金 = 工资单</strong>、<strong>常乐豆 = 常乐豆单</strong>。
        「深度」列按 6.3 的四层分层逐项标注：<span class="lv lv1">L1 求证</span>
        <span class="lv lv2">L2 结论</span> <span class="lv lv3">L3 账户级</span> <span class="lv lv4">L4 不在场</span>。
      </p>
      <div class="note">
        <strong>两个容易踩坑的点：</strong>
        ① 内部名称带「获豆」不代表发的是豆——「三级合伙人获豆47」在推拿师三个模板里同样走<strong>现金工资单</strong>；
        ② 同一内部项跨策略形式不同——「客户经理内部介绍激励413」在客户经理收入 V69 里是<strong>现金</strong>（显示「内部介绍激励」），
        在推拿师三个模板里是<strong>常乐豆</strong>（显示「介绍客户经理获豆」）。
        现金 / 豆的归属是「策略 × 薪酬项」级别的属性，做映射必须带上策略维度。
      </div>
    </div>

    <div id="sa-73-income" class="section">
      <div class="section-header">
        <h2>收入项（薪酬项）</h2>
        <DocCopyButton section-id="sa-73-income" />
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 220px;">对外显示名称</th>
            <th>内部名称</th>
            <th style="width: 130px;">使用模板</th>
            <th style="width: 90px;">形式</th>
            <th style="width: 100px;">深度</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in incomeRows" :key="row.d + row.i">
            <td>{{ row.d }}<span v-if="row.warn" class="warn-mark" title="内部名带「获豆」但走现金工资单">⚠</span></td>
            <td class="mono">{{ row.i }}</td>
            <td>{{ row.t }}</td>
            <td><span class="form-badge" :class="row.f === '现金' ? 'cash' : 'bean'">{{ row.f }}</span></td>
            <td><span class="lv" :class="'lv' + row.lv">{{ row.lv === 1 ? 'L1 求证' : row.lv === 2 ? 'L2 结论' : 'L3 账户级' }}</span></td>
          </tr>
        </tbody>
      </table>
      <div class="note warn-note">
        <strong>⚠ 标记的两行：</strong>
        「三级合伙人」内部名带「获豆47」但走现金；「介绍客户经理获豆」内部名是「客户经理内部介绍激励413」——
        在推拿师模板里是常乐豆、在客户经理策略里是现金（7.2），同一内部项两种形式并存。
      </div>
    </div>

    <div id="sa-73-deduct" class="section">
      <div class="section-header">
        <h2>扣缴项</h2>
        <DocCopyButton section-id="sa-73-deduct" />
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 220px;">对外显示名称</th>
            <th>内部名称</th>
            <th style="width: 130px;">使用模板</th>
            <th style="width: 90px;">形式</th>
            <th style="width: 100px;">深度</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in deductRows" :key="row.d + row.i">
            <td>{{ row.d }}</td>
            <td class="mono">{{ row.i }}</td>
            <td>{{ row.t }}</td>
            <td><span class="form-badge" :class="row.f === '现金' ? 'cash' : 'bean'">{{ row.f }}</span></td>
            <td><span class="lv" :class="'lv' + row.lv">{{ row.lv === 1 ? 'L1 求证' : row.lv === 2 ? 'L2 结论' : 'L3 账户级' }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div id="sa-73-rule" class="section">
      <div class="section-header">
        <h2>整体规律</h2>
        <DocCopyButton section-id="sa-73-rule" />
      </div>
      <p class="doc-p">
        推拿师的「全月计件 / 加班 / 补贴 / 扣缴」等<strong>钱相关分组走现金</strong>，
        「获豆 / 扣豆」分组走常乐豆。对应到 Agent：推拿师的常乐豆组成就是收入侧的获豆分类
        （保底 / 超产值 / 营销 / 回头客 / 住房 / 接待 / 服务圈 / 顶班 / 培训类等）加扣缴侧的
        回头客清零与三类卫生扣豆——<strong>全部常乐豆形式项归 L3，只并入账户级汇总</strong>（6.3）；
        现金侧订单驱动的计件 / 加班 / 打赏归 L1，可走求证链（6.4）。
      </p>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const T3 = '三个模板共用'
const incomeRows = [
  { d: '全月计件收入', i: '全职上半月计件', t: '超产值获豆V8', f: '现金' , lv: 1 },
  { d: '全月计件收入', i: '全职上半月计件提成为20', t: '基础提成20 V6', f: '现金' , lv: 1 },
  { d: '全月计件收入', i: '全职上半月计件提成为24', t: '基础提成24 V7', f: '现金' , lv: 1 },
  { d: '工作日加班收入', i: '全职推拿师加班工作日13', t: '超产值获豆V8', f: '现金' , lv: 1 },
  { d: '工作日加班收入', i: '全日制推拿师加班提成20', t: '基础提成20 V6', f: '现金' , lv: 1 },
  { d: '工作日加班收入', i: '全日制推拿师加班提成24', t: '基础提成24 V7', f: '现金' , lv: 1 },
  { d: '节假日收入', i: '推拿师节假日加班13', t: '超产值获豆V8', f: '现金' , lv: 1 },
  { d: '节假日加班收入', i: '全日制节假日加班提成20', t: '基础提成20 V6', f: '现金' , lv: 1 },
  { d: '节假日加班收入', i: '全日制节假日加班提成24', t: '基础提成24 V7', f: '现金' , lv: 1 },
  { d: '修脚', i: '推拿师加班修脚13', t: '超产值获豆V8', f: '现金' , lv: 1 },
  { d: '打赏', i: '全职推拿师打赏13', t: T3, f: '现金' , lv: 1 },
  { d: '退单补贴', i: '全职推拿师退单补贴13', t: T3, f: '现金' , lv: 2 },
  { d: '手动津贴', i: '全职推拿师手动津贴13', t: T3, f: '现金' , lv: 2 },
  { d: '系统津贴', i: '全职推拿师薪酬申请金额13', t: T3, f: '现金' , lv: 2 },
  { d: '三级合伙人', i: '三级合伙人获豆47', t: T3, f: '现金', warn: true , lv: 2 },
  { d: '保底获豆', i: '全职推拿师保底获豆（两个ID）、2级计算保底获豆', t: T3, f: '常乐豆' , lv: 3 },
  { d: '超产值获豆', i: '超产值获豆', t: T3, f: '常乐豆' , lv: 3 },
  { d: '营销获豆', i: '全职推拿师营销获豆13', t: T3, f: '常乐豆' , lv: 3 },
  { d: '回头客获豆', i: '推拿师回头客获豆13', t: T3, f: '常乐豆' , lv: 3 },
  { d: '住房获豆', i: '全职推拿师住房获豆13', t: T3, f: '常乐豆' , lv: 3 },
  { d: '接待获豆', i: '推拿师接待获豆513', t: T3, f: '常乐豆' , lv: 3 },
  { d: '服务圈获豆', i: '推拿师服务圈获豆513', t: T3, f: '常乐豆' , lv: 3 },
  { d: '卫生间打扫获豆', i: '推拿师卫生间卫生打扫获豆513', t: T3, f: '常乐豆' , lv: 3 },
  { d: '顶班获豆', i: '顶班获豆30', t: T3, f: '常乐豆' , lv: 3 },
  { d: '岗前培训获豆', i: '岗前培训获豆30', t: T3, f: '常乐豆' , lv: 3 },
  { d: '内部介绍出勤获豆', i: '内部介绍出勤获豆30', t: T3, f: '常乐豆' , lv: 3 },
  { d: '知识萃取获豆', i: '知识萃取获豆30', t: T3, f: '常乐豆' , lv: 3 },
  { d: '面试通过获豆（获豆V8 显示「面试通过」）', i: '面试通过获豆30', t: T3, f: '常乐豆' , lv: 3 },
  { d: '介绍客户经理获豆', i: '客户经理内部介绍激励413', t: T3, f: '常乐豆', warn: true , lv: 3 },
  { d: '计件预留获豆', i: '全日制计件预留获豆为10', t: '仅基础提成20 V6', f: '常乐豆' , lv: 3 },
  { d: '加班预留获豆', i: '全日制推拿师加班预留获豆为10', t: '仅基础提成20 V6', f: '常乐豆' , lv: 3 },
  { d: '节假日预扣获豆', i: '全日制节假日加班获豆为10', t: '仅基础提成20 V6', f: '常乐豆' , lv: 3 },
  { d: '计件获豆', i: '全日制计件预留获豆为6', t: '仅基础提成24 V7', f: '常乐豆' , lv: 3 },
  { d: '工作日获豆', i: '全日制推拿师加班预留获豆为6', t: '仅基础提成24 V7', f: '常乐豆' , lv: 3 },
  { d: '节假日获豆', i: '全日制加班获豆为6', t: '仅基础提成24 V7', f: '常乐豆' , lv: 3 },
  { d: '2026年津贴', i: '（无内部薪酬项，人事经理手动调整补发）', t: '基础提成20/24', f: '常乐豆' , lv: 3 },
]

const deductRows = [
  { d: '系统补扣', i: '全职推拿师薪酬申请扣款13', t: T3, f: '现金' , lv: 2 },
  { d: '手动补扣', i: '全职推拿师手动扣款13', t: T3, f: '现金' , lv: 2 },
  { d: '投诉扣款', i: '投诉扣款29', t: T3, f: '现金' , lv: 2 },
  { d: '服务时长不足扣提成（获豆V8 显示「服务时长不足扣款」）', i: '服务时长不足扣提成13', t: T3, f: '现金' , lv: 2 },
  { d: '回头客不达标清零（提成20）/ 回头率不达标清零（提成24、获豆V8）', i: '回头客获豆清零13', t: T3, f: '常乐豆' , lv: 3 },
  { d: '房间卫生未打扫扣豆', i: '房间卫生未打扫扣豆13', t: T3, f: '常乐豆' , lv: 3 },
  { d: '离店卫生未打扫扣豆', i: '离店卫生未打扫扣豆13', t: T3, f: '常乐豆' , lv: 3 },
  { d: '服务接待扣豆', i: '服务接待卫生扣豆13', t: T3, f: '常乐豆' , lv: 3 },
]

const tocItems = [
  { id: 'sa-73-src', label: '清单口径' },
  { id: 'sa-73-income', label: '收入项' },
  { id: 'sa-73-deduct', label: '扣缴项' },
  { id: 'sa-73-rule', label: '整体规律' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '模块化薪酬', to: '/docs/salary-agent' },
  { label: '七、附录', to: '/docs/salary-agent/appendix' },
  { label: '7.3 薪酬项清单：全职推拿师' }
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
.form-badge.bean { color: hsl(160 65% 30%); background: hsl(160 65% 30% / 0.12); }
.warn-mark { color: hsl(38 90% 45%); margin-left: 4px; font-weight: 700; cursor: help; }
.lv {
  display: inline-block; padding: 1px 8px; border-radius: 999px;
  font-size: 11px; font-weight: 600; line-height: 18px; white-space: nowrap;
}
.lv1 { color: hsl(150 60% 28%); background: hsl(150 60% 40% / 0.12); }
.lv2 { color: hsl(220 60% 40%); background: hsl(220 60% 40% / 0.1); }
.lv3 { color: hsl(38 90% 35%); background: hsl(38 90% 50% / 0.14); }
</style>
