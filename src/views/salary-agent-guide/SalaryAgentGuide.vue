<template>
  <DocShell
    :toc-items="tocItems"
    title="薪酬查询 Agent · 产品需求说明"
    subtitle="员工对【自己】薪酬的查询与求证：两类信息、三道围墙、单独入口【薪酬咨询助手】、常乐豆账户级汇总"
    version="v1.1"
    date="2026-11-24"
    :breadcrumbs="breadcrumbs"
  >
    <div id="sa-nav" class="section">
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
        六、功能详细说明（<strong>6.1 查询范围 / 6.2 围墙 / 6.3 回答口径</strong>）；
        七、附录（<strong>7.1 待决事项 / 7.2 清单·客户经理 / 7.3 清单·全职推拿师 / 7.4 清单·非全推拿师</strong>）。
      </div>
    </div>

    <div id="sa-how" class="section">
      <div class="section-header">
        <h2>怎么读</h2>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 190px;">你要找的</th><th>去哪看</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>为什么做这个 Agent</strong></td><td><router-link to="/docs/salary-agent/background">四、需求背景</router-link></td></tr>
          <tr><td><strong>员工能查什么</strong></td><td>6.1 查询范围与两类信息</td></tr>
          <tr><td><strong>围墙怎么设计</strong></td><td>6.2 围墙与字段裁剪</td></tr>
          <tr><td><strong>哪些岗位能查</strong></td><td>五、需求范围 · 岗位覆盖</td></tr>
          <tr><td><strong>常乐豆的组成怎么答</strong></td><td>6.1 查询范围与两类信息（高风险期只给账户级汇总）</td></tr>
          <tr><td><strong>社保/公积金/个税怎么答</strong></td><td>6.3 回答口径与人工出口</td></tr>
          <tr><td><strong>各岗位现在用哪些薪酬项、哪些是常乐豆</strong></td><td>7.2 客户经理清单 / 7.3 全职推拿师清单 / 7.4 非全推拿师清单</td></tr>
          <tr><td><strong>某个名词是什么意思</strong></td><td><router-link to="/docs/salary-agent/notes">三、文档说明</router-link></td></tr>
          <tr><td><strong>还有哪些没定</strong></td><td><router-link to="/docs/salary-agent/7-1">7.1 待决事项</router-link></td></tr>
        </tbody>
      </table>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../docs/components/DocShell.vue'
import { salaryAgentChapters } from '../../docs/salaryAgentChapters.js'

const chapters = salaryAgentChapters

const tocItems = [
  { id: 'sa-nav', label: '章节导航' },
  { id: 'sa-how', label: '怎么读' }
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
