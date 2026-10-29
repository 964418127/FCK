<template>
  <div class="gate-page">
    <!-- 未登录：只给一个密钥输入框，配置内容不渲染 -->
    <div v-if="!authed" class="section-card lock-card">
      <div class="lock-head">
        <el-icon class="lock-icon"><Lock /></el-icon>
        <div>
          <h2>菜单配置需要密钥</h2>
          <p class="lock-sub">输入密钥后才能查看和修改菜单显示范围。</p>
        </div>
      </div>

      <div class="lock-form">
        <el-input
          v-model="keyInput"
          type="password"
          show-password
          placeholder="请输入密钥"
          size="large"
          style="max-width: 320px"
          @keyup.enter="doLogin"
        />
        <el-button type="primary" size="large" :loading="loggingIn" @click="doLogin">登录</el-button>
      </div>

      <p v-if="loginError" class="lock-error">{{ loginError }}</p>
      <p v-if="gateState.keyIsDefault" class="lock-hint">
        首次使用，默认密钥为 <code>fck2026</code>；登录后请在右上角「修改密钥」里换掉。
      </p>
      <p v-if="gateState.mode !== 'server'" class="lock-hint">
        未连上服务端（{{ gateState.lastError || '接口不可用' }}），无法登录。
      </p>
    </div>

    <template v-else>
      <div class="page-header">
        <div class="header-main">
          <h1>菜单配置</h1>
          <el-tag
            :type="gateState.mode === 'server' ? 'success' : 'info'"
            effect="plain"
            size="small"
          >
            {{ gateState.mode === 'server' ? '服务端共享 · 全局' : '仅本机' }}
          </el-tag>
          <span v-if="gateState.updatedAt" class="stamp">更新于 {{ stamp }}</span>

          <!-- 账号级操作：与当前页签无关，放在页头而不是工具条里 -->
          <div v-if="!localOnly" class="header-actions">
            <el-button size="small" @click="openKeyDialog">修改密钥</el-button>
            <el-button size="small" text @click="doLogout">退出</el-button>
          </div>
        </div>
        <p class="tip">
          三个端各管一套：<strong>Web 端</strong>是主应用左侧边栏，<strong>移动端</strong>是手机首页的格子，
          <strong>文档中心</strong>是文档中心内部的章节导航。改动<strong>实时写回服务端</strong>，
          所有打开的页面（含局域网其它电脑、手机）会自动同步，不需要刷新。
        </p>
        <p v-if="gateState.keyIsDefault" class="tip warn-tip">
          仍在用默认密钥，任何人都能进来改菜单 —— 建议点右上角「修改密钥」换掉。
        </p>
        <p v-if="localOnly" class="tip warn-tip">
          当前没有服务端接口（静态托管），密钥无法校验，已直接放行：配置只保存在这台电脑的浏览器里，换设备不同步。
        </p>
      </div>

      <el-tabs v-model="activeTab" class="gate-tabs">
        <el-tab-pane v-for="t in TABS" :key="t.key" :name="t.key">
          <template #label>
            <span class="tab-label">{{ t.label }}</span>
            <span class="tab-count">{{ statsOf(t.key).visible }}/{{ statsOf(t.key).total }}</span>
          </template>
        </el-tab-pane>
      </el-tabs>

      <p class="tab-hint">{{ currentTab.hint }}</p>

      <div class="section-card toolbar">
        <el-input
          v-model="keyword"
          size="small"
          placeholder="搜索当前页签的菜单 / 分组"
          clearable
          style="width: 240px"
        />
        <span class="count">已显示 <b>{{ visibleCount }}</b> / {{ totalCount }} 项</span>
        <div class="seg">
          <button
            v-for="m in VIEW_MODES"
            :key="m.key"
            class="seg-btn"
            :class="{ active: viewMode === m.key }"
            @click="switchView(m.key)"
          >{{ m.label }}</button>
        </div>
        <div class="tb-right">
          <el-button size="small" :disabled="!canUndo()" @click="doUndo">撤销</el-button>
          <el-button size="small" :disabled="!hasCustomOrder" @click="doResetOrder">恢复默认顺序</el-button>
          <el-button size="small" @click="showAll">全显示</el-button>
          <el-button size="small" @click="hideAll">全隐藏</el-button>
          <el-button size="small" @click="openShare">复制分享链接</el-button>
        </div>
      </div>

      <!-- 3D 视图：整屏看顺序与分组，拖方块调整 -->
      <div v-if="viewMode === '3d'" class="section-card canvas-card">
        <GateMenu3D
          :nodes="sceneNodes"
          :tab="activeTab"
          @toggle="onToggle3D"
          @move="onMove3D"
          @unsupported="onWebglMissing"
        />
      </div>

      <!-- 列表视图：批量勾选与精排的确定性入口 -->
      <div v-else class="section-card">
        <p v-if="keyword" class="drag-tip">搜索状态下不可拖动排序，清空搜索词后可拖动。</p>

        <div v-for="g in rows" :key="g.node.index" class="group-block">
          <!-- 一级：分组 -->
          <div
            class="row group-row"
            :class="dropClass(g.node.index)"
            :draggable="!keyword"
            @dragstart="onDragStart($event, 'group', g.node.index)"
            @dragover="onDragOver($event, 'group', g.node.index)"
            @dragleave="onDragLeave(g.node.index)"
            @drop="onDrop($event, 'group', g.node.index)"
            @dragend="onDragEnd"
          >
            <el-icon class="grip"><Rank /></el-icon>
            <el-checkbox
              :model-value="allVisible(g.node)"
              :indeterminate="partial(g.node)"
              @change="(v) => setNode(g.node, v)"
            />
            <span class="label group-label" @click="toggleOpen(g.node.index)">{{ g.node.label }}</span>
            <span class="count-badge">{{ visibleOf(g.node) }} / {{ idsOf(g.node).length }}</span>
            <el-icon
              v-if="g.node.children"
              class="caret"
              :class="{ open: isOpen(g.node.index) }"
              @click="toggleOpen(g.node.index)"
            ><ArrowDown /></el-icon>
          </div>

          <!-- 二级 / 三级：分组内页面 -->
          <template v-if="g.node.children && (isOpen(g.node.index) || keyword)">
            <div
              v-for="c in flatten(g.node.children, 1)"
              :key="c.node.index"
              class="row child-row"
              :class="dropClass(c.node.index)"
              :style="{ paddingLeft: 6 + c.depth * 18 + 'px' }"
              :draggable="!keyword"
              @dragstart="onDragStart($event, 'item', c.node.index, g.node.index)"
              @dragover="onDragOver($event, 'item', c.node.index, g.node.index)"
              @dragleave="onDragLeave(c.node.index)"
              @drop="onDrop($event, 'item', c.node.index, g.node.index)"
              @dragend="onDragEnd"
            >
              <el-icon class="grip"><Rank /></el-icon>
              <el-checkbox
                :model-value="allVisible(c.node)"
                :indeterminate="partial(c.node)"
                @change="(v) => setNode(c.node, v)"
              />
              <span class="label" :class="{ sub: c.depth > 1 }">{{ c.node.label }}</span>
            </div>
          </template>
        </div>

        <div v-if="!rows.length" class="empty">没有匹配的菜单</div>
      </div>

      <!-- ===== 模型配置：v2 事件树真实生成用，与菜单配置同一份登录态 ===== -->
      <div class="section-card llm-card">
        <div class="llm-head">
          <div class="llm-title">
            <h3>模型配置</h3>
            <el-tag v-if="llmState.available" size="small" effect="plain" :type="llmReady ? 'success' : 'info'">
              {{ llmReady ? '可直接生成' : '未配置 key' }}
            </el-tag>
            <el-tag v-else-if="llmState.available === false" size="small" effect="plain" type="warning">
              无中转 · 只能回放
            </el-tag>
          </div>
          <p class="llm-sub">
            事件树由这里的模型真实生成。Key 只存在服务端 <code>.llm-config.json</code>（权限 600、已 gitignore），
            页面永远只看到掩码，浏览器不接触原文。
          </p>
        </div>

        <div v-if="llmState.available === false" class="llm-offline">
          当前打开的是静态产物（<code>site/</code> 或 file://），没有 Node 中转，无法真实调用。
          生成入口会自动退化为「回放归档结果」；要真跑，用 <code>npm run dev</code> 或 <code>npm run preview</code>。
        </div>

        <el-form v-else label-width="96px" size="default" class="llm-form">
          <el-form-item label="服务商">
            <el-select v-model="llmForm.provider" style="width: 240px" @change="onProviderChange">
              <el-option v-for="p in LLM_PRESETS" :key="p.key" :label="p.label" :value="p.key" />
            </el-select>
            <span class="llm-note">{{ currentPreset.note }}</span>
          </el-form-item>

          <el-form-item label="Base URL">
            <el-input v-model="llmForm.baseUrl" placeholder="https://api.deepseek.com/v1" style="max-width: 420px" />
          </el-form-item>

          <el-form-item label="模型">
            <el-select
              v-model="llmForm.model"
              filterable
              allow-create
              default-first-option
              placeholder="选一个或直接输入"
              style="width: 240px"
            >
              <el-option v-for="m in modelOptions" :key="m" :label="m" :value="m" />
            </el-select>
            <el-button size="small" :loading="llmState.modelsLoading" @click="pullModels">拉取可用模型</el-button>
            <span v-if="llmState.modelsMessage" class="llm-note">{{ llmState.modelsMessage }}</span>
          </el-form-item>

          <el-form-item label="API Key">
            <el-input
              v-model="llmForm.apiKey"
              type="password"
              show-password
              autocomplete="off"
              :placeholder="llmState.config.hasKey ? `已保存 ${llmState.config.keyMask}，留空表示不修改` : '粘贴 key'"
              style="max-width: 420px"
            />
            <el-button
              v-if="llmState.config.hasKey"
              size="small"
              text
              type="danger"
              @click="clearKey"
            >清除</el-button>
          </el-form-item>

          <el-form-item label="温度">
            <el-slider v-model="llmForm.temperature" :min="0" :max="1" :step="0.05" style="width: 220px" />
            <span class="llm-note">{{ llmForm.temperature.toFixed(2) }} · 生成结构建议 0.2，越低越稳</span>
          </el-form-item>

          <el-form-item label="超时">
            <el-input-number v-model="llmForm.timeoutMs" :min="10000" :max="300000" :step="10000" controls-position="right" style="width: 150px" />
            <span class="llm-note">毫秒 · 一次生成通常 20–40 秒</span>
          </el-form-item>

          <el-form-item label="JSON 模式">
            <el-switch v-model="llmForm.jsonMode" />
            <span class="llm-note">支持的供应商会强制输出合法 JSON；不支持时靠提示词 + 校验兜底</span>
          </el-form-item>

          <el-form-item label="思考强度">
            <el-select v-model="llmForm.reasoningEffort" style="width: 180px">
              <el-option label="不发（普通模型）" value="auto" />
              <el-option label="low · 快" value="low" />
              <el-option label="medium" value="medium" />
              <el-option label="high · 慢" value="high" />
            </el-select>
            <span class="llm-note">推理型模型（MiniMax M3 系列等）必须选 low，否则思考吃光输出预算、正文为空</span>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" :loading="llmSaving" @click="saveLlm">保存</el-button>
            <el-button :loading="llmState.testing" @click="doTestLlm">测试连通性</el-button>
            <span v-if="llmState.config.updatedAt" class="llm-note">上次保存 {{ llmStamp }}</span>
          </el-form-item>
        </el-form>

        <div v-if="llmState.lastTest" class="llm-result" :class="llmState.lastTest.ok ? 'ok' : 'bad'">
          <template v-if="llmState.lastTest.ok">
            通路正常 · 延迟 {{ llmState.lastTest.latency }}ms · 模型回显「{{ llmState.lastTest.reply || '（空）' }}」
            <span v-if="llmState.lastTest.usage" class="llm-dim">
              · tokens {{ llmState.lastTest.usage.prompt_tokens }}/{{ llmState.lastTest.usage.completion_tokens }}
            </span>
          </template>
          <template v-else>{{ llmState.lastTest.message }}</template>
        </div>
      </div>
    </template>

    <el-dialog v-model="shareVisible" title="分享链接" width="560px">
      <p class="share-tip">
        配置已经存在服务端，同网段的电脑/手机直接打开站点即可看到同样的菜单，<strong>一般不需要这条链接</strong>。
        它适合「静态托管、没有服务端接口」的场景：配置写在链接里，对方打开即套用。
      </p>
      <el-input :model-value="shareLink" readonly type="textarea" :rows="3" />
      <template #footer>
        <el-button size="small" @click="shareVisible = false">关闭</el-button>
        <el-button size="small" type="primary" @click="copyLink">复制链接</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="keyVisible" title="修改密钥" width="460px">
      <el-form label-width="86px" size="default">
        <el-form-item label="当前密钥">
          <el-input v-model="keyForm.oldKey" type="password" show-password placeholder="用于验证身份" />
        </el-form-item>
        <el-form-item label="新密钥">
          <el-input v-model="keyForm.newKey" type="password" show-password placeholder="至少 4 位" />
        </el-form-item>
        <el-form-item label="确认新密钥">
          <el-input v-model="keyForm.confirm" type="password" show-password placeholder="再输一次" />
        </el-form-item>
      </el-form>
      <p class="key-tip">改完后其它设备上的登录会失效，需要用新密钥重新登录。</p>
      <template #footer>
        <el-button size="small" @click="keyVisible = false">取消</el-button>
        <el-button size="small" type="primary" :loading="keySaving" @click="submitKey">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowDown, Lock, Rank } from '@element-plus/icons-vue'
import { sidebarMenu } from '../config/sidebarMenu.js'
import { mobileMenuCatalog } from '../config/mobileMenu.js'
import { docMenu } from '../docs/menu.js'
import { LLM_PRESETS, presetOf } from '../config/llmPresets.js'
import { llmState, loadLlmConfig, saveLlmConfig, testLlm, fetchLlmModels } from '../composables/useLlmConfig.js'
import {
  gateState,
  isMenuVisible,
  setManyVisible,
  buildShareLink,
  login,
  logout,
  checkSession,
  changeKey,
  sortedNodes,
  moveNode,
  resetOrder,
  undo,
  canUndo,
  registerMenuTrees,
  normalizeVisibility
} from '../composables/useGateConfig.js'
// three.js 只在切到 3D 视图时才加载，独立成 chunk，不影响首屏
const GateMenu3D = defineAsyncComponent(() => import('../components/gate/GateMenu3D.vue'))

const keyword = ref('')
const shareVisible = ref(false)
const shareLink = ref('')

const route = useRoute()
const router = useRouter()

// ---- 登录 ----
const authed = ref(false)
const localOnly = ref(false)
const keyInput = ref('')
const loginError = ref('')
const loggingIn = ref(false)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

onMounted(async () => {
  // 进页面先把历史配置收敛一次（watch 只在后续变化时触发）
  normalizeVisibility()
  authed.value = await checkSession()
  if (authed.value) {
    initLlm()
    return
  }
  // 等 main.js 里的 connectGate 判定完「能不能连上服务端」
  for (let i = 0; i < 15 && gateState.connected === null; i++) await sleep(100)
  if (gateState.connected === false) {
    // 没有服务端（静态托管）：密钥无从校验，放行为本机配置，并明确标注
    localOnly.value = true
    authed.value = true
    initLlm()
  }
})

const doLogin = async () => {
  loginError.value = ''
  if (!keyInput.value) {
    loginError.value = '请输入密钥'
    return
  }
  loggingIn.value = true
  const res = await login(keyInput.value)
  loggingIn.value = false
  if (!res.ok) {
    loginError.value = res.message
    return
  }
  keyInput.value = ''
  authed.value = true
  initLlm()
  ElMessage.success('已登录')
}

const doLogout = async () => {
  await logout()
  authed.value = false
  ElMessage.success('已退出')
}

// ---- 修改密钥 ----
const keyVisible = ref(false)
const keySaving = ref(false)
const keyForm = reactive({ oldKey: '', newKey: '', confirm: '' })

const openKeyDialog = () => {
  keyForm.oldKey = ''
  keyForm.newKey = ''
  keyForm.confirm = ''
  keyVisible.value = true
}

const submitKey = async () => {
  if (!keyForm.oldKey) return ElMessage.warning('请输入当前密钥')
  if (keyForm.newKey.trim().length < 4) return ElMessage.warning('新密钥至少 4 位')
  if (keyForm.newKey !== keyForm.confirm) return ElMessage.warning('两次输入的新密钥不一致')
  keySaving.value = true
  const res = await changeKey(keyForm.oldKey, keyForm.newKey.trim())
  keySaving.value = false
  if (!res.ok) return ElMessage.error(res.message)
  keyVisible.value = false
  ElMessage.success('密钥已修改')
}

// ---- 模型配置（v2 事件树生成用） ----
const llmSaving = ref(false)
const llmForm = reactive({
  provider: 'deepseek',
  baseUrl: '',
  model: '',
  apiKey: '',
  temperature: 0.2,
  timeoutMs: 120000,
  jsonMode: false,
  reasoningEffort: 'auto'
})

const currentPreset = computed(() => presetOf(llmForm.provider))

const modelOptions = computed(() => {
  // 三路合并：服务商拉到的真实列表 > 预置提示 > 当前值
  const list = [...(llmState.models || []), ...(currentPreset.value.models || [])]
  if (llmForm.model) list.unshift(llmForm.model)
  return [...new Set(list)].filter(Boolean)
})

/** 能不能直接生成：有 key，或选了本地 ollama（不走鉴权） */
const llmReady = computed(() => llmState.config.hasKey || llmForm.provider === 'ollama')

const llmStamp = computed(() => {
  const t = llmState.config.updatedAt
  if (!t) return ''
  const d = new Date(t)
  if (Number.isNaN(d.getTime())) return ''
  const p = (n) => String(n).padStart(2, '0')
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
})

const fillLlmForm = () => {
  const c = llmState.config
  const preset = presetOf(c.provider || 'deepseek')
  llmForm.provider = c.provider || 'deepseek'
  llmForm.baseUrl = c.baseUrl || preset.baseUrl
  llmForm.model = c.model || preset.model
  llmForm.temperature = typeof c.temperature === 'number' ? c.temperature : 0.2
  llmForm.timeoutMs = c.timeoutMs || 120000
  llmForm.jsonMode = Boolean(c.jsonMode)
  llmForm.reasoningEffort = c.reasoningEffort || preset.reasoningEffort || 'auto'
  llmForm.apiKey = ''
}

const initLlm = async () => {
  await loadLlmConfig()
  fillLlmForm()
}

/** 换服务商：直接跟到预设的端点和模型，用户随后可改 */
const onProviderChange = (key) => {
  const p = presetOf(key)
  if (p.baseUrl) llmForm.baseUrl = p.baseUrl
  llmForm.model = p.model || ''
  llmForm.reasoningEffort = p.reasoningEffort || 'auto'
  // 上一个服务商拉到的模型列表不能留着，会串台
  llmState.models = []
  llmState.modelsMessage = ''
  llmState.lastTest = null
}

const saveLlm = async () => {
  if (!llmForm.baseUrl.trim()) return ElMessage.warning('先填 Base URL')
  if (!llmForm.model.trim()) return ElMessage.warning('先选模型')
  llmSaving.value = true
  const res = await saveLlmConfig({
    provider: llmForm.provider,
    baseUrl: llmForm.baseUrl,
    model: llmForm.model,
    temperature: llmForm.temperature,
    timeoutMs: llmForm.timeoutMs,
    jsonMode: llmForm.jsonMode,
    reasoningEffort: llmForm.reasoningEffort,
    ...(llmForm.apiKey ? { apiKey: llmForm.apiKey } : {})
  })
  llmSaving.value = false
  if (!res.ok) {
    ElMessage.error(res.message)
    return res
  }
  llmForm.apiKey = ''
  ElMessage.success('模型配置已保存')
  return res
}

const clearKey = async () => {
  const res = await saveLlmConfig({ clearKey: true })
  if (!res.ok) return ElMessage.error(res.message)
  llmState.lastTest = null
  ElMessage.success('key 已清除')
}

const doTestLlm = async () => {
  // 有未保存的 key 先落盘再测，否则测的是旧配置
  if (llmForm.apiKey) {
    const saved = await saveLlm()
    if (!saved.ok) return
  }
  const r = await testLlm()
  if (r.ok) ElMessage.success(`通路正常，延迟 ${r.latency}ms`)
  else ElMessage.warning(r.message || '测试失败')
}

/** 问供应商要一次真实模型列表，省得下次模型改名又对不上 */
const pullModels = async () => {
  if (llmForm.apiKey) {
    const saved = await saveLlm()
    if (!saved.ok) return
  }
  const r = await fetchLlmModels()
  if (r.ok) ElMessage.success(`拉到 ${r.count} 个模型`)
  else ElMessage.warning(r.message || '该服务不支持自动拉取，手动填模型名')
}

// ---- 菜单树 ----
const stamp = computed(() => {
  const t = gateState.updatedAt
  if (!t) return ''
  const d = new Date(t)
  if (Number.isNaN(d.getTime())) return ''
  const p = (n) => String(n).padStart(2, '0')
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
})

const plain = (nodes) => nodes.map((n) => ({
  index: n.index,
  label: n.label,
  ...(n.children ? { children: plain(n.children) } : {})
}))

// Web 端：sidebarMenu 是侧边栏的唯一数据源，这里直接复用，
// 顺序、层级、显隐三件事在两边永远是同一份定义
const webTree = computed(() => plain(sidebarMenu))

// 移动端：整块一个根（mobile-root），下面才是 6 个分组，所以能整块关掉
const mobileTree = computed(() => plain([mobileMenuCatalog]))

// 文档中心：文档中心布局自己的左侧章节导航
const docTree = computed(() => plain(docMenu))

const TABS = [
  {
    key: 'web',
    label: 'Web 端',
    tree: webTree,
    hint: '主应用左侧边栏的全部菜单项。入口「文档中心」这一项也在这里 —— 关掉后从侧边栏就进不去文档中心。'
  },
  {
    key: 'mobile',
    label: '移动端',
    tree: mobileTree,
    hint: '移动端首页的格子（手机访问与 /mobile-menu 读同一份）。分组取消勾选则整组不出现；组内格子全隐藏时整组也会收起。'
  },
  {
    key: 'doc',
    label: '文档中心',
    tree: docTree,
    hint: '文档中心内部左侧的章节导航，只影响进去之后能看到哪些章节；入口本身在「Web 端」页签的「文档中心」项。'
  }
]

const activeTab = ref(TABS.some((t) => t.key === route.query.tab) ? route.query.tab : 'web')
const currentTab = computed(() => TABS.find((t) => t.key === activeTab.value) || TABS[0])
const currentTree = computed(() => currentTab.value.tree.value)

// 父子索引：三份树一次注册好，之后任何显隐改动都会自动带上「父分组 / 整块子项」，
// 不会再出现「子项开着、分组却被关掉」这种半截状态
registerMenuTrees(webTree.value, mobileTree.value, docTree.value)

// 收敛老配置里的孤儿状态（别人推来的、或者改这版之前留下的）
watch(
  () => [...gateState.hidden].sort().join(','),
  () => normalizeVisibility(),
  { flush: 'post' }
)

const treeOf = (key) => {
  const t = TABS.find((x) => x.key === key)
  return t ? t.tree.value : []
}

const statsOf = (key) => {
  const all = flatten(treeOf(key))
  return { total: all.length, visible: all.filter((r) => isMenuVisible(r.node.index)).length }
}

// 切换页签：清掉搜索词（否则上个页签的关键词会让新页签空白），并把页签记进地址栏，刷新后停在同一页
watch(activeTab, (v) => {
  keyword.value = ''
  if (route.query.tab !== v) {
    router.replace({ query: { ...route.query, tab: v } })
  }
})

// 展开状态：默认全展开（配置页以扫读为主）
const collapsed = ref(new Set())
const isOpen = (id) => !collapsed.value.has(id)
const toggleOpen = (id) => {
  const next = new Set(collapsed.value)
  next.has(id) ? next.delete(id) : next.add(id)
  collapsed.value = next
}

const flatten = (nodes, depth = 0, out = []) => {
  nodes.forEach((node) => {
    out.push({ node, depth })
    if (node.children) flatten(node.children, depth + 1, out)
  })
  return out
}

const idsOf = (node) => flatten([node]).map((r) => r.node.index)

const visibleOf = (node) => idsOf(node).filter((id) => isMenuVisible(id)).length
const allVisible = (node) => visibleOf(node) === idsOf(node).length
const partial = (node) => {
  const v = visibleOf(node)
  const t = idsOf(node).length
  return v > 0 && v < t
}

const setNode = (node, visible) => setManyVisible(idsOf(node), visible)

// 搜索：命中节点及其祖先都保留
const hit = (node, kw) => {
  if (node.label.includes(kw)) return true
  return (node.children || []).some((c) => hit(c, kw))
}

const rows = computed(() => {
  const kw = keyword.value.trim()
  const source = kw
    ? displayTree.value
        .filter((g) => hit(g, kw) || (g.children || []).some((c) => hit(c, kw)))
        .map((g) => ({
          ...g,
          children: g.children ? g.children.filter((c) => hit(c, kw)) : undefined
        }))
    : displayTree.value
  return source.map((node) => ({ node }))
})

/**
 * 列表视图渲染的树：按配置排序（但不过滤显隐，勾选要能看到全部项）。
 * moveNode 改的是 order，列表必须消费排序结果才会动。
 */
const displayTree = computed(() => sortedNodes(activeTab.value, currentTree.value))

const totalCount = computed(() => flatten(currentTree.value).length)
const visibleCount = computed(() =>
  flatten(currentTree.value).filter((r) => isMenuVisible(r.node.index)).length
)

// ---------- 视图切换：3D / 列表 ----------
const VIEW_MODES = [
  { key: '3d', label: '3D 视图' },
  { key: 'list', label: '列表' }
]

const VIEW_KEY = 'fck.gate-view'
const viewMode = ref('3d')
try {
  const saved = localStorage.getItem(VIEW_KEY)
  if (saved === '3d' || saved === 'list') viewMode.value = saved
} catch (e) {
  /* ignore */
}

const switchView = (mode) => {
  viewMode.value = mode
  try {
    localStorage.setItem(VIEW_KEY, mode)
  } catch (e) {
    /* ignore */
  }
}

/**
 * 3D 只画两层：分组 = 轨道，功能入口 = 卡牌。
 * 「移动端菜单」这种纯包装根（只有它一个，且子节点自己还带子节点）如果不剥掉，
 * 3D 里就只剩几张分组卡，看不到分组下的功能入口 —— 自动下钻一层。
 */
const drillRoot = (nodes) => {
  let list = nodes
  while (
    list.length === 1 &&
    list[0].children && list[0].children.length &&
    list[0].children.some((c) => c.children && c.children.length)
  ) {
    list = list[0].children
  }
  return list
}

/**
 * 3D 用「排序后但不过滤」的树 —— 被隐藏的项也要画出来，只是画成空壳。
 * 搜索时按关键词裁一遍，和列表视图看到的范围保持一致。
 */
const sceneNodes = computed(() => {
  const base = sortedNodes(activeTab.value, drillRoot(currentTree.value))
  const kw = keyword.value.trim()
  if (!kw) return base
  const prune = (list) =>
    (list || [])
      .map((n) => ({ ...n, children: n.children ? prune(n.children) : undefined }))
      .filter((n) => n.label.includes(kw) || (n.children && n.children.length))
  return prune(base)
})

/** 在树里按 id 找节点（3D 只拿到 id，整组切换要连带子项） */
const findNode = (nodes, id) => {
  for (const n of nodes || []) {
    if (n.index === id) return n
    const found = n.children && findNode(n.children, id)
    if (found) return found
  }
  return null
}

const onToggle3D = ({ id, group } = {}) => {
  if (!id) return
  const next = !isMenuVisible(id)
  if (!group) return setManyVisible([id], next)
  // 分组（含三级分组的中间层）与列表勾选同一套语义：整棵子树一起开关
  const node = findNode(currentTree.value, id)
  setManyVisible(node ? idsOf(node) : [id], next)
}

const onMove3D = ({ dragId, targetId, place }) => {
  if (moveNode(activeTab.value, currentTree.value, dragId, targetId, place)) {
    ElMessage.success('顺序已保存')
  }
}

const onWebglMissing = () => {
  switchView('list')
  ElMessage.warning('当前浏览器不支持 WebGL，已切回列表视图')
}

// ---------- 列表拖拽排序 ----------
const drag = reactive({ id: '', kind: '', overId: '', place: '' })

const onDragStart = (event, kind, id) => {
  if (keyword.value) return
  drag.id = id
  drag.kind = kind
  drag.overId = ''
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', id)
}

const onDragOver = (event, kind, id) => {
  if (!drag.id || drag.id === id) return
  // 分组只能和分组互排；菜单项可以落到分组上（放进该组末尾）
  if (drag.kind === 'group' && kind !== 'group') return
  event.preventDefault()
  event.dataTransfer.dropEffect = 'move'
  drag.overId = id

  if (drag.kind === 'item' && kind === 'group') {
    drag.place = 'inside'
    return
  }
  const rect = event.currentTarget.getBoundingClientRect()
  drag.place = event.clientY > rect.top + rect.height / 2 ? 'after' : 'before'
}

const onDragLeave = (id) => {
  if (drag.overId === id) drag.overId = ''
}

const onDrop = (event, kind, id) => {
  event.preventDefault()
  if (!drag.id || drag.id === id) return onDragEnd()
  const ok = moveNode(activeTab.value, currentTree.value, drag.id, id, drag.place || 'before')
  if (ok) ElMessage.success('顺序已保存')
  onDragEnd()
}

const onDragEnd = () => {
  drag.id = ''
  drag.kind = ''
  drag.overId = ''
  drag.place = ''
}

const dropClass = (id) => {
  if (drag.overId !== id || !drag.id) return ''
  return `drop-${drag.place || 'before'}`
}

// ---------- 顺序相关操作 ----------
const hasCustomOrder = computed(() => (gateState.order[activeTab.value] || []).length > 0)

const doUndo = () => {
  if (undo()) ElMessage.success('已撤销上一步')
}

const doResetOrder = () => {
  resetOrder(activeTab.value)
  ElMessage.success('已恢复默认顺序')
}

// 两个「全显示 / 全隐藏」只作用于当前页签，避免配 Web 端时顺手把移动端也清空
const showAll = () => {
  setManyVisible(flatten(currentTree.value).map((r) => r.node.index), true)
  ElMessage.success(`「${currentTab.value.label}」页签已全部显示`)
}

const hideAll = () => {
  const all = flatten(currentTree.value).map((r) => r.node.index)
  setManyVisible(all, false)
  ElMessage.warning(`「${currentTab.value.label}」页签已全部隐藏；在地址栏输入 /gate 可回到本页改回来`)
}

const openShare = () => {
  shareLink.value = buildShareLink()
  shareVisible.value = true
}

const copyLink = async () => {
  const text = shareLink.value
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('链接已复制')
  } catch (e) {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    ElMessage.success('链接已复制')
  }
  shareVisible.value = false
}
</script>

<style scoped>
.gate-page {
  padding: 0;
}

.page-header {
  margin-bottom: 14px;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-main h1 {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
  color: hsl(var(--foreground));
}

.tip {
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.7;
  color: hsl(var(--muted-foreground));
}

.stamp {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

/* 页头右侧的账号级操作（修改密钥 / 退出） */
.header-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 三端页签 */
.gate-tabs {
  margin-top: 6px;
}

.gate-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
}

.gate-tabs :deep(.el-tabs__item) {
  height: 38px;
  font-size: 13.5px;
}

.gate-tabs :deep(.el-tabs__content) {
  display: none;
}

.tab-label {
  font-weight: 500;
}

.tab-count {
  margin-left: 6px;
  font-size: 11.5px;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--muted) / 0.5);
  border-radius: 9px;
  padding: 1px 7px;
  font-variant-numeric: tabular-nums;
}

.tab-hint {
  margin: 8px 0 12px;
  font-size: 12.5px;
  line-height: 1.7;
  color: hsl(var(--muted-foreground));
}

.warn-tip {
  margin-top: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  background: hsl(var(--muted) / 0.45);
  border-left: 3px solid hsl(var(--muted-foreground) / 0.5);
}

/* 登录卡 */
.lock-card {
  max-width: 640px;
  margin-top: 40px;
  padding: 26px 28px;
}

.lock-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.lock-icon {
  font-size: 26px;
  color: hsl(var(--primary));
  margin-top: 2px;
}

.lock-head h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.lock-sub {
  margin: 6px 0 0;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.lock-form {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.lock-error {
  margin: 10px 0 0;
  font-size: 13px;
  color: #d4380d;
}

.lock-hint {
  margin: 10px 0 0;
  font-size: 12.5px;
  line-height: 1.7;
  color: hsl(var(--muted-foreground));
}

.lock-hint code,
.warn-tip code,
.share-tip code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  padding: 1px 6px;
  border-radius: 4px;
  background: hsl(var(--muted) / 0.6);
  color: hsl(var(--foreground));
}

.section-card {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  padding: 14px 18px;
  margin-bottom: 14px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 18px;
}

.count {
  font-size: 12.5px;
  color: hsl(var(--muted-foreground));
}

.count b {
  color: hsl(var(--foreground));
  font-weight: 500;
}

.tb-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  border-radius: 6px;
}

.row:hover {
  background: hsl(var(--muted) / 0.4);
}

.group-row {
  border-bottom: 1px solid hsl(var(--border) / 0.6);
}

.group-block .group-row {
  border-bottom: none;
}

.group-block {
  border-bottom: 1px solid hsl(var(--border) / 0.6);
  padding-bottom: 4px;
  margin-bottom: 4px;
}

.label {
  font-size: 13.5px;
  color: hsl(var(--foreground));
  cursor: default;
}

.group-label {
  font-weight: 500;
  cursor: pointer;
}

.label.sub {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.count-badge {
  margin-left: 4px;
  font-size: 11.5px;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--muted) / 0.5);
  border-radius: 9px;
  padding: 1px 8px;
}

.caret {
  margin-left: auto;
  font-size: 14px;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  transition: transform 0.2s;
}

.caret.open {
  transform: rotate(180deg);
}

.empty {
  padding: 24px 0;
  text-align: center;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

/* 3D / 列表 分段控件 */
.seg {
  display: flex;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  overflow: hidden;
}

.seg-btn {
  appearance: none;
  border: none;
  background: transparent;
  padding: 3px 12px;
  font-size: 12.5px;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
}

.seg-btn + .seg-btn {
  border-left: 1px solid hsl(var(--border));
}

.seg-btn.active {
  background: hsl(var(--primary) / 0.07);
  color: hsl(var(--primary));
  font-weight: 500;
}

/* 3D 画布卡片：高度跟随视口，留出页头与工具条 */
.canvas-card {
  padding: 0;
  overflow: hidden;
  height: calc(100vh - 330px);
  min-height: 420px;
}

/* 拖拽手柄 */
.grip {
  color: hsl(var(--muted-foreground) / 0.5);
  font-size: 14px;
  cursor: grab;
  flex-shrink: 0;
}

.grip:active {
  cursor: grabbing;
}

.drop-before {
  box-shadow: inset 0 2px 0 hsl(var(--primary));
}

.drop-after {
  box-shadow: inset 0 -2px 0 hsl(var(--primary));
}

.drop-inside {
  background: hsl(var(--primary) / 0.06);
  outline: 1px dashed hsl(var(--primary) / 0.45);
  outline-offset: -1px;
}

.drag-tip {
  margin: 0 0 8px;
  font-size: 12.5px;
  color: hsl(var(--muted-foreground));
}

.share-tip {
  margin: 0 0 12px;
  font-size: 13px;
  line-height: 1.7;
  color: hsl(var(--muted-foreground));
}

.key-tip {
  margin: 4px 0 0;
  font-size: 12.5px;
  color: hsl(var(--muted-foreground));
}

/* ===== 模型配置 ===== */
.llm-card {
  margin-top: 20px;
}

.llm-head {
  margin-bottom: 16px;
}

.llm-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.llm-title h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  color: hsl(var(--foreground));
}

.llm-sub {
  margin: 6px 0 0;
  font-size: 12.5px;
  line-height: 1.7;
  color: hsl(var(--muted-foreground));
}

.llm-sub code,
.llm-offline code {
  padding: 1px 5px;
  border-radius: 4px;
  background: hsl(var(--muted));
  font-size: 12px;
}

.llm-form {
  max-width: 720px;
}

.llm-note {
  margin-left: 10px;
  font-size: 12.5px;
  color: hsl(var(--muted-foreground));
}

.llm-offline {
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid hsl(38 92% 50% / 0.35);
  background: hsl(38 92% 50% / 0.08);
  font-size: 12.5px;
  line-height: 1.8;
  color: hsl(28 80% 32%);
}

.llm-result {
  margin-top: 4px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 12.5px;
  line-height: 1.7;
}

.llm-result.ok {
  border: 1px solid hsl(142 71% 45% / 0.35);
  background: hsl(142 71% 45% / 0.08);
  color: hsl(142 71% 26%);
}

.llm-result.bad {
  border: 1px solid hsl(0 72% 51% / 0.35);
  background: hsl(0 72% 51% / 0.07);
  color: hsl(0 72% 38%);
}

.llm-dim {
  color: hsl(var(--muted-foreground));
}
</style>
