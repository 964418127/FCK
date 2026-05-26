<template>
  <div class="city-salary-standard">
    <div class="page-header">
      <h1>城市基准系数配置</h1>
      <p class="tip">💡 配置各城市、不同薪资区间下的社保和公积金缴纳标准，作为岗位薪酬模板的基准数据来源</p>
    </div>

    <div class="content-section">
      <!-- 筛选区 -->
      <div class="search-section">
        <el-form :inline="true" class="demo-form-inline">
          <el-form-item label="城市">
            <el-select v-model="searchForm.city" placeholder="选择城市" clearable style="width: 140px;">
              <el-option label="北京" value="beijing" />
              <el-option label="上海" value="shanghai" />
              <el-option label="深圳" value="shenzhen" />
              <el-option label="杭州" value="hangzhou" />
            </el-select>
          </el-form-item>
          <el-form-item label="缴纳类型">
            <el-select v-model="searchForm.type" placeholder="选择" clearable style="width: 120px;">
              <el-option label="社保" value="security" />
              <el-option label="公积金" value="fund" />
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
          <el-button type="primary" @click="handleCreate">+ 新增基准</el-button>
        </div>
      </div>

      <!-- 基准列表 -->
      <el-table :data="standardList" stripe style="width: 100%; margin-top: 12px;">
        <el-table-column prop="city" label="城市" width="100" />
        <el-table-column prop="salaryRange" label="薪资区间" width="120">
          <template #default="{ row }">
            ¥{{ row.salaryMin }} - ¥{{ row.salaryMax }}
          </template>
        </el-table-column>
        <el-table-column prop="type" label="缴纳类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === '社保' ? 'primary' : 'success'" size="small">
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="baseAmount" label="缴纳基数(元)" width="130">
          <template #default="{ row }">
            ¥{{ row.baseAmount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="ratio" label="缴纳比例" width="100">
          <template #default="{ row }">
            {{ (row.ratio * 100).toFixed(1) }}%
          </template>
        </el-table-column>
        <el-table-column prop="personalRatio" label="个人比例" width="100">
          <template #default="{ row }">
            {{ (row.personalRatio * 100).toFixed(1) }}%
          </template>
        </el-table-column>
        <el-table-column prop="companyAmount" label="公司缴纳(元)" width="130">
          <template #default="{ row }">
            ¥{{ row.companyAmount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="personalAmount" label="个人缴纳(元)" width="130">
          <template #default="{ row }">
            ¥{{ row.personalAmount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="160" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" destroy-on-close>
      <el-form :model="form" label-width="120px">
        <el-form-item label="城市">
          <el-select v-model="form.city" placeholder="选择城市" style="width: 100%;">
            <el-option label="北京" value="beijing" />
            <el-option label="上海" value="shanghai" />
            <el-option label="深圳" value="shenzhen" />
            <el-option label="杭州" value="hangzhou" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="薪资区间下限">
              <el-input-number v-model="form.salaryMin" :min="0" :step="1000" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="薪资区间上限">
              <el-input-number v-model="form.salaryMax" :min="0" :step="1000" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="缴纳类型">
          <el-radio-group v-model="form.type">
            <el-radio label="security">社保</el-radio>
            <el-radio label="fund">公积金</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="缴纳基数">
          <el-input-number v-model="form.baseAmount" :min="0" :step="100" style="width: 100%;" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="公司缴纳比例">
              <el-input-number v-model="form.ratio" :min="0" :max="1" :step="0.001" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="个人缴纳比例">
              <el-input-number v-model="form.personalRatio" :min="0" :max="1" :step="0.001" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider content-position="left">计算结果预览</el-divider>
        <div class="calc-preview">
          <div class="preview-item">
            <span class="label">公司缴纳：</span>
            <span class="value">¥{{ ((form.baseAmount || 0) * (form.ratio || 0)).toFixed(2) }}</span>
          </div>
          <div class="preview-item">
            <span class="label">个人缴纳：</span>
            <span class="value">¥{{ ((form.baseAmount || 0) * (form.personalRatio || 0)).toFixed(2) }}</span>
          </div>
          <div class="preview-item total">
            <span class="label">合计：</span>
            <span class="value">¥{{ (((form.baseAmount || 0) * (form.ratio || 0)) + ((form.baseAmount || 0) * (form.personalRatio || 0))).toFixed(2) }}</span>
          </div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const searchForm = reactive({
  city: '',
  type: ''
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 8
})

const standardList = ref([
  { id: 1, city: '北京', salaryMin: 3000, salaryMax: 5000, type: '社保', baseAmount: 5000, ratio: 0.165, personalRatio: 0.085, companyAmount: 825, personalAmount: 425, updateTime: '2026-05-20 10:00:00' },
  { id: 2, city: '北京', salaryMin: 5000, salaryMax: 10000, type: '社保', baseAmount: 8000, ratio: 0.165, personalRatio: 0.085, companyAmount: 1320, personalAmount: 680, updateTime: '2026-05-20 10:00:00' },
  { id: 3, city: '北京', salaryMin: 10000, salaryMax: 20000, type: '社保', baseAmount: 12000, ratio: 0.165, personalRatio: 0.085, companyAmount: 1980, personalAmount: 1020, updateTime: '2026-05-20 10:00:00' },
  { id: 4, city: '北京', salaryMin: 3000, salaryMax: 5000, type: '公积金', baseAmount: 5000, ratio: 0.12, personalRatio: 0.12, companyAmount: 600, personalAmount: 600, updateTime: '2026-05-20 10:00:00' },
  { id: 5, city: '北京', salaryMin: 5000, salaryMax: 10000, type: '公积金', baseAmount: 8000, ratio: 0.12, personalRatio: 0.12, companyAmount: 960, personalAmount: 960, updateTime: '2026-05-20 10:00:00' },
  { id: 6, city: '上海', salaryMin: 3000, salaryMax: 5000, type: '社保', baseAmount: 5000, ratio: 0.26, personalRatio: 0.105, companyAmount: 1300, personalAmount: 525, updateTime: '2026-05-20 10:00:00' },
  { id: 7, city: '上海', salaryMin: 5000, salaryMax: 10000, type: '社保', baseAmount: 8000, ratio: 0.26, personalRatio: 0.105, companyAmount: 2080, personalAmount: 840, updateTime: '2026-05-20 10:00:00' },
  { id: 8, city: '上海', salaryMin: 5000, salaryMax: 10000, type: '公积金', baseAmount: 8000, ratio: 0.07, personalRatio: 0.07, companyAmount: 560, personalAmount: 560, updateTime: '2026-05-20 10:00:00' }
])

const dialogVisible = ref(false)
const dialogTitle = ref('新增基准')
const isEdit = ref(false)
const form = reactive({
  city: '',
  salaryMin: 0,
  salaryMax: 0,
  type: 'security',
  baseAmount: 0,
  ratio: 0,
  personalRatio: 0
})

const handleReset = () => {
  searchForm.city = ''
  searchForm.type = ''
}

const handleCreate = () => {
  dialogTitle.value = '新增基准'
  isEdit.value = false
  Object.assign(form, { city: '', salaryMin: 0, salaryMax: 0, type: 'security', baseAmount: 0, ratio: 0, personalRatio: 0 })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑基准'
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除该基准配置吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const idx = standardList.value.findIndex(i => i.id === row.id)
    if (idx !== -1) standardList.value.splice(idx, 1)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleSave = () => {
  dialogVisible.value = false
  ElMessage.success('保存成功')
}
</script>

<style scoped>
.city-salary-standard {
  padding: 0;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: hsl(var(--foreground));
}

.page-header .tip {
  color: hsl(var(--muted-foreground));
  font-size: 14px;
  margin: 0;
}

.content-section {
  background: hsl(var(--background));
  border-radius: 8px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.search-section {
  padding-bottom: 16px;
  border-bottom: 1px solid hsl(var(--border));
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.toolbar-left {
  display: flex;
  gap: 8px;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.calc-preview {
  background: hsl(var(--muted) / 0.3);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.preview-item .label {
  color: hsl(var(--muted-foreground));
}

.preview-item .value {
  font-weight: 600;
  color: hsl(var(--foreground));
}

.preview-item.total {
  border-top: 1px dashed hsl(var(--border));
  padding-top: 8px;
  margin-top: 4px;
}

.preview-item.total .value {
  color: hsl(var(--primary));
}
</style>