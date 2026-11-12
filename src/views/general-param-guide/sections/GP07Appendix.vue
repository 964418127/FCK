<template>
  <DocShell
    :toc-items="tocItems"
    title="七、附录：待决事项"
    subtitle="本轮不拍板但必须挂起：写清归属方与卡点"
    version="v1.0"
    date="2026-11-10"
    :breadcrumbs="breadcrumbs"
  >
    <div id="gp-appendix" class="section">
      <div class="section-header">
        <h2>待决事项</h2>
        <DocCopyButton section-id="gp-appendix" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 50px;">序</th><th style="width: 210px;">待决</th><th style="width: 100px;">归属方</th><th style="width: 230px;">卡在哪</th><th>当前做法</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td><strong>单价表要不要一条「不看档位的通用价」</strong></td>
            <td>业务 / 薪酬</td>
            <td>补一行会让档位出现例外；另建简单值参数会多一个参数名</td>
            <td>暂不补。需要时把该行条件列全部留空即成兜底行</td>
          </tr>
          <tr>
            <td>2</td>
            <td><strong>保底时薪用单表还是两表叠加</strong></td>
            <td>薪酬</td>
            <td>单表改城市价要人工同步门店行；两表要多列相加，条件粒度必须一致</td>
            <td>单表，门店存最终值（6.3.1）</td>
          </tr>
          <tr>
            <td>3</td>
            <td><strong>参数生效日期与多版本</strong></td>
            <td>产品</td>
            <td>要定按期切换、跨期怎么算、改了本期算不算</td>
            <td>改完即生效，不追溯已算结果</td>
          </tr>
          <tr>
            <td>4</td>
            <td><strong>改动留痕与审批</strong></td>
            <td>薪酬 / 财务</td>
            <td>谁改的、改前改后、要不要复核后才能生效</td>
            <td>无留痕、无审批；建议改前导出一份存档</td>
          </tr>
          <tr>
            <td>5</td>
            <td><strong>字段级授权（按城市 / 门店分权）</strong></td>
            <td>业务</td>
            <td>门店多起来后「谁能改哪个城市」需要定</td>
            <td>只按角色给入口，不细分范围</td>
          </tr>
          <tr>
            <td>6</td>
            <td><strong>参数分类 / 标签</strong></td>
            <td>产品</td>
            <td>数量到多少才需要分类、分类由谁维护</td>
            <td>不做，用命名前缀区分</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>维护规则：</strong>任一条有结论后，把它从本表移到正文对应小节，并在变更日志那条里补一句 —— 附录只放「还没定的事」。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'gp-appendix', label: '七、待决事项' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '模块化薪酬', to: '/docs/general-param' },
  { label: '七、附录：待决事项' }
]
</script>

<style scoped src="./doc-base.css"></style>
