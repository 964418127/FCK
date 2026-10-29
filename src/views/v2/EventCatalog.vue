<template>
  <div class="ec-page">
    <div class="page-header">
      <div class="header-main">
        <h1>事件管理</h1>
        <span class="sub">新建、改版、停用，都在这里</span>
      </div>
      <div class="header-actions">
        <!-- 演示辅具，不进产品界面：带 ?dev=1 才出现，正常走查看到的只有「起草新事件」 -->
        <el-button v-if="devMode" size="small" :icon="RefreshLeft" @click="reset">重置演示数据</el-button>
        <el-button size="small" type="primary" :icon="Plus" @click="createNew">起草新事件</el-button>
      </div>
    </div>

    <div class="section-card">
      <div class="card-header">
        <span class="card-title">已建立的事件 <em>{{ rows.length }}</em></span>
        <div class="toolbar">
          <el-input v-model="keyword" placeholder="按名称 / 标识搜索" clearable :prefix-icon="Search" size="small" style="width: 220px" />
          <el-select v-model="statusFilter" size="small" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="全部状态" value="" />
            <el-option label="生效中" value="active" />
            <el-option label="已停用" value="disabled" />
          </el-select>
        </div>
      </div>

      <el-table :data="filtered" size="small" row-key="key" class="ec-table">
        <el-table-column label="事件" min-width="200">
          <template #default="{ row }">
            <div class="ev-cell">
              <span class="ev-name">{{ row.name }}</span>
              <span class="ev-desc">{{ row.desc || '（暂无说明）' }}</span>
              <span class="ev-key">{{ row.key }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="适用条件" min-width="230">
          <template #default="{ row }">
            <div class="scope-cell" title="匹配条件：触发时按员工档案判定，不是预先圈好的名单">
              <span v-for="c in scopeChips(row.scope)" :key="c.k" class="scope-tag">
                <i>{{ c.k }}</i>{{ c.v }}
              </span>
              <span v-if="!scopeChips(row.scope).length" class="none">未设条件（谁都匹配不上，等于不触发）</span>
              <span v-else class="scope-tag hc">≈ {{ headcountOf(row.scope) }} 人</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="触点" width="176">
          <template #default="{ row }">
            <div class="trig-cell">
              <span :class="['trig-tag', row.trigger?.type]">{{ triggerLabel(row.trigger) }}</span>
              <em :title="row.trigger?.entry">{{ row.trigger?.entry || '未写入口' }}</em>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="要办的事" width="126">
          <template #default="{ row }">
            <div class="cnt-cell">
              <span>{{ (row.skeleton || []).length }} 条</span>
              <em>其中必过 {{ mustOf(row) }} 条</em>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="版本" width="72" align="center">
          <template #default="{ row }">
            <span class="ver">第 {{ row.currentVersion || 1 }} 版</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="86">
          <template #default="{ row }">
            <span :class="['st-chip', row.status]">{{ statusLabel(row.status) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="最近修改" width="132">
          <template #default="{ row }">
            <div class="upd-cell">
              <span>{{ row.updatedAt || '—' }}</span>
              <em>{{ row.updatedBy || '—' }}</em>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="enter(row)">编辑</el-button>
            <el-button link size="small" :type="row.status === 'disabled' ? 'success' : 'warning'" @click="toggle(row)">
              {{ row.status === 'disabled' ? '启用' : '停用' }}
            </el-button>
            <el-button link type="danger" size="small" @click="drop(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!filtered.length" class="empty-tip">还没有事件。点右上角「起草新事件」，说一句这件事要交付什么，存下来就生效。</div>
    </div>

  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, RefreshLeft } from '@element-plus/icons-vue'
import { v2state, toggleEventStatus, removeEvent, resetDemo } from '../../v2/store.js'
import { scopeChips, triggerLabel, headcountOf } from '../../v2/model.js'

const router = useRouter()
const route = useRoute()
const devMode = computed(() => route.query.dev === '1')
const keyword = ref('')
const statusFilter = ref('')

const rows = computed(() => v2state.events)
const filtered = computed(() =>
  rows.value.filter((e) => {
    if (statusFilter.value && e.status !== statusFilter.value) return false
    const kw = keyword.value.trim()
    if (!kw) return true
    return e.name.includes(kw) || e.key.includes(kw)
  })
)

const statusLabel = (s) => ({ active: '生效中', published: '生效中', draft: '草稿', disabled: '已停用' }[s] || s)
const mustOf = (row) => (row.skeleton || []).filter((s) => s.gate !== 'optional').length

/** 起草新事件 = 进对话；不弹表单，避免「空壳 + 事后手填」这条岔路 */
function createNew () {
  router.push({ name: 'v2-compose' })
}
function enter (row) {
  router.push({ name: 'v2-prompt', query: { key: row.key } })
}
async function toggle (row) {
  toggleEventStatus(row.key)
  ElMessage.success(row.status === 'disabled' ? '已启用' : '已停用（在途单不受影响）')
}
async function drop (row) {
  await ElMessageBox.confirm(`删除「${row.name}」会连同提示词和要办的事一起删掉，已开的单仍在事件数据里可查。确定？`, '删除事件', { type: 'warning' })
  removeEvent(row.key)
  ElMessage.success('已删除')
}
async function reset () {
  await ElMessageBox.confirm('会把提示词和样例单据重置成演示初始状态，你改过的内容会丢。', '重置演示数据', { type: 'warning' })
  resetDemo()
  ElMessage.success('已恢复')
}
</script>

<style scoped>
.ec-page { padding: 18px 22px 30px; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 14px; }
.header-main h1 { margin: 0 0 4px; font-size: 20px; }
.header-main .sub { font-size: 12.5px; color: #8a8f99; }
.header-actions { display: flex; gap: 8px; }


.section-card { background: #fff; border: 1px solid #ececf0; border-radius: 12px; padding: 14px 16px; }
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.card-title { font-size: 15px; font-weight: 600; }
.card-title em { font-style: normal; font-size: 12px; font-weight: 400; color: #a3a0a1; margin-left: 6px; }
.toolbar { display: flex; gap: 8px; }

.ev-cell { display: flex; flex-direction: column; gap: 2px; }
.ev-name { font-size: 13px; font-weight: 600; color: #2b2b33; }
.ev-desc { font-size: 11.5px; color: #8a8f99; }
.ev-key { font-size: 11px; font-family: ui-monospace, monospace; color: #b0aebe; }

.scope-cell { display: flex; flex-wrap: wrap; gap: 4px; }
.scope-tag { font-size: 11.5px; color: #4a4a55; background: #f4f4f7; border-radius: 7px; padding: 1px 7px; }
.scope-tag i { font-style: normal; color: #a3a0a1; margin-right: 3px; }
.scope-tag.hc { color: #534ab7; background: #eeedfe; }

.trig-cell { display: flex; flex-direction: column; gap: 3px; }
.trig-tag { font-size: 11px; border-radius: 7px; padding: 1px 7px; align-self: flex-start; color: #534ab7; background: #eeedfe; }
.trig-tag.manual { color: #0f6e56; background: #e1f5ee; }
.trig-tag.schedule { color: #9a6b00; background: #fdf6e7; }
.trig-cell em { font-style: normal; font-size: 11px; color: #8a8f99; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.cnt-cell { display: flex; flex-direction: column; }
.cnt-cell span { font-size: 12.5px; color: #333; }
.cnt-cell em { font-style: normal; font-size: 11px; color: #a3a0a1; }
.ver { font-size: 12.5px; color: #534ab7; font-weight: 600; }

.st-chip { font-size: 11.5px; border-radius: 9px; padding: 1px 8px; white-space: nowrap; }
.st-chip.active, .st-chip.published, .st-chip.ok { color: #0f6e56; background: #e1f5ee; }
.st-chip.draft { color: #9a6b00; background: #fdf6e7; }
.st-chip.disabled { color: #888780; background: #f1efe8; }
.st-chip.empty { color: #b23b3b; background: #fdecec; }
.st-chip.dup { color: #b23b3b; background: #fdecec; }

.upd-cell { display: flex; flex-direction: column; }
.upd-cell span { font-size: 12px; color: #333; }
.upd-cell em { font-style: normal; font-size: 11.5px; color: #a3a0a1; }

.none { font-size: 11.5px; color: #b9b7bd; }
.empty-tip { text-align: center; color: #a3a0a1; font-size: 13px; padding: 26px 0 10px; }
</style>
