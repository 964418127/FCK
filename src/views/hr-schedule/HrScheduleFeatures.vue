<template>
  <DocShell
    :toc-items="tocItems"
    title="六、功能详细说明"
    subtitle="6.1 时段与清单 → 6.2 轮与获取 → 6.3 排班结果 → 6.4 变化与求值 → 6.5 移动端 → 6.6 通知 → 6.7 打卡 → 6.8 薪酬 → 6.9 权限契约 → 6.10 门店范围"
    version="v5.0"
    date="2026-11-15"
    :breadcrumbs="breadcrumbs"
  >
    <div id="hs-feat" class="section">
      <div class="section-header">
        <h2>六、功能详细说明</h2>
        <DocCopyButton section-id="hs-feat" />
      </div>
      <p class="doc-p">
        功能章按<strong>数据流顺序</strong>排：先配出时段与清单（6.1），再切成轮让人获取（6.2），
        获取结果写进唯一记录口（6.3）；之后的变化写事实、重算、留版本（6.4）；员工端只看两件事（6.5）；
        通知（6.6）说清会发哪些系统消息；<strong>6.7–6.10 是人事中心的「支持非全合作」能力</strong>——打卡（6.7）出有效工时，薪酬（6.8）用工时算保底，权限契约（6.9）管边界，门店范围（6.10）让客户经理的门店取数跟着挂店走。
      </p>

      <div class="chapter-grid">
        <router-link v-for="(ch, i) in features" :key="ch.id" :to="ch.path" class="chapter-card">
          <div class="chapter-card-index">{{ i + 1 }}</div>
          <div class="chapter-card-body">
            <div class="chapter-card-title">{{ ch.no }} {{ ch.title }}</div>
            <div class="chapter-card-desc">{{ ch.subtitle }}</div>
          </div>
          <div class="chapter-card-arrow">→</div>
        </router-link>
      </div>

      <h4 class="h4sub">功能入口对照（原型地址）</h4>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">功能</th><th style="width: 300px;">入口</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>6.1 时段与清单</strong></td><td>排班策略 v5 → 时段与清单（<code>/schedule-v5</code>）</td><td>班次时间与名额 + 清单逐档配「谁 / 方式 / 窗口 / 上限」</td></tr>
          <tr><td><strong>6.2 轮与获取</strong></td><td>排班策略 v5 → 轮与结果；页头排班节奏</td><td>轮的三个时刻、三种获取方式、余额三条去向</td></tr>
          <tr><td><strong>6.3 排班结果</strong></td><td>排班策略 v5 → 轮与结果 / 个人查询</td><td>唯一记录口 + 占用矩阵 + 申领登记；个人查询按天看一个人这一轮的班与无法履约明细</td></tr>
          <tr><td><strong>6.4 变化与求值</strong></td><td>排班策略 v5 → 事实记录</td><td>四类事实、全员一周矩阵、事实表（搜索 + 分页）</td></tr>
          <tr><td><strong>6.5 移动端</strong></td><td>移动端菜单 → 人事组「我的排班」（<code>/v5/m</code>）</td><td>我的排班 + 可获取两页签，右上角切演示视角</td></tr>
          <tr><td><strong>6.6 通知</strong></td><td>本章 6.6（<code>/docs/hr-schedule/6-6</code>）</td><td>发给员工的补位 / 安排 / 换班，发给人事经理的缺口</td></tr>
          <tr><td><strong>6.7 打卡</strong></td><td>本章 6.7（<code>/docs/hr-schedule/6-7</code>）</td><td>人事中心通用打卡能力，首个落地非全客户经理</td></tr>
          <tr><td><strong>6.8 薪酬计算与看板</strong></td><td>本章 6.8（<code>/docs/hr-schedule/6-8</code>）</td><td>单价四级继承 + 保底按时薪；看板与工资确认单</td></tr>
          <tr><td><strong>6.9 权限与数据契约</strong></td><td>本章 6.9（<code>/docs/hr-schedule/6-9</code>）</td><td>权限对照、角色矩阵、数据契约与三条硬约束</td></tr>
          <tr><td><strong>6.10 门店范围</strong></td><td>本章 6.10（<code>/docs/hr-schedule/6-10</code>）</td><td>客户经理不使用门店权限，门店取数一律取挂店范围</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>写法约定：</strong>每章只写「看到什么 / 能做什么 / 不可点的条件与提示」，不写实现细节；
        字段级口径统一在<router-link to="/docs/hr-schedule/notes">三、文档说明</router-link>，各章只引用不复述。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../docs/components/DocShell.vue'
import DocCopyButton from '../../docs/components/DocCopyButton.vue'
import { hrScheduleFeatureChapters } from '../../docs/hrScheduleChapters.js'

const features = hrScheduleFeatureChapters

const tocItems = [
  { id: 'hs-feat', label: '六、功能详细说明' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事中心', to: '/docs/hr-schedule' },
  { label: '六、功能详细说明' }
]
</script>

<style scoped src="./sections/doc-base.css"></style>

<style scoped>
.chapter-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px; margin: 14px 0 16px;
}
.chapter-card {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px 16px; border: 1px solid hsl(var(--border)); border-radius: 10px;
  background: hsl(var(--card)); text-decoration: none; color: inherit;
  transition: border-color .15s, box-shadow .15s;
}
.chapter-card:hover { border-color: hsl(var(--primary) / 0.5); box-shadow: 0 2px 10px hsl(var(--primary) / 0.08); }
.chapter-card-index {
  flex: 0 0 22px; height: 22px; border-radius: 50%;
  background: hsl(var(--primary) / 0.1); color: hsl(var(--primary));
  font-size: 12px; font-weight: 600; display: flex; align-items: center; justify-content: center;
}
.chapter-card-body { flex: 1; min-width: 0; }
.chapter-card-title { font-size: 13.5px; font-weight: 600; margin-bottom: 4px; }
.chapter-card-desc { font-size: 12px; line-height: 1.7; color: hsl(var(--muted-foreground)); }
.chapter-card-arrow { color: hsl(var(--muted-foreground)); font-size: 13px; }
</style>
