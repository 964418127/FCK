<template>
  <DocShell
    :toc-items="tocItems"
    title="排班策略 · 产品需求说明"
    subtitle="时段与清单配出钟点 → 轮把清单切成窗口让人获取 → 结果只写一张表 → 变化写事实、重算、留版本"
    version="v5.0"
    date="2026-11-15"
    :breadcrumbs="breadcrumbs"
  >
    <div id="hs-nav" class="section">
      <div class="section-header">
        <h2>章节导航</h2>
      </div>
      <p class="doc-p">点击卡片进入对应章节；每个章节可独立复制与定位，返回本页从左侧目录或面包屑进入。</p>
      <div class="chapter-grid">
        <router-link v-for="(ch, i) in chapters" :key="ch.id" :to="ch.path" class="chapter-card">
          <div class="chapter-card-index">{{ i + 1 }}</div>
          <div class="chapter-card-body">
            <div class="chapter-card-title">{{ ch.title }}</div>
            <div class="chapter-card-desc">{{ ch.subtitle }}</div>
          </div>
          <div class="chapter-card-arrow">→</div>
        </router-link>
      </div>
      <div class="note">
        <strong>本版范围：</strong>一、版本信息；二、变更日志；三、文档说明；四、需求背景；<strong>五、需求范围</strong>；
        六、功能详细说明（6.1 时段与清单 / 6.2 轮与获取 / 6.3 排班结果 / 6.4 变化与求值 / 6.5 移动端）；七、附录。
        四岗位的<strong>现行排班现状</strong>与 v5 的<strong>三阶段设计</strong>统一收在第五章。
      </div>
    </div>

    <div id="hs-how" class="section">
      <div class="section-header">
        <h2>怎么读</h2>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 190px;">你要找的</th><th>去哪看</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>现在的排班是怎么做</strong></td>
            <td><router-link to="/docs/hr-schedule/scope">5.2 现行排班现状</router-link>：四岗位一张表 + 四条共性 + 三个空洞</td>
          </tr>
          <tr>
            <td><strong>重构改了什么、为什么这么切</strong></td>
            <td><router-link to="/docs/hr-schedule/scope">5.3–5.6</router-link>：通用设计三阶段（定义 / 获取 / 变化）+ 拿现状对卷</td>
          </tr>
          <tr>
            <td><strong>某个名词是什么意思</strong></td>
            <td><router-link to="/docs/hr-schedule/notes">三、文档说明</router-link></td>
          </tr>
          <tr>
            <td><strong>某个页面怎么配、怎么走</strong></td>
            <td>6.x 正文：看到什么、填什么、什么条件下不可点</td>
          </tr>
          <tr>
            <td><strong>哪些还没定</strong></td>
            <td><router-link to="/docs/hr-schedule/appendix">七、附录</router-link></td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>单一事实源：</strong>每条硬规则只在一处定义，其他章节只写「见 x.x」不再复述 ——
        避免同一口径在多处各写一遍、改一处漏一处。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../docs/components/DocShell.vue'
import { hrScheduleChapters } from '../../docs/hrScheduleChapters.js'

const chapters = hrScheduleChapters

const tocItems = [
  { id: 'hs-nav', label: '章节导航' },
  { id: 'hs-how', label: '怎么读' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事中心' },
  { label: '排班策略' }
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
