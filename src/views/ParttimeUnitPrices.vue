<template>
  <div class="price-page">
    <header><h1>收入单价配置</h1><p>非全客户经理</p></header>
    <section class="general-bar" aria-label="通用单价">
      <h2>通用配置</h2>
      <div class="general-values"><span v-for="item in priceItems" :key="item.key"><small>{{ item.label }}</small><strong>{{ priceText(unitPriceStore.generalPrices[item.key]) }}<em>元</em></strong></span></div>
      <el-tooltip content="编辑通用单价"><el-button :icon="Edit" text aria-label="编辑通用单价" @click="editGeneral" /></el-tooltip>
    </section>
    <main class="price-layout">
      <section class="price-column" aria-label="城市单价">
        <div class="column-heading"><div><h2>城市单价</h2><small>{{ activeCities.length }} 个已配置</small></div><el-button type="primary" :icon="Plus" :disabled="!availableCities.length" aria-label="新增城市单价" @click="editCity()">新增</el-button></div>
        <el-input v-model="citySearch" clearable :prefix-icon="Search" placeholder="搜索城市" aria-label="搜索城市" class="column-search" />
        <div class="column-list">
          <div v-for="rule in filteredCities" :key="rule.city" class="price-row">
            <span class="row-heading"><strong>{{ rule.city }}</strong></span>
            <span class="rate-grid"><span v-for="item in priceItems" :key="item.key"><small>{{ item.label }}</small><b>{{ priceText(resolveCityPrices(rule.city).prices[item.key]) }}</b><em :class="sourceClass(resolveCityPrices(rule.city).sources[item.key], '城市')">{{ sourceLabel(resolveCityPrices(rule.city).sources[item.key], '城市') }}</em></span></span>
            <span class="row-actions"><el-button link type="primary" @click="editCity(rule)">编辑</el-button><el-button link type="danger" @click="removeCity(rule)">作废</el-button></span>
          </div>
          <p v-if="!filteredCities.length" class="empty-text">{{ citySearch ? '暂无匹配城市' : '暂无城市配置' }}</p>
          <div v-if="voidedCities.length" class="voided-records"><strong>已作废</strong><p v-for="(rule, index) in voidedCities" :key="index">{{ rule.city }} · {{ summary(rule.prices) }}</p></div>
        </div>
      </section>
      <section class="price-column" aria-label="门店单价">
        <div class="column-heading"><div><h2>门店单价</h2><small>{{ activeStores.length }} 家已配置</small></div><el-button type="primary" :icon="Plus" :disabled="!availableStores.length" aria-label="新增门店单价" @click="editStore()">新增</el-button></div>
        <el-input v-model="storeSearch" clearable :prefix-icon="Search" placeholder="搜索门店、编号或城市" aria-label="搜索门店" class="column-search" />
        <div class="column-list">
          <div v-for="store in filteredStores" :key="store.id" class="price-row">
            <span class="row-heading"><strong>{{ store.name }}</strong><small>{{ store.city }} · {{ store.code }}</small></span>
            <span class="rate-grid"><span v-for="item in priceItems" :key="item.key"><small>{{ item.label }}</small><b>{{ priceText(resolveUnitPrices(null, store.id).prices[item.key]) }}</b><em :class="sourceClass(resolveUnitPrices(null, store.id).sources[item.key], '门店')">{{ sourceLabel(resolveUnitPrices(null, store.id).sources[item.key], '门店') }}</em></span></span>
            <span class="row-actions"><el-button link type="primary" @click="editStore(store)">编辑</el-button><el-button link type="danger" @click="removeStore(store)">作废</el-button></span>
          </div>
          <p v-if="!filteredStores.length" class="empty-text">{{ storeSearch ? '暂无匹配门店' : '暂无门店配置' }}</p>
          <div v-if="voidedStores.length" class="voided-records"><strong>已作废</strong><p v-for="(row, index) in voidedStores" :key="index">{{ row.name }} · {{ summary(row.prices) }}</p></div>
        </div>
      </section>
      <section class="price-column" aria-label="个人单价">
        <div class="column-heading"><div><h2>个人单价</h2><small>{{ activePersons.length }} 条门店关系</small></div><el-button type="primary" :icon="Plus" aria-label="新增个人单价" @click="editPerson()">新增</el-button></div>
        <el-input v-model="personSearch" clearable :prefix-icon="Search" placeholder="搜索姓名或工号" aria-label="搜索客户经理" class="column-search" />
        <div class="column-list">
          <div v-for="person in filteredPersons" :key="person.id" class="person-group">
            <div class="person-heading"><strong>{{ person.name }}</strong><small>{{ person.employeeNo }} · {{ person.rules.length }} 家门店</small></div>
            <div v-for="rule in person.rules" :key="rule.storeId" class="price-row person-row">
              <span class="row-heading"><strong>{{ rule.storeName }}</strong><small>{{ rule.city }}</small></span>
              <span class="rate-grid"><span v-for="item in priceItems" :key="item.key"><small>{{ item.label }}</small><b>{{ priceText(rule.resolved.prices[item.key]) }}</b><em :class="sourceClass(rule.resolved.sources[item.key], '个人')">{{ sourceLabel(rule.resolved.sources[item.key], '个人') }}</em></span></span>
              <span class="row-actions"><el-button link type="primary" @click="editPerson(rule)">编辑</el-button><el-button link type="danger" @click="removePerson(rule)">作废</el-button></span>
            </div>
          </div>
          <p v-if="!filteredPersons.length" class="empty-text">{{ personSearch ? '暂无匹配人员' : '暂无个人单价配置' }}</p>
          <div v-if="voidedPersons.length" class="voided-records"><strong>已作废</strong><p v-for="(row, index) in voidedPersons" :key="index">{{ row.name }} · {{ row.storeName }} · {{ summary(row.prices) }}</p></div>
        </div>
      </section>
    </main>
    <el-dialog v-model="dialogOpen" :title="dialogTitle" width="min(520px, 94vw)">
      <el-form label-width="100px">
        <el-form-item v-if="level === 'city'" label="城市"><span v-if="editingId">{{ editingId }}</span><el-select v-else v-model="form.city" filterable placeholder="选择城市" aria-label="城市"><el-option v-for="city in availableCities" :key="city" :label="city" :value="city" /></el-select></el-form-item>
        <el-form-item v-if="level === 'person'" label="客户经理"><span v-if="editingId">{{ employees.find(employee => employee.id === form.employeeId)?.name }}</span><el-select v-else v-model="form.employeeId" filterable placeholder="工号或姓名" aria-label="客户经理"><el-option v-for="employee in employees" :key="employee.id" :label="`${employee.employeeNo} ${employee.name}`" :value="employee.id" /></el-select></el-form-item>
        <el-form-item v-if="level === 'store' && !editingId" label="城市"><el-select v-model="form.storeCity" filterable placeholder="选择城市" aria-label="筛选门店城市"><el-option v-for="city in storeCities" :key="city" :label="city" :value="city" /></el-select></el-form-item>
        <el-form-item v-if="level === 'store' || level === 'person'" label="门店"><span v-if="editingId">{{ guaranteeStores.find(store => store.id === form.storeId)?.name }}</span><el-select v-else v-model="form.storeId" filterable :disabled="level === 'store' && !form.storeCity" :placeholder="level === 'store' && !form.storeCity ? '先选择城市' : '门店名称或编号'" aria-label="门店"><el-option v-for="store in level === 'store' ? filteredAvailableStores : personAvailableStores" :key="store.id" :label="`${store.city} · ${store.name} (${store.code})`" :value="store.id" /></el-select></el-form-item>
        <el-form-item v-if="level === 'general'" label="适用范围">全部城市默认</el-form-item>
        <el-form-item v-for="item in priceItems" :key="item.key" :label="item.label + '单价'">
          <el-checkbox v-if="level !== 'general'" v-model="form.enabled[item.key]" :aria-label="`单独配置${item.label}`">单独配置</el-checkbox>
          <el-input-number v-if="level === 'general' || form.enabled[item.key]" v-model="form.prices[item.key]" :min="0" :precision="2" controls-position="right" :aria-label="`${item.label}单价金额`" />
          <span v-else class="inherited">{{ priceText(inheritedPrices[item.key]) }} 元 · {{ sourceLabel(inheritedSources[item.key], level) }}</span>
          <span v-if="level === 'general' || form.enabled[item.key]" class="unit">元</span>
        </el-form-item>
      </el-form><template #footer><el-button @click="dialogOpen = false">取消</el-button><el-button type="primary" :icon="Check" @click="save">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Check, Search } from '@element-plus/icons-vue'
import { employees } from '../stores/parttimeTasks.js'
import { guaranteeCities, guaranteeStores } from '../stores/parttimeGuarantee.js'
import { unitPriceStore, priceItems, cityPriceFor, storePriceFor, personStorePriceFor, saveGeneralPrices, saveCityPrices, saveStorePrices, savePersonStorePrices, deleteCityPrices, deleteStorePrices, deletePersonStorePrices, resolveCityPrices, resolveUnitPrices } from '../stores/parttimeUnitPrices.js'
const citySearch = ref(''), storeSearch = ref(''), personSearch = ref('')
const activeCities = computed(() => unitPriceStore.cityRules.filter(rule => !rule.voidedAt))
const activeStores = computed(() => unitPriceStore.storeRules.filter(rule => !rule.voidedAt))
const activePersons = computed(() => unitPriceStore.personStoreRules.filter(rule => !rule.voidedAt))
const filteredCities = computed(() => activeCities.value.filter(rule => rule.city.includes(citySearch.value.trim())))
const voidedCities = computed(() => unitPriceStore.cityRules.filter(rule => rule.voidedAt && rule.city.includes(citySearch.value.trim())))
const availableCities = computed(() => guaranteeCities.filter(city => !cityPriceFor(city)))
const filteredStores = computed(() => activeStores.value.flatMap(rule => {
  const store = guaranteeStores.find(item => item.id === rule.storeId)
  return store && `${store.city} ${store.name} ${store.code}`.includes(storeSearch.value.trim()) ? [store] : []
}))
const voidedStores = computed(() => unitPriceStore.storeRules.filter(rule => rule.voidedAt).flatMap(rule => {
  const store = guaranteeStores.find(item => item.id === rule.storeId)
  return store && `${store.city} ${store.name} ${store.code}`.includes(storeSearch.value.trim()) ? [{ ...rule, name: store.name }] : []
}))
const availableStores = computed(() => guaranteeStores.filter(store => !storePriceFor(store.id)))
const storeCities = computed(() => guaranteeCities.filter(city => availableStores.value.some(store => store.city === city)))
const filteredAvailableStores = computed(() => availableStores.value.filter(store => store.city === form.value.storeCity))
const filteredPersons = computed(() => employees.filter(person => `${person.name} ${person.employeeNo}`.includes(personSearch.value.trim())).map(person => ({
  ...person,
  rules: activePersons.value.filter(rule => rule.employeeId === person.id).flatMap(rule => {
    const store = guaranteeStores.find(item => item.id === rule.storeId)
    return store ? [{ ...rule, storeName: store.name, city: store.city, resolved: resolveUnitPrices(person.id, store.id) }] : []
  })
})).filter(person => person.rules.length))
const voidedPersons = computed(() => unitPriceStore.personStoreRules.filter(rule => rule.voidedAt).flatMap(rule => {
  const employee = employees.find(item => item.id === rule.employeeId)
  const store = guaranteeStores.find(item => item.id === rule.storeId)
  return employee && store && `${employee.name} ${employee.employeeNo}`.includes(personSearch.value.trim()) ? [{ ...rule, name: employee.name, storeName: store.name }] : []
}))
const personAvailableStores = computed(() => guaranteeStores.filter(store => !personStorePriceFor(form.value.employeeId, store.id)))
const priceText = value => value == null ? '未配置' : Number(value).toFixed(2)
const summary = prices => priceItems.filter(item => prices[item.key] !== undefined).map(item => `${item.label} ${priceText(prices[item.key])}`).join(' · ')
const sourceLabel = (source, ownLevel) => source === ownLevel ? '本级配置' : source === '未配置' ? '未配置' : `继承${source}`
const sourceClass = (source, ownLevel) => ({ 'source-inherited': source !== ownLevel })
const dialogOpen = ref(false), level = ref('city'), form = ref({ prices: {}, enabled: {} }), editingId = ref('')
const dialogTitle = computed(() => ({ general: '通用单价', city: '城市单价', store: '门店单价', person: '个人单价' })[level.value])
const inheritedPrices = computed(() => {
  if (level.value === 'city') return unitPriceStore.generalPrices
  const store = guaranteeStores.find(item => item.id === form.value.storeId)
  if (level.value === 'store') return store ? resolveCityPrices(store.city).prices : unitPriceStore.generalPrices
  return store ? resolveUnitPrices(null, store.id).prices : unitPriceStore.generalPrices
})
const inheritedSources = computed(() => {
  if (level.value === 'city') return Object.fromEntries(priceItems.map(item => [item.key, '通用']))
  const store = guaranteeStores.find(item => item.id === form.value.storeId)
  if (!store) return Object.fromEntries(priceItems.map(item => [item.key, '通用']))
  return level.value === 'store' ? resolveCityPrices(store.city).sources : resolveUnitPrices(null, store.id).sources
})
function open(levelName, rule = null) {
  level.value = levelName
  const prices = rule?.prices || {}
  form.value = { city: rule?.city || '', storeCity: '', storeId: rule?.storeId || '', employeeId: rule?.employeeId || null, prices: Object.fromEntries(priceItems.map(item => [item.key, prices[item.key] ?? unitPriceStore.generalPrices[item.key]])), enabled: Object.fromEntries(priceItems.map(item => [item.key, prices[item.key] !== undefined])) }
  editingId.value = rule ? levelName === 'city' ? rule.city : levelName === 'store' ? rule.storeId : levelName === 'person' ? `${rule.employeeId}:${rule.storeId}` : 'general' : ''
  dialogOpen.value = true
}
watch(() => form.value.employeeId, () => { if (level.value === 'person' && !editingId.value && personStorePriceFor(form.value.employeeId, form.value.storeId)) form.value.storeId = '' })
watch(() => form.value.storeCity, city => {
  if (level.value === 'store' && !editingId.value && guaranteeStores.find(store => store.id === form.value.storeId)?.city !== city) form.value.storeId = ''
})
watch(() => form.value.storeId, () => {
  if (editingId.value || !['store', 'person'].includes(level.value)) return
  for (const item of priceItems) if (!form.value.enabled[item.key]) form.value.prices[item.key] = inheritedPrices.value[item.key]
})
function editCity(rule = null) { open('city', rule) }
function editGeneral() { open('general', { prices: unitPriceStore.generalPrices }) }
function editStore(store = null) { open('store', store ? storePriceFor(store.id) : null) }
function editPerson(row = null) { open('person', row?.employeeId ? row : null) }
function save() {
  const prices = Object.fromEntries(priceItems.filter(item => level.value === 'general' || form.value.enabled[item.key]).map(item => [item.key, form.value.prices[item.key]]))
  const error = level.value === 'general' ? saveGeneralPrices(prices) : level.value === 'city' ? saveCityPrices({ city: form.value.city, prices }) : level.value === 'store' ? saveStorePrices({ storeId: form.value.storeId, prices }) : savePersonStorePrices({ employeeId: form.value.employeeId, storeId: form.value.storeId, prices })
  if (error) return ElMessage.error(error)
  dialogOpen.value = false; ElMessage.success('单价已保存')
}
async function confirmVoid(message) { try { await ElMessageBox.confirm(message, '作废收入单价配置', { confirmButtonText: '作废', cancelButtonText: '取消' }); return true } catch { return false } }
async function removeCity(rule) { if (await confirmVoid(`作废${rule.city}城市单价后，未被门店或个人覆盖的项目将使用通用单价。`)) deleteCityPrices(rule.city) }
async function removeStore(store) { if (await confirmVoid(`作废${store.name}单价后，未被个人覆盖的项目将使用城市或通用单价。`)) deleteStorePrices(store.id) }
async function removePerson(row) { if (await confirmVoid(`作废该客户经理在${row.storeName}的个人单价？`)) deletePersonStorePrices(row.employeeId, row.storeId) }
</script>

<style scoped>
.price-page { padding:24px; background:#fff; min-height:100%; color:#303133; }
header { margin-bottom:26px; } h1 { font-size:22px; margin:0 0 8px; } header p { margin:0; font-size:13px; color:#888; } h2 { font-size:16px; margin:0 0 5px; }
.general-bar { display:flex; align-items:center; gap:24px; border-top:1px solid #e5e7eb; padding:16px 0; }
.general-bar h2 { flex:0 0 auto; margin:0; } .general-values { display:flex; align-items:center; gap:28px; flex-wrap:wrap; }
.general-values small { color:#888; font-size:12px; margin-right:8px; } .general-values strong { font-size:16px; font-variant-numeric:tabular-nums; } .general-values em { font-size:12px; font-style:normal; font-weight:400; color:#888; margin-left:3px; }
.general-bar > .el-button { margin-left:auto; }
.price-layout { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); border-top:1px solid #e5e7eb; min-height:640px; }
.price-column { display:flex; flex-direction:column; min-width:0; padding:20px 16px; border-right:1px solid #e5e7eb; }
.price-column:first-child { padding-left:0; } .price-column:last-child { border-right:0; padding-right:0; }
.column-heading { display:flex; align-items:center; justify-content:space-between; gap:8px; min-height:43px; margin-bottom:14px; }
.column-heading small { color:#888; font-size:12px; } .column-search { margin-bottom:14px; }
.column-tools { display:flex; gap:2px; flex-shrink:0; } .column-tools .el-button + .el-button { margin-left:0; }
.column-list { flex:1; min-height:240px; }
.voided-records { border-top:1px solid #e5e7eb; margin-top:16px; padding:12px; color:#909399; font-size:12px; } .voided-records p { margin:8px 0 0; line-height:1.5; }
.price-row { display:block; box-sizing:border-box; width:100%; padding:13px 12px; margin:0 0 8px; border:1px solid #e5e7eb; border-radius:4px; background:#fff; color:#303133; text-align:left; font:inherit; }
button.price-row { cursor:pointer; } button.price-row:hover { border-color:#b9a1a9; background:#fdfafb; } .price-row.active { border-color:#bd8498; background:#fcf5f7; }
.row-heading { display:flex; align-items:center; justify-content:space-between; gap:8px; min-width:0; }
.row-heading strong { font-size:14px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; } .row-heading small { color:#888; font-size:12px; white-space:nowrap; }
.rate-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:5px; margin-top:13px; }
.rate-grid > span { min-width:0; } .rate-grid small,.rate-grid b,.rate-grid em { display:block; font-style:normal; letter-spacing:0; }
.rate-grid small { font-size:12px; color:#888; } .rate-grid b { font-size:14px; font-weight:600; margin-top:4px; overflow-wrap:anywhere; } .rate-grid em { font-size:11px; color:#777; margin-top:3px; }
.rate-grid em.source-inherited { color:#557284; }
.row-actions { display:flex; gap:12px; justify-content:flex-end; margin-top:8px; border-top:1px solid #eee; padding-top:6px; }
.row-actions .el-button + .el-button { margin-left:0; } .empty-text { font-size:13px; color:#888; padding:24px 6px; text-align:center; }
.person-group { border-top:1px solid #e5e7eb; padding-top:12px; margin-bottom:16px; } .person-heading { display:flex; justify-content:space-between; gap:8px; align-items:center; margin-bottom:8px; } .person-heading strong { font-size:14px; } .person-heading small { font-size:12px; color:#888; }
.unit { margin-left:8px; color:#777; } .inherited { color:#888; font-size:13px; } .el-form-item .el-checkbox { margin-right:10px; } .el-form-item :deep(.el-input-number) { width:130px; } .el-form-item .el-select { width:220px; }
@media(max-width:900px) { .price-page { padding:16px; } .price-layout { display:block; } .price-column { padding:20px 0; border-right:0; border-bottom:1px solid #e5e7eb; } .price-column:last-child { border-bottom:0; } .column-list { min-height:0; } .rate-grid b { font-size:14px; } }
</style>
