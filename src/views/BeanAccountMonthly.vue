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
        <el-table-column label="操作" width="300">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleViewSettlement(scope.row)">
              <el-icon><Document /></el-icon>
              结算明细
            </el-button>
            <el-button size="small" type="warning" @click="handleViewWithdrawal(scope.row)">
              <el-icon><ArrowUp /></el-icon>
              提现明细
            </el-button>
            <el-button size="small" type="info" @click="handleViewConsumption(scope.row)">
              <el-icon><ShoppingCart /></el-icon>
              消费明细
            </el-button>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Download, Search, Refresh, Calendar, Document, ArrowUp, ShoppingCart } from '@element-plus/icons-vue'

const router = useRouter()

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
      currentAvailableBalance: 5000
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
      currentAvailableBalance: 3000
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
      currentAvailableBalance: 7500
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
      currentAvailableBalance: 4150
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
      currentAvailableBalance: 4470
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
      currentAvailableBalance: 4700
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
      currentAvailableBalance: 2650
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
      currentAvailableBalance: 7300
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
      currentAvailableBalance: 3500
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
      currentAvailableBalance: 4050
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
      currentAvailableBalance: 4200
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
      currentAvailableBalance: 2200
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
      currentAvailableBalance: 6800
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
      currentAvailableBalance: 3000
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
      currentAvailableBalance: 3600
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
</style>
