<template>
  <div class="guarantee-page">
    <header><h1>收入保底配置</h1><p>非全客户经理</p></header>
    <section class="general-bar" aria-label="通用保底配置">
      <h2>通用保底</h2><strong>{{ money(guaranteeStore.generalAmount) }}<span>元/月</span></strong>
      <span class="general-scope">未配置城市默认使用</span>
      <el-tooltip content="编辑通用保底" placement="top"><el-button :icon="Edit" text aria-label="编辑通用保底" @click="editGeneral" /></el-tooltip>
    </section>
    <div class="configuration-layout">
      <aside class="scope-sidebar" aria-label="配置范围">
        <div class="scope-heading"><span>城市配置</span><el-tooltip content="新增城市" placement="top"><el-button :icon="Plus" text aria-label="新增城市" @click="editCity()" /></el-tooltip></div>
        <el-input v-if="guaranteeStore.cityRules.length" v-model="citySearch" placeholder="搜索城市" clearable :prefix-icon="Search" aria-label="搜索城市" />
        <button v-for="rule in filteredCities" :key="rule.city" :class="['scope-item', { active: selectedCity === rule.city }]" :aria-pressed="selectedCity === rule.city" @click="selectedCity = rule.city"><span>{{ rule.city }}</span><small>{{ money(rule.amount) }} 元/月</small></button>
        <div v-if="voidedCities.length" class="voided-records"><strong>已作废</strong><p v-for="(rule, index) in voidedCities" :key="index">{{ rule.city }} · {{ money(rule.amount) }} 元/月</p></div>
        <p v-if="!filteredCities.length" class="empty-city">{{ citySearch ? '暂无匹配城市' : '暂无城市配置' }}</p>
      </aside>
      <main class="scope-content">
        <section v-if="selectedRule">
          <div class="section-heading"><h2>{{ selectedCity }}城市保底</h2><div class="actions"><el-button :icon="Edit" @click="editCity(selectedRule)">编辑</el-button><el-button :icon="Delete" @click="removeCity">作废城市配置</el-button></div></div>
          <div class="base-amount">{{ money(selectedRule.amount) }}<span>元/月</span></div>
          <div class="store-heading"><h2>门店差异额</h2><el-button type="primary" :icon="Plus" :disabled="!availableStores.length" @click="editStore()">新增门店配置</el-button></div>
          <el-table :data="pagedRows" empty-text="暂无门店配置">
            <el-table-column label="门店" min-width="180"><template #default="{ row }">{{ row.name }}<small>{{ row.code }}</small></template></el-table-column>
            <el-table-column label="门店差异额（元/月）" min-width="175"><template #default="{ row }">+ {{ money(row.amount) }}</template></el-table-column>
            <el-table-column label="最终保底（元/月）" min-width="175"><template #default="{ row }">{{ money(row.total) }}</template></el-table-column>
            <el-table-column label="操作" width="130"><template #default="{ row }"><el-button link type="primary" @click="editStore(row)">编辑</el-button><el-button link type="danger" @click="removeStore(row)">作废</el-button></template></el-table-column>
          </el-table>
          <TablePagination v-model:page="page" v-model:page-size="pageSize" :total="total" />
          <div v-if="voidedStores.length" class="voided-records"><strong>已作废门店配置</strong><p v-for="(row, index) in voidedStores" :key="index">{{ row.name }} · +{{ money(row.amount) }} 元/月</p></div>
        </section>
        <el-empty v-else description="暂无城市配置" :image-size="70" />
      </main>
    </div>
    <el-dialog v-model="generalOpen" title="通用保底" width="min(460px, 94vw)">
      <el-form label-width="100px"><el-form-item label="保底金额"><el-input-number v-model="generalAmount" :min="0" :precision="2" controls-position="right" aria-label="通用保底金额" /><span class="unit">元/月</span></el-form-item></el-form>
      <template #footer><el-button @click="generalOpen = false">取消</el-button><el-button type="primary" :icon="Check" @click="saveGeneral">保存</el-button></template>
    </el-dialog>
    <el-dialog v-model="cityOpen" :title="editingCity ? '编辑城市保底' : '新增城市保底'" width="min(460px, 94vw)">
      <el-form label-width="100px">
        <el-form-item label="城市"><span v-if="editingCity">{{ cityForm.city }}</span><el-select v-else v-model="cityForm.city" filterable placeholder="选择城市" aria-label="城市"><el-option v-for="city in availableCities" :key="city" :label="city" :value="city" /></el-select></el-form-item>
        <el-form-item label="保底金额"><el-input-number v-model="cityForm.amount" :min="0" :precision="2" controls-position="right" aria-label="城市保底金额" /><span class="unit">元/月</span></el-form-item>
      </el-form><template #footer><el-button @click="cityOpen = false">取消</el-button><el-button type="primary" :icon="Check" @click="saveCity">保存</el-button></template>
    </el-dialog>
    <el-dialog v-model="storeOpen" :title="editingStore ? '编辑门店差异额' : '新增门店差异额'" width="min(460px, 94vw)">
      <el-form label-width="100px">
        <el-form-item label="门店"><span v-if="editingStore">{{ editingStore }}</span><el-select v-else v-model="storeForm.storeId" filterable placeholder="选择门店" aria-label="门店"><el-option v-for="store in availableStores" :key="store.id" :label="store.name" :value="store.id" /></el-select></el-form-item>
        <el-form-item label="差异金额"><el-input-number v-model="storeForm.amount" :min="0" :precision="2" controls-position="right" aria-label="门店差异金额" /><span class="unit">元/月</span></el-form-item>
      </el-form><template #footer><el-button @click="storeOpen = false">取消</el-button><el-button type="primary" :icon="Check" @click="saveStore">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Check, Delete, Edit, Search } from '@element-plus/icons-vue'
import { guaranteeStore, guaranteeCities, guaranteeStores, cityRuleFor, saveGeneralGuarantee, saveCityGuarantee, saveStoreGuarantee, deleteCityGuarantee, deleteStoreGuarantee, matchStoreGuarantee } from '../stores/parttimeGuarantee.js'
import { usePager } from '../composables/usePager.js'
import TablePagination from '../components/TablePagination.vue'
const selectedCity = ref(''), citySearch = ref('')
const generalOpen = ref(false), generalAmount = ref(0), cityOpen = ref(false), editingCity = ref(false), cityForm = ref({}), storeOpen = ref(false), editingStore = ref(''), storeForm = ref({})
const money = value => Number(value || 0).toFixed(2)
const filteredCities = computed(() => guaranteeStore.cityRules.filter(rule => !rule.voidedAt && rule.city.includes(citySearch.value.trim())))
const voidedCities = computed(() => guaranteeStore.cityRules.filter(rule => rule.voidedAt && rule.city.includes(citySearch.value.trim())))
const availableCities = computed(() => guaranteeCities.filter(city => !cityRuleFor(city)))
const selectedRule = computed(() => cityRuleFor(selectedCity.value))
watch(() => guaranteeStore.cityRules.filter(rule => !rule.voidedAt).map(rule => rule.city), cities => {
  if (!cities.includes(selectedCity.value)) selectedCity.value = cities[0] || ''
}, { immediate: true })
const storeRows = computed(() => guaranteeStore.storeRules.filter(rule => !rule.voidedAt).flatMap(rule => {
  const store = guaranteeStores.find(store => store.id === rule.storeId && store.city === selectedCity.value)
  return store ? [{ ...store, ...rule, total: matchStoreGuarantee(store.id).combinedAmount }] : []
}))
const voidedStores = computed(() => guaranteeStore.storeRules.filter(rule => rule.voidedAt).flatMap(rule => {
  const store = guaranteeStores.find(store => store.id === rule.storeId && store.city === selectedCity.value)
  return store ? [{ ...store, ...rule }] : []
}))
const availableStores = computed(() => guaranteeStores.filter(store => store.city === selectedCity.value && !guaranteeStore.storeRules.some(rule => rule.storeId === store.id && !rule.voidedAt)))
function editGeneral() { generalAmount.value = guaranteeStore.generalAmount; generalOpen.value = true }
function saveGeneral() { const error = saveGeneralGuarantee(generalAmount.value); if (error) return ElMessage.error(error); generalOpen.value = false; ElMessage.success('已保存') }
function editCity(rule) {
  if (!rule?.city && !availableCities.value.length) return ElMessage.info('所有城市均已配置')
  editingCity.value = !!rule?.city
  cityForm.value = rule?.city ? { ...rule } : { city: '', amount: guaranteeStore.generalAmount }
  cityOpen.value = true
}
function saveCity() {
  const error = saveCityGuarantee(cityForm.value)
  if (error) return ElMessage.error(error)
  selectedCity.value = cityForm.value.city; citySearch.value = ''; cityOpen.value = false; ElMessage.success('已保存')
}
function editStore(row) {
  editingStore.value = row?.name || ''
  storeForm.value = row?.storeId ? { storeId: row.storeId, amount: row.amount } : { storeId: '', amount: 0 }
  storeOpen.value = true
}
function saveStore() { const error = saveStoreGuarantee(storeForm.value); if (error) return ElMessage.error(error); storeOpen.value = false; ElMessage.success('已保存') }
async function removeCity() {
  try { await ElMessageBox.confirm(`作废${selectedCity.value}城市及其门店配置后，使用通用保底。`, '作废城市配置', { confirmButtonText: '作废', cancelButtonText: '取消' }) } catch { return }
  deleteCityGuarantee(selectedCity.value); ElMessage.success('已作废')
}
async function removeStore(row) {
  try { await ElMessageBox.confirm(`作废${row.name}差异额后，该门店仅使用城市保底。`, '作废门店配置', { confirmButtonText: '作废', cancelButtonText: '取消' }) } catch { return }
  deleteStoreGuarantee(row.storeId); ElMessage.success('已作废')
}

/* 分页：数据已筛选 / 排序，这里只切片 */
const { page: page, pageSize: pageSize, total: total, rows: pagedRows } = usePager(storeRows)
</script>

<style scoped>
.guarantee-page { padding:24px; background:#fff; min-height:100%; color:#303133; }
header { margin-bottom:28px; } h1 { font-size:22px; margin:0 0 8px; } header p { color:#777; font-size:13px; margin:0; } h2 { font-size:16px; margin:0; }
.configuration-layout { display:grid; grid-template-columns:200px minmax(0,1fr); min-height:560px; border-top:1px solid #e5e7eb; }
.general-bar { display:flex; align-items:center; gap:20px; flex-wrap:wrap; padding:16px 0; border-top:1px solid #e5e7eb; }
.general-bar strong { font-size:18px; font-variant-numeric:tabular-nums; } .general-bar strong span { font-size:13px; font-weight:400; color:#888; margin-left:8px; } .general-scope { color:#888; font-size:13px; } .general-bar .el-button { margin-left:auto; }
.scope-sidebar { padding:20px 16px 20px 0; border-right:1px solid #e5e7eb; } .scope-sidebar .el-input { margin-bottom:12px; } .scope-heading { display:flex; align-items:center; justify-content:space-between; font-size:12px; color:#888; margin:0 0 8px 12px; }
.scope-item { display:block; width:100%; text-align:left; border:0; border-left:3px solid transparent; background:transparent; padding:12px; font:inherit; color:#303133; cursor:pointer; } .scope-item:hover { background:#f7f8fa; } .scope-item.active { background:#faf0f3; border-left-color:#a50034; color:#a50034; } .scope-item span { font-size:14px; font-weight:600; } small { display:block; color:#888; font-size:12px; margin-top:6px; }
.scope-content { min-width:0; padding:24px 0 24px 24px; } .section-heading,.store-heading { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; } .store-heading { border-top:1px solid #e5e7eb; padding-top:24px; margin:28px 0 16px; }
.voided-records { border-top:1px solid #e5e7eb; margin-top:18px; padding:14px 12px; color:#909399; font-size:12px; } .voided-records p { margin:8px 0 0; }
.base-amount { font-size:26px; font-weight:600; margin-top:28px; } .base-amount span { font-size:13px; color:#888; font-weight:400; margin-left:8px; } .scope-note,.empty-city { font-size:13px; color:#888; } .empty-city { padding:0 12px; } .unit { margin-left:10px; color:#777; } .actions { display:flex; gap:8px; flex-wrap:wrap; } .actions .el-button + .el-button { margin-left:0; }
@media(max-width:700px) { .guarantee-page { padding:16px; } .configuration-layout { grid-template-columns:140px minmax(0,1fr); } .scope-content { padding-left:16px; } }
</style>
