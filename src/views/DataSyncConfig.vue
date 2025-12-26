<template>
  <div class="page-wrapper">
    <div class="page-header">
      <div>
        <h2>数据同步管理</h2>
        <p class="subtitle">配置源/目标、同步策略、时机、映射（文档2.6）</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="openDialog()">新建同步</el-button>
      </div>
    </div>

    <el-card shadow="hover" class="panel-card">
      <div class="card-header">
        <div class="title-row">
          <el-icon><Connection /></el-icon>
          <span>同步配置</span>
        </div>
      </div>
      <el-table :data="configs" style="width: 100%">
        <el-table-column prop="code" label="编码" width="150" />
        <el-table-column prop="name" label="名称" width="180" />
        <el-table-column prop="sourceType" label="源类型" width="120" />
        <el-table-column prop="targetType" label="目标类型" width="120" />
        <el-table-column prop="syncStrategy" label="策略" width="120" />
        <el-table-column prop="syncTiming" label="时机" width="140" />
        <el-table-column prop="description" label="描述" min-width="220" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button text size="small" @click="openDialog(scope.row)">编辑</el-button>
            <el-button text size="small" @click="previewMapping(scope.row)">映射</el-button>
            <el-button text size="small" type="danger" @click="deleteConfig(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 同步配置弹窗 -->
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑同步配置' : '新建同步配置'" width="720px">
      <el-form :model="form" label-width="110px" size="default">
        <el-form-item label="编码" required>
          <el-input v-model="form.code" />
        </el-form-item>
        <el-form-item label="名称" required>
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="源类型" required>
          <el-select v-model="form.sourceType" placeholder="选择源">
            <el-option label="MySQL" value="mysql" />
            <el-option label="MongoDB" value="mongodb" />
            <el-option label="API" value="api" />
          </el-select>
        </el-form-item>
        <el-form-item label="源配置">
          <el-input v-model="form.sourceConfig" type="textarea" :rows="3" placeholder='JSON，如 {"table": "user"}' />
        </el-form-item>
        <el-form-item label="目标类型" required>
          <el-select v-model="form.targetType" placeholder="选择目标">
            <el-option label="MySQL" value="mysql" />
            <el-option label="MongoDB" value="mongodb" />
            <el-option label="API" value="api" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标配置">
          <el-input v-model="form.targetConfig" type="textarea" :rows="3" placeholder='JSON，如 {"api": "/sync"}' />
        </el-form-item>
        <el-form-item label="同步策略" required>
          <el-select v-model="form.syncStrategy" placeholder="选择策略">
            <el-option label="全量" value="full" />
            <el-option label="增量" value="incremental" />
            <el-option label="条件" value="conditional" />
          </el-select>
        </el-form-item>
        <el-form-item label="同步时机" required>
          <el-select v-model="form.syncTiming" placeholder="选择时机">
            <el-option label="流程启动" value="process_start" />
            <el-option label="节点完成" value="node_completed" />
            <el-option label="流程结束" value="process_end" />
            <el-option label="定时" value="scheduled" />
            <el-option label="事件触发" value="event_triggered" />
          </el-select>
        </el-form-item>
        <el-form-item label="字段映射">
          <el-input v-model="form.mappingConfig" type="textarea" :rows="3" placeholder='JSON，如 {"userId": "payload.userId"}' />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveConfig">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Connection } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const configs = ref([
  {
    id: 1,
    code: 'sync_user_to_crm',
    name: '同步用户到CRM',
    sourceType: 'mysql',
    sourceConfig: '{"table":"user"}',
    targetType: 'api',
    targetConfig: '{"api":"/crm/user"}',
    syncStrategy: 'full',
    syncTiming: 'process_start',
    mappingConfig: '{"id":"payload.userId"}',
    description: '注册成功同步'
  }
])

const dialogVisible = ref(false)
const form = ref({
  id: '',
  code: '',
  name: '',
  sourceType: '',
  sourceConfig: '',
  targetType: '',
  targetConfig: '',
  syncStrategy: '',
  syncTiming: '',
  mappingConfig: '',
  description: ''
})

const openDialog = (row) => {
  form.value = row ? { ...row } : {
    id: '',
    code: '',
    name: '',
    sourceType: '',
    sourceConfig: '',
    targetType: '',
    targetConfig: '',
    syncStrategy: '',
    syncTiming: '',
    mappingConfig: '',
    description: ''
  }
  dialogVisible.value = true
}

const saveConfig = () => {
  if (!form.value.code || !form.value.name) {
    ElMessage.warning('请输入编码和名称')
    return
  }
  if (form.value.id) {
    const idx = configs.value.findIndex(c => c.id === form.value.id)
    if (idx > -1) configs.value[idx] = { ...form.value }
  } else {
    configs.value.push({ ...form.value, id: Date.now() })
  }
  dialogVisible.value = false
  ElMessage.success('保存成功')
}

const deleteConfig = (row) => {
  ElMessageBox.confirm('确定删除该同步配置？', '提示', { type: 'warning' }).then(() => {
    configs.value = configs.value.filter(c => c.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const previewMapping = (row) => {
  ElMessage.info(row.mappingConfig || '暂无映射')
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
</style>

