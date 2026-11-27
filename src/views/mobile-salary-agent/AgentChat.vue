<!--
  移动端 · 薪酬咨询助手（员工侧 · 对话演示页）
  单独入口，不嵌业务页。演示完整链路：快捷求证 → 答复（求证链四步卡）→ 不服归因
  → 取证引导三问 → 复核轮次 → Agent 判定成单（额度确认弹层，成立才扣次）。
  员工全程没有「提交工单」按钮：工单是 Agent 判定成立、员工确认的。
  演示固定身份蓝田（客次提成脚本不跨岗位）；「我的工单」页另有身份切换。
  视觉沿用移动端规范：全屏页、白 sticky 页头、#f5f5f5 底、白卡 12px、品牌红 #a40035、自写底部弹层。
-->
<template>
  <div class="m-page chat-page">
    <header class="page-header">
      <el-icon class="back-icon" @click="goBack"><ArrowLeft /></el-icon>
      <h1>薪酬咨询助手</h1>
    </header>

    <div class="chat-scroll" ref="scrollEl">
      <!-- ============ 欢迎态 ============ -->
      <div v-if="!dialog" class="welcome">
        <div class="hero-card">
          <div class="hero-row">
            <span class="hero-dot"></span>
            <span class="hero-badge">只查自己的 · 最近 3 个月</span>
          </div>
          <p class="hero-t1">你好，我是薪酬咨询助手</p>
          <p class="hero-t2">只回答你本人已发放工资条的求证，每一笔都走完整还原链。</p>
          <ul class="hero-rules">
            <li><b>能查</b>：本人最近 3 个月已发放的薪酬结论，以及本月算薪前的业务预估</li>
            <li><b>不查</b>：试算未来月份收入、他人薪酬、3 个月之前的月份</li>
          </ul>
          <p class="hero-keep">咨询记录保留 24 小时；无工单的咨询到时自动结束，有工单的咨询在工单结案后保留 24 小时。历史记录可在左下角「+」里查看。</p>
          <p class="hero-quota">本月工单可提交 <b>{{ monthlyLeft }}/2</b> 次，提交工单会占用次数。</p>
        </div>
        <p class="chips-title">你可以这样问（点一下填进输入框）</p>
        <div class="chips">
          <button v-for="q in quickQuestions" :key="q.label" @click="fillDraft(q.label)">{{ q.label }}</button>
        </div>
      </div>

      <!-- ============ 对话态 ============ -->
      <template v-else>
        <!-- 查看历史记录态：只读提示，继续对话入口在底部功能区 -->
        <div v-if="isViewingHistory" class="history-view-tip">
          <span class="hv-icon">历史记录</span>
          这是已结束的咨询，可查看当时的解答。要在此基础上继续，点下方「继续对话」。
        </div>

        <div
          v-for="(m, i) in dialog.messages"
          :key="i"
          class="msg-row"
          :class="m.from"
        >
          <!-- 用户气泡 -->
          <template v-if="m.from === 'user'">
            <div class="bubble user">{{ m.text }}</div>
            <div v-if="m.shots && m.shots.length" class="shots">
              <div v-for="s in m.shots" :key="s" class="shot-tag">
                <span class="shot-icon"></span>{{ s }}
              </div>
            </div>
          </template>

          <!-- 助手气泡 -->
          <template v-else>
            <div class="agent-head">
              <span class="agent-avatar">薪</span>
              <span class="agent-name">薪酬咨询助手</span>
            </div>
            <div class="bubble agent">
              <p v-for="(line, li) in splitLines(m.text)" :key="li">{{ line }}</p>

              <!-- 求证链四步卡 -->
              <div v-if="m.card && m.card.type === 'verify'" class="verify-card">
                <div v-for="s in m.card.steps" :key="s.no" class="v-step" :class="{ key: s.no === '04' }">
                  <span class="v-no">{{ s.no }}</span>
                  <div class="v-body">
                    <p class="v-label">{{ s.label }}</p>
                    <p class="v-text">{{ s.text }}</p>
                  </div>
                </div>
              </div>

              <!-- 常乐豆账户级三数卡 -->
              <div v-if="m.card && m.card.type === 'account'" class="account-card">
                <div v-for="r in m.card.rows" :key="r.label" class="ac-row">
                  <span>{{ r.label }}</span>
                  <b>{{ r.value }}</b>
                </div>
              </div>

              <!-- 本月业务累计预估卡 -->
              <div v-if="m.card && m.card.type === 'estimate'" class="estimate-card">
                <div v-for="r in m.card.rows" :key="r.label" class="ac-row">
                  <span>{{ r.label }}</span>
                  <b>{{ r.value }}</b>
                </div>
                <p class="est-note">{{ m.card.note }}</p>
              </div>
            </div>

            <!-- 可选回复（只出现在最后一条助手消息上；已结束会话不显示） -->
            <div v-if="hasOptions(m, i) && !currentEndInfo.ended" class="opt-group">
              <button
                v-for="(o, oi) in m.options"
                :key="oi"
                class="opt-btn"
                @click="pick(oi)"
              >{{ o.label }}</button>
            </div>

            <!-- 成单后的工单入口 -->
            <button v-if="m.ticketLink" class="ticket-link" @click="goTickets">
              查看我的工单<el-icon><ArrowRight /></el-icon>
            </button>
          </template>
        </div>

        <div v-if="dialog.ended && !currentEndInfo.ended" class="re-run">
          <button class="opt-btn ghost" @click="newDialog">换个问题，新建对话</button>
        </div>
      </template>
    </div>

    <!-- 底部输入区：输入框是主体，功能入口收进 + 号弹层（对话产品通行形态） -->
    <div class="composer">
      <!-- 查看历史记录态：只读，不提供输入，改为继续对话 -->
      <button v-if="isViewingHistory" class="composer-continue" @click="doContinue">
        <el-icon><ChatDotRound /></el-icon>继续对话
      </button>
      <template v-else>
        <button class="cp-plus" :class="{ on: showTools }" @click="showTools = !showTools" aria-label="更多功能">
          <el-icon><Plus /></el-icon>
        </button>
        <input
          v-model="draft"
          class="cp-input"
          type="text"
          placeholder="输入你的薪酬问题"
          @keyup.enter="onSend"
        />
        <button class="cp-send" :disabled="!draft.trim()" @click="onSend">
          <el-icon><Promotion /></el-icon>
        </button>
      </template>
    </div>

    <!-- + 号展开的功能区（次级入口，不占输入行） -->
    <div v-if="showTools && !isViewingHistory" class="tools-mask" @click.self="showTools = false">
      <div class="tools-sheet">
        <div class="ts-bar"></div>
        <div class="ts-grid">
          <button class="ts-item" @click="toolGo(goHistory)">
            <span class="ts-ic"><el-icon><Clock /></el-icon></span><span>历史记录</span>
          </button>
          <button class="ts-item" @click="toolGo(goTickets)">
            <span class="ts-ic"><el-icon><Tickets /></el-icon></span><span>我的工单</span>
          </button>
          <button class="ts-item" @click="toolGo(newDialog)">
            <span class="ts-ic"><el-icon><Plus /></el-icon></span><span>新建对话</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 成单确认弹层 -->
    <div v-if="dialogPendingConfirm" class="sheet-mask" @click.self="cancelCreateTicket">
      <div class="sheet">
        <div class="sheet-bar"></div>
        <p class="sheet-title">确认生成薪酬工单？</p>
        <div class="confirm-box">
          <div class="cb-row"><span>争议薪酬项</span><b>{{ dialog.ctx.item || '客次提成' }}</b></div>
          <div class="cb-row"><span>你的主张</span><b>{{ dialog.ctx.expected }} 元</b></div>
          <div class="cb-row"><span>复核情况</span><b class="p1">{{ dialog.ctx.recheckConclusion }} {{ dialog.ctx.deviate }} 元</b></div>
          <div class="cb-row"><span>随单提交</span><b>你的描述与截图 + 复核情况</b></div>
          <div class="cb-row"><span>本月可提交</span><b class="warn">剩 2 次 → 提交后剩 1 次</b></div>
        </div>
        <p class="sheet-note">提交后由人事核实并答复，处理进展可在「我的工单」查看。</p>
        <div class="sheet-act">
          <button class="act-btn ghost" @click="cancelCreateTicket">再想想</button>
          <button class="act-btn primary" @click="confirmCreateTicket">确认提交</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, ArrowRight, Clock, Tickets, Plus, ChatDotRound, Promotion } from '@element-plus/icons-vue'
import { dialog, dialogPendingConfirm, currentEndInfo, isViewingHistory, pickOption, sendText, confirmCreateTicket, cancelCreateTicket, newDialog, loadSession, continueSession, resumeLastSession, monthlyLeft } from '../../mock/salaryAgentTicketsStore.js'

const router = useRouter()
const route = useRoute()

// 进入页面：从历史指定会话则加载它；否则恢复最近一条进行中会话；没有则欢迎态
onMounted(() => {
  const sid = route.query.session
  if (sid) loadSession(sid)
  else resumeLastSession()
})

const quickQuestions = [
  { label: '查一下我 11 月上半月的客次提成' },
  { label: '常乐豆本月结算了多少' },
  { label: '我这个月提成有多少了' }
]

const draft = ref('')
const showTools = ref(false)

function fillDraft (text) { draft.value = text }
function onSend () {
  const text = draft.value.trim()
  if (!text) return
  sendText(text)
  draft.value = ''
  showTools.value = false
}
function toolGo (fn) { showTools.value = false; fn() }
function pick (i) { pickOption(i) }

function splitLines (text) { return String(text || '').split('\n') }

const dialogState = dialog
const lastOptIdx = computed(() => {
  const msgs = dialogState.value ? dialogState.value.messages : []
  for (let i = msgs.length - 1; i >= 0; i--) {
    if (msgs[i].from === 'agent' && msgs[i].options && msgs[i].options.length) return i
  }
  return -1
})
function hasOptions (m, i) { return i === lastOptIdx.value }

const scrollEl = ref(null)
watch(() => (dialogState.value ? dialogState.value.messages.length : 0), async () => {
  await nextTick()
  if (scrollEl.value) scrollEl.value.scrollTop = scrollEl.value.scrollHeight
})

function goBack () { router.push('/mobile-menu') }
function goTickets () { router.push('/mobile-salary-agent/tickets') }
function goHistory () { router.push('/mobile-salary-agent/history') }
function doContinue () {
  if (!dialog.value) return
  continueSession(dialog.value.id)
}
</script>

<style scoped>
.chat-page { display: flex; flex-direction: column; position: relative; }
.page-header { position: sticky; top: 0; z-index: 10; height: 48px; background: #fff; display: flex; align-items: center; padding: 0 12px; gap: 8px; border-bottom: 1px solid #f0e7ea; }
.page-header h1 { font-size: 16px; font-weight: 500; color: #262626; flex: 1; margin: 0; }
.back-icon { font-size: 20px; color: #595959; }

.hero-keep { margin: 10px 0 0; font-size: 11px; color: #bfbfbf; line-height: 1.6; }
.hero-quota { margin: 6px 0 0; font-size: 11px; color: #8c8c8c; }
.hero-quota b { color: #a40035; }

/* 查看历史记录态提示 */
.history-view-tip { display: flex; align-items: flex-start; gap: 8px; background: #f5f5f5; color: #8c8c8c; font-size: 12px; line-height: 1.6; border-radius: 10px; padding: 10px 12px; margin-bottom: 12px; }
.hv-icon { flex: none; font-size: 11px; color: #5f5e5a; background: #e8e6e0; border-radius: 6px; padding: 1px 6px; }

.chat-scroll { flex: 1; padding: 14px 12px 12px; overflow-y: auto; }

/* 欢迎态 */
.hero-card { background: #fff; border-radius: 12px; padding: 16px 14px; }
.hero-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.hero-dot { width: 8px; height: 8px; border-radius: 50%; background: #a40035; }
.hero-badge { font-size: 12px; color: #a40035; background: #fceff2; padding: 3px 10px; border-radius: 10px; }
.hero-t1 { font-size: 17px; font-weight: 500; color: #262626; margin: 0 0 6px; }
.hero-t2 { font-size: 13px; color: #595959; margin: 0 0 10px; line-height: 1.6; }
.hero-rules { margin: 0; padding: 0; list-style: none; }
.hero-rules li { font-size: 12px; color: #8c8c8c; line-height: 1.9; }
.hero-rules b { color: #a40035; font-weight: 500; margin-right: 4px; }
.chips-title { font-size: 12px; color: #8c8c8c; margin: 16px 2px 8px; }
.chips { display: flex; flex-direction: column; gap: 8px; }
.chips button { text-align: left; background: #fff; border: 1px solid #f0d5dc; color: #434343; font-size: 13px; padding: 12px 14px; border-radius: 12px; }

/* 消息流 */
.msg-row { display: flex; flex-direction: column; margin-bottom: 14px; }
.msg-row.user { align-items: flex-end; }
.msg-row.agent { align-items: flex-start; }
.agent-head { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.agent-avatar { width: 22px; height: 22px; border-radius: 50%; background: linear-gradient(135deg, #c31450, #a40035); color: #fff; font-size: 11px; display: flex; align-items: center; justify-content: center; }
.agent-name { font-size: 11px; color: #8c8c8c; }
.bubble { max-width: 86%; font-size: 13px; line-height: 1.7; border-radius: 12px; padding: 10px 12px; }
.bubble.user { background: linear-gradient(135deg, #c31450, #a40035); color: #fff; border-bottom-right-radius: 4px; }
.bubble.user p { margin: 0; }
.bubble.agent { background: #fff; color: #434343; border-bottom-left-radius: 4px; }
.bubble.agent p { margin: 0; }
.bubble.agent p + p { margin-top: 6px; }

/* 截图条目 */
.shots { display: flex; flex-direction: column; gap: 6px; align-items: flex-end; margin-top: 8px; }
.shot-tag { display: flex; align-items: center; gap: 6px; background: #fff; border: 1px dashed #d9b3bd; border-radius: 8px; padding: 6px 10px; font-size: 12px; color: #595959; }
.shot-icon { width: 14px; height: 14px; border-radius: 3px; background: #f0d5dc; }

/* 求证链四步卡 */
.verify-card { margin-top: 10px; border-top: 1px solid #f5f5f5; padding-top: 10px; display: flex; flex-direction: column; gap: 10px; }
.v-step { display: flex; gap: 10px; }
.v-no { flex: none; width: 26px; height: 26px; border-radius: 50%; background: #f5f5f5; color: #8c8c8c; font-size: 11px; display: flex; align-items: center; justify-content: center; }
.v-step.key .v-no { background: #a40035; color: #fff; }
.v-body { flex: 1; }
.v-label { margin: 2px 0 2px; font-size: 12px; color: #8c8c8c; }
.v-text { margin: 0; font-size: 13px; color: #262626; line-height: 1.6; }
.v-step.key .v-text { color: #a40035; font-weight: 500; }

/* 常乐豆账户级卡 */
.account-card { margin-top: 10px; border-top: 1px solid #f5f5f5; padding-top: 10px; }
.ac-row { display: flex; justify-content: space-between; font-size: 13px; color: #595959; padding: 7px 0; }
.ac-row b { color: #262626; font-weight: 500; }
.ac-row + .ac-row { border-top: 1px solid #f5f5f5; }

/* 预估卡 */
.estimate-card { margin-top: 10px; border-top: 1px solid #f5f5f5; padding-top: 10px; }
.est-note { margin: 8px 0 0; font-size: 11px; color: #854f0b; background: #faeeda; border-radius: 8px; padding: 6px 10px; }

/* 可选回复 */
.opt-group { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; width: 100%; }
.opt-btn { text-align: left; background: #fff; border: 1px solid #f0d5dc; color: #a40035; font-size: 13px; padding: 10px 14px; border-radius: 12px; }
.opt-btn.ghost { color: #8c8c8c; border-color: #e8e8e8; text-align: center; }
.re-run { display: flex; justify-content: center; margin-top: 6px; }
.re-run .opt-btn { min-width: 180px; }

.ticket-link { display: flex; align-items: center; gap: 4px; margin-top: 10px; background: #fceff2; border: none; color: #a40035; font-size: 13px; padding: 10px 14px; border-radius: 12px; }

/* 底部输入区：输入框是主体，功能入口收进 + 号 */
.composer { flex: none; display: flex; align-items: center; gap: 8px; background: #fff; border-top: 1px solid #f0f0f0; padding: 8px 12px; }
.cp-plus { flex: none; width: 36px; height: 36px; border-radius: 50%; border: 1px solid #e8e8e8; background: #fff; color: #a40035; display: flex; align-items: center; justify-content: center; font-size: 20px; }
.cp-plus.on { background: #fceff2; border-color: #f0d5dc; transform: rotate(45deg); }
.cp-input { flex: 1; min-width: 0; height: 38px; border: 1px solid #eee; background: #f7f7f7; border-radius: 19px; padding: 0 14px; font-size: 13px; color: #262626; outline: none; }
.cp-input:focus { border-color: #e0b3c0; background: #fff; }
.cp-input::placeholder { color: #bfbfbf; }
.cp-send { flex: none; width: 36px; height: 36px; border-radius: 50%; border: none; background: linear-gradient(135deg, #c31450, #a40035); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 16px; }
.cp-send:disabled { background: #f0f0f0; color: #bfbfbf; }
.composer-continue { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; height: 38px; background: linear-gradient(135deg, #c31450, #a40035); color: #fff; border: none; border-radius: 19px; font-size: 13px; }

/* + 号功能区弹层 */
.tools-mask { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.35); z-index: 150; display: flex; align-items: flex-end; }
.tools-sheet { width: 100%; background: #fff; border-radius: 16px 16px 0 0; padding: 8px 16px 24px; }
.ts-bar { width: 36px; height: 4px; border-radius: 2px; background: #e8e8e8; margin: 0 auto 16px; }
.ts-grid { display: flex; }
.ts-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; background: none; border: none; color: #595959; font-size: 12px; padding: 6px 0; }
.ts-ic { width: 46px; height: 46px; border-radius: 14px; background: #fceff2; color: #a40035; display: flex; align-items: center; justify-content: center; font-size: 22px; }

/* 自写底部弹层 */
.sheet-mask { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.45); display: flex; align-items: flex-end; z-index: 200; }
.sheet { width: 100%; max-height: 86vh; overflow-y: auto; background: #fff; border-radius: 16px 16px 0 0; padding: 14px 16px 20px; }
.sheet-bar { width: 36px; height: 4px; border-radius: 2px; background: #e8e8e8; margin: 0 auto 12px; }
.sheet-title { font-size: 16px; font-weight: 500; color: #262626; margin: 0 0 12px; }
.confirm-box { background: #fafafa; border-radius: 10px; padding: 4px 12px; }
.cb-row { display: flex; justify-content: space-between; gap: 12px; font-size: 13px; padding: 9px 0; }
.cb-row + .cb-row { border-top: 1px solid #f0f0f0; }
.cb-row span { color: #8c8c8c; flex: none; }
.cb-row b { color: #262626; font-weight: 500; text-align: right; }
.cb-row b.p1 { color: #a40035; }
.cb-row b.warn { color: #ba7517; }
.sheet-note { font-size: 12px; color: #8c8c8c; line-height: 1.6; margin: 10px 0 14px; }
.sheet-act { display: flex; gap: 10px; }
.sheet-act .act-btn { flex: 1; }
.act-btn { border-radius: 10px; padding: 12px 0; font-size: 14px; }
.act-btn.primary { background: linear-gradient(135deg, #c31450, #a40035); color: #fff; border: none; }
.act-btn.ghost { background: #fff; border: 1px solid #d9d9d9; color: #595959; }
</style>
