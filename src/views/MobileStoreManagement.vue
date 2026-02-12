<template>
  <div class="mobile-store-management">
    <!-- 顶部导航 -->
    <div class="top-nav">
      <el-button type="text" @click="goBack" style="color: white;">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <div class="nav-title">挂店管理</div>
      <div class="nav-spacer"></div>
    </div>
    
    <div class="page-content">
      <!-- 自主下线 -->
      <div class="module">
        <div class="module-header">
          <div class="module-title">自主下线</div>
          <div class="module-action">
            <el-tag type="success" v-if="isSelfOffline">已下线</el-tag>
          </div>
        </div>
        
        <div class="module-content">
          <div class="service-duration-circle">
            <div class="circle-inner">
              <div class="duration-number">{{ todayServiceDuration }}</div>
              <div class="duration-unit">分钟</div>
            </div>
          </div>
          
          <div class="offline-button-container">
            <el-button type="primary" @click="handleSelfOffline" :disabled="todayServiceDuration < 480 || isSelfOffline" size="large">
              {{ isSelfOffline ? '已下线' : '我要下线' }}
            </el-button>
          </div>
          
          <div class="self-offline-info">
            <p class="requirement">规则说明</p>
            <ol class="rule-list">
              <li>当日项目服务时长>=480分钟</li>
              <li>自主下线后，所有门店都将下线，不可重新上线</li>
            </ol>
          </div>
        </div>
      </div>
      
      <!-- 临时下线 -->
      <div class="module">
        <div class="module-header">
          <div class="module-title">临时下线</div>
          <div class="module-action">
            <el-button type="danger" @click="handleBatchOffline" :disabled="allStoresOffline" size="small">
              一键下线
            </el-button>
          </div>
        </div>
        
        <div class="module-content">
          <div class="tips">
            <el-tag type="warning" size="small">
              临时下线后今日不可重新上线，次日自动恢复接单
            </el-tag>
          </div>
          
          <div class="store-list">
            <div class="store-item" v-for="store in hangingStores" :key="store.id">
              <div class="store-info">
                <div class="store-name">{{ store.name }}</div>
                <div class="store-address">{{ store.address }}</div>
              </div>
              <div class="store-control">
                 <div class="switch-with-text">
                    <span class="switch-text" :class="store.enabled ? 'active' : 'inactive'">
                      {{ store.enabled ? '接单中' : '已下线' }}
                    </span>
                    <el-switch
                        v-model="store.enabled"
                        :active-value="true"
                        :inactive-value="false"
                        @change="handleStoreSwitch(store)"
                        :active-color="'#a40035'"
                        :inactive-color="'#ccc'"
                        active-text=""
                        inactive-text=""
                      />
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 接单间隔时间 -->
      <div class="module">
        <div class="module-header">
          <div class="module-title">接单间隔时间</div>
          <div class="module-tip">
            <el-select v-model="globalCommute" @change="handleGlobalCommuteChange" style="width: 100px;">
              <el-option label="步行" value="walk" />
              <el-option label="骑行" value="bike" />
              <el-option label="驾车" value="car" />
            </el-select>
          </div>
        </div>
        
        <div class="module-content">
          <div v-if="globalNewInterval" class="global-effective-time">
            <el-tag type="success" size="small">
              新跨店间隔：{{ globalNewInterval }}分钟（{{ globalNewEffectiveTime }}生效）
            </el-tag>
          </div>
          
          <div class="commute-list">
            <div class="commute-item" v-for="store in hangingStores" :key="store.id">
              <div class="commute-info">
                 <div class="commute-name">{{ store.name }}</div>
                 <div class="commute-interval">
                   跨店间隔：<span class="interval-value">{{ store.interval }}分钟</span>
                 </div>
                 <div v-if="store.newInterval" class="new-interval">
                   新跨店间隔：<span class="new-interval-value">{{ store.newInterval }}分钟</span>（{{ store.newEffectiveTime }}生效）
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, ArrowDown } from '@element-plus/icons-vue'

const router = useRouter()

// 今日服务时长
const todayServiceDuration = ref(482)
const isSelfOffline = ref(false)

// 全局通勤方式
const globalCommute = ref('walk')
const globalNewInterval = ref(null)
const globalNewEffectiveTime = ref(null)

// 已挂店门店
const hangingStores = ref([
  { id: 1, name: '春熙路店', address: '锦江区春熙路步行街', enabled: true, commute: 'walk', interval: 30, effectiveTime: '2026-01-26 00:00:00', newInterval: null, newEffectiveTime: null, expanded: false, currentStatus: '接单中' },
  { id: 2, name: '环球中心店', address: '高新区环球中心', enabled: false, commute: 'car', interval: 10, effectiveTime: '2026-01-26 00:00:00', newInterval: null, newEffectiveTime: null, expanded: false, currentStatus: '今日已临时下线' },
  { id: 3, name: '桐梓林店', address: '武侯区桐梓林', enabled: true, commute: 'bike', interval: 15, effectiveTime: '2026-01-26 00:00:00', newInterval: null, newEffectiveTime: null, expanded: false, currentStatus: '接单中' }
])

// 检查是否所有门店都已下线
const allStoresOffline = computed(() => {
  return hangingStores.value.every(store => store.currentStatus !== '接单中')
})

// 返回上一级
const goBack = () => {
  router.back()
}

// 全局切换通勤方式
const handleGlobalCommuteChange = () => {
  // 根据通勤方式更新间隔时间
  const commuteTimes = {
    walk: 30,
    bike: 15,
    car: 10
  }
  // 保存新的间隔时间和生效时间
  globalNewInterval.value = commuteTimes[globalCommute.value]
  // 更新生效时间为次日0点
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  globalNewEffectiveTime.value = tomorrow.toISOString().slice(0, 10) + ' 00:00:00'
  // 更新每个门店的新间隔时间
  hangingStores.value.forEach(store => {
    store.newInterval = globalNewInterval.value
    store.newEffectiveTime = globalNewEffectiveTime.value
  })
  ElMessage.success(`已切换通勤方式，新的跨店间隔时间为${globalNewInterval.value}分钟，次日0点生效`)
}

// 自主下线
const handleSelfOffline = () => {
  if (isSelfOffline.value) {
    // 重新上线
    ElMessageBox.confirm(
      '确认重新上线吗？上线时间将向后收整至最近的5分钟整点。',
      '重新上线',
      {
        confirmButtonText: '确认上线',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      // 上线所有门店
      hangingStores.value.forEach(store => {
        store.enabled = true
        store.currentStatus = '接单中'
      })
      isSelfOffline.value = false
      ElMessage.success('已重新上线')
    }).catch(() => {
      ElMessage.info('已取消上线操作')
    })
  } else {
    // 下线
    ElMessageBox.confirm(
      '确认自主下线吗？下线后所有门店都将下线，可重新上线。',
      '自主下线',
      {
        confirmButtonText: '确认下线',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      // 下线所有门店
      hangingStores.value.forEach(store => {
        store.enabled = false
        store.currentStatus = '今日已临时下线'
      })
      isSelfOffline.value = true
      ElMessage.success('已自主下线，可重新上线')
    }).catch(() => {
      ElMessage.info('已取消下线操作')
    })
  }
}

// 一键下线
const handleBatchOffline = () => {
  ElMessageBox.confirm(
    '确认一键下线所有挂店吗？下线后今日不可重新上线，次日自动恢复。',
    '一键下线',
    {
      confirmButtonText: '确认下线',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    hangingStores.value.forEach(store => {
      if (store.currentStatus === '接单中') {
        store.currentStatus = '今日已临时下线'
      }
      store.enabled = false
    })
    ElMessage.success('已一键下线所有挂店，次日自动恢复')
  }).catch(() => {
    ElMessage.info('已取消下线操作')
  })
}

// 单个门店开关
const handleStoreSwitch = (store) => {
  if (!store.enabled) {
    ElMessageBox.confirm(
      `确认将${store.name}下线吗？下线后今日不可重新上线，次日自动恢复。`,
      '门店下线',
      {
        confirmButtonText: '确认下线',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      store.currentStatus = '今日已临时下线'
      ElMessage.success(`${store.name}已下线，次日自动恢复`)
    }).catch(() => {
      store.enabled = true
      ElMessage.info('已取消下线操作')
    })
  } else {
    store.currentStatus = '接单中'
    ElMessage.success(`${store.name}已恢复接单`)
  }
}
</script>

<style scoped>
.mobile-store-management {
  min-height: 100vh;
  background: #f5f5f5;
  overflow: hidden;
}

.page-content {
  height: calc(100vh - 64px);
  overflow-y: auto;
}

.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, #a40035 0%, #7a0026 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-spacer {
  width: 40px;
}

.nav-title {
  font-size: 18px;
  font-weight: 600;
}

/* 模块样式 */
.module {
  margin: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.module-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.module-action {
  display: flex;
  align-items: center;
}

.module-tip {
  display: flex;
  align-items: center;
}

.module-content {
  padding: 0;
}

.store-setting {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #eee;
}

.store-setting:last-child {
  border-bottom: none;
}

.store-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.store-header .el-icon {
  transition: transform 0.3s ease;
}

.store-header .el-icon.expanded {
  transform: rotate(180deg);
}

.store-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.store-content {
  padding-top: 16px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  font-size: 14px;
  color: #333;
  flex: 1;
}

.setting-value {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
}

.store-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
}

.store-item:last-child {
  border-bottom: none;
}

.store-info {
  flex: 1;
}

.store-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
}

.store-address {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.store-details {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-range {
  font-size: 12px;
  color: #999;
}

/* 临时下线模块 */
.store-list {
  margin-top: 16px;
}

.store-control {
  display: flex;
  align-items: center;
}

.switch-with-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.switch-text {
  font-size: 14px;
  font-weight: 600;
}

.switch-text.active {
  color: #a40035;
}

.switch-text.inactive {
  color: #666;
}

/* 接单间隔时间模块 */
.commute-list {
  margin-top: 16px;
}

.commute-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
}

.commute-item:last-child {
  border-bottom: none;
}

.commute-info {
  flex: 1;
}

.commute-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
}

.commute-interval {
  font-size: 14px;
  color: #666;
}

.interval-value {
  font-weight: 600;
  color: #a40035;
}

.new-interval {
  font-size: 12px;
  color: #67c23a;
  margin-top: 4px;
}

.new-interval-value {
  font-weight: 600;
}

.commute-action {
  display: flex;
  align-items: center;
}

.global-effective-time {
  margin-bottom: 16px;
}

.service-duration-circle {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 160px;
  height: 160px;
  margin: 0 auto 24px auto;
  border-radius: 50%;
  background: linear-gradient(135deg, #a40035 0%, #7a0026 100%);
  box-shadow: 0 8px 16px rgba(164, 0, 53, 0.3);
}

.circle-inner {
  text-align: center;
  color: white;
}

.duration-number {
  font-size: 48px;
  font-weight: 600;
  line-height: 1;
}

.duration-unit {
  font-size: 18px;
  margin-top: 8px;
  opacity: 0.8;
}

.offline-button-container {
  text-align: center;
  margin-bottom: 24px;
}

.self-offline-info {
  margin-top: 16px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
  z-index: 1000;
}

.self-offline-info .requirement {
  font-weight: 600;
  color: #a40035;
  font-size: 16px;
  margin: 0 0 16px 0;
}

.rule-list {
  margin: 0;
  padding-left: 20px;
}

.rule-list li {
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.rule-list li:last-child {
  margin-bottom: 0;
}

.store-setting {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #eee;
}

.store-setting:last-child {
  border-bottom: none;
}

.store-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.store-header .el-icon {
  transition: transform 0.3s ease;
}

.store-header .el-icon.expanded {
  transform: rotate(180deg);
}

.store-content {
  padding-top: 16px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  font-size: 14px;
  color: #333;
  flex: 1;
}

.setting-value {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
}
</style>