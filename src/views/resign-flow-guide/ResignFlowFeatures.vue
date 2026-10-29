<template>
  <DocShell
    :toc-items="tocItems"
    title="六、功能详细说明"
    subtitle="6.1 是上线前的配置，6.2–6.6 才是一条离职单的流程顺序；规则与口径写在章正文，逐页操作写在同一章的 6.x.y 小节"
    version="v0.3"
    date="2026-10-26"
    :breadcrumbs="breadcrumbs"
  >
    <!-- 本章结构 -->
    <div id="rf-ch-structure" class="section">
      <div class="section-header">
        <h2>本章怎么组织</h2>
      </div>
      <p class="doc-p">
        每个功能章节只讲<strong>一个流程节点或一类单据</strong>，页面顺序固定：先给功能入口与定位，再按
        <strong>6.x.y</strong> 拆到「谁在用 → 看到什么能做什么 → 校验与提示 → 提交后 → 边界」。
        规则、算法、阈值只写在所属章节，别处需要时只留一句「见 6.x」，不重复叙述。
        <br /><strong>顺序规则只有一个：配置在前、单据在后。</strong>没有模板就没有发起时的快照，
        所以 6.1 排最前；6.2–6.6 才是按时间的流程链路。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">层级</th><th>写什么</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>6.x</strong></td><td>这个环节是什么、为什么这么定、算法与阈值、谁负责、什么不做</td></tr>
          <tr><td><strong>6.x.y</strong></td><td>具体页面：控件与字段、按钮什么时候可点、提示文案、提交后去向</td></tr>
          <tr><td><strong>功能入口</strong></td><td>每章开头给可点的原型地址，走查从这一行进</td></tr>
          <tr><td><strong>章节顺序</strong></td><td><strong>配置（6.1）在前，单据流程（6.2–6.6）在后</strong>；配置类章节不占单据时间线的位置</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>前置配置：</strong>离职流程模板（审核链 + 交接节点 + 系统检查项）→ <strong>6.1</strong>，配完才可能发起。
        <br /><strong>单据链路：</strong>发起（6.2）→ 离职需求审核（6.3）→ 逐节点交接确认（6.1.4）→ 办结自动推送离职合同（6.4）→ 次月计算与发放（6.5）→ 下游交付（6.6）。
        被动离职由异常监控解除用工，不走签署。
      </div>
    </div>

    <!-- 章节列表 -->
    <div id="rf-ch-list" class="section">
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
import { featureChapters } from '../../docs/resignChapters.js'

// 6.1–6.6：卡片直接由章节元数据生成
const chapters = featureChapters
  .map(ch => ({ id: ch.id, no: ch.no, title: ch.title, desc: ch.subtitle, path: ch.path }))
  .sort((a, b) => Number(a.no.split('.')[1]) - Number(b.no.split('.')[1]))

const tocItems = [
  { id: 'rf-ch-structure', label: '本章怎么组织' },
  { id: 'rf-ch-list', label: '章节列表' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '离职流程', to: '/docs/resign-flow' },
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
