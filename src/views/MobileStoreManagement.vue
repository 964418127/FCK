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

    <!-- 锚点导航 -->
    <div class="anchor-nav">
      <a class="anchor-item" :class="{ active: activeAnchor === 'self-offline' }" @click.prevent="scrollTo('self-offline')">自主下线</a>
      <a class="anchor-item" :class="{ active: activeAnchor === 'temp-offline' }" @click.prevent="scrollTo('temp-offline')">临时下线</a>
      <a class="anchor-item" :class="{ active: activeAnchor === 'interval-settings' }" @click.prevent="scrollTo('interval-settings')">接单间隔时间</a>
    </div>
    
    <div class="page-content">
      <!-- 自主下线 -->
      <div class="module" id="self-offline">
        <div class="module-header">
          <div class="module-title">自主下线</div>
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

          <div v-if="isSelfOffline && selfOfflineTime" class="self-offline-time">
            下线时间：{{ selfOfflineTime }}
          </div>
          
          <div v-if="!isSelfOffline" class="self-offline-info">
            <p class="requirement">规则说明</p>
            <ol class="rule-list">
              <li>当日项目服务时长>=480分钟</li>
              <li>自主下线后，所有门店都将下线，不可重新上线</li>
            </ol>
          </div>
        </div>
      </div>
      
      <!-- 临时下线 -->
      <div class="module" id="temp-offline">
        <div class="module-header">
          <div class="module-title">临时下线</div>
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
            </div>
          </div>

          <div class="batch-offline-wrapper">
            <el-button type="danger" @click="handleBatchOffline" :disabled="allStoresOffline" class="batch-offline-btn">
              今日暂停挂店门店接单
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 接单间隔时间 -->
      <div class="module" id="interval-settings">
        <div class="module-header">
          <div class="module-title">接单间隔时间</div>
          <div class="module-tip">
            <el-select v-model="globalCommute" @change="handleGlobalCommuteChange" style="width: 100px;">
              <el-option label="步行" value="walk" />
              <el-option label="骑行" value="bike" />
              <el-option label="驾车" value="car" />
              <el-option label="公共交通" value="transit" />
            </el-select>
          </div>
        </div>

        <div class="module-content">
          <div class="interval-adjust">
            <span class="adjust-label">调整间隔：</span>
            <div class="slider-wrapper">
              <el-slider
                v-model="globalAdjustment"
                :min="-30"
                :max="30"
                :step="10"
                show-stops
                @change="onAdjustmentChange"
              />
            </div>
            <span class="adjust-value">{{ adjustmentLabel }}</span>
          </div>
          <div class="interval-hint">
            <el-icon class="hint-icon"><QuestionFilled /></el-icon>
            最小生效间隔<span class="hint-num">10</span>分钟，最大调整范围<span class="hint-num">±30</span>分钟
          </div>

          <div class="commute-list">
            <div class="commute-item" v-for="store in hangingStores" :key="store.id">
              <div class="commute-info">
                 <div class="commute-name">{{ store.name }}</div>
                 <div class="commute-interval">
                   跨店间隔：<span class="interval-value">{{ store.interval }}分钟</span>
                 </div>
                 <div v-if="store.newInterval" class="new-interval">
                   新跨店间隔：<span class="new-interval-value">{{ store.newInterval }}分钟</span>（<span class="effective-time">{{ store.newEffectiveTime }}生效</span>）
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'


const router = useRouter()

// 今日服务时长
const todayServiceDuration = ref(482)
const isSelfOffline = ref(false)
const selfOfflineTime = ref(null)

// 全局通勤方式
const globalCommute = ref('walk')
const globalBaseInterval = ref(30)
const globalAdjustment = ref(0)
const globalNewEffectiveTime = ref(null)

// 计算最终的新间隔
const globalNewInterval = computed(() => globalBaseInterval.value + globalAdjustment.value)

// 调整值文案
const adjustmentLabel = computed(() => {
  const v = globalAdjustment.value
  if (v > 0) return `增加${v}分钟`
  if (v < 0) return `减少${Math.abs(v)}分钟`
  return '无调整'
})

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
  // 重置调整值为0
  globalAdjustment.value = 0
  // 更新生效时间为次日0点
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  globalNewEffectiveTime.value = tomorrow.toISOString().slice(0, 10) + ' 00:00:00'
  // 更新每个门店的通勤方式和间隔（统一通勤方式）
  hangingStores.value.forEach(store => {
    store.commute = globalCommute.value
    store.interval = getCommuteInterval(globalCommute.value)
    store.newInterval = store.interval
    store.newEffectiveTime = globalNewEffectiveTime.value
  })
  ElMessage.success(`通勤方式已切换为【${getCommuteLabel(globalCommute.value)}】，调整值已重置`)
}

// 获取通勤方式对应的基础间隔
const getCommuteInterval = (commuteType) => {
  const times = { walk: 30, bike: 20, car: 10, transit: 40 }
  return times[commuteType] || 30
}

// 获取通勤方式中文标签
const getCommuteLabel = (commuteType) => {
  const labels = { walk: '步行', bike: '骑行', car: '驾车', transit: '公共交通' }
  return labels[commuteType] || commuteType
}

// 滑块调整间隔时间
const onAdjustmentChange = (val) => {
  if (!globalNewEffectiveTime.value) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    globalNewEffectiveTime.value = tomorrow.toISOString().slice(0, 10) + ' 00:00:00'
  }
  hangingStores.value.forEach(store => {
    const baseInterval = getCommuteInterval(store.commute)
    store.newInterval = baseInterval + val
    store.newEffectiveTime = globalNewEffectiveTime.value
  })
  ElMessage.success(`跨店间隔已调整为${globalNewInterval.value}分钟（${globalNewEffectiveTime.value}生效）`)
}

// 当前锚点
const activeAnchor = ref('self-offline')

// 锚点滚动
const scrollTo = (id) => {
  activeAnchor.value = id
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
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
      selfOfflineTime.value = null
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
      const now = new Date()
      selfOfflineTime.value = now.toLocaleString('zh-CN', { hour12: false })
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
  height: calc(100vh - 116px);
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
.batch-offline-wrapper {
  margin-top: 16px;
}

.batch-offline-btn {
  width: 100%;
}

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

/* 锚点导航 */
.anchor-nav {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #eee;
  overflow-x: auto;
}

.anchor-item {
  flex: 1;
  text-align: center;
  padding: 8px 12px;
  font-size: 13px;
  color: #666;
  background: #f5f5f5;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.anchor-item:hover {
  background: #a40035;
  color: #fff;
}

.anchor-item.active {
  background: #a40035;
  color: #fff;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(164, 0, 53, 0.35);
}

/* 接单间隔时间模块 */
.interval-adjust {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.adjust-label {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

.slider-wrapper {
  flex: 1;
  min-width: 0;
}

.adjust-value {
  font-size: 13px;
  font-weight: 600;
  color: #a40035;
  white-space: nowrap;
  min-width: 68px;
  text-align: right;
}

.interval-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
  margin-top: 12px;
}

.hint-icon {
  font-size: 14px;
  color: #faad14;
}

.hint-num {
  color: #a40035;
  font-weight: 600;
}

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
}

.new-interval {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.new-interval-value {
  font-weight: 600;
  color: #a40035;
}

.effective-time {
  color: #a40035;
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

.self-offline-time {
  text-align: center;
  margin-bottom: 24px;
  font-size: 14px;
  color: #a40035;
  font-weight: 600;
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