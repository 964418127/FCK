<template>
  <div class="store-salary-strategy">
    <div class="page-header">
      <h1>数据源策略</h1>
    </div>

    <div class="content-section">
      <!-- 筛选区 -->
      <div class="search-section">
        <el-form :inline="true" class="demo-form-inline">
          <el-form-item label="搜索">
            <el-input v-model="searchForm.keyword" placeholder="策略名称/编号" clearable style="width: 200px;" />
          </el-form-item>
          <el-form-item label="适用岗位">
            <el-select v-model="searchForm.position" placeholder="选择" clearable style="width: 120px;">
              <el-option label="推拿师" value="推拿师" />
              <el-option label="客户经理" value="客户经理" />
            </el-select>
          </el-form-item>
          <el-form-item label="适用门店">
            <el-select v-model="searchForm.store" placeholder="选择" clearable style="width: 160px;">
              <el-option v-for="s in stores" :key="s.value" :label="s.label" :value="s.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="选择" clearable style="width: 100px;">
              <el-option label="生效中" value="生效中" />
              <el-option label="草稿" value="草稿" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 操作按钮 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button type="primary" @click="handleCreate">+ 新增数据源策略</el-button>
        </div>
      </div>

      <!-- 策略列表 -->
      <el-table :data="filteredList" stripe style="width: 100%; margin-top: 12px;">
        <el-table-column prop="id" label="编号" width="110" />
        <el-table-column prop="name" label="策略名称" min-width="220" />
        <el-table-column prop="position" label="岗位" width="100" />
        <el-table-column prop="coopMode" label="合作模式" width="140" />
        <el-table-column label="适用范围" min-width="200">
          <template #default="{ row }">
            <span v-if="!(row.personFilter?.conditions?.length)" class="range-text">所有人员（基础）</span>
            <span v-else>{{ row.personFilter.conditions.map(c => c.field + c.op + c.value).join('、') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="rules.length" label="规则数" width="80" align="center" />
        <el-table-column label="生效日期" width="200">
          <template #default="{ row }">
            {{ row.effectiveDate }} ~ {{ row.effectiveEndDate || '长期' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === '生效中' ? 'success' : 'info'" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleDetail(row)">详情</el-button>
            <el-button type="primary" size="small" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          background
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { storeSalaryStrategies, stores } from '../mock/storeSalaryStrategies.js'

const router = useRouter()

const searchForm = reactive({
  keyword: '', position: '', store: '', status: ''
})

const list = ref([...storeSalaryStrategies])

const filteredList = computed(() =>
  list.value.filter(item => {
    const matchKeyword = !searchForm.keyword ||
      item.name.includes(searchForm.keyword) || item.id.includes(searchForm.keyword)
    const matchPosition = !searchForm.position || item.position === searchForm.position
    const matchStore = !searchForm.store || (item.personFilter?.conditions || []).some(c => c.field === '门店' && c.value === searchForm.store)
    const matchStatus = !searchForm.status || item.status === searchForm.status
    return matchKeyword && matchPosition && matchStore && matchStatus
  })
)

const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })
watchEffect(() => { pagination.total = filteredList.value.length })

const handleReset = () => {
  searchForm.keyword = ''; searchForm.position = ''
  searchForm.store = ''; searchForm.status = ''
}



const handleDetail = (row) => router.push(`/store-salary-strategy/${row.id}`)
const handleEdit = (row) => router.push(`/store-salary-strategy/${row.id}?mode=edit`)

// 新增：直接跳转空白配置页，不再弹窗分步
const handleCreate = () => router.push('/store-salary-strategy/new?mode=edit')

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除策略「${row.name}」吗？`, '删除确认', {
    confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning'
  }).then(() => {
    const idx = list.value.findIndex(i => i.id === row.id)
    if (idx > -1) list.value.splice(idx, 1)
    const mIdx = storeSalaryStrategies.findIndex(i => i.id === row.id)
    if (mIdx > -1) storeSalaryStrategies.splice(mIdx, 1)
    ElMessage.success('已删除')
  }).catch(() => {})
}
</script>

<style scoped>
.store-salary-strategy { padding: 0; }
.page-header { margin-bottom: 20px; }
.page-header h1 { font-size: 20px; font-weight: 600; margin: 0 0 8px 0; }
.page-header .tip { font-size: 13px; color: hsl(var(--muted-foreground)); margin: 0; }
.content-section { background: hsl(var(--background)); border-radius: 8px; padding: 24px; box-shadow: var(--shadow-sm); }
.search-section { margin-bottom: 16px; }
.toolbar { display: flex; justify-content: space-between; align-items: center; }
.range-text { color: hsl(var(--muted-foreground)); }
.pagination-wrapper { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
