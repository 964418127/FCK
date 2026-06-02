<template>
  <div class="salary-distribution-strategy">
    <div class="page-header">
      <h1>薪酬发放策略</h1>
      <p class="tip">将岗位薪酬模板与实际人员绑定，配置薪酬发放的生效规则与覆盖人群</p>
    </div>

    <div class="content-section">
      <!-- 筛选区 -->
      <div class="search-section">
        <el-form :inline="true" class="demo-form-inline">
          <el-form-item label="搜索">
            <el-input v-model="searchForm.keyword" placeholder="人才ID/姓名/策略名称" clearable style="width: 180px;" />
          </el-form-item>
          <el-form-item label="岗位">
            <el-select v-model="searchForm.position" placeholder="选择" clearable style="width: 140px;">
              <el-option label="推拿师" value="therapist" />
              <el-option label="客户经理" value="manager" />
              <el-option label="理疗师" value="physiotherapist" />
            </el-select>
          </el-form-item>
          <el-form-item label="薪酬模板">
            <el-select v-model="searchForm.templateId" placeholder="选择" clearable style="width: 200px;">
              <el-option label="兼职推拿师提成奖金模板" value="template1" />
              <el-option label="全职推拿师提成加班补贴常乐豆" value="template2" />
              <el-option label="客户经理劳务合作模板" value="template3" />
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
          <el-button type="primary" @click="handleCreate">+ 新增发放策略</el-button>
        </div>
      </div>

      <!-- 策略列表 -->
      <el-table :data="strategyList" stripe style="width: 100%; margin-top: 12px;">
        <el-table-column prop="id" label="策略编号" width="180" />
        <el-table-column prop="name" label="策略名称" min-width="200" />
        <el-table-column prop="personCount" label="匹配人数" width="90" align="center">
          <template #default="{ row }">
            <span class="person-count">{{ row.personCount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="position" label="岗位" width="100" />
        <el-table-column prop="templateName" label="薪酬模板" min-width="200" />
        <el-table-column prop="validityPeriod" label="策略有效期" width="120">
          <template #default="{ row }">
            <span>{{ row.validityPeriod }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleDetail(row)">详情</el-button>
            <el-button type="primary" size="small" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="warning" size="small" link @click="handleRecalculate(row)">发起重算</el-button>
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
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" destroy-on-close>
      <el-form :model="form" label-width="100px">
        <el-form-item label="策略名称">
          <el-input v-model="form.name" placeholder="请输入策略名称" style="width: 100%;" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="岗位">
              <el-select v-model="form.position" placeholder="选择" style="width: 100%;">
                <el-option label="推拿师" value="推拿师" />
                <el-option label="客户经理" value="客户经理" />
                <el-option label="理疗师" value="理疗师" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="薪酬模板">
              <el-select v-model="form.templateId" placeholder="选择" style="width: 100%;">
                <el-option label="兼职推拿师提成奖金模板" value="template1" />
                <el-option label="全职推拿师提成加班补贴常乐豆" value="template2" />
                <el-option label="客户经理劳务合作模板" value="template3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="策略有效期">
          <el-select v-model="form.validityType" placeholder="选择" style="width: 180px;">
            <el-option label="长期有效" value="longterm" />
            <el-option label="固定周期" value="fixed" />
          </el-select>
          <el-date-picker
            v-if="form.validityType === 'fixed'"
            v-model="form.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="margin-left: 12px; width: 300px;"
          />
        </el-form-item>
        <el-form-item label="覆盖人群">
          <el-input v-model="form.personScope" placeholder="请输入覆盖人群范围" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  keyword: '',
  position: '',
  templateId: ''
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 6
})

// 策略列表数据
const strategyList = ref([
  {
    id: '1109493788878143489',
    name: '全职推拿师发放策略（v1和v2具有营销折扣获豆和回头客补贴）',
    personCount: 1080,
    position: '推拿师',
    templateName: '全职推拿师模板',
    coopMode: '劳动合同-全职',
    validityPeriod: '长期有效',
    updateTime: '2026-05-19 10:30:00'
  },
  {
    id: '1109493788878143500',
    name: '全职推拿师发放策略（v3没有营销折扣获豆和回头客补贴）',
    personCount: 606,
    position: '推拿师',
    templateName: '全职推拿师模板',
    coopMode: '劳动合同-全职',
    validityPeriod: '长期有效',
    updateTime: '2026-05-19 10:32:00'
  },
  {
    id: '1109493788878143491',
    name: '非全日制推拿师发放策略（没有常乐豆）',
    personCount: 86,
    position: '推拿师',
    templateName: '非全日制推拿师模板',
    coopMode: '非全日制劳动合同',
    validityPeriod: '长期有效',
    updateTime: '2026-05-21 09:15:30'
  },
  {
    id: '1109493788878143488',
    name: '兼职推拿师发放策略（无常乐豆）',
    personCount: 54,
    position: '推拿师',
    templateName: '兼职推拿师模板',
    coopMode: '劳务合作-兼职',
    validityPeriod: '长期有效',
    updateTime: '2026-05-20 14:52:13'
  },
  {
    id: '1109493788878143490',
    name: '全职客户经理发放策略',
    personCount: 364,
    position: '客户经理',
    templateName: '全职客户经理模板',
    coopMode: '劳动合同-全职',
    validityPeriod: '2026-01-01 至 2026-12-31',
    updateTime: '2026-05-18 16:45:22'
  },
  {
    id: '1109493788878143501',
    name: '总部其他全职岗位发放策略',
    personCount: 48,
    position: '总部职能',
    templateName: '全职总部岗位模板',
    coopMode: '劳动合同-全职',
    validityPeriod: '长期有效',
    updateTime: '2026-05-17 11:30:00'
  }
])

// 新增/编辑弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('新增发放策略')
const form = reactive({
  name: '',
  position: '',
  templateId: '',
  validityType: 'longterm',
  dateRange: null,
  personScope: ''
})

// 搜索
const handleSearch = () => {
  // 模拟搜索
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.position = ''
  searchForm.templateId = ''
}

// 查看详情
const handleDetail = (row) => {
  router.push({ name: 'salary-distribution-strategy-detail', params: { id: row.id } })
}

// 编辑
const handleEdit = (row) => {
  router.push({ name: 'salary-distribution-strategy-detail', params: { id: row.id }, query: { mode: 'edit' } })
}

// 新增
const handleCreate = () => {
  dialogTitle.value = '新增发放策略'
  dialogVisible.value = true
}

// 保存
const handleSave = () => {
  dialogVisible.value = false
  ElMessage.success('保存成功')
}

// 合作模式标签类型
const getCoopModeTagType = (coopMode) => {
  const map = {
    '劳动合同-全职': 'success',
    '非全日制劳动合同': 'warning',
    '劳务合作-兼职': 'danger'
  }
  return map[coopMode] || 'default'
}

// 发起重算
const handleRecalculate = (row) => {
  ElMessageBox.confirm(`确定对策略"${row.name}"下所有人员发起薪酬重算吗？`, '发起重算', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('重算任务已发起')
  }).catch(() => {})
}
</script>

<style scoped>
.salary-distribution-strategy {
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

.person-count {
  color: hsl(var(--primary));
  font-weight: 600;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>