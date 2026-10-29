<template>
  <div class="ftt-page">
    <div class="page-header">
      <div class="header-main">
        <el-button link :icon="ArrowLeft" @click="router.push({ name: 'resign-flow-template' })">返回列表</el-button>
        <h1 class="tpl-name" title="点击修改流程名称" @click="renameTpl">
          {{ tpl.name }}
          <el-icon class="name-edit"><EditPen /></el-icon>
        </h1>
        <span class="chip">交接流程编排</span>
        <span class="chip">v{{ tpl.version }}</span>
        <span :class="['chip', tpl.status]">{{ tpl.status === 'active' ? '启用' : '停用' }}</span>
        <span
          class="chip scope scope-edit" title="点击设置适用条件"
          @click="openScope"
        >适用：{{ scopeChipText }}<el-icon class="scope-pen"><EditPen /></el-icon></span>
      </div>
      <div class="header-right">
        <div class="header-stats">
          <span>{{ tpl.nodes.length }} 个节点</span>
          <span>必过 {{ mustCount }}</span>
          <span>系统检查 {{ sysCount }}</span>
          <span>流程 {{ groups.length }} 步</span>
        </div>
      </div>
    </div>

    <!-- 第 1 步：适用范围与确认人 -->
    <div :class="['step1-card', { todo: !tpl.scope.jobs.length }]">
      <div class="s1-head">
        <span class="s1-no">第 1 步</span>
        <div class="s1-title">
          适用范围与审核人
          <span class="s1-sub">先划清这条流程管谁、由谁审核离职需求，再进入交接编排</span>
        </div>
        <el-button size="small" :type="!tpl.scope.jobs.length ? 'primary' : 'default'" @click="openStep1">
          {{ tpl.scope.jobs.length ? '编辑' : '去设置' }}
        </el-button>
      </div>
      <div class="s1-body">
        <div class="s1-block">
          <span class="s1-key">适用条件</span>
          <div class="s1-val">
            <template v-if="tpl.scope.jobs.length">
              <span class="s1-jobs">岗位：{{ tpl.scope.jobs.join('、') }}</span>
              <span v-if="scopeExtraText" class="s1-extra">{{ scopeExtraText }}</span>
            </template>
            <span v-else class="s1-empty">还没设置适用岗位 —— 不设置，员工发起时命中不了这条流程（未命中的发起不拦截，但走不了交接）</span>
          </div>
        </div>
        <div class="s1-block">
          <span class="s1-key">离职需求审核</span>
          <div class="s1-val adm-wrap">
            <span v-if="tpl.admission?.levels?.length" class="adm-chain">
              <em v-for="(lv, li) in tpl.admission.levels" :key="li">
                {{ li + 1 }}. {{ lv.role }}{{ levelNamesText(lv) }}<template v-if="li < tpl.admission.levels.length - 1"> → </template>
              </em>
            </span>
            <span v-else class="s1-empty">未配置审核人 —— 审核逐级办结后，员工才进入交接流程</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 第 2 步：交接流程编排 -->
    <div class="step2-card">
      <div class="s2-head">
        <span class="s2-no">第 2 步</span>
        <div class="s2-title">
          交接流程编排
          <span class="s2-sub">节点先后由「前置节点」决定，同一步 = 并行，位置自动排布</span>
        </div>
        <div class="s2-btns">
          <el-button size="small" type="primary" @click="addNode('manual')">+ 人工节点</el-button>
          <el-button size="small" type="primary" plain @click="addNode('system')">+ 系统检查</el-button>
        </div>
      </div>

      <div class="tl-wrap">
      <div class="tl-canvas" :style="{ width: canvasW + 'px', height: canvasH + 'px' }">
        <!-- 时间轴：起点 → 每步一个刻度 → 终点 -->
        <div class="ax-line" :style="axisLineStyle" />
        <div class="ax-chip start" :style="{ left: 0, width: START_W + 'px' }">员工发起离职</div>
        <div
          v-for="(g, ci) in groups" :key="'ax' + ci"
          class="ax-step" :style="{ left: colX(ci) + 'px', width: CARD_W + 'px' }"
        >
          <span class="ax-dot" :class="{ first: ci === 0 }" />
          <span class="ax-label">第 {{ ci + 1 }} 步</span>
          <span class="ax-sub">{{ ci === 0 ? '发起后即可开始' : '前置全部办结后开始' }}</span>
        </div>
        <div class="ax-chip end" :style="{ left: endX + 'px', width: END_W + 'px' }">推送离职合同</div>

        <!-- 空流程：从 0 开始的引导 -->
        <div v-if="!tpl.nodes.length" class="tl-empty">
          <div class="te-main">空流程 · 从这里开始</div>
          <div class="te-sub">
            先完成上方<b>第 1 步「适用范围与确认人」</b>（不设岗位，员工发起时命中不了这条流程）；
            再点「+ 人工节点」「+ 系统检查」加入第一个节点，节点先后由「前置节点」决定，同一步 = 并行
          </div>
        </div>

        <!-- 依赖连线（淡色，悬停高亮） -->
        <svg class="edges" :width="canvasW" :height="canvasH">
          <path
            v-for="(e, i) in edges" :key="i"
            :d="e.d" fill="none" :class="['edge', edgeClass(e)]"
          />
        </svg>

        <!-- 节点卡片：位置由前置推导，改开始时机即自动重排 -->
        <el-popover
          v-for="n in tpl.nodes" :key="n.id"
          placement="bottom-start" :width="330" trigger="click" popper-class="when-popper"
        >
          <template #reference>
            <el-tooltip
              :disabled="!isSystemNode(n)" placement="top" effect="dark"
              popper-class="sys-def-tip" :show-after="300"
            >
              <template #content>
                <div class="tip-h">{{ n.name }} · 判定定义（最新批次镜像）</div>
                <div class="tip-row pass">通过（{{ defLogicLabel(checkDefOf(n.sysKey).pass) }}）：{{ defJoin(checkDefOf(n.sysKey).pass) || '—' }}</div>
                <div v-if="checkDefOf(n.sysKey).soft" class="tip-row soft">软性（{{ defLogicLabel(checkDefOf(n.sysKey).soft) }}）：{{ defJoin(checkDefOf(n.sysKey).soft) }}</div>
                <div v-else class="tip-row soft">无软性区间：只会查到通过或未通过</div>
                <div class="tip-row">取到「通过」即办结；未通过由检查 Agent 在下一批次继续盘查，到上限{{ n.gate === 'must' ? '终止全部流程' : '放行留痕' }}</div>
              </template>
              <div
                :class="['fcard', n.gate, { sys: isSystemNode(n), dim: activeId && !isRelated(n) }]"
                :style="{ left: layout[n.id]?.x + 'px', top: layout[n.id]?.y + 'px' }"
                @mouseenter="activeId = n.id" @mouseleave="activeId = null"
              >
              <div class="fc-head">
                <span class="fc-name">{{ n.name || '（未命名节点）' }}</span>
                <span :class="['fc-gate', n.gate]">{{ n.gate === 'must' ? '必过' : (isSystemNode(n) ? '软性' : '可选') }}</span>
              </div>
              <div class="fc-owner">
                <template v-if="isSystemNode(n)">系统自动 · {{ checkSourceOf(n) }}</template>
                <template v-else>{{ roleLabelOf(n.role) }}<em v-if="n.override"> · 指定 {{ n.override }}</em></template>
              </div>
              <div class="fc-when" :class="{ free: !(n.deps || []).length }">
                {{ whenShortOf(n) }}
              </div>
              <div class="fc-ops" @click.stop>
                <span class="op" @click.stop="openEdit(n)">编辑</span>
                <span class="op danger" @click.stop="removeNode(n)">删除</span>
              </div>
              </div>
            </el-tooltip>
          </template>

          <!-- 前置节点：唯一的先后关系编辑入口 -->
          <div class="wp">
            <div class="wp-h">前置节点 <span class="wp-sub">决定开始时机</span></div>
            <div class="wp-tip">勾选这个节点要等的前置节点，它们<b>全部办结</b>后才能开始办理；<b>全不勾 = 发起后即可开始</b>。</div>
            <div class="wp-list">
              <label
                v-for="o in tpl.nodes.filter(x => x.id !== n.id)" :key="o.id"
                :class="['wp-it', { off: wouldCycle(o.id, n.id) }]"
              >
                <input
                  type="checkbox"
                  :checked="(n.deps || []).includes(o.id)"
                  :disabled="wouldCycle(o.id, n.id)"
                  @change="toggleDep(n, o.id)"
                >
                <span class="wp-name">{{ o.name || '未命名' }}</span>
                <span class="wp-meta">{{ isSystemNode(o) ? '系统检查' : roleLabelOf(o.role) }} · 第 {{ (layout[o.id]?.col ?? 0) + 1 }} 步</span>
              </label>
            </div>
            <div class="wp-preview">{{ dispatchTextOf(tpl, n) }}</div>
          </div>
        </el-popover>
      </div>
    </div>

      <div class="tl-legend">
        <span class="lg must">必过</span>
        <span class="lg optional">可选 / 软性</span>
        <span class="lg sys">系统检查</span>
        <em>同一列 = 并行 · 越靠右越靠后 · 点卡片改「开始时机」，时间线自动重排，无需拖拽</em>
      </div>
    </div>

    <!-- 内容编辑抽屉 -->
    <el-drawer v-model="editDrawer" :title="draft ? (isNew ? '添加节点' : '编辑节点') : ''" size="500px" destroy-on-close>
      <div v-if="draft" class="drawer-body">
        <div v-if="!isSystemNode(draft)" class="f-row">
          <label>节点名称</label>
          <el-input v-model="draft.name" placeholder="如：工作交接" maxlength="20" />
        </div>
        <div class="f-row">
          <label>门禁</label>
          <el-radio-group v-model="draft.gate">
            <el-radio value="must">必过</el-radio>
            <el-radio value="optional">{{ isSystemNode(draft) ? '软性' : '可选' }}</el-radio>
          </el-radio-group>
        </div>
        <template v-if="!isSystemNode(draft)">
          <div class="f-row">
            <label>负责人角色</label>
            <el-select v-model="draft.role" style="width: 100%">
              <el-option v-for="r in handoverRoles" :key="r.key" :label="r.label" :value="r.key" />
            </el-select>
          </div>
          <div class="f-row">
            <label>指定到人<span class="tip">（留空 = 按角色自动解析）</span></label>
            <el-input v-model="draft.override" placeholder="如：周芸" maxlength="12" clearable />
          </div>
        </template>
        <template v-else>
          <div class="f-row">
            <label>检查项<span class="tip">（公共枚举，同模板内不可重复）</span></label>
            <el-select v-model="draft.sysKey" style="width: 100%" @change="draft.name = checkLabelOf(draft.sysKey)">
              <el-option
                v-for="c in availableChecks" :key="c.key"
                :label="c.name + '（' + c.source + '）'" :value="c.key"
              />
            </el-select>
            <div v-if="draftDesc" class="f-desc">{{ draftDesc }}</div>
            <div class="f-def">
              <div class="fd-row pass">通过（最新镜像 · {{ defLogicLabel(checkDefOf(draft.sysKey).pass) }}）：{{ defJoin(checkDefOf(draft.sysKey).pass) || '—' }}</div>
              <div v-if="checkDefOf(draft.sysKey).soft" class="fd-row soft">软性（{{ defLogicLabel(checkDefOf(draft.sysKey).soft) }}）：{{ defJoin(checkDefOf(draft.sysKey).soft) }}</div>
              <div v-else class="fd-row soft">无软性区间：只会查到通过或未通过</div>
              <div class="fd-row fail">两者都不命中 → 未通过，由检查 Agent 在下一批次继续盘查</div>
            </div>
          </div>
          <div class="f-row">
            <label>取数频率<span class="tip">（流程多久去取一次 Agent 的最新结果；结果何时出新批次由 Agent 决定）</span></label>
            <div v-if="draft.fetchFreq === 'none'" class="iv-none">
              <span class="iv-hint">只取一次（不再取后续批次）</span>
              <el-button link type="primary" size="small" @click="draft.fetchFreq = '1h'">改为定期取数</el-button>
            </div>
            <div v-else class="iv-row">
              <span class="iv-k">每</span>
              <el-input-number v-model="ffNum" :min="1" :max="999" controls-position="right" style="width: 96px" />
              <el-select v-model="ffUnit" style="width: 88px">
                <el-option label="分钟" value="m" />
                <el-option label="小时" value="h" />
                <el-option label="天" value="d" />
              </el-select>
              <el-button link size="small" @click="draft.fetchFreq = 'none'">只取一次</el-button>
            </div>
          </div>
          <div class="f-row">
            <label>批次上限<span class="tip">（只计消费到的不同未通过批次；同一批次反复取到不重复计数）</span></label>
            <el-input-number v-model="draft.maxRuns" :min="1" :max="50" style="width: 100%" />
            <div class="f-desc">取到「通过」即办结、不再消耗；到上限仍无「通过」：必过 → 终止全部流程（单据作废重发）；软性 → 按「未取得结论」放行留痕。</div>
          </div>
        </template>

        <div class="f-sec">前置节点（决定开始时机）</div>
        <div class="dep-pick">
          <label
            v-for="o in tpl.nodes.filter(x => x.id !== draft.id)" :key="o.id"
            :class="['dp-it', { off: wouldCycle(o.id, draft.id) }]"
          >
            <input
              type="checkbox"
              :checked="(draft.deps || []).includes(o.id)"
              :disabled="wouldCycle(o.id, draft.id)"
              @change="toggleDraftDep(o.id)"
            >
            <span class="dp-name">{{ o.name || '未命名' }}</span>
            <span class="dp-meta">{{ isSystemNode(o) ? '系统检查' : roleLabelOf(o.role) }} · 第 {{ (layout[o.id]?.col ?? 0) + 1 }} 步</span>
          </label>
          <div v-if="tpl.nodes.length <= 1" class="dp-empty">暂无其他节点可作前置</div>
        </div>
        <div class="f-desc">勾前置后本节点排在它们后面；全不勾 = 发起后即可开始。也可以在画布上点卡片直接改。</div>

        <template v-if="!isSystemNode(draft)">
          <div class="f-sec">
            待办事项（{{ draft.tasks.length }}）
            <el-button link type="primary" size="small" @click="addTask">+ 加事项</el-button>
          </div>
          <div v-for="(t, ti) in draft.tasks" :key="t.id" class="task-edit">
            <div class="te-line">
              <el-input v-model="t.name" placeholder="事项名称" maxlength="16" style="flex: 1" />
              <el-button link size="small" type="danger" @click="draft.tasks.splice(ti, 1)">删</el-button>
            </div>
            <el-input v-model="t.require" placeholder="办理要求（可选）" maxlength="40" size="small" style="margin-top: 6px" />
            <div class="te-line" style="margin-top: 6px">
              <el-select v-model="t.proof" size="small" style="width: 110px">
                <el-option label="无需附件" value="none" />
                <el-option label="可选附件" value="optional" />
                <el-option label="必传附件" value="must" />
              </el-select>
              <el-input-number v-if="t.proof !== 'none'" v-model="t.proofMax" :min="1" :max="5" size="small" style="width: 90px" />
            </div>
          </div>
        </template>

        <div class="d-btns">
          <el-button type="primary" @click="saveDraft">保存</el-button>
          <el-button @click="editDrawer = false">取消</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 第 1 步设置：适用范围与审核人 -->
    <el-dialog v-model="scopeOpen" title="第 1 步 · 适用范围与审核人" width="820px" destroy-on-close>
      <div class="dlg-sec">适用条件</div>
      <div class="f-row">
        <label>适用岗位 <i class="req">*</i><span class="tip">（必选，可多选）</span></label>
        <el-select v-model="scopeDraft.jobs" multiple placeholder="选择岗位" style="width: 100%">
          <el-option v-for="j in jobOptions" :key="j" :label="j" :value="j" />
        </el-select>
      </div>
      <div class="scope-grid">
        <div class="f-row">
          <label>适用城市<span class="tip">（留空 = 不限）</span></label>
          <el-select v-model="scopeDraft.cities" multiple placeholder="不限" style="width: 100%">
            <el-option v-for="c in cityOptions" :key="c" :label="c" :value="c" />
          </el-select>
        </div>
        <div class="f-row">
          <label>适用门店<span class="tip">（留空 = 不限）</span></label>
          <el-select v-model="scopeDraft.stores" multiple placeholder="不限" style="width: 100%">
            <el-option v-for="s in storeOptions" :key="s" :label="s" :value="s" />
          </el-select>
        </div>
        <div class="f-row">
          <label>用工形式<span class="tip">（留空 = 不限）</span></label>
          <el-select v-model="scopeDraft.employTypes" multiple placeholder="不限" style="width: 100%">
            <el-option label="全职" value="全职" />
            <el-option label="兼职" value="兼职" />
            <el-option label="劳务" value="劳务" />
          </el-select>
        </div>
      </div>
      <div class="f-desc">
        匹配按「越具体越优先」：岗位+门店+用工 &gt; 岗位+城市 &gt; 仅岗位。未被任何模板命中的发起不拦截：
        人事确认后系统自动推送离职合同（不经交接），并提醒人事补配模板。
      </div>

      <div class="dlg-sec">离职需求审核</div>
      <div class="f-row">
        <label>审核人<span class="tip">（逐级办结后员工才进入交接流程，1~3 级）</span></label>
        <div class="adm-edit">
          <div v-for="(lv, li) in scopeDraft.admission.levels" :key="li" class="adm-block">
            <div class="adm-line">
              <span class="adm-no">{{ li + 1 }}</span>
              <el-select v-model="lv.role" placeholder="角色" style="width: 160px" @change="onRoleChange(lv)">
                <el-option v-for="r in admissionRoles" :key="r" :label="r" :value="r" />
              </el-select>
              <el-select
                v-model="lv.names" multiple collapse-tags collapse-tags-tooltip
                :placeholder="lv.role === '部门上级' ? '按组织关系自动解析' : '选择人员（留空 = 按组织关系自动解析）'"
                style="flex: 1" @change="onNamesChange(lv)"
              >
                <el-option v-for="p in staffOptionsOf(lv.role)" :key="p" :label="p" :value="p" />
              </el-select>
              <el-button link size="small" type="danger" @click="scopeDraft.admission.levels.splice(li, 1)">删</el-button>
            </div>
            <div v-if="lv.names.length > 1" class="adm-mode">
              <span class="am-key">通过方式</span>
              <el-radio-group v-model="lv.mode" size="small">
                <el-radio value="any">任一人通过即可（或签）</el-radio>
                <el-radio value="all">全部通过（会签）</el-radio>
              </el-radio-group>
            </div>
          </div>
          <el-button
            v-if="scopeDraft.admission.levels.length < 3" link type="primary" size="small"
            @click="scopeDraft.admission.levels.push({ role: admissionRoles[scopeDraft.admission.levels.length] || '人事经理', names: [], mode: 'any' })"
          >+ 加一级</el-button>
          <div class="f-desc">
            审核人跟模板走：一个管理维度（岗位 + 城市 / 门店组合）配一条流程；同一岗位不同城市要不同的审核链
            （如成都的调理师先人事经理、再城市总），就另配一条更具体的模板，员工发起时按「越具体越优先」命中。
          </div>
        </div>
      </div>

      <template #footer>
        <el-button type="primary" @click="saveScope">保存</el-button>
        <el-button @click="scopeOpen = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, EditPen } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  templateOf, createTemplate, nodeOf, depsOf, levelGroupsOf,
  dispatchTextOf, isSystemNode, parseFetchFreq, checkDefOf, defJoin, defLogicLabel,
  roleLabelOf, checkLabelOf, handoverRoles, systemCheckDict, admissionStaff
} from '../../mock/resignHandoverPd.js'

const route = useRoute()
const router = useRouter()

/* 新建流程：列表「新建流程」带 __new__ 进来，先落一个空白模板再接管 id */
if (route.query.id === '__new__') {
  const t = createTemplate()
  router.replace({ name: 'resign-flow-template-timeline', query: { id: t.id } })
}

const renameTpl = () => {
  ElMessageBox.prompt('流程名称会显示在员工发起页与负责人交接页', '重命名交接流程', {
    inputValue: templateOf(route.query.id)?.name || '',
    inputPattern: /\S+/,
    inputErrorMessage: '名称不能为空',
    confirmButtonText: '保存',
    cancelButtonText: '取消'
  }).then(({ value }) => {
    const t = templateOf(route.query.id)
    if (t) t.name = value.trim()
    ElMessage.success('已重命名')
  }).catch(() => {})
}

/* reactive() 对同一原始对象返回同一代理 → 时间线上的改动直接写进 mock 数据 */
const tpl = computed(() => reactive(templateOf(route.query.id) || templateOf('rft-01')))
const mustCount = computed(() => tpl.value.nodes.filter(n => n.gate === 'must').length)
const sysCount = computed(() => tpl.value.nodes.filter(isSystemNode).length)

/* ---------------- 时间线布局：位置完全由 deps 推导，自动排布 ---------------- */
const START_W = 112, END_W = 96, CARD_W = 236, CARD_H = 96
const GAP = 56, GY = 20, AXIS_TOP = 14, CARD_TOP = 96

const groups = computed(() => levelGroupsOf(tpl.value))
const colX = (ci) => START_W + GAP + ci * (CARD_W + GAP)
const endX = computed(() => groups.value.length ? colX(groups.value.length - 1) + CARD_W + GAP : START_W + GAP)

const layout = computed(() => {
  const map = {}
  groups.value.forEach((g, ci) => {
    g.nodes.forEach((n, ri) => {
      map[n.id] = { col: ci, row: ri, x: colX(ci), y: CARD_TOP + ri * (CARD_H + GY) }
    })
  })
  return map
})

const maxRows = computed(() => Math.max(1, ...groups.value.map(g => g.nodes.length)))
const canvasW = computed(() => endX.value + END_W + 20)
const canvasH = computed(() => CARD_TOP + maxRows.value * (CARD_H + GY) + 16)

const axisLineStyle = computed(() => ({
  /* 轴线从「员工发起离职」一直画到「推送离职合同」，节点多少都连通 */
  left: START_W / 2 + 'px',
  width: Math.max(0, endX.value + END_W / 2 - START_W / 2) + 'px'
}))

/* ---------------- 依赖连线（布局规则，锚点直接算） ---------------- */
const edges = computed(() => {
  const segs = []
  for (const n of tpl.value.nodes) {
    for (const d of depsOf(tpl.value, n)) {
      const a = layout.value[d.id], b = layout.value[n.id]
      if (!a || !b) continue
      const x1 = a.x + CARD_W, y1 = a.y + CARD_H / 2
      const x2 = b.x, y2 = b.y + CARD_H / 2
      const k = Math.max(28, (x2 - x1) / 2)
      segs.push({ from: d.id, to: n.id, d: `M ${x1} ${y1} C ${x1 + k} ${y1}, ${x2 - k} ${y2}, ${x2} ${y2}` })
    }
  }
  return segs
})

const activeId = ref(null)
const edgeClass = (e) => {
  if (!activeId.value) return ''
  if (e.from === activeId.value || e.to === activeId.value) return 'hot'
  return 'dim'
}
const isRelated = (n) => {
  if (!activeId.value) return true
  const cur = nodeOf(tpl.value, activeId.value)
  if (!cur) return true
  return n.id === activeId.value || (cur.deps || []).includes(n.id) || (n.deps || []).includes(activeId.value)
}

/* ---------------- 开始时机：唯一的关系编辑入口 ---------------- */
const whenShortOf = (n) => {
  const ds = depsOf(tpl.value, n)
  if (!ds.length) return '发起后即可开始'
  return '等 ' + ds.map(d => d.name).join('、') + ' 办结'
}

/** 把 other 设为 n 的前置是否会成环：other 的前置链里已经绕回了 n */
function wouldCycle(otherId, selfId) {
  const seen = new Set()
  const walk = (id) => {
    if (seen.has(id)) return false
    seen.add(id)
    if (id === selfId) return true
    return (nodeOf(tpl.value, id)?.deps || []).some(walk)
  }
  return walk(otherId)
}

function toggleDep(n, depId) {
  n.deps = n.deps || []
  if (n.deps.includes(depId)) {
    n.deps = n.deps.filter(x => x !== depId)
  } else if (wouldCycle(depId, n.id)) {
    ElMessage.error('不能选：会形成循环依赖')
    return
  } else {
    n.deps.push(depId)
  }
  ElMessage.success('时间线已重排')
}

/** 抽屉里的前置编辑（草稿对象上改，保存时统一写回） */
function toggleDraftDep(depId) {
  const d = draft.value
  d.deps = d.deps || []
  if (d.deps.includes(depId)) d.deps = d.deps.filter(x => x !== depId)
  else if (!wouldCycle(depId, d.id)) d.deps.push(depId)
}

/* ---------------- 加删节点 / 内容编辑 ---------------- */
function addNode(kind) {
  const nid = 'k' + Math.random().toString(36).slice(2, 6)
  const node = kind === 'system'
    ? { id: nid, kind: 'system', sysKey: availableChecks.value[0]?.key || 'debt', name: availableChecks.value[0]?.name || '新检查项', gate: 'must', deps: [], fetchFreq: '1d', maxRuns: 5, tasks: [] }
    : { id: nid, kind: 'manual', name: '', role: 'store-manager', gate: 'must', override: null, deps: [], tasks: [] }
  tpl.value.nodes.push(node)
  nextTick(() => openEdit(node))
}

function removeNode(n) {
  ElMessageBox.confirm(
    `删除「${n.name || '未命名节点'}」？等它的节点会自动去掉这个前置。`,
    '删除节点',
    { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
  ).then(() => {
    tpl.value.nodes = tpl.value.nodes.filter(x => x.id !== n.id)
    for (const x of tpl.value.nodes) x.deps = (x.deps || []).filter(d => d !== n.id)
    ElMessage.success('已删除')
  }).catch(() => {})
}

const editDrawer = ref(false)
const draft = ref(null)
const isNew = ref(false)

const availableChecks = computed(() => {
  const used = new Set(tpl.value.nodes.filter(isSystemNode).map(n => n.sysKey))
  if (draft.value && isSystemNode(draft.value)) used.delete(draft.value.sysKey)
  return systemCheckDict.filter(c => !used.has(c.key))
})
const draftDesc = computed(() => systemCheckDict.find(c => c.key === draft.value?.sysKey)?.desc || '')

/* 取数频率 = 数字 + 单位（分钟/小时/天），mock 里存 `<n><单位>` 字符串 */
const ffNum = computed({
  get: () => parseFetchFreq(draft.value?.fetchFreq)?.num ?? 1,
  set: (v) => { if (v) draft.value.fetchFreq = `${v}${ffUnit.value}` }
})
const ffUnit = computed({
  get: () => parseFetchFreq(draft.value?.fetchFreq)?.unit ?? 'h',
  set: (u) => { draft.value.fetchFreq = `${ffNum.value}${u}` }
})

function openEdit(n) {
  isNew.value = false
  draft.value = JSON.parse(JSON.stringify(n))
  if (isSystemNode(draft.value)) {
    if (draft.value.fetchFreq == null) draft.value.fetchFreq = '1d'
    if (draft.value.maxRuns == null) draft.value.maxRuns = 5
  }
  editDrawer.value = true
}
function addTask() {
  draft.value.tasks.push({ id: 't' + (draft.value.tasks.length + 1) + Math.random().toString(36).slice(2, 4), name: '', require: '', proof: 'none', proofMax: 1 })
}
function saveDraft() {
  /* 系统节点名称跟随公共枚举，不可自填 */
  if (isSystemNode(draft.value)) draft.value.name = checkLabelOf(draft.value.sysKey)
  if (!draft.value.name?.trim()) { ElMessage.warning('请填写节点名称'); return }
  const target = nodeOf(tpl.value, draft.value.id)
  const clean = JSON.parse(JSON.stringify(draft.value))
  if (isSystemNode(clean)) clean.tasks = []
  Object.assign(target, clean)
  editDrawer.value = false
  ElMessage.success('已保存')
}

const checkSourceOf = (n) => (systemCheckDict.find(c => c.key === n.sysKey) || {}).source || '系统'

/* ---------------- 适用条件：新建 / 已有模板都在这里设置 ---------------- */
const jobOptions = ['调理师', '客户经理', '前台', '城市总', '大区总', 'IT 工程师', '人事专员', '财务专员']
const cityOptions = ['北京', '上海', '杭州', '成都', '深圳', '佛山']
const storeOptions = ['五棵松万达店', '杭州城北万象城', '凤凰汇', '君超广场', '成都万象城店', '杭州来福士店']

const scopeChipText = computed(() => {
  const s = tpl.value.scope
  if (!s.jobs.length) return '岗位待配置'
  const extra = [
    s.cities.length ? '城市 ' + s.cities.length : '',
    s.stores.length ? '门店 ' + s.stores.length : '',
    s.employTypes.length ? '用工 ' + s.employTypes.join('、') : ''
  ].filter(Boolean).join(' · ')
  return s.jobs.join('、') + (extra ? '（' + extra + '）' : '')
})

/* 第 1 步卡片：适用条件附加项文本 */
const scopeExtraText = computed(() => {
  const s = tpl.value.scope
  const parts = []
  if (s.cities?.length) parts.push('城市：' + s.cities.join('、'))
  if (s.stores?.length) parts.push('门店：' + s.stores.join('、'))
  if (s.employTypes?.length) parts.push('用工：' + s.employTypes.join('、'))
  return parts.join(' · ')
})

const scopeOpen = ref(false)
const scopeDraft = reactive({
  jobs: [], cities: [], stores: [], employTypes: [],
  admission: { levels: [] }
})
const admissionRoles = ['部门上级', '人事专员', '人事经理', '城市总', '总经理']

/* 角色对应的人员候选（去掉「按组织关系解析」这类占位项） */
const staffOptionsOf = (role) => (admissionStaff[role] || []).filter(p => !p.includes('解析'))
const onRoleChange = (lv) => { lv.names = []; lv.mode = 'any' }
const onNamesChange = (lv) => { if (lv.names.length < 2) lv.mode = 'any' }

/* 第 1 步卡片上的确认链文本：多人显示或签/会签 */
const levelNamesText = (lv) => {
  if (!lv.names?.length) return '（按组织解析）'
  if (lv.names.length === 1) return ' ' + lv.names[0]
  return ' ' + lv.names.join('、') + (lv.mode === 'all' ? '（全部通过）' : '（任一人通过）')
}

const openScope = () => {
  const s = tpl.value.scope
  const a = tpl.value.admission || { levels: [] }
  scopeDraft.jobs = [...s.jobs]
  scopeDraft.cities = [...s.cities]
  scopeDraft.stores = [...s.stores]
  scopeDraft.employTypes = [...s.employTypes]
  scopeDraft.admission = {
    levels: (a.levels?.length ? a.levels : [{ role: '人事经理', names: [], mode: 'any' }])
      .map(l => ({ role: l.role, names: [...(l.names || [])], mode: l.mode || 'any' }))
  }
  scopeOpen.value = true
}
/* 第 1 步卡片入口与 chip 入口同一个弹窗 */
const openStep1 = openScope

const saveScope = () => {
  if (!scopeDraft.jobs.length) { ElMessage.warning('至少选择一个适用岗位'); return }
  const levels = scopeDraft.admission.levels
    .filter(l => l.role)
    .map(l => ({ role: l.role, names: [...l.names], mode: l.names.length > 1 ? l.mode : 'any' }))
  if (!levels.length) { ElMessage.warning('至少配置一级离职需求审核人'); return }
  tpl.value.scope = {
    jobs: [...scopeDraft.jobs],
    cities: [...scopeDraft.cities],
    stores: [...scopeDraft.stores],
    employTypes: [...scopeDraft.employTypes]
  }
  tpl.value.admission = { levels }
  scopeOpen.value = false
  ElMessage.success('第 1 步设置已保存')
}
</script>

<style scoped>
.ftt-page { max-width: 1280px; margin: 0 auto; }

.page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 14px; flex-wrap: wrap; }
.header-main { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.header-main h1 { font-size: 19px; font-weight: 600; color: #2f2b3a; margin: 0; }
.tpl-name { display: inline-flex; align-items: center; gap: 5px; cursor: pointer; }
.name-edit { font-size: 14px; color: #a49bd8; opacity: .45; }
.tpl-name:hover .name-edit { opacity: 1; }
.chip { font-size: 11.5px; border-radius: 8px; padding: 2px 9px; background: #f1efe8; color: #888780; }
.chip.active { background: #e1f5ee; color: #0f6e56; }
.chip.disabled { background: #fbeaf0; color: #993556; }
.chip.scope { background: #eeedfe; color: #534ab7; }
.chip.scope.scope-edit { cursor: pointer; display: inline-flex; align-items: center; gap: 4px; }
.chip.scope.scope-edit:hover { background: #e2e0fb; }
.scope-pen { font-size: 12px; opacity: .55; }
.scope-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.req { color: #d24b4b; font-style: normal; }
.header-right { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.header-stats { display: flex; gap: 8px; font-size: 12.5px; color: #6b6880; }
.header-stats span { background: #fff; border: 1px solid #ececf0; border-radius: 8px; padding: 3px 10px; }

/* ---------- 第 1 步：适用范围与确认人 ---------- */
.step1-card { background: #fff; border: 1px solid #ececf0; border-radius: 12px; padding: 13px 16px 11px; margin-bottom: 14px; }
.step1-card.todo { border: 1.5px solid #a49bd8; box-shadow: 0 2px 12px rgb(83 74 183 / .10); }
.s1-head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.s1-no { flex-shrink: 0; font-size: 12px; font-weight: 700; color: #fff; background: #534ab7; border-radius: 8px; padding: 3px 10px; }
.step1-card.todo .s1-no { background: #d24b4b; }
.s1-title { font-size: 14.5px; font-weight: 600; color: #2f2b3a; display: flex; align-items: baseline; gap: 10px; flex: 1; flex-wrap: wrap; }
.s1-sub { font-size: 12px; font-weight: 400; color: #a3a0a1; }
.s1-body { display: flex; flex-direction: column; gap: 8px; }
.s1-block { display: flex; align-items: flex-start; gap: 10px; }
.s1-key { flex-shrink: 0; width: 76px; font-size: 12px; font-weight: 600; color: #6b6880; background: #f4f3fb; border-radius: 7px; padding: 3px 0; text-align: center; margin-top: 1px; }
.s1-val { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; font-size: 12.5px; color: #40434a; line-height: 1.6; }
.s1-jobs { font-weight: 600; color: #534ab7; }
.s1-extra { color: #8a8f99; }
.s1-empty { color: #b23b3b; }
.adm-wrap .adm-chain { font-size: 12px; color: #40434a; background: #f4f3fb; border-radius: 8px; padding: 2px 10px; }
.adm-chain em { font-style: normal; color: #534ab7; }

/* ---------- 第 2 步：交接流程编排 ---------- */
.step2-card { background: #fff; border: 1px solid #ececf0; border-radius: 12px; padding: 13px 16px; }
.s2-head { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.s2-no { flex-shrink: 0; font-size: 12px; font-weight: 700; color: #534ab7; background: #eeedfe; border-radius: 8px; padding: 3px 10px; }
.s2-title { font-size: 14.5px; font-weight: 600; color: #2f2b3a; display: flex; align-items: baseline; gap: 10px; flex: 1; flex-wrap: wrap; }
.s2-sub { font-size: 12px; font-weight: 400; color: #a3a0a1; }
.s2-btns { display: flex; gap: 8px; }

/* ---------- 第 1 步弹窗 ---------- */
.dlg-sec { font-size: 13px; font-weight: 600; color: #534ab7; background: #f4f3fb; border-radius: 8px; padding: 5px 12px; margin: 6px 0 10px; }
.adm-edit { display: flex; flex-direction: column; gap: 7px; }
.adm-block { display: flex; flex-direction: column; gap: 5px; }
.adm-line { display: flex; align-items: center; gap: 7px; }
.adm-mode { display: flex; align-items: center; gap: 8px; padding-left: 27px; }
.am-key { font-size: 11.5px; color: #a3a0a1; flex-shrink: 0; }
.adm-no { flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%; background: #eeedfe; color: #534ab7; font-size: 11.5px; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; }

/* ---------- 画布 ---------- */
.tl-wrap { background: #fff; border: 1px solid #ececf0; border-radius: 12px; padding: 16px; overflow: auto; }
.tl-canvas { position: relative; min-width: 720px; }
.tl-empty { position: absolute; left: 0; right: 0; top: 150px; text-align: center; }
.te-main { font-size: 15px; font-weight: 600; color: #6b6880; }
.te-sub { font-size: 12px; color: #a3a0a1; margin-top: 6px; line-height: 1.7; }

.ax-line { position: absolute; top: 32px; height: 2px; background: #e4e0f2; border-radius: 2px; }
.ax-chip { position: absolute; top: 22px; z-index: 1; font-size: 12px; font-weight: 600; text-align: center; border-radius: 999px; padding: 6px 0; box-sizing: border-box; }
.ax-chip.start { color: #534ab7; background: #eeedfe; }
.ax-chip.end { color: #0f6e56; background: #e1f5ee; }

.ax-step { position: absolute; top: 0; text-align: center; }
.ax-dot { display: block; width: 10px; height: 10px; margin: 27px auto 0; border-radius: 50%; background: #fff; border: 2.5px solid #a49bd8; position: relative; z-index: 1; }
.ax-dot.first { border-color: #534ab7; }
.ax-label { display: block; font-size: 11.5px; font-weight: 600; color: #6b6880; margin-top: 5px; }
.ax-sub { display: block; font-size: 10.5px; color: #a3a0a1; margin-top: 1px; }

.edges { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.edge { stroke: #d6d1ea; stroke-width: 1.6; transition: opacity .15s, stroke .15s; }
.edge.hot { stroke: #534ab7; stroke-width: 2.2; }
.edge.dim { opacity: .1; }

.fcard { position: absolute; z-index: 1; width: 236px; height: 96px; box-sizing: border-box; background: #fff; border: 1px solid #e4e2ea; border-radius: 10px; padding: 10px 12px; cursor: pointer; transition: box-shadow .15s, border-color .15s, opacity .15s, left .38s cubic-bezier(.4,0,.2,1), top .38s cubic-bezier(.4,0,.2,1); }
.fcard:hover { border-color: #534ab7; box-shadow: 0 4px 14px rgb(83 74 183 / .14); z-index: 3; }
.fcard.dim { opacity: .35; }
.fcard.sys { border-style: dashed; background: #fbfdff; }
.fc-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.fc-name { font-size: 13px; font-weight: 600; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fc-gate { font-size: 10.5px; border-radius: 8px; padding: 0 7px; flex-shrink: 0; }
.fc-gate.must { color: #993556; background: #fbeaf0; }
.fc-gate.optional { color: #888780; background: #f1efe8; }
.fc-owner { font-size: 11.5px; color: #6b6880; margin-top: 4px; }
.fc-owner em { font-style: normal; color: #993556; }
.fc-when { font-size: 11px; margin-top: 5px; color: #7f77dd; background: #f4f3fb; border-radius: 7px; padding: 1px 8px; display: inline-block; max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; box-sizing: border-box; }
.fc-when.free { color: #0f6e56; background: #e8f5f0; }

.fc-ops { position: absolute; top: -11px; right: 8px; display: none; gap: 4px; }
.fcard:hover .fc-ops { display: flex; }
.fc-ops .op { font-size: 11px; background: #fff; border: 1px solid #d9d6ea; border-radius: 8px; padding: 2px 9px; color: #534ab7; cursor: pointer; }
.fc-ops .op.danger { color: #a32d2d; border-color: #ecc9c9; }
.fc-ops .op:hover { background: #f4f3fb; }

.tl-legend { display: flex; align-items: center; gap: 10px; margin-top: 12px; font-size: 11.5px; color: #a3a0a1; }
.tl-legend em { font-style: normal; }
.lg { border-radius: 8px; padding: 1px 9px; }
.lg.must { color: #993556; background: #fbeaf0; }
.lg.optional { color: #888780; background: #f1efe8; }
.lg.sys { color: #0b5e8a; background: #e3f1fa; }

/* ---------- 抽屉 ---------- */
.drawer-body { font-size: 13px; color: #444; }
.f-row { margin-bottom: 13px; }
.f-row label { display: block; font-size: 12.5px; color: #555; margin-bottom: 5px; }
.f-row .tip { color: #a3a0a1; font-size: 11.5px; }
.f-def { margin-top: 7px; border: 1px dashed #e2dfec; border-radius: 8px; padding: 7px 9px; }
.fd-row { font-size: 11px; line-height: 1.7; }
.fd-row.pass { color: #0f6e56; }
.fd-row.soft { color: #8a6d1f; }
.fd-row.fail { color: #b03030; }
.iv-row { display: flex; align-items: center; gap: 6px; }
.iv-none { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.iv-hint { font-size: 12px; color: #888; }
.f-desc { font-size: 11.5px; color: #8a8794; margin-top: 5px; }
.f-sec { display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: 600; color: #6b6880; margin: 16px 0 8px; padding-top: 10px; border-top: 1px dashed #ececf0; }
.f-note { font-size: 11.5px; color: #a3a0a1; margin-top: 12px; }
.task-edit { background: #f9f9fb; border-radius: 8px; padding: 9px 10px; margin-bottom: 8px; }
.te-line { display: flex; align-items: center; gap: 8px; }
.d-btns { margin-top: 16px; display: flex; gap: 8px; }

/* 抽屉内的前置节点选择 */
.dep-pick { max-height: 210px; overflow: auto; border: 1px solid #f0eff4; border-radius: 8px; }
.dp-it { display: flex; align-items: center; gap: 8px; padding: 6px 9px; font-size: 12.5px; cursor: pointer; border-bottom: 1px dashed #f0eff4; }
.dp-it:last-child { border-bottom: none; }
.dp-it:hover { background: #f9f8fd; }
.dp-it.off { color: #c2c0c8; cursor: not-allowed; }
.dp-it input { accent-color: #534ab7; flex-shrink: 0; }
.dp-name { flex: 1; font-weight: 500; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dp-it.off .dp-name { color: #c2c0c8; font-weight: 400; }
.dp-meta { font-size: 11px; color: #a3a0a1; flex-shrink: 0; }
.dp-empty { padding: 10px; font-size: 12px; color: #a3a0a1; }
</style>

<!-- 开始时机浮层（非 scoped） -->
<style>
.when-popper .wp-h { font-size: 13px; font-weight: 600; color: #333; }
.when-popper .wp-sub { font-size: 11px; font-weight: 400; color: #888780; margin-left: 6px; }
.when-popper .wp-tip { font-size: 11.5px; color: #8a8794; line-height: 1.6; margin: 6px 0 8px; }
.when-popper .wp-tip b { color: #0f6e56; }
.when-popper .wp-list { max-height: 240px; overflow: auto; border-top: 1px dashed #ececf0; }
.when-popper .wp-it { display: flex; align-items: center; gap: 8px; padding: 7px 2px; border-bottom: 1px dashed #f0eff4; cursor: pointer; font-size: 12.5px; }
.when-popper .wp-it:hover { background: #f9f8fd; }
.when-popper .wp-it.off { color: #c2c0c8; cursor: not-allowed; }
.when-popper .wp-it input { accent-color: #534ab7; }
.when-popper .wp-name { font-weight: 500; color: #333; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.when-popper .wp-it.off .wp-name { color: #c2c0c8; }
.when-popper .wp-meta { font-size: 11px; color: #a3a0a1; flex-shrink: 0; }
.when-popper .wp-preview { margin-top: 9px; font-size: 11.5px; color: #534ab7; background: #f4f3fb; border-radius: 7px; padding: 6px 9px; line-height: 1.55; }
</style>

<style>
/* 系统检查定义 tooltip：popper 挂在 body 下，需全局样式 */
.sys-def-tip .tip-h { font-weight: 600; margin-bottom: 4px; }
.sys-def-tip .tip-row { font-size: 11px; line-height: 1.7; max-width: 320px; }
.sys-def-tip .tip-row.pass { color: #9fe8c5; }
.sys-def-tip .tip-row.soft { color: #ffe3a1; }
</style>
