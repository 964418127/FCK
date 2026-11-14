<template>
  <div class="v2-phase1-guide">
    <FloatingToc :items="tocItems" />

    <div class="doc-hero">
      <div class="doc-hero-icon">
        <el-icon :size="28"><Document /></el-icon>
      </div>
      <div class="doc-hero-body">
        <div class="doc-hero-title-row">
          <h1 class="doc-hero-title">{{ title }}</h1>
          <span v-if="version" class="doc-hero-version">{{ version }}</span>
          <span v-if="date" class="doc-hero-date">{{ date }}</span>
        </div>
        <p v-if="subtitle" class="doc-hero-tip" v-html="subtitle"></p>
        <div v-if="breadcrumbs && breadcrumbs.length" class="doc-hero-breadcrumbs">
          <span v-for="(b, i) in breadcrumbs" :key="i">
            <router-link v-if="b.to" :to="b.to">{{ b.label }}</router-link>
            <span v-else>{{ b.label }}</span>
            <span v-if="i < breadcrumbs.length - 1" class="crumb-sep">/</span>
          </span>
        </div>
      </div>
      <div class="doc-hero-actions">
        <el-button @click="copyToClipboard">复制</el-button>
        <el-button type="primary" @click="exportToPdf">导出 PDF</el-button>
      </div>
    </div>

    <div class="content-section" @click="onDocSvgClick">
      <slot />
    </div>

    <div v-if="lightbox" class="doc-lightbox" @click="closeLightbox">
      <div class="doc-lightbox-panel" @click.stop>
        <div class="doc-lightbox-body" v-html="lightbox.html"></div>
      </div>
      <div class="doc-lightbox-hint">点击空白处或按 Esc 关闭</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Document } from '@element-plus/icons-vue'
import FloatingToc from '../../components/FloatingToc.vue'
import { useDocCopy } from '../composables/useDocCopy.js'

defineProps({
  tocItems: { type: Array, required: true },
  title: { type: String, required: true },
  subtitle: String,
  version: String,
  date: String,
  breadcrumbs: { type: Array, default: () => [] }
})

const { copyToClipboard, exportToPdf } = useDocCopy()

/* ===== 查看大图：点击正文里的文档图，克隆原尺寸弹出 ===== */
const lightbox = ref(null)

function onDocSvgClick(e) {
  const svg = e.target.closest('svg')
  if (!svg) return
  const rect = svg.getBoundingClientRect()
  if (rect.width < 300 || rect.height < 120) return
  const vb = svg.getAttribute('viewBox')
  let w = rect.width
  let h = rect.height
  if (vb) {
    const p = vb.split(/[\s,]+/).map(Number)
    if (p.length === 4 && p[2] > 0 && p[3] > 0) { w = p[2]; h = p[3] }
  }
  const maxW = Math.min(window.innerWidth * 0.92, 1180)
  const maxH = window.innerHeight * 0.86
  const scale = Math.min(maxW / w, maxH / h, 2.4)
  const clone = svg.cloneNode(true)
  clone.removeAttribute('class')
  clone.setAttribute('width', Math.round(w * scale))
  clone.setAttribute('height', Math.round(h * scale))
  clone.style.display = 'block'
  lightbox.value = { html: clone.outerHTML }
  document.body.style.overflow = 'hidden'
}

function closeLightbox() {
  lightbox.value = null
  document.body.style.overflow = ''
}

function onKeydown(e) {
  if (e.key === 'Escape' && lightbox.value) closeLightbox()
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<style>
/* ===== 共享布局（不 scoped，子页 slot 内容继承） ===== */
.v2-phase1-guide { padding: 0; max-width: 1400px; margin: 0 auto; }
/* 宽账表页：flex 子项默认 min-width:auto 会被表撑开、再被父级 overflow:hidden 裁掉，
   只有含 .ledger-wrap 的页放开收缩，让宽表在自身容器里横向滚动 */
.main-content > *:has(.ledger-wrap) { min-width: 0; width: 100%; max-width: 100%; }

/* 面包屑 */
.v2-phase1-guide .doc-hero-breadcrumbs {
  margin-top: 6px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}
.v2-phase1-guide .doc-hero-breadcrumbs a {
  color: hsl(var(--primary));
  text-decoration: none;
}
.v2-phase1-guide .doc-hero-breadcrumbs a:hover {
  text-decoration: underline;
}
.v2-phase1-guide .crumb-sep { margin: 0 6px; opacity: 0.6; }

/* 章节头 + 复制按钮 */
.v2-phase1-guide .section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.v2-phase1-guide .section-header h2 { margin: 0; }
.v2-phase1-guide .copy-section-btn { flex-shrink: 0; }

/* 文档 Hero 区 */
.v2-phase1-guide .doc-hero {
  background: linear-gradient(135deg, hsl(var(--primary) / 0.06) 0%, hsl(var(--primary) / 0.02) 100%);
  border: 1px solid hsl(var(--primary) / 0.12);
  border-radius: 12px;
  padding: 24px 28px;
  margin: 20px 0 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  overflow: hidden;
}

.v2-phase1-guide .doc-hero::before {
  content: '';
  position: absolute;
  top: -80px;
  right: -80px;
  width: 240px;
  height: 240px;
  background: radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 65%);
  pointer-events: none;
}

.v2-phase1-guide .doc-hero-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-hover)) 100%);
  color: hsl(var(--primary-foreground));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px hsl(var(--primary) / 0.25);
  z-index: 1;
}

.v2-phase1-guide .doc-hero-body {
  flex: 1;
  min-width: 0;
  z-index: 1;
}

.v2-phase1-guide .doc-hero-title-row {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;
}

.v2-phase1-guide .doc-hero-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: hsl(var(--foreground));
  line-height: 1.2;
}

.v2-phase1-guide .doc-hero-version {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  font-size: 12px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 10px;
  white-space: nowrap;
}

.v2-phase1-guide .doc-hero-date {
  color: hsl(var(--muted-foreground));
  font-size: 13px;
  white-space: nowrap;
}

.v2-phase1-guide .doc-hero-tip {
  margin: 0;
  color: hsl(var(--muted-foreground));
  font-size: 14px;
  line-height: 1.5;
}

.v2-phase1-guide .doc-hero-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  z-index: 1;
  align-self: flex-start;
}

.v2-phase1-guide .content-section {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  padding: 24px 28px;
}

/* ===== 文档图基线：图按 680 设计宽度 1:1 渲染，不再跟随正文列拉满 =====
   之前 .doc-svg 一律 width:100%，高瘦图被放大 1.3-1.5 倍、占满一屏；
   锁到 680 后图内 11-12px 文字即真实字号，短宽图不受影响 */
.v2-phase1-guide .content-section svg.doc-svg,
.v2-phase1-guide .content-section svg.v5-tl {
  max-width: 680px;
  margin-left: auto;
  margin-right: auto;
}
.v2-phase1-guide .content-section svg.doc-svg {
  margin-top: 4px;
  margin-bottom: 8px;
}
/* 正文里的大图可点击放大 */
.v2-phase1-guide .content-section svg.doc-svg,
.v2-phase1-guide .content-section svg.v5-tl,
.v2-phase1-guide .content-section svg.arch-svg {
  cursor: zoom-in;
}

/* ===== 查看大图（灯箱）：白底面板，等比放大到整屏可读，Esc / 点空白关闭 ===== */
.doc-lightbox {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: rgba(22, 22, 26, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.doc-lightbox-panel {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  max-width: 94vw;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.28);
}
.doc-lightbox-body svg { max-width: 100%; height: auto; }
.doc-lightbox-hint {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 16px;
  text-align: center;
  color: rgba(255, 255, 255, 0.85);
  font-size: 12px;
  pointer-events: none;
}

.v2-phase1-guide .section { margin-bottom: 40px; }

.v2-phase1-guide .section h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid hsl(var(--primary));
}

.v2-phase1-guide .section h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 20px 0 12px 0;
  color: hsl(var(--foreground));
}

.v2-phase1-guide .callout { line-height: 1.6; }
.v2-phase1-guide .callout strong { color: hsl(var(--warning)); }

.v2-phase1-guide .data-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-size: 13px;
  margin: 12px 0;
}

.v2-phase1-guide .data-table th,
.v2-phase1-guide .data-table td {
  border: 1px solid hsl(var(--border));
  padding: 8px 12px;
  text-align: left;
  vertical-align: top;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.v2-phase1-guide .data-table th {
  background: hsl(var(--muted) / 0.5);
  font-weight: 600;
  color: hsl(var(--foreground));
}

.v2-phase1-guide .card {
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  padding: 16px 20px;
  margin: 12px 0;
  background: hsl(var(--background));
}

.v2-phase1-guide .note {
  background: hsl(var(--muted) / 0.3);
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 13px;
  line-height: 1.7;
  margin: 8px 0;
}

/* ===== 8 步全链路架构图 ===== */
.v2-phase1-guide .architecture-card h2 {
  margin: 0 0 16px 0;
  font-size: 18px;
  border-bottom: none;
  padding-bottom: 0;
}

.v2-phase1-guide .architecture-diagram {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 0;
}

.v2-phase1-guide .arch-layer {
  width: 100%;
  max-width: 700px;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.v2-phase1-guide .arch-layer-title {
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin-bottom: 8px;
}

.v2-phase1-guide .arch-arrow {
  font-size: 20px;
  color: hsl(var(--muted-foreground));
  line-height: 1;
}

/* ===== 计算节点流程图 ===== */
.v2-phase1-guide .flow {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 16px 0;
  overflow-x: auto;
}

.v2-phase1-guide .flow-step {
  flex: 1;
  min-width: 180px;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  padding: 16px;
}

.v2-phase1-guide .flow-step .step-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
  color: hsl(var(--primary));
}

.v2-phase1-guide .flow-step .step-content {
  font-size: 13px;
  line-height: 1.7;
  color: hsl(var(--foreground));
}

.v2-phase1-guide .flow-step .step-content p { margin: 4px 0; }
.v2-phase1-guide .flow-step .step-content ul { margin: 6px 0; padding-left: 16px; }
.v2-phase1-guide .flow-step .step-content li { margin: 2px 0; }
.v2-phase1-guide .flow-step .step-content strong { color: hsl(var(--foreground)); }
.v2-phase1-guide .flow-step .step-content em { color: hsl(var(--muted-foreground)); font-style: normal; }

.v2-phase1-guide .flow-arrow {
  font-size: 24px;
  color: hsl(var(--muted-foreground));
  line-height: 80px;
  flex-shrink: 0;
}

.v2-phase1-guide .feature-list { margin: 12px 0; padding-left: 20px; }
.v2-phase1-guide .feature-list li { margin-bottom: 8px; }

.v2-phase1-guide .example { font-size: 14px; }

.v2-phase1-guide .calc-steps { margin: 12px 0; padding-left: 20px; }
.v2-phase1-guide .calc-steps li { margin-bottom: 6px; }

.v2-phase1-guide .highlight { color: hsl(var(--primary)); font-weight: 600; }

/* 决策树 */
.v2-phase1-guide .decision-tree { font-size: 14px; line-height: 1.8; }

.v2-phase1-guide .tree-node {
  display: inline-block;
  background: hsl(var(--muted) / 0.3);
  border-radius: 6px;
  padding: 8px 14px;
  font-weight: 500;
  margin: 4px 0;
}

.v2-phase1-guide .tree-node.root {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  font-weight: 600;
  font-size: 15px;
  border-radius: 8px;
}

.v2-phase1-guide .tree-children {
  margin-left: 20px;
  border-left: 2px dashed hsl(var(--border));
  padding-left: 16px;
  margin-top: 8px;
  margin-bottom: 8px;
}

.v2-phase1-guide .tree-question {
  color: hsl(var(--foreground));
  font-style: italic;
  font-weight: 500;
  margin: 10px 0 6px 0;
  font-size: 14px;
}

.v2-phase1-guide .tree-question::before {
  content: '◆ ';
  color: hsl(var(--primary));
  font-style: normal;
}

.v2-phase1-guide .tree-leaf {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
  padding: 6px 12px;
  margin: 4px 0;
  display: inline-block;
  font-size: 13px;
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.v2-phase1-guide .tree-leaf.primary {
  background: hsl(var(--primary) / 0.1);
  border-color: hsl(var(--primary));
  color: hsl(var(--primary));
  font-weight: 600;
}

.v2-phase1-guide .tree-leaf.muted {
  color: hsl(var(--muted-foreground));
  font-style: italic;
}

.v2-phase1-guide .tree-leaf-sub {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  padding: 2px 0;
  display: block;
}

/* 泳道图 */
.v2-phase1-guide .swimlane-container {
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  overflow: hidden;
  margin: 16px 0;
}

.v2-phase1-guide .swimlane-row {
  display: flex;
  border-bottom: 1px solid hsl(var(--border));
}

.v2-phase1-guide .swimlane-row:last-child { border-bottom: none; }
.v2-phase1-guide .swimlane-row.highlight-row { background: hsl(var(--primary) / 0.05); }
.v2-phase1-guide .swimlane-row.split-row { background: hsl(var(--muted) / 0.3); }

.v2-phase1-guide .swimlane-lane {
  width: 100px;
  flex-shrink: 0;
  background: hsl(var(--primary) / 0.1);
  padding: 16px 8px;
  text-align: center;
  font-weight: 600;
  font-size: 13px;
  border-right: 1px solid hsl(var(--border));
  display: flex;
  align-items: center;
  justify-content: center;
}

.v2-phase1-guide .swimlane-content {
  flex: 1;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.v2-phase1-guide .swimlane-arrow {
  text-align: center;
  font-size: 18px;
  color: hsl(var(--muted-foreground));
  padding: 4px 0;
  background: hsl(var(--muted) / 0.2);
}

.v2-phase1-guide .flow-step-inline {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 13px;
  display: inline-block;
  align-self: flex-start;
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.v2-phase1-guide .flow-step-inline.primary {
  background: hsl(var(--primary) / 0.15);
  border-color: hsl(var(--primary));
  color: hsl(var(--primary));
  font-weight: 600;
}

.v2-phase1-guide .flow-step-inline.muted {
  color: hsl(var(--muted-foreground));
  background: transparent;
  border-style: dashed;
}

.v2-phase1-guide .split-content {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 8px;
}

.v2-phase1-guide .split-item {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
  padding: 8px 12px;
}

.v2-phase1-guide .split-title {
  font-weight: 600;
  font-size: 13px;
  color: hsl(var(--primary));
  margin-bottom: 2px;
}

.v2-phase1-guide .split-desc {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  line-height: 1.5;
}
</style>
