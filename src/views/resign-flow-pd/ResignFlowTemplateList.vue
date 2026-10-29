<template>
  <div class="ftl-page">
    <div class="page-header">
      <div class="header-main">
        <h1>离职流程模板</h1>
        <span class="sub">配置层 · 员工发起离职后按岗位匹配模板生成交接清单，交接全部完成才放行人事审批</span>
      </div>
      <el-button type="primary" :icon="Plus" @click="createTpl">新建流程</el-button>
    </div>

    <!-- 匹配规则说明 -->
    <div class="rule-strip">
      <span class="rs-key">匹配规则</span>
      <span class="rs-text">
        适用条件 = 岗位（必选）+ 城市 / 门店 / 用工形式（可选）。员工发起时按条件匹配，
        <b>越具体越优先</b>（岗位+门店+用工 &gt; 岗位+城市 &gt; 仅岗位），同具体度取最近修改；一条都不命中则禁止发起并提示人事补配置。
        模板变更不追溯在途单（发起时快照版本）。
      </span>
    </div>

    <div class="section-card">
      <div class="card-header">
        <span class="card-title">模板列表</span>
        <div class="toolbar">
          <el-input v-model="keyword" placeholder="按模板名称 / 岗位搜索" clearable :prefix-icon="Search" style="width: 240px" />
          <el-select v-model="statusFilter" placeholder="全部状态" clearable style="width: 140px">
            <el-option label="全部状态" value="" />
            <el-option label="启用" value="active" />
            <el-option label="停用" value="disabled" />
          </el-select>
        </div>
      </div>

      <el-table :data="pagedRows" size="small" class="ftl-table" row-key="id">
        <el-table-column prop="name" label="流程名称" min-width="170" />
        <el-table-column label="适用条件" min-width="230">
          <template #default="{ row }">
            <div class="scope-cell">
              <span class="scope-jobs">{{ row.scope.jobs.join('、') }}</span>
              <span v-if="scopeExtraText(row)" class="scope-extra">{{ scopeExtraText(row) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="节点" width="130">
          <template #default="{ row }">
            {{ row.nodes.length }} 个节点
            <span class="must-count">（必过 {{ allNodes(row).filter(n => n.gate === 'must').length }}）</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="84">
          <template #default="{ row }">
            <span :class="['st-chip', row.status]">{{ row.status === 'active' ? '启用' : '停用' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="version" label="版本" width="64" align="center" />
        <el-table-column label="最近修改" width="150">
          <template #default="{ row }">
            <div class="upd-cell">
              <span>{{ row.updatedAt }}</span>
              <em>{{ row.updatedBy }}</em>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="goTimeline(row)">编排</el-button>
            <el-button link size="small" @click="copyTpl(row)">复制</el-button>
            <el-button link size="small" :type="row.status === 'active' ? 'danger' : 'success'" @click="toggleStatus(row)">
              {{ row.status === 'active' ? '停用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <TablePagination v-model:page="page" v-model:page-size="pageSize" :total="total" />
      <div v-if="!filtered.length" class="empty-tip">没有匹配的模板</div>
    </div>

    <div class="foot-hint">
      未命中任何模板的发起不拦截：员工提交后照常进入人事确认，确认后系统自动推送离职合同（不经交接），同时提醒人事补配模板。
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { resignFlowTemplates, flattenNodes } from '../../mock/resignHandoverPd.js'
import { usePager } from '../../composables/usePager.js'
import TablePagination from '../../components/TablePagination.vue'

const router = useRouter()

const keyword = ref('')
const statusFilter = ref('')

const filtered = computed(() =>
  resignFlowTemplates.filter(t => {
    if (statusFilter.value && t.status !== statusFilter.value) return false
    const kw = keyword.value.trim()
    if (!kw) return true
    return t.name.includes(kw) || t.scope.jobs.some(j => j.includes(kw))
  })
)
const { page, pageSize, total, rows: pagedRows } = usePager(filtered)

const allNodes = (row) => flattenNodes(row)

const scopeExtraText = (row) => {
  const s = row.scope
  const parts = []
  if (s.cities?.length) parts.push('城市：' + s.cities.join('、'))
  if (s.stores?.length) parts.push('门店：' + s.stores.join('、'))
  if (s.employTypes?.length) parts.push('用工：' + s.employTypes.join('、'))
  return parts.join(' · ')
}

/* 列表视图（原编辑页）与画布页入口已隐藏：路由保留，文档截图可直达 */
const goTimeline = (row) => router.push({ name: 'resign-flow-template-timeline', query: { id: row.id } })

/* 新建流程：打开空白时间线编排页，从 0 开始搭节点 */
const createTpl = () => router.push({ name: 'resign-flow-template-timeline', query: { id: '__new__' } })

const copyTpl = (row) => ElMessage.success(`已复制为「${row.name}（副本）」，版本 1（原型演示）`)

const toggleStatus = (row) => {
  row.status = row.status === 'active' ? 'disabled' : 'active'
  ElMessage.success(row.status === 'active' ? '模板已启用' : '模板已停用（不影响在途单，发起时快照版本）')
}
</script>

<style scoped>
.ftl-page { padding: 18px 22px 30px; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 14px; }
.header-main h1 { margin: 0 0 4px; font-size: 20px; }
.header-main .sub { font-size: 12.5px; color: #8a8f99; }

.rule-strip { display: flex; gap: 10px; align-items: flex-start; background: #f7f8fa; border: 1px solid #ececf0; border-radius: 10px; padding: 10px 14px; margin-bottom: 14px; }
.rs-key { flex-shrink: 0; font-size: 12px; font-weight: 600; color: #534ab7; background: #eeedfe; border-radius: 8px; padding: 2px 8px; }
.rs-text { font-size: 12.5px; color: #5f6368; line-height: 1.7; }
.rs-text b { color: #534ab7; }

.section-card { background: #fff; border: 1px solid #ececf0; border-radius: 12px; padding: 14px 16px; }
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.card-title { font-size: 15px; font-weight: 600; }
.toolbar { display: flex; gap: 8px; }

.ftl-table :deep(.el-table__row) { --el-table-tr-bg-color: #fff; }
.scope-cell { display: flex; flex-direction: column; gap: 2px; }
.scope-jobs { font-size: 12.5px; color: #333; }
.scope-extra { font-size: 11.5px; color: #8a8f99; }
.must-count { font-size: 11.5px; color: #993556; }
.st-chip { font-size: 11.5px; border-radius: 9px; padding: 1px 8px; }
.st-chip.active { color: #0f6e56; background: #e1f5ee; }
.st-chip.disabled { color: #888780; background: #f1efe8; }
.upd-cell { display: flex; flex-direction: column; }
.upd-cell span { font-size: 12px; color: #333; }
.upd-cell em { font-style: normal; font-size: 11.5px; color: #a3a0a1; }

.empty-tip { text-align: center; color: #a3a0a1; font-size: 13px; padding: 26px 0 10px; }
.foot-hint { margin-top: 12px; font-size: 12px; color: #8a8f99; line-height: 1.8; }
</style>
