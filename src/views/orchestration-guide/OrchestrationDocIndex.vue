<template>
  <DocShell
    :toc-items="tocItems"
    title="事件编排 · 产品需求说明"
    subtitle="一件事 = 一套提示词 + 一份子事件清单 + 一个触点。定义期不生成树：触发后按这一单的人与事实生成子事件，事实取不到的那一条就不存在"
    version="v0.1"
    date="2026-10-30"
    :breadcrumbs="breadcrumbs"
  >
    <!-- 章节导航 -->
    <div id="orch-nav" class="section">
      <div class="section-header">
        <h2>章节导航</h2>
      </div>
      <p class="doc-p">点击卡片进入对应章节；每个章节可独立复制与定位，返回本页从左侧目录或面包屑进入。</p>
      <div class="chapter-grid">
        <router-link v-for="ch in chapters" :key="ch.path" :to="ch.path" class="chapter-card">
          <div class="chapter-card-index">{{ ch.order || ch.no }}</div>
          <div class="chapter-card-body">
            <div class="chapter-card-title">{{ ch.title }}</div>
            <div class="chapter-card-desc">{{ ch.subtitle }}</div>
          </div>
          <div class="chapter-card-arrow">→</div>
        </router-link>
      </div>
      <div class="note">
        <strong>本版范围：</strong>一、版本信息；二、变更日志；三、文档说明；四、需求背景；五、需求范围；六、功能详细说明（<strong>6.1 事件定义</strong> + 6.2–6.6 一单的时间线）；七、附录。
        定义期与实例期分两段写：<strong>定义期只说「这件事必须交出什么」，实例期才说「这一单怎么走」</strong>。
      </div>
    </div>

    <!-- 阅读方式 -->
    <div id="orch-how" class="section">
      <div class="section-header">
        <h2>怎么读</h2>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">你要找的</th><th>去哪看</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>这件事要办成什么</strong></td><td><router-link to="/docs/orchestration/6-1">6.1 事件定义</router-link>：管谁、提示词怎么写、子事件清单长什么样</td></tr>
          <tr><td><strong>一条子事件怎么写</strong></td><td>6.1.5 清单的六列 + 6.4 的办理口径：结论、门禁、谁给结论、交什么</td></tr>
          <tr><td><strong>为什么这一单没有那一条</strong></td><td><router-link to="/docs/orchestration/6-3">6.3 子事件生成</router-link>：清单 × 事实，事实取不到就不长</td></tr>
          <tr><td><strong>审核放在哪</strong></td><td><router-link to="/docs/orchestration/6-4">6.4 办理</router-link>：审核是一条结论 + 人办路径，有几级就几条结论</td></tr>
          <tr><td><strong>系统自己判 / 自己执行</strong></td><td><router-link to="/docs/orchestration/6-5">6.5 系统判定与系统执行</router-link>：批次、取数频率、回执字段</td></tr>
          <tr><td><strong>某个名词是什么意思</strong></td><td><router-link to="/docs/orchestration/notes">三、文档说明</router-link></td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>单一事实源：</strong>每条硬规则只在一处定义，其他章节只写「见 x.x」不再复述 ——
        避免同一口径在多处各写一遍、改一处漏一处。逐页交互写在 6.x.y，不另立「Web 端说明 / 移动端说明」两份。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../docs/components/DocShell.vue'
import { orchChapters } from '../../docs/orchestrationChapters.js'

const chapters = orchChapters

const tocItems = [
  { id: 'orch-nav', label: '章节导航' },
  { id: 'orch-how', label: '怎么读' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '事件编排' }
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
  flex-shrink: 0; width: 34px; height: 34px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600; color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.1);
  font-variant-numeric: tabular-nums;
}
.chapter-card-body { flex: 1; min-width: 0; }
.chapter-card-title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.chapter-card-desc { font-size: 12px; line-height: 1.6; color: hsl(var(--muted-foreground)); }
.chapter-card-arrow { flex-shrink: 0; color: hsl(var(--muted-foreground)); font-size: 13px; }
</style>
