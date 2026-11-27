<template>
  <DocShell
    :toc-items="tocItems"
    title="6.1 查询范围、数据源与业务事实"
    subtitle="三类取数通道 → 算薪前预估露出 → 支撑侧数据源清单 → 业务事实按岗位罗列 → 三个岗位底账"
    version="v2.7"
    date="2026-11-27"
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
        <br />        <strong>业务事实为什么在场：</strong>求证层的还原链路（6.4）需要事实数据做输入——订单实付金额、客次记录
        都是员工本人业务，员工本来就经历过，给本人看不构成泄露；给不了的是别人的事实。
      </div>
    </div>

    <div id="sa-61-estimate" class="section">
      <div class="section-header">
        <h2>算薪前：本月业务预估的露出</h2>
        <DocCopyButton section-id="sa-61-estimate" />
      </div>
      <p class="doc-p">
        下一个算薪日之前不存在薪酬结果，但算薪日前员工的高频提问是「我这个月提成有多少了」。
        系统在算薪前有预估数据可用——薪酬未计算前的<strong>非结论性数据</strong>，
        全部来自既有取数通道（本人业务事实累计 × 政策命中单价），不新增数据源。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 220px;">规则</th><th>口径</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>露出什么</strong></td><td>本月业务累计数（如累计到店客次）+ 现行单价 + 由此得到的预估值；只露这三样，不展开内部计算过程</td></tr>
          <tr><td><strong>必须带的标注</strong></td><td>每张预估回答必带「非结论性预估，最终以工资结算为准」——预估不作为对账依据，结算后以工资条为准</td></tr>
          <tr><td><strong>与求证链的衔接</strong></td><td>员工追问预估与实发的差异：说明出入来源（未结算扣款与津贴），引导发放后回来查证——发放后每一笔走完整求证链（6.4）</td></tr>
          <tr><td><strong>时间界线</strong></td><td>只露本月截至当前的累计；未来月份（业务未发生）仍不做；「最近 3 个月」的查询范围不变（6.5）</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>为什么敢露预估：</strong>预估数全部来自员工本人的业务事实与现行政策命中值，这些业务员工本人就经历过；
        风险不在「给预估」，在「把预估当结论」——结算为准的标注始终在场。
        <br /><strong>表达原则：</strong>员工侧只见「业务累计 + 预估值 + 结算为准」，内部围墙与判定口径不进员工侧话术。
      </div>
    </div>

    <div id="sa-61-src" class="section">
      <div class="section-header">
        <h2>支撑侧：数据从哪来、谁维护</h2>
        <DocCopyButton section-id="sa-61-src" />
      </div>
      <p class="doc-p">
        行为侧的每一条规则（围墙、深度分层、求证链），落到研发手里都是下面这张表的一行——
        <strong>每类数据从哪来、喂给 Agent 之前做什么加工、多久更新、谁维护</strong>。
        系统落地名以研发确认为准，这里先按业务说法写。
      </p>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 130px;">数据实体</th>
            <th style="width: 190px;">来源</th>
            <th>喂给 Agent 前的加工</th>
            <th style="width: 120px;">更新时机</th>
            <th style="width: 100px;">维护方</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>工资条快照</strong></td>
            <td>模块化薪酬计算结果（已发放的工资单）</td>
            <td>敏感字段喂之前剥除（6.2）；薪酬项只留显示名称，内部名称与策略模板名不进知识面</td>
            <td>随算薪 / 发放更新</td>
            <td>薪酬侧</td>
          </tr>
          <tr>
            <td><strong>政策参数命中值</strong></td>
            <td>通用参数配置（取值契约：条件查询、命中取值）</td>
            <td>系统按本人条件注入命中值与依据，员工对话不可改变查询条件</td>
            <td>配置变更即更新</td>
            <td>薪酬侧（配置规则管理）</td>
          </tr>
          <tr>
            <td><strong>政策资料仓库</strong></td>
            <td>政策文件与规则文案：如住宿获豆政策、客次提成规则说明、补贴说明等</td>
            <td>每条挂显示名薪酬项；敏感段落<strong>在维护侧就不进仓库</strong>（如常乐豆相关操作说明，不在场不是藏着）</td>
            <td><strong>维护更新即生效</strong></td>
            <td>薪酬侧（提供维护功能）</td>
          </tr>
          <tr>
            <td><strong>本人业务事实</strong></td>
            <td>订单实付金额、接待 / 班次记录、卫生检查记录等业务系统数据</td>
            <td>只取本人名下；接入清单按本节表 A 与底账 L1 项逐项确认（排班、请假、出勤、订单、评价、新客 / 回头客、门店任务、房间卫生、卫生间、离店卫生、卫生检查、投诉记录）</td>
            <td>随业务系统产生</td>
            <td>研发接入</td>
          </tr>
          <tr>
            <td><strong>常乐豆账户级汇总</strong></td>
            <td>常乐豆账户</td>
            <td>只导出三个数（本月结算 / 可用余额 / 提现冻结）；分类及以下颗粒度不导出，与工资条联动不在场</td>
            <td>随账户结算更新</td>
            <td>薪酬侧</td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>Agent 知识面的完整组成：</strong>上表五个数据实体 + 岗位底账（7.2–7.4，107 项逐项标注形式与应答深度）
        + 应答规则（四层口径与兜底句）。<strong>不在知识面里的</strong>：员工与 Agent 的对话历史、任何他人数据、
        内部名称与策略模板名、社保公积金个税的解释口径。
      </div>

      <div id="sa-scope-repo" class="subsection">
        <h3>政策资料仓库：要的不是静态文件，是可维护的功能</h3>
        <p class="doc-p">
          政策类回答不能只靠参数命中值——「住宿获豆怎么算」「客次提成的规则是什么」这类问题，
          需要政策说明文案辅助解读。所以支撑侧明确一个实体：<strong>政策资料仓库</strong>，并且它是带维护功能的：
        </p>
        <table class="data-table">
          <thead>
            <tr><th style="width: 150px;">要点</th><th>口径</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>存什么</strong></td><td>各薪酬项的政策说明与规则文案，按显示名薪酬项挂载；一类一档（如「住宿获豆政策」「计件客次收入规则」）</td></tr>
            <tr><td><strong>维护功能</strong></td><td>提供维护更新功能：新增 / 更新 / 停用——政策变了改仓库，不是改代码、不是重训模型；仓库内容与发布由薪酬侧负责，维护界面由研发实现</td></tr>
            <tr><td><strong>生效方式</strong></td><td>维护更新即重新进入知识面；历史版本留痕——应答里的「命中依据」引用当前生效版本</td></tr>
            <tr><td><strong>裁剪关同样适用</strong></td><td>敏感段落（常乐豆相关操作说明、内部账务口径）在维护侧就不进仓库——围墙第二道「不在场」对政策资料同样生效，政策解读只解读员工应知部分</td></tr>
          </tbody>
        </table>
        <div class="note">
          <strong>为什么强调可维护：</strong>薪酬策略与政策会持续演进（模板切换、单价调整、新激励上线），
          若政策文案是一次性喂入的静态资料，每次演进都要研发重新处理——维护功能把「政策更新」从研发动作
          变成薪酬侧的日常动作，这也是 Agent 能长期答对政策类问题的前提。
        </div>
      </div>
    </div>

    <div id="sa-61-facts" class="section">
      <div class="section-header">
        <h2>业务事实与标准值：按岗位罗列</h2>
        <DocCopyButton section-id="sa-61-facts" />
      </div>
      <p class="doc-p">
        求证链靠两样东西拼起来：<strong>本人发生了什么</strong>（业务事实——随业务系统产生、只取本人名下）
        与<strong>规则怎么说</strong>（标准与单价——来自政策参数命中值）。只说「订单」远远不够，
        下面两张表按岗位把数据罗列全，研发照此清单确认接入。
      </p>
      <h3 class="fact-h">表 A · 业务事实（本人发生）</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 170px;">数据</th>
            <th style="width: 105px;">推拿师·全职</th>
            <th style="width: 105px;">客户经理·全职</th>
            <th style="width: 105px;">推拿师·非全</th>
            <th>求证用途</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>排班与班次记录</strong></td><td class="yes">取</td><td class="yes">取</td><td class="yes">取（接单时段）</td><td>出勤、顶班、时段类还原</td></tr>
          <tr><td><strong>请假记录</strong></td><td class="yes">取</td><td class="yes">取</td><td class="yes">取</td><td>缺勤 / 扣款类核对</td></tr>
          <tr><td><strong>出勤打卡</strong></td><td class="yes">取</td><td class="yes">取</td><td class="yes">取</td><td>工时与加班核算</td></tr>
          <tr><td><strong>订单与实付金额</strong></td><td class="yes">取</td><td class="yes">取</td><td class="yes">取</td><td>计件 / 提成还原的主事实</td></tr>
          <tr><td><strong>评价 · 新客 · 回头客记录</strong></td><td class="yes">取</td><td class="no">—</td><td class="yes">取</td><td>激励类还原（围绕订单产生）</td></tr>
          <tr><td><strong>门店任务完成记录</strong></td><td class="no">—</td><td class="yes">取</td><td class="no">—</td><td>任务激励核对</td></tr>
          <tr><td><strong>房间卫生打扫记录</strong></td><td class="yes">取</td><td class="yes">取</td><td class="yes">取</td><td>房间卫生打扫激励 / 未打扫扣款（推拿师为豆侧 L3、客经为现金 L2）</td></tr>
          <tr><td><strong>卫生间打扫记录</strong></td><td class="yes">取</td><td class="yes">取</td><td class="no">—</td><td>卫生间打扫激励 / 未打扫扣款（同上，按岗位走现金或豆）</td></tr>
          <tr><td><strong>离店卫生记录</strong></td><td class="yes">取</td><td class="no">—</td><td class="yes">取</td><td>离店卫生未打扫扣款（推拿师豆侧、非全现金，底账 7.3 / 7.4）</td></tr>
          <tr><td><strong>卫生检查记录</strong></td><td class="yes">取</td><td class="yes">取</td><td class="no">—</td><td>卫生检查激励 / 扣款（客经含打扫申诉扣回，底账 7.2）</td></tr>
          <tr><td><strong>投诉记录</strong></td><td class="yes">取</td><td class="yes">取</td><td class="yes">取</td><td>投诉扣款核对（三岗位均有该项）：只核本人名下有无与金额，<strong>投诉内容与处理判定过程不在场</strong></td></tr>
        </tbody>
      </table>
      <h3 class="fact-h">表 B · 标准与单价（政策命中值，非业务事实）</h3>
      <table class="data-table">
        <thead>
          <tr><th style="width: 190px;">标准 / 单价</th><th style="width: 190px;">适用岗位</th><th>求证链用途</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>保底标准与保底月份</strong></td><td>推拿师（全职 / 非全）</td><td>保底类收入的还原依据</td></tr>
          <tr><td><strong>超产值标准</strong></td><td>推拿师 · 全职</td><td>超产值获豆 / 超产计算的还原依据</td></tr>
          <tr><td><strong>评价单价</strong></td><td>推拿师</td><td>评价激励的还原依据</td></tr>
          <tr><td><strong>客次提成单价</strong></td><td>客户经理 · 全职</td><td>计件客次收入的还原依据（L1）</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>两类数据的分工：</strong>表 A 是「发生了多少」（本人业务事实，上一小节表格第四行），表 B 是「按什么规则算」
        （政策参数命中值，上一小节表格第二行）——求证链 STEP 03 取表 A、STEP 04 取表 B，两者拼一起才算得回那个数（6.4）。
        表 A 的接入清单（哪些表、哪些字段）由研发按本节清单与底账 L1 项逐项确认；表 B 挂显示名薪酬项，由薪酬侧配置维护。
        <br /><strong>卫生类的一个连带结论：</strong>房间卫生、卫生间、离店卫生与卫生检查的事实数据在场后，
        卫生类薪酬项<strong>具备升 L1 求证的条件</strong>（6.4 留的升级路径）——是否升层由薪酬侧按 6.3 的判据确认后调整底账标注，Agent 不自行改层。
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
  { id: 'sa-61-estimate', label: '算薪前预估露出' },
  { id: 'sa-61-src', label: '支撑侧数据源清单' },
  { id: 'sa-61-facts', label: '业务事实与标准值' },
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

<style scoped>
.subsection { margin-top: 20px; }
.subsection h3 { font-size: 15px; font-weight: 600; color: #2c2c2a; margin: 0 0 8px; }
.fact-h { font-size: 14px; font-weight: 600; color: #2c2c2a; margin: 22px 0 8px; }
td.yes { color: #3b6d11; font-weight: 600; text-align: center; }
td.no { color: #b0aca3; text-align: center; }
</style>
