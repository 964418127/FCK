<template>
  <DocShell
    :toc-items="tocItems"
    title="离职流程 · 产品需求说明"
    subtitle="员工离职需求 → 离职需求审核（一次定稿）→ 按岗位交接 → 自动推送离职合同 → 签署 → 次月补偿金。规则与口径写在这里，逐页操作写在每次功能章节的 6.x.y"
    version="v0.3"
    date="2026-10-26"
    :breadcrumbs="breadcrumbs"
  >
    <!-- 章节导航 -->
    <div id="rf-nav" class="section">
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
        <strong>本版范围：</strong>一、版本信息；二、变更日志；三、文档说明；四、需求背景；五、需求范围；六、功能详细说明（<strong>6.1 前置配置</strong> + 6.2–6.6 单据流程）；七、附录。
        原先的「移动端 / Web 端功能说明」已按流程节点并入各功能章节的 6.x.y，不再单列。
      </div>
    </div>

    <!-- 阅读方式 -->
    <div id="rf-how" class="section">
      <div class="section-header">
        <h2>怎么读</h2>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">你要找的</th><th>去哪看</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>规则 / 口径 / 边界</strong></td><td>6.x 的正文与表格：为什么这么定、算法与阈值、谁负责、什么不做</td></tr>
          <tr><td><strong>某个页面怎么操作</strong></td><td>同一 6.x 下的 6.x.y 小节：看到什么、填什么、按钮什么时候可点、提示文案</td></tr>
          <tr><td><strong>某个名词是什么意思</strong></td><td><router-link to="/docs/resign-flow/notes">三、文档说明</router-link></td></tr>
          <tr><td><strong>能不能点得到</strong></td><td>对应章节末尾的原型入口与截图；原型地址见各节「功能入口」</td></tr>
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
import { resignChapters } from '../../docs/resignChapters.js'

const chapters = resignChapters

const tocItems = [
  { id: 'rf-nav', label: '章节导航' },
  { id: 'rf-how', label: '怎么读' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '离职流程' }
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
