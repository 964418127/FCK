<template>
  <el-button size="small" plain class="copy-section-btn" @click="handleClick">
    <span style="margin-right: 4px;">📋</span>复制章节
  </el-button>
</template>

<script setup>
import { useDocCopy } from '../composables/useDocCopy.js'

const props = defineProps({
  sectionId: { type: String, required: true }
})

const { copySectionAsHtml } = useDocCopy()
const handleClick = () => copySectionAsHtml(props.sectionId)
</script>
