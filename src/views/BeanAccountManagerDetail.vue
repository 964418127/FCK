<template>
  <div class="bean-account-manager-detail">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>客户经理获豆明细</span>
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
      
      <el-table :data="accountManagerList" style="width: 100%">
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
        <el-table-column prop="newCustomerBeans" label="新客获豆" width="120" />
        <el-table-column prop="evaluationBeans" label="评价获豆" width="120" />
        <el-table-column prop="linenBeans" label="布草结余获豆" width="150" />
        <el-table-column prop="consumablesBeans" label="消耗品结余获豆" width="150" />
        <el-table-column prop="assetMaintenanceBeans" label="资产维护获豆" width="150" />
        <el-table-column prop="accommodationBeans" label="住宿获豆" width="100" />
        <el-table-column prop="roomCleaningBeans" label="房间卫生打扫获豆" width="180" />
        <el-table-column prop="toiletCleaningBeans" label="卫生间卫生打扫获豆" width="180" />
        <el-table-column prop="trainingBeans" label="培训获豆" width="100" />
        <el-table-column prop="therapistPerformanceBeans" label="推拿师业绩达标获豆" width="180" />
        <el-table-column prop="guaranteeBeans" label="保底获豆" width="100" />
        <el-table-column prop="probationBeans" label="试岗获豆" width="100" />
        <el-table-column prop="shiftSubsidyBeans" label="班次补贴获豆" width="150" />
        <el-table-column prop="partnerBeans" label="三级合伙人获豆" width="150" />
        <el-table-column prop="manualSubsidyBeans" label="客户经理人事手动补贴" width="180" />
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
import { Download, Search, Refresh, UserFilled } from '@element-plus/icons-vue'

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

// 客户经理获豆明细数据 - 按月份组织
const accountManagerByMonth = {
  '2026-03': [
    {
      month: '2026-03',
      settlementNo: 'SET2026030001',
      name: '张三',
      department: '市场部',
      position: '客户经理',
      employeeId: '1001',
      mainServiceStore: '北京海淀门店',
      mainServiceStoreCode: '112103',
      laborRelationStore: '北京总部',
      laborRelationStoreCode: '112101',
      contractEntity: '北京常乐健康科技有限公司',
      newCustomerBeans: 300,
      evaluationBeans: 100,
      linenBeans: 50,
      consumablesBeans: 30,
      assetMaintenanceBeans: 20,
      accommodationBeans: 10,
      roomCleaningBeans: 40,
      toiletCleaningBeans: 30,
      trainingBeans: 50,
      therapistPerformanceBeans: 200,
      guaranteeBeans: 400,
      probationBeans: 100,
      shiftSubsidyBeans: 150,
      partnerBeans: 250,
      manualSubsidyBeans: 100,
      totalBeans: 2080,
      expiredBeans: 80,
      monthlyTotalBeans: 2000,
      settlementAmount: 2000,
      accountType: 'balance',
      initiateTime: '2026-03-01 10:00:00',
      completeTime: '2026-03-01 10:05:00',
      status: 'success'
    },
    {
      month: '2026-03',
      settlementNo: 'SET2026030002',
      name: '李四',
      department: '市场部',
      position: '客户经理',
      employeeId: '1002',
      mainServiceStore: '上海静安门店',
      mainServiceStoreCode: '312102',
      laborRelationStore: '上海分公司',
      laborRelationStoreCode: '312101',
      contractEntity: '上海常乐健康科技有限公司',
      newCustomerBeans: 250,
      evaluationBeans: 80,
      linenBeans: 40,
      consumablesBeans: 20,
      assetMaintenanceBeans: 15,
      accommodationBeans: 5,
      roomCleaningBeans: 30,
      toiletCleaningBeans: 20,
      trainingBeans: 40,
      therapistPerformanceBeans: 150,
      guaranteeBeans: 300,
      probationBeans: 80,
      shiftSubsidyBeans: 120,
      partnerBeans: 200,
      manualSubsidyBeans: 80,
      totalBeans: 1530,
      expiredBeans: 60,
      monthlyTotalBeans: 1470,
      settlementAmount: 1470,
      accountType: 'balance',
      initiateTime: '2026-03-01 11:00:00',
      completeTime: '2026-03-01 11:03:00',
      status: 'success'
    },
    {
      month: '2026-03',
      settlementNo: 'SET2026030003',
      name: '王五',
      department: '市场部',
      position: '客户经理',
      employeeId: '1003',
      mainServiceStore: '广州天河门店',
      mainServiceStoreCode: '442102',
      laborRelationStore: '广州分公司',
      laborRelationStoreCode: '442101',
      contractEntity: '广州常乐健康科技有限公司',
      newCustomerBeans: 350,
      evaluationBeans: 120,
      linenBeans: 60,
      consumablesBeans: 40,
      assetMaintenanceBeans: 25,
      accommodationBeans: 15,
      roomCleaningBeans: 50,
      toiletCleaningBeans: 40,
      trainingBeans: 60,
      therapistPerformanceBeans: 250,
      guaranteeBeans: 500,
      probationBeans: 120,
      shiftSubsidyBeans: 180,
      partnerBeans: 300,
      manualSubsidyBeans: 120,
      totalBeans: 2630,
      expiredBeans: 100,
      monthlyTotalBeans: 2530,
      settlementAmount: 2530,
      accountType: 'balance',
      initiateTime: '2026-03-01 14:00:00',
      completeTime: '2026-03-01 14:02:00',
      status: 'success'
    },
    {
      month: '2026-03',
      settlementNo: 'SET2026030005',
      name: '孙七',
      department: '销售部',
      position: '客户经理',
      employeeId: '1005',
      mainServiceStore: '上海浦东门店',
      mainServiceStoreCode: '312103',
      laborRelationStore: '上海分公司',
      laborRelationStoreCode: '312101',
      contractEntity: '上海常乐健康科技有限公司',
      newCustomerBeans: 350,
      evaluationBeans: 120,
      linenBeans: 60,
      consumablesBeans: 36,
      assetMaintenanceBeans: 24,
      accommodationBeans: 12,
      roomCleaningBeans: 48,
      toiletCleaningBeans: 36,
      trainingBeans: 60,
      therapistPerformanceBeans: 240,
      guaranteeBeans: 480,
      probationBeans: 60,
      shiftSubsidyBeans: 36,
      partnerBeans: 180,
      manualSubsidyBeans: 120,
      totalBeans: 1932,
      expiredBeans: 96,
      monthlyTotalBeans: 1836,
      settlementAmount: 1836,
      accountType: 'balance',
      initiateTime: '2026-03-01 16:00:00',
      completeTime: '2026-03-01 16:05:00',
      status: 'success'
    }
  ],
  '2026-02': [
    {
      month: '2026-02',
      settlementNo: 'SET2026020001',
      name: '张三',
      department: '市场部',
      position: '客户经理',
      employeeId: '1001',
      newCustomerBeans: 270,
      evaluationBeans: 90,
      linenBeans: 45,
      consumablesBeans: 27,
      assetMaintenanceBeans: 18,
      accommodationBeans: 9,
      roomCleaningBeans: 36,
      toiletCleaningBeans: 27,
      trainingBeans: 45,
      therapistPerformanceBeans: 180,
      guaranteeBeans: 360,
      probationBeans: 90,
      shiftSubsidyBeans: 135,
      partnerBeans: 225,
      manualSubsidyBeans: 90,
      totalBeans: 1872,
      expiredBeans: 72,
      monthlyTotalBeans: 1800,
      settlementAmount: 1800,
      accountType: 'balance',
      initiateTime: '2026-02-01 10:00:00',
      completeTime: '2026-02-01 10:05:00',
      status: 'success'
    },
    {
      month: '2026-02',
      settlementNo: 'SET2026020002',
      name: '李四',
      department: '市场部',
      position: '客户经理',
      employeeId: '1002',
      newCustomerBeans: 225,
      evaluationBeans: 72,
      linenBeans: 36,
      consumablesBeans: 18,
      assetMaintenanceBeans: 13.5,
      accommodationBeans: 4.5,
      roomCleaningBeans: 27,
      toiletCleaningBeans: 18,
      trainingBeans: 36,
      therapistPerformanceBeans: 135,
      guaranteeBeans: 270,
      probationBeans: 72,
      shiftSubsidyBeans: 108,
      partnerBeans: 180,
      manualSubsidyBeans: 72,
      totalBeans: 1377,
      expiredBeans: 54,
      monthlyTotalBeans: 1323,
      settlementAmount: 1323,
      accountType: 'balance',
      initiateTime: '2026-02-01 11:00:00',
      completeTime: '2026-02-01 11:03:00',
      status: 'success'
    },
    {
      month: '2026-02',
      settlementNo: 'SET2026020003',
      name: '王五',
      department: '市场部',
      position: '客户经理',
      employeeId: '1003',
      newCustomerBeans: 315,
      evaluationBeans: 108,
      linenBeans: 54,
      consumablesBeans: 36,
      assetMaintenanceBeans: 22.5,
      accommodationBeans: 13.5,
      roomCleaningBeans: 45,
      toiletCleaningBeans: 36,
      trainingBeans: 54,
      therapistPerformanceBeans: 225,
      guaranteeBeans: 450,
      probationBeans: 108,
      shiftSubsidyBeans: 162,
      partnerBeans: 270,
      manualSubsidyBeans: 108,
      totalBeans: 2367,
      expiredBeans: 90,
      monthlyTotalBeans: 2277,
      settlementAmount: 2277,
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
      department: '市场部',
      position: '客户经理',
      employeeId: '1001',
      newCustomerBeans: 240,
      evaluationBeans: 80,
      linenBeans: 40,
      consumablesBeans: 24,
      assetMaintenanceBeans: 16,
      accommodationBeans: 8,
      roomCleaningBeans: 32,
      toiletCleaningBeans: 24,
      trainingBeans: 40,
      therapistPerformanceBeans: 160,
      guaranteeBeans: 320,
      probationBeans: 80,
      shiftSubsidyBeans: 120,
      partnerBeans: 200,
      manualSubsidyBeans: 80,
      totalBeans: 1664,
      expiredBeans: 64,
      monthlyTotalBeans: 1600,
      settlementAmount: 1600,
      accountType: 'balance',
      initiateTime: '2026-01-01 10:00:00',
      completeTime: '2026-01-01 10:05:00',
      status: 'success'
    },
    {
      month: '2026-01',
      settlementNo: 'SET2026010002',
      name: '李四',
      department: '市场部',
      position: '客户经理',
      employeeId: '1002',
      newCustomerBeans: 200,
      evaluationBeans: 64,
      linenBeans: 32,
      consumablesBeans: 16,
      assetMaintenanceBeans: 12,
      accommodationBeans: 4,
      roomCleaningBeans: 24,
      toiletCleaningBeans: 16,
      trainingBeans: 32,
      therapistPerformanceBeans: 120,
      guaranteeBeans: 240,
      probationBeans: 64,
      shiftSubsidyBeans: 96,
      partnerBeans: 160,
      manualSubsidyBeans: 64,
      totalBeans: 1224,
      expiredBeans: 48,
      monthlyTotalBeans: 1176,
      settlementAmount: 1176,
      accountType: 'balance',
      initiateTime: '2026-01-01 11:00:00',
      completeTime: '2026-01-01 11:03:00',
      status: 'success'
    },
    {
      month: '2026-01',
      settlementNo: 'SET2026010003',
      name: '王五',
      department: '市场部',
      position: '客户经理',
      employeeId: '1003',
      newCustomerBeans: 280,
      evaluationBeans: 96,
      linenBeans: 48,
      consumablesBeans: 32,
      assetMaintenanceBeans: 20,
      accommodationBeans: 12,
      roomCleaningBeans: 40,
      toiletCleaningBeans: 32,
      trainingBeans: 48,
      therapistPerformanceBeans: 200,
      guaranteeBeans: 400,
      probationBeans: 96,
      shiftSubsidyBeans: 144,
      partnerBeans: 240,
      manualSubsidyBeans: 96,
      totalBeans: 2104,
      expiredBeans: 80,
      monthlyTotalBeans: 2024,
      settlementAmount: 2024,
      accountType: 'balance',
      initiateTime: '2026-01-01 14:00:00',
      completeTime: '2026-01-01 14:02:00',
      status: 'success'
    }
  ]
}

// 当前月份的客户经理获豆明细数据
const accountManagerList = ref(accountManagerByMonth['2026-03'])

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
  if (accountManagerByMonth[searchForm.month]) {
    accountManagerList.value = accountManagerByMonth[searchForm.month]
  } else {
    accountManagerList.value = []
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
  accountManagerList.value = accountManagerByMonth['2026-03']
}

// 处理导出
const handleExport = () => {
  console.log('导出', {
    ...searchForm,
    exportFields: ['month', 'settlementNo', 'name', 'department', 'position', 'employeeId', 'newCustomerBeans', 'evaluationBeans', 'linenBeans', 'consumablesBeans', 'assetMaintenanceBeans', 'accommodationBeans', 'roomCleaningBeans', 'toiletCleaningBeans', 'trainingBeans', 'therapistPerformanceBeans', 'guaranteeBeans', 'probationBeans', 'shiftSubsidyBeans', 'partnerBeans', 'manualSubsidyBeans', 'totalBeans', 'expiredBeans', 'monthlyTotalBeans', 'settlementAmount', 'accountType', 'initiateTime', 'completeTime', 'status']
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
.bean-account-manager-detail {
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
