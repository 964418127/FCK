<template>
  <div class="pd-home">
    <div class="page-header">
      <el-icon class="back-icon" @click="goBack"><ArrowLeft /></el-icon>
      <h1>节点确认</h1>
    </div>

    <div class="content" v-if="node">
      <!-- 节点信息 -->
      <div class="card">
        <div class="nd-head">
          <div>
            <div class="nd-name">{{ node.name }}</div>
            <div class="nd-sub">{{ employeeLine }}</div>
          </div>
          <span :class="['nd-gate', node.gate]">{{ node.gate === 'must' ? '必过' : '可选' }}</span>
        </div>
        <div class="info-row"><span>负责人</span><b>{{ ownerLabel }}<em class="owner-note">（{{ roleLabelOf(node.role) }}{{ node.override ? ' · 指定覆盖' : ' · 按角色解析' }}）</em></b></div>
        <div v-if="prevNodes.length" class="info-row">
          <span>前置节点</span>
          <b>{{ prevNodes.map(p => p.name).join('、') }}<em class="owner-note">（前置节点全部办结后才能开始办理）</em></b>
        </div>
        <div v-else class="info-row">
          <span>开始时机</span>
          <b>无前置<em class="owner-note">（发起后即可办理）</em></b>
        </div>
        <div class="info-row"><span>确认规则</span><b>全部事项出结论{{ mustProofNote }}才算完成</b></div>
        <div v-if="node.gate === 'must'" class="gate-tip">
          本节点为必过节点：判定「不通过」将实时终止全部流程，单据作废、需重新发起，在途节点一并关闭。
        </div>
      </div>

      <!-- 事项逐条 -->
      <div v-for="(t, ti) in draft" :key="t.id" class="card task-card">
        <div class="tc-head">
          <span class="tc-no">{{ ti + 1 }}</span>
          <span class="tc-name">{{ t.name }}</span>
          <span v-if="t.proof === 'must'" class="req-chip">附件必传</span>
        </div>
        <div v-if="t.require" class="tc-require">办理要求：{{ t.require }}</div>

        <div class="concl-row">
          <div :class="['concl', { on: t.ok === true }]" @click="t.ok = true">已完成</div>
          <div :class="['concl', { on: t.ok === false }]" @click="t.ok = false">未完成</div>
        </div>

        <div class="field" v-show="t.ok !== null">
          <label>说明<i class="req">*</i></label>
          <el-input
            v-model="t.note"
            type="textarea"
            :rows="2"
            maxlength="200"
            :placeholder="t.ok === false ? '说明未完成的原因与卡点' : '补充办理情况'"
          />
        </div>

        <div class="field" v-if="t.proof !== 'none' && t.ok !== null">
          <label>
            证据附件
            <span :class="['proof-chip', t.proof]">{{ t.proof === 'must' ? '必传' : '可选' }} · 最多 {{ t.proofMax }} 个</span>
          </label>
          <el-upload
            v-model:file-list="t.files"
            :auto-upload="false"
            :limit="t.proofMax"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
          >
            <el-button size="small" :icon="Upload">选择文件</el-button>
          </el-upload>
          <div class="field-hint">PDF / JPG / PNG。{{ t.proof === 'must' ? '必传附件不齐，本事项不能算完成。' : '按需上传作为办理留痕。' }}</div>
        </div>
      </div>

      <!-- 结论确认 -->
      <div class="card">
        <div class="sec-head"><span class="sec-title">节点结论</span></div>
        <div class="summary-line">
          已完成 {{ okCount }} / {{ draft.length }} 件
          <span v-if="proofMissing" class="miss-warn">· 有必传附件未上传</span>
          <span v-if="noteMissing" class="miss-warn">· 有事项未填说明</span>
        </div>
        <div v-if="willReject" class="reject-tip">
          <template v-if="node.gate === 'must'">
            存在「未完成」事项。本节点为<strong>必过节点</strong>，提交「不通过」将<strong>实时终止全部流程</strong>并作废，请与人事确认后再操作。
          </template>
          <template v-else>
            存在「未完成」事项。本节点为可选节点，提交「不通过」只记录、不阻塞后续节点。
          </template>
        </div>
      </div>
    </div>

    <div class="footer-bar">
      <button class="reject-btn" :disabled="!canReject" @click="submit(false)">不通过</button>
      <button class="approve-btn" :disabled="!canDone" @click="submit(true)">确认本节点完成</button>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Upload } from '@element-plus/icons-vue'
import { caseOf, orgTextOf } from '../../mock/mobileResignPd.js'
import {
  handoverOf, templateOf, ownerOf, roleLabelOf, flattenNodes, depsOf
} from '../../mock/resignHandoverPd.js'

const route = useRoute()
const router = useRouter()

/* 菜单直进或案例无交接实例时，回退到演示单 rs01；nodeId 无效回退第一个节点 */
let c = caseOf(route.query.id)
let inst = handoverOf(c.id)
if (!inst) { c = caseOf('rs01'); inst = handoverOf('rs01') }
const tpl = templateOf(inst.templateId)
const allNodes = flattenNodes(tpl)
const node = allNodes.find(n => n.id === route.query.nodeId) || allNodes[0]
const prevNodes = depsOf(tpl, node)

/* 原型以「登录人 = 节点负责人」演示；正式开发由待办身份控制入口 */
const ownerLabel = ownerOf(node, node.override ? { [node.id]: node.override } : {})
const employeeLine = `${c.name} · ${c.job} · ${orgTextOf(c)}`

/** 草稿：从实例现有记录初始化（重开场景可回显） */
const saved = inst.nodes?.[node.id] || { records: {} }
const draft = reactive(node.tasks.map(t => {
  const rec = saved.records?.[t.id]
  return {
    id: t.id,
    name: t.name,
    require: t.require,
    proof: t.proof,
    proofMax: t.proofMax || 3,
    ok: rec ? rec.ok : null,
    note: rec ? rec.note : '',
    files: rec && rec.files ? Array.from({ length: Math.min(rec.files, t.proofMax || 3) }, (_, i) => ({ name: `证据-${i + 1}.jpg`, status: 'ready' })) : []
  }
}))

const okCount = computed(() => draft.filter(t => t.ok === true).length)
const allConcluded = computed(() => draft.every(t => t.ok !== null))
const noteMissing = computed(() => draft.some(t => t.ok !== null && !t.note.trim()))
const proofMissing = computed(() => draft.some(t => t.ok === true && t.proof === 'must' && !t.files.length))
const willReject = computed(() => draft.some(t => t.ok === false))

const mustProofNote = computed(() =>
  node.tasks.some(t => t.proof === 'must') ? '（必传附件齐）' : ''
)

const canDone = computed(() => allConcluded.value && okCount.value === draft.length && !proofMissing.value && !noteMissing.value)
const canReject = computed(() => allConcluded.value && willReject.value && !noteMissing.value)

const now = () => {
  const d = new Date()
  const p = (x) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

const submit = (pass) => {
  inst.nodes[node.id] = {
    state: pass ? 'done' : 'rejected',
    by: ownerLabel,
    at: now(),
    records: Object.fromEntries(draft.map(t => [t.id, { ok: t.ok, note: t.note, files: t.files.length }]))
  }
  if (pass) {
    ElMessage.success(`「${node.name}」已确认完成（原型演示）`)
  } else if (node.gate === 'must') {
    ElMessage.error('必过节点不通过，已实时终止全部流程并作废（原型演示）')
  } else {
    ElMessage.warning('可选节点已记录「不通过」，不阻塞后续节点（原型演示）')
  }
  setTimeout(() => router.replace({ name: 'mobile-resign-handover', query: { id: c.id } }), 1100)
}

const goBack = () => router.back()
</script>

<style scoped>
.pd-home { min-height: 100vh; height: 100vh; overflow-y: auto; background: #f5f5f5; -webkit-overflow-scrolling: touch; padding-bottom: 86px; }
.page-header { display: flex; align-items: center; gap: 10px; padding: 14px 16px; background: #fff; position: sticky; top: 0; z-index: 20; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
.back-icon { font-size: 22px; color: #333; }
.page-header h1 { flex: 1; text-align: center; font-size: 17px; font-weight: 600; margin: 0; }

.content { padding: 12px 12px 20px; }
.card { background: #fff; border-radius: 12px; padding: 14px; margin-bottom: 12px; }

.nd-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; padding-bottom: 10px; border-bottom: 1px solid #f5f5f5; margin-bottom: 8px; }
.nd-name { font-size: 16px; font-weight: 600; color: #333; }
.nd-sub { font-size: 12px; color: #888; margin-top: 4px; }
.nd-gate { font-size: 11px; font-weight: 500; border-radius: 9px; padding: 2px 9px; flex-shrink: 0; }
.nd-gate.must { color: #993556; background: #fbeaf0; }
.nd-gate.optional { color: #888780; background: #f1efe8; }

.info-row { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 5px 0; font-size: 13px; }
.info-row span { color: #999; flex-shrink: 0; }
.info-row b { color: #333; font-weight: 500; text-align: right; }
.owner-note { font-style: normal; font-size: 11px; color: #a3a0a1; }
.gate-tip { margin-top: 8px; font-size: 11.5px; color: #a32d2d; background: #fcebeb; border-radius: 8px; padding: 8px 10px; line-height: 1.7; }

.task-card .tc-head { display: flex; align-items: center; gap: 8px; }
.tc-no { width: 18px; height: 18px; border-radius: 50%; background: #f1efe8; color: #5f5e5a; font-size: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.tc-name { flex: 1; font-size: 13.5px; font-weight: 600; color: #333; }
.req-chip { font-size: 10px; color: #b91c1c; background: #fdecec; border-radius: 8px; padding: 1px 6px; flex-shrink: 0; }
.tc-require { font-size: 11.5px; color: #8a8f99; margin: 6px 0 0 26px; }

.concl-row { display: flex; gap: 8px; margin: 10px 0 0 26px; }
.concl { flex: 1; text-align: center; font-size: 12.5px; border: 1px solid #e8e8e8; border-radius: 18px; padding: 7px 0; color: #888; background: #fafafa; cursor: pointer; }
.concl.on { border-color: #a40035; color: #a40035; background: #fff5f7; font-weight: 600; }

.field { margin: 10px 0 0 26px; }
.field:last-child { margin-bottom: 0; }
.field > label { display: block; font-size: 12.5px; font-weight: 500; color: #333; margin-bottom: 6px; }
.req { color: #d4537e; font-style: normal; }
.proof-chip { font-size: 10px; border-radius: 8px; padding: 1px 7px; margin-left: 6px; font-weight: 400; }
.proof-chip.must { color: #993556; background: #fbeaf0; }
.proof-chip.optional { color: #888780; background: #f1efe8; }
.field-hint { font-size: 11px; color: #a3a0a1; margin-top: 5px; }

.sec-head { margin-bottom: 8px; }
.sec-title { font-size: 15px; font-weight: 600; color: #333; }
.summary-line { font-size: 13px; color: #333; }
.miss-warn { color: #b45309; font-size: 12px; }
.reject-tip { margin-top: 10px; font-size: 12px; color: #a32d2d; background: #fcebeb; border-radius: 8px; padding: 9px 11px; line-height: 1.8; }

.footer-bar { position: fixed; left: 0; right: 0; bottom: 0; display: flex; gap: 10px; padding: 10px 14px 16px; background: #fff; box-shadow: 0 -2px 12px rgba(0,0,0,.06); }
.reject-btn, .approve-btn { flex: 1; height: 44px; border-radius: 22px; font-size: 15px; font-weight: 600; }
.reject-btn { background: #f0edee; color: #a32d2d; border: 1px solid #f0d5d5; }
.reject-btn:disabled { color: #c9c4c5; border-color: #eceaec; }
.approve-btn { background: #a40035; color: #fff; border: none; }
.approve-btn:disabled { background: #e3ccd3; }
</style>
