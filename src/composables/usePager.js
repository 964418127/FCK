import { computed, ref, watch } from 'vue'

/**
 * 表格分页的最小实现：把一个「已筛选好的列表」切成当前页。
 *
 * 用法（页面里）：
 *   const { page, pageSize, total, rows } = usePager(filteredData)
 *   <el-table :data="rows"> …
 *   <TablePagination v-model:page="page" v-model:page-size="pageSize" :total="total" />
 *
 * 约定：
 *  · 传进来的是 computed 列表（筛选 / 排序后的结果），分页只切片、不改数据；
 *  · 数据变少（换筛选条件）时页码自动收敛到最后一页，不会停在空页；
 *  · 默认每页 10 条，可在页脚切换 10 / 20 / 50。
 */
export function usePager(source, size = 10) {
  const page = ref(1)
  const pageSize = ref(size)
  const total = computed(() => (Array.isArray(source?.value) ? source.value.length : 0))
  const rows = computed(() => {
    const list = source?.value || []
    const start = (page.value - 1) * pageSize.value
    return list.slice(start, start + pageSize.value)
  })

  watch([total, pageSize], () => {
    const max = Math.max(1, Math.ceil(total.value / pageSize.value))
    if (page.value > max) page.value = max
  })

  return { page, pageSize, total, rows }
}
