<template>
  <DocShell
    :toc-items="tocItems"
    title="通用参数（升级）· 产品需求说明"
    subtitle="把「会变的数字」从公式里搬出来：参数存数据、引用处定怎么取；一张数据表可以服务多种查法"
    version="v1.0"
    date="2026-11-10"
    :breadcrumbs="breadcrumbs"
  >
    <div id="gp-nav" class="section">
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
        <strong>本版范围：</strong>一、版本信息；二、变更日志；三、文档说明；四、需求背景；五、需求范围；
        六、功能详细说明（<strong>6.1 配置 / 6.2 在薪酬项里使用 / 6.3 示例</strong>）；七、附录。
      </div>
    </div>

    <div id="gp-how" class="section">
      <div class="section-header">
        <h2>怎么读</h2>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 190px;">你要找的</th><th>去哪看</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>这套东西为什么改</strong></td><td><router-link to="/docs/general-param/background">四、需求背景</router-link></td></tr>
          <tr><td><strong>怎么建参数、怎么配表</strong></td><td>6.1 配置参数与数据表</td></tr>
          <tr><td><strong>怎么在薪酬项里取值</strong></td><td>6.2 在薪酬项里使用</td></tr>
          <tr><td><strong>配出来长什么样</strong></td><td>6.3 示例说明（保底时薪 + 客次单价）</td></tr>
          <tr><td><strong>某个名词是什么意思</strong></td><td><router-link to="/docs/general-param/notes">三、文档说明</router-link></td></tr>
          <tr><td><strong>还有哪些没定</strong></td><td><router-link to="/docs/general-param/appendix">七、附录：待决事项</router-link></td></tr>
        </tbody>
      </table>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../docs/components/DocShell.vue'
import { generalParamChapters } from '../../docs/generalParamChapters.js'

const chapters = generalParamChapters

const tocItems = [
  { id: 'gp-nav', label: '章节导航' },
  { id: 'gp-how', label: '怎么读' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '模块化薪酬' }
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
.chapter-card-arrow { flex-shrink: 0; color: hsl(var(--muted-foreground)); font-size: 12px; }
</style>
