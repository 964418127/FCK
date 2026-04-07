<template>
  <div class="bean-withdrawal-detail">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>常乐豆提现明细</span>
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
          <el-form-item label="提现单号">
            <el-input v-model="searchForm.withdrawalNo" placeholder="请输入提现单号" />
          </el-form-item>
          <el-form-item label="提现发起时间">
            <el-date-picker
              v-model="searchForm.startTime"
              type="datetime"
              placeholder="选择开始时间"
            />
          </el-form-item>
          <el-form-item label="提现完成时间">
            <el-date-picker
              v-model="searchForm.endTime"
              type="datetime"
              placeholder="选择结束时间"
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
          <el-form-item label="提现状态">
            <el-select v-model="searchForm.status" placeholder="请选择提现状态" style="width: 150px;">
              <el-option label="冻结" value="frozen" />
              <el-option label="提现成功" value="success" />
              <el-option label="提现失败" value="failed" />
            </el-select>
          </el-form-item>
          <el-form-item label="出账账户">
            <el-select v-model="searchForm.accountType" placeholder="请选择出账账户" style="width: 150px;">
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
      
      <el-table :data="withdrawalList" style="width: 100%">
        <el-table-column prop="month" label="月份" width="120" />
        <el-table-column prop="withdrawalNo" label="提现单号" width="200" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="department" label="部门" width="150" />
        <el-table-column prop="position" label="岗位" width="150" />
        <el-table-column prop="employeeId" label="工号" width="100" />
        <el-table-column prop="mainServiceStore" label="主服务门店" width="150" />
        <el-table-column prop="laborRelationStore" label="劳动关系门店" width="150" />
        <el-table-column prop="contractEntity" label="合同主体" width="200" />
        <el-table-column prop="withdrawalAmount" label="提现数量" width="120" />
        <el-table-column prop="beforeBalance" label="交易前余额" width="120" />
        <el-table-column prop="afterBalance" label="交易后余额" width="120">
          <template #default="scope">
            <el-tag type="success">{{ scope.row.afterBalance }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="accountType" label="出账账户" width="120">
          <template #default="scope">
            <el-tag type="info">{{ scope.row.accountType === 'balance' ? '余额账户' : scope.row.accountType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="initiateTime" label="提现发起时间" width="180" />
        <el-table-column prop="completeTime" label="提现完成时间" width="180" />
        <el-table-column prop="withdrawalAmount" label="交易数量" width="120" />
        <el-table-column prop="status" label="提现状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
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
import { useRoute } from 'vue-router'
import { Download, Search, Refresh } from '@element-plus/icons-vue'

const route = useRoute()

// 搜索表单
const searchForm = reactive({
  month: '',
  withdrawalNo: '',
  startTime: '',
  endTime: '',
  nameOrId: route.query.employeeName || '',
  department: '',
  position: '',
  mainServiceStore: '',
  laborRelationStore: '',
  contractEntity: '',
  status: '',
  accountType: 'balance'
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 100
})

// 提现明细数据
const withdrawalList = ref([
  {
    month: '2026-03',
    withdrawalNo: 'WDR2026030001',
    name: '张三',
    department: '技术部',
    position: '前端开发',
    employeeId: '1001',
    mainServiceStore: '',
    laborRelationStore: '北京总部',
    contractEntity: '北京常乐健康科技有限公司',
    withdrawalAmount: 500,
    beforeBalance: 1500,
    afterBalance: 1000,
    accountType: 'balance',
    initiateTime: '2026-03-02 10:00:00',
    completeTime: '2026-03-02 10:30:00',
    status: 'success'
  },
  {
    month: '2026-03',
    withdrawalNo: 'WDR2026030002',
    name: '李四',
    department: '市场部',
    position: '市场专员',
    employeeId: '1002',
    mainServiceStore: '',
    laborRelationStore: '上海分公司',
    contractEntity: '上海常乐健康科技有限公司',
    withdrawalAmount: 300,
    beforeBalance: 1100,
    afterBalance: 800,
    accountType: 'balance',
    initiateTime: '2026-03-02 11:00:00',
    completeTime: '2026-03-02 11:30:00',
    status: 'success'
  },
  {
    month: '2026-03',
    withdrawalNo: 'WDR2026030003',
    name: '王五',
    department: '销售部',
    position: '销售经理',
    employeeId: '1003',
    mainServiceStore: '',
    laborRelationStore: '广州分公司',
    contractEntity: '广州常乐健康科技有限公司',
    withdrawalAmount: 1000,
    beforeBalance: 2300,
    afterBalance: 1300,
    accountType: 'balance',
    initiateTime: '2026-03-02 14:00:00',
    completeTime: '2026-03-02 14:30:00',
    status: 'success'
  },
  {
    month: '2026-03',
    withdrawalNo: 'WDR2026030004',
    name: '赵六',
    department: '服务部',
    position: '推拿师',
    employeeId: '1004',
    mainServiceStore: '北京朝阳门店',
    laborRelationStore: '北京总部',
    contractEntity: '北京常乐健康科技有限公司',
    withdrawalAmount: 400,
    beforeBalance: 1600,
    afterBalance: 1200,
    accountType: 'balance',
    initiateTime: '2026-03-02 15:00:00',
    completeTime: '2026-03-02 15:30:00',
    status: 'success'
  },
  {
    month: '2026-03',
    withdrawalNo: 'WDR2026030005',
    name: '孙七',
    department: '销售部',
    position: '客户经理',
    employeeId: '1005',
    mainServiceStore: '上海浦东门店',
    laborRelationStore: '上海分公司',
    contractEntity: '上海常乐健康科技有限公司',
    withdrawalAmount: 450,
    beforeBalance: 1100,
    afterBalance: 650,
    accountType: 'balance',
    initiateTime: '2026-03-02 16:00:00',
    completeTime: '2026-03-02 16:30:00',
    status: 'success'
  }
])

// 获取状态标签类型
const getStatusTagType = (status) => {
  switch (status) {
    case 'frozen':
      return 'warning'
    case 'success':
      return 'success'
    case 'failed':
      return 'danger'
    default:
      return 'info'
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'frozen':
      return '冻结'
    case 'success':
      return '提现成功'
    case 'failed':
      return '提现失败'
    default:
      return status
  }
}

// 处理搜索
const handleSearch = () => {
  console.log('搜索', searchForm)
  // 实际项目中这里会调用API获取数据
}

// 重置表单
const resetForm = () => {
  searchForm.month = ''
  searchForm.withdrawalNo = ''
  searchForm.startTime = ''
  searchForm.endTime = ''
  searchForm.nameOrId = route.query.employeeName || ''
  searchForm.department = ''
  searchForm.position = ''
  searchForm.status = ''
  searchForm.accountType = 'balance'
}

// 处理导出
const handleExport = () => {
  console.log('导出')
  // 实际项目中这里会调用API导出数据
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
.bean-withdrawal-detail {
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
