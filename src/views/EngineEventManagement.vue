<template>
  <div class="page-wrapper">
    <div class="page-header">
      <div>
        <h2>引擎事件管理</h2>
        <p class="subtitle">自动化引擎的事件定义、订阅关系与监控</p>
      </div>
      <el-button type="primary" @click="openDialog()">
        <el-icon><Plus /></el-icon>
        新建事件
      </el-button>
    </div>

    <!-- 筛选栏 -->
    <el-card shadow="hover" class="panel-card" style="margin-bottom: 16px">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="事件类型">
          <el-select v-model="filterForm.type" placeholder="全部类型" clearable style="width: 150px">
            <el-option label="流程事件" value="process" />
            <el-option label="业务事件" value="business" />
            <el-option label="系统事件" value="system" />
            <el-option label="外部事件" value="external" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属业务">
          <el-select v-model="filterForm.businessId" placeholder="全部业务" clearable filterable style="width: 200px">
            <el-option
              v-for="business in businessList"
              :key="business.id"
              :label="business.name"
              :value="business.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="启用" value="active" />
            <el-option label="停用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadEvents">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 事件列表 -->
    <el-card shadow="hover" class="panel-card">
      <div class="card-header">
        <div class="title-row">
          <el-icon><Connection /></el-icon>
          <span>事件列表</span>
          <el-tag type="info" size="small" style="margin-left: 8px">{{ filteredEvents.length }} 个事件</el-tag>
        </div>
      </div>
      <el-table :data="filteredEvents" style="width: 100%" row-key="id">
        <el-table-column prop="code" label="事件编码" width="200" />
        <el-table-column prop="name" label="事件名称" min-width="180" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="scope">
            <el-tag :type="getTypeTag(scope.row.type)">{{ getTypeLabel(scope.row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="所属业务" width="150">
          <template #default="scope">
            <span v-if="scope.row.businessId">{{ getBusinessName(scope.row.businessId) }}</span>
            <span v-else style="color: #909399;">系统级</span>
          </template>
        </el-table-column>
        <el-table-column label="订阅流程" width="120">
          <template #default="scope">
            <el-tag type="info" size="small">{{ getSubscribedProcessCount(scope.row.id) }} 个</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="产生流程" width="120">
          <template #default="scope">
            <el-tag type="success" size="small">{{ getProducedProcessCount(scope.row.id) }} 个</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
              {{ scope.row.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-button type="primary" text size="small" @click="openDialog(scope.row)">编辑</el-button>
            <el-button text size="small" @click="viewRelations(scope.row)">关系视图</el-button>
            <el-button text size="small" type="danger" @click="deleteEvent(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 事件配置弹窗 -->
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑事件' : '新建事件'" width="900px" :close-on-click-modal="false">
      <el-tabs v-model="tab">
        <el-tab-pane label="基本信息" name="basic">
          <el-form :model="form" label-width="140px">
            <el-form-item label="事件编码" required>
              <el-input v-model="form.code" :disabled="!!form.id" placeholder="如：order.created" />
              <div class="tip">事件编码用于唯一标识事件，创建后不可修改</div>
            </el-form-item>
            <el-form-item label="事件名称" required>
              <el-input v-model="form.name" placeholder="如：订单创建事件" />
            </el-form-item>
            <el-form-item label="事件类型" required>
              <el-select v-model="form.type" placeholder="选择类型" @change="onTypeChange" style="width: 100%">
                <el-option label="流程事件" value="process">
                  <div>
                    <div>流程事件</div>
                    <div style="font-size: 12px; color: #909399;">流程执行过程中产生的事件</div>
                  </div>
                </el-option>
                <el-option label="业务事件" value="business">
                  <div>
                    <div>业务事件</div>
                    <div style="font-size: 12px; color: #909399;">业务操作产生的事件</div>
                  </div>
                </el-option>
                <el-option label="系统事件" value="system">
                  <div>
                    <div>系统事件</div>
                    <div style="font-size: 12px; color: #909399;">系统内部产生的事件</div>
                  </div>
                </el-option>
                <el-option label="外部事件" value="external">
                  <div>
                    <div>外部事件</div>
                    <div style="font-size: 12px; color: #909399;">外部系统触发的事件</div>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="所属业务" v-if="form.type === 'business' || form.type === 'process'">
              <el-select v-model="form.businessId" placeholder="选择业务（可选）" clearable filterable style="width: 100%">
                <el-option
                  v-for="business in businessList"
                  :key="business.id"
                  :label="business.name"
                  :value="business.id"
                />
              </el-select>
              <div class="tip">业务事件和流程事件可以关联到特定业务，系统事件和外部事件为系统级</div>
            </el-form-item>
            <el-form-item label="事件描述">
              <el-input v-model="form.description" type="textarea" :rows="3" placeholder="事件描述" />
            </el-form-item>
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio label="active">启用</el-radio>
                <el-radio label="inactive">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="事件数据" name="data">
          <el-alert
            type="info"
            :closable="false"
            style="margin-bottom: 16px"
          >
            <template #title>
              <div style="font-size: 12px;">
                <div><strong>事件数据结构说明：</strong></div>
                <div>• 定义事件携带的数据结构（payload）</div>
                <div>• 订阅该事件的流程可以通过参数映射获取这些数据</div>
                <div>• 示例：订单创建事件可能包含 orderId、userId、amount 等字段</div>
              </div>
            </template>
          </el-alert>
          <div class="section-header">
            <span>数据字段</span>
            <el-button size="small" type="primary" @click="addDataField">添加字段</el-button>
          </div>
          <el-table :data="form.dataFields || []" style="width: 100%" size="small" border>
            <el-table-column prop="name" label="字段名" width="150">
              <template #default="scope">
                <el-input v-model="scope.row.name" size="small" placeholder="字段名" />
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="120">
              <template #default="scope">
                <el-select v-model="scope.row.type" size="small">
                  <el-option label="String" value="string" />
                  <el-option label="Number" value="number" />
                  <el-option label="Boolean" value="boolean" />
                  <el-option label="Object" value="object" />
                  <el-option label="Array" value="array" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" min-width="200">
              <template #default="scope">
                <el-input v-model="scope.row.description" size="small" placeholder="字段描述" />
              </template>
            </el-table-column>
            <el-table-column prop="required" label="必填" width="80">
              <template #default="scope">
                <el-checkbox v-model="scope.row.required" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="scope">
                <el-button size="small" text type="danger" @click="removeDataField(scope.$index)">删除</el-button>
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

    <!-- 关系视图弹窗 -->
    <el-dialog v-model="relationDialogVisible" title="事件关系视图" width="1000px">
      <div v-if="currentEvent">
        <el-descriptions :column="2" border style="margin-bottom: 20px">
          <el-descriptions-item label="事件编码">{{ currentEvent.code }}</el-descriptions-item>
          <el-descriptions-item label="事件名称">{{ currentEvent.name }}</el-descriptions-item>
          <el-descriptions-item label="事件类型">
            <el-tag :type="getTypeTag(currentEvent.type)">{{ getTypeLabel(currentEvent.type) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentEvent.status === 'active' ? 'success' : 'info'">
              {{ currentEvent.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <el-tabs v-model="relationTab">
          <el-tab-pane label="订阅该事件的流程" name="subscribed">
            <el-alert
              type="info"
              :closable="false"
              style="margin-bottom: 16px"
            >
              <template #title>
                <div style="font-size: 12px;">
                  这些流程在流程配置中设置了事件触发，当该事件发生时，会自动启动这些流程
                </div>
              </template>
            </el-alert>
            <el-table :data="getSubscribedProcesses(currentEvent.id)" style="width: 100%" size="small" border>
              <el-table-column prop="businessName" label="所属业务" width="150" />
              <el-table-column prop="processName" label="流程名称" min-width="180" />
              <el-table-column prop="processCode" label="流程编码" width="180" />
              <el-table-column label="触发条件" min-width="200">
                <template #default="scope">
                  <el-tag size="small" v-if="scope.row.triggerCondition">{{ scope.row.triggerCondition }}</el-tag>
                  <span v-else style="color: #909399;">无条件</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="scope">
                  <el-button size="small" text type="primary" @click="goToProcessDesigner(scope.row)">设计流程</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-if="getSubscribedProcesses(currentEvent.id).length === 0" description="暂无流程订阅该事件" :image-size="80" />
          </el-tab-pane>

          <el-tab-pane label="产生该事件的流程" name="produced">
            <el-alert
              type="info"
              :closable="false"
              style="margin-bottom: 16px"
            >
              <template #title>
                <div style="font-size: 12px;">
                  这些流程在执行过程中会产生该事件，用于触发后续流程或业务操作
                </div>
              </template>
            </el-alert>
            <el-table :data="getProducedProcesses(currentEvent.id)" style="width: 100%" size="small" border>
              <el-table-column prop="businessName" label="所属业务" width="150" />
              <el-table-column prop="processName" label="流程名称" min-width="180" />
              <el-table-column prop="processCode" label="流程编码" width="180" />
              <el-table-column prop="nodeName" label="产生节点" width="150" />
              <el-table-column label="操作" width="120">
                <template #default="scope">
                  <el-button size="small" text type="primary" @click="goToProcessDesigner(scope.row)">设计流程</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-if="getProducedProcesses(currentEvent.id).length === 0" description="暂无流程产生该事件" :image-size="80" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Connection } from '@element-plus/icons-vue'
import { getEngineEvents, upsertEngineEvent, removeEngineEvent, saveEngineEvents } from '../mock/engineEvents'

const router = useRouter()

// 业务列表
const businessList = ref([])

// 事件列表
const events = ref([])

// 流程订阅关系（事件ID -> 流程列表）
const eventSubscriptions = ref({})

// 流程产生事件关系（事件ID -> 流程列表）
const eventProducers = ref({})

// 筛选表单
const filterForm = ref({
  type: '',
  businessId: '',
  status: ''
})

// 弹窗
const dialogVisible = ref(false)
const relationDialogVisible = ref(false)
const tab = ref('basic')
const relationTab = ref('subscribed')
const currentEvent = ref(null)

// 表单数据
const form = ref({
  id: null,
  code: '',
  name: '',
  type: '',
  businessId: null,
  description: '',
  status: 'active',
  dataFields: []
})

// 加载业务列表
const loadBusinessList = () => {
  // TODO: 从API加载
  businessList.value = [
    { id: 1, code: 'order_process', name: '订单处理业务' },
    { id: 2, code: 'refund_process', name: '退款处理业务' }
  ]
}

// 加载事件列表（共用引擎事件管理数据源）
const loadEvents = () => {
  events.value = getEngineEvents()
  loadSubscriptions()
  loadProducers()
}

// 加载订阅关系（哪些流程订阅了哪些事件）
const loadSubscriptions = () => {
  // TODO: 从API加载流程配置，查找triggerType为'event'且triggerEventCode匹配的流程
  eventSubscriptions.value = {
    1: [ // order.created 被订阅
      {
        businessId: 1,
        businessName: '订单处理业务',
        businessCode: 'order_process',
        processId: 1,
        processCode: 'order_create_flow',
        processName: '订单创建流程',
        triggerCondition: 'event.payload.amount > 100'
      }
    ],
    2: [ // order.validated 被订阅
      {
        businessId: 1,
        businessName: '订单处理业务',
        businessCode: 'order_process',
        processId: 2,
        processCode: 'order_pay_flow',
        processName: '订单支付流程',
        triggerCondition: ''
      }
    ]
  }
}

// 加载产生关系（哪些流程会产生哪些事件）
const loadProducers = () => {
  // TODO: 从API加载流程节点配置，查找产生事件的节点
  eventProducers.value = {
    2: [ // order.validated 由以下流程产生
      {
        businessId: 1,
        businessName: '订单处理业务',
        businessCode: 'order_process',
        processId: 1,
        processCode: 'order_create_flow',
        processName: '订单创建流程',
        nodeName: '验证节点'
      }
    ],
    3: [ // order.paid 由以下流程产生
      {
        businessId: 1,
        businessName: '订单处理业务',
        businessCode: 'order_process',
        processId: 2,
        processCode: 'order_pay_flow',
        processName: '订单支付流程',
        nodeName: '支付节点'
      }
    ]
  }
}

// 筛选后的事件列表
const filteredEvents = computed(() => {
  let result = events.value
  if (filterForm.value.type) {
    result = result.filter(e => e.type === filterForm.value.type)
  }
  if (filterForm.value.businessId) {
    result = result.filter(e => e.businessId === filterForm.value.businessId)
  }
  if (filterForm.value.status) {
    result = result.filter(e => e.status === filterForm.value.status)
  }
  return result
})

// 重置筛选
const resetFilter = () => {
  filterForm.value = {
    type: '',
    businessId: '',
    status: ''
  }
  loadEvents()
}

// 获取业务名称
const getBusinessName = (businessId) => {
  const business = businessList.value.find(b => b.id === businessId)
  return business?.name || ''
}

// 获取订阅该事件的流程数量
const getSubscribedProcessCount = (eventId) => {
  return (eventSubscriptions.value[eventId] || []).length
}

// 获取产生该事件的流程数量
const getProducedProcessCount = (eventId) => {
  return (eventProducers.value[eventId] || []).length
}

// 获取订阅该事件的流程列表
const getSubscribedProcesses = (eventId) => {
  return eventSubscriptions.value[eventId] || []
}

// 获取产生该事件的流程列表
const getProducedProcesses = (eventId) => {
  return eventProducers.value[eventId] || []
}

// 事件类型标签
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

// 打开对话框
const openDialog = (row = null) => {
  if (row) {
    form.value = {
      ...row,
      dataFields: row.dataFields ? [...row.dataFields] : []
    }
  } else {
    form.value = {
      id: null,
      code: '',
      name: '',
      type: '',
      businessId: null,
      description: '',
      status: 'active',
      dataFields: []
    }
  }
  tab.value = 'basic'
  dialogVisible.value = true
}

// 事件类型变化
const onTypeChange = () => {
  // 如果是系统事件或外部事件，清除业务ID
  if (form.value.type === 'system' || form.value.type === 'external') {
    form.value.businessId = null
  }
}

// 添加数据字段
const addDataField = () => {
  if (!form.value.dataFields) {
    form.value.dataFields = []
  }
  form.value.dataFields.push({
    name: '',
    type: 'string',
    description: '',
    required: false
  })
}

// 删除数据字段
const removeDataField = (index) => {
  form.value.dataFields.splice(index, 1)
}

// 保存事件
const saveEvent = () => {
  if (!form.value.code || !form.value.name || !form.value.type) {
    ElMessage.warning('请填写必填项')
    return
  }
  const list = upsertEngineEvent({ ...form.value })
  events.value = list
  ElMessage.success(form.value.id ? '更新成功' : '创建成功')
  dialogVisible.value = false
  loadEvents()
}

// 删除事件
const deleteEvent = (row) => {
  const subscribedCount = getSubscribedProcessCount(row.id)
  const producedCount = getProducedProcessCount(row.id)
  if (subscribedCount > 0 || producedCount > 0) {
    ElMessageBox.confirm(
      `该事件被 ${subscribedCount} 个流程订阅，由 ${producedCount} 个流程产生，删除后可能影响相关流程，确定要删除吗？`,
      '提示',
      { type: 'warning' }
    ).then(() => {
      events.value = removeEngineEvent(row.id)
      ElMessage.success('删除成功')
      loadEvents()
    }).catch(() => {})
  } else {
    ElMessageBox.confirm('确定要删除该事件吗？', '提示', { type: 'warning' }).then(() => {
      events.value = removeEngineEvent(row.id)
      ElMessage.success('删除成功')
      loadEvents()
    }).catch(() => {})
  }
}

// 查看关系视图
const viewRelations = (row) => {
  currentEvent.value = row
  relationTab.value = 'subscribed'
  relationDialogVisible.value = true
}

// 跳转到流程设计器
const goToProcessDesigner = (processInfo) => {
  router.push({
    name: 'engine-process',
    query: {
      businessId: processInfo.businessId,
      businessCode: processInfo.businessCode || '',
      processId: processInfo.processId,
      processCode: processInfo.processCode
    }
  })
}

onMounted(() => {
  loadBusinessList()
  loadEvents()
})
</script>

<style scoped>
.page-wrapper {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.subtitle {
  margin: 4px 0 0;
  color: #909399;
  font-size: 14px;
}

.panel-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>

