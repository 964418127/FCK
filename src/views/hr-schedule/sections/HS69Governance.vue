<template>
  <DocShell
    :toc-items="tocItems"
    title="6.9 权限与数据契约（支持非全合作）"
    subtitle="非全与全职的权限对照、旧排班兜底逻辑的停用边界、四类角色的可见与可改范围；十一个对象的必备字段与三条硬约束"
    version="v5.4"
    date="2026-11-19"
    :breadcrumbs="breadcrumbs"
  >
    <div id="hs-69-overview" class="section">
      <div class="section-header">
        <h2>6.9 权限与数据契约（支持非全合作）</h2>
        <DocCopyButton section-id="hs-69" />
      </div>
      <div class="note lead-note">
        <strong>一句话定位：</strong>人事中心支持非全合作落到「谁能碰、字段怎么存」——这一章讲权限边界与数据契约；不对应单独页面，但验收与联调以这里为准。
      </div>
      <div class="note src-note">
        <strong>来源：</strong>本章内容并入自《非全客户经理 · 产品需求说明》6.8 权限与数据契约，原文见
        <router-link to="/docs/parttime-account-manager/6-8">/docs/parttime-account-manager/6-8</router-link>。
      </div>
      <div class="note">
        业务怎么跑见 6.1–6.8（排班 / 打卡 / 薪酬）；任务生成、承接与派发的业务口径见《非全客户经理 · 产品需求说明》。
      </div>
    </div>

    <div id="hs-69-perms" class="section">
      <div class="section-header">
        <h3>6.9.1 非全客户经理权限（与全职对照）</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 190px;">权限项</th><th style="width: 190px;">非全客户经理</th><th style="width: 200px;">全职（培训期）</th><th>全职（转正后）</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>班次任务查看 / 接单</strong></td><td>可（接单限排班日，《非全客户经理》6.1.4）</td><td>不可</td><td>不可（走原排班系统）</td></tr>
          <tr><td><strong>打卡</strong></td><td>可（后台记录）</td><td>可（仅培训打卡）</td><td>可（正常打卡）</td></tr>
          <tr><td><strong>薪酬查看</strong></td><td>可</td><td>可（培训补贴）</td><td>可</td></tr>
          <tr><td><strong>盘点任务</strong></td><td>不可</td><td>不可</td><td>可</td></tr>
          <tr><td><strong>周度推送任务</strong></td><td>不可</td><td>不可</td><td>可</td></tr>
          <tr><td><strong>排班管理</strong></td><td>不可</td><td>不可</td><td>可</td></tr>
          <tr><td><strong>送券权限</strong></td><td>可</td><td>不可</td><td>可（按全职规则）</td></tr>
          <tr><td><strong>客次 / 新客 / 评价平均分配</strong></td><td>不可</td><td>不可</td><td>可</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>两条要分清：</strong>「顶班」就是客户经理的排班时段，来源见《非全客户经理》6.2 / 6.3 / 6.1.3，只有非全有承接端；
        提前下线补人是唯一例外，系统直接写进本店全职推拿师名下，<strong>不开接单入口</strong>。
        「客次 / 新客 / 评价平均分配」是<strong>客户归属</strong>（算业绩），与 6.8 的<strong>计价项目</strong>（算钱）不是一回事。
        <br />
        <strong>接单方式：</strong>周期班次走可选池<strong>自助接单</strong>（《非全客户经理》6.5），临时时段走<strong>派单</strong>（6.3.2），两种来源各走各的。
      </div>
    </div>

    <div id="hs-69-legacy" class="section">
      <div class="section-header">
        <h3>6.9.2 旧排班兜底逻辑的停用</h3>
      </div>
      <p class="doc-p">
        原系统写死一条兜底：<strong>配置 1 人的门店，全职客户经理没排 10:00–12:00，就把该班次派给门店全职推拿师。</strong>本方案支持时段级策略后，这条<strong>停用</strong>。
      </p>
      <table class="data-table">
        <thead>
          <tr><th style="width: 170px;">项目</th><th>结论</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>停用范围</strong></td><td>只停这条<strong>自动兜底派单</strong>；全职排班、请假、考勤、结算不受影响</td></tr>
          <tr><td><strong>替代方式</strong></td><td>在对应时段需求上配策略：先给谁、几点放开下一档（《非全客户经理》6.1.3）</td></tr>
          <tr><td><strong>不配会怎样</strong></td><td>按内置默认策略；门店没签非全客户经理时该时段<strong>对谁都不开放</strong>，系统不退回旧逻辑</td></tr>
          <tr><td><strong>上线要求</strong></td><td>逐店过一遍高缺岗时段（尤其 10:00–12:00），策略配到位，进上线检查表</td></tr>
        </tbody>
      </table>
      <div class="note">
        <strong>系统不判定「低客次门店」</strong>：不设客次档位、不打分，只提供「门店 × 时段」这个槽位，配什么由业务定。
        推拿师的承接资格、工时上限、考核口径<strong>不在本模块定义</strong>。
      </div>
    </div>

    <div id="hs-69-role" class="section">
      <div class="section-header">
        <h3>6.9.3 本模块角色矩阵</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 140px;">角色</th><th style="width: 190px;">可见范围</th><th style="width: 220px;">可执行动作</th><th>明确不可见 / 不可改</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>非全客户经理</strong></td>
            <td>本人可选任务与任务</td>
            <td>选择、取消、转移、到店、离店</td>
            <td>违规统计、强制派单、候选人员、内部来源、他人承接信息</td>
          </tr>
          <tr>
            <td><strong>运营 / 门店管理</strong></td>
            <td>授权城市与门店</td>
            <td>配置需求、查看发布、<strong>手动发布</strong>、处理临时时段派单、查看日志</td>
            <td>不能覆盖历史事件与已完成打卡；不能收回已承接的任务</td>
          </tr>
          <tr>
            <td><strong>管理人员</strong></td>
            <td>全量任务与配置</td>
            <td>查看、按权限维护收入标准、处理异常</td>
            <td>不能改写承接关系；不能改已结算引用的配置版本</td>
          </tr>
          <tr>
            <td><strong>系统调度</strong></td>
            <td>有效需求与任务事件</td>
            <td>定时生成、名额占用、取消重派、请假拆段</td>
            <td>不作为用户身份出现在移动端；匹配失败不硬塞</td>
          </tr>
        </tbody>
      </table>
      <div class="note warn-note">
        <strong>一条原则：</strong>越靠近事实越只读 —— 打卡事件、事件日志、已结算配置版本任何角色都不改；能改的只有「还没发生」的东西。
      </div>
    </div>

    <div id="hs-69-contract" class="section">
      <div class="section-header">
        <h3>6.9.4 数据契约</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 150px;">对象</th><th style="width: 310px;">必备字段</th><th>约束</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>分配策略</strong></td>
            <td>策略 ID、名称、说明、档位（人群 + 开放起点）、异常补人（开关 / 门槛 / 通勤 / 兜底人群）、是否内置、状态</td>
            <td>定时档必须早于引用它的时段开始；门槛 + 通勤不得超 4 小时；被引用与内置策略不可删</td>
          </tr>
          <tr>
            <td><strong>周期时段</strong></td>
            <td>城市、门店、星期、起止时间、名额、生效 / 结束日期、状态、备注</td>
            <td>作废保留历史；生成时快照；同店同星期不重叠</td>
          </tr>
          <tr>
            <td><strong>任务实例</strong></td>
            <td>任务 ID、批次 ID、日期、门店、时段、来源（六类）、状态、当前承接人、原任务 ID</td>
            <td>来源创建后不变；时段与名额取自快照；补人剩余段能回溯原任务</td>
          </tr>
          <tr>
            <td><strong>承接关系</strong></td>
            <td>原任务 ID、人员 ID、关系类型、建立 / 结束时间</td>
            <td>取消、转移、重派<strong>均保留原关系</strong>，不物理删除</td>
          </tr>
          <tr>
            <td><strong>临时时段</strong></td>
            <td>需求 ID、来源、门店、日期、时段、派单范围、需求人数、已派人数、状态、失败原因、原任务 ID</td>
            <td>一个缺口一条；部分派发只更新已派人数；名单只存本店签约非全</td>
          </tr>
          <tr>
            <td><strong>任务事件</strong></td>
            <td>类型、发生时间、角色、操作人、详情、关联任务 ID</td>
            <td><strong>只追加不覆盖</strong>；能按时间还原生命周期</td>
          </tr>
          <tr>
            <td><strong>打卡事件</strong></td>
            <td>任务 ID、人员 ID、门店、类型（到店 / 离店）、实际时间</td>
            <td>到店后才能离店；供跟踪与结算读取</td>
          </tr>
          <tr>
            <td><strong>发布批次</strong></td>
            <td>批次 ID、执行时间、<strong>方式</strong>、目标周期、门店范围、读取 / 成功 / 跳过 / 失败数</td>
            <td>定时同周期不产生第二个有效批次；手动是覆盖、就地更新；已承接不被覆盖</td>
          </tr>
          <tr>
            <td><strong>单价配置版本</strong></td>
            <td>配置 ID、层级、城市 / 门店 / 人员 ID、三项覆盖标记与金额、状态、时间戳、操作人</td>
            <td>未覆盖项<strong>不存本级金额</strong>；0 有效；人员以「人员 ID + 门店 ID」唯一</td>
          </tr>
          <tr>
            <td><strong>保底配置版本</strong></td>
            <td>配置 ID、层级、城市 / 门店 ID、<strong>时薪（元 / 小时）</strong>、状态、时间戳、操作人</td>
            <td>通用 / 城市为基准、门店为差异额；<strong>一律按时薪</strong>不存整周金额；同归属唯一有效</td>
          </tr>
          <tr>
            <td><strong>收入读取快照</strong></td>
            <td>人员 ID、门店 ID、周期、项目、解析金额、来源层级、配置版本 ID</td>
            <td>结算后固定，后续配置变更<strong>不得反写</strong>历史</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div id="hs-69-hard" class="section">
      <div class="section-header">
        <h3>6.9.5 三条硬约束，验收时逐条对</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr><th style="width: 160px;">约束</th><th style="width: 250px;">表现</th><th>怎么验</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>快照</strong></td><td>已生成任务的时段、名额、门店不随需求变</td><td>改需求 → 查已生成任务字段</td></tr>
          <tr><td><strong>只追加不覆盖</strong></td><td>取消 / 转移 / 重派后原任务与原关系仍在，日志连续</td><td>取消一条 → 应为已取消 + 新增事件，而不是消失</td></tr>
          <tr><td><strong>1 门店 = 1 结算主体</strong></td><td>同一人两店的提成与保底分别归集，不合并比较</td><td>构造一人两店数据 → 补差按店各算一次</td></tr>
        </tbody>
      </table>
      <div class="note">
        这三条不成立，其余功能点全绿也不算通过 —— 错的是数据底座。
      </div>
    </div>
  </DocShell>
</template>

<script setup>
import DocShell from '../../../docs/components/DocShell.vue'
import DocCopyButton from '../../../docs/components/DocCopyButton.vue'

const tocItems = [
  { id: 'hs-69-overview', label: '6.9 权限与数据契约' },
  { id: 'hs-69-perms', label: '6.9.1 权限对照' },
  { id: 'hs-69-legacy', label: '6.9.2 旧逻辑停用' },
  { id: 'hs-69-role', label: '6.9.3 角色矩阵' },
  { id: 'hs-69-contract', label: '6.9.4 数据契约' },
  { id: 'hs-69-hard', label: '6.9.5 三条硬约束' }
]

const breadcrumbs = [
  { label: '文档中心', to: '/docs' },
  { label: '人事中心', to: '/docs/hr-schedule' },
  { label: '六、功能详细说明', to: '/docs/hr-schedule/features' },
  { label: '6.9 权限与数据契约（支持非全合作）' }
]
</script>

<style scoped src="./doc-base.css"></style>
