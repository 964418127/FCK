<template>
  <DocShell
    :toc-items="tocItems"
    title="6.4 完整求证链与场景走位"
    subtitle="四步还原（事实 → 规则 → 计算 → 判定）+ 六步场景卡走到底"
    version="v2.6"
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

    <div id="sa-64-scenario" class="section">
      <div class="section-header">
        <h2>一个场景走到底：客次提成 15 块</h2>
        <DocCopyButton section-id="sa-64-scenario" />
      </div>
      <p class="doc-p">
        把最常见的质疑走一遍全程，看行为侧每一步踩在支撑侧哪个实体上
        （以全职客户经理的「计件客次收入」为例，底账 7.2 标注 L1 求证层；四步求证链的细化口径见 6.4）。
        卡片颜色即数据源类别：<span class="lg lg-a">入口与定位</span> <span class="lg lg-b">业务事实</span>
        <span class="lg lg-c">政策依据</span> <span class="lg lg-d">组装（关键步）</span>
      </p>
      <div class="steps">
        <div class="step-card st-a">
          <div class="step-head"><span class="step-no">1</span><span class="step-t">进入即锁定本人</span></div>
          <div class="step-d">从【薪酬咨询助手】进入（暂定名），登录态带入——查询对象不可选、不可改（6.5）。</div>
          <div class="step-src">背后数据源：登录态 / 员工档案（岗位归属）</div>
        </div>
        <div class="step-card st-a">
          <div class="step-head"><span class="step-no">2</span><span class="step-t">定位薪酬项</span></div>
          <div class="step-d">提问解析到显示名「计件客次收入」+ 业务日期 3 号；查底账确认该项为 L1 求证层。</div>
          <div class="step-src">背后数据源：岗位底账（7.2，含深度标注）</div>
        </div>
        <div class="step-card st-b">
          <div class="step-head"><span class="step-no">3</span><span class="step-t">取业务事实</span></div>
          <div class="step-d">读本人 3 号的客次记录与订单实付金额——员工本人经历过，给本人看不构成泄露（清单见 6.1 表 A）。</div>
          <div class="step-src">背后数据源：本人业务事实（本人名下过滤）</div>
        </div>
        <div class="step-card st-c">
          <div class="step-head"><span class="step-no">4</span><span class="step-t">取政策依据</span></div>
          <div class="step-d">命中客次提成单价 + 规则说明文案——「为什么是 5 元」的依据带出处（清单见 6.1 表 B）。</div>
          <div class="step-src">背后数据源：政策参数命中值 + 政策资料仓库</div>
        </div>
        <div class="step-card st-d">
          <span class="step-key">关键步</span>
          <div class="step-head"><span class="step-no">5</span><span class="step-t">组装计算还原</span></div>
          <div class="step-d">把事实、规则、算式连成应答：3 客次 × 5 元 = 15 元——数字全部来自前三步，Agent 不自带。</div>
          <div class="step-src">背后数据源：STEP 03 + 04 拼装（无新增数据源）</div>
        </div>
        <div class="step-card st-a">
          <div class="step-head"><span class="step-no">6</span><span class="step-t">结论判定</span></div>
          <div class="step-d">一致 → 就地证完；有出入 → 如实报差异转人工，携带已查内容，不评对错、不下结论。</div>
          <div class="step-src">背后数据源：人工出口条目（6.5）</div>
        </div>
      </div>
      <p class="arch-cap">
        同一条链路换个数据源就走别的层：常乐豆问题走到 STEP 02 就换成「账户级三数」（STEP 03–05 不执行），
        代扣三类走到 STEP 04 后直接报结论——这就是「按深度分层作答」在场景里的样子。
      </p>
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
            <td>卫生打扫类激励与扣款的求证（事实数据已列入 6.1 表 A：房间卫生 / 卫生间 / 离店卫生 / 卫生检查；升 L1 待薪酬侧确认，确认前按 L2 答）</td>
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
        <br /><strong>升级路径：</strong>卫生类激励 / 扣款现行按 L2 答；卫生打扫与检查事实已列入 6.1 表 A，接入数据面并经薪酬侧确认后，
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
          <tr><td><strong>公式展开范围</strong></td><td>按 6.3 公式开放度逐项表执行：仅「允许 · 完整公式」16 项展开完整算式；「仅口径」36 项只讲规则；「只报数」18 项无规则可讲；常乐豆 31 项不展开——公式里不得出现他人数据、策略 / 模板名与内部系数</td></tr>
          <tr><td><strong>只还原已发生的</strong></td><td>求证链只对已发放工资条上的结论做还原；对未发生薪酬的预估是试算，不做（5.3 做与不做）</td></tr>
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
  { id: 'sa-64-scenario', label: '场景走到底（六步）' },
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
.steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 14px 0 8px; }
.step-card {
  background: #fbfbfa; border: 1px solid #e3e6ea; border-top: 3px solid #888780;
  border-radius: 10px; padding: 12px 14px; display: flex; flex-direction: column; gap: 7px;
  position: relative;
}
.step-card.st-a { border-top-color: #185fa5; }
.step-card.st-b { border-top-color: #3b6d11; }
.step-card.st-c { border-top-color: #854f0b; }
.step-card.st-d {
  border-top-color: #993c1d; border-color: #993c1d;
  background: #fdf4f0; box-shadow: 0 2px 10px hsl(18 55% 45% / 0.14);
}
.step-head { display: flex; align-items: center; gap: 8px; }
.step-no {
  flex: 0 0 auto; width: 24px; height: 24px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: #fff;
}
.st-a .step-no { background: #185fa5; }
.st-b .step-no { background: #3b6d11; }
.st-c .step-no { background: #854f0b; }
.st-d .step-no { background: #993c1d; }
.step-t { font-size: 13.5px; font-weight: 600; color: #2c2c2a; }
.step-d { font-size: 12px; color: #5f5e5a; line-height: 1.6; }
.step-src {
  font-size: 11.5px; font-weight: 500; color: #5f5e5a;
  background: #f1f0ec; border-radius: 5px; padding: 4px 8px;
  line-height: 1.5; margin-top: auto;
}
.st-d .step-src { color: #712b13; background: hsl(18 60% 92%); }
.step-key {
  position: absolute; top: -11px; right: 10px;
  font-size: 11px; font-weight: 700; color: #fff;
  background: #993c1d; border-radius: 999px; padding: 2px 10px;
}
.lg { display: inline-block; font-size: 11px; font-weight: 600; border-radius: 999px; padding: 1px 9px; }
.lg-a { color: #185fa5; background: hsl(210 65% 92%); }
.lg-b { color: #3b6d11; background: hsl(90 45% 90%); }
.lg-c { color: #854f0b; background: hsl(38 70% 90%); }
.lg-d { color: #993c1d; background: hsl(18 60% 91%); }
</style>
