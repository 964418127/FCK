<template>
  <div class="mobile-reimburse-detail">
    <!-- 顶部导航 -->
    <div class="top-nav">
      <el-button type="text" @click="goBack" style="color: white;">
        <el-icon :size="18"><ArrowLeft /></el-icon>
      </el-button>
      <div class="nav-title">报销详情</div>
      <div class="nav-spacer"></div>
    </div>

    <template v-if="item">
      <!-- 状态头 -->
      <div class="status-head">
        <div class="status-amount">¥{{ item.amount.toFixed(2) }}</div>
        <div class="status-text" :class="statusClass(item.status)">{{ item.status }}</div>
      </div>
      <div v-if="item.rejectReason" class="reject-reason">
        未通过原因：{{ item.rejectReason }}
      </div>

      <div class="page-content">
        <!-- 进度 -->
        <div class="module">
          <div class="module-header">
            <div class="module-title"><span class="red-bar"></span>处理进度</div>
          </div>
          <div class="module-content">
            <div class="timeline">
              <div
                v-for="(node, i) in item.timeline"
                :key="i"
                class="tl-node"
                :class="{ done: node.done }"
              >
                <div class="tl-dot"></div>
                <div class="tl-body">
                  <div class="tl-label">{{ node.label }}</div>
                  <div class="tl-time">{{ node.time }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 报销信息 -->
        <div class="module">
          <div class="module-header">
            <div class="module-title"><span class="red-bar"></span>报销信息</div>
          </div>
          <div class="module-content">
            <div class="info-row">
              <span class="info-label">报销人</span>
              <span class="info-value">{{ item.applicant }}<span class="emp-no">（工号 {{ item.employeeNo }}）</span></span>
            </div>
            <div class="info-row">
              <span class="info-label">所属部门</span>
              <span class="info-value">{{ item.department }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">报销类型</span>
              <span class="info-value">{{ item.type }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">费用发生日期</span>
              <span class="info-value">{{ item.expenseDate }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">费用所属主体</span>
              <span class="info-value">{{ item.subject }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">报销金额</span>
              <span class="info-value strong">¥{{ item.amount.toFixed(2) }}</span>
            </div>
            <div class="info-row column">
              <span class="info-label">详细说明</span>
              <span class="info-value remark">{{ item.remark }}</span>
            </div>
          </div>
        </div>

        <!-- 附件 -->
        <div class="module">
          <div class="module-header">
            <div class="module-title"><span class="red-bar"></span>附件</div>
          </div>
          <div class="module-content">
            <div class="attach-group">
              <div class="attach-cat">发票</div>
              <div v-if="item.attachments.invoices.length" class="file-list">
                <div class="file-item clickable" v-for="(f, i) in item.attachments.invoices" :key="i" @click="openPreview(f)">
                  <el-icon class="file-icon" :size="16"><Document /></el-icon>
                  <span class="file-name">{{ f }}</span>
                  <el-icon class="file-view" :size="15"><View /></el-icon>
                </div>
              </div>
              <div v-else class="attach-empty">无</div>
            </div>

            <div class="attach-group">
              <div class="attach-cat">其他证明材料</div>
              <div v-if="item.attachments.others.length" class="file-list">
                <div class="file-item clickable" v-for="(f, i) in item.attachments.others" :key="i" @click="openPreview(f)">
                  <el-icon class="file-icon" :size="16"><Document /></el-icon>
                  <span class="file-name">{{ f }}</span>
                  <el-icon class="file-view" :size="15"><View /></el-icon>
                </div>
              </div>
              <div v-else class="attach-empty">无</div>
            </div>

            <div class="attach-group">
              <div class="attach-cat">支付凭证</div>
              <div v-if="item.attachments.vouchers.length" class="file-list">
                <div class="file-item clickable" v-for="(f, i) in item.attachments.vouchers" :key="i" @click="openPreview(f)">
                  <el-icon class="file-icon" :size="16"><Document /></el-icon>
                  <span class="file-name">{{ f }}</span>
                  <el-icon class="file-view" :size="15"><View /></el-icon>
                </div>
              </div>
              <div v-else class="attach-empty">无</div>
            </div>
          </div>
        </div>

        <!-- 收款信息 -->
        <div class="module">
          <div class="module-header">
            <div class="module-title"><span class="red-bar"></span>收款信息</div>
          </div>
          <div class="module-content">
            <div class="info-row">
              <span class="info-label">户名</span>
              <span class="info-value">{{ item.payee.name }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">开户行</span>
              <span class="info-value">{{ item.payee.bank }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">银行卡账号</span>
              <span class="info-value">{{ item.payee.cardNo }}</span>
            </div>
          </div>
        </div>

        <!-- 单据信息 -->
        <div class="module">
          <div class="module-header">
            <div class="module-title"><span class="red-bar"></span>单据信息</div>
          </div>
          <div class="module-content">
            <div class="info-row">
              <span class="info-label">单号</span>
              <span class="info-value">{{ item.no }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">提交时间</span>
              <span class="info-value">{{ item.submitAt }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 待审核：撤回 / 已撤回、未通过：重新编辑提交 -->
      <div v-if="['待审核', '已撤回', '未通过'].includes(item.status)" class="action-bar">
        <button v-if="item.status === '待审核'" class="reedit-btn outline" @click="onWithdraw">撤回</button>
        <button v-else class="reedit-btn" @click="goReedit">
          {{ item.status === '已撤回' ? '编辑提交' : '重新编辑提交' }}
        </button>
      </div>
    </template>

    <div v-else class="empty">未找到该报销记录</div>

    <!-- 附件预览 -->
    <div v-if="previewFile" class="preview-mask" @click="previewFile = null">
      <div class="preview-box" @click.stop>
        <div class="preview-head">
          <span class="preview-name">{{ previewFile }}</span>
          <el-icon class="preview-close" :size="20" @click="previewFile = null"><Close /></el-icon>
        </div>
        <div class="preview-body">
          <template v-if="isImage(previewFile)">
            <div class="preview-image">
              <el-icon :size="52"><Picture /></el-icon>
              <span>图片预览（mock）</span>
            </div>
          </template>
          <template v-else>
            <div class="preview-doc">
              <el-icon :size="52"><Document /></el-icon>
              <span>{{ fileExt(previewFile).toUpperCase() }} 文档预览（mock）</span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Document, View, Close, Picture } from '@element-plus/icons-vue'
import { reimbursements } from '../mock/reimbursements.js'

const route = useRoute()
const router = useRouter()
const goBack = () => router.back()

const item = computed(() =>
  reimbursements.find(r => String(r.id) === String(route.params.id))
)

const statusClass = (status) =>
  status === '未通过' || status === '已撤回' ? 'is-muted' : 'is-brand'

const goReedit = () =>
  router.push(`/mobile-reimbursement-submit?from=${item.value.id}`)

// 当前时间，格式 YYYY-MM-DD HH:mm
const nowStr = () => {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

// 待审核：撤回，退回至已撤回，可重新编辑提交
const onWithdraw = () => {
  const rec = item.value
  ElMessageBox.confirm(
    '撤回后该报销将退回至已撤回状态，您可重新编辑后再提交。是否继续？',
    '撤回报销',
    { confirmButtonText: '确认撤回', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    rec.status = '已撤回'
    rec.timeline = [...rec.timeline, { label: '已撤回', time: nowStr(), done: true }]
    ElMessage.success('已撤回，可重新编辑提交')
  }).catch(() => {})
}

// 附件预览
const previewFile = ref(null)
const openPreview = (name) => { previewFile.value = name }
const fileExt = (name) => name.split('.').pop().toLowerCase()
const isImage = (name) => ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt(name))
</script>

<style scoped>
.mobile-reimburse-detail {
  height: 100vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: #f5f5f7;
  padding-bottom: 88px;
  color: #1a1a1a;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
}

/* 顶部导航 */
.top-nav {
  background: linear-gradient(135deg, #a40035 0%, #7a0026 100%);
  padding: 12px 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  position: sticky;
  top: 0;
  z-index: 10;
}
.nav-title {
  font-size: 17px;
  font-weight: 600;
  flex: 1;
  text-align: center;
}
.nav-spacer {
  width: 40px;
}

/* 状态头 */
.status-head {
  background: white;
  padding: 20px;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  border-bottom: 1px solid #f0f0f0;
}
.status-amount {
  font-size: 28px;
  font-weight: 700;
  color: #a40035;
  font-variant-numeric: tabular-nums;
}
.status-text {
  font-size: 16px;
  font-weight: 600;
}
.status-text.is-brand {
  color: #a40035;
}
.status-text.is-muted {
  color: #999;
}
.reject-reason {
  background: #fafafa;
  color: #666;
  font-size: 13px;
  line-height: 1.6;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.page-content {
  padding: 12px;
}

/* 模块卡片 */
.module {
  background: white;
  border-radius: 10px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
.module-header {
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
}
.module-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 6px;
}
.red-bar {
  display: inline-block;
  width: 3px;
  height: 14px;
  background: #a40035;
  border-radius: 2px;
}
.module-content {
  padding: 4px 16px 8px;
}

/* 信息行 */
.info-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f7;
  font-size: 14px;
}
.info-row:last-child {
  border-bottom: none;
}
.info-row.column {
  flex-direction: column;
  gap: 8px;
}
.info-label {
  color: #999;
  flex-shrink: 0;
}
.info-value {
  color: #333;
  text-align: right;
}
.info-value.strong {
  color: #a40035;
  font-weight: 600;
}
.emp-no {
  font-size: 13px;
  color: #b8b8c0;
}
.info-value.remark {
  text-align: left;
  line-height: 1.6;
}

/* 附件 */
.attach-group {
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f7;
}
.attach-group:last-child {
  border-bottom: none;
}
.attach-cat {
  font-size: 14px;
  color: #999;
  margin-bottom: 10px;
}
.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f7f7f8;
  border-radius: 8px;
  padding: 10px 12px;
}
.file-item.clickable {
  cursor: pointer;
}
.file-item.clickable:active {
  background: #eeeef0;
}
.file-icon {
  color: #a40035;
  flex-shrink: 0;
}
.file-name {
  flex: 1;
  font-size: 13px;
  color: #333;
  word-break: break-all;
}
.file-view {
  color: #a40035;
  flex-shrink: 0;
}
.attach-empty {
  font-size: 13px;
  color: #c0c0c0;
}

/* 处理进度 */
.timeline {
  padding: 4px 0;
}
.tl-node {
  display: flex;
  gap: 12px;
  position: relative;
  padding-bottom: 18px;
}
.tl-node:last-child {
  padding-bottom: 0;
}
.tl-node::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 14px;
  bottom: 0;
  width: 1px;
  background: #e8e8ec;
}
.tl-node:last-child::before {
  display: none;
}
.tl-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #d8d8dc;
  margin-top: 3px;
  flex-shrink: 0;
  z-index: 1;
}
.tl-node.done .tl-dot {
  background: #a40035;
}
.tl-label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}
.tl-time {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.empty {
  text-align: center;
  color: #b8b8c0;
  font-size: 14px;
  padding: 60px 0;
}

/* 底部操作栏 */
.action-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
  background: white;
  border-top: 1px solid #f0f0f0;
}
.reedit-btn {
  width: 100%;
  background: #a40035;
  color: white;
  border: none;
  border-radius: 22px;
  padding: 13px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}
.reedit-btn:active {
  opacity: 0.85;
}
.reedit-btn.outline {
  background: white;
  color: #a40035;
  border: 1px solid #a40035;
}

/* 附件预览 */
.preview-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 100;
}
.preview-box {
  width: 100%;
  max-width: 340px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}
.preview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
}
.preview-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  word-break: break-all;
}
.preview-close {
  color: #999;
  flex-shrink: 0;
  cursor: pointer;
}
.preview-body {
  padding: 24px 16px 32px;
}
.preview-image,
.preview-doc {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #a40035;
  font-size: 13px;
  background: #f7f7f8;
  border-radius: 8px;
  padding: 40px 16px;
}
</style>
