<template>
  <div class="general-param-management">
    <!-- 搜索区 -->
    <div class="search-section">
      <el-form :inline="true" class="search-form">
        <el-form-item label="配置名称">
          <el-input
            v-model="keyword"
            placeholder=""
            clearable
            style="width: 180px;"
            @keyup.enter="handleSearch"
          >
            <template #suffix>
              <el-icon class="search-icon"><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" plain @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作区 -->
    <div class="toolbar">
      <el-button type="primary" @click="openCreate">+ 新增配置</el-button>
    </div>

    <!-- 列表 -->
    <el-table :data="rows" stripe class="param-table" style="width: 100%;">
      <el-table-column prop="name" label="配置名称" min-width="260" align="center" />
      <el-table-column label="值类型" width="140" align="center">
        <template #default="{ row }">
          <span v-if="row.kind === 'table'" class="shape-text">{{ VALUE_TYPE_LABELS.table }}</span>
          <span v-else class="shape-text">{{ VALUE_TYPE_LABELS[row.valueType] || row.valueType }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="row.enabled ? 'primary' : 'info'" effect="light" size="small">
            {{ row.enabled ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="启用/禁用" width="120" align="center">
        <template #default="{ row }">
          <el-switch v-model="row.enabled" @change="handleToggle(row)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" link @click="openEdit(row)">编辑</el-button>
          <el-button type="danger" size="small" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!filtered.length" description="暂无配置" />

    <div v-if="total > 0" class="pagination-wrapper">
      <el-pagination
        :current-page="page"
        :page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @update:current-page="v => page = v"
        @update:page-size="v => { pageSize = v; page = 1 }"
      />
    </div>

    <!-- 新增 / 编辑基础信息（二维数据的列与数据在独立页面维护） -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑配置' : '新增配置'"
      width="620px"
      :close-on-click-modal="false"
      class="param-dialog"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
        <el-form-item label="配置名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入" maxlength="40" show-word-limit />
        </el-form-item>
        <el-form-item label="值类型" prop="valueType">
          <el-select
            v-model="form.valueType"
            placeholder="请选择"
            style="width: 100%;"
            @change="handleTypeChange"
          >
            <el-option v-for="t in VALUE_TYPES" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
        </el-form-item>

        <template v-if="form.kind === 'simple'">
          <el-form-item label="值" :error="valueError">
            <div v-if="!form.valueType" class="value-placeholder" />
            <!-- 文本 / 数值 -->
            <el-input
              v-else-if="form.valueType === 'text' || form.valueType === 'number'"
              v-model="form.value"
              :placeholder="form.valueType === 'number' ? '请输入数值' : '请输入'"
              @input="valueError = ''"
            />
            <!-- 日期 / 时间 -->
            <el-date-picker
              v-else-if="form.valueType === 'date'"
              v-model="form.value"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择日期"
              style="width: 100%;"
              @change="valueError = ''"
            />
            <el-time-picker
              v-else-if="form.valueType === 'time'"
              v-model="form.value"
              value-format="HH:mm"
              format="HH:mm"
              placeholder="选择时间"
              style="width: 100%;"
              @change="valueError = ''"
            />
            <!-- Array<文本> -->
            <div v-else-if="form.valueType === 'text-array'" class="array-editor">
              <div v-for="(item, index) in form.value" :key="index" class="array-row">
                <el-input v-model="form.value[index]" placeholder="请输入" @input="valueError = ''" />
                <el-button class="row-remove" link @click="removeRow(index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <el-button type="primary" plain size="small" @click="addRow">+ 添加文本</el-button>
            </div>
            <!-- Array<日期> -->
            <div v-else-if="form.valueType === 'date-array'" class="array-editor">
              <div v-for="(item, index) in form.value" :key="index" class="array-row">
                <el-date-picker
                  v-model="form.value[index]"
                  type="date"
                  value-format="YYYY-MM-DD"
                  placeholder="选择日期"
                  style="width: 100%;"
                  @change="valueError = ''"
                />
                <el-button class="row-remove" link @click="removeRow(index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <el-button type="primary" plain size="small" @click="addRow">+ 添加日期</el-button>
            </div>
            <!-- Array<时间> -->
            <div v-else-if="form.valueType === 'time-array'" class="array-editor">
              <div v-for="(item, index) in form.value" :key="index" class="array-row">
                <el-time-picker
                  v-model="form.value[index]"
                  value-format="HH:mm"
                  format="HH:mm"
                  placeholder="选择时间"
                  style="width: 100%;"
                  @change="valueError = ''"
                />
                <el-button class="row-remove" link @click="removeRow(index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <el-button type="primary" plain size="small" @click="addRow">+ 添加时间</el-button>
            </div>
            <!-- Array<键值> -->
            <div v-else-if="form.valueType === 'kv-array'" class="array-editor">
              <div v-for="(item, index) in form.value" :key="index" class="array-row">
                <el-input v-model="item.key" placeholder="请输入" class="kv-key" @input="valueError = ''" />
                <el-input v-model="item.value" placeholder="请输入" class="kv-value" @input="valueError = ''" />
                <el-button class="row-remove" link @click="removeRow(index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <el-button type="primary" plain size="small" @click="addRow">+ 添加键值</el-button>
            </div>
          </el-form-item>
        </template>

        <el-form-item v-else label="数据">
          <p class="shape-hint">
            数据表的列与数据在独立页面维护：可增删列、录入或导入数据（按当前列生成导入模板）。提交后自动进入该页面。
          </p>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button class="close-btn" @click="dialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleSubmit">{{ form.kind === 'table' ? '提交并配置数据' : '提交' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Search } from '@element-plus/icons-vue'
import { VALUE_TYPES, VALUE_TYPE_LABELS, emptyValueOf } from '../mock/generalParams.js'
import { paramList, nextParamId, nowText } from '../mock/generalParamStore.js'

const router = useRouter()

/** 直接读写共享存储：数据表页保存后回到列表立刻生效 */
const list = paramList

const keyword = ref('')
const appliedKeyword = ref('')
const page = ref(1)
const pageSize = ref(10)

const filtered = computed(() => {
  const kw = appliedKeyword.value.trim()
  if (!kw) return list
  return list.filter(item => item.name.includes(kw))
})

const total = computed(() => filtered.value.length)
const rows = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

function handleSearch() {
  appliedKeyword.value = keyword.value
  page.value = 1
}

function handleReset() {
  keyword.value = ''
  appliedKeyword.value = ''
  page.value = 1
}

const dialogVisible = ref(false)
const isEdit = ref(false)
const editingId = ref('')
const formRef = ref(null)
const valueError = ref('')

const form = reactive({
  name: '',
  kind: 'simple',
  valueType: '',
  value: ''
})

const rules = computed(() => ({
  name: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
  valueType: [{ required: true, message: '请选择值类型', trigger: 'change' }]
}))

const clone = (value) => JSON.parse(JSON.stringify(value))

function resetForm() {
  form.name = ''
  form.kind = 'simple'
  form.valueType = ''
  form.value = ''
  valueError.value = ''
  editingId.value = ''
  isEdit.value = false
  formRef.value?.clearValidate()
}

function openCreate() {
  resetForm()
  dialogVisible.value = true
}

/** 数据表不在这里改：直接进独立页面（列 + 数据 + 导入） */
function openEdit(row) {
  if (row.kind === 'table') {
    router.push({ path: `/config-rule-management/general-param/${row.id}` })
    return
  }
  resetForm()
  isEdit.value = true
  editingId.value = row.id
  form.name = row.name
  form.kind = 'simple'
  form.valueType = row.valueType
  form.value = clone(row.value)
  dialogVisible.value = true
}

/** 切换值类型：数据表交给独立页面，其余在原值编辑器里填 */
function handleTypeChange(type) {
  valueError.value = ''
  form.valueType = type
  if (type === 'table') {
    form.kind = 'table'
    form.value = ''
  } else {
    form.kind = 'simple'
    form.value = emptyValueOf(type)
  }
}

function addRow() {
  if (form.valueType === 'kv-array') form.value.push({ key: '', value: '' })
  else form.value.push('')
}

function removeRow(index) {
  form.value.splice(index, 1)
  if (!form.value.length) addRow()
}

/** 简单值校验：标量非空（数值还必须是数字），数组逐行完整；整行空白的行视为未填，不算错、提交时剔除 */
function validateValue() {
  const type = form.valueType
  if (!type) {
    valueError.value = '请选择值类型'
    return false
  }
  if (type === 'text-array' || type === 'date-array' || type === 'time-array') {
    const filled = form.value.filter(item => String(item ?? '').trim() !== '')
    if (!filled.length) {
      valueError.value = '请填写完整的值信息'
      return false
    }
    valueError.value = ''
    return true
  }
  if (type === 'kv-array') {
    const filled = form.value.filter(item => String(item.key ?? '').trim() !== '' || String(item.value ?? '').trim() !== '')
    if (!filled.length) {
      valueError.value = '请填写完整的值信息'
      return false
    }
    const complete = filled.every(item => String(item.key ?? '').trim() !== '' && String(item.value ?? '').trim() !== '')
    valueError.value = complete ? '' : '请填写完整的值信息'
    return complete
  }
  const text = String(form.value ?? '').trim()
  if (!text) {
    valueError.value = '请填写完整的值信息'
    return false
  }
  if (type === 'number' && !Number.isFinite(Number(text))) {
    valueError.value = '值必须是数值'
    return false
  }
  valueError.value = ''
  return true
}

function cleanValue() {
  const type = form.valueType
  if (type === 'text-array' || type === 'date-array' || type === 'time-array') {
    return form.value.filter(item => String(item ?? '').trim() !== '')
  }
  if (type === 'kv-array') {
    return form.value
      .filter(item => String(item.key ?? '').trim() !== '' || String(item.value ?? '').trim() !== '')
      .map(item => ({ key: String(item.key).trim(), value: String(item.value).trim() }))
  }
  return typeof form.value === 'string' ? form.value.trim() : form.value
}

async function handleSubmit() {
  const formOk = await formRef.value.validate().catch(() => false)
  if (!formOk) return

  // 数据表：只落基础信息，列与数据去独立页面配
  if (form.kind === 'table') {
    const name = form.name.trim()
    let id = editingId.value
    if (isEdit.value) {
      const target = list.find(item => item.id === editingId.value)
      if (target) {
        Object.assign(target, { name, kind: 'table', updateTime: nowText() })
        delete target.valueType
        delete target.value
      }
    } else {
      id = nextParamId()
      list.unshift({ id, name, kind: 'table', columns: [], rows: [], enabled: true, updateTime: nowText() })
    }
    dialogVisible.value = false
    ElMessage.success('已保存基础信息，接着配置列与数据')
    router.push({ path: `/config-rule-management/general-param/${id}` })
    return
  }

  if (!validateValue()) return
  const payload = { name: form.name.trim(), kind: 'simple', valueType: form.valueType, value: cleanValue(), updateTime: nowText() }

  if (isEdit.value) {
    const target = list.find(item => item.id === editingId.value)
    if (target) Object.assign(target, payload)
    ElMessage.success('已保存')
  } else {
    list.unshift({ id: nextParamId(), enabled: true, ...payload })
    ElMessage.success('已新增')
    page.value = 1
  }
  dialogVisible.value = false
}

function handleToggle(row) {
  ElMessage.success(`「${row.name}」已${row.enabled ? '启用' : '停用'}`)
}

function handleDelete(row) {
  ElMessageBox.confirm(`确定删除配置「${row.name}」吗？删除后引用它的公式将取不到值。`, '删除确认', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = list.findIndex(item => item.id === row.id)
    if (index > -1) list.splice(index, 1)
    ElMessage.success('已删除')
  }).catch(() => {})
}
</script>

<style scoped>
.general-param-management {
  padding: 4px 0;
}

.search-section {
  margin-bottom: 16px;
}

.search-form :deep(.el-form-item) {
  margin-bottom: 8px;
}

.search-icon {
  color: hsl(var(--muted-foreground));
  cursor: pointer;
}

/* 搜索按钮按参考稿做描边样式：白底 + 品牌色文字与描边 */
.search-form :deep(.el-button--primary.is-plain) {
  background: transparent;
  border-color: hsl(var(--primary));
  color: hsl(var(--primary));
}

.search-form :deep(.el-button--primary.is-plain:hover) {
  background: hsl(var(--primary) / 0.06);
  border-color: hsl(var(--primary));
  color: hsl(var(--primary));
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.param-table :deep(th.el-table__cell) {
  background: hsl(var(--muted) / 0.5);
  color: hsl(var(--foreground));
  font-weight: 600;
}

.shape-text {
  color: hsl(var(--foreground));
}

.value-placeholder {
  height: 32px;
}

.array-editor {
  width: 100%;
  padding: 12px;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  background: hsl(var(--muted) / 0.35);
}

.array-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.array-row .kv-key,
.array-row .kv-value {
  flex: 1;
}

.row-remove {
  color: hsl(var(--muted-foreground));
  flex: none;
}

.row-remove:hover {
  color: hsl(var(--destructive));
}

.shape-hint {
  margin: 0;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
  line-height: 1.7;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.close-btn {
  min-width: 88px;
}

:deep(.el-dialog__footer) {
  display: flex;
  justify-content: center;
  gap: 24px;
}

:deep(.el-dialog__footer .el-button) {
  min-width: 96px;
}
</style>
