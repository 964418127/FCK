<template>
  <div class="page-wrapper">
    <div class="page-header">
      <div>
        <h2>业务主体管理</h2>
        <p class="subtitle">定义业务实体、属性及关联关系（文档2.5）</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="openEntityDialog()">新建实体</el-button>
      </div>
    </div>

    <el-card shadow="hover" class="panel-card">
      <div class="card-header">
        <div class="title-row">
          <el-icon><OfficeBuilding /></el-icon>
          <span>业务实体</span>
        </div>
      </div>
      <el-table :data="entities" style="width: 100%">
        <el-table-column prop="code" label="实体编码" width="140" />
        <el-table-column prop="name" label="实体名称" width="160" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button text size="small" @click="openAttributeDialog(scope.row)">属性</el-button>
            <el-button text size="small" @click="openRelationDialog(scope.row)">关系</el-button>
            <el-button text size="small" @click="openEntityDialog(scope.row)">编辑</el-button>
            <el-button text size="small" type="danger" @click="deleteEntity(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 实体弹窗 -->
    <el-dialog v-model="entityDialogVisible" :title="entityForm.id ? '编辑实体' : '新建实体'" width="520px">
      <el-form :model="entityForm" label-width="100px">
        <el-form-item label="实体编码" required>
          <el-input v-model="entityForm.code" />
        </el-form-item>
        <el-form-item label="实体名称" required>
          <el-input v-model="entityForm.name" />
        </el-form-item>
        <el-form-item label="类型" required>
          <el-select v-model="entityForm.type" placeholder="选择类型">
            <el-option label="用户实体" value="user" />
            <el-option label="业务实体" value="business" />
            <el-option label="系统实体" value="system" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="entityForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="entityDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEntity">保存</el-button>
      </template>
    </el-dialog>

    <!-- 属性弹窗 -->
    <el-dialog v-model="attributeDialogVisible" :title="`属性管理 - ${currentEntity?.name || ''}`" width="720px">
      <div class="toolbar">
        <el-button type="primary" size="small" @click="addAttribute">新增属性</el-button>
      </div>
      <el-table :data="attributes[currentEntity?.code] || []" style="width: 100%">
        <el-table-column prop="name" label="属性名称" width="140" />
        <el-table-column prop="field" label="字段名" width="140" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="required" label="必填" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.required ? 'success' : 'info'">{{ scope.row.required ? '是' : '否' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button text size="small" @click="editAttribute(scope.$index)">编辑</el-button>
            <el-button text size="small" type="danger" @click="removeAttribute(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="attributeDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 关系弹窗 -->
    <el-dialog v-model="relationDialogVisible" :title="`关系管理 - ${currentEntity?.name || ''}`" width="720px">
      <div class="toolbar">
        <el-button type="primary" size="small" @click="addRelation">新增关系</el-button>
      </div>
      <el-table :data="relations[currentEntity?.code] || []" style="width: 100%">
        <el-table-column prop="name" label="关系名称" width="140" />
        <el-table-column prop="targetEntity" label="目标实体" width="140" />
        <el-table-column prop="relationType" label="关系类型" width="120" />
        <el-table-column prop="sourceField" label="源字段" width="120" />
        <el-table-column prop="targetField" label="目标字段" width="120" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button text size="small" @click="editRelation(scope.$index)">编辑</el-button>
            <el-button text size="small" type="danger" @click="removeRelation(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="relationDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { OfficeBuilding } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const entities = ref([
  { id: 1, code: 'user', name: '用户', type: 'user', description: '用户实体' },
  { id: 2, code: 'order', name: '订单', type: 'business', description: '订单实体' }
])

const attributes = reactive({
  user: [
    { name: '用户ID', field: 'id', type: 'string', required: true, description: '唯一标识' },
    { name: '手机号', field: 'phone', type: 'string', required: true, description: '登录手机号' }
  ],
  order: [
    { name: '订单号', field: 'orderNo', type: 'string', required: true, description: '订单编号' },
    { name: '金额', field: 'amount', type: 'number', required: true, description: '订单金额' }
  ]
})

const relations = reactive({
  order: [
    { name: '下单用户', targetEntity: 'user', relationType: 'many-to-one', sourceField: 'userId', targetField: 'id', description: '' }
  ]
})

const entityDialogVisible = ref(false)
const attributeDialogVisible = ref(false)
const relationDialogVisible = ref(false)
const currentEntity = ref(null)

const entityForm = ref({
  id: '',
  code: '',
  name: '',
  type: '',
  description: ''
})

const openEntityDialog = (row) => {
  if (row) {
    entityForm.value = { ...row }
  } else {
    entityForm.value = { id: '', code: '', name: '', type: '', description: '' }
  }
  entityDialogVisible.value = true
}

const saveEntity = () => {
  if (!entityForm.value.code || !entityForm.value.name) {
    ElMessage.warning('请输入实体编码和名称')
    return
  }
  if (entityForm.value.id) {
    const idx = entities.value.findIndex(e => e.id === entityForm.value.id)
    if (idx > -1) entities.value[idx] = { ...entityForm.value }
  } else {
    entities.value.push({ ...entityForm.value, id: Date.now() })
  }
  entityDialogVisible.value = false
  ElMessage.success('保存成功')
}

const deleteEntity = (row) => {
  ElMessageBox.confirm('确定删除该实体？', '提示', { type: 'warning' }).then(() => {
    entities.value = entities.value.filter(e => e.id !== row.id)
    delete attributes[row.code]
    delete relations[row.code]
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const openAttributeDialog = (row) => {
  currentEntity.value = row
  attributeDialogVisible.value = true
}

const addAttribute = () => {
  if (!currentEntity.value) return
  const list = attributes[currentEntity.value.code] || []
  list.push({ name: '新属性', field: `field_${list.length + 1}`, type: 'string', required: false, description: '' })
  attributes[currentEntity.value.code] = list
}

const editAttribute = (index) => {
  // 简化：直接在表格可编辑，如需弹窗可扩展
}

const removeAttribute = (index) => {
  const list = attributes[currentEntity.value.code] || []
  list.splice(index, 1)
}

const openRelationDialog = (row) => {
  currentEntity.value = row
  relationDialogVisible.value = true
}

const addRelation = () => {
  if (!currentEntity.value) return
  const list = relations[currentEntity.value.code] || []
  list.push({ name: '新关系', targetEntity: '', relationType: 'one-to-one', sourceField: '', targetField: '', description: '' })
  relations[currentEntity.value.code] = list
}

const editRelation = (index) => {
  // 简化：表格直接可编辑；如需弹窗可扩展
}

const removeRelation = (index) => {
  const list = relations[currentEntity.value.code] || []
  list.splice(index, 1)
}
</script>

<style scoped>
.page-wrapper {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.subtitle {
  margin: 4px 0 0;
  color: #909399;
}
.header-actions {
  display: flex;
  gap: 8px;
}
.panel-card {
  margin-top: 8px;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}
.toolbar {
  margin-bottom: 10px;
}
</style>

