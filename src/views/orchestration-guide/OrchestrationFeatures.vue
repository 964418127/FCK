<template>
  <DocShell
    :toc-items="tocItems"
    title="六、功能详细说明"
    subtitle="6.1 是定义一件事，6.2–6.6 才是一单的时间线；规则写在章正文，逐页操作写在同一章的 6.x.y"
    version="v0.1"
    date="2026-10-30"
    :breadcrumbs="breadcrumbs"
  >
    <div id="orch-ch-structure" class="section">
      <div class="section-header">
        <h2>本章怎么组织</h2>
      </div>
      <p class="doc-p">
        每个功能章节只讲<strong>一件事或一段链路</strong>，写法固定：先给功能入口与定位，再按
        <strong>6.x.y</strong> 拆到「谁在用 → 看到什么能做什么 → 校验与提示 → 提交后 → 边界」。
        规则、阈值、口径只写在所属章节，别处需要时只留一句「见 6.x」，不重复叙述。
        <br /><strong>顺序规则只有一个：定义在前、单据在后。</strong>没有 6.1 那套提示词与子事件清单，后面每一单都无从生成。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">层级</th><th>写什么</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>6.x</strong></td><td>这一段是什么、为什么这么定、规则与边界、谁负责、什么不做</td></tr>
          <tr><td><strong>6.x.y</strong></td><td>具体页面：控件与字段、按钮什么时候可点、提示文案、提交后去向</td></tr>
          <tr><td><strong>功能入口</strong></td><td>每章开头写清从哪进（Web / 移动端），走查从这一行进</td></tr>
          <tr><td><strong>章节顺序</strong></td><td><strong>定义（6.1）在前，单据链路（6.2–6.6）在后</strong></td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>定义：</strong>6.1 管谁 + 提示词 + 子事件清单 + 触点与载荷 —— 配完才可能触发。
        <br /><strong>单据链路：</strong>发起与取数（6.2）→ 子事件生成（6.3）→ 办理（6.4）→ 系统判定与执行（6.5）→ 进度、调整与交付（6.6）。
      </div>
    </div>

    <div id="orch-ch-list" class="section">
      <div class="section-header">
        <h2>章节列表</h2>
      </div>
      <div class="chapter-grid">
        <router-link
          v-for="ch in chapters"
          :key="ch.id"
          :to="ch.path"
          class="chapter-card"
        >
          <div class="chapter-card-index">{{ ch.no }}</div>
          <div class="chapter-card-body">
            <div class="chapter-card-title">{{ ch.title }}</div>
            <div class="chapter-card-desc">{{ ch.desc }}</div>
          </div>
          <div class="chapter-card-arrow">→</div>
        </router-link>
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../docs/components/DocShell.vue'
import { orchFeatureChapters } from '../../docs/orchestrationChapters.js'

const chapters = orchFeatureChapters
  .map(ch => ({ id: ch.id, no: ch.no, title: ch.title, desc: ch.subtitle, path: ch.path }))
  .sort((a, b) => Number(a.no.split('.')[1]) - Number(b.no.split('.')[1]))

const tocItems = [
  { id: 'orch-ch-structure', label: '本章怎么组织' },
  { id: 'orch-ch-list', label: '章节列表' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '事件编排', to: '/docs/orchestration' },
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
a.chapter-card:hover {
  border-color: hsl(var(--primary) / 0.5);
  box-shadow: 0 4px 14px hsl(0 0% 0% / 0.06);
  transform: translateY(-1px);
}
.chapter-card-index {
  flex-shrink: 0; width: 34px; height: 34px; border-radius: 9px;
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
