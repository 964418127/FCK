<template>
  <div class="approval-rules">
    <div class="page-header">
      <div class="header-main">
        <h1>审核规则</h1>
        <el-tag type="warning" effect="plain" size="small">预研稿 · 非结论</el-tag>
        <el-tag type="success" effect="plain" size="small">配置层 · P0</el-tag>
      </div>
      <p class="tip">
        固定假默认走自动审核，<strong>部分城市或门店可以单独关掉</strong>，关掉后该层走人工。
        规则遵循「继承优先 + 局部覆盖」，且覆盖方向锁定为<strong>单向收紧</strong> ——
        向下只会更严、不会更松，避免规则碎片化。
      </p>
    </div>

    <div class="rule-layout">
      <!-- 左：假种规则列表 -->
      <aside class="rule-side">
        <div class="side-head">假种规则</div>
        <div class="rule-list">
          <div
            v-for="r in ruleList"
            :key="r.leaveTypeId"
            class="rule-item"
            :class="{ active: r.leaveTypeId === currentId }"
            @click="selectRule(r.leaveTypeId)"
          >
            <div class="rule-name">{{ typeName(r.leaveTypeId) }}</div>
            <div class="rule-tags">
              <el-tag
                size="small"
                effect="plain"
                :type="r.general.autoApprove ? 'success' : 'warning'"
              >{{ r.general.autoApprove ? '通用 · 自动' : '通用 · 人工' }}</el-tag>
              <span v-if="summary(r)" class="rule-summary">{{ summary(r) }}</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- 右：层级与条件 -->
      <div class="rule-main">
        <!-- 三层继承 -->
        <div class="section-card">
          <div class="card-header">
            <span class="card-title">{{ typeName(currentId) }} · 层级继承</span>
            <span class="card-sub">留空即向上继承；本层改动只有「收紧」一种方向</span>
          </div>

          <div class="layer-row">
            <!-- 通用 -->
            <div class="layer-card base">
              <div class="layer-head">
                <span class="layer-title">通用</span>
                <el-tag size="small" effect="plain" type="info">基准层</el-tag>
              </div>
              <div class="layer-body">
                <div class="switch-row">
                  <span class="switch-label">固定假自动审核</span>
                  <el-switch
                    :model-value="current.general.autoApprove"
                    @change="v => setGeneral(v)"
                  />
                </div>
                <div class="layer-state" :class="current.general.autoApprove ? 'is-auto' : 'is-manual'">
                  {{ current.general.autoApprove ? '自动审核' : '人工审核' }}
                </div>
              </div>
              <div class="layer-foot">所有城市 / 门店的默认值</div>
            </div>

            <!-- 城市 -->
            <div class="layer-card" :class="{ override: cityIsOverride }">
              <div class="layer-head">
                <span class="layer-title">城市</span>
                <el-tag
                  size="small"
                  effect="plain"
                  :type="cityIsOverride ? 'warning' : 'info'"
                >{{ cityIsOverride ? '本层覆盖' : '继承' }}</el-tag>
              </div>
              <div class="layer-body">
                <el-select v-model="city" size="small" style="width: 100%; margin-bottom: 10px;">
                  <el-option v-for="c in ruleCities" :key="c" :label="c" :value="c" />
                </el-select>
                <div class="switch-row">
                  <span class="switch-label">固定假自动审核</span>
                  <el-switch
                    :model-value="cityValue"
                    :disabled="!current.general.autoApprove"
                    @change="v => setCity(v)"
                  />
                </div>
                <div class="layer-state" :class="cityValue ? 'is-auto' : 'is-manual'">
                  {{ cityValue ? '自动审核' : '人工审核' }}
                </div>
              </div>
              <div class="layer-foot">
                <span v-if="!current.general.autoApprove" class="foot-hint">
                  上层已为人工，本层无需配置（不可放宽）
                </span>
                <span v-else-if="cityIsOverride">
                  来源：本层设定
                  <el-button size="small" link type="primary" @click="restoreCity">恢复继承</el-button>
                </span>
                <span v-else>来源：继承自通用层</span>
              </div>
            </div>

            <!-- 门店 -->
            <div class="layer-card" :class="{ override: storeIsOverride }">
              <div class="layer-head">
                <span class="layer-title">门店</span>
                <el-tag
                  size="small"
                  effect="plain"
                  :type="storeIsOverride ? 'warning' : 'info'"
                >{{ storeIsOverride ? '本层覆盖' : '继承' }}</el-tag>
              </div>
              <div class="layer-body">
                <el-select v-model="store" size="small" style="width: 100%; margin-bottom: 10px;">
                  <el-option v-for="s in storeOptions" :key="s" :label="s" :value="s" />
                </el-select>
                <div class="switch-row">
                  <span class="switch-label">固定假自动审核</span>
                  <el-switch
                    :model-value="storeValue"
                    :disabled="!cityValue"
                    @change="v => setStore(v)"
                  />
                </div>
                <div class="layer-state" :class="storeValue ? 'is-auto' : 'is-manual'">
                  {{ storeValue ? '自动审核' : '人工审核' }}
                </div>
              </div>
              <div class="layer-foot">
                <span v-if="!cityValue" class="foot-hint">
                  上层已为人工，本层无需配置（不可放宽）
                </span>
                <span v-else-if="storeIsOverride">
                  来源：本层设定
                  <el-button size="small" link type="primary" @click="restoreStore">恢复继承</el-button>
                </span>
                <span v-else>来源：继承自 {{ city }} 层</span>
              </div>
            </div>
          </div>

          <!-- 生效链路 -->
          <div class="chain-row">
            <span class="chain-badge">生效链路</span>
            <span class="chain-text">{{ chainText }}</span>
            <el-tag
              size="small"
              :type="effectiveAuto ? 'success' : 'danger'"
              effect="dark"
            >最终：{{ effectiveAuto ? '自动审核' : '人工审核' }}</el-tag>
          </div>

          <!-- 冗余覆盖提示 -->
          <el-alert
            v-if="staleOverrides.length"
            type="warning"
            :closable="false"
            show-icon
            class="stale-alert"
          >
            <template #title>
              上层收紧后，以下 {{ staleOverrides.length }} 处覆盖已失效：{{ staleOverrides.join('、') }}
            </template>
          </el-alert>
        </div>

        <!-- 触发原因预览 -->
        <div class="section-card">
          <div class="card-header">
            <span class="card-title">触发原因预览</span>
            <span class="card-sub">审批人需要能一眼分辨「为什么走人工」</span>
          </div>
          <div class="preview-box">
            <div class="preview-line">
              <span class="preview-key">当前场景</span>
              <span>员工 {{ sceneEmployee }} 在「{{ store }}」提交 {{ typeName(currentId) }} 申请</span>
            </div>
            <div class="preview-line">
              <span class="preview-key">审核路径</span>
              <el-tag size="small" effect="plain" :type="effectiveAuto ? 'success' : 'danger'">
                {{ effectiveAuto ? '自动审核' : '人工审核' }}
              </el-tag>
            </div>
            <div class="preview-line">
              <span class="preview-key">触发原因</span>
              <span v-if="effectiveAuto" class="preview-auto">
                全部自动条件满足 → 直接放行，不产生待办
              </span>
              <span v-else>
                <el-tag size="small" type="info" effect="plain">{{ triggerReason.tag }}</el-tag>
                <span class="preview-reason">{{ triggerReason.text }}</span>
              </span>
            </div>
          </div>
          <p class="preview-note">
            区分「配置原因」与「业务原因」的意义：前者审批人只是走形式，后者才需要真正判断。
            两者若在界面上长得一样，审批人就会一直在做无用判断。
          </p>
        </div>

        <!-- 自动通过条件集 -->
        <div class="section-card">
          <div class="card-header">
            <span class="card-title">自动通过条件集</span>
            <span class="card-sub">全部满足才自动通过，任一不满足即转人工</span>
          </div>
          <div class="cond-list">
            <div v-for="c in conditions" :key="c.id" class="cond-item">
              <el-switch v-model="c.enabled" size="small" />
              <div class="cond-main">
                <div class="cond-label">{{ c.label }}</div>
                <div class="cond-desc">{{ c.desc }}</div>
              </div>
            </div>
          </div>
          <p class="preview-note">
            条件集当前为全局配置，作用于所有已开启自动审核的假种。
            是否需要按假种分别配置条件（例如「额度内」只对计额度的假种生效），列为待决事项。
          </p>
        </div>

        <!-- 变更记录 -->
        <div class="section-card">
          <div class="card-header">
            <span class="card-title">配置变更记录</span>
            <span class="card-sub">影响审批工作量的配置改动需可追溯</span>
          </div>
          <el-table :data="changeLogs" size="small">
            <el-table-column prop="time" label="时间" width="150" />
            <el-table-column prop="operator" label="操作人" width="150" />
            <el-table-column prop="scope" label="层级" width="150" />
            <el-table-column prop="target" label="假种" width="90" />
            <el-table-column label="变更" width="200">
              <template #default="{ row }">
                <span class="log-from">{{ row.from }}</span>
                <span class="log-arrow">→</span>
                <span class="log-to">{{ row.to }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="reason" label="原因" min-width="240" show-overflow-tooltip />
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  approvalRules as rawRules,
  autoApproveConditions,
  ruleChangeLogs,
  ruleCities,
  ruleStores,
  findLeaveType
} from '../../mock/leaveAttendance.js'

const ruleList = ref(JSON.parse(JSON.stringify(rawRules)))
const conditions = reactive(autoApproveConditions.map(c => ({ ...c })))
const changeLogs = ref(ruleChangeLogs)

const currentId = ref(ruleList.value[0].leaveTypeId)
const city = ref(ruleCities[0])
const store = ref((ruleStores[ruleCities[0]] || [])[0] || '')

const current = computed(() =>
  ruleList.value.find(r => r.leaveTypeId === currentId.value)
)

const typeName = (id) => {
  const t = findLeaveType(id)
  return t ? t.name : id
}

const storeOptions = computed(() => ruleStores[city.value] || [])

/* ---------- 层级取值 ---------- */
const cityIsOverride = computed(() => !!current.value.city[city.value])

const cityValue = computed(() => {
  const ov = current.value.city[city.value]
  return ov ? ov.autoApprove : current.value.general.autoApprove
})

const storeIsOverride = computed(() => !!current.value.store[store.value])

const storeValue = computed(() => {
  const ov = current.value.store[store.value]
  return ov ? ov.autoApprove : cityValue.value
})

const effectiveAuto = computed(() => storeValue.value)

/* ---------- 设置层级值 ---------- */
const setGeneral = (v) => {
  current.value.general.autoApprove = v
  ElMessage.success(`通用层已设为「${v ? '自动' : '人工'}审核」`)
}

const setCity = (v) => {
  if (!current.value.general.autoApprove && v) {
    ElMessage.warning('上层已为人工审核，本层不可放宽')
    return
  }
  current.value.city[city.value] = { autoApprove: v }
  ElMessage.success(`${city.value} 已${v ? '开启' : '关闭'}自动审核`)
}

const setStore = (v) => {
  if (!cityValue.value && v) {
    ElMessage.warning('上层已为人工审核，本层不可放宽')
    return
  }
  current.value.store[store.value] = { autoApprove: v }
  ElMessage.success(`${store.value} 已${v ? '开启' : '关闭'}自动审核`)
}

const restoreCity = () => {
  delete current.value.city[city.value]
  ElMessage.success(`${city.value} 已恢复继承通用层`)
}

const restoreStore = () => {
  delete current.value.store[store.value]
  ElMessage.success(`${store.value} 已恢复继承 ${city.value} 层`)
}

/* ---------- 派生信息 ---------- */
const chainText = computed(() => {
  const g = current.value.general.autoApprove ? '自动' : '人工'
  const c = cityValue.value ? '自动' : '人工'
  const s = storeValue.value ? '自动' : '人工'
  return `通用 ${g} → ${city.value} ${c}${cityIsOverride.value ? '（本层）' : '（继承）'} → ${store.value} ${s}${storeIsOverride.value ? '（本层）' : '（继承）'}`
})

const staleOverrides = computed(() => {
  const list = []
  if (!current.value.general.autoApprove) {
    Object.keys(current.value.city).forEach(c => list.push(`${c}（城市层覆盖已冗余）`))
  }
  if (!cityValue.value) {
    Object.keys(current.value.store).forEach(s => list.push(`${s}（门店层覆盖已冗余）`))
  }
  return list
})

const summary = (r) => {
  const cityCount = Object.keys(r.city).length
  const storeCount = Object.keys(r.store).length
  const parts = []
  if (cityCount) parts.push(`${cityCount} 城覆盖`)
  if (storeCount) parts.push(`${storeCount} 店覆盖`)
  return parts.join(' · ')
}

const sceneEmployee = ref('李慧敏 · 客户经理')

const triggerReason = computed(() => {
  if (storeIsOverride.value && !storeValue.value) {
    return {
      tag: '配置原因',
      text: `门店「${store.value}」已关闭自动审核，员工提交后直接进入人工审批队列（非业务问题）`
    }
  }
  if (cityIsOverride.value && !cityValue.value) {
    return {
      tag: '配置原因',
      text: `城市「${city.value}」已关闭自动审核，门店「${store.value}」继承该设置`
    }
  }
  if (!current.value.general.autoApprove) {
    return {
      tag: '配置原因',
      text: `通用层将「${typeName(currentId.value)}」设为人工审核（如特殊假种需核验凭证）`
    }
  }
  return { tag: '—', text: '无' }
})

/* ---------- 切换假种 ---------- */
const selectRule = (id) => {
  currentId.value = id
  const r = ruleList.value.find(x => x.leaveTypeId === id)
  const cityKeys = Object.keys(r.city)
  const cityHit = cityKeys.length ? cityKeys[0] : ruleCities[0]
  city.value = cityHit
  const stores = ruleStores[cityHit] || []
  const storeKeys = Object.keys(r.store)
  const storeHit = storeKeys.length ? storeKeys[0] : stores[0]
  store.value = storeHit || ''
}
</script>

<style scoped>
.approval-rules {
  padding: 0;
}

.page-header {
  margin-bottom: 20px;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: hsl(var(--foreground));
}

.page-header .tip {
  color: hsl(var(--muted-foreground));
  font-size: 14px;
  margin: 0;
  line-height: 1.7;
  max-width: 960px;
}

.page-header .tip strong {
  color: hsl(var(--foreground));
  font-weight: 600;
}

/* 布局 */
.rule-layout {
  display: grid;
  grid-template-columns: 236px 1fr;
  gap: 16px;
  align-items: start;
}

.rule-side {
  background: hsl(var(--background));
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  position: sticky;
  top: 0;
}

.side-head {
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--foreground));
  padding: 14px 16px;
  border-bottom: 1px solid hsl(var(--border));
  background: hsl(var(--muted) / 0.5);
}

.rule-list {
  padding: 8px;
}

.rule-item {
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 4px;
  transition: background 0.15s;
  border: 1px solid transparent;
}

.rule-item:hover {
  background: hsl(var(--muted) / 0.6);
}

.rule-item.active {
  background: hsl(var(--primary) / 0.06);
  border-color: hsl(var(--primary) / 0.3);
}

.rule-name {
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--foreground));
  margin-bottom: 6px;
}

.rule-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.rule-summary {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
}

/* 卡片 */
.section-card {
  background: hsl(var(--background));
  border-radius: 8px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
  margin-bottom: 16px;
}

.section-card:last-child {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid hsl(var(--border));
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.card-sub {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

/* 三层卡片 */
.layer-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.layer-card {
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.layer-card.base {
  border-color: hsl(var(--primary) / 0.35);
}

.layer-card.override {
  border-color: hsl(var(--primary) / 0.6);
}

.layer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: hsl(var(--muted) / 0.5);
  border-bottom: 1px solid hsl(var(--border));
}

.layer-card.override .layer-head {
  background: hsl(var(--primary) / 0.06);
}

.layer-title {
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.layer-body {
  padding: 14px;
  flex: 1;
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.switch-label {
  font-size: 13px;
  color: hsl(var(--foreground));
}

.layer-state {
  margin-top: 10px;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.layer-state.is-auto {
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.08);
}

.layer-state.is-manual {
  color: #b8860b;
  background: rgba(184, 134, 11, 0.1);
}

.layer-foot {
  padding: 10px 14px;
  border-top: 1px dashed hsl(var(--border));
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  line-height: 1.6;
  min-height: 44px;
}

.foot-hint {
  color: #b8860b;
}

/* 生效链路 */
.chain-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 12px 14px;
  background: hsl(var(--muted) / 0.5);
  border-radius: 8px;
  flex-wrap: wrap;
}

.chain-badge {
  font-size: 12px;
  font-weight: 600;
  color: hsl(var(--background));
  background: hsl(var(--muted-foreground));
  border-radius: 4px;
  padding: 2px 8px;
  flex-shrink: 0;
}

.chain-text {
  font-size: 13px;
  color: hsl(var(--foreground));
  flex: 1;
  min-width: 320px;
  font-variant-numeric: tabular-nums;
}

.stale-alert {
  margin-top: 12px;
}

/* 触发原因预览 */
.preview-box {
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  padding: 16px;
  background: hsl(var(--muted) / 0.35);
}

.preview-line {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 13px;
  line-height: 1.7;
  color: hsl(var(--foreground));
  margin-bottom: 8px;
}

.preview-line:last-child {
  margin-bottom: 0;
}

.preview-key {
  width: 76px;
  flex-shrink: 0;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
  padding-top: 2px;
}

.preview-auto {
  color: hsl(var(--primary));
}

.preview-reason {
  margin-left: 8px;
  color: hsl(var(--muted-foreground));
}

.preview-note {
  font-size: 12px;
  line-height: 1.7;
  color: hsl(var(--muted-foreground));
  margin: 12px 0 0 0;
  padding-left: 12px;
  border-left: 2px solid hsl(var(--border));
}

/* 条件集 */
.cond-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 10px;
}

.cond-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.cond-main {
  flex: 1;
  min-width: 0;
}

.cond-label {
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--foreground));
  margin-bottom: 3px;
}

.cond-desc {
  font-size: 12px;
  line-height: 1.5;
  color: hsl(var(--muted-foreground));
}

/* 变更记录 */
.log-from {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.log-arrow {
  margin: 0 8px;
  color: hsl(var(--muted-foreground));
}

.log-to {
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--primary));
}

@media (max-width: 1280px) {
  .rule-layout {
    grid-template-columns: 1fr;
  }
  .layer-row {
    grid-template-columns: 1fr;
  }
}
</style>
