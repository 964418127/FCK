<template>
  <div class="bean-headquarter-detail">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>总部岗位获豆明细</span>
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
          <el-form-item label="结算单号">
            <el-input v-model="searchForm.settlementNo" placeholder="请输入结算单号" />
          </el-form-item>
          <el-form-item label="结算发起时间">
            <el-date-picker
              v-model="searchForm.startTime"
              type="datetime"
              placeholder="选择开始时间"
            />
          </el-form-item>
          <el-form-item label="结算完成时间">
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
          <el-form-item label="结算状态">
            <el-select v-model="searchForm.status" placeholder="请选择结算状态" style="width: 150px;">
              <el-option label="结算发起" value="initiated" />
              <el-option label="结算成功" value="success" />
              <el-option label="结算失败" value="failed" />
            </el-select>
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
      
      <el-table :data="headquarterList" style="width: 100%">
        <el-table-column prop="month" label="月份" width="120" />
        <el-table-column prop="settlementNo" label="结算单号" width="200" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="department" label="部门" width="150" />
        <el-table-column prop="position" label="岗位" width="150" />
        <el-table-column prop="employeeId" label="工号" width="100" />
        <el-table-column prop="mainServiceStore" label="主服务门店" width="180">
          <template #default="scope">
            {{ scope.row.mainServiceStore ? scope.row.mainServiceStore + '（' + scope.row.mainServiceStoreCode + '）' : '' }}
          </template>
        </el-table-column>
        <el-table-column prop="laborRelationStore" label="劳动关系门店" width="180">
          <template #default="scope">
            {{ scope.row.laborRelationStore ? scope.row.laborRelationStore + '（' + scope.row.laborRelationStoreCode + '）' : '' }}
          </template>
        </el-table-column>
        <el-table-column prop="contractEntity" label="合同主体" width="200" />
        <el-table-column prop="scheduleBeans" label="日程获豆" width="120" />
        <el-table-column prop="indicatorBeans" label="指标获豆" width="120" />
        <el-table-column prop="totalBeans" label="获豆小计" width="120" />
        <el-table-column prop="expiredBeans" label="失效常乐豆" width="120" />
        <el-table-column prop="monthlyTotalBeans" label="本月获豆小计" width="150" />
        <el-table-column prop="settlementAmount" label="结算数量" width="120" />
        <el-table-column prop="accountType" label="入账账户" width="120">
          <template #default="scope">
            <el-tag type="info">{{ scope.row.accountType === 'balance' ? '余额账户' : scope.row.accountType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="initiateTime" label="结算发起时间" width="180" />
        <el-table-column prop="completeTime" label="结算完成时间" width="180" />
        <el-table-column prop="status" label="结算状态" width="120">
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
import { Download, Search, Refresh, OfficeBuilding } from '@element-plus/icons-vue'

const route = useRoute()

// 搜索表单
const searchForm = reactive({
  month: '',
  settlementNo: '',
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

// 总部岗位获豆明细数据 - 按月份组织
const headquarterByMonth = {
  '2026-03': [
    {
      month: '2026-03',
      settlementNo: 'SET2026030001',
      name: '张三',
      department: '人力资源部',
      position: '人事专员',
      employeeId: '1001',
      mainServiceStore: '',
      mainServiceStoreCode: '',
      laborRelationStore: '北京总部',
      laborRelationStoreCode: '112101',
      contractEntity: '北京常乐健康科技有限公司',
      scheduleBeans: 500,
      indicatorBeans: 200,
      totalBeans: 700,
      expiredBeans: 35,
      monthlyTotalBeans: 665,
      settlementAmount: 665,
      accountType: 'balance',
      initiateTime: '2026-03-01 10:00:00',
      completeTime: '2026-03-01 10:05:00',
      status: 'success'
    },
    {
      month: '2026-03',
      settlementNo: 'SET2026030002',
      name: '李四',
      department: '财务部',
      position: '财务专员',
      employeeId: '1002',
      mainServiceStore: '',
      mainServiceStoreCode: '',
      laborRelationStore: '北京总部',
      laborRelationStoreCode: '112101',
      contractEntity: '北京常乐健康科技有限公司',
      scheduleBeans: 450,
      indicatorBeans: 180,
      totalBeans: 630,
      expiredBeans: 31,
      monthlyTotalBeans: 599,
      settlementAmount: 599,
      accountType: 'balance',
      initiateTime: '2026-03-01 11:00:00',
      completeTime: '2026-03-01 11:03:00',
      status: 'success'
    },
    {
      month: '2026-03',
      settlementNo: 'SET2026030003',
      name: '王五',
      department: '行政部',
      position: '行政专员',
      employeeId: '1003',
      mainServiceStore: '',
      mainServiceStoreCode: '',
      laborRelationStore: '北京总部',
      laborRelationStoreCode: '112101',
      contractEntity: '北京常乐健康科技有限公司',
      scheduleBeans: 400,
      indicatorBeans: 160,
      totalBeans: 560,
      expiredBeans: 28,
      monthlyTotalBeans: 532,
      settlementAmount: 532,
      accountType: 'balance',
      initiateTime: '2026-03-01 14:00:00',
      completeTime: '2026-03-01 14:02:00',
      status: 'success'
    }
  ],
  '2026-02': [
    {
      month: '2026-02',
      settlementNo: 'SET2026020001',
      name: '张三',
      department: '人力资源部',
      position: '人事专员',
      employeeId: '1001',
      mainServiceStore: '',
      mainServiceStoreCode: '',
      laborRelationStore: '北京总部',
      laborRelationStoreCode: '112101',
      contractEntity: '北京常乐健康科技有限公司',
      scheduleBeans: 450,
      indicatorBeans: 180,
      totalBeans: 630,
      expiredBeans: 31,
      monthlyTotalBeans: 599,
      settlementAmount: 599,
      accountType: 'balance',
      initiateTime: '2026-02-01 10:00:00',
      completeTime: '2026-02-01 10:05:00',
      status: 'success'
    },
    {
      month: '2026-02',
      settlementNo: 'SET2026020002',
      name: '李四',
      department: '财务部',
      position: '财务专员',
      employeeId: '1002',
      mainServiceStore: '',
      mainServiceStoreCode: '',
      laborRelationStore: '北京总部',
      laborRelationStoreCode: '112101',
      contractEntity: '北京常乐健康科技有限公司',
      scheduleBeans: 405,
      indicatorBeans: 162,
      totalBeans: 567,
      expiredBeans: 28,
      monthlyTotalBeans: 539,
      settlementAmount: 539,
      accountType: 'balance',
      initiateTime: '2026-02-01 11:00:00',
      completeTime: '2026-02-01 11:03:00',
      status: 'success'
    },
    {
      month: '2026-02',
      settlementNo: 'SET2026020003',
      name: '王五',
      department: '行政部',
      position: '行政专员',
      employeeId: '1003',
      mainServiceStore: '',
      mainServiceStoreCode: '',
      laborRelationStore: '北京总部',
      laborRelationStoreCode: '112101',
      contractEntity: '北京常乐健康科技有限公司',
      scheduleBeans: 360,
      indicatorBeans: 144,
      totalBeans: 504,
      expiredBeans: 25,
      monthlyTotalBeans: 479,
      settlementAmount: 479,
      accountType: 'balance',
      initiateTime: '2026-02-01 14:00:00',
      completeTime: '2026-02-01 14:02:00',
      status: 'success'
    }
  ],
  '2026-01': [
    {
      month: '2026-01',
      settlementNo: 'SET2026010001',
      name: '张三',
      department: '人力资源部',
      position: '人事专员',
      employeeId: '1001',
      mainServiceStore: '',
      mainServiceStoreCode: '',
      laborRelationStore: '北京总部',
      laborRelationStoreCode: '112101',
      contractEntity: '北京常乐健康科技有限公司',
      scheduleBeans: 400,
      indicatorBeans: 160,
      totalBeans: 560,
      expiredBeans: 28,
      monthlyTotalBeans: 532,
      settlementAmount: 532,
      accountType: 'balance',
      initiateTime: '2026-01-01 10:00:00',
      completeTime: '2026-01-01 10:05:00',
      status: 'success'
    },
    {
      month: '2026-01',
      settlementNo: 'SET2026010002',
      name: '李四',
      department: '财务部',
      position: '财务专员',
      employeeId: '1002',
      mainServiceStore: '',
      mainServiceStoreCode: '',
      laborRelationStore: '北京总部',
      laborRelationStoreCode: '112101',
      contractEntity: '北京常乐健康科技有限公司',
      scheduleBeans: 360,
      indicatorBeans: 144,
      totalBeans: 504,
      expiredBeans: 25,
      monthlyTotalBeans: 479,
      settlementAmount: 479,
      accountType: 'balance',
      initiateTime: '2026-01-01 11:00:00',
      completeTime: '2026-01-01 11:03:00',
      status: 'success'
    },
    {
      month: '2026-01',
      settlementNo: 'SET2026010003',
      name: '王五',
      department: '行政部',
      position: '行政专员',
      employeeId: '1003',
      mainServiceStore: '',
      mainServiceStoreCode: '',
      laborRelationStore: '北京总部',
      laborRelationStoreCode: '112101',
      contractEntity: '北京常乐健康科技有限公司',
      scheduleBeans: 320,
      indicatorBeans: 128,
      totalBeans: 448,
      expiredBeans: 22,
      monthlyTotalBeans: 426,
      settlementAmount: 426,
      accountType: 'balance',
      initiateTime: '2026-01-01 14:00:00',
      completeTime: '2026-01-01 14:02:00',
      status: 'success'
    }
  ]
}

// 当前月份的总部岗位获豆明细数据
const headquarterList = ref(headquarterByMonth['2026-03'])

// 获取状态标签类型
const getStatusTagType = (status) => {
  switch (status) {
    case 'initiated':
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
    case 'initiated':
      return '结算发起'
    case 'success':
      return '结算成功'
    case 'failed':
      return '结算失败'
    default:
      return status
  }
}

// 处理搜索
const handleSearch = () => {
  console.log('搜索', searchForm)
  // 实际项目中这里会调用API获取数据
  // 模拟切换月份数据
  if (headquarterByMonth[searchForm.month]) {
    headquarterList.value = headquarterByMonth[searchForm.month]
  } else {
    headquarterList.value = []
  }
}

// 重置表单
const resetForm = () => {
  searchForm.month = '2026-03'
  searchForm.settlementNo = ''
  searchForm.startTime = ''
  searchForm.endTime = ''
  searchForm.nameOrId = route.query.employeeName || ''
  searchForm.department = ''
  searchForm.position = ''
  searchForm.status = ''
  searchForm.accountType = 'balance'
  // 重置为默认月份数据
  headquarterList.value = headquarterByMonth['2026-03']
}

// 处理导出
const handleExport = () => {
  console.log('导出', {
    ...searchForm,
    exportFields: ['month', 'settlementNo', 'name', 'department', 'position', 'employeeId', 'scheduleBeans', 'totalBeans', 'expiredBeans', 'monthlyTotalBeans', 'settlementAmount', 'accountType', 'initiateTime', 'completeTime', 'status']
  })
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
.bean-headquarter-detail {
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
