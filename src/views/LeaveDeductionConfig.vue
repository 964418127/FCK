<template>
  <div class="leave-deduction-config">
    <div class="page-header">
      <h1>客户经理请假扣款配置</h1>
      <p class="tip">💡 配置客户经理请假人员的阶梯式扣款规则，根据当月累计请假天数，从第5天开始按比例扣除日标准工资</p>
    </div>

    <div class="content-section">
      <!-- 顶部并排布局 -->
      <div class="top-row">
        <div class="section-card global-card">
          <div class="card-header">
            <div class="header-left">
              <span class="level-icon">🏠</span>
              <span class="level-name">通用配置</span>
              <el-tag type="info" size="small">兜底配置</el-tag>
            </div>
            <el-button type="primary" size="small" @click="openEditGlobalDialog">编辑</el-button>
          </div>
          <div class="card-body">
            <div v-if="globalTiers.length === 0" class="empty-tip">暂无配置，使用系统默认</div>
            <el-table v-else :data="globalTiers" border size="small" style="width: 100%">
              <el-table-column label="起始天数" align="center">
                <template #default="scope">
                  <span class="tier-day-display">第{{ scope.row.day }}天</span>
                </template>
              </el-table-column>
              <el-table-column label="扣款比例" align="center">
                <template #default="scope">
                  <span class="tier-percent-display">{{ scope.row.percent }}%</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <div class="section-card city-card">
          <div class="card-header">
            <div class="header-left">
              <span class="level-icon">🏢</span>
              <span class="level-name">城市配置</span>
            </div>
            <el-button type="primary" size="small" @click="openAddCityDialog">+ 新增城市</el-button>
          </div>
          <div class="card-body">
            <div v-if="cityConfigs.length === 0" class="empty-tip">暂无城市配置</div>
            <div v-else class="city-list">
              <div v-for="city in cityConfigs" :key="city.id" class="city-item">
                <div class="city-info" @click="selectCity(city)">
                  <div class="city-main">
                    <span class="city-name">{{ city.name }}</span>
                    <el-tag v-if="city.tiers.length > 0" size="small" type="success">{{ city.tiers.length }}个阶梯</el-tag>
                  </div>
                  <div class="city-tiers-preview">
                    <span v-for="(tier, index) in city.tiers.slice(0, 3)" :key="index" class="tier-tag">
                      第{{ tier.day }}天{{ tier.percent }}%
                    </span>
                    <span v-if="city.tiers.length > 3" class="tier-tag">...</span>
                  </div>
                </div>
                <div class="city-actions">
                  <el-button type="primary" size="small" link @click.stop="openEditCityDialog(city)">编辑</el-button>
                  <el-button type="danger" size="small" link @click.stop="removeCity(city)">删除</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑通用配置弹窗 -->
    <el-dialog v-model="editGlobalDialogVisible" title="编辑通用配置" width="600px">
      <el-form label-width="80px">
        <el-divider content-position="left">阶梯配置</el-divider>
        <div v-for="(tier, index) in editGlobalForm.tiers" :key="index" class="tier-form-item">
          <span class="tier-label">起始天数</span>
          <span>第</span>
          <el-input-number v-model="tier.day" :min="5" :max="365" controls-position="right" style="width: 100px;" />
          <span>天起</span>
          <span class="tier-label" style="margin-left: 24px;">扣款比例</span>
          <el-input-number v-model="tier.percent" :min="0" :max="100" :step="5" controls-position="right" style="width: 100px;" />
          <span>%</span>
          <el-button v-if="editGlobalForm.tiers.length > 1" type="danger" link @click="removeGlobalTier(index)" style="margin-left: 16px;">删除</el-button>
        </div>
        <el-button type="primary" link @click="addGlobalTier">+ 添加阶梯</el-button>
      </el-form>
      <template #footer>
        <el-button @click="editGlobalDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveGlobalConfig">保存</el-button>
      </template>
    </el-dialog>

    <!-- 新增城市弹窗 -->
    <el-dialog v-model="addCityDialogVisible" title="新增城市配置" width="600px">
      <el-form label-width="80px">
        <el-form-item label="选择城市">
          <el-select v-model="addCityForm.city" placeholder="请选择城市" style="width: 100%;" filterable>
            <el-option v-for="city in unconfiguredCities" :key="city" :label="city" :value="city" />
          </el-select>
        </el-form-item>
        <el-divider v-if="addCityForm.city" content-position="left">阶梯配置</el-divider>
        <div v-if="addCityForm.city" v-for="(tier, index) in addCityForm.tiers" :key="index" class="tier-form-item">
          <span class="tier-label">起始天数</span>
          <span>第</span>
          <el-input-number v-model="tier.day" :min="5" :max="365" controls-position="right" style="width: 100px;" />
          <span>天起</span>
          <span class="tier-label" style="margin-left: 24px;">扣款比例</span>
          <el-input-number v-model="tier.percent" :min="0" :max="100" :step="5" controls-position="right" style="width: 100px;" />
          <span>%</span>
          <el-button type="danger" link @click="removeAddCityTier(index)" style="margin-left: 16px;">删除</el-button>
        </div>
        <el-button v-if="addCityForm.city" type="primary" link @click="addAddCityTier">+ 添加阶梯</el-button>
      </el-form>
      <template #footer>
        <el-button @click="addCityDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addCity">保存</el-button>
      </template>
    </el-dialog>

    <!-- 编辑城市弹窗 -->
    <el-dialog v-model="editCityDialogVisible" :title="`编辑 ${editCityForm.name} 配置`" width="600px">
      <el-form label-width="80px">
        <el-form-item label="城市">
          <span class="form-value">🏢 {{ editCityForm.name }}</span>
        </el-form-item>
        <el-divider content-position="left">阶梯配置</el-divider>
        <div v-for="(tier, index) in editCityForm.tiers" :key="index" class="tier-form-item">
          <span class="tier-label">起始天数</span>
          <span>第</span>
          <el-input-number v-model="tier.day" :min="5" :max="365" controls-position="right" style="width: 100px;" />
          <span>天起</span>
          <span class="tier-label" style="margin-left: 24px;">扣款比例</span>
          <el-input-number v-model="tier.percent" :min="0" :max="100" :step="5" controls-position="right" style="width: 100px;" />
          <span>%</span>
          <el-button type="danger" link @click="removeCityTier(index)" style="margin-left: 16px;">删除</el-button>
        </div>
        <el-button type="primary" link @click="addCityTier">+ 添加阶梯</el-button>
      </el-form>
      <template #footer>
        <el-button @click="editCityDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCityConfig">保存</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 所有城市列表
const allCities = ['深圳市', '成都市', '北京市', '上海市']

// 通用配置 - 阶梯列表
const globalTiers = ref([
  { day: 5, percent: 20 },
  { day: 6, percent: 40 },
  { day: 7, percent: 60 },
  { day: 8, percent: 80 },
  { day: 9, percent: 100 }
])

// 城市配置列表
const cityConfigs = ref([
  {
    id: 1,
    name: '深圳市',
    tiers: [
      { day: 5, percent: 15 },
      { day: 10, percent: 25 }
    ]
  },
  {
    id: 2,
    name: '成都市',
    tiers: [
      { day: 5, percent: 12 }
    ]
  }
])

// 未配置的城市
const unconfiguredCities = computed(() => {
  return allCities.filter(city => !cityConfigs.value.some(c => c.name === city))
})

// 选中状态
const selectedCity = ref(null)

// 选择城市
const selectCity = (city) => {
  selectedCity.value = city
}

// 编辑通用配置
const editGlobalDialogVisible = ref(false)
const editGlobalForm = reactive({
  tiers: []
})

const openEditGlobalDialog = () => {
  editGlobalForm.tiers = JSON.parse(JSON.stringify(globalTiers.value))
  editGlobalDialogVisible.value = true
}

const addGlobalTier = () => {
  editGlobalForm.tiers.push({ day: 5, percent: 10 })
}

const removeGlobalTier = (index) => {
  editGlobalForm.tiers.splice(index, 1)
}

const saveGlobalConfig = () => {
  // 检查是否有重复天数
  const days = editGlobalForm.tiers.map(t => t.day)
  const hasDuplicate = days.length !== new Set(days).size
  if (hasDuplicate) {
    ElMessage.warning('起始天数不能重复')
    return
  }
  // 按day排序
  editGlobalForm.tiers.sort((a, b) => a.day - b.day)
  globalTiers.value = JSON.parse(JSON.stringify(editGlobalForm.tiers))
  editGlobalDialogVisible.value = false
  ElMessage.success('通用配置已保存')
}

// 新增城市
const addCityDialogVisible = ref(false)
const addCityForm = reactive({
  city: '',
  tiers: []
})

const openAddCityDialog = () => {
  addCityForm.city = ''
  addCityForm.tiers = []
  addCityDialogVisible.value = true
}

const addAddCityTier = () => {
  addCityForm.tiers.push({ day: 5, percent: 10 })
}

const removeAddCityTier = (index) => {
  addCityForm.tiers.splice(index, 1)
}

const addCity = () => {
  if (!addCityForm.city) {
    ElMessage.warning('请选择城市')
    return
  }
  // 检查是否有重复天数
  const days = addCityForm.tiers.map(t => t.day)
  const hasDuplicate = days.length !== new Set(days).size
  if (hasDuplicate) {
    ElMessage.warning('起始天数不能重复')
    return
  }
  const newId = Date.now()
  // 按day排序
  const sortedTiers = [...addCityForm.tiers].sort((a, b) => a.day - b.day)
  cityConfigs.value.push({
    id: newId,
    name: addCityForm.city,
    tiers: sortedTiers
  })
  addCityDialogVisible.value = false
  ElMessage.success('城市配置已添加')
}

const removeCity = (row) => {
  ElMessageBox.confirm(`确定要删除城市「${row.name}」的配置吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cityConfigs.value = cityConfigs.value.filter(c => c.id !== row.id)
    if (selectedCity.value?.id === row.id) {
      selectedCity.value = null
    }
    ElMessage.success('已删除')
  }).catch(() => {})
}

// 编辑城市配置
const editCityDialogVisible = ref(false)
const editCityForm = reactive({
  id: '',
  name: '',
  tiers: []
})

const openEditCityDialog = (row) => {
  editCityForm.id = row.id
  editCityForm.name = row.name
  editCityForm.tiers = JSON.parse(JSON.stringify(row.tiers))
  editCityDialogVisible.value = true
}

const addCityTier = () => {
  editCityForm.tiers.push({ day: 5, percent: 10 })
}

const removeCityTier = (index) => {
  editCityForm.tiers.splice(index, 1)
}

const saveCityConfig = () => {
  // 检查是否有重复天数
  const days = editCityForm.tiers.map(t => t.day)
  const hasDuplicate = days.length !== new Set(days).size
  if (hasDuplicate) {
    ElMessage.warning('起始天数不能重复')
    return
  }
  // 按day排序
  editCityForm.tiers.sort((a, b) => a.day - b.day)
  const city = cityConfigs.value.find(c => c.id === editCityForm.id)
  if (city) {
    city.tiers = JSON.parse(JSON.stringify(editCityForm.tiers))
  }
  // 更新选中城市
  if (selectedCity.value?.id === editCityForm.id) {
    selectedCity.value = city
  }
  editCityDialogVisible.value = false
  ElMessage.success('城市配置已保存')
}
</script>

<style scoped>
.leave-deduction-config {
  padding: 20px;
  background: #f5f5f5;
}

.page-header {
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-header h1 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #333;
}

.tip {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.top-row {
  display: flex;
  gap: 16px;
  align-items: stretch;
}

.global-card {
  flex: 0 0 320px;
}

.city-card {
  flex: 1;
  min-width: 0;
}

.section-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #eee;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.level-icon {
  font-size: 18px;
}

.level-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.card-body {
  padding: 16px;
}

.empty-tip {
  color: #999;
  font-size: 14px;
  text-align: center;
  padding: 20px 0;
}

.tier-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tier-day {
  font-size: 14px;
  color: #666;
}

.tier-percent {
  font-size: 16px;
  font-weight: 600;
  color: #a40035;
}

.tier-day-display {
  font-weight: 500;
  color: #333;
}

.tier-percent-display {
  font-weight: 600;
  color: #a40035;
}

.city-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.city-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 6px;
  transition: all 0.2s;
}

.city-item:hover {
  border-color: #a40035;
  background: #fff7f7;
}

.city-info {
  flex: 1;
  cursor: pointer;
}

.city-main {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.city-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.city-tiers-preview {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tier-tag {
  font-size: 12px;
  color: #666;
  padding: 2px 8px;
  background: #f5f5f5;
  border-radius: 4px;
}

.city-actions {
  display: flex;
  gap: 8px;
}

.city-detail-card {
  margin-top: 0;
}

.tier-day-text {
  font-weight: 500;
  color: #333;
}

.tier-percent-text {
  font-weight: 600;
  color: #a40035;
}

.empty-table-tip {
  text-align: center;
  padding: 30px 0;
  color: #999;
  font-size: 14px;
}

.tier-form-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  padding-left: 20px;
}

.tier-label {
  font-size: 14px;
  color: #666;
  margin-right: 8px;
}

.form-value {
  font-weight: 500;
  color: #333;
}
</style>
