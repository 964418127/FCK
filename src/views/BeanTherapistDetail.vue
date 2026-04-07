<template>
  <div class="bean-therapist-detail">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>推拿师获豆明细</span>
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
      
      <el-table :data="therapistList" style="width: 100%">
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
        <el-table-column prop="returnCustomerBeans" label="回头客获豆" width="120" />
        <el-table-column prop="internalReferralBeans" label="内部介绍获豆" width="150" />
        <el-table-column prop="trainingBeans" label="培训获豆" width="100" />
        <el-table-column prop="shiftBeans" label="顶班获豆" width="100" />
        <el-table-column prop="accommodationBeans" label="住宿获豆" width="100" />
        <el-table-column prop="marketingBeans" label="营销获豆" width="100" />
        <el-table-column prop="partnerBeans" label="三级合伙人获豆" width="150" />
        <el-table-column prop="guaranteeBeans" label="保底获豆" width="100" />
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
import { Download, Search, Refresh, User } from '@element-plus/icons-vue'

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

// 推拿师获豆明细数据 - 按月份组织
const therapistByMonth = {
  '2026-03': [
    {
      month: '2026-03',
      settlementNo: 'SET2026030001',
      name: '张三',
      department: '',
      position: '推拿师',
      employeeId: '1001',
      mainServiceStore: '北京海淀门店',
      mainServiceStoreCode: '112103',
      laborRelationStore: '北京总部',
      laborRelationStoreCode: '112101',
      contractEntity: '北京常乐健康科技有限公司',
      returnCustomerBeans: 200,
      internalReferralBeans: 100,
      trainingBeans: 50,
      shiftBeans: 30,
      accommodationBeans: 20,
      marketingBeans: 100,
      partnerBeans: 150,
      guaranteeBeans: 350,
      totalBeans: 1000,
      expiredBeans: 50,
      monthlyTotalBeans: 950,
      settlementAmount: 950,
      accountType: 'balance',
      initiateTime: '2026-03-01 10:00:00',
      completeTime: '2026-03-01 10:05:00',
      status: 'success'
    },
    {
      month: '2026-03',
      settlementNo: 'SET2026030002',
      name: '李四',
      department: '',
      position: '推拿师',
      employeeId: '1002',
      mainServiceStore: '上海静安门店',
      mainServiceStoreCode: '312102',
      laborRelationStore: '上海分公司',
      laborRelationStoreCode: '312101',
      contractEntity: '上海常乐健康科技有限公司',
      returnCustomerBeans: 150,
      internalReferralBeans: 80,
      trainingBeans: 40,
      shiftBeans: 20,
      accommodationBeans: 10,
      marketingBeans: 80,
      partnerBeans: 120,
      guaranteeBeans: 200,
      totalBeans: 700,
      expiredBeans: 40,
      monthlyTotalBeans: 660,
      settlementAmount: 660,
      accountType: 'balance',
      initiateTime: '2026-03-01 11:00:00',
      completeTime: '2026-03-01 11:03:00',
      status: 'success'
    },
    {
      month: '2026-03',
      settlementNo: 'SET2026030003',
      name: '王五',
      department: '',
      position: '推拿师',
      employeeId: '1003',
      mainServiceStore: '广州天河门店',
      mainServiceStoreCode: '442102',
      laborRelationStore: '广州分公司',
      laborRelationStoreCode: '442101',
      contractEntity: '广州常乐健康科技有限公司',
      returnCustomerBeans: 300,
      internalReferralBeans: 150,
      trainingBeans: 60,
      shiftBeans: 40,
      accommodationBeans: 30,
      marketingBeans: 150,
      partnerBeans: 200,
      guaranteeBeans: 500,
      totalBeans: 1430,
      expiredBeans: 80,
      monthlyTotalBeans: 1350,
      settlementAmount: 1350,
      accountType: 'balance',
      initiateTime: '2026-03-01 14:00:00',
      completeTime: '2026-03-01 14:02:00',
      status: 'success'
    },
    {
      month: '2026-03',
      settlementNo: 'SET2026030004',
      name: '赵六',
      department: '',
      position: '推拿师',
      employeeId: '1004',
      mainServiceStore: '北京朝阳门店',
      mainServiceStoreCode: '112102',
      laborRelationStore: '北京总部',
      laborRelationStoreCode: '112101',
      contractEntity: '北京常乐健康科技有限公司',
      returnCustomerBeans: 300,
      internalReferralBeans: 150,
      trainingBeans: 75,
      shiftBeans: 45,
      accommodationBeans: 30,
      marketingBeans: 150,
      partnerBeans: 225,
      guaranteeBeans: 525,
      totalBeans: 1500,
      expiredBeans: 75,
      monthlyTotalBeans: 1425,
      settlementAmount: 1425,
      accountType: 'balance',
      initiateTime: '2026-03-01 15:00:00',
      completeTime: '2026-03-01 15:05:00',
      status: 'success'
    }
  ],
  '2026-02': [
    {
      month: '2026-02',
      settlementNo: 'SET2026020001',
      name: '张三',
      department: '',
      position: '推拿师',
      employeeId: '1001',
      mainServiceStore: '北京海淀门店',
      mainServiceStoreCode: '112103',
      laborRelationStore: '北京总部',
      laborRelationStoreCode: '112101',
      contractEntity: '北京常乐健康科技有限公司',
      returnCustomerBeans: 180,
      internalReferralBeans: 90,
      trainingBeans: 45,
      shiftBeans: 25,
      accommodationBeans: 15,
      marketingBeans: 90,
      partnerBeans: 135,
      guaranteeBeans: 315,
      totalBeans: 900,
      expiredBeans: 45,
      monthlyTotalBeans: 855,
      settlementAmount: 855,
      accountType: 'balance',
      initiateTime: '2026-02-01 10:00:00',
      completeTime: '2026-02-01 10:05:00',
      status: 'success'
    },
    {
      month: '2026-02',
      settlementNo: 'SET2026020002',
      name: '李四',
      department: '',
      position: '推拿师',
      employeeId: '1002',
      mainServiceStore: '上海静安门店',
      mainServiceStoreCode: '312102',
      laborRelationStore: '上海分公司',
      laborRelationStoreCode: '312101',
      contractEntity: '上海常乐健康科技有限公司',
      returnCustomerBeans: 120,
      internalReferralBeans: 60,
      trainingBeans: 30,
      shiftBeans: 15,
      accommodationBeans: 5,
      marketingBeans: 60,
      partnerBeans: 90,
      guaranteeBeans: 150,
      totalBeans: 530,
      expiredBeans: 30,
      monthlyTotalBeans: 500,
      settlementAmount: 500,
      accountType: 'balance',
      initiateTime: '2026-02-01 11:00:00',
      completeTime: '2026-02-01 11:03:00',
      status: 'success'
    },
    {
      month: '2026-02',
      settlementNo: 'SET2026020003',
      name: '王五',
      department: '',
      position: '推拿师',
      employeeId: '1003',
      mainServiceStore: '广州天河门店',
      mainServiceStoreCode: '442102',
      laborRelationStore: '广州分公司',
      laborRelationStoreCode: '442101',
      contractEntity: '广州常乐健康科技有限公司',
      returnCustomerBeans: 240,
      internalReferralBeans: 120,
      trainingBeans: 45,
      shiftBeans: 30,
      accommodationBeans: 20,
      marketingBeans: 120,
      partnerBeans: 160,
      guaranteeBeans: 400,
      totalBeans: 1135,
      expiredBeans: 60,
      monthlyTotalBeans: 1075,
      settlementAmount: 1075,
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
      department: '',
      position: '推拿师',
      employeeId: '1001',
      mainServiceStore: '北京海淀门店',
      mainServiceStoreCode: '112103',
      laborRelationStore: '北京总部',
      laborRelationStoreCode: '112101',
      contractEntity: '北京常乐健康科技有限公司',
      returnCustomerBeans: 150,
      internalReferralBeans: 75,
      trainingBeans: 35,
      shiftBeans: 20,
      accommodationBeans: 10,
      marketingBeans: 75,
      partnerBeans: 110,
      guaranteeBeans: 250,
      totalBeans: 725,
      expiredBeans: 35,
      monthlyTotalBeans: 690,
      settlementAmount: 690,
      accountType: 'balance',
      initiateTime: '2026-01-01 10:00:00',
      completeTime: '2026-01-01 10:05:00',
      status: 'success'
    },
    {
      month: '2026-01',
      settlementNo: 'SET2026010002',
      name: '李四',
      department: '',
      position: '推拿师',
      employeeId: '1002',
      mainServiceStore: '上海静安门店',
      mainServiceStoreCode: '312102',
      laborRelationStore: '上海分公司',
      laborRelationStoreCode: '312101',
      contractEntity: '上海常乐健康科技有限公司',
      returnCustomerBeans: 100,
      internalReferralBeans: 50,
      trainingBeans: 25,
      shiftBeans: 10,
      accommodationBeans: 5,
      marketingBeans: 50,
      partnerBeans: 75,
      guaranteeBeans: 120,
      totalBeans: 435,
      expiredBeans: 25,
      monthlyTotalBeans: 410,
      settlementAmount: 410,
      accountType: 'balance',
      initiateTime: '2026-01-01 11:00:00',
      completeTime: '2026-01-01 11:03:00',
      status: 'success'
    },
    {
      month: '2026-01',
      settlementNo: 'SET2026010003',
      name: '王五',
      department: '',
      position: '推拿师',
      employeeId: '1003',
      mainServiceStore: '广州天河门店',
      mainServiceStoreCode: '442102',
      laborRelationStore: '广州分公司',
      laborRelationStoreCode: '442101',
      contractEntity: '广州常乐健康科技有限公司',
      returnCustomerBeans: 200,
      internalReferralBeans: 100,
      trainingBeans: 35,
      shiftBeans: 25,
      accommodationBeans: 15,
      marketingBeans: 100,
      partnerBeans: 130,
      guaranteeBeans: 320,
      totalBeans: 925,
      expiredBeans: 50,
      monthlyTotalBeans: 875,
      settlementAmount: 875,
      accountType: 'balance',
      initiateTime: '2026-01-01 14:00:00',
      completeTime: '2026-01-01 14:02:00',
      status: 'success'
    }
  ]
}

// 当前月份的推拿师获豆明细数据
const therapistList = ref(therapistByMonth['2026-03'])

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
  if (therapistByMonth[searchForm.month]) {
    therapistList.value = therapistByMonth[searchForm.month]
  } else {
    therapistList.value = []
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
  therapistList.value = therapistByMonth['2026-03']
}

// 处理导出
const handleExport = () => {
  console.log('导出', {
    ...searchForm,
    exportFields: ['month', 'settlementNo', 'name', 'department', 'position', 'employeeId', 'returnCustomerBeans', 'internalReferralBeans', 'trainingBeans', 'shiftBeans', 'accommodationBeans', 'marketingBeans', 'partnerBeans', 'guaranteeBeans', 'totalBeans', 'expiredBeans', 'monthlyTotalBeans', 'settlementAmount', 'accountType', 'initiateTime', 'completeTime', 'status']
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
.bean-therapist-detail {
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
