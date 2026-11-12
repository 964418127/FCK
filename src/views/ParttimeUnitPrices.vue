<template>
  <div class="price-page">
    <header>
      <h1>收入单价配置</h1>
      <p>非全客户经理</p>
    </header>

    <div class="rule-bar">
      <strong>取值顺序：</strong>客户经理 × 门店 → 门店 → 城市 → 通用，逐项取第一个配置过的金额；
      单价按<strong>门店配置的全职客户经理人数</strong>与<strong>门店天均客次量</strong>落在同一格里比较，不跨档继承。
    </div>

    <div class="price-layout">
      <aside class="headcount-rail" aria-label="配置人数">
        <div class="rail-heading">配置人数</div>
        <button
          v-for="tier in tiers"
          :key="tier.key"
          type="button"
          :class="['rail-item', { active: headcountKey === tier.key }]"
          :aria-pressed="headcountKey === tier.key"
          @click="headcountKey = tier.key"
        >
          <strong>{{ tier.count }} 人</strong>
          <small>门店配 {{ tier.count }} 名全职客户经理</small>
        </button>
        <button type="button" class="rail-add" @click="openAddTier">
          <el-icon><Plus /></el-icon>新增人数档
        </button>
        <p class="rail-note">超过 {{ maxTier.count }} 人，按最高档（{{ maxTier.count }} 人）取值。</p>
      </aside>

      <section class="scope-main">
        <el-tabs v-model="scope" class="scope-tabs">
          <el-tab-pane label="城市标准" name="city" />
          <el-tab-pane label="门店标准" name="store" />
          <el-tab-pane label="员工标准" name="person" />
        </el-tabs>

        <div class="scope-body">
          <aside class="scope-list" :aria-label="`${scopeLabel}列表`">
            <div class="list-heading">
              <span>{{ scopeLabel }}<small>{{ activeItems.length }} 个已配置</small></span>
              <el-button link type="primary" :icon="Plus" :disabled="!canAdd" @click="openAdd">{{ addLabel }}</el-button>
            </div>
            <el-input v-model="keyword" clearable :prefix-icon="Search" :placeholder="searchPlaceholder" aria-label="搜索" class="list-search" />
            <button type="button" :class="['scope-item', { active: selected === 'general' }]" @click="selected = 'general'">
              <span>通用</span><small>未配置城市、门店、金额时使用</small>
            </button>
            <button
              v-for="item in filteredItems"
              :key="item.id"
              type="button"
              :class="['scope-item', { active: selected === item.id }]"
              @click="selected = item.id"
            >
              <span>{{ item.name }}</span><small>{{ item.sub }}</small>
            </button>
            <p v-if="!filteredItems.length" class="empty-text">{{ keyword ? '暂无匹配对象' : '暂无配置，点右上「新增」' }}</p>
            <div v-if="voidedItems.length" class="voided-records">
              <strong>已作废</strong>
              <p v-for="item in voidedItems" :key="item.id">{{ item.name }} · {{ item.sub }}</p>
            </div>
          </aside>

          <main class="scope-detail">
            <div class="detail-heading">
              <div>
                <h2>{{ selectedTitle }}</h2>
                <small>{{ detailHint }}</small>
              </div>
              <el-button v-if="canVoid" :icon="Delete" @click="voidSelected">作废本级</el-button>
            </div>

            <el-table :data="rows" empty-text="暂无客次量档" class="rate-table">
              <el-table-column label="门店天均客次量" width="170">
                <template #default="{ row }">
                  <strong>{{ row.label }}</strong>
                  <small class="tier-range">{{ row.from }} 次起{{ row.to === null ? '' : `，不含 ${row.to} 次` }}</small>
                </template>
              </el-table-column>
              <el-table-column v-for="item in priceItems" :key="item.key" :label="`${item.label}单价`" min-width="132" align="right">
                <template #default="{ row }">
                  <span class="rate-value" :class="{ inherited: row.sources[item.key] !== ownSource }">
                    <strong>{{ money(row.prices[item.key]) }}</strong>
                    <small>{{ sourceText(row.sources[item.key]) }}</small>
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="92" align="right">
                <template #default="{ row }">
                  <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
                </template>
              </el-table-column>
            </el-table>
            <p class="table-note">灰字为继承来的金额，黑字为本级配置；编辑时留空即继承上一级，填 0 表示该档 0 元。</p>
          </main>
        </div>
      </section>
    </div>

    <el-dialog v-model="tierDialogOpen" title="新增人数档" width="min(420px, 92vw)">
      <div class="tier-form">
        <span class="tier-label">门店全职客户经理人数</span>
        <el-input-number v-model="tierCount" :min="1" :max="99" :precision="0" controls-position="right" />
      </div>
      <p class="tier-hint">新增后左列多一个「{{ tierCount || '—' }} 人」档；起步价复制自当前最高档「{{ maxTier.count }} 人」，可逐格再改。</p>
      <template #footer>
        <el-button @click="tierDialogOpen = false">取消</el-button>
        <el-button type="primary" @click="confirmAddTier">新增</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="dialogOpen" :title="dialogTitle" width="min(780px, 96vw)">
      <el-form label-width="104px">
        <el-form-item v-if="adding && scope === 'city'" label="城市">
          <el-select v-model="form.city" filterable placeholder="选择城市" aria-label="城市">
            <el-option v-for="city in availableCities" :key="city" :label="city" :value="city" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="adding && scope === 'store'" label="城市">
          <el-select v-model="form.storeCity" filterable placeholder="先选城市" aria-label="门店城市">
            <el-option v-for="city in storeCities" :key="city" :label="city" :value="city" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="adding && (scope === 'store' || scope === 'person')" label="门店">
          <el-select v-model="form.storeId" filterable :disabled="scope === 'store' && !form.storeCity" :placeholder="scope === 'store' && !form.storeCity ? '先选择城市' : '门店名称或编号'" aria-label="门店">
            <el-option v-for="store in addingStores" :key="store.id" :label="`${store.city} · ${store.name}（${store.code}）`" :value="store.id" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="adding && scope === 'person'" label="客户经理">
          <el-select v-model="form.employeeId" filterable placeholder="工号或姓名" aria-label="客户经理">
            <el-option v-for="employee in employees" :key="employee.id" :label="`${employee.employeeNo} ${employee.name}`" :value="employee.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="人数档">
          <span class="form-static">{{ headcountLabel }}<em>按左侧「配置人数」当前选择</em></span>
        </el-form-item>
      </el-form>

      <table class="cell-grid">
        <thead>
          <tr>
            <th>门店天均客次量（次）</th>
            <th v-for="item in priceItems" :key="item.key">{{ item.label }}单价（元）</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tier in visibleTiers" :key="tier.key">
            <td>
              <div class="range-inputs">
                <el-input-number
                  v-model="form.tiers[tier.key].from"
                  :min="0"
                  :max="isFirstVolumeTier(tier) ? 0 : undefined"
                  :precision="0"
                  controls-position="right"
                  :aria-label="`${tier.label} 下限`"
                />
                <span class="range-sep">~</span>
                <el-input-number
                  v-if="!isLastVolumeTier(tier)"
                  v-model="form.tiers[tier.key].to"
                  :min="(form.tiers[tier.key].from ?? 0) + 1"
                  :precision="0"
                  controls-position="right"
                  :aria-label="`${tier.label} 上限`"
                />
                <el-input-number v-else :model-value="null" disabled placeholder="以上" controls-position="right" aria-label="末档不设上限" />
              </div>
            </td>
            <td v-for="item in priceItems" :key="item.key">
              <el-input-number
                :model-value="form.cells[tier.key][item.key]"
                :min="0"
                :precision="2"
                :value-on-clear="null"
                controls-position="right"
                :placeholder="inheritPlaceholder(tier, item)"
                :aria-label="`${tier.label}${item.label}单价`"
                @update:model-value="value => form.cells[tier.key][item.key] = value"
              />
            </td>
          </tr>
        </tbody>
      </table>
      <p class="dialog-note">留空的格子沿用上一级同档价格；填 0 表示该档确实为 0 元，不是「没配」。客次量档区间是全局定义，调整后对所有标准生效；区间须首尾相接，末档不设上限。</p>

      <template #footer>
        <el-button @click="dialogOpen = false">取消</el-button>
        <el-button type="primary" :icon="Check" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Check, Search } from '@element-plus/icons-vue'
import { employees } from '../stores/parttimeTasks.js'
import { guaranteeCities, guaranteeStores } from '../stores/parttimeGuarantee.js'
import {
  unitPriceStore, priceItems, volumeTiersOf, volumeTierLabel, saveVolumeTiers, validateVolumeTiers, ownSourceLabel, storeFacts, addHeadcountTier,
  cityPriceFor, storePriceFor, personStorePriceFor, resolveAt,
  saveGeneralCells, saveCityPrices, saveStorePrices, savePersonStorePrices,
  deleteCityPrices, deleteStorePrices, deletePersonStorePrices
} from '../stores/parttimeUnitPrices.js'

const headcountKey = ref('hc1')
const volumeTiers = computed(() => volumeTiersOf())
const isLastVolumeTier = tier => tier.key === volumeTiers.value[volumeTiers.value.length - 1]?.key
const isFirstVolumeTier = tier => tier.key === volumeTiers.value[0]?.key
const tiers = computed(() => unitPriceStore.headcountTiers)
const maxTier = computed(() => [...tiers.value].sort((a, b) => b.count - a.count)[0])
const tierDialogOpen = ref(false)
const tierCount = ref(2)
const scope = ref('city')
const selected = ref('general')
const keyword = ref('')
const scopeLabelMap = { city: '城市标准', store: '门店标准', person: '员工标准' }
const addLabelMap = { city: '新增城市', store: '新增门店', person: '新增人员' }
const searchMap = { city: '搜索城市', store: '搜索门店或编号', person: '搜索姓名或工号' }
const scopeLabel = computed(() => scopeLabelMap[scope.value])
const addLabel = computed(() => addLabelMap[scope.value])
const searchPlaceholder = computed(() => searchMap[scope.value])
const headcountLabel = computed(() => tiers.value.find(item => item.key === headcountKey.value)?.label || '')
const money = value => value == null ? '未配置' : Number(value).toFixed(2)
const filledCells = cells => Object.values(cells || {}).reduce((total, cell) => total + priceItems.filter(item => cell[item.key] !== undefined).length, 0)

const activeCities = computed(() => unitPriceStore.cityRules.filter(rule => !rule.voidedAt))
const activeStores = computed(() => unitPriceStore.storeRules.filter(rule => !rule.voidedAt))
const activePersons = computed(() => unitPriceStore.personStoreRules.filter(rule => !rule.voidedAt))
const storeOf = id => guaranteeStores.find(store => store.id === id)
const employeeOf = id => employees.find(employee => employee.id === id)

const scopeItems = computed(() => {
  if (scope.value === 'city') return activeCities.value.flatMap(rule => {
    const filled = filledCells(rule.cells)
    return [{ id: rule.city, name: rule.city, sub: `${filled} 项已配置`, raw: rule, city: rule.city }]
  })
  if (scope.value === 'store') return activeStores.value.flatMap(rule => {
    const store = storeOf(rule.storeId)
    if (!store) return []
    const facts = storeFacts(store)
    return [{ id: store.id, name: store.name, sub: `${store.city} · ${facts.fullTimeCount} 名全职 · 天均 ${facts.avgDailyVisits} 次`, raw: rule, city: store.city, storeId: store.id }]
  })
  return activePersons.value.flatMap(rule => {
    const employee = employeeOf(rule.employeeId)
    const store = storeOf(rule.storeId)
    if (!employee || !store) return []
    return [{ id: `${employee.id}:${store.id}`, name: `${employee.name} · ${store.name}`, sub: `${employee.employeeNo} · ${store.city} · ${filledCells(rule.cells)} 项已配置`, raw: rule, city: store.city, storeId: store.id, employeeId: employee.id }]
  })
})
const filteredItems = computed(() => {
  const word = keyword.value.trim()
  return word ? scopeItems.value.filter(item => `${item.name} ${item.sub}`.includes(word)) : scopeItems.value
})
const voidedItems = computed(() => {
  if (scope.value === 'city') return unitPriceStore.cityRules.filter(rule => rule.voidedAt).map(rule => ({ id: `void-${rule.city}`, name: rule.city, sub: '已作废' }))
  if (scope.value === 'store') return unitPriceStore.storeRules.filter(rule => rule.voidedAt).flatMap(rule => storeOf(rule.storeId) ? [{ id: `void-${rule.storeId}`, name: storeOf(rule.storeId).name, sub: '已作废' }] : [])
  return unitPriceStore.personStoreRules.filter(rule => rule.voidedAt).flatMap(rule => {
    const employee = employeeOf(rule.employeeId)
    const store = storeOf(rule.storeId)
    return employee && store ? [{ id: `void-${rule.employeeId}-${rule.storeId}`, name: `${employee.name} · ${store.name}`, sub: '已作废' }] : []
  })
})
const activeItems = scopeItems
watch(scope, () => { keyword.value = ''; selected.value = 'general' })

const selectedItem = computed(() => scopeItems.value.find(item => item.id === selected.value) || null)
const selectedTitle = computed(() => selected.value === 'general' ? '通用标准' : selectedItem.value?.name || '—')
const ownSource = computed(() => selected.value === 'general' ? '通用' : ownSourceLabel(scope.value))
const target = computed(() => {
  if (selected.value === 'general') return {}
  const item = selectedItem.value
  if (!item) return {}
  return { city: item.city, storeId: item.storeId, employeeId: item.employeeId }
})
const detailHint = computed(() => {
  const base = `当前查看「${headcountLabel.value}门店」的档位；超过 ${maxTier.value.count} 人，按最高档取值。`
  if (selected.value === 'general') return `${base} 通用是所有层级都没配置时的兜底。`
  if (scope.value === 'store' && selectedItem.value) {
    const facts = storeFacts(storeOf(selectedItem.value.storeId))
    return `${base} 该店实际 ${facts.fullTimeCount} 名全职客户经理、天均 ${facts.avgDailyVisits} 次，命中 ${tiers.value.find(item => item.key === facts.headcountKey)?.label} · ${volumeTierLabel(volumeTiers.value.find(item => item.key === facts.volumeTierKey) || {})}。`
  }
  return base
})
const rows = computed(() => volumeTiers.value.map(tier => {
  const resolved = resolveAt({ ...target.value, headcountKey: headcountKey.value, tierKey: tier.key })
  return { ...tier, label: volumeTierLabel(tier), ...resolved }
}))
const sourceText = source => source === ownSource.value ? '本级配置' : source === '未配置' ? '未配置' : `继承${source}`
const canVoid = computed(() => selected.value !== 'general' && !!selectedItem.value)
const canAdd = computed(() => scope.value === 'city' ? availableCities.value.length > 0 : scope.value === 'store' ? availableStores.value.length > 0 : true)

const availableCities = computed(() => guaranteeCities.filter(city => !cityPriceFor(city)))
const availableStores = computed(() => guaranteeStores.filter(store => !storePriceFor(store.id)))
const storeCities = computed(() => guaranteeCities.filter(city => availableStores.value.some(store => store.city === city)))

const dialogOpen = ref(false)
const adding = ref(false)
const editTier = ref(null)
const form = ref({ city: '', storeCity: '', storeId: '', employeeId: null, cells: {}, tiers: {} })
const emptyCells = () => Object.fromEntries(volumeTiers.value.map(tier => [tier.key, Object.fromEntries(priceItems.map(item => [item.key, null]))]))
const tierFormSnapshot = () => Object.fromEntries(volumeTiers.value.map(tier => [tier.key, { from: tier.from, to: tier.to }]))
const visibleTiers = computed(() => editTier.value ? volumeTiers.value.filter(tier => tier.key === editTier.value) : volumeTiers.value)
const dialogTitle = computed(() => {
  if (adding.value) return addLabelMap[scope.value]
  const tier = editTier.value ? volumeTierLabel(volumeTiers.value.find(item => item.key === editTier.value) || {}) : ''
  return `${selectedTitle.value} · ${headcountLabel.value} · ${tier}`
})
const addingStores = computed(() => {
  if (scope.value === 'person') return guaranteeStores.filter(store => !personStorePriceFor(form.value.employeeId, store.id))
  return availableStores.value.filter(store => store.city === form.value.storeCity)
})
const parentTarget = computed(() => {
  if (selected.value === 'general') return {}
  const item = selectedItem.value
  if (!item) return {}
  return { city: item.city, storeId: item.storeId, employeeId: item.employeeId }
})
function inheritPlaceholder(tier, item) {
  if (adding.value) return '继承'
  const parent = resolveAt({ ...parentTarget.value, headcountKey: headcountKey.value, tierKey: tier.key, skip: [scope.value === 'general' ? 'general' : scope.value] })
  const value = parent.prices[item.key]
  return value == null ? '无上级可继承' : `继承 ${Number(value).toFixed(2)}`
}
function openAddTier() {
  tierCount.value = maxTier.value.count + 1
  tierDialogOpen.value = true
}
function confirmAddTier() {
  const error = addHeadcountTier(tierCount.value)
  if (error) return ElMessage.error(error)
  headcountKey.value = `hc${Number(tierCount.value)}`
  tierDialogOpen.value = false
  ElMessage.success(`已新增「${tierCount.value} 人」档`)
}
function openAdd() {
  if (scope.value === 'person' && !employees.length) return
  adding.value = true
  editTier.value = null
  form.value = { city: '', storeCity: '', storeId: '', employeeId: null, cells: emptyCells(), tiers: tierFormSnapshot() }
  dialogOpen.value = true
}
function openEdit(row) {
  adding.value = false
  editTier.value = row.key
  const item = selectedItem.value
  const ruleCells = selected.value === 'general' ? unitPriceStore.generalCells : item?.raw?.cells
  form.value = {
    city: item?.city || '', storeCity: item?.city || '', storeId: item?.storeId || '', employeeId: item?.employeeId ?? null,
    cells: { ...emptyCells(), [row.key]: Object.fromEntries(priceItems.map(price => [price.key, ruleCells?.[`${headcountKey.value}.${row.key}`]?.[price.key] ?? null])) },
    tiers: tierFormSnapshot()
  }
  dialogOpen.value = true
}
watch(() => form.value.storeCity, city => {
  if (scope.value === 'store' && adding.value && storeOf(form.value.storeId)?.city !== city) form.value.storeId = ''
})
watch(() => form.value.employeeId, () => {
  if (scope.value === 'person' && adding.value && personStorePriceFor(form.value.employeeId, form.value.storeId)) form.value.storeId = ''
})
function save() {
  const tierRows = volumeTiers.value.map(tier => ({ key: tier.key, from: form.value.tiers[tier.key]?.from, to: form.value.tiers[tier.key]?.to }))
  const tierError = validateVolumeTiers(tierRows)
  if (tierError) return ElMessage.error(tierError)
  const rowsToSave = Object.fromEntries(visibleTiers.value.map(tier => [tier.key, form.value.cells[tier.key]]))
  let error = ''
  if (adding.value && scope.value === 'city') error = saveCityPrices({ city: form.value.city, headcountKey: headcountKey.value, rows: rowsToSave })
  else if (adding.value && scope.value === 'store') error = saveStorePrices({ storeId: form.value.storeId, headcountKey: headcountKey.value, rows: rowsToSave })
  else if (adding.value && scope.value === 'person') error = savePersonStorePrices({ employeeId: form.value.employeeId, storeId: form.value.storeId, headcountKey: headcountKey.value, rows: rowsToSave })
  else if (scope.value === 'general') error = saveGeneralCells(headcountKey.value, rowsToSave)
  else if (scope.value === 'city') error = saveCityPrices({ city: selectedItem.value.city, headcountKey: headcountKey.value, rows: rowsToSave })
  else if (scope.value === 'store') error = saveStorePrices({ storeId: selectedItem.value.storeId, headcountKey: headcountKey.value, rows: rowsToSave })
  else error = savePersonStorePrices({ employeeId: selectedItem.value.employeeId, storeId: selectedItem.value.storeId, headcountKey: headcountKey.value, rows: rowsToSave })
  if (error) return ElMessage.error(error)
  error = saveVolumeTiers(tierRows)
  if (error) return ElMessage.error(error)
  if (adding.value) selected.value = scope.value === 'city' ? form.value.city : scope.value === 'store' ? form.value.storeId : `${form.value.employeeId}:${form.value.storeId}`
  dialogOpen.value = false
  ElMessage.success('单价已保存')
}
async function voidSelected() {
  const item = selectedItem.value
  if (!item) return
  const message = scope.value === 'city' ? `作废${item.city}城市标准后，该城市未配置的门店与个人按上级取值。`
    : scope.value === 'store' ? `作废${item.name}门店标准后，该店未配置的个人按城市、通用取值。`
      : `作废${item.name}的个人标准？`
  try { await ElMessageBox.confirm(`${message}作废保留历史，可重新新增。`, '作废收入单价', { confirmButtonText: '作废', cancelButtonText: '取消' }) } catch { return }
  if (scope.value === 'city') deleteCityPrices(item.city)
  else if (scope.value === 'store') deleteStorePrices(item.storeId)
  else deletePersonStorePrices(item.employeeId, item.storeId)
  selected.value = 'general'
  ElMessage.success('已作废')
}
</script>

<style scoped>
.price-page { padding:24px; background:#fff; min-height:100%; color:#303133; }
header { margin-bottom:18px; } h1 { font-size:22px; margin:0 0 8px; } header p { margin:0; font-size:13px; color:#888; }
.rule-bar { border:1px solid #f0e3e7; background:#fdfafb; border-radius:4px; padding:10px 14px; font-size:13px; line-height:1.7; color:#5a5a5a; margin-bottom:18px; }
.rule-bar strong { color:#8c3350; font-weight:600; }
.price-layout { display:grid; grid-template-columns:186px minmax(0,1fr); gap:20px; border-top:1px solid #e5e7eb; padding-top:18px; }
.headcount-rail { border-right:1px solid #e5e7eb; padding-right:16px; }
.rail-heading { font-size:13px; color:#888; margin-bottom:10px; }
.rail-item { display:block; box-sizing:border-box; width:100%; text-align:left; font:inherit; padding:12px; margin-bottom:8px; border:1px solid #e5e7eb; border-radius:4px; background:#fff; cursor:pointer; color:#303133; }
.rail-item strong { display:block; font-size:15px; } .rail-item small { display:block; font-size:12px; color:#888; margin-top:4px; line-height:1.4; }
.rail-item:hover { border-color:#b9a1a9; } .rail-item.active { border-color:#bd8498; background:#fcf5f7; }
.rail-add { display:flex; align-items:center; justify-content:center; gap:6px; box-sizing:border-box; width:100%; padding:10px; border:1px dashed #d8c2ca; border-radius:4px; background:#fff; color:#8c3350; font:inherit; font-size:13px; cursor:pointer; }
.rail-add:hover { border-color:#bd8498; background:#fcf5f7; }
.rail-note { font-size:12px; color:#909399; line-height:1.6; margin:10px 0 0; }
.tier-form { display:flex; align-items:center; gap:12px; }
.tier-label { font-size:13px; color:#303133; }
.tier-hint { font-size:12px; color:#909399; line-height:1.7; margin:12px 0 0; }
.scope-main { min-width:0; }
.scope-tabs :deep(.el-tabs__header) { margin-bottom:14px; }
.scope-body { display:grid; grid-template-columns:250px minmax(0,1fr); gap:18px; }
.scope-list { border-right:1px solid #eee; padding-right:14px; max-height:640px; overflow:auto; }
.list-heading { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:10px; font-size:13px; color:#555; }
.list-heading small { color:#888; margin-left:8px; } .list-search { margin-bottom:10px; }
.scope-item { display:block; box-sizing:border-box; width:100%; text-align:left; font:inherit; padding:11px 12px; margin-bottom:6px; border:1px solid #e5e7eb; border-radius:4px; background:#fff; cursor:pointer; color:#303133; }
.scope-item span { display:block; font-size:14px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.scope-item small { display:block; font-size:12px; color:#888; margin-top:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.scope-item:hover { border-color:#b9a1a9; } .scope-item.active { border-color:#bd8498; background:#fcf5f7; }
.empty-text { font-size:13px; color:#888; padding:18px 4px; text-align:center; }
.voided-records { border-top:1px solid #e5e7eb; margin-top:12px; padding-top:10px; font-size:12px; color:#909399; }
.voided-records p { margin:6px 0 0; line-height:1.5; }
.scope-detail { min-width:0; }
.detail-heading { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:12px; }
.detail-heading h2 { font-size:16px; margin:0 0 6px; } .detail-heading small { font-size:12px; color:#888; line-height:1.6; display:block; }
.rate-table { width:100%; } .tier-range { display:block; font-size:11px; color:#a8a8a8; margin-top:3px; }
.rate-value strong { display:block; font-size:15px; font-variant-numeric:tabular-nums; }
.rate-value small { display:block; font-size:11px; color:#8c3350; margin-top:2px; }
.rate-value.inherited strong { color:#6b7280; font-weight:500; } .rate-value.inherited small { color:#557284; }
.table-note { font-size:12px; color:#909399; margin:10px 0 0; }
.form-static { font-size:13px; color:#303133; } .form-static em { font-style:normal; font-size:12px; color:#909399; margin-left:10px; }
.cell-grid { width:100%; border-collapse:collapse; font-size:13px; }
.cell-grid th, .cell-grid td { border:1px solid #ebeef5; padding:8px 10px; text-align:left; }
.cell-grid th:first-child, .cell-grid td:first-child { width:220px; white-space:nowrap; }
.cell-grid th { background:#fafafa; font-weight:600; color:#555; } .cell-grid td:first-child { color:#303133; }
.range-inputs { display:flex; align-items:center; gap:4px; }
.range-inputs .el-input-number { flex:1; min-width:0; }
.range-sep { flex:0 0 auto; color:#909399; }
.cell-grid :deep(.el-input-number) { width:100%; }
.dialog-note { font-size:12px; color:#909399; margin:12px 0 0; line-height:1.6; }
@media(max-width:1024px) {
  .price-page { padding:16px; } .price-layout { grid-template-columns:1fr; } .headcount-rail { border-right:0; border-bottom:1px solid #e5e7eb; padding:0 0 14px; display:flex; flex-wrap:wrap; gap:8px; }
  .rail-heading { flex:0 0 100%; } .rail-item { flex:1 1 150px; margin:0; } .rail-note { flex:0 0 100%; }
  .scope-body { grid-template-columns:1fr; } .scope-list { border-right:0; border-bottom:1px solid #eee; padding:0 0 12px; max-height:none; }
}
</style>
