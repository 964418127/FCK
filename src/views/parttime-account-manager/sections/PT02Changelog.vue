<template>
  <DocShell
    :toc-items="tocItems"
    title="二、变更日志"
    subtitle="本轮重写只留一条日志；之后同一轮修订就地更新这一条，不追加历史条目"
    version="v1.0"
    date="2026-11-05"
    :breadcrumbs="breadcrumbs"
  >
    <div id="pt-chg" class="section">
      <div class="section-header">
        <h2>变更日志</h2>
        <DocCopyButton section-id="pt-chg" />
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 110px;">日期</th><th style="width: 80px;">版本</th><th>变更</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>2026-11-05</td>
            <td>v1.0</td>
            <td>
              <div class="chg-lead">按公司 PRD 模板重写本模块文档；原先的「考勤打卡」「功能模块与产品需求」两页并入第六章。</div>
              <ol class="chg-list">
                <li><strong>文档结构</strong>：原先分列的两页归并为「一~七」七章，章节元数据单一数据源；业务口径不变，只重排与归并，业务定位、三层对象、六类来源与分支流程图统一收进第五章。</li>
                <li><strong>口径归一</strong>：六类任务来源、生成快照、事件只追加不覆盖、1 门店 = 1 结算主体四条硬约定收进「三、文档说明」与「五、需求范围」，各章只引用不复述。</li>
                <li><strong>功能分章</strong>：原 Web 与移动端混排改为 6.1 配置 → 6.2 定时生成 → 6.3 临时时段 → 6.4 跟踪 → 6.5 移动端承接 → 6.6 移动端打卡 → 6.7 收入 → 6.8 权限与契约。</li>
                <li><strong>收入并入</strong>：单价与保底合并为 6.7 一章，明确「页面只维护标准，不做结算试算」；月度保底比较与月底补差写在同一章。</li>
                <li><strong>待决显式化</strong>：原文中「暂定 / 待确认」的口径统一挂到「七、附录」，写明归属方与卡点，不再散落在正文。</li>
                <li><strong>用词调整</strong>：配置页页签改称<strong>时段需求</strong>，其下分<strong>周期时段</strong>（按星期重复）与<strong>临时时段</strong>（一次性加人）；<strong>班次任务</strong>只指生成后的一条排班时段，<strong>时段需求</strong>指配置侧的规则，两者不再混用。</li>
                <li><strong>补一类来源</strong>：新增<strong>提前下线补人</strong> —— 承接人到店后提前离店，剩余时段扣掉通勤仍够门槛才补，不够就留空档。门槛与兜底人群配在<strong>分配策略的异常补人</strong>里（6.1.3），任务来源由五类变<strong>六类</strong>，临时时段来源由四类变<strong>五类</strong>（6.3.1）。</li>
                <li><strong>补充交叉口径</strong>：写明<strong>同一天只有一条时间轴</strong> —— 在 A 店选了时段，B 店与之交叉的时段不可选；同店重叠同样不行，跨店不重叠但间隔不足 30 分钟也不行（6.5.3）。名词表补「时段交叉」，状态表补一行置灰原因。</li>
                <li><strong>保底改按周</strong>：与业务核对后，收入保底由月改为<strong>周</strong>单位（元 / 周），与「按周结算、各周发放」同一口径；6.7.4 由「月底比较与补差」改为<strong>每周比较与补差</strong>，薪酬看板「保底金额没有维护入口」「按周期给保底与月末补差并存」两个待定点就此关闭（6.7.3、6.7.4、6.7.5）。</li>
                <li><strong>保底改按小时</strong>：与业务再次核对后，收入保底由周改为<strong>时薪</strong>（元 / 小时）；核算链路明确为「<strong>打卡有效工时 × 保底时薪 = 保底金额</strong> → 与当周收入合计比较 → <strong>保底补差 = max(0, 保底金额 − 收入合计)</strong>」，有效工时由打卡侧提供（到店 → 离店，缺卡不计）；薪酬看板与工资通知的「保底金额」薪酬项同步改为「保底补差」，示例表带完整算例（6.7.3、6.7.4、6.7.5、6.7.6）。</li>
                <li><strong>发布支持手动</strong>：6.2 由「定时生成」改为「定时 + 手动」—— 手动发布可<strong>全部门店或多选门店</strong>，批次只能选<strong>未来两周内</strong>的周四批（最近 n+1 周）；该批已发布时按当前需求<strong>覆盖</strong>：已被承接的任务保持原安排，未被承接的名额重新生成（6.2.2）。发布记录加「方式」列。</li>
                <li><strong>临时时段派单范围可选人</strong>：候选仍固定为<strong>与当前门店签约的非全客户经理</strong>，发布弹窗「派单范围」二选一 —— 默认<strong>自动派</strong>（先按资格筛出可被派的人，再按<strong>签约时间先后 · 最早签约优先</strong>取第一位），也可<strong>指定人员</strong>点名承接；点名的人不满足资格不擅自换人，需求留待派发并写明原因，需求人数随选中人数带出（6.3.2、6.3.5）。临时时段列表加「派单范围」列。</li>
                <li><strong>档位改为累计开放</strong>：与业务核对后，分配策略配置多个角色时<strong>前后档的人都可见可接</strong>（最大范围）—— 某档起点一到就长期开着，后面的档到点只加不放，不是「换一档关一档」；发布页「此刻开放档位」改显「已开 N 档」（6.1.3、5.4、6.5.2）。</li>
                <li><strong>有效工时口径收口</strong>：与业务核对后明确 —— <strong>允许提前打卡离店</strong>（提前下线补人机制照常，6.1.3、6.6.6），但<strong>有效工时必须基于打卡计算</strong>：只认打卡到店 → 离店记录，不以排班时间估计、不做其他推算，缺任一打卡的时段不计工时，工时按小时计、<strong>保留 1 位小数</strong>；打卡侧只提供工时事实，比较与补差在薪酬侧按结算周完成（6.7.4）。</li>
                <li><strong>6.7 章更名</strong>：菜单与章名由「收入配置与薪酬看板」改为「<strong>薪酬计算与看板</strong>」—— 本章不只配单价，还覆盖保底时薪、每周核算、薪酬看板与工资通知；章首补一条「收入在哪完整描述」的分布指引（6.7）。</li>
                <li><strong>移动端两章更名</strong>：6.5「移动端任务列表」改「<strong>任务承接</strong>」、6.6「移动端打卡」改「<strong>到店打卡</strong>」—— 菜单直接说员工做什么，端信息保留在章名括号与副标题里（6.5、6.6）。</li>
                <li><strong>补人通勤固定</strong>：异常补人的通勤时间<strong>不做配置项，固定 30 分钟</strong>；补人门槛仍可配（默认 2 小时），合起来即<strong>剩余 ≥ 2 小时 30 分</strong>才补，与业务口径一致（6.1.3）。</li>
                <li><strong>薪酬项扩充</strong>：按周示例新增<strong>接待激励</strong>（按接待次数计，示例 1 元 / 次，待业务确认）与<strong>津贴</strong>（按周固定 50 元），两者<strong>不计入保底比较</strong>、只进合计；扣费项新增<strong>投诉扣款</strong>（50 元 / 次）与<strong>卫生打扫扣款</strong>（20 元 / 次）；「扣缴」明确为<strong>个税预扣 / 代扣</strong>；三项卫生费在薪酬项、工资单与看板里<strong>分列</strong>、不再合并成「卫生类」。薪酬项列示顺序统一为：客次、新客、评价、接待激励、三项卫生、津贴、保底补差，扣费项为投诉、卫生打扫扣款、个税。四周算例、薪酬项表、移动端看板与工资确认单据此更新（6.7.5、6.7.6）。</li>
                <li><strong>到店打卡提前量改为 1 小时</strong>：复核后确认<strong>任务开始前 1 小时</strong>即可到店打卡（原为 30 分钟）；早于 1 小时仍不可打卡、提示「请在任务开始前 1 小时内再试」，等待卡片不露倒计时（6.6.4）。</li>
                <li><strong>有效工时计取口径补全</strong>：打卡时间不直接等于计费时间，<strong>两端各夹回班次边界</strong> —— 到店时刻取「打卡到店 vs 计划开始」<strong>较晚者</strong>（提前打卡的那段不计，从任务正常开始时间起算）；离店时刻取「打卡离店 vs 计划结束」<strong>较早者</strong>（等于或晚于计划结束打卡都按计划结束计、晚走不加班计，提前离店按实际打卡时间计）。名词表「有效工时」同步（6.7.4）。</li>
                <li><strong>定时发布改 06:00，并写清「一批」的口径</strong>：与业务核对后，定时发布由每周四 <strong>10:00 提前到 06:00</strong> —— 结果不变（按需求展开、幂等），只是<strong>公布得更早</strong>，承接人早上一睁眼就能看到本批任务；同时更正原先「未来 7 天」的模糊说法：每次执行只出<strong>下一批（n+1，下周六至下下周五）</strong>，<strong>不是从今天起往后 7 天</strong>，当周（n）由上一周的定时任务产生。首次上线没有「上一周」，因此<strong>上线当周要补一次当周（n）的排班</strong>（一次性、不设常驻入口，已过去的天数不生成），补完即进入正常节奏。「发布即可见」档的起点随之提前到 06:00，手动发布仍以点确认那一刻为发布时刻（6.2.1、6.2.2、6.2.3，5.4 分支图同步）。</li>
                <li><strong>转发补上接受 / 拒绝</strong>：原先一提交就把任务甩到对方名下，等于替别人答应。改为<strong>发起 → 待接受 → 接受 / 拒绝</strong>：发起后任务<strong>仍在自己名下</strong>，对方 30 分钟内不表态视为拒绝并自动退回；拒绝过的人不再出现在可转名单里；发起人可随时撤回，取消任务时未接受的转发一并收回。结果（接受 / 拒绝 / 超时）都通知发起人。自己选中的任务仍<strong>不设待接受</strong> —— 选择即承诺；<strong>系统派单（临时时段 / 请假接班 / 提前下线补人 / 取消后重派）也拍板不设接受环节，只发通知、直接「待到店」</strong>，接受 / 拒绝只属于同事之间的转发（6.5.2、6.5.4、6.5.5、6.5.6、6.3.2）。</li>
                <li><strong>补打卡提醒</strong>：任务开始前<strong>1 小时 / 30 分钟 / 5 分钟</strong>各推一次，共 3 次，定死不配 —— 第一次正好是打卡窗口开放的时刻，后两次催办。只提醒待到店且未到店的任务；同一条任务积压多个时点只补最近一次；通知点开直达打卡页；任务卡上只写相对时间，不写具体时:分（6.6.10）。</li>
              </ol>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="note">
        <strong>读法：</strong>本轮只记这一次重写。之后同轮预研的修订<strong>就地更新本条</strong>，不追加「v1.1 改了什么」这类流水 ——
        需要知道某条规则怎么来的，看正文里的「为什么这么定」，那比版本日志有用。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'pt-chg', label: '二、变更日志' }
]
</script>

<style scoped src="./doc-base.css"></style>

<style scoped>
.chg-lead { font-size: 13px; line-height: 1.75; color: hsl(var(--foreground) / 0.78); margin-bottom: 8px; }
.chg-list { margin: 0; padding: 0; list-style: none; counter-reset: chg; }
.chg-list > li {
  counter-increment: chg; position: relative; padding-left: 24px;
  font-size: 13px; line-height: 1.8; color: hsl(var(--foreground) / 0.88);
}
.chg-list > li + li { margin-top: 7px; }
.chg-list > li::before {
  content: counter(chg) "、"; position: absolute; left: 0; top: 0;
  color: hsl(var(--primary)); font-weight: 600; font-variant-numeric: tabular-nums;
}
.chg-list > li strong { font-weight: 600; color: hsl(var(--foreground)); }
</style>
