<template>
  <div class="page-wrapper">
    <div class="page-header">
      <div>
        <h2>可视化事件配置 v1</h2>
        <p class="subtitle">流程/业务/系统/外部事件的触发与处理（文档2.4.3）</p>
      </div>
      <el-button type="primary" @click="openDialog()">
        <el-icon><Plus /></el-icon>
        新建事件
      </el-button>
    </div>

    <el-card shadow="hover" class="panel-card">
      <div class="card-header">
        <div class="title-row">
          <el-icon><Connection /></el-icon>
          <span>事件列表</span>
        </div>
      </div>
      <el-table :data="events" style="width: 100%">
        <el-table-column prop="code" label="事件编码" width="160" />
        <el-table-column prop="name" label="事件名称" min-width="180" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="scope">
            <el-tag :type="getTypeTag(scope.row.type)">{{ getTypeLabel(scope.row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="triggerType" label="触发机制" width="140" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
              {{ scope.row.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
        <el-table-column label="操作" width="220">
          <template #default="scope">
            <el-button type="primary" text size="small" @click="openDialog(scope.row)">配置</el-button>
            <el-button text size="small" @click="previewHandler(scope.row)">处理动作</el-button>
            <el-button text size="small" type="danger" @click="deleteEvent(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 事件配置弹窗 -->
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑事件' : '新建事件'" width="800px">
      <el-tabs v-model="tab">
        <el-tab-pane label="基本信息" name="basic">
          <el-form :model="form" label-width="120px">
            <el-form-item label="事件编码" required>
              <el-input v-model="form.code" :disabled="!!form.id" />
            </el-form-item>
            <el-form-item label="事件名称" required>
              <el-input v-model="form.name" />
            </el-form-item>
            <el-form-item label="事件类型" required>
              <el-select v-model="form.type" placeholder="选择类型">
                <el-option label="流程事件" value="process" />
                <el-option label="业务事件" value="business" />
                <el-option label="系统事件" value="system" />
                <el-option label="外部事件" value="external" />
              </el-select>
            </el-form-item>
            <el-form-item label="触发类型" required>
              <el-select v-model="form.triggerType" placeholder="选择触发方式">
                <el-option label="立即" value="immediate" />
                <el-option label="延迟" value="delay" />
                <el-option label="条件" value="condition" />
                <el-option label="定时" value="schedule" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="form.triggerType === 'delay'" label="延迟秒数">
              <el-input-number v-model="form.triggerConfig.delaySeconds" :min="0" />
            </el-form-item>
            <el-form-item v-if="form.triggerType === 'condition'" label="触发条件">
              <el-input v-model="form.triggerConfig.condition" placeholder="如：payload.status === 'done'" />
            </el-form-item>
            <el-form-item v-if="form.triggerType === 'schedule'" label="Cron表达式">
              <el-input v-model="form.triggerConfig.cron" placeholder="如：0 0 * * * *" />
            </el-form-item>
            <el-form-item label="描述">
              <el-input v-model="form.description" type="textarea" :rows="3" />
            </el-form-item>
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio label="active">启用</el-radio>
                <el-radio label="inactive">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="处理动作" name="actions">
          <div class="section-header">
            <span>动作列表</span>
            <el-button size="small" type="primary" @click="addAction">新增动作</el-button>
          </div>
          <el-table :data="form.actions" style="width: 100%">
            <el-table-column prop="actionType" label="类型" width="140">
              <template #default="scope">
                <el-select v-model="scope.row.actionType" size="small" @change="onActionChange(scope.$index)">
                  <el-option label="启动流程" value="startProcess" />
                  <el-option label="更新业务数据" value="updateBusiness" />
                  <el-option label="发送消息" value="sendMessage" />
                  <el-option label="调用外部接口" value="callExternalApi" />
                  <el-option label="执行脚本" value="runScript" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="config" label="配置" min-width="300">
              <template #default="scope">
                <div v-if="scope.row.actionType === 'startProcess'" class="config-line">
                  流程编码：
                  <el-input v-model="scope.row.config.processCode" size="small" placeholder="如 masseur_migration" style="width: 180px" />
                </div>
                <div v-else-if="scope.row.actionType === 'updateBusiness'" class="config-line">
                  实体：
                  <el-input v-model="scope.row.config.entityType" size="small" placeholder="user/order" style="width: 120px" />
                  ID：
                  <el-input v-model="scope.row.config.entityId" size="small" placeholder="${payload.userId}" style="width: 140px" />
                </div>
                <div v-else-if="scope.row.actionType === 'sendMessage'" class="config-line">
                  模板：
                  <el-input v-model="scope.row.config.templateCode" size="small" placeholder="templateCode" style="width: 180px" />
                  收件人：
                  <el-input v-model="scope.row.config.recipient" size="small" placeholder="${payload.userId}" style="width: 140px" />
                </div>
                <div v-else-if="scope.row.actionType === 'callExternalApi'" class="config-line">
                  URL：
                  <el-input v-model="scope.row.config.url" size="small" placeholder="https://api.example.com" style="width: 220px" />
                  Method：
                  <el-select v-model="scope.row.config.method" size="small" style="width: 100px">
                    <el-option label="GET" value="GET" />
                    <el-option label="POST" value="POST" />
                  </el-select>
                </div>
                <div v-else-if="scope.row.actionType === 'runScript'" class="config-line">
                  <el-input v-model="scope.row.config.script" type="textarea" :rows="2" size="small" placeholder="自定义脚本" />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="scope">
                <el-button text size="small" type="danger" @click="removeAction(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEvent">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus, Connection } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const events = ref([
  {
    id: 1,
    code: 'user.registered',
    name: '用户注册成功',
    type: 'business',
    triggerType: 'immediate',
    triggerConfig: {},
    actions: [
      { actionType: 'updateBusiness', config: { entityType: 'user', entityId: '${payload.userId}' } },
      { actionType: 'startProcess', config: { processCode: 'masseur_migration' } }
    ],
    status: 'active',
    updatedAt: '2025-01-10 10:00'
  }
])

const dialogVisible = ref(false)
const tab = ref('basic')
const form = ref({
  id: '',
  code: '',
  name: '',
  type: '',
  triggerType: 'immediate',
  triggerConfig: {},
  actions: [],
  status: 'active',
  description: ''
})

const getTypeLabel = (type) => {
  const map = {
    process: '流程事件',
    business: '业务事件',
    system: '系统事件',
    external: '外部事件'
  }
  return map[type] || type
}
const getTypeTag = (type) => {
  const map = {
    process: 'primary',
    business: 'success',
    system: 'warning',
    external: 'info'
  }
  return map[type] || 'info'
}

const openDialog = (row) => {
  form.value = row
    ? { ...row, triggerConfig: { ...row.triggerConfig }, actions: row.actions ? row.actions.map(a => ({ ...a, config: { ...a.config } })) : [] }
    : {
        id: '',
        code: '',
        name: '',
        type: '',
        triggerType: 'immediate',
        triggerConfig: {},
        actions: [],
        status: 'active',
        description: ''
      }
  tab.value = 'basic'
  dialogVisible.value = true
}

const saveEvent = () => {
  if (!form.value.code || !form.value.name || !form.value.type) {
    ElMessage.warning('请填写必填项')
    return
  }
  if (form.value.id) {
    const idx = events.value.findIndex(e => e.id === form.value.id)
    if (idx > -1) events.value[idx] = { ...form.value, updatedAt: new Date().toLocaleString('zh-CN') }
  } else {
    events.value.push({ ...form.value, id: Date.now(), updatedAt: new Date().toLocaleString('zh-CN') })
  }
  dialogVisible.value = false
  ElMessage.success('保存成功')
}

const deleteEvent = (row) => {
  ElMessageBox.confirm('确定删除该事件吗？', '提示', { type: 'warning' }).then(() => {
    events.value = events.value.filter(e => e.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const previewHandler = (row) => {
  const actions = row.actions?.map(a => a.actionType).join(', ') || '暂无'
  ElMessage.info(`动作: ${actions}`)
}

const addAction = () => {
  form.value.actions.push({ actionType: 'startProcess', config: { processCode: '' } })
}
const removeAction = (index) => {
  form.value.actions.splice(index, 1)
}
const onActionChange = (index) => {
  const act = form.value.actions[index]
  if (!act) return
  const defaults = {
    startProcess: { processCode: '' },
    updateBusiness: { entityType: '', entityId: '' },
    sendMessage: { templateCode: '', recipient: '' },
    callExternalApi: { url: '', method: 'POST' },
    runScript: { script: '' }
  }
  act.config = defaults[act.actionType] || {}
}
</script>

<style scoped>
.page-wrapper {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0;
}

.subtitle {
  margin: 4px 0 0;
  color: #909399;
}

.panel-card {
  margin-bottom: 16px;
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

