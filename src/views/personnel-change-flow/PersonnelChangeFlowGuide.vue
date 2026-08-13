<template>
  <DocShell
    :toc-items="tocItems"
    title="人员异动流程"
    subtitle='HR 人事模块每日汇入异动事实（换签主体 / 换合作方式 / 换岗位 / 离职），本系统<strong>自动截尾</strong>对应旧记录的失效时间，并由<strong>薪酬专员确认</strong>新关系挂接的岗位薪酬模板；最终写入【人员薪酬规划】作为薪酬计算的输入'
    version="v1.0"
    date="2026-08-13"
    :breadcrumbs="breadcrumbs"
  >
    <!-- 章节导航 -->
    <div class="section chapter-nav">
      <h2>章节导航</h2>
      <p class="chapter-nav-tip">点击卡片进入对应章节；每个章节都可独立复制、分享、定位。</p>
      <div class="chapter-grid">
        <router-link
          v-for="ch in chapterNav"
          :key="ch.path"
          :to="ch.path"
          class="chapter-card"
        >
          <div class="chapter-card-index">{{ ch.order }}</div>
          <div class="chapter-card-body">
            <div class="chapter-card-title">{{ ch.title }}</div>
            <div class="chapter-card-desc">{{ ch.subtitle }}</div>
          </div>
          <div class="chapter-card-arrow">→</div>
        </router-link>
      </div>
    </div>

    <!-- 版本日志 -->
    <div id="version" class="section version-log">
      <h3>核心调整</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 80px;">版本</th>
            <th style="width: 110px;">日期</th>
            <th style="width: 90px;">类别</th>
            <th>变更说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td rowspan="4"><strong>v1.0</strong></td>
            <td rowspan="4">2026-08-13</td>
            <td><span style="color: hsl(var(--primary)); font-weight: 600;">新增</span></td>
            <td><strong>人员异动入口</strong>：菜单 <code>员工福利保障 / 模块薪酬 / 人员异动处理</code>；独立页面 <code>/personnel-change-processing</code>，按日拉取 HR 异动列表</td>
          </tr>
          <tr>
            <td><span style="color: hsl(var(--primary)); font-weight: 600;">新增</span></td>
            <td><strong>自动步（旧关系结束）</strong>：异动落库即截尾对应 active 规划记录的 <code>effectiveEnd = oldEndTime</code>；本系统只做同步，不允许修改结束时间</td>
          </tr>
          <tr>
            <td><span style="color: hsl(var(--primary)); font-weight: 600;">新增</span></td>
            <td><strong>手动步（新关系确认）</strong>：薪酬专员按 <code>newPosition</code> 过滤的岗位薪酬模板列表中挑选模板（起止时间只读采用 HR 提供值），确认后写入新规划记录</td>
          </tr>
          <tr>
            <td><span style="color: hsl(var(--primary)); font-weight: 600;">新增</span></td>
            <td><strong>离职类型</strong>：无新关系，<code>status='已结束'</code>，自动步必然命中；UI 标记为「无需确认」绿色，不进入「新关系确认」Tab</td>
          </tr>
        </tbody>
      </table>

      <div class="callout" style="background: hsl(var(--primary) / 0.06); border-left: 3px solid hsl(var(--primary)); padding: 10px 12px; margin-top: 12px; font-size: 13px; border-radius: 4px;">
        <strong>📌 模块定位</strong><br/>
        本模块是<strong>「HR 异动事实」</strong>和<strong>「薪酬计算输入」</strong>之间的桥梁：HR 报过来的任何人员任职变动，必须在本系统里完成【旧关系截尾 + 新关系挂模板】两步后，才能进入【人员薪酬规划】驱动后续薪酬计算
      </div>
    </div>

    <!-- 要点 -->
    <div id="points" class="section">
      <h3>要点</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 200px;">主题</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>两种步：自动 + 手动</strong></td>
            <td>旧关系结束 = <strong>系统自动</strong>截尾；新关系挂模板 = <strong>薪酬专员手动</strong>确认</td>
          </tr>
          <tr>
            <td><strong>异动类型</strong></td>
            <td><strong>换签主体</strong>（主体变更，门店/合作方式/岗位可能变）、<strong>换合作方式</strong>（全职 ↔ 非全日制/兼职/返聘）、<strong>换岗位</strong>（岗位变更，主体/合作方式不变）、<strong>离职</strong>（无新关系）</td>
          </tr>
          <tr>
            <td><strong>自动步不变量</strong></td>
            <td>HR 报过来的每条异动必能在【人员薪酬规划】里找到对应 active 旧记录；找不到属于数据不一致边界态（UI 兜底显示「✓ 已写入」，控制台 warn 排查）</td>
          </tr>
          <tr>
            <td><strong>手动步不变量</strong></td>
            <td>薪酬专员<strong>只挑模板</strong>，起止时间只读采用 HR 给的 <code>newStartTime / newEndTime</code>；批量确认要求所有选中行 <code>newPosition</code> 一致</td>
          </tr>
          <tr>
            <td><strong>HR 异动时间差</strong></td>
            <td>HR 人事模块「先结束、后开始」两条异动可能不同步到达本系统；本系统分别处理，<strong>不强求配对</strong>——结束异动即截尾，开始异动即落入「待确认」等手动确认</td>
          </tr>
          <tr>
            <td><strong>离职特殊语义</strong></td>
            <td>离职只有旧关系结束，无新关系；<code>status='已结束'</code>，不进入「Tab 2 新关系确认」；UI 标记红色「离职」+ 绿色「无需确认」</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 与 HR 人事模块边界 -->
    <div id="boundary" class="section">
      <h3>与 HR 人事模块的边界</h3>
      <div class="callout" style="background: hsl(var(--warning) / 0.08); border-left: 3px solid hsl(var(--warning)); padding: 10px 12px; font-size: 13px; border-radius: 4px;">
        <strong>⚠️ 本模块不重新发明 HR</strong><br/>
        人员任职事实的主数据在<strong>HR 人事模块</strong>（招聘入职、离职、换签、换合作方式等人事流程都在那边完成）。本模块只<strong>消费</strong> HR 按日汇入的异动结论，不反向写回 HR，不维护人员基础信息。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../docs/components/DocShell.vue'
import { Document } from '@element-plus/icons-vue'

const chapterNav = [
  {
    order: '一',
    title: '功能流程说明',
    subtitle: '端到端数据流 + 自动/手动步拆分 + 状态机 + 交互时序',
    path: '/docs/personnel-change-flow/function'
  },
  {
    order: '二',
    title: '产品需求说明',
    subtitle: '业务不变量 + 字段语义 + 边界场景 + 不允许怎么改',
    path: '/docs/personnel-change-flow/requirement'
  }
]

const tocItems = [
  { id: 'version', label: '版本日志' },
  { id: 'points', label: '要点' },
  { id: 'boundary', label: '与 HR 人事模块的边界' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事福利', to: '/docs/personnel-change-flow' },
  { label: '人员异动流程' }
]
</script>

<style scoped>
.chapter-nav h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid hsl(var(--primary));
}
.chapter-nav-tip {
  color: hsl(var(--muted-foreground));
  font-size: 13px;
  margin: 0 0 16px 0;
}
.chapter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}
.chapter-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  background: hsl(var(--background));
  text-decoration: none;
  color: inherit;
  transition: all 0.15s ease;
}
.chapter-card:hover {
  border-color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.04);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px hsl(var(--primary) / 0.1);
}
.chapter-card-index {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
}
.chapter-card-body { flex: 1; min-width: 0; }
.chapter-card-title {
  font-weight: 600;
  font-size: 14px;
  color: hsl(var(--foreground));
  margin-bottom: 2px;
}
.chapter-card-desc {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  line-height: 1.4;
}
.chapter-card-arrow {
  color: hsl(var(--muted-foreground));
  font-size: 18px;
  flex-shrink: 0;
  transition: transform 0.15s ease;
}
.chapter-card:hover .chapter-card-arrow {
  color: hsl(var(--primary));
  transform: translateX(2px);
}
</style>
