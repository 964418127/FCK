<template>
  <div class="mobile-store-hanging-new">
    <!-- 顶部导航 -->
    <div class="top-nav">
      <el-button type="text" @click="goBack" style="color: white;">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <div class="nav-title">新挂店管理</div>
      <div class="nav-spacer"></div>
    </div>

    <div class="page-content">
      <!-- 当前所在门店（重新设计） -->
      <div class="current-store-card">
        <div class="card-top">
          <div class="card-icon">
            <el-icon :size="22"><LocationFilled /></el-icon>
          </div>
          <div class="card-info">
            <div class="card-label">当前所在门店</div>
            <div class="card-store-name">{{ therapistState.currentStore }}</div>
          </div>
          <el-button
            type="primary"
            size="small"
            round
            :disabled="!canEdit"
            @click="openEditCurrentStore"
            class="card-edit-btn"
          >
            {{ canEdit ? '修改' : '不可修改' }}
          </el-button>
        </div>
        <div class="card-divider"></div>
        <div class="card-bottom">
          <div class="bottom-row">
            <span class="bottom-label">来源：</span>
            <span class="bottom-value" :class="currentStoreSourceClass">
              {{ currentStoreSourceLabel }}
            </span>
            <span v-if="therapistState.currentStoreUpdatedAt" class="bottom-time">
              {{ therapistState.currentStoreUpdatedAt }}
            </span>
          </div>
          <div class="bottom-row">
            <span class="bottom-label">下一单起算门店：</span>
            <span class="bottom-value highlight">{{ nextStartStore }}</span>
            <span class="bottom-hint">（用于计算跨店间隔）</span>
          </div>
          <div v-if="!canEdit" class="bottom-blocked">
            <el-icon><Lock /></el-icon>
            <span>{{ editBlockedReason }}</span>
          </div>
        </div>
      </div>

      <!-- 跨店通勤设置说明 -->
      <div class="info-card">
        <div class="info-title">
          <span class="red-bar"></span>
          <span>跨店通勤设置说明</span>
        </div>
        <p class="info-text">跨店通勤设置是选择您在门店间通勤常用的交通方式。<span class="highlight">系统将自动计算跨店接单的路程耗时</span>，为您预留足够的赶店时间，避免行程冲突造成的客源和收入损失。</p>
      </div>

      <!-- 跨店通勤设置 -->
      <div class="module">
        <div class="module-header">
          <div class="module-title">
            <span class="red-bar"></span>
            跨店通勤设置
          </div>
        </div>

        <div class="module-content">
          <div class="form-label">选择您到达挂单门店的交通方式：</div>
          <el-select v-model="globalCommute" @change="handleGlobalCommuteChange" style="width: 100%;">
            <el-option label="步行" value="walk" />
            <el-option label="骑行" value="bike" />
            <el-option label="驾车" value="car" />
            <el-option label="公共交通" value="transit" />
          </el-select>

          <div class="form-label slider-label">调整间隔：</div>
          <div class="slider-wrapper">
            <el-slider
              v-model="globalAdjustment"
              :min="-30"
              :max="30"
              :step="10"
              show-stops
              :marks="sliderMarks"
              @change="onAdjustmentChange"
            />
          </div>
          <div class="interval-hint">
            <el-icon class="hint-icon"><QuestionFilled /></el-icon>
            注：最小生效间隔<span class="hint-num">10</span>分钟，最大调整范围<span class="hint-num">±30</span>分钟
          </div>

          <div class="form-divider">根据您的选择，到达挂店的间隔时间如下：</div>

          <div class="commute-list">
            <div
              class="commute-item"
              v-for="store in hangingStores"
              :key="store.id"
            >
              <div class="commute-icon">
                <el-icon><Shop /></el-icon>
              </div>
              <div class="commute-info">
                <div class="commute-name">{{ store.name }}</div>
                <div class="commute-interval">当前跨店间隔：<span class="interval-value">{{ store.interval }}分钟</span></div>
                <div v-if="store.newInterval" class="new-interval">
                  调整后跨店间隔：<span class="new-interval-value">{{ store.newInterval }}分钟</span>（{{ store.newEffectiveTime }}生效）
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改当前所在门店 Sheet -->
    <teleport to="body">
      <transition name="modal-fade">
        <div
          v-if="editCurrentStoreVisible"
          class="modal-overlay"
          @click.self="closeEditCurrentStore"
        >
          <transition name="modal-slide" appear>
            <div v-if="editCurrentStoreVisible" class="modal-bottom-sheet">
              <div class="sheet-handle"></div>
              <div class="sheet-header">
                <el-button type="text" @click="closeEditCurrentStore" class="sheet-back">
                  <el-icon :size="20"><ArrowLeft /></el-icon>
                </el-button>
                <span class="sheet-title">选择当前所在门店</span>
                <el-button type="text" @click="closeEditCurrentStore" class="sheet-close">
                  <el-icon :size="20"><Close /></el-icon>
                </el-button>
              </div>

              <div class="sheet-body">
                <div class="sheet-tip">
                  <el-icon><InfoFilled /></el-icon>
                  <span>{{ sheetTipText }}</span>
                </div>
                <div
                  v-for="store in allStoreOptions"
                  :key="store"
                  class="store-option"
                  :class="{ active: therapistState.currentStore === store }"
                  @click="confirmEditCurrentStore(store)"
                >
                  <div class="store-option-icon">
                    <el-icon><Shop /></el-icon>
                  </div>
                  <div class="store-option-info">
                    <div class="store-option-name">{{ store }}</div>
                    <div class="store-option-sub">{{ getStoreSubText(store) }}</div>
                  </div>
                  <el-icon v-if="therapistState.currentStore === store" class="store-option-check"><Check /></el-icon>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Close, QuestionFilled, Shop, Lock, Check, InfoFilled, LocationFilled } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// ==================== 推拿师状态 ====================
const therapistState = reactive({
  currentStore: '桐梓林店',
  currentStoreSource: 'auto',
  currentStoreUpdatedAt: '2026-07-07 13:50',
  lastOrderStore: '桐梓林店',
  lastOrderEndTime: '2026-07-07 14:30',
  nextBookingStore: '春熙路店',
  nextBookingTime: '2026-07-07 16:00',
  activeOrder: null
})

// 下一单起算门店：当前所在 ≠ 末单 → 用当前所在；否则用末单
const nextStartStore = computed(() => {
  if (therapistState.currentStore && therapistState.currentStore !== therapistState.lastOrderStore) {
    return therapistState.currentStore
  }
  return therapistState.lastOrderStore
})

// 来源标签
const currentStoreSourceLabel = computed(() => {
  if (therapistState.activeOrder) return '服务中'
  return therapistState.currentStoreSource === 'manual' ? '手动设置' : '自动（末单）'
})

const currentStoreSourceClass = computed(() => {
  if (therapistState.activeOrder) return 'is-active'
  return therapistState.currentStoreSource === 'manual' ? 'is-manual' : 'is-auto'
})

// 距离最近预约单（分钟）
const minutesToNextBooking = computed(() => {
  const now = new Date('2026-07-07 14:30')
  const nextTime = new Date(therapistState.nextBookingTime)
  return Math.round((nextTime - now) / 60000)
})

// 是否可修改
// 规则：① 服务中不可 ② 距最近预约单 ≤ 1h 不可 ③ 其它可
const canEdit = computed(() => {
  if (therapistState.activeOrder) return false
  return minutesToNextBooking.value > 60
})

const editBlockedReason = computed(() => {
  if (therapistState.activeOrder) return '当前订单服务中，无法修改所在门店'
  return `距最近预约单仅 ${minutesToNextBooking.value} 分钟（小于 1 小时），无法修改`
})

// ==================== 修改所在门店弹层 ====================
const editCurrentStoreVisible = ref(false)

const sheetTipText = computed(() => {
  if (therapistState.activeOrder) return '当前订单服务中，无法修改'
  if (minutesToNextBooking.value > 60) return '当前 1 小时内没有预约单，可修改当前所在门店'
  return `距最近预约单 ${minutesToNextBooking.value} 分钟（小于 1 小时），本次无法修改`
})

// 弹层中可全选门店（不按时间过滤）
const allStoreOptions = computed(() => hangingStores.map(s => s.name))

const getStoreSubText = (store) => {
  if (store === therapistState.nextBookingStore) return '最近预约单门店'
  if (store === therapistState.lastOrderStore) return '末单所在门店'
  return '常规门店'
}

const openEditCurrentStore = () => {
  if (!canEdit.value) {
    ElMessage.warning(editBlockedReason.value)
    return
  }
  editCurrentStoreVisible.value = true
}

const closeEditCurrentStore = () => {
  editCurrentStoreVisible.value = false
}

const confirmEditCurrentStore = (store) => {
  therapistState.currentStore = store
  therapistState.currentStoreSource = 'manual'
  therapistState.currentStoreUpdatedAt = new Date().toLocaleString('zh-CN', { hour12: false })
  ElMessage.success(`已更新当前所在门店为：${store}`)
  closeEditCurrentStore()
}

// ==================== 跨店通勤设置 ====================
const globalCommute = ref('car')
const globalBaseInterval = ref(30)
const globalAdjustment = ref(-20)
const globalNewEffectiveTime = ref(null)

const sliderMarks = {
  '-30': '-30',
  '-20': '-20',
  '-10': '-10',
  0: '不调整',
  10: '+10',
  20: '+20',
  30: '+30'
}

const hangingStores = reactive([
  { id: 1, name: '春熙路店', address: '锦江区春熙路步行街200号', enabled: true, commute: 'car', interval: 30, newInterval: 10, newEffectiveTime: '2026/01/01 00:00:00' },
  { id: 2, name: '环球中心店', address: '高新区环球中心', enabled: true, commute: 'car', interval: 30, newInterval: 10, newEffectiveTime: '2026/01/01 00:00:00' },
  { id: 3, name: '桐梓林店', address: '武侯区桐梓林', enabled: true, commute: 'car', interval: 30, newInterval: 10, newEffectiveTime: '2026/01/01 00:00:00' }
])

const goBack = () => router.back()

const commuteMap = { walk: 30, bike: 15, car: 10, transit: 20 }
const getCommuteInterval = (c) => commuteMap[c] || 30

const handleGlobalCommuteChange = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  globalNewEffectiveTime.value = tomorrow.toISOString().slice(0, 10).replace(/-/g, '/') + ' 00:00:00'
  const baseInterval = getCommuteInterval(globalCommute.value)
  globalBaseInterval.value = baseInterval
  globalAdjustment.value = 0
  hangingStores.forEach(store => {
    store.commute = globalCommute.value
    store.interval = baseInterval
    store.newInterval = null
    store.newEffectiveTime = null
  })
  ElMessage.success(`已切换为${globalCommute.value === 'walk' ? '步行' : globalCommute.value === 'bike' ? '骑行' : globalCommute.value === 'car' ? '驾车' : '公共交通'}，基础间隔 ${baseInterval} 分钟`)
}

const onAdjustmentChange = (val) => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const effectiveTime = tomorrow.toISOString().slice(0, 10).replace(/-/g, '/') + ' 00:00:00'
  globalNewEffectiveTime.value = effectiveTime
  const newVal = Math.max(10, globalBaseInterval.value + val)
  hangingStores.forEach(store => {
    store.newInterval = newVal
    store.newEffectiveTime = effectiveTime
  })
  if (val > 0) ElMessage.success(`调整后跨店间隔：${newVal} 分钟（${effectiveTime}生效）`)
  else if (val < 0) ElMessage.success(`调整后跨店间隔：${newVal} 分钟（${effectiveTime}生效）`)
  else {
    hangingStores.forEach(store => {
      store.newInterval = null
      store.newEffectiveTime = null
    })
    ElMessage.info('已恢复基础间隔')
  }
}
</script>

<style scoped>
.mobile-store-hanging-new {
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

/* ========== 当前所在门店（重新设计） ========== */
.current-store-card {
  background: linear-gradient(135deg, #fff5f8 0%, #ffffff 100%);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(164, 0, 53, 0.08);
  border: 1px solid #ffd6e2;
}

.card-top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #a40035;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(164, 0, 53, 0.25);
}

.card-info {
  flex: 1;
  min-width: 0;
}

.card-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 2px;
}

.card-store-name {
  font-size: 18px;
  font-weight: 700;
  color: #a40035;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-edit-btn {
  flex-shrink: 0;
  background: #a40035;
  border-color: #a40035;
  font-size: 12px;
  padding: 5px 12px;
}

.card-edit-btn.is-disabled {
  background: #e8e8e8;
  border-color: #e8e8e8;
  color: #999;
}

.card-divider {
  height: 1px;
  background: #ffd6e2;
  margin: 12px 0;
}

.card-bottom {
  font-size: 13px;
}

.bottom-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.bottom-row:last-child {
  margin-bottom: 0;
}

.bottom-label {
  color: #999;
  flex-shrink: 0;
}

.bottom-value {
  color: #333;
  font-weight: 500;
}

.bottom-value.highlight {
  color: #a40035;
  font-weight: 600;
  font-size: 14px;
}

.bottom-value.is-auto {
  color: #999;
  background: white;
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: normal;
}

.bottom-value.is-manual {
  color: #1890ff;
  background: #e6f7ff;
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: normal;
}

.bottom-value.is-active {
  color: white;
  background: #f56c6c;
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: normal;
}

.bottom-time {
  color: #ccc;
  font-size: 11px;
  margin-left: auto;
}

.bottom-hint {
  color: #999;
  font-size: 12px;
}

.bottom-blocked {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
  background: rgba(0, 0, 0, 0.03);
  padding: 6px 10px;
  border-radius: 4px;
  margin-top: 8px;
}

/* ========== 跨店通勤设置说明卡 ========== */
.info-card {
  background: white;
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.info-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.info-card .info-text {
  font-size: 12px;
  color: #666;
  line-height: 1.8;
  margin: 0;
}

.info-card .highlight {
  color: #a40035;
  font-weight: 600;
}

/* ========== 跨店通勤设置模块 ========== */
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

.form-label {
  font-size: 13px;
  color: #333;
  margin-bottom: 8px;
}

.slider-label {
  margin-top: 16px;
}

.slider-wrapper {
  padding: 0 8px;
  margin-bottom: 8px;
}

.interval-hint {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #999;
  background: #fafafa;
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 12px;
}

.hint-icon {
  margin-right: 4px;
}

.hint-num {
  color: #a40035;
  font-weight: 600;
  margin: 0 2px;
}

.form-divider {
  font-size: 13px;
  color: #666;
  padding: 8px 0 12px;
  border-top: 1px dashed #f0f0f0;
  margin-top: 8px;
}

.commute-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.commute-item {
  background: #fafafa;
  border-radius: 6px;
  padding: 12px;
  display: flex;
  gap: 12px;
}

.commute-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #a40035;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.commute-icon .el-icon {
  font-size: 20px;
}

.commute-info {
  flex: 1;
  min-width: 0;
}

.commute-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.commute-interval {
  font-size: 12px;
  color: #666;
}

.interval-value {
  font-weight: 600;
  color: #333;
}

.new-interval {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.new-interval-value {
  color: #a40035;
  font-weight: 600;
}

/* ========== 修改所在门店 Sheet ========== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.modal-bottom-sheet {
  background: #f5f5f5;
  width: 100%;
  max-width: 480px;
  max-height: 80vh;
  border-radius: 16px 16px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sheet-handle {
  width: 36px;
  height: 4px;
  background: #ddd;
  border-radius: 2px;
  margin: 8px auto 4px;
  flex-shrink: 0;
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 12px 12px;
  position: relative;
  flex-shrink: 0;
}

.sheet-back {
  position: absolute;
  left: 8px;
  color: #999;
}

.sheet-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  flex: 1;
  text-align: center;
}

.sheet-close {
  color: #999;
  padding: 4px;
}

.sheet-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 0 16px;
  -webkit-overflow-scrolling: touch;
}

.sheet-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 6px;
  padding: 8px 12px;
  margin: 8px 12px 12px;
  font-size: 12px;
  color: #876800;
  line-height: 1.6;
}

.sheet-tip .el-icon {
  flex-shrink: 0;
}

.store-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: white;
  margin: 0 12px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.store-option:active {
  background: #fafafa;
}

.store-option.active {
  background: #fff5f8;
  border: 1px solid #ffd6e2;
}

.store-option-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fafafa;
  color: #a40035;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.store-option.active .store-option-icon {
  background: #a40035;
  color: white;
}

.store-option-info {
  flex: 1;
  min-width: 0;
}

.store-option-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.store-option.active .store-option-name {
  color: #a40035;
  font-weight: 600;
}

.store-option-sub {
  font-size: 11px;
  color: #999;
}

.store-option.active .store-option-sub {
  color: #a40035;
}

.store-option-check {
  color: #a40035;
  font-size: 20px;
  flex-shrink: 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-slide-enter-active,
.modal-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-slide-enter-from,
.modal-slide-leave-to {
  transform: translateY(100%);
}
</style>
