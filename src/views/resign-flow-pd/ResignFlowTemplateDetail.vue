<template>
  <div class="ftd-page">
    <div class="page-header">
      <div class="header-main">
        <el-button :icon="ArrowLeft" text @click="goBack">返回列表</el-button>
        <h1>{{ isNew ? '新建交接流程' : tpl.name }}</h1>
        <span class="ver-chip">列表视图</span>
        <span v-if="!isNew" class="ver-chip">v{{ tpl.version }}</span>
        <span :class="['st-chip', tpl.status]">{{ tpl.status === 'active' ? '启用' : '停用' }}</span>
      </div>
      <div class="header-actions">
        <el-button @click="save(false)">仅保存草稿</el-button>
        <el-button type="primary" @click="save(true)">保存并启用</el-button>
      </div>
    </div>

    <div class="ftd-cols">
      <!-- ============ 左：基本信息 + 节点清单 ============ -->
      <div class="col-main">
        <!-- 基本信息 -->
        <div class="section-card">
          <div class="card-title">基本信息</div>
          <div class="form-grid">
            <div class="field">
              <label>模板名称 <i class="req">*</i></label>
              <el-input v-model="tpl.name" placeholder="如：普通员工通用离职" maxlength="30" show-word-limit />
            </div>
            <div class="field">
              <label>状态</label>
              <el-radio-group v-model="tpl.status">
                <el-radio value="active">启用</el-radio>
                <el-radio value="disabled">停用</el-radio>
              </el-radio-group>
              <div class="field-hint">停用不影响在途单（发起时快照版本）</div>
            </div>
          </div>

          <div class="field">
            <label>适用岗位 <i class="req">*</i><span class="label-tip">可多选</span></label>
            <el-select v-model="tpl.scope.jobs" multiple placeholder="选择岗位" style="width: 100%">
              <el-option v-for="j in jobOptions" :key="j" :label="j" :value="j" />
            </el-select>
          </div>
          <div class="form-grid three">
            <div class="field">
              <label>适用城市<span class="label-tip">留空 = 不限</span></label>
              <el-select v-model="tpl.scope.cities" multiple placeholder="不限" style="width: 100%">
                <el-option v-for="c in cityOptions" :key="c" :label="c" :value="c" />
              </el-select>
            </div>
            <div class="field">
              <label>适用门店<span class="label-tip">留空 = 不限</span></label>
              <el-select v-model="tpl.scope.stores" multiple placeholder="不限" style="width: 100%">
                <el-option v-for="s in storeOptions" :key="s" :label="s" :value="s" />
              </el-select>
            </div>
            <div class="field">
              <label>用工形式<span class="label-tip">留空 = 不限</span></label>
              <el-select v-model="tpl.scope.employTypes" multiple placeholder="不限" style="width: 100%">
                <el-option label="全职" value="全职" />
                <el-option label="兼职" value="兼职" />
                <el-option label="劳务" value="劳务" />
              </el-select>
            </div>
          </div>
          <div class="field-hint block-hint">
            匹配按「越具体越优先」：岗位+门店+用工 &gt; 岗位+城市 &gt; 仅岗位；未被任何模板命中的发起不拦截，人事确认后自动推送离职合同（不经交接）。
          </div>
        </div>

        <!-- 节点清单 -->
        <div class="section-card">
          <div class="card-head-row">
            <div class="card-title">交接节点</div>
            <div class="head-btns">
              <el-button size="small" :icon="Plus" @click="addNode('manual', null)">添加人工节点</el-button>
              <el-button size="small" :icon="Plus" @click="addNode('system', null)">添加系统检查</el-button>
            </div>
          </div>
          <div class="list-hint">先后关系只由每个节点的<strong>前置节点</strong>决定；列表顺序只是阅读顺序，不代表先后。</div>

          <div v-if="!tpl.nodes.length" class="empty-nodes">还没有节点，点右上角「添加人工节点」开始配置</div>

          <div v-else class="node-list">
            <div
              v-for="(n, i) in rows"
              :key="n.id"
              :class="['node-row', { sysrow: isSystemNode(n) }]"
            >
              <div class="nr-idx">{{ i + 1 }}</div>
              <div class="nr-main">
                <div class="nr-head">
                  <span class="nr-name">{{ n.name || '（未命名节点）' }}</span>
                  <span v-if="isSystemNode(n)" class="nr-sys">系统自动</span>
                  <span v-else class="nr-role">{{ roleLabelOf(n.role) }}<em v-if="n.override">· 指定 {{ n.override }}</em></span>
                  <span :class="['nr-gate', n.gate]">{{ gateTextOf(n) }}</span>
                </div>
                <div class="nr-sub">
                  <span :class="['nr-when', { now: !hasDeps(n) }]">{{ dispatchTextOf(tpl, n) }}</span>
                  <span v-if="isSystemNode(n)" class="nr-cycle">{{ cycleTextOf(n, hasDeps(n)) }}</span>
                  <span v-else class="nr-tasks">事项 {{ n.tasks.length }} 件 · {{ taskBrief(n) }}</span>
                  <span v-if="dependentsOf(tpl, n.id).length" class="nr-next">
                    → {{ dependentsOf(tpl, n.id).map(x => x.name || '未命名').join('、') }}
                  </span>
                </div>
              </div>
              <div class="nr-actions">
                <el-button link type="primary" size="small" @click="addNode('manual', n.id)">加后续节点</el-button>
                <el-button link type="primary" size="small" @click="openDrawer(n)">编辑</el-button>
                <el-button link size="small" @click="removeNode(n)">删除</el-button>
              </div>
            </div>
          </div>

          <div v-if="cycleWarn" class="dag-error">{{ cycleWarn }}</div>
          <div v-if="dupSysWarn" class="dag-error">{{ dupSysWarn }}</div>
        </div>
      </div>

      <!-- ============ 右：结构预览（按前置分层的链路） ============ -->
      <div class="col-side">
        <div class="section-card topo-card">
          <div class="card-title">
            结构预览
            <span class="title-sub">同层横排 = 互不等待；下一层 = 各自等前置办结后才能办理</span>
          </div>
          <div class="topo">
            <template v-for="(g, gi) in groups" :key="g.level">
              <div class="topo-level">
                <div class="tl-label">
                  <span class="tl-no">L{{ g.level + 1 }}</span>
                  <span class="tl-text">{{ g.level === 0 ? '无前置 · 发起后即可办理' : '前置办结后才能开始办理' }}</span>
                </div>
                <div class="tl-nodes">
                  <div
                    v-for="n in g.nodes"
                    :key="n.id"
                    :class="['tnode', n.gate, { sys: isSystemNode(n) }]"
                  >
                    <div class="tn-name">
                      {{ n.name || '未命名' }}
                      <span v-if="isSystemNode(n)" class="tn-sys">系统</span>
                    </div>
                    <div class="tn-role">
                      {{ isSystemNode(n) ? '系统 · ' + cycleShortOf(n, hasDeps(n)) : roleLabelOf(n.role) }}
                      · {{ n.gate === 'must' ? '必过' : (isSystemNode(n) ? '软性' : '可选') }}
                    </div>
                    <div v-if="hasDeps(n)" class="tn-deps">等：{{ depNames(n) }}</div>
                  </div>
                </div>
              </div>
              <div v-if="gi < groups.length - 1" class="topo-gap">↓ 各自等待的前置办结后开始办理</div>
            </template>
            <div v-if="!tpl.nodes.length" class="topo-empty">添加节点后自动生成</div>
          </div>
          <div class="topo-legend">
            <span class="lg must">必过</span>
            <span class="lg optional">可选 / 软性</span>
            <span class="lg sys">系统自动</span>
            <span class="lg-note">必过节点不通过 → 终止全部流程</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ 节点抽屉 ============ -->
    <el-drawer v-model="drawer" :title="editing ? '编辑节点' : '添加节点'" size="560px" destroy-on-close>
      <div v-if="draft" class="drawer-body">
        <!-- 开始时机：由前置节点决定 -->
        <div class="pos-strip" :class="{ nowait: !draft.deps.length }">
          <span class="ps-key">开始时机</span>
          <span class="ps-text">
            <template v-if="!draft.deps.length">
              <b>发起后即可开始办理</b><em>（和所有没配前置的节点同时进行、互不等待）</em>
            </template>
            <template v-else>
              等 {{ draftDepNames }}<b>全部办结</b>后才能开始办理<em>（在下方「前置节点」里调整）</em>
            </template>
          </span>
        </div>

        <div class="field">
          <label>
            前置节点<span class="label-tip">留空 = 发起后即可开始办理；可多选，全部办结后才能开始办理</span>
          </label>
          <el-select
            v-model="draft.deps"
            multiple
            filterable
            clearable
            placeholder="不选 = 没有前置（发起后即可开始办理）"
            style="width: 100%"
          >
            <el-option
              v-for="o in depOptions"
              :key="o.id"
              :label="o.name || '（未命名节点）'"
              :value="o.id"
            >
              <span class="opt-name">{{ o.name || '（未命名节点）' }}</span>
              <span class="opt-meta">{{ isSystemNode(o) ? '系统检查' : roleLabelOf(o.role) }}</span>
            </el-option>
          </el-select>
          <div class="field-hint">
            {{ draft.deps.length ? '这些节点要全部到终态（完成 / 不通过 / 跳过），本节点才能开始办理' : '不配前置 = 与其他无前置节点并行，同时开始办理' }}
          </div>
        </div>

        <div class="field">
          <label>节点类型 <i class="req">*</i></label>
          <el-radio-group v-model="draft.kind" :disabled="editing">
            <el-radio value="manual">人工确认节点</el-radio>
            <el-radio value="system">系统检查节点</el-radio>
          </el-radio-group>
          <div class="field-hint">
            {{ draft.kind === 'system' ? '系统检查为公共枚举，由系统自动执行并落结论' : '由负责人逐事项确认并留证' }}
          </div>
        </div>

        <template v-if="draft.kind === 'system'">
          <div class="field">
            <label>检查项（公共枚举） <i class="req">*</i></label>
            <el-select v-model="draft.sysKey" style="width: 100%" placeholder="选择系统检查项" :disabled="editing">
              <el-option
                v-for="d in systemCheckDict"
                :key="d.key"
                :label="d.name + '（' + d.source + '）'"
                :value="d.key"
                :disabled="sysKeyUsed(d.key) && draft.sysKey !== d.key"
              />
            </el-select>
            <div class="field-hint">{{ sysKeyDesc }}</div>
            <div class="sys-def">
              <div class="sd-row pass">通过（最新镜像 · {{ defLogicLabel(sysDef.pass) }}）：{{ defJoin(sysDef.pass) || '—' }}</div>
              <div v-if="sysDef.soft" class="sd-row soft">软性（{{ defLogicLabel(sysDef.soft) }}）：{{ defJoin(sysDef.soft) }}</div>
              <div v-else class="sd-row soft">无软性区间：只会查到通过或未通过</div>
              <div class="sd-row fail">两者都不命中 → 未通过，由检查 Agent 在下一批次继续盘查</div>
            </div>
          </div>
          <div class="field">
            <label>门禁 <i class="req">*</i></label>
            <el-radio-group v-model="draft.gate">
              <el-radio value="must">必过（不通过即终止全部流程）</el-radio>
              <el-radio value="optional">软性（只记录结果，不阻塞）</el-radio>
            </el-radio-group>
          </div>

          <div class="field">
            <label>
              取数频率
              <span class="label-tip">{{ draft.deps.length ? '前置办结后开始取数' : '发起后就开始取数' }}</span>
            </label>
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
            <div class="field-hint">流程多久去取一次 Agent 的最新结果；<b>结果什么时候出新批次由 Agent 自己决定</b>，两者相互独立</div>
          </div>

          <div class="field">
            <label>
              批次上限
              <span class="label-tip">只计<b>消费到的不同未通过批次</b>；同一批次反复取到不重复计数</span>
            </label>
            <div class="cap-row">
              <el-radio-group v-model="capMode">
                <el-radio-button value="limited">设上限</el-radio-button>
                <el-radio-button value="unlimited">不设上限</el-radio-button>
              </el-radio-group>
              <template v-if="capMode === 'limited'">
                <el-input-number v-model="draft.maxRuns" :min="1" :max="50" size="small" style="width: 110px; margin-left: 10px" />
                <span class="proof-max">个批次</span>
              </template>
              <div class="field-hint">
                取到「通过」即办结、不再消耗；到上限仍无「通过」：{{ draft.gate === 'must' ? '必过 → 终止全部流程、单据作废重发（避免假卡死）' : '软性 → 按「未取得结论」放行留痕' }}
              </div>
            </div>
          </div>

          <div class="sys-preview">
            <span class="sp-label">运行预览</span>
            {{ cycleTextOf(draft, draft.deps.length > 0) }}
          </div>
        </template>

        <template v-else>
          <div class="field">
            <label>节点名称 <i class="req">*</i></label>
            <el-input v-model="draft.name" placeholder="如：客户与物品交接" maxlength="20" show-word-limit />
          </div>
          <div class="form-grid">
            <div class="field">
              <label>负责人角色 <i class="req">*</i></label>
              <el-select v-model="draft.role" style="width: 100%">
                <el-option v-for="r in handoverRoles" :key="r.key" :label="r.label" :value="r.key" />
              </el-select>
              <div class="field-hint">发起时按员工组织关系自动解析到人</div>
            </div>
            <div class="field">
              <label>指定到人<span class="label-tip">选填，覆盖角色解析</span></label>
              <el-input v-model="draft.override" placeholder="留空则按角色定位" />
            </div>
          </div>
          <div class="field">
            <label>门禁 <i class="req">*</i></label>
            <el-radio-group v-model="draft.gate">
              <el-radio value="must">必过（不通过即终止全部流程）</el-radio>
              <el-radio value="optional">可选（软性，只记录结果）</el-radio>
            </el-radio-group>
          </div>

          <div class="tasks-block">
            <div class="tb-head">
              <span>待办事项（{{ draft.tasks.length }}）</span>
              <el-button size="small" :icon="Plus" @click="addTask">添加事项</el-button>
            </div>
            <div v-for="(t, ti) in draft.tasks" :key="t.id" class="task-item">
              <div class="ti-row">
                <el-input v-model="t.name" placeholder="事项名称，如：门店物品归还" size="small" />
                <el-button link type="danger" size="small" :disabled="draft.tasks.length <= 1" @click="draft.tasks.splice(ti, 1)">删除</el-button>
              </div>
              <el-input v-model="t.require" placeholder="办理要求（负责人确认时可见）" size="small" style="margin-top: 6px" />
              <div class="ti-row proof-row">
                <el-radio-group v-model="t.proof" size="small">
                  <el-radio-button value="none">无需附件</el-radio-button>
                  <el-radio-button value="optional">可选附件</el-radio-button>
                  <el-radio-button value="must">必传附件</el-radio-button>
                </el-radio-group>
                <el-input-number v-if="t.proof !== 'none'" v-model="t.proofMax" :min="1" :max="5" size="small" style="width: 108px" />
                <span v-if="t.proof !== 'none'" class="proof-max">个上限</span>
              </div>
              <div v-if="t.proof !== 'none'" class="field-hint">格式固定 PDF / JPG / PNG，多条上传；必传不齐不算完成</div>
            </div>
          </div>
        </template>

        <div class="drawer-foot">
          <el-button @click="drawer = false">取消</el-button>
          <el-button type="primary" @click="applyDraft">确定</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Plus } from '@element-plus/icons-vue'
import {
  resignFlowTemplates, handoverRoles, roleLabelOf, ownerOf,
  systemCheckDict, isSystemNode, cycleTextOf, cycleShortOf, checkLabelOf, checkDefOf, defJoin, defLogicLabel,
  parseFetchFreq, flattenNodes, nodeOf, depsOf, dependentsOf, orderedNodes,
  levelGroupsOf, dispatchTextOf, cycleNodeIds
} from '../../mock/resignHandoverPd.js'

const route = useRoute()
const router = useRouter()

const jobOptions = ['调理师', '客户经理', '前台', '城市总', '大区总', 'IT 工程师', '人事专员', '财务专员']
const cityOptions = ['北京', '上海', '杭州', '成都', '深圳', '佛山']
const storeOptions = ['五棵松万达店', '杭州城北万象城', '凤凰汇', '君超广场', '成都万象城店', '杭州来福士店']

const isNew = route.query.id === '__new__'
const source = isNew ? null : resignFlowTemplates.find(t => t.id === route.query.id)

const tpl = reactive(source
  ? JSON.parse(JSON.stringify(source))
  : {
      id: 'rft-new-' + Date.now(),
      name: '',
      status: 'disabled',
      version: 1,
      updatedBy: 'Lacus7',
      updatedAt: '2026-10-23 17:20',
      scope: { jobs: [], cities: [], stores: [], employTypes: [] },
      nodes: []
    })
if (!tpl.nodes) tpl.nodes = []

const taskBrief = (n) => n.tasks.slice(0, 2).map(t => t.name).join(' / ') + (n.tasks.length > 2 ? ' …' : '')
const gateTextOf = (n) => (n.gate === 'must' ? '必过' : (isSystemNode(n) ? '软性' : '可选'))
const hasDeps = (n) => !!(n?.deps || []).length
const depNames = (n) => depsOf(tpl, n).map(d => d.name || '未命名').join('、')

/** 展示顺序：按前置层级排（只影响阅读顺序，不影响下发） */
const rows = computed(() => orderedNodes(tpl))
const groups = computed(() => levelGroupsOf(tpl))

/* ---------- 节点抽屉 ---------- */
const drawer = ref(false)
const editing = ref(false)
const draft = ref(null)

const findNode = (id) => nodeOf(tpl, id)

/** 候选前置：排除自己，以及（直接或间接）等自己的节点——选了就成环 */
const depOptions = computed(() => {
  const self = draft.value?.id
  const bad = new Set(self ? [self] : [])
  if (self) {
    const walk = (id) => {
      for (const d of dependentsOf(tpl, id)) {
        if (!bad.has(d.id)) { bad.add(d.id); walk(d.id) }
      }
    }
    walk(self)
  }
  return rows.value.filter(n => !bad.has(n.id))
})

const draftDepNames = computed(() =>
  (draft.value?.deps || []).map(id => `「${findNode(id)?.name || '未命名'}」`).join('')
)

const sysKeyUsed = (key) =>
  flattenNodes(tpl).some(n => n.kind === 'system' && n.sysKey === key) && draft.value?.sysKey !== key

const sysKeyDesc = computed(() => {
  const d = systemCheckDict.find(x => x.key === draft.value?.sysKey)
  return d ? `${d.source} · ${d.desc}` : '检查项与数据源由系统侧维护，业务只能选用'
})
const sysDef = computed(() => checkDefOf(draft.value?.sysKey))

/* 取数频率 = 数字 + 单位（分钟/小时/天），mock 里存 `<n><单位>` 字符串 */
const ffNum = computed({
  get: () => parseFetchFreq(draft.value?.fetchFreq)?.num ?? 1,
  set: (v) => { if (v) draft.value.fetchFreq = `${v}${ffUnit.value}` }
})
const ffUnit = computed({
  get: () => parseFetchFreq(draft.value?.fetchFreq)?.unit ?? 'h',
  set: (u) => { draft.value.fetchFreq = `${ffNum.value}${u}` }
})

/* 软性项的批次上限：设上限 / 不设上限 两态，映射到 draft.maxRuns */
const capMode = ref('unlimited')
const syncCapMode = () => { capMode.value = draft.value?.maxRuns ? 'limited' : 'unlimited' }
watch(capMode, (v) => {
  if (!draft.value) return
  if (v === 'unlimited') draft.value.maxRuns = null
  else if (!draft.value.maxRuns) draft.value.maxRuns = 5
})

/** 添加节点：type = manual | system；depId 有值 = 预置成「等某个节点」的后续节点 */
const addNode = (type, depId = null) => {
  editing.value = false
  draft.value = type === 'system'
    ? reactive({
        id: 'sys-' + Date.now(), kind: 'system', sysKey: '', name: '',
        gate: 'must', fetchFreq: '1d', maxRuns: 5, deps: depId ? [depId] : [], tasks: []
      })
    : reactive({
        id: 'n' + Date.now(), kind: 'manual', name: '', role: 'hr', gate: 'must',
        override: null, deps: depId ? [depId] : [],
        tasks: [{ id: 't' + Date.now(), name: '', require: '', proof: 'optional', proofMax: 3 }]
      })
  syncCapMode()
  drawer.value = true
}

const openDrawer = (n) => {
  editing.value = true
  draft.value = reactive(JSON.parse(JSON.stringify(n)))
  if (!draft.value.deps) draft.value.deps = []
  if (draft.value.kind === 'system') {
    draft.value.fetchFreq = draft.value.fetchFreq || 'none'
    draft.value.maxRuns = draft.value.maxRuns ?? 5
  }
  syncCapMode()
  drawer.value = true
}

const applyDraft = () => {
  const d = draft.value
  if (d.kind === 'system') {
    if (!d.sysKey) return ElMessage.warning('请选择系统检查项')
    if (sysKeyUsed(d.sysKey)) return ElMessage.warning('该检查项已在模板中使用')
    d.name = checkLabelOf(d.sysKey)
    if (d.gate === 'optional' && !d.maxRuns && capMode.value === 'limited') {
      return ElMessage.warning('请填写次数上限，或改为不设上限')
    }
  } else if (!d.name.trim()) {
    return ElMessage.warning('请填写节点名称')
  }
  d.deps = (d.deps || []).filter(id => id !== d.id && findNode(id))
  const plain = JSON.parse(JSON.stringify(d))
  const idx = tpl.nodes.findIndex(n => n.id === plain.id)
  if (idx >= 0) tpl.nodes.splice(idx, 1, plain)
  else tpl.nodes.push(plain)
  drawer.value = false
  ElMessage.success('节点已保存（草稿态，整模板保存后生效）')
}

const removeNode = (n) => {
  const waiters = dependentsOf(tpl, n.id)
  const doRemove = () => {
    tpl.nodes = tpl.nodes.filter(x => x.id !== n.id)
    /* 同时把它从别人的前置里摘掉，避免留下指向不存在节点的前置 */
    tpl.nodes.forEach(x => { x.deps = (x.deps || []).filter(id => id !== n.id) })
    ElMessage.success('节点已删除')
  }
  if (!waiters.length) return doRemove()
  ElMessageBox.confirm(
    `有 ${waiters.length} 个节点在等「${n.name || '该节点'}」（${waiters.map(w => w.name).join('、')}）。删除后它们的前置会被一并去掉，改为发起后即可开始办理。继续？`,
    '删除节点',
    { type: 'warning', confirmButtonText: '一并处理', cancelButtonText: '取消' }
  ).then(doRemove).catch(() => {})
}

const addTask = () => draft.value.tasks.push({ id: 't' + Date.now(), name: '', require: '', proof: 'optional', proofMax: 3 })

/* ---------- 保存校验 ---------- */
const cycleWarn = computed(() => {
  const bad = cycleNodeIds(tpl)
  if (!bad.length) return ''
  const names = bad.map(id => findNode(id)?.name || '未命名').join('、')
  return `前置关系成环：${names}。请调整前置节点，成环的模板无法保存。`
})

const dupSysWarn = computed(() => {
  const seen = new Set()
  for (const n of flattenNodes(tpl)) {
    if (n.kind === 'system') {
      if (seen.has(n.sysKey)) return `系统检查「${n.name}」重复添加，每个检查项在一个模板里只能出现一次`
      seen.add(n.sysKey)
    }
  }
  return ''
})

const save = (activate) => {
  if (!tpl.name.trim()) return ElMessage.warning('请填写模板名称')
  if (!tpl.scope.jobs.length) return ElMessage.warning('至少选择一个适用岗位')
  if (!tpl.nodes.length) return ElMessage.warning('至少配置一个交接节点')
  if (cycleWarn.value) return ElMessage.error('前置节点成环，无法保存')
  if (dupSysWarn.value) return ElMessage.error(dupSysWarn.value)
  flattenNodes(tpl).forEach(n => { if (!n.override) n.override = null })
  tpl.status = activate ? 'active' : tpl.status
  tpl.version = (tpl.version || 1) + 1
  tpl.updatedAt = '2026-10-23 17:20'
  ElMessage.success(`模板已保存${activate ? '并启用' : ''}（原型演示，不落库）`)
  setTimeout(() => router.push({ name: 'resign-flow-template' }), 900)
}

const goBack = () => router.push({ name: 'resign-flow-template' })

/* 文档截图演示：?node=<节点id> 直接打开该节点抽屉 */
onMounted(() => {
  const nid = route.query.node
  if (!nid) return
  const n = findNode(nid)
  if (n) openDrawer(n)
})

/* 演示辅助：负责人解析保留引用 */
void ownerOf
</script>

<style scoped>
.ftd-page { padding: 18px 22px 30px; }
.page-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 14px; }
.header-main { display: flex; align-items: center; gap: 10px; }
.header-main h1 { margin: 0; font-size: 20px; }
.ver-chip { font-size: 11.5px; color: #534ab7; background: #eeedfe; border-radius: 9px; padding: 1px 8px; }
.st-chip { font-size: 11.5px; border-radius: 9px; padding: 1px 8px; }
.st-chip.active { color: #0f6e56; background: #e1f5ee; }
.st-chip.disabled { color: #888780; background: #f1efe8; }

.ftd-cols { display: flex; gap: 16px; align-items: flex-start; }
.col-main { flex: 1.65; min-width: 0; }
.col-side { flex: 1; min-width: 300px; position: sticky; top: 16px; }

.section-card { background: #fff; border: 1px solid #ececf0; border-radius: 12px; padding: 16px 18px; margin-bottom: 14px; }
.card-title { font-size: 15px; font-weight: 600; margin-bottom: 12px; }
.card-head-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
.card-head-row .card-title { margin-bottom: 0; }
.head-btns { display: flex; gap: 8px; }
.title-sub { font-size: 11.5px; font-weight: 400; color: #a3a0a1; margin-left: 8px; line-height: 1.7; }
.list-hint { font-size: 12px; color: #5f6368; line-height: 1.85; background: #f7f8fa; border-radius: 8px; padding: 9px 12px; margin-bottom: 12px; }
.list-hint b { color: #534ab7; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
.form-grid.three { grid-template-columns: 1fr 1fr 1fr; }
.field { margin-bottom: 14px; }
.field > label { display: block; font-size: 13px; font-weight: 500; color: #333; margin-bottom: 6px; }
.req { color: #d4537e; font-style: normal; }
.label-tip { font-size: 11px; font-weight: 400; color: #a3a0a1; margin-left: 6px; }
.field-hint { font-size: 11.5px; color: #a3a0a1; margin-top: 4px; }
.block-hint { background: #f7f8fa; border-radius: 8px; padding: 8px 12px; line-height: 1.7; }

/* 节点清单 */
.node-list { display: flex; flex-direction: column; gap: 8px; }
.node-row { display: flex; align-items: center; gap: 12px; border: 1px solid #ececf0; border-radius: 10px; padding: 10px 14px; background: #fff; }
.node-row.sysrow { background: #f7fbfe; border-color: #dbeaf4; }
.nr-idx { width: 22px; height: 22px; border-radius: 50%; background: #f1efe8; color: #77756c; font-size: 11.5px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.nr-main { flex: 1; min-width: 0; }
.nr-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.nr-name { font-size: 13.5px; font-weight: 600; color: #333; }
.nr-role { font-size: 11.5px; color: #534ab7; background: #eeedfe; border-radius: 8px; padding: 1px 8px; }
.nr-role em { font-style: normal; color: #7f77dd; }
.nr-gate { font-size: 11.5px; border-radius: 8px; padding: 1px 8px; }
.nr-gate.must { color: #993556; background: #fbeaf0; }
.nr-gate.optional { color: #888780; background: #f1efe8; }
.nr-sub { font-size: 12px; color: #8a8f99; margin-top: 5px; display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.nr-when { color: #7f77dd; background: #f4f3fb; border-radius: 7px; padding: 1px 7px; }
.nr-when.now { color: #0f6e56; background: #e8f5f0; }
.nr-tasks { color: #b4b2a9; }
.nr-cycle { color: #0b5e8a; }
.nr-next { color: #b4b2a9; }
.nr-actions { flex-shrink: 0; }
.nr-sys { font-size: 11.5px; color: #0b5e8a; background: #e3f1fa; border-radius: 8px; padding: 1px 8px; }

.dag-error { margin-top: 10px; font-size: 12.5px; color: #a32d2d; background: #fcebeb; border: 1px solid #f7c1c1; border-radius: 8px; padding: 8px 12px; }
.empty-nodes { text-align: center; color: #a3a0a1; font-size: 13px; padding: 24px 0; }

/* 结构预览：按前置分层 */
.topo-card { min-height: 260px; }
.topo { display: flex; flex-direction: column; }
.topo-level { display: flex; flex-direction: column; gap: 8px; }
.tl-label { display: flex; align-items: center; gap: 8px; }
.tl-no { font-size: 11px; font-weight: 700; color: #534ab7; background: #eeedfe; border-radius: 7px; padding: 1px 7px; }
.tl-text { font-size: 11px; color: #a3a0a1; }
.tl-nodes { display: flex; flex-wrap: wrap; gap: 6px; }
.tnode { flex: 1 1 46%; min-width: 0; border: 1px solid; border-radius: 10px; padding: 7px 9px; }
.tnode.must { border-color: #f4c0d1; background: #fdf3f7; }
.tnode.optional { border-color: #e4e2da; background: #fafaf8; }
.tn-name { font-size: 12.5px; font-weight: 600; color: #333; line-height: 1.4; }
.tnode.must .tn-name { color: #72243e; }
.tn-role { font-size: 11px; color: #8a8f99; margin-top: 3px; }
.tnode.sys { border-color: #bcd9ec; background: #f2f9fd; }
.tnode.sys .tn-name { color: #0b5e8a; }
.tn-sys { font-size: 10px; color: #0b5e8a; background: #e3f1fa; border-radius: 7px; padding: 0 6px; margin-left: 5px; vertical-align: 1px; }
.tn-deps { font-size: 10.5px; color: #7f77dd; margin-top: 4px; border-top: 1px dashed #e4e2ea; padding-top: 3px; }
.topo-gap { text-align: center; color: #b4b2a9; font-size: 11px; padding: 7px 0; }
.topo-empty { color: #a3a0a1; font-size: 12.5px; text-align: center; padding: 20px 0; }
.topo-legend { display: flex; align-items: center; gap: 8px; margin-top: 12px; border-top: 1px dashed #ececf0; padding-top: 10px; flex-wrap: wrap; }
.lg { font-size: 11px; border-radius: 8px; padding: 1px 8px; }
.lg.must { color: #993556; background: #fbeaf0; }
.lg.optional { color: #888780; background: #f1efe8; }
.lg.sys { color: #0b5e8a; background: #e3f1fa; }
.lg-note { font-size: 11.5px; color: #a3a0a1; }

/* 抽屉 */
.drawer-body { padding: 0 4px; }
.pos-strip { display: flex; gap: 10px; align-items: flex-start; background: #f7f8fa; border: 1px solid #ececf0; border-radius: 10px; padding: 9px 12px; margin-bottom: 14px; }
.pos-strip.nowait { background: #f2f9f5; border-color: #d7ebdf; }
.ps-key { flex-shrink: 0; font-size: 11.5px; font-weight: 600; color: #534ab7; background: #eeedfe; border-radius: 8px; padding: 1px 8px; }
.pos-strip.nowait .ps-key { color: #0f6e56; background: #e1f5ee; }
.ps-text { font-size: 12.5px; color: #5f6368; }
.ps-text b { color: #333; }
.ps-text em { font-style: normal; color: #a3a0a1; }
.opt-name { float: left; }
.opt-meta { float: right; color: #a3a0a1; font-size: 11.5px; margin-left: 12px; }
.tasks-block { border-top: 1px dashed #ececf0; margin-top: 6px; padding-top: 12px; }
.tb-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; font-size: 13px; font-weight: 600; color: #333; }
.task-item { border: 1px solid #ececf0; border-radius: 10px; padding: 10px 12px; margin-bottom: 10px; background: #fcfcfd; }
.ti-row { display: flex; align-items: center; gap: 10px; }
.proof-row { margin-top: 8px; flex-wrap: wrap; }
.proof-max { font-size: 12px; color: #8a8f99; }
.iv-row { display: flex; align-items: center; gap: 6px; }
.iv-none { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.iv-hint { font-size: 12px; color: #888; }

/* 系统检查节奏 */
.sys-cap-fixed { font-size: 12.5px; color: #5f6368; background: #f7fbfe; border: 1px solid #dbeaf4; border-radius: 8px; padding: 8px 12px; }
.cap-warn { color: #a33b12; background: transparent; }
.sys-def { margin-top: 7px; border: 1px dashed #dfe6ec; border-radius: 8px; padding: 7px 9px; }
.sd-row { font-size: 11px; line-height: 1.7; }
.sd-row.pass { color: #0f6e56; }
.sd-row.soft { color: #8a6d1f; }
.sd-row.fail { color: #b03030; }
.cap-row { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.cap-row .field-hint { flex-basis: 100%; }
.sys-preview { font-size: 12.5px; color: #0b5e8a; background: #f2f9fd; border: 1px dashed #bcd9ec; border-radius: 8px; padding: 8px 12px; }
.sp-label { font-size: 11px; color: #8aa9bd; margin-right: 8px; }
.drawer-foot { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }
</style>
