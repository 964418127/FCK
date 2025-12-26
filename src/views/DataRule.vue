<template>
  <div class="data-rule-page">
    <div class="page-header">
      <h2>数据策略管理</h2>
      <p>管理ABAC数据访问策略</p>
    </div>
    
    <div class="page-content">
      <!-- 规则配置对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="800px"
      >
        <DataRuleConfiguration 
          :rule="selectedRule" 
          @save="handleSaveRule" 
          @cancel="dialogVisible = false"
        />
      </el-dialog>
      
      <el-card shadow="hover" class="content-card">
        <template #header>
          <div class="card-header">
            <h3>数据策略列表</h3>
            <el-button type="primary" @click="handleAddRule">
              <el-icon-plus /> 新增策略
            </el-button>
          </div>
        </template>
        
        <!-- 搜索区域 -->
        <div class="search-area">
          <el-form :inline="true" :model="searchForm" class="search-form">
            <el-form-item label="规则名称">
              <el-input 
                v-model="searchForm.name" 
                placeholder="请输入规则名称" 
                clearable
                style="width: 200px"
                @input="handleSearch"
              />
            </el-form-item>
            <el-form-item label="数据域">
              <el-select 
                v-model="searchForm.domain" 
                placeholder="请选择数据域" 
                clearable
                style="width: 200px"
                @change="handleSearch"
              >
                <el-option 
                  v-for="domain in getAllDataDomains()" 
                  :key="domain.value" 
                  :label="domain.label" 
                  :value="domain.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <el-table :data="filteredRules" border stripe style="width: 100%">
          <el-table-column prop="name" label="规则名称" min-width="150" />
          <el-table-column prop="domain" label="数据域" min-width="120">
            <template #default="scope">
              {{ getDomainLabel(scope.row.domain) }}
            </template>
          </el-table-column>
          <el-table-column prop="objectId" label="数据对象" min-width="150">
            <template #default="scope">
              {{ getObjectLabel(scope.row.domain, scope.row.objectId) }}
            </template>
          </el-table-column>
          <el-table-column prop="description" label="规则描述" min-width="300" />
          <el-table-column label="操作" min-width="150" fixed="right">
            <template #default="scope">
              <el-button 
                type="success" 
                size="small" 
                @click="handleEditRule(scope.row)"
                style="margin-right: 5px"
              >
                编辑
              </el-button>
              <el-button 
                type="danger" 
                size="small" 
                @click="handleDeleteRule(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { dataRules as mockDataRules } from '../mock/data.js'
import DataRuleConfiguration from '../components/DataRuleConfiguration.vue'

// 响应式数据
const dataRules = ref([])
const dialogVisible = ref(false)
const selectedRule = ref(null)
const dialogTitle = ref('新增数据策略')
const searchForm = ref({
  name: '',
  domain: ''
})

// 数据域定义（与DataRuleConfiguration.vue保持一致）
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

// 生命周期钩子
onMounted(() => {
  // 初始化数据
  dataRules.value = mockDataRules
})

// 计算属性：过滤后的规则列表
const filteredRules = computed(() => {
  return dataRules.value.filter(rule => {
    // 规则名称过滤
    const nameMatch = !searchForm.value.name || 
      rule.name.toLowerCase().includes(searchForm.value.name.toLowerCase())
    
    // 数据域过滤
    const domainMatch = !searchForm.value.domain || 
      rule.domain === searchForm.value.domain
    
    return nameMatch && domainMatch
  })
})

// 获取所有数据域
const getAllDataDomains = () => {
  return Object.entries(dataDomains).map(([key, domain]) => ({
    value: key,
    label: domain.name
  }))
}

// 获取数据域标签
const getDomainLabel = (domain) => {
  if (!domain) return ''
  return dataDomains[domain]?.name || domain
}

// 获取数据对象标签
const getObjectLabel = (domain, objectId) => {
  if (!domain || !objectId) return ''
  const domainObj = dataDomains[domain]
  if (!domainObj) return objectId
  
  const obj = domainObj.objects.find(o => o.id === objectId)
  return obj ? `${obj.name}(${obj.table})` : objectId
}



// 搜索处理
const handleSearch = () => {
  // 搜索逻辑由computed属性filteredRules自动处理
}

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    name: '',
    domain: ''
  }
}

// 新增策略
const handleAddRule = () => {
  selectedRule.value = null
  dialogTitle.value = '新增数据策略'
  dialogVisible.value = true
}

// 编辑策略
const handleEditRule = (rule) => {
  selectedRule.value = rule
  dialogTitle.value = '编辑数据策略'
  dialogVisible.value = true
}

// 保存策略
const handleSaveRule = (rule) => {
  const index = dataRules.value.findIndex(r => r.id === rule.id)
  if (index > -1) {
    // 更新现有策略
    dataRules.value[index] = rule
    ElMessage.success('数据策略更新成功')
  } else {
    // 添加新策略
    dataRules.value.push(rule)
    ElMessage.success('数据策略新增成功')
  }
  dialogVisible.value = false
}

// 删除策略
const handleDeleteRule = (rule) => {
  ElMessageBox.confirm('确定要删除该数据策略吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 实现删除逻辑
    dataRules.value = dataRules.value.filter(r => r.id !== rule.id)
    ElMessage.success('数据策略删除成功')
  }).catch(() => {
    // 取消删除
  })
}
</script>

<style scoped>
.data-rule-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.page-header p {
  margin: 5px 0 0 0;
  color: #666;
  font-size: 14px;
}

/* 内容卡片 */
.page-content {
  margin-bottom: 30px;
}

.content-card {
  border-radius: 8px;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* 搜索区域样式 */
.search-area {
  margin-bottom: 20px;
  padding: 15px 20px;
  background-color: #fafafa;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.search-form {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-form .el-form-item {
  margin-bottom: 0;
}

.search-form .el-input {
  min-width: 200px;
}

.search-form .el-select {
  min-width: 200px;
}
</style>