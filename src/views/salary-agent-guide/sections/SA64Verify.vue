<template>
  <DocShell
    :toc-items="tocItems"
    title="6.4 完整求证链：以「客次提成 15 块」为例"
    subtitle="L1 项的四步还原：本人业务事实 → 规则命中 → 计算过程 → 结论判定"
    version="v2.0"
    date="2026-11-24"
    :breadcrumbs="breadcrumbs"
  >
    <div id="sa-64-case" class="section">
      <div class="section-header">
        <h2>场景：推拿师问「为什么我 3 号的客次提成只有 15 块，我觉得应该是 18 块」</h2>
        <DocCopyButton section-id="sa-64-case" />
      </div>
      <p class="doc-p">
        这是员工最典型的质疑形态：一个具体日期、一个具体项、一个自己的预估数。
        它既不是「查明细原样」也不是「问政策」，而是一条求证链——Agent 按四步还原，每一步的数据都来自
        6.1 的三条取数通道，全程只有本人数据。
      </p>
      <svg viewBox="0 0 680 128" class="doc-svg" role="img" aria-label="求证链四步：本人业务事实 → 规则命中 → 计算还原 → 结论判定，每步标注数据来源">
        <title>求证链四步</title>
        <defs>
          <marker id="saArr2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="#888780" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </marker>
        </defs>
        <rect x="20" y="24" width="150" height="76" rx="10" fill="#EAF3DE" stroke="#3B6D11" stroke-width="0.6"/>
        <text x="95" y="46" text-anchor="middle" font-size="12" font-weight="600" fill="#27500A">① 业务事实</text>
        <text x="95" y="64" text-anchor="middle" font-size="11" fill="#3B6D11">3 号接待了几位客、</text>
        <text x="95" y="80" text-anchor="middle" font-size="11" fill="#3B6D11">对应订单实付金额</text>
        <text x="95" y="94" text-anchor="middle" font-size="10" fill="#888780">通道：本人业务事实</text>
        <line x1="172" y1="62" x2="192" y2="62" stroke="#888780" stroke-width="1" marker-end="url(#saArr2)"/>
        <rect x="196" y="24" width="150" height="76" rx="10" fill="#EAF3DE" stroke="#3B6D11" stroke-width="0.6"/>
        <text x="271" y="46" text-anchor="middle" font-size="12" font-weight="600" fill="#27500A">② 规则命中</text>
        <text x="271" y="64" text-anchor="middle" font-size="11" fill="#3B6D11">适用本人的客次提成</text>
        <text x="271" y="80" text-anchor="middle" font-size="11" fill="#3B6D11">单价 + 命中依据</text>
        <text x="271" y="94" text-anchor="middle" font-size="10" fill="#888780">通道：政策命中值</text>
        <line x1="348" y1="62" x2="368" y2="62" stroke="#888780" stroke-width="1" marker-end="url(#saArr2)"/>
        <rect x="372" y="24" width="150" height="76" rx="10" fill="#EAF3DE" stroke="#3B6D11" stroke-width="0.6"/>
        <text x="447" y="46" text-anchor="middle" font-size="12" font-weight="600" fill="#27500A">③ 计算还原</text>
        <text x="447" y="64" text-anchor="middle" font-size="11" fill="#3B6D11">客次数 × 命中单价</text>
        <text x="447" y="80" text-anchor="middle" font-size="11" fill="#3B6D11">逐笔对上 15 块</text>
        <text x="447" y="94" text-anchor="middle" font-size="10" fill="#888780">通道：工资条结论</text>
        <line x1="524" y1="62" x2="544" y2="62" stroke="#888780" stroke-width="1" marker-end="url(#saArr2)"/>
        <rect x="548" y="24" width="112" height="76" rx="10" fill="#FAEEDA" stroke="#854F0B" stroke-width="0.6"/>
        <text x="604" y="46" text-anchor="middle" font-size="12" font-weight="600" fill="#633806">④ 结论判定</text>
        <text x="604" y="64" text-anchor="middle" font-size="11" fill="#854F0B">一致 → 已证</text>
        <text x="604" y="80" text-anchor="middle" font-size="11" fill="#854F0B">有出入 → 转人工</text>
        <text x="604" y="94" text-anchor="middle" font-size="10" fill="#888780">判定分支</text>
        <text x="340" y="118" text-anchor="middle" font-size="11" fill="#888780">四步只读不写、只还原不预估——数据面里没有的输入（他人订单、内部策略参数）一步都不会出现</text>
      </svg>
    </div>

    <div id="sa-64-steps" class="section">
      <div class="section-header">
        <h2>四步的取数与应答</h2>
        <DocCopyButton section-id="sa-64-steps" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 120px;">步骤</th><th style="width: 280px;">取什么（示例）</th><th>应答里怎么说（示意）</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>① 业务事实</strong></td>
            <td>3 号本人客次记录：接待 3 位客，对应订单实付金额合计 X 元</td>
            <td>「3 号你的客次记录是 3 位客人，对应订单均已实付。」</td>
          </tr>
          <tr>
            <td><strong>② 规则命中</strong></td>
            <td>适用本人的客次提成单价 = 5 元 / 客次（命中：城市 + 门店 + 全职推拿师，命中依据同 6.1 政策类）</td>
            <td>「你适用的客次提成单价是 5 元 / 客次，命中你所在门店的全职推拿师档。」</td>
          </tr>
          <tr>
            <td><strong>③ 计算还原</strong></td>
            <td>3 客次 × 5 元 = 15 元，与工资条【计件客次收入】当期金额一致</td>
            <td>「3 客次 × 5 元 = 15 元，和 3 号客次提成入账的 15 块对得上。」</td>
          </tr>
          <tr>
            <td><strong>④ 结论判定</strong></td>
            <td>员工预期 18 块 → 比对差异来源（少 1 个客次记录，或员工按 6 元单价估的）</td>
            <td>一致：「15 块是对的，构成如上。」有出入：「你的预估按 X 算的，事实记录是 Y——出入在事实 / 单价，已整理转人事核实。」</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>表内数字是示意：</strong>客次数、单价、差异来源用虚构数字演示链路形态；
        真实取数全部来自三条通道（6.1），单价以通用参数引擎命中的结果为准，Agent 不自带任何「应该多少」的数。
        <br /><strong>对员工预估的态度：</strong>18 块是员工自己的预估，Agent 不评判「你想多了」也不迎合「可能是我们算错了」——
        只做一件事：把事实、规则、计算摆出来让数对数；对得平就地证完，对不平如实报差异并转人工。
      </div>
    </div>

    <div id="sa-64-src" class="section">
      <div class="section-header">
        <h2>求证层的数据源清单</h2>
        <DocCopyButton section-id="sa-64-src" />
      </div>
      <p class="doc-p">
        L1 项能走通求证链，前提是这些事实数据在数据面里。接入范围如下，只取本人名下、只取与被问项对应的日期区间：
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 200px;">数据源</th><th style="width: 280px;">字段（本人视角）</th><th>支撑哪些项的求证</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>订单事实</strong></td>
            <td>订单日期、服务项目、订单实付金额、关联员工</td>
            <td>全月计件收入、客次提成、加班 / 节假日加班收入、修脚、非全提成收入等订单驱动项</td>
          </tr>
          <tr>
            <td><strong>接待与班次事实</strong></td>
            <td>接待次数、班次出勤记录</td>
            <td>客次类提成、接待驱动激励</td>
          </tr>
          <tr>
            <td><strong>卫生检查事实</strong></td>
            <td>本人负责房间 / 卫生间的打扫与检查记录</td>
            <td>卫生打扫类激励与扣款的求证（第一版按 L2 结论层答，事实数据接入后重评升 L1）</td>
          </tr>
          <tr>
            <td><strong>政策命中值</strong></td>
            <td>计件单价、提成比例、保底（含命中依据）</td>
            <td>所有 L1 项的第②步</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>不在求证层的数据源：</strong>他人订单与接待数据（围墙①②）、投诉工单详情与处理过程（第三方内容）、
        策略模板的计算脚本（内部口径文档）——这些即使业务系统里有，也不进 Agent 数据面。
        <br /><strong>升级路径：</strong>卫生类激励 / 扣款第一版按 L2 答；待卫生检查事实数据接入数据面后，
        可重评升 L1——升层改的是数据面接入清单与底账标注，不改围墙与分层规则本身（归属薪酬侧 + 产品）。
      </div>
    </div>

    <div id="sa-64-edge" class="section">
      <div class="section-header">
        <h2>求证链的边界</h2>
        <DocCopyButton section-id="sa-64-edge" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 250px;">边界</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>只还原已发生的</strong></td><td>求证链只对已发放工资条上的结论做还原；对未发生薪酬的预估是试算，不做（5.3）</td></tr>
          <tr><td><strong>不在 L1 的项不进链路</strong></td><td>只有底账标注 L1 的项才走四步还原；L2 / L3 / L4 项被问到时按 6.3 对应层作答，Agent 不临时「加深」</td></tr>
          <tr><td><strong>算不平就转人工</strong></td><td>还原后与员工预期有出入且事实能解释的，如实解释；事实解释不了的，明示已查内容转人工——Agent 不下「公司错了」或「你想错了」的结论</td></tr>
          <tr><td><strong>全程只读</strong></td><td>求证不产生任何写操作、不改任何数据；差异的修正永远在人工侧</td></tr>
        </tbody>
      </table>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'sa-64-case', label: '场景与链路总览' },
  { id: 'sa-64-steps', label: '四步的取数与应答' },
  { id: 'sa-64-src', label: '求证层的数据源清单' },
  { id: 'sa-64-edge', label: '求证链的边界' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '模块化薪酬', to: '/docs/salary-agent' },
  { label: '六、功能详细说明' },
  { label: '6.4 完整求证链' }
]
</script>

<style scoped src="./doc-base.css"></style>

<style scoped>
.doc-svg { width: 100%; height: auto; display: block; margin: 4px 0 8px; }
</style>
