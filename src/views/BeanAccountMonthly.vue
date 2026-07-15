<template>
  <div class="bean-account-monthly">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>账户月度信息</span>
          <el-button type="primary" size="small" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </div>
      </template>
      
      <div class="search-section">
        <el-form :inline="true" class="demo-form-inline">
          <el-form-item label="月份">
            <el-date-picker
              v-model="searchForm.month"
              type="month"
              format="YYYY-MM"
              value-format="YYYY-MM"
              placeholder="选择月份"
            />
          </el-form-item>
          <el-form-item label="姓名&工号">
            <el-input v-model="searchForm.nameOrId" placeholder="请输入姓名或工号" />
          </el-form-item>
          <el-form-item label="部门">
            <el-input v-model="searchForm.department" placeholder="请输入部门" />
          </el-form-item>
          <el-form-item label="岗位">
            <el-input v-model="searchForm.position" placeholder="请输入岗位" />
          </el-form-item>
          <el-form-item label="主服务门店">
            <el-input v-model="searchForm.mainServiceStore" placeholder="主服务门店名称或编码" />
          </el-form-item>
          <el-form-item label="劳动关系门店">
            <el-input v-model="searchForm.laborRelationStore" placeholder="劳动关系门店名称或编码" />
          </el-form-item>
          <el-form-item label="合同主体">
            <el-input v-model="searchForm.contractEntity" placeholder="请输入合同主体名称" />
          </el-form-item>
          <el-form-item label="账户类型">
            <el-select v-model="searchForm.accountType" placeholder="请选择账户类型" style="width: 150px;">
              <el-option label="余额账户" value="balance" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
          </el-form-item>
          <el-form-item>
            <el-button @click="resetForm">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <el-table :data="accountMonthlyList" style="width: 100%">
        <el-table-column prop="month" label="月份" width="120" />
        <el-table-column prop="city" label="城市" width="100" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="department" label="部门" width="150" />
        <el-table-column prop="position" label="岗位" width="150" />
        <el-table-column prop="employeeId" label="工号" width="100" />
        <el-table-column prop="mainServiceStore" label="主服务门店" width="150" />
        <el-table-column prop="laborRelationStore" label="劳动关系门店" width="150" />
        <el-table-column prop="contractEntity" label="合同主体" width="200" />
        <el-table-column prop="accountType" label="账户类型" width="120">
          <template #default="scope">
            <el-tag type="info">{{ scope.row.accountType === 'balance' ? '余额账户' : scope.row.accountType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastMonthBalance" label="上月期末余额" width="150" />
        <el-table-column prop="monthlySettlement" label="本月结算数量" width="150" />
        <!-- <el-table-column prop="availableBalance" label="本月结算期初余额" width="120">
          <template #default="scope">
            <el-tag type="success">{{ scope.row.availableBalance }}</el-tag>
          </template>
        </el-table-column> -->
        <el-table-column prop="currentWithdrawal" label="本月提现数量" width="150" />
        <el-table-column prop="currentConsumption" label="本月累计消费" width="150" />
        <el-table-column prop="withdrawalSuccessAmount" label="提现交易成功金额" width="150" />
        <el-table-column prop="currentAvailableBalance" label="实时可用余额" width="150">
          <template #default="scope">
            <el-tag type="info">{{ scope.row.currentAvailableBalance }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="在职状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '离职' ? 'danger' : 'success'" disable-transitions>
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <div class="row-actions">
              <div class="row-actions-secondary">
                <el-button link size="small" @click="handleViewSettlement(scope.row)">结算明细</el-button>
                <el-button link size="small" @click="handleViewWithdrawal(scope.row)">提现明细</el-button>
                <el-button link size="small" @click="handleViewConsumption(scope.row)">消费明细</el-button>
              </div>
              <div class="row-actions-primary">
                <el-button
                  v-if="canInitiateResign(scope.row)"
                  size="small"
                  type="primary"
                  @click="openResignDialog(scope.row)"
                >发起离职补偿</el-button>
                <el-button
                  v-if="canSignNewContract(scope.row)"
                  size="small"
                  type="primary"
                  @click="openNewContractDialog(scope.row)"
                >发起新合同</el-button>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 弹层 A：发起离职补偿（在职员工） -->
    <el-dialog
      v-model="resignVisible"
      title="发起离职补偿"
      width="520px"
      destroy-on-close
      @close="closeResignDialog"
    >
      <div v-if="resignTarget" class="resign-tip">
        <el-icon class="tip-icon"><Document /></el-icon>
        <div>
          员工【{{ resignTarget.name }}（{{ resignTarget.employeeId }}）】当前为<strong>在职</strong>。
          发起后将自动推送签订《解除劳动合同》。
        </div>
      </div>

      <div v-if="resignTarget" class="resign-section">
        <div class="section-title">合同附件预览</div>
        <a class="contract-link" href="javascript:void(0)" @click="onPreviewContract">
          <el-icon><Document /></el-icon>
          <span>解除劳动合同.pdf</span>
        </a>
      </div>

      <template #footer>
        <el-button @click="closeResignDialog">取消</el-button>
        <el-button type="danger" :loading="resignSubmitting" @click="submitResign">
          确认发起离职
        </el-button>
      </template>
    </el-dialog>

    <!-- 弹层 B：发起新合同（离职员工） -->
    <el-dialog
      v-model="newContractVisible"
      :title="newContractSigned ? '新合同已发起' : '发起新合同'"
      width="560px"
      destroy-on-close
      @close="closeNewContractDialog"
    >
      <div v-if="newContractTarget">
        <!-- 表单态 -->
        <template v-if="!newContractSigned">
          <div class="resign-tip">
            <el-icon class="tip-icon"><Document /></el-icon>
            <div>
              员工【{{ newContractTarget.name }}（{{ newContractTarget.employeeId }}）】当前为<strong>离职</strong>。
              请在下方配置新合同主体与合同期间。
            </div>
          </div>

          <el-form
            ref="newContractFormRef"
            :model="newContractForm"
            label-width="96px"
            class="resign-form"
          >
            <el-form-item label="原合同主体">
              <span class="readonly-text">{{ newContractTarget.laborContractEntity }}</span>
            </el-form-item>
            <el-form-item label="新合同主体" required>
              <el-select
                v-model="newContractForm.newEntity"
                placeholder="选择新合同主体（不可与原主体相同）"
                filterable
                style="width: 100%;"
              >
                <el-option
                  v-for="e in newContractEntityOptions"
                  :key="e"
                  :label="e"
                  :value="e"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="合同开始" required>
              <el-date-picker
                v-model="newContractForm.startDate"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%;"
              />
            </el-form-item>
            <el-form-item label="合同结束" required>
              <el-date-picker
                v-model="newContractForm.endDate"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%;"
              />
            </el-form-item>
          </el-form>
        </template>

        <!-- 已签订态 -->
        <template v-else>
          <div class="signed-banner">
            <el-icon class="signed-banner-icon"><Document /></el-icon>
            <div>
              <div class="signed-banner-title">新合同已发起</div>
              <div class="signed-banner-sub">新合同已独立记录</div>
            </div>
          </div>

          <div class="signed-card">
            <div class="signed-row">
              <span class="signed-label">员工</span>
              <span class="signed-value">{{ newContractTarget.name }}（{{ newContractTarget.employeeId }}）</span>
            </div>
            <div class="signed-row">
              <span class="signed-label">原合同主体</span>
              <span class="signed-value signed-old">{{ newContractSigned.oldEntity }}</span>
              <el-tag size="small" type="info">已解除</el-tag>
            </div>
            <div class="signed-row">
              <span class="signed-label">新合同主体</span>
              <span class="signed-value signed-new">{{ newContractSigned.newEntity }}</span>
            </div>
            <div class="signed-row">
              <span class="signed-label">合同期间</span>
              <span class="signed-value">{{ newContractSigned.startDate }} ~ {{ newContractSigned.endDate }}</span>
            </div>
            <div class="signed-row">
              <span class="signed-label">发起时间</span>
              <span class="signed-value">{{ newContractSigned.signedAt }}</span>
            </div>
            <div class="signed-row">
              <span class="signed-label">新合同编号</span>
              <span class="signed-value mono">{{ newContractSigned.slipNo }}</span>
            </div>
          </div>
        </template>
      </div>

      <template #footer>
        <template v-if="!newContractSigned">
          <el-button @click="closeNewContractDialog">取消</el-button>
          <el-button
            type="primary"
            :loading="newContractSubmitting"
            @click="submitNewContract"
          >确认发起新合同</el-button>
        </template>
        <template v-else>
          <el-button type="primary" @click="closeNewContractDialog">完成</el-button>
        </template>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Search, Refresh, Calendar, Document, ArrowUp, ShoppingCart, Wallet } from '@element-plus/icons-vue'

const router = useRouter()

// 当前操作员角色（演示用：实际项目从登录态/权限系统读取）
const currentRole = ref(localStorage.getItem('bean-current-role') || 'hr_manager')

// 搜索表单
const searchForm = reactive({
  month: '',
  nameOrId: '',
  department: '',
  position: '',
  mainServiceStore: '',
  laborRelationStore: '',
  contractEntity: '',
  accountType: 'balance'
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 100
})

// 账户月度信息数据 - 按月份组织
const accountMonthlyByMonth = {
  '2026-03': [
    {
      month: '2026-03',
      city: '北京',
      name: '张三',
      department: '技术部',
      position: '前端开发',
      employeeId: '1001',
      mainServiceStore: '',
      laborRelationStore: '北京总部',
      contractEntity: '北京常乐健康科技有限公司',
      accountType: 'balance',
      lastMonthBalance: 4700,
      monthlySettlement: 1000,
      availableBalance: 5700,
      currentWithdrawal: 500,
      withdrawalSuccessAmount: 450,
      currentConsumption: 200,
      currentAvailableBalance: 5000,
      status: '在职'
    },
    {
      month: '2026-03',
      city: '上海',
      name: '李四',
      department: '市场部',
      position: '市场专员',
      employeeId: '1002',
      mainServiceStore: '',
      laborRelationStore: '上海分公司',
      contractEntity: '上海常乐健康科技有限公司',
      accountType: 'balance',
      lastMonthBalance: 2650,
      monthlySettlement: 800,
      availableBalance: 3450,
      currentWithdrawal: 300,
      withdrawalSuccessAmount: 280,
      currentConsumption: 150,
      currentAvailableBalance: 3000,
      status: '在职'
    },
    {
      month: '2026-03',
      city: '广州',
      name: '王五',
      department: '销售部',
      position: '销售经理',
      employeeId: '1003',
      mainServiceStore: '',
      laborRelationStore: '广州分公司',
      contractEntity: '广州常乐健康科技有限公司',
      accountType: 'balance',
      lastMonthBalance: 7300,
      monthlySettlement: 1500,
      availableBalance: 8800,
      currentWithdrawal: 1000,
      withdrawalSuccessAmount: 920,
      currentConsumption: 300,
      currentAvailableBalance: 7500,
      status: '离职'
    },
    {
      month: '2026-03',
      city: '北京',
      name: '赵六',
      department: '服务部',
      position: '推拿师',
      employeeId: '1004',
      mainServiceStore: '北京朝阳门店',
      laborRelationStore: '北京总部',
      contractEntity: '北京常乐健康科技有限公司',
      accountType: 'balance',
      lastMonthBalance: 3500,
      monthlySettlement: 1200,
      availableBalance: 4700,
      currentWithdrawal: 400,
      withdrawalSuccessAmount: 380,
      currentConsumption: 150,
      currentAvailableBalance: 4150,
      status: '在职'
    },
    {
      month: '2026-03',
      city: '上海',
      name: '孙七',
      department: '销售部',
      position: '客户经理',
      employeeId: '1005',
      mainServiceStore: '上海浦东门店',
      laborRelationStore: '上海分公司',
      contractEntity: '上海常乐健康科技有限公司',
      accountType: 'balance',
      lastMonthBalance: 4200,
      monthlySettlement: 900,
      availableBalance: 5100,
      currentWithdrawal: 450,
      withdrawalSuccessAmount: 400,
      currentConsumption: 180,
      currentAvailableBalance: 4470,
      status: '离职'
    }
  ],
  '2026-02': [
    {
      month: '2026-02',
      city: '北京',
      name: '张三',
      department: '技术部',
      position: '前端开发',
      employeeId: '1001',
      mainServiceStore: '',
      laborRelationStore: '北京总部',
      contractEntity: '北京常乐健康科技有限公司',
      accountType: 'balance',
      lastMonthBalance: 4200,
      monthlySettlement: 900,
      availableBalance: 5100,
      currentWithdrawal: 400,
      currentConsumption: 0,
      currentAvailableBalance: 4700,
      status: '在职'
    },
    {
      month: '2026-02',
      city: '上海',
      name: '李四',
      department: '市场部',
      position: '市场专员',
      employeeId: '1002',
      mainServiceStore: '',
      laborRelationStore: '上海分公司',
      contractEntity: '上海常乐健康科技有限公司',
      accountType: 'balance',
      lastMonthBalance: 2200,
      monthlySettlement: 850,
      availableBalance: 3050,
      currentWithdrawal: 400,
      currentConsumption: 0,
      currentAvailableBalance: 2650,
      status: '在职'
    },
    {
      month: '2026-02',
      city: '广州',
      name: '王五',
      department: '销售部',
      position: '销售经理',
      employeeId: '1003',
      mainServiceStore: '',
      laborRelationStore: '广州分公司',
      contractEntity: '广州常乐健康科技有限公司',
      accountType: 'balance',
      lastMonthBalance: 6800,
      monthlySettlement: 1200,
      availableBalance: 8000,
      currentWithdrawal: 700,
      withdrawalSuccessAmount: 650,
      currentConsumption: 0,
      currentAvailableBalance: 7300,
      status: '离职'
    },
    {
      month: '2026-02',
      city: '北京',
      name: '赵六',
      department: '服务部',
      position: '推拿师',
      employeeId: '1004',
      mainServiceStore: '北京朝阳门店',
      laborRelationStore: '北京总部',
      contractEntity: '北京常乐健康科技有限公司',
      accountType: 'balance',
      lastMonthBalance: 3000,
      monthlySettlement: 1000,
      availableBalance: 4000,
      currentWithdrawal: 350,
      withdrawalSuccessAmount: 320,
      currentConsumption: 150,
      currentAvailableBalance: 3500,
      status: '在职'
    },
    {
      month: '2026-02',
      city: '上海',
      name: '孙七',
      department: '销售部',
      position: '客户经理',
      employeeId: '1005',
      mainServiceStore: '上海浦东门店',
      laborRelationStore: '上海分公司',
      contractEntity: '上海常乐健康科技有限公司',
      accountType: 'balance',
      lastMonthBalance: 3800,
      monthlySettlement: 800,
      availableBalance: 4600,
      currentWithdrawal: 400,
      withdrawalSuccessAmount: 380,
      currentConsumption: 150,
      currentAvailableBalance: 4050,
      status: '离职'
    }
  ],
  '2026-01': [
    {
      month: '2026-01',
      city: '北京',
      name: '张三',
      department: '技术部',
      position: '前端开发',
      employeeId: '1001',
      mainServiceStore: '',
      laborRelationStore: '北京总部',
      contractEntity: '北京常乐健康科技有限公司',
      accountType: 'balance',
      lastMonthBalance: 3800,
      monthlySettlement: 800,
      availableBalance: 4600,
      currentWithdrawal: 400,
      withdrawalSuccessAmount: 380,
      currentConsumption: 0,
      currentAvailableBalance: 4200,
      status: '在职'
    },
    {
      month: '2026-01',
      city: '上海',
      name: '李四',
      department: '市场部',
      position: '市场专员',
      employeeId: '1002',
      mainServiceStore: '',
      laborRelationStore: '上海分公司',
      contractEntity: '上海常乐健康科技有限公司',
      accountType: 'balance',
      lastMonthBalance: 1900,
      monthlySettlement: 700,
      availableBalance: 2600,
      currentWithdrawal: 400,
      withdrawalSuccessAmount: 380,
      currentConsumption: 0,
      currentAvailableBalance: 2200,
      status: '在职'
    },
    {
      month: '2026-01',
      city: '广州',
      name: '王五',
      department: '销售部',
      position: '销售经理',
      employeeId: '1003',
      mainServiceStore: '',
      laborRelationStore: '广州分公司',
      contractEntity: '广州常乐健康科技有限公司',
      accountType: 'balance',
      lastMonthBalance: 6200,
      monthlySettlement: 1100,
      availableBalance: 7300,
      currentWithdrawal: 500,
      withdrawalSuccessAmount: 480,
      currentConsumption: 0,
      currentAvailableBalance: 6800,
      status: '离职'
    },
    {
      month: '2026-01',
      city: '北京',
      name: '赵六',
      department: '服务部',
      position: '推拿师',
      employeeId: '1004',
      mainServiceStore: '北京朝阳门店',
      laborRelationStore: '北京总部',
      contractEntity: '北京常乐健康科技有限公司',
      accountType: 'balance',
      lastMonthBalance: 2600,
      monthlySettlement: 900,
      availableBalance: 3500,
      currentWithdrawal: 300,
      withdrawalSuccessAmount: 280,
      currentConsumption: 200,
      currentAvailableBalance: 3000,
      status: '在职'
    },
    {
      month: '2026-01',
      city: '上海',
      name: '孙七',
      department: '销售部',
      position: '客户经理',
      employeeId: '1005',
      mainServiceStore: '上海浦东门店',
      laborRelationStore: '上海分公司',
      contractEntity: '上海常乐健康科技有限公司',
      accountType: 'balance',
      lastMonthBalance: 3400,
      monthlySettlement: 700,
      availableBalance: 4100,
      currentWithdrawal: 350,
      withdrawalSuccessAmount: 320,
      currentConsumption: 150,
      currentAvailableBalance: 3600,
      status: '离职'
    }
  ]
}

// 当前月份的账户月度信息数据
const accountMonthlyList = ref(accountMonthlyByMonth['2026-03'])

// 处理搜索
const handleSearch = () => {
  console.log('搜索', searchForm)
  // 实际项目中这里会调用API获取数据
  // 模拟切换月份数据
  if (accountMonthlyByMonth[searchForm.month]) {
    accountMonthlyList.value = accountMonthlyByMonth[searchForm.month]
  } else {
    accountMonthlyList.value = []
  }
}

// 重置表单
const resetForm = () => {
  searchForm.month = '2026-03'
  searchForm.nameOrId = ''
  searchForm.department = ''
  searchForm.position = ''
  searchForm.accountType = 'balance'
  // 重置为默认月份数据
  accountMonthlyList.value = accountMonthlyByMonth['2026-03']
}

// 处理导出
const handleExport = () => {
  console.log('导出', {
    ...searchForm,
    exportFields: ['month', 'city', 'name', 'department', 'position', 'employeeId', 'accountType', 'lastMonthBalance', 'monthlySettlement', 'availableBalance', 'currentWithdrawal', 'currentConsumption', 'currentAvailableBalance']
  })
  // 实际项目中这里会调用API导出数据
}

// 查看结算明细
const handleViewSettlement = (row) => {
  console.log('查看结算明细', row)
  const position = row.position || ''
  
  if (position.includes('推拿师') || position.includes('理疗师') || position.includes('技师')) {
    // 跳转到推拿师获豆明细
    router.push({
      name: 'bean-therapist-detail',
      query: { 
        month: row.month,
        employeeId: row.employeeId, 
        employeeName: row.name
      }
    })
  } else if (position.includes('经理') || position.includes('客户经理')) {
    // 跳转到客户经理获豆明细
    router.push({
      name: 'bean-account-manager-detail',
      query: { 
        month: row.month,
        employeeId: row.employeeId, 
        employeeName: row.name
      }
    })
  } else {
    // 跳转到总部岗位获豆明细
    router.push({
      name: 'bean-headquarter-detail',
      query: { 
        month: row.month,
        employeeId: row.employeeId, 
        employeeName: row.name
      }
    })
  }
}

// 查看提现明细
const handleViewWithdrawal = (row) => {
  console.log('查看提现明细', row)
  router.push({
    name: 'bean-usage-detail',
    query: { 
      month: row.month,
      employeeId: row.employeeId, 
      employeeName: row.name,
      type: 'withdrawal'
    }
  })
}

// 查看消费明细
const handleViewConsumption = (row) => {
  console.log('查看消费明细', row)
  router.push({
    name: 'bean-usage-detail',
    query: { 
      month: row.month,
      employeeId: row.employeeId, 
      employeeName: row.name,
      type: 'consumption'
    }
  })
}

// ============ 步骤 1：发起离职补偿（仅在职） ============
const canInitiateResign = (row) => {
  if (currentRole.value !== 'hr_manager') return false
  return row.status === '在职'
}

// ============ 步骤 2：发起新合同（仅离职） ============
// 业务上前置条件依赖步骤 1；原型上仅按状态显示
const canSignNewContract = (row) => {
  if (currentRole.value !== 'hr_manager') return false
  return row.status === '离职'
}

// 弹层 A：发起离职补偿
const resignVisible = ref(false)
const resignTarget = ref(null)
const resignSubmitting = ref(false)

const openResignDialog = (row) => {
  resignTarget.value = row
  resignVisible.value = true
}
const closeResignDialog = () => {
  resignVisible.value = false
  resignTarget.value = null
}
const submitResign = () => {
  resignSubmitting.value = true
  resignTarget.value.status = '离职'
  ElMessage.success(`离职流程已发起：${resignTarget.value.name}（旧合同解除）`)
  resignSubmitting.value = false
  closeResignDialog()
}

// 弹层 B：发起新合同
const newContractVisible = ref(false)
const newContractTarget = ref(null)
const newContractSubmitting = ref(false)
const newContractSigned = ref(null)
const newContractForm = reactive({
  newEntity: '',
  startDate: '',
  endDate: ''
})
const newContractFormRef = ref(null)

const entityOptionsAll = [
  '上海推拿之家健康管理有限公司',
  '成都推拿之家健康管理有限公司',
  '杭州推拿之家健康管理有限公司'
]
const newContractEntityOptions = computed(() => {
  if (!newContractTarget.value) return []
  return entityOptionsAll.filter(e => e !== newContractTarget.value.laborContractEntity)
})

const openNewContractDialog = (row) => {
  newContractTarget.value = row
  newContractSigned.value = null
  Object.assign(newContractForm, { newEntity: '', startDate: '', endDate: '' })
  newContractVisible.value = true
}
const closeNewContractDialog = () => {
  newContractVisible.value = false
  newContractTarget.value = null
  newContractSigned.value = null
}
const submitNewContract = () => {
  if (!newContractForm.newEntity || !newContractForm.startDate || !newContractForm.endDate) {
    ElMessage.warning('请完整填写新合同主体与合同期间')
    return
  }
  if (newContractForm.newEntity === newContractTarget.value.laborContractEntity) {
    ElMessage.warning('新合同主体不可与原合同主体相同')
    return
  }
  newContractSubmitting.value = true
  newContractSigned.value = {
    slipNo: 'NEW-' + Date.now(),
    oldEntity: newContractTarget.value.laborContractEntity,
    newEntity: newContractForm.newEntity,
    startDate: newContractForm.startDate,
    endDate: newContractForm.endDate,
    signedAt: new Date().toLocaleString('zh-CN')
  }
  ElMessage.success(`新合同已发起：${newContractTarget.value.name}`)
  newContractSubmitting.value = false
}

const onPreviewContract = () => {
  ElMessage.info('已生成《解除劳动合同》预览（mock）')
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.pageSize = size
  // 实际项目中这里会重新获取数据
}

const handleCurrentChange = (current) => {
  pagination.currentPage = current
  // 实际项目中这里会重新获取数据
}

// 生命周期钩子
onMounted(() => {
  // 实际项目中这里会初始化数据
})
</script>

<style scoped>
.bean-account-monthly {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-section {
  margin-bottom: 20px;
}

.pagination-section {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 离职发起弹层 */
.resign-tip {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px 14px;
  background: #fff8fa;
  border: 1px solid #f5d0da;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.6;
  color: #5a3a44;
  margin-bottom: 18px;
}
.resign-tip .tip-icon {
  color: #a40035;
  font-size: 18px;
  margin-top: 2px;
}

.resign-section {
  margin-bottom: 18px;
}
.resign-section .section-title {
  font-size: 12px;
  font-weight: 600;
  color: #909399;
  margin-bottom: 8px;
}
.contract-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #f5f7fa;
  border-radius: 6px;
  color: #303133;
  font-size: 13px;
  text-decoration: none;
  transition: background 0.15s;
}
.contract-link:hover {
  background: #ebeef5;
  color: #a40035;
}

.resign-form {
  margin-top: 4px;
}

.readonly-text {
  color: #606266;
  font-size: 13px;
}

/* 已签订态 */
.signed-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #f0f9eb;
  border: 1px solid #d4e8c2;
  border-radius: 6px;
  margin-bottom: 16px;
}
.signed-banner-icon {
  color: #67c23a;
  font-size: 24px;
}
.signed-banner-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}
.signed-banner-sub {
  font-size: 12px;
  color: #606266;
  margin-top: 2px;
}

.signed-card {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  overflow: hidden;
}

.signed-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  font-size: 13px;
  border-bottom: 1px solid #f5f5f5;
}
.signed-row:last-child {
  border-bottom: none;
}

.signed-label {
  width: 92px;
  color: #909399;
  font-size: 12px;
}

.signed-value {
  flex: 1;
  color: #303133;
}

.signed-old {
  text-decoration: line-through;
  color: #909399;
}

.signed-new {
  color: #a40035;
  font-weight: 600;
}

.mono {
  font-family: 'SF Mono', Menlo, Consolas, monospace;
  font-size: 12px;
  color: #606266;
}

/* ============ 表格操作列：分层排版 ============ */
.row-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
  line-height: 1;
}
.row-actions-secondary {
  display: flex;
  gap: 4px;
}
.row-actions-secondary :deep(.el-button) {
  font-size: 12px;
  padding: 4px 10px;
  background: #fff;
  border-color: #dcdfe6;
  color: #606266;
  border-radius: 4px;
}
.row-actions-secondary :deep(.el-button:hover) {
  color: #a40035;
  border-color: #a40035;
  background: #fff;
}
.row-actions-primary :deep(.el-button) {
  font-size: 12px;
  padding: 5px 12px;
}

/* 覆盖主按钮为品牌色（默认 primary 是蓝） */
.row-actions-primary :deep(.el-button.el-button--primary) {
  background: #a40035;
  border-color: #a40035;
}
.row-actions-primary :deep(.el-button.el-button--primary:hover) {
  background: #8a002d;
  border-color: #8a002d;
}
</style>
