<template>
  <DocShell
    :toc-items="tocItems"
    title="7.2 薪酬项清单：全日制客户经理"
    subtitle="策略「客户经理收入 V69」现行薪酬项：显示名 / 内部名 / 分组 / 形式 / 应答深度"
    version="v2.6"
    date="2026-11-23"
    :breadcrumbs="breadcrumbs"
  >
    <div id="sa-72-src" class="section">
      <div class="section-header">
        <h2>清单口径</h2>
        <DocCopyButton section-id="sa-72-src" />
      </div>
      <p class="doc-p">
        数据来自薪酬计算结果明细，取 <strong>2026 年 10 月（最近完整算薪月）以来正在生效的策略</strong>；
        形式按工资单类型区分：<strong>现金 = 工资单</strong>、<strong>常乐豆 = 常乐豆单</strong>。
        「深度」列按 6.3 的四层分层逐项标注：<span class="lv lv1">L1 求证</span>
        <span class="lv lv2">L2 结论</span> <span class="lv lv3">L3 账户级</span> <span class="lv lv4">L4 不在场</span>。
        本清单供围墙设计（6.2）、分层（6.3）与求证链（6.4）做逐项对照的底账，会随策略演进更新。
      </p>
      <div class="note">
        <strong>两个容易踩坑的点：</strong>
        ① 内部名称带「获豆」不代表发的是豆——「三级合伙人获豆47」在本策略里走<strong>现金工资单</strong>；
        ② 现金 / 豆的归属是「策略 × 薪酬项」级别的属性——同一内部项在客户经理策略里是现金、
        在推拿师模板里可以是常乐豆（见 7.3「介绍客户经理获豆」），做映射必须带上策略维度。
      </div>
    </div>

    <div id="sa-72-income" class="section">
      <div class="section-header">
        <h2>收入项（薪酬项）</h2>
        <DocCopyButton section-id="sa-72-income" />
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 200px;">对外显示名称</th>
            <th>内部名称</th>
            <th style="width: 110px;">所属分组</th>
            <th style="width: 90px;">形式</th>
            <th style="width: 100px;">深度</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in incomeRows" :key="row.d + row.i">
            <td>{{ row.d }}<span v-if="row.warn" class="warn-mark" title="内部名带「获豆」但走现金工资单">⚠</span></td>
            <td class="mono">{{ row.i }}</td>
            <td>{{ row.g }}</td>
            <td><span class="form-badge" :class="row.f === '现金' ? 'cash' : 'bean'">{{ row.f }}</span></td>
            <td><span class="lv" :class="'lv' + row.lv">{{ row.lv === 1 ? 'L1 求证' : row.lv === 2 ? 'L2 结论' : 'L3 账户级' }}</span></td>
          </tr>
        </tbody>
      </table>
      <div class="note warn-note">
        <strong>⚠ 标记的两行：</strong>
        「三级合伙人激励」内部名带「获豆47」但走现金；「客户经理薪酬申请」内部名是「全职推拿师薪酬申请金额13」——
        内部名带「推拿师」但客户经理在用。这两类都是映射时不能按名称想当然的例子。
      </div>
    </div>

    <div id="sa-72-deduct" class="section">
      <div class="section-header">
        <h2>扣缴项</h2>
        <DocCopyButton section-id="sa-72-deduct" />
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 200px;">对外显示名称</th>
            <th>内部名称</th>
            <th style="width: 110px;">所属分组</th>
            <th style="width: 90px;">形式</th>
            <th style="width: 100px;">深度</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in deductRows" :key="row.d + row.i">
            <td>{{ row.d }}</td>
            <td class="mono">{{ row.i }}</td>
            <td>{{ row.g }}</td>
            <td><span class="form-badge" :class="row.f === '现金' ? 'cash' : 'bean'">{{ row.f }}</span></td>
            <td><span class="lv" :class="'lv' + row.lv">{{ row.lv === 1 ? 'L1 求证' : row.lv === 2 ? 'L2 结论' : 'L3 账户级' }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div id="sa-72-rule" class="section">
      <div class="section-header">
        <h2>整体规律</h2>
        <DocCopyButton section-id="sa-72-rule" />
      </div>
      <p class="doc-p">
        客户经理除「获豆明细」分组和「物资超标扣豆」走常乐豆外，其余全部走现金工资单。
        对应到 Agent：客户经理的常乐豆问题集中在<strong>新客 / 评价 / 盘点 / 资产卫生维护 / 采购物资 / 布草洗涤</strong>
        六个获豆分类和<strong>物资超标扣豆</strong>一项扣豆上——<strong>全部常乐豆形式项归 L3，只并入账户级汇总</strong>（6.3）；
        现金侧的客次提成（含加班客次提成）归 L1，可走求证链（6.4）；其余现金项与扣缴组归 L2。
      </p>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const incomeRows = [
  { d: '计件客次收入', i: '客户经理非加班客次提成413', g: '计件收入', f: '现金' , lv: 1 },
  { d: '加班客次提成', i: '客户经理加班客次提成413', g: '加班工资', f: '现金' , lv: 1 },
  { d: '加班收入', i: '客户经理加班2小时津贴', g: '加班工资', f: '现金' , lv: 2 },
  { d: '加班排顶班收入', i: '客户经理加班拍顶班津贴', g: '加班工资', f: '现金' , lv: 2 },
  { d: '顶班保底收入', i: '客户经理顶班保底津贴', g: '加班工资', f: '现金' , lv: 2 },
  { d: '保底金额', i: '2级运算客户经理保底', g: '激励补贴', f: '现金' , lv: 2 },
  { d: '客次班次津贴', i: '客户经理客次班次津贴413', g: '激励补贴', f: '现金' , lv: 2 },
  { d: '新客班次津贴', i: '客户经理新客班次津贴413', g: '激励补贴', f: '现金' , lv: 2 },
  { d: '住房激励', i: '客户经理住房激励413', g: '激励补贴', f: '现金' , lv: 2 },
  { d: '试岗补贴', i: '客户经理试岗激励413', g: '试岗补贴', f: '现金' , lv: 2 },
  { d: '内部介绍激励', i: '客户经理内部介绍激励413', g: '激励补贴', f: '现金', warn: true , lv: 2 },
  { d: '接待激励', i: '客户经理接待激励413', g: '激励补贴', f: '现金' , lv: 2 },
  { d: '房间卫生打扫激励', i: '客户经理房间卫生打扫激励413', g: '激励补贴', f: '现金' , lv: 2 },
  { d: '卫生间打扫激励', i: '卫生间打扫激励413', g: '激励补贴', f: '现金' , lv: 2 },
  { d: '卫生检查激励', i: '客户经理卫生检查激励413', g: '激励补贴', f: '现金' , lv: 2 },
  { d: '培训出勤30天激励', i: '客户经理培训出勤30天激励', g: '激励补贴', f: '现金' , lv: 2 },
  { d: '培训出勤90天激励', i: '客户经理培训出勤90天激励', g: '激励补贴', f: '现金' , lv: 2 },
  { d: '绵阳培训出勤30天激励', i: '绵阳客户经理培训出勤30天激励', g: '激励补贴', f: '现金' , lv: 2 },
  { d: '绵阳面试通过激励', i: '绵阳面试通过激励413', g: '激励补贴', f: '现金' , lv: 2 },
  { d: '三级合伙人激励', i: '三级合伙人获豆47', g: '激励补贴', f: '现金', warn: true , lv: 2 },
  { d: '客户经理手动津贴', i: '客户经理手动津贴413', g: '激励补贴', f: '现金' , lv: 2 },
  { d: '客户经理薪酬申请', i: '全职推拿师薪酬申请金额13', g: '激励补贴', f: '现金' , lv: 2 },
  { d: '新客获豆', i: '客户经理新客激励413', g: '获豆明细', f: '常乐豆' , lv: 3 },
  { d: '评价获豆', i: '客户经理评价激励413', g: '获豆明细', f: '常乐豆' , lv: 3 },
  { d: '盘点获豆', i: '客户经理盘点获豆', g: '获豆明细', f: '常乐豆' , lv: 3 },
  { d: '资产卫生维护', i: '客户经理资产维护激励413', g: '获豆明细', f: '常乐豆' , lv: 3 },
  { d: '采购物资获豆', i: '采购物资验收获豆', g: '获豆明细', f: '常乐豆' , lv: 3 },
  { d: '布草洗涤获豆', i: '布草送洗获豆', g: '获豆明细', f: '常乐豆' , lv: 3 },
]

const deductRows = [
  { d: '考勤扣款', i: '考勤扣款', g: '扣缴', f: '现金' , lv: 2 },
  { d: '出勤不达标扣款', i: '出勤不达标扣款', g: '扣缴', f: '现金' , lv: 2 },
  { d: '手动扣款', i: '客户经理手动扣款413', g: '扣缴', f: '现金' , lv: 2 },
  { d: '系统扣款', i: '全职推拿师薪酬申请扣款13', g: '扣缴', f: '现金' , lv: 2 },
  { d: '投诉扣款', i: '客户经理投诉扣款413', g: '扣缴', f: '现金' , lv: 2 },
  { d: '房间卫生未打扫扣款', i: '客户经理房间卫生未打扫扣款金额413', g: '扣缴', f: '现金' , lv: 2 },
  { d: '卫生间卫生未打扫扣款', i: '客户经理卫生间卫生未打扣款金额413', g: '扣缴', f: '现金' , lv: 2 },
  { d: '卫生检查扣款', i: '客户经理卫生检查扣款金额413', g: '扣缴', f: '现金' , lv: 2 },
  { d: '未点离店扣款', i: '客户经理未点离店扣款金额413', g: '扣缴', f: '现金' , lv: 2 },
  { d: '房间打扫卫生申诉扣回', i: '客户经理房间打扫卫生申诉扣款金额413', g: '扣缴', f: '现金' , lv: 2 },
  { d: '接待申诉扣回', i: '客户经理接待申诉返回金额413', g: '扣缴', f: '现金' , lv: 2 },
  { d: '评价回访超时未处理扣款', i: '客户经理评价回访超时未处理扣款金额413', g: '扣缴', f: '现金' , lv: 2 },
  { d: '物资超标扣豆', i: '物资超标扣豆', g: '扣豆', f: '常乐豆' , lv: 3 },
]

const tocItems = [
  { id: 'sa-72-src', label: '清单口径' },
  { id: 'sa-72-income', label: '收入项' },
  { id: 'sa-72-deduct', label: '扣缴项' },
  { id: 'sa-72-rule', label: '整体规律' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '模块化薪酬', to: '/docs/salary-agent' },
  { label: '七、附录', to: '/docs/salary-agent/appendix' },
  { label: '7.2 薪酬项清单：全日制客户经理' }
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
