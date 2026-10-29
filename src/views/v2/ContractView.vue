<template>
  <div class="cv-page">
    <div class="page-header">
      <div class="header-main">
        <h1>契约全文</h1>
        <span class="sub">事件与子事件对象的字段、路径与不变式 · 只读</span>
      </div>
      <div class="head-right">
        <span class="ver-chip">{{ C.id }} {{ C.version }}</span>
        <span class="count-chip">{{ C.objects.length }} 个对象 · {{ C.enums.wayTypes.length }} 种路径 · {{ C.invariants.length }} 条不变式</span>
      </div>
    </div>

    <div class="gist">
      <span class="gk">核心</span>
      <span class="gt">{{ C.gist }}</span>
    </div>

    <div class="tabs">
      <span
        v-for="t in tabs"
        :key="t.key"
        class="tab"
        :class="{ on: tab === t.key }"
        @click="tab = t.key"
      >{{ t.label }}<em v-if="t.count !== null">{{ t.count }}</em></span>
      <span class="upd">更新 {{ C.updatedAt }}</span>
    </div>

    <!-- ============ 对象 ============ -->
    <template v-if="tab === 'objects'">
      <div v-for="o in C.objects" :key="o.key" class="obj-card">
        <div class="obj-head">
          <div class="oh-left">
            <span class="obj-name">{{ o.name }}</span>
            <span class="obj-key">{{ o.key }}</span>
            <span class="expose" :class="exposeTone(o.exposeToModel)">{{ exposeText(o.exposeToModel) }}</span>
          </div>
          <span class="obj-count">{{ o.fields.length }} 个字段</span>
        </div>
        <div class="obj-purpose">{{ o.purpose }}</div>
        <div v-if="o.catalogRef" class="obj-cat">目录：{{ o.catalogRef }}<span v-if="tab === 'objects'"> —— 实际条目见「系统项目录」</span></div>

        <div v-if="o.variants && o.variants.length" class="variants">
          <div class="v-title">按 type 取不同字段</div>
          <div v-for="v in o.variants" :key="v.when" class="v-row">
            <span class="v-when">{{ v.when }}</span>
            <span class="v-arrow">→</span>
            <span class="v-fields">
              <span v-for="f in v.fields" :key="f" class="fchip">{{ f }}</span>
            </span>
          </div>
        </div>

        <div class="ftable">
          <div class="ft-head">
            <span>字段</span><span>类型</span><span class="c">必填</span><span>说明</span>
          </div>
          <div v-for="f in o.fields" :key="f.key" class="ft-row">
            <span class="fkey">{{ f.key }}</span>
            <span class="ftype">{{ typeText(f) }}</span>
            <span class="c">
              <span v-if="f.required" class="req">必</span>
              <span v-else class="dash">—</span>
            </span>
            <span class="fnote">{{ f.note || '' }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- ============ 枚举 ============ -->
    <template v-if="tab === 'enums'">
      <div v-for="(list, name) in C.enums" :key="name" class="obj-card">
        <div class="obj-head">
          <div class="oh-left">
            <span class="obj-name">{{ enumName(name) }}</span>
            <span class="obj-key">{{ name }}</span>
          </div>
          <span class="obj-count">{{ list.length }} 个取值</span>
        </div>
        <div v-if="isPlain(list)" class="enum-plain">
          <span v-for="x in list" :key="x" class="echip plain">{{ x }}</span>
        </div>
        <div v-else class="enum-rows">
          <div v-for="x in list" :key="x.key" class="enum-row">
            <span class="echip">{{ x.key }}</span>
            <span class="elabel">{{ x.label }}</span>
            <span class="eeffect">{{ x.effect }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- ============ 不变式 + 纪律 ============ -->
    <template v-if="tab === 'rules'">
      <div class="obj-card">
        <div class="obj-head">
          <div class="oh-left">
            <span class="obj-name">不变式</span>
            <span class="obj-key">invariants</span>
            <span class="expose note">同时用于提示词与校验</span>
          </div>
          <span class="obj-count">{{ C.invariants.length }} 条</span>
        </div>
        <div class="rule-list">
          <div v-for="(it, i) in C.invariants" :key="it.key" class="rule-row">
            <span class="rno">{{ String(i + 1).padStart(2, '0') }}</span>
            <div class="rbody">
              <span class="rrule">{{ it.rule }}</span>
              <span class="rkey">{{ it.key }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="obj-card">
        <div class="obj-head">
          <div class="oh-left">
            <span class="obj-name">生成纪律</span>
            <span class="obj-key">discipline</span>
            <span class="expose note">红线，只进提示词</span>
          </div>
          <span class="obj-count">{{ C.discipline.length }} 条</span>
        </div>
        <div class="rule-list">
          <div v-for="(d, i) in C.discipline" :key="i" class="rule-row">
            <span class="rno">{{ String(i + 1).padStart(2, '0') }}</span>
            <div class="rbody"><span class="rrule">{{ d }}</span></div>
          </div>
        </div>
      </div>
      <div class="obj-card">
        <div class="obj-head">
          <div class="oh-left">
            <span class="obj-name">系统项 Agent 纪律</span>
            <span class="obj-key">sysDiscipline</span>
            <span class="expose note">红线，只进系统项提示词</span>
          </div>
          <span class="obj-count">{{ C.sysDiscipline.length }} 条</span>
        </div>
        <div class="rule-list">
          <div v-for="(d, i) in C.sysDiscipline" :key="i" class="rule-row">
            <span class="rno">{{ String(i + 1).padStart(2, '0') }}</span>
            <div class="rbody"><span class="rrule">{{ d }}</span></div>
          </div>
        </div>
      </div>
    </template>
    <template v-if="tab === 'flow'">
      <div class="obj-card">
        <div class="obj-head">
          <div class="oh-left">
            <span class="obj-name">生成流程</span>
            <span class="obj-key">generation</span>
          </div>
          <span class="obj-count">{{ C.generation.steps.length }} 步</span>
        </div>
        <div class="steps">
          <div v-for="(s, i) in C.generation.steps" :key="s.key" class="step">
            <div class="s-head">
              <span class="sno">{{ i + 1 }}</span>
              <span class="sname">{{ s.name }}</span>
              <span class="skey">{{ s.key }}</span>
            </div>
            <div class="s-rule">{{ s.rule }}</div>
            <div v-if="s.sources" class="s-sub">
              <div class="ss-title">缺口来源</div>
              <div v-for="x in s.sources" :key="x.key" class="ss-row">
                <span class="ss-name">{{ x.name }}</span>
                <span class="ss-desc">{{ x.desc }}</span>
              </div>
            </div>
            <div v-if="s.levels" class="s-sub">
              <div class="ss-title">分档</div>
              <div class="ss-inline">
                <span v-for="l in s.levels" :key="l.key" class="lvl">
                  <b>{{ l.name }}</b>{{ l.desc }}
                </span>
              </div>
            </div>
            <div v-if="s.requirement" class="s-req">要求：{{ s.requirement }}</div>
          </div>
        </div>
      </div>

      <div class="obj-card">
        <div class="obj-head">
          <div class="oh-left">
            <span class="obj-name">输出形状</span>
            <span class="obj-key">io</span>
            <span class="expose note">两步各自的 JSON 骨架</span>
          </div>
        </div>
        <div class="io-grid">
          <div class="io-box">
            <div class="io-title">第一步 · ask</div>
            <pre class="io-pre">{{ pretty(C.io.ask) }}</pre>
          </div>
          <div class="io-box">
            <div class="io-title">第二步 · compose</div>
            <pre class="io-pre">{{ pretty(C.io.compose) }}</pre>
          </div>
        </div>
      </div>

      <div class="obj-card">
        <div class="obj-head">
          <div class="oh-left">
            <span class="obj-name">角色枚举</span>
            <span class="obj-key">roles</span>
            <span class="expose note">把「谁办」落成人</span>
          </div>
          <span class="obj-count">{{ C.roles.length }} 个</span>
        </div>
        <div class="role-chips">
          <span v-for="r in C.roles" :key="r" class="echip">{{ r }}</span>
        </div>
      </div>
    </template>

    <!-- ============ 系统项目录 ============ -->
    <template v-if="tab === 'catalog'">
      <div class="cat-note">
        生成时只做两件事：<b>选 key</b>、<b>配频率</b>（批次上限同理）。条件、阈值、批次都归检查方，流程侧与生成侧都不改；
        目录里没有的，只能回到这里登记，不许自造。
      </div>

      <div class="obj-card">
        <div class="obj-head">
          <div class="oh-left">
            <span class="obj-name">判定项</span>
            <span class="obj-key">check · 只出结论，不改数据</span>
            <span class="expose note">被 way.type = system 引用</span>
          </div>
          <span class="obj-count">{{ systemChecks.length }} 项</span>
        </div>
        <div class="ctable">
          <div class="c-head chk">
            <span>名称</span><span>来源</span><span>通过条件（全部命中即通过）</span><span>软性区间</span><span>生效镜像</span>
          </div>
          <div v-for="c in systemChecks" :key="c.key" class="c-row chk">
            <span class="c-name">
              <b>{{ c.name }}</b>
              <em>{{ c.key }}</em>
            </span>
            <span class="src-chip">{{ c.source }}</span>
            <span class="def-chips">
              <template v-for="(x, i) in c.pass.items" :key="i">
                <span v-if="i" class="logic">{{ c.pass.logic === 'or' ? '或' : '且' }}</span>
                <span class="cond pass">{{ x }}</span>
              </template>
            </span>
            <span class="def-chips">
              <template v-if="c.soft">
                <template v-for="(x, i) in c.soft.items" :key="i">
                  <span v-if="i" class="logic">{{ c.soft.logic === 'or' ? '或' : '且' }}</span>
                  <span class="cond soft">{{ x }}</span>
                </template>
              </template>
              <span v-else class="none">无（不支持软性）</span>
            </span>
            <span class="mir">
              <b>{{ c.mirror.version }}</b>
              <em>{{ c.mirror.configuredBy }} · {{ c.mirror.condAt }}</em>
            </span>
          </div>
        </div>
        <div class="cat-foot">取数频率与批次上限在用到它的子事件上配，默认 1d / 最多消费 5 个未通过批次；本目录不存这两个值。</div>
      </div>

      <div class="obj-card">
        <div class="obj-head">
          <div class="oh-left">
            <span class="obj-name">执行项</span>
            <span class="obj-key">action · 改数据或发出东西，拿回执</span>
            <span class="expose note">被 way.type = action 引用</span>
          </div>
          <span class="obj-count">{{ actions.length }} 项</span>
        </div>
        <div class="ctable">
          <div class="c-head act">
            <span>名称</span><span>执行方</span><span>类型</span><span>执行单位</span><span>入参</span><span>回执</span><span>失败兜底</span>
          </div>
          <div v-for="a in actions" :key="a.key" class="c-row act">
            <span class="c-name">
              <b>{{ a.name }}</b>
              <em>{{ a.key }}</em>
            </span>
            <span class="src-chip">{{ a.source }}</span>
            <span class="mode-chip" :class="a.mode">{{ modeLabel(a.mode) }}</span>
            <span class="c-target">
              <b>{{ a.target }}</b>
              <em>{{ a.targetFrom }}</em>
            </span>
            <span class="arg-list">{{ (a.args || []).map((x) => x.label).join('、') }}</span>
            <span class="arg-list">{{ (a.receipt || []).map((x) => x.label).join('、') }}</span>
            <span class="c-fallback">{{ a.fallback }}</span>
          </div>
        </div>
        <div class="cat-foot">逐目标执行、逐目标回执；部分成功按软性处理，剩余转人工，不整单回滚。</div>
      </div>
    </template>

    <!-- ============ 渲染后的提示词 ============ -->
    <template v-if="tab === 'prompt'">
      <div class="obj-card">
        <div class="obj-head">
          <div class="oh-left">
            <span class="obj-name">系统提示词</span>
            <span class="obj-key">renderSystemPrompt()</span>
            <span class="expose note">由上面各部分渲染而来，不手写</span>
          </div>
          <div class="head-right">
            <span class="obj-count">{{ prompt.length }} 字符</span>
            <el-button size="small" :icon="CopyDocument" @click="copyPrompt">复制</el-button>
          </div>
        </div>
        <pre class="prompt-pre">{{ prompt }}</pre>
      </div>

      <div class="obj-card">
        <div class="obj-head">
          <div class="oh-left">
            <span class="obj-name">系统项 Agent 提示词</span>
            <span class="obj-key">renderSystemItemPrompt()</span>
            <span class="expose note">同一个契约的另一面，只暴露 sys / action 两段</span>
          </div>
          <div class="head-right">
            <span class="obj-count">{{ sysPrompt.length }} 字符</span>
            <el-button size="small" :icon="CopyDocument" @click="copySysPrompt">复制</el-button>
          </div>
        </div>
        <pre class="prompt-pre">{{ sysPrompt }}</pre>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { CONTRACT, renderSystemPrompt, renderSystemItemPrompt, enumOf } from '../../v2/contract.js'
import { systemChecks, actions } from '../../v2/catalog.js'

const C = CONTRACT
const route = useRoute()

/** 两个菜单入口共用一个视图：/v2/contract 停在「对象」，/v2/catalog 直接停在「系统项目录」 */
const tab = ref(route.name === 'v2-catalog' ? 'catalog' : 'objects')
watch(
  () => route.name,
  (n) => {
    if (n === 'v2-catalog') tab.value = 'catalog'
    else if (n === 'v2-contract') tab.value = 'objects'
  }
)

const tabs = [
  { key: 'objects', label: '对象', count: C.objects.length },
  { key: 'enums', label: '枚举', count: Object.keys(C.enums).length },
  { key: 'rules', label: '不变式与纪律', count: C.invariants.length + C.discipline.length + C.sysDiscipline.length },
  { key: 'catalog', label: '系统项目录', count: systemChecks.length + actions.length },
  { key: 'flow', label: '生成流程与输出', count: C.generation.steps.length },
  { key: 'prompt', label: '系统提示词', count: null }
]

const MODE_LABEL = { execute: '改数据', notify: '发通知', deliver: '交文件' }
const modeLabel = (m) => MODE_LABEL[m] || m

const prompt = computed(() => renderSystemPrompt(C))
const pretty = (o) => JSON.stringify(o, null, 2)
const isPlain = (list) => list.every((x) => typeof x === 'string')

const ENUM_NAMES = {
  verdicts: '结论值',
  gates: '门禁',
  wayTypes: '兑现路径类型',
  fieldTypes: '字段类型',
  triggerTypes: '触发源类型',
  itemProof: '证据要求'
}
const enumName = (k) => ENUM_NAMES[k] || k

const exposeText = (v) => (v === true ? '模型可生成' : v === 'reference' ? '只读引用' : '不进提示词')
const exposeTone = (v) => (v === true ? 'gen' : v === 'reference' ? 'ref' : 'off')

function typeText (f) {
  if (f.type === 'enum' && typeof f.values === 'string') {
    const list = enumOf(f.values)
    return `enum · ${f.values}（${list.length}）`
  }
  if (f.type === 'enum' && Array.isArray(f.values)) return `enum · ${f.values.join(' / ')}`
  if (f.ref) return `${f.type} · ${f.ref}`
  return f.type
}

async function copyPrompt () {
  try {
    await navigator.clipboard.writeText(prompt.value)
    ElMessage.success('已复制')
  } catch (e) {
    ElMessage.warning('浏览器不允许复制，请手动选中')
  }
}

const sysPrompt = computed(() => renderSystemItemPrompt(C))

async function copySysPrompt () {
  try {
    await navigator.clipboard.writeText(sysPrompt.value)
    ElMessage.success('已复制')
  } catch (e) {
    ElMessage.warning('浏览器不允许复制，请手动选中')
  }
}
</script>

<style scoped>
.cv-page { padding: 18px 22px 34px; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 12px; }
.header-main h1 { margin: 0 0 4px; font-size: 20px; }
.header-main .sub { font-size: 12.5px; color: #8a8f99; }
.head-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.ver-chip { font-size: 12px; color: #534ab7; background: #eeedfe; border-radius: 9px; padding: 3px 10px; font-family: ui-monospace, monospace; }
.count-chip { font-size: 12px; color: #5f6368; background: #f1f2f5; border-radius: 9px; padding: 3px 10px; }

.gist { display: flex; gap: 10px; align-items: flex-start; background: #f7f8fa; border: 1px solid #ececf0; border-radius: 10px; padding: 10px 14px; margin-bottom: 12px; }
.gk { flex-shrink: 0; font-size: 12px; font-weight: 600; color: #534ab7; background: #eeedfe; border-radius: 8px; padding: 2px 8px; }
.gt { font-size: 12.5px; color: #5f6368; line-height: 1.7; }

.tabs { display: flex; align-items: center; gap: 6px; margin-bottom: 14px; flex-wrap: wrap; }
.tab { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; color: #5f6368; background: #fff; border: 1px solid #ececf0; border-radius: 9px; padding: 5px 12px; cursor: pointer; }
.tab em { font-style: normal; font-size: 11px; color: #a3a0a1; }
.tab.on { color: #534ab7; border-color: #c9c5f5; background: #f7f6ff; }
.tab.on em { color: #7c74d6; }
.upd { margin-left: auto; font-size: 11.5px; color: #b0aebe; }

.obj-card { background: #fff; border: 1px solid #ececf0; border-radius: 12px; padding: 14px 16px; margin-bottom: 12px; }
.obj-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.oh-left { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
.obj-name { font-size: 14px; font-weight: 600; color: #2b2b33; }
.obj-key { font-size: 11.5px; color: #a3a0a1; font-family: ui-monospace, monospace; }
.expose { font-size: 11px; border-radius: 7px; padding: 1px 7px; }
.expose.gen { color: #0f6e56; background: #e8f5f0; }
.expose.ref { color: #9a6b00; background: #fdf6e7; }
.expose.off { color: #8a8f99; background: #f1f2f5; }
.expose.note { color: #7c74d6; background: #f4f2ff; }
.obj-count { font-size: 11.5px; color: #a3a0a1; flex-shrink: 0; }
.obj-purpose { font-size: 12.5px; color: #5f6368; line-height: 1.75; margin: 6px 0 10px; }
.obj-cat { font-size: 11px; color: #7c74d6; background: #f7f6ff; border-radius: 7px; padding: 3px 9px; margin: -4px 0 10px; display: inline-block; font-family: ui-monospace, monospace; }

.variants { background: #fafafb; border-radius: 9px; padding: 9px 11px; margin-bottom: 10px; }
.v-title { font-size: 11px; color: #8a8f99; margin-bottom: 5px; }
.v-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; padding: 2px 0; }
.v-when { font-size: 11.5px; font-family: ui-monospace, monospace; color: #534ab7; }
.v-arrow { font-size: 11px; color: #c0bece; }
.fchip { font-size: 11px; color: #5f6368; background: #f1f2f5; border-radius: 6px; padding: 1px 6px; margin-right: 3px; }

.ftable { display: flex; flex-direction: column; }
.ft-head, .ft-row { display: grid; grid-template-columns: 132px 168px 40px 1fr; gap: 8px; align-items: start; padding: 6px 0; }
.ft-head span { font-size: 10.5px; color: #b0aebe; }
.ft-head .c, .ft-row .c { text-align: center; }
.ft-row { border-top: 1px solid #f4f4f7; }
.fkey { font-size: 12px; color: #2b2b33; font-family: ui-monospace, monospace; }
.ftype { font-size: 11.5px; color: #534ab7; }
.req { font-size: 10.5px; color: #b23b3b; background: #fdeeee; border-radius: 6px; padding: 0 5px; }
.dash { font-size: 11px; color: #d6d4dc; }
.fnote { font-size: 11.5px; color: #6a6a75; line-height: 1.65; }

.enum-rows { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
.enum-plain { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.enum-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 4px 0; border-top: 1px solid #f4f4f7; }
.echip { font-size: 11.5px; color: #534ab7; background: #eeedfe; border-radius: 7px; padding: 1px 8px; font-family: ui-monospace, monospace; }
.echip.plain { background: #f1f2f5; color: #5f6368; }
.elabel { font-size: 12px; color: #2b2b33; }
.eeffect { font-size: 11.5px; color: #8a8f99; }

.rule-list { display: flex; flex-direction: column; margin-top: 8px; }
.rule-row { display: flex; gap: 10px; padding: 7px 0; border-top: 1px solid #f4f4f7; }
.rno { font-size: 11px; color: #b0aebe; font-family: ui-monospace, monospace; flex-shrink: 0; padding-top: 1px; }
.rbody { display: flex; flex-direction: column; gap: 2px; }
.rrule { font-size: 12.5px; color: #333; line-height: 1.7; }
.rkey { font-size: 10.5px; color: #c0bece; font-family: ui-monospace, monospace; }

.steps { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }
.step { border: 1px solid #ececf0; border-radius: 10px; padding: 11px 13px; }
.s-head { display: flex; align-items: center; gap: 8px; }
.sno { width: 18px; height: 18px; border-radius: 50%; background: #eeedfe; color: #534ab7; font-size: 11px; display: flex; align-items: center; justify-content: center; }
.sname { font-size: 13px; font-weight: 600; color: #2b2b33; }
.skey { font-size: 11px; color: #a3a0a1; font-family: ui-monospace, monospace; }
.s-rule { font-size: 12.5px; color: #5f6368; margin-top: 6px; }
.s-sub { margin-top: 8px; }
.ss-title { font-size: 11px; color: #8a8f99; margin-bottom: 4px; }
.ss-row { display: flex; gap: 8px; padding: 2px 0; }
.ss-name { font-size: 11.5px; color: #534ab7; width: 64px; flex-shrink: 0; }
.ss-desc { font-size: 11.5px; color: #6a6a75; }
.ss-inline { display: flex; gap: 8px; flex-wrap: wrap; }
.lvl { font-size: 11.5px; color: #6a6a75; background: #f7f8fa; border-radius: 7px; padding: 2px 8px; }
.lvl b { color: #2b2b33; margin-right: 4px; font-weight: 600; }
.s-req { font-size: 11.5px; color: #7c74d6; background: #f7f6ff; border-radius: 8px; padding: 5px 9px; margin-top: 8px; }

.io-grid { display: grid; grid-template-columns: 1fr 1.4fr; gap: 10px; margin-top: 8px; }
@media (max-width: 1200px) { .io-grid { grid-template-columns: 1fr; } }
.io-box { border: 1px solid #ececf0; border-radius: 10px; overflow: hidden; }
.io-title { font-size: 11.5px; color: #534ab7; background: #f7f6ff; padding: 6px 10px; }
.io-pre { margin: 0; padding: 10px 12px; font-size: 11px; line-height: 1.65; color: #4a4a55; font-family: ui-monospace, monospace; background: #fcfcfd; max-height: 460px; overflow: auto; white-space: pre-wrap; word-break: break-word; }
.role-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }

.cat-note { font-size: 12.5px; color: #5f6368; line-height: 1.8; background: #f7f6ff; border: 1px solid #e7e3fb; border-radius: 10px; padding: 10px 14px; margin-bottom: 12px; }
.cat-note b { color: #534ab7; }
.ctable { display: flex; flex-direction: column; margin-top: 8px; }
.c-head, .c-row { display: grid; gap: 10px; align-items: start; padding: 7px 0; }
.c-head.chk, .c-row.chk { grid-template-columns: 190px 96px 1.4fr 1.2fr 130px; }
.c-head.act, .c-row.act { grid-template-columns: 176px 104px 72px 1.1fr 1fr 1fr 1.2fr; }
.c-head span { font-size: 10.5px; color: #b0aebe; }
.c-row { border-top: 1px solid #f4f4f7; }
.c-name { display: flex; flex-direction: column; gap: 1px; }
.c-name b { font-size: 12.5px; color: #2b2b33; font-weight: 600; }
.c-name em { font-size: 10.5px; color: #b0aebe; font-style: normal; font-family: ui-monospace, monospace; }
.def-chips { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 4px; }
.cond { font-size: 11px; border-radius: 7px; padding: 1px 6px; line-height: 1.65; }
.cond.pass { color: #0f6e56; background: #e8f5f0; }
.cond.soft { color: #9a6b00; background: #fdf6e7; }
.logic { font-size: 10px; font-weight: 600; color: #534ab7; background: #eeedfe; border-radius: 5px; padding: 0 4px; }
.none { font-size: 11px; color: #b9b7bd; }
.mir { display: flex; flex-direction: column; }
.mir b { font-size: 11.5px; color: #333; }
.mir em { font-size: 10.5px; color: #a3a0a1; font-style: normal; }
.mode-chip { font-size: 11px; border-radius: 7px; padding: 1px 7px; text-align: center; }
.mode-chip.execute { color: #1c5fb0; background: #e9f1fb; }
.mode-chip.notify { color: #7a5aa8; background: #f2ecfb; }
.mode-chip.deliver { color: #0f6e56; background: #e8f5f0; }
.c-target { display: flex; flex-direction: column; }
.c-target b { font-size: 11.5px; color: #333; font-weight: 500; }
.c-target em { font-size: 10.5px; color: #a3a0a1; font-style: normal; line-height: 1.5; }
.arg-list { font-size: 11px; color: #6a6a75; line-height: 1.6; }
.c-fallback { font-size: 11px; color: #8a8f99; line-height: 1.6; }
.cat-foot { font-size: 11px; color: #b0aebe; margin-top: 10px; padding-top: 8px; border-top: 1px dashed #f0f0f4; }

.prompt-pre { margin: 10px 0 0; padding: 12px 14px; background: #fcfcfd; border: 1px solid #f0f0f4; border-radius: 10px; font-size: 11.5px; line-height: 1.8; color: #44444e; font-family: ui-monospace, monospace; white-space: pre-wrap; word-break: break-word; max-height: 68vh; overflow: auto; }
</style>
