<template>
  <div class="mobile-store-self-offline">
    <!-- 顶部导航 -->
    <div class="top-nav">
      <el-button type="text" @click="goBack" style="color: white;">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <div class="nav-title">自主下线</div>
      <div class="nav-spacer"></div>
    </div>

    <div class="page-content">
      <!-- 自主下线 -->
      <div class="module">
        <div class="module-header">
          <div class="module-title">
            <span class="red-bar"></span>
            自主下线
          </div>
        </div>

        <div class="module-content">
          <div class="duration-row">
            <span class="duration-label">今日服务时长(分钟)：</span>
            <span class="duration-value">{{ todayServiceDuration }}</span>
            <el-button
              type="primary"
              @click="handleSelfOffline"
              :disabled="todayServiceDuration < 480 || isSelfOffline"
              class="offline-btn"
            >
              {{ isSelfOffline ? '已下线' : '我要下线' }}
            </el-button>
          </div>

          <div v-if="isSelfOffline && selfOfflineTime" class="offline-time">
            下线时间：{{ selfOfflineTime }}
          </div>

          <div class="info-block">
            <span class="info-label">注：</span>
            <span class="info-text">当日项目服务时长&gt;=480分钟且已完成订单，可自主下线。自主下线后，所有门店都将下线，不可重新上线。</span>
          </div>
        </div>
      </div>

      <!-- 当前挂店门店及今日暂停挂店单说明 -->
      <div class="module">
        <div class="module-header">
          <div class="module-title">
            <span class="red-bar"></span>
            当前挂店门店及今日暂停挂店单说明
          </div>
        </div>

        <div class="module-content">
          <div class="info-block">
            <p class="info-text">当前挂店门店：展示系统根据您的画像匹配的挂店门店。如因行程冲突无法前往，可点击"<span class="highlight">今日暂停挂店门店接单</span>"，此操作不影响您【主门店】的正常接单。<span class="highlight">仅在当日暂停接收所有挂店门店的订单，次日0点自动恢复挂店单。</span></p>
          </div>
        </div>
      </div>

      <!-- 当前挂店门店 -->
      <div class="module">
        <div class="module-header">
          <div class="module-title">
            <span class="red-bar"></span>
            当前挂店门店
          </div>
        </div>

        <div class="module-content">
          <div class="store-list">
            <div
              class="store-item"
              v-for="store in hangingStores"
              :key="store.id"
            >
              <div class="store-info">
                <div class="store-name">{{ store.name }}</div>
                <div class="store-address">地址：{{ store.address }}</div>
              </div>
              <div class="store-status-tag" :class="{ 'is-online': store.currentStatus === '接单中' }">
                {{ store.currentStatus }}
              </div>
            </div>
          </div>

          <el-button
            type="danger"
            @click="handleBatchOffline"
            :disabled="allStoresOffline"
            class="batch-offline-btn"
          >
            今日暂停挂店门店接单
          </el-button>
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

const todayServiceDuration = ref(482)
const isSelfOffline = ref(false)
const selfOfflineTime = ref(null)

// 已挂店门店
const hangingStores = reactive([
  { id: 1, name: '春熙路店', address: '锦江区春熙路步行街200号', currentStatus: '接单中' },
  { id: 2, name: '环球中心店', address: '高新区环球中心', currentStatus: '接单中' },
  { id: 3, name: '桐梓林店', address: '武侯区桐梓林', currentStatus: '接单中' }
])

const allStoresOffline = computed(() => {
  return hangingStores.every(store => store.currentStatus !== '接单中')
})

const goBack = () => router.back()

const handleSelfOffline = async () => {
  try {
    await ElMessageBox.confirm(
      '下线后所有门店将不可重新上线，确定要自主下线吗？',
      '确认自主下线',
      { confirmButtonText: '确定下线', cancelButtonText: '取消', type: 'warning' }
    )
    isSelfOffline.value = true
    selfOfflineTime.value = new Date().toLocaleString('zh-CN', { hour12: false })
    ElMessage.success('已成功下线')
  } catch (e) {
    // 用户取消
  }
}

const handleBatchOffline = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要暂停所有挂店门店的接单吗？',
      '确认暂停接单',
      { confirmButtonText: '确定暂停', cancelButtonText: '取消', type: 'warning' }
    )
    hangingStores.forEach(store => {
      store.currentStatus = '今日已临时下线'
    })
    ElMessage.success('已暂停所有挂店门店接单')
  } catch (e) {
    // 用户取消
  }
}
</script>

<style scoped>
.mobile-store-self-offline {
  height: 100vh;
  background: #f5f5f5;
  padding-bottom: 20px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.top-nav {
  background: linear-gradient(135deg, #a40035 0%, #7a0026 100%);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  position: sticky;
  top: 0;
  z-index: 10;
}

.nav-title {
  font-size: 17px;
  font-weight: 600;
  flex: 1;
  text-align: center;
}

.nav-spacer {
  width: 32px;
}

.page-content {
  padding: 12px;
}

.module {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  margin-bottom: 12px;
  overflow: hidden;
}

.module-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.module-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 6px;
}

.red-bar {
  display: inline-block;
  width: 3px;
  height: 14px;
  background: #a40035;
  border-radius: 2px;
}

.module-content {
  padding: 16px;
}

.duration-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.duration-label {
  font-size: 14px;
  color: #333;
  flex-shrink: 0;
}

.duration-value {
  font-size: 20px;
  font-weight: 700;
  color: #a40035;
  flex: 1;
}

.offline-btn {
  background: #a40035;
  border-color: #a40035;
}

.offline-btn.is-disabled {
  background: #ccc;
  border-color: #ccc;
}

.offline-time {
  font-size: 13px;
  color: #999;
  margin-bottom: 12px;
}

.info-block {
  font-size: 12px;
  color: #666;
  line-height: 1.7;
}

.info-label {
  font-weight: 600;
  color: #333;
  margin-right: 4px;
}

.info-text {
  color: #666;
}

.highlight {
  color: #a40035;
  font-weight: 600;
}

/* 当前挂店门店 */
.store-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.store-item {
  background: #fafafa;
  border-radius: 6px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.store-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.store-address {
  font-size: 12px;
  color: #999;
}

.store-status-tag {
  font-size: 12px;
  color: #999;
  background: white;
  border: 1px solid #f0f0f0;
  padding: 4px 10px;
  border-radius: 4px;
  white-space: nowrap;
}

.store-status-tag.is-online {
  color: #a40035;
  background: #fff5f8;
  border-color: #ffd6e2;
}

.batch-offline-btn {
  width: 100%;
  background: #a40035;
  border-color: #a40035;
}

.batch-offline-btn.is-disabled {
  background: #ccc;
  border-color: #ccc;
}
</style>
