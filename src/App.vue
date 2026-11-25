<template>
  <router-view v-slot="{ Component, route }">
    <mobile-shell v-if="isMobileRoute(route.path)">
      <component :is="Component" />
    </mobile-shell>
    <component :is="Component" v-else />
  </router-view>
</template>

<script setup>
import MobileShell from './components/MobileShell.vue'

// 移动端路由判定：/mobile-* 与 /v2/m、/v3/m、/v4/m、/v5/m 系列
const isMobileRoute = (path) =>
  path.startsWith('/mobile') || /\/m(\/|$)/.test(path)
</script>

<style>
/* App 组件样式已移至全局样式文件 */
#app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>
