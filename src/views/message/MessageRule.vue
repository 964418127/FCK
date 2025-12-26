<template>
  <div class="message-rule">
    <div class="page-header">
      <h2>规则配置</h2>
      <p>配置消息发送规则，限制何时发、如何发、给谁发</p>
    </div>
    
    <div class="page-content">
      <!-- 操作栏 -->
      <div class="action-bar">
        <el-button type="primary" @click="handleAddRule">
          <el-icon><Plus /></el-icon>
          新增规则配置
        </el-button>
      </div>
      
      <!-- 搜索栏 -->
      <div class="search-section">
        <el-input
          v-model="searchForm.keyword"
          placeholder="搜索规则编号、规则名称"
          style="width: 300px"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="searchForm.status" placeholder="状态" clearable style="width: 150px">
          <el-option label="全部" value="" />
          <el-option label="启用" value="enabled" />
          <el-option label="禁用" value="disabled" />
        </el-select>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </div>
      
      <!-- 规则列表 -->
      <el-table :data="filteredList" border stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="ruleCode" label="规则编号" width="120" />
        <el-table-column prop="ruleName" label="规则名称" min-width="150" />
        <el-table-column prop="ruleDescription" label="规则描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="associatedTemplates" label="关联模板" width="200">
          <template #default="scope">
            {{ scope.row.associatedTemplates?.join('、') || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'enabled' ? 'success' : 'info'" size="small">
              {{ scope.row.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button type="primary" link @click="handleEdit(scope.row)">
                编辑
              </el-button>
              <el-dropdown trigger="click" class="more-link">
                <span class="more-link">
                  更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleViewDetail(scope.row)">
                      详情
                    </el-dropdown-item>
                    <el-dropdown-item 
                      @click="handleToggleStatus(scope.row)"
                      divided
                    >
                      {{ scope.row.status === 'enabled' ? '禁用' : '启用' }}
                    </el-dropdown-item>
                    <el-dropdown-item @click="handleDelete(scope.row)">
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
    
    <!-- 新增/编辑规则对话框 -->
    <el-dialog
      v-model="ruleDialogVisible"
      :title="ruleDialogTitle"
      width="900px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="ruleFormRef"
        :model="ruleForm"
        :rules="ruleFormRules"
        label-width="140px"
      >
        <el-form-item label="规则编号" prop="ruleCode">
          <el-input 
            v-model="ruleForm.ruleCode" 
            placeholder="请输入规则编号"
            :disabled="!!ruleForm.id"
          />
          <div v-if="!ruleForm.id" class="form-tip">规则编号唯一，创建后不可修改</div>
        </el-form-item>
        <el-form-item label="规则名称" prop="ruleName">
          <el-input v-model="ruleForm.ruleName" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="规则描述" prop="ruleDescription">
          <el-input
            v-model="ruleForm.ruleDescription"
            type="textarea"
            :rows="3"
            placeholder="请输入规则描述"
          />
        </el-form-item>
        <el-divider>频次限制</el-divider>
        <el-form-item label="同用户限制">
          <div style="display: flex; gap: 12px; align-items: center; width: 100%">
            <span>X时间内最多接收</span>
            <el-input-number v-model="ruleForm.frequencyLimit.userTime" :min="1" style="width: 100px" />
            <el-select v-model="ruleForm.frequencyLimit.userTimeUnit" style="width: 100px">
              <el-option label="小时" value="hour" />
              <el-option label="天" value="day" />
            </el-select>
            <span>条相同类型消息</span>
          </div>
        </el-form-item>
        <el-form-item label="同模板限制">
          <div style="display: flex; gap: 12px; align-items: center; width: 100%">
            <span>Y时间内最多发送</span>
            <el-input-number v-model="ruleForm.frequencyLimit.templateTime" :min="1" style="width: 100px" />
            <el-select v-model="ruleForm.frequencyLimit.templateTimeUnit" style="width: 100px">
              <el-option label="小时" value="hour" />
              <el-option label="天" value="day" />
            </el-select>
            <span>条</span>
          </div>
        </el-form-item>
        <el-divider>间隔限制</el-divider>
        <el-form-item label="静默期">
          <div style="display: flex; gap: 12px; align-items: center; width: 100%">
            <span>同用户接收相同类型消息至少间隔</span>
            <el-input-number v-model="ruleForm.intervalLimit.time" :min="1" style="width: 100px" />
            <el-select v-model="ruleForm.intervalLimit.timeUnit" style="width: 100px">
              <el-option label="分钟" value="minute" />
              <el-option label="小时" value="hour" />
              <el-option label="天" value="day" />
            </el-select>
          </div>
        </el-form-item>
        <el-divider>路由规则</el-divider>
        <el-form-item label="消息类型">
          <el-select v-model="ruleForm.routeRule.messageType" placeholder="请选择消息类型" style="width: 100%">
            <el-option label="验证码" value="verify" />
            <el-option label="通知" value="notice" />
            <el-option label="营销" value="marketing" />
          </el-select>
        </el-form-item>
        <el-form-item label="通道优先级">
          <el-select
            v-model="ruleForm.routeRule.channelPriority"
            placeholder="请选择通道优先级"
            style="width: 100%"
            multiple
            clearable
          >
            <el-option label="站内信" value="inbox" />
            <el-option label="App推送" value="push" />
            <el-option label="邮件" value="email" />
            <el-option label="微信模板消息" value="wechat" />
            <el-option label="短信" value="sms" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联模板" prop="associatedTemplates">
          <el-select
            v-model="ruleForm.associatedTemplates"
            placeholder="请选择关联模板"
            style="width: 100%"
            multiple
            clearable
            collapse-tags
            collapse-tags-tooltip
          >
            <el-option label="TPL001 - 预约失效通知模板" value="TPL001" />
            <el-option label="TPL002 - 验证码模板" value="TPL002" />
            <el-option label="TPL003 - 课程开始提醒模板" value="TPL003" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitRule">确定</el-button>
      </template>
    </el-dialog>
    
    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="规则详情"
      width="700px"
    >
      <el-descriptions :column="2" border v-if="selectedRule">
        <el-descriptions-item label="规则编号" :span="2">{{ selectedRule.ruleCode }}</el-descriptions-item>
        <el-descriptions-item label="规则名称" :span="2">{{ selectedRule.ruleName }}</el-descriptions-item>
        <el-descriptions-item label="规则描述" :span="2">{{ selectedRule.ruleDescription }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="selectedRule.status === 'enabled' ? 'success' : 'info'" size="small">
            {{ selectedRule.status === 'enabled' ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="关联模板" :span="2">
          {{ selectedRule.associatedTemplates?.join('、') || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="频次限制" :span="2">
          <div>同用户：{{ selectedRule.frequencyLimit?.userTime || '-' }}{{ selectedRule.frequencyLimit?.userTimeUnit || '' }}内最多{{ selectedRule.frequencyLimit?.userCount || '-' }}条</div>
          <div>同模板：{{ selectedRule.frequencyLimit?.templateTime || '-' }}{{ selectedRule.frequencyLimit?.templateTimeUnit || '' }}内最多{{ selectedRule.frequencyLimit?.templateCount || '-' }}条</div>
        </el-descriptions-item>
        <el-descriptions-item label="间隔限制" :span="2">
          静默期：{{ selectedRule.intervalLimit?.time || '-' }}{{ selectedRule.intervalLimit?.timeUnit || '' }}
        </el-descriptions-item>
        <el-descriptions-item label="路由规则" :span="2">
          <div>消息类型：{{ formatMessageType(selectedRule.routeRule?.messageType) }}</div>
          <div>通道优先级：{{ selectedRule.routeRule?.channelPriority?.map(c => formatChannel(c)).join(' > ') || '-' }}</div>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, ArrowDown } from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const searchForm = ref({
  keyword: '',
  status: ''
})

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 对话框
const ruleDialogVisible = ref(false)
const ruleDialogTitle = ref('新增规则配置')
const detailDialogVisible = ref(false)
const ruleFormRef = ref(null)
const selectedRule = ref(null)

// 表单数据
const ruleForm = ref({
  id: '',
  ruleCode: '',
  ruleName: '',
  ruleDescription: '',
  frequencyLimit: {
    userTime: 24,
    userTimeUnit: 'hour',
    userCount: 3,
    templateTime: 24,
    templateTimeUnit: 'hour',
    templateCount: 100
  },
  intervalLimit: {
    time: 30,
    timeUnit: 'minute'
  },
  routeRule: {
    messageType: '',
    channelPriority: []
  },
  associatedTemplates: []
})

// 表单验证规则
const ruleFormRules = {
  ruleCode: [
    { required: true, message: '请输入规则编号', trigger: 'blur' }
  ],
  ruleName: [
    { required: true, message: '请输入规则名称', trigger: 'blur' }
  ],
  associatedTemplates: [
    { required: true, message: '请选择关联模板', trigger: 'change' }
  ]
}

// 格式化函数
const formatMessageType = (type) => {
  const typeMap = {
    'verify': '验证码',
    'notice': '通知',
    'marketing': '营销'
  }
  return typeMap[type] || type || '-'
}

const formatChannel = (channel) => {
  const channelMap = {
    'inbox': '站内信',
    'push': 'App推送',
    'email': '邮件',
    'wechat': '微信模板消息',
    'sms': '短信'
  }
  return channelMap[channel] || channel
}

// 模拟数据
const ruleList = ref([
  {
    id: '1',
    ruleCode: 'RULE001',
    ruleName: '营销消息频次限制',
    ruleDescription: '同用户24小时内最多接收3条营销类消息',
    frequencyLimit: {
      userTime: 24,
      userTimeUnit: 'hour',
      userCount: 3,
      templateTime: 24,
      templateTimeUnit: 'hour',
      templateCount: 100
    },
    intervalLimit: {
      time: 30,
      timeUnit: 'minute'
    },
    routeRule: {
      messageType: 'marketing',
      channelPriority: ['inbox', 'push', 'sms']
    },
    associatedTemplates: ['TPL001', 'TPL002'],
    status: 'enabled'
  }
])

// 过滤后的列表
const filteredList = computed(() => {
  let list = [...ruleList.value]
  
  if (searchForm.value.keyword) {
    const keyword = searchForm.value.keyword.toLowerCase()
    list = list.filter(item => 
      item.ruleCode.toLowerCase().includes(keyword) ||
      item.ruleName.toLowerCase().includes(keyword)
    )
  }
  
  if (searchForm.value.status) {
    list = list.filter(item => item.status === searchForm.value.status)
  }
  
  pagination.value.total = list.length
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return list.slice(start, end)
})

// 操作函数
const handleAddRule = () => {
  ruleDialogTitle.value = '新增规则配置'
  ruleForm.value = {
    id: '',
    ruleCode: '',
    ruleName: '',
    ruleDescription: '',
    frequencyLimit: {
      userTime: 24,
      userTimeUnit: 'hour',
      userCount: 3,
      templateTime: 24,
      templateTimeUnit: 'hour',
      templateCount: 100
    },
    intervalLimit: {
      time: 30,
      timeUnit: 'minute'
    },
    routeRule: {
      messageType: '',
      channelPriority: []
    },
    associatedTemplates: []
  }
  ruleDialogVisible.value = true
}

const handleSearch = () => {
  pagination.value.currentPage = 1
}

const handleReset = () => {
  searchForm.value = {
    keyword: '',
    status: ''
  }
  pagination.value.currentPage = 1
}

const handleEdit = (row) => {
  ruleDialogTitle.value = '编辑规则配置'
  ruleForm.value = {
    id: row.id,
    ruleCode: row.ruleCode,
    ruleName: row.ruleName,
    ruleDescription: row.ruleDescription || '',
    frequencyLimit: row.frequencyLimit || {
      userTime: 24,
      userTimeUnit: 'hour',
      userCount: 3,
      templateTime: 24,
      templateTimeUnit: 'hour',
      templateCount: 100
    },
    intervalLimit: row.intervalLimit || {
      time: 30,
      timeUnit: 'minute'
    },
    routeRule: row.routeRule || {
      messageType: '',
      channelPriority: []
    },
    associatedTemplates: row.associatedTemplates || []
  }
  ruleDialogVisible.value = true
}

const handleViewDetail = (row) => {
  selectedRule.value = row
  detailDialogVisible.value = true
}

// 提交规则
const handleSubmitRule = async () => {
  if (!ruleFormRef.value) return
  
  try {
    await ruleFormRef.value.validate()
    
    const ruleData = {
      id: ruleForm.value.id || `rule-${Date.now()}`,
      ruleCode: ruleForm.value.ruleCode,
      ruleName: ruleForm.value.ruleName,
      ruleDescription: ruleForm.value.ruleDescription,
      frequencyLimit: { ...ruleForm.value.frequencyLimit },
      intervalLimit: { ...ruleForm.value.intervalLimit },
      routeRule: { ...ruleForm.value.routeRule },
      associatedTemplates: [...ruleForm.value.associatedTemplates],
      status: 'enabled'
    }
    
    if (ruleForm.value.id) {
      // 编辑
      const index = ruleList.value.findIndex(r => r.id === ruleForm.value.id)
      if (index > -1) {
        ruleList.value[index] = { ...ruleList.value[index], ...ruleData }
        ElMessage.success('编辑成功')
      }
    } else {
      // 新增
      ruleList.value.push(ruleData)
      ElMessage.success('新增成功')
    }
    
    ruleDialogVisible.value = false
  } catch (error) {
    console.error('表单验证失败', error)
  }
}

const handleToggleStatus = (row) => {
  row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
  ElMessage.success(`规则已${row.status === 'enabled' ? '启用' : '禁用'}`)
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该规则吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = ruleList.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      ruleList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const handleSizeChange = (size) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
}

const handlePageChange = (page) => {
  pagination.value.currentPage = page
}
</script>

<style scoped>
.message-rule {
  padding: 0;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.page-header p {
  margin: 0;
  color: hsl(var(--muted-foreground));
  font-size: 14px;
}

.page-content {
  background: hsl(var(--background));
  border-radius: var(--radius-lg);
  padding: 20px;
}

.action-bar {
  margin-bottom: 20px;
}

.search-section {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: nowrap;
}

.more-link {
  color: hsl(var(--primary));
  cursor: pointer;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
}

.more-link:hover {
  color: hsl(var(--primary-hover));
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.form-tip {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  margin-top: 4px;
}
</style>

