<template>
  <div class="gp-detail">
    <div class="detail-header">
      <div class="header-left">
        <el-button link class="back-btn" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </el-button>
        <h2>{{ draft.name || '未命名配置' }}</h2>
        <el-tag size="small" effect="plain">{{ VALUE_TYPE_LABELS.table }}</el-tag>
      </div>
      <div class="header-right">
        <el-button @click="goBack">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </div>

    <el-empty v-if="!param" description="配置不存在或已删除，请返回列表" />

    <template v-else>
      <!-- 基础信息 -->
      <section class="card">
        <div class="card-head">
          <h3>基础信息</h3>
        </div>
        <el-form label-width="88px" class="base-form">
          <el-form-item label="配置名称" required>
            <el-input v-model="draft.name" placeholder="请输入配置名称" maxlength="40" show-word-limit style="width: 320px;" />
          </el-form-item>
          <el-form-item label="值类型">
            <el-tag size="small" effect="light">{{ VALUE_TYPE_LABELS.table }}</el-tag>
            <span class="hint inline">列的定义与数据在下方维护；查询条件、取值列、单值还是相加，在引用它的取值函数上配置。</span>
          </el-form-item>
        </el-form>
      </section>

      <!-- 列 -->
      <section class="card">
        <div class="card-head">
          <h3>列</h3>
          <span class="head-meta">共 {{ draft.columns.length }} 列 · 列名不可重复</span>
        </div>
        <div class="col-list">
          <div v-for="(col, index) in draft.columns" :key="'col-' + index" class="col-row">
            <div class="col-name">
              <el-input
                v-model="col.name"
                placeholder="请输入列名"
                maxlength="20"
                :class="{ 'is-dup': isDup(col.name) }"
                @focus="onColFocus(col)"
                @blur="onColBlur(col)"
              />
              <span v-if="isDup(col.name)" class="col-error">列名重复</span>
            </div>
            <el-select v-model="col.type" class="col-type">
              <el-option v-for="t in DIM_TYPES" :key="t.value" :label="t.label" :value="t.value" />
            </el-select>
            <el-button class="col-remove" link @click="removeCol(index)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
          <div v-if="!draft.columns.length" class="empty-line">还没有列，先添加列，再录入或导入数据</div>
          <el-button class="add-col-btn" size="small" @click="addCol">+ 添加列</el-button>
        </div>
        <p class="hint">
          一张纯粹的二维表，所有列平等、不区分角色。哪列当条件、取哪一列、按什么顺序取，都由引用处的取值函数按需配置；同一个参数在不同薪酬项里可以按不同规则取值。
        </p>
      </section>

      <!-- 数据 -->
      <section class="card">
        <div class="card-head">
          <h3>数据</h3>
          <div class="head-actions">
            <span class="head-meta">共 {{ filledRowCount }} 行</span>
            <el-button size="small" plain :disabled="!columnsReady" @click="openImport">导入数据</el-button>
            <el-button size="small" plain :disabled="!filledRowCount" @click="handleExport">导出数据</el-button>
            <el-button size="small" plain :disabled="!draft.columns.length" @click="addRow">+ 添加行</el-button>
            <el-button size="small" plain type="danger" :disabled="!filledRowCount" @click="clearRows">清空数据</el-button>
          </div>
        </div>

        <el-table v-if="draft.columns.length" :data="draft.rows" border size="small" max-height="560" class="data-table">
          <el-table-column type="index" label="行" width="56" align="center" />
          <el-table-column
            v-for="(col, ci) in draft.columns"
            :key="'data-' + ci"
            :label="colLabel(col)"
            :min-width="col.type === 'number' ? 130 : 110"
          >
            <template #default="{ row }">
              <el-input v-model="row.cells[col.name]" size="small" placeholder="留空" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="72" align="center" fixed="right">
            <template #default="{ $index }">
              <el-button type="danger" link size="small" @click="removeRow($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="先添加列，才能录入数据" :image-size="60" />

        <p class="hint">
          单元格留空由取值函数解释：条件格留空 = 不约束该维；值列格留空 = 未设置（穿透到下一行 / 下一列）。比较符号（等于 / 不等于 / 大于 / 大于等于 / 小于 / 小于等于）在引用处声明，格子里只放数据。
        </p>
      </section>

      <!-- 试算 -->
      <section class="card">
        <div class="card-head">
          <h3>试算</h3>
          <el-button link type="primary" size="small" @click="resetTryDefaults">恢复默认取值</el-button>
        </div>
        <div class="try-config">
          <el-radio-group v-model="tryMode" size="small">
            <el-radio-button value="single">取 1 列</el-radio-button>
            <el-radio-button value="sum">取多列相加</el-radio-button>
          </el-radio-group>
          <el-select v-model="tryValueCols" multiple collapse-tags size="small" placeholder="取值列" style="width: 300px;">
            <el-option v-for="c in tryColOptions" :key="c" :label="c" :value="c" />
          </el-select>
        </div>
        <div class="try-cond-row try-cond-head">
          <span class="try-label">条件</span>
          <span>条件列</span>
          <span>符号</span>
          <span>传入的值</span>
          <span></span>
        </div>
        <div v-for="(r, i) in tryConds" :key="'try-' + i" class="try-cond-row">
          <span class="try-label"></span>
          <el-select v-model="r.col" size="small" placeholder="条件列" @change="onTryColChange(r)">
            <el-option v-for="c in tryColOptions" :key="c" :label="c" :value="c" />
          </el-select>
          <el-select v-model="r.op" size="small">
            <el-option v-for="o in opsForTryRow(r)" :key="o.value" :label="`${o.symbol} ${o.label}`" :value="o.value" />
          </el-select>
          <el-input v-model="r.value" size="small" :placeholder="valPlaceholder(r)" />
          <el-button size="small" link type="danger" @click="tryConds.splice(i, 1)">删除</el-button>
        </div>
        <div class="try-actions">
          <el-button size="small" plain type="primary" :disabled="!tryAddable" @click="addTryCond">+ 添加条件</el-button>
          <el-button type="primary" plain size="small" :disabled="!filledRowCount || !tryValueCols.length" @click="runTry">试算</el-button>
        </div>
        <p v-if="tryResult" class="try-result" :class="{ err: tryFailed }">{{ tryResult }}</p>
        <p class="hint">按「条件列 符号 传入的值」读：行里这一列有值，就要传入并命中；留空不约束，都取不到时落条件列全空的那一行。区间就用两列配两条——「下限 ≤ 值」「上限 &gt; 值」。</p>
      </section>
    </template>

    <!-- 导入数据 -->
    <el-dialog v-model="importVisible" title="导入数据" width="min(660px, 94vw)" :close-on-click-modal="false" @closed="resetImport">
      <div class="import-steps">
        <div class="import-step">
          <span class="step-no">1</span>
          <div class="step-body">
            <p class="step-title">下载导入模板</p>
            <p class="step-desc">模板按当前 {{ draft.columns.length }} 列生成，表头就是列名</p>
          </div>
          <el-button class="step-button" :loading="templateBusy" :disabled="!columnsReady" @click="downloadTemplate">下载模板</el-button>
        </div>
        <div class="import-step">
          <span class="step-no">2</span>
          <div class="step-body">
            <p class="step-title">上传填写好的文件</p>
            <p class="step-desc">{{ importFileName || '支持 Excel / CSV，一行一条数据' }}</p>
          </div>
          <el-button class="step-button" @click="importInput?.click()">{{ importFileName ? '重新上传' : '上传文件' }}</el-button>
        </div>
      </div>

      <div v-if="importStats" class="import-result">
        <el-icon><CircleCheck /></el-icon>
        <span>已读取 {{ importStats.rows }} 行数据，对齐 {{ importStats.matched.length }} 列</span>
      </div>
      <p v-if="importUnknown.length" class="import-note">
        表头里的 {{ importUnknown.join('、') }} 不在当前列里，导入时会忽略
      </p>
      <ul v-if="importErrors.length" class="import-errors">
        <li v-for="(error, index) in visibleImportErrors" :key="index">
          {{ error.line ? `第 ${error.line} 行：` : '' }}{{ error.message }}
        </li>
        <li v-if="importErrors.length > visibleImportErrors.length" class="more">
          另外还有 {{ importErrors.length - visibleImportErrors.length }} 处问题，请先在文件里改完再上传
        </li>
      </ul>

      <div class="import-mode">
        <span class="mode-label">导入方式</span>
        <el-radio-group v-model="importMode" size="small">
          <el-radio-button value="replace">覆盖当前数据</el-radio-button>
          <el-radio-button value="append">追加到末尾</el-radio-button>
        </el-radio-group>
      </div>

      <input ref="importInput" type="file" accept=".xlsx,.xls,.csv" hidden @change="handleImportFile" />
      <template #footer>
        <el-button @click="importVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!canImport" :loading="importBusy" @click="confirmImport">导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, CircleCheck, Delete } from '@element-plus/icons-vue'
import { DIM_TYPES, VALUE_TYPE_LABELS, resolveParam, opsForType } from '../mock/generalParams.js'
import { findParam, nowText } from '../mock/generalParamStore.js'
import {
  duplicateColNames,
  headerOf,
  paramSheetAoa,
  parseSheetAoa,
  templateAoa,
  templateGuideAoa
} from '../mock/generalParamSheet.js'

const route = useRoute()
const router = useRouter()

const param = computed(() => findParam(route.params.id))

const clone = (value) => JSON.parse(JSON.stringify(value ?? null))

const draft = reactive({ name: '', columns: [], rows: [] })

// ===== 列 =====

const dupNames = computed(() => duplicateColNames(draft.columns))
const isDup = (name) => dupNames.value.includes(String(name ?? '').trim())

const columnsReady = computed(() =>
  draft.columns.length > 0 && draft.columns.every(c => String(c.name ?? '').trim() !== '') && !dupNames.value.length
)

const colOldName = new WeakMap()

/** 改列名时把行数据跟着搬到新列名下，避免数据留在旧列 */
function onColFocus (col) {
  colOldName.set(col, col.name)
}

function onColBlur (col) {
  const oldName = colOldName.get(col)
  col.name = String(col.name ?? '').trim()
  const newName = col.name
  if (oldName !== undefined && oldName !== newName && oldName) {
    draft.rows.forEach((row) => {
      if (!(oldName in row.cells)) return
      if (!(newName in row.cells)) row.cells[newName] = row.cells[oldName]
      delete row.cells[oldName]
    })
  }
  if (newName) draft.rows.forEach(row => { if (!(newName in row.cells)) row.cells[newName] = '' })
}

function addCol () {
  draft.columns.push({ name: '', type: 'text' })
}

function removeCol (index) {
  const [removed] = draft.columns.splice(index, 1)
  const name = String(removed?.name ?? '').trim()
  if (!name) return
  draft.rows.forEach(row => { delete row.cells[name] })
}

function colLabel (col) {
  const name = String(col.name ?? '').trim() || '列'
  return col.type === 'number' ? `${name}（数值）` : col.type === 'date' ? `${name}（日期）` : name
}

// ===== 行 =====

const filledRowCount = computed(() => draft.rows.filter(row =>
  draft.columns.some(c => String(row.cells?.[String(c.name ?? '').trim()] ?? '').trim() !== '')
).length)

function addRow () {
  draft.rows.push({ cells: Object.fromEntries(draft.columns.map(c => [String(c.name ?? '').trim(), ''])) })
}

function removeRow (index) {
  draft.rows.splice(index, 1)
}

/** 清空全部数据行：列保留，只清数据；要保存才生效 */
async function clearRows () {
  const count = filledRowCount.value
  const total = draft.rows.length
  try {
    await ElMessageBox.confirm(
      `将删除这张表的全部 ${total} 行数据（其中 ${count} 行有内容），列定义保留。清空后引用它的薪酬项会取不到值，需要重新录入或导入；本页保存后才会生效。`,
      '清空数据',
      {
        confirmButtonText: '清空',
        cancelButtonText: '取消',
        confirmButtonClass: 'el-button--danger',
        type: 'warning'
      }
    )
  } catch { return }
  draft.rows = []
  ElMessage.success(`已清空 ${count} 行数据，保存后生效`)
}

// ===== 试算 =====

const tryMode = ref('single')
const tryValueCols = ref([])
/** 试算条件：一行 = 「条件列 符号 传入的值」，值就地输入（试算不接上下文，直接给值） */
const tryConds = ref([])
const tryResult = ref('')
const tryFailed = ref(false)

const tryColOptions = computed(() => draft.columns.map(c => String(c.name ?? '').trim()).filter(Boolean))

const tryColType = (name) => draft.columns.find(c => String(c.name ?? '').trim() === String(name ?? '').trim())?.type
const opsForTryRow = (row) => opsForType(tryColType(row.col))
const valPlaceholder = (row) => {
  const type = tryColType(row.col)
  if (type === 'number') return '输入数值'
  if (type === 'date') return '2026-11-01'
  return '输入值'
}

/** 还能加条件：还有列没被条件 / 取值列占用 */
const tryAddable = computed(() => tryColOptions.value.some(name =>
  !tryValueCols.value.includes(name) && !tryConds.value.some(c => String(c.col ?? '').trim() === name)
))

const addTryCond = () => {
  const used = new Set(tryConds.value.map(c => String(c.col ?? '').trim()))
  const next = tryColOptions.value.find(n => !used.has(n) && !tryValueCols.value.includes(n)) || ''
  tryConds.value.push({ col: next, op: 'eq', value: '' })
}

/** 换条件列：符号不适用新列类型时回到等于 */
const onTryColChange = (row) => {
  if (!opsForTryRow(row).some(o => o.value === row.op)) row.op = 'eq'
}

/** 默认取值：取最后一列、单值模式，条件列全部摆出来（与引用处的默认一致），可就地改 */
function resetTryDefaults () {
  tryMode.value = 'single'
  tryValueCols.value = tryColOptions.value.length ? [tryColOptions.value[tryColOptions.value.length - 1]] : []
  tryConds.value = tryColOptions.value
    .filter(n => !tryValueCols.value.includes(n))
    .map(n => ({ col: n, op: 'eq', value: '' }))
  tryResult.value = ''
  tryFailed.value = false
}

/** 取值列变了之后，条件行里不能留着同一列 */
watch(() => tryValueCols.value.slice(), () => {
  const valueSet = new Set(tryValueCols.value)
  tryConds.value = tryConds.value.filter(c => !valueSet.has(String(c.col ?? '').trim()))
})

function runTry () {
  const temp = {
    name: draft.name.trim() || '（未命名）',
    enabled: true,
    kind: 'table',
    columns: draft.columns.map(c => ({ ...c, name: String(c.name ?? '').trim() })),
    rows: draft.rows
  }
  const inputs = {}
  const conds = []
  tryConds.value.forEach((r, i) => {
    const col = String(r.col ?? '').trim()
    const value = String(r.value ?? '').trim()
    if (!col || value === '') return
    const key = `__try_${i}`
    inputs[key] = value
    conds.push({ col, op: r.op || 'eq', fact: key })
  })
  const result = resolveParam(temp, inputs, { mode: tryMode.value, valueCols: tryValueCols.value, conds })
  tryFailed.value = !result.ok
  if (!result.ok) { tryResult.value = result.error; return }
  if (tryMode.value === 'sum') {
    const detail = result.hits.map(h => {
      const idx = h.row ? `第 ${draft.rows.indexOf(h.row) + 1} 行` : '缺省 0'
      return `${h.col}=${h.value}（${idx}）`
    }).join(' + ')
    tryResult.value = `相加 = ${result.value}　（${detail}）`
  } else {
    const hit = result.hits[0]
    tryResult.value = `生效「${hit.col}」= ${hit.value}　（第 ${draft.rows.indexOf(hit.row) + 1} 行）`
  }
}

// ===== 导入 / 导出 =====

const importVisible = ref(false)
const importInput = ref(null)
const importFileName = ref('')
const importStats = ref(null)
const importErrors = ref([])
const importUnknown = ref([])
const importMode = ref('replace')
const importBusy = ref(false)
const templateBusy = ref(false)
const importRows = ref([])

const visibleImportErrors = computed(() => importErrors.value.slice(0, 6))
const canImport = computed(() => !!importRows.value.length && !importErrors.value.length && !importBusy.value)

function resetImport () {
  importFileName.value = ''
  importStats.value = null
  importErrors.value = []
  importUnknown.value = []
  importRows.value = []
  importMode.value = 'replace'
  importBusy.value = false
}

function openImport () {
  resetImport()
  importVisible.value = true
}

async function downloadTemplate () {
  templateBusy.value = true
  try {
    const XLSX = await import('xlsx')
    const workbook = XLSX.utils.book_new()
    const sheet = XLSX.utils.aoa_to_sheet(templateAoa({ columns: draft.columns }))
    const widths = headerOf(draft.columns).map(name => ({ wch: Math.max(12, name.length * 2 + 4) }))
    sheet['!cols'] = widths
    XLSX.utils.book_append_sheet(workbook, sheet, '数据')
    const guide = XLSX.utils.aoa_to_sheet(templateGuideAoa({ columns: draft.columns }))
    guide['!cols'] = [{ wch: 18 }, { wch: 8 }, { wch: 56 }]
    XLSX.utils.book_append_sheet(workbook, guide, '填写说明')
    XLSX.writeFile(workbook, `${draft.name.trim() || '数据表'}-导入模板.xlsx`)
    ElMessage.success('模板已下载，填好后回到这里上传')
  } catch {
    ElMessage.error('模板下载失败，请重试')
  } finally {
    templateBusy.value = false
  }
}

const decodeCsv = (buffer) => {
  const utf8 = new TextDecoder('utf-8').decode(buffer)
  if (!utf8.includes('\uFFFD')) return utf8
  try { return new TextDecoder('gbk').decode(buffer) } catch { return utf8 }
}

async function handleImportFile (event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  importBusy.value = true
  importFileName.value = file.name
  importStats.value = null
  importErrors.value = []
  importUnknown.value = []
  try {
    const XLSX = await import('xlsx')
    const buffer = await file.arrayBuffer()
    const payload = file.name.toLowerCase().endsWith('.csv') ? decodeCsv(buffer) : buffer
    const workbook = XLSX.read(payload, { type: typeof payload === 'string' ? 'string' : 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const aoa = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, blankrows: false, defval: '' })
    const parsed = parseSheetAoa(draft.columns, aoa)
    importErrors.value = parsed.errors
    importUnknown.value = parsed.unknown
    importRows.value = parsed.rows
    importStats.value = parsed.rows.length ? { rows: parsed.rows.length, matched: parsed.matched } : null
  } catch {
    importErrors.value = [{ line: 0, message: '文件读不出来，请用下载的模板填写 Excel 或 CSV' }]
  } finally {
    importBusy.value = false
  }
}

function confirmImport () {
  if (!canImport.value) return
  const incoming = importRows.value.map(row => ({ cells: { ...row.cells } }))
  const replace = importMode.value === 'replace'
  draft.rows = replace ? incoming : [...draft.rows, ...incoming]
  importVisible.value = false
  ElMessage.success(`已导入 ${incoming.length} 行${replace ? '，覆盖了原数据' : '，追加在末尾'}，记得保存`)
}

async function handleExport () {
  try {
    const XLSX = await import('xlsx')
    const workbook = XLSX.utils.book_new()
    const sheet = XLSX.utils.aoa_to_sheet(paramSheetAoa({ columns: draft.columns, rows: draft.rows }))
    sheet['!cols'] = headerOf(draft.columns).map(name => ({ wch: Math.max(12, name.length * 2 + 4) }))
    XLSX.utils.book_append_sheet(workbook, sheet, '数据')
    XLSX.writeFile(workbook, `${draft.name.trim() || '数据表'}-数据.xlsx`)
    ElMessage.success('数据已导出')
  } catch {
    ElMessage.error('导出失败，请重试')
  }
}

// ===== 保存 / 离开 =====

const snapshot = () => JSON.stringify({
  name: draft.name.trim(),
  columns: draft.columns.map(c => ({ name: String(c.name ?? '').trim(), type: c.type })),
  rows: draft.rows.map(row => Object.fromEntries(draft.columns.map(c => [String(c.name ?? '').trim(), String(row.cells?.[String(c.name ?? '').trim()] ?? '').trim()])))
})
const baseline = ref(snapshot())
const dirty = computed(() => snapshot() !== baseline.value)

/** 进页面（或换了一条配置）时拷一份草稿：改动不影响引用方，保存才写回存储 */
function loadDraft () {
  const p = param.value
  draft.name = p?.name || ''
  draft.columns = clone(p?.columns) || []
  draft.rows = (clone(p?.rows) || []).map(row => ({ cells: row.cells || {} }))
  resetTryDefaults()
  resetImport()
  baseline.value = snapshot()
}

loadDraft()
watch(() => route.params.id, loadDraft)

function validate () {
  if (!draft.name.trim()) return '请填写配置名称'
  if (!draft.columns.length) return '请至少添加一列'
  if (draft.columns.some(c => !String(c.name ?? '').trim())) return '列名不能为空'
  const dup = duplicateColNames(draft.columns)
  if (dup.length) return `列名不能重复：${dup.join('、')}`
  if (!filledRowCount.value) return '请至少填写一行数据'
  return ''
}

function handleSave () {
  const error = validate()
  if (error) {
    ElMessage.warning(error)
    return
  }
  const target = param.value
  if (!target) return
  const columns = draft.columns.map(c => ({ name: String(c.name).trim(), type: c.type }))
  const rows = draft.rows
    .filter(row => columns.some(c => String(row.cells?.[c.name] ?? '').trim() !== ''))
    .map(row => ({ cells: Object.fromEntries(columns.map(c => [c.name, String(row.cells?.[c.name] ?? '').trim()])) }))
  Object.assign(target, { name: draft.name.trim(), kind: 'table', columns, rows, updateTime: nowText() })
  draft.columns = clone(columns)
  draft.rows = clone(rows)
  baseline.value = snapshot()
  ElMessage.success('已保存')
}

async function goBack () {
  if (dirty.value) {
    try {
      await ElMessageBox.confirm('当前修改还没保存，确定离开吗？', '离开确认', {
        confirmButtonText: '不保存离开',
        cancelButtonText: '继续编辑',
        type: 'warning'
      })
    } catch { return }
  }
  router.push({ path: '/config-rule-management', query: { tab: 'general-param' } })
}
</script>

<style scoped>
.gp-detail {
  padding: 4px 0 24px;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.back-btn {
  color: hsl(var(--muted-foreground));
}

.card {
  padding: 16px 20px 18px;
  margin-bottom: 16px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.card-head h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.head-meta {
  color: hsl(var(--muted-foreground));
  font-size: 12px;
}

.head-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.base-form :deep(.el-form-item) {
  margin-bottom: 12px;
}

.hint {
  margin: 10px 0 0;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
  line-height: 1.7;
}

.hint.inline {
  margin: 0 0 0 10px;
}

.col-list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.col-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
}

.col-list .add-col-btn {
  width: 320px;
  margin-top: 2px;
  border-style: dashed;
  border-color: hsl(var(--primary) / 0.35);
  background: transparent;
  color: hsl(var(--primary));
}

.col-list .add-col-btn:hover {
  border-color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.06);
  color: hsl(var(--primary));
}

.col-name {
  flex: 1;
  max-width: 320px;
}

.col-name :deep(.is-dup .el-input__wrapper) {
  box-shadow: 0 0 0 1px hsl(var(--destructive)) inset;
}

.col-error {
  display: block;
  margin-top: 2px;
  color: hsl(var(--destructive));
  font-size: 12px;
  line-height: 1.4;
}

.col-type {
  width: 120px;
  flex: none;
}

.col-remove {
  color: hsl(var(--muted-foreground));
  margin-top: 4px;
}

.col-remove:hover {
  color: hsl(var(--destructive));
}

.empty-line {
  color: hsl(var(--muted-foreground));
  font-size: 13px;
}

.data-table :deep(th.el-table__cell) {
  background: hsl(var(--muted) / 0.6);
}

.try-config {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.try-label {
  color: hsl(var(--muted-foreground));
  font-size: 12px;
  flex: none;
}

.try-cond-row {
  display: grid;
  grid-template-columns: 44px 180px 128px 150px 52px;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.try-cond-head {
  margin-bottom: 6px;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
}

.try-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
}

.try-result {
  margin: 10px 0 0;
  font-size: 12px;
  color: hsl(var(--foreground));
  line-height: 1.6;
}

.try-result.err {
  color: hsl(var(--destructive));
}

.import-steps {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.import-step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.step-no {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
  font-size: 12px;
  flex: none;
}

.step-body {
  flex: 1;
  min-width: 0;
}

.step-title {
  margin: 0;
  font-size: 13px;
  color: hsl(var(--foreground));
}

.step-desc {
  margin: 2px 0 0;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.step-button {
  flex: none;
  min-width: 96px;
}

.import-result {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  color: hsl(var(--primary));
  font-size: 13px;
}

.import-note {
  margin: 8px 0 0;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
  line-height: 1.6;
}

.import-errors {
  margin: 10px 0 0;
  padding-left: 18px;
  color: hsl(var(--destructive));
  font-size: 12px;
  line-height: 1.8;
  max-height: 168px;
  overflow: auto;
}

.import-errors .more {
  color: hsl(var(--muted-foreground));
}

.import-mode {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
}

.mode-label {
  font-size: 13px;
  color: hsl(var(--foreground));
}
</style>
