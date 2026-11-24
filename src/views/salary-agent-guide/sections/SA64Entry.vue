<template>
  <DocShell
    :toc-items="tocItems"
    title="6.4 产品入口与使用链路"
    subtitle="单独入口【薪酬咨询助手】（暂定名）；进入即锁定本人，一条链路到人工出口"
    version="v1.1"
    date="2026-11-24"
    :breadcrumbs="breadcrumbs"
  >
    <div id="sa-64-entry" class="section">
      <div class="section-header">
        <h2>产品入口</h2>
        <DocCopyButton section-id="sa-64-entry" />
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

    <div id="sa-64-flow" class="section">
      <div class="section-header">
        <h2>使用链路</h2>
        <DocCopyButton section-id="sa-64-flow" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">环节</th><th>发生什么</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>① 进入</strong></td><td>员工打开【薪酬咨询助手】，登录态带入身份，查询对象锁定为本人</td></tr>
          <tr><td><strong>② 提问</strong></td><td>自然语言提问，不需要先选类别</td></tr>
          <tr><td><strong>③ 路由</strong></td><td>按问题类型取数：政策类走取值引擎（命中值 + 依据）；明细类走本人工资条原样；常乐豆走账户级汇总</td></tr>
          <tr><td><strong>④ 应答</strong></td><td>按 6.3 口径作答：只陈述事实与命中依据，不解释来历、不预测、不评价</td></tr>
          <tr><td><strong>⑤ 人工出口</strong></td><td>核实后仍不服，显式转人工，携带员工 / 工资单编号 / 质疑项 / 已查内容（6.3）</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>研发 / 业务对链路的共识：</strong>③的路由规则与④的应答口径全部由本文档 6.1 – 6.3 决定，
        Agent 不在链路里自由发挥 —— 口径之外的问题一律走兜底句或人工出口。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'sa-64-entry', label: '产品入口' },
  { id: 'sa-64-flow', label: '使用链路' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '模块化薪酬', to: '/docs/salary-agent' },
  { label: '六、功能详细说明' },
  { label: '6.4 产品入口与使用链路' }
]
</script>

<style scoped src="./doc-base.css"></style>
