<template>
  <div class="message-template">
    <div class="page-header">
      <h2>模板配置</h2>
      <p>管理消息模板，定义消息内容格式</p>
    </div>
    
    <div class="page-content">
      <!-- 操作栏 -->
      <div class="action-bar">
        <el-button type="primary" @click="handleAddTemplate">
          <el-icon><Plus /></el-icon>
          新增模板
        </el-button>
      </div>
      
      <!-- 搜索栏 -->
      <div class="search-section">
        <el-input
          v-model="searchForm.keyword"
          placeholder="搜索模板编号、模板标题"
          style="width: 300px"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="searchForm.templateType" placeholder="模板类型" clearable style="width: 150px">
          <el-option label="全部" value="" />
          <el-option label="短信" value="sms" />
          <el-option label="站内信" value="inbox" />
          <el-option label="App推送" value="push" />
        </el-select>
        <el-select v-model="searchForm.messageType" placeholder="消息类型" clearable style="width: 150px">
          <el-option label="全部" value="" />
          <el-option label="验证码" value="verify" />
          <el-option label="通知" value="notice" />
          <el-option label="营销" value="marketing" />
        </el-select>
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
      
      <!-- 模板列表 -->
      <el-table :data="filteredList" border stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="templateCode" label="模板编号" width="120" />
        <el-table-column prop="templateTitle" label="模板标题" min-width="150" />
        <el-table-column prop="templateType" label="模板类型" width="120">
          <template #default="scope">
            {{ formatTemplateType(scope.row.templateType) }}
          </template>
        </el-table-column>
        <el-table-column prop="messageType" label="消息类型" width="120">
          <template #default="scope">
            {{ formatMessageType(scope.row.messageType) }}
          </template>
        </el-table-column>
        <el-table-column prop="subject" label="消息主题" min-width="150" show-overflow-tooltip />
        <el-table-column prop="channels" label="关联通道" width="200">
          <template #default="scope">
            {{ scope.row.channels?.map(c => formatChannel(c)).join('、') || '-' }}
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
                    <el-dropdown-item @click="handleSimulate(scope.row)">
                      模拟发送
                    </el-dropdown-item>
                    <el-dropdown-item 
                      @click="handleToggleStatus(scope.row)"
                      divided
                    >
                      {{ scope.row.status === 'enabled' ? '禁用' : '启用' }}
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
    
    <!-- 新增/编辑模板对话框 -->
    <el-dialog
      v-model="templateDialogVisible"
      :title="templateDialogTitle"
      width="900px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="templateFormRef"
        :model="templateForm"
        :rules="templateFormRules"
        label-width="120px"
      >
        <el-form-item label="模板编号" prop="templateCode">
          <el-input 
            v-model="templateForm.templateCode" 
            placeholder="自动生成"
            :readonly="true"
          />
          <div class="form-tip">模板编号自动获取，创建后不可修改</div>
        </el-form-item>
        <el-form-item label="模板标题" prop="templateTitle">
          <el-input v-model="templateForm.templateTitle" placeholder="请输入模板标题" />
        </el-form-item>
        <el-form-item label="模板类型" prop="templateType">
          <el-select v-model="templateForm.templateType" placeholder="请选择模板类型" style="width: 100%">
            <el-option label="短信" value="sms" />
            <el-option label="站内信" value="inbox" />
            <el-option label="App推送" value="push" />
          </el-select>
        </el-form-item>
        <el-form-item label="消息类型" prop="messageType">
          <el-select v-model="templateForm.messageType" placeholder="请选择消息类型" style="width: 100%">
            <el-option label="验证码" value="verify" />
            <el-option label="通知" value="notice" />
            <el-option label="营销" value="marketing" />
          </el-select>
        </el-form-item>
        <el-form-item label="消息主题" prop="subject">
          <el-input v-model="templateForm.subject" placeholder="请输入消息主题" />
        </el-form-item>
        <el-form-item label="消息内容" prop="content">
          <div class="content-editor">
            <div class="editor-toolbar">
              <div class="toolbar-line">
                <span class="toolbar-label">通用参数</span>
                <div class="param-tag-wrap">
                  <el-tooltip
                    v-for="param in commonParams"
                    :key="param.code"
                    :content="param.description"
                    placement="top"
                  >
                    <el-tag
                      size="small"
                      effect="plain"
                      class="param-chip"
                      round
                      @click="insertParameter(param.code)"
                    >
                      {{ param.label }} {{ formatParam(param.code) }}
                    </el-tag>
                  </el-tooltip>
                </div>
                <el-button
                  size="small"
                  type="primary"
                  class="add-param-btn"
                  @click="showAddParamDialog = true"
                >
                  <el-icon><Plus /></el-icon>
                  <span>自定义参数</span>
                </el-button>
              </div>
              <div class="param-tip">通用参数为常用业务字段，点击标签可插入到内容中；如需其他参数，请使用自定义参数</div>
            </div>
            <div class="visual-editor-wrapper">
              <div class="visual-editor-label">可视编排（可编辑）</div>
              <div
                class="visual-editor"
                ref="visualEditorRef"
                contenteditable="true"
                @input="handleVisualInput"
              ></div>
            </div>
            <div v-if="usedParameters.length > 0" class="used-params">
              <span class="params-label">已使用参数：</span>
              <el-tooltip
                v-for="param in usedParameters"
                :key="param"
                :content="getParamDescription(param)"
                placement="top"
              >
                <el-tag
                  size="small"
                  style="margin-right: 4px; cursor: help;"
                >
                  {{ getParamLabel(param) }} {{ formatParam(param) }}
                </el-tag>
              </el-tooltip>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="签名" prop="signature">
          <el-select
            v-model="templateForm.signature"
            placeholder="选择或输入自定义签名"
            style="width: 100%"
            filterable
            allow-create
            default-first-option
            clearable
          >
            <el-option
              v-for="item in signatureOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关联通道" prop="channels">
          <el-select
            v-model="templateForm.channels"
            placeholder="请选择消息通道"
            style="width: 100%"
            multiple
            clearable
            :collapse-tags="shouldCollapseChannels"
            :collapse-tags-tooltip="shouldCollapseChannels"
            :max-collapse-tags="3"
          >
            <el-option label="站内信" value="inbox" />
            <el-option label="App推送" value="push" />
            <el-option label="邮件" value="email" />
            <el-option label="微信模板消息" value="wechat" />
            <el-option label="短信" value="sms" />
          </el-select>
        </el-form-item>
        <el-form-item 
          v-if="templateForm.templateType === 'sms' || templateForm.templateType === 'push'"
          label="Deep Link"
        >
          <el-input v-model="templateForm.deepLink" placeholder="请输入链接（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="templateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitTemplate">确定</el-button>
      </template>
    </el-dialog>
    
    <!-- 添加参数对话框 -->
    <el-dialog
      v-model="showAddParamDialog"
      title="添加自定义参数"
      width="400px"
    >
      <el-form label-width="100px">
        <el-form-item label="参数名">
          <el-input
            v-model="newParamName"
            placeholder="请输入参数名（字母、数字、下划线）"
            @keyup.enter="handleAddParam"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddParamDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddParam">确定</el-button>
      </template>
    </el-dialog>

    <!-- 模拟发送对话框 -->
    <el-dialog
      v-model="simulateDialogVisible"
      title="模拟发送"
      width="600px"
    >
      <el-form :model="simulateForm" label-width="120px">
        <el-form-item label="测试用户UID">
          <el-input v-model="simulateForm.userUid" placeholder="请输入测试用户UID" />
        </el-form-item>
        <el-form-item label="变量值">
          <el-input
            v-if="!simulateParamList.length"
            v-model="simulateForm.variablesJson"
            type="textarea"
            :rows="4"
            placeholder="当前模板未识别到参数，可直接输入预览文本或使用 JSON 格式变量"
          />
        </el-form-item>
        <template v-if="simulateParamList.length">
          <el-form-item
            v-for="param in simulateParamList"
            :key="param"
            :label="getParamLabel(param) + ' ' + formatParam(param)"
          >
            <el-input
              v-model="simulateForm.variables[param]"
              :placeholder="`请输入${getParamLabel(param)}，如：${getParamDescription(param)}`"
            />
          </el-form-item>
        </template>
        <el-form-item v-if="simulateParamList.length" label="提示">
          <span class="param-tip">根据模板参数自动生成的输入项，留空则不替换</span>
        </el-form-item>
        <el-form-item label="预览内容">
          <div class="preview-content">
            {{ previewContent }}
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="simulateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSendSimulate">发送</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Search, Refresh, ArrowDown } from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const searchForm = ref({
  keyword: '',
  templateType: '',
  messageType: '',
  status: ''
})

const pagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 对话框
const templateDialogVisible = ref(false)
const templateDialogTitle = ref('新增模板')
const simulateDialogVisible = ref(false)
const templateFormRef = ref(null)
const currentTemplate = ref(null)

// 表单数据
const templateForm = ref({
  id: '',
  templateCode: '',
  templateTitle: '',
  templateType: '',
  messageType: '',
  subject: '',
  content: '',
  signature: '',
  channels: [],
  deepLink: '',
  usedParameters: [] // 记录使用的参数
})

// 通用参数列表（带中文标签和说明）
const commonParams = ref([
  { code: 'userName', label: '用户姓名', description: '用户姓名，如：张三、李四' },
  { code: 'orderId', label: '订单编号', description: '订单的唯一标识编号' },
  { code: 'orderAmount', label: '订单金额', description: '订单的总金额，通常为数字' },
  { code: 'orderTime', label: '订单时间', description: '订单创建或完成的时间' },
  { code: 'productName', label: '商品名称', description: '商品或服务的名称' },
  { code: 'phone', label: '手机号', description: '用户的手机号码' },
  { code: 'email', label: '邮箱', description: '用户的电子邮箱地址' },
  { code: 'verifyCode', label: '验证码', description: '短信或邮箱验证码，通常为6位数字' }
])

// 已使用的参数
const usedParameters = ref([])

// 显示添加参数对话框
const showAddParamDialog = ref(false)
const newParamName = ref('')
const visualEditorRef = ref(null)

// 模拟发送表单
const simulateForm = ref({
  userUid: '',
  variables: {},
  variablesJson: ''
})
const simulateParamList = ref([])

// 签名
const signatureOptions = ref([
  { label: '【官方】常乐健康', value: '【官方】常乐健康' },
  { label: '【通知】系统消息', value: '【通知】系统消息' },
  { label: '【营销】品牌推广', value: '【营销】品牌推广' }
])

// 通道折叠展示
const shouldCollapseChannels = computed(() => (templateForm.value.channels?.length || 0) > 3)

// 生成模板编号
const generateTemplateCode = () => {
  const nextSeq = templateList.value.length + 1
  const padded = String(nextSeq).padStart(3, '0')
  return `TPL${padded}`
}

// 表单验证规则
const templateFormRules = {
  templateCode: [
    { required: true, message: '模板编号自动生成失败，请重试', trigger: 'blur' }
  ],
  templateTitle: [
    { required: true, message: '请输入模板标题', trigger: 'blur' }
  ],
  templateType: [
    { required: true, message: '请选择模板类型', trigger: 'change' }
  ],
  messageType: [
    { required: true, message: '请选择消息类型', trigger: 'change' }
  ],
  subject: [
    { required: true, message: '请输入消息主题', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入消息内容', trigger: 'blur' }
  ],
  channels: [
    { required: true, message: '请选择关联通道', trigger: 'change' }
  ]
}

// 预览内容
const previewContent = computed(() => {
  if (!currentTemplate.value) return ''
  const vars =
    simulateParamList.value.length > 0
      ? simulateForm.value.variables || {}
      : safeParseJson(simulateForm.value.variablesJson || '{}')
  let content = currentTemplate.value.content || ''
  Object.keys(vars || {}).forEach(key => {
    const val = vars[key] ?? ''
    content = content.replace(new RegExp(`\\{${key}\\}`, 'g'), val)
  })
  return content
})

// 将内容拆分为文本/参数片段用于标签化预览
const contentSegments = computed(() => {
  const content = templateForm.value.content || ''
  if (!content) return []
  const regex = /\{(\w+)\}/g
  const segments = []
  let lastIndex = 0
  let match
  while ((match = regex.exec(content)) !== null) {
    const [full, param] = match
    const start = match.index
    if (start > lastIndex) {
      segments.push({ type: 'text', value: content.slice(lastIndex, start) })
    }
    segments.push({ type: 'param', value: param })
    lastIndex = start + full.length
  }
  if (lastIndex < content.length) {
    segments.push({ type: 'text', value: content.slice(lastIndex) })
  }
  return segments
})

// 模拟数据
const templateList = ref([
  {
    id: '1',
    templateCode: 'TPL001',
    templateTitle: '预约失效通知模板',
    templateType: 'sms',
    messageType: 'notice',
    subject: '预约失效通知',
    content: '尊敬的{userName}，您的预约已失效，请重新预约。订单号：{orderId}',
    channels: ['sms', 'push'],
    signature: '【官方】常乐健康',
    status: 'enabled',
    usedParameters: ['userName', 'orderId']
  },
  {
    id: '2',
    templateCode: 'TPL002',
    templateTitle: '订单支付成功通知',
    templateType: 'sms',
    messageType: 'notice',
    subject: '订单支付成功',
    content: '您好{userName}，您的订单{orderId}已支付成功，金额{orderAmount}元，订单时间{orderTime}。感谢您的支持！',
    channels: ['sms', 'push', 'inbox'],
    signature: '【官方】常乐健康',
    status: 'enabled',
    usedParameters: ['userName', 'orderId', 'orderAmount', 'orderTime']
  },
  {
    id: '3',
    templateCode: 'TPL003',
    templateTitle: '商品发货通知',
    templateType: 'sms',
    messageType: 'notice',
    subject: '商品已发货',
    content: '您好{userName}，您购买的商品{productName}已发货，订单号{orderId}，请注意查收。',
    channels: ['sms', 'push'],
    signature: '【官方】常乐健康',
    status: 'enabled',
    usedParameters: ['userName', 'productName', 'orderId']
  },
  {
    id: '4',
    templateCode: 'TPL004',
    templateTitle: '验证码短信',
    templateType: 'sms',
    messageType: 'verify',
    subject: '验证码',
    content: '您的验证码是{verifyCode}，有效期5分钟，请勿泄露给他人。',
    channels: ['sms'],
    signature: '【官方】常乐健康',
    status: 'enabled',
    usedParameters: ['verifyCode']
  },
  {
    id: '5',
    templateCode: 'TPL005',
    templateTitle: '课程开课提醒',
    templateType: 'sms',
    messageType: 'notice',
    subject: '课程开课提醒',
    content: '您好{userName}，您预约的课程{productName}将于{orderTime}开始，请准时参加。',
    channels: ['sms', 'push', 'inbox'],
    signature: '【官方】常乐健康',
    status: 'enabled',
    usedParameters: ['userName', 'productName', 'orderTime']
  },
  {
    id: '6',
    templateCode: 'TPL006',
    templateTitle: '营销活动推广',
    templateType: 'sms',
    messageType: 'marketing',
    subject: '限时优惠活动',
    content: '尊敬的{userName}，限时优惠活动正在进行中！{productName}现价{orderAmount}元，活动时间{orderTime}，快来抢购吧！',
    channels: ['sms', 'push'],
    signature: '【营销】品牌推广',
    status: 'enabled',
    usedParameters: ['userName', 'productName', 'orderAmount', 'orderTime']
  },
  {
    id: '7',
    templateCode: 'TPL007',
    templateTitle: '账户余额变动通知',
    templateType: 'sms',
    messageType: 'notice',
    subject: '账户余额变动',
    content: '您好{userName}，您的账户余额已变动，当前余额{orderAmount}元。如有疑问，请联系客服{phone}。',
    channels: ['sms', 'inbox'],
    signature: '【官方】常乐健康',
    status: 'enabled',
    usedParameters: ['userName', 'orderAmount', 'phone']
  },
  {
    id: '8',
    templateCode: 'TPL008',
    templateTitle: '会员到期提醒',
    templateType: 'sms',
    messageType: 'notice',
    subject: '会员到期提醒',
    content: '尊敬的{userName}，您的会员将于{orderTime}到期，续费可享受更多权益。',
    channels: ['sms', 'push', 'inbox'],
    signature: '【官方】常乐健康',
    status: 'enabled',
    usedParameters: ['userName', 'orderTime']
  }
])

// 过滤后的列表
const filteredList = computed(() => {
  let list = [...templateList.value]
  
  if (searchForm.value.keyword) {
    const keyword = searchForm.value.keyword.toLowerCase()
    list = list.filter(item => 
      item.templateCode.toLowerCase().includes(keyword) ||
      item.templateTitle.toLowerCase().includes(keyword)
    )
  }
  
  if (searchForm.value.templateType) {
    list = list.filter(item => item.templateType === searchForm.value.templateType)
  }
  
  if (searchForm.value.messageType) {
    list = list.filter(item => item.messageType === searchForm.value.messageType)
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
const formatTemplateType = (type) => {
  const typeMap = {
    'sms': '短信',
    'inbox': '站内信',
    'push': 'App推送'
  }
  return typeMap[type] || type
}

const formatMessageType = (type) => {
  const typeMap = {
    'verify': '验证码',
    'notice': '通知',
    'marketing': '营销'
  }
  return typeMap[type] || type
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

// 操作函数
const handleAddTemplate = () => {
  templateDialogTitle.value = '新增模板'
  templateForm.value = {
    id: '',
    templateCode: generateTemplateCode(),
    templateTitle: '',
    templateType: '',
    messageType: '',
    subject: '',
    content: '',
    signature: signatureOptions.value[0]?.value || '',
    channels: [],
    deepLink: '',
    usedParameters: []
  }
  usedParameters.value = []
  nextTick(() => syncVisualFromContent())
  templateDialogVisible.value = true
}

const handleSearch = () => {
  pagination.value.currentPage = 1
}

const handleReset = () => {
  searchForm.value = {
    keyword: '',
    templateType: '',
    messageType: '',
    status: ''
  }
  pagination.value.currentPage = 1
}

const handleEdit = (row) => {
  templateDialogTitle.value = '编辑模板'
  templateForm.value = {
    id: row.id,
    templateCode: row.templateCode,
    templateTitle: row.templateTitle,
    templateType: row.templateType,
    messageType: row.messageType,
    subject: row.subject,
    content: row.content || '',
    signature: row.signature || '',
    channels: row.channels || [],
    deepLink: row.deepLink || '',
    usedParameters: row.usedParameters || []
  }
  // 提取已使用的参数
  extractParameters()
  nextTick(() => syncVisualFromContent())
  templateDialogVisible.value = true
}

const handleSimulate = (row) => {
  currentTemplate.value = row
  const params = parseParamsFromContent(row.content || '')
  simulateParamList.value = params
  const variablesObj = Object.fromEntries(params.map(p => [p, '']))
  simulateForm.value = {
    userUid: '',
    variables: variablesObj,
    variablesJson: ''
  }
  simulateDialogVisible.value = true
}

// 格式化参数显示
const formatParam = (paramName) => {
  return '{' + paramName + '}'
}

// 获取参数的中文标签
const getParamLabel = (paramCode) => {
  const param = commonParams.value.find(p => p.code === paramCode)
  return param ? param.label : paramCode
}

// 获取参数的描述说明
const getParamDescription = (paramCode) => {
  const param = commonParams.value.find(p => p.code === paramCode)
  return param ? param.description : '自定义参数'
}

const escapeHtml = (str) => {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const renderSegmentsToHtml = (segments) => {
  return segments.map(seg => {
    if (seg.type === 'text') {
      return escapeHtml(seg.value)
    }
    return `<span class="seg-chip" data-param="${seg.value}" contenteditable="false">${escapeHtml(formatParam(seg.value))}</span>`
  }).join('')
}

const syncVisualFromContent = () => {
  if (!visualEditorRef.value) return
  const html = renderSegmentsToHtml(contentSegments.value)
  visualEditorRef.value.innerHTML = html
}

// 插入参数
const insertParameter = (paramName) => {
  insertParamChipAtCaret(paramName)
}

const insertParamChipAtCaret = (paramName) => {
  const editor = visualEditorRef.value
  if (!editor) return false
  editor.focus()
  const selection = window.getSelection()
  if (!selection) return false
  const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : document.createRange()
  if (!editor.contains(range.commonAncestorContainer)) {
    const newRange = document.createRange()
    newRange.selectNodeContents(editor)
    newRange.collapse(false)
    selection.removeAllRanges()
    selection.addRange(newRange)
  }
  const chip = document.createElement('span')
  chip.className = 'seg-chip'
  chip.dataset.param = paramName
  chip.contentEditable = 'false'
  chip.textContent = formatParam(paramName)
  const currentRange = selection.getRangeAt(0)
  currentRange.deleteContents()
  currentRange.insertNode(chip)
  currentRange.setStartAfter(chip)
  currentRange.collapse(true)
  selection.removeAllRanges()
  selection.addRange(currentRange)
  handleVisualInput()
  return true
}

const parseParamsFromContent = (content) => {
  const regex = /\{(\w+)\}/g
  const params = new Set()
  let match
  while ((match = regex.exec(content || '')) !== null) {
    params.add(match[1])
  }
  return Array.from(params)
}

const safeParseJson = (text) => {
  try {
    return JSON.parse(text)
  } catch (e) {
    return {}
  }
}

// 提取使用的参数
const extractParameters = () => {
  const content = templateForm.value.content || ''
  usedParameters.value = parseParamsFromContent(content)
  templateForm.value.usedParameters = usedParameters.value
}

const handleVisualInput = () => {
  const editor = visualEditorRef.value
  if (!editor) return
  const nodes = Array.from(editor.childNodes)
  let text = ''
  nodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent || ''
    } else if (node.nodeType === Node.ELEMENT_NODE && node.dataset?.param) {
      text += `{${node.dataset.param}}`
    } else {
      text += node.textContent || ''
    }
  })
  templateForm.value.content = text
  extractParameters()
}

onMounted(() => {
  nextTick(() => syncVisualFromContent())
})

// 添加自定义参数
const handleAddParam = () => {
  if (!newParamName.value || !/^\w+$/.test(newParamName.value)) {
    ElMessage.warning('参数名只能包含字母、数字和下划线')
    return
  }
  if (commonParams.value.some(p => p.code === newParamName.value)) {
    ElMessage.warning('参数已存在')
    return
  }
  // 自定义参数添加到列表，使用参数名作为标签
  commonParams.value.push({
    code: newParamName.value,
    label: newParamName.value,
    description: '自定义参数'
  })
  insertParameter(newParamName.value)
  newParamName.value = ''
  showAddParamDialog.value = false
}

// 提交模板
const handleSubmitTemplate = async () => {
  if (!templateFormRef.value) return
  
  try {
    await templateFormRef.value.validate()
    
    // 提取参数
    extractParameters()
    
    if (!templateForm.value.templateCode) {
      templateForm.value.templateCode = generateTemplateCode()
    }
    
    const templateData = {
      id: templateForm.value.id || `tpl-${Date.now()}`,
      templateCode: templateForm.value.templateCode,
      templateTitle: templateForm.value.templateTitle,
      templateType: templateForm.value.templateType,
      messageType: templateForm.value.messageType,
      subject: templateForm.value.subject,
      content: templateForm.value.content,
      signature: templateForm.value.signature,
      channels: templateForm.value.channels,
      deepLink: templateForm.value.deepLink,
      usedParameters: templateForm.value.usedParameters || [], // 保存使用的参数
      status: 'enabled'
    }
    
    if (templateForm.value.id) {
      // 编辑
      const index = templateList.value.findIndex(t => t.id === templateForm.value.id)
      if (index > -1) {
        templateList.value[index] = { ...templateList.value[index], ...templateData }
        ElMessage.success('编辑成功')
      }
    } else {
      // 新增
      templateList.value.push(templateData)
      ElMessage.success('新增成功')
    }
    
    templateDialogVisible.value = false
  } catch (error) {
    console.error('表单验证失败', error)
  }
}

// 发送模拟
const handleSendSimulate = () => {
  if (!simulateForm.value.userUid) {
    ElMessage.warning('请输入测试用户UID')
    return
  }
  ElMessage.success(`模拟发送成功，UID: ${simulateForm.value.userUid}`)
  simulateDialogVisible.value = false
}

const handleToggleStatus = (row) => {
  row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
  ElMessage.success(`模板已${row.status === 'enabled' ? '启用' : '禁用'}`)
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
.message-template {
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

.preview-content {
  padding: 12px;
  background: hsl(var(--muted));
  border-radius: var(--radius-md);
  min-height: 60px;
  white-space: pre-wrap;
  word-break: break-all;
}

.content-editor {
  width: 100%;
}

.editor-toolbar {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
  padding: 12px;
  background: hsl(var(--muted));
  border-radius: var(--radius-md);
}

.toolbar-label {
  font-size: 13px;
  color: hsl(var(--foreground));
  font-weight: 600;
}

.toolbar-line {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.param-tag-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  flex: 1;
}

.param-chip {
  padding: 4px 10px;
  font-size: 12px;
  line-height: 1.4;
  height: auto;
  min-height: 28px;
  box-sizing: border-box;
  cursor: pointer;
  user-select: none;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
  white-space: nowrap;
}

.param-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}

.add-param-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.2);
  transition: all 0.2s ease;
}

.add-param-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.3);
}

.param-tip {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.signature-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.signature-mode {
  align-self: flex-start;
}

.used-params {
  margin-top: 8px;
  padding: 8px;
  background: hsl(var(--muted));
  border-radius: var(--radius-md);
  font-size: 12px;
}

.params-label {
  color: hsl(var(--muted-foreground));
  margin-right: 8px;
}

.seg-chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  margin: 2px 2px 2px 0;
  background: #e8f3ff;
  color: #1f6fce;
  border-radius: 999px;
  font-size: 12px;
  line-height: 1.4;
}

.visual-editor-wrapper {
  margin-top: 8px;
  margin-bottom: 8px;
}

.visual-editor-label {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  margin-bottom: 4px;
}

.visual-editor {
  min-height: 120px;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md);
  padding: 10px;
  background: #fff;
  line-height: 1.6;
  overflow-y: auto;
}

.visual-editor:focus {
  outline: none;
  border-color: hsl(var(--primary));
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}
</style>

