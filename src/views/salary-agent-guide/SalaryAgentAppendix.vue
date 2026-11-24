<template>
  <DocShell
    :toc-items="tocItems"
    title="七、附录"
    subtitle="7.1 待决事项 · 7.2/7.3/7.4 各岗位现行薪酬项清单（现金 / 常乐豆底账）"
    version="v1.1"
    date="2026-11-24"
    :breadcrumbs="breadcrumbs"
  >
    <div id="sa-app-ch" class="section">
      <div class="section-header">
        <h2>本章怎么组织</h2>
      </div>
      <p class="doc-p">
        附录放两类东西：<strong>还没定的事</strong>（7.1）和<strong>围墙设计的底账</strong>（7.2 / 7.3 / 7.4）。
        薪酬项清单记录各岗位当前生效策略下实际在用的薪酬项——哪个显示名对应哪个内部名、属于哪个分组、
        走现金工资单还是常乐豆工资单。这是字段裁剪（6.2）和回答口径（6.3）做针对性设计时的对照表。
      </p>
      <div class="note">
        <strong>清单的性质：</strong>清单描述的是当前事实（2026 年 10 月以来生效策略），会随薪酬策略演进而更新，
        不是 Agent 的承诺；Agent 对员工只呈现显示名称与金额，内部名称与策略 / 模板名永远不在场（6.2）。
      </div>
    </div>

    <div id="sa-app-list" class="section">
      <div class="section-header">
        <h2>附录列表</h2>
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
import { salaryAgentAppendixChapters } from '../../docs/salaryAgentChapters.js'

const chapters = salaryAgentAppendixChapters
  .map(ch => ({ id: ch.id, no: ch.no, title: ch.title, subtitle: ch.subtitle, path: ch.path }))
  .sort((a, b) => Number(a.no.split('.')[1]) - Number(b.no.split('.')[1]))

const tocItems = [
  { id: 'sa-app-ch', label: '本章怎么组织' },
  { id: 'sa-app-list', label: '附录列表' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '模块化薪酬', to: '/docs/salary-agent' },
  { label: '七、附录' }
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
