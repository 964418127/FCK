<template>
  <DocShell
    :toc-items="tocItems"
    title="6.1 查询范围与岗位底账"
    subtitle="能查什么由岗位现行薪酬项集合决定：三类取数通道 × 三个岗位底账"
    version="v2.0"
    date="2026-11-24"
    :breadcrumbs="breadcrumbs"
  >
    <div id="sa-61-three" class="section">
      <div class="section-header">
        <h2>三类取数通道</h2>
        <DocCopyButton section-id="sa-61-three" />
      </div>
      <p class="doc-p">
        员工的提问最终都落在具体薪酬项上（「3 号客次提成为什么是 15 块」「我的保底是多少」）。
        Agent 取数只有三条通道，每条通道都只取<strong>登录人本人</strong>的数据：
        一条提问先定位到薪酬项，再走对应通道取数，最后按应答深度分层作答（6.3）。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">取数通道</th><th style="width: 240px;">取什么</th><th>查询条件从哪来</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>工资条</strong></td>
            <td>已发放、本人名下的全部工资条（含多主体多张）：构成、代扣、发放时间与状态</td>
            <td>按登录人的员工编号取名下工资条，无其他取数通道</td>
          </tr>
          <tr>
            <td><strong>本人业务事实</strong></td>
            <td>产生薪酬项计算输入的业务数据：订单（日期、服务项目、实付金额）、接待与班次记录、卫生检查记录</td>
            <td>按登录人取本人名下业务记录，只取与被问薪酬项对应的日期区间</td>
          </tr>
          <tr>
            <td><strong>政策命中值</strong></td>
            <td>影响计算结果的配置：保底、计件单价、提成比例等</td>
            <td>城市 / 门店 / 工号等条件由系统按登录人注入，员工口述的身份与归属信息一律不进引擎</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>为什么政策类答依据：</strong>员工问的不是「保底政策是什么」，而是「适用于我的那个数是多少、依据什么来的」。
        命中依据是求证的核心 —— 员工要的不是再看一遍数字，而是「凭什么」。
        <br /><strong>业务事实为什么在场：</strong>求证层的还原链路（6.4）需要事实数据做输入——订单实付金额、客次记录
        都是员工本人业务，员工本来就经历过，给本人看不构成泄露；给不了的是别人的事实。
      </div>
    </div>

    <div id="sa-61-post" class="section">
      <div class="section-header">
        <h2>岗位底账：能查什么按岗位现行集合定</h2>
        <DocCopyButton section-id="sa-61-post" />
      </div>
      <p class="doc-p">
        每个岗位「有哪些薪酬项可查」由现行底账决定，不在底账里的项 Agent 知识里没有，问了就是不存在。
        三份底账（附录 7.2 – 7.4）逐项标注了应答深度（6.3），是本页与围墙（6.2）、分层（6.3）共同的对照表。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 200px;">岗位</th><th style="width: 260px;">薪酬项集合</th><th>底账要点</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>全职推拿师</strong></td>
            <td>三模板并存（超产值获豆 V8 / 基础提成 20 V6 / 基础提成 24 V7），员工不感知模板</td>
            <td>计件 / 加班 / 打赏等现金项 + 获豆扣豆类常乐豆项；<router-link to="/docs/salary-agent/7-3">7.3</router-link></td>
          </tr>
          <tr>
            <td><strong>全职客户经理</strong></td>
            <td>策略「客户经理收入 V69」</td>
            <td>客次提成等现金项 + 六个获豆分类与物资超标扣豆；<router-link to="/docs/salary-agent/7-2">7.2</router-link></td>
          </tr>
          <tr>
            <td><strong>非全推拿师</strong></td>
            <td>策略「9月及以后非全收入」，按周出工资条</td>
            <td>全部现金、无常乐豆；<router-link to="/docs/salary-agent/7-4">7.4</router-link></td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>底账随策略演进更新：</strong>发放策略调整后清单随之修订，逐项的应答深度标注同步维护（归属薪酬侧）。
        底账不是 Agent 的承诺——它只是「现行集合」的事实记录。
      </div>
    </div>

    <div id="sa-61-weekly" class="section">
      <div class="section-header">
        <h2>非全推拿师的周薪与个税口径</h2>
        <DocCopyButton section-id="sa-61-weekly" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">口径</th><th>内容</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>周薪模式</strong></td><td>非全按周出工资条，每条一个薪酬期（按月内 1-7 / 8-14 / 15-21 / 22-月底切分）</td></tr>
          <tr><td><strong>预扣个税</strong></td><td>周薪阶段按 3% 预扣个税</td></tr>
          <tr><td><strong>多退少补</strong></td><td>月最后的薪酬期真实申报个税后，对当月各期预扣多退少补</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>可答与不可答的界线：</strong>预扣比例、周薪模式、多退少补规则属于政策类口径，Agent 可答；
        对工资条已列的各期结论，可做合理化推算——如将当月各期预扣相加、与月末【代扣个税】对比，说明多退少补的差额来源。
        推算只基于工资条既有数据；基数、税档等不在场的信息（6.2）不参与推算。
      </div>
    </div>

    <div id="sa-61-mul" class="section">
      <div class="section-header">
        <h2>多张工资条</h2>
        <DocCopyButton section-id="sa-61-mul" />
      </div>
      <p class="doc-p">
        一名员工名下可以有多张工资条（按发放主体、按计薪周期拆）。Agent 逐张可查、逐张可答；
        员工问「我有几份工资」时，按当期名下工资条逐张列出发放主体、计薪周期与状态。
      </p>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'sa-61-three', label: '三类取数通道' },
  { id: 'sa-61-post', label: '岗位底账' },
  { id: 'sa-61-weekly', label: '非全周薪与个税' },
  { id: 'sa-61-mul', label: '多张工资条' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '模块化薪酬', to: '/docs/salary-agent' },
  { label: '六、功能详细说明' },
  { label: '6.1 查询范围与岗位底账' }
]
</script>

<style scoped src="./doc-base.css"></style>
