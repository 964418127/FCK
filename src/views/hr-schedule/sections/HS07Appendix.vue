<template>
  <DocShell
    :toc-items="[]"
    title="七、附录"
    subtitle=""
    version="v5.4"
    date="2026-11-18"
    :breadcrumbs="breadcrumbs"
  >
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事中心', to: '/docs/hr-schedule' },
  { label: '七、附录' }
]
</script>

<style scoped src="./doc-base.css"></style>
