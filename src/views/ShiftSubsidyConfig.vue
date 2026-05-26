<template>
  <div class="shift-subsidy-config">
    <div class="page-header">
      <h1>顶班额外补贴</h1>
      <p>配置客户经理顶班时每个班次的补贴单价</p>
    </div>

    <div class="content-section">
      <!-- 左侧：城市配置 -->
      <div class="left-section">
        <div class="config-group">
          <div class="config-header">
            <h3>城市配置</h3>
            <el-button type="primary" size="small" @click="openAddCityDialog">+ 新增城市</el-button>
          </div>
          <div class="config-content">
            <el-table :data="configTableData" border style="width: 100%" @row-click="handleCityRowClick" :class="{ 'clickable-row': true }">
              <el-table-column prop="type" label="类型" min-width="100"></el-table-column>
              <el-table-column prop="unitPrice" label="单价" min-width="120">
                <template #default="scope">
                  <span class="price-text">{{ scope.row.unitPrice }}元/次</span>
                </template>
              </el-table-column>
              <el-table-column prop="storeCount" label="已配门店" width="80" align="center">
                <template #default="scope">
                  <span v-if="scope.row.id !== 0" class="store-count" :class="{ 'has-stores': scope.row.storeCount > 0 }">{{ scope.row.storeCount }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="110" align="center">
                <template #default="scope">
                  <div class="action-buttons">
                    <el-button type="primary" size="small" link @click.stop="editConfig(scope.row)">编辑</el-button>
                    <el-button v-if="scope.row.id !== 0" type="danger" size="small" link @click.stop="deleteCity(scope.row.id)">删除</el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <!-- 通用配置快捷编辑 -->
        <div class="global-config-card" @click="editConfig({ id: 0, type: '通用配置', unitPrice: globalConfig.unitPrice })">
          <div class="global-config-icon">
            <el-icon><Setting /></el-icon>
          </div>
          <div class="global-config-info">
            <div class="global-config-title">通用配置</div>
            <div class="global-config-desc">适用于所有未单独配置的城市和门店 · <span class="price-text">{{ globalConfig.unitPrice }}元/次</span></div>
          </div>
          <div class="global-config-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </div>

      <!-- 右侧：门店配置 -->
      <div class="right-section">
        <div class="config-group">
          <div class="config-header">
            <div class="header-left">
              <h3>门店配置</h3>
              <span v-if="selectedCityName" class="selected-city-tag">
                {{ selectedCityName }}
                <el-icon class="clear-icon" @click.stop="clearCityFilter"><Close /></el-icon>
              </span>
            </div>
            <el-button type="primary" size="small" @click="openAddStoreDialog">+ 新增门店</el-button>
          </div>
          <div class="config-content">
            <el-table :data="displayStoreTableData" border style="width: 100%">
              <el-table-column prop="storeName" label="门店名称" width="150"></el-table-column>
              <el-table-column prop="cityName" label="所属城市" width="120"></el-table-column>
              <el-table-column prop="unitPrice" label="班次单价">
                <template #default="scope">
                  <span class="price-text">{{ scope.row.unitPrice }}元/次</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="90" align="center">
                <template #default="scope">
                  <div class="action-buttons">
                    <el-button type="primary" size="small" link @click="editStore(scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" link @click="deleteStore(scope.row.id)">删除</el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
            <div v-if="displayStoreTableData.length === 0" class="empty-tip">
              <el-icon><Folder /></el-icon>
              <span v-if="selectedCityName">该城市暂无门店配置</span>
              <span v-else>点击左侧城市查看对应的门店配置</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑通用/城市配置弹窗 -->
    <el-dialog v-model="editDialogVisible" :title="editForm.id === 0 ? '编辑通用配置' : `编辑${editForm.cityName}配置`" width="400px">
      <el-form label-width="100px">
        <el-form-item label="配置类型">
          <span>{{ editForm.id === 0 ? '通用' : '城市' }}</span>
        </el-form-item>
        <el-form-item v-if="editForm.id !== 0" label="城市名称">
          <span class="city-name-display">{{ editForm.cityName }}</span>
        </el-form-item>
        <el-form-item label="班次单价">
          <el-input-number v-model="editForm.unitPrice" :min="0" :step="10" controls-position="right" style="width: 150px;" />
          <span class="unit-text">元/次</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveConfig">保存</el-button>
      </template>
    </el-dialog>

    <!-- 新增城市配置弹窗 -->
    <el-dialog v-model="addCityDialogVisible" title="新增城市配置" width="400px" @closed="handleAddCityDialogClosed">
      <el-form label-width="100px">
        <el-form-item label="选择城市">
          <el-select v-model="addCityForm.cityName" placeholder="请选择城市" filterable style="width: 100%;" @change="handleCitySelect">
            <el-option v-for="city in unconfiguredCities" :key="city.value" :label="city.label" :value="city.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="班次单价">
          <el-input-number v-model="addCityForm.unitPrice" :min="0" :step="10" controls-position="right" style="width: 150px;" />
          <span class="unit-text">元/次</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addCityDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addCity">确定</el-button>
      </template>
    </el-dialog>

    <!-- 新增门店配置弹窗 -->
    <el-dialog v-model="addStoreDialogVisible" title="新增门店配置" width="400px" @closed="handleAddStoreDialogClosed">
      <el-form label-width="100px">
        <el-form-item label="选择门店">
          <el-select v-model="addStoreForm.storeName" placeholder="请选择门店" filterable style="width: 100%;" @change="handleStoreSelect">
            <el-option v-for="store in availableStoresForAdd" :key="store.value" :label="store.label" :value="store.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属城市">
          <span class="city-name-display">{{ addStoreForm.cityName || '—' }}</span>
        </el-form-item>
        <el-form-item label="班次单价">
          <el-input-number v-model="addStoreForm.unitPrice" :min="0" :step="10" controls-position="right" style="width: 150px;" />
          <span class="unit-text">元/次</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addStoreDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addStore">确定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑门店配置弹窗 -->
    <el-dialog v-model="editStoreDialogVisible" :title="`编辑${editStoreForm.storeName}配置`" width="400px">
      <el-form label-width="100px">
        <el-form-item label="门店名称">
          <span class="city-name-display">{{ editStoreForm.storeName }}</span>
        </el-form-item>
        <el-form-item label="所属城市">
          <span class="city-name-display">{{ editStoreForm.cityName }}</span>
        </el-form-item>
        <el-form-item label="班次单价">
          <el-input-number v-model="editStoreForm.unitPrice" :min="0" :step="10" controls-position="right" style="width: 150px;" />
          <span class="unit-text">元/次</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editStoreDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveStore">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { Setting, ArrowRight, Close, Folder } from '@element-plus/icons-vue'

// 通用配置
const globalConfig = reactive({ unitPrice: 60 })

// 城市配置列表
const cityConfigs = ref([
  { id: 1, cityName: '北京市', unitPrice: 80 },
  { id: 2, cityName: '上海市', unitPrice: 80 },
  { id: 3, cityName: '川渝', unitPrice: 50 },
  { id: 4, cityName: '德阳市', unitPrice: 30 },
  { id: 5, cityName: '绵阳市', unitPrice: 30 }
])

// 门店配置列表
const storeConfigs = ref([
  { id: 1, storeName: '天府凯德店', cityName: '成都市', unitPrice: 55 },
  { id: 2, storeName: '春熙路店', cityName: '成都市', unitPrice: 55 },
  { id: 3, storeName: '北京国贸店', cityName: '北京市', unitPrice: 80 }
])

// 所有城市选项
const allCities = [
  { label: '北京市', value: '北京市' },
  { label: '上海市', value: '上海市' },
  { label: '成都市', value: '成都市' },
  { label: '德阳市', value: '德阳市' },
  { label: '绵阳市', value: '绵阳市' },
  { label: '重庆市', value: '重庆市' },
  { label: '深圳市', value: '深圳市' },
  { label: '川渝', value: '川渝' }
]

// 所有门店选项（带城市映射）
const allStores = [
  { label: '天府凯德店', value: '天府凯德店', cityName: '成都市' },
  { label: '春熙路店', value: '春熙路店', cityName: '成都市' },
  { label: '交大店', value: '交大店', cityName: '成都市' },
  { label: '环球中心店', value: '环球中心店', cityName: '成都市' },
  { label: '万象城店', value: '万象城店', cityName: '成都市' },
  { label: '北京国贸店', value: '北京国贸店', cityName: '北京市' },
  { label: '北京三里屯店', value: '北京三里屯店', cityName: '北京市' },
  { label: '上海陆家嘴店', value: '上海陆家嘴店', cityName: '上海市' },
  { label: '上海南京路店', value: '上海南京路店', cityName: '上海市' }
]

// 已配置的城市名列表
const configuredCityNames = computed(() => cityConfigs.value.map(c => c.cityName))

// 未配置的城市下拉选项
const unconfiguredCities = computed(() =>
  allCities.filter(c => !configuredCityNames.value.includes(c.value))
)

// 已配置的门店名列表
const configuredStoreNames = computed(() => storeConfigs.value.map(s => s.storeName))

// 当前选中的城市
const selectedCityName = ref('')

// 根据门店配置计算每个城市的门店数量
const cityStoreCountMap = computed(() => {
  const map = {}
  storeConfigs.value.forEach(store => {
    map[store.cityName] = (map[store.cityName] || 0) + 1
  })
  return map
})

// 城市配置表格数据
const configTableData = computed(() => {
  const data = [{ id: 0, type: '通用配置', unitPrice: globalConfig.unitPrice, storeCount: 0 }]
  cityConfigs.value.forEach(city => {
    data.push({
      id: city.id,
      type: city.cityName,
      unitPrice: city.unitPrice,
      storeCount: cityStoreCountMap.value[city.cityName] || 0
    })
  })
  return data
})

// 可用于新增的门店列表（根据是否选了城市过滤）
const availableStoresForAdd = computed(() => {
  let stores = allStores.filter(s => !configuredStoreNames.value.includes(s.value))
  if (selectedCityName.value) {
    stores = stores.filter(s => s.cityName === selectedCityName.value)
  }
  return stores
})

// 右侧显示的门店列表
const displayStoreTableData = computed(() => {
  if (!selectedCityName.value) return storeConfigs.value
  return storeConfigs.value.filter(s => s.cityName === selectedCityName.value)
})

// 点击城市行
const handleCityRowClick = (row) => {
  if (row.id === 0) {
    selectedCityName.value = ''
    return
  }
  selectedCityName.value = row.type
}

// 清除城市筛选
const clearCityFilter = () => {
  selectedCityName.value = ''
}

// 弹窗状态
const editDialogVisible = ref(false)
const addCityDialogVisible = ref(false)
const addStoreDialogVisible = ref(false)
const editStoreDialogVisible = ref(false)

// 编辑通用/城市配置表单
const editForm = reactive({ id: 0, cityName: '', unitPrice: 60 })

// 新增城市表单
const addCityForm = reactive({ cityName: '', unitPrice: 60 })

// 新增门店表单
const addStoreForm = reactive({ storeName: '', cityName: '', unitPrice: 60 })

// 编辑门店表单
const editStoreForm = reactive({ id: 0, storeName: '', cityName: '', unitPrice: 60 })

// 编辑配置
const editConfig = (row) => {
  editForm.id = row.id
  editForm.cityName = row.type === '通用配置' ? '' : row.type
  editForm.unitPrice = row.unitPrice
  editDialogVisible.value = true
}

// 保存配置
const saveConfig = () => {
  if (editForm.id === 0) {
    globalConfig.unitPrice = editForm.unitPrice
  } else {
    const cityIndex = cityConfigs.value.findIndex(c => c.id === editForm.id)
    if (cityIndex !== -1) cityConfigs.value[cityIndex].unitPrice = editForm.unitPrice
  }
  editDialogVisible.value = false
}

// 打开新增城市弹窗
const openAddCityDialog = () => {
  addCityForm.cityName = ''
  addCityForm.unitPrice = 60
  addCityDialogVisible.value = true
}

// 关闭新增城市弹窗时重置
const handleAddCityDialogClosed = () => {
  addCityForm.cityName = ''
  addCityForm.unitPrice = 60
}

// 选择城市时，自动填充该城市配置的单价
const handleCitySelect = (cityName) => {
  const existing = cityConfigs.value.find(c => c.cityName === cityName)
  addCityForm.unitPrice = existing ? existing.unitPrice : globalConfig.unitPrice
}

// 新增城市
const addCity = () => {
  if (!addCityForm.cityName) return
  cityConfigs.value.push({ id: Date.now(), cityName: addCityForm.cityName, unitPrice: addCityForm.unitPrice })
  addCityDialogVisible.value = false
}

// 删除城市配置
const deleteCity = (id) => {
  const index = cityConfigs.value.findIndex(c => c.id === id)
  if (index !== -1) cityConfigs.value.splice(index, 1)
}

// 打开新增门店弹窗
const openAddStoreDialog = () => {
  addStoreForm.storeName = ''
  addStoreForm.cityName = ''
  addStoreForm.unitPrice = 60
  addStoreDialogVisible.value = true
}

// 关闭新增门店弹窗时重置
const handleAddStoreDialogClosed = () => {
  addStoreForm.storeName = ''
  addStoreForm.cityName = ''
  addStoreForm.unitPrice = 60
}

// 门店选择变化时，自动填充城市和单价
const handleStoreSelect = (storeName) => {
  const store = allStores.find(s => s.value === storeName)
  if (store) {
    addStoreForm.cityName = store.cityName
    const cityConfig = cityConfigs.value.find(c => c.cityName === store.cityName)
    addStoreForm.unitPrice = cityConfig ? cityConfig.unitPrice : globalConfig.unitPrice
  }
}

// 新增门店
const addStore = () => {
  if (!addStoreForm.storeName || !addStoreForm.cityName) return
  storeConfigs.value.push({ id: Date.now(), storeName: addStoreForm.storeName, cityName: addStoreForm.cityName, unitPrice: addStoreForm.unitPrice })
  addStoreDialogVisible.value = false
}

// 编辑门店
const editStore = (row) => {
  editStoreForm.id = row.id
  editStoreForm.storeName = row.storeName
  editStoreForm.cityName = row.cityName
  editStoreForm.unitPrice = row.unitPrice
  editStoreDialogVisible.value = true
}

// 保存门店配置
const saveStore = () => {
  const storeIndex = storeConfigs.value.findIndex(s => s.id === editStoreForm.id)
  if (storeIndex !== -1) storeConfigs.value[storeIndex].unitPrice = editStoreForm.unitPrice
  editStoreDialogVisible.value = false
}

// 删除门店配置
const deleteStore = (id) => {
  const index = storeConfigs.value.findIndex(s => s.id === id)
  if (index !== -1) storeConfigs.value.splice(index, 1)
}
</script>

<style scoped>
.shift-subsidy-config {
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
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #333;
}

.page-header p {
  margin: 0;
  color: #999;
}

.content-section {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.left-section {
  flex: 0 0 auto;
  width: auto;
  min-width: 440px;
}

.right-section {
  flex: 1;
  min-width: 0;
}

.config-group {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.config-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.config-content {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  overflow-x: auto;
}

.price-text {
  color: #409EFF;
  font-weight: bold;
}

.city-name-display {
  color: #333;
  font-weight: 500;
}

.unit-text {
  margin-left: 8px;
  color: #999;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.clickable-row {
  cursor: pointer;
}

.store-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 11px;
  background: #eee;
  color: #999;
  font-size: 12px;
}

.store-count.has-stores {
  background: #e6f7ff;
  color: #1890ff;
}

.selected-city-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  color: #1890ff;
  font-size: 13px;
}

.clear-icon {
  cursor: pointer;
}

.clear-icon:hover {
  color: #f56c6c;
}

.empty-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 0;
  color: #999;
  font-size: 14px;
}

.global-config-card {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 16px;
  background: white;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.global-config-card:hover {
  border-color: #409EFF;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.global-config-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #f0f5ff;
  border-radius: 8px;
  color: #409EFF;
  font-size: 18px;
}

.global-config-info {
  flex: 1;
}

.global-config-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.global-config-desc {
  font-size: 13px;
  color: #999;
}

.global-config-arrow {
  color: #ccc;
  font-size: 16px;
}
</style>