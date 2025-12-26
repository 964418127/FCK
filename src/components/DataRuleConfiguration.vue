<template>
  <div class="data-rule-configuration">
    <div class="configuration-header">
      <h3>{{ rule ? '编辑数据规则' : '新增数据规则' }}</h3>
    </div>
    
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px" class="rule-form">
      <!-- 基本信息 -->
      <el-card shadow="hover" class="form-card">
        <template #header>
          <h4>基本信息</h4>
        </template>
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="数据域" prop="domain">
          <el-select 
            v-model="formData.domain" 
            placeholder="请选择数据域" 
            style="width: 100%"
            @change="handleDomainChange"
          >
            <el-option 
              v-for="domain in getAllDataDomains()" 
              :key="domain.value" 
              :label="domain.label" 
              :value="domain.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="数据对象" prop="objectId">
          <el-select 
            v-model="formData.objectId" 
            placeholder="请选择数据对象" 
            style="width: 100%"
            :disabled="!formData.domain"
            @change="handleObjectChange"
          >
            <el-option 
              v-for="obj in getDataObjectsByDomain(formData.domain)" 
              :key="obj.value" 
              :label="obj.label" 
              :value="obj.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="规则描述">
          <el-input 
            v-model="formData.description" 
            type="textarea" 
            rows="3" 
            placeholder="请输入规则描述"
          />
        </el-form-item>
      </el-card>
      
      <!-- 条件表达式 -->
      <el-card shadow="hover" class="form-card" style="margin-top: 20px">
        <template #header>
          <div class="card-header">
            <h4>条件表达式</h4>
            <el-button 
              type="primary" 
              size="small" 
              @click="addCondition"
              :disabled="!formData.objectId"
            >
              <el-icon-plus /> 添加条件
            </el-button>
          </div>
        </template>
        
        <div v-if="!formData.objectId" class="no-object-tip">
          <el-alert
            title="提示"
            type="warning"
            description="请先选择数据域和数据对象"
            :closable="false"
            show-icon
          />
        </div>
        
        <div v-else class="conditions-container">
          <div 
            v-for="(condition, index) in formData.conditions" 
            :key="`condition-${index}`" 
            class="condition-item"
          >
            <el-row :gutter="16" align="middle" class="condition-row">
              <!-- 条件关系选择（除第一个条件外，每个条件前都有关系选择） -->
              <el-col v-if="index > 0" :xs="24" :sm="6" :md="5" :lg="4">
                <el-select 
                  v-model="condition.relation" 
                  placeholder="关系" 
                  style="width: 100%"
                  class="condition-relation-select"
                >
                  <el-option label="AND" value="AND" />
                  <el-option label="OR" value="OR" />
                </el-select>
              </el-col>
              
              <!-- 属性选择 -->
              <el-col :xs="24" :sm="index > 0 ? 5 : 7" :md="index > 0 ? 5 : 6" :lg="index > 0 ? 5 : 6">
                <el-select 
                  v-model="condition.attribute" 
                  placeholder="选择属性" 
                  style="width: 100%"
                  filterable
                  class="condition-attribute-select"
                >
                  <el-option 
                    v-for="field in getFieldsByTable(selectedTable)" 
                    :key="field.value" 
                    :label="field.label" 
                    :value="field.value"
                  >
                    <div class="field-option">
                      <span>{{ field.label }}</span>
                      <span class="field-type">({{ field.type }})</span>
                    </div>
                  </el-option>
                </el-select>
              </el-col>
              
              <!-- 操作符选择 -->
              <el-col :xs="24" :sm="index > 0 ? 5 : 6" :md="index > 0 ? 5 : 6" :lg="index > 0 ? 5 : 6">
                <el-select 
                  v-model="condition.operator" 
                  placeholder="选择操作符" 
                  style="width: 100%"
                  class="condition-operator-select"
                >
                  <el-option label="等于" value="eq" />
                  <el-option label="不等于" value="ne" />
                  <el-option label="大于" value="gt" />
                  <el-option label="小于" value="lt" />
                  <el-option label="大于等于" value="gte" />
                  <el-option label="小于等于" value="lte" />
                  <el-option label="包含" value="in" />
                  <el-option label="不包含" value="nin" />
                  <el-option label="为空" value="null" />
                  <el-option label="不为空" value="notnull" />
                </el-select>
              </el-col>
              
              <!-- 值输入框 -->
              <el-col :xs="24" :sm="index > 0 ? 6 : 8" :md="index > 0 ? 6 : 7" :lg="index > 0 ? 7 : 8">
                <el-input 
                  v-model="condition.value" 
                  placeholder="输入值（为空/不为空时无需输入）" 
                  style="width: 100%"
                  :disabled="condition.operator === 'null' || condition.operator === 'notnull'"
                  clearable
                  class="condition-value-input"
                />
              </el-col>
              
              <!-- 删除按钮 -->
              <el-col :xs="24" :sm="3" :md="3" :lg="2">
                <div class="condition-action">
                  <el-button 
                    type="danger" 
                    size="small" 
                    @click="removeCondition(index)"
                    circle
                    :icon="ElIconDelete"
                  />
                </div>
              </el-col>
            </el-row>
          </div>
          
          <div v-if="formData.conditions.length === 0" class="empty-conditions">
            <el-empty description="暂无条件，请点击上方添加条件按钮添加" :image-size="80" />
          </div>
          
          <!-- 条件说明提示 -->
          <div v-if="formData.conditions.length > 1" class="condition-tip">
            <el-icon><InfoFilled /></el-icon>
            <span>提示：第一个条件无需选择关系，后续条件可通过关系选择器设置与前一条件的关系（AND/OR）</span>
          </div>
        </div>
      </el-card>
      
      <!-- 操作按钮 -->
      <div class="form-actions">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSave">保存规则</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Plus as ElIconPlus,
  Delete as ElIconDelete,
  InfoFilled
} from '@element-plus/icons-vue'

// 接收父组件传入的props
const props = defineProps({
  rule: {
    type: Object,
    default: null
  }
})

// 定义事件
const emit = defineEmits(['save', 'cancel'])

// 响应式数据
const formRef = ref(null)
const formData = ref({
  id: '',
  name: '',
  domain: '',
  objectId: '',
  conditions: [],
  description: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入规则名称', trigger: 'blur' },
    { min: 1, max: 50, message: '规则名称长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  domain: [
    { required: true, message: '请选择数据域', trigger: 'change' }
  ],
  objectId: [
    { required: true, message: '请选择数据对象', trigger: 'change' }
  ]
}

// 数据域和数据对象定义（与Permission.vue保持一致）
const dataDomains = {
  'order': {
    name: '订单数据域',
    objects: [
      { id: 'order_order', name: '服务订单数据对象', table: 'orders' },
      { id: 'order_customer', name: '客户数据对象', table: 'customers' },
      { id: 'order_product', name: '产品数据对象', table: 'products' },
      { id: 'order_payment', name: '支付数据对象', table: 'payments' },
      { id: 'order_refund', name: '退款数据对象', table: 'refunds' }
    ]
  },
  'coupon': {
    name: '优惠券数据域',
    objects: [
      { id: 'coupon_coupon', name: '优惠券数据对象', table: 'coupons' },
      { id: 'coupon_campaign', name: '优惠券活动数据对象', table: 'coupon_campaigns' }
    ]
  },
  'service': {
    name: '服务数据域',
    objects: [
      { id: 'service_service', name: '服务数据对象', table: 'services' },
      { id: 'service_provider', name: '服务提供者数据对象', table: 'service_providers' },
      { id: 'service_feedback', name: '服务反馈数据对象', table: 'service_feedback' }
    ]
  },
  'hr': {
    name: 'HR数据域',
    objects: [
      { id: 'hr_candidate', name: '候选人数据对象', table: 'candidates' },
      { id: 'hr_employee', name: '员工数据对象', table: 'employees' },
      { id: 'hr_interview', name: '面试数据对象', table: 'interviews' },
      { id: 'hr_offer', name: 'Offer数据对象', table: 'offers' }
    ]
  },
  'permission': {
    name: '权限数据域',
    objects: [
      { id: 'permission_user', name: '用户数据对象', table: 'users' },
      { id: 'permission_role', name: '角色数据对象', table: 'roles' },
      { id: 'permission_permission', name: '权限数据对象', table: 'permissions' }
    ]
  },
  'learning': {
    name: '学习培训数据域',
    objects: [
      { id: 'learning_course', name: '课程数据对象', table: 'courses' },
      { id: 'learning_enrollment', name: '课程报名数据对象', table: 'course_enrollments' },
      { id: 'learning_progress', name: '学习进度数据对象', table: 'learning_progress' },
      { id: 'learning_record', name: '学习记录数据对象', table: 'learning_records' }
    ]
  },
  'exam': {
    name: '考试认证数据域',
    objects: [
      { id: 'exam_exam', name: '考试数据对象', table: 'exams' },
      { id: 'exam_enrollment', name: '考试报名数据对象', table: 'exam_enrollments' },
      { id: 'exam_answer', name: '考试答案数据对象', table: 'exam_answers' },
      { id: 'exam_score', name: '考试成绩数据对象', table: 'exam_scores' },
      { id: 'exam_certificate', name: '证书数据对象', table: 'certificates' }
    ]
  },
  'skill': {
    name: '技能提升数据域',
    objects: [
      { id: 'skill_assessment', name: '技能评估数据对象', table: 'skill_assessments' },
      { id: 'skill_plan', name: '提升计划数据对象', table: 'skill_plans' },
      { id: 'skill_certification', name: '技能认证数据对象', table: 'skill_certifications' }
    ]
  },
  'certificate': {
    name: '证书管理数据域',
    objects: [
      { id: 'certificate_certificate', name: '证书数据对象', table: 'certificates' },
      { id: 'certificate_renewal', name: '证书续期数据对象', table: 'certificate_renewals' }
    ]
  }
}

// 获取所有数据域
const getAllDataDomains = () => {
  return Object.entries(dataDomains).map(([key, domain]) => ({
    value: key,
    label: domain.name
  }))
}

// 根据数据域获取数据对象
const getDataObjectsByDomain = (domain) => {
  if (!domain) {
    return []
  }
  return dataDomains[domain]?.objects.map(obj => ({
    value: obj.id,
    label: `${obj.name}(${obj.table})`
  })) || []
}

// 获取选中的数据对象对应的表
const selectedTable = computed(() => {
  if (!formData.value.domain || !formData.value.objectId) {
    return ''
  }
  const domain = dataDomains[formData.value.domain]
  if (domain) {
    const obj = domain.objects.find(o => o.id === formData.value.objectId)
    return obj ? obj.table : ''
  }
  return ''
})

// 模拟表字段数据（用于条件配置）
const tableFields = {
  candidates: [
    { label: '候选人ID', value: 'id', type: 'string' },
    { label: '姓名', value: 'name', type: 'string' },
    { label: '电话', value: 'phone', type: 'string' },
    { label: '邮箱', value: 'email', type: 'string' },
    { label: '工作经验', value: 'experience', type: 'number' },
    { label: '教育程度', value: 'education', type: 'string' },
    { label: '应聘岗位', value: 'position', type: 'string' },
    { label: '状态', value: 'status', type: 'string' },
    { label: '城市', value: 'city', type: 'string' }
  ],
  resumes: [
    { label: '简历ID', value: 'id', type: 'string' },
    { label: '候选人ID', value: 'candidateId', type: 'string' },
    { label: '文件名', value: 'fileName', type: 'string' },
    { label: '文件URL', value: 'fileUrl', type: 'string' },
    { label: '上传时间', value: 'uploadTime', type: 'datetime' }
  ],
  interviews: [
    { label: '面试ID', value: 'id', type: 'string' },
    { label: '候选人ID', value: 'candidateId', type: 'string' },
    { label: '面试时间', value: 'interviewTime', type: 'datetime' },
    { label: '面试官ID', value: 'interviewerId', type: 'string' },
    { label: '面试结果', value: 'result', type: 'string' },
    { label: '面试评分', value: 'score', type: 'number' },
    { label: '面试评价', value: 'comment', type: 'string' }
  ],
  offers: [
    { label: 'OfferID', value: 'id', type: 'string' },
    { label: '候选人ID', value: 'candidateId', type: 'string' },
    { label: '岗位', value: 'position', type: 'string' },
    { label: '薪资', value: 'salary', type: 'number' },
    { label: '入职日期', value: 'startDate', type: 'date' },
    { label: '状态', value: 'status', type: 'string' }
  ],
  employees: [
    { label: '员工ID', value: 'id', type: 'string' },
    { label: '姓名', value: 'name', type: 'string' },
    { label: '岗位', value: 'position', type: 'string' },
    { label: '部门', value: 'department', type: 'string' },
    { label: '入职日期', value: 'hireDate', type: 'date' },
    { label: '薪资', value: 'salary', type: 'number' }
  ],
  onboarding: [
    { label: '入职ID', value: 'id', type: 'string' },
    { label: '员工ID', value: 'employeeId', type: 'string' },
    { label: '状态', value: 'status', type: 'string' },
    { label: '入职材料', value: 'documents', type: 'array' },
    { label: '开始日期', value: 'startDate', type: 'date' }
  ],
  training: [
    { label: '培训ID', value: 'id', type: 'string' },
    { label: '员工ID', value: 'employeeId', type: 'string' },
    { label: '课程名称', value: 'courseName', type: 'string' },
    { label: '培训师', value: 'trainer', type: 'string' },
    { label: '培训日期', value: 'trainingDate', type: 'date' },
    { label: '培训结果', value: 'result', type: 'string' }
  ],
  assessments: [
    { label: '考核ID', value: 'id', type: 'string' },
    { label: '员工ID', value: 'employeeId', type: 'string' },
    { label: '考核类型', value: 'assessmentType', type: 'string' },
    { label: '考核分数', value: 'score', type: 'number' },
    { label: '考核结果', value: 'result', type: 'string' },
    { label: '考核日期', value: 'assessmentDate', type: 'date' }
  ],
  orders: [
    { label: '订单ID', value: 'id', type: 'string' },
    { label: '客户ID', value: 'customerId', type: 'string' },
    { label: '金额', value: 'amount', type: 'number' },
    { label: '状态', value: 'status', type: 'string' },
    { label: '创建时间', value: 'createTime', type: 'datetime' },
    { label: '门店ID', value: 'storeId', type: 'string' }
  ],
  users: [
    { label: '用户ID', value: 'id', type: 'string' },
    { label: '姓名', value: 'name', type: 'string' },
    { label: '部门ID', value: 'departmentId', type: 'string' },
    { label: '组织ID', value: 'organizationId', type: 'string' },
    { label: '角色', value: 'role', type: 'string' },
    { label: '状态', value: 'status', type: 'string' }
  ],
  // 订单数据域相关表
  customers: [
    { label: '客户ID', value: 'id', type: 'string' },
    { label: '姓名', value: 'name', type: 'string' },
    { label: '电话', value: 'phone', type: 'string' },
    { label: '邮箱', value: 'email', type: 'string' },
    { label: '地址', value: 'address', type: 'string' },
    { label: 'VIP等级', value: 'vipLevel', type: 'string' },
    { label: '创建时间', value: 'createTime', type: 'datetime' }
  ],
  products: [
    { label: '产品ID', value: 'id', type: 'string' },
    { label: '产品名称', value: 'name', type: 'string' },
    { label: '价格', value: 'price', type: 'number' },
    { label: '分类', value: 'category', type: 'string' },
    { label: '状态', value: 'status', type: 'string' },
    { label: '描述', value: 'description', type: 'string' }
  ],
  payments: [
    { label: '支付ID', value: 'id', type: 'string' },
    { label: '订单ID', value: 'orderId', type: 'string' },
    { label: '金额', value: 'amount', type: 'number' },
    { label: '支付方式', value: 'paymentMethod', type: 'string' },
    { label: '状态', value: 'status', type: 'string' },
    { label: '支付时间', value: 'payTime', type: 'datetime' }
  ],
  refunds: [
    { label: '退款ID', value: 'id', type: 'string' },
    { label: '订单ID', value: 'orderId', type: 'string' },
    { label: '金额', value: 'amount', type: 'number' },
    { label: '原因', value: 'reason', type: 'string' },
    { label: '状态', value: 'status', type: 'string' },
    { label: '退款时间', value: 'refundTime', type: 'datetime' }
  ],
  // 优惠券数据域相关表
  coupons: [
    { label: '优惠券ID', value: 'id', type: 'string' },
    { label: '名称', value: 'name', type: 'string' },
    { label: '金额', value: 'amount', type: 'number' },
    { label: '类型', value: 'type', type: 'string' },
    { label: '状态', value: 'status', type: 'string' },
    { label: '过期时间', value: 'expireTime', type: 'datetime' },
    { label: '使用时间', value: 'useTime', type: 'datetime' }
  ],
  coupon_campaigns: [
    { label: '活动ID', value: 'id', type: 'string' },
    { label: '活动名称', value: 'name', type: 'string' },
    { label: '描述', value: 'description', type: 'string' },
    { label: '状态', value: 'status', type: 'string' },
    { label: '开始时间', value: 'startTime', type: 'datetime' },
    { label: '结束时间', value: 'endTime', type: 'datetime' }
  ],
  // 服务数据域相关表
  services: [
    { label: '服务ID', value: 'id', type: 'string' },
    { label: '服务名称', value: 'name', type: 'string' },
    { label: '类型', value: 'type', type: 'string' },
    { label: '时长', value: 'duration', type: 'number' },
    { label: '价格', value: 'price', type: 'number' },
    { label: '状态', value: 'status', type: 'string' }
  ],
  service_providers: [
    { label: '提供者ID', value: 'id', type: 'string' },
    { label: '姓名', value: 'name', type: 'string' },
    { label: '电话', value: 'phone', type: 'string' },
    { label: '等级', value: 'level', type: 'string' },
    { label: '评分', value: 'rating', type: 'number' },
    { label: '状态', value: 'status', type: 'string' }
  ],
  service_feedback: [
    { label: '反馈ID', value: 'id', type: 'string' },
    { label: '订单ID', value: 'orderId', type: 'string' },
    { label: '评分', value: 'rating', type: 'number' },
    { label: '评价', value: 'comment', type: 'string' },
    { label: '状态', value: 'status', type: 'string' },
    { label: '创建时间', value: 'createTime', type: 'datetime' }
  ],
  // 权限数据域相关表
  roles: [
    { label: '角色ID', value: 'id', type: 'string' },
    { label: '角色名称', value: 'name', type: 'string' },
    { label: '描述', value: 'description', type: 'string' },
    { label: '状态', value: 'status', type: 'string' },
    { label: '创建时间', value: 'createTime', type: 'datetime' }
  ],
  permissions: [
    { label: '权限ID', value: 'id', type: 'string' },
    { label: '权限名称', value: 'name', type: 'string' },
    { label: '权限代码', value: 'code', type: 'string' },
    { label: '类型', value: 'type', type: 'string' },
    { label: '描述', value: 'description', type: 'string' }
  ]
}

// 根据表获取可用属性列表
const getFieldsByTable = (table) => {
  if (!table) {
    return []
  }
  return tableFields[table] || []
}

// 处理数据域变化
const handleDomainChange = () => {
  // 清空数据对象和条件
  formData.value.objectId = ''
  formData.value.conditions = []
}

// 处理数据对象变化
const handleObjectChange = () => {
  // 清空条件
  formData.value.conditions = []
}

// 监听规则变化，初始化表单数据
watch(() => props.rule, (newRule) => {
  if (newRule) {
    formData.value = JSON.parse(JSON.stringify(newRule))
    // 确保conditions存在
    if (!formData.value.conditions) {
      formData.value.conditions = []
    }
    // 确保每个条件都有relation字段（第一个条件除外）
    formData.value.conditions.forEach((condition, index) => {
      if (index > 0 && !condition.relation) {
        condition.relation = 'AND'
      }
    })
    // 兼容旧数据：如果有type字段，尝试转换为domain和objectId
    if (formData.value.type && !formData.value.domain) {
      // 根据type映射到domain和objectId（可选，保持向后兼容）
    }
  } else {
    // 重置表单
    formData.value = {
      id: `rule-${Date.now()}`,
      name: '',
      domain: '',
      objectId: '',
      conditions: [],
      description: ''
    }
  }
}, { immediate: true, deep: true })

// 添加条件
const addCondition = () => {
  const conditions = formData.value.conditions
  // 第一个条件不需要relation，后续条件默认使用AND
  const newCondition = {
    attribute: '',
    operator: 'eq',
    value: '',
    relation: conditions.length > 0 ? 'AND' : undefined // 第一个条件没有relation
  }
  formData.value.conditions.push(newCondition)
}

// 移除条件
const removeCondition = (index) => {
  formData.value.conditions.splice(index, 1)
}

// 保存规则
const handleSave = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      // 检查是否添加了条件
      if (formData.value.conditions.length === 0) {
        ElMessage.warning('请至少添加一个条件')
        return false
      }
      
      // 检查条件是否完整
      const hasInvalidCondition = formData.value.conditions.some(cond => {
        // 如果操作符是null或notnull，不需要value
        if (cond.operator === 'null' || cond.operator === 'notnull') {
          return !cond.attribute
        }
        return !cond.attribute || cond.value === ''
      })
      
      if (hasInvalidCondition) {
        ElMessage.warning('请完善所有条件的属性和值')
        return false
      }
      
      // 移除可能存在的scope字段
      if (formData.value.hasOwnProperty('scope')) {
        delete formData.value.scope
      }
      
      emit('save', formData.value)
      ElMessage.success('规则保存成功')
    }
  })
}

// 取消操作
const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.data-rule-configuration {
  padding: 20px;
}

.configuration-header {
  margin-bottom: 20px;
}

.configuration-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.rule-form {
  max-width: 800px;
}

.form-card {
  margin-bottom: 20px;
}

.form-card :deep(.el-card__header) {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}

.form-card :deep(.el-card__body) {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.conditions-container {
  margin-top: 10px;
}

.condition-item {
  padding: 12px 15px;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 15px;
  transition: all 0.3s;
}

.condition-item:hover {
  border-color: #c0c4cc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.condition-row {
  width: 100%;
}

.condition-relation-select {
  min-width: 100px;
}

.condition-relation-select :deep(.el-input__inner) {
  font-weight: 500;
}

.condition-attribute-select,
.condition-operator-select,
.condition-value-input {
  min-width: 120px;
}

.condition-action {
  display: flex;
  justify-content: center;
  align-items: center;
}

.empty-conditions {
  padding: 40px 0;
  text-align: center;
}

.no-object-tip {
  margin-top: 10px;
}

.condition-tip {
  margin-top: 15px;
  padding: 10px 15px;
  background-color: #ecf5ff;
  border: 1px solid #b3d8ff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #409eff;
  font-size: 13px;
}

.condition-tip .el-icon {
  font-size: 16px;
}

.form-actions {
  margin-top: 30px;
  text-align: right;
}

.form-actions .el-button {
  margin-left: 10px;
}
</style>