<template>
  <div class="cats-page">
    <!-- 页头 -->
    <div class="cats-head">
      <el-button link class="back-btn" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回排班策略 v5
      </el-button>
      <div class="head-main">
        <h2>品牌分类</h2>
        <span class="head-sub">外层 tab 的分类清单 + 门店归属：两层，分类 → 门店，没有中间层</span>
      </div>
    </div>

    <div class="cats-body">
      <!-- 左：分类清单 -->
      <aside class="cat-rail">
        <div class="rail-head">
          <strong>分类</strong>
          <el-button link size="small" type="primary" @click="startAdd">+ 新增分类</el-button>
        </div>
        <div class="rail-add" v-if="adding">
          <el-input v-model="addName" size="small" placeholder="如 加盟品牌店" @keyup.enter="doAdd" />
          <div class="ra-acts">
            <el-button size="small" type="primary" @click="doAdd">添加</el-button>
            <el-button size="small" @click="adding = false">取消</el-button>
          </div>
        </div>
        <div class="rail-list">
          <div
            v-for="c in cats"
            :key="c.id"
            class="rail-row"
            :class="{ on: cat === c.id }"
            @click="pickCat(c.id)"
          >
            <template v-if="renaming === c.id">
              <el-input
                v-model="renameVal"
                size="small"
                @keyup.enter="doRename(c)"
                @blur="doRename(c)"
                @click.stop
              />
            </template>
            <template v-else>
              <span class="rr-name">{{ c.name }}</span>
              <em class="rr-n">{{ usage(c.id).length }}</em>
              <span class="rr-acts" @click.stop>
                <el-button link size="small" @click="startRename(c)">改名</el-button>
                <el-button link size="small" type="danger" @click="doRemove(c)">删除</el-button>
              </span>
            </template>
          </div>
          <div v-if="loose.length" class="rail-row loose" :class="{ on: cat === NONE }" @click="pickCat(NONE)">
            <span class="rr-name">未归分类</span>
            <em class="rr-n warn">{{ loose.length }}</em>
          </div>
        </div>
        <div class="rail-foot">
          外层 tab 就按这份清单出；分类下有门店时不能删，先移走门店。
        </div>
      </aside>

      <!-- 右：门店归属 -->
      <main class="cat-main">
        <div class="main-head">
          <div class="mh-title">
            <strong>{{ cat === NONE ? '未归分类' : (curCat?.name || '') }}</strong>
            <span class="mh-n">{{ list.length }} 家门店</span>
            <span v-if="cat === NONE" class="mh-tip">这些门店没有分类，不会出现在外层任何 tab 里</span>
          </div>
          <div class="mh-acts">
            <el-input v-model="kw" size="small" placeholder="搜门店名 / 城市" clearable style="width: 200px" />
            <el-button v-if="cat !== NONE" size="small" type="primary" @click="openPicker">+ 添加门店</el-button>
          </div>
        </div>

        <!-- 勾选后出现批量条：一次处理多家 -->
        <div v-if="picked.length" class="bulk-bar">
          <span>已选 <strong>{{ picked.length }}</strong> 家</span>
          <template v-if="cat === NONE">
            <span class="bb-label">归入</span>
            <el-select v-model="bulkCat" size="small" placeholder="选一个分类" style="width: 180px">
              <el-option v-for="c in cats" :key="c.id" :label="c.name" :value="c.id" />
            </el-select>
            <el-button size="small" type="primary" :disabled="!bulkCat" @click="bulkAssign">确定归入</el-button>
          </template>
          <el-button v-else size="small" @click="bulkOut">移出本分类</el-button>
          <el-button size="small" link @click="clearPick">取消选择</el-button>
        </div>

        <el-table
          ref="tableRef"
          :data="rows"
          size="small"
          class="shop-table"
          @selection-change="onSelect"
        >
          <el-table-column type="selection" width="42" />
          <el-table-column prop="name" label="门店" min-width="140" />
          <el-table-column prop="city" label="城市" width="90" />
          <el-table-column label="营业时间" width="130">
            <template #default="{ row }">{{ row.bizStart }}–{{ row.bizEnd }}</template>
          </el-table-column>
          <el-table-column label="分类" width="150">
            <template #default="{ row }">
              <span v-if="row.cat" class="cat-tag">{{ spaceCatName(row.cat) }}</span>
              <span v-else class="cat-tag none">未归分类</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="110" align="right">
            <template #default="{ row }">
              <el-button v-if="row.cat" link size="small" @click="moveOut(row)">移出</el-button>
              <el-select
                v-else
                size="small"
                placeholder="归入"
                style="width: 96px"
                @change="val => assignOne(row, val)"
              >
                <el-option v-for="c in cats" :key="c.id" :label="c.name" :value="c.id" />
              </el-select>
            </template>
          </el-table-column>
        </el-table>
        <TablePagination v-model:page="page" v-model:page-size="pageSize" :total="total" />
      </main>
    </div>

    <!-- 添加门店：一次勾多家，不用逐店下拉 -->
    <el-dialog v-model="picker" title="添加门店" width="620px">
      <div class="pick-hint">左边选分类，右边勾门店——只列还没在这个分类里的门店。一次可以加多家。</div>
      <div class="pick-bar">
        <el-input v-model="pickKw" size="small" placeholder="搜门店名 / 城市" clearable style="width: 220px" />
        <span class="pick-to">加入：<strong>{{ curCat?.name }}</strong></span>
      </div>
      <el-table :data="pickRows" size="small" max-height="320" @selection-change="onPick">
        <el-table-column type="selection" width="42" />
        <el-table-column prop="name" label="门店" min-width="140" />
        <el-table-column prop="city" label="城市" width="90" />
        <el-table-column label="当前分类" width="150">
          <template #default="{ row }">
            <span v-if="row.cat" class="cat-tag">{{ spaceCatName(row.cat) }}</span>
            <span v-else class="cat-tag none">未归分类</span>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="!pickRows.length" class="pick-empty">没有可加的门店了</div>
      <template #footer>
        <span class="pick-count">已选 {{ pickSel.length }} 家</span>
        <el-button @click="picker = false">取消</el-button>
        <el-button type="primary" :disabled="!pickSel.length" @click="confirmAdd">加入本分类</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import TablePagination from '../components/TablePagination.vue'
import { usePager } from '../composables/usePager.js'
import {
  v5, spaceCats, spaceCatName, spaceCatUsage, addSpaceCat, renameSpaceCat, setSpaceCat, removeSpaceCat
} from '../mock/scheduleV5Store.js'

const route = useRoute()
const router = useRouter()
const NONE = '__none'

/* 门店 = 非办公区的空间；办公区不是门店，不参与分类 */
const shops = computed(() => v5.spaces.filter(s => !s.office))
const cats = computed(() => spaceCats.value)
const loose = computed(() => shops.value.filter(s => !s.cat))

const cat = ref(cats.value.some(c => c.id === (route.query.cat || '')) ? route.query.cat : (cats.value[0]?.id || NONE))
const curCat = computed(() => cats.value.find(c => c.id === cat.value) || null)
const usage = id => spaceCatUsage(id)

const kw = ref('')
const list = computed(() => {
  const base = cat.value === NONE ? loose.value : shops.value.filter(s => s.cat === cat.value)
  const k = kw.value.trim()
  return k ? base.filter(s => s.name.includes(k) || s.city.includes(k)) : base
})
const { page, pageSize, total, rows } = usePager(list, 10)
watch(cat, () => { kw.value = '' })
function pickCat(id) {
  cat.value = id
  renaming.value = ''
  page.value = 1
  clearPick()
  router.replace({ query: { ...route.query, cat: id === NONE ? undefined : id } })
}

/* 左侧：新增 / 改名 / 删除 */
const adding = ref(false)
const addName = ref('')
function startAdd() { adding.value = true; addName.value = '' }
function doAdd() {
  const r = addSpaceCat(addName.value)
  if (!r.ok) { ElMessage.warning(r.reason); return }
  adding.value = false
  cat.value = r.cat.id
  ElMessage.success('分类已添加，外层多了一个 tab')
}
const renaming = ref('')
const renameVal = ref('')
function startRename(c) { renaming.value = c.id; renameVal.value = c.name }
function doRename(c) {
  if (renaming.value !== c.id) return
  const r = renameSpaceCat(c.id, renameVal.value)
  renaming.value = ''
  if (!r.ok) { ElMessage.warning(r.reason); return }
}
async function doRemove(c) {
  const used = usage(c.id)
  if (used.length) { ElMessage.warning(`「${c.name}」里还有 ${used.length} 家门店，先把门店移出去`); return }
  try {
    await ElMessageBox.confirm(`删除分类「${c.name}」？现在没有门店在它里面，删了不影响任何门店。`, '删除分类', {
      type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消'
    })
    const r = removeSpaceCat(c.id)
    if (!r.ok) { ElMessage.warning(r.reason); return }
    if (cat.value === c.id) cat.value = cats.value[0]?.id || NONE
  } catch { /* 取消 */ }
}

/* 批量：勾选多家后一次移出 / 一次归入 */
const picked = ref([])
const bulkCat = ref('')
function onSelect(sel) { picked.value = sel }
function clearPick() { picked.value = []; bulkCat.value = ''; tableRef.value?.clearSelection?.() }
const tableRef = ref(null)
function bulkOut() {
  picked.value.forEach(s => setSpaceCat(s.id, ''))
  const n = picked.value.length
  clearPick()
  ElMessage.success(`${n} 家门店已移出，归到「未归分类」`)
}
function bulkAssign() {
  if (!bulkCat.value) return
  const n = picked.value.length
  picked.value.forEach(s => setSpaceCat(s.id, bulkCat.value))
  clearPick()
  ElMessage.success(`${n} 家门店已归入「${spaceCatName(bulkCat.value)}」`)
}
function moveOut(row) {
  setSpaceCat(row.id, '')
  ElMessage.success(`「${row.name}」已移出，归到「未归分类」`)
}
function assignOne(row, catId) {
  setSpaceCat(row.id, catId)
  ElMessage.success(`「${row.name}」已归入「${spaceCatName(catId)}」`)
}

/* 添加门店：把还没在这个分类里的门店一次勾进来 */
const picker = ref(false)
const pickKw = ref('')
const pickSel = ref([])
const pickRows = computed(() => {
  const k = pickKw.value.trim()
  return shops.value
    .filter(s => s.cat !== cat.value)
    .filter(s => !k || s.name.includes(k) || s.city.includes(k))
})
function openPicker() { pickKw.value = ''; pickSel.value = []; picker.value = true }
function onPick(sel) { pickSel.value = sel }
function confirmAdd() {
  const n = pickSel.value.length
  pickSel.value.forEach(s => setSpaceCat(s.id, cat.value))
  picker.value = false
  ElMessage.success(`${n} 家门店已加入「${curCat.value?.name}」`)
}

function goBack() { router.push('/schedule-v5') }
</script>

<style scoped>
.cats-page { padding: 16px 20px 28px; }
.cats-head { display: flex; align-items: center; gap: 14px; margin-bottom: 12px; }
.back-btn { color: #6a6a75; font-size: 12.5px; }
.head-main { display: flex; align-items: baseline; gap: 10px; }
.head-main h2 { margin: 0; font-size: 17px; color: #2c2c2a; }
.head-sub { font-size: 12px; color: #9a9fa9; }

.cats-body { display: flex; gap: 14px; align-items: flex-start; }

.cat-rail { width: 248px; flex: 0 0 248px; background: #fff; border: 1px solid #eee6e8; border-radius: 10px; padding: 12px; }
.rail-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.rail-head strong { font-size: 13px; color: #2c2c2a; }
.rail-add { border: 1px dashed #eee6e8; border-radius: 8px; padding: 8px; margin-bottom: 8px; }
.ra-acts { display: flex; gap: 6px; margin-top: 6px; }
.rail-list { display: flex; flex-direction: column; gap: 2px; }
.rail-row { display: flex; align-items: center; gap: 8px; padding: 7px 8px; border-radius: 6px; cursor: pointer; font-size: 12.5px; color: #4a4a55; }
.rail-row:hover { background: #faf7f8; }
.rail-row.on { background: #fdf1f4; color: #a40035; font-weight: 500; }
.rr-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rr-n { font-style: normal; font-size: 11px; color: #b0b0b8; }
.rr-n.warn { color: #c07a1a; }
.rr-acts { display: none; gap: 2px; }
.rail-row:hover .rr-acts { display: inline-flex; }
.rail-row.loose { border-top: 1px dashed #eee6e8; margin-top: 6px; padding-top: 9px; border-radius: 0 0 6px 6px; }
.rail-foot { margin-top: 10px; font-size: 11.5px; color: #9a9fa9; line-height: 1.6; }

.cat-main { flex: 1; min-width: 0; background: #fff; border: 1px solid #eee6e8; border-radius: 10px; padding: 12px 14px 6px; }
.main-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
.mh-title { display: flex; align-items: baseline; gap: 8px; min-width: 0; }
.mh-title strong { font-size: 14px; color: #2c2c2a; }
.mh-n { font-size: 12px; color: #9a9fa9; }
.mh-tip { font-size: 11.5px; color: #c07a1a; }
.mh-acts { display: flex; align-items: center; gap: 8px; }

.bulk-bar { display: flex; align-items: center; gap: 10px; background: #fdf1f4; border: 1px solid #f3dde3; border-radius: 8px; padding: 7px 10px; margin-bottom: 10px; font-size: 12.5px; color: #6a3a48; }
.bulk-bar strong { color: #a40035; }
.bb-label { color: #8a6a76; }

.shop-table { width: 100%; }
.cat-tag { font-size: 11.5px; color: #6a4b8a; background: #f4eefb; border-radius: 4px; padding: 1px 6px; }
.cat-tag.none { color: #b0761a; background: #fdf3e2; }

.pick-hint { font-size: 12px; color: #8a8a95; margin-bottom: 10px; line-height: 1.6; }
.pick-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.pick-to { font-size: 12px; color: #6a6a75; }
.pick-to strong { color: #a40035; }
.pick-empty { font-size: 12px; color: #9a9fa9; padding: 12px 2px 0; }
.pick-count { float: left; font-size: 12px; color: #8a8a95; line-height: 32px; }
</style>
