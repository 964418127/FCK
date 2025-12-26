<template>
  <div class="position-management">
    <div class="position-header">
      <div class="header-actions">
        <el-button @click="openImportDialog">
          导入
        </el-button>
      <el-button type="primary" @click="handleAddPosition">
        <el-icon-plus /> 新增岗位
      </el-button>
      </div>
    </div>
    
    <div class="position-content">
      <el-table :data="positions" border stripe style="width: 100%">
        <el-table-column prop="code" label="岗位编号" min-width="160" />
        <el-table-column prop="name" label="岗位名称" min-width="150" />
        <el-table-column prop="description" label="岗位描述" min-width="260" />
        <el-table-column label="计划编制" min-width="120">
          <template #default="scope">
            {{ getPlannedCount(scope.row.id) }}
          </template>
        </el-table-column>
        <el-table-column label="实际在岗/空缺" min-width="140">
          <template #default="scope">
            {{ getActualCount(scope.row.id) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="160" fixed="right">
          <template #default="scope">
        <el-button 
          type="primary" 
          size="small" 
          @click="handleEditPosition(scope.row)"
          style="margin-right: 8px"
        >
          编辑
        </el-button>
        <el-dropdown trigger="click">
          <span class="more-link">
            更多
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click.stop="openBudgetDialog(scope.row)">模拟预算通过</el-dropdown-item>
              <el-dropdown-item @click.stop="openAllocateDialog(scope.row)">分配编制</el-dropdown-item>
              <el-dropdown-item divided @click.stop="handleDeletePosition(scope.row)">删除</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 岗位表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="岗位编号" prop="code">
          <el-input v-model="formData.code" placeholder="例如 YY-25-001" />
        </el-form-item>
        <el-form-item label="岗位名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入岗位名称" />
        </el-form-item>
        <el-form-item label="岗位描述">
          <el-input 
            v-model="formData.description" 
            type="textarea" 
            rows="3" 
            placeholder="请输入岗位描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 导入岗位（占位，不落地数据） -->
    <el-dialog
      v-model="importDialogVisible"
      title="导入岗位"
      width="520px"
    >
      <el-button type="primary" link @click="handleDownloadTemplate" style="margin-bottom: 6px">
        下载Excel模板
      </el-button>
      <el-alert
        title="此处仅提供模板与上传入口，未接通真实导入逻辑。"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 12px"
      />
      <el-upload
        drag
        action=""
        :auto-upload="false"
        :show-file-list="true"
        :limit="1"
        accept=".xlsx,.xls,.csv"
        :on-change="handleImportFileChange"
        :before-upload="() => false"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          拖拽或点击上传
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持xlsx/xls/csv，建议使用提供的模板填写数据
          </div>
        </template>
      </el-upload>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleImportConfirm">确认（占位）</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 分配编制对话框 -->
    <el-dialog
      v-model="allocateDialogVisible"
      title="分配岗位编制到部门"
      width="520px"
    >
      <el-form :model="allocateForm" label-width="120px">
        <el-form-item label="岗位">
          <el-input :value="positions.find(p => p.id === allocateForm.positionId)?.name || ''" disabled />
        </el-form-item>
        <el-form-item label="目标部门" prop="departmentId">
          <el-select v-model="allocateForm.departmentId" placeholder="请选择部门" filterable style="width:100%">
            <el-option
              v-for="opt in flattenDepartments(props.departments || [])"
              :key="opt.id"
              :label="opt.label"
              :value="opt.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="分配数量" prop="count">
          <el-input-number v-model="allocateForm.count" :min="1" :max="100" />
          <div class="form-tip" style="margin-top:6px; color:#909399; font-size:12px">
            系统会优先使用已有的未分配编制（预算或其它来源），如数量不足将自动补生成空缺编制并分配到所选部门。
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="allocateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAllocateConfirm">分配</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 模拟预算确认对话框 -->
    <el-dialog
      v-model="budgetDialogVisible"
      title="模拟预算通过 - 生成预算编制"
      width="420px"
      :close-on-click-modal="false"
    >
      <el-form :model="budgetForm" label-width="120px">
        <el-form-item label="岗位" >
          <el-input :value="budgetPosition?.name || ''" disabled />
        </el-form-item>
        <el-form-item label="计划数量" prop="count">
          <el-input-number v-model="budgetForm.count" :min="1" :max="1000" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="budgetDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleBudgetConfirm">确认生成</el-button>
        </span>
      </template>
    </el-dialog>
    
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled, ArrowDown } from '@element-plus/icons-vue'
import { workPosts, budgetPlans } from '../mock/data.js'

// 接收父组件传入的props
const props = defineProps({
  positions: {
    type: Array,
    required: true
  },
  departments: {
    type: Array,
    default: () => []
  },
  workPosts: {
    type: Array,
    default: () => []
  },
})

// 定义事件
const emit = defineEmits(['update:positions', 'create-work-posts', 'allocate-work-posts'])

// 响应式数据
const dialogVisible = ref(false)
const dialogTitle = ref('新增岗位')
const formRef = ref(null)
const isEdit = ref(false)
const importDialogVisible = ref(false)
const importFileName = ref('')
const formData = ref({
  id: '',
  code: '',
  name: '',
  description: ''
})

// 分配编制对话框状态与表单
const allocateDialogVisible = ref(false)
const allocateForm = ref({
  positionId: '',
  departmentId: '',
  count: 1
})

// 预算生成对话框
const budgetDialogVisible = ref(false)
const budgetPosition = ref(null)
const budgetForm = ref({
  count: 1
})

// 打开预算生成对话框（允许编辑计划数量后再生成未分配的空缺岗位）
const openBudgetDialog = (position) => {
  const planned = getPlannedCount(position.id) || 0
  budgetPosition.value = position
  budgetForm.value.count = planned > 0 ? planned : 1
  budgetDialogVisible.value = true
}

const handleBudgetConfirm = () => {
  const position = budgetPosition.value
  if (!position) {
    ElMessage.warning('未选择岗位')
    return
  }
  const count = parseInt(budgetForm.value.count, 10) || 0
  if (count <= 0) {
    ElMessage.warning('请输入有效的生成数量')
    return
  }
  const mainCode = position.code || position.id
  const newPosts = []
  for (let i = 0; i < count; i++) {
    const post = {
      id: `wp-budget-${position.id}-${Date.now()}-${i}`,
      mainPositionId: position.id,
      mainPositionCode: mainCode,
      mainPositionName: position.name,
      postCode: `${mainCode}-${String(i+1).padStart(2,'0')}`,
      departmentId: null,
      assignedUserId: null,
      status: 'vacant',
      fromBudget: true
    }
    newPosts.push(post)
  }
  emit('create-work-posts', newPosts)
  budgetDialogVisible.value = false
  ElMessage.success(`已生成 ${newPosts.length} 个预算编制的空缺岗位（未分配）`)
}

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入岗位名称', trigger: 'blur' },
    { min: 1, max: 50, message: '岗位名称长度在 1 到 50 个字符', trigger: 'blur' }
  ]
}

// 打开新增岗位对话框
const handleAddPosition = () => {
  isEdit.value = false
  dialogTitle.value = '新增岗位'
  formData.value = {
    id: `pos-${Date.now()}`,
    code: `YY-${String(Math.floor(Math.random()*90)+10)}-${String(Math.floor(Math.random()*900)+100)}`,
    name: '',
    description: ''
  }
  dialogVisible.value = true
}

// 打开导入对话框
const openImportDialog = () => {
  importDialogVisible.value = true
}

// 选择文件（占位）
const handleImportFileChange = (file) => {
  importFileName.value = file.name || ''
  ElMessage.info('已选择文件，导入逻辑未实现')
}

// 下载Excel模板
const handleDownloadTemplate = () => {
  const header = ['岗位名称', '岗位描述']
  const sample = [
    ['销售主管', '负责销售团队管理'],
    ['技术总监', '负责技术部门管理']
  ]
  const csvRows = [header, ...sample].map(row => row.join(',')).join('\n')
  const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = '岗位导入模板.csv'
  link.click()
  URL.revokeObjectURL(url)
}

// 确认导入（占位）
const handleImportConfirm = () => {
  ElMessage.success(importFileName.value ? `文件 ${importFileName.value} 已上传占位` : '未选择文件，已关闭占位导入')
  importDialogVisible.value = false
  importFileName.value = ''
}

// 打开编辑岗位对话框
const handleEditPosition = (data) => {
  isEdit.value = true
  dialogTitle.value = '编辑岗位'
  formData.value = JSON.parse(JSON.stringify(data))
  dialogVisible.value = true
}

// 删除岗位
const handleDeletePosition = (data) => {
  ElMessageBox.confirm('确定要删除该岗位吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 实现删除逻辑
    const newPositions = props.positions.filter(pos => pos.id !== data.id)
    emit('update:positions', newPositions)
    ElMessage.success('岗位删除成功')
  }).catch(() => {
    // 取消删除
  })
}

// 提交表单
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      let newPositions
      if (isEdit.value) {
        // 编辑岗位
        newPositions = props.positions.map(pos => {
          if (pos.id === formData.value.id) {
            return formData.value
          }
          return pos
        })
      } else {
        // 新增岗位
        newPositions = [...props.positions, formData.value]
      }
      emit('update:positions', newPositions)
      dialogVisible.value = false
      ElMessage.success(isEdit.value ? '岗位更新成功' : '岗位新增成功')
    } else {
      return false
    }
  })
}
// 统计：获取计划编制与实际工作岗位数量
const getPlannedCount = (positionId) => {
  if (!positionId) return 0
  // 优先匹配最近年份的计划
  const plans = (budgetPlans || []).filter(p => p.positionId === positionId)
  if (!plans || plans.length === 0) return 0
  const years = plans.map(p => p.year || 0)
  const latest = Math.max(...years)
  const entry = plans.find(p => p.positionId === positionId && p.year === latest)
  return entry ? entry.planned : 0
}

const getActualCount = (positionId) => {
  if (!positionId) return 0
  // return filled count and vacant count separately if needed; for display we'll show 在岗/空缺
  const all = (props.workPosts || []).filter(w => w.mainPositionId === positionId)
  const filled = all.filter(w => w.status === 'filled' && w.assignedUserId).length
  const vacant = all.filter(w => w.status === 'vacant' || !w.assignedUserId).length
  return `${filled} / ${vacant}`
}

// 扁平化部门用于下拉显示（带缩进）
const flattenDepartments = (deptList, level = 0) => {
  let res = []
  for (const d of deptList || []) {
    res.push({ id: d.id, name: d.name, label: `${'　'.repeat(level)}${d.name}` })
    if (d.children && d.children.length) {
      res = res.concat(flattenDepartments(d.children, level + 1))
    }
  }
  return res
}

// 打开分配编制对话框
const openAllocateDialog = (position) => {
  allocateForm.value.positionId = position.id
  allocateForm.value.departmentId = ''
  allocateForm.value.count = 1
  allocateDialogVisible.value = true
}

// 生成空缺工作岗位并发出事件给父组件
const handleAllocateConfirm = () => {
  const posId = allocateForm.value.positionId
  const deptId = allocateForm.value.departmentId || null
  let count = parseInt(allocateForm.value.count, 10) || 0
  if (!posId || count <= 0) {
    ElMessage.warning('请选择岗位并输入有效数量')
    return
  }
  // 分配已有未分配的工作岗位到指定部门：委托父组件执行分配
  emit('allocate-work-posts', { positionId: posId, departmentId: deptId, count })
  allocateDialogVisible.value = false
  ElMessage.success(`已请求分配 ${count} 个未分配岗位到目标部门（如数量不足，将由父组件处理）`)
}
</script>

<style scoped>
.position-management {
  width: 100%;
}

.position-header {
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.position-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>