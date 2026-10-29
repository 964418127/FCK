<template>
  <div class="doc-screens">
    <div class="ds-label">{{ label }}</div>
    <div class="ds-row" :class="{ single: images.length === 1, phone: mode === 'phone' }">
      <div v-for="(img, i) in images" :key="i" class="ds-item">
        <el-image
          :src="img.src"
          :preview-src-list="srcList"
          :initial-index="i"
          preview-teleported
          hide-on-click-modal
          fit="cover"
          class="ds-img"
          :alt="img.label"
        />
        <span v-if="img.label" class="ds-cap">{{ img.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

/**
 * 文档「功能页面示例」：原型界面截图（?shot=1 收起侧边栏的模式截的图）并排嵌入，
 * 点击进大图预览。对应手写 PRD 里「功能入口 → 功能页面示例 → 功能说明」的版式。
 * 用法：
 *   <DocScreens :images="[{ src: quotaList, label: '方案库' }, { src: quotaDrawer, label: '方案配置抽屉' }]" />
 * 截图产出：node scripts/doc-shot.js "http://localhost:5178/xxx?shot=1" src/docs/assets/pages/xxx.png
 */
const props = defineProps({
  images: { type: Array, required: true }, // [{ src, label? }]
  label: { type: String, default: '功能页面示例' },
  mode: { type: String, default: 'desktop' } // desktop | phone（移动端截图用竖版窄图）
})

const srcList = computed(() => props.images.map(i => i.src))
</script>

<style scoped>
.doc-screens { margin: 10px 0 16px; }
.ds-label { font-size: 13px; font-weight: 500; color: hsl(var(--foreground)); margin-bottom: 8px; }
.ds-row { display: flex; gap: 12px; }
.ds-row.single .ds-item { max-width: 720px; }
.ds-item { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.ds-img {
  width: 100%; height: 200px; cursor: zoom-in;
  border: 1px solid hsl(var(--border)); border-radius: 8px; overflow: hidden;
  background: hsl(var(--muted) / 0.3);
}
.ds-img :deep(img) { width: 100%; height: 100%; object-fit: cover; object-position: top left; transition: height .15s; }
.ds-item:hover .ds-img { border-color: hsl(var(--primary) / 0.45); }
.ds-row.phone { flex-wrap: wrap; gap: 14px; }
.ds-row.phone .ds-item { flex: 0 0 208px; max-width: 208px; }
.ds-row.phone .ds-img { height: 400px; }
.ds-row.phone .ds-img :deep(img) { object-fit: cover; object-position: top center; }
.ds-cap { font-size: 11.5px; color: hsl(var(--muted-foreground)); }
</style>
