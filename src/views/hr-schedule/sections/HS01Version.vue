<template>
  <DocShell
    :toc-items="tocItems"
    title="一、版本信息"
    subtitle="文档身份、负责人与适用范围"
    version="v5.0"
    date="2026-11-17"
    :breadcrumbs="breadcrumbs"
  >
    <div id="hs-ver" class="section">
      <div class="section-header">
        <h2>版本信息</h2>
        <DocCopyButton section-id="hs-ver" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">项</th><th>内容</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>文档</strong></td><td>人事中心 · 排班策略 · 产品需求说明</td></tr>
          <tr><td><strong>版本</strong></td><td>v5.0（排班策略 v5 独立重建首版；v3.x 为已归档对照）</td></tr>
          <tr><td><strong>日期</strong></td><td>2026-11-17（v3.16 品牌分类 · v3.17 按岗位汇总）</td></tr>
          <tr><td><strong>负责人</strong></td><td><strong>Lacus7</strong></td></tr>
          <tr><td><strong>读者</strong></td><td>运营 / 门店管理 / 排班负责人 / 研发 / 测试 / 员工（仅移动端部分）</td></tr>
          <tr>
            <td><strong>范围</strong></td>
            <td>
              空间与品牌分类（分类 → 门店两层）、时段与清单（班次 / 名额来源 / 档位）、轮与获取（直派 / 先到先得 / 申领审核 + 轮 + 余额去向）、
              排班结果、变化与求值、移动端。<strong>不含</strong>考勤打卡（只留挂载点）、排班结果表本身的结构改造、
              加班认定与薪酬计算。
            </td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>章节组织：</strong>按公司 PRD 模板分章 —— 一、版本信息 / 二、变更日志 / 三、文档说明 / 四、需求背景 /
        <strong>五、需求范围</strong>（现状 + 重构框架）/ <strong>六、功能详细说明</strong>（6.1–6.5）/ 七、附录。
        功能章内部用 <strong>6.x.y</strong> 分「看到什么 / 能做什么 / 校验与提示」。
        功能章按<strong>数据流顺序</strong>排：先配出时段与清单，再切成轮让人获取，结果写进唯一记录口，之后的变化写事实，最后是移动端。
      </div>
      <div class="note warn-note">
        <strong>与其他版本的关系：</strong>v1「排班策略」是<strong>现行生产逻辑</strong>，本版上线前不改动；
        v2「时段与名额」是<strong>已归档的对照</strong>（层与时段长在一起）；本版 v3 是<strong>设计基线</strong>。
        三者在原型里并存，评审时按此口径称呼，避免把 v1 当成旧版本。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'hs-ver', label: '一、版本信息' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事中心', to: '/docs/hr-schedule' },
  { label: '一、版本信息' }
]
</script>

<style scoped src="./doc-base.css"></style>
