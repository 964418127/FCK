<template>
  <div class="message-plan">
    <div class="page-header">
      <h2>消息发送计划</h2>
      <p>管理消息发送计划，支持即时发送和定时发送</p>
    </div>
    
    <div class="page-content">
      <!-- 操作栏 -->
      <div class="action-bar">
        <el-button type="primary" @click="handleAddPlan">
          <el-icon><Plus /></el-icon>
          新增计划
        </el-button>
      </div>
      
      <!-- 搜索栏 -->
      <div class="search-section">
        <el-input
          v-model="searchForm.keyword"
          placeholder="搜索计划编号、计划主题"
          style="width: 300px"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="searchForm.status" placeholder="计划状态" clearable style="width: 150px">
          <el-option label="全部" value="" />
          <el-option label="计划中" value="planned" />
          <el-option label="待发送" value="pending" />
          <el-option label="发送中" value="sending" />
          <el-option label="已发送" value="sent" />
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
      
      <!-- 计划列表 -->
      <el-table :data="filteredList" border stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="planCode" label="计划编号" width="120" />
        <el-table-column prop="planName" label="计划主题" min-width="200" />
        <el-table-column label="目标人群" min-width="150">
          <template #default="scope">
            {{ formatTargetAudience(scope.row.targetAudience) }}
          </template>
        </el-table-column>
        <el-table-column prop="templateCode" label="模板编号" width="120" />
        <el-table-column prop="subject" label="消息主题" min-width="150" show-overflow-tooltip />
        <el-table-column prop="sendTime" label="发送时间" width="180">
          <template #default="scope">
            {{ scope.row.sendTime ? formatDateTime(scope.row.sendTime) : '即时发送' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="计划状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ formatStatus(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button type="primary" link @click="handleEdit(scope.row)">
                编辑
              </el-button>
              <el-button type="primary" link @click="handleViewDetail(scope.row)">
                明细
              </el-button>
              <el-dropdown trigger="click" class="more-link">
                <span class="more-link">
                  更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleSimulate(scope.row)">
                      模拟发送
                    </el-dropdown-item>
                    <el-dropdown-item 
                      v-if="scope.row.status === 'pending' || scope.row.status === 'planned'"
                      @click="handleTrigger(scope.row)"
                    >
                      触发发送
                    </el-dropdown-item>
                    <el-dropdown-item 
                      v-if="scope.row.status === 'sending'"
                      @click="handleCancel(scope.row)"
                      divided
                    >
                      撤销
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
    
    <!-- 新增/编辑计划对话框 -->
    <el-dialog
      v-model="planDialogVisible"
      :title="planDialogTitle"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="planFormRef"
        :model="planForm"
        :rules="planFormRules"
        label-width="120px"
      >
        <el-form-item label="计划主题" prop="planName">
          <el-input v-model="planForm.planName" placeholder="请输入计划主题" />
        </el-form-item>
        <el-form-item label="模板编号" prop="templateCode">
          <el-select v-model="planForm.templateCode" placeholder="请选择模板" style="width: 100%" filterable>
            <el-option
              v-for="template in templateOptions"
              :key="template.code"
              :label="`${template.code} - ${template.title}`"
              :value="template.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="消息主题" prop="subject">
          <el-input v-model="planForm.subject" placeholder="请输入消息主题" />
        </el-form-item>
        <el-form-item label="消息内容" prop="content">
          <el-input
            v-model="planForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入消息内容，支持变量如 {userName}"
          />
        </el-form-item>
        <el-form-item label="目标人群" prop="targetAudience">
          <div class="target-audience">
            <div class="audience-block">
              <div class="block-title">平台超管身份</div>
              <el-select
                v-model="planForm.targetAudience.platformAdmins"
                placeholder="请选择平台超管身份"
                style="width: 100%"
                multiple
                clearable
                collapse-tags
                collapse-tags-tooltip
              >
                <el-option
                  v-for="item in platformAdminOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>

            <div class="audience-block">
              <div class="block-title">用户级身份</div>
              <el-space wrap>
                <div class="sub-block">
                  <div class="sub-title">认证用户</div>
                  <el-select
                    v-model="planForm.targetAudience.certifiedIdentities"
                    placeholder="选择认证身份"
                    style="width: 260px"
                    multiple
                    clearable
                    collapse-tags
                    collapse-tags-tooltip
                  >
                    <el-option
                      v-for="item in certifiedIdentityOptions"
                      :key="item"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                </div>
                <div class="sub-block">
                  <div class="sub-title">访客用户</div>
                  <el-select
                    v-model="planForm.targetAudience.visitorTypes"
                    placeholder="选择访客类型"
                    style="width: 260px"
                    multiple
                    clearable
                    collapse-tags
                    collapse-tags-tooltip
                  >
                    <el-option label="普通用户" value="normal" />
                    <el-option label="匿名用户" value="anonymous" />
                  </el-select>
                </div>
              </el-space>
            </div>

            <div class="audience-block">
              <div class="block-title">品牌角色</div>
              <div v-if="planForm.targetAudience.brandTargets.length">
                <div
                  v-for="(brandTarget, index) in planForm.targetAudience.brandTargets"
                  :key="brandTarget.id"
                  class="brand-target-row"
                >
                  <el-select
                    v-model="brandTarget.brandId"
                    placeholder="选择品牌"
                    style="width: 200px"
                    @change="() => handleBrandTargetChange(index)"
                  >
                    <el-option v-for="brand in brandOptions" :key="brand.id" :label="brand.name" :value="brand.id" />
                  </el-select>
                  <el-select
                    v-model="brandTarget.roleIds"
                    placeholder="选择品牌角色"
                    style="width: 320px; margin-left: 12px"
                    multiple
                    clearable
                    collapse-tags
                    collapse-tags-tooltip
                  >
                    <el-option
                      v-for="role in getBrandRoleOptions(brandTarget.brandId)"
                      :key="role.id"
                      :label="role.name"
                      :value="role.id"
                    />
                  </el-select>
                  <el-button
                    type="danger"
                    link
                    style="margin-left: 8px"
                    @click="removeBrandTarget(index)"
                  >
                    移除
                  </el-button>
                </div>
              </div>
              <el-button type="primary" link @click="addBrandTarget">
                <el-icon><Plus /></el-icon>
                添加品牌角色条件
              </el-button>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="发送时间" prop="sendTimeType">
          <el-radio-group v-model="planForm.sendTimeType">
            <el-radio label="immediate">即时发送</el-radio>
            <el-radio label="scheduled">定时发送</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="planForm.sendTimeType === 'scheduled'"
          label="计划发送时间"
          prop="sendTime"
        >
          <el-date-picker
            v-model="planForm.sendTime"
            type="datetime"
            placeholder="选择发送时间"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="planDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitPlan">确定</el-button>
      </template>
    </el-dialog>
    
    <!-- 发送明细对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="发送明细"
      width="900px"
    >
      <el-table :data="detailList" border stripe style="width: 100%">
        <el-table-column prop="userUid" label="用户UID" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ formatStatus(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="plannedTime" label="计划发送时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.plannedTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="actualTime" label="实际发送时间" width="180">
          <template #default="scope">
            {{ scope.row.actualTime ? formatDateTime(scope.row.actualTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="channel" label="消息通道" width="120">
          <template #default="scope">
            {{ formatChannel(scope.row.channel) }}
          </template>
        </el-table-column>
        <el-table-column prop="errorMessage" label="错误信息" min-width="200" show-overflow-tooltip />
      </el-table>
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
const planDialogVisible = ref(false)
const planDialogTitle = ref('新增计划')
const detailDialogVisible = ref(false)
const planFormRef = ref(null)

// 平台超管身份选项（示例使用平台岗位角色）
const platformAdminOptions = ref([
  { label: '平台超级管理员', value: 'platform-super-admin' },
  { label: '平台运营总监', value: 'platform-ops' },
  { label: '平台初始身份', value: 'platform-init' }
])

// 认证用户身份选项
const certifiedIdentityOptions = ref(['推拿师', '理疗师', '康复师', '经络讲师'])

// 品牌与角色选项（与用户中心保持一致）
const brandOptions = ref([
  { id: 'brand-1', name: '品牌A' },
  { id: 'brand-2', name: '品牌B' },
  { id: 'brand-3', name: '品牌C' }
])

const brandRolesData = ref({
  'brand-1': [
    { id: 'brand-role-super-1', name: '品牌超级管理员' },
    { id: 'brand-role-init-1', name: '员工初始角色' },
    { id: 'brand-role-ops-1', name: '品牌运营总监' },
    { id: 'brand-role-care-1', name: '客情维护专员' }
  ],
  'brand-2': [
    { id: 'brand-role-super-2', name: '品牌超级管理员' },
    { id: 'brand-role-init-2', name: '员工初始角色' },
    { id: 'brand-role-ops-2', name: '品牌运营总监' }
  ],
  'brand-3': [
    { id: 'brand-role-super-3', name: '品牌超级管理员' },
    { id: 'brand-role-init-3', name: '员工初始角色' }
  ]
})

// 表单数据
const planForm = ref({
  id: '',
  planName: '',
  templateCode: '',
  subject: '',
  content: '',
  targetAudience: {
    platformAdmins: [],
    certifiedIdentities: [],
    visitorTypes: [],
    brandTargets: []
  },
  sendTimeType: 'immediate',
  sendTime: null
})

// 表单验证规则
const planFormRules = {
  planName: [
    { required: true, message: '请输入计划主题', trigger: 'blur' }
  ],
  templateCode: [
    { required: true, message: '请选择模板编号', trigger: 'change' }
  ],
  subject: [
    { required: true, message: '请输入消息主题', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入消息内容', trigger: 'blur' }
  ],
  targetAudience: [
    {
      validator: (rule, value, callback) => {
        const v = planForm.value.targetAudience
        const hasPlatform = v.platformAdmins && v.platformAdmins.length > 0
        const hasCertified = v.certifiedIdentities && v.certifiedIdentities.length > 0
        const hasVisitor = v.visitorTypes && v.visitorTypes.length > 0
        const hasBrand = v.brandTargets && v.brandTargets.some(bt => bt.brandId && (bt.roleIds?.length || 0) >= 0)
        if (hasPlatform || hasCertified || hasVisitor || hasBrand) {
          callback()
        } else {
          callback(new Error('请至少选择一个目标人群条件'))
        }
      },
      trigger: 'change'
    }
  ],
  sendTime: [
    { 
      validator: (rule, value, callback) => {
        if (planForm.value.sendTimeType === 'scheduled' && !value) {
          callback(new Error('请选择计划发送时间'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 模板选项
const templateOptions = ref([
  { code: 'TPL001', title: '预约失效通知模板' },
  { code: 'TPL002', title: '验证码模板' },
  { code: 'TPL003', title: '课程开始提醒模板' }
])

// 发送明细列表
const detailList = ref([
  {
    userUid: 'U001',
    status: 'success',
    plannedTime: new Date('2024-01-15 10:00:00'),
    actualTime: new Date('2024-01-15 10:00:01'),
    channel: 'sms',
    errorMessage: ''
  },
  {
    userUid: 'U002',
    status: 'failed',
    plannedTime: new Date('2024-01-15 10:00:00'),
    actualTime: null,
    channel: 'sms',
    errorMessage: '网络连接超时'
  }
])

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
const planList = ref([
  {
    id: '1',
    planCode: 'PLAN001',
    planName: '预约失效提醒计划',
    targetAudience: {
      platformAdmins: ['platform-super-admin'],
      certifiedIdentities: ['推拿师', '理疗师'],
      visitorTypes: ['normal'],
      brandTargets: [
        { id: 'brand-target-1', brandId: 'brand-1', roleIds: ['brand-role-super-1'] }
      ]
    },
    templateCode: 'TPL001',
    subject: '预约失效通知',
    sendTime: null,
    status: 'sent'
  }
])

// 过滤后的列表
const filteredList = computed(() => {
  let list = [...planList.value]
  
  if (searchForm.value.keyword) {
    const keyword = searchForm.value.keyword.toLowerCase()
    list = list.filter(item => 
      item.planCode.toLowerCase().includes(keyword) ||
      item.planName.toLowerCase().includes(keyword)
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

// 格式化函数
const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatStatus = (status) => {
  const statusMap = {
    'planned': '计划中',
    'pending': '待发送',
    'sending': '发送中',
    'sent': '已发送'
  }
  return statusMap[status] || status
}

const getStatusType = (status) => {
  const typeMap = {
    'planned': 'info',
    'pending': 'warning',
    'sending': 'primary',
    'sent': 'success'
  }
  return typeMap[status] || ''
}

const formatTargetAudience = (audience) => {
  if (!audience) return '-'
  const parts = []
  if (audience.platformAdmins?.length) {
    const labels = audience.platformAdmins.map(code => platformAdminOptions.value.find(item => item.value === code)?.label || code)
    parts.push(`平台超管：${labels.join('、')}`)
  }
  if (audience.certifiedIdentities?.length) {
    parts.push(`认证：${audience.certifiedIdentities.join('、')}`)
  }
  if (audience.visitorTypes?.length) {
    const visitorLabels = audience.visitorTypes.map(v => v === 'normal' ? '普通用户' : v === 'anonymous' ? '匿名用户' : v)
    parts.push(`访客：${visitorLabels.join('、')}`)
  }
  if (audience.brandTargets?.length) {
    const brandDesc = audience.brandTargets.map(bt => {
      const brandName = brandOptions.value.find(b => b.id === bt.brandId)?.name || bt.brandId
      const roles = (bt.roleIds || []).map(roleId => brandRolesData.value[bt.brandId]?.find(r => r.id === roleId)?.name || roleId)
      return `${brandName}${roles.length ? `：${roles.join('、')}` : ''}`
    })
    parts.push(`品牌角色：${brandDesc.join('；')}`)
  }
  return parts.length ? parts.join(' | ') : '-'
}

const normalizeTargetAudience = (audience = {}) => {
  return {
    platformAdmins: audience.platformAdmins ? [...audience.platformAdmins] : [],
    certifiedIdentities: audience.certifiedIdentities || audience.identities || [],
    visitorTypes: audience.visitorTypes ? [...audience.visitorTypes] : [],
    brandTargets: (audience.brandTargets || []).map(bt => ({
      id: bt.id || `brand-target-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      brandId: bt.brandId || brandOptions.value[0]?.id || '',
      roleIds: bt.roleIds ? [...bt.roleIds] : []
    }))
  }
}

const addBrandTarget = () => {
  planForm.value.targetAudience.brandTargets.push({
    id: `brand-target-${Date.now()}`,
    brandId: brandOptions.value[0]?.id || '',
    roleIds: []
  })
}

const removeBrandTarget = (index) => {
  planForm.value.targetAudience.brandTargets.splice(index, 1)
}

const handleBrandTargetChange = (index) => {
  if (planForm.value.targetAudience.brandTargets[index]) {
    planForm.value.targetAudience.brandTargets[index].roleIds = []
  }
}

const getBrandRoleOptions = (brandId) => {
  return brandRolesData.value[brandId] || []
}

// 操作函数
const handleAddPlan = () => {
  planDialogTitle.value = '新增计划'
  planForm.value = {
    id: '',
    planName: '',
    templateCode: '',
    subject: '',
    content: '',
    targetAudience: {
      platformAdmins: [],
      certifiedIdentities: [],
      visitorTypes: [],
      brandTargets: []
    },
    sendTimeType: 'immediate',
    sendTime: null
  }
  planDialogVisible.value = true
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
  planDialogTitle.value = '编辑计划'
  const normalizedAudience = normalizeTargetAudience(row.targetAudience)
  planForm.value = {
    id: row.id,
    planName: row.planName,
    templateCode: row.templateCode,
    subject: row.subject,
    content: row.content || '',
    targetAudience: normalizedAudience,
    sendTimeType: row.sendTime ? 'scheduled' : 'immediate',
    sendTime: row.sendTime ? new Date(row.sendTime) : null
  }
  planDialogVisible.value = true
}

const handleSimulate = (row) => {
  ElMessageBox.prompt('请输入测试用户UID', '模拟发送', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: '请输入UID'
  }).then(({ value }) => {
    ElMessage.success(`模拟发送成功，UID: ${value}`)
  }).catch(() => {})
}

const handleTrigger = (row) => {
  ElMessageBox.confirm('确定要触发发送该计划吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('触发发送成功')
  }).catch(() => {})
}

const handleViewDetail = (row) => {
  // 这里应该根据计划ID加载实际的发送明细数据
  detailDialogVisible.value = true
}

// 提交计划
const handleSubmitPlan = async () => {
  if (!planFormRef.value) return
  
  try {
    await planFormRef.value.validate()
    
    const normalizedAudience = normalizeTargetAudience(planForm.value.targetAudience)
    const planData = {
      id: planForm.value.id || `plan-${Date.now()}`,
      planCode: planForm.value.id ? planList.value.find(p => p.id === planForm.value.id)?.planCode : `PLAN${Date.now().toString().slice(-6)}`,
      planName: planForm.value.planName,
      templateCode: planForm.value.templateCode,
      subject: planForm.value.subject,
      targetAudience: { ...normalizedAudience },
      sendTime: planForm.value.sendTimeType === 'scheduled' ? planForm.value.sendTime : null,
      status: 'planned'
    }
    
    if (planForm.value.id) {
      // 编辑
      const index = planList.value.findIndex(p => p.id === planForm.value.id)
      if (index > -1) {
        planList.value[index] = { ...planList.value[index], ...planData }
        ElMessage.success('编辑成功')
      }
    } else {
      // 新增
      planList.value.push(planData)
      ElMessage.success('新增成功')
    }
    
    planDialogVisible.value = false
  } catch (error) {
    console.error('表单验证失败', error)
  }
}

const handleCancel = (row) => {
  ElMessageBox.confirm('确定要撤销发送该计划吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('撤销成功')
  }).catch(() => {})
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该计划吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = planList.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      planList.value.splice(index, 1)
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
.message-plan {
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

.target-audience {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.audience-block {
  border: 1px dashed #e4e7ed;
  border-radius: 8px;
  padding: 12px;
  background: #f9fafb;
}

.block-title {
  font-weight: 600;
  margin-bottom: 8px;
  color: #303133;
}

.sub-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sub-title {
  font-size: 13px;
  color: #606266;
}

.brand-target-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
</style>

