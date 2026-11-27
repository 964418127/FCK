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
      <button class="hdr-link" @click="goTickets">我的工单</button>
    </header>

    <div class="chat-scroll" ref="scrollEl">
      <!-- ============ 欢迎态 ============ -->
      <div v-if="!dialog" class="welcome">
        <div class="hero-card">
          <div class="hero-row">
            <span class="hero-dot"></span>
            <span class="hero-badge">只查自己的 · 已发放的</span>
          </div>
          <p class="hero-t1">你好，我是薪酬咨询助手</p>
          <p class="hero-t2">只回答你本人已发放工资条的求证，每一笔都走完整还原链。</p>
          <ul class="hero-rules">
            <li><b>能查</b>：本人已发放月份的薪酬项、计算过程与结论</li>
            <li><b>不查</b>：试算未来收入、他人薪酬、未发放月份</li>
            <li><b>常乐豆</b>：只提供账户级汇总，明细不在解答范围</li>
          </ul>
        </div>
        <p class="chips-title">你可以这样问</p>
        <div class="chips">
          <button v-for="q in quickQuestions" :key="q.script" @click="start(q.script)">{{ q.label }}</button>
        </div>
        <button class="ticket-entry" @click="goTickets">
          <span class="te-main">我的工单</span>
          <span class="te-quota">本月额度剩 {{ monthlyLeft }}/2</span>
          <el-icon><ArrowRight /></el-icon>
        </button>
      </div>

      <!-- ============ 对话态 ============ -->
      <template v-else>
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
                <p class="ac-note">仅账户级汇总 · 明细不在解答范围</p>
                <div v-for="r in m.card.rows" :key="r.label" class="ac-row">
                  <span>{{ r.label }}</span>
                  <b>{{ r.value }}</b>
                </div>
              </div>
            </div>

            <!-- 可选回复（只出现在最后一条助手消息上） -->
            <div v-if="hasOptions(m, i)" class="opt-group">
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

        <div v-if="dialog.ended" class="re-run">
          <button class="opt-btn ghost" @click="resetDialog">返回，换个问题</button>
        </div>
      </template>
    </div>

    <!-- 演示输入条 -->
    <div class="chat-input-bar">
      <span>演示原型 · 点击对话中的回复选项推进</span>
    </div>

    <!-- 成单确认弹层 -->
    <div v-if="dialogPendingConfirm" class="sheet-mask" @click.self="cancelCreateTicket">
      <div class="sheet">
        <div class="sheet-bar"></div>
        <p class="sheet-title">确认生成薪酬工单？</p>
        <div class="confirm-box">
          <div class="cb-row"><span>争议薪酬项</span><b>{{ dialog.ctx.item || '客次提成' }}</b></div>
          <div class="cb-row"><span>你的主张</span><b>{{ dialog.ctx.expected }} 元</b></div>
          <div class="cb-row"><span>预核查结论</span><b class="p1">{{ dialog.ctx.recheckConclusion }} {{ dialog.ctx.deviate }} 元</b></div>
          <div class="cb-row"><span>随单提交</span><b>你的描述与截图 + 预核查报告</b></div>
          <div class="cb-row"><span>本月额度</span><b class="warn">剩 2 次 → 占用后剩 1 次</b></div>
        </div>
        <p class="sheet-note">工单提交后由人事处理，答复一次即结案；再不服可于次月发起新工单。</p>
        <div class="sheet-act">
          <button class="act-btn ghost" @click="cancelCreateTicket">再想想</button>
          <button class="act-btn primary" @click="confirmCreateTicket">确认提交</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { dialog, dialogPendingConfirm, openScript, pickOption, confirmCreateTicket, cancelCreateTicket, resetDialog, monthlyLeft } from '../../mock/salaryAgentTicketsStore.js'

const router = useRouter()

const quickQuestions = [
  { script: 'piecework', label: '查一下我 11 月上半月的客次提成' },
  { script: 'bean', label: '常乐豆本月结算了多少' },
  { script: 'forecast', label: '帮我算算下个月能拿多少' }
]

function start (id) { openScript(id) }
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
</script>

<style scoped>
.chat-page { display: flex; flex-direction: column; }
.page-header { position: sticky; top: 0; z-index: 10; height: 48px; background: #fff; display: flex; align-items: center; padding: 0 12px; gap: 8px; border-bottom: 1px solid #f0e7ea; }
.page-header h1 { font-size: 16px; font-weight: 500; color: #262626; flex: 1; margin: 0; }
.back-icon { font-size: 20px; color: #595959; }
.hdr-link { border: none; background: #fceff2; color: #a40035; font-size: 12px; padding: 6px 10px; border-radius: 14px; }

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
.ticket-entry { width: 100%; margin-top: 16px; display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid #f0d5dc; border-radius: 12px; padding: 12px 14px; }
.te-main { font-size: 14px; color: #262626; font-weight: 500; }
.te-quota { font-size: 12px; color: #a40035; background: #fceff2; border-radius: 10px; padding: 2px 8px; }
.ticket-entry .el-icon { margin-left: auto; color: #bfbfbf; }

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
.ac-note { margin: 0 0 8px; font-size: 11px; color: #bfbfbf; }
.ac-row { display: flex; justify-content: space-between; font-size: 13px; color: #595959; padding: 7px 0; }
.ac-row b { color: #262626; font-weight: 500; }
.ac-row + .ac-row { border-top: 1px solid #f5f5f5; }

/* 可选回复 */
.opt-group { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; width: 100%; }
.opt-btn { text-align: left; background: #fff; border: 1px solid #f0d5dc; color: #a40035; font-size: 13px; padding: 10px 14px; border-radius: 12px; }
.opt-btn.ghost { color: #8c8c8c; border-color: #e8e8e8; text-align: center; }
.re-run { display: flex; justify-content: center; margin-top: 6px; }
.re-run .opt-btn { min-width: 180px; }

.ticket-link { display: flex; align-items: center; gap: 4px; margin-top: 10px; background: #fceff2; border: none; color: #a40035; font-size: 13px; padding: 10px 14px; border-radius: 12px; }

/* 输入条（演示假条） */
.chat-input-bar { flex: none; background: #fff; border-top: 1px solid #f0f0f0; padding: 12px 14px; text-align: center; font-size: 12px; color: #bfbfbf; }

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
