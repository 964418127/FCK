<template>
  <DocShell
    :toc-items="tocItems"
    title="二、变更日志"
    subtitle="本轮成文只留一条日志；之后同一轮修订就地更新这一条"
    version="v1.0"
    date="2026-11-10"
    :breadcrumbs="breadcrumbs"
  >
    <div id="gp-chg" class="section">
      <div class="section-header">
        <h2>变更日志</h2>
        <DocCopyButton section-id="gp-chg" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 110px;">日期</th><th style="width: 80px;">版本</th><th>变更</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>2026-11-10</td>
            <td>v1.0</td>
            <td>
              <div class="chg-lead">通用参数由「只能存固定值」升级为「可查询的数据表」，本文档首次成文。</div>
              <ol class="chg-list">
                <li>值类型分两类：文本 / 数值 / 日期 / 时间 / 四类数组是<strong>简单值</strong>；<strong>数据表</strong>另开一页配列与数据。原「参数形态」说法退场。</li>
                <li>列表页只留<strong>名称、值类型、状态、启用开关、编辑 / 删除</strong>，不再有「数据」列与「配置数据」入口。</li>
                <li>数据表<strong>只放数据</strong>：列只有名字与类型、不分角色；哪个当条件、取哪一列、按什么顺序取，全部由引用处决定。</li>
                <li>查询条件改成一句人话：<strong>条件列 + 符号 + 传入的值</strong>，符号六种；区间由<strong>上下限两列配两条条件</strong>表达，不再往格子里写「30-39」「≥40」。</li>
                <li>取值函数只留两种：<strong>取 1 列</strong>与<strong>取多列相加</strong>；命中按「越具体越优先」，条件列全空的行作兜底。</li>
                <li>配置页新增<strong>试算</strong>：给一组条件，看落到第几行、取的是哪一列、值是多少。</li>
              </ol>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>维护规则：</strong>同一轮评审里的修订就地改这一条，不新增行；正式发版、对外交付时才追加一条新版本日志。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'gp-chg', label: '二、变更日志' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '模块化薪酬', to: '/docs/general-param' },
  { label: '二、变更日志' }
]
</script>

<style scoped src="./doc-base.css"></style>

<style scoped>
.chg-lead { font-size: 13px; line-height: 1.8; margin-bottom: 6px; }
.chg-list { margin: 0; padding-left: 18px; }
.chg-list li { font-size: 12.5px; line-height: 1.85; margin-bottom: 6px; }
</style>
