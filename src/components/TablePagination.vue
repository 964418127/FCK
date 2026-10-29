<template>
  <div v-if="total > 0" class="table-pagination">
    <el-pagination
      :current-page="page"
      :page-size="pageSize"
      :total="total"
      :page-sizes="pageSizes"
      :layout="compact ? 'total, prev, pager, next' : 'total, sizes, prev, pager, next'"
      :small="compact"
      background
      @update:current-page="v => emit('update:page', v)"
      @update:page-size="v => emit('update:pageSize', v)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

/**
 * 表格页脚分页条（右对齐）。配合 usePager 使用：
 *   const { page, pageSize, total, rows } = usePager(list)
 *   <TablePagination v-model:page="page" v-model:page-size="pageSize" :total="total" />
 * 数据为空时整条不显示，避免空表下面挂一条「共 0 条」。
 */
const props = defineProps({
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 },
  total: { type: Number, default: 0 },
  pageSizes: { type: Array, default: () => [10, 20, 50] },
  compact: { type: Boolean, default: false }
})
const emit = defineEmits(['update:page', 'update:pageSize'])

const pageSizes = computed(() => props.pageSizes)
</script>

<style scoped>
.table-pagination {
  display: flex;
  justify-content: flex-end;
  padding: 10px 2px 2px;
}
.table-pagination :deep(.el-pagination) { --el-pagination-font-size: 12.5px; }
</style>
