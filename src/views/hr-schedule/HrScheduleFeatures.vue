<template>
  <DocShell
    :toc-items="tocItems"
    title="六、功能详细说明"
    subtitle="6.1 容器与时段 → 6.2 模板与班次 → 6.3 获取规则 → 6.4 排班结果 → 6.5 移动端选班"
    version="v3.0 基线"
    date="2026-11-12"
    :breadcrumbs="breadcrumbs"
  >
    <div id="hs-feat" class="section">
      <div class="section-header">
        <h2>六、功能详细说明</h2>
        <DocCopyButton section-id="hs-feat" />
      </div>
      <p class="doc-p">
        五个功能章按<strong>「配置在前、结果在后」</strong>排：时段不配出来，后面一条名额也铺不出来；
        结果不写进去，移动端就没有「我的排班」可看。
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
          <tr><td><strong>6.1 容器与时段</strong></td><td>排班策略 → 时段</td><td>按容器看时段，改时间形态与生成节奏</td></tr>
          <tr><td><strong>6.2 模板与班次</strong></td><td>排班策略 → 时段模板；时段详情 → 本店班次库</td><td>模板只读引用，班次可改名调时间</td></tr>
          <tr><td><strong>6.3 获取规则</strong></td><td>排班策略 → 获取规则</td><td>改模式与余额去向，结果页即时重算</td></tr>
          <tr><td><strong>6.4 排班结果</strong></td><td>排班策略 → 排班结果</td><td>唯一记录口，带「怎么排上的」</td></tr>
          <tr><td><strong>6.5 移动端选班</strong></td><td>移动端菜单 → 人事组「我的排班」</td><td>一套壳按资格过滤，右上角可切视角</td></tr>
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
