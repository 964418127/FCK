<template>
  <DocShell
    :toc-items="tocItems"
    title="二、变更日志"
    subtitle="本版为重构基线首版，只有一条；同一轮内的修订就地更新"
    version="v3.0 基线"
    date="2026-11-12"
    :breadcrumbs="breadcrumbs"
  >
    <div id="hs-chg" class="section">
      <div class="section-header">
        <h2>变更日志</h2>
        <DocCopyButton section-id="hs-chg" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 110px;">版本</th><th style="width: 110px;">日期</th><th>变更</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>v3.0</strong></td>
            <td>2026-11-12</td>
            <td>
              重构基线首版：确立<strong>容器 → 时段 → 获取规则 → 排班结果</strong>四层结构，
              把「时段只描述时间形态」与「谁能占、怎么占」拆成两个对象；
              层改为<strong>轮</strong>（开放 → 截止 → 结算）；余额从「一个兜底动作」改为
              <strong>再开一轮 / 兜底序列 / 不管</strong>三条去向；补移动端选班。
              四岗位现行排班口径作为对照写入 5.2。
            </td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>写法：</strong>同一轮内的口径调整<strong>就地改正文</strong>，不再叠第二条日志；
        只有对外发布版本（v3.0 → v3.1）才追加一行。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'hs-chg', label: '二、变更日志' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事中心', to: '/docs/hr-schedule' },
  { label: '二、变更日志' }
]
</script>

<style scoped src="./doc-base.css"></style>
