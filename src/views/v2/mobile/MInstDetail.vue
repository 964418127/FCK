<!--
  移动端 · 一件事的办理页
  上半是「现在轮到谁、这一环要交什么」，下半是「这一单走到哪、每一步的结果」。
  系统判定与执行不给人按钮：它们是核查与回执，只展示取了几次、消费了几个批次、逐目标回执。
-->
<template>
  <div class="m-page">
    <div class="page-header">
      <el-icon class="back-icon" @click="back"><ArrowLeft /></el-icon>
      <h1>{{ ev?.name || '事项' }}</h1>
      <!-- 原型辅助：正式开发就是登录账号，不需要切换；这里只用于演示不同处理人的视角 -->
      <span class="persona-hint" title="原型演示：切换处理人视角（正式开发为登录账号，无需切换）" @click="cyclePersona">{{ me?.name || '—' }}</span>
      <span :class="['hd-chip', inst?.state]">{{ instStateLabel(inst?.state) }}</span>
    </div>

    <div v-if="!inst" class="empty-text">没有找到这笔事项</div>

    <div v-else class="content">
      <!-- 摘要 -->
      <div class="card">
        <div class="sum-row"><span class="k">单号</span><span class="v mono">{{ inst.code }}</span></div>
        <div class="sum-row"><span class="k">员工</span><span class="v">{{ inst.emp.name }} · {{ inst.emp.job }} · {{ inst.emp.store }} · {{ inst.emp.employType }}</span></div>
        <div class="sum-row"><span class="k">触点</span><span class="v">{{ triggerLine }}</span></div>
        <div class="sum-row"><span class="k">发起</span><span class="v">{{ inst.startedAt }} · 第 {{ inst.version }} 版</span></div>
        <div class="sum-row" v-if="inst.emp.expectDate"><span class="k">期望离职</span><span class="v">{{ inst.emp.expectDate }}</span></div>
        <div class="prog-line">
          <div class="bar"><i :style="{ width: prog.pct + '%' }"></i></div>
          <span class="pg">已办结 {{ prog.done }} / {{ prog.total }}</span>
        </div>
      </div>

      <!-- 这一单的账（约数）：审核人定款项出口时要看的就是这几个数，发起时不给员工看 -->
      <div v-if="assetRows.length" class="card">
        <div class="sec-head">
          <span class="sec-title">这一单的账</span>
          <span class="tag-ro">约数 · 按工号取</span>
        </div>
        <div v-for="r in assetRows" :key="r.k" class="sum-row">
          <span class="k">{{ r.k }}</span>
          <span :class="['v', { lk: r.link }]">{{ r.v }}</span>
        </div>
        <div class="asset-note">账户与薪酬台账按工号取；常乐豆以次月 5 日冻结后的余额为准，这里只是约数。</div>
      </div>

      <!-- 待我办 -->
      <div v-for="s in todo" :key="s.id" class="card todo-card">
        <div class="td-head">
          <span class="td-tag">轮到你了</span>
          <span class="td-goal">{{ s.goal }}</span>
        </div>
        <div class="td-meta">
          {{ ownerOfSub(s, inst).roleName }} · {{ ownerOfSub(s, inst).name }}
          <em v-if="s.gate === 'must'">必过</em>
        </div>

        <div v-for="g in formOf(s)" :key="g.itemId" class="item">
          <div class="it-h">
            <b>{{ g.itemTitle }}</b>
            <span v-if="g.require">{{ g.require }}</span>
          </div>
          <div v-for="f in g.fields" :key="f.key" class="field">
            <label>
              {{ f.label }}<i v-if="f.required">*</i>
              <em v-if="f.prefill && fromPayload(f)" class="pre">已按申请单填好，可改</em>
              <em v-else-if="f.prefill" class="pre">已按默认值填好，可改</em>
              <em v-else-if="fromPayload(f) && f.required" class="pre miss">申请单没填，这里补</em>
            </label>
            <el-input
              v-if="f.type === 'text'"
              v-model="draftOf(s).vals[f.key]" placeholder="填写" clearable
            />
            <el-input
              v-else-if="f.type === 'textarea'"
              v-model="draftOf(s).vals[f.key]" type="textarea" :rows="3" placeholder="填写"
            />
            <el-input-number
              v-else-if="f.type === 'number'"
              v-model="draftOf(s).vals[f.key]" :controls="false" style="width: 100%"
            />
            <el-date-picker
              v-else-if="f.type === 'date'"
              v-model="draftOf(s).vals[f.key]" type="date" value-format="YYYY-MM-DD" style="width: 100%"
            />
            <el-select v-else-if="f.type === 'select'" v-model="draftOf(s).vals[f.key]" placeholder="请选择" style="width: 100%">
              <el-option v-for="o in optionsOf(f)" :key="o" :label="o" :value="o" />
            </el-select>
            <el-select v-else-if="f.type === 'multiselect'" v-model="draftOf(s).vals[f.key]" multiple collapse-tags placeholder="可多选" style="width: 100%">
              <el-option v-for="o in optionsOf(f)" :key="o" :label="o" :value="o" />
            </el-select>
            <el-input v-else-if="f.type === 'person'" v-model="draftOf(s).vals[f.key]" placeholder="选人" />
            <div v-else class="file-box" @click="draftOf(s).files[g.itemId] = (draftOf(s).files[g.itemId] || 0) + 1">
              <span v-if="draftOf(s).files[g.itemId]">已选 {{ draftOf(s).files[g.itemId] }} 个附件 · 再加</span>
              <span v-else>＋ 添加附件</span>
              <em v-if="f.formats">{{ f.formats }}</em>
            </div>
          </div>
        </div>

        <div class="field note">
          <label>办理说明</label>
          <el-input v-model="draftOf(s).note" type="textarea" :rows="2" placeholder="可不填；不通过请写清原因" />
        </div>

        <div class="acts">
          <button class="ghost" @click="submit(s, '未通过')">不通过</button>
          <button class="solid" @click="submit(s, '通过')">通过并办结</button>
        </div>
        <div class="td-foot">经办人 {{ ownerOfSub(s, inst).name }} · 提交后按前置推进下一环</div>
      </div>

      <!-- 在别人手上：只有负责人能看见能办，别人只读 -->
      <div v-if="others.length" class="card other-card">
        <div class="wc-h">这一环在别人手上</div>
        <div v-for="s in others" :key="s.id" class="wc-row">
          <div class="wc-g">{{ s.goal }}</div>
          <div class="wc-s">{{ ownerOfSub(s, inst).label }} · {{ ownerOfSub(s, inst).name }} 负责</div>
        </div>
        <div v-if="!todo.length" class="oc-note">{{ firstOtherName }} 负责办理，办结后自动推进下一环</div>
      </div>

      <!-- 等机器 / 等对方 -->
      <div v-if="wait.length" class="card wait-card">
        <div class="wc-h">在等系统 / 对方</div>
        <div v-for="s in wait" :key="s.id" class="wc-row">
          <div class="wc-g">{{ s.goal }}</div>
          <div class="wc-s">{{ waitText(s) }}</div>
          <div v-if="subOf(s.id).result" class="wc-r">{{ subOf(s.id).result }}</div>
          <div v-if="subOf(s.id).polls" class="wc-ck">
            已取 {{ subOf(s.id).polls }} 次
            <template v-if="subOf(s.id).failBatches"> · 消费 {{ subOf(s.id).failBatches }} 个未通过批次</template>
            <template v-if="subOf(s.id).nextAt"> · 下次 {{ subOf(s.id).nextAt }}</template>
          </div>
          <div v-if="(subOf(s.id).exec || []).length" class="wc-ex">
            <span v-for="(e, ei) in subOf(s.id).exec" :key="ei">{{ e.target }} · {{ e.result }}</span>
          </div>
          <div v-if="(subOf(s.id).used || []).length" class="wc-us">
            <span v-for="(u, ui) in subOf(s.id).used" :key="'u' + ui">按 {{ u.label }}：{{ u.value }}</span>
          </div>
          <!-- 系统项不给人「通过」，只给「再取一次」：结论由系统给，人不能代判 -->
          <div class="wc-act">
            <button class="mini" @click="runSys(s)">{{ runLabel(s) }}</button>
          </div>
        </div>
      </div>

      <div v-if="!todo.length && !wait.length && inst.state === 'done'" class="card done-card">
        这一单已办结 · {{ inst.finishedAt || '' }}
      </div>
      <div v-if="inst.state === 'terminated'" class="card danger-card">
        必过的一环未通过，流程已终止；其余节点随流程关闭。
      </div>

      <!-- 时间线 -->
      <div class="card">
        <div class="tl-h">过程与结果 <em>{{ timeline.length }} 步</em></div>
        <div v-for="(t, i) in timeline" :key="t.id" class="tl-row" :class="t.state">
          <div class="tl-rail">
            <span class="tl-idx">{{ i + 1 }}</span>
            <i v-if="i < timeline.length - 1" class="tl-line"></i>
          </div>
          <div class="tl-body">
            <div class="tl-top">
              <span class="tl-goal">{{ t.goal }}</span>
              <span :class="['tl-st', t.state]">{{ t.stateText }}</span>
            </div>
            <div v-if="t.by || t.at" class="tl-by">{{ t.by }}{{ t.at ? ' · ' + t.at : '' }}{{ t.verdict ? ' · ' + t.verdict : '' }}</div>
            <div v-if="t.result" class="tl-result">{{ t.result }}</div>
            <div v-if="(t.used || []).length" class="tl-used">
              按 {{ t.used.map((u) => u.label + '：' + u.value).join('、') }} 执行
            </div>
            <div v-if="t.state === 'checking' || t.polls" class="tl-ck">
              已取 {{ t.polls || 0 }} 次 · 消费 {{ t.failBatches || 0 }} 个未通过批次
              <template v-if="t.nextAt"> · 下次 {{ t.nextAt }}</template>
            </div>
            <div v-for="(rec, iid) in t.records" :key="iid" class="tl-rec">
              <span v-for="(v, k) in rec.values || {}" :key="k" class="rv">{{ fieldLabel(t.id, iid, k) }}：{{ valueText(v) }}</span>
              <span v-if="rec.files" class="rf">{{ rec.files }} 个附件</span>
              <span v-if="rec.note" class="rn">{{ rec.note }}</span>
            </div>
            <div v-for="(e, ei) in t.exec || []" :key="'e' + ei" class="tl-exec">
              <span>{{ e.target }}</span>
              <span :class="['ex-r', e.result === '成功' ? 'ok' : 'bad']">{{ e.result }}</span>
            </div>
            <div v-if="t.note && !Object.keys(t.records || {}).length" class="tl-note">{{ t.note }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getInstance, getEvent, resolveForInstance, submitInstanceSub, runSystemSub, checks, v2state, setMe } from '../../../v2/store.js'
import { staffById, ledgerOf } from '../../../v2/base.js'
import { triggerLabel, receiptTextOf, valueText } from '../../../v2/model.js'
import { actionName } from '../../../v2/seed.js'
import {
  waitingOf, openSubs, needsHuman, canHandle, formOf, ownerOfSub, myTodoOf, identitiesOf,
  progressOf, timelineOf, instStateLabel
} from '../../../v2/instance.js'

const route = useRoute()
const router = useRouter()

const inst = computed(() => (route.query.id ? getInstance(String(route.query.id)) : null))
const ev = computed(() => (inst.value ? getEvent(inst.value.eventKey) : null))
const tree = computed(() => (inst.value ? resolveForInstance(inst.value).tree : []))
const prog = computed(() => progressOf(inst.value, tree.value))
const me = computed(() => v2state.me)
/** 可切换的处理人视角：在这一单里手上有活的排前面，只读的排后面 */
const pool = computed(() => {
  const base = identitiesOf(v2state.instances, (i) => resolveForInstance(i).tree)
  return [...base]
    .map((p) => ({ p, n: myTodoOf(inst.value, tree.value, p).length }))
    .sort((a, b) => b.n - a.n)
    .map((x) => x.p)
})
/** 原型辅助：点页角的名字依次换处理人视角（正式开发为登录账号） */
const cyclePersona = () => {
  if (!pool.value.length) return
  const i = pool.value.findIndex((p) => p.name === me.value?.name)
  setMe(pool.value[(i + 1) % pool.value.length] || null)
}
const todo = computed(() => myTodoOf(inst.value, tree.value, me.value))
/* 直接打开详情时也要有身份：给「这单里真有活」的那个，否则看不到轮到谁 */
onMounted(() => {
  if (me.value) return
  const cand = pool.value.find((p) => myTodoOf(inst.value, tree.value, p).length) || pool.value[0]
  setMe(cand || null)
})
/** 提示里直接点名，别让人自己去找谁 */
const firstOtherName = computed(() => {
  const s = others.value[0]
  return s ? ownerOfSub(s, inst.value).name : '对应的人'
})
const others = computed(() => openSubs(inst.value, tree.value)
  .filter((s) => needsHuman(s) && !canHandle(s, inst.value, me.value)))

const wait = computed(() => waitingOf(inst.value, tree.value))
const timeline = computed(() => timelineOf(inst.value, tree.value))

/** 触点按发起时那一版看，不跟最新定义走 */
const evTrigger = computed(() => {
  const snap = (ev.value?.versions || []).find((v) => v.v === inst.value?.version)
  return snap?.trigger || ev.value?.trigger || {}
})
/** 触点只留「什么类型 + 从哪进」：事件点名和入口名往往重复，写两遍没人看 */
const triggerLine = computed(() => {
  const t = evTrigger.value
  return [triggerLabel(t), t.entry].filter(Boolean).join(' · ')
})

const subOf = (id) => inst.value?.subs?.[id] || { state: 'pending', records: {} }

/**
 * 这一单的账（约数）：按工号从账户 / 薪酬台账取。
 * 取不到这个人就不显示 —— 不编数，也不在发起页给员工看。
 */
const assetRows = computed(() => {
  const emp = inst.value?.emp || {}
  const rec = staffById(emp.empNo || emp.id)
  if (!rec) return []
  const l = ledgerOf(rec)
  const rows = []
  if (l.bean) rows.push({ k: '常乐豆可用余额', v: `${Number(l.bean.balance || 0).toLocaleString()} 颗` })
  if (l.bean?.pending) rows.push({ k: '常乐豆结算中', v: `${Number(l.bean.pending).toLocaleString()} 颗` })
  if (l.comp?.amount) rows.push({ k: '补偿金预估', v: `¥${Number(l.comp.amount).toLocaleString()}` })
  if (l.comp?.agreementUrl) rows.push({ k: '补偿协议', v: '查看协议', link: l.comp.agreementUrl })
  return rows
})

/* ---------------- 表单草稿：按节点各存一份，互不干扰 ---------------- */
const drafts = reactive({})
function draftOf (sub) {
  if (!drafts[sub.id]) {
    // 预填：单据带过来的值（from: payload.xxx）先填进格子，人核对或改 —— 不让他重填一遍
    const vals = {}
    formOf(sub).forEach((g) => {
      ;(g.fields || []).forEach((f) => {
        if (f.type === 'file') return
        /* 多选的值必须是数组：单据带过来的可能是一句「工资太低、离家太远」，
           直接塞给 multiple 的 select 会渲染成空 —— 这里归一成数组 */
        if (f.type === 'multiselect') {
          const v = f.prefill
          vals[f.key] = Array.isArray(v)
            ? [...v]
            : (v ? String(v).split(/[、,，/]/).map((x) => x.trim()).filter(Boolean) : [])
          return
        }
        if (f.prefill !== undefined && f.prefill !== '') vals[f.key] = f.prefill
      })
    })
    drafts[sub.id] = { vals, files: {}, note: '' }
  }
  return drafts[sub.id]
}
/** 这一格本该由申请单带过来（声明了 from: payload.xxx）；带不过来时要说清楚 */
const fromPayload = (f) => String(f.from || '').startsWith('payload.')
const optionsOf = (f) => String(f.rule || '').split(/[/、,，]/).map((s) => s.trim()).filter(Boolean)

function fieldLabel (subId, itemId, key) {
  const s = tree.value.find((x) => x.id === subId)
  const human = (s?.ways || []).find((w) => w.type === 'human')
  const item = (human?.items || []).find((it) => it.id === itemId)
  const f = (item?.fields || []).find((x) => x.key === key)
  return f?.label || key
}

function waitText (s) {
  const w = (s.ways || [])[0] || {}
  if (w.type === 'system') {
    const c = checks.find((x) => x.key === w.sysKey)
    return `${c?.name || '系统判定'} · ${freqText(w.fetch)}去取一次结论`
  }
  if (w.type === 'action') return `${actionName(w.actionKey)} · ${w.targets || '整单执行一次'}`
  return `等「${receiptTextOf(w) || '回执'}」· 超时 ${w.timeout || '—'} 后转人工`
}
const freqText = (f) => (!f ? '未配' : f.fetchFreq === 'none' ? '只取一次' : `每 ${String(f.fetchFreq).replace('h', ' 小时').replace('d', ' 天')}`)

/* ---------------- 提交 ---------------- */
function submit (sub, verdict) {
  const d = draftOf(sub)
  // 必填校验：文件按「这个事项选了几个」算
  for (const g of formOf(sub)) {
    for (const f of g.fields || []) {
      if (!f.required) continue
      const filled = f.type === 'file'
        ? (d.files[g.itemId] || 0) > 0
        : f.type === 'multiselect'
          ? (Array.isArray(d.vals[f.key]) && d.vals[f.key].length > 0)
          : String(d.vals[f.key] ?? '').trim() !== ''
      if (!filled) {
        ElMessage.warning(`「${f.label}」是必填的`)
        return
      }
    }
  }
  const records = {}
  formOf(sub).forEach((g) => {
    const values = {}
    ;(g.fields || []).forEach((f) => {
      if (f.type === 'file') return
      const v = d.vals[f.key]
      if (v !== undefined && v !== null && String(v).trim() !== '') values[f.key] = v
    })
    records[g.itemId] = { verdict, values, files: d.files[g.itemId] || 0, note: d.note || '' }
  })
  submitInstanceSub(inst.value.id, sub.id, {
    verdict,
    records,
    note: d.note || '',
    by: me.value?.name || '当前用户'
  })
  delete drafts[sub.id]
  if (inst.value.state === 'terminated') ElMessage.error('必过的一环未通过，流程已终止')
  else if (inst.value.state === 'done') ElMessage.success('最后一环办结，这一单完成')
  else ElMessage.success('已提交，按前置推进下一环')
}

const back = () => router.push({ name: 'v2-m-instances' })

/** 系统项的三个动作，文案按类型与已取次数来 */
function runLabel (s) {
  const w = (s.ways || [])[0] || {}
  if (w.type === 'system') return subOf(s.id).polls ? '再取一批（下一批结论）' : '取一次结论'
  if (w.type === 'action') return '重发一次执行'
  return '收到回执'
}

function runSys (s) {
  const r = runSystemSub(inst.value.id, s.id)
  if (!r) return
  if (r.refused) { ElMessage.info(r.why); return }
  if (r.state === 'done') ElMessage.success('已取得结论，流程继续往下走')
  else if (r.state === 'rejected') ElMessage.error('批次用完仍未通过，这一环按未通过处理')
  else ElMessage.warning('这一批仍未通过，等下批再取')
}
</script>

<style scoped>
.m-page { min-height: 100vh; background: #f5f5f5; }
.page-header { display: flex; align-items: center; gap: 10px; padding: 14px 16px; background: #fff; position: sticky; top: 0; z-index: 20; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
.back-icon { font-size: 22px; color: #333; }
.page-header h1 { flex: 1; text-align: center; font-size: 17px; font-weight: 600; margin: 0; }
.hd-chip { font-size: 10.5px; padding: 2px 8px; border-radius: 10px; }
.hd-chip.running { color: #a40035; background: #fff0f4; }
.hd-chip.done { color: #2f7d5a; background: #eaf5ef; }
.hd-chip.terminated { color: #b23b3b; background: #fdecec; }

.content { padding: 12px 12px 30px; }
.card { background: #fff; border-radius: 12px; padding: 14px; margin-bottom: 10px; }

.sum-row { display: flex; gap: 10px; font-size: 12.5px; line-height: 1.9; }
.sum-row .k { flex: none; width: 62px; color: #a3a0a1; }
.sum-row .v { flex: 1; color: #333; }
.sum-row .v.lk { color: #a40035; text-decoration: underline; text-underline-offset: 2px; }
.sec-head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.sec-title { font-size: 14px; font-weight: 600; color: #333; }
.tag-ro { font-size: 10.5px; color: #6b7280; background: #f3f4f6; border-radius: 9px; padding: 1px 7px; }
.asset-note { margin-top: 8px; padding-top: 7px; border-top: 1px dashed #f0edf0; font-size: 11px; color: #a3a0a1; line-height: 1.6; }
.mono { font-family: ui-monospace, monospace; font-size: 11.5px; color: #a40035; }
.prog-line { display: flex; align-items: center; gap: 8px; margin-top: 10px; }
.bar { flex: 1; height: 4px; border-radius: 2px; background: #f0eef4; overflow: hidden; }
.bar i { display: block; height: 100%; background: #a40035; border-radius: 2px; }
.pg { font-size: 11px; color: #a3a0a1; }

.persona-hint { font-size: 10.5px; color: #cdc7c9; letter-spacing: .3px; padding: 2px 4px; user-select: none; flex: none; }
.persona-hint:active { color: #a40035; }
.other-card { border: 1px solid #f0eef0; }
.oc-note { margin-top: 8px; padding-top: 7px; border-top: 1px dashed #f0eef0; font-size: 11px; color: #a40035; line-height: 1.55; }
.oc-note { margin-top: 8px; padding-top: 7px; border-top: 1px dashed #f0eef0; font-size: 11px; color: #a40035; line-height: 1.55; }

.todo-card { border: 1px solid #f6dfe6; box-shadow: 0 2px 10px rgba(164, 0, 53, .06); }
.td-head { display: flex; align-items: baseline; gap: 8px; }
.td-tag { flex: none; font-size: 10.5px; color: #a40035; background: #fff0f4; border-radius: 9px; padding: 2px 7px; }
.td-goal { font-size: 15px; font-weight: 600; color: #333; line-height: 1.5; }
.td-meta { font-size: 12px; color: #888; margin-top: 6px; }
.td-meta em { font-style: normal; margin-left: 6px; font-size: 10.5px; color: #9a6b00; background: #fdf6e7; border-radius: 6px; padding: 1px 6px; }

.item { margin-top: 12px; padding-top: 10px; border-top: 1px dashed #f0edf0; }
.it-h { display: flex; flex-direction: column; gap: 2px; margin-bottom: 8px; }
.it-h b { font-size: 13px; color: #333; }
.it-h span { font-size: 11.5px; color: #a3a0a1; line-height: 1.6; }

.field { margin-bottom: 10px; }
.field label { display: block; font-size: 12px; color: #666; margin-bottom: 5px; }
.field label i { font-style: normal; color: #c0392b; margin-left: 2px; }
.field label .pre.miss { color: #b45309; background: #fdf6e7; }
.field label .pre { font-style: normal; margin-left: 6px; font-size: 10px; color: #8a7fb8; background: #f4f1fc; border-radius: 4px; padding: 1px 5px; }
.field.note { margin-top: 4px; }

.file-box { display: flex; align-items: center; justify-content: space-between; border: 1px dashed #ddd6da; border-radius: 8px; padding: 9px 11px; font-size: 12.5px; color: #8a8586; background: #fcfbfb; }
.file-box em { font-style: normal; font-size: 10.5px; color: #b9b3b5; }

.acts { display: flex; gap: 10px; margin-top: 14px; }
.acts button { flex: 1; font-size: 13.5px; padding: 10px 0; border-radius: 21px; font-family: inherit; }
.ghost { color: #666; border: 1px solid #dcdcdc; background: #fff; }
.solid { color: #fff; background: #a40035; border: 1px solid #a40035; font-weight: 600; }
.td-foot { margin-top: 9px; font-size: 10.5px; color: #b9b3b5; text-align: center; }

.wait-card .wc-h { font-size: 12.5px; color: #6a6a75; font-weight: 600; margin-bottom: 8px; }
.wc-row { padding: 8px 0; border-top: 1px dashed #f0edf0; }
.wc-row:first-of-type { border-top: none; padding-top: 0; }
.wc-g { font-size: 13px; color: #333; }
.wc-s { font-size: 11.5px; color: #a3a0a1; margin-top: 3px; }
.wc-r { font-size: 11.5px; color: #9a6b00; background: #fdf6e7; border-radius: 7px; padding: 4px 8px; margin-top: 6px; }
.wc-ck { margin-top: 5px; font-size: 11px; color: #b45309; }
.wc-ex { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 5px; }
.wc-ex span { font-size: 10.5px; color: #2f7d5a; background: #f2faf4; border-radius: 6px; padding: 1px 7px; }
.wc-us { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
.wc-us span { font-size: 10.5px; color: #185fa5; background: #eaf2fb; border-radius: 6px; padding: 1px 7px; }
.wc-act { display: flex; align-items: center; gap: 8px; margin-top: 7px; }
.wc-act .mini { font-size: 11.5px; color: #a40035; background: #fff5f8; border: 1px solid #f3d8e2; border-radius: 13px; padding: 4px 11px; font-family: inherit; }
.wc-act .mini-note { font-size: 10px; color: #bfb8ba; }

.done-card { font-size: 12.5px; color: #2f7d5a; background: #f2faf4; }
.danger-card { font-size: 12.5px; color: #8a2b2b; background: #fdf0f0; }

.tl-h { font-size: 12.5px; color: #6a6a75; font-weight: 600; margin-bottom: 10px; }
.tl-h em { font-style: normal; font-size: 10.5px; color: #b9b3b5; margin-left: 6px; }
.tl-row { display: flex; gap: 10px; }
.tl-rail { flex: none; width: 20px; display: flex; flex-direction: column; align-items: center; }
.tl-idx { width: 18px; height: 18px; border-radius: 50%; background: #f4f2f5; color: #a3a0a1; font-size: 10px; display: flex; align-items: center; justify-content: center; }
.tl-row.done .tl-idx { background: #eaf5ef; color: #2f7d5a; }
.tl-row.checking .tl-idx { background: #fff4e2; color: #b45309; }
.tl-row.running .tl-idx { background: #fff0f4; color: #a40035; }
.tl-row.rejected .tl-idx { background: #fdecec; color: #b23b3b; }
.tl-line { flex: 1; width: 1px; background: #eee9ec; margin: 3px 0; }
.tl-body { flex: 1; min-width: 0; padding-bottom: 14px; }
.tl-top { display: flex; align-items: baseline; gap: 8px; }
.tl-goal { flex: 1; font-size: 13px; color: #333; line-height: 1.55; }
.tl-st { flex: none; font-size: 10px; border-radius: 6px; padding: 1px 6px; }
.tl-st.done { color: #2f7d5a; background: #eaf5ef; }
.tl-st.running { color: #a40035; background: #fff0f4; }
.tl-st.pending { color: #a3a0a1; background: #f4f2f5; }
.tl-st.checking { color: #b45309; background: #fff4e2; }
.tl-st.rejected { color: #b23b3b; background: #fdecec; }
.tl-st.skipped, .tl-st.closed { color: #8a8586; background: #f4f2f4; }
.tl-by { font-size: 11px; color: #a3a0a1; margin-top: 3px; }
.tl-result { font-size: 11.5px; color: #2f7d5a; background: #f2faf4; border-radius: 7px; padding: 4px 8px; margin-top: 5px; }
.tl-used { display: inline-block; margin-top: 4px; font-size: 10.5px; color: #185fa5; background: #eaf2fb; border-radius: 6px; padding: 1px 7px; }
.tl-ck { font-size: 11px; color: #b45309; background: #fffaf0; border-radius: 7px; padding: 4px 8px; margin-top: 5px; }
.tl-note { font-size: 11.5px; color: #8a8586; margin-top: 4px; line-height: 1.65; }
.tl-rec { display: flex; flex-wrap: wrap; gap: 4px 10px; margin-top: 5px; }
.rv { font-size: 11.5px; color: #6a6a75; background: #fafafa; border-radius: 6px; padding: 1px 7px; }
.rf, .rn { font-size: 10.5px; color: #b9b3b5; }
.tl-exec { display: flex; justify-content: space-between; gap: 8px; font-size: 11px; color: #6a6a75; padding: 2px 0; }
.ex-r.ok { color: #2f7d5a; }
.ex-r.bad { color: #b23b3b; }

.empty-text { font-size: 13px; color: #999; padding: 26px 0; text-align: center; }
</style>
