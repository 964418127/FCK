<template>
  <div class="schedule-strategy-list">
    <div class="page-head">
      <div>
        <h2>排班策略</h2>
        <p class="page-sub">一条策略 = 10 个槽位的一组取值；岗位是参数取值，不是分支。列表里每条策略都是配置出来的，新岗位（如产品经理）只是再配一条。</p>
      </div>
      <el-button type="primary" @click="onCreate">新增策略</el-button>
    </div>

    <div class="filter-bar">
      <el-select v-model="filterPosition" clearable placeholder="全部岗位" style="width: 150px">
        <el-option v-for="p in positions" :key="p" :label="p" :value="p" />
      </el-select>
      <el-select v-model="filterCoop" clearable placeholder="全部合作性质" style="width: 150px">
        <el-option v-for="c in cooperations" :key="c" :label="c" :value="c" />
      </el-select>
      <el-select v-model="filterEnabled" clearable placeholder="全部状态" style="width: 130px">
        <el-option label="已启用" :value="true" />
        <el-option label="已停用" :value="false" />
      </el-select>
    </div>

    <el-table :data="filteredList" border>
      <el-table-column label="策略名称" min-width="210">
        <template #default="{ row }">
          <div class="name-cell">
            <span class="strategy-name">{{ row.name }}</span>
          </div>
          <div class="cell-sub">{{ row.id }}</div>
        </template>
      </el-table-column>
      <el-table-column label="适用人群" width="140">
        <template #default="{ row }">
          {{ row.position }} · {{ row.cooperation }}
        </template>
      </el-table-column>
      <el-table-column label="生效范围" min-width="190">
        <template #default="{ row }">
          {{ scopeSummary(row) }}
        </template>
      </el-table-column>
      <el-table-column label="生成计划" min-width="200">
        <template #default="{ row }">
          {{ triggerSummary(row) }}
        </template>
      </el-table-column>
      <el-table-column label="承接顺位" width="150">
        <template #default="{ row }">
          {{ assignSummary(row) }}
        </template>
      </el-table-column>
      <el-table-column label="缺口响应" width="90" align="center">
        <template #default="{ row }">
          {{ row.gapRules.length }} 条
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-switch v-model="row.enabled" />
        </template>
      </el-table-column>
      <el-table-column prop="updatedAt" label="更新时间" width="150" />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="goDetail(row)">配置</el-button>
          <el-button link @click="onCopy(row)">复制</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { POSITIONS, COOPERATIONS, triggerSummary, scopeSummary, assignSummary } from '../mock/scheduleStrategies.js'
import { strategyList, createStrategy, copyStrategy } from '../mock/scheduleStrategyStore.js'

const router = useRouter()
const positions = POSITIONS
const cooperations = COOPERATIONS

const filterPosition = ref(null)
const filterCoop = ref(null)
const filterEnabled = ref(null)

const filteredList = computed(() => strategyList.filter(s =>
  (!filterPosition.value || s.position === filterPosition.value) &&
  (!filterCoop.value || s.cooperation === filterCoop.value) &&
  (filterEnabled.value === null || filterEnabled.value === undefined || s.enabled === filterEnabled.value)
))

const goDetail = (row) => router.push({ name: 'schedule-strategy-detail', params: { id: row.id } })

const onCreate = () => {
  const s = createStrategy()
  ElMessage.success(`已创建 ${s.id}，请完成槽位配置后启用`)
  router.push({ name: 'schedule-strategy-detail', params: { id: s.id } })
}

const onCopy = (row) => {
  const copy = copyStrategy(row.id)
  if (copy) ElMessage.success(`已复制为 ${copy.id}（默认停用）`)
}</script>

<style scoped>
.schedule-strategy-list {
  padding: 16px;
}
.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}
.page-head h2 {
  margin: 0 0 4px;
  font-size: 18px;
}
.page-sub {
  margin: 0;
  color: #888;
  font-size: 13px;
}
.filter-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}
.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
.strategy-name {
  font-weight: 500;
}
.cell-sub {
  color: #aaa;
  font-size: 12px;
  margin-top: 2px;
}
</style>
