<template>
  <div class="store-hanging-application-page">
    <div class="page-header">
      <h1>挂店申请管理</h1>
      <p>管理推拿师的挂店申请和审批流程</p>
    </div>

    <!-- 搜索过滤区域 -->
    <div class="search-section">
          <el-form :model="searchForm" inline>
            <el-form-item label="员工">
              <el-input
                v-model="searchForm.employee"
                placeholder="输入员工名称或工号"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="门店">
              <el-input
                v-model="searchForm.store"
                placeholder="输入门店编号或名称"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="状态">
              <el-select
                v-model="searchForm.status"
                placeholder="选择状态"
                clearable
                style="width: 120px"
              >
                <el-option label="待审核" value="待审核" />
                <el-option label="已批准" value="已批准" />
                <el-option label="已拒绝" value="已拒绝" />
                <el-option label="已过期" value="已过期" />
              </el-select>
            </el-form-item>
            <el-form-item label="申请时间">
              <el-date-picker
                v-model="searchForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                clearable
                style="width: 240px"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="handleReset">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-form>
          <div style="margin-top: 10px; display: flex; gap: 10px;">
            <el-button type="primary" @click="handleBatchApprove" :disabled="selectedRows.length === 0">
              <el-icon><Check /></el-icon>
              批量同意
            </el-button>
            <el-button type="danger" @click="handleBatchReject" :disabled="selectedRows.length === 0">
              <el-icon><Close /></el-icon>
              批量拒绝
            </el-button>
          </div>
        </div>

    <!-- 表格区域 -->
    <div class="table-section">
      <el-table
          :data="filteredApplications"
          stripe
          style="width: 100%"
          :max-height="600"
          @selection-change="handleSelectionChange"
          ref="tableRef"
        >
          <el-table-column type="selection" width="55" fixed="left" />
        <el-table-column label="员工信息" width="180">
          <template #default="scope">
            <div>{{ scope.row.employeeName }}（{{ scope.row.employeeId }}）</div>
          </template>
        </el-table-column>
        <el-table-column prop="workDuration" label="在职月数" width="80" />
        <el-table-column prop="mainStore" label="主服务门店" width="160" />
        <el-table-column prop="projectPlate" label="项目板块" width="100">
          <template #default="scope">
            <el-tag type="primary" size="small">{{ scope.row.projectPlate }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="skillLevel" label="技能等级" width="80">
          <template #default="scope">
            <el-tag type="info" size="small">{{ scope.row.skillLevel }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="hangingStoreCount" label="已挂店数量" width="100">
            <template #default="scope">
              <el-tag type="primary" size="small" :title="scope.row.hangingStores ? scope.row.hangingStores.join('\n') : ''">
                {{ scope.row.hangingStoreCount }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="applyStore" label="申请挂店门店" width="200">
            <template #default="scope">
              <div class="apply-stores">
                <el-tag
                  v-for="(store, index) in Array.isArray(scope.row.applyStore) ? scope.row.applyStore : [scope.row.applyStore]"
                  :key="index"
                  size="small"
                  type="success"
                  style="margin-right: 8px; margin-bottom: 4px;"
                >
                  {{ store }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="lastWeekOutput" label="上周产值（目标/实际）" width="140">
            <template #default="scope">
              <div>{{ scope.row.lastWeekOutput.target }} / {{ scope.row.lastWeekOutput.actual }}</div>
            </template>
          </el-table-column>
        <el-table-column prop="thisMonthRetentionRate" label="上周回头率" width="100">
          <template #default="scope">
            <el-tag type="primary" size="small">{{ scope.row.thisMonthRetentionRate }}%</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="thisMonthChurnRate" label="上周流失率" width="100">
          <template #default="scope">
            <el-tag type="primary" size="small">{{ scope.row.thisMonthChurnRate }}%</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applyTime" label="申请时间" width="140">
          <template #default="scope">
            <div>{{ formatDate(scope.row.applyTime) }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120" fixed="left">
            <template #default="scope">
              <el-tag :type="scope.row.status === '待审核' ? 'primary' : scope.row.status === '已批准' ? 'success' : 'default'" size="small">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="expireTime" label="过期时间" width="140">
            <template #default="scope">
              <div v-if="scope.row.status === '已过期'">
                <el-tag type="warning" size="small">{{ formatDate(scope.row.expireTime) }}</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="approveTime" label="审批时间" width="140">
            <template #default="scope">
              <div v-if="scope.row.status === '已批准' || scope.row.status === '已拒绝'">
                <el-tag type="info" size="small">{{ formatDate(scope.row.approveTime) }}</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="operation" label="操作" width="160" fixed="right">
            <template #default="scope">
              <el-button type="text" size="small" @click="handleReject(scope.row)" style="color: #f56c6c" :disabled="scope.row.status !== '待审核'">
                拒绝
              </el-button>
              <el-button type="text" size="small" @click="handleApprove(scope.row)" style="color: #409eff" :disabled="scope.row.status !== '待审核'">
                同意
              </el-button>
            </template>
          </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
        import { ElMessage, ElMessageBox } from 'element-plus'
        import { Search, Refresh } from '@element-plus/icons-vue'

// 响应式数据
const searchForm = reactive({
  employee: '',
  store: ''
})

// Simulated data with updated project plates
const selectedRows = ref([])
        const tableRef = ref(null)
        
        const applications = ref([
          {
            id: '1',
            employeeId: '10001',
            employeeName: '张三',
            projectPlate: '推拿',
            skillLevel: 'LV6',
            workDuration: 24,
            mainStore: '天府凯德店',
            lastQuarterOutput: { target: 500000, actual: 480000 },
            lastQuarterRetentionRate: 85.6,
            lastQuarterChurnRate: 12.3,
            thisMonthOutput: { target: 150000, actual: 135000 },
            lastWeekOutput: { target: 40000, actual: 38000 },
            thisMonthRetentionRate: 88.2,
            thisMonthChurnRate: 10.1,
            hangingStoreCount: 2,
            hangingStores: ['环球中心店', '高新区店'],
            applyStore: ['金牛凯德店', '春熙路店'],
            applyTime: '2024-12-26 10:00:00',
            status: '待审核',
            expireTime: '2024-12-31 00:00:00'
          },
          {
            id: '2',
            employeeId: '10002',
            employeeName: '李四',
            projectPlate: '足疗',
            skillLevel: 'LV4',
            workDuration: 18,
            mainStore: '春熙路店',
            lastQuarterOutput: { target: 450000, actual: 420000 },
            lastQuarterRetentionRate: 82.1,
            lastQuarterChurnRate: 15.4,
            thisMonthOutput: { target: 120000, actual: 110000 },
            lastWeekOutput: { target: 35000, actual: 33000 },
            thisMonthRetentionRate: 84.7,
            thisMonthChurnRate: 12.6,
            hangingStoreCount: 1,
            hangingStores: ['天府凯德店'],
            applyStore: ['万达广场店', '世纪城店'],
            applyTime: '2024-12-25 14:30:00',
            status: '已批准',
            expireTime: '2024-12-31 00:00:00',
            approveTime: '2024-12-25 15:00:00'
          },
          {
            id: '3',
            employeeId: '10003',
            employeeName: '王五',
            projectPlate: '经络',
            skillLevel: 'LV2',
            workDuration: 12,
            mainStore: '世纪城店',
            lastQuarterOutput: { target: 300000, actual: 280000 },
            lastQuarterRetentionRate: 78.9,
            lastQuarterChurnRate: 18.2,
            thisMonthOutput: { target: 100000, actual: 95000 },
            lastWeekOutput: { target: 25000, actual: 23000 },
            thisMonthRetentionRate: 80.5,
            thisMonthChurnRate: 14.8,
            hangingStoreCount: 0,
            hangingStores: [],
            applyStore: ['环球中心店', '高新区店', '华阳店'],
            applyTime: '2024-12-24 09:15:00',
            status: '已拒绝',
            expireTime: '2024-12-31 00:00:00',
            approveTime: '2024-12-24 09:30:00'
          },
          {
            id: '4',
            employeeId: '10004',
            employeeName: '赵六',
            projectPlate: '运动康复',
            skillLevel: 'LV5',
            workDuration: 36,
            mainStore: '高新区店',
            lastQuarterOutput: { target: 600000, actual: 620000 },
            lastQuarterRetentionRate: 90.3,
            lastQuarterChurnRate: 8.7,
            thisMonthOutput: { target: 200000, actual: 190000 },
            lastWeekOutput: { target: 50000, actual: 52000 },
            thisMonthRetentionRate: 92.1,
            thisMonthChurnRate: 7.2,
            hangingStoreCount: 3,
            hangingStores: ['世纪城店', '环球中心店', '华阳店'],
            applyStore: ['华阳店', '天府凯德店', '春熙路店', '万达广场店'],
            applyTime: '2024-12-23 16:45:00',
            status: '已过期',
            expireTime: '2024-12-30 00:00:00'
          },
          {
            id: '5',
            employeeId: '10005',
            employeeName: '孙七',
            projectPlate: '推拿',
            skillLevel: 'LV3',
            workDuration: 20,
            mainStore: '天府凯德店',
            lastQuarterOutput: { target: 400000, actual: 390000 },
            lastQuarterRetentionRate: 86.7,
            lastQuarterChurnRate: 11.5,
            thisMonthOutput: { target: 130000, actual: 125000 },
            lastWeekOutput: { target: 32000, actual: 31000 },
            thisMonthRetentionRate: 87.9,
            thisMonthChurnRate: 10.8,
            hangingStoreCount: 1,
            hangingStores: ['春熙路店'],
            applyStore: ['春熙路店'],
            applyTime: '2024-12-22 11:20:00',
            status: '待审核',
            expireTime: '2024-12-31 00:00:00'
          }
        ])

// 过滤后的数据
const filteredApplications = computed(() => {
  return applications.value.filter(application => {
    if (searchForm.employee) {
      const employeeMatch = application.employeeName.includes(searchForm.employee) || application.employeeId.includes(searchForm.employee)
      if (!employeeMatch) {
        return false
      }
    }
    if (searchForm.store) {
      const storeMatch = application.mainStore.includes(searchForm.store)
      if (!storeMatch) {
        return false
      }
    }
    return true
  })
})

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}

// 搜索处理
const handleSearch = () => {
  ElMessage.success('搜索完成')
}

// 重置处理
const handleReset = () => {
  Object.assign(searchForm, {
    employee: '',
    store: ''
  })
}

// 处理同意
        const handleApprove = (row) => {
          const applyStores = Array.isArray(row.applyStore) ? row.applyStore : [row.applyStore]
          const storeList = applyStores.map(store => `
            <div style="margin-bottom: 8px;">
              <input type="checkbox" checked id="store_${store}" value="${store}">
              <label for="store_${store}" style="margin-left: 8px;">${store}</label>
            </div>
          `).join('')
          
          ElMessageBox.confirm(`
            <div style="text-align: left;">
              <p style="margin-bottom: 16px;">确认同意${row.employeeName}（${row.employeeId}）的挂店申请吗？</p>
              <p style="margin-bottom: 8px;">选择同意的门店：</p>
              ${storeList}
            </div>
          `, '同意申请', {
            confirmButtonText: '同意',
            cancelButtonText: '取消',
            type: 'warning',
            dangerouslyUseHTMLString: true
          }).then(() => {
            row.status = '已批准'
            row.approveTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
            ElMessage.success(`已同意${row.employeeName}（${row.employeeId}）的挂店申请`)
          }).catch(() => {
            ElMessage.info('已取消同意操作')
          })
        }

// 处理拒绝
        const handleReject = (row) => {
          const rejectReasons = ['资质不符', '经验不足', '考核未通过']
          
          // 创建拒绝理由选择对话框
          const dialog = ElMessageBox({
            title: '拒绝申请',
            message: `
              <div style="text-align: left;">
                <p style="margin-bottom: 16px; font-weight: 600;">确认拒绝${row.employeeName}（${row.employeeId}）的挂店申请吗？</p>
                <p style="margin-bottom: 16px; font-weight: 600;">请选择拒绝理由：</p>
                <div style="margin-bottom: 16px;">
                  ${rejectReasons.map(reason => `
                    <label style="display: block; margin-bottom: 8px; cursor: pointer;">
                      <input type="radio" name="rejectReason" value="${reason}" style="margin-right: 8px;">
                      ${reason}
                    </label>
                  `).join('')}
                </div>
              </div>
            `,
            confirmButtonText: '拒绝',
            cancelButtonText: '取消',
            type: 'warning',
            dangerouslyUseHTMLString: true
          })
          
          // 添加事件监听
          dialog.then(({ value }) => {
            const selectedReason = document.querySelector('input[name="rejectReason"]:checked')?.value
            
            if (selectedReason) {
              row.status = '已拒绝'
              row.approveTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
              row.rejectReason = selectedReason
              ElMessage.success(`已拒绝${row.employeeName}（${row.employeeId}）的挂店申请，理由：${selectedReason}`)
            } else {
              ElMessage.warning('请选择拒绝理由')
            }
          }).catch(() => {
            ElMessage.info('已取消拒绝操作')
          })
        }

// 处理批量同意
const handleBatchApprove = () => {
  let employeeNames = ''
  if (selectedRows.value.length <= 2) {
    employeeNames = selectedRows.value.map(row => `${row.employeeName}（${row.employeeId}）`).join('、')
  } else {
    employeeNames = `${selectedRows.value[0].employeeName}（${selectedRows.value[0].employeeId}）、${selectedRows.value[1].employeeName}（${selectedRows.value[1].employeeId}）等${selectedRows.value.length}位员工`
  }
  ElMessageBox.confirm(`确认同意${employeeNames}的挂店申请吗？`, '批量同意申请', {
    confirmButtonText: '同意',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedRows.value.forEach(row => {
      if (row.status === '待审核') {
        row.status = '已批准'
        row.approveTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
      }
    })
    ElMessage.success(`已批量同意${selectedRows.value.length}条申请`)
    tableRef.value.clearSelection()
  }).catch(() => {
    ElMessage.info('已取消批量同意操作')
  })
}

// 处理批量拒绝
const handleBatchReject = () => {
  let employeeNames = ''
  if (selectedRows.value.length <= 2) {
    employeeNames = selectedRows.value.map(row => `${row.employeeName}（${row.employeeId}）`).join('、')
  } else {
    employeeNames = `${selectedRows.value[0].employeeName}（${selectedRows.value[0].employeeId}）、${selectedRows.value[1].employeeName}（${selectedRows.value[1].employeeId}）等${selectedRows.value.length}位员工`
  }
  
  const rejectReasons = ['资质不符', '经验不足', '考核未通过']
  
  // 创建批量拒绝理由选择对话框
  const dialog = ElMessageBox({
    title: '批量拒绝申请',
    message: `
      <div style="text-align: left;">
        <p style="margin-bottom: 16px; font-weight: 600;">确认拒绝${employeeNames}的挂店申请吗？</p>
        <p style="margin-bottom: 16px; font-weight: 600;">请选择拒绝理由：</p>
        <div style="margin-bottom: 16px;">
          ${rejectReasons.map(reason => `
            <label style="display: block; margin-bottom: 8px; cursor: pointer;">
              <input type="radio" name="rejectReason" value="${reason}" style="margin-right: 8px;">
              ${reason}
            </label>
          `).join('')}
        </div>
      </div>
    `,
    confirmButtonText: '拒绝',
    cancelButtonText: '取消',
    type: 'warning',
    dangerouslyUseHTMLString: true
  })
  
  // 添加事件监听
  dialog.then(({ value }) => {
    const selectedReason = document.querySelector('input[name="rejectReason"]:checked')?.value
    
    selectedRows.value.forEach(row => {
      if (row.status === '待审核') {
        row.status = '已拒绝'
        row.approveTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
        if (selectedReason) {
          row.rejectReason = selectedReason
        }
      }
    })
    ElMessage.success(`已批量拒绝${selectedRows.value.length}条申请`)
    tableRef.value.clearSelection()
  }).catch(() => {
    ElMessage.info('已取消批量拒绝操作')
  })
}

// 处理选择变化
const handleSelectionChange = (val) => {
  selectedRows.value = val
}
</script>

<style scoped>
.store-hanging-application-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.search-section {
  margin-bottom: 20px;
  padding: 16px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
}

.table-section {
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
}
</style>