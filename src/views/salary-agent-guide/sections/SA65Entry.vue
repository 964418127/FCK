<template>
  <DocShell
    :toc-items="tocItems"
    title="6.5 产品入口、使用链路与人工出口"
    subtitle="单独入口【薪酬咨询助手】（暂定名）；进入即锁定本人，一条链路到人工出口"
    version="v2.0"
    date="2026-11-24"
    :breadcrumbs="breadcrumbs"
  >
    <div id="sa-65-entry" class="section">
      <div class="section-header">
        <h2>产品入口</h2>
        <DocCopyButton section-id="sa-65-entry" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">项</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>入口形态</strong></td>
            <td>单独入口，不嵌在任何业务页面里 —— 员工从一个独立的【薪酬咨询助手】进入对话</td>
          </tr>
          <tr>
            <td><strong>名称</strong></td>
            <td>暂定「薪酬咨询助手」，对外名称上线前以渠道规划为准（挂 7.1 待决）</td>
          </tr>
          <tr>
            <td><strong>进入即锁定本人</strong></td>
            <td>围墙①在入口处就生效：登录态带入员工身份，查询对象不可选择、不可更改（6.2）</td>
          </tr>
          <tr>
            <td><strong>载体</strong></td>
            <td>不进本文档：挂在企业微信 / 员工端小程序 / App 取决于渠道规划与登录态打通方式（7.1 待决）</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>为什么单独入口：</strong>查询求证是一个完整动作 —— 员工带着疑问进来、带着答案或人工出口离开；
        单独入口让「咨询」与「查数」分开，也避免 Agent 的对话混进业务页面形成误导。
      </div>
    </div>

    <div id="sa-65-flow" class="section">
      <div class="section-header">
        <h2>使用链路</h2>
        <DocCopyButton section-id="sa-65-flow" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">环节</th><th>发生什么</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>① 进入</strong></td><td>员工打开【薪酬咨询助手】，登录态带入身份，查询对象锁定为本人</td></tr>
          <tr><td><strong>② 提问</strong></td><td>自然语言提问，不需要先选类别</td></tr>
          <tr><td><strong>③ 定位与取数</strong></td><td>定位到具体薪酬项（按岗位底账 7.2 – 7.4），走对应取数通道：工资条 / 本人业务事实 / 政策命中值（6.1）</td></tr>
          <tr><td><strong>④ 按深度作答</strong></td><td>按 6.3 分层作答：L1 走完整求证链（6.4）；L2 只报结论；L3 只给账户级三数；层外追问走兜底句</td></tr>
          <tr><td><strong>⑤ 人工出口</strong></td><td>核实后仍不服（含求证后真有出入），显式转人工，携带下方条目</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>研发 / 业务对链路的共识：</strong>③④的取数通道、分层与应答口径全部由本文档 6.1 – 6.4 决定，
        Agent 不在链路里自由发挥 —— 口径之外的问题一律走兜底句或人工出口。
      </div>
    </div>

    <div id="sa-65-escape" class="section">
      <div class="section-header">
        <h2>人工出口</h2>
        <DocCopyButton section-id="sa-65-escape" />
      </div>
      <p class="doc-p">
        员工核实后仍不服时（含求证链还原后确有出入的情形），Agent 不受理申诉、不解释口径，
        只提供显式转人工路径，携带以下条目：
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">条目</th><th>内容</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>员工</strong></td><td>登录人（系统带入，不需要员工自报）</td></tr>
          <tr><td><strong>工资单编号</strong></td><td>被质疑的那张工资条</td></tr>
          <tr><td><strong>质疑项</strong></td><td>具体的收入项或扣缴项名称</td></tr>
          <tr><td><strong>已查内容</strong></td><td>Agent 已给出的金额、依据与求证还原结果，供人事接手时对账</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>边界：</strong>人工出口是查证的终点、人事排查的起点 —— 不把冲突原样挡回给员工，
        也不在 Agent 里承诺处理结果与时限。求证链「有出入」的情形（6.4）天然携带差异明细，
        是所有转人工里信息最全的一类。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'sa-65-entry', label: '产品入口' },
  { id: 'sa-65-flow', label: '使用链路' },
  { id: 'sa-65-escape', label: '人工出口' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '模块化薪酬', to: '/docs/salary-agent' },
  { label: '六、功能详细说明' },
  { label: '6.5 产品入口、使用链路与人工出口' }
]
</script>

<style scoped src="./doc-base.css"></style>
