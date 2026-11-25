<template>
  <!-- 宽屏：手机面板容器 -->
  <div v-if="isWide" class="m-shell-backdrop">
    <div class="m-shell">
      <div class="m-shell-screen">
        <div class="m-shell-body">
          <slot />
        </div>
      </div>
    </div>
  </div>
  <!-- 窄屏 / 真机：保持全屏 -->
  <div v-else class="m-shell-plain">
    <slot />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const mq = window.matchMedia('(min-width: 768px)')
const isWide = ref(mq.matches)

const onChange = (e) => { isWide.value = e.matches }

onMounted(() => mq.addEventListener('change', onChange))
onBeforeUnmount(() => mq.removeEventListener('change', onChange))
</script>

<style scoped>
/* ── 宽屏容器 ── */
.m-shell-backdrop {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px 24px;
  background:
    radial-gradient(1200px 600px at 70% -10%, #f6e3ea 0%, rgba(246, 227, 234, 0) 60%),
    linear-gradient(180deg, #f3ecef 0%, #e9e0e4 100%);
}

/* 手机外框（深色边框即「机身」）。
   transform 使本框成为内部 fixed 元素的包含块：
   页面里的 fixed 底部操作条 / inset:0 弹层遮罩全部收进面板内 */
.m-shell {
  transform: translateZ(0);
  width: 412px;
  max-width: 100%;
  height: min(860px, 100%);
  min-height: 520px;
  background: #1d1418;
  border-radius: 52px;
  padding: 11px;
  box-shadow:
    0 40px 90px rgba(60, 20, 35, 0.35),
    0 8px 24px rgba(60, 20, 35, 0.18),
    inset 0 0 0 2px #3a2a31;
}

/* 屏幕：overflow hidden 负责把弹层遮罩裁进圆角 */
.m-shell-screen {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 42px;
  overflow: hidden;
  background: #fff;
}

/* 内部滚动区（隐藏滚动条，保留滚动） */
.m-shell-body {
  height: 100%;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
}

.m-shell-body::-webkit-scrollbar {
  display: none;
}

/* 页面内部自滚动容器（height:100vh 自滚页）的滚动条同样收掉 */
.m-shell-body :deep(*) {
  scrollbar-width: none;
}

.m-shell-body :deep(*)::-webkit-scrollbar {
  display: none;
}

/* 页面根节点两类高度写法（min-height:100vh / height:100vh 自滚动）统一收进面板 */
.m-shell-body > :deep(*) {
  min-height: 100% !important;
  height: 100% !important;
}

/* ── 窄屏：不加任何壳 ── */
.m-shell-plain {
  width: 100%;
  min-height: 100vh;
}
</style>
