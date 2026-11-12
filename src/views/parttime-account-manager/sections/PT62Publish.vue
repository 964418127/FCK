<template>
  <DocShell
    :toc-items="tocItems"
    title="6.2 任务发布（定时 + 手动）"
    subtitle="每周四 06:00 自动生成下一批（n+1：下周六至下下周五）7 天的任务，上线首周另补当周一批；运营也可手动发布，批次限未来两周，已发布即覆盖"
    version="v1.0"
    date="2026-11-06"
    :breadcrumbs="breadcrumbs"
  >
    <div id="pt-62-overview" class="section">
      <div class="section-header">
        <h2>6.2 任务发布（定时 + 手动）</h2>
        <DocCopyButton section-id="pt-62" />
      </div>
      <div class="func-entry"><strong>功能入口：</strong>Web → 非全客户经理 → <strong>任务发布</strong>（原型 <code>/parttime-task-publication</code>）；定时发布由后台调度执行，无页面</div>

      <DocScreens
        :height="300"
        :images="[
          { src: ptPublishShot, label: '本期任务：最近一次执行的那批（21 时段 / 28 名额），按日期 × 门店 × 时段列，右侧是剩余名额' },
          { src: ptPublishRecordShot, label: '发布记录：一行一期，给发布日、周期、方式、时段数、总名额；覆盖就地更新' }
        ]"
      />
      <div class="note">
        <strong>两条路：</strong>定时是主路，每周四 06:00 全量执行；手动是辅路，需求临时调整或只想先发几家店时用。两条路生成同一种任务实例，都按 6.1 的需求与策略快照走。
      </div>
    </div>

    <div id="pt-62-rule" class="section">
      <div class="section-header">
        <h3>6.2.1 定时规则</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">项目</th><th>产品要求</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>运行周期</strong></td><td>每周四 <strong>06:00</strong> 执行一次，不需人工触发</td></tr>
          <tr><td><strong>生成范围</strong></td><td><strong>下周六至下下周五</strong>共 7 天，<strong>全部门店</strong></td></tr>
          <tr><td><strong>一批 = 哪一批</strong></td><td>每次只出<strong>下一批（n+1）</strong>；当周（n）由上一周的定时任务生成</td></tr>
          <tr><td><strong>上线首周</strong></td><td>首次上线没有「上一周」，<strong>另补一次当周（n）</strong>，补完进入正常节奏</td></tr>
          <tr><td><strong>读取条件</strong></td><td>只读运行时刻<strong>有效、未作废、已到生效日期</strong>的需求</td></tr>
          <tr><td><strong>展开规则</strong></td><td>一个名额 = 一个任务实例；日期 = 需求星期对应的那天</td></tr>
          <tr><td><strong>幂等</strong></td><td>同一周期重跑<strong>不重复生成</strong>，也不产生第二条发布记录</td></tr>
          <tr><td><strong>快照</strong></td><td>冻结门店、日期、星期、时段、名额、备注、<strong>分配策略</strong>、发布批次</td></tr>
          <tr><td><strong>客户端结果</strong></td><td>进入移动端<strong>可选任务</strong>，选择成功即「待到店」（见 6.5）</td></tr>
        </tbody>
      </table>
      <div class="note warn-note">
        <strong>「一批」不等于「未来 7 天」：</strong>每次只出下一批，不是从今天往后数 7 天；两批首尾相接，每次只把窗口往前推一批。要改当周走 6.3 或 6.1，不靠重跑定时。
        <br />
        <strong>上线首周补批（一次性）：</strong>窗口取上线当周，已过去的天数不生成，沿用同一套展开与快照规则，<strong>不设常驻入口</strong>。
      </div>
    </div>

    <div id="pt-62-manual" class="section">
      <div class="section-header">
        <h3>6.2.2 手动发布：选门店、选批次，已发布即覆盖</h3>
      </div>
      <p class="doc-p">解决「等不到周四」：需求刚改完、或只想让几家店先上线。入口只在任务发布页页头。</p>
      <DocScreens
        label="功能页面示例 · 手动发布"
        :height="420"
        :images="[
          { src: ptManualShot, label: '手动发布：批次两张卡（本批 / 下批），门店多选、不选即全部；底部写明覆盖边界' }
        ]"
      />
      <table class="data-table">
        <thead>
          <tr><th style="width: 140px;">字段</th><th style="width: 300px;">要求</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>发布批次</strong></td><td>只能选<strong>未来两周内</strong>的两个周四批</td><td>更远的需求等定时任务到点生成</td></tr>
          <tr><td><strong>发布门店</strong></td><td>多选；<strong>不选 = 全部门店</strong></td><td>只影响这一批的门店，不产生「部分发布」记录</td></tr>
          <tr><td><strong>覆盖规则</strong></td><td>该批已发布时，按<strong>当前</strong>需求重新生成</td><td>确认即覆盖，细则见下</td></tr>
        </tbody>
      </table>

      <h4 class="h4sub">覆盖细则：已承接的不动，没人接的重来</h4>
      <table class="data-table">
        <thead>
          <tr><th style="width: 240px;">这一批里的名额</th><th>怎么处理</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>已被承接</strong>（待到店 / 已到店 / 已离店）</td><td><strong>保持原安排，不回收</strong>（与 6.1.5 同一边界）</td></tr>
          <tr><td><strong>未被承接</strong></td><td>按<strong>当前</strong>需求的时段、名额、策略重新生成</td></tr>
          <tr><td><strong>需求已作废 / 停用的时段</strong></td><td>不再生成；旧名额无人接就随之消失</td></tr>
          <tr><td><strong>发布记录</strong></td><td>仍一行一期：方式改记「手动发布（覆盖）」，数字就地更新</td></tr>
        </tbody>
      </table>
      <ul class="doc-ul">
        <li>不校验是否周四当天；发布时刻 = 点确认那一刻。</li>
        <li>选中门店<strong>没有生效需求</strong>时直接拦截，不产生空批次。</li>
        <li>「发布即可见」档的起点 = 这一次的发布时刻（定时 06:00 / 手动点确认）。</li>
      </ul>
    </div>

    <div id="pt-62-week" class="section">
      <div class="section-header">
        <h3>6.2.3 「下周六至下下周五」按自然周理解</h3>
      </div>
      <p class="doc-p">
        发布日落在周四，窗口从<strong>下一个自然周的周六</strong>起算，到再下一周周五收口 —— 一周 7 天首尾相接、不重不漏，承接人约有 9 天可见期。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 200px;">发布时刻</th><th style="width: 220px;">目标窗口</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td>2026-10-01（周四）06:00</td><td>2026-10-10 ~ 10-16</td><td>周六起算，至下下周五</td></tr>
          <tr><td>2026-10-08（周四）06:00</td><td>2026-10-17 ~ 10-23</td><td>与上一期首尾相接</td></tr>
        </tbody>
      </table>
      <div class="note warn-note">
        <strong>易错点：</strong>从周五起算或跨 8 天，都会与相邻期重叠或漏一天，名额被多算或没人能选。
      </div>
    </div>

    <div id="pt-62-page" class="section">
      <div class="section-header">
        <h3>6.2.4 页面：本期任务与发布记录</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 140px;">区域</th><th style="width: 300px;">展示内容</th><th>说明</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>本期任务</strong></td><td>最近一次执行的周期、时段数、总名额、剩余名额；每行带<strong>分配策略</strong>与<strong>此刻开放档位</strong></td><td>剩余名额随选随减，<strong>满了就是满了</strong>，无加名额入口</td></tr>
          <tr><td><strong>发布记录</strong></td><td>一行一期：发布日、周期、方式、时段数、总名额，按发布日倒序</td><td>覆盖不追加行</td></tr>
        </tbody>
      </table>
      <ul class="doc-ul">
        <li>本期 = <strong>最近一次执行</strong>的那一期，不是当前自然周。</li>
        <li>两个 tab <strong>只读</strong>；改变结果的唯一动作是页头的「手动发布」。</li>
        <li>没有「补发」「重试」：定时失败属后台告警，不在业务页解决。</li>
      </ul>
    </div>

    <div id="pt-62-snapshot" class="section">
      <div class="section-header">
        <h3>6.2.5 快照意味着什么</h3>
      </div>
      <p class="doc-p">
        任务生成即冻结门店、日期、星期、时段、名额、备注、分配策略与批次；需求被改或被作废，任务不跟着变。手动覆盖是<strong>唯一</strong>能让旧名额按新需求重来的路径，且只对没人接的名额生效。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 300px;">之后发生什么</th><th>已生成任务</th></tr>
        </thead>
        <tbody>
          <tr><td>时段从 10:00–14:00 改成 12:00–16:00</td><td>仍按 10:00–14:00 执行；<strong>手动覆盖后</strong>未被承接的按新时段生成</td></tr>
          <tr><td>名额从 2 减到 1</td><td>2 个任务都保留；要减人走 6.3 取消</td></tr>
          <tr><td>需求整条作废</td><td>已生成不回收；下一期不再生成</td></tr>
          <tr><td>时段换策略</td><td>仍按原策略累计开放，不追加新档位</td></tr>
        </tbody>
      </table>
    </div>

    <div id="pt-62-bound" class="section">
      <div class="section-header">
        <h3>6.2.6 边界</h3>
      </div>
      <ul class="doc-ul">
        <li>运营<strong>不能绕过需求</strong>在发布页造任务；临时加时段走 6.3。</li>
        <li>发布<strong>不负责派发</strong>：周期任务进可选列表，由本人选（6.5）。</li>
        <li>发布<strong>不改档位</strong>，也<strong>不等于开放接单</strong> —— 接单要等各自的排班日（6.1.4）。</li>
        <li>定时同周期只执行一次；手动对已发布批次是覆盖，此外不提供重发、补发、延期。</li>
        <li>结果<strong>不推送解释</strong>，通知只把人带到列表（6.5.1）。</li>
      </ul>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'
import DocScreens from '../../../docs/components/DocScreens.vue'
import ptPublishShot from '../../../docs/assets/pages/pt-publish.png'
import ptPublishRecordShot from '../../../docs/assets/pages/pt-publish-record.png'
import ptManualShot from '../../../docs/assets/pages/pt-publish-manual.png'

const tocItems = [
  { id: 'pt-62-overview', label: '6.2 任务发布' },
  { id: 'pt-62-rule', label: '6.2.1 定时规则' },
  { id: 'pt-62-manual', label: '6.2.2 手动发布' },
  { id: 'pt-62-week', label: '6.2.3 周期口径' },
  { id: 'pt-62-page', label: '6.2.4 页面与记录' },
  { id: 'pt-62-snapshot', label: '6.2.5 快照' },
  { id: 'pt-62-bound', label: '6.2.6 边界' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '非全客户经理', to: '/docs/parttime-account-manager' },
  { label: '六、功能详细说明', to: '/docs/parttime-account-manager/features' },
  { label: '6.2 任务发布（定时 + 手动）' }
]
</script>

<style scoped src="./doc-base.css"></style>
