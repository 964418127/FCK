<template>
  <div class="therapist-offline-config">
    <div class="page-header">
      <h1>推拿师自主下线配置</h1>
      <p class="tip">💡 点击城市→门店→推拿师逐级配置阈值（工作日/周末/节假日）</p>
    </div>

    <div class="content-section">
      <!-- 全局默认配置 + 生成明细（并排） -->
      <div class="top-row">
        <div class="section-card global-card">
          <div class="card-header">
            <div class="header-left">
              <span class="level-icon">🏠</span>
              <span class="level-name">全局默认配置</span>
              <el-tag type="info" size="small">兜底配置</el-tag>
            </div>
            <el-button type="primary" size="small" @click="openEditGlobalDialog">编辑</el-button>
          </div>
          <div class="card-body">
            <div class="threshold-display">
              <div class="threshold-item">
                <span class="threshold-label">工作日阈值</span>
                <span class="threshold-value">{{ globalConfig.weekdayThreshold }} 分钟</span>
              </div>
              <div class="threshold-item">
                <span class="threshold-label">周末阈值</span>
                <span class="threshold-value">{{ globalConfig.weekendThreshold }} 分钟</span>
              </div>
              <div class="threshold-item">
                <span class="threshold-label">节假日阈值</span>
                <span class="threshold-value">{{ globalConfig.holidayThreshold }} 分钟</span>
              </div>
            </div>
          </div>
        </div>

        <div class="section-card generate-card">
          <div class="card-header">
            <div class="header-left">
              <span class="level-icon">📅</span>
              <span class="level-name">生成日期明细</span>
            </div>
          </div>
          <div class="card-body generate-body">
            <el-select v-model="generateWeek" placeholder="选择业务周" style="width: 200px; margin-right: 12px;">
              <el-option v-for="week in availableWeeks" :key="week.id" :label="week.name" :value="week.id" />
            </el-select>
            <el-button type="primary" @click="generateDetail">生成明细</el-button>
          </div>
        </div>
      </div>

      <!-- 三列布局：城市 | 门店 | 推拿师 -->
      <div class="three-column-layout">
        <!-- 第1列：城市 -->
        <div class="column-card">
          <div class="column-header">
            <span class="column-title">🏢 城市</span>
            <el-button type="primary" size="small" @click="openAddCityDialog">+ 新增</el-button>
          </div>
          <div class="column-list">
            <div
              v-for="city in cityList"
              :key="city.id"
              :class="['list-item', { active: selectedCity?.id === city.id }]"
              @click="selectCity(city)"
            >
              <div class="item-main">
                <span class="item-name">{{ city.name }}</span>
                <el-tag size="small" type="success">{{ city.storeCount }} 门店</el-tag>
              </div>
              <div class="item-thresholds">
                <span>工日 {{ city.weekdayThreshold }}</span>
                <span>周末 {{ city.weekendThreshold }}</span>
                <span>假日 {{ city.holidayThreshold }}</span>
              </div>
              <div class="item-actions">
                <el-button type="primary" size="small" link @click.stop="openEditCityDialog(city)">编辑</el-button>
                <el-button type="danger" size="small" link @click.stop="removeCity(city)">删除</el-button>
              </div>
            </div>
            <el-empty v-if="cityList.length === 0" description="暂无城市配置" :image-size="60" />
          </div>
        </div>

        <!-- 第2列：门店 -->
        <div class="column-card">
          <div class="column-header">
            <span class="column-title">🏪 门店</span>
            <div class="header-actions">
              <el-tag v-if="selectedCity" size="small" type="warning">{{ selectedCity.name }}</el-tag>
              <el-button type="primary" size="small" @click="openAddStoreDialog">+ 新增</el-button>
            </div>
          </div>
          <div class="column-list">
            <template v-if="selectedCity">
              <div
                v-for="store in selectedCityStores"
                :key="store.id"
                :class="['list-item', { active: selectedStore?.id === store.id }]"
                @click="selectStore(store)"
              >
                <div class="item-main">
                  <span class="item-name">{{ store.name }}</span>
                  <el-tag size="small" type="info">{{ store.therapistCount }} 推拿师</el-tag>
                </div>
                <div class="item-thresholds">
                  <span>工日 {{ store.weekdayThreshold }}</span>
                  <span>周末 {{ store.weekendThreshold }}</span>
                  <span>假日 {{ store.holidayThreshold }}</span>
                </div>
                <div class="item-actions">
                  <el-button type="primary" size="small" link @click.stop="openEditStoreDialog(store)">编辑</el-button>
                  <el-button type="danger" size="small" link @click.stop="removeStore(store)">删除</el-button>
                </div>
              </div>
            </template>
            <el-empty v-else description="请先选择城市" :image-size="60" />
          </div>
        </div>

        <!-- 第3列：推拿师 -->
        <div class="column-card">
          <div class="column-header">
            <span class="column-title">👤 推拿师</span>
            <div class="header-actions">
              <el-tag v-if="selectedStore" size="small" type="warning">{{ selectedStore.name }}</el-tag>
              <el-button type="primary" size="small" @click="openAddTherapistDialog">+ 新增</el-button>
            </div>
          </div>
          <div class="column-list">
            <template v-if="selectedStore">
              <div
                v-for="therapist in selectedStoreTherapists"
                :key="therapist.id"
                class="list-item"
              >
                <div class="item-main">
                  <span class="item-name">{{ therapist.name }}</span>
                </div>
                <div class="item-thresholds">
                  <span>工日 {{ therapist.weekdayThreshold }}</span>
                  <span>周末 {{ therapist.weekendThreshold }}</span>
                  <span>假日 {{ therapist.holidayThreshold }}</span>
                </div>
                <div class="item-actions">
                  <el-button type="primary" size="small" link @click.stop="openEditTherapistDialog(therapist)">编辑</el-button>
                  <el-button type="danger" size="small" link @click.stop="removeTherapist(therapist)">删除</el-button>
                </div>
              </div>
            </template>
            <el-empty v-else description="请先选择门店" :image-size="60" />
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑全局配置弹窗 -->
    <el-dialog v-model="editGlobalDialogVisible" title="编辑全局默认配置" width="450px">
      <el-form label-width="100px">
        <el-form-item label="工作日阈值">
          <el-input-number v-model="editGlobalForm.weekdayThreshold" :min="0" :step="30" controls-position="right" style="width: 150px;" />
          <span class="unit-text">分钟</span>
        </el-form-item>
        <el-form-item label="周末阈值">
          <el-input-number v-model="editGlobalForm.weekendThreshold" :min="0" :step="30" controls-position="right" style="width: 150px;" />
          <span class="unit-text">分钟</span>
        </el-form-item>
        <el-form-item label="节假日阈值">
          <el-input-number v-model="editGlobalForm.holidayThreshold" :min="0" :step="30" controls-position="right" style="width: 150px;" />
          <span class="unit-text">分钟</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editGlobalDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveGlobalConfig">保存</el-button>
      </template>
    </el-dialog>

    <!-- 新增城市弹窗 -->
    <el-dialog v-model="addCityDialogVisible" title="新增城市配置" width="400px">
      <el-form label-width="100px">
        <el-form-item label="选择城市">
          <el-select v-model="addCityForm.city" placeholder="请选择城市" style="width: 100%;" filterable>
            <el-option v-for="city in unconfiguredCities" :key="city" :label="city" :value="city" />
          </el-select>
        </el-form-item>
        <el-divider content-position="left">阈值配置（分钟）</el-divider>
        <el-form-item label="工作日阈值">
          <el-input-number v-model="addCityForm.weekdayThreshold" :min="0" :step="30" controls-position="right" style="width: 150px;" />
        </el-form-item>
        <el-form-item label="周末阈值">
          <el-input-number v-model="addCityForm.weekendThreshold" :min="0" :step="30" controls-position="right" style="width: 150px;" />
        </el-form-item>
        <el-form-item label="节假日阈值">
          <el-input-number v-model="addCityForm.holidayThreshold" :min="0" :step="30" controls-position="right" style="width: 150px;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addCityDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addCity">确定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑城市弹窗 -->
    <el-dialog v-model="editCityDialogVisible" :title="`编辑 ${editCityForm.name} 配置`" width="400px">
      <el-form label-width="100px">
        <el-form-item label="城市">
          <span class="form-value">🏢 {{ editCityForm.name }}</span>
        </el-form-item>
        <el-form-item label="工作日阈值">
          <el-input-number v-model="editCityForm.weekdayThreshold" :min="0" :step="30" controls-position="right" style="width: 150px;" />
          <span class="unit-text">分钟</span>
        </el-form-item>
        <el-form-item label="周末阈值">
          <el-input-number v-model="editCityForm.weekendThreshold" :min="0" :step="30" controls-position="right" style="width: 150px;" />
          <span class="unit-text">分钟</span>
        </el-form-item>
        <el-form-item label="节假日阈值">
          <el-input-number v-model="editCityForm.holidayThreshold" :min="0" :step="30" controls-position="right" style="width: 150px;" />
          <span class="unit-text">分钟</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editCityDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCityConfig">保存</el-button>
      </template>
    </el-dialog>

    <!-- 新增门店弹窗 -->
    <el-dialog v-model="addStoreDialogVisible" title="新增门店配置" width="400px">
      <el-form label-width="100px">
        <el-form-item label="选择门店">
          <el-select v-model="addStoreForm.store" placeholder="请选择门店" style="width: 100%;" filterable>
            <el-option v-for="store in availableStoresForAdd" :key="store" :label="store" :value="store" />
          </el-select>
        </el-form-item>
        <el-divider content-position="left">阈值配置（分钟）</el-divider>
        <el-form-item label="工作日阈值">
          <el-input-number v-model="addStoreForm.weekdayThreshold" :min="0" :step="30" controls-position="right" style="width: 150px;" />
        </el-form-item>
        <el-form-item label="周末阈值">
          <el-input-number v-model="addStoreForm.weekendThreshold" :min="0" :step="30" controls-position="right" style="width: 150px;" />
        </el-form-item>
        <el-form-item label="节假日阈值">
          <el-input-number v-model="addStoreForm.holidayThreshold" :min="0" :step="30" controls-position="right" style="width: 150px;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addStoreDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addStore">确定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑门店弹窗 -->
    <el-dialog v-model="editStoreDialogVisible" :title="`编辑 ${editStoreForm.name} 配置`" width="400px">
      <el-form label-width="100px">
        <el-form-item label="门店">
          <span class="form-value">🏪 {{ editStoreForm.name }}</span>
        </el-form-item>
        <el-form-item label="所属城市">
          <span class="form-value">{{ editStoreForm.city }}</span>
        </el-form-item>
        <el-form-item label="工作日阈值">
          <el-input-number v-model="editStoreForm.weekdayThreshold" :min="0" :step="30" controls-position="right" style="width: 150px;" />
          <span class="unit-text">分钟</span>
        </el-form-item>
        <el-form-item label="周末阈值">
          <el-input-number v-model="editStoreForm.weekendThreshold" :min="0" :step="30" controls-position="right" style="width: 150px;" />
          <span class="unit-text">分钟</span>
        </el-form-item>
        <el-form-item label="节假日阈值">
          <el-input-number v-model="editStoreForm.holidayThreshold" :min="0" :step="30" controls-position="right" style="width: 150px;" />
          <span class="unit-text">分钟</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editStoreDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveStoreConfig">保存</el-button>
      </template>
    </el-dialog>

    <!-- 新增推拿师弹窗 -->
    <el-dialog v-model="addTherapistDialogVisible" title="新增推拿师配置" width="400px">
      <el-form label-width="100px">
        <el-form-item label="选择推拿师">
          <el-select v-model="addTherapistForm.therapistId" placeholder="请选择推拿师" style="width: 100%;" filterable>
            <el-option v-for="t in unconfiguredTherapists" :key="t.id" :label="`${t.name} (${t.store})`" :value="t.id" />
          </el-select>
        </el-form-item>
        <el-divider content-position="left">阈值配置（分钟）</el-divider>
        <el-form-item label="工作日阈值">
          <el-input-number v-model="addTherapistForm.weekdayThreshold" :min="0" :step="30" controls-position="right" style="width: 150px;" />
        </el-form-item>
        <el-form-item label="周末阈值">
          <el-input-number v-model="addTherapistForm.weekendThreshold" :min="0" :step="30" controls-position="right" style="width: 150px;" />
        </el-form-item>
        <el-form-item label="节假日阈值">
          <el-input-number v-model="addTherapistForm.holidayThreshold" :min="0" :step="30" controls-position="right" style="width: 150px;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addTherapistDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addTherapist">确定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑推拿师弹窗 -->
    <el-dialog v-model="editTherapistDialogVisible" :title="`编辑 ${editTherapistForm.name} 配置`" width="400px">
      <el-form label-width="100px">
        <el-form-item label="推拿师">
          <span class="form-value">👤 {{ editTherapistForm.name }}</span>
        </el-form-item>
        <el-form-item label="所属门店">
          <span class="form-value">{{ editTherapistForm.store }}</span>
        </el-form-item>
        <el-form-item label="工作日阈值">
          <el-input-number v-model="editTherapistForm.weekdayThreshold" :min="0" :step="30" controls-position="right" style="width: 150px;" />
          <span class="unit-text">分钟</span>
        </el-form-item>
        <el-form-item label="周末阈值">
          <el-input-number v-model="editTherapistForm.weekendThreshold" :min="0" :step="30" controls-position="right" style="width: 150px;" />
          <span class="unit-text">分钟</span>
        </el-form-item>
        <el-form-item label="节假日阈值">
          <el-input-number v-model="editTherapistForm.holidayThreshold" :min="0" :step="30" controls-position="right" style="width: 150px;" />
          <span class="unit-text">分钟</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editTherapistDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTherapistConfig">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 业务周
const availableWeeks = ref([
  { id: 1, name: '排班周 1月11日-1月17日' },
  { id: 2, name: '排班周 1月18日-1月24日' },
  { id: 3, name: '排班周 1月25日-1月31日' }
])
const generateWeek = ref(null)

// 所有城市列表
const allCities = ['深圳市', '成都市', '北京市', '上海市']

// 城市-门店映射
const allStoresMap = {
  '深圳市': ['深圳南山店', '深圳福田店', '深圳宝安店', '深圳龙华店'],
  '成都市': ['成都春熙路店', '成都天府店', '成都武侯店'],
  '北京市': ['北京国贸店', '北京三里屯店', '北京望京店'],
  '上海市': ['上海陆家嘴店', '上海南京路店']
}

// 门店-推拿师映射
const storeTherapistsMap = {
  '深圳南山店': ['张三', '王七'],
  '深圳福田店': ['李四'],
  '深圳宝安店': ['赵八'],
  '深圳龙华店': [],
  '成都春熙路店': ['李四', '钱九'],
  '成都天府店': ['赵六'],
  '成都武侯店': [],
  '北京国贸店': ['孙十'],
  '北京三里屯店': [],
  '北京望京店': [],
  '上海陆家嘴店': [],
  '上海南京路店': []
}

// 城市列表（含门店数）
const cityList = ref([
  { id: 1, name: '深圳市', weekdayThreshold: 450, weekendThreshold: 400, holidayThreshold: 350, storeCount: 3 },
  { id: 2, name: '成都市', weekdayThreshold: 420, weekendThreshold: 380, holidayThreshold: 300, storeCount: 2 }
])

const unconfiguredCities = computed(() => {
  return allCities.filter(city => !cityList.value.some(c => c.name === city))
})

// 门店列表（按城市分组）
const storeList = ref([
  { id: 1, name: '深圳南山店', city: '深圳市', cityId: 1, weekdayThreshold: 400, weekendThreshold: 350, holidayThreshold: 280, therapistCount: 2 },
  { id: 2, name: '深圳福田店', city: '深圳市', cityId: 1, weekdayThreshold: 380, weekendThreshold: 320, holidayThreshold: 260, therapistCount: 1 },
  { id: 3, name: '深圳宝安店', city: '深圳市', cityId: 1, weekdayThreshold: 360, weekendThreshold: 310, holidayThreshold: 250, therapistCount: 1 },
  { id: 4, name: '成都春熙路店', city: '成都市', cityId: 2, weekdayThreshold: 360, weekendThreshold: 300, holidayThreshold: 240, therapistCount: 2 },
  { id: 5, name: '成都天府店', city: '成都市', cityId: 2, weekdayThreshold: 340, weekendThreshold: 290, holidayThreshold: 220, therapistCount: 1 }
])

// 推拿师列表（按门店分组）
const therapistList = ref([
  { id: 1, name: '张三', store: '深圳南山店', storeId: 1, weekdayThreshold: 360, weekendThreshold: 300, holidayThreshold: 240 },
  { id: 2, name: '李四', store: '深圳福田店', storeId: 2, weekdayThreshold: 320, weekendThreshold: 280, holidayThreshold: 200 },
  { id: 3, name: '王七', store: '深圳南山店', storeId: 1, weekdayThreshold: 340, weekendThreshold: 290, holidayThreshold: 210 },
  { id: 4, name: '赵八', store: '深圳宝安店', storeId: 3, weekdayThreshold: 300, weekendThreshold: 260, holidayThreshold: 180 },
  { id: 5, name: '李四', store: '成都春熙路店', storeId: 4, weekdayThreshold: 310, weekendThreshold: 270, holidayThreshold: 190 },
  { id: 6, name: '钱九', store: '成都春熙路店', storeId: 4, weekdayThreshold: 330, weekendThreshold: 280, holidayThreshold: 200 },
  { id: 7, name: '赵六', store: '成都天府店', storeId: 5, weekdayThreshold: 290, weekendThreshold: 250, holidayThreshold: 170 }
])

const allTherapists = [
  { id: 'zhangsan', name: '张三', store: '深圳南山店' },
  { id: 'lisi', name: '李四', store: '深圳福田店' },
  { id: 'wangwu', name: '王五', store: '成都春熙路店' },
  { id: 'zhaoliu', name: '赵六', store: '成都天府店' }
]

// 选中状态
const selectedCity = ref(null)
const selectedStore = ref(null)

// 选中城市的门店列表
const selectedCityStores = computed(() => {
  if (!selectedCity.value) return []
  return storeList.value.filter(s => s.cityId === selectedCity.value.id)
})

// 选中门店的推拿师列表
const selectedStoreTherapists = computed(() => {
  if (!selectedStore.value) return []
  return therapistList.value.filter(t => t.storeId === selectedStore.value.id)
})

// 新增门店时可选的门店（排除已配置的）
const availableStoresForAdd = computed(() => {
  if (!selectedCity.value) return []
  const cityName = selectedCity.value.name
  const allStores = allStoresMap[cityName] || []
  const configured = storeList.value.filter(s => s.cityId === selectedCity.value.id).map(s => s.name)
  return allStores.filter(store => !configured.includes(store))
})

// 新增推拿师时可选的推拿师（排除已配置的）
const unconfiguredTherapists = computed(() => {
  const configured = therapistList.value.map(t => t.name)
  return allTherapists.filter(t => !configured.includes(t.name))
})

// 全局配置
const globalConfig = reactive({
  weekdayThreshold: 480,
  weekendThreshold: 420,
  holidayThreshold: 360
})

// 选择城市
const selectCity = (city) => {
  selectedCity.value = city
  selectedStore.value = null
}

// 选择门店
const selectStore = (store) => {
  selectedStore.value = store
}

// 全局配置弹窗
const editGlobalDialogVisible = ref(false)
const editGlobalForm = reactive({ ...globalConfig })

const openEditGlobalDialog = () => {
  Object.assign(editGlobalForm, globalConfig)
  editGlobalDialogVisible.value = true
}

const saveGlobalConfig = () => {
  Object.assign(globalConfig, editGlobalForm)
  editGlobalDialogVisible.value = false
  ElMessage.success('全局默认配置已保存')
}

// 城市配置方法
const addCityDialogVisible = ref(false)
const addCityForm = reactive({
  city: '',
  weekdayThreshold: 480,
  weekendThreshold: 420,
  holidayThreshold: 360
})

const openAddCityDialog = () => {
  addCityForm.city = ''
  addCityForm.weekdayThreshold = globalConfig.weekdayThreshold
  addCityForm.weekendThreshold = globalConfig.weekendThreshold
  addCityForm.holidayThreshold = globalConfig.holidayThreshold
  addCityDialogVisible.value = true
}

const addCity = () => {
  if (!addCityForm.city) {
    ElMessage.warning('请选择城市')
    return
  }
  const newId = Date.now()
  cityList.value.push({
    id: newId,
    name: addCityForm.city,
    weekdayThreshold: addCityForm.weekdayThreshold,
    weekendThreshold: addCityForm.weekendThreshold,
    holidayThreshold: addCityForm.holidayThreshold,
    storeCount: 0
  })
  addCityDialogVisible.value = false
  ElMessage.success('城市配置已添加')
}

const editCityDialogVisible = ref(false)
const editCityForm = reactive({
  id: '',
  name: '',
  weekdayThreshold: 480,
  weekendThreshold: 420,
  holidayThreshold: 360
})

const openEditCityDialog = (row) => {
  Object.assign(editCityForm, row)
  editCityDialogVisible.value = true
}

const saveCityConfig = () => {
  const city = cityList.value.find(c => c.id === editCityForm.id)
  if (city) {
    city.weekdayThreshold = editCityForm.weekdayThreshold
    city.weekendThreshold = editCityForm.weekendThreshold
    city.holidayThreshold = editCityForm.holidayThreshold
  }
  editCityDialogVisible.value = false
  ElMessage.success('城市配置已保存')
}

const removeCity = (row) => {
  ElMessageBox.confirm(`确定要删除城市「${row.name}」的配置吗？该城市下的门店配置也会一并删除。`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 删除该城市下的所有门店
    const storeIds = storeList.value.filter(s => s.cityId === row.id).map(s => s.id)
    storeList.value = storeList.value.filter(s => s.cityId !== row.id)
    // 删除这些门店下的所有推拿师
    therapistList.value = therapistList.value.filter(t => !storeIds.includes(t.storeId))
    // 删除城市
    const index = cityList.value.findIndex(c => c.id === row.id)
    if (index !== -1) cityList.value.splice(index, 1)
    // 清空选中
    if (selectedCity.value?.id === row.id) {
      selectedCity.value = null
      selectedStore.value = null
    }
    ElMessage.success('已删除')
  }).catch(() => {})
}

// 门店配置方法
const addStoreDialogVisible = ref(false)
const addStoreForm = reactive({
  store: '',
  weekdayThreshold: 480,
  weekendThreshold: 420,
  holidayThreshold: 360
})

const openAddStoreDialog = () => {
  if (!selectedCity.value) {
    ElMessage.warning('请先选择一个城市')
    return
  }
  addStoreForm.store = ''
  addStoreForm.weekdayThreshold = globalConfig.weekdayThreshold
  addStoreForm.weekendThreshold = globalConfig.weekendThreshold
  addStoreForm.holidayThreshold = globalConfig.holidayThreshold
  addStoreDialogVisible.value = true
}

const addStore = () => {
  if (!addStoreForm.store) {
    ElMessage.warning('请选择门店')
    return
  }
  const newId = Date.now()
  storeList.value.push({
    id: newId,
    name: addStoreForm.store,
    city: selectedCity.value.name,
    cityId: selectedCity.value.id,
    weekdayThreshold: addStoreForm.weekdayThreshold,
    weekendThreshold: addStoreForm.weekendThreshold,
    holidayThreshold: addStoreForm.holidayThreshold,
    therapistCount: 0
  })
  // 更新城市门店数
  const city = cityList.value.find(c => c.id === selectedCity.value.id)
  if (city) city.storeCount++
  addStoreDialogVisible.value = false
  ElMessage.success('门店配置已添加')
}

const editStoreDialogVisible = ref(false)
const editStoreForm = reactive({
  id: '',
  name: '',
  city: '',
  weekdayThreshold: 480,
  weekendThreshold: 420,
  holidayThreshold: 360
})

const openEditStoreDialog = (row) => {
  Object.assign(editStoreForm, row)
  editStoreDialogVisible.value = true
}

const saveStoreConfig = () => {
  const store = storeList.value.find(s => s.id === editStoreForm.id)
  if (store) {
    store.weekdayThreshold = editStoreForm.weekdayThreshold
    store.weekendThreshold = editStoreForm.weekendThreshold
    store.holidayThreshold = editStoreForm.holidayThreshold
  }
  editStoreDialogVisible.value = false
  ElMessage.success('门店配置已保存')
}

const removeStore = (row) => {
  ElMessageBox.confirm(`确定要删除门店「${row.name}」的配置吗？该门店下的推拿师配置也会一并删除。`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 删除该门店下的所有推拿师
    therapistList.value = therapistList.value.filter(t => t.storeId !== row.id)
    // 删除门店
    const index = storeList.value.findIndex(s => s.id === row.id)
    if (index !== -1) storeList.value.splice(index, 1)
    // 更新城市门店数
    const city = cityList.value.find(c => c.id === row.cityId)
    if (city) city.storeCount--
    // 清空选中
    if (selectedStore.value?.id === row.id) {
      selectedStore.value = null
    }
    ElMessage.success('已删除')
  }).catch(() => {})
}

// 推拿师配置方法
const addTherapistDialogVisible = ref(false)
const addTherapistForm = reactive({
  therapistId: '',
  weekdayThreshold: 480,
  weekendThreshold: 420,
  holidayThreshold: 360
})

const openAddTherapistDialog = () => {
  if (!selectedStore.value) {
    ElMessage.warning('请先选择一个门店')
    return
  }
  addTherapistForm.therapistId = ''
  addTherapistForm.weekdayThreshold = globalConfig.weekdayThreshold
  addTherapistForm.weekendThreshold = globalConfig.weekendThreshold
  addTherapistForm.holidayThreshold = globalConfig.holidayThreshold
  addTherapistDialogVisible.value = true
}

const addTherapist = () => {
  if (!addTherapistForm.therapistId) {
    ElMessage.warning('请选择推拿师')
    return
  }
  const t = allTherapists.find(item => item.id === addTherapistForm.therapistId)
  therapistList.value.push({
    id: Date.now(),
    name: t.name,
    store: selectedStore.value.name,
    storeId: selectedStore.value.id,
    weekdayThreshold: addTherapistForm.weekdayThreshold,
    weekendThreshold: addTherapistForm.weekendThreshold,
    holidayThreshold: addTherapistForm.holidayThreshold
  })
  // 更新门店推拿师数
  const store = storeList.value.find(s => s.id === selectedStore.value.id)
  if (store) store.therapistCount++
  addTherapistDialogVisible.value = false
  ElMessage.success('推拿师配置已添加')
}

const editTherapistDialogVisible = ref(false)
const editTherapistForm = reactive({
  id: '',
  name: '',
  store: '',
  weekdayThreshold: 480,
  weekendThreshold: 420,
  holidayThreshold: 360
})

const openEditTherapistDialog = (row) => {
  Object.assign(editTherapistForm, row)
  editTherapistDialogVisible.value = true
}

const saveTherapistConfig = () => {
  const t = therapistList.value.find(item => item.id === editTherapistForm.id)
  if (t) {
    t.weekdayThreshold = editTherapistForm.weekdayThreshold
    t.weekendThreshold = editTherapistForm.weekendThreshold
    t.holidayThreshold = editTherapistForm.holidayThreshold
  }
  editTherapistDialogVisible.value = false
  ElMessage.success('推拿师配置已保存')
}

const removeTherapist = (row) => {
  ElMessageBox.confirm(`确定要删除推拿师「${row.name}」的配置吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = therapistList.value.findIndex(t => t.id === row.id)
    if (index !== -1) therapistList.value.splice(index, 1)
    // 更新门店推拿师数
    const store = storeList.value.find(s => s.id === row.storeId)
    if (store) store.therapistCount--
    ElMessage.success('已删除')
  }).catch(() => {})
}

// 生成明细
const generateDetail = () => {
  if (!generateWeek.value) {
    ElMessage.warning('请选择业务周')
    return
  }
  ElMessage.success('明细生成成功，可前往"自主下线明细"页面查看')
}
</script>

<style scoped>
.therapist-offline-config {
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

/* 顶部并排布局 */
.top-row {
  display: flex;
  gap: 16px;
  align-items: stretch;
}

.global-card {
  flex: 1;
  min-width: 0;
}

.generate-card {
  flex: 0 0 auto;
  min-width: 320px;
}

.generate-body {
  display: flex;
  align-items: center;
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

.threshold-display {
  display: flex;
  gap: 40px;
}

.threshold-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.threshold-label {
  font-size: 13px;
  color: #666;
}

.threshold-value {
  font-size: 16px;
  font-weight: 500;
  color: #409EFF;
}

/* 三列布局 */
.three-column-layout {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.column-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  min-height: 400px;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.column-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.column-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.list-item {
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.list-item:hover {
  border-color: #409EFF;
  background: #f0f7ff;
}

.list-item.active {
  border-color: #409EFF;
  background: #ecf5ff;
}

.item-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.item-name {
  font-weight: 500;
  color: #333;
}

.item-thresholds {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.unit-text {
  margin-left: 8px;
  color: #999;
}

.form-value {
  font-weight: 500;
  color: #333;
}
</style>