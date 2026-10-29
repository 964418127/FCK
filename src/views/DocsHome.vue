<template>
  <div class="docs-home">
    <!-- 页头 -->
    <header class="home-hero">
      <div class="hero-eyebrow">文档中心</div>
      <h1 class="hero-title">需求写在这里，能点的去原型</h1>
      <p class="hero-desc">
        产品需求的长期文档：规则、口径、边界、待决事项。每份文档按公司 PRD 模板分章，
        一章一页；能点能走查的交互放原型，文档里只留一句指针。
      </p>
      <div class="hero-meta">
        <span><strong>{{ totalDocs }}</strong> 份文档</span>
        <span class="dot">·</span>
        <span><strong>{{ groups.length }}</strong> 个业务域</span>
        <span class="dot">·</span>
        <span>最近更新 <strong>{{ latestUpdate }}</strong></span>
      </div>
    </header>

    <!-- 业务域分组 -->
    <section v-for="g in groups" :key="g.key" class="group">
      <div class="group-head">
        <h2>{{ g.label }}</h2>
        <span class="group-desc">{{ g.desc }}</span>
      </div>
      <div class="card-grid">
        <router-link v-for="d in g.docs" :key="d.path" :to="d.path" class="card">
          <div class="card-top">
            <span class="card-title">{{ d.title }}</span>
            <span v-if="d.meta" class="card-meta">{{ d.meta }}</span>
          </div>
          <p class="card-desc">{{ d.desc }}</p>
          <div class="card-foot">
            <span class="card-scope">{{ d.scope }}</span>
            <span class="card-arrow">进入 →</span>
          </div>
        </router-link>
      </div>
    </section>

    <!-- 按目的找 -->
    <section class="block">
      <div class="block-head">
        <h2>按目的找</h2>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 190px;">你要做的事</th><th>去哪</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>查一条规则怎么定</strong></td><td>对应文档的功能章节正文：阈值、算法、谁负责、什么不做</td></tr>
          <tr><td><strong>看某个页面怎么操作</strong></td><td>同一份文档的 <code>x.y</code> 小节，或页面顶部「功能入口」给的原型地址</td></tr>
          <tr><td><strong>搞清楚为什么这么定</strong></td><td>该文档的「需求背景 / 需求范围」两章；跨角色的取舍通常在范围表里</td></tr>
          <tr><td><strong>看还有什么没定</strong></td><td>该文档最后一章「附录：待决事项」——写明归属方与卡在哪</td></tr>
        </tbody>
      </table>
    </section>

    <!-- 写文档的约定 -->
    <section class="block">
      <div class="block-head">
        <h2>这里的文档怎么组织</h2>
      </div>
      <ul class="rule-list">
        <li>
          <span class="rule-i">01</span>
          <div>
            <strong>一份文档一张菜单，按章拆页</strong>
            <p>章不够放时用 <code>x.y</code> 做页内小节，不再另起一份「某端功能说明」；端级差异写在对应章节里。</p>
          </div>
        </li>
        <li>
          <span class="rule-i">02</span>
          <div>
            <strong>每条硬规则只在一处定义</strong>
            <p>别处需要时只写一句「见 x.y」，不复制叙述 —— 避免同一口径两处各写一遍、改一处漏一处。</p>
          </div>
        </li>
        <li>
          <span class="rule-i">03</span>
          <div>
            <strong>原型页不放文档性内容</strong>
            <p>边界、口径、待决事项只写在文档；原型只留功能性短提示，保证走查时看到的是界面而不是文章。</p>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { docGroups } from '../docs/docCatalog.js'
import { isMenuVisible } from '../composables/useGateConfig.js'

// 卡片跟随 /gate 菜单配置：被隐藏的文档不在目录页留空入口
const groups = computed(() =>
  docGroups
    .map(g => ({ ...g, docs: g.docs.filter(d => isMenuVisible(d.gateId)) }))
    .filter(g => g.docs.length)
)

const totalDocs = computed(() => groups.value.reduce((n, g) => n + g.docs.length, 0))

const latestUpdate = computed(() => {
  const all = groups.value.flatMap(g => g.docs.map(d => d.updated)).filter(Boolean).sort()
  return all.length ? all[all.length - 1] : '—'
})
</script>

<style scoped>
.docs-home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 8px 4px 64px;
}

/* ===== 页头 ===== */
.home-hero {
  padding: 26px 28px 24px;
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  background: linear-gradient(135deg, hsl(var(--primary) / 0.06), transparent 62%), hsl(var(--muted) / 0.22);
  margin-bottom: 34px;
}
.hero-eyebrow {
  font-size: 11.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: hsl(var(--primary));
  font-weight: 600;
}
.hero-title {
  margin: 8px 0 10px;
  font-size: 25px;
  line-height: 1.35;
  font-weight: 650;
  color: hsl(var(--foreground));
}
.hero-desc {
  margin: 0;
  max-width: 760px;
  font-size: 13.5px;
  line-height: 1.8;
  color: hsl(var(--muted-foreground));
}
.hero-meta {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: hsl(var(--muted-foreground));
}
.hero-meta strong { color: hsl(var(--foreground)); font-weight: 600; }
.hero-meta .dot { opacity: 0.45; }

/* ===== 分组 ===== */
.group { margin-bottom: 34px; }
.group-head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid hsl(var(--border));
}
.group-head h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 650;
  color: hsl(var(--foreground));
}
.group-desc {
  font-size: 12.5px;
  color: hsl(var(--muted-foreground));
}

/* ===== 卡片 ===== */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}
.card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 18px;
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  background: hsl(var(--background));
  text-decoration: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}
.card:hover {
  border-color: hsl(var(--primary) / 0.45);
  box-shadow: 0 4px 14px hsl(var(--primary) / 0.08);
  transform: translateY(-1px);
}
.card-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}
.card-title {
  font-size: 14.5px;
  font-weight: 650;
  color: hsl(var(--foreground));
}
.card-meta {
  flex-shrink: 0;
  font-size: 11px;
  padding: 1px 7px;
  border-radius: 9px;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--muted) / 0.6);
}
.card-desc {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.7;
  color: hsl(var(--muted-foreground));
  flex: 1;
}
.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11.5px;
  color: hsl(var(--muted-foreground) / 0.9);
}
.card-arrow { color: hsl(var(--primary)); font-weight: 600; }

/* ===== 通用块 ===== */
.block { margin-bottom: 30px; }
.block-head { margin-bottom: 12px; }
.block-head h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 650;
  color: hsl(var(--foreground));
}

.rule-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.rule-list li {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 14px 16px;
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  background: hsl(var(--muted) / 0.18);
}
.rule-i {
  flex-shrink: 0;
  font-size: 11.5px;
  font-weight: 700;
  color: hsl(var(--primary) / 0.7);
  letter-spacing: 0.06em;
  padding-top: 2px;
}
.rule-list strong { font-size: 13.5px; color: hsl(var(--foreground)); }
.rule-list p {
  margin: 4px 0 0;
  font-size: 12.5px;
  line-height: 1.7;
  color: hsl(var(--muted-foreground));
}
.rule-list code {
  font-size: 11.5px;
  padding: 1px 5px;
  border-radius: 4px;
  background: hsl(var(--muted) / 0.7);
}

/* data-table 若页面未加载全局样式，这里兜一层 */
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.data-table th,
.data-table td {
  border: 1px solid hsl(var(--border));
  padding: 8px 12px;
  text-align: left;
  vertical-align: top;
  line-height: 1.7;
}
.data-table th {
  background: hsl(var(--muted) / 0.45);
  font-weight: 600;
  color: hsl(var(--foreground));
}
.data-table td { color: hsl(var(--muted-foreground)); }
.data-table td strong { color: hsl(var(--foreground)); }
</style>
