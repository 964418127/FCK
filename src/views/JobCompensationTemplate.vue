<template>
  <div class="job-compensation-template">
    <div class="page-header">
      <h1>岗位薪酬模板</h1>
      <p class="tip">💡 统一维护不同岗位、用工模式下的薪酬规则模板，支持快速创建、筛选与编辑</p>
    </div>

    <div class="content-section">
      <!-- 筛选区 -->
      <div class="search-section">
        <el-form :inline="true" class="demo-form-inline">
          <el-form-item label="搜索">
            <el-input v-model="searchForm.keyword" placeholder="岗位名称/模板名称" clearable style="width: 160px;" />
          </el-form-item>
          <el-form-item label="模板类型">
            <el-select v-model="searchForm.templateType" placeholder="选择" clearable style="width: 120px;">
              <el-option label="标准" value="standard" />
              <el-option label="自定义" value="custom" />
            </el-select>
          </el-form-item>
          <el-form-item label="关联岗位">
            <el-select v-model="searchForm.position" placeholder="选择" clearable style="width: 140px;">
              <el-option label="推拿师" value="therapist" />
              <el-option label="客户经理" value="manager" />
              <el-option label="理疗师" value="physiotherapist" />
            </el-select>
          </el-form-item>
          <el-form-item label="岗位归属">
            <el-select v-model="searchForm.belongTo" placeholder="选择" clearable style="width: 120px;">
              <el-option label="业务" value="business" />
              <el-option label="职能" value="function" />
            </el-select>
          </el-form-item>
          <el-form-item label="合作模式">
            <el-select v-model="searchForm.coopMode" placeholder="选择" clearable style="width: 160px;">
              <el-option label="劳动合同-全职" value="fulltime" />
              <el-option label="劳务合作-兼职" value="parttime" />
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
          <el-button type="primary" @click="handleCreate">+ 新增岗位模板</el-button>
        </div>
      </div>

      <!-- 模板列表 -->
      <el-table :data="templateList" stripe style="width: 100%; margin-top: 12px;">
        <el-table-column prop="id" label="编号" width="180" />
        <el-table-column prop="name" label="岗位模板名称" min-width="180" />
        <el-table-column prop="templateType" label="模板类型" width="90">
          <template #default="{ row }">
            <el-tag :type="row.templateType === '标准' ? 'success' : 'warning'" size="small">
              {{ row.templateType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="position" label="关联岗位" width="100" />
        <el-table-column prop="belongTo" label="岗位归属" width="90">
          <template #default="{ row }">
            <el-tag size="small">{{ row.belongTo }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="coopMode" label="合作模式" width="140">
          <template #default="{ row }">
            {{ row.coopMode }}
          </template>
        </el-table-column>
        <el-table-column prop="personCount" label="匹配人员" width="90" align="center">
          <template #default="{ row }">
            <span class="person-count">{{ row.personCount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="160" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleDetail(row)">详情</el-button>
            <el-button type="primary" size="small" link @click="handleEdit(row)">编辑</el-button>
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

    <!-- 新增弹窗 -->
    <el-dialog v-model="createDialogVisible" title="新增岗位模板" width="900px" destroy-on-close>
      <el-form :model="createForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="模板名称">
              <el-input v-model="createForm.name" placeholder="请输入模板名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板类型">
              <el-select v-model="createForm.templateType" placeholder="选择" style="width: 100%;">
                <el-option label="标准" value="标准" />
                <el-option label="自定义" value="自定义" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="关联岗位">
              <el-select v-model="createForm.position" placeholder="选择" style="width: 100%;">
                <el-option label="推拿师" value="推拿师" />
                <el-option label="客户经理" value="客户经理" />
                <el-option label="理疗师" value="理疗师" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位归属">
              <el-select v-model="createForm.belongTo" placeholder="选择" style="width: 100%;">
                <el-option label="业务" value="业务" />
                <el-option label="职能" value="职能" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="合作模式">
              <el-select v-model="createForm.coopMode" placeholder="选择" style="width: 100%;">
                <el-option label="劳动合同-全职" value="劳动合同-全职" />
                <el-option label="劳务合作-兼职" value="劳务合作-兼职" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider>薪酬项配置</el-divider>

        <div class="item-config-section">
          <!-- 薪酬项 -->
          <div class="config-block">
            <div class="config-block-header">
              <span class="config-title">薪酬项</span>
              <el-button type="primary" size="small" link>+ 添加薪酬项</el-button>
            </div>
            <el-table :data="createForm.incomeItems" size="small" border style="width: 100%; margin-top: 8px;">
              <el-table-column prop="name" label="薪酬项名称" width="140" />
              <el-table-column prop="level" label="层级" width="100">
                <template #default="{ row }">
                  <el-select v-model="row.level" size="small" style="width: 80px;">
                    <el-option label="第1级" value="1" />
                    <el-option label="第2级" value="2" />
                    <el-option label="系统项" value="系统" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column prop="formula" label="计算公式" min-width="160" />
              <el-table-column label="操作" width="60">
                <template #default>
                  <el-button type="danger" size="small" link>删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 扣缴项 -->
          <div class="config-block" style="margin-top: 16px;">
            <div class="config-block-header">
              <span class="config-title">扣缴项</span>
              <el-button type="primary" size="small" link>+ 添加扣缴项</el-button>
            </div>
            <el-table :data="createForm.deductItems" size="small" border style="width: 100%; margin-top: 8px;">
              <el-table-column prop="name" label="扣缴项名称" width="140" />
              <el-table-column prop="level" label="层级" width="100">
                <template #default>
                  <el-tag size="small">第1级</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="formula" label="计算公式" min-width="160" />
              <el-table-column label="操作" width="60">
                <template #default>
                  <el-button type="danger" size="small" link>删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 搜索表单
const searchForm = reactive({
  keyword: '',
  templateType: '',
  position: '',
  belongTo: '',
  coopMode: ''
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 3
})

// 模板列表数据
const templateList = ref([
  {
    id: '1109491319435526144',
    name: '全职推拿师提成加班补贴常乐豆',
    templateType: '标准',
    position: '推拿师',
    belongTo: '业务',
    coopMode: '劳动合同-全职',
    personCount: 12,
    updateTime: '2026-05-20 14:42:24'
  },
  {
    id: '1109491319435526145',
    name: '兼职推拿师提成奖金模板',
    templateType: '标准',
    position: '推拿师',
    belongTo: '业务',
    coopMode: '劳务合作-兼职',
    personCount: 8,
    updateTime: '2026-05-19 10:20:15'
  },
  {
    id: '1109491319435526146',
    name: '客户经理劳务合作模板',
    templateType: '自定义',
    position: '客户经理',
    belongTo: '业务',
    coopMode: '劳务合作-兼职',
    personCount: 5,
    updateTime: '2026-05-18 16:30:00'
  }
])

// 新增弹窗
const createDialogVisible = ref(false)
const createForm = reactive({
  name: '',
  templateType: '',
  position: '',
  belongTo: '',
  coopMode: '',
  incomeItems: [
    { name: '计件提成', level: '1', formula: '订单金额 × 提成比例' },
    { name: '超产值奖金', level: '1', formula: '超出部分 × 奖励比例' },
    { name: '超时加班费', level: '1', formula: '加班时长 × 单价' },
    { name: '保底获豆', level: '2', formula: 'max(0, 最低工资 - 第1级收入)' },
    { name: '代扣社保', level: '系统', formula: '固定金额' },
    { name: '代扣公积金', level: '系统', formula: '固定金额' },
    { name: '代扣个税', level: '系统', formula: '百旺计算' }
  ],
  deductItems: [
    { name: '投诉扣款', level: '1', formula: '投诉次数 × 单次扣款' }
  ]
})

// 搜索
const handleSearch = () => {
  // 模拟搜索
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.templateType = ''
  searchForm.position = ''
  searchForm.belongTo = ''
  searchForm.coopMode = ''
}

// 查看详情
const handleDetail = (row) => {
  router.push({ name: 'job-compensation-template-detail', params: { id: row.id } })
}

// 编辑
const handleEdit = (row) => {
  router.push({ name: 'job-compensation-template-detail', params: { id: row.id }, query: { mode: 'edit' } })
}

// 新增
const handleCreate = () => {
  createDialogVisible.value = true
}

// 保存
const handleSave = () => {
  createDialogVisible.value = false
}
</script>

<style scoped>
.job-compensation-template {
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

/* 新增弹窗 */
.item-config-section {
  margin-top: 16px;
}

.config-block {
  background: hsl(var(--muted) / 0.2);
  border-radius: 8px;
  padding: 16px;
}

.config-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-title {
  font-weight: 600;
  font-size: 14px;
}
</style>
