<template>
  <div class="salary-item-management">
    <div class="page-header">
      <h1>薪酬项配置</h1>
      <p class="tip">💡 配置薪酬计算规则，管理薪酬项的基础信息与计算公式</p>
    </div>

    <div class="content-section">
      <!-- 顶部工具栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input v-model="searchForm.keyword" placeholder="搜索编号或名称" clearable style="width: 160px;" />
          <el-select v-model="searchForm.targetPost" placeholder="岗位对象" clearable style="width: 120px;">
            <el-option label="推拿师" value="推拿师" />
            <el-option label="客户经理" value="客户经理" />
            <el-option label="总部岗位" value="总部岗位" />
          </el-select>
          <el-select v-model="searchForm.type" placeholder="类型" clearable style="width: 100px;">
            <el-option label="补贴" value="补贴" />
            <el-option label="绩效" value="绩效" />
            <el-option label="奖金" value="奖金" />
            <el-option label="扣款" value="扣款" />
          </el-select>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </div>
        <div class="toolbar-right">
          <el-button @click="openTypeConfig">类型配置</el-button>
          <el-button type="primary" @click="openAddDialog">+ 新增薪酬项</el-button>
        </div>
      </div>

      <!-- 薪酬项列表 -->
      <el-table :data="filteredSalaryItems" stripe style="width: 100%; margin-top: 16px;">
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column prop="name" label="薪酬项名称" min-width="150" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="postBelong" label="岗位归属" width="100">
          <template #default="{ row }">
            {{ row.postBelong }}
          </template>
        </el-table-column>
        <el-table-column prop="targetPost" label="岗位对象" width="120" />
        <el-table-column prop="cooperateMode" label="匹配合作模式" width="120" />
        <el-table-column prop="calcLevel" label="计算层级" width="100">
          <template #default="{ row }">
            第{{ row.calcLevel }}级
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="openDetailDialog(row)">详情</el-button>
            <el-button type="primary" size="small" link @click="openEditDialog(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="filteredSalaryItems.length === 0" description="暂无薪酬项" />
    </div>

    <!-- 新增/编辑薪酬项弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑薪酬项' : '新增薪酬项'"
      width="800px"
      @close="handleDialogClose"
      class="salary-item-dialog"
    >
      <div class="dialog-section">
        <div class="section-title">一、基础信息配置</div>

        <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="薪酬项名称" prop="name">
                <el-input v-model="form.name" placeholder="如：超产值奖金（月）" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="薪酬项类型" prop="type">
                <el-select v-model="form.type" placeholder="请选择" style="width: 100%;">
                  <el-option label="补贴" value="补贴" />
                  <el-option label="绩效" value="绩效" />
                  <el-option label="奖金" value="奖金" />
                  <el-option label="扣款" value="扣款" />
                  <el-option label="其他" value="其他" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="岗位归属" prop="postBelong">
                <el-select v-model="form.postBelong" placeholder="请选择" style="width: 100%;">
                  <el-option label="业务" value="业务" />
                  <el-option label="职能" value="职能" />
                  <el-option label="管理" value="管理" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="岗位对象" prop="targetPost">
                <el-select v-model="form.targetPost" placeholder="请选择" style="width: 100%;">
                  <el-option label="推拿师" value="推拿师" />
                  <el-option label="客户经理" value="客户经理" />
                  <el-option label="总部岗位" value="总部岗位" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="匹配合作模式" prop="cooperateMode">
                <el-select v-model="form.cooperateMode" placeholder="请选择" style="width: 100%;">
                  <el-option label="劳务合作" value="劳务合作" />
                  <el-option label="劳动合同" value="劳动合同" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="计算层级" prop="calcLevel">
                <el-select v-model="form.calcLevel" placeholder="请选择" style="width: 100%;">
                  <el-option label="第1级" :value="1" />
                  <el-option label="第2级" :value="2" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <div class="dialog-section">
        <div class="section-title">二、薪酬条件计算公式配置</div>

        <!-- 数据对象配置 -->
        <div class="sub-section">
          <div class="sub-section-header">
            <span class="sub-title">1. 配置数据对象</span>
            <el-button type="primary" link @click="addDataObject">+ 新增数据对象</el-button>
          </div>
          <el-table :data="form.dataObjects" border size="small" style="width: 100%;">
            <el-table-column label="编号" width="60" type="index" />
            <el-table-column label="类型" width="100">
              <template #default="{ row }">
                <el-select v-model="row.objType" size="small">
                  <el-option label="系统" value="系统" />
                  <el-option label="订单" value="订单" />
                  <el-option label="人事" value="人事" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="数据对象" min-width="150">
              <template #default="{ row }">
                <el-select v-model="row.objName" size="small" style="width: 100%;">
                  <el-option label="系统标准参数" value="系统标准参数" />
                  <el-option label="订单（通用标准）" value="订单（通用标准）" />
                  <el-option label="人事（绩效目标）" value="人事（绩效目标）" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="关联数据时间" min-width="120">
              <template #default="{ row }">
                <el-select v-model="row.relatedTimeField" size="small" style="width: 100%;">
                  <el-option label="订单日期" value="订单日期" />
                  <el-option label="结算日期" value="结算日期" />
                  <el-option label="创建日期" value="创建日期" />
                  <el-option label="完成日期" value="完成日期" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="60">
              <template #default="{ row, $index }">
                <el-button type="danger" link size="small" @click="removeDataObject($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 综合筛选配置 -->
        <div class="sub-section">
          <div class="sub-section-header">
            <span class="sub-title">2. 综合筛选</span>
            <el-button type="primary" link @click="addFilterCondition">+ 新增筛选条件</el-button>
          </div>
          <el-table :data="form.filterConditions" border size="small" style="width: 100%;">
            <el-table-column label="编号" width="60" type="index" />
            <el-table-column label="字段" width="120">
              <template #default="{ row }">
                <el-select v-model="row.field" size="small">
                  <el-option label="人员" value="人员" />
                  <el-option label="订单类型" value="订单类型" />
                  <el-option label="订单状态" value="订单状态" />
                  <el-option label="社保购买状态" value="社保购买状态" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="判断符" width="100">
              <template #default="{ row }">
                <el-select v-model="row.operator" size="small">
                  <el-option label="等于" value="等于" />
                  <el-option label="不等于" value="不等于" />
                  <el-option label="大于" value="大于" />
                  <el-option label="小于" value="小于" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="值类型" width="100">
              <template #default="{ row }">
                <el-select v-model="row.valueType" size="small">
                  <el-option label="引用" value="引用" />
                  <el-option label="固定值" value="固定值" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="筛选值" min-width="120">
              <template #default="{ row }">
                <el-input v-model="row.filterValue" size="small" placeholder="筛选值" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="60">
              <template #default="{ row, $index }">
                <el-button type="danger" link size="small" @click="removeFilterCondition($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="filter-tip">注：所有条件默认按"且"关系生效</div>
        </div>

        <!-- 薪酬项计算公式配置 -->
        <div class="sub-section">
          <div class="sub-section-header">
            <span class="sub-title">3. 薪酬项计算公式</span>
          </div>

          <!-- 计算规则配置 -->
          <div class="calc-rules">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="数据取整模式" size="small">
                  <el-select v-model="form.calcRule.roundingMode" style="width: 100%;">
                    <el-option label="四舍五入" value="四舍五入" />
                    <el-option label="向上取整" value="向上取整" />
                    <el-option label="向下取整" value="向下取整" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="数据格式" size="small">
                  <el-select v-model="form.calcRule.decimalPlaces" style="width: 100%;">
                    <el-option label="保留两位小数" value="2" />
                    <el-option label="保留一位小数" value="1" />
                    <el-option label="整数" value="0" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="发放形式" size="small">
                  <el-select v-model="form.calcRule.paymentForm" style="width: 100%;">
                    <el-option label="现金" value="现金" />
                    <el-option label="常乐豆" value="常乐豆" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 分支条件与计算公式 -->
          <div class="branch-section">
            <div class="branch-header">
              <span>分支条件与计算公式</span>
              <el-button type="primary" link @click="addBranch">+ 新增薪酬项计算分支</el-button>
            </div>

            <div v-for="(branch, bIdx) in form.branches" :key="bIdx" class="branch-item">
              <div class="branch-title">分支 {{ bIdx + 1 }}</div>
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="条件类型" size="small">
                    <el-radio-group v-model="branch.conditionType" size="small">
                      <el-radio-button label="所有" value="所有" />
                      <el-radio-button label="字段筛选" value="字段筛选" />
                    </el-radio-group>
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- 字段筛选条件 -->
              <div v-if="branch.conditionType === '字段筛选'" class="branch-filter">
                <el-table :data="branch.filterConditions" border size="small" style="width: 100%;">
                  <el-table-column label="编号" width="60" type="index" />
                  <el-table-column label="字段" width="120">
                    <template #default="{ row }">
                      <el-select v-model="row.field" size="small">
                        <el-option label="人员" value="人员" />
                        <el-option label="订单类型" value="订单类型" />
                        <el-option label="订单状态" value="订单状态" />
                        <el-option label="社保购买状态" value="社保购买状态" />
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="判断符" width="100">
                    <template #default="{ row }">
                      <el-select v-model="row.operator" size="small">
                        <el-option label="等于" value="等于" />
                        <el-option label="不等于" value="不等于" />
                        <el-option label="大于" value="大于" />
                        <el-option label="小于" value="小于" />
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="值类型" width="100">
                    <template #default="{ row }">
                      <el-select v-model="row.valueType" size="small">
                        <el-option label="引用" value="引用" />
                        <el-option label="固定值" value="固定值" />
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="筛选值" min-width="120">
                    <template #default="{ row }">
                      <el-input v-model="row.filterValue" size="small" placeholder="筛选值" />
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="60">
                    <template #default="{ row, $index }">
                      <el-button type="danger" link size="small" @click="removeBranchFilter(bIdx, $index)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <el-button type="primary" link size="small" @click="addBranchFilter(bIdx)" style="margin-top: 8px;">+ 新增筛选条件</el-button>
              </div>

              <el-row :gutter="20" style="margin-top: 12px;">
                <el-col :span="24">
                  <el-form-item label="计算公式" size="small">
                    <el-input v-model="branch.formula" placeholder="如：订单金额 × ((订单金额 - 目标产值) ÷ 1000 × 1%)" />
                  </el-form-item>
                  <div class="formula-helper">
                    <span class="helper-label">点击添加运算符：</span>
                    <el-button size="small" @click="insertFormula(branch, '(')">&#40;</el-button>
                    <el-button size="small" @click="insertFormula(branch, ')')">&#41;</el-button>
                    <el-button size="small" @click="insertFormula(branch, '+')">+</el-button>
                    <el-button size="small" @click="insertFormula(branch, '-')">-</el-button>
                    <el-button size="small" @click="insertFormula(branch, '*')">*</el-button>
                    <el-button size="small" @click="insertFormula(branch, '/')">/</el-button>
                    <el-button size="small" @click="insertFormula(branch, '求和()')">求和</el-button>
                    <el-button size="small" @click="insertFormula(branch, '平均值()')">平均值</el-button>
                    <el-button size="small" @click="insertFormula(branch, '最大值()')">最大值</el-button>
                    <el-button size="small" @click="insertFormula(branch, '最小值()')">最小值</el-button>
                    <el-button size="small" @click="insertFormula(branch, '向上取整()')">向上取整</el-button>
                    <el-button size="small" @click="insertFormula(branch, '向下取整()')">向下取整</el-button>
                  </div>
                </el-col>
              </el-row>
              <div class="branch-action">
                <el-button type="danger" link size="small" @click="removeBranch(bIdx)">删除分支</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'

// 薪酬项列表数据
const salaryItems = ref([
  // 兼职薪酬项
  {
    id: 1,
    name: '兼职-计件提成',
    type: '绩效',
    postBelong: '业务',
    targetPost: '推拿师',
    cooperateMode: '劳务合作',
    calcLevel: 1,
    updateTime: '2026-01-15 10:30:00'
  },
  {
    id: 2,
    name: '兼职-超产值奖金',
    type: '补贴',
    postBelong: '业务',
    targetPost: '推拿师',
    cooperateMode: '劳务合作',
    calcLevel: 1,
    updateTime: '2026-01-15 10:30:00'
  },
  {
    id: 3,
    name: '兼职-超时加班费',
    type: '绩效',
    postBelong: '业务',
    targetPost: '推拿师',
    cooperateMode: '劳务合作',
    calcLevel: 1,
    updateTime: '2026-01-17 09:15:00'
  },
  {
    id: 4,
    name: '兼职-投诉扣款',
    type: '扣缴项',
    postBelong: '业务',
    targetPost: '推拿师',
    cooperateMode: '劳务合作',
    calcLevel: 1,
    updateTime: '2026-01-20 09:00:00'
  },
  // 全职薪酬项
  {
    id: 5,
    name: '全职-计件提成',
    type: '绩效',
    postBelong: '业务',
    targetPost: '推拿师',
    cooperateMode: '劳动合同',
    calcLevel: 1,
    updateTime: '2026-01-16 14:20:00'
  },
  {
    id: 6,
    name: '全职-超产值奖金',
    type: '补贴',
    postBelong: '业务',
    targetPost: '推拿师',
    cooperateMode: '劳动合同',
    calcLevel: 1,
    updateTime: '2026-01-16 14:25:00'
  },
  {
    id: 7,
    name: '全职-超时加班费',
    type: '绩效',
    postBelong: '业务',
    targetPost: '推拿师',
    cooperateMode: '劳动合同',
    calcLevel: 1,
    updateTime: '2026-01-17 09:15:00'
  },
  {
    id: 8,
    name: '全职-投诉扣款',
    type: '扣缴项',
    postBelong: '业务',
    targetPost: '推拿师',
    cooperateMode: '劳动合同',
    calcLevel: 1,
    updateTime: '2026-01-20 09:00:00'
  },
  // 补充项
  {
    id: 9,
    name: '保底获豆',
    type: '绩效',
    postBelong: '业务',
    targetPost: '推拿师',
    cooperateMode: '劳务合作',
    calcLevel: 2,
    updateTime: '2026-01-18 11:00:00'
  },
  {
    id: 10,
    name: '兼职个税预扣',
    type: '扣缴项',
    postBelong: '通用',
    targetPost: '推拿师',
    cooperateMode: '劳务合作',
    calcLevel: 2,
    updateTime: '2026-01-19 08:00:00'
  }
])

// 搜索表单
const searchForm = reactive({
  keyword: '',
  targetPost: '',
  type: ''
})

// 弹窗相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const currentEditId = ref(null)

const form = reactive({
  name: '',
  type: '',
  postBelong: '',
  targetPost: '',
  cooperateMode: '',
  calcLevel: 1,
  // 数据对象
  dataObjects: [
    { objType: '系统', objName: '系统标准参数', relatedTimeField: '订单日期' }
  ],
  // 综合筛选
  filterConditions: [
    { field: '人员', operator: '等于', valueType: '引用', filterValue: '销售/业务人员', description: '限定计算对象' }
  ],
  // 计算规则
  calcRule: {
    roundingMode: '四舍五入',
    decimalPlaces: '2',
    paymentForm: '现金'
  },
  // 分支条件
  branches: [
    { conditionType: '所有', filterConditions: [], formula: '', logicDesc: '' }
  ]
})

const rules = {
  name: [{ required: true, message: '请输入薪酬项名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择薪酬项类型', trigger: 'change' }],
  postBelong: [{ required: true, message: '请选择岗位归属', trigger: 'change' }],
  targetPost: [{ required: true, message: '请选择岗位对象', trigger: 'change' }],
  cooperateMode: [{ required: true, message: '请选择匹配合作模式', trigger: 'change' }]
}

// 过滤后的薪酬项列表
const filteredSalaryItems = computed(() => {
  return salaryItems.value.filter(item => {
    // 编号或名称搜索
    const matchKeyword = !searchForm.keyword ||
      String(item.id).includes(searchForm.keyword) ||
      item.name.includes(searchForm.keyword)
    // 岗位对象筛选
    const matchPost = !searchForm.targetPost || item.targetPost === searchForm.targetPost
    // 类型筛选
    const matchType = !searchForm.type || item.type === searchForm.type

    return matchKeyword && matchPost && matchType
  })
})

// 重置搜索
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.targetPost = ''
  searchForm.type = ''
}

// 执行搜索（筛选已经通过computed自动响应，这里仅供扩展）
const handleSearch = () => {
  // 筛选已由 computed 自动完成，这里可扩展其他逻辑
}

// 打开新增弹窗
const openAddDialog = () => {
  isEdit.value = false
  currentEditId.value = null
  resetForm()
  dialogVisible.value = true
}

// 打开类型配置
const openTypeConfig = () => {
  ElMessage.info('类型配置功能开发中')
}

// 打开详情弹窗
const openDetailDialog = (row) => {
  isEdit.value = false
  currentEditId.value = row.id
  Object.assign(form, {
    name: row.name,
    type: row.type,
    postBelong: row.postBelong,
    targetPost: row.targetPost,
    cooperateMode: row.cooperateMode
  })
  dialogVisible.value = true
}

// 打开编辑弹窗
const openEditDialog = (row) => {
  isEdit.value = true
  currentEditId.value = row.id

  if (row.name === '保底获豆') {
    // 保底获豆的完整配置 - 计算层级2级，引用1级薪酬项
    Object.assign(form, {
      name: row.name,
      type: row.type,
      postBelong: row.postBelong,
      targetPost: row.targetPost,
      cooperateMode: row.cooperateMode,
      calcLevel: row.calcLevel,
      dataObjects: [
        { objType: '系统', objName: '系统标准参数', relatedTimeField: '' }
      ],
      filterConditions: [
        { field: '人员', operator: '等于', valueType: '引用', filterValue: '销售/业务人员' }
      ],
      calcRule: {
        roundingMode: '四舍五入',
        decimalPlaces: '2',
        paymentForm: '常乐豆'
      },
      branches: [
        {
          conditionType: '所有',
          filterConditions: [],
          formula: '最大值(0, 最低工资标准 - 求和(计件提成, 超时加班费, 节假日加班费))'
        }
      ]
    })
  } else if (row.name === '兼职个税预扣') {
    // 兼职个税预扣 - 第2级计算，引用1级收入项，预扣率3%
    Object.assign(form, {
      name: row.name,
      type: row.type,
      postBelong: row.postBelong,
      targetPost: row.targetPost,
      cooperateMode: row.cooperateMode,
      calcLevel: 2,
      dataObjects: [
        { objType: '系统', objName: '系统标准参数', relatedTimeField: '' }
      ],
      filterConditions: [
        { field: '人员', operator: '等于', valueType: '引用', filterValue: '劳务人员' }
      ],
      calcRule: {
        roundingMode: '四舍五入',
        decimalPlaces: '2',
        paymentForm: '现金'
      },
      branches: [
        {
          conditionType: '所有',
          filterConditions: [],
          formula: '求和(计件提成, 超时加班费, 节假日加班费) * 0.03'
        }
      ]
    })
  } else if (row.name === '投诉扣款') {
    // 投诉扣款 - 第1级扣缴项，按投诉次数或固定金额扣除
    Object.assign(form, {
      name: row.name,
      type: row.type,
      postBelong: row.postBelong,
      targetPost: row.targetPost,
      cooperateMode: row.cooperateMode,
      calcLevel: 1,
      dataObjects: [
        { objType: '系统', objName: '系统标准参数', relatedTimeField: '' },
        { objType: '人事', objName: '人事（绩效目标）', relatedTimeField: '结算日期' }
      ],
      filterConditions: [
        { field: '人员', operator: '等于', valueType: '引用', filterValue: '销售/业务人员' }
      ],
      calcRule: {
        roundingMode: '四舍五入',
        decimalPlaces: '2',
        paymentForm: '现金'
      },
      branches: [
        {
          conditionType: '所有',
          filterConditions: [],
          formula: '投诉次数 * 单次扣款金额'
        }
      ]
    })
  } else {
    // 其他薪酬项的默认配置
    Object.assign(form, {
      name: row.name,
      type: row.type,
      postBelong: row.postBelong,
      targetPost: row.targetPost,
      cooperateMode: row.cooperateMode,
      calcLevel: row.calcLevel,
      dataObjects: [{ objType: '系统', objName: '系统标准参数', relatedTimeField: '订单日期' }],
      filterConditions: [{ field: '人员', operator: '等于', valueType: '引用', filterValue: '销售/业务人员' }],
      calcRule: { roundingMode: '四舍五入', decimalPlaces: '2', paymentForm: '现金' },
      branches: [{ conditionType: '所有', filterConditions: [], formula: '' }]
    })
  }
  dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  form.name = ''
  form.type = ''
  form.postBelong = ''
  form.targetPost = ''
  form.cooperateMode = ''
  form.calcLevel = 1
  form.dataObjects = [{ objType: '系统', objName: '系统标准参数', relatedTimeField: '订单日期' }]
  form.filterConditions = [{ field: '人员', operator: '等于', valueType: '引用', filterValue: '销售/业务人员' }]
  form.calcRule = { roundingMode: '四舍五入', decimalPlaces: '2', paymentForm: '现金' }
  form.branches = [{ conditionType: '所有', filterConditions: [], formula: '' }]
}

// 弹窗关闭时重置表单
const handleDialogClose = () => {
  formRef.value?.resetFields()
  resetForm()
}

// 数据对象操作
const addDataObject = () => {
  form.dataObjects.push({ objType: '系统', objName: '系统标准参数', relatedTimeField: '订单日期' })
}

const removeDataObject = (index) => {
  form.dataObjects.splice(index, 1)
}

// 筛选条件操作
const addFilterCondition = () => {
  form.filterConditions.push({ field: '', operator: '等于', valueType: '引用', filterValue: '', description: '' })
}

const removeFilterCondition = (index) => {
  form.filterConditions.splice(index, 1)
}

// 分支操作
const addBranch = () => {
  form.branches.push({ conditionType: '所有', filterConditions: [], formula: '', logicDesc: '' })
}

const removeBranch = (index) => {
  if (form.branches.length > 1) {
    form.branches.splice(index, 1)
  } else {
    ElMessage.warning('至少保留一个分支')
  }
}

// 分支内筛选条件操作
const addBranchFilter = (branchIdx) => {
  form.branches[branchIdx].filterConditions.push({ field: '', operator: '等于', valueType: '引用', filterValue: '' })
}

const removeBranchFilter = (branchIdx, filterIdx) => {
  form.branches[branchIdx].filterConditions.splice(filterIdx, 1)
}

// 公式辅助输入
const insertFormula = (branch, text) => {
  branch.formula += text
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        const index = salaryItems.value.findIndex(item => item.id === currentEditId.value)
        if (index !== -1) {
          salaryItems.value[index] = {
            ...salaryItems.value[index],
            name: form.name,
            type: form.type,
            postBelong: form.postBelong,
            targetPost: form.targetPost,
            cooperateMode: form.cooperateMode,
            cycle: form.cycle,
            calcTimePoint: form.calcTimePoint
          }
          ElMessage.success('编辑成功')
        }
      } else {
        const newId = Math.max(...salaryItems.value.map(item => item.id), 0) + 1
        salaryItems.value.push({
          id: newId,
          name: form.name,
          type: form.type,
          postBelong: form.postBelong,
          targetPost: form.targetPost,
          cooperateMode: form.cooperateMode,
          updateTime: new Date().toLocaleString('zh-CN')
        })
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
    }
  })
}
</script>

<style scoped>
.salary-item-management {
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

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 12px;
}

/* 弹窗样式 */
.dialog-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid hsl(var(--primary));
}

.sub-section {
  margin-bottom: 20px;
  padding: 16px;
  background: hsl(var(--muted) / 0.5);
  border-radius: 8px;
}

.sub-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.sub-title {
  font-weight: 500;
  color: hsl(var(--foreground));
}

.filter-tip {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  margin-top: 8px;
}

.calc-rules {
  margin-bottom: 16px;
}

.branch-section {
  margin-top: 16px;
}

.branch-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 500;
}

.branch-item {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.formula-helper {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.helper-label {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  margin-right: 4px;
}

.branch-filter {
  margin-top: 12px;
  padding: 12px;
  background: hsl(var(--muted) / 0.3);
  border-radius: 6px;
}

.branch-title {
  font-weight: 500;
  margin-bottom: 12px;
  color: hsl(var(--primary));
}

.branch-action {
  text-align: right;
  margin-top: 8px;
}

.salary-item-dialog :deep(.el-dialog__body) {
  max-height: 70vh;
  overflow-y: auto;
}
</style>