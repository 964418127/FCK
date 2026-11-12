<template>
  <div class="config-rule-management">
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="数据对象管理" name="data-object">
        <div v-if="activeTab === 'data-object'" class="tab-placeholder">
          <el-icon :size="32"><Document /></el-icon>
          <p>数据对象管理（开发中）</p>
        </div>
      </el-tab-pane>
      <el-tab-pane label="元数据管理" name="metadata">
        <div v-if="activeTab === 'metadata'" class="tab-placeholder">
          <el-icon :size="32"><Document /></el-icon>
          <p>元数据管理（开发中）</p>
        </div>
      </el-tab-pane>
      <el-tab-pane label="薪酬项配置" name="salary-item">
        <SalaryItemManagement v-if="activeTab === 'salary-item'" :embedded="true" />
      </el-tab-pane>
      <el-tab-pane label="扣缴项配置" name="deduction-item">
        <div v-if="activeTab === 'deduction-item'" class="tab-placeholder">
          <el-icon :size="32"><Document /></el-icon>
          <p>扣缴项配置（开发中）</p>
        </div>
      </el-tab-pane>
      <el-tab-pane label="通用参数配置" name="general-param">
        <GeneralParamManagement v-if="activeTab === 'general-param'" />
      </el-tab-pane>
      <el-tab-pane label="数据源策略配置" name="ds-strategy">
        <StoreSalaryStrategy v-if="activeTab === 'ds-strategy'" :embedded="true" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Document } from '@element-plus/icons-vue'
import SalaryItemManagement from './SalaryItemManagement.vue'
import StoreSalaryStrategy from './StoreSalaryStrategy.vue'
import GeneralParamManagement from './GeneralParamManagement.vue'

const route = useRoute()
const router = useRouter()

// 页签跟着 ?tab 走：数据表配置页返回时能回到「通用参数配置」这一页签
const activeTab = ref(route.query.tab || 'ds-strategy')
watch(() => route.query.tab, (tab) => { if (tab && tab !== activeTab.value) activeTab.value = tab })
watch(activeTab, (tab) => {
  if (route.query.tab === tab) return
  router.replace({ query: { ...route.query, tab } })
})
</script>

<style scoped>
.config-rule-management {
  padding: 16px;
}
.tab-placeholder {
  text-align: center;
  padding: 80px 0;
  color: #999;
}
.tab-placeholder p {
  margin-top: 12px;
  font-size: 14px;
}
</style>
