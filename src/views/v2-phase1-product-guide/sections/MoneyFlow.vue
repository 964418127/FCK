<template>
      <div id="money-flow" class="section">
        <h2>十、金额流转泳道图</h2>

        <div class="card">
          <h3>月度金额流转全景（v2-1）</h3>
          <div class="note" style="background: hsl(var(--warning) / 0.05); border-left: 3px solid hsl(var(--warning)); margin-bottom: 16px; font-size: 13px;">
            <strong>v2-1 变化点：</strong>社保/公积金<strong>金额从老系统接口读取</strong>（图中用<strong>橙色</strong>标注），商业险<strong>默认机制不显示</strong>，<strong>无员工福利保障关系建立</strong>环节。
          </div>
          <div class="swimlane-container">
            <div class="swimlane-row">
              <div class="swimlane-lane">顾客<br/>客户</div>
              <div class="swimlane-content">
                <div class="flow-step-inline primary">支付服务费用</div>
              </div>
            </div>
            <div class="swimlane-arrow">↓</div>
            <div class="swimlane-row">
              <div class="swimlane-lane">主体公司<br/>（含门店）</div>
              <div class="swimlane-content">
                <div class="flow-step-inline">收入 → 工资单系统</div>
                <div class="flow-step-inline muted">主体公司按业绩归属归集营收</div>
              </div>
            </div>
            <div class="swimlane-arrow">↓</div>
            <div class="swimlane-row">
              <div class="swimlane-lane">工资单<br/>系统</div>
              <div class="swimlane-content">
                <div class="flow-step-inline">按员工 + 主体 + 周期 创建工资单</div>
                <div class="flow-step-inline muted">匹配薪酬模板 + 发放策略</div>
                <div class="flow-step-inline">第1级 → 第2级 → <span style="color: hsl(var(--warning)); font-weight: 600;">系统项（社保/公积金从老系统接口读取）</span> → 负工资处理（条件触发）</div>
              </div>
            </div>
            <div class="swimlane-arrow">↓</div>
            <div class="swimlane-row highlight-row">
              <div class="swimlane-lane">工资条<br/>(每员工 1~N 条)</div>
              <div class="swimlane-content">
                <div class="flow-step-inline primary">→ 员工（实发 = 收入 - 扣缴 - 代扣）</div>
                <div class="flow-step-inline">→ 第三方（代扣个税，月末汇算补退）</div>
                <div class="flow-step-inline"><span style="color: hsl(var(--warning)); font-weight: 600;">→ 第三方（代扣社保/公积金，个人部分，从老系统接口读取）</span></div>
                <div class="flow-step-inline muted">→ 主体公司（公司部分社保/公积金，由老系统记账，不进员工工资条）</div>
                <div class="flow-step-inline muted">→ 第三方（商业险，默认机制，由老系统/财务单独记账，不进员工工资条）</div>
                <div class="flow-step-inline muted">→ 负工资账户（应发 &gt; 0 时抵扣；应发 &lt; 0 时累加到余额）</div>
                <div class="flow-step-inline muted">→ 常乐豆账户（仅全职，保底获豆入账 / 离职提现）</div>
              </div>
            </div>
            <div class="swimlane-arrow">↓</div>
            <div class="swimlane-row split-row">
              <div class="swimlane-lane">员工 / 第三方<br/>收款方</div>
              <div class="swimlane-content split-content">
                <div class="split-item">
                  <div class="split-title">员工</div>
                  <div class="split-desc">实发工资（含现金 + 常乐豆）</div>
                </div>
                <div class="split-item">
                  <div class="split-title">税务局</div>
                  <div class="split-desc">代扣个税 + 汇算补退</div>
                </div>
                <div class="split-item">
                  <div class="split-title">社保局 / 公积金中心</div>
                  <div class="split-desc">个人部分（老系统接口） + 公司部分（老系统记账）</div>
                </div>
                <div class="split-item">
                  <div class="split-title">保险公司</div>
                  <div class="split-desc">商业险（默认机制，公司全额，老系统/财务记账）</div>
                </div>
                <div class="split-item">
                  <div class="split-title">百旺服务</div>
                  <div class="split-desc">第三方税务服务费</div>
                </div>
              </div>
            </div>
          </div>

          <div class="note">
            <strong>关键流转规则：</strong>
            <ul>
              <li>工资条上的"<strong>公司部分</strong>"（社保/公积金公司部分、商业险）<strong>不进入员工工资条</strong>，由老系统/财务单独记账</li>
              <li>工资条上的"<strong>代扣</strong>"是员工负担部分（社保/公积金个人部分<strong>从老系统接口读取</strong>，从实发中扣除）</li>
              <li><strong>代扣个税</strong>通过百旺服务计算：全职直接算当月（按月度应税收入），非全日制/兼职按累计应税收入（<strong>不含已预扣</strong>，否则会重复计税）算累计应纳 - 已预扣合计 = 补缴/退税</li>
              <li><strong>常乐豆</strong>仅全职员工有；发放 → 消费 → 离职提现，全链路不进工资条扣款</li>
              <li><strong>商业险</strong>采用默认机制，<strong>不进入员工工资条</strong>，<strong>不显示在福利明细</strong>（v2-1 不开发福利明细页）</li>
            </ul>
          </div>
        </div>

        <div class="card">
          <h3>典型场景：非全日制/兼职多主体月度结算（1 门店 = 1 主体）</h3>
          <div class="swimlane-container">
            <div class="swimlane-row">
              <div class="swimlane-lane">门店A</div>
              <div class="swimlane-content">
                <div class="flow-step-inline">每周计件 + 加班 - 投诉 → 预扣个税（3%×4周）</div>
                <div class="flow-step-inline muted">门店A 业绩归集 → 门店A 主体</div>
              </div>
            </div>
            <div class="swimlane-arrow">↓</div>
            <div class="swimlane-row">
              <div class="swimlane-lane">门店B</div>
              <div class="swimlane-content">
                <div class="flow-step-inline">每周计件 + 加班 → 预扣个税（3%×4周）</div>
                <div class="flow-step-inline muted">门店B 业绩归集 → 门店B 主体</div>
              </div>
            </div>
            <div class="swimlane-arrow">↓ 月末 ↓</div>
            <div class="swimlane-row highlight-row">
              <div class="swimlane-lane">百旺服务<br/>(倒序申报)</div>
              <div class="swimlane-content">
                <div class="flow-step-inline">门店A（应税 22400）先申报 → 计算应纳 1800 → 补缴 = 1800 - 672 = 1128</div>
                <div class="flow-step-inline">门店B（应税 12600）后申报 → 可能跳档 → 计算应纳 1200 → 补缴 = 1200 - 378 = 822</div>
              </div>
            </div>
            <div class="swimlane-arrow">↓</div>
            <div class="swimlane-row split-row">
              <div class="swimlane-lane">员工工资条<br/>(每门店最后一周)</div>
              <div class="swimlane-content split-content">
                <div class="split-item">
                  <div class="split-title">门店A 第4周</div>
                  <div class="split-desc">含 -177（预扣） + -1128（补缴）</div>
                </div>
                <div class="split-item">
                  <div class="split-title">门店B 第4周</div>
                  <div class="split-desc">含 -108（预扣） + -822（补缴）</div>
                </div>
              </div>
            </div>
          </div>
          <div class="note">
            <strong>说明：</strong>每门店独立结算，<strong>不抵扣</strong>；门店A 补缴从门店A 最后一周实发扣；门店B 补缴从门店B 最后一周实发扣。
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { ElMessage } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import FloatingToc from '../components/FloatingToc.vue'

// ===== 悬浮目录 =====
const tocItems = [
  { id: 'version', label: '版本日志' },
  { id: 'terms', label: '名词解释' },
  { id: 'taxable-income-rule', label: '应税收入计算规则' },
  { id: 'summary', label: '一、整体概述' },
  { id: 'welfare-data-source', label: '二、福利数据来源（老系统）' },
  { id: 'bean', label: '三、常乐豆规则' },
  { id: 'template', label: '四、岗位薪酬模板' },
  { id: 'dynamic-items', label: '四·附录：动态薪酬项 / 扣缴项' },
  { id: 'items', label: '五、薪酬项范围' },
  { id: 'calculation', label: '六、计算节点与时机' },
  { id: 'examples', label: '七、计算示例' },
  { id: 'payroll', label: '八、工资条组装' },
  { id: 'scenarios', label: '九、典型业务场景决策树' },
  { id: 'money-flow', label: '十、金额流转泳道图' }
]

const copyToClipboard = async () => {
  const element = document.querySelector('.content-section')
  if (!element) {
    ElMessage.error('复制失败：未找到内容区域')
    return
  }
  try {
    const htmlContent = element.innerHTML
    const textContent = element.innerText
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const clipboardItem = new ClipboardItem({
      'text/html': blob,
      'text/plain': new Blob([textContent], { type: 'text/plain' })
    })
    await navigator.clipboard.write([clipboardItem])
    ElMessage.success('已复制到剪贴板，可直接粘贴到飞书')
  } catch (error) {
    try {
      await navigator.clipboard.writeText(element.innerText)
      ElMessage.success('已复制纯文本到剪贴板（部分格式可能丢失）')
    } catch {
      ElMessage.error('复制失败，请手动选择内容复制')
    }
  }
}

const exportToPdf = async () => {
  const element = document.querySelector('.content-section')
  if (!element) {
    ElMessage.error('导出失败：未找到内容区域')
    return
  }
  try {
    const canvas = await html2canvas(element, { scale: 2, useCORS: true })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 190
    const pageHeight = 277
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 10

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }
    pdf.save('V2阶段1产品说明.pdf')
    ElMessage.success('PDF 导出成功')
  } catch (error) {
    ElMessage.error('导出失败，请重试')
    console.error(error)
  }
}
</script>

<style scoped>
.v2-phase1-guide { padding: 0; max-width: 1400px; margin: 0 auto; }

/* ===== 文档 Hero 区 ===== */
.doc-hero {
  background: linear-gradient(135deg, hsl(var(--primary) / 0.06) 0%, hsl(var(--primary) / 0.02) 100%);
  border: 1px solid hsl(var(--primary) / 0.12);
  border-radius: 12px;
  padding: 24px 28px;
  margin: 20px 0 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  overflow: hidden;
}

.doc-hero::before {
  content: '';
  position: absolute;
  top: -80px;
  right: -80px;
  width: 240px;
  height: 240px;
  background: radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 65%);
  pointer-events: none;
}

.doc-hero-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-hover)) 100%);
  color: hsl(var(--primary-foreground));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px hsl(var(--primary) / 0.25);
  z-index: 1;
}

.doc-hero-body {
  flex: 1;
  min-width: 0;
  z-index: 1;
}

.doc-hero-title-row {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;
}

.doc-hero-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: hsl(var(--foreground));
  line-height: 1.2;
}

.doc-hero-version {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  font-size: 12px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 10px;
  white-space: nowrap;
}

.doc-hero-date {
  color: hsl(var(--muted-foreground));
  font-size: 13px;
  white-space: nowrap;
}

.doc-hero-tip {
  margin: 0;
  color: hsl(var(--muted-foreground));
  font-size: 14px;
  line-height: 1.5;
}

.doc-hero-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  z-index: 1;
  align-self: flex-start;
}

.content-section {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  padding: 24px 28px;
}

.section {
  margin-bottom: 40px;
}

.section h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid hsl(var(--primary));
}

.section h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 20px 0 12px 0;
  color: hsl(var(--foreground));
}

.callout { line-height: 1.6; }
.callout strong { color: hsl(var(--warning)); }

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  margin: 12px 0;
}

.data-table th,
.data-table td {
  border: 1px solid hsl(var(--border));
  padding: 8px 12px;
  text-align: left;
  vertical-align: top;
}

.data-table th {
  background: hsl(var(--muted) / 0.5);
  font-weight: 600;
  color: hsl(var(--foreground));
}

.card {
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  padding: 16px 20px;
  margin: 12px 0;
  background: hsl(var(--background));
}

.note {
  background: hsl(var(--muted) / 0.3);
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 13px;
  line-height: 1.7;
  margin: 8px 0;
}

/* ===== 8 步全链路架构图 ===== */
.architecture-card h2 {
  margin: 0 0 16px 0;
  font-size: 18px;
  border-bottom: none;
  padding-bottom: 0;
}

.architecture-diagram {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 0;
}

.arch-layer {
  width: 100%;
  max-width: 700px;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.arch-layer-title {
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin-bottom: 8px;
}

.arch-arrow {
  font-size: 20px;
  color: hsl(var(--muted-foreground));
  line-height: 1;
}

/* ===== 计算节点流程图 ===== */
.flow {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 16px 0;
  overflow-x: auto;
}

.flow-step {
  flex: 1;
  min-width: 180px;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  padding: 16px;
}

.flow-step .step-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
  color: hsl(var(--primary));
}

.flow-step .step-content {
  font-size: 13px;
  line-height: 1.7;
  color: hsl(var(--foreground));
}

.flow-step .step-content p { margin: 4px 0; }
.flow-step .step-content ul { margin: 6px 0; padding-left: 16px; }
.flow-step .step-content li { margin: 2px 0; }
.flow-step .step-content strong { color: hsl(var(--foreground)); }
.flow-step .step-content em { color: hsl(var(--muted-foreground)); font-style: normal; }

.flow-arrow {
  font-size: 24px;
  color: hsl(var(--muted-foreground));
  line-height: 80px;
  flex-shrink: 0;
}

.feature-list {
  margin: 12px 0;
  padding-left: 20px;
}

.feature-list li {
  margin-bottom: 8px;
}

.example {
  font-size: 14px;
}

.calc-steps {
  margin: 12px 0;
  padding-left: 20px;
}

.calc-steps li {
  margin-bottom: 6px;
}

.highlight {
  color: hsl(var(--primary));
  font-weight: 600;
}

/* 决策树 */
.decision-tree {
  font-size: 14px;
  line-height: 1.8;
}

.tree-node {
  display: inline-block;
  background: hsl(var(--muted) / 0.3);
  border-radius: 6px;
  padding: 8px 14px;
  font-weight: 500;
  margin: 4px 0;
}

.tree-node.root {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  font-weight: 600;
  font-size: 15px;
  border-radius: 8px;
}

.tree-children {
  margin-left: 20px;
  border-left: 2px dashed hsl(var(--border));
  padding-left: 16px;
  margin-top: 8px;
  margin-bottom: 8px;
}

.tree-question {
  color: hsl(var(--foreground));
  font-style: italic;
  font-weight: 500;
  margin: 10px 0 6px 0;
  font-size: 14px;
}

.tree-question::before {
  content: '◆ ';
  color: hsl(var(--primary));
  font-style: normal;
}

.tree-leaf {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
  padding: 6px 12px;
  margin: 4px 0;
  display: inline-block;
  font-size: 13px;
}

.tree-leaf.primary {
  background: hsl(var(--primary) / 0.1);
  border-color: hsl(var(--primary));
  color: hsl(var(--primary));
  font-weight: 600;
}

.tree-leaf.muted {
  color: hsl(var(--muted-foreground));
  font-style: italic;
}

.tree-leaf-sub {
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  padding: 2px 0;
  display: block;
}

/* 泳道图 */
.swimlane-container {
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  overflow: hidden;
  margin: 16px 0;
}

.swimlane-row {
  display: flex;
  border-bottom: 1px solid hsl(var(--border));
}

.swimlane-row:last-child {
  border-bottom: none;
}

.swimlane-row.highlight-row {
  background: hsl(var(--primary) / 0.05);
}

.swimlane-row.split-row {
  background: hsl(var(--muted) / 0.3);
}

.swimlane-lane {
  width: 100px;
  flex-shrink: 0;
  background: hsl(var(--primary) / 0.1);
  padding: 16px 8px;
  text-align: center;
  font-weight: 600;
  font-size: 13px;
  border-right: 1px solid hsl(var(--border));
  display: flex;
  align-items: center;
  justify-content: center;
}

.swimlane-content {
  flex: 1;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.swimlane-arrow {
  text-align: center;
  font-size: 18px;
  color: hsl(var(--muted-foreground));
  padding: 4px 0;
  background: hsl(var(--muted) / 0.2);
}

.flow-step-inline {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 13px;
  display: inline-block;
  align-self: flex-start;
}

.flow-step-inline.primary {
  background: hsl(var(--primary) / 0.15);
  border-color: hsl(var(--primary));
  color: hsl(var(--primary));
  font-weight: 600;
}

.flow-step-inline.muted {
  color: hsl(var(--muted-foreground));
  background: transparent;
  border-style: dashed;
}

.split-content {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 8px;
}

.split-item {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
  padding: 8px 12px;
}

.split-title {
  font-weight: 600;
  font-size: 13px;
  color: hsl(var(--primary));
  margin-bottom: 2px;
}

.split-desc {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  line-height: 1.5;
}
</style>
</template>
