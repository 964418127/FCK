<template>
  <div class="bean-account-list">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>常乐豆账户列表</span>
          <el-button type="primary" size="small" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </div>
      </template>
      
      <div class="search-section">
        <el-form :inline="true" class="demo-form-inline">
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
              <el-option label="奖励账户" value="reward" />
              <el-option label="活动账户" value="activity" />
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
      
      <el-table :data="userList" style="width: 100%; min-width: 900px;" default-expand-all>
        <el-table-column type="expand">
          <template #default="scope">
            <el-table :data="scope.row.accounts" style="width: 100%" border>
              <el-table-column prop="accountId" label="账户ID" width="150" />
              <el-table-column prop="accountType" label="账户类型" width="120">
                <template #default="accountScope">
                  <el-tag type="info">{{ getAccountTypeName(accountScope.row.accountType) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="availableBalance" label="可用余额数量" width="150">
                <template #default="accountScope">
                  <el-tag type="success">{{ accountScope.row.availableBalance }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="monthlyWithdrawal" label="本月累计提现数量" />
              <el-table-column prop="monthlyConsumption" label="本月累计消费数量" />
              <el-table-column prop="totalWithdrawal" label="累计提现数量" />
              <el-table-column prop="totalConsumption" label="累计消费数量" />
              <el-table-column label="操作" width="300">
                <template #default="accountScope">
                  <el-button size="small" type="primary" @click="handleViewSettlement(scope.row, accountScope.row)">
                    <el-icon><Document /></el-icon>
                    结算明细
                  </el-button>
                  <el-button size="small" type="warning" @click="handleViewWithdrawal(scope.row, accountScope.row)">
                    <el-icon><ArrowUp /></el-icon>
                    提现明细
                  </el-button>
                  <el-button size="small" type="info" @click="handleViewConsumption(scope.row, accountScope.row)">
                    <el-icon><ShoppingCart /></el-icon>
                    消费明细
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column prop="city" label="城市" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="department" label="部门" />
        <el-table-column prop="position" label="岗位" />
        <el-table-column prop="employeeId" label="工号" />
        <el-table-column prop="mainServiceStore" label="主服务门店" />
        <el-table-column prop="laborRelationStore" label="劳动关系门店" />
        <el-table-column prop="contractEntity" label="合同主体" />
        <el-table-column label="账户数量">
          <template #default="scope">
            {{ scope.row.accounts.length }}
          </template>
        </el-table-column>
        <el-table-column label="总可用余额">
          <template #default="scope">
            <el-tag type="success">{{ getTotalBalance(scope.row.accounts) }}</el-tag>
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
import { Download, Search, Refresh, Document, ArrowUp, ShoppingCart } from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const searchForm = reactive({
  nameOrId: '',
  department: '',
  position: '',
  mainServiceStore: '',
  laborRelationStore: '',
  contractEntity: '',
  accountType: ''
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 100
})

// 用户列表数据
const userList = ref([
  {
    city: '北京',
    name: '张三',
    department: '技术部',
    position: '前端开发',
    employeeId: '1001',
    mainServiceStore: '',
    laborRelationStore: '北京总部',
    contractEntity: '北京常乐健康科技有限公司',
    accounts: [
      {
        accountId: 'ACC1001001',
        accountType: 'balance',
        lastMonthBalance: 4700,
        monthlySettlement: 1000,
        availableBalance: 5000,
        monthlyWithdrawal: 500,
        monthlyConsumption: 200,
        totalWithdrawal: 2000,
        totalConsumption: 1000
      },
      {
        accountId: 'ACC1001002',
        accountType: 'reward',
        lastMonthBalance: 1000,
        monthlySettlement: 500,
        availableBalance: 1200,
        monthlyWithdrawal: 200,
        monthlyConsumption: 100,
        totalWithdrawal: 500,
        totalConsumption: 300
      }
    ]
  },
  {
    city: '上海',
    name: '李四',
    department: '市场部',
    position: '市场专员',
    employeeId: '1002',
    mainServiceStore: '',
    laborRelationStore: '上海分公司',
    contractEntity: '上海常乐健康科技有限公司',
    accounts: [
      {
        accountId: 'ACC1002001',
        accountType: 'balance',
        lastMonthBalance: 2650,
        monthlySettlement: 800,
        availableBalance: 3000,
        monthlyWithdrawal: 300,
        monthlyConsumption: 150,
        totalWithdrawal: 1500,
        totalConsumption: 800
      }
    ]
  },
  {
    city: '广州',
    name: '王五',
    department: '销售部',
    position: '销售经理',
    employeeId: '1003',
    mainServiceStore: '',
    laborRelationStore: '广州分公司',
    contractEntity: '广州常乐健康科技有限公司',
    accounts: [
      {
        accountId: 'ACC1003001',
        accountType: 'balance',
        lastMonthBalance: 7300,
        monthlySettlement: 1500,
        availableBalance: 8000,
        monthlyWithdrawal: 1000,
        monthlyConsumption: 300,
        totalWithdrawal: 3000,
        totalConsumption: 2000
      },
      {
        accountId: 'ACC1003002',
        accountType: 'reward',
        lastMonthBalance: 2000,
        monthlySettlement: 800,
        availableBalance: 2500,
        monthlyWithdrawal: 200,
        monthlyConsumption: 100,
        totalWithdrawal: 800,
        totalConsumption: 500
      },
      {
        accountId: 'ACC1003003',
        accountType: 'activity',
        lastMonthBalance: 500,
        monthlySettlement: 200,
        availableBalance: 600,
        monthlyWithdrawal: 0,
        monthlyConsumption: 100,
        totalWithdrawal: 0,
        totalConsumption: 100
      }
    ]
  },
  {
    city: '北京',
    name: '赵六',
    department: '服务部',
    position: '推拿师',
    employeeId: '1004',
    mainServiceStore: '北京朝阳门店',
    laborRelationStore: '北京总部',
    contractEntity: '北京常乐健康科技有限公司',
    accounts: [
      {
        accountId: 'ACC1004001',
        accountType: 'balance',
        lastMonthBalance: 3500,
        monthlySettlement: 1200,
        availableBalance: 4200,
        monthlyWithdrawal: 400,
        monthlyConsumption: 150,
        totalWithdrawal: 1800,
        totalConsumption: 900
      }
    ]
  },
  {
    city: '上海',
    name: '孙七',
    department: '销售部',
    position: '客户经理',
    employeeId: '1005',
    mainServiceStore: '上海浦东门店',
    laborRelationStore: '上海分公司',
    contractEntity: '上海常乐健康科技有限公司',
    accounts: [
      {
        accountId: 'ACC1005001',
        accountType: 'balance',
        lastMonthBalance: 4200,
        monthlySettlement: 900,
        availableBalance: 4600,
        monthlyWithdrawal: 450,
        monthlyConsumption: 180,
        totalWithdrawal: 2200,
        totalConsumption: 1100
      }
    ]
  }
])

// 获取账户类型名称
const getAccountTypeName = (type) => {
  const typeMap = {
    balance: '余额账户',
    reward: '奖励账户',
    activity: '活动账户'
  }
  return typeMap[type] || type
}

// 计算用户总可用余额
const getTotalBalance = (accounts) => {
  return accounts.reduce((total, account) => total + account.availableBalance, 0)
}

// 处理搜索
const handleSearch = () => {
  console.log('搜索', searchForm)
  // 实际项目中这里会调用API获取数据
  // 模拟搜索逻辑
  // 这里可以根据searchForm的条件过滤userList
}

// 重置表单
const resetForm = () => {
  searchForm.nameOrId = ''
  searchForm.department = ''
  searchForm.position = ''
  searchForm.accountType = ''
  // 实际项目中这里会重新获取数据
}

// 处理导出
const handleExport = () => {
  console.log('导出', {
    ...searchForm,
    exportFields: ['name', 'department', 'position', 'employeeId', 'accountId', 'accountType', 'lastMonthBalance', 'monthlySettlement', 'availableBalance', 'monthlyWithdrawal', 'monthlyConsumption', 'totalWithdrawal', 'totalConsumption']
  })
  // 实际项目中这里会调用API导出数据
}

// 查看结算明细
const handleViewSettlement = (user, account) => {
  console.log('查看结算明细', user, account)
  router.push({
    name: 'bean-settlement-detail',
    query: { 
      employeeId: user.employeeId, 
      employeeName: user.name,
      accountId: account.accountId,
      accountType: account.accountType
    }
  })
}

// 查看提现明细
const handleViewWithdrawal = (user, account) => {
  console.log('查看提现明细', user, account)
  router.push({
    name: 'bean-withdrawal-detail',
    query: { 
      employeeId: user.employeeId, 
      employeeName: user.name,
      accountId: account.accountId,
      accountType: account.accountType
    }
  })
}

// 查看消费明细
const handleViewConsumption = (user, account) => {
  console.log('查看消费明细', user, account)
  router.push({
    name: 'bean-consumption-detail',
    query: { 
      employeeId: user.employeeId, 
      employeeName: user.name,
      accountId: account.accountId,
      accountType: account.accountType
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
.bean-account-list {
  padding: 20px;
  overflow-x: auto;
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-section {
  margin-bottom: 20px;
  width: 100%;
}

.pagination-section {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 优化展开表格的显示 */
:deep(.el-table__expanded-cell) {
  padding: 10px 0 !important;
  width: 100%;
}

:deep(.el-table__expanded-cell > .el-table) {
  width: 100% !important;
  min-width: 900px;
}

/* 确保表格占满容器 */
:deep(.el-table) {
  width: 100% !important;
}

/* 调整列宽，让表格充分利用空间 */
:deep(.el-table__header-wrapper),
:deep(.el-table__body-wrapper) {
  width: 100% !important;
}
</style>
