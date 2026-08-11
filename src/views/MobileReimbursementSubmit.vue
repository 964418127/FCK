<template>
  <div class="mobile-reimburse-submit">
    <!-- 顶部导航 -->
    <div class="top-nav">
      <el-button type="text" @click="goBack" style="color: white;">
        <el-icon :size="18"><ArrowLeft /></el-icon>
      </el-button>
      <div class="nav-title">{{ isReedit ? '重新提交报销' : '申请报销' }}</div>
      <el-button type="text" @click="goBack" style="color: white;">
        <el-icon :size="18"><Close /></el-icon>
      </el-button>
    </div>

    <div class="page-content">
      <!-- 报销总额 -->
      <div class="total-card">
        <div class="total-left">
          <div class="total-label">报销总额</div>
          <div class="total-count">共 {{ forms.length }} 笔</div>
        </div>
        <div class="total-amount">¥{{ totalAmount.toFixed(2) }}</div>
      </div>

      <!-- 提示 -->
      <div class="tip-banner">
        <el-icon class="tip-icon" :size="15"><InfoFilled /></el-icon>
        <span>当发起多起报销时，请确保费用所属主体、收款方信息保持一致，否则无法提交。</span>
      </div>

      <!-- 报销申请（动态多笔） -->
      <div class="module" v-for="(form, index) in forms" :key="form.key">
        <div class="module-header">
          <div class="module-title">
            <span class="red-bar"></span>
            报销申请（{{ index + 1 }}）
          </div>
          <el-button
            v-if="forms.length > 1"
            type="text"
            class="remove-btn"
            @click="removeForm(index)"
          >
            <el-icon :size="16"><Delete /></el-icon>
          </el-button>
        </div>

        <div class="module-content">
          <!-- 报销人（只读，系统带出） -->
          <div class="field">
            <label class="field-label">报销人</label>
            <div class="field-readonly">{{ employee.name }}<span class="emp-no">（工号 {{ employee.no }}）</span></div>
          </div>

          <!-- 所属部门（只读） -->
          <div class="field">
            <label class="field-label">所属部门</label>
            <div class="field-readonly">{{ employee.department }}</div>
          </div>

          <!-- 报销类型（仅差旅费） -->
          <div class="field">
            <label class="field-label required">报销类型</label>
            <el-select
              v-model="form.type"
              placeholder="请选择"
              class="field-control"
            >
              <el-option
                v-for="t in typeOptions"
                :key="t"
                :label="t"
                :value="t"
              />
            </el-select>
          </div>

          <!-- 费用发生日期 -->
          <div class="field">
            <label class="field-label required">费用发生日期</label>
            <el-date-picker
              v-model="form.date"
              type="date"
              placeholder="请选择"
              value-format="YYYY-MM-DD"
              class="field-control"
            />
          </div>

          <!-- 费用所属主体（只读，读取员工合同主体） -->
          <div class="field">
            <label class="field-label required">费用所属主体</label>
            <div class="field-readonly">{{ employee.contractSubject }}</div>
          </div>

          <!-- 报销金额 -->
          <div class="field">
            <label class="field-label required">报销金额(元)</label>
            <el-input
              v-model="form.amount"
              type="number"
              placeholder="请输入"
              class="field-control"
            />
          </div>

          <!-- 上传附件 -->
          <div class="field">
            <label class="field-label required">上传附件</label>

            <div class="upload-block">
              <div class="upload-row" @click="mockUpload(form, 'invoices')">
                <div class="upload-text required">
                  发票 <span class="upload-hint">(支持智能识别信息)</span>
                </div>
                <el-icon class="upload-add" :size="22"><CirclePlus /></el-icon>
              </div>
              <div v-if="form.invoices.length" class="file-list">
                <div class="file-item" v-for="(f, i) in form.invoices" :key="i">
                  <el-icon class="file-icon" :size="15"><Document /></el-icon>
                  <span class="file-name preview-link" @click="openPreview(f.name)">{{ f.name }}</span>
                  <el-icon class="file-del" :size="15" @click.stop="removeFile(form, 'invoices', i)"><Close /></el-icon>
                </div>
              </div>
            </div>

            <div class="upload-block">
              <div class="upload-row" @click="mockUpload(form, 'others')">
                <div class="upload-text">其他证明材料</div>
                <el-icon class="upload-add" :size="22"><CirclePlus /></el-icon>
              </div>
              <div v-if="form.others.length" class="file-list">
                <div class="file-item" v-for="(f, i) in form.others" :key="i">
                  <el-icon class="file-icon" :size="15"><Document /></el-icon>
                  <span class="file-name preview-link" @click="openPreview(f.name)">{{ f.name }}</span>
                  <el-icon class="file-del" :size="15" @click.stop="removeFile(form, 'others', i)"><Close /></el-icon>
                </div>
              </div>
            </div>

            <div class="upload-block">
              <div class="upload-row" @click="mockUpload(form, 'vouchers')">
                <div class="upload-text required">
                  支付凭证 <span class="upload-hint">(微信支付或者支付宝支付截图)</span>
                </div>
                <el-icon class="upload-add" :size="22"><CirclePlus /></el-icon>
              </div>
              <div v-if="form.vouchers.length" class="file-list">
                <div class="file-item" v-for="(f, i) in form.vouchers" :key="i">
                  <el-icon class="file-icon" :size="15"><Document /></el-icon>
                  <span class="file-name preview-link" @click="openPreview(f.name)">{{ f.name }}</span>
                  <el-icon class="file-del" :size="15" @click.stop="removeFile(form, 'vouchers', i)"><Close /></el-icon>
                </div>
              </div>
            </div>
          </div>

          <!-- 详细说明 -->
          <div class="field">
            <label class="field-label required">详细说明</label>
            <el-input
              v-model="form.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入"
              class="field-control"
            />
          </div>
        </div>
      </div>

      <!-- 新增报销 -->
      <button class="add-btn" @click="addForm">新增报销</button>

      <!-- 我的收款信息（只读） -->
      <div class="module">
        <div class="module-header">
          <div class="module-title">
            <span class="red-bar"></span>
            我的收款信息
          </div>
        </div>
        <div class="module-content">
          <div class="field">
            <label class="field-label">户名</label>
            <div class="field-readonly">{{ payee.name }}</div>
          </div>
          <div class="field">
            <label class="field-label">开户行</label>
            <div class="field-readonly">{{ payee.bank }}</div>
          </div>
          <div class="field">
            <label class="field-label">银行卡账号</label>
            <div class="field-readonly">{{ payee.cardNo }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部提交 -->
    <div class="submit-bar">
      <button class="submit-btn" @click="handleSubmit">提交</button>
    </div>

    <!-- 附件预览 -->
    <div v-if="previewFile" class="preview-mask" @click="previewFile = null">
      <div class="preview-box" @click.stop>
        <div class="preview-head">
          <span class="preview-name">{{ previewFile }}</span>
          <el-icon class="preview-close" :size="20" @click="previewFile = null"><Close /></el-icon>
        </div>
        <div class="preview-body">
          <div class="preview-ph">
            <el-icon :size="52"><Picture v-if="isImage(previewFile)" /><Document v-else /></el-icon>
            <span>{{ isImage(previewFile) ? '图片预览（mock）' : fileExt(previewFile).toUpperCase() + ' 文档预览（mock）' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft, Close, InfoFilled, CirclePlus, Delete, Document, Picture
} from '@element-plus/icons-vue'
import { reimbursements } from '../mock/reimbursements.js'

const route = useRoute()
const router = useRouter()
const goBack = () => router.back()

// 被打回重新编辑：携带原单据 id
const fromId = route.query.from
const isReedit = computed(() => !!fromId)

// 模拟员工信息（系统带出）
const employee = {
  name: '张三',
  no: '100235',
  department: '总部 / 信息技术部',
  contractSubject: '成都常乐健康管理有限公司'
}

// 模拟收款信息（默认员工收款人信息）
const payee = {
  name: '张三',
  bank: '兴业银行',
  cardNo: '6229 0843 3251 7097 10'
}

const typeOptions = ['差旅费']

let seq = 0
const createForm = () => ({
  key: ++seq,
  type: '差旅费',
  date: '',
  amount: '',
  invoices: [],
  others: [],
  vouchers: [],
  remark: ''
})

// 从被打回单据预填
const createFormFrom = (rec) => ({
  key: ++seq,
  type: rec.type,
  date: rec.expenseDate,
  amount: String(rec.amount),
  invoices: rec.attachments.invoices.map(name => ({ name })),
  others: rec.attachments.others.map(name => ({ name })),
  vouchers: rec.attachments.vouchers.map(name => ({ name })),
  remark: rec.remark
})

const initForms = () => {
  const rec = fromId && reimbursements.find(r => String(r.id) === String(fromId))
  return rec ? [createFormFrom(rec)] : [createForm()]
}

const forms = reactive(initForms())

const totalAmount = computed(() =>
  forms.reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0)
)

const addForm = () => forms.push(createForm())
const removeForm = (index) => forms.splice(index, 1)

// 模拟上传：点击 + 追加一个带文件名的附件
const mockFileNames = {
  invoices: ['增值税发票.pdf', '高铁票.pdf', '出租车发票.jpg', '酒店住宿发票.pdf'],
  others: ['行程单.pdf', '出差审批单.pdf', '费用说明.docx'],
  vouchers: ['微信支付截图.png', '支付宝支付截图.png', '银行卡支付截图.png']
}

const mockUpload = (form, field) => {
  const pool = mockFileNames[field]
  const name = pool[form[field].length % pool.length]
  form[field].push({ name })
  ElMessage.success('已添加附件（mock）')
}

const removeFile = (form, field, index) => {
  form[field].splice(index, 1)
}

// 附件预览
const previewFile = ref(null)
const openPreview = (name) => { previewFile.value = name }
const fileExt = (name) => name.split('.').pop().toLowerCase()
const isImage = (name) => ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt(name))

// 当前时间，格式 YYYY-MM-DD HH:mm
const nowStr = () => {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

const handleSubmit = () => {
  for (let i = 0; i < forms.length; i++) {
    const f = forms[i]
    if (!f.type || !f.date || !f.amount) {
      ElMessage.warning(`报销申请（${i + 1}）请填写完整必填项`)
      return
    }
    if (!f.invoices.length) {
      ElMessage.warning(`报销申请（${i + 1}）请上传发票`)
      return
    }
    if (!f.vouchers.length) {
      ElMessage.warning(`报销申请（${i + 1}）请上传支付凭证`)
      return
    }
    if (!f.remark) {
      ElMessage.warning(`报销申请（${i + 1}）请填写详细说明`)
      return
    }
  }
  // 重新提交：回写原单据，恢复为待审核
  if (fromId) {
    const rec = reimbursements.find(r => String(r.id) === String(fromId))
    if (rec) {
      const f0 = forms[0]
      rec.type = f0.type
      rec.expenseDate = f0.date
      rec.amount = parseFloat(f0.amount) || rec.amount
      rec.remark = f0.remark
      rec.attachments = {
        invoices: f0.invoices.map(x => x.name),
        others: f0.others.map(x => x.name),
        vouchers: f0.vouchers.map(x => x.name)
      }
      rec.status = '待审核'
      rec.submitAt = nowStr()
      rec.timeline = [...rec.timeline, { label: '重新提交', time: nowStr(), done: true }]
      delete rec.rejectReason
    }
  }
  ElMessage.success(isReedit.value ? '已重新提交，等待审核' : '提交成功，等待审核')
  router.push('/mobile-reimbursement-list')
}
</script>

<style scoped>
.mobile-reimburse-submit {
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

.page-content {
  padding: 12px;
}

/* 报销总额 */
.total-card {
  background: white;
  border-radius: 10px;
  padding: 18px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
.total-label {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}
.total-count {
  font-size: 12px;
  color: #999;
}
.total-amount {
  font-size: 26px;
  font-weight: 700;
  color: #a40035;
  font-variant-numeric: tabular-nums;
}

/* 提示条 */
.tip-banner {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  background: #fff0f4;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 12px;
  font-size: 12px;
  line-height: 1.6;
  color: #a40035;
}
.tip-icon {
  flex-shrink: 0;
  margin-top: 1px;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
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
.remove-btn {
  color: #c0c0c0;
  padding: 0;
}
.module-content {
  padding: 4px 16px 8px;
}

/* 字段 */
.field {
  padding: 14px 0;
  border-bottom: 1px solid #f5f5f7;
}
.field:last-child {
  border-bottom: none;
}
.field-label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 10px;
}
.field-label.required::before {
  content: '*';
  color: #a40035;
  margin-right: 2px;
}
.field-readonly {
  font-size: 15px;
  color: #999;
}
.emp-no {
  font-size: 13px;
  color: #b8b8c0;
}
.field-control {
  width: 100%;
}

/* 上传行 */
.upload-block {
  border-bottom: 1px solid #f7f7f8;
}
.upload-block:last-child {
  border-bottom: none;
}
.upload-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  cursor: pointer;
}
.upload-text {
  font-size: 14px;
  color: #666;
}
.upload-text.required::before {
  content: '*';
  color: #a40035;
  margin-right: 2px;
}
.upload-hint {
  font-size: 12px;
  color: #b8b8c0;
}
.upload-add {
  color: #a40035;
  flex-shrink: 0;
}
.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 0 10px;
}
.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f7f7f8;
  border-radius: 8px;
  padding: 8px 10px;
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
.preview-link {
  cursor: pointer;
}
.preview-link:active {
  color: #a40035;
}
.file-del {
  color: #b8b8c0;
  flex-shrink: 0;
  cursor: pointer;
}

/* 新增报销 */
.add-btn {
  width: 100%;
  background: #fff0f4;
  color: #a40035;
  border: none;
  border-radius: 10px;
  padding: 14px;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  cursor: pointer;
}
.add-btn:active {
  opacity: 0.8;
}

/* 底部提交栏 */
.submit-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
  background: white;
  border-top: 1px solid #f0f0f0;
}
.submit-btn {
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
.submit-btn:active {
  opacity: 0.85;
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
.preview-ph {
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
