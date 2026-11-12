<template>
  <DocShell
    :toc-items="tocItems"
    title="六、功能详细说明"
    subtitle="6.1 是上线前的配置，6.2 起才是任务的时间线；规则与口径写在章正文，逐页操作写在同一章的 6.x.y 小节"
    version="v1.0"
    date="2026-11-06"
    :breadcrumbs="breadcrumbs"
  >
    <!-- 本章结构 -->
    <div id="pt-ch-structure" class="section">
      <div class="section-header">
        <h2>本章怎么组织</h2>
      </div>
      <p class="doc-p">
        每个功能章节只讲<strong>一个环节或一类配置</strong>，页面顺序固定：先给功能入口与定位，再按
        <strong>6.x.y</strong> 拆到「看到什么 → 能做什么 → 校验与提示 → 提交后 → 边界」。
        规则、算法、阈值只写在所属章节，别处需要时只留一句「见 6.x」，不重复叙述。
        <br /><strong>顺序规则只有一个：配置在前、单据在后。</strong>没有 6.1 的需求，6.2 生成不出任何任务。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">层级</th><th>写什么</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>6.x</strong></td><td>这个环节是什么、为什么这么定、算法与阈值、谁负责、什么不做</td></tr>
          <tr><td><strong>6.x.y</strong></td><td>具体页面：控件与字段、按钮什么时候可点、提示文案、提交后去向</td></tr>
          <tr><td><strong>功能入口</strong></td><td>每章开头给可点的原型地址，走查从这一行进</td></tr>
          <tr><td><strong>章节顺序</strong></td><td><strong>配置（6.1）在前</strong>；6.2 起按任务时间线排列；收入与契约放在链路之后</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>任务链路：</strong>排班排假（6.1）→ 周四定时生成 / 临时时段（6.2、6.3）→ 移动端承接（6.5）→ 到店离店打卡（6.6）
        → Web 跟踪（6.4）→ 薪酬读取保底与单价（6.7）。
        <strong>取消、转移、重派都不覆盖原任务</strong>，只追加关联任务与事件，这条原则贯穿 6.2–6.4。
      </div>
    </div>

    <!-- 章节列表 -->
    <div id="pt-ch-list" class="section">
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
import { parttimeFeatureChapters } from '../../docs/parttimeChapters.js'

const chapters = parttimeFeatureChapters
  .map(ch => ({ id: ch.id, no: ch.no, title: ch.title, subtitle: ch.subtitle, path: ch.path }))
  .sort((a, b) => Number(a.no.split('.')[1]) - Number(b.no.split('.')[1]))

const tocItems = [
  { id: 'pt-ch-structure', label: '本章怎么组织' },
  { id: 'pt-ch-list', label: '章节列表' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '非全客户经理', to: '/docs/parttime-account-manager' },
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
