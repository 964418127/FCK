<template>
  <div class="store-interval-page">
    <div class="page-header">
      <h1>门店路线间隔时间库</h1>
      <p>管理推拿师在不同门店之间的出行耗时数据</p>
    </div>

    <!-- 导航策略配置区域已注释 -->

    <!-- 搜索过滤区域 -->
    <div class="search-section">
      <el-form :model="searchForm" inline>
        <el-form-item label="城市">
          <el-select
            v-model="searchForm.city"
            placeholder="选择城市"
            clearable
            style="width: 120px"
            @change="handleCityChange"
          >
            <el-option
              v-for="city in cityOptions"
              :key="city.value"
              :label="city.label"
              :value="city.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关联门店">
          <div class="store-pair-selector">
            <el-select
              v-model="searchForm.startStore"
              placeholder="选择门店"
              clearable
              filterable
              style="width: 160px; margin-right: 8px;"
            >
              <el-option
                v-for="store in filteredStartStores"
                :key="store.id"
                :label="store.displayName"
                :value="store.id"
              />
            </el-select>
            <span style="margin: 0 8px; font-size: 18px; color: #999;">↔</span>
            <el-select
              v-model="searchForm.endStore"
              placeholder="选择门店"
              clearable
              filterable
              style="width: 160px;"
            >
              <el-option
                v-for="store in filteredEndStores"
                :key="store.id"
                :label="store.displayName"
                :value="store.id"
              />
            </el-select>
          </div>
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
    </div>

    <!-- 操作按钮区域 -->
    <div class="action-section">
      <el-button type="primary" @click="handleBatchUpdate">
        <el-icon><RefreshRight /></el-icon>
        批量更新耗时
      </el-button>
      <el-button type="primary" @click="addDialogVisible = true">
        <el-icon><Plus /></el-icon>
        新增门店路线
      </el-button>
      <el-button type="primary" @click="historyDialogVisible = true">
        <el-icon><Clock /></el-icon>
        查看更新历史
      </el-button>
    </div>

    <!-- 三栏布局区域 -->
    <div class="three-column-layout">
      <!-- 第一栏：城市列表 -->
      <div class="column column-1">
        <div class="column-header">
          <h3>城市列表</h3>
        </div>
        <div class="city-list">
          <div
              v-for="(city, index) in groupedData"
              :key="index"
              class="city-item"
              :class="{ active: selectedCity?.cityId === city.cityId }"
              @click="selectCity(city)"
            >
              <div class="city-name">{{ city.cityName }}</div>
              <div class="store-count">{{ city.storeCount }} 家门店</div>
            </div>
        </div>
      </div>

      <!-- 第二栏：主视角门店列表 -->
      <div class="column column-2">
        <div class="column-header">
          <h3>主门店</h3>
          <span v-if="selectedCity" class="selected-city">{{ selectedCity.cityName }}</span>
        </div>
        <div class="store-list">
          <div
                  v-for="(store, index) in selectedCity?.stores || []"
                  :key="index"
                  class="store-item"
                  :class="{ active: selectedStore?.storeId === store.storeId }"
                >
                  <div class="store-content" @click="selectStore(store)">
                    <div class="store-name">{{ store.storeName }}</div>
                    <div class="store-address">{{ store.storeAddress }}</div>
                    <div class="route-count">{{ store.routeCount }} 家关联门店</div>
                  </div>
                  <div class="store-actions">
                    <el-button type="text" size="small" @click="handleEdit(store)" style="margin-left: 8px;">
                      <el-icon><Edit /></el-icon>
                      编辑
                    </el-button>
                  </div>
                </div>
        </div>
      </div>

      <!-- 第三栏：关联门店及路线信息 -->
      <div class="column column-3">
        <div class="column-header">
          <h3>关联门店及路线信息</h3>
          <span v-if="selectedStore" class="selected-store">{{ selectedStore.storeName }}</span>
        </div>
        <div class="related-stores">
          <div
                  v-for="(route, index) in selectedStore?.routes || []"
                  :key="index"
                  class="route-item"
                >
                  <div class="route-header">
                    <el-tag size="small" type="success">
                      {{ route.endStore?.displayName || '未知门店' }}
                    </el-tag>
                  </div>
                  <div class="route-info">
                    <span class="distance-info">距离: {{ route.distance ? route.distance.toFixed(2) : 'N/A' }} km</span>
                    <span class="standard-time">标准时间: <el-tag size="small" type="primary">{{ route.standardTime }}</el-tag> 分钟</span>
                  </div>
                </div>
          <div v-if="!selectedStore" class="empty-state">
            请先选择门店
          </div>
        </div>
      </div>
    </div>

    <!-- 更新耗时对话框 -->


    <!-- 新增路线（成对双向路线） -->
    <el-dialog
      v-model="addDialogVisible"
      title="新增门店路线"
      width="800px"
      teleported
    >
      <el-form :model="addForm" :rules="addRules" ref="addFormRef">
        <div class="simple-form">
          <!-- 优化布局：城市、起始门店、终点门店全部在一行，门店宽度均分 -->
          <div class="compact-row">
            <div class="compact-item">
              <div class="compact-label">城市</div>
              <div class="compact-control">
                <el-select v-model="addForm.city" placeholder="选择城市" @change="handleAddCityChange">
                  <el-option v-for="c in cityOptions" :key="c.value" :label="c.label" :value="c.value" />
                </el-select>
              </div>
            </div>
            <div class="compact-item">
              <div class="compact-label">关联门店</div>
              <div class="compact-control">
                <div class="store-pair-selector">
                  <el-select
                    v-model="addForm.startStore"
                    placeholder="选择主门店"
                    clearable
                    filterable
                    style="width: 160px; margin-right: 8px;"
                    :disabled="!addForm.city"
                  >
                    <el-option v-for="s in addFilteredStartStores" :key="s.id" :label="s.displayName" :value="s.id" />
                  </el-select>
                  <span style="margin: 0 8px; font-size: 18px; color: #999;">↔</span>
                  <el-select
                    v-model="addForm.endStores"
                    placeholder="选择关联门店"
                    clearable
                    filterable
                    multiple
                    style="width: 200px;"
                    :disabled="!addForm.city"
                  >
                    <el-option v-for="s in addFilteredEndStores" :key="s.id" :label="s.displayName" :value="s.id" />
                  </el-select>
                </div>
                <div style="margin-top: 8px; font-size: 13px; color: #666;">
                  可选择多个关联门店，将批量生成双向路线
                </div>
              </div>
            </div>
          </div>



          <!-- 点击计算后显示的双向路线详情 -->
          <template v-if="addForm.routePairs.length > 0">
            <div style="margin-top: 16px; margin-bottom: 8px;">
              <el-divider>双向路线详情</el-divider>
            </div>

            <div class="route-pairs-list">
              <div v-for="(pair, index) in addForm.routePairs" :key="index" class="route-pair-item">
                <el-tag size="small" type="success" style="margin-right: 12px;">
                  {{ pair.route.split(' ↔ ')[1] }}
                </el-tag>
                <span class="distance-info">距离: {{ pair.distance ? pair.distance.toFixed(2) : 'N/A' }} km</span>
                <span class="standard-time">
                  标准时间: <el-tag size="small" type="primary">{{ pair.standardTime }}</el-tag> 分钟
                </span>
              </div>
            </div>
          </template>
        </div>
      </el-form>

      <div v-if="addState === 'computing'" class="update-status">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>正在计算双向路线，请稍候...</span>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="computeAddRoute" :disabled="!addForm.startStore || addForm.endStores.length === 0 || addState === 'computing'">{{ addState === 'ready' ? '重新计算' : '开始计算' }}</el-button>
          <el-button type="primary" @click="confirmAddRoute" :disabled="addForm.routePairs.length === 0">确认保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 标准时间说明对话框 --> 
    <el-dialog v-model="standardDetailDialogVisible" title="标准时间依据" width="480px" :before-close="handleStandardDetailClose">
      <div style="padding:12px 8px;">
        <p><strong>起点 — 终点 用时：</strong>{{ standardDetailData.navigationTime }} 分钟</p>
        <p><strong>推荐标准时间：</strong>{{ standardDetailData.standardTime }} 分钟</p>

        <el-table
          :data="standardBuckets"
          stripe
          style="width: 100%; margin-top: 8px;"
          :row-class-name="bucketRowClass"
        >
          <el-table-column prop="range" label="用时区间" width="220" />
          <el-table-column prop="standard" label="标准间隔(分钟)" width="160" />
        </el-table>
      </div>
    <template #footer>
        <span class="dialog-footer">
          <el-button @click="standardDetailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑路线（成对双向路线） -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑门店路线"
      width="800px"
      teleported
    >
      <el-form :model="editForm" :rules="editRules" ref="editFormRef">
        <div class="simple-form">
          <!-- 优化布局：城市、起始门店、终点门店全部在一行，门店宽度均分 -->
          <div class="compact-row">
            <div class="compact-item">
              <div class="compact-label">城市</div>
              <div class="compact-control">
                <el-select v-model="editForm.city" placeholder="选择城市" @change="handleEditCityChange">
                  <el-option v-for="c in cityOptions" :key="c.value" :label="c.label" :value="c.value" />
                </el-select>
              </div>
            </div>
            <div class="compact-item">
              <div class="compact-label">关联门店</div>
              <div class="compact-control">
                <el-select
                  v-model="editForm.endStores"
                  placeholder="选择关联门店"
                  clearable
                  filterable
                  multiple
                  style="width: 200px;"
                  :disabled="!editForm.city"
                >
                  <el-option v-for="s in addFilteredEndStores" :key="s.id" :label="s.displayName" :value="s.id" />
                </el-select>
              </div>
              <div style="margin-top: 8px; font-size: 13px; color: #666;">
                可选择多个关联门店，将批量生成双向路线
              </div>
            </div>
          </div>



          <!-- 点击计算后显示的双向路线详情 -->
          <template v-if="editForm.routePairs.length > 0">
            <div style="margin-top: 16px; margin-bottom: 8px;">
              <el-divider>双向路线详情</el-divider>
            </div>

            <div class="route-pairs-list">
              <div v-for="(pair, index) in editForm.routePairs" :key="index" class="route-pair-item">
                <el-tag size="small" type="success" style="margin-right: 12px;">
                  {{ pair.route.split(' ↔ ')[1] }}
                </el-tag>
                <span class="distance-info">距离: {{ pair.distance ? pair.distance.toFixed(2) : 'N/A' }} km</span>
                <span class="standard-time">
                  标准时间: <el-tag size="small" type="primary">{{ pair.standardTime }}</el-tag> 分钟
                </span>
              </div>
            </div>
          </template>
        </div>
      </el-form>

      <div v-if="editState === 'computing'" class="update-status">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>正在计算双向路线，请稍候...</span>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="computeEditRoute" :disabled="!editForm.city || !editForm.startStore || editForm.endStores.length === 0 || editState === 'computing'">{{ editState === 'ready' ? '重新计算' : '开始计算' }}</el-button>
          <el-button type="primary" @click="confirmEditRoute" :disabled="editForm.routePairs.length === 0">确认保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新增门店路线功能已移除 -->

    <!-- 历史记录对话框 -->
    <el-dialog
      v-model="historyDialogVisible"
      title="系统更新历史"
      width="900px"
      :before-close="handleHistoryDialogClose"
    >
      <el-table :data="historyData" stripe style="width: 100%">
        <el-table-column prop="updateTime" label="更新时间" width="160">
          <template #default="scope">
            {{ formatDate(scope.row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="updaterName" label="更新来源" width="200">
          <template #default="scope">
            <div>
              <div v-if="scope.row.updaterType === 'system'">
                <el-tag type="info">系统</el-tag>
                <span>自动更新</span>
              </div>
              <div v-else>
                <el-tag type="warning">员工</el-tag>
                <span>{{ scope.row.updaterName }}<span v-if="scope.row.updaterId">（{{ scope.row.updaterId }}）</span></span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="updateNote" label="更新说明">
          <template #default="scope">
            {{ scope.row.updateNote || '-' }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  RefreshRight,
  Edit,
  Clock,
  Setting,
  Loading,
  Check,
  
} from '@element-plus/icons-vue'

// 响应式数据
const searchForm = reactive({
  city: '',
  startStore: '',
  endStore: ''
})

const strategyForm = reactive({
  navigationType: 'cycling', // 默认骑行
  planStrategy: 'shortest-time' // 默认用时最短
})

// 三栏布局选中状态
const selectedCity = ref(null)
const selectedStore = ref(null)

// 选择城市
const selectCity = (city) => {
  selectedCity.value = city
  selectedStore.value = null
  // 同步到搜索表单
  searchForm.city = city.cityId
}

// 选择门店
const selectStore = (store) => {
  selectedStore.value = store
  // 同步到搜索表单
  searchForm.startStore = store.storeId
}

// 城市变更处理
const handleCityChange = (city) => {
  // 同步到三栏布局
  const targetCity = groupedData.value.find(c => c.cityId === city)
  if (targetCity) {
    selectedCity.value = targetCity
    selectedStore.value = null
  } else {
    selectedCity.value = null
    selectedStore.value = null
  }
}

// 搜索处理
const handleSearch = () => {
  if (searchForm.city) {
    const targetCity = groupedData.value.find(c => c.cityId === searchForm.city)
    if (targetCity) {
      selectedCity.value = targetCity
      if (searchForm.startStore) {
        const targetStore = targetCity.stores.find(s => s.storeId === searchForm.startStore)
        if (targetStore) {
          selectedStore.value = targetStore
        } else {
          selectedStore.value = null
        }
      } else {
        selectedStore.value = null
      }
    }
  } else if (searchForm.startStore) {
    // 没有选择城市时，根据门店ID查找
    const allStores = groupedData.value.flatMap(city => city.stores)
    const targetStore = allStores.find(s => s.storeId === searchForm.startStore)
    if (targetStore) {
      // 找到门店所在的城市
      const targetCity = groupedData.value.find(city => city.stores.some(s => s.storeId === targetStore.storeId))
      if (targetCity) {
        selectedCity.value = targetCity
        selectedStore.value = targetStore
      }
    }
  }
}

// 重置处理
const handleReset = () => {
  searchForm.city = ''
  searchForm.startStore = ''
  searchForm.endStore = ''
  selectedCity.value = null
  selectedStore.value = null
}

const historyDialogVisible = ref(false)
const historyData = ref([
  // 系统自动更新示例
  {
    updateTime: '2024-12-26 10:00:00',
    updaterType: 'system',
    updaterName: '系统自动',
    updateNote: '系统定时同步地图API数据'
  },
  {
    updateTime: '2024-12-25 08:00:00',
    updaterType: 'system',
    updaterName: '系统自动',
    updateNote: '系统自动更新地图数据'
  },
  // 员工手动更新示例
  {
    updateTime: '2024-12-22 16:45:00',
    updaterType: 'user',
    updaterName: '周九',
    updaterId: '10006',
    updateNote: '手动调整标准时间'
  },
  {
    updateTime: '2024-12-20 10:00:00',
    updaterType: 'user',
    updaterName: '孙八',
    updaterId: '10005',
    updateNote: '手动调整导航时间'
  },
  {
    updateTime: '2024-12-15 09:00:00',
    updaterType: 'user',
    updaterName: '王五',
    updaterId: '10001',
    updateNote: '手动修正门店路线耗时'
  },
  {
    updateTime: '2024-12-10 14:20:00',
    updaterType: 'user',
    updaterName: '李三',
    updaterId: '12123',
    updateNote: '门店调整后人工校准'
  },
  {
    updateTime: '2024-12-05 16:00:00',
    updaterType: 'user',
    updaterName: '钱七',
    updaterId: '10004',
    updateNote: '新增门店路线'
  },
  {
    updateTime: '2024-11-30 14:00:00',
    updaterType: 'system',
    updaterName: '系统自动',
    updateNote: '系统自动更新地图数据'
  },
  {
    updateTime: '2024-11-20 12:10:00',
    updaterType: 'user',
    updaterName: '张三',
    updaterId: '10003',
    updateNote: '员工手动修正（门店反馈）'
  },
  {
    updateTime: '2024-12-01 08:00:00',
    updaterType: 'system',
    updaterName: '系统自动',
    updateNote: '系统初始化导入'
  }
])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 策略配置已简化，无需标签页切换

// 城市选项
const cityOptions = [
  { label: '成都市', value: 'chengdu' },
  { label: '北京市', value: 'beijing' },
  { label: '上海市', value: 'shanghai' },
  { label: '广州市', value: 'guangzhou' },
  { label: '深圳市', value: 'shenzhen' }
]

// 门店数据
const stores = ref([
  // 成都市门店
  {
    id: '1',
    name: '天府凯德店',
    displayName: '天府凯德店',
    address: '成都市高新区天府大道123号天府凯德广场3F',
    city: 'chengdu',
    longitude: '104.0647',
    latitude: '30.5702'
  },
  {
    id: '2',
    name: '金牛凯德店',
    displayName: '金牛凯德店',
    address: '成都市金牛区蜀汉路456号金牛凯德广场2F',
    city: 'chengdu',
    longitude: '104.0520',
    latitude: '30.6907'
  },
  {
    id: '3',
    name: '春熙路店',
    displayName: '春熙路店',
    address: '成都市锦江区春熙路789号王府井百货B1',
    city: 'chengdu',
    longitude: '104.0770',
    latitude: '30.6574'
  },
  {
    id: '4',
    name: '万达广场店',
    displayName: '万达广场店',
    address: '成都市郫都区创业路999号郫都万达广场4F',
    city: 'chengdu',
    longitude: '103.8967',
    latitude: '30.8108'
  },
  {
    id: '5',
    name: '世纪城店',
    displayName: '世纪城店',
    address: '成都市武侯区世纪城路111号世纪城广场1F',
    city: 'chengdu',
    longitude: '104.0618',
    latitude: '30.5469'
  },
  {
    id: '6',
    name: '环球中心店',
    displayName: '环球中心店',
    address: '成都市高新区天府大道1700号环球中心E3区2F',
    city: 'chengdu',
    longitude: '104.0585',
    latitude: '30.5507'
  },
  {
    id: '7',
    name: '高新区店',
    displayName: '高新区店',
    address: '成都市高新区天府三街198号腾讯大厦B座1F',
    city: 'chengdu',
    longitude: '104.0632',
    latitude: '30.5615'
  },
  {
    id: '8',
    name: '华阳店',
    displayName: '华阳店',
    address: '成都市双流区华阳街道益州大道南段555号',
    city: 'chengdu',
    longitude: '104.0478',
    latitude: '30.5289'
  },
  // 北京市门店
  {
    id: '9',
    name: '王府井店',
    displayName: '王府井店',
    address: '北京市东城区王府井大街138号新东安市场5F',
    city: 'beijing',
    longitude: '116.4038',
    latitude: '39.9149'
  },
  {
    id: '10',
    name: '中关村店',
    displayName: '中关村店',
    address: '北京市海淀区中关村大街1号海龙大厦3F',
    city: 'beijing',
    longitude: '116.3077',
    latitude: '39.9888'
  },
  {
    id: '11',
    name: '国贸店',
    displayName: '国贸店',
    address: '北京市朝阳区建国门外大街1号国贸大厦B座2F',
    city: 'beijing',
    longitude: '116.4426',
    latitude: '39.9042'
  },
  {
    id: '12',
    name: '望京店',
    displayName: '望京店',
    address: '北京市朝阳区望京街9号望京国际商业中心4F',
    city: 'beijing',
    longitude: '116.4735',
    latitude: '39.9964'
  },
  {
    id: '13',
    name: '西直门店',
    displayName: '西直门店',
    address: '北京市西城区西直门外大街1号西环广场3F',
    city: 'beijing',
    longitude: '116.3511',
    latitude: '39.9437'
  },
  // 上海市门店
  {
    id: '14',
    name: '陆家嘴店',
    displayName: '陆家嘴店',
    address: '上海市浦东新区世纪大道1号上海环球金融中心B2',
    city: 'shanghai',
    longitude: '121.5064',
    latitude: '31.2304'
  },
  {
    id: '15',
    name: '南京西路店',
    displayName: '南京西路店',
    address: '上海市静安区南京西路1266号恒隆广场4F',
    city: 'shanghai',
    longitude: '121.4742',
    latitude: '31.2361'
  },
  {
    id: '16',
    name: '淮海中路店',
    displayName: '淮海中路店',
    address: '上海市黄浦区淮海中路99号大上海时代广场3F',
    city: 'shanghai',
    longitude: '121.4803',
    latitude: '31.2300'
  },
  {
    id: '17',
    name: '徐家汇店',
    displayName: '徐家汇店',
    address: '上海市徐汇区虹桥路1号港汇恒隆广场5F',
    city: 'shanghai',
    longitude: '121.4329',
    latitude: '31.2169'
  },
  // 广州市门店
  {
    id: '18',
    name: '天河城店',
    displayName: '天河城店',
    address: '广州市天河区天河路208号天河城4F',
    city: 'guangzhou',
    longitude: '113.3245',
    latitude: '23.1200'
  },
  {
    id: '19',
    name: '北京路店',
    displayName: '北京路店',
    address: '广州市越秀区北京路342号新大新百货3F',
    city: 'guangzhou',
    longitude: '113.2644',
    latitude: '23.1205'
  },
  {
    id: '20',
    name: '珠江新城店',
    displayName: '珠江新城店',
    address: '广州市天河区珠江新城花城大道89号高德置地广场春广场2F',
    city: 'guangzhou',
    longitude: '113.3277',
    latitude: '23.1212'
  },
  // 深圳市门店
  {
    id: '21',
    name: '海岸城店',
    displayName: '海岸城店',
    address: '深圳市南山区文心五路33号海岸城购物中心3F',
    city: 'shenzhen',
    longitude: '113.9208',
    latitude: '22.5310'
  },
  {
    id: '22',
    name: '福田CBD店',
    displayName: '福田CBD店',
    address: '深圳市福田区福华三路118号皇岗商务中心4F',
    city: 'shenzhen',
    longitude: '114.0558',
    latitude: '22.5431'
  },
  {
    id: '23',
    name: '东门老街店',
    displayName: '东门老街店',
    address: '深圳市罗湖区东门中路2047号茂业百货5F',
    city: 'shenzhen',
    longitude: '114.1001',
    latitude: '22.5476'
  }
])

// 间隔时间数据
const intervalData = ref([
  // 天府凯德店关联路线（7家门店）
  {
    id: '1',
    route: '天府凯德店 → 金牛凯德店',
    direction: '单向',
    startStore: stores.value[0],
    endStore: stores.value[1],
    navigationTime: 18,
    distance: 13.48,
    standardTime: 20,
    navigationType: 'cycling',
    planStrategy: 'shortest-time',
    updateStrategy: 'auto',
    lastUpdateType: 'auto',
    lastUpdateTime: '2024-12-26 10:00:00',
    history: [
      {
        updateTime: '2024-12-26 10:00:00',
        oldNavigationTime: null,
        newNavigationTime: 18,
        oldStandardTime: null,
        newStandardTime: 20,
        updateNote: '系统定时同步地图API数据',
        updaterType: 'system',
        updaterName: '系统自动'
      },
      {
        updateTime: '2024-12-15 09:00:00',
        oldNavigationTime: 15,
        newNavigationTime: 18,
        oldStandardTime: 20,
        newStandardTime: 20,
        updateNote: '手动修正门店路线耗时',
        updaterType: 'user',
        updaterName: '王五(10001)'
      },
      {
        updateTime: '2024-11-30 14:00:00',
        oldNavigationTime: 16,
        newNavigationTime: 15,
        oldStandardTime: 20,
        newStandardTime: 20,
        updateNote: '系统自动更新地图数据',
        updaterType: 'system',
        updaterName: '系统自动'
      }
    ]
  },
  {
    id: '3',
    route: '天府凯德店 → 春熙路店',
    direction: '单向',
    startStore: stores.value[0],
    endStore: stores.value[2],
    navigationTime: 12,
    distance: 9.65,
    standardTime: 15,
    navigationType: 'cycling',
    planStrategy: 'shortest-time',
    updateStrategy: 'manual',
    lastUpdateType: 'manual',
    lastUpdateTime: '2024-12-25 14:30:00',
    history: [
      {
        updateTime: '2024-12-25 14:30:00',
        oldNavigationTime: 10,
        newNavigationTime: 12,
        oldStandardTime: 15,
        newStandardTime: 15,
        updateNote: '手动调整标准时间范围',
        updaterType: 'user',
        updaterName: '赵六(10002)'
      },
      {
        updateTime: '2024-12-01 08:00:00',
        oldNavigationTime: null,
        newNavigationTime: 11,
        oldStandardTime: null,
        newStandardTime: 15,
        updateNote: '系统初始化导入',
        updaterType: 'system',
        updaterName: '系统自动'
      }
    ]
  },
  {
    id: '5',
    route: '天府凯德店 → 万达广场店',
    direction: '单向',
    startStore: stores.value[0],
    endStore: stores.value[3],
    navigationTime: 25,
    distance: 22.34,
    standardTime: 30,
    navigationType: 'cycling',
    planStrategy: 'shortest-time',
    updateStrategy: 'auto',
    lastUpdateType: 'auto',
    lastUpdateTime: '2024-12-26 10:00:00',
    history: [
      {
        updateTime: '2024-12-26 10:00:00',
        oldNavigationTime: 23,
        newNavigationTime: 25,
        oldStandardTime: 30,
        newStandardTime: 30,
        updateNote: '系统自动更新地图数据',
        updaterType: 'system',
        updaterName: '系统自动'
      },
      {
        updateTime: '2024-12-05 16:00:00',
        oldNavigationTime: null,
        newNavigationTime: 24,
        oldStandardTime: null,
        newStandardTime: 30,
        updateNote: '新增门店路线',
        updaterType: 'user',
        updaterName: '钱七(10004)'
      }
    ]
  },
  {
    id: '6',
    route: '天府凯德店 → 世纪城店',
    direction: '单向',
    startStore: stores.value[0],
    endStore: stores.value[4],
    navigationTime: 8,
    distance: 5.21,
    standardTime: 10,
    navigationType: 'cycling',
    planStrategy: 'shortest-time',
    updateStrategy: 'manual',
    lastUpdateType: 'manual',
    lastUpdateTime: '2024-12-20 10:00:00',
    history: [
      {
        updateTime: '2024-12-20 10:00:00',
        oldNavigationTime: 7,
        newNavigationTime: 8,
        oldStandardTime: 10,
        newStandardTime: 10,
        updateNote: '手动调整导航时间',
        updaterType: 'user',
        updaterName: '孙八(10005)'
      }
    ]
  },
  {
    id: '9',
    route: '天府凯德店 → 环球中心店',
    direction: '单向',
    startStore: stores.value[0],
    endStore: stores.value[5],
    navigationTime: 15,
    distance: 18.76,
    standardTime: 20,
    navigationType: 'cycling',
    planStrategy: 'shortest-time',
    updateStrategy: 'auto',
    lastUpdateType: 'auto',
    lastUpdateTime: '2024-12-26 10:00:00',
    history: [
      {
        updateTime: '2024-12-26 10:00:00',
        oldNavigationTime: null,
        newNavigationTime: 15,
        oldStandardTime: null,
        newStandardTime: 20,
        updateNote: '系统定时同步地图API数据',
        updaterType: 'system',
        updaterName: '系统自动'
      }
    ]
  },
  {
    id: '10',
    route: '天府凯德店 → 高新区店',
    direction: '单向',
    startStore: stores.value[0],
    endStore: stores.value[6],
    navigationTime: 10,
    distance: 7.89,
    standardTime: 15,
    navigationType: 'cycling',
    planStrategy: 'shortest-time',
    updateStrategy: 'manual',
    lastUpdateType: 'manual',
    lastUpdateTime: '2024-12-22 16:45:00',
    history: [
      {
        updateTime: '2024-12-22 16:45:00',
        oldNavigationTime: 9,
        newNavigationTime: 10,
        oldStandardTime: 15,
        newStandardTime: 15,
        updateNote: '手动调整标准时间',
        updaterType: 'user',
        updaterName: '周九(10006)'
      }
    ]
  },
  {
    id: '11',
    route: '天府凯德店 → 华阳店',
    direction: '单向',
    startStore: stores.value[0],
    endStore: stores.value[7],
    navigationTime: 32,
    distance: 28.56,
    standardTime: 35,
    navigationType: 'cycling',
    planStrategy: 'shortest-time',
    updateStrategy: 'auto',
    lastUpdateType: 'auto',
    lastUpdateTime: '2024-12-26 10:00:00',
    history: [
      {
        updateTime: '2024-12-26 10:00:00',
        oldNavigationTime: null,
        newNavigationTime: 32,
        oldStandardTime: null,
        newStandardTime: 35,
        updateNote: '系统定时同步地图API数据',
        updaterType: 'system',
        updaterName: '系统自动'
      }
    ]
  },
  // 金牛凯德店关联路线（7家门店）
  {
    id: '2',
    route: '金牛凯德店 → 天府凯德店',
    direction: '单向',
    startStore: stores.value[1],
    endStore: stores.value[0],
    navigationTime: 16,
    distance: 13.48,
    standardTime: 20,
    navigationType: 'cycling',
    planStrategy: 'shortest-time',
    updateStrategy: 'auto',
    lastUpdateType: 'auto',
    lastUpdateTime: '2024-12-26 10:00:00',
    history: [
      {
        updateTime: '2024-12-26 10:00:00',
        oldNavigationTime: null,
        newNavigationTime: 16,
        oldStandardTime: null,
        newStandardTime: 20,
        updateNote: '系统定时同步地图API数据',
        updaterType: 'system',
        updaterName: '系统自动'
      },
      {
        updateTime: '2024-12-10 14:20:00',
        oldNavigationTime: 17,
        newNavigationTime: 16,
        oldStandardTime: 20,
        newStandardTime: 20,
        updateNote: '门店调整后人工校准',
        updaterType: 'user',
        updaterName: '李三(12123)'
      }
    ]
  },
  {
    id: '7',
    route: '金牛凯德店 → 春熙路店',
    direction: '单向',
    startStore: stores.value[1],
    endStore: stores.value[2],
    navigationTime: 20,
    distance: 15.23,
    standardTime: 25,
    navigationType: 'cycling',
    planStrategy: 'shortest-time',
    updateStrategy: 'auto',
    lastUpdateType: 'auto',
    lastUpdateTime: '2024-12-26 10:00:00',
    history: [
      {
        updateTime: '2024-12-26 10:00:00',
        oldNavigationTime: 19,
        newNavigationTime: 20,
        oldStandardTime: 25,
        newStandardTime: 25,
        updateNote: '系统自动更新地图数据',
        updaterType: 'system',
        updaterName: '系统自动'
      }
    ]
  },
  {
    id: '12',
    route: '金牛凯德店 → 万达广场店',
    direction: '单向',
    startStore: stores.value[1],
    endStore: stores.value[3],
    navigationTime: 28,
    distance: 25.67,
    standardTime: 35,
    navigationType: 'cycling',
    planStrategy: 'shortest-time',
    updateStrategy: 'auto',
    lastUpdateType: 'auto',
    lastUpdateTime: '2024-12-26 10:00:00',
    history: [
      {
        updateTime: '2024-12-26 10:00:00',
        oldNavigationTime: null,
        newNavigationTime: 28,
        oldStandardTime: null,
        newStandardTime: 35,
        updateNote: '系统定时同步地图API数据',
        updaterType: 'system',
        updaterName: '系统自动'
      }
    ]
  },
  {
    id: '13',
    route: '金牛凯德店 → 世纪城店',
    direction: '单向',
    startStore: stores.value[1],
    endStore: stores.value[4],
    navigationTime: 22,
    distance: 18.92,
    standardTime: 25,
    navigationType: 'cycling',
    planStrategy: 'shortest-time',
    updateStrategy: 'auto',
    lastUpdateType: 'auto',
    lastUpdateTime: '2024-12-26 10:00:00',
    history: [
      {
        updateTime: '2024-12-26 10:00:00',
        oldNavigationTime: null,
        newNavigationTime: 22,
        oldStandardTime: null,
        newStandardTime: 25,
        updateNote: '系统定时同步地图API数据',
        updaterType: 'system',
        updaterName: '系统自动'
      }
    ]
  },
  {
    id: '14',
    route: '金牛凯德店 → 环球中心店',
    direction: '单向',
    startStore: stores.value[1],
    endStore: stores.value[5],
    navigationTime: 30,
    distance: 32.14,
    standardTime: 35,
    navigationType: 'cycling',
    planStrategy: 'shortest-time',
    updateStrategy: 'auto',
    lastUpdateType: 'auto',
    lastUpdateTime: '2024-12-26 10:00:00',
    history: [
      {
        updateTime: '2024-12-26 10:00:00',
        oldNavigationTime: null,
        newNavigationTime: 30,
        oldStandardTime: null,
        newStandardTime: 35,
        updateNote: '系统定时同步地图API数据',
        updaterType: 'system',
        updaterName: '系统自动'
      }
    ]
  },
  {
    id: '15',
    route: '金牛凯德店 → 高新区店',
    direction: '单向',
    startStore: stores.value[1],
    endStore: stores.value[6],
    navigationTime: 25,
    distance: 21.35,
    standardTime: 30,
    navigationType: 'cycling',
    planStrategy: 'shortest-time',
    updateStrategy: 'auto',
    lastUpdateType: 'auto',
    lastUpdateTime: '2024-12-26 10:00:00',
    history: [
      {
        updateTime: '2024-12-26 10:00:00',
        oldNavigationTime: null,
        newNavigationTime: 25,
        oldStandardTime: null,
        newStandardTime: 30,
        updateNote: '系统定时同步地图API数据',
        updaterType: 'system',
        updaterName: '系统自动'
      }
    ]
  },
  {
    id: '16',
    route: '金牛凯德店 → 华阳店',
    direction: '单向',
    startStore: stores.value[1],
    endStore: stores.value[7],
    navigationTime: 35,
    distance: 38.72,
    standardTime: 40,
    navigationType: 'cycling',
    planStrategy: 'shortest-time',
    updateStrategy: 'auto',
    lastUpdateType: 'auto',
    lastUpdateTime: '2024-12-26 10:00:00',
    history: [
      {
        updateTime: '2024-12-26 10:00:00',
        oldNavigationTime: null,
        newNavigationTime: 35,
        oldStandardTime: null,
        newStandardTime: 40,
        updateNote: '系统定时同步地图API数据',
        updaterType: 'system',
        updaterName: '系统自动'
      }
    ]
  },
  // 春熙路店关联路线（7家门店）
  {
    id: '4',
    route: '春熙路店 → 天府凯德店',
    direction: '单向',
    startStore: stores.value[2],
    endStore: stores.value[0],
    navigationTime: 11,
    distance: 9.65,
    standardTime: 15,
    navigationType: 'cycling',
    planStrategy: 'shortest-time',
    updateStrategy: 'auto',
    lastUpdateType: 'auto',
    lastUpdateTime: '2024-12-26 10:00:00',
    history: [
      {
        updateTime: '2024-12-26 10:00:00',
        oldNavigationTime: null,
        newNavigationTime: 11,
        oldStandardTime: null,
        newStandardTime: 15,
        updateNote: '系统定时同步地图API数据',
        updaterType: 'system',
        updaterName: '系统自动'
      },
      {
        updateTime: '2024-11-20 12:10:00',
        oldNavigationTime: 12,
        newNavigationTime: 11,
        oldStandardTime: 15,
        newStandardTime: 15,
        updateNote: '员工手动修正（门店反馈）',
        updaterType: 'user',
        updaterName: '张三(10003)'
      }
    ]
  },
  {
    id: '8',
    route: '春熙路店 → 金牛凯德店',
    direction: '单向',
    startStore: stores.value[2],
    endStore: stores.value[1],
    navigationTime: 21,
    distance: 15.23,
    standardTime: 25,
    navigationType: 'cycling',
    planStrategy: 'shortest-time',
    updateStrategy: 'auto',
    lastUpdateType: 'auto',
    lastUpdateTime: '2024-12-26 10:00:00',
    history: [
      {
        updateTime: '2024-12-26 10:00:00',
        oldNavigationTime: 22,
        newNavigationTime: 21,
        oldStandardTime: 25,
        newStandardTime: 25,
        updateNote: '系统自动更新地图数据',
        updaterType: 'system',
        updaterName: '系统自动'
      }
    ]
  },
  {
    id: '17',
    route: '春熙路店 → 万达广场店',
    direction: '单向',
    startStore: stores.value[2],
    endStore: stores.value[3],
    navigationTime: 30,
    distance: 28.76,
    standardTime: 35,
    navigationType: 'cycling',
    planStrategy: 'shortest-time',
    updateStrategy: 'auto',
    lastUpdateType: 'auto',
    lastUpdateTime: '2024-12-26 10:00:00',
    history: [
      {
        updateTime: '2024-12-26 10:00:00',
        oldNavigationTime: null,
        newNavigationTime: 30,
        oldStandardTime: null,
        newStandardTime: 35,
        updateNote: '系统定时同步地图API数据',
        updaterType: 'system',
        updaterName: '系统自动'
      }
    ]
  },
  {
    id: '18',
    route: '春熙路店 → 世纪城店',
    direction: '单向',
    startStore: stores.value[2],
    endStore: stores.value[4],
    navigationTime: 25,
    distance: 22.45,
    standardTime: 30,
    navigationType: 'cycling',
    planStrategy: 'shortest-time',
    updateStrategy: 'auto',
    lastUpdateType: 'auto',
    lastUpdateTime: '2024-12-26 10:00:00',
    history: [
      {
        updateTime: '2024-12-26 10:00:00',
        oldNavigationTime: null,
        newNavigationTime: 25,
        oldStandardTime: null,
        newStandardTime: 30,
        updateNote: '系统定时同步地图API数据',
        updaterType: 'system',
        updaterName: '系统自动'
      }
    ]
  },
  {
    id: '19',
    route: '春熙路店 → 环球中心店',
    direction: '单向',
    startStore: stores.value[2],
    endStore: stores.value[5],
    navigationTime: 35,
    distance: 32.67,
    standardTime: 40,
    navigationType: 'cycling',
    planStrategy: 'shortest-time',
    updateStrategy: 'auto',
    lastUpdateType: 'auto',
    lastUpdateTime: '2024-12-26 10:00:00',
    history: [
      {
        updateTime: '2024-12-26 10:00:00',
        oldNavigationTime: null,
        newNavigationTime: 35,
        oldStandardTime: null,
        newStandardTime: 40,
        updateNote: '系统定时同步地图API数据',
        updaterType: 'system',
        updaterName: '系统自动'
      }
    ]
  },
  {
    id: '20',
    route: '春熙路店 → 高新区店',
    direction: '单向',
    startStore: stores.value[2],
    endStore: stores.value[6],
    navigationTime: 28,
    distance: 25.34,
    standardTime: 35,
    navigationType: 'cycling',
    planStrategy: 'shortest-time',
    updateStrategy: 'auto',
    lastUpdateType: 'auto',
    lastUpdateTime: '2024-12-26 10:00:00',
    history: [
      {
        updateTime: '2024-12-26 10:00:00',
        oldNavigationTime: null,
        newNavigationTime: 28,
        oldStandardTime: null,
        newStandardTime: 35,
        updateNote: '系统定时同步地图API数据',
        updaterType: 'system',
        updaterName: '系统自动'
      }
    ]
  },
  {
    id: '21',
    route: '春熙路店 → 华阳店',
    direction: '单向',
    startStore: stores.value[2],
    endStore: stores.value[7],
    navigationTime: 40,
    distance: 38.92,
    standardTime: 45,
    navigationType: 'cycling',
    planStrategy: 'shortest-time',
    updateStrategy: 'auto',
    lastUpdateType: 'auto',
    lastUpdateTime: '2024-12-26 10:00:00',
    history: [
      {
        updateTime: '2024-12-26 10:00:00',
        oldNavigationTime: null,
        newNavigationTime: 40,
        oldStandardTime: null,
        newStandardTime: 45,
        updateNote: '系统定时同步地图API数据',
        updaterType: 'system',
        updaterName: '系统自动'
      }
    ]
  }
])

// 计算属性
const filteredStartStores = computed(() => {
  if (!searchForm.city) return stores.value
  return stores.value.filter(store => store.city === searchForm.city)
})

const filteredEndStores = computed(() => {
  if (!searchForm.city) return stores.value
  return stores.value.filter(store => store.city === searchForm.city)
})

// 新增页面门店过滤
const addFilteredStartStores = computed(() => {
  if (!addForm.city) return stores.value
  return stores.value.filter(store => store.city === addForm.city)
})

const addFilteredEndStores = computed(() => {
  if (!addForm.city) return stores.value
  return stores.value.filter(store => store.city === addForm.city)
})

const filteredData = computed(() => {
  let data = [...intervalData.value]

  if (searchForm.city) {
    data = data.filter(item =>
      item.startStore.city === searchForm.city ||
      item.endStore.city === searchForm.city
    )
  }

  if (searchForm.startStore) {
    data = data.filter(item => item.startStore.id === searchForm.startStore)
  }

  if (searchForm.endStore) {
    data = data.filter(item => item.endStore.id === searchForm.endStore)
  }

  total.value = data.length
  return data
})

// 按城市分组的数据（树状结构）
const groupedData = computed(() => {
  const data = filteredData.value
  const cityGroups = {}

  // 先按城市分组，再按门店分组
  data.forEach(item => {
    const cityKey = item.startStore.city
    const storeKey = item.startStore.id

    // 初始化城市组
    if (!cityGroups[cityKey]) {
      cityGroups[cityKey] = {
        cityId: cityKey,
        cityName: getCityLabel(item.startStore.city),
        stores: {},
        storeCount: 0
      }
    }

    // 初始化门店组
    if (!cityGroups[cityKey].stores[storeKey]) {
      cityGroups[cityKey].stores[storeKey] = {
        storeId: item.startStore.id,
        storeName: item.startStore.displayName,
        storeAddress: item.startStore.address,
        routes: [],
        routeCount: 0,
        lastUpdateTime: item.lastUpdateTime
      }
      cityGroups[cityKey].storeCount++
    }

    // 添加路线
    cityGroups[cityKey].stores[storeKey].routes.push(item)
    cityGroups[cityKey].stores[storeKey].routeCount = cityGroups[cityKey].stores[storeKey].routes.length
  })

  // 转换为数组并排序
  const result = Object.values(cityGroups)
  result.sort((a, b) => a.cityName.localeCompare(b.cityName))

  // 转换门店为数组并排序
  result.forEach(city => {
    city.stores = Object.values(city.stores)
    city.stores.sort((a, b) => a.storeName.localeCompare(b.storeName))
  })

  return result
})

// 判断是否可以计算新增路线
const canComputeAddRoute = computed(() => {
  return !!(
    addForm.city &&
    addForm.startStore &&
    addForm.endStore &&
    addForm.navigationType &&
    addForm.planStrategy
  )
})

// 方法
// 城市变更处理（已在上方定义）

// 搜索处理（已在上方定义）

// 重置处理（已在上方定义）

/* const handleApplyStrategy = () => {
  ElMessage.success(`已应用导航策略: ${getNavigationTypeLabel(strategyForm.navigationType)} + ${getPlanStrategyLabel(strategyForm.planStrategy)}`)

  // 提供批量更新选项
  ElMessageBox.confirm(
    '策略已更新，是否立即批量更新所有自动更新策略的数据？',
    '批量更新确认',
    {
      confirmButtonText: '立即更新',
      cancelButtonText: '稍后手动',
      type: 'info',
      distinguishCancelAndClose: true
    }
  ).then(() => {
    handleBatchUpdate()
  }).catch((action) => {
    if (action === 'cancel') {
      ElMessage.info('您可以稍后点击"批量更新耗时"按钮手动更新数据')
    }
  })
} */

// 自动更新相关功能已简化为提示文案，无需复杂配置

// 获取导航方式标签
const getNavigationTypeLabel = (value) => {
  const labels = {
    'walking': '步行',
    'cycling': '骑行',
    'e-bike': '骑电动车',
    'bus': '公交',
    'driving': '驾车'
  }
  return labels[value] || value
}

// 获取方案策略标签
const getPlanStrategyLabel = (value) => {
  const labels = {
    'shortest-distance': '距离最短',
    'shortest-time': '用时最短'
  }
  return labels[value] || value
}

// 获取城市标签
const getCityLabel = (value) => {
  const labels = {
    'chengdu': '成都市',
    'beijing': '北京市',
    'shanghai': '上海市',
    'guangzhou': '广州市',
    'shenzhen': '深圳市'
  }
  return labels[value] || value
}

// 模拟地图API调用
const simulateMapApiCall = async (startStore, endStore, navigationType, planStrategy) => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))

  // 根据导航方式和方案策略计算耗时
  const baseDistance = calculateDistance(
    parseFloat(startStore.latitude),
    parseFloat(startStore.longitude),
    parseFloat(endStore.latitude),
    parseFloat(endStore.longitude)
  )

  // 不同导航方式的速度系数（km/h）
  const speedCoefficients = {
    'walking': 5,      // 步行5km/h
    'cycling': 15,     // 骑行15km/h
    'e-bike': 25,      // 电动车25km/h
    'bus': 20,         // 公交20km/h（包含等车时间）
    'driving': 30      // 驾车30km/h
  }

  const speed = speedCoefficients[navigationType] || 15

  // 计算基础耗时（分钟）
  let navigationTime = Math.round((baseDistance / speed) * 60)

  // 根据方案策略调整
  if (planStrategy === 'shortest-distance') {
    // 距离最短策略可能耗时更长但距离更短
    navigationTime = Math.round(navigationTime * 1.2)
  } else {
    // 用时最短策略
    navigationTime = Math.round(navigationTime * 0.9)
  }

  // 添加随机波动（±10%）
  const variance = Math.random() * 0.2 - 0.1 // -0.1 到 0.1
  navigationTime = Math.round(navigationTime * (1 + variance))

  // 确保最小耗时
  navigationTime = Math.max(navigationTime, 1)

  return navigationTime
}

// 计算两点间距离（公里）
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371 // 地球半径（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// 根据导航耗时推荐标准时间（分桶）
function computeStandardFromNavigation(navigationTime) {
  if (navigationTime <= 10) return 10
  if (navigationTime <= 20) return 20
  if (navigationTime <= 30) return 30
  if (navigationTime <= 40) return 40
  if (navigationTime <= 50) return 50
  return 60
}

const handleBatchUpdate = () => {
  ElMessageBox.confirm(
    `确定要使用当前导航策略（${getNavigationTypeLabel(strategyForm.navigationType)} + ${getPlanStrategyLabel(strategyForm.planStrategy)}）批量更新所有自动更新策略的间隔时间吗？`,
    '批量更新确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      ElMessage.info('正在调用地图API更新数据，请稍候...')

      const autoUpdateItems = intervalData.value.filter(item => item.updateStrategy === 'auto')

      for (const item of autoUpdateItems) {
        const oldNavigationTime = item.navigationTime
        const oldStandardTime = item.standardTime

        // 调用模拟地图API
        const newNavigationTime = await simulateMapApiCall(
          item.startStore,
          item.endStore,
          strategyForm.navigationType,
          strategyForm.planStrategy
        )

        // 计算标准时间（使用分桶规则推荐）
        const newStandardTime = computeStandardFromNavigation(newNavigationTime)

        item.navigationTime = newNavigationTime
        item.standardTime = newStandardTime
        item.navigationType = strategyForm.navigationType
        item.planStrategy = strategyForm.planStrategy
        item.lastUpdateType = 'auto'
        item.lastUpdateTime = new Date().toISOString().slice(0, 19).replace('T', ' ')

        // 添加历史记录（系统自动更新）
        item.history.unshift({
          updateTime: item.lastUpdateTime,
          oldNavigationTime: oldNavigationTime,
          newNavigationTime: item.navigationTime,
          oldStandardTime: oldStandardTime,
          newStandardTime: item.standardTime,
          updateNote: `地图API自动更新 - ${getNavigationTypeLabel(strategyForm.navigationType)} + ${getPlanStrategyLabel(strategyForm.planStrategy)}`,
          updaterType: 'system',
          updaterName: '系统自动',
          updaterId: null
        })
      }

      ElMessage.success(`批量更新完成，共更新 ${autoUpdateItems.length} 条记录`)
    } catch (error) {
      console.error('批量更新失败:', error)
      ElMessage.error('批量更新失败，请重试')
    }
  })
}

// export and新增功能 removed

const computeStandardFromNavigationLocal = (nav) => {
  return computeStandardFromNavigation(Number(nav))
}

// 新增路线逻辑已移除

// handleUpdateTime 方法已移除

// 编辑相关方法已移除

const handleViewHistory = () => {
  // 聚合所有更新历史
  const allHistory = []
  intervalData.value.forEach(item => {
    if (item.history) {
      allHistory.push(...item.history)
    }
  })
  // 按时间降序排序
  allHistory.sort((a, b) => new Date(b.updateTime) - new Date(a.updateTime))
  historyData.value = allHistory
  historyDialogVisible.value = true
}

// 标准时间说明对话框
const standardDetailDialogVisible = ref(false)
const standardDetailData = reactive({
  navigationTime: null,
  standardTime: null,
  note: ''
})

const showStandardDetail = (navigationTime, standardTime) => {
  standardDetailData.navigationTime = navigationTime
  standardDetailData.standardTime = standardTime
  standardDetailData.note = `推荐规则：用时 <=10 =>10；10<用时<=20 =>20；... >50 =>60。当前导航耗时 ${navigationTime} 分钟，推荐 ${standardTime} 分钟。`
  standardDetailDialogVisible.value = true
}

// 标准分桶数据，用于表格展示
const standardBuckets = [
  { range: '用时 <= 10', standard: 10, min: 0, max: 10 },
  { range: '10 < 用时 <= 20', standard: 20, min: 11, max: 20 },
  { range: '20 < 用时 <= 30', standard: 30, min: 21, max: 30 },
  { range: '30 < 用时 <= 40', standard: 40, min: 31, max: 40 },
  { range: '40 < 用时 <= 50', standard: 50, min: 41, max: 50 },
  { range: '50 < 用时 <= 60', standard: 60, min: 51, max: 60 }
]

const bucketRowClass = ({ row }) => {
  const t = Number(standardDetailData.navigationTime) || 0
  if (t >= row.min && t <= row.max) return 'bucket-match'
  return ''
}

const handleHistoryDialogClose = () => {
  historyDialogVisible.value = false
  historyData.value = []
}

// 关闭标准说明对话框
const handleStandardDetailClose = () => {
  standardDetailDialogVisible.value = false
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

// 编辑门店关联
const handleEdit = (row) => {
  currentEditItem.value = row

  // 初始化编辑表单
  editForm.city = row.city
  editForm.startStore = row.storeId
  editForm.endStores = row.routes.map(route => route.endStore.id)
  editForm.navigationType = 'cycling'
  editForm.planStrategy = 'shortest-time'
  editForm.routePairs = row.routes.map(route => ({
    route: `${row.storeName} ↔ ${route.endStore.displayName}`,
    navigationTime: route.navigationTime,
    distance: route.distance,
    standardTime: route.standardTime,
    navigationType: route.navigationType || 'cycling',
    planStrategy: route.planStrategy || 'shortest-time',
    updateStrategy: route.updateStrategy || 'manual',
    routeNote: ''
  }))

  editDialogVisible.value = true
}

const formatDate = (dateStr) => {
  return dateStr
}

// 表单引用已移除

// 生命周期
onMounted(() => {
  total.value = intervalData.value.length
})

// 新增页面数据 & 状态
const addDialogVisible = ref(false)
const addForm = reactive({
  city: 'chengdu',
  startStore: '1',
  endStores: ['2'], // 支持多选终点门店
  // 双向路线策略（默认骑行+用时最短）
  navigationType: 'cycling',
  planStrategy: 'shortest-time',
  // 双向路线数据
  routePairs: [] // 计算后填充：[{route, navigationTime, standardTime, navigationType, planStrategy, updateStrategy, routeNote}]
})
const addRules = {
  city: [{ required: true, message: '请选择城市', trigger: 'change' }],
  startStore: [{ required: true, message: '请选择起始门店', trigger: 'change' }],
  endStores: [{ required: true, message: '请选择至少一个关联门店', trigger: 'change' }]
}
const addFormRef = ref(null)
const addState = ref('idle') // idle | computing | ready

// 编辑页面数据 & 状态
const editDialogVisible = ref(false)
const currentEditItem = ref(null)
const editForm = reactive({
  city: 'chengdu',
  startStore: '1',
  endStores: ['2'], // 支持多选终点门店
  // 双向路线策略（默认骑行+用时最短）
  navigationType: 'cycling',
  planStrategy: 'shortest-time',
  // 双向路线数据
  routePairs: [] // 计算后填充：[{route, navigationTime, standardTime, navigationType, planStrategy, updateStrategy, routeNote}]
})
const editRules = {
  city: [{ required: true, message: '请选择城市', trigger: 'change' }],
  startStore: [{ required: true, message: '请选择起始门店', trigger: 'change' }],
  endStores: [{ required: true, message: '请选择至少一个关联门店', trigger: 'change' }]
}
const editFormRef = ref(null)
const editState = ref('idle') // idle | computing | ready

// 新增页面城市选择处理
const handleAddCityChange = () => {
  addForm.startStore = ''
  addForm.endStore = ''
}

// 获取路线文本描述
const getStoreRouteText = (startStoreId, endStoreId, direction) => {
  if (!startStoreId || !endStoreId) return ''
  const startStore = stores.value.find(s => s.id === startStoreId)
  const endStore = stores.value.find(s => s.id === endStoreId)
  if (!startStore || !endStore) return ''

  if (direction === 'forward') {
    return `${startStore.displayName} → ${endStore.displayName}`
  } else if (direction === 'backward') {
    return `${endStore.displayName} → ${startStore.displayName}`
  }
  return ''
}

const computeAddRoute = async () => {
  if (!addForm.startStore || addForm.endStores.length === 0) {
    ElMessage.error('请选择主门店和至少一个关联门店')
    return
  }

  const startStore = stores.value.find(s => s.id === addForm.startStore)
  if (!startStore) {
    ElMessage.error('主门店信息不完整')
    return
  }

  addState.value = 'computing'
  addForm.routePairs = [] // 清空之前的计算结果

  try {
    // 遍历所有选择的关联门店，批量计算双向路线
    for (const endStoreId of addForm.endStores) {
      // 检查是否选择了相同的门店
      if (addForm.startStore === endStoreId) {
        continue // 跳过自身
      }

      const endStore = stores.value.find(s => s.id === endStoreId)
      if (!endStore) {
        continue // 跳过不存在的门店
      }

      // 计算基础距离
      const distance = calculateDistance(
        parseFloat(startStore.latitude),
        parseFloat(startStore.longitude),
        parseFloat(endStore.latitude),
        parseFloat(endStore.longitude)
      )

      // 调用模拟地图API计算双向路线（使用统一策略）
      const navigationTime = await simulateMapApiCall(
        startStore, 
        endStore, 
        addForm.navigationType, 
        addForm.planStrategy
      )

      // 创建双向路线对
      addForm.routePairs.push({
        route: `${startStore.displayName} ↔ ${endStore.displayName}`,
        navigationTime: navigationTime,
        distance: distance,
        standardTime: computeStandardFromNavigation(navigationTime),
        navigationType: addForm.navigationType,
        planStrategy: addForm.planStrategy,
        updateStrategy: 'manual',
        routeNote: ''
      })
    }

    addState.value = 'ready'
    ElMessage.success(`双向路线计算完成，共计算 ${addForm.routePairs.length} 条路线`)
  } catch (e) {
    console.error('计算失败', e)
    ElMessage.error('计算失败，请重试')
    addState.value = 'idle'
  }
}

const confirmAddRoute = () => {
  if (addForm.routePairs.length === 0) {
    ElMessage.error('请先计算路线')
    return
  }

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const updaterName = sessionStorage.getItem('username') || '管理员'
  const updaterId = sessionStorage.getItem('userId') || sessionStorage.getItem('employeeId') || ''

  const startStore = stores.value.find(s => s.id === addForm.startStore)
  if (!startStore) {
    ElMessage.error('主门店信息不完整')
    return
  }

  const newItems = []

  // 遍历所有计算完成的双向路线，批量保存
  addForm.routePairs.forEach((routePair, index) => {
    // 解析终点门店信息
    const endStoreName = routePair.route.split(' ↔ ')[1]
    const endStore = stores.value.find(s => s.displayName === endStoreName)
    if (!endStore) return

    // 保存双向路线记录（保存为两条单向记录）
    const forwardItem = {
      id: String(Date.now()) + `_forward_${index}`,
      route: `${startStore.displayName} → ${endStore.displayName}`,
      direction: '单向',
      startStore: startStore,
      endStore: endStore,
      navigationTime: Number(routePair.navigationTime),
      distance: routePair.distance,
      standardTime: Number(routePair.standardTime),
      navigationType: routePair.navigationType,
      planStrategy: routePair.planStrategy,
      updateStrategy: routePair.updateStrategy,
      lastUpdateType: 'user',
      lastUpdateTime: now,
      history: [
        {
          updateTime: now,
          oldNavigationTime: null,
          newNavigationTime: Number(routePair.navigationTime),
          oldStandardTime: null,
          newStandardTime: Number(routePair.standardTime),
          updateNote: routePair.routeNote || `新增路线：${startStore.displayName} → ${endStore.displayName}`,
          updaterType: 'user',
          updaterName: `${updaterName}`,
          updaterId: updaterId
        }
      ]
    }

    const backwardItem = {
      id: String(Date.now()) + `_backward_${index}`,
      route: `${endStore.displayName} → ${startStore.displayName}`,
      direction: '单向',
      startStore: endStore,
      endStore: startStore,
      navigationTime: Number(routePair.navigationTime),
      distance: routePair.distance,
      standardTime: Number(routePair.standardTime),
      navigationType: routePair.navigationType,
      planStrategy: routePair.planStrategy,
      updateStrategy: routePair.updateStrategy,
      lastUpdateType: 'user',
      lastUpdateTime: now,
      history: [
        {
          updateTime: now,
          oldNavigationTime: null,
          newNavigationTime: Number(routePair.navigationTime),
          oldStandardTime: null,
          newStandardTime: Number(routePair.standardTime),
          updateNote: routePair.routeNote || `新增路线：${endStore.displayName} → ${startStore.displayName}`,
          updaterType: 'user',
          updaterName: `${updaterName}`,
          updaterId: updaterId
        }
      ]
    }

    newItems.push(forwardItem, backwardItem)
  })

  // 添加到数据列表
  intervalData.value.unshift(...newItems)

  ElMessage.success(`新增双向路线已保存（${newItems.length} 条记录）`)
  addDialogVisible.value = false

  // 重置表单
  Object.assign(addForm, {
    startStore: '1',
    endStores: ['2'],
    navigationType: 'cycling',
    planStrategy: 'shortest-time',
    routePairs: []
  })
}

// 编辑页面城市选择处理
const handleEditCityChange = () => {
  editForm.startStore = ''
  editForm.endStore = ''
}

// 计算编辑路线
const computeEditRoute = async () => {
  if (!editForm.city || !editForm.startStore || editForm.endStores.length === 0) {
    ElMessage.error('请选择城市、起始门店和至少一个关联门店')
    return
  }

  const startStore = stores.value.find(s => s.id === editForm.startStore)
  if (!startStore) {
    ElMessage.error('起始门店信息不完整')
    return
  }

  editState.value = 'computing'
  editForm.routePairs = [] // 清空之前的计算结果

  try {
    // 遍历所有选择的关联门店，批量计算双向路线
    for (const endStoreId of editForm.endStores) {
      // 检查是否选择了相同的门店
      if (editForm.startStore === endStoreId) {
        continue // 跳过自身
      }

      const endStore = stores.value.find(s => s.id === endStoreId)
      if (!endStore) {
        continue // 跳过不存在的门店
      }

      // 计算基础距离
      const distance = calculateDistance(
        parseFloat(startStore.latitude),
        parseFloat(startStore.longitude),
        parseFloat(endStore.latitude),
        parseFloat(endStore.longitude)
      )

      // 调用模拟地图API计算双向路线（使用统一策略）
      const navigationTime = await simulateMapApiCall(
        startStore, 
        endStore, 
        editForm.navigationType, 
        editForm.planStrategy
      )

      // 创建双向路线对
      editForm.routePairs.push({
        route: `${startStore.displayName} ↔ ${endStore.displayName}`,
        navigationTime: navigationTime,
        distance: distance,
        standardTime: computeStandardFromNavigation(navigationTime),
        navigationType: editForm.navigationType,
        planStrategy: editForm.planStrategy,
        updateStrategy: 'manual',
        routeNote: ''
      })
    }

    editState.value = 'ready'
    ElMessage.success(`双向路线计算完成，共计算 ${editForm.routePairs.length} 条路线`)
  } catch (e) {
    console.error('计算失败', e)
    ElMessage.error('计算失败，请重试')
    editState.value = 'idle'
  }
}

// 确认编辑路线
const confirmEditRoute = () => {
  if (editForm.routePairs.length === 0) {
    ElMessage.error('请先计算路线')
    return
  }

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const updaterName = sessionStorage.getItem('username') || '管理员'
  const updaterId = sessionStorage.getItem('userId') || sessionStorage.getItem('employeeId') || ''

  const startStore = stores.value.find(s => s.id === editForm.startStore)
  if (!startStore) {
    ElMessage.error('主门店信息不完整')
    return
  }

  // 更新现有路线数据
  editForm.routePairs.forEach((routePair, index) => {
    // 解析终点门店信息
    const endStoreName = routePair.route.split(' ↔ ')[1]
    const endStore = stores.value.find(s => s.displayName === endStoreName)
    if (!endStore) return

    // 查找并更新现有路线
    const existingRoute = intervalData.value.find(item => 
      item.startStore.id === startStore.id && 
      item.endStore.id === endStore.id
    )

    if (existingRoute) {
      const oldNavigationTime = existingRoute.navigationTime
      const oldStandardTime = existingRoute.standardTime

      existingRoute.navigationTime = Number(routePair.navigationTime)
      existingRoute.distance = routePair.distance
      existingRoute.standardTime = Number(routePair.standardTime)
      existingRoute.navigationType = routePair.navigationType
      existingRoute.planStrategy = routePair.planStrategy
      existingRoute.updateStrategy = routePair.updateStrategy
      existingRoute.lastUpdateType = 'user'
      existingRoute.lastUpdateTime = now

      // 添加历史记录
      existingRoute.history.unshift({
        updateTime: now,
        oldNavigationTime: oldNavigationTime,
        newNavigationTime: Number(routePair.navigationTime),
        oldStandardTime: oldStandardTime,
        newStandardTime: Number(routePair.standardTime),
        updateNote: routePair.routeNote || `编辑路线：${startStore.displayName} → ${endStore.displayName}`,
        updaterType: 'user',
        updaterName: `${updaterName}`,
        updaterId: updaterId
      })
    }
  })

  ElMessage.success(`编辑路线已保存（${editForm.routePairs.length} 条记录）`)
  editDialogVisible.value = false
}
</script>

<style scoped>
.store-interval-page {
  padding: 20px;
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - 80px);
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: hsl(var(--primary));
}

.page-header p {
  margin: 0;
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.strategy-section {
  margin-bottom: 16px;
}

.strategy-section .el-card {
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
}

.auto-update-preview {
  margin-top: 16px;
}

.strategy-section .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-section {
  background-color: var(--el-bg-color);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: var(--el-box-shadow-light);
}

.action-section {
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
}

.table-section {
  background-color: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  overflow: hidden;
}

.pagination-section {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.route-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.route-text {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.direction-tag {
  font-size: 12px;
  color: var(--el-text-color-regular);
  background-color: var(--el-fill-color-light);
  padding: 2px 6px;
  border-radius: 4px;
  width: fit-content;
}

/* 三栏布局样式 */
.three-column-layout {
  display: flex;
  gap: 20px;
  height: calc(100vh - 200px);
}

.column {
  flex: 1;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
}

.column-1 {
  flex: 0 0 200px;
}

.column-2 {
  flex: 0 0 300px;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--el-bg-color-page);
  border-bottom: 1px solid var(--el-border-color);
}

.column-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.selected-city,
.selected-store {
  font-size: 13px;
  color: var(--el-text-color-regular);
}

/* 城市列表样式 */
.city-list {
  padding: 8px;
  overflow-y: auto;
  height: calc(100% - 60px);
}

.city-item {
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.city-item:hover {
  background-color: var(--el-bg-color-hover);
}

.city-item.active {
  background-color: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary);
}

.city-name {
  font-weight: 600;
  color: var(--el-text-color-primary);
  font-size: 16px;
}

.store-count {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin-top: 4px;
}

/* 门店列表样式 */
.store-list {
  padding: 8px;
  overflow-y: auto;
  height: calc(100% - 60px);
}

.store-item {
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.store-item:hover {
  background-color: var(--el-bg-color-hover);
}

.store-item.active {
  background-color: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary);
}

.store-content {
  flex: 1;
  cursor: pointer;
}

.store-name {
  font-weight: 600;
  color: var(--el-text-color-primary);
  font-size: 14px;
}

.store-address {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin-top: 4px;
}

.route-count {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin-top: 4px;
}

.store-actions {
  opacity: 0;
  transition: opacity 0.3s;
}

.store-item:hover .store-actions {
  opacity: 1;
}

/* 关联门店及路线信息样式 */
.related-stores {
  padding: 16px;
  overflow-y: auto;
  height: calc(100% - 60px);
}

.route-item {
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
}

.route-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.route-info {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.distance-info,
.standard-time {
  display: flex;
  align-items: center;
  gap: 4px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.store-coords {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.operation-buttons {
  display: flex;
  gap: 8px;
  white-space: nowrap;
}

.form-tip {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 4px;
}

.update-status {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  gap: 12px;
  color: var(--el-text-color-primary);
}

.update-status .el-icon {
  font-size: 20px;
  color: var(--el-color-primary);
}
.form-tip {
  display: block;
  margin-left: 120px;
  white-space: normal;
}

.readonly-value {
  display: inline-block;
  min-width: 60px;
  padding: 6px 10px;
  background: var(--el-input-bg-color, #fff);
  border: 1px solid var(--el-border, #e6e6e6);
  border-radius: 4px;
  color: var(--el-text-color-primary);
}
.view-standard-btn {
  margin-left: 8px;
  font-size: 13px;
  color: var(--el-color-primary);
}

.store-pair-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.update-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 24px;
  align-items: center;
}

.update-grid .form-item-label {
  text-align: right;
  padding-right: 8px;
  color: var(--el-text-color-regular);
}

/* 更强力的对话框内表单重布局，避免换行并对齐标签与控件 */
.el-dialog .el-form {
  width: 100%;
}
.el-dialog .el-form-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
  box-sizing: border-box;
}
.el-dialog .el-form-item__label {
  width: 160px;
  text-align: right;
  padding-right: 12px;
  box-sizing: border-box;
  font-weight: 500;
  color: var(--el-text-color-regular);
}
.el-dialog .el-form-item__content {
  flex: 1;
}
.el-dialog .el-input-number,
.el-dialog .el-input,
.el-dialog .readonly-value {
  width: 220px;
}
.form-tip-inline {
  display: inline-block;
  margin-left: 12px;
  color: var(--el-text-color-regular);
  font-size: 12px;
}
.dialog-layout {
  display: flex;
  gap: 24px;
  margin-top: 8px;
  margin-bottom: 8px;
}
.dialog-column {
  flex: 1;
}
.current-column .col-title,
.latest-column .col-title {
  font-weight: 600;
  margin-bottom: 8px;
}
.col-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
}
.col-label {
  width: 160px;
  text-align: right;
  color: var(--el-text-color-regular);
}
.col-value {
  flex: 1;
}
.simple-form {
  padding: 8px 0;
}
.simple-row {
  display: flex;
  align-items: center;
  padding: 8px 0;
}
.simple-label {
  width: 140px;
  text-align: right;
  color: var(--el-text-color-regular);
  padding-right: 12px;
  box-sizing: border-box;
}
.simple-control {
  flex: 1;
}

/* 简单布局优化：标签靠右、控件宽度固定，整体更紧凑 */
.simple-row {
  display: grid;
  grid-template-columns: 140px 1fr;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
}
.simple-label {
  text-align: right;
}
.bucket-match {
  background-color: rgba(56, 161, 105, 0.06) !important;
}
.el-table .el-table__body tr.bucket-match td {
  background-color: rgba(56, 161, 105, 0.06) !important;
}



/* 路线策略设置样式 */
.route-strategy-section {
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
  background-color: var(--el-bg-color-page);
}

.route-strategy-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.route-strategy-title {
  font-weight: 600;
  color: hsl(var(--primary));
  font-size: 14px;
}

.route-strategy-desc {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.route-strategy-controls {
  padding-left: 16px;
}

.strategy-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.strategy-label {
  font-size: 13px;
  color: var(--el-text-color-regular);
  min-width: 60px;
}

.strategy-control {
  flex: 1;
  min-width: 140px;
}

/* 紧凑布局样式 */
.compact-row {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  align-items: flex-start;
}

.compact-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.compact-item:first-child {
  flex: 0 0 120px; /* 城市列固定宽度 */
}

.compact-item:nth-child(2) {
  flex: 1; /* 关联门店对占满剩余空间 */
}

.compact-label {
  font-size: 13px;
  color: var(--el-text-color-regular);
  font-weight: 500;
}

.compact-control {
  flex: 1;
}

/* 门店对显示样式 */
.store-pair-display {
  display: flex;
  align-items: center;
  gap: 12px;
}

.store-pair-display .store-info {
  flex: 1;
  min-width: 120px;
}

.bidirectional-arrow {
  font-size: 18px;
  color: #999;
  font-weight: bold;
}

/* 分组表格样式已移除，不再使用展开视图 */

/* 关联门店标签样式 */
.related-stores {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.route-item {
  display: flex;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
  gap: 20px;
}

.route-item:last-child {
  border-bottom: none;
}

.route-info-container {
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
}

.distance-info {
  font-size: 13px;
  color: #666;
  min-width: 120px;
  font-weight: 500;
}

.standard-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #666;
}

.route-info .el-tag {
  margin: 0 4px;
}

.distance-info {
  font-size: 13px;
  color: #666;
}

.route-info .standard-time {
  display: flex;
  align-items: center;
  gap: 4px;
}

.route-pairs-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.route-pair-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 6px;
}

/* 双向路线样式 */
.route-pair-section {
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
  background-color: var(--el-bg-color-page);
}

.route-pair-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.route-direction {
  font-weight: 600;
  color: hsl(var(--primary));
  font-size: 14px;
}

.route-pair-content .simple-row {
  margin-bottom: 12px;
}

.route-pair-content .simple-row:last-child {
  margin-bottom: 0;
}
</style>
