<template>
  <DocShell
    :toc-items="tocItems"
    title="五、需求范围"
    subtitle="做什么 / 不做什么，以及三个对象的分工"
    version="v1.0"
    date="2026-11-10"
    :breadcrumbs="breadcrumbs"
  >
    <div id="gp-scope-do" class="section">
      <div class="section-header">
        <h2>做什么 / 不做什么</h2>
        <DocCopyButton section-id="gp-scope-do" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 140px;">范围</th><th>内容</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>本版要做</strong></td>
            <td>
              ① 参数管理：新增 / 编辑 / 启停 / 删除，八类简单值 + 数据表；<br />
              ② 数据表：列的增删改（名字与类型）、数据录入与导入导出、配置期试算；<br />
              ③ 引用与取值：薪酬项里配「取哪一列」与「用哪些条件查」，含命中与兜底规则。
            </td>
          </tr>
          <tr>
            <td><strong>本版不做</strong></td>
            <td>
              ① 参数的生效日期与多版本（改完即生效，不追溯已算结果）；<br />
              ② 参数配置的审批流（只按角色给入口）；<br />
              ③ 表间关联与跨表计算（只做二维表）；<br />
              ④ 参数在薪酬计算之外的用途；<br />
              ⑤ 公式编辑器自身的语法与函数。
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div id="gp-scope-objects" class="section">
      <div class="section-header">
        <h3>三个对象，各管一件事</h3>
      </div>
      <p class="doc-p">
        最容易配错的地方是把三件事混在一起：<strong>参数</strong>回答「叫什么」，<strong>数据表</strong>回答「有哪些数」，
        <strong>取值函数</strong>回答「这次怎么取」。分开之后，一份数据能被多处按不同口径使用。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 130px;">对象</th><th style="width: 250px;">它是什么</th><th>在哪维护</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>参数</strong></td><td>有名字的一条配置：名称 + 值类型 + 状态</td><td>配置规则管理 → 通用参数（列表页与弹窗）</td></tr>
          <tr><td><strong>数据表</strong></td><td>一张表的列与行 —— 只有数据，没有规则</td><td>参数详情页（基础信息 / 列 / 数据 / 试算）</td></tr>
          <tr><td><strong>取值函数</strong></td><td>引用处的一组配置：取哪一列 + 用哪些条件查</td><td>薪酬项 → 计算公式 → 通用参数</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>为什么取值函数不放在参数上：</strong>同一张客次单价表，在「客次提成」里按人数档 + 客次档取，
        在成本核算里可能只按城市取。规则若只能写在表上，就得建两张表维护两份数。
      </div>
    </div>

    <div id="gp-scope-edge" class="section">
      <div class="section-header">
        <h3>与其他模块的边界</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 190px;">模块</th><th>它的职责与本模块只做什么</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>薪酬项配置</strong></td><td>公式怎么写、薪酬项怎么归类由它管；本模块只提供「取到一个数」的能力</td></tr>
          <tr><td><strong>薪酬计算与发放</strong></td><td>跑批、汇总、扣缴、发放由它管；本模块只被读取，不参与计算、不回写结果</td></tr>
          <tr><td><strong>主数据（城市 / 门店 / 员工）</strong></td><td>组织与人员事实由它管；本模块只把事实当作「传入的值」用，不建档不改档</td></tr>
        </tbody>
      </table>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'gp-scope-do', label: '五、需求范围' },
  { id: 'gp-scope-objects', label: '三个对象' },
  { id: 'gp-scope-edge', label: '与其他模块边界' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '模块化薪酬', to: '/docs/general-param' },
  { label: '五、需求范围' }
]
</script>

<style scoped src="./doc-base.css"></style>
