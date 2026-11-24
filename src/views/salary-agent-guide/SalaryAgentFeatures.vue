<template>
  <DocShell
    :toc-items="tocItems"
    title="六、功能详细说明"
    subtitle="6.1 查询范围与岗位底账 → 6.2 围墙体系 → 6.3 应答深度分层 → 6.4 完整求证链 → 6.5 产品入口与人工出口"
    version="v2.0"
    date="2026-11-24"
    :breadcrumbs="breadcrumbs"
  >
    <div id="sa-ch-structure" class="section">
      <div class="section-header">
        <h2>本章怎么组织</h2>
      </div>
      <p class="doc-p">
        只五节：<strong>能查什么</strong>（6.1）、<strong>什么都碰不到</strong>（6.2）、<strong>答到多深</strong>（6.3）、
        <strong>怎么还原求证</strong>（6.4）、<strong>从哪进来怎么走</strong>（6.5）。
        顺序只有一个理由：先按岗位底账划能查的边界，再用两层围墙裁出数据面，
        然后给每个薪酬项定应答深度、给求证层的项走通还原链路，最后讲入口与链路怎么把前面四节串起来。
      </p>
    </div>

    <div id="sa-ch-list" class="section">
      <div class="section-header">
        <h2>章节列表</h2>
      </div>
      <div class="chapter-grid">
        <router-link v-for="ch in chapters" :key="ch.id" :to="ch.path" class="chapter-card">
          <div class="chapter-card-index">{{ ch.no }}</div>
          <div class="chapter-card-body">
            <div class="chapter-card-title">{{ ch.title }}</div>
            <div class="chapter-card-desc">{{ ch.subtitle }}</div>
          </div>
          <div class="chapter-card-arrow">→</div>
        </router-link>
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../docs/components/DocShell.vue'
import { salaryAgentFeatureChapters } from '../../docs/salaryAgentChapters.js'

const chapters = salaryAgentFeatureChapters
  .map(ch => ({ id: ch.id, no: ch.no, title: ch.title, subtitle: ch.subtitle, path: ch.path }))
  .sort((a, b) => Number(a.no.split('.')[1]) - Number(b.no.split('.')[1]))

const tocItems = [
  { id: 'sa-ch-structure', label: '本章怎么组织' },
  { id: 'sa-ch-list', label: '章节列表' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '模块化薪酬', to: '/docs/salary-agent' },
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
  border: 1px solid hsl(var(--border)); border-radius: 12px;
  background: hsl(var(--card)); padding: 14px 16px;
  text-decoration: none; color: inherit;
  transition: border-color .15s, box-shadow .15s, transform .15s;
}
.chapter-card:hover {
  border-color: hsl(var(--primary) / 0.5);
  box-shadow: 0 4px 14px hsl(0 0% 0% / 0.06);
  transform: translateY(-1px);
}
.chapter-card-index {
  flex-shrink: 0; width: 44px; height: 34px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600; color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.1);
  font-variant-numeric: tabular-nums;
}
.chapter-card-body { flex: 1; min-width: 0; }
.chapter-card-title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.chapter-card-desc { font-size: 12px; line-height: 1.6; color: hsl(var(--muted-foreground)); }
.chapter-card-arrow { flex-shrink: 0; color: hsl(var(--muted-foreground)); font-size: 12px; }
</style>
