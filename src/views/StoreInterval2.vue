<template>
  <div class="store-interval-page">
    <div class="page-header">
      <h1>门店路线间隔时间库</h1>
      <p>管理推拿师在不同门店之间的出行耗时数据</p>
    </div>

    <!-- 导航策略配置区域 -->
    <div class="strategy-section">
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>全局导航策略配置</span>
            <el-tag type="info" size="small">默认: 骑行导航 + 用时最短</el-tag>
          </div>
        </template>
        <div class="strategy-section-content">
          <el-form :model="strategyForm" inline>
            <el-form-item label="导航方式">
              <el-select
                v-model="strategyForm.navigationType"
                placeholder="选择导航方式"
                style="width: 140px"
              >
                <el-option label="步行" value="walking" />
                <el-option label="骑行" value="cycling" />
                <el-option label="骑电动车" value="e-bike" />
                <el-option label="公交" value="bus" />
                <el-option label="驾车" value="driving" />
              </el-select>
            </el-form-item>
            <el-form-item label="方案策略">
              <el-select
                v-model="strategyForm.planStrategy"
                placeholder="选择方案策略"
                style="width: 140px"
              >
                <el-option label="距离最短" value="shortest-distance" />
                <el-option label="用时最短" value="shortest-time" />
              </el-select>
            </el-form-item>
            <!-- <el-form-item>
                <el-button type="primary" @click="handleApplyStrategy">
                  <el-icon><Setting /></el-icon>
                  应用策略
                </el-button>
              </el-form-item> -->
          </el-form>

          <!-- 自动更新提示 -->
          <div class="auto-update-hint">
            <el-alert
              title="自动更新说明"
              description="默认每月1号全量更新"
              type="info"
              show-icon
              :closable="false"
              style="margin-top: 16px;"
            />
          </div>
        </div>
      </el-card>
    </div>

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
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <el-table
        :data="filteredData"
        stripe
        style="width: 100%"
        :max-height="600"
      >
      <el-table-column prop="startStore.city" label="城市" width="100">
          <template #default="scope">
            <el-tag size="small">{{ getCityLabel(scope.row.startStore.city) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="route" label="双向路线" width="200">
          <template #default="scope">
            <div class="route-info">
              <span class="route-text">{{ scope.row.route }}</span>
              <el-tag size="small" type="info" style="margin-left: 8px;">双向</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="route" label="关联门店" width="280">
          <template #default="scope">
            <div class="store-pair-display">
              <div class="store-info">
                <div class="store-name">{{ scope.row.startStore.displayName }}</div>
                <div class="store-address">{{ scope.row.startStore.address }}</div>
              </div>
              <span class="bidirectional-arrow">↔</span>
              <div class="store-info">
                <div class="store-name">{{ scope.row.endStore.displayName }}</div>
                <div class="store-address">{{ scope.row.endStore.address }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="navigationStrategy" label="导航策略" width="140">
          <template #default="scope">
            <el-tag size="small" type="success">
              {{ getNavigationTypeLabel(scope.row.navigationType || strategyForm.navigationType) }}
            </el-tag>
            <br>
            <el-tag size="small" type="info" style="margin-top: 4px;">
              {{ getPlanStrategyLabel(scope.row.planStrategy || strategyForm.planStrategy) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="distance" label="距离(km)" width="120">
          <template #default="scope">
            {{ scope.row.distance ? scope.row.distance.toFixed(2) : 'N/A' }}
          </template>
        </el-table-column>

        <el-table-column prop="navigationTime" label="导航耗时(分钟)" width="130">
          <template #default="scope">
            {{ scope.row.navigationTime }}
          </template>
        </el-table-column>

        <el-table-column prop="standardTime" label="标准间隔时间(分钟)" width="150">
          <template #default="scope">
            <el-tag type="success">{{ scope.row.standardTime }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="lastUpdateType" label="更新方式" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.lastUpdateType === 'auto' ? 'success' : 'warning'">
              {{ scope.row.lastUpdateType === 'auto' ? '自动' : '手动' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="lastUpdateTime" label="最后更新时间" width="160">
          <template #default="scope">
            {{ formatDate(scope.row.lastUpdateTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button size="small" type="primary" @click="handleUpdateTime(scope.row)">
                <el-icon><Edit /></el-icon>
                更新
              </el-button>
              <el-button size="small" @click="handleViewHistory(scope.row)">
                <el-icon><Clock /></el-icon>
                历史
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-section">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 更新耗时对话框 -->
    <el-dialog
      v-model="updateDialogVisible"
      title="更新间隔时间"
      width="550px"
      teleported
    >
      <el-form :model="updateForm" :rules="updateRules" ref="updateFormRef">
        <div class="simple-form">
          <div class="simple-row">
            <div class="simple-label">路线</div>
            <div class="simple-control">{{ currentUpdateItem?.route.replace('→', '↔') }}</div>
          </div>

          <div class="simple-row">
            <div class="simple-label">导航策略</div>
            <div class="simple-control" style="display:flex; align-items:center; gap:12px;">
              <el-select v-model="updateForm.navigationType" style="width:160px">
                <el-option label="步行" value="walking"></el-option>
                <el-option label="骑行" value="cycling"></el-option>
                <el-option label="骑电动车" value="e-bike"></el-option>
                <el-option label="公交" value="bus"></el-option>
                <el-option label="驾车" value="driving"></el-option>
              </el-select>
              <el-select v-model="updateForm.planStrategy" style="width:160px">
                <el-option label="距离最短" value="shortest-distance"></el-option>
                <el-option label="用时最短" value="shortest-time"></el-option>
              </el-select>
            </div>
          </div>

          <div v-if="updateDialogState !== 'view'">
            <div class="simple-row">
              <div class="simple-label">当前距离</div>
              <div class="simple-control">{{ currentUpdateItem?.distance ? currentUpdateItem?.distance.toFixed(2) : 'N/A' }} km</div>
            </div>

            <div class="simple-row">
              <div class="simple-label">当前导航耗时</div>
              <div class="simple-control">{{ currentUpdateItem?.navigationTime }} 分钟</div>
            </div>

            <div class="simple-row">
              <div class="simple-label">新距离</div>
              <div class="simple-control">
                <span class="readonly-value">{{ updateForm.distance ? updateForm.distance.toFixed(2) : 'N/A' }} km</span>
                <span class="form-tip-inline">基于地图API实时计算</span>
              </div>
            </div>

            <div class="simple-row">
              <div class="simple-label">新导航耗时</div>
              <div class="simple-control">
                <span class="readonly-value">{{ updateForm.navigationTime }} 分钟</span>
                <span class="form-tip-inline">基于地图API实时计算</span>
              </div>
            </div>

            <div class="simple-row">
              <div class="simple-label">新标准时间</div>
              <div class="simple-control">
                <el-input-number
                  v-model="updateForm.standardTime"
                  :min="1"
                  :max="300"
                  controls-position="right"
                  :disabled="updateDialogState === 'updating'"
                />
                <el-button type="text" class="view-standard-btn" @click="showStandardDetail(updateForm.navigationTime, updateForm.standardTime)">查看依据</el-button>
                <div class="form-tip-inline">建议范围: 导航耗时的110%-150%</div>
              </div>
            </div>

            <div class="simple-row">
              <div class="simple-label">更新策略</div>
              <div class="simple-control">
                <el-radio-group v-model="updateForm.updateStrategy">
                  <el-radio label="manual">手动更新</el-radio>
                  <el-radio label="auto">自动更新</el-radio>
                </el-radio-group>
                <div class="form-tip-inline">自动更新将定期调用地图API</div>
              </div>
            </div>

            <div class="simple-row">
              <div class="simple-label">更新说明</div>
              <div class="simple-control">
                <el-input
                  v-model="updateForm.updateNote"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入更新说明"
                  :disabled="updateDialogState === 'updating'"
                />
              </div>
            </div>
          </div>
        </div>
      </el-form>

      <!-- 更新状态提示 -->
      <div v-if="updateDialogState === 'updating'" class="update-status">
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
        <span>正在获取地图数据，请稍候...</span>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="updateDialogVisible = false">取消</el-button>
          <el-button
            v-if="updateDialogState !== 'updating'"
            type="primary"
            @click="handleStartUpdate"
          >
            {{ updateDialogState === 'view' ? '开始更新' : '重新更新' }}
          </el-button>
          <el-button
            v-if="updateDialogState === 'ready'"
            type="primary"
            @click="handleConfirmUpdate"
          >
            确认保存
          </el-button>
        </span>
      </template>
    </el-dialog>

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
                    placeholder="选择门店"
                    clearable
                    filterable
                    style="width: 160px; margin-right: 8px;"
                    :disabled="!addForm.city"
                  >
                    <el-option v-for="s in addFilteredStartStores" :key="s.id" :label="s.displayName" :value="s.id" />
                  </el-select>
                  <span style="margin: 0 8px; font-size: 18px; color: #999;">↔</span>
                  <el-select
                    v-model="addForm.endStore"
                    placeholder="选择门店"
                    clearable
                    filterable
                    style="width: 160px;"
                    :disabled="!addForm.city"
                  >
                    <el-option v-for="s in addFilteredEndStores" :key="s.id" :label="s.displayName" :value="s.id" />
                  </el-select>
                </div>
              </div>
            </div>
          </div>

          <!-- 双向路线导航策略设置 -->
          <div style="margin-top: 12px; margin-bottom: 8px;">
            <el-divider>双向路线导航策略设置</el-divider>
          </div>

          <!-- 双向路线策略 -->
          <div class="route-strategy-section">
            <div class="route-strategy-header">
              <span class="route-strategy-title">双向路线</span>
              <span class="route-strategy-desc">{{ getStoreRouteText(addForm.startStore, addForm.endStore, 'bidirectional') }}</span>
            </div>
            <div class="route-strategy-controls">
              <div class="strategy-row">
                <div class="strategy-label">导航方式</div>
                <div class="strategy-control">
                  <el-select v-model="addForm.navigationType" style="width:140px">
                    <el-option label="步行" value="walking" />
                    <el-option label="骑行" value="cycling" />
                    <el-option label="骑电动车" value="e-bike" />
                    <el-option label="公交" value="bus" />
                    <el-option label="驾车" value="driving" />
                  </el-select>
                </div>
                <div class="strategy-label">方案策略</div>
                <div class="strategy-control">
                  <el-select v-model="addForm.planStrategy" style="width:140px">
                    <el-option label="距离最短" value="shortest-distance" />
                    <el-option label="用时最短" value="shortest-time" />
                  </el-select>
                </div>
              </div>
            </div>
          </div>

          <!-- 点击计算后显示的双向路线详情 -->
          <template v-if="addForm.routePair">
            <div style="margin-top: 16px; margin-bottom: 8px;">
              <el-divider>双向路线详情</el-divider>
            </div>

            <div class="route-pair-section">
              <div class="route-pair-header">
                <span class="route-direction">{{ addForm.routePair.route }}</span>
                <el-tag size="small" type="info">{{ getNavigationTypeLabel(addForm.routePair.navigationType) }} + {{ getPlanStrategyLabel(addForm.routePair.planStrategy) }}</el-tag>
              </div>

              <div class="route-pair-content">
                <div class="simple-row">
                  <div class="simple-label">距离</div>
                  <div class="simple-control">
                    <span class="readonly-value">{{ addForm.routePair.distance ? addForm.routePair.distance.toFixed(2) : 'N/A' }} km</span>
                    <span class="form-tip-inline">基于地图API实时计算</span>
                  </div>
                </div>

                <div class="simple-row">
                  <div class="simple-label">导航耗时</div>
                  <div class="simple-control">
                    <span class="readonly-value">{{ addForm.routePair.navigationTime }} 分钟</span>
                    <span class="form-tip-inline">基于地图API实时计算</span>
                  </div>
                </div>

                <div class="simple-row">
                  <div class="simple-label">标准时间</div>
                  <div class="simple-control">
                    <el-input-number v-model="addForm.routePair.standardTime" :min="1" :max="999" controls-position="right" style="width: 120px;" />
                    <el-button type="text" class="view-standard-btn" @click="showStandardDetail(addForm.routePair.navigationTime, addForm.routePair.standardTime)">查看依据</el-button>
                    <div class="form-tip-inline">建议：系统会根据导航耗时推荐</div>
                  </div>
                </div>

                <div class="simple-row">
                  <div class="simple-label">更新策略</div>
                  <div class="simple-control">
                    <el-radio-group v-model="addForm.routePair.updateStrategy">
                      <el-radio label="manual">手动更新</el-radio>
                      <el-radio label="auto">自动更新</el-radio>
                    </el-radio-group>
                    <div class="form-tip-inline">自动更新将定期调用地图API</div>
                  </div>
                </div>

                <div class="simple-row">
                  <div class="simple-label">路线说明</div>
                  <div class="simple-control">
                    <el-input v-model="addForm.routePair.routeNote" type="textarea" :rows="2" placeholder="请输入路线说明" />
                  </div>
                </div>
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
          <el-button type="primary" @click="computeAddRoute" :disabled="!addForm.startStore || !addForm.endStore || addState === 'computing'">{{ addState === 'ready' ? '重新计算' : '开始计算' }}</el-button>
          <el-button type="primary" @click="confirmAddRoute" :disabled="!addForm.routePair">确认保存</el-button>
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

    <!-- 新增门店路线功能已移除 -->

    <!-- 历史记录对话框 -->
    <el-dialog
      v-model="historyDialogVisible"
      title="数据更新历史"
      width="800px"
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
        <el-table-column prop="oldNavigationTime" label="原导航耗时(分钟)" width="140">
          <template #default="scope">
            {{ scope.row.oldNavigationTime || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="newNavigationTime" label="新导航耗时(分钟)" width="140">
          <template #default="scope">
            {{ scope.row.newNavigationTime }}
          </template>
        </el-table-column>
        <el-table-column prop="oldStandardTime" label="原标准时间(分钟)" width="140">
          <template #default="scope">
            {{ scope.row.oldStandardTime || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="newStandardTime" label="新标准时间(分钟)" width="140">
          <template #default="scope">
            {{ scope.row.newStandardTime }}
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

const updateForm = reactive({
  navigationTime: null,
  distance: null,
  standardTime: null,
  navigationType: strategyForm.navigationType,
  planStrategy: strategyForm.planStrategy,
  updateStrategy: 'manual',
  updateNote: ''
})

const updateDialogVisible = ref(false)
const historyDialogVisible = ref(false)
const currentUpdateItem = ref(null)
const historyData = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 更新对话框状态
const updateDialogState = ref('view') // 'view' | 'updating' | 'ready'
const updateFormOriginal = reactive({
  navigationTime: null,
  distance: null,
  standardTime: null
})

// 策略配置已简化，无需标签页切换

// 表单验证规则
const updateRules = {
  navigationTime: [
    { required: true, message: '请输入导航耗时', trigger: 'blur' }
  ],
  standardTime: [
    { required: true, message: '请输入标准时间', trigger: 'blur' }
  ],
  updateNote: [
    { required: true, message: '请输入更新说明', trigger: 'blur' }
  ]
}

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
  }
])

// 间隔时间数据
const intervalData = ref([
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
      }
    ]
  },
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
  return data.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
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
const handleCityChange = () => {
  // 清空门店选择
  searchForm.startStore = ''
  searchForm.endStore = ''
}

const handleSearch = () => {
  currentPage.value = 1
  // 过滤逻辑在计算属性中处理
}

const handleReset = () => {
  Object.assign(searchForm, {
    city: '',
    startStore: '',
    endStore: ''
  })
  currentPage.value = 1
}

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

const handleUpdateTime = (row) => {
  currentUpdateItem.value = row

  // 重置表单状态
  updateDialogState.value = 'view'
  updateForm.navigationTime = row.navigationTime
  updateForm.distance = row.distance
  updateForm.standardTime = row.standardTime
  updateForm.updateStrategy = row.updateStrategy
  updateForm.navigationType = row.navigationType || strategyForm.navigationType
  updateForm.planStrategy = row.planStrategy || strategyForm.planStrategy
  updateForm.updateNote = ''

  // 保存原始值用于比较
  updateFormOriginal.navigationTime = row.navigationTime
  updateFormOriginal.distance = row.distance
  updateFormOriginal.standardTime = row.standardTime

  updateDialogVisible.value = true
}

const handleStartUpdate = async () => {
  if (!currentUpdateItem.value) return

  updateDialogState.value = 'updating'

  try {
    ElMessage.info('正在调用地图API获取最新导航数据...')

    // 调用地图API获取最新数据
    const newNavigationTime = await simulateMapApiCall(
      currentUpdateItem.value.startStore,
      currentUpdateItem.value.endStore,
      updateForm.navigationType,
      updateForm.planStrategy
    )

    // 自动计算建议的标准时间（分桶推荐）
    const suggestedStandardTime = computeStandardFromNavigation(newNavigationTime)

    // 计算当前策略下的距离
    const currentDistance = calculateDistance(
      parseFloat(currentUpdateItem.value.startStore.latitude),
      parseFloat(currentUpdateItem.value.startStore.longitude),
      parseFloat(currentUpdateItem.value.endStore.latitude),
      parseFloat(currentUpdateItem.value.endStore.longitude)
    )

    updateForm.navigationTime = newNavigationTime
    updateForm.distance = currentDistance
    updateForm.standardTime = suggestedStandardTime
    updateForm.updateNote = `使用 ${getNavigationTypeLabel(updateForm.navigationType)} + ${getPlanStrategyLabel(updateForm.planStrategy)} 策略更新`

    updateDialogState.value = 'ready'
    ElMessage.success('获取最新数据成功，请检查并确认保存')
  } catch (error) {
    console.error('获取导航数据失败:', error)
    ElMessage.error('获取导航数据失败，请重试')
    updateDialogState.value = 'view'
  }
}

const handleConfirmUpdate = async () => {
  try {
    await updateFormRef.value.validate()

    const item = currentUpdateItem.value
    const oldNavigationTime = item.navigationTime
    const oldStandardTime = item.standardTime

    item.navigationTime = updateForm.navigationTime
    item.standardTime = updateForm.standardTime
    item.navigationType = updateForm.navigationType
    item.planStrategy = updateForm.planStrategy
    item.lastUpdateTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
    item.updateStrategy = updateForm.updateStrategy
    item.lastUpdateType = 'manual'

    // 添加历史记录
    const updaterName = sessionStorage.getItem('username') || '管理员'
    const updaterId = sessionStorage.getItem('userId') || sessionStorage.getItem('employeeId') || ''

    item.history.unshift({
      updateTime: item.lastUpdateTime,
      oldNavigationTime: oldNavigationTime,
      newNavigationTime: item.navigationTime,
      oldStandardTime: oldStandardTime,
      newStandardTime: item.standardTime,
      updateNote: updateForm.updateNote || `手动更新 - ${getNavigationTypeLabel(updateForm.navigationType)} + ${getPlanStrategyLabel(updateForm.planStrategy)}`,
      updaterType: 'user',
      updaterName: updaterName,
      updaterId: updaterId
    })

    updateDialogVisible.value = false
    ElMessage.success('更新成功')
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleViewHistory = (row) => {
  historyData.value = row.history
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

const formatDate = (dateStr) => {
  return dateStr
}

// 表单引用
const updateFormRef = ref(null)

// 生命周期
onMounted(() => {
  total.value = intervalData.value.length
})

// 新增页面数据 & 状态
const addDialogVisible = ref(false)
const addForm = reactive({
  city: 'chengdu',
  startStore: '1',
  endStore: '2',
  // 双向路线策略（默认骑行+用时最短）
  navigationType: 'cycling',
  planStrategy: 'shortest-time',
  // 双向路线数据
  routePair: null // 计算后填充：{route, navigationTime, standardTime, navigationType, planStrategy, updateStrategy, routeNote}
})
const addRules = {
  city: [{ required: true, message: '请选择城市', trigger: 'change' }],
  startStore: [{ required: true, message: '请选择起始门店', trigger: 'change' }],
  endStore: [{ required: true, message: '请选择终点门店', trigger: 'change' }]
}
const addFormRef = ref(null)
const addState = ref('idle') // idle | computing | ready

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
  if (!addForm.startStore || !addForm.endStore) {
    ElMessage.error('请选择起始与终点门店')
    return
  }

  // 检查是否选择了相同的门店
  if (addForm.startStore === addForm.endStore) {
    ElMessage.error('起始门店和终点门店不能相同')
    return
  }

  const startStore = stores.value.find(s => s.id === addForm.startStore)
  const endStore = stores.value.find(s => s.id === addForm.endStore)

  if (!startStore || !endStore) {
    ElMessage.error('门店信息不完整')
    return
  }

  addState.value = 'computing'

  try {
    // 计算双向路线，使用统一的导航策略
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

    // 创建双向路线对（只显示一条双向路线）
    addForm.routePair = {
      route: `${startStore.displayName} ↔ ${endStore.displayName}`,
      navigationTime: navigationTime,
      distance: distance,
      standardTime: computeStandardFromNavigation(navigationTime),
      navigationType: addForm.navigationType,
      planStrategy: addForm.planStrategy,
      updateStrategy: 'manual',
      routeNote: ''
    }

    addState.value = 'ready'
    ElMessage.success('双向路线计算完成')
  } catch (e) {
    console.error('计算失败', e)
    ElMessage.error('计算失败，请重试')
    addState.value = 'idle'
  }
}

const confirmAddRoute = () => {
  if (!addForm.routePair) {
    ElMessage.error('请先计算路线')
    return
  }

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const updaterName = sessionStorage.getItem('username') || '管理员'
  const updaterId = sessionStorage.getItem('userId') || sessionStorage.getItem('employeeId') || ''

  // 保存双向路线记录（保存为两条单向记录）
  const startStore = stores.value.find(s => s.id === addForm.startStore)
  const endStore = stores.value.find(s => s.id === addForm.endStore)
  
  const newItems = [
    {
      id: String(Date.now()) + '_forward',
      route: `${startStore.displayName} → ${endStore.displayName}`,
      direction: '单向',
      startStore: startStore,
      endStore: endStore,
      navigationTime: Number(addForm.routePair.navigationTime),
      distance: addForm.routePair.distance,
      standardTime: Number(addForm.routePair.standardTime),
      navigationType: addForm.routePair.navigationType,
      planStrategy: addForm.routePair.planStrategy,
      updateStrategy: addForm.routePair.updateStrategy,
      lastUpdateType: 'user',
      lastUpdateTime: now,
      history: [
        {
          updateTime: now,
          oldNavigationTime: null,
          newNavigationTime: Number(addForm.routePair.navigationTime),
          oldStandardTime: null,
          newStandardTime: Number(addForm.routePair.standardTime),
          updateNote: addForm.routePair.routeNote || `新增路线：${startStore.displayName} → ${endStore.displayName}`,
          updaterType: 'user',
          updaterName: `${updaterName}`,
          updaterId: updaterId
        }
      ]
    },
    {
      id: String(Date.now()) + '_backward',
      route: `${endStore.displayName} → ${startStore.displayName}`,
      direction: '单向',
      startStore: endStore,
      endStore: startStore,
      navigationTime: Number(addForm.routePair.navigationTime),
      distance: addForm.routePair.distance,
      standardTime: Number(addForm.routePair.standardTime),
      navigationType: addForm.routePair.navigationType,
      planStrategy: addForm.routePair.planStrategy,
      updateStrategy: addForm.routePair.updateStrategy,
      lastUpdateType: 'user',
      lastUpdateTime: now,
      history: [
        {
          updateTime: now,
          oldNavigationTime: null,
          newNavigationTime: Number(addForm.routePair.navigationTime),
          oldStandardTime: null,
          newStandardTime: Number(addForm.routePair.standardTime),
          updateNote: addForm.routePair.routeNote || `新增路线：${endStore.displayName} → ${startStore.displayName}`,
          updaterType: 'user',
          updaterName: `${updaterName}`,
          updaterId: updaterId
        }
      ]
    }
  ]

  // 添加到数据列表
  intervalData.value.unshift(...newItems)

  ElMessage.success(`新增双向路线已保存（${newItems.length} 条记录）`)
  addDialogVisible.value = false

  // 重置表单
  Object.assign(addForm, {
    startStore: '1',
    endStore: '2',
    navigationType: 'cycling',
    planStrategy: 'shortest-time',
    routePair: null
  })
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

.store-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.store-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.store-address {
  font-size: 12px;
  color: var(--el-text-color-regular);
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
