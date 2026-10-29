<template>
  <figure class="doc-figure">
    <!-- 收起态：一条 ~48px 的横条。左侧缩略图常驻可见（不是只有一条链接），
         点击整条展开 / 收起，不跳离文档 -->
    <div class="df-bar" role="button" tabindex="0" @click="open = !open" @keydown.enter="open = !open">
      <img :src="src" class="df-thumb" alt="" aria-hidden="true" />
      <span class="df-tag">参考图</span>
      <span class="df-title">{{ title }}</span>
      <span v-if="note" class="df-note">{{ note }}</span>
      <span class="df-spacer" />
      <a
        v-if="href"
        :href="href"
        target="_blank"
        rel="noopener"
        class="df-ext"
        :title="hrefLabel"
        @click.stop
      >{{ hrefLabel }} ↗</a>
      <span class="df-toggle">{{ open ? '收起' : '展开' }}<i class="df-arrow" :class="{ up: open }" /></span>
    </div>

    <!-- 展开态：图内嵌在文档里（不跳走）；点图进入大图预览可缩放 -->
    <div v-show="open" class="df-body">
      <el-image
        :src="src"
        :preview-src-list="[src]"
        preview-teleported
        hide-on-click-modal
        fit="contain"
        class="df-img"
        :alt="title"
      />
      <figcaption class="df-caption">图 · {{ title }}<template v-if="note"> —— {{ note }}</template></figcaption>
    </div>
  </figure>
</template>

<script setup>
import { ref } from 'vue'

/**
 * 文档内嵌参考图（收起不占地、展开即所见、点图可放大）。
 *  · src       图片地址（建议 `import img from '../assets/xx.png'`，让构建器带 base 重写，GitHub Pages 下不裂图）
 *  · title     参考图标题（条上与展开后的图注都用它）
 *  · note      一句话说明（选填，收起时截断显示在条上）
 *  · href      可选的原文 / 来源链接（选填，显示在条右侧）
 * 用法：
 *   <DocFigure :src="img" title="统一时间管理体系" note="分层设计参考" />
 */
const props = defineProps({
  src: { type: String, required: true },
  title: { type: String, required: true },
  note: { type: String, default: '' },
  href: { type: String, default: '' },
  hrefLabel: { type: String, default: '查看原文' },
  defaultOpen: { type: Boolean, default: false }
})

const open = ref(props.defaultOpen)
</script>

<style scoped>
.doc-figure { margin: 10px 0 16px; }

/* 收起态横条 */
.df-bar {
  display: flex; align-items: center; gap: 8px;
  width: 100%; padding: 6px 10px; cursor: pointer;
  background: hsl(var(--muted) / 0.4); border: 1px solid hsl(var(--border)); border-radius: 8px;
  transition: background .15s, border-color .15s;
}
.df-bar:hover { background: hsl(var(--muted) / 0.7); border-color: hsl(var(--primary) / 0.4); }
.df-thumb {
  width: 64px; height: 36px; object-fit: cover; border-radius: 4px; flex-shrink: 0;
  border: 1px solid hsl(var(--border)); background: hsl(var(--background));
}
.df-tag {
  flex-shrink: 0; font-size: 11px; padding: 1px 8px; border-radius: 9px;
  border: 1px solid hsl(var(--primary) / 0.35); background: hsl(var(--primary) / 0.08); color: hsl(var(--primary));
}
.df-title { font-size: 12.5px; font-weight: 500; color: hsl(var(--foreground)); white-space: nowrap; }
.df-note {
  font-size: 11.5px; color: hsl(var(--muted-foreground));
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.df-spacer { flex: 1; }
.df-ext { font-size: 11.5px; color: hsl(var(--primary)); text-decoration: none; flex-shrink: 0; }
.df-ext:hover { text-decoration: underline; }
.df-toggle {
  flex-shrink: 0; display: inline-flex; align-items: center; gap: 4px;
  font-size: 11.5px; color: hsl(var(--muted-foreground));
}
.df-arrow {
  width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent;
  border-top: 5px solid currentColor; transition: transform .15s;
}
.df-arrow.up { transform: rotate(180deg); }

/* 展开态 */
.df-body { margin-top: 8px; }
.df-img { width: 100%; border: 1px solid hsl(var(--border)); border-radius: 8px; overflow: hidden; }
.df-img :deep(img) { width: 100%; }
.df-caption { margin-top: 6px; font-size: 11.5px; color: hsl(var(--muted-foreground)); line-height: 1.6; }
</style>
