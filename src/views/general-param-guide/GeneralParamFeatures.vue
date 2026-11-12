<template>
  <DocShell
    :toc-items="tocItems"
    title="六、功能详细说明"
    subtitle="6.1 配置参数与数据表 → 6.2 在薪酬项里使用 → 6.3 示例"
    version="v1.0"
    date="2026-11-10"
    :breadcrumbs="breadcrumbs"
  >
    <div id="gp-ch-structure" class="section">
      <div class="section-header">
        <h2>本章怎么组织</h2>
      </div>
      <p class="doc-p">
        只三节：<strong>界面上怎么配</strong>（6.1）、<strong>界面上怎么用</strong>（6.2）、<strong>一个示例</strong>（6.3）。
        顺序只有一个理由：先把表建出来，再谈怎么取。
      </p>
    </div>

    <div id="gp-ch-list" class="section">
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
import { generalParamFeatureChapters } from '../../docs/generalParamChapters.js'

const chapters = generalParamFeatureChapters
  .map(ch => ({ id: ch.id, no: ch.no, title: ch.title, subtitle: ch.subtitle, path: ch.path }))
  .sort((a, b) => Number(a.no.split('.')[1]) - Number(b.no.split('.')[1]))

const tocItems = [
  { id: 'gp-ch-structure', label: '本章怎么组织' },
  { id: 'gp-ch-list', label: '章节列表' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '模块化薪酬', to: '/docs/general-param' },
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
  flex-shrink: 0; min-width: 34px; height: 34px; padding: 0 6px; border-radius: 9px;
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
